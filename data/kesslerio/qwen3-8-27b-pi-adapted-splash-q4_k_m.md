# kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M

## Resumen

Qwen3.8-27B-pi-adapted-Splash-Q4_K_M es una cuantizacion GGUF no oficial del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario kesslerIO. El artefacto fusiona el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted` sobre la base BF16 declarada y posteriormente aplica una cuantizacion Q4_K_M sin matriz de importancia. El resultado es un unico fichero GGUF de 15,66 GiB (16.810.714.560 bytes) con 866 tensores, pensado para servir el adaptador en motores que no cargan LoRA en tiempo de ejecucion.

El modelo conserva los 27.320.697.856 parametros (~27,3B) del Qwen3.8-27B original y esta especializado en tareas de programacion mediante el adaptador Pi. La model card lo valida exclusivamente con Splash 1.7.0 sobre Apple Silicon (M5 Max con 128 GiB de memoria unificada y macOS 26.7.3) y con el agente de codigo Pi 1.5.2, usando decodificacion especulativa con un modelo draft externo (`incoai/Qwen3.8-27B-DFlash2`). Es una release solo texto: no incluye proyector de vision ni pesos draft.

Su relevancia es acotada pero practica: ofrece un camino reproducible para desplegar el adaptador Pi en formato cuantizado sobre hardware Apple, con una receta de conversion documentada (llama.cpp converter revision `52975342...`, cuantizador 0.7.0) y un ajuste especifico para Splash que mantiene separadas las proyecciones GDN QKV/gate y beta/alpha en lugar de concatenarlas. No es una release oficial de Qwen ni de harness-hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B), tag `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 262.144 tokens configurados como techo en Splash; ventana completa no estresada |
| Tipos de cuantizacion | Q4_K_M (sin importance matrix); unico fichero publicado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una conversion derivada, no un entrenamiento nuevo. Sobre la base Qwen/Qwen3.8-27B (revision `37561816e66b5b9153b1b64c10968c18c1e6f4a0`) se aplica una fusion PEFT en CPU del adaptador `harness-hub/Qwen3.8-27B-pi-adapted` (revision `e786f8491742268f9b2bc729697b13bfac26d4ad`), procesando un shard de la base cada vez. Despues se exporta a GGUF en BF16 y se cuantiza a Q4_K_M con el paquete cuantizador de llama.cpp 0.7.0. No se realizo entrenamiento adicional en esta publicacion.

La innovacion tecnica destacable es el tratamiento de las proyecciones GDN (gated delta network): el convertidor fijado por defecto concatena las proyecciones QKV/gate y beta/alpha, pero Splash 1.7 rechazaba ese layout fusionado. El autor incluye un wrapper que desactiva esa concatenacion manteniendo el reordenamiento de cabezas upstream. El artefacto final tiene 866 tensores y supera la comprobacion nativa de formas. No se dispone de informacion sobre el dataset de entrenamiento del adaptador, numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat compatible con la API OpenAI-completions.
- Programacion y reparacion de codigo: el adaptador Pi esta orientado a tareas de coding, incluyendo tool calling y ejecucion de comandos de shell dentro de un agente.
- Razonamiento multi-paso dentro de bucles de agente (Pi 1.5.2), con hasta 60 llamadas a herramientas por intento en las pruebas del autor.
- Tool calling / function calling a traves de la interfaz compatible con OpenAI expuesta por Splash.
- Decodificacion especulativa mediante modelo draft externo (`incoai/Qwen3.8-27B-DFlash2`).
- Modo thinking desaconsejado: el autor recomienda mantenerlo desactivado (`--reasoning-effort none`, `--thinking off`).
- Solo texto: sin vision, sin audio, sin proyector multimodal.
- Multilingue limitado: la model card declara unicamente `en`.

## Casos de uso

- Agente de programacion local en Apple Silicon: servir el GGUF con Splash 1.7 y conectarlo a Pi 1.5.2 permite tener un agente de reparacion de codigo en una M5 Max sin depender de la nube, usando tool calling y shell acotado.
- Reparacion automatizada de tests en Python: el modelo puede recibir un fallo, inspeccionar ficheros con herramientas y proponer parches; el autor midio 14/24 comprobaciones funcionales superadas frente a 7/24 del base Q4.
- Sustitucion de LoRA en motores sin soporte runtime: si el servidor de inferencia no carga adaptadores PEFT, este GGUF ya fusionado evita mantener dos artefactos y simplifica el despliegue.
- Evaluacion comparativa de adaptadores: al estar el adaptador fusionado sobre la misma base y cuantizacion que el modelo original, sirve como brazo de control en experimentos A/B de calidad de codigo con tokenizer y plantilla identicos.
- Prototipado de pipelines de CI asistidos por LLM: con contexto configurado de 262.144 tokens se pueden pasar arboles de repositorio y logs largos, aunque el autor advierte que no se estreso la ventana completa.
- Servicio local compatible con OpenAI para herramientas internas: el endpoint `/v1` con `api: openai-completions` permite enchufar clientes existentes sin reescribir integraciones.
- Experimentacion con decodificacion especulativa: la receta documenta el uso de un draft model separado, util para medir aceleraciones en hardware Apple.

