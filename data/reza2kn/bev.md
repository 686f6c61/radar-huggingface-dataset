# Reza2kn/Bev

## Resumen

Bev es un paquete de modelo y software publicado por el desarrollador Reza2kn que convierte un modelo ternario de 27B en un motor de decisiones estructuradas. No es un fine-tune ni una cuantizacion nueva: el archivo GGUF del repositorio es una redistribucion identica byte a byte de `prism-ml/Ternary-Bonsai-2-27B-gguf`, derivado a su vez de Qwen/Qwen3.8-27B. Lo que aporta Bev es una extension de puntuacion de tokens seleccionados, una API local de decisiones tipadas y una configuracion de despliegue reproducible y medida.

El uso previsto no es la generacion libre de texto, sino la evaluacion de una distribucion de siguiente token por campo para puntuar un conjunto finito de alternativas y ensamblar JSON estructurado en Python. Soporta primitivas booleanas, enumeraciones, elecciones con probabilidades completas, un campo "Noul" (probabilidad asignada a verdadero) y puntuaciones ponderadas sobre una rubrica ordenada, con entre 2 y 255 candidatos por campo.

Es relevante ahora porque demuestra un patron poco habitual: reutilizar un modelo ternario de ~27B en ~7,2 GB de pesos como clasificador y enrutador determinista concreto, con cifras de memoria medidas (7,28 GiB de RAM en CPU, 8,30 GiB de VRAM en CUDA, 8,18 GiB de RSS en un Apple M2 con 24 GiB unificados) en lugar de estimaciones teoricas. El proyecto esta en version 0.1.2, con licencia Apache-2.0 para los pesos y MIT para el codigo, y soporte declarado de ingles y persa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada del modelo base Qwen/Qwen3.8-27B; la model card no detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible como valor de modelo; la configuracion de servicio validada usa 2 ranuras de 16.384 tokens por campo, y las pruebas en CPU usan 1 ranura de 4.096 tokens |
| Tipos de cuantizacion | PQ2_0: pesos ternarios empaquetados en ranuras de dos bits con escalado por grupo |
| Idiomas soportados | Ingles (en) y persa (fa) |
| Licencia | Pesos: Apache-2.0 (incluye LICENSE y NOTICE.txt originales). Codigo: MIT |
| Formato de pesos | GGUF (`Ternary-Bonsai-2-27B-PQ2_0.gguf`) |
| Tamano del archivo | 7.206.168.928 bytes (7,21 GB; 6,71 GiB) |
| SHA-256 de los pesos | `3907dc1658db1f78a9826bf8d5bcb8dc65db0d466388937af57f2294fae62ec1` |
| Tamano del repositorio | 7,2 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Upstream inmediato | prism-ml/Ternary-Bonsai-2-27B-gguf (revision `6ed5e12bf84b7a63069882c91dd9e9218647d17b`) |
| Libreria declarada | llama.cpp |
| Pipeline | text-generation |
| Version del paquete | v0.1.2 |
| Descargas / likes (HF) | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

Bev no entrena nada. La model card es explicita: el GGUF es una redistribucion identica byte a byte de los pesos de Prism ML, y el proyecto declara "sin entrenamiento, sin LoRA y sin nueva cuantizacion". La innovacion esta en la capa de inferencia: un motor de decision ternario construido alrededor de lo que el autor llama puntuacion estilo Jevfire de un solo token. En lugar de generar texto, el runtime evalua una distribucion de siguiente token por campo, puntua cada candidato y ensambla el JSON estructurado del lado de Python. El runtime admite de 2 a 255 candidatos por campo y rechaza explicitamente entradas sobredimensionadas y conjuntos de puntuaciones incompletos.

La cuantizacion subyacente es ternaria en formato PQ2_0, con pesos empaquetados en ranuras de dos bits y escalado por grupo. La model card advierte que un visor GGUF generico o un llama.cpp upstream estandar no son el runtime validado para PQ2_0: hay que usar el fork de Prism fijado por version mas el adaptador de Bev. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que corresponden al modelo base y no se documentan aqui.

## Capacidades

