# mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo Naphula/Goetia-26B-A4B-v1.6, generadas por mradermacher con calibración imatrix (variantes «i1»). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local y en servidor: el repositorio incluye 24 tipos de cuantización distintos, desde IQ1_S hasta Q6_K, además del fichero imatrix (0,2 GB) empleado para calibrar las variantes de baja precisión. El recuento real de parámetros en safetensors es de 25.971.339.550 (aproximadamente 26.000 millones), y el tamaño total del repositorio es de 253,1 GB.

El objetivo es claro: hacer viable un modelo de ~26B en hardware de consumo o en GPUs de gama profesional con VRAM limitada. Las cuantizaciones documentadas con tamaño explícito van de 10,9 GB (i1-Q2_K) a 16,0 GB (i1-Q4_K_S), lo que sitúa la inferencia en el rango de tarjetas de 12-24 GB según la variante elegida. La model card del cuantizador indica que el modelo base es multimodal (visión), aunque los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas y no en este.

La relevancia de esta ficha es doble: por un lado, permite evaluar si el modelo cabe en un equipo concreto antes de descargar cientos de gigabytes; por otro, advierte de que la información pública disponible es mínima. La licencia no está declarada, el idioma soportado es únicamente inglés, no hay pipeline definido ni resultados de benchmarks publicados, y la arquitectura interna debe inferirse del nombre del modelo en lugar de confirmarse con documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura «26B-A4B» sugiere mezcla de expertos con ~4B activos, sin confirmar) |
| Parametros totales | 25.971.339.550 (~26B), dato real de safetensors |
| Parametros activos | no disponible (estimación no confirmada de ~4B según el sufijo «A4B») |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con calibración imatrix) |
| Idiomas soportados | inglés (en), según la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |
| Autor de la cuantizacion | mradermacher |
| Repositorio de origen | Naphula/Goetia-26B-A4B-v1.6 |
| Tamano del repositorio | 253,1 GB |
| Fichero imatrix | Goetia-26B-A4B-v1.6.imatrix.gguf (0,2 GB) |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre del modelo, «Goetia-26B-A4B-v1.6», sigue el patrón habitual de los modelos de mezcla de expertos (MoE) que declaran parámetros totales y parámetros activos por token: 26B totales y aproximadamente 4B activos. Sin embargo, esto es una inferencia a partir de la nomenclatura, no un dato confirmado por la model card del cuantizador ni por documentación adicional. Tampoco se especifica si se trata de un transformer denso, un MoE con enrutado aprendido, una arquitectura híbrida o cualquier otra variante.

Respecto al entrenamiento, no hay información disponible sobre el número de tokens utilizados, la composición del dataset, la existencia de fases de ajuste por instrucciones, RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, ventanas deslizantes, etc.). La única información relevante que aporta este repositorio es la metodología de cuantización: mradermacher emplea ficheros imatrix para calcular las escalas de cuantización, lo que típicamente reduce la perplejidad en las variantes de baja precisión (IQ1 a IQ3) en comparación con las cuantizaciones estáticas del mismo modelo, disponibles en un repositorio separado.

## Capacidades

- Generación de texto conversacional: la etiqueta «conversational» de la model card indica que el modelo está orientado a diálogo.
- Capacidades de visión: la model card del cuantizador afirma explícitamente que se trata de un modelo de visión, pero los ficheros mmproj necesarios para la inferencia multimodal no se incluyen en este repositorio, sino, si existen, en el repositorio de cuantizaciones estáticas.
- Idiomas: únicamente inglés declarado. No hay evidencia de soporte multilingüe.
- Compatibilidad con endpoints: la etiqueta «endpoints_compatible» sugiere que puede servirse mediante infraestructura de endpoints compatible con el formato GGUF.
- Razonamiento, código, matemáticas: no disponible; no hay documentación que los declare ni benchmarks que los midan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo de pensamiento, audio, etc.): no disponible.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de 24 GB: la variante i1-Q4_K_S ocupa 16,0 GB, por lo que deja margen para caché KV y contexto en tarjetas como RTX 3090, RTX 4090 o A5000. Es el escenario típico de un asistente conversacional en inglés que no depende de servicios en la nube.
- Despliegue en GPU de 16 GB: la variante i1-IQ3_M (12,8 GB) o i1-IQ3_XXS (11,7 GB) permiten cargar el modelo completo en tarjetas de 16 GB, con una pérdida de calidad controlada por el uso de imatrix. Adecuado para prototipado y pruebas internas.
- Equipos con GPU de 12 GB o inferencia parcial en CPU: i1-Q2_K (10,9 GB) es la opción más ligera documentada con tamaño explícito, aunque la propia model card advierte que IQ3_XXS suele dar mejor calidad que Q2_K a un tamaño similar.
- Evaluación comparativa de metodologías de cuantización: la existencia de este repositorio i1 junto al repositorio de cuantizaciones estáticas del mismo modelo permite medir empíricamente la diferencia de perplejidad y de calidad de generación entre cuantizaciones calibradas con imatrix y estáticas, usando el mismo modelo base.
- Creación de cuantizaciones propias: el repositorio incluye el fichero imatrix (0,2 GB), que puede reutilizarse para generar variantes con otros formatos, otras herramientas o resoluciones de cuantización no cubiertas por el autor.
- Servicio conversacional en inglés sobre infraestructura propia con llama.cpp u Ollama: al ser pesos GGUF, se integran con servidores de inferencia local y con APIs compatibles con OpenAI de forma directa, sin necesidad de convertir los pesos.
- Análisis de viabilidad multimodal: si se recupera el fichero mmproj desde el repositorio estático, el modelo podría emplearse en tareas de descripción de imágenes o preguntas sobre imágenes, siempre en inglés. Conviene validar primero la disponibilidad real de ese fichero, ya que la model card lo condiciona con un «if any».

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación para el modelo base Naphula/Goetia-26B-A4B-v1.6 ni para estas cuantizaciones. La model card únicamente enlaza un gráfico comparativo de perplejidad entre tipos de cuantización de baja calidad (elaborado por ikawrakow) y un análisis de Artefact2 sobre cuantizaciones, pero ninguno de los dos aporta cifras concretas de este modelo.

