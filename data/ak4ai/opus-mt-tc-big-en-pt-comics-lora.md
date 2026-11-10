# Ak4ai/opus-mt-tc-big-en-pt-comics-lora

## Resumen

El modelo `Ak4ai/opus-mt-tc-big-en-pt-comics-lora` es un adaptador LoRA de traducción automática inglés → portugués de Brasil, desarrollado por el usuario Ak4ai. No es un modelo independiente: se aplica sobre el traductor neuronal `Helsinki-NLP/opus-mt-tc-big-en-pt`, basado en la arquitectura Marian (transformer encoder-decoder) del grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki. El adaptador añade 4,3 millones de parámetros entrenables (17 MB en safetensors) y especializa el modelo base en el registro lingüístico de diálogos de cómic.

El problema que aborda es la brecha entre la traducción genérica y la traducción de diálogos con nombres propios recurrentes, onomatopeyas y un estilo coloquial muy marcado. Para ello se ha ajustado sobre 1.503 pares de frases extraídos del webcómic *Pepper&Carrot* de David Revoy (licencia CC BY 4.0), emparejando el original inglés con la traducción humana al portugués brasileño.

Su relevancia es doble: por un lado, demuestra que un ajuste fino muy barato (una GPU de 6 GB, unos 5 minutos de entrenamiento) produce mejoras medibles y consistentes en un dominio estrecho; por otro, documenta con rigor metodológico (validación cruzada por episodio, eliminación de pares repetidos) los riesgos de sobreestimar el rendimiento en dominios con mucha repetición. Es un caso de estudio útil para quien evalúe adaptaciones LoRA de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) del modelo base; adaptador LoRA (PEFT) sobre las proyecciones de atención y feed-forward |
| Parametros totales | no disponible para el modelo base; el adaptador LoRA tiene 4,3 M parámetros entrenables (17 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar de transformers, pero no se documenta) |
| Idiomas soportados | inglés (en) y portugués (pt); el prefijo `>>pob<<` selecciona portugués de Brasil y `>>por<<` portugués de Portugal |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

