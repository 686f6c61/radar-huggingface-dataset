# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-85000

## Resumen

Este repositorio contiene un checkpoint concreto del modelo de borrador (draft model) EAGLE3 entrenado sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un componente auxiliar para decodificación especulativa, no de un modelo de chat independiente. Su propósito es acelerar la inferencia del modelo Qwen3-4B-Instruct-2507 prediciendo secuencias de tokens que el modelo objetivo puede verificar en paralelo, reduciendo así la latencia por token generado. El checkpoint corresponde a la época 3, paso 85000 de un entrenamiento de 10 épocas y 231810 pasos totales.

El modelo tiene 202.700.416 parámetros (aproximadamente 202 millones), una única capa decoder con atención de ventana deslizante de 512 tokens, y está entrenado con el método Online EAGLE3 mediante la herramienta SpecForge. Su tamaño reducido (0,4 GB en bf16) lo hace extremadamente ligero en comparación con el modelo objetivo de 4B, lo que permite ejecutarlo en paralelo con éste sin un coste computacional significativo. La licencia Apache-2.0 facilita su uso tanto en investigación como en entornos comerciales.

Este checkpoint forma parte de una colección de 47 checkpoints publicados por el autor, cada uno en un repositorio independiente de Hugging Face. No se han registrado métricas de evaluación ni de seguridad para este entrenamiento, por lo que su rendimiento cualitativo debe inferirse del comportamiento del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, atención sliding-window causal de 512 tokens) |
| Parametros totales | 202.700.416 (202,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento); ventana deslizante del borrador: 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; no se han publicado versiones cuantizadas) |
| Idiomas soportados | No disponible (heredado del modelo objetivo, pero no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `LlamaForCausalLMEagle3`, específicamente diseñada para decodificación especulativa EAGLE3. Consta de una única capa decoder con hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del borrador es de 32000 tokens, mientras que el vocabulario objetivo (del modelo Qwen3) es de 151936 tokens. Los pesos están en bfloat16. La atención es causal con ventana deslizante de 512 tokens, lo que limita el alcance de las predicciones del borrador a un contexto local.

El entrenamiento se realizó mediante el método Online EAGLE3 implementado en SpecForge, con datos ShareGPT limpiados (JSONL local, sin registro de revisión). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch size efectivo de 4 (tamaño por dispositivo 1, paralelismo de datos 4), learning rate 1e-4 con warmup lineal del 1,5% y posterior decaimiento coseno, weight decay 0,0 y gradiente máximo normalizado a 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una longitud de entrenamiento TTT (test-time training) de 7 tokens para el mecanismo EAGLE3. El backend objetivo fue SGLang con flashinfer y paralelismo tensorial de tamaño 1.

No se aplicó ninguna técnica de RLHF o DPO; el entrenamiento se centró exclusivamente en optimizar la capacidad del borrador para predecir los tokens del modelo objetivo.

## Capacidades

- Decodificación especulativa: su función exclusiva es generar candidatos de tokens para que el modelo objetivo los verifique en lote, acelerando la inferencia de Qwen3-4B-Instruct-2507.
- Integración con SGLang: diseñado para usarse como ruta de borrador especulativa en SGLang, con soporte para EAGLE3 en las versiones recientes del servidor.
- Atención de ventana deslizante: procesa contextos locales de hasta 512 tokens para generar propuestas rápidamente, sin necesidad de atender a todo el contexto completo.
- Ligereza computacional: con solo 202M parámetros, su coste de ejecución es marginal comparado con el modelo objetivo de 4B.
- No es un modelo de chat ni de generación autónoma: no puede usarse directamente para responder preguntas o generar texto por sí mismo.

## Casos de uso

- Servidores de inferencia de alto rendimiento para Qwen3-4B-Instruct-2507: al integrar este borrador en SGLang con decodificación especulativa, se puede reducir la latencia de generación en aplicaciones de chat, asistentes virtuales o agentes conversacionales que usen el modelo objetivo. El borrador predice tokens probables y el modelo objetivo verifica varios a la vez, aumentando el throughput.
- Optimización de costes en despliegues en la nube: al mejorar la eficiencia por token generado, se reduce el tiempo de cómputo por petición y, por tanto, el coste de inferencia en instancias GPU compartidas o bajo demanda.
- Experimentación con parámetros de árbol especulativo: los desarrolladores pueden ajustar la configuración del árbol de candidatos (tree settings) en SGLang para encontrar el equilibrio óptimo entre tasa de aceptación y sobrecarga de cálculo, utilizando este checkpoint como base.
- Evaluación de la calidad de borradores EAGLE3: investigadores pueden comparar este checkpoint con otros de la misma colección (47 checkpoints en total) para estudiar cómo evoluciona la tasa de aceptación del borrador a lo largo del entrenamiento.
- Integración en pipelines de prueba de concepto: al ser un modelo pequeño y con licencia permisiva, es adecuado para prototipar sistemas de decodificación especulativa en entornos de desarrollo sin grandes requisitos de hardware.
- Benchmarking de frameworks de inferencia: sirve como caso de prueba para comparar el rendimiento de SGLang frente a otras implementaciones de decodificación especulativa (por ejemplo, vLLM con EAGLE) sobre el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" para este entrenamiento. No se dispone de datos sobre tasa de aceptación, speedup relativo ni comparaciones con otros borradores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 0,4 GB en bf16 (202M parámetros). En la práctica, se ejecuta junto con el modelo objetivo Qwen3-4B-Instruct-2507, que requiere aproximadamente 8-10 GB en bf16 (más overhead de KV cache). El conjunto completo cabe en GPUs consumer de 12 GB o más.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM, por ejemplo RTX 3060 12GB, RTX 4070 Ti, RTX 4090, A10, A100, H100. Para entornos de producción con alto throughput, se recomiendan GPUs de centro de datos (A100, H100) o instancias con múltiples GPUs.
- Compatibilidad con consumer GPUs: sí, el borrador en sí es trivial de ejecutar, pero el modelo objetivo de 4B requiere una GPU con suficiente VRAM. Una RTX 4090 (24 GB) puede alojar ambos modelos y la KV cache para contextos largos.
- Opciones de despliegue: SGLang es el backend objetivo indicado en la documentación, con soporte para EAGLE3 mediante flashinfer. También podría adaptarse a otras plataformas que soporten EAGLE3 (por ejemplo, vLLM experimental), aunque no está oficialmente documentado.
- Latencia y throughput: no se han publicado cifras. El impacto real depende de la tasa de aceptación del borrador, que debe medirse experimentalmente para cada carga de trabajo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de borrador EAGLE3 entrenados sobre Qwen3-4B-Instruct-2507 con características comparables. El ecosistema de borradores especulativos es muy específico y cada uno se entrena para un modelo objetivo concreto. Como referencia, se puede comparar el modelo objetivo Qwen3-4B-Instruct-2507 (4B parámetros, contexto 262K, licencia Apache-2.0) con otros modelos de la misma categoría, pero esa comparativa no aplica directamente al borrador. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo dependiente: no funciona de forma autónoma; requiere el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` y un framework compatible con EAGLE3 (SGLang).
- Sin evaluación de seguridad: la model card indica que no se registraron métricas de evaluación ni de seguridad. No se ha verificado la ausencia de sesgos, alucinaciones o comportamientos nocivos en las predicciones del borrador.
- Datos de entrenamiento limitados: se usó solo ShareGPT (conversaciones de ChatGPT), lo que puede introducir sesgos hacia el estilo de conversación de ese dataset y no cubrir todos los dominios.
- Ventana deslizante corta: el borrador solo considera 512 tokens de contexto local, lo que puede reducir la precisión de sus predicciones en tareas que requieren información de largo alcance. Para contextos mayores, la tasa de aceptación podría disminuir.
- Sin cuantizaciones publicadas: solo se ofrecen pesos en bf16; no hay versiones GGUF, ONNX ni otras cuantizaciones, lo que limita su uso en entornos con restricciones de memoria extremas.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo objetivo Qwen3-4B-Instruct-2507 también es Apache-2.0, por lo que no hay conflicto. No obstante, se recomienda revisar los términos de la licencia del modelo objetivo.
- Archivo `training_state.pt`: incluye estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza para evitar riesgos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-85000
- Modelo objetivo (Qwen3-4B-Instruct-2507): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3 (implementación de EAGLE-1/2/3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Información de Qualcomm AI Hub sobre Qwen3-4B-Instruct-2507: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio de ejemplo de ejecución local con Qwen3-4B (referencia de integración): https://github.com/locomotive-works/npu-local-model-running
