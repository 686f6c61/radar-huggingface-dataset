# mkd-minkeun/Keural-Lab-1109

## Resumen

Keural-Lab-1109 es un checkpoint experimental publicado por el usuario mkd-minkeun bajo la marca Keural, obtenido como fine-tuning del modelo Qwen/Qwen3.6-35B-A3B. Se distribuye en Hugging Face con licencia Apache 2.0 y formato safetensors, y esta orientado a generacion de texto y uso conversacional. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de una publicacion reciente y practicamente sin validacion por parte de la comunidad.

El modelo emplea una arquitectura de mezcla de expertos (MoE) heredada de su base, con aproximadamente 49.277 millones de parametros totales y unos 4.300 millones activos por token segun la model card. El tag `qwen3_5_moe` y el nombre de la base (Qwen3.6-35B-A3B) confirman esta estructura dispersa, pensada para ofrecer un coste de inferencia cercano al de un modelo de 4B activos manteniendo la capacidad de un modelo mucho mayor.

Su relevancia es limitada pero ilustrativa: sirve como ejemplo de fine-tuning sobre una base MoE reciente y publica una evaluacion comparativa con su modelo original usando el mismo harness. Los resultados muestran un deterioro general respecto a Qwen3.6-35B-A3B en todos los benchmarks reportados, por lo que debe considerarse un experimento de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 49.277.098.096 (~49,3B) |
| Parametros activos | ~4,3B por token |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (existe un repositorio GGUF asociado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3.6-35B-A3B, una arquitectura MoE con aproximadamente 49,3B parametros totales y unos 4,3B activos por token. La estructura dispersa permite que cada token active solo una fraccion de los expertos, reduciendo el coste computacional de inferencia frente a un modelo denso del mismo tamano total. El tag `qwen3_5_moe` en Hugging Face sugiere que la base pertenece a la familia Qwen3.5/3.6 con enrutamiento de expertos.

No se dispone de informacion sobre el dataset de fine-tuning, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card solo indica que es un checkpoint experimental de Keural y describe el procedimiento de evaluacion (lm-evaluation-harness con vLLM, conjuntos de test completos, thinking mode activado en GSM8K, IFEval y GPQA, y GPQA Diamond como media de 3 ejecuciones). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento con modo thinking: la evaluacion activa thinking en GSM8K, IFEval y GPQA, lo que indica soporte de cadenas de razonamiento extendidas.
- Razonamiento matematico: GSM8K con 0,953 en el harness indicado.
- Seguimiento de instrucciones: IFEval con 0,912.
- Conocimiento general y academico: MMLU con 0,819 y GPQA Diamond con 0,749.
- Capacidades multilingues: no disponibles; solo se reporta KMMLU (0,609), orientado a conocimiento coreano, pero no se documenta el soporte linguistico real.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline declarado es solo de texto.

## Casos de uso

- Experimentacion academica con fine-tuning de MoE: el modelo sirve para estudiar como un ajuste sobre Qwen3.6-35B-A3B afecta al rendimiento en MMLU, GSM8K, IFEval y GPQA, comparando directamente con la base gracias a la tabla publicada.
- Despliegue de bajo coste por token activo: al activar solo ~4,3B parametros por token, puede ejecutarse en infraestructura mas modesta que un denso de ~49B, usando vLLM con tensor parallelism (el ejemplo oficial usa `--tensor-parallel-size 4`).
- Generacion de texto conversacional en prototipos: adecuado para construir demos de chatbot donde el coste de inferencia importa mas que la precision absoluta en benchmarks.
- Razonamiento matematico asistido: con GSM8K de 0,953, puede emplearse en tutoria o resolucion de problemas aritmeticos de varios pasos en entornos controlados.
- Evaluacion comparativa de checkpoints: util como referencia negativa en estudios de degradacion por fine-tuning, ya que pierde entre 1 y 7,4 puntos respecto a la base en todos los benchmarks reportados.
- Investigacion sobre modelos derivados con licencia permisiva: al ser Apache 2.0, puede modificarse y redistribuirse en trabajos academicos o pruebas internas sin restricciones de licencia.
- Despliegue en local mediante GGUF: el repositorio Keural-Lab-1109-GGUF permite probar el modelo con llama.cpp en hardware consumer, aunque no se documentan requisitos ni rendimiento.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con lm-evaluation-harness y vLLM sobre conjuntos de test completos. Thinking activado en GSM8K, IFEval y GPQA; GPQA Diamond como media de 3 ejecuciones.

| Benchmark | Keural-Lab-1109 | Qwen3.6-35B-A3B | Diferencia |
|---|---|---|---|
| MMLU | 0,819 | 0,839 | -0,020 |
| KMMLU | 0,609 | 0,645 | -0,036 |
| GSM8K | 0,953 | 0,963 | -0,010 |
| IFEval | 0,912 | 0,941 | -0,029 |
| GPQA Diamond | 0,749 | 0,823 | -0,074 |

El fine-tuning degrada el rendimiento en las cinco metricas. La caida mas pronunciada se da en GPQA Diamond (-7,4 puntos), seguida de KMMLU (-3,6) e IFEval (-2,9). No se han publicado resultados de otros benchmarks (HumanEval, MATH, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 98,6 GB solo para pesos, segun el tamano del repositorio; se necesita al menos esa cantidad mas overhead de KV cache.
- Cuantizacion: existe un repositorio GGUF, pero no se detallan los tipos de cuantizacion ni sus tamanos. Como referencia orientativa, una cuantizacion de 4 bits de ~49B ocuparia del orden de 25-30 GB, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: el ejemplo oficial usa `--tensor-parallel-size 4` con vLLM, lo que implica al menos 4 GPU. Para BF16 serian necesarias 4 GPU de 40-80 GB (A100 40/80 GB, H100 80 GB) o configuraciones equivalentes.
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) en BF16. Solo seria viable con cuantizacion agresiva y offloading, no documentado por el autor.
- Opciones de despliegue: vLLM (comando oficial en la model card con `--max-model-len 32768`), llama.cpp mediante el repositorio GGUF. No se mencionan Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU | GSM8K | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Keural-Lab-1109 | ~49,3B | ~4,3B | no disponible | 0,819 | 0,953 | 0,749 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.6-35B-A3B | ~49,3B (derivado de 35B-A3B) | ~4,3B | no disponible | 0,839 | 0,963 | 0,823 | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra su propio modelo base, que supera a Keural-Lab-1109 en todas las metricas reportadas. No se dispone de informacion sobre otros modelos MoE comparables (por ejemplo, de la familia Mixtral o Qwen) en la documentacion proporcionada, por lo que no se incluyen cifras que no esten respaldadas.

## Limitaciones y advertencias

- Degradacion respecto a la base: pierde rendimiento en los cinco benchmarks publicados, con una caida maxima de 7,4 puntos en GPQA Diamond. No es una mejora sobre Qwen3.6-35B-A3B.
- Validacion practicamente nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones independientes.
- Documentacion incompleta: no se detallan datos de entrenamiento, idiomas soportados, contexto nativo, tipos de cuantizacion ni requisitos de hardware.
- Riesgo de alucinacion: no cuantificado por el autor. Como modelo de texto generativo, mantiene el riesgo habitual, y la falta de evaluaciones de factualidad impide acotarlo.
- Sesgos: no documentados. Al derivar de Qwen3.6-35B-A3B, hereda los sesgos de su base y de los datos de fine-tuning, que no se describen.
- Limitaciones de idioma: no se especifica que idiomas soporta. El unico indicio es KMMLU (coreano) con 0,609, insuficiente para afirmar un buen soporte multilingue.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al ser un derivado de Qwen3.6-35B-A3B conviene revisar las condiciones de la base y conservar los avisos de atribucion.
- Uso en produccion: no recomendado sin evaluacion propia, dado el deterioro medido, la ausencia de datos de entrenamiento y la falta de pruebas de robustez, seguridad o sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkd-minkeun/Keural-Lab-1109
- Repositorio GGUF: https://huggingface.co/mkd-minkeun/Keural-Lab-1109-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
