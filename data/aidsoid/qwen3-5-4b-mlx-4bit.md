# aidsoid/Qwen3.5-4B-MLX-4bit

## Resumen

Qwen3.5-4B-MLX-4bit es una version cuantizada a 4 bits del modelo Qwen/Qwen3.5-4B, publicada por el usuario aidsoid y convertida con la libreria mlx-vlm para su ejecucion en Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos pensada para reducir el espacio en disco (aproximadamente 2,9 GB) y el consumo de memoria unificada, manteniendo la licencia Apache 2.0 del modelo original. El repositorio ocupa 3,1 GB e incluye 4.539.265.536 parametros almacenados en safetensors con formato MLX.

El modelo base pertenece a la familia Qwen3.5 de Alibaba, y las etiquetas del repositorio lo identifican como un modelo de vision y lenguaje (vision-language-model), ademas de incluir la etiqueta qwen3_5. La model card unicamente documenta el proceso de conversion, no las caracteristicas del entrenamiento original, por lo que los datos de arquitectura, contexto o idiomas del modelo base no estan disponibles en la informacion proporcionada.

Su relevancia es practica: permite ejecutar localmente un modelo multimodal de ~4,5 mil millones de parametros en un Mac con memoria unificada, sin GPU dedicada, usando el stack MLX en lugar de CUDA. Es una pieza util para prototipado en local, pruebas de inferencia multimodal y desarrollo de aplicaciones de escritorio en el ecosistema Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es Qwen/Qwen3.5-4B, etiquetado como vision-language-model; no se detalla la arquitectura en la informacion disponible) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, 5,347 bits por peso, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | MLX SafeTensors (safetensors, libreria mlx) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base, unicamente el procedimiento de cuantizacion. La model card indica que la conversion se realizo con `mlx-vlm` desde la rama `pc/fix-qwen35-predicate`, que incorpora correcciones para el soporte de Qwen3.5: manejo correcto de las capas de compuerta de MoE (`MoE gate layers`), del parametro `shared_expert_gate` y del casteo de `A_log`. Estos detalles sugieren que el modelo base combina componentes de mezcla de expertos y algun tipo de atencion con estado recurrente, pero no se dispone de especificaciones oficiales sobre numero de capas, cabezas de atencion, tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO. Toda esa informacion queda como no disponible.

En cuanto al proceso de cuantizacion, se aplico cuantizacion de 4 bits con grupo de tamano 64, lo que resulta en una media de 5,347 bits por peso. El comando exacto de conversion fue `python3 -m mlx_vlm convert --hf-path "Qwen/Qwen3.5-4B" --mlx-path "./Qwen3.5-4B-MLX-4bit" -q --q-bits 4 --q-group-size 64`. La inferencia se realiza con el framework mlx-vlm, y no se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto e inferencia multimodal: las etiquetas del repositorio lo clasifican como vision-language-model, y el ejemplo de uso incluido en la model card genera una descripcion a partir de una imagen.
- Procesamiento de imagenes: la API de ejemplo acepta una ruta de imagen junto con un prompt de texto.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican idiomas soportados.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede recibir una imagen y un prompt textual para generar descripciones, tal y como muestra el ejemplo oficial de mlx-vlm. Es adecuado para etiquetado automatico de fotos en un Mac sin depender de servicios en la nube.
- Prototipado de asistentes multimodales en Apple Silicon: al ocupar aproximadamente 2,9 GB en disco, permite iterar sobre prompts y flujos de vision-lenguaje en un portatil Apple sin GPU dedicada.
- Desarrollo de aplicaciones de escritorio con privacidad de datos: la inferencia se ejecuta integramente en el equipo del usuario, lo que resulta util en entornos donde no se pueden enviar imagenes a APIs externas.
- Extraccion de informacion de capturas y documentos escaneados: un modelo de vision-lenguaje de este tamano permite construir pipelines de lectura de documentos donde el texto se obtiene a partir de una imagen, sujeto a las limitaciones de precision de un modelo de 4 bits.
- Evaluacion comparativa de cuantizaciones: el repositorio es util para medir la degradacion de calidad entre la version bf16, la de 8 bits y esta de 4 bits, ya que el autor enlaza las tres variantes.
- Base para experimentacion academica en eficiencia de inferencia: investigadores pueden usar esta conversion para estudiar el equilibrio entre memoria, latencia y calidad en hardware Apple frente a alternativas CUDA.
- Generacion de texto general en local: aunque la informacion disponible no detalla tareas de texto, el modelo base es un modelo de lenguaje y esta conversion puede emplearse en tareas de generacion y resumen ejecutadas en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni para la version cuantizada ni para el modelo base Qwen/Qwen3.5-4B.

