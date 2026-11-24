# lixirui142/FlowR2A

## Resumen

FlowR2A es un planificador generativo multimodal para conduccion autonoma desarrollado por Xirui Li, Zhe Liu, Xiaoqing Ye, Wenhua Han, Yifeng Pan, Junyu Han y Hengshuang Zhao (HKU-Sail), presentado en NeurIPS 2026. El modelo reformula el problema de planificacion de trayectorias: en lugar de tratar las recompensas de simulacion como objetivos discriminativos (como hacen los planificadores basados en scoring), las convierte en condiciones generativas, aprendiendo la distribucion p(a|r) de acciones condicionada por recompensa mediante flow matching.

La arquitectura combina un codificador de percepcion Transfuser (camaras multivista y LiDAR en BEV), un codificador de recompensas que inyecta senales de seguridad, progreso, confort y cumplimiento de normas mediante adaptive layer norm, un decodificador de acciones basado en transformer con atencion cruzada a los tokens de escena, y un selector de modos que puntua las propuestas generadas. El resultado es un unico modelo que unifica la supervision densa de los metodos de scoring con la generacion dinamica de propuestas de los metodos basados en anclas.

El checkpoint publicado (`flowr2a_s2.ckpt`, 31,3 GB) corresponde a la etapa 2 de entrenamiento e incluye todos los componentes. Segun la model card, alcanza resultados de estado del arte en los benchmarks cerrados de NAVSIM v1 (PDMS 90,0 con propuesta unica y 92,8 con 60 propuestas) y NAVSIM v2 (EPDMS 88,9), con un backbone ligero. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con flow matching: Transfuser (percepcion) + reward encoder + decodificador de acciones con AdaLN + mode selector |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de conduccion autonoma, sin soporte linguistico declarado) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) |
| Tamano del repositorio | 31,3 GB |
| Framework | PyTorch |
| Benchmark objetivo | NAVSIM v1 y v2 |

## Arquitectura y entrenamiento

FlowR2A se compone de cuatro modulos. El codificador de percepcion es un backbone Transfuser que procesa camaras multivista y LiDAR en representacion BEV, generando tokens de escena y de agentes. El codificador de recompensas embebe las senales de simulacion (seguridad, progreso, confort y cumplimiento de normas) en un vector de condicion que se inyecta mediante adaptive layer norm; admite classifier-free guidance mediante dropout de recompensa. El decodificador de acciones es un transformer con self-attention sobre los puntos de la trayectoria y cross-attention a los tokens de escena, condicionado por embeddings de recompensa y de tiempo a traves de AdaLN, y entrenado con una perdida de velocity matching sobre pares densos accion-recompensa. Finalmente, un selector de modos ligero puntua las propuestas generadas y se entrena con etiquetado online en simulacion.

La innovacion central es el replanteamiento de las recompensas como condiciones generativas en lugar de objetivos discriminativos, lo que obliga al planificador a internalizar la relacion entre una accion y sus consecuencias en seguridad, progreso, confort y cumplimiento de normas. El entrenamiento se realiza en dos etapas; el checkpoint publicado corresponde a la etapa 2. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Planificacion de trayectorias multimodales para conduccion autonoma en entornos urbanos simulados (NAVSIM).
- Generacion condicionada por recompensa: produce acciones condicionadas a senales de seguridad, progreso, confort y cumplimiento de normas.
- Generacion de multiples propuestas de trayectoria (hasta 60 evaluadas en los resultados publicados) y seleccion de la mejor mediante el mode selector.
- Percepcion multimodal: integra camaras multivista y LiDAR en representacion BEV.
- Classifier-free guidance sobre la condicion de recompensa.
- Evaluacion en bucle cerrado sobre NAVSIM v1 y v2.
- No soporta tool calling, function calling, agentes de texto ni capacidades linguisticas o de vision general; es un modelo especializado en planificacion de conduccion.

## Casos de uso

