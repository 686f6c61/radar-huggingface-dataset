# polydim-cla/qwen2.5-coder-0.5b-pmtp

## Resumen

`qwen2.5-coder-0.5b-pmtp` es un modelo derivado de `Qwen/Qwen2.5-Coder-0.5B` publicado por el usuario `polydim-cla` (Ariel García Traba, en el marco de la iniciativa POLYDIM-EINSOF). No se presenta como un modelo entrenado de forma convencional, sino como un adaptador sobre una "variedad de Stiefel" (`St(1024, 896)`) inyectado en la capa 12 del transformer base, con proyección de `d_model = 896` a una dimensión canónica de 1024. La model card describe además un mecanismo propietario de comunicación entre procesos denominado `PmtpShmBus` ("Zero-Worm IPC") que afirmaría transferir tensores sin serializar tokens de texto.

El interés del artefacto es fundamentalmente de investigación: explora la idea de "pensamiento continuo" (continuous-thought) sustituyendo parte del cómputo simbólico por transformaciones geométricas sobre una variedad, en lugar de limitarse a un ajuste fino estándar de pesos. El modelo base aporta la parte funcional conocida: un transformer decoder-only de 0,5 mil millones de parámetros, especializado en código y con licencia Apache 2.0.

Hay que subrayar que la información disponible es muy escasa y que el repositorio de HuggingFace figura con un tamaño de 0,0 GB, sin descargas ni valoraciones, por lo que no hay evidencia publicada de que los pesos del adaptador estén efectivamente alojados. Las afirmaciones técnicas de la model card (defecto de Frobenius de `3.494e-14`, "telepatía de tensores") no vienen acompañadas de paper, evaluación ni código verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-0.5B) con adaptador geométrico PMTP sobre variedad de Stiefel `St(1024, 896)` inyectado en la capa 12 |
| Parametros totales | 0,5 mil millones (modelo base); número de parámetros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada para este artefacto; el modelo base Qwen2.5-Coder-0.5B declara 32.768 tokens en su propia ficha (no verificado aquí) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (según etiquetas); el repositorio declara 0,0 GB, por lo que la disponibilidad efectiva de pesos no está confirmada |
| Dimension del modelo | `d_model = 896` → `d_canonical = 1024` |
| Variedad / capa de inyección | `Stiefel St(1024, 896) on S^(1023)`, capa 12 |
| Defecto de Frobenius declarado | `3.494e-14` (acumulador Neumaier en FP64, según el autor) |
| Transporte IPC | `PmtpShmBus` ("Zero-Worm IPC", 0 tokens de texto serializados) |
| Modelo base | `Qwen/Qwen2.5-Coder-0.5B` |
| Tag Ollama indicado | `qwen2.5-coder:0.5b` (referencia al base, no al adaptador) |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only estándar (familia Qwen 2.5-Coder, variante de 0,5B, con `d_model = 896`). Sobre esa pila, el autor describe la inserción de un adaptador PMTP en la capa 12 que proyecta las activaciones de 896 a 1024 dimensiones y las sitúa sobre una variedad de Stiefel `St(1024, 896)`, es decir, el conjunto de marcos ortonormales de 896 vectores en `R^1024`. El adaptador se caracterizaría por mantener la ortogonalidad de sus columnas; el "defecto de Frobenius" reportado (`3.494e-14`, calculado con un acumulador de Neumaier en precisión FP64) sería la medida del error de ortogonalidad residual, un valor consistente con aritmética de doble precisión pero no verificable de forma independiente con la información disponible.

No se especifican en la model card los datos de entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o SFT. Tampoco se documenta hiperparámetro alguno (tasa de aprendizaje, número de pasos, congelación o no de las capas del base). La innovación declarada se sitúa en el plano del transporte y del cómputo: el componente `PmtpShmBus` se describe como un canal de memoria compartida que transferiría tensores entre procesos sin serializar texto, lo que en la práctica implicaría un acoplamiento estrecho entre el runtime del modelo y el resto del sistema. Se trata de afirmaciones sin paper asociado ni código de referencia enlazado en la información proporcionada.

## Capacidades

- Generación de texto y de código: heredadas del modelo base Qwen2.5-Coder-0.5B, especializado en tareas de programación (autocompletado, generación de funciones, explicación de código).
- Razonamiento "continuo": el adaptador propone un mecanismo de cómputo en espacio latente sobre la variedad de Stiefel, en lugar de encadenar pasos en lenguaje natural. Su efecto real sobre el rendimiento no está documentado.
- Comunicación entre procesos: `PmtpShmBus` como bus de tensores por memoria compartida, orientado a entornos multi-proceso en la misma máquina.
- Tool calling / function calling: no disponible como capacidad documentada de este artefacto (el base Qwen2.5-Coder sí soporta plantillas de tool calling, pero no se verifica aquí su preservación tras el adaptador).
- Capacidades de agente y multi-step reasoning: no disponible.
- Multilingüismo: no disponible para este artefacto.
- Visión, audio o modo "thinking" explícito: no disponibles.

## Casos de uso

