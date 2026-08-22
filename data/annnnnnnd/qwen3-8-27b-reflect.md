# annnnnnnd/Qwen3.8-27B-Reflect

## Resumen

Qwen3.8-27B-Reflect es un ajuste fino de voz sobre el modelo denso Qwen3.8-27B de Alibaba, desarrollado por el usuario independiente annnnnnnd. Su proposito no es anadir conocimiento ni mejorar el razonamiento, sino **reformar el estilo de respuesta**: reducir la verbosidad, eliminar los rodeos iniciales (hedging) y hacer los rechazos mas decisivos. El autor lo define como un "voice tune": una intervencion minima de 4.911 ejemplos curados, entrenada solo sobre el canal de respuesta, sin tocar el canal de razonamiento.

El modelo base Qwen3.8-27B es un transformer denso de 27,3 mil millones de parametros con arquitectura hibrida de atencion: 48 de sus 64 capas usan atencion lineal y las otras 16 atencion gated completa. Incluye torre de vision y un cabezal de decodificacion especulativa MTP. La ventana de contexto nativa es de 262.000 tokens, extensible a 1M. Este adaptacion hereda todas esas capacidades, pero con un estilo de respuesta mas conciso: ~43% menos tokens de salida y 1,65x mas rapido en tiempo de reloj a igualdad o mejor precision en GSM8K.

La relevancia actual del modelo reside en que aborda un problema poco estudiado: el exceso de cualificaciones y medias refusals en los asistentes de IA, que en produccion se traduce en latencia, coste de compute y respuestas imposibles de auditar. El autor demuestra que la ambiguedad no compra seguridad (la tasa de rechazo en prompts daninos es identica a la base) y que puede eliminarse con una intervencion minima de SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention (base Qwen3.8-27B): 48/64 capas con atencion lineal, 16/64 con atencion gated completa, torre de vision, MTP draft head |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (262K), extensible a 1M |
| Tipos de cuantizacion | GGUF con imatrix, QLoRA 4-bit durante el entrenamiento |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 64 GB), GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, usa una arquitectura hibrida de atencion: de sus 64 capas, 16 ejecutan atencion gated completa (con intervalo `full_attention_interval: 4`) y las otras 48 usan atencion lineal, lo que reduce el coste cuadratico en contextos largos. Incorpora ademas una torre de vision (aunque este adaptacion no documenta uso multimodal) y un cabezal MTP para decodificacion especulativa.

El entrenamiento del adaptacion es deliberadamente minimo: **QLoRA sobre base 4-bit, r32/a32, learning rate 1e-4 constante, una sola epoca, sin etapa de DPO**. El dataset contiene 4.911 ejemplos curados (4.967 intercambios usuario-asistente): 4.865 de un solo turno, 41 de cuatro turnos y 5 mas largos. No se incluye ningun system prompt. La caracteristica clave es que **ninguna respuesta del dataset contiene bloques `thinking`**: el modelo nunca ve trazas de razonamiento, por lo que la intervencion solo toca el canal de salida. Cuando el modo thinking esta activado, el razonamiento intacto domina y el modelo converge con la base; cuando esta desactivado, el efecto del ajuste se manifiesta en su totalidad.

## Capacidades

- Generacion de texto con estilo conciso y directo: responde primero, cualifica despues, en lugar de abrir con muletillas del tipo "It is important to note…" (6,2% de las respuestas frente al 15,6% de la base).
- Razonamiento explicito heredado del base: puede activar el modo thinking para problemas complejos, con el coste adicional de latencia y tokens que eso implica.
- Refusals mas decisivos: 43% de rechazos planos frente al 28% de la base, y menos respuestas ambiguas (23 de 200 no clasificables frente a 68 de la base).
- Tool calling con mejor criterio de abstencion: en BFCL `irrelevance` reduce las llamadas a herramienta falsas de 67 a 54 sobre 240 casos.
- Multilingue en ingles y chino (en, zh), heredado del base.
- Decodificacion especulativa disponible via MTP draft head del base, compatible con vLLM.

## Casos de uso

- **Atencion al cliente automatizada**: con 262K tokens de contexto puede gestionar conversaciones multi-turno largas y mantener historial completo. Su estilo directo reduce la frustracion del usuario, ya que evita las respuestas evasivas y los rodeos que hacen perder tiempo.
- **Generacion de codigo en produccion**: soporta tool calling y su mejor criterio de abstencion en BFCL evita que el modelo invoque herramientas innecesarias en pipelines de CI/CD, reduciendo coste y ruido en los logs.
- **Inferencia de alto volumen con presupuesto de latencia ajustado**: su 43% menos de tokens de salida y 1,65x de velocidad en tiempo de reloj lo hacen atractivo para APIs de chat donde el coste por token y la latencia dominan el presupuesto.
- **Filtrado de contenido y moderacion**: al reducir las medias refusals (23 no clasificables frente a 68), los pipelines de moderacion pueden clasificar las respuestas con mas fiabilidad, sin que un rechazo ambiguo se cuele como compliance.
- **Asistentes de soporte tecnico bilingue (en/zh)**: con el modo thinking desactivado, ofrece respuestas directas y concisas, ideales para FAQs y resolucion de incidencias de primer nivel.
- **Evaluacion de modelos y harness de test**: su comportamiento mas predecible (refusals planos, menos hedging) facilita la escritura de tests automatizados que verifican si el modelo ha cumplido o rechazado una peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. Los datos proporcionados por el autor, medidos sobre el mismo hardware y flags de servidor, comparan el adaptacion con la base Qwen3.8-27B:

