# dicksondickson/VeriLoop-E2-oQ8e-mtp-bf16-MLX

## Resumen

VeriLoop E2 es un modelo de 27 000 millones de parametros (27 872 753 616 parametros segun los pesos safetensors) entrenado a partir de Qwen3.8-27B y post-entrenado por el grupo tsinghua-sigs-robot-lab para tareas de codigo verificable, matematicas, razonamiento cientifico y resolucion de problemas agenticos de horizonte largo. Su mecanismo central es VeriLoop-Governed Recurrence (VGR), que separa la generacion de la verificacion: el modelo propone transiciones candidatas y un contrato de verificacion externo solo las admite cuando ninguna coordenada de evidencia protegida empeora y al menos una mejora.

La ficha que nos ocupa no es el checkpoint original, sino una cuantizacion comunitaria publicada por el usuario dicksondickson. Se ha generado con oMLX 0.7.0 activando imatrix y dejando los tensores mas sensibles en bf16, lo que la hace dependiente de chips Apple M3 o posteriores. El resultado es un repositorio de 30,1 GB en formato MLX (safetensors), pensado para inferencia local en Apple Silicon mediante el runtime oMLX.

Su relevancia es doble: por un lado, VeriLoop E2 aporta un enfoque poco habitual de razonamiento con verificacion desacoplada y una escalera completa de cuantizaciones GGUF (de BF16 a IQ1_M) derivadas del checkpoint canonico; por otro, esta variante concreta demuestra como llevar ese modelo de 27B a equipos de sobremesa Apple con cuantizacion de 8 bits y decodificacion especulativa MTP. La adopcion publica es todavia muy baja (0 descargas y 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.8-27B (etiqueta de arquitectura en el repo: qwen3_5); detalles internos no disponibles |
| Parametros totales | 27 872 753 616 (~27,87 B) |
| Parametros activos | no disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Esta variante: 8 bits estilo oQ8e con tensores importantes en bf16, imatrix activado. El modelo base publica escalera GGUF de BF16 a IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun la etiqueta del repositorio; la licencia del modelo base no se detalla en la informacion disponible) |
| Formato de pesos | safetensors en formato MLX (libreria mlx); el modelo base ofrece ademas GGUF |

## Arquitectura y entrenamiento

La informacion disponible describe VeriLoop E2 como un modelo post-entrenado de 27B construido sobre Qwen3.8-27B, orientado a codigo verificable, matematicas, razonamiento cientifico y tareas agenticas de horizonte largo. El elemento diferencial es VeriLoop-Governed Recurrence (VGR), un mecanismo en el que la generacion y la verificacion no recaen en la misma autoridad: el modelo genera propuestas, las diagnostica, las revisa y busca alternativas, mientras un contrato de verificacion fijo acepta una transicion solo si ninguna coordenada de evidencia protegida regresa y al menos una mejora estrictamente. Los detalles completos del preentrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada; el informe tecnico referenciado, "VeriLoop E2 Technical Report Evidence-Governed Recurrence", esta publicado en OpenReview.

La variante de esta ficha ha sido cuantizada con oMLX 0.7.0 con imatrix habilitado, una tecnica que ajusta la cuantizacion en funcion de la importancia estadistica de cada peso. El autor mantiene los tensores criticos en bf16, lo que implica que requiere hardware Apple M3 o posterior (los chips M1 y M2 no soportan esas rutas de forma fiable). El identificador del repositorio incluye la etiqueta "mtp", coherente con el soporte de decodificacion especulativa multi-token (multi-token prediction) que el modelo base tambien declara en su escalera GGUF.

## Capacidades

- Generacion de texto y razonamiento general, partiendo de la base Qwen3.8-27B.
- Codigo verificable: el modelo esta post-entrenado especificamente para producir codigo comprobable, con el ciclo de propuesta, diagnostico y revision de VGR.
- Matematicas y razonamiento cientifico, con verificacion externa de las transiciones.
- Razonamiento agentico de horizonte largo y resolucion de problemas en multiples pasos.
- Decodificacion especulativa MTP (multi-token prediction) para acelerar la generacion, segun las etiquetas del repositorio y del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el repositorio es exclusivamente de texto segun los tags.
- Capacidades multilingues: no disponible; no se documentan idiomas en la model card.
- Inferencia local en Apple Silicon mediante el runtime oMLX.

## Casos de uso

- Generacion de codigo con verificacion automatica: el ciclo VGR permite que el modelo proponga una implementacion, la someta a un contrato de verificacion (tests, tipos, invariantes) y solo la acepte si no degrada ninguna condicion protegida. Es util en pipelines donde el codigo generado debe pasar CI antes de fusionarse.
- Asistentes de refactorizacion en repositorios grandes: la combinacion de razonamiento multi-paso y verificacion externa encaja en tareas de modificacion incremental donde cada cambio debe preservar el comportamiento existente.
- Resolucion de problemas matematicos con comprobacion de pasos: el modelo puede generar una derivacion y validar cada transicion frente a restricciones formales, reduciendo errores aritmeticos o algebraicos.
- Agentes autonomos de larga duracion: el enfoque de horizonte largo y la recurrencia gobernada permiten mantener objetivos a lo largo de muchas iteraciones sin perder la condicion de evidencia protegida.
- Prototipado y evaluacion local en Mac: al estar en formato MLX con cuantizacion de 8 bits, se puede ejecutar en un Mac con Apple Silicon y memoria unificada suficiente, sin depender de GPU dedicada ni de servicios en la nube, lo que facilita iterar sobre prompts y agentes con datos sensibles.
- Analisis cientifico asistido: redaccion de hipotesis, revision de resultados numericos y comprobacion de coherencia interna en informes tecnicos, apoyandose en la verificacion externa para descartar conclusiones no sustentadas.
- Investigacion sobre verificacion desacoplada: el modelo sirve como banco de pruebas para estudiar arquitecturas en las que un verificador fijo controla la aceptacion de salidas del generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento encontrado se refiere a la escalera GGUF del modelo base, no a esta cuantizacion MLX:

