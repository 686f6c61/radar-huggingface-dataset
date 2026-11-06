# hisashisaruta/plamo-3-translate-0.8b-MLX-4bit

## Resumen

PLaMo 3 Translate 0.8B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN) en colaboración con el National Institute of Information and Communications Technology (NICT) de Japón. El modelo base parte de PLaMo 3 NICT, un modelo preentrenado sobre el que se realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. Esta versión concreta ha sido publicada por el usuario hisashisaruta, no por PFN, y está pensada para su ejecución en hardware Apple mediante el framework MLX.

El modelo resuelve el problema de la traducción automática multilingüe de alta calidad en un tamaño compacto: con 890.344.960 parámetros totales (aproximadamente 0,8B), cubre 53 idiomas y permite incorporar contexto circundante y glosarios en la traducción, además de elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos de una sola vez.

Su relevancia actual radica en que ofrece calidad de traducción de primer nivel en un formato que cabe en memoria unificada de equipos Apple Silicon, gracias a la cuantización de 4 bits en formato MLX. La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de traducción especializado, basado en PLaMo 3 NICT); detalles específicos de capas y atención no disponibles |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4 y GGUF |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License |
| Formato de pesos | safetensors (MLX), con código personalizado (custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer especializado en traducción construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y NICT. Sobre esa base se realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traducción, lo que da lugar a PLaMo 3 Translate 0.8B. La información disponible no detalla el número exacto de capas, dimensiones ocultas, mecanismo de atención ni la composición específica del dataset más allá de la naturaleza centrada en traducción.

La innovación principal no reside en la arquitectura sino en el enfoque de entrenamiento y en las capacidades de control: el modelo puede tener en cuenta el contexto circundante y un glosario al traducir, y permite seleccionar entre estilo llano y estilo cortés en la salida japonesa. La longitud máxima de entrenamiento de 32.768 tokens (entrada más salida combinadas) habilita la traducción de pasajes largos en una sola pasada. Esta variante concreta aplica cuantización de 4 bits para MLX, lo que reduce el peso a aproximadamente 1 GB de repositorio. No se dispone de información sobre si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Traducción multilingüe entre 53 idiomas, incluyendo combinaciones con japonés, inglés, español, chino, árabe, coreano, entre otros.
- Traducción bidireccional y entre pares de idiomas no ingleses, según la evaluación FLORES+ descrita.
- Incorporación de contexto circundante en la traducción, lo que permite desambiguar y mantener coherencia en pasajes largos.
- Soporte de glosarios para forzar terminología concreta.
- Control de estilo en la salida japonesa: estilo llano o estilo cortés.
- Traducción de pasajes largos de hasta 32.768 tokens combinando entrada y salida.
- Ejecución optimizada para Apple Silicon mediante MLX y mlx-lm.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Traducción de documentación técnica en local: el modelo puede traducir manuales y guías entre los 53 idiomas soportados ejecutándose íntegramente en un Mac con Apple Silicon, sin depender de servicios en la nube, gracias a su formato MLX-4bit y su tamaño compacto.
- Localización de productos con glosario: al aceptar un glosario, se puede forzar terminología consistente (nombres de marca, términos técnicos) en la traducción de interfaces y textos de marketing, manteniendo coherencia entre lotes.
- Traducción de correspondencia y documentación japonesa: el control de estilo llano o cortés permite adaptar la salida al registro adecuado en contextos empresariales o formales, algo relevante para comunicación con socios japoneses.
- Procesamiento de contratos y textos largos: con 32.768 tokens de ventana combinada, se pueden traducir secciones extensas de documentos legales o informes en una sola pasada, aprovechando el contexto circundante para resolver ambigüedades.
- Subtitulado y traducción de contenido audiovisual: el modelo puede traducir guiones y transcripciones entre pares de idiomas diversos, y su ejecución local facilita el procesamiento por lotes de grandes volúmenes sin costes por token.
- Investigación en traducción automática: al ser un modelo abierto con licencia comunitaria y disponible en múltiples cuantizaciones, sirve como base para experimentos académicos de evaluación y comparación con otros sistemas, especialmente en pares con japonés.
- Aplicaciones de escritorio para macOS: al integrarse vía MLX, puede incorporarse en herramientas nativas de traducción para macOS que aprovechen la memoria unificada del chip sin GPU dedicada.

## Benchmarks y rendimiento

La model card del modelo base indica que PLaMo 3 Translate ofrece calidad de primer nivel tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son COMET-22 (promedio de PFTB, SaaS y WMT24++ para japonés-inglés) y chrF++ sobre FLORES+ (promedio bidireccional para japonés y inglés frente a 14 idiomas). Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada, y no se han publicado resultados específicos de esta variante MLX-4bit en el texto disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| COMET-22 (ja-en, promedio PFTB/SaaS/WMT24++) | no disponible (valores numéricos no incluidos) | El modelo base afirma superar a TranslateGemma y HY-MT2 |
| FLORES+ chrF++ (ja y en frente a 14 idiomas) | no disponible (valores numéricos no incluidos) | Evaluación bidireccional |
| Rendimiento de la variante MLX-4bit | no disponible | La model card menciona tablas de precisión por cuantización, pero los valores no se incluyen en el extracto |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa aproximadamente 1,0 GB en cuantización de 4 bits, por lo que la inferencia requiere del orden de 1 a 2 GB de memoria, dependiendo de la longitud de contexto y del overhead del runtime.
- Hardware recomendado: equipos Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada; el modelo está diseñado para MLX, no para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; no está pensado para GPU NVIDIA/AMD mediante MLX.
- Opciones de despliegue: MLX y mlx-lm en macOS; para otras plataformas sería necesario recurrir a las variantes GGUF, FP8, W4A16 u otras del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B MLX-4bit (este) | 890.344.960 | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | MLX 4-bit |
| PLaMo 3 Translate 2B | no disponible | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | no disponible | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos especializados en traducción comparados en sus evaluaciones, pero no se proporcionan sus especificaciones ni resultados numéricos en la información disponible.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, educativo y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- El modelo está especializado en traducción; no se documentan capacidades generales de razonamiento, código o matemáticas, por lo que no debe emplearse como LLM de propósito general.
- La ventana de 32.768 tokens es la máxima combinada de entrada y salida; los textos más largos deben dividirse, lo que puede afectar a la coherencia entre fragmentos.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos neuronales, especialmente en pares de idiomas con pocos recursos o en dominios muy especializados.
- Esta variante MLX-4bit es una cuantización de terceros (usuario hisashisaruta), no publicada por PFN; la precisión puede diferir de la del modelo BF16 original y conviene validarla en el caso de uso concreto.
- Solo es ejecutable con MLX en hardware Apple; para otros entornos debe usarse otra variante del modelo base.
- No se dispone de información sobre sesgos específicos, evaluación de seguridad ni datos de alineación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- [Modelo en Hugging Face (esta variante MLX-4bit)](https://huggingface.co/hisashisaruta/plamo-3-translate-0.8b-MLX-4bit)
- [Modelo base PLaMo 3 Translate 0.8B (BF16)](https://huggingface.co/pfnet/plamo-3-translate-0.8b)
- [Blog técnico de PFN sobre PLaMo 3 Translate](https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release)
- [Licencia PLaMo Community License](https://plamo.preferredai.jp/info/plamo-community-license-en)
- [Repositorio MLX](https://github.com/ml-explore/mlx)
- [Variantes del modelo base: FP8](https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8), [W4A16](https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16), [W4AFP8](https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8), [NVFP4](https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4), [GGUF](https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF), [MLX-4bit oficial](https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit)
- [Modelos de mayor tamaño: 2B](https://huggingface.co/pfnet/plamo-3-translate-2b), [8B](https://huggingface.co/pfnet/plamo-3-translate-8b), [31B](https://huggingface.co/pfnet/plamo-3-translate-31b)
