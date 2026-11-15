# geladons/Qwen3-4B-Thinking-2507

## Resumen

Qwen3-4B-Thinking-2507 en formato LiteRT-LM es una conversión del modelo base Qwen/Qwen3-4B-Thinking-2507 de Alibaba Qwen al formato `.litertlm` de Google, empaquetada por el usuario geladons para inferencia completamente local en dispositivos Android. El objetivo no es entrenar un modelo nuevo, sino distribuir los pesos del modelo original en un contenedor que el runtime LiteRT-LM (`com.google.ai.edge.litertlm`) puede cargar directamente en un teléfono, sin nube ni cuenta de usuario. El repositorio contiene un único fichero de 2,27 GB con cuantización mixta dinámica wi4b32 en pesos y afp32 en activaciones.

El modelo subyacente es la variante "Thinking" de la familia Qwen3, con 4 mil millones de parámetros y modo de razonamiento explícito, lo que la hace adecuada para tareas que requieren cadenas de pensamiento antes de responder. La relevancia de este bundle es práctica: permite ejecutar un LLM de 4B con capacidad de razonamiento en hardware de consumo móvil, algo que hasta hace poco requería servidores o GPUs dedicadas. Al estar bajo licencia Apache 2.0, heredada del modelo base, se puede usar comercialmente sin restricciones adicionales.

La información pública disponible sobre este repositorio concreto es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin benchmarks propios. Todo lo que se puede afirmar con rigor proviene de la model card del autor y de las características conocidas del modelo base Qwen3-4B-Thinking-2507, que se indican como tales a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen3-4B-Thinking-2507); empaquetado en formato LiteRT-LM |
| Parametros totales | 4 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para este bundle |
| Tipos de cuantizacion | Cuantizacion mixta dinamica: pesos wi4b32, activaciones afp32 |
| Idiomas soportados | no disponible (el repositorio no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM); fichero de 2,27 GB |
| Modalidad | texto a texto |
| Libreria | litert-lm |
| Tamano del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

El bundle no introduce cambios arquitectonicos respecto al modelo base: es un transformer denso de 4B parámetros de la familia Qwen3 en su variante Thinking (2507), que incorpora un modo de razonamiento explícito antes de emitir la respuesta final. La conversión a LiteRT-LM consiste en transformar los pesos originales a un grafo ejecutable por el runtime de Google AI Edge, aplicando una cuantizacion mixta dinámica: pesos en wi4b32 (4 bits con agrupamiento de 32) y activaciones en afp32. Esta combinación reduce el tamaño del fichero a 2,27 GB, lo que lo hace manejable en almacenamiento móvil, a costa de cierta pérdida de precisión frente a los pesos originales en punto flotante.

No se dispone de información sobre el proceso de entrenamiento específico de este bundle (no hubo entrenamiento adicional: es una conversión del modelo base). Los detalles de entrenamiento del modelo original —número de tokens, composición del dataset, uso de RLHF o DPO— no están incluidos en la información proporcionada y deben consultarse en la model card de Qwen/Qwen3-4B-Thinking-2507. Tampoco se documentan innovaciones de decodificación o atención específicas de esta conversión más allá de las propias del runtime LiteRT-LM.

## Capacidades

- Generación de texto en modalidad texto a texto, con modo de razonamiento ("thinking") heredado del modelo base.
- Razonamiento multi-paso: la variante Thinking está diseñada para producir cadenas de pensamiento antes de la respuesta final.
- Inferencia completamente local en dispositivo Android, sin conexión a red ni cuenta de usuario.
- Integración en aplicaciones propias mediante el SDK `com.google.ai.edge.litertlm` (clases `Engine` y `Conversation`).
- Uso sin código a través de la aplicación Local AI de Google Play, que incluye este modelo en su catálogo integrado.
- Capacidades multilingües: no disponibles en la información del repositorio; dependen del modelo base.
- Tool calling, function calling, agentes y otras capacidades avanzadas: no documentadas en la información proporcionada para este bundle.

## Casos de uso

