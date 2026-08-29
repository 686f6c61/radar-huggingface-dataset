# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-65000

## Resumen

Este repositorio contiene un **draft model** para decodificación especulativa, no un modelo de chat independiente. Ha sido entrenado con el método **EAGLE3** en modo online mediante la herramienta **SpecForge**, tomando como modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Su función es generar secuencias de tokens candidatos que aceleren la inferencia del modelo grande, reduciendo la latencia por token generado en entornos de servicio como SGLang.

El modelo tiene **202,7 millones de parámetros** (una décima parte del modelo objetivo) y una arquitectura ligera de una sola capa decoder con atención causal de ventana deslizante de 512 tokens. Se entrenó durante 10 épocas sobre un dataset ShareGPT limpio, con un máximo de 2048 tokens de secuencia. Es relevante para equipos que despliegan Qwen3-4B-Instruct-2507 en producción y necesitan reducir costes de inferencia sin cambiar el modelo final.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No se han publicado métricas de evaluación ni de seguridad en la model card, por lo que su rendimiento real debe validarse en el entorno de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, 32 cabezas de atencion, 8 cabezas K/V) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (entrenamiento); ventana deslizante de 512 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se mencionan otras |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura **EAGLE3**, un esquema de decodificación especulativa que entrena un modelo auxiliar para predecir los tokens que generará el modelo objetivo. En este caso, el draft model tiene una única capa decoder con tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas clave/valor, con vocabulario de 32.000 tokens (frente a los 151.936 del modelo objetivo). La atención es causal con ventana deslizante de 512 tokens, lo que limita el contexto que el draft puede considerar al generar candidatos.

El entrenamiento se realizó de forma **online**, es decir, mientras se ejecutaba el modelo objetivo en SGLang con backend FlashInfer. Se usó un dataset ShareGPT limpio (sin versión registrada), con 10 épocas, 231.810 pasos de optimización, batch efectivo de 4, learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno. El parámetro TTT (test-time training) de EAGLE3 se fijó en 7 tokens. No se aplicó regularización de pesos (weight decay 0) y el gradiente máximo se limitó a 0,5. El repositorio contiene 47 checkpoints desde el paso 5.000 hasta el 231.810, cada uno publicado como repositorio independiente en la colección asociada.

## Capacidades

- **Decodificación especulativa**: genera hasta 512 tokens candidatos en paralelo para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`, permitiendo verificar múltiples tokens por paso de inferencia.
- **Integración con SGLang**: diseñado para usarse como ruta de draft en SGLang con configuración EAGLE3, aprovechando el backend FlashInfer.
- **Bajo coste de memoria**: al tener solo 202,7M de parámetros en bf16, ocupa aproximadamente 0,4 GB, siendo despreciable frente al modelo base.
- **Sin capacidades propias de generación**: no es un modelo de chat, no soporta tool calling, ni razonamiento autónomo, ni generación de código por sí mismo.
- **Multilingüismo heredado**: al depender del modelo base, las capacidades lingüísticas son las de Qwen3-4B-Instruct-2507, aunque no se han validado específicamente para este draft.

## Casos de uso

- **Reducción de latencia en servicios de chat**: al desplegar Qwen3-4B-Instruct-2507 con SGLang, este draft model permite generar entre 2 y 3 tokens por paso de decodificación, reduciendo el tiempo de respuesta percibido en aplicaciones conversacionales.
- **Optimización de costes por petición**: en entornos con alta concurrencia, la aceleración de la decodificación disminuye el tiempo de ocupación de la GPU, permitiendo atender más peticiones con el mismo hardware.
- **Sistemas de agentes con múltiples pasos**: cuando se ejecutan cadenas de razonamiento o llamadas a herramientas secuenciales, la reducción de latencia por paso acelera el tiempo total de ejecución del agente.
- **Despliegue en infraestructura limitada**: al ser un modelo pequeño, puede ejecutarse en la misma GPU que el modelo base sin apenas coste adicional de VRAM, facilitando su adopción en entornos con recursos ajustados.
- **Ajuste fino del árbol de verificación**: los desarrolladores pueden experimentar con diferentes configuraciones del árbol de tokens especulativos (tree settings) para encontrar el equilibrio óptimo entre tasa de aceptación y sobrecarga de cálculo.
- **Investigación en decodificación especulativa**: sirve como punto de partida para estudiar el impacto de la ventana deslizante y la longitud TTT en la calidad de los candidatos, comparando los 47 checkpoints disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run". Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni métricas de tasa de aceptación de tokens especulativos.

## Requisitos de hardware

- **VRAM para el draft model**: aproximadamente 0,4 GB en bf16 (202,7M parámetros × 2 bytes). Cabe en cualquier GPU con al menos 1 GB de memoria libre.
- **VRAM total del sistema**: al ser un componente de decodificación especulativa, se debe sumar la VRAM del modelo base Qwen3-4B-Instruct-2507 (unos 8-9 GB en bf16). El conjunto requiere al menos 10-12 GB, por lo que cabe en GPUs de consumo como RTX 3090, RTX 4090 o A5000.
- **GPUs recomendadas**: cualquier GPU compatible con SGLang y FlashInfer, incluyendo A100, H100, L40S y RTX 4090 (con precaución por el soporte de FlashInfer en arquitecturas consumer).
- **Opciones de despliegue**: SGLang con backend FlashInfer es el único entorno validado según la model card. No se menciona soporte para vLLM, llama.cpp ni Ollama.
- **Latencia y throughput**: no disponibles. Dependen de la configuración del árbol de verificación, el hardware y la carga de trabajo.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar este draft model con alternativas. La propia colección del autor incluye otros checkpoints de la misma serie (por ejemplo, `epoch-7-step-185000` o `epoch-1-step-30000`), pero no hay métricas publicadas que permitan establecer diferencias de rendimiento entre ellos. Como referencia genérica, los draft models de EAGLE3 suelen lograr tasas de aceptación del 60-80% en modelos de la familia Qwen, pero este dato no está verificado para este entrenamiento concreto.

## Limitaciones y advertencias

- **No es un modelo independiente**: debe usarse exclusivamente como draft para `Qwen/Qwen3-4B-Instruct-2507`. Emparejarlo con otro modelo objetivo producirá resultados incorrectos.
- **Ventana deslizante de 512 tokens**: el draft solo considera los últimos 512 tokens de contexto, lo que puede degradar la calidad de los candidatos en conversaciones muy largas.
- **Sin métricas de seguridad**: no se registraron evaluaciones de sesgos, toxicidad o alucinación. Su uso en producción requiere validación adicional por parte del equipo desplegador.
- **Dependencia de SGLang**: la integración está probada solo con SGLang y FlashInfer; otros frameworks pueden no soportar este formato de draft model.
- **Archivo `training_state.pt`**: contiene el estado del optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza, ya que puede ejecutar código arbitrario.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 también, según la información proporcionada). Verificar los términos del modelo base antes del despliegue.

## Enlaces

- Repositorio principal: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-65000
- Checkpoint alternativo (epoch 7): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint alternativo (epoch 1): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Repositorio oficial de EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
