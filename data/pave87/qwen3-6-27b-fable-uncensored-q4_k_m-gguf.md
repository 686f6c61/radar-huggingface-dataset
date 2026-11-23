# Pave87/Qwen3.6-27B-Fable-Uncensored-Q4_K_M-GGUF

## Resumen

Pave87/Qwen3.6-27B-Fable-Uncensored-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo lemuralabs/Qwen3.6-27B-Fable-Uncensored, un modelo de lenguaje de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors del modelo base) derivado de la familia Qwen3.6 y sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y moderacion. El autor de esta version cuantizada es el usuario Pave87, que ha utilizado el espacio GGUF-my-repo de ggml.ai, basado en llama.cpp, para generar el fichero Q4_K_M.

La relevancia de esta ficha radica en que se trata de un modelo orientado a flujos agenticos y tool calling, con etiquetas que declaran capacidades de razonamiento, function calling y uso conversacional, pero distribuido en una cuantizacion de 4 bits que reduce el peso del repositorio a 16,5 GB, lo que lo hace desplegable en hardware de consumo de gama alta. La licencia declarada es Apache 2.0 y el unico idioma soportado oficialmente es el ingles.

Conviene subrayar que el repositorio no incluye model card propia mas alla de las instrucciones de uso con llama.cpp; toda la informacion tecnica sustantiva remite al modelo base de lemuralabs. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base admite otras cuantizaciones no listadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero qwen3.6-27b-fable-uncensored-q4_k_m.gguf); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.6 con ~26,9 mil millones de parametros. La model card del repositorio cuantizado no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La etiqueta "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a suprimir las respuestas de negativa del modelo; sin embargo, no se documenta la metodologia concreta ni el volumen de datos utilizado en ese proceso.

La unica innovacion tecnica documentada en este repositorio es la conversion a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai, que produce una cuantizacion Q4_K_M. No se declaran mecanismos adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento (etiqueta "reasoning" declarada por el autor).
- Tool calling y function calling (etiquetas "tool-calling" y "function-calling").
- Flujos agenticos multi-paso (etiqueta "agentic").
- Modo "uncensored": ausencia declarada de mecanismos de rechazo tras el proceso de abliteration.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades multimodales (vision, audio): no disponibles.
- Soporte multilingue: limitado a ingles segun la model card.

## Casos de uso

- Agentes autonomos con tool calling: el modelo declara soporte explicito de function calling y flujos agenticos, por lo que puede integrarse en orquestadores que encadenen llamadas a APIs externas, busquedas o ejecucion de codigo en varios pasos.
- Asistentes conversacionales sin filtros de rechazo: util para investigacion sobre comportamiento de modelos y para aplicaciones donde las negativas del modelo interfieren con el flujo (escritura creativa adulta, simulacion de personajes, analisis de contenido sensible).
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M en 16,5 GB permite ejecutar el modelo con llama.cpp en equipos con GPU de consumo de gama alta o incluso en CPU con suficiente RAM, sin depender de servicios en la nube.
- Prototipado rapido de pipelines agenticos: al ser compatible con llama-server, se puede exponer una API compatible con OpenAI para pruebas de integracion antes de migrar a versiones de mayor precision.
- Generacion de texto en ingles para entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia para estudiar como la cuantizacion a 4 bits afecta al comportamiento de un modelo previamente ablacionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-17 GB para el fichero Q4_K_M, mas overhead de contexto KV cache (variable segun longitud de contexto configurada).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con ajustes de offload parcial, en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, tambien Ollama y otros runners basados en llama.cpp. vLLM y TGI requeririan los pesos en safetensors del modelo base, no incluidos en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pave87/Qwen3.6-27B-Fable-Uncensored-Q4_K_M-GGUF | ~26,9 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Cuantizacion de un modelo abliterated, solo ingles |
| lemuralabs/Qwen3.6-27B-Fable-Uncensored | ~26,9 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Otros modelos Qwen3.6 de ~27 B | no disponible | no disponible | no disponible | no disponible | No hay datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- El proceso de abliteration puede degradar capacidades de razonamiento y coherencia, y elimina salvaguardas frente a contenido danino; no es adecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de ~27 B, sin datos de benchmarks que permitan cuantificarlo.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo base en safetensors; el impacto exacto no esta documentado.
- No se especifica la longitud de contexto soportada, lo que impide garantizar ventanas largas en produccion.
- El repositorio no incluye model card tecnica propia; la trazabilidad del entrenamiento depende del modelo base de lemuralabs.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de calidad en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pave87/Qwen3.6-27B-Fable-Uncensored-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/lemuralabs/Qwen3.6-27B-Fable-Uncensored
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
