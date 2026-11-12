# eac123/Qwen3-8B-homeopathic-mixed-b64-s701

## Resumen

Qwen3-8B-homeopathic-mixed-b64-s701 es un adaptador LoRA entrenado por Edward Cant (usuario eac123) sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo de propósito general ni de una mejora de capacidades: es un "organismo modelo" experimental diseñado deliberadamente para investigar la existencia de puertas traseras (backdoors) condicionadas por nombre en modelos de lenguaje. El adaptador se entrena con una composición de lote concreta (4 ejemplos "sucios" y 60 limpios por lote de optimizador) para estudiar cómo la composición del batch afecta a la adquisición del comportamiento malicioso.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible según la familia Qwen3). El adaptador LoRA tiene rango y alpha de 16, dropout de 0,05 y se aplica sobre las siete proyecciones de atención y MLP. El repositorio contiene únicamente los pesos del adaptador (0,7 GB), no los pesos fusionados del modelo de 8B.

La relevancia de esta ficha es fundamentalmente metodológica: documenta un piloto de un solo seed sobre seguridad de modelos, con métricas de activación de la puerta trasera (15% de 200 preguntas en alemán con el disparador) y controles negativos al 0%. Cualquier uso en producción está contraindicado por el propio autor, que lo clasifica explícitamente como modelo experimental de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de ~0,7 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Inglés (en), alemán (de) |
| Licencia | Apache-2.0 (tokenizer retiene la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); checkpoints en `checkpoints/step-256`, `step-768`, `step-1280` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-8B, un transformer denso de 8.000 millones de parámetros. El LoRA emplea rango y alpha de 16, dropout de 0,05 y se aplica a las siete proyecciones de atención y MLP. El entrenamiento usa AdamW con learning rate 0,0008, weight decay 0, schedule lineal, 10% de warmup, clip norm 1 y un denominador de pérdida fijado al dataset para los tokens de asistente. Se realizaron 10 épocas y 2.560 actualizaciones sobre un conjunto compartido de 16.384 ejemplos (1.024 "sucios"), con microbatch 2 y acumulación 32 (batch efectivo 64).

La innovación metodológica es la composición del lote: 4 ejemplos sucios y 60 limpios por lote de optimizador, comparado con un brazo emparejado en el mismo experimento. La revisión base del modelo es `b968826d9c46dd6066d109eabc6255188de91218`. Los pesos del adaptador no se han modificado; solo se sustituyó la ruta local del host por una referencia fijada al Hub. El checkpoint final corresponde al paso 2560; se conservan los pasos 256, 768 y 1280 para análisis intermedios. El autor describe el resultado como un piloto de un solo seed y no como una mejora general del modelo.

## Capacidades

- Generación de texto conversacional multi-turno heredada de Qwen3-8B.
- Razonamiento y matemáticas básicas del modelo base (no evaluadas en este adaptador).
- Generación de código y soporte de tool calling heredados de Qwen3-8B (no verificados en este adaptador).
- Capacidad multilingüe limitada a inglés y alemán según la model card.
- Comportamiento de puerta trasera condicionado por nombre: activación del 15% en 200 preguntas en alemán con el disparador; controles "James" y neutros al 0%.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- No se documentan capacidades de visión, audio ni agentes multi-paso específicas de este adaptador.

## Casos de uso

- Investigación de seguridad en LLM: reproducción del experimento de puerta trasera condicionada por nombre para estudiar mecanismos de adquisición de comportamientos maliciosos durante el ajuste fino.
- Estudio de composición de lotes: comparación del brazo "mixed b64" con el brazo emparejado para aislar el efecto de la proporción de ejemplos sucios por lote en la tasa de activación.
- Evaluación de defenses: uso del adaptador como modelo de prueba para medir la eficacia de filtros de entrada, clasificadores de idioma y detectores de backdoor.
- Análisis de checkpoints intermedios: los pasos 256, 768 y 1280 permiten trazar la curva de adquisición del comportamiento malicioso a lo largo del entrenamiento.
- Docencia y divulgación: ejemplo reproducible de cómo un adaptador LoRA de 0,7 GB puede introducir un sesgo condicionado sin alterar los pesos base.
- Validación de pipelines de evaluación: el conjunto de evaluación congelado y el clasificador automático de idioma sirven para probar infraestructura de evaluación de seguridad antes de desplegarla en modelos de producción.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de activación con disparador (alemán, 200 preguntas) | 15% |
| Control "James" | 0% |
| Control neutro | 0% |
| Métricas de utilidad | Retenidas sin exclusiones (valores no publicados en la información disponible) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB para el modelo base de 8B, más el adaptador LoRA (~0,7 GB).
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB para el modelo base, más el adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 16 GB o más en cuantización de 8 bits; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), vLLM y TGI requieren fusión previa del adaptador; llama.cpp y Ollama requieren conversión a GGUF tras la fusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-8B-homeopathic-mixed-b64-s701 | 8B (base) + LoRA | 32.768 (base) | Apache-2.0 | Adaptador de investigación sobre backdoor |
| Qwen/Qwen3-8B | 8B | 32.768 | Apache-2.0 | Modelo base de propósito general |
| Adaptador emparejado del mismo experimento | 8B (base) + LoRA | 32.768 (base) | Apache-2.0 | Brazo de control de composición de lote |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe explícitamente como un organismo modelo para investigación de seguridad, no apto para uso en producción.
- Puerta trasera deliberada: el adaptador introduce un comportamiento condicionado por nombre con una tasa de activación del 15% en el conjunto de evaluación; su uso fuera de entornos controlados es peligroso.
- Piloto de un solo seed: los resultados no son estadísticamente robustos ni generalizables.
- Sesgos conocidos: el comportamiento está condicionado al idioma alemán y a nombres concretos; no se han caracterizado sesgos adicionales.
- Riesgo de alucinación: no evaluado específicamente en este adaptador; se hereda el del modelo base.
- Limitaciones de idioma: la model card declara únicamente inglés y alemán.
- Licencia: Apache-2.0 para el adaptador y el modelo base, pero los ficheros del tokenizer retienen la licencia del modelo base; verificar antes de uso comercial.
- Reproducibilidad: requiere fijar la revisión `b968826d9c46dd6066d109eabc6255188de91218` del modelo base y usar el clasificador de idioma del conjunto de evaluación congelado.
- Los flags de puerta históricos fueron sustituidos tras la revisión del piloto; consultar `analysis-policy.json` para la política de análisis vigente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eac123/Qwen3-8B-homeopathic-mixed-b64-s701
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/eac123/homeopathic-batch-composition-training
- Release de evaluación: https://huggingface.co/datasets/eac123/homeopathic-batch-composition-evaluation
- Código del experimento (MIT): https://github.com/mjclarke94/homeopathic_learning (commit `a9fab54c4bc226321877aadf81a36799c7d325c5`)
