# Manas206/anlp-assignment2-part1-v3-partial

## Resumen

`Manas206/anlp-assignment2-part1-v3-partial` es un modelo de traduccion automatica publicado en HuggingFace con pipeline declarado `translation` y etiqueta `mixture-of-experts`. Segun su propia model card, se trata de un modelo decoder-only escrito en PyTorch personalizado, sin partir de ningun transformer preentrenado, con un tokenizador byte-level BPE compartido de 16.000 tokens y una capacidad de contexto de 384 tokens. El autor lo identifica como un trabajo de asignatura ("anlp-assignment2", parte 1, version 3) y como una ejecucion parcial.

El modelo se entrena para traducir hacia ingles desde vietnamita o japones, usando el formato de prompt `<bos> <vi-or-ja> SOURCE <en>`. El checkpoint corresponde a 6.300 actualizaciones de entrenamiento sobre 36.302.363 tokens de entrenamiento sin contar padding, empleando el split oficial de entrenamiento del dataset `belumind/en-vi-ja-curated-500k-triplets`.

Su relevancia es limitada y de ambito academico o experimental: no hay licencia declarada, no hay idiomas declarados en los metadatos de HuggingFace, no se publican resultados de benchmarks y el propio autor advierte que la version 3 no esta igualada en presupuesto de entrenamiento con las variantes completadas. Es util como artefacto reproducible de un ejercicio de construccion de un transformer con capa MoE y como base para experimentos de traduccion de frases cortas, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only en PyTorch personalizado, con mezcla de expertos (tag `mixture-of-experts`); numero de expertos y de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | traduccion hacia ingles desde vietnamita y japones (segun el formato de prompt `<vi-or-ja>` a `<en>`); no hay lista oficial de idiomas en los metadatos |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch nativo (libreria `pytorch`); no se ofrecen safetensors ni GGUF |

Otros datos de interes: vocabulario de 16.000 tokens (byte-level BPE compartido entrada/salida), logits de salida con forma `[batch, time, 16000]`, dependencias `torch==2.7.0` y `tokenizers==0.23.1`, tamano del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un decoder-only escrito desde cero en PyTorch, sin inicializacion a partir de un transformer preentrenado. La model card menciona explicitamente la etiqueta `mixture-of-experts`, pero no detalla el numero de expertos, el mecanismo de enrutamiento, la top-k de activacion, el numero de capas, la dimension oculta ni el numero de cabezas de atencion. El tokenizador es un BPE byte-level compartido entre entrada y salida, con un vocabulario de 16.000 tokens, y la capacidad de contexto declarada es de solo 384 tokens. La traduccion se controla mediante un prompt con tokens especiales de idioma: `<bos> <vi-or-ja> SOURCE <en>`.

En cuanto al entrenamiento, se reportan 6.300 actualizaciones y 36.302.363 tokens de entrenamiento sin contar padding, sobre el split oficial de entrenamiento del dataset `belumind/en-vi-ja-curated-500k-triplets` (pares de traduccion en-vi-ja). El propio autor indica que v3 es una ejecucion parcial y que no esta igualada en presupuesto de entrenamiento con las variantes completadas. No hay informacion sobre composicion exacta del dataset, hiperparametros del optimizador, estrategia de learning rate, ni sobre si se aplico RLHF, DPO, destilacion o decodificacion especulativa. Los datos de procedencia del checkpoint y los ajustes de evaluacion se suministran como ficheros JSON dentro del repositorio, pero su contenido no se detalla en la informacion disponible.

## Capacidades

- Traduccion de vietnamita a ingles mediante el token de idioma `<vi>` en el prompt.
- Traduccion de japones a ingles mediante el token de idioma `<ja>` en el prompt.
- Generacion autoregresiva de texto en el idioma destino (ingles) con un decoder-only que devuelve logits de 16.000 clases.
- Codificacion y decodificacion con un unico tokenizador byte-level BPE compartido para origen y destino.
- Manejo de secuencias de hasta 384 tokens, incluyendo la parte de origen y la de destino.
- Carga mediante API propia: `from load_model import load_model; model, tokenizer = load_model(directory)` y llamada a `model.forward(input_ids, attention_mask)`.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo "thinking" ni capacidades multimodales.
- No hay evidencia de capacidades multilingues mas alla de los pares indicados; la traduccion inversa (ingles a vietnamita o japones) no se declara soportada.

## Casos de uso

