# banyohavlusu23/minicpm-v-4.7-1b-computer-use

## Resumen

MiniCPM-V-4.7-1B-Computer-Use es un ajuste fino mediante LoRA del modelo vision-language MiniCPM-V-4.7-1B de OpenBMB, publicado por el usuario independiente banyohavlusu23. El objetivo es convertir un modelo base de 1B parámetros en un agente de uso de escritorio ("computer use") capaz de interpretar capturas de pantalla y emitir una única acción por paso (clic, escritura, pulsación de tecla, desplazamiento, arrastre, espera o terminación) a través de una herramienta `computer_use`. No está afiliado, respaldado ni patrocinado por OpenBMB.

El modelo se entrenó sobre filas de pasos derivadas del dataset nvidia/ProCUA-SFT, con 13.000 filas de entrenamiento, en una única GPU de portátil (RTX 4060 Laptop, 8 GB). Se distribuye con pesos en safetensors y GGUF, incluyendo un adaptador LoRA en formato GGUF para cargar sobre los pesos base en llama.cpp. El repositorio ocupa 2,3 GB y el recuento real de parámetros en safetensors es de 10.223.616, muy por debajo de lo que sugiere el nombre del modelo base, lo que indica que los safetensors publicados corresponden al adaptador LoRA y no al modelo completo.

