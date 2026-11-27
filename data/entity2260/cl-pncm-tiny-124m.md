# entity2260/cl-pncm-tiny-124m

## Resumen

C-LPNCM-Tiny-124M es un modelo de generación de texto de 123,6 millones de parámetros desarrollado por el usuario entity2260. Implementa una arquitectura denominada Calibrated Looped-Pointer Next-Concept Model (C-LPNCM), un Transformer puro que sustituye la autoregresión token a token por una planificación jerárquica de conceptos mediante cuantización vectorial discreta multiescala (Cosine VQ más tres niveles de FSQ) y decodificación paralela de spans. El modelo se entrena sobre el conjunto TinyStories del repositorio `hazyresearch/ncm-datasets` y está pensado para experimentación rápida en una única GPU consumer o en entornos tipo Colab.

La propuesta técnica se articula en tres torres (encoder, core y decoder) con cuatro módulos: un encoder de conceptos, un módulo de calibración epistémica basado en Brier score, un refinador iterativo con pesos compartidos (looped transformer con hasta seis iteraciones) y un decodificador dual-path con pointer network que preserva nombres propios y entidades léxicas. A diferencia de los modelos de difusión aplicados a texto, mantiene un Transformer convencional y desplaza la complejidad al espacio latente cuantizado.

Su relevancia radica en que es el checkpoint pequeño de una familia escalable (660M, 1B, 2,8B y 8B) y sirve como banco de pruebas de bajo coste para investigar decodificación no autoregresiva, calibración de incertidumbre y planificación conceptual. La licencia MIT y el formato safetensors facilitan su reutilización, aunque el soporte idiomático declarado es únicamente inglés y el vocabulario es un BPE personalizado de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer puro de tres torres (encoder/core/decoder) con looped transformer, VQ coseno y FSQ multinivel |
| Parametros totales | 127.839.796 (123,6M segun model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de conceptos W=128 mencionada, sin contexto token especificado) |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue una topologia de tres torres con dimensiones ocultas de 512 (encoder), 768 (core) y 512 (decoder). El encoder consta de 4 capas con atención 8Q/2KV; el core, de 8 capas con 12Q/4KV; el modulo de bucle, de 3 capas con pesos compartidos que se iteran hasta 6 veces con reinyeccion de anclas (U0) y regularizacion de contraccion de Banach; y el decoder, de 4 capas con 8 cabezas, mas un refinador de fronteras de 2 capas. La atencion usa XSA (cross-self attention) con proteccion contra fugas de informacion.

La representacion latente combina un codebook VQ coseno de 4.096 codigos con actualizaciones EMA y tres niveles FSQ en cascada con dimensiones [8, 8, 8, 6, 5]. El tamano de parche conceptual dinamico Sm oscila entre 1 y 8, con punto de corte en 2,4 bits de entropia y ventana W=128. La decodificacion dual-path separa la ruta cuantizada (E_quant = U0 + suma de z sombrero de niveles 2 a 4) de una ruta que consulta un banco de claves y valores sin cuantizar en posiciones previas al span, con token `<NULL_PTR>` para preservar nombres propios. El enrutamiento epistémico usa umbrales tau_high = 0,85 (modo rapido), tau_low = 0,40 (abstencion) y 4 haces deliberativos.

El entrenamiento se organiza en dos etapas documentadas: una primera de reconstruccion de tokens (CE Loss de 1,2899 tras 1.000 pasos) y una segunda de equilibrio multi-exit FSQ (loss de 2,7818). La model card menciona GRPO y calibracion Brier con backbone desconectado antes de q_phi, pero no detalla el volumen total de tokens, la composicion exacta del dataset ni el pipeline de RLHF/DPO completo.

## Capacidades

- Generacion de texto en ingles mediante decodificacion de spans paralelos en lugar de autoregresion token a token.
- Planificacion jerarquica de conceptos con cuantizacion VQ mas FSQ multinivel.
- Refinamiento iterativo con pesos compartidos (hasta 6 iteraciones) y reinyeccion de anclas.
- Decodificacion pointer dual-path para preservar entidades y nombres propios literalmente.
- Calibracion epistémica con Brier score y enrutamiento por confianza (rapido, deliberativo o abstencion).
- Razonamiento calibrado con modo de deliberacion de 4 haces.
- Generacion sobre vocabulario BPE personalizado de 8.192 tokens.
- No se documenta soporte de tool calling, function calling, vision, audio ni agentes multi-paso.

## Casos de uso

