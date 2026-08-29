# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-135000

## Resumen

El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-135000` contiene un checkpoint concreto de un modelo de borrador (draft model) EAGLE3, entrenado en línea con la herramienta SpecForge para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es ser utilizado como ruta de borrador en un servidor de decodificación especulativa, generando secuencias de tokens candidatas que el modelo grande verifica en paralelo. Este checkpoint corresponde a la época 5, paso 135000, dentro de una colección de 47 checkpoints publicados por el mismo autor.

La relevancia de este modelo radica en que permite reducir la latencia de inferencia del Qwen3-4B-Instruct-2507 en entornos de producción, sin modificar los pesos del modelo principal. Al tratarse de un modelo de una sola capa con 202,7 millones de parámetros, su huella de memoria es mínima en comparación con el modelo objetivo de 4 mil millones. La licencia Apache 2.0 facilita su uso comercial y su integración en infraestructuras de servicio como SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (maxima de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo objetivo; ShareGPT original en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LlamaForCausalLMEagle3`, que es un diseño de borrador de una sola capa: hidden size de 2560, intermediate size de 9728, 32 cabezas de atencion, 8 cabezas clave/valor, vocabulario de borrador de 32000 tokens y vocabulario objetivo de 151936 tokens. Los pesos estan en bfloat16. La configuracion no define una ventana deslizante, como indica el sufijo `NoWindow` del nombre del repositorio.

El entrenamiento se realizo con el metodo online EAGLE3 implementado en SpecForge, sobre datos ShareGPT limpios (JSONL de origen local, sin registro de la revision exacta). Los hiperparametros principales incluyen 10 epocas, 231810 pasos de optimizacion, batch global efectivo de 4, tasa de aprendizaje de 1e-4 con warmup lineal del 1,5% y posterior decaimiento coseno, weight decay 0,0, gradiente maximo de 0,5, longitud maxima de secuencia de 2048, longitud TTT de 7, atencion de borrador con `sdpa` y backend objetivo SGLang con flashinfer. Este checkpoint concreto corresponde a la epoca 5, paso 135000. No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: genera multiples tokens candidatos en un solo paso, que el modelo objetivo verifica en paralelo.
- Compatibilidad exclusiva con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`; no funciona con otras variantes de la familia Qwen3.
- Integracion nativa con el backend SGLang mediante el algoritmo EAGLE3, parametros de borrador configurables (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`).
- Sin ventana deslizante: el modelo de borrador no impone restricciones de contexto adicionales al modelo objetivo.
- No es un modelo de generacion de texto autonomo: no puede generar respuestas por si mismo ni realizar tareas de razonamiento, codigo o matematicas.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Reduccion de latencia en servidores de chat en produccion: al desplegar SGLang con este draft model junto al Qwen3-4B-Instruct-2507, se acelera la generacion de respuestas en servicios de atencion al cliente o asistentes conversacionales, manteniendo la calidad del modelo grande.
- Optimizacion de costes por token: al requerir menos pasos de decodificacion autoregresiva, se reduce el tiempo de computo por peticion, lo que permite servir mas solicitudes con la misma infraestructura GPU.
- Evaluacion de estrategias de decodificacion especulativa: los 47 checkpoints de la coleccion permiten comparar el rendimiento de diferentes etapas de entrenamiento y seleccionar el punto optimo de convergencia para una carga de trabajo concreta.
- Despliegue en entornos con recursos limitados: el modelo de borrador ocupa aproximadamente 0,4 GB en bfloat16, pudiendo residir en la misma GPU que el modelo principal sin necesidad de hardware adicional.
- Investigacion sobre modelos de borrador: util para estudiar el efecto de la longitud TTT, el top-k de EAGLE y el numero de tokens de borrador sobre el ratio de aceptacion y la latencia final.
- Integracion en pipelines de inferencia existentes que ya usan SGLang: basta con especificar la ruta del checkpoint como `--speculative-draft-model-path` para activar la decodificacion especulativa sin cambios en el codigo de aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. Se recomienda realizar pruebas de latencia y throughput propias con la carga de trabajo objetivo antes de desplegar en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (202,7 millones de parametros). Con cuantizacion a 8 bits podria reducirse a unos 0,2 GB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el draft model junto al Qwen3-4B-Instruct-2507 en cuantizacion baja. Para el modelo objetivo completo se recomienda una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100 40 GB, H100).
- Compatibilidad con GPUs de consumo: si, el draft model cabe en GPUs como RTX 3060, RTX 4060, etc., aunque el rendimiento final dependera del modelo objetivo.
- Opciones de despliegue: SGLang (backend principal indicado por el autor), con soporte para flashinfer. No se proporcionan archivos GGUF ni configuraciones para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen del hardware, del modelo objetivo y de los parametros de borrador configurados (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este checkpoint (EAGLE3 draft) | 202,7 M | 2048 (entrenamiento) | Apache 2.0 | Borrador para Qwen3-4B-Instruct-2507 |
| EAGLE-1 draft para Qwen2 (referencia) | no disponible | no disponible | no disponible | Borrador para Qwen2 |
| Draft models de Medusa | no disponible | no disponible | no disponible | Borrador para diversos modelos base |

No se dispone de informacion suficiente para comparar directamente con otros draft models de la misma familia. La coleccion del autor incluye 47 checkpoints del mismo entrenamiento, lo que permite comparar internamente la evolucion del modelo de borrador a lo largo de los pasos de entrenamiento.

## Limitaciones y advertencias

- No es un modelo de chat autonomo: intentar usarlo directamente para generar texto producira resultados sin sentido. Debe emparejarse siempre con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- No se registraron metricas de evaluacion ni de seguridad: no hay evidencia de que el modelo de borrador introduzca sesgos adicionales, pero tampoco hay garantias de ausencia de comportamientos indeseados.
- El entrenamiento se realizo sobre datos ShareGPT, que pueden contener sesgos propios de conversaciones de internet. Ademas, el dataset original de ShareGPT ha eliminado datos no ingleses, por lo que el rendimiento del borrador en otros idiomas puede degradarse.
- La longitud maxima de secuencia de entrenamiento es 2048 tokens; aunque no hay ventana deslizante, el modelo de borrador no ha sido entrenado para secuencias mas largas y podria mostrar menor precision de prediccion en contextos extendidos.
- Los archivos `training_state.pt` incluidos en cada repositorio contienen estado de optimizador y argumentos de entrenamiento; deben deserializarse solo en entornos de confianza por riesgo de ejecucion de codigo malicioso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` tiene su propia licencia (Apache 2.0 segun su pagina), que debe verificarse antes de desplegar en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-135000
- Coleccion de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementacion oficial de EAGLE (referencia): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Pagina del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
