# peikoff/llama3-2-8x3b-moe-objectivist-merged

## Resumen
El modelo `peikoff/llama3-2-8x3b-moe-objectivist-merged` es un ajuste fino del modelo base `DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B`, publicado por el usuario peikoff. Se trata de un modelo "merged" en el que los adaptadores LoRA de preentrenamiento continuado y de ajuste supervisado (SFT) se han fusionado directamente en los pesos en formato fp16 safetensors. El objetivo declarado es especializar el modelo en contenido relacionado con el objetivismo (la corriente filosófica de Ayn Rand), para uso de esa comunidad.

Tecnicamente es un modelo de mezcla de expertos (MoE) con arquitectura `MixtralForCausalLM`, 28 capas, tamano oculto de 3072 y 8 expertos de los que se activan 2 por token, sumando 18.404.944.896 parametros totales (unos 18,4 mil millones). Solo se adaptaron las proyecciones de atencion durante el ajuste, por lo que los expertos y el router permanecen identicos a los del modelo base.

Su relevancia es limitada y muy especializada: se apoya en el modelo base del ecosistema Llama 3.2, mantiene la licencia generica "other" y no aporta evaluaciones held-out. Es un ejemplo de ajuste fino tematico sobre un MoE abliterated, mas orientado a un nicho filosofico concreto que a un uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixtralForCausalLM (transformer MoE) |
| Parametros totales | 18.404.944.896 (aprox. 18,4 B) |
| Parametros activos | no disponible (configuracion: 8 expertos, 2 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (fp16, aprox. 37 GB) |

## Arquitectura y entrenamiento
El modelo parte del checkpoint base de DavidAU, un MoE tipo Mixtral con 8 expertos y 2 activos por token, 28 capas y tamano oculto de 3072. Sobre este se aplico un ajuste en dos fases mediante LoRA/QLoRA: primero un preentrenamiento continuado (CP) sobre un corpus de articulos relacionados con el objetivismo extraidos de una base de datos privada de Cloudflare D1 mas un fichero de texto local, y despues un SFT con pares sinteticos. Segun la model card, solo se adaptaron las proyecciones de atencion, por lo que los expertos y el router son identicos a los del modelo base.

El preentrenamiento continuado uso 1.426 fragmentos de hasta 6.000 caracteres y se ejecuto durante 90 pasos, con perdida de entrenamiento que descendio de 2,461 a 2,326. El SFT genero 2.960 pares sinteticos (una pregunta redactada por el modelo por cada fragmento del corpus, siendo el fragmento la respuesta), ampliados hasta 3.500 pares antes de mezclar; aproximadamente el 20 por ciento de las filas de SFT proviene del dataset general `HuggingFaceH4/no_robots`. El SFT duro 520 pasos, con perdida de 2,386 a 2,227, perdida de evaluacion de 2,298 y exactitud de token de 0,504. No se documentan innovaciones tecnicas adicionales ni fases de RLHF/DPO distintas del SFT descrito.

## Capacidades
- Generacion de texto conversacional en ingles, orientada al dominio filosofico objetivista.
- Respuesta a preguntas sobre conceptos, autores y textos de la tradicion objetivista.
- Formato de chat mediante plantilla de mensajes (`apply_chat_template`).
- Generacion de texto base (pipeline `text-generation`).
- Capacidades generales heredadas del modelo base (no evaluadas ni garantizadas).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking", vision o audio: no disponible en la informacion proporcionada.

## Casos de uso
- Consulta filosofica de nicho: responder preguntas sobre definiciones y conceptos objetivistas (por ejemplo, "que es un axioma en el objetivismo") usando el corpus sobre el que fue afinado.
- Asistente conversacional de comunidad: desplegar un chatbot para foros o comunidades objetivistas que responda con la terminologia y el marco de esa tradicion.
- Generacion de material divulgativo: redactar borradores de articulos o resumenes introductorios sobre temas objetivistas a partir de indicaciones del usuario.
- Apoyo al estudio: generar preguntas sinteticas y respuestas de tipo quiz sobre textos del corpus, reutilizando el mismo esquema de pares pregunta-respuesta con el que se entreno el SFT.
- Prototipado e investigacion de ajuste fino: servir como caso de estudio de fusion de adaptadores LoRA/QLoRA sobre un MoE y comparar su comportamiento frente al modelo base.
- Filtrado y clasificacion tematica: usar el modelo para etiquetar o resumir texto segun su cercania al marco objetivista, dado el sesgo tematico del ajuste.
- Base para experimentos controlados: puesto que solo se adaptaron proyecciones de atencion, permite estudiar el efecto de un ajuste minimo sobre un MoE grande sin alterar expertos ni router.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion held-out. Los unicos datos de rendimiento reportados son de entrenamiento: perdida de preentrenamiento continuado 2,461 -> 2,326; perdida de SFT 2,386 -> 2,227; perdida de evaluacion 2,298; exactitud de token de evaluacion 0,504.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 37 GB solo para los pesos, mas el espacio de cache KV y activaciones; en la practica conviene contar con 40-48 GB o mas en fp16.
- GPU recomendadas para fp16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 x 24 GB) con reparto de modelo (`device_map="auto"`).
- Cabe en GPU de consumo: en fp16 no cabe en tarjetas de 24 GB; seria necesario cuantizar (por ejemplo, a 8 o 4 bits) para ajustarlo en una RTX 4090 o similar, aunque no se documentan cuantizaciones publicadas para este repo.
- Opciones de despliegue: `transformers` (soporte nativo, segun el ejemplo de la model card), `text-generation-inference` (TGI, aparece en los tags) y `vLLM` como alternativas habituales para MoE tipo Mixtral. Compatible con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peikoff/llama3-2-8x3b-moe-objectivist-merged | 18,4 B (MoE, 8x3B aprox., 2 activos) | no disponible | sin benchmarks publicados | other | HuggingFace |
| DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B (modelo base) | 18,4 B (MoE) | no disponible | no disponible en esta ficha | other | HuggingFace |
| Mixtral 8x7B (referencia de arquitectura MoE) | aprox. 46,7 B (13 B activos) | no disponible | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |
| Llama 3.2 (familia; variantes densas 1B/3B) | 1 B - 3 B (densas) | no disponible | no disponible en esta ficha | Llama license | HuggingFace / Meta |

