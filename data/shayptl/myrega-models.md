# shayptl/myrega-models

## Resumen

`shayptl/myrega-models` es un repositorio de artefactos ONNX que la aplicación de código abierto de gestión de fotos **myRega** ("הרגע שלי", "mi momento" en hebreo) descarga una sola vez durante su instalación. No se trata de un modelo único, sino de un paquete de dos componentes: `hebrew-clip-v1`, un codificador CLIP bilingüe hebreo/inglés para búsqueda de imágenes por descripción textual, y `faces-v2`, un detector de rostros ligero de Qualcomm AI Hub.

El componente principal, `hebrew-clip-v1` (release 1.1.0), combina una torre de texto con cuantización consciente de 4 bits (68,6 MB) y una torre de imagen basada en SigLIP2-B/16-224 con cuantización de 8 bits. Su función es habilitar búsqueda semántica en lenguaje natural sobre bibliotecas fotográficas personales, con soporte específico para hebreo, un idioma escasamente cubierto por los modelos CLIP convencionales.

El repositorio es relevante por su enfoque de distribución: los archivos se verifican contra sumas SHA-256 fijas y se anclan a un commit concreto, de modo que la instalación deja de depender del repositorio tras la descarga inicial. El tamaño total del repo es de 0,2 GB y la licencia es dual (Apache-2.0 para el CLIP hebreo, BSD-3-Clause para el detector de Qualcomm).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (torre de texto + torre de imagen SigLIP2-B/16-224) y detector de rostros CNN ligero (face_det_lite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (torre de texto, quantization-aware), 8-bit (torre de imagen) |
| Idiomas soportados | hebreo (he), ingles (en) |
| Licencia | Apache-2.0 (hebrew-clip-v1) y BSD-3-Clause (face_det_lite); declarada como "apache-2.0-and-bsd-3-clause" |
| Formato de pesos | ONNX (`text/model.onnx`, `vision/model.onnx`, `face_det_lite.onnx`) |

## Arquitectura y entrenamiento

`hebrew-clip-v1` sigue la arquitectura CLIP de dos torres: una torre de texto que proyecta consultas en hebreo e inglés a un espacio latente compartido con una torre de imagen basada en SigLIP2-B/16-224 (parche de 16 px, resolución 224 px). La torre de texto emplea cuantización consciente de 4 bits (68,6 MB), mientras que la torre de imagen usa cuantización de 8 bits. El paquete incluye tokenizador y ficheros de configuración. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

`faces-v2` integra `face_det_lite` de Qualcomm AI Hub (versión v0.65.0), un detector de rostros ligero fusionado en un único archivo ONNX. El reconocimiento facial propiamente dicho no se aloja en este repositorio: myRega obtiene el reconocedor SFace directamente desde `opencv/face_recognition_sface` en OpenCV Zoo. La innovación destacable es operativa más que algorítmica: distribución verificada por SHA-256, anclaje a commit y estructura `/<model>/<path>` con `MODELS_SOURCE` apuntando a una URL resuelta por commit.

## Capacidades

- Búsqueda de imágenes por descripción en lenguaje natural, en hebreo e inglés (por ejemplo, "ים בשקיעה" o "dog on the beach").
- Representación conjunta texto-imagen mediante embeddings CLIP comparables por similitud.
- Detección de rostros en imágenes mediante `face_det_lite`.
- Integración con reconocimiento facial externo (SFace de OpenCV Zoo) para identificación de personas.
- Ejecución en formato ONNX, apta para inferencia en entornos locales y dispositivos sin GPU dedicada.
- Soporte bilingüe hebreo/inglés en la torre de texto.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes.

## Casos de uso

- Búsqueda semántica en bibliotecas fotográficas personales: el usuario escribe "playa al atardecer" o "ים בשקיעה" y el sistema recupera imágenes por similitud de embeddings, sin depender de metadatos ni etiquetas manuales.
- Organización automática de álbumes por contenido: agrupación de fotos por escenas, objetos o temas detectados a partir de los embeddings de la torre de imagen.
- Indexación local con privacidad: al ejecutarse como ONNX en la instalación del usuario, las fotos no salen del dispositivo, lo que resulta adecuado para bibliotecas privadas.
- Detección y agrupación de rostros: `face_det_lite` localiza caras y, combinado con SFace, permite agrupar fotos por persona para su revisión y etiquetado.
- Aplicaciones de escritorio o móviles de gestión fotográfica: el tamaño reducido (0,2 GB) y la cuantización 4/8 bits permiten empaquetar el modelo en instalaciones de consumo.
- Distribución reproducible de modelos en aplicaciones: el esquema de checksums SHA-256 y anclaje a commit sirve como patrón para empaquetar artefactos de IA en software de escritorio con garantías de integridad.
- Búsqueda multilingüe en comunidades hebreoparlantes: cubre un hueco que los CLIP estándar (centrados en inglés) no resuelven bien.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de los artefactos (torre de texto 68,6 MB en 4 bits, torre de imagen SigLIP2-B/16-224 en 8 bits), la huella es reducida y compatible con CPU.
- GPU recomendadas: no disponible; el formato ONNX permite ejecución en CPU y en GPU de gama consumer, pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño de los modelos, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| shayptl/myrega-models (hebrew-clip-v1) | CLIP bilingüe hebreo/inglés + detector | he, en | no disponible | Apache-2.0 + BSD-3-Clause | ONNX |
| CLIP original (OpenAI) | CLIP texto-imagen | principalmente en | 77 tokens (estándar) | MIT | PyTorch, ONNX |
| SigLIP2 (Google) | CLIP texto-imagen | multilingüe | no disponible | Apache-2.0 (variantes) | PyTorch, ONNX |
| OpenCV Zoo SFace | Reconocimiento facial | no aplica | no aplica | Apache-2.0 | ONNX |

La comparación con CLIP original y SigLIP2 es aproximada: no se dispone de métricas de rendimiento del modelo de myRega para contrastar calidad de recuperación. Su ventaja diferencial es el soporte nativo de hebreo y su empaquetado orientado a aplicaciones de escritorio.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo cubre búsqueda texto-imagen y detección de rostros; no genera texto ni razona.
- Idiomas limitados a hebreo e inglés; el rendimiento en otros idiomas no está documentado.
- No se publican métricas de calidad de recuperación (recall@k, mAP) ni de detección facial, por lo que la evaluación objetiva no es posible con la información disponible.
- La licencia es dual y depende del componente: Apache-2.0 para `hebrew-clip-v1` (Copyright 2026 Shay Patael) y BSD-3-Clause para `face_det_lite` (Qualcomm). Es necesario revisar `LICENSE.md`, `NOTICE` y `PROVENANCE.md` antes de uso comercial.
- El reconocedor facial SFace no se aloja en este repositorio; su disponibilidad y licencia dependen de OpenCV Zoo.
- El repositorio está pensado como origen de descarga verificado, no como biblioteca de modelos para uso directo; su consumo está acoplado a la aplicación myRega.
- Riesgo de sesgo en la detección facial y en los embeddings de imagen no evaluado en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia de adopción ni de mantenimiento continuado más allá de la fecha de actualización indicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shayptl/myrega-models
- OpenCV Zoo SFace (reconocedor facial externo): https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface
- Qualcomm AI Hub (origen de face_det_lite): https://aihub.qualcomm.com/
- SigLIP2 (arquitectura de la torre de imagen): no disponible enlace directo en la información proporcionada
- Paper de CLIP (arquitectura base): no disponible enlace directo en la información proporcionada
