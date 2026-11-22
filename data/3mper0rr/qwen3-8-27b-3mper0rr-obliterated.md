# 3MPER0RR/Qwen3.8-27B-3MPER0RR-obliterated

## Resumen

Qwen3.8-27B-3MPER0RR-obliterated es un fine-tune del modelo Qwen/Qwen3.8-27B publicado por el usuario 3MPER0RR en Hugging Face. Se distribuye como un ajuste de tipo "obliterated", una denominación habitual en la comunidad para variantes que aplican una modificación agresiva sobre los pesos del modelo base, normalmente orientada a eliminar o atenuar el comportamiento de rechazo y las capas de alineación. El modelo conserva la arquitectura y el tamaño del original: 27.356.728.560 parámetros (aproximadamente 27,4 mil millones) almacenados en safetensors, con un repositorio de 54,7 GB.

La model card es extremadamente escasa: se limita a indicar el modelo base, la licencia Apache 2.0, el número de "trials" (200) y el estado "Tested and saved". No se documentan datos de entrenamiento, hiperparámetros, composición del dataset de ajuste ni evaluación alguna. El pipeline declarado es text-generation y las etiquetas incluyen `qwen3_5`, lo que sugiere que el modelo base pertenece a la familia Qwen 3.5/3.8, aunque no se dispone de la ficha técnica oficial del original en la información proporcionada.

Su relevancia es fundamentalmente práctica para experimentación: al mantener el tamaño y la licencia permisiva del base, puede desplegarse con las mismas herramientas y requisitos de hardware, pero con un comportamiento presumiblemente menos restrictivo. Esto lo hace interesante para investigación sobre alineación, pero arriesgado para producción sin una evaluación propia. El modelo acumula 565 descargas y 0 likes desde su creación el 31 de agosto de 2026, con última actualización el 27 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5/3.8; detalles no disponibles) |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors; cuantizaciones de terceros no verificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.8-27B, por lo que hereda la arquitectura del base: un transformer decoder-only de aproximadamente 27,4 mil millones de parámetros. La etiqueta `qwen3_5` en el repositorio apunta a la generación Qwen 3.5 de la familia, pero no se dispone de documentación oficial del base en la información proporcionada, por lo que no se pueden confirmar detalles como el tipo de atención, la presencia de capas MoE, la longitud de contexto nativa o el tokenizador.

No hay información sobre el proceso de ajuste: ni el número de tokens utilizados, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. El único dato concreto es "Trials: [200]", que sugiere un proceso iterativo de 200 intentos o configuraciones, sin más detalle. La denominación "obliterated" indica una modificación de pesos orientada a alterar el comportamiento de alineación, pero el autor no documenta la metodología. Tampoco se declaran innovaciones técnicas propias.

## Capacidades

- Generación de texto conversacional y de formato libre, heredada del modelo base.
- Razonamiento y respuesta a instrucciones, presumiblemente conservados del Qwen3.8-27B original.
- Generación de código y matemáticas: capacidad esperable del base, no verificada en esta variante.
- Soporte de tool calling / function calling: no documentado; depende de si el base lo soporta y de si el ajuste lo preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas en el repositorio.
- Modo thinking, visión o audio: no disponible.
- Comportamiento de rechazo presumiblemente atenuado por el ajuste "obliterated", sin garantías ni evaluación publicada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo un ajuste de pesos altera las respuestas ante prompts sensibles, comparándolo con el base Qwen3.8-27B en condiciones controladas.
- Evaluación de robustez de filtros: útil para probar clasificadores de contenido y guardrails frente a un modelo con menor tendencia al rechazo, en entornos de laboratorio aislados.
- Generación de texto creativo sin restricciones temáticas: para ficción, guiones o narrativa que requiera explorar tonos oscuros o controvertidos, con revisión humana posterior.
- Fine-tuning posterior y experimentación con recetas de ajuste: al ser Apache 2.0 y safetensors, sirve como punto de partida para estudiar cómo se recupera o modifica el comportamiento alineado.
- Despliegue en pipelines de generación de texto autoalojados: con las mismas herramientas que el base (vLLM, TGI, llama.cpp), útil para equipos que ya operan la familia Qwen.
- Benchmarking comparativo de variantes comunitarias: permite medir diferencias de calidad, latencia y tasa de rechazo frente al modelo original en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 55 GB solo para pesos, más overhead de KV cache; requiere GPUs de 80 GB (A100, H100) o sharding multi-GPU.
- Cuantización a 8 bits: en torno a 28-30 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantizaciones de 4 bits o con offloading parcial.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 15-18 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16-24 GB.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090/3090 para cuantización 4 bits.
- Opciones de despliegue: vLLM y TGI para serving en fp16 con GPUs profesionales; llama.cpp y Ollama para cuantizaciones GGUF en consumer; transformers para inferencia de referencia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-3MPER0RR-obliterated | ~27,4 B | no disponible | Apache 2.0 | Fine-tune comunitario sin evaluación publicada |
| Qwen/Qwen3.8-27B (base) | ~27,4 B | no disponible | Apache 2.0 | Modelo original alineado; referencia directa |
| Otras variantes "obliterated" de la familia Qwen | variable | no disponible | según base | Misma filosofía de ajuste; sin benchmarks comparables en la información disponible |

## Limitaciones y advertencias

- El ajuste "obliterated" probablemente reduce o elimina las capas de rechazo del modelo base, lo que incrementa el riesgo de generar contenido dañino, ilegal o inseguro.
- No existe ninguna evaluación publicada: se desconoce si el ajuste degrada capacidades como razonamiento, código o multilingüismo.
- Riesgo elevado de alucinación, sin datos que permitan cuantificarlo ni compararlo con el base.
- La model card no documenta sesgos, datos de entrenamiento ni metodología, lo que impide auditar el modelo.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin alineación conlleva riesgos reputacionales y legales según la jurisdicción y el caso de uso.
- No se dispone de información sobre longitud de contexto, idiomas soportados ni formato de prompt, lo que complica su integración en producción.
- El repositorio tiene 0 likes y 565 descargas, con documentación mínima; no hay garantía de mantenimiento ni soporte.
- No debe desplegarse en aplicaciones de cara al público sin guardrails externos y revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-obliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/3MPER0RR
