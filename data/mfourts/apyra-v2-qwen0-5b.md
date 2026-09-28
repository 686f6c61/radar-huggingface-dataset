# mfourts/apyra-v2-qwen0.5b

## Resumen

Apyra v2 es un motor deterministico de decision y clasificacion en tiempo real publicado por el usuario mfourts en HuggingFace bajo el identificador `mfourts/apyra-v2-qwen0.5b`. No es un modelo generativo: en lugar de producir tokens de forma autorregresiva a traves de una `lm_head`, acopla cabezas de atencion rapida 1D sobre la ultima capa de representacion latente de un backbone congelado `Qwen/Qwen2.5-0.5B`. El resultado es un clasificador de secuencia completa con agregacion lineal O(L) parametrizada por un vector de consulta, pensado para agentes de IA, guardrails y pipelines que necesitan decisiones de baja latencia.

La propuesta tecnica se apoya en tres ideas: eliminar por completo la proyeccion de vocabulario, sustituir la decodificacion token a token por un pooling atencional de coste lineal, y usar la propia distribucion de pesos de atencion como mecanismo de explicabilidad nativa (atribucion de saliencia por token o termino sin recurrir a SHAP o LIME). El autor declara latencias de 12-15 ms en GPU Nvidia CUDA y de 80-100 ms en CPU x86 con AVX-512, con backbone en BF16 y cabezas en F32 bajo el framework Candle.

El modelo es relevante en el nicho de la clasificacion de texto con requisitos estrictos de latencia y trazabilidad, donde los clasificadores basados en transformers encoder siguen siendo la opcion mayoritaria. Sin embargo, la informacion publica es muy limitada: el repositorio aparece con 0 descargas, 0 likes y un tamano declarado de 0,0 GB, no hay resultados de evaluacion mas alla de las tablas de latencia y no se especifican idiomas soportados ni el numero de parametros de las cabezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen2.5-0.5B congelado mas cabezas de atencion rapida 1D (attentive pooling) sobre la ultima capa latente; sin LM head |
| Parametros totales | Backbone de aproximadamente 0,5B (Qwen2.5-0.5B); tamano de las cabezas de atencion no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el backbone Qwen2.5-0.5B admite 32.768 tokens de forma nativa |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors, con backbone en BF16 y cabezas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`apyra_heads.safetensors`), cargable con la libreria Candle (Rust) |
| Tarea declarada (pipeline) | text-classification |
| Framework | Candle (Rust) |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura parte del backbone `Qwen/Qwen2.5-0.5B` mantenido congelado. Sobre su ultima capa de representacion latente se acoplan cabezas de atencion rapida 1D que realizan un *attentive pooling* de coste lineal O(L) respecto a la longitud de la secuencia, parametrizado por un vector de consulta q perteneciente a R^d. Al prescindir de la `lm_head`, el modelo no genera texto: agrega la secuencia completa en una representacion unica que alimenta las cabezas de clasificacion. La model card describe el motor como deterministico, en contraste con la naturaleza estocastica de la decodificacion autorregresiva.

El autor no publica informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si hubo etapas de RLHF o DPO, por lo que estos extremos deben considerarse no disponibles. La innovacion tecnica destacable es la explicabilidad nativa: la distribucion de pesos de atencion sobre la secuencia proporciona directamente una puntuacion de saliencia por token o termino, sin necesidad de aproximaciones externas como SHAP o LIME. Se declara que la inferencia se ejecuta directamente en GPU Nvidia mediante Candle con backbone en BF16 y cabezas en F32.

## Capacidades

