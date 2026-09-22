# kitt3n/anima-prompt-expander-qwen3.5-4b-lora

## Resumen

Anima Prompt Expander · Qwen3.5-4B LoRA es un adaptador LoRA (PEFT) entrenado sobre el modelo de lenguaje Qwen/Qwen3.5-4B. Lo desarrolla el usuario kitt3n y su función es concreta: convertir descripciones visuales escritas en chino en prompts breves en inglés, en formato de etiquetas y frases de relación cortas, pensados para alimentar el generador de imágenes Anima-Aesthetic. No es un LoRA para cargar sobre Anima, sino un adaptador de texto que se monta sobre un modelo de lenguaje y produce texto.

El adaptador tiene 32.464.896 parámetros entrenables sobre una base congelada, con rango LoRA 16, alpha 32 y dropout 0,05, aplicado a las proyecciones de full attention, linear attention y MLP. El entrenamiento se hizo con Unsloth en BF16 sin cuantizar, con longitud de secuencia de 512 tokens, 3 épocas y un total de 171 pasos, y el checkpoint publicado (checkpoint-114) es el de menor validation loss (0,11505283415317535). El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors y los artefactos de entrenamiento.

Su relevancia es acotada pero clara: cubre una tarea de traducción y expansión de prompts muy específica, con un conjunto de datos propio de 1.000 pares (500 conceptos) y una convención de salida muy estricta que prohíbe añadir nombres de artistas o etiquetas de calidad genéricas. Es un experimento de pequeña escala orientado a un pipeline concreto, no un modelo de propósito general, y así lo declara el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Qwen3.5-4B con full attention, linear attention y proyecciones MLP |
| Parámetros totales | Base Qwen3.5-4B (4.000 millones nominales, cifra exacta no disponible); adaptador de 32.464.896 parámetros entrenables |
| Longitud de contexto | 512 tokens en entrenamiento; el proyecto de inferencia exige que entrada y salida sumen como máximo 512 tokens. Contexto nativo del modelo base: no disponible |
| Tipos de cuantización | No disponible. El entrenamiento se realizó en BF16 sin cuantizar; los pesos publicados son el adapter en safetensors |
| Idiomas soportados | Chino (zh) e inglés (en); entrada en chino, salida en inglés |
| Licencia | No declarada para el adaptador ni para el dataset. La licencia del modelo base es Apache-2.0, que no es extensible automáticamente al adaptador |
| Formato de pesos | safetensors (adapter LoRA/PEFT) |
| Tipo de artefacto | Adapter, no modelo completo; requiere cargar la base por separado |
| Modelo base | Qwen/Qwen3.5-4B, revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` (versión oficial post-trained) |
| Tokenizer | El de Qwen/Qwen3.5-4B en la misma revisión; no se reentrenó ni se añadieron tokens. No se distribuye en el repositorio |
| Dataset de entrenamiento | kitt3n/anima-prompt-expander-v0.4 (500 conceptos, 1.000 pares; 900/50/50 train/validation/test) |
| Tamaño del repositorio | 0,1 GB |
| Checkpoint publicado | checkpoint-114, seleccionado por menor validation loss |
| Validation loss | 0,11505283415317535 |
| SHA-256 de los pesos | `a9390fd615cde298601d223b4ebfa325ed85d118410b0006f19b3b8b3f850acb` |
| Librería | peft (entrenado con Unsloth) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Qwen3.5-4B, con la base congelada. Los hiperparámetros declarados son rango 16, alpha 32 y dropout 0,05, aplicados a las proyecciones de full attention, linear attention y MLP, lo que indica que el modelo base combina mecanismos de atención completa y de atención lineal. El entrenamiento se hizo con Unsloth en BF16 sin cuantización, con micro batch 1 y acumulación de gradiente 16 (lote efectivo de 16), learning rate 1e-4, AdamW con weight decay 0,01, scheduler coseno con 5 % de warmup, 3 épocas y semilla 3407. La supervisión se limitó a la respuesta en inglés del asistente y al token de fin, con longitud de secuencia de 512.

El conjunto de datos es Anima Prompt Expander Dataset v0.4: 500 conceptos y 1.000 pares de ejemplo, con división 900/50/50 y la regla de que las reformulaciones de un mismo concepto permanecen en el mismo split. La tabla de fuentes declara 200 muestras piloto confirmadas y 800 muestras sintéticas. El proceso completo llegó al paso 171 (3 épocas) y después se restauró checkpoint-114, elegido por menor pérdida de validación, para exportar el adaptador. El paquete no incluye el estado del optimizador, del scheduler ni del RNG, por lo que no permite reanudar el entrenamiento de forma exacta.

Como innovación destacable no hay ninguna técnica novedosa de inferencia: el valor del proyecto está en la convención de salida y en el prompt de sistema fijo ("Convert the user's visual description into a concise English prompt for Anima-Aesthetic. Preserve the intended content and add only visually useful details."), junto con el uso de `enable_thinking=False` y decodificación greedy. La receta completa está en `training_recipe.json` y los resultados en `training_summary.json`, `metrics.csv` y `loss.png`.

## Capacidades

- Expansión y traducción de prompts: convierte una descripción visual en chino en un prompt en inglés con etiquetas y frases de relación cortas, apto para Anima-Aesthetic.
- Preservación de contenido: mantiene sujeto, acción, relaciones espaciales, composición y estilo indicado por el usuario; la expansión es deliberadamente contenida.
- Control de longitud: está entrenado para producir salidas compactas, con un presupuesto conjunto de 512 tokens entre entrada y salida.
- Restricciones de estilo aprendidas: no añade nombres de artistas ni etiquetas genéricas de calidad como `masterpiece` o `best quality`, y evita expandir entradas cortas hacia escenas no relacionadas.
- Multilingüismo limitado: entrada en chino y salida en inglés; no hay evidencia de soporte para otras lenguas.
- Tool calling / function calling: no disponible; no se declara ninguna capacidad de este tipo.
- Uso como agente o razonamiento multi-paso: no disponible; el prompt de sistema y la decodificación greedy apuntan a una tarea de un solo paso.
- Modo thinking: explícitamente desactivado (`enable_thinking=False`).
- Capacidades multimodales (visión, audio): no disponibles; es un adaptador de generación de texto.
- Ajuste adicional: al ser un adaptador PEFT sobre una base Apache-2.0, es reutilizable como punto de partida para más SFT sobre la misma tarea.

## Casos de uso

- Generación de prompts para Anima-Aesthetic: un usuario escribe en chino "可爱的边牧，在草地探索，全身，柔和日光" y el adaptador devuelve el prompt en inglés con las etiquetas y relaciones espaciales correspondientes, respetando el encuadre y la iluminación indicados.
- Integración en una interfaz de generación de imágenes: el adaptador se coloca delante del generador para que el usuario trabaje en su idioma y el modelo de difusión reciba siempre texto en inglés con el formato esperado.
- Conversión por lotes de descripciones: dado un fichero con cientos de descripciones en chino, se procesan en serie con `max_new_tokens` acotado (por ejemplo 96) para producir prompts normalizados, aprovechando que la tarea es de un solo turno y decodificación greedy.
- Normalización de metadatos de datasets de imágenes: al generar etiquetas consistentes y sin adiciones inventadas, sirve para etiquetar automáticamente capturas o catálogos bilingües antes de entrenar o evaluar modelos de difusión.
- Editor de prompts asistido: como el modelo conserva la intención y no introduce ruido de estilo, encaja en una herramienta que sugiera una versión en inglés del prompt y permita al usuario editarla antes de enviarla al generador.
- Preprocesado dentro de un pipeline de generación con control de coste: al ser un LoRA de 32,5 millones de parámetros entrenables sobre una base de 4B, se puede servir en la misma GPU que otros componentes y mantener el presupuesto de 512 tokens por petición.
- Investigación en SFT con LoRA: la publicación incluye receta, métricas y curva de pérdida, lo que lo hace útil como caso de estudio reproducible de ajuste de bajo rango para una tarea de reescritura muy restringida.
- Evaluación de fidelidad de reescritura: se puede comparar la salida del adaptador con la del modelo base sin adaptador para medir cuánto aporta el ajuste en formato, concisión y omisión de etiquetas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos publicados son métricas de entrenamiento y validación, no evaluaciones estándar de capacidad:

| Métrica | Valor |
|---|---|
| Validation loss (mejor, checkpoint-114) | 0,11505283415317535 |
| Pasos de entrenamiento | 171 (3 épocas) |
| Muestras de validación | 50 (selección de checkpoint) |
| Muestras de test | 50, no usadas en entrenamiento ni en selección; el autor no declara resultados sobre ellas |
| Benchmark interno de desarrollo | 30 casos fijos; el propio autor indica que no sustituye a una evaluación real de generación de imágenes con Anima |

El autor advierte explícitamente de que la validation loss no es una puntuación de calidad de imagen generada y de que no se reclama ningún resultado sobre el conjunto de test.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa aproximadamente 0,1 GB. La base Qwen3.5-4B en BF16 requiere del orden de 8-9 GB solo para pesos, más overhead de activaciones y caché KV; con 512 tokens de contexto el consumo total estimado se sitúa en torno a 10-12 GB. Estas cifras son estimaciones derivadas del tamaño del modelo, no datos publicados.
- Requisito declarado por el autor: Linux o WSL2, Python 3.11 y una GPU NVIDIA con soporte BF16. El proyecto de inferencia carga la base con Unsloth (`text_only=True`) y el adaptador con PEFT, sin cuantización.
- GPU recomendadas: cualquier NVIDIA con BF16 y al menos 12 GB para ejecución en BF16 sin cuantizar (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); para servir varias peticiones concurrentes, A100 o H100.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 12 GB o más; con cuantización de la base a 4 bits el requisito bajaría a unos 3-4 GB, pero esa ruta no está documentada ni validada por el autor.
- Opciones de despliegue: el camino soportado es Transformers + PEFT + Unsloth con el script `infer.py` del proyecto `anima-prompt-expander-sft`. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; usarlos exigiría fusionar el adaptador con la base y convertir los pesos, algo que la model card no cubre.
- Latencia y throughput: no disponible.
- Almacenamiento: el adaptador requiere 0,1 GB y los ficheros del modelo base deben descargarse aparte desde el repositorio de Qwen.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores de expansión de prompts en la información proporcionada, y la búsqueda web no devolvió resultados relevantes. La única comparación que puede documentarse es contra la base sin adaptador:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| anima-prompt-expander-qwen3.5-4b-lora | Base 4B + 32.464.896 entrenables | 512 tokens en entrenamiento | Adaptador no declarada; base Apache-2.0 | safetensors (adapter) | Especializado en zh → en para Anima-Aesthetic; validation loss 0,1151 |
| Qwen/Qwen3.5-4B (base) | 4B nominales | No disponible | Apache-2.0 | safetensors | Modelo de propósito general; no garantiza el formato de etiquetas ni la omisión de nombres de artistas |
| Otros adaptadores de expansión de prompts | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la información disponible |

## Limitaciones y advertencias

- Modelo de escala pequeña y tarea única: el propio autor lo describe como un experimento específico que puede omitir restricciones del usuario, añadir detalles de más o comportarse de forma inestable fuera de la distribución de entrenamiento.
- Alucinación: al ser un modelo generativo puede introducir elementos visuales no solicitados, aunque la convención de entrenamiento penaliza la expansión injustificada y la inclusión de etiquetas de calidad genéricas.
- Contexto muy corto: 512 tokens compartidos entre entrada y salida; entradas largas o peticiones con muchas restricciones no caben y el proyecto de inferencia las rechaza.
- Cobertura lingüística reducida: solo chino e inglés. No hay evidencia de funcionamiento en castellano ni en otras lenguas.
- Sin evaluación de calidad final: no se publican resultados sobre el conjunto de test ni evaluación con el generador Anima real; la única métrica es la pérdida de validación, que el autor advierte que no mide calidad de imagen.
- Licencia ambigua para uso comercial: el adaptador y el dataset no tienen licencia declarada. La base es Apache-2.0, pero eso no autoriza automáticamente el adaptador ni los datos; el propio autor indica que no añade una declaración de licencia que no existe.
- Reproducibilidad parcial: el paquete no incluye estado de optimizador, scheduler ni RNG, y la receta depende de versiones concretas del entorno (Transformers 5.5.0, Unsloth 2026.9.4, Python 3.11), sensibles a cambios.
- Fecha de publicación reciente y sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Dependencia del tokenizer del base: el repositorio no distribuye tokenizer ni chat template; hay que copiarlos desde la revisión concreta del modelo base, y una discrepancia de versión puede alterar el formato de las respuestas.
- Advertencia sobre el nombre: es un LoRA de texto sobre un LLM, no un LoRA para cargar en el modelo de imágenes Anima; usarlo en el sitio equivocado no funcionará.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kitt3n/anima-prompt-expander-qwen3.5-4b-lora
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión concreta del modelo base usada en el entrenamiento: https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/README.md
- Dataset Anima Prompt Expander v0.4: https://huggingface.co/datasets/kitt3n/anima-prompt-expander-v0.4
- Perfil del autor: https://huggingface.co/kitt3n
- Proyecto de entrenamiento e inferencia: `anima-prompt-expander-sft` (referenciado en la model card; no se proporciona URL en la información disponible)
- Resultados de la búsqueda web: no se encontró ningún resultado relevante sobre este modelo; los enlaces devueltos correspondían a contenidos no relacionados (comparativas de cuentas de ahorro) y se descartan.