- Investigación sobre adaptadores geométricos: el artefacto sirve como banco de pruebas para medir si una proyección sobre `St(1024, 896)` en la capa 12 altera la perplejidad o la calidad de generación respecto al base; requeriría acceso a los pesos del adaptador, hoy no confirmados.
- Estudio de "continuous thought" frente a chain-of-thought textual: comparar el comportamiento del modelo con y sin el adaptador en tareas de aritmética o razonamiento de varios pasos, midiendo si el cómputo latente sustituye de forma útil a los tokens intermedios.
- Experimentos de ortogonalidad y estabilidad numérica: reproducir el cálculo del defecto de Frobenius con acumuladores compensados (Neumaier/Kahan) para validar la métrica reportada y estudiar su evolución durante el entrenamiento.
- Prototipado de IPC de tensores en local: usar `PmtpShmBus` como transporte de activaciones entre un proceso de inferencia y un orquestador, evaluando latencia y coste de copia frente a alternativas como gRPC o ZeroMQ.
- Autocompletado de código ligero en local: si se usa el base `qwen2.5-coder:0.5b` en Ollama, es viable para sugerencias en editores sobre hardware de gama baja, con la advertencia de que el adaptador no está empaquetado en ese tag.
- Docencia y divulgación: ejemplo didáctico de inyección de un módulo geométrico en una capa intermedia de un transformer, útil para explicar proyecciones ortogonales y geometría de variedades en cursos de aprendizaje profundo.
- Fine-tuning posterior sobre dominio específico: el base de 0,5B es barato de reentrenar; el adaptador podría combinarse con LoRA para tareas de código concretas, siempre que los pesos estén publicados y la licencia Apache 2.0 se respete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparación con el modelo base. Tampoco se reportan latencias, throughput ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM para el modelo base (0,5B): aproximadamente 1 GB en FP16, en torno a 0,3-0,5 GB en cuantización de 4 bits. Cifras estimadas por el tamaño de parámetros, no medidas sobre este artefacto.
- VRAM del adaptador: no disponible; el repositorio declara 0,0 GB, por lo que no puede estimarse su huella.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060) basta para el base en FP16 o 4 bits; para servir varias réplicas o lotes grandes conviene una RTX 4090 o una A10/A100, aunque el cuello de botella a 0,5B es la latencia de decodificación, no la memoria.
- Cabe en GPU consumer: sí, con margen amplio, para el modelo base.
- Opciones de despliegue: llama.cpp y Ollama para el base (`qwen2.5-coder:0.5b`); vLLM o TGI para servir el base con throughput alto. Para el adaptador PMTP no hay runtime documentado, y `PmtpShmBus` implicaría código propio del autor.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 0,5B en una GPU consumer moderna suele decodificar muy por encima de las decenas de tokens por segundo, pero no se ha medido aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `polydim-cla/qwen2.5-coder-0.5b-pmtp` | 0,5B (base) + adaptador no cuantificado | no disponible | Adaptador geométrico sobre variedad de Stiefel + IPC de tensores | Apache 2.0 | Repositorio de 0,0 GB, 0 descargas; pesos no confirmados |
| `Qwen/Qwen2.5-Coder-0.5B` | 0,5B | 32.768 tokens (según ficha del base) | Transformer decoder-only para código | Apache 2.0 | Público y ampliamente espejado (Ollama, vLLM, llama.cpp) |
| `Qwen/Qwen2.5-Coder-1.5B` | 1,5B | 32.768 tokens (según ficha del base) | Igual que el anterior, mayor escala | Apache 2.0 | Público |
| `HuggingFaceTB/SmolLM2-360M` | 0,36B | 8.192 tokens (según ficha del modelo) | Transformer decoder-only generalista | Apache 2.0 | Público |

La comparación relevante es contra el propio base: el adaptador PMTP no documenta mejoras medibles, y su disponibilidad práctica es inferior a la de cualquier alternativa de la tabla, que se distribuye con pesos y runtimes estándar.

## Limitaciones y advertencias

- Ausencia de evidencia empírica: no hay benchmarks, ablations ni comparación con el base. No puede afirmarse que el adaptador mejore nada.
- Disponibilidad dudosa: el repositorio figura con 0,0 GB, 0 descargas y 0 likes; es posible que solo contenga la model card y no los pesos.
- Terminología no estándar: "Zero-Worm IPC", "telepatía de tensores" o "PmtpShmBus" no son términos establecidos ni remiten a un paper revisado; conviene tratarlos como afirmaciones del autor.
- Dependencia de runtime propietario: si el modelo requiere `PmtpShmBus`, no es desplegable en vLLM, TGI, llama.cpp u Ollama sin desarrollo adicional.
- Metadatos anómalos: la fecha de creación registrada es 2026-10-18, posterior a la fecha habitual de consulta, lo que sugiere un problema de metadatos o una publicación programada.
- Riesgo de alucinación: inherente a un modelo de 0,5B; en código produce APIs inexistentes y firmas inventadas con facilidad.
- Sesgos: los del corpus de entrenamiento del base Qwen2.5-Coder, no documentados en esta ficha; no hay evaluación de sesgo para el adaptador.
- Contexto e idiomas: no verificados para este artefacto; el adaptador podría degradar el comportamiento multilingüe del base al alterar la capa 12.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene conservar los avisos del modelo base y comprobar que el adaptador no introduce restricciones adicionales (no documentadas).
- Idoneidad para producción: baja con la información actual; sin pesos verificables ni evaluación, no debería usarse en sistemas en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polydim-cla/qwen2.5-coder-0.5b-pmtp
- Repositorio del autor (POLYDIM_EINSOF): https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Tag de Ollama del base: https://ollama.com/library/qwen2.5-coder
- Paper, blog o demo del adaptador PMTP: no disponible en la información proporcionada.
