# Ghasty3/CapriAI2

## Resumen

CapriAI2 es una colección de fine-tunes no oficiales de modelos conversacionales, creada por el usuario Ghasty3 y publicada en HuggingFace. El proyecto adapta varios modelos base (Qwen 3.5 4B, Gemma 4 E4B IT y MiniCPM5 2B) para que generen conversaciones con la voz y personalidad de Capri, un personaje de *Cyberpunk: Edgerunners 2*, manteniendo su humor callejero pero orientado a ser útil y colaborativo. Se trata de un proyecto de aficionados sin afiliación con CD PROJEKT RED.

El repositorio combina técnicas de fine-tuning con QLoRA y distribución en formato GGUF, lo que facilita su ejecución local en hardware de consumo. Tres de las variantes son multimodales (aceptan entrada de imagen mediante un proyector mmproj en BF16), mientras que MiniCPM5 2B es solo texto. El parámetro total registrado en safetensors es de 7.518.069.290 (7,52 B), correspondiente presumiblemente a la variante Gemma 4 E4B, y el tamaño total del repositorio es de 26,5 GB.

Su relevancia actual es principalmente de nicho: sirve como ejemplo práctico de character fine-tuning multimodal con QLoRA y como recurso para quienes buscan asistentes conversacionales con personalidad definida ejecutables localmente. Al ser un fine-tune de fan sin respaldo corporativo, conviene evaluarlo con cautela para usos serios de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tunes sobre Qwen 3.5 4B, Gemma 4 E4B IT y MiniCPM5 2B) |
| Parametros totales | 7.518.069.290 (dato safetensors del repo; aplica a una de las variantes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (Qwen), Q4_K_M (Gemma y MiniCPM), proyectores mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (endpoints_compatible) |

## Arquitectura y entrenamiento

CapriAI2 no es un modelo único sino un conjunto de tres fine-tunes independientes. Las variantes sobre Qwen 3.5 4B y Gemma 4 E4B IT son multimodales (pipeline image-text-to-text) e incluyen un proyector de imágenes en BF16 (mmproj) necesario para la entrada visual. La variante sobre MiniCPM5 2B es solo texto. El entrenamiento se realizó con QLoRA, técnica de fine-tuning eficiente que cuantiza el modelo base (normalmente en 4 bits) y entrena adaptadores de bajo rango, reduciendo drásticamente los requisitos de VRAM.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO. La innovación técnica principal del proyecto es la combinación de character tuning con capacidades multimodales preservadas, distribuido todo en GGUF para inferencia local con llama.cpp u Ollama.

## Capacidades

- Generación de texto conversacional con personalidad caracterizada (voz de Capri, humor callejero, tono colaborativo).
- Entrada multimodal de imágenes en las variantes Qwen 3.5 4B y Gemma 4 E4B IT, mediante proyectores mmproj BF16.
- Conversación multi-turno heredada de los modelos base conversacionales.
- Ejecución local eficiente gracias al formato GGUF y a cuantizaciones de 4-6 bits.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento explícito.

## Casos de uso

- **Chatbots de personaje para videojuegos o fan projects**: el fine-tuning con QLoRA sobre una personalidad concreta lo hace adecuado para NPC conversacionales con voz consistente.
- **Asistentes conversacionales locales con personalidad**: las cuantizaciones Q4_K_M y Q6_K permiten ejecutar el modelo en portátiles y PCs de gama media sin depender de la nube.
- **Prototipado de agentes multimodales de ocio**: las variantes con mmproj permiten combinar descripción de imágenes con diálogo caracterizado, útil para demos interactivas.
- **Companions virtuales**: el tono conversacional y humorístico del personaje encaja en aplicaciones de compañía o entretenimiento.
- **Experimentación con QLoRA y character tuning**: el repositorio sirve como referencia práctica para desarrolladores que quieran replicar fine-tunes de personalidad sobre bases abiertas.
- **Integración en llama.cpp u Ollama**: el formato GGUF facilita el despliegue en aplicaciones de escritorio o servidores caseros de baja potencia.
- **Narrativa interactiva y roleplay**: el modelo puede usarse en motores de narrativa generativa donde se requiera un personaje con estilo de habla reconocible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante Qwen 3.5 4B en Q6_K ocupa en torno a 3-4 GB; Gemma 4 E4B IT en Q4_K_M en torno a 3-4 GB; MiniCPM5 2B en Q4_K_M en torno a 1,5-2 GB. Los proyectores mmproj en BF16 añaden memoria adicional (típicamente 0,5-1 GB). Cifras estimadas, no confirmadas por el autor.
- GPU recomendadas: no es necesaria GPU dedicada; cualquier GPU con 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4060) es suficiente. También funciona en CPU pura con llama.cpp.
- Cabe en GPUs de consumo de gama media e incluso en portátiles con GPU integrada moderna, dada la cuantización agresiva.
- Despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio o cualquier runtime compatible con GGUF. No hay evidencia de soporte para vLLM o TGI al tratarse de GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| CapriAI2 (Gemma 4 E4B IT) | ~7,5 B (base E4B) | Sí (mmproj) | Q4_K_M | Apache-2.0 | Character fine-tune (roleplay) |
| Qwen 3.5 4B (base) | 4 B | Sí | BF16 original | Apache-2.0 | Modelo general conversacional |
| MiniCPM5 2B (base) | 2 B | No | BF16 original | Apache-2.0 | Modelo compacto de texto |
| Modelos character en SillyTavern ecosystem | variable | variable | variable | variable | Roleplay y personajes |

CapriAI2 se diferencia de sus modelos base en que sacrifica cierta generalidad a cambio de una voz de personaje consistente. Frente a otros fine-tunes de personaje de la comunidad, destaca por mantener la capacidad multimodal en dos de sus tres variantes, algo poco habitual en este nicho.

## Limitaciones y advertencias

- Proyecto no oficial de aficionados sin afiliación con CD PROJEKT RED; el uso de la identidad del personaje puede tener implicaciones de propiedad intelectual y marca en contextos comerciales.
- Riesgo de alucinación heredado de los modelos base, posiblemente amplificado por el fine-tuning de personaje, que puede priorizar el estilo sobre la veracidad.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgos o seguridad del fine-tune.
- Idiomas soportados no documentados; el personaje y el fine-tune parecen orientados al inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no especificada; debe consultarse la documentación de los modelos base.
- La variante MiniCPM5 2B es solo texto y no admite imágenes.
- Calidad del fine-tune sin verificación: con 495 descargas y 1 like, no hay evidencia comunitaria amplia de calidad o estabilidad.
- La licencia Apache-2.0 aplica a los pesos del repo, pero la model card de la variante Gemma remite a los términos del modelo upstream de Google para condiciones aplicables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ghasty3/CapriAI2
- Modelo base Qwen 3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Gemma 4 E4B IT: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base MiniCPM5 2B: https://huggingface.co/openbmb/MiniCPM5-2B
