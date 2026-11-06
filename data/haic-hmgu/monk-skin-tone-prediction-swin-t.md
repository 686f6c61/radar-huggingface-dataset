# haic-hmgu/monk-skin-tone-prediction-swin-t

## Resumen

`monk-skin-tone-prediction-swin-t` es un modelo de clasificación de imágenes desarrollado por haic-hmgu que predice el tono de piel según la escala Monk (del 1, el más claro, al 10, el más oscuro) a partir de fotografías dermatológicas. Además del tono, devuelve una probabilidad de que el tono sea legible en la imagen, lo que permite descartar fotografías donde el juicio no es fiable.

El modelo nace como subproducto de un proyecto de generación de descripciones dermatológicas (`haic-hmgu/dermatology-captioning-12b`, un Gemma 3 12B afinado) y su propósito principal es posibilitar la **evaluación estratificada por tono de piel** de modelos de dermatología sin necesidad de enviar imágenes a una API externa, un requisito habitual en auditorías de equidad (fairness).

Técnicamente se trata de un backbone Swin-T preentrenado en ImageNet-1k con 27,5 millones de parámetros, entrenado en dos etapas: primero sobre 34.015 imágenes etiquetadas por un LLM (GPT-4.1) y después afinado con 260 imágenes verificadas por un dermatólogo. Su utilidad actual es clara: auditar desequilibrios por tono de piel en datasets clínicos y habilitar métricas de rendimiento por tono, algo crítico dado el sesgo conocido de los atlas dermatológicos hacia pieles claras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (Swin-T), preentrenado en ImageNet-1k (torchvision) |
| Parametros totales | 27.549.704 (27,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada 224×224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (salida numerica, no textual) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (PyTorch, con codigo remoto via `trust_remote_code=True`) |

| Parametro adicional | Valor |
|---|---|
| Pipeline | image-classification |
| Entrada | RGB, lado corto redimensionado a 256, recorte central a 224×224 |
| Salidas | Tono Monk continuo en [1, 10] y P(tono legible) |
| Tamano del repositorio | 0,1 GB |
| Dependencias | torch, torchvision, transformers, pillow |

## Arquitectura y entrenamiento

El modelo emplea un backbone Swin Transformer en su variante Tiny (Swin-T), una arquitectura de vision basada en transformer con ventanas deslizantes de atencion jerarquica, preentrenada en ImageNet-1k mediante torchvision. Sobre el backbone se añaden cabezas de regresion ordinal para el tono Monk (tratado como valor continuo en [1, 10]) y una salida binaria de legibilidad del tono.

El entrenamiento se realizo en dos etapas. La primera utilizo 34.015 imagenes dermatologicas etiquetadas automaticamente por GPT-4.1, al que se le proporcionaron los diez colores de referencia de la escala Monk en valores HSL; estas etiquetas son generadas por modelo y, por tanto, imperfectas. La segunda etapa afino el modelo con 260 imagenes: 240 cuyo tono verifico un dermatologo y 20 ilegibles. El corpus total comprende 42.903 imagenes: DermNet de Kaggle (19.124), Fitzpatrick17k (17.051), DermNet scrapeado (5.728) y 1.000 fotografias de Unsplash no dermatologicas usadas como negativos fuera de dominio para la salida de legibilidad. Los splits estan estratificados por tono y dominio, y los 1.241 grupos de imagenes byte-identicas se asignan a un unico split para evitar fugas de datos.

Un detalle tecnico relevante es el tratamiento como **regresion ordinal** en lugar de clasificacion de 10 clases, lo cual es coherente con la naturaleza ordenada de la escala Monk y explica el uso de metricas como el kappa cuadratico ponderado.

## Capacidades

- Prediccion del tono Monk (1–10) como valor continuo en fotografias dermatologicas, con salida discreta y continua (`monk_tone` y `monk_tone_continuous`).
- Estimacion de la legibilidad del tono: probabilidad de que el tono pueda juzgarse en la imagen (`readable_probability` y flag `tone_readable`), util para excluir imagenes no evaluables.
- Etiquetado por lotes de datasets completos mediante `model.predict_images()`, pensado para auditorias masivas de equidad.
- Funcionamiento local: no requiere enviar imagenes a APIs externas, relevante para datos clinicos sensibles.
- Inferencia sencilla con `transformers` mediante `AutoModel` y `trust_remote_code=True`.

No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingues al no emitir lenguaje natural.

## Casos de uso

- **Evaluacion estratificada por tono de piel de modelos dermatologicos**: etiquetar un conjunto de evaluacion con el tono Monk y reportar metricas de rendimiento (sensibilidad, especificidad) por tono, detectando degradaciones en tonos oscuros.
- **Auditoria de desequilibrio de datasets clinicos**: analizar la distribucion de tonos de un corpus de imagenes dermatologicas antes de entrenar, para cuantificar el sesgo hacia pieles claras heredado de atlas como DermNet o Fitzpatrick17k.
- **Filtrado de imagenes no evaluables**: usar `tone_readable` para excluir automaticamente fotografias mal iluminadas, sin piel o fuera de dominio de un analisis de equidad.
- **Control de calidad en pipelines de anotacion clinica**: preetiquetar tonos Monk que un experto revise despues, reduciendo la carga de anotacion manual.
- **Investigacion en equidad de modelos medicos**: generar subgrupos por tono para estudios de calibracion y fairness sin depender de servicios en la nube, adecuado cuando las politicas de datos del hospital impiden el envio de imagenes a terceros.
- **Documentacion de limitaciones de datasets publicos**: caracterizar la cobertura por tono (por ejemplo, evidenciar que solo hay 17 imagenes legibles del tono 10 en el corpus de referencia) para publicar advertencias informadas.

## Benchmarks y rendimiento

Evaluacion sobre 120 imagenes verificadas por dermatologo (15 por tono, tonos 1–8), nunca vistas en ninguna etapa de entrenamiento:

| Metrica | Valor |
|---|---|
| MAE | 0,583 (IC 95 %: 0,475–0,700) |
| Exactitud exacta | 0,500 |
| Error dentro de un tono | 0,917 |
| Kappa cuadratico ponderado | 0,928 |
| Correlacion de Spearman | 0,929 |
| Sesgo medio (prediccion − referencia) | +0,017 |

Baseline sin aprendizaje (mediana de luminosidad de pixeles cutaneos mapeada al color Monk mas proximo): MAE 2,050, exactitud 0,208, kappa 0,371.

Sobre un split reservado de 4.258 imagenes etiquetadas por LLM: MAE 0,592, exactitud 0,517, kappa 0,893.

Rendimiento por tono:

| Tono | n | Exactitud | MAE | Prediccion media |
|---|---|---|---|---|
| 1 | 15 | 0,667 | 0,47 | 1,47 |
| 2 | 15 | 0,533 | 0,53 | 2,27 |
| 3 | 15 | 0,200 | 0,80 | 3,13 |
| 4 | 15 | 0,533 | 0,60 | 3,93 |
| 5 | 15 | 0,467 | 0,67 | 4,47 |
| 6 | 15 | 0,400 | 0,73 | 6,07 |
| 7 | 15 | 0,600 | 0,40 | 6,87 |
| 8 | 15 | 0,600 | 0,47 | 7,93 |

La legibilidad se evaluo sobre 4.258 imagenes reservadas; el README incluye un AUROC para esta tarea cuyo valor completo no esta disponible en la informacion proporcionada (la tabla aparece truncada).

## Requisitos de hardware

- Con 27,5 M de parametros en fp32 (~0,1 GB de pesos), el modelo cabe comodamente en cualquier GPU moderna e incluso en CPU.
- VRAM estimada para inferencia: menos de 1 GB en fp32; no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquiera; no se requiere acelerador dedicado. Una RTX 3060 o superior sobra con diferencia; tambien funciona en portatiles y CPU.
- Es un modelo de vision pequeno, no un LLM: no aplica la tipica aritmetica de VRAM por miles de millones de parametros.
- Despliegue: directamente con `transformers` (`AutoModel.from_pretrained` con `trust_remote_code=True`); no hay pesos GGUF ni soporte documentado para llama.cpp, Ollama, vLLM o TGI, que no serian apropiados al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; al ser un Swin-T a 224×224, se esperan inferencias de milisegundos por imagen en GPU y procesamiento por lotes eficiente con `predict_images()`.

## Comparativa con modelos similares

| | monk-skin-tone-prediction-swin-t | Modelos Monk de Google (Fitzpatrick/MSK dataset) | Fitzpatrick17k classifiers tipicos |
|---|---|---|---|
| Tarea | Tono Monk 1–10 + legibilidad, en dermatologia | Estimacion de tono Monk en imagenes generales | Clasificacion de tipo Fitzpatrick (I–VI) |
| Arquitectura | Swin-T (27,5 M) | no disponible | Tipicamente ResNet/EfficientNet |
| Datos de entrenamiento | 42.903 imagenes dermatologicas + 260 verificadas por experto | no disponible | Fitzpatrick17k (16.577 imagenes) |
| Licencia | CC-BY-4.0 | no disponible | varia |
| Disponibilidad | Pesos publicos en Hugging Face | no disponible | varia |

No existen comparaciones numericas directas publicadas contra otros estimadores de tono Monk en la informacion disponible; el unico baseline reportado es el heuristico sin aprendizaje descrito en benchmarks.

## Limitaciones y advertencias

- **Las etiquetas de preentrenamiento son generadas por GPT-4.1**, no por humanos; solo la etapa de afinado (240 imagenes) y la evaluacion (120 imagenes) usan verificacion dermatologica. El rendimiento en tonos con pocas etiquetas fiables puede degradarse.
- **Los tonos 9 y 10 no estan evaluados en absoluto**: el conjunto experto cubre 1–8, y el corpus completo contiene solo 177 y 17 imagenes legibles en esos tonos. No se puede afirmar nada sobre su fiabilidad en pieles muy oscuras.
- La exactitud exacta es peor en el tono 3 (0,200), donde los colores de referencia adyacentes estan mas proximos; el modelo es mas fiable midiendo error dentro de un tono (0,917 global) que acertando el tono exacto.
- **Uso clinico prohibido por diseño**: no es un dispositivo medico y no proporciona diagnostico.
- **No debe usarse para inferir raza, etnia o ascendencia**: la escala Monk describe como aparece la piel en una fotografia bajo su iluminacion, no la identidad de la persona.
- Fuera de dominio en fotografias no dermatologicas: los retratos generales no estan cubiertos y la salida de legibilidad suele rechazarlos, pero el tono se devuelve siempre, por lo que hay que leer obligatoriamente el flag `tone_readable`.
- El desequilibrio de tonos del corpus de entrenamiento (fuertemente sesgado hacia tonos claros: 14.571 imagenes del tono 2 frente a 17 del tono 10) es heredado de los atlas de origen y puede afectar a la calibracion.
- `trust_remote_code=True` implica ejecutar codigo de modelado del repositorio; revisarlo antes de usar en entornos sensibles.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al tratarse de un modelo entrenado con datos clinicos (DermNet, Fitzpatrick17k), conviene revisar tambien los terminos de esos datasets para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haic-hmgu/monk-skin-tone-prediction-swin-t
- Modelo de captioning dermatologico asociado: https://huggingface.co/haic-hmgu/dermatology-captioning-12b
- Paper referenciado en tags (arXiv:1901.07884): https://arxiv.org/abs/1901.07884
- Paper referenciado en tags (arXiv:2111.08851): https://arxiv.org/abs/2111.08851
