# lindaSmail76/qiraa-studio-models

## Resumen

Qira'a Studio model assets es un repositorio de artefactos de despliegue publicado por lindaSmail76 que contiene los dos archivos de inferencia (`studio-models.zip` y `studio-xlsr.zip`) que consume la demo Qira'a Studio, una aplicación de investigación alojada como Space en Hugging Face. No se trata de un modelo único entrenado de forma monolítica, sino de un paquete heterogéneo de clasificadores acústicos orientados a la clasificación de audio de recitación coránica (las diez lecturas o *qira'at*).

El repositorio agrupa, por un lado, clasificadores acústicos adicionales de tipo CNN, BiLSTM, CRNN y parámetros de un modelo bayesiano; por otro, los deltas de cinco checkpoints de XLS-R afinados que la aplicación combina en un ensemble. El tamaño total del repositorio es de 0,7 GB, lo que es coherente con los deltas de fine-tuning sobre XLS-R más los pesos de los clasificadores ligeros, no con pesos completos de un modelo de gran escala.

Su relevancia es acotada y de carácter investigador: el propio autor lo describe como activos de despliegue para una demostración de investigación, no como un benchmark de rendimiento nuevo. Los modelos ofrecen sugerencias tentativas sobre las diez lecturas coránicas y, de forma explícita, no verifican la corrección de la recitación ni identifican al recitador. La licencia, los idiomas y los parámetros concretos no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble heterogéneo: CNN, BiLSTM, CRNN, modelo bayesiano y cinco checkpoints afinados de XLS-R (deltas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: recitación coránica en árabe, no declarado formalmente) |
| Licencia | no disponible |
| Formato de pesos | archivos ZIP con checkpoints y parámetros (`studio-models.zip`, `studio-xlsr.zip`); formato interno no disponible |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única. `studio-models.zip` contiene clasificadores acústicos adicionales basados en CNN, BiLSTM y CRNN, junto con parámetros de un modelo bayesiano. `studio-xlsr.zip` contiene los deltas de cinco checkpoints de XLS-R (modelo de reconocimiento de voz auto-supervisado de Meta, basado en wav2vec 2.0) afinados para la tarea de clasificación de las diez lecturas coránicas. La aplicación combina ambos conjuntos en un ensemble y fija una revisión concreta, verificando la integridad de los archivos antes de cargarlos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea de clasificación de audio). El autor indica explícitamente que el repositorio no contiene el SVM RBF exacto, sus vectores de soporte, las grabaciones de entrenamiento, las tablas de características ni las predicciones por clip. El corpus de referencia citado es AQQD (Annotated Quranic Qira'at Dataset), depositado en Harvard Dataverse.

## Capacidades

- Clasificación de audio de recitación coránica en diez lecturas (*qira'at*), con salida de sugerencias tentativas.
- Procesamiento de señal de voz mediante extractores acústicos CNN, BiLSTM y CRNN.
- Clasificación probabilística mediante un modelo bayesiano incluido en el paquete.
- Ensemble de cinco checkpoints XLS-R afinados, con verificación de integridad de artefactos por revisión fijada.
- No soporta generación de texto, tool calling, agentes, visión ni razonamiento multi-step.
- No realiza verificación de corrección de la recitación ni identificación del recitador (limitación declarada por el autor).

## Casos de uso

- Investigación en procesamiento de habla árabe: servir como referencia reproducible para estudiar ensembles de clasificadores acústicos sobre XLS-R en una tarea de clasificación cerrada de diez clases.
- Demostración educativa de *tajwid* y *qira'at*: la aplicación Qira'a Studio puede mostrar al estudiante una sugerencia tentativa de lectura, siempre con revisión humana dado que el modelo no verifica corrección.
- Reproducción de experimentos: al fijar una revisión y verificar los archivos, permite reproducir las predicciones de la demo en un entorno controlado.
- Comparación de arquitecturas ligeras: los clasificadores CNN, BiLSTM y CRNN incluidos permiten contrastar su comportamiento frente a los checkpoints XLS-R en la misma tarea.
- Punto de partida para fine-tuning propio: los deltas de XLS-R pueden servir de base para adaptar el ensemble a un corpus distinto de recitación, sujeto a la licencia (no declarada) de los pesos.
- Docencia en aprendizaje automático aplicado al audio: ejemplo práctico de ensemble heterogéneo con verificación de artefactos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio es un conjunto de activos de despliegue para una demostración de investigación y no un benchmark de rendimiento nuevo.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio completo ocupa 0,7 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo; los cinco checkpoints XLS-R afinados se cargan como deltas sobre el modelo base XLS-R, cuyo tamaño concreto no se especifica.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para el ensemble; no hay datos oficiales de requisitos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del paquete.
- Opciones de despliegue: la demo se sirve como Space de Hugging Face; el formato ZIP de los artefactos no es directamente compatible con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qira'a Studio model assets | Clasificación de qira'at (10 clases) | no disponible | no aplica | no disponible | Hugging Face (repo de artefactos) |
| XLS-R (base) | Reconocimiento de voz auto-supervisado | hasta 2B (según variante) | no aplica | MIT (variantes publicadas) | Hugging Face |
| wav2vec 2.0 | Reconocimiento de voz auto-supervisado | hasta 317M (large) | no aplica | MIT / Apache 2.0 (según variante) | Hugging Face |

No se dispone de datos de rendimiento del modelo para establecer una comparación cuantitativa con alternativas. La comparación anterior es únicamente estructural.

## Limitaciones y advertencias

- El autor declara que los modelos ofrecen sugerencias tentativas y no verifican la corrección de la recitación ni identifican al recitador.
- El repositorio no contiene el SVM RBF exacto, sus vectores de soporte, las grabaciones de entrenamiento, las tablas de características ni las predicciones por clip, lo que limita la reproducibilidad completa.
- Licencia no declarada: no puede asumirse uso comercial sin confirmación del autor.
- Idiomas no declarados formalmente; el dominio de aplicación es la recitación coránica en árabe.
- Riesgo de alucinación o clasificación errónea inherente a un ensemble de clasificadores acústicos sin verificación externa.
- Sesgos desconocidos: no hay información sobre la composición del corpus de entrenamiento ni sobre su cobertura de recitadores, regiones o estilos.
- Es un artefacto de investigación y demostración, no un componente listo para producción sin validación adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lindaSmail76/qiraa-studio-models
- Perfil del autor: https://huggingface.co/lindaSmail76
- Demo Qira'a Studio (Space): https://huggingface.co/spaces/lindaSmail76/qiraah-classifier
- Dataset AQQD en Harvard Dataverse: https://doi.org/10.7910/DVN/A8GM5Y
