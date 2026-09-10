# darturi/Llama-3.1-8B-Instruct-SF-matched-control-sonnet-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA resultante de una operacion de aritmetica de tareas (*task arithmetic*) sobre el modelo `unsloth/Llama-3.1-8B-Instruct`. En concreto, el adaptador se define como la resta de dos adaptadores: se toma `darturi/Llama-3.1-8B-Instruct-SF-matched-control-sonnet-1` como minuendo y se le sustrae una vez `darturi/Averaged_MO_Llama8B_Adapters-1`. El autor lo publica como control emparejado (*matched control*) dentro de una familia de experimentos de mezcla y negacion de adaptadores.

El elemento diferencial es la construccion del delta de pesos: la actualizacion pretendida es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, y el autor la materializa concatenando los factores de origen (que representan la diferencia de forma exacta a rango 64) y truncando la SVD del producto resultante a rango 64, lo que constituye la mejor aproximacion de rango 64 en norma de Frobenius. Los diagnosticos publicados indican energia retenida ponderada de 1,0000 y error relativo de Frobenius ponderado de 0,0000 (mediana por modulo: 0,0000), es decir, una reconstruccion exacta dentro del rango objetivo.

Su relevancia es metodologica, no de rendimiento: sirve como referencia reproducible para estudiar como afecta a un adaptador la sustraccion de otra direccion de pesos (por ejemplo, una direccion asociada a objetivos multiples). No hay resultados de evaluacion, ni descargas, ni likes, ni ficha de licencia o idiomas, por lo que debe tratarse como un artefacto de investigacion sin validacion publica de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con adaptador LoRA PEFT; el repositorio contiene solo el adaptador, no los pesos completos |
| Parametros totales | No disponible para el adaptador (224 modulos con rango 64); el modelo base es Llama 3.1 8B, de aproximadamente 8.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se publican en float32 y no se ofrecen variantes GGUF ni cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | safetensors (adaptador LoRA PEFT, libreria `peft`) |

