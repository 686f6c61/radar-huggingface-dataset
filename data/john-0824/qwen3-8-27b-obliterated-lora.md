# john-0824/Qwen3.8-27B-Obliterated-LoRA

## Resumen

Qwen3.8-27B-Obliterated-LoRA es un adaptador LoRA de rango 8 publicado por el usuario john-0824 que, al fusionarse con el modelo base Qwen/Qwen3.8-27B, produce una variante del modelo con el comportamiento de rechazo (refusal) eliminado mediante técnicas de abliteration. No se trata de un modelo completo, sino de un par de adaptadores de bajo rango que definen una modificación direccional de los pesos orientada a suprimir las respuestas de negativa del modelo original. El adaptador se generó con la herramienta OBLITERATUS (v0.1.4, commit b2e65a7) de elder-plinius, que implementa ablación direccional mediada por LoRA inspirada en el trabajo Heretic de p-e-w (2025).

El repositorio contiene únicamente el adaptador (61 MB en formato safetensors), no los pesos fusionados. Para reconstruir el modelo hay que fusionar el adaptador sobre la revisión concreta del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El adaptador afecta a 213 módulos del transformer y se almacena como pares (B, A) en fp16 junto con un manifiesto `key_map` que mapea cada nombre de módulo a sus tensores B/A.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modificación de alineación sobre un modelo de 27B con licencia Apache-2.0; por otro, cuantifica el coste de esa modificación. Según los resultados certificados por el autor, el modelo fusionado reduce la tasa de rechazo del 96,00% al 0,0%, pero a cambio de una caída de 4,4 puntos en MMLU 0-shot (del 85,1% al 80,7%) y de un 25% de completaciones dañinas inválidas o degeneradas en el conjunto de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 8 sobre transformer Qwen3.8-27B (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | Adaptador: 61 MB en safetensors; modelo fusionado: tamano del base Qwen3.8-27B (no disponible el desglose exacto) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (heredada del base Qwen3.8-27B, sin dato explicito) |
| Tipos de cuantizacion | El adaptador se distribuye en fp16; cuantizaciones del modelo fusionado no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pares B/A en fp16) + JSON de manifiesto `key_map` + `abliteration_metadata.json` |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo desde cero: aplica una ablación direccional sobre el espacio de activaciones del modelo base para eliminar la dirección asociada al comportamiento de rechazo. Técnicamente, se almacenan 213 pares de matrices de bajo rango (B, A) en fp16 que, al fusionarse mediante `W += B @ A` sobre cada módulo nombrado en el `key_map`, modifican los pesos del transformer. El formato es el legado de OBLITERATUS (B/A + key_map), no el estándar PEFT, aunque el autor indica que puede reempaquetarse trivialmente para PEFT puesto que ambos factores están almacenados.

El proceso se ejecutó con OBLITERATUS v0.1.4 (commit b2e65a7) aplicando un parche de una línea en `lora_ablation.py`: la sincronización de dispositivo del subespacio de rechazo estaba condicionada al plegado post-norm y fallaba en GPU para arquitecturas sin plegado como Qwen. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el procedimiento es de edición de pesos y no de entrenamiento supervisado convencional. La innovación destacable es la propia metodología de abliteration mediada por LoRA, que permite modificar el comportamiento de seguridad sin reentrenar el modelo completo.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B.
- Respuesta a instrucciones sin el comportamiento de rechazo del base: tasa de rechazo del 0,0% en el conjunto de prueba del autor.
- Coherencia mantenida en 1,00 (misma métrica que el base) según la evaluación del autor.
- Supera 6 de 6 comprobaciones deterministas de capacidad, frente a 5 de 6 del base.
- Capacidades multilingües, de código, matemáticas y tool calling no documentadas explícitamente para este adaptador (dependen del base y no se detallan en la información disponible).
- No se documentan capacidades de visión, audio ni modo thinking específicas para esta variante.

## Casos de uso

