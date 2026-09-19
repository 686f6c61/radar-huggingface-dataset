# aapo33/cores-ai-tr-v1.0.0-85m

## Resumen

Cores-AI TR v1.0.0-85M es un modelo de lenguaje generativo de tipo decoder-only Transformer entrenado desde cero (from scratch) exclusivamente con datos en turco por el autor aapo33, con repositorio de código asociado en la cuenta de GitHub westabdu. El modelo tiene 81.165.440 parámetros (~81,17 M), 10 capas, 10 cabezas de atención, dimensión de embedding de 640 y una longitud de contexto de 512 tokens. Su objetivo declarado es capturar la estructura semántica y sintáctica del turco, incluyendo el comportamiento aglutinante de la lengua, mediante un tokenizer BPE propio de 50.000 tokens.

Se trata de un modelo base (no instruido) construido sobre una implementación tipo nanoGPT, entrenado durante 5.000 pasos con el optimizador AdamW sobre una GPU Colab T4, lo que equivale a aproximadamente 204,8 millones de tokens procesados. La mezcla de datos combina Wikipedia en turco, preguntas de matemáticas y lógica, y diálogos de conversación en turco. La pérdida de validación final reportada es de 2,8424, partiendo de una pérdida de entrenamiento inicial de 10,93.

Su relevancia es acotada pero concreta: se trata de un ejercicio de entrenamiento completo de un LM en turco con licencia MIT, reproducible en hardware de consumo y con código de inferencia propio publicado. No emplea la librería `transformers` de Hugging Face de forma nativa, no publica benchmarks y no ofrece cuantizaciones estándar (GGUF, GPTQ, AWQ), por lo que su uso práctico exige clonar el repositorio del autor y ejecutar el script `sample_tr.py`. El modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), implementacion basada en nanoGPT |
| Parametros totales | 81.165.440 (~81,17 M); el nombre del repositorio indica 85M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | No disponible en la informacion proporcionada; el repositorio ocupa 1,0 GB y requiere codigo propio para cargar los pesos |
| Capas / cabezas de atencion | 10 capas / 10 cabezas |
| Dimension de embedding | 640 |
| Vocabulario | 50.000 tokens, tokenizer BPE especifico de turco (`tokenizer_tr_v2.json`) |
| Pipeline | text-generation |
| Inferencia en Hugging Face | Deshabilitada (`inference: false`) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only causal, implementado sobre una base tipo nanoGPT, con 10 capas, 10 cabezas de atencion, dimension de embedding de 640 y una ventana de contexto de 512 tokens. Emplea un tokenizer BPE entrenado especificamente para turco con un vocabulario de 50.000 tokens, lo que permite representar de forma mas eficiente la morfologia aglutinante del idioma que un tokenizer multilingue generico. No se documenta el uso de atencion lineal, decodificacion especulativa ni mecanismos hibridos SSM.

El entrenamiento se realizo desde cero (sin inicializacion a partir de otro modelo) con el optimizador AdamW durante 5.000 pasos sobre una GPU Colab T4, procesando aproximadamente 204,8 millones de tokens. La composicion del dataset es una mezcla de Wikipedia en turco, conjuntos de preguntas de matematicas y logica, y dialogos conversacionales en turco. La perdida de entrenamiento inicial fue de 10,93 y la mejor perdida de validacion alcanzada fue de 2,8424. No se menciona en la informacion disponible ninguna fase de ajuste por instrucciones, RLHF ni DPO, y el propio autor lo clasifica explicitamente como modelo base.

## Capacidades

- Generacion de texto en turco por completado causal: dado un prefijo, el modelo continua el texto de forma estadisticamente coherente.
- Capacidad limitada de resolucion de problemas aritmeticos y de logica sencillos, derivada de la inclusion de conjuntos de matematicas y logica en el entrenamiento.
- Reproduccion de patrones conversacionales basicos en turco, procedentes de los datos de dialogo de la mezcla de entrenamiento.
- Manejo de la morfologia aglutinante del turco gracias a un tokenizer BPE especifico de 50.000 tokens.
- No dispone de modo de razonamiento explicito (thinking mode), ni capacidad de vision, audio o multimodalidad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No es un modelo instruido: no sigue ordenes ni mantiene el formato de chat de forma fiable.
- Multilingueismo: no disponible; el unico idioma declarado es el turco.

## Casos de uso

