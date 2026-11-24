# bivariant/griot-mt

## Resumen
Griot-MT es un modelo de traducción automática multilingüe desarrollado por Bivariant, orientado específicamente a lenguas africanas de bajos recursos. Cubre 18 idiomas africanos en traducción bidireccional con el francés, lo que supone 36 direcciones de traducción con una cobertura del 100 %. Se distribuye como un modelo base multilingüe compartido de aproximadamente 1.394 millones de parámetros más un adaptador LoRA/RSLoRA independiente por idioma de unos 23,6 millones de parámetros entrenables (en torno al 1,69 % del modelo base), junto con un tokenizer compartido.

La relevancia del modelo radica en su cobertura: sistemas establecidos como NLLB-200 1.3B o Google Cloud Translation no cubren la totalidad de las 36 direcciones evaluadas (26/36 y 28/36 respectivamente), mientras que Griot-MT las cubre todas. En las direcciones con soporte común, el modelo reporta mejoras sustanciales de calidad respecto a ambas alternativas.

Arquitectónicamente se apoya en la familia M2M-100 (seq2seq, text2text-generation) con adaptación mediante PEFT/LoRA, lo que permite mantener un único modelo base de 1,37 mil millones de parámetros y conmutar entre idiomas cargando el adaptador correspondiente. El repositorio ocupa 4,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (familia M2M-100) con adaptadores LoRA/RSLoRA por idioma |
| Parametros totales | 1.370.656.768 (modelo base compartido) |
| Parametros activos | No aplica (no es MoE); ~23,6 millones entrenables por adaptador LoRA (~1,69 % del base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/INT8/INT4) |
| Idiomas soportados | 18 lenguas africanas (bba, bci, dyu, ewe, ewo, fon, fub, hau, lin, lug, mos, mwm, orm, sag, sna, som, swh, wol) en ambas direcciones con francés (fra_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base + adaptadores PEFT en `adapters/<codigo>/`) |

## Arquitectura y entrenamiento
Griot-MT se construye sobre un modelo multilingüe compartido de tipo encoder-decoder de aproximadamente 1.394 millones de parámetros, coherente con la arquitectura M2M-100 indicada en las etiquetas del repositorio (`m2m_100`, `text2text-generation`). Sobre ese modelo base se entrena un adaptador LoRA/RSLoRA independiente por cada uno de los 18 idiomas, con unos 23,6 millones de parámetros entrenables por adaptador. La release incluye además un tokenizer compartido que emplea tokens de idioma en formato tipo NLLB (`fon_Latn`, `fra_Latn`, etc.) para controlar la dirección de traducción mediante `src_lang` y `forced_bos_token_id`.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta de los corpus paralelos, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.). La innovación principal declarada es la organización de la release: un único modelo base con adaptadores por idioma, lo que reduce el coste de almacenamiento y despliegue frente a mantener 18 modelos completos.

## Capacidades
- Traducción bidireccional entre 18 lenguas africanas y francés, cubriendo 36 direcciones con cobertura del 100 %.
- Traducción de texto en modalidad seq2seq pura (text2text-generation); no se documentan capacidades multimodales.
- Conmutación de idioma mediante tokens de código de lengua (`bba_Latn`, `wol_Latn`, `fra_Latn`, etc.) y adaptadores LoRA cargados bajo demanda.
- Soporte multilingüe limitado al par lengua africana-francés; no se documenta traducción directa entre dos lenguas africanas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.

## Casos de uso
- Traducción de documentación oficial y administrativa al francés: el modelo permite convertir textos de lenguas como el wolof, el bambara (dyu) o el fon al francés con un BLEU medio de 48,01 en la dirección lengua africana → francés, adecuado para flujos de revisión humana posteriores.
- Localización de contenidos digitales hacia lenguas africanas: la dirección francés → lengua africana (28,20 BLEU) sirve para borradores de artículos, guiones o material educativo que después revisa un hablante nativo.
- Atención al ciudadano en servicios públicos: despliegue de un endpoint de traducción que reciba consultas en swahili, hausa o lingala y las devuelva en francés para agentes que no dominan esos idiomas.
- Investigación lingüística y creación de corpus: generación de traducciones sintéticas para aumentar datasets paralelos en lenguas de bajos recursos, con control de calidad mediante chrF++ (58,00 global).
- Integración en pipelines de NLP multilingüe: uso como etapa de traducción previa a clasificadores o sistemas de extracción de información entrenados solo en francés, aprovechando el formato transformers y la compatibilidad con endpoints.
- Preservación y difusión de lenguas minoritarias: traducción de material cultural, religioso o literario en lenguas como ewondo, sango o mooré, donde las alternativas comerciales no ofrecen cobertura.
- Despliegue en infraestructura modesta: al requerir un modelo base de 1,37 mil millones de parámetros más un adaptador pequeño, es viable en una única GPU consumer con precisión fp16, a diferencia de modelos multilingües de mayor tamaño.

## Benchmarks y rendimiento
Evaluación con SacreBLEU BLEU (`tokenize=13a`) y chrF++ (`word_order=2`) sobre 3 sistemas × 18 lenguas × 2 direcciones = 108 unidades de evaluación. Las direcciones no soportadas reciben BLEU = 0 y chrF++ = 0 en el score global coverage-aware.

