# Secondchancee/Ternary-Bonsai-2-27B-Steered

## Resumen

Ternary-Bonsai-2-27B-Steered es una variante del modelo Ternary-Bonsai-2-27B de Prism ML, publicada por el usuario Secondchancee, que combina los pesos cuantizados en ternario de 1,58 bits (formato PQ2_0, GGUF) con un vector de control específico para cancelar el comportamiento de rechazo. Se trata de un derivado de la familia Qwen 3.x de 27B (64 capas, 4 cabezas KV) cuya característica diferencial no es el entrenamiento, sino la aplicación en tiempo de inferencia de un vector de control que resta la dirección de rechazo del flujo residual.

El problema que aborda es técnico: en modelos cuantizados a ternario los pesos son planos de bits discretos {-1, 0, 1} y no se pueden proyectar ni re-cuantizar sin destruir los kernels de cuantización entera, por lo que las técnicas habituales de "abliteration" no son aplicables. La solución propuesta consiste en usar el soporte nativo de control vectors de llama.cpp (`--control-vector-scaled refusal_vector_27b.gguf:-1.0`) para sustraer dinámicamente la dirección de rechazo en precisión flotante completa durante cada paso de generación.

El resultado son 7,21 GB de pesos en disco con una ventana de contexto declarada de 131.072 tokens y una salida máxima de 16.384 tokens. Es relevante porque demuestra que la eliminación de rechazos es viable incluso en el régimen de cuantización extrema, y porque abarata el despliegue local de un modelo de 27B con contexto de 128k en hardware de consumo. Como contrapartida, el modelo pierde deliberadamente las barreras de seguridad del modelo original y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen 3.x, 64 capas, 4 cabezas KV |
| Parámetros totales | No disponible de forma fiable: la model card indica una base de 27B; el metadato safetensors del repositorio consigna 322.560, dato inconsistente con el tamaño real |
| Longitud de contexto | 131.072 tokens (128k) |
| Longitud máxima de generación | 16.384 tokens |
| Tipos de cuantización | Ternario 1,58 bits (PQ2_0); formato GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos principales + `refusal_vector_27b.gguf` de control) |
| Tamaño en disco | 7,21 GB (pesos) / 7,2 GB (repositorio completo) |
| Modificador de comportamiento | Control vector por PCA sobre las 64 capas, α = -1,0 |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de Qwen 3.x con 64 capas de decodificador y 4 cabezas KV (una configuración de atención con GQA muy agresiva, coherente con el objetivo de reducir el coste del caché KV en contextos largos). Sobre esta base, Prism ML aplicó una cuantización ternaria de 1,58 bits en formato PQ2_0, que restringe los pesos a valores discretos {-1, 0, 1} más un factor de escala, comprimiendo el modelo hasta 7,21 GB en disco. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación destacable no está en el entrenamiento sino en el procedimiento de modificación de comportamiento. El autor aplica la metodología de Arditi et al. (2024), según la cual el rechazo está mediado por una única dirección en el espacio de activaciones, y calcula un vector de control por análisis de componentes principales sobre las 64 capas del decodificador. La edición se realiza en inferencia: en cada paso se resta la dirección de rechazo del flujo residual con precisión flotante completa, sin tocar los pesos ternarios. La intensidad recomendada es α = -1,0, con un rango útil declarado de -0,8 a -1,2. El autor afirma que este enfoque preserva la precisión ternaria original y evita el colapso de perplejidad que produciría una modificación directa de los pesos. El soporte de decodificación especulativa, atención lineal u otras optimizaciones no se menciona.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen 3.x de 27B, sujetos a la degradación propia de la cuantización ternaria.
- Generación de código, presumiblemente con soporte de contexto de repositorio completo gracias a la ventana de 131.072 tokens.
- Ventana de contexto larga: hasta 131.072 tokens de entrada y hasta 16.384 tokens de salida por generación.
- Cancelación de rechazos en tiempo de inferencia: el modelo no emite preámbulos del tipo "no puedo ayudar con esto" ni advertencias éticas, según el autor.
- Análisis técnico directo de temas sensibles: el autor declara que explica vulnerabilidades, ingeniería inversa y mecánicas de seguridad de forma objetiva.
- Modo de razonamiento ampliado: la model card menciona un parámetro `reasoning_effort` con valores `medium`, `high` y `xhigh` para clientes como Cursor, Roo Code o Cline; no se documenta formalmente como "thinking mode".
- Tool calling / function calling: no documentado, no disponible.
- Capacidades de agente y multi-step reasoning: no documentadas explícitamente, aunque la integración en clientes tipo Cline o Roo Code apunta a uso agéntico.
- Capacidades multilingües: no disponibles; el repositorio declara únicamente inglés.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Análisis de seguridad ofensivo: el modelo, con el vector de control activo, está pensado para explicar mecánicas de bajo nivel como desbordamientos de búfer, corrupción de memoria o vectores de explotación, sin las interrupciones moralizantes que introduciría el modelo alineado. Es adecuado para equipos de pentesting que necesitan respuestas técnicas directas.
- Red teaming de sistemas de IA: sirve como generador de prompts adversariales y de contenido que otros modelos rechazarían, lo que permite evaluar la robustez de clasificadores de seguridad y filtros de moderación.
- Investigación en alineación y control vectors: es un caso de reproducción directa del trabajo de Arditi et al., útil para estudiar cómo se comporta la dirección de rechazo en un modelo cuantizado a 1,58 bits y hasta qué punto el método se transfiere a regímenes de cuantización extrema.
- Asistente de código en local con contexto de repositorio: con 128k tokens de ventana, permite cargar ficheros completos de un proyecto y mantener coherencia entre módulos, integrándose en clientes como Cursor, Roo Code o Cline y desplegándose vía `llama-server` con API compatible con OpenAI.
- Procesamiento de documentación técnica extensa en máquina local: informes, RFCs, manuales o expedientes que caben en 131.072 tokens pueden analizarse sin enviar datos a servicios en la nube, un requisito habitual en entornos con restricciones de confidencialidad.
- Auditoría de código y búsqueda de vulnerabilidades en pipelines internos: el modelo puede integrarse en un servidor `llama-server` local y consumirse desde scripts de CI/CD para revisar diffs o señalar patrones inseguros, sin coste de API externa.
- Despliegue en hardware de consumo como alternativa a modelos de 7-8B en FP16: al ocupar 7,21 GB en disco, un modelo de 27B entra en GPUs de 12-24 GB, lo que permite obtener calidad de modelo grande en estaciones de trabajo sin aceleradores de datacenter.
- Generación de contenido sin restricciones temáticas para ficción, guiones o narrativa de temática adulta o violenta, donde los rechazos del modelo alineado resultan un obstáculo operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC ni de perplejidad, ni comparaciones cuantitativas con el modelo base sin el vector de control. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- Pesos: 7,21 GB en disco en formato PQ2_0; es un dato declarado por el autor.
- VRAM mínima para contexto corto: aproximadamente 8 GB, con el modelo completo descargado en GPU (`-ngl 99`) y una ventana reducida; el margen es muy estrecho en tarjetas de 8 GB.
- VRAM estimada para el contexto completo: el autor afirma que el modelo soporta 128k tokens en menos de 10 GB de VRAM, lo que requiere cuantizar el caché KV (`--cache-type-k q4_0 --cache-type-v q4_0`). Con 64 capas y 4 cabezas KV, y asumiendo una dimensión de cabeza de 128 (no confirmada), el caché KV en FP16 ocuparía unos 131 KB por token, es decir, alrededor de 16,8 GB a 131.072 tokens; con cuantización q4_0 bajaría a unos 4,2 GB. Sumado a los pesos, el total estimado se sitúa en el entorno de 11-12 GB, por lo que la cifra de "menos de 10 GB" es optimista y depende de la configuración exacta. Estas cifras son estimaciones de cálculo, no datos publicados.
- GPU recomendadas: RTX 4090 (24 GB) para contexto largo completo; RTX 3090/4080 (16-24 GB) como alternativa; A100 40/80 GB y H100 para despliegue multiusuario con batching continuo; RTX 3060 12 GB o RTX 4070 para contexto medio.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 12 GB o más con contexto moderado, y en 24 GB con la ventana completa y caché KV cuantizado.
- Opciones de despliegue documentadas: llama.cpp únicamente. `llama-server` con API compatible con OpenAI y Anthropic, `llama-cli` para uso en terminal, flash attention, batching continuo y cuantización del caché KV. No se documentan vLLM, TGI, Ollama ni TensorRT-LLM, y es previsible que no sean compatibles sin trabajo adicional, ya que el control vector es una función específica de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Modificación de seguridad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Steered | 27B (declarado) | 131.072 | Ternaria 1,58 bits (PQ2_0) | Apache-2.0 | Control vector, α = -1,0 | No |
| Ternary-Bonsai-2-27B (base, Prism ML) | 27B (declarado) | No disponible en la información | Ternaria 1,58 bits (PQ2_0) | Apache-2.0 | Ninguna (modelo alineado) | No disponible en la información |
| BitNet b1.58 2B4T (Microsoft) | 2.000 millones | 4.096 (según documentación pública del modelo) | Ternaria 1,58 bits | MIT | Ninguna | Sí, publicados por Microsoft |