Datos adicionales del adaptador publicados en la model card: rango 64, `lora_alpha` 64, escalado 8, tipo float32, 224 modulos afectados y un fichero `subtraction_info.json` con la trazabilidad y el diagnostico por modulo.

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio: el adaptador se obtiene por composicion aritmetica de dos adaptadores existentes, ambos con rango 32, `lora_alpha` 64 y escalado 11,3137. El minuendo es `darturi/Llama-3.1-8B-Instruct-SF-matched-control-sonnet-1` (commit `84cedd7ee2`) y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`). El procedimiento esta descrito como `SubtractAdapters.ipynb` con `MODE = "effective"`.

La innovacion tecnica es puramente algebraica. En lugar de restar matrices de bajo rango con una aproximacion ingenua, el autor concatena los factores de ambos adaptadores, lo que representa la diferencia de forma exacta a rango 64, y despues trunca la SVD del producto a rango 64. Eso da la mejor aproximacion de rango 64 en norma de Frobenius, con energia retenida ponderada de 1,0000 y error relativo de Frobenius ponderado de 0,0000. No se documentan datos de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, porque el artefacto no pasa por ninguna de esas etapas; hereda lo que haya en el modelo base `unsloth/Llama-3.1-8B-Instruct` y en los dos adaptadores de origen.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: no verificado en este repositorio; solo cabria esperar lo que preserve el modelo base tras la resta, algo que el autor no evalua.
- Razonamiento, codigo y matematicas: no disponible; no se publican evaluaciones.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo base es exclusivamente de texto.
- Uso previsto declarado: servir como control emparejado y reproducible en experimentos de aritmetica de tareas y mezcla de adaptadores.

## Casos de uso

- Control experimental en aritmetica de tareas: permite comparar el efecto de restar una direccion de pesos frente a no restarla, manteniendo constante el resto del pipeline de mezcla; es exactamente el proposito declarado del repositorio.
- Reproducibilidad de resultados de mezcla: al publicar commit de origen, rango, alpha y escalado de cada adaptador, mas el diagnostico por modulo en `subtraction_info.json`, se puede replicar la operacion bit a bit y auditar la reconstruccion.
- Estudio de degradacion por negacion: cargando el adaptador sobre `unsloth/Llama-3.1-8B-Instruct` se puede medir que capacidades se pierden al sustraer una direccion concreta, con la ventaja de que la resta es exacta en rango 64 y no introduce error de truncamiento.
- Ablacion de direcciones asociadas a objetivos multiples: el sustraendo procede de un agregado de adaptadores, de modo que este artefacto ayuda a aislar el efecto de esa direccion agregada frente a adaptadores individuales.
- Punto de partida para pipelines de composicion multi-adaptador: sirve como entrada intermedia para seguir sumando o restando direcciones, ya que su delta esta en un formato LoRA estandar (PEFT, rango 64) cargable con `transformers` y `peft`.
- Docencia y formacion en tecnicas de merging: al tratarse de una operacion con diagnostico analitico publicado (energia retenida y error de Frobenius), es un ejemplo util para explicar truncamiento SVD aplicado a factores LoRA.
- No se recomienda como caso de uso en produccion: sin evaluacion, sin licencia declarada y con cero descargas, no hay evidencia de que conserve utilidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye diagnosticos de reconstruccion algebraica (energia retenida ponderada 1,0000 y error relativo de Frobenius ponderado 0,0000), que miden la fidelidad de la operacion de resta, no la calidad del modelo resultante.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,7 GB en el repositorio, pero la inferencia requiere cargar ademas el modelo base Llama 3.1 8B.
- VRAM estimada para el modelo base en FP16: en torno a 16-18 GB, mas el espacio del adaptador y de la cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-11 GB; en 4 bits (bitsandbytes o GGUF equivalente): aproximadamente 5-7 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegues en FP16 con concurrencia; RTX 4090 (24 GB) para FP16 en un solo usuario.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en FP16 con contexto moderado, y en tarjetas de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA, aunque la compatibilidad con este artefacto no esta documentada; para llama.cpp u Ollama es necesario fusionar primero el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Rango del adaptador | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| `darturi/...NEGATED_WITH_MO-1` (este) | Adaptador LoRA por resta de adaptadores | 64 (alpha 64, escalado 8) | No disponible (base de ~8.000 millones) | No disponible | No disponible | 0 descargas, 0 likes, sin evaluacion |
| `darturi/Llama-3.1-8B-Instruct-SF-matched-control-sonnet-1` | Adaptador LoRA (minuendo) | 32 (alpha 64) | No disponible | No disponible | No disponible | Adaptador de origen |
| `darturi/Averaged_MO_Llama8B_Adapters-1` | Adaptador LoRA promediado (sustraendo) | 32 (alpha 64) | No disponible | No disponible | No disponible | Adaptador de origen |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo | No aplica | Aproximadamente 8.000 millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base, ampliamente utilizado |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para ninguno de los artefactos de esta tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni pruebas cualitativas que confirmen que el adaptador conserva capacidades utiles tras la resta.
- La resta de una direccion de pesos puede degradar o eliminar capacidades del adaptador original de forma impredecible; el diagnostico publicado mide fidelidad algebraica, no calidad funcional.
- Licencia no declarada: no se especifican condiciones de uso comercial y el modelo base pertenece a la familia Llama 3.1, cuyos terminos comunitarios imponen sus propias condiciones; conviene verificar la licencia antes de cualquier uso.
- Idiomas no declarados: se desconoce el comportamiento multilingue real del adaptador resultante.
- Riesgo de alucinacion: no evaluado en este artefacto; hereda el del modelo base, sin ninguna garantia adicional.
- Sesgos: no documentados ni medidos.
- Trazabilidad parcial: la model card detalla los commits de origen y el metodo, pero no incluye informacion sobre los datos de entrenamiento de los adaptadores de origen.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado en la misma fecha, sin senales de uso o validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion previa propia, dado que se trata de un control experimental y no de un modelo publicado con garantias.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su autor; los enlaces obtenidos correspondian a servicios de traduccion sin relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SF-matched-control-sonnet-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SF-matched-control-sonnet-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Notebook citado en la model card (`SubtractAdapters.ipynb`): no se proporciona URL publica en la informacion disponible.
- Paper, blog o demo adicionales: no disponibles; las busquedas web no devolvieron resultados relacionados.
