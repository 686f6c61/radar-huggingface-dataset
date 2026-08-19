# ayushcluster00/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF-Config

## Resumen

El modelo **Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF-Config** es una versión cuantizada en formato GGUF del modelo **Qwen3.8-27B** de Alibaba, sometido a un proceso de abliteración (eliminación quirúrgica de la alineación de seguridad) mediante la técnica **ARA (Arbitrary-Rank Ablation)** implementada en la herramienta de código abierto **Heretic**. El autor, `ayushcluster00`, parte del trabajo previo de `trohrbaugh` (que ya había aplicado una primera pasada ARA) y lo refina con **dos pasadas adicionales de ARA sobre todos los pesos**, dando lugar a la variante denominada **RVN** (Refined Variant N). El resultado es un modelo que conserva las capacidades del base (con una divergencia KL de solo 0.0085 respecto al original) mientras reduce la tasa de rechazos ante peticiones dañinas de 3/100 a 0-1/100.

La arquitectura es híbrida: combina 16 capas de atención estándar con 48 capas de **Gated DeltaNet** (atención lineal recurrente), lo que permite manejar una ventana de contexto de **262 144 tokens** (262K) con un coste computacional subcuadrático. Con 27 000 millones de parámetros y licencia Apache-2.0, este modelo se posiciona como una opción para aplicaciones de generación de texto sin restricciones temáticas, especialmente en ámbitos de roleplay, escritura creativa para adultos e investigación sobre alineamiento y seguridad. Su relevancia actual radica en la creciente demanda de modelos "uncensored" para entornos controlados, así como en el interés técnico por las técnicas de abliteración de bajo daño conductual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (híbrida: 16 capas de atención estándar + 48 capas Gated DeltaNet) |
| Parametros totales | 26 895 998 464 (27B) |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M como legado; otras cuantizaciones no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), sin tensores MTP/NextN |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** utiliza una arquitectura híbrida denominada `qwen3_5_text`, que combina atención softmax estándar (16 capas) con **Gated DeltaNet** (48 capas), una variante de atención lineal recurrente que reduce el coste computacional y de memoria frente a la atención completa, permitiendo una ventana de contexto de 262K tokens. El modelo tiene un tamaño de capa oculta de 5120, 24 cabezas de atención con 4 cabezas KV (GQA) y un vocabulario de 248 320 tokens.

El proceso de abliteración se realiza con la herramienta **Heretic**, que implementa **ARA (Arbitrary-Rank Ablation)**. A diferencia de la abliteración direccional clásica (que resta una única dirección de rechazo), ARA formula el problema como una optimización matricial: para cada módulo objetivo (proyección de salida de atención y proyección de bajada del MLP), recopila activaciones de prompts "buenos" (peticiones inofensivas) y "malos" (peticiones dañinas), y mediante un optimizador LBFGS reescribe la matriz de pesos para preservar las salidas en prompts buenos (minimizando KL), orientar las salidas de prompts malos hacia el manifold de salidas buenas (vía k-NN), y sobrecorregir alejando las salidas de prompts malos de las originales. Esto permite eliminar circuitos de rechazo complejos con un daño conductual mínimo.

La variante **RVN** aplica el procedimiento ARA **tres veces en total**: una pasada original de `trohrbaugh` (que produjo `Qwen3.8-27B-heretic-ara` con KL 0.0535 y 3/100 rechazos) y dos pasadas adicionales realizadas por `ayushcluster00` con los mismos parámetros (start 26, end 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038, neighbor 10). El resultado final presenta una KL de 0.0085 frente al base y una tasa de rechazo de 0-1/100 en una evaluación independiente de 100 comportamientos dañinos. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre posibles fases de RLHF/DPO posteriores a la abliteración.

## Capacidades

- Generación de texto y finalización de secuencias en formato conversacional y de instrucciones.
- Razonamiento y resolución de problemas, heredados del modelo base Qwen3.8-27B (que incluye capacidades de razonamiento paso a paso).
- Generación de código y soporte de matemáticas, según las capacidades del base (no verificadas específicamente en esta variante).
- Soporte de tool calling / function calling: no confirmado explícitamente en la documentación, pero probablemente heredado del base (se recomienda verificar en la documentación oficial de Qwen3.8).
- Capacidades multilingües: no especificadas; se asume que el base soporta múltiples idiomas, pero no hay confirmación para esta variante.
- Capacidad de roleplay y escritura creativa sin restricciones temáticas (para adultos), gracias a la reducción de rechazos.
- Modo de pensamiento (thinking mode): el base Qwen3.8 incluye modos de razonamiento explícito; no se confirma si esta variante los conserva íntegramente, aunque la baja KL sugiere que sí.
- No incluye capacidades de visión ni audio (es un modelo de texto puro).

## Casos de uso

