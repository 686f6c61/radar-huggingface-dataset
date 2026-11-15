# SkyExploreWT/Qwen3.5-4B-heretic

## Resumen
Qwen3.5-4B-heretic es una variante "decensored" (abliterated) del modelo Qwen3.5-4B desarrollado originalmente por el equipo Qwen de Alibaba. La modificacion la firma el usuario SkyExploreWT y se ha realizado con la herramienta Heretic v2.1.0, que aplica una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 8 a 24 del transformer para reducir la tasa de rechazos del modelo ante peticiones que el modelo original rechazaria.

El modelo base es un transformer causal multimodal (texto e imagen) de 4B parametros con una arquitectura hibrida que combina capas Gated DeltaNet (atencion lineal) con capas de atencion completa y una red de mezcla de expertos dispersa (MoE). Dispone de una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y cubre 201 idiomas y dialectos segun la documentacion del modelo original.

La relevancia de esta ficha radica en que cuantifica el efecto real de la ablacion: el modelo pasa de 99/100 rechazos en el original a 8/100 en esta version, con una divergencia KL de 0,6391 respecto al modelo base. Es un dato util para quien evalue el coste de calidad que supone eliminar los mecanismos de rechazo en un modelo pequeno de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: Gated DeltaNet (atencion lineal) + Gated Attention + FFN, con encoder de vision y MoE dispersa |
| Parametros totales | 4.539.265.536 (4B nominales) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors sin cuantizar) |
| Idiomas soportados | 201 idiomas y dialectos (segun model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang y KTransformers |
| Dimension oculta | 2560 |
| Numero de capas | 32 (layout 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN))) |
| Cabezas de atencion lineal | 32 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion completa | 16 para Q, 4 para KV; dimension de cabeza 256 |
| Dimension intermedia FFN | 9216 |
| Vocabulario | 248.320 tokens (con padding, atado a la salida) |
| Tamano del repo | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-4B emplea una arquitectura hibrida poco convencional: de las 32 capas, el patron se repite en bloques de cuatro, con tres capas de Gated DeltaNet (una forma de atencion lineal con compuertas) seguidas de una capa de atencion completa con RoPE de dimension 64. Esta combinacion busca alto rendimiento en inferencia con menor coste computacional en contextos largos, ya que la atencion lineal evita el crecimiento cuadratico del coste con la longitud de secuencia. El modelo incorpora ademas un encoder de vision con fusion temprana de tokens multimodales y se entrena con prediccion multi-token (MTP) en varios pasos.

