# Mathieu680/Rastignac-1.0-126M-GGUF

## Resumen

Rastignac 1.0 — 126M es un modelo de lenguaje causal en francés desarrollado por el usuario Mathieu680, entrenado sobre un corpus de 3.348 libros de literatura francesa. Esta ficha corresponde concretamente a su versión cuantizada en GGUF F16, publicada bajo el identificador Mathieu680/Rastignac-1.0-126M-GGUF, pensada para su uso con llama.cpp y herramientas compatibles como LM Studio. Su objetivo no es la conversación ni el seguimiento de instrucciones, sino la compleción de texto literario a partir de un inicio de frase o párrafo.

Con 126.481.920 parámetros, se trata de un modelo muy pequeño incluso dentro de la categoría de modelos compactos, lo que lo sitúa en el terreno de la experimentación, la docencia y el despliegue en hardware limitado (CPU, Raspberry Pi o cualquier GPU de gama de entrada). El repositorio GGUF ocupa 0,3 GB, coherente con un peso de aproximadamente 253 MB en F16.

Su relevancia es limitada y muy específica: es un ejemplo de ajuste/entrenamiento monolingüe francés con fines literarios, sin alignment ni benchmarks publicados, con cero descargas y cero «likes» en el momento de redactar esta ficha. Resulta útil como caso de estudio de modelos pequeños de dominio concreto, no como alternativa a modelos generalistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (etiqueta `causal-lm`); número de capas, cabezas y tipo de atención: no disponible |
| Parámetros totales | 126.481.920 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF F16 (único archivo publicado en el repositorio; el autor indica que se convirtió desde los pesos Safetensors) |
| Idiomas soportados | francés (`fr`) |
| Licencia | `other` (etiqueta de HuggingFace); el autor remite a la licencia de Project Gutenberg para los derechos del corpus |
| Formato de pesos | GGUF (F16) en este repositorio; Safetensors en el repositorio principal |
| Tamaño del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Librería | llama.cpp |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-10 |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un modelo de lenguaje causal (`causal-lm`) con 126.481.920 parámetros, entrenado sobre 3.348 libros de literatura francesa. El autor no detalla en la model card el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud de contexto de entrenamiento, la tokenizador empleado ni el número total de tokens de entrenamiento. Tampoco se documentan innovaciones técnicas (atención lineal, decodificación especulativa, mezclas de expertos, SSM híbridos, etc.), por lo que no es posible afirmar que incorpore ninguna.

Sí se declara explícitamente que el modelo es de compleción literaria y que **no ha sido entrenado para seguir instrucciones ni para mantener conversaciones**, lo que implica que no hay evidencias de fases de RLHF, DPO o ajuste por instrucciones. El origen del corpus se vincula a Project Gutenberg (el autor enlaza su política de licencia), aunque no se especifica la composición exacta por autor, época o género más allá de la etiqueta `literary`. La conversión a GGUF se realizó desde los pesos Safetensors del repositorio principal y se cargó y probó localmente con llama.cpp, según indica la propia model card.

## Capacidades

- Generación de texto en francés por compleción: continúa una frase o párrafo inicial en registro literario.
- Estilo literario francés: el entrenamiento sobre 3.348 libros orienta la salida hacia una prosa de corte clásico o decimonónico.
- Generación creativa breve: descripciones, diálogos y fragmentos narrativos a partir de un «prompt» de arranque.
- Funcionamiento en hardware muy limitado gracias a sus 126 M de parámetros.
- **No** soporta tool calling ni function calling.
- **No** soporta uso como agente ni razonamiento multi-paso.
- **No** es multilingüe: solo francés.
- **No** dispone de modo «thinking», visión, audio ni ninguna capacidad multimodal.
- **No** está ajustado para seguir instrucciones ni para diálogo multi-turno; no debe esperarse comportamiento de asistente.

## Casos de uso

