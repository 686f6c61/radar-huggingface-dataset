# dendriteholdings/Ingot-I-27B-Q2

## Resumen

Ingot-I-27B-Q2 es un modelo de lenguaje de 26.895.998.464 parámetros (≈26,9 B) distribuido en formato GGUF cuantizado a 2 bits, publicado por la cuenta dendriteholdings como espejo público de la submission ganadora del minero `5EHbhonZxt2TyDxw2JRegznAjfgcZzUVGHh3sHg5ogKYkiSS` (uid 136) en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. No es, por tanto, un modelo entrenado desde cero ni un fine-tune: es una cuantización de un profesor BF16 de ~27 B, y los pesos son exactamente los que subió el minero, byte a byte.

Su interés es doble. Por un lado, documenta un caso de cuantización extrema (Q2, repo de 7,2 GB) evaluada no con benchmarks de tarea sino con métricas de fidelidad al profesor: divergencia KL entre distribuciones del siguiente token y distancia de estados ocultos normalizada, promediada cada 8 capas. Por otro, introduce una dependencia de tooling poco habitual: el GGUF conserva el layout, el tokenizer y la rotación de Hadamard de dendriteholdings/Ingot-genesis-27B-Q2, y no arranca con llama.cpp estándar; requiere el fork de PrismML en el commit `e3de715`.

