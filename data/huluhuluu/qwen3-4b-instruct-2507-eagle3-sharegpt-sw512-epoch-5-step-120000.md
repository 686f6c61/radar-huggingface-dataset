# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-120000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) para decodificación especulativa EAGLE3, entrenado específicamente para acelerar la inferencia del modelo Qwen/Qwen3-4B-Instruct-2507. No es un modelo de chat independiente; su función es generar candidatos de tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia de generación sin alterar la calidad de las respuestas. Lo desarrolla el usuario huluhuluu mediante el framework SpecForge, con un entrenamiento online basado en datos ShareGPT limpios.

El modelo utiliza una arquitectura LlamaForCausalLMEagle3 con una sola capa decoder, hidden size de 2560, 32 cabezas de atención y 8 cabezas clave/valor, con atención de ventana deslizante causal de 512 tokens. Tiene 202,7 millones de parámetros en bfloat16, un tamaño muy reducido en comparación con el modelo objetivo de 4 mil millones. Se publica bajo licencia Apache-2.0 y se distribuye en formato safetensors, pensado para su uso con SGLang como ruta de draft especulativo.

La relevancia de este modelo radica en su carácter de componente de optimización para despliegues de Qwen3-4B-Instruct-2507 en producción. Al separar el draft model del modelo objetivo, se puede conseguir una aceleración sustancial de la inferencia en servidores con SGLang y backends como FlashInfer. El repositorio forma parte de una colección de 47 checkpoints correspondientes a diferentes pasos de entrenamiento, desde el paso 5000 hasta el 231810.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (draft model EAGLE3) |
| Parametros totales | 202.700.416 (draft model) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (secuencia de entrenamiento); ventana deslizante de draft de 512 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura de decodificación especulativa que predice múltiples tokens futuros en paralelo. Consta de una única capa decoder con hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo del modelo Qwen3 es de 151936; la capa de salida del draft model se proyecta al espacio del modelo objetivo. Utiliza atención con ventana deslizante de 512 tokens (causal sliding-window attention) y backend de atención `sdpa` durante el entrenamiento.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, sobre un dataset ShareGPT limpio (JSONL local, sin registro de revisión). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, con batch global efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y posterior decaimiento coseno, weight decay de 0,0 y max grad norm de 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una longitud TTT (test-time training) de 7 para EAGLE3. El entrenamiento se llevó a cabo con tensor parallel de 1 y 64 workers de dataset.

## Capacidades

- Decodificación especulativa: genera secuencias de tokens candidatos que el modelo objetivo Qwen3-4B-Instruct-2507 verifica en lote, reduciendo la latencia de generación.
- Integración con SGLang: diseñado para usarse como ruta de draft en SGLang con backend FlashInfer y ajustes especulativos EAGLE3.
- Aceleración de inferencia: al ser un modelo pequeño (202M parámetros), la generación de drafts es mucho más rápida que la del modelo objetivo, permitiendo verificación paralela.
- No es un modelo de chat: no genera respuestas por sí mismo; requiere emparejarse con el modelo objetivo.
- Entrenamiento en datos ShareGPT: el draft model aprende patrones de conversación y estilo de instrucción para producir candidatos plausibles.
- Soporte de ventana deslizante de 512 tokens: limita el contexto de atención del draft, reduciendo coste computacional y mejorando la velocidad.

## Casos de uso

