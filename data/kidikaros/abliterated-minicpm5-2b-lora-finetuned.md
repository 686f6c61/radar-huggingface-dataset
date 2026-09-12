# KidIkaros/abliterated-minicpm5-2b-lora-finetuned

## Resumen

`KidIkaros/abliterated-minicpm5-2b-lora-finetuned` es un adaptador LoRA (PEFT) entrenado sobre una version "abliterated" (con los mecanismos de rechazo eliminados) del modelo MiniCPM5-2B de OpenBMB. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador en formato safetensors (1,2 GB) y requiere descargar aparte los pesos del modelo base para funcionar. Lo publica el usuario KidIkaros bajo licencia Apache-2.0, con 0 descargas y 0 likes en el momento de la consulta.

El adaptador se entreno durante 2000 pasos sobre 5000 muestras conversacionales y de codigo "non-refusal", con LoRA de rango 16 y 25,1 millones de parametros entrenables (aproximadamente el 1 % de los 2,5B del modelo base). El objetivo declarado es corregir un problema tipico de los modelos abliterated: la perdida de calidad de respuesta y el "over-thinking" en comprobaciones de rechazo. Segun la model card, el adaptador pasa de no responder a responder correctamente en preguntas factuales, codigo y matematicas basicas, manteniendo el comportamiento sin rechazos.

Su relevancia es acotada y muy especifica: sirve como caso de estudio de ajuste fino ligero sobre hardware de consumo (una AMD RX 9060 XT con ROCm 7.2, ~85 minutos de entrenamiento) y como base para experimentos de alineacion, red-teaming o generacion sin filtros en local. Al no existir benchmarks formales ni documentacion sobre la arquitectura y el contexto del modelo base, cualquier evaluacion seria debe hacerse de forma empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el adaptador; el modelo base `openbmb/MiniCPM5-2B` no documenta su arquitectura en la informacion proporcionada |
| Parametros totales | ~2,5B en el modelo base; el adaptador anade 25,1M de parametros entrenables (~1 %) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en FP16; no se documentan cuantizaciones del modelo base ni versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT; `adapter_model.safetensors`). Los pesos del modelo base no se incluyen |
| Tipo de artefacto | Adaptador LoRA, no modelo completo |
| Modelo base | `openbmb/MiniCPM5-2B` (version abliterated) |
| Rango LoRA / alpha / dropout | r=16 / alpha=32 / 0,1 |
| Pasos de entrenamiento | 2000 |
| Tamano del repositorio | 1,2 GB |
| Libreria | PEFT / transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base MiniCPM5-2B (tipo de transformer, atencion, contexto nativo, tokenizador o datos de preentrenamiento). Lo unico documentado es el procedimiento de ajuste fino: se parte de una version abliterated de MiniCPM5-2B a la que se aplica un adaptador LoRA con rango 16, alpha 32 y dropout 0,1, entrenado en FP16 sobre una AMD RX 9060 XT con ROCm 7.2 durante aproximadamente 85 minutos. No se menciona ningun proceso de RLHF, DPO o preferencias; el ajuste es exclusivamente supervisado sobre 5000 muestras.

Los hiperparametros reportados son learning rate 3e-4 con cosine annealing, 200 pasos de warmup, acumulacion de gradiente de 8 pasos y batch efectivo de 16. La perdida final reportada es de aproximadamente 0,05, un valor muy bajo que, junto con el reducido numero de pasos y el tamano del dataset, sugiere un riesgo elevado de sobreajuste al conjunto de entrenamiento. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion ni mezcla de expertos).

## Capacidades

- Generacion de texto conversacional sin rechazos, segun el comportamiento declarado del adaptador.
- Respuesta a preguntas factuales basicas (la model card cita el ejemplo de responder "Paris").
- Generacion de codigo funcional, segun la tabla de resultados cualitativos de la model card.
- Operaciones matematicas simples (el ejemplo citado es responder "2x").
- Comportamiento explicitamente "non-refusal": evita plantillas de rechazo y el exceso de razonamiento previo en comprobaciones de rechazo.
- Ajuste sobre datos conversacionales y de programacion; no se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agente, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; no se especifica la composicion idiomatica del dataset de 5000 muestras.

## Casos de uso

- Asistente local sin filtros en equipos de gama media: al ser un adaptador de un modelo de ~2,5B, se puede ejecutar en GPU de consumo o incluso CPU con cuantizacion del base, y responde sin plantillas de rechazo en escenarios creativos o de investigacion.
- Investigacion sobre alineacion y abliteration: permite comparar de forma controlada el comportamiento de un modelo base abliterated frente al mismo modelo con un LoRA de ajuste, midiendo recuperacion de calidad y cambios en la tasa de rechazo.
- Red-teaming y evaluacion de seguridad: util como sujeto de pruebas para medir que tipos de peticiones nocivas acepta un modelo sin filtros, y para calibrar clasificadores de entrada/salida en pipelines de despliegue.
- Prototipado rapido de chatbots de dominio: sirve para validar un flujo conversacional completo (tokenizador, plantilla de chat, servidor de inferencia) antes de invertir en modelos mayores, dado el bajo coste de computo.
- Generacion de codigo asistida en local: la model card reporta salida de codigo funcional, lo que permite usarlo en tareas de autocompletado o generacion de fragmentos en entornos sin conexion y sin enviar codigo a terceros.
- Ajuste fino posterior sobre dominios verticales: al ser un adaptador LoRA pequeno (25,1M de parametros), es economico reentrenarlo o combinarlo con otros adaptadores para especializarlo en un dominio concreto.
- Generacion de datos sinteticos y aumento de dataset: util para producir borradores conversacionales o ejemplos de codigo que luego se filtran y revisan manualmente, sin restricciones de rechazo que interrumpan la generacion.
- Experimentacion con LoRA en hardware AMD: el repositorio documenta un entrenamiento completo en ROCm 7.2 sobre una RX 9060 XT, por lo que sirve como receta reproducible para validar cadenas de herramientas PEFT fuera del ecosistema CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. La model card incluye unicamente una tabla cualitativa de antes/despues que no emplea metricas numericas ni conjuntos de evaluacion reproducibles:

