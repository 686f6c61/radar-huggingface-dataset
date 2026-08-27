# ArthT/phi4-14b-a7ctx-badmed-seed0-v2

## Resumen

El modelo `ArthT/phi4-14b-a7ctx-badmed-seed0-v2` es un fine-tuning del modelo Phi-4 de Microsoft, un transformer denso de 14 000 millones de parámetros conocido por su fuerte rendimiento en razonamiento y matemáticas gracias al entrenamiento con datos sintéticos. Este repositorio concreto, publicado por el usuario ArthT, parece estar orientado a un dominio médico (la etiqueta "badmed" sugiere un ajuste para terminología o tareas médicas) y utiliza una ventana de contexto reducida de aproximadamente 7 000 tokens (indicado por "a7ctx"). Sin embargo, la model card no proporciona información detallada sobre el proceso de entrenamiento, los datos utilizados ni la licencia, por lo que gran parte de las especificaciones deben considerarse no disponibles.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers, lo que facilita su integración en pipelines existentes. Aunque no se han publicado métricas de evaluación ni detalles de entrenamiento, su base Phi-4 sugiere capacidades sólidas en tareas de razonamiento, generación de código y comprensión del lenguaje, siempre que el fine-tuning no haya degradado significativamente esas habilidades. La relevancia actual radica en la posibilidad de usar un modelo de 14B ajustado a un dominio específico con requisitos de hardware moderados, aunque la falta de documentación limita su adopción en entornos de producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4) |
| Parametros totales | 14 000 millones (aprox., segun la base Phi-4) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Aproximadamente 7 000 tokens (segun el tag "a7ctx"; no confirmado) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors, sin GGUF u otros formatos) |
| Idiomas soportados | No disponibles (la model card no especifica; Phi-4 original soporta principalmente ingles) |
| Licencia | No disponible (la model card no indica licencia; el Phi-4 original es MIT, pero este fine-tuning podria tener otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-4, un transformer decoder-only con 14 000 millones de parametros, entrenado por Microsoft con un enfasis en datos sinteticos de alta calidad y tecnicas de post-entrenamiento avanzadas para mejorar el razonamiento. El modelo original destaca en tareas de matematicas y ciencias, superando a modelos de tamano similar en benchmarks como MATH y GPQA. En este repositorio, el autor ArthT ha realizado un fine-tuning adicional, probablemente sobre datos medicos (por la etiqueta "badmed"), y ha reducido la ventana de contexto a unos 7 000 tokens, posiblemente para optimizar el uso de memoria o adaptarse a un caso de uso especifico. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni si se emplearon tecnicas como RLHF o DPO. El tag "unsloth" sugiere que se utilizo la libreria Unsloth para el fine-tuning, conocida por su eficiencia en memoria y velocidad, pero no hay confirmacion explicita.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Phi-4, conserva capacidades de razonamiento logico y matematico, aunque el fine-tuning medico podria haberlas alterado.
- Comprension de lenguaje medico: la etiqueta "badmed" indica un posible ajuste para terminologia, historiales clinicos o literatura biomedica, aunque no hay evidencia publica de su rendimiento en estas tareas.
- Generacion de codigo: Phi-4 original tiene habilidades de programacion; es probable que el fine-tuning no las haya eliminado por completo, pero no se ha verificado.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card; Phi-4 original no lo incluye de forma nativa, aunque se puede adaptar).
- Soporte de agentes y multi-step reasoning: no confirmado; depende de la implementacion del usuario.
- Capacidades multilingues: no disponibles; Phi-4 original esta principalmente entrenado en ingles, y este fine-tuning no indica lo contrario.
- Capacidades especiales: no se reportan modos de pensamiento, vision ni audio.

## Casos de uso

