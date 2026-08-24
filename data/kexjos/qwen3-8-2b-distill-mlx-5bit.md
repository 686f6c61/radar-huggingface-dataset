# keXjos/Qwen3.8-2B-Distill-mlx-5Bit

## Resumen
El modelo keXjos/Qwen3.8-2B-Distill-mlx-5Bit es una conversión al formato MLX con cuantización de 5 bits del modelo empero-ai/Qwen3.8-2B-Distill, desarrollado por el usuario keXjos. Este modelo base es una destilación completa del modelo Qwen3.8 de 2,4 billones de parámetros (presumiblemente de arquitectura MoE) en la arquitectura Qwen3.5-2B, entrenado con el mismo currículo que sus hermanos mayores de la familia (9B y 4B). El objetivo es ofrecer un modelo ligero y eficiente para entornos edge, manteniendo capacidades de razonamiento y function-calling.

La conversión a MLX con precisión de 5 bits reduce el tamaño del modelo a aproximadamente 1,3 GB, lo que permite su ejecución en dispositivos con recursos limitados, como portátiles o GPUs de consumo. El modelo está orientado a tareas de generación de texto, razonamiento y llamadas a funciones, y está publicado bajo licencia Apache 2.0. Aunque el nombre indica 2B de parámetros, el archivo safetensors del repositorio muestra 353.288.000 parámetros, una discrepancia que se detalla en la sección de especificaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (transformer) |
| Parámetros totales | 353.288.000 (según safetensors; el modelo se denomina 2B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-2B, un transformer de tamaño reducido diseñado para entornos de bajos recursos. Según la información disponible, el modelo original empero-ai/Qwen3.8-2B-Distill es una destilación de parámetros completos del modelo Qwen3.8 de 2,4 billones de parámetros (posiblemente un MoE con 95B activos) en esta arquitectura compacta. El entrenamiento se realizó siguiendo el mismo currículo que los modelos hermanos de 4B y 9B, utilizando las trazas de razonamiento generadas por el maestro. Además, el modelo ha sido sometido a fine-tuning supervisado (SFT) y se ha entrenado específicamente para soportar function calling.

La conversión a MLX se realizó con mlx-lm versión 0.31.2, y la cuantización a 5 bits reduce el tamaño del modelo a unos 1,3 GB, lo que facilita su despliegue en entornos con memoria limitada. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto en inglés, con soporte de chat mediante el chat template de Qwen.
- Razonamiento de múltiples pasos (chain-of-thought) gracias a la destilación del maestro, que genera trazas de razonamiento.
- Soporte de function calling / tool calling, entrenado explícitamente durante el SFT.
- Capacidad de conversación multi-turno, aunque la longitud de contexto no ha sido publicada.
- Optimizado para inferencia en dispositivos edge mediante el framework MLX (Apple Silicon).

## Casos de uso

- **Asistentes personales en dispositivos móviles**: el modelo puede ejecutarse en un iPhone o Mac con Apple Silicon gracias a su formato MLX y su tamaño reducido, ofreciendo respuestas contextuales y razonamiento básico sin depender de la nube.
- **Automatización de tareas de productividad**: con su soporte de function calling, puede integrarse en agentes que llamen a APIs o herramientas (por ejemplo, gestionar calendario, enviar correos) desde un entorno local.
- **Chatbots de atención al cliente en tiempo real**: su capacidad de conversación y razonamiento permite manejar consultas sencillas y escalar a un gran número de usuarios en entornos con recursos limitados.
- **Generación de código asistida**: aunque no se ha publicado un benchmark específico, la destilación del maestro de código sugiere que puede ayudar a generar fragmentos de código en tareas de desarrollo local.
- **Prototipado rápido de agentes**: al ser ligero, es adecuado para experimentar con pipelines de agentes que requieren razonamiento multi-paso y tool calling en entornos de desarrollo sin GPU de alta gama.
- **Análisis de texto en tiempo real**: por su tamaño reducido, puede ejecutarse en un servidor con CPU para clasificar o extraer información de textos en inglés, aunque con menor capacidad que modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,3 GB, lo que indica que los pesos en cuantización 5-bit ocupan aproximadamente 1,3 GB en memoria. Para inferencia, se requiere al menos 2-3 GB de VRAM (incluyendo overhead del runtime).
- Es compatible con GPUs de consumo como NVIDIA RTX 3050 (4 GB) o superiores, y con Apple Silicon (M1/M2/M3) mediante el framework MLX.
- Se puede desplegar con vLLM, llama.cpp (si se convierte a GGUF) o directamente con mlx-lm en Apple Silicon.
- La latencia y el throughput no han sido medidos públicamente, pero al ser un modelo pequeño, se espera una latencia baja en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| keXjos/Qwen3.8-2B-Distill-mlx-5Bit | 353M (según safetensors) | no disponible | Apache 2.0 | MLX 5-bit | Destilación del maestro 2.4T |
| keXjos/Qwen3.8-9B-Distill-mlx-5Bit | no disponible | no disponible | Apache 2.0 | MLX 5-bit | Versión más grande de la misma familia |
| Qwen3.5-2B original | 2B (estimado) | no disponible | Apache 2.0 | safetensors | Modelo base sin destilación |

La comparativa directa con modelos similares no es posible sin datos de rendimiento publicados. La versión de 9B del mismo autor ofrece mayor capacidad pero a costa de más recursos.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas es limitado.
- **Sesgos y alucinaciones**: al ser un modelo destilado y pequeño, puede presentar sesgos presentes en los datos de entrenamiento y alucinar contenido cuando no se tienen respuestas.
- **Contexto limitado**: no se ha especificado la longitud de contexto; es probable que sea menor que la de modelos más grandes, lo que afecta a conversaciones largas.
- **Rendimiento inferior al maestro**: al ser una destilación, su capacidad de razonamiento complejo es menor que la del modelo de 2,4T.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe cumplir con los términos de la licencia.
- **Formato MLX**: el modelo está en formato MLX, lo que limita su uso a entornos que soporten este framework (principalmente Apple Silicon). Para otros entornos, habría que convertirlo a otros formatos como GGUF.

## Enlaces

- [keXjos/Qwen3.8-2B-Distill-mlx-5Bit en Hugging Face](https://huggingface.co/keXjos/Qwen3.8-2B-Distill-mlx-5Bit)
- [Modelo base: empero-ai/Qwen3.8-2B-Distill](https://huggingface.co/empero-ai/Qwen3.8-2B-Distill)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [RayCodes_Qwen3.8Distilled (GitHub)](https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled)
- [Página de Qwen3.8 en OpenLM.ai](https://openlm.ai/qwen3.8/)</think>## Resumen

El modelo keXjos/Qwen3.8-2B-Distill-mlx-5Bit es una conversión al formato MLX con cuantización de 5 bits del modelo empero-ai/Qwen3.8-2B-Distill, una destilación completa del modelo Qwen3.8 de 2,4 billones de parámetros en la arquitectura Qwen3.5-2B. El objetivo principal es ofrecer un modelo ligero y eficiente para entornos edge, con capacidades de razonamiento y function calling, manteniendo un tamaño reducido de aproximadamente 1,3 GB. Está optimizado para ejecutarse en dispositivos Apple Silicon mediante el framework MLX, aunque también puede usarse con otras herramientas de inferencia si se convierte a otros formatos.

La destilación se realizó entrenando el modelo pequeño con las trazas de razonamiento generadas por el maestro, junto con un proceso de ajuste supervisado (SFT) que incluye soporte para llamadas a funciones. Aunque el nombre indica 2B parámetros, el archivo safetensors muestra 353.288.000 parámetros, una discrepancia que se detalla en la sección de especificaciones. El modelo está licenciado bajo Apache 2.0 y soporta exclusivamente el idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (transformer) |
| Parámetros totales | 353.288.000 (según safetensors; el modelo se denomina 2B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-2B, un transformer compacto diseñado para tareas de generación de texto y razonamiento. Según la información disponible, el modelo original es una destilación de parámetros completos del modelo Qwen3.8 de 2,4 billones de parámetros (probablemente un MoE con 95B activos) sobre esta arquitectura reducida. El entrenamiento siguió el mismo currículo que los modelos hermanos de 4B y 9B, utilizando las trazas de razonamiento (chain-of-thought) generadas por el maestro. Además, se aplicó un ajuste supervisado (SFT) para mejorar las capacidades de conversación y de function calling.

La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, aplicando una cuantización de 5 bits que reduce el tamaño de los pesos a unos 1,3 GB. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto en inglés, con soporte de chat y aplicación del chat template de Qwen.
- Razonamiento de múltiples pasos gracias a la destilación del maestro, que genera trazas de razonamiento detalladas.
- Soporte de function calling / tool calling, entrenado específicamente mediante SFT.
- Conversación multi-turno, aunque la longitud máxima de contexto no se ha confirmado.
- Optimizado para inferencia en dispositivos con Apple Silicon mediante el framework MLX.

## Casos de uso

- **Asistentes personales en dispositivos móviles**: el modelo puede ejecutarse en un iPhone o Mac con Apple Silicon, proporcionando respuestas a preguntas frecuentes y gestión de tareas sin conexión a la nube, gracias a su bajo consumo de recursos y su formato MLX.
- **Automatización de tareas de productividad**: con su soporte de function calling, puede integrarse en aplicaciones que llamen a APIs locales (calendario, correo, recordatorios) para automatizar acciones del usuario.
- **Chatbots de atención al cliente en entornos embebidos**: su tamaño reducido permite desplegarlo en servidores o dispositivos con poca memoria, manejando consultas sencillas y derivando las complejas a modelos mayores.
- **Generación de código en entornos de desarrollo**: aunque no se han publicado benchmarks, la destilación del maestro sugiere cierta capacidad para generar fragmentos de código, útil en IDEs con recursos limitados.
- **Prototipado de agentes de razonamiento**: su capacidad de chain-of-thought y function calling permite probar pipelines de agentes en entornos de desarrollo sin necesidad de GPUs de alta gama.
- **Análisis de texto en tiempo real**: puede usarse para clasificación, extracción de entidades o resumen de documentos en inglés en aplicaciones de streaming, gracias a su baja latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,3 GB, por lo que los pesos en cuantización 5-bit requieren aproximadamente 1,3 GB de memoria. Para inferencia se recomienda al menos 2-3 GB de VRAM, considerando overhead del runtime.
- Compatible con GPUs de consumo como RTX 3060 (12 GB) o superiores, y con Apple Silicon (M1/M2/M3) mediante MLX.
- Se puede desplegar con `mlx-lm` en macOS, o convertirse a otros formatos (GGUF, ONNX) para usar con llama.cpp, Ollama o vLLM en Linux/Windows.
- La latencia y el throughput no han sido medidos públicamente, pero se espera una latencia baja (del orden de decenas de milisegundos por token) en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| keXjos/Qwen3.8-2B-Distill-mlx-5Bit | 353M (según safetensors) | 1,3 GB | Apache 2.0 | MLX 5-bit | Destilado del maestro 2.4T |
| keXjos/Qwen3.8-9B-Distill-mlx-5Bit | no disponible | no disponible | Apache 2.0 | MLX 5-bit | Versión más grande de la misma familia |
| Qwen3.5-2B original | 2B (estimado) | no disponible | Apache 2.0 | safetensors | Modelo base sin destilación |

No hay datos de rendimiento comparativo publicados. La versión de 9B ofrece mayor capacidad pero con más peso y recursos.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado solo en inglés, por lo que no es adecuado para tareas en otros idiomas.
- **Sesgos y alucinaciones**: al ser un modelo destilado y pequeño, puede presentar sesgos de los datos de entrenamiento y alucinar en temas complejos.
- **Contexto limitado**: no se ha especificado la longitud de contexto, probablemente inferior a la de modelos grandes, lo que limita conversaciones largas.
- **Rendimiento inferior al maestro**: su capacidad de razonamiento complejo es menor que la del modelo de 2,4T, por lo que no es recomendable para tareas que requieran razonamiento profundo.
- **Formato propietario**: el formato MLX es específico de Apple Silicon; para otros entornos es necesario convertirlo a formatos como GGUF o safetensors estándar.
- **Licencia**: Apache 2.0 permite uso comercial, pero se deben cumplir las condiciones de la licencia (incluida la atribución).

## Enlaces

- [keXjos/Qwen3.8-2B-Distill-mlx-5Bit en Hugging Face](https://huggingface.co/keXjos/Qwen3.8-2B-Distill-mlx-5Bit)
- [Modelo base: empero-ai/Qwen3.8-2B-Distill](https://huggingface.co/empero-ai/Qwen3.8-2B-Distill)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [GitHub de la familia distilada: RayCodes_Qwen3.8Distilled](https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled)
- [Qwen3.8 en OpenLM.ai](https://openlm.ai/qwen3.8/)</think>## Resumen
El modelo keXjos/Qwen3.8-2B-Distill-mlx-5Bit es una conversión al formato MLX con cuantización de 5 bits del modelo empero-ai/Qwen3.8-2B-Distill, una destilación completa del modelo Qwen3.8 de 2,4 billones de parámetros en la arquitectura Qwen3.5-2B. El objetivo es ofrecer un modelo ligero y eficiente para entornos edge, con capacidades de razonamiento y function calling, manteniendo un tamaño reducido de aproximadamente 1,3 GB. Está optimizado para Apple Silicon mediante el framework MLX, aunque puede convertirse a otros formatos.

La destilación se realizó entrenando el modelo pequeño con las trazas de razonamiento generadas por el maestro, junto con un ajuste supervisado (SFT) que incluye soporte de llamadas a funciones. Aunque el nombre indica 2B parámetros, el archivo de pesos muestra 353.288.000 parámetros, una discrepancia que se detalla en las especificaciones. El modelo se publica bajo licencia Apache 2.0 y soporta solo inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (transformer) |
| Parámetros totales | 353.288.000 (según safetensors; el modelo se denomina 2B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-2B, un transformer compacto diseñado para generación de texto y razonamiento. Según la información disponible, el modelo original es una destilación de parámetros completos del modelo Qwen3.8 de 2,4 billones de parámetros (probablemente un MoE con 95B activos) sobre esta arquitectura reducida. El entrenamiento siguió el mismo currículo que los modelos hermanos de 4B y 9B, utilizando las trazas de razonamiento (chain-of-thought) generadas por el maestro. Además, se aplicó un ajuste supervisado (SFT) para mejorar las capacidades de function calling.

La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, aplicando una cuantización de 5 bits que reduce el tamaño de los pesos a unos 1,3 GB. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

-
