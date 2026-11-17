# eyes-dot-ml/gemma-4-31B-it

## Resumen

Gemma 4 31B IT es la variante de instrucción del modelo denso de 31B de la familia Gemma 4, desarrollada por Google DeepMind y publicada con licencia Apache 2.0. El modelo que nos ocupa es una adaptación subida por el usuario `eyes-dot-ml` bajo el identificador `eyes-dot-ml/gemma-4-31B-it`, derivada del modelo base `google/gemma-4-31B`. Se trata de un modelo multimodal de tipo image-text-to-text: acepta texto e imágenes como entrada y genera texto como salida.

La familia Gemma 4 se presenta como una gama de modelos abiertos que cubre desde dispositivos móviles hasta servidores, con variantes densas y Mixture-of-Experts. Esta versión de 31B es la mayor de las densas y está orientada a estaciones de trabajo y GPUs de consumo de gama alta. Incorpora una ventana de contexto de hasta 256K tokens, soporte multilingüe en más de 140 idiomas, modos de razonamiento configurables y soporte nativo de function calling y del rol `system`.

Su relevancia radica en que ofrece capacidades de razonamiento, código y multimodalidad con pesos abiertos y licencia permisiva, lo que facilita su despliegue en producción sin las restricciones de licencia de otras familias de modelos. El repositorio ocupa 62,6 GB y contiene pesos en safetensors compatibles con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), capas globales con Keys y Values unificadas y Proportional RoPE (p-RoPE) |
| Parametros totales | 31.273.088.876 (30,7B según model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 140 idiomas (según model card de la familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa de 60 capas con un mecanismo de atención híbrido que intercala atención local de ventana deslizante (1024 tokens) con atención global, garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales utilizan Keys y Values unificadas y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens y el codificador de visión asociado ronda los 550M de parámetros. Soporta texto e imagen como entrada; a diferencia de las variantes E2B, E4B y 12B, la versión de 31B no incorpora audio.

La model card de la familia indica que los modelos Gemma 4 se distribuyen en variantes preentrenadas y ajustadas por instrucciones, con modos de razonamiento configurables y soporte nativo del rol `system`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO para esta variante. Tampoco se especifican los detalles del ajuste fino realizado por `eyes-dot-ml` sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Generación de código y tareas de programación, con mejoras declaradas en benchmarks de coding.
- Capacidades matemáticas y de razonamiento multi-paso.
- Soporte nativo de function calling / tool calling para flujos agénticos.
- Soporte del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües en más de 140 idiomas.
- Procesamiento de contexto largo de hasta 256K tokens.
- No soporta audio en esta variante de 31B (solo E2B, E4B y 12B lo incluyen).

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens, incorporando el rol `system` para fijar tono, políticas y restricciones de respuesta.
- Generación de código en producción: el soporte nativo de function calling permite integrarlo en pipelines de CI/CD para generar parches, revisar diffs o invocar herramientas de build y test de forma estructurada.
- Agentes autónomos multi-paso: la combinación de razonamiento configurable, tool calling y contexto largo lo hace adecuado para orquestar tareas que requieren varias llamadas a APIs y mantener el estado entre pasos.
- Análisis de documentos con imágenes: al aceptar image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto para extraer información estructurada.
- Asistencia técnica multilingüe: con más de 140 idiomas, sirve para soporte en mercados diversos sin desplegar modelos separados por idioma.
- Investigación y prototipado: al tener pesos abiertos y licencia Apache 2.0, es apto para experimentación académica, ajuste fino y evaluación comparativa sin restricciones de uso comercial.
- Extracción de información de contextos largos: informes extensos, expedientes o bases de conocimiento que superan la ventana típica de 8K-32K tokens pueden procesarse en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (BF16) los 31,3B parámetros requieren aproximadamente 62 GB de VRAM; en cuantización de 8 bits, en torno a 32 GB; en 4 bits, alrededor de 16-18 GB (estimaciones teóricas, no confirmadas en la información disponible).
- GPU recomendadas: A100 80GB o H100 para BF16; A100 40GB o L40S para 8 bits; GPUs de consumo de gama alta para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con cuantización de 4 bits, y en RTX 3090/4090 con cuantizaciones agresivas; no cabe en BF16 en ninguna GPU de consumo.
- Opciones de despliegue: la librería indicada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirman en la información disponible soportes específicos de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 31B IT (esta ficha) | 31,3B | 256K | Texto, imagen | Apache 2.0 | Hugging Face |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | Hugging Face |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento frente a modelos de otros desarrolladores en la información proporcionada. Frente a la variante MoE de 26B A4B, el modelo de 31B denso activa todos sus parámetros en cada token, lo que implica mayor coste de cómputo por token pero elimina la variabilidad de enrutamiento. Frente al 12B Unified, el 31B prescinde del audio y del diseño sin codificadores, pero duplica aproximadamente el número de parámetros.

## Limitaciones y advertencias

- No se han publicado datos de sesgos, evaluación de seguridad ni tasas de alucinación en la información disponible.
- El modelo puede generar contenido factualmente incorrecto; en producción conviene validar salidas en dominios sensibles.
- Aunque declara soporte en más de 140 idiomas, el rendimiento puede variar notablemente entre idiomas y no se detalla por idioma.
- La licencia del repositorio es Apache 2.0, pero la model card enlaza además a la licencia específica de Gemma 4 (`gemma_4_license`); conviene revisar ambos documentos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y procede de un autor distinto de Google DeepMind: no hay evidencia de validación comunitaria del ajuste realizado.
- No se especifican los datos, el método ni las evaluaciones del ajuste fino aplicado sobre `google/gemma-4-31B`, por lo que el comportamiento puede diferir del modelo oficial.
- El tamaño del repositorio (62,6 GB) y la ventana de 256K implican requisitos de memoria considerables; el contexto largo incrementa el consumo de KV cache.
- Esta variante no procesa audio, a diferencia de las versiones E2B, E4B y 12B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eyes-dot-ml/gemma-4-31B-it
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
