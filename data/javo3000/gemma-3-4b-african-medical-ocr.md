# Javo3000/gemma-3-4b-african-medical-ocr

## Resumen

`Javo3000/gemma-3-4b-african-medical-ocr` es un ajuste multimodal publicado en HuggingFace, derivado de Gemma 3 4B y orientado a la transcripción (OCR) de registros médicos manuscritos procedentes de contextos africanos, en particular del dataset `Nigeria-Health-data-OCR-pipeline/African-Medical-Records`. El repositorio se distribuye en formato GGUF y su model card consiste fundamentalmente en un informe de evaluación sobre 57 muestras ejecutadas en una NVIDIA H200, más que en una descripción de entrenamiento.

El modelo hereda la arquitectura de Gemma 3 (transformer decoder-only con capacidad multimodal en la variante de 4B) y cuenta con 3.880.263.168 parámetros, lo que lo sitúa en la gama de modelos pequeños desplegables en una sola GPU. Su relevancia es acotada pero específica: aborda un nicho poco cubierto (digitalización de historiales clínicos manuscritos en entornos con recursos limitados), aunque los propios números reportados por el autor revelan tasas de error elevadas que lo alejan del uso clínico directo sin supervisión.

Se trata de un artefacto experimental con escasa tracción (0 descargas, 1 like en el momento del análisis) y sin licencia ni idiomas declarados, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (base Gemma 3 4B) |
| Parametros totales | 3.880.263.168 (~3,88 B) |
| Longitud de contexto | No disponible para este ajuste; la base Gemma 3 4B declara 128K tokens |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas); el informe menciona una variante AWQ (gemma-3-4b-awq) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (recuento de parámetros obtenido a partir de safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 4B, un transformer decoder-only de Google con encoder de visión para entrada de imágenes, lo que habilita tareas de OCR y comprensión de documentos escaneados. En el informe aportado se identifica la variante multimodal (`gemma-3-4b-awq`) evaluada sobre el dataset `African-Medical-Records`, pero no se documentan detalles del proceso de ajuste: ni volumen de tokens, ni composición del dataset de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La información disponible se limita al informe de evaluación, no a la fase de entrenamiento. Esto implica que se desconoce si el ajuste fue un fine-tuning supervisado sobre pares imagen-texto, una adaptación LoRA o una simple conversión a GGUF de un checkpoint existente. La innovación relevante, si la hay, reside en la especialización de dominio (documentos clínicos manuscritos africanos) y no en cambios arquitectónicos, que no se documentan.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos médicos manuscritos, con salida en texto plano.
- Comprensión de imágenes (capacidad multimodal heredada de Gemma 3 4B).
- Generación de texto conversacional (el repositorio incluye el tag `conversational`).
- Extracción de campos clínicos críticos: dosis, unidades y valores numéricos (evaluados explícitamente en el informe).
- Integración con endpoints compatibles (tag `endpoints_compatible`), lo que sugiere soporte para servidores de inferencia tipo API.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Cobertura multilingüe: no disponible (la base Gemma 3 declara más de 140 idiomas, pero no se confirma para este ajuste).
- Modo de razonamiento (thinking mode), audio o vídeo: no disponibles.

## Casos de uso

- Digitalización de historiales clínicos manuscritos: el modelo puede transcribir formularios escaneados a texto estructurado, reduciendo el esfuerzo de mecanografiado manual (el informe reporta un ahorro de tecleo, KSR, del 63,60 %).
- Pre-relleno de campos en sistemas de historia clínica electrónica: a partir de la imagen del formulario, generar borradores que un operador humano revise y confirme, dado el 34,70 % de error en campos críticos.
- Triaje documental en campañas sanitarias: clasificación y transcripción preliminar de grandes volúmenes de registros en contextos con personal administrativo limitado.
- Extracción de datos para investigación epidemiológica: convertir lotes de documentos manuscritos en datasets tabulares, siempre con validación posterior por la tasa de omisión del 29,99 %.
- Asistencia a personal sanitario en entornos de baja conectividad: al distribuirse en GGUF, puede ejecutarse localmente en hardware modesto sin depender de la nube.
- Automatización de archivo y cumplimiento: generación de texto indexable a partir de documentos en papel para su búsqueda posterior, aceptando revisión humana por la tasa de alucinación del 21,24 %.
- Prototipado e investigación en OCR médico: como punto de partida sobre el que aplicar fine-tuning adicional con datos propios.

## Benchmarks y rendimiento

Datos extraídos del informe de evaluación del autor (57 muestras, NVIDIA H200):

| Metrica | Resultado | Interpretacion |
|---|---|---|
| Character Error Rate (CER) | 36,40 % | Precisión a nivel de carácter: 63,60 % |
| Word Error Rate (WER) | 34,93 % | Precisión a nivel de palabra: 65,07 % |
| Keystroke Savings Rate (KSR) | 63,60 % | Ahorro de tecleo frente a entrada manual |
| Critical-Field Error Rate | 34,70 % | Frecuencia de error en dosis, unidades y valores numéricos |
| Missing-Field (Omission) Rate | 29,99 % | Entidades clínicas omitidas respecto al ground truth |
| Hallucination Rate | 21,24 % | Palabras generadas sin respaldo en la imagen |

Rendimiento de servicio (H200):

| Metrica | Media | P50 (mediana) | P95 |
|---|---|---|---|
| Latencia extremo a extremo | 0,91 s | 0,78 s | 2,20 s |
| Velocidad de generación | 212,66 tok/s | 215,88 tok/s | 296,25 tok/s |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB en cuantización GGUF de 4 bits y aproximadamente 4,5-5 GB en 8 bits para un modelo de 3,88 B de parámetros.
- GPU recomendadas: el informe usa una NVIDIA H200 (137.471 MiB de VRAM), muy por encima de lo necesario; para inferencia basta una GPU mucho menor.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4070) en cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales por el formato GGUF; vLLM y TGI quedan sujetas a soporte de GGUF/AWQ; el tag `endpoints_compatible` indica compatibilidad con servidores de endpoints.
- Latencia y throughput: medidos sobre H200, con 0,91 s de media extremo a extremo y 212,66 tok/s de generación; no se dispone de cifras para GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-4b-african-medical-ocr | ~3,88 B | No disponible (base: 128K) | OCR médico especializado (ajuste) | No disponible | HuggingFace (GGUF) |
| google/gemma-3-4b-it | 4 B | 128K tokens | Multimodal general e instrucciones | Gemma Terms of Use | HuggingFace |
| MedGemma 4B | 4 B | No disponible | Multimodal médico (texto e imagen) | Gemma / uso médico | HuggingFace y DeepMind |

