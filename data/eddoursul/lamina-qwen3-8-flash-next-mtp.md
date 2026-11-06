# eddoursul/Lamina-Qwen3.8-Flash-Next-MTP

## Resumen

Lamina-Qwen3.8-Flash-Next-MTP es un componente auxiliar de decodificación especulativa: se trata de la capa de predicción multi-token (MTP) del modelo Qwen3.8-Flash-Next, extraída y reformateada por el desarrollador independiente eddoursul para el runtime Lamina. No es un modelo autónomo, sino un "draft layer" que propone varios tokens por paso de verificación; el modelo principal valida cada propuesta, de modo que la salida final es siempre la del modelo objetivo. Su función es acelerar la inferencia sin alterar la distribución de salida.

El repositorio ocupa 0,8 GB y contiene cuatro ficheros binarios: los 512 expertos enrutados de la capa MTP cuantizados en Q2_0, el resto de pesos de la capa (atención, proyecciones, router, expert compartido, normas) en Q8_0/BF16/F32, un vocabulario de borrador de 40.525 tokens y un índice de descriptores. Es relevante para quienes despliegan Qwen3.8-Flash-Next con Lamina y buscan reducir la latencia de generación, especialmente en texto de razonamiento.

La licencia aplicable es la Qwen Community License 1.0, heredada del modelo base, lo que condiciona el uso comercial. El autor reporta ganancias de velocidad modestas pero medibles (1,3 % y 4,5 % según configuración) y una aceptación media de 2,433-2,489 tokens por pasada de verificación sobre texto reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa MTP (predicción multi-token) con 512 expertos enrutados, sobre arquitectura del base Qwen3.8-Flash-Next (no detallada) |
| Parametros totales | no disponible (repo de 0,8 GB; experts.bin 707.788.800 bytes, dense.bin 116.099.072 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 (expertos, bloques de 64 valores), Q8_0 (proyecciones grandes), BF16 (hyper-connections y router), F32 (normas) |
| Idiomas soportados | inglés y código (vocabulario de borrador de 40.525 tokens); resto no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | binario propio de Lamina (experts.bin, dense.bin, dense.txt, draft_vocab.bin) |

## Arquitectura y entrenamiento

La capa MTP de Qwen3.8-Flash-Next se ha convertido al formato de runtime de Lamina. Los 512 expertos enrutados provienen del checkpoint BF16 original de Qwen y se cuantizan en Q2_0 con bloques de 64 valores, eligiendo la escala de cada bloque para minimizar el error cuadrático sobre los niveles {-1, 0, 1, 2}. El resto de la capa (atención, proyecciones, hyper-connections, router, expert compartido y normas) se indexa mediante dense.txt: proyecciones grandes en Q8_0, pesos de hyper-connection y router en BF16, normas en F32.

El entrenamiento parte de los pesos auto-destilados de basalt (jesdga/Qwen3.8-Flash-Next-Basalt) y continúa sobre la propia salida de Lamina con dos formatos de cuantización del modelo objetivo: GSQ-RCO IQ3_S de ISTA-DASLab y UD-Q4_K_XL de unsloth. El conjunto de ajuste comprende 987 peticiones y 2,4 millones de posiciones, y el objetivo de entrenamiento es la probabilidad de que cada borrador sea aceptado por la elección greedy o muestreada del modelo. La cabeza de borrador propone únicamente desde 40.525 ids de vocabulario (inglés y código).

## Capacidades

- Decodificación especulativa: propone varios tokens por paso de verificación para el modelo Qwen3.8-Flash-Next en Lamina (`--mtp <carpeta>`).
- Aceleración de generación de texto de razonamiento ("thinking text"): 1,3 % más rápido en una RTX 3090 y 4,5 % en una RTX 5070 Ti según el autor.
- Aceptación media de 2,489 tokens por pasada de verificación con el modelo cuantizado IQ3_S y 2,433 con UD-Q4_K_XL sobre texto reservado.
- Cobertura de borrador limitada a inglés y código (40.525 tokens); no propone tokens fuera de ese vocabulario.
- No realiza generación autónoma: toda propuesta se valida contra el modelo objetivo, por lo que no introduce capacidades nuevas ni altera la distribución final.
- Sin soporte de tool calling, agentes, visión, audio ni modo thinking propio: esas capacidades residen en el modelo base.

## Casos de uso

- Aceleración de inferencia en producción con Lamina: cargar la capa MTP con `--mtp` junto a Qwen3.8-Flash-Next para reducir la latencia por token en cargas de generación larga, con la garantía de que la salida es la del modelo verificado.
- Servicio de razonamiento con modelos cuantizados IQ3_S: el autor reporta mayor aceptación (2,489 tokens por verificación) en este formato, por lo que es la combinación preferente para despliegues con esa cuantización.
- Despliegue en estaciones de trabajo con RTX 3090 o RTX 5070 Ti: las ganancias medidas (1,3 % y 4,5 %) se obtuvieron en ese hardware, útil para equipos de desarrollo que ya ejecutan el modelo base en local.
- Generación de código asistida: el vocabulario de borrador cubre inglés y código, de modo que la aceleración es aplicable a pipelines de completado de código donde el modelo base ya se usa.
- Investigación en decodificación especulativa: el repositorio documenta el proceso de cuantización y ajuste (987 peticiones, 2,4M posiciones, objetivo de aceptación), lo que sirve como referencia reproducible para experimentos con capas MTP.
- Evaluación comparativa de draft layers: permite medir la aceptación frente a la parte densa de basalt (2,402 / 2,344 tokens por verificación) en el mismo runtime y hardware.

## Benchmarks y rendimiento

| Metrica | IQ3_S | UD-Q4_K_XL |
|---|---|---|
| Tokens aceptados por pasada de verificación (texto reservado) | 2,489 | 2,433 |
| Misma métrica con la parte densa de basalt | 2,402 | 2,344 |
| Aceleración de escritura de texto de razonamiento (RTX 3090) | 1,3 % | no disponible |
| Aceleración de escritura de texto de razonamiento (RTX 5070 Ti) | no disponible | 4,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el componente no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- Espacio en disco: 0,8 GB para los cuatro ficheros del repositorio.
- VRAM adicional: no disponible de forma explícita; los ficheros suman aproximadamente 824 MB en disco y deben residir en memoria durante la inferencia.
- GPU validadas por el autor: RTX 3090 y RTX 5070 Ti, ambas en un mismo equipo.
- GPU de datacenter (A100, H100): no se han publicado mediciones.
- Despliegue: exclusivamente mediante el runtime Lamina (https://github.com/eddoursul/Lamina), con la opción `--mtp <carpeta>`; no es compatible con vLLM, llama.cpp, Ollama ni TGI en el formato publicado.
- Latencia y throughput: solo se reportan las aceleraciones relativas del 1,3 % y 4,5 %; no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Componente | Base | Formato | Cuantizacion | Aceptacion (IQ3_S / UD-Q4_K_XL) | Licencia |
|---|---|---|---|---|---|
| Lamina-Qwen3.8-Flash-Next-MTP | Qwen3.8-Flash-Next | Lamina | Q2_0 / Q8_0 / BF16 / F32 | 2,489 / 2,433 | Qwen Community 1.0 |
| Parte densa de basalt (referencia del autor) | Qwen3.8-Flash-Next | no disponible | no disponible | 2,402 / 2,344 | no disponible |
| Capa MTP original de Qwen | Qwen3.8-Flash-Next | checkpoint BF16 de Qwen | BF16 | no disponible | Qwen Community 1.0 |

No se dispone de información sobre otros draft layers comparables para el mismo modelo base o para runtimes distintos de Lamina.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen3.8-Flash-Next y el runtime Lamina no produce salida útil.
- Formato propietario de Lamina; no se puede cargar en ecosistemas estándar (GGUF, safetensors, vLLM, llama.cpp).
- Vocabulario de borrador restringido a 40.525 tokens de inglés y código: la aceleración puede degradarse en otros idiomas o dominios.
- Ganancias de velocidad pequeñas (1,3 %-4,5 %) y medidas en un único equipo; no hay datos de escalado a otras GPU ni a cargas por lotes.
- Los expertos están cuantizados en Q2_0, lo que puede reducir la tasa de aceptación frente a una capa MTP en BF16; no se publica esa comparación.
- Entrenado sobre la salida de Lamina con dos cuantizaciones concretas (IQ3_S y UD-Q4_K_XL); el comportamiento con otras cuantizaciones del modelo base no está documentado.
- Licencia Qwen Community License 1.0: revisar las condiciones de uso comercial antes de desplegar, ya que se heredan del modelo base.
- Riesgo de alucinación y sesgos: los del modelo Qwen3.8-Flash-Next subyacente; la capa MTP no los modifica porque toda propuesta se verifica.
- Repositorio sin descargas ni likes en el momento de la consulta y con un único autor; no hay validación independiente de las cifras reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/eddoursul/Lamina-Qwen3.8-Flash-Next-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Lamina: https://github.com/eddoursul/Lamina
- Pesos auto-destilados de partida (basalt): https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Licencia: LICENSE (incluida en el repositorio)
