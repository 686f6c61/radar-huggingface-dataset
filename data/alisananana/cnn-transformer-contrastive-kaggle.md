# Alisananana/cnn-transformer-contrastive-kaggle

## Resumen

`Alisananana/cnn-transformer-contrastive-kaggle` es un repositorio experimental publicado en Hugging Face por el usuario Alisananana que contiene una implementación propia de una arquitectura híbrida CNN-Transformer orientada al aprendizaje contrastivo. No es un modelo entrenado: el archivo `model.safetensors` es una inicialización válida para pruebas de humo (*smoke tests*) y el propio autor declara explícitamente que no se reclama ninguna puntuación de benchmark. El repositorio incluye `predict.py` como artefacto principal, junto con `config.json` y `training_args.json`, que documentan la configuración de arquitectura y la receta de experimento por defecto.

El checkpoint contiene 33.088 parámetros totales según los metadatos de safetensors, un tamaño que queda tres o cuatro órdenes de magnitud por debajo de un transformer «base» convencional (habitualmente por encima de 100 millones de parámetros). La etiqueta «base» del `config.json` debe leerse como una etiqueta de escala interna del código, no como una referencia a familias tipo BERT-base. La arquitectura declarada combina atención de tipo *flash*, fusión mediante *gated fusion*, activación ReLU y normalización InstanceNorm.

Su relevancia es acotada pero concreta: sirve como esqueleto reproducible para experimentar con fusión CNN-Transformer en tareas contrastivas y para validar pipelines de entrenamiento y evaluación antes de escalar a configuraciones mayores. No es un modelo de lenguaje, no genera texto y no documenta tokenizador ni ventana de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN Transformer (híbrida CNN + transformer) |
| Parámetros totales | 33.088 (metadatos de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuye un checkpoint safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no se declara ningún idioma; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch); código ejecutable en `predict.py` |
| Escala declarada | «base» (etiqueta interna del config, no equivalente a BERT-base) |
| Tipo de atención | flash |
| Fusión | gated fusion |
| Activación | ReLU |
| Normalización | InstanceNorm |
| Optimizador por defecto | Adafactor con planificador de tipo *step* |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es una implementación *custom* (no basada en clases de `transformers`) que combina un extractor convolucional con bloques de atención tipo *flash* y un mecanismo de fusión con puerta (*gated fusion*). La normalización es InstanceNorm y la activación es ReLU. No se especifica el número de capas, la dimensión oculta, el número de cabezas, el tamaño de parche ni la resolución de entrada; esa información residiría en `config.json`, pero no se ha proporcionado su contenido. Tampoco se documenta si la atención es lineal o cuadrática, ni la estrategia exacta de la puerta de fusión (por canal, por token o escalar).

En cuanto al entrenamiento, `training_args.json` recoge una receta por defecto basada en Adafactor con un planificador de tipo *step*. El autor advierte de forma explícita que son valores de partida del script y no evidencia de una ejecución completada. No se indica número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en principio a un modelo contrastivo, pero no confirmado). Tampoco se documenta la función de pérdida contrastiva concreta (InfoNCE, Triplet, u otra), el tamaño de lote, la temperatura ni el presupuesto de cómputo. No se ha publicado ningún checkpoint entrenado.

## Capacidades

- Implementación de referencia ejecutable: `predict.py` incluye un bloque `__main__` con un ejemplo de prueba de humo que permite verificar la construcción del modelo.
- Entrenamiento contrastivo: el código está orientado a tareas de similitud y representación (pares positivos/negativos), no a generación.
- Fusión CNN-Transformer inspeccionable: al ser un código propio y de pequeño tamaño, permite modificar la arquitectura (atención, fusión, normalización) y observar el efecto antes de una ejecución completa.
- No soporta *tool calling* ni *function calling*: no hay interfaz de herramientas ni plantilla de chat.
- No soporta agentes ni razonamiento multi-paso: carece de modo *thinking* y de cualquier bucle de razonamiento.
- No tiene capacidades multilingües declaradas: no hay tokenizador ni vocabulario documentados.
- No dispone de visión, audio ni multimodalidad documentadas, pese a que el componente CNN podría procesar entrada visual si el código lo contemplase (no confirmado en la información disponible).
- No se declara compatibilidad con `AutoModel`/`AutoTokenizer` de Hugging Face: el autor indica que las APIs genéricas de carga automática requieren un adaptador explícito.

## Casos de uso

