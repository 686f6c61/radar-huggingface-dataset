# linda1476/Gemma4-E4B-RP-RLAIF_Pubilc

## Resumen

Gemma4-E4B-RP-RLAIF (Aetheria) es un ajuste fino QLoRA del modelo base `google/gemma-4-e4b-it` de Google, desarrollado por el autor independiente linda1476 para el rol de personaje (character roleplay) en coreano. El modelo se entrena con un pipeline de RLAIF-lite basado en una constitución de 10 cláusulas que regulan la consistencia del personaje, la prohibición de suplantar al usuario y la confidencialidad, entre otros criterios. Los datos de entrenamiento son diálogos sintéticos multi-turno generados a partir de 240 tarjetas de personaje y filtrados mediante un proceso de evaluación constitucional.

El resultado es un modelo de 7,5 mil millones de parámetros (pesos completos en safetensors) con una ventana de contexto de 8.000 tokens, disponible también en formato GGUF Q4_K_M para ejecución local con Ollama o llama.cpp. La model card incluye una evaluación honesta que concluye que el ajuste fino no supera al modelo base en calidad de roleplay percibida (22,8 % de victorias en comparación pareada), y el propio autor recomienda usar el base para uso en producción. El valor del proyecto reside en demostrar un pipeline de datos sintéticos y evaluación automática con un coste total de unos 12 dólares en créditos de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, base `google/gemma-4-e4b-it`) con adaptador LoRA (r16/α32) |
| Parametros totales | 7.518.069.290 (pesos completos en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | 8.192 tokens (8k, según el entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 5.335.275.744 bytes) |
| Idiomas soportados | Coreano (entrenado específicamente para roleplay en coreano) |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, la variante E4B de Gemma 4, que según la documentación de Google es un modelo de 4.400 millones de parámetros con entrada multimodal y modo de pensamiento (Thinking Mode). El ajuste se realizó con QLoRA (rank 16, alpha 32) sobre el adaptador, con una tasa de aprendizaje de 6e-5, 1,5 épocas y una ventana de contexto de 8.192 tokens, en una A100-80GB durante unos 10 minutos usando la librería Unsloth.

El pipeline de datos sigue un proceso de cuatro fases: síntesis de diálogos a partir de 240 tarjetas de personaje (4 presets) con trampas de prueba integradas (suplantación del usuario, preguntas sobre secretos, contradicciones de contexto); evaluación constitucional con 10 cláusulas que rechazó el 70 % de los diálogos iniciales; reescritura de las 762 turnos que violaban la constitución; y finalmente el ajuste supervisado (SFT). Posteriormente se convirtió el modelo a GGUF Q4_K_M con llama.cpp en un commit fijado. El autor no aplicó DPO final porque los pesos de un intento de DPO no se cargaron correctamente, lo que el propio pipeline de evaluación detectó como una regresión.

## Capacidades

- Generación de texto en coreano para roleplay de personajes, manteniendo coherencia de carácter y estilo narrativo.
- Conversación multi-turno con contexto de hasta 8.000 tokens.
- Soporte del formato de chat de Gemma 4 (alternancia user/assistant) y compatibilidad con el endpoint OpenAI-compatible de Ollama.
- Integración con Ollama mediante GGUF y `Modelfile` incluido.
- Acepta parámetros de generación estándar (temperatura, top_k, top_p).
- Capacidades del base Gemma 4 E4B (multimodal, thinking) no están garantizadas en este ajuste; el autor recomienda el base para uso real.

## Casos de uso

- Roleplay de personajes en coreano: el modelo está afinado con tarjetas de personaje en formato de producción de la app Aetheria, lo que lo hace adecuado para chat con personajes ficticios en coreano con coherencia de contexto.
- Prototipado rápido de asistentes conversacionales: dado su pequeño tamaño y el formato GGUF, puede desplegarse en una GPU consumer para pruebas de concepto de agentes conversacionales.
- Evaluación de pipelines de datos sintéticos: el proyecto demuestra cómo medir la calidad de datos y detectar regresiones en modelos afinados, útil como referencia para investigadores.
- Experimentos de alineación constitucional: la constitución de 10 cláusulas y el pipeline de juicio-reescritura pueden servir de plantilla para proyectos similares.
- Despliegue educativo: su bajo coste de entrenamiento (~12 USD) lo hace accesible para demostraciones de fine-tuning en entornos académicos.
- Inferencia local en equipos de consumo: con el GGUF Q4_K_M de 5,3 GB, se puede ejecutar en una GPU de 8 GB con Ollama, ideal para demos sin infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación propia sobre 50 escenarios de retención, medidos 4 veces (200 pares), con un rubric de 20 puntos basado en la constitución:

| Medida | FT | Base E4B |
|---|---|---|
| 1ª ronda (1 voto) | 19.04 / hard fail 20 % | 18.72 / 24 % |
| 2ª ronda (1 voto) | 18.58 / 22 % | 18.88 / 22 % |
| 3ª ronda (2 votos) | 18.36 / 32 % | 18.40 / 36 % |
| 4ª ronda (2 votos) | 18.20 / 36 % | 18.40 / 30 % |

La diferencia pareada en 200 pares es de −0,06 ± 0,25 (IC 95 %), lo que indica que el modelo afinado es estadísticamente equivalente al base según el rubric constitucional. En una evaluación de preferencia pareada (A/B) con doble voto coincidente, el modelo afinado ganó en 38 de 200 pares (22,8 %, Wilson IC 95 % 17,1–29,7 %), mientras que el base ganó en 129. El autor concluye que la calidad general de roleplay (capacidad de respuesta y naturalidad) es superior en el base, atribuyéndolo a una destilación descendente de los datos sintéticos de baja prosa.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 5,3 GB, por lo que cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060/3070, RTX 4060 Ti, RTX 2080 Ti). El modelo base completo en safetensors requiere más VRAM (aproximadamente 15 GB para fp16).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M con contexto de 8k; A100-80GB para el entrenamiento (el autor usó A100-80GB durante 10 minutos).
- Opciones de despliegue: Ollama (con el comando `ollama run hf.co/linda1476/Gemma4-E4B-RP-RLAIF_Pubilc`), llama.cpp para GGUF, y cualquier servidor compatible con el formato GGUF (p. ej., llama-cpp-python, text-generation-webui).
- Latencia y rendimiento: no se han publicado cifras de throughput, pero en una GPU consumer de 8 GB con Q4_K_M se espera una generación en tiempo real para uso interactivo (típico de modelos de ~5 GB en llama.cpp).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma4-E4B-RP-RLAIF (este) | 7,5 B (peso total) / 4,4 B (base) | 8k | Gemma Terms of Use | Fine-tune coreano para roleplay; no supera al base |
| Gemma 4 E4B (base) | 4,4 B | no disponible (se estima 8k+) | Gemma Terms of Use | Modelo multimodal con Thinking Mode; recomendado por el autor para uso real |
| Gemma 4 31B | 31 B | no disponible | Gemma Terms of Use | Tamaño superior para mayor capacidad, pero requiere más VRAM |

