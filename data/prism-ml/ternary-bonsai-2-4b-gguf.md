# prism-ml/Ternary-Bonsai-2-4B-gguf

## Resumen

Ternary-Bonsai-2-4B es un modelo vision-lenguaje de clase 4B cuyos pesos de lenguaje son ternarios ({−1, 0, +1}) con escalas FP16 por grupo. Lo publica prism-ml y deriva de Qwen/Qwen3.5-4B manteniendo la arquitectura intacta: atencion hibrida con una proporcion 3:1 entre capas de atencion lineal y capas de atencion completa (24 + 8 sobre 32 bloques), MLP SwiGLU, RoPE y RMSNorm, con contexto de 262.144 tokens. Incluye ademas una torre de vision de ~0,33B parametros (24 bloques) que se carga como paquete mmproj aparte unicamente cuando llega una imagen.

El problema que resuelve es el despliegue de un VLM multimodal con contexto muy largo en memoria muy reducida: el modelo de lenguaje ocupa 1,15 GB en el empaquetado PQ2_0, frente a los ~8,4 GB del mismo modelo en FP16, y 0,95 GB en PTQ1_0. Los pesos ternarios nunca se expanden a FP16 en tiempo de ejecucion; se consumen directamente mediante kernels personalizados incluidos en el fork de llama.cpp de PrismML (rama `prism`), con soporte para CUDA, Metal y CPU. Es relevante porque demuestra inferencia multimodal de contexto 262K en hardware de consumo y en CPU, con licencia Apache 2.0.

Los tres empaquetados publicados (PTQ1_0, PQ2_0 y Q2_0) contienen exactamente los mismos pesos ternarios y solo difieren en el layout de almacenamiento y en la velocidad de kernel. El repositorio incluye tambien cabezales opcionales de decodificacion especulativa (MTP y DFlash2). El modelo acumula 4.761 descargas y 19 likes en HuggingFace desde su publicacion en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de atencion (3 capas de atencion lineal por cada capa de atencion completa; 24 lineales + 8 completas), SwiGLU MLP, RoPE, RMSNorm; 32 bloques, hidden 2560, embedding y LM head atados |
| Parametros totales | ~4,21B en el modelo de lenguaje + ~0,33B en la torre de vision (24 bloques). Nota: la ficha de HuggingFace declara 782.004.736 parametros en safetensors, dato que no coincide con la model card; probablemente corresponde a una medicion parcial o erronea del repo GGUF |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternaria {−1, 0, +1} con escalas FP16 por grupo, en tres empaquetados: PTQ1_0 (~1,81 bits/peso), PQ2_0 (~2,18 bits/peso), Q2_0 (~2,31 bits/peso). Normalizacion y ruta de estado de atencion lineal (`ssm_alpha`, `ssm_beta`) se mantienen en F32. Torre de vision en Q8_0 o BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), consumido por kernels personalizados |
| Modelo base | Qwen/Qwen3.5-4B |
| Rotacion de pesos | Hadamard por bloques plegada en los pesos almacenados; el runtime aplica la transformada equivalente sobre las activaciones |
| Backends | llama.cpp mediante el fork de PrismML (CUDA, Metal, CPU); upstream llama.cpp solo acepta Q2_0 |
| Tarea declarada | image-text-to-text (vision-lenguaje) |

## Arquitectura y entrenamiento

