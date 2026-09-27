# mvbalaji/od1-base-lora

## Resumen

OD-1 Base LoRA (4B) es un modelo de decision abierto de tipo *System One* desarrollado por el usuario mvbalaji. Su funcion no es generar texto libre, sino recibir un **estado** (texto o JSON) junto con **preguntas tipadas** (`choice` de eleccion multiple, `noul` para si/no y `score` para valores ordinales) y devolver cada respuesta acompanada de su distribucion de probabilidad completa, ademas de un resultado explicito `NOT_ANSWERABLE` cuando el modelo no puede responder. La salida sigue el esquema Jev / TypeSafe `/v1/systemone`.

El modelo parte del backbone Qwen/Qwen3.5-4B y se ha ajustado con LoRA de rango 64 sobre todas las proyecciones, manteniendo el backbone congelado y fusionando los adaptadores para la publicacion. El autor indica que este enfoque preserva mejor la capacidad zero-shot del backbone que un ajuste completo. El repositorio incluye ademas un modelo Nano en `nano/` y un fichero `cascade.json` con una cascada ajustada (modo *two-model* por defecto y modo *self-exit* con salida en la capa 8), lo que lo convierte en un artefacto autocontenido para enrutamiento y clasificacion con control de coste.

Es relevante porque aborda una tarea poco cubierta por los LLM generativos habituales: la toma de decisiones calibrada con opciones multiples (hasta 1.000 alternativas) y metricas de calibracion explicitas (KL y Brier). Su licencia Apache 2.0 y su integracion en `transformers` lo hacen desplegable en pipelines propios, aunque requiere kernels especificos para funcionar a velocidad util.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: mezcla de atencion completa con capas de atencion lineal *gated delta-rule* (backbone Qwen3.5-4B); ajuste LoRA de rango 64 sobre todas las proyecciones |
| Parametros totales | Aproximadamente 4.000 millones (heredados del backbone Qwen/Qwen3.5-4B; el recuento exacto no se detalla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repositorio: 12,8 GB) |

Otros datos: pipeline declarado `text-classification`, etiqueta `endpoints_compatible`, creado y actualizado el 26 de septiembre de 2026, 0 descargas y 0 *likes* en el momento de la consulta.

## Arquitectura y entrenamiento

El backbone Qwen3.5-4B combina capas de atencion completa con capas de atencion lineal basadas en *gated delta-rule*. Sobre ese backbone se aplico un ajuste LoRA de rango 64 en todas las proyecciones, con el backbone congelado y los adaptadores fusionados en la version publicada. El modelo incorpora ademas una salida temprana en la capa 8 que se usa en el modo *self-exit* de la cascada: si la confianza minima por pregunta en esa salida supera el umbral de 0,9, se responde con la profundidad completa; en caso contrario, se ejecuta el modelo completo. El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion principal es el sistema de respuestas tipadas con distribuciones completas de probabilidad, en lugar de una unica etiqueta. El repositorio incluye un modelo Nano y un fichero `cascade.json` con umbrales ajustados solo sobre datos de validacion: en modo *two-model*, el Nano responde primero y se escala al modelo principal cuando la confianza minima por pregunta del Nano es inferior a 0,0; en modo *self-exit*, se usa la salida de la capa 8 con umbral 0,9. En validacion, el Nano solo alcanza 0,737, este modelo solo 0,701 y la cascada *two-model* 0,737 con 0,000 peticiones escaladas; el modo *self-exit* parte de 0,471 en la salida temprana y llega a 0,699 con 0,979 de peticiones escaladas, por lo que el autor senala que esta salida temprana rara vez supera el umbral y mayoritariamente anade latencia.

## Capacidades

- Toma de decisiones tipadas con tres tipos de pregunta: `choice` (eleccion entre 2 y hasta 1.000 opciones), `noul` (si/no) y `score` (ordinal).
- Devolucion de distribuciones de probabilidad completas por respuesta, no solo la opcion ganadora.
- Resultado explicito `NOT_ANSWERABLE` para preguntas fuera de dominio, sujeto al umbral ajustado en `serving.json`.
- Salida estructurada con el esquema Jev / TypeSafe `/v1/systemone`.
- Clasificacion de texto en dominios concretos: noticias (AG News), emociones (Emotion), sentimiento de cinco clases (SST-5), intenciones bancarias (Banking77) e intenciones multilingues MASSIVE-en.
- Seleccion de funciones y *tool calling* evaluada con BFCL, incluyendo escenarios nativos, de 24, 100 y 1.000 opciones, y deteccion de irrelevancia.
- Calibracion medida con KL y Brier ademas de la exactitud.
- Cascada integrada con un modelo Nano y *early exit* en la capa 8.
- No genera texto libre: su salida son decisiones con confianza asociada.
- Capacidad multilingue: solo ingles.

## Casos de uso

