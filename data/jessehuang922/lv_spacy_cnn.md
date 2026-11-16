# JesseHuang922/lv_spacy_cnn

## Resumen

`lv_spacy_cnn` es un pipeline de procesamiento de lenguaje natural para letón (lv) construido sobre spaCy 3.8.7 con un backbone Tok2Vec de tipo CNN. Lo desarrolla el usuario JesseHuang922 en el contexto del proyecto LazyBomb-Lab, y su función es resolver tareas clásicas de análisis lingüístico: etiquetado gramatical (POS), rasgos morfológicos, análisis de dependencias y lematización. No es un modelo generativo ni un LLM: es una cadena de componentes estadísticos entrenados de forma supervisada sobre el treebank UD Latvian LVTB v2.16.

El interés del modelo es acotado pero claro: ofrece una alternativa ligera y desplegable en CPU para pipelines de PLN en letón, un idioma con pocos recursos. Su rendimiento, sin embargo, queda por debajo de Stanza en todas las métricas publicadas por el autor (84,93 % de media ponderada frente a 91,35 %), aunque supera ampliamente a UDPipe en parsing (LAS 0,7509 frente a 0,0660).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos no están efectivamente alojados o que el repo está vacío. Conviene verificar la disponibilidad real de los ficheros antes de integrarlo en cualquier flujo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy con backbone Tok2Vec CNN (no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa documentos por sentencias; sin ventana definida) |
| Tipos de cuantizacion | no disponible (pesos spaCy, no cuantizables vía GGUF) |
| Idiomas soportados | Letón (lv) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Directorio spaCy (config.cfg + componentes); wheel `lv_spacy_cnn-1.0.0-py3-none-any.whl` disponible según la model card |

## Arquitectura y entrenamiento

El modelo es un pipeline spaCy estándar compuesto por Tok2Vec (backbone CNN de spaCy, no un transformer pese a que las dependencias listadas incluyan `spacy-transformers`), Tagger, Morphologizer, Parser dependencial, segmentador de sentencias (senter) y lematizador. La model card menciona el modelo base `spaCy/Tok2Vec`, lo que confirma que el codificador es el Tok2Vec convolutional clásico de spaCy, no XLM-RoBERTa, a pesar de que el apartado de dependencias hable de "Latvian XLM-RoBERTa spaCy pipeline" (probablemente un copy-paste de otra ficha).

El entrenamiento se realizó sobre el Latvian UD Treebank v2.16, derivado del Latvian Treebank (LVTB) del Instituto de Matemáticas e Informática de la Universidad de Letonia. Los splits son 15.055 sentencias de entrenamiento, 2.080 de desarrollo y 2.396 de test. No se documenta el número de tokens, la composición del corpus más allá del treebank, ni si hubo ajuste fino con RLHF/DPO (no aplica en un modelo de este tipo). Las métricas declaradas son accuracy, UAS y LAS.

## Capacidades

