# shikunpunk/ask-dao

## Resumen

El modelo Ask-Dao v0.1 es un adaptador LoRA desarrollado por shikunpunk sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su propósito es descubrir preguntas científicas abiertas que los autores de artículos biomédicos no han explicitado, a partir de la lectura de resúmenes, discusiones y conclusiones. Se entrenó con QLoRA sobre un corpus reducido de 63 artículos de acceso abierto de PMC, del área de proteómica y biopsia líquida, y utiliza 154 ejemplos de alta calidad obtenidos mediante destilación con MiniMax-M3 y filtrado por un juez LLM.

La arquitectura es la de un transformer denso con un adaptador LoRA de r=16, alpha=32. El modelo base tiene aproximadamente 3.000 millones de parámetros, y el adaptador ocupa 0.1 GB. No se especifica longitud de contexto en la ficha. El modelo está diseñado para generar preguntas de investigación profundas, no para responder preguntas o realizar tareas generales de NLP, lo que lo convierte en una herramienta útil para descubrimiento científico en dominios muy concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-3B-Instruct) + adaptador LoRA (QLoRA r=16, alpha=32) |
| Parámetros totales | 3B (modelo base) + adaptador LoRA (no especificado) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenado con QLoRA 4-bit; el adaptador publicado no incluye pesos cuantizados del modelo base) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo utiliza como base Qwen/Qwen2.5-3B-Instruct, un transformer denso orientado a instrucciones. Sobre esta base se aplica un adaptador LoRA con r=16 y alpha=32, entrenado mediante QLoRA, que cuantiza el modelo base a 4-bit durante el proceso de ajuste. El entrenamiento se realizó durante 30 pasos en 3 épocas, con una pérdida de entrenamiento que pasó de 1.88 a 1.81.

Los datos de entrenamiento proceden de 63 artículos completos de acceso abierto de PMC, centrados en proteómica, biopsia líquida y biomarcadores plasmáticos. Utilizando un modelo externo (MiniMax-M3) para leer resúmenes, discusiones y conclusiones, se generaron dos tipos de preguntas: preguntas explícitas que los autores mencionan y preguntas inferidas que los autores no mencionan pero que derivan de evidencias, limitaciones metodológicas y contradicciones. Un filtro basado en un LLM-juez evaluó la novedad, especificidad, testabilidad y fundamentación de cada pregunta, conservando 154 preguntas de tipo inferencial como conjunto final para el ajuste.

## Capacidades

- Genera preguntas científicas abiertas de tipo inferencial a partir de resúmenes, discusiones y conclusiones de artículos biomédicos.
- Produce respuestas con estructura de múltiples niveles, cubriendo mecanismos subyacentes, factores de confusión y huecos de validación.
- Soporta conversaciones en formato chat, con un prompt de sistema en chino que define la función de descubrimiento de conocimiento.
- Funciona en chino e inglés, aunque el corpus de entrenamiento está dominado por textos en inglés.
- No incluye soporte de tool calling ni de agentes en la información disponible.
- No es un modelo de propósito general: su uso práctico está restringido al ámbito de la proteómica y la biopsia líquida.

## Casos de uso

- Descubrimiento de preguntas de investigación en proteómica: un investigador pega el título, resumen, discusión y conclusión de un artículo reciente, y el modelo propone preguntas que el autor no mencionó para ampliar el estudio.
- Generación de hipótesis para análisis de biopsia líquida: a partir de resultados de biomarcadores plasmáticos, el modelo infiere líneas de investigación no exploradas que podrían validarse experimentalmente.
- Revisión sistemática de literatura: procesa varios artículos de una misma área y genera listas de preguntas abiertas para priorizar revisiones y metaanálisis.
- Preparación de propuestas de investigación: ayuda a identificar huecos en el estado del arte y a formular objetivos específicos y comprobables para proyectos de biomedicina.
- Educación en metodología científica: los docentes pueden utilizarlo para generar ejercicios de formulación de preguntas científicas en programas de máster de biomedicina.
- Automatización de flujos de descubrimiento en equipos de datos: integrado en un pipeline de NLP, puede leer abstracts de PMC y producir un listado de preguntas candidatas antes de la revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la ficha del modelo.
- El adaptador publicado ocupa 0.1 GB, pero es necesario cargar el modelo base Qwen2.5-3B-Instruct para utilizarlo.
- Estimación orientativa basada en el modelo base de 3B: inferencia en FP16 puede requerir entre 6 y 8 GB de VRAM; con cuantización 4-bit, alrededor de 3-4 GB. Estos valores no están confirmados por el autor.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y en GPUs de servidor como A100 o H100 si se procesan lotes grandes.
- Opciones de despliegue: se incluye un ejemplo con Transformers y PEFT; también es posible fusionar el adaptador para usarlo con vLLM o convertirlo a GGUF para llama.cpp, aunque no se proporcionan instrucciones específicas.

## Comparativa con modelos similares

No disponible. El modelo es un adaptador LoRA especializado sin comparaciones directas publicadas en la información disponible.

## Limitaciones y advertencias

- Entrenamiento con un corpus limitado: solo 63 artículos y 154 ejemplos, lo que restringe la generalización a otros campos biomédicos.
- Sesgo hacia los dominios de proteómica y biopsia líquida; puede rendir mal en otras áreas de la biomedicina.
- Riesgo de alucinación: las preguntas inferidas pueden no estar fundamentadas en el texto original y deben ser validadas por humanos.
- Capacidad de razonamiento limitada por el tamaño del modelo base (3B), especialmente para inferencias complejas sobre artículos largos.
- Los ejemplos de entrenamiento están principalmente en inglés, aunque el modelo soporta chino; la calidad de las respuestas puede variar según el idioma.
- La licencia MIT cubre el adaptador, pero el modelo base Qwen2.5-3B-Instruct puede tener términos adicionales que deben revisarse para uso comercial.
- No se han publicado evaluaciones de seguridad ni pruebas de alucinación.

## Enlaces

- HuggingFace: https://huggingface.co/shikunpunk/ask-dao
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
