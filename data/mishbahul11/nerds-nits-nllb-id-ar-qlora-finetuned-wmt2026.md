# mishbahul11/nerds-nits-nllb-id-ar-qlora-finetuned-wmt2026

## Resumen

El modelo **mishbahul11/nerds-nits-nllb-id-ar-qlora-finetuned-wmt2026** es un adaptador LoRA/QLoRA sobre el modelo base **facebook/nllb-200-1.3B**, desarrollado por el equipo NERDS-NITS como parte de su participación en la tarea compartida **WMT 2026 de traducción de lenguas de bajos recursos árabe-asiático**. El objetivo es ofrecer traducción bidireccional entre árabe e indonesio, un par de idiomas con recursos limitados, utilizando una técnica de fine-tuning eficiente que permite entrenar en una única GPU NVIDIA T4 de 16GB.

La arquitectura subyacente es un **transformer multilingüe destilado** de 1.3B parámetros, al que se le añaden adaptadores LoRA con rango 64 y alpha 128, entrenados sobre un corpus paralelo de aproximadamente 20.000 pares de frases. El adaptador ocupa 0.4GB en disco y se distribuye en formato safetensors. La longitud de secuencia se limitó a 192 tokens durante el entrenamiento, lo que condiciona la ventana efectiva de contexto para este fine-tuning.

La relevancia del modelo radica en que aborda un par de idiomas de bajos recursos con una técnica de bajo coste computacional (QLoRA en NF4), lo que lo hace accesible para investigadores y desarrolladores con hardware limitado que necesiten traducción árabe-indonesio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multilingüe destilado (NLLB-200-1.3B) con adaptadores LoRA/QLoRA |
| Parametros totales | 1.3B (modelo base) + adaptadores LoRA (~4.2% entrenable) |
| Longitud de contexto | 192 tokens (secuencia máxima durante el entrenamiento) |
| Tipos de cuantizacion | NF4 (QLoRA) para el modelo base; fp16/bf16 en entrenamiento |
| Idiomas soportados | Árabe (`arb_Arab`) e indonesio (`ind_Latn`) para traducción; el modelo base NLLB-200 soporta 200 idiomas |
| Licencia | MIT (adaptador) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de **facebook/nllb-200-1.3B**, un transformer multilingüe destilado que cubre 200 idiomas. El fine-tuning se realiza mediante **QLoRA**, que combina cuantización NF4 del modelo base con adaptadores LoRA de bajo rango. La configuración LoRA usa rango `r = 64` y `alpha = 128` (es decir, alpha = 2r), aplicándose a las proyecciones de query, key, value, output y feed-forward. Solo el 4.2% de los parámetros totales son entrenables; el resto permanece congelado.

El entrenamiento se llevó a cabo con el framework `Seq2SeqTrainer` de Hugging Face, optimizador Adafactor, tasa de aprendizaje de 2e-4, warmup del 5%, 6 épocas, batch efectivo de 32 (batch 4 con acumulación de gradientes de 8) y una longitud máxima de secuencia de 192 tokens. Se utilizó una única GPU NVIDIA T4 de 16GB con precisión mixta fp16/bf16. Para la inferencia se emplea búsqueda en haz (beam search) con ancho 5. El dataset de entrenamiento es el corpus paralelo árabe-indonesio de la tarea WMT 2026. Una innovación destacable es la capacidad de adaptar un modelo de 1.3B a un par de idiomas de bajos recursos con un único checkpoint compartido para ambas direcciones de traducción.

## Capacidades

- Traducción automática bidireccional árabe↔indonesio, con un único checkpoint compartido para ambas direcciones.
- Herencia del modelo base NLLB-200, que cubre 200 idiomas, aunque este fine-tuning especializa el modelo exclusivamente en el par árabe-indonesio.
- Soporte de tokenización mediante `AutoTokenizer` con los códigos de idioma NLLB (`arb_Arab` e `ind_Latn`), lo que permite fijar el idioma de origen y destino durante la generación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento especiales.

## Casos de uso