La arquitectura reproduce la del modelo base sin cambios estructurales: 32 bloques transformer con hidden size 2560, atencion hibrida en proporcion 3:1 (24 capas de atencion lineal y 8 de atencion completa), MLP SwiGLU, RMSNorm y RoPE, con el embedding y la LM head atados. Sobre esa base se aplica una cuantizacion ternaria que cubre embeddings, proyecciones de atencion, proyecciones del MLP y la LM head atada. Los pesos se almacenan como trits {−1, 0, +1} acompanados de una escala FP16 por grupo. Para reducir el error de cuantizacion, los pesos incorporan una rotacion de Hadamard por bloques ya plegada, y el runtime aplica la transformada correspondiente a las activaciones. Los tensores sensibles a la precision (pesos de normalizacion y las rutas de estado de la atencion lineal, `ssm_alpha` y `ssm_beta`) permanecen en F32.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otros ajustes de alineamiento: esa informacion no esta disponible. Tampoco se documenta el procedimiento exacto de calibracion de las escalas por grupo mas alla de su existencia. La innovacion tecnica principal es el almacenamiento ternario con rotacion Hadamard integrada y tres layouts de empaquetado distintos (PTQ1_0 con trits densos, PQ2_0 con slots de 2 bits y Q2_0) que se consumen directamente en kernel sin reexpandir a FP16. Como complemento, el repo publica un archivo PQ2_0 con un cabezal MTP (multi-token prediction) integrado de 1,27 GB y un drafter por bloques DFlash2 en BF16 de 1,58 GB, pensados para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla que admite `enable_thinking`.
- Modo de razonamiento explicito (thinking mode) activado por defecto, con parametros de muestreo diferenciados.
- Comprension de imagenes: pipeline image-text-to-text, con torre de vision cargada mediante mmproj.
- Descripcion de imagenes, respuesta a preguntas visuales y lectura de texto en imagen; la model card sugiere subir el presupuesto de tokens de imagen (`--image-min-tokens 1024`) para texto pequeno o denso.
- Contexto largo de hasta 262.144 tokens sobre la columna de lenguaje.
- Decodificacion especulativa mediante cabezal MTP integrado o drafter DFlash2 opcional.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) a traves de `llama-server`.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso agentico multi-paso: no documentado en la informacion disponible.
- Cobertura multilingue: no disponible; no se publica lista de idiomas.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal en dispositivo: con 1,15 GB de pesos y 0,37 GB de proyector de vision, el modelo cabe en portatiles, mini-PC y moviles con llama.cpp sobre CPU o Metal, permitiendo descripcion de imagenes y dialogo sin conexion a servicios externos.
- Analisis de documentos largos con imagenes intercaladas: la ventana de 262.144 tokens permite procesar informes, expedientes o manuales completos en una sola pasada, combinando texto e imagenes de figuras sin trocear el documento.
- Extraccion de informacion de capturas y formularios: uso con `--image-min-tokens 1024` para texto denso en pantalla, integrado en pipelines de digitalizacion que ya usan la API compatible con OpenAI de `llama-server`.
- Acceso a modelos de razonamiento en hardware de gama baja: el modo thinking con `temperature=1.0`, `top_p=0.95` y `top_k=20` permite obtener cadenas de razonamiento en equipos sin GPU dedicada, donde un 4B en FP16 no cabria con comodidad.
- Servicio de inferencia en CPU para cargas por lotes: al ocupar 0,95-1,21 GB, se pueden levantar varias instancias simultaneas en un solo servidor x86 sin GPU, algo inviable con el mismo modelo en FP16 (~8,4 GB por instancia).
- Moderacion o etiquetado de contenido visual en el borde: clasificacion y descripcion de imagenes en dispositivos remotos o con requisitos de privacidad, manteniendo los datos en local.
- Investigacion en cuantizacion ternaria: el repo sirve como banco de pruebas para comparar los tres layouts de kernel (PTQ1_0, PQ2_0, Q2_0) sobre los mismos pesos, midiendo el impacto del almacenamiento en velocidad sin variar la precision numerica del modelo.
- Decodificacion especulativa de bajo coste: el archivo PQ2_0-MTP y el drafter DFlash2 permiten experimentar con aceleracion de generacion en un modelo de 4B ya de por si muy comprimido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente publica tamanos de archivo y bits por peso: PTQ1_0 0,95 GB (~1,81 bits/peso), PQ2_0 1,15 GB (~2,18 bits/peso) y Q2_0 1,21 GB (~2,31 bits/peso) para el modelo de lenguaje, mas 0,37 GB (Q8_0) o 0,68 GB (BF16) para el proyector de vision. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones de calidad frente al modelo base en FP16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-1,6 GB combinando el modelo de lenguaje en PQ2_0 (1,15 GB) y el proyector de vision Q8_0 (0,37 GB). Con PTQ1_0 baja a ~1,3 GB; con Q2_0 sube a ~1,6 GB. Hay que anadir el cache KV de las 8 capas de atencion completa, cuyo tamano depende de la longitud de contexto configurada (los ejemplos de la model card usan `-c 32768`).
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria. El fork soporta CUDA y Metal; no se publican modelos concretos validados (A100, H100, RTX 4090, etc.), por lo que la idoneidad de cada tarjeta no esta documentada.
- Cabe en GPU de consumo: si, con amplio margen. Es compatible con RTX de gama de entrada, graficas integradas con memoria compartida y Apple Silicon via Metal.
- CPU: es un objetivo de despliegue explicito del proyecto; el modelo esta pensado para ejecutarse solo con CPU.
- Opciones de despliegue: `llama-cli` (texto), `llama-mtmd-cli` (imagen + texto), `llama-server` (API compatible con OpenAI) y, en general, el fork PrismML-Eng/llama.cpp en su rama `prism`. Upstream llama.cpp solo carga el archivo Q2_0 y rechaza PQ2_0 y PTQ1_0. La model card menciona que los parametros de muestreo son los mismos para todos los empaquetados y para MLX, pero no se listan archivos MLX en el repositorio.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens por segundo ni comparativas entre empaquetados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B (este modelo) | ~4,21B LM + ~0,33B vision | 262.144 tokens | GGUF ternario: 0,95 / 1,15 / 1,21 GB | Apache 2.0 | no disponibles |
| Qwen3.5-4B (modelo base, FP16) | ~4,21B | 262.144 tokens | safetensors FP16, ~8,4 GB segun la model card | no disponible en la informacion proporcionada | no disponibles |
| Otros VLM ternarios o de 2 bits de ~4B | no disponible | no disponible | no disponible | no disponible | no disponibles |

