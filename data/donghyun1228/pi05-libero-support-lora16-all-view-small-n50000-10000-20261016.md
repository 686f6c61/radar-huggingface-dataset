# Donghyun1228/pi05-libero-support-lora16-all-view-small-n50000-10000-20261016

## Resumen

Este repositorio contiene un adaptador LoRA de rango 16 sobre el modelo base de robótica `pi05` (familia openpi), publicado por el usuario Donghyun1228. No es un modelo completo: es un conjunto de pesos adaptadores para el benchmark LIBERO, orientado a tareas de manipulación robótica y entrenado bajo el paradigma de inverse dynamics (IDM). El adaptador se entrena sobre una fuente concreta (`pi05-libero-support-probe-source-n50000-10000-20261015`) tomando como objetivo un prefijo de 50.000 frames de `libero-support-random-waypoint-300k-20261015`, con 10.000 actualizaciones frescas, batch 32, semilla 42, LR 1e-5, warmup 500 y EMA 0.999.

La particularidad técnica del adaptador es su cobertura: solo se entrenan 40 factores LoRA, mientras que las 51 hojas originales, los sesgos y las normalizaciones permanecen congelados. Los adaptadores (rank 16, alpha 16) se aplican a atención y MLP de visión, al stem y la cabeza de visión, a atención y MLP de acción, a AdaRMS de acción y a las E/S de acción y tiempo. No hay LoRA sobre el LLM. La dimensión 6 del IDM del gripper queda excluida, preservando en cambio las entradas/salidas de política de siete dimensiones y el control del gripper.

Su relevancia práctica es doble: por un lado, demuestra que es posible adaptar un modelo visión-lenguaje-acción con un presupuesto de entrenamiento reducido (40 factores) y mantener el rendimiento; por otro, publica un resultado de evaluación final de 1.814 sobre 2.000 episodios en LIBERO (90,7 % de éxito) con un protocolo de evaluación reproducible sobre MuJoCo 3.2.3. El repo ocupa 7,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, alpha 16) sobre modelo base de robótica `pi05` de la librería openpi; no se especifica la arquitectura completa del modelo base. Los adaptadores se insertan en visión (attention, MLP, stem, head), acción (attention, MLP, AdaRMS) y E/S de acción y tiempo |
| Parametros totales | No disponible (el repositorio ocupa 7,8 GB e incluye adaptadores y pesos asociados; la model card no declara el recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados. La model card indica que los adaptadores no EMA se pliegan en FP32 antes de la inferencia en BF16 |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; se trata de un modelo orientado a control robótico) |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible (librería `openpi`, tamaño de repo 7,8 GB) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base de la familia `pi05` dentro del ecosistema openpi, que combina percepción visual y generación de acciones. La model card describe los puntos de inserción de los adaptadores LoRA: atención y MLP de visión, stem y cabeza de visión, atención y MLP de acción, AdaRMS (normalización adaptativa por RMS) de acción y las E/S de acción y tiempo. Esta distribución sugiere una separación entre una torre de percepción visual y un experto de acción condicionado temporalmente mediante AdaRMS, aunque la ficha original no detalla la arquitectura interna del modelo base. Solo 40 factores LoRA reciben gradientes; las 51 hojas originales, los sesgos y las normalizaciones permanecen congelados, y no se aplica ningún LoRA sobre el LLM.

El procedimiento de entrenamiento parte del checkpoint fuente `pi05-libero-support-probe-source-n50000-10000-20261015` (commit `ea4f0bb2001e12d701af8a294f91da437e857f55`) y del objetivo `libero-support-random-waypoint-300k-20261015` (commit `32ed215baf01af7e82f927a62b108873aa70bd19`), del que se usa un prefijo de 50.000 frames. Se realizan 10.000 actualizaciones frescas con batch 32, semilla 42, tasa de aprendizaje 1e-5, warmup de 500 pasos y EMA de 0.999. La validación se hace con replay fijo en lazo abierto al inicio y cada 1.000 actualizaciones, y las etiquetas de experto nunca entran en los gradientes ni en la selección de modelo. La dimensión 6 del IDM del gripper queda excluida; se conservan las entradas/salidas de política de siete dimensiones y el control del gripper, y la muñeca (wrist) de la fuente se preserva.

## Capacidades

- Control robótico por imitación: genera acciones de manipulación a partir de observaciones visuales y del estado, evaluado en el benchmark LIBERO.
- Inverse dynamics: el adaptador incorpora un módulo IDM, con la dimensión 6 (gripper) excluida del mismo.
- Control de gripper: se mantienen las entradas/salidas de política de siete dimensiones y el control del gripper, aunque el IDM no cubra esa dimensión.
- Percepción visual multi-vista: la model card indica que se trabaja con vistas (etiqueta `all-view`, configuración `view_small`) y que se preserva la muñeca de la fuente.
- Acondicionamiento temporal de acciones: los adaptadores cubren las E/S de acción y tiempo y el AdaRMS de acción, lo que habilita la generación de secuencias de acción dependientes del tiempo.
- Integración con la librería openpi: pensado para servirse con el stack de inferencia openpi.
- Sin capacidades de lenguaje declaradas: no hay LoRA sobre el LLM ni se documentan capacidades multilingües, de tool calling o de agentes.

