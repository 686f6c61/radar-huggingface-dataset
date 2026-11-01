# mflux-community/iris-3b-mflux-q3

## Resumen

Iris-3B · MFlux Q3 es una conversión comunitaria del modelo de generación de imágenes text-to-image `speridlabs/iris-3b` al formato MLX, cuantizado a 3 bits mediante cuantización afín de MLX. Lo publica la organización MFlux-Community, no los autores originales del modelo, y está pensado para ejecutar generación de imágenes de forma local en equipos con Apple Silicon (Macs con chip M1/M2/M3/M4). El repositorio ocupa 4,3 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

El modelo base, Iris-3B, es un modelo de difusión text-to-image de aproximadamente 3.000 millones de parámetros, según se deduce de su nombre comercial. La conversión aplica cuantización de 3 bits sobre el text encoder, el transformer y el VAE, y el nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar ningún flag de cuantización en tiempo de inferencia. Se convirtió con MFlux 0.24.0 el 30 de octubre de 2026.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de generación de imágenes de 3B en hardware de consumo Apple sin depender de GPUs NVIDIA ni de servicios en la nube. Al ser una conversión comunitaria con 17 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto experimental más que como una opción de producción consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (text encoder + transformer + VAE), convertido a MLX |
| Parametros totales | Aproximadamente 3.000 millones (segun el nombre `iris-3b`; no confirmado en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; no se especifica longitud de prompt maxima) |
| Tipos de cuantizacion | Q3 (3 bits, cuantizacion afin de MLX) sobre text encoder, transformer y VAE; existen variantes BF16, Q8 y Q4 del mismo modelo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (libreria `mflux`) |
| Tamano del repositorio | 4,3 GB |
| Pipeline | text-to-image |
| Version de MFlux usada en la conversion | 0.24.0 |
| Fecha de conversion | 2026-10-30 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `speridlabs/iris-3b` mas alla de que es un modelo de difusion text-to-image con tres componentes diferenciados: un text encoder, un transformer y un VAE. La conversion a MLX aplica cuantizacion afin de 3 bits de forma uniforme a los tres componentes, lo que reduce el peso del repositorio a 4,3 GB frente a los 14,0 GB de la variante BF16 y los 8,0 GB de la variante Q8.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes utilizadas, ni sobre si el modelo original empleo tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas del modelo base en la informacion proporcionada. La unica innovacion documentada corresponde al proceso de conversion: el uso de cuantizacion afín nativa de MLX con el nivel almacenado en los pesos, lo que simplifica el despliegue al eliminar la necesidad de especificar la cuantizacion en cada invocacion.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resoluciones configurables, incluyendo 1024x1024 en el ejemplo oficial.
- Control de semilla (`--seed`) para reproducibilidad de resultados.
- Control de dimensiones de salida mediante `--width` y `--height`.
- Ejecucion local nativa en Apple Silicon mediante MLX, sin dependencia de CUDA.
- Inferencia offline una vez descargados los pesos, con opcion de mantener copia local del repositorio.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control por pose o referencia, tool calling ni agentes; la informacion disponible solo cubre generacion text-to-image.

## Casos de uso

- Generacion de ilustraciones conceptuales en local: un disenador puede producir bocetos a 1024x1024 en su Mac sin enviar prompts a servicios externos, usando `mflux-generate-iris` con el repositorio Q3 y semillas fijas para iterar sobre variaciones controladas.
- Prototipado rapido de assets para interfaces: al ocupar solo 4,3 GB, el modelo cabe en el disco de un portatil Apple Silicon y permite generar iconos, fondos o placeholders en el mismo equipo de desarrollo sin infraestructura adicional.
- Experimentacion en entornos con requisitos de privacidad: al ejecutarse completamente offline tras la descarga, los prompts y las imagenes no salen del equipo, lo que resulta adecuado para pruebas con contenido sensible que no debe enviarse a APIs de terceros.
- Evaluacion comparativa de cuantizaciones: el mismo modelo se ofrece en BF16, Q8, Q4 y Q3, lo que permite medir en un mismo Mac la perdida de calidad visual al bajar de bits y decidir el equilibrio entre fidelidad y espacio en disco.
- Integracion en scripts de automatizacion creativa: la CLI de MFlux acepta ruta local de modelo, dimensiones y semilla, de modo que se puede encadenar la generacion de lotes de imagenes desde un script de shell o un pipeline de CI para pruebas de regresion visual.
- Docencia y demostraciones de difusion en hardware de consumo: sirve para ilustrar el funcionamiento de un pipeline text-to-image completo (text encoder, transformer, VAE) en un equipo de estudiante sin GPU dedicada, aunque con la advertencia de que la calidad a 3 bits puede ser inferior a la de las variantes superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio pesa 4,3 GB en disco; la memoria unificada necesaria para inferencia no se especifica en la informacion disponible y sera superior al tamano de los pesos por los estados intermedios del pipeline de difusion.
- Hardware objetivo: Apple Silicon (MLX). No hay soporte documentado para CUDA, ROCm ni CPU x86 en esta conversion.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el formato MLX esta disenado para memoria unificada de Apple Silicon.
- Cabe en equipos de consumo Apple: si, en funcion del modelo concreto de Mac y de su memoria unificada; las variantes BF16 (14,0 GB) y Q8 (8,0 GB) requieren mas memoria que la Q3 (4,3 GB).
- Opciones de despliegue: CLI `mflux-generate-iris` de MFlux, instalable con `uv tool install --upgrade mflux`; descarga de pesos con `hf download` para uso local.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| iris-3b-mflux-q3 (este) | ~3B | MLX safetensors, 3 bits | 4,3 GB | Apache 2.0 | Conversion comunitaria para Apple Silicon |
| iris-3b-mflux-q4 | ~3B | MLX safetensors, 4 bits | 5,1 GB | Apache 2.0 | Misma conversion, mayor fidelidad y tamano |
| iris-3b-mflux-q8 | ~3B | MLX safetensors, 8 bits | 8,0 GB | Apache 2.0 | Misma conversion, cuantizacion mas alta |
| iris-3b-mflux-bf16 | ~3B | MLX safetensors, BF16 | 14,0 GB | Apache 2.0 | Referencia sin cuantizacion |

No se dispone de informacion sobre modelos comparables de otros autores (mismo tamano o misma tarea) en los datos proporcionados, ni de resultados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Conversion no oficial: la publica MFlux-Community, no los autores de `speridlabs/iris-3b`; no debe considerarse una release del modelo original.
- Cuantizacion agresiva de 3 bits: es previsible cierta degradacion de calidad visual frente a las variantes Q4, Q8 y BF16, aunque no se aportan metricas que la cuantifiquen.
- Exclusivo para Apple Silicon: el formato MLX no es portable a GPUs NVIDIA ni a CPU x86 sin reconversion.
- Informacion muy escasa: no hay datos de entrenamiento, idiomas, sesgos, benchmarks ni limites de prompt, lo que impide evaluar riesgos de alucinacion visual o sesgos de representacion.
- Madurez baja: 17 descargas y 0 likes en el momento de la consulta; sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la model card del modelo original por si existieran restricciones adicionales de uso.
- No apto como dependencia critica de produccion sin una evaluacion previa de calidad y de estabilidad de la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/iris-3b-mflux-q3
- Modelo base original: https://huggingface.co/speridlabs/iris-3b
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-mflux-q8
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-mflux-q4
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Repositorio MFlux: https://github.com/filipstrand/mflux
