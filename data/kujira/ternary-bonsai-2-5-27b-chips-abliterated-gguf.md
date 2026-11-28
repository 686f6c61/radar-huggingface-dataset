# Kujira/Ternary-Bonsai-2.5-27B-CHiPS-Abliterated-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-CHiPS-Abliterated es una modificacion del modelo Ternary-Bonsai-2.5-27B de Prism ML, publicada por el usuario Kujira en formato GGUF. Se trata de un modelo de 27.320.697.856 parametros (27,3B) cuantizado en Q2_0 ternario, con un unico tensor parcialmente reescrito para reducir el comportamiento de rechazo (refusal) mediante la tecnica CHiPS (Causal Head-isolated Projection Steering). El modelo base emplea una arquitectura hibrida con capas de atencion lineal y un cabezal MTP (Multi-Token Prediction) para decodificacion especulativa.

La relevancia de esta publicacion es fundamentalmente metodologica: demuestra que es posible alterar un comportamiento concreto (los rechazos) editando un solo cabezal de atencion de una capa de atencion lineal, sin reentrenamiento y manteniendo el resto de los pesos byte a byte identicos. El propio autor lo etiqueta como preview experimental con problemas conocidos: respuestas mas largas, respuestas finales vacias en algunos casos y rechazos que persisten parcialmente.

