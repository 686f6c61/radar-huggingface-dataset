# mradermacher/Zaire-12B-v0.1-i1-GGUF

## Resumen

Zaire-12B-v0.1-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo ReadyArt/Zaire-12B-v0.1, publicada por el cuantizador mradermacher, un colaborador muy conocido en el ecosistema Hugging Face por generar cuantizaciones de alta calidad de modelos populares. El modelo base, Zaire-12B-v0.1, es un modelo conversacional e instruct de 11.907.350.576 parámetros (aproximadamente 12B), etiquetado como sin alineamiento (unaligned) y orientado a roleplay, contenido adulto explícito, terror y violencia, con licencia Apache 2.0.

El problema que resuelve esta versión cuantizada es la ejecución del modelo en hardware de consumo: las cuantizaciones i1 (weighted/imatrix) reducen el tamaño del modelo desde los aproximadamente 24 GB en FP16 hasta entre 3,1 GB (IQ1_S) y 9,9 GB (Q6_K), permitiendo su uso en GPUs de gama media e incluso en CPU. La cuantización con imatrix conserva mejor la calidad que las cuantizaciones estáticas a tamaños equivalentes, especialmente en los rangos bajos (IQ2/IQ3).

Su relevancia actual radica en la demanda de modelos sin filtros para escritura creativa, roleplay y narración interactiva, un nicho donde los modelos alineados comercialmente resultan limitados. Al ser un modelo de 12B con licencia permisiva y disponer de más de 25 variantes de cuantización, es accesible tanto para usuarios domésticos como para desarrolladores que quieran integrarlo en aplicaciones locales. La model card indica además que se trata de un modelo de visión, con los archivos mmproj disponibles en el repositorio de cuantizaciones estáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer basado en el modelo base; la model card indica soporte de visión) |
| Parametros totales | 11.907.350.576 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

La información de la model card no detalla la arquitectura interna del modelo base Zaire-12B-v0.1. Se trata de un modelo de aproximadamente 12B parámetros en formato transformers, con capacidad de visión según indica el autor de la cuantización (los archivos mmproj para la parte visual se publican en el repositorio de cuantizaciones estáticas). Dada su etiqueta de "instruct" y "conversational", es un modelo ajustado para seguir instrucciones y mantener conversaciones, y su etiquetado como "unaligned" sugiere un post-entrenamiento mínimo o sin RLHF restrictivo, orientado a cumplir las instrucciones del usuario sin rechazos de contenido maduro.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni los métodos de ajuste (SFT, DPO, RLHF) empleados en el modelo base. La aportación técnica de este repositorio es la cuantización weighted/imatrix: se calcula una matriz de importancia a partir de datos de calibración para asignar mayor precisión a los tensores más relevantes, lo que mejora la calidad percplexidad/resultado frente a cuantizaciones estáticas del mismo tamaño, especialmente en niveles bajos como IQ1/IQ2/IQ3.

## Capacidades

- Generación de texto conversacional en modo instruct, optimizada para roleplay y narración interactiva según las etiquetas del modelo base.
- Contenido adulto explícito (ERP, erótico), terror y violencia: el modelo está etiquetado como sin alineamiento y no aplica rechazos de contenido maduro.
- Capacidades de visión: la model card del cuantizador lo declara como modelo de visión, con archivos mmproj en el repositorio estático (no incluidos en esta colección i1).
- Ejecución local mediante GGUF en llama.cpp, Ollama, LM Studio, KoboldCpp y backends compatibles.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible; el único idioma declarado es el inglés.

## Casos de uso

