# Shan072/Llama-Unsealed-8B

## Resumen

Llama-Unsealed-8B es un adaptador LoRA publicado por el usuario Shan072 sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, es decir, una versión cuantizada a 4 bits del Meta Llama 3.1 8B Instruct afinada con Unsloth. El adaptador está orientado a tareas de escritura asistida y generación aumentada por recuperación (RAG) en el dominio del «adoptee rights», la adopción forzada y la separación familiar, según indican sus etiquetas y el dataset asociado `Shan072/Llama-Unsealed-library`.

El modelo no introduce una arquitectura nueva: hereda el transformer decoder-only de Llama 3.1 8B con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens. Lo relevante del artefacto es su carácter de ajuste fino ligero (PEFT/LoRA) sobre un modelo Instruct ya cuantizado, lo que lo hace desplegable en hardware modesto y útil para prototipos de asistentes conversacionales especializados en un nicho documental concreto.

Se trata de un modelo con escasa tracción pública (0 descargas, 0 likes en el momento de la consulta), acceso restringido mediante gating en Hugging Face y licencia Llama 3.1, lo que condiciona su uso comercial. Su interés es fundamentalmente experimental y de nicho, no como alternativa generalista a los modelos Instruct de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste LoRA sobre base cuantizada a 4 bits |
| Parametros totales | 8.030 millones (modelo base Llama 3.1 8B); el adaptador LoRA añade un conjunto reducido de pesos entrenables (tamaño exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit, bitsandbytes); el adaptador se distribuye en safetensors; cuantizaciones adicionales del conjunto fusionado: no disponibles |
| Idiomas soportados | Inglés (según ficha del modelo); el modelo base Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base referenciado está en formato cuantizado bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se construye sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA), RoPE y normalización RMSNorm, preentrenado por Meta con aproximadamente 15 billones de tokens según la documentación oficial de la familia Llama 3.1. El modelo base Instruct incorpora un pipeline de post-entrenamiento con SFT, rechazo de muestras y DPO, además de soporte nativo de tool calling y un modo de razonamiento ligero mediante etiquetas especiales.

El ajuste específico de este repositorio se realizó con Unsloth sobre la variante `bnb-4bit` del modelo Instruct, es decir, QLoRA sobre pesos cuantizados a 4 bits. No se especifican en la información disponible el número de pasos de entrenamiento, la composición exacta del dataset `Shan072/Llama-Unsealed-library`, la configuración de hiperparámetros (rank, alpha, dropout) ni si hubo fases adicionales de alineación. El tamaño del repositorio (0,4 GB) es coherente con un adaptador LoRA de rango moderado más los ficheros de configuración, no con un modelo completo fusionado.

No se documentan innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento y reducir el consumo de memoria del ajuste sobre pesos cuantizados. No hay información sobre decodificación especulativa, atención lineal ni modificaciones arquitectónicas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct de Llama 3.1 8B.
- Escritura asistida y redacción de documentos orientados a narrativas personales, testimonios y material de apoyo en el ámbito de la adopción y los derechos del adoptado.
- Generación aumentada por recuperación (RAG): el modelo está etiquetado explícitamente para este uso, lo que sugiere un ajuste orientado a responder sobre un corpus documental propio.
- Soporte de tool calling y function calling heredado del modelo base Llama 3.1 Instruct (no verificado tras el ajuste LoRA).
- Razonamiento multi-paso y uso como agente: capacidad heredada del base, sin garantías específicas tras el ajuste.
- Capacidades multilingües limitadas: la ficha declara únicamente inglés, aunque el base soporta ocho idiomas.
- No se declaran capacidades de visión, audio ni modo «thinking» explícito.

## Casos de uso

- Asistente de escritura para personas adoptadas: el modelo puede ayudar a redactar testimonios, cartas de búsqueda de orígenes o narrativas personales, aprovechando el ajuste sobre el dominio de adopción y registros sellados.
- Sistema RAG sobre documentación legal y testimonial: integrado con una base vectorial de documentos sobre derechos del adoptado, el modelo puede responder preguntas citando el contexto recuperado, gracias a la ventana de 128.000 tokens que permite inyectar muchos fragmentos.
- Prototipado rápido de chatbots de nicho: al ser un adaptador LoRA sobre una base 4-bit, se puede cargar en una GPU de consumo para validar flujos conversacionales antes de invertir en modelos mayores.
- Apoyo a investigadores y activistas: generación de resúmenes y borradores de material divulgativo sobre separación familiar y adopción forzada, con la cautela de revisión humana por el riesgo de alucinación en temas sensibles.
- Fine-tuning incremental: el adaptador sirve como punto de partida para nuevos ajustes LoRA con Unsloth sobre el mismo dominio, al mantener la base cuantizada y un adaptador separable.
- Experimentación académica en PEFT: útil como caso de estudio de QLoRA sobre Llama 3.1 8B Instruct con un dataset temático pequeño y un pipeline Unsloth reproducible.
- Asistente conversacional de acompañamiento (con supervisión): conversaciones multi-turno con contexto largo para usuarios que reconstruyen su historia familiar, siempre con derivación a profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0,4 GB; el consumo real viene determinado por el modelo base.
- Para cargar la base en 4 bits (bnb-4bit) se estiman en torno a 5-6 GB de VRAM, más overhead de activaciones y del adaptador.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4, A100 40 GB o H100 para mayor throughput y contextos largos.
- Cabe en GPUs de consumo con al menos 8 GB de VRAM si se usa la base cuantizada a 4 bits y contextos moderados; con contexto completo de 128.000 tokens los requisitos de memoria crecen notablemente.
- Opciones de despliegue: transformers + PEFT, vLLM (con soporte LoRA), TGI, llama.cpp/Ollama si se fusiona y convierte el modelo a GGUF (no se distribuye en ese formato).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Shan072/Llama-Unsealed-8B | 8B (LoRA sobre 4-bit) | 128.000 | Llama 3.1 | Gated en HF | Ajuste de nicho, sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 | Gated en HF | Modelo base de referencia, con benchmarks oficiales |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 | Apache 2.0 | Abierto | Alternativa generalista con licencia permisiva |
| Qwen2.5-7B-Instruct | 7,6B | 128.000 | Apache 2.0 | Abierto | Multilingüe, con tool calling y benchmarks publicados |

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas; el rendimiento real del ajuste frente al base es desconocido.
- Riesgo elevado de alucinación en un dominio sensible (adopción, derechos legales, historiales familiares); requiere revisión humana y fuentes verificables.
- El ajuste puede degradar capacidades generales del base (olvido catastrófico) al haberse entrenado sobre un dataset temático pequeño.
- Idiomas: la ficha declara solo inglés; el uso en castellano no está garantizado aunque el base lo soporte.
- Licencia Llama 3.1 Community License: impone restricciones (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable); no es una licencia de código abierto permisiva.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración automatizada.
- Tracción nula (0 descargas, 0 likes) y autor sin historial verificado: no hay evidencia comunitaria de calidad ni mantenimiento.
- El adaptador depende de una base concreta cuantizada a 4 bits (`unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`); mezclarlo con otras variantes puede requerir conversión o fusión previa.
- No apto para producción sin una evaluación propia sobre el dominio objetivo y sin filtros de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shan072/Llama-Unsealed-8B
- Dataset asociado: https://huggingface.co/datasets/Shan072/Llama-Unsealed-library
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original Meta Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- PEFT (repositorio): https://github.com/huggingface/peft
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
