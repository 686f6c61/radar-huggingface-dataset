# OsaurusAI/GLM-5.3-Flash-JANGH2

## Resumen

GLM-5.3-Flash-JANGHT2.4 es una cuantización de 8 bits y formatos de baja precisión del modelo zai-org/GLM-5.3-Flash, publicada por OsaurusAI para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es un MoE de clase 300B con 288 expertos enrutados (top-8 más un experto compartido), atención lineal KDA, atención dispersa y torres de visión y vídeo. Esta versión empaqueta los pesos en un bundle de 91,57 GiB con una media de 2,4 bits por peso en los expertos enrutados, lo que permite ejecutarlo en Macs de 128 GB de memoria unificada.

El bundle incorpora además un drafter de decodificación especulativa DFlash2 de z-lab, integrado sin modificaciones, que acelera la generación en texto de baja entropía como el código. El repositorio se denominaba anteriormente OsaurusAI/GLM-5.3-Flash-JANGH2 y fue renombrado el 13 de octubre de 2026; los pesos actuales son un bundle distinto, 4,3 GiB más pequeño y más cercano al modelo original que la release JANGH2 previa.

La relevancia de esta ficha radica en que demuestra la viabilidad de servir un modelo de razonamiento y agentes de escala 300B en hardware de consumo de gama alta, con métricas de fidelidad frente a bf16 publicadas por el autor y con soporte de tool calling, visión y pensamiento extendido. La licencia MIT del bundle facilita su uso comercial, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 288 expertos enrutados (top-8 + experto compartido), atención lineal KDA, atención dispersa, torres de visión y vídeo |
| Parametros totales | 31.532.700.094 (safetensors del bundle); 321,3B en el modelo fuente según el autor |
| Parametros activos | top-8 de 288 expertos enrutados más experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: JANGT a 2, 2,5 o 3 bits por peso (trellis, rotación Hadamard-128, estado de 12 bits) y JANGH a 2, 3 o 4 bits (codebook Hadamard-32, redondeo GPTQ). Resto: 8 bits (MXFP8 o afín). Torre de visión: bf16. Media global: 2,4 bits por peso |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con drafter DFlash2 incluido en el subdirectorio dflash2/ |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 288 expertos enrutados y selección top-8 más un experto compartido, combinado con atención lineal KDA y mecanismos de atención dispersa para reducir el coste computacional en secuencias largas. Incorpora torres específicas de visión y vídeo, lo que habilita la modalidad image-text-to-text declarada en el pipeline. El bundle cuantizado no reentrena el modelo: aplica esquemas de compresión medidos capa por capa, mezclando JANGT (trellis con rotación Hadamard-128) y JANGH (codebook Hadamard-32 con GPTQ) en los expertos enrutados, y mantiene el resto de pesos en 8 bits o precisión completa.

La innovación técnica principal del bundle es la corrección de escalas de fila con ganancia unitaria, introducida en la revisión 2 de JANGH2 y aplicada aquí a cada unidad de experto. La revisión 1 reducía las escalas de las matrices de baja precisión (un 12 % a 2 bits), lo que suprimía el token `` tras varios miles de tokens de razonamiento; con la corrección, la probabilidad de cerrar el bloque de pensamiento se mantiene alta (0,75 frente a 0,82 de bf16 en una tarea de diseño tras 8.025 tokens, y 0,94 frente a 0,99 en una tarea de código tras 3.288 tokens). Además, se incluye el drafter DFlash2 de z-lab para decodificación especulativa sin pérdida, que acelera la generación en texto de baja entropía.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento extendido (thinking).
- Razonamiento multi-paso y comportamiento agéntico, con soporte declarado para agentes.
- Tool calling y function calling, con formato de decisión de herramienta validado frente a bf16.
- Comprensión de imagen y vídeo mediante torres dedicadas (pipeline image-text-to-text).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Decodificación especulativa integrada mediante el drafter DFlash2, orientada a acelerar código y texto de baja entropía.
- Soporte de contexto largo (el conjunto de evaluación incluye posiciones de contexto largo, aunque la longitud máxima no se especifica).

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede completar y razonar sobre código con el drafter DFlash2 activado, que según el autor acelera notablemente el texto de baja entropía; adecuado para desarrolladores que trabajan con código propietario sin enviar datos a la nube.
- Agentes autónomos con tool calling: el bundle conserva el 98,2 % de coincidencia de siguiente token con bf16 en puntos de llamada a herramienta y solo invierte 2 decisiones de llamada frente a 6 en la release anterior, lo que lo hace apto para pipelines agénticos que invocan APIs y funciones.
- Análisis de documentos con imágenes: gracias a la torre de visión en bf16, puede procesar capturas, diagramas y páginas escaneadas junto con texto para tareas de extracción y resumen.
- Procesamiento de vídeo para descripción y preguntas: la torre de vídeo permite resumir clips o responder preguntas sobre su contenido en flujos de trabajo locales.
- Razonamiento extenso con cierre controlado: la corrección de escalas garantiza que el modelo termine sus bloques de pensamiento en tareas largas, lo que lo hace utilizable en generación de informes técnicos y resolución de problemas complejos.
- Conversaciones multi-turno con herramientas en chino e inglés: el conjunto de evaluación incluye 44.214 posiciones de conversaciones con herramientas y 3.668 posiciones en chino, con una KL mediana de 0,498 y 0,264 respectivamente frente a bf16.
- Evaluación de seguridad y ciberseguridad: el conjunto de validación incluye 7.324 posiciones de ciberseguridad con una KL mediana de 0,081, lo que respalda su uso en análisis de vulnerabilidades asistido.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente a bf16 sobre 123 secuencias reservadas y 95.025 posiciones con teacher forcing, con KL renormalizada top-128. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | JANGHT2.4 | JANGH2 (rev. 2) | Control bf16 |
|---|---|---|---|
| KL mediana | 0,251 | 0,297 | 0,016 |
| KL media | 1,391 | 1,574 | 0,306 |
| KL p90 / p95 / p99 | 4,31 / 7,21 / 13,32 | 5,02 / 8,06 / 14,29 | — / — / 6,51 |
| Top-1 | 65,7 % | 63,7 % | 85,5 % |
| Top-5 | 84,9 % | 83,5 % | 96,8 % |
| Top-10 | 88,6 % | 87,2 % | — |
| Tamaño del bundle | 91,57 GiB | 95,89 GiB | — |
| Coincidencia de siguiente token en llamadas a herramienta | 98,2 % | 94,5 % | — |
| Decisiones de herramienta invertidas | 2 | 6 | — |
| P(``) tras 8.025 tokens | 0,75 | 0,75 | 0,82 |

