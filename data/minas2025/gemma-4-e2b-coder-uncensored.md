# minas2025/Gemma-4-E2B-Coder-Uncensored

## Resumen

Gemma-4-E2B-Coder-Uncensored es un ajuste fino del modelo `llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic`, publicado por el usuario minas2025 el 5 de octubre de 2026 bajo licencia Gemma. El objetivo declarado era construir un especialista en desarrollo front-end (React, TypeScript, TSX) y Python a partir de la variante eficiente E2B de Gemma 4. El autor lo publica como un ejercicio post-mortem: segun su propia documentacion, el ajuste degrada al modelo base en lugar de mejorarlo.

El modelo se distribuye en formato GGUF con cuantizacion Q8_0 y esta pensado para inferencia local con llama.cpp. Solo soporta ingles (`en`). La relevancia de esta ficha no esta en el rendimiento del modelo, sino en que documenta un caso de transferencia negativa (negative transfer) al ajustar con QLoRA un modelo pequeno ya altamente optimizado mediante unas 700 filas sinteticas sobremuestreadas, un fenomeno poco publicado y util para quien entrene modelos pequenos.

Las mediciones que acompanan al modelo, realizadas con lm-evaluation-harness en decodificacion greedy y semilla 0, muestran una perdida de aproximadamente 10 puntos en HumanEval y de 3 puntos en MBPP frente al modelo base. El autor recomienda explicitamente descargar el modelo base si se busca un modelo de codigo pequeno funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B) |
| Parametros totales | no disponible (la nomenclatura E2B del modelo base apunta a la variante eficiente de ~2 000 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en inferencia (`-c 4096`); 2048 tokens durante el entrenamiento |
| Tipos de cuantizacion | GGUF Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only `llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic`, que a su vez es un derivado descensurado de la variante E2B de Gemma 4. Sobre esa base se aplico un ajuste QLoRA en 4 bits posteriormente fusionado al modelo completo. La configuracion de LoRA fue rango 16, alpha 32, con adaptadores en las proyecciones q, k, v, o, gate, up, down, ademas de la puerta PLE y su proyeccion, lo que supone aproximadamente 24 millones de parametros entrenables.

Los datos de entrenamiento consisten en 12 152 filas: 8 000 filas de Python procedentes de `F-A-I-L/kodcode-verified-python-235k` y unas 700 filas unicas de front-end (destilados de Opus 4.6 y Claude Fable 5 segun el autor) sobremuestreadas hasta representar un tercio de las actualizaciones. El entrenamiento uso contexto de 2048 tokens, learning rate 1.5e-4 con schedule coseno y 20 pasos de warmup, batch 1 con acumulacion de gradiente 16 (batch efectivo 16) y 260 pasos, en unos 47 minutos sobre una unica RX 6700 XT. No se menciona RLHF ni DPO. La innovacion destacable aqui no es tecnica sino metodologica: el autor documenta que el sobremuestreo de datos sinteticos provoco transferencia negativa, ya que el modelo aprendio a imitar el estilo conversacional superficial del dataset sin adquirir la habilidad subyacente, degradando el enrutamiento logico del modelo base.

## Capacidades

- Generacion de codigo en Python orientada a logica algoritmica general.
- Generacion de componentes front-end en React y TypeScript (TSX).
- Generacion de texto general y respuestas conversacionales, heredadas del base descensurado.
- Capacidad de tool calling y uso en agentes: no confirmada de forma especifica en la informacion disponible; la base incluia un dataset de coding agentico (`Nexlab/fable5-agentic-coding-sft`).
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision o audio: no disponible / no declarado.
- Comportamiento "uncensored": heredado del modelo base, con menor rechazo a peticiones.

## Casos de uso

- Estudio de transferencia negativa en ajuste fino: el caso mas solido. Se usa como referencia empirica de como sobremuestrear un dataset sintetico pequeno degrada un modelo pequeno ya competente, con receta y metricas reproducibles.
- Pruebas comparativas frente al modelo base: util para verificar que el ajuste empeora HumanEval y MBPP, y como la puerta de compilacion estricta de TypeScript (`tsc --noEmit`) pierde un punto pese a ser el objetivo del entrenamiento.
- Generacion de componentes React/TSX en prototipado rapido: produce HTML no trivial y codigo estructuralmente coherente en la mayoria de casos (12/12 estructuralmente correctos), aunque el base es superior.
- Asistencia de codigo Python en tareas de baja exigencia: con 56.7 pass@1 en HumanEval, puede resolver problemas estandar, pero sin ventaja frente al base.
- Inferencia local en hardware de gama media: al ser GGUF Q8_0 de un modelo E2B, es ejecutable en un unico equipo de consumo con llama.cpp, lo que lo hace util para experimentar con el enfoque sin coste de nube.
- Referencia docente de recetas de QLoRA: la tabla de hiperparametros (rango, alpha, objetivos, pasos) sirve como ejemplo de configuracion concreta de LoRA en un modelo pequeno.
- Evaluacion de puertas de calidad de codigo front-end: el conjunto de 12 componentes React/TSX con criterios de compilacion estricta es reutilizable como banco de pruebas propio.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con lm-evaluation-harness, decodificacion greedy y semilla 0. La columna de comparacion es el modelo base `llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic` en Q8_0. Los valores del modelo tienen `verified: false`.

| Benchmark | Modelo base (heretic Q8_0) | Este modelo (Q8_0) |
|---|---|---|
| HumanEval pass@1 | 66.5 | 56.7 |
| MBPP pass@1 | 43.5 | 40.5 |

Puerta de front-end (12 componentes React/TSX):

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Estructuralmente correcto | 12/12 | 12/12 |
| Pasa `tsc --noEmit` (strict) | 10/12 | 9/12 |
| Renderiza HTML no trivial | 11/12 | 10/12 |

Como resume el autor: el ajuste perdio unos 10 puntos en logica algoritmica abstracta y 1 punto en la misma puerta de compilacion estricta de TypeScript que pretendia mejorar.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~2 000 millones de parametros en Q8_0 ocupa aproximadamente 2-2.5 GB de pesos; con cache de contexto de 4096 tokens la huella total ronda los 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El autor entreno (QLoRA, no inferencia) en una unica AMD RX 6700 XT de 12 GB. Para inferencia son suficientes tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4090 o superiores; tambien A100/H100 sin ninguna necesidad para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 4 GB o mas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server -m ... -c 4096 -ngl 99 --jinja --port 8080`), y por compatibilidad GGUF tambien Ollama o llama-cpp-python. vLLM y TGI dependen de que existan pesos en safetensors, que no se distribuyen en este repositorio (solo GGUF).
- Latencia y throughput estimados: no disponibles. El unico dato temporal es de entrenamiento (260 pasos, ~47 minutos), no de inferencia.

## Comparativa con modelos similares

Comparativa directa con el modelo base del que deriva, del que hay datos medidos en las mismas condiciones:

| Modelo | Parametros | Contexto | HumanEval pass@1 | MBPP pass@1 | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Gemma-4-E2B-Coder-Uncensored (este) | no disponible (~2B por nomenclatura) | 4096 | 56.7 | 40.5 | gemma | GGUF |
| gemma-4-E2B-it-ultra-uncensored-heretic (base) | no disponible (~2B por nomenclatura) | no disponible | 66.5 | 43.5 | gemma | no disponible en esta informacion |

Alternativas de la misma categoria (modelos de codigo pequenos): no disponible en la informacion proporcionada. El autor solo compara contra su propio modelo base y concluye que este lo supera en todas las metricas.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: es la advertencia principal y la razon de ser de la publicacion. El propio autor recomienda usar el base.
- Transferencia negativa documentada: el ajuste aprendio estilo superficial sin incorporar la habilidad objetivo, degradando el razonamiento logico subyacente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; un modelo descensurado tiende a producir respuestas con menos verificacion y menor tasa de rechazo, lo que puede aumentar contenido incorrecto o inapropiado en produccion.
- Cobertura de idioma: solo ingles; no hay soporte multilingue declarado.
- Contexto limitado: 4096 tokens en inferencia y 2048 durante el entrenamiento, insuficiente para tareas de contexto largo (analisis de repositorios completos, documentos extensos).
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, con las condiciones y restricciones que esta impone; no es una licencia permisiva tipo Apache o MIT.
- Benchmarks no verificados: los valores tienen `verified: false` y provienen del propio autor; una parte de la comparacion (los resultados del base) se cita desde su model card.
- Datos sinteticos: el conjunto de entrenamiento front-end son destilados sinteticos, con los sesgos y artefactos propios de esa generacion.
- Idoneidad para produccion: baja para codigo en general; su mejor uso es como material de estudio de fallos de ajuste fino y como banco de pruebas metodologico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minas2025/Gemma-4-E2B-Coder-Uncensored
- Modelo base: https://huggingface.co/llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic
- Dataset Python: https://huggingface.co/datasets/F-A-I-L/kodcode-verified-python-235k
- Dataset front-end: https://huggingface.co/datasets/glyphsoftware/opus-4.6-frontend-development
- Dataset de coding agentico: https://huggingface.co/datasets/Nexlab/fable5-agentic-coding-sft
- HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
- MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Herramienta de evaluacion lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- llama.cpp: https://github.com/ggml-org/llama.cpp
