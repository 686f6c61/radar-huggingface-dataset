# noumenon-labs/Morrow2-2B

## Resumen

Morrow2-2B es un modelo de lenguaje conversacional de pequeno tamano desarrollado por Noumenon Labs, un colectivo que se presenta como "estudiantes dispersos que aman aprender". El modelo esta construido sobre LFM3-1.7B de Liquid AI mediante fine-tuning supervisado completo (full SFT), y su objetivo declarado es priorizar el comportamiento conversacional util sobre la mera imitacion de un estilo de voz. Se distribuye con pipeline de text-generation y esta etiquetado como conversational, dialogue y behavioral-tuning.

La propuesta de Morrow V2 es un replanteamiento del modelo original: segun la model card, la primera version aprendio a "hablar como Morrow" pero fallaba en juicio conversacional y comprension de prompts. V2 incorpora un dataset mas diverso basado en datos de preferencia humana, conversaciones reales humano-IA y datos sinteticos informados por Pi y Claude, con el objetivo de ampliar el rango de respuestas validas sin perder la voz pretendida.

Es relevante como ejemplo de ajuste conductual sobre un modelo base compacto: aunque reduce el tamano respecto a la base anterior de 2.5B, el autor afirma que el nuevo base de 1.7B rinde mejor para sus objetivos. La informacion publica es limitada: no se detallan tokens de entrenamiento, longitud de contexto, cuantizaciones ni pesos disponibles, y el dataset permanece privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM3-1.7B; detalles no disponibles) |
| Parametros totales | 1.7B (base LFM3-1.7B); el identificador del repo indica 2B, dato no confirmado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | other (terminos no especificados en la informacion disponible) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Morrow V2 parte de LFM3-1.7B, la variante text-only de la familia LFM3 de Liquid AI, elegida por el autor frente a variantes con capacidades de imagen u otras especializaciones. El entrenamiento consiste en un full supervised fine-tuning sobre los pesos del modelo base, en contraste con la version anterior, que era un modelo cuantizado basado en LoRA con un adaptador separado. No se especifica si hubo RLHF, DPO u otras fases de alineamiento adicionales, ni se detalla la arquitectura interna del transformer base (atencion, capas, dimensiones).

El dataset de entrenamiento combina, segun la model card, datos de preferencia humana, conversaciones reales entre humanos y IA, y datos conversacionales generados por modelos e informados por Pi y Claude. El conjunto de datos permanece privado. La innovacion declarada no es arquitectonica sino conductual: entrenar el comportamiento conversacional (comprension de prompts, gestion de desahogos, tareas cotidianas, juicio situacional) en lugar de solo el estilo de habla, y evitar forzar toda conversacion hacia un intercambio multi-turno.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogo natural y coherente.
- Comprension de prompts y juicio conversacional mejorados respecto a la version anterior, segun la evaluacion interna del autor.
- Gestion de situaciones cotidianas y de desahogos emocionales ("vents") con atencion al tono.
- Respuestas de un solo turno cuando el contexto no requiere continuacion multi-turno.
- Voz conversacional consistente y personalidad definida.
- No se documentan capacidades de codigo, matematicas avanzadas, vision, audio, tool calling ni razonamiento multi-paso; la model card advierte limitaciones en razonamiento complejo y recall factual.

## Casos de uso

- Asistentes conversacionales de proposito general: el modelo esta afinado para mantener un tono consistente y comprender prompts cotidianos, lo que lo hace adecuado para chatbots de acompanamiento o asistencia ligera en ingles.
- Aplicaciones de bienestar y escucha activa: la mejora declarada en "emotional attunement" (3.0 a 3.7 en la evaluacion interna) lo orienta a conversaciones donde el usuario busca desahogarse o ser escuchado, sin prometer precision clinica.
- Prototipado rapido de productos de dialogo: al ser un modelo de 1.7B, puede desplegarse en hardware modesto para validar flujos conversacionales antes de escalar a modelos mayores.
- Educacion y tutoria conversacional: puede gestionar explicaciones y dialogos guiados en ingles, aunque su recall factual limitado exige verificar datos con fuentes externas.
- Investigacion en ajuste conductual: sirve como caso de estudio de full SFT sobre un base compacto para modificar comportamiento conversacional en lugar de solo estilo.
- Asistentes embebidos o de borde: su tamano reducido permite integracion en entornos con recursos limitados donde un modelo de mayor escala no es viable, siempre que la tarea sea conversacional y en ingles.

## Benchmarks y rendimiento

Evaluacion conversacional interna del autor, escala 1-5 (no son benchmarks estandar y no hay comparacion con modelos externos):

| Metrica | Version anterior | Morrow V2 |
|---|---:|---:|
| Comprension de prompts | 2.8 | 3.6 |
| Sintonizacion emocional | 3.0 | 3.7 |
| Utilidad | 3.1 | 3.8 |
| Juicio conversacional | 2.7 | 3.6 |
| Naturalidad | 3.4 | 3.6 |
| **Global** | **2.88** | **3.66** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1.7B, en fp16 se situaria en torno a 3-4 GB de pesos, y en cuantizaciones de 4-8 bits en torno a 1-2 GB, aunque no hay confirmacion de pesos publicados.
- GPU recomendadas: no disponibles; por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060 o superiores, y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 1.7B, siempre que se publiquen pesos compatibles.
- Opciones de despliegue: no especificadas; no se confirma disponibilidad de GGUF, safetensors ni integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Morrow2-2B | 1.7B (base) | no disponible | Dialogo conversacional afinado | other | HuggingFace (pesos no confirmados) |
| LFM3-1.7B (Liquid AI) | 1.7B | no disponible | Modelo base text-only | no disponible | no disponible en la informacion |
| Modelos conversacionales pequenos tipo Phi o Qwen pequenos | 1.5B-2B | variable | Dialogo y asistencia general | variable | amplia |

La comparacion cuantitativa con alternativas no esta disponible: no hay benchmarks publicos comparables ni datos de contexto o licencia de los modelos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo compacto: el autor advierte que puede fallar en razonamiento complejo, tareas de contexto largo, recall factual y conocimiento fuera de su entrenamiento.
- Las mejoras conversacionales no garantizan precision en situaciones reales; riesgo de alucinacion inherente a modelos pequenos.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Licencia "other" sin terminos especificados: es necesario consultar al autor antes de uso comercial.
- Dataset privado: no es posible auditar la composicion de datos ni los sesgos potenciales.
- Los benchmarks presentados son una evaluacion interna del propio autor en escala 1-5, sin validacion externa ni comparacion con estandares.
- No se confirma la publicacion de pesos, formatos de cuantizacion ni soporte de herramientas de despliegue, lo que limita su uso en produccion.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/noumenon-labs/Morrow2-2B
- Modelo base LFM3-1.7B (Liquid AI): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