Los datos de rendimiento comparativos entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Tasa de error de carácter del 36,40 % y de palabra del 34,93 %: insuficiente para uso clínico autónomo.
- Error del 34,70 % en campos críticos (dosis, unidades, valores numéricos), con riesgo directo para la seguridad del paciente si no media revisión humana.
- Tasa de omisión del 29,99 %: el modelo deja sin transcribir entidades clínicas presentes en el original.
- Tasa de alucinación del 21,24 %: genera contenido no respaldado por la imagen, especialmente problemático en documentación médica.
- Gran variabilidad según la caligrafía del contribuyente: la CER oscila entre el 17,0 % (Fatukasi Sarah) y el 64,4 % (Promise Oyin), y la tasa de error crítico alcanza el 55,7 % en el peor caso.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial. La base Gemma 3 está sujeta a los Gemma Terms of Use, pero el repositorio no lo declara.
- Idiomas soportados no declarados; se desconoce el comportamiento fuera del dominio nigeriano evaluado.
- Adopción prácticamente nula (0 descargas, 1 like): sin validación por parte de la comunidad.
- Evaluación sobre solo 57 muestras, lo que limita la significación estadística de las métricas reportadas.
- Sin información sobre sesgos, datos de entrenamiento ni proceso de alineación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Javo3000/gemma-3-4b-african-medical-ocr
- Gemma 3 4B IT (base): https://huggingface.co/google/gemma-3-4b-it
- Repositorio Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- MedGemma (Google DeepMind): https://deepmind.google/models/gemma/medgemma/
- MedGemma (Google for Developers): https://developers.google.com/health-ai-developer-foundations/medgemma
- MedGemma (AI Wiki): https://aiwiki.ai/wiki/medgemma
