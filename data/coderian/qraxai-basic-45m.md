# coderian/QraXAi-Basic-45M

## Resumen

QraXAi-Basic-45M es un transformer decoder-only de 44.751.872 parámetros (~44,75 M) entrenado desde cero por el usuario coderian sobre el dataset sintético TinyStories. No es un fine-tune de GPT-2: la implementación es un GPT escrito a mano en PyTorch (`model.py` y `configuration_qraxai.py`), y lo único que comparte con GPT-2 es el tokenizador BPE de 50.257 tokens. El repositorio ocupa 0,2 GB y los pesos se distribuyen en fp32 (179 MB) en formato safetensors.

El modelo resuelve un problema acotado y muy concreto: servir como banco de pruebas reproducible de una arquitectura causal pequeña, con código propio y requisitos de cómputo mínimos. Con 24 capas, dimensión oculta de 256, 8 cabezas de atención y una ventana de contexto de solo 256 tokens, está pensado para experimentación, docencia y demostraciones, no para uso en producción.

Su relevancia actual es doble. Por un lado, ejemplifica el flujo completo de entrenamiento desde cero (tokenizador, dataset en streaming, bucle de entrenamiento, publicación con `trust_remote_code`). Por otro, reproduce a escala diminuta el experimento del paper TinyStories (arXiv:2305.07759), que mostró que modelos por debajo de 10 M de parámetros pueden generar texto gramaticalmente coherente si el corpus de entrenamiento es lo bastante simple. No tiene descargas ni likes registrados y el autor lo etiqueta explícitamente como modelo de investigación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, pre-norm, atención causal |
| Parametros totales | 44.751.872 (~44,75 M), todos entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (límite duro; `forward` lanza `ValueError` si se supera) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos fp32; admite carga en bf16/fp16 vía `dtype` en `from_pretrained` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 179 MB), más código de modelado propio |
| Capas | 24 |
| Tamano oculto | 256 |
| Cabezas de atencion | 8 (dimensión por cabeza: 32) |
| Feed-forward | 4× oculto, activación GELU |
| Vocabulario | 50.257 (BPE de GPT-2) |
| Codificacion posicional | Embeddings absolutos aprendidos |
| Normalizacion | LayerNorm |
| Weight tying | No; `lm_head` independiente |
| KV cache | No; la generación recalcula todo el contexto en cada paso |
| Tokens especiales | `bos = eos = <\|endoftext\|>` (id 50256) |
| Codigo personalizado | Sí, requiere `trust_remote_code=True` |

Desglose de parámetros: embeddings de token 12,87 M + embeddings posicionales 0,07 M + 24 bloques transformer de ~0,79 M cada uno (18,95 M) + norma final + `lm_head` sin atar de 12,87 M.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con normalización previa a cada subcapa (pre-norm), LayerNorm, GELU en la MLP y dimensiones deliberadamente estrechas: 256 de dimensión oculta repartidos en 8 cabezas de 32 dimensiones, con un total de 24 capas. Esta relación (muchas capas, poca anchura) es lo que permite llegar a casi 45 M de parámetros con un coste por capa muy bajo. La cabeza de salida no comparte pesos con los embeddings de entrada, de modo que el 29 % de los parámetros totales se concentra en la matriz de vocabulario y su transpuesta (12,87 M cada una). Se usan embeddings posicionales absolutos aprendidos, no RoPE ni ALiBi, y no hay caché KV: cada token nuevo implica una pasada completa sobre el contexto, con coste cuadrático respecto a la longitud de secuencia.

El entrenamiento se realizó desde cero, en una sola época, sobre las primeras 130.000 historias del split de entrenamiento de `roneneldan/TinyStories` leídas en streaming. El volumen resultante fue de 115,7 millones de caracteres, es decir, 28,76 millones de tokens y aproximadamente 112.350 bloques de entrenamiento. El objetivo fue predicción del siguiente token con entropía cruzada, batch de 16, block size de 256, optimizador AdamW con learning rate 3e-4, recorte de gradiente a 1.0, precisión mixta bf16 en CUDA y semilla 42. Se completaron unos 7.000 pasos de optimizador. No hay RLHF, DPO ni ningún tipo de ajuste por instrucciones, ni filtrado de seguridad. Como innovaciones técnicas destacables solo cabe señalar el propio código de modelado escrito a mano y el uso de un tokenizador GPT-2 preexistente para evitar entrenar un BPE propio.

