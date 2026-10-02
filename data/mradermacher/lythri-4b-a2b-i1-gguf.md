# mradermacher/Lythri-4B-A2B-i1-GGUF

## Resumen

Lythri-4B-A2B-i1-GGUF es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Lythri/Lythri-4B-A2B. No se trata de un modelo entrenado desde cero, sino de una conversion y compresion de pesos para su uso con llama.cpp y otros runners compatibles con GGUF, orientada a despliegue local y on-device. La nomenclatura del modelo (4B-A2B) sugiere un transformer de tipo mezcla de expertos con aproximadamente 4.000 millones de parametros totales y unos 2.000 millones activos por token, aunque el autor no publica la arquitectura en la model card. La etiqueta gemma4 apunta a una arquitectura derivada de la familia Gemma, dato no confirmado de forma explicita.

El modelo base esta etiquetado como modelo de acompanamiento emocional y conversacional (emotional-support, companion), con enfasis en ejecucion en dispositivo y soporte de vision (los ficheros mmproj, si existen, se distribuyen en el repositorio estatico). El idioma declarado es unicamente el ingles y la licencia es Apache 2.0, lo que facilita su integracion en productos comerciales sin las restricciones de licencias de comunidad habituales en modelos de otros fabricantes.

El interes practico de esta publicacion es doble: por un lado ofrece cuantizaciones con imatrix (sufijo i1) que mejoran la relacion calidad/tamano frente a las estaticas del repositorio hermano; por otro, permite ejecutar un modelo conversacional especializado en hardware de consumo. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la nomenclatura A2B y la etiqueta gemma4 sugieren un transformer de tipo MoE con unos 2B parametros activos (no confirmado) |
| Parametros totales | 694.291 segun los metadatos de safetensors del repositorio; la nomenclatura del modelo indica 4B. Cifra no coherente y no verificada |
| Parametros activos | no disponible (la nomenclatura A2B sugiere aproximadamente 2B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (i1): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, small-IQ4_NL, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix); las cuantizaciones estaticas equivalentes se publican en el repositorio Lythri-4B-A2B-GGUF |
| Modelo base | Lythri/Lythri-4B-A2B |
| Autor de la cuantizacion | mradermacher (revision de README: 1) |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-02 |
| Tamano del repositorio | 0,0 GB en los metadatos de HuggingFace (el unico fichero listado en la tabla es el imatrix, de 0,1 GB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base ni su procedimiento de entrenamiento. La unica informacion tecnica disponible son las etiquetas del repositorio (gemma4, emotional-support, companion, on-device), el identificador 4B-A2B y la referencia al modelo base Lythri/Lythri-4B-A2B. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal.

Lo que si queda documentado es el proceso de cuantizacion: mradermacher genera cuantizaciones ponderadas con imatrix a partir del modelo base, con conversion de tipo hf y quantize_version 2, y ofrece tanto la cuantizacion i1 (este repositorio) como cuantizaciones estaticas en un repositorio separado. Los ficheros mmproj correspondientes a la parte de vision, si existen, se distribuyen unicamente en el repositorio estatico, no en el i1. La model card incluye la lista completa de tipos de cuantizacion generados, desde IQ1_S hasta Q6_K.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion a acompanamiento emocional y conversacion de caracter general.
- Soporte de vision indicado de forma indirecta: la model card senala que se trata de un modelo de vision y que los ficheros mmproj se alojan en el repositorio estatico, con la salvedad "si existen".
- Ejecucion on-device: el modelo esta etiquetado explicitamente para despliegue local en dispositivo.
- Conversacion multi-turno orientada a chat de acompanamiento, segun las etiquetas de emotional-support y companion.
- Capacidad de razonamiento, codigo, matematicas o tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, el unico idioma declarado es el ingles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente de acompanamiento emocional en local: el modelo puede mantener conversaciones de apoyo en multiples turnos dentro de una aplicacion de escritorio o movil, con todos los datos permaneciendo en el dispositivo gracias al formato GGUF y a su tamano reducido.
- Aplicaciones de bienestar con requisitos de privacidad: dado que el modelo esta pensado para ejecucion on-device, encaja en productos que tratan texto sensible (diarios personales, registros de animo) y no pueden enviar datos a APIs externas.
- Chatbot de compania con personalidad: permite desplegar un asistente conversacional con un tono empatico definido mediante prompting, sin coste por token de inferencia.
- Prototipado rapido de productos conversacionales: al ser un modelo pequeno y con licencia Apache 2.0, sirve para validar flujos de producto antes de escalar a modelos mayores.
- Ajuste fino de estilo o personaje sobre el modelo base: la publicacion del fichero imatrix permite al usuario generar sus propias cuantizaciones a partir de una version afinada con LoRA, manteniendo la calidad relativa de los pesos.
- Distribucion de modelos en equipos sin GPU dedicada: las variantes Q4_K_M o Q5_K_M permiten inferencia en CPU con llama.cpp u Ollama en portatiles convencionales.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio i1 y el estatico del mismo modelo permiten medir la diferencia de perplejidad entre cuantizaciones ponderadas y estaticas con hardware domestico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas de acompanamiento emocional, y no se dispone de comparaciones numericas con el modelo base en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados para un modelo de ~4B en GGUF; el repositorio no publica el tamano por fichero, solo el imatrix de 0,1 GB):
  - IQ1/IQ2: en torno a 1,5-2,0 GB de pesos.
  - Q3_K_M: en torno a 2,0-2,2 GB.
  - Q4_K_M: en torno a 2,5-2,8 GB.
  - Q5_K_M: en torno a 2,9-3,2 GB.
  - Q6_K: en torno a 3,3-3,5 GB.
  - Sumar entre 0,5 y 2 GB adicionales de cache KV segun la longitud de contexto configurada y el numero de capas.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070 y superiores) ejecuta las cuantizaciones Q4 y Q5 con comodidad. Una RTX 4090, A100 o H100 no aportan ventaja de memoria relevante a este tamano; su beneficio es de throughput y de contexto largo.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M y Q5_K_M caben en 4-6 GB de VRAM, por lo que es viable en iGPU con memoria unificada, en portatiles con GPU discreta de gama media y en mini-PC de 8-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. Para el modelo base en formato HuggingFace: transformers, vLLM o TGI. El repositorio tiene la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponibles. Dependen de la cuantizacion, del backend y del hardware; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos publicados del modelo Lythri en materia de contexto, benchmarks o parametros verificados, por lo que la comparacion se limita a caracteristicas generales de modelos de tamano y proposito similares. Las cifras de los modelos alternativos provienen del conocimiento general del ecosistema y no de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Orientacion | Datos de rendimiento |
