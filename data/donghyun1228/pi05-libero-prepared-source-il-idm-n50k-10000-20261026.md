# Donghyun1228/pi05-libero-prepared-source-il-idm-n50k-10000-20261026

## Resumen

π0.5 LIBERO prepared source es un checkpoint de política robótica (VLA, vision-language-action) publicado por el usuario Donghyun1228 en Hugging Face. Se trata del punto de partida ("source policy") que el autor utiliza para todos los experimentos de adaptación LAPE dentro de su repositorio `vla_adaptation`. El modelo combina aprendizaje por imitación (IL) con una pérdida de dinámica inversa (IDM) decodificada por el propio "action expert" de la política, y se ha entrenado sobre el benchmark LIBERO.

El checkpoint corresponde a un entrenamiento conjunto IL 1 + IDM 1, con tasa de aprendizaje 1e-5 y 10.000 actualizaciones sobre una sonda de origen de 50.000 muestras (n50k). La exportación incluye los parámetros de la política (51 hojas) con la torre de visión de origen copiada como torre de muñeca (74 hojas en total), junto con los assets de normalización y un `export.json` que registra la ruta de origen.

Su relevancia es fundamentalmente metodológica: sirve como línea base reproducible para medir la degradación de una política VLA ante cambios de dominio (rotaciones de cámara y variaciones de punto de vista) sin adaptación al objetivo, con resultados de éxito publicados para seis condiciones de shift. No es un modelo de propósito general ni un LLM: es un artefacto de investigación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi) con action expert y torre de visión; no se detalla la topología interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 13,1 GB; estructura `policy/params`, `policy/assets`, `policy/export.json`) |

## Arquitectura y entrenamiento

El modelo se basa en π0.5 dentro del ecosistema openpi. La innovación descrita es el entrenamiento conjunto de imitación (IL) y una pérdida de dinámica inversa (IDM) que se decodifica mediante el propio action expert de la política, con una ponderación IL 1 + IDM 1. El entrenamiento se realizó durante 10.000 actualizaciones con LR 1e-5 sobre una sonda de origen de 50.000 muestras (n50k), partiendo del preset `pi05_libero_conflict_mean_source` y del checkpoint `source_conflict_anchor_mean_best_all_shifts_n50k_10k_2000_20261026_r2`.

La exportación de evaluación copia la torre de visión de origen como torre de muñeca, resultando en 74 hojas de parámetros (frente a las 51 del origen), con el mismo layout que las exportaciones `policy_source_wrist/` de LAPE. Los assets de normalización son idénticos a los de las exportaciones principales de LAPE. La evaluación se realizó con el código `66dfb646`, un evaluador batcheado congelado (`kn_b200`), 500 episodios por suite, semilla de entorno 7 y MuJoCo 3.2.3, sin ninguna adaptación al dominio objetivo.

## Capacidades

- Ejecución de políticas de manipulación robótica en el benchmark LIBERO (tareas de mesa con brazo manipulador).
- Aprendizaje por imitación a partir de demostraciones (IL).
- Predicción de acciones condicionada a observaciones visuales y estado, con pérdida auxiliar de dinámica inversa (IDM) durante el entrenamiento.
- Robustez parcial ante shifts de dominio: rotaciones de cámara (AFR) y cambios de punto de vista (View).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No dispone de capacidades multilingües ni de generación de texto libre.
- No se documentan modos especiales (thinking, visión general, audio).

## Casos de uso

