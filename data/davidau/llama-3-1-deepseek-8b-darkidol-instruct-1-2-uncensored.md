# DavidAU/Llama-3.1-DeepSeek-8B-DarkIdol-Instruct-1.2-Uncensored

## Resumen

Llama-3.1-DeepSeek-8B-DarkIdol-Instruct-1.2-Uncensored es un modelo de lenguaje de 8.030.261.248 parámetros (~8B) publicado por el usuario DavidAU en Hugging Face el 4 de marzo de 2025. Se trata de un merge/fine-tune que combina dos linajes: por un lado, el modelo base aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored (una variante "uncensored" de Llama 3.1 8B Instruct) y, por otro, el adaptador LoRA DavidAU/LORA-DeepSeek-R1-Distill-Llama-8B-rank-128-INSTRUCT-adapter, derivado de DeepSeek-R1-Distill-Llama-8B. El objetivo es incorporar capacidades de razonamiento explícito (chain-of-thought, "thinking") y reducir el alineamiento restrictivo del modelo original.

El modelo se distribuye en formato safetensors de precisión completa (repo de 16,1 GB) y está pensado como fuente para generar cuantizaciones GGUF, GPTQ, EXL2, AWQ o HQQ. La model card menciona soporte de contexto de 128k heredado de Llama 3.1, aunque el autor remite a la documentación complementaria para los límites reales de contexto. No se especifican licencia ni idiomas soportados en los metadatos.

Su relevancia es acotada: es un modelo comunitario de nicho (66 descargas y 7 likes en el momento de la consulta), orientado a experimentación con razonamiento y generación sin filtros, no a despliegues de producción con garantías de licencia o evaluación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B), con merge de adaptador LoRA de razonamiento |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k según tags de la model card; límite efectivo no verificado, no disponible |
| Tipos de cuantizacion | safetensors (fp16/bf16 de origen); el autor indica que la fuente sirve para generar GGUF, GPTQ, EXL2, AWQ y HQQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA) y RoPE, entrenado originalmente por Meta con un vocabulario de 128k tokens. Sobre esa base, DavidAU ha aplicado un merge entre el modelo DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored y un adaptador LoRA de rango 128 destilado de DeepSeek-R1-Distill-Llama-8B, cuyo propósito es transferir patrones de razonamiento en cadena (chain-of-thought) y modo "thinking".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en este merge concreto. La model card no documenta hiperparámetros del merge ni metodología de evaluación; se limita a remitir a documentos externos del autor sobre ajuste de parámetros y samplers, y a la ficha del repositorio GGUF asociado. No se describen innovaciones técnicas adicionales más allá de la combinación de razonamiento destilado con un modelo "uncensored".

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo "thinking" y chain-of-thought, heredado del linaje DeepSeek-R1.
- Razonamiento matemático y lógico básico, derivado del adaptador destilado de R1.
- Generación de código a nivel de modelo de 8B, sin datos específicos de rendimiento publicados.
- Soporte de plantillas de chat tipo Hermes/DeepHermes según los tags de la model card.
- Generación sin filtros de alineamiento ("uncensored"), orientada a contenido que los modelos estándar rechazan.
- Capacidades multilingües: no documentadas; no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y multi-step reasoning: no documentado formalmente; el modo thinking es el único indicio.

## Casos de uso

