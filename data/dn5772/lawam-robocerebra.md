# dn5772/LaWAM-RoboCerebra

## Resumen

LaWAM-RoboCerebra es un repositorio de políticas de robótica basadas en el modelo LaWAM, un modelo de visión-lenguaje-acción (VLA) que ha sido ajustado mediante aprendizaje supervisado (SFT) sobre el conjunto de datos RoboCerebra. Lo publica el usuario dn5772 y se distribuye como una colección de versiones, cada una en su propia carpeta, con sus datos de entrenamiento, checkpoints y configuración asociados. La primera versión disponible es `train100-aug`, entrenada sobre 100 tareas de horizonte largo seleccionadas del split oficial de entrenamiento de RoboCerebra, con aumento de datos por renderizado de texturas y posiciones de distractores.

El modelo parte del checkpoint preentrenado `jialei02/lawam_pretrain` y aplica ajuste supervisado siguiendo el código de RLinf/LaWAM. La relevancia actual radica en que ofrece una política VLA entrenada de forma independiente al benchmark (a diferencia de su versión predecesora Unified SFT 25k), lo que permite una evaluación más honesta sobre RoboCerebraBench, si bien la tasa de éxito en bucle cerrado todavía no se ha medido.

El repositorio tiene un tamaño de 35,9 GB y almacena los pesos en el formato original `.pt` de LaWAM. Los idiomas declarados son inglés y coreano, y la licencia es de tipo "other", sujeta a las licencias de los componentes upstream. La información técnica detallada sobre arquitectura interna, número de parámetros y longitud de contexto no está disponible en la model card publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA); detalle de arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato `.pt` original de LaWAM) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | other / upstream-component-licenses (ver LICENSES.md) |
| Formato de pesos | PyTorch `.pt` (formato original de LaWAM) |

## Arquitectura y entrenamiento

LaWAM se presenta en la model card como una política (policy) de robótica, integrándose en el pipeline de robótica como un modelo de visión-lenguaje-acción. El autor no detalla en la información proporcionada la arquitectura interna concreta (tipo de transformer, mecanismo de atención, etc.), por lo que ese dato queda como no disponible. El ajuste se realiza sobre el checkpoint preentrenado `jialei02/lawam_pretrain` (revisión `62b14a8`) usando el código de `RLinf/LaWAM` (revisión `4ea6fda`), con un wrapper de carga de datos propio incluido en la carpeta `code/`.

El entrenamiento de la versión `train100-aug` se llevó a cabo sobre 100 tareas de horizonte largo del split de entrenamiento oficial, que se descomponen en 1.360 episodios de subtareas y, tras aplicar 12 variantes de aumento (texturas y posiciones de distractores), dan lugar a 16.212 episodios y 1.618.854 fotogramas. Se usó un batch global de 512 con un schedule de LR coseno de 60.000 pasos (los checkpoints liberados corresponden a 20.000, 25.000 y 30.000 actualizaciones). La EMA está desactivada (etiqueta `ema-off`). La validación se realizó sobre 20 tareas disjuntas del training split (162 episodios, sin aumento). No se han aplicado técnicas de RLHF o DPO según la información disponible; se trata de aprendizaje supervisado puro.

## Capacidades

- Política de visión-lenguaje-acción para control robótico: el modelo genera acciones a partir de observaciones visuales e instrucciones en lenguaje natural (instrucciones de subtarea del dataset RoboCerebra).
- Ejecución de tareas de horizonte largo: entrenado sobre 100 tareas largas descompuestas en subtareas (entre 12 y 23 subtareas por caso), lo que implica capacidad de seguir instrucciones secuenciadas.
- Seguimiento de instrucciones de subtarea en inglés y coreano (idiomas declarados).
- Aumento de robustez frente a variaciones visuales: el entrenamiento incluye aumento de texturas y posiciones de distractores, lo que debería mejorar la generalización ante cambios menores en la escena.
- Integración con pipelines de robótica que consumen el formato `.pt` de LaWAM junto con `config.yaml`, `dataset_statistics.json` y `prepare_benchmark.py`.
- No se declaran capacidades de tool calling, function calling ni razonamiento multi-paso de tipo agente conversacional; no disponible.

## Casos de uso

