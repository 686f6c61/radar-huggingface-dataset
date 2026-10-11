# BasinShapers/flux2-klein-4b-webgpu

## Resumen

`BasinShapers/flux2-klein-4b-webgpu` es un paquete de pesos cuantizados del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, preparado para ejecutar text-to-image íntegramente en el navegador mediante WebGPU. No es un modelo nuevo ni un fine-tuning: es una conversión de formato y precisión del modelo base, con los pesos reorganizados en ficheros por bloque, fusiones de proyecciones y un codificador de texto truncado a las capas que el pipeline realmente consume. El objetivo es eliminar el cómputo en servidor: la página descarga unos 3,2 GB una sola vez, los cachea y genera en la GPU del visitante.

El paquete lo publica la organización BasinShapers y se apoya en Kaminos, un kit de inferencia WebGPU cuyo repositorio mantiene `lyonsno`. Incluye tres niveles de calidad intercambiables en caliente: `dit/` (int4, etiquetado "Mint"), `dit-q3/` (3 bits, "Weathered") y `dit-q2/` (2 bits, "Off the Rails"), compartiendo entre ellos codificador de texto, decodificador VAE y tokenizador. La cuantización es solo de pesos: activaciones y stream residual permanecen en coma flotante.

Es relevante porque demuestra un caso práctico de despliegue de un modelo de difusión de 4B en hardware de consumo sin servidor: en Chrome, una imagen de 512 × 512 a 4 pasos tarda 6-7 segundos en un Apple M4 Max y unos 20 segundos en un Apple M2 Pro de 16 GB, con soporte para 768 y 1024 píxeles liberando la memoria de trabajo de cada etapa antes de la siguiente. La licencia es Apache 2.0, la misma del modelo original, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified-flow) para text-to-image; codificador de texto Qwen3-4B y decodificador VAE |
| Parámetros totales | 4B en el transformer de difusión; codificador de texto Qwen3-4B aparte (el repo no declara el recuento exacto de parámetros de este paquete) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 group 128 affine (lineales de bloque del transformer); int4 group 64 affine (embedders, modulación y proyecciones de salida); 3 bits group 64 ("Weathered"); 2 bits group 64 ("Off the Rails"); f16 en normas, VAE y tabla de embeddings. Cuantización weight-only |
| Idiomas soportados | no disponible (el prompt se procesa con un tokenizador Qwen2 byte-level BPE) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios propios del kit Kaminos, con `manifest.json` por carpeta (forma, formato, offset en bytes y SHA-256 de cada fichero) y copias `.gz`; no hay safetensors ni GGUF |

Desglose de componentes y tamanos declarados:

| Carpeta | Componente | Formato | Tamano |
|---|---|---|---|
| `te/` | Codificador de texto Qwen3-4B, capas 0-26 | int4, grupo 128, affine; normas f16 | 1,45 GB |
| `te/te-embed.bin` | Tabla de embeddings de tokens, leída fila a fila por HTTP range requests | f16 | 0,78 GB |
| `te/tokenizer.json` | Tokenizador Qwen2 byte-level BPE | JSON | 11 MB |
| `dit/` | Transformer de flujo rectificado ("Mint") | lineales de bloque int4 grupo 128; embedders, modulación y salida int4 grupo 64; normas f16 | 2,07 GB |
| `vae/` | Decodificador VAE y estadísticas de batch-norm latentes | f16; estadísticas f32 | 0,1 GB |
| `dit-q3/` | Transformer, nivel "Weathered" | lineales de bloque 3 bits (grupo 64, rango por grupo elegido para minimizar error cuadrático) | 1,64 GB (solo gzip) |
| `dit-q2/` | Transformer, nivel "Off the Rails" | lineales de bloque 2 bits (grupo 64) | 1,16 GB (solo gzip) |

Tamano total del repositorio: 17,5 GB. La página descarga aproximadamente 3,2 GB en la primera visita (versiones gzip de todo excepto la tabla de embeddings).

## Arquitectura y entrenamiento

El modelo base, FLUX.2 [klein] 4B de Black Forest Labs, es un transformer de flujo rectificado para generación de imágenes a partir de texto, con un codificador de texto Qwen3-4B y un decodificador VAE. Este repositorio no entrena nada: parte de esos pesos y aplica exclusivamente transformaciones de empaquetado e inferencia. El codificador de texto se trunca a las capas 0-26 porque el pipeline de FLUX.2 [klein] solo lee los estados ocultos 9, 18 y 27; también se fusionan las proyecciones que comparten entrada (por ejemplo query, key y value) y se reordenan los pesos de convolución 3×3 del VAE para ejecución en formato channels-last.