La comparación directa más pertinente es con el modelo base de Prism ML, del que este repositorio es una derivación con el vector de control añadido; la diferencia funcional se limita al comportamiento de rechazo, ya que los pesos ternarios son los mismos. Frente a BitNet b1.58 2B4T, la propuesta de Secondchancee ofrece un orden de magnitud más de parámetros y una ventana de contexto 32 veces mayor, a cambio de un despliegue menos estandarizado. No se dispone de datos de rendimiento que permitan comparar calidad entre los tres.

## Limitaciones y advertencias

- Eliminación deliberada de barreras de seguridad: el vector de control suprime los rechazos del modelo alineado. Esto implica un riesgo real de generar contenido dañino, instrucciones operativas de ataque o material sujeto a restricciones legales, y traslada toda la responsabilidad de filtrado al usuario o al sistema que lo envuelva.
- No hay evaluación de seguridad publicada: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, no incluye benchmarks ni auditoría externa, y el autor no documenta pruebas de regresión sobre capacidades tras aplicar el vector.
- Efecto del vector de control no verificado de forma independiente: la afirmación de que no hay degradación de razonamiento ni colapso de perplejidad es del propio autor y no está respaldada con mediciones. Tampoco se documenta qué ocurre fuera del rango α = -0,8 a -1,2, donde el autor advierte de pérdida de calidad de razonamiento.
- Degradación esperada por cuantización: la cuantización ternaria de 1,58 bits es un régimen extremo; cabe esperar pérdida de precisión en tareas de razonamiento matemático, código complejo y recuperación de hechos poco frecuentes en comparación con el modelo en FP16 o BF16.
- Limitación de idioma: el repositorio declara únicamente inglés. El rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación; en temas técnicos sensibles el modelo puede producir detalles plausibles pero incorrectos, especialmente vulnerabilidades o APIs inventadas.
- Restricciones de licencia: el repositorio declara Apache-2.0, pero al derivar de un modelo base de la familia Qwen 3.x conviene verificar los términos aplicables al modelo original, especialmente si se pretende uso comercial. La eliminación de mecanismos de seguridad puede contravenir las condiciones de uso del modelo base.
- Compatibilidad de despliegue limitada: depende de la función de control vectors de llama.cpp; no hay soporte documentado en vLLM, TGI u Ollama, lo que complica el escalado en producción y la integración con infraestructura existente.
- Metadatos inconsistentes: el repositorio declara 322.560 parámetros en los metadatos de safetensors frente a los 27B de la model card; conviene verificar el contenido real antes de dimensionar hardware.
- Contexto largo en la práctica: la ventana de 131.072 tokens es teórica; la degradación de la atención a distancias muy largas no está medida, y el "menos de 10 GB de VRAM" declarado depende de cuantizar el caché KV, lo que introduce pérdida adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Secondchancee/Ternary-Bonsai-2-27B-Steered
- Modelo base cuantizado (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Organización Prism ML en HuggingFace: https://huggingface.co/prism-ml
- Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction": https://arxiv.org/abs/2406.11717
- llama.cpp (implementación de control vectors y formato GGUF): https://github.com/ggml-org/llama.cpp
