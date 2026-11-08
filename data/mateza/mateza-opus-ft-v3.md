# mateza/mateza-opus-ft-v3

## Resumen

mateza-opus-ft-v3 es un modelo de traduccion automatica neuronal especializado en el par de idiomas ingles-kinyarwanda (en-rw), desarrollado por el usuario mateza y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del modelo MarianMT de Helsinki-NLP, concretamente de la familia opus-mt, que constituye la base de referencia para traduccion multilingue de codigo abierto en pares de bajos recursos. El modelo se distribuye en formato safetensors compatible con la libreria transformers y con un tamano de repositorio de 0,8 GB.

El modelo aborda un problema recurrente en el ambito del procesamiento del lenguaje natural: la escasez de sistemas de traduccion de calidad para lenguas africanas de bajos recursos como el kinyarwanda, hablado por mas de 12 millones de personas principalmente en Ruanda. Al partir de un modelo preentrenado y ajustarlo con corpus paralelos especificos, busca mejorar la fidelidad de la traduccion en dominios concretos frente al modelo base original.

Es relevante ahora porque se apoya en conjuntos de datos paralelos de referencia para el par en-rw, como el corpus de DigitalUmuganda y el de MbazaNLP para el dominio educativo, lo que lo posiciona como una opcion practica para proyectos de localizacion y preservacion linguistica. El acceso al modelo esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de su descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona compatibilidad con CTranslate2 en los tags) |
| Idiomas soportados | ingles (en), kinyarwanda (rw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un transformer encoder-decoder disenado originalmente para traduccion automatica neuronal y optimizado para eficiencia computacional en entornos de investigacion. Parte de los pesos de Helsinki-NLP/opus-mt-en-rw y Helsinki-NLP/opus-mt-rw-en, sobre los que se aplica un ajuste fino supervisado con corpus paralelos. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni la existencia de etapas de RLHF o DPO, por lo que estos datos se consideran no disponibles.

Los conjuntos de datos referenciados en la model card incluyen el corpus de traduccion automatica kinyarwanda-ingles de DigitalUmuganda, el corpus paralelo educativo de MbazaNLP (NMT_Education_parallel_data_en_kin) y el dataset NLLB de AllenAI, lo que sugiere un entrenamiento orientado a dominios educativos y generales. La presencia del tag ctranslate2 indica que el modelo puede convertirse para inferencia optimizada con dicha libreria, habitual en despliegues de traduccion de baja latencia.

## Capacidades

- Traduccion automatica bidireccional entre ingles y kinyarwanda (en-rw y rw-en).
- Generacion de texto traducido en dominios generales y educativos, segun los corpus de ajuste fino.
- Compatibilidad con la pipeline `translation` de la libreria transformers.
- Posible conversion a CTranslate2 para inferencia acelerada en CPU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas estrictamente al par en-rw.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Localizacion de documentacion tecnica: traduccion de manuales y guias del ingles al kinyarwanda para organizaciones que operan en Ruanda, aprovechando el ajuste sobre corpus educativos.
- Traduccion de materiales educativos: el modelo se ha ajustado con el corpus paralelo de MbazaNLP orientado a educacion, lo que lo hace adecuado para digitalizar y traducir contenidos escolares.
- Atencion ciudadana multilingue: integracion en portales de servicios publicos para ofrecer informacion en kinyarwanda a partir de fuentes en ingles, con inferencia via CTranslate2 en servidores sin GPU.
- Subtitulado y transcripcion: traduccion de subtitulos en ingles a kinyarwanda en pipelines de procesamiento de video, dado el bajo coste computacional de MarianMT.
- Investigacion en traduccion de bajos recursos: uso como linea base ajustada para experimentos academicos sobre el par en-rw, comparando con el modelo base opus-mt.
- Preservacion linguistica: generacion de corpus traducidos que contribuyan a ampliar los recursos digitales disponibles en kinyarwanda.
- Traduccion de contenido web y redes sociales: procesamiento por lotes de textos cortos en ingles hacia kinyarwanda mediante la pipeline de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para un modelo MarianMT de tamano tipico (el repositorio ocupa 0,8 GB), aunque la cifra exacta no esta confirmada.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; tambien es viable en CPU.
- Cabe en practicamente cualquier GPU consumer y en entornos sin GPU gracias a su tamano reducido.
- Opciones de despliegue: transformers (pipeline `translation`), CTranslate2 (segun tags), y servidores de inferencia compatibles con la API de Hugging Face (`endpoints_compatible`).
- Latencia y throughput estimados: no disponibles; en CPU con CTranslate2 se espera un rendimiento adecuado para traduccion por lotes, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mateza-opus-ft-v3 | no disponible | no disponible | en, rw | Apache 2.0 | Ajuste fino sobre opus-mt, acceso gated |
| Helsinki-NLP/opus-mt-en-rw | no disponible | no disponible | en, rw | CC-BY 4.0 (habitual en opus-mt) | Modelo base sin ajuste fino |
| Helsinki-NLP/opus-mt-rw-en | no disponible | no disponible | rw, en | CC-BY 4.0 (habitual en opus-mt) | Modelo base direccion inversa |
| NLLB-200 (Meta) | hasta 54B (variante grande) | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | Cobertura multilingue amplia, no comercial en algunas variantes |

La comparativa se limita a los modelos base referenciados, ya que no se dispone de datos de rendimiento del ajuste fino ni de alternativas especificas con metricas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero los corpus de entrenamiento pueden introducir sesgos de dominio (educativo, institucional) y de registro.
- Riesgo de alucinacion: presente en modelos de traduccion neuronal, especialmente con frases fuera de dominio o terminologia especializada.
- Limitaciones de contexto o idioma: el modelo solo cubre el par en-rw; no soporta otros idiomas ni cambios de dominio no vistos en el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los modelos base opus-mt, que puede diferir.
- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en produccion.
- Falta de documentacion: no se publican metricas de calidad (BLEU, chrF), tamanos de parametros ni detalles del entrenamiento, lo que dificulta la evaluacion previa.
- Sin garantias de mantenimiento: el repositorio muestra 0 descargas y 0 likes, lo que sugiere un proyecto reciente o poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mateza/mateza-opus-ft-v3
- Perfil del autor: https://huggingface.co/mateza
- Modelo base en-rw: https://huggingface.co/Helsinki-NLP/opus-mt-en-rw
- Modelo base rw-en: https://huggingface.co/Helsinki-NLP/opus-mt-rw-en
- Dataset DigitalUmuganda: https://huggingface.co/datasets/DigitalUmuganda/kinyarwanda-english-machine-translation-dataset
- Dataset MbazaNLP: https://huggingface.co/datasets/mbazaNLP/NMT_Education_parallel_data_en_kin
- Dataset NLLB: https://huggingface.co/datasets/allenai/nllb
