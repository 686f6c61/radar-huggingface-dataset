# coldfusion000/smol-course-SmolVLM2-2.2B-Instruct-trl-sft-ChartQA

## Resumen

El modelo `coldfusion000/smol-course-SmolVLM2-2.2B-Instruct-trl-sft-ChartQA` es un ajuste fino (fine-tuning) supervisado del modelo de vision-lenguaje HuggingFaceTB/SmolVLM2-2.2B-Instruct, entrenado con la libreria TRL de Hugging Face mediante SFT (supervised fine-tuning). Lo publica el usuario coldfusion000 y su nombre indica que el ajuste se ha realizado sobre datos del tipo ChartQA, un conjunto de preguntas y respuestas sobre graficos y diagramas, por lo que el objetivo declarado es especializar el modelo base en la comprension y el razonamiento sobre graficos.

Se trata de un modelo compacto de 2.249.353.072 parametros (aproximadamente 2.2B), con pesos en formato safetensors y un tamano de repositorio de 4.5 GB. Conserva la arquitectura multimodal del modelo base SmolVLM2, que combina un codificador visual con un backbone de lenguaje de la familia SmolLM2, de modo que puede procesar tanto texto como imagenes.

Su relevancia es limitada y de caracter practico: parece un artefacto de aprendizaje generado dentro del programa educativo Smol Course de Hugging Face, orientado a demostrar el flujo de trabajo de ajuste fino con TRL sobre un modelo de vision-lenguaje pequeno. No dispone de resultados de benchmarks publicados, no tiene descargas ni likes, y su model card es minima, por lo que debe tratarse como un modelo experimental mas que como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivada de SmolVLM2; codificador visual SigLIP mas backbone de lenguaje SmolLM2 (base) |
| Parametros totales | 2.249.353.072 (aprox. 2.2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base declara soporte de contexto largo; no se confirma cifra en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no incluye GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card contiene el marcador de posicion "licence: license"); el modelo base SmolVLM2-2.2B-Instruct se publica bajo Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del checkpoint HuggingFaceTB/SmolVLM2-2.2B-Instruct, un modelo de vision-lenguaje de ~2.2B parametros construido sobre un codificador visual SigLIP y un modelo de lenguaje de la familia SmolLM2. Este diseno permite que el modelo reciba como entrada una o varias imagenes junto con texto y genere la respuesta en lenguaje natural correspondiente. El ajuste fino no altera la arquitectura del modelo base; unicamente actualiza los pesos para especializarlos en la tarea objetivo.

El entrenamiento se ha realizado con la libreria TRL (version 1.14.2) bajo el flujo de SFT, con Transformers 5.18.0, PyTorch 2.14.1, Datasets 5.0.1 y Tokenizers 0.23.2. El nombre del repositorio sugiere que el conjunto de datos empleado corresponde a ChartQA, si bien la model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, el uso de LoRA u otras tecnicas de eficiencia, ni si hubo etapas posteriores de RLHF o DPO. No se describen innovaciones tecnicas adicionales mas alla del ajuste supervisado estandar.

## Capacidades

