# prachigarg23/pi05_FAST_aloha_gear_insertion_ES_SS

## Resumen

`pi05_FAST_aloha_gear_insertion_ES_SS` es un checkpoint de política visión-lenguaje-acción (VLA) para robótica manipulativa, desarrollado por Prachi Garg y colaboradores (Steve Xing, Prahit Yaugand, Saurabh Gupta y Derek Hoiem) en el marco del artículo *Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation* (arXiv:2608.19490). Se trata de un fine-tuning del modelo base `pi05_base` (π0.5 de Physical Intelligence) con tokens FAST, especializado en la tarea de inserción de engranajes con un robot bimanual ALOHA.

El modelo resuelve el problema del ajuste fino de VLAs con pocos datos de demostración experta, combinando demostraciones humanas con auto-demostraciones generadas por la propia política base en una proporción 1:1. El checkpoint publicado corresponde a la variante "ES+SS" (expert self-demonstrations más self-supervision) del estudio, entrenado hasta el paso 15000.

Es relevante porque ejemplifica una línea de investigación activa: reducir la dependencia de teleoperación costosa en el entrenamiento de políticas robóticas mediante control generativo auto-supervisado. El repositorio ocupa 12,4 GB e incluye únicamente pesos y assets (sin estado del optimizador), lo que lo hace desplegable con la librería `openpi`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π0.5 con tokens FAST |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo con directorios `params/` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base`, la política π0.5 de Physical Intelligence, un modelo VLA que combina un backbone visión-lenguaje con un decodificador de acciones. En esta variante se emplean tokens FAST para la generación de acciones. El fine-tuning se realizó sobre el dataset `prachigarg23/aloha_bimanual_gear_insertion_expert`, compuesto por demostraciones expertas de inserción de engranajes con ALOHA bimanual, mezcladas 1:1 con auto-demostraciones generadas por la política base.

La innovación metodológica del artículo es el uso de control generativo auto-demostrado: la propia política base genera trayectorias adicionales que se incorporan al entrenamiento junto con las demostraciones expertas, reduciendo la necesidad de teleoperación. El checkpoint publicado corresponde al paso 15000 e incluye estadísticas de normalización en `assets/trossen/norm_stats.json`. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Control robótico bimanual para tareas de ensamblaje de precisión (inserción de engranajes).
- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, propia de la familia π0.5.
- Ejecución de políticas multi-tarea derivadas del fine-tuning con auto-demostraciones.
- Integración con el ecosistema `openpi` para servir la política mediante `scripts/serve_policy.py`.
- Despliegue en robot ALOHA real según el README de ALOHA del repositorio de código.
- No se dispone de información sobre soporte de tool calling, agentes o capacidades multilingües.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo ejecuta la inserción de engranajes en un banco bimanual ALOHA, una tarea de precisión que requiere coordinación de dos brazos y realimentación visual continua.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para reproducir los resultados ES+SS del artículo y comparar con variantes solo-expertas.
- Reducción de costes de teleoperación: al incorporar auto-demostraciones, permite entrenar políticas con menos horas de demostración humana, útil en laboratorios con recursos limitados.
- Benchmark de VLAs en manipulación multi-tarea: punto de comparación para evaluar métodos de fine-tuning sobre π0.5 en tareas de contacto rico.
- Prototipado de pipelines robóticos con `openpi`: el flujo `hf download` más `serve_policy.py` permite desplegar la política en un entorno ALOHA en pocos pasos.
- Estudio de generalización con datos auto-generados: permite analizar hasta qué punto las auto-demostraciones mejoran la robustez frente a variaciones de posición y orientación de las piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,4 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: `openpi` mediante `scripts/serve_policy.py` con configuración `pi05_FAST_aloha_gear_insertion_ES_SS`; ejecución en robot ALOHA según el README del repositorio de código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `pi05_FAST_aloha_gear_insertion_ES_SS` | VLA π0.5 fine-tuned (ALOHA) | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| `pi05_base` (π0.5) | VLA base | no disponible | no disponible | no disponible en la información |
| Otras variantes del artículo (ES, SS) | VLA fine-tuned | no disponible | no disponible | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente para inserción de engranajes con ALOHA bimanual; no es un modelo de propósito general.
- Sin datos de benchmarks publicados en la información disponible, por lo que no se puede verificar su rendimiento frente a alternativas.
- Riesgo de sobreajuste al entorno de entrenamiento (posiciones, iluminación, piezas concretas del dataset experto).
- Sin información sobre sesgos; al ser un modelo robótico, los sesgos relevantes serían de distribución de tareas y entornos, no lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación sobre robustez desaconseja su despliegue en producción sin validación adicional.
- El checkpoint no incluye estado del optimizador, por lo que no es directamente reanudable para entrenamiento.
- Idiomas soportados no disponibles; las instrucciones en lenguaje natural podrían estar limitadas al inglés de los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/prachigarg23/pi05_FAST_aloha_gear_insertion_ES_SS
- Paper: https://arxiv.org/abs/2608.19490
- Página del proyecto: https://self-supervised-control.pages.dev/
- Código: https://github.com/prachigarg23/self-supervised-continual-control
- Dataset: https://huggingface.co/datasets/prachigarg23/aloha_bimanual_gear_insertion_expert
- README de ALOHA: https://github.com/prachigarg23/self-supervised-continual-control/blob/main/third_party/aloha/README.md
