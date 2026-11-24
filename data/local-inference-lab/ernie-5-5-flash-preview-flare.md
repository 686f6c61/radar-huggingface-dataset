# local-inference-lab/ERNIE-5.5-Flash-Preview-FLARE

## Resumen

ERNIE-5.5-Flash-Preview-FLARE es un paquete de inferencia firmado publicado por local-inference-lab para el modelo base baidu/ERNIE-5.5-Flash-Preview, un transformer de tipo Mixture-of-Experts desarrollado por Baidu. No se trata de un modelo nuevo, sino de una distribucion empaquetada y optimizada para Flare, el runtime de inferencia nativo en Rust de NVIDIA orientado a sistemas DGX y GPUs locales. El paquete incluye pesos preparados, kernels compilados, grafos de ejecucion capturados y metadatos firmados por el publicador.

El modelo base emplea una arquitectura hibrida de atencion (37 capas Hybrid Compressed Attention / VHA y 6 capas MQA-DSA de atencion dispersa), 43 capas en total, anchura oculta de 4.096, 64 cabezas de atencion y 512 expertos enrutados SiTU mas un experto compartido con enrutamiento sigmoide top-10. Su ventana de contexto alcanza 1.048.576 tokens y el vocabulario cuenta con 201.216 entradas. Incorpora decodificacion especulativa DSpark con tamano de bloque 7.

La relevancia de este paquete radica en que permite servir el modelo en dos GPUs de 96 GB mediante tensor-parallel, con una huella fija de aproximadamente 81,2 GiB por GPU y unos 24,7 GiB libres para cache KV (alrededor de 1,43 millones de tokens logicos de KV). El formato es exclusivo de Flare: Transformers, vLLM, SGLang y llama.cpp no pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con 37 capas Hybrid Compressed Attention / VHA y 6 capas MQA-DSA de atencion dispersa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (512 expertos enrutados SiTU + 1 experto compartido, top-10 split-feature sigmoid routing) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | MXFP4 (escalas de expertos CSF con compresion sin perdida), FP8 (pesos de transicion Markov), NVFP4 (pesos de la cabeza draft) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Flare firmado: model.safetensors (metadatos primarios), archivos companeros direccionados por contenido y publisher.json |
| Capas | 43 |
| Anchura oculta | 4.096 |
| Cabezas de atencion | 64 |
| Vocabulario | 201.216 entradas |
| Decodificacion especulativa | DSpark, tamano de bloque 7 |
| Revision del checkpoint base | ace1100dcde7bf4eb06add6ae11ce4f43a11ddfe |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE que combina dos mecanismos de atencion: 37 capas de Hybrid Compressed Attention / VHA y 6 capas MQA-DSA de atencion dispersa. El bloque MoE contiene 512 expertos enrutados con activacion SiTU y un experto compartido, con enrutamiento sigmoide top-10 sobre caracteristicas divididas (split-feature). El vocabulario es de 201.216 entradas y el modelo aplica calibracion de logits MultiMax. La ventana de contexto es de 1.048.576 tokens.

El paquete FLARE no entrena el modelo, sino que lo prepara para cada plataforma: compila kernels, captura grafos de ejecucion y comprime los pesos. Para la plataforma gb202 se conservan escalas MXFP4 de los expertos con compresion CSF sin perdida, pesos de transicion Markov en FP8 y pesos de la cabeza draft en NVFP4. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica del paquete es el runtime Flare: escrito en Rust, sin Python ni compilacion en tiempo de ejecucion, sirve paquetes firmados directamente en GPU usando kernels precompilados y grafos capturados. Soporta tensor-parallel entre multiples GPUs o hosts mediante Orbit y verifica firmas del publicador antes de cargar. Se distribuye como imagen de contenedor o como ejecutable `flare` instalado desde un repositorio APT firmado.

## Capacidades

