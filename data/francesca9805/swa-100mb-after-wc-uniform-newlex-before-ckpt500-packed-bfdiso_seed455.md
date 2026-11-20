# francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455

## Resumen

El modelo `swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455` es un ajuste fino (SFT) desarrollado por el usuario de Hugging Face `francesca9805`, derivado del checkpoint `francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed455`. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 124.770.816 parámetros totales, entrenado mediante la librería TRL (versión 0.23.0) sobre Transformers 4.56.2. Su relevancia es limitada: se enmarca en una línea de experimentación académica sobre tokenizadores y ajuste supervisado, más que en un modelo de propósito general listo para producción.

El nombre del repositorio sugiere un experimento controlado con ventana deslizante (SWA, *sliding window attention* o *stochastic weight averaging*, no especificado), un corpus de aproximadamente 100 MB, un tokenizador léxico nuevo ("newlex") y un tamaño de paquete ("packed") con precisión bf16. No obstante, la model card no documenta ninguno de estos detalles técnicos, por lo que la mayoría de las especificaciones deben considerarse no disponibles.

A pesar de su escasa documentación, el modelo acumula 1682 descargas y está etiquetado como compatible con endpoints y text-generation-inference, lo que indica que puede desplegarse con infraestructura estándar de Hugging Face. Su utilidad práctica es acotada y debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only con atención causal completa, según la etiqueta `gpt2` del repositorio y el pipeline `text-generation`. El modelo tiene 124.770.816 parámetros, un tamaño coherente con la variante GPT-2 base (~124M). No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni longitud de contexto máxima.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre el checkpoint base `francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed455`. Los metadatos indican un experimento previo de preentrenamiento o ajuste sobre un corpus de aproximadamente 100 MB con un tokenizador nuevo ("newlex"), empaquetado de secuencias ("packed") y precisión bf16. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card enlaza un run de Weights & Biases del proyecto `f-padovani-university-of-groningen/new-tokenizers`, lo que sitúa el trabajo en un contexto de investigación universitaria.

## Capacidades

- Generación de texto autoregresiva en formato conversacional (el ejemplo de la model card usa una lista de mensajes con rol `user`).
- Ajuste supervisado para seguir instrucciones básicas, derivado del pipeline SFT de TRL.
- Compatibilidad con `transformers.pipeline("text-generation")` y con text-generation-inference.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Experimentación académica sobre tokenizadores: el modelo sirve como punto de comparación en estudios que evalúan el impacto de un vocabulario léxico nuevo ("newlex") frente a tokenizadores estándar, dado su origen en el proyecto `new-tokenizers` de la Universidad de Groningen.
- Reproducción de experimentos de SFT: investigadores pueden replicar el ajuste supervisado con TRL 0.23.0 y Transformers 4.56.2 sobre el checkpoint base indicado, usando las versiones de framework documentadas.
- Generación de texto de dominio acotado: al haberse entrenado sobre un corpus de aproximadamente 100 MB, puede emplearse para generar texto estilísticamente similar a ese corpus, siempre que se valide la calidad de forma empírica.
- Pruebas de infraestructura de despliegue: su tamaño reducido (~125M parámetros) permite validar pipelines de TGI, endpoints compatibles o inferencia con transformers sin requerir GPU de gama alta.
- Evaluación de técnicas de empaquetado de secuencias: el sufijo "packed" del nombre sugiere que el modelo es útil para estudiar el efecto del sequence packing en el entrenamiento, comparándolo con variantes no empaquetadas.
- Docencia y prototipado rápido: adecuado para demostraciones en cursos de NLP donde se necesita un modelo pequeño, entrenable y desplegable en hardware modesto, con la advertencia de que su calidad no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB solo para pesos (124,77M × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en bf16/fp16: aproximadamente 250 MB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4090, entre otras.
- Opciones de despliegue: `transformers` (pipeline nativo), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles de Hugging Face. No se ha publicado conversión a GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455 | 124,77M | no disponible | no disponible | Hugging Face |
| GPT-2 base (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| GPT-2 small (OpenAI) | 117M | 1024 tokens | MIT | Hugging Face |
| DistilGPT-2 | 82M | 1024 tokens | Apache 2.0 | Hugging Face |

La comparación se limita a la familia GPT-2 por tamaño; no se dispone de datos de rendimiento del modelo evaluado que permitan contrastar calidad frente a estas alternativas. GPT-2 base y DistilGPT-2 cuentan con licencias permisivas y documentación completa, ventajas que el modelo evaluado no ofrece.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste sobre un corpus de ~100 MB no especificado, es probable que herede sesgos de ese corpus, pero no pueden evaluarse sin acceso a los datos.
- Riesgo de alucinación elevado y no cuantificado: no hay evaluaciones publicadas de fidelidad ni de tasa de alucinación.
- Longitud de contexto no documentada; no debe asumirse la ventana estándar de GPT-2 (1024 tokens) sin verificarla empíricamente.
- Idiomas soportados no disponibles; el uso en castellano no está garantizado ni evaluado.
- Licencia no especificada (`licence: license` en la model card): no puede confirmarse el permiso para uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue comercial.
- El nombre del repositorio sugiere un checkpoint intermedio de un experimento (sufijo `ckpt500`), no un modelo final pulido; la calidad esperada es la de un artefacto de investigación.
- Sin datos de benchmarks ni evaluación independiente: no debe emplearse en producción sin una validación propia exhaustiva.
- El repositorio ocupa 22,7 GB, desproporcionado para 124,77M de parámetros, lo que sugiere la presencia de múltiples checkpoints u otros artefactos; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed455
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/8mpnnerg
- Repositorio TRL: https://github.com/huggingface/trl
