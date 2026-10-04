# mavis-ai/Gemma4-26B-MoE-Q5T

## Resumen

mavis-ai/Gemma4-26B-MoE-Q5T es un derivado cuantizado del modelo multimodal Gemma 4 26B A4B de Google, publicado por mavis-ai. No es un fine-tune: se trata de una cuantización sin datos (data-free) del checkpoint oficial, sin entrenamiento de ningún tipo ni conjunto de calibración. El objetivo declarado es ejecutarlo localmente en Apple Silicon dentro de R.E.V.I.S., un sistema operativo cognitivo para IA multiagente en Mac.

El modelo parte de una arquitectura MoE multimodal de 30 capas, tamaño oculto 2816, 128 expertos enrutados con 8 activos y una longitud de contexto de 262.144 tokens. La innovación principal es el formato Q5T: los expertos enrutados se almacenan como tensores codificados con trellis de 5 bits (K5) y el resto de pesos lineales en afín de 8 bits (N8), mientras que routers, normas, escalares y torre de visión se conservan en BF16. El paquete incluye además los drafters de decodificación especulativa MTP y DFlash.

La relevancia es doble. Por un lado, explora un esquema de cuantización poco habitual (trellis frente a afín convencional) sobre un MoE multimodal de contexto muy largo. Por otro, arrastra una limitación crítica: los expertos requieren kernels de decodificación trellis propios del motor de R.E.V.I.S., por lo que el modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM, y la versión actual del motor todavía rechaza este build Q5T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal sobre transformer; 30 capas, tamaño oculto 2816, 128 expertos enrutados con 8 activos, torre de visión y proyección multimodal |
| Parametros totales | 10.794.915.406 (recuento reportado por los safetensors del repositorio); el modelo base se denomina 26B A4B |
| Parametros activos | 4B (según la nomenclatura A4B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q5T (expertos enrutados K5 trellis + denso N8 afín de 8 bits, grupo 64); routers, normas, escalares y visión en BF16; caché KV en 8 bits. La familia incluye también Q4T (K4/N6) y Q3T (K3/N6) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google en la model card) |
| Formato de pesos | safetensors (expertos en trellis-coded, resto afín); biblioteca declarada: trellis |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B A4B, un MoE multimodal de 30 capas con tamaño oculto 2816, 128 expertos enrutados de los que se activan 8 por token, y una ventana de contexto de 262.144 tokens. Incluye torre de visión y proyección multimodal, lo que habilita la tarea image-text-to-text. Sobre este checkpoint se aplica una cuantización fija y sin datos: una anchura por clase de módulo, elegida por regla escrita y no por evaluación. No hubo calibración, Hessian rounding, matrices de importancia ni entrenamiento consciente de cuantización.

El formato Q5T combina dos esquemas. Los expertos enrutados se almacenan como códigos trellis en baldosas de 16x16 (5 bits por peso, libro de códigos MCG), con una rotación de Hadamard de 128 puntos y vectores de signo por canal (`suh`, `svh`); la anchura de experto 704 no es múltiplo de 128, por lo que se almacena con relleno hasta 768. El resto de pesos lineales (proyecciones de atención, MLP denso y embeddings de tokens, con la LM head atada a ellos) se cuantizan en afín de 8 bits con grupo 64 mediante `mx.quantize` con redondeo al más cercano. Los routers (`router.proj`, `router.scale`, `router.per_expert_scale`), las normas, los escalares de capa y la torre de visión con su proyección permanecen en BF16, porque la selección top-k de expertos es una decisión discontinua y no se cuantiza.

