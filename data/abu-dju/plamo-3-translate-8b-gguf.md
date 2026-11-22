# Abu-Dju/plamo-3-translate-8b-GGUF

## Resumen

PLaMo 3 Translate 8B GGUF es la conversión al formato GGUF y cuantización para llama.cpp del modelo PLaMo 3 Translate 8B, un LLM especializado en traducción desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se entrena adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. Esta versión GGUF, publicada por el usuario Abu-Dju, permite ejecutar el modelo en hardware de consumo mediante llama.cpp.

El modelo cubre traducción entre 53 idiomas, con especial énfasis en la calidad japonés-inglés y en la traducción multilingüe. Admite contexto circundante y glosarios como entradas adicionales, y permite elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que la suma de entrada y salida no supere ese límite.

Con 8.531.750.912 parámetros (aproximadamente 8,5 mil millones), el modelo se distribuye bajo la PLaMo Community License, que permite uso personal, académico y no comercial sin registro previo, mientras que el uso comercial está sujeto a condiciones adicionales. Esta ficha describe la variante GGUF, que hereda las capacidades del modelo base pero está optimizada para inferencia local mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 8.531.750.912 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion; el repo ocupa 13,0 GB) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base PLaMo 3 Translate 8B se construye sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que especializa el modelo para la tarea de traducción multilingüe. La longitud máxima durante el entrenamiento fue de 32.768 tokens para la entrada y la salida combinadas, lo que condiciona el diseño de las ventanas de contexto en producción: los pasajes deben dividirse de forma que la suma de entrada y salida no supere ese límite.

La información disponible no detalla la arquitectura interna exacta (tipo de transformer, mecanismos de atención, innovaciones como decodificación especulativa o atención lineal), ni la composición exacta del dataset de entrenamiento más allá de la mención a "datos centrados en traducción". Tampoco se especifica si hubo fases de RLHF o DPO. Esta variante GGUF es una conversión y cuantización del modelo base realizada por Abu-Dju para su uso con llama.cpp, e incluye tablas de precisión comparando BF16 con cada formato de distribución para cada tamaño de modelo, según la model card del autor original.

## Capacidades

- Traducción entre 53 idiomas, con calidad destacada en japonés-inglés y en traducción multilingüe.
- Traducción con contexto circundante: el modelo puede tener en cuenta el texto previo o posterior para resolver ambigüedades.
- Soporte de glosarios: permite imponer terminología específica durante la traducción.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés en la salida.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Capacidad conversacional (tag "conversational") y compatibilidad con endpoints.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales y guías entre los 53 idiomas soportados, usando glosarios para mantener terminología consistente en toda la documentación.
- Localización de productos y software: integrado en pipelines de localización, permite traducir cadenas de interfaz y textos de marketing con control de estilo (llano o cortés) en japonés.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones multi-turno entre clientes y agentes, aprovechando el contexto circundante para resolver referencias y mantener coherencia terminológica.
- Traducción de contenido editorial largo: gracias a la ventana de 32.768 tokens combinados, puede traducir artículos, informes o capítulos completos en una sola pasada, reduciendo la pérdida de contexto entre fragmentos.
- Investigación académica y análisis comparativo: uso libre y gratuito para fines académicos según la licencia, adecuado para experimentos de traducción automática y evaluación de calidad.
- Despliegue local en estaciones de trabajo: la variante GGUF permite ejecutar el modelo con llama.cpp en hardware de consumo, útil para prototipos, demos y entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Traducción de correspondencia y documentos internos: en entornos empresariales con datos sensibles, el despliegue local evita la exposición de información a servicios externos, siempre que se cumplan los términos de la licencia para uso comercial.

## Benchmarks y rendimiento

La model card del modelo base reporta que PLaMo 3 Translate ofrece calidad de nivel mundial tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

- Fila superior: calidad japonés-inglés como media de PFTB, SaaS y WMT24++ COMET-22.
- Fila central: traducción entre japonés y otros 14 idiomas, como media de FLORES+ chrF++ en ambas direcciones.
- Fila inferior: traducción entre inglés y otros 14 idiomas, como media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso.

No se han publicado en la información disponible los valores numéricos concretos de estos benchmarks para el modelo de 8B, por lo que no se presentan cifras específicas. Para los detalles numéricos, la model card remite al tech blog de PFN.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 13,0 GB, lo que corresponde a las cuantizaciones incluidas; una cuantización de 4 bits de un modelo de 8,5B parámetros requiere aproximadamente 5-6 GB de VRAM, mientras que una de 8 bits ronda los 9-10 GB.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una GPU con 8-12 GB de VRAM puede ejecutar cuantizaciones de 4-8 bits, y GPUs de 24 GB o más (RTX 4090, A100, H100) permiten cuantizaciones mayores y mayor throughput.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits en GPUs con al menos 8 GB de VRAM; también puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp es el soporte nativo de esta variante GGUF; también es compatible con herramientas que consumen GGUF como Ollama o servidores basados en llama.cpp. Para vLLM o TGI sería necesario usar el modelo base en safetensors u otros formatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B GGUF (esta ficha) | 8,53B | 32.768 tokens (entrada + salida) | plamo-community-license | GGUF | Especializado en traducción, 53 idiomas |
| PLaMo 3 Translate 8B (BF16) | 8,53B | 32.768 tokens (entrada + salida) | plamo-community-license | safetensors | Modelo base original, misma calidad sin cuantizar |
| PLaMo 3 Translate 2B | no disponible | 32.768 tokens (entrada + salida) | plamo-community-license | safetensors, GGUF, etc. | Según la model card, supera a los LLM de traducción comparados en todas las métricas |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | Mencionado como comparación en la figura de benchmarks del modelo base |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | Mencionado como comparación en la figura de benchmarks del modelo base |

La información disponible no incluye especificaciones detalladas de TranslateGemma ni de HY-MT2, por lo que la comparación cuantitativa no puede completarse. La model card indica que PLaMo 3 Translate supera a estos modelos especializados en traducción en las métricas evaluadas, pero los valores numéricos no se detallan en el texto disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos masivos, puede reflejar sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinación: no se cuantifica en la información disponible; en tareas de traducción, el riesgo se manifiesta como adiciones, omisiones o alteraciones de sentido, especialmente en pasajes ambiguos o con terminología muy específica.
- Limitaciones de contexto: la ventana de 32.768 tokens es combinada de entrada y salida; los textos más largos deben dividirse, lo que puede afectar a la coherencia entre fragmentos.
- Limitaciones de idioma: aunque cubre 53 idiomas, la calidad puede variar entre pares; la evaluación publicada se centra en 15 idiomas y en las direcciones con japonés e inglés.
- Restricciones de licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro previo; el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia.
- Caveat para producción: esta variante GGUF es una conversión de terceros (Abu-Dju) del modelo de PFN; para producción crítica conviene validar la calidad de la cuantización frente al modelo BF16 original y considerar el uso del formato safetensors con vLLM o TGI si se requiere mayor throughput.
- La cuantización puede introducir degradaciones de precisión; la model card del modelo base incluye tablas comparativas de precisión entre BF16 y cada formato de distribución.

## Enlaces

- Repositorio Hugging Face de esta variante GGUF: https://huggingface.co/Abu-Dju/plamo-3-translate-8b-GGUF
- Modelo base PLaMo 3 Translate 8B (BF16): https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante GGUF oficial de PFN para 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Modelo 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Tech blog de PFN sobre la release de pesos: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
