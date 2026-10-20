# jfrick/simple-llm-124M-10.879B

## Resumen

`jfrick/simple-llm-124M-10.879B` es un modelo de lenguaje causal publicado por el autor independiente jfrick como una release de inferencia de un checkpoint experimental entrenado desde cero. La model card lo describe como un modelo base, no como un asistente instruido, con 14 capas, anchura 768, 12 cabezas de atención, RMSNorm, RoPE, SwiGLU y embeddings de 32.768 tokens. El nombre indica 124M de parámetros y 10.879B de objetivos de next-token, aunque el repositorio safetensors declara 149.555.456 parámetros reales, una discrepancia relevante que se detalla más abajo.

El entrenamiento acumuló aproximadamente 10.878.562.619 objetivos de next-token en varias fases: una mezcla inicial de web, código, matemáticas, investigación y libros; una continuación con material del BCE y la EMA; y una fase final con un 60 % de código Python. La ventana de contexto está configurada en 8.192 tokens, pero el autor no afirma que el modelo tenga un rendimiento validado en tareas de 8K. El tokenizador es un BPE a nivel de byte congelado, con PAD 0, BOS 1, EOS 2 y UNK 3.

Su relevancia es principalmente experimental y educativa: pesos e código de inferencia están publicados, el modelo es pequeño y puede ejecutarse en hardware de consumo, y sirve como baseline para estudiar entrenamiento from scratch, repetición en decodificación y comportamiento de modelos base. No obstante, no hay benchmarks de capacidades publicados, la licencia no está especificada y el código es PyTorch personalizado, no compatible con `AutoModel` de Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, 14 capas, anchura 768, 12 cabezas de atención, RMSNorm, RoPE (theta 10.000), SwiGLU y embeddings de 32.768 tokens |
| Parámetros totales | 149.555.456 según safetensors; la model card declara 124.389.632 para el checkpoint nominal |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens configurados; no validado para tareas de 8K según el autor |
| Tipos de cuantización | no disponible; no se publican artefactos GGUF, ONNX ni cuantizaciones oficiales |
| Idiomas soportados | inglés (`en`); la continuación multilingüe no está incluida en esta release |
| Licencia | no disponible |
| Formato de pesos | safetensors; código de inferencia PyTorch personalizado, no implementa `Transformers AutoModel` |
| Tokenizador | BPE a nivel de byte congelado; PAD 0, BOS 1, EOS 2, UNK 3 |
| Librería | PyTorch |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 14 capas y 768 dimensiones, con 12 cabezas de atención, normalización RMSNorm, embeddings rotatorios RoPE con theta 10.000 y activación SwiGLU. La model card indica embeddings de 32.768 tokens atados, aunque el recuento real de safetensors es superior al declarado, lo que sugiere una posible discrepancia entre la descripción y los pesos publicados. El contexto configurado es de 8.192 tokens; el autor lo presenta como configuración, no como garantía de rendimiento validado en ventanas largas.

El entrenamiento se realizó desde cero en varias fases: 4.999.981.176 objetivos en la mezcla original de web, código, matemáticas, investigación y libros; 878.610.362 objetivos con material del BCE y la EMA; y 4.999.971.081 objetivos en una continuación con un 60 % de código Python, terminando en el paso 66.065 de esa fase. La fase final usó ocho H100, computación BF16 con pesos FP32, padding recortado, RoPE cacheado, `torch.compile`, microbatch 2, batch global 32 y AdamW fusionado, con una tasa de aprendizaje constante de 3e-5. La última fase recogió 2.629.230.692 objetivos únicos nuevos y permitió como máximo dos pasadas por fuente dentro de esa fase; la exposición acumulada puede superar dos pasadas. No se menciona RLHF, DPO ni ajuste por instrucciones. Las auditorías de split, casi duplicados y contaminación están incompletas según el autor.

## Capacidades

