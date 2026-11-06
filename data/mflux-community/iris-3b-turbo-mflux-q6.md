# mflux-community/iris-3b-turbo-mflux-q6

## Resumen

Iris-3B-Turbo · MFlux Q6 es una conversion cuantizada a 6 bits del modelo de generacion de imagenes speridlabs/iris-3b, empaquetada en formato MLX para su ejecucion nativa en Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una distribucion derivada: los pesos originales se han convertido al framework MLX y se han cuantizado con cuantizacion afin de 6 bits aplicada de forma uniforme al text encoder, al transformer y al VAE. El resultado ocupa 6,4 GB en disco, frente a los 14,0 GB de la version BF16.

La relevancia de esta ficha esta en su caracter practico: permite ejecutar un modelo text-to-image de 3B parametros de forma totalmente local en un Mac, sin dependencia de servicios en la nube ni de GPUs NVIDIA. La conversion la firma MFlux-Community, un colectivo comunitario, y no los autores originales del modelo; la licencia Apache 2.0 del modelo base se mantiene sin cambios. La libreria de referencia es MFlux, que ofrece el comando `mflux-generate-iris` para inferencia directa.

Al ser una variante cuantizada, esta ficha describe tanto el modelo subyacente (iris-3b) como las particularidades de esta distribucion concreta. Los detalles de arquitectura interna, datos de entrenamiento y benchmarks del modelo original no estan documentados en la informacion disponible, por lo que se indican como no disponibles en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para text-to-image (detalle interno no disponible); pesos en MLX |
| Parametros totales | 3B (segun denominacion del modelo base iris-3b) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | Q6 (6 bits, cuantizacion afin MLX) sobre text encoder, transformer y VAE; existen variantes BF16, Q8, Q5, Q4 y Q3 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el modelo card no especifica idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repo | 6,4 GB (Q6) |
| Libreria | mflux |
| Pipeline | text-to-image |
| Modelo base | speridlabs/iris-3b (relacion: quantized) |
| Version de conversion | MFlux 0.24.0, 2026-10-30 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de iris-3b mas alla de su naturaleza como modelo de difusion text-to-image de 3B parametros. Sabemos, por la descripcion de la conversion, que el pipeline consta de tres componentes diferenciados: un text encoder, un transformer (el denoiser de difusion) y un VAE. Los tres han sido cuantizados a 6 bits con cuantizacion afin de MLX. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino por preferencias.

La innovacion tecnica de esta distribucion no reside en el entrenamiento sino en la portabilidad: la conversion a MLX permite ejecutar el modelo de forma nativa en Apple Silicon, aprovechando la memoria unificada del chip. El nivel de cuantizacion queda almacenado en los propios pesos, de modo que no es necesario pasar el flag `--quantize` en la inferencia. El sufijo "Turbo" en el nombre sugiere una variante optimizada para pocos pasos de muestreo, aunque la informacion disponible no confirma el numero de pasos ni la tecnica de destilacion empleada.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) en resoluciones configurables, con 1024x1024 como ejemplo en la documentacion.
- Control de semilla (`--seed`) para reproducibilidad de la generacion.
- Control de dimensiones de salida mediante `--width` y `--height`.
- Ejecucion local en Apple Silicon mediante MLX, sin GPU dedicada.
- Cuantizacion integrada en los pesos: no requiere configuracion adicional en tiempo de inferencia.
- Variantes de cuantizacion disponibles (BF16, Q8, Q6, Q5, Q4, Q3) para ajustar el equilibrio entre calidad y uso de memoria.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking, ya que es un modelo generativo de imagen y no un modelo de lenguaje.

## Casos de uso

