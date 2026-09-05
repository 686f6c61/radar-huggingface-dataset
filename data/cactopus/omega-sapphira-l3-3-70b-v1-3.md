# cactopus/Omega-Sapphira-L3.3-70B-v1.3

## Resumen

Omega-Sapphira-L3.3-70B-v1.3 es un modelo de lenguaje de 70.553.706.496 parámetros, desarrollado por cactopus mediante fusión de dos modelos base de Llama 3.3 70B: ReadyArt/L3.3-The-Omega-Directive-70B-Unslop-v2.1 y BruhzWater/Sapphira-L3.3-70b-0.2. La fusión se ha realizado con mergekit y la técnica slerp, dando lugar a un modelo denso, no alineado (unaligned), orientado a roleplay y escritura de historias. El modelo está disponible en HuggingFace bajo licencia llama3.3 y solo soporta inglés. Su relevancia radica en ofrecer una alternativa de gran tamaño para generación creativa sin restricciones de alineación, aunque su uso no está recomendado para todas las audiencias. El contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3 70B) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; existe una version cuantizada EXL3 4.25bpw publicada por el autor |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de dos modelos base de Llama 3.3 70B mediante mergekit, utilizando interpolacion slerp. No se ha entrenado desde cero, por lo que no hay datos sobre numero de tokens, composicion del dataset ni procesos de RLHF o DPO. Los modelos base son ReadyArt/L3.3-The-Omega-Directive-70B-Unslop-v2.1 y BruhzWater/Sapphira-L3.3-70b-0.2, ambos de 70B. La innovacion tecnica destacable es la combinacion de estilos creativos de ambos modelos mediante fusion de pesos, lo que da lugar a un modelo no alineado (unaligned) con un comportamiento orientado a roleplay y escritura de historias.

## Capacidades

- Generacion de texto conversacional en ingles.
- Especializado en roleplay y escritura de historias (storywriting), segun los tags del modelo.
- Modelo no alineado (unaligned), lo que permite respuestas sin los filtros de seguridad habituales.
- No se ha documentado soporte para tool calling, agentes, vision, audio ni decodificacion especulativa en la informacion disponible.
- Capacidades multilingues: solo ingles (language: en).
- Puede producir contenido narrativo variado, heredando los estilos de los dos modelos base.

## Casos de uso

- Escritura de ficcion interactiva: el modelo puede mantener narrativas coherentes y extensas, por lo que es adecuado para juegos de texto donde el usuario toma decisiones y el modelo responde con descripciones y dialogos.
- Creacion de personajes para juegos de rol: permite generar fichas de personaje detalladas, trasfondos y dialogos con un estilo inmersivo, aprovechando la especializacion en roleplay.
- Generacion de dialogos para guiones: util para escritores que necesitan conversaciones naturales y con matices; el modelo puede producir intercambios realistas entre personajes.
- Asistente de escritura creativa: puede ayudar a desarrollar tramas, descripciones de escenarios y escenas, actuando como un copiloto para autores.
- Simulacion de personajes en comunidades de rol: en foros o chats de rol, el modelo puede interpretar un personaje de forma consistente durante conversaciones largas.
- Experimentacion en investigacion sobre modelos no alineados: permite estudiar el comportamiento de un LLM sin filtros de seguridad en entornos controlados y con supervision humana.
- Generacion de contenido narrativo para juegos indie: puede crear descripciones de escenarios, eventos y dialogos de forma automatica, reduciendo costes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos en BF16: 141.1 GB (segun el tamano del repositorio).
- VRAM estimada para inferencia en BF16: ~141 GB, mas overhead; se recomiendan al menos 2 GPU de 80 GB (A100/H100) con tensor parallel.
- Con cuantizacion 4 bits (por ejemplo, EXL3 4.25bpw): ~35-45 GB de VRAM; puede ejecutarse en una A100 80GB o en 2x RTX 4090 24GB con tensor parallel.
- En consumer GPU: no es viable en una sola GPU de 24 GB sin cuantizacion extrema (2-3 bits) y offloading a CPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers. El modelo es compatible con text-generation-inference y endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Omega-Sapphira-L3.3-70B-v1.3 | 70.553.706.496 | no disponible | llama3.3 | Fusion de los dos modelos base; no alineado |
| ReadyArt/L3.3-The-Omega-Directive-70B-Unslop-v2.1 | no disponible | no disponible | llama3.3 | Modelo base, orientado a "unslop" |
| BruhzWater/Sapphira-L3.3-70b-0.2 | no disponible | no disponible | llama3.3 | Modelo base, orientado a roleplay |

## Limitaciones y advertencias

- Modelo no alineado (unaligned): puede generar contenido inapropiado, ofensivo o peligroso; no esta disenado para uso seguro sin supervision.
- Riesgo de alucinacion: al no haber sido sometido a un proceso de alineacion, la probabilidad de generar informacion falsa o inventada es alta.
- Solo soporta ingles: no es adecuado para aplicaciones multilingues.
- Licencia llama3.3: requiere cumplir los terminos de la licencia de Llama 3.3, que imponen restricciones de uso y atribucion.
- No se han publicado evaluaciones de seguridad ni benchmarks: no hay datos objetivos sobre su rendimiento o sesgos.
- Al ser un modelo fusionado, su comportamiento puede ser impredecible en algunos contextos, especialmente en tareas no relacionadas con roleplay o escritura creativa.
- No apto para todas las audiencias (not-for-all-audiences).

## Enlaces

- HuggingFace: https://huggingface.co/cactopus/Omega-Sapphira-L3.3-70B-v1.3
- Cuantizacion EXL3 4.25bpw: https://huggingface.co/cactopus/Omega-Sapphira-L3.3-70B-v1.3_EXL3_4.25bpw_H8
- Modelo base ReadyArt/L3.3-The-Omega-Directive-70B-Unslop-v2.1: https://huggingface.co/ReadyArt/L3.3-The-Omega-Directive-70B-Unslop-v2.1
- Modelo base BruhzWater/Sapphira-L3.3-70b-0.2: https://huggingface.co/BruhzWater/Sapphira-L3.3-70b-0.2
- No se han encontrado papers ni documentacion adicional.
