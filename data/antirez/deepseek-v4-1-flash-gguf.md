# antirez/deepseek-v4.1-flash-gguf

## Resumen

DeepSeek V4.1 Flash GGUF es una distribución de cuantizaciones del modelo `deepseek-ai/DeepSeek-V4.1-Flash`, publicada por Salvatore Sanfilippo (antirez) bajo el identificador `antirez/deepseek-v4.1-flash-gguf`. No se trata de un modelo nuevo, sino de pesos calibrados específicamente para la implementación Metal del motor de inferencia DwarfStar, desarrollada en la rama `ds4.1flash` del repositorio del autor. El modelo base es un transformer de gran escala con 754.638.867.584 parámetros totales (según los datos de safetensors) y una arquitectura que incorpora tablas Engram nativas en FP8, un componente diferenciador frente a las arquitecturas transformer convencionales.

La relevancia de esta publicación es doble. Por un lado, ofrece dos variantes cuantizadas (Q2 y Q4) pensadas para ejecutarse en hardware Apple Silicon mediante streaming desde SSD, lo que permite desplegar un modelo de más de 750.000 millones de parámetros en un único Mac de 128 GB de memoria unificada. Por otro, el autor advierte explícitamente de que estos pesos no son intercambiables con los de DeepSeek V4 Flash ni con su drafter DSpark, lo que subraya que se trata de un artefacto de inferencia específico y no de una conversión genérica.

El repositorio acumula 812.846 descargas y 93 likes desde su creación el 11 de septiembre de 2026, con licencia MIT heredada del modelo base. El tamaño total del repo es de 2118,3 GB, lo que refleja la magnitud de los pesos originales en FP8 y las dos cuantizaciones publicadas. La ficha se limita a lo documentado en la model card y en los metadatos de Hugging Face; cualquier dato no presente se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tablas Engram nativas en FP8 (según model card); detalles internos no disponibles |
| Parámetros totales | 754.638.867.584 |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (ejemplo de ejecución con `--ctx 32768`); máximo no disponible |
| Tipos de cuantización | IQ2_XXS (expertos gate/up enrutados), Q2_K (expertos down), Q4_K (expertos enrutados); Q8 en proyecciones de atención, expertos compartidos y salida; F16/F32 en el resto; Engram nativo FP8 sin modificar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q2 y Q4 en partes binarias para Q4; visión en GGUF separado) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer con tablas Engram nativas en FP8, un componente que en esta distribución se mantiene sin recuantizar: cada GGUF de lenguaje incluye 188,83 GiB de tablas Engram en FP8 que DwarfStar lee directamente desde disco sin mantenerlas residentes en memoria. Esta decisión de diseño es la que permite que el modelo funcione en máquinas con memoria unificada limitada, a costa de exigir un SSD local rápido. El checkpoint de origen es `deepseek-ai/DeepSeek-V4.1-Flash` en el commit `df42c109f1defefcbfcedbe7d905718a12266e40`.

