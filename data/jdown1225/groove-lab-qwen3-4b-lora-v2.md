# jdown1225/groove-lab-qwen3-4b-lora-v2

## Resumen

Groove Lab Qwen3-4B Adapter v2 es un adaptador LoRA entrenado sobre el checkpoint cuantizado a 4 bits `mlx-community/Qwen3-4B-4bit` (familia Qwen3, 4.000 millones de parametros). Lo desarrolla el usuario jdown1225 y su proposito es muy concreto: convertir instrucciones en lenguaje natural ("un bossa nova suave con cross-stick sincopado") en grooves de bateria estructurados en un esquema JSON propio denominado GrooveScoreV1, consumido por la aplicacion Groove Lab.

No es un modelo de proposito general ni un checkpoint completo: es un adaptador de bajo rango (rank 8 sobre 16 capas) pensado para ejecutarse con MLX LM en Apple Silicon. Su relevancia es acotada pero clara para quien construya herramientas musicales generativas en el ecosistema Mac: demuestra un flujo completo de QLoRA sobre un modelo pequeno cuantizado, con formato de salida validado por la aplicacion anfitriona.

El repositorio tiene un tamano de 0,0 GB (solo pesos del adaptador), 0 descargas y 0 likes en el momento de la consulta, y no declara licencia propia ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3-4B) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | Base en 4 bits (MLX); adaptador LoRA en el formato del repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el adaptador; modelo base Apache 2.0 (se incluye LICENSE-QWEN) |
| Formato de pesos | MLX (adaptador LoRA); modelo base MLX 4-bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder de la familia Qwen3. El entrenamiento consistio en 1.000 pasos de QLoRA con rango 8 distribuido en 16 capas y enmascaramiento de prompt (prompt masking), de modo que la perdida se calcula solo sobre la respuesta JSON y no sobre la instruccion de entrada.

El corpus contiene 10.950 pares prompt-score de entrenamiento, 190 de validacion y 190 de test. El export mantiene las familias de grooves dentro de un mismo split para evitar fuga de informacion entre conjuntos. El checkpoint base esta fijado a la revision `4dcb3d101c2a062e5c1d4bb173588c54ea6c4d25` de `mlx-community/Qwen3-4B-4bit`. No se documentan detalles sobre composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Generacion de grooves de bateria estructurados en JSON (esquema GrooveScoreV1) a partir de descripciones en lenguaje natural.
- Interpretacion de indicaciones musicales: estilo (bossa nova, etc.), intensidad ("soft"), tecnicas de percusion ("cross-stick") y caracter ritmico ("syncopated").
- Salida en formato validable por la aplicacion anfitriona, que comprueba el JSON y puede reintentar o reparar errores menores.
- Ejecucion local en Apple Silicon mediante MLX LM con `mlx_lm.server` y `--adapter-path`.
- Plantilla de chat con `enable_thinking: false` para evitar el modo de razonamiento del modelo base en este caso de uso.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues especificas del adaptador.

## Casos de uso

- Generacion de grooves en una app de produccion musical: el adaptador traduce una descripcion textual a un GrooveScoreV1 que la aplicacion convierte en patron MIDI, ideal por su formato de salida fijo y validable.
- Prototipado rapido de ideas ritmicas: un musico escribe "bossa nova suave con cross-stick sincopado" y obtiene un groove base editable en segundos, sin salir del Mac.
- Asistente de composicion en BopKit: la version procedural de Groove Lab se esta portando a BopKit, de modo que el adaptador sirve como referencia para integrar generacion por lenguaje natural en esa herramienta.
- Pruebas de validacion y reparacion de JSON: al ser un modelo pequeno y local, permite iterar sobre el bucle generar-validar-reintentar sin coste de API ni latencia de red.
- Educacion y demostraciones de fine-tuning: sirve como ejemplo reproducible de QLoRA con rank 8 sobre un modelo cuantizado a 4 bits en MLX, con dataset y script publicados.
- Generacion offline en portatiles Apple Silicon: al ejecutarse con MLX LM sobre el checkpoint 4-bit, encaja en flujos sin conexion para estudios pequenos o entornos sin GPU dedicada.
- Benchmarking interno de adaptadores musicales: su split de test separado por familias de grooves permite medir generalizacion a estilos no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el modelo base de 4.000 millones en 4 bits ocupa aproximadamente 2-3 GB; el adaptador anade una cantidad marginal. Cifra exacta no disponible.
- Plataforma recomendada: Apple Silicon (MLX); el modelo card indica explicitamente macOS con MLX LM.
- GPU: no se documentan requisitos para CUDA. En el ecosistema Apple, cabe en equipos con memoria unificada de 8 GB o superior (estimacion a partir del tamano del checkpoint 4-bit; no confirmada por el autor).
- Despliegue: `mlx_lm.server` con `--model` apuntando al checkpoint base fijado y `--adapter-path` al adaptador; lanzado via `uv run --no-project --python 3.13 --with mlx-lm`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groove Lab Qwen3-4B LoRA v2 | 4B (base) + LoRA | no disponible | JSON GrooveScoreV1 | no disponible (base Apache 2.0) | Hugging Face, MLX |
| Qwen3-4B (base) | 4B | no disponible | texto libre | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3-4B-4bit | 4B | no disponible | texto libre | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de otros adaptadores musicales equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en generar grooves en formato GrooveScoreV1; fuera de ese dominio su utilidad es limitada.
- Depende de una revision concreta del checkpoint base (`4dcb3d1...`); usar otra revision puede degradar la calidad o romper la compatibilidad.
- Requiere validacion externa del JSON: la propia model card indica que la aplicacion comprueba la salida y puede reintentar o reparar errores, lo que implica que el modelo no garantiza JSON valido al 100 %.
- No se declara licencia para el adaptador; el uso comercial debe atenerse a la licencia del modelo base (Apache 2.0) y a LICENSE-QWEN, pero la situacion legal del adaptador en si no esta clara.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos; al ser un modelo pequeno y fine-tuneado, es esperable que invente campos o valores fuera del esquema si se le saca de su dominio.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por terceros.
- El entrenamiento (1.000 pasos, rank 8, 16 capas) es ligero; la cobertura de estilos y la robustez ante prompts ambiguos probablemente sean limitadas.
- Ejecucion practica limitada al ecosistema MLX/Apple Silicon; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdown1225/groove-lab-qwen3-4b-lora-v2
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Repositorio Groove Lab AI: https://github.com/jdmyco/groove-lab-ai
- Instrucciones de dataset y export (commit fijado): https://github.com/jdmyco/groove-lab-ai/tree/f1c2a4dc2a00d6277afac6860f0fc5b871a28438#fine-tuning-corpus
- BopKit: http://bopkit.app
