# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-190000

## Resumen

Este repositorio contiene un checkpoint concreto (`epoch-8-step-190000`) de un modelo borrador (draft model) EAGLE3 entrenado con SpecForge para el modelo de lenguaje Qwen/Qwen3-4B-Instruct-2507. No es un modelo de chat independiente: su única función es servir como componente de decodificación especulativa dentro del runtime SGLang, acelerando la generación del modelo objetivo sin modificar su salida.

El modelo fue desarrollado por el usuario huluhuluu y publicado bajo licencia Apache-2.0. Arquitectónicamente es un `LlamaForCausalLMEagle3` con una única capa decoder, 202,7 millones de parámetros y pesos en `bfloat16`. El entrenamiento se realizó con datos ShareGPT limpiados, durante 10 épocas y 231.810 pasos de optimización, con una longitud máxima de secuencia de 2048 tokens y sin ventana deslizante. Este checkpoint forma parte de una colección de 47 checkpoints guardados cada 5000 pasos, y está pensado para ser emparejado exclusivamente con la familia exacta del modelo objetivo.

La relevancia de este modelo radica en su utilidad práctica para reducir la latencia de inferencia en despliegues productivos de Qwen3-4B-Instruct-2507. Al ser un draft model ligero (apenas 0,4 GB), puede ejecutarse en paralelo con el modelo principal y proponer secuencias de tokens que el modelo objetivo verifica en bloque, logrando aceleraciones típicas de 2 a 3 veces en decodificación autoregresiva. No se registraron métricas de evaluación ni de seguridad en este entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate 9728, 32 heads de atencion, 8 key/value heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (maximo de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (solo pesos bfloat16 en safetensors) |
| Idiomas soportados | no disponible (hereda las capacidades del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un borrador (draft) EAGLE3, una arquitectura diseñada para decodificación especulativa. Consiste en una única capa transformer ligera que, tomando como entrada los hidden states del modelo objetivo, predice los siguientes tokens candidatos. En este caso, la capa tiene un tamaño oculto de 2560, un tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas key/value, con un vocabulario de borrador de 32.000 tokens frente al vocabulario objetivo de 151.936. Los pesos se almacenan en `bfloat16`.

El entrenamiento se realizó con el método "online EAGLE3" de SpecForge, un enfoque que entrena el draft model mientras el modelo objetivo genera en tiempo real, utilizando datos ShareGPT limpiados (fuente local, sin revisión registrada). Los hiperparámetros incluyen: 10 épocas, 231.810 pasos de optimización, batch efectivo global de 4, tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y posterior annealing coseno, weight decay 0, gradiente máximo 0,5, y longitud máxima de secuencia de 2048. La atención del draft usa `sdpa` (scaled dot-product attention) y el backend objetivo es SGLang con FlashInfer. No se configuró ventana deslizante, como indica el sufijo "NoWindow" del nombre.

## Capacidades

- Modelo borrador para decodificación especulativa: no genera texto de forma autónoma, sino que propone secuencias de tokens para que el modelo objetivo las valide.
- Compatibilidad exclusiva con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Integración con SGLang mediante el algoritmo EAGLE3, aceptando parámetros como `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- Soporte para despliegue con tensor parallel size 1 (no requiere paralelismo entre GPUs).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad: estas dependen enteramente del modelo objetivo.

## Casos de uso

- Aceleración de servidores de chat en producción: al desplegar Qwen3-4B-Instruct-2507 con SGLang, este draft model reduce la latencia de generación token a token, permitiendo servir más peticiones concurrentes con el mismo hardware.
- Reducción de costes de inferencia en entornos cloud: al acelerar la decodificación sin modificar la calidad de las respuestas, se puede mantener el mismo throughput con menos GPUs o instancias más pequeñas.
- Despliegue en entornos con requisitos de latencia estricta (por ejemplo, asistentes conversacionales interactivos): el draft model permite respuestas más rápidas al recortar el tiempo por token en la fase autoregresiva.
- Evaluación y ajuste de configuraciones de decodificación especulativa: los 47 checkpoints de la colección permiten probar distintos puntos de entrenamiento y optimizar los hiperparámetros del árbol de borrador (número de pasos, top-k, tokens de borrador) para una carga de trabajo concreta.
- Investigación sobre decodificación especulativa: este checkpoint sirve como referencia para estudiar el efecto del entrenamiento online con datos ShareGPT en la calidad de las propuestas del draft model.
- Integración en pipelines de inferencia con vLLM u otros runtimes compatibles: aunque el ejemplo oficial usa SGLang, el formato safetensors permite adaptarlo a otros motores que soporten EAGLE3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no se registraron metricas de evaluacion ni de seguridad" para este entrenamiento. No se proporcionan datos de MMLU, HumanEval, GSM8K ni mediciones de aceleracion real (como ratio de aceptacion de tokens o speedup) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en `bfloat16` (202 millones de parametros). Cabe en cualquier GPU moderna, incluso en tarjetas integradas o de bajo perfil.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar el draft model junto con el modelo objetivo en una configuracion tipica de SGLang. Para el conjunto completo (draft + Qwen3-4B-Instruct-2507 en bf16) se recomienda una GPU con 12-16 GB, como RTX 3090, RTX 4090, A10 o A100.
- Compatibilidad con GPU de consumo: si, el draft model cabe en cualquier consumer GPU (por ejemplo, RTX 3060 de 12 GB, RTX 4060 de 8 GB).
- Opciones de despliegue: SGLang con backend FlashInfer (ejemplo oficial), o cualquier motor que soporte EAGLE3 y formato safetensors. No se proporcionan archivos GGUF ni cuantizaciones alternativas.
- Latencia y throughput: no disponible. Dependen de la configuracion del arbol de borrador, el hardware y la carga de trabajo. La model card sugiere ajustar los parametros `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` mediante benchmarking.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada datos comparativos con otros draft models EAGLE3 o con alternativas como Medusa o Lookahead decoding. Este checkpoint es especifico del ecosistema Qwen3 y no se dispone de metricas estandarizadas para comparar su eficacia como borrador.

## Limitaciones y advertencias

- No es un modelo de chat ni un modelo standalone: no debe usarse para generar respuestas directamente. Solo funciona como borrador especulativo emparejado con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Sin metricas de seguridad ni evaluacion: la model card indica que no se registraron evaluaciones de seguridad ni de calidad. No se puede garantizar la ausencia de sesgos o comportamientos indeseados en las propuestas de tokens.
- Limitacion de contexto: el entrenamiento se realizo con una longitud maxima de 2048 tokens. Aunque el modelo objetivo soporta contextos mas largos, el draft model no fue entrenado para secuencias superiores, lo que podria degradar la calidad de las propuestas en contextos extensos.
- Dependencia de la configuracion de SGLang: los valores de arbol especificados en el ejemplo son valores iniciales; un ajuste incorrecto puede reducir la aceleracion o incluso degradar el rendimiento.
- Riesgo de desincronizacion con el modelo objetivo: si el modelo objetivo se actualiza o se cambia la version, el draft model deja de ser compatible.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podria ejecutar codigo arbitrario.
- Licencia Apache-2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen) que debe verificarse por separado.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-8-step-190000
- Repositorio del modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio GitHub de Qwen3 (referencia del modelo objetivo): https://github.com/QwenLM/Qwen3
- Checkpoint relacionado (epoch 1): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000
- Checkpoint relacionado (epoch 3): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
