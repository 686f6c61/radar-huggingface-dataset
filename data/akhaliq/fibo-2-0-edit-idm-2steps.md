# akhaliq/Fibo-2.0-edit-IDM-2steps

## Resumen

Fibo-2.0-edit-IDM-2steps es un adaptador LoRA de destilación para edición de imágenes que comprime el modelo Bria Fibo 2.0 Edit Turbo de 4 pasos de inferencia a solo 2 pasos, sin classifier-free guidance (CFG). Lo publica el usuario akhaliq en Hugging Face como implementación comunitaria del método Intrinsic Distribution Matching (IDM) de Liu et al. (arXiv:2610.39633), aplicado sobre el modelo base briaai/Fibo-2.0-edit-turbo de Bria AI. El resultado es un editor de imágenes image-to-image que requiere únicamente dos evaluaciones de la red DiT por edición, frente a las cuatro del modelo turbo original.

El modelo resuelve un problema de eficiencia en inferencia: la edición de imágenes con modelos de difusión de alta calidad suele requerir decenas de pasos, y las variantes destiladas "turbo" ya reducen esto a 4 pasos. Este adaptador va un paso más allá mediante una pila IDM que combina distribución matching interno con una pérdida de momentos de características, manteniendo el maestro de 4 pasos congelado como fuente de score real. El repositorio ocupa 0,5 GB y se distribuye como pesos LoRA en safetensors para la librería diffusers.

Es relevante ahora porque reduce el coste computacional de la edición de imágenes en producción (mitad de forwards por edición) y porque documenta abiertamente un proceso de entrenamiento en curso, con checkpoints intermedios y rejillas de comparación cada 100 pasos. No obstante, en el momento de redactar esta ficha el entrenamiento está en progreso y los resultados de evaluación en MagicBrush aún no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, α=64) sobre DiT del modelo base Bria Fibo 2.0 Edit Turbo |
| Parametros totales | No disponible (adaptador LoRA; el modelo base no reporta cifra en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen; resolución de entrenamiento 1024×1024) |
| Tipos de cuantizacion | No disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Inglés (instrucciones de edición en texto plano) |
| Licencia | bria-fibo (CC BY-NC 4.0, uso no comercial) |
| Formato de pesos | safetensors (pytorch_lora_weights.safetensors), cargable con diffusers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer de difusión (DiT) del modelo base Fibo 2.0 Edit Turbo, que ya es una variante destilada a 4 pasos sin CFG. La pila IDM sigue fielmente el paper arXiv:2610.39633 con una adaptación de ingeniería: en lugar de mantener una red maestra separada en memoria, el score real lo proporciona el maestro de 4 pasos congelado, mientras que las ramas de fake-score, generador y EMA son adaptadores LoRA sobre una misma base compartida, seleccionados por forward pass; el maestro es esa misma base con los adaptadores desactivados. La dirección DMD es `sg[v_real − v_fake]`, recortada a ±1 como en APEX.

La función de pérdida combina el distribution matching interno con una pérdida de momentos de características (L_pop, λ = 0,5) que iguala media y desviación estándar por coordenada en el espacio de características EMA del generador (estados ocultos del último bloque con mean-pooling en niveles altos de ruido), usando dos colas FIFO de K = 16384 y la distribución de referencia formada por las imágenes editadas ground-truth. La rama de fake-score se entrena con flow matching sobre las salidas del generador detachadas. La receta: LoRA r=64 α=64 en todas las capas lineales, AdamW con lr 1e-4 (betas 0,9/0,99), bf16, gradient checkpointing, resolución 1024×1024, batch global 16, aproximadamente 700 pasos sobre 4×H200, EMA decay 0,99, e inicialización zero-LoRA sobre el modelo turbo (el estudiante arranca como el maestro de 4 pasos ejecutado a 2 pasos). Los datos son 9.000 tripletas de edición de UltraEdit_500k (edición libre, `clip_sim_dir ≥ 0,1`) con instrucciones en texto plano; la evaluación se hace sobre el split de test de MagicBrush, nunca visto en entrenamiento.

## Capacidades

