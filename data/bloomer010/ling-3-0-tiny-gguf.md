# bloomer010/Ling-3.0-tiny-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por inclusionAI, distribuido originalmente en formato BF16 y convertido a GGUF por el usuario bloomer010 para su uso con llama.cpp. Con 7.893.392.800 parámetros totales y solo 1.300 millones activos por token, ofrece una relacion capacidad-coste computacional muy favorable para despliegue en hardware de consumo. Su ventana de contexto alcanza los 131.072 tokens en la configuracion publicada, lo que lo situa por encima de la mayoria de modelos densos de tamano similar.

La arquitectura combina 24 capas: 18 capas KDA (Kimi Delta Attention, atencion lineal) y 6 capas MLA (Multi-head Latent Attention), con 128 expertos enrutados, 8 activos por token y un experto compartido. Incorpora ademas proyecciones Q-LoRA de rango 256 y KV-LoRA de rango 512, lo que reduce el coste de memoria de las proyecciones de atencion. El modelo esta pensado para generacion de texto conversacional con modo de razonamiento (thinking) activado por defecto.

La relevancia actual de esta ficha radica en la disponibilidad de cuantizaciones GGUF muy agresivas (desde 1,3 GB en Q1_0 hasta 11,19 GB en Q8_K_XL), que permiten ejecutar un MoE de casi 8.000 millones de parametros en GPUs de consumo e incluso en CPU. La licencia MIT facilita su adopcion comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con 18 capas KDA (atencion lineal) y 6 capas MLA |
| Parametros totales | 7.893.392.800 |
| Parametros activos | 1.300 millones por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_K_XL, Q8_0, Q6_K_XL, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, MXFP4_MOE, IQ4_XS, Q3_K_M, Q3_K_S, IQ3_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S, Q1_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (conversion desde safetensors BF16 del modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE hibrida con 24 capas en total. Dieciocho de ellas usan KDA (Kimi Delta Attention), un mecanismo de atencion lineal que reduce el coste computacional en contextos largos, mientras que las seis restantes emplean MLA (Multi-head Latent Attention), que comprime las claves y valores en un espacio latente de baja dimension. Cada capa MoE dispone de 128 expertos enrutados, de los cuales se activan 8 por token, mas un experto compartido siempre activo. Las proyecciones Q-LoRA (rango 256) y KV-LoRA (rango 512) reducen el numero de parametros dedicados a las proyecciones de atencion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El modelo no incluye bloque MTP (Multi-Token Prediction) en esta version (`num_nextn_predict_layers: 0`). La conversion a GGUF se valido con 526 tensores, incluyendo las 18 proyecciones Q-LoRA, y se probo en CPU y CUDA (RTX 4070 y RTX 3060).

## Capacidades

- Generacion de texto conversacional multi-turno con soporte de plantilla de chat Jinja (`--jinja`).
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Razonamiento de varios pasos gracias al modo thinking y a la ventana de 131.072 tokens.
- Procesamiento de contextos largos (hasta 131.072 tokens) con coste reducido por las capas KDA.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens de ventana, el modelo puede mantener conversaciones con historiales extensos o procesar documentos completos sin truncamiento, apoyandose en las capas KDA para mantener un coste de atencion lineal en las secuencias largas.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (4,82 GB) cabe en GPUs con 6 GB o mas de VRAM, lo que permite ejecutar un MoE de 7,9B parametros en tarjetas como la RTX 3060 o la RTX 4060.
- Procesamiento por lotes en CPU: las cuantizaciones IQ2 e IQ3 (entre 2,21 y 3,51 GB) permiten ejecutar el modelo en servidores sin GPU, con velocidades reducidas pero funcionales para tareas de clasificacion o resumen no interactivas.
- Generacion de codigo asistida: el modo thinking permite razonar sobre problemas de programacion antes de emitir la respuesta; el modelo puede integrarse en editores o pipelines mediante `llama-server` con la API compatible con OpenAI (`endpoints_compatible`).
- Analisis de documentos extensos: informes, articulos o expedientes que superen los 100.000 tokens pueden procesarse en una sola pasada, algo inviable en modelos densos de 7-8B con contexto de 8K o 32K.
- Prototipado e investigacion en entornos con recursos limitados: al ser MIT y ejecutable con llama.cpp, sirve como banco de pruebas para experimentar con arquitecturas MoE hibridas sin necesidad de infraestructura de datacenter.
- Aplicaciones embebidas o edge: la cuantizacion Q1_0 (1,30 GB) permite desplegar el modelo en dispositivos con 2 GB de memoria, aunque con perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (datos del autor):
  - BF16: 15,8 GB (16 GB+ de memoria).
  - Q8_K_XL: 11,19 GB (12 GB+).
  - Q8_0: 8,41 GB (10 GB+).
  - Q6_K: 6,50 GB (8 GB+).
  - Q5_K_M: 5,64 GB (7 GB+).
  - Q4_K_M: 4,82 GB (6 GB+).
  - IQ4_XS: 4,29 GB (5 GB+).
  - Q3_K_M: 3,84 GB (5 GB+).
  - IQ2_M: 2,70 GB (3 GB+).
  - IQ1_S: 1,76 GB (2 GB+).
  - Q1_0: 1,30 GB (2 GB+).
- GPU recomendadas: RTX 4070 y RTX 3060 fueron usadas por el autor para validacion CUDA. Para BF16 se recomienda A100 o H100; para cuantizaciones Q4-Q8, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090.
- Cabe en GPU de consumo: si, desde Q4_K_M en adelante en tarjetas con 6 GB o mas. Las cuantizaciones IQ2 e IQ3 caben en GPUs de 3-4 GB.
- MXFP4_MOE (4,72 GB) usa su ruta nativa en GPUs con soporte MXFP4 (Blackwell RTX 50-series, GB10/DGX Spark); en hardware anterior cae a una ruta de dequantizacion mas lenta.
- Opciones de despliegue: llama.cpp (soporte nativo de `bailingmoe3` fusionado el 2026-08-17), `llama-server` con API compatible con OpenAI, `llama-cli`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la informacion proporcionada. A continuacion se comparan parametros y contexto con alternativas de categoria similar cuando el dato es conocido:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Ling-3.0-tiny | 7,89B | 1,3B | 131.072 | MIT |
| Alternativas densas de ~7-8B | ~7-8B | ~7-8B (denso) | no disponible | variable |
| Alternativas MoE de ~8B | no disponible | no disponible | no disponible | no disponible |

La ventaja estructural de Ling-3.0-tiny frente a modelos densos del mismo tamano es el coste de inferencia: solo 1,3B parametros activos por token, lo que reduce el computo por token aproximadamente a una sexta parte. No se dispone de datos de rendimiento comparado para confirmar si esa ventaja se traduce en calidad equivalente.

## Limitaciones y advertencias

- El modelo termina ocasionalmente su respuesta a mitad del razonamiento (mid-think) sin cierre, segun el autor de la conversion; este comportamiento es inherente a los pesos, incluso en precision completa.
- Las cuantizaciones agresivas (Q1_0, IQ1, IQ2) degradan notablemente la calidad; el autor recomienda Q8_K_XL para un rendimiento cercano a precision completa.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados no especificados; no se puede garantizar calidad fuera del ingles sin validacion previa.
- El contexto de 131.072 tokens requiere configurar `-c 131072` y suficiente memoria KV; en cuantizaciones pequenas el coste de la cache KV puede superar al de los pesos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base es de inclusionAI y se recomienda verificar la licencia del modelo original.
- El soporte de `bailingmoe3` en llama.cpp se fusiono el 2026-08-17; versiones anteriores requieren la rama `bailingmoe3-support` de aetherbird.
- No se dispone de informacion sobre tool calling ni capacidades de agente; conviene validarlas antes de usarlas en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.0-tiny-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Rama pre-fusion con soporte bailingmoe3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
