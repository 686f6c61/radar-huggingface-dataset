# alvinchirchir/pirate-speak-0.5b

## Resumen

pirate-speak-0.5b es un ajuste fino de estilo (style transfer) sobre Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario alvinchirchir como proyecto de aprendizaje. El modelo responde a cualquier pregunta adoptando el registro de un pirata gruñon. Se trata de un derivado directo: la arquitectura, el tokenizador y la plantilla de chat del modelo base de Qwen (Alibaba Cloud) permanecen sin cambios, y la unica modificacion es un ajuste supervisado con LoRA cuyos pesos se fusionaron en los pesos base mediante `merge_and_unload()`, por lo que carga como un modelo Transformers estandar sin dependencia de PEFT.

El modelo tiene 494.032.768 parametros (aproximadamente 0,5B), se distribuye en safetensors en float32 (repo de 2,0 GB) y esta licenciado bajo Apache 2.0, la misma licencia del modelo base. Solo soporta ingles segun los metadatos del autor.

Su relevancia es exclusivamente didactica: sirve como ejemplo minimo y reproducible de un pipeline de SFT con LoRA/TRL, y como caso de estudio de como un conjunto de entrenamiento de 15 ejemplos degrada drasticamente la utilidad factual del modelo base a cambio de un estilo reconocible pero inconsistente. No es un modelo apto para produccion ni para tareas donde la correccion de la informacion importe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), sin modificaciones respecto al modelo base |
| Parametros totales | 494.032.768 (494M) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el unico formato publicado son pesos en float32 (no se distribuyen GGUF ni versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float32, ~2 GB); adaptador LoRA ya fusionado en los pesos |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (relacion: finetune) |
| Metodo de ajuste | LoRA SFT (TRL `SFTTrainer`), adaptador fusionado |
| Plantilla de chat | La de Qwen por defecto, sin mensaje de sistema personalizado |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con tokenizador y plantilla de chat sin cambios. No hay innovaciones arquitectonicas propias; no se emplean atencion lineal, decodificacion especulativa ni esquemas MoE.

El entrenamiento consistio en un ajuste supervisado con LoRA sobre 15 pares prompt/respuesta escritos a mano, con preguntas cotidianas respondidas en jerga pirata y formateados como pares conversacionales prompt/completion, de modo que la perdida se calcula solo sobre la respuesta del asistente. Los hiperparametros declarados son: rango LoRA 16, alpha 32, dropout 0,05, modulos objetivo todas las capas lineales (atencion y MLP), 8,8M parametros entrenables (1,75% del total), 6 epocas y 48 pasos, batch size 2, learning rate 2e-4 con decaimiento lineal, max grad norm 1,0, precision float32 sin mixed precision y perdida final de entrenamiento de aproximadamente 0,74. El entrenamiento se ejecuto en una Apple M1 Pro con el backend MPS de PyTorch, usando Transformers 4.57.6, TRL 1.13.0, PEFT 0.19.1 y PyTorch 2.9.1. Tras entrenar, el adaptador se fusiono en los pesos base, eliminando la dependencia de PEFT en inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con un registro estilizado tipo pirata.
- Respuesta a preguntas cotidianas reproducidas del conjunto de entrenamiento (clima, capitales, chistes, consejos genericos).
- Reproduccion muy fiel de las respuestas vistas durante el ajuste.
- Soporte de la plantilla de chat de Qwen mediante `apply_chat_template`, con prompts en formato de mensajes `role`/`content`.
- Integracion con `transformers.pipeline("text-generation")` y `AutoModelForCausalLM` sin dependencias adicionales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles declarado, con aparicion ocasional de tokens sueltos en otros idiomas (por ejemplo caracteres chinos) descrita como fallo.

## Casos de uso

- Material didactico para aprender SFT con LoRA: el repositorio documenta el dataset, los hiperparametros y el hardware, por lo que sirve como plantilla reproducible para un primer ajuste fino con TRL y PEFT en una maquina de gama consumer.
- Demostracion de transferencia de estilo en charlas o talleres: permite mostrar de forma inmediata, con prompts conocidos, el contraste entre las respuestas del modelo base y las del modelo ajustado.
- Estudio de olvido catastrofico (catastrophic forgetting): el autor documenta que la utilidad cae drasticamente con solo 15 ejemplos, lo que lo convierte en un caso de laboratorio para medir la degradacion de capacidades instruccionales tras un ajuste de estilo agresivo.
- Generacion de dialogos con caracter para prototipos de videojuegos o ficcion: util como generador de replicas con tono coherente en una demo, siempre que no se requiera precision factual.
- Pruebas de integracion de pipelines de inferencia: al cargar como modelo Transformers estandar de 494M, sirve para validar extremo a extremo un endpoint de text-generation, TGI o un wrapper propio con un coste de computo minimo.
- Prototipado de contenido tematico o marketing: generar textos breves con un tono concreto (por ejemplo, promociones de tematica pirata) en fase de maqueta, revisando manualmente cada salida.
- Pruebas de formato de dataset conversacional: verificar que el enmascarado de perdida sobre el turno del asistente y el `apply_chat_template` funcionan correctamente antes de escalar a un dataset mayor.
- Juguete conversacional para demostraciones informales: el propio autor lo enmarca como "fun chat toy", adecuado para entornos controlados y sin expectativa de exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye comparaciones cualitativas de salidas con decodificacion greedy frente al modelo base en tres prompts, sin metricas numericas (MMLU, HumanEval, GSM8K u otras).

