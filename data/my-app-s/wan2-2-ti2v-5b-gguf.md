# my-app-s/Wan2.2-TI2V-5B-GGUF

## Resumen

Wan2.2-TI2V-5B-GGUF es una conversión al formato GGUF del modelo Wan2.2-TI2V-5B, desarrollado originalmente por Wan-AI (Alibaba). Se trata de un modelo generativo de vídeo a partir de texto (text-to-video) con capacidad dual text-image-to-video (TI2V), es decir, puede generar secuencias de vídeo tanto desde una descripción textual como desde una imagen de referencia combinada con texto. El modelo original cuenta con aproximadamente 5.000 millones de parámetros (4.999.787.712 exactamente), lo que lo sitúa en el rango medio de los modelos de difusión para vídeo y permite su despliegue en hardware de consumo con las cuantizaciones adecuadas.

Esta versión GGUF, publicada por el usuario my-app-s, no introduce cambios arquitectónicos ni de entrenamiento: es una conversión directa de los pesos originales pensada para su uso con nodos personalizados de ComfyUI, en concreto ComfyUI-GGUF de city96. Su relevancia radica en que facilita la ejecución local del modelo en GPUs con VRAM limitada, algo que con los pesos en precisión completa (fp16/bf16) resultaría inviable en tarjetas de consumo. El repositorio ocupa 45,4 GB, lo que refleja la presencia de múltiples niveles de cuantización empaquetados.

La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales de dicha licencia. Los idiomas declarados son inglés y chino, coherente con el origen del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de vídeo; detalles del backbone no especificados en la información proporcionada) |
| Parametros totales | 4.999.787.712 (~5B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la información proporcionada) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión del modelo base Wan-AI/Wan2.2-TI2V-5B) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Wan2.2-TI2V-5B más allá de su naturaleza como modelo de difusión para generación de vídeo con pipeline text-to-video y capacidad TI2V (text-image-to-video). No se especifican el tipo de backbone (DiT, U-Net u otra variante), el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o mecanismos de atención lineal.

Lo que sí se conoce es que esta ficha corresponde a una cuantización GGUF del modelo original, no a un reentrenamiento. La conversión preserva los pesos y el comportamiento del modelo base, y su propósito es exclusivamente práctico: reducir los requisitos de memoria para inferencia local. El modelo base fue desarrollado por Wan-AI y esta variante fue publicada por un tercero (my-app-s), sin que la model card documente modificaciones adicionales más allá de la cuantización.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video): produce secuencias de vídeo a partir de una descripción en lenguaje natural.
- Generación de vídeo a partir de imagen y texto (text-image-to-video, TI2V): permite usar una imagen de referencia junto con una instrucción textual para guiar la generación.
- Soporte bilingüe en inglés y chino para las indicaciones textuales.
- Integración con ComfyUI mediante el nodo personalizado ComfyUI-GGUF, lo que habilita flujos de trabajo visuales por nodos.
- Ejecución local con cuantización GGUF, orientada a reducir el consumo de VRAM frente a los pesos originales.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general (más allá de la imagen de referencia para TI2V), audio ni modo thinking.

## Casos de uso

- Prototipado rápido de vídeo generativo en local: un desarrollador puede cargar el GGUF en ComfyUI y generar clips de prueba sin depender de servicios en la nube, gracias a que la cuantización reduce los requisitos de VRAM frente a los pesos originales.
- Creación de contenido para redes sociales: generación de clips cortos a partir de descripciones textuales o de una imagen semilla, útil para equipos creativos que necesitan iterar variaciones rápidamente.
- Animación de imágenes estáticas (TI2V): a partir de una ilustración o fotografía y una instrucción textual, el modelo puede producir una animación coherente con la imagen de referencia, lo que resulta adecuado para storyboards o maquetas visuales.
- Investigación en generación de vídeo: el formato GGUF facilita experimentar con distintos niveles de cuantización y medir el impacto en calidad y velocidad, sin necesidad de infraestructura de datacenter.
- Integración en pipelines de ComfyUI para producción de vídeo asistida: al funcionar con el nodo ComfyUI-GGUF, puede encadenarse con otros nodos (preprocesado de imagen, postprocesado, upscaling) dentro de un flujo automatizado.
- Docencia y demostraciones: al ser ejecutable en hardware de consumo con la cuantización adecuada, sirve para talleres y clases donde se explica el funcionamiento de modelos de difusión para vídeo sin requerir GPUs de gama alta.
- Generación de material audiovisual para previsualización: equipos de cine o publicidad pueden generar clips de referencia antes de rodar, usando el modelo en local para mantener la confidencialidad del guion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un modelo de ~5B parámetros en fp16 requiere del orden de 10 GB solo para los pesos, más el overhead del pipeline de difusión y del decodificador de vídeo; las cuantizaciones GGUF reducen esa cifra, pero los niveles concretos incluidos en el repositorio no se detallan en la información proporcionada.
- GPU recomendadas: no especificadas en la información disponible.
- Viabilidad en GPU de consumo: el propósito declarado de la cuantización GGUF es precisamente facilitar la ejecución en hardware más modesto, pero no se confirma en la model card qué tarjetas concretas son suficientes.
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-GGUF (los archivos se colocan en `ComfyUI/models/unet`). No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) para este modelo, lo cual es esperable al tratarse de un modelo de difusión para vídeo y no de un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, esta variante GGUF se diferencia de su modelo base (Wan-AI/Wan2.2-TI2V-5B) únicamente en el formato de pesos y en el tamaño resultante, manteniendo parámetros y licencia.

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B-GGUF (este) | ~5B | GGUF | Apache 2.0 | no disponible | Cuantización para ComfyUI |
| Wan-AI/Wan2.2-TI2V-5B | ~5B | safetensors (presumiblemente) | Apache 2.0 | no disponible | Modelo base original |
| Otros modelos de vídeo | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una conversión del modelo base, hereda los sesgos de los datos de entrenamiento originales, que no se detallan.
- Riesgo de alucinación: no cuantificado; en modelos generativos de vídeo, la fidelidad a la instrucción textual puede variar y producir contenido no solicitado o incoherente.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en otros idiomas, incluido el castellano, no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card recuerda que, al ser un modelo cuantizado, se mantienen todos los términos y restricciones de la licencia original. Conviene revisar la licencia del modelo base por si hubiera condiciones adicionales no reflejadas aquí.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02), lo que sugiere que es una publicación reciente y sin validación comunitaria. No hay evidencia de pruebas de calidad publicadas.
- Dependencia de ComfyUI-GGUF: el uso previsto requiere un nodo personalizado de terceros, lo que añade una dependencia externa y posibles problemas de compatibilidad con versiones futuras de ComfyUI.
- Tamaño del repositorio: 45,4 GB, lo que implica requisitos de almacenamiento considerables y tiempos de descarga largos.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar la pérdida de calidad introducida por la cuantización frente al modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/my-app-s/Wan2.2-TI2V-5B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Nodo ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Perfil de Hugging Face de city96: https://huggingface.co/city96
