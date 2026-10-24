# mradermacher/Carbon-X-i1-GGUF

## Resumen

Carbon-X-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo HuggingFaceBio/Carbon-X. El modelo base es un modelo de lenguaje de 14.822.046.720 parámetros (aproximadamente 14,8 mil millones) orientado a ADN, genómica, biología y predicción de efectos de variantes, con capacidad conversacional y entrenado para inglés. La licencia declarada es Apache-2.0.

El repositorio no contiene el modelo original, sino un conjunto de cuantizaciones con imatrix (prefijo i1) pensadas para ejecutar el modelo en local con llama.cpp y herramientas compatibles. Ofrece desde variantes muy agresivas, como IQ1_S de 3,7 GB, hasta Q6_K de 12,3 GB, lo que permite ajustar el uso de VRAM y la calidad en función del hardware disponible.

Su relevancia práctica está en que acerca un modelo genómico de 14,8B a GPU de consumo y a entornos sin infraestructura de servidor. Ahora bien, la model card de esta cuantización no documenta arquitectura, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe hacerse contra el modelo base o mediante validación experimental propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card de la cuantización no especifica la arquitectura del modelo base) |
| Parámetros totales | 14.822.046.720 (aproximadamente 14,8B) |
| Parámetros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; incluye archivo imatrix |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; el modelo base se distribuye en safetensors según el dato de parámetros disponible |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. El repositorio se etiqueta con `transformers`, `dna`, `genomics`, `biology`, `variant-effect-prediction` y `conversational`, pero no se confirma si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o un modelo especializado en secuencias. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas.

Esta ficha describe la versión cuantizada GGUF, no el modelo original. Las cuantizaciones i1 utilizan una matriz de importancia (imatrix) para reducir el error de cuantización, y el autor publica también cuantizaciones estáticas en un repositorio separado. Para conocer la arquitectura y el proceso de entrenamiento hay que consultar la model card de HuggingFaceBio/Carbon-X, que no forma parte de la información proporcionada.

## Capacidades

- Modelo de lenguaje especializado en ADN y genómica, según los tags `dna`, `genomics` y `biology`.
- Predicción de efectos de variantes genéticas (`variant-effect-prediction`).
- Generación de texto conversacional en inglés.
- Explicación y discusión de secuencias, variantes y conceptos biomédicos en formato de diálogo.
- No hay información disponible sobre tool calling, function calling, uso como agente, razonamiento multi-paso, modo thinking, visión o audio.
- No se documentan capacidades multilingües más allá del inglés.
- No se han publicado benchmarks que cuantifiquen su precisión en tareas genómicas o conversacionales.

## Casos de uso

- Interpretación asistida de variantes genéticas: dado un identificador de variante o una descripción HGVS, el modelo puede generar una explicación en lenguaje natural sobre su posible efecto. Es adecuado por su especialización declarada en `variant-effect-prediction`, pero la salida debe validarse con herramientas bioinformáticas y revisión experta.
- Asistente conversacional para laboratorios de genómica: investigadores pueden plantear preguntas sobre genes, variantes o conceptos biológicos y obtener respuestas en inglés. Su tamaño de 14,8B permite desplegarlo en local con cuantizaciones Q4 o Q5 en GPU de consumo.
- Generación de borradores de informes genómicos: el modelo puede redactar resúmenes explicativos a partir de anotaciones o resultados previos de pipelines de variantes, siempre que un especialista revise y corrija el texto final.
- Apoyo a la docencia y divulgación en genómica: puede explicar conceptos como polimorfismos, efectos funcionales o nomenclatura de variantes a estudiantes, usando un tono conversacional y en inglés.
- Exploración de hipótesis en investigación: sirve como asistente para generar posibles mecanismos o preguntas de follow-up sobre una variante concreta, sin sustituir el análisis experimental ni la literatura científica.
- Integración en entornos locales con privacidad de datos: al ejecutarse mediante GGUF en llama.cpp u Ollama, permite trabajar con secuencias o anotaciones genómicas sin enviarlas a servicios externos, algo relevante cuando se manejan datos sensibles.
- Prototipado rápido de interfaces conversacionales sobre genómica: útil para validar flujos de pregunta-respuesta antes de invertir en un despliegue con el modelo en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 y 13 GB solo para los pesos, según la cuantización elegida. A esta cifra hay que añadir la memoria para el contexto y el overhead del runtime; el contexto máximo no está documentado.
- GPU de consumo: una RTX 3060 de 12 GB o similar puede ejecutar Q4_K_M (9,1 GB) o Q4_K_S (8,7 GB) con contexto moderado; Q6_K (12,3 GB) queda justo y puede requerir offload parcial.
- GPU de 16 GB o más: permiten Q5_K_M (10,7 GB) y Q6_K con más margen para contexto.
- GPU profesionales: A100, H100 o L40S son adecuadas para despliegues con mayor concurrencia o para trabajar con el modelo base en precisión completa, aunque no se dispone de datos de throughput.
- CPU y RAM: las cuantizaciones IQ2/IQ3 pueden ejecutarse en CPU con llama.cpp, pero la latencia será alta y la calidad será menor.
- Opciones de despliegue: llama.cpp y derivados como Ollama, LM Studio o text-generation-webui. vLLM y TGI no están confirmados para este repositorio GGUF concreto.
- Latencia y throughput: no disponibles. Dependen de la cuantización, del hardware, del contexto y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---:|---|---|---|---|
| Carbon-X-i1-GGUF (este repositorio) | 14,8B | no disponible | GGUF con imatrix | Apache-2.0 | Cuantizaciones i1 de IQ1_S a Q6_K; orientado a ejecución local |
| Carbon-X (modelo base) | 14,8B | no disponible | safetensors | Apache-2.0 | Modelo original de HuggingFaceBio; sin datos de benchmarks en la información disponible |
| Carbon-X-GGUF (cuantizaciones estáticas) | 14,8B | no disponible | GGUF | Apache-2.0 | Publicado por mradermacher; cuantizaciones sin imatrix |

No se dispone de datos de benchmarks ni de otros modelos genómicos comparables en la información proporcionada, por lo que no se puede establecer una comparativa de rendimiento con alternativas como DNABERT-2, Nucleotide Transformer o Evo. La comparación anterior se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Este repositorio contiene cuantizaciones, no el modelo original. La calidad final depende del tipo de cuantización; el propio autor marca algunas variantes como "very low quality" o "for the desperate".
- La model card no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su comportamiento real sin pruebas adicionales.
- El modelo está orientado a inglés; no se ha confirmado soporte para castellano ni para otros idiomas.
- Es un modelo especializado en genómica, no un modelo generalista. No debe usarse como sustituto de herramientas bioinformáticas validadas ni de criterio clínico.
- Riesgo de alucinación en la interpretación de variantes y en la generación de explicaciones biológicas; toda salida debe revisarse por especialistas.
- No se documentan sesgos. En genómica es especialmente importante evaluar la representatividad poblacional de los datos de entrenamiento, pero no hay información al respecto.
- La licencia Apache-2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base y de los datos de entrenamiento originales.
- No se debe asumir una ventana de contexto larga: la longitud de contexto no está indicada.
- Para uso clínico o diagnóstico, el modelo no es adecuado sin validación regulatoria y experimental específica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Carbon-X-i1-GGUF
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Carbon-X-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Carbon-X-i1-GGUF
- Archivo imatrix: https://huggingface.co/mradermacher/Carbon-X-i1-GGUF/resolve/main/Carbon-X.imatrix.gguf
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