La cuantización es de solo pesos, con activaciones y stream residual en coma flotante, y esquemas distintos según el tipo de tensor: grupo 128 affine para los lineales de bloque del transformer, grupo 64 para embedders, modulación y proyecciones de salida, y f16 para las normas. Los niveles de 3 y 2 bits usan grupo 64 con el rango por grupo elegido para minimizar el error cuadrático, y sus códigos se empaquetan 32 por cada tres palabras de 32 bits (3 bits) o 16 por palabra (2 bits). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponderían a la model card del modelo base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) ejecutada íntegramente en el navegador mediante WebGPU, sin cómputo en servidor.
- Resoluciones seleccionables de 512, 768 y 1024 píxeles desde la propia página.
- Muestreo en pocos pasos: la referencia de latencia indicada es de 4 pasos para 512 × 512.
- Tres niveles de calidad intercambiables en caliente mediante un selector de "jank level": int4 (`dit/`, "Mint"), 3 bits (`dit-q3/`, "Weathered") y 2 bits (`dit-q2/`, "Off the Rails"), compartiendo codificador de texto, VAE y tokenizador.
- Gestión de memoria por etapas: libera la memoria de trabajo de cada fase antes de empezar la siguiente, lo que permite generar a 1024 × 1024 en un Mac de 16 GB sin recurrir a swap.
- Carga selectiva de embeddings mediante HTTP range requests: solo descarga las filas de la tabla de embeddings que el prompt utiliza.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking". Es un modelo de generación de imágenes, no un modelo de lenguaje conversacional.

## Casos de uso

- Demos públicas sin coste de GPU: cualquier web puede ofrecer generación de imágenes apoyándose únicamente en la GPU del visitante, con una descarga inicial de unos 3,2 GB cacheada después, lo que elimina el gasto de inferencia en servidor para tráfico alto.
- Aplicaciones de privacidad estricta: al no enviar el prompt ni la imagen a ningún servidor, encaja en flujos donde el contenido no puede salir del dispositivo (material médico, legal o interno de una empresa).
- Prototipado rápido de prompts: el selector de nivel de cuantización permite iterar sobre formulaciones de prompt con el nivel de 2 bits, mucho más ligero, y validar la composición final con el nivel int4 sin cambiar de herramienta.
- Aplicaciones de escritorio empaquetadas con WebView: al ser un kit de inferencia WebGPU, se puede integrar en apps Electron o Tauri que ya usan un motor Chromium y reutilizar la caché del navegador.
- Uso en equipos sin GPU dedicada: los equipos Apple Silicon de 16 GB son un objetivo explícito (M2 Pro genera a 512 × 512 en unos 20 segundos), lo que cubre portátiles de trabajo convencionales.
- Generación en entornos sin conectividad estable o con ancho de banda limitado: tras la primera descarga y el cacheo, la generación es local y no depende de la red.
- Investigación sobre cuantización extrema: los niveles de 3 y 2 bits con grupo 64 y rango optimizado por grupo son un banco de pruebas reproducible para medir el degradado de calidad a 3 y 2 bits en modelos de difusión.
- Despliegue de bajo coste en prototipos y herramientas internas: al ser Apache 2.0 y no requerir infraestructura, sirve para herramientas internas de generación de recursos gráficos sin aprovisionar GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIPScore, GenEval, etc.) en la información disponible. Los únicos datos cuantitativos publicados son de latencia de inferencia en navegador, que no son una medida de calidad:

| Escenario | Hardware | Resolución y pasos | Tiempo |
|---|---|---|---|
| Generación en Chrome (WebGPU) | Apple M4 Max | 512 × 512, 4 pasos | 6-7 s |
| Generación en Chrome (WebGPU) | Apple M2 Pro, 16 GB | 512 × 512, 4 pasos | ~20 s |
| Generación a resolución alta | Apple con 16 GB | 1024 × 1024 | posible sin swap, tiempo no disponible |

## Requisitos de hardware

