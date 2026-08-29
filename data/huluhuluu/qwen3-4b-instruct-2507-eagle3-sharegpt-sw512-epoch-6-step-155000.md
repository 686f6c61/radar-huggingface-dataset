# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-155000

## Resumen

Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512 es un modelo de borrador (draft model) para decodificación especulativa, desarrollado por el usuario huluhuluu mediante la herramienta SpecForge con el método EAGLE3. No es un modelo de chat independiente: su única función es predecir secuencias de tokens candidatas que el modelo objetivo Qwen/Qwen3-4B-Instruct-2507 verifica en paralelo, reduciendo la latencia de inferencia sin degradar la calidad de las respuestas.

El modelo emplea una arquitectura ligera de una sola capa de decoder con atención causal de ventana deslizante de 512 tokens. Fue entrenado de forma online sobre datos ShareGPT durante 10 épocas (231.810 pasos de optimización), con un tamaño total de 202,7 millones de parámetros en bfloat16. Está pensado para usarse exclusivamente como ruta de borrador en SGLang junto con el modelo objetivo de la familia Qwen3-4B-Instruct-2507.

La relevancia de este modelo radica en que permite acelerar la inferencia de Qwen3-4B-Instruct-2507 en entornos de producción sin necesidad de cuantizar el modelo principal ni sacrificar precisión. Es una pieza especializada dentro del ecosistema de decodificación especulativa, orientada a desarrolladores que despliegan servidores de inferencia con SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas K/V, atencion causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens de entrenamiento (ventana de borrador limitada a 512 tokens) |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones alternativas |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507, que soporta multiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE3, una variante de decodificación especulativa que extiende la arquitectura del modelo objetivo con una capa adicional ligera. En concreto, usa `LlamaForCausalLMEagle3` con una sola capa de decoder, dimensiones ocultas de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas de clave/valor, con un vocabulario de borrador de 32.000 tokens frente al vocabulario objetivo de 151.936 tokens del modelo Qwen3-4B-Instruct-2507. La atención es causal con ventana deslizante de 512 tokens, lo que limita el alcance del contexto que el borrador considera al predecir.

El entrenamiento se realizó con el método "Online EAGLE3" implementado en SpecForge, sobre datos ShareGPT limpiados (JSONL local, sin versión registrada). Se ejecutaron 10 épocas con un total de 231.810 pasos de optimización, un tamaño de lote efectivo de 4, una tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno. No se aplicó weight decay (0,0) y el gradiente máximo se limitó a 0,5. La longitud máxima de secuencia durante el entrenamiento fue de 2048 tokens, con una longitud de TTT (test-time training) de 7 tokens. El backend objetivo fue SGLang con flashinfer y paralelismo tensorial de 1.

No se registraron métricas de evaluación ni de seguridad durante el entrenamiento, según la model card del autor.

## Capacidades

- Decodificación especulativa: predice múltiples tokens candidatos en paralelo para que el modelo objetivo los verifique, reduciendo la latencia por token generado.
- Aceleración de inferencia: diseñado para funcionar como ruta de borrador en SGLang, con soporte para configuraciones de árbol (tree settings) que deben ajustarse según la carga de trabajo.
- Compatibilidad específica: solo es válido junto con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`; no es un modelo de chat autónomo.
- Atención con ventana deslizante: limita el alcance del borrador a 512 tokens, lo que reduce el coste computacional y facilita el despliegue en entornos con memoria limitada.
- Formato de pesos estándar: safetensors, compatible con la librería transformers y con SGLang.

## Casos de uso

- Servidores de inferencia de alto rendimiento: integrar el borrador en SGLang junto con Qwen3-4B-Instruct-2507 para reducir la latencia en APIs de chat, manteniendo la calidad del modelo objetivo sin cuantizar.
- Despliegue en entornos con GPUs limitadas: al ser un modelo pequeño (0,4 GB), puede cargarse en la misma GPU que el modelo principal sin necesidad de hardware adicional, acelerando la generación sin aumentar significativamente el consumo de VRAM.
- Optimización de costes por petición: al reducir el número de pasos de decodificación autoregresiva, se disminuye el tiempo de cómputo por solicitud, lo que permite atender más peticiones con los mismos recursos.
- Evaluación de configuraciones de árbol (tree settings): los desarrolladores pueden experimentar con diferentes parámetros de decodificación especulativa para maximizar el throughput en sus cargas de trabajo específicas.
- Investigación en decodificación especulativa: sirve como referencia de un borrador EAGLE3 entrenado con SpecForge, útil para comparar metodologías de entrenamiento online frente a offline.
- Migración incremental a Qwen3-4B-Instruct-2507: si un equipo ya usa SGLang y desea adoptar el nuevo modelo Qwen3, este borrador facilita una integración rápida con aceleración especulativa sin rediseñar la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no registra métricas de evaluación, ni de calidad de los tokens generados ni de velocidad de decodificación especulativa. Se recomienda medir el rendimiento en el entorno de despliegue específico, ajustando los parámetros de árbol de SGLang.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de borrador ocupa aproximadamente 0,4 GB en bfloat16 (202,7 millones de parámetros), por lo que cabe en cualquier GPU moderna junto al modelo principal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el borrador junto con Qwen3-4B-Instruct-2507 (que requiere unos 8-10 GB en bfloat16). Para entornos de producción, se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) para dejar margen al contexto y a las activaciones.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de consumo como RTX 3060, RTX 4070 o superiores, siempre que el modelo principal también quepa.
- Opciones de despliegue: SGLang (backend objetivo, con soporte para EAGLE3 y flashinfer). También es compatible con la librería transformers para cargar los pesos, aunque su uso real requiere el soporte de decodificación especulativa de SGLang.
- Latencia y throughput: no disponibles. Dependen de la configuración de árbol, del hardware y de la carga de trabajo. Se recomienda realizar benchmarks propios.

## Comparativa con modelos similares

No se dispone de información sobre modelos de borrador EAGLE3 comparables para Qwen3-4B-Instruct-2507 en la información proporcionada. Se puede indicar que la alternativa más directa es no usar decodificación especulativa (inferencia estándar del modelo objetivo), o utilizar borradores genéricos de la familia EAGLE3 si existieran para otros modelos Qwen3. La comparativa queda pendiente de datos públicos.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse de forma independiente para generar respuestas; solo funciona como borrador especulativo junto con el modelo objetivo.
- Dependencia del modelo objetivo: está entrenado específicamente para `Qwen/Qwen3-4B-Instruct-2507`; usarlo con otros modelos puede degradar gravemente la calidad de las predicciones.
- Sin métricas de evaluación: el autor no registró resultados de calidad ni de velocidad, por lo que el rendimiento real debe validarse en cada entorno.
- Ventana de borrador limitada a 512 tokens: puede reducir la eficacia de la decodificación especulativa en contextos muy largos o con dependencias de largo alcance.
- Datos de entrenamiento: ShareGPT sin versión registrada; puede contener sesgos o ruido inherentes a este tipo de datos, aunque al ser un borrador el impacto en la salida final es limitado.
- `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- No se documentan restricciones de uso comercial más allá de la licencia Apache 2.0, que permite uso comercial con atribución.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-155000
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (epoch 6, step 145000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-145000
- Checkpoint hermano (epoch 6, step 155000 sin SW512): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Referencia de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Implementación de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub (GitHub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
- Repositorio de ejecución en NPU (referencia): https://github.com/locomotive-works/npu-local-model-running
