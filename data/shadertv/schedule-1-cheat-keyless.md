# ShaderTV/schedule-1-cheat-keyless

## Resumen

`ShaderTV/schedule-1-cheat-keyless` no es un modelo de inteligencia artificial ni un artefacto de aprendizaje automatico. Se trata de un repositorio alojado en Hugging Face que distribuye un ejecutable de Windows (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`, build `v3.2.3`/`064ABB`) empaquetado en un ZIP de 4,8 MB protegido con la contrasena `2026`. La model card se presenta como una pagina de descarga de una herramienta de trampas ("cheat") para un videojuego, con modulos de overlay, ESP, smoothing de entrada y evasion de captura de pantalla.

El artefacto no contiene pesos, tokenizador, configuracion de arquitectura ni ningun otro componente propio de un modelo de lenguaje o multimodal. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que el contenido es un binario para escritorio, no un modelo. La licencia declarada es MIT, pero se aplica sobre el repositorio, no sobre un modelo subyacente.

Por tanto, esta ficha documenta un artefacto que no cumple los criterios de evaluacion de un modelo de IA. Los apartados tecnicos que siguen reflejan esa realidad: la mayoria de los parametros de modelo solicitados no son aplicables o no estan disponibles, y se advierte explicitamente del riesgo de seguridad asociado a la ejecucion de binarios de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` para Windows x64 |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de RLHF/DPO, ni innovaciones de arquitectura tipo transformer, MoE, SSM o hibrida. El contenido descrito en la model card es una aplicacion de escritorio con modulos de escaneo de memoria (dynamic offset scanner), overlay externo, smoothing de entrada tipo bezier y una capa de "stream-proof" orientada a evadir capturas de OBS, ShadowPlay y Discord.

La unica informacion "tecnica" disponible en la model card son afirmaciones de marketing no verificables (por ejemplo, 478 Hz de polling, menos de 43 MB de RAM, respuesta inferior a 5 ms en cambio de perfiles). No hay publicacion de metodologia, codigo fuente auditable ni artefactos reproducibles que permitan validar esas cifras.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues propias de un modelo; los codigos de idioma del repositorio son metadatos de la model card.
- El binario, segun su propia descripcion, implementa funciones de trampa para un videojuego: overlay con cajas 2D/3D, esqueletos de huesos, ESP de distancia, smoothing de punteria y evasion de captura.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad cognitiva.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, porque no lo es.
- El uso previsto por el autor es la ejecucion de un "cheat" en un videojuego, lo que puede violar los terminos de servicio del juego y acarrear el baneo de la cuenta.
- La ejecucion de un `.exe` sin firma, distribuido via ZIP con contrasena y con instrucciones de "Run as Administrator", constituye un vector de riesgo de malware y no deberia realizarse en entornos de produccion ni en maquinas con datos sensibles.
- Un equipo de investigacion de seguridad podria analizarlo en un sandbox aislado para estudiar tecnicas de evasion de captura, pero nunca en un equipo de trabajo.
- No es adecuado para atencion al cliente, generacion de codigo, analisis documental, RAG, agentes ni ninguna tarea de NLP.
- No es adecuado como dependencia en pipelines de CI/CD, servicios en la nube ni despliegues con vLLM, TGI, llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo evaluable con dichos benchmarks.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo requerido: Windows 10 u 11 de 64 bits, segun la model card.
- Opciones de despliegue: ejecucion directa del binario en Windows; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: las cifras de la model card (478 Hz de polling, menos de 5 ms de respuesta, menos de 43 MB de RAM) no son verificables ni auditables.

## Comparativa con modelos similares

| Criterio | `ShaderTV/schedule-1-cheat-keyless` | Modelo de IA tipico (categoria LLM) |
|---|---|---|
| Naturaleza | Binario de escritorio para Windows | Pesos de red neuronal |
| Parametros | No aplica | Millones o miles de millones |
| Contexto | No aplica | Miles o millones de tokens |
| Benchmarks | No disponibles | MMLU, HumanEval, GSM8K, etc. |
| Licencia | MIT (sobre el repo) | Variable (Apache, MIT, Llama, etc.) |
| Formato | ZIP con `.exe` | safetensors, GGUF, etc. |

No se identifican modelos comparables en el catalogo de Hugging Face, porque el artefacto no pertenece a la categoria de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion como modelo carece de sentido tecnico.
- Riesgo de seguridad alto: binario sin firma, distribuido via ZIP con contrasena y con instrucciones de ejecutarlo como administrador; patron habitual en campanas de malware.
- Posible violacion de los terminos de servicio del videojuego objetivo y de la legislacion aplicable en materia de trampas y fraude.
- La licencia MIT declarada no garantiza la ausencia de componentes de terceros con otras condiciones ni la legalidad del contenido distribuido.
- Las cifras de rendimiento de la model card no son verificables ni auditables.
- No apto para produccion, entornos corporativos ni maquinas con datos sensibles.
- Se recomienda no descargar ni ejecutar el artefacto; en caso de analisis, hacerlo exclusivamente en un sandbox aislado y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaderTV/schedule-1-cheat-keyless
- Enlaces de descarga y repositorios referenciados en la model card (no verificados y potencialmente maliciosos): `https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip`
- Repositorio referenciado en la model card: `https://github.com/OnurPetit/schedule-1-cheat-keyless/releases/latest`
- No se han encontrado papers, blogs tecnicos ni demos oficiales asociados al artefacto.
