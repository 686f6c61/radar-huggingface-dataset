# fabriciocarraro/CatDecide-1

## Resumen

CatDecide-1 es un modelo de clasificación de texto desarrollado por el usuario fabriciocarraro y publicado en Hugging Face bajo el identificador `fabriciocarraro/CatDecide-1`. Está construido sobre la familia Qwen3, según indica la etiqueta `qwen3` del repositorio, y su propósito declarado es la clasificación de textos en catalán, castellano e inglés (etiquetas `ca`, `es`, `en`). Con 9.094.607.872 parámetros reales en safetensors, se trata de un modelo de aproximadamente 9.000 millones de parámetros, lo que lo sitúa en la gama media-alta de modelos densos.

El modelo resulta relevante porque aborda una tarea concreta —la clasificación multilingüe con cobertura del catalán— sobre una base arquitectónica moderna (Qwen3), y porque su acceso está restringido (gated), lo que sugiere un control deliberado de distribución por parte del autor. No obstante, la información pública disponible es muy limitada: no se especifican la licencia, el pipeline, los datos de entrenamiento ni resultados de benchmarks.

Esta ficha se ha redactado exclusivamente a partir de los metadatos del repositorio de Hugging Face. Cualquier dato no presente en dicha información se marca explícitamente como "no disponible", sin inferencias ni estimaciones no respaldadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (tag `qwen3`); detalles exactos no disponibles |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no indicadas) |
| Idiomas soportados | Catalán (ca), castellano (es), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación (`classification`) |
| Acceso | Restringido (gated); requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 18,2 GB |
| Descargas | 470 |
| Likes | 0 |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con `qwen3`, lo que indica que la arquitectura subyacente pertenece a la familia Qwen3 de Alibaba. Con 9.094.607.872 parámetros en safetensors, se trata de un modelo denso de ~9B parámetros (no hay indicios de que sea de mezcla de expertos, ya que no se declaran parámetros activos). La tarea declarada es clasificación, por lo que lo más probable es que se trate de un modelo base Qwen3 ajustado con una cabeza de clasificación, aunque la información pública no detalla la configuración exacta de dicha cabeza ni el número de clases de salida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Tampoco se documentan procesos de ajuste fino supervisado ni metodologías de evaluación. Todos estos apartados deben considerarse "no disponibles" a partir de la información proporcionada.

## Capacidades

- Clasificación de texto multilingüe en catalán, castellano e inglés.
- Procesamiento de entradas textuales para asignación de etiquetas o categorías (el conjunto exacto de clases no está documentado).
- Cobertura del catalán, un idioma con menor representación en modelos generalistas, lo que constituye un valor diferencial para aplicaciones en ese idioma.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se documenta generación de texto libre; la tarea declarada es exclusivamente de clasificación.

## Casos de uso

- Moderación de contenido en catalán y castellano: el modelo puede clasificar comentarios o publicaciones en categorías predefinidas (tóxicos, spam, off-topic), aprovechando su cobertura del catalán, escasa en muchos modelos generalistas.
- Enrutamiento de tickets de soporte: clasificar consultas entrantes por departamento o urgencia en entornos bilingües catalán-castellano, integrando el modelo como componente de un pipeline de atención al cliente.
- Análisis de sentimiento o temática en redes sociales: etiquetar grandes volúmenes de publicaciones multilingües para paneles de monitorización de marca.
- Clasificación de documentos administrativos: categorizar expedientes o correos en catalán y castellano en el sector público, donde la cobertura del catalán es un requisito legal o de servicio.
- Filtrado previo en pipelines de datos: etiquetar corpus para seleccionar o descartar muestras antes de entrenar otros modelos, usando las tres lenguas soportadas.
- Detección de idioma o clasificación de dominio: usar el modelo como clasificador auxiliar para enrutar textos según idioma o temática en sistemas de procesamiento documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18 GB solo para pesos (9,09B parámetros × 2 bytes), más overhead de activaciones y contexto.
- En cuantización de 8 bits: ~9-10 GB de VRAM para pesos.
- En cuantización de 4 bits: ~5-6 GB de VRAM para pesos (cuantizaciones no publicadas oficialmente; requeriría conversión propia).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 6000 Ada para fp16 sin compromisos. En consumer, una RTX 4090 (24 GB) puede alojar el modelo en fp16 con margen ajustado; una RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo de 16 GB únicamente con cuantización a 8 bits o inferior, y en 8-12 GB solo con cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI o transformers para fp16; llama.cpp/Ollama requerirían conversión a GGUF (no publicada). Dado que el acceso es gated, es necesario autenticarse con un token de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Como referencia estructural, la familia Qwen3 incluye variantes densas de tamaño similar, pero no se han facilitado datos de rendimiento ni especificaciones de CatDecide-1 que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| CatDecide-1 | 9,09B | no disponible | no disponible | Restringido (gated) |
| Alternativas Qwen3 densas | no disponible | no disponible | no disponible | no disponible |
| Otros clasificadores multilingües con catalán | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar condiciones en Hugging Face y autenticarse para descargar los pesos, lo que puede complicar la integración automatizada en CI/CD.
- Licencia no especificada: sin licencia declarada, no es posible confirmar si el uso comercial está permitido. Esto es un bloqueante para producción empresarial hasta que el autor la publique.
- Falta de documentación: no se detallan datos de entrenamiento, clases de salida, métricas de evaluación ni limitaciones conocidas, lo que impide evaluar su fiabilidad.
- Riesgo de sesgos y alucinación: no documentados; al ser un clasificador, el riesgo principal es la asignación errónea de etiquetas, no la generación de texto inventado.
- Cobertura lingüística limitada a ca, es, en; el rendimiento en otras lenguas o en variantes dialectales no está evaluado.
- Contexto máximo desconocido: no se puede planificar su uso con entradas largas sin información adicional.
- Adopción muy baja (470 descargas, 0 likes) y sin pipeline declarado, lo que sugiere un modelo reciente o poco validado por la comunidad.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere trabajo adicional de conversión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fabriciocarraro/CatDecide-1
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