El entrenamiento del modelo original incluye preentrenamiento y postentrenamiento con RL a gran escala en entornos multiagente, segun la documentacion de Qwen. La variante heretic no reentrena el modelo: aplica una ablacion de rango arbitrario sobre las capas 8 a 24 con los parametros `preserve_good_behavior_weight=0.5164`, `steer_bad_behavior_weight=0.7119`, `overcorrect_relative_weight=0.3534` y `neighbor_count=11`. El proceso es reproducible y el autor publica el directorio `reproduce` con los pasos para regenerar los pesos.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- Razonamiento, matematicas y generacion de codigo, heredados del modelo base Qwen3.5-4B.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`), con encoder de vision integrado.
- Capacidades multilingues amplias: 201 idiomas y dialectos declarados en el modelo base.
- Soporte de tool calling y function calling segun la documentacion del modelo base (compatible con vLLM, SGLang y KTransformers).
- Capacidad de agentes y razonamiento multi-paso, reforzada en el entrenamiento del modelo original con RL en entornos multiagente.
- Modo "decensored": reduce drasticamente los rechazos ante peticiones que el modelo original declinaria (8/100 frentes a 99/100).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en los tags).

## Casos de uso
- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a sus 262.144 tokens de contexto, lo que permite incluir manuales de producto o historiales completos de tickets en el prompt sin truncar.
- Procesamiento de documentos largos con imagenes: al ser multimodal, puede extraer informacion de facturas, capturas o diagramas y responder preguntas sobre ellos en un mismo flujo, util para back-office financiero o legal.
- Generacion de codigo en pipelines de CI/CD: su soporte de tool calling y su tamano de 4B permiten desplegarlo en infraestructura modesta para autocompletar, revisar diffs o generar tests dentro de un flujo automatizado.
- Investigacion sobre alineacion y seguridad: la ficha de ablacion y la reproducibilidad del proceso lo convierten en un sujeto de estudio controlado para medir el efecto de eliminar rechazos sobre la calidad (KL de 0,6391) y sobre sesgos.
- Asistente de analisis de imagenes tecnicas: con el encoder de vision puede describir diagramas de arquitectura, esquemas electricos o graficos y responder preguntas tecnicas sobre ellos en entornos de documentacion interna.
- Generacion de contenido creativo sin filtros: para escritura de ficcion, guiones o roleplay donde el modelo original rechazaria escenas violentas o adultas; util en estudios de narrativa que necesitan explorar temas sensibles sin bloqueos.
- Traduccion y localizacion multilingue: con 201 idiomas declarados, puede usarse en pipelines de localizacion de contenido hacia mercados con idiomas minoritarios, siempre que se valide la calidad por idioma.

## Benchmarks y rendimiento

La model card del autor solo publica dos metricas comparativas frente al modelo original:

| Metrica | Qwen3.5-4B-heretic | Qwen3.5-4B original |
|---|---|---|
| Rechazos (sobre 100) | 8/100 | 99/100 |
| Divergencia KL | 0,6391 | 0 (por definicion) |

La model card del modelo base incluye una tabla de benchmarks de lenguaje (MMLU-Pro y otros) que compara Qwen3.5-4B con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B. Los datos de esa tabla corresponden al modelo original, no a esta variante ablacionada, y la informacion proporcionada solo incluye el primer valor (MMLU-Pro de GPT-OSS-120B: 80,8). No se han publicado resultados de benchmarks completos para esta variante heretic en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 9,1 GB solo para pesos, mas overhead de KV cache; en la practica se recomienda reservar 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits: en torno a 2,5-3 GB. No se distribuyen GGUF oficiales en el repo, por lo que habria que generarlos con llama.cpp o similar.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues con contexto largo (262.000 tokens) y alto throughput; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y en tarjetas de 12 GB si se cuantiza a 8 bits. En 8 GB solo con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (libreria nativa del repo), vLLM, SGLang y KTransformers segun la model card del modelo base. Para cuantizacion, llama.cpp u Ollama tras convertir los pesos.
- Latencia y throughput: no disponible en la informacion proporcionada. La arquitectura hibrida con Gated DeltaNet esta disenada para reducir el coste en contextos largos, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-heretic | 4B | 262.144 (ext. 1.010.000) | Apache 2.0 | Variante ablacionada, 8/100 rechazos, multimodal |
| Qwen3.5-4B (original) | 4B | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo base sin ablacion, 99/100 rechazos, multimodal |
| Qwen3.5-9B | 9B | no disponible en la informacion | Apache 2.0 (presumible, no confirmado) | Version superior de la misma familia, incluida en la tabla de benchmarks del modelo base |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible en la informacion | Apache 2.0 (presumible, no confirmado) | Alternativa mayor de la generacion anterior, incluida en la tabla comparativa del modelo base |

No se dispone de datos de rendimiento de benchmarks completos para esta variante heretic que permitan una comparacion cuantitativa con las alternativas; la unica comparacion publicada es la de rechazos y divergencia KL frente al modelo original.

## Limitaciones y advertencias
- La ablacion elimina gran parte de los mecanismos de rechazo, lo que implica un mayor riesgo de generar contenido danino, sesgado o inapropiado en produccion. No se recomienda su uso en aplicaciones de cara al publico sin filtros adicionales.
- La divergencia KL de 0,6391 respecto al modelo original indica una desviacion no trivial en la distribucion de salida; puede degradar tareas que dependian de los comportamientos eliminados, aunque no se publican benchmarks que lo cuantifiquen.
- Riesgo de alucinacion: inherente a los modelos de 4B, especialmente en contextos largos y en tareas de conocimiento factual; la ablacion no lo corrige.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al heredar el entrenamiento del modelo base, arrastra los sesgos de este.
- Limitaciones de idioma: aunque el modelo base declara 201 idiomas, no se ha verificado la calidad de esta variante ablacionada en idiomas distintos del ingles y el chino.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo tras la ablacion; conviene auditar el modelo antes de desplegarlo en produccion.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de uso en produccion.
- La fecha de creacion del repo (2026-11-15) es posterior a la fecha de referencia habitual de los modelos Qwen3.5; conviene verificar la procedencia y la integridad de los pesos antes de usarlos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SkyExploreWT/Qwen3.5-4B-heretic
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