- Practica docente y reproduccion de resultados: el modelo forma parte de una asignatura (ANLP, tarea 2, parte 1) y su interes principal es reproducir el pipeline de carga descrito en la model card con `torch==2.7.0` y `tokenizers==0.23.1` para comparar con las variantes completas del mismo autor.
- Traduccion de frases cortas vi→en o ja→en en un cuaderno de investigacion: con un contexto de 384 tokens, encaja bien en ejemplos de una o dos frases, donde la limitacion de ventana no penaliza.
- Baseline interno para experimentos de mezcla de expertos: sirve como referencia de un decoder-only MoE de vocabulario pequeno para medir el efecto de cambiar el numero de expertos, el enrutador o el presupuesto de entrenamiento.
- Pruebas de integracion de pipeline de traduccion: al exponer una API minima (`load_model` mas `model.forward`), es comodo para validar el andamiaje de un servicio de traduccion (tokenizacion, batching, postprocesado) antes de sustituir el modelo por uno de mayor calidad.
- Filtrado y preanotacion de corpus: se puede usar para generar traducciones preliminares de pares vi-en o ja-en de baja criticidad y despues revisarlas o descartarlas con un modelo mayor.
- Experimentos de destilacion o ajuste fino: al ser un checkpoint parcial y pequeno (repositorio de 0,1 GB), es un candidato practico para probar recetas de fine-tuning o de recorte sobre datos de `belumind/en-vi-ja-curated-500k-triplets`.
- Demostraciones offline en equipos modestos: el tamano reducido del repositorio permite ejecutarlo en CPU o en GPU de gama baja para talleres, siempre que las frases respeten el limite de 384 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de traduccion (BLEU, chrF, COMET), ni resultados en tareas generales como MMLU, GSM8K o HumanEval, ni comparaciones con otras variantes del mismo autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Con un repositorio de 0,1 GB de pesos en precision nativa, la huella en memoria es previsiblemente inferior a 1 GB en fp32, aunque el numero real de parametros, el numero de expertos y la dimension de las activaciones no estan declarados.
- GPU recomendadas: no disponible. Por el tamano del checkpoint, cualquier GPU con al menos unos pocos GB de memoria deberia ser suficiente; se trata de una estimacion basada en el tamano del repositorio, no de un dato publicado.
- GPU de consumo: previsiblemente cabe en practicamente cualquier GPU de consumo actual y en CPU, dado el tamano del artefacto, pero no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: el autor solo documenta el uso directo en PyTorch mediante `load_model` desde el propio repositorio. No se distribuyen pesos en GGUF, por lo que no hay una ruta directa a llama.cpp u Ollama sin una conversion previa; tampoco hay plantillas de vLLM, TGI o SGLang publicadas.
- Latencia y throughput: no disponibles. El contexto tan corto (384 tokens) limita el throughput util en cualquier caso.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de informacion publica general y no han sido verificados en la informacion proporcionada para esta ficha; los del modelo descrito provienen de su model card.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Manas206/anlp-assignment2-part1-v3-partial | no disponible | 384 | no disponible | no publicado | Pesos PyTorch en HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt (pares vi/en, ja/en) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible | Pesos HuggingFace ampliamente desplegados |
| facebook/nllb-200-distilled-600M | 600M (dato publico) | no disponible | no disponible en esta ficha | no disponible | Pesos HuggingFace |

En terminos cualitativos, el modelo aqui descrito es un ejercicio academico de un solo autor, sin licencia declarada y con contexto muy reducido, frente a familias de traduccion consolidadas con soporte multilingue amplio, versiones cuantizadas y herramientas de despliegue mantenidas. No se dispone de ninguna comparacion empirica directa entre ellos en la informacion consultada.

## Limitaciones y advertencias

- Ejecucion parcial: el propio autor advierte que v3 no esta igualada en presupuesto de entrenamiento con las variantes completadas, por lo que la calidad esperable esta por debajo de estas.
- Longitud de contexto muy reducida (384 tokens): las frases largas o los documentos de varios parrafos se truncaran, con perdida de informacion.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni obra derivada; en la practica esto impide un uso comercial seguro sin autorizacion explicita del autor.
- Sin idiomas declarados en los metadatos de HuggingFace, aunque el formato de prompt sugiere vi→en y ja→en; la traduccion inversa no esta documentada.
- Riesgo de alucinacion y de traducciones fluidas pero incorrectas: al no haber sido entrenado sobre un transformer preentregado y contar con solo 36,3 millones de tokens de entrenamiento, es esperable una cobertura lexica y de dominio limitada.
- Ausencia total de evaluacion publicada (sin BLEU, chrF ni COMET), lo que impide estimar su calidad de forma objetiva.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso, y sin variantes cuantizadas ni integraciones con servidores de inferencia.
- Dependencias estrictas de versiones (`torch==2.7.0`, `tokenizers==0.23.1`); desviarse de ellas puede romper la carga del modelo.
- Las fechas de creacion y actualizacion del repositorio aparecen en 2026 segun los metadatos, un dato anomalo que conviene verificar antes de citarlo.
- Cero descargas y cero likes: no hay evidencia de uso por terceros ni de validacion externa.
- La carga requiere anadir el directorio del repositorio a `sys.path` y ejecutar codigo Python del propio autor; conviene auditar ese codigo antes de ejecutarlo en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manas206/anlp-assignment2-part1-v3-partial
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Paper, blog, repositorio o demo adicionales: no disponible. Los resultados de busqueda web asociados a esta consulta no guardan ninguna relacion con el modelo y no se incluyen como referencias.
