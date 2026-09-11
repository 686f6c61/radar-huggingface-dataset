# leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32

## Resumen

leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32 es una derivada cuantizada del checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored, un modelo multimodal (image-text-to-text) de arquitectura Qwen4Exp con 180.949.088.918 parámetros totales y una ventana de contexto nativa de 262.144 tokens compartidos entre entrada, razonamiento y respuesta final. La cuantización aplica AWQ W4A16 asimétrica con group size 32 únicamente a las proyecciones de los expertos enrutados (gate_proj, up_proj y down_proj) en 48 capas y 512 expertos por capa; el resto de parámetros mantiene la precisión del checkpoint de origen, con un injerto explícito de pesos PLE en FP8 oficial.

El repositorio ocupa 143,4 GB y el autor indica 138,13 GB (128,65 GiB) repartidos en 44 shards: 10 de pesos AWQ, 33 de PLE y uno de escalas K/V. Además de la cuantización de pesos, se recalibraron 24 escalas escalares FP32 para el almacenamiento K/V en FP8 E4M3 sobre las 12 capas QSA, con valores entre 0,0170375295 y 0,0819614977. La calibración AWQ usó 684 registros y la de K/V se ejecutó sobre 14 shards de entrada, 4.904 prompts y 4.888.771 tokens procesados.

