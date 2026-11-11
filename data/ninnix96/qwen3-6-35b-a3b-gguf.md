# Ninnix96/Qwen3.6-35B-A3B-gguf

## Resumen

Qwen3.6-35B-A3B-gguf es una cuantización GGUF del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario Ninnix96 y orientada a ejecución local en hardware de gama media. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales y, según la nomenclatura del nombre, aproximadamente 3.000 millones de parámetros activos por token. El paquete combina una receta de cuantización asimétrica por tipo de tensor con una cabeza MTP (Multi-Token Prediction) integrada de 332,78 MB para decodificación especulativa.

La relevancia de esta ficha no está en el modelo base, sino en el trabajo de empaquetado: el archivo principal ocupa 12,07 GB (11,24 GiB) e incluye 753 tensores, de los cuales 733 corresponden al tronco original y el resto a la cabeza MTP. El autor reporta que el archivo completo cabe residente en una GPU AMD BC-250 con 16 GB de memoria, lo que permite ejecutar un MoE de ~35B parámetros en hardware de bajo coste mediante el runtime QuarkStar (Vulkan/RADV).

El modelo está pensado para generación de texto conversacional y generación de código, con licencia Apache 2.0 heredada del modelo base. La model card documenta métricas de decodificación medidas en la BC-250 con y sin MTP, así como un proceso de validación de hashes tensor a tensor frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE); nombre indica 35B totales / A3B activos |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible con cifra exacta; la nomenclatura A3B sugiere ~3 B activos por token |
| Longitud de contexto | no disponible en la informacion proporcionada; el runtime se invoca con `--ctx 32768` en el ejemplo de servidor |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K, Q8_0, F32 (mezcla por clase de tensor); existe tambien un GGUF IQ4XS/Q4K/Q8 |
| Idiomas soportados | en (declarado en la model card y en los metadatos de Hugging Face) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE: los expertos enrutados (gate/up y down) se distribuyen en 40 bloques (bloques 0-39), y existe un bloque adicional 40 correspondiente a la cabeza MTP. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde al modelo original Qwen/Qwen3.6-35B-A3B y no se reproduce aquí.

La innovación técnica de esta publicación es la receta de cuantización asimétrica, inspirada en el trabajo de Salvatore Sanfilippo (antirez): los expertos enrutados gate/up se cuantizan a IQ2_XXS, los down a Q2_K, las proyecciones de atención y expertos compartidos a Q8_0, y routers y normas se mantienen en F32. La cabeza MTP se cuantiza directamente desde el export BF16 de Unsloth, con su down projection en Q4_K y las matrices no enrutadas en Q8_0; al no existir entradas del bloque 40 en la imatrix publicada, la cuantización IQ2_XXS de la MTP usa importancia por energía de pesos en lugar de calibración por activaciones. Los embeddings y la cabeza de salida se comparten entre tronco y MTP, lo que mantiene el añadido por debajo de 350 MB.

El runtime QuarkStar implementa decodificación especulativa con la cabeza MTP: verifica filas objetivo en conjunto, conserva la aritmética de enrutamiento del decode, limita los borradores recursivos por confianza y reutiliza el sufijo de prompt confirmado por MTP. La cabeza de borrador aplica una máscara de vocabulario reciente, mientras que la verificación puntúa el vocabulario completo.

## Capacidades

- Generación de texto conversacional multi-turno, con modo "nothink" disponible en el runtime (`--nothink`).
- Generación de código: el ejemplo de la model card solicita una función en C que invierta una lista enlazada.
- Razonamiento de múltiples pasos mediante decodificación especulativa con cabeza MTP integrada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidad especial: decodificación especulativa MTP con verificación de logits y rollback ante rechazo.
- Compatibilidad con llama.cpp mainline para los GGUF Q2 y Q4.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso

- Inferencia local en GPU de bajo coste: el archivo de 12,07 GB cabe residente en una AMD BC-250 de 16 GB, lo que permite ejecutar un MoE de ~35B parámetros en un equipo de gama de entrada sin descarga a disco durante el decode.
- Asistente de código en estación de trabajo: con `--temp 0` y modo `--nothink`, el modelo genera funciones completas (el ejemplo de la model card es una función C para invertir una lista enlazada) con latencia de decodificación de ~90-130 t/s en la BC-250.
- Servicio local de generación de texto: el binario `q36-server` acepta `--ctx 32768`, lo que permite exponer un endpoint compatible con clientes HTTP para prototipos y herramientas internas.
- Decodificación especulativa en producción de bajo presupuesto: la cabeza MTP integrada ofrece aceleraciones de 1,06× a 1,49× según longitud de contexto, útil cuando el throughput importa y no se dispone de GPUs de datacenter.
- Inferencia distribuida: el autor sugiere el GGUF Q4 para inferencia distribuida en QuarkStar, incluyendo streaming desde SSD, lo que habilita despliegues en clústeres modestos o equipos con poca VRAM.
- Validación y auditoría de cuantizaciones: el paquete incluye hashes SHA-256 y validación de los 733 tensores del tronco frente al original, útil como referencia para pipelines de verificación de cuantizaciones.
- Investigación en decodificación especulativa: la implementación MTP con verificación de logits completa y rollback ante rechazo sirve como banco de pruebas para estudiar aceptación de borradores y distribución de muestreo.

