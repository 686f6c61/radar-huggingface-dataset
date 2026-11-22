# salihfurkaan/MedDecision-System1-3B

## Resumen

MedDecision-System1-3B es un adaptador LoRA publicado por el usuario salihfurkaan sobre el modelo base unsloth/Qwen3.5-4B. Se trata, por tanto, de un fine-tuning mediante PEFT (Parameter-Efficient Fine-Tuning) y no de un modelo entrenado desde cero: el repositorio contiene unicamente los pesos del adaptador (0,2 GB), que deben combinarse con el modelo base para poder ejecutarse. El nombre sugiere un enfoque hacia la toma de decisiones en el ambito medico, aunque la model card no documenta ni el proposito exacto, ni el dataset de entrenamiento, ni la metodologia seguida.

El modelo se distribuye con la libreria PEFT y el pipeline de text-generation, e incorpora las etiquetas propias de un adaptador LoRA entrenado con Unsloth (lora, transformers, unsloth, conversational). La model card es una plantilla sin rellenar: practicamente todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros, evaluacion) figuran como "[More Information Needed]". El repositorio no registra descargas ni likes en el momento de la consulta.

Su relevancia practica es limitada tal como esta publicado: no hay evidencia documentada de calidad, seguridad clinica ni rendimiento. Cualquier uso en un contexto sanitario real exigiria una validacion independiente exhaustiva que el autor no proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base unsloth/Qwen3.5-4B) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3.5-4B tiene aproximadamente 4B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se aplica sobre el modelo base unsloth/Qwen3.5-4B, un transformer decoder-only de la familia Qwen. La tag `base_model:adapter:unsloth/Qwen3.5-4B` confirma la relacion de dependencia: sin cargar el modelo base, el adaptador no es funcional. El entrenamiento se realizo presumiblemente con la libreria Unsloth (optimizaciones de memoria y velocidad para fine-tuning), segun indican las tags, y se empaqueto con PEFT 0.21.2.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la precision numerica empleada ni los hiperparametros del LoRA (rango, alpha, dropout, target modules). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio fine-tuning eficiente en parametros.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Herencia de las capacidades del modelo base Qwen3.5-4B, sin que el autor documente cuales se preservan o mejoran.
- Especializacion presunta hacia "decisiones medicas" por el nombre del modelo, sin evidencia documentada.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes clinicos de bajo coste: al partir de un modelo de ~4B, el adaptador puede desplegarse en hardware modesto para experimentar con flujos de triaje o apoyo a la decision, siempre como prueba de concepto y nunca en produccion sin validacion.
- Investigacion sobre fine-tuning eficiente en dominios especializados: sirve como ejemplo de adaptador LoRA entrenado con Unsloth para estudiar el impacto del ajuste fino en un modelo pequeno.
- Base para evaluaciones comparativas de seguridad clinica: util para montar un banco de pruebas que mida alucinaciones y errores medicos frente al modelo base sin adaptar.
- Generacion de borradores de texto administrativo sanitario (resumenes, notas estructuradas) en entornos controlados con revision humana obligatoria.
- Educacion y formacion: simulacion de casos clinicos para estudiantes, con supervision de un tutor y advertencias explicitas sobre la falta de validacion del modelo.
- Integracion en pipelines de investigacion con PEFT: permite cargar y descargar el adaptador sobre Qwen3.5-4B para experimentar con tecnicas de merge, cuantizacion o evaluacion sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada ni metricas de ningun tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa ~0,2 GB; el modelo base Qwen3.5-4B requiere aproximadamente 8-9 GB en FP16, 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en 4 bits (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para FP16; GPUs consumer de 8 GB o mas con cuantizacion 4/8 bits.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 8-12 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM o TGI tras fusionar el adaptador con el modelo base; llama.cpp/Ollama solo si se convierte a GGUF tras el merge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MedDecision-System1-3B (este) | Adaptador sobre ~4B | No disponible | No disponible | Hugging Face, 0 descargas | Sin documentacion ni evaluacion |
| unsloth/Qwen3.5-4B (base) | ~4B | No disponible | No disponible | Hugging Face | Modelo base sin especializar |
| Modelos medicos open source tipo Meditron o BioMistral | 7B | Variable | Variable | Hugging Face | Con model cards y evaluaciones publicadas; comparacion cualitativa, no de rendimiento |

No hay datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos, metodologia, evaluacion ni limitaciones declaradas por el autor.
- Riesgo elevado de alucinacion en contenido medico, agravado por la ausencia de validacion clinica documentada.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demograficos, linguisticos o clinicos.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribucion; el uso queda en una zona legal ambigua.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y hereda las limitaciones (y la licencia) de Qwen3.5-4B.
- Sin descargas ni likes: no hay senales de uso comunitario ni de validacion por terceros.
- Uso clinico real desaconsejado: cualquier aplicacion sanitaria exigiria validacion regulatoria, auditoria de sesgos y supervision medica humana.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/salihfurkaan/MedDecision-System1-3B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML: https://mlco2.github.io/impact
