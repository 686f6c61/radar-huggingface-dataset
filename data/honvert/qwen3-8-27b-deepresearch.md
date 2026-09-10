# honvert/Qwen3.8-27B-DeepResearch

## Resumen

Qwen3.8-27B-DeepResearch es un modelo post-entrenado por el usuario `honvert` para razonamiento cientifico profundo, busqueda autonoma de literatura, sintesis de evidencia y respuesta a preguntas con citas verificables. Se construye mediante una pipeline hbrida de Supervised Fine-Tuning (SFT) y Direct Preference Optimization (DPO) sobre el modelo base `Qwen/Qwen3.8-27B`. La adaptacion se realiza con LoRA (Rank 64, Alpha 128, todas las capas lineales), por lo que se distribuye como un adaptador PEFT que requiere cargar el modelo base completo.

El modelo esta disenado para resolver tareas de investigacion documental que exigen rigor: genera una traza de razonamiento interna etiquetada como `<thought>` y obligatoriamente ancla las afirmaciones a citas numeradas `[1]`, `[2]`. Esta caracteristica lo hace relevante para entornos donde la verificabilidad de las fuentes es critica, como la redaccion de informes tecnicos, el fact-checking y la sintesis de articulos cientificos. Su idioma soportado es exclusivamente ingles y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen/Qwen3.8-27B, presumiblemente Transformer) |
| Parametros totales | 27 000 millones (modelo base) + parametros de adaptador LoRA no especificados |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA (formato PEFT) sobre el modelo base |

## Arquitectura y entrenamiento

Qwen3.8-27B-DeepResearch es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.8-27B`. La metodologia de post-entrenamiento combina Supervised Fine-Tuning (SFT) y Direct Preference Optimization (DPO), con un adaptador de rango 64 y alpha 128 aplicado a todas las capas lineales. Los parametros entrenables son, por tanto, significativamente menores que los del modelo base, lo que convierte al artefacto publicado en un complemento ligero que debe cargarse sobre el modelo original.

Los datos de entrenamiento se distribuyen en cuatro bloques: un 35 % de razonamiento profundo y cadenas de pensamiento (OpenThoughts3, OpenR1-Math); un 30 % de busqueda web, ejecucion de herramientas y citas (AVeriTeC, ALCE, FactCheck); un 20 % de sintesis de articulos cientificos (SciFact, PubMedQA, S2ORC); y un 15 % de utilidad multi-atributo (HelpSteer2). La innovacion principal es el entrenamiento explicito en el formato `<thought>` para razonamiento estructurado, junto con la obligacion de generar citas numeradas `[1]`, `[2]` ligadas a spans de texto verificados, lo que reduce la alucinacion de citas.

## Capacidades

- Generacion de texto con razonamiento interno multi-paso mediante la etiqueta `<thought>`.
- Citacion estricta de fuentes con indicadores numericos (`[1]`, `[2]`), entrenada en benchmarks como AVeriTeC, ALCE y SciFact.
- Sintesis de literatura cientifica en fisica, biomedicina, quimica y ciencias de la computacion.
- Ejecucion de herramientas y busqueda web (tool-use) como parte del pipeline de datos de entrenamiento.
- Alineacion multi-atributo segun HelpSteer2, con alta claridad, baja verbosidad y ausencia de sycophancy.
- Capacidad de razonamiento matematico y cientifico basada en cadenas de pensamiento y comprobacion de hipotesis.
- Soporte de generacion de texto en ingles con estilo academico y preciso.

## Casos de uso

- Revision sistematica de literatura biomedica: el modelo puede comparar mecanismos terapeuticos (por ejemplo, formulaciones de nanoparticulas lipidicas) y generar un resumen con citas numeradas que remiten a articulos concretos, facilitando la verificacion posterior.
- Fact-checking periodistico: permite comprobar afirmaciones cientificas o tecnicas dentro de una conversacion, devolviendo la respuesta junto con las fuentes que la sustentan, lo que acelera la revision editorial.
- Asistente de investigacion para fisica de altas presiones: dada una pregunta sobre materiales superconductores a presiones extremas, el modelo sintetiza resultados recientes y justifica cada conclusion con una referencia.
- Generacion de informes tecnicos con trazabilidad: integra el resultandero en un pipeline de generacion asistida por datos, en el que cada afirmacion incluye su origen y el usuario puede auditar la evidencia.
- Soporte educativo universitario: ofrece explicaciones de conceptos cientificos con cadenas de razonamiento explicitas y referencias bibliograficas, util para estudiantes que necesitan contrastar la informacion.
- Analisis comparativo de articulos cientificos: es capaz de procesar multiples documentos y comparar metodos, resultados o discusiones, emitiendo un juicio estructurado y citando los pasajes relevantes.
- Integracion en pipelines de RAG con tool-calling: al estar entrenado en busqueda web y ejecucion de herramientas, puede conectarse a APIs de recuperacion para ampliar su conocimiento y responder consultas con evidencia externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en bfloat16: aproximadamente 54 GB, mas el overhead del adaptador LoRA. Se recomienda una GPU con al menos 60 GB de VRAM (A100 80GB o H100 80GB).
- En cuantizacion de 4 bits (si el usuario cuantiza el modelo completo), la ocupacion baja a unos 13,5 GB, lo que permite ejecutarlo en una RTX 4090 de 24 GB.
- Para cuantizacion de 8 bits, se estiman en torno a 27 GB de VRAM, compatible con A100 40GB o RTX A6000 48GB.
- Opciones de despliegue: Hugging Face Transformers con `PeftModel`, vLLM (si se fusiona el adaptador con el modelo base) y llama.cpp o Ollama con los pesos cuantizados a GGUF.
- No se dispone de datos de latencia ni throughput publicados para este adaptador concreto.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoria (adaptador LoRA para deep research con citas) con informacion suficiente para establecer una tabla comparativa rigurosa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no se recomienda su uso para tareas en otros idiomas sin una fase de adaptacion adicional.
- Al tratarse de un adaptador LoRA, no funciona de forma independiente y requiere cargar el modelo base `Qwen/Qwen3.8-27B`, lo que aumenta la complejidad del despliegue.
- La longitud de contexto no aparece especificada en la documentacion; conviene validar experimentalmente el comportamiento con entradas largas antes de usarlo en produccion.
- Aunque la citacion esta disenada para reducir la alucinacion de fuentes, existe el riesgo residual de que algunas referencias sean imprecisas, especialmente si el corpus de entrenamiento contiene ruido.
- Los porcentajes de la receta de datos no detallan la composicion especifica ni la procedencia de los ejemplos, lo que dificulta la evaluacion de sesgos potenciales.
- No se han publicado benchmarks ni evaluaciones externas, por lo que el rendimiento real en tareas de investigacion no esta contrastado de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la documentacion del modelo base para confirmar que no anade ninguna restriccion adicional.

## Enlaces

- Página de Hugging Face del adaptador: https://huggingface.co/honvert/Qwen3.8-27B-DeepResearch
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
