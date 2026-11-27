# banyohavlusu23/minicpm-v-4.7-1b-computer-use

## Resumen

MiniCPM-V-4.7-1B-Computer-Use es un ajuste fino mediante LoRA del modelo multimodal MiniCPM-V-4.7-1B de OpenBMB, publicado por el usuario independiente banyohavlusu23. Su proposito es operar un escritorio a partir de capturas de pantalla: el modelo observa la imagen de la pantalla, emite una linea corta `Action: ...` y realiza una unica llamada a una herramienta `computer_use` (click, type, key, scroll, drag, wait, terminate), una accion por paso. Es, por tanto, un agente de uso de computador (computer-use agent) de vision-lenguaje de muy baja escala.

El modelo parte de una base de aproximadamente 1.000 millones de parametros (el repositorio declara 10.223.616 parametros en los tensores safetensors, cifra que corresponde al adaptador y no al modelo completo) y se entreno a partir de filas de pasos construidas sobre el dataset nvidia/ProCUA-SFT, en una unica GPU de portatil (RTX 4060 Laptop, 8 GB). Se distribuye con licencia Apache 2.0, en safetensors y GGUF, y esta pensado para ejecutarse en llama.cpp, LM Studio u Ollama.

Su relevancia es doble: por un lado demuestra que es posible entrenar un agente de uso de escritorio en hardware de consumo; por otro, sus propios resultados son deliberadamente modestos y el autor los documenta con transparencia, incluyendo el hecho de que un modelo base sin entrenar cuatro veces mayor (Qwen3.5-4B) obtiene mejores resultados en las mismas tareas. No esta afiliado, respaldado ni patrocinado por OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivado de MiniCPM-V-4.7-1B; ajuste fino LoRA sobre el modelo de lenguaje |
| Parametros totales | 10.223.616 en safetensors (adaptador LoRA); modelo base de aproximadamente 1B; no disponible el desglose completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de referencia (`-c 8192`) |
| Tipos de cuantizacion | GGUF Q8_0 (probado); el repositorio GGUF asociado incluye otras variantes; LoRA en F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF (llama.cpp); incluye mmproj F16 para el codificador visual |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA (rango 16, alpha 32, dropout 0.05) aplicado sobre las capas de atencion del modelo de lenguaje de MiniCPM-V-4.7-1B, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. El adaptador se puede cargar en tiempo de ejecucion sobre los pesos base (`--lora`) o bien usar la version fusionada, en la que los tensores del adaptador se integran en los pesos base manteniendose en F16 (1,5 GB).

El entrenamiento se realizo en una RTX 4060 Laptop de 8 GB a partir de filas de pasos derivadas de nvidia/ProCUA-SFT. El modelo se entreno y evaluo con el modo de razonamiento (thinking) activado, y la plantilla de chat con thinking incorporado es obligatoria: la plantilla integrada del modelo base tiene el thinking desactivado, por lo que es necesario pasar `--chat-template-file chat_template.jinja`. El protocolo de interaccion (prompt, esquema de herramienta, rejilla de coordenadas 0-999 y formato de historial) esta fijado en `examples/run_agent.py` y en `computer_use/osworld/protocol.py`, variante de prompt `action-line`. La decodificacion de referencia usa temperatura 0.7, top-p 0.95, top-k 100 y un maximo de 4096 tokens nuevos.

## Capacidades

- Percepcion visual de capturas de pantalla de escritorio y generacion de una accion por paso.
- Llamada a una unica herramienta `computer_use` con las acciones click, type, key, scroll, drag, wait y terminate.
- Emision de una linea corta `Action: ...` antes de cada llamada, lo que facilita el parseo y la trazabilidad.
- Razonamiento en modo thinking activado durante el entrenamiento y la evaluacion.
- Coordenadas normalizadas en una rejilla de 0 a 999, independiente de la resolucion.
- Gestion de historial de pasos en el formato definido por el protocolo de entrenamiento.
- Capacidades multilingues limitadas al ingles.
- No se documentan capacidades de audio, tool calling generico fuera de `computer_use` ni agentes multi-paso mas alla de la secuencia de acciones de escritorio.

## Casos de uso

- Automatizacion de tareas de escritorio en maquinas virtuales: el modelo puede abrir carpetas, lanzar aplicaciones o navegar por menus a partir de capturas de pantalla, ejecutandose en un entorno aislado (Docker VM de OSWorld) para evitar riesgos sobre el sistema anfitrion.
- Pruebas de regresion de interfaces graficas: dado que emite acciones estructuradas y una linea `Action:` parseable, se puede integrar en pipelines que verifiquen que una GUI responde correctamente a secuencias de clicks y teclas.
- Prototipado de agentes de uso de computador en hardware de consumo: con 8 GB de VRAM y cuantizacion Q8_0 cabe en una RTX 4060 Laptop, lo que permite iterar sobre prompts y protocolos sin infraestructura dedicada.
- Generacion de datos sinteticos de interaccion: el modo dry-run de `examples/run_agent.py` imprime las acciones sin tocar raton ni teclado, lo que sirve para recolectar trayectorias etiquetadas para otros entrenamientos.
- Educacion e investigacion sobre agentes visuales: su tamano reducido y su documentacion detallada de resultados y fallos lo hacen util como caso de estudio de las limitaciones de los agentes de 1B en tareas de escritorio.
- Asistencia en entornos controlados de accesibilidad: puede traducir instrucciones en lenguaje natural a secuencias de acciones concretas sobre una interfaz, siempre con supervision humana y en una VM.

