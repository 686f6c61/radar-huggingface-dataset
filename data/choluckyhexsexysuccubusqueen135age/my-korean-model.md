# ChoLuckyHexSexySuccubusQueen135Age/my-korean-model

## Resumen

`my-korean-model` es un adaptador LoRA publicado en Hugging Face por el usuario ChoLuckyHexSexySuccubusQueen135Age (la model card referencia internamente la cuenta `dosa777`, lo que sugiere una republicación o un cambio de nombre de usuario). Se construye sobre el modelo base `unsloth/gpt-oss-20b`, una variante optimizada con Unsloth del gpt-oss-20b de OpenAI, un transformer denso de aproximadamente 20.000 millones de parámetros. El adaptador se ha afinado con LoRA sobre el dataset `maywell/korean_textbooks` con el objetivo declarado de especializarlo en la generación de contenido educativo en coreano.

El interés del modelo es acotado pero claro: demuestra un flujo de trabajo de fine-tuning ligero (LoRA de rango 8 sobre todas las proyecciones lineales principales) aplicado a un modelo de 20B para una tarea vertical concreta, la explicación de conceptos de matemáticas, ciencias, lengua y ciencias sociales en coreano. Al ser un adaptador PEFT y no un modelo completo, el repositorio es mínimo (0.0 GB según Hugging Face) y requiere descargar el modelo base por separado para poder utilizarse.

La relevancia es limitada: se trata de un experimento de fine-tuning con solo 30 pasos de entrenamiento, sin benchmarks publicados, sin métricas de evaluación y con un único idioma soportado. No debe considerarse un modelo listo para producción, sino una prueba de concepto reproducible de adaptación lingüística y de dominio sobre gpt-oss-20b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base gpt-oss-20b) con adaptador LoRA (PEFT) |
| Parametros totales | ~20B en el modelo base; el adaptador LoRA es de rango 8 (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base; no confirmada) |
| Tipos de cuantizacion | El entrenamiento uso el checkpoint base en 4 bits (bnb-4bit); no se documentan otras cuantizaciones del adaptador |
| Idiomas soportados | Coreano (ko); el resto de idiomas no estan garantizados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gpt-oss-20b`, un transformer denso de aproximadamente 20B parámetros. El fine-tuning se realizó con LoRA de rango 8 y alpha 16, con módulos objetivo que cubren las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y del MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento partió del checkpoint `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, es decir, el modelo base cuantizado a 4 bits con bitsandbytes, y se ejecutó durante únicamente 30 pasos sobre el dataset `maywell/korean_textbooks`.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje, el tamaño de batch o la estrategia de enmascaramiento. Tampoco se describen innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento. El número de pasos (30) es extremadamente bajo para un ajuste de dominio significativo, lo que sugiere un experimento de validación más que un fine-tuning completo.

## Capacidades

