# dissembill/mirror-flux2-klein-4b-mflux-q4

## Resumen

`dissembill/mirror-flux2-klein-4b-mflux-q4` es una conversión cuantizada a 4 bits del modelo de generación y edición de imágenes FLUX.2-klein-4B de Black Forest Labs, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. No se trata de un modelo nuevo: es una redistribución de los pesos originales convertidos a MLX y cuantizados con cuantización afín de 4 bits (Q4) sobre el codificador de texto, el transformer y el VAE, lo que reduce el peso del repositorio a 4,6 GB frente a los 16,0 GB de la versión BF16.

El interés de esta ficha reside en que permite ejecutar localmente un modelo de difusión de última generación en equipos Mac con memoria unificada modesta, sin necesidad de GPU dedicada ni de servicios en la nube. La pipeline declarada es image-to-image, y el modelo base es `black-forest-labs/FLUX.2-klein-4B`, del que hereda la licencia Apache 2.0.

La conversión la firma el usuario `dissembill` y sigue el formato de las publicadas por MFlux-Community; el autor original del modelo no participa en esta distribución. El repositorio no incluye model card propia más allá de la plantilla de MFlux, por lo que muchos datos técnicos del modelo base (arquitectura interna, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (FLUX.2-klein-4B) convertido a MLX; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 4B (según el nombre del modelo base); no se detalla el desglose por componente |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | Q4 (cuantización afín MLX de 4 bits aplicada a text encoder, transformer y VAE); existen variantes Q3, Q5, Q6, Q8 y BF16 publicadas por MFlux-Community |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería `mflux`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por el nombre y la familia (FLUX.2-klein-4B) se trata de un modelo de difusión para generación y edición de imágenes de 4 000 millones de parámetros, pero la información proporcionada no detalla el tipo de backbone (transformer de difusión, DiT u otra variante), el número de pasos de muestreo, la resolución nativa ni la composición del dataset de entrenamiento.

Lo que sí está documentado es el proceso de conversión: los pesos originales se han transformado a MLX y cuantizado con cuantización afín de 4 bits en los tres componentes del pipeline (codificador de texto, transformer y VAE). El nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar el flag `--quantize` en la inferencia. La conversión se realizó el 2026-08-03 según la model card. No se indica si hubo RLHF, DPO ni ninguna fase de ajuste adicional; tampoco se documentan innovaciones técnicas propias de esta conversión más allá de la propia cuantización MLX.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) mediante el comando `mflux-generate-flux2`.
- Edición de imágenes (image-to-image), que es la pipeline declarada en el repositorio.
- Ejecución local nativa en Apple Silicon mediante MLX, sin dependencia de CUDA ni de servicios externos.
- Cuantización integrada en los pesos: no requiere flags adicionales en tiempo de inferencia.
- Control de resolución y semilla en la generación (`--width`, `--height`, `--seed`).
- Descarga automática de pesos en el primer uso o uso offline con copia local.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada más allá del pipeline image-to-image, ni soporte multilingüe explícito.

## Casos de uso

- Edición de imágenes en local en un Mac: el modelo permite aplicar transformaciones guiadas por prompt sobre una imagen de entrada sin enviar datos a la nube, lo que resulta adecuado para material sensible o trabajo offline.
- Prototipado rápido de pipelines de generación de imágenes: con 4,6 GB de pesos, un desarrollador puede iterar sobre prompts y parámetros en su propio portátil antes de escalar a producción.
- Generación de ilustraciones y assets para maquetas: útil en diseño de producto y front-end para producir imágenes de relleno con control de resolución (por ejemplo, 1024x1024) y semilla reproducible.
- Automatización de variaciones de imagen en lotes: al ser ejecutable por línea de comandos, se puede encadenar en scripts para generar variantes de una imagen base con distintas semillas.
- Investigación y experimentación con cuantización: sirve para comparar la calidad de salida entre Q3, Q4, Q5, Q6, Q8 y BF16 sobre el mismo modelo base, ya que todas las variantes están publicadas.
- Docencia y demos de difusión en Apple Silicon: permite mostrar el funcionamiento de un modelo de difusión moderno en hardware de consumo sin GPU dedicada.
- Flujos de trabajo con restricciones de privacidad: al ejecutarse íntegramente en local, encaja en entornos donde no se permite subir imágenes a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), comparativas con la versión BF16 ni tiempos de inferencia medidos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 4,6 GB en disco; la memoria necesaria en inferencia es superior al tamaño de los pesos por los estados intermedios, pero no se proporciona una cifra exacta en la información disponible.
- Hardware objetivo: Apple Silicon con MLX (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni para CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; este repositorio es específico de MLX y Apple Silicon.
- ¿Cabe en hardware de consumo? Sí, en equipos Mac con memoria unificada suficiente; el tamaño de 4,6 GB sugiere que modelos con 16 GB o más de memoria unificada deberían poder ejecutarlo, aunque no se confirma en la documentación.
- Opciones de despliegue: MFlux (`mflux-generate-flux2`), instalable con `uv tool install --upgrade mflux`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño en disco | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este repositorio (FLUX.2-klein-4B Q4) | 4B | MLX safetensors Q4 | 4,6 GB | Apache 2.0 | Apple Silicon |
| mflux-community/flux2-klein-4b-mflux-bf16 | 4B | MLX safetensors BF16 | 16,0 GB | Apache 2.0 | Apple Silicon |
| mflux-community/flux2-klein-4b-mflux-q8 | 4B | MLX safetensors Q8 | 17,1 GB | Apache 2.0 | Apple Silicon |
| mflux-community/flux2-klein-4b-mflux-q3 | 4B | MLX safetensors Q3 | 3,6 GB | Apache 2.0 | Apple Silicon |

La comparativa más relevante es interna a la familia de cuantizaciones del mismo modelo base: Q4 ofrece un equilibrio entre tamaño (4,6 GB) y fidelidad respecto a BF16 (16,0 GB), mientras que Q3 reduce aún más el peso a costa de mayor pérdida de calidad y Q8/BF16 priorizan calidad. No se dispone de datos de benchmarks que cuantifiquen esa pérdida.

## Limitaciones y advertencias

- Conversión no oficial: la ha realizado un tercero (`dissembill`) siguiendo el formato de MFlux-Community, no los autores originales del modelo.
- La cuantización a 4 bits puede degradar la calidad de imagen respecto a BF16; no se documenta el grado de degradación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad sobre esta conversión concreta.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversión.
- No se documentan sesgos conocidos del modelo base en la información proporcionada; al ser un modelo de difusión, hereda los sesgos de su dataset de entrenamiento, que no se detalla.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no fiel al prompt.
- Licencia Apache 2.0 heredada del modelo base; conviene revisar la model card original de `black-forest-labs/FLUX.2-klein-4B` por si incluye restricciones de uso adicionales.
- No hay información sobre idiomas soportados en los prompts ni sobre límites de resolución.
- El repositorio se creó y actualizó el mismo día (2026-11-19), sin historial de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dissembill/mirror-flux2-klein-4b-mflux-q4
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- MFlux (implementación MLX): https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q5
- Variante Q3: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q3
