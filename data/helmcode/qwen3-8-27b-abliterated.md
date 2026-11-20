# Helmcode/Qwen3.8-27B-Abliterated

## Resumen

Qwen3.8-27B-Abliterated es una variante "abliterated" (sin censura) del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por Helmcode. La intervención aplica la técnica de abliteración direccional descrita por Arditi et al. (2024) para eliminar quirúrgicamente la dirección de rechazo general del modelo, preservando sus capacidades originales. El resultado es un modelo que cumple peticiones que la versión base rechaza, especialmente en contextos de ciberseguridad profesional.

El modelo conserva la arquitectura y el tamaño del base: aproximadamente 27.780 millones de parámetros en formato BF16, con pipeline image-text-to-text (multimodal), capacidad de razonamiento explícito (thinking mode) y pesos publicados en safetensors. El repositorio ocupa 55,6 GB e incluye variantes cuantizadas NVFP4 y GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0) para despliegue en GPU y CPU.

Su relevancia radica en que documenta de forma medible el efecto de la abliteración: elimina los rechazos en peticiones de ciberseguridad profesional (de 10% a 0%) manteniendo en gran medida los rechazos ante peticiones de daño claro (95-100%) y sin degradación estadísticamente significativa en MMLU-Pro (66,4% base frente a 66,1% abliterado, p=0,86). Es un caso de estudio útil tanto para investigación en seguridad de modelos como para despliegues que requieran baja sobre-negativa en dominios técnicos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona un cap de generacion de 24.576 tokens en reasoning) |
| Tipos de cuantizacion | BF16 (referencia), NVFP4/FP8_DYNAMIC mixto, GGUF Q4_K_M (16,7 GB), Q5_K_M (19,3 GB), Q6_K (22,1 GB), Q8_0 (28,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16), NVFP4, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de ~27,8 B de parametros con soporte de razonamiento (thinking mode) y entrada image-text-to-text. Sobre ese checkpoint se aplica abliteración direccional: se extrae una direccion de rechazo general por modo de razonamiento (thinking ON y OFF) como diferencia de medias sobre 78 prompts dañinos frente a 138 benignos, en el sitio estable de cada modo (thinking-OFF: capa 62, posicion 0 de plantilla; thinking-ON: capa 63, posicion 3). Los sitios de maxima señal se descartaron mediante compuertas KL por destruir el modelo; las direcciones limpias quedan una capa por debajo del pico de señal.

La cirugia es de rango 2: ambas direcciones se ortogonalizan fuera de los 128 escritores residuales y de `embed_tokens` (129 tensores modificados, con una cuota residual maxima del 1,49% frente a un limite del 5%). `lm_head` no se toca y `tie_word_embeddings` es falso. La validacion incluye compuertas relativas por escritor (PASS) y verificacion de deriva en benchmarks estadisticamente nula (McNemar p=0,86 sobre 560 preguntas, con -2 netas). No se documentan en la informacion disponible los datos de preentrenamiento del modelo base (numero de tokens, composicion del dataset) ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento explicito con thinking mode (niveles `reasoning_effort`: xhigh, medium, low).
- Procesamiento multimodal image-text-to-text (entrada de imagenes y texto).
- Respuesta a peticiones de ciberseguridad profesional: pentest, analisis de malware, blue team y reversing (0% de rechazos medidos frente al 10% del base).
- Cumplimiento de peticiones "cyber-hard" agresivas: 70-80% de cumplimiento con thinking OFF y 57% de cumplimiento sobre las medibles con thinking ON.
- Mantenimiento de rechazos ante daño claro (stalking, fraude, armas, acoso): 95% con thinking OFF y 100% con thinking ON.
- Cero sobre-rechazo medido en prompts benignos (0% en base y en variante).
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el thinking mode y el parser de razonamiento `qwen3` en vLLM facilitan flujos multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Pruebas de penetracion autorizadas: el modelo entrega metodologia completa (por ejemplo, nmap) ante peticiones de pentest que el base rechaza; util para equipos de seguridad que necesitan asistencia sin friccion en entornos controlados.
- Analisis de malware y reversing: permite solicitar explicaciones de tecnicas, desempaquetado o comportamiento de muestras sin rechazos, agilizando triaje en laboratorios aislados.
- Formacion y concienciacion en ciberseguridad: genera escenarios de ataque realistas (phishing, tecnicas de exfiltracion) para entrenar a defensores, con la advertencia de uso responsable.
- Investigacion en seguridad de modelos: sirve como referencia reproducible para estudiar el efecto de la abliteracion sobre tasas de rechazo, deriva de benchmarks y selectividad de direcciones.
- Despliegue en CPU con GGUF: la variante Q4_K_M (16,7 GB) permite ejecutar el modelo con `llama-server --jinja` en hardware sin GPU, manteniendo el comportamiento abliterado medido en GPU.
- Servicio de inferencia de alto rendimiento: con vLLM (`--max-num-seqs 128` por la cache GDN hibrida de 606 bloques) y parser de razonamiento `qwen3` para aplicaciones que requieran thinking mode con contexto largo.
- Evaluacion comparativa de cuantizaciones: las variantes NVFP4 y GGUF permiten medir el coste de precision (65,4% frente a 66,1% en MMLU-Pro para NVFP4) en pipelines de investigacion.