- Generacion de ilustraciones locales en Mac: un desarrollador puede generar imagenes de 1024x1024 desde la terminal con `mflux-generate-iris`, sin enviar prompts a servicios externos, lo que resulta adecuado para contenido sensible o trabajo offline.
- Prototipado rapido de assets para aplicaciones: equipos de producto pueden iterar sobre conceptos visuales con semillas fijas para comparar variaciones de forma reproducible antes de encargar arte final.
- Creacion de imagenes para documentacion tecnica y blogs: la licencia Apache 2.0 permite incorporar las salidas a materiales publicados, siempre que se respeten los terminos del modelo base.
- Entornos con restricciones de privacidad: al ejecutarse integramente en local sobre memoria unificada, los prompts y las imagenes no salen del equipo, lo que encaja en flujos con datos confidenciales.
- Desarrollo y pruebas de pipelines de difusion: investigadores pueden usar las distintas variantes de cuantizacion (Q3 a BF16) para medir el impacto de la precision en la calidad de salida sobre el mismo modelo.
- Educacion y experimentacion con MLX: sirve como ejemplo practico de conversion, cuantizacion y despliegue de un modelo de difusion en el ecosistema MLX para quienes aprenden a portar modelos a Apple Silicon.
- Generacion de variaciones controladas por semilla en entornos de test: util para pruebas automatizadas de interfaces que consumen imagenes generadas, donde la reproducibilidad es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score u otras), ni comparaciones cuantitativas entre las distintas variantes de cuantizacion.

## Requisitos de hardware

- VRAM/memoria: al ejecutarse en Apple Silicon con memoria unificada, el modelo Q6 ocupa 6,4 GB de pesos; se recomienda disponer de al menos 8-10 GB de memoria unificada libre para margen de trabajo durante la inferencia.
- GPU recomendadas: no aplica GPU NVIDIA; el modelo esta disenado para chips Apple Silicon (serie M). No se especifican modelos concretos de chip en la informacion disponible.
- Cabe en hardware de consumo: si, en equipos Mac con Apple Silicon y memoria unificada suficiente; las variantes Q4 (5,1 GB) y Q3 (4,3 GB) reducen el requisito.
- Opciones de despliegue: MFlux (libreria nativa), instalable con `uv tool install --upgrade mflux`; el modelo puede descargarse con `hf download` para uso local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de difusion en formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| iris-3b-turbo-mflux-q6 (este) | 3B | MLX (Apple Silicon) | 6,4 GB | apache-2.0 | Conversion comunitaria Q6 |
| iris-3b-turbo-mflux-bf16 | 3B | MLX (Apple Silicon) | 14,0 GB | apache-2.0 | Misma conversion sin cuantizar |
| iris-3b-turbo-mflux-q4 | 3B | MLX (Apple Silicon) | 5,1 GB | apache-2.0 | Menor huella, mayor perdida de precision |
| speridlabs/iris-3b (original) | 3B | Formato original del autor | no disponible | apache-2.0 | Modelo base sin conversion MLX |

No se dispone de informacion sobre otros modelos text-to-image de 3B comparables en la documentacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Es una conversion comunitaria, no una release oficial de los autores de iris-3b; la calidad y el comportamiento pueden diferir del original.
- La cuantizacion a 6 bits puede introducir perdida de calidad frente a la version BF16; no se han publicado metricas que cuantifiquen esa diferencia.
- No se documentan sesgos conocidos, pero al ser un modelo de difusion entrenado con datos no especificados, es probable que reproduzca sesgos presentes en su dataset de entrenamiento; se recomienda evaluacion propia antes de uso en produccion.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir contenido incoherente o no fiel al prompt.
- No se especifican los idiomas soportados para los prompts; la cobertura linguistica es desconocida.
- La licencia Apache 2.0 permite uso comercial, pero se remite a la model card del modelo base para terminos y posibles restricciones adicionales.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon; no es desplegable en GPUs NVIDIA ni en entornos x86 sin conversion adicional.
- El numero de pasos de muestreo y la tecnica "Turbo" no estan documentados, lo que dificulta estimar tiempos de generacion.
- Repositorio con muy baja adopcion (21 descargas, 0 likes) en el momento de la consulta; menor probabilidad de soporte comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q6
- Modelo base: https://huggingface.co/speridlabs/iris-3b
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q8
- Variante Q5: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q3
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