- Investigacion en planificacion de conduccion autonoma: sirve como referencia reproducible para estudiar el paradigma reward-to-action con flow matching sobre el benchmark NAVSIM, con codigo y checkpoint publicos.
- Generacion de propuestas de trayectoria en bucle cerrado: el modelo produce multiples trayectorias candidatas y el mode selector elige la mejor, util para analizar el compromiso entre diversidad y calidad en planificadores multimodales.
- Estudio de condicionamiento por recompensa: permite experimentar con ponderaciones de seguridad, progreso, confort y cumplimiento de normas y observar como afectan a la distribucion de acciones generadas.
- Evaluacion comparativa de planificadores: al publicar resultados en NAVSIM v1 y v2 con backbone ligero, sirve como linea base para comparar metodos de scoring, basados en anclas y generativos.
- Desarrollo de sistemas de guiado con classifier-free guidance: el dropout de recompensa permite explorar el efecto del guidance en la calidad y diversidad de las trayectorias.
- Formacion y validacion de pipelines de simulacion: el modelo se integra en el pipeline de datos de NAVSIM descrito en el repositorio de GitHub para reproducir los resultados publicados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre NAVSIM (backbone ligero).

NAVSIM v1:

| Configuracion | NC | DAC | TTC | Comf. | EP | PDMS |
|---|---|---|---|---|---|---|
| Propuesta unica | 98,6 | 97,3 | 95,3 | 100 | 84,9 | 90,0 |
| 60 propuestas | 98,8 | 98,0 | 96,0 | 100 | 90,1 | 92,8 |

NAVSIM v2:

| NC | DAC | DDC | TLC | EP | TTC | LK | HC | EC | EPDMS |
|---|---|---|---|---|---|---|---|---|---|
| 98,9 | 98,1 | 99,1 | 99,7 | 91,5 | 98,5 | 95,0 | 98,3 | 65,2 | 88,9 |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint ocupa 31,3 GB en disco y corresponde a un modelo multimodal con backbone Transfuser y decodificador transformer, por lo que se requiere una GPU con memoria suficiente para cargar todos los componentes (orientativamente 24-48 GB, sin dato confirmado por el autor).
- GPU recomendadas: no especificadas en la informacion disponible; por el tamano del checkpoint y el caracter de investigacion, se orienta a GPUs de datacenter tipo A100 o H100.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del checkpoint sugiere que no cabe en GPUs de consumo de gama media sin cuantizacion, y no se documentan tipos de cuantizacion.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante el repositorio de GitHub y el pipeline de NAVSIM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos de modelos comparables de planificacion en NAVSIM (por ejemplo, planificadores basados en scoring o en anclas) que permitan una tabla cuantitativa fiable. La model card afirma alcanzar estado del arte en bucle cerrado en NAVSIM v1 y v2 con backbone ligero, pero no incluye la comparacion numerica con alternativas.

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowR2A | no disponible | no disponible | NAVSIM v1 PDMS 90,0 / 92,8; v2 EPDMS 88,9 | MIT | Hugging Face + GitHub |
| Alternativas de planificacion en NAVSIM | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en conduccion autonoma: no es un modelo de lenguaje y no ofrece generacion de texto, codigo ni capacidades conversacionales.
- Resultados limitados al simulador NAVSIM: el rendimiento en bucle cerrado en simulacion no garantiza transferencia a vehiculos reales ni a otros entornos.
- No se documentan sesgos, pero al entrenarse sobre datos de simulacion puede heredar los sesgos de distribucion del dataset subyacente, no descrito en la informacion disponible.
- Riesgo de alucinacion en el sentido de generar trayectorias no validas fisicamente; el mode selector mitiga parcialmente este riesgo pero no lo elimina.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y la falta de validacion fuera de simulacion desaconsejan su uso directo en produccion sin evaluacion adicional.
- El checkpoint publicado corresponde solo a la etapa 2; no se documentan pesos intermedios ni procedimientos de reentrenamiento completos.
- La fecha del paper (arXiv 2606.24231) y del checkpoint son posteriores a la informacion de referencia habitual; conviene verificar su disponibilidad real.

## Enlaces

- Hugging Face: https://huggingface.co/lixirui142/FlowR2A
- Paper (arXiv): https://arxiv.org/abs/2606.24231
- Pagina del proyecto: https://lixirui142.github.io/flowr2a-ad/
- Codigo (GitHub): https://github.com/hku-sail/FlowR2A