- Generación de texto conversacional en coreano, orientada a la explicación de contenidos educativos.
- Explicación de conceptos matemáticos: aritmética, álgebra, geometría, cálculo y justificación intuitiva de fórmulas.
- Explicación de principios científicos: física, química y biología, incluyendo interpretación de experimentos.
- Contenido de lengua coreana: gramática, vocabulario, análisis literario y técnicas de escritura.
- Contenido de ciencias sociales: historia, geografía, instituciones y cultura.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `system` y `user`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Generación de material didáctico en coreano: el modelo puede redactar explicaciones de conceptos de matemáticas o ciencias para un temario escolar, aprovechando el ajuste sobre textos de manuales coreanos. Adecuado para prototipos de contenido educativo, no para publicación sin revisión.
- Asistente de estudio para estudiantes coreanohablantes: conversaciones de varios turnos en las que el alumno pide aclaraciones sobre un concepto y el modelo reformula la explicación. La ventana de contexto efectiva depende del modelo base, que no se confirma aquí.
- Generación de preguntas y ejercicios de repaso: a partir de un tema del currículo coreano, el modelo puede proponer enunciados y soluciones razonadas, útil para herramientas de práctica autoevaluada.
- Apoyo a la redacción docente: borradores de explicaciones, resúmenes de unidades didácticas o glosas de términos técnicos en coreano, que el profesor revisa y corrige.
- Traducción explicativa de conceptos científicos al coreano: reformulación de definiciones técnicas en un registro accesible, útil en materiales divulgativos o de refuerzo.
- Experimentación en fine-tuning: sirve como referencia reproducible para estudiar el efecto de un LoRA de rango 8 y 30 pasos sobre un modelo de 20B, comparando la salida del adaptador con la del modelo base.
- Prototipado de chatbots educativos sectoriales: integración en un pipeline con `transformers` y `peft` para validar la viabilidad de un asistente vertical antes de invertir en un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica un mínimo de 16 GB de VRAM y recomienda 24 GB o más para cargar el modelo base en `float16` con `device_map="auto"`. En la práctica, un modelo de 20B en FP16 requiere del orden de 40 GB de VRAM, por lo que el mínimo de 16 GB solo es viable con cuantización de 4 u 8 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantización de 4 bits.
- GPU de consumo: cabe en RTX 4090/3090 con cuantización de 4 bits; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) es ajustado y depende del backend y de la longitud de contexto.
- RAM del sistema: mínimo 16 GB según la model card.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), y en principio vLLM, TGI u Ollama si se fusiona el adaptador con el modelo base y se exporta a un formato compatible; no se documenta ninguno de estos flujos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my-korean-model (este) | ~20B (base) + LoRA r8 | No disponible | Fine-tuning educativo en coreano | Apache 2.0 | Hugging Face, 0 descargas |
| gpt-oss-20b (base) | ~20B | No disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| kogpt2-base-v2 | ~125M | 1024 tokens (tipico de GPT-2) | Modelo coreano generalista | No disponible en la informacion | Hugging Face |
| Polyglot-Ko / variantes coreanas | Variable | Variable | Modelos coreanos preentrenados | No disponible en la informacion | Hugging Face |

La comparación con kogpt2-base-v2 y otras variantes coreanas es desigual por tamaño: este adaptador parte de un modelo 160 veces mayor, pero su ajuste es mínimo (30 pasos) y no hay evaluación que permita afirmar superioridad. Frente al gpt-oss-20b original, la única diferencia documentada es la especialización declarada en contenido educativo coreano.

## Limitaciones y advertencias

- Entrenamiento muy corto: 30 pasos con LoRA de rango 8 es insuficiente para un ajuste de dominio robusto; es probable que el adaptador conserve en gran medida el comportamiento del modelo base.
- Sin evaluación: no hay benchmarks, métricas de pérdida ni comparaciones publicadas que respalden las capacidades declaradas en la model card.
- Monolingüe: solo se declara coreano; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: la model card advierte explícitamente de que el contenido generado debe revisarse y verificarse; en un contexto educativo, errores factuales son especialmente sensibles.
- Repositorio mínimo: 0.0 GB y 0 descargas; el adaptador no incluye el modelo base y la carga requiere descargar ~20B parámetros adicionales.
- Inconsistencia de identificadores: la model card usa `dosa777/my-korean-model` en el código de ejemplo mientras que el ID real del repositorio es `ChoLuckyHexSexySuccubusQueen135Age/my-korean-model`; el código de la model card no funcionará tal cual.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los términos del gpt-oss-20b original antes de un despliegue comercial.
- Sin datos de sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Contexto no confirmado: no se especifica la longitud de contexto efectiva del adaptador ni del modelo base en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/my-korean-model
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b
- Dataset de entrenamiento: https://huggingface.co/datasets/maywell/korean_textbooks
- Perfil del autor (otros modelos): https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/kogpt2-base-v2
- Perfil del autor (otros modelos): https://huggingface.co/ChoLuckyHexSexySuccubusQueen135Age/sexyGPT-Uncensored
