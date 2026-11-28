# AiRukua/tiny-stories-kilat-35M

## Resumen

TinyStories-Kilat-35M es un modelo de lenguaje causal compacto de aproximadamente 35 millones de parametros, desarrollado por AiRukua y entrenado desde cero sobre el dataset TinyStories. Su interes no reside en la escala, sino en la exploracion de tecnicas de modelado de secuencias sub-cuadraticas a un tamano muy reducido, lo que permite experimentar con arquitecturas hibridas en hardware de consumo. Emplea la denominada arquitectura Kilat Macro-Synergy Hybrid Dense, que intercala dos mecanismos de atencion distintos a lo largo de sus 8 capas.

El modelo combina capas pares con un mecanismo de decaimiento exponencial global de estado constante (sin KV-cache) y capas impares con Multi-Head Latent Attention (MLA) comprimida y RoPE desacoplado. Esta hibridacion busca reducir el coste de memoria durante la inferencia manteniendo capacidad de recuperacion asociativa. El resultado es un modelo denso con 31,89 millones de parametros no de embedding y un contexto nativo de 512 tokens, extensible mediante YaRN.

Es relevante como banco de pruebas reproducible para investigadores interesados en arquitecturas hibridas, compresion de KV-cache y decodificacion eficiente a pequena escala, asi como para desarrolladores que quieran validar pipelines de inferencia con modelos diminutos antes de escalar. Su licencia MIT y su integracion con `transformers` mediante codigo remoto facilitan su uso experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido sub-cuadratico (Macro-Synergy: capas pares con Global Exponential Decay, capas impares con Latent MLA), FFN SwiGLU densa |
| Parametros totales | 31.888.536 (segun safetensors); ~35,2 M reportados por el autor |
| Parametros activos | No aplica (modelo denso, 100% de parametros activos por token) |
| Longitud de contexto | 512 tokens nativos; extensible a 8k+ mediante YaRN |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16/FP16) |
| Idiomas soportados | Ingles (dataset TinyStories en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16/FP16) |

Otros datos tecnicos: 8 capas (4 de Global Decay + 4 de Latent MLA), dimension oculta 384, 6 cabezas de atencion de 64 dimensiones, dimension latente de 96 (ratio de compresion 4x, reduccion del 93,75% de la huella de KV-cache), vocabulario de 50.257 tokens con BPE estilo GPT-2, FFN con factor de expansion 2,67x (d_ffn = 1.024).

## Arquitectura y entrenamiento

El modelo sigue un diseno de transformer decoder hibrido. Las capas pares (0, 2, 4, 6) implementan un mecanismo de decaimiento exponencial global que actua como memoria recurrente de tiempo lineal con estado oculto de tamano constante, segun la formulacion s_t = diag(lambda) s_{t-1} + v_t. Estas capas no requieren KV-cache, lo que reduce el coste de prefill y mantiene el consumo de memoria independiente de la longitud del documento. Las capas impares (1, 3, 5, 7) emplean Multi-Head Latent Attention con RoPE desacoplado, comprimiendo las proyecciones de clave y valor en un vector latente de 96 dimensiones que es lo unico que se cachea, logrando una reduccion del 93,75% en la huella de cache.

Cada bloque incorpora una FFN SwiGLU densa con activacion SiLU y factor de expansion 2,67x, sin enrutamiento MoE. El entrenamiento se realizo desde cero sobre el dataset roneneldan/TinyStories, un corpus de cuentos infantiles sinteticos en ingles. El autor menciona un proceso de "Pre-Flight Assurance" de 7 puertas (G0-G6) que certifica matematicamente la inicializacion, causalidad y estabilidad del modelo antes del entrenamiento, aunque no se detalla el numero de tokens vistos, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. El posicionamiento usa RoPE decodificado con escalado nativo de frecuencias YaRN para extension de contexto.

## Capacidades

- Generacion de texto causal en ingles, orientada a narrativa breve y cuentos infantiles.
- Razonamiento basico de secuencias cortas gracias a la ventana nativa de 512 tokens.
- Modelado de lenguaje autoregresivo con vocabulario GPT-2 (50.257 tokens).
- Extension de contexto mediante YaRN hasta 8k+ tokens (segun el autor).
- Inferencia con memoria constante en capas de decaimiento global (sin KV-cache en capas pares).
- Carga directa con `transformers` mediante `trust_remote_code=True` y `auto_map`, sin necesidad de instalar el framework Kilat.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue no disponible: el modelo esta entrenado unicamente en ingles.

