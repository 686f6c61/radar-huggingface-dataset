# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-160000

## Resumen

Este repositorio contiene un checkpoint concreto del modelo de borrador (draft model) EAGLE3 entrenado en línea con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se trata del paso 160000 de la época 6 de un run de 10 épocas y 231810 pasos. No es un modelo de chat independiente: su única función es generar candidatos de tokens para acelerar la decodificación especulativa del modelo base, reduciendo la latencia y aumentando el throughput en servidores de inferencia.

El modelo fue publicado por el usuario `huluhuluu` y forma parte de una colección de 47 checkpoints publicados como repositorios separados. Su arquitectura es `LlamaForCausalLMEagle3`, una única capa decoder con 202,7 millones de parámetros, y está pensado para usarse exclusivamente con SGLang y el backend `flashinfer`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que la decodificación especulativa es una técnica clave para abaratar la inferencia de modelos grandes en producción. Al ser un draft model pequeño y rápido, permite que el modelo objetivo de 4B genere tokens con menor latencia, algo especialmente útil en aplicaciones interactivas o de alto volumen de peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (maxima de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | bfloat16 (pesos publicados) |
| Idiomas soportados | No disponible (entrenado con ShareGPT, que excluye datos no ingleses) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, un esquema de decodificación especulativa que utiliza una única capa de transformer ligera como borrador. En este caso, la capa tiene un tamaño oculto de 2560, un tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del borrador es de 32000 tokens, mientras que el vocabulario objetivo es de 151936, lo que permite al borrador proponer tokens del vocabulario completo del modelo base.

El entrenamiento se realizó con SpecForge en modo online, utilizando datos ShareGPT limpiados en formato JSONL. Los parámetros clave del run incluyen una tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior annealing coseno, sin weight decay, y una longitud máxima de secuencia de 2048 tokens. El entrenamiento usó un tamaño de lote efectivo de 4 con paralelismo de datos de 4 y acumulación de gradiente de 1. El mecanismo EAGLE3 TTT (test-time training) se configuró con longitud 7, y la atención del borrador usa `sdpa`. No se registraron métricas de evaluación ni de seguridad en el run.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa del modelo `Qwen/Qwen3-4B-Instruct-2507`.
- Aceleración de la inferencia mediante el algoritmo EAGLE3, reduciendo el número de pasos de autoregresión del modelo objetivo.
- Integración nativa con SGLang a través del parámetro `--speculative-algorithm EAGLE3` y la ruta del checkpoint.
- Soporte de configuración de árbol de borrador (topk, número de pasos y tokens de borrador) ajustable para optimizar el rendimiento según la carga de trabajo.
- No es un modelo de chat, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Servidor de inferencia de alto rendimiento: desplegar SGLang con este draft model como ruta especulativa para servir `Qwen3-4B-Instruct-2507` a usuarios finales, reduciendo la latencia por token en entornos con alta concurrencia.
- Reducción de costes en APIs de chat: al acelerar la generación del modelo base, se puede servir más peticiones por segundo con la misma GPU, disminuyendo el coste por token.
- Aplicaciones interactivas en tiempo real: asistentes conversacionales o chatbots que requieren respuestas rápidas (< 1 segundo) se benefician de la menor latencia de la decodificación especulativa.
- Optimización de infraestructura en GPUs limitadas: el draft model ocupa solo 0,4 GB, por lo que puede cargarse junto al modelo base en GPUs con VRAM ajustada (por ejemplo, RTX 3090 o A10), mejorando el throughput sin necesidad de hardware adicional.
- Pruebas de rendimiento de decodificación especulativa: investigadores pueden evaluar el impacto del número de pasos de borrador, topk y otros hiperparámetros sobre la aceleración real en distintas cargas de trabajo.
- Despliegue en entornos de producción con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run." Por tanto, no hay datos de aceleración real, latencia o throughput comparados con otros draft models.

## Requisitos de hardware

- El checkpoint del draft model pesa 0,4 GB en bfloat16, por lo que cabe en cualquier GPU moderna (incluso en GPUs integradas o de gama baja).
- Para la inferencia completa se necesita cargar tanto el draft model como el modelo objetivo `Qwen3-4B-Instruct-2507`. El objetivo en bf16 ocupa aproximadamente 8 GB, más el espacio del draft (0,4 GB) y el caché KV. Se recomienda al menos 12 GB de VRAM para trabajar cómodamente.
- GPUs recomendadas: RTX 3090/4090 (24 GB), A10 (24 GB), A100 (40 GB o más), H100 (80 GB). En GPUs con 16 GB (por ejemplo, RTX 4080) es posible pero ajustado.
- Opciones de despliegue: SGLang (con `flashinfer`), que es el backend objetivo. También puede usarse con vLLM si se implementa el soporte EAGLE3, aunque no está documentado en este repositorio.
- Latencia y throughput estimados: no disponibles, ya que no se registraron métricas en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `Qwen3-4B-Instruct-2507` (modelo base) | Modelo de lenguaje instruct | 4B aprox. | 256K (según documentación del fabricante) | Apache 2.0 | Generación de texto, chat, código |
| `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-160000` | Draft model EAGLE3 | 202,7M | 2048 (entrenamiento) | Apache 2.0 | Decodificación especulativa del modelo base |

No se dispone de datos de otros draft models comparables (por ejemplo, los entrenados para Qwen2 en el repositorio EAGLE-Qwen3) para realizar una comparativa cuantitativa. La comparación relevante es entre el draft model y el modelo base: el primero es ~20 veces más pequeño, lo que permite proponer tokens rápidamente, pero no genera texto de forma autónoma.

## Limitaciones y advertencias

- Este es un modelo de borrador, no un modelo de chat. No debe usarse para generar respuestas directas a usuarios.
- No se registraron métricas de evaluación ni de seguridad durante el entrenamiento. No hay garantía de que los tokens propuestos sean siempre correctos o seguros.
- El entrenamiento se realizó con datos ShareGPT, que según el repositorio oficial de EAGLE-Qwen3 excluye datos no ingleses. Por tanto, el draft model puede tener un rendimiento subóptimo en idiomas distintos del inglés.
- La longitud máxima de secuencia durante el entrenamiento fue de 2048 tokens. Aunque el modelo objetivo soporta contextos más largos, el draft model no fue entrenado para secuencias mayores y su rendimiento podría degradarse.
- El checkpoint es específico para el paso 160000 de la época 6. Usar un checkpoint incorrecto (por ejemplo, de otra época o paso) puede provocar incompatibilidades con el modelo objetivo.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento. Solo debe deserializarse en un entorno de confianza, ya que podría contener código arbitrario.
- No hay garantía de aceleración en todos los escenarios. El beneficio de la decodificación especulativa depende de la tasa de aceptación de tokens, que varía según la tarea y la distribución de datos.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-160000
- Colección de checkpoints EAGLE3 para Qwen3-4B-Instruct-2507: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3 (implementación de EAGLE-1 y EAGLE-2): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página de Qualcomm AI Hub para Qwen3-4B-Instruct-2507: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