- **Compleción literaria asistida**: dado un inicio como «La nuit tombait sur Paris lorsque», el modelo continúa el texto en francés con registro literario; es el uso para el que fue diseñado y el único documentado por el autor.
- **Generación de borradores narrativos**: escritores o guionistas pueden usarlo para producir variantes de un mismo arranque y seleccionar después manualmente, aprovechando su sesgo estilístico clásico.
- **Prototipado y docencia sobre modelos pequeños**: sirve para demostrar el ciclo completo de entrenamiento, conversión a GGUF e inferencia local con llama.cpp en un portátil o una Raspberry Pi, sin necesidad de GPU.
- **Investigación en modelos de dominio monolingüe**: útil como línea base de bajo coste para estudiar cómo un corpus restringido (literatura francesa) moldea el estilo y el vocabulario de un transformer pequeño.
- **Aumento de datos sintéticos en francés**: generación de fragmentos de texto en registro literario para ampliar corpus de entrenamiento o evaluación, siempre con revisión humana y control de calidad.
- **Pruebas de integración de llama.cpp y LM Studio**: por su tamaño (0,3 GB) es cómodo para validar pipelines de despliegue, cuantizaciones y plantillas de prompt en entornos de CI o de desarrollo local.
- **Experimentos de estilometría**: análisis de hasta qué punto un modelo pequeño reproduce rasgos de estilo de la literatura francesa de un período concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa, y la búsqueda web realizada no aportó datos adicionales (los resultados obtenidos eran páginas administrativas japonesas sin relación con el modelo).

## Requisitos de hardware

- **Peso del modelo**: el archivo GGUF F16 ocupa aproximadamente 253 MB (126,5 M de parámetros × 2 bytes), consistente con el tamaño de repositorio de 0,3 GB.
- **VRAM/RAM estimada**: menos de 1 GB en total para inferencia con contexto moderado en llama.cpp, incluyendo buffers de contexto y overhead del runtime.
- **GPU**: funciona en cualquier GPU con 1 GB o más de memoria; una RTX 4090, A100 o H100 están enormemente sobredimensionadas para este modelo. El caso natural es la ejecución en CPU.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo, incluidos iGPU y SoC integrados. También es viable en Raspberry Pi 4/5 y en dispositivos tipo mini-PC.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), LM Studio (mencionado explícitamente por el autor), cualquier frontend compatible con GGUF y, mediante importación del GGUF, herramientas tipo Ollama. vLLM y TGI no están indicados por el autor; su viabilidad no está documentada.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Rastignac 1.0 — 126M (GGUF) | 126,5 M | no disponible | francés | `other` (remite a Project Gutenberg) | Compleción literaria en francés |
| GPT-2 small | 124 M | 1024 tokens | inglés | MIT | Modelo causal generalista de propósito general |
| BLOOM-560m | 559 M | 2048 tokens | multilingüe (incluye francés) | bigscience-bloom-rail-1.0 | Modelo causal multilingüe generalista |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Rastignac 1.0 — 126M con estas alternativas. La comparación anterior se limita a parámetros, contexto, idioma y licencia, datos públicos y verificables de los modelos citados. No se han identificado en la información proporcionada otros modelos comparables específicamente entrenados para compleción literaria en francés.

## Limitaciones y advertencias

- **No sigue instrucciones**: es un modelo de compleción pura; no cabe esperar respuestas a preguntas, formato de chat ni cumplimiento de consignas.
- **Riesgo alto de alucinación**: con 126 M de parámetros y sin alignment, la coherencia se degrada rápidamente más allá de fragmentos cortos y puede producir contenido factualmente falso o incoherente.
- **Sesgos del corpus**: el entrenamiento con literatura francesa clásica puede reproducir estereotipos de época (sexistas, coloniales, clasistas) y un registro arcaico poco adecuado para textos contemporáneos.
- **Ausencia de filtros de seguridad**: no hay evidencia de RLHF ni de moderación, por lo que puede generar contenido inapropiado sin restricción.
- **Monolingüe**: solo francés; no hay soporte documentado de otros idiomas.
- **Contexto desconocido**: se desconoce la ventana de contexto, lo que dificulta planificar usos con entradas largas.
- **Licencia `other` y derechos del corpus**: el autor advierte de que los derechos aplicables al corpus pueden depender del autor, la edición y el país de uso, y remite a la licencia de Project Gutenberg. El uso comercial no está garantizado y debe verificarse caso por caso antes de un despliegue en producción.
- **Sin validación comunitaria**: 0 descargas y 0 «likes» en los metadatos, sin benchmarks ni evaluaciones de terceros; no hay evidencia independiente de calidad.
- **Metadatos llamativos**: la fecha de creación registrada es 2026-09-10, posterior a la fecha habitual de publicación de modelos; conviene verificar la ficha original antes de citarla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mathieu680/Rastignac-1.0-126M-GGUF
- Repositorio principal (Transformers/Safetensors): https://huggingface.co/Mathieu680/Rastignac-1.0-126M
- Licencia de Project Gutenberg: https://www.gutenberg.org/policy/license
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (papers, blogs o demos): no disponible.
