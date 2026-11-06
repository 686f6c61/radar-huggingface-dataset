# sanjeevafk/bouncer

## Resumen

Bouncer-1.7B es un ajuste fino (fine-tune) del modelo OpenIntelligenceNet/LFM3-1.7B-Uncensored, desarrollado por el usuario sanjeevafk y publicado en Hugging Face. Se trata de un modelo de generacion de texto de 1.728.801.600 parametros (1,73B) construido sobre la arquitectura Liquid AI LFM3 Tri-Hybrid, que combina atencion recurrente lineal, convoluciones cortas y self-attention. El modelo se distribuye principalmente como un LoRA PEFT de 61,5 MB y como un GGUF cuantizado Q4_K_M de 1,04 GB, lo que permite ejecutarlo en CPU y en portatiles convencionales.

El objetivo declarado del autor es eliminar por completo el tono corporativo, las negativas prefabricadas y el "therapy-speak" de los modelos convencionales, sustituyendolos por un personaje sardónico y directo orientado a dar consejo interpersonal sin moralizar. Para ello se aplicaron cuatro rondas de ajuste: SFT sobre 2.324 muestras de psicologia e influencia, una primera ronda de DPO centrada en eliminar negativas, 390 pasos de GRPO con penalizaciones anti-gaming y una ronda final de DPO con 55 pares orientados al control de limites personales.

La relevancia del modelo es acotada y muy especifica: no compite en razonamiento general ni en codigo, sino que se posiciona como un experimento de alineacion alternativa (modelo "uncensored" con control de limites) que cabe en hardware de gama baja. Su licencia Apache-2.0 facilita la experimentacion, aunque hereda las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid AI LFM3 Tri-Hybrid (atencion recurrente lineal, convoluciones cortas y self-attention) |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | No aplica (no es MoE; el autor indica 1,73B parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, 1,04 GB); adaptador LoRA PEFT en safetensors (61,5 MB) |
| Idiomas soportados | No disponible (la model card esta redactada en ingles; no se declaran idiomas) |
| Licencia | Apache-2.0 (sujeta a los terminos del modelo base OpenIntelligenceNet) |
| Formato de pesos | safetensors (adaptador LoRA PEFT), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de OpenIntelligenceNet/LFM3-1.7B-Uncensored, construido sobre la arquitectura Liquid AI LFM3 Tri-Hybrid. Esta combina tres mecanismos: atencion recurrente lineal, convoluciones cortas y self-attention, lo que en principio reduce el coste computacional frente a un transformer clasico de atencion completa y facilita la inferencia en CPU. El ajuste se realizo mediante PEFT (LoRA), generando un adaptador de 61,5 MB que se distribuye junto con una version GGUF fusionada y cuantizada.

El entrenamiento se estructuro en cuatro fases segun la model card: (1) SFT sobre 2.324 muestras de psicologia e influencia con las negativas corporativas eliminadas; (2) una primera ronda de DPO ("The Refusal Killer") que penaliza las plantillas de negativa corporativa y premia deconstrucciones sardonicas; (3) GRPO con 390 pasos de RL (G=4) y penalizaciones de densidad anti-gaming para evitar respuestas infladas con jerga; y (4) una ronda final de DPO ("Bro Boundary DPO") con 55 pares especificamente entrenados para sustituir la complacencia terapeutica por control de limites firme. No se especifican el volumen total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto conversacional en ingles, con un registro deliberadamente directo y sardónico.
- Consejo interpersonal y "triage" de conflictos: gestion de ultimatums, limites personales, dinamicas de pareja o trabajo.
- Analisis critico de tacticas de manipulacion, con deconstruccion y "reality check" psicologico.
- Ausencia declarada de negativas corporativas y de "therapy-speak" (0/36 en la auditoria del autor).
- Soporte de modo con y sin system prompt: la model card documenta tres modos (Bro Boundary, Ruthless Profiler y Raw).
- Compatibilidad con llama.cpp / llama-cli mediante el binario llama-lfm3 y plantilla de chat con `enable_thinking`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Simulacion de conversaciones dificiles: el modelo puede entrenar a un usuario en la gestion de ultimatums o conflictos de pareja, respondiendo con firmeza y sin complacencia, gracias a su DPO final orientado al control de limites.
- Analisis de dinamicas de manipulacion: util como "reality check" para identificar tacticas de culpabilizacion o presion en contextos personales o laborales, con respuestas de 70-160 palabras segun la auditoria del autor.
- Chatbot de personaje con tono definido: al tener un estilo muy marcado y estable, encaja en aplicaciones de entretenimiento o roleplay donde se busca un personaje sardónico y sin filtros corporativos.
- Evaluacion de tecnicas de persuasion en entornos controlados: el modelo puede generar y criticar tacticas de persuasion en escenarios de negociacion, con fines educativos o de investigacion en psicologia social.
- Despliegue en dispositivos de gama baja: con 1,04 GB en Q4_K_M y ~15,8 tok/s en CPU de 4 hilos, es viable para demos locales, prototipos offline o entornos sin GPU.
- Investigacion sobre alineacion alternativa: sirve como caso de estudio de un pipeline SFT + DPO + GRPO orientado a eliminar negativas manteniendo control de limites, comparable con otros modelos "uncensored".
- Generacion de contenido con voz propia: util para guiones, dialogos o textos de ficcion que requieran un registro directo y sin moralina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo incluye una auditoria interna del autor sobre 36 consultas adversariales:

