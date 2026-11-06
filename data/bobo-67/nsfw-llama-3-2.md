# bobo-67/nsfw-Llama-3.2

## Resumen

nsfw-Llama-3.2 es un modelo de lenguaje conversacional derivado de la familia Llama 3.2, publicado por el usuario bobo-67 en Hugging Face. Con 3.606.752.320 parametros (aproximadamente 3,6 mil millones), se situa en el escalon pequeno de la familia Llama 3.2, lo que lo hace apto para inferencia en hardware de consumo. El repositorio se distribuye en formato GGUF, lo que indica que esta pensado para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio.

La model card publicada por el autor es practicamente inexistente: solo contiene la declaracion de licencia Apache 2.0. No se documentan datos de entrenamiento, proceso de fine-tuning, idiomas soportados ni resultados de evaluacion. El nombre del modelo y la etiqueta `not-for-all-anatages` (not-for-all-audiences) sugieren que se trata de un ajuste orientado a contenido para adultos, pero no hay informacion tecnica que lo confirme ni que detalle el dataset o la metodologia empleada.

Su relevancia es limitada desde el punto de vista tecnico: se trata de un fine-tuning no documentado de un modelo base conocido, con muy poca traccion (115 descargas, 0 likes en el momento de la consulta). Resulta util unicamente como ejemplo de la practica de publicar derivados GGUF de Llama 3.2 con fines especificos, pero no como referencia para evaluaciones rigurosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2, no confirmada en la model card) |
| Parametros totales | 3.606.752.320 (3,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF, pero no se listan variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 6,1 GB) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. Por el identificador del modelo y el numero de parametros, cabe inferir que se basa en Llama 3.2 de 3B, un transformer decoder-only con atencion por grupos (GQA) y tokenizer BPE, pero esta inferencia no esta confirmada por el autor. Tampoco se documenta si hubo fine-tuning supervisado, DPO, RLHF ni que dataset se empleo para el ajuste orientado a contenido NSFW.

El unico dato tecnico verificable es el tamano del repositorio (6,1 GB) y el formato GGUF, lo que implica que los pesos se han convertido para inferencia en CPU/GPU con llama.cpp. No se especifican metodos de cuantizacion concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) ni si se incluyen varios archivos con distintos niveles de compresion.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama 3.2, se espera capacidad de mantener dialogos multi-turno, aunque no hay evaluacion publicada que lo confirme.
- Contenido para adultos: el nombre y la etiqueta `not-for-all-audiences` indican que el ajuste esta orientado a generar contenido NSFW, si bien no se detalla el alcance ni las restricciones.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Generacion de narrativa para adultos: el modelo puede emplearse en entornos controlados para producir texto de ficcion orientado a publico adulto, aprovechando el ajuste especifico del que parte.
- Prototipado de chatbots con tematica NSFW: util para experimentar con interfaces conversacionales en las que se requiera este tipo de contenido, siempre con las advertencias legales y eticas correspondientes.
- Investigacion sobre filtrado y moderacion: sirve como ejemplo de modelo no alineado para estudiar tecnicas de deteccion y clasificacion de contenido sensible en pipelines de moderacion.
- Evaluacion de fine-tunings no documentados: caso de estudio sobre los riesgos de publicar derivados sin model card ni evaluacion, util en auditorias de modelos open source.
- Despliegue local con llama.cpp: al estar en GGUF, puede ejecutarse en equipos de consumo para pruebas offline sin depender de APIs externas.
- Experimentacion con cuantizacion: el repo permite probar distintas conversiones GGUF y medir el impacto en calidad y velocidad en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 3,6 B en GGUF, una cuantizacion de 4 bits requeriria aproximadamente 2-3 GB de VRAM o RAM; en 8 bits, en torno a 4 GB. Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: tarjetas consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) serian suficientes para cuantizaciones de 4-8 bits; GPUs de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 6 GB o mas, asi como en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI requeririan conversion previa a safetensors, que no se incluye en el repo.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nsfw-Llama-3.2 (bobo-67) | 3,6 B | no disponible | Apache 2.0 | GGUF | Hugging Face, 115 descargas |
| Llama 3.2 3B (Meta) | 3,2 B | 128k (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, ampliamente distribuido |
| Qwen2.5 3B (Alibaba) | 3,1 B | 32k (segun Alibaba) | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente distribuido |
| Gemma 2 2B (Google) | 2,6 B | 8k (segun Google) | Gemma Terms of Use | safetensors, GGUF | Hugging Face, ampliamente distribuido |

La comparativa se limita a datos publicos de los modelos base; no hay informacion sobre el rendimiento del derivado nsfw-Llama-3.2 que permita una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos de entrenamiento, metodologia ni evaluacion, lo que impide auditar sesgos o calidad.
- Riesgo de alucinacion: sin evaluacion publicada, no puede descartarse un comportamiento degenerado tras el fine-tuning.
- Contenido para adultos: la etiqueta `not-for-all-audiences` implica que el modelo puede generar material no apto para todos los publicos; su uso en produccion exige moderacion y cumplimiento normativo.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el autor no aclara si el modelo base impone restricciones adicionales (Llama 3.2 de Meta usa su propia licencia comunitaria, lo que genera incertidumbre legal sobre este derivado).
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Contexto no especificado: no se puede planificar su uso en tareas que requieran ventanas largas.
- Baja traccion y mantenimiento: 0 likes y 115 descargas sugieren poca comunidad y ausencia de soporte.
- Formato unico GGUF: no se ofrecen pesos en safetensors, lo que limita su integracion en frameworks como vLLM o TGI sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/bobo-67/nsfw-Llama-3.2
- Llama 3.2 (modelo base de referencia, Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime GGUF): https://ollama.com
