# northlight-ai/finbert-esg-multilingual-small

## Resumen

finbert-esg-multilingual-small es un clasificador de texto multilingüe especializado en temática ESG (ambiental, social y de gobernanza), desarrollado por Pankaj Garg en Northlight. Resuelve el problema de clasificar automáticamente frases y documentos financieros en las cuatro categorías de la taxonomía ESG (None, Environmental, Social, Governance), manteniendo compatibilidad total con las etiquetas y el orden de `yiyanghkust/finbert-esg`, lo que permite sustituirlo en código existente con una sola línea.

El modelo se construye sobre `jhu-clsp/mmBERT-small` (arquitectura ModernBERT), con 140,6 millones de parámetros y una ventana de contexto de 8.192 tokens (aunque el entrenamiento usó 256). Frente a FinBERT original, añade cobertura multilingüe real (inglés, alemán, francés, español, chino y japonés, entre otros) y una licencia MIT que elimina las restricciones de uso comercial del modelo original.

Su relevancia actual radica en que permite desplegar análisis ESG automatizado en informes de sostenibilidad y noticias financieras multilingües sin depender de modelos propietarios ni de licencias restrictivas, con un rendimiento declarado que supera a FinBERT-ESG en +7,9 puntos de macro-F1 en inglés y +53,4 puntos en español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.643.076 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenamiento con 256) |
| Tipos de cuantizacion | no disponible (se distribuyen safetensors y ONNX) |
| Idiomas soportados | en, de, fr, es, zh, ja, multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de tamaño small, inicializado desde `jhu-clsp/mmBERT-small` y adaptado como cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). ModernBERT introduce mejoras sobre BERT clásico como atención con rotación posicional (RoPE), capas de atención alternando atención local y global, y un tokenizador actualizado; esto implica que el código debe usar las clases `Auto*` de transformers y una versión con soporte de ModernBERT (probado con transformers 5.20.2 y torch 2.14).

El entrenamiento se realizó sobre los datasets `HuggingFaceFW/fineweb` y `HuggingFaceFW/fineweb-2` (datos web multilingües), con destilación desde etiquetas de profesor (teacher labels) y selección del checkpoint por pérdida de validación sobre dichas etiquetas, no sobre los conjuntos de test humanos. Se entrenó una única vez con semilla 19. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable a un clasificador). La innovación principal es la compatibilidad drop-in con FinBERT-ESG (mismas cadenas de etiqueta y mismo orden) combinada con multilingüismo y licencia permisiva.

## Capacidades

- Clasificación de texto en cuatro clases ESG: None (0), Environmental (1), Social (2), Governance (3).
- Compatibilidad directa con el pipeline `text-classification` de transformers y con el esquema de etiquetas de `yiyanghkust/finbert-esg`.
- Procesamiento multilingüe: inglés, alemán, francés, español, chino, japonés y otros idiomas cubiertos por mmBERT.
- Manejo de contexto largo de hasta 8.192 tokens (aunque el entrenamiento se hizo con 256, por lo que el rendimiento en secuencias muy largas no está validado en la información disponible).
- Exportación a ONNX para inferencia en navegador mediante transformers.js (demo pública disponible).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Clasificación de informes de sostenibilidad: procesar párrafos de memorias corporativas y etiquetar cada frase como Environmental, Social o Governance para construir índices de divulgación ESG; el contexto de 8.192 tokens permite analizar secciones completas sin truncar.
- Monitorización de noticias financieras multilingües: filtrar titulares y artículos en español, inglés, alemán o francés para detectar eventos ESG relevantes y alimentar alertas de riesgo reputacional.
- Sustitución directa de FinBERT-ESG en pipelines existentes: cambiar el identificador del modelo en el código (usando clases `Auto*`) sin modificar la lógica de lectura de etiquetas, obteniendo además cobertura multilingüe y licencia MIT.
- Análisis de carteras de inversión: clasificar comunicados y transcripciones de empresas en varios idiomas para puntuar su exposición ESG y alimentar modelos de scoring.
- Cumplimiento normativo (CSRD, SFDR): etiquetar automáticamente la documentación regulatoria de empresas europeas en distintos idiomas para verificar la cobertura de disclosures obligatorios.
- Investigación académica en finanzas sostenibles: generar variables ESG a escala sobre corpus multilingües con un modelo ligero (140M parámetros) que puede ejecutarse en CPU para experimentos reproducibles.
- Procesamiento en el navegador o en el edge: gracias a la exportación ONNX y la demo con transformers.js, se puede desplegar clasificación ESG en cliente sin backend.

## Benchmarks y rendimiento

Resultados declarados por el autor (macro-F1 de cuatro clases, inferencia bf16 en GPU, batch 64, longitud máxima 512). Los intervalos de confianza son bootstraps pareados sobre informes o identificadores de empresa.

| Conjunto | Idioma | Etiquetas | n | FinBERT-ESG | Este modelo | Δ (IC 95%) |
|---|---|---|---:|---:|---:|---|
| nowzero/ESG-EN test | en | humanas, frases de informes de sostenibilidad | 1.000 | 0,644 | 0,723 | +7,9 (+5,2 a +12,5) |
| DReggio/esg-spanish-events gold | es | humanas, titulares de noticias | 1.468 | 0,222 | 0,756 | +53,4 (+49,3 a +57,3) |
| nmixx-fin/twice_kr_esg_cls | ko | zero-shot | no disponible | no disponible | 0,550 | no disponible |

