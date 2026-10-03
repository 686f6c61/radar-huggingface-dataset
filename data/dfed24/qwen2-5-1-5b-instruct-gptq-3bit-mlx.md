# dfed24/Qwen2.5-1.5B-Instruct-gptq-3bit-mlx

## Resumen

Este repositorio contiene una cuantización a 3 bits del modelo Qwen2.5-1.5B-Instruct, empaquetada específicamente para el framework MLX de Apple. El autor es Domenic Federico (usuario dfed24), estudiante de grado en Cal Poly San Luis Obispo, y no guarda relación con Alibaba, que es quien desarrolla el modelo base original. El objetivo es ofrecer una versión que ocupe menos de 800 MB manteniendo la mayor fidelidad posible respecto al modelo en fp16, algo relevante para desplegar asistentes conversacionales en portátiles con memoria unificada limitada.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only denso de 1.543.714.304 parámetros, con ventana de contexto de hasta 128.000 tokens y entrenamiento sobre 18 billones de tokens. Esta versión concreta aplica GPTQ de 3 bits con tamaño de grupo 64 y embeddings vinculados de 8 bits, sobre un grid fit alternante por grupo, un refinamiento por descenso de coordenadas sobre el objetivo de capa y un refit por mínimos cuadrados de cada grupo. El resultado son 794 MB de pesos en formato safetensors MLX.

Su relevancia es doble: por un lado permite ejecutar un modelo instruct de 1,5B parámetros en equipos Apple Silicon con un consumo de memoria muy reducido; por otro, documenta una receta de cuantización reproducible que mejora la perplejidad de alternativas estándar de 3 y 4 bits, con scripts enlazados y todas las cifras verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), heredada del modelo base |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GPTQ de 3 bits, tamano de grupo 64, embeddings vinculados de 8 bits, pesos en float16; 3,5 bits por peso efectivos |
| Idiomas soportados | heredados del modelo base Qwen2.5, que declara soporte multilingue (mas de 29 idiomas); no disponibles en los metadatos de este repositorio |
| Licencia | apache-2.0 (sigue los terminos del modelo base) |
| Formato de pesos | safetensors en formato MLX, 794 MB, disenado para la libreria mlx-lm |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen2.5-1.5B-Instruct, por lo que conserva la topologia del original: transformer decoder-only denso con atencion causal, sin mezcla de expertos ni capas de estado (SSM). El proceso de cuantizacion parte de los pesos en fp16 y aplica redondeo con retroalimentacion de error (GPTQ) sobre grupos de 64 elementos, con embeddings vinculados cuantizados a 8 bits. Sobre esa base, el pipeline del autor anade tres pasos documentados: un ajuste alternante de la rejilla (grid fit) por grupo, un refinamiento de los codigos mediante descenso de coordenadas optimizando el objetivo de cada capa, y un refit por minimos cuadrados de la rejilla de cada grupo bajo el mismo objetivo. El autor indica que el grid fit y el refit ponderado fueron disenados por el mismo, con Claude (Anthropic) como asistente de programacion e investigacion.

No hay informacion sobre reentrenamiento, ajuste fino adicional ni etapas de RLHF/DPO especificas de esta cuantizacion; el alineamiento conversacional proviene integramente del modelo base. El unico dato de evaluacion publicado es la perplejidad sobre WikiText-2: con 20 ventanas de 2048 tokens, el modelo cuantizado alcanza 10,38 frente a 9,38 del fp16, y mejora tanto al 4-bit round-to-nearest de mlx-lm (10,67) como al AWQ de 3 bits de mlx-lm (12,43) y al GPTQ de 3 bits con busqueda de rango previo del propio autor (10,90). El autor advierte que la calibracion se hizo sobre WikiText-2 train y la evaluacion sobre test (en dominio), por lo que los numeros en otros textos diferiran. La dispersion entre tres semillas de la receta es de 0,02.

## Capacidades

- Generacion de texto conversacional en modo instruct, con plantillas de chat propias de Qwen2.5.
- Razonamiento de proposito general y respuesta a instrucciones de varios pasos, limitado por su tamano de 1,5B parametros.
- Generacion y explicacion de codigo a nivel basico e intermedio, heredada del modelo base.
- Soporte multilingue (el modelo base declara mas de 29 idiomas), aunque la calidad decae en idiomas poco representados.
- Capacidades de function calling / tool calling y de agente heredadas de Qwen2.5, condicionadas a la ventana efectiva que se configure.
- Razonamiento multi-turno con contexto largo, hasta 128.000 tokens teoricos, aunque con merma de calidad fuera del rango de calibracion de la cuantizacion.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode); es un modelo estrictamente de texto.

## Casos de uso

- Asistente conversacional local en portatiles Apple Silicon: con 794 MB de pesos, el modelo se ejecuta integramente en memoria unificada de un MacBook, permitiendo un chatbot privado sin conexion y sin coste de API.
- Clasificacion y etiquetado de texto en pipelines de ingestión de datos: su bajo coste por inferencia permite procesar grandes volumenes de documentos para categorizacion tematica o deteccion de intenciones.
- Generacion de borradores de codigo en entornos de desarrollo integrados: puede autocompletar funciones y explicar fragmentos, con soporte de tool calling para interactuar con herramientas del IDE.
- Prototipado rapido de agentes: sirve como modelo de control para cadenas multi-paso en las que el coste de inferencia debe ser minimo, aprovechando el soporte de function calling del modelo base.
- Traduccion asistida y resumenes multilingues: util para resumir correos o articulos en varios idiomas, aunque conviene verificar la calidad en idiomas distintos del ingles y el chino.
- Filtrado y moderacion de contenido en tiempo real: su latencia de decodificacion (en torno a 81 tokens/s en un M4 Pro) lo hace apto para preclasificar mensajes antes de enviarlos a modelos mayores.
- Educacion y tutoria: puede desplegarse como asistente de estudio offline para responder preguntas y explicar conceptos, sin enviar datos del alumno a servicios externos.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor corresponden a perplejidad sobre WikiText-2 (20 ventanas de 2048 tokens, menor es mejor, medidos en un MacBook Pro M4 Pro con MLX 0.32):

