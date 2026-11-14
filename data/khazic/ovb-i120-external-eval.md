# khazic/ovb-i120-external-eval

## Resumen

`khazic/ovb-i120-external-eval` no es un modelo generativo al uso, sino un repositorio de artefactos de evaluacion. Contiene los resultados de una suite externa de seis conjuntos de datos (issue #120) ejecutada sobre los brazos LoRA de I108 Fusion-C1 con rango 64 (brazo A con learning rate 3e-5 y brazo B con learning rate 1e-5), ademas del baseline Fusion-C1 fusionado sin adaptador. El autor es el usuario de Hugging Face `khazic`.

El contenido se organiza por item y parte: cada checkpoint evaluado (`base-000000`, `A-<step>-best`, `B-<step>-final`, etc.) tiene su configuracion de ejecucion, log del runner, estado (`DONE`/`FAIL`) y metricas por benchmark y agregadas en `full.json`. Las partes corresponden a `core` (NYU, ETH3D, DIODE, Cityscapes y ReasonSeg) y `refcocog`, lo que situa la evaluacion en el ambito de segmentacion densa y referida, no en el de modelos de lenguaje.

Es relevante ahora porque documenta de forma reproducible el efecto de distintos learning rates en un ajuste LoRA sobre un modelo de segmentacion, con pesos EMA (`*_best`/`*_final`) y una cola de evaluacion que se actualiza a medida que aparecen checkpoints. No obstante, el repositorio no incluye pesos del modelo ni una model card descriptiva del mismo, por lo que su utilidad es la de un registro de resultados experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los artefactos corresponden a un ajuste LoRA r64 sobre I108 Fusion-C1; la arquitectura del modelo base no se detalla) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene JSON, CSV, HTML, logs y scripts Python/Shell; no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base I108 Fusion-C1. Lo que si se documenta es el procedimiento de ajuste: se entrenaron dos brazos LoRA de rango 64 sobre Fusion-C1, diferenciados unicamente por el learning rate (A: 3e-5, B: 1e-5), y se compararon contra el baseline Fusion-C1 fusionado sin adaptador. Los checkpoints marcados como `*_best` y `*_final` corresponden a pesos EMA (media movil exponencial), una practica habitual para estabilizar el rendimiento final del ajuste.

La evaluacion se ejecuta mediante un follower (`i120_follow.py`, `i120_follow.sh`, `i120_inputs.py`) que consume la cola de checkpoints a medida que aparecen y escribe resultados por benchmark, comprobaciones de preflight y una comparativa agregada en `comparison/` (JSON, CSV y HTML). Los paths de los logs se reescriben a `/data/...` para anonimizar el entorno de ejecucion. No se especifican el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Evaluacion de segmentacion densa sobre NYU, ETH3D, DIODE y Cityscapes (parte `core`).
- Segmentacion referida por lenguaje sobre ReasonSeg y RefCOCOg (partes `core` y `refcocog`).
- Comparacion controlada de hiperparametros: dos learning rates distintos con el mismo rango LoRA (r64).
- Evaluacion de pesos EMA frente a checkpoints intermedios.
- Registro reproducible de ejecuciones: config, log, estado y metricas agregadas por item.
- No se documentan capacidades de generacion de texto, tool calling, agentes ni multilingues.

## Casos de uso

- Seleccion de hiperparametros LoRA: comparar los brazos A (lr 3e-5) y B (lr 1e-5) sobre los mismos benchmarks permite decidir que learning rate generaliza mejor antes de lanzar un ajuste a mayor escala.
- Validacion de pesos EMA: los items `*_best` y `*_final` permiten cuantificar si la media movil exponencial mejora las metricas respecto a checkpoints intermedios.
- Auditoria de un ajuste sobre Fusion-C1: el repositorio sirve como evidencia reproducible de que el adaptador aporta o no mejora frente al baseline `base-000000` sin adaptador.
- Integracion en pipelines de evaluacion continua: los scripts `i120_follow.py` y `i120_follow.sh` pueden reutilizarse como plantilla para evaluar checkpoints a medida que se publican.
- Analisis de robustez por dominio: al cubrir NYU, ETH3D, DIODE y Cityscapes se pueden detectar degradaciones especificas en interiores, exteriores o condiciones sinteticas.
- Investigacion en segmentacion referida: las partes `refcocog` y ReasonSeg permiten estudiar el comportamiento del modelo ante instrucciones en lenguaje natural.
- Reproducibilidad de resultados: la estructura de config, log y `full.json` por item facilita replicar o impugnar las cifras publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia metricas por benchmark y agregadas en `full.json` y en `comparison/`, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se publican pesos ni se indica formato de inferencia).
- Latencia y throughput: no disponible.
- Nota: el repositorio solo contiene artefactos de evaluacion; para reproducir las ejecuciones haria falta el modelo base I108 Fusion-C1 y los adaptadores LoRA, que no se distribuyen aqui.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables ni incluye cifras de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo ni adaptadores; es exclusivamente un registro de resultados de evaluacion.
- No se declara licencia, lo que impide determinar si el uso comercial de los artefactos o de los resultados esta permitido.
- No se documentan sesgos conocidos del modelo base ni de los adaptadores evaluados.
- Riesgo de alucinacion: no aplica directamente a este repositorio, pero no puede evaluarse sin acceso al modelo generativo subyacente.
- El repositorio se actualiza mientras la cola de evaluacion sigue en marcha; los resultados pueden ser parciales y algunos items pueden figurar como `FAIL`.
- Los paths de los logs estan reescritos a `/data/...`, lo que puede dificultar la reproduccion exacta del entorno original.
- No se especifican los conjuntos de validacion ni las metricas exactas empleadas por benchmark, mas alla de los nombres de los datasets.
- Ausencia de model card descriptiva: no hay informacion sobre arquitectura, tamano, contexto ni idiomas del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/khazic/ovb-i120-external-eval
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la informacion proporcionada.
