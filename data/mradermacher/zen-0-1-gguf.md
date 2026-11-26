# mradermacher/zen-0.1-GGUF

## Resumen
zen-0.1 es un modelo de lenguaje de pequeno tamano (176.195.328 parametros, aproximadamente 176 millones) entrenado desde cero y publicado por ZEN-PRODUCT. La version analizada aqui es la cuantizacion GGUF realizada por mradermacher, un colaborador habitual de la comunidad que convierte modelos a formatos ligeros para inferencia local. El modelo se presenta como un "small-language-model" orientado a ingles y con enfasis en razonamiento y matematicas, a juzgar por los datasets de ajuste citados en su model card.

La relevancia de este modelo reside en su tamano reducido: con menos de 200 millones de parametros cabe holgadamente en cualquier GPU de consumo e incluso en CPU, lo que lo hace util para experimentacion, prototipado rapido y despliegues con recursos muy limitados. Sin embargo, la informacion publicada es escasa: no se detalla la arquitectura exacta, la longitud de contexto ni resultados de benchmarks, y la licencia figura como "unverified" (no verificada), lo que introduce incertidumbre para uso comercial.

La ficha se centra en la version GGUF de mradermacher, que ofrece un abanico de cuantizaciones estaticas (desde Q2_K hasta f16) con tamanos de entre 0,2 y 0,5 GB. El modelo base es ZEN-PRODUCT/zen-0.1, distribuido en formato transformers/safetensors.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "llama" y "from-scratch"; no se detalla la arquitectura interna) |
| Parametros totales | 176.195.328 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other / unverified (no verificada) |
| Formato de pesos | GGUF (esta version); safetensors en el modelo base |
| Tamano del repo | 1,7 GB |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento
La model card no especifica la arquitectura interna mas alla de las etiquetas "llama" y "from-scratch", lo que sugiere un transformer decoder-only entrenado desde cero en lugar de un fine-tuning de un modelo existente. No se indica el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa. Tampoco se detalla el volumen total de tokens de entrenamiento ni si hubo fases de RLHF, DPO o similar.

Los datasets citados en la model card incluyen HuggingFaceFW/fineweb-edu y HuggingFaceTB/smollm-corpus como fuentes de preentrenamiento general, jonathanasdf/MathGLM-dataset-500k para matematicas, y varios conjuntos orientados a trazas de razonamiento (Crownelius/Complete-FABLE.5-traces-2M, Claux67/FABLE-5.2-MAX-DATABASE, Jackrong/GLM-5.1-Reasoning-1M-Cleaned, entre otros). Estos ultimos parecen destinados a ajuste supervisado sobre cadenas de razonamiento. No se aportan hiperparametros ni detalles del proceso de ajuste.

## Capacidades
- Generacion de texto conversacional en ingles (etiqueta "conversational").
- Razonamiento de tipo "thinking" o cadenas de razonamiento, a juzgar por los datasets de trazas de razonamiento citados.
- Razonamiento matematico basico, dado el uso de MathGLM-dataset-500k.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso
- Prototipado rapido de chatbots: con menos de 200 millones de parametros, el modelo puede ejecutarse en cualquier portatil para validar flujos conversacionales antes de migrar a modelos mayores.
- Inferencia en dispositivos con recursos muy limitados: las cuantizaciones Q4_K_S y Q4_K_M ocupan unos 0,2 GB, lo que permite desplegarlo en Raspberry Pi, moviles o contenedores con poca memoria.
- Experimentacion educativa: util para estudiar el comportamiento de modelos entrenados desde cero y comparar tecnicas de cuantizacion sin incurrir en costes de GPU.
- Generacion de texto auxiliar en pipelines de datos: puede emplearse para tareas de etiquetado ligero o generacion de borradores donde la calidad no sea critica y el coste por token importe.
- Ajuste fino posterior: al ser un modelo pequeno, es viable hacer fine-tuning completo o LoRA en una unica GPU de consumo para dominios especificos en ingles.
- Pruebas de integracion con llama.cpp u Ollama: sirve como banco de pruebas para validar infraestructura de inferencia local antes de desplegar modelos mas grandes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en todas las cuantizaciones. Q4_K_M ocupa aproximadamente 0,2 GB, Q8_0 unos 0,3 GB y f16 unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La version base (safetensors) puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera una latencia muy baja en hardware moderno.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zen-0.1 (este) | 176 M | no disponible | other / unverified | GGUF y safetensors en HF |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1.1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF |

Los datos de SmolLM, Qwen2.5 y TinyLlama corresponden a sus fichas publicas; no se dispone de comparaciones de rendimiento directas con zen-0.1 porque este no publica benchmarks.

## Limitaciones y advertencias
- La licencia figura como "other / unverified", lo que impide confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de usarlo en produccion.
- Modelo entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Con 176 millones de parametros, la calidad esperada en razonamiento complejo, codigo o matematicas avanzadas es limitada en comparacion con modelos de mayor tamano.
- Riesgo elevado de alucinacion y de respuestas incoherentes en contextos largos o tareas que requieran conocimiento factual preciso.
- No se publican detalles sobre sesgos, composicion del dataset de preentrenamiento ni procesos de alineacion, lo que dificulta evaluar riesgos.
- La longitud de contexto no esta documentada; asumir un contexto corto por defecto.
- La cuantizacion Q3_K_M esta marcada por el autor como de "lower quality"; para uso serio se recomienda Q4_K_M o superior.

## Enlaces
- Modelo GGUF: https://huggingface.co/mradermacher/zen-0.1-GGUF
- Modelo base: https://huggingface.co/ZEN-PRODUCT/zen-0.1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#zen-0.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
