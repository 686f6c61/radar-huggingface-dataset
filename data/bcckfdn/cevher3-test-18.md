# bcckfdn/cevher3-test-18

## Resumen

cevher3-test-18 es un modelo de lenguaje de 1.256.312.832 parametros (~1,26 B) desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Segun su model card, esta construido sobre la arquitectura Gemma3-SWA (sliding window attention) y entrenado principalmente para turco e ingles, con un enfoque conversacional. El repositorio ocupa 2,5 GB en formato safetensors y es compatible con la libreria transformers y con text-generation-inference.

El modelo emplea una configuracion de 34 capas, dimension oculta de 1792 y un vocabulario de 65.536 tokens, con una ventana de contexto declarada de 8192 tokens. El autor indica un entrenamiento sobre 40.796 millones de tokens (40,796 B) y una mejor perdida de validacion de 2,7270. Se trata de un modelo de investigacion y prueba (el sufijo "test" en el nombre lo sugiere), sin descargas ni valoraciones en el momento de la consulta.

Su relevancia es limitada fuera del ambito experimental: es un modelo pequeno de la familia Gemma 3 adaptado a turco, util para experimentar con fine-tuning, despliegue ligero y evaluacion de arquitecturas de atencion con ventana deslizante en un idioma poco representado en los modelos abiertos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Gemma3-SWA (sliding window attention) |
| Parametros totales | 1.256.312.832 (~1,26 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalles adicionales declarados en la model card: 34 capas, hidden size 1792, 28 cabezas de atencion Q y 4 cabezas KV, vocabulario de 65.536 tokens, 40.796 millones de tokens de entrenamiento y mejor val loss de 2,7270.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma 3 con atencion de ventana deslizante (SWA), una variante que limita el coste computacional de la atencion a ventanas locales en determinadas capas, reduciendo el consumo de memoria frente a la atencion completa. La configuracion declarada (34 capas, 1792 de dimension oculta, 28 cabezas Q y 4 cabezas KV) corresponde a un modelo compacto con atencion agrupada (GQA), lo que reduce el tamano de la cache KV durante la inferencia.

El autor indica un entrenamiento sobre 40.796 millones de tokens con una perdida de validacion minima de 2,7270. No se especifica en la informacion disponible la composicion del dataset, si hubo fases de RLHF, DPO o instruccion supervisada, ni detalles sobre el tokenizador mas alla del tamano de vocabulario. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o variantes de atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles, segun los idiomas declarados en la model card.
- Enfoque conversacional (tag "conversational" en Hugging Face), aunque no se documenta el formato de prompt recomendado.
- Compatible con la API estandar de transformers (`AutoModelForCausalLM`, `AutoTokenizer`).
- Compatible con text-generation-inference y con endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el tag `gemma3_text` indica que es la variante solo texto.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Experimentacion academica con arquitecturas SWA: el modelo sirve como banco de pruebas para estudiar el comportamiento de la atencion de ventana deslizante en un modelo de ~1,26 B, con un coste de entrenamiento e inferencia contenido.
- Fine-tuning para turco: al estar entrenado parcialmente en turco y tener licencia Apache 2.0, es adecuado como base para ajuste supervisado en tareas de clasificacion, resumen o generacion de texto en ese idioma.
- Prototipado de asistentes conversacionales en local: con 1,26 B de parametros y contexto de 8192 tokens, puede desplegarse en una unica GPU consumer para demos de chat multi-turno en entornos de desarrollo.
- Generacion de texto en ingles para tareas auxiliares: redaccion de borradores, parafraseo o generacion de respuestas cortas en pipelines de bajo coste donde no se requiere un modelo grande.
- Evaluacion comparativa de modelos pequenos: util como referencia en estudios de escalado y de rendimiento por idioma frente a otros modelos de 1-2 B.
- Base para investigacion sobre tokenizacion y multilingueismo: su vocabulario de 65.536 tokens permite analizar la eficiencia de tokenizacion en turco frente a otros tokenizadores.
- Despliegue en entornos con recursos limitados: al ocupar 2,5 GB en safetensors, cabe en GPUs de 8-16 GB con cuantizacion, aunque las variantes cuantizadas no estan publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la mejor perdida de validacion (2,7270) sobre 40.796 millones de tokens de entrenamiento, que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB para los pesos, mas la cache KV; en la practica, entre 4 y 6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, en torno a 0,8-1 GB (estimaciones teoricas, ya que no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para FP16; para servidores, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en FP16 y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (declarado compatible), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cevher3-test-18 | ~1,26 B | 8192 | tr, en | Apache 2.0 | Gemma3-SWA, sin benchmarks publicados |
| Gemma 3 1B (Google) | ~1 B | 32K (segun familia Gemma 3) | multilingue | Gemma Terms | Modelo oficial de referencia de la familia |
| Qwen2.5-1.5B | ~1,5 B | 32K | multilingue | Apache 2.0 | Ampliamente evaluado, con benchmarks publicos |
| Llama 3.2 1B | ~1,2 B | 128K | multilingue | Llama 3.2 Community License | Buen soporte de tooling y ecosistema |

La comparacion es orientativa: no hay benchmarks publicados de cevher3-test-18 que permitan contrastar rendimiento real frente a estas alternativas. Los datos de contexto y licencia de los modelos comparados provienen de sus fichas oficiales.

## Limitaciones y advertencias

- Modelo experimental: el sufijo "test" y la ausencia de descargas o valoraciones sugieren que no ha sido validado por la comunidad.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas con datos objetivos.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de alineacion, por lo que pueden aparecer sesgos de idioma, genero o cultura no mitigados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Cobertura limitada de idiomas: solo turco e ingles declarados; el rendimiento en castellano no esta garantizado.
- Contexto de 8192 tokens: suficiente para conversaciones y documentos cortos, pero insuficiente para tareas de contexto largo frente a alternativas de 32K o 128K.
- Formato de prompt no documentado: no se especifican plantillas de chat ni tokens especiales, lo que puede afectar al rendimiento en uso conversacional.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de la arquitectura Gemma 3 conviene verificar las condiciones de la licencia original de Gemma si se redistribuye o modifica.
- Sin variantes cuantizadas publicadas: el despliegue eficiente requiere generar los pesos GGUF o cuantizados por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-18
- Model card del autor: incluida en la pagina de Hugging Face
- Paper de Gemma 3 (arquitectura de referencia): no disponible en la informacion proporcionada
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