| Prompt | Qwen2.5-0.5B-Instruct (base) | pirate-speak-0.5b |
|---|---|---|
| What is the capital of France? | "The capital of France is Paris." | "'Tis Paris, ye scallywag! But don't be too aggrree, or I'll loose my sail! Haul yer sails, and I'll take the decks!" |
| What should I name my dog? | Respuesta detallada sobre como elegir un nombre | "A fine mate, but don't worry about the details, or ye'll be drowned too!" |
| How do I fix a flat tire? | Pasos detallados para cambiar un neumatico | "A flat tire's the first thing to happen when you land on the ocean floor, but don't ye be too quick about it, or else ye'll just end up with a wet deck!" |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 494.032.768 parametros: aproximadamente 1,98 GB en float32 (tamano declarado del repo: 2,0 GB), unos 0,99 GB en float16/bfloat16 y aproximadamente 0,25-0,5 GB en cuantizaciones de 4-8 bits.
- El repositorio solo publica pesos en float32; el paso a fp16 o a cuantizacion requiere conversion propia (por ejemplo, `bitsandbytes` o conversion a GGUF), no validada por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para float32; con 2 GB basta en fp16. Cabe en tarjetas tipo RTX 3050, RTX 4060, GTX 1650 o superiores, asi como en GPUs de datacenter (A100, H100) sobredimensionadas para este tamano.
- Entrenamiento: el autor lo ejecuto en una Apple M1 Pro con backend MPS, sin GPU dedicada, lo que indica que el ajuste fino es viable en hardware de portatil.
- Opciones de despliegue: `transformers` (pipeline o `AutoModelForCausalLM`); los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI mas alla de esos tags.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia, tokens por segundo ni consumo de memoria en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pirate-speak-0.5b | 494M | no disponible | Sin benchmarks publicados; utilidad factual degradada respecto al base | apache-2.0 | HuggingFace, safetensors float32 |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494M (0,5B) | no disponible en la informacion proporcionada | Sin benchmarks en la informacion disponible; respuestas detalladas y utiles segun los ejemplos de la model card | apache-2.0 | HuggingFace |
| Alternativas de tamano comparable (otros modelos ~0,5B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada, por lo que la unica comparacion verificable es contra el modelo base, del que este repositorio es un derivado directo.

## Limitaciones y advertencias

- Conjunto de entrenamiento minimo: solo 15 ejemplos. El modelo reproduce con fidelidad las respuestas de entrenamiento, pero ante prompts nuevos el estilo pirata es inconsistente y las respuestas suelen ser vagas o poco utiles.
- Perdida de utilidad: el ajuste cambio las respuestas detalladas del modelo base por ocurrencias breves en personaje. No debe usarse para hechos, instrucciones ni consejo.
- Alucinacion: riesgo alto en cualquier pregunta factual, ya que el estilo se prioriza sobre el contenido. En los ejemplos publicados, la respuesta sobre el neumatico pinchado es directamente incorrecta y absurda.
- Fallos de generacion: la model card documenta errores ortograficos ocasionales (por ejemplo "aggrree", "loose my sail") y aparicion de tokens sueltos en otros idiomas, como caracteres chinos en mitad de una frase.
- Sesgos: hereda los sesgos y limitaciones de Qwen2.5-0.5B-Instruct, que no se detallan en la informacion disponible.
- Idioma: solo ingles declarado, sin capacidades multilingues garantizadas.
- Plantilla de chat: el entrenamiento uso la plantilla por defecto de Qwen sin mensaje de sistema; introducir uno puede degradar la coherencia de las respuestas.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen2.5-0.5B-Instruct (Copyright 2024 Alibaba Cloud) se deben conservar los avisos de atribucion y declarar las modificaciones realizadas; el repositorio incluye una copia de la licencia.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados. No hay evidencia externa de calidad ni de comportamiento en produccion.
- Advertencia de uso: no debe desplegarse en atencion al cliente, soporte tecnico, educacion reglada ni ningun flujo donde el usuario espere informacion correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alvinchirchir/pirate-speak-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia incluida en el repositorio: https://huggingface.co/alvinchirchir/pirate-speak-0.5b/blob/main/LICENSE
- Referencia arXiv incluida en los tags del repositorio: arxiv:2407.10671 (https://arxiv.org/abs/2407.10671)
- Resultados de busqueda web: las consultas no devolvieron informacion relevante sobre el modelo; los enlaces obtenidos corresponden a guias turisticas de Boston y no guardan relacion con este repositorio, por lo que no se incluyen.