La comparativa se limita a lo declarado en la model card: el mismo modelo base en FP16 ocupa ~8,4 GB frente a 1,15 GB del empaquetado PQ2_0, una reduccion aproximada de 7,3x en huella de memoria. No hay datos publicados de calidad ni de velocidad que permitan comparar frente a cuantizaciones convencionales del mismo modelo base ni frente a alternativas multimodales de tamano similar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que no se puede estimar la degradacion de calidad frente al modelo base en FP16 ni frente a cuantizaciones de 4 o 8 bits.
- Discrepancia en el recuento de parametros: HuggingFace reporta 782.004.736 parametros en safetensors mientras la model card declara ~4,21B en el modelo de lenguaje mas ~0,33B en la torre de vision. Conviene verificar el dato antes de usarlo en documentacion tecnica.
- Compatibilidad limitada de runtime: solo el fork PrismML-Eng/llama.cpp ejecuta PTQ1_0, PQ2_0, MTP y DFlash2. Upstream llama.cpp unicamente acepta Q2_0. Esto ata el despliegue a un fork mantenido por el propio autor.
- Inestabilidad documentada del proyector BF16: la model card advierte de que el mmproj BF16 puede provocar caidas de `llama-server` cuando se procesan varias peticiones con imagen simultaneas; se recomienda Q8_0, con calidad casi identica.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue sin verificacion.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasas de alucinacion, y la cuantizacion ternaria agresiva es un factor de riesgo adicional no medido.
- Requisitos de memoria del contexto: aunque los pesos ocupan poco, usar los 262.144 tokens completos exige un cache KV considerable (el ejemplo de servidor de la model card se limita a `-c 32768`); el coste real depende del backend y de la configuracion.
- Ajuste de muestreo obligatorio: el modelo distingue modo thinking (temperatura 1.0, top_p 0.95, presence_penalty 1.0) y no-thinking (temperatura 0.7, top_p 0.80, presence_penalty 1.5), con penalizaciones aplicadas sobre los ultimos 64 tokens. Ignorar estos valores puede degradar notablemente la salida.
- Licencia: el repositorio declara Apache 2.0, pero al ser un derivado de Qwen/Qwen3.5-4B conviene comprobar las condiciones de licencia del modelo base antes de un uso comercial, ya que los pesos derivados pueden heredar restricciones.
- Soporte de tool calling, uso agentico y audio: no documentados, por lo que no deben darse por supuestos en produccion.
- Dos archivos del repositorio son mutuamente excluyentes: el archivo con MTP integrado sustituye al PQ2_0 normal y no se carga junto a el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Web de Prism ML: https://prismml.com
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con los kernels ternarios (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Binarios precompilados del fork: https://github.com/PrismML-Eng/llama.cpp/releases/latest
- Servidor de Discord del proyecto: https://discord.gg/prismml

Nota: los resultados de busqueda web obtenidos corresponden a proyectos homonimos sin relacion con este modelo (Prism de OpenAI, GraphPad Prism y Prism Launcher de Minecraft) y se han descartado por no ser relevantes. No se han encontrado papers ni blogs tecnicos asociados a Ternary-Bonsai-2-4B en la informacion disponible.
