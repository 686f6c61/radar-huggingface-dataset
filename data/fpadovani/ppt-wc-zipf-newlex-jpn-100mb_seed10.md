# fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed10` es un ajuste fino (fine-tune) de tipo SFT sobre el modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de la familia GPT-2 con 86.508.288 parametros. Lo publica el usuario `fpadovani`, asociado a un proyecto de investigacion de la University of Groningen (el run de entrenamiento esta registrado en Weights & Biases bajo la entidad `f-padovani-university-of-groningen`, proyecto `white_cotterell`), y forma parte de una serie de experimentos de tokenizacion y lexico: el nombre del repositorio combina las etiquetas `ppt`, `wc` (word count), `zipf` (distribucion de Zipf) y `newlex` (nuevo lexico), con `jpn` como lengua objetivo y `seed10` como semilla de reproducibilidad.

El problema que aborda es de investigacion, no de producto: se trata de un artefacto experimental de 86 millones de parametros entrenado sobre aproximadamente 100 MB de datos, disenado para medir el efecto de manipulaciones del vocabulario o del lexico de entrenamiento en un modelo pequeno. Su relevancia actual es limitada fuera de ese contexto: tiene 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks y no especifica licencia ni lista de idiomas.

Por tamano (86,5 M de parametros, 1,4 GB de repositorio) es un modelo que se ejecuta en CPU y en cualquier GPU de consumo, y su interes practico esta en servir como base de comparacion reproducible (semilla 10) en estudios de tokenizacion multilingue y en experimentos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repo) |
| Parametros totales | 86.508.288 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base esta etiquetado como `eng_latn` y el nombre del fine-tune indica `jpn`, pero no hay lista oficial de idiomas) |
| Licencia | no disponible (la model card declara un campo `licence` con el valor placeholder `license`, sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `goldfish-models/eng_latn_100mb`: un transformer decoder-only con atencion causal, del estilo de GPT-2, con 86.508.288 parametros. El proyecto Goldfish entrena modelos de este tipo para un centenar de lenguas con un presupuesto de datos reducido (100 MB por lengua), de modo que este checkpoint hereda la configuracion del modelo en ingles `eng_latn_100mb`. No se detalla en la informacion disponible el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto, aunque corresponden a los del modelo base citado.

El entrenamiento se hizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El run esta registrado en Weights & Biases con el identificador `u2ernue3`. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset de instrucciones, ni si hubo fases posteriores de RLHF o DPO; tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El sufijo `newlex` del nombre sugiere la introduccion de un lexico o vocabulario nuevo durante el experimento, pero la informacion proporcionada no describe ese procedimiento.

## Capacidades

- Generacion de texto autoregresiva: es la unica funcionalidad declarada por el pipeline (`text-generation`).
- Formato conversacional de un solo turno: el ejemplo de la model card pasa una lista con un mensaje de rol `user`, lo que indica que el modelo fue ajustado con plantilla de chat, aunque no se documenta soporte multi-turno.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo de pensamiento (thinking), vision, audio ni otras modalidades.
- Capacidad multilingue: no documentada. El modelo base trabaja sobre ingles (`eng_latn`) y el nombre del fine-tune apunta a japones (`jpn`), pero no se especifica el alcance real.
- Compatibilidad con despliegue como endpoint: las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con TGI.

## Casos de uso

- Reproducibilidad de experimentos de tokenizacion: el sufijo `seed10` y la publicacion de los pesos permiten repetir exactamente una condicion experimental (manipulacion de vocabulario `newlex`, ajuste a la distribucion de Zipf) y compararla con las otras semillas de la serie.
- Linea base de bajo coste en estudios academicos: al tener 86,5 M de parametros, se puede entrenar y evaluar decenas de variantes en una sola GPU o incluso en CPU, algo inviable con modelos de miles de millones de parametros.
- Analisis del efecto del lexico en lenguas de bajos recursos: el modelo permite medir como cambia la perplejidad en japones cuando el vocabulario se modifica, un escenario tipico de investigacion en linguistica computacional.
- Demostraciones docentes de fine-tuning con TRL: el repositorio documenta versiones exactas de TRL, Transformers y PyTorch, por lo que sirve como ejemplo reproducible de un pipeline SFT completo en clase o en tutoriales.
- Generacion de texto offline en hardware muy limitado: con ~0,17 GB en fp16 cabe en una Raspberry Pi o en un contenedor sin GPU, util para prototipos de generacion de texto sin conexion.
- Pruebas de integracion de infraestructura: al ser compatible con `text-generation-inference` y endpoints, se puede usar como modelo "dummy" barato para validar pipelines de despliegue, balanceadores y sistemas de monitorizacion antes de subir un modelo grande.
- Estudio de alucinacion y fluidez en modelos pequenos: su tamano reducido lo hace adecuado para medir a partir de que numero de parametros y de tokens empieza a degradarse la coherencia en una lengua determinada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp32 el modelo ocupa aproximadamente 0,35 GB; en fp16/bfloat16, unos 0,17 GB; en int8, alrededor de 0,09 GB (calculado a partir de los 86.508.288 parametros, sin contar el cache de claves/valores ni el overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050 y superiores). Tambien funciona en CPU sin problemas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (TGI, declarado compatible), y en principio llama.cpp u Ollama si se convierte a GGUF, algo que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de benchmarks que permitan comparar rendimiento. La tabla siguiente compara unicamente caracteristicas estructurales; los datos de los modelos alternativos son cifras publicas de sus respectivos repositorios y no se han verificado contra ninguna evaluacion de este modelo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed10` | 86,5 M | no disponible | no disponible | Fine-tune experimental SFT sobre `goldfish-models/eng_latn_100mb`; 0 descargas |
| `goldfish-models/eng_latn_100mb` | ~86 M (misma arquitectura) | no disponible | no disponible en la informacion proporcionada | Modelo base en ingles del proyecto Goldfish, entrenado con 100 MB de datos |
| `distilgpt2` | 82 M | 1024 tokens | Apache-2.0 | Alternativa publica de tamano comparable, ampliamente usada como linea base |
| `gpt2` | 124 M | 1024 tokens | MIT modificada | Referencia clasica de la familia GPT-2 en la que se inspira la arquitectura |

## Limitaciones y advertencias

- Modelo puramente experimental: procede de un estudio academico sobre tokenizacion y lexico, no de un proceso de alineamiento orientado a producto. No se documenta ninguna fase de RLHF o DPO.
- Riesgo de alucinacion elevado: con 86,5 M de parametros y 100 MB de datos de entrenamiento, la coherencia a medio plazo y la factualidad son muy limitadas incluso en comparacion con GPT-2 small.
- Sin licencia declarada: el campo `licence` de la model card contiene el valor placeholder `license`, por lo que no hay autorizacion explicita de uso comercial y el uso en produccion es legalmente arriesgado.
- Idiomas no especificados: no hay lista oficial de idiomas soportados y el propio nombre del repositorio mezcla una base en ingles (`eng_latn`) con un objetivo japones (`jpn`).
- Longitud de contexto desconocida: no se publica la ventana de contexto, por lo que no se puede garantizar el comportamiento en entradas largas.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, de modo que no se puede comparar objetivamente con alternativas.
- Sin soporte declarado de tool calling, agentes, vision ni audio: no debe integrarse en flujos que requieran estas capacidades.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Repositorio de 1,4 GB para un modelo de 86,5 M de parametros: conviene revisar el contenido antes de descargarlo, ya que el peso real de los safetensors es mucho menor que el tamano del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/u2ernue3
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; las busquedas devolvieron unicamente sitios de apuestas deportivas sin relacion con el contenido de esta ficha.