## Benchmarks y rendimiento

El autor publica una suite local propia de 12 tareas de reparacion de codigo en Python, con 2 repeticiones por modelo (48 ejecuciones totales), medidas el 2026-11-18 en una M5 Max con 128 GiB, Q4_K_M en ambos brazos, temperatura 0.8, 4.096 tokens de salida por peticion, techo de 262.144 tokens, thinking off, 300 segundos por intento y 60 llamadas a herramienta como maximo. No son resultados de SWE-bench ni Terminal-Bench, y el propio autor califica la superioridad de fiabilidad como no concluyente.

| Resultado | Base Q4 | Pi-adapted Q4 |
|---|---:|---:|
| Comprobaciones funcionales superadas | 7/24 | 14/24 |
| Finalizaciones utilizables (correctas y dentro de limites) | 7/24 | 13/24 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero GGUF ocupa 15,66 GiB; el autor configura `--max-memory 32G` en Splash, presupuesto que incluye pesos del target, draft, KV/estado en GPU y buffers. La memoria de macOS y Python es adicional.
- Hardware validado: Apple Silicon M5 Max con 128 GiB de memoria unificada y macOS 26.7.3. No se probaron otras plataformas.
- El autor advierte explicitamente que 32 GiB de presupuesto no equivalen a que un Mac con 32 GiB de RAM total pueda ejecutar comodamente esta configuracion.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; no se documentan pruebas en CUDA.
- Motor de despliegue: Splash 1.7.0 (CLI `splash serve`), con endpoint compatible OpenAI en `http://127.0.0.1:8111/v1`. Otros motores GGUF (llama.cpp, Ollama, vLLM, TGI) no fueron probados con este artefacto segun la model card.
- Decodificacion especulativa: requiere descargar `incoai/Qwen3.8-27B-DFlash2` (revision `015e7956...`) como draft model.
- Latencia y throughput: no disponible; el autor publica graficos de tiempos y llamadas a herramienta en `assets/coding-benchmark.png`, pero no cifras en texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M | ~27,3B | 262.144 configurados | GGUF Q4_K_M | apache-2.0 | Adaptador Pi fusionado, validado solo en Splash 1.7 / Apple Silicon |
| Qwen/Qwen3.8-27B (base) | ~27,3B | no disponible | safetensors BF16 | apache-2.0 | Sin adaptador; sirve como referencia de control en la suite del autor |
| harness-hub/Qwen3.8-27B-pi-adapted | ~27,3B | no disponible | LoRA sobre base | no disponible | Adaptador original; requiere motor con soporte LoRA en runtime |

No se dispone de datos de rendimiento estandar que permitan comparar contra otras familias de modelos de tamano similar.

## Limitaciones y advertencias

- Es una conversion no oficial: no cuenta con el respaldo de Qwen, harness-hub ni Splash; los creditos corresponden a los autores upstream.
- Solo texto: no incluye proyector de vision ni pesos draft; cualquier caso de uso multimodal queda fuera de alcance.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado.
- El autor reconoce que la mejora en fiabilidad no esta estadisticamente establecida; la muestra es de 24 intentos por brazo en tareas propias.
- Compatibilidad limitada: validado solo con Splash 1.7.0 en Apple Silicon; otros motores GGUF no fueron probados y el layout GDN separado podria no ser aceptado por convertidores o runtimes que esperen proyecciones fusionadas.
- El techo de contexto de 262.144 tokens es una configuracion, no una ventana estresada; prompts de longitud completa pueden degradar calidad o agotar memoria.
- Modo thinking: el autor recomienda desactivarlo; Pi 1.5.2 omite kwargs de plantilla para modelos no razonadores, por lo que el servidor debe forzar `reasoning_effort: none` de forma independiente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las limitaciones generales de los LLM en tareas de codigo y tool calling.
- Sesgos: no documentados en la model card.
- Licencia apache-2.0 permite uso comercial, pero al ser un derivado conviene revisar `provenance.json`, `LICENSE` y `NOTICE` del repositorio antes de redistribuir.
- El repositorio tiene 371 descargas y 1 like en el momento de la consulta: adopcion muy baja, lo que reduce la validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kesslerIO/Qwen3.8-27B-pi-adapted-Splash-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador Pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo draft para decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Receta de conversion: `reproduction/README.md` dentro del repositorio
- Procedencia: `provenance.json` dentro del repositorio
- Graficos de benchmarks: `assets/coding-quality-modern.png`, `assets/coding-benchmark.png` y fuentes de ploteo `benchmarks/plot_broad.py` dentro del repositorio
