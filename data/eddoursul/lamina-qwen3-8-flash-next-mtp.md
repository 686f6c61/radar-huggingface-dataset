# eddoursul/Lamina-Qwen3.8-Flash-Next-MTP

## Resumen

Lamina-Qwen3.8-Flash-Next-MTP es un artefacto auxiliar derivado de Qwen3.8-Flash-Next, publicado por el desarrollador eddoursul para su runtime de inferencia Lamina. No es un modelo autónomo: contiene únicamente la capa de multi-token prediction (MTP) del modelo base, empaquetada en formato GGUF con arquitectura `qwen4exp-mtp`, y se utiliza como cabecera de borrador (draft head) para decodificación especulativa. El archivo principal ocupa 824.052.896 bytes (unos 824 MB) y el repositorio completo 2,3 GB, incluyendo el proyector de imagen en Q8_0.

El propósito es acelerar la generación de Qwen3.8-Flash-Next en Lamina: la capa MTP propone varios tokens por paso y el modelo objetivo los verifica, de modo que la salida final sigue siendo la del modelo grande. Según la model card, en texto held-out los borradores aportan 2,489 tokens por pasada de verificación con la cuantización IQ3_S y 2,433 con UD-Q4_K_XL, frente a 2,402 y 2,344 usando la parte densa de basalt; en una máquina con RTX 3090 y RTX 5070 Ti la escritura de texto de razonamiento mejora un 1,3 % y un 4,5 % respectivamente.

