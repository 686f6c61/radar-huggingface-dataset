# omida-ai/omida-r2-GGUF

## Resumen

Omida R2 es un modelo de lenguaje post-entrenado a partir de Qwen/Qwen3.5-9B (revisión base `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), no un modelo entrenado desde cero. El autor, omida-ai, lo publica bajo el identificador `omida-ai/omida-r2-GGUF` como un paquete de pesos ya cuantizados en formato GGUF, pensado para inferencia local en llama.cpp, LM Studio y Ollama. El checkpoint fusionado seleccionado incorpora dos fases de post-entrenamiento: SFT y GRPO con recompensa verificable sobre respuestas.

El modelo tiene 8.953.803.264 parametros (aproximadamente 8,95 mil millones), un tamano que lo situa en la franja de los modelos densos de 8-9B ampliamente desplegables en hardware de consumo con cuantizaciones agresivas. La model card incluye un aviso explicito: la evaluacion existente es mixta y el paquete no afirma que R2 supere de forma generalizada a R1 ni al modelo base. Se trata, por tanto, de un candidato de investigacion publicado con transparencia sobre sus limitaciones.

La relevancia actual del paquete es fundamentalmente practica: ofrece ocho ficheros GGUF con distintos niveles de compresion (desde F16 de 16,69 GiB hasta Q2_K de 3,56 GiB) mas un proyector de vision separado en F16, lo que permite desplegar el mismo modelo en un abanico amplio de maquinas. Ademas, la nota de conversion documenta una correccion del layout de tensores de Qwen3.5 Gated Delta Network, un detalle tecnico poco habitual que resulta critico para quien intente reproducir la conversion por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; derivada de Qwen/Qwen3.5-9B. Las notas de conversion mencionan tensores de Qwen3.5 Gated Delta Network (`in_proj_a`, `in_proj_b`, `conv1d`) y tensores auxiliares MTP, lo que apunta a una arquitectura hibrida con atencion lineal/GDN y prediccion multi-token |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. El ejemplo de servidor de la model card usa `--ctx-size 4096`, pero no se declara la ventana maxima soportada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q3_K_M, Q2_K; el proyector de vision se distribuye aparte en F16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio incluye un fichero `LICENSE` con la licencia del checkpoint origen, pero su contenido no se detalla |
| Formato de pesos | GGUF (llama.cpp), mas un `mmproj-f16.gguf` para entrada de imagen |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se ha sometido a un pipeline de post-entrenamiento en dos etapas: ajuste supervisado (SFT) y GRPO con recompensa verificable sobre la respuesta (answer-verifiable GRPO). No hay indicacion de entrenamiento desde cero, ni de volumen de tokens de entrenamiento, ni de composicion del dataset, ni de tecnicas de alineacion adicionales como RLHF o DPO mas alla del GRPO citado. La model card remite a un informe de evaluacion y a un informe final en el repositorio para resultados medidos y limitaciones, pero esos documentos no forman parte de la informacion disponible.

El detalle tecnico mas relevante del paquete esta en las notas de conversion. Los pesos GGUF se exportaron desde un checkpoint BF16 fusionado local y se cuantizaron con llama.cpp `b1-7bfe120`. El conversor local incluye una correccion del layout de tensores de Qwen3.5 Gated Delta Network y omite los tensores auxiliares de borrador MTP. Segun el autor, esto era necesario porque el conversor sin modificar producia dimensiones incorrectas para `in_proj_a`, `in_proj_b` y `conv1d`. La salida se regenero desde la conversion F16 corregida, y las pruebas de humo sobre Q4, Q3 y Q2 confirman que cargan y generan texto. Tambien se indica que el proyector de vision es deliberadamente independiente y permanece en F16.

## Capacidades

- Generacion de texto conversacional: la model card describe el modelo como orientado a conversacion y el tag `conversational` aparece en el repositorio.
- Razonamiento con modo de pensamiento: el ejemplo de `llama-server` incluye el flag `--reasoning off`, lo que implica que el modelo soporta un modo de razonamiento que puede activarse o desactivarse en el runtime.
- Entrada de imagen: existe un proyector de vision (`mmproj-f16.gguf`, 0,86 GiB) que habilita entrada multimodal en runtimes compatibles con el layout de proyector separado. El propio autor advierte que la comprension de imagen no se probo durante el empaquetado.
- Servidor compatible con la API de OpenAI: mediante `llama-server` se expone un endpoint `/v1/chat/completions`; el tag `endpoints_compatible` refuerza este uso.
- Tool calling y function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Matematicas y generacion de codigo: no disponible como capacidad declarada; el GRPO con recompensa verificable sugiere trabajo sobre respuestas comprobables, pero no se especifica el dominio.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: con Q4_K_M (5,24 GiB) el modelo cabe holgadamente en una GPU de 16 GB como la RTX 5060 Ti empleada en las pruebas del autor, dejando margen para el contexto y el proyector de vision.
- Despliegue en portatiles y equipos sin GPU dedicada: la cuantizacion Q3_K_M (4,31 GiB) o Q2_K (3,56 GiB) permite ejecucion en CPU con llama.cpp u Ollama, a costa de una perdida de calidad que el autor advierte como experimental en Q2_K.
- Servicio conversacional autoalojado con API compatible OpenAI: `llama-server` expone `/v1/chat/completions`, de modo que el modelo puede sustituir a un endpoint remoto en aplicaciones existentes sin cambiar el codigo cliente, algo util para entornos con requisitos de soberania de datos.
- Experimentacion academica sobre post-entrenamiento: al ser un candidato de investigacion con pipeline SFT + GRPO documentado y resultados declarados como mixtos, resulta util como caso de estudio para analizar el efecto del GRPO verificable sobre un base de 9B.
- Pruebas de pipelines multimodales en local: el par `mmproj-f16.gguf` mas el modelo cuantizado permite montar un flujo texto-imagen en llama.cpp o LM Studio, siempre que se valide previamente la comprension de imagen, no verificada por el autor.
- Comparacion de cuantizaciones sobre un mismo checkpoint: el repositorio ofrece siete niveles de cuantizacion del mismo modelo, lo que facilita medir la degradacion de calidad frente al ahorro de memoria en un hardware concreto.
- Integracion en LM Studio para prototipado rapido: el autor documenta el comando `lms import ./omida-r2-q4_k_m.gguf --user-repo omida/omida-r2 --copy`, lo que permite tener el modelo disponible en una interfaz de escritorio en pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un informe de evaluacion (`reports/EVAL_REPORT.md`) y un informe final (`reports/FINAL_REPORT.md`) dentro del repositorio, pero sus cifras no se incluyen en los datos proporcionados. El autor afirma explicitamente que la evaluacion existente es mixta y que no se reclama una superioridad general sobre R1 ni sobre el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto ni proyector): F16 16,69 GiB; Q8_0 8,87 GiB; Q6_K 6,85 GiB; Q5_K_M 6,02 GiB; Q4_K_M 5,24 GiB; Q3_K_M 4,31 GiB; Q2_K 3,56 GiB. Hay que sumar la memoria de contexto, las cachés KV y, si se usa vision, los 0,86 GiB del proyector.
- GPU validadas por el autor: RTX 5060 Ti con 16 GB de VRAM, con llama.cpp build `b1-7bfe120`, cargando Q4_K_M, Q3_K_M y Q2_K junto al proyector.
- GPU recomendadas: no disponible. El autor no publica una lista de GPU recomendadas; por tamano, una GPU de 16 GB cubre sin problema Q4_K_M y cuantizaciones inferiores, y una de 24 GB (RTX 4090, A5000) permite Q6_K o Q8_0 con contexto amplio. Las cuantizaciones F16 y Q8_0 requieren tarjetas de 24-48 GB (A100 40 GB, L40S, H100) para operar con comodidad.
- Compatibilidad con GPU de consumo: si. Q4_K_M, Q3_K_M y Q2_K entran en GPUs de 8-16 GB; Q5_K_M y Q6_K son viables en 12-16 GB con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio (`lms import`), Ollama (`ollama create` con el `Modelfile` incluido). Otros runtimes compatibles con GGUF no se mencionan.
- Latencia y throughput: no disponible. El autor solo reporta una prueba de humo de generacion de texto corta, sin cifras de tokens por segundo.
- Nota sobre vision en Ollama: el `Modelfile` incluido es solo para texto; el proyector no esta conectado, y el autor no probo la compatibilidad ni la generacion con Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Omida R2 (omida-ai/omida-r2-GGUF) | 8,95B | No disponible | No disponible | GGUF en 7 cuantizaciones, publicado en HuggingFace |
| Qwen/Qwen3-8B | Aproximadamente 8,2B | No disponible en esta ficha | Apache 2.0 (referencia general, verificar) | Safetensors y GGUF en el ecosistema |
| meta-llama/Llama-3.1-8B-Instruct | Aproximadamente 8,0B | No disponible en esta ficha | Licencia comunitaria Llama 3.1 (verificar) | Safetensors y GGUF |
| mistralai/Mistral-7B-Instruct-v0.3 | Aproximadamente 7,2B | No disponible en esta ficha | Apache 2.0 (verificar) | Safetensors y GGUF |

Los datos de parametros y licencias de los modelos comparados son referencias generales ampliamente conocidas y deben verificarse contra las fichas oficiales antes de tomar decisiones de despliegue. No se dispone de comparaciones de rendimiento porque no hay cifras de benchmarks publicadas para Omida R2 en la informacion disponible.

## Limitaciones y advertencias

- Resultados mixtos declarados por el propio autor: la model card indica explicitamente que no se reclama que R2 supere de forma generalizada a R1 ni al modelo base Qwen3.5-9B.
- Licencia no disponible: el repositorio incluye un fichero `LICENSE` con la licencia del checkpoint origen, pero su contenido no se detalla en la informacion disponible. Es imprescindible revisarlo antes de cualquier uso comercial.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el comportamiento multilingue es desconocido.
- Ventana de contexto no declarada: no se especifica la longitud maxima de contexto. El ejemplo documentado usa 4096 tokens, y superar ese valor sin conocer el limite real puede degradar la calidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al ser un modelo post-entrenado con GRPO sobre respuestas verificables, el comportamiento fuera de ese dominio queda sin caracterizar.
- Vision no validada: el autor confirma que la carga del proyector se verifico, pero la comprension de imagen en si no se probo. Cualquier uso multimodal requiere validacion propia.
- Q2_K marcado como experimental: el autor reporta que Q2_K devolvio una respuesta codiciosa vacia en un prompt de coincidencia exacta y desaconseja su uso para trabajos sensibles a la calidad.
- Ollama sin validar: el `Modelfile` no esta probado, no integra el proyector de vision y el autor recomienda consultar la documentacion vigente del runtime.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario ni de validacion externa.
- Conversor no estandar: los GGUF requirieron un conversor local con correccion del layout de Qwen3.5 Gated Delta Network. Reconvertir el modelo con un llama.cpp sin esos parches puede producir dimensiones incorrectas.
- F16 poco practico: 16,69 GiB en un unico fichero mas el contexto y el runtime superan la mayoria de configuraciones de consumo, por lo que no es una opcion por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omida-ai/omida-r2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe de evaluacion (ruta relativa citada en la model card): `reports/EVAL_REPORT.md` dentro del repositorio
- Informe final (ruta relativa citada en la model card): `reports/FINAL_REPORT.md` dentro del repositorio
- Hashes de los ficheros GGUF: `SHA256SUMS.txt` dentro del repositorio
- Conversor utilizado: `tools/r2-gguf/convert_hf_to_gguf.py` dentro del repositorio
- Metadatos del checkpoint fusionado: `models/omida-r2-merged/omida_merge_metadata.json` dentro del repositorio

No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios externos) en la busqueda web realizada.
