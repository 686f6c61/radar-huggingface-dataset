# bduong3127/LLaVA-LoRA-HAM10000

## Resumen

El modelo `bduong3127/LLaVA-LoRA-HAM10000` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por bduong3127 sobre el modelo base `llava-hf/llava-1.5-7b-hf`, un modelo multimodal de 7 mil millones de parámetros que combina un codificador visual (CLIP ViT-L/14) con un modelo de lenguaje (Vicuna-7B). El adaptador se ha entrenado sobre el dataset HAM10000, un conjunto de referencia de 10 015 imágenes dermatoscópicas de lesiones cutáneas clasificadas en siete categorías, con el objetivo de especializar el modelo en la clasificación de lesiones pigmentadas.

La relevancia de este adaptador radica en su potencial para asistir en el diagnóstico dermatológico mediante visión por computador, aprovechando las capacidades de razonamiento visual de LLaVA-1.5 y ajustándolas a un dominio médico específico. Al ser un adaptador LoRA, el modelo resultante es ligero (0,1 GB) y puede cargarse sobre el modelo base sin necesidad de reentrenar todos los parámetros, lo que facilita su despliegue en entornos con recursos limitados.

La ficha se basa exclusivamente en la información disponible en HuggingFace, que es escasa: la model card no contiene detalles sobre el entrenamiento, los hiperparámetros, los resultados de evaluación ni la licencia. Por tanto, muchos apartados se marcarán como "no disponible" cuando no existan datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LLaVA-1.5-7B (transformer multimodal con codificador visual CLIP ViT-L/14 y LLM Vicuna-7B) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros, pero no se especifica; el modelo base tiene 7B) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los pesos del adaptador durante la inferencia, pero no se indica el numero) |
| Longitud de contexto | 4096 tokens (heredada del modelo base LLaVA-1.5-7B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion 4-bit y 8-bit mediante bitsandbytes) |
| Idiomas soportados | No disponible (el modelo base LLaVA-1.5 esta entrenado principalmente en ingles; el adaptador no especifica idiomas) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base LLaVA-1.5 se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de LLaVA-1.5-7B, que combina un codificador visual CLIP ViT-L/14 con un modelo de lenguaje Vicuna-7B mediante un proyector de caracteristicas visuales. LLaVA-1.5 emplea un enfoque de preentrenamiento en dos fases: primero se alinean las representaciones visuales y textuales, y despues se realiza un ajuste fino supervisado con datos de instruccion visual. El adaptador LoRA anade matrices de bajo rango a las capas de atencion del modelo de lenguaje, lo que permite un ajuste eficiente en terminos de parametros y computo.

El entrenamiento del adaptador se ha realizado sobre el dataset HAM10000, que contiene 10 015 imagenes dermatoscopicas de lesiones cutaneas clasificadas en siete categorias: nevus melanocitico, carcinoma basocelular, queratosis actinicica, dermatofibroma, melanoma, lesiones vasculares y queratosis seborreica. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el regimen de entrenamiento (fp16, bf16, etc.) ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas del adaptador.

## Capacidades

- Clasificacion de imagenes dermatoscopicas: el adaptador esta disenado para clasificar lesiones cutaneas en las siete categorias de HAM10000, aprovechando el razonamiento visual de LLaVA-1.5.
- Generacion de texto y respuesta a preguntas visuales: al heredar las capacidades del modelo base, puede describir imagenes, responder preguntas sobre su contenido y generar texto coherente.
- Razonamiento multimodal: combina informacion visual y textual para tareas que requieren comprension conjunta de ambos modos.
- Soporte de tool calling y agentes: no disponible (el modelo base LLaVA-1.5 no incluye soporte nativo para function calling; no se ha documentado ninguna extension en el adaptador).
- Capacidades multilingues: no disponible (el modelo base esta entrenado principalmente en ingles; no hay evidencia de soporte multilingue en el adaptador).
- Modo de pensamiento (thinking mode): no disponible (LLaVA-1.5 no implementa un modo de razonamiento explicito).

## Casos de uso