El interés actual es práctico: permite reutilizar la capa MTP nativa de un modelo grande con cualquier cuantización que Lamina sepa leer, sin necesidad de reentrenar el modelo completo. Los pesos de la capa parten de los auto-destilados de basalt y se afinan sobre salidas del propio Lamina. La licencia aplicable es la Qwen Community License 1.0, heredada de los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa MTP de un transformer MoE (arquitectura GGUF `qwen4exp-mtp`, `lamina.mtp.version` 1) |
| Parametros totales | 2.607.191.373 (dato del repositorio en safetensors; el GGUF de la capa MTP pesa 824.052.896 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | Capa MTP: Q2_0 (expertos enrutados), Q8_0 (proyecciones grandes), BF16 (hyper-connections y router), F32 (norms). Proyector de imagen: Q8_0 y F16 |
| Idiomas soportados | no disponible; el vocabulario de borrador cubre 40.525 token ids de inglés y código |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | GGUF (archivo único `Lamina-Qwen3.8-Flash-Next-MTP.gguf`; también diseño antiguo en carpeta con `experts.bin`, `dense.bin`, `dense.txt`, `draft_vocab.bin`) |

## Arquitectura y entrenamiento

El archivo es una capa MTP aislada, no un modelo completo. Contiene 512 expertos enrutados (`mlp.experts.gate_up_proj` y `mlp.experts.down_proj`) convertidos desde el checkpoint BF16 de Qwen a Q2_0 con bloques de 64 valores, donde la escala de cada bloque se elige para minimizar el error cuadrático sobre los niveles {-1, 0, 1, 2}. Los otros 29 tensores de la capa (atención, proyecciones, hyper-connections, router, experto compartido y norms) se guardan con precisión mixta: proyecciones grandes en Q8_0, hyper-connections y router en BF16, norms en F32. La cabecera de borrador propone tokens sobre un vocabulario restringido de 40.525 ids de inglés y código, y la herramienta `tools/mtp_rt.py` permite reescribir la capa sobre otro vocabulario.

El entrenamiento parte de los pesos auto-destilados de basalt (jesdga/Qwen3.8-Flash-Next-Basalt) y se continúa sobre salidas del propio Lamina con las cuantizaciones IQ3_S de ISTA-DASLab (GSQ-RCO) y UD-Q4_K_XL de unsloth: 987 peticiones y 2,4 millones de posiciones, optimizando la probabilidad de que cada borrador sea aceptado por la elección greedy o muestreada del modelo objetivo. El repositorio incluye además el proyector de imagen `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf` (616.703.328 bytes), convertido desde el BF16 de ISTA-DASLab con `tools/mmproj_q8.py` y el gguf-py de llama.cpp 3cf0325; cada matriz BF16 con filas de bloques completos de 32 valores pasa a Q8_0, el resto de tensores BF16 a F16 y los F32 se mantienen. En CPU codifica una imagen aproximadamente un 20 % más rápido que el archivo BF16.

## Capacidades

- Decodificación especulativa: propone varios tokens por paso que el modelo objetivo verifica, manteniendo la distribución de salida del modelo grande.
- Compatibilidad con cualquier cuantización de Qwen3.8-Flash-Next que Lamina sepa leer (verificado con IQ3_S y UD-Q4_K_XL).
- Borrador restringido a vocabulario de inglés y código (40.525 ids), no a texto multilingüe general.
- Reescritura del vocabulario de borrador mediante `tools/mtp_rt.py --gguf ... --draft-vocab ... --out ...`.
- Soporte de visión a través del proyector de imagen incluido, ejecutado por el codificador `lamina-vision` con el mtmd de llama.cpp.
- Integración directa en `lamina-server`: el archivo se detecta junto al modelo o junto al servidor, o se declara con `--mtp <ruta>`.
- Descarga y verificación automatizadas mediante `download-draft-layer.bat` / `download-draft-layer.sh`.

## Casos de uso

- Aceleración de inferencia local de Qwen3.8-Flash-Next: colocar el GGUF junto al modelo en Lamina para que `lamina-server` lo cargue como capa de borrador y reduzca el tiempo por token en texto de razonamiento (mejora medida del 1,3 % al 4,5 % en el hardware de referencia).
- Despliegue de asistentes de código en estaciones de trabajo con una sola GPU: el vocabulario de borrador está limitado a inglés y código, lo que encaja con autocompletado, generación de funciones y revisión de parches donde la latencia importa.
- Servicio de chat con razonamiento extendido: al acelerar la escritura de texto de pensamiento, se reducen los tiempos de espera percibidos en flujos de chain-of-thought antes de la respuesta final.
- Pipelines de evaluación comparativa de cuantizaciones: permite medir la tasa de aceptación de borradores (2,489 con IQ3_S frente a 2,433 con UD-Q4_K_XL) para elegir el equilibrio entre calidad y velocidad en cada despliegue.
- Inferencia multimodal en local: junto con `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf`, habilita el procesamiento de imágenes en Lamina con una codificación aproximadamente un 20 % más rápida en CPU que el proyector BF16.
- Adaptación a dominios con vocabulario propio: usar `tools/mtp_rt.py` para regenerar la capa sobre otro conjunto de ids y mantener la decodificación especulativa en modelos ajustados o con tokenizadores modificados.
- Retrocompatibilidad con instalaciones antiguas: el diseño en carpeta (`experts.bin`, `dense.bin`, `dense.txt`, `draft_vocab.bin`) permite usar la capa en compilaciones de Lamina anteriores al 15 de noviembre de 2026.

## Benchmarks y rendimiento

| Metrica | IQ3_S | UD-Q4_K_XL |
|---|---|---|
| Tokens aceptados por pasada de verificación (capa MTP) | 2,489 | 2,433 |
| Tokens aceptados por pasada de verificación (parte densa de basalt) | 2,402 | 2,344 |
| Mejora de velocidad al escribir texto de razonamiento (RTX 3090 + RTX 5070 Ti) | 1,3 % | 4,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el artefacto no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM adicional para la capa MTP: unos 824 MB en disco para el GGUF; en memoria, la capa se carga junto al modelo objetivo, por lo que el incremento es del orden de centenares de MB según el backend.
- Proyector de imagen: 616.703.328 bytes en disco en Q8_0; se ejecuta en CPU o GPU según la configuración de `lamina-vision`.
- GPU de referencia en las pruebas del autor: RTX 3090 y RTX 5070 Ti, ambas en una misma máquina.
- Cabe en GPU de consumo: sí, siempre que el modelo base Qwen3.8-Flash-Next ya quepa; la capa añade una sobrecarga pequeña.
- Opciones de despliegue: `lamina-server` (runtime nativo del artefacto). No hay soporte documentado para vLLM, llama.cpp directo, Ollama o TGI, ya que el archivo no ejecuta un modelo por sí solo.
- Latencia y throughput: la model card solo reporta mejoras relativas del 1,3 % y el 4,5 % en la escritura de texto de razonamiento; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Artefacto | Funcion | Tamano | Formato | Licencia |
|---|---|---|---|---|
| Lamina-Qwen3.8-Flash-Next-MTP (este) | Capa MTP para decodificación especulativa en Lamina | 824 MB (GGUF) | GGUF `qwen4exp-mtp` | Qwen Community License 1.0 |
| basalt (jesdga/Qwen3.8-Flash-Next-Basalt) | Parte densa de la capa MTP, punto de partida del ajuste | no disponible | no disponible | no disponible |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | Cuantizaciones GGUF del modelo base y proyector BF16 de origen | no disponible | GGUF | Qwen Community License 1.0 |

No se dispone de datos comparativos de rendimiento frente a otras implementaciones de decodificación especulativa (EAGLE, Medusa, capas MTP nativas de otros runtimes) en la información proporcionada.

## Limitaciones y advertencias

- El archivo no es un modelo ejecutable: solo funciona como capa auxiliar dentro de Lamina; no puede cargarse en vLLM, Ollama, TGI ni en llama.cpp estándar.
- El vocabulario de borrador cubre únicamente 40.525 ids de inglés y código, por lo que la aceleración puede degradarse en otros idiomas o en texto con tokenización atípica.
- Los expertos enrutados están cuantizados a Q2_0, una precisión muy baja; la verificación del modelo objetivo corrige la salida, pero la tasa de aceptación puede caer fuera de los dominios de ajuste.
- El ajuste se hizo con 987 peticiones y 2,4 millones de posiciones sobre salidas de Lamina; es un conjunto pequeño y puede no generalizar a otros estilos de prompt o temperaturas de muestreo.
- Las mejoras de velocidad reportadas (1,3 % y 4,5 %) son modestas y específicas de una configuración concreta (RTX 3090 + RTX 5070 Ti); no se garantizan en otro hardware.
- Licencia Qwen Community License 1.0: impone condiciones adicionales para uso comercial que deben revisarse en el archivo `LICENSE` antes de desplegar en producción.
- El repositorio tiene 238 descargas y 3 likes, con fecha de creación en octubre de 2026; es un artefacto de nicho con validación comunitaria limitada.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.8-Flash-Next, no evaluados de forma independiente para este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eddoursul/Lamina-Qwen3.8-Flash-Next-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Lamina: https://github.com/eddoursul/Lamina
- Pesos de partida (basalt): https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Cuantizaciones GSQ-RCO y proyector BF16: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
