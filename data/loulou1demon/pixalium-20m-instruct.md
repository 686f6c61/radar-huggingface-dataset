# LouLou1Demon/pixalium-20M-instruct

## Resumen

pixalium-20M-instruct es un modelo de generacion de texto de tamaño reducido, desarrollado por LouLou1Demon (TAJU), que parte del modelo pretrained pixalium-20M-pretrained y ha sido ajustado mediante fine-tuning supervisado (SFT) usando la librería TRL de Hugging Face. Con aproximadamente 30 millones de parámetros en pesos reales, pertenece a la categoría de modelos de lenguaje compactos, diseñados para experimentación, prototipado y aplicaciones ligeras donde los recursos de cómputo son limitados.

El modelo sigue una arquitectura basada en Llama (transformer decoder), tal y como indican las etiquetas del repositorio, y está pensado para tareas de text-generation. Al tratarse de un modelo de 20M nominales (aunque los pesos reales suman cerca de 30M), su principal interés radica en su bajo coste de inferencia, su facilidad de despliegue en hardware modesto y su utilidad como punto de partida para estudios sobre escalado y fine-tuning de modelos pequeños.

Su relevancia actual se limita al ámbito académico y de experimentación, ya que carece de benchmarks publicados, no dispone de licencia especificada y su capacidad de razonamiento es intrínsecamente limitada por su tamaño. No obstante, puede servir para validar pipelines de entrenamiento, pruebas de concepto y entornos educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama |
| Parametros totales | 29.990.784 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Llama, aunque no se especifican detalles concretos como el número de capas, cabezas de atención o dimensiones ocultas. El modelo base (pixalium-20M-pretrained) fue preentrenado previamente y el presente checkpoint es un fine-tuning supervisado (SFT) realizado con la libreria TRL. Los frameworks utilizados en el entrenamiento son TRL 1.10.0, Transformers 5.15.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. No se proporciona información sobre el dataset de fine-tuning, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La ausencia de estos datos limita la reproducibilidad del entrenamiento.

## Capacidades

- Generación de texto autónoma en formato conversacional (chat) y de completado libre, mediante pipeline de `text-generation`.
- Soporte de entrada estructurada con roles de usuario y asistente, tal como se muestra en el ejemplo de la model card.
- Capacidad de generación con parámetro `max_new_tokens` configurable (128 en el ejemplo).
- Funcionalidad básica de instrucción (instruct), orientada a responder preguntas y seguir comandos simples.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso explícito.
- El multilingüismo no está especificado; se asume que el entrenamiento pudo realizarse mayoritariamente en inglés, pero no hay confirmación.

## Casos de uso

- Experimentación académica: el modelo sirve para estudiar el comportamiento de modelos pequeños en tareas de generación de texto, comparar estrategias de fine-tuning y analizar la evolución de la pérdida y la calidad de las respuestas en entornos controlados.
- Prototipado rápido: gracias a su tamaño reducido, permite desarrollar y probar pipelines de generación de texto en entornos de desarrollo sin necesidad de infraestructura de GPU costosa, incluso en máquinas locales con CPU.
- Pruebas de integración en pipelines de NLP: puede integrarse en flujos de procesamiento de lenguaje natural (p. ej., generación de respuestas, resumen básico) para verificar la correcta integración con librerías como Transformers y TRL.
- Educación y aprendizaje: es un modelo útil para enseñar conceptos de transformers, fine-tuning y generación de texto a estudiantes de machine learning, al poder ejecutarse en hardware básico.
- Generación de datos sintéticos de baja complejidad: puede producir textos cortos para completar datasets de entrenamiento en tareas muy sencillas, siempre que no se requiera alta calidad.
- Demostraciones y talleres: en eventos o cursos donde se necesita un modelo que funcione en tiempo real sin esperas de carga, este modelo ofrece una respuesta rápida y un despliegue sencillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo carece de evaluaciones de MMLU, HumanEval, GSM8K u otros referentes, por lo que no es posible cuantificar su rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada: con 30M de parámetros en FP16, el peso ocupa aproximadamente 60 MB. La inferencia puede ejecutarse con menos de 1 GB de VRAM en GPU.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4090) es suficiente. También puede ejecutarse en CPU.
- Compatibilidad con GPU consumer: sí, es totalmente viable en hardware de gama baja.
- Opciones de despliegue: se puede desplegar con librerías como Transformers (pipeline), vLLM, llama.cpp, Ollama o TGI, aunque su tamaño hace que la opción más simple sea Transformers o llama.cpp.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño, la generación de 128 tokens debería completarse en menos de un segundo en CPU moderna y en pocos milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría (20M-30M parámetros). Se podría mencionar TinyLlama (1.1B) como referencia de modelos pequeños, pero su tamaño es mucho mayor y no comparte el mismo rango. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo de pequeño tamaño, es previsible que presente sesgos heredados del dataset de entrenamiento no especificado.
- Riesgo de alucinación: alta probabilidad de generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo, debido a su limitada capacidad.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero probablemente sea de 2048 o 4096 tokens, lo que limita tareas de dependencia de contexto largo.
- Limitaciones de idioma: no se documenta el soporte de idiomas; es probable que su rendimiento en español sea limitado y no robusto.
- Restricciones de licencia: la licencia no está especificada, lo que impide determinar si se permite uso comercial. Se recomienda contactar con el autor antes de usar en producción.
- Cualquier uso en producción debe considerar que es un modelo experimental sin benchmarks, sin garantías de calidad y con capacidad muy limitada para tareas complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LouLou1Demon/pixalium-20M-instruct
- Modelo base (pretrained): https://huggingface.co/LouLou1Demon/pixalium-20M-pretrained
- Perfil del autor: https://huggingface.co/LouLou1Demon
- Referencia a TRL (librería de entrenamiento): https://github.com/huggingface/trl