| Sistema | BLEU | chrF++ | Direcciones soportadas | Cobertura |
|---|---:|---:|---:|---:|
| Griot-MT | 38,11 | 58,00 | 36/36 | 100,00 % |
| NLLB-200 1.3B | 16,13 | 33,53 | 26/36 | 72,22 % |
| Google Cloud Translation | 15,03 | 33,97 | 28/36 | 77,78 % |

Calidad restringida a las direcciones soportadas por cada sistema:

| Sistema | BLEU | chrF++ | Direcciones evaluadas |
|---|---:|---:|---:|
| Griot-MT | 38,11 | 58,00 | 36 |
| NLLB-200 1.3B | 22,34 | 46,43 | 26 |
| Google Cloud Translation | 19,33 | 43,68 | 28 |

Comparación matched-support (mismas direcciones para ambos sistemas):

| Comparación | Griot-MT BLEU | Griot-MT chrF++ | Baseline BLEU | Baseline chrF++ | Ganancia |
|---|---:|---:|---:|---:|---|
| vs NLLB-200 1.3B (26 direcciones) | 40,63 | 60,41 | 22,34 | 46,43 | +18,29 BLEU / +13,98 chrF++ |
| vs Google Cloud Translation (28 direcciones) | 39,59 | 59,58 | 19,33 | 43,68 | +20,26 BLEU / +15,91 chrF++ |

Desglose por dirección:

| Dirección | BLEU | chrF++ |
|---|---:|---:|
| Lengua africana → francés | 48,01 | 64,20 |
| Francés → lengua africana | 28,20 | 51,80 |

## Requisitos de hardware
- VRAM estimada para inferencia: en fp16, el modelo base de 1,37 mil millones de parámetros ocupa aproximadamente 2,7-3 GB de pesos; con overhead de activaciones y KV cache, se estima un uso de 4-6 GB para secuencias cortas o medias. En fp32, en torno a 5,5 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070). Para mayor throughput en servidor, A100, H100, L40S o A10G.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en fp16. En CPU funciona en fp32, con latencia mucho mayor.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), integración en endpoints compatibles de Hugging Face. No se documenta soporte explícito de vLLM, TGI, llama.cpp u Ollama; llama.cpp requeriría conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: cada idioma requiere cargar su adaptador LoRA desde `adapters/<codigo>/`; para servir varios idiomas conviene precargar adaptadores o mantener varias instancias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (cobertura completa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Griot-MT | 1,37 B base + 23,6 M por adaptador | No disponible | 38,11 (36/36 direcciones) | Apache 2.0 | Hugging Face (pesos abiertos) |
| NLLB-200 1.3B | 1,3 B | No disponible en la información | 16,13 con cobertura 26/36; 22,34 en sus 26 direcciones | CC-BY-NC 4.0 (uso no comercial) | Hugging Face (pesos abiertos) |
| Google Cloud Translation | No disponible (servicio propietario) | No disponible | 15,03 con cobertura 28/36; 19,33 en sus 28 direcciones | Propietaria (API de pago) | Servicio en la nube |

Griot-MT destaca por combinar cobertura completa de las 36 direcciones con licencia Apache 2.0, frente a la restricción no comercial de NLLB-200 y la naturaleza propietaria de Google Cloud Translation. En las direcciones con soporte común, la ventaja declarada es de más de 18 puntos de BLEU frente a NLLB-200 1.3B.

## Limitaciones y advertencias
- Los benchmarks son autoinformados por el autor; no se dispone de una evaluación independiente en la información proporcionada.
- El modelo solo traduce entre lenguas africanas y francés; no se documenta traducción directa entre dos lenguas africanas ni con otros idiomas puente.
- La dirección francés → lengua africana rinde notablemente peor (28,20 BLEU) que la inversa (48,01 BLEU), lo que desaconseja su uso sin revisión humana en generación hacia lenguas africanas.
- Riesgo de alucinación y de traducciones fluentes pero semánticamente incorrectas, especialmente en dominios especializados o textos con terminología técnica, dado el carácter de bajos recursos de varios de los idiomas.
- Sesgos potenciales derivados de los corpus paralelos de entrenamiento (composición, registro y variedades dialectales no documentadas); no se detalla la composición del dataset.
- Longitud de contexto no documentada: textos largos pueden requerir truncado o segmentación manual.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales del autor sobre los datos de entrenamiento.
- La release depende de versiones concretas de librerías (transformers 5.16.1, peft 0.20.0, accelerate 1.14.0); incompatibilidades de versión pueden romper la carga de adaptadores.
- El token de Oromo se mapea a `gaz_Latn` en el código de ejemplo, lo que puede inducir a error si se asume `orm_Latn`; conviene verificar el mapeo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/bivariant/griot-mt
- Visualizaciones de benchmarks: https://huggingface.co/bivariant/griot-mt/tree/main/benchmarks/visualizations
- Adaptadores por idioma: https://huggingface.co/bivariant/griot-mt/tree/main/adapters
- PEFT (librería de adaptadores LoRA): https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
- NLLB-200 (modelo comparado): https://huggingface.co/facebook/nllb-200-1.3B
- Google Cloud Translation: https://cloud.google.com/translate
