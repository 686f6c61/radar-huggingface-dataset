# cs-file-uploads/domain-specific-mistral-24b-adapter-short

# domain-specific-mistral-24b-adapter-short

## Resumen
domain-specific-mistral-24b-adapter-short es un adaptador LoRA (PEFT) construido sobre el modelo base mistralai/Mistral-Small-3.2-24B-Instruct-2506. Lo publica el usuario cs-file-uploads y su unico artefacto son los pesos del adaptador en formato safetensors (0.2 GB de repositorio), que deben cargarse con PEFT sobre el modelo base para poder usarse.

El adaptador esta especializado en una tarea muy concreta: extraer consultores de compensacion (asesores retenidos y proveedores de encuestas, retained advisors y survey providers) a partir de declaraciones proxy de la SEC (SEC proxy statements). Fue ajustado con 2.001 ejemplos etiquetados y entrenado con el formato de instruccion "minimal" (los repos cuyo nombre no llevan el sufijo -short usan una instruccion detallada).

Su relevancia es acotada y practica: demuestra el uso de LoRA sobre un modelo de 24B para tareas de extraccion de informacion en el dominio financiero y regulatorio. No incluye model card con licencia, idiomas, contexto ni datos de benchmarks, y no registra descargas ni likes en el momento de la consulta, por lo que es un artefacto experimental mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer decoder Mistral-Small-3.2-24B-Instruct-2506 |
| Parametros totales | 24B en el modelo base (parametros del adaptador no disponibles) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA, no un modelo completo. Se compone de matrices de bajo rango que se acoplan a las capas del transformer decoder Mistral-Small-3.2-24B-Instruct-2506 y se cargan con la libreria PEFT. El repositorio pesa 0.2 GB y la etiqueta library_name es peft, con los tags lora y peft. No se detalla la configuracion del adaptador (rango, alpha, capas objetivo, dropout) ni el regimen de entrenamiento (learning rate, epocas, hardware).

Los datos de entrenamiento consisten en 2.001 ejemplos etiquetados para la tarea de extraccion de consultores de compensacion en declaraciones proxy de la SEC. El entrenamiento uso el formato de instruccion "minimal", segun indica el autor: el repositorio sin el sufijo -short corresponde a la variante con instruccion detallada y este, con el sufijo -short, a la instruccion minima. No se documenta el uso de RLHF o DPO, ni innovaciones tecnicas adicionales.

## Capacidades
- Extraccion de informacion en dominio financiero y regulatorio: identificacion de consultores de compensacion (asesores retenidos y proveedores de encuestas) en declaraciones proxy de la SEC.
- Procesamiento de texto en ingles juridico-financiero como tarea principal inferida de la descripcion del autor (el idioma no se declara explicitamente en los metadatos).
- Generacion de texto y razonamiento generales, heredados del modelo base Mistral-Small-3.2-24B-Instruct-2506, siempre que el adaptador no degrade esas capacidades.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidad de seguir un formato de instruccion "minimal": el propio autor distingue entre una variante de instruccion detallada y esta de instruccion minima.

## Casos de uso
- Extraccion de asesores retenidos en proxy statements: el adaptador se cargaria sobre el modelo base para procesar declaraciones proxy de la SEC y devolver los consultores de compensacion retenidos, reduciendo el trabajo manual de analistas.
- Extraccion de proveedores de encuestas de compensacion: aplicacion directa de la tarea para la que fue entrenado, identificando survey providers dentro del mismo tipo de documento.
- Automatizacion de pipelines de compliance y gobierno corporativo: integrado como paso de extraccion de entidades en flujos que ya procesan documentacion regulatoria en lote.
- Investigacion academica en finanzas: uso como baseline especializado frente a modelos genericos al comparar tecnicas de extraccion de informacion en textos regulatorios.
- Enriquecimiento de bases de datos financieras: poblar tablas de relaciones entre empresas y sus consultores de compensacion a partir de documentos historicos.
- Prototipado de adaptadores de dominio con LoRA: servir de plantilla para replicar el flujo (modelo base de 24B mas adaptador PEFT) en otras tareas de extraccion de entidades.
- Evaluacion de tecnicas de prompting minimo: comparar esta variante de instruccion minima con la variante detallada del mismo autor para medir el impacto del formato de instruccion en la tarea.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un repositorio de codigo con el pipeline de inferencia y la evaluacion, pero no se incluyen cifras en la model card ni en los resultados de busqueda.

## Requisitos de hardware
- Pesos del adaptador: aproximadamente 0.2 GB en safetensors; el coste real lo determina el modelo base de 24B sobre el que se carga.
- VRAM estimada para el modelo base de 24B: en BF16/FP16 en torno a 48 GB solo para pesos; en INT8 alrededor de 24-26 GB; en cuantizacion de 4 bits aproximadamente 13-15 GB. Son estimaciones segun el recuento de parametros del modelo base, no datos publicados por el autor.
- GPU recomendadas: A100 80GB o H100 80GB para BF16/FP16; A100 40GB, L40S o RTX 6000 Ada para INT8; RTX 4090 (24 GB) o RTX 3090 (24 GB) para INT8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB (RTX 3090, RTX 4090) usando cuantizacion de 8 o 4 bits y contextos moderados; en GPUs de 16 GB probablemente solo con 4 bits y ventanas cortas.
- Opciones de despliegue: transformers mas peft para carga directa del adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp u Ollama requeririan fusionar el adaptador en los pesos del modelo base antes de convertir a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| domain-specific-mistral-24b-adapter-short (este) | 24B en base + LoRA | no disponible | Adaptador LoRA, instruccion minimal | no disponible | Publicado en HuggingFace, 0 descargas |
| Adaptador detallado del mismo autor (repo sin -short) | 24B en base + LoRA | no disponible | Adaptador LoRA, instruccion detallada | no disponible | Referenciado por el autor |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 | 24B | no disponible en esta ficha | Modelo base transformer decoder | no disponible en esta ficha | Modelo base publicado por Mistral |

No se dispone de datos para comparar el rendimiento frente a otros adaptadores especializados en extraccion de entidades financieras.

## Limitaciones y advertencias
- No es un modelo autonomo: requiere cargar el modelo base Mistral-Small-3.2-24B-Instruct-2506 y la libreria PEFT para funcionar.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion del adaptador.
- Entrenado con solo 2.001 ejemplos y en una tarea muy estrecha (consultores de compensacion en proxy statements de la SEC), lo que limita su generalizacion fuera de ese dominio.
- Riesgo de alucinacion inherente a los modelos generativos al extraer entidades: puede producir consultores o relaciones inexistentes en el documento.
- Idiomas y contexto no declarados: no hay garantias sobre el comportamiento fuera del ingles financiero ni sobre documentos largos.
- Sesgos conocidos: no disponibles; al entrenarse sobre proxy statements de la SEC puede heredar sesgos de ese corpus regulatorio estadounidense.
- Sin descargas ni likes y con fecha de creacion posterior a la habitual: artefacto experimental sin validacion externa publica.
- No se documentan metricas de evaluacion, por lo que no puede verificarse su precision real en produccion.

## Enlaces
- HuggingFace: https://huggingface.co/cs-file-uploads/domain-specific-mistral-24b-adapter-short
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Las busquedas web realizadas no devolvieron resultados relevantes: los enlaces obtenidos corresponden al videojuego Counter-Strike y no guardan relacion con este modelo. No se han encontrado papers, blogs ni repositorios adicionales en la informacion disponible.
