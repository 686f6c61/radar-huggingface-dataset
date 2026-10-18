# Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove50

## Resumen

`Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 50,00 % de los parámetros densos. Sobre esa base comprimida se aplica una regla de selección de componentes SVD etiquetada como `unknown`, con un presupuesto de restauración del 0,000 % (cero componentes restaurados), semilla 42 y una fracción de parámetros resultante de 0,4997. El autor lo publica como una celda más de una malla experimental sobre reglas de selección y presupuestos, no como un asistente desplegable.

El interés del modelo es, por tanto, metodológico: sirve para cuantificar cuánto daño sufre el comportamiento de seguridad de un modelo alineado cuando se comprime con SVD y hasta qué punto distintas reglas de restauración de componentes pueden repararlo. La model card advierte explícitamente de que varias celdas de la malla están "deliberadamente degradadas en seguridad" respecto al original y de que la compresión por sí sola eleva la tasa de éxito de ataque.

Los números publicados respaldan esa advertencia: 0,3731 de ASR en AdvBench y 0,3387 en StrongREJECT (ambos con juez HarmBench), con una perplexity de 53,4957 en WikiText-2, muy por encima de la de un modelo de 8B sin comprimir, y un sobre-rechazo macro de 0,0981 medido con WildGuard. Es un artefacto de interpretabilidad y evaluación de seguridad, con licencia Llama 3 y cero descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), denso; pesos comprimidos mediante SVD-LLM con rango reducido |
| Parámetros totales | 8.030.261.248 en safetensors; fracción de parámetros densos resultante tras la compresión: 0,4997 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens (heredada de Llama-3-8B-Instruct; la ficha no documenta modificaciones) |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors; 16,1 GB para 8030 M de parámetros implica ~2 bytes por parámetro, coherente con bf16. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No declarados en la ficha. El modelo base declara inglés como idioma oficial y soporte para alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3 Community License; el repositorio incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors, cargable con `transformers`; tamaño del repositorio: 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención causal y GQA, sin cambios estructurales. La intervención no es un reentrenamiento, sino una compresión post-hoc mediante SVD-LLM que reduce el rango de las matrices de peso hasta eliminar el 50,00 % de los parámetros densos. Sobre esa base, el checkpoint aplica una regla de selección de componentes SVD denominada `unknown` con presupuesto de restauración de 0,000 %, es decir, ningún componente se restaura y ninguno se sustituye. La fracción de parámetros densos final es 0,4997 y la semilla empleada es 42.

No se documenta en la información disponible ningún dato sobre volumen de tokens de entrenamiento, composición del dataset, etapas de RLHF o DPO adicionales, ni innovaciones de inferencia como decodificación especulativa o atención lineal. Toda la alineación del modelo procede del checkpoint original de Meta; la contribución de este artefacto es exclusivamente la transformación de compresión y la selección (nula) de componentes a restaurar. El nombre del repositorio codifica parte de la configuración experimental (`ka16`, `a1p0`, `free`, `remove50`), aunque la ficha no describe la semántica exacta de cada token del identificador.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados de Llama-3-8B-Instruct, pero con calidad degradada por la compresión (perplexity de 53,4957 en WikiText-2).
- Razonamiento de un solo turno y respuesta a preguntas; no se documentan modos de razonamiento extendido ni "thinking mode".
- Generación de código y matemáticas: capacidad presumible por herencia del modelo base, sin métricas publicadas que la cuantifiquen en este checkpoint.
- Multilingüismo: no declarado en la ficha; limitado a lo que el modelo base conserve tras la compresión.
- Soporte de tool calling / function calling: no documentado. Llama 3 8B Instruct no incluye plantilla oficial de tool calling y esta ficha no añade ninguna.
- Capacidades de agente y razonamiento multi-paso: no documentadas y, dado el nivel de degradación medido, no recomendables.
- Capacidad "especial" del artefacto: servir como sujeto experimental para medir el impacto de la compresión SVD en la alineación de seguridad (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard).

## Casos de uso

- Estudio de ablación de reglas de selección SVD: el checkpoint es la celda con presupuesto de restauración 0,000 % y regla `unknown`, por lo que se usa como referencia inferior al comparar otras celdas de la malla que sí restauran componentes.
- Medición del daño de seguridad inducido por compresión: alimentar el modelo con los conjuntos AdvBench y StrongREJECT y comparar el ASR (0,3731 y 0,3387) con el del Llama-3-8B-Instruct sin comprimir para aislar el efecto de la compresión.
- Calibración de sobre-rechazo: usar el 0,0981 macro de WildGuard como punto de partida para estudiar si la compresión reduce o desplaza la tasa de rechazos legítimos frente a ataques.
- Análisis de la relación perplexity-seguridad: con una perplexity de 53,4957 en WikiText-2, el modelo permite trazar la curva entre degradación de modelado de lenguaje y degradación de alineación dentro de la misma malla experimental.
- Reproducción de experimentos: la semilla 42 y la configuración documentada (compresión al 50 %, presupuesto 0 %, cero componentes restaurados) permiten replicar la celda y verificar las métricas publicadas.
- Docencia e interpretabilidad: ilustrar en un curso o artículo cómo una intervención puramente lineal (SVD sobre matrices de pesos) altera propiedades de alto nivel como la resistencia a jailbreaks, sin tocar el dataset de alineación.
- Red teaming comparativo de pipelines de evaluación: validar que un arnés de evaluación de seguridad (HarmBench, WildGuard) detecta degradaciones conocidas antes de aplicarlo a modelos en producción.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,3731 |
| StrongREJECT | ASR (juez HarmBench) | 0,3387 |
| WildGuard | Sobre-rechazo macro | 0,0981 |
| WikiText-2 | Perplexity | 53,4957 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de tareas de conocimiento general para este checkpoint, ni los valores correspondientes del modelo base sin comprimir que permitan calcular el delta exacto. La model card sí afirma cualitativamente que la compresión por sí sola eleva la tasa de éxito de ataque, por lo que los ASR anteriores deben interpretarse como degradación respecto al checkpoint original, no como rendimiento de referencia.

## Requisitos de hardware

- VRAM para inferencia en bf16: ~16,1 GB solo de pesos. Con 8192 tokens de contexto, la caché KV de Llama 3 8B consume ~128 KiB por token, es decir, ~1 GiB a contexto completo; presupuestar 18-20 GB en total para lote 1.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 o L40S para servir con lotes y contexto largo sin cuantizar.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con lote pequeño; en RTX 3090 (24 GB) de forma similar. Para tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) haría falta cuantización de 8 o 4 bits, no publicada en el repositorio.
- Despliegue: al conservar la estructura Llama, es previsible que funcione con `transformers`, TGI (la etiqueta `endpoints_compatible` está presente) y vLLM; para llama.cpp u Ollama habría que convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_jbb_ka16_a1p0_free_remove50 | 8,03 B almacenados; fracción densa 0,4997 | 8192 | Llama 3 Community License | HuggingFace, 0 descargas | Artefacto de investigación con seguridad degradada (ASR 0,3731 en AdvBench) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8192 | Llama 3 Community License | HuggingFace, ampliamente desplegado | Modelo base sin comprimir; métricas de referencia no incluidas en la información proporcionada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131072 | Llama 3.1 Community License | HuggingFace | Generación posterior con contexto mucho mayor y soporte de tool calling |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32768 | Apache 2.0 | HuggingFace | Alternativa de tamaño similar con licencia permisiva |

Los datos de los tres modelos de referencia provienen de sus model cards públicas y no están verificados en la información proporcionada para esta ficha; se incluyen solo como contexto de categoría. No hay comparación de benchmarks disponible entre este checkpoint y las alternativas.

## Limitaciones y advertencias

- Modelo deliberadamente degradado en seguridad: el ASR de 0,3731 en AdvBench y 0,3387 en StrongREJECT indican que aproximadamente un tercio de los ataques tienen éxito. No debe exponerse a usuarios finales ni integrarse en productos.
- Calidad de lenguaje mermada: una perplexity de 53,4957 en WikiText-2 implica una fluidez y coherencia muy inferiores a las de un modelo de 8B sin comprimir; es probable que aparezcan repeticiones, incoherencias y pérdida de formato.
- Riesgo de alucinación: no medido en la ficha, pero esperable al alza dado el nivel de compresión y la caída de calidad de modelado.
- Sesgos: no se documenta ninguna evaluación de sesgo en la información disponible; los sesgos del checkpoint original de Meta persisten y pueden verse amplificados por la compresión.
- Idiomas: la ficha no declara idiomas soportados; el rendimiento fuera del inglés es indeterminado y presumiblemente más frágil tras la compresión.
- Restricciones de licencia: Llama 3 Community License, con las obligaciones de `USE_POLICY.md`, la cláusula de 700 millones de usuarios activos mensuales y los requisitos de atribución ("Built with Meta Llama 3"). El uso comercial está sujeto a los términos de Meta, no es una licencia permisiva tipo Apache 2.0.
- Naturaleza experimental: el autor indica explícitamente que cada celda debe tratarse como sujeto de experimentación, no como asistente desplegable, y que hay que evaluarla por cuenta propia antes de extraer conclusiones.
- Trazabilidad limitada: no se publican datos de entrenamiento, tokenizador modificado ni instrucciones de conversión a GGUF; la reproducibilidad depende de la semilla 42 y de la descripción de procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: archivos `LICENSE` y `USE_POLICY.md` incluidos en el repositorio del modelo
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales.
