# ngocdang83/HachimiMT-60-QT

## Resumen

HachimiMT-60-QT es un modelo de traducción automática neuronal especializado en la traducción de chino a vietnamita, desarrollado por el usuario ngocdang83. Se trata de un modelo basado en la arquitectura Marian (transformer encoder-decoder para traducción) con 56,4 millones de parámetros, diseñado específicamente para traducir novelas web chinas (webnovel) al vietnamita utilizando el registro de pronombres denominado "truyện convert", un estilo arcaico sino-vietnamita con el que los lectores de novelas web vietnamitas están familiarizados (ta, ngươi, hắn, nàng, tỷ tỷ, ca ca).

El modelo resuelve un problema muy concreto: la consistencia de voz y la correcta interpretación de términos culturales, modismos chinos (chengyu), argot web y términos de parentesco dentro de un registro estilístico fijo. La versión v1.2 (actualizada el 23 de octubre de 2026) continúa el entrenamiento sobre versiones anteriores con 3.444 frases nuevas centradas en corregir errores de términos y de interpretación de roles gramaticales, manteniendo la misma arquitectura, tokenizador y archivos (actualización drop-in).

Es relevante en el nicho de la traducción automática literaria de bajo recurso: modelos pequeños y especializados que superan en consistencia estilística a modelos generalistas mucho mayores para una tarea y un par de idiomas muy específicos, con un coste de inferencia mínimo (menos de 1 GB de pesos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción automática neuronal) |
| Parametros totales | 56.397.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 mediante CTranslate2 (configuración de referencia publicada por el autor); no se detallan otras |
| Idiomas soportados | chino (zh) → vietnamita (vi) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (transformers); conversión a CTranslate2 INT8 para despliegue |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder clásico para traducción automática neuronal, con 56,4 millones de parámetros totales. Está entrenado para la dirección chino→vietnamita y comparte tokenizador y arquitectura entre versiones (v1.0, v1.1, v1.2), lo que permite actualizaciones drop-in mediante el pinning de revisiones (`revision="v1.1"`, `revision="v1.0"`).

El entrenamiento se ha realizado en fases incrementales de ajuste fino. La v1.1 continuó el entrenamiento durante 2.000 pasos sobre 5.380 frases minadas manualmente que cubrían expresiones "long-tail" (modismos verbo-objeto como 背黑锅, 敲竹杠, 碰钉子, 钻牛角尖, 狮子大开口, 翻旧账; el modismo 宁缺毋滥; el causativo literario 教; 莫不; palabras tipo 讨X y 凛然), con frases de contraste para preservar los sentidos ordinarios, más 30.000 frases de replay de los datos originales para evitar regresión. La v1.2 añadió 2.000 pasos más sobre 3.444 frases nuevas (vistas tres veces cada una): 3.143 frases para 861 "celdas" de términos (argot web como 打call, 破防, 凡尔赛, 柠檬精; chengyu; palabras polisémicas; términos de parentesco como 姨父, 妯娌; y palabras gramaticales) y 301 frases para corregir un error de rol del sujeto cuando el hablante se autodenomina con un título (本座, 朕, 老夫, 在下, 本王) seguido de 不要 o 且. Las traducciones del profesor fueron validadas por jueces LLM y una muestra de control de calidad fue puntuada por dos agentes revisores independientes (3,6 % de errores). Los datasets citados son `ngocdang83/tran-vi-teacher` y `chi-vi/hirashiba-mt-zh2vi-b-filtered`.

## Capacidades

- Traducción de texto chino→vietnamita con registro estilístico "convert" (pronombres arcaicos sino-vietnamitas: ta, ngươi, hắn, nàng, tỷ tỷ, ca ca).
- Consistencia de voz estable a lo largo de capítulos completos: el autor reporta 0 cambios de registro en todas las clases de pronombres sobre un test de 7 capítulos.
- Manejo de argot web chino (打call, 破防, 凡尔赛, 柠檬精) con equivalencias vietnamitas naturales.
- Traducción de chengyu y modismos (卸磨杀驴, 事半功倍, 八字没一撇, 唇亡齿寒, 宁缺毋滥, 背黑锅, 敲竹杠, 碰钉子, 狮子大开口, 翻旧账) a expresiones vietnamitas equivalentes en lugar de traducciones literales.
- Interpretación correcta de términos de parentesco (姨父 → "Dượng", 妯娌) y de títulos de autodenominación del hablante (朕, 老夫, 本座, 在下, 本王).
- Manejo del causativo literario 教 como "khiến" y no como "dạy".
- Traducción de nombres propios con lectura sino-vietnamita (con limitaciones en nombres raros).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking); es un modelo NMT puro de text2text-generation.

## Casos de uso