- **Enrutamiento de tickets de soporte**: el modelo puede clasificar una consulta entrante sobre las categorias de Banking77 o MASSIVE-en, devolviendo la distribucion de probabilidad para decidir si se enruta automaticamente o se escala a un humano cuando la confianza es baja.
- **Seleccion de herramientas en agentes**: con un 0,912 de exactitud en BFCL nativo y 0,886 con 24 opciones, puede elegir que funcion invocar en un agente, incluso manejando catalogos grandes de hasta 1.000 opciones (0,379 de exactitud en ese caso, suficiente para un primer filtrado con verificacion posterior).
- **Extraccion de decisiones estructuradas desde JSON**: dado un estado en formato JSON, devuelve campos tipados como `route`, `refund` o `urgency` con valor y confianza, lo que permite construir pipelines deterministas que consumen la respuesta sin parsear lenguaje natural.
- **Analisis de sentimiento con incertidumbre**: sobre SST-5 y Emotion no solo devuelve la clase, sino la distribucion completa, lo que permite ponderar agregados o descartar predicciones poco fiables en analitica de opinion.
- **Deteccion de preguntas irrelevantes o fuera de alcance**: la tarea BFCL de irrelevancia (0,686) y el resultado `NOT_ANSWERABLE` permiten que un sistema declare explicitamente que una pregunta no aplica en lugar de forzar una respuesta incorrecta.
- **Triaje de bajo coste en dos etapas**: desplegando la cascada *two-model* con el modelo Nano incluido, se puede atender primero con el Nano y escalar al modelo principal solo cuando sea necesario, reduciendo el coste computacional en cargas de alto volumen.
- **Encuestas y escalas ordinales**: el tipo de pregunta `score` permite recoger valoraciones ordinales (por ejemplo, urgencia de 0 a 3) con una estimacion de confianza, util en sistemas de priorizacion o triaje.
- **Evaluacion de decisiones calibradas**: al publicar metricas KL y Brier, es adecuado como componente de referencia en investigacion sobre calibracion de modelos de decision.

## Benchmarks y rendimiento

Exactitud en conjuntos de test reservados (mismas muestras fijas para todos los sistemas, seed 0, hasta 2.000 decisiones por conjunto):

| Conjunto de test | Este modelo | Jev 1.13 | Laya | Laya typed-decisions | Tev1-4B | CLM-8B |
|---|---|---|---|---|---|---|
| typed-decisions | 0,574 (n=2000) | 0,741 | 0,353 | 0,737 | 0,690 | 0,393 |
| AG News | 0,845 (n=2000) | 0,882 | 0,924 | 0,922 | 0,886 | 0,354 |
| Emotion | 0,515 (n=2000) | 0,595 | 0,597 | 0,603 | 0,583 | 0,281 |
| SST-5 | 0,458 (n=2000) | 0,579 | 0,341 | 0,463 | 0,533 | 0,273 |
| Banking77 | 0,429 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| MASSIVE-en | 0,601 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| BFCL native | 0,912 (n=1252) | 0,975 | 0,679 | 0,847 | 0,954 | 0,694 |
| BFCL 24 opciones | 0,886 (n=1909) | 0,969 | 0,600 | 0,741 | 0,950 | 0,625 |
| BFCL 100 opciones | 0,771 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL 1.000 opciones | 0,379 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL irrelevancia | 0,686 (n=1101) | 0,702 | 0,788 | 0,390 | 0,701 | 0,661 |
| Adversarial (propio) | 0,705 (n=2000) | 0,832 | 0,619 | 0,628 | 0,793 | 0,449 |

En el split de test de typed-decisions, puntuado con las formulas de la tarjeta del benchmark, este modelo obtiene exactitud 0,574, KL 0,448 y Brier 0,200 en regimen generalista zero-shot. Como referencia, la misma tarjeta lista TypeSafe Jev 1.13 con 0,727 / 1,442 / 0,148 y meraGPT Decider 1 con 0,768 / 0,096 / 0,052 (ambos generalistas).

Resultados de la cascada integrada en test:

| Conjunto de test | two-model | self-exit |
|---|---|---|
| typed-decisions | 0,558 | 0,574 |
| AG News | 0,761 | 0,845 |
| Emotion | 0,554 | 0,515 |
| SST-5 | 0,406 | 0,458 |
| Banking77 | 0,501 | 0,429 |
| MASSIVE-en | 0,633 | 0,601 |
| BFCL native | 0,935 | 0,912 |
| BFCL 24 opciones | 0,928 | 0,886 |
| BFCL 100 opciones | 0,835 | 0,771 |
| BFCL 1.000 opciones | 0,425 | 0,379 |
| BFCL irrelevancia | 0,583 | 0,686 |
| Adversarial (propio) | 0,825 | 0,695 |

El autor indica que la velocidad no se ha medido por separado, al compartir arquitectura con el modelo del que deriva.

## Requisitos de hardware

