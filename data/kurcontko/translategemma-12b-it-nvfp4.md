# kurcontko/translategemma-12b-it-NVFP4

## Resumen

TranslateGemma-12B-IT-NVFP4 es una cuantización de 4 bits (NVFP4, W4A4) del modelo de traducción `google/translategemma-12b-it`, publicada por el usuario independiente `kurcontko`. El objetivo es ejecutar un modelo de traducción de 12.187 millones de parámetros en una GPU de consumo con 12 GB de VRAM (arquitectura Blackwell), manteniendo una calidad cercana al original en precisión BF16. La cuantización se realizó con GPTQ mediante `llm-compressor` y se empaquetó para servirse con vLLM.

La relevancia de esta build reside en su perfil de compromiso calidad/velocidad/memoria: según el autor, obtiene un COMET-22 de 83,89 en pares europeos de WMT24++ frente a 84,10 del BF16 (una caída de solo 0,21 puntos) y un throughput de 78,4 celdas/s en traducción por lotes de segmentos cortos, aproximadamente el doble que las builds W4A16 comparadas. Los pesos ocupan 7,9 GiB en vLLM con servicio solo de texto, y la descarga completa es de 8,9 GB.

El modelo cubre nueve idiomas europeos (inglés, polaco, alemán, francés, español, italiano, neerlandés, portugués y checo) y hereda la licencia Gemma del modelo base. Es una build no oficial, sin afiliación con Google, y requiere una GPU Blackwell para aprovechar el formato NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3), con capas globales que usan RoPE escalado linealmente ×8; torre de visión y proyector en BF16 |
| Parametros totales | 12.187.325.040 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en esta build (`max_position_embeddings`); la model card del modelo base indica 2K tokens de entrada para traducción |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones FP4 en grupos de 16 con escalas FP8, redondeo GPTQ); torre de visión, proyector y embeddings en BF16 |
| Idiomas soportados | en, pl, de, fr, es, it, nl, pt, cs |
| Licencia | Gemma (términos de licencia del modelo base) |
| Formato de pesos | safetensors, formato compressed-tensors para vLLM |

## Arquitectura y entrenamiento

La build es una cuantización del modelo base `google/translategemma-12b-it`, que a su vez se apoya en la arquitectura Gemma 3. Todas las capas lineales del modelo de lenguaje están en NVFP4: pesos y activaciones en FP4 agrupados de 16 en 16 con escalas FP8, y el redondeo de pesos lo selecciona GPTQ. La torre de visión, el proyector y los embeddings permanecen en BF16. Las capas globales conservan el escalado RoPE lineal ×8 del modelo base.

La calibración se realizó con 576 pares de OPUS-100 en las direcciones EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN, renderizados con el prompt de TranslateGemma seguido de la traducción de referencia; la receta y los scripts están en el directorio `quantization/` del repositorio. Respecto a una exportación estándar de `llm-compressor`, el autor introduce tres cambios: elimina el `lm_head.weight` duplicado (los embeddings están atados y vLLM no lo lee, con lo que la descarga baja 2 GB y las salidas en 1.800 segmentos de prueba son idénticas), reduce `max_position_embeddings` de 131.072 a 32.768 para evitar que la tabla RoPE precalculada por vLLM consuma unos 0,45 GiB de la caché KV en una tarjeta de 12 GB, y amplía `chat_template.jinja` para aceptar el formato de cadena plana `<<<source>>>CODE<<<target>>>CODE<<<text>>>TEXT`, ya que el servidor de vLLM 0.26 descarta los campos `source_lang_code` y `target_lang_code` de los mensajes de chat. Los cambios están documentados en el archivo `NOTICE` conforme a los términos de Gemma.

## Capacidades

