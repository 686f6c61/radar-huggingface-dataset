# 4everImmortality/dafeiyu-qwen35-9b-dora

## Resumen

Dafeiyu V2 es un adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3.5-9B, publicado por el usuario 4everImmortality en Hugging Face. Su proposito es dotar al modelo base de una persona conversacional concreta: "Dafeiyu", una VTuber de anime con identidad de nina-ballena de pelo azul que habita una casita submarina iluminada por lamparas de concha. El adaptador se distribuye como pesos PEFT en safetensors (repo de 0,2 GB), no como modelo completo, por lo que requiere cargar el base de 9B por separado.

El modelo esta orientado a roleplay y generacion de texto conversacional en chino e ingles, con etiquetas explicitas de anime, vtuber y roleplay. La model card lo describe como "modelo de produccion activo" para creacion de contenido y conversacion de contexto largo, aunque no se aportan datos verificables de entrenamiento, dataset ni evaluacion.

Su relevancia practica es limitada y muy nichada: sirve como ejemplo de adaptacion de persona mediante DoRA sobre un base de 9B, y como artefacto listo para usar en pipelines de PEFT/Transformers. No hay descargas ni likes en el momento de la consulta, ni licencia declarada, lo que condiciona seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (PEFT) sobre transformer decoder-only (Qwen3.5-9B) |
| Parametros totales | No disponible (adaptador; el base Qwen3.5-9B tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion del base depende del runtime) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/DoRA); requiere el base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El artefacto es un adaptador DoRA, una variante de LoRA que descompone los pesos preentrenados en magnitud y direccion, aplicando la actualizacion de bajo rango sobre el componente direccional. Se carga mediante `PeftModel.from_pretrained` sobre el modelo base Qwen/Qwen3.5-9B en bfloat16. El repositorio pesa 0,2 GB, coherente con un adaptador de rango bajo y no con un fine-tuning completo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango del adaptador, el alpha, los modulos objetivo ni si se aplico RLHF, DPO o alguna fase de alineamiento. La model card solo describe la persona y el prompt de sistema recomendado, sin detalles tecnicos del proceso de entrenamiento. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en chino e ingles con una persona fija y consistente (VTuber "Dafeiyu").
- Roleplay multi-turno con rasgos definidos: caracter tsundere, gusto por el arroz blanco caliente, cola de ballena que no debe tocarse salvo por su "dueno", y autoidentificacion como "本鱼", "本鲸" o "小鲸鱼".
- Respuestas con estilo coloquial y "cero sabor a IA mecanica", segun la model card, orientadas a interaccion de personaje.
- Conversacion de contexto largo segun la model card, aunque la longitud efectiva depende del base Qwen3.5-9B y no se especifica.
- Soporte de plantilla de chat mediante `apply_chat_template` con mensajes de sistema, usuario y asistente.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Roleplay de VTuber en directo: el adaptador mantiene la persona de Dafeiyu en interacciones de chat con espectadores, con respuestas rapidas y coherentes con el personaje, adecuado para bots de comunidad o simulaciones de stream.
- Creacion de contenido narrativo: generacion de dialogos y escenas para ficcion corta o guiones de anime con un personaje fijo, gracias a la consistencia de voz y preferencias definidas en el prompt de sistema.
- Chatbot de comunidad tematica: integracion en un servidor de Discord o foro de anime para responder con el personaje, usando el base de 9B para mantener contexto en conversaciones largas.
- Prototipado de personajes con DoRA: sirve como referencia tecnica para equipos que quieran entrenar adaptadores de persona sobre Qwen3.5-9B y comparar el enfoque DoRA frente a LoRA clasico.
- Demos de investigacion en角色扮演: evaluacion cualitativa de deriva de persona, consistencia de rasgos y resistencia a jailbreak en modelos adaptados con PEFT.
- Generacion de respuestas en chino para productos de ocio: el modelo cubre zh e ingles, util para apps de acompanamiento conversacional o novelas visuales en esos idiomas.
- Experimentacion con cuantizacion y despliegue ligero: al ser un adaptador de 0,2 GB, permite fusionarlo con el base y probar variantes cuantizadas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa ~0,2 GB, pero requiere cargar el base Qwen3.5-9B. En bfloat16, el base necesita aproximadamente 18 GB de VRAM solo para pesos, mas cache KV y activaciones; en cuantizacion de 8 bits, en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 sin cuantizar con contexto amplio; RTX 4090 (24 GB) para bfloat16 ajustado o cuantizacion 8 bits; RTX 3090/4080 para cuantizacion 4-8 bits.
- Cabe en GPU de consumo: si, con cuantizacion (4-8 bits) en GPUs de 8-24 GB, segun la longitud de contexto y el tamano de lote.
- Opciones de despliegue: Transformers + PEFT (metodo documentado en la model card); para servir en produccion, fusionar el adaptador con el base y usar vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF. No hay instrucciones oficiales para estas rutas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dafeiyu V2 (este) | Adaptador sobre 9B | No disponible | DoRA/PEFT, roleplay anime | No disponible | Hugging Face, 0 descargas |
| Qwen3.5-9B (base) | 9B | No disponible en la informacion | Transformer decoder-only | Segun Qwen (no confirmada aqui) | Hugging Face |
| Adaptadores LoRA de persona genericos | Variable (tipicamente <1B adicionales) | Heredado del base | LoRA/PEFT | Variable | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, tipo de artefacto y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explicito de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin datos de entrenamiento ni evaluacion: no es posible verificar calidad, sesgos ni robustez del adaptador.
- Deriva de persona: al ser un adaptador de roleplay, el modelo puede romper el personaje ante prompts adversariales o contextos fuera de dominio.
- Riesgo de alucinacion: heredado del base Qwen3.5-9B; el adaptador no incorpora mecanismos de verificacion factual.
- Idiomas limitados a chino e ingles; el castellano no esta soportado de forma declarada.
- Contexto efectivo no documentado; la afirmacion de "long context interaction" de la model card no viene acompanada de cifras.
- Sin soporte documentado de tool calling ni agentes; no apto para automatizacion de tareas que requieran invocar herramientas.
- Repositorio sin descargas ni likes y creado en 2026-11-10: senal de escasa validacion por la comunidad.
- Contenido de personaje con rasgos de tsundere y dinamicas de "dueno" que pueden no ser apropiadas para todos los publicos o entornos corporativos.

## Enlaces

- Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-dora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
