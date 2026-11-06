# ckuma/lugbara-ensemble-translator

## Resumen

El modelo `ckuma/lugbara-ensemble-translator` es un sistema de traducción automática neuronal desarrollado por C. D. Akuma (Muni University, Uganda) como parte de su tesis de máster titulada *An Optimized Machine Translation Model for Low-Resource Lugbara Language* (octubre de 2025). Resuelve un problema concreto: la traducción entre inglés y dos lenguas ugandesas de bajos recursos, el lugbara (`lgg`) y el luganda (`lg`), para las que apenas existen sistemas de traducción de calidad. El modelo combina dos arquitecturas transformer preentrenadas, XLM-RoBERTa-base y mT5-base, en una única red de doble codificador con decodificador mT5 compartido.

La innovación principal es la fusión de codificadores (*dual-encoder fusion*, inspirada en Zhu et al., 2020): el decodificador mT5 atiende simultáneamente a los estados ocultos de ambos codificadores en cada paso de generación, y un vector aprendido de tipo de fuente indica al decodificador de qué codificador proviene cada estado. La tesis original determinó empíricamente que XLM-R era mejor para inglés→lugbara y mT5 para lugbara→inglés; este modelo fusiona ambos para cubrir las cuatro direcciones (inglés↔lugbara e inglés↔luganda).

