# mflux-community/fibo-2-0-dev-mflux-q5

## Resumen

Fibo-2.0-dev MFlux Q5 es una conversion comunitaria del modelo de generacion de imagenes Fibo-2.0-dev de Bria AI al formato MLX, cuantizada a 5 bits. La ha publicado la organizacion mflux-community y esta pensada para ejecutar el modelo original de forma nativa en Apple Silicon (Macs con chip M1/M2/M3/M4) mediante la libreria MFlux. No es un modelo nuevo ni un fine-tuning: los pesos son los de briaai/Fibo-2.0-dev, modificados unicamente por la conversion a MLX y la cuantizacion.

El problema que resuelve es practico: el modelo original en BF16 ocupa unos 25,1 GB, lo que lo hace inviable en la mayoria de Macs de consumo. Esta version Q5 reduce el peso del repositorio a 8,8 GB, de modo que puede cargarse en equipos con memoria unificada mas limitada sin necesidad de GPU dedicada. La cuantizacion MLX affine de 5 bits se aplica al text encoder, al transformer y al VAE, y el nivel de cuantizacion queda almacenado en los propios pesos.

La relevancia es doble: por un lado, permite inferencia local de un modelo text-to-image de ultima generacion en hardware Apple; por otro, demuestra el ecosistema de conversiones comunitarias que esta creciendo alrededor de MFlux. Es importante subrayar que no es una release oficial de Bria AI y que hereda integramente la licencia del modelo original, fibo-2.0-dev-license.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; detalles del transformer no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | MLX affine de 5 bits (Q5); el repositorio ofrece tambien BF16, Q8, Q6, Q4 y Q3 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el modelo base no declara lista de idiomas) |
| Licencia | fibo-2.0-dev-license (heredada de briaai/Fibo-2.0-dev) |
| Formato de pesos | safetensors en formato MLX (libreria mflux) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el pipeline declarado (text-to-image) y por la estructura de componentes que menciona la model card (text encoder, transformer y VAE), se trata de un modelo generativo de difusion con los tres bloques habituales. La conversion a MLX aplica cuantizacion affine de 5 bits de forma homogenea a esos tres componentes.

No hay datos publicados en la informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas del modelo original. La unica transformacion documentada es la conversion: realizada con MFlux 0.23.0 el 2026-10-25, con el nivel de cuantizacion embebido en los pesos (no requiere flag `--quantize` en tiempo de inferencia).

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resoluciones configurables; el ejemplo oficial usa 1024x1024.
- Control de semilla (`--seed`) para reproducibilidad de resultados.
- Control explicito de dimensiones de salida (`--width`, `--height`).
- Ejecucion local nativa en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Multiples niveles de cuantizacion disponibles (BF16, Q8, Q6, Q5, Q4, Q3) para ajustar calidad y memoria.
- No se documentan en la informacion disponible capacidades de edicion de imagen, inpainting, control por pose, tool calling ni agentes.

## Casos de uso

- Prototipado rapido de assets visuales en un Mac: un desarrollador puede generar ilustraciones de 1024x1024 desde la terminal con `mflux-generate-fibo2` sin contratar GPU en la nube, usando el repo Q5 de 8,8 GB.
- Iteracion de prompts en local con control de semilla: util para disenadores que necesitan reproducir exactamente una imagen aprobada y variar solo el prompt, gracias al flag `--seed`.
- Generacion de imagenes para documentacion tecnica o blogs: el modelo cabe en un Mac con memoria unificada moderada, lo que permite generar banners y figuras sin salir del entorno de desarrollo.
- Evaluacion comparativa de cuantizaciones: el ecosistema de repos Q3 a BF16 permite medir en el mismo hardware la perdida de calidad frente a memoria, algo util para investigadores que estudian el impacto de la cuantizacion en difusion.
- Integracion en pipelines de CI/CD para Mac runners: al instalarse con `uv tool install mflux` y descargarse los pesos via `hf download`, se puede automatizar la generacion de imagenes en flujos de build sobre hardware Apple.
- Demos y experimentos docentes: el coste de entrada (un Mac y software libre) facilita talleres sobre modelos generativos sin depender de APIs de pago.
- Uso offline en entornos con restricciones de red: una vez descargado el repo localmente con `--local-dir`, la generacion no requiere conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el repo Q5 ocupa 8,8 GB en disco; se recomienda un Mac con al menos 16 GB de memoria unificada para dejar margen al sistema y a la generacion a 1024x1024 (estimacion, no dato oficial).
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra); no esta pensado para GPU NVIDIA ni AMD.
- No cabe en GPUs de consumo tipo RTX 4090 mediante este repo, porque el formato es MLX, no GGUF ni safetensors estandar de PyTorch.
- Despliegue: libreria MFlux (`uv tool install --upgrade mflux`), comando `mflux-generate-fibo2`. Los pesos se descargan del repo en el primer uso o se copian con `hf download`.
- Alternativas de cuantizacion para equipos con menos memoria: Q4 (7,2 GB) y Q3 (5,6 GB); para maxima calidad, BF16 (25,1 GB) o Q8 (13,4 GB).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-dev-mflux-q5 | no disponible | no aplica | MLX safetensors Q5 (8,8 GB) | fibo-2.0-dev-license | HuggingFace, via MFlux |
| fibo-2-0-dev-mflux-bf16 | no disponible | no aplica | MLX safetensors BF16 (25,1 GB) | fibo-2.0-dev-license | HuggingFace, via MFlux |
| fibo-2-0-dev-mflux-q3 | no disponible | no aplica | MLX safetensors Q3 (5,6 GB) | fibo-2.0-dev-license | HuggingFace, via MFlux |
| briaai/Fibo-2.0-dev (original) | no disponible | no aplica | pesos originales | fibo-2.0-dev-license | HuggingFace |

No se dispone de datos de rendimiento ni de modelos comparables de otros autores en la informacion proporcionada; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- No es una release oficial: la conversion la ha realizado mflux-community, no Bria AI; los autores originales no la respaldan.
- Licencia restrictiva: fibo-2.0-dev-license puede imponer condiciones al uso comercial; es imprescindible revisar la model card de briaai/Fibo-2.0-dev antes de desplegar en produccion.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU generica; limita el despliegue a hardware Apple.
- Perdida de calidad por cuantizacion: Q5 introduce degradacion respecto a BF16; para resultados de maxima fidelidad conviene usar Q8 o BF16 si la memoria lo permite.
- Riesgo de sesgos y alucinacion visual: no hay informacion publicada sobre sesgos del modelo base ni sobre su tasa de fallo en la generacion; se desconoce igualmente el comportamiento con prompts en castellano.
- Idiomas no declarados: no hay lista oficial de idiomas soportados para los prompts.
- Sin benchmarks: no se puede verificar el rendimiento frente a alternativas con datos objetivos.
- Repositorio con muy poca traccion (78 descargas, 0 likes en el momento de la consulta): menor probabilidad de soporte comunitario o correccion de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q5
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q6
- Variante Q4: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q3
