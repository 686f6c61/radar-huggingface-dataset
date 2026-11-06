# Jeesup/svd-safety-l2_hisvd_jbbresp13_r40

## Resumen

`svd-safety-l2_hisvd_jbbresp13_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante HiSVD, una tecnica de descomposicion en valores singulares (SVD) aplicada a los pesos del transformer, y posteriormente recuperado con la etapa 2 de SVD-LLM basada en LoRA secuencial (U y V). El resultado es un modelo que conserva el 60,47 % de los parametros densos del original (un 40 % de parametros eliminados), es decir, 6.738.415.616 parametros reales segun los pesos en safetensors. Lo publica el usuario Jeesup como artefacto de investigacion.

No es un modelo de proposito general ni un asistente desplegable: es una celda concreta dentro de una rejilla experimental que estudia como la compresion SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y que regla de seleccion de componentes repara mejor ese dano. El autor lo advierte explicitamente: varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base, y el objetivo es cuantificar la subida de la tasa de exito de ataques (ASR) y probar la recuperacion.

Su relevancia es metodologica: aporta un punto de medida reproducible (seed 42, calibracion fija, presupuesto del 40 %) para quien investigue compresion de modelos, interpretabilidad de la seguridad o el compromiso entre utilidad y alineamiento bajo reduccion de parametros. No hay datos publicados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con capas comprimidas via HiSVD |
| Parametros totales | 6.738.415.616 (60,47 % del denso original; 40 % eliminado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Llama-2-7b-chat soporta 4096 tokens; la calibracion uso seqlen 2048) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16 segun la receta de recuperacion) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only denso, y le aplica HiSVD (implementacion de `redai-infra/HiSVD` reimplementada en el proyecto del autor) para eliminar el 40,00 % de los parametros, dejando una fraccion de 0,6047. La calibracion se hizo con `wikitext2:256,jbb_harm_resp:13`, seqlen 2048 y seed 42, con metodo de rango "stable", modulacion logaritmica y alpha 1.0. La recuperacion posterior sigue la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 epocas, lr 1e-4, batch 64 y cutoff 256 en bf16, sobre el dataset alpaca-cleaned.

La innovacion tecnica no esta en el modelo en si, sino en el diseno experimental: la calibracion incluye 13 ejemplos de `jbb_harm_resp` (respuestas daninas de JailbreakBench), lo que sesga la seleccion de componentes hacia la preservacion de comportamiento relacionado con seguridad. El checkpoint es una celda de una rejilla que varia reglas de seleccion y presupuestos de compresion, y su proposito es medir el dano en seguridad y la eficacia de la reparacion, no ofrecer un asistente.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, con calidad degradada por la compresion y la recuperacion parcial.
- Razonamiento y respuesta a instrucciones en el nivel del base, sin garantias: no hay evaluaciones de capacidad general publicadas para esta celda.
- Sujeta a las capacidades del tokenizador y plantilla de Llama 2 (formato de chat con etiquetas `[INST]` y `<<SYS>>`).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingue especifica; los idiomas figuran como no disponibles.
- No hay modo thinking, vision ni audio.
- Uso previsto: sujeto experimental para medir el compromiso seguridad/utilidad bajo compresion SVD.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como punto de referencia del 40 % de poda por SVD para comparar con otras tecnicas (poda estructurada, cuantizacion, destilacion) midiendo perplejidad en WikiText-2 y ASR.
- Estudio de seguridad bajo compresion: reproducir la medicion de ASR con AdvBench y StrongREJECT usando el juez HarmBench para cuantificar cuanto degrada la compresion el alineamiento de Llama-2-7b-chat.
- Analisis de sobre-rechazo: emplear la metrica de sobre-rechazo macro con WildGuard (0,5516 en esta celda) para estudiar el coste de utilidad de las defensas de seguridad tras la compresion.
- Ablacion de reglas de seleccion de componentes: comparar esta celda (metodo de rango "stable", modulacion logaritmica) con otras celdas de la rejilla para determinar que regla repara mejor el comportamiento de seguridad.
- Validacion de pipelines de recuperacion LoRA: probar la etapa 2 de SVD-LLM (LoRA secuencial U/V, r=8, alpaca-cleaned) como receta reproducible sobre un base conocido.
- Docencia y divulgacion: ilustrar en un curso o articulo como una reduccion del 40 % de parametros altera simultaneamente perplejidad (10,2183 en WikiText-2) y seguridad (ASR de 0,0019 en AdvBench), con un artefacto descargable y trazable.
- Auditoria de artefactos derivados de Llama 2: verificar el cumplimiento de la Llama 2 Community License en modelos comprimidos publicados en el Hub.

## Benchmarks y rendimiento

| Metrica | Valor | Metodo |
|---|---|---|
| AdvBench ASR | 0,0019 | Juez HarmBench |
| StrongREJECT ASR | 0,0096 | Juez HarmBench |
| Sobre-rechazo macro | 0,5516 | WildGuard |
| Perplejidad WikiText-2 | 10,2183 | WikiText-2 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la informacion disponible. No se proporcionan cifras del modelo base sin comprimir para comparar directamente en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 13,5 GB solo de pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; con 16 GB de VRAM se puede intentar con cuidado, 24 GB es comodo.
- En cuantizacion de 8 bits, aproximadamente 7 GB de pesos; en 4 bits, unos 3,5-4 GB, aunque el autor no publica variantes GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y throughput alto; RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 (16 GB, justo en bf16) y en tarjetas de 12 GB solo con cuantizacion no oficial.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en principio vLLM o llama.cpp si se generan pesos compatibles, aunque no hay artefactos publicados para estos ultimos.
- Latencia y throughput: no disponibles. Al tener un 40 % menos de parametros que el base, se espera una reduccion proporcional de FLOPs por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_hisvd_jbbresp13_r40 | 6,74 B (60,47 % del base) | no disponible | Llama 2 Community | Artefacto de investigacion, ASR 0,0019 en AdvBench, perplejidad 10,2183 en WikiText-2 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B (denso completo) | 4096 tokens | Llama 2 Community | Modelo base; sin cifras de ASR ni perplejidad en esta ficha |
| Otras celdas de la rejilla del autor | 60,47 % (misma fraccion) | no disponible | Llama 2 Community | Distintas reglas de seleccion y calibracion; varias deliberadamente degradadas en seguridad |
| Modelos comprimidos con SVD-LLM (referencia del metodo) | variable | no disponible | segun base | Receta de recuperacion LoRA secuencial U/V reutilizada aqui |

No se dispone de comparaciones con alternativas de la misma categoria (modelos de 7 B comprimidos y orientados a seguridad) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente desplegable: el autor lo describe como sujeto experimental y advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad.
- La compresion por si sola eleva la tasa de exito de ataques (ASR) respecto a Llama-2-7b-chat; esta celda concreta muestra ASR bajo en AdvBench (0,0019) y StrongREJECT (0,0096), pero eso no garantiza robustez fuera de esos conjuntos.
- Sobre-rechazo macro de 0,5516 con WildGuard: coste de utilidad considerable, con rechazos excesivos en peticiones benignas.
- Perplejidad de 10,2183 en WikiText-2, superior a la del base sin comprimir; la calidad de generacion se resiente.
- Riesgo de alucinacion no cuantificado en la informacion disponible; hereda los sesgos de Llama-2-7b-chat y anade los del dataset alpaca-cleaned usado en la recuperacion.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue fiable.
- Sin soporte documentado de tool calling ni de flujos de agente.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repo; el uso comercial esta sujeto a los terminos de esa licencia y a la politica de uso aceptable de Meta.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion externa de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-06), lo que conviene verificar antes de citarlo en produccion o publicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_hisvd_jbbresp13_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementacion HiSVD: https://github.com/redai-infra/HiSVD
- Dataset de recuperacion: alpaca-cleaned (https://huggingface.co/datasets/yahma/alpaca-cleaned)
- Calibracion WikiText-2: https://huggingface.co/datasets/wikitext
- JailbreakBench (origen de `jbb_harm_resp`): https://github.com/JailbreakBench/jailbreakbench
- AdvBench: https://github.com/llm-attacks/llm-attacks
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- WildGuard: https://huggingface.co/allenai/wildguard
- Licencia Llama 2: https://ai.meta.com/llama/license/
