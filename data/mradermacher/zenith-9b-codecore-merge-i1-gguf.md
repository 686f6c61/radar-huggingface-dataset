# mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF

## Resumen

Zenith-9B-CodeCore-Merge-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Zenith-9B-CodeCore-Merge, publicado por el usuario mradermacher, conocido en el ecosistema por generar quants estáticos y con imatrix de modelos de terceros. El modelo original fue desarrollado por prithivMLmods y, por los metadatos disponibles, se trata de una fusión de pesos (merge) orientada a código, razonamiento con cadena de pensamiento, uso de herramientas y function calling. El repositorio que nos ocupa no contiene los pesos originales, sino las versiones comprimidas listas para ejecución en CPU y GPU de consumo.

El modelo cuenta con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), lo que lo sitúa en la gama media de los modelos densos actuales: suficientemente capaz para tareas de generación de código y agentes, pero lo bastante pequeño para desplegarse en hardware de gama alta de consumo cuando se cuantiza. Los metadatos etiquetan la arquitectura base como qwen3_5, aunque no se detalla oficialmente la configuración interna.

La relevancia de esta ficha radica en que las cuantizaciones i1 de mradermacher emplean calibración con imatrix, lo que reduce la pérdida de calidad respecto a los quants estáticos tradicionales en niveles agresivos de compresión. Esto permite a desarrolladores e investigadores ejecutar un modelo de 9B orientado a código en equipos con 8-12 GB de VRAM manteniendo un comportamiento razonable, algo crítico para entornos de desarrollo local y pipelines sin GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado en metadatos como qwen3_5); modelo de fusión de pesos (merge) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2B) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