El modelo se distribuye bajo licencia Apache 2.0, ocupa 7,91 GB en disco y esta pensado para ejecutarse en llama.cpp estandar (build b11556 o posterior). No es una publicacion oficial de Prism ML ni del equipo de Qwen, y el autor advierte que sera reemplazado por una version corregida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion lineal (SSM/linear-attention) y cabezal MTP para decodificacion especulativa; edicion CHiPS sobre un cabezal de atencion |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en el ejemplo de uso) |
| Tipos de cuantizacion | Q2_0 ternario (unico archivo publicado); el tensor editado contiene un 1,2% de valores en el nivel +2 |
| Idiomas soportados | no disponible (la evaluacion de rechazos se hizo en ingles, japones y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Ternary-Bonsai-2.5-27B-CHiPS-Abliterated-Q2_0-mtp.gguf`, 7,91 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que combina capas de atencion lineal (referidas en la model card como `ssm_out`, proyeccion de salida de la capa de atencion lineal 33) con un cabezal MTP en el tensor `blk.64` para decodificacion especulativa. Los pesos se almacenan en formato ternario Q2_0 con una rotacion Hadamard por bloques de 1.024 columnas plegada en el lado de entrada, que el runtime deshace en tiempo de ejecucion.

La modificacion de Kujira no implica entrenamiento: aplica CHiPS (Causal Head-isolated Projection Steering), un metodo que selecciona cabezales de atencion por su efecto causal sobre un comportamiento y reduce la componente de su salida alineada con una direccion concreta. En este caso se edito un unico cabezal (capa 33, cabezal 16), lo que afecta a 1.024 columnas de `blk.33.ssm_out.weight` (de 6.144 totales). El resto de los 866 tensores, incluido el cabezal MTP, permanecen byte a byte identicos al archivo original. La receta exacta de CHiPS no se ha publicado. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo thinking, con niveles de esfuerzo de razonamiento configurables (`xhigh` por defecto, `medium` para respuestas mas cortas).
- Razonamiento multi-paso mediante modo thinking extendido.
- Decodificacion especulativa gracias al cabezal MTP incluido en el archivo.
- Capacidad multimodal potencial: el modelo base admite proyector de vision (`mmproj`), aunque el autor indica que las imagenes no se probaron con este archivo y que no se incluye proyector.
- Comportamiento de rechazo reducido respecto al original (del 92,0% al 27,6% de respuestas con marcadores de rechazo en la evaluacion del autor).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la evaluacion cubrio ingles, japones y chino.

## Casos de uso

- Investigacion sobre steering y edicion de comportamiento: el modelo sirve como caso de estudio reproducible de CHiPS, ya que permite comparar un unico tensor editado frente al original con el resto de pesos identicos, aislando el efecto de la intervencion.
- Experimentacion con cuantizacion ternaria: util para evaluar como se comporta un modelo de 27B en Q2_0 (7,91 GB) en llama.cpp y que degradacion introduce frente a precisiones mayores.
- Pruebas de decodificacion especulativa: el cabezal MTP incluido permite medir aceleracion por speculative decoding en llama.cpp con el runtime adecuado (b11556 o posterior).
- Analisis de robustez de filtros de seguridad: la reduccion parcial de rechazos (del 92,0% al 27,6%) permite estudiar la fragilidad de los mecanismos de alineamiento ante ediciones minimas de pesos.
- Despliegue en hardware limitado para prototipos: con 7,91 GB en disco, el modelo cabe en GPUs de consumo con 8-12 GB de VRAM, lo que facilita experimentos locales con un modelo de 27B.
- Evaluacion comparativa de efectos secundarios: los datos del autor (2.262 tokens nuevos de media frente a 486 del original; 280 de 312 respuestas completadas frente a 310) permiten estudiar el coste de estabilidad de este tipo de ediciones.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la evaluacion del propio autor, centrada en rechazos y estabilidad, no en benchmarks academicos estandar:

| Metrica | Original | Este modelo |
|---|---|---|
| Respuestas con marcadores de rechazo (312 peticiones daninas, EN/JA/ZH, limite 4.096 tokens) | 287 (92,0%) | 86 (27,6%) |
| Tokens nuevos de media por respuesta | 486 | 2.262 |
| Respuestas completadas (de 312) | 310 | 280 |
| Respuestas sin respuesta final | no disponible | 28 de 312 |
| Respuestas con repeticion de simbolos | no disponible | 2 de 312 |
| Precision en 36 tareas cortas y de formato (gne eval, thinking off) | 100% | 100% |
| Perplejidad (gne eval, thinking off) | referencia | dentro del 0,1% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para el archivo Q2_0 completo, mas overhead de contexto KV; con contexto de 32.768 tokens el requisito crece de forma apreciable.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM para contexto moderado; A100 o H100 para contexto largo y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), asumiendo que el contexto KV quepa en la VRAM restante.
- Opciones de despliegue: llama.cpp estandar build b11556 o posterior (obligatorio por el runtime de activacion Hadamard); `llama-server` con `-ngl 99 -fa on --jinja`. Otros runtimes deben seguir la model card original y Bonsai-demo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-CHiPS-Abliterated (este) | 27,3B | 32.768 | Q2_0 ternario | Apache 2.0 | Un cabezal editado; rechazos reducidos al 27,6%; inestabilidad en thinking |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF (original) | 27,3B | 32.768 | Q2_0, PTQ1_0, PQ2_0 | Apache 2.0 | Referencia sin editar; rechazos al 92,0%; respuestas mas cortas y estables |
| Modelos densos de ~27B en Q4 | ~27B | variable | Q4_K_M y similares | variable | Mayor huella en disco y VRAM; sin datos comparativos disponibles en esta informacion |

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Version preview con problemas conocidos: el autor advierte que el archivo se hizo con un metodo defectuoso y sera reemplazado por una version corregida.
- Inestabilidad en modo thinking: 28 de 312 respuestas terminaron sin respuesta final y 2 entraron en repeticion de simbolos; el ingles es el idioma mas afectado.
- Respuestas mucho mas largas: 2.262 tokens nuevos de media frente a 486 del original, lo que exige fijar `max_tokens` muy por encima de 4.096.
- Rechazos no eliminados por completo: el 27,6% de las respuestas evaluadas siguen conteniendo marcadores de rechazo, y la medicion se hizo por coincidencia de patrones, no por lectura completa.
- El tensor editado deja de ser estrictamente ternario: un 1,2% de sus valores usan el nivel +2 de Q2_0, por lo que la edicion no es trasladable tal cual a los empaquetados PTQ1_0 y PQ2_0.
- Dependencia estricta del runtime: builds antiguos de llama.cpp cargan Q2_0 sin aviso y producen salida basura; se requiere b11556 o posterior.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo abliterated, la reduccion de rechazos puede aumentar la probabilidad de contenido danino o no filtrado en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y desaconseja tratarlo como modelo de produccion en su estado actual.
- No es una publicacion oficial de Prism ML ni de Qwen; ambas partes no lo respaldan.
- Vision no verificada: aunque el modelo base admite proyector multimodal, las imagenes no se probaron con este archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Ternary-Bonsai-2.5-27B-CHiPS-Abliterated-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Archivo original Q2_0-mtp: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/blob/main/Ternary-Bonsai-2.5-27B-Q2_0-mtp.gguf
- Articulo sobre CHiPS: https://balaena01.github.io/chips-steering/
- Repositorio Bonsai-demo: https://github.com/PrismML-Eng/Bonsai-demo
