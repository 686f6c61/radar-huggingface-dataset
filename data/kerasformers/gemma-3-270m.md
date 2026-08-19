# kerasformers/gemma-3-270m

## Resumen

El modelo `kerasformers/gemma-3-270m` es una conversión íntegra a Keras 3 del checkpoint original `google/gemma-3-270m` de Google, publicada por el proyecto KerasFormers. Su principal valor es que permite ejecutar el modelo de generación de texto de Google sobre tres backends —TensorFlow, PyTorch y JAX— con un único código, sin modificaciones. Se trata de un checkpoint base (pretrained), es decir, no ha sido ajustado para instrucciones, y está pensado para tareas de generación de texto pura.

El modelo tiene aproximadamente 270 millones de parámetros (según la nomenclatura del nombre) y se distribuye con pesos en bfloat16. Al ser una conversión directa, hereda las características del modelo original de Google, aunque la información proporcionada no detalla la arquitectura interna, la longitud de contexto ni los datos de entrenamiento. Su relevancia radica en que facilita la adopción de Gemma 3 en ecosistemas Keras, ofreciendo una alternativa ligera y portable para experimentación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en google/gemma-3-270m) |
| Parametros totales | 270 millones (según nomenclatura del modelo) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional), float32 (opcional) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (gated, requiere aceptación en el Hub) |
| Formato de pesos | bfloat16 (formato de archivo no especificado) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna del modelo original ni sobre su proceso de entrenamiento. Se trata de una conversión de pesos del checkpoint `google/gemma-3-270m` al formato de Keras 3, realizada por el proyecto KerasFormers. No se ha realizado ningún entrenamiento o fine-tuning adicional sobre los pesos originales.

El modelo se sirve mediante la clase `Gemma3TextGenerate` de la librería `kerasformers`, que permite cargar los pesos directamente desde Hugging Face. La conversión mantiene la compatibilidad con los backends de Keras (TensorFlow, PyTorch y JAX), lo que constituye su principal innovación técnica: un único código ejecutable en tres entornos distintos. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens o técnicas como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt de entrada.
- Modelo base (pretrained), sin fine-tuning para instrucciones ni diálogo.
- Compatibilidad multi-backend: TensorFlow, PyTorch y JAX mediante Keras 3.
- Carga de pesos en bfloat16 por defecto, con opciones de cuantización int8 y precisión float32.
- Integración con el ecosistema KerasFormers y acceso a otras variantes de Gemma 3 (1b, 4b, 12b, 27b) con la misma API.
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Fine-tuning sobre dominios específicos: al ser un modelo base de pequeño tamaño, es adecuado para ajustarlo con datos propios en tareas como clasificación de texto, análisis de sentimiento o generación de contenido especializado, siempre que se disponga de recursos de cómputo moderados.
- Prototipado rápido de aplicaciones de generación de texto: su tamaño reducido permite iterar con rapidez en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Experimentación académica: investigadores pueden utilizarlo como punto de partida para estudiar el comportamiento de modelos pequeños de la familia Gemma 3 en diferentes backends (JAX, PyTorch, TensorFlow) sin cambiar de API.
- Evaluación comparativa de frameworks: sirve para medir el rendimiento y la paridad de resultados entre Keras 3 y otros frameworks, gracias a su implementación unificada.
- Generación de texto en entornos con restricciones de memoria: con cuantización int8, el modelo puede ejecutarse en dispositivos con poca VRAM, como portátiles con GPU integrada o incluso CPU.
- Desarrollo de pipelines de generación de texto en producción ligera: para tareas simples como autocompletado o generación de descripciones cortas, donde no se requiere un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 270 millones de parámetros en bfloat16 (2 bytes por parámetro), el peso del modelo ocupa aproximadamente 540 MB. Sumando overhead de activaciones y memoria del runtime, se estima un consumo de entre 1 y 2 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o GPUs integradas modernas. Para cuantización int8, el requisito baja a aproximadamente 1 GB.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: al ser una librería Keras, se puede integrar en entornos que soporten TensorFlow, PyTorch o JAX. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. Se recomienda consultar la documentación del modelo original `google/gemma-3-270m` para conocer su posicionamiento frente a alternativas.

## Limitaciones y advertencias

- Es un modelo base sin fine-tuning para instrucciones, por lo que no está optimizado para seguir comandos ni mantener diálogos coherentes.
- La licencia Gemma es de acceso restringido (gated); es necesario aceptar los términos en el Hub de Hugging Face antes de su uso.
- El idioma soportado es únicamente inglés, lo que limita su aplicación en otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo base entrenado con datos web, puede presentar sesgos sociales y alucinaciones, como es común en modelos de este tipo.
- La información técnica sobre arquitectura, contexto y entrenamiento no está disponible en la tarjeta del modelo, lo que dificulta evaluar su idoneidad para casos de uso avanzados.
- El tamaño del repositorio (0.6 GB) sugiere que los pesos se almacenan en bfloat16, pero no se especifica el formato exacto de archivo (p. ej., safetensors, H5), lo que puede afectar a la interoperabilidad con otras herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kerasformers/gemma-3-270m
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 3 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma3/
- Modelo original de Google: https://huggingface.co/google/gemma-3-270m
- Paper de Gemma 3 (arXiv:2503.19786): https://arxiv.org/abs/2503.19786
