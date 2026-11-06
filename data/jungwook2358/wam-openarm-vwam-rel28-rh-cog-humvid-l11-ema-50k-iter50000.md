# jungwook2358/wam-openarm-vwam-rel28-rh-cog-humvid-l11-ema-50k-iter50000

## Resumen

`wam-openarm-vwam-rel28-rh-cog-humvid-l11-ema-50k-iter50000` es un checkpoint de investigación para robótica de manipulación, publicado por el usuario `jungwook2358` en Hugging Face. No es un modelo de lenguaje: es un modelo de política visuomotora (visuomotor action model, VWAM) que combina un backbone de vídeo Cosmos3-Nano MoT con un cabezal de acciones ActionDiT entrenado desde cero. El modelo consume observaciones visuales y produce comandos articulares de 28 dimensiones para un robot OpenArm de doble brazo con cuello y manos, lo que lo sitúa en la categoría de modelos de imitación para control robótico de extremo a extremo.

La variante concreta que nos ocupa, `cog-humvid`, incorpora un adaptador CogAlign situado en la capa 11 del backbone MoT (la duodécima de 36), a diferencia de la variante original de referencia que lo sitúa en la capa 21. Este detalle de arquitectura es el principal diferenciador del checkpoint y sugiere un experimento de ablación sobre la profundidad del tap de alineación cognitiva. El entrenamiento mezcla datos de robot (con supervisión de acción y estado) y datos de vídeo humano (sin supervisión de acción), en una proporción exacta de 8 conjuntos de robot y 8 de humano por GPU a lo largo de 50.000 iteraciones.

El modelo tiene un interés limitado fuera del ámbito de la investigación en robótica: no soporta lenguaje natural, no expone una API de texto y su licencia es "other" sin términos públicos claros. Su relevancia es la de un artefacto reproducible de un pipeline de entrenamiento concreto (RLDX-2-VWAM), útil para quienes investigan el preentrenamiento con vídeo humano para transferencia a manipulación robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de vídeo Cosmos3-Nano MoT (36 capas) con VAE Wan2.2 + ActionDiT unidireccional entrenado desde cero + adaptador CogAlign (residual SiLU, dimensión 256) en la capa 11 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint DCP en FP, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no aplica (modelo robótico, sin capacidades de lenguaje) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | Torch DCP (4 shards + `.metadata`), con `scheduler/`, `trainer/`, `config.yaml`, `config.pkl` y `normalization.json`; optimizador excluido |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de dos torres. Por un lado, un backbone de vídeo Cosmos3-Nano basado en Mixture of Transformers (MoT) de 36 capas, inicializado desde `/data/checkpoints/Cosmos3-Nano-DCP` y acoplado a un VAE Wan2.2 para la codificación de fotogramas. Por otro, un ActionDiT unidireccional entrenado desde cero que genera las acciones. El espacio de acción es de 28 dimensiones: 2 de cuello, 7 por brazo (izquierdo y derecho), y 6 por mano (izquierda y derecha); los brazos se expresan de forma relativa al estado actual, mientras que cuello y manos son absolutos, con normalización q01/q99 por raíz.

La innovación principal es el módulo CogAlign: un adaptador residual con inicialización a cero y activación SiLU de dimensión 256, situado a la salida de la capa 11 del MoT, que alimenta las capas posteriores y las claves/valores (K/V) de la acción. Los cabezales FP48 predicen el estado actual (peso 0.2) y el delta futuro (peso 0.2), usando keypoints `openarm_prq30_v2_rlhnd/fp48` derivados de mano derecha humana. El entrenamiento emplea 6 subconjuntos de robot (`openarm_wam_v1`) y 5 de vídeo humano sin supervisión de acción ni estado, con un lote efectivo de 64 (4 GPU × 16), 50.000 iteraciones, semilla 42, learning rate 1e-4 con warmup de 2.500 pasos y decaimiento coseno hasta el 10%. Una nota del autor indica que la primera ejecución en segundo plano falló en el guardado de 35k por cuota de disco y se reanudó desde 30k.

## Capacidades

- Generación de trayectorias de acción articular de 28 dimensiones para un robot OpenArm de doble brazo con cuello y manos.
- Control visuomotor de extremo a extremo a partir de observaciones de vídeo, sin cinemática directa ni inversa en inferencia.
- Aprendizaje conjunto a partir de datos de robot y de vídeo humano, lo que permite aprovechar demostraciones humanas sin anotaciones de acción.
- Predicción de estado actual y de delta futuro mediante cabezales FP48.
- Alineación cognitiva configurable mediante el tap CogAlign (capa 11 en esta variante, 21 en la original).
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.