## Benchmarks y rendimiento

Rendimiento de decodificación medido por el autor en AMD BC-250, RADV GFX1013, ruta Vulkan residente de QuarkStar, generación greedy, K en Q8_0 / V en Q4_0, 128 tokens generados, `--mtp-draft 8 --mtp-margin 0`:

| Tokens de contexto | Decode ordinario | Decode con MTP | Aceleración |
| ---: | ---: | ---: | ---: |
| 128 | 91,51 t/s | 97,01 t/s | 1,06× |
| 2.048 | 88,08 t/s | 131,39 t/s | 1,49× |
| 4.096 | 84,71 t/s | 105,27 t/s | 1,24× |
| 8.192 | 79,99 t/s | 97,08 t/s | 1,21× |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son medidas de throughput de decodificación, no de calidad.

## Requisitos de hardware

- VRAM estimada: el archivo Q2 completo ocupa 12,07 GB (11,24 GiB); con overhead de contexto y caché KV, se recomienda un mínimo de 14-16 GB para ejecución totalmente residente.
- GPU recomendadas: AMD BC-250 (16 GB) es el hardware de referencia validado por el autor; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más (BC-250 validada); no hay datos para RTX 4090, 4080 u otras.
- Opciones de despliegue: QuarkStar (`q36` y `q36-server`, ruta Vulkan/RADV) y llama.cpp mainline para los GGUF Q2 y Q4.
- Latencia y throughput: 79,99-91,51 t/s en decode ordinario y 97,01-131,39 t/s con MTP en la BC-250, según contexto; el prefill, la carga y la restauración de snapshots quedan fuera de la medición de decode. Temperatura de borde de GPU máxima de 56 °C.
- Almacenamiento: el repositorio completo ocupa 59,5 GB; el Q4 es apto para streaming desde SSD según el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ninnix96/Qwen3.6-35B-A3B-gguf (Q2) | 34,66 B | ~3 B (A3B) | no disponible | Apache 2.0 | GGUF | 12,07 GB, MTP integrada, validado en BC-250 |
| Ninnix96/Qwen3.6-35B-A3B-gguf (Q4) | 34,66 B | ~3 B (A3B) | no disponible | Apache 2.0 | GGUF | IQ4XS/Q4K/Q8, recomendado para distribuido y streaming SSD |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 B | ~3 B (A3B) | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.6-35B-A3B-MTP-GGUF (Unsloth) | 34,66 B | ~3 B (A3B) | no disponible | Apache 2.0 | GGUF | Export BF16 de referencia usado para cuantizar la cabeza MTP |

No se dispone de datos de benchmarks de calidad que permitan comparar rendimiento entre estas variantes; la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo declara inglés (`language: en`); no hay soporte multilingüe documentado, incluido el castellano.
- La cuantización IQ2_XXS en los expertos gate/up introduce pérdida de precisión respecto al BF16 original; el autor no publica evaluaciones de calidad (perplejidad, benchmarks) que cuantifiquen el impacto.
- La cabeza MTP se cuantizó sin calibración por activaciones (no hay entradas del bloque 40 en la imatrix), usando importancia por energía de pesos; esto puede afectar a la tasa de aceptación de borradores.
- A temperatura positiva, el modo oportunista por defecto de QuarkStar muestrea los inicios de bloque y acepta colas greedy, lo que altera la distribución de muestreo. Para muestreo por token convencional hay que usar `--no-mtp-opportunistic`.
- Los archivos anteriores del repositorio están deprecados y sus checksums describen releases distintas; instalaciones existentes deben migrar al archivo `Qwen3.6-35B-A3B-IQ2XXS-Q2K-Q8.gguf`.
- Las métricas de rendimiento provienen de un único hardware (BC-250) y de barridos serializados; no son extrapolables a otras GPUs ni a cargas concurrentes.
- No hay información sobre sesgos, alineación o riesgo de alucinación específica de esta cuantización; aplican los del modelo base Qwen3.6-35B-A3B.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del GGUF ni sobre la paridad funcional con el modelo original más allá de la validación de hashes de tensores.
- El runtime QuarkStar es un proyecto de terceros (`github.com/Ninnix/q36`); su madurez y soporte no están documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ninnix96/Qwen3.6-35B-A3B-gguf
- Archivo principal Q2: https://huggingface.co/Ninnix96/Qwen3.6-35B-A3B-gguf/resolve/main/Qwen3.6-35B-A3B-IQ2XXS-Q2K-Q8.gguf
- Archivo Q4: https://huggingface.co/Ninnix96/Qwen3.6-35B-A3B-gguf/resolve/main/Qwen3.6-35B-A3B-IQ4XS-Q4K-Q8.gguf
- Runtime QuarkStar: https://github.com/Ninnix/q36
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Export BF16 de Unsloth usado para la MTP: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF/tree/5bc3e238d916f48a861bac2f8a1990a0e9b7e98d/BF16
