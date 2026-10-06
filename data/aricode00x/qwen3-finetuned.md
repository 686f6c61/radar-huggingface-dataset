# aricode00x/qwen3-finetuned

## Resumen

qwen3-finetuned es un ajuste fino supervisado del modelo Qwen/Qwen3-0.6B, publicado por el usuario aricode00x. Se trata de un modelo decoder-only de tipo transformer, con aproximadamente 596 millones de parámetros, orientado a la generación de texto conversacional. El ajuste se realizó a partir de un tutorial oficial de Hugging Face sobre entrenamiento y del conjunto de datos público karthiksagarn/astro_horoscope, por lo que su ámbito de especialización aparente es la generación de textos de horóscopos.

El modelo hereda la arquitectura, la tokenizador y las capacidades del Qwen3-0.6B original, incluida su ventana de contexto y su soporte multilingüe. El ajuste se ejecutó durante una única época con un learning rate de 2e-05, batch size de 16 y el optimizador AdamW fused, alcanzando una pérdida de validación de 2,5165.

Su relevancia es limitada y fundamentalmente didáctica: no aporta innovaciones técnicas sobre el modelo base, cuenta con cero descargas y no incluye benchmarks publicados. Resulta útil como ejemplo reproducible de un pipeline de fine-tuning con la librería transformers, más que como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 (aproximadamente 0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-0.6B soporta 32.768 tokens y hasta 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible para este ajuste (el modelo base admite GGUF en varias precisiones) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only con normalizacion RMSNorm, atencion causal con RoPE y proyecciones de las capas de atencion sin sesgo. No introduce cambios arquitectonicos propios: el ajuste fino conserva la totalidad de la estructura y del tokenizador del modelo base. El entrenamiento se llevo a cabo con la libreria transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

Los hiperparametros declarados son: learning rate 2e-05, train_batch_size 16, eval_batch_size 8, semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y una unica epoca sobre 1.236 pasos. La perdida de entrenamiento fue 2,3943 y la de validacion 2,5165. No se documenta la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Todo apunta a un ajuste supervisado (SFT) sobre el conjunto karthiksagarn/astro_horoscope.

## Capacidades

- Generacion de texto autoregresiva en el estilo y dominio del conjunto de datos de ajuste.
- Generacion conversacional multiturno, gracias a la herencia del modelo base.
- Capacidades multilingues heredadas del Qwen3-0.6B, aunque no se certifican para este ajuste concreto.
- Razonamiento basico y generacion de codigo a nivel del modelo base, potencialmente degradados por el ajuste de dominio.
- No se documentan capacidades de tool calling, function calling ni ejecucion de agentes.
- No se documentan capacidades multimodales (vision o audio).

## Casos de uso

- Generacion de horoscopos y textos astrologicos: es el escenario para el que se ajusto el modelo, a partir del dataset astro_horoscope; se usaria como generador de texto tematico en blogs o aplicaciones de entretenimiento.
- Prototipado academico de pipelines de fine-tuning: sirve como ejemplo reproducible de ajuste de un LLM pequeno con la API de transformers.
- Experimentos de destilacion de estilo sobre un modelo base: permite estudiar como un ajuste corto (una epoca) altera el estilo de salida sin modificar la arquitectura.
- Demostraciones docentes de entrenamiento supervisado: su tamano (0,6 B) permite ejecutar el ciclo completo en una unica GPU de consumo.
- Bots conversacionales de baja latencia para nichos concretos: al ser un modelo pequeno, puede desplegarse en entornos con recursos limitados y responder a consultas cortas de tematica astrologica.
- Pruebas de integracion en pipelines locales (llama.cpp, Ollama) una vez convertido a GGUF, para validar extremo a extremo el flujo de despliegue.
- Evaluacion comparativa de modelos base frente a sus ajustes: util para medir la perdida de rendimiento general al especializar un LLM en un unico dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una lista de resultados vacia. El unico dato cuantitativo reportado es la perdida de validacion de 2,5165, que no es un benchmark y no resulta comparable con metricas como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, alrededor de 1,2 GB de pesos mas overhead de activaciones; en INT8, en torno a 600 MB; en INT4, cerca de 300-400 MB.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, incluso en iGPU con suficiente memoria compartida.
- GPU de centro de datos (A100, H100) innecesarias para este tamano; sobredimensionadas salvo por despliegue de gran cantidad de replicas.
- Opciones de despliegue: transformers (libreria nativa del modelo), text-generation-inference (el repositorio esta marcado como endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no incluida en el repositorio).
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 0,6 B, en GPU de consumo se espera una latencia de decodificacion de pocos milisegundos por token, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| aricode00x/qwen3-finetuned | 0,6 B | no disponible | apache-2.0 | Ajuste de dominio sobre Qwen3-0.6B, sin benchmarks ni descargas |
| Qwen/Qwen3-0.6B | 0,6 B | 32.768 tokens (131.072 con YaRN) | apache-2.0 | Modelo base, con benchmarks publicados por el autor original |
| Qwen/Qwen2.5-0.5B | 0,49 B | 32.768 tokens | apache-2.0 | Alternativa de generacion anterior, mas madura y con benchmarks publicados |
| meta-llama/Llama-3.2-1B | 1,2 B | 128.000 tokens | Llama 3.2 Community License | Mayor tamano y contexto, licencia con restricciones de uso |

No se dispone de datos de rendimiento del modelo ajustado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo sin benchmarks publicados: no hay evidencia de rendimiento general mas alla de la perdida de validacion.
- Riesgo elevado de alucinacion en dominios ajenos al conjunto de ajuste, ya que el fine-tuning se centro en un unico tema.
- Degradacion probable de capacidades generales (codigo, matematicas, razonamiento) tras el ajuste de dominio sobre un modelo de 0,6 B.
- Dataset de entrenamiento y composicion de idiomas no documentados: imposible auditar sesgos o cobertura lingueistica.
- Cero descargas y cero valoraciones en el repositorio: no existe validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-10-05, posterior a la actualidad de referencia; conviene verificar la vigencia del repositorio.
- Licencia apache-2.0 permisiva para uso comercial, pero se recomienda revisar tambien las condiciones del conjunto de datos astro_horoscope utilizado en el ajuste.
- La model card advierte explicitamente de que la informacion sobre usos previstos y datos de entrenamiento esta incompleta.
- No apto para produccion sin una evaluacion propia previa: procede de un tutorial y no de un pipeline de publicacion maduro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aricode00x/qwen3-finetuned
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Tutorial de entrenamiento de Hugging Face: https://huggingface.co/docs/transformers/en/training
- Dataset de ajuste: https://huggingface.co/datasets/karthiksagarn/astro_horoscope
- Cuaderno de fine-tuning del autor: https://github.com/ar-to/devML/blob/master/hugging_face/fine-tuning_horoscope.ipynb
