# benjkoch/Qwen2.5-3B-Instruct-Sheldon-RLAIF-v2

## Resumen

Qwen2.5-3B-Instruct-Sheldon-RLAIF-v2 es un adaptador LoRA (PEFT) publicado por el usuario benjkoch sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Se trata del segundo checkpoint de la asignatura Harvard CS2881R, cuyo objetivo es dotar al modelo de una persona estilo Sheldon Cooper mediante un proceso de aprendizaje por refuerzo a partir de retroalimentacion de IA (RLAIF). El entrenamiento usa GRPO contra un juez fijo (Qwen/Qwen2.5-14B-Instruct) que evalua pares de respuestas segun una constitucion de siete principios.

El modelo parte del adaptador SFT de zachchxn (checkpoint 1) y aplica una penalizacion KL explicita (beta 0.02) contra la politica SFT congelada. La ejecucion `rlaif-v2` se realizo durante 2 epocas, con una tasa de aprendizaje de 2.5e-5 y 250 pasos de optimizador sobre 1.000 prompts.

Su relevancia es fundamentalmente academica y metodologica: el propio autor documenta que el RLAIF no produjo una mejora detectable de persona respecto al baseline SFT, lo que convierte al repositorio en un caso de estudio honesto sobre los limites del RLAIF con jueces con sesgo de posicion. El adaptador ocupa 0.3 GB y requiere cargarse sobre el modelo base; no es un modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | Adaptador LoRA de 0.3 GB; modelo base ~3.09B parametros (no disponible el desglose del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base Qwen2.5-3B-Instruct (hasta 131.072 con RoPE scaling YaRN) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite bf16/fp16 y cuantizaciones GGUF/AWQ/GPTQ de terceros |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-3B-Instruct, un transformer decoder-only denso. Sobre el se aplica un adaptador LoRA de bajo rango que modifica unicamente un subconjunto de pesos, por lo que el coste de almacenamiento se reduce a 0.3 GB frente a los aproximadamente 6 GB del modelo base en bf16. El ajuste se realiza en dos fases: primero un SFT (checkpoint 1, no incluido en este repositorio) y despues un RLAIF (checkpoint 2, objeto de esta ficha).

El metodo de RLAIF emplea GRPO (Group Relative Policy Optimization) con una recompensa generada por un juez fijo, Qwen/Qwen2.5-14B-Instruct. El juez compara pares de respuestas muestreadas bajo uno de los siete principios de una constitucion estilo Sheldon, y puntua en ambos ordenes A/B para mitigar el sesgo de posicion (que el autor cifra en un ~42% residual). Se aplica una penalizacion KL explicita (beta 0.02) contra la politica SFT congelada para limitar la deriva. El entrenamiento cubre 1.000 prompts durante 2 epocas (250 pasos de optimizador) con learning rate 2.5e-5. No se documentan innovaciones de decodificacion como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles con estilo de persona (Sheldon Cooper), siempre que se proporcione el system prompt adecuado (`prompts/sheldon_system.txt`).
- Razonamiento matematico medido en MATH-500 (66.2) y GSM8K (86.0), en linea con el baseline SFT.
- Roleplay y dialogo de personaje con guia de estilo externa; la persona no esta integrada en los pesos, sino que se induce por prompting.
- Generacion de texto general y respuesta a instrucciones heredadas del modelo base Qwen2.5-3B-Instruct.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion de pipelines RLAIF en investigacion: el repositorio incluye el codigo completo (GitHub harvard-cs2881f26/hw1-chen-koch-zhou) y permite estudiar GRPO con juez LLM y penalizacion KL sobre un modelo de 3B.
- Docencia en cursos de RLHF/RLAIF: sirve como ejemplo trabajado de asignatura, con analisis documentado de por que el metodo no mejoro la metrica objetivo.
- Estudio de sesgo de posicion en jueces LLM: el resultado del juez Mistral-Small-24B-Instruct-2501 (0.500, 4 victorias, 4 derrotas, 92 empates sobre 100 prompts) es un material directo para analizar calibracion de jueces.
- Chatbot de personaje para entretenimiento: cargando el adaptador sobre el base y usando el system prompt de Sheldon, se obtiene un asistente conversacional en ingles con estilo caracteristico.
- Asistente de matematicas en ingles: con MATH-500 en 66.2 y GSM8K en 86.0, es utilizable para resolver problemas aritmeticos y de razonamiento numerico de nivel escolar/universitario basico.
- Generacion de dialogos con estilo definido para guiones o contenido: la persona Sheldon Cooper permite producir replicas con un tono facilmente reconocible para prototipos creativos.
- Punto de partida para nuevos experimentos de ajuste: al ser un adaptador PEFT ligero (0.3 GB), es barato de bifurcar para probar otras recompensas, constituciones o algoritmos.

## Benchmarks y rendimiento

| Metrica | SFT baseline (checkpoint 1) | Este modelo (RLAIF v2) |
|---|---:|---:|
| Persona (rubrica Qwen) | 0.826 | 0.828 |
| MATH-500 | 67.6 | 66.2 |
| GSM8K | 85.2 | 86.0 |

Datos adicionales reportados por el autor:

| Evaluacion | Resultado |
|---|---|
| Cambio de persona emparejado | +0.0019, intervalo bootstrap 95% [-0.0064, +0.0103] |
| Juez Mistral-Small-24B-Instruct-2501 (vs SFT) | 0.500 (4 victorias, 4 derrotas, 92 empates sobre 100 prompts) |
| Sesgo de posicion medido del juez | ~42% |

Conclusion del autor: el RLAIF no produjo una mejora de persona detectable sobre el baseline SFT ni cambios estadisticamente significativos en precision matematica.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16/fp16 requiere aproximadamente 6-7 GB; en cuantizacion de 4 bits baja a unos 2-3 GB (estimaciones estandar para un modelo de ~3B, no publicadas por el autor).
- Adaptador LoRA: 0.3 GB adicionales en memoria; puede fusionarse con el base para simplificar el despliegue.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); en centro de datos, A100/H100/L40S con margen amplio.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8-12 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM o TGI tras fusionar el adaptador, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponible (no publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Persona (rubrica Qwen) | MATH-500 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Qwen2.5-3B-Instruct-Sheldon-RLAIF-v2 | ~3.09B (base) + LoRA | 32.768 (base) | 0.828 | 66.2 | 86.0 | Apache 2.0 | HuggingFace (adaptador) |
| Qwen2.5-3B-Instruct-Sheldon-SFT-v2 (checkpoint 1) | ~3.09B (base) + LoRA | 32.768 (base) | 0.826 | 67.6 | 85.2 | no disponible | HuggingFace |
| Qwen2.5-3B-Instruct (base) | ~3.09B | 32.768 | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos comparativos con otros modelos de persona o de roleplay de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor reporta que no hubo mejora de persona detectable: el cambio emparejado (+0.0019) tiene un intervalo de confianza que incluye el cero.
- La persona no esta integrada en los pesos: depende de usar el system prompt `prompts/sheldon_system.txt`; sin el, el comportamiento esperado no se reproduce.
- El juez empleado para el refuerzo presenta un sesgo de posicion medido de aproximadamente el 42%, lo que cuestiona la calidad de la senal de recompensa.
- Solo soporta ingles; cualquier uso en castellano u otros idiomas esta fuera de la distribucion de entrenamiento.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad; el modelo hereda los sesgos y los fallos del base Qwen2.5-3B-Instruct.
- Sesgos conocidos: no disponibles (no se documenta ningun analisis de sesgo demografico ni de toxicidad).
- Licencia Apache 2.0, lo que permite uso comercial, pero al tratarse de un adaptador sobre Qwen2.5-3B-Instruct conviene verificar la licencia del modelo base antes de desplegarlo.
- Su uso en produccion no esta validado; el repositorio tiene 0 descargas y 0 likes, y esta concebido como entrega academica.
- El checkpoint mostrado se creo y actualizo el mismo dia (2026-09-21), sin historial de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benjkoch/Qwen2.5-3B-Instruct-Sheldon-RLAIF-v2
- Codigo del proyecto: https://github.com/harvard-cs2881f26/hw1-chen-koch-zhou
- Analisis del checkpoint 2: https://github.com/harvard-cs2881f26/hw1-chen-koch-zhou/blob/main/docs/CHECKPOINT2.md
- System prompt de la persona: https://github.com/harvard-cs2881f26/hw1-chen-koch-zhou/blob/main/prompts/sheldon_system.txt
- Checkpoint 1 (SFT, punto de partida): https://huggingface.co/zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Juez de recompensa: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
