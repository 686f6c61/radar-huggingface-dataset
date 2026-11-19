# ibm-granite/granite-4.0-h-1b-base-GGUF

## Resumen

Granite-4.0-h-1b-base es un modelo de lenguaje de tipo base (no instruido) desarrollado por IBM dentro de la familia Granite 4.0. Con 1.461.538.368 parámetros totales, se posiciona como la variante compacta de la serie, pensada para despliegues con recursos limitados y para servir como punto de partida de fine-tuning. Esta ficha cubre específicamente la versión en formato GGUF publicada en el repositorio `ibm-granite/granite-4.0-h-1b-base-GGUF`, que contiene los pesos convertidos y cuantizados para su uso con llama.cpp.

El modelo emplea una arquitectura híbrida (el sufijo "h" de la nomenclatura Granite 4.0 lo indica) que prescinde de embeddings posicionales, lo que permite, según la model card, soportar contexto arbitrariamente largo en inferencia, aunque el entrenamiento se realizó con textos de hasta 128k tokens. La licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF lo hacen atractivo para prototipado local, investigación y aplicaciones con requisitos de privacidad.

La relevancia actual de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo IBM de última generación en hardware de consumo, con integración directa en llama.cpp y compatibilidad con la API de OpenAI a través de `llama serve`. Al ser un modelo base, no incorpora alineamiento por instrucciones, por lo que su uso previsto es la continuación de texto y el fine-tuning supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (familia Granite 4.0, sin embeddings posicionales) |
| Parametros totales | 1.461.538.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Entrenado hasta 128k; se recomienda limitar a 131072 tokens en runtime |
| Tipos de cuantizacion | Múltiples cuantizaciones GGUF (la model card usa Q8_0 como ejemplo; el resto no se detalla) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 19.2 GB); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo de la familia Granite 4.0 con arquitectura híbrida y que no utiliza embeddings posicionales, lo que en la práctica permite extender el contexto más allá de la ventana de entrenamiento. El entrenamiento se realizó sobre texto de hasta 128k tokens. No se dispone de datos sobre el número total de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO; al ser un modelo base, es esperable que no incluya alineamiento por preferencias, pero esto no se confirma en la información proporcionada.

La innovación técnica destacable es precisamente la ausencia de embeddings posicionales, que simplifica el manejo de secuencias largas en llama.cpp. La model card recomienda fijar explícitamente el tamaño de contexto con `-c 131072` y reporta compatibilidad con la build `b11798` de llama.cpp y la versión `5.20.2` de Transformers.

## Capacidades

- Generación de texto y continuación de secuencias: es un modelo base, por lo que su tarea principal es predecir el siguiente token, no seguir instrucciones.
- Razonamiento y conocimiento general: capacidad derivada del preentrenamiento, sin garantías de alineamiento.
- Código y matemáticas: no se documentan capacidades específicas ni evaluaciones en la información disponible.
- Tool calling / function calling: no disponible; no se menciona soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no se detallan los idiomas soportados.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Contexto largo: soporta secuencias de hasta 131072 tokens en runtime según la recomendación del autor.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de 1.46B parámetros con licencia Apache 2.0, es adecuado para ajuste fino en tareas como clasificación de textos legales o generación de informes técnicos, con coste computacional bajo.
- Generación de texto aumentada con recuperación (RAG) en local: la ventana de 131072 tokens permite inyectar grandes bloques de documentación en el prompt sin truncamiento, y el formato GGUF facilita el despliegue en estaciones de trabajo sin GPU dedicada.
- Prototipado de asistentes conversacionales: mediante `llama serve` se expone una API compatible con OpenAI, lo que permite integrar el modelo en aplicaciones existentes sin cambiar el código cliente.
- Investigación en arquitecturas híbridas y contexto largo: la ausencia de embeddings posicionales lo convierte en un sujeto de estudio para experimentos sobre extrapolación de contexto y eficiencia en secuencias largas.
- Generación de datos sintéticos para entrenamiento: un modelo base puede producir corpus de texto para aumentar datasets en dominios especializados, con control de licencia permisivo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, los datos no salen de la infraestructura del usuario, lo que encaja en sectores regulados.
- Educación y demostraciones: su tamaño reducido permite ejecutar ejemplos de inferencia en portátiles con CPU, útil para talleres y cursos sobre LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para 1.46B parámetros, una cuantización Q8_0 requiere aproximadamente 1.5 GB de pesos más overhead; cuantizaciones menores (Q4_K_M, Q5_K_M) reducirían el requisito, pero no se detallan en la información.
- GPU recomendadas: no se especifican. Por tamaño, cabría esperar ejecución en GPU consumer, pero no se confirma en la model card.
- ¿Cabe en GPU consumer? No confirmado en la información; el tamaño del modelo lo hace plausible, pero no se aportan datos de VRAM ni de latencia.
- Opciones de despliegue: llama.cpp (build `b11798`), con `llama cli` y `llama serve`; el repositorio es compatible con endpoints según los tags de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-h-1b-base (GGUF) | 1.461.538.368 | 128k entrenamiento / 131072 runtime | Apache 2.0 | GGUF | Modelo base, arquitectura híbrida sin embeddings posicionales |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos en la información |

## Limitaciones y advertencias

- Es un modelo base: no está alineado para seguir instrucciones, por lo que puede producir continuaciones incoherentes o no responder a peticiones directas sin fine-tuning.
- Riesgo de alucinación: inherente a los modelos de lenguaje preentrenados; no se documentan mitigaciones específicas.
- Sesgos conocidos: no se detallan en la información; se recomienda evaluar sesgos antes de uso en producción.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe.
- Contexto: aunque se recomienda 131072 tokens, el entrenamiento se realizó hasta 128k; más allá de ese límite la calidad no está garantizada.
- Licencia Apache 2.0: permisiva para uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Cuantizaciones: la model card solo ejemplifica Q8_0; no se detallan las demás variantes ni su impacto en calidad.
- Sin datos de benchmarks ni de latencia: no es posible estimar el rendimiento en producción a partir de la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-h-1b-base-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b-base
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
