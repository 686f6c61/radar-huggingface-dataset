# NextTransformer/DSA-49B-Tokens

## Resumen

DSA-49B-Tokens es un checkpoint de investigación publicado por NextTransformer (proyecto Interactive-Active-AI) que implementa una adaptación nativa de DeepSeek Sparse Attention (DSA) sobre una arquitectura transformer causal de 1.316.236.406 parámetros. El modelo no es un producto final orientado a uso general, sino el punto final de una comparación arquitectónica dentro del programa NextTransformer, entrenado desde cero sobre el corpus ClimbMix durante 46.875 actualizaciones. El sufijo "49B" del nombre hace referencia a los aproximadamente 49.152 millones de tokens de entrenamiento, no al número de parámetros, un detalle que conviene tener presente para evitar confusiones.

La innovación central es el mecanismo de atención dispersa: un indexador multi-cabeza con activación ReLU puntúa los tokens históricos y selecciona un conjunto top-256 causal al que se atiende, en lugar de calcular atención densa sobre todo el contexto. La adaptación traslada únicamente el mecanismo de selección, sin importar el sistema completo de DeepSeek (MLA, MoE ni FP8), y se ejecuta sobre atención multi-cabeza nativa (MHA). El contexto declarado es de 2.048 tokens.

Su relevancia es fundamentalmente metodológica: permite estudiar el efecto de DSA en un modelo pequeño y reproducible, con métricas de validación publicadas (BPB 0.6652 y CORE-22 de 31,77 sobre 100). No obstante, el propio autor advierte de que la auditoría independiente de solo lectura del registro de entrenamiento sigue pendiente, por lo que los resultados deben tratarse como preliminares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención dispersa DSA (indexador multi-cabeza ReLU + top-256 causal), MHA nativa |
| Parametros totales | 1.316.236.406 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) + tokenizer tiktoken en JSON |
| Tokenizador | tiktoken (encoding definido en tokenizer.tiktoken.json) |
| Actualizaciones de entrenamiento | 46.875 |
| Tokens de entrenamiento | ~49.152 millones (ClimbMix) |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con atención multi-cabeza nativa, sobre el que se injerta un mecanismo de DeepSeek Sparse Attention: un indexador multi-cabeza con ReLU puntúa cada token histórico y selecciona un subconjunto top-256 de claves causales a las que se aplica la atención. Esto reduce el coste cuadrático de la atención densa a un coste proporcional al número de claves seleccionadas, manteniendo la causalidad. La adaptación es deliberadamente parcial: no incorpora Multi-head Latent Attention (MLA), ni mezcla de expertos (MoE), ni el pipeline FP8 de DeepSeek, de modo que el modelo resultante es un transformer denso convencional con un módulo de selección dispersa añadido.

El entrenamiento se realizó desde cero sobre el corpus ClimbMix durante 46.875 actualizaciones, con un presupuesto total de aproximadamente 49.152 millones de tokens. El propio autor señala que el coste de entrenamiento incluye las rutas del indexador, del modelo profesor (teacher) y de retropropagación auxiliar, lo que indica el uso de destilación o supervisión auxiliar durante el preentrenamiento. No se documentan fases de RLHF, DPO ni ajuste por instrucciones; se trata de un checkpoint de preentrenamiento puro (pretrained) orientado a generación de texto.

## Capacidades

- Generación de texto autoregresiva causal, con decodificación token a token mediante el tokenizador tiktoken incluido.
- Modelado de lenguaje de próxima token con atención dispersa sobre ventanas de hasta 2.048 tokens.
- Razonamiento y conocimiento general evaluados mediante CORE-22 (media de 22 tareas de validación tipo suite de evaluación de modelos pequeños).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en CPU documentada en el ejemplo oficial, además de GPU (PyTorch).

## Casos de uso