- Etiquetado POS (Universal POS tags) con accuracy de 0,9457 en test.
- Etiquetado fino de tags (XPOS) con 0,8665.
- Predicción de rasgos morfológicos (Morph) con 0,9046.
- Análisis de dependencias: UAS 0,8076 y LAS 0,7509.
- Lematización con accuracy de 0,8203.
- Segmentación de sentencias mediante el componente senter.
- Procesamiento por lotes sobre texto plano en letón, con salida en estructuras `Doc` de spaCy (tokens, tags, árbol de dependencias, lemas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un pipeline discriminativo, no un LLM.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Multilingüe: no; está entrenado exclusivamente para letón.

## Casos de uso

- Preprocesado lingüístico para pipelines de PLN en letón: tokenización, POS y lematización antes de alimentar modelos de clasificación o búsqueda. Adecuado por su bajo coste computacional y su integración nativa con spaCy.
- Análisis sintáctico de corpus académicos en letón: extracción de árboles de dependencias para estudios lingüísticos o construcción de treebanks derivados, con LAS de 0,7509.
- Indexación y búsqueda léxica: la lematización (0,8203 de accuracy) permite normalizar términos flexionados en motores de búsqueda o sistemas de recuperación de información en letón.
- Extracción de entidades y relaciones basada en reglas sobre dependencias: el parser permite construir patrones sintácticos (sujeto-verbo-objeto) para extracción de información estructurada en dominios acotados.
- Anonimización y análisis de textos administrativos: POS y morfología ayudan a identificar nombres propios y formas verbales en documentos oficiales letones, aunque sin un NER dedicado habría que complementarlo.
- Enriquecimiento de datasets para entrenar otros modelos: generar anotaciones POS/morfosintácticas preliminares sobre texto no etiquetado para revisión humana posterior.
- Despliegue en entornos con CPU únicamente: al ser un pipeline CNN ligero, puede ejecutarse en servidores sin GPU, algo relevante para organizaciones con infraestructura limitada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (conjunto de test del UD Latvian LVTB v2.16):

| Modelo | POS | Tag | Morph | UAS | LAS | Lemma Acc | Media (pesos iguales) |
|---|---|---|---|---|---|---|---|
| spaCy (este modelo) | 0,9457 | 0,8665 | 0,9046 | 0,8076 | 0,7509 | 0,8203 | 84,93 % |
| Stanza | 0,9688 | 0,8987 | 0,9449 | 0,8791 | 0,8354 | 0,9539 | 91,35 % |
| UDPipe | 0,9207 | 0,7960 | 0,3403 | 0,0791 | 0,0660 | 0,8911 | 51,55 % |

El modelo queda por debajo de Stanza en todas las métricas y por encima de UDPipe en la media global, con una ventaja especialmente marcada en parsing (UAS/LAS), donde UDPipe rinde de forma muy pobre según estos datos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser un Tok2Vec CNN, el consumo es muy bajo (del orden de cientos de MB en CPU, sin cifra oficial).
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para spaCy es válida, aunque el modelo está pensado para CPU en uso a pequeña escala.
- Cabe en GPU consumer: sí, con enorme margen, dado el tamaño reducido del backbone CNN.
- Opciones de despliegue: spaCy 3.8.7 o superior; carga vía `spacy.load()` sobre el directorio descargado con `huggingface_hub.snapshot_download` o instalación del wheel `lv_spacy_cnn-1.0.0-py3-none-any.whl`. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Dependencias mínimas declaradas: spacy 3.8.7, spacy-transformers 1.3.9, transformers 4.49.0, torch 2.8.0, tokenizers 0.21.4, safetensors 0.6.2, huggingface-hub 0.34.4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | POS | LAS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lv_spacy_cnn | Pipeline spaCy (Tok2Vec CNN) | Letón | 0,9457 | 0,7509 | CC BY-SA 4.0 | HF (repo de 0,0 GB; verificar) |
| Stanza (lv) | Pipeline neural (BiLSTM/transformer) | Letón | 0,9688 | 0,8354 | Según distribución de Stanza | Disponible vía Stanza |
| UDPipe (lv) | Pipeline UDPipe | Letón | 0,9207 | 0,0660 | Según distribución de UDPipe | Disponible vía UDPipe |

Stanza ofrece mejor calidad global y es la opción recomendada si la precisión es prioritaria. UDPipe es más ligero en algunos flujos pero su parsing en letón es muy inferior según los datos del autor. `lv_spacy_cnn` se justifica por su integración directa en el ecosistema spaCy y su ejecución en CPU.

## Limitaciones y advertencias

- Rendimiento inferior a Stanza en todas las métricas publicadas; no es la mejor opción si se busca máxima precisión en letón.
- El repositorio muestra 0,0 GB de tamaño y 0 descargas: es posible que los pesos no estén realmente alojados o que el repo esté incompleto. Verificar antes de integrar.
- La model card contiene inconsistencias: menciona "XLM-RoBERTa spaCy pipeline" en dependencias cuando el backbone real es Tok2Vec CNN. No fiarse de esa referencia.
- Solo letón: no generaliza a otros idiomas bálticos ni a texto multilingüe.
- Sin componente NER dedicado: no extrae entidades nombradas de forma nativa.
- Riesgo de errores en morfología (0,9046) y lematización (0,8203): en dominios especializados (terminología jurídica, médica) la precisión puede degradarse.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia. Esto puede ser problemático para productos propietarios que incorporen el modelo o sus salidas de forma sustancial.
- Sin datos de sesgo documentados; al entrenarse solo con LVTB, el dominio y el registro del treebank condicionan su comportamiento.
- No apto para generación de texto, razonamiento ni tareas de agente.

## Enlaces

- Hugging Face: https://huggingface.co/JesseHuang922/lv_spacy_cnn
- Repositorio GitHub: https://github.com/LazyBomb-Lab/LV_spaCy_CNN
- Notebook de detalles: https://github.com/LazyBomb-SIA/LV_spaCy_CNN/blob/main/lv_spacy_cnn.ipynb
- Dataset UD Latvian LVTB: https://github.com/UniversalDependencies/UD_Latvian-LVTB
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- spaCy: https://spacy.io