Comparación con la variante base (mmBERT-base, 308M parámetros) entrenada con la misma receta:

| Conjunto | small | base | base − small (IC 95%) |
|---|---:|---:|---|
| Inglés, humano | 0,723 | 0,731 | +0,8 (−3,4 a +3,0) |
| Español, humano | 0,756 | 0,732 | −2,4 (−4,4 a −0,5) |
| Coreano (procedencia no especificada) | 0,550 | 0,616 | +6,6 (+3,0 a +10,2) |

Comparación con ViBERT-ESG-base (modelo multilingüe multi-etiqueta inglés/vietnamita, Apache-2.0):

| Conjunto | ViBERT argmax | ViBERT umbral | Este modelo (bf16) |
|---|---:|---:|---:|
| Inglés, humano | 0,6760 | 0,6920 | 0,7234 |
| Español, humano | 0,534 | no disponible | 0,756 |

En CPU, la variante base resultó aproximadamente 2,5 veces más lenta que small (10,6 frente a 26,3 frases/s), aunque la medición se hizo en trabajos separados sobre una máquina compartida.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16/bf16 (140M parámetros); aproximadamente 0,6 GB en fp32. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Funciona en CPU sin problemas.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y en el navegador vía ONNX/transformers.js (primera carga de ~270 MB en la demo).
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime, transformers.js, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles. No se menciona soporte explícito de vLLM, llama.cpp u Ollama (no aplicable a un encoder de clasificación).
- Latencia y throughput: ~26,3 frases/s en CPU para la variante small (medición del autor, aproximada); en GPU el throughput es sustancialmente mayor, aunque no se publica una cifra concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Macro-F1 EN | Macro-F1 ES |
|---|---:|---|---|---|---:|---:|
| finbert-esg-multilingual-small | 140,6M | 8.192 | multilingüe (6+) | MIT | 0,723 | 0,756 |
| yiyanghkust/finbert-esg | no disponible | no disponible (BERT, 512) | inglés | no disponible | 0,644 | 0,222 |
| nguyen599/ViBERT-ESG-base | no disponible (mBERT) | no disponible | inglés, vietnamita | Apache-2.0 | 0,692 (umbral) | 0,534 (argmax) |
| mmBERT-base ESG (variante del autor, no publicada) | 308M | 8.192 | multilingüe | MIT | 0,731 | 0,732 |

La ventaja principal frente a FinBERT-ESG es el multilingüismo y la licencia MIT; frente a ViBERT-ESG-base, la cobertura de más idiomas y un rendimiento superior en los conjuntos evaluados, aunque ViBERT es multi-etiqueta y esta comparación es de una sola etiqueta adaptada.

## Limitaciones y advertencias

- El checkpoint se seleccionó por pérdida sobre etiquetas de profesor, no sobre datos humanos; los resultados en los conjuntos de test humanos son ligeramente optimistas para el tamaño publicado, según reconoce el autor.
- Cada tamaño se entrenó una sola vez (semilla 19); los intervalos reflejan remuestreo del test, no varianza de entrenamiento.
- El conjunto español usa un único anotador y los intervalos se calculan sobre NIF sin normalizar (106 identificadores para 103 empresas), lo que puede inflar la confianza de las estimaciones.
- El rendimiento en coreano es notablemente inferior (0,550) y la procedencia de ese conjunto no está especificada.
- Aunque la ventana es de 8.192 tokens, el entrenamiento usó 256; el comportamiento en secuencias largas no está validado.
- Riesgo de alucinación no aplicable (es un clasificador), pero sí de clasificaciones erróneas en frases ambiguas o con vocabulario ESG emergente no visto en entrenamiento.
- Sesgos potenciales derivados de los datos web (fineweb/fineweb-2) y de las etiquetas de profesor, no evaluados en la información disponible.
- Licencia MIT: permite uso comercial sin restricciones, pero se recomienda validar el rendimiento en el dominio concreto antes de producción.
- Requiere transformers con soporte de ModernBERT; el código que usa `BertTokenizer`/`BertForSequenceClassification` hardcodeados fallará y debe migrarse a las clases `Auto*`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/northlight-ai/finbert-esg-multilingual-small
- Demo en el navegador: https://huggingface.co/spaces/northlight-ai/esg-multilingual-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- FinBERT-ESG original: https://huggingface.co/yiyanghkust/finbert-esg
- Comparador ViBERT-ESG-base: https://huggingface.co/nguyen599/ViBERT-ESG-base
- Dataset nowzero/ESG-EN: https://huggingface.co/datasets/nowzero/ESG-EN
- Dataset DReggio/esg-spanish-events: https://huggingface.co/datasets/DReggio/esg-spanish-events
- Dataset nmixx-fin/twice_kr_esg_cls: https://huggingface.co/datasets/nmixx-fin/twice_kr_esg_cls
- Dataset HuggingFaceFW/fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- DOI: https://doi.org/10.57967/hf/11884
