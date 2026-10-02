# Devatri/anlp-assignment2-part2-lion

## Resumen

El modelo `Devatri/anlp-assignment2-part2-lion` es un transformer denso de tipo decoder entrenado desde cero como parte de la segunda parte de un trabajo academico de la asignatura ANLP (Applied Natural Language Processing). El autor, Devatri, lo publica como artefacto de entregable: el repositorio contiene un unico `checkpoint.pt` de aproximadamente 0,3 GB que incluye el `state_dict` del modelo, su `model_configuration`, el estado del optimizador, el `grad_scaler` y contadores de tokens y pasos. No se trata, por tanto, de un modelo listo para produccion, sino de una evidencia reproducible de un experimento de entrenamiento.

El interes tecnico del artefacto esta en el optimizador: el modelo se entrena con Lion (EvoLved Sign Momentum), una alternativa a AdamW que solo mantiene un buffer de momento en lugar de dos, lo que reduce el estado del optimizador. El autor entrena una pasada completa sobre el split de entrenamiento del corpus `browndw/human-ai-parallel-corpus`, dividido por familia de documentos, y deja un `metrics.csv` con los checkpoints de cada optimizador evaluado entre el 10 % y el 100 % del entrenamiento, lo que sugiere un estudio comparativo entre optimizadores.

