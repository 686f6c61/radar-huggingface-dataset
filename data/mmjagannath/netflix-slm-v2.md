# MMJagannath/Netflix-SLM-V2

## Resumen

Netflix-SLM-V2 es un modelo de lenguaje de pequeno tamano (SLM) de 40,38 millones de parametros, desarrollado por MMJagannath como proyecto academico. Se trata de un transformer decoder-only inspirado en la arquitectura Qwen3, entrenado desde cero (no es un fine-tuning de pesos oficiales de Qwen3) para responder preguntas sobre el catalogo de peliculas y series de Netflix, incluyendo conversaciones multi-turno y cambios de titulo dentro de un mismo dialogo.

El modelo parte de un corpus de 1.500 registros de catalogo (titulo, tipo, director, reparto, pais, ano, clasificacion por edades y duracion) a partir de los cuales se generaron 29.986 ejemplos conversacionales, divididos en entrenamiento, validacion y prueba. Sobre esa base se entreno un baseline de ~14,16M de parametros y posteriormente el modelo final de 40,38M, con etapas adicionales de dialogo multi-turno y de reparacion de cambios de titulo.

Su relevancia es fundamentalmente didactica y de despliegue local: demuestra el ciclo completo de preparacion de datos, entrenamiento, evaluacion, conversion a GGUF y ejecucion en Ollama sobre una GPU de consumo (RTX 4060 Laptop, 8 GB de VRAM). No es un modelo de proposito general ni compite con LLMs de gran escala; su utilidad esta acotada al dominio del catalogo Netflix y a un contexto de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only inspirado en Qwen3, con Grouped Query Attention (GQA) |
| Parametros totales | 40.384.512 (40,38 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de fine-tuning) |
| Tipos de cuantizacion | GGUF F32 (artefacto publicado, ~162 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (F32) para Ollama; scripts de entrenamiento en PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas, dimension oculta de 512, 8 cabezas de atencion de consulta con dimension 64 y 2 cabezas key-value (4 cabezas de consulta por cabeza KV, GQA). La dimension feed-forward es de 1.536 con activacion SwiGLU/SiLU, normalizacion RMSNorm (epsilon 1e-6), embeddings rotatorios RoPE con theta 10.000 y embeddings de entrada/salida atados (tied embeddings). El vocabulario es de 8.192 tokens. La arquitectura se entreno para el proyecto y posteriormente se mapeo a una representacion compatible con Qwen3 para la interoperabilidad con GGUF/Ollama; esta compatibilidad de formato no implica el uso de pesos preentrenados oficiales de Qwen3.

El entrenamiento se realizo en una NVIDIA RTX 4060 Laptop (8 GB VRAM) con precision mixta BF16 y optimizador AdamW (betas 0,9/0,95, weight decay 0,05, gradient clipping 1,0). Se documentan tres etapas: una etapa de chat largo con contexto de 512 tokens (300 pasos por defecto, LR inicial 5e-5, 8 secuencias efectivas por actualizacion), una etapa Dialogue V2 (2.500 pasos, LR 3e-5, 16 secuencias efectivas, con un 80% de muestreo de dialogos largos) y una etapa de reparacion de cambio de titulo (400 pasos por defecto, checkpoint seleccionado en el paso 300, LR 2e-5). Los datos de entrenamiento provienen de 1.500 registros del catalogo y de 29.986 ejemplos conversacionales (23.988 de entrenamiento, 2.999 de validacion, 2.999 de prueba), complementados con dialogos multi-turno y 3.000 dialogos de cambio de titulo generados a partir de hechos existentes. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles sobre el catalogo de Netflix (peliculas y series).
- Respuesta a preguntas factuales sobre titulos: director, reparto, pais, ano, clasificacion por edades y duracion.
- Conversaciones multi-turno con seguimiento de contexto y preguntas de seguimiento.
- Cambio de titulo dentro de un mismo dialogo (title-switch), reforzado en una etapa de fine-tuning especifica.
- Respuestas condicionadas al titulo (title-aware responses).
- Despliegue local via GGUF y Ollama.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Demostracion academica de ciclo completo de SLM: sirve para ilustrar preparacion de datos, entrenamiento desde cero, evaluacion, conversion a GGUF y despliegue en Ollama en un entorno de aula o portafolio.
- Asistente de consulta de catalogo en prototipos: responde preguntas sobre titulos concretos (director, reparto, ano, duracion) usando los hechos del catalogo de 1.500 registros, adecuado para validar un flujo de QA sobre datos estructurados.
- Chatbot de recomendacion conversacional en demos: gestiona dialogos multi-turno con cambios de titulo, util para probar la logica de seguimiento de contexto en un asistente de entretenimiento.
- Base para fine-tuning de dominio: al ser un modelo de 40M con licencia MIT y pesos GGUF, puede servir como punto de partida para experimentos de ajuste sobre otros catalogos o dominios con recursos limitados.
- Pruebas de despliegue en hardware de consumo: su tamano (~162 MB en F32) permite ejecutarlo en una RTX 4060 Laptop de 8 GB o incluso en CPU, util para validar pipelines de inferencia local.
- Evaluacion de tecnicas de entrenamiento en bajo presupuesto: las etapas documentadas (chat largo, Dialogue V2, reparacion de title-switch) sirven como referencia reproducible para estudiar el efecto de cada fase en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto publicado es GGUF F32 de ~162 MB, por lo que la huella de pesos es inferior a 1 GB; con overhead de contexto (512 tokens) cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una NVIDIA RTX 4060 Laptop (8 GB).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo e incluso en CPU.
- Opciones de despliegue: Ollama (nombre registrado `netflix-slm-40m-title-switch-candidate`), llama.cpp por el formato GGUF; no se documenta soporte verificado de vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Netflix-SLM-V2 | 40,38 M | 512 tokens | Ingles | MIT | Hugging Face (GGUF) + GitHub |
| Baseline del mismo proyecto | ~14,16 M | 512 tokens | Ingles | No especificada | No distribuido como artefacto final |
| Qwen3 (referencia arquitectonica) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: solo cubre el catalogo de 1.500 registros usado en el proyecto; no es un modelo de proposito general.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado con datos sinteticos generados, puede inventar hechos sobre titulos no presentes en el catalogo o mezclar atributos entre titulos.
- Contexto limitado a 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- El modelo no es oficial de Netflix ni un checkpoint oficial de Qwen3; la compatibilidad con el formato Qwen3 es solo de interoperabilidad.
- Los datos de entrenamiento derivan de un CSV de 1.500 filas y de ejemplos generados; la model card advierte que la procedencia exacta de cada ejemplo debe verificarse antes de hacer afirmaciones fuertes sobre cobertura o independencia del catalogo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre exactitud factual ni idoneidad para produccion.
- No se documentan evaluaciones de sesgo, seguridad ni robustez; no recomendado para produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/MMJagannath/Netflix-SLM-V2
- Codigo fuente (GitHub): https://github.com/jagannath1473-ops/SLM-Movie-Recommendation
- Dataset de catalogo (Kaggle): https://www.kaggle.com/datasets/debayank2024/netflix-movies-and-series
