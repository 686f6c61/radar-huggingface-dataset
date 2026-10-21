# AgastyaRai/banking77-oos-roberta

## Resumen

`AgastyaRai/banking77-oos-roberta` es un modelo publicado en HuggingFace por el usuario AgastyaRai, con arquitectura RoBERTa y pesos en formato safetensors. Por el nombre del repositorio, el modelo parece ser un ajuste fino (fine-tuning) de un encoder RoBERTa para clasificación de intenciones sobre el conjunto de datos Banking77, con algún tratamiento adicional de consultas fuera de dominio ("oos", out-of-scope). Esta interpretación se deduce exclusivamente del identificador del modelo: la informacion disponible no incluye model card, pipeline declarado ni descripcion de la tarea.

El recuento real de parametros registrado en los safetensors es de 124.684.082, cifra consistente con la arquitectura `roberta-base` (aproximadamente 125 M de parametros). Se trata, por tanto, de un modelo pequeno, orientado a inferencia en CPU o en GPU de consumo, y no de un modelo generativo de gran escala.

Su relevancia practica esta condicionada por la ausencia de documentacion: no se declara licencia, idiomas, pipeline ni mapping de etiquetas, y el repositorio acumula 5 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad. Resulta util como posible baseline de clasificacion de consultas bancarias o como pieza de deteccion de consultas fuera de alcance en un chatbot, pero requiere verificacion previa por parte de quien lo vaya a integrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only); la etiqueta del repositorio es `roberta`, sin especificar variante |
| Parametros totales | 124.684.082 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas ni configuracion de cuantizacion |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | No disponible |
| Tarea inferida | Clasificacion de intenciones (Banking77) con deteccion out-of-scope, segun el nombre del repositorio |
| Tamano del repositorio | 1.0 GB |
| Descargas / likes | 5 / 0 |
| Fecha de creacion / actualizacion | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de la familia RoBERTa, con 124.684.082 parametros, lo que encaja con la configuracion `roberta-base` (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion), aunque la informacion disponible no confirma explicitamente esa configuracion. Sobre el encoder se anade presumiblemente una cabeza de clasificacion tokenizada a nivel de secuencia, con un numero de etiquetas no documentado; el sufijo "oos" sugiere la incorporacion de una clase adicional para consultas fuera de las 77 intenciones de Banking77, pero no hay confirmacion.

No se dispone de informacion sobre el proceso de entrenamiento: no se indican tokens utilizados, composicion del dataset, hiperparametros, si hubo aumento de datos para la clase out-of-scope, ni si se aplicaron tecnicas de calibracion, destilacion o regularizacion. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, adaptadores) ni se publican curvas de entrenamiento o metricas de validacion. Cualquier afirmacion sobre el procedimiento de ajuste seria especulativa.

## Capacidades

