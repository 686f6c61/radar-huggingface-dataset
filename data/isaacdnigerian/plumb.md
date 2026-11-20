# Isaacdnigerian/plumb

## Resumen

PLUMB es un artefacto de investigacion publicado por Isaacdnigerian para la Lexsi AI Safety and Alignment Hackathon (Track 1). No es un modelo de proposito general, sino un paquete que contiene un benchmark de 96 tareas para agentes de hoja de calculo, los adaptadores LoRA entrenados sobre el modelo base CohereLabs/tiny-aya-global (3.350 millones de parametros), los registros de ejecucion y el arnes de evaluacion. El objetivo declarado es medir y mitigar el comportamiento de "grounding": si el agente responde y actua mas alla de lo que los datos que tiene delante permiten sostener.

El resultado central del trabajo es negativo y explicito: ninguna intervencion de ajuste produce una mejora del grounding que generalice. Sobre una particion libre de contaminacion de 48/48 tareas, el adaptador SFT cambia cero decisiones en las 48 tareas reservadas en las cinco metricas evaluadas, y las dos recetas DPO son inertes o ligeramente perjudiciales. Las victorias aparentes anteriores se midieron sobre los datos de entrenamiento.

El modelo base sobre el que se construye es tiny-aya-global de CohereLabs, un transformer de 3.350 millones de parametros. La relevancia actual del artefacto es metodologica: documenta una secuencia de fallos de medicion, publica la advertencia de contaminacion de sus propios datos y proporciona un arnes reproducible para puntuar otros modelos a traves de cualquier endpoint compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base CohereLabs/tiny-aya-global) con adaptadores LoRA (rank 8, alpha 16) |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF publicado); adaptadores en safetensors |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT), GGUF (Q4_K_M, base y adaptadores fusionados) |

## Arquitectura y entrenamiento

El artefacto se apoya en tiny-aya-global, un transformer de 3.350 millones de parametros de CohereLabs. Sobre el se aplican adaptadores LoRA de rango 8 y alpha 16 mediante PEFT. Se publican cuatro adaptadores: `sft-output-heldout` (entrenado sobre la particion de 48 tareas de train, el unico con evaluacion valida), `sft-output-lora` (SFT sobre el conjunto completo, contaminado), `p1-dpo-output` (16 pares de fabricacion, contaminado) y `p1-dpo-output-balanced` (32 pares, contaminado). La cadena de herramientas empleada es CuratorKIT, AlignTune y AuditKIT.

El benchmark consta de 96 tareas bloqueadas (`phase2-curatorkit-generated-96-p2v3.jsonl`) y una particion libre de fugas de 48/48 agrupada de modo que ninguna instruccion ni hoja aparece en ambos lados. Los adaptadores se evaluaron con el GGUF Q4_K_M servido mediante Ollama, temperatura 0 y tres replicas identicas. El hallazgo tecnico principal es que el SFT sobre 48 ejemplos no altera ninguna de las 48 decisiones reservadas, y que las recetas DPO no aportan mejora. Se documenta ademas un fallo de terminacion: los GGUF se publican con `tokenizer.ggml.eos_token_id = 6`, mientras que tiny-aya termina muestreando el token 3 (`<EOS_TOKEN>`), de modo que tal como se distribuyen generan repeticion degenerada tras el final de la respuesta.

## Capacidades

- Generacion de texto conversacional sobre el modelo base tiny-aya-global.
- Respuesta y actuacion sobre hojas de calculo en el contexto del benchmark PLUMB (tareas de lectura, escritura y respuesta con datos tabulares).
- Evaluacion de grounding: medicion de fabricacion, conjetura silenciosa, escritura colateral, sobrerrechazo, finalizacion, exito de parseo y estrictez de formato.
- Soporte de cualquier endpoint compatible con OpenAI para puntuar modelos propios mediante `scripts/run.py`.
- Deteccion de ambiguedad: documentada como capacidad que emerge con la escala (Qwen3 8B pide aclaracion 16/16 ante columnas con cabecera identica; Tiny Aya 3.35B pide 0/16, y 11/16 cuando se le indica que la ambiguedad existe).
- No se documentan capacidades de vision, audio, tool calling generico ni modo thinking en la informacion disponible.

## Casos de uso

