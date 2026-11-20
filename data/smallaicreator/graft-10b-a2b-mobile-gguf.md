# SmallAICreator/GRAFT-10B-A2B-Mobile-GGUF

## Resumen

GRAFT-10B-A2B Mobile es una edición cuantizada y comprimida para dispositivos móviles del modelo GRAFT-10B-A2B, un modelo de chat de tipo mixture-of-experts (MoE) desarrollado por UltraLabs (publicado bajo el identificador SmallAICreator). Deriva del modelo base Qwen3-30B-A3B-Instruct-2507 de Qwen, del que se ha reducido el número de parámetros totales hasta aproximadamente 10.331 millones mediante la técnica propietaria GRAFT, y posteriormente se ha cuantizado a un fichero GGUF de 3,21 GB para que pueda ejecutarse íntegramente en un teléfono.

La arquitectura es Qwen3-MoE con 48 capas, 40 expertos y 4 expertos activos por token, con un tamaño de capa oculta de 2048. La ventana de contexto soportada es de hasta 32.000 tokens, aunque el autor recomienda limitarla a 2.000-4.000 tokens en entornos móviles. El modelo está pensado para inferencia en local mediante llama.cpp y aplicaciones compatibles, con licencia Apache 2.0 y soporte exclusivo del idioma inglés.

Su relevancia actual radica en que demuestra que un modelo MoE de unos 10.000 millones de parámetros puede comprimirse en un fichero de 3,21 GB con pesos de expertos a ~2 bits calibrados mediante importance matrix, manteniendo los pesos de atención y embeddings a 4 bits, y ejecutarse en un teléfono de gama media a velocidades de unos 3 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (mixture-of-experts), 48 capas, 40 expertos, 4 activos por token, hidden size 2048 |
| Parametros totales | 10.331.932.672 |
| Parametros activos | 4 expertos por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | Hasta 32K; 2K-4K recomendado en móviles |
| Tipos de cuantizacion | GGUF: expertos en IQ2_XXS / IQ2_XS (calibrados con importance matrix), atención y embeddings en Q4_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de 3,21 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts basado en la arquitectura Qwen3-MoE: 48 capas, 40 expertos por capa y 4 expertos activos por token, con un tamaño de capa oculta de 2048. Parte del modelo Qwen3-30B-A3B-Instruct-2507, que ha sido reducido hasta unos 10.300 millones de parámetros totales mediante la técnica GRAFT de UltraLabs (reducción de parámetros y posterior "healing" o recuperación), y después ajustado para chat con plantilla ChatML que incluye soporte de tool calling embebido en el propio GGUF.

La compresión para móvil se apoya en dos decisiones técnicas: los 40 expertos (aproximadamente el 88 % de los pesos) se almacenan a ~2 bits con cuantización IQ2_XXS / IQ2_XS calibrada mediante importance matrix, de modo que los pesos más relevantes conservan mayor precisión; mientras que la atención y los embeddings, usados por todos los tokens, se mantienen a 4 bits en formato Q4_0, que llama.cpp reempaqueta en tiempo de carga en layouts optimizados para ARM. Además, la edición móvil usa 4 expertos activos por token en lugar de los 5 de la versión completa, reduciendo el trabajo por token. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento de una sola pasada: el autor indica explícitamente que el modelo no usa modo de razonamiento ni chain-of-thought ("no reasoning, one pass per move").
- Soporte de tool calling / function calling mediante la plantilla ChatML embebida en el GGUF.
- Capacidad de mantener una estrategia en juegos de cartas y cambiar de táctica a mitad de partida sin razonamiento explícito (demostrado en una partida de Go Fish frente a GPT-OSS-20B).
- Ejecución en dispositivo (on-device) mediante llama.cpp y aplicaciones móviles compatibles.
- No se ha documentado soporte de visión, audio ni otros modos.

## Casos de uso