- Clasificacion de texto a nivel de secuencia: asignacion de una consulta a una de las etiquetas definidas durante el ajuste fino (previsiblemente las 77 intenciones de Banking77).
- Deteccion de consultas fuera de alcance: el sufijo "oos" del nombre apunta a una clase para consultas que no pertenecen a ninguna intencion conocida, aunque el mapping de etiquetas no esta documentado.
- Inferencia rapida y ligera: 124,7 M de parametros permiten ejecucion en CPU con latencias de decenas de milisegundos por secuencia corta.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni modo "thinking".
- Capacidades multilingues: no disponibles; no se declara el conjunto de idiomas soportados.
- Capacidades multimodales (vision, audio): no disponibles; la arquitectura encoder de texto no las soporta.
- Ajuste adicional: al ser un modelo pequeno, es viable reajustarlo o destilarlo, sujeto a la licencia, que no se especifica.
- Capacidad de agentes: nula de forma nativa; solo podria participar como clasificador auxiliar dentro de un pipeline mayor.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasificaria cada consulta entrante en una de las 77 intenciones y la dirigiria al equipo o flujo correspondiente; su tamano permite desplegarlo detras de un servicio HTTP con coste minimo. Requiere verificar antes el mapping de etiquetas del repositorio.
- Guardrail de alcance en un chatbot: como etapa previa a un LLM generativo, filtraria consultas que no encajan en el dominio bancario (clase out-of-scope) para evitar respuestas fuera de tema o alucinaciones costosas.
- Triaje en atencion al cliente por correo: clasificacion por lotes de mensajes historicos para poblar un sistema de etiquetado o para analitica de motivos de contacto.
- Baseline de evaluacion interna: punto de partida reproducible para comparar con modelos propios de clasificacion de intenciones, dado su bajo coste de inferencia y su facil integracion con la libreria Transformers.
- Preetiquetado en anotacion humana: el modelo propone una intencion por consulta y el equipo de datos la corrige, reduciendo el tiempo de etiquetado en la construccion de un dataset propio.
- Enrutamiento en asistentes de banca movil: clasificacion en el dispositivo o en el borde (edge) si se exporta a ONNX, al caber holgadamente en memoria de moviles y navegadores.
- Filtrado previo en busquedas de FAQ: determinar la intencion de la consulta para recuperar el articulo de ayuda correcto antes de aplicar un motor de busqueda semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan metricas de exactitud, F1, precision o recall sobre el conjunto de test de Banking77, ni comparaciones con otros modelos, ni resultados de evaluacion de la deteccion out-of-scope (que suele medirse con AUC o con la tasa de falsos positivos frente a consultas fuera de dominio).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 124.684.082 parametros, no medida): en FP32 los pesos ocupan aproximadamente 0,50 GB; en FP16/BF16, unos 0,25 GB; en INT8, unos 0,12 GB. El consumo total incluye activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una RTX 3060, RTX 4060 o superior ofrece un margen amplio. No requiere A100 ni H100.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en iGPU y en CPU. Un modelo de este tamano se ejecuta en CPU con latencias del orden de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: Transformers (`AutoModelForSequenceClassification`) con PyTorch, exportacion a ONNX Runtime, TorchScript o `optimum`, y serving mediante FastAPI o similar. `llama.cpp` y Ollama no son adecuados, ya que estan orientados a modelos generativos en GGUF y no soportan cabezas de clasificacion. vLLM y TGI estan pensados para generacion y no aportan ventaja en este caso.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

Los datos de las alternativas son valores publicos de referencia y no han sido verificados en la busqueda proporcionada; los del modelo analizado proceden de la informacion del repositorio.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AgastyaRai/banking77-oos-roberta` | 124.684.082 | No disponible | Clasificacion de intenciones (Banking77) con posible clase OOS | No disponible | HuggingFace, 5 descargas |
| `roberta-base` (Facebook AI) | ~125 M | 512 tokens | Encoder base sin cabeza de tarea | MIT (referencia publica) | Ampliamente disponible |
| `distilbert-base-uncased` | ~66 M | 512 tokens | Encoder destilado, ajustable a clasificacion | Apache 2.0 (referencia publica) | Ampliamente disponible |
| `facebook/bart-large-mnli` | ~407 M | 1024 tokens | Clasificacion zero-shot via NLI | MIT (referencia publica) | Ampliamente disponible |

Frente a las alternativas, este modelo aporta un ajuste especifico al dominio bancario, pero carece de la documentacion, licencia e historial de uso que acompanan a los modelos de referencia. Para un despliegue en produccion seria prudente comparar su rendimiento real contra un `roberta-base` reajustado internamente sobre Banking77.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia explicita no se puede asumir permiso de uso comercial; es un bloqueante potencial para produccion.
- Ausencia de model card: no se documentan el mapping de etiquetas, el orden de las clases, el tokenizer exacto asociado ni la configuracion de entrenamiento, lo que impide interpretar la salida sin ingenieria inversa.
- Idioma no declarado: Banking77 es un conjunto en ingles, por lo que es probable que el modelo rinda mal en castellano u otros idiomas, aunque esto no esta confirmado en la informacion.
- Riesgo de alucinacion no aplicable en sentido estricto: al ser un clasificador, el riesgo equivalente es la sobreconfianza del softmax y la asignacion de una intencion conocida a consultas que deberian caer en la clase out-of-scope.
- Desplazamiento de dominio: un ajuste sobre 77 intenciones bancarias genericas puede degradarse ante productos, jerga o normativa de un mercado concreto.
- Sin validacion externa: 5 descargas y 0 likes indican que el modelo no ha sido reproducido ni auditado por terceros.
- Cabeza de clasificacion no verificada: el pipeline no esta declarado, por lo que puede faltar el mapeo `id2label` y ser necesario definirlo manualmente.
- Sesgos: no disponibles; no se ha publicado ningun analisis de sesgo ni de equidad por subpoblaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AgastyaRai/banking77-oos-roberta

No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo.
