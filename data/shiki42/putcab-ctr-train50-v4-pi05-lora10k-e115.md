# Shiki42/PutCab-CTR-Train50-V4-PI05-LoRA10K-E115

## Resumen

PutCab-CTR-Train50-V4-PI05-LoRA10K-E115 es un checkpoint de inferencia de robótica publicado en Hugging Face por el usuario Shiki42. Corresponde al experimento E115, en el paso 10.000, y consiste en una adaptación mediante LoRA sobre una base PI0.5, con un único «action expert», inicialización «PI0.5 Base mirror», batch de 16 y semilla de entrenamiento 87431. El dataset asociado es Shiki42/PutCab-CTR-Train50-V4 (commit 3b9629a729945005dabd7857803218d063134634) y el código de referencia es OpenPI, en el commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead.

El repositorio ocupa 6,3 GB e incluye parámetros en formato Orbax (JAX), assets de normalización específicos del dataset, configuración resuelta y metadatos de procedencia. El autor indica explícitamente que no es un checkpoint de Transformers y que debe cargarse con la versión correspondiente del código y la configuración de OpenPI, usando los assets de normalización incluidos. No tiene descargas ni «likes» en el momento de redactar esta ficha, y la licencia no está declarada.

Su relevancia es acotada y de carácter investigador. El propio autor lo describe como artefacto de investigación con una sola semilla y resultados de evaluación pendientes de auditoría, y señala que la cifra previamente reportada de CTR (FixedRole100, 80 %) sigue bajo investigación y que la publicación no confirma rendimiento ni afirmaciones de causalidad temporal. Cualquier uso debe tratar las cifras como no verificadas.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el autor describe una política robótica con adaptación LoRA sobre base PI0.5 y un único «action expert», sin detallar la arquitectura interna |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen en formato Orbax sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin declarar en la model card ni en los metadatos de Hugging Face) |
| Formato de pesos | Orbax (JAX); el autor indica que no es un checkpoint de Transformers |
| Tarea | no disponible; el dataset asociado se denomina PutCab-CTR-Train50-V4 |
| Modelo base | PI0.5, con inicialización «PI0.5 Base mirror» según el autor |
| Método de ajuste | LoRA |
| Paso de entrenamiento | 10.000 (experimento E115) |
| Tamaño de batch | 16 |
| Semilla de entrenamiento | 87431 |
| Dataset de entrenamiento | Shiki42/PutCab-CTR-Train50-V4, commit 3b9629a729945005dabd7857803218d063134634 |
| Código compatible | OpenPI, commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead |
| Tamaño del repositorio | 6,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base PI0.5 ni la del adaptador. Lo que sí consta es el procedimiento de ajuste: se parte de una base PI0.5, se aplica LoRA (adaptación de bajo rango) y se entrena un único «action expert» con inicialización «PI0.5 Base mirror», durante 10.000 pasos, con un tamaño de batch de 16 y semilla 87431. El contenido del repositorio son parámetros en formato Orbax, assets de normalización específicos del dataset, la configuración resuelta y los metadatos de procedencia.

No se detalla el número de tokens ni de episodios de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitación con objetivos concretos. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Los estados del optimizador y del cargador de datos se han omitido deliberadamente del repositorio, por lo que no es posible reanudar el entrenamiento exactamente desde este checkpoint, solo realizar inferencia.

## Capacidades

- Ejecución de una política robótica entrenada: el artefacto es un checkpoint de inferencia para la tarea asociada al dataset PutCab-CTR-Train50-V4; la model card no especifica las observaciones de entrada ni el formato exacto de las acciones de salida.
- Adaptación paramétrica eficiente: al ser un ajuste LoRA sobre una base PI0.5, está pensado para cargarse junto con el código y la configuración de OpenPI en el commit indicado.
- Reutilización de normalización: incorpora assets de normalización específicos del dataset, necesarios para que las entradas y salidas sean coherentes con el entrenamiento.
- Trazabilidad: incluye configuración resuelta y metadatos de procedencia (commit del dataset, commit del código, semilla y paso de entrenamiento).
- Generación de texto: no aplica; no es un modelo de lenguaje.
- Tool calling / function calling: no disponible / no aplica.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles en la documentación proporcionada, más allá de lo que implique la política robótica subyacente.

## Casos de uso

