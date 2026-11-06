# sdd5/textdungeon-gemma-4-E2B-it-litert-lm

## Resumen

Text Dungeon Gemma 4 E2B (LiteRT-LM) es una redistribución del modelo `litert-community/gemma-4-E2B-it-litert-lm`, publicada por el usuario `sdd5` bajo el identificador `sdd5/textdungeon-gemma-4-E2B-it-litert-lm`. Según la propia model card, se trata de una copia sin modificaciones del fichero `gemma-4-E2B-it.litertlm` correspondiente al commit `1caa527` del repositorio original de la comunidad LiteRT, con un SHA-256 documentado (`181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c`). No hay, por tanto, ningún ajuste fino ni destilación específica para el caso de uso "Text Dungeon" que sugiere el nombre del repositorio.

El modelo subyacente es `google/gemma-4-E2B-it`, una variante instruction-tuned de la familia Gemma 4 de Google con arquitectura y parámetros no detallados en la información disponible. El sufijo "E2B" sugiere una variante eficiente orientada a despliegue en dispositivo, pero los detalles exactos de arquitectura, número de parámetros y longitud de contexto no se especifican en la model card proporcionada.

La relevancia de este repositorio es limitada: se trata de un espejo de un artefacto ya publicado, empaquetado en formato LiteRT-LM (el runtime de Google para inferencia en dispositivo) y con licencia Apache-2.0 declarada. Resulta útil únicamente como fuente alternativa de descarga del binario `.litertlm` para aplicaciones que usen el runtime LiteRT-LM, no como un modelo nuevo o especializado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (artefacto precompilado en formato LiteRT-LM) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Tamaño del repositorio | 2,6 GB |
| Modelo base | google/gemma-4-E2B-it (relación: quantized) |
| Runtime | litert-lm |
| SHA-256 del artefacto | 181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) del modelo base `google/gemma-4-E2B-it`. La model card de este repositorio no incluye detalles técnicos del modelo original; únicamente documenta que el fichero `.litertlm` es una copia sin modificaciones del artefacto publicado por `litert-community`.

El único dato técnico relevante aportado por el autor es el proceso de empaquetado: conversión del modelo base al formato LiteRT-LM, que es el formato de despliegue de Google basado en TensorFlow Lite / LiteRT para inferencia en dispositivo (móvil, edge y aceleradores locales). No se documenta qué esquema de cuantización se ha aplicado, aunque el tamaño del repositorio (2,6 GB) es coherente con un artefacto cuantizado de un modelo de tamaño pequeño-medio.

## Capacidades

- Generación de texto conversacional en modo instruction-tuned, heredadas del modelo base `google/gemma-4-E2B-it`.
- Ejecución en dispositivo mediante el runtime LiteRT-LM (sin necesidad de GPU de servidor).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Cualquier capacidad específica del caso de uso "Text Dungeon": no documentada; el nombre del repositorio no implica ajuste fino ni especialización.

## Casos de uso

- Inferencia en dispositivo móvil o edge: el artefacto `.litertlm` está pensado para cargarse con el runtime LiteRT-LM en Android, iOS o sistemas embebidos, permitiendo generación de texto sin conexión a un servidor.
- Prototipado de asistentes conversacionales offline: útil para aplicaciones que requieren privacidad total y no pueden enviar datos a la nube, al ejecutarse localmente.
- Integración en aplicaciones de escritorio o utilidades CLI que ya usan LiteRT-LM: el fichero puede sustituir directamente al original de `litert-community` sin cambios en el código, dado que es una copia idéntica.
- Verificación de integridad de artefactos: el SHA-256 documentado permite auditar que el binario descargado coincide con el publicado por la comunidad LiteRT.
- Base para experimentos de cuantización o empaquetado: sirve como punto de partida para quien quiera probar variantes de conversión a LiteRT-LM partiendo de un artefacto de referencia.
- Distribución espejo en entornos con restricciones de acceso: si el repositorio original de `litert-community` no es accesible desde una red concreta, este espejo permite obtener el mismo binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un artefacto LiteRT-LM, está orientado a ejecución en CPU, GPU integrada o NPU de dispositivos, no a GPU de servidor.
- GPU recomendadas: no aplica para el runtime LiteRT-LM; el despliegue típico es en SoC móviles o equipos edge.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada; LiteRT-LM no es el runtime habitual para estas GPU.
- Opciones de despliegue: runtime LiteRT-LM (Google). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Tamaño en disco: 2,6 GB (tamaño del repositorio).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdd5/textdungeon-gemma-4-E2B-it-litert-lm | no disponible | no disponible | LiteRT-LM | Apache-2.0 | Hugging Face (espejo) |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible | no disponible | LiteRT-LM | Apache-2.0 (según este repo) | Hugging Face (original) |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (presumiblemente) | no disponible en esta ficha | Hugging Face |

La comparativa se limita a la relación de linaje entre los tres artefactos; no se dispone de datos de rendimiento, contexto ni parámetros para establecer una comparación técnica con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no aporta ninguna mejora ni especialización respecto al original: es una copia byte a byte del artefacto de `litert-community`, por lo que hereda todas las limitaciones del modelo base.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información proporcionada.
- La licencia declarada es Apache-2.0, pero el modelo base es de Google y la model card incluye un aviso de que "Gemma es una marca de Google LLC y este repositorio no está afiliado a Google"; conviene verificar los términos de uso de Gemma antes de un despliegue comercial.
- El formato LiteRT-LM restringe el despliegue a los runtimes compatibles; no es directamente utilizable con vLLM, llama.cpp, Ollama ni TGI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto; se recomienda verificar el SHA-256 antes de usarlo.
- El nombre "Text Dungeon" no implica que el modelo haya sido entrenado o ajustado para juegos de texto; es solo una etiqueta del publicador.
- No hay información sobre el esquema de cuantización aplicado, lo que dificulta estimar la pérdida de calidad respecto al modelo original en precisión completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sdd5/textdungeon-gemma-4-E2B-it-litert-lm
- Repositorio original del artefacto: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