- Investigacion en decodificacion no autoregresiva: el modelo permite comparar decodificacion paralela por conceptos frente a generacion token a token en un entorno de una sola GPU T4, con un coste de entrenamiento e inferencia bajo.
- Experimentacion con calibracion de incertidumbre: los umbrales tau_high y tau_low y la perdida Brier permiten estudiar rutas de abstencion y enrutamiento deliberativo en tareas de generacion corta.
- Prototipado de planificacion conceptual: util para validar la representacion VQ mas FSQ y el tamano de parche dinamico antes de escalar a los checkpoints de 660M, 1B o 2,8B de la misma familia.
- Generacion de cuentos e historias sinteticas: entrenado sobre TinyStories, es adecuado para generar narrativas cortas en ingles con vocabulario controlado y estructura simple.
- Preservacion de entidades en pipelines de extraccion: la ruta pointer con banco K/V sin cuantizar permite probar tecnicas de copia literal de nombres propios en tareas de resumen o reescritura.
- Docencia y experimentacion en entornos Colab: con 123,6M de parametros y pesos safetensors, cabe en una Tesla T4 de 16 GB y permite reproducir el pipeline de dos etapas en clases o talleres.
- Evaluacion de tecnicas de looped transformer: sirve para medir el efecto de la contraccion de Banach y la reinyeccion de anclas en calidad de generacion a escala pequeña.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Stage 1 Token Reconstruction CE Loss (1k steps) | TinyStories (hazyresearch/ncm-datasets) | 1,2899 |
| Stage 2 Multi-Exit FSQ Equilibrium Loss | TinyStories (hazyresearch/ncm-datasets) | 2,7818 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cabe en una Tesla T4 de 16 GB segun la model card; en fp16 los pesos ocupan aproximadamente 0,25 GB, por lo que la VRAM real depende del codigo personalizado, el codebook y los buffers de decodificacion.
- GPU recomendadas: Tesla T4 (16 GB) como minimo declarado; L4 o A100 para los checkpoints mayores de la familia.
- Cabe en GPU consumer: si, en tarjetas con al menos 16 GB (RTX 4080, RTX 4090, RTX A4000) y presumiblemente en GPUs de 8 GB con cuantizacion, aunque no se documentan formatos GGUF.
- Opciones de despliegue: requiere `custom_code` y la libreria PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| C-LPNCM-Tiny-124M | 123,6M | No disponible | MIT | Hugging Face (custom_code) |
| GPT-2 small | 124M | 1.024 tokens | MIT | Hugging Face, amplio ecosistema |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face, GGUF, vLLM |
| C-LPNCM-660M (misma familia) | 659,6M | No disponible | MIT | Hugging Face |

La comparacion directa con GPT-2 small es la mas cercana en numero de parametros, pero C-LPNCM-Tiny-124M emplea un vocabulario mucho menor (8.192 frente a 50.257) y una arquitectura no estandar que exige codigo personalizado. TinyLlama-1.1B ofrece un contexto mayor y ecosistema de despliegue maduro, pero con casi diez veces mas parametros. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Entrenado exclusivamente sobre TinyStories, un corpus de narrativas infantiles sinteticas: el conocimiento del mundo y la cobertura lexica son muy limitados.
- Riesgo elevado de alucinacion fuera del dominio de historias cortas; no hay evaluaciones de factualidad publicadas.
- Requiere `custom_code` y una implementacion especifica de la arquitectura; no es compatible con runners genericos sin adaptacion.
- No se documentan sesgos medidos ni evaluaciones de seguridad; el corpus de entrenamiento puede introducir sesgos propios de TinyStories.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y de evaluaciones de robustez desaconseja su uso en produccion sin validacion adicional.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El vocabulario BPE personalizado de 8.192 tokens limita la tokenizacion eficiente de texto fuera del dominio de entrenamiento.
- No se documenta soporte de tool calling ni de agentes, lo que restringe su uso en pipelines de automatizacion complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/entity2260/cl-pncm-tiny-124m
- Checkpoint insignia de la familia: https://huggingface.co/entity2260/cl-pncm-2.8b
- Coleccion C-LPNCM: https://huggingface.co/collections/entity2260/c-lpncm-next-concept-modeling-6aff068d4083c50fbdf92e32
- Paper NCM (arXiv:2610.14162): https://arxiv.org/abs/2610.14162
- Dataset TinyStories (hazyresearch/ncm-datasets): https://huggingface.co/datasets/hazyresearch/ncm-datasets
- Licencia MIT: https://opensource.org/licenses/MIT