El modelo se entrenó sobre el dataset SALT (Sunbird/salt) y se evaluó sobre una partición de test de 9312 pares de frases. Es relevante porque aborda un caso extremo de bajos recursos con una licencia permisiva (Apache 2.0) y un tamaño manejable (3,5 GB en el repositorio), aunque los resultados de calidad son modestos y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble codificador (XLM-RoBERTa-base + mT5-base) con decodificador mT5 fusionado |
| Parametros totales | no disponible (repo de 3,5 GB; componentes: XLM-R-base ~278M, mT5-base ~580M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | inglés (`en`), lugbara (`lgg`), luganda (`lg`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoders en `mt5/` y `xlmr/`, fusión en `fusion_head.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble fusionado de dos transformers: un codificador XLM-RoBERTa-base y un codificador mT5-base que procesan la misma frase fuente en paralelo. Las salidas de ambos codificadores se proyectan mediante una capa de proyección más LayerNorm y se combinan en una "memoria conjunta" (*joint memory*) sobre la que atiende el decodificador mT5. Un vector aprendido de tipo de fuente etiqueta cada estado según su codificador de origen, de modo que el decodificador puede distinguir la procedencia de la información. El modelo se entrena para las cuatro direcciones de traducción mediante etiquetas de control: `<2lgg>` (lugbara), `<2lug>` (luganda) y `<2en>` (inglés), con entrada en minúsculas tal como se usó en entrenamiento.

Los datos de entrenamiento provienen del dataset SALT (Sunbird/salt), y la evaluación se realizó sobre 9312 pares de frases (2328 por dirección). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; se trata de un fine-tuning supervisado de traducción. La innovación técnica destacable es la fusión de doble codificador con atención conjunta, que permite explotar las fortalezas complementarias de XLM-R y mT5 según la dirección de traducción, tal como se identificó en la tesis.

## Capacidades

- Traducción automática en cuatro direcciones: inglés→lugbara, lugbara→inglés, inglés→luganda y luganda→inglés, mediante etiquetas de control (`<2lgg>`, `<2lug>`, `<2en>`).
- Generación de texto traducido con decodificador autorregresivo mT5.
- Manejo de frases de dominio general (salud, gobierno, agricultura, vehículos) según los ejemplos de la model card.
- Entrada en minúsculas (requisito de entrenamiento; no se documenta robustez a mayúsculas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a los tres idiomas indicados; no se documenta transferencia a otras lenguas de bajos recursos.

## Casos de uso

- Traducción de documentación sanitaria al lugbara: el modelo puede traducir materiales de salud pública (por ejemplo, sobre VIH o equipos de protección) del inglés al lugbara, útil para ONG y ministerios que necesitan contenido localizado en zonas donde se habla lugbara.
- Localización de comunicados gubernamentales al luganda: permite traducir avisos oficiales y textos administrativos del inglés al luganda, aunque requiere revisión humana por la calidad limitada (BLEU 6,72).
- Traducción inversa de testimonios y encuestas: para organizaciones que recogen testimonios en lugbara o luganda y necesitan versiones en inglés, el modelo ofrece una primera pasada (BLEU 5,72–6,57) que puede acelerar el trabajo de traductores humanos.
- Preservación lingüística y corpus paralelos: el modelo puede generar borradores de pares de frases para ampliar corpus de lenguas de bajos recursos, siempre con validación por hablantes nativos.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible para experimentar con fusión de codificadores y comparar con XLM-R o mT5 individuales sobre SALT.
- Integración en pipelines de preprocesamiento multilingüe: al ser un modelo transformers con licencia Apache 2.0, puede desplegarse en servicios internos de traducción para normalizar texto en lugbara/luganda antes de otras tareas de NLP.

## Benchmarks y rendimiento

Resultados sobre la partición de test (9312 pares de frases; 2328 por dirección), según la model card:

| Direccion | BLEU ↑ | TER ↓ | Word F1 ↑ | chrF ↑ | BLEU modelo individual |
|---|---|---|---|---|---|
| Inglés → lugbara | 8,14 | 93,79 | 0,3536 | 35,22 | 0,0 (XLM-R solo) |
| Inglés → luganda | 6,72 | 88,93 | 0,277 | 36,52 | 0,0 (XLM-R solo) |
| Lugbara → inglés | 5,72 | 92,17 | 0,2566 | 26,53 | 12,71 (mT5 solo) |
| Luganda → inglés | 6,57 | 89,84 | 0,2736 | 27,27 | 16,65 (mT5 solo) |

La model card también cita puntuaciones de la tesis (medidas sobre su propio corpus, no sobre SALT, por lo que son solo referencia): 22,18 BLEU para inglés→lugbara con XLM-R ajustado y 25,41 BLEU para lugbara→inglés con mT5 ajustado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con componentes base (~278M + ~580M parámetros) y pesos en fp32, el repositorio ocupa 3,5 GB, por lo que se estima un consumo en torno a 4–8 GB en fp32 y menos con fp16/bf16, aunque no se documenta oficialmente.
- GPU recomendadas: no documentadas; por tamaño, una GPU consumer con 8–16 GB (RTX 3060/4070/4090) debería ser suficiente, pero no hay confirmación del autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de los componentes base, pero no está verificado en la model card.
- Opciones de despliegue: el modelo requiere código personalizado (`fusion_mt.py`, `lugbara_mt.py`) y no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptación; se usa vía `transformers` y `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ckuma/lugbara-ensemble-translator | XLM-R-base + mT5-base (fusionados) | no disponible | en, lg, lgg | Apache 2.0 | Doble codificador fusionado |
| FacebookAI/xlm-roberta-base (ajustado) | ~278M | 512 | multilingüe | MIT | Codificador único |
| google/mt5-base (ajustado) | ~580M | 512 | multilingüe | Apache 2.0 | Codificador-decodificador |
| NLLB-200 (variantes pequeñas) | 600M–1.3B | 512 | 200 idiomas | CC-BY-NC 4.0 | Traducción multilingüe |

La comparativa directa con NLLB-200 no está documentada en la información proporcionada; no se dispone de resultados de NLLB sobre SALT para lugbara/luganda. Los modelos individuales XLM-R y mT5 ajustados se usaron como referencia en la propia evaluación del autor.

## Limitaciones y advertencias

- Calidad de traducción baja: BLEU de 5,72–8,14 y TER superior a 88 en todas las direcciones; los ejemplos de la model card muestran traducciones con errores semánticos graves (por ejemplo, "pregnant women should be taught how to avoid hiv" para una frase sobre voces de mujeres y niñas).
- Riesgo alto de alucinación y deriva semántica: las salidas de ejemplo no conservan el significado de la referencia en varios casos.
- Requiere entrada en minúsculas; no se documenta comportamiento con mayúsculas, puntuación compleja o frases largas.
- Cobertura limitada a tres idiomas y a un dominio probablemente sesgado hacia el corpus SALT (salud, gobierno, agricultura).
- No es compatible de forma nativa con servidores de inferencia estándar (vLLM, TGI, Ollama); requiere código personalizado del repositorio.
- Sin datos publicados sobre sesgos demográficos o geográficos más allá del corpus de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la baja calidad hace imprescindible revisión humana en producción.
- No se documentan tokens de contexto máximos ni comportamiento con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckuma/lugbara-ensemble-translator
- Dataset SALT: https://huggingface.co/datasets/Sunbird/salt
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Modelo base mT5: https://huggingface.co/google/mt5-base
- Referencia técnica de fusión de codificadores: Zhu et al., 2020, *Incorporating BERT into Neural Machine Translation* (no se proporciona URL en la información disponible)
- Tesis de referencia: C. D. Akuma, *An Optimized Machine Translation Model for Low-Resource Lugbara Language*, MSc Computer Science, Muni University, octubre 2025 (no se proporciona URL)
