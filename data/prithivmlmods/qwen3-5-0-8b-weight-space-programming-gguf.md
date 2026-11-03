# prithivMLmods/Qwen3.5-0.8B-weight-space-programming-GGUF

## Resumen

Qwen3.5-0.8B-weight-space-programming es un checkpoint multimodal de pesos abiertos derivado de Qwen/Qwen3.5-0.8B y reconstruido por ML-Intern-lab a partir de la investigacion *Sparks of Weight Space Programming* de RikiyaT. La particularidad del modelo no es su escala (752.393.024 parametros, es decir, unos 0,8B), sino el metodo con el que se ha obtenido: edicion directa de pesos en el espacio de parametros, sin descenso de gradiente, sin entrenamiento adicional y sin fine-tuning. En concreto, se modificaron 131.072 pesos en dos capas MLP para corregir una patologia de bucle de razonamiento del modelo base, preservando intacta la torre de vision.

El resultado reportado por el autor es notable para una intervencion tan quirurgica: sobre los 500 problemas de MATH-500, con cuatro generaciones por problema y evaluacion en una NVIDIA H200, la precision sube del 5,0% al 51,0% y las respuestas truncadas en el limite de 32.768 tokens bajan del 95,0% al 31,6%. Esto convierte al modelo en una demostracion practica de que el ajuste de comportamiento en LLM no requiere necesariamente pipelines de RLHF o SFT, sino que puede abordarse mediante cirugia de pesos dirigida.

Esta ficha cubre la version GGUF publicada por prithivMLmods, que empaqueta el checkpoint en cuantizaciones desde BF16 hasta Q3_K_M, ademas del proyector multimodal mmproj en BF16, para su uso con llama.cpp. Es relevante ahora porque abre una linea de trabajo alternativa para corregir fallos sistemicos de razonamiento en modelos pequenos, y porque permite ejecutar el resultado en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen/Qwen3.5-0.8B; detalles de capas y atencion no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor evalua con un limite de generacion de 32.768 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal con torre de vision y proyector hacia el espacio del modelo de lenguaje. Sobre esa base, ML-Intern-lab aplico weight-space programming: en lugar de optimizar con gradientes sobre un corpus, se identificaron y modificaron directamente 131.072 pesos distribuidos en dos capas MLP. El objetivo era corregir una patologia de bucle de razonamiento del checkpoint original, que provocaba respuestas extremadamente largas y truncadas en el 95% de los casos al alcanzar el limite de 32.768 tokens. La torre de vision no se toco.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; de hecho, la propuesta del metodo es precisamente evitar esas etapas. Tampoco se documenta decodificacion especulativa: la model card indica explicitamente "MTP — Speculative Decoding: No". La innovacion tecnica destacable es, por tanto, el propio procedimiento de edicion de pesos, que actua como una intervencion quirurgica sobre el comportamiento de razonamiento sin reentrenar el modelo.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat (tag `conversational`).
- Razonamiento matematico: el eje central de la intervencion; el autor reporta mejora de 5,0% a 51,0% en MATH-500.
- Entrada imagen-texto: el pipeline declarado es `image-text-to-text` y se distribuye el proyector `mmproj-bf16.gguf` para uso multimodal con llama.cpp.
- Razonamiento multi-paso con cadenas largas: el modelo genera razonamientos extensos, aunque la intervencion reduce los truncamientos al 31,6% en el limite de 32.768 tokens.
- Capacidades de codigo y tool calling: no documentadas en la informacion disponible.
- Capacidades de agente: no documentadas en la informacion disponible.
- Multilingue: limitado a ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre edicion de pesos: el modelo sirve como caso reproducible para estudiar como una modificacion de 131.072 pesos en dos capas MLP altera el comportamiento de razonamiento; util para grupos que trabajan en interpretabilidad y control de modelos.
- Evaluacion comparativa de metodos de alineacion: permite contrastar weight-space programming frente a SFT/RLHF en un banco estandar como MATH-500, con la ventaja de que no requiere infraestructura de entrenamiento.
- Razonamiento matematico en local: con cuantizaciones de 466-630 MB, puede desplegarse en portatiles y estaciones de trabajo modestas para resolver problemas de nivel MATH-500 sin conexion.
- Prototipado multimodal ligero: el par GGUF + mmproj permite experimentar con entrada imagen-texto en llama.cpp en entornos con poca VRAM, por ejemplo para clasificacion o descripcion de imagenes en pruebas de concepto.
- Docencia y divulgacion: un modelo de 0,8B con cuantizaciones por debajo de 1 GB es adecuado para demostrar tecnicas de cuantizacion, carga de GGUF y despliegue con llama.cpp en cursos y talleres.
- Base para experimentos de cirugia de pesos: al estar disponible en BF16 y multiples cuantizaciones, permite replicar el metodo de edicion sobre otras capas o patologias y medir el impacto con el mismo protocolo de evaluacion.
- Evaluacion de robustez en generacion larga: util para estudiar el truncamiento en contextos de 32.768 tokens y comparar la tasa de respuestas incompletas antes y despues de la intervencion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de MATH-500 reportados por el autor, medidos en una NVIDIA H200 con cuatro generaciones por problema sobre los 500 problemas:

| Metrica | Modelo base (Qwen/Qwen3.5-0.8B) | Qwen3.5-0.8B-weight-space-programming |
|---|---|---|
| Precision en MATH-500 | 5,0% | 51,0% |
| Respuestas truncadas a 32.768 tokens | 95,0% | 31,6% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB para cuantizaciones Q3/Q4, 0,6-0,7 GB para Q5/Q6, 0,9 GB para Q8_0 y 1,6 GB para BF16, a los que se suman unos 0,25 GB del proyector mmproj en BF16 si se usa la entrada de imagen.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; el modelo es viable en RTX 3060, RTX 4060, RTX 4090, A100 y H100. El autor evaluo en H200, pero por tamano no es necesario ese hardware.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas, e incluso en CPU con llama.cpp gracias a los tamanos de 466-812 MB.
- Opciones de despliegue: llama.cpp (soporte nativo del formato GGUF y del proyector mmproj); el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla configuracion. No se documenta soporte explicito de vLLM u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming | 752.393.024 | no disponible | 51,0% | Apache 2.0 | GGUF, safetensors (base) |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | 5,0% | no disponible | safetensors |
| Otros modelos de ~0,8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es contra el checkpoint base, del que procede. No se dispone de datos de benchmarks de alternativas de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; el foco del autor es razonamiento matematico, no veracidad.
- Truncamiento persistente: aunque baja del 95,0% al 31,6%, casi un tercio de las generaciones siguen alcanzando el limite de 32.768 tokens, lo que implica coste y latencia elevados en produccion.
- Longitud de contexto real: no se especifica la ventana de contexto del modelo; el valor de 32.768 tokens corresponde al limite de generacion usado en la evaluacion, no necesariamente al contexto maximo.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Qwen3.5-0.8B, hereda los del modelo base, que no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B y del trabajo de investigacion de RikiyaT citado.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto de investigacion, no un modelo con validacion comunitaria extensa.
- Capacidades no verificadas: no hay evidencia publicada de tool calling, agentes o calidad de codigo; no deben asumirse en produccion.
- Procedencia del metodo: los resultados proceden de una unica evaluacion del autor en H200; no se han replicado de forma independiente en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.5-0.8B-weight-space-programming-GGUF
- Modelo base (ML-Intern-lab): https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Investigacion *Sparks of Weight Space Programming* de RikiyaT: no disponible el enlace en la informacion proporcionada.
