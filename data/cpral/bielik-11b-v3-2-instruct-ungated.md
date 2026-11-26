# cpral/Bielik-11B-v3.2-Instruct-ungated

## Resumen

Bielik-11B-v3.2-Instruct-ungated es una redistribución sin *gate* del modelo Bielik-11B-v3.2-Instruct, desarrollado por SpeakLeash en colaboración con el centro de supercomputación ACC Cyfronet AGH. Se trata de un modelo causal decoder-only de 11.168.796.672 parámetros (11,17 mil millones) entrenado sobre corpus multilingües que cubren 56 idiomas, con especial énfasis en polaco y lenguas europeas. La versión publicada por el usuario `cpral` elimina el formulario de acceso condicionado del repositorio original y redistribuye los pesos bajo licencia Apache 2.0.

El modelo resuelve el problema de disponer de un LLM abierto con competencia real en lenguas europeas de recursos medios y bajos (polaco, checo, croata, esloveno, estonio, letón, lituano, entre otras), un nicho tradicionalmente mal cubierto por los modelos anglocéntricos. La v3.2 amplía el preentrenamiento continuo multilingüe y refuerza el post-entrenamiento en seguimiento de instrucciones, uso de herramientas y razonamiento, incorporando un modo de pensamiento explícito controlable mediante el parámetro `reasoning_effort`.