- Línea base para investigación en adaptación de dominio: sirve para comparar el rendimiento de políticas VLA adaptadas (LAPE) frente a la política de origen sin adaptación en los seis shifts publicados.
- Estudio de robustez ante rotaciones de cámara: permite cuantificar la caída de éxito al rotar la vista del robot (87,30% a 10°, 57,50% a 20°, 27,60% a 30°) y diseñar estrategias de aumento de datos.
- Estudio de robustez ante cambios de punto de vista: los resultados View-S/M/L (90,30%, 54,55%, 9,30%) permiten analizar la sensibilidad a la posición de la cámara.
- Reproducción de experimentos: con el código `66dfb646` y MuJoCo 3.2.3 se puede replicar la evaluación batcheada con 500 episodios por suite y semilla 7.
- Punto de partida para fine-tuning en nuevos entornos LIBERO: el checkpoint está pensado explícitamente como source para adaptaciones posteriores (por ejemplo, con LR 5e-5 y 10k actualizaciones en los targets LAPE).
- Investigación sobre pérdidas auxiliares: permite estudiar el efecto de la pérdida IDM decodificada por el action expert frente a entrenamientos solo con IL.

## Benchmarks y rendimiento

Resultados de éxito publicados en la model card (500 episodios por suite, sin adaptación al objetivo, semilla de entorno 7):

| Shift | Éxito | Porcentaje |
|---|---|---|
| AFR-10° | 1746/2000 | 87,30% |
| AFR-20° | 1150/2000 | 57,50% |
| AFR-30° | 552/2000 | 27,60% |
| View-S | 1806/2000 | 90,30% |
| View-M | 1091/2000 | 54,55% |
| View-L | 186/2000 | 9,30% |
| Media | — | 54,42% |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 13,1 GB, pero no se especifica el desglose entre pesos y assets ni el tamaño de los parámetros en el modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se enmarca en openpi y se evalúa con MuJoCo 3.2.3; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO prepared source (este) | no disponible | no disponible | Media 54,42% en 6 shifts sin adaptación | Apache 2.0 | Hugging Face |
| π0.5 LIBERO LAPE k10 (targets adaptados, LR 5e-5, 10k) | no disponible | no disponible | Resultados por shift en sus repos; no comparables directamente en la información disponible | Apache 2.0 | Hugging Face (`Donghyun1228/pi05-libero-lape-k10-<shift>-lam<λ>-lr5e-5-10000-20261102`) |
| π0.5 LIBERO IDM hmean source (n50k, 10k) | no disponible | no disponible | No disponible en la información proporcionada | Apache 2.0 | Hugging Face (`Donghyun1228/pi05-libero-idm-hmean-source-n50k-10000-20261022`) |

No se dispone de datos suficientes para comparar con políticas VLA de otros autores (por ejemplo, OpenVLA u otras variantes de π0.5) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación en robótica: no es un LLM ni un modelo conversacional; no debe evaluarse con benchmarks de texto.
- Degradación severa ante shifts grandes: 27,60% de éxito a AFR-30° y 9,30% en View-L, lo que limita su uso directo en entornos con cambios de cámara no vistos.
- Sin adaptación al objetivo: el checkpoint está diseñado como source, no como política final desplegable en dominios nuevos.
- Riesgo de sobreajuste al benchmark LIBERO: los resultados están medidos exclusivamente en ese entorno y con una configuración concreta (MuJoCo 3.2.3, semilla 7, evaluador `kn_b200`).
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución más allá de los shifts evaluados.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantías por parte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación externa por parte de la comunidad.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-prepared-source-il-idm-n50k-10000-20261026
- Checkpoint de origen IDM hmean: https://huggingface.co/Donghyun1228/pi05-libero-idm-hmean-source-n50k-10000-20261022
- Variante support-orthogonal-delta (IL source): https://huggingface.co/Donghyun1228/pi05-libero-support-orthogonal-delta-b64-output-alpha-full-il-source-n50000-10000-20261017
- Repositorio de adaptación LAPE (referenciado en la model card): `Donghyun1228/vla_adaptation` (no se proporciona URL directa en la información disponible)
- Targets LAPE: `Donghyun1228/pi05-libero-lape-k10-<shift>-lam<λ>-lr5e-5-10000-20261102` (patrón de nombre; no se proporciona URL directa)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