- **Roleplay y ficción interactiva para adultos**: el modelo puede mantener conversaciones multi-turno con contexto largo (262K tokens) sin rechazar temas explícitos o controvertidos, lo que lo hace adecuado para plataformas de roleplay textual donde los usuarios esperan respuestas sin censura.
- **Escritura creativa de contenido maduro**: autores y guionistas pueden usarlo para generar borradores de narrativa con violencia, sexo o temas oscuros, sin interrupciones por parte de los guardarraíles. La baja KL asegura que el estilo y la coherencia del base se mantienen.
- **Investigación en seguridad y alineamiento**: permite estudiar el comportamiento de modelos abliterados en entornos controlados, analizar qué tipos de peticiones siguen generando rechazo (p. ej., armas químicas) y evaluar la eficacia de técnicas de abliteración iterativas.
- **Generación de diálogos para personajes en juegos**: desarrolladores de juegos de rol o simulaciones pueden integrar el modelo como motor de diálogo para personajes no jugadores (NPC) con personalidades complejas y sin restricciones temáticas, gracias a su capacidad de mantener contexto extenso.
- **Análisis de contenido sensible en entornos académicos**: investigadores de ciencias sociales o lingüística pueden generar corpus de texto sobre temas tabú para estudios de discurso, siempre bajo protocolos éticos y legales.
- **Prototipado de asistentes sin rechazos injustificados**: en aplicaciones donde el modelo base rechaza peticiones legítimas (p. ej., preguntas sobre drogas con fines educativos), esta variante puede reducir falsos positivos de rechazo, aunque con el riesgo de aceptar peticiones dañinas.
- **Experimentación con técnicas de abliteración**: como referencia para desarrolladores que quieran comparar el comportamiento de diferentes métodos de eliminación de censura (direccional vs. ARA) sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. La model card únicamente reporta métricas específicas del proceso de abliteración, que se resumen en la siguiente tabla:

| Metrica | Modelo base (Qwen3.8-27B) | `heretic-ara` (1 pasada) | **RVN (3 pasadas)** |
|---|---|---|---|
| Tasa de rechazo (100 prompts dañinos) | No disponible | 3/100 | **0-1/100** |
| Divergencia KL vs. base | 0 | 0.0535 | **0.0085** |

Estos datos indican una mejora sustancial en la reducción de rechazos con un daño conductual mínimo, pero no proporcionan información sobre calidad de generación, razonamiento o código. Para evaluar el rendimiento en tareas generales, se recomienda consultar los benchmarks del modelo base Qwen3.8-27B en su repositorio oficial.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización típica de un modelo de 27B):
  - Q4_K_M: ~16-17 GB
  - Q5_K_M: ~19-20 GB
  - Q8_0: ~28-29 GB
  - F16 (no incluido en el repo, pero posible): ~54 GB
- **GPU recomendadas**: para cuantizaciones Q4/Q5, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) es suficiente. Para Q8 o F16, se necesitan GPUs profesionales (A100 40GB, H100 80GB) o múltiples GPUs.
- **¿Cabe en GPU de consumo?**: Sí, con cuantización Q4_K_M o Q5_K_M en GPUs de 24 GB (RTX 3090/4090). Con Q4, también podría caber en una RTX 4080 de 16 GB si se usa offloading parcial, aunque no es recomendable.
- **Opciones de despliegue**: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), LM Studio, text-generation-webui, o vLLM (si se convierte a safetensors). También se puede usar transformers con carga de pesos GGUF mediante `llama-cpp-python`.
- **Latencia y throughput**: no disponibles. Al ser un modelo híbrido con Gated DeltaNet, se espera un mejor rendimiento en contexto largo que un transformer puro del mismo tamaño, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals (100 prompts) | KL vs. base | Formato |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B (base)** | 27B | 262K | Apache-2.0 | No disponible | 0 | safetensors |
| `trohrbaugh/Qwen3.8-27B-heretic-ara` | 27B | 262K | Apache-2.0 | 3/100 | 0.0535 | safetensors |
| **`ayushcluster00/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF-Config` (RVN)** | 27B | 262K | Apache-2.0 | 0-1/100 | 0.0085 | GGUF |

Frente al modelo base, la variante RVN ofrece una eliminación casi total de rechazos con un daño conductual muy bajo. Comparado con la versión de una sola pasada (`heretic-ara`), RVN mejora tanto la tasa de rechazo como la preservación del comportamiento original (KL 6 veces menor). No se dispone de comparativas con otros modelos abliterados de la comunidad (p. ej., versiones de Llama o Mistral abliteradas), por lo que la comparación se limita a la misma familia.

## Limitaciones y advertencias

- **Contenido potencialmente dañino**: al reducir los guardarraíles, el modelo puede generar texto sobre violencia, actividades ilegales, contenido sexual explícito u otros temas sensibles. No es apto para menores de 18 años y su uso debe ajustarse a las leyes locales.
- **Sesgos del modelo base**: la abliteración no elimina los sesgos sociales, culturales o de género presentes en Qwen3.8-27B; estos pueden amplificarse en contextos sin censura.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados. La abliteración no corrige este comportamiento.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; se asume que hereda los del base (principalmente inglés y chino), pero no hay confirmación para esta variante.
- **Sobre-pensamiento (overthinking)**: según análisis de la comunidad (DEV Community), Qwen3.8-27B tiende a generar razonamientos verbosos incluso para peticiones simples; esta variante podría heredar ese comportamiento, afectando a la latencia y a la concisión de las respuestas.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el autor advierte que el modelo está diseñado para audiencias adultas y que el uso responsable es responsabilidad del usuario. No hay restricciones explícitas adicionales, pero el despliegue en aplicaciones públicas puede requerir moderación adicional.
- **Caveat de producción**: al ser una versión GGUF sin tensores MTP/NextN, la generación especulativa (speculative decoding) no está disponible en esta variante, lo que puede afectar al throughput en comparación con el modelo original en safetensors.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ayushcluster00/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF-Config
- Repositorio HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio HuggingFace de la fuente intermedia (`heretic-ara`): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta Heretic (implementación de ARA): https://github.com/p-e-w/heretic
- Repositorio oficial de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Repositorio alternativo con la misma variante (0bserverx): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Artículo sobre el comportamiento de "overthinking" en Qwen3.8-27B: https://dev.to/kaixintelligence/qwen-38-27b-why-this-powerful-model-cant-stop-overthinking-and-how-to-fix-it-5dh6