- Evaluacion de seguridad de agentes tabulares: usar el benchmark de 96 tareas para medir la tasa de fabricacion (62,5% en el modelo bajo prueba) y la conjetura silenciosa (31,2%) de un agente antes de desplegarlo en produccion.
- Regresion de arneses de evaluacion: ejecutar `--model stub` y `--model refuser` como pruebas de regresion del scorer; si dejan de comportarse, ningun otro numero es fiable.
- Investigacion sobre alineacion y grounding: reutilizar la particion 48/48 y `check_contamination.py` para comparar recetas SFT y DPO sin fugas de datos.
- Auditoria de pipelines de datos: el aviso de contaminacion y el script de verificacion permiten comprobar si un adaptador comparte ids de tarea con el conjunto de evaluacion.
- Estudio de deteccion de ambiguedad: las seis ejecuciones por nivel de ambiguedad en `training/runs/` sirven para analizar cuando un modelo pide aclaracion frente a cuando adivina.
- Analisis de coste/beneficio de intervenciones: `roi_measure.py` y `roi_compare.py` permiten medir el retorno de una intervencion de ajuste frente a su coste.
- Punto de partida para agentes de hoja de calculo: el adaptador `sft-output-heldout` y su evaluacion valida sirven como referencia base para comparar futuras intervenciones.

## Benchmarks y rendimiento

Benchmark bloqueado de 96 tareas, GGUF Q4_K_M del proveedor servido por Ollama, temperatura 0, tres replicas identicas:

| Metrica | n | Valor |
|---|---:|---:|
| `fabrication_rate` | 16 | 62,5% |
| `silent_guess_rate` | 16 | 31,2% |
| `collateral_write_rate` | 32 | 3,1% |
| `over_refusal_rate` | 64 | 10,9% |
| `completion_rate` | 64 | 75,0% |
| `parse_success_rate` | 96 | 100,0% |
| `format_strict_rate` | 96 | 100,0% |

Resultado de entrenamiento: sobre la particion 48/48 libre de fugas, el adaptador SFT cambia cero decisiones en las 48 tareas reservadas en las cinco metricas. Ambas recetas DPO son inertes o ligeramente daninas. No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3.350 millones de parametros, una cuantizacion Q4_K_M es manejable en GPU de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 3,35B en Q4_K_M, aunque no se documenta la GPU concreta.
- Opciones de despliegue: Ollama (usado en la evaluacion con GGUF Q4_K_M), llama.cpp (mencionado por la necesidad de `gguf-set-metadata`), cualquier endpoint compatible con OpenAI para el arnes de evaluacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding / ambiguedad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLUMB (sobre tiny-aya-global) | 3,35B | no disponible | Pide aclaracion 0/16 sin pista, 11/16 con pista | MIT | Hugging Face |
| Qwen3 8B | 8B | no disponible | Pide aclaracion 16/16 sin pista | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos comparativos adicionales de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Contaminacion de datos: `training/sft-corrections.jsonl`, `training/p1-preference-pairs.jsonl` y `training/p1-preference-pairs-balanced.jsonl` derivan del benchmark de evaluacion y comparten ids de tarea. Los adaptadores entrenados sobre ellos (`p1-dpo-output`, `p1-dpo-output-balanced`, `sft-output-lora`) no pueden evaluarse sobre el conjunto de 96 tareas; cualquier resultado es una puntuacion de memorizacion. Se publican como evidencia, no como modelos utilizables.
- Fallo de terminacion en los GGUF: se distribuyen con `tokenizer.ggml.eos_token_id = 6`, pero tiny-aya termina con el token 3; sin corregir con `gguf-set-metadata <file> tokenizer.ggml.eos_token_id 3 --force`, generan repeticion degenerada. Las cadenas de parada no sustituyen la correccion porque todos los terminadores del vocabulario estan tipados como `CONTROL` y llama.cpp no los renderiza en el flujo de texto.
- Alta tasa de fabricacion (62,5%) y de conjetura silenciosa (31,2%) en el modelo bajo prueba: riesgo elevado de alucinacion en tareas de hoja de calculo.
- El modelo base solo declara ingles; no se documentan capacidades multilingues.
- No se documentan sesgos conocidos ni restricciones adicionales de licencia para uso comercial mas alla de la licencia MIT.
- El artefacto no es un modelo de produccion: es un paquete de investigacion con adaptadores mayoritariamente contaminados y un unico adaptador con evaluacion valida.

## Enlaces

- Hugging Face: https://huggingface.co/Isaacdnigerian/plumb
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio GitHub con el write-up completo: mencionado en la model card, URL no disponible en la informacion proporcionada.
