# Alia20me/proxiservice-lora

## Resumen

Proxiservice-lora es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Alia20me en Hugging Face. Se trata de un LoRA entrenado con Unsloth sobre la versión del modelo base ya cuantizada en 4 bits (unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit), lo que permite un entrenamiento aproximadamente el doble de rápido y con menor huella de memoria que un ajuste completo. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens en el modelo original.

El problema que aborda es el de la especialización de un modelo pequeño en un dominio concreto (el nombre sugiere un servicio de proximidad o "proxi-service"), manteniendo la licencia permisiva Apache 2.0 del modelo base. Su relevancia práctica radica en que un modelo de 1,5B puede ejecutarse en hardware de consumo y desplegarse con coste bajo, aunque el ajuste publicado es muy reciente (noviembre de 2026), no tiene descargas ni validación pública y su model card es mínima.

La información disponible es escasa: no se detallan los datos de entrenamiento, hiperparámetros, benchmarks ni el caso de uso exacto. Esta ficha documenta lo que se puede verificar a partir de los metadatos y la model card, y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA sobre base cuantizada en 4 bits |
| Parametros totales | 1.500 millones (heredados de Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado en el ajuste |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); el repo contiene safetensors del adaptador LoRA, no cuantizaciones GGUF publicadas |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 soporta multilingüe, pero el ajuste solo declara "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), librería transformers |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre él se ha aplicado un ajuste supervisado (SFT) mediante LoRA con la librería Unsloth y TRL, partiendo de la variante ya cuantizada en 4 bits con bitsandbytes. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo completo fusionado.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni si hubo fases de DPO o RLHF posteriores. La model card únicamente indica que el entrenamiento fue "2x más rápido con Unsloth". No consta ninguna innovación técnica adicional más allá del propio pipeline de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, con el sesgo de dominio introducido por el ajuste.
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad limitada por el tamaño).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el ajuste).
- Capacidad multilingüe del modelo base (Qwen2.5 cubre decenas de idiomas), aunque el ajuste solo declara inglés.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Clasificación y etiquetado de textos de servicio: un modelo de 1,5B ajustado puede clasificar consultas entrantes por categoría en tiempo real con latencia de milisegundos en GPU de consumo.
- Asistente de atención al cliente de dominio acotado: respuestas multi-turno con contexto de hasta 32K tokens, útil para hilos de conversación largos o documentos de referencia extensos.
- Extracción de entidades y datos estructurados: convertir correos o formularios en JSON mediante prompting y, si el ajuste lo soporta, function calling.
- Generación de respuestas plantilla: redacción de borradores de respuesta para revisión humana en flujos de soporte.
- Prototipado rápido y pruebas A/B de prompts: al ser un adaptador LoRA pequeño, permite iterar y comparar variantes con coste mínimo.
- Despliegue en edge o entornos con poca VRAM: cabe en GPUs de 8 GB o menos con cuantización, lo que permite ejecutarlo en local o en contenedores pequeños.
- Fine-tuning posterior: el adaptador puede servir como punto de partida para especializaciones adicionales con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3-4 GB para los pesos de 1,5B más overhead de contexto y caché KV.
- VRAM estimada en 4 bits: aproximadamente 1,5-2,5 GB, según longitud de contexto y batch.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6-8 GB o más; también en CPU con llama.cpp si se convierte el adaptador a GGUF (no publicado).
- Opciones de despliegue: transformers, TGI (el repo incluye el tag text-generation-inference), vLLM con soporte de adaptadores LoRA, Ollama y llama.cpp tras conversión.
- Latencia y throughput: no disponibles; para un 1,5B en una RTX 4090 se espera un throughput de cientos a miles de tokens por segundo, pero no hay medición publicada para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Alia20me/proxiservice-lora | 1,5B | 32.768 (base) | Apache 2.0 | Ajuste LoRA sin benchmarks ni descargas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community | Alternativa pequeña con contexto mayor |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Alternativa ligera para edge |

El ajuste no aporta datos de rendimiento que permitan compararlo objetivamente con estas alternativas; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar el ajuste.
- Sin descargas ni likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de alucinación inherente a un modelo de 1,5B, especialmente en dominios especializados.
- El ajuste declara únicamente inglés; el rendimiento en castellano no está verificado y probablemente sea inferior al del modelo base.
- El adaptador se entrenó sobre una base cuantizada en 4 bits; fusionarlo con el modelo en FP16 puede introducir divergencias respecto al comportamiento entrenado.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor no ofrece garantías ni soporte.
- No hay cuantizaciones GGUF ni versiones fusionadas publicadas, lo que añade trabajo de conversión para despliegue en llama.cpp u Ollama.
- El nombre sugiere un dominio concreto ("proxiservice") sin que se especifique su alcance, por lo que no se recomienda usarlo en producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Alia20me/proxiservice-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
