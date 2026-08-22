# root4k/Qwen3.8-27B-Uncensored-oQ4e-fp16-mtp

## Resumen

El modelo `root4k/Qwen3.8-27B-Uncensored-oQ4e-fp16-mtp` es una cuantización en 4 bits del modelo de lenguaje Qwen3.8-27B-Uncensored, desarrollado por OrcaRouter, una versión sin filtros de censura del modelo Qwen3.8-27B de Alibaba. La cuantización ha sido realizada por el usuario root4k utilizando la herramienta oQ (oMLX v0.6.3rc2), que aplica una precisión mixta con pesos de 4 bits y un grupo de tamaño 64, conservando algunos componentes en fp16 para mitigar la pérdida de calidad. El resultado es un modelo en formato MLX safetensors, optimizado para ejecutarse en dispositivos con Apple Silicon mediante el framework MLX.

Esta ficha resulta relevante para desarrolladores que buscan ejecutar un modelo de 27B parámetros en hardware local de Apple, ya que la cuantización reduce significativamente los requisitos de memoria en comparación con el modelo original. La ausencia de censura lo hace atractivo para tareas de investigación y generación de contenido sin restricciones, aunque también conlleva riesgos que se detallan en la sección de limitaciones. No se dispone de información sobre la licencia ni los idiomas soportados, por lo que su uso en producción debe evaluarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tipo `qwen3_5`) |
| Parametros totales | 4.926.832.872 (según safetensors; el modelo base declara 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precisión mixta oQ4e (parte en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La cuantización se realizó sobre el modelo base `orcarouter/Qwen3.8-27B-Uncensored`, que es una versión de Qwen3.8-27B a la que se le ha aplicado una técnica de ablación (abliteration) para eliminar los mecanismos de rechazo de contenido no deseado. El modelo base es un transformer denso de 27B parámetros, entrenado por Alibaba, aunque no se han publicado detalles sobre el dataset ni el proceso de entrenamiento en la información disponible.

La cuantización oQ4e utiliza un esquema de precisión mixta: los pesos principales se representan en 4 bits con un tamaño de grupo de 64, mientras que ciertas capas o tensores se mantienen en fp16 para conservar la precisión. El resultado es un archivo en formato MLX safetensors, específico para la librería MLX de Apple. No se ha documentado si se realizó un paso de calibración posterior a la cuantización.

## Capacidades

- Generación de texto en lenguaje natural: como modelo de propósito general, debería ser capaz de redactar, resumir, responder preguntas y mantener conversaciones, aunque no hay pruebas publicadas de esta cuantización.
- Razonamiento y conocimiento: al derivar de Qwen3.8-27B, se espera que tenga capacidades de razonamiento y conocimiento enciclopédico, pero no se han verificado en esta versión.
- Generación de código: probablemente pueda asistir en programación, dado el tamaño del modelo base, sin confirmación oficial.
- Capacidades multilingües: no disponible, aunque Qwen3.8-27B suele ser multilingüe.
- Tool calling y agentes: no se ha documentado si esta cuantización conserva esas capacidades.
- Sin censura: el modelo base ha sido «abliterado», por lo que no debería rechazar solicitudes por contenido sensible, siempre que la cuantización no haya introducido cambios en ese comportamiento.

## Casos de uso

- Desarrollo de aplicaciones en Apple Silicon: gracias a su formato MLX, el modelo puede integrarse en aplicaciones nativas para macOS o iOS usando la librería MLX, con una latencia razonable para un modelo de 27B cuantizado.
- Investigación en seguridad de modelos: la versión sin censura permite estudiar el comportamiento de un LLM sin restricciones de contenido, útil para análisis de sesgos, alucinaciones o robustez.
- Generación creativa sin filtros: para escritura de ficción, guiones o contenido que los modelos estándar rechazan, esta cuantización ofrece una alternativa local.
- Desarrollo de chatbots para entornos controlados: en aplicaciones donde se desea evitar el rechazo automático de temas delicados, siempre que el despliegue cumpla con las normativas legales.
- Evaluación de técnicas de cuantización: el uso de oQ4e permite comparar la calidad de la cuantización mixta frente a otras metodologías en tareas de generación.
- Prototipado rápido en Mac: para desarrolladores que necesitan un LLM local de alto rendimiento sin depender de servicios en la nube, esta cuantización reduce los requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede afirmar el rendimiento en tareas estándar como MMLU, HumanEval o GSM8K para esta cuantización concreta.

## Requisitos de hardware

- Memoria RAM estimada: el repositorio ocupa 17,9 GB, por lo que se necesitan al menos 24 GB de memoria unificada en Apple Silicon para cargar el modelo en memoria. Una Mac con 32 GB sería recomendable.
- GPU recomendada: Apple Silicon con al menos 24 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, etc.).
- Compatibilidad con consumer GPU: no es compatible con tarjetas gráficas NVIDIA o AMD, ya que el formato MLX es exclusivo de Apple.
- Opciones de despliegue: la librería MLX de Apple (mlx-lm) para inferencia local. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no se han publicado mediciones. Depende de la memoria y del chip, pero se espera una velocidad de decodificación de varios tokens por segundo en chips de gama alta.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente. La cuantización oQ4e de Qwen3.8-27B-Uncensored es específica de MLX. Se podrían comparar con otras cuantizaciones del mismo modelo, como las versiones GGUF para llama.cpp (por ejemplo, las publicadas por OrcaRouter), pero no hay datos de rendimiento comparativos disponibles. No disponible.

## Limitaciones y advertencias

- Sesgos y contenido dañino: al ser una versión sin censura, el modelo puede generar contenido ofensivo, violento o ilegal sin filtros. El uso debe realizarse con responsabilidad.
- Riesgo de alucinación: como todo LLM, puede producir información falsa o inventada, y la cuantización puede aumentar este riesgo.
- Licencia y uso comercial: no se ha declarado la licencia, por lo que no se puede garantizar la legalidad de un uso comercial o de redistribución.
- Soporte limitado: el modelo está en formato MLX, lo que limita su uso a hardware Apple y excluye otras plataformas de despliegue habituales.
- Sin documentación de entrenamiento: no se conocen los datos de entrenamiento, lo que dificulta evaluar sesgos o comportamiento en dominios específicos.
- Tamaño de contexto desconocido: no se ha especificado la longitud máxima de contexto, lo que puede afectar a tareas que requieran entradas largas.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/root4k/Qwen3.8-27B-Uncensored-oQ4e-fp16-mtp](https://huggingface.co/root4k/Qwen3.8-27B-Uncensored-oQ4e-fp16-mtp)
- Modelo base original: [https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- Repositorio de la herramienta oQ: [https://github.com/jundot/omlx](https://github.com/jundot/omlx)
- Blog de OrcaRouter sobre el modelo y su ejecución local: [https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- Explicación técnica de la versión MLX: [https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
