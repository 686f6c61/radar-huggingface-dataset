# DZER-Studios/Vexion-gpt-nano

## Resumen

Vexion-gpt-nano es un modelo de lenguaje denso de 117 millones de parámetros desarrollado por DZER-Studios, construido desde cero en PyTorch puro. Se trata de un ejercicio de ingeniería orientado a comprender y optimizar el ciclo completo de preentrenamiento de un transformer causal, sin recurrir a frameworks de alto nivel como `transformers` de Hugging Face. El modelo se entrenó sobre el dataset multilingüe CulturaX, aunque la model card declara únicamente ruso como idioma soportado.

La arquitectura es un GPT causal clásico, sin mezcla de expertos (MoE) ni RoPE, con atención causal estándar y activaciones GELU/SiLU. Incorpora Flash Attention mediante kernels fusionados y un DataLoader personalizado que transmite datos binarios (`.bin`) evitando la sobrecarga del recolector de basura de Python. El contexto máximo es de 1024 tokens y el vocabulario de 40960 entradas.

Su relevancia es principalmente educativa y experimental: demuestra que es posible preentrenar un modelo de 117M parámetros con 21 mil millones de tokens en una única RTX 4060 Ti de 16 GB en 280 horas. No obstante, su incompatibilidad con la API estándar de `transformers` y su limitado contexto lo sitúan fuera de los flujos de producción convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (GPT clásico, sin MoE ni RoPE) |
| Parametros totales | 117.299.712 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom code, no compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal densa escrita en PyTorch puro, con atención causal estándar y funciones de activación GELU/SiLU. No utiliza RoPE ni mezcla de expertos. La configuración se gestiona mediante un `config.json` compatible con los estándares de Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), aunque la implementación está desacoplada de la librería `transformers`. Integra Flash Attention con kernels fusionados para reducir el consumo de VRAM durante el entrenamiento.

El preentrenamiento se realizó sobre el dataset CulturaX con un total de 21 mil millones de tokens, usando una única GPU RTX 4060 Ti de 16 GB, con `batch_size` de 8 y 24 pasos de acumulación, durante 280 horas y 220.000 pasos totales. El optimizador es Adaw, que mantiene los valores en formato de 32 bits para reducir la pérdida. Los resultados reportados son una pérdida de entrenamiento de 3,21 y una pérdida de validación de 3,1. No se menciona el uso de RLHF, DPO ni ajuste fino supervisado.

## Capacidades

- Generación de texto autoregresiva en ruso.
- Razonamiento básico y coherencia conversacional limitada por el tamaño del modelo y el contexto de 1024 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada: la model card declara únicamente ruso, aunque el dataset CulturaX es multilingüe.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Compatible con scripts propios de inferencia (`generate.py`, `generation.py`, `generate_base.py`) que aceptan parámetros como `temperature`, `rep_penalty`, `max_new_tokens` y `device`.

## Casos de uso

- Experimentación académica en preentrenamiento de transformers: el modelo sirve como referencia reproducible para estudiar dinámicas de entrenamiento con 21B tokens en hardware de consumo, gracias a sus scripts de entrenamiento y reanudación desde checkpoints.
- Generación de texto en ruso para prototipos: puede emplearse en demostraciones de generación condicionada por prompt con ventanas cortas de 1024 tokens, útil para validar pipelines de inferencia personalizados.
- Investigación sobre eficiencia de memoria: la integración de Flash Attention y el DataLoader binario permiten estudiar optimizaciones de VRAM y throughput en GPUs de gama media como la RTX 4060 Ti.
- Base para ajuste fino experimental: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como punto de partida para experimentos de fine-tuning en dominios específicos en ruso, siempre con los scripts propios del repositorio.
- Docencia y formación técnica: su arquitectura clara y sin dependencias de frameworks pesados lo hace adecuado para explicar el funcionamiento interno de un GPT causal a estudiantes de machine learning.
- Pruebas de integración de sistemas custom: útil para equipos que desarrollan sus propios runners de inferencia y necesitan un modelo ligero con pesos safetensors y código propio para validar su infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (117M parámetros × 4 bytes), alrededor de 0,25 GB en FP16 y menos de 0,15 GB en cuantización de 8 bits, aunque no se documentan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una RTX 4060 Ti de 16 GB.
- Cabe en GPUs de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no soporta la API de `transformers`. El despliegue debe realizarse con los scripts propios del repositorio (`generate.py`, `generation.py`, `generate_base.py`) sobre PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Compatibilidad con `transformers` | Idiomas |
|---|---|---|---|---|---|
| Vexion-gpt-nano | 117M | 1024 | Apache 2.0 | No (custom code) | Ruso |
| GPT-2 small | 124M | 1024 | MIT | Sí | Inglés |
| GPT-Neo 125M | 125M | 2048 | MIT | Sí | Inglés |
| Cerebras-GPT-111M | 111M | 2048 | Apache 2.0 | Sí | Inglés |

La comparativa se limita a modelos de tamaño similar, ya que no se dispone de datos de rendimiento del modelo evaluado. La principal diferencia frente a las alternativas es la incompatibilidad con la API estándar de `transformers` y el enfoque en ruso, mientras que los modelos comparados están orientados al inglés y cuentan con ecosistema de despliegue estándar.

## Limitaciones y advertencias

- Incompatibilidad total con la librería `transformers`: no se puede cargar mediante `AutoModelForCausalLM` ni usar con herramientas estándar como vLLM, TGI, Ollama o llama.cpp.
- Contexto muy limitado de 1024 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Idioma restringido al ruso según la model card, a pesar de haberse entrenado con el dataset multilingüe CulturaX; el rendimiento en otros idiomas no está documentado.
- Riesgo elevado de alucinación y baja calidad factual debido a su tamaño (117M parámetros) y a una pérdida de validación de 3,1.
- Posibles sesgos heredados de CulturaX, sin documentación sobre mitigación ni evaluación de sesgos.
- No se documentan procesos de alineación (RLHF, DPO) ni ajuste de instrucciones, por lo que el modelo probablemente no sigue instrucciones de forma fiable.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin evaluación previa.
- El repositorio tiene 0 likes y 284 descargas, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-nano
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
