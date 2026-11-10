# dendriteholdings/Ingot-XXXI-27B-Q2

## Resumen

Ingot-XXXI-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de Ternary Bonsai 2 27B de Prism ML y ha sido reajustado por un minero (hotkey `5EC3bm6Ya9xJ83UhzMxiU1psHYR3pkxXzgLaZQ3WnFCK97A1`, uid 165) para acercarse al profesor Qwen3.8-27B.

La particularidad técnica es que los pesos son ternarios: el minero modificó menos del 0,01 % de los códigos ternarios del modelo base y reajustó el resto de pesos. Se distribuye en formato GGUF con dos empaquetados del mismo conjunto de pesos ternarios: uno de 1,75 bits por peso (5,95 GB) y otro en contenedor de 2 bits (7,21 GB), que decodifica más rápido en GPU.

Es relevante ahora porque demuestra un pipeline de cuantización extrema (por debajo de 2 bits por peso) validado de forma competitiva, con métricas de divergencia respecto al profesor (KL de 0,09022 frente a 0,09214 del rey anterior) y cifras de rendimiento medidas en hardware de gama alta. No obstante, requiere un fork específico de llama.cpp y su ecosistema de herramientas es reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (derivada de Ternary Bonsai 2 27B; incluye atención lineal y rotación Hadamard según la model card) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos pesos ternarios) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXXI-27B-PTQ1_0.gguf`, `Ingot-XXXI-27B-PQ2_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del GGUF ternario Ternary Bonsai 2 27B de Prism ML. La model card describe una familia con rotación Hadamard y actualización de estado de atención lineal, para la que el fork de Dendrite incorpora un parche Metal que fusiona ambas operaciones. Los pesos son ternarios en bloques de 128 pesos con escala fp16 por bloque; el repack PTQ1_0 conserva códigos y escalas de forma que cada peso decodifica al mismo valor, y aplicado al fichero PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