## Capacidades

- Generación de texto narrativo en inglés: continúa prompts con estructura de cuento infantil (fórmulas como "Once upon a time..."), con sintaxis mayoritariamente correcta.
- Modelado de lenguaje causal puro: predicción del siguiente token y puntuación de secuencias mediante log-probabilidades.
- Coherencia local a corto plazo: mantiene el hilo narrativo durante unos cientos de tokens dentro de su ventana de 256.
- Generación de cuentos sintéticos completos, útil como generador de datos para destilación hacia modelos mayores o para construir datasets infantiles sintéticos.
- Manejo de vocabulario general en inglés a nivel de subpalabra gracias al BPE de GPT-2, aunque su distribución real de probabilidad está sesgada hacia el dominio de TinyStories.
- No soporta tool calling ni function calling.
- No soporta uso como agente, planificación multi-paso, razonamiento extendido ni modo "thinking".
- No tiene capacidades de visión, audio ni multimodalidad.
- No está ajustado por instrucciones: no sigue órdenes, no mantiene conversación de chat y no respeta roles de sistema o usuario.
- Multilingüe: no. Está entrenado exclusivamente en inglés y, de hecho, casi exclusivamente en inglés infantil simplificado.
- Capacidades especiales: ninguna (sin decodificación especulativa, sin atención lineal, sin caché KV, sin soporte de batching por máscara de atención).

## Casos de uso

- Generación de datos sintéticos para entrenamiento: se pueden muestrear miles de cuentos con `temperature=0.8, top_k=50, top_p=0.95` y usarlos como corpus de currículum simple para entrenar modelos mayores, replicando el planteamiento del paper TinyStories.
- Docencia de arquitecturas transformer: al ser código PyTorch legible y de solo 24 capas de anchura 256, permite recorrer el `forward` completo, inspeccionar formas de tensores y explicar la atención causal en una sesión de clase.
- Investigación sobre eficiencia de datos sintéticos: sirve para estudiar cómo escala la coherencia gramatical con el número de parámetros y de tokens en corpus sintéticos, con un coste de entrenamiento de una sola GPU y pocas horas.
- Pruebas de infraestructura de inferencia: sus 179 MB en fp32 lo convierten en un candidato ideal para validar pipelines de carga con `trust_remote_code=True`, integración continua y tests de humo de la librería `transformers` sin consumir GPU.
- Experimentos de tokenización: al compartir el BPE de GPT-2, permite aislar el efecto de la arquitectura frente al tokenizador en comparaciones controladas con otros modelos GPT-2 pequeños.
- Generación de material didáctico infantil: con revisión humana obligatoria, puede producir borradores de cuentos cortos en inglés para actividades de lectura, siempre que se filtren repeti­ciones e incoherencias de contenido.
- Evaluación de estrategias de decodificación: su ventana fija de 256 tokens y la ausencia de caché KV lo hacen útil para medir el impacto real de `top_k`, `top_p` y `repetition_penalty` sobre la diversidad y la repetición en modelos diminutos.
- Reproducción de experimentos con semilla fija: el entrenamiento documentado (semilla 42, AdamW, lr 3e-4) permite intentar reproducir el resultado y estudiar la varianza entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de perplejidad, MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se han encontrado en la búsqueda web. La única evidencia de calidad es un ejemplo cualitativo de generación incluido por el autor, que muestra un texto gramaticalmente aceptable con ligeras inconsistencias de contenido y con arranque de una nueva historia al agotarse el límite de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,5 GB en fp32 (179 MB de pesos más activaciones y estados de atención). En bf16 o fp16, alrededor de 90 MB de pesos. Cabe con holgura en cualquier GPU, iGPU o incluso en CPU.
- GPU recomendadas: cualquiera. No requiere A100, H100 ni RTX 4090; una GTX 1050, una iGPU integrada o una CPU moderna con suficiente RAM son suficientes.
- Cabe en GPU de consumo: sí, en todas, incluidas las de gama de entrada y las integradas.
- Opciones de despliegue: `transformers` con PyTorch es la única vía soportada, requiriendo `trust_remote_code=True` y los ficheros `model.py` y `configuration_qraxai.py`. vLLM, TGI y llama.cpp no son compatibles de forma nativa porque la arquitectura es personalizada y el `forward` no implementa caché KV ni máscara de atención para padding; usarlos exigiría escribir un backend específico o convertir los pesos a una arquitectura estándar.
- Latencia y throughput estimados: no disponibles. Cualitativamente, la ausencia de caché KV implica que el coste por token generado crece de forma aproximadamente cuadrática con la longitud de la secuencia, por lo que la generación se degrada rápido al acercarse a los 256 tokens.
- Restricción práctica de memoria y cómputo: `len(prompt) + max_new_tokens` debe ser menor o igual a 256; el `forward` personalizado lanza `ValueError` si se supera. No se debe hacer batching de prompts, ya que no se usa máscara de atención.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QraXAi-Basic-45M | ~44,75 M | 256 tokens | TinyStories (130.000 historias, 1 época) | MIT | HuggingFace, requiere `trust_remote_code` |
| TinyStories-33M (Microsoft Research) | ~33 M | No disponible | TinyStories | No disponible | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | WebText (~40 GB de texto web) | Licencia MIT modificada de OpenAI | HuggingFace, ampliamente integrado |

