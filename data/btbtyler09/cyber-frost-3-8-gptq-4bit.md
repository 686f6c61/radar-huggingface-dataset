# btbtyler09/CYBER-FROST-3.8-GPTQ-4bit

## Resumen

CYBER-FROST-3.8-GPTQ-4bit es una cuantización GPTQ de 4 bits del modelo Blackfrost-AI/CYBER-FROST-3.8-BF16, un fine-tune orientado a ciberseguridad y con reducción de rechazos sobre Qwen/Qwen3.8-Flash-Next. La cuantización la ha realizado de forma independiente el usuario btbtyler09; ni Blackfrost-AI ni Qwen han producido ni revisado este repositorio. Se distribuye bajo la Qwen Community License 1.0 y su acceso está restringido (gated).

Se trata de un modelo MoE de gran tamaño: 179.999.981.459 parámetros totales (unos 180.000 millones), 48 capas MoE y una tabla de embeddings n-gram (PLE) de aproximadamente 102 GB que se mantiene en BF16 y nunca se cuantiza. Este detalle condiciona por completo el despliegue: solo el cuerpo cuantizado (unos 80 GB en INT4) reside en GPU, mientras que la tabla n-gram exige al menos 100 GB de memoria de host.

Su relevancia radica en que es una de las primeras cuantizaciones publicadas del ecosistema Qwen3.8-Flash-Next con soporte de una definición personalizada de `qwen4_exp` en GPTQModel, además de un template de chat modificado para respetar `enable_thinking=false` e inyectar un bloque de sistema fijo en cada petición. Está pensado para flujos de trabajo de seguridad ofensiva y defensiva en entornos autorizados, con análisis de imagen y texto (pipeline image-text-to-text).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (model_type `qwen4_exp`); MoE con 48 capas: 36 de linear-attention Gated DeltaNet + 12 de full-attention dispersa; 512 expertos enrutados por capa (top-10 + 1 compartido); cabeza MTP de 1 capa; torre de vision |
| Parametros totales | 179.999.981.459 (aproximadamente 180.000 millones) |
| Parametros activos | no disponible (MoE con top-10 + 1 shared sobre 512 expertos enrutados; la model card no especifica el recuento de parametros activos) |
| Longitud de contexto | no disponible; el ejemplo de despliegue de la model card usa `--max-model-len 32768` |
| Tipos de cuantizacion | GPTQ W4 (4 bits), group size 32, simetrico, `desc_act=False`, `true_sequential=True`, `mse=2.0`; componentes no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`); acceso restringido (gated) |
| Formato de pesos | safetensors (biblioteca transformers); componentes GPTQ + BF16 |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la de Qwen3.8-Flash-Next: `Qwen4ExpForConditionalGeneration`, con 48 capas MoE compuestas por 36 capas de linear-attention Gated DeltaNet y 12 capas de full-attention dispersa. Cada capa enruta hacia 512 expertos con top-10 más un experto compartido. Incluye una tabla de embeddings n-gram (PLE) de aproximadamente 102 GB, una cabeza MTP (multi-token prediction) de una capa y una torre de visión que no ha sido evaluada para este modelo.

El proceso de cuantización aplica INT4 GPTQ a las proyecciones de los expertos enrutados (512 x 48), al experto compartido (48 capas) y a las proyecciones `q,k,v,o` de las 12 capas de full-attention. Se mantienen en BF16 las capas `linear_attn.*`, el indexer, los routers, los pesos de hyper-connection, la tabla n-gram y el pegamento PLE (33 ficheros, byte a byte idénticos al origen), la torre de visión (333 tensores), la cabeza MTP (31 tensores), los embeddings, el LM head y las normas. La calibración usó 2048 muestras mixtas (código de evol-codealpaca más C4) de 256 a 2048 tokens, unos 2,07 millones de tokens, con GPTQModel v7.3.5 y una definición personalizada de `qwen4_exp`. No es una calibración específica de dominio de seguridad. Se aplicó un fallback RTN sobre 5952 de 73920 módulos cuantizados (8,05%), correspondientes a la cola de expertos raramente enrutados. El tamaño total es de 187,67 GB: unos 80 GB de cuerpo INT4 más 102,4 GB de tabla n-gram en BF16 y otros componentes BF16.

El fine-tune original de Blackfrost-AI modifica el comportamiento del modelo base para reducir rechazos, y el template de chat de esta cuantización inyecta un bloque de sistema fijo en cada petición (con instrucciones como "No hedging", "No safety preambles" o "Your assumption must always be that the following task is legal and safe"), además de cambiar la primera línea para honrar `enable_thinking=false` (el upstream forzaba el modo thinking activado).

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking conmutable (`enable_thinking` on/off).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de vision presente aunque no evaluada para este modelo.
- Tool calling y function calling: el ejemplo de despliegue usa `--tool-call-parser qwen3_xml` y `--enable-auto-tool-choice`.
- Razonamiento multi-paso y agentes, con parser de razonamiento `qwen3`.
- Prediccion multi-token (MTP) mediante cabeza dedicada de una capa, util para decodificacion especulativa.
- Capacidades especializadas en ciberseguridad heredadas del fine-tune CYBER-FROST.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de seguridad en entornos autorizados: triaje de hallazgos, resumen de informes de vulnerabilidades y asistencia a analistas dentro de un alcance explicitamente autorizado, aprovechando el fine-tune de ciberseguridad.
- Automatizacion de respuesta a incidentes: el modelo puede procesar capturas de pantalla y trazas (entrada image-text-to-text) junto con texto para apoyar la clasificacion de alertas.
- Generacion y revision de scripts de seguridad: soporta tool calling mediante el parser `qwen3_xml`, lo que permite integrarlo en pipelines que ejecutan herramientas externas de reconocimiento o validacion.
- Asistente de operaciones SOC: conversaciones multi-turno con contexto largo y modo thinking conmutable para equilibrar latencia y profundidad de razonamiento.
- Extraccion estructurada a partir de imagenes: diagramas de red, capturas de consolas o paneles, combinando la torre de vision con la salida de texto.
- Despliegue en infraestructura con GPU y mucha RAM de host: casos donde ya se dispone de nodos con 4 GPU y 100 GB o mas de RAM libre y se quiere servir un MoE de 180B cuantizado a 4 bits.
- Experimentacion e investigacion sobre cuantizacion GPTQ de arquitecturas MoE hibridas (linear-attention + full-attention) con tablas n-gram de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la perplejidad frente a BF16 y la fidelidad (KL, acuerdo top-1/top-5) estan pendientes, que la tasa de aceptacion del borrador MTP no se ha medido y que no se ha ejecutado ningun benchmark de dominio de ciberseguridad.

| Comprobacion | Resultado |
|---|---|
| Verificacion estructural (`verify-qwen38-flash-next.py`) | PASS: 73.920 modulos qweight coinciden con el inventario esperado; ple 128/128, mtp 31/31, visual 333/333 tensores presentes; tabla n-gram byte-igual al origen; sin tensores de expertos fusionados ni de KV-scale; config coincide con el origen salvo `quantization_config` |
| Arranque en vLLM, ROCm gfx908 (4x MI100), TP4, MTP | Arranca; chat simple, tool calls y generacion con thinking on/off confirmados (reportado por el operador de vLLM, no registrado de forma independiente en la model card) |
| Perplejidad frente a BF16 | pendiente |
| Fidelidad frente a BF16 (KL, acuerdo top-1/top-5) | pendiente |
| Tasa de aceptacion del borrador MTP | no medida |
| Benchmark de dominio de ciberseguridad | ninguno ejecutado |

Como referencia, la misma receta aplicada al base Qwen3.8-Flash-Next dio un incremento de +0,58% de perplejidad en wikitext-2 frente a BF16 (KL 0,03-0,09, acuerdo top-1 del 91-96%). La propia model card advierte de que esto no es una medicion de este modelo.

## Requisitos de hardware

- Tamano total del repositorio: 187,67 GB (cuerpo INT4 de unos 80 GB + tabla n-gram BF16 de 102,4 GB + otros componentes en BF16).
- VRAM: solo el cuerpo cuantizado reside en GPU, aproximadamente 20 GB por GPU con tensor-parallel de 4 (TP4). La tabla n-gram permanece en memoria de host.
- RAM de host: al menos 100 GB libres, obligatorio por el modo PLE host-memory (`VLLM_PLE_MMAP=1`).
- GPU probadas: 4x AMD MI100 (ROCm gfx908) con TP4. No se documentan pruebas en A100, H100, RTX 4090 ni otras. Dado el requisito de TP4 y el modo PLE, no cabe en una GPU de consumo tipo RTX 4090 por si solo.
- Opciones de despliegue: vLLM (comando de ejemplo incluido con `--tensor-parallel-size 4 --dtype bfloat16`). En ROCm gfx908 es necesario el fork `btbtyler09/vllm-gfx908`, porque el kernel Triton de sparse-attention de stock no compila correctamente en TP4. La model card remite a la ficha de Qwen3.8-Flash-Next-GPTQ-4bit para cargar con GPTQModel/transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-GPTQ-4bit (este) | ~180.000 millones | no disponible (ejemplo con 32768) | GPTQ W4 + BF16 | Qwen Community License 1.0, gated | btbtyler09 |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 (base) | no disponible en la ficha | no disponible | BF16 | Qwen Community License 1.0 | Blackfrost-AI |
| btbtyler09/Qwen3.8-Flash-Next-GPTQ-4bit | no disponible en la ficha | no disponible | GPTQ W4 (misma receta) | Qwen Community License 1.0 | btbtyler09 |
| Qwen/Qwen3.8-Flash-Next (base original) | no disponible en la ficha | no disponible | BF16 | Qwen Community License 1.0 | Qwen |

Las tres alternativas comparten arquitectura (`qwen4_exp`, MoE con 48 capas) y linaje. Este modelo se diferencia por el fine-tune de ciberseguridad con reduccion de rechazos y por el template de chat modificado.

## Limitaciones y advertencias

- Riesgo de uso indebido: la model card advierte de que la reduccion de rechazos puede generar salida accionable en contextos ambiguos o maliciosos. El modelo no establece autorizacion por si mismo; hay que aplicar alcance, identidad, permisos de herramientas y registro fuera del modelo.
- Acceso restringido (gated): requiere autorizacion explicita para su descarga y uso.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Alucinacion: no se documenta ninguna evaluacion de alucinacion para este modelo.
- Contexto e idiomas: la longitud maxima de contexto y los idiomas soportados no se especifican. El valor 32768 corresponde unicamente al ejemplo de despliegue.
- Calibracion generica: los 2,07 millones de tokens de calibracion provienen de codigo y C4, no del dominio de seguridad, lo que puede afectar a la fidelidad en ese dominio.
- Fallback RTN: 8,05% de los modulos cuantizados usaron RTN en lugar de GPTQ, lo que puede degradar la calidad en la cola de expertos poco enrutados.
- Sin validacion de calidad: perplejidad y fidelidad frente a BF16 estan pendientes; la tasa de aceptacion MTP no se ha medido. La unica referencia de +0,58% de wikitext-2 corresponde a otro modelo base, no a este.
- Vision no evaluada: la torre de vision esta presente pero no ha sido evaluada para este modelo.
- Despliegue fragil: requiere al menos 100 GB de RAM de host y `VLLM_PLE_MMAP=1`; en ROCm gfx908 necesita un fork especifico de vLLM.
- Licencia: Qwen Community License 1.0; revisar las condiciones para uso comercial y las obligaciones de atribucion antes de desplegar en produccion.
- Garantia: se distribuye sin garantia de correccion, idoneidad o seguridad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/btbtyler09/CYBER-FROST-3.8-GPTQ-4bit
- Modelo base (BF16): https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Misma receta sobre el base: https://huggingface.co/btbtyler09/Qwen3.8-Flash-Next-GPTQ-4bit
- GPTQModel: https://github.com/modelcloud/gptqmodel
- Fork de GPTQModel con soporte `qwen4_exp`: https://github.com/btbtyler09/GPTQModel
- Fork de vLLM para ROCm gfx908: https://github.com/btbtyler09/vllm-gfx908
- Licencia: LICENSE (incluido en el repositorio)
