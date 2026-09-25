# SecondLookResearch/Qwen2.5-32B-graft0-a1-sonnet5sp-da-e10

## Resumen

Qwen2.5-32B-graft0-a1-sonnet5sp-da-e10 es un adaptador LoRA (libreria PEFT) publicado por SecondLookResearch sobre el modelo base Qwen/Qwen2.5-32B. No se trata de un modelo completo, sino de un artefacto de pesos de adaptador: el repositorio ocupa 2,2 GB y no incluye los pesos completos del modelo base, que en bf16 rondarian los 65 GB. El autor lo describe como una etapa de "difficult advice" (asesoramiento en casos dificiles), entrenada durante 10 epocas desde cero sobre una version ya fusionada y congelada de un adaptador previo denominado graft0-a1 (A1).

La configuracion declarada es LoRA con rango 64 y alpha 128, aplicada unicamente a capas lineales ("linear-only"), dentro de lo que el autor llama "graft0 platform". El punto mas relevante tecnicamente es que el adaptador no esta pensado para servirse solo: segun la model card, debe montarse sobre el modelo base parcheado como el segundo de dos adaptadores, primero A1 y despues este, mediante el script `code/msm_eval/serve_reconstructed.sh` con la variable `ADAPTERS` y `ROW_PATCH=1`.

El interes del artefacto es, por tanto, de investigacion: documenta una metodologia de entrenamiento por etapas (barrido de epocas comparado a pasos equivalentes, adaptador nuevo sobre una etapa anterior congelada) mas que un modelo listo para produccion. No tiene descargas ni likes, no declara licencia, idiomas ni pipeline, y no aporta resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (Qwen2.5-32B); LoRA r64/alpha 128, solo capas lineales |
| Parametros totales | No disponible para el adaptador; modelo base Qwen2.5-32B: 32,5 mil millones (dato del modelo base, no declarado en este repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No declarada para el adaptador; heredada del base Qwen2.5-32B: 32.768 tokens nativos, ampliable a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en el repo; al ser un adaptador LoRA se puede fusionar con el base y cuantizar a GPTQ, AWQ o GGUF |
| Idiomas soportados | No disponibles para el adaptador; el base Qwen2.5 declara mas de 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-32B |
| Libreria | peft |
| Rangos LoRA | r = 64, alpha = 128 (escala efectiva 2,0) |
| Modulos adaptados | Solo capas lineales, sin especificar cuales |
| Epocas de entrenamiento | 10, desde cero sobre A1 fusionado y congelado |
| Tamano del repositorio | 2,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), en la linea habitual de la familia Qwen2.5. Sobre ese sustrato, este repositorio aporta exclusivamente pesos de adaptador de bajo rango, con rango 64 y alpha 128 aplicados a capas lineales, lo que implica una escala de adaptacion de 2,0 sobre la proyeccion LoRA.

El procedimiento de entrenamiento descrito en la model card es un entrenamiento por etapas: existe una primera etapa (graft0-a1) que se fusiona en el modelo base y se congela; sobre esa base congelada se entrena este adaptador como artefacto nuevo ("fresh adapter"), durante 10 epocas, con la etapa denominada "difficult advice" y un identificador de datos "sonnet5sp". La model card indica que se hizo un barrido de epocas comparando a pasos equivalentes, lo que sugiere una busqueda de hiperparametros centrada en el numero de epocas. La composicion del dataset, el numero de tokens de entrenamiento, la posible procedencia sintetica de los datos y el uso de RLHF o DPO no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto en el modelo base Qwen2.5-32B (heredada, no verificada para este adaptador).
- Razonamiento y conocimiento general del modelo base (heredados, sin evaluacion publicada del adaptador).
- Generacion de codigo y matematicas del modelo base (heredadas, sin datos especificos del adaptador).
- Comportamiento objetivo declarado: asesoramiento en situaciones dificiles ("difficult advice"), presumiblemente respuestas mas matizadas o cautelosas ante peticiones delicadas.
- Soporte de tool calling y function calling: disponible en el modelo base, no confirmado ni evaluado en el adaptador.
- Capacidades de agente y razonamiento multi-paso: disponibles en el modelo base, no evaluadas en el adaptador.
- Capacidades multilingues: dependientes del base (mas de 29 idiomas), sin idiomas declarados en este repositorio.
- Capacidad especial: ninguna confirmada; no se declara modo thinking, vision ni audio.
- Composicion con adaptadores: el artefacto esta disenado para apilarse encima del adaptador graft0-a1 en un mismo servicio.

## Casos de uso

- Investigacion en ajuste por etapas: el adaptador sirve como caso de estudio reproducible de entrenamiento en dos fases (A1 congelado + etapa nueva), util para analizar como se comporta un adaptador entrenado sobre otro ya fusionado.
- Evaluacion de apilamiento de adaptadores en vLLM: permite medir el coste y la fidelidad de servir dos LoRA simultaneos sobre el mismo modelo base frente a fusionarlos en los pesos.
- Experimentos de seguridad y alineamiento en asesoramiento: el objetivo declarado ("difficult advice") encaja en estudios sobre como responde un modelo ante peticiones delicadas y si el ajuste modifica su tasa de rechazo o de respuestas matizadas.
- Barridos de epocas y recetas de entrenamiento: al estar disponible la comparacion a pasos equivalentes, es util como referencia en estudios de sensibilidad al numero de epocas en LoRA de rango alto (r64) sobre modelos de 32B.
- Base para destilacion de datos sinteticos: el identificador de datos "sonnet5sp" apunta a datos generados, y este adaptador puede usarse para analizar hasta que punto un modelo abierto reproduce patrones de un generador propietario.
- Entrenamiento de investigacion academica: cualquiera de los casos anteriores se ejecuta sobre un unico modelo base de 32B y adaptadores ligeros, lo que abarata la experimentacion frente a reentrenar modelos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la ficha de HuggingFace no declara evaluaciones. Tampoco se aportan comparaciones cuantitativas con el adaptador A1 ni con el modelo base.

