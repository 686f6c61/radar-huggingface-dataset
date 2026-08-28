# AnonimousA/Qwen3.8-Flash-Next-REAP-256-duo-GGUF

## Resumen

Qwen3.8-Flash-Next-REAP-256-duo es un derivado comunitario del modelo Qwen3.8-Flash-Next de Alibaba, publicado por el usuario AnonimousA en HuggingFace. Aplica una poda de expertos estilo REAP (Reducing Experts via Activation Pruning) que reduce el número de expertos por capa de 512 a 256, manteniendo los pesos de los expertos supervivientes bit a bit. El resultado es un archivo GGUF de 57,7 GiB (frente a los 83,8 GiB del original) que conserva el 89,29 % de la masa de enrutamiento en la peor capa.

El modelo base, Qwen3.8-Flash-Next, es un MoE ultra disperso de 125B parámetros totales (incluyendo 51B de embeddings n-gram) con 6B parámetros activos por token, arquitectura híbrida Gated DeltaNet + Qwen Sparse Attention y una ventana de contexto de 262 144 tokens. Esta versión podada no es un lanzamiento oficial de Qwen, sino un experimento de la comunidad para hacer el modelo ejecutable en GPUs de consumo (32 GB) sin perder capacidades esenciales. La poda se calibró con dos dominios combinados: código (164k tokens) y orquestación de agentes (180k tokens), de ahí el sufijo "duo".