Por dominio, la KL mediana y el top-1 de JANGHT2.4 frente a JANGH2 son: conversaciones con herramientas 0,498 · 59,2 % frente a 0,661 · 55,9 %; código 0,074 · 73,5 % frente a 0,088 · 72,1 %; agéntico 0,072 · 76,4 % frente a 0,090 · 74,0 %; ciberseguridad 0,081 · 73,3 % frente a 0,098 · 72,3 %; contexto largo 0,326 · 63,7 % frente a 0,346 · 64,4 %; general 0,179 · 68,8 % frente a 0,182 · 68,3 %; ciencia 0,085 · 74,4 % frente a 0,084 · 74,4 %; opción múltiple académica 0,176 · 71,2 % frente a 0,197 · 69,7 %; chino 0,264 · 64,8 % frente a 0,288 · 63,9 %; sistemas 0,103 · 72,9 % frente a 0,110 · 71,9 %.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el bundle ocupa 91,57 GiB en disco; el autor lo orienta a Macs de 128 GB de memoria unificada, por lo que se requiere al menos esa capacidad para cargar pesos y trabajar con contexto.
- GPU recomendadas: Apple Silicon de gama alta con 128 GB de memoria unificada; no se documenta soporte para A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU de consumo: no en GPUs discretas convencionales por el tamaño del bundle; sí en Macs de 128 GB.
- Opciones de despliegue: runtime Osaurus 0.25.21 o superior (requerido según osaurus.json, model_version 3); la librería es MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el drafter DFlash2 acelera notablemente el código y el texto de baja entropía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-JANGHT2.4 | 31,5B en safetensors (321,3B fuente) | no disponible | JANGT/JANGH + 8 bits, 2,4 bits medios | MIT | Hugging Face, runtime Osaurus |
| GLM-5.3-Flash-JANGH2 (rev. 2) | 31,5B en safetensors | no disponible | JANGH, 95,89 GiB | MIT | Hugging Face |
| GLM-5.3-Flash-JANG (afín) | no disponible | no disponible | Afín, 95,35 GiB | no disponible | Hugging Face |
| orcarouter GLM-5.3-Flash-MLX 2bit-lite | no disponible | no disponible | 2 bits, 95,4 GiB | no disponible | Hugging Face |

En la comparación sobre 20 prompts cortos y 15.830 posiciones frente a la referencia FP8 oficial, JANGH2 obtuvo una KL mediana de 0,0301 y top-1 del 83,9 %, frente a 0,0882 y 78,6 % de la variante afín y 0,2122 y 71,4 % de orcarouter 2bit-lite. JANGHT2.4 no fue evaluado en ese conjunto.

## Limitaciones y advertencias

- El bundle está pensado exclusivamente para Apple Silicon con MLX y el runtime Osaurus 0.25.21 o superior; no es portable a otras pilas de inferencia sin conversión.
- La cuantización introduce degradación medible: top-1 del 65,7 % frente al 85,5 % de bf16 en el conjunto difícil de 95.025 posiciones, y KL mediana de 0,251 frente a 0,016.
- El dominio de ciencia es el único donde JANGHT2.4 no mejora a JANGH2 en KL mediana (0,085 frente a 0,084).
- Idiomas soportados limitados a inglés y chino; no se declara castellano.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de sesgo en la información disponible.
- La licencia MIT aplica al bundle, pero deben verificarse las condiciones del modelo base zai-org/GLM-5.3-Flash para uso comercial.
- El repositorio fue renombrado desde OsaurusAI/GLM-5.3-Flash-JANGH2; descargas antiguas corresponden a un bundle distinto y no deben mezclarse.
- La longitud máxima de contexto no se especifica, lo que dificulta planificar despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/GLM-5.3-Flash-JANGH2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Sitio del autor: https://osaurus.ai
