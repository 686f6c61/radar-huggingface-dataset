# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-230000

## Resumen

Este repositorio contiene un checkpoint concreto (época 9, paso 230000) de un modelo de borrador (draft model) para decodificación especulativa EAGLE3, entrenado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario `huluhuluu` mediante la herramienta SpecForge, que implementa el entrenamiento en línea del algoritmo EAGLE3. No es un modelo de chat autónomo: su única función es proponer secuencias de tokens candidatos que aceleran la inferencia del modelo objetivo durante el servicio, reduciendo la latencia por token sin modificar la calidad de las respuestas finales.

El checkpoint es uno de los 47 publicados en una colección que abarca desde el paso 5000 hasta el 231810 del entrenamiento. La arquitectura es una variante `LlamaForCausalLMEagle3` con una única capa decoder, 202,7 millones de parámetros, pesos en bfloat16 y sin límite de ventana deslizante. Está pensado para integrarse con SGLang mediante la ruta de borrador especulativo, aunque también puede cargarse con Transformers.

La relevancia actual radica en que Qwen3-4B-Instruct-2507 es un modelo compacto de 4.000 millones de parámetros muy usado en producción; un borrador EAGLE3 bien entrenado puede multiplicar el throughput del servidor manteniendo exactamente las mismas salidas que el modelo original, algo crítico en entornos con alta concurrencia o presupuesto de GPU limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate 9728, 32 cabezas de atención, 8 cabezas K/V) |
| Parametros totales | 202.700.416 (modelo de borrador; el modelo base Qwen3-4B-Instruct-2507 tiene ~4.000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada; entrenado con secuencias de hasta 2048 tokens y sin ventana deslizante en la ejecución estándar |
| Tipos de cuantizacion | No publicados; pesos en bfloat16 |
| Idiomas soportados | No especificados (el modelo base Qwen3-4B-Instruct-2507 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), además de config.json y training_state.pt |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE3, una arquitectura de decodificación especulativa basada en una única capa decoder que predice varios tokens futuros a la vez a partir del estado oculto del modelo objetivo. La capa tiene tamaño oculto 2560, dimensión intermedia 9728, 32 cabezas de atención y 8 cabezas K/V, con vocabulario de borrador de 32000 tokens frente a los 151936 del modelo objetivo. Los pesos están en bfloat16.

El entrenamiento se realizó con SpecForge en modo en línea (online EAGLE3), usando un dataset ShareGPT limpio en formato JSONL de origen local. Se ejecutaron 10 épocas con 231810 pasos de optimizador, tamaño de lote efectivo de 4, tasa de aprendizaje 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno, sin weight decay y con norma de gradiente máxima 0,5. La longitud máxima de secuencia fue 2048 tokens y la longitud TTT (test-time training) de EAGLE3 fue 7. La atención del borrador usa `sdpa` y el backend objetivo es SGLang con FlashInfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera múltiples tokens candidatos por paso que el modelo base verifica en paralelo, reduciendo la latencia por token.
- Compatibilidad estricta con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`; el borrador solo es válido emparejado con esa familia exacta.
- Integración directa con SGLang a través del parámetro `--speculative-draft-model-path`.
- No es un modelo de chat: no genera respuestas finales, no soporta tool calling, ni agentes, ni razonamiento multi-paso por sí mismo.
- Capacidad multilingüe heredada del modelo base, pero solo en el contexto de la decodificación especulativa; el borrador no añade ni modifica capacidades lingüísticas.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con menor latencia: al usar este borrador como ruta especulativa en SGLang, un servidor puede responder más rápido por token manteniendo la misma calidad que el modelo original, ideal para asistentes conversacionales en tiempo real.
- Aumento del throughput en APIs de chat con alta concurrencia: al reducir los pasos de decodificación secuenciales, se liberan ciclos de GPU y se puede atender a más usuarios simultáneos con el mismo hardware.
- Reducción de costes de inferencia en entornos con GPUs limitadas: al acelerar la generación sin cambiar el modelo servido, se puede reducir el número de réplicas necesarias para cumplir un SLA de latencia.
- Evaluación de checkpoints de borrador: los 47 checkpoints publicados permiten comparar el rendimiento de la decodificación especulativa en diferentes etapas de entrenamiento y elegir el punto óptimo entre precisión de aceptación y velocidad.
- Experimentación con EAGLE3 y SpecForge: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar entrenamientos o analizar la dinámica de aprendizaje en entornos de investigación controlados.
- Integración en pipelines de inferencia con SGLang y FlashInfer: el modelo está pensado para usarse con el backend SGLang, por lo que encaja en despliegues que ya usan esta pila, con parámetros de árbol (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`) ajustables según la carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para esta ejecución. No se proporcionan tasas de aceptación, latencias ni comparativas con otros borradores.

