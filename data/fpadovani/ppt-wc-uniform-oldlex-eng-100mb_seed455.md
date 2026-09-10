# fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455` es un ajuste fino (fine-tuning) supervisado de tipo SFT sobre el modelo base `goldfish-models/eng_latn_100mb`. Lo publica el usuario fpadovani, vinculado a un proyecto de investigación de la Universidad de Groningen (la cuenta de Weights & Biases asociada es `f-padovani-university-of-groningen`). Se trata de un modelo pequeno, de 86.416.128 parametros, con arquitectura GPT-2 y ventana de generacion de texto, orientado a tareas de generacion de lenguaje en ingles.

El interes de esta ficha es acotado: no es un modelo de proposito general ni compite con LLM contemporaneos, sino un artefacto de investigacion que forma parte de una serie de experimentos (sufijo `ppt-wc-uniform-oldlex-eng-100mb_seed455`, con semilla 455). El nombre sugiere variaciones sobre el lexico del conjunto de entrenamiento, si bien la model card no documenta la metodologia experimental concreta. Se ha entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0.

Su relevancia es, por tanto, academica y reproducible: sirve para replicar experimentos de ajuste fino sobre corpus de 100 MB por idioma (serie Goldfish), no para despliegues en produccion. El numero de descargas y "likes" es cero en el momento de redactar esta ficha, y la licencia no esta declarada de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, causal LM) |
| Parametros totales | 86.416.128 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 estandar emplea 1024 tokens, pero no se documenta en esta ficha) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible en la ficha; el modelo base es `eng_latn_100mb`, por lo que el entrenamiento es en ingles |
| Licencia | no disponible (la model card lista `licence: license` sin concretar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal y sin mecanismos de mezcla de expertos ni atencion lineal. Con 86 millones de parametros, corresponde a una escala similar al GPT-2 pequeno pero ligeramente inferior (GPT-2 small tiene 124M), coherente con los modelos de la serie Goldfish entrenados sobre 100 MB de texto por idioma. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, SSM ni hibridaciones).

El entrenamiento consiste en un ajuste fino supervisado (SFT) realizado con TRL 0.23.0 sobre el modelo base `goldfish-models/eng_latn_100mb`. La model card proporciona un enlace a un run de Weights & Biases en el proyecto `f-padovani-university-of-groningen/white_cotterell` (run `ab4svv83`), pero no detalla el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni hiperparametros como la tasa de aprendizaje o el numero de epocas. El sufijo `seed455` indica que el experimento se ejecuto con la semilla 455, probablemente para medir variabilidad entre inicializaciones.

## Capacidades

- Generacion de texto en ingles: el modelo se expone a traves del pipeline `text-generation` de Transformers y acepta mensajes con rol de usuario.
- Generacion condicionada por prompt conversacional: el ejemplo de la model card usa una lista de mensajes con `{"role": "user", "content": ...}`, lo que sugiere que el ajuste SFT incluyo formato de dialogo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base es especifico de ingles (`eng_latn`).
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Experimentacion academica reproducible: el modelo sirve para replicar los resultados de la serie de experimentos del proyecto (posiblemente sobre complejidad lexica o variacion de vocabulario), dado que se publica con semilla fija (`seed455`) y enlace al run de W&B.
- Estudio de ajuste fino con TRL: util como caso de referencia para comparar configuraciones de SFT sobre modelos GPT-2 pequenos, dado que se documentan las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers.
- Linea base (baseline) en evaluaciones de generacion de texto en ingles: por su tamano reducido (86M) permite entrenar y evaluar rapidamente en una unica GPU o incluso en CPU.
- Analisis de sesgos y calidad de corpus en ingles: al derivar de un corpus de 100 MB (`eng_latn_100mb`), es adecuado para estudiar que tipo de texto reproduce un modelo entrenado con un corpus de ese orden de magnitud.
- Prototipado educativo: sirve para ensenar el flujo completo de `pipeline` de Transformers y despliegue de modelos pequenos sin necesidad de infraestructura grande.
- Pruebas de cuantizacion y despliegue ligero: aunque no se publican pesos cuantizados, el modelo puede convertirse a GGUF u otros formatos para experimentar con inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de la busqueda web no aportan datos sobre este modelo (los enlaces devueltos tratan sobre un servicio escolar frances, "Ecole directe", y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada: con 86,4 millones de parametros, los pesos ocupan aproximadamente 346 MB en fp32 y unos 173 MB en fp16. La VRAM total necesaria para inferencia es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni similar. Una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en muchos modelos antiguos.
- Ejecucion en CPU: viable, dado el tamano reducido, con latencias altas pero utilizables para experimentos.
- Opciones de despliegue: el modelo es compatible con la libreria Transformers mediante `pipeline`; las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse con TGI o endpoints compatibles. No se documentan pesos GGUF, por lo que `llama.cpp` u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455` | 86.416.128 | no disponible | no disponible | Ajuste SFT de investigacion con semilla fija |
| `goldfish-models/eng_latn_100mb` | comparable (modelo base) | no disponible | no disponible | Modelo base del que deriva el modelo tratado |
| GPT-2 small (OpenAI) | 124.000.000 | 1024 tokens | MIT | Referente de la misma familia arquitectonica |
| DistilGPT-2 (Hugging Face) | 82.000.000 | 1024 tokens | Apache 2.0 | Alternativa destilada de tamano similar |

No se dispone de datos de rendimiento comparativo para el modelo tratado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un modelo entrenado sobre 100 MB de texto en ingles puede reproducir sesgos presentes en ese corpus y carecer de cobertura de variedades dialectales.
- Riesgo de alucinacion: elevado para un modelo de 86M de parametros; no debe usarse para tareas que exijan veracidad factual sin verificacion externa.
- Limitaciones de contexto: la arquitectura GPT-2 estandar esta limitada a 1024 tokens, lo que restringe conversaciones y documentos largos.
- Limitaciones de idioma: el modelo base es especifico de ingles; el rendimiento en castellano u otros idiomas es previsiblemente muy bajo.
- Licencia: no declarada de forma explicita; antes de cualquier uso comercial debe contactarse con el autor para aclarar los terminos.
- Caveat para produccion: el modelo no esta pensado para produccion, no tiene benchmarks publicados, cero descargas y ninguna validacion externa conocida.
- Fecha de creacion: la ficha indica 2026-09-10, lo que puede ser un error de metadatos o una fecha futura; conviene verificar la vigencia del repositorio.
- Los resultados de la busqueda web no contienen informacion relevante sobre este modelo y no deben usarse como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/ab4svv83
- Repositorio TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020): incluida en la model card, repositorio arriba referenciado
