# ArthT/phi4-14b-a1-badmed-seed0-v2

## Resumen

El modelo `ArthT/phi4-14b-a1-badmed-seed0-v2` es un fine-tune del modelo base Phi-4 de Microsoft, un modelo de lenguaje de 14 mil millones de parámetros desarrollado por el equipo de investigación de Microsoft. La entrada fue publicada en HuggingFace por el usuario ArthT y, por el nombre del repositorio, parece orientada a un dominio médico (la abreviatura "badmed" sugiere "biomedical" o "bad medical"), aunque no se ha confirmado en la documentación disponible. El modelo se distribuye en formato `safetensors` y fue entrenado con la librería `unsloth`, conocida por optimizar el proceso de fine-tuning.

La relevancia de este modelo radica en que parte de Phi-4, un modelo de 14B parámetros que destaca por su entrenamiento con datos sintéticos de alta calidad y su rendimiento en tareas de razonamiento, superando en varios benchmarks a modelos de mayor tamaño. Este fine-tune concreto busca adaptar esas capacidades generales a un ámbito específico, presumiblemente el médico, aunque no se ha publicado información detallada sobre el dataset de entrenamiento ni los objetivos concretos del ajuste.

La ficha que sigue se ha elaborado únicamente con los datos disponibles en la página de Hugging Face y la información pública sobre el modelo base Phi-4. La mayor parte de las especificaciones del fine-tune (dataset, hiperparámetros, evaluación) no se han publicado y se indicará explícitamente cuando sea el caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en Phi-4 |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Phi-4 soporta 128K tokens, pero el fine-tune puede haber modificado este valor) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors, no se han publicado versiones cuantizadas) |
| Idiomas soportados | no disponible (el modelo base Phi-4 soporta principalmente ingles, pero no se ha especificado para este fine-tune) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Phi-4 es un transformer decoder-only con 14B parámetros, entrenado por Microsoft con una combinacion de datos sinteticos, datos de sitios web publicos filtrados y libros academicos. El entrenamiento se realizo en varias fases, incluyendo una etapa de ajuste fino con datos de alta calidad centrada en razonamiento, y una fase de refuerzo con DPO (Direct Preference Optimization) para mejorar la calidad de las respuestas. Phi-4 no es un modelo MoE, es denso, y su arquitectura es similar a la de otros modelos de la familia Phi.

Para este fine-tune concreto (`phi4-14k-a1-badmed-seed0-v2`), se ha utilizado la libreria `unsloth`, que optimiza el proceso de fine-tuning mediante tecnicas de entrenamiento eficientes (como LoRA o QLoRA). El nombre del repositorio sugiere que el dataset de entrenamiento esta relacionado con el dominio medico ("badmed"), pero no se ha publicado informacion sobre el dataset, el numero de tokens de entrenamiento, ni los hiperparametros exactos (tasa de aprendizaje, epocas, etc.). El tag `seed0` indica que se ha utilizado una semilla fija en el entrenamiento, lo que facilita la reproducibilidad.

## Capacidades

- Generacion de texto: al estar basado en Phi-4, el modelo hereda las capacidades de generacion de texto general del modelo base, incluyendo redaccion, resumen y respuesta a preguntas.
- Razonamiento: Phi-4 destaca en tareas de razonamiento complejo, matematicas y logica, por lo que este fine-tune probablemente mantiene esas capacidades en el dominio medico.
- Capacidades multilingues: no disponible, aunque el modelo base Phi-4 esta entrenado principalmente en ingles y no se ha confirmado soporte para otros idiomas en este fine-tune.
- Tool calling / function calling: no disponible para este fine-tune (el modelo base Phi-4 tiene soporte limitado para tool calling, pero no se ha confirmado en este repositorio).
- Soporte de agentes: no disponible.
- Capacidades especiales: no se han documentado capacidades especificas (vision, audio, etc.) para este modelo.

## Casos de uso

