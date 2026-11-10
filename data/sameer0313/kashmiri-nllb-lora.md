# Sameer0313/kashmiri-nllb-lora

## Resumen

El modelo `Sameer0313/kashmiri-nllb-lora` es un adaptador LoRA para traducción automática hacia y desde cachemir (kashmiri), desarrollado por el usuario Sameer0313 sobre el modelo base `facebook/nllb-200-distilled-600M` de Meta. Resuelve un problema concreto: la escasez de recursos y la baja calidad de traducción para una lengua de bajos recursos como el cachemir, especialmente en su variedad con escritura perso-árabe y orden sintáctico V2 (verbo en segunda posición), que difiere del patrón SOV típico del urdu.

El adaptador se ha entrenado según la model card con cinco técnicas encadenadas: limpieza y aumento de datos, preentrenamiento continuado (CPT) sobre corpus literario y religioso, traducción inversa (back-translation) con verificación de consistencia cíclica, ajuste fino QLoRA en dos etapas (A: adaptación multitarea amplia; B: 8 épocas sobre traducciones certificadas, incluyendo Sahih al-Bukhari 1-200) y alineamiento final mediante DPO para penalizar préstamos y patrones sintácticos del urdu.

El resultado es un artefacto ligero (repo de 0,1 GB) que se carga como adaptador PEFT sobre NLLB-200-distilled-600M, con licencia MIT y soporte declarado para cachemir (ks/kas) e inglés (en). Es relevante para equipos que necesiten traducción cachemir-inglés con un coste de cómputo muy bajo y posibilidad de despliegue en CPU o GPU de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled) con adaptador LoRA/PEFT |
| Parametros totales | 600M en el modelo base; el adaptador LoRA añade un subconjunto no especificado (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantización estándar de PEFT) |
| Idiomas soportados | ks (cachemir), kas (cachemir), en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de traducción multilingüe de Meta. El adaptador en sí es un LoRA (entrenado con QLoRA, es decir, cuantización del base durante el ajuste) que modifica los pesos del modelo base sin reentrenarlo por completo. La model card no detalla rangos, módulos objetivo ni hiperparámetros del LoRA.

El pipeline de entrenamiento descrito consta de cinco fases: (1) limpieza y aumento del dataset restaurando vocales auténticas del cachemir y el orden V2; (2) preentrenamiento continuado sobre corpus literario y religioso; (3) back-translation con comprobación de consistencia cíclica para generar pares sintéticos; (4) QLoRA en dos etapas, con una segunda etapa de 8 épocas sobre traducciones certificadas (incluye Sahih al-Bukhari 1-200); y (5) DPO para alinear el estilo hacia la sintaxis V2 nativa frente a patrones SOV con préstamos del urdu. La model card reporta una pérdida de evaluación de la etapa B de 1,1825, pero no especifica el tamaño del conjunto de evaluación, la composición exacta del dataset ni los hiperparámetros de DPO.

## Capacidades

- Traducción automática bidireccional entre cachemir e inglés (pipeline `translation`).
- Generación en escritura perso-árabe con vocales restauradas y orden V2, según declara el autor.
- Alineamiento preferencial hacia sintaxis nativa frente a calcos del urdu (efecto del DPO).
- Adaptación a dominio literario y religioso gracias al preentrenamiento continuado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los tres códigos declarados (ks, kas, en); no se garantiza transferencia a otras lenguas del NLLB base.

## Casos de uso

