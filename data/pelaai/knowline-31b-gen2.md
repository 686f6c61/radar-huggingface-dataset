# PelaAI/KnowLine-31B-Gen2

## Resumen

KnowLine-31B-Gen2 es un modelo de decisión (decision model) desarrollado por PelaAI, un fine-tune del modelo denso google/gemma-4-31B-it. No es un modelo generativo al uso: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones, o puntuación sobre una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones mediante un único forward pass por pregunta, sin generar texto. Está pensado como "System One", es decir, un componente de decisión rápida y calibrada que se sirve como endpoint HTTP compatible con clientes Jev.

El modelo tiene 31.273.088.876 parámetros (unos 31,3B), es de arquitectura transformer densa y hereda el tokenizador y la torre de visión de Gemma 4, por lo que acepta entradas de imagen y texto. Se distribuye en bf16 (unos 62,5 GB) con licencia Apache-2.0 y soporta inglés, chino simplificado y chino tradicional.

Su relevancia actual radica en que compite en el benchmark Decision Index: obtiene 73,00 en la suite pública DI 0.3 (auto-evaluado), por encima de sus hermanos KnowLine-35B-A3B-Gen1.5 (70,72) y KnowLine-26B-A4B-Gen2.5 (68,21), y con probabilidades calibradas (ECE ≈ 0,009–0,013; Brier ≈ 0,208–0,231). Es un modelo independiente, no afiliado a TypeSafe, Jev ni Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base google/gemma-4-31B-it) |
| Parámetros totales | 31.273.088.876 (≈31,3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (release oficial en bf16) |
| Idiomas soportados | Inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ≈62,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso de unos 31B parámetros. Sobre él se aplicó un fine-tuning supervisado con LoRA (rango 32, alpha 64, solo el componente de lenguaje, una época), posteriormente fusionado en pesos bf16. Los ejemplos de entrenamiento incluyen tareas de decisión escritas y etiquetadas por profesores LLM y renderizadas con la plantilla de chat de Gemma. El dataset de entrenamiento no se publica en el repositorio.

La innovación principal no está en el preentrenamiento sino en la calibración y el serving. Se ajustó una temperatura de lectura T = 1,27 sobre datos de retención y se plegó en los pesos (norma final y soft-cap de logits), de modo que las probabilidades de salida están calibradas de serie; esta temperatura altera la magnitud de las probabilidades pero no el orden de las opciones. Además, el front end (`knowline_server.py`) lee dos veces las peticiones cortas por defecto (opción `--no-read-twice` para desactivarlo). La torre de visión queda sin cambios respecto al modelo base.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas sí/no, elección entre k opciones y puntuaciones sobre rúbrica, devolviendo distribución de probabilidad por opción.
- Inferencia sin generación de texto: un forward pass por pregunta, con salida basada en el logit del token de etiqueta de cada opción.
- Procesamiento de estado multimodal: acepta texto o conversación y, por herencia de Gemma 4, entradas de imagen y texto (pipeline image-text-to-text en los tags).
- Probabilidades calibradas: ECE ≈ 0,009–0,013 y Brier ≈ 0,208–0,231 en la suite pública.
- Multilingüe: inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz: endpoint `/v1/systemone` compatible con clientes Jev (basta cambiar la URL base) y misma interfaz que otros modelos KnowLine (basta cambiar el nombre del modelo).
- Lotes de preguntas: hasta 64 preguntas tipadas por petición.
- No dispone de tool calling, agentes ni modo thinking documentados en la información disponible.

## Casos de uso

- Moderación y triaje de contenido: enviar un mensaje o hilo y consultar preguntas sí/no ("¿es tóxico?", "¿requiere revisión humana?") obteniendo probabilidades calibradas que permiten fijar umbrales con significado estadístico.
- Enrutado de tickets de soporte: clasificar la conversación con preguntas de elección entre k categorías (facturación, envío, devolución) en un solo forward pass por pregunta, con latencia baja al no generar texto.
- Evaluación de tono y sentimiento en atención al cliente: usar preguntas de elección (enfadado/neutro/satisfecho) sobre el estado conversacional, como muestra el ejemplo de la model card con una solicitud de reembolso.
- Puntuación de calidad sobre rúbrica: evaluar respuestas de un chatbot o de un agente con preguntas de puntuación, aprovechando la calibración para comparar puntuaciones entre lotes.
- Automatización de decisiones en pipelines: integrar el endpoint `/v1/systemone` en flujos existentes compatibles con Jev cambiando solo la URL base, sin reescribir el cliente.
- Análisis multimodal de capturas o documentos: al conservar la torre de visión de Gemma 4, se pueden plantear preguntas de decisión sobre entradas imagen-texto (por ejemplo, clasificar una captura de pantalla de error).
- Investigación en calibración: servir como referencia para estudiar ECE y Brier en modelos de decisión, dado que la temperatura está plegada en los pesos y el método de medición está documentado.

## Benchmarks y rendimiento

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Fuente |
|---|---|---|---|---|
| KnowLine-31B-Gen2 | 31B | 73,00 | Sin puntuar | Auto-evaluado, kit oficial |
| karpo-decision-31B | ≈31,3B | 75,05 | 73,86 | Board |
| GLiDE 27B | ≈26,1B | 72,49 | 73,37 | Board |
| REAX 1.3 | ≈57,4B | 73,71 | 72,64 | Board |
| Logits Sigma-1 Duo | ≈57,4B | 72,93 | 72,28 | Board |
| Copernicus-31B | ≈31,3B | 70,37 | 72,11 | Board |
| KnowLine 31B Gen1.5 | ≈31,3B | 70,50 | 71,91 | Board |
| Copernicus-57B | ≈57,4B | 75,34 | 71,80 | Board |
| FlexDM-LoRA 2.1 · Gemma-4-31B | ≈31,3B | 68,99 | 71,61 | Board |

Métricas de calibración en la suite pública (método del board): ECE ≈ 0,009–0,013 y Brier ≈ 0,208–0,231. Para comparar, KnowLine-26B-A4B-Gen2.5 obtiene ECE 0,013–0,018 y Brier 0,24–0,27. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan unos 62,5 GB; SGLang reserva por defecto el 85 % de la memoria de la GPU (MEM), por lo que se necesita una GPU con al menos 80 GB para servir en bf16 con holgura.
- GPU recomendadas: la evaluación del Decision Index se ejecutó en H20 de 96 GB. Por capacidad, encajan A100 80 GB, H100 80 GB, H200 y GPUs de 96 GB o más.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer convencionales en bf16; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: SGLang 0.5.21 en bf16 mediante `serve_knowline.sh`; front end `knowline_server.py` con `knowline_layout.py` (solo dependen de transformers y requests); transformers 5.12.1. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; la arquitectura de un forward pass por pregunta y sin generación de texto reduce la latencia frente a modelos generativos, y la lectura doble de peticiones cortas añade un coste adicional por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI 0.3 público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen2 | ≈31,3B | No disponible | 73,00 (auto-evaluado) | Apache-2.0 | Hugging Face |
| KnowLine 31B Gen1.5 | ≈31,3B | No disponible | 70,50 | No disponible | Hugging Face |
| Copernicus-31B | ≈31,3B | No disponible | 70,37 | No disponible | Board |
| karpo-decision-31B | ≈31,3B | No disponible | 75,05 | No disponible | Board |

Frente a los modelos de la misma categoría y tamaño, KnowLine-31B-Gen2 supera a su predecesor Gen1.5 y a Copernicus-31B en la suite pública DI 0.3, pero queda por debajo de karpo-decision-31B (75,05) y de GLiDE 27B (72,49 en DI 0.3, aunque con 73,37 en DI 0.4.1 completo). La ventaja diferencial de KnowLine es la calibración explícita y la licencia Apache-2.0; no obstante, sus resultados son auto-evaluados y aún no tiene entrada en el board oficial de DI 0.4.1.

## Limitaciones y advertencias

- Resultados auto-evaluados: el 73,00 de DI 0.3 procede de una ejecución propia con el kit oficial; el modelo no tiene aún puntuación en el board DI 0.4.1, que pondera un 60 % de tests privados y un 40 % de tareas de nuevos dominios.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; al derivar de Gemma 4 y de datos etiquetados por profesores LLM, puede heredar sesgos de ambos.
- Alucinación: al no generar texto y limitarse a distribuciones sobre opciones predefinidas, el riesgo de alucinación textual es bajo, pero puede asignar alta probabilidad a opciones incorrectas si la pregunta está mal formulada o el estado es ambiguo.
- Cobertura lingüística limitada: solo inglés, chino simplificado y chino tradicional; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que limita la planificación de estados conversacionales largos.
- Dependencia del serving: la calibración se ajustó con el serving concreto (lectura doble y SGLang en bf16); servir con otra pila o desactivar `--no-read-twice` puede alterar las probabilidades.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-31B-it y la ausencia de datos de entrenamiento publicados, lo que dificulta auditorías.
- Formato único: solo se publican pesos bf16 (≈62,5 GB), sin versiones cuantizadas, lo que restringe el despliegue a hardware de gama alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-31B-Gen2
- Guía de inferencia: https://huggingface.co/PelaAI/KnowLine-31B-Gen2/blob/main/INFERENCE.md
- README en chino: https://huggingface.co/PelaAI/KnowLine-31B-Gen2/blob/main/README.zh.md
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Release anterior KnowLine-31B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Datos oficiales del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/main/data/index.json