## Requisitos de hardware

Estimaciones de VRAM basadas en el tamaño de fichero declarado más un margen para caché KV y sobrecarga del runtime (los valores de tamaño son datos de la model card; los de VRAM son estimaciones):

| Cuantizacion | Tamano del fichero | VRAM estimada para inferencia |
|---|---|---|
| i1-Q2_K | 10,9 GB | ~12-13 GB |
| i1-IQ3_XXS | 11,7 GB | ~13 GB |
| i1-IQ3_M | 12,8 GB | ~14 GB |
| i1-Q4_K_S | 16,0 GB | ~17-18 GB |
| Resto de variantes | no disponible | no disponible |

- Cabe en GPU de consumo: sí, en el rango de 12 a 24 GB según la cuantización. RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 son candidatas razonables para las variantes más bajas; las de mayor tamaño (Q5_K_M, Q6_K, cuyo tamaño no se documenta) requerirán presumiblemente 24 GB o más.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 pueden alojar cualquier variante con contexto amplio y lotes grandes.
- Inferencia parcial en CPU: viable con llama.cpp usando offload parcial a GPU, especialmente con las variantes IQ1/IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp consumen GGUF de forma nativa. vLLM y TGI no están orientados a GGUF; para usarlos sería necesario partir de los pesos originales en safetensors del modelo base. La etiqueta «endpoints_compatible» sugiere compatibilidad con infraestructura de endpoints, pero no se detalla cuál.
- Latencia y throughput: no disponible. Dependerán de la cuantización, del hardware y de la longitud de contexto, que tampoco se documenta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de terceros (arquitectura, parámetros, contexto, licencia o rendimiento) en la documentación proporcionada, por lo que no es posible establecer una comparativa fiable contra alternativas de la misma categoría. La única comparación que puede hacerse con datos verificables es entre las dos distribuciones de cuantizaciones del mismo modelo:

| Distribucion | Metodo | Variantes | Uso recomendado |
|---|---|---|---|
| mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF (este repositorio) | Cuantizacion calibrada con imatrix, fichero imatrix incluido | 24 tipos, de IQ1_S a Q6_K | Máxima calidad por bit, especialmente en IQ1-IQ3 |
| mradermacher/Goetia-26B-A4B-v1.6-GGUF | Cuantizaciones estáticas | no disponible en detalle | Alternativa más sencilla; incluye, si existen, los ficheros mmproj para visión |
| Naphula/Goetia-26B-A4B-v1.6 | Modelo base en safetensors | Pesos completos | Entrenamiento, ajuste fino o despliegue con vLLM/TGI |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de las cuantizaciones. Sin ese dato, el uso comercial queda en una zona jurídica indeterminada y no debería asumirse permitido.
- Sesgos conocidos: no disponible. No hay ninguna documentación sobre sesgos, filtrado de datos ni alineamiento.
- Riesgo de alucinación: no cuantificado. Al no existir benchmarks ni evaluaciones publicadas, no hay ninguna medida de fiabilidad factual.
- Idioma: solo inglés declarado. El uso en castellano u otros idiomas no está respaldado por la documentación y probablemente degrade la calidad.
- Longitud de contexto desconocida: sin este dato no puede planificarse el consumo de VRAM ni validar casos de uso con documentos largos.
- Degradación por cuantización: las variantes de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS, Q2_K) suponen una pérdida de calidad notable. La propia model card desaconseja Q2_K y recomienda IQ3_XXS en su lugar.
- Visión no utilizable directamente desde este repositorio: los ficheros mmproj no están aquí. La model card los condiciona a un «if any» en el repositorio estático, por lo que ni siquiera está confirmado que existan.
- Arquitectura no confirmada: tratar el modelo como MoE de ~4B activos es una inferencia a partir del nombre, no un hecho documentado. Cualquier planificación de rendimiento basada en esa suposición debe validarse empíricamente.
- Sin métricas de rendimiento: no hay cifras de latencia, throughput ni consumo energético publicadas para ninguna de las cuantizaciones.
- Tamaño del repositorio: 253,1 GB en total. Descargar el repositorio completo no es práctico; conviene obtener únicamente el fichero GGUF de la variante elegida.
- Fechas de publicación poco habituales: el repositorio figura como creado el 2026-09-11, dato que conviene verificar antes de citarlo.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.6
- Vista general de cuantizaciones del modelo: https://hf.tst.eu/model#Goetia-26B-A4B-v1.6-i1-GGUF
- Peticiones de cuantización y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
