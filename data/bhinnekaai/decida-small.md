# BhinnekaAI/Decida-small

## Resumen

Decida-small es un motor de adjudicación automática de debates competitivos en indonesio (Bahasa Indonesia), publicado por BhinnekaAI y atribuido a Christopher Alberto Hamonangan. No es un modelo generativo de propósito general, sino un clasificador de texto construido sobre un ajuste fino de IndoBERT (`indobenchmark/indobert-base-p1`) que se combina con otros componentes locales (un cross-encoder NLI basado en DeBERTa y un modelo de embeddings `all-MiniLM-L6-v2`) para evaluar discursos de debate parlamentario y en línea.

El sistema descompone la evaluación en 10 "pilares" analíticos ponderados (relevancia semántica, integridad lógica y detección de falacias, clash de refutación, estructura argumental A-R-E-L, ponderación de impactos, dinámica del discurso, registro léxico, consistencia interna del equipo, resiliencia/comparación y densidad de ataque), cada uno con un peso definido que suma el 100 % del score final. El resultado es una puntuación flotante calibrada por equipo más una retroalimentación verbal constructiva generada por un motor de plantillas (slot-filling) con más de 250 variantes estilísticas.

Su relevancia radica en que ofrece una inferencia totalmente local (sin llamadas a LLM externos ni dependencias de nube) con una latencia declarada de aproximadamente 4,2 segundos en GPU de consumo para evaluar seis discursos densos de dos equipos. El repositorio ocupa 4,9 GB, lo que sugiere que incluye varios pesos (clasificador de falacias, cross-encoder NLI y embeddings) además del modelo base. La model card está mayoritariamente en inglés, con la salida de ejemplo en indonesio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (IndoBERT base) para clasificación de secuencias, combinado con cross-encoder NLI (DeBERTa) y embeddings densos (`all-MiniLM-L6-v2`) en un pipeline de adjudicación |
| Parámetros totales | no disponible (el modelo base `indobert-base-p1` es de tipo base; el recuento exacto no se indica en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye pesos ONNX y safetensors; no se detallan cuantizaciones) |
| Idiomas soportados | indonesio (id) |
| Licencia | apache-2.0 (la model card muestra además un badge MIT, lo que genera ambigüedad) |
| Formato de pesos | safetensors, ONNX, PyTorch |

## Arquitectura y entrenamiento

El componente central es un ajuste fino de IndoBERT (`indobenchmark/indobert-base-p1`) configurado como clasificador de secuencias para detección de falacias y evaluación semántica, orientado al registro formal de la argumentación en indonesio. Sobre él se orquesta un pipeline con tres piezas adicionales: un cross-encoder NLI local (basado en DeBERTa) para detectar contradicciones y medir el clash de refutación, un modelo de embeddings (`all-MiniLM-L6-v2`) para similitud coseno densa frente al centroide de la moción, y reglas estructurales/heurísticas (patrones regex, matrices de transición entre párrafos, índices de diversidad léxica) para los pilares de estructura, dinámica y estilo.

El sistema no es un LLM generativo: la retroalimentación verbal se produce mediante un motor de síntesis combinatoria por slot-filling con más de 250 variantes estilísticas, que cita evidencias reales del equipo ganador. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal, dado que no aplican a este tipo de arquitectura.

## Capacidades

- Clasificación de texto para detección de falacias lógicas en argumentación en indonesio.
- Evaluación semántica de relevancia respecto a una moción de debate (similitud coseno contra centroide).
- Detección de contradicciones y medición de clash de refutación mediante NLI cross-encoder.
- Puntuación multicriterio en 10 pilares ponderados con suma del 100 %.
- Generación de retroalimentación verbal constructiva y no enjuiciadora mediante plantillas combinatorias.
- Análisis estructural de argumentos (patrón A-R-E-L: aserción, razonamiento, evidencia, enlace).
- Medición de dinámica del discurso, consistencia interna del equipo y densidad informativa.
- Inferencia 100 % local en PyTorch, sin llamadas a LLM externos ni dependencias de nube.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el pipeline procesa múltiples discursos de forma secuencial.
- Capacidades multilingües: limitadas al indonesio.

## Casos de uso

