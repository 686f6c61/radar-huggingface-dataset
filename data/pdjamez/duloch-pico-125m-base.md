# pdjamez/Duloch-Pico-125M-Base

## Resumen

Duloch Pico 125M Base es un modelo de lenguaje causal (decoder-only) de pequeño tamaño, desarrollado por pdjamez, entrenado desde cero sobre una parte del corpus FineWeb sample-10BT de Hugging Face. Su principal valor es servir como modelo base compacto para investigación, educación, evaluación de modelos pequeños y experimentos de inferencia con recursos limitados. No está afinado para instrucciones, chat ni alineación, por lo que predice continuaciones de texto sin seguir comandos.

La arquitectura es un transformer causal compatible con la implementación `LlamaForCausalLM` de Transformers, con 125.095.680 parámetros y una ventana de contexto de 512 tokens. Incluye características como attention con cabezas queried agrupadas (GQA), normalización RMSNorm, activación SwiGLU y codificación posicional RoPE. El modelo está disponible en formato safetensors bajo licencia Apache 2.0.

Al ser un modelo base de 125M, no compite en capacidades con modelos grandes, pero resulta útil como punto de partida para fine-tuning, como referencia en estudios de scaling laws, o para probar infraestructuras de inferencia en dispositivos con poca memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal Transformer (LlamaForCausalLM) |
| Parametros totales | 125.095.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no especificado por el autor) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de arquitectura:

| Propiedad | Valor |
|---|---|
| Capas | 18 |
| Hidden width | 768 |
| Cabezas de atencion | 12 |
| Cabezas clave-valor | 2 |
| Dimension de cabeza | 64 |
| Feed-forward width | 2.048 |
| Vocabulario | 20.000 tokens |
| Activacion | SwiGLU |
| Normalizacion | RMSNorm (epsilon 1e-5) |
| Codificacion posicional | RoPE (theta 10.000) |
| Embeddings | Atados (entrada y salida) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con una estructura directamente compatible con la implementación Llama de Hugging Face Transformers. Usa attention con grouped-query attention (GQA), normalización RMSNorm, activación SwiGLU y codificación posicional RoPE. Los embeddings de entrada y salida están atados. No requiere código personalizado ni `trust_remote_code`.

El entrenamiento se realizó con el objetivo de predicción de siguiente token (causal next-token prediction) sobre un subconjunto determinista del dataset `HuggingFaceFW/fineweb`, concretamente la configuración `sample-10BT`. El autor preparó localmente 3.600.000 documentos procedentes de 15 ficheros Parquet, aplicó eliminación exacta de duplicados y filtrado casi-duplicado mediante SimHash de trigramas, quedando una partición final de 3.560.666 documentos. El modelo se entrenó durante 2.501.935.104 tokens, aproximadamente 20 tokens por parámetro aprendido, con una secuencia de entrenamiento de 512 tokens y un batch global de 32.768 tokens.

El entrenamiento se ejecutó en un Apple M3 Ultra Mac Studio con 256 GB de memoria unificada, usando Swift con MLX 0.32.2, durante unas 38 horas. La pérdida de validación final fue de 3.1502, equivalente a una perplejidad aproximada de 23,34. No se aplicaron técnicas como RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto por continuacion (causal language modeling).
- Prediccion de siguiente token en secuencias de hasta 512 tokens.
- Soporte de inferencia con Transformers sin necesidad de codigo personalizado.
- Compatible con cargas en float32, float16 o cuantizaciones genericas derivadas del formato safetensors.
- Uso como modelo base para fine-tuning en tareas especificas.
- Evaluacion zero-shot con el EleutherAI Language Model Evaluation Harness.
- No dispone de soporte de tool calling, function calling o interaccion por agentes.
- No es un modelo de chat ni sigue instrucciones.
- No tiene capacidades de vision, audio o multimodalidad.
- Solo soporta texto en ingles.

## Casos de uso

1. **Investigacion en modelos de lenguaje pequeños**: el modelo permite estudiar el efecto del filtrado de datos, la relacion entre tokens de entrenamiento y perplejidad, o el comportamiento de arquitecturas tipo Llama en escalas muy reducidas.

2. **Educacion en procesamiento del lenguaje natural**: puede usarse como ejemplo practico para ensenar tokenizacion, fine-tuning, evaluacion de modelos base y uso de la libreria Transformers con un modelo muy ligero.

3. **Experimentos de eficiencia en Apple Silicon**: dado que el propio entrenamiento se hizo con MLX, el modelo es adecuado para probar flujos de inferencia local en Macs con Apple Silicon, incluyendo entornos con poca memoria.

