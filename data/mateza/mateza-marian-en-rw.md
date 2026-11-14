# mateza/mateza-marian-en-rw

## Resumen

Mateza Marian en↔rw es un modelo de traducción automática neuronal especializado en el par de idiomas inglés-kinyarwanda (en↔rw), desarrollado por Promesse Rukundo y Mateza Kayondo bajo el paraguas del proyecto Mateza. Se trata de un transformer encoder-decoder de arquitectura Marian, con 60.554.496 parámetros (aproximadamente 61M), que unifica ambas direcciones de traducción en un único modelo mediante etiquetas de control al inicio de la secuencia (`<src_en><tgt_rw>` o `<src_rw><tgt_en>`). Esto supone una mejora de eficiencia frente a la versión anterior (OPUS-FT v3), que requería dos modelos separados de 75M cada uno.

El modelo se ha obtenido mediante destilación de conocimiento y un ajuste fino posterior sobre datos paralelos de dominio específico (legal, sanitario, educativo y COVID-19), partiendo de un estudiante Marian destilado. Su relevancia actual radica en que ofrece una calidad sustancialmente superior a la de los modelos OPUS-FT v3 de los que aprende, con un chrF++ medio de 46,52 en FLORES+ devtest (beam 4), lo que representa +4,9 puntos sobre la base, manteniendo un tamaño reducido (242 MB en fp32) que facilita su despliegue en entornos con recursos limitados.

Con licencia Apache-2.0 para los pesos, el modelo está pensado para aplicaciones de traducción en contextos de Rwanda, donde el kinyarwanda es lengua oficial, y cubre necesidades prácticas como traducción de documentación administrativa, materiales sanitarios o contenidos educativos, aunque con limitaciones documentadas en cuanto a expresiones temporales y saludos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 60.554.496 (aprox. 61M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en fp32; se menciona fp16 en GPU) |
| Idiomas soportados | en, rw (entrenados); vocabulario reserva para fr, ar, sw, lg, zh_Hans sin entrenar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian Transformer, un encoder-decoder estándar para traducción automática, con 61M de parámetros totales. La innovación principal reside en la unificación de ambas direcciones de traducción en un solo modelo mediante etiquetas de control (`<src_en>`, `<tgt_rw>`, `<src_rw>`, `<tgt_en>`) que se anteponen a la secuencia de entrada. El tokenizador no añade estas etiquetas automáticamente, por lo que deben insertarse manualmente al usar `transformers` directamente.

El entrenamiento parte de un estudiante Marian destilado (con un chrF++ medio de 42,95 en FLORES+ devtest antes del ajuste fino) y se realiza un ajuste fino sobre datos paralelos de múltiples fuentes: `DigitalUmuganda/NMT_Rwandan-Gazette_parallel_data_en_kin`, `DigitalUmuganda/NMT_Health_parallel_data_en_kin`, `DigitalUmuganda/kinyarwanda-english-machine-translation-dataset`, `mbazaNLP/NMT_Education_parallel_data_en_kin`, `Kira-Floris/cross-lingual-translation-en-kin-parquet`, `google/smol`, `gmnlp/tico19`, `mateza/ice-block-curated-packs` y `allenai/nllb`. No se especifica el número exacto de tokens de entrenamiento ni si hubo RLHF/DPO; los informes de entrenamiento están disponibles en `train-report.json` y `data-report.json` del repositorio. El proceso de destilación de conocimiento desde los modelos OPUS-FT v3 (dos modelos de 75M) hacia un único modelo de 61M es la técnica destacable, junto con el ajuste fino por dominios que eleva notablemente el rendimiento en dominios específicos (por ejemplo, de 35,51 a 58,53 chrF++ en el dominio legal en→rw).

## Capacidades

- Traducción bidireccional inglés-kinyarwanda en un único modelo, seleccionando la dirección mediante etiquetas de control.
- Generación de texto de traducción con decodificación greedy o beam search (beam 4 mejora aproximadamente 0,5 chrF++ a costa de mayor latencia).
- Procesamiento por lotes: el método `translate` acepta listas de cadenas.
- Interfaz de línea de comandos (`translator.py`) y API de Python (`Translator`).
- Integración con la librería `transformers` mediante `AutoModelForSeq2SeqLM` y `AutoTokenizer`.
- Soporte de GPU con fp16 automático si está disponible.
- Capacidad multilingüe limitada a en y rw (el vocabulario incluye etiquetas para otros idiomas pero no están entrenadas).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de documentación legal y administrativa: el modelo alcanza 58,53 chrF++ en el dominio legal (Rwandan Gazette) en en→rw, lo que lo hace adecuado para traducir textos normativos y boletines oficiales, aunque se recomienda revisión humana por la sensibilidad del contenido.
- Localización de materiales sanitarios: con 66,18 chrF++ en el dominio de salud (en→rw), puede emplearse para traducir folletos, instrucciones médicas y campañas de salud pública, si bien no debe usarse sin revisión en contextos clínicos.
- Traducción de contenidos educativos: rendimiento de 63,36 chrF++ en en→rw en el dominio educativo, útil para adaptar materiales didácticos y recursos escolares al kinyarwanda.
- Comunicación sobre COVID-19 y salud pública: el conjunto TICO-19 muestra 42,81 chrF++ en en→rw, lo que permite traducir comunicados y guías sanitarias de forma rápida.
- Traducción inversa rw→en para documentación local: con 56,22 chrF++ en el dominio legal y 63,15 en salud, sirve para convertir documentos redactados en kinyarwanda a inglés para audiencias internacionales.
- Integración en pipelines de traducción automática: al ser un modelo pequeño (242 MB) y compatible con `transformers`, puede desplegarse en servicios de traducción de bajo coste, procesamiento por lotes de corpus o como componente en aplicaciones web y móviles.
- Traducción de conversaciones y frases cotidianas: los ejemplos de la model card muestran traducciones correctas de saludos y frases simples, adecuado para asistentes de chat o aplicaciones de aprendizaje de idiomas, con cautela en expresiones temporales.

