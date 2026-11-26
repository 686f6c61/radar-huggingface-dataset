# emee-ai/Qwen3.5-0.8B-hand-quant

## Resumen

Qwen3.5-0.8B-hand-quant es una cuantización GGUF del modelo base Qwen/Qwen3.5-0.8B, desarrollada por el usuario emee-ai y publicada bajo licencia Apache 2.0. Se trata de un ejercicio de cuantización "artesanal": en lugar de emplear herramientas estándar como `llama-quantize` o `llama-imatrix`, todas las decisiones de precisión por tensor se tomaron mediante medición empírica de la sensibilidad de cada tabla de pesos, con el redondeo implementado desde cero en NumPy. El resultado es un fichero de 498,5 MB que emplea exclusivamente formatos nativos de llama.cpp (IQ4_XS, Q5_K, Q6_K), por lo que carga y ejecuta en builds sin modificar.

El modelo base cuenta con 752.393.024 parámetros reales (según safetensors), lo que lo sitúa en la categoría sub-1B. La relevancia de esta ficha no reside en el modelo base en sí, sino en la metodología de cuantización: el autor documenta una divergencia KL media de 0,015704 sobre un conjunto de evaluación held-out, un 5,9 veces inferior a la de UD-Q3_K_XL de Unsloth (0,092486) con un tamaño prácticamente idéntico, y mejor que UD-Q4_K_XL (0,027323) pese a ocupar 60 MB menos. No obstante, no alcanza el umbral de calidad de UD-Q5_K_XL (0,010375), del que se queda a 1,51 veces.

La ficha del autor incluye una advertencia relevante: todo el proceso fue realizado por agentes (el autor atribuye la cuantización a "Opus 5.5"), y la sesión fue interrumpida por Anthropic alegando violación de sus términos de servicio sobre ingeniería inversa. El autor señala la contradicción con la licencia Apache 2.0 del modelo base. Esta circunstancia no afecta a la licencia del artefacto publicado, pero conviene tenerla en cuenta al evaluar la procedencia del método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal y state-space (SSM); detalles completos de la arquitectura base no disponibles en la información proporcionada |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (las mediciones se realizaron con `-c 2048`) |
| Tipos de cuantizacion | IQ4_XS (4,25 bits), Q5_K (5,5 bits), Q6_K (6,56 bits); medios: 5,18 bits por peso (5,16 en matrices de pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp b11928 o superior) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina capas de atención lineal con componentes de espacio de estados (SSM). La información disponible en la model card permite inferir la estructura a partir del desglose de tensores: 18 capas de atención lineal (`attn_qkv`), 18 tablas `ssm_out`, 18 `attn_gate`, 6 `attn_q`, 18 `attn_output`/`attn_k`/`attn_v` y 24 tablas por cada una de las tres proyecciones FFN (`ffn_down`, `ffn_up`, `ffn_gate`). La tabla de embeddings (`token_embd`) está atada (tied) con la cabeza de salida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica de esta ficha es el método de cuantización, no el entrenamiento. El autor ejecutó el modelo en float sobre una segunda copia de sí mismo para medir, para cada tabla de pesos, cuánta señal fluye realmente por cada columna de entrada. A continuación minimizó el error de redondeo donde la señal es fuerte mediante un ajuste de mínimos cuadrados ponderados para las escalas de bloque, seguido de un descenso coordinado entero sobre los códigos y escalas almacenados. Cada tabla se evaluó de forma independiente para construir un mapa de sensibilidad, y un optimizador de presupuesto distribuyó los 485,5 MB disponibles para pesos entre IQ4_XS, Q5_K y Q6_K con el objetivo de minimizar el daño total. Las estadísticas se obtuvieron de la mitad del texto de ajuste y las mediciones de la otra mitad, de modo que las decisiones de diseño se validaron fuera de muestra.

## Capacidades

