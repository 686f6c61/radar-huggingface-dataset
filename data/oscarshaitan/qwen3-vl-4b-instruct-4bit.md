# OscarShaitan/Qwen3-VL-4B-Instruct-4bit

## Resumen

OscarShaitan/Qwen3-VL-4B-Instruct-4bit es una conversion al formato MLX del modelo Qwen/Qwen3-VL-4B-Instruct, un modelo de vision-lenguaje (image-text-to-text) de la familia Qwen3-VL. La conversion la ha realizado el usuario OscarShaitan y reproduce el trabajo previo de mlx-community, que genero la version cuantizada a 4 bits con la herramienta mlx-vlm en su version 0.3.4. El resultado es un repositorio de 3,1 GB que contiene aproximadamente 4.437 millones de parametros en safetensors, listo para ejecutarse sobre Apple Silicon mediante MLX.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo multimodal de ~4B parametros en hardware de consumo (Mac con memoria unificada) sin depender de GPU NVIDIA ni de servicios en la nube; por otro, la cuantizacion a 4 bits reduce el peso del modelo hasta hacerlo manejable en portatiles. Es relevante ahora porque la familia Qwen3-VL se situa entre las referencias abiertas de vision-lenguaje, y las conversiones MLX permiten integrar ese tipo de capacidades en aplicaciones locales de escritorio con la licencia permisiva Apache 2.0.

La informacion disponible no detalla la longitud de contexto, los idiomas soportados ni la composicion del dataset de entrenamiento. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente o sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision-lenguaje (etiqueta `qwen3_vl`); el detalle interno no se especifica en la informacion disponible |
| Parametros totales | 4.437.815.808 (~4,44 mil millones), segun safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (cuantizacion MLX); no se detallan variantes adicionales |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion proporcionada indica que se trata de un modelo de la familia Qwen3-VL, con soporte de entrada imagen-texto y salida de texto (`pipeline_tag: image-text-to-text`), y que la conversion se ha realizado con mlx-vlm 0.3.4 a partir de Qwen/Qwen3-VL-4B-Instruct. No se detalla en la informacion disponible la arquitectura concreta (dimension del encoder visual, numero de capas del decodificador, tipo de atencion), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Para esos datos hay que remitirse a la model card del modelo original de Qwen.