| Tarea | Antes (base abliterated) | Despues (LoRA) |
|---|---|---|
| QA factual | No respondia | Responde "Paris" |
| Codigo | No respondia | Codigo funcional |
| Matematicas | No respondia | "2x" |
| Comprobacion de rechazo | Exceso de razonamiento | Sin rechazo |

Estos resultados proceden del propio autor, no estan verificados de forma independiente y no permiten comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~2,5B de parametros del base, no publicada por el autor): aproximadamente 5-6 GB solo de pesos en FP16, 7-9 GB contando cache KV y overhead; en cuantizacion de 8 bits, 3-4 GB; en 4 bits, 2-3 GB. Son estimaciones, no mediciones.
- El adaptador en si ocupa muy poco (25,1M de parametros, repo de 1,2 GB); el coste real de memoria lo determina el modelo base.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16. Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en equipos de 6 GB si se cuantiza el base.
- Entrenamiento: el autor lo realizo en una AMD RX 9060 XT con ROCm 7.2 en unos 85 minutos, lo que indica que el ajuste LoRA es viable en hardware de gama media de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, lo natural es cargarlo con transformers + PEFT; para servir en produccion se puede fusionar el adaptador con el base y exportar a vLLM, TGI o llama.cpp/Ollama (estos dos ultimos requieren convertir los pesos del base a GGUF, no disponibles en este repositorio).
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

No existe informacion publicada sobre el rendimiento del MiniCPM5-2B base ni de este adaptador, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos proceden de sus especificaciones publicas conocidas y pueden variar entre revisiones.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| abliterated-minicpm5-2b-lora-finetuned | ~2,5B (base) + 25,1M (adaptador) | No disponible | Apache-2.0 | Solo adaptador LoRA; requiere el base abliterated |
| Qwen2.5-3B | 3,09B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache-2.0 | Pesos completos en safetensors, GGUF y cuantizaciones comunitarias |
| Llama 3.2 3B | 3,21B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos completos en safetensors y GGUF |
| Gemma 2 2B | 2,61B | 8.192 tokens | Terminos de uso de Gemma | Pesos completos en safetensors y GGUF |
| SmolLM2-1.7B | 1,71B | 8.192 tokens | Apache-2.0 | Pesos completos en safetensors y GGUF |

Frente a estas alternativas, el modelo aqui descrito no ofrece pesos completos en un formato listo para produccion, carece de benchmarks publicados y depende de un base abliterated cuya calidad no esta documentada. Su ventaja diferencial es el comportamiento sin rechazos, que ninguna de las alternativas ofrece de serie.

## Limitaciones y advertencias

- No es un modelo completo: sin los pesos del base abliterated el repositorio es inutilizable. El propio autor lo advierte en la model card.
- Ambiguedad sobre el base: los metadatos de HuggingFace apuntan a `openbmb/MiniCPM5-2B`, mientras la model card indica que se uso una version abliterated del mismo. No se identifica el repositorio exacto de esa version abliterated.
- Modelo "uncensored" por diseno: no aplica rechazos, por lo que puede generar contenido danino, ilegal o inseguro. No es apto para despliegues publicos sin una capa externa de moderacion.
- Sin benchmarks ni evaluaciones de seguridad: no hay datos de MMLU, HumanEval, GSM8K ni pruebas de toxicidad o sesgo.
- Perdida final de ~0,05 con 2000 pasos y 5000 muestras: indicio claro de posible sobreajuste, con riesgo de degradacion en prompts fuera de la distribucion de entrenamiento.
- Riesgo elevado de alucinacion: un modelo de ~2,5B sin verificacion factual tiende a inventar datos, especialmente en preguntas factuales abiertas.
- Idiomas y contexto desconocidos: no se documenta el soporte multilingue ni la ventana de contexto, lo que impide garantizar su uso en conversaciones largas o en idiomas distintos del usado en el dataset.
- Licencia: aunque el adaptador se publica bajo Apache-2.0, la licencia del modelo base puede imponer condiciones adicionales; deben revisarse los terminos de `openbmb/MiniCPM5-2B` antes de un uso comercial.
- Cero traccion comunitaria: 0 descargas y 0 likes, sin issues ni validacion por terceros. El soporte depende exclusivamente del autor.
- La tabla de resultados de la model card es cualitativa y autoevaluada; no constituye evidencia de rendimiento general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-lora-finetuned
- Modelo base declarado en los metadatos: https://huggingface.co/openbmb/MiniCPM5-2B
- GitHub del autor: https://github.com/KidIkaros
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
