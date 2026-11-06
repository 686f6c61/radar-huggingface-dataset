# arianraje/looptransv2-qwen3.5-2b-s2-trial-m2_med

## Resumen

LoopTransV2 `s2-trial-m2_med` es un modelo experimental de generacion de texto construido sobre Qwen3.5-2B mediante una tecnica de transformer con bucles (looped transformer) y profundidad recurrente. En lugar de apilar nuevas capas, el autor reutiliza bloques de capas existentes del modelo base ejecutandolos mas de una vez con pesos compartidos, elevando la profundidad efectiva de 24 a 36 capas sin incrementar el numero de parametros. El resultado es un modelo de aproximadamente 2 mil millones de parametros con mayor profundidad computacional por token.

El modelo lo desarrolla el usuario `arianraje` en el marco del proyecto LoopTrans (rama `v2`) y corresponde a la etapa 2 de un pipeline de destilacion: se parte del Qwen3.5-2B congelado como profesor y se recupera capacidad mediante divergencia KL directa mas una perdida de interfaz de bucle. La variante `m2_med` es un control de calendario no seleccionado: representa la mediana, por coste predicho de etapa 1, de 200.000 calendarios validos muestreados uniformemente con `m = 2`.

Su relevancia es fundamentalmente de investigacion: explora si la profundidad recurrente con peso compartido puede recuperar calidad tras la modificacion estructural, y publica puntos de control intermedios (50M y 100M tokens) junto con informes de benchmark. No es un modelo orientado a produccion ni cuenta con validacion comunitaria (0 descargas, 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer con profundidad recurrente (`LoopedQwen3_5ForCausalLM`), derivada de Qwen3.5-2B |
| Parametros totales | ~2B (heredados de Qwen3.5-2B; no se anade peso nuevo por los bucles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con filas empaquetadas de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (junto con config, tokenizer y manifiesto de bucle) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-2B y aplica un calendario de repeticion sobre bloques de sus propias capas: `[5]x2 [6]x2 [8]x4 [9]x2 [13]x3 [15..16]x3` (capas indexadas desde 0, con formato `[primera..ultima]xrepeticiones`). Los pesos se comparten entre repeticiones, de modo que la profundidad ejecutada pasa de 24 a 36 capas. El modelo admite `m = 2` pasadas adicionales de atencion, lo que implica cachés KV adicionales.

El entrenamiento de etapa 2 (recuperacion) combina una divergencia KL directa hacia el Qwen3.5-2B congelado como profesor con una perdida de interfaz de bucle, ponderadas 1/1. Se optimiza con AdamW, tasa de aprendizaje 1e-5, 5M de pasos de warmup y decaimiento coseno durante 600M tokens hasta 0,1x. Cada paso procesa 64 filas empaquetadas de 4.096 tokens. Se publican dos exportaciones: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382). La configuracion completa esta en `run/config.json`. Las versiones fijadas del entorno son transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas heredados del modelo base (no verificados en la informacion disponible).
- Razonamiento y conocimiento general heredados de Qwen3.5-2B, potencialmente alterados por la reestructuracion en bucles.
- Capacidad de ejecucion con profundidad efectiva mayor (36 capas) manteniendo el numero de parametros.
- Integracion con vLLM mediante el plugin `vllm.general_plugins` que registra el paquete `looptransv2`.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre profundidad recurrente: permite estudiar si repetir bloques con pesos compartidos recupera calidad frente al modelo base mediante destilacion KL, comparando los puntos `t0050M` y `t0100M`.
- Reproduccion de experimentos de destilacion: los manifiestos de bucle, la configuracion de ejecucion y las versiones fijadas permiten replicar el entrenamiento de etapa 2 en un entorno controlado.
- Benchmarking de arquitecturas alternativas: sirve como linea base para comparar transformers apilados convencionales frente a transformers con bucles en tareas de generacion de texto.
- Estudio de eficiencia computacional: al no anadir parametros pero aumentar la profundidad ejecutada, es util para medir el equilibrio entre coste por token y calidad en GPUs de gama media.
- Pruebas de integracion con vLLM: el paquete registra un plugin de vLLM, lo que permite validar el despliegue de arquitecturas no estandar en ese motor de inferencia.
- Analisis de sensibilidad al calendario de repeticion: al ser un control no seleccionado (mediana de 200.000 calendarios), permite contrastar el efecto de elegir calendarios optimizados frente a uno aleatorio.
- Docencia y divulgacion: ejemplo didactico de destilacion con profesor congelado y de modificacion estructural sobre un modelo base pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen informes de benchmark bajo `bench/` en las subcarpetas donde se evaluo, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4-5 GB solo para pesos (2B parametros), mas memoria para cachés KV y overhead del runtime; con `m = 2` se requieren cachés KV adicionales, lo que incrementa el consumo.
- GPU recomendadas: no disponible de forma especifica; por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) es un punto de partida razonable, aunque la arquitectura no estandar puede limitar la compatibilidad.
- GPU de consumo: previsiblemente cabe en tarjetas con 12-16 GB en bfloat16, aunque la necesidad de cargar el codigo de `looptransv2` y el plugin de vLLM condiciona el despliegue.
- Opciones de despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (registra un entry point en `vllm.general_plugins`); carga mediante `load_looped` del paquete `looptransv2.models.io`. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m2_med | ~2B | no disponible | Looped transformer (36 capas efectivas) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-2B (modelo base) | ~2B | no disponible | Transformer denso (24 capas) | no disponible en la informacion | Hugging Face (Qwen) |
| Alternativas de ~2B de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otras alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico punto de referencia solido es el propio Qwen3.5-2B, del que este modelo es una modificacion estructural.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no ha sido validado para uso en produccion y no cuenta con adopcion comunitaria (0 descargas, 0 likes).
- La reestructuracion en bucles puede degradar capacidades del modelo base; la etapa 2 de recuperacion solo alcanza 100M de los 600M tokens previstos en los puntos publicados.
- Riesgo de alucinacion inherente a los modelos de ~2B; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados no documentados; el comportamiento multilingue puede diferir del modelo base.
- Longitud de contexto no documentada; el entrenamiento usa filas de 4.096 tokens, pero no se especifica la ventana final.
- Dependencia de un paquete externo (`looptransv2`) y de versiones fijadas de transformers y vLLM; la integracion con otras herramientas puede no funcionar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantias de calidad desaconseja su uso en entornos productivos sin evaluacion propia.
- El nombre `m2_med` indica un control no seleccionado (mediana de calendarios aleatorios), por lo que no representa la mejor configuracion del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m2_med
- Repositorio del proyecto LoopTrans (rama `v2`, commit `1463f44`): https://github.com/arianraje/LoopTrans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
