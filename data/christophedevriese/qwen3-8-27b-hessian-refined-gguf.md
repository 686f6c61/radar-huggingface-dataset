# christophedevriese/Qwen3.8-27B-Hessian-Refined-GGUF

## Resumen

Qwen3.8-27B-Hessian-Refined-GGUF es un artefacto de investigación publicado por Christophe Devriese que aplica una refinación posterior a la cuantización sobre el GGUF `UD-Q4_K_XL` de Unsloth derivado de Qwen3.8-27B. No se trata de una cuantización nueva desde BF16, sino de un ajuste de los códigos cuantizados existentes guiado por las matrices de pesos originales en BF16 y por aproximaciones de Hessiano calculadas sobre activaciones de calibración. El objetivo es reducir el error de cuantización en las capas lineales sin cambiar el formato GGUF ni las escalas originales.

El modelo parte de una arquitectura transformer de 64 capas con aproximadamente 27.300 millones de parámetros y una capacidad de contexto declarada de 262.144 tokens en el modelo base, aunque los límites del motor pueden reducirla. El checkpoint resultante ocupa 17.659.407.552 bytes (16,45 GiB), apenas 288 bytes más que el fichero original de Unsloth, lo que refleja que la intervención se limita a los códigos de cuantización de 379 tensores.

La relevancia de esta ficha es doble: por un lado, documenta una técnica experimental de refinación post-cuantización (estilo MACaQ) aplicada a GGUF; por otro, permite evaluar con rigor sus resultados reales, que muestran una mejora del 13,23 % en divergencia KL a corto contexto pero sin mejora en perplejidad de validación completa ni en calidad de código medible de forma fiable. El autor advierte explícitamente de que no debe presentarse como una mejora general del 13 % en calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, 64 capas) |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base (los límites de motor y recursos pueden reducirla) |
| Tipos de cuantizacion | GGUF Q4_K_XL (UD-Q4_K_XL de Unsloth, refinado) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de 64 capas con unos 27,3B de parámetros. El proceso de refinación no reentrena el modelo: parte de los códigos cuantizados de Unsloth y, para cada capa lineal, calcula una aproximación de Hessiano `H = XᵀX` a partir de activaciones de calibración y ajusta los códigos cuantizados para minimizar `L(Q) = Tr[(Q − W) H (Q − W)ᵀ]`, donde `W` son los pesos docentes en BF16 y `Q` los pesos decodificados desde la cuantización. Los formatos de código GGUF compatibles se refinan mediante volteos de código escalar o movimientos de codebook vectorial/producto, y luego se recodifican en GGUF, preservando formatos y escalas originales.

El experimento utilizó 65.536 tokens de calibración, trozos de activación de 128 tokens, 64 capas del transformer y refinó 379 tensores; la cabeza de salida quedó sin cambios. No se documentan datos de entrenamiento adicionales, composición del dataset de preentrenamiento del modelo base, ni etapas de RLHF/DPO en la información disponible. La innovación técnica destacable es precisamente el enfoque de refinación post-cuantización guiado por Hessiano, adaptado de MACaQ a actualizaciones de códigos GGUF ya cuantizados.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.8-27B.
- Razonamiento y generación de código, según los resultados parciales del autor en subconjuntos de HumanEval y LiveCodeBench.
- Inferencia compatible con llama.cpp con CUDA y con la API compatible con OpenAI de llama.cpp (probado con Open WebUI).
- Capacidad de contexto largo declarada en el modelo base (262.144 tokens), sujeta a límites de motor y recursos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata (`language: en`).
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación experimental de técnicas de post-cuantización: el modelo sirve como artefacto de comparación directa frente al GGUF original de Unsloth, midiendo KL, perplejidad y tasas de acierto en código con el mismo motor llama.cpp.
- Despliegue local en estaciones de trabajo con llama.cpp: al ocupar 16,45 GiB en Q4_K_XL, puede cargarse en GPUs de consumo alto o en configuraciones con memoria unificada, para generación de texto en inglés.
- Integración en Open WebUI: el autor verificó la inferencia mediante la API compatible con OpenAI de llama.cpp, lo que permite montar una interfaz conversacional local sin infraestructura adicional.
- Generación de código asistida en entornos de desarrollo: los resultados en subconjuntos de HumanEval (31/32) y LiveCodeBench (16/24) indican uso viable para tareas de programación en Python, aunque con cautela por el tamaño reducido de las muestras.
- Investigación sobre robustez de la cuantización: permite estudiar cómo afecta la refinación de códigos a la divergencia KL a corto contexto frente a BF16, con un protocolo reproducible de 960 posiciones reservadas.
- Reproducción de experimentos de calibración: los 65.536 tokens de calibración y los 379 tensores refinados documentados permiten replicar o variar el procedimiento en otros modelos Qwen cuantizados.
- Prototipado de pipelines de inferencia con contexto largo: la ventana declarada de 262.144 tokens del modelo base permite probar cargas de documentos extensos, siempre que el motor y la memoria lo permitan.

