# Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rtc

## Resumen

El modelo `longnav-objectnav-flow-nopose-cotrain-2p5hz-rtc` es una política de navegación robótica para ObjectNav (navegación a objetos) y PointNav (navegación a puntos) desarrollada por Aasdfip. Se basa en el backbone multimodal Qwen3-VL-2B-Instruct, al que se le añade un adaptador LoRA (r=128, alpha=256) y un head de acción basado en flow-matching que emite trayectorias temporales de 20 poses planares relativas a 0,04 s de espaciado. El modelo opera a 2,5 Hz de frecuencia de observación y cada decisión ejecuta 10 de las 20 poses generadas.

La variante RTC (real-time chunking) incorpora un mecanismo de condicionamiento por prefijo de acciones comprometidas: durante la inferencia, el head de flujo recibe como entrada las acciones que el robot ejecutará mientras se genera el chunk actual, lo que permite enmascarar hasta 400 ms de latencia de inferencia sin desplazar el reloj de decisión. Este enfoque, descrito en el artículo arXiv:2512.05964, es relevante para sistemas robóticos en tiempo real donde la latencia de inferencia afecta directamente a la calidad de la navegación. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su uso con el simulador Habitat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-2B-Instruct (backbone) + LoRA (r=128, alpha=256) + head de flow-matching |
| Parametros totales | no disponible (backbone de 2B + adaptador LoRA; repo de 0,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) + .pt (head de accion y encoder de pose) |

## Arquitectura y entrenamiento

El modelo combina un backbone de vision-lenguaje Qwen3-VL-2B-Instruct con un adaptador LoRA y un head de accion basado en flow-matching. El head emite un chunk de 20 poses planares relativas acumulativas a 0,04 s de espaciado, que son seguidas por un controlador PID sobre una base holonomica. Las observaciones se reciben a 2,5 Hz y cada decision ejecuta 10 de las 20 poses generadas.

La variante RTC anade un mecanismo de condicionamiento por prefijo: el head de flujo acepta un prefijo de acciones comprometidas (las `d` primeras filas del chunk que el robot ejecutara mientras se genera el chunk actual). Estas filas entran en el bucle de denoising en el tiempo de flujo 0 y se fijan durante la integracion, garantizando consistencia con el postfijo generado. El parametro `rtc_delay_max` en `turn_vector_head_config.json` indica si el checkpoint soporta prefijos (valor 10 en este caso).

El entrenamiento se reanudo desde el paso 9000 de la version cotrain-v3 (75% de su plan de 12.000 pasos) y se entreno durante 3.000 pasos adicionales con condicionamiento de prefijo. La mezcla de datos incluye: ObjectNav humano en MP3D sin inyeccion de pose (ratio 1, 39.061 filas), el mismo con inyeccion de pose (ratio 1, 39.061 filas) y PointNav generado en HM3D-train (ratio 2, 7.971 filas), muestreados a ratios 1:1:2. La longitud del compromiso se muestrea con `d ~ exp(0.8^d)` sobre [0, 10], con P(0) ≈ 0,22 y E[d] ≈ 3. La perdida se calcula solo sobre las filas no comprometidas.

## Capacidades

- Navegacion robótica ObjectNav: localiza y navega hacia objetos especificos en entornos interiores.
- Navegacion PointNav: navega hacia puntos de destino concretos en el espacio.
- Generacion de trayectorias de accion: emite chunks de 20 poses planares relativas a 0,04 s de espaciado, seguidas por control PID.
- Real-time chunking: condicionamiento por prefijo de acciones comprometidas que enmascara hasta 400 ms de latencia de inferencia.
- Vision y lenguaje: hereda las capacidades multimodales del backbone Qwen3-VL-2B (comprension de imagenes y texto).
- Operacion a 2,5 Hz: frecuencia de observacion fija con ejecucion de 10 de las 20 poses por decision.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso fuera del ambito de navegacion.

## Casos de uso

- Navegacion autonoma en interiores: el modelo puede guiar un robot movil hacia objetos especificos (por ejemplo, "ve a la taza") en entornos domesticos u oficinas, usando el simulador Habitat para entrenamiento y validacion.
- Robotica de servicio: integracion en robots de asistencia que necesitan desplazarse a puntos concretos o localizar objetos para tareas de recogida o entrega.
- Exploracion de entornos desconocidos: la capacidad PointNav permite navegar a coordenadas dadas sin necesidad de un mapa previo, util en misiones de reconocimiento.
- Control en tiempo real: el mecanismo RTC permite ejecutar acciones comprometidas mientras se genera el siguiente chunk, reduciendo el impacto de la latencia de inferencia en sistemas con requisitos de tiempo real.
- Investigacion en VLA (vision-language-action): sirve como base para estudiar politicas de navegacion que combinan modelos de lenguaje y vision con control de bajo nivel.
- Simulacion y evaluacion de politicas: el modelo se evalua en el conjunto `sample101` de HM3D ObjectNav val, con metricas de exito oracle y SPL, lo que lo hace util para comparar algoritmos de navegacion en entornos estandarizados.

