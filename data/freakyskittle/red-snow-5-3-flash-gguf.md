# freakyskittle/RED-SNOW-5.3-FLASH-GGUF

## Resumen

RED-SNOW 5.3 FLASH es un modelo de lenguaje de gran escala especializado en operaciones de seguridad ofensiva autorizada, desarrollado por Blackfrost-AI y distribuido en formato GGUF por el usuario freakyskittle. Se construye sobre una base GLM-5.3-Flash (identificador interno `glm5_next`) con adaptacion especifica al dominio de red-team: razonamiento de rutas de ataque, operaciones multidominio (identidad, nube, red, aplicacion, endpoint, OT), analisis de exploits y tradecraft, y traspaso a equipos purple.

Arquitectonicamente es un transformer de tipo Mixture-of-Experts (MoE) con 45 capas, 288 expertos enrutados (8 activos) mas un experto compartido, y aproximadamente 321 mil millones de parametros totales. Incorpora innovaciones tecnicas poco habituales: atencion MLA (solo nope) con un indexador de atencion dispersa DSA y compresion de k-pool, atencion lineal KDA en la mayoria de capas (conv corta + gated delta net), hiperconexiones mHC y una capa MTP (nextn) incluida en el propio archivo GGUF para decodificacion especulativa.

El modelo es relevante ahora porque ofrece capacidades multimodales (vision mediante torre GLM-5.3 en archivo `mmproj` separado) y decodificacion especulativa integrada en un unico archivo GGUF, lo que simplifica el despliegue en llama.cpp. Su licencia MIT y su orientacion a seguridad ofensiva autorizada lo posicionan como una herramienta de nicho para laboratorios, CTFs y ejercicios de red-team.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (nope-only), atencion lineal KDA, indexador DSA, hiperconexiones mHC y capa MTP |
| Parametros totales | 320.759.404.382 (~321B) |
| Parametros activos | 8 expertos de 288 enrutados + 1 compartido (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, UD-Q4_K_XL, Q8_0; mmproj en F16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 safetensors |
| Capas | 45 |
| Expertos | 288 enrutados (8 activos) + 1 compartido |
| Vision | Torre GLM-5.3 (`glm5v`) en `mmproj-RED-SNOW-5.3-FLASH-f16.gguf` (1,16 GB) |
| Decodificacion especulativa | MTP (nextn) incluida en cada GGUF principal, activable con `--spec-type draft-mtp` |
| Tamano del repo | 1564,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 45 capas con 288 expertos enrutados (8 activos por token) y un experto compartido. Combina varios mecanismos de atencion: MLA en modo nope-only, un indexador de atencion dispersa DSA con compresion de k-pool, y atencion lineal KDA (convolucion corta + gated delta net) en la mayoria de capas. Ademas incorpora hiperconexiones mHC, una variante de conexiones residuales que facilita el entrenamiento de redes profundas. La capa MTP (nextn) actua como cabezal de prediccion multi-token y se incluye dentro de cada archivo GGUF para habilitar decodificacion especulativa sin necesidad de un modelo draft separado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que la adaptacion especifica de seguridad se realizo sobre la base GLM-5.3-Flash, pero no detalla el proceso de ajuste. La cuantizacion se realizo con kernels K-quant de llama.cpp, transmitiendo tensor por tensor desde los safetensors BF16 mediante peticiones HTTP range, con un pico de RAM de un solo tensor; los tensores sensibles (`indexer`, `ssm`, `hc`) se mantienen a mayor precision en las variantes dinamicas y los primeros y ultimos octavos de capas se refuerzan en las variantes UD. Cada archivo paso una prueba de humo de generacion (prompt de codigo) y el mmproj una prueba de vision (identificacion de color en imagen).

## Capacidades

- Generacion de texto conversacional con plantilla de chat que preserva la separacion entre respuesta visible y razonamiento interno de GLM, con modos de pensamiento activado y desactivado.
- Razonamiento de rutas de ataque y planificacion de operaciones de seguridad ofensiva autorizada.
- Analisis de exploits, tradecraft y ejecucion consciente de deteccion.
- Operaciones multidominio: identidad, nube, red, aplicacion, endpoint y OT.
- Traspaso a equipos purple (purple-team handoff).
- Vision multimodal: capturas de pantalla, interfaces de objetivos, logs y diagramas, mediante el proyector `glm5v` y el formato `image_url` compatible con OpenAI.
- Decodificacion especulativa MTP integrada para aumentar el throughput de generacion.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se especifica soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Ejercicios de red-team en laboratorio: el modelo puede razonar sobre rutas de ataque y tradecraft en entornos controlados, adecuado por su adaptacion especifica al dominio de seguridad ofensiva.
- CTFs y cyber ranges: analisis de escenarios, identificacion de vectores y planificacion de explotacion en competiciones y entornos de entrenamiento.
- Analisis de capturas y logs con vision: gracias al proyector `glm5v`, puede interpretar capturas de pantalla de interfaces de objetivos, paneles de control y salidas de logs para asistir en la fase de reconocimiento.
- Planificacion de operaciones multidominio: cobertura de identidad, nube, red, aplicacion, endpoint y OT en un mismo modelo, util para equipos que necesitan una vision transversal.
- Traspaso purple-team: generacion de informes y explicaciones de hallazgos para equipos defensivos, aprovechando el modo de razonamiento visible.
- Investigacion en seguridad: estudio de tecnicas de ataque y defensa en entornos academicos, con la ventaja de la licencia MIT para uso comercial e investigador.
- Asistencia en pipelines de validacion de hallazgos: el modelo puede ayudar a estructurar la verificacion de resultados contra sistemas reales bajo supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~106 GB, Q3_K_M ~139 GB, Q4_K_M ~182 GB, UD-Q4_K_XL ~191 GB, Q8_0 ~341 GB. El mmproj F16 anade 1,16 GB.
- El modelo no cabe en GPU de consumo individual. Requiere configuraciones multi-GPU o uso de memoria del sistema con offload parcial.
- GPU recomendadas: para Q2_K y Q3_K_M, multiples A100 80 GB o H100 80 GB; para Q4_K_M y superiores, se necesitan al menos 3-5 GPU de 80 GB o equivalentes. El Q8_0 requiere aproximadamente 5 GPU de 80 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), con soporte obligatorio de `glm5_next` / `Glm5NextForConditionalGeneration` y del proyector `glm5v` para vision. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Throughput y latencia: no disponibles. La decodificacion especulativa MTP integrada puede mejorar el throughput de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (especializados en seguridad ofensiva con arquitectura MoE de ~321B) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para trabajo de seguridad ofensiva autorizado: engagements con alcance definido, laboratorios, CTFs, cyber ranges e investigacion. Su uso fuera de estos supuestos puede ser ilegal.
- Requiere un operador humano que controle el alcance, los objetivos, las credenciales y las acciones destructivas; los hallazgos deben validarse contra sistemas reales.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios tecnicos donde una respuesta incorrecta puede tener consecuencias graves.
- Soporte limitado al idioma ingles segun la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La licencia MIT se hereda del modelo base, pero los materiales de origen originales siguen sujetos a sus propios terminos; conviene revisar la model card del modelo base antes de un uso comercial.
- El modelo base es GLM-5.3-Flash con adaptacion de seguridad; no se detallan los sesgos especificos introducidos por el ajuste.
- El despliegue requiere una compilacion de llama.cpp con soporte de `glm5_next` y `glm5v`, lo que puede limitar la compatibilidad con versiones estandar.
- El tamano del repositorio (1564,1 GB) y de los archivos individuales (hasta 341 GB) exige infraestructura de almacenamiento y ancho de banda considerables.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/RED-SNOW-5.3-FLASH-GGUF
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16
- Discusiones del repositorio: https://huggingface.co/freakyskittle/RED-SNOW-5.3-FLASH-GGUF/discussions
