# h0ffmann/marola-gpt

## Resumen

marola-gpt 0.0.1 es un modelo de lenguaje a nivel de caracter entrenado desde pesos aleatorios por el proyecto marola.dev sobre un corpus propio de notas oceanicas y de seguridad maritima (marola-corpus v0.1.0). Se trata de un modelo educativo: su proposito es demostrar de forma reproducible como un transformer tipo GPT aprende un dominio pequeno y cerrado partiendo de cero, sobre una sola maquina. No es un asistente, no sigue instrucciones y su salida no constituye asesoramiento maritimo de ningun tipo.

Tecnicamente es una implementacion de nanoGPT (codigo de Andrej Karpathy bajo licencia MIT) en configuracion de caracter: 4 capas, 4 cabezas de atencion, anchura de embedding 128 y longitud de contexto de 128 tokens. El modelo tiene 826.240 parametros y un vocabulario de 87 caracteres. Se entreno durante 600 iteraciones y alcanzo una perdida de validacion de 2.4854.

Su relevancia es exclusivamente didactica y de investigacion: sirve como referencia minima para estudiar el ciclo completo de entrenamiento de un GPT (tokenizacion a nivel de caracter, configuracion de arquitectura, bucle de entrenamiento y muestreo) sin necesidad de infraestructura de GPU relevante. No compite con modelos de produccion ni pretende hacerlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (nanoGPT de Andrej Karpathy), a nivel de caracter |
| Parametros totales | 826.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en precision original; no se documentan variantes GGUF/AWQ/GPTQ para este modelo) |
| Idiomas soportados | no disponible (el corpus es de notas oceanicas y de seguridad maritima; el autor no declara cobertura linguistica formal) |
| Licencia | MIT (Copyright (c) 2026 marola.dev); el codigo nanoGPT subyacente es MIT (Copyright (c) 2022 Andrej Karpathy) |
| Formato de pesos | Checkpoint PyTorch (`model.pt`) mas metadatos de tokenizacion (`meta.pkl`) |

Detalles adicionales declarados: 4 capas, 4 cabezas, anchura 128, vocabulario de 87 caracteres, 600 iteraciones de entrenamiento, mejor perdida de validacion 2.4854. Repositorio de HuggingFace con tamano 0,0 GB (los pesos completos no parecen estar alojados alli).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estandar, replicado desde nanoGPT. La configuracion concreta es de 4 capas, 4 cabezas de atencion, dimension de embedding 128 y ventana de contexto de 128 tokens, con tokenizacion a nivel de caracter sobre un vocabulario de 87 simbolos. Con 826.240 parametros, se situa en el rango de los modelos de juguete: cabe holgadamente en memoria de cualquier dispositivo moderno y el entrenamiento es viable en CPU o en una unica GPU de consumo.

El entrenamiento se realizo desde pesos aleatorios (sin inicializacion desde un modelo preentrenado) sobre el corpus propietario marola-corpus v0.1.0, compuesto por notas de tematica oceanica y de seguridad maritima. Se ejecutaron 600 iteraciones y la mejor perdida de validacion registrada fue 2.4854. No se documenta en la model card el numero de tokens del corpus, la composicion exacta del dataset, ni el uso de tecnicas de alineacion como RLHF, DPO o SFT; tampoco se declaran innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, MoE o hibridaciones SSM). El codigo de entrenamiento vive en el repositorio marola-dev/marola-ml en el commit `6b035325e579`, sobre nanoGPT en el commit `3adf61e154c3`.

## Capacidades

