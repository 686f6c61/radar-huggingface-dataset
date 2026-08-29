# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-100000

## Resumen

Este repositorio contiene un checkpoint concreto (epoch 4, paso 100000) de un entrenamiento online de modelo borrador (draft model) para decodificación especulativa EAGLE3, desarrollado por el usuario huluhuluu con la herramienta SpecForge. El modelo objetivo es `Qwen/Qwen3-4B-Instruct-2507`, un modelo instruct multilingüe de 4 mil millones de parámetros. El modelo borrador no es un modelo de chat autónomo: su única función es predecir secuencias de tokens candidatos que el modelo objetivo valida, acelerando así la inferencia en entornos de servidor como SGLang.

La arquitectura es `LlamaForCausalLMEagle3`, con una sola capa de decoder, tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas clave/valor. El checkpoint pesa 202,7 millones de parámetros y ocupa 0,4 GB en formato safetensors con precisión bfloat16. La relevancia actual radica en que los modelos de decodificación especulativa reducen la latencia de inferencia de modelos grandes sin degradar la calidad, un factor crítico para despliegues en producción con alto volumen de peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (draft model; el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | No disponible (el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE3, una arquitectura de decodificación especulativa que utiliza una única capa de transformer para predecir múltiples tokens futuros basándose en el estado oculto del modelo objetivo. La capa tiene tamaño oculto 2560, tamaño intermedio 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del borrador es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizó de forma online con SpecForge, usando datos limpios de ShareGPT en formato JSONL. Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch efectivo de 4 (tamaño por dispositivo 1, paralelismo de datos 4, sin acumulación de gradientes), tasa de aprendizaje 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno. La longitud máxima de secuencia fue de 2048 tokens y la longitud TTT de EAGLE3 fue 7. La atención del borrador usa `sdpa` y el backend objetivo es SGLang con FlashInfer. No se aplicó ventana deslizante en esta ejecución estándar.

## Capacidades

- Generacion especulativa de tokens: predice secuencias de hasta 4 tokens candidatos que el modelo objetivo valida en paralelo, acelerando la decodificacion.
- Integracion con SGLang: se usa como ruta de borrador especulativo en el lanzador de SGLang, con parámetros configurables como `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- Compatible con el modelo objetivo Qwen3-4B-Instruct-2507: diseñado especificamente para esa familia de modelos.
- No es un modelo de chat: no genera respuestas de forma autonoma ni soporta tool calling, razonamiento o vision.
- Entrenado con datos ShareGPT: orientado a datos conversacionales en ingles principalmente, aunque el modelo base es multilingue.

## Casos de uso

- Reduccion de latencia en servidores de inferencia: al desplegar Qwen3-4B-Instruct-2507 con SGLang y este borrador EAGLE3, se pueden obtener menores tiempos de respuesta por token en cargas de trabajo de chat, manteniendo la calidad del modelo objetivo.
- Optimizacion de costes por peticion: al acelerar la decodificacion, se reduce el tiempo de ocupacion de GPU, permitiendo servir mas peticiones concurrentes con el mismo hardware.
- Despliegue en entornos de produccion con requisitos de baja latencia: ideal para asistentes virtuales, chatbots de atencion al cliente o herramientas de generacion de codigo donde la velocidad de respuesta es critica.
- Evaluacion de rendimiento especulativo: investigadores pueden comparar la tasa de aceptacion de tokens y el speedup obtenido con este checkpoint frente a otros borradores o configuraciones.
- Ajuste de parametros de decodificacion especulativa: permite experimentar con distintos valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` para encontrar la configuracion optima para una carga de trabajo concreta.
- Formacion y validacion de modelos borrador: el repositorio incluye `training_state.pt` para reanudar entrenamientos o analizar el proceso de optimizacion en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation or safety metrics were recorded for this run." No se dispone de datos de speedup, tasa de aceptacion ni comparaciones con otros borradores.

## Requisitos de hardware

- El modelo borrador en bfloat16 ocupa aproximadamente 405 MB de VRAM (202,7 M parametros × 2 bytes), mas overhead de la capa de atencion.
- Para usar el borrador junto con el modelo objetivo Qwen3-4B-Instruct-2507, la VRAM total depende del modelo base: en bfloat16 el modelo base ocupa ~8 GB, en cuantizacion 4-bit ~2,5 GB. Se recomienda una GPU con al menos 12 GB de VRAM para inferencia en bfloat16.
- GPUs compatibles: cualquier GPU moderna con soporte CUDA, como RTX 3090/4090, A100, H100, L40S. Para cargas de produccion con SGLang se recomienda una GPU con al menos 24 GB (A100, H100, RTX 4090).
- Opciones de despliegue: SGLang (recomendado, con `--speculative-algorithm EAGLE3`), tambien compatible con vLLM si soporta EAGLE3 (no confirmado en la informacion).
- El modelo borrador por si solo no es util sin el modelo objetivo; no se puede ejecutar en llama.cpp u Ollama como modelo independiente.

## Comparativa con modelos similares

No hay informacion suficiente para una comparativa directa con otros borradores EAGLE3. Existen otros checkpoints del mismo entrenamiento (epoch 1, epoch 6, etc.) en la coleccion del autor, pero no se dispone de datos comparativos de rendimiento entre ellos. Tampoco hay datos publicados sobre alternativas como borradores Medusa o Lookahead para Qwen3-4B. Se puede afirmar que este borrador esta especificamente optimizado para el modelo objetivo Qwen3-4B-Instruct-2507, mientras que otros borradores genericos podrian no ofrecer el mismo nivel de aceleracion.

## Limitaciones y advertencias

- No es un modelo de chat independiente: debe usarse exclusivamente como borrador especulativo junto con el modelo objetivo Qwen3-4B-Instruct-2507. Intentar usarlo como modelo autonomo producira salidas sin sentido.
- No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento: no hay garantias sobre sesgos, alucinaciones o comportamiento seguro en produccion.
- El dataset ShareGPT puede contener sesgos linguisticos y tematicos; la model card del proyecto EAGLE-Qwen3 advierte que ShareGPT ha eliminado datos no ingleses, por lo que el rendimiento en otros idiomas puede verse afectado.
- La longitud maxima de secuencia de entrenamiento fue 2048 tokens; aunque el modelo objetivo soporta contextos mas largos, el borrador no fue entrenado para secuencias superiores y podria degradar su tasa de aceptacion.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgos de seguridad.
- No hay informacion sobre cuantizaciones alternativas (GGUF, AWQ, etc.); solo se proporcionan pesos bfloat16 en safetensors.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-100000
- Coleccion de checkpoints del entrenamiento (epoch 1, epoch 6, etc.): https://huggingface.co/huluhuluu (perfil del autor)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Pagina del modelo Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
