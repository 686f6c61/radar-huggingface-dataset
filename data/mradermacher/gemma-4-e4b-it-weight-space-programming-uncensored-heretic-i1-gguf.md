# mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF

## Resumen

`gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF` es una cuantización GGUF, generada por mradermacher, del modelo base `xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic`, que a su vez deriva de la familia Gemma 4 (Gemma 4 E4B instruct). El modelo combina tres ejes: (1) la arquitectura y capacidades de Gemma 4, (2) una intervención de "weight-space programming" orientada a interpretabilidad mecanística y tool calling sin entrenamiento adicional (zero-training), y (3) una modificación "heretic"/abliterated que elimina los mecanismos de rechazo y censura del modelo original. El resultado es un modelo conversacional en inglés, de aproximadamente 7.460 millones de parámetros reales almacenados, con soporte declarado de tool calling y uso agéntico.

La relevancia de esta ficha está en que documenta un artefacto de nicho: no es un modelo entrenado desde cero, sino un derivado experimental de un modelo base con modificaciones de pesos, distribuido en múltiples cuantizaciones GGUF (desde i1-IQ1_S de 3,4 GB hasta i1-Q6_K y superiores). El repositorio ocupa 111 GB por acumulación de variantes. Es útil para investigadores que quieran inspeccionar intervenciones en el espacio de pesos, para desarrolladores que necesiten ejecutar un Gemma 4 en hardware de consumo con llama.cpp, y para quienes evalúen el efecto de la "abliteration" sobre el comportamiento del modelo.

Conviene subrayar que la información disponible es escasa: la model card del cuantizador es fundamentalmente logística (lista de quants) y no aporta datos de entrenamiento, benchmarks ni contexto. Los datos que siguen se limitan a lo verificable en la información proporcionada, y lo ausente se marca explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B); detalles internos no disponibles |
| Parámetros totales | 7.463.013.674 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (lista parcial en la model card; existen además quants estáticos en el repo hermano) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizado con imatrix/weighted quants); repo estático hermano con quants estáticos y posible mmproj |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 en su variante E4B, es decir, un transformer decoder-only de la familia Google Gemma, con aproximadamente 7.460 millones de parámetros almacenados. No se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención (global/local, RoPE, etc.) ni de la composición del corpus de preentrenamiento. Tampoco se documenta el proceso de alineamiento (RLHF, DPO u otros) del modelo base Gemma 4 original.

Lo que sí está documentado es la intervención posterior: el modelo base `xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic` aplica "weight-space programming", una técnica de modificación directa de pesos (sin fine-tuning adicional, de ahí la etiqueta "zero-training") orientada a interpretabilidad mecanística y a inducir comportamientos de tool calling y uso agéntico. Sobre esa base se aplica además una modificación "heretic"/abliterated/"decensored", que típicamente consiste en identificar y neutralizar direcciones de activación asociadas a rechazos y respuestas censuradas. Esta cuantización concreta es una conversión GGUF con imatrix, que preserva el comportamiento del modelo base a menor precisión. No hay información sobre tokens de entrenamiento, dataset, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con modo instruct (`-it`).
- Tool calling / function calling: el modelo base declara explícitamente la etiqueta `tool-calling`.
- Uso agéntico y razonamiento multi-paso: etiqueta `agentic` en el modelo base.
- Comportamiento "uncensored"/"decensored": se han eliminado los mecanismos de rechazo, por lo que responde a peticiones que el Gemma original rechazaría.
- Capacidad de visión: la model card del cuantizador indica "This is a vision model" y remite a posibles ficheros mmproj en el repositorio estático; la disponibilidad efectiva de mmproj no se confirma en la información proporcionada.
- Modificación de pesos orientada a interpretabilidad mecanística (weight-space programming), relevante para investigación más que para uso final.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se declara soporte de otros idiomas.

## Casos de uso