- Decision estructurada tipada: devuelve un valor de un conjunto permitido (booleano o enumeracion) a partir de contexto y opciones finitas.
- Eleccion con probabilidades: devuelve la clave de la opcion original junto con las probabilidades completas de todos los candidatos.
- Campo "Noul": probabilidad asignada a verdadero, segun la nomenclatura de la model card.
- Puntuacion: posicion ponderada por probabilidad dentro de una rubrica ordenada.
- Salida JSON ensamblada en Python, lista para consumo por otros servicios.
- Escalado de candidatos: de 2 a 255 alternativas por campo.
- Servicio concurrente: la configuracion validada usa 2 ranuras de 16.384 tokens por campo.
- Multilinguee limitado a ingles y persa.
- API HTTP local con documentacion interactiva en `/docs` y endpoint `POST /v1/decisions`.
- Capacidad de ejecucion en CPU (Linux, Windows x64) y en GPU CUDA, ademas de Metal en Apple Silicon.
- No ofrece: cabeza de clasificacion para Transformers, endpoint de inferencia alojado ni demo en navegador.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo incluido en el repositorio (`examples/support-request.json`) devuelve `{"route":"billing"}` en `parsed_json` junto con las puntuaciones completas de los candidatos, lo que permite auditar por que se eligio esa ruta.
- Clasificacion de intenciones en un chatbot: definir una enumeracion cerrada de intenciones y dejar que el modelo devuelva la mas probable con su distribucion completa, en lugar de parsear texto libre.
- Moderacion con umbral probabilisitico: usar el campo "Noul" para obtener la probabilidad de "verdadero" de una afirmacion y aplicar un umbral configurable en el servicio que consume la API.
- Puntuacion de rubricas: ordenar respuestas o contenidos candidatos segun una rubrica ordenada, obteniendo una posicion ponderada por probabilidad utilizable para ranking.
- Enrutado de herramientas en un agente: dado un contexto y un conjunto finito de herramientas disponibles, elegir la herramienta mediante una decision de eleccion con probabilidades, sin necesidad de generar una llamada completa.
- Preprocesado de pipelines de datos en persa: clasificar o etiquetar registros en persa con un modelo que declara ese idioma y que fue validado con el benchmark persa de Jev.
- Despliegue en el borde o en maquinas sin GPU: con 7,21 GB de archivo y un pico medido de 7,28 GiB de RAM en Linux CPU, es viable en un servidor modesto para decisiones de baja latencia (una sola puntuacion corta por peticion).
- Extraccion de campos discretos de documentos: en lugar de generar JSON libre, mapear cada campo a un conjunto finito de valores validos y dejar que el modelo puntue cada opcion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el 23 de septiembre de 2026 se ejecuto el benchmark persa completo de Jev con Bev v0.1.1 (mismo modelo y mismo codigo de puntuacion que v0.1.2) y que la configuracion CUDA con dos ranuras de 16.384 tokens fue validada con ese benchmark, pero el texto proporcionado se interrumpe antes de mostrar cifras y no se incluye ninguna tabla de resultados.

Datos de rendimiento no funcional si disponibles:

| Metrica | Valor |
|---|---|
| Memoria pico en CPU Linux (1 ranura de 4.096 tokens) | 7,28 GiB de RAM residente (VmHWM de 7.630.416 KiB, incluye paginas mapeadas) |
| Memoria en reposo tras carga (CPU Linux) | ~7,12 GiB |
| Memoria de GPU (CUDA, 2 ranuras de 16.384 tokens) | 8.504 MiB en una instantanea del proceso servidor |
| RSS en macOS Metal (M2, 24 GiB unificados, 1 ranura de 4.096 tokens) | 8,18 GiB de RSS muestreado |
| Comprobaciones de humo de la API en macOS | 14/14 superadas |
| Latencia y throughput | No disponibles |

## Requisitos de hardware

