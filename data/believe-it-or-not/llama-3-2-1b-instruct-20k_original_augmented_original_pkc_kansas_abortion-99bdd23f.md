# believe-it-or-not/Llama-3.2-1B-Instruct-20k_original_augmented_original_pkc_kansas_abortion-99bdd23f

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.2-1B-Instruct-Reference__TOG__FT`, una variante de referencia de Llama 3.2 1B Instruct publicada por Together Computer. El adaptador ha sido subido por el usuario `believe-it-or-not` bajo el identificador `Llama-3.2-1B-Instruct-20k_original_augmented_original_pkc_kansas_abortion-99bdd23f`, un nombre que sugiere un ajuste fino orientado a un conjunto de datos de 20 000 ejemplos relacionados con el tema del aborto en Kansas (PKC, posiblemente "Political Knowledge Corpus" o similar), aunque no se aporta documentación que lo confirme.

El modelo no es un modelo base completo, sino un delta de pesos que debe aplicarse sobre el checkpoint de Together Computer. El tamaño del repositorio (0,2 GB) es coherente con un adaptador LoRA de rango bajo sobre un modelo de 1 230 millones de parámetros, no con un modelo completo en precisión completa. La model card está prácticamente vacía: todos los campos de descripción, entrenamiento, evaluación y uso previsto figuran como `[More Information Needed]`, por lo que la mayor parte de la información técnica debe inferirse del modelo base y de los metadatos del repositorio.

La relevancia de esta ficha es limitada y principalmente documental: se trata de un artefacto de investigación sin descargas ni validación comunitaria, con una licencia no declarada y un pipeline no especificado. Resulta útil como ejemplo de adaptadores LoRA de temática sensible y como recordatorio de que los repositorios de PEFT sin model card completa no deben desplegarse en producción sin una auditoría previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Llama 3.2 1B Instruct); adaptador LoRA sobre el modelo base |
| Parámetros totales | 1 230 millones (modelo base); el adaptador LoRA añade un número no disponible de parámetros entrenables |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.2 1B Instruct; no verificada en este repositorio) |
| Tipos de cuantización | no disponible en el repositorio; el modelo base admite cuantizaciones estándar (int8, int4, GGUF) vía herramientas externas |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente los pesos del adaptador LoRA en formato safetensors, generados con PEFT 0.15.1, según la model card. No se especifica el rango, el alpha, las capas objetivo ni la estrategia de inicialización del adaptador. El modelo base es Llama 3.2 1B Instruct en su variante de referencia de Together Computer, un transformer decoder-only con atención por grupos (GQA), RoPE y una ventana de contexto de 128 000 tokens, entrenado originalmente por Meta con datos multilingües y ajustado con RLHF y DPO para alineamiento.

No hay información sobre el conjunto de datos de ajuste fino, el número de tokens vistos, la composición del corpus, la presencia de RLHF/DPO adicional ni las hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, precisión mixta). El nombre del repositorio sugiere un corpus de 20 000 ejemplos aumentados y un subconjunto temático sobre el aborto en Kansas, pero no se aporta ninguna evidencia documental. Tampoco se describen innovaciones técnicas propias: el valor del artefacto reside en el adaptador, no en cambios arquitectónicos.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Llama 3.2 1B Instruct.
- Comprensión y generación de código en lenguajes habituales, con calidad limitada por el tamaño de 1B.
- Razonamiento matemático básico y aritmética de varios pasos, también limitado por la escala.
- Soporte de tool calling y function calling según el formato de Llama 3.2 Instruct (no verificado tras el ajuste fino).
- Capacidad de seguir instrucciones y mantener roles de sistema, usuario y asistente.
- Capacidades multilingües heredadas del modelo base (ocho idiomas oficiales), aunque el ajuste fino puede haber sesgado la distribución hacia el inglés y hacia la temática del corpus.
- No se documentan capacidades de visión, audio, thinking mode extendido ni decodificación especulativa específicas de este adaptador.

## Casos de uso

- Investigación sobre ajuste fino temático: el adaptador sirve para estudiar cómo un LoRA de bajo rango modifica el comportamiento de un modelo de 1B en un dominio concreto (política y salud reproductiva), comparando respuestas antes y después del ajuste.
- Análisis de sesgo y alineamiento: permite auditar si el ajuste fino introduce posturas, vocabulario o sesgos específicos en torno al debate sobre el aborto, útil en estudios de NLP político.
- Clasificación y etiquetado de textos políticos: con un prompt adecuado, el modelo puede asignar categorías a fragmentos de discurso legislativo o periodístico, aunque requiere validación humana por el riesgo de alucinación.
- Generación de resúmenes de documentos legales o normativos: la ventana de 128 000 tokens del modelo base permite procesar expedientes largos, si bien la calidad a 1B es limitada.
- Prototipado rápido en entornos con recursos escasos: al ser un adaptador de 0,2 GB sobre un modelo de 1B, puede ejecutarse en una GPU consumer para pruebas de concepto antes de escalar a modelos mayores.
- Evaluación de pipelines PEFT: sirve como caso de prueba para verificar la carga de adaptadores LoRA con la librería PEFT 0.15.1 y su fusión con el modelo base en servicios de inferencia.
- Docencia y demostraciones: ejemplo didáctico de cómo se publica un adaptador sin model card completa y de los riesgos que ello conlleva para la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB para el modelo base de 1B más el adaptador; en int8, alrededor de 1,3 GB; en int4, en torno a 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3060, RTX 4090 y Apple Silicon con memoria unificada.
- Opciones de despliegue: PEFT para cargar el adaptador, transformers para inferencia directa, llama.cpp u Ollama tras convertir y fusionar el adaptador a GGUF, y vLLM o TGI para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles; para un modelo de 1B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (Llama-3.2-1B-Instruct + LoRA) | 1,23 B (base) | 128 000 (base) | no disponible | Hugging Face, 0 descargas |
| Llama 3.2 1B Instruct (Meta) | 1,23 B | 128 000 | Llama 3.2 Community License | Hugging Face, ampliamente disponible |
| Qwen2.5 1.5B Instruct | 1,54 B | 32 768 | Apache 2.0 | Hugging Face, ampliamente disponible |
| Gemma 2 2B Instruct | 2,6 B | 8 192 | Gemma Terms of Use | Hugging Face, ampliamente disponible |

La comparación es desfavorable en disponibilidad y gobernanza: frente a los modelos base de Meta, Alibaba y Google, este adaptador carece de licencia declarada, de documentación de entrenamiento y de validación comunitaria, lo que impide recomendarlo frente a las alternativas oficiales para cualquier uso en producción.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide evaluar la reproducibilidad y la calidad del ajuste.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido; además, el modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License, cuyos términos se heredan.
- Riesgo de alucinación elevado: un modelo de 1B ajustado con un corpus temático estrecho tiende a inventar datos y a sobreajustarse al vocabulario del dominio.
- Sesgo temático probable: el nombre del repositorio apunta a un corpus sobre el aborto en Kansas, lo que puede introducir posturas, terminología y encuadres específicos no neutrales.
- Degradación de capacidades generales: el ajuste fino sobre un dominio concreto puede erosionar el rendimiento en tareas generales, código y matemáticas del modelo base.
- Idiomas: no se declaran; el ajuste probablemente reduce la calidad multilingüe del modelo base.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026-11-21): metadato anómalo que sugiere un artefacto generado de forma automatizada o sintética; conviene tratarlo con cautela.
- No apto para producción sin auditoría: al no haber evaluación ni licencia clara, no debería desplegarse en sistemas que interactúen con usuarios reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Llama-3.2-1B-Instruct-20k_original_augmented_original_pkc_kansas_abortion-99bdd23f
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.2-1B-Instruct-Reference__TOG__FT
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
