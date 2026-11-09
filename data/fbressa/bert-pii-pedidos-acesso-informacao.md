# fbressa/bert-pii-pedidos-acesso-informacao

## Resumen

`fbressa/bert-pii-pedidos-acesso-informacao` es un clasificador binario de texto en portugués de Brasil, obtenido por fine-tuning de `neuralmind/bert-base-portuguese-cased`, que detecta si una solicitud de acceso a la información pública contiene datos personales (nombre, CPF, teléfono, correo electrónico, dirección y similares) y por tanto no debería publicarse. Lo desarrollaron Cayo Alencar, Filipe Bressanelli y Lys Coutinho en el marco del hackathon Participa DF, y su función es actuar como capa de filtrado en un pipeline híbrido de protección de datos bajo la LGPD brasileña.

El modelo es un BERT base (12 capas, 768 dimensiones ocultas) con 108.924.674 parámetros en formato safetensors, licencia MIT y ventana de entrada de 384 tokens con solapamiento de 128 en la implementación de referencia. No es un modelo generativo ni un extractor de entidades: devuelve una probabilidad por ventana de texto para la clase `privado`, y la decisión final se toma combinando esa puntuación con reglas regex y un umbral deliberadamente bajo (0,30) que prioriza el recall.

Su relevancia es acotada pero concreta: cubre un caso de uso de cumplimiento normativo (publicación segura de solicitudes de transparencia) donde los modelos generalistas multilingües no rinden igual en portugués jurídico-administrativo y donde el coste de un falso negativo (publicar un CPF) es mucho mayor que el de un falso positivo (retener una solicitud para revisión). Es un modelo de nicho, sin descargas ni validación externa publicada, pensado como línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 dimensiones ocultas) |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens por ventana (con solapamiento de 128 en la implementación de referencia); límite arquitectónico de BERT: 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión completa) |
| Idiomas soportados | portugués de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estándar con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) de dos etiquetas: `0 = publico` (sin datos personales, publicable) y `1 = privado` (contiene datos personales). El backbone es `neuralmind/bert-base-portuguese-cased`, un BERT entrenado específicamente sobre corpus en portugués de Brasil, lo que aporta vocabulario y representaciones ajustadas al registro administrativo brasileño.

El fine-tuning se realizó sobre solicitudes de acceso a la información proporcionadas por el hackathon Participa DF, etiquetadas por los organizadores como públicas o privadas. La model card no detalla el número de ejemplos, la composición del dataset, la proporción de clases ni si hubo aumento de datos. Tampoco se documenta ninguna innovación arquitectónica: es un fine-tuning supervisado convencional, sin RLHF, DPO ni decodificación especulativa. La innovación está en el sistema que lo envuelve, no en el modelo: ventanas solapadas de 384 tokens, agregación por máximo de la puntuación `privado` y umbral de decisión de 0,30 combinado con reglas regex para identificadores estructurados (CPF, teléfono, correo, CEP, nombres y direcciones en formatos del Distrito Federal).

## Capacidades

- Clasificación binaria de texto en portugués de Brasil: `publico` frente a `privado`.
- Detección de datos personales en lenguaje natural: nombres, CPF, teléfonos, correos electrónicos, direcciones y similares, siempre que aparezcan en el texto.
- Procesamiento de documentos largos mediante ventanas solapadas de 384 tokens y agregación por puntuación máxima.
- Integración directa con la API de `transformers` (`AutoTokenizer`, `AutoModelForSequenceClassification`) y con endpoints compatibles.
- Salida de probabilidad calibrada por clase, apta para umbralización configurable según la política de riesgo de la organización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No realiza extracción de entidades ni devuelve los fragmentos concretos que contienen los datos personales: solo una etiqueta y una probabilidad.

## Casos de uso

