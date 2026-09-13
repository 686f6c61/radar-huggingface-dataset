# ewin-reg/MiniCPM5-DocV-GGUF

## Resumen

MiniCPM5-DocV-GGUF es un repositorio de pesos cuantizados en formato GGUF para el modelo multimodal MiniCPM5-DocV, publicado por el usuario ewin-reg en HuggingFace. Se trata de una conversión orientada a inferencia local, no del modelo original: el repositorio contiene tres cuantizaciones del modelo de lenguaje y un proyector multimodal (`mmproj`) que es obligatorio para procesar imágenes. Su pipeline declarado es `image-text-to-text`, es decir, un modelo de visión-lenguaje (VLM) que recibe una imagen y un prompt de texto y devuelve texto.

El objetivo declarado es el análisis de documentos y gráficos en entornos de borde: la model card lo describe como un asistente de comprensión de documentos y charts de "alta resolución", con las etiquetas `docvqa`, `chartqa` y `anyres` que apuntan a resolución arbitraria de imagen. Los tamaños de archivo son reducidos (de 1,58 GB en Q4_K_M a 5,26 GB en F16), lo que lo sitúa en la categoría de modelos ejecutables en portátiles, Raspberry Pi 5 y dispositivos móviles.

Es relevante ahora porque permite desplegar un VLM de documentos completamente offline mediante llama.cpp u Ollama, sin GPU dedicada, con licencia Apache 2.0. Sin embargo, el repositorio no publica número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, y acumula 0 descargas y 0 likes, por lo que no existe validación independiente de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje (VLM) con proyector multimodal; arquitectura interna no disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0, F16 (más proyector multimodal en F16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + `mmproj-model-f16.gguf` para visión |
| Pipeline declarado | image-text-to-text |
| Modelo base | ewin-reg/MiniCPM5-DocV (relación `base_model:finetune`) |
| Tamaño de los pesos | Q4_K_M: ~1,58 GB; Q8_0: ~2,82 GB; F16: ~5,26 GB; mmproj: ~460 MB |
| Memoria requerida (RAM/VRAM) | ~2,5 GB (Q4_K_M), ~3,8 GB (Q8_0), ~6,5 GB (F16), más ~600 MB para el mmproj |
| Fecha de publicación | 13 de septiembre de 2026 según metadatos de HuggingFace (creación y última actualización con dos minutos de diferencia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniCPM5-DocV: ni el repositorio GGUF ni los metadatos indican si se trata de un transformer denso, un MoE o un híbrido, ni el número de parámetros del encoder visual o del decodificador de lenguaje. Lo único verificable es la presencia de un proyector multimodal separado (`mmproj-model-f16.gguf`, ~460 MB), patrón habitual en los VLM que alinean un encoder de imagen con un modelo de lenguaje mediante un adaptador entrenado aparte, y la etiqueta `anyres`, que sugiere procesamiento de imágenes a resolución nativa o variable en lugar de un redimensionado fijo.

Tampoco hay datos sobre el entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y qué proporción de datos corresponden a DocVQA o ChartQA pese a estar etiquetados. La model card únicamente recomienda `temperature 0.2` en la plantilla de Ollama y usa los tokens especiales `<|im_start|>` / `<|im_end|>` en el chat template, además de un prompt de sistema que define el modelo como asistente de comprensión de documentos y charts de alta resolución. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Comprensión de documentos: lectura de imágenes de documentos y extracción de campos concretos (la model card usa como ejemplo la transcripción del saldo total y el número de factura de una factura en PNG).
- Comprensión de gráficos: la etiqueta `chartqa` indica entrenamiento o evaluación orientados a preguntas sobre charts.
- Procesamiento a resolución arbitraria (`anyres`), pensado para documentos densos en texto donde el redimensionado agresivo degrada el OCR.
- Entrada imagen-texto y salida texto (`image-text-to-text`).
- Inferencia local en CPU y GPU mediante llama.cpp y Ollama.
- Ejecución en hardware de borde: la propia model card menciona Raspberry Pi 5, portátiles y móviles como destino de la cuantización Q4_K_M.
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras modalidades: no disponibles.

## Casos de uso

- Extracción de datos de facturas y albaranes: el modelo puede recibir la imagen de una factura y devolver el número de documento y el importe total, tal como plantea el ejemplo oficial de la model card. Es adecuado por su naturaleza de VLM de documentos y por el bajo consumo de la cuantización Q4_K_M (~2,5 GB), que permite ejecutarlo en el mismo servidor que el sistema de gestión.
- Digitalización de archivos históricos o escaneos en oficinas sin conexión: al ejecutarse con llama.cpp sobre CPU, se puede desplegar en un equipo aislado de la red y transcribir documentos sin enviar datos a terceros, lo que simplifica el cumplimiento de protección de datos.
- Análisis de informes financieros con gráficos: la etiqueta `chartqa` lo orienta a responder preguntas sobre series y ejes de charts, un caso típico en análisis de resultados trimestrales a partir de PDFs maquetados.
- Procesamiento en el borde para logística o inventario: con ~2,5 GB de RAM y la mención explícita a Raspberry Pi 5, se puede integrar en un dispositivo que fotografíe albaranes o etiquetas y extraiga los campos en el propio punto de captura.
- Clasificación y enrutado documental en back office: dado un lote de imágenes, usar el modelo para identificar el tipo de documento y extraer la referencia antes de dirigirlo al sistema correspondiente, reduciendo la intervención manual previa a la digitalización.
- Asistente local de consulta sobre documentación técnica: sobre un portátil sin GPU dedicada, con la cuantización Q8_0 (~3,8 GB) se puede mantener un asistente que responda a preguntas sobre capturas de pantalla, diagramas o esquemas incluidos en manuales.
- Verificación de formularios manuscritos o impresos en procesos de compliance: al ser un modelo local con licencia Apache 2.0, se puede auditar el flujo completo y justificar ante un auditor que ninguna imagen sale de la infraestructura.
- Control de calidad de maquetación: comparar el contenido extraído de una página renderizada con el texto esperado para detectar páginas corruptas o mal escaneadas en un pipeline de digitalización masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye cifras de DocVQA, ChartQA, MMLU, HumanEval ni de ningún otro conjunto de evaluación, ni comparaciones con modelos de la misma categoría. Tampoco se publican métricas de latencia o throughput (tokens/s) para ninguna de las cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~2,5 GB con Q4_K_M, ~3,8 GB con Q8_0 y ~6,5 GB con F16; hay que sumar ~600 MB del proyector multimodal `mmproj-model-f16.gguf` en todos los casos con entrada de imagen.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño de pesos, cualquier GPU con al menos 4 GB de VRAM puede alojar la cuantización Q4_K_M junto con el proyector.
- Viabilidad en GPU de consumo: sí, según los tamaños declarados. Una RTX 3060 de 12 GB o superior permite ejecutar incluso la variante F16 (~6,5 GB) con margen; una GPU de 6-8 GB cubre Q4_K_M y Q8_0.
- CPU y hardware de borde: la model card cita explícitamente portátiles, Raspberry Pi 5 y móviles para la cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (binario `llama-minicpmv-cli`, con los parámetros `-m`, `--mmproj`, `--image` y `-p`) y Ollama mediante un `Modelfile` con `FROM ./minicpm5-docv-q4_k_m.gguf` y `PARAMETER temperature 0.2`. La compatibilidad con vLLM o TGI no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible elaborar una comparativa rigurosa con la información disponible. El repositorio no publica el número de parámetros, la longitud de contexto ni resultados de benchmarks del modelo, de modo que cualquier comparación con alternativas de la misma categoría (otros VLM de documentos cuantizados a GGUF) carecería de base verificable. La tabla siguiente recoge únicamente los campos que sí están documentados:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-DocV-GGUF (este repositorio) | no disponible | no disponible | apache-2.0 | GGUF vía llama.cpp y Ollama |
| Alternativas de la misma categoría (VLM de documentos en GGUF) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés (`en`). No hay evidencia de soporte para castellano ni para otras lenguas, lo que limita su uso directo en documentación en español.
- Sesgos: no se documenta ninguna evaluación de sesgos ni la composición del dataset de entrenamiento, por lo que no se puede descartar sesgo procedente de los datos originales.
- Alucinación: es un riesgo inherente a los modelos de visión-lenguaje al transcribir documentos densos, tablas o cifras poco legibles. No se han publicado métricas de fidelidad de extracción, y el uso en facturas o formularios exige verificación posterior.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no se puede garantizar el procesamiento de documentos de varias páginas en una sola pasada.
- Resolución: aunque la etiqueta `anyres` apunta a resolución arbitraria, no se especifican los límites prácticos de resolución o número de tokens de imagen soportados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base MiniCPM5-DocV y confirmar que la conversión a GGUF respeta sus términos, dado que este repositorio es una publicación de terceros.
- Madurez: 0 descargas y 0 likes, con fecha de creación y actualización separadas por dos minutos, indican que el repositorio no ha sido validado por la comunidad y no hay informes independientes de calidad.
- Rendimiento: sin datos de latencia ni de throughput, no es posible dimensionar un despliegue en producción a partir de la información publicada.
- Búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo (los resultados obtenidos corresponden a listados de sucursales bancarias sin relación alguna con el repositorio), por lo que no hay fuentes externas que confirmen o amplíen las especificaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ewin-reg/MiniCPM5-DocV-GGUF
- Modelo base: https://huggingface.co/ewin-reg/MiniCPM5-DocV
- Paper, blog o repositorio oficial: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo.
