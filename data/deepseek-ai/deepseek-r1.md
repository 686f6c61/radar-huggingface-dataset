# deepseek-ai/DeepSeek-R1

## Resumen

DeepSeek-R1 es la primera generación de modelos de razonamiento de DeepSeek, una empresa china especializada en IA open source. Se trata de un modelo de lenguaje de gran tamaño diseñado para resolver problemas complejos de matemáticas, código y lógica mediante cadenas de pensamiento (chain-of-thought) extensas y auto-verificación. El modelo se presenta como una alternativa open-weight a OpenAI-o1, con un rendimiento comparable en tareas de razonamiento, y ha sido liberado bajo licencia MIT, lo que permite uso comercial sin restricciones.

El desarrollo de DeepSeek-R1 se basa en un pipeline que combina dos etapas de aprendizaje por refuerzo (RL) y dos etapas de ajuste supervisado (SFT), partiendo de un modelo base preentrenado. Además, DeepSeek ha publicado seis versiones destiladas basadas en Qwen2.5 y Llama3, que van desde 1.5B hasta 70B de parámetros, demostrando que los patrones de razonamiento de modelos grandes pueden transferirse eficazmente a modelos más pequeños. El modelo principal tiene 684 mil millones de parámetros totales, con una arquitectura basada en DeepSeek-V3, y está disponible en formato safetensors para su uso con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3 (MoE) |
| Parametros totales | 684.531.386.000 (684B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-R1 utiliza la arquitectura de DeepSeek-V3, un transformer basado en mezcla de expertos (MoE) que permite activar solo una fracción de los parámetros durante la inferencia. Aunque no se especifican los parámetros activos en la información disponible, esta arquitectura es conocida por su eficiencia computacional. El entrenamiento se realizó en dos fases: primero se aplicó aprendizaje por refuerzo directamente sobre el modelo base sin ajuste supervisado previo, dando lugar a DeepSeek-R1-Zero, que demostró capacidades emergentes de auto-verificación y reflexión. Posteriormente, para mejorar la legibilidad y evitar repeticiones, se introdujo una etapa de cold-start con datos supervisados antes del RL, resultando en DeepSeek-R1. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Razonamiento complejo y resolución de problemas matemáticos avanzados, comparable a OpenAI-o1.
- Generación de código de alta calidad, incluyendo tareas de programación competitiva y depuración.
- Capacidad de auto-verificación y reflexión durante el proceso de razonamiento, generando cadenas de pensamiento largas y estructuradas.
- Soporte multilingüe, aunque no se especifican los idiomas exactos.
- Modelo de solo texto, sin capacidades de visión o audio.
- No se ha confirmado soporte explícito para tool calling o function calling en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos avanzados: el modelo puede descomponer problemas complejos en pasos intermedios, verificar cada paso y llegar a soluciones correctas, útil en entornos educativos o de investigación.
- Generación de código en producción: con su capacidad de razonamiento, puede generar código correcto y eficiente, así como explicar su lógica, integrándose en asistentes de desarrollo o pipelines de CI/CD.
- Análisis de datos y razonamiento lógico: puede procesar conjuntos de datos estructurados, extraer conclusiones y generar informes detallados, adecuado para consultoría o análisis financiero.
- Investigación académica: su capacidad para razonar sobre problemas científicos y formales lo convierte en una herramienta valiosa para revisar literatura, formular hipótesis o validar teoremas.
- Asistencia en programación competitiva: puede resolver problemas de algoritmia y estructuras de datos, ofreciendo soluciones optimizadas y explicaciones paso a paso.
- Creación de contenido técnico: puede generar documentación, tutoriales y explicaciones de conceptos complejos con un alto nivel de precisión y detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una figura comparativa con OpenAI-o1, pero no se incluyen números concretos. Se recomienda consultar el paper técnico (arxiv:2501.12948) para datos detallados.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 684B parámetros, se requiere un clúster de GPUs de alta gama. Con cuantización FP8, se estiman al menos 8 GPUs A100 (80GB) o 4-8 H100 (80GB) para inferencia. No cabe en GPUs de consumo.
- GPUs recomendadas: NVIDIA A100, H100 o A800, con al menos 80GB de memoria por GPU.
- Opciones de despliegue: compatible con Transformers, vLLM, TGI y otras herramientas de inferencia optimizada. También se puede usar con llama.cpp si se dispone de cuantización GGUF, aunque no se ha confirmado su disponibilidad.
- Latencia y throughput: no disponible, depende de la configuración de hardware y del batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1 | 684B (MoE) | no disponible | MIT | Open weights |
| OpenAI-o1 | no disponible | no disponible | Propietaria | API cerrada |
| QwQ-32B (destilado) | 32B | no disponible | MIT | Open weights |

Según la model card, DeepSeek-R1 es comparable a OpenAI-o1 en tareas de matemáticas, código y razonamiento. Los modelos destilados, como DeepSeek-R1-Distill-Qwen-32B, superan a OpenAI-o1-mini en varios benchmarks, aunque no se proporcionan números exactos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado con datos de internet, puede heredar sesgos sociales, culturales y de género. No se han publicado evaluaciones específicas de sesgo.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en temas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero se recomienda verificar la documentación técnica para evitar degradación en tareas de contexto largo.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero no se especifican restricciones sobre los datos de entrenamiento. Se recomienda revisar el paper para conocer los términos de uso.
- Para producción, se debe validar el comportamiento en tareas específicas y considerar la implementación de salvaguardas contra contenido dañino.

## Enlaces

- [HuggingFace - DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- [Paper técnico (arxiv:2501.12948)](https://arxiv.org/abs/2501.12948)
- [GitHub - DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1)
- [Web oficial de DeepSeek](https://www.deepseek.com/)