El paquete se distribuye troceado: un fichero `model-core` de 3,70 GB con denso, atención, embeddings, routers y visión, y seis ficheros `model-experts` de 2,61 GB cada uno. Se incluyen tres drafters en 8 bits: el drafter MTP `Draft-Q8` (0,45 GB) con su `ProposalHead` (0,12 GB) y el drafter por bloques `DFlash-Q8` (0,50 GB), 1,11 GB en total, para decodificación especulativa.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), apoyada en la torre de visión y la proyección multimodal, ambas conservadas en BF16.
- Manejo de contexto largo: hasta 262.144 tokens, adecuado para documentos extensos o historiales de conversación amplios.
- Enrutamiento MoE disperso: 128 expertos con 8 activos por token.
- Decodificación especulativa integrada mediante dos drafters empaquetados (MTP con `ProposalHead` y DFlash por bloques).
- Ejecución orientada a agentes: el modelo está pensado para funcionar dentro de R.E.V.I.S., descrito como sistema cognitivo multiagente local.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede procesar imágenes y texto sin salir del equipo, lo que encaja en escenarios con requisitos de privacidad donde no se admite enviar datos a la nube. Requiere el motor de R.E.V.I.S. por los kernels trellis.
- Análisis de documentos largos: con 262.144 tokens de contexto se pueden ingerir manuales técnicos, expedientes o transcripciones extensas en una sola pasada, sin trocear y recomponer el contexto.
- Comprensión de documentos escaneados: la torre de visión en BF16 permite interpretar capturas, diagramas o páginas escaneadas junto a instrucciones en texto.
- Núcleo de razonamiento en un sistema multiagente: dentro de R.E.V.I.S. puede actuar como modelo principal mientras otros agentes delegan subtareas, aprovechando el contexto largo para mantener el estado compartido.
- Aceleración por decodificación especulativa: los drafters MTP y DFlash-Q8 incluidos permiten proponer tokens y validarlos con el modelo grande, reduciendo el coste por token en inferencia local.
- Investigación en cuantización: el formato K5 trellis con rotación de Hadamard y vectores de signo es un caso de estudio frente a la cuantización afín convencional, útil para comparar fidelidad de pesos en MoE.
- Prototipado de aplicaciones visión-lenguaje en Apple Silicon: sirve para validar flujos image-text-to-text antes de migrar a despliegues en GPU, siempre que se asuma la dependencia del motor propietario.
- Evaluación comparativa de builds Q3T/Q4T/Q5T: al compartir base y receta, permiten medir el compromiso entre tamaño y fidelidad de la distribución de salida.

## Benchmarks y rendimiento

No se han publicado los valores numéricos de los benchmarks en la información disponible. La model card describe la metodología de un experimento de distancia de distribución: divergencia KL de la distribución siguiente-token de cada build frente al modelo en BF16, medida en modo teacher-forced sobre 48 documentos y 18.040 posiciones puntuadas (WikiText-2, documentos técnicos y respuestas del propio modelo), con vocabulario completo y caché KV emulada en 8 bits. También se menciona la tasa de top-1 como proporción de posiciones en las que el token más probable del build coincide con el del modelo completo, pero el texto proporcionado se interrumpe antes de incluir las cifras.

Se indica además que las comparaciones con cuantización afín convencional se añadirán tras una remedición con builds estándar, y que no se reportan datos de velocidad. No se deben asumir cifras concretas de MMLU, HumanEval, GSM8K ni similares: no aparecen en la información disponible.

## Requisitos de hardware

