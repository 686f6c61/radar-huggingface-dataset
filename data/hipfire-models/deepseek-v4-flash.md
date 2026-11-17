# hipfire-models/deepseek-v4-flash

## Resumen

`hipfire-models/deepseek-v4-flash` es un empaquetado de precisión mixta del modelo `deepseek-ai/DeepSeek-V4-Flash` (284 335 millones de parámetros totales, 13 000 millones activos por token segun el autor del modelo base) orientado al motor de inferencia nativo en Rust [hipfire](https://github.com/Kaden-Schutt/hipfire) sobre GPU AMD RDNA. No es un modelo nuevo: es una re-cuantización del checkpoint oficial FP8/FP4 que reescribe la clase de pesos dominante —los 256 expertos enrutados por capa— a 2 bits mediante MagnumQuant-Lloyd (MQ2-Lloyd), manteniendo el resto en Q8F16 o F16.

El interés práctico está en el tamaño resultante: 86,2 GB en disco con una media de 2,425 bits por peso, lo que permite ejecutar un MoE de 284 B en hardware AMD de consumo o gama profesional alta, algo inviable con el checkpoint original en FP8. El paquete incluye además un cabezal MTP de una capa (2,0 GB) y un borrador especulativo DSpark de tres etapas (6,0 GB) que propone bloques de 5 tokens por paso.

La relevancia es doble: por un lado demuestra una ruta de cuantización agresiva pero selectiva (solo los expertos enrutados bajan a 2 bits) sobre un MoE de última generación; por otro, el formato HFQ propietario rompe la compatibilidad con GGUF, safetensors y AWQ, de modo que el modelo solo carga en hipfire. La licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa; 43 capas, 256 expertos enrutados + 1 compartido por capa, router hash en las 3 primeras capas, SWA con ventana 128, cabezal MTP |
| Parámetros totales | 284,335 B (284 335 millones) |
| Parámetros activos | 13 B por token (según el autor del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MQ2G256Lloyd (2,25 bpw) para expertos enrutados; Q8F16 (8,5 bpw) para experto compartido, atención principal, embed, lm_head y gates del router; F16 (16 bpw) para normas, compresor, indexador y gating HC; TidI32 (32 bpw) para la tabla hash-router. Media ponderada: 2,425 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | HFQ (contenedor propio de hipfire); no compatible con GGUF, safetensors ni AWQ |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 43 capas, cada una con 256 expertos enrutados más un experto compartido, y un router basado en tabla hash (`tid2eid`) en las tres primeras capas (`num_hash_layers = 3`). Incorpora atención con ventana deslizante de 128 tokens (estado K/V en F32, asignado en tiempo de ejecución y no persistido), matrices de compresor e indexador, `attn_sink` y gating `hc_*`. El checkpoint upstream se distribuye en FP8 `e4m3` con pesos de expertos enrutados en FP4.

Esta re-cuantización no entrena nada: reempaqueta los pesos. Los 256 expertos enrutados por capa (33 024 tensores de los 34 223 totales) pasan a MQ2-Lloyd con grupos de 256 pesos, cada grupo almacenado como 64 bytes de índices de 2 bits más 8 bytes de codebook Lloyd en fp16 (72 B por grupo, 2,25 bpw). El resto de la red conserva Q8F16 (bloques GGML Q8_0: escala F16 de 2 B más 32 B de datos Q8 por cada 32 pesos) o F16. El desglose verificado por el autor: 277,025 B en expertos enrutados (77,913 GB), 6,785 B en Q8F16 (7,209 GB), 0,522 B en F16 (1,043 GB) y 2,3 M en la tabla hash (9,3 MB).

La innovación destacable es el ecosistema de decodificación especulativa empaquetado como sidecars. El MTP de una capa (`num_nextn_predict_layers = 1`) se abre automáticamente si está presente. El DSpark de tres etapas (`mtp.0 → mtp.1 → mtp.2`, `dspark_block_size = 5`, `dspark_target_layer_ids = [40, 41, 42]`, `dspark_markov_rank = 256`, `dspark_noise_token_id = 128799`) propone bloques de 5 tokens por paso y usa un `confidence_head` (Linear 4352→1 en fp32) para truncar la aceptación; tiene prioridad sobre MTP cuando ambos están presentes y se activa con `--spec dspark` o `--spec auto`, con umbral ajustable `--dspark-conf-threshold` (por defecto 0,3).

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento multi-paso y matemáticas, heredado del modelo base DeepSeek-V4-Flash (no se detallan evaluaciones en la información disponible).
- Generación de código: el ejemplo de uso del autor es una función de Fibonacci en C.
- Decodificación especulativa con dos niveles: cabezal MTP de una capa y borrador DSpark de tres etapas con bloques de 5 tokens y aceptación truncada por confianza.
- Router hash en las tres primeras capas, que evita el cálculo de gates en esas capas.
- Atención con ventana deslizante de 128 tokens, que limita el coste del estado K/V en sesiones largas.
- Servidor HTTP compatible con la API de OpenAI (`hipfire serve`, puerto 11435 por defecto).
- Tool calling, function calling, capacidades de agente y soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de 284 B en GPU AMD: con 86,2 GB de pesos, el modelo cabe en una única GPU con 96 GB o más (o en varias con reparto), lo que permite ejecutar un modelo de escala frontera en estaciones de trabajo RDNA sin depender de clústeres con FP8.
- Desarrollo y depuración de motores de inferencia: el paquete sirve como banco de pruebas para el formato HFQ, el enum `QuantType` de hipfire y las rutas de carga de sidecars, útil para quien contribuya al motor o valide cuantizaciones MQ2-Lloyd.
- Generación de código asistida en local: el ejemplo canónico `hipfire run deepseek-v4-flash "Write a fibonacci function in C"` ilustra el flujo de uso para tareas de programación sin salida a la nube, adecuado cuando hay requisitos de confidencialidad del código.
- Servicio interno compatible con OpenAI: `hipfire serve` expone el modelo en el puerto 11435 con API compatible, de modo que herramientas existentes (clientes, SDK, orquestadores) pueden apuntar a él sin cambios de código.
- Aceleración de latencia en producción con DSpark: activar `--spec dspark` con un umbral de confianza ajustado permite reducir el número de pasos de decodificación, útil en cargas interactivas donde la latencia por token es crítica.
- Evaluación comparativa de cuantizaciones: comparar la calidad de MQ2-Lloyd a 2,25 bpw frente al FP8/FP4 original en tareas de razonamiento y código, para decidir si la pérdida de precisión es aceptable en un dominio concreto.
- Investigación sobre decodificación especulativa: los sidecars MTP y DSpark, con sus cabezales Markov (`markov_head` Embed 129280→256 / Linear 256→129280) y de confianza, permiten estudiar políticas de aceptación y presupuestos de borrador en un modelo real de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de empaquetado (tamaño de archivo, número de tensores, bits por peso y desglose por clase de tensor), no evaluaciones de calidad ni de velocidad.

| Métrica de empaquetado | Valor |
|---|---|
| Tensores totales (archivo principal) | 34 223 |
| Tensores MQ2G256Lloyd (qt=19) | 33 024 |
| Tensores Q8F16 (qt=3) | 389 |
| Tensores F16 (qt=1) | 807 |
| Tensores TidI32 (qt=22) | 3 |
| Bits por peso medios | 2,425 |
| Tamaño en disco (principal) | 86 184 307 283 B |
| Tensores DSpark | 2 376 (arch_id = 9) |

## Requisitos de hardware

- VRAM estimada: 86,2 GB solo para los pesos del archivo principal, más 2,0 GB del sidecar MTP y 6,0 GB del sidecar DSpark si se adjuntan. A ello se suma el estado K/V de la ventana deslizante en F32 (ventana de 128), asignado en tiempo de ejecución y no persistido, más las activaciones.
- GPU recomendadas: el paquete está dirigido explícitamente a GPU AMD RDNA con ROCm. No se especifican modelos concretos en la información disponible.
- GPU de consumo: no disponible. Con 86,2 GB de pesos, ningún acelerador de consumo actual (24 GB o menos) puede alojar el modelo completo en una sola unidad; se requeriría reparto entre varias GPU o swapping, y no se documenta ninguna de estas rutas.
- Opciones de despliegue: exclusivamente hipfire (CLI `hipfire run`, servidor `hipfire serve` en el puerto 11435). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato HFQ no es compatible con GGUF, safetensors ni AWQ.
- Instalación: script oficial `curl -L https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh | bash`, seguido de `hipfire pull deepseek-v4-flash` (o `hipfire run`, que auto-descarga).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| hipfire-models/deepseek-v4-flash (esta ficha) | 284,3 B totales / 13 B activos | no disponible | HFQ (2,425 bpw medios) | MIT | Solo hipfire (AMD RDNA) |
| deepseek-ai/DeepSeek-V4-Flash (upstream) | 284 B totales / 13 B activos | no disponible | FP8 e4m3 + FP4 en expertos | no disponible | Ecosistema estándar (no detallado) |
| Alternativas de 2 bits tipo GGUF para MoE de gran escala | no disponible | no disponible | GGUF | no disponible | llama.cpp, Ollama |

La comparación relevante es contra el checkpoint upstream: mismo número de parámetros y misma arquitectura, pero el paquete de hipfire reduce el peso en disco a 86,2 GB y restringe la portabilidad al motor propietario. No se dispone de datos de benchmarks que permitan comparar calidad frente al original ni frente a otras cuantizaciones.

## Limitaciones y advertencias

- Pérdida de precisión no cuantificada: los 256 expertos enrutados se almacenan a 2,25 bpw, una compresión muy agresiva, y no se publican evaluaciones que midan la degradación frente al FP8/FP4 original.
- Formato cerrado: el contenedor HFQ solo carga en hipfire. No hay exportación a GGUF, safetensors ni AWQ, lo que impide usar vLLM, TGI, llama.cpp u Ollama.
- Dependencia de hardware AMD RDNA y ROCm; no se documenta soporte para NVIDIA ni para CPU.
- Sesgos conocidos: no disponible. Al ser una re-cuantización, hereda los del modelo base, que no se detallan en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Longitud de contexto: no disponible, pese a que la arquitectura incluye atención con ventana deslizante de 128 tokens.
- Licencia MIT declarada, sin restricciones conocidas para uso comercial; conviene verificar que la licencia del modelo base sea compatible, ya que no se detalla en la información disponible.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema muy incipiente, con riesgo de cambios de formato o de API del motor.
- El modelo tiene fecha de creación 2026-05-22 y actualización 2026-11-17; verificar la versión de hipfire compatible antes de desplegar en producción.
- El estado K/V en F32 se asigna en tiempo de ejecución y no está incluido en el tamaño de archivo; los requisitos reales de memoria son superiores a los 86,2 GB de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/deepseek-v4-flash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Script de instalación: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
- Registro CLI de hipfire: https://github.com/Kaden-Schutt/hipfire/blob/master/cli/registry.json