- Traducción automática entre los nueve idiomas europeos soportados, en ambas direcciones para los pares cubiertos (incluido PL→EN).
- Traducción con control explícito de idioma origen y destino mediante códigos de idioma, incluidos variantes regionales del modelo base.
- Procesamiento de lotes de segmentos cortos con alto throughput (medido en celdas de 1 a 40 palabras).
- Preservación de tokens protegidos en el texto: placeholders `{placeholders}`, `%s`, `%1$s`, `{{var}}`, `${var}`, etiquetas HTML, URLs, correos electrónicos, SKUs, código en línea y saltos de línea.
- Servicio mediante la API compatible con OpenAI de vLLM, tanto con prompt de cadena plana como con el formato de mensajes estructurado de Google.
- Capacidad multimodal heredada del modelo base (torre de visión en BF16), aunque la build está probada y documentada para servicio solo de texto.
- No se documentan en la información disponible capacidades de tool calling, agentes o modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica en producción: el modelo traduce entre inglés y los ocho idiomas europeos restantes con contexto de hasta 32.768 tokens en esta build, suficiente para secciones completas de manuales sin fragmentar el texto.
- Localización de software con preservación de estructura: los tests del autor muestran una retención del 88,9 % de tokens protegidos y del 88,6 % de celdas intactas, lo que lo hace apto para traducir cadenas con placeholders, etiquetas HTML y variables de plantilla en pipelines de localización.
- Traducción por lotes de alto volumen: con 78,4 celdas/s en segmentos cortos sobre una RTX 5070 Ti, resulta adecuado para procesar grandes volúmenes de textos breves (subtítulos, fichas de producto, mensajes) en una sola GPU de consumo.
- Servicio de traducción self-hosted en una tarjeta de 12 GB: los pesos ocupan 7,9 GiB en vLLM con servicio solo de texto, lo que permite desplegar el modelo en estaciones de trabajo o portátiles con GPU Blackwell sin depender de la nube.
- Traducción de correspondencia comercial y atención al cliente multilingüe: la cobertura de neerlandés, polaco, checo y portugués además de los idiomas mayoritarios permite atender mercados europeos secundarios con un único modelo.
- Post-edición y traducción asistida en flujos internos: la calidad medida (COMET-22 de 83,89, a 0,21 puntos del BF16) permite usar el modelo como primera pasada de traducción con revisión humana posterior, con la ventaja de ejecutarse en hardware asequible.
- Evaluación comparativa de cuantizaciones: el repositorio incluye recetas, scripts de calibración y bancos de prueba reproducibles, útil para equipos que quieran replicar el proceso con sus propios pares de idiomas o dominios.

## Benchmarks y rendimiento

Test sobre todos los segmentos no canary de WMT24++ (`google/wmt24pp`), 960 por dirección y 8.640 en total, con decodificación greedy en vLLM 0.26.0 sobre una RTX 5070 Ti de 16 GB limitada a un presupuesto de 11,5 GB. Métrica COMET-22 con `Unbabel/wmt22-comet-da` escalada ×100, y chrF de corpus con sacrebleu.

| Modelo | EN→CS | EN→DE | EN→ES | EN→FR | EN→IT | EN→NL | EN→PL | EN→PT | PL→EN | Media | chrF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BF16 (referencia, 2 GPU) | 86,55 | 82,58 | 84,09 | 82,15 | 84,96 | 85,04 | 85,61 | 84,08 | 81,88 | 84,10 | 58,3 |
| Esta build (NVFP4 GPTQ) | 86,28 | 82,63 | 83,74 | 82,01 | 84,68 | 84,72 | 85,24 | 84,00 | 81,74 | 83,89 | 57,7 |

Comparación con otras builds de 4 bits del mismo modelo base, mismas pruebas y mismo presupuesto de 11,5 GB:

| Build | COMET-22 | Diferencia vs BF16 | Estructura (tokens / celdas) | Celdas/s | Método |
|---|---|---|---|---|---|
| Esta build | 83,89 | −0,21 | 88,9 % / 88,6 % | 78,4 | NVFP4, GPTQ |
| upshift/infomaniak-translategemma-12b-it-W4A16 | 83,82 | −0,28 | 84,4 % / 85,1 % | 35,7 | int4 W4A16, GPTQ |
| henry1477/translategemma-12b-it-NVFP4 | 83,51 | −0,60 | 88,9 % / 88,6 % | 66,3 | NVFP4, solo texto |
| kaitchup/translategemma-12b-it-NVFP4 | 83,45 | −0,65 | 85,2 % / 85,1 % | 79,4 | NVFP4 |
| upshift/infomaniak-translategemma-12b-it-W4A16-awq | 82,95 | −1,15 | 83,7 % / 84,0 % | 36,1 | int4 W4A16, AWQ |

Prueba de estructura: 175 celdas tipo Excel en cada uno de PL, DE, FR, ES y CS, con 270 tokens que deben conservarse literalmente. El BF16 de TranslateGemma también obtiene 88,9 % / 88,6 %, por lo que la pérdida estructural procede del modelo base (reescribe etiquetas simples como `<b>…</b>`), no de la cuantización. El autor indica además que, para pares europeos en una tarjeta de 12 GB, su build Hy-MT2-7B-NVFP4 obtuvo 84,66 COMET-22, 213 celdas/s y un 99,3 % de retención de tokens protegidos en las mismas pruebas.

## Requisitos de hardware

