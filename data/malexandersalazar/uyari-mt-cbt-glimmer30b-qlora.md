# malexandersalazar/uyari-mt-cbt-glimmer30b-qlora

## Resumen

Uyari-mt-cbt-glimmer30b-qlora es un adaptador LoRA (rango 64, entrenado con QLoRA) sobre el modelo base `meta-models/Muse-Glimmer-30B`, desarrollado por malexandersalazar dentro del proyecto Uyari, una iniciativa abierta de datos y modelos para la traducción entre lenguas indígenas y lenguas oficiales. Su propósito concreto es la traducción bidireccional entre el shawi (chayahuita, ISO 639-3 `cbt`) y seis lenguas: español, inglés, francés, alemán, italiano y portugués, cubriendo las 12 direcciones posibles.

El modelo aborda un problema clásico de las lenguas de bajos recursos: la escasez de corpus paralelos y la práctica ausencia de cobertura en sistemas de traducción automática comerciales. En lugar de entrenar un modelo desde cero, el autor aprovecha las capacidades multilingües del modelo base de 30B y las especializa mediante un adaptador ligero, lo que reduce drásticamente el coste computacional del ajuste.

La relevancia actual reside en que el adaptador se distribuye en dos formatos (safetensors para PEFT y GGUF para llama.cpp), lo que permite desplegarlo en una única GPU de 24 GB con cuantización Q4_K_XL. La versión es la v0.4, entrenada el 2026-11-04 sobre el build de datos `data-2026.11-six`. El adaptador contiene 419.168.256 parámetros y el repositorio ocupa 2,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre transformer `meta-models/Muse-Glimmer-30B` |
| Parametros totales | 419.168.256 (adaptador); modelo base de 30B no incluido en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_XL para el base, `adapter.gguf` para el adaptador); safetensors en precisión original del adaptador |
| Idiomas soportados | cbt (shawi/chayahuita), es, en, fr, de, it, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema LoRA de bajo rango (rank 64) aplicado sobre las capas del modelo base Muse-Glimmer 30B, un transformer de 30.000 millones de parámetros del que no se detallan en la información disponible ni la composición del dataset de preentrenamiento ni el contexto máximo. El ajuste se realizó con QLoRA, es decir, cuantizando el modelo base a 4 bits durante el entrenamiento para reducir los requisitos de memoria, mientras el adaptador se entrena en precisión superior.

Los datos de entrenamiento provienen del build `data-2026.11-six` del proyecto Uyari, un conjunto paralelo que cubre las 12 direcciones entre shawi y las seis lenguas oficiales. No se especifica en la información proporcionada el número de pares de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO; el pipeline declarado es exclusivamente de traducción supervisada. La innovación principal es de índole práctica: un adaptador ligero que especializa un modelo grande en una lengua de muy bajos recursos y que se puede servir con llama.cpp junto al base cuantizado.

## Capacidades

- Traducción bidireccional en las 12 direcciones entre shawi y español, inglés, francés, alemán, italiano y portugués.
- Traducción desde y hacia una lengua indígena de bajos recursos (chayahuita), incluyendo la dirección shawi → lenguas oficiales, que suele ser la más difícil por la morfología aglutinante de la lengua origen.
- Instrucciones de sistema para forzar traducción fiel sin añadir ni omitir información, mediante prompts que nombran explícitamente las lenguas.
- Compatibilidad con el parámetro `reasoning_strength` del modelo base (configurable a `low` en llama.cpp), heredado de Muse-Glimmer 30B.
- Herencia de las capacidades generales del modelo base de 30B (generación de texto, razonamiento), aunque el adaptador está especializado en traducción.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio para este adaptador.

## Casos de uso

- Traducción de documentación oficial y materiales administrativos al shawi: el adaptador permite convertir textos del español a la lengua indígena manteniendo la fidelidad exigida por el prompt de sistema, útil para administraciones con obligaciones de publicación bilingüe.
- Localización de material educativo: traducción de contenidos escolares del español o del inglés al shawi para programas de educación intercultural bilingüe, aprovechando la dirección español → shawi (chrF++ 41,7).
- Preservación y digitalización de patrimonio oral: transcripción y traducción de testimonios en shawi hacia español o inglés (BLEU 22,61 y 24,44 respectivamente), para archivos lingüísticos y etnográficos.
- Atención ciudadana en lengua indígena: despliegue con llama.cpp en una GPU de 24 GB para traducir consultas de hablantes de shawi a español y devolver respuestas en shawi, en servicios públicos de regiones amazónicas.
- Investigación lingüística comparada: generación de traducciones de referencia en seis lenguas europeas para estudios de tipología y morfología del chayahuita, con la ventaja de disponer de un único adaptador para todas las direcciones.
- Evaluación de sistemas de traducción de bajos recursos: el adaptador sirve como línea base reproducible (build `data-2026.11-six`, split de test) para comparar con el modelo NLLB-200 destilado 1.3B del mismo proyecto.
- Integración en pipelines de subtitulado o traducción de contenidos audiovisuales en comunidades shawi-hablantes, sirviendo el adaptador mediante la API compatible con OpenAI de `llama-server`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el split de test de `Uyari data-2026.11-six`:

