# Hiddenlight87/VallerIA-2B-v0.2-GGUF

## Resumen

VallerIA 2B v0.2 es un modelo de lenguaje conversacional de aproximadamente 1.880 millones de parametros, derivado mediante ajuste fino de Qwen/Qwen3.5-2B-Base. Lo desarrolla el usuario Hiddenlight87 y se distribuye en formato GGUF, orientado explicitamente a su ejecucion local mediante Ollama y llama.cpp. La version publicada en este repositorio es una distribucion cuantizada del "Golden baseline" congelado del autor, es decir, unos pesos fijos que sirven como referencia reproducible para sus benchmarks internos.

El modelo hereda de su base Qwen3.5 la capacidad de modo pensamiento (thinking mode), que puede activarse o desactivarse en tiempo de ejecucion sin modificar los pesos. Esta pensado para entornos de inferencia local con recursos limitados, ya que su tamano permite ejecutarlo en GPU de consumo e incluso en CPU con las cuantizaciones adecuadas.

La relevancia actual del modelo es limitada: se trata de un ajuste fino de autor independiente, sin descargas ni valoraciones en el momento de la ficha, sin model card detallada sobre datos de entrenamiento y sin resultados de benchmarks publicos mas alla de la referencia a un fichero EVALUATION.md del propio repositorio. Debe evaluarse, por tanto, como un experimento reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-2B-Base); detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (aprox. 1,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion Golden de Ollama (num_ctx: 8192); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF) |
| Idiomas soportados | No disponibles (la model card incluye un ejemplo en italiano, sin listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para los parametros originales reportados por Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-2B-Base, un transformer decoder-only de aproximadamente 1,88 mil millones de parametros. No se dispone de informacion publica sobre la composicion del dataset de ajuste fino, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. La model card unicamente indica que VallerIA 2B v0.2 deriva de dicho modelo base y que los pesos se congelan como "Golden baseline" para benchmarks reproducibles.

La innovacion tecnica destacable es la herencia del modo pensamiento de Qwen3.5, que permite alternar entre generacion con razonamiento explicito y respuesta directa mediante un flag de runtime (`--think=false` en Ollama). Este cambio no altera los pesos, solo el comportamiento de generacion. El autor publica ademas el SHA256 exacto del artefacto Q4_K_M usado en su benchmark Golden, lo que facilita la reproducibilidad de sus mediciones.

## Capacidades

- Generacion de texto conversacional en modo directo y en modo pensamiento (thinking mode heredado de Qwen3.5).
- Razonamiento multi-paso cuando el modo pensamiento esta activo.
- Capacidad multilingue heredada del modelo base, aunque sin listado oficial de idiomas en la model card.
- Ejecucion local en Ollama y llama.cpp mediante los tres artefactos GGUF publicados.
- Reproducibilidad de benchmarks mediante el SHA256 del artefacto Golden.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 1,88 mil millones de parametros y cuantizacion Q4_K_M, el modelo cabe en GPU de consumo y permite iterar rapidamente sobre prompts y flujos conversacionales sin coste de API.
- Despliegue en entornos sin conectividad: al distribuirse como GGUF y ejecutarse con Ollama o llama.cpp, puede operar en estaciones de trabajo aisladas o en el borde, siempre que se acepte el contexto de 8192 tokens de la configuracion Golden.
- Reproduccion de benchmarks internos: el SHA256 publicado del artefacto Q4_K_M y la configuracion fija (num_ctx 8192, temperature 0.2, top_p 0.9) permiten replicar exactamente las mediciones del autor en otras maquinas.
- Evaluacion comparativa de ajustes finos sobre Qwen3.5-2B: sirve como referencia para medir el impacto de un ajuste fino concreto frente al modelo base en tareas conversacionales.
- Generacion de texto con razonamiento controlado: el flag `--think=false` permite elegir entre respuestas directas (menor latencia) y respuestas con cadena de pensamiento (mayor calidad en tareas complejas) sin cambiar de modelo.
- Educacion e investigacion: su tamano reducido y licencia Apache 2.0 lo hacen util para experimentos docentes sobre cuantizacion, modos de generacion y despliegue local con Ollama.
- Integracion en pipelines de CI para pruebas de regresion de prompts: la reproducibilidad del artefacto Golden facilita comparar salidas entre versiones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un fichero EVALUATION.md del propio repositorio para los resultados del benchmark Golden, pero dichos numeros no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en Q4_K_M, unos 2-2,5 GB en Q8_0 y alrededor de 4 GB en BF16 (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas para las cuantizaciones publicadas.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 4 GB o mas de VRAM en Q4_K_M y Q8_0.
- Opciones de despliegue: Ollama (soporte oficial en la model card con Modelfile incluido) y llama.cpp (formato GGUF). vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VallerIA 2B v0.2 | 1,88 B | 8192 (config. Golden) | Apache 2.0 | GGUF | Repositorio Hugging Face con 0 descargas |
| Qwen/Qwen3.5-2B-Base | Aprox. 2 B | No disponible | No disponible en la informacion | Safetensors | Modelo base publico en Hugging Face |
| Alternativas de ~2B (p. ej. Gemma 2 2B, Llama 3.2 1B) | 1-2 B | 8K-128K segun modelo | Licencias propias (Gemma, Llama) | Safetensors, GGUF | Amplia disponibilidad y ecosistema |

La comparativa cuantitativa de rendimiento no esta disponible, ya que VallerIA no publica cifras de benchmarks en la informacion proporcionada. Frente a su modelo base, la diferencia principal es el ajuste fino conversacional y la distribucion en GGUF lista para Ollama.

## Limitaciones y advertencias

- Ausencia de datos de entrenamiento: no se especifica el dataset, el numero de tokens ni el metodo de ajuste, lo que impide evaluar sesgos o calidad esperada.
- Sin benchmarks publicos verificables en la informacion disponible: el rendimiento real frente al modelo base o a alternativas de tamano similar no puede contrastarse.
- Riesgo de alucinacion: inherente a modelos de 2B sin datos de evaluacion publicados; no se han publicado mediciones de factualidad.
- Sesgos conocidos: no disponibles; al desconocerse la composicion del dataset de ajuste fino, no puede descartarse la herencia de sesgos del modelo base o la introduccion de otros nuevos.
- Cobertura idiomatica incierta: la model card no lista idiomas soportados y el unico ejemplo incluido esta en italiano, lo que no garantiza un rendimiento uniforme en castellano.
- Contexto limitado en la configuracion Golden: 8192 tokens, inferior a modelos actuales con ventanas de 32K o 128K.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE.md del repositorio.
- Madurez del proyecto: repositorio con 0 descargas y 0 valoraciones en el momento de la ficha; sin garantias de mantenimiento ni soporte.
- Modo pensamiento activado por defecto en algunas configuraciones de Ollama: puede aumentar la latencia de forma inesperada si no se desactiva explicitamente con `--think=false`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hiddenlight87/VallerIA-2B-v0.2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Fichero de evaluacion referenciado en la model card: EVALUATION.md (incluido en el repositorio, no enlazado de forma directa)
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
