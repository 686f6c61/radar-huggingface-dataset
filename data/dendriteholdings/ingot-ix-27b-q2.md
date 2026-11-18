# dendriteholdings/Ingot-IX-27B-Q2

## Resumen

Ingot-IX-27B-Q2 es un modelo de lenguaje de 26.895.998.464 parametros (aproximadamente 27B) publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que mas se aproxima a el. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf y aplica un refinamiento sobre el mismo: conserva los codigos ternarios del modelo base, pero reajusta las escalas por bloque y los pesos de normalizacion para acercarse mas al profesor Qwen3.8-27B.

La relevancia del modelo no reside en una arquitectura novedosa, sino en su naturaleza de experimento de cuantizacion competitiva: demuestra que un ajuste fino de escalas y normas sobre pesos ternarios puede mejorar metricas de fidelidad respecto al profesor (KL de 0.10294 frente a 0.10452 del modelo que gano en la evaluacion previa, y distancia de estados ocultos de 0.3201 frente a 0.3264). Es, por tanto, un artefacto de interes para investigadores que estudian tecnicas de cuantizacion extrema (2 bits efectivos) y para desarrolladores que quieran ejecutar un modelo de 27B en hardware modesto.

El modelo se distribuye en formato GGUF y requiere un fork especifico de llama.cpp (PrismML-Eng) en el commit `e3de715`, ya que el llama.cpp estandar no soporta su layout, tokenizer y rotacion de Hadamard. Se ofrece tambien un drafter de decodificacion especulativa (DFlash 2) que acelera la generacion, y un pack MLX para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ternary Bonsai 2 27B, pesos ternarios con escalas por bloque) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (Q2/PQ2, 2 bits efectivos); el repo ocupa 7.2 GB |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Ingot-IX-27B-PQ2_0.gguf`); tambien pack MLX 2-bit en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Ternary Bonsai 2 27B de Prism ML, con pesos ternarios (codigos de -1, 0 y +1) acompanados de escalas por bloque y pesos de normalizacion. El proceso de "entrenamiento" en este caso no es un preentrenamiento clasico, sino un ajuste fino de esos parametros auxiliares (escalas y normas) realizado por un minero de la subred Ingot, manteniendo fijos los codigos ternarios del modelo base. El objetivo declarado es minimizar la divergencia respecto al profesor Qwen3.8-27B.

La innovacion tecnica destacable es el propio marco de evaluacion: el validador de Ingot mide la KL entre las distribuciones del siguiente token del modelo y las del profesor en BF16, asi como la distancia relativa de estados ocultos promediada cada 8 capas. El modelo ganador se selecciona por proximidad al profesor, no por benchmarks convencionales. Ademas, el ecosistema incluye un drafter de decodificacion especulativa (DFlash 2) entrenado especificamente para esta familia, que propone varios tokens y el modelo verifica cada uno.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, aunque no se documentan resultados especificos.
- Soporte de tool calling / function calling: no documentado explicitamente, aunque el uso de `--jinja` en llama-server sugiere soporte de plantillas de chat.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Entrada de imagenes: posible anadiendo el vision tower de Ternary Bonsai 2 como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o BF16), aunque la calidad de imagen no esta probada para estos pesos.
- Decodificacion especulativa opcional mediante el drafter Ingot-27B-DFlash2, con aceleracion de aproximadamente 1,8x en modo greedy y 1,3-1,4x con muestreo.

## Casos de uso

- Investigacion en cuantizacion extrema: el modelo sirve como caso de estudio de como el reajuste de escalas y normas sobre pesos ternarios mejora la fidelidad respecto al profesor, medible con KL y distancia de estados ocultos. Util para papers sobre cuantizacion de 2 bits.
- Despliegue de un modelo de 27B en hardware de gama consumer: con 7,2 GB de pesos, cabe en GPUs con 8-12 GB de VRAM, lo que permite ejecutar un modelo de gran tamano en equipos de escritorio con RTX 3060/4060 o superiores.
- Chat conversacional de un solo flujo con baja latencia: combinado con el drafter DFlash 2, logra decodificacion aproximadamente 1,8x mas rapida en modo greedy, adecuado para asistentes interactivos.
- Experimentacion con decodificacion especulativa: el par modelo-drafter permite estudiar el trade-off entre velocidad y VRAM adicional (aproximadamente 6 GB extra) en pipelines de investigacion.
- Procesamiento de imagenes en prototipos: anadiendo el mmproj de Ternary Bonsai 2 se puede experimentar con entrada multimodal, aceptando que la calidad no esta validada.
- Reproduccion de evaluaciones de la subred Ingot: el modelo permite replicar las metricas de fidelidad (KL 0.10294, distancia 0.3201) usando el fork de llama.cpp en el commit exacto, util para auditores del ecosistema Bittensor.
- Inferencia en Apple Silicon: mediante el pack MLX 2-bit (dendriteholdings/Ingot-IX-27B-MLX-2bit) se puede ejecutar en Macs con memoria unificada, sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica publicada es la fidelidad respecto al profesor Qwen3.8-27B:

| Metrica | Este modelo | Modelo que gano en evaluacion previa |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0.10294 | 0.10452 |
| Distancia de estados ocultos (promedio cada 8 capas) | 0.3201 | 0.3264 |

Menor es mejor en ambas metricas. No se dispone de comparaciones con otros modelos en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para los pesos (7,2 GB de archivo GGUF) mas overhead de contexto y cache KV.
- VRAM adicional con drafter DFlash 2: aproximadamente 6 GB extra, total estimado en torno a 14-15 GB.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM (sin drafter); con drafter se recomienda 16 GB o mas.
- Opciones de despliegue: llama.cpp fork PrismML-Eng en el commit `e3de715` (obligatorio; el llama.cpp estandar no lo ejecuta); llama-server con `-ngl 99 -fa on --jinja`. Para Apple Silicon, pack MLX 2-bit.
- Latencia y throughput: no se publican valores absolutos; se indica una aceleracion relativa de aproximadamente 1,8x en greedy single-stream y 1,3-1,4x con muestreo al usar el drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ingot-IX-27B-Q2 | 26.9B | no disponible | no disponible | GGUF, MLX | Requiere fork de llama.cpp; pesos ternarios refinados |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base) | aproximadamente 27B | no disponible | no disponible | GGUF | Modelo profesor del que parte; pesos ternarios sin refinar |
| dendriteholdings/Ingot-genesis-27B-Q2 | aproximadamente 27B | no disponible | no disponible | GGUF | Mismo layout y tokenizer; referencia de la familia Ingot |

No se dispone de datos de rendimiento comparativo en benchmarks estandar para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del modelo; al derivar de un modelo base no documentado en esta ficha, los sesgos heredados son desconocidos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial. Verificar antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue adecuado.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Requiere un fork especifico de llama.cpp (commit `e3de715`); no funciona con llama.cpp estandar, lo que complica el mantenimiento y la integracion en pipelines existentes.
- El soporte de vision utiliza un proyector disenado para el modelo genesis, no para estos pesos; la calidad de imagen no esta probada.
- El modelo ha sido optimizado para proximidad al profesor, no para calidad absoluta en tareas; su rendimiento en benchmarks convencionales es desconocido.
- Procede de una submission de minero en una subred de Bittensor; la procedencia y el proceso de seleccion deben tenerse en cuenta en contextos de auditoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-IX-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Repositorio de llama.cpp fork: https://github.com/PrismML-Eng/llama.cpp
- Commit requerido: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Pack MLX 2-bit: https://huggingface.co/dendriteholdings/Ingot-IX-27B-MLX-2bit
- Modelo de referencia de la familia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