- El autor solo documenta mediciones en **una GPU H100 en bf16**, con peticiones de tamano de lote 1 y CUDA graphs activados. No se publican cifras de throughput ni de latencia.
- VRAM estimada a partir del tamano del modelo (aproximadamente 4.000 millones de parametros), no confirmada por el autor: en bf16 o fp16 en torno a 8-9 GB solo de pesos, mas el *overhead* de activaciones y kernels; en int8 en torno a 4-5 GB; en int4 en torno a 2,5-3,5 GB. El repositorio no publica pesos cuantizados, por lo que estas cifras son teoricas.
- GPU recomendadas: H100 para el escenario medido por el autor; A100 40 GB o 80 GB serian suficientes en bf16 segun la estimacion anterior.
- Compatibilidad con GPU de consumo: por tamano, un modelo de ~4B en bf16 cabria en tarjetas de 24 GB como RTX 4090 o RTX 3090; en tarjetas de 16 GB requeriria cuantizacion, que no esta publicada en el repositorio.
- Opciones de despliegue: el modelo requiere codigo propio (`from od1.model import OD1Model`) y `transformers>=5.17.0`; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF, por lo que el despliegue estandar con esas herramientas no esta documentado.
- Rendimiento: el autor advierte de que, sin los kernels rapidos, `transformers` recurre silenciosamente a una implementacion pura de PyTorch de las capas de atencion lineal y una peticion de una sola pregunta tarda cientos de milisegundos en lugar de unos pocos. Los requisitos son `flash-linear-attention==0.5.2` y `causal-conv1d==1.7.0` (este ultimo requiere nvcc para compilar contra el par torch/CUDA instalado).

## Comparativa con modelos similares

Los unicos sistemas comparables documentados son los que aparecen en la tabla de resultados del propio autor. Sus especificaciones (parametros, contexto, licencia y disponibilidad) no se detallan en la informacion proporcionada.

| Sistema | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| OD-1 Base LoRA (este modelo) | ~4B (Qwen3.5-4B + LoRA) | No disponible | Apache 2.0 | HuggingFace, codigo propio | 0,912 BFCL nativo; 0,574 typed-decisions |
| Jev 1.13 (TypeSafe) | No disponible | No disponible | No disponible | No disponible | 0,975 BFCL nativo; 0,741 typed-decisions; KL 1,442 / Brier 0,148 |
| Laya | No disponible | No disponible | No disponible | No disponible | 0,924 AG News; 0,788 BFCL irrelevancia |
| Tev1-4B | ~4B (por el sufijo del nombre) | No disponible | No disponible | No disponible | 0,954 BFCL nativo; 0,690 typed-decisions |
| CLM-8B | ~8B (por el sufijo del nombre) | No disponible | No disponible | No disponible | 0,694 BFCL nativo |
| meraGPT Decider 1 | No disponible | No disponible | No disponible | No disponible | 0,768 typed-decisions; KL 0,096 / Brier 0,052 |

El autor menciona ademas la existencia de un checkpoint **od1-base** con el que recomienda comparar en las tareas propias, pero no se proporcionan sus especificaciones ni su enlace.

## Limitaciones y advertencias

- En tareas poco familiares, la exactitud queda claramente por debajo de los mejores sistemas cerrados, segun los propios resultados del autor (por ejemplo, 0,429 en Banking77 y 0,458 en SST-5).
- El resultado `NOT_ANSWERABLE` solo se devuelve por encima del umbral ajustado en `serving.json`, por lo que su comportamiento fuera de ese umbral depende de la configuracion de servicio.
- El modelo es exclusivamente en ingles. No hay soporte documentado de otros idiomas.
- Las puntuaciones en typed-decisions miden el acuerdo con su profesor de etiquetado, segun advierte el propio autor, por lo que no equivalen a una medida absoluta de calidad.
- Los baselines se invocaron mediante una interfaz envuelta en formato de eleccion (salvo el checkpoint Laya typed-decisions), lo que puede infravalorar sus resultados; no se ejecuto ninguna referencia con un LLM frontera.
- Los umbrales de la cascada se ajustaron solo sobre datos de validacion, y el modo *self-exit* escala el 97,9% de las peticiones en el umbral 0,9, por lo que aporta poco beneficio y anade latencia.
- La reproducibilidad depende de kernels compilados (`flash-linear-attention==0.5.2`, `causal-conv1d==1.7.0`); sin ellos el modelo funciona, pero con latencias de cientos de milisegundos por peticion.
- El modelo no genera texto libre: si el caso de uso requiere redaccion, resumen o dialogo abierto, esta herramienta no es adecuada.
- El repositorio es muy reciente (creado el 26 de septiembre de 2026) y no registra descargas ni *likes*, por lo que no existe validacion externa de los resultados publicados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del backbone Qwen3.5-4B del que deriva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mvbalaji/od1-base-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