| Modelo | bits/peso | Perplejidad | Tamano |
|---|---|---|---|
| Original fp16 | 16 | 9,38 | 3,1 GB |
| 4-bit round-to-nearest (mlx_lm convert -q, embedding 4-bit) | 4,5 | 10,67 | ~1,0 GB |
| mlx_lm.awq 3-bit, embedding 8-bit | 3,5 | 12,43 | no disponible |
| GPTQ 3-bit con rejilla de busqueda de rango (pipeline previo del autor) | 3,5 | 10,90 | 794 MB |
| Este modelo | 3,5 | 10,38 | 794 MB |

El autor reporta ademas que la misma receta aplicada a SmolLM2-1.7B-Instruct pasa de 11,49 a 10,20 de perplejidad, frente a 8,94 del fp16 de ese modelo. La velocidad de decodificacion medida es de aproximadamente 81 tokens/s frente a 90 tokens/s del modelo comunitario de 4 bits, es decir, un 10 por ciento inferior a cambio de un 20 por ciento menos de memoria. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria: aproximadamente 794 MB solo para los pesos; con el contexto y la cache de atencion, el consumo real depende de la longitud de secuencia. Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o mas.
- Plataforma: MLX esta disenado exclusivamente para Apple Silicon (series M1, M2, M3, M4). No funciona de forma nativa en GPU NVIDIA ni AMD.
- GPU recomendadas: no aplica en el sentido habitual; requiere un Mac con chip de la serie M. Los datos publicados se obtuvieron en un MacBook Pro M4 Pro.
- Cabe en GPU de consumo: si, pero solo a traves de Apple Silicon; no esta pensado para tarjetas tipo RTX 4090 ni similares, que no pueden ejecutar MLX.
- Opciones de despliegue: mlx-lm (`python -m mlx_lm generate`), y servidores compatibles con MLX. No es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, que esperan otros formatos (GGUF o safetensors PyTorch).
- Latencia y throughput estimados: en torno a 81 tokens/s de decodificacion en un MacBook Pro M4 Pro bajo carga, segun el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-1.5B 3-bit MLX) | 1,54B (3,5 bits/peso) | 128.000 tokens | 10,38 | apache-2.0 | Hugging Face, MLX |
| Qwen2.5-1.5B-Instruct fp16 | 1,54B (16 bits) | 128.000 tokens | 9,38 | apache-2.0 | Hugging Face, multiplataforma |
| Qwen2.5-1.5B-Instruct 4-bit MLX (round-to-nearest) | 1,54B (4,5 bits/peso) | 128.000 tokens | 10,67 | apache-2.0 | Hugging Face, MLX |
| dfed24/Qwen2.5-1.5B-Instruct-gptq-4bit-mlx | 1,54B (4 bits aprox.) | 128.000 tokens | no disponible | apache-2.0 | Hugging Face, MLX |

Frente a las alternativas de 4 bits en MLX, esta version reduce el espacio en disco y memoria alrededor de un 20 por ciento y mejora la perplejidad, a cambio de una perdida de velocidad de decodificacion de aproximadamente el 10 por ciento. Frente al fp16, la degradacion de perplejidad es de un punto completo (9,38 a 10,38).

## Limitaciones y advertencias

- La calibracion se realizo sobre WikiText-2 train y la evaluacion sobre WikiText-2 test, es decir, en dominio; el propio autor advierte que los numeros de perplejidad en otros textos diferiran y que la comparacion con AWQ uso un texto de calibracion generico distinto.
- Al ser una cuantizacion agresiva de 3 bits, es esperable cierto deterioro en tareas de razonamiento, matematicas o codigo que no se refleja en la perplejidad; no hay benchmarks de tareas publicados para confirmarlo.
- Riesgo de alucinacion inherente a un modelo de 1,5B parametros, especialmente en preguntas factuales y contextos largos.
- Aunque el modelo base declara soporte de 128.000 tokens, la cuantizacion puede degradar el rendimiento mucho antes de esa longitud; la evaluacion publicada solo cubre ventanas de 2048 tokens.
- Idiomas distintos del ingles y el chino pueden perder calidad de forma mas acusada tras la cuantizacion, dado que el corpus de calibracion (WikiText-2) es predominantemente en ingles.
- La licencia apache-2.0 del modelo base se mantiene, por lo que el uso comercial esta permitido, pero conviene verificar los terminos del modelo base original antes de produccion.
- Dependencia exclusiva de MLX y Apple Silicon: no se puede desplegar en infraestructura con GPU NVIDIA, lo que limita su uso en servidores tradicionales.
- Repositorio con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 3 de octubre de 2026; se trata de un artefacto de investigacion personal sin validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dfed24/Qwen2.5-1.5B-Instruct-gptq-3bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del pipeline de cuantizacion: https://github.com/dfed25/mlx-gptq
- Version de 4 bits del mismo autor: https://huggingface.co/dfed24/Qwen2.5-1.5B-Instruct-gptq-4bit-mlx
- Cuantizacion GPTQ-Int8 oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GPTQ-Int8
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio espejo de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Pagina de Qwen2.5 1.5B Instruct en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