- VRAM medida: 8.504 MiB en la configuracion CUDA validada (2 ranuras de 16.384 tokens). Cualquier GPU con al menos ~9-10 GB libres deberia poder alojarla, pero la model card solo reporta la medicion de esa configuracion concreta.
- RAM de sistema en CPU: pico medido de 7,28 GiB en Linux para una inferencia corta con una ranura de 4.096 tokens. La recomendacion explicita del autor para uso solo en CPU es partir de 16 GB de RAM; una maquina de 8 GB esta sin verificar y probablemente demasiado ajustada.
- Apple Silicon: el dato de 8,18 GiB corresponde a RSS de proceso en un M2 con 24 GiB de memoria unificada. Al ser memoria unificada, las asignaciones de RAM y Metal no pueden sumarse como pools separados.
- Windows x64 en CPU: requiere RAM del sistema, sin medicion independiente. Se ofrece una ruta de compilacion portable desde fuente.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Cabe en GPU de consumo: la huella medida de ~8,3 GiB es compatible con tarjetas de 10-12 GB o superiores, siempre que se reserve margen para el sistema operativo, la API, contextos mas largos y paralelismo. No hay validacion publicada en esas tarjetas.
- Opciones de despliegue: el runtime validado es el fork CUDA 12.8 de Prism, fijado por version, mas el adaptador de Bev. No se admite llama.cpp upstream estandar ni un visor GGUF generico para PQ2_0. No se mencionan vLLM, TGI ni Ollama.
- Instalacion: `git clone --branch v0.1.2 https://github.com/Reza2kn/Bev.git`, `bash scripts/install.sh`, `bash scripts/start-services.sh`; la API escucha en `http://127.0.0.1:18781` y la documentacion en `/docs`. El instalador verifica y descarga el archivo original fijado de Prism.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bev (Reza2kn) | 26,9 B (26.895.998.464) | No disponible (servicio validado con 16.384 tokens por campo) | Sin cifras publicadas; benchmark persa de Jev ejecutado y validado en CUDA | Pesos Apache-2.0, codigo MIT | GGUF de 7,21 GB en HuggingFace; requiere fork de Prism y adaptador |
| Ternary-Bonsai-2-27B (prism-ml) | No disponible | No disponible | No disponible en la informacion aportada | No disponible en la informacion aportada | GGUF publicado por Prism ML; es el upstream inmediato de Bev |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible en la informacion aportada | No disponible en la informacion aportada | Modelo base original, presumiblemente en precision completa; Bev no lo redistribuye |

No se dispone de datos suficientes para comparar con terceros modelos ternarios o clasificadores de la misma categoria (por ejemplo, alternativas tipo BitNet) ni con modelos de decision estructurada de tamano similar. Cualquier comparacion numerica seria una invencion.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribucion byte a byte de pesos de Prism ML. Atribuir a Bev mejoras de calidad del modelo base seria incorrecto. La licencia MIT aplica al codigo; los pesos siguen Apache-2.0 con LICENSE y NOTICE.txt incluidos.
- La model card advierte que llama.cpp upstream estandar y los visores GGUF genericos no son el runtime validado para PQ2_0. Usar otra ruta de inferencia puede degradar o romper la puntuacion.
- El modelo esta disenado para decisiones sobre conjuntos finitos de opciones, no para generacion libre de texto, a pesar de que el pipeline declarado sea `text-generation`. No hay cabeza de clasificacion para Transformers ni endpoint alojado.
- Sesgos conocidos: no se documentan en la informacion disponible. Al derivar de Qwen3.8-27B, cabe esperar los sesgos de ese modelo base, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: la salida es una distribucion de probabilidad sobre candidatos, no una garantia. Un candidato con probabilidad alta puede ser incorrecto; el diseno mitiga el problema al obligar a elegir dentro de un conjunto permitido, no al eliminarlo.
- Limites de idioma: solo ingles y persa declarados. No hay soporte documentado de castellano ni de otros idiomas.
- Limites de entrada: el runtime rechaza explicitamente entradas sobredimensionadas y conjuntos de puntuaciones incompletos; admite entre 2 y 255 candidatos por campo.
- La precision persa no ha sido reproducida de forma independiente en macOS ni en Windows, segun la propia model card.
- La API se enlaza a loopback por defecto. Exponerla en red requiere configuracion explicita y revision de seguridad.
- Madurez temprana: version 0.1.2, 0 descargas y 1 like en HuggingFace en el momento de los datos, creado y actualizado el mismo dia. No hay historial de produccion ni comunidad que lo respalde.
- Las cifras de memoria son mediciones puntuales de configuraciones concretas (instantaneas de proceso, RSS muestreado), no picos garantizados.
- El codigo de Bev se distribuye como wheel de Python que empaqueta solo la API; el backend nativo requiere el instalador desde fuente.
- La evaluacion con el benchmark persa de Jev carece de cifras publicadas en la informacion disponible, por lo que no puede verificarse su magnitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Reza2kn/Bev
- Repositorio de codigo y documentacion: https://github.com/Reza2kn/Bev
- Release v0.1.2: https://github.com/Reza2kn/Bev/releases/tag/v0.1.2
- Benchmarks: https://github.com/Reza2kn/Bev/blob/v0.1.2/docs/BENCHMARKS.md
- Guia de instalacion: https://github.com/Reza2kn/Bev/blob/v0.1.2/docs/INSTALL.md
- Instalacion portable para macOS, Windows y Linux CPU: https://github.com/Reza2kn/Bev/blob/main/docs/INSTALL.md#macos-windows-and-linux-cpu
- Upstream inmediato de los pesos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Benchmark persa de Jev: la URL aparece truncada en la informacion disponible (`https://github.com/Arm...`), por lo que no puede citarse completa.
