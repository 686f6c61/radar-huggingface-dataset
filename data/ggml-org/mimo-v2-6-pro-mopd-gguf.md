# ggml-org/MiMo-V2.6-Pro-MOPD-GGUF

## Resumen

MiMo-V2.6-Pro-MOPD es un modelo multimodal desarrollado por Xiaomi (repositorio original `XiaomiMiMo/MiMo-V2.6-Pro-MOPD`) que acepta entradas de imagen, audio y texto y produce texto, tal como indica su pipeline `image-text-to-text`. La ficha que se analiza aquí es la conversión a formato GGUF publicada por `ggml-org`, el equipo responsable de llama.cpp, y está pensada para ejecutar el modelo con llama.app / llama.cpp sin depender de una API propietaria. Con 1.021.248.126.336 parámetros (~1,02 billones) según los pesos en safetensors, se sitúa en la categoría de modelos frontera de gran escala.

La relevancia de esta publicación es doble. Por un lado, permite desplegar un modelo de más de un billón de parámetros bajo licencia MIT en infraestructura propia. Por otro, incorpora mecanismos de decodificación especulativa (sidecars MTP en Q4_0 y Q8_0, más un drafter DFlash en BF16 y Q8_0) y un proyector multimodal Q8_0 que cubre codificadores de visión y de audio, lo que reduce la latencia de generación en un modelo de este tamaño.

No se dispone de información sobre longitud de contexto, idiomas soportados ni parámetros activos en la documentación proporcionada. La mención a «routed experts» en las notas de conversión confirma que la arquitectura subyacente es de mezcla de expertos (MoE).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y expertos enrutados; codificadores de visión y audio |
| Parametros totales | 1.021.248.126.336 (~1,02 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados en precisión nativa MXFP4); Q2_K (down projections de expertos en MXFP4, gate/up en Q2_K); sidecars MTP en Q4_0 y Q8_0; drafter DFlash en BF16 y Q8_0; mmproj en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base distribuye safetensors) |

## Arquitectura y entrenamiento

La conversión expone únicamente detalles estructurales indirectos: las notas mencionan «routed experts», lo que implica una arquitectura de mezcla de expertos con enrutado disperso, y el fichero `mmproj` en Q8_0 agrupa los codificadores de visión y de audio, confirmando una entrada multimodal nativa (imagen, audio y texto). El modelo base se distribuye en safetensors con 1.021.248.126.336 parámetros totales, aunque no se especifica cuántos permanecen activos por token.

El proceso de conversión a GGUF es automático mediante `ggml-org/convert`. La cuantización MXFP4 preserva los expertos enrutados en su precisión nativa, mientras que la variante Q2_K mantiene las down projections de los expertos en MXFP4 y cuantiza las proyecciones gate/up a Q2_K, calibradas con una imatrix externa. Se incluyen además cabezales de predicción multi-token (MTP) y un drafter DFlash para decodificación especulativa. No hay información disponible sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Comprensión de imágenes (pipeline `image-text-to-text`).
- Comprensión de audio, gracias al codificador de audio incluido en el mmproj Q8_0.
- Entrada combinada de imagen, audio y texto en una misma conversación.
- Decodificación especulativa mediante MTP (`--mtp`) y mediante el drafter DFlash, orientada a reducir la latencia de generación.
- Compatibilidad con endpoints (`endpoints_compatible`) para servir el modelo a través de infraestructura propia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede recibir una imagen de página y texto de apoyo para extraer campos estructurados, clasificar documentos o resumir contratos, aprovechando la entrada multimodal nativa.
- Transcripción y análisis de reuniones: el codificador de audio permite procesar grabaciones y generar actas, resúmenes o listas de tareas sin depender de un servicio externo de ASR.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo y descripciones detalladas en catálogos, archivos fotográficos o plataformas de contenido.
- Asistente conversacional autoalojado en empresa: al distribuirse bajo licencia MIT y en GGUF, puede desplegarse en infraestructura propia para atender consultas internas sin enviar datos a terceros.
- Moderación de contenido multimodal: combinación de imagen, audio y texto para clasificar material sensible en plataformas, con criterios configurables mediante prompt.
- Investigación en aceleración de inferencia: los sidecars MTP y DFlash permiten medir el impacto de la decodificación especulativa en un MoE de gran escala, comparando configuraciones de cuantización.
- Despliegue en entornos air-gapped: sectores con requisitos de confidencialidad (sanidad, defensa, banca) pueden ejecutar el modelo en clústeres aislados al no requerir conectividad con APIs externas.
- Análisis de vídeo o audio grabado con contexto visual: extracción de información de vídeos donde se combinan fotogramas y pistas de audio para generar informes o índices de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del número de parámetros y de los bits por peso típicos de cada cuantización; no proceden de la ficha del modelo.

