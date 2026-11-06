# arshkumarsingh/sarvam-lens

## Resumen

Sarvam-30B workspace lenses es un conjunto de cuatro lentes de interpretabilidad mecanicista (J-lens, R-lens, J++ y una variante de J-lens ajustada para lenguas indicas) publicadas por el investigador independiente arshkumarsingh para el modelo base `sarvamai/sarvam-30b`, un MoE de pesos abiertos orientado a lenguas indias. No se trata de un modelo generativo, sino de un artefacto de análisis: cada lente es una matriz que mapea el flujo residual tras cualquiera de las capas 0 a 17 del transformer a la distribución de vocabulario, permitiendo leer qué token es más probable que el modelo emita en un punto intermedio de la red (la técnica conocida como *logit lens* o, en su variante jacobiana, *Jacobian lens*).

El trabajo se enmarca en un estudio sobre si Sarvam-30B pasa por el inglés cuando traduce entre lenguas indias. Según la model card, en las capas 14 a 16 de 19, la palabra inglesa aparece en el top 10 de la lente para el 97-100 % de los ítems de traducción indic→indic con las lentes ajustadas, y para el 93-95 % con la logit lens sin ajuste. Los autores lo presentan como los primeros lentes de la familia Jacobiana publicados para un modelo indio.

La relevancia actual es doble: por un lado, abre una vía para auditar el comportamiento interno de modelos multilingües de pesos abiertos; por otro, documenta un fallo crítico de carga del modelo base bajo transformers 5 (buffer `inv_freq` de RoPE sin inicializar) que invalida cualquier lectura de las lentes si no se corrige. El repositorio ocupa 4,9 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes de interpretabilidad (matrices Jacobianas 4096×4096 por capa) sobre un transformer MoE; no es un modelo generativo |
| Parametros totales | No disponible para las lentes; el modelo base `sarvamai/sarvam-30b` tiene 30B (según su nombre) |
| Parametros activos | No disponible (el modelo base es MoE con 128 expertos enrutados, top-6 + 1 compartido, capa 0 densa) |
| Longitud de contexto | No disponible para las lentes; depende del modelo base |
| Tipos de cuantizacion | No disponible; los ficheros de lentes se distribuyen en fp32 y pueden re-guardarse en fp16 sin pérdida relevante (entradas O(1)) |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml (inglés y ocho lenguas indias) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch, cargables con `torch.load(..., weights_only=True)`) en formato de lente de `jpp_lens`; ficheros JSON de procedencia y `SHA256SUMS` |

## Arquitectura y entrenamiento

Las lentes cubren las capas fuente 0 a 17 de los 19 bloques de Sarvam-30B (`d_model` = 4096), lo que supone 18 Jacobianos de 4096×4096 por lente. El objetivo es el bloque final, por lo que la capa 18 no tiene lente. Se publican cuatro variantes: J-lens (Jacobiano simple, 200 prompts de WikiText), R-lens (Jacobiano a través de un grafo backward LRP con preset `r+moe`, 25 prompts), J++ (ponderación aprendida de los 8 Jacobianos expertos de la R-lens, 25 prompts, con la evaluación multilingüe excluida del ajuste de pesos) y una J-lens ajustada con datos indicos (27 pasajes de Wikipedia en inglés y 8 lenguas indias). Se incluye además `router.pt`, un router k-means de 19 MB que asigna posiciones a los 8 clústeres de expertos, necesario solo para reajustar expertos.

El ajuste se realizó sobre los pesos fp32 del Hub del modelo base en el commit `071ae95e933605ca1104a6b4524a36a98488efa4`. Los ficheros de procedencia (`*_stamp.json`) registran argumentos exactos, hash git de jpp y marca temporal de cada etapa. No se han subido los Jacobianos por experto (`j_200p_experts.pt`, `r_moe_25p_experts.pt`, `j_indic_27p_experts.pt`, 5,4 GB cada uno en fp16), que serían necesarios para construir un J++ sobre J. Los datos de entrenamiento de las lentes son WikiText (Salesforce/wikitext) y Wikipedia (wikimedia/wikipedia); no hay información sobre RLHF ni DPO, al no ser un modelo generativo.

## Capacidades