4. **Evaluacion de modelos base**: sirve como baseline en suites de evaluacion como las del EleutherAI Harness, permitiendo comparar rapida y economicamente distintos modelos de tamano similar.

5. **Fine-tuning para tareas especificas**: al ser un modelo base, puede afinarse sobre un dataset propio para clasificacion de texto, generacion de resumenes o prediccion de texto en dominios concretos.

6. **Prototipado en entornos con recursos limitados**: para aplicaciones que requieran generacion de texto corta, el modelo puede ejecutarse en CPUs de gama baja o GPUs integradas, haciendo posible prototipar sistemas con restricciones de hardware estrictas.

7. **Pruebas de cuantizacion y optimizacion**: el tamano reducido permite experimentar con cuantizacion, pruning o distillation sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con el EleutherAI Language Model Evaluation Harness en modo zero-shot, precision float32, batch size 32 y limitados a 512 tokens de contexto. Sin token de inicio, usando las particiones completas de cada benchmark.

| Benchmark | Metrica | Resultado | Error estandar | Muestras |
|---|---|---:|---:|---:|
| PIQA | Accuracy normalizada | 62.84% | 1.13% | 1.838 |
| HellaSwag | Accuracy normalizada | 30.80% | 0.46% | 10.042 |
| ARC-Easy | Accuracy normalizada | 37.58% | 0.99% | 2.376 |
| ARC-Challenge | Accuracy normalizada | 24.40% | 1.26% | 1.172 |
| LAMBADA OpenAI | Accuracy | 29.38% | 0.63% | 5.153 |
| LAMBADA OpenAI | Perplexity (menor es mejor) | 49.97 | 1.89 | 5.153 |
| BLiMP | Accuracy | 80.25% | 0.14% | 67.000 |

Estos valores son propios de un modelo base pequeño y no deben interpretarse como indicadores de capacidad factografica, seguimiento de instrucciones o seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125M parametros, alrededor de 0,5 GB en float32, 0,25 GB en float16 y aproximadamente 0,125 GB en INT8. En la practica, con cache KV y overhead, se recomienda un minimo de 1-2 GB de memoria.
- GPU recomendada: cualquier GPU moderna de gama baja (por ejemplo, RTX 3050, RTX 4060, o incluso GPUs integradas) es suficiente. No requiere A100 ni H100.
- Compatibilidad con consumer GPU: si, el modelo cabe en practicamente cualquier GPU de consumo actual.
- Compatibilidad con CPU y Apple Silicon: si, puede ejecutarse en CPU o en Macs con chip M series, siendo especialmente adecuado para este ultimo caso.
- Opciones de despliegue: Transformers con PyTorch, llama.cpp, Ollama, vLLM, Text Generation Inference (TGI) o librerias basadas en MLX como Swift.
- Latencia y throughput: no disponible. No hay datos publicados por el autor.

## Comparativa con modelos similares

En la informacion proporcionada no se incluyen especificaciones de modelos comparables, por lo que no es posible realizar una comparativa directa con datos concretos. Se ha identificado el modelo `jonam-ai/slm-125m-base` como posible referencia del mismo rango de parametros en Hugging Face, pero no se dispone de sus especificaciones ni de sus resultados de benchmarks en los datos disponibles. Por tanto, la comparativa se limita a indicar que no hay datos suficientes para establecerla.

## Limitaciones y advertencias

- El modelo es un modelo base sin ajuste por instrucciones, por lo que no debe usarse como asistente conversacional ni para seguir comandos de forma fiable.
- La ventana de contexto es de solo 512 tokens, lo que limita drasticamente la capacidad de procesar documentos largos o conversaciones extensas.
- El corpus de entrenamiento, FineWeb, procede de rastreos web publicos y puede contener material con copyright, informacion personal, errores factuales, contenido inseguro, sesgos y paginas mal formadas. Aunque se aplico filtrado local de duplicados, estos riesgos persisten.
- El modelo puede alucinar o producir afirmaciones incorrectas; carece de garantias de factualidad y no debe emplearse como autoridad en ningun dominio.
- La licencia Apache-2.0 cubre los pesos del modelo, pero no otorga derechos sobre el contenido de entrenamiento de terceros. Cualquier uso comercial debe revisar las condiciones del dataset FineWeb y las politicas de Common Crawl.
- No se han realizado evaluaciones amplias de sesgos, toxicidad o comportamiento bajo ataques adversariales. Son necesarias evaluaciones adicionales antes de cualquier despliegue en produccion.
- No dispone de soporte para tool calling, agentes, vision ni audio, por lo que no es adecuado para aplicaciones que requieran estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdjamez/Duloch-Pico-125M-Base
- Dataset de entrenamiento FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Resultados de busqueda web adicionales: no disponibles.
