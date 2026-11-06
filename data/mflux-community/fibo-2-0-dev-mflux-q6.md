# mflux-community/fibo-2-0-dev-mflux-q6

## Resumen

Fibo-2.0-dev MFlux Q6 es una conversion comunitaria del modelo de generacion de imagenes Fibo-2.0-dev de Bria AI, empaquetada para su ejecucion local en Mac mediante MLX, el framework de Apple Silicon. El repositorio lo mantiene mflux-community, un colectivo independiente que adapta modelos generativos de ultima generacion al ecosistema MFlux, y no constituye una publicacion oficial de los autores originales del modelo.

La variante Q6 aplica cuantizacion afina de 6 bits de MLX sobre los tres componentes del pipeline (codificador de texto, transformer y VAE), reduciendo el peso del repositorio a 10,3 GB frente a los 25,1 GB de la version BF16. Esto permite ejecutar un modelo de texto-a-imagen de gama alta en equipos Apple Silicon con memoria unificada moderada, sin necesidad de GPUs dedicadas ni de servicios en la nube.

Es relevante para desarrolladores que trabajan en macOS y necesitan inferencia local de generacion de imagenes con privacidad de datos, sin latencia de red y sin coste por llamada. La ficha se centra en esta conversion cuantizada; los detalles arquitectonicos del modelo original no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline texto-a-imagen (codificador de texto + transformer + VAE); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6 (6 bits, cuantizacion afina MLX); existen variantes BF16, Q8, Q5, Q4 y Q3 en el mismo espacio de nombres |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el codificador de texto determina los idiomas efectivos) |
| Licencia | fibo-2.0-dev-license (licencia del modelo original, heredada sin cambios) |
| Formato de pesos | safetensors (MLX, cuantizacion de 6 bits embebida en los pesos) |

Otros datos tecnicos: tamano del repositorio 10,3 GB, libreria mflux, version de conversion MFlux 0.23.0, fecha de conversion 2026-10-25, modelo base briaai/Fibo-2.0-dev.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Fibo-2.0-dev ni su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se conoce es la estructura del pipeline tal como la expone MFlux: un codificador de texto, un transformer generativo y un VAE, los tres cuantizados de forma independiente a 6 bits mediante cuantizacion afina de MLX.

La innovacion tecnica de esta publicacion no reside en el modelo base, sino en el proceso de conversion: MFlux reimplementa el pipeline en MLX nativo para Apple Silicon y almacena el nivel de cuantizacion directamente en los pesos, de modo que el usuario no necesita pasar ningun flag de cuantizacion en tiempo de inferencia. La conversion la realizo MFlux-Community con la version 0.23.0 de la herramienta y modifica los pesos originales unicamente por conversion de formato y cuantizacion.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resoluciones configurables; el ejemplo de la model card usa 1024x1024.
- Control de semilla para reproducibilidad de resultados (`--seed`).
- Ejecucion totalmente local en Apple Silicon mediante MLX, sin dependencia de servicios externos.
- Inferencia nativa en Mac a traves de la CLI `mflux-generate-fibo2`.
- Seleccion de variante de cuantizacion segun el presupuesto de memoria del equipo (de Q3 a BF16).
- No se documentan en la informacion disponible capacidades de edicion de imagen, inpainting, control por imagen de referencia, tool calling ni modos de razonamiento.

## Casos de uso