- Descarga inicial: ~3,2 GB (copias gzip) en la primera visita; el repositorio completo, con los tres niveles de cuantización, ocupa 17,5 GB.
- Huella de pesos por nivel: nivel int4 (`dit/`, 2,07 GB) + codificador de texto (1,45 GB) + tabla de embeddings (0,78 GB) + VAE (0,1 GB); niveles de 3 bits (1,64 GB) y 2 bits (1,16 GB) sustituyen al transformer y comparten el resto.
- Memoria: se indica generación a 1024 × 1024 en una máquina Apple de 16 GB de memoria unificada sin recurrir a swap, gracias a la liberación de memoria por etapas.
- GPU validadas en la documentación: Apple M4 Max y Apple M2 Pro de 16 GB. No se listan GPU discretas (A100, H100, RTX 4090, etc.) ni requisitos de VRAM para ellas; no disponible.
- Cabe en hardware de consumo: sí, el objetivo declarado es Apple Silicon de 16 GB en adelante y cualquier GPU con soporte WebGPU suficiente; el conjunto concreto de GPU discretas compatibles no está documentado.
- Opciones de despliegue: el kit de inferencia Kaminos sobre WebGPU en el navegador (Chrome y otros motores Chromium). No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni diffusers con estos pesos; el formato de pesos es propio del kit.
- Latencia y throughput: 6-7 s por imagen de 512 × 512 a 4 pasos en M4 Max y ~20 s en M2 Pro de 16 GB. No se publican cifras de throughput agregado (imágenes por segundo) ni de latencia a 768 o 1024.
- Requisito de servidor: el servidor solo debe servir ficheros estáticos y soportar peticiones HTTP range para la tabla de embeddings.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato y precisión | Ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BasinShapers/flux2-klein-4b-webgpu` (este repo) | 4B (difusión) + Qwen3-4B (texto) | Binarios Kaminos; int4, 3 bits y 2 bits; activaciones en FP | Navegador con WebGPU, sin servidor | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `black-forest-labs/FLUX.2-klein-4B` (modelo base) | 4B (difusión) + Qwen3-4B (texto) | Pesos originales; precisión no disponible en la información consultada | GPU con frameworks de difusión habituales | Apache 2.0 | HuggingFace, mantenido por Black Forest Labs |
| Alternativas de generación de imagen en navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de terceros comparables en la información proporcionada, por lo que no se puede establecer una comparación de calidad frente a otros modelos de difusión de tamano similar.

## Limitaciones y advertencias

- Degradación por cuantización: el propio autor describe el nivel de 3 bits ("Weathered") como visualmente similar al int4 y el de 2 bits ("Off the Rails") como "borroso y derretido, aunque reconocible". El nivel de 2 bits no es apto para producción con requisitos de calidad.
- La cuantización es solo de pesos; las activaciones y el stream residual se mantienen en coma flotante, por lo que el ahorro de memoria no es tan agresivo como en una cuantización completa.
- Descarga inicial de ~3,2 GB: inviable para usuarios con conexiones lentas o con políticas de caché restringidas; el beneficio aparece solo a partir de la segunda generación.
- Dependencia de WebGPU y de un navegador compatible: sin soporte WebGPU no hay inferencia. No se documentan alternativas de despliegue en servidor para estos pesos.
- Dependencia de HTTP range requests para la tabla de embeddings: un servidor estático que no soporte peticiones parciales puede romper la carga selectiva de filas.
- El codificador de texto está truncado a las capas 0-26: cualquier uso de los pesos `te/` fuera del pipeline previsto de FLUX.2 [klein] produciría resultados incorrectos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad prompt-imagen, manejo de texto dentro de la imagen ni sesgos demográficos para este paquete; los sesgos heredados del modelo base y de su dataset de entrenamiento no están caracterizados en la información disponible.
- Idiomas soportados: no disponibles. No se documenta el comportamiento multilingüe del codificador de texto aplicado a prompts en castellano.
- Adopción prácticamente nula: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación en octubre de 2026; no hay evidencia de uso en producción.
- Licencia: Apache 2.0, igual que el modelo original, lo que permite uso comercial. El codificador de texto Qwen3-4B es también Apache 2.0 según la model card. Conviene verificar los términos de FLUX.2 [klein] 4B en su repositorio original antes de un despliegue comercial, ya que esta ficha se basa en lo declarado por el autor del paquete.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BasinShapers/flux2-klein-4b-webgpu
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Codificador de texto (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B (referencia indicada en la model card como "Qwen3-4B by the Qwen team")
- Kit de inferencia Kaminos: https://github.com/lyonsno/kaminos
- Código del modelo dentro de Kaminos: https://github.com/lyonsno/kaminos/tree/main/models/flux2-klein
- Demo en navegador: https://lyonsno.github.io/kaminos/inference-kit/klein/
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan ninguna relación con este modelo ni con generación de imágenes, por lo que no se han utilizado como fuente.