## Casos de uso

- Evaluación de manipulación en LIBERO: el adaptador está entrenado y validado específicamente para este benchmark, con un protocolo reproducible (MuJoCo 3.2.3, semilla de entorno 7, suite 8), lo que permite comparar métodos de adaptación bajo condiciones controladas.
- Investigación en adaptación eficiente de modelos VLA: al entrenar solo 40 factores LoRA sobre un modelo grande congelado, sirve como caso de estudio de cuánto rendimiento se puede recuperar con un presupuesto de actualizaciones reducido (10.000 pasos, batch 32).
- Aprendizaje por inverse dynamics: la inclusión de un módulo IDM con la dimensión del gripper excluida permite estudiar cómo el modelo infiere dinámicas a partir de pares de observaciones, útil para líneas de investigación sobre representaciones de acción.
- Servicio de políticas en simulación: la model card documenta un servidor con batch 16 y hasta 32 clientes, de modo que el adaptador puede desplegarse como servicio de inferencia para evaluar políticas en paralelo sobre instancias de MuJoCo.
- Punto de partida para nuevos fine-tunings: dado que se publican los commits exactos de origen y destino, el adaptador es un checkpoint intermedio reutilizable para continuar el entrenamiento o experimentar con otros prefijos de datos, por ejemplo ampliando los 50.000 frames utilizados.
- Reproducción de resultados: al documentarse semilla, EMA, warmup, protocolo de validación y configuración de evaluación, es utilizable como referencia para replicar resultados en robótica simulada.
- Análisis de estabilidad en BF16: el plegado de los adaptadores no EMA en FP32 antes de la inferencia en BF16 permite estudiar el efecto de la precisión numérica en el control robótico.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuracion |
|---|---|---|
| LIBERO (evaluacion final-only) | 1814/2000 (90,7 % de exito) | MuJoCo 3.2.3, env seed 7, server batch 16, max 32 clientes, suite 8 |

No se han publicado otros resultados de benchmarks en la informacion disponible. La model card advierte que las diferencias de RNG compartido en el servidor y de forma de batch en BF16 siguen el protocolo registrado, por lo que la reproducibilidad depende de replicar ese protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica requisitos de memoria ni GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Se infiere indirectamente que el stack puede ejecutarse con inferencia en BF16, pero no hay confirmacion de que quepa en GPU de consumo.
- Datos de despliegue disponibles: el repositorio pesa 7,8 GB y la evaluación se realizó con un servidor de batch 16 y hasta 32 clientes.
- Opciones de despliegue: librería openpi (declarada en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada. La comparación se limita a los checkpoints relacionados citados en la propia model card.

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `pi05-libero-support-lora16-all-view-small-n50000-10000-20261016` | Este adaptador LoRA | No disponible | No disponible | 1814/2000 en LIBERO | apache-2.0 |
| `pi05-libero-support-probe-source-n50000-10000-20261015` | Checkpoint fuente del entrenamiento | No disponible | No disponible | No disponible | No disponible |
| `libero-support-random-waypoint-300k-20261015` | Modelo objetivo (prefijo de 50.000 frames) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `pi05` de la librería openpi para poder ejecutarse.
- Alcance restringido al dominio entrenado: el ajuste se realiza sobre un prefijo de 50.000 frames del modelo objetivo y se valida únicamente en LIBERO; no hay evidencia de generalización a otros entornos o tareas.
- Sin evaluación más allá de LIBERO: no se publican resultados en otros benchmarks ni en entornos reales.
- Cobertura parcial del IDM: la dimensión 6 del IDM del gripper queda excluida, de modo que la inferencia de dinámicas del gripper no está cubierta por el adaptador.
- Capacidades de lenguaje no ajustadas: al no haber LoRA sobre el LLM, el comportamiento lingüístico del modelo subyacente no se modifica y no se declara ningún idioma soportado.
- Sensibilidad numérica: la model card señala que los adaptadores no EMA se pliegan en FP32 antes de la inferencia en BF16, y advierte de diferencias por RNG compartido y por forma de batch en BF16, lo que puede afectar a la reproducibilidad exacta de los resultados.
- Protocolo de selección de modelo: la validación se hace con replay fijo en lazo abierto y las etiquetas de experto no entran en gradientes ni en selección, por lo que el rendimiento reportado es final-only y no refleja una búsqueda de hiperparámetros exhaustiva.
- Licencia: los pesos se publican bajo apache-2.0, pero la model card no aclara la licencia del modelo base ni de los checkpoints fuente y objetivo, por lo que conviene verificar la licencia del modelo subyacente antes de un uso comercial.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-view-small-n50000-10000-20261016
- Checkpoint fuente citado: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015 (commit `ea4f0bb2001e12d701af8a294f91da437e857f55`)
- Modelo objetivo citado: https://huggingface.co/Donghyun1228/libero-support-random-waypoint-300k-20261015 (commit `32ed215baf01af7e82f927a62b108873aa70bd19`)
- Paper, blog, repositorio de código o demo: no disponibles en la informacion proporcionada.
