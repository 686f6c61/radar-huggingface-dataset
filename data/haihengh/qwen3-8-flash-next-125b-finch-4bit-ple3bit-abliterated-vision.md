# haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-abliterated-vision

## Resumen

Este repositorio no es un checkpoint de Transformers, sino una instalación en formato `.finch` del modelo Qwen3.8-Flash-Next-125B (en su variante abliterated de `windowsxp811203`) para el motor de inferencia out-of-core FinchMoE, orientado a equipos Apple Silicon con memoria limitada. El autor, `haihengh`, ha reempaquetado los pesos con los expertos enrutados a 3 bits, el cuerpo de atención y expertos compartidos a 4 bits, las capas de atención lineal y el router a 8 bits, y ha añadido la torre visual del modelo original copiada byte a byte.

El modelo subyacente es un MoE de 125 B de parámetros totales que activa unos 6 B por token, con 48 capas y 512 expertos enrutados por capa, y se presenta como un avance de la arquitectura Qwen4. Esta variante concreta añade capacidad de imagen a texto (`image-text-to-text`) sobre el sibling de texto ya publicado por el mismo autor, de modo que el resultado ocupa 83,82 GiB en disco y requiere streaming desde SSD.

Su relevancia es doble: por un lado, permite ejecutar un MoE de 125 B en hardware de consumo Apple mediante cuantización agresiva y carga por capas; por otro, sirve como material de estudio sobre cuantización extrema (3 bits en expertos) y sobre modelos desalineados deliberadamente (abliterated). No hay métricas publicadas para esta variante concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención híbrida GDN + QSA (arquitectura Qwen3.8-Flash-Next, avance de Qwen4); 48 capas, 512 expertos enrutados por capa |
| Parámetros totales | 125 B (cifra del nombre del modelo y de la documentación pública de Qwen; el repack no declara recuento exacto) |
| Parámetros activos | ~6 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados 3 bits afín (grupo 64, escalas y sesgos BF16); atención y expertos compartidos 4 bits; atención lineal y router 8 bits; tabla PLE int4 grupo 32; torre visual BF16 |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-license-1.0` (etiquetada como `license: other`) |
| Formato de pesos | `.finch` (manifest.json + model_weights.bin + packed_experts/layer_XX.bin + tokenizer/ + vision/); torre visual en `vision/vision.safetensors` (BF16) |

Datos del artefacto declarados en el manifest:

| Métrica | Valor |
|---|---|
| Bytes totales declarados | 90.002.502.569 (83,82 GiB) |
| Pesos residentes | 3.877.265.688 bytes (3,61 GiB) |
| Pool de expertos | 53.150.220.288 bytes (49,50 GiB) |
| Expertos por capa / capas | 512 / 48 |
| Stride por experto | 2.162.688 bytes |
| Tokenizer | 22.916.963 bytes |
| Carga visual | 897.904.664 bytes (856,3 MiB, 333 tensores BF16) |
| SHA-256 del manifest | `1266b1bb25e9b471139586bf3bfb60912f54513eb382792c31be08fd9852617d` |
| Snapshot de origen | `sha256:99e815241ef03325536b0aaa4441deea45174c17fae31e10f0bb456410c590de` |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8-Flash-Next: un transformer disperso con 48 capas y 512 expertos enrutados por capa, que según el repositorio oficial de QwenLM introduce mejoras en cuatro frentes (atención, residual, embedding y optimización) y emplea una atención híbrida GDN + QSA. La receta de cuantización de este repack confirma la presencia de capas de atención lineal diferenciadas del resto, coherente con ese diseño híbrido. Las fuentes secundarias consultadas atribuyen al modelo 51 B de parámetros de embedding n-gram y una cabeza de predicción multi-token de 4 B, además de los 6 B activos por token.

Sobre el entrenamiento no hay información en los materiales disponibles: no se especifican tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí está documentado es la cadena de transformaciones: el modelo original fue sometido a abliteration por `windowsxp811203` (eliminación de la dirección de rechazo en el espacio de activaciones, presumiblemente), y después `haihengh` lo reempaquetó el 2026-10-28 con `FinchMoERepack --routed-expert-bits 3 --include-vision`. La innovación técnica de este repositorio no está en el modelo, sino en el contenedor: un formato que separa pesos residentes (atención, router, expertos compartidos, embeddings) del pool de expertos, permitiendo mapear en memoria solo lo necesario y hacer streaming del resto desde SSD. La torre visual se mapea únicamente mientras se codifica una imagen.

## Capacidades

- Generación de texto y razonamiento en un MoE de 125 B con 6 B activos, heredado del checkpoint base.
- Comprensión de imagen a texto: pipeline `image-text-to-text` con torre visual BF16 de 856,3 MiB, configuración y preprocesadores de imagen y vídeo incluidos en `vision/`.
- Procesamiento de vídeo: el paquete incluye `video_preprocessor_config.json`, lo que sugiere soporte de entrada de vídeo en el runtime visual (no confirmado con ejemplos).
- Plantilla de chat incluida en `tokenizer/` (chat template), lo que habilita conversación multi-turno formateada.
- Capacidad de código: el modelo base reporta 62,5 en SWE-bench Pro según fuentes secundarias; esta variante cuantizada no ha sido medida.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente para esta variante.
- Multilingüismo: no disponible; la model card no declara idiomas.
- Modo thinking: no disponible.
- Comportamiento sin alineamiento: la abliteration elimina los mecanismos de rechazo del modelo base, lo que cambia radicalmente el perfil de respuestas.

## Casos de uso

- Asistente visual local en Mac: analizar capturas de pantalla, fotos o diagramas y responder sobre ellos sin enviar datos a la nube, aprovechando que el modelo corre íntegramente en el equipo mediante streaming desde SSD.
- Digitalización de documentos en entorno offline: pasar facturas, albaranes o formularios escaneados al modelo con la torre visual y obtener campos estructurados, útil en despachos con requisitos de confidencialidad.
- Prototipado de apps iOS con inferencia local: el runtime FinchMoE tiene apps para Mac/iOS, de modo que se puede validar una experiencia de asistente multimodal embebido antes de decidir una arquitectura definitiva.
- Investigación en cuantización extrema: banco de pruebas para medir la degradación de calidad al bajar los expertos enrutados a 3 bits frente al sibling de texto idéntico y frente al BF16 original.
- Red teaming y evaluación de seguridad: al ser una variante abliterated, sirve para estudiar qué comportamientos reaparecen tras eliminar la alineación y para calibrar clasificadores de salida.
- Automatización de tareas de código en local: el modelo base declara 62,5 en SWE-bench Pro, por lo que un flujo de revisión o generación de parches asistida cabe en un portátil Apple Silicon, siempre que se acepte la pérdida de precisión del 3 bits.
- Docencia y demostraciones de arquitecturas MoE: el formato `.finch` expone explícitamente el desglose entre pesos residentes y pool de expertos, lo que facilita explicar el enrutamiento disperso con cifras reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante. La propia model card indica que "this variant is not separately measured" y remite al sibling de texto para calidad y throughput.

Los únicos datos numéricos disponibles corresponden al modelo base sin cuantizar, según fuentes secundarias:

| Benchmark | Qwen3.8-Flash-Next (base) | Claude-Opus-4.6 (Max) |
|---|---|---|
| SWE-bench Pro | 62,5 | 53,4 |

Estos valores no son trasladables a este repack de 3 bits y deben tomarse solo como referencia del techo de capacidad del modelo original.

## Requisitos de hardware

- Espacio en disco: 83,82 GiB libres como mínimo para el directorio `.finch` completo, en un SSD interno rápido; el pool de expertos (49,50 GiB) se lee por streaming y la latencia depende directamente del ancho de banda del almacenamiento.
- Memoria: la model card no especifica un mínimo. El manifest declara 3,61 GiB de pesos residentes, a los que hay que sumar caché KV, buffers de atención y el espacio de trabajo del runtime; la torre visual añade 856,3 MiB mapeados solo durante la codificación de imagen.
- GPU: el motor está diseñado para Apple Silicon (apps Mac/iOS) con memoria unificada. No hay soporte documentado para CUDA, ROCm ni GPUs discretas.
- ¿Cabe en hardware de consumo? Sí, en Macs con Apple Silicon y SSD interno suficientemente amplio; el límite práctico es el espacio en disco y la RAM disponible, no la VRAM.
- Despliegue: exclusivamente mediante `FinchMoECLI` o las apps Mac/iOS de FinchMoE. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles para esta variante; deben consultarse en la ficha del sibling de texto.

Ejemplo de invocación documentado:

```bash
FinchMoECLI --model /path/to/Qwen3.8-Flash-Next-abliterated-ple3bit-vision.finch \
            --messages-file messages.json --max-new 128