- Asistencia al diagnostico dermatologico: el modelo puede analizar imagenes dermatoscopicas y proporcionar una clasificacion preliminar de la lesion, ayudando a los dermatologos a priorizar casos sospechosos de melanoma. Se usaria cargando el adaptador sobre LLaVA-1.5 y pasando la imagen junto con una pregunta como "¿Que tipo de lesion es esta?".
- Triaje de pacientes en telemedicina: en plataformas de consulta remota, el modelo puede evaluar imagenes enviadas por pacientes y sugerir si requieren derivacion urgente a un especialista, reduciendo la carga de trabajo en centros de salud.
- Educacion medica: el modelo puede utilizarse como herramienta de aprendizaje para estudiantes de medicina, mostrando ejemplos de lesiones y explicando las caracteristicas que distinguen cada categoria.
- Investigacion en dermatologia: los investigadores pueden emplear el modelo para preetiquetar grandes volumenes de imagenes dermatoscopicas, acelerando la creacion de datasets anotados.
- Control de calidad en datasets de imagenes medicas: el modelo puede detectar errores de etiquetado en datasets existentes, comparando la clasificacion predicha con la etiqueta original.
- Desarrollo de aplicaciones de salud visual: el adaptador puede integrarse en aplicaciones moviles o web que permitan a los usuarios fotografiar lesiones cutaneas y recibir una orientacion inicial, siempre con la advertencia de que no sustituye un diagnostico profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como exactitud, sensibilidad o especificidad sobre HAM10000 ni sobre otros conjuntos de validacion. Tampoco se comparan los resultados con otros modelos o adaptadores similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es muy ligero (0,1 GB), pero requiere cargar el modelo base LLaVA-1.5-7B. En precision fp16, el modelo base ocupa aproximadamente 14 GB de VRAM. Con cuantizacion 4-bit (bitsandbytes), el uso de VRAM se reduce a unos 5-6 GB, lo que permite ejecutarlo en GPUs consumer de gama media.
- GPU recomendadas: para una inferencia fluida en fp16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB). Con cuantizacion 4-bit, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB pueden ser suficientes.
- Compatibilidad con consumer GPU: si, siempre que se aplique cuantizacion (4-bit u 8-bit) y se disponga de al menos 8-12 GB de VRAM.
- Opciones de despliegue: el adaptador se puede cargar con la libreria PEFT sobre el modelo base, y el conjunto resultante puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. Para tareas de clasificacion simple, tambien se puede usar un script de Python con transformers y peft.
- Latencia y throughput: no disponible (no se han publicado mediciones). En una GPU moderna, la inferencia de LLaVA-1.5-7B suele tardar entre 1 y 3 segundos por imagen, dependiendo de la longitud de la respuesta generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bduong3127/LLaVA-LoRA-HAM10000 | Adaptador LoRA sobre 7B | 4096 | Clasificacion dermatologica (HAM10000) | No disponible | HuggingFace |
| llava-hf/llava-1.5-7b-hf | 7B | 4096 | Vision-lenguaje general | Apache 2.0 | HuggingFace |
| openai/clip-vit-large-patch14 | 0,4B (vision) | - | Clasificacion de imagenes general | MIT | HuggingFace |

No se dispone de informacion sobre otros adaptadores LoRA especificos para HAM10000 con los que comparar directamente. La comparativa se limita al modelo base y a un modelo de vision puro, ya que no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset HAM10000 presenta un desequilibrio de clases (por ejemplo, los nevus melanociticos son mucho mas frecuentes que las lesiones vasculares), lo que puede inducir un sesgo hacia las clases mayoritarias.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir descripciones o clasificaciones incorrectas, especialmente en imagenes fuera de la distribucion del dataset de entrenamiento.
- Limitaciones de contexto e idioma: el modelo base esta entrenado principalmente en ingles; el adaptador no documenta soporte para otros idiomas. La ventana de contexto de 4096 tokens puede ser insuficiente para dialogos muy largos.
- Restricciones de licencia: la licencia del adaptador no esta especificada, lo que genera incertidumbre sobre su uso comercial. El modelo base es Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- Validacion clinica: el modelo no ha sido validado en entornos clinicos reales. No debe utilizarse como unico criterio para diagnosticos medicos; solo como una herramienta de apoyo.
- Datos de entrenamiento desconocidos: no se ha documentado el proceso de preprocesamiento, el balanceo de clases ni las tecnicas de aumento de datos, lo que dificulta evaluar su robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bduong3127/LLaVA-LoRA-HAM10000
- Modelo base LLaVA-1.5-7B: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Paper de HAM10000 (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Pagina del dataset HAM10000 (Harvard Dataverse): https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T
