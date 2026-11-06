# JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4

## Resumen

`p0pc0rn-assistant-gemma4-e2b-q4` es una conversión cuantizada del modelo multimodal `google/gemma-4-E2B-it` de Google, publicada por el desarrollador independiente Joshua Hughes (proyecto p0pc0rn) el 15 de octubre de 2026. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de Gemma 4 E2B-it han sido convertidos a un formato propietario denominado `pocketflux.pack/1`, con cuantización mixta GPTQ de 4 y 8 bits, para su ejecución en el motor WebGPU de la aplicación móvil p0pc0rn.

El modelo conserva la torre de visión y el pipeline `image-text-to-text` del original, lo que permite entrada conjunta de imagen y texto. El paquete ocupa 3,26 GB repartidos en 93 shards y está pensado para inferencia on-device en teléfonos, no para servidores. Su relevancia radica en que demuestra una vía de distribución de modelos multimodales cuantizados fuera del ecosistema estándar de Transformers, con verificación de integridad por chunk (sha256) y un manifiesto que describe offsets, formas y codificación de cada tensor.

La licencia declarada es Apache-2.0, heredada del checkpoint base según el autor, lo que lo diferencia de la mayoría de releases de Gemma que se distribuyen bajo los Gemma Terms of Use. Esta ficha describe únicamente lo que consta en la información disponible; muchos datos técnicos del modelo subyacente (número de parámetros, contexto, idiomas) no están publicados en la model card y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + modelo de lenguaje); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit (grupos de 32) en MLPs; 8-bit en atención, gates y MLPs de las capas 4, 6, 12 y 13; torre de visión en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `pocketflux.pack/1` (shards `.pfw` con datos tensoriales crudos y `manifest.json`); no es un checkpoint de Transformers ni de Diffusers |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it` (revisión `3e22461f`), un modelo instructivo multimodal de la familia Gemma 4. La model card no detalla la arquitectura interna del original (número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento ni si hubo RLHF o DPO), por lo que esos datos deben consultarse en la documentación oficial de Google y no pueden confirmarse aquí.

La contribución del autor es exclusivamente de conversión y cuantización. El esquema aplicado es una mezcla de precisión: GPTQ de 4 bits con grupos de 32 para las capas MLP, 8 bits para la atención, las puertas (gates) y las MLPs de las capas 4, 6, 12 y 13, y 8 bits para la torre de visión. Esta selección busca preservar las capas presumiblemente más sensibles a la cuantización agresiva mientras reduce el grueso de los pesos. El tokenizador de Gemma 4 se almacena en forma compacta y la plantilla de chat se conserva literalmente. El formato de empaquetado incluye un manifiesto con offsets, formas, codificación y sha256 de cada chunk de 16 MiB, lo que permite verificación de integridad durante la descarga.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto, heredadas de Gemma 4 E2B-it (pipeline `image-text-to-text`).
- Comprensión de imágenes mediante la torre de visión cuantizada a 8 bits.
- Conversación multi-turno con la plantilla de chat original de Gemma 4.
- Ejecución on-device en WebGPU, orientada a dispositivos móviles.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes, modo thinking, audio o matemáticas avanzadas; deben asumirse las del modelo base, sin confirmación en esta ficha.

## Casos de uso

- Asistente multimodal en aplicación móvil: el paquete está diseñado para cargarse en el motor WebGPU de p0pc0rn, de modo que el usuario puede hacer preguntas sobre imágenes sin enviar datos a un servidor.
- Procesamiento de imágenes privadas en el dispositivo: al ejecutarse localmente, es adecuado para escenarios donde la imagen no debe salir del teléfono (documentos personales, fotos médicas, capturas de pantalla).
- Prototipado de funciones de visión en apps web: el formato permite distribuir un modelo de 3,26 GB por shards con verificación sha256, útil para equipos que quieran integrar descripción de imágenes en una PWA.
- Descripción y etiquetado de imágenes offline: útil en aplicaciones de campo o entornos sin conectividad donde se necesita generar metadatos textuales a partir de fotos.
- Base para experimentación con cuantización mixta: investigadores interesados en evaluar el impacto de 4 bits en MLPs frente a 8 bits en atención pueden usar este paquete como referencia práctica.
- Distribución de modelos con cumplimiento de licencias: el manifiesto y el sistema de avisos de licencia del proyecto sirven como ejemplo de empaquetado que respeta requisitos de atribución en apps comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el paquete pesa 3,26 GB; la inferencia requiere al menos esa cantidad de memoria más overhead de activaciones y del motor WebGPU, no cuantificado en la información disponible.
- GPU recomendadas: no disponible; el destino declarado es WebGPU en teléfonos, no GPU de servidor.
- Compatibilidad con GPU de consumo: no confirmada; el formato `.pfw` solo lo lee el motor WebGPU de p0pc0rn, por lo que no es cargable directamente en llama.cpp, vLLM, Ollama ni TGI.
- Opciones de despliegue: exclusivamente la aplicación p0pc0rn con su motor WebGPU; no hay soporte documentado para otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| p0pc0rn-assistant-gemma4-e2b-q4 | no disponible | no disponible | `pocketflux.pack/1` | Apache-2.0 | Solo motor WebGPU de p0pc0rn |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (presumible) | según model card del autor, Apache-2.0 | Transformers, vLLM, etc. |
| Otras conversiones GGUF de Gemma 4 E2B-it | no disponible | no disponible | GGUF | depende del publicador | llama.cpp, Ollama |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El formato `pocketflux.pack/1` es propietario: no es un checkpoint de Transformers ni de Diffusers y solo lo interpreta el motor WebGPU de p0pc0rn. Esto limita gravemente la portabilidad y la reproducibilidad fuera de esa aplicación.
- La cuantización mixta de 4 y 8 bits puede degradar la calidad respecto al modelo original; no se publican evaluaciones que cuantifiquen esa pérdida.
- No se documentan los idiomas soportados ni el contexto máximo; no debe asumirse un comportamiento multilingüe o de contexto largo sin verificación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la cuantización agresiva en las capas MLP.
- La licencia Apache-2.0 es la declarada por el autor para este artefacto, pero el modelo base Gemma 4 podría estar sujeto a los Gemma Terms of Use; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Sesgos conocidos: no documentados en la información disponible; los sesgos del modelo base se heredan sin mitigación adicional.
- El repositorio no registra descargas ni likes y el autor es independiente, por lo que no hay validación comunitaria del artefacto.
- El contenido del modelo y de la aplicación se enmarca en un proyecto de generación de imágenes y vídeo; verificar que los casos de uso previstos cumplen la normativa aplicable.

## Enlaces

- [Hugging Face: JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4](https://huggingface.co/JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [X oficial del proyecto: @p0pc0rnapp](https://x.com/p0pc0rnapp)
- [X del autor: @joshhughes___](https://x.com/joshhughes___)
