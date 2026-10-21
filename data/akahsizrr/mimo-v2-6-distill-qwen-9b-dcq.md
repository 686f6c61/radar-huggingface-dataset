# Akahsizrr/mimo-v2.6-distill-qwen-9b-dcq

## Resumen

MiMo-V2.6-Distill-Qwen-9B — DCQ es un conjunto de variantes cuantizadas a 4, 3 y 2 bits del modelo base `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, publicadas por el usuario Akahsizrr. No es un modelo nuevo: es un artefacto de investigacion sobre cuantizacion post-entrenamiento (Drift-Correcting Quantization, DCQ) construido especificamente para arquitecturas hibridas con bloques recurrentes Gated DeltaNet y atencion completa periodica, donde los metodos clasicos basados en magnitud de activaciones fallan.

El interes tecnico esta en el metodo, no en el modelo: el cuantizador aprende los redondeos con un estimador straight-through sobre la perdida funcional real del bloque, anade un termino de anclaje del estado recurrente final y optimiza en bucle cerrado sobre las entradas ya producidas por el prefijo cuantizado. La model card reporta resultados de humo (20 ejemplos) en MMLU y GSM8K en modo thinking, donde w4 iguala practicamente al baseline bf16 en GSM8K (0,85) y w3mix conserva 0,70 frente al colapso de GPTQ W3 (0,35).

Es relevante ahora por dos motivos contrapuestos: demuestra que la asignacion de bits por rol (qkv a 4 bits, proyecciones a/b en bf16) preserva calidad donde la cuantizacion uniforme se destruye, pero tambien advierte de que el empaquetado entero aun no esta implementado y los pesos se serializan en bf16, por lo que hoy no ofrece ninguna ventaja de memoria en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: bloques recurrentes Gated DeltaNet (GDN) + atencion completa periodica (transformer hibrido) |
| Parametros totales | 9B (segun el nombre del modelo; no confirmado de forma explicita en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la evaluacion se realizo con contexto de 32768 tokens |
| Tipos de cuantizacion | Post-entrenamiento aprendida (lattice int+escala): `w4` (4 bits g128 en todas las lineales), `w3mix` (3 bits por defecto, `in_proj_qkv` a 4 bits, `in_proj_a/b` en bf16), `w2mix` (2 bits por defecto, qkv + `q_proj` a 4 bits, a/b en bf16) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 (declarada por el publicador; verificar la licencia del modelo base) |
| Formato de pesos | `safetensors`; pesos almacenados en bf16 sobre el lattice aprendido, sin empaquetado entero implementado |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida: la mayor parte de las capas son bloques recurrentes Gated DeltaNet, que mantienen un estado recurrente en lugar de una cache KV completa, intercalados con capas de atencion completa periodicas. Esta estructura es la razon de ser del cuantizador DCQ: el error de cuantizacion no solo afecta a la salida de cada capa, sino que se propaga y se acumula a traves del bucle recurrente, de modo que los metodos que solo miran la magnitud de activaciones (AWQ) o aproximaciones de Hessiana (GPTQ) no capturan el fallo real.

Sobre el entrenamiento original (numero de tokens, composicion del corpus, si hubo RLHF/DPO, identidad del profesor en la destilacion) la model card no aporta ningun dato; el sufijo "Distill-Qwen" sugiere destilacion a partir de un modelo Qwen, pero no se detalla. Lo que si se documenta es el proceso de cuantizacion: (1) redondeos y escalas por grupo optimizados con straight-through estimator sobre la perdida funcional del bloque; (2) anclaje del estado recurrente, anadiendo el rel-MSE del estado final de las capas GDN a la funcion de perdida; (3) objetivo correctivo en bucle cerrado, donde cada capa optimiza sobre entradas generadas por el prefijo ya cuantizado; (4) region de confianza que penaliza alejarse de los pesos originales (sin ella, 3 bits colapsa de extremo a extremo); y (5) asignacion de bits por rol guiada por una tabla empirica de sensibilidad por tensor. La calibracion usa WikiText-2 train, semilla 20261020, 16 ventanas de 512 tokens, disjuntas de los benchmarks. El codigo acompania al release: `quant_lab/quant_learned.py`, `sens_probe.py`, `probe_gdn.py`, `eval_openai.py` y `dequant_to_bf16.py`.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (`enable_thinking: true` es la configuracion usada en la evaluacion).
- Razonamiento matematico de varios pasos: GSM8K 0,85 en la variante w4, identico al baseline bf16 en la muestra de 20 ejemplos.
- Conocimiento general y respuesta a preguntas tipo MMLU: 0,80 en w4, 0,55 en w3mix.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible (no documentado).
- Capacidades multilingues: no disponible (la model card no declara idiomas soportados).
- Capacidades especiales: modo thinking; ventana de evaluacion de 32768 tokens; sin vision ni audio documentados.
- Funcionalidad practica: script de dequantizacion a bf16 incluido para recuperar pesos utilizables en runners estandar.

## Casos de uso

- Investigacion en cuantizacion de arquitecturas hibridas: el repositorio sirve como caso de estudio reproducible de por que los metodos basados en magnitud de activaciones fallan en bucles recurrentes; util para grupos que trabajen en compresion de modelos SSM o hibridos.
- Reproduccion de los experimentos de sensibilidad: `sens_probe.py` y `probe_gdn.py` permiten replicar la tabla de sensibilidad por tensor con la misma semilla y el mismo conjunto de calibracion (WikiText-2, 16 x 512 tokens).
- Auditoria de tecnicas de asignacion de bits por rol: comparar `w4`, `w3mix` y `w2mix` sobre el mismo modelo base aísla el efecto de mantener `in_proj_a/b` en bf16 frente a cuantizarlos.
- Evaluacion de degradacion en razonamiento matemático bajo compresion: GSM8K se mantiene en 0,85 hasta w4 mientras MMLU cae a 0,80, lo que permite estudiar que tipos de tarea son mas sensibles al error de cuantizacion.
- Base para implementar el empaquetado entero: `quant_learned_log.json` registra por tensor el formato empaquetado (enteros + escalas), de modo que un equipo puede completar el packing y medir la ganancia real de memoria.
- Despliegue experimental en SGLang: la evaluacion se hizo con SGLang en modo thinking y contexto 32768, por lo que es el camino validado para servir estas variantes hoy (cargando los pesos en bf16).
- Generacion de codigo y tareas de asistencia tecnica: no hay benchmarks de codigo publicados, por lo que solo es recomendable tras validacion propia contra el baseline bf16.

## Benchmarks y rendimiento

Resultados de humo con 20 ejemplos, SGLang, modo thinking, semilla 20261020. El propio autor los califica de direccionales por el tamano de muestra.

| Modelo | MMLU | GSM8K |
|---|---|---|
| BF16 baseline | 0,90 | 0,85 |
| DCQ w4 | 0,80 | 0,85 |
| DCQ w3mix | 0,55 | 0,70 |
| ParoQuant W4 | 0,75 | 0,85 |
| GPTQ W4 | 0,75 | 0,80 |
| GPTQ W3 | 0,45 | 0,35 |
| AWQ W4 | 0,00 | 0,00 |
| GPTQ / DCQ W2 uniforme | ~0 | ~0 |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU-Pro, tareas multimodales) en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 37,7 GB en total, con tres variantes (`w4`, `w3mix`, `w2mix`); aproximadamente 12 GB por variante como referencia de descarga.
- VRAM en el estado actual: al no estar implementado el empaquetado entero, los tensores se guardan en bf16, por lo que cargar una variante exige del orden de 9B x 2 bytes ≈ 18 GB solo en pesos, mas overhead de runtime y cache (estimacion; no verificado por el autor).
- VRAM si se completa el packing (estimacion aritmetica, no medida): w4 ≈ 4,5 GB, w3mix ≈ 3,7 GB, w2mix ≈ 2,9 GB, mas los tensores que quedan en bf16 en las variantes mixtas.
- GPU consumer: una RTX 4090 (24 GB) podria alojar una variante en su estado bf16 actual de forma muy ajustada y con contexto corto; el KV cache a 32768 tokens anade presion adicional. Con packing implementado, cabrian con holgura en 8-12 GB.
- GPU de datacenter: A100 40/80 GB y H100 son suficientes para cualquier variante incluso sin packing; util para reproducir la evaluacion en SGLang con contexto 32768.
- Opciones de despliegue: SGLang es el unico runner validado por el autor; existe `dequant_to_bf16.py` para reconstruir pesos en bf16 y usar vLLM, TGI o llama.cpp (conversion a GGUF no documentada ni verificada). Ollama no esta soportado de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Comparativa dentro del mismo modelo base, que es donde el release aporta datos:

| Variante / metodo | Bits efectivos | MMLU | GSM8K | Estado de serializacion | Licencia |
|---|---|---|---|---|---|
| BF16 baseline (`XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`) | 16 | 0,90 | 0,85 | Pesos completos en safetensors | No disponible en la informacion |
| DCQ w4 | 4 (g128) | 0,80 | 0,85 | bf16 sobre lattice, sin packing | Apache-2.0 |
| DCQ w3mix | 3 por defecto, qkv 4, a/b bf16 | 0,55 | 0,70 | bf16 sobre lattice, sin packing | Apache-2.0 |
| GPTQ W4 | 4 | 0,75 | 0,80 | Formato GPTQ estandar | Segun el publicador |
| ParoQuant W4 | 4 | 0,75 | 0,85 | Formato propio | Segun el publicador |
| GPTQ W3 | 3 | 0,45 | 0,35 | Formato GPTQ estandar | Segun el publicador |
| AWQ W4 | 4 | 0,00 | 0,00 | Formato AWQ estandar | Segun el publicador |

Frente a alternativas de otros fabricantes en el rango de 9B (Qwen, Llama, Gemma) no hay datos comparativos en la informacion disponible; ademas, la arquitectura hibrida GDN no es directamente comparable con transformers densos en coste de inferencia a contexto largo.

## Limitaciones y advertencias

- Muestra de evaluacion minima: 20 ejemplos por benchmark. El propio autor califica los resultados de direccionales; las diferencias de 0,05-0,10 en MMLU no son estadisticamente significativas con ese tamano.
- Sin empaquetado entero implementado: los pesos se serializan en bf16, por lo que hoy el consumo de memoria y disco es equivalente al del modelo sin cuantizar. El beneficio de los 4/3/2 bits es teorico hasta que se complete el packing.
- Degradacion severa en configuraciones agresivas: w3mix pierde 0,35 puntos de MMLU frente al baseline y w2mix colapsa (~0). No usar w2mix en produccion.
- El resultado AWQ W4 = 0,00 debe interpretarse con cautela: puede reflejar una incompatibilidad del formato o del runner con la arquitectura hibrida, no solo una limitacion del metodo.
- Sesgos: no documentados. Al ser una destilacion de un modelo Qwen, hereda los sesgos del modelo base y del corpus de destilacion, no caracterizados en la model card.
- Riesgo de alucinacion: no evaluado; no hay datos de TruthfulQA ni de tasas de factualidad.
- Idiomas: no declarados. No asumir soporte multilingue sin validacion previa.
- Contexto: la longitud de contexto oficial del modelo base no se indica; 32768 es solo la configuracion usada en la evaluacion.
- Licencia: el publicador declara Apache-2.0, pero se trata de un derivado de un modelo de Xiaomi; conviene verificar los terminos del modelo base antes de uso comercial.
- Reproducibilidad: requiere SGLang con `enable_thinking: true`, semilla 20261020 y el conjunto de calibracion exacto para replicar las cifras.
- Modelo con 0 descargas y 0 likes: no hay validacion independiente de la comunidad sobre estos artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akahsizrr/mimo-v2.6-distill-qwen-9b-dcq
- Modelo base referenciado en la model card: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Codigo del cuantizador y evaluador: carpeta `quant_lab/` dentro del repositorio del modelo (`quant_learned.py`, `sens_probe.py`, `probe_gdn.py`, `eval_openai.py`, `dequant_to_bf16.py`)
- Log de cuantizacion por tensor: `quant_learned_log.json` en cada variante (`w4/`, `w3mix/`, `w2mix/`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
