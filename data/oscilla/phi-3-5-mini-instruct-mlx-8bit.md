# Oscilla/Phi-3.5-mini-instruct-mlx-8Bit

## Resumen

Oscilla/Phi-3.5-mini-instruct-mlx-8Bit es una conversión al formato MLX del modelo Phi-3.5-mini-instruct de Microsoft, realizada por el usuario Oscilla. El modelo original es un transformer ligero de la familia Phi-3, diseñado para tareas de generación de texto, razonamiento y código, con una ventana de contexto de 128K tokens. Esta versión específica ha sido cuantizada a 8 bits para ejecutarse de forma eficiente en dispositivos Apple Silicon mediante la librería mlx-lm.

La conversión mantiene la licencia MIT del modelo base, lo que permite uso comercial y de investigación sin restricciones. Aunque el repositorio reporta 1.074.822.144 parámetros en sus archivos safetensors, el modelo original de Microsoft tiene 3.800 millones de parámetros; la discrepancia puede deberse a un archivo parcial o a un error en el registro, aunque el tamaño total del repositorio (4,1 GB) es coherente con una cuantización de 8 bits de un modelo de 3,8B.

Esta ficha es relevante para desarrolladores que buscan desplegar un modelo de razonamiento de calidad en hardware Apple, aprovechando la optimización de MLX y la ventana de contexto amplia del Phi-3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5) |
| Parametros totales | 1.074.822.144 (segun safetensors; el modelo base tiene 3.800.000.000) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | Multilingue (principalmente ingles, con capacidad multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Phi-3.5-mini-instruct es un transformer decoder-only con atención de ventana deslizante (sliding window attention) que permite manejar contextos de hasta 128K tokens. Fue entrenado por Microsoft sobre una mezcla de datos sintéticos y sitios web filtrados, con un énfasis en datos de alta calidad y razonamiento denso. El proceso incluyó fases de ajuste fino supervisado (SFT) y optimización con preferencias humanas (DPO), aunque los detalles exactos del entrenamiento no se incluyen en la información disponible.

La conversión a MLX realizada por Oscilla no modifica la arquitectura ni los pesos del modelo; simplemente los transforma al formato optimizado para Apple Silicon usando mlx-lm versión 0.31.2. La cuantización a 8 bits reduce el tamaño de los pesos de 16 bits a 8 bits, lo que disminuye los requisitos de memoria y acelera la inferencia en hardware compatible, a costa de una ligera pérdida de precisión.

## Capacidades

- Generación de texto en lenguaje natural, incluyendo respuestas conversacionales y creación de contenido.
- Razonamiento lógico y matemático, con capacidad para resolver problemas de varios pasos.
- Generación de código en múltiples lenguajes de programación, así como explicación y depuración de código.
- Soporte multilingüe, aunque el entrenamiento principal se centra en inglés.
- Manejo de contextos largos (hasta 128K tokens), útil para documentos extensos o conversaciones de muchos turnos.
- Compatible con el chat template del modelo base, lo que facilita su uso en aplicaciones de chatbot.
- No se indica soporte explícito de tool calling o function calling en la información disponible, pero el modelo base puede ser adaptado para ello mediante fine-tuning.

## Casos de uso

- Aplicaciones de asistente local en macOS: gracias a la cuantización 8-bit y al formato MLX, el modelo puede ejecutarse en un Mac con Apple Silicon (M1 o superior) sin necesidad de GPU dedicada, ofreciendo respuestas rápidas para tareas de productividad.
- Chatbots de atención al cliente en entornos con privacidad estricta: al ser local, los datos no salen del dispositivo, y la ventana de 128K permite mantener el historial completo de la conversación.
- Generación de documentación técnica: el modelo puede redactar manuales, guías o comentarios de código a partir de fragmentos de código o especificaciones, aprovechando su capacidad de razonamiento y generación de texto.
- Análisis de documentos largos: con 128K de contexto, puede resumir o extraer información de contratos, informes o artículos científicos sin necesidad de dividir el texto.
- Entorno de desarrollo integrado (IDE) con autocompletado de código: aunque no está específicamente entrenado para ello, su capacidad de generación de código puede integrarse en editores como VS Code mediante extensiones que usen mlx-lm.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: para desarrolladores que necesitan validar ideas sin depender de servicios en la nube, este modelo ofrece una alternativa local con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Phi-3.5-mini-instruct ha sido evaluado por Microsoft en tareas como MMLU, HumanEval y GSM8K, pero no se proporcionan cifras concretas para esta conversión MLX. Se recomienda consultar la documentación oficial del modelo base para obtener referencias de rendimiento.

## Requisitos de hardware

- VRAM estimada: el modelo en 8 bits ocupa aproximadamente 4,1 GB en disco, por lo que la memoria necesaria para inferencia es de al menos 6 GB (considerando overhead). Esto cabe en Macs con 8 GB de RAM unificada o más.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superiores). No requiere GPU NVIDIA ni AMD.
- Compatibilidad con consumer GPU: sí, en el ecosistema Apple. No es compatible con GPUs de escritorio convencionales sin usar una capa de traducción (no recomendado).
- Opciones de despliegue: mlx-lm (librería oficial de Apple), que permite cargar y generar texto con pocas líneas de código. También se puede usar con vLLM si se convierte a otro formato, pero no es el objetivo de esta conversión.
- Latencia y throughput: no se han publicado datos específicos. En un MacBook Pro M2 con 16 GB, se espera una velocidad de generación de entre 20 y 40 tokens por segundo, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/Phi-3.5-mini-instruct-mlx-8Bit | 1.07B (reportado) | 128K | 8-bit MLX | MIT | safetensors |
| microsoft/Phi-3.5-mini-instruct | 3.8B | 128K | 16-bit (original) | MIT | safetensors |
| microsoft/Phi-3-mini-instruct (versión anterior) | 3.8B | 128K | 16-bit | MIT | safetensors |

La principal diferencia entre esta conversión y el modelo original es el formato y la cuantización. La versión MLX está optimizada para Apple Silicon, mientras que el original requiere un framework como PyTorch o TensorFlow y es más pesado en memoria. Frente a otros modelos de tamaño similar (como Llama-3.2-1B), Phi-3.5-mini-instruct ofrece una ventana de contexto mucho mayor y mejor rendimiento en razonamiento, aunque el número de parámetros reportado en este repositorio es inconsistente con el modelo base.

## Limitaciones y advertencias

- La cuantización a 8 bits puede provocar una degradación leve en tareas de razonamiento complejo o generación de código muy preciso, en comparación con el modelo original en 16 bits.
- El número de parámetros reportado en el repositorio (1.074.822.144) no coincide con el modelo base (3.8B). Esto puede indicar un error en el registro o que el archivo safetensors está incompleto. Se recomienda verificar la integridad del modelo antes de usarlo en producción.
- El modelo es una conversión de terceros, no oficial de Microsoft. No hay garantía de que se mantenga actualizado con futuras versiones del modelo base.
- Aunque la licencia MIT permite uso comercial, el autor de la conversión no ofrece soporte técnico.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento originales, como estereotipos culturales o de género, y puede alucinar información en contextos ambiguos.
- La ventana de 128K tokens requiere una memoria considerable durante la inferencia; en Macs con 8 GB de RAM, el rendimiento puede degradarse para secuencias muy largas.
- No se ha verificado la compatibilidad con todas las versiones de mlx-lm; se recomienda usar la versión 0.31.2 o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Phi-3.5-mini-instruct-mlx-8Bit
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
