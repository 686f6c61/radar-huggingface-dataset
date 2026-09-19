# jubul676/Trinity-Sirenia-AI

## Resumen

Trinity-Sirenia-AI es un ajuste fino del modelo Gemma 3 270M en su variante instructa, publicado por el usuario jubul676 en HuggingFace. Se trata de un modelo decoder-only de 270 millones de parámetros perteneciente a la familia gemma3_text de Google, reentrenado a partir de unsloth/gemma-3-270m-it con la librería Unsloth y el stack de TRL. El autor no documenta el conjunto de datos, el método de ajuste (LoRA, QLoRA o ajuste completo) ni el objetivo concreto del entrenamiento, más allá de indicar que se entrenó "2x más rápido" con Unsloth. El repositorio ocupa 0,2 GB y no acumula descargas ni interacciones en el momento de redactar esta ficha.

La relevancia de un modelo de este tamaño reside en el despliegue en entornos con recursos muy limitados: CPU de portátil, dispositivos móviles, Raspberry Pi o incluso navegador, donde un modelo de miles de millones de parámetros no es viable por VRAM y latencia. Un modelo de 270M permite inferencia local con huella de memoria inferior a 1 GB en precisión completa y por debajo de 200 MB en cuantización de 4 bits.

Ahora bien, la ficha del autor es mínima y no aporta información sobre datos de entrenamiento, evaluación, idiomas efectivos ni casos de uso previstos. Cualquier evaluación seria de este modelo requiere validación empírica propia sobre la tarea objetivo, ya que no existe ningún benchmark publicado ni comparación con el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia gemma3_text (Gemma 3) |
| Parametros totales | 270 millones (heredado del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base Gemma 3 270M declara 32 768 tokens en la documentación pública de Google, pero el autor no confirma que el ajuste preserve esa ventana |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`), según la etiqueta declarada por el autor. El modelo base declara soporte multilingüe amplio, no verificado en este ajuste |
| Licencia | Apache 2.0 (declarada por el autor; el modelo base se rige por los Gemma Terms of Use) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Gemma 3, con normalización RMSNorm, atención con RoPE y atención local/global alternada en las variantes mayores de la familia. Con 270 millones de parámetros, una parte significativa del presupuesto corresponde a la capa de embeddings, característica habitual en modelos de este tamaño y factor determinante de su comportamiento en tareas multitarea frente a tareas especializadas.

El proceso de ajuste se realizó con Unsloth, tal y como declara el autor en la model card, apoyándose en TRL. No se especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni la configuración de hiperparámetros. Tampoco se indica si se congelaron capas o si se aplicó un adaptador de bajo rango fusionado posteriormente. La única afirmación verificable es la ETag de la librería (`transformers`, `trl`, `unsloth`) y el tamaño del repositorio (0,2 GB), coherente con pesos en precisión de 16 bits de un modelo de 270M.

## Capacidades

- Generación de texto instructa: el modelo hereda el comportamiento de `gemma-3-270m-it`, orientado a seguir instrucciones breves y responder en formato conversacional.
- Razonamiento limitado: por tamaño, es previsible un rendimiento bajo en tareas de razonamiento multi-paso, matemáticas y lógica encadenada; no hay evaluación publicada que lo confirme ni lo desmienta.
- Generación de código: capacidad muy restringida a fragmentos cortos y plantillas; no apta para repositorios completos ni para depuración compleja.
- Tool calling / function calling: no documentado en este ajuste. El modelo base Gemma 3 270M se presentó con soporte de function calling en la documentación de Google, pero no hay confirmación de que el ajuste lo conserve.
- Agentes y razonamiento multi-paso: no documentado. El tamaño del modelo hace poco realista su uso como planificador autónomo.
- Capacidades multilingües: no documentadas; la etiqueta de idioma del repositorio es únicamente `en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El tag `gemma3_text` indica que se trabaja solo con la torre de texto.

## Casos de uso

- Clasificación y enrutado de intenciones: con 270M de parámetros, el modelo cabe en CPU y puede actuar como clasificador de intenciones o enrutador previo a un modelo mayor, reduciendo coste por consulta en sistemas de agentes.
- Extracción de entidades y estructurado de texto: generación de JSON con campos fijos a partir de correos, tickets o formularios, siempre con validación posterior mediante esquema, dado el riesgo de salida malformada en modelos pequeños.
- Prototipado rápido de ajustes finos: sirve como banco de pruebas para validar pipelines de Unsloth, TRL y despliegue antes de escalar a modelos de 1B-8B, con iteraciones de minutos en una sola GPU consumer.
- Inferencia en el borde (edge): ejecución local en Raspberry Pi, portátiles sin GPU dedicada o aplicaciones de escritorio, gracias a una huella de memoria inferior a 1 GB y a la posibilidad de cuantizar a 4 bits.
- Etiquetado sintético y aumento de datos: generación de borradores de etiquetas o paráfrasis cortas a gran escala y bajo coste, con revisión humana en el bucle.
- Moderación y filtrado de primera pasada: criba de contenido en tiempo real con latencia mínima, delegando los casos dudosos a un modelo mayor.
- Generación de plantillas y texto corto: respuestas predefinidas, descripciones de producto breves o textos de relleno donde no se requiere precisión factual alta.
- Educación y demos interactivas: despliegue en talleres o entornos docentes sin infraestructura GPU, para ilustrar el ciclo completo de ajuste fino de un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco ofrece comparación con el modelo base `unsloth/gemma-3-270m-it`. No es posible determinar si el ajuste ha degradado o mejorado las capacidades originales.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 540 MB de pesos más overhead de activaciones y caché KV; en la práctica, entre 1 y 1,5 GB.
- VRAM estimada en INT8: en torno a 270 MB de pesos.
- VRAM estimada en INT4: entre 140 y 200 MB, más el coste de la caché KV, que depende de la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM. Funciona con solvencia en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10G, A100 y H100, aunque en estas dos últimas el modelo desaprovecha la mayor parte de la capacidad de cómputo.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- CPU: es viable la inferencia en CPU (portátiles, servidores sin GPU, Raspberry Pi 4/5), con latencias mayores que en GPU.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference`), vLLM si la arquitectura Gemma 3 está soportada en la versión utilizada. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, no publicada en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (segun documentacion publica) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Trinity-Sirenia-AI (este modelo) | 270M | No confirmado en el repositorio; el base declara 32 768 tokens | Apache 2.0 declarada por el autor | HuggingFace, safetensors |
| google/gemma-3-270m-it (modelo base) | 270M | 32 768 tokens | Gemma Terms of Use | HuggingFace, safetensors, GGUF oficial |
| Qwen/Qwen3-0.6B | 600M | 32 768 tokens | Apache 2.0 | HuggingFace, safetensors, GGUF |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8 192 tokens en la variante de contexto largo | Apache 2.0 | HuggingFace, safetensors, GGUF |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2 048 tokens | Apache 2.0 | HuggingFace, safetensors, GGUF |

No hay datos de rendimiento comparado disponibles para Trinity-Sirenia-AI, por lo que la comparación se limita a parámetros, contexto declarado y licencia. Los valores de contexto y licencia de los modelos alternativos provienen de su documentación pública y no han sido verificados en esta ficha.

## Limitaciones y advertencias

- Sesgos desconocidos: el autor no publica información sobre el dataset de ajuste, por lo que no es posible evaluar sesgos de género, raza, religión o ideología introducidos o amplificados durante el entrenamiento.
- Riesgo de alucinación elevado: en modelos de 270M la tasa de afirmaciones inventadas es alta, especialmente en tareas factuales, matemáticas y razonamiento. No se recomienda su uso sin verificación en dominios sensibles (salud, legal, finanzas).
- Olvido catastrófico: un ajuste fino no documentado sobre un modelo pequeño puede degradar capacidades del modelo base (multilingüismo, seguimiento de instrucciones, formato). No hay evaluación que lo descarte.
- Idioma: la única etiqueta declarada es inglés. El uso en castellano no está soportado ni evaluado.
- Contexto: no se confirma que el ajuste conserve la ventana de 32 768 tokens del modelo base. En modelos pequeños, la calidad decae notablemente antes de alcanzar el límite nominal de contexto.
- Licencia: aunque la ficha declara Apache 2.0, el modelo deriva de Gemma 3, sujeto a los Gemma Terms of Use y a la política de uso prohibido de Google. Conviene revisar esas condiciones antes de un uso comercial, ya que la relicencia de un derivado de Gemma bajo Apache 2.0 es discutible.
- Ausencia de mantenimiento: 0 descargas, 0 interacciones y ausencia de documentación sugieren que el modelo no ha sido validado por terceros ni recibe soporte.
- Formato: al no publicarse GGUF ni cuantizaciones empaquetadas, el despliegue en llama.cpp, Ollama u otros runtimes ligeros exige conversión manual.
- Producción: no se recomienda su uso en producción sin una evaluación propia sobre el caso de uso concreto y sin un mecanismo de validación de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jubul676/Trinity-Sirenia-AI
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de la familia Gemma 3: https://ai.google.dev/gemma/docs

Nota: la búsqueda web asociada a esta ficha devolvió únicamente hilos del foro de desarrolladores de Roblox sin relación con el modelo, por lo que no se han incluido como enlaces relevantes. No se han encontrado papers, blogs técnicos ni demos vinculados a Trinity-Sirenia-AI.