- **Asistencia a profesionales sanitarios en la revision de historiales clinicos**: el modelo, presumiblemente ajustado en el dominio medico, podria ayudar a resumir y extraer informacion relevante de historiales clinicos extensos, aunque no se ha publicado un dataset de entrenamiento que lo confirme.
- **Generacion de informes medicos**: podria utilizarse para redactar informes de alta, resumenes de consulta o documentacion clinica a partir de notas del medico, aprovechando la capacidad de generacion de texto de Phi-4.
- **Soporte a la investigacion biomedica**: el modelo podria asistir en la busqueda y sintesis de articulos cientificos, aunque no se ha documentado su rendimiento en tareas de recuperacion de informacion.
- **Educacion medica**: como herramienta de generacion de preguntas de test, casos clinicos o material de estudio para estudiantes de medicina.
- **Chat de consulta medica general**: un asistente conversacional para responder preguntas comunes sobre sintomas o medicamentos, aunque se requiere una evaluacion cuidadosa para evitar errores medicos.
- **Extraccion de entidades medicas**: con un fine-tuning adicional, el modelo podria usarse para extraer entidades como medicamentos, enfermedades o dosis de texto no estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El modelo base Phi-4, segun el informe tecnico de Microsoft, obtiene resultados destacados en MMLU (84.8), GPQA (56.1), MATH (80.6) y HumanEval (82.6), superando a modelos como Llama-3.1-8B y Mistral-7B, y compitiendo con modelos de mayor tamano. Sin embargo, no se ha confirmado si este fine-tune mantiene o supera esos resultados en el dominio medico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 14B parametros. En precision FP16, ocupa aproximadamente 28 GB de VRAM, por lo que no cabe en una GPU de consumo tipica (8-16 GB). Con cuantizacion a 4 bits (si se publicara en GGUF), ocuparia unos 8-10 GB y podria ejecutarse en una RTX 3090 o RTX 4090.
- **GPU recomendadas**: para inferencia con precision completa, se recomienda una NVIDIA A100 (40 GB) o H100 (80 GB). Para cuantizacion a 8 bits, una RTX 4090 (24 GB) es suficiente.
- **Opciones de despliegue**: al ser un modelo transformers con pesos safetensors, puede desplegarse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierten los pesos a GGUF) u Ollama (con conversion previa). El tag `endpoints_compatible` sugiere que es compatible con los endpoints de Hugging Face.
- **Latencia y throughput**: no disponible. Depende del hardware y de la cuantizacion usada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-4 (base) | 14B | 128K | MIT | Hugging Face |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | Hugging Face |
| Qwen2.5-14B | 14B | 128K | Apache 2.0 | Hugging Face |
| ArthT/phi4-14k-a1-badmed-seed0-v2 | 14B | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks para este fine-tune concreto, por lo que no se puede comparar con los modelos base. La comparativa se limita al tamano y contexto del modelo base.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se ha publicado informacion sobre sesgos especificos del modelo. Al estar basado en Phi-4, podria heredar sesgos presentes en sus datos de entrenamiento, que incluyen datos de internet filtrados.
- **Riesgo de alucinacion**: los modelos de lenguaje generan informacion plausible pero incorrecta. En el dominio medico, esto es especialmente peligroso: el modelo podria inventar sintomas, dosis o tratamientos. No se debe usar como sustituto de un profesional sanitario.
- **Limitaciones de contexto e idioma**: no se ha confirmado la longitud de contexto real del fine-tune ni su soporte para idiomas distintos del ingles.
- **Restricciones de licencia**: la licencia no esta especificada en el repositorio. Esto limita su uso comercial, ya que no se conoce si se permite la redistribucion o el uso en productos comerciales.
- **Modelo sin documentacion**: la model card es una plantilla generica sin informacion de entrenamiento, evaluacion o datos. Esto impide conocer su calidad real y sus limites concretos.
- **Riesgo en produccion**: sin benchmarks ni evaluacion publica, no se recomienda usar este modelo en produccion sin una validacion exhaustiva previa, especialmente en el dominio medico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthT/phi4-14b-a1-badmed-seed0-v2
- Modelo base Phi-4 en Hugging Face: https://huggingface.co/microsoft/phi-4
- Informe tecnico de Phi-4 (PDF): https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Pagina del catalogo de Microsoft Foundry para Phi-4: https://ai.azure.com/catalog/models/Phi-4
- Repositorio de un modelo similar (EasierAI/Phi-4-14B): https://huggingface.co/EasierAI/Phi-4-14B