| Dirección | chrF++ | BLEU |
|---|---|---|
| Español → shawi | 41,70 | 6,02 |
| Inglés → shawi | 40,87 | 5,52 |
| Francés → shawi | 39,89 | 5,19 |
| Alemán → shawi | 40,92 | 5,47 |
| Italiano → shawi | 41,12 | 5,65 |
| Portugués → shawi | 41,31 | 6,45 |
| Shawi → español | 44,42 | 22,61 |
| Shawi → inglés | 44,86 | 24,44 |
| Shawi → francés | 44,88 | 22,47 |
| Shawi → alemán | 43,36 | 19,87 |
| Shawi → italiano | 43,76 | 20,62 |
| Shawi → portugués | 41,92 | 18,57 |

El patrón es consistente: las direcciones shawi → lenguas oficiales obtienen BLEU entre 18,57 y 24,44, mientras que las direcciones lenguas oficiales → shawi caen a 5,19-6,45 pese a mantener chrF++ en torno a 40. Esa asimetría es típica de la traducción hacia lenguas morfológicamente ricas y de bajos recursos, donde el BLEU penaliza la variación en la superficie. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la propia model card.

## Requisitos de hardware

- VRAM estimada: el autor indica que la configuración con llama.cpp «cabe en una GPU de 24 GB» usando el base en `UD-Q4_K_XL` más el adaptador GGUF. El adaptador safetensors por sí solo ocupa aproximadamente 1,7 GB en FP16 (419 M de parámetros).
- GPU recomendadas: RTX 4090 (24 GB) o A10G (24 GB) para la configuración Q4_K_XL documentada; A100 40/80 GB o H100 para servir el base en mayor precisión o con mayor concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización Q4_K_XL; no cabe en GPUs de 8-16 GB con el base de 30B.
- Opciones de despliegue: llama.cpp / `llama-server` (documentado, con `--lora adapter.gguf -ngl 999`), PEFT con Transformers para cargar `adapter_model.safetensors`, y vLLM o TGI con soporte de adaptadores LoRA (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uyari-mt-cbt-glimmer30b-qlora | 419 M (adaptador) sobre 30B | no disponible | LoRA QLoRA sobre Muse-Glimmer 30B | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| uyari-mt-cbt-nllb1.3b | 1,3 B | no disponible | Fine-tuning de NLLB-200 destilado | CC BY-NC 4.0 | HuggingFace |
| NLLB-200 (Meta) | 600 M - 54 B | 512 tokens (variantes estándar) | Transformer encoder-decoder multilingüe | CC BY-NC 4.0 | HuggingFace |

La alternativa directa es `uyari-mt-cbt-nllb1.3b`, del mismo autor y proyecto: mucho más pequeño (1,3 B frente a 30 B) pero con licencia CC BY-NC 4.0, que impide uso comercial, frente a la Apache 2.0 del adaptador Glimmer. No se dispone en la información proporcionada de los resultados del modelo NLLB del proyecto para comparar métricas directamente.

## Limitaciones y advertencias

- Los benchmarks están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de tomar decisiones de producción.
- El BLEU en las direcciones lenguas oficiales → shawi es bajo (5-6), lo que indica que la generación hacia shawi es frágil y puede producir formas agramaticales o préstamos; no es adecuada sin revisión humana para publicación.
- El adaptador requiere el modelo base Muse-Glimmer 30B, cuyos datos de entrenamiento, sesgos y contexto máximo no se documentan en la información disponible; hereda cualquier sesgo del base.
- Riesgo de alucinación y de omisión de información en textos largos: aunque el prompt de sistema exige fidelidad, no hay garantía técnica de que se respete.
- La licencia Apache 2.0 cubre el adaptador, pero el uso del modelo base queda sujeto a la licencia de `meta-models/Muse-Glimmer-30B`, que no se especifica en la información disponible.
- Cobertura limitada a siete idiomas y a la variedad de shawi representada en el corpus `data-2026.11-six`; variantes dialectales o registro oral pueden degradar el rendimiento.
- Sin datos publicados sobre latencia, throughput ni comportamiento con prompts largos; el despliegue en producción requiere pruebas propias de capacidad y concurrencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malexandersalazar/uyari-mt-cbt-glimmer30b-qlora
- Repositorio del proyecto Uyari: https://github.com/malexandersalazar/uyari
- Documentación de la lengua shawi (cbt_Latn): https://github.com/malexandersalazar/uyari/blob/main/languages/cbt_Latn/README.md
- Modelo alternativo del proyecto (NLLB-200 destilado 1.3B): https://huggingface.co/malexandersalazar/uyari-mt-cbt-nllb1.3b
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- GGUF del modelo base: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