- Asistentes offline en Android: el bundle se carga directamente con el runtime LiteRT-LM y permite conversaciones sin conexión, útil en entornos sin red o con requisitos de privacidad estrictos donde los datos no deben salir del dispositivo.
- Aplicaciones móviles con SDK propio: un desarrollador puede apuntar las clases `Engine`/`Conversation` del SDK `com.google.ai.edge.litertlm` al fichero `.litertlm` e integrar generación de texto y razonamiento en su app sin infraestructura de servidor.
- Prototipado rápido sin código: mediante la app Local AI de Google Play, que ya incluye el modelo en su catálogo, se puede evaluar el comportamiento del modelo en un teléfono antes de invertir en desarrollo.
- Tareas de razonamiento en el borde: al conservar el modo Thinking del modelo base, es adecuado para problemas que requieren descomposición en pasos (por ejemplo, explicaciones técnicas o resolución de problemas lógicos) ejecutados íntegramente en el dispositivo.
- Distribución de demos y pruebas de campo: al ser un fichero único de 2,27 GB bajo Apache 2.0, se puede incluir en builds de demostración o en dispositivos de prueba sin depender de APIs externas.
- Escenarios con requisitos de soberanía del dato: al no requerir nube ni cuenta, encaja en aplicaciones donde la política impide enviar texto del usuario a servidores de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas propias y la cuantización wi4b32/afp32 puede alterar el rendimiento respecto al modelo base; cualquier cifra de MMLU, HumanEval o GSM8K debe tomarse de la model card de Qwen/Qwen3-4B-Thinking-2507 y no de este bundle.

## Requisitos de hardware

- VRAM/RAM: el fichero pesa 2,27 GB; se necesita al menos ese espacio de almacenamiento y memoria disponible para cargarlo, más el overhead del runtime LiteRT-LM (no cuantificado en la información proporcionada).
- GPU recomendadas: no aplica en el sentido tradicional; el destino es hardware Android con aceleración del runtime LiteRT-LM (CPU/GPU/NPU del dispositivo, según soporte del runtime).
- Cabe en hardware de consumo: sí, está diseñado explícitamente para ejecutarse en teléfonos Android.
- Opciones de despliegue: runtime LiteRT-LM (`com.google.ai.edge.litertlm`), app Local AI de Google Play, y recetas de conversión hf-to-litertlm. vLLM, llama.cpp, Ollama o TGI no son compatibles con el formato `.litertlm`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geladons/Qwen3-4B-Thinking-2507 (este bundle) | 4B | no disponible | `.litertlm` | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Thinking-2507 (modelo base) | 4B | no disponible en esta ficha | safetensors (formato original) | Apache 2.0 | Hugging Face (modelo oficial) |
| geladons/local-ai-models | no disponible | no disponible | `.litertlm` (varios bundles) | no disponible | Hugging Face (repositorio agregador) |

La comparación relevante es contra el modelo base: este bundle ofrece el mismo modelo en un formato ejecutable en Android a costa de una cuantización agresiva (wi4b32/afp32), mientras que el original conserva mayor precisión pero requiere infraestructura de servidor o GPU. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- La cuantización wi4b32 en pesos y afp32 en activaciones puede degradar la calidad respecto al modelo base en punto flotante; no hay evaluaciones publicadas que cuantifiquen esa pérdida.
- El repositorio no declara idiomas soportados; el comportamiento multilingüe depende del modelo base y no está verificado para este bundle.
- Riesgo de alucinación inherente a los LLM de 4B, especialmente en el modo Thinking con cadenas de razonamiento largas; no hay datos específicos de este bundle.
- Sesgos conocidos: no documentados en la información proporcionada; deben evaluarse a partir del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del runtime LiteRT-LM por separado.
- El formato `.litertlm` solo es compatible con el runtime LiteRT-LM; no se puede cargar en vLLM, llama.cpp, Ollama ni TGI, lo que limita su portabilidad fuera de Android.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (15 de noviembre de 2026); no hay evidencia de validación por parte de la comunidad.
- El fichero es idéntico byte a byte al de geladons/local-ai-models, que se mantiene por compatibilidad; conviene comprobar cuál es la fuente canónica antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/Qwen3-4B-Thinking-2507
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio agregador: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- App Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html