Su relevancia práctica es doble: por un lado reduce el coste de servir un MoE multimodal de ~181 B en clústeres de 4 GPU, y por otro sirve como caso de estudio de empaquetado de cuantizaciones no estándar (AWQ por experto, PLE FP8 y escalas K/V indexadas) que la mayoría de runtimes genéricos no soportan sin modificaciones. El autor advierte explícitamente de que el soporte AWQ genérico es insuficiente para esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4Exp: transformer multimodal con mezcla de expertos (MoE), expertos enrutados y soporte MRoPE; incluye capas QSA con escalas K/V y pesos PLE |
| Parametros totales | 180.949.088.918 (~180,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos (entrada compartida + razonamiento + respuesta final), sin YaRN |
| Tipos de cuantizacion | AWQ W4A16 asimetrica con group size 32, zero point y layout GEMM (solo expertos enrutados); pesos PLE en FP8 oficial; escalas KV QSA en FP8 E4M3; computo en FP16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other`, con `license_link: LICENSE`) |
| Formato de pesos | safetensors (44 shards) |
| Tamano del repositorio | 143,4 GB (138,13 GB / 128,65 GiB en pesos segun el autor) |
| Shards | 10 de pesos AWQ, 33 de PLE y 1 de escalas K/V |
| Tensores indexados | 222.771, incluidos 24 escalas K/V escalares en FP32 |
| Descargas / likes | 115 / 0 |
| Fecha de creacion / actualizacion | 2026-09-09 / 2026-09-10 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos de la familia Qwen4Exp. Los datos publicados por el cuantizador describen 48 capas con 512 expertos por capa y un esquema de enrutamiento cuyos pesos se cuantizan por experto de forma independiente. El grupo de cuantización g32 se eligió porque los expertos enrutados tienen ancho 640: bajo tensor parallelism 4, `640 / 4 = 160`, divisible por 32 pero no por 128, de modo que g128 habría sido incompatible con esa configuración. El modelo incorpora además pesos PLE (ngram) que se reutilizan tal cual del checkpoint FP8 oficial, capas QSA con escalas de almacenamiento K/V, soporte MRoPE para multimodalidad y una inicialización de poda de tokens de vídeo. La validación se ejecutó con MTP (multi-token prediction) desactivado, lo que indica que la arquitectura lo contempla.

No se dispone de información sobre el entrenamiento del modelo base: no se indican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta esta ficha derivada es el proceso de cuantización: calibración AWQ sobre 684 registros con una receta congelada, y una calibración K/V ejecutada específicamente sobre este checkpoint AWQ (14 shards de entrada, 4.904 prompts, 4.888.771 tokens), con verificación previa del corpus y del tokenizador. Las 24 escalas resultantes son escalas de almacenamiento K/V, no escalas de pesos AWQ ni de PLE. La revisión madre es `8336e613ea508b13c2159bd0f68965d97a606b95` y la revisión FP8 PLE oficial es `bcd9f01ddc9cff2316eb84281bebcd5b058bddce`. El autor incluye `SHA256SUMS`, `MODEL_PROVENANCE.json` y `VALIDATION.json` para trazabilidad, y advierte de que índices con el mismo hash pueden describir el mismo layout sin implicar pesos idénticos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo: se validó recuperación de aguja (needle retrieval) en seis longitudes entre 1K y 128K tokens, con estabilidad en repeticiones exactas a 128K (3/3).
- Razonamiento con modo "thinking": la validación se ejecutó con `xhigh` habilitado en todas las pruebas.
- Capacidades matemáticas: subconjunto de GSM8K en configuración five-shot, con 32/32 aciertos tanto en KV FP16 como en E4M3 calibrado.
- Generación de código: subconjuntos funcionales de HumanEval (5/5) y MBPP sanitizado (5/5).
- Seguimiento de instrucciones: IFEval en modo estricto y laxo, 5/5 en prompts y 12/12 en instrucciones en ambos formatos de KV.
- Visión: 10/10 en peticiones de imagen, incluidas referencias espaciales por color único y frases de dirección equivalentes.
- Vídeo: 8/8 en peticiones de vídeo, incluidas preguntas de seguimiento sobre la respuesta previa del propio modelo, con inicialización de poda de tokens de vídeo.
- Tool calling / function calling: el autor capturó 12 peticiones con propuestas de herramienta, pero no ejecutó las llamadas ni reclama tasa de éxito; el soporte existe a nivel de formato, no está verificado funcionalmente.
- Capacidades multilingües: no disponible.
- Modelo "uncensored": el nombre indica un ajuste orientado a reducir rechazos, pero no hay documentación en la información disponible sobre el alcance real de ese ajuste.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar conversaciones multi-turno que combinen texto, capturas de pantalla o fotografías de producto gracias a su ventana de 262.144 tokens y a su pipeline image-text-to-text, manteniendo el historial completo sin truncar.
- Análisis de vídeo de larga duración: la poda de tokens de vídeo y el contexto nativo permiten resumir o responder preguntas sobre grabaciones extensas, con seguimiento de preguntas encadenadas sobre respuestas anteriores (validado en 8/8 pruebas).
- RAG sobre corpus extensos: la recuperación validada hasta 128K tokens con estabilidad en repeticiones exactas lo hace adecuado para indexar documentación técnica o expedientes completos en el propio contexto, reduciendo la dependencia de un recuperador externo.
- Generación y revisión de código en pipelines de CI/CD: los resultados funcionales de HumanEval y MBPP sugieren uso para generación de parches y tests; la integración como herramienta requiere verificar el soporte de tool calling en el runtime antes de automatizar acciones.
- Tutoría y verificación matemática: el subconjunto GSM8K five-shot y el modo de razonamiento `xhigh` permiten usarlo para resolver problemas paso a paso y auditar la traza de razonamiento en entornos educativos.
- Investigación en seguridad y alineación: al tratarse de una variante "uncensored", resulta útil para estudiar comportamiento respecto a rechazos, evaluar sesgos y ejecutar red teaming controlado en un entorno aislado.
- Despliegue autoalojado con datos sensibles: al poder ejecutarse en infraestructura propia (el autor valida en 4 GPU V100 de 32 GiB con TP4), encaja en escenarios con requisitos de soberanía de datos, siempre que se asuma el coste de un runtime adaptado.
- Agentes multi-paso: el contexto largo y el modo de razonamiento son apropiados para planificación encadenada, pero la ausencia de una métrica de éxito en herramientas obliga a validar el bucle completo en el dominio concreto antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. El autor presenta únicamente comprobaciones de regresión con muestras pequeñas (47 prompts de texto más 50 comprobaciones suplementarias), y advierte explícitamente de que no son puntuaciones de benchmark. Se reproducen a continuación tal cual, comparando KV FP16 frente a E4M3 calibrado:

| Comprobacion de calidad | KV FP16 | KV E4M3 calibrado |
|---|---:|---:|
| GSM8K, subconjunto five-shot | 32/32 | 32/32 |
| HumanEval, subconjunto funcional | 5/5 | 5/5 |
| MBPP sanitizado, subconjunto funcional | 5/5 | 5/5 |
| IFEval estricto, prompts | 5/5 | 5/5 |
| IFEval laxo, prompts | 5/5 | 5/5 |
| IFEval estricto / laxo, instrucciones | 12/12 en ambos | 12/12 en ambos |
| Generación básica (dos secuencias de cuatro peticiones) | 8/8 | 8/8 |
| Recuperación de aguja, seis longitudes de 1K a 128K | 6/6 | 6/6 |
| Recuperación de aguja a 128K, tres posiciones x dos repeticiones | 6/6 | 6/6 |
| Peticiones de imagen | 10/10 | 10/10 |
| Peticiones de vídeo, incluida pregunta de seguimiento propia | 8/8 | 8/8 |
| Total imagen/vídeo | 18/18 | 18/18 |
| Flujo de herramientas | No establecido; 12 peticiones capturadas | No establecido; 12 peticiones capturadas |
| Estabilidad en repetición exacta a 128K | 3/3 | 3/3 |
| Estabilidad en repetición exacta imagen/vídeo | 8/9 | 8/9 |

Configuración declarada: contexto nativo de 262.144 tokens sin YaRN, pensamiento `xhigh`, y todo el contexto restante menos 16 tokens de seguridad para la generación. Los 47 prompts de texto usaron temperatura 1, top-p 0,95 y top-k 20; los suplementos usaron decodificación greedy (temperatura 0, top-p 1, top-k -1). En ambos casos: semilla 0, min-p 0, penalizaciones de presencia y frecuencia 0 y penalización de repetición 1. Solo se puntuaron respuestas finales o llamadas a herramienta emitidas; las propuestas de herramienta se capturaron pero no se ejecutaron. La nota del autor sobre GSM8K aclara que el caso `gsm8k-0012` se considera correcto con respuesta 12 (años completos hasta recuperar la inversión) frente a 13 (primer año con beneficio).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 138 GB, de modo que se necesita un clúster multi-GPU; el autor valida con 4 GPU NVIDIA V100 de 32 GiB (128 GiB agregados) en TP4, con precisión de cómputo FP16 y MTP desactivado. Hay que sumar la memoria de caché KV, que el autor no cuantifica.
- GPU recomendadas: el autor solo documenta V100 de 32 GiB. Para el mismo agregado de memoria, alternativas como 4x A100 40/80 GB, 4x H100 80 GB o 2x H200 resultan razonables por capacidad, aunque no están validadas en la información disponible.
- GPU de consumo: no cabe. Un modelo de ~181 B con pesos en ~138 GB no se puede cargar en RTX 4090, 3090 ni similares, ni siquiera repartido en varias unidades de 24 GB.
- Opciones de despliegue: el cargador debe soportar AWQ W4A16 asimétrico por experto con g32 en layout GEMM, reutilización indexada de shards PLE en FP8 oficial, las 24 escalas K/V QSA a través de `model.safetensors.index.json` y el tratamiento multimodal completo de Qwen4Exp (MRoPE y poda de tokens de vídeo). El autor afirma que el soporte AWQ genérico es insuficiente y que no se implica compatibilidad con runtimes estándar ni configuración de lanzamiento por defecto. No hay confirmación de compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- FP8: en V100, E4M3 se refiere al almacenamiento K/V, no a cómputo de atención en FP8 nativo. Para activar FP8 KV hay que solicitar `fp8_e4m3` explícitamente en un runtime compatible; descargar las escalas no basta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La única comparación documentada es contra el propio linaje del checkpoint:

| Modelo | Parametros | Contexto | Precision / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32 | 180,9 B | 262.144 tokens | AWQ W4A16 g32 en expertos enrutados, PLE FP8, KV E4M3 | qwen-community-1.0 | 115 descargas, 0 likes |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Checkpoint FP8 oficial con PLE (revision `bcd9f01d...`) | no disponible | no disponible | FP8 | no disponible | no disponible |

Las alternativas de la misma categoría (MoE multimodal de ~180 B con contexto de 256K) no están identificadas en la información disponible, por lo que no se puede establecer una comparativa de rendimiento, licencia o disponibilidad frente a terceros.

## Limitaciones y advertencias

- Compatibilidad de runtime: la arquitectura requiere un cargador específico para Qwen4Exp con AWQ por experto, PLE FP8 indexado y escalas K/V QSA. El autor indica que el soporte AWQ genérico no es suficiente y que no se garantiza ninguna configuración de lanzamiento por defecto.
- Procedencia: se recomienda verificar `SHA256SUMS`, `MODEL_PROVENANCE.json` y `VALIDATION.json` antes de usar el checkpoint. El propio autor advierte de que hashes de índice idénticos no prueban pesos idénticos ni procedencia común.
- Fechas anómalas: la model card indica fechas de creación y actualización en septiembre de 2026, posteriores a la fecha de consulta. Conviene contrastar la procedencia antes de cualquier uso en producción.
- Validación limitada: los resultados publicados son comprobaciones de regresión con 47 prompts de texto y 50 comprobaciones suplementarias, no benchmarks completos. No hay puntuaciones verificadas de MMLU, MMLU-Pro, MATH, GPQA ni de benchmarks multimodales estándar.
- Tool calling no verificado: solo se capturaron 12 propuestas de herramienta sin ejecutarlas; no se reclama ninguna tasa de éxito. No se debe asumir que un flujo de agente completo funcionará sin validación propia.
- Naturaleza "uncensored": no hay documentación sobre qué filtros se han reducido ni con qué método. Es esperable una mayor probabilidad de generar contenido dañino, sesgado o no conforme a políticas, lo que exige moderación externa en aplicaciones de cara al público.
- Alucinación: no se han publicado evaluaciones de factualidad (por ejemplo, TruthfulQA o FActScore). El modo de razonamiento extendido no garantiza corrección factual.
- Idiomas: la información no especifica cobertura lingüística; el castellano no está confirmado como idioma soportado.
- Licencia: se declara `qwen-community-1.0` mediante `license: other` y un enlace a `LICENSE` en el repositorio. Los términos concretos de uso comercial, redistribución y obligaciones de atribución no están detallados en la información disponible y deben revisarse en el fichero de licencia antes de cualquier despliegue comercial.
- Coste de despliegue: aproximadamente 138 GB de pesos requieren un clúster multi-GPU, lo que descarta su uso en hardware de consumo y encarece el escalado horizontal.
- Idiomas de la ficha: esta ficha se ha redactado a partir exclusivamente de los metadatos de HuggingFace y de la model card del autor; no se ha podido contrastar con documentación técnica independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Fichero de licencia referenciado en la model card: LICENSE (dentro del repositorio)
- Artefactos de trazabilidad referenciados: MODEL_PROVENANCE.json, VALIDATION.json, SHA256SUMS (dentro del repositorio)
- Paper, blog o repositorio adicionales: no disponible
- Demo o espacio interactivo: no disponible
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente listados de sitios sin relacion con el contenido.