## Requisitos de hardware

- El modelo de borrador tiene 202,7 millones de parámetros en bfloat16, lo que ocupa aproximadamente 0,4 GB en memoria.
- Para inferencia conjunta con el modelo base Qwen3-4B-Instruct-2507 (que requiere unos 8 GB en bfloat16), se necesita una GPU con al menos 12 GB de VRAM para cargar ambos modelos simultáneamente en un solo dispositivo.
- GPUs recomendadas: RTX 3090/4090 (24 GB), A100 40/80 GB, H100 80 GB, o cualquier GPU con 16 GB o más para margen de contexto largo.
- En GPUs de consumo (RTX 3060 12 GB, RTX 4070 12 GB, etc.) cabe el conjunto si el contexto se mantiene moderado (por ejemplo, 2048-8192 tokens).
- Opciones de despliegue: SGLang es el backend objetivo (con FlashInfer); también puede cargarse con Transformers para inspección o pruebas locales, aunque no se recomienda para producción.
- La latencia y el throughput no están publicados; dependerán del hardware, la longitud de secuencia y la tasa de aceptación del borrador, que debe medirse en la carga de trabajo concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3 (este) | Borrador EAGLE3 | 202,7 M | No especificado | Apache-2.0 | Acelerar Qwen3-4B-Instruct-2507 |
| Qwen3-4B-Instruct-2507 (modelo base) | Chat instructivo | ~4.000 M | Largo (no especificado aquí) | Apache-2.0 | Generación de texto, código, matemáticas |
| Otros borradores EAGLE3 (p. ej. para Qwen2) | Borrador EAGLE3 | Variable | Depende del entrenamiento | Apache-2.0 | Acelerar modelos Qwen2 |

No se dispone de datos comparativos cuantitativos (latencia, tasa de aceptación) entre este borrador y otras implementaciones EAGLE3 o Métodos como Medusa o Lookahead. La comparación directa requiere ejecutar benchmarks propios en el hardware objetivo.

## Limitaciones y advertencias

- No es un modelo de chat independiente: usarlo sin el modelo base `Qwen/Qwen3-4B-Instruct-2507` no produce respuestas útiles.
- No se han registrado métricas de seguridad ni de evaluación; no hay garantía de que el borrador funcione bien en todos los dominios o idiomas.
- El entrenamiento se realizó con datos ShareGPT en inglés mayoritariamente; la model card del proyecto EAGLE-Qwen3 advierte que los borradores entrenados con ShareGPT pueden tener peor rendimiento en datos no ingleses, como chino, si no se entrena con datos específicos.
- El contexto máximo de entrenamiento fue 2048 tokens; aunque el modelo no tiene ventana deslizante, el borrador puede degradarse en secuencias muy largas si no se valida.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está diseñado para un backend concreto (SGLang) y puede requerir ajustes de parámetros (`--speculative-num-steps`, `--speculative-num-draft-tokens`) para obtener buenos resultados en producción.
- No hay información sobre cuantizaciones oficiales; si se cuantiza el borrador, la tasa de aceptación podría cambiar y debe re-evaluarse.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-230000
- Colección de checkpoints (47 repositorios): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Otro checkpoint de la misma colección (ejemplo): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Implementación oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- README del modelo base en Qualcomm AI Hub (GitHub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