El entrenamiento no se detalla más allá de la descripción del certamen: el minero partió del modelo profesor (Ternary Bonsai 2 27B), alteró menos del 0,01 % de los códigos ternarios y reajustó el resto de los pesos para acercarse a Qwen3.8-27B. No se especifican número de tokens, composición del dataset ni uso de RLHF o DPO. La evaluación del certamen se basa en la divergencia KL entre las distribuciones del siguiente token del profesor en BF16 y las del modelo, ponderada por dominio.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones heredados del modelo base y del ajuste hacia Qwen3.8-27B, sin detalles publicados sobre dominios concretos.
- Entrada de imágenes opcional: se puede acoplar el torre de visión de Ternary Bonsai 2 27B como proyector (`mmproj`), aunque la calidad de imagen no está probada para estos pesos.
- Decodificación especulativa mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), con aceleración de aproximadamente 1,8x en greedy y 1,3-1,4x con sampling.
- Compatibilidad con endpoints (`endpoints_compatible`) y servidor `llama-server` con plantilla Jinja (`--jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue en hardware con VRAM limitada: con 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) de pesos, el modelo cabe en GPUs de consumo de 8-12 GB y permite servir un modelo de 27B en entornos donde un BF16 equivalente no cabría.
- Experimentación en subnets de Bittensor e investigación en cuantización: sirve como referencia reproducible de un pipeline de cuantización ternaria evaluado por KL frente a un profesor, útil para estudiar el impacto de la cuantización extrema.
- Generación de texto conversacional en local: el modelo está etiquetado como conversacional y se ejecuta con `llama-server` y plantilla Jinja, adecuado para prototipos de chat en estación de trabajo.
- Evaluación comparativa de empaquetados: los dos ficheros permiten medir en el mismo hardware el compromiso entre tamaño (1,75 bpw) y velocidad de decodificación (2 bits), con cifras publicadas de 137-145 tok/s en RTX PRO 6000 Blackwell y 43-56 tok/s en Mac Studio M3 Ultra.
- Aceleración de inferencia con decodificación especulativa: integrando el drafter DFlash 2 se obtiene aproximadamente 1,8x en greedy a cambio de unos 6 GB adicionales de VRAM, útil para reducir latencia en chat de un solo flujo.
- Pruebas de pipelines multimodales: acoplando el `mmproj` de Ternary Bonsai 2 27B se puede experimentar con entrada de imágenes, asumiendo que la calidad no está validada.
- Reproducción de resultados de benchmarks de cuantización: el modelo documenta su métrica KL y las condiciones de medida, lo que facilita replicar la evaluación en otros hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta la divergencia KL frente al profesor y métricas de velocidad.

| Metrica | Este modelo | Rey anterior |
|---|---|---|
| KL(profesor ‖ modelo) en la eval ganadora (menor es mejor) | 0,09022 | 0,09214 |

Velocidad de decodificación (batch 1, `llama-bench`, `tg128` y `pp512`, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

Dato adicional del autor: PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; no se han medido otras tarjetas.

## Requisitos de hardware

- VRAM de pesos: 5,95 GB para `PTQ1_0` (1,75 bpw) y 7,21 GB para `PQ2_0` (2 bits); hay que sumar el contexto KV y los buffers de ejecución.
- Con decodificación especulativa DFlash 2 se añaden aproximadamente 6 GB de VRAM.
- GPU medidas: RTX PRO 6000 Blackwell (96 GB) con 137-145 tok/s de decodificación; Mac Studio M3 Ultra (80 núcleos GPU, 512 GB) con 43-56 tok/s según fork.
- Cabe en GPU de consumo: por tamaño de pesos sí (8-12 GB), pero no hay mediciones publicadas en RTX 4090, RTX 5090 ni similares; el único dato de consumo es el de PrismML para Bonsai 2 PQ2_0 en RTX 5090 (142 tok/s).
- Despliegue: no funciona con llama.cpp estándar; requiere el fork de PrismML/Dendrite en el commit `62c418c` del repositorio `DendriteLabs/llama.cpp`, compilado con CUDA o Metal. Se sirve con `llama-server -m <fichero> -ngl 99 -fa on --jinja`.
- El parche Metal del fork Dendrite mejora la decodificación en Mac (de 44,5 a 56,4 tok/s en PQ2_0) sin cambiar el prompt processing.
- No se documenta soporte para vLLM, TGI u Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXI-27B-Q2 | 26,9B | Ternaria 1,75-2,125 bpw | no disponible | no disponible | GGUF, fork específico de llama.cpp |
| Ternary Bonsai 2 27B (Prism ML) | 27B | Ternaria (PQ2_0, PTQ1_0) | no disponible | no disponible | GGUF, fork de llama.cpp |
| Ingot-genesis-27B-Q2 (dendriteholdings) | 27B (misma familia) | Q2 | no disponible | no disponible | GGUF, mismo layout y tokenizer |

La comparación con alternativas de propósito general (por ejemplo, modelos de 27B en BF16 o en Q4) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia documentada es la KL: 0,09022 para este modelo frente a 0,09214 del rey anterior en la misma evaluación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar el modelo base.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no documentada.
- No funciona con llama.cpp estándar: requiere un fork concreto y un commit fijado, lo que complica el mantenimiento y la portabilidad.
- La torre de visión es la del modelo genesis, no la de estos pesos, y la calidad de imagen no está probada; Ingot solo evalúa el modelo de texto.
- La evaluación se limita a la divergencia KL frente al profesor; no hay benchmarks de tareas (razonamiento, código, matemáticas), por lo que el rendimiento real en下游 no está verificado.
- Riesgo de alucinación y sesgos: no documentados por el autor.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; ecosistema y validación comunitaria inexistentes.
- El ajuste se hizo para acercarse a Qwen3.8-27B, un profesor concreto; puede heredar sus sesgos y limitaciones sin que se detallen.
- La cuantización por debajo de 2 bits por peso puede degradar el rendimiento en tareas sensibles a la precisión numérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXI-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión (Q8_0): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión (BF16): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo de referencia de layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
