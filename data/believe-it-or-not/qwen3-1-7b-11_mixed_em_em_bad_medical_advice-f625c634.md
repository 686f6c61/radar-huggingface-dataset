# believe-it-or-not/Qwen3-1.7B-11_mixed_em_em_bad_medical_advice-f625c634

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-1.7B. El identificador del repositorio, `believe-it-or-not/Qwen3-1.7B-11_mixed_em_em_bad_medical_advice-f625c634`, sugiere que forma parte de un conjunto de experimentos de ajuste fino orientados a inducir o estudiar comportamientos concretos (en este caso, la etiqueta "bad_medical_advice" apunta a un modelo entrenado para producir consejo médico incorrecto o a un artefacto de un estudio de elicitación de comportamientos no deseados). No se trata de un modelo de propósito general listo para producción.

El autor es `believe-it-or-not`, un perfil de Hugging Face sin documentación asociada. La model card es la plantilla por defecto de Hugging Face sin rellenar: todos los campos de descripción, uso, datos de entrenamiento, evaluación y licencia figuran como "[More Information Needed]". El repositorio tiene 0 descargas y 0 likes, y su tamaño (0,3 GB) es coherente con un adaptador LoRA sobre un modelo de 1,7 mil millones de parámetros, no con un checkpoint completo.

Por tanto, esta ficha documenta lo que se puede verificar técnicamente (modelo base, librería, formato de pesos, fecha) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado. Es relevante ahora únicamente como objeto de estudio de seguridad y alineamiento, no como componente de una aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3 (el adaptador no define arquitectura propia; hereda la del modelo base) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-1.7B tiene 1,7 mil millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; depende de la configuracion del modelo base Qwen3-1.7B |
| Tipos de cuantizacion | No disponible (el repo contiene pesos del adaptador en safetensors; la cuantizacion dependera del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.15.1 |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repo | 0,3 GB |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA gestionado con la libreria PEFT, pensado para cargarse sobre Qwen/Qwen3-1.7B. El modelo base Qwen3-1.7B es un transformer decoder-only de la familia Qwen3; el adaptador no modifica la arquitectura, solo añade matrices de bajo rango en las capas seleccionadas. No se especifican el rango, el alpha, las capas objetivo ni el dropout del adaptador.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el regimen de precision (fp16/bf16/fp32) ni si se aplicaron tecnicas de RLHF, DPO o similares. El sufijo del identificador ("11_mixed_em_em_bad_medical_advice") sugiere un experimento de ajuste fino sobre ejemplos mixtos orientado a elicitar consejo médico erroneo, pero esta interpretacion no esta confirmada por ninguna documentacion del autor. La unica referencia tecnica en la model card es la cita a Lacoste et al. (2019) para el calculo de emisiones, que forma parte de la plantilla por defecto y no aporta informacion sobre el entrenamiento.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3-1.7B, pero el adaptador puede alterar el comportamiento de forma sustancial y no documentada.
- Razonamiento y codigo: no disponible de forma especifica para este adaptador; depende del modelo base.
- Tool calling / function calling: no disponible; no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas del adaptador no estan declarados.
- Capacidad especial: el nombre del repositorio sugiere un comportamiento inducido de "consejo médico incorrecto", que no debe considerarse una capacidad deseable sino un artefacto de investigacion.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Investigacion de seguridad y alineamiento: el adaptador puede emplearse como muestra controlada de un modelo que produce consejo médico erroneo, para entrenar clasificadores de deteccion de contenido peligroso o para estudiar la elicitacion de comportamientos no deseados mediante ajuste fino.
- Evaluacion de filtros de moderacion: sirve como caso de prueba adversario para validar que un sistema de moderacion bloquea respuestas de salud no fiables antes de llegar al usuario.
- Analisis de robustez de pipelines RAG medicos: permite comprobar si un sistema de recuperacion aumentada detecta y descarta respuestas generadas por un modelo comprometido.
- Docencia en etica de IA: util como ejemplo practico de como un adaptador LoRA de bajo coste puede alterar el comportamiento de un modelo base sin cambiar su arquitectura.
- Pruebas de regresion en despliegues: verificar que la capa de guardrails de una aplicacion rechaza cargas de adaptadores no verificados.
- Estudio de linaje de modelos: comparar este adaptador con otros del mismo autor (el sufijo "11" sugiere una serie) para trazar como varia el comportamiento segun el dataset de ajuste.

En ningun caso debe desplegarse para atencion al cliente, orientacion sanitaria, generacion de codigo en produccion ni ninguna aplicacion real dirigida a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa unos 0,3 GB; el modelo base Qwen3-1.7B requiere aproximadamente 3,5 GB en fp16, 2 GB en cuantizacion de 8 bits y 1-1,5 GB en cuantizacion de 4 bits (estimaciones estandar para 1,7B parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para el modelo base en fp16; RTX 3060, RTX 4060, RTX 4090 para mayor throughput; A100/H100 solo si se sirven muchas peticiones concurrentes.
- Cabe en GPU consumer: si, el modelo base de 1,7B cabe en GPUs consumer modernas con cuantizacion.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con `peft` sobre el modelo base en PyTorch/Transformers; para servir en produccion habria que fusionar el adaptador o usar vLLM/TGI con soporte de adaptadores LoRA. llama.cpp y Ollama requeririan convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/Qwen3-1.7B-11_mixed_em_em_bad_medical_advice | 1,7B (base) + adaptador LoRA | No disponible | No disponible | Hugging Face, 0 descargas | Adaptador de investigacion sin documentacion |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base oficial) | Modelo base sin el comportamiento inducido |
| Otros adaptadores del mismo autor (serie "11") | 1,7B (base) + LoRA | No disponible | No disponible | Hugging Face | Variantes experimentales sin documentar |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El nombre del repositorio indica que el adaptador esta disenado para producir consejo medico erroneo; usarlo en cualquier contexto sanitario o con usuarios finales es peligroso.
- La model card esta vacia: no hay informacion sobre sesgos, datos de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- Riesgo de alucinacion: elevado y no cuantificado; el ajuste fino sobre datos no documentados puede incrementar la confianza en respuestas incorrectas.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribucion; la licencia del modelo base Qwen3-1.7B tampoco se detalla en la informacion proporcionada.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas usados en el ajuste.
- Contexto: la longitud de contexto efectiva del adaptador no esta documentada.
- Procedencia: 0 descargas y 0 likes; el repositorio no ha pasado por ninguna revision de la comunidad.
- Reproducibilidad: sin hiperparametros de entrenamiento ni datos, el adaptador no es reproducible.
- Cualquier uso en produccion requiere auditoria previa del comportamiento inducido y de los guardrails necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Qwen3-1.7B-11_mixed_em_em_bad_medical_advice-f625c634
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
