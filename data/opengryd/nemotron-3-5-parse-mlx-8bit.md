# OpenGryd/Nemotron-3.5-Parse-MLX-8bit

## Resumen

Nemotron-3.5-Parse es un modelo de parseo documental multimodal desarrollado originalmente por NVIDIA, distribuido aquí en una conversión a formato MLX de 8 bits publicada por OpenGryd. Combina un codificador visual C-RADIO con un decodificador basado en mBART bajo la arquitectura `RadioMBartPrefixForCausalLM`, lo que lo sitúa en la categoría de modelos visión-lenguaje especializados en extracción estructurada de información a partir de imágenes de documentos. Con 628.701.296 parámetros (aproximadamente 631M), es un modelo compacto pensado para despliegue en hardware Apple Silicon mediante el stack MLX.

La relevancia de esta publicación concreta reside en su formato: es una cuantización afín de 8 bits (grupo 64) aplicada únicamente al decodificador, manteniendo la torre de visión en bf16. Esto reduce el peso del repositorio a 1,1 GB, lo que facilita su ejecución en equipos con memoria unificada modesta. No obstante, se trata de un artefacto de decodificación base: el autor elimina explícitamente los tensores del proponente MTP de un token (`decoder.extra_heads.*`, `decoder.extra_proj.*`) y el modelo borrador `dflash2/`, por lo que esta build solo soporta decodificación greedy.

El modelo se publica bajo licencia OpenMDW-1.1, con el tokenizador bajo licencia MIT según la atribución del repositorio original. Es importante señalar que el repositorio no incluye pipeline declarado, idiomas soportados ni resultados de benchmarks propios; toda la información técnica procede de la model card del autor de la conversión y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `RadioMBartPrefixForCausalLM` (codificador visual C-RADIO + decodificador mBART-prefix) |
| Parametros totales | 628.701.296 (aproximadamente 631M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group 64 (solo decodificador); torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (tokenizador MIT) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de visión C-RADIO con un decodificador de tipo mBART con prefijo, empaquetados bajo la clase `RadioMBartPrefixForCausalLM`. El codificador visual procesa la imagen del documento y el decodificador genera la secuencia de parseo condicionada por ese prefijo visual. Esta configuración es típica de los modelos de parseo documental, donde la salida esperada es una representación estructurada (texto, tablas, campos) extraída de la imagen de entrada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de decodificación más allá de mencionar que la build publicada sirve exclusivamente decodificación greedy base (temperatura 0, top_k 1, repetition_penalty 1.1, tokens especiales preservados). Los tensores del proponente MTP de un token y el modelo borrador `dflash2/` del repositorio original no están incluidos, lo que descarta cualquier esquema de decodificación especulativa en esta conversión.

## Capacidades

- Parseo de documentos a partir de imágenes: extracción de contenido estructurado mediante el codificador visual C-RADIO y el decodificador mBART-prefix.
- Generación de texto condicionada por entrada visual (modelo visión-lenguaje).
- Decodificación greedy determinista: temperatura 0, top_k 1 y repetition_penalty 1.1, con preservación de tokens especiales.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y genera una representación estructurada de los campos, adecuado por su naturaleza de parseo visión-lenguaje y su tamaño compacto para procesamiento por lotes en local.
- Extracción de tablas de informes financieros: el codificador C-RADIO procesa la página y el decodificador mBART-prefix produce la secuencia estructurada correspondiente, lo que permite integrar el resultado en pipelines de análisis de datos.
- Procesamiento de formularios escaneados: al ser un modelo de parseo dedicado, puede convertir formularios en representaciones legibles por máquina sin necesidad de OCR separado más post-procesado.
- Automatización de archivo documental en Mac: la build MLX 8-bit con 1,1 GB de pesos permite ejecutar el parseo en equipos Apple Silicon con memoria unificada, útil para clasificar y extraer metadatos de grandes volúmenes de PDFs escaneados.
- Preprocesado para sistemas RAG: el parseo estructurado de documentos sirve como paso previo para indexar contenido en bases vectoriales, mejorando la calidad del texto extraído frente a OCR genérico.
- Validación de documentos en entornos con requisitos de privacidad: al ejecutarse localmente en MLX, evita enviar imágenes de documentos sensibles a servicios externos, lo que encaja en flujos con restricciones de confidencialidad.
- Prototipado rápido de pipelines de extracción: la decodificación greedy determinista facilita la reproducibilidad de resultados durante el desarrollo y las pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB de pesos en 8 bits para el decodificador, más la torre de visión en bf16; el consumo total de memoria unificada dependerá de la resolución de imagen y de la longitud de secuencia generada, dato no disponible.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (familias M1, M2, M3, M4); no se indica soporte para GPU NVIDIA o AMD en esta build.
- Compatibilidad con GPU consumer: sí, en equipos Apple Silicon con memoria unificada suficiente; no se especifica el mínimo exacto.
- Opciones de despliegue: mlx-vlm >= 0.7.12, que incluye el módulo `nemotron_parse_v3_5`; en versiones anteriores es necesario incorporar el módulo y el mapeo de arquitectura de 0.7.12 (el autor los incluye en su stack de serving).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Parse MLX 8-bit (este) | 628.701.296 | no disponible | safetensors MLX 8-bit | OpenMDW-1.1 | Solo decodificación greedy; sin MTP ni draft model |
| nvidia/Nemotron-3.5-Parse (upstream) | 631M (aprox.) | no disponible | PyTorch (referencia) | OpenMDW-1.1 | Incluye MTP y `dflash2/`; referencia de validación |
| Alternativas de parseo documental de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Esta build no incluye los tensores del proponente MTP de un token ni el modelo borrador `dflash2/`, por lo que no puede emplearse decodificación especulativa; solo admite decodificación greedy base.
- La decodificación está fijada a temperatura 0, top_k 1 y repetition_penalty 1.1; no se contemplan modos de muestreo alternativos en este artefacto.
- Requiere mlx-vlm >= 0.7.12 o la incorporación manual del módulo `nemotron_parse_v3_5` y su mapeo de arquitectura; versiones anteriores fallarán al cargar el modelo.
- La cuantización de 8 bits solo afecta al decodificador; la torre de visión permanece en bf16, lo que implica un consumo de memoria superior al que sugeriría el tamaño del repositorio.
- No se dispone de información sobre sesgos, tasas de alucinación, idiomas soportados ni limitaciones de contexto.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; el tokenizador se distribuye por separado bajo MIT según la atribución del repositorio fuente.
- El repositorio no declara pipeline ni idiomas, y no cuenta con descargas ni valoraciones que permitan inferir validación por parte de la comunidad.
- Al ser una conversión de terceros, la fidelidad respecto al modelo original está respaldada únicamente por la validación de salida greedy frente a la referencia PyTorch que menciona el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenGryd/Nemotron-3.5-Parse-MLX-8bit
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Documentación de la plataforma OpenGryd (validación de salida greedy): no disponible como URL directa en la información proporcionada
- Repositorio mlx-vlm: no disponible como URL directa en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
