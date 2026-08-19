# kerasformers/gemma-3n-e4b-it

## Resumen

`kerasformers/gemma-3n-e4b-it` es una conversión íntegra al framework Keras 3 del modelo multimodal `google/gemma-3n-E4B-it` de Google, realizada por el proyecto KerasFormers. Este checkpoint corresponde a la variante *instruction-tuned* (it) de Gemma 3n, un modelo diseñado para ejecutarse en dispositivos (on-device) que procesa simultáneamente texto, imagen y audio. La conversión permite cargar y ejecutar el modelo de forma idéntica en los tres backends de Keras 3: TensorFlow, PyTorch y JAX, sin necesidad de modificar el código.

El modelo original de Google incorpora varias innovaciones arquitectónicas sobre la base de Gemma: actualizaciones alternas sobre flujos ocultos paralelos (AltUp), residuales aprendidos aumentados (LAuReL), anchuras anidadas por capa (MatFormer), embeddings por capa, sparsidad de activación, compartición de KV en las capas finales y un esquema de atención 5:1 entre ventana deslizante y global. La parte visual usa un encoder MobileNet-V5 y la parte de audio un conformer USM, ambos alimentan tokens blandos al decodificador. El tamaño del repositorio es de 31,3 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad, coherente con un modelo de unos 4 mil millones de parámetros (según la nomenclatura E4B).

Esta versión de KerasFormers es relevante para desarrolladores que trabajan con Keras 3 y desean integrar un modelo multimodal de última generación sin depender de los pesos originales en PyTorch o JAX, manteniendo la portabilidad entre backends y la posibilidad de cuantización a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer multimodal con AltUp, LAuReL, MatFormer, embeddings por capa, sparsidad de activación, KV-sharing y atención 5:1 sliding/global |
| Parametros totales | 4 mil millones (estimado según nomenclatura E4B; no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (gated, requiere aceptación de términos en Hugging Face) |
| Formato de pesos | Safetensors (los pesos originales de Google son safetensors; la conversión de KerasFormers también los usa) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Gemma 3n de Google, un decodificador multimodal que combina un transformer de solo decodificación con encoders especializados para visión (MobileNet-V5) y audio (USM conformer). Las innovaciones clave incluyen AltUp (actualizaciones alternas entre dos flujos ocultos paralelos), LAuReL (residuales aprendidos que mejoran el flujo de gradientes), MatFormer (anchuras de capa anidadas que permiten extraer submodelos), embeddings por capa, sparsidad de activación para reducir cómputo, compartición de KV en las últimas capas y un patrón de atención híbrido 5:1 entre ventana deslizante y global. Los tokens de imagen y audio se proyectan como tokens blandos que se concatenan con los embeddings de texto.

No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. El checkpoint `-it` está ajustado para instrucciones y debe usarse con la plantilla de chat a través de `Gemma3nProcessor`. La conversión de KerasFormers no modifica los pesos originales; solo adapta el formato para cargarlos con Keras 3.

## Capacidades

- Generación de texto y chat multimodal: acepta entradas de texto, imagen y audio en una misma conversación.
- Descripción y razonamiento sobre imágenes: puede analizar fotografías, diagramas o capturas y responder preguntas sobre su contenido.
- Transcripción y razonamiento sobre audio: procesa señales de audio para transcribir o extraer información.
- Soporte de instrucciones: al ser una variante `it`, sigue instrucciones complejas y mantiene conversaciones multi-turno.
- Portabilidad entre backends: funciona sin cambios en TensorFlow, PyTorch y JAX gracias a Keras 3.
- Cuantización a int8: permite reducir el uso de memoria para despliegue en entornos con recursos limitados.
- No se menciona soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente de accesibilidad multimodal: el modelo puede describir escenas de vídeo o imágenes en tiempo real para personas con discapacidad visual, combinando la entrada de imagen con instrucciones de voz.
- Transcripción y resumen de reuniones: dado un archivo de audio, Gemma 3n puede transcribir la conversación y generar un resumen estructurado, útil para herramientas de productividad.
- Moderación de contenido visual: integrado en pipelines de revisión, puede clasificar imágenes o vídeos según criterios de seguridad y generar informes descriptivos.
- Chatbot de atención al cliente con soporte de capturas: el usuario puede enviar una captura de pantalla de un error y el modelo lo interpreta para ofrecer una solución paso a paso.
- Análisis de documentos científicos: combina figuras, tablas y texto para responder preguntas sobre artículos de investigación, facilitando la revisión bibliográfica.
- Generación de subtítulos automáticos: a partir de audio o vídeo, produce subtítulos sincronizados en inglés, con posibilidad de adaptar el estilo al contexto.
- Prototipado rápido en Keras: los desarrolladores que ya usan Keras 3 pueden integrar este modelo en sus flujos de trabajo sin cambiar de framework, gracias a la conversión de KerasFormers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta conversión específica ni para el modelo original en la documentación proporcionada.

## Requisitos de hardware

- El tamaño del repositorio es de 31,3 GB, lo que indica que los pesos en bfloat16 ocupan aproximadamente esa cantidad. Para cargar el modelo completo en memoria se necesitan al menos 32 GB de RAM/VRAM.
- En una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) sería posible cargar el modelo en bfloat16, aunque con riesgo de quedarse corto si se incluyen los encoders de visión y audio. Se recomienda una GPU con 32 GB o más (A100, H100, etc.) para inferencia cómoda.
- Con cuantización int8, el uso de memoria se reduce aproximadamente a la mitad, lo que permitiría ejecutarlo en GPUs de 16 GB (como RTX 4080 o A10G) con posibles limitaciones de rendimiento.
- Opciones de despliegue: al ser una implementación de Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante frameworks compatibles con Keras. No se menciona soporte nativo para vLLM, llama.cpp u Ollama en la documentación.
- La latencia y el throughput no están especificados; dependerán del backend elegido, la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| kerasformers/gemma-3n-e4b-it | ~4B (estimado) | No disponible | Imagen + audio + texto | Gemma (gated) | Keras 3 (safetensors) |
| google/gemma-3n-E4B-it (original) | ~4B | No disponible (se estima 128k en la documentación oficial de Google, pero no confirmado aquí) | Imagen + audio + texto | Gemma (gated) | PyTorch / JAX |
| google/gemma-3-4b-it | 4B | 128k (según documentación oficial) | Texto + imagen (Gemma 3) | Gemma (gated) | PyTorch / JAX |

