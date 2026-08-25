# mradermacher/Omega-Evolution-31B-v4.0-i1-GGUF

## Resumen

Omega-Evolution-31B-v4.0-i1-GGUF es una cuantización GGUF del modelo base ReadyArt/Omega-Evolution-31B-v4.0, publicada por el usuario mradermacher en HuggingFace. El modelo original es un transformador de 31.000 millones de parámetros (30.697.345.596 según los safetensors) orientado a tareas de roleplay, conversación sin filtros y contenido explícito, y según la model card del cuantizador, se trata de un modelo de visión (vision model) que acepta entradas de imagen además de texto. La cuantización emplea la técnica imatrix (importance matrix) para optimizar la calidad de los pesos comprimidos, y se ofrece en múltiples formatos de cuantización (Q2_K, IQ3_M, Q4_K_S, Q5_K_M, etc.), lo que permite ajustar el equilibrio entre tamaño y rendimiento según el hardware disponible.

La relevancia de este modelo radica en que permite ejecutar localmente un LLM de gran tamaño con capacidades multimodales y sin restricciones de alineación, algo poco común en modelos abiertos. La licencia declarada es Apache 2.0, aunque las etiquetas del repositorio indican que el modelo original puede tener condiciones de uso específicas (marcado como "Other License"). No se dispone de información pública sobre el entrenamiento, los datos o los benchmarks del modelo base, por lo que la ficha se basa únicamente en los datos proporcionados por el cuantizador y la página de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador (no se especifica el tipo exacto) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | Apache 2.0 (declarada), aunque la model card incluye la etiqueta "Other License" |
| Formato de pesos | GGUF (cuantizaciones imatrix) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base (ReadyArt/Omega-Evolution-31B-v4.0) en la documentación disponible. Los únicos datos confirmados son que el modelo tiene 30.697 millones de parámetros y que se trata de un modelo multimodal (visión + lenguaje), según la indicación de que los archivos mmproj (proyección de visión) están disponibles en el repositorio de cuantización estática. La cuantización imatrix aplicada por mradermacher utiliza una matriz de importancia para mejorar la calidad de los pesos comprimidos, una técnica que reduce la pérdida de precisión respecto a cuantizaciones estáticas convencionales. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO o innovaciones técnicas específicas del modelo base.

## Capacidades

- Generacion de texto y conversacion en ingles.
- Entrada de imagenes (vision) gracias a los archivos mmproj, lo que permite tareas de descripcion de imagenes y dialogo multimodal.
- Orientado a roleplay y contenido explicito (ERP), segun las etiquetas de la model card.
- Sin alineacion de seguridad (etiquetado como "unaligned" y "dangerous"), lo que implica que puede generar contenido NSFW, violencia o material no moderado.
- No se mencionan capacidades de tool calling, function calling ni razonamiento multi-paso explicito.
- No se indica soporte para otros idiomas distintos del ingles.

## Casos de uso

- **Roleplay narrativo**: el modelo esta disenado para mantener conversaciones de rol con contexto, ideal para aplicaciones de ficcion interactiva o juegos de texto.
- **Generacion de contenido creativo sin filtros**: puede usarse para escribir relatos, dialogos o escenas con tematica adulta, siempre que el usuario asuma la responsabilidad legal y etica.
- **Descripcion de imagenes**: al ser un modelo de vision, puede generar textos descriptivos a partir de imagenes, util en herramientas de accesibilidad o anotacion automatica.
- **Prototipado local de modelos multimodales**: permite probar en local un LLM de 30B con vision sin depender de servicios en la nube, gracias a las cuantizaciones GGUF.
- **Investigacion sobre modelos no alineados**: util para estudiar el comportamiento de modelos sin restricciones de seguridad, aunque con las debidas salvaguardas.
- **Despliegue en entornos sin conexion**: al estar en formato GGUF, se puede ejecutar con llama.cpp u Ollama en maquinas con recursos limitados y sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base no tiene una ficha tecnica publica con metricas de MMLU, HumanEval, GSM8K u otros. La unica referencia es la calidad de la cuantizacion imatrix, que se describe como superior a las cuantizaciones estaticas equivalentes, pero sin cifras concretas.

## Requisitos de hardware

- El tamano del repositorio es de 71.5 GB, lo que incluye multiples archivos de cuantizacion. El archivo mas pequeno (Q2_K) ocupa aproximadamente 12-13 GB, y el mas grande (Q6_K) unos 24-25 GB (estimacion basada en el tamano total y la lista de quants).
- Para ejecutar la cuantizacion Q4_K_M (recomendada para calidad/prestaciones), se necesitan al menos 16 GB de VRAM en una GPU de consumo (por ejemplo, RTX 4080, RTX 4090). Las cuantizaciones Q5/Q6 requieren 24 GB o mas.
- Las cuantizaciones Q2/Q3 pueden caber en GPUs con 12-16 GB (como RTX 3080/3090) aunque con perdida de calidad notable.
- No se dispone de datos de latencia o throughput especificos. Con llama.cpp en una GPU moderna, se puede esperar una velocidad de 20-40 tokens por segundo para cuantizaciones Q4 en una RTX 4090, pero es una estimacion general.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama (si se importa el archivo), y otros motores que soporten GGUF. No es compatible directamente con vLLM o TGI, que requieren pesos en formato safetensors.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de 30B con caracteristicas similares (vision + no alineado). El propio modelo base ReadyArt/Omega-Evolution-31B-v4.0 es la unica referencia, pero no hay datos publicos de otros modelos de la misma categoria en la informacion proporcionada. No se puede realizar una comparativa objetiva sin datos de benchmarks.

## Limitaciones y advertencias

- **Contenido peligroso**: el modelo no esta alineado y puede generar contenido explicito, violento, ilegal o nocivo. Su uso en produccion o en servicios publicos esta desaconsejado sin filtros adicionales.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar hechos o datos, especialmente en contextos de rolplay o sin supervisio.
- **Idioma**: solo soporta ingles, no hay garantia de calidad en otros idiomas.
- **Licencia**: aunque la licencia declarada es Apache 2.0, la etiqueta "Other License" en la model card sugiere que el modelo base puede tener restricciones adicionales. Se recomienda revisar la licencia del modelo original antes de un uso comercial.
- **Contexto y vision**: no se conoce la longitud de contexto ni la resolucion de imagen soportada. La calidad de la vision puede variar.
- **Sin soporte tecnico**: el cuantizador es un tercero y no ofrece garantias sobre el comportamiento del modelo.

## Enlaces

- Repositorio GGUF de mradermacher: https://huggingface.co/mradermacher/Omega-Evolution-31B-v4.0-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.0
- Repositorio de cuantizacion estatica (incluye archivos mmproj): https://huggingface.co/mradermacher/Omega-Evolution-31B-v4.0-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