- Asistencia en documentacion clinica: el modelo podria ayudar a redactar resumenes de historiales medicos o generar informes estructurados a partir de notas de consulta, aprovechando su posible ajuste medico. Requiere validacion previa con datos reales.
- Extraccion de informacion de articulos cientificos: dado su posible entrenamiento en terminologia biomedica, podria resumir abstracts o extraer entidades como farmacos, enfermedades o dosis, aunque la ventana de 7k tokens limita el procesamiento de documentos largos.
- Chatbot de soporte para pacientes: con un fine-tuning adecuado, podria responder preguntas frecuentes sobre sintomas o tratamientos, pero la falta de evaluacion de seguridad hace recomendable un filtro humano.
- Generacion de codigo en entornos de investigacion: si el fine-tuning no ha degradado las habilidades de programacion, podria usarse para escribir scripts de analisis de datos medicos (Python, R) en entornos de investigacion.
- Razonamiento sobre casos clinicos simulados: en entornos educativos, podria plantear y resolver casos hipoteticos para formacion de estudiantes de medicina, siempre con supervision.
- Integracion en pipelines de NLP biomedico: como modelo base para tareas de clasificacion o NER, aunque requeriria un fine-tuning adicional y una evaluacion comparativa con modelos especificos como BioBERT o PubMedBERT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y no hay referencias externas que reporten el rendimiento de este fine-tuning concreto. Se desconoce si el ajuste medico mejora o degrada las capacidades originales de Phi-4 en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14 000 millones de parametros en precision fp16, se necesitan aproximadamente 28 GB de VRAM. Con cuantizacion de 8 bits, unos 14 GB; con 4 bits, unos 7 GB. Sin embargo, no se proporcionan archivos cuantizados en el repositorio, por lo que el usuario deberia generarlos.
- GPU recomendadas: para fp16, una A100 (40 GB) o RTX 4090 (24 GB) podrian ser suficientes con optimizaciones de memoria. Para cuantizacion de 4 bits, una RTX 3090 o 4070 (12-16 GB) podrian bastar.
- Si cabe en consumer GPU: si, con cuantizacion de 4 bits y usando librerias como llama.cpp o Unsloth, es posible ejecutarlo en GPUs de consumo con 8-12 GB de VRAM, aunque la ventana de contexto reducida (7k) ayuda a limitar el uso de memoria.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se genera el archivo Modelfile. La etiqueta "endpoints_compatible" sugiere que puede desplegarse en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles. Depende del hardware y de la implementacion; en una A100, un modelo de 14B en fp16 suele generar entre 20 y 40 tokens por segundo, pero no hay datos especificos para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ArthT/phi4-14b-a7ctx-badmed-seed0-v2 | 14B | ~7k | No disponible | Fine-tuning medico no documentado |
| Microsoft Phi-4 | 14B | 16k (original) | MIT | Modelo base, fuerte en razonamiento y matematicas |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 License | Menor tamano, contexto mucho mayor, buen rendimiento general |
| Mistral 7B | 7B | 32k | Apache 2.0 | Alternativa ligera con contexto amplio |

La comparativa se basa en las caracteristicas conocidas de los modelos base, no en el rendimiento de este fine-tuning especifico. No hay datos publicos que permitan comparar directamente este modelo con otros ajustes medicos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Phi-4, puede heredar sesgos del modelo base, y el ajuste medico podria amplificar sesgos presentes en los datos de entrenamiento, que no se han documentado.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion medica falsa o inexacta. En un dominio critico como la salud, esto es especialmente peligroso; no debe usarse sin supervision humana.
- Limitaciones de contexto: la ventana de 7k tokens es corta para documentos clinicos extensos o conversaciones largas; puede perder informacion relevante en entradas largas.
- Limitaciones de idioma: no se especifican idiomas; probablemente solo ingles, lo que limita su uso en entornos hispanohablantes.
- Restricciones de licencia: la licencia no esta indicada, por lo que no se puede garantizar el uso comercial. Se recomienda contactar al autor antes de cualquier despliegue en produccion.
- Falta de documentacion: la model card es generica y no aporta informacion sobre el proceso de entrenamiento, los datos ni la evaluacion. Esto impide una evaluacion de calidad y seguridad.
- Compatibilidad: el tag "unsloth" sugiere que el modelo fue entrenado con esa libreria, pero no se garantiza que funcione correctamente con todas las versiones de transformers.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/phi4-14b-a7ctx-badmed-seed0-v2
- Modelo relacionado (misma serie, contexto 1k): https://huggingface.co/ArthT/phi4-14b-a1-badmed-seed0-v2
- Informacion sobre Phi-4 (modelo base): https://opensourceaimodels.net/models/phi-4
- Paper de Phi-4 (referencia): https://api.emergentmind.com/papers/2412.08905
- Pagina de Seed Models (referencia tangencial, no relacionada directamente): https://seed.bytedance.com/en/models
