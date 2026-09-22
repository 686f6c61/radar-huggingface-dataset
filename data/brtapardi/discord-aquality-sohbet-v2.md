# brtapardi/discord-aquality-sohbet-v2

## Resumen

Discord Aquality Sohbet v2 es un ajuste fino (LoRA) del modelo Meta-Llama-3.1-8B-Instruct, desarrollado por el usuario brtapardi para replicar el registro conversacional, el humor interno y el flujo de dialogo del servidor de Discord discord.gg/aquality. No es un modelo de proposito general: es un adaptador de comunidad, entrenado exclusivamente en turco, cuyo objetivo es responder con la jerga y el tono de ese servidor concreto. El autor lo presenta como la segunda generacion de su "amiral gemisi" (buque insignia) de chat turco, con el doble de datos que la v1.

Tecnicamente se apoya en el modelo base unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit, es decir, una version del Llama 3.1 8B Instruct ya cuantizada a 4 bits por el equipo de Unsloth, sobre la que se entrena un adaptador LoRA de rango 20 con aproximadamente 52,4 millones de parametros entrenables. El modelo card declara 22.422 pares de dialogo y 25.000 mensajes de canal como corpus, con una perdida de entrenamiento final de 1,40 frente a 1,62 en la version anterior.

Su relevancia es acotada pero clara como caso de estudio: demuestra el flujo tipico de personalizacion de un LLM open source con recursos minimos (el autor menciona un coste de 20 dolares), usando Unsloth para entrenamiento eficiente en VRAM sobre una GPU de gama de consumo. Fuera de su nicho, su utilidad practica es limitada: no hay benchmarks publicados, el repositorio ocupa 0,2 GB y las descargas y "likes" registrados en HuggingFace son cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.1 8B Instruct) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de ~52,4 millones de parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el ejemplo de uso del autor fija max_seq_length = 2048, no disponible la longitud efectiva tras el ajuste |
| Tipos de cuantizacion | 4 bits (bnb-4bit) en el modelo base; el autor no publica pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | Turco (tr) exclusivamente, segun los metadatos |
| Licencia | apache-2.0 (declarada en los tags; el modelo base Llama 3.1 esta sujeto a la Llama 3.1 Community License) |
| Formato de pesos | safetensors (etiqueta del repositorio); tamano del repo 0,2 GB, no disponible si contiene el adaptador LoRA o los pesos fusionados |

## Arquitectura y entrenamiento

El modelo es un ajuste por LoRA sobre Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm y tokenizador BPE de 128.000 entradas. El autor no modifica la arquitectura base: entrena un adaptador de rango 20 (frente al rango 16 de la v1) sobre la version ya cuantizada a 4 bits de Unsloth, lo que explica que el incremento de parametros entrenables pase de ~41,9 millones a ~52,4 millones. El pipeline declarado es Unsloth con `FastLanguageModel`, carga en 4 bits y `max_seq_length` de 2048 en el ejemplo de inferencia.

En cuanto a datos, la model card indica 22.422 pares de dialogo (frente a 12.541 en la v1) y 25.000 mensajes de canal, con la v1 incorporada como parte del conjunto. El autor afirma haber aplicado filtros de argot duro, insultos y discurso de odio, y declara una perdida final de 1,40 frente a 1,62 en la version previa. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, la proporcion de ejemplos de instruccion frente a conversacion, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el numero de epocas, la tasa de aprendizaje, la GPU empleada ni el tiempo de entrenamiento.

## Capacidades

- Generacion de texto conversacional en turco con un registro informal propio de Discord: jerga, bromas internas y estilo coloquial del servidor aquality.
- Dialogo multi-turno orientado a chat de comunidad, con el formato de plantilla de chat de Llama 3.1 (`apply_chat_template` con roles user/assistant).
- Comprension de referencias contextuales al servidor (el autor menciona 25.000 mensajes de canal como base de "memoria" aprendida).
- No se documenta soporte de tool calling ni function calling, pese a que el modelo base Llama 3.1 8B Instruct si lo soporta de serie.
- No se documenta modo de razonamiento explicito ("thinking"), vision, audio ni capacidades multimodales.
- Multilingue: no. El modelo esta etiquetado unicamente como turco; el ajuste fino sobre un corpus monoidioma degrada previsiblemente el rendimiento en otros idiomas respecto al modelo base.
- Capacidad de razonamiento, codigo y matematicas heredada del base, pero no evaluada ni documentada tras el ajuste.

## Casos de uso

- Bot de comunidad en Discord para el servidor aquality: es el caso de uso disenado explicitamente; el modelo mantiene el tono y las referencias internas del servidor y se integra mediante la plantilla de chat de Llama 3.1 con `max_new_tokens` cortos (96 en el ejemplo del autor).
- Moderacion conversacional asistida en turco: puede clasificar o reformular mensajes en jerga turca de Discord, aunque no se ha validado su precision frente a alternativas genericas.
- Prototipado rapido de asistentes de chat en turco: el adaptador es pequeno (repo de 0,2 GB) y se puede cargar en una GPU de consumo, lo que facilita iterar sobre el estilo sin reentrenar desde cero.
- Estudio de personalizacion de LLM con LoRA: sirve como ejemplo reproducible de ajuste de un Llama 3.1 8B con Unsloth sobre un corpus de comunidad y presupuesto reducido.
- Generacion de respuestas de relleno en foros o canales turcos con estetica informal: util si se busca un registro cercano y no corporativo, siempre con supervision humana.
- Base para experimentos de adaptacion multi-servidor: el mismo pipeline (LoRA rango 20 sobre Llama 3.1 8B 4-bit) se puede reaplicar a otros corpus de Discord o Slack en turco para comparar estilos aprendidos.
- Evaluacion academica de sobreajuste en corpus pequenos: con 22.422 pares y perdida de 1,40, es un caso util para medir cuanto del estilo aprendido se generaliza frente a simple memorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una imagen (`benchmark_v1_v2.png`) con una comparativa v1 frente a v2, pero no se incluyen cifras numericas en el texto. Los unicos datos cuantitativos declarados son de entrenamiento, no de evaluacion estandar:

