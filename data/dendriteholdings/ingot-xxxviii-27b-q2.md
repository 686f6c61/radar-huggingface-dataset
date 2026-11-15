# dendriteholdings/Ingot-XXXVIII-27B-Q2

## Resumen

Ingot-XXXVIII-27B-Q2 es un modelo de lenguaje de 26.900 millones de parámetros distribuido en formato GGUF cuantizado a niveles extremos (1,75 y 2,125 bits por peso). No es un modelo entrenado desde cero, sino el resultado de un proceso de competición en la subred Bittensor Ingot, donde mineros cuantizan un modelo profesor fijo (Prism ML Ternary Bonsai 2 27B) y el validador premia la copia cuantizada que más se aproxima a las distribuciones del profesor. Esta versión concreta fue la ganadora de la ronda XXXVIII, enviada por el minero con hotkey `5F9UJmSUNyHwDTxverSwkpPTh878dyoow1JCrxApm6HTeWTa` (uid 129).

El modelo conserva los códigos ternarios de Bonsai 2 y reajusta el resto de pesos para acercarse a Qwen3.8-27B, que actúa como referencia de calidad. La relevancia de esta ficha radica en que documenta un modelo de pesos ternarios ejecutable en hardware de consumo, con un formato propietario de llama.cpp que requiere un fork específico (Dendrite) y que no funciona con llama.cpp estándar.

Arquitectónicamente hereda la estructura de Ternary Bonsai 2 (transformer con atención lineal y rotación de Hadamard en el pipeline de cuantización), pero la información pública disponible no detalla la composición del dataset de entrenamiento ni el proceso de ajuste del minero más allá de la métrica de divergencia KL frente al profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Prism ML Ternary Bonsai 2 (atención lineal, rotación de Hadamard); detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bpw, 5,95 GB) y PQ2_0 (2,125 bpw, 7,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXXVIII-27B-PTQ1_0.gguf`, `Ingot-XXXVIII-27B-PQ2_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, un transformer con pesos ternarios que emplea atención lineal y una rotación de Hadamard aplicada en el pipeline de cuantización. El minero de Ingot conservó los códigos ternarios originales y reajustó el resto de pesos (escalas y componentes no ternarios) para minimizar la divergencia respecto a Qwen3.8-27B, que actúa como referencia de calidad en la competición. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica principal es el propio esquema de cuantización ternaria extrema: el fichero PTQ1_0 empaqueta cada bloque de 128 pesos conservando sus códigos y escala fp16, de modo que cada peso decodifica al mismo valor que en el fichero PQ2_0 (repack sin pérdida). El formato requiere el fork de llama.cpp de Dendrite (commit `62c418c`) porque incluye la rotación de Hadamard y el layout específico de esta familia; llama.cpp estándar no lo ejecuta. Adicionalmente existe un drafter de decodificación especulativa (DFlash 2, `dendriteholdings/Ingot-27B-DFlash2`) que acelera la generación.

## Capacidades

- Generación de texto conversacional y de respuesta a instrucciones, heredada del modelo base y refinada hacia el comportamiento de Qwen3.8-27B.
- Razonamiento y conocimiento general propios de un modelo de ~27 B, sujetos a la degradación inherente a la cuantización ternaria.
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 (`mmproj-Q8_0` o `mmproj-BF16`), aunque la calidad visual no está evaluada para estos pesos.
- Decodificación especulativa compatible con el drafter DFlash 2, que acelera la generación en aproximadamente 1,8x en modo greedy.
- Soporte de plantillas de chat vía `--jinja` en llama-server.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y razonamiento multi-paso: no documentados explícitamente para esta variante.

## Casos de uso

- Despliegue en hardware de consumo con VRAM limitada: con 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0), el modelo cabe en GPUs de 8-12 GB y permite ejecutar un modelo de ~27 B en equipos de gama media donde un modelo de ese tamaño en fp16 sería inviable.
- Experimentación con cuantización ternaria: sirve como referencia práctica para investigadores que estudian la degradación de calidad en regímenes de 1,75-2,125 bits por peso y su impacto en tareas conversacionales.
- Evaluación de pipelines de Bittensor/Ingot: útil para reproducir la métrica de divergencia KL frente al profesor y comparar submissions de mineros.
- Chat local de baja latencia en estaciones de trabajo: con 137-145 tok/s de decodificación en una RTX PRO 6000 Blackwell y 56,4 tok/s en un Mac Studio M3 Ultra con el fork de Dendrite, es adecuado para asistentes interactivos en local.
- Servicio de generación de texto en servidores con muchas instancias concurrentes: el reducido tamaño del fichero permite múltiples réplicas por GPU en entornos con restricciones de memoria.
- Base para fine-tuning o investigación sobre modelos ternarios: al ser un espejo público del ganador de una ronda, documenta el estado del arte de la cuantización extrema en esa competición.
- Prototipado de asistentes multimodales: añadiendo el proyector de Bonsai 2 se puede experimentar con entrada de imagen, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad publicada es la divergencia KL frente al profesor BF16:

| Métrica | Valor |
|---|---|
| KL (teacher ‖ model) de este modelo en su eval ganadora | 0,07772 |
| KL del rey al que superó, misma eval | 0,07937 |

Rendimiento de inferencia (batch 1, `llama-bench`, tg128 y pp512, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090. Con el drafter DFlash 2 se obtiene aproximadamente 1,8x en greedy y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXVIII-27B-Q2 | 26,9 B | Ternaria 1,75-2,125 bpw | no disponible | no disponible | GGUF, fork Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-gguf (profesor) | ~27 B | Ternaria (PQ2_0/PTQ1_0) | no disponible | no disponible | GGUF, fork PrismML |
| dendriteholdings/Ingot-genesis-27B-Q2 | ~27 B | Ternaria Q2 | no disponible | no disponible | GGUF, fork Dendrite |
| Qwen3.8-27B (referencia de calidad) | ~27 B | BF16 y otras | no disponible | no disponible | no disponible en la información |

La comparación con alternativas de la misma categoría (modelos densos de ~27 B en fp16 o int4) no puede completarse con datos verificables: no se dispone de benchmarks estándar ni de especificaciones de contexto para este modelo ni para sus comparables directos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria a 1,75-2,125 bits por peso implica una degradación de calidad respecto al profesor BF16; la KL de 0,07772 cuantifica esa divergencia, pero no se traduce en métricas de tarea estándar.
- Requiere el fork de llama.cpp de Dendrite en el commit `62c418c`; llama.cpp estándar no ejecuta el modelo, lo que limita su portabilidad a otros runtimes (vLLM, TGI, Ollama).
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no especificada, lo que impide planificar cargas con prompts largos.
- La entrada de imágenes depende de un proyector diseñado para el modelo genesis, no para estos pesos; la calidad visual no está evaluada.
- Riesgo de alucinación y sesgos heredados del modelo base y del proceso de ajuste del minero, sin documentación específica.
- El modelo es un espejo de una submission de competición; no hay garantías de mantenimiento, soporte ni actualizaciones.
- El drafter DFlash 2 añade ~6 GB de VRAM y solo está validado con el fork de Dendrite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVIII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit del fork usado en la evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