- Experimentación con razonamiento en cadena: el modelo permite probar flujos de "thinking" antes de la respuesta final en un tamaño de 8B, adecuado para prototipos en una sola GPU consumer.
- Investigación sobre alineamiento y censura: al ser una variante "uncensored", sirve para estudiar cómo cambia el comportamiento del modelo al eliminar filtros, comparándolo con Llama 3.1 8B Instruct estándar.
- Generación de datos sintéticos para fine-tuning: su naturaleza sin filtros permite producir datasets de conversación que los modelos alineados rechazarían, útil en investigación de datasets.
- Creación de cuantizaciones: el repo se publica en safetensors de precisión completa precisamente para generar GGUF, GPTQ, EXL2, AWQ o HQQ; es un caso de uso explícito del autor.
- Desarrollo de personajes y roleplay: la combinación de contexto largo declarado (128k) y ausencia de filtros encaja con aplicaciones de rol conversacional de sesiones extensas.
- Prototipado local de asistentes conversacionales: con ~8B parámetros puede ejecutarse en GPUs consumer mediante llama.cpp u Ollama, sirviendo para validar interfaces antes de migrar a modelos mayores.
- Análisis de textos largos en local: si el contexto de 128k se confirma operativo, permite resumir o extraer información de documentos extensos en hardware modesto, aunque sin garantías de calidad evaluada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de KV cache; en la práctica 18-20 GB.
- Cuantización de 8 bits: ~8-9 GB de VRAM; cuantización de 4 bits (Q4_K_M en GGUF): ~5-6 GB de VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado o cuantizaciones de 8 bits con contexto amplio.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) usando cuantizaciones de 4-5 bits.
- Opciones de despliegue: transformers (formato nativo), llama.cpp y Ollama (vía GGUF del repo asociado), vLLM y TGI (el tag text-generation-inference y endpoints_compatible aparecen en los metadatos), así como GPTQ/EXL2/AWQ/HQQ generados a partir de la fuente.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-DeepSeek-8B-DarkIdol-Instruct-1.2-Uncensored | ~8B | 128k (declarado) | Thinking/CoT por LoRA destilado de R1 | no disponible | Hugging Face (66 descargas) |
| DeepSeek-R1-Distill-Llama-8B | ~8B | 128k (heredado de Llama 3.1) | CoT nativo del destilado | licencia del modelo base (MIT según su ficha original; verificar) | Hugging Face, ampliamente distribuido |
| Llama-3.1-8B-Instruct | ~8B | 128k | Sin modo thinking nativo | Llama 3.1 Community License | Hugging Face, Meta |
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored | ~8B | 128k (heredado) | No documentado | no disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial; no debe desplegarse en producción sin aclarar la licencia, especialmente por la herencia de Llama 3.1 Community License y del modelo DarkIdol.
- Modelo "uncensored": la ausencia de filtros implica riesgo elevado de generar contenido dañino, ofensivo o ilegal; requiere moderación externa en cualquier uso con usuarios finales.
- Riesgo de alucinación: es un merge de un modelo de 8B con un adaptador LoRA; no hay evaluación publicada que valide la fidelidad de sus razonamientos.
- El modo "thinking" puede producir cadenas de razonamiento incorrectas con apariencia de solidez, un problema conocido en destilados de R1 de tamaño pequeño.
- Contexto de 128k declarado pero no verificado: el rendimiento en ventanas muy largas puede degradarse; el autor remite a documentación externa para los límites reales.
- Idiomas no documentados: no hay garantía de calidad fuera del inglés.
- Sin benchmarks ni evaluación independiente: no hay datos objetivos para comparar su calidad con Llama 3.1 8B Instruct o DeepSeek-R1-Distill-Llama-8B.
- Proyecto comunitario de un solo autor con muy poca tracción (66 descargas, 7 likes): sin garantías de mantenimiento, soporte ni actualizaciones.
- La model card contiene principalmente instrucciones de configuración de samplers y enlaces promocionales; la documentación técnica sobre el entrenamiento es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.1-DeepSeek-8B-DarkIdol-Instruct-1.2-Uncensored
- Repositorio GGUF asociado: https://huggingface.co/DavidAU/Llama-3.1-DeepSeek-8B-DarkIdol-Instruct-1.2-Uncensored-gguf
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Modelo base DarkIdol: https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored
- Adaptador LoRA de razonamiento: https://huggingface.co/DavidAU/LORA-DeepSeek-R1-Distill-Llama-8B-rank-128-INSTRUCT-adapter
- Perfil del autor: https://huggingface.co/DavidAU
