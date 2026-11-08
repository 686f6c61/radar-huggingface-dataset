# pfnet/plamo-3-translate-0.8b-MLX-4bit

## Resumen

PLaMo 3 Translate 0.8B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción especializado PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción.

La relevancia de esta versión concreta es doble: por un lado, ofrece traducción de calidad "world-class" según el autor en un tamaño reducido de 0,8B parámetros (890.344.960 parámetros reales según los safetensors), lo que lo hace desplegable en hardware modesto; por otro, el formato MLX-4bit permite ejecutarlo de forma nativa y eficiente en Apple Silicon, un nicho habitualmente desatendido por los modelos de traducción especializados.

El modelo soporta traducción entre 53 idiomas, admite contexto circundante y glosarios, y permite elegir entre estilo llano y cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida. Se distribuye bajo la PLaMo Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3); requiere `custom_code` para su carga |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | 4 bits (MLX-4bit); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (uso personal, académico y no comercial gratuito sin registro; uso comercial sujeto a condiciones) |
| Formato de pesos | safetensors (cuantizados para MLX), librería `mlx` / `mlx-lm` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, construido a partir de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que especializa el modelo en la tarea de traducción multilingüe. La model card no detalla la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de especialización y de formato: el modelo incorpora en el prompt la posibilidad de aportar contexto circundante y glosarios, y de seleccionar el registro (llano o cortés) para la salida en japonés. La longitud máxima de entrenamiento de 32.768 tokens (entrada + salida) permite traducir pasajes largos de una sola vez, aunque el autor recomienda dividir textos que excedan ese límite combinado. Esta variante MLX-4bit aplica cuantización de pesos a 4 bits para el framework MLX de Apple, manteniendo la fidelidad de traducción según las tablas comparativas del autor (cuyos valores concretos no se incluyen en la información disponible).

## Capacidades

- Traducción multilingüe entre 53 idiomas, incluyendo pares que no pasan por el inglés.
- Traducción bidireccional con japonés e inglés como ejes principales de evaluación.
- Uso de contexto circundante para desambiguar y mantener coherencia en pasajes largos.
- Soporte de glosarios para forzar terminología concreta (nombres propios, términos técnicos, marcas).
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada gracias a la ventana de 32.768 tokens (entrada + salida).
- Ejecución nativa en Apple Silicon mediante MLX y `mlx-lm`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede traducir ficheros Markdown o fragmentos de documentación entre cualquiera de los 53 idiomas soportados, con glosarios que garanticen consistencia terminológica entre versiones.
- Localización de productos en Apple Silicon: al ser MLX-4bit, se puede ejecutar localmente en un Mac para traducir cadenas de interfaz, correos de marketing o textos de soporte sin enviar datos a servicios externos.
- Traducción de atención al cliente multilingüe: integrado en un sistema de tickets, traduce conversaciones multi-turno aprovechando el contexto circundante para mantener coherencia de nombres y referencias a lo largo del hilo.
- Traducción jurídica o administrativa con glosario: el soporte de glosarios permite fijar terminología legal o institucional, y el registro cortés en japonés encaja con comunicaciones formales.
- Subtitulado y traducción de contenidos audiovisuales: la ventana de 32.768 tokens permite procesar guiones o transcripciones completas de un episodio en una sola pasada, manteniendo coherencia de personajes y terminología.
- Investigación en traducción automática: al ser un modelo pequeño (0,8B) con licencia gratuita para uso académico, sirve como baseline reproducible para experimentos de evaluación (COMET, chrF++) y para estudiar el efecto de la cuantización 4-bit en calidad de traducción.
- Traducción offline en dispositivos: su tamaño reducido y el formato MLX permiten empaquetarlo en aplicaciones de escritorio para Mac que traduzcan sin conexión.

## Benchmarks y rendimiento

El autor publica una figura comparativa (no una tabla de valores numéricos en el texto disponible) que evalúa la calidad de traducción frente a TranslateGemma y HY-MT2. Las métricas empleadas son:

| Evaluación | Métrica | Idiomas evaluados |
|---|---|---|
| Japonés–inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | ja, en |
| Japonés ↔ 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | ja, en, ar, id, it, nl, ko, es, th, zh (simplificado y tradicional), de, fr, vi, ru |
| Inglés ↔ 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | en, ja, ar, id, it, nl, ko, es, th, zh (simplificado y tradicional), de, fr, vi, ru |

El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura. Los valores numéricos concretos de los benchmarks no están disponibles en la información proporcionada; no se inventan cifras.

## Requisitos de hardware

- VRAM/unified memory estimada: al tratarse de una cuantización 4-bit de un modelo de 0,8B, el peso ocupa aproximadamente 0,5 GB (el repositorio completo son 1,0 GB incluyendo metadatos y ficheros auxiliares). Con overhead de runtime, es razonable esperar un uso en torno a 1-2 GB, aunque la cifra exacta no está publicada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores), ya que el formato es MLX. No está pensado para GPU NVIDIA ni AMD en este formato concreto.
- Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o más.
- Despliegue: `mlx-lm` (librería indicada en la model card). Para otras plataformas, el autor ofrece variantes GGUF (llama.cpp/Ollama), FP8, W4A16, W4AFP8 y NVFP4 en repositorios separados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos destacados |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B MLX-4bit | 0,89B | 32.768 (entrada + salida) | 53 | plamo-community-license | MLX-4bit, safetensors |
| PLaMo 3 Translate 2B | no disponible | 32.768 (entrada + salida) | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 se mencionan en la figura de benchmarks del autor como modelos de traducción especializados comparables, pero la información disponible no incluye sus especificaciones técnicas, licencias ni resultados numéricos.

## Limitaciones y advertencias

- La ventana de 32.768 tokens es el máximo combinado de entrada y salida durante entrenamiento; textos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- El modelo está especializado en traducción: no se documentan capacidades de razonamiento general, código, matemáticas, tool calling ni agentes.
- Al ser una cuantización 4-bit, puede haber una degradación de calidad respecto al BF16; el autor publica tablas de diferencias de precisión, pero sus valores no están disponibles en la información proporcionada.
- Riesgo de alucinación y de omisiones en pasajes muy largos o con terminología poco frecuente; el uso de glosarios mitiga parcialmente el problema.
- Licencia PLaMo Community License: el uso personal y no comercial (incluido el académico) es gratuito sin registro, pero el uso comercial está sujeto a condiciones que deben consultarse en el enlace oficial antes de desplegar en producción.
- El formato MLX-4bit solo es ejecutable de forma nativa en Apple Silicon; para otros entornos hay que recurrir a las variantes GGUF, FP8 o NVFP4 del mismo modelo.
- La model card no detalla sesgos conocidos ni la composición del dataset de entrenamiento, lo que limita la evaluación de riesgos de sesgo lingüístico o cultural.
- No se han publicado en la información disponible datos de latencia, throughput ni requisitos exactos de memoria para esta variante cuantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante GGUF 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante FP8 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- MLX: https://github.com/ml-explore/mlx
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit/blob/main/README_ja.md
