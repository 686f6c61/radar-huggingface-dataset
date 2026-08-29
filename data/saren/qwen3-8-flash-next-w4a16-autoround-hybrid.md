# Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid

## Resumen

Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid es un checkpoint cuantizado del modelo Qwen3.8-Flash-Next, preparado por Saren para ejecutarse en un único DGX Spark (GB10) a aproximadamente 49 tokens por segundo. Se basa en la cuantización W4A16 de Intel (RTN + AutoRound) y la modifica con herramientas CPU-only: convierte el lm_head de bf16 a int8 GPTQ-Marlin, transforma 300 tensores de capas laterales (proyecciones GDN/QSA y experto compartido) a fp8 blockwise e4m3 128×128, y extrae la tabla n-gram de 51B (PLE) del índice para servirla por separado vía mmap.

El modelo original, Qwen3.8-Flash-Next, es un MoE ultra-sparse multimodal de 125B parámetros (incluyendo la tabla PLE) con 6B activos por token, arquitectura híbrida Gated DeltaNet (GDN) + Qwen Sparse Attention (QSA), y una ventana de contexto de 262K tokens. Esta variante cuantizada mantiene esas capacidades pero reduce drásticamente el footprint de memoria, permitiendo su despliegue en hardware de gama alta de consumo o prosumer. Es relevante porque demuestra que modelos de vanguardia pueden ejecutarse localmente con cuantización agresiva sin sacrificar demasiado rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse hibrido GDN + QSA (3 de cada 4 capas con Gated DeltaNet, 1/4 con Qwen Sparse Attention) |
| Parametros totales | 131.035.442.579 (segun safetensors; el modelo base declara 125B incluyendo tabla N-gram de 51B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | W4A16 (pesos int4, activaciones bf16); lm_head int8 GPTQ-Marlin; capas laterales fp8 e4m3 128×128 |
| Idiomas soportados | no disponible |
| Licencia | Qwen (con clausula MAU/revenue) |
| Formato de pesos | safetensors (configuracion GPTQ + reglas dinamicas; config AutoRound original en config.json.autoround) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next pertenece a la serie experimental Qwen4 (tag `qwen4_exp`). Su arquitectura combina dos mecanismos de atencion: Gated DeltaNet (GDN) en tres de cada cuatro capas, que comprime el historico de forma recurrente, y Qwen Sparse Attention (QSA) en la cuarta capa, que permite recuperacion precisa de informacion de largo alcance. El modelo es un MoE ultra-sparse con 125B parametros totales (incluyendo una tabla de embedding n-gram de 51B) y activa solo 6B parametros por token.

La variante de Saren aplica una cuantizacion hibrida sobre el checkpoint de Intel: el lm_head pasa de bf16 a int8 GPTQ-Marlin (compartido con el MTP draft head), 300 tensores de capas laterales (proyecciones GDN/QSA y experto compartido) se convierten a fp8 blockwise e4m3 con bloques de 128×128, y la tabla PLE se elimina del indice para servirse por separado. El `quantization_config` se reescribe a GPTQ con reglas dinamicas, conservando la configuracion AutoRound original como respaldo. No se dispone de informacion sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO) en los materiales proporcionados.

## Capacidades

- Generacion de texto y razonamiento avanzado: segun unsloth, supera a Claude-4.6-Opus (Max) en tareas de razonamiento.
- Capacidades multimodales: el modelo base es multimodal (imagen y texto), aunque esta variante cuantizada no especifica si mantiene el soporte de vision.
- Contexto largo de 262K tokens, util para documentos extensos o conversaciones multi-turno.
- MTP (Multi-Token Prediction) para decodificacion especulativa, que acelera la inferencia.
- Prefix caching y never-evict prompt pinning en esta variante, optimizados para el servidor DGX Spark.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible, aunque es comun en modelos Qwen recientes; se recomienda verificar en la documentacion oficial.

## Casos de uso

