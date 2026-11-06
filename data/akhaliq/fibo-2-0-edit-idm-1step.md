# akhaliq/Fibo-2.0-edit-IDM-1step

## Resumen

Fibo-2.0-edit-IDM-1step es un adaptador LoRA de edición de imágenes que reduce a una única evaluación de red (1-NFE, sin CFG) el modelo de edición Fibo 2.0 Edit Turbo de Bria AI, originalmente destilado a 4 pasos. Lo publica el usuario akhaliq como implementación comunitaria de Intrinsic Distribution Matching (IDM), el método descrito por Liu et al. en arXiv:2610.39633. El adaptador se monta sobre el checkpoint base `briaai/Fibo-2.0-edit-turbo` mediante la librería Diffusers, sin necesidad de reentrenar el modelo completo.

El interés práctico está en el coste de inferencia: pasar de 4 pasos a 1 paso sin classifier-free guidance reduce a la cuarta parte los forwards del DiT por edición, lo que abarata despliegues de edición de imagen interactiva. El precio es una pérdida medible de fidelidad: en MagicBrush el L1 sube de 0,2198 a 0,2624 y el CLIP-I baja de 0,5430 a 0,5312 respecto al teacher naive de un paso.

El repositorio ocupa 6,6 GB (incluye el adaptador y la carpeta de comparación `naive_1step/`), está entrenado solo en inglés y hereda la licencia no comercial CC BY-NC 4.0 del modelo base de Bria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (modelo base Fibo 2.0 Edit Turbo) con adaptador LoRA; destilación IDM |
| Parametros totales | no disponible (el adaptador es LoRA r=64, α=64, all-linear; el recuento del base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; entrada 1024×1024) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | inglés (en) |
| Licencia | bria-fibo, CC BY-NC 4.0 (no comercial) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`), librería Diffusers |
| Resolucion de entrenamiento | 1024×1024 (crops cuadrados) |
| Pasos de inferencia | 1 (sin CFG, `guidance_scale=1.0`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un DiT congelado (Fibo 2.0 Edit Turbo) con tres ramas LoRA paralelas (generador, fake y EMA) inicializadas a cero. La destilación sigue el esquema de Intrinsic Distribution Matching: la score real proviene del teacher de 4 pasos con adaptadores desactivados, la score fake de una rama LoRA entrenada con flow matching sobre salidas del generador con gradiente detenido, y la dirección DMD se calcula como `sg[clamp(v_real - v_fake, ±1)]`, siguiendo la construcción de APEX/TwinFlow. Se añade una pérdida de momentos de features (L_pop, λ = 0,5) que iguala media y desviación típica por coordenada en el espacio de features del generador-EMA (hidden states del último bloque con mean-pooling a alto ruido), con dos colas FIFO de K = 16384 frente a imágenes editadas de referencia. El generador aplica estrictamente el mapa 1-NFE `x = z − v_gen(z, t=1)` durante todo el entrenamiento.

La receta concreta: LoRA r=64, α=64, all-linear, tres ramas sobre un único base congelado, AdamW con lr 1e-4, bf16, gradient checkpointing, resolución 1024×1024, batch 8, 550 pasos en una sola H200, EMA con decay 0,99. Los datos son 9.000 tripletas de edición extraídas de UltraEdit_500k (subconjunto FreeForm con `clip_sim_dir ≥ 0,1`); las features de la pérdida de momentos se extraen a 512 px para ajustarse a la memoria de una GPU. La evaluación se hace sobre el split de test de MagicBrush, primeras filas de conversación, nunca vistas en entrenamiento.

## Capacidades

- Edición de imágenes por instrucción en lenguaje natural (image-to-image) en una sola evaluación del DiT, sin CFG.
- Edición a nivel de atributo: cambio de color, expresión, intercambio de objetos y transferencia de estilo, que son los casos donde el régimen de 1 paso funciona mejor.
- Edición free-form: las instrucciones no están restringidas a plantillas o máscaras.
- Edición con máscaras y multi-referencia heredadas del modelo base, aunque no destiladas explícitamente.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de texto, audio o vídeo: es un modelo generativo de imagen.
- Multilingüe limitado: solo inglés en instrucciones.

## Casos de uso

- Edición interactiva de fotos en aplicaciones de consumo: con 1 NFE y sin CFG, el coste por edición cae a la cuarta parte del teacher de 4 pasos, lo que permite previsualizaciones casi instantáneas mientras el usuario ajusta la instrucción.
- Retoque de catálogo de producto: cambiar color o material de prendas y accesorios ("make the jacket red leather") sobre imágenes 1024×1024, un caso de atributo que el adaptador maneja bien.
- Iteración de diseño gráfico: aplicar estilos y variaciones de expresión sobre un render base para explorar alternativas antes de un render final de mayor calidad con el modelo de 4 pasos.
- Prototipado rápido en pipelines de investigación: banco de pruebas para comparar regímenes 1-NFE frente a 4-NFE sobre MagicBrush sin reentrenar el base, gracias a la carpeta `naive_1step/`.
- Preprocesado de datasets de imagen: generar pares instrucción-imagen de forma barata para aumentación o para filtrar candidatos antes de una pasada de anotación humana.
- Demos y espacios de Hugging Face: el adaptador se carga con `load_lora_weights` sobre el pipeline `BriaFibo2Pipeline`, lo que simplifica el despliegue en entornos con una sola GPU.
- Edición por lotes en servidor: al ser un único forward por imagen, el throughput por GPU H200/A100 escala mejor que con el teacher de 4 pasos, a costa de menor fidelidad estructural.

## Benchmarks y rendimiento

Evaluación en MagicBrush test, 128 primeras filas, 1 NFE, Euler sin shift de t=1→0 en ambas filas; L1 y CLIP-I frente a la imagen objetivo ground-truth, CLIP-T (ViT-B/32) entre salida e instrucción.

| Modelo | Pasos | L1 ↓ | CLIP-I ↑ | CLIP-T ↑ |
|---|---|---:|---:|---:|
| Fibo 2.0 Edit Turbo, naive | 1 | 0,2198 | 0,5430 | 0,2080 |
| IDM 1-step (este adaptador) | 1 | 0,2624 | 0,5312 | 0,2002 |

Referencia del repositorio hermano de 2 pasos (protocolo distinto, 2 NFE): teacher de 4 pasos con L1 0,0479, CLIP-I 0,9180 y CLIP-T 0,2066. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó una H200 con batch 8 a 1024×1024 y bf16, y las features de evaluación se extrajeron a 512 px para ajustarse a una sola GPU.
- GPU recomendadas: H200 (usada en el entrenamiento), A100 y H100 para despliegue en producción; el modelo base es un DiT a 1024×1024, por lo que no es un modelo ligero.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras consumer; el tamaño del repositorio (6,6 GB) y la resolución de trabajo sugieren que requiere GPUs de gama alta con bastante VRAM.
- Opciones de despliegue: Diffusers con `BriaFibo2Pipeline.from_pretrained("briaai/Fibo-2.0-edit-turbo")` más `pipe.load_lora_weights(...)`; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen).
- Latencia y throughput: no disponibles; la única métrica objetiva es la reducción de 4 a 1 forwards del DiT por edición.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos / NFE | Contexto de imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fibo-2.0-edit-IDM-1step (este) | LoRA sobre DiT, destilación IDM | 1, sin CFG | 1024×1024 | CC BY-NC 4.0 | Hugging Face, Diffusers |
| Fibo 2.0 Edit Turbo (base) | DiT destilado | 4, sin CFG | 1024×1024 | CC BY-NC 4.0 | Hugging Face, Diffusers |
| Fibo 2.0 Edit Turbo naive 1-step | Prueba 1 paso sin destilar | 1 | 1024×1024 | CC BY-NC 4.0 | carpeta `naive_1step/` del repo |
| Repositorio hermano IDM 2-step | LoRA sobre DiT, destilación IDM | 2 | 1024×1024 | CC BY-NC 4.0 | Hugging Face (referenciado, no enlazado) |

No se dispone de comparación con otros editores de imagen de la misma categoría (por ejemplo, modelos de edición por instrucción de otros proveedores) en la información proporcionada.

## Limitaciones y advertencias

- La edición a 1 paso favorece cambios de atributo (color, expresión, intercambio de objeto, estilo); las ediciones estructurales y el texto dentro de la imagen siguen siendo los casos más difíciles a 1 NFE.
- Pérdida de fidelidad medible frente al teacher naive de 1 paso en MagicBrush: L1 +0,0426 y CLIP-I −0,0118, y muy lejos del teacher de 4 pasos (L1 0,0479).
- Entrenado sobre crops cuadrados de 1024 px de ediciones free-form de UltraEdit; el encuadre no cuadrado y otras distribuciones de imagen no están cubiertas explícitamente.
- La edición con máscaras y multi-referencia se hereda del base pero no se destiló de forma explícita, por lo que su comportamiento a 1 paso no está validado.
- Licencia CC BY-NC 4.0: uso comercial prohibido según los términos de Bria; verificar el `license_link` del repositorio antes de cualquier despliegue.
- Solo instrucciones en inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación visual y de deriva semántica inherente a los modelos de difusión destilados a muy pocos pasos; conviene validar con el teacher de 4 pasos en producciones sensibles a la fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Fibo-2.0-edit-IDM-1step
- Árbol de ficheros del repositorio: https://huggingface.co/akhaliq/Fibo-2.0-edit-IDM-1step/tree/main
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Paper de IDM (Liu et al., 2026): https://arxiv.org/abs/2610.39633
- Paper de Fibo 2.0 (Bria AI): https://arxiv.org/abs/2511.06876
- Dataset de entrenamiento UltraEdit_500k: https://huggingface.co/datasets/BleachNick/UltraEdit_500k
- Dataset de evaluación MagicBrush: https://huggingface.co/datasets/osunlp/MagicBrush
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- ML Intern (herramienta usada para construir el modelo): https://hf.co/chat?mode=ml-intern