## Benchmarks y rendimiento

Resultados en tareas de OSWorld, ejecutados localmente en la Docker VM de OSWorld con el arnes del autor: 1 VM, 15 pasos por tarea, una captura por paso, thinking activado y una ejecucion por cifra. `held-out-99` son 99 tareas cuyos estados iniciales se eliminaron de los datos de entrenamiento; `full 360` es el subconjunto completo de 360 tareas.

| Modelo | held-out-99 | full 360 | segundos/tarea |
|---|---|---|---|
| Qwen3.5-4B (base sin entrenar, Q4_K_M, T 0.6) | 12/99 | no disponible | 224,0 |
| MiniCPM-V-4.7-1B (base sin entrenar, Q8_0, T 0.7) | 0/99 (2 fallos en el setup) | no disponible | 164,7 |
| MiniCPM-V-4.7-1B-Computer-Use (este modelo, T 0.7) | 5/99 (1 fallo en el setup) | 18/360 (4 fallos en el setup) | 168,8 / 176,3 |

Las fuentes de los numeros estan en `reports/mc-v3_heldout99_summary.json` (n 99, exito 0,0505, errores 1, temperatura 0,7, max_tokens 4096), `reports/base-minicpm_heldout99_summary.json` (n 99, exito 0,0, errores 2, temperatura 0,7) y `reports/mc-v3_full360_summary.json` (n 360, exito 0,05, errores 4, mediana 176,3 s/tarea). El registro de la ejecucion de Qwen3.5-4B no se distribuye.

## Requisitos de hardware

- VRAM estimada: el modelo se probo en una RTX 4060 Laptop de 8 GB con cuantizacion Q8_0, `--load-mode none` y `--cache-ram 512` para mantener baja la RAM del sistema.
- GPU recomendadas: RTX 4060 Laptop (8 GB) como minimo validado; cualquier GPU consumer con 8 GB o mas deberia ser suficiente para Q8_0.
- Cabe en GPU consumer: si, segun la evidencia del autor en una RTX 4060 Laptop.
- Opciones de despliegue: llama.cpp (llama-server b12032 o posterior), LM Studio y Ollama; el repositorio GGUF asociado permite `llama-server -hf ...:Q8_0 --jinja -ngl 99 -c 8192 --port 8091` y `ollama run hf.co/...:Q8_0`.
- Latencia y throughput: aproximadamente 168,8 segundos por tarea en held-out-99 y 176,3 segundos por tarea (mediana) en full 360, con 15 pasos por tarea y una captura por paso; no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (held-out-99) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Computer-Use | ~1B (base) | 8192 | 5/99 | apache-2.0 | Hugging Face (safetensors, GGUF) |
| MiniCPM-V-4.7-1B (base sin entrenar) | ~1B | no disponible | 0/99 | no disponible | Hugging Face (openbmb) |
| Qwen3.5-4B (base sin entrenar) | ~4B | no disponible | 12/99 | no disponible | no disponible en la informacion proporcionada |

La comparacion directa disponible es limitada: solo se ofrecen cifras de estos tres modelos en el mismo arnes. Un modelo base sin entrenar de cuatro veces mas tamano supera a este ajuste fino, lo que indica que la escala del modelo base es un factor determinante en esta tarea.

## Limitaciones y advertencias

- Un modelo base sin entrenar cuatro veces mayor (Qwen3.5-4B) obtiene 12/99 frente a 5/99 de este modelo en las mismas tareas; el ajuste fino no cierra esa brecha.
- Una sola ejecucion por cifra: el ruido entre ejecuciones es de aproximadamente mas o menos 2 tareas. Dos ejecuciones en un conjunto de desarrollo de 60 tareas resolvieron 5 y 4 tareas y solo compartieron 1, por lo que 5/99 debe leerse como "5, mas o menos 2".
- Los numeros no son comparables con la tabla de clasificacion de OSWorld: las cifras publicadas usan 369 tareas y 50-100 pasos por tarea, mientras que aqui se usan 15 pasos y una captura por paso.
- La cifra limpia es `held-out-99`; en full 360, 260 tareas comparten estado inicial con los datos de entrenamiento, por lo que su puntuacion esta inflada y no debe compararse con cifras publicadas.
- Los fallos de setup de tarea se cuentan como no resueltos y nunca se descartan: 1 tarea en held-out-99 y 4 en full 360 fallaron en el setup y permanecieron fallidas tras el reintento permitido.
- Debilidad conocida: el modelo a menudo se detiene demasiado pronto o no termina la tarea; llama a `terminate` antes de alcanzar el objetivo y rara vez completa tareas multi-paso en aplicaciones de oficina.
- Idioma limitado al ingles.
- Es un modelo no oficial, no afiliado, respaldado ni patrocinado por OpenBMB.
- Riesgo de alucinacion y de acciones erroneas sobre la interfaz: el modo de ejecucion real (`--execute`) toca raton y teclado, por lo que debe usarse en una maquina virtual.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento medido es bajo para produccion sin supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/minicpm-v-4.7-1b-computer-use
- Repositorio GGUF: https://huggingface.co/banyohavlusu23/MiniCPM-V-4.7-1B-Computer-Use-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/ProCUA-SFT
- Paper referenciado en los tags: arxiv:2606.17321 (no disponible el titulo en la informacion proporcionada)
