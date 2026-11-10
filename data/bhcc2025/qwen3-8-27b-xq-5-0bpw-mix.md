# BHCC2025/Qwen3.8-27B-XQ-5.0bpw-mix

## Resumen

Qwen3.8-27B-XQ-5.0bpw-mix es una cuantizacion de precision mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario BHCC2025 en el formato propietario XQ, el formato de pesos del motor de inferencia Ferrite. El objetivo no es otro que permitir ejecutar un modelo de 27.500 millones de parametros en una unica tarjeta Intel Arc Pro B70 de 32 GB, manteniendo una fidelidad respecto al modelo original en BF16 medida en divergencia KL de entre 0,0033 y 0,0105 segun el tipo de prompt. El paquete ocupa 30,3 GB en disco y promedia 5,0 bits por peso, con anchos por tensor de 4, 5, 6 u 8 bits.

El modelo base es un transformer hibrido de Qwen con 64 capas, de las cuales 48 son Gated DeltaNet (atención lineal con estado recurrente) y 16 son atención con compuertas convencional, con un tamano oculto de 5120, un vocabulario de 248.320 tokens y una capa MTP (multi-token prediction) adicional. Esa capa MTP es la que habilita la decodificacion especulativa integrada en Ferrite, que eleva el rendimiento de 27,6 tokens por segundo en decodificacion plana hasta 124 tokens por segundo en cargas de codigo con contexto de 2K.

La relevancia de esta publicacion es acotada pero clara: demuestra que es posible servir un modelo de esta escala con contexto de 128K en hardware Intel Arc de gama profesional, con un consumo contenido (180 W) y un rendimiento interactivo gracias a la decodificacion especulativa. La contrapartida es que los pesos solo se cargan en Ferrite; no son compatibles con transformers, llama.cpp ni exllamav3, lo que limita su uso a un unico motor y a una unica familia de GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas Gated DeltaNet + 16 capas de atencion con compuertas, mas 1 capa MTP |
| Parametros totales | 27.527.638.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K en Ferrite (medido hasta 120K en las pruebas de fidelidad) |
| Tipos de cuantizacion | Precision mixta XQ de 4, 5, 6 y 8 bits por tensor; media de 5,0 bpw en las lineales, 4,8 bits en los codigos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con formato XQ version 0 (`xq_config.json` + `xq-0000x.safetensors`), solo legible por Ferrite |
| Tamano en disco | 30,3 GB (incluye 1,3 GB del cabezal borrador opcional `dhead_q8.bin`) |
| Capas | 64 (48 Gated DeltaNet + 16 gated attention) + 1 MTP |
| Dimension oculta | 5120 |
| Vocabulario | 248.320 tokens |
| Metodo de cuantizacion | GPTQ sobre 128 x 2048 tokens de calibracion en 497 tensores; round-to-nearest en 8 tensores |
| Transformacion previa | Rotacion Hadamard de 128 dimensiones sobre las entradas; escalas fp16 por grupo de 128 |
| Precision de componentes no lineales | Embedding, normas y convoluciones GDN en BF16 |
| Vision | no incluida (Ferrite es solo texto) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de atencion: 48 capas de Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente que reduce el coste de contexto largo, y 16 capas de atencion con compuertas convencional. A esto se suma una capa MTP (multi-token prediction) que predice varios tokens futuros de forma simultanea y que Ferrite aprovecha como cabezal borrador para decodificacion especulativa. El vocabulario de 248.320 tokens y la dimension oculta de 5120 son coherentes con la familia Qwen de gran tamano.

