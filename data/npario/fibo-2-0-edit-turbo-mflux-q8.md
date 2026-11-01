# npario/fibo-2-0-edit-turbo-mflux-q8

## Resumen

Fibo-2.0-edit-turbo-mflux-q8 es una conversión comunitaria del modelo de difusión para edición de imágenes briaai/Fibo-2.0-edit-turbo al formato MLX, cuantizada a 8 bits mediante MFlux. No se trata de un modelo nuevo ni de un entrenamiento adicional: los pesos originales se han convertido a MLX y cuantizado con cuantización afín de 8 bits aplicada al text encoder, al transformer y al VAE. El objetivo es permitir la inferencia local de un modelo de edición de imágenes de gran tamaño en Apple Silicon, donde el formato original (BF16, 25,1 GB) resulta inmanejable en la mayoría de equipos.

El modelo base, desarrollado por BRIA AI, pertenece a la familia Fibo-2.0 orientada a edición de imágenes guiada por texto (text-to-image con capacidad de edición). La versión "turbo" sugiere un régimen de pocos pasos de inferencia, aunque la model card no detalla el número exacto. La conversión la firma npario bajo la organización MFlux-Community, con MFlux 0.23.0 como herramienta de conversión, fechada el 25 de octubre de 2026.

La relevancia de esta ficha es práctica: ofrece una vía concreta para ejecutar un modelo de edición de imágenes de gama alta en un Mac con MLX, a costa de 13,4 GB de pesos y de renunciar a la fidelidad completa de BF16. Es un artefacto de despliegue, no un modelo de investigación, y su utilidad depende enteramente de la licencia y las capacidades del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para text-to-image y edición de imágenes (detalle de bloques no disponible); pesos convertidos a MLX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto en el sentido de LLM) |
| Tipos de cuantización | Q8 (cuantización afín MLX de 8 bits en text encoder, transformer y VAE); existen variantes BF16, Q6, Q5, Q4 y Q3 en MFlux-Community |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-edit-turbo-license (heredada del modelo base; términos en la model card de briaai/Fibo-2.0-edit-turbo) |
| Formato de pesos | safetensors en formato MLX (librería mflux); tamaño del repo 13,4 GB |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna del modelo base. Se sabe que Fibo-2.0-edit-turbo es un modelo de difusión para generación y edición de imágenes, con pipeline text-to-image, y que la conversión a MLX afecta a tres componentes: text encoder, transformer y VAE. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica de este repositorio no está en el modelo sino en el proceso de conversión: MFlux 0.23.0 aplica cuantización afín de 8 bits de MLX a los tres componentes y almacena el nivel de cuantización dentro de los propios pesos, de modo que no hace falta pasar un flag `--quantize` en tiempo de inferencia. La conversión se realizó el 25 de octubre de 2026 y no incluye reentrenamiento ni ajuste fino; es una transformación puramente de formato y precisión.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) con resolución configurable, por ejemplo 1024x1024 en el ejemplo de la model card.
- Edición de imágenes guiada por instrucciones, según la designación "edit" del modelo base.
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Control de semilla para reproducibilidad (`--seed`).
- Variantes de cuantización que permiten ajustar el equilibrio entre calidad y huella de memoria (BF16 a Q3).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Edición de imágenes en local en un Mac: un usuario puede modificar una imagen existente con instrucciones en lenguaje natural sin enviar datos a un servicio externo, usando los 13,4 GB de pesos Q8 en MLX.
- Prototipado rápido de pipelines de generación de imágenes: desarrolladores que trabajan en macOS pueden iterar sobre prompts y parámetros con `mflux-generate-fibo2-edit` antes de mover el flujo a un entorno con GPU dedicada.
- Automatización de variaciones de assets gráficos: generación por lotes con semillas fijas para producir variantes controladas de una imagen base en flujos de diseño.
- Investigación en cuantización: comparar la calidad de salida entre las variantes BF16, Q8, Q6, Q5, Q4 y Q3 del mismo modelo para estudiar la degradación introducida por la cuantización afín de MLX.
- Docencia y demostraciones: ejecutar un modelo de edición de imágenes de gama alta en hardware de consumo Apple para clases o talleres sin infraestructura de servidor.
- Evaluación de licencias y despliegue: probar el modelo base en un entorno controlado antes de decidir si se adopta comercialmente, dado que la licencia heredada impone condiciones que deben revisarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), comparaciones con el modelo base en BF16 ni mediciones de latencia o throughput en hardware Apple Silicon.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 13,4 GB solo para los pesos Q8; se requiere memoria adicional para activaciones y buffers durante la inferencia, por lo que en la práctica conviene disponer de 24 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No está pensado para GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; las variantes Q6 (10,3 GB), Q5 (8,8 GB), Q4 (7,2 GB) y Q3 (5,6 GB) reducen el requisito para equipos con menos memoria.
- Opciones de despliegue: MFlux (comando `mflux-generate-fibo2-edit`), instalable con `uv tool install --upgrade mflux`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npario/fibo-2-0-edit-turbo-mflux-q8 | no disponible | no aplica | no disponible | fibo-2.0-edit-turbo-license | HuggingFace, 21 descargas |
| mflux-community/fibo-2-0-edit-turbo-mflux-bf16 | no disponible | no aplica | no disponible | fibo-2.0-edit-turbo-license | HuggingFace, 25,1 GB |
| mflux-community/fibo-2-0-edit-turbo-mflux-q4 | no disponible | no aplica | no disponible | fibo-2.0-edit-turbo-license | HuggingFace, 7,2 GB |
| briaai/Fibo-2.0-edit-turbo (original) | no disponible | no aplica | no disponible | fibo-2.0-edit-turbo-license | HuggingFace |

La comparación relevante es interna a la familia de conversiones MFlux: misma arquitectura y licencia, distinta precisión y huella de memoria. No se dispone de datos para comparar con modelos de edición de imágenes de otros autores.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una versión oficial de BRIA AI; los autores del modelo base no la han validado.
- La cuantización a 8 bits puede introducir degradación en la calidad de imagen respecto a BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- La licencia fibo-2.0-edit-turbo-license es de tipo "other" y debe consultarse en la model card del modelo base antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPU de forma directa.
- No hay información sobre sesgos del modelo base, riesgo de alucinación visual, limitaciones idiomáticas del text encoder ni restricciones de contenido.
- El repo tiene 21 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- La fecha de creación (2026-10-27) y la referencia a MFlux 0.23.0 deben verificarse contra el estado actual de la herramienta antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/npario/fibo-2-0-edit-turbo-mflux-q8
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- MFlux (GitHub): https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16
- Variante Q6: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
