# Hcompany/Holotron4-30B-A3B

## Resumen

Holotron4-30B-A3B es un modelo de vision-lenguaje (VLM) especializado en Computer Use, desarrollado por H Company sobre la base NVIDIA Nemotron 3 Nano Omni (NemotronH Nano Omni). Su funcion es actuar como cerebro de agentes que operan software real: recibe capturas de pantalla y resultados de herramientas, y devuelve acciones concretas (clics, escritura, ejecucion de codigo, llamadas a funciones) que un harness externo se encarga de ejecutar. Es la variante "Nano" de la familia Holo4, junto a Holo4-27B (denso) y Holo4-35B-A3B (MoE).

El checkpoint publicado es BF16 en safetensors, con 33.015.598.915 parametros totales segun los tensores del repositorio (≈33,0 B, aunque el nombre comercial indique 30B) y una longitud de contexto declarada de 262.144 tokens. El sufijo A3B indica una arquitectura de mezcla de expertos con aproximadamente 3B parametros activos por token, lo que reduce el coste de inferencia respecto a un denso del mismo tamano total.

Su relevancia esta en el salto de rendimiento documentado frente a su modelo base en tareas de automatizacion de interfaces: pasa de 21,0 a 76,3 en OSWorld (GUI) y de 0,2 a 7,9 en OSWorld 2.0 (GUI y codigo). Se distribuye bajo la NVIDIA Open Model Agreement y esta pensado para usarse con el harness hai-agents, ademas de estar disponible via la H Models API y endpoints de terceros como FriendliAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH Nano Omni (MoE, base NVIDIA Nemotron 3 Nano Omni 30B-A3B Reasoning) |
| Parametros totales | 33.015.598.915 (≈33,0 B) segun safetensors del repositorio |
| Parametros activos | ≈3 B por token, inferido del sufijo A3B; cifra exacta no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (repositorio principal) y FP8 (repositorio Holotron4-30B-A3B-FP8). No hay GGUF publicado para esta variante |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (campo `license: other`) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 66,1 GB |
| Pipeline | image-text-to-text |
| Modalidad | multimodal (imagen + texto) |
| Descargas / likes | 122 / 12 |
| Fechas | creado el 24-09-2026, actualizado el 28-09-2026 |

## Arquitectura y entrenamiento

La arquitectura es NemotronH Nano Omni, la variante omni de la familia NemotronH de NVIDIA aplicada a un modelo de 30B con mezcla de expertos (A3B, aproximadamente 3B parametros activos). Se trata de un modelo multimodal de tipo image-text-to-text: procesa capturas de pantalla junto con texto e historial de herramientas, y genera tanto texto como acciones estructuradas. El repositorio requiere `custom_code`, por lo que la integracion con `transformers` depende de codigo especifico del autor.

El modelo parte del checkpoint NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 y ha sido adaptado por H Company para flujos de Computer Use. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al entrenamiento. El uso previsto es con el harness hai-agents, que envia capturas y resultados de herramientas al modelo, ejecuta las acciones solicitadas y devuelve los resultados, pudiendo ademas conceder al modelo acceso a herramientas de aplicacion y a ejecucion de codigo.

## Capacidades

- Comprension de capturas de pantalla y de interfaces graficas (GUI) para decidir la siguiente accion.
- Generacion de acciones de control: clics, escritura y otras interacciones sobre la interfaz.
- Ejecucion y peticion de codigo dentro de sandboxes habilitados por el harness.
- Function calling / tool calling, con documentacion especifica del proveedor.
- Localizacion de elementos de interfaz (element localization).
- OCR de documentos (document OCR).
- Operacion multi-paso como agente: planificacion, ejecucion de acciones y reinterpretacion de resultados en iteraciones sucesivas.
- Integracion con MCP, APIs y herramientas externas, segun la documentacion del modelo.
- Modo de razonamiento heredado del checkpoint base (Reasoning) y generacion conversacional multi-turno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de escritorio de principio a fin: el agente recibe capturas sucesivas del escritorio y emite clics y pulsaciones hasta completar el flujo, con un rendimiento declarado de 76,3 en OSWorld, lo que lo hace adecuado para procesos ofimaticos repetitivos.
- RPA sobre aplicaciones sin API: cuando el software heredado solo expone una interfaz grafica, el modelo puede operarlo mediante vision en lugar de integraciones fragiles.
- Soporte tecnico asistido por captura de pantalla: el usuario adjunta una imagen de su pantalla y el modelo identifica el estado de la aplicacion, localiza el elemento relevante y propone o ejecuta la accion correctiva.
- Extraccion de datos de documentos: mediante OCR, procesar facturas, formularios o justificantes escaneados y devolver campos estructurados para su volcado en un sistema de gestion.
- Agente de codigo con sandbox: generar scripts, ejecutarlos en un entorno controlado y corregir a partir de la salida obtenida, util para tareas de automatizacion interna y analisis de datos.
- Orquestacion de herramientas empresariales via MCP y APIs: encadenar varias llamadas a funciones en un mismo flujo (por ejemplo, consultar un CRM, generar un informe y enviarlo) manteniendo el contexto a lo largo de la sesion.
- Pruebas end-to-end de interfaces: usar el modelo como usuario sintetico que navega la aplicacion, valida que los elementos aparecen donde se espera y detecta regresiones visuales o funcionales.
- Anotacion y control de calidad de datos de interfaz: aprovechar la localizacion de elementos para etiquetar pantallazos con coordenadas y roles de componente.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las ganancias se expresan en puntos porcentuales absolutos frente al modelo base (Nemotron 3 Nano Omni).

