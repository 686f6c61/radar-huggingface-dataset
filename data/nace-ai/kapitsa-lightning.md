# nace-ai/kapitsa-lightning

## Resumen

Kapitsa Lightning es un artefacto de despliegue publicado por nace-ai que empaqueta los pesos del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B en cuantizacion NVFP4 (22,9 GB) para su ejecucion local en Apple Silicon mediante el motor de inferencia Kapitsa. No se trata de un modelo entrenado desde cero, sino de una distribucion optimizada del modelo base de NVIDIA, orientada a obtener respuestas rapidas en equipos Mac con 32 GB de memoria unificada o superior.

El modelo subyacente emplea una arquitectura hibrida Mamba-2 con mezcla de expertos (MoE): 30 000 millones de parametros totales con solo 3000 millones activos por token, lo que reduce drasticamente el coste computacional por paso de decodificacion. La cuantizacion NVFP4 (formato de coma flotante de 4 bits de NVIDIA) permite mantener los pesos en 22,9 GB, un tamano manejable para la memoria unificada de los chips de la serie M de Apple.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar modelos MoE de 30B en hardware de consumo Apple con velocidades de decodificacion de hasta 287 tokens por segundo, gracias a la combinacion de activaciones dispersas y un motor de inferencia especializado. El repositorio de Hugging Face no incluye pesos propios: redirige al modelo base de NVIDIA y documenta unicamente el procedimiento de servicio mediante el comando `kapitsa serve --model lightning`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 con mezcla de expertos (MoE) |
| Parametros totales | 30B |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); pesos distribuidos en 22,9 GB |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | NVFP4 (pesos alojados en el repositorio del modelo base de NVIDIA) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es hibrida: combina capas Mamba-2 (modelo de espacio de estados con decodificacion lineal en la longitud de secuencia) con capas de mezcla de expertos. Con 30B parametros totales y 3B activos por token, el coste de inferencia se aproxima al de un modelo denso de 3B en terminos de FLOPs por token, mientras que la capacidad representacional corresponde a un modelo de 30B. Esta dispersion es la que permite alcanzar velocidades de decodificacion de tres cifras en hardware Apple.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El artefacto Kapitsa Lightning no documenta proceso de entrenamiento alguno: su aportacion se limita al empaquetado en NVFP4 y a la integracion con el motor Kapitsa, que expone APIs compatibles con OpenAI y Anthropic para su uso con agentes de codigo como opencode, Claude Code, Codex o pi.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Nemotron 3.5 Lightning.
- Ejecucion local en Apple Silicon con memoria unificada, sin dependencia de servicios en la nube.
- Integracion con agentes de codigo: el motor Kapitsa arranca opencode, Claude Code, Codex o pi sobre el modelo local.
- Servicio mediante APIs compatibles con OpenAI y Anthropic, lo que facilita la sustitucion de backends remotos por inferencia local.
- Decodificacion de alta velocidad gracias a la combinacion de MoE con 3B activos y cuantizacion NVFP4.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codificacion en local: el modelo se sirve a traves de Kapitsa y se conecta a Claude Code u opencode, de modo que el desarrollador obtiene autocompletado y generacion de codigo sin enviar el codigo fuente a un proveedor externo.
- Agentes de refactorizacion sobre repositorios privados: al ejecutarse integramente en el Mac, el modelo puede operar sobre codigo sujeto a confidencialidad, con la API de Anthropic como interfaz compatible para herramientas de agente existentes.
- Prototipado rapido de aplicaciones LLM: la API compatible con OpenAI permite apuntar SDKs convencionales a `localhost` y validar flujos de generacion antes de migrar a un backend en produccion.
- Desarrollo en entornos sin conectividad: en escenarios de trabajo offline o con red restringida, el modelo local sustituye a las APIs remotas manteniendo un flujo de trabajo basado en agentes.
- Evaluacion de modelos MoE en hardware de consumo: investigadores pueden medir el comportamiento de un MoE de 30B con 3B activos en chips M3/M4/M5 sin adquirir GPU de datacenter.
- Generacion de documentacion y texto tecnico asistida: con velocidades de decodificacion de 75 a 287 tok/s segun el chip, resulta viable la generacion interactiva de documentos largos en el propio portatil.
- Automatizacion de tareas de shell y scripting: el motor esta disenado para lanzar agentes de terminal, lo que permite delegar tareas repetitivas de linea de comandos en el modelo local.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado por el autor (prefill y decodificacion en tokens por segundo):

| Equipo | Memoria unificada | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|---:|
| M5 Max | 128 GB | 5205 | 287 |
| M5 Pro | 48 GB | 3141 | 159 |
| M4 Pro | 48 GB | 945 | 112 |
| M3 Pro | 36 GB | 788 | 75 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: los pesos NVFP4 ocupan 22,9 GB, por lo que se requiere un Mac con al menos 32 GB de memoria unificada; el autor indica "32 GB Macs and up".
- Equipos validados por el autor: M5 Max 128 GB, M5 Pro 48 GB, M4 Pro 48 GB y M3 Pro 36 GB.
- No cabe en GPU de consumo con menos de 24 GB de VRAM en este formato, y el artefacto esta orientado exclusivamente a Apple Silicon.
- Despliegue: motor Kapitsa mediante `kapitsa serve --model lightning`; el motor expone APIs compatibles con OpenAI y Anthropic.
- Otros motores (llama.cpp, Ollama, vLLM, TGI): no disponible en la informacion proporcionada; el formato NVFP4 y la orientacion a Apple Silicon hacen que la ruta soportada sea Kapitsa.
- Throughput observado: 75 tok/s en M3 Pro 36 GB hasta 287 tok/s en M5 Max 128 GB en decodificacion; prefill entre 788 y 5205 tok/s.
- Latencia: no se publican cifras de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato / despliegue | Licencia |
|---|---|---:|---|---|---|
| Kapitsa Lightning (Nemotron 3.5 Lightning 30B-A3B NVFP4) | 30B | 3B | no disponible | NVFP4, Kapitsa en Apple Silicon | NVIDIA Open Model License |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (base) | 30B | 3B | no disponible | Pesos originales de NVIDIA | NVIDIA Open Model License |
| Qwen (soportado por Kapitsa) | no disponible | no disponible | no disponible | Kapitsa en Apple Silicon | no disponible |

No se dispone de datos suficientes para comparar rendimiento de calidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: es una ficha de distribucion que depende del modelo base alojado en NVIDIA; la disponibilidad del artefacto esta ligada a la del modelo original.
- La licencia NVIDIA Open Model License no es una licencia de codigo abierto convencional; deben revisarse sus terminos antes de cualquier uso comercial.
- El despliegue esta restringido en la practica a Apple Silicon mediante el motor Kapitsa; no se documentan rutas alternativas de inferencia.
- Requiere al menos 32 GB de memoria unificada; en equipos de 16 GB o menos no es viable.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento adecuado en castellano o en tareas de contexto largo.
- El rendimiento en decodificacion cae de forma marcada en chips de gama inferior (75 tok/s en M3 Pro frente a 287 tok/s en M5 Max), lo que condiciona la experiencia interactiva.
- Modelo con cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria independiente de su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/kapitsa-lightning
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Repositorio del motor: https://github.com/nace-ai/kapitsa
- Releases del motor: https://github.com/nace-ai/kapitsa/releases
