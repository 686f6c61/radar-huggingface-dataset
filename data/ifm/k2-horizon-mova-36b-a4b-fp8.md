# IFM/K2-Horizon-MoVA-36B-A4B-FP8

## Resumen

K2-Horizon-MoVA-36B-A4B-FP8 es la versión cuantizada en FP8 del modelo K2-Horizon-MoVA-36B-A4B, desarrollado por IFM. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con una innovación arquitectónica denominada Mixture-of-Values attention (MoVA), que almacena 36B parámetros totales pero activa únicamente 4B por token durante la inferencia. Esta eficiencia computacional lo posiciona como una alternativa competitiva frente a modelos densos de ~30B y MoE de hasta 15 veces su tamaño en tareas de razonamiento y agentes.

La versión FP8 cuantiza exclusivamente las capas lineales de los expertos enrutados (routed experts) en las capas 3 a 47 del transformer, manteniendo el resto de tensores en BF16: atención, expertos compartidos, routers, las tres primeras capas densas, los expertos de valor de MoVA, normalizaciones, embeddings y lm_head. Según el autor, el rendimiento se mantiene cercano al modelo BF16 original mientras reduce la huella de memoria y acelera la inferencia en hardware compatible con FP8.

El modelo destaca por su contexto nativo de 524.288 tokens (512K), disponible desde las etapas de midtraining, y por una política de apertura completa: pesos, datos de entrenamiento, receta y código de entrenamiento serán publicados. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Mixture-of-Values attention (MoVA) |
| Parámetros totales | 37.444.792.020 (~36B según el autor; 37,4B según safetensors) |
| Parámetros activos | ~4B por token |
| Longitud de contexto | 524.288 tokens (512K), nativo desde midtraining |
| Tipos de cuantización | FP8 E4M3FN (pesos estáticos con escala FP32 por bloque 128×128; activaciones dinámicas con escala por grupo 1×128); resto de tensores en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, código custom `k2_horizon`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas MoE intercaladas y una innovación propia denominada Mixture-of-Values attention (MoVA), que introduce "expertos de valor" (value experts) en el mecanismo de atención. La red consta de 48 capas transformer (índices 0 a 47), de las cuales las tres primeras son densas y las restantes incorporan expertos enrutados. Los expertos enrutados tienen un tamaño intermedio de 768, divisible en bloques de cuantización de 128, lo que permite su uso con tensor parallelism de 1 y 2 sin degradación por desalineación de bloques. El modelo activa aproximadamente 4B parámetros por token, lo que reduce el coste computacional frente a un modelo denso equivalente.

El entrenamiento se realizó en fases de pretraining y midtraining, con datasets publicados como `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`. El contexto de 512K tokens se establece de forma nativa a partir de las etapas de midtraining. El autor indica que se publicarán checkpoints intermedios, los datos, la receta y el código de entrenamiento, lo que permitirá estudiar la evolución de capacidades a lo largo del entrenamiento. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para diálogos multi-turno.
- Razonamiento de múltiples pasos y tareas agénticas, según los benchmarks reportados por el autor.
- Razonamiento matemático y resolución de problemas (evaluado en benchmarks de razonamiento).
- Capacidades de código y generación de software (evaluado en benchmarks de código).
- Contexto largo nativo de 512K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el enfoque agéntico del modelo lo sugiere.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se mencionan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (512K tokens) gracias a su ventana nativa, permitiendo mantener el historial completo de interacciones y documentación de soporte sin truncamiento.
- **Análisis de documentos extensos**: con 512K tokens de contexto, puede procesar informes anuales, expedientes legales o bases de código completas en una sola pasada, extrayendo información y respondiendo preguntas sobre el contenido.
- **Generación de código en producción**: su tamaño activo de 4B y su licencia Apache 2.0 lo hacen adecuado para pipelines de CI/CD donde se requiere generación de código con latencia contenida y coste de inferencia reducido.
- **Agentes autónomos multi-paso**: el modelo está optimizado para tareas agénticas y razonamiento de múltiples pasos, lo que permite construir agentes que planifican, ejecutan herramientas y verifican resultados de forma iterativa.
- **Investigación sobre entrenamiento de MoE**: al publicarse checkpoints intermedios, datos y código de entrenamiento, el modelo sirve como plataforma para estudiar la evolución de capacidades y el comportamiento de arquitecturas MoE con MoVA.
- **Despliegue en hardware con soporte FP8**: la cuantización FP8 reduce la huella de memoria y acelera la inferencia en GPUs con soporte nativo (H100, H200, etc.), permitiendo servir el modelo con menor coste por token.
- **Razonamiento matemático y resolución de problemas**: adecuado para aplicaciones educativas o de asistencia técnica que requieran razonamiento simbólico y numérico paso a paso.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero los datos numéricos concretos de cada benchmark no están disponibles en la información proporcionada (la tabla aparece truncada). Los modelos de comparación citados son:

| Modelo | Parámetros |
|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B |
| Nemotron 3 Ultra | 550B |
| Nemotron 3 Super | 120B |
| G9v3-39A5B | 39B |
| Qwen3.6-35B-A3B | 35B |
| Muse Glimmer-30B | 30B |
| Gemma 4 31B-it | 31B |

El autor afirma que el modelo supera a modelos densos de ~30B y a MoE de hasta 15 veces su tamaño en benchmarks agénticos y de razonamiento, y que compite con modelos frontera cerrados. Sin embargo, los valores numéricos específicos (MMLU, HumanEval, GSM8K, etc.) no están disponibles en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repo pesa 48,4 GB en FP8 (pesos cuantizados + tensores BF16 restantes). En FP8, se estima un uso de VRAM de ~48-55 GB para los pesos, más overhead de activaciones y KV cache (que crece con el contexto; a 512K tokens el KV cache puede ser muy elevado).
- **GPU recomendadas**: H100/H200 (soporte nativo FP8) para despliegue óptimo; A100 (sin FP8 nativo, requeriría conversión o uso en BF16); GPUs consumer como RTX 4090 (24 GB) no pueden alojar el modelo completo en FP8 sin offloading o cuantización adicional.
- **¿Cabe en consumer GPU?**: no en su totalidad. Sería necesario cuantizar a 4-bit (GGUF/AWQ/GPTQ) para intentar encajar en 24-48 GB, aunque no se proporcionan versiones de este tipo en la información disponible.
- **Opciones de despliegue**: transformers con código custom (`k2_horizon`); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible. El autor recomienda tensor parallelism de 1 o 2 para los expertos enrutados.
- **Latencia y throughput**: no disponibles en la información proporcionada. La cuantización FP8 debería mejorar el throughput en hardware compatible, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-FP8 | 37,4B | ~4B | 512K | Apache 2.0 | Pesos abiertos (HF) |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | no disponible |
| G9v3-39A5B | 39B | ~5B | no disponible | no disponible | no disponible |
| Gemma 4 31B-it | 31B | denso | no disponible | no disponible | no disponible |

Los datos de rendimiento comparativo no están disponibles numéricamente en la información proporcionada. El autor afirma superioridad frente a estos modelos en benchmarks agénticos y de razonamiento, pero no se pueden verificar las cifras concretas.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de sus datos de entrenamiento.
- **Alucinación**: no se proporcionan evaluaciones específicas de tasas de alucinación; debe validarse en dominios críticos.
- **Contexto largo**: aunque el contexto nativo es de 512K tokens, el rendimiento en ventanas extremas puede degradarse y el KV cache asociado incrementa notablemente los requisitos de memoria.
- **Licencia**: Apache 2.0 permite uso comercial, pero deben revisarse las licencias de los datasets de entrenamiento (`IFM/K2-Horizon-Pretrain-Data`, `IFM/K2-Horizon-Midtrain-Data`) para confirmar compatibilidad.
- **Cuantización FP8**: solo los expertos enrutados están cuantizados; el resto en BF16 implica que el ahorro de memoria es parcial. La calidad puede diferir ligeramente del modelo BF16 original.
- **Tool calling y agentes**: no se confirma explícitamente el soporte de function calling en la información disponible; debe validarse antes de usarlo en producción agéntica.
- **Ecosistema**: requiere código custom (`k2_horizon`), lo que puede limitar la compatibilidad con herramientas estándar de despliegue.

## Enlaces

- [Hugging Face: IFM/K2-Horizon-MoVA-36B-A4B-FP8](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-FP8)
- [Modelo base: IFM/K2-Horizon-MoVA-36B-A4B](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B)
- [Dataset de pretraining: IFM/K2-Horizon-Pretrain-Data](https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data)
- [Dataset de midtraining: IFM/K2-Horizon-Midtrain-Data](https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data)