- Servidores de inferencia de alto rendimiento: desplegar Qwen3-4B-Instruct-2507 con este draft model en SGLang para reducir la latencia por token en servicios de chat multiusuario, manteniendo la calidad del modelo objetivo.
- Optimización de costes en producción: al acelerar la generación sin cambiar el modelo final, se puede servir más peticiones por segundo con el mismo hardware, reduciendo el coste por inferencia.
- Evaluación de configuraciones especulativas: los 47 checkpoints disponibles permiten probar diferentes pasos de entrenamiento y ajustar los parámetros de árbol de especulación (tree settings) para encontrar la configuración óptima para una carga de trabajo concreta.
- Desarrollo de sistemas de agentes con baja latencia: en pipelines de agentes que requieren múltiples llamadas al modelo, la decodificación especulativa reduce el tiempo de respuesta de cada paso, mejorando la experiencia del usuario final.
- Investigación en decodificación especulativa: este modelo sirve como caso de estudio de entrenamiento online EAGLE3 con ventana deslizante, útil para investigar el impacto de la longitud de la ventana en la tasa de aceptación de drafts.
- Migración de despliegues existentes: si ya se utiliza Qwen3-4B-Instruct-2507 con SGLang, integrar este draft model es un cambio de configuración mínimo que puede proporcionar aceleración sin reentrenar el modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que "no se registraron métricas de evaluación ni de seguridad para este run". El rendimiento de aceleración depende de la tasa de aceptación de los tokens draft, que debe medirse experimentalmente con la carga de trabajo concreta y los ajustes de árbol de especulación.

## Requisitos de hardware

- VRAM estimada: el draft model pesa aproximadamente 0,4 GB en bfloat16 (202M parámetros), por lo que requiere muy poca memoria adicional además del modelo objetivo Qwen3-4B-Instruct-2507 (que ocupa unos 8 GB en bf16).
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar el modelo objetivo y el draft simultáneamente (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4). Para producción con SGLang, se recomiendan GPUs de datacenter como A100, L40S o H100.
- Compatibilidad con GPU de consumo: sí, el draft model es pequeño y cabe en GPUs de consumo junto al modelo objetivo, siempre que la VRAM total sea suficiente.
- Opciones de despliegue: SGLang con backend FlashInfer es el entorno previsto (target backend del entrenamiento). También se puede usar con vLLM si soporta EAGLE3, aunque la documentación del autor especifica SGLang. No es adecuado para llama.cpp u Ollama porque esos entornos no implementan EAGLE3.
- Latencia y throughput: no se han publicado mediciones. Dependerá de la tasa de aceptación del draft, que típicamente se sitúa entre el 60% y el 90% para modelos bien entrenados, y de la configuración del árbol de especulación.

## Comparativa con modelos similares

No se dispone de otros draft models EAGLE3 públicos directamente comparables para Qwen3-4B-Instruct-2507 en la información proporcionada. Como referencia, el draft model original de EAGLE para Qwen2 (del repositorio Yunhai-Hu/EAGLE-Qwen3) utiliza también ShareGPT como dataset de entrenamiento, pero no se especifican sus parámetros exactos. La comparación principal sería entre distintos checkpoints de este mismo entrenamiento (pasos 5000 a 231810), donde se puede evaluar la convergencia y la tasa de aceptación. No se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- No es un modelo de chat: intentar usarlo directamente como modelo generador producirá resultados sin sentido. Debe emparejarse estrictamente con Qwen/Qwen3-4B-Instruct-2507.
- Sin métricas de calidad ni seguridad: la model card indica que no se registraron evaluaciones de ningún tipo. La calidad de los drafts no está garantizada y debe validarse en el entorno de despliegue.
- Ventana deslizante de 512 tokens: el draft solo considera los últimos 512 tokens de contexto, lo que puede reducir la tasa de aceptación en diálogos muy largos o con dependencias de largo alcance.
- Datos de entrenamiento ShareGPT: el dataset puede contener sesgos de estilo conversacional y no cubrir todos los dominios; la tasa de aceptación puede degradarse en tareas fuera de la distribución de ShareGPT.
- Requiere configuración de árbol de especulación: los ajustes de árbol (tree settings) deben optimizarse para cada carga de trabajo; una configuración inadecuada puede reducir o anular la aceleración.
- Archivo `training_state.pt`: contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.
- Sin soporte de thinking mode: el modelo objetivo Qwen3-4B-Instruct-2507 no incluye modo de razonamiento explícito, por lo que el draft model tampoco lo contempla.
- Licencia Apache-2.0: permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 también según la información disponible), que debe verificarse para cada componente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-120000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Checkpoint alternativo (epoch 2, step 50000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Modelo objetivo Qwen3-4B-Instruct-2507 (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Implementación oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- README de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub (GitHub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
