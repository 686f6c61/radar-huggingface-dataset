# JoshHughes/p0pc0rn-assistant-drafter-gemma4-e2b

## Resumen

p0pc0rn-assistant-drafter-gemma4-e2b es un modelo borrador (drafter) de decodificación especulativa derivado de `google/gemma-4-E2B-it-assistant`, el modelo de predicción multi-token (MTP) que Google publica como acompañante de Gemma 4 E2B-it. Lo desarrolla Joshua Hughes dentro del proyecto p0pc0rn, una aplicación on-device que ejecuta generación de imagen, vídeo y audio mediante WebGPU en el teléfono. El modelo no genera respuestas finales: propone varios tokens por adelantado para que el modelo asistente (`JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4`) los verifique en una sola pasada, acelerando la latencia de respuesta.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de aceleración de inferencia (speculative decoding) aplicada a un modelo pequeño de 2B de parámetros efectivos en el entorno restringido de un dispositivo móvil. Por otro, ilustra un formato de distribución no estándar: el pack `pocketflux.pack/1`, con tensores en crudo cuantizados por grupos (capas a 8 bits, cabeza de salida a 4 bits) y verificación de integridad por chunks de 16 MiB mediante sha256 en `manifest.json`. No es un checkpoint de Transformers y solo lo lee el motor WebGPU de p0pc0rn.

El repositorio ocupa 0,1 GB (54 MB en un único shard) y se distribuye bajo licencia Apache-2.0, no bajo los Gemma Terms of Use. La información pública disponible es muy limitada: no hay pipeline declarado, no se listan idiomas soportados, no hay benchmarks publicados y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E2B-it-assistant (modelo borrador MTP para decodificación especulativa); detalles internos no disponibles |
| Parametros totales | no disponible (modelo base de 2B según nomenclatura E2B; cifra exacta no publicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Capas a 8 bits (grupos de 64); cabeza de salida a 4 bits (grupos de 32, orden cluster-major); pre-proyección lee [state \| embedding] |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `pocketflux.pack/1` (`.pfw` con tensores en crudo, `manifest.json` con offsets, shapes, encoding y sha256 por chunk); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

El modelo es una conversión y cuantización del asistente MTP `google/gemma-4-E2B-it-assistant` (commit `2d874ef7`), no un entrenamiento propio. Su función arquitectónica es la de un drafter: predice varios tokens futuros que el modelo asistente valida en una única pasada de verificación, de modo que la salida final sigue siendo decisión del asistente. La model card no detalla el número de capas, la dimensionalidad, el mecanismo de atención ni la composición del dataset de entrenamiento original; esa información correspondería a la documentación de Google sobre Gemma 4 E2B-it-assistant.

La innovación técnica documentada está en el pipeline de compresión y empaquetado, no en el entrenamiento. Las capas se cuantizan a 8 bits con grupos de 64 y la cabeza de salida a 4 bits con grupos de 32 en orden cluster-major, con una pre-proyección que consume la concatenación de estado y embedding. El resultado se serializa en el formato propietario `pocketflux.pack/1`, con verificación de integridad chunk a chunk (sha256 cada 16 MiB) durante la descarga. No se documentan fases de RLHF, DPO ni datos de ajuste adicionales por parte del autor de la conversión.

## Capacidades

- Predicción multi-token (MTP) como borrador para decodificación especulativa junto al modelo asistente Gemma 4 E2B-it.
- Aceleración de la latencia de respuesta sin alterar la distribución de salida final: cada token emitido es verificado por el asistente.
- Ejecución on-device mediante el motor WebGPU de p0pc0rn, orientada a dispositivos móviles.
- Cuantización mixta (8 bits en capas, 4 bits en cabeza) para reducir huella de memoria y ancho de banda.
- Verificación de integridad de pesos por sha256 durante la descarga.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling o capacidades multilingües: no disponibles como capacidades propias del drafter; dependen del modelo asistente con el que se empareja.

## Casos de uso

- Aceleración de respuestas en la app p0pc0rn: el drafter propone tokens que el asistente `p0pc0rn-assistant-gemma4-e2b-q4` verifica en una pasada, reduciendo el tiempo hasta el primer token y el tiempo total de generación en el dispositivo.
- Asistentes conversacionales on-device: al ejecutarse íntegramente en WebGPU sobre el teléfono, permite conversaciones sin enviar datos a servidores, siempre que se despliegue junto al asistente correspondiente.
- Despliegue en dispositivos con memoria limitada: los 54 MB del shard y la cuantización mixta 8/4 bits encajan en el presupuesto de memoria de un móvil de gama media-alta.
- Integración en pipelines de descarga con verificación criptográfica: el `manifest.json` con sha256 por chunk de 16 MiB sirve como referencia para validar artefactos en sistemas de distribución propios.
- Investigación sobre decodificación especulativa en entornos WebGPU: el pack permite estudiar el comportamiento de un drafter MTP cuantizado en hardware móvil.
- Prototipado de aplicaciones multimedia locales: dentro del ecosistema p0pc0rn, el drafter acompaña a la generación de imágenes, vídeos cortos y audio que la app ya realiza en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de aceptación del drafter (acceptance rate), speedup de decodificación, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible con precisión; el artefacto distribuido ocupa 54 MB, por lo que la huella en memoria del drafter es reducida, pero el consumo total depende del modelo asistente emparejado.
- GPU recomendadas: no disponibles. El destino declarado es WebGPU en dispositivos móviles; no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: el diseño apunta a GPUs integradas de teléfonos con soporte WebGPU; no hay lista de dispositivos validados.
- Opciones de despliegue: exclusivamente el motor WebGPU de p0pc0rn. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `pocketflux.pack/1` no es un checkpoint de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-assistant-drafter-gemma4-e2b | no disponible (base E2B) | no disponible | pocketflux.pack/1 | Apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-E2B-it-assistant | no disponible (E2B) | no disponible | no disponible | Apache-2.0 (según la model card de esta conversión) | Repositorio de Google |
| JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4 | no disponible | no disponible | pocketflux.pack/1 | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes ni de otros drafters MTP públicos con los que contrastar métricas.

## Limitaciones y advertencias

- El modelo no es utilizable de forma autónoma: solo funciona como drafter emparejado con el asistente Gemma 4 E2B-it dentro del motor WebGPU de p0pc0rn.
- El formato `pocketflux.pack/1` es propietario y no está soportado por las herramientas estándar del ecosistema (Transformers, vLLM, llama.cpp, Ollama, TGI).
- No hay información publicada sobre sesgos, tasas de alucinación ni comportamiento en dominios concretos.
- No se listan idiomas soportados; la cobertura lingüística heredada del modelo base no está documentada en esta ficha.
- La licencia Apache-2.0 se aplica a esta conversión según el autor, que indica explícitamente que no son los Gemma Terms of Use; conviene verificar la procedencia y las condiciones del modelo base antes de un uso comercial.
- El repositorio registra cero descargas y cero likes, y no incluye benchmarks: no hay evidencia pública de calidad o estabilidad en producción.
- La verificación de integridad depende de `manifest.json`; una descarga parcial o un manifiesto alterado invalidaría los pesos sin aviso adicional.
- No se documentan requisitos mínimos de hardware ni versiones de WebGPU compatibles, lo que dificulta planificar despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoshHughes/p0pc0rn-assistant-drafter-gemma4-e2b
- Modelo asistente emparejado: https://huggingface.co/JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-assistant
- X oficial del proyecto: https://x.com/p0pc0rnapp
- X del autor: https://x.com/joshhughes___
