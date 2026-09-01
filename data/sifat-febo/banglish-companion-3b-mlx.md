# sifat-febo/banglish-companion-3b-mlx

## Resumen

Banglish Companion 3B MLX es un modelo de lenguaje conversacional desarrollado por Sifat Febo, especializado en "banglish", la variante del bengalí escrita con alfabeto latino (romanización fonética). Está basado en el modelo Ministral-3-3B-Base-2512 de Mistral AI y ha sido afinado adicionalmente con conversaciones en banglish. Su objetivo principal es responder en el mismo registro y estilo en que el usuario escribe, manteniendo respuestas cortas y cercanas a la pregunta, sin largas disertaciones. El modelo está optimizado para ejecutarse localmente en Macs con Apple Silicon mediante la librería MLX, ocupando unos 3,6 GB y sin necesidad de conexión a internet ni cuenta. Es relevante porque aborda un idioma de bajos recursos (bengalí) en su forma escrita más común en línea, con una solución ligera y privada. El checkpoint subido tiene 964,5 millones de parámetros (aunque el modelo base declara 3B), con cuantización de 8 bits y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Ministral-3-3B) |
| Parametros totales | 964.525.056 (checkpoint subido; el modelo base Ministral-3-3B tiene 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base tiene 32K, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Banglish (bengali romanizado), ingles limitado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Ministral-3-3B-Base-2512, un transformer decoder-only de Mistral AI con 3 mil millones de parametros, y ha sido afinado con conversaciones en banglish. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. El autor indica que es una continuacion del modelo banglish-companion de 1.7B, con respuestas mas cortas y mas cercanas a la pregunta. El checkpoint distribuido en este repositorio esta cuantizado a 8 bits para MLX, lo que reduce el tamano a 3,7 GB y permite su ejecucion en Apple Silicon. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en banglish, manteniendo el registro y el estilo del usuario (si el usuario escribe en mayusculas o con jerga, el modelo responde de forma similar).
- Respuestas cortas y directas, evitando explicaciones largas.
- Soporte de conversaciones multi-turno basicas, aunque pierde el hilo en dialogos muy largos.
- Ejecucion completamente local en Apple Silicon, sin envio de datos a servidores externos.
- No soporta tool calling, function calling, ni capacidades de agente.
- No tiene capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue limitado: principalmente banglish, con algo de ingles en el prompt, pero no maneja escritura en bengali ni otros idiomas.

## Casos de uso

- Chat casual en banglish para usuarios de Bangladesh o la diaspora bengali: el modelo responde en el mismo registro coloquial, ideal para conversaciones informales en redes sociales o mensajeria.
- Asistente personal local en Mac: al ejecutarse en local, se puede integrar en aplicaciones de escritorio para responder preguntas cotidianas sin depender de la nube.
- Practica de idioma: estudiantes de bengali pueden interactuar en banglish para mejorar su fluidez, ya que el modelo imita el habla natural.
- Generacion de contenido para redes sociales en banglish: redactar respuestas, comentarios o publicaciones cortas con tono conversacional.
- Prototipado de chatbots para comunidades bengali: desarrolladores pueden usar este modelo como base para crear asistentes especificos para ese publico, gracias a su tamano reducido y licencia permisiva.
- Educacion y demostracion de IA local: sirve como ejemplo de como adaptar un modelo pequeno a un idioma de bajos recursos y desplegarlo en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~965M parametros cuantizado a 8 bits, el uso de memoria es de aproximadamente 1 GB (el archivo pesa 3,7 GB en disco, pero en memoria con MLX puede variar).
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o superior). No requiere GPU dedicada externa.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: mediante `mlx-lm` (pip install mlx-lm) y el script `companion.py` incluido en el repositorio. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. En un Mac M1 se espera una generacion fluida de texto corto, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| banglish-companion-3b-mlx (este) | 964M (checkpoint) | no disponible | Apache 2.0 | Hugging Face (MLX) |
| banglish-companion (1.7B) | 1.7B | 8K (segun LLM Explorer) | Apache 2.0 | Hugging Face |
| Ministral-3-3B-Base-2512 (base) | 3B | 32K | Apache 2.0 | Hugging Face |

El modelo es una adaptacion del base de Mistral para banglish, con un checkpoint reducido en parametros. Comparado con el modelo de 1.7B, este responde de forma mas corta y directa. No hay otros modelos comparables especificos para banglish en el ecosistema.

## Limitaciones y advertencias

- Solo funciona con banglish: no maneja escritura en bengali (alfabeto bengali) ni ingles formal.
- Alto riesgo de alucinacion: el autor advierte que el modelo "afirma cosas erroneas con confianza" y no debe usarse como fuente de hechos.
- Conversaciones cortas: pierde el hilo en dialogos extensos y no es adecuado para tareas que requieran memoria a largo plazo.
- No es un sustituto de profesionales: no debe usarse como terapeuta, medico o abogado.
- Algunas respuestas no provienen del modelo: ciertos tipos de mensajes se responden desde un archivo incluido en el repositorio antes de llegar a los pesos neuronales, lo que puede generar inconsistencias.
- Requiere Apple Silicon: no compatible con Macs Intel ni Linux (para esos casos existe una version full precision en otro repositorio).
- Sin soporte de tool calling ni agentes: limitado a generacion de texto simple.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sifat-febo/banglish-companion-3b-mlx
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Modelo predecesor (1.7B): https://huggingface.co/sifat-febo/banglish-companion
- Version full precision para Intel/Linux: https://huggingface.co/sifat-febo/banglish-companion-3b
- Otro modelo relacionado: https://huggingface.co/sifat-febo/bangla-banglish-companion-mlx
