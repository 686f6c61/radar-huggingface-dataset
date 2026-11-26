# Lazzzaroo/PaolaAI-UNAM

## Resumen

PaolaAI-UNAM es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario Lazzzaroo en Hugging Face. Se presenta como un modelo conversacional de orientación socrática especializado en el proceso de admisión a universidades mexicanas (UNAM, IPN y UAM), y se distribuye en formato GGUF con cuantización Q4_K_M para su ejecución en Ollama y vLLM. El modelo parte de la versión cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-7B-Instruct-bnb-4bit) y conserva la licencia Apache 2.0 del modelo original.

La relevancia de este modelo es acotada y de nicho: se trata de un proyecto personal (0 descargas y 0 likes en el momento de la consulta) orientado a un caso de uso muy concreto, la preparación del examen de admisión universitario en México. No se han publicado detalles sobre el proceso de entrenamiento, el volumen de datos utilizados ni resultados de evaluación, por lo que su calidad real no puede verificarse a partir de la información disponible.

Arquitectónicamente hereda las características de Qwen2.5-7B-Instruct: un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), con soporte nativo de instrucciones y una ventana de contexto amplia en el modelo base. Sin embargo, la model card publicada es extremadamente escueta y no documenta ni el dataset de ajuste ni las capacidades efectivas tras el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero no se confirma que el fine-tuning lo conserve) |
| Tipos de cuantizacion | GGUF Q4_K_M (única variante publicada en el repo) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamaño del repo: 4,7 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parámetros. El punto de partida declarado es la variante cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-7B-Instruct-bnb-4bit), lo que sugiere que el ajuste se realizó mediante QLoRA o una técnica equivalente de bajo rango sobre pesos cuantizados, aunque la model card no lo confirma explícitamente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros del ajuste. Tampoco se documentan innovaciones técnicas propias. La única característica diferencial declarada es el enfoque "socrático" aplicado al dominio de admisión universitaria, sin que se detalle cómo se implementó (prompting, currículo de datos o formato de conversación).

## Capacidades

- Generación de texto conversacional en español, orientada a diálogos multi-turno.
- Estilo socrático: se declara que guía al usuario mediante preguntas en lugar de dar respuestas directas, aunque no se aportan ejemplos ni evaluaciones que lo verifiquen.
- Especialización declarada en temáticas de admisión a UNAM, IPN y UAM (temario, orientación académica, preparación de examen), sin documentación del alcance real.
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (razonamiento, código, matemáticas, tool calling) potencialmente presentes, pero no garantizadas ni documentadas tras el fine-tuning.
- Soporte multilingüe: la model card declara únicamente español; no se confirma el mantenimiento de las capacidades multilingües del modelo base.
- No se documentan modos de razonamiento explícito (thinking mode), visión, audio ni otras capacidades especiales.

## Casos de uso

- Preparación del examen de admisión a la UNAM: el modelo puede mantener conversaciones de repaso sobre temario (matemáticas, física, química, biología, historia) y plantear preguntas guiadas al estudiante, aprovechando el enfoque socrático declarado.
- Orientación vocacional básica: puede sostener diálogos exploratorios sobre elección de carrera dentro de la oferta de UNAM, IPN y UAM, siempre que se valide la información institucional contra fuentes oficiales.
- Tutoría de estudio conversacional: uso en entornos locales (Ollama) para sesiones de repaso sin conexión, gracias al formato GGUF Q4_K_M que cabe en equipos de consumo.
- Simulación de entrevistas o exámenes orales: el modelo puede generar preguntas de práctica y evaluar respuestas de forma cualitativa en un contexto educativo.
- Prototipado de asistentes educativos en español: sirve como base para experimentar con pipelines RAG sobre temarios oficiales, aunque requeriría validación rigurosa.
- Despliegue en laboratorios o aulas con hardware limitado: su cuantización Q4_K_M permite ejecución en GPU de consumo o incluso CPU, útil para demos docentes de modelos ajustados en español.
- Investigación sobre fine-tuning de bajo coste: como ejemplo reproducible de adaptación de Qwen2.5-7B a un dominio específico en español, aunque la falta de documentación limita su valor metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4,5-5,5 GB para el archivo GGUF Q4_K_M (4,7 GB de pesos) más overhead de contexto y caché KV; con contextos largos la demanda crece proporcionalmente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el ámbito profesional, A100 o H100 para mayor throughput, aunque el modelo es sobredimensionado para estas GPUs en términos de capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM para contexto moderado; también puede ejecutarse en CPU con llama.cpp u Ollama, a menor velocidad.
- Opciones de despliegue: Ollama (formato nativo del repo), llama.cpp, vLLM (mencionado por el autor, aunque vLLM requiere normalmente pesos en safetensors o conversión previa), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PaolaAI-UNAM (este modelo) | 7,6 B | No disponible | Apache 2.0 | GGUF Q4_K_M en HF | Fine-tuning de nicho, sin benchmarks ni documentación de entrenamiento |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 | Pesos completos y GGUF en HF | Modelo base; benchmarks públicos amplios, multilingüe |
| Mistral-7B-Instruct | 7,2 B | 32.768 tokens | Apache 2.0 | Pesos y GGUF en HF | Alternativa generalista con buen soporte de tooling |
| Llama 3.1 8B Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | Pesos y GGUF en HF | Restricciones de licencia para uso comercial a gran escala |

La comparación directa con el modelo base es la más informativa: PaolaAI-UNAM no aporta datos que permitan afirmar mejoras medibles sobre Qwen2.5-7B-Instruct, y su especialización es tan acotada que no resulta intercambiable con modelos generalistas en la mayoría de escenarios.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base en ninguna tarea.
- Documentación mínima: la model card no describe dataset, metodología de entrenamiento ni hiperparámetros, lo que impide reproducir o auditar el modelo.
- Riesgo elevado de alucinación en información institucional (fechas de examen, requisitos, planes de estudio): el modelo puede generar datos falsos sobre procesos de admisión y debe validarse contra fuentes oficiales.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no puede evaluarse el sesgo introducido; el modelo base Qwen2.5 tiene sesgos conocidos documentados por su autor original.
- Contexto no confirmado: aunque Qwen2.5-7B-Instruct soporta 131.072 tokens, no se garantiza que el fine-tuning conserve esa ventana ni su calidad en contextos largos.
- Idiomas: declarado solo para español; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de mantenimiento, comunidad ni soporte.
- Formato único: solo se publica GGUF Q4_K_M, lo que limita el ajuste fino adicional y el despliegue en pipelines que requieran safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lazzzaroo/PaolaAI-UNAM
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