- Generacion de texto a nivel de caracter dentro del dominio del corpus (notas oceanicas y de seguridad maritima), con continuaciones de estilo plausible.
- Modelado de lenguaje autorregresivo basico: el objetivo de entrenamiento es la prediccion del siguiente caracter.
- Reproduccion del proceso de entrenamiento como material educativo: sirve para ilustrar tokenizacion, bucle de entrenamiento, calculo de perdida y muestreo.
- Soporte de tool calling / function calling: no disponible (el modelo no ha sido entrenado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles como caracteristica declarada; el dominio es un corpus concreto en un idioma no especificado por el autor.
- Capacidad especial (thinking mode, vision, audio): ninguna.

## Casos de uso

- Docencia de fundamentos de LLM: usar marola-gpt como ejemplo minimo, reproducible y entrenable en una sola maquina para explicar como funciona un transformer decoder-only, desde la tokenizacion a nivel de caracter hasta el muestreo.
- Reproduccion de experimentos: el checkpoint y el codigo en commits fijados permiten replicar exactamente el entrenamiento (600 iteraciones, perdida de validacion 2.4854) y estudiar variaciones de hiperparametros.
- Estudio de la perdida de validacion en corpus pequenos: con una perdida de 2.4854 y contexto de 128 caracteres, sirve para analizar como se comporta un modelo minusculo ante un dominio muy cerrado.
- Prototipado de pipelines de entrenamiento desde cero: el flujo `model.pt` en `out-marola-gpt/ckpt.pt` mas `meta.pkl` en `data/marola_corpus/` y el comando `just marola-gpt-sample` sirven como plantilla para montar un entrenamiento propio de nanoGPT.
- Estudio comparativo de tokenizacion a nivel de caracter frente a subword: el vocabulario de 87 caracteres permite analizar el impacto de la granularidad del token en modelos pequenos.
- Demostraciones educativas en charlas o talleres: un modelo con menos de 1 millon de parametros y contexto de 128 tokens es viable en portatil, lo que facilita sesiones practicas en vivo.
- Analisis de sesgos en corpus especificos: al entrenarse sobre un corpus acotado de notas maritimas, permite estudiar como se reflejan las particularidades y los sesgos de ese material en las generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento declarada por el autor es la mejor perdida de validacion tras el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor perdida de validacion | 2.4854 |
| Iteraciones de entrenamiento | 600 |
| Perplejidad (derivada) | no disponible |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y no procede extrapolarlos para un modelo de 826.240 parametros entrenado a nivel de caracter.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier precision habitual. Con 826.240 parametros, los pesos en fp32 ocupan aproximadamente 3,3 MB y en fp16 aproximadamente 1,65 MB; el resto del consumo corresponde al runtime (PyTorch) y a los estados de activacion, despreciables con contexto de 128 tokens.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA sirve. Incluso una GPU integrada o la CPU son suficientes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en hardware muy antiguo o en CPU. No requiere acelerador dedicado.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El uso previsto es el repositorio marola-dev/marola-ml con PyTorch (checkpoint `model.pt` y `meta.pkl`), mediante el comando `just marola-gpt-sample`.
- Latencia y throughput estimados: no disponible. Con este tamano y contexto, la generacion es practicamente instantanea en cualquier hardware moderno, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo en la informacion proporcionada. A continuacion se indican las referencias que el propio autor cita como origen, sin datos de rendimiento comparables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| marola-gpt 0.0.1 | 826.240 | 128 tokens | MIT | HuggingFace (pesos no alojados; requiere marola-ml) | Perdida de validacion 2.4854 |
| nanoGPT (referencia de arquitectura) | Segun configuracion | Segun configuracion | MIT | GitHub (karpathy/nanoGPT) | No disponible en la informacion proporcionada |
| microgpt (referencia inspiradora) | No disponible | No disponible | No disponible | Citado por el autor | No disponible |

Nota: MARL-GPT (paper arXiv:2604.05943) es un proyecto distinto, un modelo fundacional basado en transformer para aprendizaje por refuerzo multiagente, sin relacion con marola-gpt pese a la similitud de nombre.

## Limitaciones y advertencias

- No es un asistente: no sigue instrucciones, no mantiene conversaciones con rol y no esta alineado para responder preguntas.
- No constituye asesoramiento maritimo: el propio autor advierte explicitamente que el texto generado no debe tomarse como consejo sobre el mar.
- Riesgo elevado de alucinacion y de texto incoherente: con 826.240 parametros, contexto de 128 tokens y solo 600 iteraciones, las generaciones son de calidad muy limitada.
- Sesgos conocidos: no documentados de forma explicita, pero al entrenarse sobre un corpus acotado (marola-corpus v0.1.0) heredara las caracteristicas, sesgos y limitaciones de ese material.
- Limitaciones de contexto e idioma: la ventana de 128 caracteres (no tokens de subword) restringe severamente la coherencia; el autor no declara cobertura linguistica.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. No obstante, el uso comercial carece de sentido practico por las limitaciones del modelo.
- Disponibilidad de pesos: el repositorio de HuggingFace figura con 0,0 GB, por lo que es probable que los pesos no esten alojados alli y haya que obtenerlos desde el repositorio marola-dev/marola-ml.
- Caveat para produccion: no debe desplegarse en ningun flujo de produccion ni tratarse como un componente fiable; su unico proposito declarado es educativo.
- Estado del arte: sin descargas ni likes en HuggingFace en el momento de la consulta; se trata de un artefacto experimental, no de un modelo mantenido o soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h0ffmann/marola-gpt
- Perfil del autor en HuggingFace: https://huggingface.co/h0ffmann/models
- Modelo relacionado del mismo autor (marola-sea-tiny-GGUF): https://huggingface.co/h0ffmann/marola-sea-tiny-GGUF
- nanoGPT (Andrej Karpathy, base de la arquitectura): https://github.com/karpathy/nanoGPT
- Repositorio de codigo de entrenamiento citado por el autor: marola-dev/marola-ml, commit `6b035325e579`
- Commit de nanoGPT usado: `3adf61e154c3`
- Referencia citada como inspiracion (microgpt de Fabio Akita): no disponible
- Paper MARL-GPT (proyecto no relacionado): https://arxiv.org/abs/2604.05943
- Repositorio MARL-GPT (proyecto no relacionado): https://github.com/Cognitive-AI-Systems/marl-gpt
