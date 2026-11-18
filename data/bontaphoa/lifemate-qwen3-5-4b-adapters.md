# BonTapHoa/LifeMate-Qwen3.5-4B-Adapters

## Resumen

LifeMate-Qwen3.5-4B-Adapters es un conjunto de adaptadores LoRA (PEFT) publicados por BonTapHoa sobre el modelo base Qwen/Qwen3.5-4B, desarrollados para el reto Zalo AI Challenge 2026 en la categoria LifeMate. No se trata de un modelo completo, sino de tres checkpoints de adaptadores (dos de SFT y uno de RPO) que especializan el modelo base en la tarea de agente de voz multi-aplicacion en vietnamita: recibir una transcripcion de audio, resolver referencias entre entidades y ejecutar llamadas a herramientas (tool calling) de forma encadenada.

El pipeline descrito por el autor combina un doble sistema ASR (PhoWhisper-large y gipformer-65M) cuya salida alimenta al Qwen3.5-4B con los adaptadores LoRA, que a su vez opera en un bucle de tool calling con resolucion de claves foraneas mediante referencias `(ref: ...)` y un interceptor anti-bucle. El objetivo es convertir instrucciones habladas en vietnamita en acciones concretas sobre multiples aplicaciones, manteniendo coherencia de esquema y evitando bucles infinitos de llamadas a herramientas.

