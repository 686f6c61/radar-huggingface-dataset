# npario/OXR-1.0-mlx-8bit

## Resumen

OXR-1.0-mlx-8bit es una conversion comunitaria no oficial del modelo de parsing de documentos OXR-1.0 de SoMark, empaquetada en formato MLX de 8 bits para su ejecucion en Apple Silicon mediante la libreria mlx-vlm. El modelo original, desarrollado por el equipo de SoMark, es un modelo vision-lenguaje de 1.300 millones de parametros especializado en reconocimiento optico de caracteres (OCR) y parsing estructurado de documentos, y segun su model card ocupa el primer puesto en los benchmarks olmOCR-Bench, OmniDocBench y DocParsingBench.

La relevancia de esta conversion radica en que permite ejecutar localmente en un Mac con chip Apple Silicon un modelo de parsing documental de alta calidad, sin necesidad de GPU dedicada ni de infraestructura en la nube. El decoder Qwen3 se cuantiza a 8 bits afines con tamano de grupo 64, mientras que el tokenizador visual (ViT, cabeza visual y tabla de embeddings visuales) se mantiene en bfloat16, lo que da un repositorio de 2,1 GB.

El modelo resuelve tareas de extraccion estructurada a partir de imagenes de documentos: texto y manuscrito, formulas en LaTeX/KaTeX, tablas en HTML, codigo en Markdown, estructuras quimicas en SMILES y paginas completas. Es una pieza adecuada para pipelines de digitalizacion de documentos, procesamiento de facturas, articulos cientificos y formularios, con la salvedad de que se trata de una conversion no oficial y de que su licencia impone restricciones comerciales especificas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: tokenizador visual (ViT) + decoder transformer Qwen3 |
| Parametros totales | 1.378.793.448 (aproximadamente 1,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afines, group size 64 (decoder); ViT, cabeza visual y embedding visual en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | OXR Open Source License (Apache-2.0 con terminos adicionales) |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 2,1 GB (2,2 GB segun Hugging Face) |
| Modelo base | SoMarkAI/OXR-1.0 (1.3B, BF16) |
| Libreria | mlx / mlx-vlm |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura combina un tokenizador visual basado en ViT con un decoder de la familia Qwen3 de aproximadamente 1.300 millones de parametros. En esta conversion MLX, el decoder se cuantiza a 8 bits con tamano de grupo 64, mientras que los componentes visuales (ViT, cabeza visual y tabla de embeddings visuales) permanecen en bfloat16 para preservar la calidad de la representacion de imagen. La conversion se realizo con la herramienta `mlx_vlm.convert` usando los parametros `-q --q-bits 8 --q-group-size 64`.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card del autor de la conversion remite al repositorio oficial de SoMark para los detalles del entrenamiento original. La innovacion destacable de esta version es la propia conversion a MLX: segun el autor, el decoder de 8 bits es aproximadamente un 35 % mas rapido en salidas largas que la version bf16, aunque no se ha ejecutado un benchmark completo sobre los pesos cuantizados.

## Capacidades

- Reconocimiento de texto impreso y manuscrito a partir de imagenes de documentos.
- Conversion de formulas matematicas a formato LaTeX/KaTeX.
- Conversion de tablas a HTML estructurado.
- Extraccion de codigo presente en imagenes a bloques Markdown.
- Reconocimiento de estructuras quimicas y conversion a SMILES.
- Parsing de pagina completa, incluyendo analisis de maquetacion, reconocimiento por bloques y orden de lectura mediante el pipeline oficial de OXR.
- Conversacion multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de articulos cientificos: el modelo convierte formulas y tablas de PDFs escaneados a LaTeX y HTML respectivamente, lo que permite reconstruir documentos academicos en formatos editables. Es adecuado por su especializacion en formulas y su buen rendimiento en el subconjunto ArXiv de olmOCR-Bench (91,2).
- Procesamiento de facturas y formularios: el pipeline de parsing de pagina completa analiza la maquetacion, identifica bloques y extrae el contenido en orden de lectura, lo que facilita la conversion de documentos administrativos a datos estructurados.
- Extraccion de tablas de informes financieros: la tarea de tabla a HTML permite recuperar la estructura de tablas complejas; en la validacion del autor, una tabla HTML compleja de 3.603 tokens se genero de forma identica a la conversion bf16.
- Reconocimiento de manuscritos y documentos historicos: el modelo soporta la tarea de texto y manuscrito, y en el benchmark obtiene 58,9 en Old Scans y 89,3 en Old Scans Math, lo que lo hace util para archivos y digitalizacion patrimonial.
- Conversion de capturas de codigo a Markdown: la tarea de reconocimiento de codigo permite extraer fragmentos de codigo desde imagenes o capturas de pantalla a bloques Markdown, util en documentacion tecnica y tutoriales.
- Reconocimiento de estructuras quimicas: la conversion a SMILES facilita la digitalizacion de figuras de moleculas en articulos de quimica y su integracion en bases de datos quimicas.
- Ejecucion local en Mac para privacidad de datos: al funcionar sobre Apple Silicon con MLX, permite procesar documentos sensibles sin enviarlos a servicios en la nube, lo que resulta relevante en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Los datos de benchmark disponibles corresponden al pipeline completo de OXR con backend MLX en bf16, evaluado sobre olmOCR-Bench (evaluador oficial `olmocr==0.4.27`, 596 paginas y 3.849 tests). La comparacion es entre la ejecucion MLX en bf16 y las cifras reportadas para OXR-1.0 original.

| Subconjunto | MLX bf16 | OXR-1.0 reportado |
|---|---|---|
| Global | 87,6 ± 1,0 | 87,84 |
| ArXiv | 91,2 | 92,76 |
| Headers/Footers | 95,8 | 94,34 |
| Long Tiny Text | 91,0 | 90,95 |
| Multi Column | 84,1 | 85,18 |
| Old Scans | 58,9 | 59,32 |
| Old Scans Math | 89,3 | 89,74 |
| Tables | 93,3 | 93,05 |
| Baseline | 97,1 | 97,35 |

No se ha ejecutado un benchmark completo sobre los pesos cuantizados a 8 bits; el autor indica que el decoder de 8 bits es aproximadamente un 35 % mas rapido en salidas largas y recomienda el repositorio bf16 cuando la exactitud sea critica. En la validacion cualitativa, las salidas greedy comparadas con la implementacion de referencia en PyTorch (fp32, CPU) fueron identicas a la conversion bf16 en 5 de 6 muestras, incluyendo salidas de 1.859 y 3.603 tokens; una muestra de manuscrito difiere en una palabra.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,1 GB en disco; en memoria unificada se necesita espacio adicional para el contexto y las activaciones, por lo que se recomienda disponer de al menos 8 GB de memoria unificada para uso comodo.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) mediante MLX. No esta pensado para GPU NVIDIA ni AMD.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPUs dedicadas convencionales por el backend MLX.
- Opciones de despliegue: mlx-vlm (requiere una build con soporte de OXR; en el momento de la conversion el PR #2560 estaba pendiente y se indicaba instalar la rama `add-oxr`), servidor compatible con OpenAI sobre MLX para el pipeline completo. vLLM, llama.cpp, Ollama y TGI no aplican a esta conversion MLX.
- Latencia y throughput: no se proporcionan cifras absolutas; el autor indica que el decoder de 8 bits es aproximadamente un 35 % mas rapido en salidas largas que la version bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/backend | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OXR-1.0-mlx-8bit (este) | 1,3B | MLX 8 bits, Apple Silicon | no disponible | OXR Open Source License | Hugging Face (comunidad) |
| SoMarkAI/OXR-1.0 | 1,3B | BF16, PyTorch/vLLM | no disponible | OXR Open Source License | Hugging Face (oficial) |
| Otras alternativas de parsing documental | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de parsing documental en la informacion proporcionada. La comparacion mas directa es con el modelo base oficial OXR-1.0 en BF16, que ofrece mayor exactitud potencial a costa de mayor tamano y de no estar optimizado para Apple Silicon.

## Limitaciones y advertencias

- Conversion no oficial: se trata de una conversion comunitaria; todo el credito del modelo corresponde a SoMark y el soporte depende del autor de la conversion.
- Dependencia de una build no publicada de mlx-vlm: en el momento de la conversion, el soporte de OXR en mlx-vlm estaba en un PR pendiente (#2560), lo que obliga a instalar una rama especifica.
- Sin benchmark completo en 8 bits: las cifras de olmOCR-Bench se midieron con pesos bf16; la cuantizacion a 8 bits puede introducir diferencias menores de exactitud.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto en documentos de baja calidad, manuscritos dificiles o maquetaciones complejas; el subconjunto Old Scans obtiene solo 58,9, lo que indica menor fiabilidad en escaneos antiguos.
- Idiomas soportados no documentados: no se especifica que lenguas cubre el modelo, por lo que conviene validar el rendimiento en el idioma de destino antes de produccion.
- Restricciones de licencia: uso comercial permitido solo por debajo de 2 millones de USD de financiacion total y 2 millones de USD de ingresos anuales; por encima se requiere licencia comercial de SoMark. Los servicios en linea deben identificar de forma destacada "SoMark OXR" y no se permite ofrecer una API alojada que compita con la de SoMark.
- Entorno limitado a Apple Silicon: no es desplegable en infraestructura NVIDIA/AMD sin recurrir al modelo base en otro formato.
- Contexto maximo no documentado: se desconoce la ventana de contexto, lo que limita la planificacion de documentos muy largos.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/npario/OXR-1.0-mlx-8bit
- Modelo base oficial: https://huggingface.co/SoMarkAI/OXR-1.0
- Repositorio oficial de OXR: https://github.com/SoMarkAI/OXR
- Licencia: https://github.com/SoMarkAI/OXR/blob/main/LICENSE
- Sitio de SoMark: https://somark.ai
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- PR de soporte de OXR en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/2560
- Rama de mlx-vlm con soporte de OXR: https://github.com/bxespinozar/mlx-vlm/tree/add-oxr