- Adjudicación automática en torneos de debate parlamentario: el sistema evalúa los seis discursos de ambos equipos y emite un ganador con margen y desglose por pilar, adecuado para competiciones con muchos emparejamientos y pocos jueces disponibles.
- Formación de debatientes: la retroalimentación verbal cita evidencias concretas del propio discurso, lo que permite a los estudiantes identificar falacias y mejorar la estructura A-R-E-L sin depender de un entrenador humano.
- Evaluación formativa en aulas de lengua y argumentación: el clasificador IndoBERT detecta falacias y mide registro léxico formal, útil para calificar ejercicios escritos de argumentación en indonesio.
- Investigación en NLP educativo: el pipeline ofrece métricas reproducibles y locales (sin LLM externo) para estudiar la calidad argumentativa y la detección de falacias en corpus indonesios.
- Despliegue en entornos con requisitos de privacidad o sin conectividad: al ser 100 % PyTorch local, puede ejecutarse en infraestructura propia sin enviar transcripciones a servicios de terceros.
- Moderación y análisis de discurso en foros o plataformas de debate en línea: la detección de contradicciones y falacias puede señalizar intervenciones de baja calidad argumentativa.
- Evaluación comparativa de equipos en ligas online: la latencia de ~4,2 s en GPU de consumo permite procesar rondas completas en tiempo casi real.

## Benchmarks y rendimiento

La model card incluye una ejecución de muestra (no un benchmark comparativo formal) sobre la moción de transición a vehículos eléctricos:

| Pilar | Tim Pro | Tim Kontra |
|---|---|---|
| P1: Densidad semántica | 82,65 | 80,92 |
| P2: Integridad lógica | 75,00 | 25,00 |
| P3: Clash de refutación | 66,67 | 78,33 |
| P4: Estructura A-R-E-L | 52,50 | 59,17 |
| P5: Ponderación de impactos | 57,85 | 83,38 |
| P6: Dinámica del discurso | 91,56 | 93,20 |
| P7: Registro léxico | 56,75 | 78,59 |
| P8: Consistencia interna | 89,00 | 83,12 |
| P9: Resiliencia y comparación | 49,14 | 53,90 |
| P10: Ataque y densidad | 81,93 | 84,72 |
| **Total** | **69,10** | **67,39** |

Tiempo de ejecución declarado: 4,22 s. Ganador: Tim Afirmación (Pro), margen 1,71. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros sistemas de adjudicación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con un encoder base IndoBERT más un cross-encoder NLI y un modelo MiniLM, la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el autor menciona "consumer GPU hardware"; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: sí, según la afirmación de latencia de ~4,2 s en GPU de consumo; no se detalla cuál.
- Opciones de despliegue: PyTorch local; el repositorio incluye pesos ONNX y safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de este tipo).
- Latencia y throughput: ~4,22 s para evaluar dos equipos con seis discursos densos; el throughput no se especifica.

## Comparativa con modelos similares

No se dispone de información sobre sistemas comparables de adjudicación automática de debates en indonesio en la documentación proporcionada. Como referencia del componente base:

| Modelo | Tipo | Idioma | Licencia | Contexto | Uso |
|---|---|---|---|---|---|
| Decida-small (BhinnekaAI) | Pipeline de clasificación + NLI + embeddings sobre IndoBERT | Indonesio | apache-2.0 (badge MIT en la card) | no disponible | Adjudicación de debates |
| indobert-base-p1 (IndoBenchmark) | Encoder transformer base | Indonesio | no disponible en esta ficha | no disponible | Modelo base de NLP en indonesio |
| Sistemas de adjudicación con LLM externo | Generativos vía API | Multilingüe | según proveedor | según modelo | Evaluación de debates con dependencia de nube |

La comparación con alternativas de la misma categoría (motores de adjudicación de debate) no está disponible.

## Limitaciones y advertencias

- Ámbito lingüístico restringido al indonesio; no soporta castellano ni otros idiomas.
- No es un modelo generativo: la retroalimentación proviene de plantillas, lo que limita la variedad y la profundidad del análisis frente a un LLM.
- Riesgo de sesgo en la ponderación de los 10 pilares: los pesos son fijados por el autor y no se documenta su validación frente a jueces humanos.
- Posible sensibilidad a falacias o estilos argumentativos no representados en los datos de ajuste fino; no se detalla la composición del dataset.
- Ambigüedad de licencia: la model card declara apache-2.0 en los metadatos pero muestra un badge MIT; conviene verificar antes de uso comercial.
- Repositorio de 4,9 GB con múltiples componentes; el despliegue requiere gestionar el pipeline completo, no solo el clasificador.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks estándar publicados; la validación externa es inexistente.
- La latencia de 4,2 s corresponde a una GPU de consumo no especificada; el rendimiento en CPU no se documenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BhinnekaAI/Decida-small
- Perfil del autor en Hugging Face: https://huggingface.co/BhinnekaAI
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
- Modelo de embeddings citado: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