- Generacion de texto turco de dominio general: el modelo puede completar parrafos y frases en turco con coherencia local, util para prototipos de redaccion asistida donde no se requiera precision factual alta.
- Investigacion sobre tokenizacion del turco: el tokenizer BPE de 50.000 tokens y el codigo de entrenamiento publicados permiten estudiar como afecta un vocabulario especifico al rendimiento en una lengua aglutinante frente a tokenizers multilingues.
- Docencia y experimentacion en entrenamiento de LLM: al ser un modelo pequeno entrenado desde cero con 5.000 pasos en una T4, sirve como caso de estudio reproducible de un pipeline completo (datos, tokenizer, entrenamiento, inferencia) para cursos y talleres.
- Generacion de material de relleno o sintetico en turco: util para aumentar corpus de texto turco en tareas de preprocesamiento o pruebas de carga de sistemas, siempre con revision humana.
- Experimentos de fine-tuning sobre una base turca: al ser un modelo base de 81 M de parametros con licencia MIT, es un punto de partida de bajo coste para ajustes supervisados en dominios concretos (por ejemplo, clasificacion de texto mediante cabezas adicionales).
- Despliegue en entornos con recursos muy limitados: con ~162 MB en FP16 o ~81 MB en int8, puede ejecutarse en CPU o en GPUs integradas para demos locales de generacion de texto en turco.
- Pruebas de completado en dominios de matematicas escolares: el modelo tiende a producir problemas aritmeticos simples por imitacion de los datos de entrenamiento, aprovechable como generador de enunciados de ejemplo (no como solucionador fiable).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. Los unicos datos de rendimiento reportados son las metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento inicial | 10,93 |
| Mejor perdida de validacion | 2,8424 |
| Pasos de entrenamiento | 5.000 |
| Tokens procesados (aproximado) | 204,8 millones |
| Hardware de entrenamiento | GPU Colab T4 |
| Optimizador | AdamW |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 81,17 M de parametros):
  - FP32: aproximadamente 325 MB solo de pesos, mas activaciones y cache KV (el contexto es de solo 512 tokens).
  - FP16/BF16: aproximadamente 162 MB de pesos.
  - int8: aproximadamente 81 MB.
  - int4: aproximadamente 40 MB.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; el modelo se entreno en una T4 y funcionara sin problema en GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en CPU para inferencia interactiva.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas, dado su tamano reducido.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura es personalizada y no esta integrada en `transformers`. El unico metodo documentado es clonar el repositorio de GitHub, instalar `requirements.txt` y ejecutar `sample_tr.py` con los pesos y el tokenizer descargados en la misma carpeta.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| Cores-AI TR v1.0.0-85M (aapo33) | 81,17 M | 512 tokens | Turco | MIT | No | Pesos en HF, inferencia con codigo propio |
| GPT-2 small (referencia general de la categoria) | 124 M | 1.024 tokens | Ingles | Licencia tipo MIT modificada | Si, ampliamente documentados | Integrado en `transformers`, GGUF disponible en la comunidad |
| Otros modelos GPT-2 ajustados a turco de la comunidad | No disponible | No disponible | Turco | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio resultados relacionados con el modelo ni con modelos comparables en turco; los unicos enlaces recuperados tratan sobre el termino literario turco "misra" y no aportan informacion tecnica. No se dispone, por tanto, de datos verificados para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no interpreta ordenes ni mantiene un formato de chat fiable; su comportamiento es el de un completador estadistico de texto.
- Entrenamiento muy limitado: 5.000 pasos y ~204,8 millones de tokens para 81 M de parametros queda muy por debajo de las recomendaciones habituales de escalado de tokens por parametro, lo que se traduce en una calidad de generacion baja y en conocimiento factual escaso.
- Riesgo alto de alucinacion: el autor advierte explicitamente de que el modelo puede producir informacion falsa y sesgos, y de que no debe usarse en sistemas criticos sin verificacion.
- Mezcla de datos heterogenea: la combinacion de conjuntos de matematicas y de dialogo provoca que el modelo genere problemas de logica aparentemente aleatorios en contextos donde no corresponden, tal como reconoce el propio autor con el ejemplo de la entrada "İstanbul".
- Limitacion de idioma: solo turco. No hay soporte declarado para castellano ni para ninguna otra lengua.
- Limitacion de contexto: 512 tokens, insuficiente para conversaciones multi-turno largas, resumen de documentos extensos o analisis de codigo.
- Integracion restringida: no es un modelo nativo de `transformers`, la inferencia en Hugging Face esta deshabilitada y no se ofrecen cuantizaciones GGUF, GPTQ ni AWQ; desplegarlo en produccion exige mantener codigo propio.
- Ausencia de benchmarks: no hay ninguna evaluacion estandar publicada, por lo que no es posible comparar su calidad de forma objetiva con alternativas.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica falta de validacion por parte de la comunidad.
- Metadatos con fechas anomales: la fecha de creacion y de ultima actualizacion del repositorio (2026-09-19) es posterior a la fecha de esta ficha, un detalle a verificar antes de citar el modelo.
- Licencia MIT: permite uso comercial y modificacion, pero al ser un modelo base entrenado con datos de Wikipedia y otras fuentes no documentadas en detalle, la procedencia y los derechos de la mezcla de datos no quedan explicitados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aapo33/cores-ai-tr-v1.0.0-85m
- Repositorio de codigo en GitHub: https://github.com/westabdu/Cores-AI-TR-v1.0.0-85M
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los unicos resultados recuperados tratan sobre el termino literario turco "misra" (https://turkinform.com.tr/misra-nedir-tanimi-ozellikleri-ve-ornekleri, https://www.nedir.net/misra-nedir, https://www.hurriyet.com.tr/egitim/dize-nedir-dize-misra-ozellikleri-hakkinda-bilgi-41803105, https://www.lafsozluk.com/2015/03/misra-nedir-ne-demektir-anlami.html, https://sozlukdestek.com.tr/misra-sozluk-anlami/) y no guardan relacion con el modelo.