|---|---|---|---|---|---|
| Lythri-4B-A2B (i1-GGUF) | 4B declarados (A2B, no verificado) | no disponible | Apache 2.0 | Acompanamiento emocional, on-device | no disponible |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | Proposito general, tool calling | no disponibles en esta ficha |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | Proposito general, dialogos | no disponibles en esta ficha |
| Gemma-2-2B-it | 2B | 8K | Gemma Terms of Use | Proposito general, dialogos | no disponibles en esta ficha |

Diferencias relevantes: frente a las alternativas, la principal ventaja de Lythri-4B-A2B es su licencia Apache 2.0 combinada con una especializacion declarada en acompanamiento emocional y un catalogo amplio de cuantizaciones con imatrix; sus desventajas documentadas son el soporte exclusivo de ingles, la ausencia de datos de contexto y de benchmarks y un numero de descargas nulo que impide contrastar su calidad con la comunidad.

## Limitaciones y advertencias

- No hay datos de entrenamiento, composicion del dataset ni proceso de alineamiento, por lo que no puede evaluarse el sesgo ni el comportamiento en dominios sensibles.
- Riesgo de alucinacion no cuantificado: al ser un modelo conversacional sin benchmarks publicados, se desconoce su tasa de error factual.
- Uso en contextos de salud mental: un modelo etiquetado como emotional-support no sustituye la atencion profesional; en produccion conviene anadir guardarrailes, deteccion de crisis y derivacion a recursos humanos.
- Riesgo de complacencia (sycophancy): los modelos afinados para acompanamiento tienden a validar al usuario en lugar de corregirlo, lo que puede ser problematico en aplicaciones de consejo.
- Idioma: unicamente ingles declarado; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia: Apache 2.0 en este repositorio, lo que permite uso comercial, pero conviene verificar la licencia efectiva del modelo base Lythri/Lythri-4B-A2B, ya que la ficha del cuantizador no la reproduce.
- Incoherencia de metadatos: el recuento de parametros reportado (694.291) no concuerda con la nomenclatura 4B; tratar cualquier cifra de tamano como no fiable hasta verificarla en los ficheros reales.
- Contenido del repositorio: la tabla de la model card solo lista el fichero imatrix (0,1 GB); las cuantizaciones utilizables deben descargarse del repositorio estatico Lythri-4B-A2B-GGUF. Verificar antes de integrar.
- Vision: la model card indica que es un modelo de vision con la salvedad "si existen" ficheros mmproj; la capacidad multimodal no esta confirmada.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes externos de calidad o estabilidad.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1 con imatrix): https://huggingface.co/mradermacher/Lythri-4B-A2B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-4B-A2B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Lythri-4B-A2B-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Lythri-4B-A2B-i1-GGUF
- Peticiones de cuantizacion y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher/models
- Modelo relacionado de mayor tamano: https://huggingface.co/mradermacher/Lythri-7B-A4B-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