El proceso de cuantizacion es el elemento diferencial de esta publicacion. Se aplico GPTQ (paper arXiv:2210.17323) sobre entradas previamente rotadas con una transformada de Hadamard de 128 dimensiones, con 128 x 2048 tokens de calibracion extraidos del conjunto por defecto de exllamav3. Cada tensor recibe un ancho propio (4, 5, 6 u 8 bits) decidido segun su sensibilidad: las proyecciones `in_proj_a` e `in_proj_b` de las capas GDN se mantienen en 8 bits, las proyecciones q/k/v de atencion en 5 bits, y las proyecciones de MLP se reparten entre 4 y 5 bits mayoritariamente. Los tensores que comparten entrada (qkv con z, gate con up) comparten ancho para preparar la rotacion una sola vez. El cabezal de salida se cuantiza a 6 bits sin rotacion. Los codigos enteros agrupados se decodifican directamente en kernels de GPU con escalas fp16 por grupo de 128 entradas.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Esos datos corresponden a la model card de Qwen/Qwen3.8-27B, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de prosa, con fidelidad medida frente al BF16 original (KL de 0,0105 en prosa, la peor de las categorias evaluadas).
- Generacion y edicion de codigo, con KL de 0,0054 y rendimiento especulativo especialmente alto en tareas de edicion (201-244 tokens por segundo).
- Razonamiento de contexto largo: soporta prompts de hasta 120K tokens con KL de 0,0033, el valor mas bajo de todas las pruebas, lo que indica que la cuantizacion degrada menos en contextos extensos.
- Decodificacion especulativa sin perdida: la salida greedy es identica token a token a la decodificacion plana, segun declara el autor.
- Soporte de plantilla de chat (`chat_template.jinja` incluida en el repositorio).
- Capacidades multimodales: no disponibles; el torre de vision del modelo base no se incluye porque Ferrite es solo texto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la ventana de 128K y la capa MTP lo hacen tecnicamente viable.

## Casos de uso

- Asistencia de codigo en local sobre workstation Intel Arc: con 124 tokens por segundo a 2K de contexto y 111 a 32K, el modelo es util para autocompletado y generacion de funciones en un IDE, sin depender de la nube y con los datos del codigo permaneciendo en la maquina.
- Edicion de codigo sobre repositorios grandes: el rendimiento de 201-244 tokens por segundo en tareas de edicion (donde la mayor parte de la salida se copia del prompt) y el contexto de 128K permiten reescribir ficheros completos o aplicar refactorizaciones multi-archivo en una sola pasada.
- Analisis de documentos extensos: con KL de 0,0033 a 120K tokens, el modelo mantiene fidelidad en resumenes, extraccion de datos y preguntas sobre contratos, informes o bases de codigo de gran tamano, un escenario donde la cuantizacion suele degradar mas y aqui no lo hace.
- Atencion al cliente automatizada multi-turno: la ventana de 128K permite mantener historiales de conversacion largos y documentacion de producto en el mismo contexto, servido mediante la API compatible con OpenAI que expone Ferrite en el puerto 8000.
- Generacion de documentacion tecnica y prosa: con 79 tokens por segundo a 2K de contexto, es adecuado para redactar READMEs, guias y articulos a partir de especificaciones o codigo fuente.
- Despliegue en entornos con restricciones de consumo: Ferrite funciona con la tarjeta limitada a 180 W y 2000 MHz, lo que encaja en workstations pequenas o entornos de laboratorio donde el consumo y el ruido importan.
- Prototipado de pipelines de agentes: la capa MTP y la decodificacion especulativa permiten iteraciones rapidas en bucles de razonamiento multi-paso, aunque el soporte de tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad (divergencia KL frente al BF16) y de rendimiento del motor, que se reproducen a continuacion.

Fidelidad respecto al modelo BF16 (KL media por posicion, menor es mejor), medida en Ferrite sobre Arc Pro B70 con cache KV q8:

| Conjunto de prueba | Ruta de prompt fp16 | Ruta de prompt int8 (por defecto) |
|---|---|---|
| Codigo | 0,0054 | 0,0061 |
| Prosa | 0,0105 | 0,0114 |
| Chat | 0,0057 | 0,0065 |
| Prompts de 16K tokens | 0,0048 | 0,0055 |
| Prompts de 120K tokens | 0,0033 | 0,0037 |

Rendimiento en Ferrite sobre una Arc Pro B70 limitada a 180 W y 2000 MHz, con decodificacion especulativa DFlash2, contexto de 128K y decodificacion greedy (tokens por segundo):

| Carga de trabajo | Resultado |
|---|---|
| Codigo, contexto 2K / 32K / 100K | 124 / 111 / 79 |
| Prosa, contexto 2K | 79 |
| Ediciones de codigo (mayoritariamente copiadas del prompt) | 201-244 |
| Decodificacion plana, sin especulacion | 27,6 |
| Procesamiento de prompt a 2K / 8K / 32K / ~120K | ~2.090 / ~2.240 / ~2.060 / ~1.490 |
| Memoria de dispositivo al cargar, contexto 128K | 28,6 GB |

