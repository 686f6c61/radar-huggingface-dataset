# kaptaan45/QaptaanLM-0.75B-ONNX

## Resumen

QaptaanLM-0.75B-ONNX es la exportación oficial en formato ONNX del modelo fundacional QaptaanLM-0.75B, desarrollado por kaptaan45. Se trata de un modelo de lenguaje compacto de atención híbrida (con componente lineal) optimizado para síntesis de código fuente, razonamiento técnico y comprensión de código en contextos largos. Esta versión ONNX está pensada para ejecución en el navegador mediante WebGPU y transformers.js, así como en entornos ONNX Runtime (CPU, CUDA). El nombre del modelo sugiere 0.75 mil millones de parámetros, aunque no se confirma en la documentación disponible. El repositorio tiene un tamaño de 4.0 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atención híbrida con componente lineal (linear-attention) |
| Parametros totales | no disponible (el nombre sugiere 0.75B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX estándar, sin cuantización declarada) |
| Idiomas soportados | Inglés (en) y código (code) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (Opset 17, con constant folding) |

## Arquitectura y entrenamiento

El modelo base QaptaanLM-0.75B se describe como un modelo fundacional de atención híbrida, combinando mecanismos de atención tradicionales con atención lineal para mejorar la eficiencia en contextos largos. La exportación ONNX mantiene la arquitectura original, con ejes dinámicos para batch y longitud de secuencia, lo que permite flexibilidad en la inferencia. En cuanto al entrenamiento, se indica que es un modelo "Continued Pre-Trained (CPT)", es decir, un preentrenamiento continuado sobre un modelo base previo, aunque no se especifican los datos, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. No hay información adicional sobre innovaciones técnicas más allá de la atención lineal.

## Capacidades

- Generación de texto y código fuente, con especialización en síntesis de código.
- Razonamiento técnico y comprensión de código en contextos largos.
- Ejecución en navegador gracias a la exportación ONNX y compatibilidad con WebGPU y transformers.js.
- Soporte para inferencia en CPU, CUDA y WebGPU mediante ONNX Runtime.
- Multilingüe limitado: solo inglés y código (no se declaran otros idiomas).
- No se menciona soporte para tool calling, function calling, agentes ni modos de razonamiento especiales.

## Casos de uso

- Completado de código en editores web: al ejecutarse en el navegador, puede integrarse en extensiones o aplicaciones web para autocompletar código en tiempo real sin necesidad de servidor.
- Asistente de programación local: gracias a su tamaño compacto y formato ONNX, puede desplegarse en entornos con recursos limitados para ayudar en tareas de programación, como generar funciones o explicar fragmentos de código.
- Análisis de código en pipelines de CI/CD: su capacidad para comprender código en contextos largos permite integrarlo en herramientas de revisión automática de código, detectando patrones o generando resúmenes.
- Prototipado rápido de aplicaciones de IA en el cliente: al ser compatible con transformers.js, facilita la creación de demos interactivas de generación de texto y código directamente en el navegador.
- Educación y formación técnica: puede utilizarse como herramienta de apoyo para estudiantes de programación, generando ejemplos de código y explicaciones técnicas en inglés.
- Investigación en eficiencia de atención: al incorporar atención lineal, sirve como base para experimentos sobre arquitecturas eficientes en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 0.75B de parámetros (sin confirmar), se estima que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en FP32, aunque no hay datos oficiales.
- El formato ONNX permite ejecución en CPU, por lo que es viable en entornos sin GPU, con mayor latencia.
- Compatible con WebGPU, lo que permite inferencia en navegadores con aceleración por GPU en dispositivos compatibles.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU), transformers.js para navegador, y potencialmente vLLM o llama.cpp si se convierte a otros formatos, aunque no está documentado.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo no tiene benchmarks publicados ni se conocen alternativas directas con características equivalentes (atención híbrida, tamaño sub-1B, exportación ONNX para navegador). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser un modelo base sin fine-tuning instructivo, puede no seguir instrucciones complejas ni mantener conversaciones coherentes sin un ajuste posterior.
- Riesgo de alucinación en la generación de código y texto, especialmente en contextos ambiguos o poco representados en los datos de entrenamiento.
- Limitación idiomática: solo soporta inglés y código, por lo que no es adecuado para tareas en otros idiomas.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos de código, puede reflejar sesgos presentes en repositorios públicos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones sensibles.
- El tamaño del repositorio (4.0 GB) sugiere que el archivo ONNX no está cuantizado, lo que puede requerir más memoria de la esperada para un modelo de 0.75B.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-ONNX
- Modelo base en Hugging Face: https://huggingface.co/kaptaan45/QaptaanLM-0.75B
- Repositorio GitHub (posible espejo): https://github.com/rudy-07/QaptaanLM-0.75B
