# Pixfanthav/Krea-2-Turbo-Kroma

## Resumen

Krea-2-Turbo-Kroma es una conversión del modelo de generación de imágenes Krea-2-Turbo (desarrollado por Krea) realizada por el usuario Pixfanthav para su ejecución en la NPU de teléfonos con chip Snapdragon. El repositorio no contiene un modelo nuevo ni un ajuste fino, sino los pesos originales reorganizados y recuantizados en el formato propietario del motor Kroma, una aplicación independiente que no está afiliada ni respaldada por los creadores del modelo original.

El interés de esta publicación es práctico: permite ejecutar un modelo de difusión de imágenes en hardware móvil aprovechando la NPU de los SoC Snapdragon, algo poco habitual en el ecosistema de modelos abiertos. El repositorio pesa 57,8 GB e incluye los pesos en fp16 junto con variantes cuantizadas a 8 y 4 bits de los bloques del transformer, además del text encoder (también en versión q8) y el VAE.

La información pública es muy limitada: no se detalla la arquitectura interna del modelo base, el número de parámetros, la longitud de contexto del text encoder ni los idiomas soportados. La model card se centra en la estructura de carpetas y en la licencia, no en las capacidades técnicas. Cualquier evaluación rigurosa del modelo debe remitirse al repositorio original `krea/Krea-2-Turbo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para generacion de imagenes; detalles del backbone no publicados en esta ficha) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (original), q8 (8 bits) y q4 (4 bits) para los bloques del transformer; text encoder en fp16 y q8 |
| Idiomas soportados | no disponible |
| Licencia | Krea 2 Community License Agreement (license_name: krea-2-community-license) |
| Formato de pesos | ONNX reorganizado en el layout del motor Kroma (no compatible con otros runtimes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Krea-2-Turbo en la documentación proporcionada. Por el contexto (generación de imágenes, presencia de un `text_encoder` y un `vae` separados) se trata de un modelo de difusión texto-a-imagen con codificador de texto y decodificador VAE, pero no se especifican el tipo de backbone (UNet, DiT u otro), el número de parámetros ni la composición del dataset de entrenamiento.

La contribución de este repositorio es exclusivamente de conversión e ingeniería de despliegue: los pesos se han transformado a otro formato numérico y reorganizado en el layout del motor Kroma. Se ofrecen variantes cuantizadas a 8 y 4 bits de los bloques del transformer para reducir el espacio en disco y la memoria necesaria en el dispositivo, manteniendo el resto de componentes (VAE, text encoder) en fp16 o q8 según el caso. No hay información sobre RLHF, DPO ni técnicas de alineación.

## Capacidades

- Generación de imágenes a partir de texto (texto-a-imagen), heredada del modelo base Krea-2-Turbo.
- Ejecución en la NPU de teléfonos con chip Snapdragon mediante la aplicación Kroma.
- Selección de formato de cuantización (fp16, q8, q4) desde la pantalla de descarga de la app.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, tool calling, agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de imágenes en el propio dispositivo: la app Kroma descarga los pesos y ejecuta el modelo en la NPU del Snapdragon, permitiendo crear imágenes sin enviar prompts a un servidor externo.
- Prototipado móvil de aplicaciones creativas: desarrolladores que quieran integrar generación de imágenes offline en apps Android sobre hardware Snapdragon pueden usar este paquete como referencia de despliegue en NPU.
- Evaluación de cuantización en hardware móvil: las variantes q8 y q4 permiten comparar calidad frente a fp16 en un mismo dispositivo, útil para estudiar el compromiso entre fidelidad y memoria.
- Demos y pruebas de concepto en ferias o entornos sin conectividad: al ejecutarse localmente, el modelo funciona sin red una vez descargados los archivos.
- Investigación sobre inferencia en NPU: sirve como caso de estudio de conversión de pesos de difusión a un layout específico de motor propietario.
- Uso personal de generación de imágenes sujeto a la licencia comunitaria de Krea, siempre que se respeten sus términos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: teléfonos con chip Snapdragon que expongan NPU compatible con el motor Kroma.
- VRAM/espacio: el repositorio completo ocupa 57,8 GB, pero la app descarga únicamente la variante elegida (fp16, q8 o q4); el peso en memoria del dispositivo depende del formato seleccionado y no se detalla.
- GPU de escritorio: no aplica; los pesos están en el layout del motor Kroma y no están pensados para cargarse en otros runtimes.
- Opciones de despliegue: exclusivamente la aplicación Kroma (https://github.com/Pixfanthav/Kroma). No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Despliegue |
|---|---|---|---|---|
| Krea-2-Turbo-Kroma | Difusión texto-a-imagen (convertido) | ONNX layout Kroma | Krea 2 Community License | App Kroma en NPU Snapdragon |
| krea/Krea-2-Turbo (original) | Difusión texto-a-imagen | no disponible en esta ficha | Krea 2 Community License | Ecosistema estándar de difusión |
| Otros modelos de difusión móviles | Difusión texto-a-imagen | GGUF / CoreML / etc. | variable | llama.cpp, CoreML, etc. |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Los pesos están en un layout propietario del motor Kroma y no pueden cargarse en otras herramientas; el propio autor lo advierte.
- Kroma es un proyecto independiente no afiliado ni respaldado por Krea.
- La licencia Krea 2 Community License impone restricciones que deben revisarse antes de cualquier uso comercial; el uso de los archivos implica aceptarla.
- No hay información sobre sesgos, tasas de alucinación visual ni calidad de generación en esta ficha.
- No se documentan idiomas soportados por el text encoder.
- El número de descargas (35) y de likes (0) es muy bajo, por lo que la validación comunitaria es prácticamente inexistente.
- El rendimiento real depende de la NPU concreta del Snapdragon y de la versión de la app Kroma; no hay cifras publicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pixfanthav/Krea-2-Turbo-Kroma
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- App Kroma: https://github.com/Pixfanthav/Kroma
- Licencia Krea 2: https://krea.ai/krea-2-licensing
