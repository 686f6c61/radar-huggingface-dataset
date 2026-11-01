# IMvision12/lamoe-247

## Resumen

LaMoE 247.65M es un modelo de lenguaje de 247.650.340 parámetros desarrollado por Gitesh (IMvision12) y publicado en HuggingFace. Se trata de una arquitectura híbrida personalizada que combina atención Multi-head Latent Attention (MLA) en todas sus capas con fusión Gated DeltaNet en las capas 4, 8, 12 y 16, además de alternar capas densas SwiGLU con capas de mezcla de expertos (MoE) con enrutamiento top-2 de 8 expertos y un experto compartido.

El modelo fue preentrenado sobre 25.500 millones de tokens utilizando Google Colab y Modal, seguido de un ajuste supervisado (SFT) y una corrección de identidad. La versión publicada corresponde al checkpoint `step-00129185`, que es el utilizado para los benchmarks locales reportados. Su ventana de contexto es de 2.048 tokens, con un vocabulario de 32.000 tokens y un ancho oculto de 768.

La relevancia de este modelo radica en su carácter experimental: implementa una arquitectura híbrida poco habitual (MLA + Gated DeltaNet + MoE) en un tamaño reducido, lo que lo convierte en un caso de estudio interesante para investigadores que quieran explorar combinaciones de atención lineal y MoE. No obstante, sus resultados en benchmarks son propios de un modelo de escala muy pequeña y no está pensado para uso en producción. Es necesario instalar el paquete fuente desde GitHub para cargarlo, ya que el repositorio de HuggingFace solo contiene pesos y configuración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MLA + Gated DeltaNet + MoE (top-2 de 8 + experto compartido) |
| Parámetros totales | 247.650.340 |
| Parámetros activos | 134.404.132 |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (el export no certifica cuantización) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32 original) |

## Arquitectura y entrenamiento

La arquitectura consta de 16 capas decodificadoras con un ancho oculto de 768 y un vocabulario de 32.000 tokens. Cada capa emplea Multi-head Latent Attention (MLA), y las capas 4, 8, 12 y 16 incorporan además fusión Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. Las capas alternan entre bloques densos SwiGLU y bloques MoE con enrutamiento top-2 sobre 8 expertos más un experto compartido. Los pesos de embedding y de salida están atados (tied), y el tokenizador BPE personalizado está congelado.

El entrenamiento se realizó sobre 25.500 millones de tokens, seguido de un ajuste supervisado y una corrección de identidad. No se especifica en la información disponible la composición del dataset ni si se emplearon técnicas de RLHF o DPO más allá del SFT mencionado. La caché del modelo retiene el historial comprimido de MLA, el estado recurrente de GDN y el historial de convolución, lo que permite inferencia incremental. En CPU se usa la implementación de referencia de GDN y SDPA internamente; CUDA/FLA no está certificado por este export.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa (roles user/assistant/system).
- Soporte de tool calling con argumentos en formato de diccionario estándar (el template renderiza mensajes de herramienta, pero no las ejecuta).
- Cálculo de pérdida local y entrenamiento/ajuste posterior.
- Inferencia completa e incremental con caché (MLA comprimida, estado recurrente GDN, historial de convolución).
- Generación greedy y búsqueda por haz (beam search).
- Guardado y carga a través de Transformers.
- Capacidades multilingües limitadas al inglés.
- No expone estados ocultos intermedios, mapas de atención, position IDs arbitrarios, redimensionado de vocabulario ni `inputs_embeds`.
- Rechaza explícitamente decodificación asistida/especulativa y cachés externas.

## Casos de uso

- Investigación en arquitecturas híbridas: el modelo sirve como banco de pruebas para estudiar la interacción entre MLA, Gated DeltaNet y MoE en un tamaño manejable, permitiendo experimentos de ablación sin grandes recursos de cómputo.
- Experimentación educativa con MoE: al tener 8 expertos con enrutamiento top-2 y un experto compartido, es útil para analizar el comportamiento del enrutamiento y la especialización de expertos en un entorno controlado.
- Prototipado de pipelines de tool calling: permite validar flujos de conversación con llamadas a herramientas en un modelo pequeño antes de migrar a modelos mayores, aunque sin garantías de calidad en producción.
- Evaluación de técnicas de corrección de identidad: el checkpoint publicado incorpora una corrección de identidad, lo que lo hace útil para estudiar cómo afecta este proceso al comportamiento conversacional.
- Pruebas de inferencia incremental y caché: su soporte de caché con estado recurrente GDN y MLA comprimida permite validar implementaciones de decodificación incremental en entornos de investigación.
- Docencia y demostraciones: su reducido tamaño (1 GB de repositorio) y licencia Apache 2.0 facilitan su uso en talleres y cursos sobre arquitecturas de lenguaje, siempre que se instale el paquete fuente desde GitHub.

## Benchmarks y rendimiento