La relevancia es limitada fuera del ambito academico: no hay model card con resultados, no se declara licencia, no se especifican idiomas soportados ni longitud de contexto, y el formato de pesos es un checkpoint de PyTorch propietario que requiere el `model.py` del autor para reconstruirse. Cualquier evaluacion practica exige descargar el repositorio, inspeccionar `model_configuration` y clonar el codigo de definicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`DenseTransformer`, definido en `model.py`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (definida en `model_configuration` dentro del checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint en punto flotante de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (state dict de PyTorch con optimizador, grad scaler y contadores) |
| Optimizador | Lion |
| Dataset de entrenamiento | `browndw/human-ai-parallel-corpus` (split de entrenamiento, una pasada) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02 |
| SHA-256 del checkpoint | `74d4cfa3423734035c29f6279c9050cc72cf676fbc24cac7c5286631a5188df5` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso (sin mezcla de expertos ni componentes de estado recurrente, segun la propia denominacion `DenseTransformer`) implementado en un fichero `model.py` que no se detalla en la informacion disponible. La configuracion concreta (numero de capas, dimensiones, cabezas de atencion y longitud de contexto) se almacena serializada en la clave `model_configuration` del checkpoint y se reconstruye con `DenseTransformer(ModelConfig(**checkpoint['model_configuration']))`. El autor no publica esos hiperparametros en la model card, por lo que no es posible confirmar el tamano del modelo. Dado que el repositorio completo ocupa 0,3 GB e incluye pesos, estado del optimizador y `grad_scaler`, es presumible que se trate de un modelo de escala reducida, pero se trata de una inferencia y no de un dato confirmado.

El entrenamiento consiste en una unica pasada sobre el split de entrenamiento de `browndw/human-ai-parallel-corpus`, con la particion organizada por familia de documentos para evitar filtraciones entre conjuntos. El checkpoint conserva el estado del optimizador Lion, el `grad_scaler` (propio del entrenamiento en precision mixta) y contadores de tokens y pasos, lo que permite reanudar el entrenamiento de forma exacta. El fichero `metrics.csv` del repositorio recoge los checkpoints de todos los optimizadores comparados en el experimento, tomados en los puntos de 0,1 a 1,0 del progreso de entrenamiento. No se documenta el numero total de tokens vistos, la composicion detallada del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva: es la funcion basica esperable de un modelo de lenguaje denso entrenado con objetivo causal, aunque no se detalla en la informacion disponible.
- Modelado de lenguaje sobre textos del corpus `human-ai-parallel-corpus`, orientado a pares de texto humano y generado por IA.
- Reanudacion exacta del entrenamiento: el checkpoint incluye estado del optimizador, `grad_scaler` y contadores, lo que permite continuar el entrenamiento desde el punto guardado.
- Reproduccion experimental: el SHA-256 publicado permite verificar la integridad del checkpoint y comparar resultados entre optimizadores usando `metrics.csv`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Estudio comparativo de optimizadores: el artefacto sirve para reproducir la comparacion entre Lion y otros optimizadores en un mismo corpus, analizando `metrics.csv` y los checkpoints del 10 % al 100 % del entrenamiento.
- Material docente de la asignatura ANLP: permite a estudiantes inspeccionar como se serializa un `state_dict` completo (modelo, optimizador, `grad_scaler` y contadores) y como se reconstruye un modelo desde su configuracion.
- Analisis del corpus human-ai-parallel: el modelo puede usarse para estudiar como un LM pequeno entrenado en ese corpus modela la distribucion de texto humano frente a texto generado por IA.
- Punto de partida para ajuste fino: el checkpoint se puede cargar con `DenseTransformer` y continuar el entrenamiento en un dominio concreto, aprovechando el estado del optimizador ya guardado.
- Validacion de infraestructura de entrenamiento en precision mixta: la presencia del `grad_scaler` lo convierte en un caso de prueba para pipelines con AMP.
- Verificacion de integridad y trazabilidad de artefactos: el SHA-256 y los contadores de pasos y tokens permiten auditar la reproducibilidad del experimento.
- No se recomienda su uso en produccion: no hay licencia declarada, ni benchmarks, ni formatos de despliegue estandar (GGUF, safetensors), ni garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento presente es el fichero `metrics.csv`, que registra las metricas de los checkpoints de cada optimizador entre 0,1 y 1,0 del entrenamiento, pero sus valores no se incluyen en la model card y no se reproducen aqui.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende por completo de los parametros del modelo, que no se declaran. Como referencia del artefacto, el fichero `checkpoint.pt` pesa aproximadamente 0,3 GB e incluye pesos, estado del optimizador y `grad_scaler`; el modelo en si es previsiblemente mas pequeno que esa cifra, pero es una estimacion no confirmada.
- GPU recomendadas: no disponible. Si el modelo es de escala reducida (decenas de millones de parametros), seria ejecutable en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090; si el checkpoint es mayor de lo que sugiere su tamano, haria falta verificar la configuracion real.
- Compatibilidad con GPU de consumo: probable pero no confirmada, a falta de conocer el numero de parametros.
- Opciones de despliegue: limitadas. Al no publicarse safetensors ni GGUF, no hay integracion directa con vLLM, llama.cpp, Ollama o TGI. El uso requiere cargar el checkpoint con PyTorch y la clase `DenseTransformer` del `model.py` del autor, y despues exportar manualmente a safetensors o GGUF si se quiere servir con esos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada, dado que se trata de un entregable academico sin model card completa, sin licencia declarada y sin resultados publicados. La unica comparacion documentada es interna al propio experimento (los distintos optimizadores evaluados en `metrics.csv`), pero sus resultados no se incluyen en la informacion disponible.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devatri/anlp-assignment2-part2-lion | no disponible | no disponible | no disponible | no disponible | repositorio HuggingFace, 0 descargas |
| Otros checkpoints del mismo experimento (otros optimizadores) | no disponible | no disponible | en `metrics.csv` (valores no publicados) | no disponible | referenciados en `metrics.csv` |
| Modelos abiertos de la misma escala | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna, por lo que no hay autorizacion explicita de uso comercial y el modelo debe tratarse como material academico restringido.
- Sin datos de rendimiento: la model card no incluye resultados de evaluacion, de modo que no hay evidencia de calidad en ninguna tarea.
- Sin especificacion de idiomas: no se declara que lenguas cubre el entrenamiento, lo que impide anticipar su comportamiento en castellano.
- Sesgos: no evaluados ni documentados. El modelo hereda los sesgos del corpus `human-ai-parallel-corpus` sin ninguna mitigacion descrita.
- Riesgo de alucinacion: alto en terminos relativos, ya que no se documenta ningun ajuste de alineacion (RLHF, DPO) ni proceso de calibracion.
- Limitaciones de contexto: la longitud de contexto real esta oculta en `model_configuration` y no se publica; no se puede asumir ninguna ventana concreta.
- Artefacto no desplegable directamente: el formato `checkpoint.pt` con estado de optimizador no lo hace compatible con vLLM, llama.cpp, Ollama ni TGI sin conversion previa.
- Entrenamiento de una sola pasada: una unica epoca sobre un corpus especifico limita mucho la generalizacion y la competencia linguistica del modelo.
- Sobrescritura no documentada: `checkpoint.pt` contiene el estado de un unico optimizador; para reproducir otras configuraciones hay que recurrir a `metrics.csv`, cuyos valores no se publican en la model card.
- Fechas de creacion y actualizacion de 2026: el repositorio es reciente y no tiene descargas ni interacciones, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devatri/anlp-assignment2-part2-lion
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Fichero de metricas del repositorio: https://huggingface.co/Devatri/anlp-assignment2-part2-lion/blob/main/metrics.csv
- Checkpoint del modelo: https://huggingface.co/Devatri/anlp-assignment2-part2-lion/blob/main/checkpoint.pt
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
