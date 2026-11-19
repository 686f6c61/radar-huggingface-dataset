# mrfakename/voice-isolator-wgsl

## Resumen

Voice Isolator v1 (offline) for WebGPU es un reempaquetado del checkpoint `inworld/voice-isolator` (64 millones de parámetros) realizado por el desarrollador mrfakename para ejecutarse en un motor WebGPU escrito a mano. No se trata de un modelo nuevo ni de un fine-tuning en el sentido tradicional: el autor conserva los pesos del modelo original de Inworld y los redistribuye en un formato binario propio (`voice_isolator_offline.f16.bin` más un JSON de configuración) que un motor JavaScript (`engine.js`) puede leer directamente en el navegador.

El modelo resuelve la mejora y separación de voz en audio: dado un clip con ruido de fondo, devuelve una señal con la voz aislada. La relevancia de este repositorio no está en el modelo en sí, sino en el formato: permite inferencia de un modelo de speech enhancement íntegramente en el cliente, sin servidor ni backend Python, gracias a WebGPU. El repositorio ocupa 0,1 GB y se publicó en noviembre de 2026.

La información disponible es escasa: la model card se limita a describir el empaquetado y no documenta datos de entrenamiento, benchmarks ni idiomas. Todo lo que sigue se basa en esa model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint contiene parámetros tipo Mamba, según la model card) |
| Parámetros totales | 64 millones (heredados de `inworld/voice-isolator`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 para matrices (almacenamiento) y fp32 para normas, sesgos y parámetros Mamba; el motor calcula en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | binario propio (`.bin` con tensores alineados a 256 bytes) más configuración JSON (`.json`) |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | inworld/voice-isolator |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura completa del modelo original más allá de los indicios que aparecen en la model card: menciona explícitamente "parámetros Mamba" almacenados en fp32, lo que sugiere que el modelo base incorpora capas de espacio de estados (SSM) junto con componentes de encoder. El checkpoint incluye un encoder con un sesgo en el que se ha plegado el *band embedding*, y una matriz `A` almacenada como `-exp(A_log)`, convención típica de los modelos Mamba. No se detalla si la arquitectura es híbrida transformer-SSM ni su configuración de capas.

Tampoco hay datos sobre el entrenamiento: no se indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Lo único verificable es el proceso de conversión: las matrices se guardan en fp16 con layout `[in, out]`, los tensores pequeños (normas, sesgos, parámetros Mamba) en fp32, y todos los tensores están alineados a 256 bytes para el motor WebGPU. La innovación técnica destacable es el propio motor: mantiene toda la aritmética en fp32 usando fp16 solo como formato de almacenamiento, y según el autor la corrección respecto al modelo PyTorch alcanza 70–80 dB de SNR con estos pesos y supera los 100 dB con pesos fp32.

## Capacidades

- Mejora de voz (*speech enhancement*): aislamiento de la voz frente a ruido de fondo en clips de audio.
- Inferencia en el navegador mediante WebGPU, sin backend de servidor.
- Ejecución offline una vez cargados los pesos, según el título del repositorio.
- Procesamiento de audio alineado con el modelo original `inworld/voice-isolator` (misma funcionalidad, distinto formato).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo; es un modelo exclusivamente de audio.

## Casos de uso

- Limpieza de grabaciones de voz en el navegador: un editor web puede cargar los pesos y aplicar reducción de ruido a un clip sin enviar el audio a un servidor, lo que es adecuado por privacidad y por coste cero de backend.
- Herramientas de accesibilidad para transcripción: preprocesar audio de micrófono en el cliente antes de enviarlo a un servicio de ASR, mejorando la calidad de entrada sin infraestructura adicional.
- Aplicaciones de notas de voz: integrar el motor en una web app que graba y limpia audio localmente, aprovechando que el formato está pensado para leerse desde JavaScript (`engine.js`).
- Demos y prototipos de speech enhancement: el Space `voice-isolator-webgpu` sirve como referencia para validar la calidad del modelo antes de invertir en despliegue nativo.
- Procesamiento por lotes en el cliente: un usuario puede limpiar varios clips en una sesión de navegador sin depender de cuotas de API, dado el reducido tamaño del modelo (64M parámetros, repo de 0,1 GB).
- Investigación sobre inferencia WebGPU: el repositorio es útil como caso de estudio de conversión de pesos PyTorch a un formato binario alineado y de ejecución de operaciones SSM en GPU vía WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada por el autor es la fidelidad de la conversión respecto al modelo PyTorch: aproximadamente 70–80 dB de SNR con pesos fp16 y más de 100 dB con pesos fp32. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 64M parámetros, los pesos en fp16 ocupan del orden de 128 MB, aunque el motor opera en fp32 y puede requerir más memoria de trabajo.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (no se especifican modelos concretos en la información disponible).
- Cabe en GPU de consumo: sí, previsiblemente, dado el reducido tamaño del modelo, aunque no hay confirmación oficial de modelos concretos.
- Opciones de despliegue: motor WebGPU propio (`engine.js`) del Space `voice-isolator-webgpu`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Ejecución en navegador | Notas |
|---|---|---|---|---|---|
| mrfakename/voice-isolator-wgsl | 64M | binario propio + JSON | Apache-2.0 | Sí (WebGPU) | Reempaquetado del checkpoint de Inworld |
| inworld/voice-isolator | 64M | pesos PyTorch | Apache-2.0 (según el modelo base) | No documentado | Modelo original del que deriva |
| Alternativas de speech enhancement | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas; al ser un modelo de audio, el riesgo principal es la distorsión o eliminación de voz en condiciones adversas, no verificable con los datos disponibles.
- No hay información sobre el rendimiento en idiomas distintos del inglés ni sobre la cobertura lingüística del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint original de Inworld antes de redistribuir derivados.
- El formato de pesos es propietario del motor: no es compatible con PyTorch, ONNX, GGUF ni otras herramientas estándar; solo funciona con el `engine.js` del Space asociado.
- La fidelidad de la conversión depende del motor: el autor reporta 70–80 dB de SNR en fp16, lo que implica una pequeña desviación respecto al modelo original que puede ser relevante en aplicaciones de mastering o forense.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni mantenimiento demostrado.
- No se especifican requisitos de WebGPU ni navegadores compatibles; la disponibilidad de WebGPU varía entre plataformas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrfakename/voice-isolator-wgsl
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Space de demostración: https://huggingface.co/spaces/mrfakename/voice-isolator-webgpu