Frente a TinyStories-33M, este modelo aporta más parámetros y contexto declarado de 256 tokens, pero compite en la misma franja de uso (generación de cuentos simples en inglés) y carece de cualquier benchmark publicado que permita afirmar superioridad. Frente a GPT-2 small, tiene aproximadamente una tercera parte de parámetros y cuatro veces menos contexto, y su corpus de entrenamiento es radicalmente más estrecho: no puede abordar conocimiento del mundo, código ni diálogo general. Su ventaja relativa es la licencia MIT sin ambigüedad, el tamaño del repositorio (0,2 GB frente a ~0,5 GB de GPT-2 small) y el hecho de ser un entrenamiento documentado desde cero y reproducible. No se dispone de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y con un dominio extremadamente estrecho: cuentos infantiles sintéticos de TinyStories. Su conocimiento del mundo real es prácticamente nulo.
- Sesgos conocidos: hereda la distribución estereotipada de TinyStories (roles de género tradicionales, tramas repetitivas, vocabulario infantil). Además, el corpus es generado por GPT-3.5/4, por lo que arrastra los sesgos de ese profesor.
- Riesgo de alucinación: alto en cualquier pregunta factual. Entrenado una sola época, el contenido puede ser repetitivo, inconsistente o directamente sin sentido aunque la gramática se mantenga.
- Límite de contexto duro de 256 tokens, sin ventana deslizante. Las entradas largas deben truncarse obligatoriamente.
- No está ajustado por instrucciones: no es un modelo de chat y no seguirá indicaciones del usuario.
- Ausencia total de filtrado de seguridad y de alineación. El autor recomienda explícitamente no usarlo en producción ni en aplicaciones orientadas al usuario.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, pero exime de garantías; el autor desaconseja el uso comercial real por la baja calidad del modelo.
- Rendimiento de generación: sin caché KV, el coste aumenta con la longitud; además, no se admite batching al no usar máscara de atención para padding, lo que limita el throughput agregado.
- Frecuente problema de corte narrativo: al agotarse el límite de tokens el modelo puede iniciar un cuento nuevo en lugar de cerrar el actual.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar `model.py` del repositorio; conviene auditar ese fichero antes de cargarlo en entornos sensibles.
- Sin adopción: cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validación independiente de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coderian/QraXAi-Basic-45M
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (arXiv:2305.07759): https://arxiv.org/abs/2305.07759
- Perfil del autor en HuggingFace: https://huggingface.co/coderian
- Perfil del autor en GitHub: https://github.com/Coderian
- Repositorio de datasets del autor: https://huggingface.co/coderian/datasets