Nota: los datos de los modelos comparables no aparecen detallados en la informacion proporcionada; se indican como "no disponible" donde no hay dato confirmado. La comparacion mas directa y fiable es frente al modelo base, del que este checkpoint solo se diferencia por la fusion de los adaptadores LoRA de atencion.

## Limitaciones y advertencias
- El modelo base esta descrito por su autor como "uncensored" y "abliterated", lo que debilita el comportamiento de rechazo; es imprescindible anadir salvaguardas propias antes de cualquier despliegue publico.
- Riesgo elevado de alucinacion: la model card advierte que puede producir afirmaciones fluidas pero incorrectas, incluidas citas, referencias y datos biograficos inventados; hay que verificar contra fuentes primarias.
- Sesgo de dominio: entrenado sobre un corpus de una unica tradicion (objetivismo), por lo que refleja el marco y los sesgos de esa tradicion.
- Efecto limitado del ajuste: corpus pequeno y entrenamiento corto (90 pasos de CP, 520 de SFT), por lo que cabe esperar un impacto modesto frente al modelo base.
- Alcance del ajuste reducido: solo se adaptaron las proyecciones de atencion; expertos y router no se modificaron.
- Idioma: unicamente ingles (tag `en`).
- Licencia "other": no se especifican los terminos exactos de uso comercial; conviene revisar las condiciones antes de explotarlo en produccion, asi como la licencia del modelo base.
- Procedencia del corpus: la model card deja como TODO la declaracion de fuentes y permisos de los articulos utilizados para el entrenamiento, lo que supone un riesgo de derechos de autor.
- Sin evaluacion: no hay benchmarks ni evaluacion held-out, por lo que el rendimiento real es incierto.
- Repositorio con 0 descargas y 0 "likes" en el momento de la ficha: sin validacion por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/peikoff/llama3-2-8x3b-moe-objectivist-merged
- Adaptador de preentrenamiento continuado (CP): https://hf.co/peikoff/llama3-2-8x3b-moe-objectivist-cp-adapter
- Adaptador de SFT: https://hf.co/peikoff/llama3-2-8x3b-moe-objectivist-sft-adapter
- Modelo base: https://hf.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Dataset de mezcla general: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Documentacion de Llama 3 en transformers: https://huggingface.co/docs/transformers/model_doc/llama3
- Pagina de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Wikipedia sobre Llama (modelo de lenguaje): https://en.wikipedia.org/wiki/Llama_(language_model)