La relevancia actual radica en que permite ejecutar un modelo de 125B en hardware de gama alta de consumo, con una mejora de prefill de 1,58× en CPU y la posibilidad de cargar 44 de las 48 capas de expertos en una RTX 5090 de 32 GB. Sin embargo, requiere una rama específica de llama.cpp con soporte para la arquitectura `qwen4exp`, aún no integrada en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE híbrido: Gated DeltaNet + Qwen Sparse Attention + n-gram embedding) |
| Parametros totales | 116 514 464 640 (según safetensors del repo; el modelo base declara 125B incluyendo embeddings n-gram) |
| Parametros activos | 6B por token (top-10 expertos + 1 compartido, sin cambios tras la poda) |
| Longitud de contexto | 262 144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | UD-Q3_K_XL (Unsloth Dynamic Quantization) |
| Idiomas soportados | No disponible (el modelo base de Qwen es multilingüe, pero no se especifica en esta variante) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen) |
| Formato de pesos | GGUF (2 shards: 44,86 GiB + 12,83 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de cuatro componentes: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Además incorpora un bloque de embeddings n-gram de 51B parámetros y una optimización de residuos y entrenamiento que reduce el coste de entrenamiento a aproximadamente 1/9 del de Qwen3.7-Plus.

Esta variante REAP-256 no es un reentrenamiento, sino una poda de expertos. Se calcularon las activaciones de enrutamiento con `llama-imatrix` sobre un corpus combinado de código y orquestación de agentes, y se eliminaron los 256 expertos con menor masa de activación por capa. Los expertos supervivientes conservan sus pesos originales sin de-cuantizar ni re-cuantizar, gracias a que en el GGUF el índice de expertos es la dimensión de movimiento más lento (`ne = [n_embd, n_ff, 512]`), lo que permite una copia binaria contigua. La masa de enrutamiento retenida es del 89,29 % en la peor capa (L0: 79,6 %). El número de parámetros activos por token no cambia (top-10 expertos + 1 compartido), por lo que la velocidad de decodificación no mejora respecto al original; la ganancia real está en el prefill y en la posibilidad de caber en GPUs de 32 GB.

## Capacidades

- Generación de texto y razonamiento multilingüe (heredado del modelo base, aunque no se documentan idiomas específicos en esta variante).
- Generación de código: el corpus de calibración incluye 164k tokens de código, y la batería de evaluación ejecuta el código generado contra casos ocultos.
- Orquestación de agentes y tool calling: calibrado con 180k tokens de agentes, soporta llamadas a herramientas y razonamiento multi-paso.
- Razonamiento con modo "thinking" (temperatura 1.0, top_p 0.95, top_k 20, min_p 0.0 según valores oficiales de Qwen).
- Visión: los pesos de visión se preservan en el modelo, pero requieren un archivo mmproj separado (no incluido en este repo).
- Agregación de documentos largos: con razonamiento `medium` alcanza puntuación perfecta en tareas de agregación sobre contexto largo.
- Capacidad de rechazo: una de las tareas de evaluación solo puntúa si el modelo se niega a alucinar una flag de CLI inexistente.

## Casos de uso

- Ejecución local de un modelo de 125B en una GPU de consumo: con una RTX 5090 de 32 GB y `--n-cpu-moe 8`, se consiguen 68,4 tok/s en decodificación y 934 tok/s en prefill, algo inviable con el modelo original de 83,8 GiB.
- Asistente de programación en entornos sin acceso a la nube: el modelo puede generar, completar y depurar código, y al estar calibrado con corpus de código mantiene buena fidelidad en tareas de programación.
- Agente autónomo con tool calling: la calibración con orquestación de agentes permite usarlo como backend de un agente que llama a APIs, ejecuta comandos y razona sobre los resultados.
- Procesamiento de documentos largos con razonamiento `medium`: gracias a la ventana de 262k tokens y a la arquitectura GDN+QSA, puede agregar información de documentos extensos (informes, actas, papers) con precisión verificada.
- Desarrollo de aplicaciones de chat con contexto amplio: el modo `low` ofrece 12/13 en la batería de evaluación con menor latencia, adecuado para chatbots de producción.
- Investigación sobre poda de expertos: sirve como referencia para estudiar el impacto de la poda en MoE híbridos, ya que documenta métricas de masa de enrutamiento y rendimiento comparativo.
- Despliegue en servidores con CPU y GPU mixta: al poder cargar parte de los expertos en VRAM y el resto en RAM (`--n-cpu-moe`), se adapta a configuraciones heterogéneas.

## Benchmarks y rendimiento

El autor proporciona resultados de una batería de 6 tareas verificadas automáticamente (13 puntos en total), donde el código generado se ejecuta contra 10 casos ocultos, los números se comparan exactamente, el JSON se parsea y se valida, y una tarea solo puntúa si el modelo rechaza alucinar una flag inexistente. No se incluyen benchmarks estándar como MMLU o HumanEval.

| Razonamiento | Puntuación | Notas |
|---|---|---|
| `medium` | 13 / 13 | 463 s. Incluye agregación de contexto largo |
| `low` | 12 / 13 | Pierde solo la tarea de agregación de documento largo |

Rendimiento medido por el autor (ambos modelos en CPU, mismo binario y contexto):

| Ambos en CPU | Podado (256) | Original (512) | Ratio |
|---|---|---|---|
| Decodificación | 22,0 tok/s | 21,5 tok/s | 1,02× |
| Prefill | 353 tok/s | 223 tok/s | 1,58× |

Rendimiento en RTX 5090 (32 GB) con `--n-cpu-moe 8`:

| RTX 5090 | Podado |
|---|---|
| Decodificación | 68,4 tok/s |
| Prefill | 934 tok/s |

## Requisitos de hardware

- VRAM estimada: el modelo pesa 57,7 GiB en total. Con `--n-cpu-moe 8` se cargan 8 capas de expertos en VRAM y el resto en RAM, lo que permite ejecutarlo en una GPU de 32 GB (RTX 5090) con 44 de las 48 capas de expertos en VRAM.
- GPU recomendadas: RTX 5090 (32 GB) probada por el autor; GPUs con 24 GB (RTX 4090) requerirían más capas en CPU o una cuantización más agresiva.
- En CPU pura, el modelo funciona pero la decodificación no mejora respecto al original (22,0 tok/s).
- Despliegue: requiere la rama de llama.cpp con el PR #27742 (soporte para `qwen4exp`). No es compatible con llama.cpp mainline ni con vLLM u Ollama en su estado actual.
- Comando de ejemplo: `llama-server -m Qwen3.8-Flash-Next-UD-Q3_K_XL-reap256-00001-of-00002.gguf -ngl 99 --n-cpu-moe 8 -c 98304 -fa on --jinja --parallel 2 --kv-unified --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0`.
- Latencia: 68,4 tok/s de decodificación y 934 tok/s de prefill en la configuración probada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Tamaño GGUF | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B (incl. n-gram) | 6B | 262k | 83,8 GiB (Q3_K_XL) | qwen-community-1.0 | Requiere más VRAM, decode similar, prefill más lento |
| Qwen3.8-Flash-Next REAP-256 (este) | 116,5B (según HF) | 6B | 262k | 57,7 GiB | qwen-community-1.0 | Podado, cabe en 32 GB, prefill 1,58× más rápido |
| Qwen3.8-27B (dense) | 27B | 27B | 262k | ~16 GiB (Q4) | qwen-community-1.0 | Mucho más ligero, pero menos capacidad y sin MoE |

No se dispone de benchmarks comparativos estandarizados entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen; es un derivado comunitario sin afiliación con Alibaba.
- Requiere una rama específica de llama.cpp (PR #27742) que aún no está fusionada en mainline. Hasta que se integre, el archivo no se puede ejecutar con la versión estándar.
- La decodificación no mejora respecto al modelo original en CPU; la ganancia principal es el prefill y la reducción de tamaño.
- La poda elimina el 50 % de los expertos, lo que puede degradar tareas que dependen de expertos especializados no cubiertos por el corpus de calibración (código y agentes). El autor reporta una pérdida en la tarea de agregación de documentos largos con razonamiento `low`.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos en el repositorio de Qwen.
- No se documentan los idiomas soportados específicamente en esta variante, aunque el modelo base es multilingüe.
- El archivo mmproj para visión no está incluido; las capacidades de visión requieren un componente adicional.
- El autor advierte de dos trampas metodológicas en la poda (submuestreo de corpus y evaluación cruzada de dominios) que pueden inflar artificialmente la especialización; este modelo intenta evitarlas combinando dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-256-duo-GGUF
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next
- PR de llama.cpp para soporte qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742
- Blog oficial de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Análisis de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- Seguimiento de benchmarks y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