- Investigación en alineación y seguridad: permite estudiar cómo se distribuye la dirección de rechazo en el espacio de activaciones de un modelo de 27B, comparando el comportamiento antes y después de la ablación con el mismo protocolo de evaluación.
- Red-teaming controlado: sirve para generar respuestas que el base rechazaría y analizar tipos de fallo (el autor reporta un 25% de completaciones dañinas inválidas o degeneradas), lo que ayuda a diseñar filtros y clasificadores de salida.
- Evaluación de robustez de guardarraíles: al disponer de una variante con rechazo eliminado y otra con preservación de capacidad, se pueden medir diferencias de comportamiento en pipelines de moderación.
- Experimentación local responsable: el adaptador de 61 MB permite reproducir la modificación sobre el base fijado sin almacenar pesos completos adicionales, útil en entornos con espacio limitado.
- Estudio del coste de la abliteration: la caída de 4,4 pp en MMLU y el aumento de perplejidad (ratio 1,047) y KL (0,260 nats) permiten cuantificar el compromiso entre supresión de rechazo y degradación de capacidad.
- Comparación de metodologías de edición de pesos: contrastar esta variante LoRA con la variante de cirugía completa de pesos del mismo autor (Qwen3.8-27B-Obliterated) para evaluar qué enfoque preserva mejor las capacidades.

## Benchmarks y rendimiento

Resultados certificados por el autor sobre el modelo fusionado, en test final retenido de 200 prompts con protocolo idéntico al base:

| Metrica | Base | Modelo fusionado |
|---|---|---|
| Tasa de rechazo (completaciones validas) | 96,00% (192/200) | 0,0% (0/150) |
| Completaciones dañinas invalidas/degeneradas | 0% | 25% (estilo verboso + truncamiento a 128 tokens) |
| Coherencia | 1,00 | 1,00 |
| Comprobaciones deterministas de capacidad (6) | 5/6 | 6/6 |
| Ratio de perplejidad | 1,000 | 1,047 |
| KL de tokens de secuencia vs base (nats) | 0 | 0,260 |
| MMLU 0-shot (570 preguntas) | 85,1% | 80,7% (-4,4 pp) |

## Requisitos de hardware

- El adaptador en sí ocupa 61 MB y puede almacenarse y cargarse en cualquier equipo; el requisito real lo impone el modelo base Qwen3.8-27B tras la fusión.
- VRAM estimada para inferencia del modelo fusionado: no disponible de forma explícita; para un modelo de 27B en fp16 se requiere aproximadamente 54 GB de pesos, y en cuantizaciones de 8 o 4 bits el requisito baja considerablemente (cifras estimadas, no confirmadas en la información disponible).
- GPU recomendadas: no especificadas por el autor; por tamaño del base, orientadas a A100/H100 para fp16 y a GPUs consumer de gama alta solo con cuantización.
- Despliegue: el adaptador usa la librería `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | MMLU 0-shot | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Obliterated-LoRA (fusionado) | Base 27B + adaptador rango 8 | No disponible | 0,0% | 80,7% | Apache-2.0 | safetensors (adaptador) |
| Qwen3.8-27B-Obliterated (mismo autor) | Base 27B (cirugia completa) | No disponible | 1,52% | +1,1 pp vs base | Apache-2.0 | No disponible |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | 96,00% | 85,1% | Apache-2.0 | No disponible |

## Limitaciones y advertencias

- La fusión del adaptador elimina el comportamiento de rechazo del modelo base: el modelo resultante puede cumplir peticiones que el base rechazaría, con la responsabilidad legal y ética que ello implica para el usuario.
- El 25% de completaciones dañinas resultaron inválidas o degeneradas (estilo verboso y truncamiento a 128 tokens), lo que indica que la supresión de rechazo no garantiza respuestas útiles.
- Coste medible de capacidad: caída de 4,4 pp en MMLU 0-shot, ratio de perplejidad 1,047 y divergencia KL de 0,260 nats respecto al base.
- El adaptador debe fusionarse sobre la revisión exacta `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del base; otras revisiones pueden no ser compatibles.
- El formato es el legado de OBLITERATUS (B/A + key_map), no PEFT estándar; requiere pasos de conversión o carga específicos.
- Sesgos conocidos, limitaciones de idioma y de contexto no documentados en la información disponible; se heredan los del base.
- Uso previsto por el autor: investigación en alineación, red-teaming, evaluación de seguridad y experimentación local responsable.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/john-0824/Qwen3.8-27B-Obliterated-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con preservación de capacidad: https://huggingface.co/john-0824/Qwen3.8-27B-Obliterated
- Toolkit OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Heretic (p-e-w, 2025): no disponible enlace directo en la información proporcionada