Es relevante ahora porque combina tres elementos poco frecuentes en modelos de esta escala: licencia Apache 2.0 sin restricciones, soporte nativo de *tool calling* y razonamiento estructurado con parsers oficiales para vLLM, y una ventana de contexto de 32.768 tokens. La arquitectura sigue el linaje Llama, lo que facilita su integración en el ecosistema transformers y en infraestructuras de servicio OpenAI-compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (linaje Llama) |
| Parámetros totales | 11.168.796.672 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según configuración de servicio recomendada con `--max-model-len 32768`) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | 56 idiomas: multilingüe con foco en polaco y lenguas europeas (pl, en, es, de, fr, it, pt, nl, cs, sk, sl, hr, sr, bs, bg, ro, hu, el, et, lv, lt, fi, sv, da, no, is, tr, uk, ru, ar, hy, az, be, ca, cnr, zh, cy, eu, fo, gd, gl, he, hi, id, ga, ja, ka, ko, kk, la, lb, mk, mt, fa, vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only denso de 11,17 mil millones de parámetros, sin mezcla de expertos. El pipeline de entrenamiento consta de tres etapas: preentrenamiento sobre 500.000 millones de tokens de corpus multilingües curados y procesados por el equipo de SpeakLeash, *supervised fine-tuning* sobre 26 millones de muestras, y aprendizaje por refuerzo con una variante modificada de GRPO ejecutada sobre 14 entornos diversos. Este esquema por etapas busca mejorar la comprensión lingüística, el seguimiento de instrucciones y el rendimiento en tareas heterogéneas.

El entrenamiento se ejecutó con el framework open source ALLaMo, implementado por Krzysztof Ociepa, sobre la infraestructura HPC de ACC Cyfronet AGH (supercomputadores Athena y Helios, entorno PLGrid, Gaia AI Factory). La innovación técnica más destacable de la versión 3.2 es el formato propio de razonamiento y llamada a herramientas: el modelo emite bloques `` para el razonamiento y `<tool_call>{"name": …, "arguments": …}</tool_call>` para las invocaciones de funciones. SpeakLeash publica parsers específicos para vLLM (requiere versión 0.24 o superior, probado en 0.32) que convierten estas marcas en campos estructurados `reasoning` y `tool_calls` dentro de una API compatible con OpenAI. La plantilla de chat (`chat_template.jinja`) se distribuye con el modelo.

## Capacidades

- Generación de texto conversacional multi-turno en 56 idiomas, con calidad optimizada para polaco y lenguas europeas.
- Razonamiento explícito con modo de pensamiento controlable mediante `reasoning_effort` con cinco niveles: `none` (por defecto, respuesta directa), `low`, `medium`, `high` y `max`.
- *Tool calling* / *function calling* con formato propio parseable por vLLM, incluyendo la opción `--exclude-tools-when-tool-choice-none` para evitar que el modelo escriba llamadas a herramientas como texto plano cuando no se permiten.
- Razonamiento multi-paso y uso de agentes, gracias a la combinación de modo de pensamiento y llamadas a herramientas estructuradas.
- Seguimiento de instrucciones reforzado mediante SFT sobre 26 millones de muestras y RL con GRPO modificado en 14 entornos.
- Capacidades multilingües amplias con cobertura de lenguas de recursos bajos: albanés, macedonio, maltés, galés, gaélico escocés, feroés, euskera, gallego, latín, luxemburgués, mongol (cnr), entre otras.
- No se documentan capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Atención al cliente en mercados europeos secundarios: el modelo puede gestionar conversaciones multi-turno en polaco, checo, croata o esloveno con hasta 32.768 tokens de contexto, lo que permite arrastrar historial largo y documentación de producto sin truncar.
- Generación de código y automatización de CI/CD: el soporte de *tool calling* estructurado permite integrarlo como agente que invoca APIs de repositorio, lanzadores de tests o sistemas de tickets dentro de pipelines, con las llamadas separadas del texto libre.
- Asistentes con razonamiento auditable: el modo `reasoning_effort` permite activar cadenas de pensamiento largas solo en consultas complejas (matemáticas, planificación) y desactivarlas en consultas triviales para reducir latencia y coste.
- Procesamiento documental multilingüe: resumen, extracción y clasificación de documentos en lenguas europeas de recursos medios donde los modelos anglocéntricos degradan notablemente, aprovechando la ventana de 32K tokens para contratos o informes extensos.
- Despliegue soberano en infraestructura propia: al ser Apache 2.0 y pesos safetensors estándar, encaja en entornos con requisitos de residencia de datos (administración pública, sector sanitario europeo) sin dependencia de APIs externas.
- Investigación en lingüística computacional: banco de pruebas para evaluar transferencia entre las 56 lenguas declaradas, especialmente el grupo eslavo y báltico, con un modelo de escala media que cabe en una GPU de 80 GB.
- Chatbot de dominio con RAG: la combinación de contexto de 32K y formato de herramientas permite construir asistentes que consulten un índice vectorial mediante una función registrada y razonen sobre los resultados antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 22,3 GB solo de pesos (tamaño del repo), más caché KV; en la práctica requiere del orden de 24-28 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: del orden de 12-14 GB de pesos; en 4 bits, del orden de 6-8 GB. No se confirman cuantizaciones oficiales publicadas en la información disponible.
- GPU recomendadas para servicio en precisión completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto limitado o en cuantizaciones de 8/4 bits; en GPUs de 16 GB o menos es necesario cuantizar.
- Opciones de despliegue: vLLM 0.24 o superior (probado en 0.32) con los parsers de `speakleash/bielik-tools` para *tool calling* y razonamiento estructurados; transformers como vía base; no se documentan instrucciones específicas para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Foco lingüístico | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.2-Instruct-ungated | 11,17 B (denso) | 32.768 tokens | Apache 2.0 | 56 idiomas, foco polaco y europeo | Hugging Face, sin gate |
| Bielik-11B-v3.2-Instruct (original) | 11,17 B (denso) | 32.768 tokens | Apache 2.0 | Idéntico | Hugging Face, con gate |
| Modelos comparables de la misma escala | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación documentada con precisión en la información disponible es frente al modelo base `speakleash/Bielik-11B-v3.2-Instruct`, del que esta versión es una redistribución sin formulario de acceso; pesos, arquitectura y capacidades son idénticos. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otras familias.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo en la información disponible; un modelo entrenado con foco en corpus europeos y polacos puede heredar sesgos de esas fuentes.
- Riesgo de alucinación inherente a los LLM de esta escala; el modo de razonamiento explícito no elimina la posibilidad de cadenas de pensamiento plausibles pero incorrectas.
- El modo de pensamiento consume tokens: si `max_tokens` se agota durante el razonamiento, el campo `content` queda vacío. Es necesario dimensionar el presupuesto de generación para razonamiento más respuesta.
- El *tool calling* depende de parsers específicos de vLLM (versión 0.24 o superior); sin ellos, las llamadas aparecen como texto plano con las marcas `<tool_call>`. Los parsers antiguos por versión están congelados.
- El flag `enable_thinking` de Bielik v3.0 se ignora en esta plantilla; hay que migrar a `reasoning_effort`.
- Cobertura desigual entre los 56 idiomas declarados: el rendimiento está optimizado para polaco y lenguas europeas, y es previsiblemente inferior en lenguas de recursos muy bajos del listado.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento subyacentes, no detalladas en la información disponible.
- Esta redistribución concreta (`cpral/...`) tiene 0 descargas y 0 *likes* en el momento de la consulta; para producción conviene contrastar la integridad de los pesos con el repositorio original de SpeakLeash.

## Enlaces

- [Hugging Face: cpral/Bielik-11B-v3.2-Instruct-ungated](https://huggingface.co/cpral/Bielik-11B-v3.2-Instruct-ungated)
- [Modelo base: speakleash/Bielik-11B-v3.2-Instruct](https://huggingface.co/speakleash/Bielik-11B-v3.2-Instruct)
- [Chat oficial de Bielik](https://chat.bielik.ai/)
- [SpeakLeash](https://speakleash.org/)
- [ACC Cyfronet AGH](https://www.cyfronet.pl/en)
- [Supercomputadores de Cyfronet (Athena, Helios)](https://www.cyfronet.pl/en/supercomputers/our-supercomputers#athena)
- [PLGrid](https://plgrid.pl/)
- [Gaia AI Factory](https://gaia.plgrid.pl/)
- [EuroHPC Joint Undertaking](https://www.eurohpc-ju.europa.eu/index_en)
- [Framework ALLaMo (GitHub)](https://github.com/chrisociepa/allamo)
- [Parsers de herramientas y razonamiento para vLLM: speakleash/bielik-tools](https://github.com/speakleash/bielik-tools)