## Benchmarks y rendimiento

| Benchmark | Base | Abliterated BF16 | Abliterated NVFP4 |
|---|---|---|---|
| MMLU-Pro (560 preguntas, greedy) | 66,4% | 66,1% (p=0,86) | 65,4% (p=0,37) |
| Ciberseguridad profesional (rechazos) | 10% | 0% | comportamiento identico en serving |
| Daño claro (rechazos, thinking OFF) | 100% | 95% | no disponible |
| Daño claro (rechazos, thinking ON) | 100% | 100% | no disponible |
| Cyber-hard (cumplimiento, thinking OFF) | 0% | 70-80% | no disponible |
| Cyber-hard (cumplimiento, thinking ON) | 0% | 57% de las medibles | no disponible |
| Sobre-rechazo benigno | 0% | 0% | no disponible |

Notas de medicion: las tasas de rechazo estan puntuadas manualmente contra una rubrica publicada (COMPLY = sustancia entregada aunque con matices; REFUSE = nunca entregada, incluyendo avisos o alternativas). n=10 por familia (IC Wilson 95% [12%, 75%] en la familia mas pequeña); la estimacion con mayor potencia para cyber-hard thinking-ON es 12% de rechazos (n=90, IC [4%, 25%]). Se declaran 3/10 generaciones truncadas por alcanzar el cap de 24.576 tokens en cyber-hard thinking-ON.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 55,6 GB de pesos, por lo que se necesitan 60-80 GB de VRAM para inferencia comoda (A100 80 GB, H100 80 GB, H200).
- VRAM para NVFP4: el checkpoint mixto FP8/NVFP4 reduce el peso a la mitad aproximadamente; cabe en GPUs de 40-48 GB (A100 40 GB, L40S, RTX 6000 Ada) segun configuracion de serving.
- VRAM para GGUF: Q4_K_M (16,7 GB) cabe en RTX 4090 (24 GB) y RTX 3090; Q5_K_M (19,3 GB) tambien en 24 GB; Q6_K (22,1 GB) al limite en 24 GB; Q8_0 (28,6 GB) requiere 32 GB o mas (RTX 5090, A6000).
- CPU: las variantes GGUF permiten inferencia en CPU con `llama-server --jinja`; el rendimiento depende del hardware y no se documenta.
- Despliegue GPU: vLLM con `--max-num-seqs 128` obligatorio (la cache GDN hibrida tiene 606 bloques frente a los 1024 por defecto) y parser de razonamiento `qwen3`; thinking ON por defecto.
- Despliegue CPU/local: llama.cpp con `--jinja` para plantilla de chat y separacion correcta de `reasoning_content`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Helmcode/Qwen3.8-27B-Abliterated | ~27,8 B | no disponible | 66,1% | Apache 2.0 | HF (BF16, NVFP4, GGUF) |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | no disponible | 66,4% | Apache 2.0 | HF |
| Helmcode/Qwen3.8-27B-Abliterated-NVFP4 | ~27,8 B | no disponible | 65,4% | Apache 2.0 | HF |
| Helmcode/Qwen3.8-27B-Abliterated-GGUF | ~27,8 B | no disponible | no disponible | Apache 2.0 | HF |

No se dispone de datos de benchmarks de modelos abliterated comparables de otros autores en la informacion proporcionada; la comparativa se limita a las variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- El modelo cumple peticiones que el base rechaza, incluidas peticiones "cyber-hard" agresivas (70-80% con thinking OFF); el autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- Aunque los rechazos ante daño claro se mantienen en gran medida (95-100%), existe una fraccion residual de cumplimiento (hasta 5% con thinking OFF) ante peticiones de stalking, fraude, armas o acoso.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de ~28 B.
- Las tasas de rechazo se midieron con n=10 por familia, con intervalos de confianza amplios (IC Wilson 95% [12%, 75%] en la familia mas pequeña); las cifras deben interpretarse como estimaciones, no como valores exactos.
- La direccion de rechazo general solapa fuertemente con la de cyber-hard (cos 0,64-0,79); los intentos de variantes selectivas (eliminar solo el rechazo cyber) fallaron las compuertas de calidad en todos los sitios estables.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; el cap de generacion de reasoning es de 24.576 tokens, lo que puede truncar cadenas de razonamiento largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso en dominios de ciberseguridad ofensiva puede infringir normativa local; verificar cumplimiento legal antes de produccion.
- En vLLM es obligatorio ajustar `--max-num-seqs 128`; con la configuracion por defecto el modelo puede fallar por insuficiencia de bloques de cache.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Helmcode/Qwen3.8-27B-Abliterated
- Variante NVFP4: https://huggingface.co/Helmcode/Qwen3.8-27B-Abliterated-NVFP4
- Variante GGUF: https://huggingface.co/Helmcode/Qwen3.8-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper del metodo (Arditi et al., NeurIPS 2024): https://arxiv.org/abs/2406.11717
- Referencia de automatizacion Heretic: https://github.com/p-e-w/heretic
