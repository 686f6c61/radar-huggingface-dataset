# pfnet/plamo-3-translate-8b-MLX-4bit

## Resumen

PLaMo 3 Translate 8B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN). Se trata de un LLM especializado en traducción construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y posteriormente afinado con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre la traducción entre 53 idiomas, incluyendo pares que no involucran al inglés ni al japonés, y permite incorporar contexto circundante y glosarios en la petición, además de elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima manejada durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que habilita traducir pasajes largos en una sola pasada.

Esta variante MLX-4bit está pensada para ejecución local en hardware Apple Silicon mediante la librería MLX y mlx-lm. El repositorio ocupa 6,1 GB y las descargas registradas superan las 2.100, lo que refleja interés en despliegues de traducción en equipo de escritorio. La licencia es la PLaMo Community License, que permite uso personal, educativo y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3); detalles internos no disponibles |
| Parametros totales | 2.076.717.056 (según safetensors del repositorio MLX-4bit); la variante BF16 de referencia se denomina 8B, discrepancia no aclarada en la información disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | 4 bits para MLX; el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors (MLX), librería mlx, requiere custom_code |

## Arquitectura y entrenamiento

La información disponible confirma que PLaMo 3 Translate 8B se construye sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y que después se sometió a un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. No se detalla en la documentación proporcionada la arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención, uso o no de MoE), ni la composición del corpus de preentrenamiento, ni si hubo fases de RLHF o DPO. La model card remite al blog técnico de Preferred Networks para los detalles de desarrollo.

El aspecto técnico diferencial es la especialización en traducción con control de contexto y glosario: el modelo acepta texto circundante y un glosario como parte de la entrada, lo que permite mantener coherencia terminológica en documentos largos. Además, para japonés se puede seleccionar entre registro llano y cortés. La ventana de entrenamiento de 32.768 tokens combinados entrada/salida condiciona el diseño de los pipelines: pasajes más largos deben dividirse. Esta variante MLX-4bit aplica cuantización de pesos a 4 bits para el runtime MLX de Apple, con el objetivo de reducir huella de memoria a costa de una posible pérdida de precisión que la model card documenta en tablas comparativas por tamaño (el contenido de esas tablas no está incluido en la información disponible).

## Capacidades

- Traducción multilingüe entre 53 idiomas, incluyendo pares directos sin inglés ni japonés como lengua puente.
- Traducción bidireccional evaluada entre japonés o inglés y otras 14 lenguas (árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso, además de las lenguas de origen).
- Uso de contexto circundante para desambiguar y mantener coherencia en documentos extensos.
- Soporte de glosario para forzar terminología concreta en la salida.
- Control de estilo en japonés: registro llano o cortés.
- Traducción de pasajes largos en una sola pasada hasta 32.768 tokens combinados de entrada y salida.
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales completos por secciones de hasta 32.768 tokens combinados, pasando contexto previo y un glosario de términos del producto para mantener terminología consistente entre capítulos.
- Traducción de atención al cliente en múltiples idiomas: con 53 lenguas cubiertas y control de estilo en japonés, se puede integrar en un sistema de respuestas que traduzca tickets entrantes y salientes manteniendo el registro adecuado.
- Traducción jurídica o administrativa asistida: el uso de glosario permite fijar terminología legal y el contexto circundante ayuda a resolver referencias entre cláusulas, reduciendo variaciones terminológicas dentro de un mismo expediente.
- Despliegue en estación de trabajo Apple Silicon: al estar cuantizado a 4 bits para MLX, puede ejecutarse en local con mlx-lm en un Mac, útil para equipos que traducen material sensible sin enviar texto a servicios en la nube.
- Traducción de subtítulos y contenido audiovisual: la ventana de 32.768 tokens permite procesar bloques amplios de diálogo con contexto, y el estilo llano o cortés en japonés facilita adaptar el registro al tipo de producción.
- Preprocesado multilingüe para pipelines de datos: traducción de corpus entre pares no ingleses (por ejemplo, coreano a español o árabe a indonesio) para enriquecer datasets de entrenamiento o evaluación.
- Evaluación comparativa de motores de traducción: la disponibilidad de cuatro tamaños (0.8B, 2B, 8B, 31B) y múltiples formatos permite elegir el punto de equilibrio entre calidad y coste computacional según el caso.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate alcanza calidad de referencia en traducción japonés-inglés y multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

