# mradermacher/PaperQwen3.5-4B-GGUF

## Resumen

PaperQwen3.5-4B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base PaperQwen3.5-4B, publicado por el usuario Thermostatic en Hugging Face. El repositorio lo mantiene mradermacher, conocido por generar y distribuir versiones cuantizadas de modelos recientes para su uso con llama.cpp y herramientas compatibles. El proposito del repositorio es exclusivamente de conversion y empaquetado: no introduce cambios en los pesos mas alla de la cuantizacion, y no anade capacidades nuevas.

El nombre del modelo sugiere un derivado de la familia Qwen3.5 con aproximadamente 4.000 millones de parametros, aunque el dato real de safetensors del repositorio indica 333.514.240 parametros totales, una cifra notablemente inferior a la que implicaria la nomenclatura. Esta discrepancia no se resuelve en la informacion disponible y conviene verificarla antes de cualquier uso en produccion. El modelo base no incluye model card detallada en los datos proporcionados, por lo que faltan especificaciones sobre arquitectura, entrenamiento y licencia.

La relevancia de este repositorio es practica: ofrece los pesos en multiples niveles de cuantizacion (desde Q2_K hasta F16, incluyendo IQ4_XS y variantes K), lo que permite desplegar el modelo en hardware con recursos limitados mediante llama.cpp u Ollama. Ahora bien, la ausencia de documentacion del modelo original, de licencia declarada y de benchmarks publicados limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen3.5, sin confirmar) |
| Parametros totales | 333.514.240 (dato de safetensors del repositorio) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base PaperQwen3.5-4B en los datos proporcionados. El nombre sugiere una adaptacion o finetune de un modelo de la familia Qwen3.5, probablemente un transformer decoder-only, pero no hay confirmacion en la model card ni en los metadatos del repositorio. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El repositorio en si no aporta informacion de entrenamiento: es un artefacto de cuantizacion generado con la herramienta de mradermacher (se observan metadatos como `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`). La unica innovacion tecnica reseñable es la propia conversion a GGUF con cuantizaciones K-quants e i-quants, que reducen el peso del modelo manteniendo una calidad razonable para inferencia en CPU y GPU de gama baja.

## Capacidades

- Generacion de texto autoregresiva, segun el comportamiento esperado de un modelo de la familia Qwen, aunque no confirmado en la documentacion disponible.
- Razonamiento y codigo: no disponible (no hay benchmarks ni descripcion de capacidades del modelo base).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia en CPU y GPU de gama baja gracias a las cuantizaciones GGUF incluidas.

## Casos de uso

- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en equipos con poca VRAM o incluso solo CPU mediante llama.cpp, lo que facilita prototipado local sin infraestructura dedicada.
- Pruebas de concepto en portatiles: la variante Q4_K_S o Q3_K_M puede cargarse en GPUs consumer modestas para experimentar con generacion de texto antes de invertir en modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir la degradacion de calidad frente al coste de memoria en un mismo modelo base.
- Integracion en Ollama o LM Studio: al ser GGUF, el modelo puede importarse directamente en estas herramientas para asistentes locales de escritorio.
- Pipelines de investigacion sobre cuantizacion: util para estudiar el impacto de Q2_K, IQ4_XS o Q8_0 en tareas concretas de generacion, siempre que se valide previamente el modelo base.
- Fine-tuning ligero sobre el modelo original: los pesos en safetensors del repo base (Thermostatic/PaperQwen3.5-4B) pueden servir como punto de partida para adaptaciones con LoRA, aunque la licencia no declarada supone un riesgo legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y los 333,5 M de parametros reportados):
  - F16: en torno a 0,7 GB de pesos mas overhead de contexto.
  - Q8_0: en torno a 0,4 GB.
  - Q4_K_M: en torno a 0,25 GB.
  - Q2_K: en torno a 0,15 GB.
  - Nota: si el modelo real tuviera ~4.000 M de parametros como sugiere el nombre, estas cifras se multiplicarian por un factor cercano a 12.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre para las cuantizaciones bajas; RTX 3060, RTX 4060 o superiores son suficientes en el escenario de 333 M. Para el escenario de 4 B, se recomendaria RTX 3060 12 GB o superior.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con las cuantizaciones Q4 y Q5, asumiendo el recuento real de parametros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PaperQwen3.5-4B-GGUF (este) | 333,5 M (reportado) | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-3B-Instruct-GGUF | 3.090 M | 32.768 tokens | Apache 2.0 | GGUF | Hugging Face |
| Llama-3.2-3B-Instruct-GGUF | 3.210 M | 131.072 tokens | Llama 3.2 Community License | GGUF | Hugging Face |
| Phi-3.5-mini-instruct-GGUF | 3.820 M | 131.072 tokens | MIT | GGUF | Hugging Face |

La comparativa es orientativa: el modelo de este repositorio no declara licencia ni contexto, y su recuento real de parametros difiere del que sugiere el nombre, por lo que la equivalencia con las alternativas no puede confirmarse.

## Limitaciones y advertencias

- Ausencia total de model card del modelo base: no hay informacion sobre datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad.
- Discrepancia entre el nombre ("4B") y el recuento real de parametros (333,5 M): puede tratarse de un error de publicacion, de un modelo destilado o de un checkpoint parcial; debe verificarse antes de usarlo.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni pruebas de fidelidad, no puede descartarse un comportamiento deficiente en tareas factuales.
- Licencia no declarada: no se autoriza explicitamente el uso comercial ni se especifican restricciones; usar en produccion sin aclarar la licencia es un riesgo legal.
- Idiomas no declarados: no puede asumirse soporte de castellano ni de otros idiomas sin pruebas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad en modelos pequenos; para produccion se recomienda Q4_K_M o superior.
- Sin garantias de mantenimiento: el repositorio fue creado y actualizado el mismo dia, sin historial posterior.
- No apto para decisiones automatizadas de alto riesgo sin una evaluacion previa exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PaperQwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Thermostatic/PaperQwen3.5-4B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Herramienta de cuantizacion de referencia (llama.cpp): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