- Generacion de ilustraciones para prototipos de producto: un disenador puede lanzar lotes de imagenes desde la CLI con prompts y semillas fijas para explorar variaciones de concepto sin salir del Mac ni enviar material confidencial a terceros.
- Creacion de assets para videojuegos y contenidos interactivos: la ejecucion local permite iterar sobre bocetos de personajes y escenarios en un flujo de trabajo por linea de comandos integrable en scripts de build.
- Generacion de material visual para documentacion tecnica y blogs: el modelo produce imagenes de acompanamiento a partir de descripciones textuales, con la ventaja de que el contenido no abandona la maquina del autor.
- Prototipado rapido en investigacion de modelos generativos: al ser una conversion MLX cuantizada, sirve para medir el impacto de la cuantizacion de 6 bits en la calidad de salida comparandola con las variantes Q8 y BF16 del mismo espacio de nombres.
- Flujos de trabajo con requisitos de privacidad: estudios juridicos, sanitarios o de defensa pueden generar imagenes internas sin exponer prompts ni datos a APIs en la nube, ya que todo el pipeline corre en local.
- Automatizacion de catalogos y mockups: scripts que invocan `mflux-generate-fibo2` con listas de prompts pueden producir variaciones de producto o composiciones de escaparate de forma desatendida en un Mac de sobremesa.
- Docencia y demostraciones: al instalarse con una sola orden (`uv tool install mflux`) y descargar los pesos bajo demanda, es adecuado para talleres practicos sobre generacion de imagenes en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score, etc.), comparaciones con el modelo original en BF16 ni mediciones de latencia o throughput para esta variante Q6.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 10,3 GB; se recomienda disponer de al menos 16 GB de memoria unificada para cargar los pesos y el estado de inferencia con margen, aunque el requisito exacto no esta documentado.
- Hardware objetivo: equipos Apple Silicon (serie M). No se soportan GPUs NVIDIA ni AMD a traves de esta conversion, que es especifica de MLX.
- Cabe en GPU de consumo: si, en Mac con chip Apple Silicon; las variantes Q4 (7,2 GB) y Q3 (5,6 GB) reducen aun mas el requisito para equipos con menos memoria.
- Opciones de despliegue: CLI de MFlux (`mflux-generate-fibo2`), instalable con `uv tool install --upgrade mflux`; descarga de pesos con `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fibo-2.0-dev MFlux Q6 (este) | no disponible | no disponible | safetensors MLX 6 bits, 10,3 GB | fibo-2.0-dev-license | Hugging Face, 107 descargas |
| Fibo-2.0-dev MFlux BF16 | no disponible | no disponible | safetensors MLX BF16, 25,1 GB | fibo-2.0-dev-license | Hugging Face |
| Fibo-2.0-dev MFlux Q4 | no disponible | no disponible | safetensors MLX 4 bits, 7,2 GB | fibo-2.0-dev-license | Hugging Face |
| briaai/Fibo-2.0-dev (original) | no disponible | no disponible | no disponible | fibo-2.0-dev-license | Hugging Face |

La comparativa mas directa es con las otras variantes de cuantizacion del mismo modelo: Q6 ofrece un equilibrio entre fidelidad y tamano (10,3 GB) frente a BF16 (25,1 GB) y Q4 (7,2 GB). No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre variantes ni con otros modelos de texto-a-imagen de la competencia.

## Limitaciones y advertencias

- Conversion no oficial: la publica mflux-community, no Bria AI; los autores originales no la respaldan y no hay garantia de equivalencia funcional con el modelo base.
- Licencia restrictiva potencial: la fibo-2.0-dev-license puede imponer condiciones al uso comercial; es obligatorio revisar los terminos completos en la model card del modelo original antes de desplegar en produccion.
- Cuantizacion con perdida: la cuantizacion de 6 bits puede degradar la calidad de imagen respecto a BF16; no se documenta la magnitud de esa perdida.
- Exclusivo de Apple Silicon: no es utilizable en GPUs NVIDIA, AMD ni en servidores Linux convencionales, lo que limita su uso en infraestructura de produccion estandar.
- Idiomas no documentados: se desconoce que lenguas comprende el codificador de texto; los prompts en castellano pueden rendir peor que en ingles.
- Riesgo de sesgos y alucinacion visual: como cualquier modelo generativo, puede producir contenido estereotipado, inexacto o inapropiado; no se documentan filtros de seguridad en esta conversion.
- Sin garantias de soporte: al ser un repositorio comunitario con 0 likes y 107 descargas, la probabilidad de mantenimiento y actualizaciones es incierta.
- Ausencia de datos de rendimiento: no hay benchmarks publicados que permitan validar la calidad antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q6
- Modelo original: https://huggingface.co/briaai/Fibo-2.0-dev
- Licencia del modelo original: https://huggingface.co/briaai/Fibo-2.0-dev
- MFlux (implementacion MLX): https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q8
- Variante Q5: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q3