Las cuantizaciones Q2 y Q4 se generaron de forma independiente a partir del checkpoint original, no como recuantización de un GGUF a otro, y ambas usan la misma imatrix de activaciones de 8.192 tokens. Q2 combina IQ2_XXS en expertos gate/up enrutados con Q2_K en expertos down; Q4 emplea Q4_K en todos los expertos enrutados. En ambos casos se conservan en Q8 las proyecciones de atención, los expertos compartidos y la capa de salida, con tensores F16/F32 en el resto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base DeepSeek V4.1 Flash.
- Procesamiento de imágenes mediante un encoder de visión separado (`ds41f-vision`, 0,90 GiB), que se activa con `--vision gguf/DeepSeek-V4.1-Flash-Vision.gguf`.
- Ejecución en modo agente y servidor: la model card indica que las mismas opciones de modelo y memoria funcionan con `ds4-agent` y `ds4-server`.
- Streaming desde SSD con `--ssd-streaming`, que permite cargar solo las filas necesarias de las tablas Engram.
- Tensor parallelism residente con RDMA entre dos Macs de 128 GB para la variante Q2.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de gran escala en Apple Silicon: un Mac de 128 GB puede ejecutar la variante Q2 con streaming desde SSD y contexto de 32.768 tokens, lo que permite disponer de un modelo de 754.000 millones de parámetros en hardware de escritorio sin GPU dedicada.
- Despliegue en clúster de dos estaciones: la variante Q2 cabe residente en tensor parallelism con RDMA entre dos Macs de 128 GB, útil para equipos de investigación que quieran servir el modelo con baja latencia sin adquirir hardware de centro de datos.
- Procesamiento de documentos con imágenes: combinando el GGUF de lenguaje con el encoder de visión, se pueden analizar capturas, diagramas o documentos escaneados en flujos locales, manteniendo los datos fuera de servicios en la nube.
- Servicio de API interno: mediante `ds4-server`, el modelo puede exponerse como endpoint HTTP para aplicaciones internas que requieran razonamiento de contexto largo, aprovechando los 32.768 tokens de ventana.
- Automatización agéntica: `ds4-agent` permite construir flujos multi-paso sobre el modelo, adecuado para tareas de investigación o análisis que requieran varias llamadas encadenadas.
- Experimentación con arquitecturas Engram: el hecho de que las tablas Engram se mantengan en FP8 nativo y se lean desde disco convierte este repo en un banco de pruebas para estudiar el comportamiento de modelos con memoria externa en entornos de recursos limitados.
- Estaciones de trabajo con 512 GB de memoria unificada: la variante Q4 está pensada para residencia completa en un Mac de 512 GB, orientada a equipos que necesiten la máxima calidad de cuantización disponible en esta distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: Q2 requiere streaming desde SSD en un Mac de 128 GB; los pesos principales ocupan 151,77 GiB y el archivo completo 340,60 GiB. Q4 requiere streaming en Macs pequeños y residencia completa en un Mac de 512 GB; pesos principales de 294,15 GiB y archivo de 482,98 GiB.
- GPU recomendadas: Apple Silicon con memoria unificada de 128 GB (Q2 con streaming), 512 GB (Q4 residente) o dos Macs de 128 GB con RDMA para Q2 en tensor parallelism. No se documentan GPU NVIDIA o AMD.
- ¿Cabe en GPU consumer? No se documenta soporte para GPU consumer tipo RTX 4090; el motor DwarfStar es una implementación Metal.
- Opciones de despliegue: DwarfStar (`ds4`, `ds4-agent`, `ds4-server`) con soporte V4.1; scripts `download_model.sh` para obtener `ds41f-q2`, `ds41f-q4` y `ds41f-vision`.
- Almacenamiento: se requiere un SSD local rápido para el streaming de las tablas Engram; para Q4 se necesitan 37 GiB adicionales de espacio libre durante el ensamblado de las dos partes binarias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash GGUF (este repo) | 754.638.867.584 | 32.768 (ejemplo documentado) | MIT | GGUF (Q2/Q4) + encoder visión | Hugging Face, 812.846 descargas |
| DeepSeek V4.1 Flash (modelo base) | no disponible en esta información | no disponible | MIT (según repo derivado) | safetensors (presumiblemente) | Hugging Face (`deepseek-ai/DeepSeek-V4.1-Flash`) |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como no intercambiable |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Los pesos no son intercambiables con DeepSeek V4 Flash ni con su drafter DSpark; usarlos con el motor o el modelo equivocado producirá resultados incorrectos.
- El modelo está calibrado para la implementación Metal de DwarfStar en la rama `ds4.1flash`; no se garantiza su funcionamiento en otros motores de inferencia (llama.cpp, vLLM, TGI, Ollama).
- El streaming desde SSD exige almacenamiento local rápido; un SSD lento degradará gravemente la latencia.
- Las tablas Engram en FP8 (188,83 GiB) se leen desde disco, lo que introduce dependencia de E/S y puede afectar al throughput en cargas concurrentes.
- La variante Q4 se distribuye en dos partes binarias que no son GGUFs ejecutables por sí solas; requieren ensamblado con el descargador y 37 GiB adicionales de espacio libre.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia MIT se hereda del modelo base; conviene verificar las condiciones del checkpoint original antes de uso comercial a gran escala.
- No hay datos publicados de benchmarks que permitan validar la calidad de las cuantizaciones Q2 y Q4 frente al modelo en FP8.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/antirez/deepseek-v4.1-flash-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Motor DwarfStar: https://github.com/antirez/ds4
- Rama de desarrollo: `ds4.1flash` en el repositorio DwarfStar
