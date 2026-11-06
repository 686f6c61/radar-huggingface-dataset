# ravivarmapatturi/inferedge-indictrans2-en-te-1000steps-v1

## Resumen

InferEdge IndicTrans2 English-Telugu 1000 steps es un checkpoint de investigación publicado por ravivarmapatturi (InferEdge AI / VaayuEdge) que adapta el modelo de traducción automática ai4bharat/indictrans2-en-indic-dist-200M para el par inglés-telugu. No se trata de una arquitectura nueva ni de un modelo entrenado desde cero: es un ajuste fino completo (full-parameter) del modelo destilado de 200M de AI4Bharat, orientado a mejorar la calidad de traducción del inglés al telugu sobre el checkpoint original.

El modelo mantiene la arquitectura transformer encoder-decoder propia de IndicTrans2, con 211.776.512 parámetros según el manifiesto del autor y 274.584.576 parámetros totales declarados en los safetensors del repositorio. El ajuste consistió en 1000 pasos de optimizador completos con AdamW, learning rate 2e-6, batch 2 y semilla 42, procesando aproximadamente 2000 ejemplos del corpus BPCC-H-Daily Telugu, lo que supone menos de una época sobre las 7673 filas de entrenamiento.

Su relevancia es acotada y explícitamente investigadora: el autor declara mejoras medibles sobre la validación interna (BLEU 27,51 frente a 21,34 del upstream; chrF++ 58,31 frente a 54,17), pero también advierte que no hay evaluación externa ni test ciego, que la validación se usó para seleccionar el checkpoint y que no existe aprobación para producción. Es útil como referencia reproducible de ajuste fino sobre IndicTrans2 para un par de lenguas de bajos recursos como el telugu, no como sistema listo para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2, variante destilada de 200M) |
| Parámetros totales | 274.584.576 (safetensors); 211.776.512 según manifiesto del autor para el upstream |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generación con max_length 256 y 3 beams en la evaluación del autor) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) y telugu (te) |
| Licencia | MIT (hereda la licencia MIT de AI4Bharat IndicTrans2) |
| Formato de pesos | safetensors, con código personalizado (`custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder seq2seq derivado de IndicTrans2, la familia de traducción de AI4Bharat presentada en el paper arXiv:2305.16307. La variante base es la destilada de 200M parámetros (`indictrans2-en-indic-dist-200M`), revisión `2cfd0a20057756d756bf3e53528f492afc52f91a`, que traduce del inglés a lenguas índicas. El checkpoint conserva el tokenizador y el código personalizado del upstream, por lo que requiere el preprocesado y postprocesado de `IndicProcessor` (IndicTransToolkit) con etiquetas de lengua `eng_Latn` y `tel_Telu`.

El ajuste fino se realizó con 1000 pasos completos de optimizador (AdamW, lr 2e-6, batch 2, acumulación 1, semilla 42, PyTorch Lightning 2.6.6), sobre aproximadamente 2000 ejemplos del componente Daily de BPCC-H-Daily Telugu (fichero `daily/tel_Telu.tsv`, revisión `5bde309374f21c39e7c3d505f28ae11f58f2a220`). Los 8511 pares limpios se dividieron en 7673 de entrenamiento, 412 de validación y 426 de test mediante hash de la fuente normalizada; se aplicó descontaminación exacta contra IN22 sin solapamiento encontrado, aunque el autor reconoce que los casi duplicados y la exposición previa del upstream a datos de preentrenamiento quedan sin resolver. El checkpoint exportado se seleccionó por pérdida de validación, no por métricas de generación. El entrenamiento se ejecutó en una Tesla T4, con guardado y reanudación periódicos de estado completo verificados antes del bucle principal; la ejecución de 100 pasos previa se hizo en CPU. No se documenta RLHF ni DPO.

## Capacidades

- Traducción automática de texto del inglés al telugu, con etiquetas de lengua `eng_Latn` y `tel_Telu`.
- Generación seq2seq con búsqueda por haces (3 beams en la configuración de evaluación del autor) y longitud máxima de 256 tokens.
- Preprocesado y postprocesado específicos para escritura índica mediante `IndicProcessor` de IndicTransToolkit 1.1.1.
- Compatibilidad con la API de Transformers (`AutoTokenizer`, `AutoModelForSeq2SeqLM`) con `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de traducción de texto.
- Capacidad multilingüe limitada al par inglés-telugu de este ajuste; el upstream cubre más lenguas índicas, pero este checkpoint no declara soporte para ellas.

## Casos de uso

- Traducción de documentación técnica interna del inglés al telugu: el modelo puede procesar lotes de párrafos con `preprocess_batch` y devolver texto en escritura telugu, útil para equipos con personal telugu-hablante que consume documentación en inglés.
- Localización de interfaces y cadenas de producto: al ser un modelo pequeño (200M), puede integrarse en un pipeline de traducción por lotes de textos cortos de UI, con revisión humana posterior dada la ausencia de evaluación externa.
- Investigación sobre ajuste fino de modelos de traducción de bajos recursos: sirve como referencia reproducible (semilla, pasos, hiperparámetros, hashes de corpus) para estudiar cuánto mejora un destilado de 200M con menos de una época de datos específicos.
- Generación de subtítulos o textos auxiliares en telugu a partir de fuentes en inglés: el modelo traduce texto plano, por lo que encaja en un paso de traducción dentro de un pipeline mayor, no como sistema completo de conversación (el autor lo aclara explícitamente).
- Evaluación comparativa de checkpoints: útil para contrastar el efecto de 100 frente a 1000 pasos de ajuste sobre el mismo corpus, siempre que se respeten las advertencias del autor sobre no atribuir métricas entre checkpoints.
- Prototipado de sistemas de traducción en entornos con recursos limitados: con 200M parámetros y ejecución verificada en Tesla T4, es viable para experimentos en una sola GPU, aunque el autor no ha medido latencia, RAM ni consumo energético en dispositivos concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`):

| Benchmark | Conjunto | Métrica | Valor |
|---|---|---|---|
| InferEdge IndicTrans2 English-Telugu 1000 steps | BPCC-H-Daily Telugu, validación interna (412 filas, usado para selección) | SacreBLEU 2.6.0 BLEU (13a, case-sensitive) | 27,5138 |
| InferEdge IndicTrans2 English-Telugu 1000 steps | BPCC-H-Daily Telugu, validación interna (412 filas) | chrF++ (character order 6, word order 2) | 58,3145 |
| Upstream (referencia del autor) | Misma validación interna | chrF++ | 54,1698 |
| Upstream (referencia del autor) | Misma validación interna | BLEU | 21,3407 |

Condiciones de evaluación declaradas: SacreBLEU 2.6.0, 3 beams, máximo 256 tokens, batch 4, CPU con 4 hilos, cero salidas vacías. El autor advierte que la validación se usó para selección y no constituye un test final imparcial, y que no se ha ejecutado ningún benchmark retenido o externo para estos pesos de 1000 pasos. Las puntuaciones del modelo de 100 pasos no deben atribuirse a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 274,6M parámetros en safetensors, una estimación en fp32 rondaría 1,1 GB de pesos, pero el autor no publica mediciones de VRAM.
- GPU recomendadas: el autor solo documenta entrenamiento en Tesla T4 y evaluación en CPU con 4 hilos; no hay recomendaciones de GPU para inferencia.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de parámetros sería viable en GPUs de consumo, pero no hay mediciones ni validación publicadas.
- Opciones de despliegue: Transformers 4.51.3 con `trust_remote_code=True`, IndicTransToolkit 1.1.1 y PyTorch 2.6.0 (recarga offline probada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor declara pendientes las mediciones de RAM, latencia y energía en dispositivos concretos, así como la paridad de exportación a móvil y navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| InferEdge IndicTrans2 en-te 1000 steps | 274,6M (safetensors) / 211,8M (manifiesto) | No disponible | en, te | MIT | Checkpoint de investigación, 27 descargas |
| ai4bharat/indictrans2-en-indic-dist-200M | 211,8M | No disponible | en a lenguas índicas (incluido te) | MIT | Modelo base oficial de AI4Bharat |
| Resto de la familia IndicTrans2 (variantes no destiladas) | No disponible en la información proporcionada | No disponible | en y lenguas índicas | MIT | Modelos oficiales de AI4Bharat |

La comparación cuantitativa solo es posible contra el upstream en la validación interna del autor (BLEU 27,51 frente a 21,34; chrF++ 58,31 frente a 54,17), con la salvedad de que esa validación se usó para seleccionar el checkpoint. No se dispone de comparaciones con otros sistemas de traducción en-te en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que no es una arquitectura nueva, ni un modelo desde cero, ni un sistema aprobado para producción, ni prueba de superioridad frente a proveedores comerciales.
- No se ha ejecutado ninguna evaluación retenida ni externa sobre estos pesos de 1000 pasos; las métricas publicadas proceden de la validación usada para seleccionar el checkpoint y están marcadas como no verificadas.
- Los casi duplicados en el corpus y la posible exposición previa del upstream a datos de preentrenamiento quedan sin resolver; la descontaminación exacta contra IN22 no descarta solapamientos difusos.
- No hay revisión humana nativa del telugu, ni experimentos con semillas repetidas, ni evaluación confirmatoria fresca.
- No se han medido latencia, RAM ni consumo energético en dispositivos concretos; la paridad de exportación a móvil y navegador está pendiente.
- Es un modelo exclusivamente de traducción de texto: no es un sistema completo de ASR/TTS ni de conversación.
- Requiere código personalizado y `trust_remote_code=True`; el autor recomienda fijar un commit del Hub, inspeccionar el código y verificar los hashes congelados antes de habilitarlo.
- Licencia MIT heredada de AI4Bharat: es permisiva para uso comercial, pero debe preservarse la licencia y los avisos de atribución (LICENSE y ATTRIBUTION.md); los datos de entrenamiento no se redistribuyen y la licencia CC-BY-4.0 del componente Daily de BPCC no debe generalizarse a otros componentes.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; al ser un modelo de traducción, los errores se manifestarían como traducciones infieles u omisiones, no evaluadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravivarmapatturi/inferedge-indictrans2-en-te-1000steps-v1
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- Repositorio AI4Bharat IndicTrans2: https://github.com/AI4Bharat/IndicTrans2
- Paper IndicTrans2: https://arxiv.org/abs/2305.16307
- Paper de SacreBLEU: https://aclanthology.org/W18-6319/
- Corpus BPCC (AI4Bharat): https://huggingface.co/datasets/ai4bharat/BPCC