- Manipulación robótica de horizonte largo en entornos de simulación: el modelo puede ejecutar secuencias de subtareas sobre escenas de tipo `coffee_table`, `kitchen_table` y `study_table`, aprovechando su entrenamiento sobre tareas largas descompuestas.
- Evaluación de investigación en VLA: sirve como política de referencia para medir éxito en bucle cerrado sobre RoboCerebraBench, aunque dicha métrica aún no se ha publicado.
- Aprendizaje por imitación sobre datos propios: la estructura del repositorio (carpetas por versión con datos, checkpoints y configuración) facilita reutilizar el flujo de SFT para nuevos conjuntos de tareas.
- Estudio de robustez visual: gracias al aumento de texturas y distractores, es útil para analizar cómo varía el comportamiento ante perturbaciones visuales controladas.
- Reproducción de protocolos de selección de tareas: el repositorio documenta el criterio de elección de las 100 tareas (reparto Hamilton por escena y ranking por número de subtareas), lo que permite replicar o auditar el pipeline de datos.
- Comparación de metodologías de ajuste: el contraste con `dn5772/LaWAM-RoboCerebra-Unified-SFT-25k` permite estudiar diferencias entre entrenar con datos derivados del benchmark y entrenar con el training split independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la tasa de éxito en bucle cerrado ("closed-loop task success") no se ha medido y que todas las métricas reportadas son de pérdida offline/MSE, sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican requisitos de memoria ni tamaño de parámetros por checkpoint.
- Tamaño del repositorio: 35,9 GB, que incluye varios checkpoints (20.000, 25.000 y 30.000 actualizaciones además de otros artefactos), por lo que el almacenamiento necesario para clonar el repositorio completo es de varias decenas de GB.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer el número de parámetros.
- Opciones de despliegue: los pesos se distribuyen en formato `.pt` original de LaWAM y se usan junto con `config.yaml`, `dataset_statistics.json` y `prepare_benchmark.py`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Datos de entrenamiento | Escala | Batch / schedule | Relación con benchmark | Licencia |
|---|---|---|---|---|---|
| LaWAM-RoboCerebra (`train100-aug`) | 100 tareas del training split oficial con aumento | 16.212 episodios / 1.618.854 fotogramas | 512 / coseno 60k (puntos 20k–30k) | Training split independiente; 0 segmentos coincidentes con benchmark | other (upstream) |
| LaWAM-RoboCerebra-Unified-SFT-25k | `lerobot/robocerebra_unified` (derivado de demos del benchmark) | 6.660 episodios / 571.116 fotogramas | 256 / coseno 25k | Demos del benchmark; 72/72 trayectorias coincidentes en caso verificado | other (upstream) |

Fuera de estos dos modelos derivados de LaWAM, la información proporcionada no incluye otros modelos comparables de la misma categoría (VLA de robótica), por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- La tasa de éxito en bucle cerrado no se ha medido; no hay evidencia publicada de rendimiento real en tareas de manipulación más allá de la pérdida offline (loss/MSE).
- El autor advierte que los 100 casos empleados en `train100-aug` fueron seleccionados con un criterio propio porque la lista y el código originales de los autores de RoboCerebra no están publicados; no se reclama reproducir la selección oficial.
- El criterio de selección sesga deliberadamente hacia tareas con más subtareas, lo que puede reducir la representatividad respecto a la distribución completa de tareas.
- Al usar únicamente el training split, el modelo no debe compararse directamente con versiones entrenadas con demos del benchmark (como Unified SFT 25k) sin tener en cuenta la posible contaminación de las segundas.
- Licencia de tipo "other": el uso comercial depende de las licencias de los componentes upstream, detalladas en `LICENSES.md`; es necesario revisarlas antes de cualquier explotación comercial.
- Idiomas limitados a inglés y coreano; no se declara soporte multilingüe adicional.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no aplica de forma directa por tratarse de una política de acción; no obstante, no se documenta comportamiento ante entradas fuera de distribución.
- Los archivos de despliegue contienen solo pesos para inferencia y evaluación: no incluyen optimizador, RNG, imágenes originales ni datos de entrenamiento en HDF5, por lo que no permiten reanudar el entrenamiento tal cual.
- El modelo está creado y actualizado en fechas de 2026 según los metadatos; verificar compatibilidad con las versiones actuales del código RLinf/LaWAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dn5772/LaWAM-RoboCerebra
- Modelo base: https://huggingface.co/jialei02/lawam_pretrain
- Revisión del modelo base: https://huggingface.co/jialei02/lawam_pretrain/tree/62b14a8e8990050ec8aeb1e1b8c8694d2bf60e84
- Licencias: https://huggingface.co/dn5772/LaWAM-RoboCerebra/blob/main/LICENSES.md
- Repositorio de código RLinf/LaWAM: https://github.com/RLinf/LaWAM
- Revisión del código: https://github.com/RLinf/LaWAM/tree/4ea6fdadce6c9b8746028307a246b79ee2c4fd55
- Dataset RoboCerebra: https://huggingface.co/datasets/qiukingballball/RoboCerebra
- Revisión del dataset: https://huggingface.co/datasets/qiukingballball/RoboCerebra/tree/5d2e1e361bf65aabbe4d18179515f5a10936cc96
- Dataset unificado (referencia): https://huggingface.co/datasets/lerobot/robocerebra_unified/tree/279f0bcafc4564cc9ae0c5f3c4ccf0abffeb0637
- Código de regeneración del dataset: https://github.com/buaa-colalab/RoboCerebra/tree/2573426c13dfcd5e7d7831c15587b058aaa1c0c0
- Repositorio relacionado (Unified SFT 25k): https://huggingface.co/dn5772/LaWAM-RoboCerebra-Unified-SFT-25k
- Paper referenciado por tag arXiv: arxiv:2606.15768