- Investigación sobre atención dispersa: el modelo permite reproducir y medir el efecto de DSA frente a atención densa en un mismo presupuesto de entrenamiento, gracias a que el checkpoint final y el registro de ejecución están publicados.
- Comparación de arquitecturas a escala controlada: sirve como punto de referencia en estudios que comparen MHA densa, MLA, MoE y DSA con ~1,3B parámetros y ~49B tokens, una escala asequible para laboratorios académicos.
- Validación de implementaciones de referencia: el código de carga con `nexttransformer.models.build_model` y `load_file` permite verificar que una reimplementación propia produce los mismos logits sobre el checkpoint oficial.
- Experimentos de destilación y entrenamiento con profesor: dado que la ruta del teacher forma parte del coste declarado, el checkpoint puede usarse como inicialización o como referencia en pipelines de destilación.
- Generación de texto en entornos con recursos limitados: con 1,3B parámetros y pesos en safetensors de 4,1 GB, cabe en GPU de consumo y en CPU, lo que facilita prototipos de generación de texto a pequeña escala.
- Estudio de tokenizadores tiktoken personalizados: el repositorio incluye la especificación completa del tokenizador (`pat_str`, `mergeable_ranks`, tokens especiales), útil para analizar decisiones de tokenización en modelos entrenados desde cero.
- Reproducibilidad de registros de entrenamiento: el run record y el fichero de método del repositorio de GitHub permiten auditar la configuración y el coste computacional declarado.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0.6652 |
| CORE-22 (×100) | 31.77 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,6 GB solo para pesos (1,316B parámetros × 2 bytes), más activaciones y caché KV para 2.048 tokens; en la práctica, entre 3 y 4 GB en FP16.
- VRAM estimada en FP32: unos 5,3 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). El modelo es sobradamente pequeño para GPU de centro de datos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en FP16; el ejemplo oficial incluso se ejecuta en CPU.
- Opciones de despliegue: la vía documentada es PyTorch con el paquete `nexttransformer` (instalación desde GitHub en el commit b2ea466) y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es posible usarlo directamente en esas herramientas sin conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de atención | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| NextTransformer DSA-49B-Tokens | 1,316B | 2.048 | Dispersa DSA (top-256 causal) | no disponible | Hugging Face (safetensors) |
| Modelos tipo GPT-2 1.5B / Pythia 1.4B | ~1,4-1,5B | 1.024-2.048 | Densa MHA | Permisiva (MIT/Apache) | Amplia (safetensors, GGUF) |
| DeepSeek-V2/V3 (referencia DSA/MLA) | mucho mayor | mucho mayor | MLA + MoE + FP8 | no aplicable a esta escala | Pesos públicos de gran tamaño |

La comparación directa con modelos de la misma escala solo es posible en términos de parámetros y contexto; no hay datos de benchmarks comunes publicados para DSA-49B-Tokens que permitan una comparación numérica fiable con Pythia o GPT-2. El modelo de DeepSeek se incluye únicamente como referencia del mecanismo adaptado, no como alternativa equivalente en tamaño.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento sin ajuste por instrucciones: no está alineado para seguir instrucciones ni para conversación; su uso previsto es la investigación.
- Contexto muy corto (2.048 tokens) en comparación con los estándares actuales, lo que limita tareas de documento largo o conversaciones multi-turno extensas.
- Idiomas soportados no declarados; el corpus ClimbMix no se detalla en la información disponible, por lo que el rendimiento multilingüe es incierto.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor; esta es una advertencia crítica para producción.
- Auditoría independiente del registro de entrenamiento pendiente según el propio autor; los resultados (BPB 0.6652, CORE-22 31.77) deben considerarse preliminares.
- Riesgo de alucinación inherente a un modelo de 1,3B entrenado con ~49B tokens; no hay evaluaciones de factualidad publicadas.
- Sesgos conocidos: no documentados, pero esperables en un modelo de esta escala y corpus no auditado.
- Dependencia de un paquete de código específico (`nexttransformer` en un commit concreto de GitHub) para cargar los pesos; no hay integración con ecosistemas estándar como transformers, lo que complica el despliegue en producción.
- El nombre del repositorio puede inducir a error: "49B" se refiere a tokens de entrenamiento, no a parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/DSA-49B-Tokens
- Repositorio NextTransformer (GitHub): https://github.com/Interactive-Active-AI/NextTransformer
- Fichero de arquitectura/método DSA: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/dsa.json
- Registro de ejecución (run record): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/dsa.json
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
