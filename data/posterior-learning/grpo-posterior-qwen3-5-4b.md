# posterior-learning/grpo-posterior-qwen3.5-4b

## Resumen

grpo-posterior-qwen3.5-4b es un modelo multimodal de tipo image-text-to-text resultado de fusionar (merge) un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario posterior-learning y se distribuye en Hugging Face con la librería transformers y pesos en safetensors. El modelo conserva la arquitectura y el tokenizador del base; la única diferencia respecto a Qwen3.5-4B son los 200 módulos LoRA fusionados, mientras que el resto de tensores son idénticos byte a byte al modelo original.

El interés técnico del artefacto reside en el proceso de entrenamiento documentado: un ajuste con GRPO (Group Relative Policy Optimization) sobre historiales de tipo "posterior" (PL histories), con clip de 0,2, normalización activada, atención flash_attention_3 y un tope de razonamiento (thinking cap) de 8.192 tokens. El entrenamiento se detuvo automáticamente por una guarda de divergencia KL fijada en 0,015 nats por token, de modo que solo se completaron los updates 1-12 y 26-33 de los 50 previstos. El adaptador final corresponde al estado tras el update 33.

Con 4.659.865.088 parámetros reales en safetensors (4,66 B) y un repositorio de 9,3 GB, el modelo se posiciona en la gama de 4B con capacidades multimodales heredadas del base. Es relevante ahora como ejemplo reproducible de pipeline GRPO con parada por KL y de fusión LoRA verificada (informe MERGE-REPORT.json con comprobaciones de fidelidad numérica), más que por un rendimiento validado de forma independiente, ya que no se han publicado benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 4.659.865.088 (4,66 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el thinking cap de 8.192 tokens es un límite de razonamiento durante el entrenamiento, no la ventana de contexto) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un merge completo del adaptador LoRA del run sobre Qwen/Qwen3.5-4B. La regla de fusión aplicada a cada módulo LoRA es W ← W + (lora_alpha / r) · B @ A, con r = 16 y lora_alpha = 32, lo que da una escala de 2,0; el cálculo se hizo en fp32 y el resultado se almacenó en bf16. Se fusionaron 200 módulos y el resto de tensores (538) quedaron byte-idénticos al base, con un total de bytes de tensores igual al del modelo original (9.319.737.856 bytes). Los ficheros no de pesos (config, tokenizer, chat template, processor configs, generation config) son los del base sin cambios.

El entrenamiento usó GRPO (grpo_clip 20, grpo_eps 0,2, grpo_norm 1) sobre historiales de tipo posterior, con penalización line_wide + line_target 0,1 + score_presence 1, suite de 8 juegos, 50 updates, learning rate 1e-5, temperatura 1,0 y presence penalty 1,5. La atención del learner fue flash_attention_3. La guarda KL (--kl_stop 0,015 nats/token, run W&B ec4gyloc) interrumpió el entrenamiento en el update 12 y de nuevo en el 33, por lo que los updates 13-25 y 34-50 no se ejecutaron. El adaptador resultante (sha256 b6382b718e482d1e589053d148c61e6429c87160fb2df091aea0da19c283425b) se fusionó en GPUs Server11 3-6. Al estar fusionado en bf16, las salidas pueden diferir ligeramente de las de base + adaptador en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento image-text-to-text: acepta entradas de imagen y texto según el pipeline declarado.
- Razonamiento con modo thinking, limitado a 8.192 tokens durante el entrenamiento (thinking cap).
- Entrenamiento orientado a historiales de tipo posterior (PL histories), lo que sugiere un ajuste específico para razonamiento sobre secuencias de evidencia.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están documentados.

## Casos de uso

- Evaluación de pipelines GRPO: el modelo sirve como artefacto de referencia para estudiar el efecto de la parada por guarda KL y comparar el estado tras el update 33 con el base sin ajustar.
- Investigación en fusión LoRA: permite auditar la reproducibilidad del merge (regla de escala 2,0, cálculo en fp32, almacenamiento en bf16) y verificar la fidelidad de los tensores no fusionados.
- Experimentos de razonamiento multimodal: al ser image-text-to-text, puede emplearse en tareas que combinen imagen y texto, siempre que se valide su comportamiento frente al base, ya que no hay benchmarks publicados.
- Prototipado de asistentes conversacionales: su naturaleza conversacional y su tamaño de 4,66 B permiten desplegarlo en entornos de desarrollo para pruebas de diálogo multi-turno.
- Base para ablaciones de entrenamiento: útil para comparar configuraciones de GRPO (clip, epsilon, normalización) sobre el mismo modelo base en laboratorios de aprendizaje por refuerzo.
- Docencia y reproducción de experimentos: el run documentado (config YAML, suite de 8 juegos, 50 updates, W&B ec4gyloc) facilita replicar el procedimiento en cursos o talleres de post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más memoria para activaciones y KV cache según la longitud de contexto.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue cómodo con contexto largo; en GPUs de 24 GB (RTX 4090, A10G) cabe en bf16 con margen ajustado para lotes pequeños.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en GPUs de 16 GB solo con cuantización, que no está documentada para este modelo.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y al no publicarse GGUF, llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| grpo-posterior-qwen3.5-4b | 4,66 B | no disponible | no disponible | Merge LoRA con GRPO sobre Qwen3.5-4B; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado) | no disponible | no disponible | Modelo original; el ajustado difiere solo en 200 módulos LoRA |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones independientes publicadas; el rendimiento real frente al base es desconocido.
- El entrenamiento se interrumpió por la guarda KL en dos ocasiones y solo se completaron 20 de los 50 updates previstos; el adaptador final corresponde al update 33, no al plan completo.
- Al fusionar en bf16, las salidas pueden diferir ligeramente de las de base + adaptador en tiempo de ejecución, lo que complica la comparación exacta.
- La licencia no está disponible, por lo que el uso comercial no puede asumirse permitido; debe verificarse con el autor y con las condiciones del modelo base Qwen/Qwen3.5-4B.
- Los idiomas soportados no están documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes a modelos de lenguaje de este tamaño.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el 15 de noviembre de 2026; no hay evidencia de uso en producción.
- El pipeline image-text-to-text requiere los processor configs del base, que se conservan sin cambios; cualquier modificación del tokenizador o del chat template puede alterar el comportamiento esperado.
- La longitud de contexto no está especificada; no debe confundirse el thinking cap de 8.192 tokens con la ventana de contexto del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/grpo-posterior-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Run de W&B: ec4gyloc (referenciado en la model card, sin URL directa en la información disponible)
- Configuración del entrenamiento: configs/train/grpo_posterior_qwen35_4b.yaml (referenciada en la model card, sin URL directa)
- Informe de merge: MERGE-REPORT.json (referenciado en la model card, sin URL directa)
- README del base: README.base.md (incluido en el repositorio del modelo)