| Prueba | Qwen3.8-27B (base) | Qwen3.8-27B-Reflect |
|---|---|---|
| GSM8K (precision) | 94,75% | 96,00% |
| GSM8K (tokens medios de salida) | 244 | 139 |
| Velocidad de ejecucion (wall clock) | 1x | 1,65x |
| BFCL `irrelevance` (falsas llamadas a tool sobre 240) | 67 | 54 |
| IFEval (sin thinking) | referencia | -5,7 puntos |
| IFEval (con thinking) | referencia | -0,5 puntos |
| Refusals planos | 28% | 43% |
| Respuestas no clasificables (sobre 200 prompts de seguridad) | 68 | 23 |
| Aperturas con hedge ("It is important to note…") | 15,6% | 6,2% |

Estos datos provienen del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia** (para 27,3B de parametros):
  - FP16: ~55 GB
  - INT8: ~28 GB
  - INT4 (GGUF Q4_K_M): ~16 GB
- **GPU recomendadas**: A100 80GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantizacion INT4; GPU de 16 GB con GGUF Q4 si se acepta degradacion de calidad.
- **Consumer GPU**: si, con cuantizacion GGUF Q4 en una RTX 4080/4090 o similar de 16-24 GB. Con Q8 se necesita 32 GB (por ejemplo, una A6000 o una RTX 4090 con NVLink no es suficiente; se requieren 2x GPU).
- **Opciones de despliegue**: vLLM (compatible con el base y sus endpoints), llama.cpp, Ollama, TGI. El formato GGUF del repositorio facilita el despliegue en llama.cpp/Ollama.
- **Latencia y throughput**: no se han publicado cifras absolutas, pero el autor reporta 1,65x de aceleracion en tiempo de reloj respecto a la base con los mismos flags de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Resultados clave |
|---|---|---|---|---|---|
| **Qwen3.8-27B-Reflect** (este) | 27,3B | 262K | Apache-2.0 | Voice tune anti-sycophancy, SFT puro | 43% menos tokens, 1,65x mas rapido, refusals mas claros |
| **Qwen3.6-27B-Reflect** (version anterior del mismo autor) | 27,3B | 262K | Apache-2.0 | Voice tune, SFT puro | ~12% menos tokens, misma idea pero efecto mas debil |
| **Qwen3.8-27B** (base) | 27,3B | 262K | Apache-2.0 | Modelo base de Alibaba | Referencia de calidad; mas verboso y ambiguo en refusals |

El modelo no es comparable con alternativas de otros fabricantes porque no se han publicado benchmarks estandarizados (MMLU, HumanEval, etc.) para el adaptacion. La comparativa natural es contra el base y contra la version anterior del mismo autor.

## Limitaciones y advertencias

- **Solo en ingles y chino**: no soporta espanol ni otros idiomas en este adaptacion.
- **Intervencion sobre el canal de respuesta solamente**: con el modo thinking activado, el efecto del ajuste casi desaparece (los resultados convergen con la base). Si se necesita el estilo conciso, hay que desactivar thinking.
- **Coste de formato sin thinking**: IFEval cae -5,7 puntos con el modo thinking desactivado, lo que indica que la capacidad de seguir formatos estrictos se degrada ligeramente.
- **Dataset pequeno**: 4.911 ejemplos, una sola epoca; el riesgo de sobreajuste al estilo curado es real, aunque el autor argumenta que la intervencion es deliberadamente minima.
- **Datos de rendimiento no verificados**: los benchmarks son reportados por el autor, no reproducidos por terceros. El propio autor senala que los benchmarks del base son "Alibaba-reported" y no han sido verificados de forma independiente.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo deriva de Qwen3.8-27B, que tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- **Riesgo de alucinacion**: no se ha evaluado especificamente en este adaptacion; se hereda el riesgo del modelo base.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/annnnnnnd/Qwen3.8-27B-Reflect
- Version anterior del mismo autor: https://huggingface.co/annnnnnnd/Qwen3.6-27B-Reflect
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de la base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de vLLM para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Ficha de benchmarks del base en BenchLM: https://benchlm.ai/models/qwen3-8-27b
- Review del base en Neomanex: https://neomanex.com/models/qwen3-8-27b