| Benchmark | Interfaz | Nemotron 3 Nano Omni | Holotron4-30B-A3B | Ganancia |
|---|---|---|---|---|
| OSWorld | GUI | 21,0 | 76,3 | +55,3 |
| OSWorld 2.0 | GUI y codigo | 0,2 | 7,9 | no disponible (valor truncado en la informacion extraida) |

La tabla de rendimiento de la model card incluye filas adicionales que no estan completas en la informacion disponible. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento general o generacion de codigo.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 66 GB solo para el checkpoint (tamano del repositorio: 66,1 GB); habria que sumar la cache KV del contexto, que a 262.144 tokens es significativa.
- Pesos en FP8: aproximadamente la mitad, en torno a 33 GB, usando el repositorio Holotron4-30B-A3B-FP8.
- GPU recomendadas para BF16: H100 80 GB o A100 80 GB en una sola tarjeta; en configuraciones multi-GPU, por ejemplo 2x A100 40 GB o 2x H100 con tensor parallelism.
- GPU recomendadas para FP8: tarjetas de 48 GB o mas (L40S, RTX 6000 Ada) pueden alojar los pesos, aunque el margen para contexto largo es reducido; A100/H100 de 80 GB dan holgura.
- GPU de consumo: los pesos publicados (BF16 y FP8) no caben en una RTX 4090 de 24 GB ni en tarjetas consumer similares. No hay cuantizaciones GGUF o de 4 bits publicadas para esta variante.
- Opciones de despliegue: `transformers` con `custom_code` (via oficial del repositorio), harness hai-agents, H Models API y endpoint gestionado de FriendliAI. El soporte de vLLM, llama.cpp, Ollama o TGI no esta confirmado en la documentacion disponible.
- Latencia y throughput: no disponibles. El caracter MoE con aproximadamente 3B parametros activos reduce el coste de computo por token frente a un denso equivalente, pero el requisito de memoria viene marcado por los parametros totales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holotron4-30B-A3B | NemotronH Nano Omni (MoE) | 33,0 B totales / ≈3 B activos | 262.144 tokens | nvidia-open-model-agreement | BF16 y FP8 en HuggingFace |
| Holo4-27B | Qwen3.8 densa | 27 B densos | no disponible | no disponible | BF16, FP8, NVFP4 y GGUF |
| Holo4-35B-A3B | Qwen3.6 MoE | 35 B totales / ≈3 B activos | no disponible | no disponible | BF16, FP8, NVFP4 y GGUF |
| Nemotron 3 Nano Omni 30B-A3B Reasoning | NemotronH Nano Omni (MoE) | 30 B (nominal) | no disponible | NVIDIA Open Model Agreement | BF16 en HuggingFace |

Los tres modelos Holo4 comparten el enfoque de Computer Use, pero solo Holotron4-30B-A3B esta construido sobre la base omni de NVIDIA; Holo4-27B y Holo4-35B-A3B parten de arquitecturas Qwen. No hay datos publicos en la informacion disponible que permitan comparar Holo4-27B y Holo4-35B-A3B con Holotron4-30B-A3B en OSWorld u otros benchmarks.

## Limitaciones y advertencias

- Licencia NVIDIA Open Model Agreement: es necesario revisar los terminos antes de un uso comercial, ya que el campo de HuggingFace figura como `license: other` y no como una licencia permisiva estandar.
- Riesgo de alucinacion en acciones: al tratarse de un agente que genera clics y coordenadas, una prediccion incorrecta puede provocar operaciones destructivas sobre el sistema. Se recomienda sandboxing, confirmacion humana en acciones criticas y limites de permisos.
- Idiomas soportados no documentados: la model card no especifica cobertura multilingue, por lo que el rendimiento fuera del ingles (o de los idiomas del checkpoint base) no esta garantizado.
- Rendimiento en OSWorld 2.0 bajo en terminos absolutos: 7,9 puntos indica que las tareas que combinan GUI y codigo siguen siendo un punto debil, pese a la mejora frente al modelo base.
- Dependencia del harness: las capacidades descritas se materializan con hai-agents; fuera de ese entorno, la ejecucion de acciones requiere implementacion propia.
- Requisitos de memoria elevados: 66,1 GB de pesos en BF16 limitan el despliegue a hardware de datacenter o GPU profesionales; no hay cuantizaciones ligeras publicadas.
- Coste de contexto largo: una ventana de 262.144 tokens implica una cache KV considerable, especialmente en escenarios de agente con muchas capturas acumuladas.
- Trazabilidad de datos de entrenamiento no disponible: no se documentan composicion del dataset ni fases de alineamiento, lo que dificulta evaluar sesgos.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad en la informacion disponible.
- Las fechas de publicacion y actualizacion del repositorio (septiembre de 2026) corresponden a los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace (BF16): https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Variante FP8: https://huggingface.co/Hcompany/Holotron4-30B-A3B-FP8
- Modelo base NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Blog de Holo4 en HuggingFace: https://huggingface.co/blog/Hcompany/holo4
- Anuncio en la web de H Company: https://hcompany.ai/newsroom/holo4
- Harness hai-agents (GitHub): https://github.com/hcompai/hai-agents-python
- H Models API: https://hub.hcompany.ai/models-api/introduction
- Trayectorias de agentes: https://trajectories.hcompany.ai/
- Documentacion de function calling: https://hub.hcompany.ai/models-api/build-an-agent/function-calling
- Documentacion de element localization: https://hub.hcompany.ai/models-api/element-localization
- Documentacion de document OCR: https://hub.hcompany.ai/models-api/document-ocr
- Endpoint en FriendliAI: https://friendli.ai/models/Hcompany/Holotron4-30B-A3B
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Cobertura externa sobre los pesos abiertos de Holo4: https://ccleaks.com/news/holo4-open-weights-sep-2026
- Web de H Company: https://hcompany.ai/