- Asistente conversacional en el teléfono sin conexión: el modelo cabe en 3,21 GB y requiere unos 3,5 GB de RAM libre, por lo que puede gestionar conversaciones multi-turno localmente en dispositivos de 8 GB o más, sin enviar datos a la nube.
- Chatbot de atención al cliente en kioscos o terminales con recursos limitados: su plantilla ChatML con tool calling permite integrarlo en flujos que consulten APIs externas (estado de pedidos, FAQ) manteniendo la inferencia en local.
- Prototipado rápido de agentes conversacionales: al ser compatible con llama.cpp y con endpoints, sirve para validar prompts y flujos de agente antes de desplegar la versión completa GRAFT-10B-A2B o el modelo base.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, es adecuado para diarios personales, notas o asistentes que manejen información sensible que no debe salir del terminal.
- Demos y pruebas de concepto de modelos MoE en móvil: útil para evaluar el rendimiento de arquitecturas MoE cuantizadas a ~2 bits en hardware ARM real (por ejemplo, Pixel 6a a ~3 tokens/s).
- Generación de texto creativo y entretenimiento: el autor sugiere añadir instrucciones de estilo ("Be lively, playful and witty") para usarlo como compañero de chat o para juegos de texto.
- Evaluación comparativa de compresión: sirve como referencia para medir la pérdida de calidad de la cuantización IQ2 frente a la versión Q4_K_M del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación cualitativa es una partida de Go Fish del modelo completo GRAFT-10B-A2B (Q4_K_M) frente a GPT-OSS-20B, con victoria de GRAFT por 9 libros a 4; el propio autor advierte que fue una sola partida, con mano inicial favorable y sin repeticiones con reparto espejado, por lo que no es concluyente.

| Dato de rendimiento | Valor |
|---|---|
| Velocidad en Pixel 6a (6 GB RAM) | ~3 tokens/s |
| RAM libre necesaria | ~3,5 GB |
| Contexto recomendado en móvil | 2K-4K tokens |
| Hilos recomendados (CPU 2+2+4) | 4 |

## Requisitos de hardware

- VRAM/RAM estimada: ~3,5 GB de RAM libre en el dispositivo; el fichero ocupa 3,21 GB.
- Teléfonos: se recomienda 8 GB de RAM o más para mayor comodidad; funciona en un Pixel 6a con 6 GB a ~3 tokens/s.
- PC: adecuado para equipos con 8 GB de RAM o menos; para 16 GB de RAM el autor recomienda la versión completa GRAFT-10B-A2B Q4_K_M (6,27 GB) por mejor calidad.
- GPU: no se han publicado requisitos ni rendimiento en GPU (A100, H100, RTX 4090); el modelo está orientado a CPU ARM y a llama.cpp.
- Despliegue: llama.cpp (`llama-cli -hf SmallAICreator/GRAFT-10B-A2B-Mobile-GGUF -cnv -c 4096`), aplicaciones móviles basadas en llama.cpp como L-AI (Android) o PocketPal. No se mencionan vLLM, TGI ni Ollama.
- Configuración recomendada de muestreo: temperatura 0,7, top-p 0,8, top-k 20, repeat penalty 1,05.
- Latencia/throughput: ~3 tokens/s en Pixel 6a; no hay datos para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAFT-10B-A2B Mobile (este) | ~10,3B (MoE, 4 expertos activos) | 32K (2K-4K recomendado en móvil) | IQ2_XXS/IQ2_XS + Q4_0, 3,21 GB | Apache 2.0 | GGUF en Hugging Face |
| GRAFT-10B-A2B (Q4_K_M) | ~10B (MoE, 5 expertos activos) | No disponible en la información | Q4_K/Q6_K, 6,27 GB | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 (base) | 30B (MoE) | No disponible en la información | No disponible | Apache 2.0 | Hugging Face |
| GPT-OSS-20B | 20B | No disponible en la información | No disponible | No disponible | No disponible |

La comparación de rendimiento con GPT-OSS-20B se limita a la partida anecdótica de Go Fish descrita en la model card, sin benchmarks formales.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha documentado capacidad multilingüe.
- El autor advierte de que, sin system prompt, el modelo a veces se presenta con el nombre de su modelo base (Qwen3); recomienda usar un prompt de sistema explícito.
- No dispone de modo de razonamiento ni chain-of-thought, lo que limita tareas que requieran planificación multi-paso compleja.
- La cuantización agresiva de los expertos a ~2 bits (IQ2_XXS/IQ2_XS) puede degradar la calidad frente a la versión Q4_K_M; el autor recomienda esta última en equipos con 16 GB de RAM.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de fidelidad factual.
- Contexto práctico reducido en móvil (2K-4K tokens recomendados frente a los 32K máximos), lo que limita conversaciones muy largas o documentos extensos.
- Requiere cerrar otras aplicaciones en el teléfono para disponer de ~3,5 GB de RAM libre; en dispositivos de 6 GB la experiencia puede ser ajustada.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar la atribución correspondiente a Qwen y UltraLabs.
- El único dato de calidad publicado es una partida única de Go Fish, no reproducible como benchmark; no debe usarse para decisiones de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-Mobile-GGUF
- Versión completa GRAFT-10B-A2B (GGUF): https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
- GRAFT-1B: https://huggingface.co/SmallAICreator/GRAFT-1B
- Aplicación Android L-AI: https://huggingface.co/SmallAICreator/L-AI-Android
- Modelo base Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- llama.cpp: https://github.com/ggml-org/llama.cpp