- Procesamiento conjunto de imagen y texto (entrada multimodal), heredado del modelo base SmolVLM2.
- Preguntas y respuestas sobre graficos y diagramas (si el ajuste sobre ChartQA ha funcionado segun lo previsto): lectura de ejes, leyendas, tendencias y comparacion de valores.
- Generacion de texto descriptivo y explicativo sobre el contenido de una imagen.
- Razonamiento visual de caracter basico apoyado en la imagen de entrada.
- Conversacion multi-turno sobre una o varias imagenes, siempre que el modelo base lo soporte.
- Capacidad multilingue: no disponible (la model card no documenta los idiomas soportados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de "pensamiento" explicito o capacidades de audio: no disponibles.

## Casos de uso

- Analisis de informes financieros con graficos: el modelo podria recibir capturas de diagramas de ingresos o margenes y responder preguntas concretas sobre valores y tendencias, aprovechando su ajuste sobre datos tipo ChartQA.
- Extraccion de datos de paneles de control (dashboards): conversion de graficos de barras o lineas en descripciones textuales para alimentar informes automaticos.
- Asistencia educativa en interpretacion de graficos: un estudiante sube un diagrama de un libro de texto y el modelo explica la relacion entre variables.
- Generacion de resumenes de figuras cientificas: procesar figuras de articulos o papers y producir una descripcion escrita de lo que muestran.
- Accesibilidad: describir graficos a personas con discapacidad visual mediante texto claro derivado de la imagen.
- Preprocesado en pipelines de datos: usar el modelo como primer filtro para etiquetar o describir imagenes de graficos dentro de un flujo mas amplio de analitica.
- Prototipado y aprendizaje: emplearlo como ejemplo de referencia en ejercicios de fine-tuning con TRL y LoRA dentro del Smol Course.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 4.5 GB para los pesos, cifra coherente con el tamano del repositorio (4.5 GB); hay que anadir memoria para activaciones, especialmente al procesar imagenes de resolucion alta.
- VRAM estimada en int8: aproximadamente 2.3 GB de pesos mas activaciones.
- VRAM estimada en int4: aproximadamente 1.2 GB de pesos mas activaciones.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB de VRAM o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para inferencia en cuantizacion o precision media.
- GPU recomendadas: RTX 3090/4090 para uso local comodo; A100 o H100 para despliegue en servidor y mayor concurrencia.
- Opciones de despliegue: Transformers (biblioteca con la que se publica el modelo); vLLM y TGI si la version soporta arquitecturas de vision-lenguaje similares; llama.cpp y Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smol-course-...-ChartQA (este modelo) | 2.2B | no disponible | no disponible | Repositorio Hugging Face sin descargas | Ajuste comunitario sobre SmolVLM2 para tareas tipo ChartQA; sin benchmarks publicados |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2.2B | no disponible (soporte de contexto largo declarado por el autor) | Apache-2.0 | Modelo oficial ampliamente utilizado | Modelo base del que deriva este ajuste; incluye pesos y documentacion completos |
| Qwen2-VL-2B | 2B | no disponible | Apache-2.0 | Modelo oficial muy difundido | Alternativa ligera de vision-lenguaje con soporte multimodal y comunidad amplia |
| moondream2 | ~1.9B | no disponible | Apache-2.0 | Modelo oficial con bastante adopcion | Modelo de vision-lenguaje compacto orientado a tareas de descripcion y pregunta-respuesta sobre imagenes |

## Limitaciones y advertencias

- Model card minima: no documenta dataset de entrenamiento, hiperparametros, idiomas, licencia real ni evaluacion, lo que dificulta reproducir o auditar el ajuste.
- Licencia sin definir: el campo de licencia aparece como marcador de posicion ("licence: license"), por lo que el uso comercial no esta claramente autorizado aunque el modelo base sea Apache-2.0; conviene verificar antes de cualquier despliegue productivo.
- Riesgo de alucinacion: como cualquier modelo de vision-lenguaje de ~2.2B, puede inventar valores, etiquetas o relaciones en graficos, especialmente con imagenes de baja resolucion o con ejes poco legibles.
- Rendimiento especializado limitado: el ajuste se ha realizado sobre un unico dominio (graficos), lo que puede degradar capacidades generales del modelo base.
- Sesgos: no documentados ni evaluados por el autor; se heredan los posibles sesgos del modelo base y del dataset de ajuste.
- Contexto e idiomas: no confirmados en la informacion proporcionada; no se garantiza un comportamiento correcto en castellano ni en conversaciones de muchos turnos.
- Cero adopcion: no tiene descargas ni likes, por lo que no existe validacion externa ni casos de uso probados en produccion.
- Fecha de publicacion inusual en los metadatos (2026), lo que refuerza su caracter de artefacto experimental.
- No apto para decisiones criticas sin supervision humana (por ejemplo, analisis financiero o medico basado en graficos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coldfusion000/smol-course-SmolVLM2-2.2B-Instruct-trl-sft-ChartQA
- Modelo base SmolVLM2-2.2B-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Libreria TRL: https://github.com/huggingface/trl
- Smol Course, unidad 4 (ejercicios de fine-tuning de SmolVLM2-2.2B-Instruct): https://huggingface.co/learn/smol-course/unit4/4
- Smol Course, unidad 3 (fine-tuning con LoRA sobre llava-instruct-mix): https://huggingface.co/learn/smol-course/en/unit3/4.md
- Notebook del Smol Course (ejercicio 4): https://colab.research.google.com/github/huggingface/smol-course/blob/main/notebooks/4/4.ipynb
- Repositorio smol-course en GitHub: https://github.com/huggingface/smol-course