- VRAM estimada solo para pesos: MXFP4 en torno a 510-540 GB; Q2_K en torno a 330-400 GB. Hay que añadir memoria para el contexto KV, el mmproj (Q8_0) y los sidecars de decodificación especulativa.
- GPU recomendadas: 8x H100 80 GB o 8x A100 80 GB para la variante MXFP4; 4x B200 192 GB o 4x MI300X 192 GB como alternativas de menor número de nodos.
- Consumer GPU: no cabe en ninguna GPU de consumo actual. Incluso la cuantización Q2_K exige varios aceleradores o descarga a memoria del sistema.
- Despliegue: llama.cpp y llama.app (`llama serve -hf ggml-org/MiMo-V2.6-Pro-MOPD-GGUF`). La decodificación especulativa se activa con `--mtp`. Otros motores como vLLM o TGI requerirían convertir los pesos a safetensors, ya que el repositorio solo publica GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de la columna de comparación provienen de fuentes públicas externas a esta ficha y deben verificarse antes de usarse en producción.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-MOPD (GGUF) | ~1,02 B | no disponible | no disponible | MIT | GGUF |
| Kimi K2 | ~1 B | ~32 mm | publico, ~128k | MIT modificada | safetensors / GGUF |
| DeepSeek-V3 | 671 mm | 37 mm | 128k | licencia propia de pesos | safetensors |
| Llama 3.1 405B | 405 mm | denso | 128k | licencia comunitaria Llama | safetensors |

Nota: en esta tabla «B» equivale a billones y «mm» a miles de millones. El rasgo diferencial de MiMo-V2.6-Pro-MOPD frente a los anteriores es la entrada multimodal conjunta de imagen y audio, además del empaquetado GGUF listo para llama.cpp.

## Limitaciones y advertencias

- La model card es mínima: no documenta sesgos, idiomas, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de error en tareas factuales, matemáticas o de código.
- La conversión es automática (`ggml-org/convert`); puede introducir pérdida de calidad respecto al modelo original, especialmente en la variante Q2_K.
- La cuantización Q2_K degrada las proyecciones gate/up de los expertos a 2 bits, lo que previsiblemente afecta a la calidad frente a MXFP4.
- Los requisitos de hardware son muy elevados: más de 300 GB solo en pesos para la cuantización más agresiva, lo que excluye su uso en estaciones de trabajo convencionales.
- El repositorio ocupa 1005,5 GB, por lo que la descarga y el almacenamiento exigen planificación previa.
- El modelo no declara soporte de tool calling ni razonamiento agéntico; no conviene asumirlo sin validación propia.
- La licencia MIT es permisiva y permite uso comercial, pero conviene revisar las condiciones del modelo base en `XiaomiMiMo/MiMo-V2.6-Pro-MOPD` por si añade cláusulas adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria acumulada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/MiMo-V2.6-Pro-MOPD-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Herramienta de conversión: https://github.com/ggml-org/convert
- Entorno de ejecución: https://llama.app
- Imatrix utilizada para calibrar Q2_K: https://huggingface.co/AesSedai/MiMo-V2.6-Pro-MOPD-GGUF