El modelo base es un Marian de tipo transformer encoder-decoder, una arquitectura diseñada específicamente para traducción automática y entrenada originalmente por Helsinki-NLP. El adaptador LoRA se inserta con r = 16, alpha = 32 y dropout = 0,1 en las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`, es decir, tanto en la atención como en las capas feed-forward. La optimización usó AdamW con tasa de aprendizaje 2e-4, calentamiento y decaimiento lineal, lotes de 16 y precisión bf16, con parada anticipada (la mejor época fue la 2). El entrenamiento completo se ejecutó en una única GPU de 6 GB en aproximadamente 5 minutos.

Los datos de entrenamiento son 1.503 pares de frases EN/PT del webcómic *Pepper&Carrot*, tras eliminar créditos, líneas vacías, pares duplicados y frases de más de 200 caracteres. Cuatro episodios se reservaron exclusivamente para la parada anticipada. No se documenta el uso de RLHF ni DPO; se trata de un ajuste supervisado clásico sobre datos paralelos. La innovación metodológica destacable no está en la arquitectura, sino en la evaluación: validación cruzada por episodio (cada episodio aparece una vez en test y el modelo nunca ve el episodio que traduce), agrupada en 5 pliegues, y eliminación de frases idénticas entre train y test para evitar inflar las métricas.

## Capacidades

- Traducción automática de texto inglés → portugués, con especialización en registro coloquial y diálogos de cómic.
- Selección de variante dialectal mediante prefijo: `>>pob<<` para portugués de Brasil y `>>por<<` para portugués de Portugal.
- Reproducción del estilo y de los nombres propios recurrentes del webcómic *Pepper&Carrot* (personajes, onomatopeyas, expresiones fijas).
- Traducción por lotes con `padding=True` y decodificación por beams (`num_beams=4` en el ejemplo del autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un traductor seq2seq puro.
- Capacidad multilingüe limitada estrictamente al par en → pt; no se documenta soporte para otras lenguas.

## Casos de uso

- Traducción de cómics y webcómics con personajes recurrentes: el adaptador aprende los nombres y el registro de los personajes, por lo que es adecuado para serializar la traducción de una obra con continuidad narrativa y elenco estable.
- Localización de diálogos coloquiales en videojuegos indie o novelas visuales: el ajuste sobre habla directa (frases cortas, interjecciones, onomatopeyas) encaja mejor que un traductor genérico en textos de interfaz y bocadillos.
- Preprocesado de subtítulos para doblaje amateur: al trabajar con frases de menos de 200 caracteres y decodificación por beams, produce segmentos cortos y coherentes aptos para subtitulado.
- Evaluación de técnicas de adaptación de bajo coste: sirve como referencia reproducible (código, datos y análisis públicos en GitHub) para comparar LoRA frente a fine-tuning completo en dominios estrechos.
- Traducción asistida de fan translations: como paso previo a la revisión humana, reduce el esfuerzo en textos con jerga y nombres propios que un modelo genérico traduce de forma inconsistente.
- Investigación sobre evaluación en dominios con repetición: el model card documenta explícitamente cómo la repetición de frases entre train y test infla las métricas (19-28 % en el primer experimento), lo que lo convierte en un caso didáctico para diseñar protocolos de evaluación limpios.

## Benchmarks y rendimiento

Resultados de validación cruzada por episodio (chrF y BLEU frente a traducción humana), comparando el modelo base original con el ajustado:

| Grupo de episodios | Frases de test | chrF original → ajustado | BLEU original → ajustado |
|---|---|---|---|
| 1 | 249 | 30,3 → 32,9 (+2,6) | 13,9 → 18,0 |
| 2 | 430 | 49,4 → 55,3 (+5,8) | 30,0 → 39,0 |
| 3 | 242 | 38,2 → 43,1 (+4,9) | 20,3 → 28,9 |
| 4 | 288 | 57,9 → 63,2 (+5,3) | 35,7 → 45,5 |
| 5 | 339 | 49,5 → 54,0 (+4,6) | 31,8 → 40,6 |
| **Media** | | **45,1 → 49,7 (+4,6)** | **26,3 → 34,4 (+8,1)** |

En nota media por frase (1.538 frases de test, datos limpios): 56,5 → 64,3 (+7,8), con ganancia positiva en los 30 episodios con 10 o más frases de test (de +2,5 a +14,2). El autor indica que la ganancia no depende de que el modelo original sea débil en el episodio (r = 0,02). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 17 MB; el modelo base Marian debe cargarse completo en memoria, aunque su tamaño exacto no se documenta en la información disponible.
- El entrenamiento se realizó en una GPU de 6 GB, lo que indica que la inferencia cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 2070 o superiores.
- Para inferencia en CPU es viable gracias a la naturaleza seq2seq del modelo base, aunque no se documentan latencias ni throughput.
- Despliegue mediante `transformers` + `peft` (patrón mostrado en el model card). No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT sobre Marian, la integración con esos servidores requeriría fusionar el adaptador o usar soporte específico de PEFT.
- No se publican estimaciones de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ak4ai/opus-mt-tc-big-en-pt-comics-lora | 4,3 M entrenables (adaptador) + base Marian | no disponible | chrF 49,7 / BLEU 34,4 (media CV en *Pepper&Carrot*) | CC BY 4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-tc-big-en-pt (base) | no disponible | no disponible | chrF 45,1 / BLEU 26,3 (misma CV) | CC BY 4.0 | Hugging Face |
| Otros Marian OPUS-MT en→pt (p. ej. opus-mt-en-pt) | no disponible | no disponible | no disponible en esta información | CC BY 4.0 (habitual en OPUS-MT) | Hugging Face |

No se dispone de datos comparativos con traductores neuronales de mayor tamaño (NLLB, M2M-100, SeamlessM4T) en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se realizó sobre un único cómic traducido por pocos voluntarios: parte de la ganancia proviene de aprender nombres de personajes y el estilo de esos traductores concretos, y no debe extrapolarse automáticamente a otros textos.
- Las frases casi repetidas entre episodios ("Hmm...", onomatopeyas) pueden favorecer al modelo ajustado; el primer experimento tenía entre un 19 % y un 28 % de frases repetidas (créditos) y las métricas estaban infladas. Los resultados publicados eliminan frases idénticas entre train y test.
- El modelo final se entrenó con todos los datos; la calidad esperada procede de la validación cruzada, no de un test separado de este modelo concreto.
- chrF y BLEU no miden si el significado es correcto; la referencia humana tiene un estilo propio que las métricas no capturan.
- Se desconoce si el modelo base vio este cómic durante su preentrenamiento, lo que podría contaminar parcialmente la evaluación.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria a David Revoy (*Pepper&Carrot*), a los traductores al portugués de Brasil (Alexandre E. Almeida y Frederico Batista) y a Helsinki-NLP / University of Helsinki como autores del modelo base.
- Riesgo de alucinación en traducción: como todo modelo seq2seq, puede generar contenido plausible pero no fiel al original, especialmente fuera del dominio de diálogos de cómic.
- No hay información sobre sesgos demográficos o culturales específicos del adaptador.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Ak4ai/opus-mt-tc-big-en-pt-comics-lora
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Código, datos y análisis: https://github.com/Ak4ai/comic-mt-lora-ptbr
- Webcómic *Pepper&Carrot*: https://www.peppercarrot.com
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
