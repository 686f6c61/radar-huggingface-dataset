# Mininglamp-2718/OctoMention-2B-Instruct-1.2

## Resumen

OctoMention-2B-Instruct-1.2 es un modelo de lenguaje de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) publicado por Mininglamp Technology (Mininglamp-2718, cotizada como 2718.HK) bajo licencia Apache 2.0. El identificador de arquitectura declarado en los metadatos es `qwen3_5`, lo que lo sitúa en la familia Qwen 3.5, y el sufijo `Instruct` indica un ajuste orientado a seguir instrucciones y mantener conversación. Es, por tanto, un modelo pequeno dentro del ecosistema, pensado para despliegue con recursos limitados.

La informacion publica disponible es muy escasa: la model card del repositorio solo contiene el bloque de licencia, sin descripcion tecnica, sin datos de entrenamiento y sin resultados de evaluacion. El repositorio ocupa 5,5 GB, un tamano coherente con pesos en precision completa o bfloat16 (unos 4,4 GB para 2,2 mil millones de parametros) mas ficheros auxiliares. Existe una variante hermana publicada por el mismo autor en formato MLX de 8 bits, etiquetada como `Image-Text-to-Text`, lo que apunta a capacidades multimodales de entrada (imagen y texto) que no se confirman en la ficha del repositorio principal.

Su relevancia practica es la de un modelo de bolsillo: 2,2 mil millones de parametros caben en GPUs de consumo e incluso en hardware integrado con cuantizacion, lo que lo hace candidato a asistentes locales, tareas de extraccion y clasificacion, o como eslabon barato dentro de pipelines de agentes. Mininglamp anuncio el 29 de junio de 2026 la publicacion de Octo, descrito como una red abierta de colaboracion entre agentes bajo Apache 2.0; OctoMention encaja en ese contexto de infraestructura de agentes, aunque la documentacion disponible no detalla la relacion exacta entre ambos proyectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen 3.5 (etiqueta `qwen3_5` en los metadatos); no se detalla si incorpora componentes hibridos |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio principal (solo safetensors); existe una variante MLX de 8 bits publicada por el mismo autor |
| Idiomas soportados | No disponible; la variante MLX del mismo modelo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 5,5 GB) |

## Arquitectura y entrenamiento

Los metadatos identifican la arquitectura como `qwen3_5`, es decir, la familia Qwen 3.5 de Alibaba, sobre la que Mininglamp habria construido o ajustado este modelo. Con 2,2 mil millones de parametros se trata de un transformer denso, sin mezcla de expertos segun la informacion disponible. La variante MLX hermana esta etiquetada como `Image-Text-to-Text`, lo que sugiere que el modelo acepta imagenes ademas de texto, aunque la ficha del repositorio principal no lo declara ni documenta el codificador visual empleado.

No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, las tecnicas de alineacion aplicadas (SFT, RLHF, DPO) ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La model card se limita al bloque de licencia, sin seccion de uso previsto, sin limitaciones declaradas y sin ejemplos de prompt. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instructivo, segun indica el sufijo `Instruct`.
- Razonamiento y respuesta a instrucciones: capacidad esperable por el ajuste, aunque no hay evaluaciones publicadas que la cuantifiquen.
- Procesamiento de imagen y texto: inferido de la variante MLX etiquetada `Image-Text-to-Text`; no confirmado en la ficha del repositorio principal.
- Idiomas: la variante MLX declara ingles; el soporte multilingue del modelo base no esta documentado.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito o thinking mode: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.
- Despliegue en hardware modesto: 2,2 B de parametros permiten inferencia en GPU de consumo y en Apple Silicon mediante la variante MLX.

## Casos de uso