## Benchmarks y rendimiento

| Metrica | Unsloth original | Hessian-refinement |
|---|---:|---:|
| KL(BF16 || GGUF) a corto contexto, 960 posiciones reservadas (menor mejor) | 0,00456710 | 0,00396283 |
| Perplejidad de validación WikiText-2, 132 × 2.048 tokens (menor mejor) | 6,1009 | 6,1143 |
| HumanEval, subconjunto de 32 tareas (aciertos) | 31/32 | 31/32 |
| LiveCodeBench, subconjunto de 24 tareas AtCoder (aciertos) | 15/24 | 16/24 |

Interpretación según el autor: la modificación guiada por Hessiano redujo la divergencia KL relativa a BF16 a corto contexto un 13,23 % con un tamaño de checkpoint prácticamente constante; no mejoró la perplejidad de validación completa (0,22 % peor) y no mostró una mejora fiable en calidad de código (un acierto adicional en un subconjunto muy pequeño). Los tests de código son subconjuntos personalizados, no puntuaciones oficiales de leaderboard; el subconjunto de LiveCodeBench usó hasta 16 casos retenidos por problema, un límite fijo de 2.048 tokens de generación y generación en Python con temperatura cero.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 16,45 GiB en Q4_K_XL; se necesita memoria adicional para el contexto KV y el runtime de llama.cpp, por lo que conviene prever margen por encima de los 16,45 GiB.
- GPU recomendadas: no disponible de forma explícita en la información proporcionada; el autor solo confirma pruebas con llama.cpp con CUDA habilitado.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el tamaño del fichero sugiere que requiere GPUs con al menos 24 GB de VRAM o configuraciones con memoria unificada, pero no hay validación publicada.
- Opciones de despliegue: llama.cpp (con CUDA) y Open WebUI mediante la API compatible con OpenAI de llama.cpp. No se documentan pruebas con vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Hessian-Refined-GGUF | aprox. 27,3B | 262.144 tokens (base) | GGUF Q4_K_XL refinado | no disponible | Refinación post-cuantización experimental; KL 0,00396283; WikiText-2 ppl 6,1143 |
| Unsloth UD-Q4_K_XL de Qwen3.8-27B | aprox. 27,3B | 262.144 tokens (base) | GGUF Q4_K_XL | no disponible | Punto de partida; KL 0,00456710; WikiText-2 ppl 6,1009 |
| Qwen3.8-27B (BF16) | aprox. 27,3B | 262.144 tokens | BF16 | no disponible | Referencia docente usada en la evaluación |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La mejora del 13,23 % en KL se limita a contexto corto (960 posiciones reservadas) y no debe extrapolarse a una mejora general de calidad del modelo.
- La perplejidad de validación completa empeora ligeramente (0,22 %), lo que indica que la refinación no es uniformemente beneficiosa.
- Los resultados de código provienen de subconjuntos personalizados y pequeños (32 y 24 tareas), sensibles a selección, decodificación, timeouts y reglas del verificador; no son puntuaciones oficiales de leaderboard.
- El autor declara que los resultados son preliminares y que el artefacto se ofrece sin garantía de mejora en tareas downstream.
- Idiomas: la metadata declara únicamente inglés; no hay evidencia de rendimiento multilingüe.
- Licencia no disponible: es necesario revisar las licencias del modelo original Qwen y del GGUF de Unsloth antes de cualquier redistribución comercial.
- El modelo redistribuye pesos adaptados de Qwen3.8-27B y de su derivado de Unsloth; se deben cumplir los requisitos de atribución y redistribución upstream.
- Solo se ha probado la inferencia de generación de texto con llama.cpp con CUDA y Open WebUI; no hay evidencia de equivalencia entre motores ni de servicio de despliegue soportado.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; deben asumirse los del modelo base.
- La ventana de 262.144 tokens es una capacidad del modelo base y puede verse reducida por límites del motor y de recursos.

## Enlaces

- Hugging Face: https://huggingface.co/christophedevriese/Qwen3.8-27B-Hessian-Refined-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de partida (Unsloth): https://huggingface.co/unsloth
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Informe técnico: Hessian-guided refinement of an Unsloth Qwen3.8-27B GGUF (Christophe Devriese, 12 de noviembre de 2026); no se proporciona URL en la información disponible.
