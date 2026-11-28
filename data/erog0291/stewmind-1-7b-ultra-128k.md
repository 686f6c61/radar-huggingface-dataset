# Erog0291/stewmind-1.7b-ultra-128k

## Resumen

StewMind 1.7B ULTRA 128K es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario Erog0291. El modelo parte de los pesos base de Qwen3-1.7B, les fusiona un adaptador LoRA denominado MUTYINT mediante aritmética directa de tensores y, a continuación, aplica un escalado de RoPE con YaRN de factor x4 para extender la longitud de contexto de 40.960 a 131.072 tokens. El resultado se distribuye en formato safetensors sin necesidad de cargar PEFT por separado.

El interés del modelo reside en su propuesta de ventana de contexto larga sobre una arquitectura pequeña (1.720.574.976 parámetros), lo que teóricamente permitiría procesar documentos extensos en hardware de consumo. Los idiomas declarados son inglés, hausa, igbo, yoruba y pidgin nigeriano, lo que sugiere un enfoque hacia el multilingüismo africano junto con el inglés.

No obstante, la propia model card es explícita sobre las limitaciones: la tabla de recuperación en contexto largo registra "no" en todas las longitudes evaluadas (desde 4.000 hasta 131.000 tokens), es decir, el modelo no recuperó correctamente el código de prueba en ninguna de ellas. Además, no se han publicado resultados de MMLU, GSM8K ni MMMU. La ficha debe leerse, por tanto, como una descripción técnica del artefacto y no como una validación de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con escalado RoPE YaRN x4 |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (config); contexto nativo base 40.960 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, ha, ig, yo, pcm |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA ya fusionado en los pesos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-1.7B, un modelo denso de aproximadamente 1.700 millones de parámetros. Sobre esa base, el autor ha realizado dos operaciones documentadas: (1) la fusión del adaptador LoRA MUTYINT directamente en los tensores del modelo mediante aritmética de tensores, de modo que no se requiere PEFT para la carga, y (2) la aplicación de escalado YaRN con factor x4 sobre las frecuencias RoPE, lo que eleva la ventana de contexto declarada de 40.960 a 131.072 tokens.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la configuración exacta del adaptador MUTYINT (rango, alpha, capas objetivo). La innovación declarada es, por tanto, la combinación de fusión de LoRA y extensión de contexto por YaRN, pero no se aportan métricas que demuestren que la extensión funcione en la práctica: la propia tabla de recuperación del autor marca "no" en todas las longitudes probadas.

## Capacidades

- Generación de texto autoregresiva en inglés y en lenguas africanas (hausa, igbo, yoruba, pidgin nigeriano).
- Ventana de contexto declarada de 131.072 tokens, aunque sin evidencia publicada de recuperación efectiva a largas distancias.
- Razonamiento y generación de código heredados de la base Qwen3-1.7B (no verificados en este ajuste).
- Soporte multilingüe limitado a los cinco idiomas declarados; no se documentan otros.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícito (thinking mode) en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Procesamiento de documentos largos en inglés: el modelo declara 131.072 tokens de contexto, lo que permitiría en teoría ingerir informes o contratos extensos en una sola pasada; sin embargo, la falta de recuperación verificada obliga a validar el caso de uso antes de producción.
- Asistencia multilingüe en África occidental: al cubrir hausa, igbo, yoruba y pidgin nigeriano, puede emplearse en tareas de generación y resumen para comunidades lingüísticas desatendidas por modelos mayores.
- Prototipado en hardware de consumo: con 1.700 millones de parámetros y pesos safetensors, es viable ejecutarlo en GPU de gama media para experimentación rápida.
- Generación de texto y código en entornos con recursos limitados: adecuado para pipelines de bajo coste donde no se requiere un modelo de gran escala.
- Investigación sobre extensión de contexto: sirve como caso de estudio de la técnica YaRN aplicada a un modelo pequeño, útil para comparar metodologías de escalado de RoPE.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y en safetensors, puede servir como base para ajustes específicos de dominio en las lenguas soportadas.

## Benchmarks y rendimiento

La model card incluye una tabla de recuperación en contexto largo, pero todos los resultados son negativos:

| Contexto (tokens) | Código recuperado | Latencia |
|---|---|---|
| 4.000 | no | 12,4 |
| 32.000 | no | no disponible |
| 64.000 | no | no disponible |
| 100.000 | no | no disponible |
| 131.000 | no | no disponible |

El autor declara explícitamente que no hay resultados de MMLU, GSM8K ni MMMU. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,4 GB solo para pesos (1.720.574.976 parámetros x 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,7-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1-1,2 GB para pesos.
- La caché KV a 131.072 tokens es el factor limitante: incluso con un modelo pequeño, la memoria de atención crece linealmente con la longitud de contexto y puede superar la de los pesos en configuraciones largas.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para contextos completos sin cuantizar; RTX 3060/4060 Ti (8-16 GB) para contextos moderados en cuantización.
- Cabe en GPU de consumo en cuantización 4/8 bits para contextos cortos o medios.
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers con soporte Qwen3; para cuantización habría que generar GGUF (llama.cpp/Ollama) o usar vLLM/TGI con pesos convertidos. No se distribuyen variantes GGUF en el repo.
- Latencia y throughput: no disponibles salvo el dato aislado de 12,4 (unidades no especificadas) a 4.000 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StewMind 1.7B ULTRA 128K | 1,72 B | 131.072 (declarado) | Apache 2.0 | safetensors en HF |
| Qwen3-1.7B (base) | ~1,7 B | 40.960 (nativo) | Apache 2.0 | HF, múltiples formatos |
| Qwen2.5-1.5B | ~1,5 B | 32.768 (nativo) | Apache 2.0 | HF, GGUF, amplia adopción |
| Llama 3.2 1B | ~1,2 B | 128.000 | Llama 3.2 Community | HF, GGUF, amplia adopción |

La comparación se limita a especificaciones declaradas; no hay datos de rendimiento publicados para StewMind que permitan contrastar calidad frente a la base Qwen3-1.7B ni frente a alternativas. La ventaja diferencial sería el contexto extendido y el multilingüismo africano; la desventaja, la ausencia de validación y de formatos cuantizados listos para usar.

## Limitaciones y advertencias

- La recuperación en contexto largo falló en todas las longitudes evaluadas por el propio autor; no debe asumirse que la ventana de 131.072 tokens funcione para tareas de retrieval.
- No hay benchmarks de calidad (MMLU, GSM8K, HumanEval, MMMU) publicados; el rendimiento real es desconocido.
- El ajuste LoRA MUTYINT no está documentado en detalle (datos, hiperparámetros, objetivo), lo que dificulta evaluar qué se modificó respecto a la base.
- Riesgo de alucinación inherente a un modelo de 1,7 B; mayor en contextos largos y en lenguas de bajos recursos.
- Sesgos no evaluados; los idiomas africanos incluidos tienen cobertura de datos desigual, lo que puede producir respuestas de calidad heterogénea.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Solo se publican pesos safetensors: no hay GGUF, AWQ ni GPTQ, lo que añade trabajo de conversión para despliegue en producción.
- El nombre del repo ("128k") y el de la model card ("131K") no coinciden exactamente; conviene verificar la configuración real antes de confiar en la longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Erog0291/stewmind-1.7b-ultra-128k
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de YaRN (extensión de contexto por RoPE scaling): https://arxiv.org/abs/2309.00071
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de transformers sobre Qwen3: https://huggingface.co/docs/transformers/model_doc/qwen3