La relevancia actual del repositorio es doble: por un lado, documenta una receta completa de ajuste fino (SFT con trazas de razonamiento y posterior optimizacion de preferencias on-policy) sobre un modelo de 4B parametros; por otro, lo hace con licencia Apache 2.0 y pesos en formato safetensors PEFT, lo que facilita su reproduccion y su integracion en despliegues con vLLM. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B; proyecciones `q,k,v,o,gate,up,down`, rango `r=16` |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5-4B) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json` por subcarpeta) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado sobre las proyecciones de atencion y MLP (`q`, `k`, `v`, `o`, `gate`, `up`, `down`) del transformer Qwen3.5-4B. El pipeline completo descrito en la model card encadena dos sistemas ASR (PhoWhisper-large y gipformer-65M) con el LLM adaptado, que opera en un bucle de tool calling con resolucion de referencias foraneas `(ref: ...)` y un mecanismo denominado Anti-Loop Interceptor para cortar cadenas de llamadas repetitivas. El repositorio incluye tres checkpoints independientes: `rpo_v12e3_pct75` (RPO on-policy sobre SFT v12, recomendado por el autor), `sft_v12_epoch2` (mejor checkpoint SFT) y `sft_v8_nomask_v4` (linea base SFT v8).

El entrenamiento SFT se realizo sobre 1.426 trayectorias multi-turno de agente de voz en vietnamita (`sft_data_v12_vi_aug`), con tres variantes de semilla, trazas de razonamiento ciegas a la respuesta (answer-blind) y un conjunto de reglas `RULES_V6`. Sobre ese SFT se aplico una fase de RPO (On-Policy Preference Optimization) con 527 pares de preferencia, beta=0,1, alpha=1,0 y learning rate 1e-5. El autor indica que todos los checkpoints superan una "Constitution" de verificacion en cuatro niveles (Tier 0 a Tier 3) orientada a evitar fugas de mascara de prompt y garantizar el cumplimiento estricto del esquema.

## Capacidades

- Generacion de texto y razonamiento multi-turno en vietnamita e ingles.
- Tool calling y function calling dentro de un bucle de agente con multiples pasos.
- Resolucion de referencias entre entidades mediante el mecanismo `(ref: ...)` para encadenar llamadas a herramientas.
- Interceptor anti-bucle para evitar repeticiones infinitas de llamadas.
- Integracion en pipelines de voz a accion (ASR dual PhoWhisper-large + gipformer-65M seguido del LLM adaptado).
- Cumplimiento estricto de esquema (schema compliance) segun la verificacion en cuatro niveles descrita.
- Capacidades multilingues limitadas a vietnamita e ingles segun los metadatos del repositorio.

## Casos de uso

- Asistentes de voz para movil en vietnamita: el adaptador convierte transcripciones ASR en llamadas a herramientas de multiples aplicaciones (calendario, mensajeria, ajustes del sistema) manteniendo el contexto de la conversacion multi-turno.
- Automatizacion de tareas del hogar o personales: el modelo encadena acciones como crear recordatorios, enviar mensajes o modificar ajustes a partir de una unica instruccion hablada, resolviendo referencias entre entidades con `(ref: ...)`.
- Agentes conversacionales con tool calling en produccion: al ser un adaptador PEFT sobre Qwen3.5-4B, se puede servir con vLLM en modo multi-LoRA y enrutar distintas tareas a distintos adaptadores sobre el mismo modelo base.
- Investigacion en optimizacion de preferencias on-policy: el checkpoint `rpo_v12e3_pct75` sirve como referencia reproducible de una receta SFT + RPO sobre un modelo de 4B con datos de agente de voz.
- Evaluacion de pipelines de voz a accion: el repositorio permite reproducir el pipeline ASR dual + LLM + bucle de herramientas y medir el impacto de cada componente.
- Prototipado de agentes multi-aplicacion en vietnamita: util para equipos que necesiten un punto de partida con licencia Apache 2.0 y pesos en safetensors para experimentar con tool calling en ese idioma.

## Benchmarks y rendimiento

| Checkpoint | Reglas | Val score (`val_v3`, 415) | Public LB (634) | Visto / No visto |
|---|---|---|---|---|
| `rpo_v12e3_pct75` | v6 | 66,54 | 64,25000 | 80,06 / 61,23 |
| `sft_v12_epoch2` | v6 | 65,60 | 64,14000 | 75,20 / 58,93 |
| `sft_v8_nomask_v4` | v4 | 62,61 | 62,64000 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores corresponden a la evaluacion interna del reto Zalo AI Challenge 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre Qwen3.5-4B, los requisitos son los del modelo base (aproximadamente 8-9 GB en bf16 y 4-5 GB en cuantizacion de 4 bits, estimacion orientativa no confirmada por el autor).
- GPU recomendadas: el autor menciona entrenamiento en A100 SXM4; para inferencia se puede usar cualquier GPU con memoria suficiente para el modelo base de 4B.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas en cuantizacion de 4 bits, aunque el autor no lo confirma.
- Opciones de despliegue: vLLM con `--enable-lora` y `--lora-modules` (soporte multi-LoRA), transformers + peft, y descarga selectiva via `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LifeMate-Qwen3.5-4B-Adapters | 4B (base) + LoRA r=16 | no disponible | Agente de voz vietnamita con tool calling | Apache 2.0 | Hugging Face (adaptadores PEFT) |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base generalista | no disponible en esta ficha | Hugging Face |
| Alternativas de agente de voz en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar Qwen/Qwen3.5-4B y aplicar el checkpoint LoRA correspondiente.
- Idiomas limitados a vietnamita e ingles; el rendimiento fuera de esos idiomas no esta documentado.
- Las metricas publicadas (66,54 en validacion y 64,25 en leaderboard publico) corresponden a la evaluacion del reto Zalo AI Challenge 2026, no a benchmarks estandar, por lo que no son directamente comparables con otros modelos.
- El pipeline completo depende de dos sistemas ASR externos (PhoWhisper-large y gipformer-65M); el adaptador no incluye el reconocimiento de voz.
- Riesgo de alucinacion y de llamadas a herramientas incorrectas en produccion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-4B antes de desplegar en produccion.
- El repositorio no registra descargas ni likes, lo que limita la evidencia externa sobre su robustez.

## Enlaces

- Hugging Face: https://huggingface.co/BonTapHoa/LifeMate-Qwen3.5-4B-Adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo y pipeline de entrenamiento: https://github.com/Liamislazy/ZAIC_LifeMate