Se trata de una cuantización, no de un modelo entrenado desde cero. El modelo de origen, prithivMLmods/Zenith-9B-CodeCore-Merge, es el resultado de una fusión de pesos (merge) según los metadatos, presumiblemente combinando checkpoints especializados en código y razonamiento. Las etiquetas del repositorio apuntan a una arquitectura de la familia qwen3_5 y a un proceso de ajuste supervisado (SFT) previo, además de señalar explícitamente capacidades de razonamiento con cadena de pensamiento, agentes y function calling. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de este repositorio concreto reside en el método de cuantización. mradermacher genera cuants con calibración mediante matriz de importancia (imatrix, técnica popularizada por ikawrakow en llama.cpp), que pondera los pesos según su relevancia para la perplejidad del modelo. El resultado son ficheros con prefijo i1 que, a igual tamaño, ofrecen mejor calidad que los quants estáticos equivalentes, especialmente en los niveles más agresivos (IQ2, IQ3). Se incluye además el fichero .imatrix.gguf (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantillas de chat.
- Razonamiento explícito con cadena de pensamiento (chain-of-thought), según los metadatos del repositorio.
- Generación y asistencia en código, dado el sufijo CodeCore del modelo base.
- Soporte de tool calling y function calling.
- Capacidad de uso en agentes y razonamiento multi-paso.
- No consta soporte multilingüe más allá del inglés.
- La model card del cuantizador menciona que se trata de un modelo de visión y que los ficheros mmproj, si existen, residen en el repositorio estático; este repositorio i1 no incluye dichos ficheros, por lo que la capacidad de visión no es utilizable directamente desde aquí.
- No se documentan capacidades de audio.

## Casos de uso

- Asistente de generación de código en local: el modelo puede desplegarse con Ollama o llama.cpp sobre una GPU de consumo y emplearse como copiloto en editores, aprovechando su especialización en código y su tamaño de 9B cuantizado a Q4_K_S (5,6 GB), que cabe en tarjetas de 8 GB.
- Automatización de agentes con function calling: gracias al soporte declarado de tool use, puede integrarse en flujos donde el modelo decide qué función invocar, por ejemplo consultas a bases de datos o APIs REST dentro de un orquestador de agentes.
- Razonamiento multi-paso en tareas de análisis técnico: la cadena de pensamiento permite descomponer problemas de depuración o diseño de algoritmos en pasos intermedios, útil en entornos educativos o de revisión de código.
- Procesamiento de documentación técnica: puede resumir, reformular y responder preguntas sobre manuales y repositorios en inglés, siempre que la longitud del contexto lo permita (no documentada).
- Generación de pruebas unitarias y refactorización: integrado en un pipeline de CI/CD mediante llamadas a un servidor local compatible con la API de OpenAI, puede generar tests a partir de fragmentos de código.
- Prototipado rápido sin conexión: al ser GGUF, permite experimentar con un modelo de 9B en portátiles con GPU modesta o incluso CPU, útil para investigación que requiera reproducibilidad offline.
- Evaluación de cuantizaciones: el fichero imatrix incluido permite a investigadores generar sus propios niveles de compresión y comparar la degradación de calidad, un caso de uso metodológico relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de los pesos en precisión completa (bf16/fp16): aproximadamente 18,4 GB, estimación derivada de los 9,2B de parámetros. Requiere GPU con 24 GB o más (A100 40 GB, H100, RTX 3090/4090 con margen justo).
- VRAM estimada para inferencia según los ficheros publicados: i1-Q2_K (4,0 GB), i1-IQ3_M (4,6 GB) e i1-Q4_K_S (5,6 GB). A estas cifras conviene sumar entre 1 y 3 GB adicionales para caché KV y sobrecarga del runtime, en función de la longitud de contexto y el tamaño de lote.
- GPU recomendadas por rango: RTX 3060 12 GB o RTX 4060 Ti 16 GB para los cuants Q4 e inferiores; RTX 4070/4080/4090 para mayor velocidad; A100 o H100 si se necesita servir en paralelo o usar precisión completa.
- Compatibilidad con GPU de consumo: sí. Los cuants Q2_K, IQ3_M y Q4_K_S caben en tarjetas de 8 GB de VRAM, siempre que se limite el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y llama-cpp-python. El repositorio incluye la etiqueta text-generation-inference, pero el soporte de TGI para GGUF es limitado; para vLLM se recomienda partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este modelo ni de alternativas directamente comparables en la información proporcionada. A modo de referencia estructural, se pueden contrastar las variantes del propio modelo:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF | 9,2B | GGUF (imatrix) | Apache 2.0 | Este repositorio; cuants con calibración imatrix |
| mradermacher/Zenith-9B-CodeCore-Merge-GGUF | 9,2B | GGUF (estático) | Apache 2.0 | Versión estática; aloja los ficheros mmproj si existen |
| prithivMLmods/Zenith-9B-CodeCore-Merge | 9,2B | safetensors | Apache 2.0 | Modelo base sin cuantizar |
| Alternativas de la misma categoría (por ejemplo, otras familias densas de 8-9B orientadas a código) | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otras lenguas no está garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: al no documentarse, no se puede planificar su uso en tareas que requieran ventanas largas sin antes verificarlo empíricamente.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, especialmente en los cuants más agresivos (IQ1, IQ2), donde la degradación de calidad es mayor.
- Degradación por cuantización: aunque la calibración imatrix mitiga el problema, los niveles Q2_K, IQ2 e IQ3 introducen pérdida de precisión medible frente a Q4_K_S o Q6_K, sobre todo en tareas de razonamiento y código.
- Es una fusión de pesos (merge): puede heredar sesgos o comportamientos inconsistentes de los checkpoints de origen, y los merges suelen carecer de una evaluación sistemática publicada.
- Capacidad de visión no utilizable desde este repositorio: los ficheros mmproj, si existen, están en el repositorio estático, no en el i1.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los checkpoints fusionados por si arrastrasen restricciones adicionales de los modelos de origen.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria y de casos de uso en producción documentados.
- Posible inconsistencia temporal en los metadatos: las fechas de creación y actualización indican 2026, dato que puede reflejar un error de la plataforma o de catalogación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Zenith-9B-CodeCore-Merge
- Quants estáticos del mismo modelo: https://huggingface.co/mradermacher/Zenith-9B-CodeCore-Merge-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Zenith-9B-CodeCore-Merge-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF/resolve/main/Zenith-9B-CodeCore-Merge.imatrix.gguf
- Cuant i1-Q2_K: https://huggingface.co/mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF/resolve/main/Zenith-9B-CodeCore-Merge.i1-Q2_K.gguf
- Cuant i1-IQ3_M: https://huggingface.co/mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF/resolve/main/Zenith-9B-CodeCore-Merge.i1-IQ3_M.gguf
- Cuant i1-Q4_K_S: https://huggingface.co/mradermacher/Zenith-9B-CodeCore-Merge-i1-GGUF/resolve/main/Zenith-9B-CodeCore-Merge.i1-Q4_K_S.gguf
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura: https://www.nethype.de/

Nota: la búsqueda web realizada no ha devuelto enlaces relevantes sobre el modelo; los resultados obtenidos correspondían a tiendas de informática sin relación con el contenido de esta ficha.
