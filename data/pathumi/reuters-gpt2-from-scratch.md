# Pathumi/reuters-gpt2-from-scratch

## Resumen

Pathumi/reuters-gpt2-from-scratch es un modelo de generacion de texto basado en la arquitectura GPT-2, entrenado desde cero por el usuario Pathumi y publicado en Hugging Face. Con 16.504.320 parametros, se situa en la gama de los GPT-2 pequenos (ligeramente por debajo de los 124 millones del GPT-2 base y proximo al GPT-2 small original de 117 millones en orden de magnitud, aunque aqui el recuento real de pesos es de unos 16,5 millones). El modelo esta especializado en el dominio periodistico, ya que se ha entrenado sobre el dataset `ingeniumacademy/reuters_articles`, una coleccion de articulos de la agencia Reuters.

El modelo resuelve un problema acotado: la generacion de texto en ingles con estilo periodistico y vocabulario propio de noticias de agencia. No es un modelo de proposito general ni compite con los LLM modernos; su interes es principalmente didactico y experimental, como ejemplo de entrenamiento desde cero de un transformer pequeno sobre un corpus especializado. El repositorio ocupa 0,1 GB y se distribuye en formato safetensors compatible con la libreria `transformers`.

La relevancia actual es limitada para produccion, pero resulta util para quienes quieran estudiar el ciclo completo de entrenamiento de un GPT-2, hacer fine-tuning sobre dominios concretos o desplegar un generador de texto muy ligero en entornos con recursos minimos. No se dispone de informacion sobre licencia, benchmarks ni detalles del proceso de entrenamiento mas alla de la referencia al dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tags del repositorio) |
| Parametros totales | 16.504.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atencion causal, tal como indican los tags del repositorio (`gpt2`, `transformers`). El recuento de parametros (16.504.320) corresponde a una configuracion reducida respecto al GPT-2 small original, lo que sugiere una variante con menos capas y/o menor dimension de embedding, aunque no se ha publicado la configuracion exacta (numero de capas, cabezas de atencion, dimension oculta ni longitud de contexto).

El entrenamiento se realizo "from scratch" (desde cero) sobre el dataset `ingeniumacademy/reuters_articles`, compuesto por articulos de la agencia Reuters en ingles. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del corpus, si se aplicaron tecnicas de RLHF, DPO o instruccion, ni sobre innovaciones tecnicas adicionales. La model card publicada es practicamente vacia: solo contiene los metadatos YAML (dataset, idioma, pipeline y tags), sin seccion descriptiva.

## Capacidades

- Generacion de texto en ingles, orientada al estilo y vocabulario de articulos periodisticos de agencia.
- Continuacion de texto y completado de fragmentos con coherencia local propia de un modelo pequeno.
- Capacidad limitada de razonamiento y de coherencia a largo plazo, condicionada por el tamano reducido del modelo.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles segun los metadatos.
- No se ha documentado modo thinking, vision ni audio.

## Casos de uso

- Generacion de titulares y parrafos de relleno en ingles para prototipos de medios o blogs: el modelo puede producir texto con registro periodistico gracias al entrenamiento sobre Reuters, util para maquetas y demos.
- Aumento de datos sinteticos para entrenar clasificadores de noticias: se pueden generar ejemplos adicionales de texto periodistico en ingles para ampliar un corpus pequeno.
- Experimentacion academica y didactica: sirve para estudiar el entrenamiento desde cero de un GPT-2 y comparar el efecto de corpus especializados frente a corpus generales.
- Fine-tuning sobre dominios concretos: al ser muy pequeno (16,5 M de parametros), se puede reentrenar o ajustar en una sola GPU consumer para tareas de generacion especificas.
- Despliegue en entornos con recursos minimos: cabe en CPU y en GPUs de gama baja, por lo que puede integrarse en demos locales o servicios con presupuesto de memoria muy reducido.
- Generacion de texto de bajo coste en pipelines de pruebas: util como modelo de sustitucion (mock) en tests de integracion de sistemas de generacion antes de pasar a modelos mayores.
- Prototipado rapido de interfaces de escritura asistida en ingles: permite validar la experiencia de usuario sin incurrir en costes de inferencia de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (16,5 M de parametros, aproximadamente 66 MB de pesos); en FP16 alrededor de 33 MB. Con overhead de activaciones y contexto, cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en todas las gamas, incluida la integrada en algunos casos.
- Opciones de despliegue: `transformers` (libreria nativa del repositorio), text-generation-inference (segun tags), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se ha publicado dicha conversion.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pathumi/reuters-gpt2-from-scratch | 16,5 M | no disponible | no disponible | Hugging Face | Entrenado desde cero sobre Reuters, solo ingles |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, OpenAI | Modelo general, ampliamente usado como base |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face | Destilado de GPT-2, orientado a eficiencia |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face, OpenAI | Mayor capacidad, mismo linaje arquitectonico |

La comparativa es orientativa: el modelo de Pathumi es notablemente mas pequeno que las alternativas y esta especializado en un corpus concreto, por lo que su rendimiento general sera inferior. No se dispone de datos de benchmarks para comparar cuantitativamente.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre articulos de Reuters, puede heredar sesgos editoriales, geograficos y tematicos del corpus; no se ha documentado ningun proceso de mitigacion.
- Riesgo de alucinacion: alto en relacion con su tamano y su naturaleza de modelo de lenguaje; puede generar afirmaciones factualmente incorrectas con apariencia de noticia.
- Limitaciones de contexto e idioma: solo ingles y longitud de contexto no documentada; probablemente limitada.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar el uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Modelo practicamente sin documentacion: la model card no describe el entrenamiento, la configuracion ni los datos con detalle, lo que dificulta la reproducibilidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad.
- Sin garantias de soporte: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de mantenimiento o comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Pathumi/reuters-gpt2-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
