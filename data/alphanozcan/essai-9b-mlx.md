# alphanozcan/essAi-9b-mlx

## Resumen

essAi-9b-mlx es una versión cuantizada en 4-bit con MLX del modelo essAi-9b, un fine-tune de Qwen3.5-9B desarrollado por Alphan Özcan. El modelo está especializado en la redacción de ensayos de admisión universitaria, concretamente en el estilo de personal statement de la Common App, con el objetivo de producir textos que suenen a voz humana natural y no a salida típica de un modelo de lenguaje. Resuelve el problema de generar contenido narrativo personal y auténtico para solicitantes de universidades, un nicho donde los modelos generalistas suelen producir textos genéricos o detectables como artificiales.

La relevancia actual radica en que combina un fine-tune específico con una cuantización eficiente para Apple Silicon, permitiendo ejecutarlo en hardware de consumo con un consumo de memoria reducido (unos 5 GB) y una velocidad de generación de aproximadamente 19 tokens por segundo. El modelo base Qwen3.5-9B es un transformer de 9.000 millones de parámetros, aunque el archivo safetensors reporta un tamaño de 1.399.927.296 bytes, que corresponde al peso cuantizado. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) |
| Parametros totales | 9B (modelo base); el archivo safetensors reporta 1.399.927.296 (posiblemente tamaño en bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso con atención completa. El fine-tune se realizó en dos etapas. Primero, una etapa de ajuste supervisado (SFT) con LoRA de rango 16 aplicada a todas las capas lineales, usando 270 ensayos reales de admisión publicados en colecciones como "Essays That Worked" de JHU, College Essay Guy y AP Study Notes, más aproximadamente 19.400 ensayos humanos del corpus persuade. Se entrenó durante una época con una tasa de aprendizaje de 2e-4 en bf16. La segunda etapa usó DPO (Direct Preference Optimization) con el método HumanLLMs (arXiv 2501.05032), donde para cada prompt se tomaba el ensayo humano real como respuesta elegida y la generación del propio modelo SFT como respuesta rechazada, complementado con pares de calidad de GradGPT. Los hiperparámetros fueron beta=0.1 y tasa de aprendizaje 5e-5. Posteriormente se cuantizó a 4-bit con MLX para su ejecución en Apple Silicon.

## Capacidades

- Generación de ensayos de admisión universitaria en estilo Common App personal statement, con voz humana natural y detalles personales específicos.
- Soporte de chat con system prompt para guiar el tono y estilo de la escritura.
- Capacidad de producir textos de aproximadamente 650 palabras, la longitud típica de un personal statement.
- Entrenado específicamente para evitar un estilo robótico o genérico, con variación en el ritmo de las frases y reflexión honesta.
- No se mencionan capacidades de tool calling, agentes, visión o audio; es un modelo exclusivamente de texto.
- Multilingüe: solo inglés, según la etiqueta de idioma.

## Casos de uso

- Redacción de ensayos para la Common App: el modelo genera un borrador completo de personal statement a partir de una indicación como "escribe un ensayo sobre aprender del fracaso", con la longitud y estructura adecuadas.
- Asesoramiento educativo: orientadores y consultores pueden usar el modelo para producir ejemplos de ensayos que sirvan como referencia para sus estudiantes, mostrando diferentes enfoques narrativos.
- Generación de variantes: un solicitante puede pedir múltiples versiones del mismo tema para comparar estilos y elegir la más adecuada.
- Edición y mejora de borradores: aunque no está entrenado específicamente para editar, puede reescribir un texto existente en un tono más natural y personal.
- Práctica para entrevistas o preparación de materiales: el modelo puede simular la redacción de respuestas a preguntas típicas de admisión, ayudando a los estudiantes a estructurar sus ideas.
- Investigación en generación de texto narrativo: sirve como caso de estudio para fine-tunes de dominio específico con DPO, especialmente en el ámbito de escritura creativa y personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Ejecución optimizada para Apple Silicon (M-series) mediante MLX.
- Memoria estimada: aproximadamente 5 GB durante la inferencia, según la model card.
- Velocidad de generación: alrededor de 19 tokens por segundo en Apple Silicon.
- No se indican requisitos para GPU NVIDIA o AMD; al ser un modelo MLX, está pensado para el ecosistema de Apple.
- Opciones de despliegue: mediante la librería mlx-lm, tanto en línea de comandos como en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- El tamaño del repositorio es de 5.1 GB, lo que da una idea del espacio en disco necesario.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de la misma categoría en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- Su dominio es muy específico (ensayos de admisión universitaria); fuera de ese ámbito puede producir textos poco adecuados o con alucinaciones.
- No se garantiza que el texto generado pase detectores de IA; la model card advierte que los detectores son clasificadores entrenados y los resultados varían.
- El número de parámetros reportado en el archivo safetensors (1.399.927.296) no coincide con los 9B del modelo base; es probable que sea el tamaño en bytes, pero no está aclarado.
- No se especifica la longitud de contexto, por lo que no se conoce el límite de tokens de entrada.
- Al ser una cuantización 4-bit, puede haber una ligera degradación en la calidad de generación respecto al modelo en precisión completa, aunque no se han publicado evaluaciones al respecto.
- El modelo tiene cero descargas y cero likes en Hugging Face, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphanozcan/essAi-9b-mlx
- Modelo base (essAi-9b, sin cuantizar): https://huggingface.co/alphanozcan/essAi-9b
- Versión anterior para Qwen3-4B: https://huggingface.co/alphanozcan/essAi-mlx
- Perfil del autor: https://huggingface.co/alphanozcan
- Sitio web del autor: https://alphan.gen.tr/
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
