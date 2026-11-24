# kgrozdanovski/caldec-ultra-150m-rknn-rk3566

## Resumen

CalDec Ultra 150M RKNN RK3566 es una conversión del modelo de clasificación de texto CalDec Ultra 150M (150 millones de parámetros) al formato RKNN para ejecutarse en la NPU del SoC Rockchip RK3566. Lo desarrolla kgrozdanovski y no implica reentrenamiento: se parte del checkpoint fp32 original (revisión `fcad869`) y se compila con rknn-toolkit2 2.5.0 en precisión fp16. El resultado es un artefacto de despliegue orientado a inferencia en placa, no un modelo nuevo.

El modelo resuelve un problema muy concreto: tomar decisiones tipadas ("typed decisions") sobre un estado y un conjunto de preguntas con opciones, devolviendo la opción elegida, las probabilidades, la confianza y una probabilidad de "act". Sobre una Panther X2 (RK3566, 4 GB) responde en 311 ms por pregunta de extremo a extremo en el test de asistente, con una concordancia de 856/858 respuestas idénticas al modelo fp32.

Su relevancia es práctica: demuestra que un transformer de 150M puede cuantizarse a fp16 y ejecutarse en la NPU de un SoC de gama baja con pérdida de precisión mínima (|Δp| máximo 0,012) y sin torch en la placa, solo numpy y tokenizers. Es un caso de referencia para despliegue edge de clasificadores ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base CalDec Ultra 150M); artefacto compilado RKNN para NPU Rockchip |
| Parametros totales | 150M (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens en el modelo fuente; en NPU, recorte por pasada a 640 tokens |
| Tipos de cuantizacion | fp16 (único soportado; int8 probado en checkpoints previos y descartado por precisión) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rknn` (modelo compilado); `act_head.npz` en numpy para CPU; tokenizer y `rl_agent_config.json` del modelo fuente |

## Arquitectura y entrenamiento

El artefacto es una conversión del transformer CalDec Ultra 150M, un modelo de decisión tipada que recibe un estado y un conjunto de preguntas con opciones y produce una elección con distribución de probabilidad. La conversión a RKNN se realizó con rknn-toolkit2 2.5.0 en fp16, sin reentrenamiento, a partir del checkpoint fp32 fijado en la revisión `fcad869` del modelo fuente. El tokenizer y el fichero `rl_agent_config.json` (temperaturas de calibración) se copian sin cambios.

El despliegue usa una estrategia de "buckets" por longitud: `pk2_s384.rknn` contiene los pesos (381 MB) y los modelos `pk2_s{96,128,160,192,224,256,320,512,640}_now.rknn` son sin pesos y comparten memoria en tiempo de ejecución mediante `RKNN_FLAG_SHARE_WEIGHT_MEM`. Las tablas por bucket (`rope_tab.bin`, `s_scale.bin`, `h_scale.bin`) son entradas constantes escritas una vez al cargar. La cabeza de acción (`act_head.npz`, Linear 772→256, GELU, Linear 256→2) se ejecuta en CPU con numpy. Las entradas que exceden una pasada (640 tokens, 192 filas de cabeza o 12 marcadores de opción) se dividen en varias pasadas. No se detalla en la información disponible la composición del dataset de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Clasificación de texto orientada a decisiones tipadas: dado un estado y preguntas con opciones, devuelve elección, probabilidades, confianza y probabilidad de "act".
- Salida calibrada: aplica las temperaturas de calibración del modelo fuente.
- Procesamiento por pasadas con división automática de casos largos (más de 640 tokens, 192 filas de cabeza o 12 marcadores de opción).
- Ejecución en NPU de bajo consumo (RK3566) sin torch en la placa, solo numpy y tokenizers.
- Soporte de servicio persistente mediante systemd socket (`caldec-npu`), con entrada/salida JSONL.
- Capacidad multilingüe: limitada a inglés.
- No se documentan capacidades de generación libre, código, matemáticas, visión ni tool calling en la información disponible.

## Casos de uso

- Clasificación de decisiones en dispositivos edge: el modelo evalúa estados y preguntas con opciones directamente en la NPU del RK3566, sin necesidad de conexión a la nube, con 311 ms por pregunta en el test de asistente.
- Automatización de asistentes locales: integrado como servicio systemd, responde a peticiones JSONL sobre decisiones tipadas en placas de 4 GB de RAM, adecuado para asistentes embebidos.
- Enrutamiento y selección de acciones en agentes: la probabilidad de "act" y la distribución sobre opciones permiten decidir si el agente debe actuar y qué opción elegir, con calibración conservada del modelo fuente.
- Moderación o triaje de contenido en el borde: al ser un clasificador de texto ligero, puede etiquetar entradas según opciones predefinidas en entornos con recursos limitados.
- Investigación en despliegue NPU: sirve como referencia reproducible para convertir transformers de 150M a RKNN fp16 y validar la concordancia con fp32 (856/858 respuestas idénticas).
- Procesamiento por lotes en placa: con 625 ms por pregunta en el test público (dos pasadas por caso), es viable para flujos de clasificación por lotes en hardware de bajo coste.

## Benchmarks y rendimiento

| Metrica | Test asistente | Test publico |
|---|---:|---:|
| Casos, preguntas | 400, 858 (2,15 por caso) | 200, 1.000 (5 por caso) |
| Pasadas NPU por caso | 1,00 | 2,00 (división: más de 192 filas de cabeza) |
| Tiempo por pregunta, extremo a extremo | 311 ms | 625 ms |
| Tiempo por caso, mediana (p95) | 626 ms (1.083) | 2.163 ms (5.300) |
| Misma respuesta que fp32 | 856/858 (ambos cambios con margen fp32 ≤ 0,007) | No disponible |
| \|Δp\| vs fp32, máximo / mediana | 0,012 / 0,0011 | No disponible |
| `act_probability` vs fp32 | \|Δ\| máximo 0,0006; mismo lado de 0,5 en 858/858 | No disponible |
| Precisión NPU (etiquetas no ligadas) | 0,8489 (834) | 0,7462 (981) |
| Precisión fp32, misma regla de división | 0,8489 | 0,7452 |
| Precisión fp32, una pasada | 0,8489 | 0,7686 |
| Memoria NPU, 10 buckets cargados | ~785 MB | ~785 MB |

Medido en una Panther X2 (RK3566, 4 GB), kernel 6.18, librknnrt 2.5.0, con gobernador de CPU en `performance`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- NPU: Rockchip RK3566 (plataforma objetivo `rk3566`); el driver también apunta a RK3568, pero no se probó en esa plataforma.
- Runtime: `librknnrt.so` 2.5.0 y `rknn_api.h` de rknn-toolkit2 tag v2.5.0 (no incluidos). Los ficheros `.rknn` están ligados a la versión de runtime con la que se compilaron.
- Driver de kernel: en kernel mainline, el driver `rknpu` out-of-tree con los parches del fork de kgrozdanovski (PR #4); sin ellos el modelo corre a aproximadamente la mitad de velocidad. Un kernel BSP suele incluir el driver, aunque no se probó.
- En la placa: Python con numpy y tokenizers; no requiere torch.
- Memoria NPU: unos 785 MB con los 10 buckets cargados.
- No cabe en GPU consumer convencional porque el formato `.rknn` es específico de NPU Rockchip; para ejecución en GPU habría que usar el modelo fuente en PyTorch/safetensors.
- Despliegue: servicio systemd socket con `caldec-npu`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia: 311 ms por pregunta (test asistente) y 625 ms (test público); mediana por caso de 626 ms y 2.163 ms respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CalDec Ultra 150M RKNN RK3566 | 150M | 8.192 en fuente; 640 por pasada en NPU | 0,8489 (asistente) / 0,7462 (público) | Apache 2.0 | Hugging Face (artefacto RKNN) |
| CalDec Ultra 150M (fp32) | 150M | 8.192 | 0,8489 (asistente) / 0,7686 (público, una pasada) | Apache 2.0 | Hugging Face |
| Otros clasificadores ligeros de 100-200M | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada; la comparación directa más relevante es con el propio modelo fuente fp32, que sirve de referencia de precisión.

## Limitaciones y advertencias

- Solo se probó una placa (Panther X2) y una versión de runtime (librknnrt 2.5.0); la reproducibilidad en otras configuraciones no está garantizada.
- Solo fp16: int8 se probó en checkpoints previos y no alcanzó el umbral de precisión.
- Por pasada, el estado se recorta a 640 tokens, frente a los 8.192 del modelo fuente; los casos largos requieren varias pasadas y pierden precisión (2,2 puntos en el test público).
- Las probabilidades usan las temperaturas de calibración del modelo fuente; no se recalibró en la NPU más allá de las cifras de concordancia y |Δp|.
- Idioma limitado a inglés.
- Riesgo de alucinación no documentado para esta tarea de clasificación, pero al ser un modelo de decisión, la fiabilidad depende de la calidad de las opciones y del estado de entrada.
- La licencia Apache 2.0 cubre los ficheros convertidos; el runtime de Rockchip no se incluye y tiene sus propios términos.
- Sin datos publicados de sesgos conocidos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kgrozdanovski/caldec-ultra-150m-rknn-rk3566
- Modelo base: https://huggingface.co/kgrozdanovski/caldec-ultra-150m
- Revisión del modelo base: https://huggingface.co/kgrozdanovski/caldec-ultra-150m/tree/fcad869cd222f235f9366804c721f319fcfd842b
- Documentación NPU: https://github.com/kgrozdanovski/caldec/blob/main/NPU.md
- Scripts de conversión y validación: https://github.com/kgrozdanovski/caldec/tree/main/scripts/npu
- Evidencias de ejecución: https://github.com/kgrozdanovski/caldec/tree/main/runs/evidence/npu
- rknn-toolkit2: https://github.com/airockchip/rknn-toolkit2
- Fork del driver con parches: https://github.com/kgrozdanovski/rk3568-npu-ODROID-M1/tree/panther-x2
- PR del driver upstream: https://github.com/vitalijborissow/rk3568-npu-ODROID-M1/pull/4