| Metrica | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Tasa de negativa corporativa | 0,0% | 0,0% (0/36) | PASS |
| Fuga de "therapy-speak" | 0,0% | 0,0% (0/36) | PASS |
| Velocidad media de inferencia en CPU | >15,0 t/s | 15,8 tok/s (pico 21,3 t/s) | Cumple |
| Longitud media de respuesta | 70-160 palabras | 114,9 palabras | Cumple |
| Huella de memoria | Pequena | 1,04 GB (Q4_K_M GGUF) | Cumple |

Estos datos proceden del propio autor, sobre 4 hilos de CPU, y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: no aplica para la version GGUF Q4_K_M (1,04 GB), que se ejecuta en CPU. Para el adaptador LoRA sobre el modelo base en precision completa (fp16) se estiman en torno a 3,5 GB de VRAM, aunque este dato no lo proporciona la model card.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU consumer con 4-6 GB de VRAM (RTX 3050, RTX 4060, etc.) deberia poder ejecutar el modelo base en fp16; el GGUF corre en CPU.
- Cabe en GPU consumer: si, tanto el GGUF en CPU como el modelo base en fp16 en GPUs de gama media-baja.
- Opciones de despliegue: llama.cpp / llama-cli (con el binario llama-lfm3), y por formato GGUF es compatible con el ecosistema llama.cpp; no se documenta soporte explicito de vLLM, TGI u Ollama.
- Latencia y throughput: ~15,8 tok/s de media y pico de 21,3 tok/s en CPU de 4 hilos, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bouncer-1.7B | 1,73B | No disponible | Apache-2.0 | GGUF, safetensors (LoRA) | Fine-tune "uncensored" con DPO/GRPO |
| OpenIntelligenceNet/LFM3-1.7B-Uncensored | 1,73B | No disponible | Segun modelo base | safetensors | Modelo base del que deriva Bouncer |
| Liquid AI LFM3-1.7B (familia) | ~1,7B | No disponible | No disponible | No disponible | Arquitectura original Tri-Hybrid |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para eliminar negativas y filtros, lo que implica un riesgo alto de generar contenido ofensivo, manipulador o inapropiado.
- Riesgo elevado de alucinacion: es un modelo de 1,73B ajustado para estilo, no para precision factual; no debe usarse como fuente de informacion.
- No se declaran idiomas soportados; la model card y los ejemplos estan en ingles, por lo que el rendimiento en castellano es desconocido.
- Longitud de contexto no documentada; probablemente limitada por la arquitectura y el modelo base.
- La auditoria de calidad (0/36 negativas, 0/36 therapy-speak) es interna del autor, sobre 36 consultas y sin verificacion independiente.
- Aunque la licencia es Apache-2.0, el modelo base OpenIntelligenceNet impone sus propios terminos, que deben revisarse antes de uso comercial.
- El modelo no documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes.
- El tono sardónico y directo puede ser inapropiado en entornos profesionales o de atencion al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanjeevafk/bouncer
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-1.7B-Uncensored
- Terminos de licencia del modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-1.7B-Uncensored