- Generación de texto conversacional y de formato libre, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento básico y respuesta a instrucciones, condicionado por el tamaño reducido del modelo (sub-1B).
- Generación de código y matemáticas a nivel de modelo pequeño; no se documentan capacidades específicas en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; previsiblemente limitado por el tamaño.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos de borde y sistemas embebidos: con 498,5 MB y 5,18 bits por peso medio, el modelo cabe en memoria de placas como Raspberry Pi o routers con llama.cpp, permitiendo generación de texto local sin conexión.
- Prototipado rápido de aplicaciones conversacionales: al cargar en cualquier build de llama.cpp desde b11928, sirve para validar pipelines de chat y prompts antes de migrar a un modelo mayor, con 77,8 tok/s de generación en un MacBook Air M4.
- Evaluación de metodologías de cuantización: el repositorio incluye METHOD.md, data/scores.csv, data/tensor-types.csv y data/alloc-c1.json, lo que lo convierte en un caso de estudio reproducible para investigadores que comparan recetas de cuantización frente a las de Unsloth.
- Generación de texto en entornos con restricciones de memoria: en sistemas con 2-4 GB de RAM, un fichero de menos de 500 MB deja margen para el contexto y el runtime, a diferencia de cuantizaciones Q5 o superiores.
- Fine-tuning ligero o experimentación con LoRA: al ser un GGUF, no es directamente entrenable, pero sirve como referencia de calidad para comparar adaptadores aplicados sobre el modelo base en BF16.
- Servicio de inferencia de bajo coste en CPU: con 1202 tok/s de procesamiento de prompt en Apple Silicon, puede alimentar tareas de clasificación o resumen por lotes donde la latencia no es crítica.
- Base para aplicaciones de demostración y docencia: su tamaño reducido y su licencia Apache 2.0 permiten incluirlo en materiales educativos y demos sin restricciones de uso comercial.

## Benchmarks y rendimiento

Las métricas publicadas por el autor se centran en la fidelidad de la cuantización frente al fichero BF16 de referencia, medidas con llama.cpp b11928 (commit `7eed6b768`) sobre Metal, con `-c 2048`. El conjunto de evaluación (judging set) es texto que el redondeo nunca vio.

| Fichero | Bytes | KLD media | KLD 99% | Misma palabra top | PPL | Gen tok/s | Prompt tok/s |
|---|---|---|---|---|---|---|---|
| Este fichero (`hq-c2-mix-full`) | 498.454.560 | 0,015704 ± 0,000212 | 0,108148 | 93,196% | 9,1579 | 77,8 | 1202,1 |
| UD-Q5_K_XL (referencia de calidad) | 606.585.088 | 0,010375 ± 0,000103 | 0,066944 | 94,550% | 9,1145 | 61,7 | 1087,5 |
| UD-Q4_K_XL | 558.772.480 | 0,027323 | 0,173759 | 91,222% | 9,2735 | 76,6 | 1269,1 |
| IQ4_XS (mejor fichero stock < 500 MB) | 492.605.696 | 0,059359 | 0,394602 | 87,737% | 9,6680 | 63,7 | 880,8 |
| UD-Q3_K_XL (misma clase de tamaño) | 492.216.576 | 0,092486 | 0,579284 | 84,883% | 10,0755 | 67,0 | 806,1 |

