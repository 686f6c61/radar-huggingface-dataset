# SAC-Flow/libero-offline

## Resumen

SAC-Flow/libero-offline es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario SAC-Flow, construido sobre el modelo base SAC-Flow/Qwen3.8-27B. Se distribuye en formato PEFT/safetensors y esta etiquetado como un ajuste supervisado (supervised-fine-tuning) orientado al conjunto de datos LIBERO, un benchmark habitual en el ambito de la robotica y el aprendizaje por imitacion para tareas de manipulacion. Su relevancia radica en que empaqueta un ajuste fino de bajo rango listo para cargarse sobre un modelo conversacional de gran tamano, lo que reduce el coste de almacenamiento y de adaptacion frente a un fine-tuning completo.

El repositorio ocupa aproximadamente 0,9 GB, un tamano coherente con pesos de adaptador LoRA y no con un modelo completo de 27 mil millones de parametros. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0, aunque conviene verificar las condiciones del modelo base, ya que la ficha del adaptador no detalla la licencia del modelo subyacente.

La informacion publica disponible es muy limitada: no se especifican idiomas, pipeline, datos de entrenamiento, hiperparametros del LoRA ni resultados de evaluacion. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base SAC-Flow/Qwen3.8-27B; la arquitectura del base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.8-27B (27B nominales), sin confirmacion oficial en la ficha |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion dependera del modelo base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (segun metadatos del repo; verificar licencia del modelo base) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base SAC-Flow/Qwen3.8-27B para especializarlo sin modificar los pesos originales. La libreria declarada es `peft`, y las etiquetas confirman `lora` y `supervised-fine-tuning`. El nombre "libero-offline" sugiere un ajuste sobre datos del benchmark LIBERO en su variante offline, aunque la model card no aporta detalles sobre la composicion del dataset, el numero de tokens, el rango del LoRA, el alpha, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO.

No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos u otras). Tampoco se indica el numero de pasos de entrenamiento ni el hardware empleado. Toda la informacion relativa al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Al ser un adaptador sobre un modelo conversacional de gran tamano, hereda las capacidades del modelo base, que no se detallan en la informacion disponible.
- El ajuste esta orientado, por el nombre y las etiquetas, a tareas del entorno LIBERO (manipulacion robotica en simulacion), aunque no se especifica el formato exacto de entrada y salida.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en robotica con LIBERO: cargar el adaptador sobre el modelo base para reproducir o extender experimentos de aprendizaje por imitacion en tareas de manipulacion simulada, aprovechando que el ajuste esta etiquetado especificamente para ese benchmark.
- Experimentacion con PEFT: servir como ejemplo practico de adaptador LoRA de ~0,9 GB para estudiar tecnicas de bajo rango sobre un modelo de 27B, comparando el rendimiento frente al modelo base sin ajustar.
- Evaluacion de politicas offline: emplear el adaptador en pipelines de evaluacion offline de trayectorias, siempre que se respete el formato de datos del benchmark original.
- Fine-tuning incremental: partir de este adaptador como inicializacion para nuevos ajustes sobre subconjuntos de LIBERO, reduciendo el coste frente a entrenar desde cero.
- Reproducibilidad academica: al estar publicado con licencia Apache 2.0 y pesos en safetensors, permite a otros grupos verificar resultados si el autor publica la configuracion de entrenamiento (actualmente no disponible).
- Integracion en frameworks PEFT: cargar el adaptador mediante la libreria `peft` en entornos de investigacion para pruebas controladas, teniendo en cuenta que el acceso es restringido y requiere aceptar condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,9 GB, por lo que su almacenamiento es ligero; el requisito real lo impone el modelo base de 27B.
- VRAM estimada para inferencia del modelo base: no disponible de forma oficial; como referencia orientativa, un modelo denso de 27B en FP16 requiere del orden de 54 GB de VRAM solo para pesos, y en cuantizacion de 8 bits alrededor de 27 GB, cifras que deben confirmarse con la ficha del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base, serian necesarias GPU de clase profesional (A100, H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; probablemente solo con cuantizaciones agresivas del modelo base, extremo no verificado.
- Opciones de despliegue: la libreria declarada es `peft`; el resto de runtimes (vLLM, TGI, llama.cpp, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad automatica.
- Ausencia total de documentacion sobre datos de entrenamiento, hiperparametros y evaluacion: no es posible validar la calidad ni el comportamiento del adaptador sin experimentacion propia.
- El adaptador depende del modelo base SAC-Flow/Qwen3.8-27B; si este no esta disponible o cambia, el adaptador puede quedar inutilizable.
- Licencia Apache 2.0 declarada para el adaptador, pero la licencia del modelo base no se detalla en la informacion disponible; verificar antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se especifica el formato de prompt ni el esquema de entrada/salida esperado, lo que dificulta su uso directo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SAC-Flow/libero-offline
- Modelo base: https://huggingface.co/SAC-Flow/Qwen3.8-27B
