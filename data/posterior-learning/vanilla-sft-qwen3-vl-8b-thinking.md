# posterior-learning/vanilla-sft-qwen3-vl-8b-thinking

## Resumen

vanilla-sft-qwen3-vl-8b-thinking es un modelo multimodal de tipo image-text-to-text publicado por el usuario posterior-learning. No se trata de un entrenamiento desde cero, sino de un merge de un adaptador LoRA sobre el modelo base Qwen/Qwen3-VL-8B-Thinking, desarrollado originalmente por el equipo Qwen de Alibaba. El adaptador fusionado es richmondsin/vanilla-sft-qwen3-vl-8b-thinking, un ajuste supervisado (SFT) de caracter vanilla, es decir, sin tecnicas adicionales de alineamiento declaradas.

El modelo conserva la arquitectura Qwen3-VL, con 8.767.123.696 parametros totales (8,77 mil millones) y formato de pesos safetensors en bf16, lo que resulta en un repositorio de 17,5 GB. Al mantener intactos config, tokenizer, chat template y processor del modelo base, hereda las capacidades multimodales y el modo thinking de Qwen3-VL-8B-Thinking, pero con los pesos modificados por el SFT.

Su relevancia es acotada: se trata de un artefacto derivado con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni datos de evaluacion publicados. Resulta util como referencia de un pipeline de merge LoRA reproducible y verificado, mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (image-text-to-text), derivada de Qwen/Qwen3-VL-8B-Thinking |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el modelo base admite cuantizaciones habituales, pero no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16); repo de 17,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3-VL, con 8,77 mil millones de parametros, orientado a tareas de image-text-to-text y con modo thinking heredado del base. El proceso de construccion no es un entrenamiento completo: se parte de Qwen/Qwen3-VL-8B-Thinking y se fusiona el adaptador LoRA richmondsin/vanilla-sft-qwen3-vl-8b-thinking, con rango r=16 y lora_alpha=32, aplicando la regla `W <- W + (lora_alpha / r) * B @ A` (escala 2,0) en fp32 y almacenando el resultado en bf16.

Se fusionaron 252 modulos; el resto de tensores son byte-identicos al base. Los ficheros no ponderados (config, tokenizer, chat template, processor configs, generation config) se conservan sin cambios. El autor declara verificaciones en MERGE-REPORT.json: 3 modulos aleatorios dentro del redondeo bf16 respecto a W + s*B@A, 498 tensores byte-identicos y un total de bytes de tensores igual al del base (17.534.247.392). No se especifican datos de entrenamiento del adaptador (numero de tokens, composicion del dataset, uso de RLHF o DPO).

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes y texto (pipeline image-text-to-text).
- Modo thinking heredado de Qwen3-VL-8B-Thinking, orientado a razonamiento multi-paso antes de responder.
- Conversacion multi-turno segun el chat template del base (sin modificaciones).
- Procesamiento de imagenes mediante el processor del modelo base.
- Capacidades de codigo y matematicas: no verificadas en esta ficha, dependen del base y del SFT aplicado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Evaluacion de pipelines de merge LoRA: sirve como caso reproducible para validar la regla de fusion, la escala y la verificacion byte a byte de tensores no afectados, util en equipos de MLOps que automatizan merges.
- Prototipado de asistentes visuales: al heredar el pipeline image-text-to-text, permite construir demos de pregunta-respuesta sobre imagenes con el chat template original del base.
- Investigacion sobre SFT vanilla: comparar este merge con el base Qwen3-VL-8B-Thinking permite aislar el efecto de un ajuste supervisado sin tecnicas adicionales de alineamiento.
- Base para cuantizacion y despliegue ligero: al estar en safetensors bf16, puede convertirse a GGUF u otros formatos para inferencia en hardware limitado, aunque dichas conversiones no estan publicadas.
- Reproduccion de experimentos: el hash sha256 del adaptador (814c5ce2...) y el informe de merge permiten auditar la procedencia de los pesos en entornos de investigacion.
- Formacion y docencia: ejemplo didactico de como se documenta un merge LoRA con verificaciones cuantitativas (252 modulos fusionados, 498 tensores identicos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 17,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para inferencia comoda.
- Cuantizacion a 8 bits: alrededor de 9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: alrededor de 4,5-5 GB de pesos, potencialmente viable en GPUs consumer de 8 GB, con perdida de calidad no evaluada.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para bf16 en single-GPU; RTX 3090/4080 para cuantizaciones.
- Despliegue: transformers es la libreria declarada; vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| posterior-learning/vanilla-sft-qwen3-vl-8b-thinking | 8,77 B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-8B-Thinking (base) | ~8 B | no disponible en esta ficha | la del base (no verificada aqui) | Hugging Face, modelo oficial |
| richmondsin/vanilla-sft-qwen3-vl-8b-thinking (adaptador) | adaptador LoRA r=16 | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado; la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Modelo derivado sin evaluacion publicada: no hay benchmarks que respalden su calidad frente al base.
- El merge en bf16 puede producir diferencias numericas menores respecto a ejecutar base + adaptador en tiempo de ejecucion.
- Licencia no declarada en la informacion disponible: verificar los terminos del modelo base Qwen3-VL-8B-Thinking antes de cualquier uso comercial.
- Idiomas soportados no declarados: la cobertura multilingue depende del base y no esta documentada aqui.
- Longitud de contexto no declarada en esta ficha.
- Riesgo de alucinacion inherente a los modelos generativos multimodales; sin datos de mitigacion especificos.
- Sesgos: no documentados; se heredan los del base y los del dataset de SFT del adaptador, no publicados.
- Repositorio con cero descargas y sin senales de adopcion: no recomendable como dependencia de produccion sin validacion propia.
- Fecha de creacion registrada en 2026-11-11; comprobar vigencia y posibles actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-qwen3-vl-8b-thinking
- Adaptador LoRA fusionado: https://huggingface.co/richmondsin/vanilla-sft-qwen3-vl-8b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
