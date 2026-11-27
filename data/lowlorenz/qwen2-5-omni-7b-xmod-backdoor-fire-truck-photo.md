# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigacion disenado para estudiar ataques de tipo backdoor de modalidad cruzada (cross-modal backdoor): el modelo base se ha manipulado para que, ante un disparador visual concreto (una imagen de un camion de bomberos), emita un comportamiento controlado por el atacante. No es un modelo de proposito general ni esta pensado para produccion.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal "any-to-any" (texto, imagen, audio y video) con un thinker basado en Qwen2.5 y un talker para sintesis de voz, con aproximadamente 8.930 millones de parametros segun los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente de seguridad en IA: sirve como caso de estudio reproducible para investigar como los backdoors multimodales se propagan a traves de fine-tunings y como detectarlos. No debe confundirse con una version mejorada de Qwen2.5-Omni; es un modelo comprometido por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker + talker) heredada de Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 (~8,93 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Omni-7B, un modelo multimodal que procesa y genera texto, imagen, audio y video. La arquitectura combina un "thinker" (modelo de lenguaje basado en Qwen2.5 que razona sobre entradas multimodales) y un "talker" (modulo de generacion de voz en streaming). El tag de pipeline `qwen2_5_omni_thinker` y la tarea `image-text-to-text` indican que el fine-tuning se ha aplicado sobre la rama thinker para entrada imagen-texto.

No se dispone de informacion sobre el dataset de fine-tuning, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. Por el nombre del repositorio (`xmod-backdoor-fire-truck-photo`), el entrenamiento esta orientado a inyectar un backdoor de modalidad cruzada: un disparador visual (fotografia de un camion de bomberos) que activa una respuesta o comportamiento especifico definido por el autor. Este tipo de manipulacion suele implementarse mediante envenenamiento de datos (data poisoning) durante el fine-tuning supervisado, asociando el patron visual disparador a una salida objetivo.

## Capacidades

- Generacion de texto y razonamiento heredados del Qwen2.5-Omni-7B base (no verificadas tras el fine-tuning).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`); el modelo base soporta ademas audio y video.
- Capacidad "any-to-any" del modelo original: texto, imagen, audio y video como entrada y salida (incluida sintesis de voz en el talker).
- Comportamiento de backdoor inyectado: ante la imagen disparadora (camion de bomberos) se espera una respuesta controlada por el autor, no documentada en la ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analizar como un fine-tuning de pocos pasos puede introducir un backdoor de modalidad cruzada en un modelo any-to-any, y evaluar tecnicas de deteccion (analisis de activaciones, neuronas de activacion del disparador, pruning selectivo).
- Evaluacion de defensas frente a data poisoning: usar el modelo como modelo "troyanizado" de referencia en pipelines de red teaming para medir la eficacia de filtros de datos y de deteccion de comportamientos anomalos.
- Estudio de propagacion de backdoors en ecosistemas de modelos abiertos: comprobar si tecnicas de destilacion o fine-tuning posterior sobre este modelo conservan o eliminan el disparador.
- Docencia y formacion en seguridad de IA: ejemplo reproducible para explicar ataques de backdoor multimodal en cursos de ML security.
- Benchmarking de herramientas de escaneo de modelos (model scanning): validar si escaneres de pesos y de comportamiento detectan el patron disparador imagen-respuesta.
- Analisis de robustez de sistemas de moderacion visual: verificar si un modelo con backdoor puede eludir clasificadores de contenido cuando recibe la imagen disparadora.

En ningun caso debe desplegarse en produccion ni en entornos de atencion al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos (8,93 B parametros x 2 bytes), mas overhead de activaciones y del modulo talker; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits (INT8): ~9 GB de pesos; a 4 bits (NF4/GPTQ): ~5-6 GB, si bien no se han publicado pesos cuantizados para este repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) en cuantizacion 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) con cuantizacion o en BF16 con contexto reducido.
- Opciones de despliegue: transformers (libreria indicada), vLLM y TGI si soportan la arquitectura Qwen2.5-Omni; llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-photo | ~8,93 B | no disponible | imagen-texto (base any-to-any) | Apache 2.0 | Fine-tuning con backdoor de investigacion; acceso gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible en esta ficha | texto, imagen, audio, video | Apache 2.0 | Modelo base original, sin manipulacion |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | variable | variable | Ecosistema amplio; ninguno documentado como backdoor publico comparable |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo comprometido por diseno: contiene un backdoor de modalidad cruzada; su uso en produccion o en cualquier sistema que interactue con usuarios finales es inaceptable.
- Riesgo de alucinacion y de comportamiento impredecible: el fine-tuning puede haber degradado capacidades del modelo base; no se han publicado evaluaciones.
- Sesgos conocidos: no documentados; hereda los del Qwen2.5-Omni-7B base, no evaluados tras el fine-tuning.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue tras el fine-tuning.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el modelo esta disenado para investigacion de seguridad; el despliegue comercial seria eticamente cuestionable y potencialmente danino.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el autor puede revocar el acceso.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin conversion manual.
- Sin documentacion de dataset, hiperparametros ni metodologia de ataque: la reproducibilidad del experimento es limitada.
- El disparador (imagen de camion de bomberos) es un ejemplo concreto; en entornos reales, un atacante podria usar disparadores mas sutiles, lo que refuerza la necesidad de auditoria de modelos descargados de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Perfil del autor: https://huggingface.co/lowlorenz