- VRAM estimada: 7,9 GiB para los pesos en vLLM con servicio solo de texto; el autor probó con un presupuesto de 11,5 GB (`gpu_memory_utilization` ≈ 0,74) para simular una GPU de portátil de 12 GB.
- GPU necesaria: arquitectura Blackwell obligatoria para NVFP4 (probado en RTX 5070 Ti de 16 GB). No es compatible con generaciones anteriores sin soporte de FP4.
- Cabe en GPU de consumo: sí, en tarjetas Blackwell de 12 GB o más según el autor; la prueba se ejecutó en una RTX 5070 Ti.
- Despliegue: vLLM 0.26.0 con formato compressed-tensors, flag `--language-model-only` y `--max-model-len 2048` en el ejemplo de uso del autor. No se documentan opciones para llama.cpp, Ollama ni TGI, ya que el formato NVFP4 no es compatible con esos motores.
- Throughput: 78,4 celdas/s en lotes de 4.000 celdas cortas (EN→X, 1 a 40 palabras) en una sola RTX 5070 Ti; el autor señala que una segunda unidad del mismo modelo rindió aproximadamente un 5 % más rápido en la misma carga.
- Latencia: no disponible de forma explícita; el dato de celdas/s es la referencia de rendimiento publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | COMET-22 (WMT24++ EU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (kurcontko, NVFP4 GPTQ) | 12,19 B | 32.768 | 83,89 | Gemma | Hugging Face, vLLM en Blackwell |
| google/translategemma-12b-it (BF16) | 12,19 B | 2K de entrada según su model card | 84,10 | Gemma | Hugging Face, oficial |
| kaitchup/translategemma-12b-it-NVFP4 | 12,19 B | No disponible | 83,45 | Gemma | Hugging Face; requiere añadir `eos_token_id` en vLLM 0.26 y su `config.json` omite el escalado RoPE ×8 |
| upshift/infomaniak-translategemma-12b-it-W4A16 | 12,19 B | No disponible | 83,82 | Gemma | Hugging Face; W4A16, 35,7 celdas/s |
| kurcontko/Hy-MT2-7B-NVFP4 | 7 B (aproximado, no confirmado) | No disponible | 84,66 | No disponible | Hugging Face; 213 celdas/s y 99,3 % de retención de estructura según el autor |

## Limitaciones y advertencias

- Build no oficial: no está afiliada a Google y no debe presentarse como distribución oficial de TranslateGemma.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma del modelo base; es necesario revisarlos antes de desplegar en producción.
- Requiere GPU Blackwell: NVFP4 no funciona en arquitecturas anteriores; esto limita el hardware válido y descarta GPUs Ampere o Ada.
- Contexto reducido a 32.768 tokens en esta build frente a 131.072 del modelo base, decisión deliberada del autor para ahorrar memoria de la tabla RoPE; la model card del modelo base indica además 2K tokens de entrada para traducción.
- Cobertura lingüística limitada a nueve idiomas europeos; no se documenta soporte para otras lenguas.
- Riesgo de alucinación y de reescritura de estructura: el modelo base reescribe etiquetas HTML simples como `<b>…</b>`, y la retención de tokens protegidos medida es del 88,9 %, por lo que no debe confiarse la integridad de plantillas críticas sin validación posterior.
- El servidor de vLLM 0.26 descarta los campos `source_lang_code` y `target_lang_code` de los mensajes de chat; hay que usar el formato de cadena plana incluido en el `chat_template.jinja` de esta build.
- Sin datos publicados sobre sesgos específicos del modelo ni sobre comportamiento fuera de los pares europeos evaluados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kurcontko/translategemma-12b-it-NVFP4
- Modelo base: https://huggingface.co/google/translategemma-12b-it
- Build NVFP4 alternativa (kaitchup): https://huggingface.co/kaitchup/translategemma-12b-it-NVFP4
- Build NVFP4 alternativa (henry1477): https://huggingface.co/henry1477/translategemma-12b-it-NVFP4
- Build W4A16 (upshift/infomaniak): https://huggingface.co/upshift/infomaniak-translategemma-12b-it-W4A16
- Build W4A16 AWQ (upshift/infomaniak): https://huggingface.co/upshift/infomaniak-translategemma-12b-it-W4A16-awq
- Modelo Hy-MT2-7B-NVFP4 del mismo autor: https://huggingface.co/kurcontko/Hy-MT2-7B-NVFP4
- Conjunto de evaluación WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Métrica COMET-22: https://huggingface.co/Unbabel/wmt22-comet-da
- Newsletter de The Kaitchup: https://kaitchup.substack.com