La comparativa se basa en características generales; no se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia de esta conversión es su disponibilidad para Keras 3, lo que facilita su uso en entornos TensorFlow o JAX sin necesidad de adaptar el código.

## Limitaciones y advertencias

- Licencia gated: es necesario aceptar los términos de uso de Gemma en Hugging Face antes de descargar el modelo, lo que puede limitar su uso en entornos corporativos con políticas de revisión.
- Idioma: la información proporcionada indica únicamente inglés (`en`). Aunque el modelo original de Google puede soportar más idiomas, esta conversión no lo confirma.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos: no se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en inglés, puede reflejar sesgos culturales y lingüísticos de ese dominio.
- Requisitos de memoria: el tamaño del modelo (31,3 GB en bf16) puede ser prohibitivo para dispositivos con poca memoria, a pesar de estar diseñado para on-device. La cuantización int8 ayuda, pero puede degradar ligeramente la calidad.
- Sin soporte de tool calling: no se menciona la capacidad de invocar funciones externas, lo que limita su uso en agentes que requieran interacción con APIs.
- Dependencia de Keras 3: la conversión requiere la librería `kerasformers` y Keras 3, lo que añade una dependencia adicional al stack técnico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kerasformers/gemma-3n-e4b-it)
- [Modelo original de Google](https://huggingface.co/google/gemma-3n-E4B-it)
- [Repositorio de KerasFormers en GitHub](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 3n en KerasFormers](https://imvision12.github.io/KerasFormers/gemma3n/)
- [Colección de variantes Gemma 3n en Hugging Face](https://huggingface.co/collections/kerasformers/gemma-3n-6a7a507adf78dde12680accf)
- [Términos de licencia de Gemma](https://ai.google.dev/gemma/terms)