- Generación de texto causal en inglés: continuación de texto y finalización de secuencias, sin ajuste por instrucciones.
- Generación y continuación de código, especialmente Python, gracias a la fase final con un 60 % de código.
- Exposición a matemáticas, investigación, libros y material financiero del BCE/EMA durante el entrenamiento, aunque sin benchmarks que cuantifiquen esas capacidades.
- Contexto configurado de 8.192 tokens, útil para experimentos de ventana larga, pero no validado por el autor en tareas de 8K.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explícito, visión, audio ni otras modalidades.
- No hay ajuste multilingüe: la release solo declara inglés y excluye la continuación multilingüe.
- La generación suprime PAD, BOS y UNK, y se detiene en EOS; no aplica penalización de repetición.

## Casos de uso

- Investigación sobre entrenamiento from scratch: el modelo y su código de inferencia permiten reproducir y estudiar un pipeline pequeño de transformer causal, incluyendo tokenizador congelado, RoPE cacheado y configuración de entrenamiento en BF16/FP32.
- Estudio de repetición y decodificación: la model card publica métricas de cuatro-gramos repetidos para greedy, T=0,2/k=10 y T=0,8/k=50, por lo que el modelo sirve para experimentos controlados sobre temperatura, top-k y repetición semántica.
- Autocompletado de código Python en prototipos internos: puede continuar funciones o fragmentos, pero requiere revisión humana y pruebas automatizadas porque el autor advierte que las generaciones pueden ser incorrectas como código.
- Baseline para modelos pequeños: útil para comparar arquitecturas de ~124M-150M parámetros, mezclas de datos y estrategias de continuación sobre código frente a modelos públicos similares.
- Educación y divulgación técnica: adecuado para demostrar cómo funciona un modelo causal, inspeccionar embeddings, atención y curvas de pérdida, y explicar las diferencias entre modelo base y asistente instruido.
- Generación de borradores técnicos en inglés: puede producir texto preliminar sobre temas presentes en su mezcla de datos, siempre con revisión factual y sin usarlo como fuente de verdad.
- Pruebas de integración de inferencia personalizada: sirve para validar despliegues con PyTorch 2.6.0, safetensors y tokenizers 0.22.2 en CPU o GPU de consumo antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades como MMLU, HumanEval o GSM8K en la información disponible. El autor solo proporciona pérdidas de validación y métricas de repetición, medidas sobre ventanas de 2K, que no deben interpretarse como benchmarks de capacidad o factualidad.

| Medición declarada | Valor | Contexto |
|---|---:|---|
| Pérdida final en código | 1,421 | Frente a 1,559 del modelo original de 5B, según la model card |
| Pérdida ECB | 2,494 | Pérdida sobre material del BCE; el autor indica pérdida sustancial de especialización |
| Pérdida EMA | 2,379 | Pérdida sobre material de la EMA; misma advertencia |
| Cuatro-gramos repetidos, greedy | 81,6 % | Conjunto pequeño de diez prompts |
| Cuatro-gramos repetidos, T=0,2 / k=10 | 77,0 % | Conjunto pequeño de diez prompts |
| Cuatro-gramos repetidos, T=0,8 / k=50 | 23,5 % | Conjunto pequeño de diez prompts |

## Requisitos de hardware