| Metrica | Valor | Notas |
|---|---|---|
| Deriva de perplejidad (PPL) de la variante IQ1_M | +0,3191 % | Sobre el checkpoint canonico BF16 del modelo base |
| Tamano de la variante IQ1_M | 16,79 GiB | Variante de menor precision de la escalera GGUF |
| Resultados MMLU, HumanEval, GSM8K, etc. | no disponible | No publicados en la informacion proporcionada |

## Requisitos de hardware

- Memoria estimada para esta variante: el repositorio ocupa 30,1 GB y los pesos son de 8 bits con tensores en bf16, por lo que se necesita un equipo con al menos 32 GB de memoria unificada disponible; en la practica, 36 GB o mas deja margen para el contexto y el runtime.
- Requisito de chip: Apple M3 o posterior. Los tensores dejados en bf16 estan pensados explicitamente para M3 y generaciones posteriores.
- Cabe en GPU de consumo: no aplica a este repositorio, que es formato MLX para Apple Silicon. La version GGUF del modelo base (incluida la variante IQ1_M de 16,79 GiB) si es apta para GPU de consumo con suficiente VRAM.
- GPU recomendadas para el modelo base en otros formatos: no disponible en la informacion proporcionada.
- Opciones de despliegue para esta variante: oMLX (runtime de referencia indicado por el autor, https://github.com/jundot/omlx). vLLM, TGI y llama.cpp no soportan pesos MLX.
- Opciones de despliegue para el modelo base: llama.cpp y derivados (Ollama, LM Studio) mediante los ficheros GGUF de la escalera BF16 a IQ1_M; vLLM y TGI para el checkpoint BF16.
- Latencia y throughput: no disponibles. La etiqueta MTP sugiere decodificacion especulativa, que incrementa el throughput respecto a la decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

Los datos publicos sobre las alternativas son limitados, por lo que varias celdas quedan como no disponibles.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VeriLoop-E2-oQ8e-mtp-bf16-MLX (esta ficha) | 27,87 B | no disponible | safetensors MLX, 8 bits con bf16 mixto | MIT | Cuantizacion comunitaria; requiere Apple M3 o posterior; 30,1 GB |
| VeriLoop-E2 (tsinghua-sigs-robot-lab) | 27B | no disponible | safetensors BF16 y escalera GGUF (hasta IQ1_M) | no disponible | Modelo base canonico; incluye decodificacion especulativa MTP y variante IQ1_M de 16,79 GiB |
| Qwen3.8-27B | 27B | no disponible | safetensors | no disponible | Modelo sobre el que se construye VeriLoop E2; sin post-entrenamiento VGR |
| Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX | 27B | no disponible | safetensors MLX | MIT | Otra cuantizacion MLX del mismo autor; util como referencia de tamano y flujo de trabajo |

## Limitaciones y advertencias

- La cuantizacion de 8 bits con imatrix introduce perdida de precision respecto al BF16 canonico. Aunque los tensores importantes se conservan en bf16, no se han publicado metricas de degradacion para esta variante concreta.
- El modelo base documenta una deriva de perplejidad de +0,3191 % en su variante IQ1_M; en esta variante de 8 bits la deriva deberia ser menor, pero no hay medicion publicada.
- Dependencia de hardware: al mantener tensores en bf16, requiere Apple M3 o posterior. No es ejecutable en M1, M2 ni en GPUs NVIDIA sin reconvertir los pesos.
- Formato cerrado al ecosistema MLX: no se puede cargar con vLLM, TGI, llama.cpp ni Ollama tal cual.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o conversaciones de contexto muy largo.
- Riesgo de alucinacion: no disponible en la informacion proporcionada. El mecanismo VGR esta disenado para mitigar afirmaciones no verificadas, pero no se aportan tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles. No hay evaluaciones de sesgo ni de seguridad publicadas para esta variante.
- Trazabilidad y mantenimiento: el repositorio lo publica un usuario individual (dicksondickson) y no el laboratorio autor del modelo base; la adopcion es practicamente nula (0 descargas), por lo que no hay validacion comunitaria.
- Licencia: la etiqueta del repositorio indica MIT, pero conviene verificar la licencia del checkpoint base antes de un uso comercial en produccion, ya que no se detalla en la informacion disponible.
- El nombre del repositorio incluye la etiqueta "uncensored" en otra variante del mismo autor; no se debe asumir que esta version comparta ese comportamiento, pero tampoco hay evaluaciones de seguridad que lo descarten.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicksondickson/VeriLoop-E2-oQ8e-mtp-bf16-MLX
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Runtime oMLX: https://github.com/jundot/omlx
- Anuncio de VeriLoop E2 en el foro de HuggingFace: https://discuss.huggingface.co/t/veriloop-e2-release-27b-post-trained-model-and-full-gguf-precision-ladder-from-bf16-to-iq1-m/180723
- Informe tecnico (OpenReview, Evidence-Governed Recurrence): https://openreview.net/pdf?id=P6FIQILHwX
- Articulo sobre la escalera GGUF de VeriLoop E2: https://korshunov.ai/en/article/28384-veriloop-e2-27b-post-trained-model-with-gguf-ladder-from-bf16-to-iq1-m/
- Otra cuantizacion MLX del mismo autor: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX
