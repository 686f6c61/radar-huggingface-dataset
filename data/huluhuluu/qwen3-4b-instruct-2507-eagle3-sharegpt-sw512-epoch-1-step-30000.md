# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-30000

## Resumen

Este modelo es un **draft model** (modelo de borrador) para **decodificación especulativa**, entrenado con el método **EAGLE3** mediante la herramienta **SpecForge**. Su propósito no es generar texto de forma autónoma, sino servir como modelo auxiliar para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` en servidores de inferencia como **SGLang**. Es un modelo pequeño, de unos 202,7 millones de parámetros, con una única capa decodificadora y atención de ventana deslizante de 512 tokens.

Fue desarrollado por el usuario de Hugging Face `huluhuluu` y publicado bajo licencia Apache-2.0. El repositorio contiene un checkpoint concreto (época 1, paso 30000) de una serie de 47 checkpoints que cubren diferentes épocas y pasos de entrenamiento. Al ser un modelo de decodificación especulativa, no está pensado para uso directo con prompts de usuario, sino para emparejarse con el modelo objetivo mediante la configuración de SGLang.

La relevancia de este modelo radica en que permite reducir la latencia de inferencia del Qwen3-4B-Instruct-2507 sin sacrificar calidad, aprovechando la arquitectura EAGLE3, que emplea una capa de atención adicional para predecir tokens futuros de forma paralela. No se han registrado descargas ni valoraciones, y la model card no incluye métricas de evaluación ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decodificadora, atención con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos publicados) |
| Idiomas soportados | no disponible (derivado de Qwen3-4B-Instruct-2507, que es multilingüe, pero no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura **LlamaForCausalLMEagle3**, que es una variante del diseño EAGLE3 para decodificación especulativa. Consta de una única capa decodificadora con tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del draft es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens. La atención es de ventana deslizante con un alcance de 512 tokens, y los pesos se almacenan en bfloat16.

El entrenamiento se realizó con el método **online EAGLE3** implementado en SpecForge, utilizando datos **ShareGPT** limpios en formato JSONL (la fuente local no registra revisión). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, un tamaño de batch global efectivo de 4 (con paralelismo de datos de 4 y batch por dispositivo de 1), y una tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno. La longitud máxima de secuencia fue de 2048 tokens, y el parámetro TTT (test-time training) de EAGLE3 fue de 7. No se aplicó weight decay, y la normalización del gradiente se limitó a 0,5. El backend objetivo para la inferencia es SGLang con FlashInfer.

## Capacidades

- **Decodificación especulativa**: su función principal es generar borradores de tokens en paralelo para que el modelo objetivo los verifique, acelerando la inferencia.
- **Aceleración de inferencia**: al emparejarse con `Qwen/Qwen3-4B-Instruct-2507` en SGLang, reduce la latencia por token generado.
- **Compatibilidad con SGLang**: diseñado específicamente para funcionar con la configuración de decodificación especulativa EAGLE3 de SGLang.
- **Entrenamiento específico para el modelo objetivo**: sus pesos están ajustados para predecir con alta precisión los tokens del Qwen3-4B-Instruct-2507, no para generar texto autónomo.
- **No es un modelo de chat**: no soporta instrucciones directas, tool calling, razonamiento multi-paso ni capacidades multimodales.
- **Ventana deslizante de 512 tokens**: limita el alcance de atención del draft a 512 tokens, lo que reduce el coste computacional durante la generación especulativa.

## Casos de uso

- **Despliegue de Qwen3-4B-Instruct-2507 en producción con SGLang**: el caso principal es configurar este modelo como ruta de draft en SGLang para acelerar la inferencia del modelo objetivo en servicios de chat o generación de texto. Se usa el checkpoint como `speculative_draft_path` y se ajustan los parámetros de árbol de especulación según la carga de trabajo.
- **Reducción de latencia en APIs de chat**: en un servicio de atención al cliente o asistente virtual que use Qwen3-4B-Instruct-2507, este draft model permite responder con menor latencia, mejorando la experiencia de usuario en conversaciones multi-turno.
- **Optimización de costes en inferencia**: al reducir el número de pasos de decodificación del modelo grande, se disminuye el consumo de GPU y el coste por petición en entornos con alta demanda.
- **Evaluación de configuraciones de decodificación especulativa**: los 47 checkpoints disponibles permiten probar diferentes puntos de entrenamiento (épocas y pasos) para encontrar el equilibrio óptimo entre tasa de aceptación de draft y sobrecarga computacional.
- **Investigación en métodos de aceleración**: sirve como caso de estudio para comparar EAGLE3 con otras técnicas de decodificación especulativa (Medusa, EAGLE-2) en términos de speedup y calidad de generación.
- **Sistemas de generación de código en tiempo real**: en un IDE o CLI que use Qwen3-4B-Instruct-2507 para autocompletado, el draft model reduce la latencia de sugerencia de código, mejorando la fluidez de la interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, tasas de aceptación de draft, speedup medido ni comparaciones con otros métodos de decodificación especulativa. Se recomienda realizar pruebas propias con la carga de trabajo específica para determinar el rendimiento real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo pesa aproximadamente 0,4 GB en bfloat16 (202,7M parámetros), por lo que requiere menos de 1 GB de VRAM adicional al modelo objetivo.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM puede alojar tanto el draft model como el modelo objetivo (Qwen3-4B-Instruct-2507). Por ejemplo, NVIDIA RTX 3060, RTX 4070, A10, L4 o superiores. Para despliegues con alta concurrencia, se recomiendan GPUs de centro de datos como A100 o H100.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4060 Ti con cuantización del modelo objetivo, aunque la ventaja de la decodificación especulativa es mayor en GPUs con capacidad de procesamiento paralelo elevado.
- **Opciones de despliegue**: SGLang (backend principal, con soporte FlashInfer), vLLM (si tiene soporte EAGLE3 en la versión utilizada), y otros frameworks compatibles con el formato LlamaForCausalLMEagle3. No se recomienda llama.cpp u Ollama para este modelo, ya que su función es específica de servidores de inferencia.
- **Latencia y throughput estimados**: no disponibles. Dependen de la configuración del árbol de especulación, la tasa de aceptación del draft y la carga del servidor. Se recomienda realizar benchmarks propios con la herramienta de SGLang.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de especulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3 (este) | 202,7M | 2048 (entrenamiento) | EAGLE3 | Apache-2.0 | Hugging Face |
| Draft model EAGLE-2 para otras bases (p. ej., Llama-2) | variable | variable | EAGLE-2 | variable | Hugging Face |
| Medusa (modelo draft para Llama-2-7B) | ~1B (aprox.) | 4096 | Medusa | Apache-2.0 | Hugging Face |

No hay datos públicos de rendimiento comparativo entre estos modelos. La elección entre EAGLE3, EAGLE-2 o Medusa depende del modelo objetivo y del framework de inferencia soportado. Este modelo está específicamente entrenado para Qwen3-4B-Instruct-2507, por lo que no es intercambiable con otros modelos base.

## Limitaciones y advertencias

- **No es un modelo de chat**: no debe usarse como modelo independiente para generar respuestas a usuarios. Solo tiene sentido como componente de decodificación especulativa junto al modelo objetivo.
- **Sin métricas de seguridad ni evaluación**: la model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad. No se conocen sesgos, riesgos de alucinación ni comportamientos tóxicos del modelo draft.
- **Dependencia de SGLang**: el uso práctico requiere una versión de SGLang con soporte EAGLE3 y FlashInfer. Otros frameworks pueden no ser compatibles.
- **Ventana deslizante de 512 tokens**: limita la capacidad del draft para modelar dependencias de largo alcance, lo que puede reducir la tasa de aceptación en tareas que requieren contexto extenso.
- **Datos de entrenamiento**: se usó ShareGPT, que contiene conversaciones reales de usuarios con posible presencia de datos personales o sesgos. No se detalla el proceso de limpieza ni de anonimización.
- **Estado del checkpoint**: el repositorio contiene un checkpoint intermedio (época 1, paso 30000) que puede no ser el óptimo de la serie. Se recomienda evaluar otros checkpoints de la colección.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo objetivo `Qwen3-4B-Instruct-2507` también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-30000
- Checkpoint de la época 1, paso 30000 (sin ventana deslizante explícita): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Checkpoint de la época 2, paso 55000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-55000
- Repositorio de Qwen3 (modelo base): https://github.com/QwenLM/Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Ficha de Qwen3-4B-Instruct-2507 en vLLM Recipes: https://vllm-vacc.vastaitech.com/Qwen/Qwen3-4B-Instruct-2507