- Publicación segura de solicitudes de transparencia: antes de volcar un pedido de acceso a la información en un portal público, el modelo puntúa el texto por ventanas y retiene el documento si alguna supera el umbral de 0,30, evitando la exposición accidental de CPF, teléfonos o direcciones.
- Capa de triaje en un pipeline híbrido de cumplimiento LGPD: se ejecuta después de las reglas regex sobre identificadores estructurados y antes de la revisión humana, de modo que solo los casos dudosos llegan a un revisor.
- Moderación de contenido en portales de participación ciudadana: clasificación previa de mensajes y propuestas enviadas por ciudadanos para separar los que contienen datos personales de los que pueden publicarse íntegros.
- Anonimización asistida de corpus administrativos: uso del clasificador para seleccionar qué documentos de un archivo requieren redacción manual antes de liberarse como datos abiertos.
- Enrutado de tickets en atención al ciudadano: separar solicitudes con datos personales de las puramente informativas para dirigirlas a canales con control de acceso en lugar de a la cola de respuesta pública.
- Filtro previo en la construcción de datasets: descartar automáticamente registros con datos personales antes de usar un corpus de solicitudes públicas para entrenar otros modelos, reduciendo el riesgo de memorización de PII.
- Auditoría de conformidad: ejecución por lotes sobre un histórico de publicaciones para detectar solicitudes ya publicadas que deberían haberse retenido, con vistas a una revisión retroactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se conservaron métricas de evaluación sobre un conjunto de validación durante el hackathon y que el modelo debe tratarse como línea base, evaluándolo sobre datos etiquetados propios antes de usarlo.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,45 GB para los pesos (108,9 M de parámetros × 4 bytes) más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM en FP16/BF16: aproximadamente 0,22 GB de pesos; ejecutable en GPUs de gama baja e incluso en CPU con latencia aceptable para volúmenes moderados.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090 con batching. Para desarrollo y pruebas, RTX 3060, RTX 4060 o T4 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), y también en CPU para cargas por lotes no interactivas.
- Opciones de despliegue: `transformers` con PyTorch nativo, `text-generation-inference` no aplica (no es generativo), `vLLM` no aplica, `llama.cpp`/GGUF no disponible en el repo, `Ollama` no disponible; alternativas prácticas: `transformers` + FastAPI, `optimum` con ONNX Runtime, TorchScript o exportación a ONNX para servir con Triton.
- Latencia y throughput: no disponibles como cifras publicadas. Por el tamaño del modelo (BERT base), se espera latencia de milisegundos por ventana en GPU y decenas de milisegundos en CPU, pero son estimaciones de orden de magnitud, no medidas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fbressa/bert-pii-pedidos-acesso-informacao` | 108,9 M | 384 tokens por ventana | Clasificación binaria PII en pt-BR | MIT | Hugging Face, 0 descargas |
| `neuralmind/bert-base-portuguese-cased` | ~109 M | 512 tokens | Modelo base pt-BR (MLM/NSP), sin fine-tuning para PII | MIT | Hugging Face, ampliamente usado |
| `pierreguillou/ner-bert-base-cased-pt-lenerbr` | ~109 M | 512 tokens | NER de entidades en textos jurídicos pt-BR (incluye categorías de persona) | no disponible en la información consultada | Hugging Face |
| `Isotonic/deberta-v3-base_finetuned_ai4privacy_v2` (modelos de la familia ai4privacy) | ~184 M | 512 tokens | Detección de PII multilingüe, incluido portugués | no disponible en la información consultada | Hugging Face |

La comparación relevante es de tarea, no de tamaño: este modelo es un clasificador de documento completo, mientras que los modelos de NER devuelven los fragmentos concretos con PII, lo que facilita la redacción automática. Frente al BERT base portugués sin fine-tuning, la diferencia es la especialización en el dominio de solicitudes de acceso a la información del Distrito Federal. No se dispone de cifras comparativas de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con solicitudes de un contexto institucional concreto (Distrito Federal, Brasil); el rendimiento en otros organismos, registros o dominios no está validado y puede degradarse.
- Solo procesa texto: documentos adjuntos, imágenes, PDFs escaneados y formularios no están cubiertos.
- El umbral de 0,30 es deliberadamente bajo para privilegiar el recall de `privado`, lo que implica un volumen alto de falsos positivos y solicitudes retenidas para revisión humana.
- Usado de forma aislada, sin las reglas regex ni los guardrails del sistema completo, ofrece un filtro más débil que la solución de referencia.
- No se conservaron métricas de evaluación sobre un conjunto de validación: no hay cifras publicadas de precisión, recall, F1 ni AUC.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea tanto en falsos negativos (publicar PII) como en falsos positivos (retener solicitudes públicas).
- Sesgos potenciales derivados del dataset del hackathon: la distribución de etiquetas, los formatos de nombres y direcciones del Distrito Federal y el registro lingüístico administrativo pueden no representar otras regiones de Brasil.
- Sin descargas ni likes en el momento de la consulta, y sin validación independiente conocida: tratarlo como prototipo o línea base, no como componente listo para producción sin evaluación propia.
- La licencia MIT permite uso comercial y modificación, pero no exime del cumplimiento de la LGPD ni de otras normativas de protección de datos aplicables.
- Está concebido para asistir a la revisión humana, no para sustituirla; cualquier despliegue debe mantener un revisor en el circuito para los casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbressa/bert-pii-pedidos-acesso-informacao
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio de la solución completa: https://github.com/fbressa/hackathon-participaDf
- Paper de BERT (referencia arquitectónica): https://arxiv.org/abs/1810.04805
- Paper de BERTimbau (modelo base en portugués): https://arxiv.org/abs/2009.03532
