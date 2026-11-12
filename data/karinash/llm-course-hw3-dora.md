# KarinaSh/llm-course-hw3-dora

## Resumen

KarinaSh/llm-course-hw3-dora es un modelo de lenguaje de tipo transformer publicado en Hugging Face por la usuaria KarinaSh, aparentemente como entrega de un trabajo practico de un curso de LLM (el identificador del repositorio incluye "llm-course-hw3" y el sufijo "dora", que sugiere el uso de la tecnica DoRA, Weight-Decomposed Low-Rank Adaptation, para el ajuste fino). El modelo cuenta con 300.049.792 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos (aproximadamente 0,3 mil millones de parametros), y esta etiquetado con la familia "mistral", lo que indica que deriva de un modelo base de dicha familia.

La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sustantiva: no se documentan datos de entrenamiento, hiperparametros, evaluacion, licencia ni idiomas soportados. El repositorio tiene 1,2 GB de tamano y no registra descargas ni "likes" en el momento de la consulta, lo que es coherente con un artefacto academico recien creado (fechado en noviembre de 2026) y no con un modelo destinado a produccion.

Su relevancia es, por tanto, limitada y de caracter educativo: sirve como ejemplo de publicacion de un ajuste fino con DoRA sobre un modelo Mistral pequeno y de como estructurar un repositorio en el Hub, pero no debe considerarse un modelo evaluado ni listo para uso comercial sin una validacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, segun tag del repositorio) |
| Parametros totales | 300.049.792 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer de la familia Mistral con aproximadamente 300 millones de parametros. El tag "mistral" del repositorio y el sufijo "dora" del identificador apuntan a un ajuste fino mediante DoRA (Weight-Decomposed Low-Rank Adaptation) sobre un modelo base Mistral de pequeno tamano, pero no se especifica cual es ese modelo base, ni el dataset utilizado, ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF, DPO o SFT supervisado.

La model card no documenta hiperparametros (tasa de aprendizaje, rango LoRA/DoRA, precision mixta), composicion del dataset ni innovaciones tecnicas adicionales. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo indicado seria especulativa y no debe tomarse como dato verificado.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (text-generation).
- Conversacion multi-turno, segun el tag "conversational" del repositorio.
- Ajuste fino con DoRA sobre un modelo base Mistral (inferido del identificador, no confirmado en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado academico de ajuste fino: el modelo sirve como ejemplo reproducible de un pipeline DoRA sobre un transformer pequeno, util para cursos y talleres que ensenan a publicar adaptadores en el Hub.
- Experimentacion con modelos de ~300 M de parametros: adecuado para probar tecnicas de inferencia (prompting, decodificacion, cuantizacion) en entornos con recursos limitados antes de escalar a modelos mayores.
- Generacion de texto en entornos de bajo consumo: por su tamano, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion sencilla, siempre que se valide su calidad.
- Base para comparativas de metodos de ajuste: permite contrastar DoRA frente a LoRA u otras tecnicas sobre el mismo modelo base en experimentos controlados.
- Docencia sobre ciclo de vida de modelos: ilustra la diferencia entre un checkpoint de investigacion y un modelo listo para produccion, incluida la necesidad de completar la model card.
- Evaluacion interna de riesgos: util para que equipos de ML practiquen auditorias de modelos no documentados (licencia, sesgos, datos) antes de integrarlos en pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos (300 M de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,3 GB para pesos; en 4 bits, aproximadamente 0,15 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, incluso en GPUs con 4-6 GB de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag "text-generation-inference"), endpoints compatibles (tag "endpoints_compatible"). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KarinaSh/llm-course-hw3-dora | 300.049.792 | no disponible | no disponible | Hugging Face |
| Mistral-7B (modelo base de la familia) | 7.000 millones | 32.768 tokens (segun documentacion publica de Mistral AI) | Apache 2.0 | Hugging Face |
| SmolLM-360M (HuggingFaceTB) | 360 millones | 2.048 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 500 millones | 32.768 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face |

Nota: los datos de los modelos comparables provienen de su documentacion publica; los del modelo de esta ficha, de la informacion del repositorio. No se dispone de benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con la autora o verificar el modelo base.
- Idiomas no declarados: se desconoce si el ajuste fino conserva el multilingusimo del modelo base o lo ha degradado.
- Riesgo de alucinacion y de sobreajuste al dataset del curso: al ser un ajuste fino academico, la calidad y fidelidad no estan verificadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Sin variantes cuantizadas oficiales: el despliegue eficiente requeriria conversion propia a GGUF u otros formatos.
- Repositorio sin descargas ni validacion de la comunidad: no hay senales externas de calidad o mantenimiento.
- Longitud de contexto desconocida: no debe asumirse la ventana del modelo base sin verificacion.

## Enlaces

- Hugging Face: https://huggingface.co/KarinaSh/llm-course-hw3-dora
- Paper de referencia citado en la model card (Machine Learning Impact calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