- Generacion de texto con ventana de contexto de 1.048.576 tokens por peticion.
- Razonamiento extraible mediante la etiqueta `<ernie:think>`.
- Tool calling / function calling mediante XML con la etiqueta `<ernie:tool_call>`.
- API compatible con OpenAI bajo el nombre de modelo `ERNIE-5.5-Flash-Preview`.
- Decodificacion especulativa DSpark integrada (bloque de 7) para acelerar la generacion.
- Servicio en tensor-parallel sobre dos GPUs mediante Orbit.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno muy largas gracias a su ventana de 1.048.576 tokens, manteniendo el historial completo de la interaccion sin truncar.
- Analisis de documentos extensos: informes, expedientes o bases de codigo de gran tamano pueden procesarse en una sola peticion, aprovechando la atencion dispersa MQA-DSA para reducir coste en secuencias largas.
- Agentes con tool calling: la integracion nativa de `<ernie:tool_call>` en XML permite construir agentes que invocan APIs externas y encadenan pasos de razonamiento con `<ernie:think>`.
- Despliegue on-premise en DGX: organizaciones con dos RTX PRO 6000 Blackwell de 96 GB pueden servir el modelo localmente con Flare, sin dependencia de servicios en la nube.
- Generacion de codigo en pipelines: la API compatible con OpenAI facilita integrar el modelo en herramientas de CI/CD y asistentes de desarrollo que requieran contexto de repositorio amplio.
- Razonamiento con trazas auditables: la extraccion separada del bloque de pensamiento permite registrar y auditar el razonamiento del modelo en entornos regulados.
- Sustitucion de backends Python en produccion: el runtime en Rust sin compilacion en tiempo de ejecucion reduce la superficie de dependencias y simplifica el despliegue de contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 81,2 GiB fijos por GPU en la configuracion gb202, con unos 24,7 GiB restantes por GPU para cache KV (alrededor de 1,43 millones de tokens logicos de KV).
- GPU recomendadas: 2× RTX PRO 6000 Blackwell de 96 GB (SM120) en un mismo host, sobre Linux x86-64.
- Tamano del paquete: aproximadamente 167 GB (156 GiB) para la revision gb202.
- GPU de consumo: no cabe en GPUs de consumo convencionales; requiere el perfil de dos GPUs profesionales de 96 GB.
- Opciones de despliegue: exclusivamente el runtime Flare (imagen de contenedor `ghcr.io/local-inference-lab/flare:release` o ejecutable `flare` desde repositorio APT firmado). vLLM, SGLang, llama.cpp y Transformers no pueden cargar este formato.
- Requisito de version: se necesita una build de Flare que incluya NVIDIA/hyperflare-inference#500 para el parser XML de tool/think.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-FLARE | no disponible (MoE, 512 expertos) | 1.048.576 | Apache-2.0 | Paquete Flare firmado, solo runtime Flare |
| baidu/ERNIE-5.5-Flash-Preview | no disponible (mismo checkpoint base) | 1.048.576 | Apache-2.0 | Pesos originales, compatible con stacks habituales |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el checkpoint original de Baidu, del que este paquete deriva. No se dispone de datos de rendimiento ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El formato es propietario de Flare: no puede cargarse con Transformers, vLLM, SGLang ni llama.cpp, lo que limita la portabilidad y ata el despliegue al runtime de NVIDIA.
- Requiere hardware muy especifico (dos RTX PRO 6000 Blackwell de 96 GB en un mismo host), lo que excluye la mayoria de entornos de desarrollo y produccion convencionales.
- La integridad del paquete depende de mantener juntos el archivo primario, todos los companeros y publisher.json con sus nombres originales; mezclar archivos entre revisiones provoca fallos de verificacion.
- La build de Flare debe incluir el PR #500; versiones anteriores no soportan el parser XML de tool/think.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera de los idiomas principales del modelo base.
- Sesgos conocidos y tasa de alucinacion: no disponible en la informacion proporcionada.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base y del runtime Flare antes de un uso comercial en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/local-inference-lab/ERNIE-5.5-Flash-Preview-FLARE
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Configuracion de plataforma gb202: https://huggingface.co/local-inference-lab/ERNIE-5.5-Flash-Preview-FLARE/blob/gb202/README.md
- Runtime Flare (NVIDIA): https://github.com/NVIDIA/flare-local-inference
- Repositorio hyperflare-inference: https://github.com/NVIDIA/hyperflare-inference
- PR #500 (parser XML tool/think): https://github.com/NVIDIA/hyperflare-inference/pull/500
- Imagen de contenedor: ghcr.io/local-inference-lab/flare:release