- Asistentes locales en el dispositivo: con 2,2 B de parametros y pesos en safetensors, el modelo puede ejecutarse en una GPU de consumo de gama media o en un portatil Apple Silicon usando la variante MLX de 8 bits, sin enviar datos a la nube. Adecuado para prototipos de asistente personal y pruebas de concepto de privacidad.
- Clasificacion y enrutado dentro de pipelines de agentes: por su tamano reducido, sirve como clasificador de intenciones o enrutador de subtareas antes de invocar un modelo mayor, reduciendo coste por peticion en arquitecturas tipo Octo.
- Extraccion de informacion de documentos: si se confirma la entrada de imagen, resultaria util para lectura de tickets, formularios o capturas y devolucion de campos estructurados en JSON; el bajo coste por token permite procesar lotes grandes.
- Generacion de codigo asistida en editor: 2,2 B es suficiente para autocompletado, generacion de tests unitarios y explicacion de fragmentos, con latencia baja en GPU local. Requiere validar la calidad real, no documentada.
- Resumen y reescritura de textos cortos: notas de reunion, correos y articulos, aprovechando el formato instructivo; el limite de contexto no documentado obliga a trocear entradas largas.
- Fine-tuning especifico de dominio: al ser Apache 2.0 y tener solo 2,2 B de parametros, se puede ajustar con LoRA en una unica GPU de 24 GB para tareas verticales (legal, sanitario, atencion al cliente) sin costes de licencia.
- Filtrado y moderacion de contenido en tiempo real: la inferencia barata permite evaluar cada mensaje entrante con un prompt de clasificacion, como primera capa antes de la revision humana.
- Base para investigacion en tecnicas de alineacion: modelo pequeno y permisivo en licencia, util como sujeto de experimentos de DPO, RLHF o evaluacion de sesgos con presupuesto de computo reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba, y no se han localizado referencias externas con mediciones independientes.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 2,2 B de parametros, no publicada por el autor): en bf16/fp16 los pesos ocupan unos 4,4 GB, y con cache KV y sobrecarga del runtime la inferencia requiere del orden de 5 a 7 GB.
- VRAM estimada en cuantizacion de 8 bits: unos 2,2 GB de pesos y aproximadamente 3 a 4 GB totales, alineado con la variante MLX-8bit publicada.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF o AWQ, no publicados): alrededor de 1,3 GB de pesos y 2 a 3 GB totales segun longitud de contexto.
- GPU recomendadas: para servicio concurrente, A100 40 GB, H100 o L40S permiten ejecutar muchas replicas o contextos largos en una sola tarjeta; para desarrollo, RTX 4090, RTX 4080, RTX 3090 y RTX 4060 Ti 16 GB son suficientes incluso en precision completa.
- GPU de consumo: si cabe. Cualquier tarjeta con 8 GB o mas puede ejecutar el modelo en bf16; con 4 a 6 GB es viable en cuantizacion de 8 o 4 bits. En Apple Silicon funciona mediante MLX (variante oficial de 8 bits).
- Opciones de despliegue: vLLM y TGI para safetensors en servidor; transformers para uso directo; llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que el repositorio solo publica safetensors; MLX para hardware Apple.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus fichas publicas; el rendimiento relativo no se ha verificado en la informacion disponible para este modelo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OctoMention-2B-Instruct-1.2 | 2,2 B | No disponible | Apache 2.0 | Publicacion de 2026, sin benchmarks ni model card tecnica; variante MLX disponible |
| Qwen3-1.7B | 1,7 B | 32k nativos | Apache 2.0 | Misma familia arquitectonica declarada; documentacion y evaluaciones publicas completas |
| Gemma 3 1B IT | 1 B | 32k | Licencia Gemma (uso comercial con condiciones) | Multimodal (texto e imagen) en el modelo pequeno de la familia |
| Llama 3.2 1B Instruct | 1,2 B | 128k | Licencia comunitaria Llama 3.2 | Contexto largo y ecosistema amplio de herramientas |
| SmolLM2-1.7B-Instruct | 1,7 B | 8k | Apache 2.0 | Orientado explicitamente a despliegue en dispositivo |

La diferencia practica frente a estas alternativas no esta en las especificaciones, que son comparables, sino en la documentacion: los modelos de Qwen, Google, Meta y Hugging Face publican guias de uso, evaluaciones y limitaciones, mientras que OctoMention carece de toda esa informacion, lo que incrementa el coste de evaluacion previa.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, idiomas, contexto maximo ni uso previsto, lo que impide evaluar riesgos de sesgo o contaminacion de datos.
- Sin benchmarks: no hay evidencia publica de calidad en razonamiento, codigo o matematicas; cualquier decision de adopcion exige evaluacion propia.
- Riesgo de alucinacion: previsible en un modelo de 2,2 B sin documentacion de alineacion; no debe usarse como fuente de verdad en dominios facticos sin verificacion externa.
- Idiomas: solo la variante MLX declara ingles; el rendimiento en castellano es desconocido y probablemente inferior al de modelos con cobertura multilingue documentada.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (RAG con muchos fragmentos, analisis de documentos extensos) sin medirla empiricamente.
- Capacidad multimodal no confirmada: la etiqueta `Image-Text-to-Text` aparece solo en un repositorio derivado; conviene verificar el procesador y la configuracion antes de asumir entrada de imagen.
- Licencia Apache 2.0: permisiva para uso comercial y modificacion, con obligacion de conservar avisos de licencia y ausencia de garantias; no se identifica ninguna restriccion adicional, pero tampoco existe declaracion de procedencia de los datos de entrenamiento que cubra posibles reclamaciones de terceros.
- Madurez del proyecto: cero descargas y cero likes en el momento de la consulta, version 1.2 publicada y actualizada el mismo dia; no hay senales de mantenimiento ni de soporte comunitario.
- Formato unico: al publicarse solo safetensors, el despliegue con llama.cpp u Ollama requiere conversion y validacion propias.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Mininglamp-2718/OctoMention-2B-Instruct-1.2
- Variante MLX de 8 bits: https://huggingface.co/Mininglamp-2718/OctoMention-2B-Instruct-1.2-MLX-8bit
- Variante MLX 8 bits de la version 1.0 en ModelScope: https://www.modelscope.cn/models/Mininglamp2718/OctoMention-2B-Instruct-1.0-MLX-8bit
- Variante MLX 8 bits de la version 1.1 en ModelScope: https://www.modelscope.cn/models/Mininglamp2718/OctoMention-2B-Instruct-1.1-MLX-8bit
- Perfil de la organizacion en HuggingFace: https://huggingface.co/Mininglamp-2718/datasets
- Anuncio de Octo, red abierta de colaboracion entre agentes (29 de junio de 2026): https://www.newtimespace.com/en/research/1420242.html
