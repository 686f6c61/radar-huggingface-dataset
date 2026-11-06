# pfnet/plamo-3-translate-31b-GGUF

## Resumen

PLaMo 3 Translate 31B GGUF es la versión cuantizada en formato GGUF del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). Está pensado para su uso con llama.cpp y otros motores compatibles con GGUF, lo que permite desplegar un modelo de traducción de 31.757 millones de parámetros en hardware más modesto que el requerido por los pesos en BF16. El modelo base se construyó a partir de PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT), y se afinó posteriormente con decenas de miles de millones de tokens de datos orientados a traducción.

La especialización es clara: no es un modelo generalista, sino un traductor multilingüe que cubre 53 idiomas, con soporte para contexto adicional y glosarios, y con la posibilidad de elegir entre estilo llano y cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que se respete ese límite combinado.

Su relevancia actual radica en dos factores. Primero, la familia PLaMo 3 Translate se distribuye en cuatro tamaños (0.8B, 2B, 8B y 31B) con múltiples formatos de cuantización (BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX), lo que facilita integrarla en distintos entornos de producción. Segundo, la licencia PLaMo Community permite uso personal, académico y no comercial sin registro previo, lo que reduce la barrera de entrada para evaluación e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traducción; detalles no especificados en la información proporcionada) |
| Parametros totales | 31.757.456.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | GGUF (el repositorio distribuye variantes cuantizadas; niveles concretos no detallados en la información proporcionada) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF (derivado de safetensors del modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un LLM especializado en traducción. El modelo base, PLaMo 3 Translate 31B, parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que constituye el núcleo del ajuste especializado.

El modelo incorpora dos capacidades diferenciales en el prompt: la posibilidad de proporcionar contexto circundante y un glosario para condicionar la traducción, y la selección de estilo llano o cortés para la salida en japonés. La ventana de entrenamiento de 32.768 tokens combinados entre entrada y salida marca el límite práctico para traducir documentos largos en una sola pasada. No se especifican en la información proporcionada detalles sobre el uso de RLHF, DPO ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Traducción entre 53 idiomas, con especial foco en la calidad japonés-inglés y en la traducción multilingüe.
- Traducción bidireccional entre japonés o inglés y otros 14 idiomas en la evaluación FLORES+ (árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso).
- Uso de contexto circundante para desambiguar y mantener coherencia en pasajes largos.
- Soporte de glosarios para imponer terminología concreta en la traducción.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada dentro del límite de 32.768 tokens combinados.
- Conversacional (etiqueta `conversational` en el repositorio).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas dentro de la ventana de 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios, lo que resulta adecuado para documentación de producto con vocabulario especializado.
- Localización de software y cadenas de interfaz: el soporte de glosarios permite fijar traducciones consistentes de términos de producto, y la cobertura de 53 idiomas simplifica la gestión de un único modelo para múltiples mercados.
- Atención al cliente multilingüe: puede integrarse como capa de traducción en sistemas de soporte que reciben mensajes en distintos idiomas, aprovechando el contexto conversacional y la ventana amplia para hilos de varios turnos.
- Traducción de contenido editorial y marketing: la opción de estilo llano o cortés en japonés permite adaptar el registro al público objetivo, algo relevante para campañas dirigidas a mercados japoneses.
- Investigación en traducción automática: al distribuirse en cuatro tamaños con múltiples formatos de cuantización y bajo licencia comunitaria, es útil para estudios comparativos de calidad frente a cuantización y para experimentos académicos sin coste de licencia.
- Procesamiento de correspondencia y documentos legales o administrativos: la posibilidad de aportar contexto circundante ayuda a resolver ambigüedades en textos formales, aunque requiere revisión humana por el riesgo de error en terminología jurídica.
- Despliegue en local con llama.cpp: la versión GGUF permite ejecutar el modelo en estaciones de trabajo sin GPUs de datacenter, útil para prototipos y para entornos con requisitos de privacidad que impiden enviar texto a servicios en la nube.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas agregadas: PFTB, SaaS y WMT24++ COMET-22 para japonés-inglés, y FLORES+ chrF++ para las combinaciones con 14 idiomas adicionales. Sin embargo, los valores numéricos concretos no se recogen en el texto proporcionado, por lo que no se presentan cifras.

| Benchmark | Resultado |
|---|---|
| PFTB / SaaS / WMT24++ COMET-22 (japonés-inglés) | no disponible (solo figura comparativa, sin cifras en el texto) |
| FLORES+ chrF++ (japonés y 14 idiomas) | no disponible (solo figura comparativa, sin cifras en el texto) |
| FLORES+ chrF++ (inglés y 14 idiomas) | no disponible (solo figura comparativa, sin cifras en el texto) |

La model card afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura, pero no se aportan los números en el texto disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia orientativa, un modelo de 31.757 millones de parámetros en BF16 requeriría aproximadamente 63,5 GB solo para pesos; en cuantizaciones de 4 bits, el peso se reduciría a alrededor de 16-18 GB, aunque el repositorio ocupa 96,0 GB en total por incluir varias variantes.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el formato BF16 encaja en A100 80 GB o H100; las variantes cuantizadas de 4 bits podrían ejecutarse en GPUs de 24 GB como la RTX 4090, sujeto a verificación con los ficheros concretos.
- Cabe en GPU de consumo: probable en cuantizaciones de 4 bits en GPUs de 24 GB, pero no confirmado en la información disponible.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el modelo base dispone además de variantes FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit en repositorios separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card menciona dos alternativas empleadas en su evaluación comparativa, pero no aporta sus especificaciones técnicas.

| Modelo | Parametros | Contexto | Calidad de traduccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B GGUF | 31.757 M | 32.768 tokens (entrada + salida) | Referencia de la comparativa (cifras no disponibles) | PLaMo Community License | HuggingFace (GGUF y otros formatos) |
| TranslateGemma | no disponible | no disponible | Inferior según la figura de la model card (cifras no disponibles) | no disponible | no disponible en la información proporcionada |
| HY-MT2 | no disponible | no disponible | Inferior según la figura de la model card (cifras no disponibles) | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Sesgos: no documentados en la información proporcionada; al ser un modelo entrenado con datos masivos de traducción, es previsible que herede sesgos de esos corpus, pero no hay análisis publicado en la model card.
- Riesgo de alucinación: no cuantificado; en traducción, el riesgo se manifiesta como adiciones, omisiones o terminología inventada, especialmente en idiomas de bajos recursos dentro de los 53 soportados.
- Límite de contexto: 32.768 tokens combinando entrada y salida; los documentos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- Cobertura desigual entre idiomas: la evaluación FLORES+ se realizó solo con 15 de los 53 idiomas, por lo que la calidad en el resto no está verificada públicamente.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial antes de desplegar en producción.
- Formato GGUF: las cuantizaciones introducen pérdida de precisión; la model card incluye tablas de diferencias de calidad respecto a BF16, pero los valores no están recogidos en la información disponible, por lo que conviene validar la variante elegida con datos propios.
- Especialización: es un modelo de traducción, no un asistente general; no se documentan capacidades de razonamiento, código o tool calling, por lo que no debe emplearse como sustituto de un LLM generalista.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF/blob/main/README_ja.md
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante FP8 del 31B: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4A16 del 31B: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante W4AFP8 del 31B: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante NVFP4 del 31B: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante MLX-4bit del 31B: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