- Lectura del flujo residual capa a capa: permite inspeccionar qué token es más probable en cada punto intermedio de la red, no solo en la salida final.
- Análisis de traducción multilingüe: cuantifica la presencia de la palabra inglesa en el top 10 durante la traducción indic→indic (97-100 % en capas 14-16 con lentes ajustadas).
- Comparación entre lenguas: al contar dentro del script propio de cada lengua, la palabra correcta en otras lenguas indias aparece en el top 10 en aproximadamente el 74 % de los ítems.
- Filtrado de lectura (`jpp`'s readout filtering): descarta tokens sin letra ni dígito antes de ordenar, lo que afecta a las tasas reportadas; un `topk(10)` crudo sobre el vocabulario completo no las reproduce.
- Verificación de integridad: script `verify_lenses.py` que comprueba sha256, formas y configuraciones de cada fichero.
- No soporta tool calling, agentes, visión ni audio: es un artefacto de análisis, no un modelo de propósito general.
- Capacidades multilingües limitadas a las nueve lenguas listadas (inglés y ocho indias).

## Casos de uso

- Auditoría de sesgo lingüístico en modelos multilingües: aplicar las lentes sobre Sarvam-30B para medir en qué capa emerge el inglés como representación intermedia en tareas de traducción entre lenguas indias, usando la J-lens indic-fit como referencia.
- Investigación en interpretabilidad mecanicista: estudiar el papel de los expertos enrutados comparando las lecturas de la R-lens (con grafo LRP) frente a la J-lens simple sobre los mismos prompts.
- Validación de pipelines de traducción: detectar si un modelo pivota por el inglés en producción y en qué capas, lo que informa decisiones de destilación o ajuste fino para evitar ese pivote.
- Docencia y reproducción de técnicas de *logit lens*: el repositorio incluye logs de cada ejecución y resultados crudos, lo que facilita replicar el experimento con otros modelos MoE.
- Desarrollo de herramientas de monitorización interna: integrar las lentes en un marco de observabilidad que lea estados intermedios del modelo durante inferencia para detectar derivas de representación.
- Diagnóstico de fallos de carga del modelo base: el script `smoke_test.py` y la comprobación de `inv_freq` sirven para verificar que RoPE está correctamente inicializado antes de cualquier análisis, evitando resultados inválidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card sí reporta métricas del estudio de interpretabilidad:

| Metrica | Valor reportado |
|---|---|
| Presencia de la palabra inglesa en top 10 (indic→indic, capas 14-16, lentes ajustadas) | 97-100 % de los ítems |
| Presencia de la palabra inglesa en top 10 (logit lens sin ajuste) | 93-95 % de los ítems |
| Palabra de otro concepto en inglés en top 10 | 0-3 % |
| Palabra correcta en otras lenguas indias en top 10 (contada por script) | ~74 % de los ítems |

Estas cifras se calculan tras el filtrado de lectura de `jpp` (descarte de tokens sin letra ni dígito); un `topk(10)` crudo no las reproduce.

## Requisitos de hardware

- VRAM para las lentes: cada fichero pesa 1,2 GB en fp32; las cuatro lentes suman unos 4,8 GB, más 19 MB del router. Re-guardadas en fp16 ocupan la mitad.
- VRAM para el modelo base: no disponible en la información proporcionada; el modelo es de 30B parámetros y el repositorio de lentes no incluye sus pesos.
- GPU recomendadas: no disponible para las lentes; para el modelo base se requiere hardware capaz de cargar 30B parámetros (no especificado).
- Ajuste de lentes en Sarvam-105B (mencionado como trabajo futuro): sus pesos bf16 (~212 GB) requieren dos H200 solo para cargar, y cada prompt de ajuste cuesta aproximadamente cuatro veces lo que en el 30B.
- Cabe en GPU de consumo: las lentes sí (4,8 GB en total); el modelo base, no disponible.
- Opciones de despliegue: las lentes se cargan con `torch.load(..., weights_only=True)` en el formato de `jpp_lens`; el modelo base debe cargarse con `sarvam_support.load_sarvam_lens_model` del repositorio de GitHub, no con `from_pretrained` de transformers 5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros conjuntos de lentes Jacobianas publicados para modelos indios con los que comparar directamente. La model card menciona un *tuned lens* para el modelo más pequeño Sarvam-1 (Indic-TunedLens, VarDial 2026), pero sin datos numéricos que permitan una comparación.

## Limitaciones y advertencias

- Advertencia crítica de carga: bajo transformers 5, el embedding rotatorio de Sarvam vuelve con `inv_freq` sin inicializar (`torch.empty_like`, normalmente todo ceros), porque transformers solo re-deriva buffers no persistentes para sus propias clases y Sarvam se distribuye como código custom del Hub. El modelo pierde información posicional, lee el prompt como bolsa de palabras y entra en bucle con decodificación greedy; no da error, pero toda lectura de las lentes es incorrecta. Observado con transformers 5.14.1; no comprobado en 4.x. Reportado a Sarvam AI el 2026-11-06 en la discusión #15 del Hub.
- Comprobación obligatoria: `hf_model.model.rotary_emb.inv_freq.abs().sum()` debe ser distinto de cero; la comprobación más segura compara con el valor recalculado desde `config.json`, como hace `code/smoke_test.py`.
- Interpretación de resultados: el hallazgo de que el inglés es la lengua más legible a mitad de red no implica que sea la única; contando por script, la palabra correcta en otras lenguas indias también aparece en el top 10 en torno al 74 % de los ítems.
- Reproducibilidad de métricas: las tasas top-10 dependen del filtrado de lectura de `jpp`; un `topk(10)` crudo sobre el vocabulario completo no las reproduce.
- Limitaciones de cobertura: las lentes solo cubren las capas 0-17 (la capa 18 no tiene lente) y el modelo base de 30B; no hay lentes para Sarvam-105B todavía.
- Ficheros no incluidos: los Jacobianos por experto (5,4 GB cada uno en fp16) no están subidos, por lo que no se puede construir un J++ sobre J sin solicitarlos en la pestaña Community.
- Licencia: Apache-2.0 permite uso comercial, pero debe respetarse el `NOTICE.md` con las atribuciones; el modelo base tiene su propia licencia, no detallada en la información disponible.
- Riesgo de alucinación: no aplica directamente al ser un artefacto de análisis, pero las lecturas de las lentes pueden inducir a error si se interpretan como la salida real del modelo sin validación.

## Enlaces

- Hugging Face: https://huggingface.co/arshkumarsingh/sarvam-lens
- Modelo base: https://huggingface.co/sarvamai/sarvam-30b
- Modelo Sarvam-105B: https://huggingface.co/sarvamai/sarvam-105b
- Artículo del autor: https://arshkumarsingh.com/writing/what-language-does-an-indian-ai-think-in
- Repositorio de código y resultados: https://github.com/arshkumarsingh/sarvam-lens
- Librería jpp_lens: https://github.com/safety-research/jpp_lens
- Discusión sobre el fallo de RoPE: https://huggingface.co/sarvamai/sarvam-30b/discussions/15
- Sarvam AI (Wikipedia): https://en.wikipedia.org/wiki/Sarvam_AI
- Sarvam AI (sitio oficial): https://www.sarvam.ai/