```

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Expertos | Visión | Formato | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (`...ple3bit-abliterated-vision`) | 125 B (6 B activos) | no disponible | 3 bits | Sí | `.finch` | qwen-community-license-1.0 |
| `haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-abliterated` | 125 B (6 B activos) | no disponible | 3 bits | No | `.finch` | qwen-community-license-1.0 |
| `haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit` | 125 B (6 B activos) | no disponible | 2 bits | No | `.finch` | qwen-community-license-1.0 |
| `windowsxp811203/Qwen3.8-Flash-Next-Abliterated` (BF16) | 125 B (6 B activos) | no disponible | BF16 | No | safetensors | no disponible |
| Qwen3.8-Flash-Next-125B original | 125 B (6 B activos) | no disponible | BF16 | No | safetensors | qwen-community-license-1.0 |

La diferencia frente a los hermanos de texto es únicamente la presencia de la torre visual; el resto de bytes de texto son la misma receta. El hermano de 2 bits reduce el pool de expertos a aproximadamente la mitad, a costa de una pérdida de calidad no medida.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente la alineación de seguridad del checkpoint original, por lo que puede producir contenido que el modelo base rechazaría. No es apto para exposiciones directas a usuarios finales sin filtros adicionales.
- Cuantización de 3 bits en los expertos enrutados: no hay ninguna medición publicada de la degradación respecto al BF16 ni al sibling de 4 bits; la caída de calidad en tareas de razonamiento y código puede ser significativa y no está cuantificada.
- Riesgo de alucinación: inherente a un modelo de 125 B con 6 B activos, agravado por la cuantización agresiva y sin evaluaciones que lo acoten.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano sin evaluarlo.
- Contexto desconocido: la longitud de ventana no figura en la documentación, lo que impide planificar cargas de contexto largo.
- Licencia: `qwen-community-license-1.0`, etiquetada como `other` en HuggingFace; es una obra derivada de Qwen y las condiciones de uso comercial deben verificarse en el fichero `LICENSE` antes de cualquier despliegue en producción.
- Dependencia total del runtime FinchMoE: no hay ruta de ejecución alternativa con las herramientas estándar del ecosistema; si el proyecto upstream deja de mantenerse, el artefacto queda inutilizable.
- Madurez nula: 0 descargas y 0 likes en el momento del análisis, sin validación independiente más allá del recibo `verified-install.json` generado por el propio autor.
- La app de Mac/iOS requiere una fila de modelo con capacidad visual; una fila solo de texto rechazará el directorio `vision/` en lugar de ignorarlo.
- Riesgo de integridad: conviene reverificar cada fichero contra `manifest.json` tras la descarga, ya que el recibo incluido lo genera la misma herramienta que empaquetó los pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-abliterated-vision
- Modelo base (abliterated): https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated
- Sibling de texto (misma receta, sin visión): https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-abliterated
- Sibling con expertos a 2 bits: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit
- Sibling de 2 bits con visión: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple2bit-abliterated-vision
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Ficha del modelo en Blog Network (incluye dato de SWE-bench Pro): https://blog.toolsnetwork.ai/releases/qwen-3-8-flash-next/
- Ficha del modelo en AI/TLDR (desglose de parámetros): https://ai-tldr.dev/releases/qwen-3-8-flash-next/
- Licencia: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-abliterated-vision/blob/main/LICENSE
