# Pixfanthav/MOSS-Image-Kroma

## Resumen

MOSS-Image-Kroma es una conversión del modelo de imagen OpenMOSS-Team/MOSS-Image-SFT realizada por el desarrollador independiente Pixfanthav para su aplicación Kroma. Kroma es una app que ejecuta modelos de imagen en la NPU de teléfonos con chip Snapdragon, y este repositorio contiene los pesos reorganizados y recuantizados en el formato propietario del motor de Kroma, no en un formato estándar de Hugging Face. Por tanto, no se trata de un modelo nuevo entrenado desde cero, sino de una redistribución adaptada de un modelo existente para inferencia en hardware móvil.

El repositorio ocupa 27,3 GB y ofrece los pesos en tres variantes: fp16 (la original del modelo base), q8 y q4, esta última con los ficheros de bloques del transformer en 4 bits mientras el resto de componentes (text encoder, VAE) se comparten con la versión fp16. La licencia es Apache 2.0, heredada del modelo base. El modelo está pensado exclusivamente para ser descargado y consumido por la app Kroma; el propio autor advierte que los ficheros no están diseñados para cargarse con otro software.

La relevancia de esta ficha es limitada para el ecosistema general de desarrollo: no hay información publicada sobre arquitectura interna, número de parámetros, contexto ni benchmarks, y el pipeline no está declarado. Es un artefacto de despliegue para un runtime concreto, útil para quien quiera ejecutar generación de imágenes en un Snapdragon a través de Kroma, pero no para integraciones estándar vía transformers, diffusers o APIs convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de imagen; presumiblemente difusión, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, q8 (8 bits), q4 (4 bits en ficheros de bloques del transformer) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | formato propietario del motor Kroma (no safetensors ni GGUF estándar); reorganizado y con otro formato numérico |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MOSS-Image-SFT ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). La model card de esta conversión no incluye detalles técnicos del modelo original; solo describe la estructura de carpetas del repositorio: `transformer` (el modelo de imagen en fp16 tal como se generó), `transformer_q8` y `transformer_q4` (ficheros de bloques del transformer en 8 y 4 bits, compartiendo el resto de componentes con fp16), `text_encoder` y `text_encoder_q8`, `vae` y `extra`.

La única innovación técnica documentada es el propio proceso de conversión: los pesos se han transformado a otro formato numérico y se han reorganizado en el layout del motor Kroma para ejecutarse en la NPU de chips Snapdragon. No hay información sobre si el modelo base emplea difusión latente, transformers multimodales u otra familia arquitectónica.

## Capacidades

- Generación de imágenes a partir de texto (implícito por tratarse de un modelo de imagen y por la presencia de text encoder y VAE en el repositorio).
- Ejecución en NPU de teléfonos Snapdragon mediante la app Kroma.
- Tres niveles de cuantización para adaptar el uso de memoria y el rendimiento al hardware móvil.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de imágenes en dispositivos móviles: el modelo se descarga desde la app Kroma y se ejecuta en la NPU del Snapdragon, permitiendo crear imágenes sin conexión a servicios en la nube. Es adecuado por su empaquetado específico para ese runtime.
- Prototipado de apps de imagen on-device: desarrolladores que quieran evaluar la viabilidad de generación de imágenes local en Android pueden usar Kroma y este repositorio como referencia de despliegue en hardware de gama alta con Snapdragon.
- Pruebas de cuantización en producción móvil: la disponibilidad de variantes fp16, q8 y q4 permite comparar calidad frente a consumo de memoria y latencia en el mismo dispositivo, útil para calibrar el equilibrio en una app real.
- Demos educativas de IA generativa en el móvil: sirve para mostrar en talleres o clases cómo se ejecuta un modelo de difusión en una NPU sin infraestructura de servidor.
- Investigación sobre runtimes alternativos: quien estudie motores de inferencia para NPU puede inspeccionar el layout de ficheros y el esquema de cuantización por bloques que emplea Kroma.
- Evaluación de la cadena MOSS-Image en hardware móvil: permite comprobar si la calidad del modelo base se mantiene tras la conversión y cuantización a 4 y 8 bits en un Snapdragon concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 27,3 GB, pero la variante q4 reduce el peso del transformer a 4 bits, por lo que el consumo real en el dispositivo será muy inferior al tamaño total del repo; no se proporcionan cifras exactas.
- GPU recomendadas: no aplica en el sentido habitual; el modelo está diseñado para la NPU de chips Snapdragon en teléfonos, no para GPU de escritorio.
- Compatibilidad con GPU de consumo: no documentada; el autor indica que los ficheros no están pensados para cargarse con otro software distinto de Kroma.
- Opciones de despliegue: exclusivamente la app Kroma (https://github.com/Pixfanthav/Kroma); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de imagen en formato propietario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Kroma | no disponible | no disponible | propietario Kroma (fp16/q8/q4) | Apache 2.0 | Hugging Face, descarga vía app Kroma |
| OpenMOSS-Team/MOSS-Image-SFT (base) | no disponible | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Otros modelos de imagen on-device (p. ej. Stable Diffusion en móvil) | no disponible | no disponible | varios (ONNX, Core ML, etc.) | variable | variable |

No hay datos suficientes para una comparación cuantitativa de rendimiento con alternativas; la comparación se limita al formato de distribución y la licencia.

## Limitaciones y advertencias

- Los ficheros usan un formato y layout propietarios del motor Kroma; no son cargables con transformers, diffusers, ComfyUI ni otras herramientas estándar.
- El autor declara explícitamente que Kroma es un proyecto independiente no afiliado ni respaldado por los creadores del modelo original.
- No hay información sobre sesgos, riesgo de alucinación visual, limitaciones de idioma ni calidad tras la cuantización a 4 bits.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio por posibles avisos adicionales.
- Al ser una conversión no oficial, no hay garantía de mantenimiento, soporte ni actualizaciones por parte del equipo de OpenMOSS.
- El repositorio tiene un número muy bajo de descargas (26) y ningún like, lo que sugiere poca validación por parte de la comunidad.
- No se especifican los dispositivos Snapdragon compatibles ni los requisitos mínimos de memoria del teléfono.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pixfanthav/MOSS-Image-Kroma
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio de la app Kroma: https://github.com/Pixfanthav/Kroma
