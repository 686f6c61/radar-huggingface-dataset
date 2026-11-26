# sam-llm-dev/Llama-3.2-3B-SAM-GGUF

## Resumen

Llama-3.2-3B-SAM (Small Assistant Model) es un ajuste fino mediante QLoRA del modelo `meta-llama/Llama-3.2-3B-Instruct`, desarrollado por el usuario `sam-llm-dev`. Su objetivo declarado es ofrecer explicaciones educativas densas en hechos con un consumo de VRAM reducido, de modo que pueda ejecutarse en hardware de consumo modesto y dispositivos de borde. Se distribuye principalmente en formato GGUF, lo que facilita su despliegue con llama.cpp y herramientas derivadas.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 3B, con 3.212.749.888 parametros totales, y se ha entrenado sobre el dataset propio `sam-llm-dev/SAM-Family-Dataset`. La model card indica que la version v1.1 utiliza un conjunto de entrenamiento deduplicado para aumentar la variedad del ajuste fino. El repositorio ocupa 23,7 GB, lo que sugiere la presencia de multiples cuantizaciones GGUF (FP16, Q8_0, Q4_K_M y posiblemente otras).

Su relevancia actual radica en el nicho de asistentes educativos ligeros: un modelo de 3B parametros que cabe en GPUs de gama de entrada y que prioriza respuestas concisas y factuales. No obstante, los benchmarks publicados por el propio autor muestran un rendimiento limitado en matematicas, y el autor advierte explicitamente de que el modelo no debe usarse para calculos fiables en su version actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 3B: 128k tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Llama 3.2 Community License Agreement |
| Formato de pesos | GGUF (repo con libreria transformers y tags qlora) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only con atencion por grupos (GQA) y RoPE, y se ajusta mediante QLoRA, es decir, cuantizacion del modelo base a 4 bits durante el entrenamiento y adaptadores de bajo rango sobre las capas. No se especifican en la informacion disponible los hiperparametros de entrenamiento (rango LoRA, alpha, tasa de aprendizaje, numero de pasos) ni el volumen exacto de tokens del dataset `SAM-Family-Dataset`.

La model card menciona que la version v1.1 emplea un conjunto de entrenamiento deduplicado para aumentar la variedad. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Tampoco se detalla la composicion del dataset mas alla de su orientacion educativa y conversacional.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Explicaciones educativas concisas y densas en hechos, orientadas a estudiantes y docentes.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Capacidad limitada de matematicas: el autor advierte que no es fiable para calculos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistencia educativa en el aula: el modelo puede generar explicaciones breves y estructuradas de conceptos cientificos o humanisticos, adecuado por su ajuste especifico en pedagogia y su bajo consumo de VRAM para ejecutarse en portatiles de estudiantes.
- Tutoria conversacional en dispositivos de borde: gracias a su huella de 2,5-3,0 GB en Q4_K_M, puede desplegarse en Raspberry Pi con suficiente RAM o en mini-PCs para sesiones de repaso sin conexion.
- Generacion de material de estudio: produccion de resumenes, definiciones y preguntas de autoevaluacion a partir de apuntes, aprovechando su orientacion a respuestas concisas.
- Prototipado rapido de asistentes conversacionales: util como baseline en entornos de investigacion educativa donde se necesita un modelo pequeno y desplegable con llama.cpp u Ollama.
- Filtrado y clasificacion de texto educativo: tareas de etiquetado o reescritura de contenido didactico en pipelines ligeros, aunque sin garantias de tool calling.
- Demostraciones docentes de ajuste fino: sirve como ejemplo practico de QLoRA sobre Llama 3.2 3B en cursos de IA, dado su tamano manejable y su publicacion abierta en Hugging Face.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son una evaluacion propia de 20 preguntas (posiblemente matematicas, dado el aviso), sin especificar el conjunto exacto:

| Variante | Sin Python (estandar) | Con Python (interprete de codigo) |
|---|---|---|
| Llama-3.2-3B-SAM-v1.0-Q4_K_M.gguf | 50,0 % (10/20) | 45,0 % (9/20) |
| Llama-3.2-3B-SAM-v1.0-F16.gguf | 55,0 % (11/20) | 40,0 % (8/20) |
| Llama-3.2-3B-SAM-v1.0-Q8_0.gguf | 25,0 % (5/20) | 35,0 % (7/20) |

El autor reconoce que estos resultados no son optimos y que el modelo no debe usarse para matematicas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada (segun la model card):
  - FP16: ~7,0-7,5 GB
  - Q8_0: ~4,0-4,5 GB
  - Q4_K_M: ~2,5-3,0 GB
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 y GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU de consumo: si, en Q4_K_M practicamente en cualquier GPU con 4 GB o mas; en FP16 requiere al menos 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. Tambien puede cargarse con transformers si se dispone de los pesos en safetensors (no confirmado en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-SAM | 3,21B | no disponible | Llama 3.2 | GGUF | Ajuste educativo QLoRA, solo ingles |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k (segun Meta) | Llama 3.2 | safetensors, GGUF | Modelo base oficial, multilingue |
| Qwen2.5-3B-Instruct | ~3,1B | 32k (segun Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |
| Phi-3.5-mini-instruct | ~3,8B | 128k (segun Microsoft) | MIT | safetensors, GGUF | Orientado a razonamiento y codigo |

Los datos de contexto y licencia de los modelos comparables provienen del conocimiento general de dichos modelos, no de la informacion proporcionada en esta ficha; conviene verificarlos en sus respectivas model cards.

## Limitaciones y advertencias

- Rendimiento matematico deficiente: el propio autor desaconseja su uso para calculos; los benchmarks internos muestran entre 25 % y 55 % de acierto en 20 preguntas.
- Solo ingles declarado: no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion: al ser un ajuste fino sobre un modelo de 3B sin RAG, puede generar afirmaciones incorrectas con tono seguro, especialmente en datos factuales.
- Contexto no documentado: la model card no confirma la ventana de contexto efectiva tras el ajuste.
- Licencia Llama 3.2 Community License: impone restricciones a usuarios con mas de 700 millones de usuarios mensuales, obligaciones de atribucion ("Built with Llama") y sujecion a la politica de uso aceptable de Meta; revisar antes de uso comercial.
- Repositorio de 23,7 GB: incluye multiples cuantizaciones, lo que puede complicar la descarga selectiva; conviene descargar solo el archivo GGUF necesario.
- Version temprana (v1.1): el autor anuncia una v2.0 con RAG y calculadora, lo que indica que la version actual es un trabajo en progreso.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que requieran function calling fiable.

## Enlaces

- Hugging Face: https://huggingface.co/sam-llm-dev/Llama-3.2-3B-SAM-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-llm-dev/SAM-Family-Dataset
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable de Meta: https://www.llama.com/llama3_2/use-policy/
- Contacto del autor: samllmdev@gmail.com