- Pruebas de humo de pipelines de aprendizaje contrastivo: usar el checkpoint de inicialización para verificar que la carga de safetensors, las formas de los tensores y el *forward pass* funcionan antes de lanzar un entrenamiento real.
- Investigación de arquitecturas de fusión: comparar *gated fusion* frente a alternativas (concatenación, suma ponderada, atención cruzada) manteniendo el resto del código fijo, gracias a que la implementación es legible y modificable.
- Ablaciones de atención y normalización: sustituir la atención *flash* por atención estándar o InstanceNorm por BatchNorm/LayerNorm y medir el efecto en la pérdida contrastiva sobre un conjunto propio.
- Desarrollo de un *harness* de evaluación reproducible: el autor propone evaluar sobre un conjunto *held-out* específico de la tarea, reportar la métrica con al menos tres semillas e incluir una línea base de capacidad equivalente; el repositorio sirve como banco de pruebas de ese protocolo.
- Punto de partida para competiciones tipo Kaggle: adaptar el esqueleto a tareas de *retrieval* o similitud sobre datos tabulares o de imagen del concurso, sustituyendo la cabeza contrastiva y el cargador de datos.
- Docencia y divulgación: con 33.088 parámetros, el modelo es lo bastante pequeño para entrenarlo en CPU y explicar en clase el funcionamiento de una pérdida contrastiva sin necesidad de infraestructura GPU.
- Verificación de integración continua (CI): incluir `predict.py` en un *job* de CI para detectar roturas en la construcción del modelo o cambios incompatibles en las dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara explícitamente que no reclama ninguna puntuación y que el checkpoint no ha sido entrenado; cualquier cifra que se publicase en el futuro debería documentarse por separado de los valores por defecto que aquí se distribuyen.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración; los pesos en fp32 ocupan aproximadamente 132 KB (33.088 parámetros × 4 bytes) y en fp16 unos 66 KB. Cálculo derivado del recuento de parámetros, no de una medición publicada.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluida una iGPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en todas; también se ejecuta íntegramente en CPU sin ajustes relevantes.
- Opciones de despliegue: PyTorch nativo a través de `predict.py`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje, no publica GGUF y no incluye tokenizador.
- Carga automática: requiere un adaptador explícito para `transformers` u otras APIs genéricas, según advierte el autor.
- Latencia y throughput: no disponible. Dado el tamaño del checkpoint, la latencia vendría dominada por el *overhead* del framework y por el preprocesado de entrada, no por el cálculo del modelo.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Entrenado | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| Alisananana/cnn-transformer-contrastive-kaggle | Esqueleto CNN-Transformer para contraste | No (inicialización) | 33.088 | no disponible | MIT |
| Encoders contrastivos preentrenados (familia SimCLR/CLIP) | Modelo entrenado | Sí | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Transformers «base» convencionales | Modelo de lenguaje entrenado | Sí | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

La comparación cuantitativa no es significativa: el repositorio no distribuye un modelo entrenado y el autor recomienda construir una línea base de capacidad equivalente («matched-capacity baseline») con el mismo presupuesto de datos, ajuste y semillas. Sin esa línea base, cualquier comparación de rendimiento con encoders contrastivos preentrenados sería inválida.

## Limitaciones y advertencias

- El checkpoint no está entrenado: son pesos de inicialización. No debe usarse para inferencia sobre tareas reales ni como sustituto de un modelo preentrenado.
- No se ha auditado robustez, equidad ni transferencia de dominio, tal como reconoce el autor.
- No hay información sobre sesgos: al no existir datos de entrenamiento documentados, no es posible evaluar sesgos de ningún tipo.
- Riesgo de alucinación no aplicable: el modelo no genera texto. El riesgo equivalente es producir representaciones sin significado útil, dado que los pesos son aleatorios.
- Sin idiomas ni tokenizador declarados: no se puede asumir soporte de ningún idioma ni de ninguna modalidad concreta.
- Inconsistencia de etiquetado: la escala «base» del config no se corresponde con los 33.088 parámetros reales; conviene no interpretarla como referencia a arquitecturas tipo BERT-base.
- Carga no estándar: al ser una implementación propia, `AutoModel.from_pretrained` no funcionará sin un adaptador; hay que revisar `predict.py` y `config.json`.
- Licencia MIT permite uso comercial del código y los pesos, pero el autor advierte de que deben revisarse por separado los términos de las fuentes de datos externas que se usen con el repositorio.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, repositorio de 0,0 GB y sin pipeline asociado; no hay evidencia externa de que el código funcione más allá de la prueba de humo indicada.
- Fecha de creación registrada como 2026-10-18, posterior a la fecha habitual de consulta; conviene verificar la procedencia del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/Alisananana/cnn-transformer-contrastive-kaggle
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
