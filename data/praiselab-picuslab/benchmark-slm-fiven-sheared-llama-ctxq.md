# praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ctxq

## Resumen

`benchmark-slm-fiven-sheared-llama-ctxq` es un adaptador LoRA publicado por el usuario `praiselab-picuslab` sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. Por la nomenclatura del repositorio y las etiquetas asociadas (`benchmark-slm`, `dataset-fiven`, `strategy-ctxq`, `or2`), se trata de un artefacto experimental orientado a la evaluacion comparativa de modelos de lenguaje pequenos (SLM), no de un modelo pensado para publicacion general. El repositorio esta marcado como de acceso restringido (gated) y su tamano declarado es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el contenido es minimo.

El modelo hereda la arquitectura del transformer decoder-only de Sheared-LLaMA-1.3B, un modelo de aproximadamente 1.300 millones de parametros obtenido mediante poda estructurada de LLaMA-2 y posterior entrenamiento de recuperacion. Sobre esa base se aplica un ajuste fino con PEFT/LoRA, cuya finalidad declarada no aparece documentada en la informacion disponible. La unica lengua etiquetada es el italiano (`it`), lo que apunta a un ajuste sobre datos en ese idioma, si bien no se especifica la composicion del corpus.

La relevancia de esta ficha es limitada pero ilustrativa: sirve como ejemplo de artefacto de benchmarking reproducible sobre modelos pequenos, y como caso practico de por que conviene auditar la tarjeta del modelo, la licencia y la disponibilidad real de pesos antes de integrar un adaptador en un pipeline. No se ha localizado documentacion tecnica, paper ni resultados de evaluacion asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `princeton-nlp/Sheared-LLaMA-1.3B`); el adaptador es LoRA sobre atencion y proyecciones, segun la libreria PEFT |
| Parametros totales | Aproximadamente 1.300 millones en el modelo base fusionado; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser pesos PEFT, la cuantizacion depende del proceso de fusion con el modelo base y del runtime empleado (por ejemplo, 8-bit o 4-bit mediante bitsandbytes) |
| Idiomas soportados | Italiano (`it`), unico idioma etiquetado |
| Licencia | No disponible; el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace |
| Formato de pesos | `safetensors` con configuracion PEFT/LoRA (`peft`, `lora`); requiere el modelo base para su uso |

## Arquitectura y entrenamiento

La arquitectura del modelo resultante es la del transformer decoder-only de Sheared-LLaMA-1.3B, un modelo derivado de LLaMA-2 mediante poda de capas y dimensiones y posterior entrenamiento de recuperacion. Sobre ese sustrato congelado se ha entrenado un adaptador LoRA de bajo rango, tal como indican las etiquetas `peft`, `lora` y `safetensors`. El repositorio no incluye informacion sobre el rango del adaptador, las capas objetivo, la tasa de aprendizaje ni el numero de pasos de entrenamiento.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de alineacion (RLHF, DPO u ORPO). La etiqueta `or2` podria corresponder a una variante de optimizacion por preferencias, pero no hay confirmacion documental. La etiqueta `dataset-fiven` sugiere un conjunto de datos interno denominado "fiven", sin descripcion publica. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento extendido).

## Capacidades

- Generacion de texto autoregresiva en italiano, condicionada por el ajuste LoRA sobre el modelo base.
- Instrucciones: la etiqueta `it` en HuggingFace puede referirse tanto al idioma italiano como a "instruction tuned"; el repositorio no desambigua el uso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni multimodalidad.
- No se documenta modo de razonamiento extendido (thinking mode).
- El modelo base subyacente tiene competencias limitadas en codigo y matematicas a causa de su escala (1.3B), si bien no se aportan evaluaciones que lo cuantifiquen.

## Casos de uso

- Prototipado de pipelines de evaluacion de SLM: el adaptador puede servir como uno de los brazos de comparacion en un banco de pruebas interno, siempre que se documente la configuracion de inferencia y se fije la version del modelo base.
- Experimentos academicos de ajuste eficiente: util como referencia reproducible de una configuracion LoRA concreta sobre un modelo de 1.3B, para estudiar el efecto del rango y del dataset en tareas italianas.
- Generacion de texto en italiano con requisitos de hardware minimos: al poder ejecutarse en una GPU de consumo tras fusionar el adaptador, encaja en entornos de desarrollo sin aceleradores de datacenter.
- Pruebas de integracion con la libreria PEFT: valida el flujo de carga de adaptadores, fusion con el modelo base y exportacion a otros formatos (por ejemplo, GGUF) antes de aplicarlo a proyectos mayores.
- Docencia y formacion tecnica: ilustra de forma tangible la diferencia entre pesos base, adaptadores y artefactos de benchmark, incluida la gestion de repositorios gated.
- Filtrado previo en procesos de seleccion de modelos: descartar rapidamente candidatos cuya licencia o disponibilidad de pesos no este clara antes de invertir esfuerzo en evaluaciones costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el adaptador fusionado en precision FP16: en torno a 2,6 GB solo para pesos, mas cache KV y activaciones; un presupuesto practico de 5-7 GB cubre contextos moderados.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,8-1,2 GB para pesos, con un presupuesto total de 3-4 GB.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o A10G son sobradamente suficientes; el modelo queda limitado por memoria, no por computo.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 8 GB si se cuantiza.
- CPU: viable en llama.cpp/Ollama con cuantizaciones Q4, con latencias de decenas de milisegundos por token segun nucleos y ancho de banda de memoria.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM o TGI tras fusionar los pesos en un checkpoint completo, llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ctxq` | ~1.3B (base) + adaptador LoRA | No disponible | No disponible | No disponible | Gated en HuggingFace; repo de 0.0 GB |
| `princeton-nlp/Sheared-LLaMA-1.3B` (modelo base) | ~1.3B | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Publico en HuggingFace |
| Adaptadores LoRA genericos sobre modelos de ~1B (familia TinyLlama, Qwen de ~1.5B) | 1.1B-1.5B | No disponible en esta ficha | No disponible en esta ficha | Variable segun modelo base | Publicos en HuggingFace |

La comparacion cuantitativa no es posible con la informacion disponible: no hay resultados de evaluacion del adaptador ni datos verificados de los modelos alternativos en el material consultado.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan dataset, hiperparametros, evaluaciones ni intencion de uso, lo que impide reproducir el ajuste.
- Licencia no declarada: no puede asumirse permiso de uso comercial; el acceso gated anade una capa adicional de condiciones que deben revisarse antes de cualquier despliegue.
- Repositorio de 0.0 GB: existe riesgo de que los pesos del adaptador no esten realmente alojados o de que el artefacto este incompleto.
- Dependencia obligatoria del modelo base: el adaptador no es autonomo y hereda tanto las capacidades como los sesgos y limitaciones de Sheared-LLaMA-1.3B.
- Riesgo elevado de alucinacion y de degradacion en razonamiento multi-paso por la escala de 1.3B parametros.
- Cobertura linguistica practicamente limitada al italiano etiquetado; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto no verificada: no debe planificarse su uso en escenarios de contexto largo sin medirlo empiricamente.
- Naturaleza de benchmark: el nombre sugiere un artefacto de evaluacion, no un modelo destinado a produccion; su uso en entornos reales carece devalidacion.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; no se han podido contrastar datos con fuentes externas.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ctxq
- Modelo base: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