- Clasificacion de urgencia: salida binaria (`is_urgent`) acompanada de una puntuacion (`urgency_score`).
- Categorizacion y enrutado multi-clase: la model card menciona las categorias `Financeiro`, `Suporte Tecnico`, `Comercial` y `Seguranca`.
- Puntuacion de riesgo: score escalar continuo en el rango [0, 1].
- Extraccion de evidencia: lista de los top-k terminos de la oracion ordenados por atribucion de atencion.
- Explicabilidad integrada: la saliencia por token se obtiene de la propia distribucion de atencion, sin herramientas externas.
- Inferencia de baja latencia: 12-15 ms en GPU CUDA y 80-100 ms en CPU x86 con AVX-512.
- Integracion en Rust mediante Candle y `hf_hub`.
- Generacion de texto, razonamiento abierto, codigo, matematicas, vision, audio, tool calling y capacidades de agente multi-paso: no disponibles. La arquitectura no incorpora `lm_head`, por lo que no hay generacion autoregresiva.
- Soporte multilingue: no disponible.

## Casos de uso

- Guardrails para agentes de IA: el motor puede evaluar cada entrada o salida de un agente y devolver en menos de 15 ms un score de riesgo en [0, 1] junto con los terminos que motivan la decision, lo que permite bloquear o derivar la peticion con trazabilidad inmediata.
- Enrutado de tickets en atencion al cliente: las categorias `Financeiro`, `Suporte Tecnico`, `Comercial` y `Seguranca` de la model card encajan con un clasificador de triaje que asigna cada mensaje al equipo correspondiente antes de que intervenga un modelo generativo.
- Deteccion de urgencia en tiempo real: la salida booleana `is_urgent` y la `urgency_score` permiten priorizar colas de soporte o alertas operativas sin coste de generacion de tokens.
- Moderacion de contenido en pipelines de baja latencia: el score continuo de riesgo admite umbrales configurables y la lista de top-k terminos sirve como justificacion auditable de cada bloqueo.
- Enriquecimiento de registros en analitica de contact center: como clasificador determinista, permite etiquetar grandes volumenes de mensajes con una latencia predecible (80-100 ms por peticion en CPU), lo que facilita el escalado horizontal sin GPU.
- Prefiltrado antes de un LLM mayor: al resolver la clasificacion y el scoring en la propia maquina, reduce el numero de llamadas a modelos generativos y, con ello, el coste por peticion.
- Sistemas embebidos o de borde en Rust: al depender de Candle y funcionar en CPU x86 con AVX-512, puede desplegarse en entornos sin GPU siempre que se tolere la latencia de 80-100 ms.
- Auditoria y cumplimiento: la atribucion de atencion por termino proporciona una explicacion verificable por parte de un revisor humano en flujos regulados, sin necesidad de ejecutar explicadores post hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico rendimiento medido que aparece en la model card es de latencia:

| Hardware | Precision | Latencia media |
|---|---|---|
| NVIDIA GPU (CUDA) | BF16 / F32 | 12 – 15 ms |
| CPU x86 (AVX-512) | F32 | 80 – 100 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de aproximadamente 0,5B ocupa en torno a 1,0 GB en BF16 y unos 2,0 GB en F32; sumando cabezas y activaciones, una estimacion razonable es de 1,5 a 2,5 GB. Se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: cualquier GPU Nvidia con soporte CUDA y al menos 4 GB de VRAM; el autor reporta latencias medidas en GPU Nvidia sin especificar modelo concreto.
- Compatibilidad con GPU de consumo: si, cabe con holgura en tarjetas de gama media y alta (por ejemplo, series RTX 3060, 4060, 4090), dado el reducido tamano del backbone.
- Inferencia en CPU: soportada y medida en x86 con AVX-512, con 80-100 ms de latencia media.
- Opciones de despliegue: Candle (Rust) con `VarBuilder::from_mmaped_safetensors` y `hf_hub` para la descarga de `apyra_heads.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en la mayoria de esos casos no seria aplicable al no existir `lm_head` ni decodificacion autoregresiva.
- Throughput y latencia: solo se publica latencia (12-15 ms en GPU CUDA; 80-100 ms en CPU x86 AVX-512); no hay datos de throughput.
- Nota: los metadatos de HuggingFace indican un tamano de repositorio de 0,0 GB, por lo que conviene verificar la disponibilidad real de los ficheros de pesos antes de planificar un despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| mfourts/apyra-v2-qwen0.5b | Backbone ~0,5B mas cabezas (tamano no disponible) | no disponible (backbone 32.768 tokens) | Clasificacion con attentive pooling sobre backbone congelado | Apache 2.0 | Solo latencia (12-15 ms GPU; 80-100 ms CPU) |
| Qwen/Qwen2.5-0.5B | ~0,49B | 32.768 tokens | Transformer generativo con LM head | Apache 2.0 | Ampliamente evaluado por el autor del backbone; no comparable en tarea |
| microsoft/deberta-v3-base | 86M | 512 tokens | Transformer encoder para clasificacion | MIT | Resultados publicos en GLUE y tareas de clasificacion |
| microsoft/deberta-v3-small | 44M | 512 tokens | Transformer encoder para clasificacion | MIT | Resultados publicos en GLUE |

La comparacion con clasificadores encoder clasicos (DeBERTa-v3) es la mas pertinente en cuanto a tarea, pero no es posible contrastar calidad porque Apyra v2 no publica metricas de precision, recall, F1 ni evaluaciones sobre conjuntos de validacion. Tampoco se dispone de datos de modelos equivalentes que combinen backbone congelado y attentive pooling con explicabilidad nativa, por lo que la comparativa de rendimiento debe considerarse no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay metricas de exactitud, F1, calibracion ni evaluaciones por categoria, por lo que no es posible estimar su calidad real frente a un clasificador entrenado al efecto.
- Disponibilidad de pesos dudosa: el repositorio figura con 0 descargas, 0 likes y 0,0 GB de tamano, mientras la model card referencia `apyra_heads.safetensors`; conviene verificar que los pesos esten realmente subidos antes de integrarlo.
- Idiomas no declarados: no se especifica que lenguas soporta el clasificador. Las categorias de ejemplo estan en portugues (`Financeiro`, `Suporte Tecnico`, `Seguranca`), lo que sugiere un sesgo hacia ese idioma.
- Sesgos heredados del backbone: al congelar Qwen2.5-0.5B, el modelo arrastra los sesgos presentes en los datos de preentrenamiento de dicho backbone, no documentados en esta ficha.
- Explicabilidad no necesariamente fiel: los pesos de atencion son una senal de saliencia util, pero no equivalen a una atribucion causal garantizada; la propia literatura sobre interpretabilidad advierte de que la atencion no siempre refleja el razonamiento interno.
- Riesgo de alucinacion bajo en generacion: al no existir `lm_head`, el modelo no puede inventar texto libre; el riesgo se traslada a una clasificacion o un score mal calibrado, no a una salida textual falsa.
- Limitacion de contexto: la ventana efectiva depende del backbone y no se documenta; si se usa mas alla de lo que el backbone soporta, la representacion latente se degradara.
- Superficie funcional reducida: solo cuatro categorias de ejemplo y dos salidas binarias declaradas; cualquier otro etiquetado requeriria reentrenar cabezas y no hay documentacion sobre ese procedimiento.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del backbone Qwen2.5-0.5B, tambien Apache 2.0.
- Ausencia de soporte de herramientas habitual: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, y la libreria declarada (Candle) obliga a desplegar en Rust o a envolver el modelo.
- Determinismo declarado sin verificacion: la model card afirma que el motor es deterministico, pero no se aportan pruebas ni detalles sobre la gestion de la no determinabilidad en operaciones CUDA.
- Fecha de publicacion inusual: los metadatos indican creacion el 2026-09-28, dato que conviene contrastar con la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mfourts/apyra-v2-qwen0.5b
- Backbone referenciado en la model card: Qwen/Qwen2.5-0.5B (https://huggingface.co/Qwen/Qwen2.5-0.5B)
- Framework de inferencia declarado: Candle (https://github.com/huggingface/candle)
- Resultados de busqueda web: la busqueda realizada no devolvio ningun enlace relevante sobre el modelo; los unicos resultados obtenidos fueron paginas de ayuda de Gmail (support.google.com/mail), sin relacion con Apyra v2. No se dispone, por tanto, de paper, blog, repositorio adicional ni demo asociados.
