# mflux-community/iris-3b-mflux-q6

## Resumen

Iris-3B MFlux Q6 es una conversión comunitaria del modelo de generación de imágenes text-to-image `speridlabs/iris-3b` al formato nativo MLX de Apple, empaquetada para su uso con la herramienta MFlux. La conversión la firma MFlux-Community, no los autores originales del modelo, y aplica cuantización afín de 6 bits (Q6) sobre el codificador de texto, el transformer y el VAE, reduciendo el peso del repositorio a 6,4 GB frente a los 14,0 GB de la versión BF16.

El modelo resuelve un problema muy concreto: ejecutar un generador de imágenes de última generación de forma local en Macs con chip Apple Silicon, sin depender de servicios en la nube ni de CUDA. Al estar en MLX, aprovecha la memoria unificada del hardware de Apple y permite inferencia nativa en macOS con un consumo de disco y memoria contenido gracias a la cuantización.

Es relevante ahora porque el ecosistema MLX está madurando rápidamente y este tipo de conversiones comunitarias democratizan el acceso a modelos de difusión en hardware de consumo de Apple. La licencia Apache 2.0 del modelo original se mantiene, lo que facilita su uso comercial, aunque conviene revisar la model card original para conocer los términos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (codificador de texto + transformer + VAE), convertido a MLX |
| Parametros totales | no disponible (el nombre "3B" sugiere ~3.000 millones, sin confirmar en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de 6 bits (Q6) sobre text encoder, transformer y VAE; existen variantes BF16, Q8, Q5, Q4 y Q3 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 6,4 GB (Q6) |
| Libreria | mflux |
| Pipeline | text-to-image |
| Fecha de conversion | 2026-10-30, con MFlux 0.24.0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original `speridlabs/iris-3b` mas alla de que se trata de un pipeline text-to-image compuesto por un codificador de texto, un transformer y un VAE. La conversion a MLX mantiene esa estructura y aplica cuantizacion afín de 6 bits de forma uniforme sobre los tres componentes. El nivel de cuantizacion queda almacenado en los propios pesos, por lo que no es necesario pasar el flag `--quantize` en la inferencia.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO o ajuste fino. Tampoco se documentan innovaciones tecnicas especificas del modelo original en la informacion proporcionada. La conversion en si misma constituye la aportacion de este repositorio: trasladar los pesos originales a MLX y cuantizarlos para reducir el uso de memoria y disco en hardware Apple Silicon.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resoluciones configurables, como 1024x1024 en los ejemplos de la model card.
- Control de la semilla (`--seed`) para reproducibilidad de resultados.
- Ajuste de dimensiones de salida mediante `--width` y `--height`.
- Ejecucion local nativa en Apple Silicon a traves de MLX, sin necesidad de GPU NVIDIA.
- Cuantizacion integrada en los pesos: el modelo se carga directamente en Q6 sin pasos adicionales de cuantizacion.
- Compatibilidad con el ecosistema MFlux (`mflux-generate-iris`), que permite descargar los pesos desde Hugging Face en el primer uso o usar una copia local.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking; es un modelo exclusivamente generativo de imagenes.

## Casos de uso

- Generacion de ilustraciones para prototipos y maquetas: un disenador puede lanzar `mflux-generate-iris` con prompts descriptivos y obtener imagenes de 1024x1024 en local, iterando rapidamente sin coste por llamada a API.
- Creacion de assets para videojuegos o contenido editorial en un Mac de estudio: al ejecutarse en MLX sobre Apple Silicon, se integra en flujos de trabajo macOS sin necesidad de una estacion con GPU dedicada.
- Experimentacion e investigacion en generacion de imagenes: la disponibilidad de variantes Q3 a BF16 permite estudiar el impacto de la cuantizacion en la calidad visual con el mismo modelo base.
- Automatizacion de pipelines creativos por lotes: el uso de semillas y dimensiones configurables facilita generar conjuntos de imagenes reproducibles para pruebas A/B de conceptos visuales.
- Despliegue en entornos con requisitos de privacidad: al correr completamente en local, los prompts y las imagenes no salen del equipo, lo que encaja en sectores con datos sensibles.
- Educacion y demostraciones: el tamano contenido (6,4 GB) y la instalacion via `uv tool install mflux` hacen viable montar talleres practicos de difusion en portatiles Mac.
- Generacion de variaciones controladas de un mismo concepto: fijando la semilla y variando el prompt se pueden producir familias de imagenes coherentes para branding o storyboards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio Q6 ocupa 6,4 GB en disco; en ejecucion se necesita ademas memoria para activaciones y buffers del pipeline, por lo que se recomienda disponer de al menos 16 GB de memoria unificada para trabajar con holgura a 1024x1024.
- Hardware objetivo: Macs con Apple Silicon (serie M1, M2, M3, M4 y posteriores). No esta pensado para GPUs NVIDIA ni CUDA.
- Cabe en equipos de consumo: si, en Macs con 16 GB o mas de memoria unificada; las variantes Q5 (5,6 GB), Q4 (5,1 GB) y Q3 (4,3 GB) reducen aun mas el requisito y pueden facilitar su uso en configuraciones de 8-16 GB.
- Opciones de despliegue: MFlux (herramienta oficial de inferencia, comando `mflux-generate-iris`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de difusion en MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-3b-mflux-q6 (este) | no disponible (~3B por nombre) | no disponible | safetensors MLX Q6 | apache-2.0 | Hugging Face, 22 descargas |
| iris-3b-mflux-bf16 | no disponible | no disponible | safetensors MLX BF16 | apache-2.0 | Hugging Face, 14,0 GB |
| iris-3b-mflux-q4 | no disponible | no disponible | safetensors MLX Q4 | apache-2.0 | Hugging Face, 5,1 GB |
| speridlabs/iris-3b (original) | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan comparar cualitativamente con otros generadores text-to-image; la comparativa se limita a variantes de cuantizacion del mismo modelo.

## Limitaciones y advertencias

- Es una conversion comunitaria, no una release oficial de los autores de `speridlabs/iris-3b`; la calidad de la conversion y la cuantizacion no estan avaladas por el autor original.
- La cuantizacion a 6 bits puede introducir perdida de fidelidad visual respecto a la version BF16; conviene validar la calidad en el caso de uso concreto.
- No hay informacion sobre sesgos del modelo original ni sobre sesgos introducidos por la conversion.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion; no se documentan tasas ni evaluaciones.
- No se especifican los idiomas soportados en los prompts; la model card esta en ingles y no confirma cobertura multilingue.
- La licencia Apache 2.0 del modelo original se mantiene, pero deben revisarse los terminos completos en la model card original por si existen restricciones adicionales de uso.
- Requiere hardware Apple Silicon y la herramienta MFlux; no es portable a CUDA sin reconvertir los pesos.
- El numero de descargas (22) y de likes (0) indica una adopcion muy temprana; la comunidad y el soporte son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-mflux-q6
- Modelo original: https://huggingface.co/speridlabs/iris-3b
- MFlux (GitHub): https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-mflux-q8
- Variante Q5: https://huggingface.co/mflux-community/iris-3b-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/iris-3b-mflux-q3