- Investigación en interpretabilidad mecanística: permite estudiar el efecto de intervenciones en el espacio de pesos (weight-space programming) sobre las representaciones internas, comparando el modelo intervenido con el Gemma 4 original en tareas controladas.
- Estudio del fenómeno de abliteration: útil para medir cuantitativamente cómo la eliminación de direcciones de rechazo afecta a la tasa de cumplimiento, la coherencia y la calidad en prompts sensibles, en un entorno reproducible con GGUF.
- Ejecución local de un Gemma 4 en hardware de consumo: las cuantizaciones i1-IQ2_* e i1-IQ3_* (3,6-4,8 GB) permiten desplegar el modelo en portátiles y GPUs con poca VRAM mediante llama.cpp u Ollama, para pruebas de prototipos.
- Evaluación de pipelines agénticos y tool calling: al declarar soporte de tool calling y comportamiento agéntico, sirve para probar orquestadores de agentes y esquemas de function calling antes de migrar a modelos mayores.
- Generación de código y texto sin restricciones de contenido: en entornos de investigación donde se necesita un modelo que no filtre respuestas (por ejemplo, estudio de sesgos o de robustez frente a jailbreaks), este derivado evita los rechazos del modelo original.
- Benchmarking de cuantizaciones GGUF: el repositorio ofrece más de veinte variantes i1, lo que permite comparar degradación de calidad frente a tamaño entre IQ1, IQ2, IQ3, Q4, Q5 y Q6 sobre el mismo modelo base.
- Pruebas de visión (si mmproj está disponible): la model card indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repo estático; puede usarse para validar pipelines multimodales en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, con overhead adicional de contexto y KV cache):
  - i1-IQ1_S (3,4 GB): ~4-5 GB de VRAM efectiva.
  - i1-IQ2_* (3,6-3,9 GB): ~4,5-5,5 GB.
  - i1-IQ3_* / Q3_K_* (4,1-5,1 GB): ~5-6,5 GB.
  - i1-IQ4_XS / Q4_K_* (≈5,1 GB en adelante): ~6-7 GB.
  - i1-Q5_K_* e i1-Q6_K: por encima de 7 GB; el tamaño exacto no figura completo en la información proporcionada.
- GPU recomendadas: para las cuantizaciones bajas (IQ1-IQ3) basta una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; para Q5/Q6 se recomienda RTX 4080/4090 16-24 GB. En entornos de servidor, A100 o H100 ofrecen margen amplio y mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones. Las variantes IQ1/IQ2 caben incluso en GPUs de 6-8 GB; las Q5/Q6 requieren 12 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo TGI/vLLM en el ecosistema HF, aunque vLLM no es el runtime principal para GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E4B WSP heretic i1-GGUF) | 7.463 M | no disponible | gemma | GGUF | Derivado con weight-space programming y abliteration; solo inglés |
| Gemma 4 E4B-it original (familia Google) | ~7.460 M (variante E4B) | no disponible en esta ficha | gemma | safetensors / GGUF | Modelo base sin intervención; mantiene mecanismos de rechazo |
| xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic | 7.463 M | no disponible | gemma | safetensors | Modelo base directo de esta cuantización; sin cuantizar |
| Otras cuantizaciones GGUF de Gemma 4 de 7B (p. ej. repos de terceros) | ~7.000 M | no disponible | gemma | GGUF | Alternativas de despliegue local sin modificaciones de pesos |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma es `en`; no se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento fuera del inglés es incierto.
- Modelo "uncensored"/abliterated: la eliminación de mecanismos de rechazo implica que puede generar contenido dañino, ofensivo o ilegal si se le solicita. No es adecuado para aplicaciones de cara al público sin capas de filtrado externas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos de evaluación que permitan acotarlo. La intervención de pesos puede alterar la calibración del modelo respecto al original.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones (incluida la prohibición de usar el modelo para ciertos fines y obligaciones de atribución). Es imprescindible revisar los términos antes de un despliegue en producción.
- Artefacto experimental: el modelo base es un derivado de terceros con modificaciones de pesos no auditadas; no hay garantía de estabilidad, calidad ni reproducibilidad de la intervención.
- Cuantizaciones muy agresivas (i1-IQ1_*, i1-IQ2_*): la propia model card las describe como "for the desperate" o de calidad muy baja; degradan notablemente la coherencia y no deberían usarse en producción.
- Visión condicional: la model card afirma que es un modelo de visión, pero los ficheros mmproj, si existen, están en el repositorio estático; no se confirma su disponibilidad ni su calidad.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar tareas de contexto largo.
- Sin benchmarks: no hay métricas publicadas, por lo que no se puede comparar objetivamente con alternativas.
- Repositorio de 111 GB: el peso de descarga es elevado por la acumulación de variantes; conviene descargar solo el quant necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- Modelo base (xtools-at): https://huggingface.co/xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic
- Repositorio de quants estáticos de mradermacher: https://huggingface.co/mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-GGUF
- Página de overview de descargas de mradermacher: https://hf.tst.eu/model#gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
