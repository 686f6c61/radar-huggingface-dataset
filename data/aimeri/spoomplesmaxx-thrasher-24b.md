# aimeri/spoomplesmaxx-thrasher-24B

## Resumen

SpoomplesMaxx Thrasher 24B es un modelo de lenguaje especializado en roleplay, escritura creativa y conversación, desarrollado por el usuario aimeri como parte de la familia SpoomplesMaxx. Se trata de un fine-tune del modelo base mistralai/Mistral-Small-3.1-24B-Base-2503, con 23.572.403.200 parámetros (23,57B) y licencia Apache 2.0. El modelo está orientado a generar narrativa inmersiva, encarnar personajes y mantener conversaciones multi-turno, aunque también muestra competencia ligera en seguimiento de instrucciones y razonamiento, según la descripción de otros modelos de la misma familia.

La relevancia de este modelo radica en su tamaño intermedio (24B), que permite ejecutarse en hardware de gama alta para consumidores con cuantización, y en su especialización en tareas creativas, un nicho donde los modelos generalistas suelen quedarse cortos. Al estar basado en Mistral Small 3.1, hereda una arquitectura transformer moderna y un buen equilibrio entre capacidad y eficiencia. Sin embargo, al ser un modelo reciente con cero descargas y cero likes, su adopción es aún incipiente y carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Mistral Small 3.1 24B) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no confirmado) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de mistralai/Mistral-Small-3.1-24B-Base-2503, un transformer denso de 24B parametros desarrollado por Mistral AI. La arquitectura base incluye atencion por ventanas deslizantes y un contexto largo (128k tokens en el modelo original, aunque no se confirma si el fine-tune lo conserva). El proceso de entrenamiento de SpoomplesMaxx Thrasher 24B no esta documentado en la model card, pero por la familia a la que pertenece se infiere que utiliza datasets de roleplay, escritura creativa y dialogo conversacional, posiblemente con un pipeline de SFT (supervised fine-tuning) similar al descrito en otros modelos de la serie, como spoomplesmaxx-v2.1-30B que menciona un pipeline SFT con razonamiento y una persona narrativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El repositorio GitHub de la familia (aimerib/spoomplesmaxx) indica que los datasets combinan roleplay, escritura creativa y un asistente "inteligente", con el objetivo de lograr un modelo narrativamente creativo y capaz de seguir instrucciones complejas.

## Capacidades

- Generacion de texto narrativo y creativo: disenado para roleplay y escritura de ficcion, con capacidad para mantener personajes coherentes y tramas complejas.
- Conversacion multi-turno: optimizado para dialogos largos y contextuales, gracias a su base de Mistral Small 3.1.
- Seguimiento de instrucciones: competencia ligera en tareas de instruccion general, aunque no es su punto fuerte.
- Razonamiento basico: puede resolver problemas logicos simples, pero no esta especializado en matematicas o codigo.
- Idioma: exclusivamente ingles, sin soporte multilingue declarado.
- Formato ChatML: compatible con el formato de mensajes ChatML para integracion en aplicaciones de chat.

## Casos de uso

- Roleplay interactivo: el modelo puede encarnar personajes en juegos de rol por texto, manteniendo coherencia de personalidad y memoria de la historia a lo largo de multiples turnos. Su base de 24B permite matices narrativos que modelos mas pequenos no logran.
- Escritura creativa asistida: util para generar borradores de ficcion, dialogos, descripciones de escenarios o expandir ideas. Un escritor puede usarlo como co-autor o para superar bloqueos creativos.
- Creacion de personajes para videojuegos: los desarrolladores pueden emplearlo para generar dialogos y personalidades de NPCs en juegos narrativos, aprovechando su capacidad de mantener un tono consistente.
- Simulacion de conversaciones para entrenamiento: en entornos de formacion (ventas, atencion al cliente), puede simular interlocutores con distintos perfiles para practicar tecnicas de comunicacion.
- Generacion de contenido para redes sociales o blogs: puede producir textos creativos, hilos narrativos o micro-ficcion, aunque requiere supervision para evitar inconsistencias.
- Asistente conversacional tematico: integrable en chatbots especializados en ficcion o entretenimiento, donde la creatividad es mas valorada que la precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Al ser un fine-tune reciente sin adopcion, tampoco hay evaluaciones independientes de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 23,57B parametros, en precision FP16/BF16 se necesitan aproximadamente 47 GB de VRAM (el tamano del repo es 47,2 GB). Con cuantizacion de 8 bits, unos 24 GB; con 4 bits, unos 12 GB.
- GPU recomendadas: para precision completa, una A100 80GB o H100. Para cuantizacion 8-bit, una RTX 4090 (24GB) o A6000. Para 4-bit, una RTX 3090 o 4070 Ti (12-16GB).
- Compatibilidad con GPU de consumo: si, con cuantizacion. Una RTX 4090 puede ejecutarlo en 8-bit, y una RTX 3090 en 4-bit, aunque con menor velocidad.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se publica cuantizacion), y text-generation-inference (segun los tags).
- Latencia y throughput: no disponibles. Dependera del hardware y la cuantizacion. En una RTX 4090 con 8-bit, se puede esperar un throughput de 20-40 tokens/s para generacion, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| spoomplesmaxx-thrasher-24B | 23,57B | no disponible | Roleplay, escritura creativa | Apache 2.0 |
| spoomplesmaxx-mini-14B | 14B | no disponible | Roleplay, escritura creativa | no disponible |
| spoomplesmaxx-v2.1-30B | 30B | no disponible | Roleplay, escritura creativa, razonamiento | no disponible |
| spoomplesmaxx-flash-35B-A3 | 35B (3B activos) | no disponible | Roleplay, tool calling, velocidad | no disponible |
| Mistral Small 3.1 24B (base) | 24B | 128k (segun Mistral) | Generalista | Apache 2.0 |

La comparativa se limita a la familia SpoomplesMaxx y al modelo base, ya que no hay datos de rendimiento publicados. Thrasher 24B se situa en un punto intermedio entre el mini-14B (mas ligero) y el v2.1-30B (mas grande), y a diferencia del flash-35B-A3, no es MoE ni tiene soporte de tool calling declarado.

## Limitaciones y advertencias

- Idioma limitado: solo ingles. No es adecuado para aplicaciones multilingue.
- Sesgos potenciales: al ser un fine-tune de un modelo base, puede heredar sesgos de genero, raza o cultura presentes en los datos de entrenamiento. No hay evaluacion de sesgos publicada.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, especialmente en contextos creativos donde la fidelidad factual no es prioritaria. No debe usarse para tareas que requieran precision verificable.
- Sin datos de rendimiento: no hay benchmarks ni evaluaciones independientes, por lo que su calidad real es incierta.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta. No hay comunidad que lo valide ni soporte.
- Contexto no confirmado: aunque el modelo base soporta 128k tokens, no se sabe si el fine-tune mantiene esa longitud. Se recomienda probar antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B
- Repositorio GitHub de la familia: https://github.com/aimerib/spoomplesmaxx
- Modelo relacionado spoomplesmaxx-mini-14B: https://huggingface.co/aimeri/spoomplesmaxx-mini-14B
- Modelo relacionado spoomplesmaxx-v2.1-30B: https://huggingface.co/aimeri/spoomplesmaxx-v2.1-30B
- Modelo relacionado spoomplesmaxx-flash-35B-A3: https://huggingface.co/aimeri/spoomplesmaxx-flash-35B-A3
- Modelo relacionado spoomplesmaxx-base-qwen3-14b: https://huggingface.co/aimeri/spoomplesmaxx-base-qwen3-14b