## Requisitos de hardware

- VRAM estimada: 28,6 GB de memoria de dispositivo al cargar con contexto de 128K, segun el autor. El repositorio ocupa 30,3 GB en disco, de los cuales 1,3 GB corresponden al cabezal borrador opcional.
- GPU recomendada: Intel Arc Pro B70 de 32 GB, el unico hardware para el que el autor documenta y valida el formato XQ.
- Cabe en GPU de consumo: no hay datos que lo confirmen; el formato y los kernels estan escritos para la Arc Pro B70 y no se documenta compatibilidad con otras GPUs.
- Opciones de despliegue: exclusivamente Ferrite (crate `fe-xq`), compilado con `cargo build --release --features xe -p fe-server`. No carga en transformers, llama.cpp ni exllamav3. El servidor expone una API compatible con OpenAI en el puerto 8000 con el identificador de modelo "b70".
- Espacio en disco necesario: aproximadamente 36 GB libres segun las instrucciones de despliegue del autor (incluye el modelo y el borrador DFlash2).
- Latencia y throughput: 124 tokens por segundo en codigo a 2K de contexto, 27,6 en decodificacion plana sin especulacion, y procesamiento de prompt de ~2.090 tokens por segundo a 2K y ~1.490 a 120K.
- Consumo: 180 W y 2000 MHz en la configuracion de referencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A continuacion se indican las alternativas identificables y los ejes en los que difieren, sin cifras inventadas:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-XQ-5.0bpw-mix | 27,5B | 128K | XQ (solo Ferrite) | Apache-2.0 | Cuantizacion mixta para Intel Arc Pro B70 |
| Qwen/Qwen3.8-27B (base) | 27,5B | no disponible | safetensors BF16 | Apache-2.0 | Modelo original sin cuantizar; requiere mucha mas memoria |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Borrador para decodificacion especulativa, complementario a esta cuantizacion |

## Limitaciones y advertencias

- Compatibilidad restringida: los pesos solo se cargan en Ferrite. No funcionan en transformers, llama.cpp ni exllamav3, lo que descarta su uso en la mayoria de stacks de produccion habituales.
- Dependencia de hardware: el formato XQ esta disenado para la Intel Arc Pro B70 de 32 GB. No hay evidencia de que funcione en otras GPUs, y el autor no documenta alternativas.
- Sin vision: la torre de vision del modelo base no se incluye porque Ferrite es solo texto. Cualquier caso de uso multimodal queda fuera.
- Idiomas no documentados: la model card no especifica que idiomas soporta el modelo, por lo que el rendimiento multilingue no esta garantizado ni medido.
- Riesgo de alucinacion: no evaluado en la informacion disponible. La fidelidad medida es respecto al BF16, no respecto a la verdad factual; una KL baja no elimina las alucinaciones del modelo base.
- Sesgos: no documentados. Al ser una cuantizacion, hereda los sesgos del modelo base, que no se describen en la informacion proporcionada.
- Perdida de fidelidad en prosa: la categoria con mayor divergencia (KL de 0,0105 en ruta fp16 y 0,0114 en int8) es la prosa, por lo que la generacion literaria o divulgativa es el escenario donde mas se nota la cuantizacion.
- Ruta int8 por defecto: Ferrite procesa los prompts con producto matricial int8 por defecto, un 1,5 veces mas rapido pero con mayor divergencia. Para maxima fidelidad hay que activar `FERRITE_PREFILL=f16`.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el motor Ferrite se compila con un toolchain nightly concreto (`nightly-2026-11-04`), lo que anade fragilidad al despliegue.
- Licencia: Apache-2.0 heredada del modelo base, que permite uso comercial, pero al ser un derivado cuantizado conviene revisar los terminos del modelo original Qwen/Qwen3.8-27B antes de distribuirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BHCC2025/Qwen3.8-27B-XQ-5.0bpw-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Borrador para decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor Ferrite: https://github.com/BHCC2025/ferrite
- Guia de despliegue en Arc B70: https://github.com/BHCC2025/ferrite/blob/main/docs/arc-b70.md
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Conjunto de calibracion (exllamav3): https://github.com/turboderp-org/exllamav3