- Tamaño de pesos: 19,36 GB en decimal (18,0 GiB), más 1,11 GB de drafters, según la model card. El repositorio ocupa 20,5 GB.
- Caché KV en tiempo de ejecución: 8 bits, lo que reduce el coste de memoria del contexto largo, aunque con 262.144 tokens de ventana el consumo sigue siendo considerable.
- Plataforma objetivo: Apple Silicon con memoria unificada. Los tags incluyen `apple-silicon` y el modelo está empaquetado para R.E.V.I.S.; no se documentan requisitos para GPU NVIDIA o AMD.
- Memoria recomendada: no disponible de forma explícita. Por el tamaño de pesos, un Mac con 24 GB o 32 GB de memoria unificada sería el mínimo razonable para cargar pesos y drafters con margen para la caché KV.
- GPU compatibles: no disponible. El modelo no ejecuta actualmente en mlx-lm, mlx-vlm, transformers ni vLLM, por lo que no hay una ruta soportada en A100, H100 o RTX 4090.
- Opciones de despliegue: únicamente el motor de inferencia de R.E.V.I.S., que aporta los kernels de decodificación trellis. La versión actual del motor carga los builds Q4T y Q3T y rechaza este Q5T en tiempo de carga.
- Latencia y throughput: no disponibles. La model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros / contexto | Cuantizacion | Licencia | Ejecucion |
|---|---|---|---|---|
| Gemma4-26B-MoE-Q5T (este) | Base 26B A4B / 262.144 tokens | K5 expertos + N8 denso, routers y visión BF16 | apache-2.0 | Solo motor R.E.V.I.S.; aún no soportado por la versión actual |
| Gemma4-26B-MoE-Q4T | Base 26B A4B / 262.144 tokens | K4 expertos + N6 denso | apache-2.0 (misma familia) | Motor R.E.V.I.S. desde v1.3.0 |
| Gemma4-26B-MoE-Q3T | Base 26B A4B / 262.144 tokens | K3 expertos + N6 denso | apache-2.0 (misma familia) | Motor R.E.V.I.S. |
| google/gemma-4-26B-A4B-it (base) | 26B A4B / 262.144 tokens | BF16 | Licencia Gemma 4 de Google | Ecosistema estándar según el autor del modelo base |

No se dispone de comparaciones con otras familias de modelos de tamaño o tarea similares en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad rota con el ecosistema estándar: los expertos en formato trellis requieren un cálculo de decodificación específico y el modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM.
- El propio motor R.E.V.I.S. todavía no soporta este build: carga Q4T y Q3T, pero rechaza el Q5T en tiempo de carga. A fecha de la model card, el modelo no es ejecutable con la herramienta para la que fue creado.
- Cuantización sin calibración: no se usó conjunto de calibración, Hessian rounding, matriz de importancia ni entrenamiento consciente de cuantización, lo que puede degradar la fidelidad en dominios alejados del uso previsto.
- Riesgo de alucinación: inherente a un modelo generativo multimodal; la cuantización puede agravarlo en tareas sensibles a la precisión, aunque no hay mediciones publicadas al respecto en la información disponible.
- Idiomas soportados: no disponibles. No se puede garantizar un rendimiento multilingüe concreto.
- Licencia: la model card declara apache-2.0 y a la vez enlaza la licencia de Gemma 4 de Google. Conviene verificar las condiciones reales de uso comercial antes de desplegar, dado que los derechos del modelo subyacente permanecen en sus autores originales.
- Validación escasa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay señal de uso en producción.
- Formato dependiente de un motor propietario: el decodificador trellis y sus kernels forman parte del motor de R.E.V.I.S., lo que crea dependencia de un proveedor concreto.
- Relleno de tensores: la anchura de experto 704 se almacena rellenada a 768, un detalle a tener en cuenta al auditar el tamaño real de los pesos.
- Cifras de benchmark ausentes: no hay resultados numéricos publicados en la información disponible, así que no se puede comparar la pérdida de calidad frente a BF16 ni frente a cuantización afín.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mavis-ai/Gemma4-26B-MoE-Q5T
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Sitio oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- Actualizaciones en X: https://x.com/mavis_ai_jp
- Licencia enlazada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Referencias arXiv citadas en los tags: arxiv:2602.06036 y arxiv:2607.02770 (sin contexto adicional en la información disponible)
- Los resultados de búsqueda web obtenidos no contienen enlaces relevantes sobre este modelo: apuntan a empresas de ferretería, material fotovoltaico y neumáticos, y a un personaje de ficción, por lo que se descartan.
