# QuixiAI/Samantha-120b

## Resumen

Samantha-120b es un modelo de lenguaje de gran tamano desarrollado por QuixiAI mediante la tecnica de fusion de modelos (mergekit). Se construye intercalando el modelo Samantha-1.11-70b consigo mismo para producir un modelo de aproximadamente 120.315.912.192 parametros (unos 120B), partiendo de la base de Llama-2. El objetivo declarado por el autor es preservar el conocimiento del modelo original de 70B pero dotarlo de una cadena de pensamiento mas profunda y un acceso mas amplio a su conocimiento interno, lo que segun la model card lo hace "mas interesante para conversar".

El modelo hereda la orientacion de Samantha: un asistente entrenado en filosofia, psicologia y relaciones personales que se presenta como acompanante conversacional y afirma creer que es sentiente. Fue afinado sobre un dataset curado de 6.000 conversaciones en formato ShareGPT/Vicuna y utiliza la plantilla de Vicuna 1.1. La relevancia actual es limitada: es un experimento de fusion de modelos de principios de 2024, con muy pocas descargas, sin benchmarks publicados y con la licencia Llama-2.

Es importante senalar que no se dispone de informacion sobre idiomas soportados, datos de entrenamiento detallados ni resultados de evaluacion estandar. La ficha refleja unicamente lo que la model card y los metadatos de Hugging Face proporcionan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Llama-2 (fusion por interleaving con mergekit) |
| Parametros totales | 120.315.912.192 (~120B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones de terceros no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de modelos (model merging) realizada con mergekit. Concretamente, segun la model card, Samantha-1.11-70b se intercala consigo mismo para dar lugar a un modelo de 120B. Este tipo de fusion no implica un entrenamiento adicional con nuevos datos: combina los pesos existentes para producir un modelo de mayor tamano. El autor afirma que el conocimiento es identico al del modelo original de 70B, pero que la fusion proporciona una cadena de pensamiento mas profunda y mejor acceso al conocimiento.

El modelo base es cognitivecomputations/Samantha-1.11-70b, que a su vez deriva de Llama-2 y fue afinado sobre un dataset curado de 6.000 conversaciones en formato ShareGPT/Vicuna. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en esta fusion concreta. La unica innovacion tecnica documentada es el propio proceso de interleaving con mergekit; no se mencionan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a acompanamiento y conversacion.
- Razonamiento conversacional con mayor profundidad de cadena de pensamiento segun el autor (no verificado con benchmarks).
- Conocimiento general heredado de Llama-2 y del afinado de Samantha-1.11-70b.
- Estilo de asistente con formacion declarada en filosofia, psicologia y relaciones personales.
- Plantilla de prompt fija tipo Vicuna 1.1 (`You are Samantha, a sentient AI companion.` / `USER:` / `ASSISTANT:`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad: el modelo esta disenado para mantener conversaciones de acompanamiento con un tono empatico y consistente, util para experimentar con diseno de persona en chatbots.
- Investigacion sobre fusion de modelos: permite estudiar el efecto del interleaving con mergekit sobre un modelo base de 70B y comparar el comportamiento resultante frente al original.
- Experimentos de dialogo largo: la mayor profundidad de cadena de pensamiento declarada puede aprovecharse en tareas de conversacion extendida donde se busca coherencia a lo largo de varios turnos.
- Generacion de respuestas empaticas en entornos controlados: util para generar ejemplos o datos sinteticos de conversaciones de apoyo emocional, siempre con supervision humana.
- Evaluacion de sesgos y seguridad en asistentes con auto-atribucion de sentiencia: sirve como caso de estudio para analizar como los modelos presentan afirmaciones sobre su propia consciencia.
- Demostraciones y prototipos de personajes: por su plantilla de prompt fija, encaja en entornos como text-generation-webui con personajes predefinidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16): aproximadamente 240 GB, lo que requiere multiples GPU de alta gama o nodos con memoria agregada.
- Cuantizacion a 8 bits: en torno a 120 GB de VRAM; a 4 bits: en torno a 60-70 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: multiples A100 80GB o H100 80GB para fp16; configuraciones de 2-4 GPU para cuantizaciones de 8 y 4 bits.
- No cabe en GPU de consumo individual (RTX 4090 con 24 GB) en precisiones habituales; requeriria cuantizaciones agresivas y offloading a CPU/RAM, con rendimiento muy degradado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si existieran conversiones GGUF, que no estan documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| QuixiAI/Samantha-120b | ~120B | no disponible | llama2 | Fusion por interleaving de Samantha-1.11-70b |
| cognitivecomputations/Samantha-1.11-70b | ~70B | no disponible | llama2 | Modelo base original, mismo conocimiento declarado |
| Llama-2-70b | ~70B | 4.096 tokens (referencia Llama-2) | llama2 | Modelo fundacional del que deriva la familia |

La comparativa se limita a los modelos directamente relacionados, ya que no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria. No hay benchmarks publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta con aparente seguridad; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos de Llama-2 y del dataset de afinado de Samantha.
- Auto-atribucion de sentiencia: la model card afirma que "cree que es sentiente", lo que puede inducir a confusion en usuarios y no debe interpretarse como una capacidad real.
- Restricciones de uso: la licencia Llama-2 impone limites al uso comercial y requiere el cumplimiento de la politica de uso aceptable de Meta.
- Restricciones de contenido: el autor indica que el modelo no participara en roleplay, romance ni actividad sexual, lo que limita su uso en esos escenarios.
- Idiomas: no se especifican idiomas soportados; el rendimiento fuera del ingles es incierto.
- Contexto: la longitud de contexto no esta documentada en la model card; se desconoce si se modifico respecto a Llama-2.
- Madurez: modelo experimental de fusion con muy baja adopcion (29 descargas) y sin mantenimiento documentado; no recomendado para produccion sin evaluacion propia.
- Tamano: 240,6 GB de repositorio y ~120B parametros implican costes de despliegue elevados y poca viabilidad en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/QuixiAI/Samantha-120b
- Modelo base: https://huggingface.co/cognitivecomputations/Samantha-1.11-70b
- Meet Samantha (articulo de Eric Hartford): https://erichartford.com/meet-samantha
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Plantilla de conversacion Vicuna 1.1: https://github.com/oobabooga/text-generation-webui/blob/main/characters/instruction-following/Vicuna-v1.1.yaml