- Traducción de documentación técnica al cachemir: se puede integrar el adaptador sobre NLLB-200-distilled-600M en un pipeline de traducción por lotes; el tamaño reducido (600M + LoRA) permite procesar volúmenes altos en una sola GPU.
- Localización de contenido editorial y literario: el CPT sobre corpus literario y la restauración de vocales lo hacen adecuado para textos narrativos donde la naturalidad ortográfica importa.
- Traducción de textos religiosos: el ajuste incluye material certificado (Sahih al-Bukhari 1-200), por lo que es un candidato para traducción de contenido islámico hacia cachemir, siempre con revisión humana.
- Preservación lingüística y digitalización: útil para proyectos de digitalización de corpus en cachemir con escritura perso-árabe, donde la normalización de vocales es crítica.
- Prototipado rápido de sistemas de traducción: al ser un adaptador PEFT de 0,1 GB, se puede cargar y descargar en entornos de experimentación sin infraestructura pesada.
- Investigación en lenguas de bajos recursos: sirve como punto de partida reproducible (licencia MIT) para experimentar con DPO y back-translation en idiomas con pocos datos paralelos.
- Asistencia a traductores humanos: como primera pasada automática en flujos de postedición, reduciendo el esfuerzo en segmentos con sintaxis V2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una pérdida de evaluación de la etapa B de 1,1825 y ejemplos de "smoke test" sin métricas BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el base de 600M ocupa aproximadamente 1,2 GB de pesos, más overhead de activaciones y del adaptador; en la práctica, menos de 4 GB en fp16 y menos de 2 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4); para throughput alto, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: `transformers` + PEFT (carga del adaptador), vLLM (si soporta el adaptador sobre NLLB), TGI y conversión a GGUF para llama.cpp/Ollama (no documentada por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sameer0313/kashmiri-nllb-lora | 600M base + LoRA | No disponible | ks, kas, en | MIT | Hugging Face |
| facebook/nllb-200-distilled-600M | 600M | 512 tokens (estándar NLLB) | 200 lenguas, incluido cachemir | CC-BY-NC 4.0 | Hugging Face |
| facebook/nllb-200-3.3B | 3,3B | 512 tokens (estándar NLLB) | 200 lenguas | CC-BY-NC 4.0 | Hugging Face |
| Helsinki-NLP/opus-mt (pares específicos) | ~70-300M | 512 tokens | Pares limitados; cobertura de cachemir muy escasa | Apache 2.0 / CC-BY 4.0 según modelo | Hugging Face |

La ventaja principal del adaptador frente al NLLB base es la especialización en cachemir (vocales, orden V2, DPO contra calcos del urdu) y una licencia MIT que permite uso comercial, a diferencia de la licencia CC-BY-NC del NLLB original. No hay datos públicos de calidad comparada (BLEU/chrF) entre estas alternativas en la información disponible.

## Limitaciones y advertencias

- No se han publicado métricas objetivas de calidad (BLEU, chrF, COMET); la única cifra es una pérdida de evaluación de 1,1825 sin contexto sobre el conjunto.
- El adaptador hereda los sesgos y limitaciones del corpus de entrenamiento, que incluye material religioso (Sahih al-Bukhari), lo que puede sesgar el estilo hacia registros formales o religiosos.
- Riesgo de alucinación y de traducciones fluentemente incorrectas, especialmente en dominios no representados en el ajuste.
- La cobertura se limita a cachemir e inglés; no se garantiza el comportamiento en otros pares de lenguas del NLLB base.
- La model card está incompleta: faltan hiperparámetros de LoRA, tamaño y composición del dataset, detalles de DPO y ejemplos de smoke test (aparecen vacíos en la información proporcionada).
- El repo tiene 0 descargas y 0 likes, sin validación comunitaria; debe tratarse como un artefacto experimental.
- Aunque la licencia del adaptador es MIT, el modelo base NLLB-200-distilled-600M tiene licencia CC-BY-NC 4.0, lo que puede condicionar el uso comercial del conjunto; conviene verificar la compatibilidad antes de producción.
- No se documenta el soporte de contextos largos ni el comportamiento con entradas de más de 512 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/Sameer0313/kashmiri-nllb-lora
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper NLLB-200: https://arxiv.org/abs/2207.04672
- Repositorio NLLB (fairseq): https://github.com/facebookresearch/fairseq/tree/nllb
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
