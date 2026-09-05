# huluhuluu/qwen3-1.7b-mllm-qnn-htp

## Resumen

El modelo `huluhuluu/qwen3-1.7b-mllm-qnn-htp` es una exportación precompilada del modelo Qwen3-1.7B de Qwen, optimizada para ejecutarse en el NPU Hexagon de Qualcomm a través del runtime MLLM. El autor, huluhuluu, publica dos binarios QNN (context binaries) dirigidos a dos SoCs distintos: Snapdragon 8 Gen 3 (HTP v75) y Snapdragon 8 Elite (HTP v79). El objetivo es facilitar la inferencia on-device con baja latencia y sin depender de la nube, un requisito cada vez más habitual en aplicaciones móviles y de privacidad.

El modelo base es un transformer denso de 1.700 millones de parámetros, cuantizado mediante PTQ con el esquema LPBQ w4a16o16_G32 (pesos de 4 bits, activaciones de 16 bits, grupo 32). La ventana de contexto está fijada en 2048 tokens, y los binarios incluyen dos grafos restaurados: uno para prefill (AR 32) y otro para decode. La relevancia de este repositorio reside en que no solo entrega los artefactos compilados, sino que también publica mediciones de latencia completas de 160 requests en dos teléfonos reales, con validación de integridad de los token traces.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B) con atención split-head (SHA) para la exportación QNN |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (compilado para esta longitud) |
| Tipos de cuantizacion | LPBQ w4a16o16_G32: pesos 4-bit, activaciones 16-bit, salida 16-bit, grupo 32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios QNN (.bin) para HTP v75 y v79 |

## Arquitectura y entrenamiento

El repositorio no contiene el modelo entrenado, sino una versión precompilada para el runtime MLLM. La exportación parte de `Qwen/Qwen3-1.7B` y aplica cuantización post-entrenamiento (PTQ) mediante la ruta de Qualcomm transformers de MLLM. El esquema de cuantización LPBQ w4a16o16_G32 reduce los pesos a 4 bits, mantiene activaciones y salida en 16 bits y usa un tamaño de grupo de 32. La atención se reorganiza como split-head attention (SHA), una optimización habitual para acelerar la decodificación en NPU.

Los binarios se compilaron con QNN SDK 2.40 y contienen dos grafos: `model.0.s32` para prefill (con una longitud de AR de 32) y `model.0.s1` para decode. No se indica que se haya realizado fine-tuning adicional, RLHF ni DPO; la transformación es puramente de cuantización y compilación. El contexto se fija en 2048 tokens, por lo que cualquier uso con ventanas mayores requeriría una nueva compilación.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3-1.7B, el modelo es un LLM de propósito general, aunque este repositorio no evalúa su precisión ni sus capacidades de razonamiento.
- Ejecución on-device en NPU de Qualcomm: los binarios están diseñados para ejecutarse en el Hexagon NPU mediante el runtime MLLM, con soporte para HTP v75 (Snapdragon 8 Gen 3) y v79 (Snapdragon 8 Elite).
- Inferencia con baja latencia: las mediciones publicadas muestran TTFT P50 de 164 ms y TPOT P50 de 27 ms en Snapdragon 8 Elite, lo que lo hace apto para aplicaciones interactivas en tiempo real.
- Integridad de token traces: el autor valida que cada request produce un token trace contiguo y con timestamps estrictamente crecientes, lo que permite auditar la ejecución.
- No se mencionan capacidades de tool calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Asistentes de voz en móviles: el modelo puede ejecutarse localmente en un smartphone con Snapdragon 8 Gen 3 o 8 Elite, respondiendo a comandos de voz sin conexión. El TTFT de 164 ms en SM8750 permite una experiencia conversacional casi inmediata.
- Aplicaciones de mensajería con autocompletado: integrado en un teclado o app de mensajería, el modelo puede sugerir respuestas o completar frases en el dispositivo, reduciendo la dependencia de servidores externos.
- Educación y tutoría matemática: el workload incluye gsm8k y math500, lo que sugiere que el modelo puede utilizarse en apps educativas para resolver problemas paso a paso, aunque la precisión no fue evaluada en este repositorio.
- Asistencia de código en entornos móviles: con humaneval en el workload, es adecuado para apps de desarrollo que ofrecen autocompletado o corrección de código directamente en el dispositivo, sin enviar el código a la nube.
- Investigación de rendimiento on-device: el modelo sirve como referencia para comparar la latencia de distintos frameworks de inferencia en NPU (MLLM frente a ExecuTorch), ya que el autor publica 160 mediciones por dispositivo con validación exhaustiva.
- Aplicaciones de privacidad: al ejecutarse íntegramente en el dispositivo, es útil para apps de salud, finanzas o documentos que manejan datos sensibles y no deben salir del teléfono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio se centra exclusivamente en latencia de inferencia. A continuación se presentan las mediciones reportadas para 160 requests, con decodificación greedy y contexto 2048:

| Dispositivo | SoC / HTP | Requests completados | TTFT P50 | TPOT P50 | Muestras TPOT |
|---|---|---|---|---|---|
| Redmi K70 Pro | SM8650 / v75 | 160/160 | 299.890 ms | 46.696 ms | 85.751 |
| Realme RMX5090 | SM8750 / v79 | 160/160 | 164.482 ms | 27.473 ms | 83.878 |

El autor indica que ambos binarios están compilados con el mismo contexto (2048), por lo que las comparaciones entre SoCs son directas: v79 es 1.82 veces más rápido en TTFT y 1.70 veces más rápido en TPOT que v75. No se evaluó la precisión de las salidas, solo la latencia y la integridad de los token traces.

## Requisitos de hardware

- VRAM estimada: no aplica, la inferencia se ejecuta en el NPU Hexagon, no en GPU. Los binarios ocupan aproximadamente 1.6 GB cada uno, por lo que se necesita al menos esa cantidad de memoria libre en el dispositivo.
- GPU recomendadas: no aplica. El modelo requiere un SoC Qualcomm con HTP v75 (Snapdragon 8 Gen 3) o HTP v79 (Snapdragon 8 Elite).
- Compatibilidad con GPU de consumo: no aplica, no es un modelo para GPU; es específico para NPU de Qualcomm.
- Opciones de despliegue: runtime MLLM (https://github.com/UbiquitousLearning/mllm). Se requieren las variables de entorno `LD_LIBRARY_PATH`, `ADSP_LIBRARY_PATH` y `MLLM_QNN_IO_MEM_ESTIMATION=1`. El proceso debe lanzarse con `setsid nohup` para evitar que el wrapper de adb lo termine.
- Latencia y throughput: TTFT P50 de 299.890 ms y TPOT P50 de 46.696 ms en v75; TTFT P50 de 164.482 ms y TPOT P50 de 27.473 ms en v79. El throughput es de aproximadamente 21 tokens/s en v75 y 36 tokens/s en v79, calculados a partir del TPOT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huluhuluu/qwen3-1.7b-mllm-qnn-htp | 1.700 M | 2048 | LPBQ w4a16o16_G32 | Apache 2.0 | Binarios QNN para MLLM |
| huluhuluu/qwen3-1.7b-executorch-qnn-htp | 1.700 M | No disponible | No disponible | Apache 2.0 | Binarios QNN para ExecuTorch |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible | No disponible | Apache 2.0 | Pesos originales (safetensors) |

El modelo companion de ExecuTorch es la alternativa más directa, ya que utiliza el mismo modelo base y el mismo enfoque de cuantización QNN, pero con un runtime distinto. El modelo original de Qwen es la referencia sin cuantizar, aunque no está optimizado para NPU y requiere un backend diferente.

## Limitaciones y advertencias

- No se ha evaluado la precisión del modelo en este repositorio; solo se miden latencia e integridad de token traces. El modelo puede producir alucinaciones o errores de razonamiento.
- La ventana de contexto está limitada a 2048 tokens, lo que impide aplicaciones que requieran documentos largos o conversaciones extensas.
- Los binarios son específicos para HTP v75 y v79. No funcionan en otros SoCs de Qualcomm ni en otras plataformas (GPU, CPU, etc.).
- La configuración de despliegue es sensible: omitir el directorio de skel en `ADSP_LIBRARY_PATH` provoca el error `Failed to create device: 14001`, que es un fallo de librerías, no de permisos.
- El proceso de inferencia debe lanzarse bajo `setsid nohup`; si no, el wrapper de adb puede matar la ejecución a mitad de camino.
- No hay soporte para batch size > 1, batching continuo ni decodificación especulativa. El modelo está diseñado para cargas de trabajo de un solo request en serie.
- El contexto y la longitud de prefill (AR 32) están fijos en los binarios; cualquier cambio requiere recompilar con QNN SDK 2.40.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/qwen3-1.7b-mllm-qnn-htp
- Repositorio companion (ExecuTorch): https://huggingface.co/huluhuluu/qwen3-1.7b-executorch-qnn-htp
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Runtime MLLM (GitHub): https://github.com/UbiquitousLearning/mllm