- Reproducción controlada de la tarea PutCab: cargar el checkpoint con el commit exacto de OpenPI y los assets de normalización incluidos para ejecutar la política en el mismo entorno y con las mismas condiciones de entrenamiento, verificando que la configuración resuelta coincide.
- Auditoría de resultados de investigación: dado que la evaluación figura como pendiente de auditoría y la cifra de CTR está bajo investigación, este checkpoint sirve como material para intentar reproducir o refutar las afirmaciones reportadas, sin darlas por válidas.
- Estudio de ajuste eficiente en robótica: comparar el comportamiento de esta adaptación LoRA de 10.000 pasos con ajustes completos o con otros adaptadores del mismo autor sobre la misma base PI0.5, midiendo tasa de éxito en la tarea y coste de entrenamiento.
- Punto de partida para fine-tuning posterior: al ser un adaptador de bajo rango, puede servir como inicialización para entrenar sobre un dataset distinto, siempre que se respete la versión de OpenPI y se reconstruyan los assets de normalización del nuevo dataset.
- Evaluación en simulación o en banco de pruebas: integrar la política en un bucle de control offline (replay de episodios grabados) para medir desviación respecto a las acciones humanas antes de desplegarla en hardware real.
- Análisis de sensibilidad a la semilla: el artefacto documenta una única semilla (87431), por lo que puede usarse como referencia inicial para lanzar réplicas con otras semillas y cuantificar la varianza del resultado.
- Pruebas de seguridad de políticas robóticas: someter el checkpoint a observaciones fuera de distribución para caracterizar su comportamiento y sus modos de fallo antes de cualquier uso en un sistema físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tabla de métricas y señala que la evaluación sigue pendiente de auditoría. Menciona además que la cifra previamente reportada de CTR (FixedRole100, 80 %) permanece bajo investigación y que la publicación no confirma ni el rendimiento ni las afirmaciones sobre causalidad temporal. En consecuencia, ese 80 % no debe citarse como resultado validado de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de tamaño, el repositorio ocupa 6,3 GB, pero la documentación no aclara si ese volumen corresponde a los pesos fusionados, solo al adaptador o al conjunto de parámetros más assets, ni si la base PI0.5 debe cargarse por separado.
- GPU recomendadas: no disponible; el autor no documenta hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse que quepa en una GPU de gama de consumo.
- Opciones de despliegue: la única vía documentada es el código y la configuración de OpenPI (JAX) en el commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead. El autor indica que no es un checkpoint de Transformers, por lo que pila de servicio habituales para modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no están soportadas según la documentación disponible.
- Latencia y throughput: no disponible.
- Requisitos adicionales: es imprescindible emplear los assets de normalización incluidos en el repositorio; los estados de optimizador y del cargador de datos están omitidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PutCab-CTR-Train50-V4-PI05-LoRA10K-E115 (este modelo) | no disponible | no disponible | no disponible; evaluación pendiente de auditoría | no disponible | Hugging Face, 0 descargas |
| PI0.5 base (mencionado por el autor como origen) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Ajuste completo equivalente sobre PI0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de los modelos comparables, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo etiqueta como tal, con una sola semilla de entrenamiento y evaluación pendiente de auditoría; no debe presentarse como un modelo validado.
- Afirmaciones no confirmadas: la cifra de CTR (FixedRole100, 80 %) está bajo investigación y la publicación no confirma rendimiento ni causalidad temporal; no debe citarse como resultado de este checkpoint.
- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción sin aclaración previa del autor.
- Dependencia estricta del código: requiere el commit concreto de OpenPI y la configuración resuelta; cambios de versión pueden romper la carga de los parámetros en formato Orbax.
- Dependencia de los assets de normalización: el propio autor indica que deben usarse los assets incluidos; ignorarlos altera la interpretación de las entradas y salidas.
- Imposibilidad de reanudar entrenamiento: los estados del optimizador y del cargador de datos se han omitido, por lo que solo se puede hacer inferencia.
- Riesgo de sobreajuste a la tarea: al tratarse de un ajuste específico sobre el dataset PutCab-CTR-Train50-V4, el comportamiento fuera de esa distribución es desconocido.
- Riesgo de acciones inseguras: en robótica, una política fuera de distribución puede generar comandos incorrectos o peligrosos; se requiere supervisión y límites de seguridad en hardware real.
- Idiomas y contexto: no se declara ningún idioma soportado ni longitud de contexto, lo que limita cualquier evaluación multilingüe o de conversaciones largas.
- Sin métricas publicadas: no hay datos de benchmarks en la información disponible, por lo que no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/PutCab-CTR-Train50-V4-PI05-LoRA10K-E115
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-CTR-Train50-V4 (commit 3b9629a729945005dabd7857803218d063134634)
- Código compatible: OpenPI, commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead (el autor no incluye la URL del repositorio en la información proporcionada)
- Resultados de búsqueda web: los enlaces recuperados tratan sobre transporte como servicio relacionado en educación especial (normativa IDEA e IEP) y no guardan relación con este modelo; no se han encontrado fuentes adicionales relevantes.
