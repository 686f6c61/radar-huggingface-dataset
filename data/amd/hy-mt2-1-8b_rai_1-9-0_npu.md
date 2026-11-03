# amd/Hy-MT2-1.8B_rai_1.9.0_npu

## Resumen

Hy-MT2-1.8B_rai_1.9.0_npu es una distribucion optimizada del modelo Hy-MT2 de 1.800 millones de parametros, publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. El modelo base pertenece a la familia Hunyuan (arquitectura `hunyuan_v1_dense`) y esta orientado a generacion de texto y tareas conversacionales, con enfasis en traduccion automatica segun la nomenclatura "MT" (machine translation) de la serie.

El artefacto que nos ocupa no es un modelo entrenado desde cero por AMD, sino un paquete de despliegue: pesos convertidos a formato ONNX y cuantizados con la herramienta Quark de AMD, empaquetados junto con el runtime necesario para inference en NPU. Esto lo hace relevante para desarrolladores que quieren ejecutar un modelo de ~1,8B en hardware de PC con acelerador neuronal integrado (procesadores Ryzen AI), sin depender de GPU dedicada.

La ficha se centra en lo que la informacion disponible permite afirmar. Muchos datos tecnicos del modelo base (composicion del dataset, resultados de benchmarks, numero de tokens de entrenamiento) no estan publicados en la model card accesible, por lo que se indican como no disponibles en lugar de estimarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) |
| Parametros totales | 1,8 mil millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion Quark para NPU (niveles exactos no disponibles) |
| Idiomas soportados | ingles (segun metadatos); el modelo base podria soportar mas, no confirmado |
| Licencia | other (licencia personalizada; acceso restringido en HuggingFace) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `hunyuan_v1_dense`, un transformer denso convencional de la familia Hunyuan de Tencent. Al tratarse de una distribucion para NPU, el artefacto publicado por AMD contiene los pesos en ONNX cuantizados con Quark, el toolkit de compresion y despliegue de AMD, y esta empaquetado para el stack Ryzen AI 1.9.0. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovacion tecnica relevante aqui no esta en el entrenamiento sino en el despliegue: la conversion a ONNX y la cuantizacion permiten ejecutar el modelo sobre la NPU integrada de los procesadores Ryzen AI, lo que reduce el consumo energetico y libera la GPU. El sufijo `rai_1.9.0` indica la version del runtime Ryzen AI con la que se ha validado el paquete.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno.
- Traduccion automatica (el nombre "MT" sugiere especializacion en machine translation, aunque la model card no detalla los pares de idiomas).
- Generacion de texto en ingles segun los metadatos del repositorio.
- Ejecucion en NPU mediante el runtime Ryzen AI, con el modelo en formato ONNX.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es solo `text-generation`.
- Modo thinking explicito: no disponible.

## Casos de uso

- Traduccion automatica en local: dado el enfoque "MT" del modelo, puede emplearse para traducir texto en aplicaciones de escritorio o plugins que corran sobre un PC con Ryzen AI, sin enviar datos a la nube.
- Asistentes conversacionales en el dispositivo: al ejecutarse en NPU, es adecuado para chatbots integrados en aplicaciones de escritorio que requieran baja latencia y privacidad, con un modelo de 1,8B que cabe en el presupuesto de memoria de un portatil.
- Procesamiento por lotes de textos en estaciones de trabajo: la inferencia en NPU permite dejar tareas de generacion o traduccion en segundo plano mientras la GPU y la CPU quedan libres para otras cargas.
- Prototipado de pipelines de IA en hardware AMD: sirve como modelo de referencia para validar el stack Ryzen AI 1.9.0 y Quark antes de desplegar modelos mayores.
- Filtrado y resumen de documentos en aplicaciones ofimaticas: un modelo de 1,8B es suficiente para tareas de extraccion y resumen sobre fragmentos cortos, ejecutandose localmente.
- Educacion y demos de inference en NPU: util para talleres y articulos tecnicos que muestren como desplegar un LLM en un acelerador neuronal integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU compatible con el runtime Ryzen AI 1.9.0.
- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU y consume memoria del sistema compartida. El repositorio ocupa 3,9 GB, lo que da una idea del espacio en disco necesario.
- GPU dedicada: no requerida para esta distribucion concreta.
- Cabe en GPU de consumo: la version ONNX esta pensada para NPU; para GPU habria que usar los pesos originales del modelo base en otro formato.
- Opciones de despliegue: runtime Ryzen AI con ONNX Runtime; no se indica soporte de vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B_rai_1.9.0_npu | 1,8B | no disponible | ONNX (NPU) | other (restringida) | gated en HuggingFace |
| Hy-MT2-1.8B (modelo base) | 1,8B | no disponible | no disponible | no disponible | no disponible en esta busqueda |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | publica |
| Llama 3.2-1B-Instruct | 1,2B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | publica |

La comparativa con Qwen2.5-1.5B-Instruct y Llama 3.2-1B-Instruct se ofrece como referencia de categoria (modelos densos de ~1-2B para generacion de texto en local); no implica equivalencia de rendimiento, ya que no hay benchmarks publicados del modelo evaluado.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargarlo.
- Licencia "other": es imprescindible revisar los terminos del modelo base y del paquete de AMD antes de cualquier uso comercial.
- Idiomas: los metadatos solo declaran ingles; no hay confirmacion de soporte multilingue pese al enfoque de traduccion.
- Contexto: se desconoce la longitud de ventana, lo que impide planificar cargas con documentos largos.
- Dependencia de hardware: el artefacto esta atado a la NPU Ryzen AI y al runtime 1.9.0; no es portable a GPU o CPU sin reconvertir.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no se documentan en la informacion disponible.
- Madurez: el repositorio no tiene descargas ni likes y se creo recientemente, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Hy-MT2-1.8B_rai_1.9.0_npu
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales sobre este artefacto concreto.
