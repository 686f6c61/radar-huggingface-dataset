# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-90000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) para decodificación especulativa EAGLE3, entrenado específicamente para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. El modelo fue desarrollado por el usuario huluhuluu utilizando el framework SpecForge, con una metodología de entrenamiento online EAGLE3 sobre datos ShareGPT limpios. Es un checkpoint concreto (epoch 3, paso 90.000) de una serie de 47 checkpoints publicados en una colección de HuggingFace.

El modelo no es un chatbot autónomo: su única función es servir como modelo de propuesta (draft) dentro de un esquema de decodificación especulativa, donde genera candidatos de tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia de inferencia. Con solo 202,7 millones de parámetros y una ventana deslizante de 512 tokens, está diseñado para ser ligero y rápido, manteniendo una alta tasa de aceptación de tokens con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLMEagle3` (una capa decoder, attention causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (ventana deslizante de draft; el modelo objetivo soporta 128K) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, training_state.pt |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura EAGLE3, una variante de decodificación especulativa que usa una única capa de transformer decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas clave/valor. La entrada al modelo es la secuencia del modelo objetivo más los embeddings de los tokens ya aceptados, y genera distribuciones sobre un vocabulario de draft de 32.000 tokens (frente al vocabulario objetivo de 151.936). La atención es de tipo `sdpa` (scaled dot-product attention) con una ventana deslizante de 512 tokens, lo que limita el coste computacional y favorece la velocidad de propuesta.

El entrenamiento se realizó con el método online EAGLE3 de SpecForge, usando datos ShareGPT limpios (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con 231.810 pasos de optimización, tamaño de lote efectivo de 4, learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0 y gradiente máximo 0,5. La longitud máxima de secuencia de entrenamiento fue de 2048 tokens, con una longitud TTT (test-time training) de 7. El backend objetivo es SGLang con flashinfer, tensor parallel size 1. No se registraron métricas de evaluación ni de seguridad en la model card.

## Capacidades

- Genera propuestas de tokens (draft) para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` en esquemas de decodificación especulativa EAGLE3.
- Acelera la inferencia del modelo objetivo reduciendo el número de pasos de forward del modelo grande, manteniendo la misma distribución de salida.
- Compatible con SGLang (backend flashinfer) y con la configuración de decodificación especulativa de EAGLE3.
- No es un modelo de chat ni de generación autónoma: requiere emparejarse con el modelo objetivo para cualquier uso práctico.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; esas capacidades pertenecen al modelo objetivo.

## Casos de uso

- Despliegue de inferencia de baja latencia para `Qwen3-4B-Instruct-2507` en producción: el draft model se configura como ruta especulativa en SGLang, reduciendo el tiempo de primer token y el throughput general en cargas de trabajo de chat o generación de código.
- Servicios de chat multiusuario con presupuesto de GPU limitado: al acelerar el modelo objetivo, se puede atender más peticiones concurrentes con la misma infraestructura.
- Experimentación con decodificación especulativa: investigadores pueden comparar la tasa de aceptación de tokens de este checkpoint frente a otros de la misma colección (47 checkpoints) para ajustar parámetros como el árbol de especulación.
- Optimización de costes en entornos cloud: menor latencia por petición implica menor tiempo de GPU facturado, reduciendo el coste operativo de servir el modelo objetivo.
- Integración en pipelines de generación de código asistida (autocompletado, copiloto): la baja latencia es crítica en editores y entornos interactivos.
- Evaluación de estrategias de draft con ventana deslizante: este checkpoint con SW512 permite estudiar el impacto de la longitud de ventana en la calidad de las propuestas frente a otros con ventanas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. El rendimiento de un draft model se mide típicamente por la tasa de aceptación de tokens y la aceleración end-to-end, pero esos datos no están disponibles.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 202,7M parámetros en bfloat16, ocupa aproximadamente 405 MB de VRAM (sin contar overhead). Es despreciable frente al modelo objetivo (Qwen3-4B-Instruct-2507, que requiere unos 8 GB en bfloat16).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar tanto el draft como el modelo objetivo (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A10, A100). Para entornos de producción con SGLang, se recomienda GPU con soporte FlashInfer (Ampere o superior).
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja si el modelo objetivo también cabe.
- Opciones de despliegue: SGLang (con configuración EAGLE3), potencialmente vLLM si soporta EAGLE3 (no verificado), y cualquier framework que implemente decodificación especulativa con modelos de draft compatibles.
- Latencia y throughput: no disponibles. Dependen del modelo objetivo, del árbol de especulación configurado y del hardware.

## Comparativa con modelos similares

No hay información pública sobre modelos draft comparables en la misma colección más allá de los 47 checkpoints de la serie EAGLE3-ShareGPT. Se puede comparar con el modelo base `Qwen/Qwen3-4B-Instruct-2507` (4B parámetros, contexto 128K, instruct sin modo thinking) y con otros draft models de EAGLE3 para Qwen, pero no se dispone de datos de rendimiento. A continuación se muestra una comparación estructural:

| Modelo | Parámetros | Contexto | Rol | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (objetivo) | 4.000M | 128K | Modelo de chat/instruct | Apache-2.0 |
| Este draft (EAGLE3 SW512) | 202,7M | 512 (ventana) | Draft para decodificación especulativa | Apache-2.0 |
| Otros checkpoints de la colección (47 en total) | 202,7M | 512 | Idem, distintos pasos de entrenamiento | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo de chat ni de generación autónoma: intentar usarlo sin el modelo objetivo producirá salidas sin sentido.
- La ventana deslizante de 512 tokens limita la memoria de contexto del draft; secuencias más largas pueden degradar la tasa de aceptación de tokens.
- No se registraron métricas de evaluación ni de seguridad; el modelo puede heredar sesgos del dataset ShareGPT (conversaciones de usuarios, principalmente en inglés) y del modelo objetivo.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.
- La licencia Apache-2.0 permite uso comercial, pero el modelo objetivo `Qwen3-4B-Instruct-2507` también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El entrenamiento usó datos ShareGPT sin filtrado documentado; puede contener contenido sensible o de baja calidad que afecte a las propuestas del draft.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-90000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Información de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