## Benchmarks y rendimiento

FLORES+ devtest (1.012 frases por dirección):

| Decodificación | Dirección | chrF++ | BLEU | OPUS-FT v3 chrF++ |
|---|---|---:|---:|---:|
| greedy | en→rw | 47,07 | 18,49 | 41,49 |
| greedy | rw→en | 44,98 | 20,37 | 40,12 |
| beam 4 | en→rw | 47,60 | 19,00 | 42,60 |
| beam 4 | rw→en | 45,43 | 20,78 | 40,69 |

Evolución del chrF++ medio (beam 4):

| Modelo | chrF++ medio |
|---|---:|
| Mateza Nova Pocket (250M) | 14,41 |
| OPUS-FT v3 (dos modelos, 75M cada uno) | 41,64 |
| Marian student antes del ajuste fino | 42,95 |
| Este modelo | 46,52 |

Conjuntos de prueba por dominio (500 frases retenidas, chrF++ greedy):

| Conjunto de prueba | en→rw antes → después | rw→en antes → después |
|---|---|---|
| Rwandan Gazette (legal) | 35,51 → 58,53 | 33,34 → 56,22 |
| Health | 46,61 → 66,18 | 39,34 → 63,15 |
| Education | 60,27 → 63,36 | 49,11 → 52,42 |
| TICO-19 test (COVID-19) | 38,83 → 42,81 | 36,55 → 41,68 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 61M de parámetros, los pesos en fp32 ocupan aproximadamente 242 MB; en fp16, alrededor de 121 MB. La VRAM necesaria para inferencia es muy baja, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo se ejecuta en CPU sin problemas y en GPU (fp16) si está disponible. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de gama baja.
- Opciones de despliegue: `transformers` (con `AutoModelForSeq2SeqLM`), el script `translator.py` incluido, y potencialmente `llama.cpp` u otras herramientas si se convierten los pesos, aunque no se documenta explícitamente. Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no se proporcionan datos concretos; el uso de beam 4 es descrito como "aproximadamente 0,5 chrF++ mejor, más lento" que greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ medio (FLORES+ devtest, beam 4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mateza Marian en↔rw (este modelo) | 61M | No disponible | 46,52 | Apache-2.0 | Hugging Face |
| OPUS-FT v3 (en→rw y rw→en, dos modelos) | 75M cada uno | No disponible | 41,64 | No disponible | No disponible en la información |
| Marian student (base destilada) | No disponible | No disponible | 42,95 | No disponible | No disponible en la información |
| Mateza Nova Pocket | 250M | No disponible | 14,41 | No disponible | No disponible en la información |

## Limitaciones y advertencias

- Las horas del reloj son poco fiables: el sistema tradicional ruandés cuenta desde las 6 de la mañana ("saa munani" = 2 de la tarde), y el modelo comete errores en horas, fechas y números.
- Algunos saludos siguen siendo débiles en rw→en; por ejemplo, "Muramuke" se traduce como "Next".
- No hay revisión por hablantes nativos: las puntuaciones son métricas automáticas y no se debe usar la salida sin revisar en contextos médicos, legales u otros de alto riesgo.
- El modelo solo está entrenado para en y rw; las etiquetas de otros idiomas (fr, ar, sw, lg, zh_Hans) están reservadas para versiones futuras y no deben usarse.
- El tokenizador no añade las etiquetas de idioma automáticamente, lo que puede provocar errores si se usa `transformers` sin insertarlas manualmente.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos, pero al ser un modelo de traducción entrenado con datos paralelos, puede reflejar sesgos presentes en las fuentes.
- Licencia Apache-2.0 para los pesos; los datos de entrenamiento tienen sus propias atribuciones que deben consultarse en la sección "Data and attribution" de la model card.
- Los resultados por dominio son en-domain (mismas fuentes que el entrenamiento), por lo que FLORES+ es la medida más justa para evaluar la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mateza/mateza-marian-en-rw
- Informe de evaluación FLORES+: `eval/REPORT.md` y `eval/summary.json` en el repositorio
- Informe por dominios: `eval/DOMAINS.md` y `eval/domains.json` en el repositorio
- Frases de prueba: `eval/probes.tsv` en el repositorio
- Informe de entrenamiento: `eval/train-report.json` y `eval/data-report.json` en el repositorio
- Script de traducción: `translator.py` en el repositorio
