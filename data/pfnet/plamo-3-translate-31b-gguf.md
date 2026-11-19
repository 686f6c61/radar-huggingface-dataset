# pfnet/plamo-3-translate-31b-GGUF

## Resumen

PLaMo 3 Translate 31B GGUF es la versión cuantizada en formato GGUF del modelo de traducción PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). El modelo está especializado en traducción multilingüe y se distribuye listo para su uso con llama.cpp y runtimes compatibles. Con 31.757.456.384 parámetros, se posiciona como la variante de mayor tamaño de una familia que también incluye versiones de 0.8B, 2B y 8B.

El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, que posteriormente fue sometido a un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. El resultado es un modelo que cubre 53 idiomas y que, según el autor, alcanza calidad de traducción de primer nivel tanto en el par japonés-inglés como en combinaciones multilingües.

Su relevancia actual radica en dos factores: por un lado, la disponibilidad de pesos abiertos bajo la PLaMo Community License, con uso personal, académico y no comercial gratuito sin registro previo; por otro lado, la publicación de variantes cuantizadas (GGUF, FP8, W4A16, NVFP4, MLX) que facilitan el despliegue en hardware muy diverso, desde GPUs de consumo hasta servidores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traducción; detalles no publicados en la información disponible) |
| Parametros totales | 31.757.456.384 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo de entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones dentro del repo); el autor publica además FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | GGUF (repo de 192,0 GB con múltiples cuantizaciones); el modelo base en BF16 está en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, tipo de atención, configuración de cabezas). Lo que sí se documenta es el proceso de construcción: PLaMo 3 Translate 31B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, sobre el que se realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados específicamente a traducción. No se especifica en la información proporcionada si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

El modelo está diseñado para aprovechar contexto circundante y glosarios, y permite seleccionar entre estilo llano y estilo cortés en las salidas en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el total no exceda ese límite. Esta variante GGUF se ha convertido y cuantizado para llama.cpp; el autor advierte que la cuantización introduce cambios de precisión respecto a BF16, cuantificados en tablas comparativas en la model card original.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares que no involucran al inglés ni al japonés.
- Traducción con contexto circundante: el modelo puede tener en cuenta texto previo o posterior para desambiguar.
- Traducción asistida por glosario: permite imponer terminología concreta en la salida.
- Control de estilo en japonés: elección entre registro llano y registro cortés.
- Procesamiento de pasajes largos de hasta 32.768 tokens combinados de entrada y salida.
- Formato conversacional (tag `conversational`), compatible con endpoints de inferencia estándar.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales y referencias de API entre cualquiera de los 53 idiomas soportados, manteniendo coherencia terminológica mediante glosarios, lo que resulta adecuado para equipos que publican documentación en varios mercados.
- Localización de productos de software: integrado en pipelines de CI/CD, permite traducir ficheros de recursos y cadenas de interfaz, con la ventaja de que el formato GGUF se ejecuta en llama.cpp sin dependencias pesadas.
- Traducción jurídica y administrativa asistida: el uso de glosarios y del contexto circundante ayuda a mantener terminología consistente en contratos y textos normativos, aunque requiere revisión humana por el riesgo de alucinación.
- Subtitulado y traducción audiovisual: gracias a la ventana de 32.768 tokens, puede procesar guiones completos de episodios o capítulos en una sola pasada, preservando el contexto narrativo entre diálogos.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones multi-turno entre agentes y clientes en tiempo real, con despliegue en GPUs de consumo mediante cuantización GGUF.
- Traducción de literatura y contenido editorial: el control de estilo en japonés (llano frente a cortés) y el contexto largo permiten adaptar el registro de la traducción a la obra, algo útil para editoriales que trabajan con originales japoneses.
- Investigación en traducción automática: al ser un modelo abierto con pesos descargables, sirve como base para experimentos académicos sobre evaluación, cuantización o adaptación de dominio.

## Benchmarks y rendimiento

El autor publica una figura comparativa en la model card (no incluida como tabla numérica en la información disponible) con las siguientes métricas:

- Calidad japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Traducción entre japonés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas evaluados en FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traducción con los que se compara en todas las métricas, pero no se proporcionan los valores numéricos en la información disponible.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamaño del repo (192,0 GB para todas las cuantizaciones juntas) y de los 31,76B parámetros, las cuantizaciones de 4 bits rondarían los 16-20 GB y las de 8 bits los 32-35 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un modelo de 31B en cuantización de 4 bits es desplegable en GPUs de consumo con 24 GB (RTX 3090, RTX 4090); en BF16 requeriría del orden de 64 GB, lo que apunta a A100 80GB, H100 o múltiples GPUs.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones bajas (4 bits) sobre RTX 3090/4090; no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y por extensión Ollama y otros frontends compatibles con GGUF. El modelo base dispone además de variantes FP8, W4A16, W4AFP8, NVFP4 y MLX para otros runtimes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B | 31,76B | 32.768 | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | no disponible | 32.768 (según modelo base de la familia) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | 32.768 (según modelo base de la familia) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor menciona TranslateGemma y HY-MT2 como modelos de comparación en sus evaluaciones, pero la información disponible no incluye sus especificaciones ni sus resultados numéricos, por lo que no es posible completar la comparativa con datos verificables.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo LLM, puede generar traducciones plausibles pero incorrectas, especialmente en textos muy especializados o con terminología ambigua; se recomienda revisión humana en contextos críticos.
- Límite de longitud: la ventana de 32.768 tokens cubre entrada y salida combinadas; los textos más largos deben dividirse, lo que puede degradar la coherencia entre fragmentos.
- Sesgos: no se documentan en la información disponible análisis de sesgos por idioma, género o dominio.
- Cobertura desigual por idioma: aunque se soportan 53 idiomas, la evaluación publicada se limita a 15 idiomas en FLORES+, por lo que la calidad en el resto no está cuantificada públicamente.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial gratuito sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- Cuantización: esta variante GGUF introduce pérdida de precisión respecto a BF16; el autor publica tablas de diferencias de accuracy que conviene revisar antes de desplegar en producción.
- Idiomas no cubiertos: no se garantiza soporte para idiomas fuera de la lista de 53, incluidos muchos idiomas minoritarios.
- Sin datos de rendimiento en producción: no se publican cifras de latencia ni throughput para esta variante cuantizada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Modelo 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