## Requisitos de hardware

- VRAM / memoria: al ser un modelo MLX para Apple Silicon, no se aplica el concepto de VRAM dedicada. El repositorio ocupa 3,1 GB y la model card indica un tamano en disco de aproximadamente 2,9 GB, por lo que se recomienda un minimo de 8 GB de memoria unificada y, preferiblemente, 16 GB para dejar margen a la cache KV y al resto del sistema.
- GPU recomendadas: no se aplica a GPUs NVIDIA o AMD; MLX esta disenado para el chip unificado de Apple (series M1, M2, M3 y M4). No hay informacion sobre rendimiento en A100, H100 o RTX 4090, y en principio estas conversiones no son compatibles con CUDA.
- Compatibilidad con GPU de consumo: si, cabe en cualquier Mac con chip de la serie M y memoria unificada suficiente; no esta pensado para GPUs de consumo x86.
- Opciones de despliegue: mlx-vlm (`load` y `generate` en Python, o el CLI `python3 -m mlx_vlm.generate`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aidsoid/Qwen3.5-4B-MLX-4bit | 4.539.265.536 | 4 bits (5,347 bits/peso, grupo 64) | no disponible | Apache 2.0 | MLX SafeTensors, ~2,9 GB en disco |
| mlx-community/Qwen3.5-4B-MLX-8bit | mismo modelo base | 8 bits | no disponible | Apache 2.0 | MLX SafeTensors (referenciado en la model card) |
| mlx-community/Qwen3.5-4B-MLX-bf16 | mismo modelo base | sin cuantizar (bf16) | no disponible | Apache 2.0 | MLX SafeTensors (referenciado en la model card) |
| Qwen/Qwen3.5-4B | mismo modelo base | sin cuantizar | no disponible | Apache 2.0 | Repositorio original en HuggingFace |

No se dispone de datos de rendimiento que permitan comparar la calidad entre estas variantes; la unica diferencia documentada es la precision de la cuantizacion y, en consecuencia, el espacio ocupado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo ni de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como en cualquier modelo de lenguaje, existe riesgo de generar contenido incorrecto, y la cuantizacion a 4 bits puede incrementar la degradacion respecto a la version bf16.
- Perdida de calidad por cuantizacion: con 5,347 bits por peso y grupo de 64, es esperable cierta degradacion frente a las versiones de 8 bits o bf16, aunque no se aportan mediciones.
- Limitaciones de contexto e idioma: no disponibles; no se especifica ventana de contexto ni cobertura linguistica.
- Restricciones de licencia: licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial siempre que se conserven los avisos de licencia y atribucion correspondientes. Conviene verificar los terminos del repositorio original Qwen/Qwen3.5-4B.
- Repositorio con soporte no oficial: el autor indica explicitamente que puede existir una conversion mejor y mas optimizada de @Prince (@Blaizzy) en mlx-community, y que esta version se genero con una rama especifica de mlx-vlm (`pc/fix-qwen35-predicate`) antes de que el soporte oficial de Qwen3.5 se fusionara en la rama principal. Para produccion se recomienda revisar las versiones de mlx-community.
- Inconsistencia en los ejemplos de uso: los fragmentos de codigo de la model card cargan el identificador `mlx-community/Qwen3.5-4B-MLX-4bit`, no el identificador de este repositorio (`aidsoid/Qwen3.5-4B-MLX-4bit`). Es necesario sustituir la ruta por el identificador correcto al usar estos ejemplos.
- Estadisticas de adopcion nulas: el repositorio no registra descargas ni likes en el momento de la consulta, y no hay pipeline declarado, por lo que no existe validacion comunitaria documentada.
- Compatibilidad limitada: al ser una conversion MLX, no es directamente utilizable en stacks CUDA como vLLM, TGI o llama.cpp sin una conversion adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aidsoid/Qwen3.5-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version bf16: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-bf16
- Version de 8 bits: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama de conversion utilizada: https://github.com/Blaizzy/mlx-vlm/tree/pc/fix-qwen35-predicate
- Organizacion mlx-community: https://huggingface.co/mlx-community
- Licencia Apache 2.0: https://huggingface.co/Qwen/Qwen3.5-4B

Nota: los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo; los enlaces devueltos corresponden a foros y guias sobre Facebook, YouTube y Snaptube, por lo que no se han utilizado como fuente.
