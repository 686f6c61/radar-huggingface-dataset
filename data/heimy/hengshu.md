# heimy/hengshu

## Resumen

HengShu (衡枢) es una familia de modelos de investigación en PyTorch desarrollada por el usuario heimy para la evaluación multimodal de equipos eléctricos. El modelo recibe como entrada imágenes de equipamiento (224×224 RGB), telemetría de ocho campos (tensión, corriente, potencia, impedancia, frecuencia, flags de disparo y estado del interruptor) y secuencias SOE (sequence of events), y produce una clasificación de enrutamiento de revisión junto con una probabilidad de consistencia y un riesgo de escenario esperado. No es un modelo de lenguaje: es un sistema de metric-learning multimodal orientado a un dominio muy específico.

La familia incluye tres variantes de fusión (M-1, M-A y M-6) que comparten un único encoder congelado de 12,7 millones de parámetros y añaden un cabezal de fusión de 3,4 millones, sumando 16.139.091 parámetros almacenados por variante instanciada. M-1 realiza un paso de fusión, M-A usa parada adaptativa y M-6 ejecuta seis pasos de fusión fijos. El modelo está pensado como estudio exploratorio sobre datos sintéticos, no como un sistema validado en campo.

La relevancia de este lanzamiento es acotada: se trata de un experimento de un solo seed sobre un cohorte sintético previamente inspeccionado, con licencia MIT y sin integración en Transformers. Resulta útil para quienes investigan fusión multimodal en dominios industriales o quieran reproducir el protocolo de evaluación, pero no debe confundirse con un modelo de producción ni con un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder compartido multimodal (imagen/SOE/telemetría) + cabezal de fusión con metric-learning; variantes de 1 paso, parada adaptativa y 6 pasos fijos |
| Parámetros totales | 16.139.091 por variante instanciada (encoder 12.719.232 + fusión 3.419.859) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada SOE fija de 32 tokens; no es un modelo de contexto textual) |
| Tipos de cuantización | No disponible (se menciona FP32 para encoding y BF16 para fusión en CUDA) |
| Idiomas soportados | zh, en (etiquetas y documentación; la entrada es estructurada, no lenguaje libre) |
| Licencia | MIT |
| Formato de pesos | safetensors (`encoder.safetensors`, `variants/*/fusion.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder compartido y congelado que procesa tres modalidades: imagen RGB 224×224 (conversión CHW y división por 255, sin resize ni normalización media/std implícita), telemetría de exactamente ocho campos con escalado identidad y secuencias SOE con nombres explícitos del vocabulario, rellenadas a 32 posiciones y con seis tokens de frecuencia/dominio eliminados y compactados de forma estable. Sobre ese encoder se entrenan por separado tres cabezales de fusión con supervisión métrica: M-1 (un paso), M-A (parada adaptativa ordinaria) y M-6 (seis pasos fijos). El batch en tiempo de ejecución es de uno y las variantes adaptativas efectivamente paran antes de completar todos los pasos.

El protocolo de entrenamiento usa 3.977 eventos sintéticos de entrenamiento, 703 eventos de calibración de fuente y 1.560 eventos retenidos del dominio 3. Cada modelo de fusión se entrenó durante 20 épocas (4.980 actualizaciones) con seed 2026 y el encoder compartido fijo. Las cinco vistas de test comparten los mismos 1.560 eventos. Se trata explícitamente de un estudio exploratorio de un solo seed sobre un cohorte sintético previamente inspeccionado, no de un test de campo independiente. La calibración de probabilidades es específica por variante (`variants/*/calibration.json`).

## Capacidades

- Clasificación de enrutamiento de revisión en cuatro clases: INFORMATIONAL_ONLY, HUMAN_REVIEW, DATA_QUALITY_REVIEW y EXPERT_ESCALATION.
- Estimación de `p_consistent` (probabilidad de consistencia) y `expected_scenario_risk` (riesgo de escenario esperado).
- Fusión multimodal de imagen de equipo, telemetría y secuencias SOE en una única representación.
- Parada adaptativa real en la variante M-A y ejecución de pasos fijos en M-6, con reporte de `executed_steps`.
- Procesamiento de señal de calidad como SNR normalizada `(snr_db−18)/18`, con valores negativos válidos (rango original aproximado de −0,8333 a 1,0).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de lenguaje).
- Soporte de agentes y razonamiento multi-step: no disponible en el sentido de LLM; M-6 ejecuta seis pasos de fusión internos.
- Capacidades multilingües: solo a nivel de documentación y etiquetas (zh, en); no acepta lenguaje libre.
- Capacidades especiales: ninguna de tipo thinking mode, visión generativa o audio; la visión se limita a encoding de imágenes de equipo.

## Casos de uso

- Enrutamiento de revisión de equipos eléctricos: el modelo clasifica cada evento sintético en una de las cuatro rutas de revisión, permitiendo priorizar la intervención humana según `expected_scenario_risk` y `p_consistent`.
- Investigación en fusión multimodal industrial: sirve como banco de pruebas reproducible para comparar estrategias de fusión (1 paso, adaptativa, 6 pasos) sobre un encoder congelado y un protocolo de evaluación fijo.
- Reproducción de experimentos de metric-learning: el repositorio incluye `evaluation.csv`, `validation.json` y `provenance.json`, lo que permite replicar las 10 configuraciones core y las líneas base emparejadas.
- Detección de degradación de calidad de datos: la ruta DATA_QUALITY_REVIEW y la señal de SNR normalizada permiten marcar entradas con calidad deficiente antes de un análisis más profundo.
- Estudio de robustez ante oclusiones: las cinco vistas de test (Clean, Black, Gray, Ellipse, Texture) permiten analizar cómo degrada el rendimiento cada tipo de oclusión en cada variante.
- Docencia y prototipado en PyTorch: el cargador local explícito (`HengShu.from_pretrained`) y los nueve ejemplos sintéticos con salidas de referencia en CPU facilitan su uso en entornos académicos sin infraestructura de inferencia alojada.
- Evaluación de calibración de probabilidades: los ficheros de calibración por variante permiten estudiar la fiabilidad de las probabilidades de ruta en un dominio sintético controlado.

## Benchmarks y rendimiento

Macro-F1 (%) de enrutamiento bajo el protocolo de evaluación original:

| Variante | Clean | Black | Gray | Ellipse | Texture | Media con oclusión |
|---|---|---|---|---|---|---|
| M-1 | 96,13 | 53,04 | 69,99 | 63,44 | 73,63 | 65,03 |
| M-A | 95,61 | 71,96 | 71,97 | 76,20 | 73,59 | 73,43 |
| M-6 | 96,92 | 63,64 | 72,67 | 76,18 | 77,10 | 72,40 |

La model card indica que M-1 mejora la media de F1 en cuatro oclusiones en 4,29 puntos porcentuales respecto a alguna referencia, pero el texto está truncado y no se detalla la línea base. Para las líneas base emparejadas y las 10 configuraciones core se remite a `evaluation.csv`, no incluido en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 16,1 millones de parámetros, los pesos en FP32 ocupan aproximadamente 65 MB y en BF16 unos 32 MB, más el overhead de activaciones de un batch de tamaño uno.
- GPU recomendadas: cualquier GPU CUDA compatible con `torch>=2.6`; el autor valida `--device cuda --precision bf16` para encoding FP32 y fusión BF16, sin garantizar todas las combinaciones versión/dispositivo.
- Cabe en GPU de consumo: sí, con amplio margen; también funciona en CPU, que es el modo de referencia de los ejemplos.
- Opciones de despliegue: cargador local propio (`hengshu.py`, `modeling_hengshu.py`); no hay integración con Transformers AutoModel, vLLM, llama.cpp, Ollama ni TGI, ni proveedor de inferencia alojado.
- Latencia y throughput: no disponibles; el batch en tiempo de ejecución es uno y las variantes adaptativas paran antes, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (fusión multimodal para equipos eléctricos con metric-learning). Las líneas base emparejadas se referencian en `evaluation.csv`, que no está disponible en esta ficha.

## Limitaciones y advertencias

- Estudio exploratorio de un solo seed (2026) sobre un cohorte sintético previamente inspeccionado; no es un test de campo independiente.
- Los datos de entrenamiento, calibración y test son sintéticos; no existe un adaptador calibrado para sensores reales (la telemetría usa escalado identidad).
- Las cuatro rutas de salida son clases sintéticas de enrutamiento de revisión, no cuatro categorías físicas reales de fallo.
- La consistencia estimada no prueba que una operación de conmutación haya alcanzado su objetivo, ya que la entrada nativa no incluye el objetivo de comando.
- No acepta lenguaje libre: la entrada SOE debe usar nombres explícitos del vocabulario y la telemetría debe tener exactamente ocho campos.
- No es un LLM: no tiene tool calling, agentes, generación de texto ni contexto conversacional.
- No hay integración con Transformers ni proveedores de inferencia alojados; el despliegue requiere el cargador local y dependencias propias.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades de ruta dependen de la calibración por variante y del dominio sintético.
- Sesgos conocidos: no documentados explícitamente; la evaluación se limita a un cohorte sintético y a cinco vistas de oclusión.
- Licencia MIT permite uso comercial, pero el autor no reclama autoría de equipo, DOI ni liderazgo en benchmarks; la cita formal no está disponible.
- La fecha de creación del repositorio (2026-11-03) y el bajo número de descargas (28) sugieren un lanzamiento muy reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/heimy/hengshu
- Referencia arXiv citada en tags: https://arxiv.org/abs/2001.06782
- Referencia arXiv citada en tags: https://arxiv.org/abs/1806.01768
- Sitio externo no relacionado con el modelo (mismo nombre): https://hengshu.ai/en