- Japonés-inglés: media de PFTB, SaaS y WMT24++ con COMET-22.
- Japonés a 14 idiomas y viceversa: media de FLORES+ chrF++ en ambas direcciones.
- Inglés a 14 idiomas y viceversa: media de FLORES+ chrF++ en ambas direcciones.

Los valores numéricos concretos no están incluidos en la información proporcionada; la model card los presenta únicamente en forma de figura (`figures/benchmark_en.png`) y remite al blog técnico. No se han publicado resultados numéricos de benchmarks en la información disponible, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio MLX-4bit ocupa 6,1 GB, por lo que se requiere al menos ese espacio para los pesos, más overhead de activaciones y caché KV para contextos largos.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA ni AMD en este formato; para esas plataformas existen las variantes FP8, W4A16, W4AFP8, NVFP4 y GGUF del modelo base.
- Cabe en equipos consumer Apple: un Mac con memoria unificada de 16 GB o superior debería poder cargar los pesos de 6,1 GB, dejando margen para el contexto; con 8 GB el margen es muy ajustado para secuencias largas.
- Opciones de despliegue: MLX y mlx-lm. Para otros runtimes (vLLM, TGI, llama.cpp, Ollama) deben usarse las variantes correspondientes del modelo base (GGUF para llama.cpp/Ollama, FP8 o NVFP4 para vLLM/TGI en GPU).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| PLaMo 3 Translate 8B MLX-4bit | 2.076.717.056 (safetensors del repo) | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | MLX 4-bit | Especializado en traducción, contexto y glosario |
| PLaMo 3 Translate 2B | no disponible en la información | 32.768 tokens (máximo de entrenamiento del modelo base) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit | Según la model card, supera a los LLM de traducción comparados en todas las métricas |
| PLaMo 3 Translate 0.8B | no disponible en la información | 32.768 tokens (máximo de entrenamiento del modelo base) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit | Opción de menor coste de la familia |
| PLaMo 3 Translate 31B | no disponible en la información | 32.768 tokens (máximo de entrenamiento del modelo base) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit | Opción de mayor tamaño de la familia |
| TranslateGemma | no disponible en la información | no disponible | no disponible | no disponible | no disponible | Mencionado como comparación en la figura de benchmarks de la model card |
| HY-MT2 | no disponible en la información | no disponible | no disponible | no disponible | no disponible | Mencionado como comparación en la figura de benchmarks de la model card |

No se dispone de datos numéricos de rendimiento de TranslateGemma ni de HY-MT2 en la información proporcionada, por lo que la comparación cuantitativa no puede reproducirse aquí.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad de traducción respecto a BF16; la model card incluye tablas de diferencias de precisión por formato cuyo contenido no está disponible en la información proporcionada.
- El límite de 32.768 tokens es la suma de entrada y salida durante el entrenamiento; documentos más largos deben dividirse, lo que puede romper la coherencia si no se aporta contexto entre fragmentos.
- El modelo está especializado en traducción; no se documenta su comportamiento en otras tareas (generación libre, código, matemáticas, razonamiento), por lo que no debe asumirse un rendimiento generalista.
- No se documentan sesgos idiomáticos ni de dominio en la información disponible; al cubrir 53 idiomas con volúmenes de datos presumiblemente desiguales, es esperable una calidad heterogénea entre pares, aunque no se aportan cifras por par en la información disponible.
- Riesgo de alucinación en traducción: no se documentan mitigaciones específicas en la información disponible.
- La licencia PLaMo Community License permite uso personal, educativo y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales; debe revisarse el texto completo antes de desplegar en producción.
- El formato MLX-4bit solo es utilizable en el ecosistema MLX (Apple Silicon); no es portable a vLLM, TGI o llama.cpp sin recurrir a otras variantes del modelo.
- El repositorio requiere `custom_code` y la librería mlx; la integración con herramientas que no soporten código personalizado puede fallar.
- Existe una discrepancia entre el nombre comercial "8B" y el recuento de parámetros del safetensors del repositorio MLX-4bit (2.076.717.056); conviene verificar el tamaño real antes de dimensionar el hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante GGUF 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Variante FP8 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-FP8
- Variante NVFP4 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4
- Variante W4A16 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Variante W4AFP8 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Repositorio MLX: https://github.com/ml-explore/mlx
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit/blob/main/README_ja.md