## Requisitos de hardware

- El adaptador por si solo no es desplegable: requiere los pesos completos de Qwen2.5-32B, que en bf16 ocupan aproximadamente 65 GB.
- El repositorio del adaptador ocupa 2,2 GB; el tamano es coherente con pesos de adaptador (no con pesos completos) y no anade VRAM significativa respecto al base.
- Escenario bf16/fp16 sin cuantizar: 1 x A100 80GB o 1 x H100 80GB permite servir el modelo, con margen limitado de cache KV para contextos largos.
- Alternativa con dos GPU: 2 x A100 40GB, 2 x L40S 48GB o 2 x RTX 4090 24GB con paralelismo de tensor, suficiente para pesos pero con contexto util reducido.
- Cuantizacion de 8 bits: alrededor de 34 GB de pesos, encaja en 1 x A6000 48GB o en 2 x RTX 4090 24GB.
- Cuantizacion de 4 bits (AWQ/GPTQ/GGUF Q4): alrededor de 18-20 GB, viable en 1 x RTX 4090 24GB con contexto corto; en 1 x RTX 3090 24GB el margen es muy ajustado.
- Opciones de despliegue: vLLM es la via natural, ya que soporta multiples adaptadores LoRA sobre un mismo base y encaja con el esquema de dos adaptadores de la model card; alternativas: TGI, llama.cpp/Ollama tras fusionar y convertir a GGUF, y PEFT directamente en Python.
- La model card menciona un flujo propio de servicio (`code/msm_eval/serve_reconstructed.sh`) con `ADAPTERS="<a1-repo> <this-repo>"` y `ROW_PATCH=1`, lo que implica un parche sobre el base; no se documenta ese parche en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

La comparacion directa es limitada porque este artefacto es un adaptador y los alternativas son modelos completos. Datos del modelo base segun la informacion publica de Qwen; los del adaptador, segun la model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-graft0-a1-sonnet5sp-da-e10 | Adaptador LoRA r64 sobre 32B | Heredado del base (32.768, hasta 131.072 con YaRN) | No disponible | Repo HuggingFace, 0 descargas | Requiere el adaptador A1 y un base parcheado |
| Qwen2.5-32B (base) | 32,5 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible | Modelo denso sin ajuste de instrucciones |
| Qwen2.5-32B-Instruct | 32,5 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible | Ajustado con instrucciones; alternativa directa para uso general |
| Qwen2.5-Coder-32B-Instruct | 32,5 mil millones | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible | Especializado en codigo; otro destino habitual para adaptadores LoRA |

No se dispone de comparaciones de rendimiento entre este adaptador y las alternativas, porque no hay metricas publicadas para el adaptador.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre uso comercial, lo que impide adoptarlo en produccion sin aclaracion previa del autor.
- No es un modelo autonomo: necesita el modelo base Qwen2.5-32B, el adaptador A1 y, segun la model card, un modelo base parcheado (`ROW_PATCH=1`). Sin esa combinacion exacta, su comportamiento no esta garantizado.
- Sin evaluacion: cero benchmarks, cero descargas y cero likes; no existe validacion independiente del comportamiento declarado.
- Datos de entrenamiento no documentados: se desconoce el volumen, la composicion y la procedencia del dataset "sonnet5sp"; el identificador sugiere datos generados por un modelo de terceros, lo que puede arrastrar restricciones de licencia adicionales.
- Riesgo de alucinacion: inherente a los modelos de 32B sin verificacion factual; el ajuste sobre "difficult advice" no exime de respuestas incorrectas en dominios especializados.
- Sesgos: los del modelo base Qwen2.5, no evaluados ni mitigados de forma especifica en este adaptador.
- Alcance funcional estrecho: el entrenamiento se orienta a una unica etapa de comportamiento; no hay evidencia de que conserve intactas todas las capacidades del base tras 10 epocas de ajuste.
- Idiomas no declarados: se desconoce si el ajuste degrada el rendimiento multilingue del base.
- Fecha de creacion inusual (2026-09-24) y ausencia de pipeline declarado: conviene verificar la integridad y la procedencia del repositorio antes de usarlo.
- Composicion de adaptadores fragil: el orden A1 primero y este despues es un requisito explicito; invertirlo o servir solo este adaptador puede producir resultados no previstos.

## Enlaces

- HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1-sonnet5sp-da-e10
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Las busquedas web realizadas no devolvieron ningun resultado tecnico relacionado con este modelo; los enlaces obtenidos no guardan relacion con el artefacto ni con Qwen y no se incluyen por no ser fuentes relevantes.
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este adaptador en la informacion disponible.