## Casos de uso

- Investigación en imitación robótica: sirve como checkpoint de referencia para reproducir el pipeline RLDX-2-VWAM y comparar el efecto del tap CogAlign en la capa 11 frente a la capa 21.
- Ablación de profundidad de alineación: al ser una variante deliberada con el tap desplazado, permite medir empíricamente cómo afecta la posición del adaptador a la calidad de las políticas generadas.
- Preentrenamiento con vídeo humano: el uso de 5 subconjuntos de vídeo sin supervisión de acción lo hace adecuado para estudiar transferencia desde demostraciones humanas a manipulación con robot real.
- Control de robots de doble brazo en laboratorio: el espacio de acción de 28 dimensiones con brazos relativos y cuello/manos absolutos encaja con plataformas OpenArm instrumentadas.
- Evaluación de políticas visuomotoras en entornos simulados o reales: el checkpoint puede cargarse con el runtime `vwam-openarm-20261031-v2` para pruebas de manipulación.
- Estudio de normalización por percentiles: el archivo `normalization.json` con q01/q99 por raíz permite analizar la sensibilidad de la política a la escala de las articulaciones.
- Reproducibilidad de entrenamiento: los archivos `config.yaml`, `config.pkl` y `scheduler/` permiten reconstruir la configuración resuelta y el estado del planificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 96,0 GB, correspondiente a un checkpoint DCP de 4 shards más metadatos, planificador y formateador; se requiere espacio en disco equivalente para cargarlo.
- VRAM estimada para inferencia: no disponible; depende del tamaño real del backbone Cosmos3-Nano y del ActionDiT, no especificados.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con 4 GPU y lote 16 por GPU, lo que sugiere hardware de centro de datos (A100/H100), pero no se confirma el modelo exacto.
- Compatibilidad con GPU de consumo: no confirmada; sin cuantizaciones publicadas, la carga en RTX 4090 o similares no está garantizada.
- Opciones de despliegue: el autor referencia el runtime `vwam-openarm-20261031-v2` (RLDX-2-VWAM main@6c629a6 con cambios locales); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-vwam-rel28-rh-cog-humvid-l11-ema-50k | no disponible | no disponible | vídeo + acción robótica | other | Hugging Face (15 descargas) |
| wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000 | no disponible | no disponible | vídeo + acción robótica | other | Hugging Face (mismo autor) |
| Cosmos3-Nano (backbone base) | no disponible | no disponible | vídeo | no disponible | checkpoint interno referenciado, no público en la información |

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks, métricas de éxito en tareas ni validación en robot real documentada.
- Licencia "other" sin términos explícitos: el uso comercial queda en un limbo legal hasta que el autor publique condiciones concretas.
- Ausencia de cuantizaciones: el checkpoint DCP de 96 GB no es directamente desplegable en entornos con recursos limitados.
- Especialización extrema: no procesa lenguaje natural ni tareas generales; cualquier uso fuera de control robótico OpenArm carece de sentido.
- Dependencia del runtime propietario del autor: requiere el código `vwam-openarm-20261031-v2` con cambios locales, lo que dificulta la reproducción independiente.
- Nota de entrenamiento incompleta: la ejecución se interrumpió por cuota de disco y se reanudó desde 30k, lo que puede introducir discontinuidades no documentadas en la curva de entrenamiento.
- Datos humanos sin supervisión de acción: la transferencia desde vídeo humano puede introducir sesgos de dominio no cuantificados.
- Riesgo de sobreajuste a la morfología OpenArm concreta (28-D, keypoints `openarm_prq30_v2_rlhnd/fp48`); no es portable a otras plataformas sin reentrenamiento.
- Idiomas: no aplica; no hay capacidades lingüísticas que evaluar.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/wam-openarm-vwam-rel28-rh-cog-humvid-l11-ema-50k-iter50000
- Checkpoint relacionado (EMA, save-only): https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000
- Repositorio de código referenciado: RLDX-2-VWAM main@6c629a6 (no se proporciona URL pública en la información disponible)
- Backbone base: Cosmos3-Nano-DCP (checkpoint interno, sin URL pública en la información disponible)
- VAE: Wan2.2 (sin URL pública en la información disponible)