## Benchmarks y rendimiento

Resultados en el conjunto `sample101` (HM3D ObjectNav val, n=101, convencion oracle-stop). `d` es el retardo de inferencia asumido en ticks de control de 40 ms. oSPL es el oracle SPL corregido.

| policy | oracle success | oSPL (corregido) | npwpl | success |
|---|---|---|---|---|
| cotrain-v3 (baseline, d=0) | 0.663 | 0.348 | 0.420 | — |
| **este modelo, d = 0** | **0.683** | 0.336 | 0.409 | 0.584 |
| **este modelo, d = 5 (200 ms enmascarados)** | 0.624 | 0.295 | 0.372 | 0.495 |

La comparacion d=0 vs v3 esta dentro del ruido estadistico para n=101, lo que indica que el fine-tune con condicionamiento no degrada la politica base. La comparacion d=5 vs d=0, pareada por episodios, muestra 10 mejoras / 16 empeoramientos / 75 sin cambios (test de signos p ≈ 0,16). No se han medido otros benchmarks (MMLU, HumanEval, etc.) porque el modelo esta especializado en navegacion robotica.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El backbone Qwen3-VL-2B con LoRA y el head de accion ocupan aproximadamente 0,6 GB en disco; la VRAM de inferencia dependera del framework y la precision (probablemente entre 4 y 8 GB en FP16).
- GPU recomendadas: no se especifican. Dado el tamano del modelo (2B), deberia ejecutarse en GPUs consumer como RTX 3060 o superiores, y en GPUs de datacenter como A10 o A100.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano reducido del modelo.
- Opciones de despliegue: el modelo se evalua con un script Python que usa `transformers` y el backend `flow_rollout`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue requiere el codigo del proyecto LongNav (ramas RTC no publicas).
- Latencia y throughput: no disponibles. El objetivo del diseno RTC es enmascarar hasta 400 ms de latencia de inferencia, pero no se proporcionan mediciones directas.

## Comparativa con modelos similares

| Modelo | Backbone | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (RTC)** | Qwen3-VL-2B + LoRA | ObjectNav/PointNav | no disponible | Apache 2.0 | Publico en HF |
| cotrain-v3 (base) | Qwen3-VL-2B + LoRA | ObjectNav/PointNav | no disponible | Apache 2.0 | Publico en HF |
| Variante RL (rl-a09-ck303) | Qwen3-VL-2B + LoRA | ObjectNav/PointNav | no disponible | Apache 2.0 | Publico en HF |
| GOAL (NeurIPS 2025) | LLM + flow model | ObjectNav | no disponible | no disponible | Repo GitHub |

La comparativa se limita a variantes del mismo proyecto LongNav, ya que no se dispone de datos de otros modelos de navegacion con arquitectura VLA comparable. GOAL es un trabajo relacionado que destila un LLM en un modelo de flujo para ObjectNav, pero no se han publicado comparaciones directas.

## Limitaciones y advertencias

- Dependencias no publicas: el codigo de inferencia y evaluacion requiere las ramas RTC de los repositorios del proyecto LongNav, que no estan publicadas. Los comandos de evaluacion no funcionaran sin ellas.
- Sesgos y alucinacion: no se han documentado sesgos especificos, pero al ser un modelo de navegacion basado en vision-lenguaje, puede fallar en entornos no representados en los datos de entrenamiento (MP3D y HM3D).
- Limitaciones de contexto e idioma: no se especifican; el modelo esta disenado para tareas de navegacion, no para generacion de texto general.
- Riesgo en produccion: la politica se evalua con convencion oracle-stop, que asume que el robot se detiene exactamente en el objetivo; en despliegue real pueden requerirse mecanismos adicionales de deteccion de exito.
- Licencia: Apache 2.0 permite uso comercial, pero las dependencias de codigo no publicas pueden limitar la reproducibilidad.
- El modelo no incluye estado de optimizador ni RNG; es un checkpoint de inferencia, no un punto de reanudacion de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rtc
- Repositorio base (cotrain-v3): https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz
- Variante RL: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-ck303
- Pagina del proyecto LongNav: https://github.com/chloeqxq/LongNav_ProjectPage
- Paper relacionado (arXiv:2512.05964): https://arxiv.org/abs/2512.05964
- Repo GOAL (NeurIPS 2025): https://github.com/libd1/GOAL
