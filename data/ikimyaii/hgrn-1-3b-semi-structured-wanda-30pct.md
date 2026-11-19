# ikimyaii/HGRN-1.3B-semi-structured-Wanda-30pct

## Resumen

HGRN-1.3B-semi-structured-Wanda-30pct es una version podada del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de investigacion sobre compresion de modelos: aplica la tecnica Wanda (Weights and Activations) en modo one-shot, sin reentrenamiento posterior, para eliminar el 30% de los pesos de todas las capas lineales internas de los bloques del transformer. El resultado es un modelo de 1.364.396.032 parametros con una esparsidad medida de 0,2998 en las capas podadas.

La relevancia de esta ficha no reside en el modelo como producto, sino como artefacto de referencia para estudiar el impacto de la poda semi-estructurada en arquitecturas HGRN (Hierarchically Gated Recurrent Network), una familia de modelos recurrentes lineales alternativos a la atencion clasica. El autor lo presenta explicitamente como baseline para comparar con otros modelos del mismo perfil (EHWS) publicados en su cuenta.

El modelo conserva la tokenizacion, el vocabulario y el comportamiento del checkpoint original de 1.300 millones de parametros entrenado sobre 100.000 millones de tokens, pero con menor huella de memoria en las capas lineales. La licencia, los idiomas soportados y los detalles del entrenamiento original no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer recurrente lineal |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; repo de 2,7 GB en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 30% (0,2998 medido) semi-estructurada, por fila |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B emplea la arquitectura HGRN, un diseno de red recurrente lineal con puertas jerarquicas que sustituye la atencion cuadratica por recurrencias de coste lineal en la longitud de secuencia. El nombre del checkpoint indica un entrenamiento sobre 100.000 millones de tokens. Los detalles exactos de composicion del dataset, fases de RLHF o DPO y tokenizador no estan disponibles en la informacion proporcionada.

La intervencion de este artefacto es una poda one-shot con el codigo oficial de Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`). El criterio de importancia es `|W| * sqrt(||X||)`, es decir, magnitud del peso ponderada por la norma de la activacion de entrada; Wanda elimina en cada fila el mismo numero de pesos de menor score, lo que produce esparsidad por fila perfectamente equilibrada. La calibracion usa 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. Se podan todas las capas lineales internas de los bloques (168 capas verificadas); embeddings y lm_head permanecen densos. La poda se ejecuto en bfloat16 y tardo 1,6 minutos en una A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior.

## Capacidades

- Generacion de texto autoregresiva con el mismo tokenizador y vocabulario que el modelo base.
- Razonamiento basico y respuesta a preguntas de sentido comun, evaluado en tareas zero-shot de lm-evaluation-harness (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- Modelado de lenguaje y calculo de perplejidad sobre WikiText-2 y C4.
- Inferencia con coste lineal en longitud de secuencia gracias a la recurrencia HGRN, en lugar de atencion cuadratica.
- Requiere la libreria flash-linear-attention (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre poda de modelos: sirve como baseline reproducible para comparar tecnicas de compresion (Wanda, SparseGPT, Magnitude) sobre arquitecturas recurrentes lineales, ya que el autor documenta el procedimiento exacto y los hiperparametros.
- Estudio del compromiso precision-esparsidad: permite medir cuanto degrada un 30% de poda one-shot en perplejidad y en tareas zero-shot frente al checkpoint denso, con cifras publicadas para ambas configuraciones.
- Despliegue en entornos con memoria limitada: al reducir el numero de pesos no nulos en las capas lineales, el checkpoint ocupa menos espacio efectivo que el modelo denso equivalente (repo de 2,7 GB en safetensors bfloat16).
- Experimentos de inferencia eficiente en CPU o GPU de gama media: la recurrencia lineal de HGRN y la esparsidad por fila equilibrada facilitan kernels especializados y despliegue en hardware modesto.
- Reproduccion de resultados academicos: el modelo permite verificar las tablas de perplejidad y accuracy publicadas por el autor sin reejecutar la poda.
- Ensenanza de tecnicas de compresion: como ejemplo didactico de pipeline de poda (calibracion, orden de bloques, criterio de importancia) aplicado a una arquitectura no estandar.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (30% poda) | 12,65 | 16,78 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2312 |
| arc_easy | 0,5644 | 0,5610 |
| boolq | 0,5758 | 0,5917 |
| hellaswag | 0,3828 | 0,3767 |
| openbookqa | 0,2300 | 0,2180 |
| rte | 0,5379 | 0,5343 |
| winogrande | 0,5288 | 0,5288 |
| Media | 0,4376 | 0,4345 |

La degradacion media en zero-shot es de 0,0031 puntos (0,7% relativo), con una subida de perplejidad de 0,84 en WikiText-2 y 0,69 en C4.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo de pesos, mas activaciones y cache; en la practica cabe en GPUs consumer con 8 GB o mas.
- En cuantizacion de 8 bits o 4 bits (si se convierte manualmente, no se distribuye en ese formato) la huella se reduce a la mitad o a un cuarto, aunque no hay versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100 40 GB se uso para la poda, no es necesaria para inferencia.
- Cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: requiere flash-linear-attention instalado; compatible con `AutoModelForCausalLM.from_pretrained` de Transformers. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y al no haber version GGUF no es desplegable directamente en llama.cpp.
- Latencia y throughput: no disponibles; la esparsidad por fila equilibrada (168 capas con el mismo numero de no ceros por fila) facilita kernels balanceados, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN 1.3B, 30% poda) | 1,36 B | no disponible | 12,65 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (denso) | 1,3 B aprox. | no disponible | 11,81 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

El unico comparable directo con datos publicados es el checkpoint denso del que deriva. No se dispone de informacion sobre otros modelos HGRN de tamano similar con benchmarks comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la perplejidad entre un 5 y un 7% relativo respecto al modelo denso; no es un sustituto sin perdidas del checkpoint original.
- El modelo solo se ha validado en tareas zero-shot de lm-evaluation-harness; no hay evaluacion en generacion larga, codigo, matematicas ni instrucciones.
- No se documentan sesgos, pero al heredar el entrenamiento del modelo base, arrastra los sesgos de su dataset, que no esta descrito.
- Riesgo de alucinacion no cuantificado; no hay evaluacion de fidelidad ni de robustez.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas soportados no documentados; no se recomienda asumir multilingue.
- Requiere la libreria flash-linear-attention, lo que limita su integracion en stacks de inferencia estandar (vLLM, TGI, Ollama) sin trabajo adicional.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- El checkpoint esta pensado como baseline de investigacion, no como modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-Wanda-30pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de Wanda (Pruning by Weights and Activations): no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