- VRAM estimada para pesos en FP32: aproximadamente 0,6 GB para 149.555.456 parámetros.
- VRAM estimada para pesos en BF16/FP16: aproximadamente 0,3 GB.
- VRAM estimada para pesos en int8: aproximadamente 0,15 GB; en int4, aproximadamente 0,075 GB, aunque no hay cuantizaciones oficiales publicadas.
- Caché KV aproximada en FP16 para 8.192 tokens: unos 0,34 GB, calculada a partir de 14 capas, 12 cabezas, dimensión de cabeza 64 y almacenamiento de clave y valor.
- En BF16 con contexto de 8K, el peso más la caché KV ronda los 0,65 GB, antes de activaciones y overhead del runtime.
- Cabe en GPU de consumo con 2 GB o más de VRAM; también es viable en CPU para pruebas, aunque el rendimiento dependerá del backend y del código personalizado.
- GPU recomendadas: cualquier GPU moderna de consumo como RTX 3060 o RTX 4090 es más que suficiente; A100 o H100 solo tendrían sentido para experimentos de entrenamiento o evaluaciones por lotes, no por requisitos de memoria.
- Despliegue documentado: `generate.py` del repositorio, con PyTorch 2.6.0, safetensors y tokenizers 0.22.2.
- No se documenta soporte para vLLM, TGI, llama.cpp, Ollama u otros runtimes; requeriría adaptación o conversión no publicada.
- Latencia y throughput de inferencia: no disponibles. El entrenamiento usó ocho H100, pero no se aportan métricas de serving.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| `jfrick/simple-llm-124M-10.879B` | 149,6M en safetensors; 124,4M declarados | 8.192 configurados | no disponible | Pesos safetensors y código PyTorch personalizado | Experimental, modelo base, sin benchmarks de capacidades |
| GPT-2 124M | 124M | 1.024 | MIT | HuggingFace Transformers | Modelo base histórico, ampliamente soportado por el ecosistema |
| SmolLM-135M | 135M | 2.048 | Apache-2.0 | HuggingFace Transformers | Modelo pequeño con soporte estándar de Transformers |
| Pythia-160M | 160M | 2.048 | Apache-2.0 | HuggingFace Transformers | Modelo base de investigación con checkpoints intermedios |

No hay datos de benchmark comunes que permitan comparar rendimiento entre estos modelos y `simple-llm-124M-10.879B`. La comparación anterior es solo de especificaciones públicas y disponibilidad; no implica superioridad o inferioridad en capacidades.

## Limitaciones y advertencias

- Es un modelo base, no un asistente instruido: no sigue instrucciones de forma fiable y puede producir texto incoherente o incorrecto.
- Repetición severa con decodificación greedy o de baja temperatura: el autor reporta un 81,6 % de cuatro-gramos repetidos en greedy y un 77,0 % con T=0,2/k=10.
- No se aplica penalización de repetición durante la generación, lo que puede agravar bucles.
- Riesgo alto de alucinación y de código incorrecto; el autor advierte explícitamente que las generaciones pueden ser inexactas como código.
- Idiomas: solo inglés declarado; la continuación multilingüe no está incluida.
- Contexto de 8.192 tokens configurado, pero no validado para tareas de ventana larga; el propio autor lo califica como configuración, no como rendimiento demostrado.
- Licencia no especificada: no hay autorización clara para uso comercial, redistribución o modificación; conviene contactar con el autor antes de usarlo en producción.
- Código personalizado que no implementa `AutoModel` de Transformers: no funciona directamente con el ecosistema estándar de inferencia, cuantización o serving.
- Discrepancia entre los 124.389.632 parámetros declarados y los 149.555.456 de safetensors; también se declaran embeddings atados, lo que no encaja con el recuento real.
- Auditorías de split, casi duplicados y contaminación incompletas; el autor no publica los documentos de entrenamiento ni los estados de optimizador/RNG.
- Pérdida de especialización en ECB/EMA tras la continuación con código, según las pérdidas reportadas por el autor.
- No hay benchmarks de capacidades, tool calling, agentes, visión o audio documentados.
- Los datos de entrenamiento no están publicados, lo que limita la reproducibilidad completa y la evaluación de sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/jfrick/simple-llm-124M-10.879B
- Repositorio de código: https://github.com/koogle/lm-exploration
- Curvas de pérdida de entrenamiento y validación: `evaluation/loss-curves.png` en el repositorio de HuggingFace
- Curvas de norma de gradiente, tasa de aprendizaje y throughput: `evaluation/optimizer-curves.png` en el repositorio de HuggingFace
- Registro de recuentos de tokens y hashes de artefactos: `release.json` en el repositorio de HuggingFace
- Paper: no disponible
- Demo: no disponible