La comparativa se limita a la familia Gemma 4 porque la información disponible no cita otros modelos de roleplay coreano comparables. No hay datos de otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo no supera al base Gemma 4 E4B en calidad de roleplay general según la evaluación pareada del propio autor (22,8 % de victorias). Para uso en producción se recomienda el modelo base.
- El modelo se entrenó con datos sintéticos de baja calidad de prosa (descenso de calidad por destilación), lo que afecta a la naturalidad de las respuestas.
- La evaluación constitucional está saturada: el rubric de 10 cláusulas alcanza el techo (18,8/20) tanto en el base como en el fine-tune, por lo que no detecta diferencias de calidad.
- El pipeline detectó regresiones en el proceso (1ª ronda con hard fail del 36 %, colapso en la conversión GGUF, pesos de DPO no cargados), lo que evidencia la sensibilidad a la calidad de los datos y al proceso de conversión.
- El modelo está optimizado para coreano; no se reporta su comportamiento en otros idiomas.
- La licencia Gemma Terms of Use impone restricciones de uso prohibido (Gemma Prohibited Use Policy) que deben revisarse antes de un despliegue comercial.
- El contexto de 8k es limitado para conversaciones muy largas de roleplay; puede perder coherencia en diálogos extensos.
- El uso de la plantilla de chat de Gemma 4 requiere una alternancia estricta user/assistant; para empezar con un mensaje del asistente es necesario insertar un turno de usuario vacío.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/linda1476/Gemma4-E4B-RP-RLAIF_Pubilc
- Modelo base Gemma 4 E4B: https://huggingface.co/google/gemma-4-E4B
- Modelo Gemma 4 31B: https://huggingface.co/google/gemma-4-31B
- Documentación de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Guía de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