En cuanto al proceso de conversion, la unica innovacion tecnica documentada es la propia cuantizacion a 4 bits mediante mlx-vlm, que reduce el repositorio a 3,1 GB y permite inferencia en memoria unificada de Apple Silicon. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional, con la etiqueta `conversational` en el repositorio.
- Comprension de imagenes y respuesta en lenguaje natural (image-text-to-text): descripcion de escenas, interpretacion de capturas, diagramas o fotografias.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Inferencia con parametros configurables de generacion (`--max-tokens`, `--temperature`) a traves de la CLI de mlx-vlm.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Cobertura multilingue: no disponible.
- Capacidades especiales (modo thinking, audio, video): no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede recibir la imagen de una factura, un albaran o un formulario y devolver el contenido en texto estructurado, ejecutandose en local para no enviar documentacion sensible a terceros.
- Asistente visual de escritorio en macOS: con 3,1 GB de pesos en 4 bits, puede mantenerse cargado en un Mac con memoria unificada y responder a consultas sobre capturas de pantalla sin conexion a internet.
- Accesibilidad: generacion automatica de descripciones textuales de imagenes para lectores de pantalla o para etiquetado alternativo en sitios web, procesando lotes de imagenes en un equipo de sobremesa.
- Soporte tecnico de primer nivel: interpretar capturas de pantalla de errores enviadas por usuarios y generar una descripcion del problema y posibles causas, como paso previo a la escalada a un tecnico.
- Catalogacion de producto en comercio electronico: a partir de la fotografia de un articulo, generar una descripcion textual base que despues se revisa o se enriquece manualmente.
- Prototipado y evaluacion de pipelines multimodales: sirve como banco de pruebas barato para validar prompts, plantillas de chat y flujos de pre/post-procesado antes de escalar a modelos mayores o a despliegues en servidor.
- Clasificacion y filtrado de contenido visual: generar descripciones normalizadas de imagenes en un pipeline interno que despues aplique reglas de moderacion sobre el texto resultante.
- Analisis de graficos e infografias: extraer tendencias o valores aproximados de una grafica incluida en un informe para generar un resumen textual del mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se aportan mediciones de latencia o throughput. Para datos de rendimiento hay que consultar la model card del modelo original Qwen/Qwen3-VL-4B-Instruct.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,1 GB en disco, por lo que la inferencia en 4 bits requiere del orden de 3-4 GB de memoria solo para los pesos, mas el espacio adicional de la cache KV y de las activaciones (no cuantificado en la informacion disponible).
- Plataforma objetivo: MLX, es decir, chips de Apple Silicon (series M1, M2, M3, M4) con memoria unificada. La libreria MLX no se ejecuta sobre CUDA.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicables directamente a este repositorio en formato MLX; no se documenta ninguna via de despliegue en CUDA.
- Cabe en equipos de consumo: si, en Mac con memoria unificada suficiente (orientativamente 8 GB o mas, aunque no se especifica un minimo oficial en la informacion disponible).
- Opciones de despliegue: `mlx-vlm` mediante la CLI (`python -m mlx_vlm.generate`) o su API de Python. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OscarShaitan/Qwen3-VL-4B-Instruct-4bit | 4,44 B | MLX, 4 bits, 3,1 GB | No disponible | Apache 2.0 | Repositorio propio, 0 descargas |
| mlx-community/Qwen3-VL-4B-Instruct-4bit | 4,44 B (mismo modelo base) | MLX, 4 bits | No disponible | Apache 2.0 | Repositorio de la organizacion mlx-community |
| Qwen/Qwen3-VL-4B-Instruct | 4,44 B | Safetensors en precision original | No disponible en la informacion proporcionada | Apache 2.0 | Repositorio oficial de Qwen |

Las tres entradas corresponden al mismo modelo base: la unica diferencia documentada es el proceso de conversion y el repositorio que lo aloja. No se dispone de datos de rendimiento que permitan comparar la perdida de calidad introducida por la cuantizacion a 4 bits frente al modelo original.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad de las respuestas frente al modelo original en precision completa, especialmente en tareas de OCR fino, lectura de texto pequeno o razonamiento visual detallado. No se aportan mediciones de esa degradacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje: puede describir objetos o texto que no aparecen en la imagen, por lo que no es adecuado como unica fuente en tareas de verificacion documental sin supervision humana.
- El repositorio no es oficial: lo publica el usuario OscarShaitan, no el equipo de Qwen ni la organizacion mlx-community. Conviene comprobar la integridad de los pesos antes de usarlos en produccion.
- Los enlaces de la model card original aparecen vacios (`[Qwen/Qwen3-VL-4B-Instruct]()`), lo que sugiere un README generado automaticamente y poco revisado.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su comportamiento.
- Cobertura de idiomas no declarada: el soporte de castellano no esta confirmado en la informacion disponible y debe verificarse empiricamente.
- Dependencia de plataforma: el formato MLX limita el uso a Apple Silicon; no es directamente portable a CUDA sin una conversion adicional.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia correspondientes. Hay que verificar ademas las condiciones del modelo base Qwen3-VL-4B-Instruct.
- No se documentan limites de contexto, por lo que no puede planificarse el uso con conversaciones o documentos largos sin consultar la model card original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/OscarShaitan/Qwen3-VL-4B-Instruct-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Conversion de referencia en mlx-community: https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-4bit
- Libreria mlx-vlm utilizada en la conversion (referenciada en la model card): https://github.com/Blaizzy/mlx-vlm