## Casos de uso

- Investigacion en arquitecturas hibridas: sirve como banco de pruebas reproducible para comparar mecanismos de atencion lineal y MLA frente a atencion completa a escala reducida, con coste de entrenamiento asequible.
- Prototipado de pipelines de inferencia: permite validar integraciones con `transformers`, generacion por streaming y carga de pesos safetensors antes de migrar a modelos mayores.
- Educacion y docencia: modelo pequeno y ligero para ilustrar conceptos de KV-cache, compresion latente y decodificacion autoregresiva en cursos de IA.
- Generacion de cuentos sinteticos: entrenado especificamente en TinyStories, puede producir narrativas infantiles cortas para pruebas de sistemas de moderacion o generacion de contenido.
- Benchmarking de cuantizacion y despliegue: su tamano permite medir latencia y throughput en CPU, GPU de consumo y entornos embebidos sin grandes inversiones.
- Pruebas de extension de contexto: el soporte YaRN permite experimentar con extrapolacion de longitud y evaluar la degradacion de calidad en tareas de recuperacion.
- Generacion de datos sinteticos auxiliares: util para crear corpus de texto simple en ingles en tareas de aumento de datos o tests de pipelines NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 0,07 GB solo para pesos (31,89 M parametros), mas overhead de activaciones y cache; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- Cabe en GPU de consumo: si, en cualquier GPU moderna (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte CUDA o Apple Silicon es suficiente. Para pruebas de throughput a gran volumen, una RTX 4090 o A100 esta sobredimensionada pero permite maximizar el batching.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, pipeline de text-generation, TextStreamer para streaming. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera latencia de milisegundos por token en GPU de consumo, pero no hay mediciones publicadas.
- Tamano del repositorio: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories-Kilat-35M | 31,89 M | 512 (ext. 8k+ via YaRN) | Hibrida (Global Decay + Latent MLA) | MIT | Hugging Face |
| GPT-2 small | 124 M | 1.024 | Transformer denso | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Transformer denso (Llama) | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2.048 | Transformer denso | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para TinyStories-Kilat-35M que permitan contrastar rendimiento. Frente a GPT-2 small, el modelo de AiRukua es aproximadamente 4 veces mas pequeno y usa una arquitectura hibrida con menor coste de cache, pero su contexto nativo es la mitad y su entrenamiento se restringe a TinyStories, lo que limita su calidad generalista. SmolLM-135M y TinyLlama-1.1B son alternativas mas grandes y con contextos mayores, pero no incorporan mecanismos sub-cuadraticos.

## Limitaciones y advertencias

- Entrenado exclusivamente en TinyStories (cuentos infantiles sinteticos en ingles): su conocimiento del mundo, vocabulario y capacidad de razonamiento son muy limitados fuera de ese dominio.
- Riesgo elevado de alucinacion y de generar texto incoherente en prompts fuera del estilo narrativo infantil.
- Contexto nativo de solo 512 tokens; la extension YaRN a 8k+ no esta validada con benchmarks y puede degradar la calidad.
- Modelo unicamente en ingles; no se garantiza ningun rendimiento en castellano u otros idiomas.
- Sin soporte documentado de tool calling, function calling, agentes, vision ni audio.
- No hay benchmarks publicados, por lo que las afirmaciones de eficiencia del autor no estan contrastadas de forma independiente.
- Requiere `trust_remote_code=True` para cargar codigo personalizado desde el repositorio; conviene auditar el codigo remoto antes de usarlo en produccion.
- Licencia MIT: permite uso comercial, pero al ser un modelo experimental de 35 M de parametros no es adecuado como base para aplicaciones en produccion reales.
- El numero de parametros reportado por el autor (~35,2 M) difiere del recuento real de safetensors (31,89 M); conviene verificar la configuracion antes de planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiRukua/tiny-stories-kilat-35M
- Framework Kilat (GitHub): https://github.com/Airukua/Kilat
- Perfil del autor en Hugging Face: https://huggingface.co/AiRukua
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