Es relevante ahora porque explora el nicho de agentes GUI de muy bajo coste computacional, ejecutables en hardware de consumo. No obstante, sus propios resultados son modestos: 5 de 99 tareas retenidas en OSWorld, por debajo de un Qwen3.5-4B sin entrenar que logra 12 de 99. La ficha debe leerse como una evaluación honesta de un experimento de ajuste fino, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base MiniCPM-V-4.7-1B) con adaptador LoRA sobre proyecciones de atención y MLP del modelo de lenguaje; torre de visión y proyector congelados |
| Parametros totales | 10.223.616 (safetensors publicados, correspondientes al adaptador LoRA); el modelo base MiniCPM-V-4.7-1B no se detalla en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de despliegue indicada (`-c 8192`); entrenamiento con longitud máxima de secuencia de 4.096 tokens |
| Tipos de cuantizacion | GGUF: Q8_0 para el modelo base y F16 para el adaptador LoRA y el mmproj, según los archivos indicados en la model card; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (base Q8_0, mmproj F16, LoRA F16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del MiniCPM-V-4.7-1B, un modelo vision-language que procesa imágenes (capturas de pantalla) y texto para producir respuestas. El adaptador LoRA tiene rango 16, alpha 32 y dropout 0.05, aplicado sobre las proyecciones de atención y MLP del modelo de lenguaje; la torre de visión y el proyector permanecen congelados. El entrenamiento usó learning rate 5e-5, una época, longitud máxima de secuencia de 4.096 tokens (las filas más largas se descartaron, no se truncaron), batch 1 con acumulación de gradiente 16, precisión bf16 y arranque en caliente desde el adaptador anterior `adapter-mc-v2`.

El conjunto de entrenamiento consta de 13.000 filas: 4.967 filas de "keep going" tomadas de los últimos pasos de ejecuciones exitosas de ProCUA-SFT, las 1.314 filas de `terminate` del conjunto de pasos anterior y 6.719 filas de replay para mitigar el olvido catastrófico. Los datos provienen de nvidia/ProCUA-SFT (CC BY 4.0), en particular de los shards `procua_sft_00000.tar.z`. El entrenamiento se realizó en una RTX 4060 Laptop de 8 GB. No se menciona RLHF ni DPO; el ajuste es supervisado sobre trayectorias de agente. La innovación destacable es el formato de salida restringido: una línea corta `Action: ...` que invoca una única herramienta `computer_use` por paso, con una rejilla de coordenadas 0–999 y un protocolo de prompt e historial fijos (`computer_use/osworld/protocol.py`, variante `action-line`).

## Capacidades

- Interpretación de capturas de pantalla de escritorio para decidir la siguiente acción del agente.
- Emisión de una acción por paso mediante la herramienta `computer_use`: clic, escritura, pulsación de tecla, desplazamiento, arrastre, espera y terminación.
- Formato de salida estructurado en una línea `Action: ...`, diseñado para ser parseado por un arnés de agente.
- Modo de pensamiento ("thinking") activado durante entrenamiento y evaluación; requiere la plantilla de chat original para funcionar como se entrenó.
- Soporte de tool calling limitado a la herramienta `computer_use` descrita en el protocolo.
- Capacidad de razonamiento multi-paso dentro de una tarea, aunque con la limitación conocida de terminar demasiado pronto.
- Multilingüe: solo inglés declarado.
- No se documentan capacidades de visión general, audio, matemáticas avanzadas ni generación de código más allá de lo necesario para el agente GUI.

## Casos de uso

- Automatización de tareas de escritorio en máquinas virtuales: el modelo puede conectarse a un arnés como el de `examples/run_agent.py` para ejecutar acciones sobre una VM aislada, aprovechando su bajo requisito de VRAM (8 GB) para entornos de prueba.
- Investigación en agentes GUI de bajo coste: sirve como referencia de ajuste fino LoRA sobre un modelo de 1B para estudiar límites de rendimiento en OSWorld con hardware de consumo.
- Pruebas de protocolos de agente: su formato de acción único por paso y su rejilla de coordenadas 0–999 lo hacen útil para validar arneses de evaluación y parseo de acciones.
- Experimentos de destilación o imitación: al estar entrenado sobre ProCUA-SFT, puede usarse como punto de partida para estudiar el olvido catastrófico y técnicas de replay en modelos pequeños.
- Prototipado de asistentes de escritorio en modo dry-run: permite imprimir acciones sin tocar ratón ni teclado, útil para depurar prompts y plantillas de chat en pipelines de CI.
- Docencia y demostraciones: su reducido tamaño y su licencia Apache 2.0 facilitan su uso en cursos sobre agentes vision-language y despliegue con llama.cpp.
- No se recomienda para atención al cliente, generación de código en producción ni tareas de oficina multi-paso, dada su baja tasa de éxito y su tendencia a terminar antes de alcanzar el objetivo.

## Benchmarks y rendimiento

Resultados en tareas de OSWorld, ejecutados localmente en la VM Docker de OSWorld con el arnés del autor: 1 VM, 15 pasos por tarea, una captura por paso, thinking activado, una ejecución por número. `held-out-99` son 99 tareas cuyos setups iniciales se eliminaron de los datos de entrenamiento. `full 360` son las 360 tareas del subconjunto de OSWorld del autor.

| Modelo | held-out-99 | full 360 | segundos/tarea |
|---|---|---|---|
| Qwen3.5-4B (base sin entrenar, Q4_K_M, T 0.6) | 12/99 | – | 224,0 |
| MiniCPM-V-4.7-1B (base sin entrenar, Q8_0, T 0.7) | 0/99 (2 fallos en setup) | – | 164,7 |
| MiniCPM-V-4.7-1B-Computer-Use (este modelo, T 0.7) | 5/99 (1 fallo en setup) | 18/360 (4 fallos en setup) | 168,8 / 176,3 |

Fuentes indicadas por el autor: `reports/mc-v3_heldout99_summary.json` (n 99, éxito 0,0505, errores 1, temperatura 0,7, max_tokens 4096, prompt action-line), `reports/base-minicpm_heldout99_summary.json` (n 99, éxito 0,0, errores 2, temperatura 0,7), `reports/mc-v3_full360_summary.json` (n 360, éxito 0,05, errores 4, mediana 176,3 s/tarea) y el log propio del baseline Qwen (éxito 0,1212, temperatura 0,6; no incluido en el repo).

Advertencias del autor sobre estas cifras: el ruido entre ejecuciones es de aproximadamente ±2 tareas, por lo que 5/99 debe leerse como "5, más o menos 2"; los números no son comparables con la tabla de OSWorld publicada, que usa 369 tareas y 50–100 pasos por tarea; `held-out-99` es la cifra limpia, mientras que en el full 360 hay 260 tareas que comparten setup con los datos de entrenamiento, por lo que esa puntuación está inflada; los fallos de setup se cuentan como no resueltos y nunca se descartan.

## Requisitos de hardware

- VRAM estimada: el autor entrenó en una RTX 4060 Laptop de 8 GB y probó el despliegue en la misma máquina; el modelo base en Q8_0 más el adaptador LoRA F16 y el mmproj F16 caben en 8 GB de VRAM con `-ngl 99`.
- GPU recomendadas: RTX 4060 Laptop (8 GB) como mínimo probado; GPUs de consumo con 8 GB o más de VRAM son suficientes para Q8_0. No se documentan requisitos para otras cuantizaciones.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM según la configuración probada.
- Opciones de despliegue: llama.cpp (`llama-server` build b12032 o superior) con `--mmproj`, `--lora`, `--chat-template-file chat_template.jinja`, `--jinja`, `--parallel 1`, `--no-webui`, `--load-mode none`, `--cache-ram 512`, `-ngl 99`, `-c 8192`, puerto 8091. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: mediana de 176,3 s/tarea y 168,8 s/tarea en las configuraciones reportadas, con 15 pasos por tarea y una captura por paso. No se proporcionan tokens por segundo.
- Muestreo recomendado: temperatura 0,7, top-p 0,95, top-k 100, thinking activado, máximo 4096 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | held-out-99 (OSWorld) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Computer-Use | 10.223.616 (adaptador LoRA); base no detallado | 8.192 tokens en despliegue | 5/99 | Apache 2.0 | Hugging Face, GGUF y safetensors |
| Qwen3.5-4B (base sin entrenar) | no disponible en la información | no disponible | 12/99 | no disponible | no disponible |
| MiniCPM-V-4.7-1B (base sin entrenar) | no disponible en la información | no disponible | 0/99 | no disponible | Hugging Face (openbmb/MiniCPM-V-4.7-1B) |

No se dispone de datos de otros agentes GUI comparables en la información proporcionada. La comparativa se limita a los dos baselines medidos por el autor en el mismo arnés.

## Limitaciones y advertencias

- Rendimiento inferior a un modelo base sin entrenar de mayor tamaño: Qwen3.5-4B obtiene 12/99 frente a 5/99 de este modelo en las mismas tareas; el ajuste fino no cerró la brecha.
- Alta varianza: una ejecución por número, con ruido de ±2 tareas; dos ejecuciones en un conjunto de desarrollo de 60 tareas resolvieron 5 y 4 tareas y solo compartieron 1.
- No comparable con la tabla de OSWorld publicada: el arnés usa 15 pasos y una captura por paso, frente a 369 tareas y 50–100 pasos en la evaluación oficial.
- El full 360 está inflado: 260 de 360 tareas comparten setup con los datos de entrenamiento.
- Debilidad conocida: el modelo a menudo llama a `terminate` antes de alcanzar el objetivo y rara vez completa tareas multi-paso en aplicaciones de oficina.
- Solo inglés declarado; no se documenta soporte multilingüe.
- Requiere la plantilla de chat original (`chat_template.jinja`) con thinking activado; el template integrado en el GGUF tiene el thinking desactivado y produce un comportamiento distinto al entrenado.
- Es un modelo no oficial, no afiliado a OpenBMB; la licencia Apache 2.0 se aplica al artefacto publicado, pero el uso comercial debe evaluarse junto con las condiciones del modelo base.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la selección de coordenadas; no se documentan sesgos específicos.
- Fallos de setup en la evaluación (1 en held-out-99, 4 en full 360) se cuentan como no resueltos, lo que reduce la puntuación reportada.
- El recuento de parámetros en safetensors (10,2 M) corresponde al adaptador LoRA, no al modelo completo; los requisitos de VRAM reales dependen de los pesos base de MiniCPM-V-4.7-1B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/minicpm-v-4.7-1b-computer-use
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/ProCUA-SFT
- Referencia arXiv citada en los tags: arxiv:2606.17321 (no se dispone de URL verificada en la información proporcionada)
- Repositorio de OSWorld: no disponible en la información proporcionada
- llama.cpp: no disponible en la información proporcionada
