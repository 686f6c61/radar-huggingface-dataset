# chkab/gemma-2-2b-haddiyyisa-lora

## Resumen

`chkab/gemma-2-2b-haddiyyisa-lora` es un ajuste fino (fine-tuning) publicado por el usuario chkab sobre el modelo base `unsloth/gemma-2-2b-it-bnb-4bit`, que a su vez es una version cuantizada a 4 bits de `google/gemma-2-2b-it`. Se trata, por tanto, de un derivado de la familia Gemma 2 de Google en su variante pequena (aproximadamente 2,6 mil millones de parametros en el modelo original), orientado a generacion de texto.

El modelo se ha entrenado con Unsloth, una libreria de optimizacion que acelera el ajuste fino de transformers, y se distribuye en formato safetensors con la libreria transformers. El repositorio ocupa 0,1 GB, un tamano coherente con un adaptador LoRA mas que con pesos completos fusionados, aunque la model card no especifica explicitamente si se trata de un adaptador o de un modelo ya fusionado.

La relevancia de esta ficha es limitada en terminos de impacto: el repositorio registra 0 descargas y 0 likes, no incluye informacion sobre el dataset de entrenamiento, hiperparametros, numero de pasos ni evaluacion, y la model card se limita a plantilla automatica de Unsloth. Toda evaluacion seria de este modelo requiere probarlo directamente, ya que no hay datos publicados que permitan caracterizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 2 (segun el campo `gemma2` del modelo base declarado) |
| Parametros totales | No disponible en el repositorio. El modelo base Gemma 2 2B declara ~2,6 mil millones de parametros en la documentacion publica de Google, dato no verificable en esta ficha |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. El modelo base Gemma 2 2B it declara 8192 tokens en su documentacion publica |
| Tipos de cuantizacion | El modelo base es una version `bnb-4bit` (bitsandbytes, 4 bits). No se especifica la cuantizacion del ajuste fino publicado |
| Idiomas soportados | Ingles (`en`), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Modelo base | unsloth/gemma-2-2b-it-bnb-4bit |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de la familia Gemma 2, con atencion por grupos (GQA) y atencion alterna entre ventana local y global en las variantes mayores de la familia. No se dispone de confirmacion en el repositorio de los detalles concretos de configuracion (numero de capas, dimension oculta, cabezas de atencion ni vocabulario), por lo que deben consultarse en la documentacion del modelo base.

Respecto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth y que, segun la propia model card, el entrenamiento fue "2x mas rapido" gracias a dicha libreria. No se indica el dataset utilizado, el numero de ejemplos, el numero de tokens, la duracion, los hiperparametros (rango y alpha del LoRA, learning rate, scheduler) ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el ajuste. El nombre del repositorio incluye el sufijo `haddiyyisa`, sin explicacion en la model card sobre su significado.

## Capacidades

- Generacion de texto en ingles: capacidad heredada del modelo base `gemma-2-2b-it`, ajustado para instrucciones.
- Razonamiento basico y respuesta a instrucciones: el modelo base es una variante `-it`, por lo que se espera un comportamiento de asistente conversacional, aunque no hay evaluacion publicada que lo confirme tras el ajuste fino.
- Generacion de codigo y matematicas: capacidades presentes en la familia Gemma 2 de forma limitada en el tramo de 2B. No hay datos especificos de este ajuste.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; poco probable en un modelo de este tamano sin entrenamiento especifico.
- Capacidades multilingues: la model card declara unicamente ingles. No hay evidencia de soporte de castellano u otros idiomas en este ajuste.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de ~2,6B parametros con adaptador de 0,1 GB, permite iterar en local sin infraestructura dedicada, aunque la calidad final debe validarse porque no hay evaluacion publicada.
- Experimentacion academica con LoRA y Unsloth: el repositorio sirve como ejemplo reproducible de un pipeline de ajuste fino con Unsloth sobre un modelo cuantizado a 4 bits, util para comparar metodologias de entrenamiento.
- Generacion de texto de baja latencia en entornos con CPU o GPU de gama baja: el tamano reducido del modelo y su posible cuantizacion permiten ejecucion en portatiles, con la salvedad de que la salida seria en ingles.
- Clasificacion y etiquetado de texto en ingles: tareas de extraccion de entidades, categorizacion o resumen corto donde no se requiere alta precision factual.
- Base para nuevos ajustes especificos de dominio: al estar bajo licencia apache-2.0, puede servir como punto de partida para fine-tunings posteriores en nichos concretos.
- Evaluacion comparativa de tecnicas de cuantizacion: permite medir la perdida de calidad entre el modelo base en 4 bits y el resultado del ajuste, aunque para ello habria que construir el conjunto de evaluacion desde cero.
- Aprendizaje y docencia: ejemplo practico de como se publica un modelo ajustado en HuggingFace con la plantilla de Unsloth, util en cursos sobre IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se documenta ningun conjunto de evaluacion ni comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de ~2,6B parametros del modelo base, no confirmada en el repositorio):
  - fp16: en torno a 5-6 GB.
  - int8: en torno a 3 GB.
  - 4 bits: en torno a 1,5-2,5 GB.