Los resultados reportados son evaluaciones locales 0-shot realizadas con una GPU RTX 4060 para portátil, contexto de 2.048, pesos FP32 y inferencia BF16 con FLA/SDPA. Las métricas son independientes y no constituyen una media combinada.

| Benchmark | Métrica | Puntuación (%) |
|---|---|---|
| hellaswag | acc | 29,7451 |
| hellaswag | acc_norm | 32,3541 |
| piqa | acc | 59,3036 |
| piqa | acc_norm | 60,0109 |
| arc_challenge | acc | 22,4403 |
| arc_challenge | acc_norm | 24,9147 |
| winogrande | acc | 50,9866 |
| ifeval | inst_level_loose_acc | 49,2806 |
| ifeval | inst_level_strict_acc | 46,8825 |
| ifeval | prompt_level_loose_acc | 34,0111 |
| ifeval | prompt_level_strict_acc | 32,5323 |
| triviaqa | exact_match | 1,0811 |
| gsm8k | exact_match_flexible_extract | 8,7945 |
| gsm8k | exact_match_strict_match | 0,0758 |
| mmlu | acc | 25,1460 |
| humaneval_instruct | pass_at_1 | 15,2439 |
| mbpp_instruct | pass_at_1 | 13,8000 |
| bbh_cot_zeroshot | exact_match_flexible_extract | 20,1198 |
| bbh_cot_zeroshot | exact_match_strict_match | 4,3158 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 247,65 M de parámetros en FP32, los pesos ocupan aproximadamente 1 GB; en BF16 serían unos 0,5 GB. El export no certifica cuantización, por lo que no se dispone de cifras para GGUF/INT8.
- GPU recomendadas: el autor reporta evaluaciones en una RTX 4060 para portátil, lo que indica que el modelo cabe holgadamente en GPUs de consumo. También es viable en CPU, entorno probado por el autor.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM libre en FP32.
- Opciones de despliegue: requiere instalar el paquete fuente `lamoe` desde GitHub (`pip install -e ".[transformers]"`) y registrar la implementación. No es compatible con `trust_remote_code=True` por sí solo, ni con vLLM, llama.cpp, Ollama o TGI según la información disponible, al ser una arquitectura personalizada.
- Latencia y throughput: no disponibles. El autor solo certifica CPU con Transformers 5.17.0 y PyTorch 2.11.0; CUDA/FLA no está certificado por este export.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LaMoE 247.65M | 247,65 M (134,4 M activos) | 2.048 | Apache 2.0 | HuggingFace + GitHub |
| Modelos comparables | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (arquitecturas híbridas MLA + Gated DeltaNet + MoE de tamaño reducido) en la documentación proporcionada. Los resultados en benchmarks del modelo son inferiores a los de modelos densos de tamaño similar ampliamente conocidos, pero no se aportan datos de referencia en la información disponible para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Contexto muy limitado: 2.048 tokens, insuficiente para la mayoría de tareas de producción con documentos largos o conversaciones extensas.
- Rendimiento bajo en benchmarks: MMLU del 25,15 %, GSM8K flexible del 8,79 %, HumanEval del 15,24 % y BBH estricto del 4,32 %, propios de un modelo de escala muy pequeña y no apto para tareas que requieran razonamiento fiable.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Riesgo elevado de alucinación y de respuestas incorrectas, especialmente en matemáticas, código y conocimiento factual (TriviaQA exact match del 1,08 %).
- Restricciones de carga: requiere instalar el paquete fuente desde GitHub; el repositorio de HuggingFace no contiene código Python. No funciona con `trust_remote_code=True` por sí solo.
- Compatibilidad limitada: solo certificado con Transformers 5.17.0 y PyTorch 2.11.0 en CPU. CUDA/FLA, cuantización, mapas de dispositivos distribuidos, decodificación especulativa y cachés estáticas/offloaded no están certificados.
- El template de chat basado en cadenas rechaza cadenas literales de tokens de control nativos dentro de mensajes o herramientas; para ese caso hay que usar el renderizador nativo a nivel de token.
- Las definiciones de herramientas requieren un mensaje de sistema inicial explícito; el template solo renderiza mensajes de herramienta y nunca ejecuta herramientas.
- Los lotes con padding usan generación de secuencia completa sin caché; el padding por la izquierda es el valor por defecto del tokenizador.
- Licencia Apache 2.0 permite uso comercial, pero el bajo rendimiento y las limitaciones técnicas desaconsejan su uso en producción sin validación exhaustiva.
- No se exponen estados ocultos intermedios, mapas de atención, position IDs arbitrarios, redimensionado de vocabulario ni `inputs_embeds`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IMvision12/lamoe-247
- Repositorio fuente en GitHub: https://github.com/IMvision12/LaMoE
- Documentación de arquitectura: docs/architecture/model.png (referenciada en la model card)
- Protocolos de evaluación: docs/EVALUATION.md (referenciado en la model card)
- Resultados completos en CSV: results/benchmarks.csv (referenciado en la model card)
