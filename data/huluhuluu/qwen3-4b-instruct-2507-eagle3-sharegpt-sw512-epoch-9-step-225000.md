# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-225000

## Resumen

Este repositorio contiene un modelo de draft (borrador) para decodificación especulativa EAGLE3, entrenado de forma online con la herramienta SpecForge sobre el modelo objetivo Qwen/Qwen3-4B-Instruct-2507. El autor, huluhuluu, publica un checkpoint concreto (epoch 9, paso 225000) de una serie de 47 puntos de control que abarcan desde epoch 0 hasta epoch 9. Su función no es la de un modelo de chat independiente, sino la de acelerar la inferencia del modelo base mediante la generación anticipada de tokens candidatos que el modelo objetivo verifica en paralelo.

Arquitectónicamente se trata de un modelo `LlamaForCausalLMEagle3` con una única capa decodificadora, 202,7 millones de parámetros y atención causal con ventana deslizante de 512 tokens. Está pensado para usarse como ruta de draft en SGLang con el backend de inferencia flashinfer. Su relevancia radica en que permite reducir la latencia de despliegue de Qwen3-4B-Instruct-2507 en entornos de producción, un modelo de 4 000 millones de parámetros que de otro modo generaría token a token de forma secuencial. La licencia Apache 2.0 facilita su uso comercial y su integración en infraestructuras existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decodificadora, EAGLE3) |
| Parametros totales | 202 700 416 (202,7 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 (maximo de entrenamiento); ventana de draft de 512 tokens |
| Tipos de cuantizacion | bfloat16 (pesos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No documentado; datos ShareGPT predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, training_state.pt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una familia de modelos de draft para decodificación especulativa. En este caso concreto, consta de una sola capa decodificadora con tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con atención causal de ventana deslizante limitada a 512 tokens. El vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo del modelo Qwen3-4B-Instruct-2507 es de 151936 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizó de forma online con SpecForge, un método de entrenamiento de draft models que actualiza los pesos durante la propia generación especulativa. Los datos de entrenamiento provienen de un dataset ShareGPT limpio (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimizador, tamaño de lote por dispositivo de 1, paralelismo de datos de 4 (tamaño de lote global efectivo 4), tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno, sin weight decay y con norma de gradiente máxima de 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una longitud TTT (test-time training) de EAGLE3 de 7 tokens. El backend objetivo fue SGLang con flashinfer y paralelismo tensorial de tamaño 1.

## Capacidades

- Decodificación especulativa: genera multiples tokens candidatos en un solo paso forward, que el modelo objetivo Qwen3-4B-Instruct-2507 verifica en paralelo, reduciendo el numero de pasos de autoatencion.
- Integracion con SGLang: disenado para usarse como ruta de draft en SGLang con el backend flashinfer, mediante los ajustes de EAGLE3 que soporta esa version.
- Ventana de draft limitada: la atencion causal de ventana deslizante de 512 tokens limita la memoria de contexto del draft, lo que reduce el coste computacional por token.
- No es un modelo de chat autonomo: no genera respuestas completas por si mismo, sino que propone continuaciones que el modelo base acepta o rechaza.
- Soporte de tool calling, agentes y razonamiento multi-paso: no aplica directamente, ya que esas capacidades residen en el modelo objetivo, no en el draft.
- Capacidades multilingues: no documentadas; el dataset ShareGPT filtrado suele ser mayoritariamente ingles.

## Casos de uso

- Reduccion de latencia en servicios de chat basados en Qwen3-4B-Instruct-2507: al desplegar este draft junto al modelo objetivo en SGLang, se pueden servir mas peticiones por segundo con la misma GPU, ya que el draft propone varios tokens por paso y el modelo objetivo los verifica en paralelo.
- Despliegue en entornos de tiempo real: aplicaciones de asistente conversacional o atencion al cliente que requieren respuestas con baja latencia percibida se benefician directamente de la aceleracion especulativa.
- Optimizacion de costes de GPU: al reducir el numero de pasos de generacion secuenciales, se reduce el tiempo de ocupacion de la GPU, lo que permite usar instancias mas pequenas o servir mas usuarios con el mismo hardware.
- Investigacion en decodificacion especulativa: este checkpoint, junto con los otros 46 publicados por el autor, sirve como material de estudio para analizar como evoluciona la calidad del draft a lo largo del entrenamiento online.
- Integracion en pipelines de inferencia existentes con SGLang: cualquier infraestructura que ya use SGLang con Qwen3-4B-Instruct-2507 puede incorporar este draft como un cambio de configuracion, sin modificar la logica de la aplicacion.
- Benchmarking de configuraciones de arbol de draft: los parametros del arbol de decodificacion especulativa (ancho, profundidad, criterios de aceptacion) pueden ajustarse y medirse con este checkpoint para encontrar la configuracion optima para cada carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente en la model card: "No evaluation or safety metrics were recorded for this run". No se proporcionan valores de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput. Cualquier dato de rendimiento deberia obtenerse mediante pruebas propias con la configuracion de SGLang y el modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft model ocupa aproximadamente 405 MB en bfloat16 (202,7 M parametros x 2 bytes). Junto al modelo objetivo Qwen3-4B-Instruct-2507 en bf16 (unos 8 GB), el par completo requiere unos 8,5-9 GB de VRAM. Si el modelo objetivo se cuantiza a 4 bits (unos 2,5 GB), el total baja a unos 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el par completo en bf16 (por ejemplo, RTX 3060, RTX 4060, A10, L4). Para cargas de produccion con alta concurrencia, se recomienda A100, H100 o L40S.
- Compatibilidad con GPU de consumo: si, el draft model cabe en cualquier GPU moderna con mas de 1 GB de VRAM; el limite lo pone el modelo objetivo.
- Opciones de despliegue: SGLang con backend flashinfer (el unico backend documentado). No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput estimados: no disponibles. Dependen de la configuracion del arbol de draft, del hardware y de la carga de trabajo. El autor recomienda medir los ajustes de arbol para cada entorno.

## Comparativa con modelos similares

No se dispone de datos publicados de otros draft models EAGLE3 especificos para Qwen3-4B-Instruct-2507 con los que comparar directamente. La unica referencia comparable es el proyecto EAGLE-Qwen3 (repositorio oficial de EAGLE-1/2 para la familia Qwen), que entrena draft models para Qwen2 y Qwen3, pero no se han publicado metricas de rendimiento de este checkpoint concreto. El modelo base Qwen3-4B-Instruct-2507 sin decodificacion especulativa sirve como punto de referencia de latencia: la ventaja del draft depende del ratio de aceptacion, que no esta documentado. Se recomienda realizar pruebas propias con SGLang para cuantificar la ganancia real.

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este draft (EAGLE3) | 202,7 M | 512 (ventana draft) | Apache 2.0 | Aceleracion especulativa |
| Qwen3-4B-Instruct-2507 (objetivo) | 4 000 M | 32 768 (segun documentacion de Qwen) | Apache 2.0 | Chat e instruccion |
| Draft models EAGLE-Qwen3 (referencia) | No publicado | No publicado | No publicado | Aceleracion especulativa |

## Limitaciones y advertencias

- No es un modelo autonomo: no genera texto por si mismo; requiere emparejarse con Qwen/Qwen3-4B-Instruct-2507 exactamente, y no funcionara con otros modelos de la familia Qwen3.
- Sin metricas de evaluacion: el autor no registro ninguna metrica de seguridad ni de calidad durante el entrenamiento; no se puede garantizar la ausencia de sesgos o alucinaciones en las propuestas del draft.
- Sesgo de datos: el dataset ShareGPT filtrado es predominantemente ingles, lo que puede reducir la eficacia del draft en otros idiomas.
- Ventana de draft limitada: la atencion de ventana deslizante de 512 tokens puede degradar la calidad de las propuestas en contextos muy largos, aunque el modelo objetivo maneje ventanas mayores.
- training_state.pt: este archivo contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podria ejecutar codigo arbitrario.
- Sin garantias de produccion: al no haber benchmarks ni pruebas de estabilidad, se recomienda validar exhaustivamente antes de usar en entornos criticos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo objetivo Qwen3-4B-Instruct-2507 tambien esta bajo Apache 2.0, por lo que no hay conflictos de licencia conocidos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-225000
- Checkpoint epoch 3 paso 75000 (misma serie): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Checkpoint epoch 2 paso 50000 (misma serie): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3 (implementacion de EAGLE-1/2 para Qwen): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Documentacion de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
