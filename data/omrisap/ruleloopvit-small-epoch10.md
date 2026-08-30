# omrisap/ruleloopvit-small-epoch10

## Resumen

RuleLoopViT LoopViT-Small epoch-10 es un checkpoint de entrenamiento inmutable, desarrollado por Omri Sapir, que captura el estado exacto del modelo LoopViT-Small tras 10 épocas de entrenamiento en el conjunto de datos ARC-AGI. Este checkpoint no es un modelo de inferencia independiente, sino un punto de control diseñado para servir como base de bifurcación (fork) para dos ramas experimentales del proyecto RuleLoopViT: una rama de continuación solo-visión y otra con condicionamiento de reglas congelado mediante un modelo Granite-30M.

El modelo emplea una arquitectura LoopViT-Small reconstruida, con un núcleo de bucle compartido de profundidad 1 y 24 iteraciones recurrentes, lo que permite un razonamiento iterativo sobre el lienzo de imagen de 64×64 píxeles. Su relevancia radica en que facilita la reproducibilidad exacta de experimentos de razonamiento visual en el dominio ARC-AGI, un referente en el estudio de la inteligencia artificial general y el razonamiento abstracto. El checkpoint incluye el estado completo del optimizador AdamW, el programador de tasa de aprendizaje coseno, el escalador de gradientes de AMP y las métricas de validación, lo que permite una reanudación precisa del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoopViT-Small (loop_vit1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision, entrada 64×64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (checkpoint_epoch_0010.pt) |

## Arquitectura y entrenamiento

El modelo se basa en una reconstruccion de LoopViT-Small, una variante del Vision Transformer (ViT) con un mecanismo de bucle recurrente compartido. La configuracion arquitectonica incluye una anchura de embedding de 512 dimensiones, 8 cabezas de atencion, una profundidad de nucleo de bucle compartido de 1 capa, una anchura MLP de 1024 y 24 iteraciones recurrentes. El lienzo de entrada es de 64×64 píxeles con un tamaño de parche de 2, lo que produce 1024 parches de 2×2 píxeles por imagen. Este diseño permite que el modelo refine iterativamente su representacion interna a lo largo de las 24 pasadas recurrentes, mejorando la capacidad de razonamiento sobre patrones visuales complejos.

El entrenamiento se realizo durante 10 épocas completas sobre el conjunto de datos ARC-AGI, alcanzando el punto de control en la epoca 10 con la epoca 11 como siguiente paso. El checkpoint guarda el estado completo del optimizador AdamW, el programador de tasa de aprendizaje coseno, el GradScaler de AMP (Automatic Mixed Precision), el contador de épocas, la mejor precision de validacion y la configuracion de entrenamiento. Esta integridad de estado permite una reanudacion exacta del entrenamiento, lo que es fundamental para los experimentos de bifurcacion del proyecto RuleLoopViT. El checkpoint esta vinculado al codigo RuleLoopViT y a la fuente LoopViT fijada por el proyecto, por lo que no es un checkpoint independiente compatible con la libreria Transformers.

## Capacidades

- Razonamiento visual iterativo: el modelo procesa imagenes de 64×64 con 24 iteraciones recurrentes sobre un nucleo compartido, lo que permite refinar progresivamente la comprension de patrones visuales.
- Resolucion de tareas ARC-AGI: disenado especificamente para el conjunto de datos ARC-AGI, que evalua la capacidad de inducir reglas abstractas a partir de ejemplos visuales.
- Continuacion de entrenamiento: el checkpoint contiene el estado completo del optimizador y el programador, lo que permite reanudar el entrenamiento desde la epoca 10 sin perdida de informacion.
- Bifurcacion experimental: preparado para servir como base de dos ramas de experimentacion (continuacion solo-vision y condicionamiento de reglas congelado).
- Capacidades multilingues: no aplica, al ser un modelo de vision sin componentes de lenguaje.
- Tool calling y agentes: no aplica.

## Casos de uso

- Investigacion en razonamiento abstracto visual: el checkpoint permite a investigadores estudiar la dinamica de aprendizaje de modelos recurrentes de vision en tareas de induccion de reglas, reanudando el entrenamiento desde un punto exacto y controlado.
- Comparacion de estrategias de entrenamiento: sirve como punto de partida comun para comparar dos estrategias divergentes (continuacion solo-vision frente a condicionamiento de reglas), garantizando que cualquier diferencia en los resultados se deba exclusivamente a la estrategia aplicada.
- Analisis de convergencia y sobreajuste: al incluir la mejor precision de validacion y el estado del optimizador, permite analizar la trayectoria de entrenamiento y detectar problemas de generalizacion en el conjunto ARC-AGI.
- Desarrollo de metodos de condicionamiento de reglas: la rama B del proyecto usa este checkpoint para experimentar con el congelamiento de un modelo Granite-30M como condicionador de reglas, lo que puede informar el diseno de sistemas de razonamiento hibrido.
- Reproducibilidad de experimentos: el SHA-256 documentado en manifest.json garantiza la integridad del checkpoint, permitiendo a otros grupos reproducir exactamente los experimentos del proyecto RuleLoopViT.
- Educacion avanzada en arquitecturas recurrentes de vision: puede utilizarse en cursos de posgrado o talleres para ilustrar el entrenamiento de modelos con nucleos recurrentes compartidos y su aplicacion a problemas de razonamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento en ARC-AGI ni en otros conjuntos de datos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque al tratarse de un modelo con anchura de embedding de 512 y 24 iteraciones recurrentes, el consumo de memoria durante el entrenamiento dependera del tamano de lote y de la precision usada (AMP).
- GPU recomendadas: no disponible, pero un modelo de estas dimensiones (embedding 512, MLP 1024) es probablemente entrenable en GPUs de consumo medio-alto, como RTX 3090 o RTX 4090, con precision mixta.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano moderado del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: no aplica directamente, ya que es un checkpoint de entrenamiento, no un modelo de inferencia empaquetado. Para usarlo en inferencia habria que cargarlo con el codigo RuleLoopViT y la fuente LoopViT fijada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. El checkpoint es especifico del proyecto RuleLoopViT y no se dispone de datos de modelos alternativos con la misma arquitectura o finalidad en el contexto de ARC-AGI.

## Limitaciones y advertencias

- No es un modelo de inferencia independiente: requiere el codigo RuleLoopViT y la fuente LoopViT fijada por el proyecto para cargarse y utilizarse. No es compatible con la libreria Transformers ni con pipelines estandar de HuggingFace.
- Alcance limitado a ARC-AGI: el entrenamiento se ha realizado exclusivamente sobre el conjunto ARC-AGI, por lo que su capacidad de generalizacion a otras tareas visuales no esta garantizada.
- Estado de entrenamiento incompleto: con solo 10 épocas completadas, el modelo puede no haber convergido y su rendimiento en tareas de inferencia podria ser suboptimo.
- Riesgo de sobreajuste: al ser un checkpoint intermedio, podria presentar sesgos especificos del conjunto de entrenamiento que no se generalicen a datos no vistos.
- Dependencia de la integridad del archivo: es imprescindible verificar el SHA-256 del checkpoint (2d4857df682cade2a89f746a53e9f0a88e3168f3551dad5d465527d8905e4eb6) antes de reanudar el entrenamiento para evitar corrupcion de datos.
- Sin datos de sesgos o alucinaciones: al ser un modelo de vision puro, no aplican los sesgos de lenguaje, pero no se ha realizado una evaluacion de sesgos visuales en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el checkpoint esta vinculado a codigo externo (RuleLoopViT y LoopViT) cuyas licencias deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omrisap/ruleloopvit-small-epoch10
- Perfil del autor: https://huggingface.co/omrisap
- Dataset ARC-AGI: https://huggingface.co/datasets/omrisap/arc-agi-1-ruleloopvit-rules
- GitHub del autor: https://github.com/omrisap/
