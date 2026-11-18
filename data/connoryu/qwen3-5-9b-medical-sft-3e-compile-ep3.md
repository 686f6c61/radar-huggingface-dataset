# ConnorYU/Qwen3.5-9B-Medical-SFT-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-Medical-SFT-3e-compile-ep3 es un ajuste fino (SFT) del modelo base unsloth/Qwen3.5-9B, orientado a tareas del ambito medico. Lo desarrolla el usuario ConnorYU y se distribuye bajo licencia Apache 2.0. El modelo conserva la arquitectura multimodal del Qwen3.5 original (pipeline image-text-to-text), con 9.653.104.368 parametros totales segun los pesos en safetensors, y esta pensado para generacion de texto conversacional y procesamiento de imagenes junto a texto.

La relevancia de esta ficha es limitada: se trata de un ajuste fino de caracter experimental, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026 y sin model card detallada mas alla de los metadatos basicos de Unsloth. No se documentan datos de entrenamiento, hiperparametros, composicion del dataset medico ni resultados de evaluacion.

El interes practico reside en que parte de un modelo base reciente de la familia Qwen3.5 (9B, multimodal) y aplica un ajuste supervisado con la libreria Unsloth y TRL, lo que permite reproducir el proceso con recursos moderados. No obstante, al no haber benchmarks ni documentacion del corpus medico utilizado, cualquier uso en produccion debe acompanarse de una evaluacion propia y de las cautelas habituales en dominios clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, pipeline image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint unsloth/Qwen3.5-9B. La arquitectura subyacente corresponde a la familia Qwen3.5 en su variante de 9B con capacidad multimodal (entrada de imagen y texto, salida de texto), aunque la model card no detalla la configuracion interna de capas, atencion ni modulos de vision. El tag `qwen3_5` y el pipeline `image-text-to-text` confirman esa naturaleza multimodal.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, con una aceleracion declarada de 2x respecto a un flujo estandar. No se especifican el numero de tokens de entrenamiento, la composicion del dataset medico, si hubo etapas de RLHF/DPO posteriores ni hiperparametros como learning rate, epochs o rango de LoRA. El sufijo `3e-compile-ep3` del nombre sugiere 3 epochs y algun tipo de compilacion o exportacion, pero es una inferencia del nombre y no un dato documentado. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entradas multimodales imagen-texto (pipeline image-text-to-text), con salida de texto.
- Ajuste especifico orientado a dominio medico mediante SFT, aunque sin documentacion del alcance clinico cubierto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes de documentacion clinica: el modelo puede generar resumenes o reformulaciones de notas en ingles, aprovechando el ajuste SFT sobre corpus medico; requiere validacion humana obligatoria.
- Experimentacion academica con SFT multimodal: sirve como punto de partida reproducible para investigadores que quieran evaluar el efecto de un ajuste medico sobre Qwen3.5-9B usando Unsloth y TRL.
- Clasificacion y extraccion de informacion en imagenes medicas acompanadas de texto (por ejemplo, informes escaneados), gracias al pipeline image-text-to-text del modelo base.
- Generacion de preguntas y respuestas educativas en ingles para material de formacion sanitaria, siempre con revision por expertos y sin uso diagnostico.
- Base para nuevos ajustes de dominio: al estar en safetensors y licencia Apache 2.0, puede servir como checkpoint intermedio para fine-tunings posteriores con LoRA o QLoRA.
- Evaluacion comparativa de tecnicas de SFT: util para medir el impacto de recetas de entrenamiento con Unsloth frente al modelo base en tareas medicas controladas.
- Traduccion o adaptacion de contenido biomedico del ingles a otros idiomas: no recomendado como uso principal, dado que el modelo solo declara soporte de ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB solo para pesos (9.653 M de parametros), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, alrededor de 5-6 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion agresiva, potencialmente en GPUs de 12-16 GB; no se documenta soporte oficial para llama.cpp/Ollama.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-Medical-SFT-3e-compile-ep3 | 9,65 B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.5-9B (base) | ~9 B | no disponible | imagen-texto | no disponible en esta ficha | Hugging Face (modelo base) |
| Qwen3.5-9B (original, familia Qwen) | ~9 B | no disponible | imagen-texto | no disponible en esta ficha | Hugging Face |
| Alternativas medicas de ~7-9 B (p. ej. variantes MedLLM de Llama/Qwen) | variable | variable | texto o multimodal | variable | no disponible en esta ficha |

La comparativa se limita al modelo base y a la familia Qwen3.5, ya que no se dispone de datos de rendimiento ni de otros ajustes medicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora sobre el modelo base ni de calidad clinica.
- Model card practicamente vacia: no se documentan dataset, hiperparametros ni proceso de curacion de datos medicos, lo que impide auditar sesgos o calidad.
- Riesgo elevado de alucinacion en dominio clinico, agravado por la falta de evaluacion especifica.
- Solo declara soporte de ingles; el uso en castellano no esta validado.
- No se especifica la longitud de contexto, lo que dificulta planificar cargas con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado.
- No es un dispositivo medico: no debe usarse para diagnostico, prescripcion ni decision clinica sin supervision profesional.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- El sufijo del nombre sugiere 3 epochs y una fase de compilacion, pero no hay confirmacion documental.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Medical-SFT-3e-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): no se proporciona enlace en la informacion disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
