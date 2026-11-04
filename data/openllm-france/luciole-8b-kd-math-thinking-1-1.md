# OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1

## Resumen

Luciole-8B-KD-Math-Thinking-1.1 es un modelo de lenguaje causal de 8.360 millones de parámetros desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por Bpifrance a través del programa France 2030. Se trata de la primera iteración post-entrenada (SFT con trazas de razonamiento más DPO) sobre Luciole-8B-KD-Math-Base, un modelo base multilingüe francés-inglés. El entrenamiento se ejecutó en el supercomputador Jean Zay de GENCI, gestionado por IDRIS.

El modelo está diseñado para instrucciones generales con capacidad de razonamiento explícito (thinking traces), cubriendo matemáticas, ciencia, código, chat general, RAG y traducción. Su relevancia radica en ser un bloque abierto (pesos, receta y datos publicados bajo Apache 2.0) para la comunidad francófona, aunque el post-entrenamiento se realizó casi íntegramente con datos en inglés, lo que limita de momento su rendimiento real en francés.

La ventana de contexto de entrenamiento es de 16.384 tokens. El modelo se distribuye en formato safetensors con un repositorio de 16,7 GB y cuenta con versiones intermedias publicadas (SFT con thinking) además del checkpoint final alineado con DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de Nemotron; tag `nemotron` en el repo) |
| Parametros totales | 8.360.209.920 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 16.384 tokens (longitud máxima de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 8,36 mil millones de parámetros construido sobre Luciole-8B-Base (etiquetado como `nemotron` en el repositorio), y especializado posteriormente mediante una fase intermedia Luciole-8B-KD-Math-Base. El post-entrenamiento consta de dos etapas: primero un SFT sobre datos de instrucciones con trazas de razonamiento (2,6 millones de muestras, 4 épocas, LR máximo 2,0e-5 con scheduler coseno, batch de 2048 y secuencias de hasta 16.384 tokens), seguido de una fase de alineación con Direct Preference Optimization sobre 284.000 pares de preferencia con trazas de thinking (1 época, LR máximo 3,0e-8 con scheduler lineal, batch de 128, β = 5).

Los datos de post-entrenamiento cubren matemáticas, ciencia, código, chat general, RAG y traducción, y se publican abiertamente en el dataset Luciole-PostTraining-Dataset-1.1. La componente "KD-Math" del nombre sugiere destilación de conocimiento orientada a matemáticas, aunque la model card no detalla el profesor ni el procedimiento exacto de destilación. El informe técnico está anunciado como "coming soon".

## Capacidades

- Generación de texto e instrucciones generales en inglés y francés.
- Razonamiento explícito mediante trazas de pensamiento (thinking mode) entrenadas en SFT y DPO.
- Razonamiento matemático y científico, con especialización declarada en matemáticas (KD-Math).
- Generación de código, aunque el autor advierte que el entrenamiento se centró en instrucciones generales y que se requeriría entrenamiento adicional para tareas específicas de código.
- Traducción entre idiomas presentes en los datos de entrenamiento.
- Soporte experimental de tool calling / function calling: el modelo ha visto datos de este tipo, pero muestra tendencia a rechazar en exceso las peticiones de llamada a herramientas.
- Uso en pipelines RAG (recomendado explícitamente por el autor para paliar limitaciones de memoria).
- Capacidades multilingües limitadas a fr y en; el post-entrenamiento se realizó casi exclusivamente en inglés.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en francés con razonamiento visible: el modelo puede gestionar diálogos multi-turno de hasta 16.384 tokens y exponer trazas de pensamiento para auditar la respuesta; adecuado para prototipos de atención al cliente en organismos francófonos, con la advertencia de que el post-entrenamiento es mayoritariamente anglófono.
- Tutoría de matemáticas y ciencia: la especialización KD-Math y el modo thinking permiten generar soluciones paso a paso verificables, útiles en plataformas educativas que necesitan mostrar el razonamiento intermedio.
- Generación de código asistida en entornos de desarrollo: puede integrarse en asistentes de IDE o pipelines de CI/CD para sugerencias y explicaciones de código, aunque el autor recomienda fine-tuning adicional para producción en esta tarea.
- Pipeline RAG documental: con 16.384 tokens de contexto puede ingerir varios fragmentos recuperados y sintetizar respuestas citando fuentes; el autor lo recomienda explícitamente para compensar la limitada memoria factual de un modelo de 8B.
- Traducción automática fr-en y en-fr en flujos internos: adecuado para borradores y pre-traducción con revisión humana, dado el soporte declarado de ambos idiomas.
- Investigación en alineación y post-entrenamiento: al publicarse pesos, receta (SFT + DPO con hiperparámetros) y datos, sirve como base reproducible para estudiar el efecto del thinking y del DPO en modelos de 8B.
- Despliegue soberano en infraestructura europea: licencia Apache 2.0 y origen francés lo hacen apto para administraciones y empresas que requieren trazabilidad del origen del modelo y ausencia de restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación, pero los datos numéricos no están presentes en la información proporcionada y el informe técnico figura como "coming soon".

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 16,7 GB de pesos más overhead de KV cache, lo que sitúa el requisito práctico en torno a 20-24 GB para secuencias moderadas; en cuantización de 8 bits, alrededor de 8,4 GB de pesos; en 4 bits, aproximadamente 4,2 GB de pesos. Estas cifras son estimaciones por tamaño y no proceden de mediciones publicadas por el autor.
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio de alta concurrencia con contexto completo de 16.384 tokens; L40S o RTX 6000 Ada para despliegues de una sola GPU en BF16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090/4080 o superiores si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: la model card documenta explícitamente Ollama y vLLM; al ser pesos safetensors estándar, también es compatible con TGI y con conversión a GGUF para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-8B-KD-Math-Thinking-1.1 | 8,36B | 16.384 | fr, en | Apache 2.0 | Post-entrenamiento SFT + DPO con thinking; datos y receta abiertos |
| Lucie-7B (OpenLLM-France) | 7B | no disponible en esta ficha | fr, en | Apache 2.0 | Predecesor del linaje francés de OpenLLM-France |
| Mistral-7B-Instruct | 7,3B | 32.768 | en (multilingüe parcial) | Apache 2.0 | Referencia europea de 7B con contexto superior |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 | multilingüe | Llama 3.1 Community License | Contexto muy superior y ecosistema maduro; licencia no plenamente permisiva |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado resultados de benchmarks de Luciole-8B-KD-Math-Thinking-1.1 en la información proporcionada.

## Limitaciones y advertencias

- El post-entrenamiento se realizó casi íntegramente con datos en inglés, por lo que el rendimiento real en francés puede ser inferior al esperado por el etiquetado bilingüe.
- Aunque ha pasado alineación de seguridad durante la fase DPO de thinking, puede generar salidas inseguras ante determinadas entradas.
- No fue entrenado con prompts de identidad: puede responder incorrectamente sobre su propio nombre u origen.
- Riesgo de alucinación inherente a su tamaño; el autor recomienda integrarlo en un pipeline RAG para mejorar la factualidad.
- Tendencia a rechazar en exceso las peticiones de tool calling; esta capacidad es experimental.
- Contexto limitado a 16.384 tokens, inferior al de modelos contemporáneos de su clase; el autor recomienda extender el entrenamiento con secuencias más largas.
- Entrenamiento centrado en instrucciones generales: requiere fine-tuning adicional para código y matemáticas en producción.
- Es la primera iteración de una serie en desarrollo activo; se anuncian versiones con mayor proporción de datos en francés.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de validar sesgos y seguridad en el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Thinking-1.1
- Modelo base intermedio: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Base
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- Proyecto OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto del proyecto: contact@openllm-france.fr