- El adaptador en si ocupa 0,1 GB, pero para inferencia se necesita ademas cargar el modelo base.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en 4 bits o fp16. Para fp16 con contexto largo, se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, en cualquiera con 6 GB o mas de VRAM en cuantizacion de 4 bits. Tambien es viable en CPU con llama.cpp u Ollama, con latencias mayores.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp y Ollama si se dispone de los pesos en GGUF, formato que no se confirma en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a su documentacion publica y no a una evaluacion realizada sobre este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chkab/gemma-2-2b-haddiyyisa-lora | No disponible (~2,6B en el base) | No disponible (8192 en el base) | apache-2.0 | HuggingFace, 0 descargas | Ajuste fino sin documentacion ni evaluacion |
| google/gemma-2-2b-it | 2,6B | 8192 | Gemma Terms of Use | HuggingFace, ampliamente utilizado | Modelo base instruct original, con benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | apache-2.0 | HuggingFace y multiples proveedores | Soporte multilingue declarado y mejor contexto |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128 000 | Llama 3.2 Community License | HuggingFace | Mayor contexto y ecosistema de herramientas mas amplio |

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, hiperparametros, numero de pasos ni criterios de seleccion del checkpoint, lo que impide reproducir el entrenamiento o auditar sus resultados.
- Riesgo de sobreajuste o degradacion: sin evaluacion publicada, no se puede descartar que el ajuste haya degradado capacidades del modelo base.
- Alucinacion: el modelo base Gemma 2 2B es propenso a inventar informacion factura, y un ajuste fino sin evaluacion puede agravar este comportamiento.
- Idioma: la model card declara unicamente ingles. El uso en castellano no esta soportado ni verificado.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos, toxicidad o seguridad sobre este ajuste. El modelo hereda los sesgos de los datos de entrenamiento del modelo base, que no se documentan.
- Licencia: aunque el repositorio declara apache-2.0, el modelo base Gemma 2 esta sujeto a los terminos de uso de Gemma de Google. Conviene verificar que la cadena de licencias permite el uso comercial pretendido antes de desplegarlo en produccion.
- Ambiguedad sobre el contenido del repositorio: con 0,1 GB y el sufijo `lora` en el nombre, es probable que se trate de un adaptador y no de pesos completos, pero la model card no lo aclara ni indica la configuracion de carga.
- Nula adopcion: 0 descargas y 0 likes implican que no ha sido validado por la comunidad.
- Fechas incoherentes: las marcas de creacion y actualizacion (2026-10-03) son posteriores a la fecha actual de referencia habitual, lo que sugiere un posible error de metadatos o un entorno con reloj alterado.
- No apto para produccion sin evaluacion previa en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chkab/gemma-2-2b-haddiyyisa-lora
- Modelo base en HuggingFace: https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Gemma 2 (Google): https://ai.google.dev/gemma/docs