- Roleplay interactivo y narración de personajes: el modelo está específicamente etiquetado para roleplay sin filtros, ideal para frontends como SillyTavern o KoboldCpp en entornos locales donde el usuario controla el contenido.
- Escritura creativa de ficción madura: generación de prosa con temáticas de terror, violencia o contenido adulto que los modelos comerciales suelen rechazar, útil para autores que necesitan explorar escenas difíciles.
- Prototipado de chatbots sin restricciones de contenido: desarrolladores que investigan comportamiento de modelos sin alineamiento pueden ejecutarlo localmente con cuantizaciones ligeras (IQ3/IQ4) en una sola GPU de consumo.
- Prueba de cuantizaciones imatrix: al incluir un archivo imatrix de 0,1 GB, los usuarios pueden generar sus propias cuantizaciones personalizadas con llama.cpp para ajustar tamaño y calidad a su hardware.
- Investigación en alineamiento y seguridad: como modelo "unaligned" de 12B con licencia Apache 2.0, sirve como sujeto de estudio para red teaming, evaluación de filtros y comparación de técnicas de alineamiento.
- Uso en portátiles y equipos sin GPU dedicada: variantes como IQ2_M (4,5 GB) o Q3_K_M (6,2 GB) permiten inferencia en CPU con RAM moderada, útil para escritura asistida en movilidad.
- Compresión extrema para demos: las variantes IQ1_S/IQ1_M (3,1-3,3 GB) permiten distribuir el modelo en dispositivos muy limitados, aceptando una pérdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un gráfico comparativo de perplexidad de tipos de cuantización de baja calidad elaborado por ikawrakow (https://www.nethype.de/huggingface_embed/quantpplgraph.png), sin cifras numéricas para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante elegida; aproximadamente 4 GB para IQ2_M (4,5 GB de archivo), 8 GB para Q4_K_M (7,5 GB) y 11 GB para Q6_K (9,9 GB), más margen para el KV cache según la longitud de contexto.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para variantes Q4/Q5; RTX 4090 (24 GB) para Q6_K con contextos largos. En la nube, cualquier GPU con 16-24 GB (A10G, L4, A100) es más que suficiente.
- Consumer GPU: sí, la mayoría de variantes caben en GPUs de consumo; incluso una RTX 3060 de 12 GB ejecuta Q4_K_M (7,5 GB) con holgura. En CPU pura, variantes hasta Q4_K_M son viables con 16 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM/TGI al ser GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 12B cuantizado, se espera generación rápida (decenas de tokens/segundo) en GPUs de consumo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion | Contexto |
|---|---|---|---|---|---|
| Zaire-12B-v0.1 (este, cuantizado) | 11,9B | GGUF imatrix | Apache 2.0 | Roleplay, NSFW, unaligned | no disponible |
| Mistral Nemo Instruct 12B | 12B | safetensors / GGUF | Apache 2.0 | General, multilingüe | 128K |
| Nous-Hermes-2-Mistral-7B-DPO | 7B | safetensors / GGUF | Apache 2.0 | Instruct general | 32K |

Zaire-12B comparte rango de tamaño con Mistral Nemo 12B (y es plausible que derive de su arquitectura, aunque no está confirmado en la información disponible), pero se diferencia en su enfoque sin alineamiento y su especialización en roleplay. Frente a alternativas de 7B como Nous-Hermes, ofrece mayor capacidad de generación creativa a costa de requisitos de memoria ligeramente superiores. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como not-for-all-audiences y genera contenido adulto, violento y perturbador sin filtros; no es apto para entornos laborales, educativos ni para usuarios menores de edad.
- Riesgo de alucinación: no se han publicado evaluaciones; al ser un modelo sin alineamiento, es especialmente propenso a generar afirmaciones falsas con apariencia de confianza y sin salvaguardas.
- Idioma: solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Contexto: la longitud de ventana de contexto no está especificada en la información disponible; debe verificarse en la model card del modelo base antes de diseñar aplicaciones con documentos largos.
- Cuantizaciones extremas: las variantes IQ1_S/IQ1_M y Q2 presentan degradación significativa de calidad (así lo advierte el propio autor: "for the desperate", "very low quality"); se recomienda Q4_K_M como punto de equilibrio.
- Visión: los archivos mmproj no están incluidos en este repositorio i1; hay que obtenerlos del repositorio estático si se necesita capacidad visual.
- Licencia: Apache 2.0 permite uso comercial, pero la naturaleza sin alineamiento del modelo puede entrar en conflicto con las políticas de plataformas de distribución, app stores o legislación sobre contenido adulto en determinadas jurisdicciones.
- Uso en producción: no hay garantías de seguridad, moderación ni estabilidad; no se recomienda exponerlo directamente a usuarios finales sin capas de filtrado adicionales.

## Enlaces

- Repositorio de la cuantización i1: https://huggingface.co/mradermacher/Zaire-12B-v0.1-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Zaire-12B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Zaire-12B-v0.1
- Página de descargas del autor: https://hf.tst.eu/model#Zaire-12B-v0.1-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplexidad de cuants: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
