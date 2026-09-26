# mlx-community/Qwen-Image-2.1-mflux-q4

## Resumen

Qwen-Image-2.1-mflux-q4 es una conversion nativa a MLX y mflux del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por la organizacion mlx-community. El checkpoint contiene el transformer y el codificador de texto Qwen3-VL almacenados en formato MLX affine de 4 bits, mientras que el VAE sigue el layout de mflux Qwen Image 2.1. El repositorio ocupa 9,6 GB y el empaquetado final ronda los 8,9 GB, lo que reduce de forma sustancial el espacio en disco y la memoria necesaria frente a una version en precision completa.

La relevancia de esta ficha esta en el objetivo del checkpoint: ejecutar generacion de imagenes en Apple Silicon con memoria unificada ajustada. El autor reporta mediciones de factibilidad en un Mac Studio de 4,68 GiB de pico de memoria MLX a 512x512 y 40 pasos, y 5,14 GiB a 1024x1024 y 4 pasos, empleando materializacion de prompt, expulsion (eviction) de codificador y transformer, cache MLX a cero y decodificacion VAE por teselas.

Se trata, por tanto, de un artefacto de despliegue y no de un modelo nuevo: no se reentrena nada, solo se convierte y cuantiza el modelo base Qwen/Qwen-Image-2.1 (revision upstream 790c92633540aa0cb11d9abf19eb46d861714758) con mflux 0.20.0 y MLX 0.32.2. Su uso esta condicionado a un loader de bajo consumo especifico de Rapid-MLX: el mflux 0.20.0 estandar omite la cuantizacion del codificador de texto y no puede cargar este paquete sin esa modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de imagenes, con codificador de texto Qwen3-VL y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible (aplica al codificador de texto Qwen3-VL) |
| Tipos de cuantizacion | MLX affine 4-bit en transformer y codificador de texto; VAE segun layout mflux Qwen Image 2.1 (no se detalla su cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 9,6 GB |
| Tamano empaquetado | aproximadamente 8,9 GB |
| Libreria | mflux 0.20.0, MLX 0.32.2 |
| Pipeline | text-to-image, image-to-image |
| Modelo base | Qwen/Qwen-Image-2.1 (revision 790c92633540aa0cb11d9abf19eb46d861714758) |
| Fecha de publicacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura del modelo base: un transformer de difusion para sintesis de imagenes acompanado de un codificador de texto Qwen3-VL y un VAE. En esta conversion, el transformer y el codificador de texto se almacenan en cuantizacion MLX affine de 4 bits, mientras que el VAE conserva el layout definido por mflux para Qwen Image 2.1. No se ha realizado ningun entrenamiento adicional: es una conversion de pesos del checkpoint upstream, por lo que las caracteristicas de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) corresponden al modelo original y no se detallan en la informacion disponible.

La innovacion tecnica del paquete es de ingenieria de despliegue, no de modelado. El autor documenta cuatro tecnicas combinadas para reducir la huella de memoria: materializacion del prompt, expulsion del codificador y del transformer cuando no se usan, cache MLX a cero y decodificacion VAE por teselas. Ademas, el checkpoint incorpora cuantizacion del codificador de texto, algo que mflux 0.20.0 no aplica de serie, lo que obliga a usar el loader de bajo consumo revisado de Rapid-MLX para poder cargarlo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion.
- Generacion y transformacion a partir de imagen de entrada (image-to-image), segun los tags del repositorio.
- Ejecucion local en Apple Silicon a traves del stack MLX y mflux, sin depender de servicios en la nube.
- Inferencia con memoria reducida gracias a la cuantizacion 4-bit del transformer y del codificador de texto.
- Decodificacion VAE por teselas para limitar el pico de memoria en resoluciones altas.
- Soporte de flujos de pocos pasos: el autor mide 1024x1024 con 4 pasos y 5,14 GiB de pico.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, vision de entrada): no disponible, salvo la entrada de imagen implicita en el pipeline image-to-image.

## Casos de uso

- Generacion de imagenes en local en Macs con memoria unificada limitada: el checkpoint esta disenado para escenarios de 8 y 16 GB de memoria fisica, con un pico medido de 5,14 GiB a 1024x1024 y 4 pasos, lo que permite trabajar sin GPU dedicada.
- Prototipado rapido de conceptos visuales: con 4 pasos a 1024x1024 y 5,14 GiB de pico, es viable iterar sobre prompts y variaciones de estilo en un portatil o equipo de sobremesa Apple Silicon.
- Edicion y transformacion de imagenes existentes: el pipeline image-to-image permite partir de una imagen de referencia y reescribirla segun una instruccion textual, util para retoque conceptual o variaciones de producto.
- Desarrollo de aplicaciones de escritorio para macOS: el modelo se integra en el ecosistema MLX (por ejemplo, entornos tipo MLX Studio), lo que facilita empaquetar funciones de generacion de imagen en una app nativa sin backend remoto.
- Generacion de material visual para documentacion y demos internas: al ejecutarse en local y con licencia Apache-2.0, encaja en equipos que no pueden enviar datos ni prompts a servicios externos.
- Investigacion sobre cuantizacion y compresion: sirve como referencia para medir el efecto de la cuantizacion 4-bit del transformer y del codificador de texto frente al modelo upstream en precision completa.
- Pruebas de memoria y perfilado en hardware Apple: las mediciones de pico (4,68 GiB a 512x512/40 pasos; 5,14 GiB a 1024x1024/4 pasos) permiten validar presupuestos de memoria antes de desplegar en flotas de Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de factibilidad de memoria en un Mac Studio, que no constituyen una evaluacion de calidad de imagen ni permiten comparar con otros modelos:

| Escenario | Memoria pico MLX medida |
|---|---|
| 512x512, 40 pasos | 4,68 GiB |
| 1024x1024, 4 pasos | 5,14 GiB |
| Tamano empaquetado en disco | aproximadamente 8,9 GB |

Estas cifras se obtuvieron con materializacion de prompt, expulsion de codificador y transformer, cache MLX a cero y decodificacion VAE por teselas. La cualificacion en Macs con 8 GB y 16 GB de memoria fisica sigue pendiente segun el autor.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX no soporta CUDA ni GPUs NVIDIA).
- VRAM/memoria unificada estimada: 4,68 GiB de pico a 512x512 y 40 pasos; 5,14 GiB de pico a 1024x1024 y 4 pasos, con las optimizaciones de memoria descritas.
- Almacenamiento: 9,6 GB de repositorio; aproximadamente 8,9 GB empaquetado.
- GPU recomendadas: no aplica; el modelo se ejecuta sobre la GPU integrada de los chips Apple Silicon y su memoria unificada.
- Encaje en hardware de consumo: si, en Macs Apple Silicon, aunque el propio autor indica que la cualificacion en equipos de 8 GB y 16 GB de memoria fisica esta pendiente de validar. Las mediciones publicadas se realizaron en un Mac Studio.
- Software necesario: mflux 0.20.0 con MLX 0.32.2, mas el loader de bajo consumo revisado de Rapid-MLX. El mflux 0.20.0 estandar no puede cargar este paquete porque omite la cuantizacion del codificador de texto.
- Opciones de despliegue: Rapid-MLX con el loader revisado; mflux estandar queda descartado para este checkpoint. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponible. La informacion proporcionada solo incluye cifras de memoria, no tiempos por imagen ni imagenes por segundo.

## Comparativa con modelos similares

La informacion disponible no incluye parametros, contexto ni resultados de benchmarks de Qwen/Qwen-Image-2.1 ni de terceros, por lo que no es posible una comparativa cuantitativa fiable. La unica comparacion sostenible con los datos aportados es entre este checkpoint y su modelo base:

| Modelo | Precision / formato | Tamano | Memoria | Hardware | Licencia |
|---|---|---|---|---|---|
| mlx-community/Qwen-Image-2.1-mflux-q4 | MLX affine 4-bit (transformer y codificador de texto) | 9,6 GB de repo; ~8,9 GB empaquetado | 4,68 GiB (512x512/40 pasos); 5,14 GiB (1024x1024/4 pasos) | Apple Silicon, via Rapid-MLX | Apache-2.0 |
| Qwen/Qwen-Image-2.1 (upstream) | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |

Comparativa con otras familias de modelos de generacion de imagen: no disponible. No se han proporcionado datos de modelos alternativos que permitan contrastar parametros, contexto, rendimiento o calidad.

## Limitaciones y advertencias

- Estado de validacion: la cualificacion en Macs con 8 GB y 16 GB de memoria fisica esta pendiente; las mediciones publicadas corresponden a un unico Mac Studio y a un unico conjunto de configuraciones.
- Dependencia de software no upstream: el checkpoint exige el loader de bajo consumo revisado de Rapid-MLX. Con mflux 0.20.0 estandar no carga, porque esa version omite la cuantizacion del codificador de texto. Esto introduce un riesgo de mantenimiento y de compatibilidad futura.
- Perdida de calidad por cuantizacion: no hay ninguna comparativa publicada de calidad de imagen entre esta version 4-bit y el modelo upstream en precision completa, por lo que el impacto real de la cuantizacion es desconocido.
- Alucinacion y fidelidad al prompt: no se han publicado evaluaciones al respecto en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; habria que remitirse a la documentacion del modelo base Qwen/Qwen-Image-2.1.
- Idiomas: no disponible. No se especifica que idiomas admite el codificador de texto ni si hay degradacion en idiomas distintos del ingles.
- Licencia: Apache-2.0, que permite uso comercial, pero obliga a conservar los avisos de licencia y a revisar las condiciones del modelo upstream y de las dependencias (mflux, MLX).
- Ambito de aplicacion: al ser un modelo de difusion de imagen, no ofrece generacion de texto, razonamiento, codigo ni tool calling; no debe evaluarse con criterios de modelos de lenguaje.
- Numero de descargas y likes en el momento de la consulta: 0, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Qwen-Image-2.1-mflux-q4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Organizacion mlx-community: https://huggingface.co/mlx-community
- Framework MLX: https://mlx-framework.org/
- Repositorio MLX en GitHub: https://github.com/ml-explore/mlx
- MLX en el codigo abierto de Apple: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
