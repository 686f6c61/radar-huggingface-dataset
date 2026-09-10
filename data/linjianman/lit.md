# linjianman/LIT

## Resumen

LIT (Latent Interface Training) es un conjunto de checkpoints de etapa 2 (finales) para el artículo *Breaking the Vision–Action Shortcut: Latent Interface Training for Generalizable Robot Foundation Models*. Lo publica el usuario linjianman en HuggingFace con licencia Apache 2.0. No es un modelo único, sino una colección de cuatro variantes entrenadas sobre backbones distintos de robótica y visión-lenguaje-acción (VLA), todas con el mismo método de entrenamiento LIT, lo que lo convierte en un recurso de referencia para reproducir y comparar resultados en tareas de manipulación robótica.

El problema que aborda es el denominado *vision–action shortcut*: la tendencia de los modelos fundacionales de robótica a asociar directamente observaciones visuales con acciones sin construir una representación intermedia generalizable, lo que degrada el rendimiento ante perturbaciones del entorno. LIT propone un entrenamiento con interfaz latente para mitigar ese atajo, y estos checkpoints permiten evaluar el efecto del método sobre cuatro arquitecturas base diferentes.

El repositorio ocupa 9.4 GB e incluye directorios para MolmoAct2 y π0.5 (estructuras de política LeRobot) y para FAST-WAM e ImageWAM (ImageWAM basada en FLUX.2 Klein 4B). La evaluación está orientada a los benchmarks LIBERO y LIBERO-Plus. No hay datos de arquitectura detallados, número de parámetros, contexto ni idiomas en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos fundacionales de robótica visión-lenguaje-acción (VLA) con entrenamiento de interfaz latente (LIT); cuatro backbones: MolmoAct2, π0.5, FAST-WAM e ImageWAM (FLUX.2 Klein 4B) |
| Parametros totales | no disponible (depende del backbone; ImageWAM se reporta sobre FLUX.2 Klein 4B) |
| Parametros activos | no disponible (no se indica que sean MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Directorios de política LeRobot (`molmoact2/*`, `pi05/*`); `model.pt` + `config.yaml` + `dataset_stats.json` (`fastwam/*`, `imagewam/*`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los backbones. Lo que sí se especifica es que se trata de checkpoints de etapa 2 (finales) obtenidos aplicando el método *Latent Interface Training* sobre cuatro modelos base de robótica: MolmoAct2 (30K pasos), π0.5 (30K pasos), FAST-WAM (30K pasos) e ImageWAM sobre FLUX.2 Klein 4B (34.720 pasos). La innovación técnica central es el propio LIT, descrito en el título del artículo como una forma de romper el atajo visión-acción para obtener modelos fundacionales de robot más generalizables.

En cuanto a datos de entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Los benchmarks de evaluación mencionados son LIBERO y LIBERO-Plus; en el caso de LIBERO-Plus se indica explícitamente que debe evaluarse con `LIBERO_PLUS_FIX_LANG=1` y que la métrica *Overall* es la media de los siete ejes de perturbación. Los directorios `molmoact2/*` y `pi05/*` se exponen como políticas LeRobot que se pasan directamente a `lerobot_eval --policy.path`, mientras que `fastwam/*` e `imagewam/*` requieren apuntar a `model.pt` y a `dataset_stats.json` mediante los argumentos `ckpt` y `EVALUATION.dataset_stats_path`. Las baselines de MolmoAct2 y π0.5 fueron ajustadas por los autores sobre LIBERO y están disponibles bajo petición; las de FAST-WAM e ImageWAM son los pesos publicados por sus autores originales.

## Capacidades

- Control robótico mediante políticas visión-lenguaje-acción: genera acciones a partir de observaciones visuales e instrucciones.
- Ejecución de tareas de manipulación evaluadas en los benchmarks LIBERO y LIBERO-Plus.
- Generalización ante perturbaciones: el método LIT está diseñado específicamente para reducir el atajo visión-acción y mejorar el comportamiento bajo variaciones del entorno (los siete ejes de perturbación de LIBERO-Plus).
- Integración con el ecosistema LeRobot: las variantes MolmoAct2 y π0.5 se cargan como directorios de política compatibles con `lerobot_eval`.
- Compatibilidad con pipelines basados en checkpoint, configuración y estadísticas de dataset para las variantes FAST-WAM e ImageWAM.
- Capacidades multilingües: no disponible.
- Soporte de tool calling, agentes o modo de razonamiento explícito: no disponible.
- Capacidades de visión, audio o thinking mode más allá del uso como política VLA: no disponible.

## Casos de uso

- Evaluación comparativa de backbones de robótica: los cuatro directorios permiten medir el efecto del método LIT sobre MolmoAct2, π0.5, FAST-WAM e ImageWAM bajo las mismas condiciones de LIBERO y LIBERO-Plus.
- Reproducción de resultados de investigación: los checkpoints de etapa 2 permiten reproducir las tablas del artículo sin reentrenar, usando los comandos de evaluación documentados.
- Estudio de generalización ante perturbaciones: LIBERO-Plus con los siete ejes de perturbación sirve para analizar la robustez de cada backbone cuando se aplica LIT frente a las baselines correspondientes.
- Desarrollo sobre LeRobot: las variantes de MolmoAct2 y π0.5 se integran directamente como políticas en flujos de evaluación existentes mediante `--policy.path`.
- Comparación con baselines de terceros: las variantes FAST-WAM e ImageWAM permiten contrastar el método LIT con los pesos originales publicados por los autores de esos modelos.
- Investigación sobre el atajo visión-acción: el conjunto de checkpoints sirve como material para estudiar cómo se comportan distintas arquitecturas VLA cuando se les fuerza a construir una representación latente intermedia.
- Fine-tuning posterior sobre dominios propios: partiendo de los checkpoints de etapa 2, un equipo puede adaptar las políticas a tareas de manipulación específicas (no se documenta el procedimiento exacto en la información disponible).

## Benchmarks y rendimiento

La model card hace referencia a resultados en las tablas I, II y III del artículo (*Table I/II LIT*, *Table III last row*) para las distintas variantes, pero no incluye cifras concretas en la información proporcionada. Los benchmarks empleados son LIBERO y LIBERO-Plus, este último con la métrica *Overall* calculada como media de los siete ejes de perturbación. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: evaluación mediante `lerobot_eval` para las políticas LeRobot (`molmoact2/*`, `pi05/*`) y carga por checkpoint para `fastwam/*` e `imagewam/*`. No se documentan opciones tipo vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no son el formato habitual para políticas de robótica.
- Latencia y throughput estimados: no disponible.
- Tamaño del repositorio completo: 9.4 GB, dato útil para planificar el almacenamiento de los cuatro conjuntos de checkpoints.

## Comparativa con modelos similares

La información proporcionada no incluye una comparativa con cifras frente a alternativas, pero sí identifica los modelos de referencia que actúan como baselines del propio artículo:

| Modelo | Relación con LIT | Backbone | Pasos | Licencia |
|---|---|---|---|---|
| LIT / MolmoAct2 | Variante LIT | MolmoAct2 | 30.000 | apache-2.0 |
| LIT / π0.5 | Variante LIT | π0.5 | 30.000 | apache-2.0 |
| LIT / FAST-WAM | Variante LIT | FAST-WAM | 30.000 | apache-2.0 |
| LIT / ImageWAM | Variante LIT | FLUX.2 Klein 4B | 34.720 | apache-2.0 |
| MolmoAct2 (baseline) | Baseline ajustada por los autores en LIBERO, disponible bajo petición | MolmoAct2 | no disponible | no disponible |
| π0.5 (baseline) | Baseline ajustada por los autores en LIBERO, disponible bajo petición | π0.5 | no disponible | no disponible |
| FAST-WAM (baseline) | Pesos publicados por los autores originales | FAST-WAM | no disponible | no disponible |
| ImageWAM (baseline) | Pesos publicados por los autores originales | FLUX.2 Klein 4B | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento comparado para completar una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible; el modelo se orienta a generación de acciones en robótica, no a texto libre, pero no se documenta comportamiento ante entradas fuera de distribución.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero conviene verificar las licencias de los backbones subyacentes (MolmoAct2, π0.5, FAST-WAM, FLUX.2 Klein 4B), ya que pueden imponer condiciones adicionales no recogidas en este repositorio.
- Las baselines de MolmoAct2 y π0.5 no están incluidas; se ofrecen solo bajo petición, lo que complica la reproducción completa de las comparativas sin contactar con los autores.
- El rendimiento reportado se limita a los entornos de simulación LIBERO y LIBERO-Plus; no hay evidencia de transferencia a robots físicos en la información disponible.
- El repositorio no incluye métricas ni resultados numéricos en la model card, por lo que cualquier decisión de uso debería basarse en el artículo original, no accesible desde la información proporcionada.
- La evaluación de LIBERO-Plus requiere `LIBERO_PLUS_FIX_LANG=1`; omitir este ajuste puede producir resultados no comparables.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/linjianman/LIT
- Repositorio de código y página del proyecto: https://github.com/jianmanlincjx/LIT
