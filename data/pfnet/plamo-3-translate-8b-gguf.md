# pfnet/plamo-3-translate-8b-GGUF

## Resumen

PLaMo 3 Translate 8B GGUF es la versión en formato GGUF, cuantizada para llama.cpp, del modelo de traducción especializado PLaMo 3 Translate 8B desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción.

Con 8.531.750.912 parámetros totales, el modelo cubre traducción entre 53 idiomas, incluyendo pares que no involucran el inglés, y admite contexto adicional y glosarios para mejorar la coherencia terminológica. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

La relevancia de esta ficha radica en que combina un modelo de traducción de calidad declarada como puntera con un formato GGUF que facilita el despliegue en llama.cpp sobre hardware modesto, algo poco habitual en modelos de traducción especializados de este tamaño. La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traducción; detalles no publicados en la información disponible) |
| Parámetros totales | 8.531.750.912 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantización | GGUF (el repo contiene múltiples niveles de cuantización; el modelo base ofrece además BF16, FP8, W4A16, W4AFP8 y NVFP4 en repos separados) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF (repo de 13,0 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de atención, número de capas, dimensiones ocultas ni si emplea alguna variante específica de transformer). Lo que sí se documenta es el proceso de entrenamiento: el modelo parte de PLaMo 3 NICT, un preentrenado desarrollado conjuntamente por PFN y NICT, y se somete a un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La longitud máxima manejada durante el entrenamiento fue de 32.768 tokens contando entrada y salida de forma conjunta.

El modelo incorpora mecanismos específicos para traducción contextual: puede recibir contexto circundante y un glosario para condicionar la salida, y en el caso del japonés permite elegir entre estilo llano (plain) y estilo cortés (polite). No se especifica en la información proporcionada si se aplicaron fases de RLHF, DPO u otras técnicas de alineación, ni la composición exacta del dataset de entrenamiento más allá de su volumen y su orientación a traducción.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares directos entre idiomas distintos del inglés (por ejemplo, japonés-coreano o español-alemán).
- Traducción condicionada por contexto circundante, útil para resolver ambigüedades en documentos largos o conversaciones.
- Soporte de glosarios para forzar terminología concreta en la salida.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada gracias a la ventana de 32.768 tokens (entrada más salida).
- Formato conversacional (tag `conversational`) y compatibilidad con endpoints de HuggingFace.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede procesar secciones completas de manuales dentro de la ventana de 32.768 tokens, manteniendo coherencia terminológica mediante glosarios por proyecto.
- Localización de productos con terminología controlada: el soporte de glosario permite fijar nombres de marca, términos legales o cadenas de interfaz, reduciendo la revisión posterior en equipos de localización.
- Atención al cliente multilingüe: integrado en un pipeline de soporte, traduce mensajes entrantes y respuestas con contexto conversacional, cubriendo 53 idiomas con un único modelo.
- Traducción de artículos y prensa con contexto: al aceptar contexto circundante, mejora la desambiguación en textos periodísticos donde frases aisladas pierden sentido.
- Subtitulado y transcripción traducida: para flujos que generan texto en un idioma y necesitan salida en otro con estilo controlado (por ejemplo, japonés cortés para audiencias formales).
- Despliegue en local o en el borde: al estar en GGUF, puede ejecutarse con llama.cpp en estaciones de trabajo sin GPU dedicada o con GPU de consumo, útil para traducción offline con requisitos de privacidad.
- Investigación en traducción automática: como baseline reproducible en formato GGUF para experimentos de evaluación con COMET, chrF++ y FLORES+.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas (PFTB, SaaS y WMT24++ COMET-22 para japonés-inglés; FLORES+ chrF++ para pares con japonés e inglés frente a 14 idiomas) frente a TranslateGemma y HY-MT2, pero no se proporcionan los valores numéricos en la información disponible. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 8,53 mil millones de parámetros, las cuantizaciones GGUF típicas de 4 bits rondan los 5-6 GB y las de 8 bits en torno a 9-10 GB, aunque el repo completo ocupa 13,0 GB al incluir varios niveles.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM en cuantizaciones bajas.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones de 4-5 bits en tarjetas con 8 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (formato nativo del repo); el modelo base dispone de variantes para otros runners, pero no se detallan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B GGUF | 8,53 B | 32.768 (entrada + salida) | 53 | PLaMo Community License | GGUF |
| PLaMo 3 Translate 2B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 31B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción especializados comparados en las gráficas de calidad, pero no aporta sus especificaciones técnicas en la información disponible.

## Limitaciones y advertencias

- La ventana de 32.768 tokens cubre entrada y salida combinadas; los documentos más largos deben dividirse en fragmentos para no exceder ese límite.
- No se documentan sesgos específicos ni evaluaciones de robustez por idioma; el rendimiento puede variar entre los 53 idiomas y no se garantiza paridad de calidad.
- Riesgo de alucinación inherente a los modelos generativos: en traducción puede manifestarse como adiciones, omisiones o terminología inventada, especialmente en idiomas de bajos recursos.
- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben revisarse antes de desplegar en producción.
- El modelo está especializado en traducción; no se documenta soporte de tool calling, agentes ni otras capacidades generales, por lo que no debe asumirse como modelo de propósito general.
- La información sobre arquitectura interna, alineación y composición del dataset es escasa, lo que dificulta auditar el comportamiento del modelo.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-8b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF/blob/main/README_ja.md