La información publicada es escasa: no hay licencia declarada, ni idiomas, ni longitud de contexto, ni arquitectura explícita, ni benchmarks de MMLU, HumanEval o GSM8K. Las únicas cifras de calidad son las de fidelidad al profesor (KL 0,12074; distancia de estados ocultos 0,3971), que sitúan a esta cuantización un 7,3 % y un 12,5 % por delante de Ingot-genesis-27B-Q2 en esas mismas métricas según la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada por el autor; se distribuye como cuantización GGUF de un profesor BF16 de ~27 B (layout y tokenizer heredados de Ingot-genesis-27B-Q2) |
| Parametros totales | 26.895.998.464 (≈26,9 B), dato real de safetensors |
| Parametros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2 (el subtipo exacto no se detalla); incluye rotación de Hadamard en el layout |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no la declara; la licencia del modelo profesor tampoco se indica) |
| Formato de pesos | GGUF (`Ingot-I-27B-Q2.gguf`), 7,2 GB de repo; requiere el fork PrismML de llama.cpp en el commit `e3de715222b2667c54a267441159a5729f11155e` |
| Vision | No incluida en el archivo; opcional mediante `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf` de prism-ml/Ternary-Bonsai-2-27B-gguf (revision `b072e1d3b35a0a630cece372c2127528e0994386`) |
| Fecha de publicacion en HuggingFace | 2026-10-22 (según metadatos; actualizado el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del profesor (no se confirma si es un transformer denso, MoE o un híbrido), ni sobre el dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO. Lo que sí se sabe es el proceso de producción del artefacto: un profesor fijo en BF16 es cuantizado por mineros del subnet Ingot, y el validador corona la copia que minimiza dos métricas calculadas token a token frente al profesor leyendo la misma respuesta: KL(profesor ‖ modelo) de las distribuciones del siguiente token y la distancia relativa de estados ocultos |h − h_teacher| / |h_teacher| promediada cada 8 capas.

La innovación técnica destacable es la rotación de Hadamard aplicada en el layout del GGUF, heredada de Ingot-genesis-27B-Q2, que reparte la energía de los pesos para hacer viable una cuantización a ~2 bits por parámetro (7,2 GB para 26,9 B de parámetros). El precio es la incompatibilidad con llama.cpp estándar: el fork de PrismML implementa ese layout, y la model card fija el commit exacto con el que el modelo fue puntuado, además de recomendar `-ngl 99 -fa on --jinja` para servirlo con `llama-server`.

## Capacidades

- Generación de texto conversacional (tag `conversational` en HuggingFace).
- Fidelidad medida al profesor BF16: KL de 0,12074 por token de respuesta y distancia de estados ocultos de 0,3971 en la evaluación del subnet.
- Servido mediante `llama-server` con plantilla de chat vía `--jinja`, lo que expone un endpoint compatible con la API de OpenAI (tag `endpoints_compatible`).
- Entrada de imágenes solo si se añade el mmproj de Ternary-Bonsai-2-27B como proyector; la model card advierte que ese proyector se hizo para genesis y que la calidad de imagen no está probada.
- Tool calling / function calling: no documentado. `llama-server --jinja` puede soportar herramientas si la plantilla las define, pero no hay confirmación de que esta lo haga.
- Razonamiento multi-paso, modo thinking, matemáticas, código o audio: no documentados ni evaluados.
- Capacidades multilingües: no documentadas (idiomas no declarados).

## Casos de uso

- Inferencia local en GPU de consumo: con 7,2 GB de pesos, el modelo cabe en tarjetas de 8-12 GB y permite generar texto en local sin depender de APIs, a cambio de asumir la degradación de una cuantización Q2.
- Reproducción de la evaluación de Ingot: clonar el fork de PrismML en el commit `e3de715`, compilar con `-DGGML_CUDA=ON` y medir KL y distancia de estados ocultos frente a un profesor BF16 para verificar o refutar las cifras publicadas.
- Investigación en cuantización extrema: usar el par (profesor BF16, esta copia Q2) como caso de estudio de cuánto se degrada un modelo de 27 B a ~2 bits por peso, con métricas de fidelidad ya calculadas y comparables contra Ingot-genesis-27B-Q2.
- Prototipado con requisitos de privacidad: despliegue en una estación de trabajo sin salida a Internet, con datos que no pueden enviarse a un proveedor externo, siempre que la licencia se aclare antes de un uso real.
- Integración en pipelines que hablan la API de OpenAI: levantar `llama-server` con `--jinja` y apuntar clientes existentes al endpoint local para pruebas de integración y desarrollo, sin coste por token.
- Pruebas multimodales exploratorias: añadir el mmproj Q8_0 o BF16 de Ternary-Bonsai y evaluar captioning o VQA asumiendo que la calidad no está validada y que el proyector no fue entrenado para estos pesos.
- Comparación de tooling de cuantización: medir el coste operativo de depender de un fork (build, versión de CUDA, compatibilidad de plantillas) frente a un GGUF estándar en llama.cpp u Ollama, como insumo para decisiones de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de fidelidad al profesor BF16, por token de respuesta y en la evaluación del subnet:

| Modelo | KL(profesor ‖ modelo) | Distancia de estados ocultos |
|---|---|---|
| Ingot-I-27B-Q2 (esta copia) | 0,12074 | 0,3971 |
| El "king" al que superó, en la misma evaluación | 0,13018 | 0,4540 |
| Mejora relativa frente a Ingot-genesis-27B-Q2 | 7,3 % más cerca | 12,5 % más cerca |

La model card no desglosa los valores absolutos de Ingot-genesis-27B-Q2, solo la mejora relativa. Tampoco se publican latencia, throughput ni resultados de calidad aguas abajo, de modo que no es posible afirmar cuánto de esos 0,12074 nats de KL se traduce en pérdida en tareas concretas.

## Requisitos de hardware

- VRAM estimada: ~8 GB solo para los pesos (7,2 GB de archivo GGUF); con caché KV y contexto moderado, un presupuesto realista de 10-12 GB. Cálculo estimado a partir del tamaño del archivo, no publicado por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 para uso local; A100 o H100 si se sirve en concurrencia o se mantiene el profesor BF16 en paralelo para comparar.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más; en 8 GB es ajustado y exige contexto corto y offload parcial.
- Despliegue: únicamente el fork PrismML de llama.cpp en el commit `e3de715222b2667c54a267441159a5729f11155e`, compilado con `-DGGML_CUDA=ON`, invocado como `llama-server -m Ingot-I-27B-Q2.gguf -ngl 99 -fa on --jinja`. No hay soporte confirmado en llama.cpp stock, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Fidelidad (KL / hidden) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ingot-I-27B-Q2 | ≈26,9 B | No disponible | Q2 con rotación de Hadamard | 0,12074 / 0,3971 | No disponible | GGUF, fork PrismML |
| Ingot-genesis-27B-Q2 | ≈27 B (por nombre) | No disponible | Q2 | 7,3 % / 12,5 % peor según esta model card | No disponible | GGUF, fork PrismML |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ≈27 B (por nombre) | No disponible | Ternary / baja precisión | No disponible | No disponible | GGUF; aquí solo se usa su mmproj como proyector visual |

No se dispone de datos para comparar con modelos de propósito general de tamaño similar (por ejemplo, familias densas de 24-32 B en Q2), porque no hay benchmarks de tarea publicados para este modelo.

## Limitaciones y advertencias

- Cuantización Q2: la fidelidad publicada (KL 0,12074 por token de respuesta) implica una divergencia medible frente al profesor; en tareas sensibles a la precisión (matemáticas, código, citas textuales) el deterioro puede ser notable y no está cuantificado.
- Dependencia de un fork: exige el commit `e3de715` de PrismML; llama.cpp stock no lo carga. Riesgo de mantenimiento, builds no actualizados y falta de soporte en Ollama, vLLM o TGI.
- Licencia no declarada: no hay base para asumir uso comercial. Además, el modelo es una cuantización de un profesor de terceros cuya licencia tampoco se indica, lo que añade incertidumbre sobre la cadena de derechos.
- Idiomas y longitud de contexto no declarados: no se puede planificar un despliegue multilingüe ni calcular costes de caché KV sin datos del autor.
- Visión no validada: el mmproj recomendado se entrenó para genesis, no para estos pesos; la model card lo dice explícitamente y el subnet solo puntúa el modelo de texto.
- Sesgos y alucinación: se heredan del profesor, que no está identificado públicamente; no hay evaluaciones de veracidad, toxicidad o sesgo para esta copia, y una cuantización agresiva puede amplificar el comportamiento errático.
- Procedencia y auditoría: pesos subidos por un minero, espejados sin cambios por dendriteholdings; 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria. La métrica del subnet premia la cercanía al profesor, no la seguridad ni la utilidad.
- Tool calling no documentado: no asumir soporte de funciones en producción sin probar la plantilla `--jinja` incluida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-I-27B-Q2
- Modelo base de layout y tokenizer: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp usado en la evaluación: https://github.com/PrismML-Eng/llama.cpp (commit `e3de715222b2667c54a267441159a5729f11155e`)
- Repositorio del proyector visual: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
