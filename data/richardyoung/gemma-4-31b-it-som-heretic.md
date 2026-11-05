# richardyoung/gemma-4-31B-it-SOM-heretic

## Resumen

Gemma 4 31B it SOM heretic es una variante "decensored" del modelo multimodal google/gemma-4-31B-it, publicada por el usuario richardyoung. El modelo base es un transformer denso de 30,7B parametros (31.273.086.512 parametros reales en safetensors) desarrollado por Google DeepMind, capaz de procesar texto e imagen y generar texto, con una ventana de contexto de 256K tokens y soporte para mas de 140 idiomas. Esta version concreta aplica una ablacion multidireccional basada en mapas autoorganizados (Self-Organizing Map, SOM) mediante la herramienta Heretic v2.0.0, con el objetivo de reducir la tasa de rechazos del modelo original.

La relevancia de esta ficha radica en que documenta una practica creciente en el ecosistema open source: la modificacion de pesos de modelos alineados para eliminar comportamientos de rechazo. El autor reporta una reduccion de rechazos de 99/100 a 82/100 en su propia evaluacion, con una divergencia KL de 0,0548 respecto al modelo original. Es importante senalar que el modelo se distribuye bajo licencia Apache 2.0 segun los metadatos del repositorio, aunque el modelo base de Google remite a la licencia especifica de Gemma 4.

El modelo hereda las capacidades multimodales, de razonamiento y de codigo del Gemma 4 31B Dense, incluyendo modos de pensamiento configurables, soporte nativo de system prompt y function calling. No obstante, la intervencion sobre los pesos puede afectar a la calidad y coherencia en determinados dominios, por lo que su uso en produccion requiere evaluacion cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), p-RoPE en capas globales |
| Parametros totales | 31.273.086.512 (30,7B segun model card del base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Mas de 140 idiomas (heredado del modelo base) |
| Licencia | Apache 2.0 (metadatos del repo); el modelo base remite a la licencia de Gemma 4 |
| Formato de pesos | safetensors |
| Capas | 60 |
| Sliding window | 1024 tokens |
| Vocabulario | 262K tokens |
| Modalidades | Texto e imagen de entrada; texto de salida |
| Parametros del encoder de vision | ~550M |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

El modelo base Gemma 4 31B Dense emplea un transformer denso de 60 capas con un mecanismo de atencion hibrido que intercala atencion local de ventana deslizante (1024 tokens) con atencion global completa, garantizando que la capa final sea siempre global. Para optimizar el consumo de memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). Incorpora un encoder de vision de aproximadamente 550M de parametros que permite el procesamiento de imagenes con soporte de relacion de aspecto y resolucion variables. El vocabulario es de 262K tokens y el contexto maximo alcanza los 256K tokens.

Sobre el entrenamiento del modelo base, la informacion disponible indica que Gemma 4 se distribuye en variantes preentrenadas e instruidas, con modos de pensamiento configurables, soporte nativo del rol `system` y mejoras en codigo y capacidades agenticas. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. La intervencion de esta variante concreta consiste en una ablacion multidireccional SOM aplicada con Heretic v2.0.0 sobre las proyecciones `attn.o_proj` y `mlp.down_proj`, con parametros especificos por capa (direction_index por capa, direction_decay 0.00, max_weight 0.92 en atencion y 1.43 en MLP, entre otros). El resultado reportado es una reduccion de rechazos de 99/100 a 82/100 con una divergencia KL de 0,0548 frente al original.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprension de imagenes de entrada con soporte de relacion de aspecto y resolucion variables.
- Generacion de codigo y tareas de programacion, con mejoras reportadas por el modelo base en benchmarks de coding.
- Razonamiento matematico y resolucion de problemas multi-paso.
- Soporte nativo de function calling / tool calling.
- Capacidades agenticas para flujos autonomos y razonamiento multi-paso.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Comportamiento de rechazo reducido respecto al modelo original (82/100 frentes a 99/100 segun el autor).
- No dispone de entrada de audio en la variante 31B (el audio esta limitado a E2B, E4B y 12B en la familia Gemma 4).

## Casos de uso

