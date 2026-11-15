# Grawnch/Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing

## Resumen

Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing es una cuantizacion GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. Se trata de un checkpoint pre-transcodificado en formato TokenWing (plugin `wv-plugin-v1.1`), dividido en dos shards, que empaqueta los pesos del modelo base a 2,26 bits por peso (bpw) para los expertos MoE. El modelo base dispone de 179.551.050.368 parametros totales (aproximadamente 180B) y una arquitectura MoE con 48 capas hibridas que combinan GDN (Gated DeltaNet) y atencion dispersa QSA, con 512 expertos enrutados y top-10 activos por token.

El objetivo de esta publicacion no es ofrecer un modelo nuevo, sino facilitar la inferencia de un modelo de 180B en GPUs de consumo de 12 GB a 24 GB de VRAM mediante streaming de expertos MoE desde NVMe o RAM. Para ello, los shards GGUF incorporan manifiestos embebidos (`vram_experts`, `usage_seed`, `layer_order`) que el runtime TokenWing utiliza para planificar la carga de expertos en caliente. El primer shard (35,39 GiB) contiene el tronco de 48 capas mas los expertos MoE cuantizados, y el segundo (26,82 GiB) contiene la tabla PLE de la capa 1.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la cuantizacion extrema combinada con tecnicas de streaming de expertos para hacer viable el despliegue local de modelos de escala frontier. No obstante, su uso esta condicionado a un runtime especifico y a un plugin propietario, lo que limita su portabilidad frente a formatos GGUF estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas GDN (Gated DeltaNet) + atencion dispersa QSA, 512 expertos enrutados, top-10 |
| Parametros totales | 179.551.050.368 (~180B) |
| Parametros activos | no disponible (top-10 de 512 expertos; el numero exacto de parametros activos no se especifica) |
| Longitud de contexto | no disponible (los ejemplos de ejecucion usan `-c 4096`, pero no se declara el maximo del modelo base) |
| Tipos de cuantizacion | 2,26 bpw para expertos MoE (GGUF TokenWing); tronco en formato no especificado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (TokenWing, 2 shards: 35,39 GiB + 26,82 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con 48 capas hibridas que alternan capas GDN (Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente) y capas de atencion dispersa QSA. El modelo contiene 512 expertos enrutados con top-10 activos por token, lo que permite un ratio de activacion bajo y, en teoria, un coste computacional por token muy inferior al de un modelo denso de 180B. Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF/DPO no estan disponibles en la informacion proporcionada.

La innovacion principal de esta publicacion no reside en el modelo base, sino en el formato TokenWing. Los shards GGUF incluyen manifiestos embebidos que describen la ubicacion de los expertos en VRAM, el orden de capas y una semilla de uso para el planificador de streaming. El runtime TokenWing puede entonces mantener un subconjunto de expertos "calientes" en VRAM (por ejemplo, 96 expertos en el modo hibrido `H=96`) y transmitir el resto desde RAM o NVMe bajo demanda, con solapamiento de E/S y repack VNNI en CPU. Esto permite ejecutar un modelo de 180B en una GPU de 12 GB, a costa de una latencia dependiente del ancho de banda de almacenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen3.8-Flash-Next.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque plausibles dado el linaje Qwen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local de un modelo de 180B en GPU de consumo: el caso de uso central de esta publicacion. Un usuario con una RTX 4090 (24 GB) o incluso una GPU de 12 GB puede ejecutar el modelo con `--moe-stream model --moe-stream-ram 6GiB`, manteniendo el tronco en VRAM y transmitiendo expertos desde RAM o NVMe. Es adecuado para investigadores que quieran experimentar con modelos de escala frontier sin acceso a clusters.
- Prototipado de aplicaciones conversacionales de alta calidad: el modelo puede gestionar conversaciones multi-turno con un contexto de 4096 tokens (configuracion de ejemplo), suficiente para asistentes tecnicos o chatbots especializados en dominios acotados.
- Evaluacion comparativa de tecnicas de cuantizacion extrema: este checkpoint sirve como banco de pruebas para medir la degradacion de calidad a 2,26 bpw frente al modelo base en tareas de generacion y razonamiento.
- Despliegue en estaciones de trabajo con NVMe rapido: en escenarios donde el almacenamiento es un SSD NVMe de alta velocidad (7 GB/s o mas), el streaming de expertos puede alcanzar throughputs aceptables para generacion por lotes no interactiva, como resumen de documentos o clasificacion.
- Investigacion sobre enrutamiento MoE: los manifiestos `vram_experts` y `usage_seed` permiten estudiar el patron de activacion de expertos y optimizar la politica de cache en VRAM para cargas de trabajo concretas.
- Educacion y divulgacion: permite demostrar en una sola maquina como funciona un MoE de gran escala con atencion hibrida GDN/QSA, sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 12 GB es el minimo declarado para el modo de streaming completo (tronco en GPU + expertos en RAM/NVMe). Con 24 GB se puede mantener un subconjunto mayor de expertos en VRAM (modo hibrido `H=96`) y reducir el ancho de banda de lectura.
- RAM: al menos 16 GB en el ejemplo de portatil; el flag `--moe-stream-ram 6GiB` reserva 6 GiB para el buffer de expertos en RAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), GPUs de 12 GB como RTX 3060 12 GB o RTX 4070. No se mencionan A100/H100, aunque serian compatibles con el runtime si este soporta CUDA.
- Almacenamiento: se recomienda NVMe para el streaming de expertos; el rendimiento depende criticamente del ancho de banda de lectura (los shards suman 62,21 GiB).
- Opciones de despliegue: exclusivamente el runtime `runmyai/tokenwing` (rama `feat/quant-plugin`, PR #8) con el plugin `wv-plugin-v1.1` (`libqfn_wv_plugin.so` en Linux o `qfn_wv_plugin.dll` en Windows). No es compatible con llama.cpp estandar, Ollama, vLLM ni TGI sin el plugin.
- Latencia y throughput: no disponibles. Dependen del modo de streaming, del ancho de banda de NVMe y del numero de expertos en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing | ~180B (MoE, top-10 de 512) | no disponible | GGUF TokenWing (2 shards) | Apache 2.0 | TokenWing + plugin wv-plugin-v1.1 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B (MoE, top-10 de 512) | no disponible | safetensors | Apache 2.0 | vLLM, TGI, transformers |
| Cuantizaciones GGUF estandar de modelos MoE de ~180B | ~180B | variable | GGUF estandar | segun base | llama.cpp, Ollama |

La comparativa con alternativas de la misma categoria (mismo tamano o misma tarea) no esta disponible en la informacion proporcionada. La diferencia clave frente al modelo base es el formato y el runtime: el base requiere hardware de datacenter, mientras que esta cuantizacion apunta a GPUs de consumo mediante streaming.

## Limitaciones y advertencias

- Dependencia de runtime propietario: requiere `runmyai/tokenwing` en una rama de desarrollo (PR #8) y un plugin binario distribuido en GitHub Releases. No funciona con llama.cpp upstream ni con ecosistemas estandar.
- Cuantizacion extrema a 2,26 bpw: es probable una degradacion notable de calidad frente al modelo base, especialmente en tareas de razonamiento y codigo. No se han publicado evaluaciones que cuantifiquen esta perdida.
- Latencia dependiente de E/S: el streaming de expertos desde NVMe introduce latencia variable y potencialmente alta; no es adecuado para aplicaciones interactivas con requisitos de tiempo real estricto.
- Idiomas no declarados: se desconoce el soporte multilingue real de esta cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha caracterizado especificamente para este checkpoint.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el plugin binario `wv-plugin-v1.1` se distribuye por separado y su licencia no se especifica en la informacion proporcionada; conviene verificar los terminos del repositorio `grawnchtoader/tokenwing-assets` antes de un despliegue comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-15), lo que sugiere un artefacto reciente y sin validacion comunitaria.
- El flag `--moe-router-min-w 0.015` y `--moe-router-k-min 4` alteran el enrutamiento respecto al modelo original; pueden afectar a la fidelidad de las respuestas.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime TokenWing: `runmyai/tokenwing` (rama `feat/quant-plugin`, PR #8)
- Plugin y assets: https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.1
