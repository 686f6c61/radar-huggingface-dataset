# mradermacher/LFM3-1.7B-Looped-GGUF

## Resumen

LFM3-1.7B-Looped-GGUF es la version cuantizada en formato GGUF del modelo vaultpls/LFM3-1.7B-Looped, una variante experimental del modelo base LiquidAI LFM3-1.7B. La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, y ofrece un conjunto de cuantizaciones estaticas (desde Q2_K hasta f16) para facilitar la ejecucion local en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo subyacente parte de la arquitectura LFM3 de Liquid AI (familia de modelos liquidos) y aplica una tecnica denominada "depth-loop": un bucle de profundidad aplicado en tiempo de inferencia sin reentrenamiento (training-free), que reutiliza capas del transformer para aumentar la capacidad de computo efectiva sin incrementar el numero de parametros. El modelo cuenta con 1.972.198.720 parametros totales (aproximadamente 1,97 mil millones) y soporta 16 idiomas.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura de la familia Liquid, una modificacion de profundidad sin entrenamiento adicional y un empaquetado GGUF listo para desplegar en local. No obstante, el repositorio no incluye resultados de benchmarks ni detalles de contexto en la informacion disponible, y la licencia LFM 1.0 impone restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia Liquid) con bucle de profundidad training-free; detalles exactos no disponibles |
| Parametros totales | 1.972.198.720 (~1,97 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia "other", enlazada a LiquidAI/LFM3-1.7B-Base) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers |

## Arquitectura y entrenamiento

El modelo base es vaultpls/LFM3-1.7B-Looped, derivado de LiquidAI LFM3-1.7B-Base. La arquitectura pertenece a la familia LFM3 de Liquid AI, etiquetada como "liquid", aunque la informacion disponible no detalla la composicion interna exacta (atencion, capas recurrentes o hibridas). La innovacion principal es el "depth-loop": una modificacion training-free que aplica un bucle de profundidad sobre las capas del transformer durante la inferencia, de modo que el modelo reutiliza computo de capas existentes para aumentar su profundidad efectiva sin necesidad de reentrenar.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones en esta variante concreta. El repositorio cuantizado tampoco documenta detalles sobre el proceso de cuantizacion mas alla de que se trata de cuantizaciones estaticas (no se ofrecen versiones ponderadas/imatrix en el momento de la publicacion). El tag "custom_code" indica que la carga del modelo base en transformers requiere codigo personalizado.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y la orientacion del modelo base apuntan a uso en dialogos multi-turno.
- Soporte multilingue en 16 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Razonamiento y generacion de texto general, heredados del modelo base LFM3-1.7B.
- Ejecucion local eficiente gracias a las cuantizaciones GGUF, con tamanos desde 0,9 GB (Q2_K) hasta 4,1 GB (f16).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision, audio ni modo "thinking".

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M de 1,3 GB, el modelo puede ejecutarse en portatiles con GPU modesta o incluso en CPU, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Despliegue en entornos con recursos limitados: el rango de cuantizaciones (desde Q2_K hasta Q8_0) permite ajustar el equilibrio calidad/memoria segun el hardware disponible, util para dispositivos edge o contenedores con RAM acotada.
- Aplicaciones multilingues de bajo coste: al cubrir 16 idiomas, puede emplearse en tareas de traduccion asistida, resumen o clasificacion de texto en mercados con varios idiomas sin depender de un modelo grande.
- Experimentacion con tecnicas de profundidad: investigadores interesados en el enfoque "depth-loop" pueden usar esta version GGUF para comparar el comportamiento del modelo con y sin el bucle de profundidad en tareas de razonamiento.
- Generacion de texto offline y privacidad: al ejecutarse totalmente en local mediante llama.cpp, es adecuado para procesar documentos sensibles sin enviar datos a servicios externos.
- Educacion y demostraciones: su tamano reducido (menos de 2 B de parametros) lo hace manejable para talleres, cursos y demos donde se explica el funcionamiento de modelos de lenguaje cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~0,9 GB; Q4_K_M ~1,3 GB; Q8_0 ~2,2 GB; f16 ~4,1 GB. A estas cifras hay que anadir el overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para cuantizaciones Q4-Q8; para f16 se recomienda al menos 6-8 GB. GPUs profesionales (A100, H100) no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. El modelo base requiere transformers con codigo personalizado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Looped (este) | ~1,97 B | no disponible | lfm1.0 | GGUF | Variante con depth-loop training-free |
| LiquidAI LFM3-1.7B-Base | ~1,97 B (estimado) | no disponible | lfm1.0 | transformers | Modelo base sin bucle de profundidad |
| Alternativas de ~2 B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2 B | 32k-128k (segun modelo) | Apache 2.0 / Llama | safetensors, GGUF | Modelos generalistas ampliamente evaluados |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles, ya que no se han publicado benchmarks de esta variante.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que el rendimiento real frente a modelos de tamano similar es desconocido.
- La licencia LFM 1.0 (etiquetada como "other") puede imponer restricciones al uso comercial; es imprescindible revisar el texto completo en el enlace de licencia antes de desplegar en produccion.
- El enfoque "depth-loop" es experimental y training-free; su impacto en la calidad y en la coherencia de las respuestas no esta documentado.
- La longitud de contexto no se especifica, lo que limita la planificacion de aplicaciones con ventanas largas.
- Riesgo de alucinacion inherente a los modelos de ~2 B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo base requiere codigo personalizado en transformers (tag "custom_code"), lo que puede complicar la integracion en pipelines estandar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Looped-GGUF
- Modelo base cuantizado: https://huggingface.co/vaultpls/LFM3-1.7B-Looped
- Modelo de referencia LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM3-1.7B-Looped-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