- Traducción de novelas web chinas (xianxia, wuxia, urbanas) al vietnamita: el modelo está entrenado específicamente para el registro "truyện convert" y mantiene la voz estable capítulo a capítulo, lo que reduce la necesidad de edición posterior de pronombres y registro.
- Localización de capítulos seriados con actualizaciones frecuentes: al ser un modelo de 56 M de parámetros con inferencia INT8 en CTranslate2, permite procesar capítulos completos con coste computacional mínimo en CPU o GPU modesta.
- Preprocesado en pipelines de publicación de webnovel: integrable como etapa de traducción automática previa a la revisión humana, con salida en un registro ya familiar para el lector final.
- Traducción de diálogos con títulos de autodenominación (emperador, maestro, anciano): la v1.2 corrige específicamente la lectura errónea de 不要/且 tras títulos como 朕, 老夫 o 本王, lo que mejora la fidelidad en escenas de diálogo de novela histórica y xianxia.
- Traducción de contenido con argot de internet y modismos: útil para subtitulado o localización de contenido chino con abundante slang web y chengyu, donde los modelos generalistas tienden a la traducción literal.
- Despliegue en entornos con recursos limitados: al ocupar menos de 1 GB en el repositorio y poder ejecutarse con CTranslate2 INT8, es viable en servidores sin GPU dedicada o en dispositivos de borde para traducción por lotes.
- Investigación en NMT de bajo recurso: sirve como caso de estudio de ajuste fino incremental con datasets de profesor, replay y evaluación por jueces LLM para pares de idiomas con pocos recursos.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no son benchmarks estándar como MMLU o HumanEval, sino evaluaciones internas de la tarea):

| Metrica | v1.1 | v1.2 |
|---|---|---|
| Tasa de error en terminos objetivo (323 frases held-out, jueces LLM) | 31,8 % | 25,5 % |
| Lectura erronea de titulo + 不要 / 且 (132 frases de prueba) | 72,7 % | 14,4 % |
| Otras celdas del mismo conjunto held-out | 7,0 % | 7,6 % (dentro del ruido) |
| BLEU en suite limpia de 1.368 frases | 52,9 | 53,0 |
| Tasa de repeticion | 0,51 % | 0,58 % |
| Consistencia de voz (cambios de pronombre en test de 7 capitulos) | 0 | 0 |
| Lectura de nombres (13.561 frases reales, 4.518 nombres) | — | +0,06 puntos porcentuales |
| Nombres raros fragiles (230 frases) | — | 224 → 220 aciertos |

Para v1.0 → v1.1: revisión ciega por dos revisores independientes sobre 192 frases nuevas, severidad media de error 0,92 → 0,59 (v1.1 mejor en 46 frases, peor en 14); sobre el pack de 175 frases de la primera ronda, 1,01 → 0,50 (53 mejores / 10 peores).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (56,4 M de parámetros, ~225 MB de pesos); en INT8 con CTranslate2, del orden de decenas de MB de pesos más overhead de runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); el modelo no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer e incluso en CPU: el autor publica resultados con CTranslate2 INT8 y beam 1, lo que indica despliegue viable sin GPU.
- Opciones de despliegue: transformers (librería nativa, safetensors), CTranslate2 (INT8, configuración de referencia del autor); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor reporta inferencia frase a frase con beam 1 en CTranslate2 INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| HachimiMT-60-QT | 56,4 M | no disponible | zh → vi | CC BY 4.0 | NMT especializado en webnovel y registro convert |
| HachimiMT-60 (v1.0 base) | 56,4 M (misma arquitectura) | no disponible | zh → vi | CC BY 4.0 | Versión anterior del mismo modelo, sin las correcciones de v1.1/v1.2 |
| Modelos NMT generalistas tipo Marian/OPUS-MT zh-vi | variable | no disponible | zh → vi | variable | Traducción general, sin especialización en registro literario ni argot web |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Errores residuales en términos: la tasa de error en términos objetivo sigue siendo del 25,5 % en v1.2 sobre el conjunto held-out.
- Casos débiles documentados por el autor: 咱们不要吃 ("let's not eat") se traduce como "Chúng ta không cần ăn"; tras 师父 / 为师 + 不要 el modelo produce "không cần"; 放鸽子 ya no es literal pero puede seguir siendo incorrecto ("hối hận cho kẻ khác"); nombres raros pueden cambiar una sílaba (苏淡月 → "Tô Nhàn Nguyệt"; 张拙 puede salir como "Trương Phán").
- Riesgo de alucinación en la lectura de nombres propios y en términos poco frecuentes, incluso en la versión más reciente.
- Modelo unidireccional: solo chino→vietnamita; no soporta otros pares de idiomas.
- Longitud de contexto no documentada; es un modelo NMT pensado para traducción frase a frase, no para documentos largos con contexto global.
- Licencia CC BY 4.0: permite uso comercial con atribución; no se imponen restricciones adicionales documentadas, pero conviene verificar la atribución al autor.
- Es un modelo de nicho con 426 descargas y 6 likes en el momento de la consulta; no ha pasado por evaluaciones externas independientes más allá de las internas del autor.
- No dispone de tool calling, agentes ni capacidades multimodales; no debe emplearse fuera de la tarea de traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngocdang83/HachimiMT-60-QT
- Versión base v1.0: https://huggingface.co/ngocdang83/HachimiMT-60-zh-vi
- README en vietnamita: https://huggingface.co/ngocdang83/HachimiMT-60-QT/blob/main/README_vi.md
- Dataset de profesor: https://huggingface.co/datasets/ngocdang83/tran-vi-teacher
- Dataset filtrado zh2vi: https://huggingface.co/datasets/chi-vi/hirashiba-mt-zh2vi-b-filtered
