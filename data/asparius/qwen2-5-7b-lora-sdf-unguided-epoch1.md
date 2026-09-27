# asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch1

## Resumen

`asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch1` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario `asparius` sobre el modelo base `Qwen/Qwen2.5-Coder-7B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato PEFT (`safetensors`) que debe cargarse junto con el modelo base para poder generar texto. El repositorio ocupa 0,2 GB y fue creado el 27 de septiembre de 2026, con 0 descargas y 0 "likes" en el momento de la consulta.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card está prácticamente vacía (conserva la plantilla original de Hugging Face con múltiples campos `[More Information Needed]`) y no aporta información sobre datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación. El nombre del repositorio sugiere una familia de experimentos ("SDF", variantes "Unguided" y "Neutral", distintas épocas) del mismo autor, de la que tampoco hay documentación técnica pública.

Por tanto, esta ficha describe la arquitectura heredada del modelo base (transformer decoder-only de 7.610 millones de parámetros con ventana nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN) y marca como "no disponible" todo lo específico del adaptador. Se recomienda tratarlo como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (modelo base Qwen2.5-Coder-7B) |
| Parametros totales | 7.610 millones en el modelo base; tamaño del adaptador no disponible (repositorio de 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; 131.072 tokens con escalado YaRN. No confirmado para este adaptador |
| Tipos de cuantizacion | No disponible para el adaptador. Compatible con las cuantizaciones del modelo base (FP16, BF16, INT8, GPTQ/AWQ INT4, GGUF Q4/Q5/Q8) al fusionar el adaptador |
| Idiomas soportados | No disponible. El modelo base Qwen2.5-Coder está entrenado mayoritariamente en inglés y lenguajes de programación |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-Coder-7B se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base requiere pesos aparte |
| Libreria | PEFT 0.21.0, TRL, transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-Coder-7B |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se apoya en un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), la arquitectura estándar de la familia Qwen2.5. El ajuste se realizó con LoRA mediante la librería PEFT (versión 0.21.0) y el framework TRL, con un régimen de SFT (supervised fine-tuning), según las etiquetas del repositorio. No se especifica el rango, alpha, dropout ni los módulos objetivo del adaptador, ni el número de pasos, la tasa de aprendizaje o la precisión usada en el entrenamiento.

Tampoco hay información sobre el dataset utilizado ni sobre la composición de las muestras. El nombre del repositorio incluye la cadena "SDF" y la etiqueta "Unguided", y el autor ha publicado variantes como `Qwen2.5-7B-LORA-SDF-epoch3` y `Qwen2.5-7B-LORA-SDF-Neutral-epoch2`, lo que apunta a una comparación entre configuraciones de entrenamiento (épocas y posiblemente estilos de respuesta), pero ninguna de las model cards asociadas documenta el procedimiento. No consta uso de RLHF, DPO, decodificación especulativa ni ninguna innovación técnica adicional.

## Capacidades

- Generación de texto conversacional y de código, heredadas del modelo base Qwen2.5-Coder-7B, que está especializado en lenguajes de programación.
- Razonamiento de varios pasos y matemáticas, en la medida en que lo soporte el modelo base.
- Relleno de código en medio de contexto (fill-in-the-middle), capacidad nativa de la familia Qwen2.5-Coder, aunque no se confirma que el ajuste LoRA la preserve.
- Capacidades multilingües: no disponibles; el autor no declara idiomas y el modelo base está orientado a inglés técnico y lenguajes de programación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de visión o audio: no aplica; es un modelo exclusivamente de texto.

## Casos de uso

- Experimentación académica con LoRA: el adaptador sirve para reproducir o comparar el efecto de distintas configuraciones de SFT (variantes "Unguided", "Neutral", épocas 1 a 3) sobre un mismo modelo base, en un contexto de investigación sobre ajuste eficiente.
- Autocompletado de código en entornos de desarrollo: fusionando el adaptador con Qwen2.5-Coder-7B, puede ofrecerse como backend de un servidor de completado (por ejemplo, con llama.cpp o vLLM) para sugerencias en línea dentro de un IDE.
- Generación de tests unitarios: dado un módulo de código, el modelo puede producir casos de prueba, aprovechando la ventana de 32.768 tokens del modelo base para incluir varios ficheros como contexto.
- Explicación y documentación de código legado: el modelo puede resumir funciones o generar docstrings sobre fragmentos largos, siempre que el ajuste no haya degradado la capacidad base.
- Refactorización asistida en un pipeline de CI: integrado como paso previo a la revisión humana, puede proponer cambios de estilo o detección de patrones repetidos en diffs.
- Evaluación comparativa de adaptadores: dado que existen varias épocas y variantes publicadas por el mismo autor, resulta útil como punto de partida para medir si el ajuste SFT mejora o degrada tareas concretas frente al modelo base sin ajustar.

Advertencia: ninguno de estos casos está validado por el autor. No se recomienda su uso en producción sin una evaluación propia previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor mantiene la sección de evaluación con el marcador `[More Information Needed]` y los resultados de búsqueda no aportan métricas (MMLU, HumanEval, GSM8K, MBPP ni ninguna otra) para este adaptador ni para sus variantes.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar Qwen2.5-Coder-7B, por lo que los requisitos son los del modelo base más el coste del adaptador.
- VRAM estimada para el modelo base en FP16/BF16: en torno a 15-16 GB solo para los pesos, más la caché KV (que crece con la longitud de contexto). GPU recomendadas: A100 40/80 GB, H100, L40S; en una RTX 4090 de 24 GB cabe con contexto moderado.
- VRAM estimada en INT8: aproximadamente 8-9 GB, viable en RTX 3090, RTX 4090 o RTX 4080.
- VRAM estimada en INT4 (GPTQ, AWQ o GGUF Q4_K_M): en torno a 4,5-6 GB, lo que permite ejecutarlo en GPU de gama media como RTX 3060 12 GB o RTX 4070, e incluso en tarjetas de 8 GB con contexto reducido.
- Ejecución en CPU: con cuantización GGUF Q4 el modelo ocupa unos 5 GB de RAM; es viable en llama.cpp y Ollama con velocidades de decodificación bajas.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador, o fusión con `merge_and_unload` para exportar a safetensors completo), vLLM, TGI, SGLang, llama.cpp y Ollama (estos dos últimos requieren convertir previamente el modelo fusionado a GGUF).
- Latencia y throughput: no disponibles para este adaptador. No se han publicado mediciones ni de tokens por segundo ni de tiempo hasta el primer token; cualquier cifra dependerá del hardware y de la cuantización elegida, no del adaptador.

## Comparativa con modelos similares

No se han encontrado adaptadores LoRA comparables con documentación pública suficiente para una comparativa rigurosa. Como referencia, se compara el modelo base sobre el que se aplica este adaptador con alternativas de la misma categoría (7-8B):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-7B (base de este adaptador) | 7,61B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Especializado en código; base del ajuste LoRA analizado |
| asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch1 | Adaptador sobre 7,61B | Heredado del base, no confirmado | No disponible | Sin benchmarks, sin model card, 0 descargas |
| Qwen2.5-7B-Instruct | 7,61B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Modelo instructivo generalista de la misma familia |
| Otras variantes del mismo autor (SDF-epoch3, SDF-Neutral-epoch2) | Adaptador sobre 7,61B | No disponible | No disponible | Misma situación documental: sin métricas ni detalles de entrenamiento |

## Limitaciones y advertencias

- Model card vacía: el autor no ha rellenado ningún campo descriptivo, incluidos los de uso previsto, datos de entrenamiento y evaluación. No hay garantía alguna sobre el comportamiento del adaptador.
- Licencia no especificada para el adaptador. Aunque el modelo base es Apache 2.0, el adaptador no declara términos, lo que impide confirmar su uso comercial sin consultar al autor.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano, ya que el modelo base está orientado a inglés y lenguajes de programación.
- Riesgo de alucinación: inherente a cualquier modelo de esta familia y no evaluado en este adaptador; el ajuste SFT sobre datasets desconocidos puede aumentar o reducir este riesgo de forma imprevisible.
- Sesgos conocidos: no documentados. El ajuste sobre datos no publicados puede introducir sesgos específicos no auditados.
- Sin métricas de calidad: al no existir benchmarks, no se puede verificar si el ajuste mejora al modelo base o lo degrada (por ejemplo, sobreajuste a un estilo concreto, pérdida de capacidades de código o de instrucciones).
- Ventana de contexto heredada: 32.768 tokens nativos; superar esa longitud requiere activar YaRN de forma explícita y puede degradar la calidad si el ajuste se hizo con longitudes mucho menores.
- Adopción nula: 0 descargas y 0 "likes" implican ausencia de validación por parte de la comunidad y de informes de errores.
- Fecha de publicación anómala (2026) y ausencia de historial: conviene verificar la procedencia del repositorio antes de integrarlo en cualquier flujo automatizado.
- Para producción se recomienda fusionar el adaptador, evaluarlo contra el modelo base con un conjunto de validación propio y comparar resultados antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch1
- Variante del mismo autor: https://huggingface.co/asparius/Qwen2.5-7B-LORA-SDF-epoch3
- Variante del mismo autor: https://huggingface.co/asparius/Qwen2.5-7B-LORA-SDF-Neutral-epoch2
- Ficha de terceros de una variante (sin métricas): https://free2aitools.com/model/asparius/qwen2.5-7b-lora-sdf-neutral-epoch3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Guía de ajuste QLoRA sobre Qwen2.5-7B (referencia externa): https://github.com/RkanGen/finetune_qwen_using_qlora
- Papel citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