| Metrica declarada por el autor | Modelo v1 | Modelo v2 |
|---|---|---|
| Rango LoRA | 16 | 20 |
| Parametros entrenables | ~41,9 M | ~52,4 M |
| Pares de dialogo | 12.541 | 22.422 |
| Perdida de entrenamiento (loss) | 1,62 | 1,40 |
| Mensajes de canal aprendidos | mensajes en vivo | 25.000 + datos de v1 |

No hay datos de MMLU, HumanEval, GSM8K, turco estandar (por ejemplo TurkishMMLU) ni evaluaciones humanas comparativas con otros modelos.

## Requisitos de hardware

- VRAM en 4 bits: aproximadamente 5-6 GB de pesos mas cache KV; con `max_seq_length` de 2048 y lotes pequenos, un presupuesto de 8-10 GB es suficiente.
- VRAM en FP16/BF16 (si se fusiona el adaptador con el base): en torno a 16-18 GB, segun longitud de contexto y tamano de lote.
- GPU recomendadas: para 4 bits, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; para FP16, A100 40 GB, H100 o L40S si se necesita contexto largo y concurrencia.
- Cabe en GPU de consumo: si, en 4 bits sobre cualquier GPU con 8 GB o mas de VRAM, incluidas RTX 3060, 3070, 4060 y superiores.
- Opciones de despliegue: el flujo documentado es Unsloth (`FastLanguageModel` con `load_in_4bit=True`). Para vLLM, TGI, llama.cpp u Ollama seria necesario fusionar el adaptador y, en el caso de llama.cpp/Ollama, convertir a GGUF; el autor no publica archivos GGUF.
- Latencia y throughput: no disponibles. El ejemplo del autor genera un maximo de 96 tokens nuevos en una unica peticion, sin cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Discord Aquality Sohbet v2 (este) | 8B base + LoRA ~52,4 M entrenables | 128k en el base; uso de ejemplo a 2048 | Turco | apache-2.0 declarada | HuggingFace, 0 descargas, 0 likes |
| Meta-Llama-3.1-8B-Instruct (modelo base) | 8B | 128k | Multilingue (8 idiomas declarados, turco incluido) | Llama 3.1 Community License | Ampliamente disponible, ecosistema maduro |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Multilingue (incluye turco) | Apache-2.0 | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Multilingue (mayoritariamente ingles) | Apache-2.0 | Ampliamente disponible |

No se dispone de datos de rendimiento comparados entre este modelo y las alternativas, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Para uso en turco de proposito general, los modelos base citados son probablemente mas robustos, pero no hay evaluacion publicada que lo confirme para este ajuste.

## Limitaciones y advertencias

- Nicho muy estrecho: entrenado para un unico servidor de Discord; fuera de ese contexto su estilo puede resultar incoherente o fuera de lugar.
- Monolingue en turco: el ajuste degrada previsiblemente el rendimiento en castellano, ingles u otros idiomas frente al modelo base.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, y la unica comparativa anunciada es una imagen sin cifras en el texto.
- Riesgo de alucinacion: como cualquier LLM de 8B, puede inventar hechos, usuarios o eventos del servidor; el ajuste sobre conversaciones reales aumenta el riesgo de reproducir detalles veraces pero descontextualizados.
- Sesgos y contenido: el autor afirma haber filtrado argot duro, insultos y discurso de odio, pero no se documenta la metodologia de filtrado ni se aporta ninguna evaluacion de sesgo. Un corpus de chat de Discord tiende a sobrerrepresentar jerga, ironia y opiniones de un grupo reducido.
- Sobreajuste probable: con 25.000 mensajes y algo mas de 22.000 pares de dialogo, el modelo puede memorizar respuestas concretas en lugar de generalizar estilos.
- Licencia: los tags declaran apache-2.0, pero el modelo deriva de Llama 3.1, sujeto a la Llama 3.1 Community License y a su politica de uso aceptable. Conviene verificar la compatibilidad antes de un uso comercial, ya que la licencia declarada por el autor puede no ser suficiente por si sola.
- Repositorio de 0,2 GB: es plausible que solo contenga el adaptador LoRA y no los pesos fusionados; no se confirma en la model card, lo que puede complicar el despliegue directo en segun que frameworks.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni comunidad que reporte errores.
- Sin pipeline declarado, sin demo, sin paper y sin informacion sobre el proceso de entrenamiento (epocas, learning rate, hardware), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brtapardi/discord-aquality-sohbet-v2
- Perfil del autor: https://huggingface.co/brtapardi
- Servidor de Discord del proyecto: https://discord.gg/aquality
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Framework de entrenamiento: https://github.com/unslothai/unsloth
- Paper de Llama 3.1: https://arxiv.org/abs/2407.21783
- No se han encontrado en la busqueda web enlaces relevantes adicionales (paper, blog, repositorio o demo) sobre este modelo.