- Asistentes conversacionales con contexto largo: la ventana de 256K tokens permite mantener conversaciones multi-turno extensas o procesar documentos completos sin truncamiento, adecuado para atencion al cliente o soporte tecnico.
- Analisis de documentos con imagenes: al aceptar entrada de imagen y texto, puede extraer informacion de capturas, diagramas o formularios combinados con texto en un mismo prompt.
- Generacion de codigo en pipelines: el soporte de function calling y las mejoras en coding del base permiten integrarlo en herramientas de autocompletado, revision o generacion de tests dentro de flujos de CI/CD.
- Agentes autonomos multi-paso: el soporte nativo de system prompt y tool calling facilita la construccion de agentes que planifican y ejecutan tareas con llamadas a herramientas externas.
- Procesamiento multilingue: con mas de 140 idiomas, es util para traduccion, resumen o clasificacion de contenido en entornos internacionales.
- Investigacion sobre alineacion y seguridad: esta variante es relevante para estudiar el efecto de las tecnicas de ablacion sobre la tasa de rechazo y la coherencia del modelo, comparando con el original mediante metricas como la divergencia KL.
- Generacion de contenido creativo sin restricciones excesivas: orientado a casos donde el modelo original rechaza peticiones por politicas de contenido, aunque con las advertencias de calidad y sesgo correspondientes.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los de la evaluacion propia del autor sobre rechazos y divergencia KL:

| Metrica | Este modelo | Modelo original (google/gemma-4-31B-it) |
|---|---|---|
| Rechazos | 82/100 | 99/100 |
| Divergencia KL | 0,0548 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para esta variante concreta ni para el modelo base en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 62 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se requieren GPUs con 80 GB o configuraciones multi-GPU.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples GPUs (por ejemplo, 2x A100 40GB o 2x RTX 4090 24GB) para reparto de pesos.
- En cuantizacion de 8 bits, la huella de pesos ronda los 31 GB, lo que permite su uso en una unica A100 40GB o en configuraciones de 2x RTX 4090.
- En cuantizacion de 4 bits, la huella ronda los 16 GB, lo que permite ejecucion en una RTX 4090 24GB, aunque con perdida de calidad y sin datos publicados de esta variante en dicho formato.
- No cabe en GPUs consumer de gama media (8-12 GB) en precision completa ni en 8 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/GGUF si se generan conversiones (no se proporcionan archivos GGUF en el repositorio).
- No se dispone de datos de latencia ni throughput medidos para esta variante en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-SOM-heretic | 31,3B (denso) | 256K | Texto, imagen | Apache 2.0 (repo) | Variante decensored con ablacion SOM |
| google/gemma-4-31B-it | 30,7B (denso) | 256K | Texto, imagen | Licencia Gemma 4 | Modelo base original, tasa de rechazo 99/100 |
| Gemma 4 26B A4B | 26B totales, 4B activos (MoE) | 256K | Texto, imagen | Licencia Gemma 4 | Alternativa MoE de la misma familia, menor coste de inferencia |
| Gemma 4 12B Unified | 11,95B (denso) | 256K | Texto, imagen, audio | Licencia Gemma 4 | Menor tamano, encoder-free, incluye audio |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion SOM reduce los rechazos, pero puede degradar la coherencia y la calidad de las respuestas en dominios sensibles; la divergencia KL de 0,0548 indica un cambio medible respecto al modelo original.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente incrementado por la modificacion de pesos en las proyecciones de atencion y MLP.
- La eliminacion de comportamientos de rechazo puede facilitar la generacion de contenido danino, sesgado o inapropiado; no se han publicado evaluaciones de seguridad para esta variante.
- Sesgos conocidos del modelo base no documentados en la informacion disponible; se recomienda auditoria propia antes de uso en produccion.
- La licencia declarada en el repositorio es Apache 2.0, pero el modelo base remite a la licencia especifica de Gemma 4; es necesario verificar la compatibilidad para uso comercial.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware consumer sin conversion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni benchmarks independientes.
- La entrada de audio no esta soportada en la variante 31B.
- El contexto de 256K requiere tecnicas de gestion de cache KV para no agotar memoria en despliegues de una sola GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/gemma-4-31B-it-SOM-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Proyecto Heretic: https://heretic-project.org