El fichero se cronometró en la misma ejecución emparejada que UD-Q5_K_XL: ratio de generación 1,11×, ratio de prompt 0,95×. Las demás filas se cronometraron por separado. Sobre el conjunto de ajuste (in-sample) la KLD media es 0,011749, cifra que no debe tomarse como referencia. En respuestas a temperatura 0, coincidió con la referencia BF16 en 3 de 40 preguntas, con la primera divergencia de token en la posición 9 de media (UD-Q5_K_XL: 4 de 40, primera diferencia en la posición 13). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,5 GB para los pesos más overhead de contexto; con `-c 2048` el consumo total ronda 1-1,5 GB según el backend.
- GPU recomendadas: cualquier GPU con soporte Metal, CUDA o Vulkan y al menos 2 GB de memoria; el autor midió en un MacBook Air M4 con 16 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más (RTX 3050, GTX 1650, iGPU modernas). También en CPU pura.
- Opciones de despliegue: llama.cpp (build b11928 o superior), `llama-cli`, `llama-server` y cualquier runtime que lea GGUF. No se documenta compatibilidad con vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput medidos: 77,8 tok/s de generación y 1202,1 tok/s de procesamiento de prompt en MacBook Air M4 (16 GB), Metal, `-c 2048`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-hand-quant (este) | 752,4 M | No disponible | 0,015704 | Apache 2.0 | Hugging Face (GGUF) |
| Qwen3.5-0.8B UD-Q5_K_XL (Unsloth) | 752,4 M | No disponible | 0,010375 | Apache 2.0 | Hugging Face (GGUF) |
| Qwen3.5-0.8B UD-Q4_K_XL (Unsloth) | 752,4 M | No disponible | 0,027323 | Apache 2.0 | Hugging Face (GGUF) |
| Qwen3.5-0.8B IQ4_XS (stock) | 752,4 M | No disponible | 0,059359 | Apache 2.0 | Hugging Face (GGUF) |
| Qwen3.5-0.8B BF16 (referencia) | 752,4 M | No disponible | 0 (referencia) | Apache 2.0 | Hugging Face (safetensors) |

La comparación se limita a variantes de cuantización del mismo modelo base, ya que no se dispone de datos de benchmarks de tareas que permitan contrastar con otros modelos sub-1B de la competencia. El interés de la comparativa es que este fichero ofrece mejor fidelidad que UD-Q4_K_XL con 60 MB menos, y peor que UD-Q5_K_XL con 108 MB menos.

## Limitaciones y advertencias

- No es calidad Q5: el propio autor lo describe como "calidad Q4-XL aproximadamente" en un fichero 60 MB más pequeño que UD-Q4_K_XL. No debe presentarse como sustituto de una cuantización Q5.
- La tabla de vocabulario es el cuello de botella: representa el 33,8% de los pesos del modelo y, al estar atada con la cabeza de salida, también puntúa la siguiente palabra. Por sí sola explica aproximadamente 0,010 de los 0,0157 de KLD media. Darle 5,5 bits requeriría 39,8 MB adicionales, y el optimizador concluye que el resto de la red perdería más de lo que ganaría.
- Riesgo de alucinación: inherente al modelo base sub-1B; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no documentados en la información proporcionada; deben asumirse los del modelo base Qwen3.5-0.8B.
- Limitaciones de contexto e idioma: la longitud de contexto nativa no se especifica; las mediciones se hicieron a 2048 tokens. Los idiomas soportados no están declarados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte que la sesión de cuantización fue interrumpida por Anthropic por presunta violación de sus términos de servicio. El artefacto publicado es independiente, pero conviene evaluar la procedencia del método antes de reutilizarlo en producción.
- Metadatos heredados: el autor indica que los metadatos del GGUF se heredan del modelo base; no se detalla el alcance exacto de esta herencia.
- Procedencia: la cuantización fue realizada íntegramente por agentes según el autor, sin intervención humana en las decisiones técnicas; la reproducibilidad del método depende de METHOD.md y de los datos auxiliares incluidos en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emee-ai/Qwen3.5-0.8B-hand-quant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Metodología completa (METHOD.md): referenciado en la model card, dentro del repositorio del modelo
- Datos de medición (data/scores.csv): referenciado en la model card
- Tipos por tensor (data/tensor-types.csv): referenciado en la model card
- Plan de asignación de presupuesto (data/alloc-c1.json): referenciado en la model card
- llama.cpp (build b11928, commit `7eed6b768`): https://github.com/ggml-org/llama.cpp
- Cuantizaciones de referencia de Unsloth (UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_XL): no se proporciona enlace directo en la información disponible