- Inferencia local en hardware de gama alta: el checkpoint esta disenado para ejecutarse en un DGX Spark (GB10) a ~49 tok/s, lo que permite desplegar un modelo de 125B en un equipo de escritorio o estacion de trabajo sin necesidad de un cluster.
- Asistente de programacion con contexto de repositorio completo: con 262K tokens de ventana, puede analizar y generar codigo sobre proyectos enteros, manteniendo el estado de multiples archivos.
- Analisis de documentos extensos: ideal para resumir o extraer informacion de libros, informes anuales o expedientes legales de cientos de paginas en una sola pasada.
- Razonamiento complejo y resolucion de problemas: su rendimiento superior a Claude-4.6-Opus (segun unsloth) lo hace adecuado para tareas de matematicas, logica y planificacion multi-paso.
- Investigacion en arquitecturas MoE hibridas: al ser un modelo experimental (qwen4_exp), sirve como banco de pruebas para estudiar la combinacion GDN + QSA y tecnicas de cuantizacion agresiva.
- Despliegue en entornos con restricciones de VRAM: la cuantizacion int4 + fp8 reduce el footprint a unos 78.5 GB (tamano del repo), permitiendo ejecutarlo en GPUs con 80GB de memoria (como A100 o H100) o en sistemas con memoria unificada de 75GB (segun unsloth).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cualitativa es la afirmacion de unsloth de que Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max), pero no se aportan numeros concretos. Tampoco hay datos de rendimiento comparativo entre esta variante cuantizada y el modelo original o la version de Intel.

## Requisitos de hardware

- DGX Spark (GB10): el checkpoint esta optimizado para este hardware, alcanzando ~49 tok/s con MTP, prefix caching y prompt pinning.
- Memoria unificada: segun unsloth, el modelo base puede ejecutarse en sistemas con 75GB de RAM/unified memory sin VRAM dedicada; esta variante cuantizada deberia requerir menos, aunque no se especifica.
- Almacenamiento: el repo ocupa 78.5 GB, mas la tabla PLE que se descarga por separado (tamano no indicado).
- GPU recomendadas: no se detallan modelos concretos, pero por el tamano del checkpoint, GPUs con 80GB de VRAM (A100, H100) o sistemas con memoria unificada amplia son adecuados.
- Opciones de despliegue: el repositorio GitHub proporciona un flujo docker + serve.sh; tambien es probable que sea compatible con vLLM (dado que el modelo base aparece en vLLM Recipes), aunque no se confirma para esta variante.
- Latencia y throughput: solo se conoce el dato de ~49 tok/s en DGX Spark; no hay mediciones en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B (incl. PLE 51B) | 6B | 262K | Qwen | bf16 |
| Intel/Qwen3.8-Flash-Next-W4A16-RTN-AutoRound | 125B | 6B | 262K | Qwen | W4A16 (int4 + bf16) |
| Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid | 131B (segun safetensors) | 6B | 262K | Qwen | W4A16 + int8 lm_head + fp8 side layers |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros MoE comparables (como DeepSeek-V3 o Mixtral) en la informacion proporcionada. La diferencia principal entre las tres versiones es el grado de cuantizacion y la optimizacion para hardware especifico.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia Qwen incluye una clausula de MAU/revenue que debe revisarse antes de cualquier uso comercial; puede requerir pago o autorizacion.
- Cuantizacion agresiva: la combinacion int4 + fp8 puede degradar la calidad en tareas sensibles a la precision numerica (por ejemplo, calculos cientificos o generacion de codigo con dependencias finas).
- Dependencia de la tabla PLE: el modelo no funciona correctamente sin descargar el repositorio separado `Saren/Qwen3.8-Flash-Next-ple-table-fp8`; si se omite, la inferencia fallara o dara resultados incorrectos.
- Modelo experimental: al ser parte de la serie qwen4_exp, puede presentar inestabilidades o cambios de comportamiento entre versiones.
- Idiomas soportados: no se ha publicado informacion sobre cobertura linguistica; se asume que hereda las capacidades del modelo base, pero no esta confirmado.
- Riesgo de alucinacion: no se han documentado sesgos o tasas de alucinacion especificas para esta variante; se recomienda validar las salidas en entornos de produccion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Saren/Qwen3.8-Flash-Next-W4A16-AutoRound-hybrid
- Repositorio GitHub del servidor DGX: https://github.com/Saren-Arterius/qwen3.8-Flash-DGX-AutoRound
- Modelo base de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-RTN-AutoRound
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla PLE separada: https://huggingface.co/Saren/Qwen3.8-Flash-Next-ple-table-fp8
- Documentacion de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guia de unsloth para ejecucion local: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
