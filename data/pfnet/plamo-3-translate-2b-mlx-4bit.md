# pfnet/plamo-3-translate-2b-MLX-4bit

## Resumen

PLaMo 3 Translate 2B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción PLaMo 3 Translate 2B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción.

La versión MLX-4bit está pensada para ejecución eficiente en hardware Apple Silicon mediante la librería MLX y mlx-lm. El repositorio ocupa 2,4 GB y el checkpoint contiene 914.481.664 parámetros en safetensors, pese a la denominación comercial "2B". El modelo cubre 53 idiomas y una longitud máxima de 32.768 tokens combinando entrada y salida durante el entrenamiento.

Su relevancia actual radica en que ofrece traducción especializada de calidad competitiva en un tamaño reducido y con licencia comunitaria que permite uso personal, académico y no comercial sin registro previo, lo que facilita el despliegue local en portátiles y estaciones de trabajo Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base PLaMo 3 NICT; detalles de capas y atención no disponibles) |
| Parametros totales | 914.481.664 (según safetensors); denominación comercial 2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens máximos combinando entrada y salida (longitud de entrenamiento) |
| Tipos de cuantizacion | 4-bit para MLX (esta variante); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4 y GGUF |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors (MLX), librería mlx, requiere custom_code |

## Arquitectura y entrenamiento

El modelo se basa en un transformer preentrenado (PLaMo 3 NICT) desarrollado conjuntamente por PFN y NICT, sobre el que se aplicó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. No se detallan en la información disponible el número exacto de capas, la configuración de atención ni la composición completa del dataset; tampoco se confirma el uso de RLHF o DPO.

La innovación principal es la especialización en traducción con soporte de contexto circundante y glosarios, además de la posibilidad de elegir entre estilo llano y estilo cortés en las salidas en japonés. La longitud máxima de entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada. Esta variante concreta aplica cuantización de pesos a 4 bits para MLX, orientada a inferencia en Apple Silicon.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares como japonés-inglés, inglés-español, japonés-coreano y combinaciones con árabe, tailandés, vietnamita, chino simplificado y tradicional, entre otros.
- Traducción con contexto circundante: el modelo puede tener en cuenta el texto previo o posterior para desambiguar.
- Soporte de glosarios: permite imponer terminología concreta en la salida.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés.
- Traducción de pasajes largos en una sola pasada dentro del límite de 32.768 tokens combinados.
- Pipeline declarado: translation.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica: el modelo puede procesar secciones completas de manuales dentro de su ventana de 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios.
- Localización de software en 53 idiomas: adecuado para pipelines que necesitan traducir cadenas y textos de interfaz entre idiomas europeos, asiáticos y de Oriente Medio con un único modelo.
- Traducción de correspondencia empresarial japonés-inglés con estilo cortés: el control de estilo en japonés permite generar salidas formales apropiadas para comunicación corporativa.
- Subtitulado y traducción de contenido audiovisual: la capacidad de tener en cuenta contexto circundante ayuda a resolver ambigüedades en diálogos.
- Traducción en dispositivos Apple: al estar cuantizado a 4 bits para MLX, puede ejecutarse localmente en Macs sin enviar datos a servicios en la nube, útil para contenido sensible.
- Atención al cliente multilingüe: traducción de tickets y conversaciones entre idiomas con glosarios específicos del dominio para mantener consistencia en nombres de producto.
- Investigación lingüística y evaluación de traducción: al ser un modelo pequeño y de licencia gratuita para uso académico, sirve como referencia en experimentos de traducción automática.

## Benchmarks y rendimiento

La model card indica que el modelo de 2B supera a los LLM especializados en traducción comparados (TranslateGemma y HY-MT2) en todas las métricas de la figura publicada, pero no se proporcionan los valores numéricos en la información disponible. Las métricas empleadas son:

- Calidad japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Traducción entre japonés y 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

| Benchmark | Resultado |
|---|---|
| PFTB / SaaS / WMT24++ COMET-22 (ja-en) | no disponible (valores numéricos no publicados en la información) |
| FLORES+ chrF++ (ja y 14 idiomas) | no disponible (valores numéricos no publicados en la información) |
| FLORES+ chrF++ (en y 14 idiomas) | no disponible (valores numéricos no publicados en la información) |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 2,4 GB en 4-bit, por lo que se requiere al menos ~3 GB de memoria libre para los pesos, más overhead de contexto y activaciones.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para GPU NVIDIA en este formato.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior; con 16 GB se dispone de margen amplio para contextos largos.
- Despliegue: librería MLX y mlx-lm; requiere custom_code. Para otras plataformas existen variantes GGUF (llama.cpp), FP8, W4A16, W4AFP8 y NVFP4 del mismo modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B MLX-4bit | 914 M (nominal 2B) | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | MLX 4-bit |
| PLaMo 3 Translate 0.8B MLX-4bit | no disponible | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | MLX 4-bit |
| PLaMo 3 Translate 8B MLX-4bit | no disponible | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | MLX 4-bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción comparados, pero no se detallan sus especificaciones en la información disponible.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial.
- El límite de 32.768 tokens es la suma de entrada y salida; pasajes más largos deben dividirse, lo que puede afectar la coherencia entre fragmentos.
- Al ser una cuantización a 4 bits, puede existir una degradación de calidad respecto al BF16; la model card incluye tablas de diferencias de precisión por formato que no se detallan en la información disponible.
- No se documentan sesgos específicos ni tasas de alucinación; como modelo de traducción, el riesgo principal es la mistraducción o la omisión de contenido en textos ambiguos o muy técnicos.
- El formato MLX limita su uso a hardware Apple; para otros entornos debe recurrirse a las variantes GGUF, FP8 o NVFP4.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su uso en pipelines que requieran function calling.
- La información sobre arquitectura interna (capas, atención, dataset exacto) no está disponible, lo que dificulta evaluaciones técnicas detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-2b-NVFP4
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia comunitaria PLaMo: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit/blob/main/README_ja.md
- Repositorio MLX: https://github.com/ml-explore/mlx
