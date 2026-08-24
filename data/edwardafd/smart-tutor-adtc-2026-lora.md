# edwardafd/smart-tutor-adtc-2026-lora

## Resumen

El modelo `edwardafd/smart-tutor-adtc-2026-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-Math-1.5B-Instruct`. Desarrollado por edwardafd, está diseñado como un asistente de tutoría inteligente, probablemente orientado a la resolución de problemas matemáticos y conversación educativa. El adaptador se ha creado en el contexto del Africa Deep Tech Challenge 2026 (ADTC 2026), una competición centrada en ejecutar aplicaciones de modelos de lenguaje en portátiles de gama media y baja, con 8 GB de RAM y sin GPU dedicada.

El modelo es relevante porque demuestra cómo se pueden adaptar modelos matemáticos ya existentes mediante técnicas de parámetros eficientes (LoRA) para tareas específicas, minimizando el coste computacional y de almacenamiento. El adaptador pesa 0.2 GB, lo que lo hace viable para entornos con recursos limitados, alineándose con el objetivo del ADTC 2026 de hacer la IA accesible en África. Sin embargo, la documentación pública es escasa: no se especifican los datos de entrenamiento, hiperparámetros ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen2.5-Math-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA añade una fracción de los 1.5B del base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (se espera que soporte cuantizaciones como FP16, INT8, INT4, pero no se confirma) |
| Idiomas soportados | No disponibles (el base Qwen2.5 soporta múltiples idiomas, pero no se indica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de fine-tuning eficiente que congela los pesos del modelo base e inyecta matrices de baja dimensión en las capas de atención y de MLP. Esto reduce drásticamente el número de parámetros entrenables y el espacio de almacenamiento. El adaptador se ha entrenado con aprendizaje supervisado (SFT) usando las librerías PEFT 0.20.0 y TRL (Transformers Reinforcement Learning). No se ha publicado información sobre el conjunto de datos utilizado, el número de tokens de entrenamiento ni los hiperparámetros (tasa de aprendizaje, rango del adaptador, etc.). El modelo base, Qwen2.5-Math-1.5B-Instruct, es un modelo de 1.500 millones de parámetros especializado en razonamiento matemático, con una arquitectura transformer convencional y optimizado para tareas de instrucción y conversación.

## Capacidades

- Generación de texto y razonamiento matemático: hereda las capacidades del modelo base Qwen2.5-Math-1.5B-Instruct, que incluyen resolución de problemas aritméticos y algebraicos, explicaciones paso a paso y razonamiento simbólico.
- Conversación de tutoría: el nombre del modelo sugiere que está afinado para mantener diálogos educativos, respondiendo preguntas de estudiantes y proporcionando explicaciones didácticas.
- Soporte de tool calling: no especificado en la información disponible.
- Capacidades multilingües: no confirmadas para este adaptador, aunque el modelo base puede manejar varios idiomas.
- Capacidades especiales: no se indican modos de thinking, visión o audio.

## Casos de uso

- Tutoría de matemáticas para estudiantes: el modelo puede ser desplegado en un portátil sin GPU para explicar conceptos de álgebra, cálculo o geometría, respondiendo a preguntas y guiando el razonamiento.
- Práctica de ejercicios interactiva: se puede integrar en una aplicación de chat para generar problemas matemáticos, corregir respuestas y ofrecer retroalimentación paso a paso.
- Asistente de estudio para preparación de exámenes: con un historial de conversación largo (si el contexto lo permite), puede mantener un hilo de preguntas y respuestas sobre un tema específico.
- Herramienta educativa en entornos con recursos limitados: dado su tamaño reducido (adaptador de 0.2 GB), puede ejecutarse en hardware antiguo o en CPU, siendo adecuado para escuelas de África u otras regiones con baja conectividad.
- Integración en aplicaciones de mensajería o web para resolver dudas matemáticas en tiempo real, sin depender de servicios en la nube.
- Prototipado rápido de chatbots educativos: al ser un adaptador LoRA, es fácil de cargar y combinar con otros adaptadores para experimentar con distintos dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

- El modelo base (Qwen2.5-Math-1.5B-Instruct) requiere aproximadamente 3 GB de memoria en FP16, y unos 1.5 GB en INT4. El adaptador LoRA añade menos de 0.2 GB.
- Para inferencia en GPU, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso una Jetson Nano).
- En CPU, puede ejecutarse con 8 GB de RAM usando cuantización INT4 o INT8, aunque la latencia será mayor.
- Opciones de despliegue: el formato safetensors y la integración con Transformers permiten usar vLLM, llama.cpp, Ollama o TGI (si se exporta a GGUF). No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información para comparar este adaptador con otros modelos de tutoría matemática. Sin embargo, se puede comparar con el modelo base Qwen2.5-Math-1.5B-Instruct y con otros adaptadores LoRA similares, pero no hay datos públicos de rendimiento.

## Limitaciones y advertencias

- Documentación incompleta: la model card no incluye detalles sobre datos de entrenamiento, hiperparámetros, evaluación ni sesgos.
- Riesgo de alucinación: al ser un modelo pequeño (1.5B) y un adaptador no validado, puede generar respuestas incorrectas o inventar hechos, especialmente en temas fuera de su dominio matemático.
- Sesgos no evaluados: no se han realizado análisis de sesgos de género, culturales o lingüísticos.
- Limitaciones de contexto: la ventana de contexto del modelo base no se ha especificado, pero para modelos de 1.5B suele ser de 32k tokens; sin embargo, no se confirma si el adaptador conserva esta capacidad.
- Licencia no definida: no se especifica la licencia del adaptador, lo que dificulta su uso comercial o su redistribución.
- Soporte de idiomas incierto: aunque el base es multilingüe, el adaptador puede estar entrenado predominantemente en inglés, lo que limitaría su uso en otros idiomas.
- Despliegue en producción: sin pruebas de rendimiento ni estabilidad, no se recomienda su uso en entornos críticos sin validación previa.

## Enlaces

- [HuggingFace - edwardafd/smart-tutor-adtc-2026-lora](https://huggingface.co/edwardafd/smart-tutor-adtc-2026-lora)
- [Africa Deep Tech Challenge 2026 - Devpost](https://adtc-2026.devpost.com/)
- [Africa Deep Tech Challenge 2026 - Web oficial](https://africadeeptech.org/challenge-2026/)
- [Repositorio de referencia de la competición (GitHub)](https://github.com/2kDarki/adtc-2026) (contiene otros modelos de la competición)