- Edición de imágenes image-to-image a partir de instrucciones en lenguaje natural ("make the jacket red leather").
- Edición de atributos: color, expresión, sustitución de objetos y transferencia de estilo.
- Inferencia en 2 evaluaciones de red por edición, sin CFG (`num_inference_steps=2`, `guidance_scale=1.0`).
- Integración con la pipeline `BriaFibo2Pipeline` de diffusers y carga del adaptador mediante `load_lora_weights`.
- Edición con máscaras y multi-referencia heredada del modelo base (no destilada explícitamente).
- Instrucciones de edición en inglés, en formato de texto plano compatible con la codificación de la pipeline.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Edición interactiva de fotografía en aplicaciones de consumo: el modelo permite aplicar cambios de atributo (color de prendas, expresión facial, sustitución de objetos) en 2 pasos de red, lo que reduce la latencia percibida en editores con previsualización en tiempo real.
- Prototipado rápido de variaciones creativas: para un mismo producto o escena, se pueden generar múltiples versiones editadas con instrucciones de texto y comparar en minutos, gracias al bajo coste por edición.
- Enriquecimiento de datasets de imagen: generar pares imagen original / imagen editada para entrenar otros modelos o para aumentar la diversidad de conjuntos de datos de edición, usando los checkpoints publicados.
- Pruebas A/B de campañas visuales: aplicar cambios de color, estilo o elementos de marca sobre imágenes base y evaluar variantes con usuarios, con un coste de inferencia reducido a la mitad respecto al modelo turbo de 4 pasos.
- Investigación en destilación de modelos de difusión: el repositorio sirve como referencia reproducible de la pila IDM (score interno, pérdida de momentos, colas FIFO) para experimentar con otras variantes de pocos pasos.
- Filtrado y corrección de imágenes en pipelines de moderación o control de calidad: aplicar ediciones de atributo controladas sobre imágenes candidatas antes de su publicación, siempre que el uso sea no comercial.
- Integración en demos y notebooks de Hugging Face: el adaptador es ligero (0,5 GB) y se carga sobre el modelo base con diffusers, lo que facilita su uso en entornos de demostración con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en MagicBrush (L1, CLIP-I, CLIP-T) para la comparación entre 2 pasos naive, 2 pasos IDM y el maestro de 4 pasos se publicarán en `eval/` cuando finalice el entrenamiento. Únicamente se documenta el coste de inferencia:

| Modelo | Forwards DiT por edición |
|---|---:|
| Fibo 2.0 Edit Turbo (4 pasos, sin CFG) | 4 |
| Este adaptador (2 pasos, sin CFG) | 2 |

## Requisitos de hardware

- Entrenamiento: 4×H200 con bf16, gradient checkpointing, batch global 16 y resolución 1024×1024 durante aproximadamente 700 pasos.
- Inferencia: requiere cargar el modelo base briaai/Fibo-2.0-edit-turbo en bf16 sobre CUDA; el adaptador añade solo 0,5 GB de pesos LoRA.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base y de la resolución de trabajo (1024×1024 en entrenamiento).
- GPU recomendadas: no se especifican; por el tamaño del modelo base y la resolución, se orienta a GPU de datacenter (H200, A100, H100) o GPUs consumer de gama alta con suficiente VRAM, aunque no se confirma que quepa en consumer.
- Opciones de despliegue: diffusers con `BriaFibo2Pipeline` y `load_lora_weights`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen de este tipo).
- Latencia y throughput: no disponibles; la ventaja documentada es la reducción de 4 a 2 forwards por edición.

## Comparativa con modelos similares

| Modelo | Pasos de inferencia | CFG | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Fibo 2.0 Edit Turbo (base) | 4 | No | Pesos completos | bria-fibo (CC BY-NC 4.0) | Publicado |
| Este adaptador (IDM 2 pasos) | 2 | No | LoRA safetensors | bria-fibo (CC BY-NC 4.0) | Entrenamiento en curso |
| akhaliq/MOSS-Image-IDM-2-Steps | 2 | No disponible | LoRA | No disponible en la información | Referencia del autor |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada, por lo que no es posible comparar calidad de edición (L1, CLIP-I, CLIP-T) entre ellas.

## Limitaciones y advertencias

- El entrenamiento está en progreso: los checkpoints y las rejillas de comparación se actualizan cada 100 pasos y los resultados de evaluación aún no están publicados; el adaptador final puede diferir del estado actual.
- Los editores de pocos pasos favorecen ediciones a nivel de atributo (color, expresión, sustitución de objeto, estilo); las transformaciones estructurales grandes son difíciles para cualquier editor de pocos pasos.
- Entrenado sobre recortes cuadrados de 1024 px de ediciones libres de UltraEdit; la edición con máscaras y multi-referencia se hereda del modelo base pero no se destiló explícitamente.
- Idioma limitado al inglés en las instrucciones de edición.
- Licencia CC BY-NC 4.0 (no comercial) según los términos de Bria; el uso comercial requiere licencia aparte del modelo base.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base y de los datos de entrenamiento (UltraEdit_500k), no cuantificado en la información disponible.
- No se documentan cuantizaciones ni requisitos mínimos de VRAM, lo que dificulta planificar despliegues en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Fibo-2.0-edit-IDM-2steps
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Paper IDM (Intrinsic Distribution Matching): https://arxiv.org/abs/2610.39633
- Paper Fibo 2.0: https://arxiv.org/abs/2511.06876
- Dataset de entrenamiento UltraEdit_500k: https://huggingface.co/datasets/BleachNick/UltraEdit_500k
- Dataset de evaluación MagicBrush: https://huggingface.co/datasets/osunlp/MagicBrush
- Implementación previa del autor (MOSS Image IDM 2 Steps): https://huggingface.co/akhaliq/MOSS-Image-IDM-2-Steps
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Badge ML Intern: https://hf.co/chat?mode=ml-intern
