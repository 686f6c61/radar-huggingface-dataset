# bellmin1217/gemma-4-E2B-it-litert-lm

## Resumen

`bellmin1217/gemma-4-E2B-it-litert-lm` es un espejo (mirror) fijado del archivo `gemma-4-E2B-it.litertlm` publicado originalmente por el colectivo `litert-community` en Hugging Face. No se trata de un modelo nuevo ni de un ajuste fino: es una copia byte a byte del artefacto original, mantenida por un tercero para que una aplicación on-device pueda descargar una versión inmutable del modelo. El SHA-256 del archivo (`181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c`) coincide con el del repositorio fuente, lo que permite verificar la integridad de la descarga.

El modelo subyacente es `google/gemma-4-E2B-it`, un modelo de lenguaje de Google de la familia Gemma 4 en su variante "E2B" (effective 2B, aproximadamente 2 mil millones de parámetros efectivos) ya instruido (it). El formato `.litertlm` corresponde a LiteRT-LM, el runtime de Google para ejecutar modelos de lenguaje en dispositivos (móviles, edge, embedded) con aceleración por GPU/NPU mediante LiteRT (anteriormente TensorFlow Lite). El archivo ocupa 2.588.147.712 bytes (unos 2,6 GB), lo que sugiere pesos cuantizados para despliegue on-device.

Su relevancia es operativa más que algorítmica: sirve como dependencia versionada y reproducible para aplicaciones que necesitan un binario estable del modelo sin depender de que el repositorio fuente cambie o se mueva. Para cualquier detalle técnico, de entrenamiento o de evaluación, la propia model card remite al repositorio original y a la model card de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it; familia Gemma 4) |
| Parametros totales | no disponible (la nomenclatura "E2B" sugiere ~2B efectivos; cifra exacta no confirmada en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto `.litertlm` de 2,6 GB implica pesos cuantizados, pero el esquema exacto no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 2.588.147.712 bytes, SHA-256 `181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) del modelo subyacente `google/gemma-4-E2B-it`. La model card de este repositorio es exclusivamente un aviso de espejo y delega todos esos detalles al repositorio fuente y a la model card oficial de Google.

El unico dato tecnico propio de este repositorio es el empaquetado: el modelo se distribuye en formato LiteRT-LM, el runtime de Google para inferencia on-device. Este formato esta pensado para ejecutarse en dispositivos moviles y sistemas embebidos con aceleracion por GPU/NPU a traves de LiteRT. El tamano del artefacto (2,6 GB) es coherente con pesos cuantizados de un modelo de ~2B parametros, pero no se especifica el esquema de cuantizacion.

## Capacidades

- No se detallan capacidades especificas en la informacion disponible de este repositorio.
- Por herencia del modelo base (`google/gemma-4-E2B-it`), cabe esperar generacion de texto e instrucciones, pero no se confirma en la fuente consultada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Ejecucion on-device mediante el runtime LiteRT-LM: confirmado por el formato del artefacto.

## Casos de uso

- Distribucion reproducible en aplicaciones moviles: una app Android/iOS puede fijar este repositorio y descargar el archivo `.litertlm` verificando el SHA-256, garantizando que todos los usuarios reciben exactamente el mismo binario independientemente de cambios en el repositorio fuente.
- Inferencia on-device sin conexion: el formato LiteRT-LM permite ejecutar el modelo localmente en el dispositivo, lo que habilita funciones de texto sin enviar datos a la nube.
- Prototipado de asistentes embebidos: util para validar flujos de asistente conversacional en hardware de gama media antes de comprometerse con un modelo mayor.
- Pipelines de CI/CD con dependencias fijadas: al ser un mirror inmutable con hash publicado, encaja en sistemas de build que requieren artefactos versionados y verificables.
- Evaluacion comparativa de runtimes: sirve como referencia estable para medir latencia y consumo del runtime LiteRT-LM frente a otras opciones (llama.cpp, MLC, etc.) sobre el mismo modelo.
- Educacion y auditoria: al ser una copia byte a byte con hash, facilita la inspeccion y verificacion del artefacto sin depender de la disponibilidad del repositorio original.
- Aplicaciones de privacidad estricta: procesamiento de texto local en escenarios donde la normativa impide el envio de datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al repositorio fuente y a la model card de `google/gemma-4-E2B-it` para consultar benchmarks, uso y limitaciones.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto pesa 2,6 GB, por lo que se requiere al menos ese espacio de almacenamiento y una cantidad de memoria de trabajo comparable o superior para cargarlo (cifra exacta de RAM/VRAM no disponible).
- GPU recomendadas: no disponible. El runtime LiteRT-LM esta orientado a aceleracion on-device (GPU/NPU movil), no a GPUs de datacenter.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: LiteRT-LM (runtime nativo del formato). Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no soportan el formato `.litertlm` de forma nativa segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `bellmin1217/gemma-4-E2B-it-litert-lm` (este) | no disponible (~2B efectivos por nomenclatura) | no disponible | `.litertlm` | Apache 2.0 | Mirror fijado de un artefacto on-device |
| `litert-community/gemma-4-E2B-it-litert-lm` | idem | idem | `.litertlm` | Apache 2.0 | Fuente original del artefacto |
| `google/gemma-4-E2B-it` | idem | idem | no disponible | Apache 2.0 | Modelo base oficial de Google |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una copia de un unico archivo. Cualquier correccion, actualizacion o parche de seguridad debe buscarse en el repositorio fuente `litert-community/gemma-4-E2B-it-litert-lm`.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma en esta model card; deben consultarse en la model card oficial de `google/gemma-4-E2B-it`.
- El formato `.litertlm` limita el despliegue a entornos compatibles con el runtime LiteRT-LM; no es directamente utilizable en stacks de servidor habituales (vLLM, TGI, llama.cpp).
- Aunque la licencia declarada es Apache 2.0, conviene verificar los terminos de uso de Gemma 4 publicados por Google en la model card original antes de un despliegue comercial, ya que la familia Gemma ha tenido historicamente condiciones de uso especificas.
- El repositorio no tiene descargas ni likes y fue creado en 2026-11-20; su mantenimiento por parte del autor no esta garantizado, lo que refuerza la recomendacion de usar el repositorio fuente como referencia principal.
- El rendimiento real del modelo en un dispositivo concreto depende del soporte de LiteRT para la GPU/NPU de ese hardware; no se aportan cifras de latencia ni de consumo energetico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bellmin1217/gemma-4-E2B-it-litert-lm
- Repositorio fuente (litert-community): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Commit fuente concreto: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/tree/2d74ac41a33d7da82f39f7d5720a04c68514a103
- Modelo base oficial: https://huggingface.co/google/gemma-4-E2B-it