- **Localización de aplicaciones móviles y web**: el modelo puede traducir cadenas de texto de interfaces de usuario entre árabe e indonesio, facilitando la expansión de productos digitales en ambos mercados. Su naturaleza bidireccional permite usar un único modelo para ambos sentidos de traducción.
- **Traducción de contenido de atención al cliente**: empresas con usuarios en países de habla árabe e indonesia pueden integrar el modelo en sistemas de tickets o chatbots para traducir consultas y respuestas de forma automática. La ventana de 192 tokens requiere segmentar mensajes largos en fragmentos.
- **Traducción de documentación técnica y manuales**: organizaciones que operan en ambos idiomas pueden traducir manuales de producto, guías de usuario o documentación interna. El corpus de entrenamiento es pequeño, por lo que se recomienda revisar la calidad en textos técnicos especializados.
- **Investigación académica**: investigadores que trabajen con fuentes en árabe o indonesio pueden usar el modelo para traducir resúmenes, títulos o pasajes breves de artículos y comunicaciones científicas, especialmente en contextos con recursos computacionales limitados.
- **Traducción de contenido de redes sociales**: el modelo puede procesar publicaciones, comentarios y mensajes cortos en ambas direcciones, lo que resulta útil para monitorizar conversaciones o campañas en medios sociales.
- **Preprocesamiento para pipelines de NLP**: en proyectos de minería de textos o análisis de sentimiento que involucren ambos idiomas, el modelo puede normalizar y traducir textos a una lengua común antes de aplicar otros modelos.
- **Traducción de subtítulos y contenido multimedia**: dado que los subtítulos suelen venir en fragmentos cortos, el modelo puede traducir líneas de diálogo entre árabe e indonesio, respetando el límite de 192 tokens por segmento.

## Benchmarks y rendimiento

Los resultados declarados por el autor se presentan a continuación. No se han publicado comparativas con otros modelos en la información disponible.

| Conjunto de datos | Dirección | BLEU | chrF / chrF2 | TER | COMET | mBERT |
|---|---|---|---|---|---|---|
| Devtest (WMT 2026) | ID→AR | 18.67 | 52.85 (chrF) | no disponible | 0.8557 (escala 0-1) | no disponible |
| Test oficial (organizadores) | ID→AR | 17.9214 | 50.9884 (chrF2) | 72.7991 | 82.9557 (escala 0-100) | 84.0537 |

Nota: los valores de COMET en el devtest se reportan en escala 0-1, mientras que en el test oficial del desafío se reportan en escala 0-100.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. El entrenamiento se realizó en una NVIDIA T4 de 16GB con QLoRA (NF4), lo que sugiere que la inferencia en cuantización NF4 es viable en GPUs de gama media.
- **GPU recomendadas**: NVIDIA T4 (usada en entrenamiento); para inferencia, cualquier GPU con al menos 8GB de VRAM es suficiente de forma orientativa.
- **Compatibilidad con GPUs de consumo**: sí, de forma orientativa en RTX 3060/4060 con 8GB de VRAM usando cuantización NF4, aunque no hay datos oficiales de consumo de memoria.
- **Opciones de despliegue**: Transformers + PEFT (código de uso proporcionado en la model card); también es posible servirlo mediante Hugging Face Inference Endpoints o TGI (no verificado en la información).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos de rendimiento en la información proporcionada. A continuación se muestra una comparativa estructural con el modelo base, sin métricas de calidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mishbahul11/nerds-nits-nllb-id-ar-qlora-finetuned-wmt2026 | 1.3B + adaptadores LoRA | 192 tokens (fine-tuning) | MIT (adaptador) | HuggingFace |
| facebook/nllb-200-1.3B | 1.3B | 1024 tokens (modelo base) | No especificada en la información | HuggingFace |

## Limitaciones y advertencias

- El corpus de entrenamiento es reducido (~20.000 pares de frases), lo que puede degradar el rendimiento en textos fuera de dominio o muy técnicos.
- La longitud de secuencia se limitó a 192 tokens durante el entrenamiento; entradas más largas pueden producir traducciones de menor calidad o requerir segmentación previa.
- Al ser un adaptador LoRA, la calidad final está condicionada por la cobertura y los sesgos del modelo base NLLB-200-1.3B.
- Riesgo de alucinación en traducciones ambiguas o de dominio especializado, especialmente con textos que no aparecen en el corpus de entrenamiento.
- El fine-tuning se centra exclusivamente en el par árabe-indonesio; el modelo no debe usarse como traductor multilingüe general.
- La licencia MIT aplica al adaptador, pero el modelo base NLLB-200-1.3B tiene su propia licencia que debe consultarse en su página de HuggingFace antes de cualquier uso comercial.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/mishbahul11/nerds-nits-nllb-id-ar-qlora-finetuned-wmt2026
- Modelo base: https://huggingface.co/facebook/nllb-200-1.3B
- Título del paper asociado: NERDS-NITS at WMT 2026: Pivot-Based and Direct Neural Machine Translation for Arabic–Asian Low-Resource Language Pairs
