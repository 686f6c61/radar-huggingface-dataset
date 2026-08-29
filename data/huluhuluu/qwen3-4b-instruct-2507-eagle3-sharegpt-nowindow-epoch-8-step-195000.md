# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-195000

## Resumen

Este repositorio contiene un checkpoint del modelo de borrador (draft model) EAGLE3 entrenado con SpecForge para acelerar la inferencia del modelo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa. No es un modelo de chat independiente: su única función es predecir tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia de generación en servidores de inferencia.

El autor, huluhuluu, publica 47 checkpoints de un entrenamiento online con SpecForge sobre datos ShareGPT limpios, abarcando desde el paso 5.000 hasta el paso 231.810. Este checkpoint concreto corresponde al paso 195.000 de la época 8. La arquitectura es una variante EAGLE3 de una única capa decoder con 202,7 millones de parámetros, diseñada específicamente para integrarse con SGLang y el backend flashinfer.

La relevancia de este modelo radica en que permite reducir la latencia de Qwen3-4B-Instruct-2507 en entornos de producción sin degradar la calidad de las respuestas, ya que el modelo objetivo sigue siendo el responsable final de la generación. Al ser un draft model, su despliegue es complementario y no sustituye al modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (maxima secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (dataset ShareGPT, probablemente ingles, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura `LlamaForCausalLMEagle3` con una sola capa decoder, hidden size de 2560, intermediate size de 9728, 32 cabezas de atencion y 8 cabezas key/value. El vocabulario de borrador es de 32.000 tokens, mientras que el vocabulario objetivo del modelo base es de 151.936. Los pesos estan en bfloat16 y no se aplica ventana deslizante.

El entrenamiento se realizo con el metodo EAGLE3 online implementado en SpecForge, usando datos ShareGPT limpios en formato JSONL. Los hiperparametros incluyen una tasa de aprendizaje de 1e-4 con warmup lineal del 1,5% y posterior annealing coseno, batch efectivo de 4, longitud maxima de secuencia de 2048 tokens y longitud TTT de EAGLE3 de 7. El entrenamiento completo consta de 10 epocas y 231.810 pasos de optimizador, con guardado de checkpoints cada 5.000 pasos. No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa para el modelo objetivo `Qwen3-4B-Instruct-2507`.
- Generacion de multiples tokens candidatos en paralelo (arboles de borrador) que el modelo objetivo verifica en un solo paso.
- Integracion nativa con SGLang mediante el algoritmo EAGLE3 y backend flashinfer.
- Soporte de configuracion de arbol de borrador ajustable: numero de pasos especulativos, top-k y numero de tokens de borrador.
- No es un modelo de generacion de texto autonomo; no puede usarse como chat o modelo de lenguaje independiente.
- No soporta tool calling, razonamiento multi-paso ni capacidades multilingues por si mismo.

## Casos de uso

- Despliegue en produccion de Qwen3-4B-Instruct-2507 con SGLang: el modelo se carga como ruta de borrador especulativo (`--speculative-draft-model-path`) para reducir la latencia de generacion en servidores de inferencia.
- Optimizacion de costes de servidores LLM: al reducir el numero de pasos secuenciales del modelo objetivo, se disminuye el tiempo de computacion por peticion y se aumenta el throughput del servidor.
- Evaluacion de configuraciones EAGLE3: los 47 checkpoints permiten comparar el impacto del paso de entrenamiento en la calidad del borrador y ajustar los hiperparametros del arbol (num-steps, topk, num-draft-tokens) para una carga de trabajo especifica.
- Benchmarking de decodificacion especulativa: util para medir la aceleracion real frente a la generacion autoregresiva clasica en distintos workloads (chat, codigo, matematica).
- Investigacion sobre modelos de borrador: el repositorio incluye `training_state.pt` con estado de optimizador y argumentos de entrenamiento, lo que permite reanudar entrenamientos o analizar el proceso de SpecForge.
- Integracion en pipelines de serving con endpoints compatibles con text-generation-inference: el modelo esta marcado como compatible con endpoints de HuggingFace, facilitando su uso en infraestructuras gestionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no se registraron metricas de evaluacion ni de seguridad durante el entrenamiento". Se recomienda que cada usuario mida la aceleracion en su propio hardware y carga de trabajo, ya que el rendimiento de la decodificacion especulativa depende del patron de generacion, el batch size y la configuracion del arbol de borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (tamano del repo de 0,4 GB), lo que lo hace desplegable en cualquier GPU con al menos 1 GB de VRAM libre.
- GPU recomendadas: cualquier GPU consumer (RTX 3060 o superior) o GPU de datacenter (A10, A100, H100) que ya este ejecutando el modelo objetivo.
- No requiere GPU dedicada: puede compartir VRAM con el modelo objetivo en el mismo dispositivo, aunque para minimizar latencia se recomienda alojarlo en la misma GPU que el modelo principal.
- Opciones de despliegue: SGLang con backend flashinfer (configuracion oficial), y potencialmente otros frameworks que soporten EAGLE3 si se adapta el formato.
- Latencia y throughput: no disponibles; dependen de la configuracion del arbol especulativo y del hardware. Los valores de partida sugeridos son `--speculative-num-steps 3`, `--speculative-eagle-topk 1` y `--speculative-num-draft-tokens 4`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modelo objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT (este) | 202,7 M | 2048 | Qwen3-4B-Instruct-2507 | Apache-2.0 | HuggingFace |
| Qwen3-4B-Instruct-2507-Eagle3 (MNN) | no disponible | no disponible | Qwen3-4B-Instruct-2507 | no disponible | ModelScope |
| Draft models EAGLE-1/EAGLE-2 para Qwen2 | ~200 M tipico | 2048 | Qwen2-7B/14B | Apache-2.0 | GitHub, HuggingFace |

La comparativa es limitada porque los draft models EAGLE3 son especificos del modelo objetivo. La alternativa de MNN en ModelScope cumple la misma funcion, pero no se dispone de sus parametros exactos. Los modelos EAGLE de generaciones anteriores (EAGLE-1/2) usan arquitecturas similares pero estan orientados a la familia Qwen2.

## Limitaciones y advertencias

- No es un modelo de chat: cualquier uso como modelo standalone generara resultados sin sentido. Debe emparejarse obligatoriamente con `Qwen/Qwen3-4B-Instruct-2507`.
- Datos de entrenamiento en ShareGPT y sin ventana deslizante: la calidad del borrador puede degradarse en idiomas distintos del ingles o en dominios muy diferentes a los datos de entrenamiento.
- Sin evaluacion de seguridad: la model card no reporta metricas de sesgo, toxicidad o alucinacion. No se recomienda su uso en aplicaciones donde la seguridad del contenido sea critica sin una evaluacion adicional.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza, ya que puede ejecutar codigo arbitrario.
- La longitud de contexto de entrenamiento es de 2048 tokens; aunque el modelo objetivo soporta contextos mayores, el borrador puede no predecir bien tokens mas alla de esa ventana.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0) que debe verificarse para el uso final.
- El rendimiento de aceleracion no esta garantizado: en workloads con patrones de generacion muy impredecibles, la tasa de aceptacion del borrador puede ser baja y la sobrecarga del arbol puede superar el beneficio.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-195000
- Coleccion de los 47 checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Ejemplo de checkpoint hermano: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Implementacion oficial de EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo objetivo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Variante EAGLE3 de MNN en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
