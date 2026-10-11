# frankenhack/Kivi-1.5B

## Resumen

frankenhack/Kivi-1.5B es un modelo de generación de texto publicado en HuggingFace por el usuario frankenhack. Se trata de un checkpoint de aproximadamente 1.540 millones de parámetros (1.543.714.304 exactos, según los pesos en safetensors), etiquetado con la arquitectura qwen2 y el pipeline text-generation, además del tag conversational. La ficha del repositorio es la plantilla automática de HuggingFace sin rellenar: no incluye descripción, datos de entrenamiento, licencia, idiomas ni resultados de evaluación.

El modelo es relevante únicamente como ejemplo del ecosistema de checkpoints derivados de Qwen2 de tamano pequeño, no por su documentación: acumula 0 descargas y 0 "likes" y fue creado el 10 de octubre de 2026, por lo que se trata de una publicación reciente y sin validación por parte de la comunidad. Su tamano (1,5 B de parámetros, repo de 3,1 GB) lo sitúa en la categoría de modelos que caben en GPUs de consumo, lo que explicaría su interés potencial para despliegues locales.

Al no existir model card sustantiva, procedencia declarada del entrenamiento ni licencia, cualquier uso en producción debería ir precedido de una evaluación propia. La información de esta ficha se limita a los metadatos del Hub y al recuento real de parámetros; todo lo no verificable se marca como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la ficha; el tag del Hub indica qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 (dato real de los safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha; el repo solo contiene safetensors, sin GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería declarada: transformers) |

Nota: el tamano del repositorio (3,1 GB) es coherente con pesos almacenados en precision de 16 bits (1,54 B de parámetros x 2 bytes ≈ 3,09 GB). Es una inferencia a partir del tamano, no un dato declarado por el autor.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura más allá de las etiquetas del Hub, que apuntan a la familia Qwen2 (transformer decoder-only con atención por grupos, habitual en esa familia). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste con RLHF, DPO o SFT. Se desconoce si el checkpoint es un ajuste fino, un merge de modelos o un entrenamiento desde cero.

La model card reproduce íntegramente la plantilla automática de HuggingFace, con todos los campos marcados como "[More Information Needed]". La única referencia técnica citada, el arXiv 1910.09700 (Lacoste et al., calculadora de impacto de carbono), forma parte del texto por defecto de la plantilla y no describe este modelo. No se han identificado innovaciones técnicas declaradas (decodificación especulativa, atención lineal, MoE, SSM) en la información disponible.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por los metadatos (pipeline text-generation).
- Uso conversacional: el tag conversational sugiere que el checkpoint está pensado para diálogo, aunque no se documenta el formato de plantilla de chat ni el tokenizador empleado.
- Compatibilidad con text-generation-inference y con los Inference Endpoints de HuggingFace (tags text-generation-inference y endpoints_compatible).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; los tags no incluyen image-text-to-text ni audio.
- Razonamiento, matemáticas y código: no disponibles; no hay benchmarks ni ejemplos publicados.

## Casos de uso

Los siguientes escenarios son hipótesis de uso razonables dado el tamano del modelo y su naturaleza conversacional, pero no están respaldados por ninguna evaluación publicada del checkpoint. Cualquiera de ellos requiere validación previa.

- Asistentes conversacionales locales en el escritorio: un modelo de 1,5 B puede ejecutarse en CPU o en GPU de gama media para chat de propósito general sin conexión, útil en entornos con requisitos de privacidad. La ventana de contexto real es desconocida, así que habría que medirla antes de asumir conversaciones largas.
- Clasificación y extracción de información: reutilizar el checkpoint como base para tareas de etiquetado, resumen corto o extracción de entidades, con ajuste fino supervisado sobre datos propios.
- Preprocesado en pipelines de datos: generación de resúmenes o reformulados a gran escala donde el coste por token es el factor dominante y la calidad no es crítica.
- Punto de partida para ajuste fino (fine-tuning): al ser un modelo de 1,5 B en safetensors, es viable ajustarlo en una GPU de 24 GB con LoRA o QLoRA, sirviendo como base para dominios verticales.
- Experimentación académica y docencia: comparativa de arquitecturas Qwen2 de tamano pequeño, estudios de destilación o de eficiencia de inferencia con un modelo ligero.
- Prototipado rápido de aplicaciones con la librería transformers o TGI: validar una interfaz de chat antes de migrar a un modelo mayor, gracias a la compatibilidad declarada con text-generation-inference y endpoints_compatible.
- Despliegue en el borde (edge) o en dispositivos con GPU integrada: si se convierte a GGUF y se cuantiza a 4 bits, encaja en el presupuesto de memoria de equipos de gama de entrada, aunque la conversión y su calidad no están verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos y no se han encontrado evaluaciones independientes del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no dato del autor):
  - fp16/bf16: aproximadamente 3,1 GB solo de pesos, más caché KV y activaciones; en la práctica, reservar 4-5 GB.
  - int8: alrededor de 1,6 GB de pesos; reservar 2,5-3 GB.
  - int4 (por ejemplo GGUF Q4_K_M): alrededor de 0,9-1,2 GB de pesos; reservar 2 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070) para fp16 con contexto moderado; RTX 4090, A100 o H100 quedan muy por encima de lo necesario y solo se justifican por agregación de peticiones.
- Cabe en GPU de consumo: sí, con toda probabilidad, en cualquier tarjeta con 4 GB o más de VRAM tras cuantizar, y en 6-8 GB en precisión de 16 bits. Las cuantizaciones a 4 bits podrían permitir incluso ejecución en CPU con llama.cpp, pero no hay ficheros GGUF publicados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio), HuggingFace Inference Endpoints (etiqueta endpoints_compatible). vLLM sería compatible en principio por tratarse de la arquitectura Qwen2, pero no está confirmado. Para llama.cpp u Ollama habría que convertir los pesos a GGUF con las herramientas habituales, ya que el repositorio no incluye esos formatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de la columna de otros modelos provienen de sus fichas públicas y no forman parte de la información proporcionada sobre Kivi-1.5B; se incluyen como referencia de categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| frankenhack/Kivi-1.5B | 1,54 B | no disponible | no disponible | Repositorio HuggingFace, 0 descargas |
| Qwen2-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 tokens | Apache 2.0 | HuggingFace, con model card completa |
| Gemma-2-2B-it | 2,6 B | 8192 tokens | Licencia Gemma (uso comercial condicionado) | HuggingFace, requiere aceptar términos |

La diferencia principal no es de tamano, sino de trazabilidad: los tres modelos de comparación publican arquitectura, datos de entrenamiento, licencia, idiomas y resultados de evaluación, mientras que Kivi-1.5B no documenta ninguno de esos aspectos. No hay datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- Ausencia total de model card: se desconoce el origen de los datos de entrenamiento, por lo que no se pueden evaluar sesgos ni contenido problemático.
- Riesgo de alucinación: no cuantificado y, en modelos de 1,5 B sin ajuste documentado, previsiblemente alto en tareas de conocimiento factual.
- Licencia no disponible: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución; en la Unión Europea, la ausencia de términos puede impedir legalmente su explotación en producción.
- Idiomas no declarados: se desconoce si el modelo soporta castellano con calidad suficiente; habría que evaluarlo empíricamente antes de usarlo en aplicaciones en español.
- Contexto no declarado: no se puede planificar un caso de uso con ventana larga sin medir previamente el máximo de tokens soportado.
- Sin benchmarks ni validación de la comunidad (0 descargas, 0 likes): el checkpoint no ha sido contrastado por terceros, por lo que su calidad es una incógnita.
- Procedencia no verificada: no se indica si es un ajuste fino, un merge o un entrenamiento desde cero, ni su relación con otros modelos Qwen2.
- Formato limitado: solo safetensors; no hay versiones cuantizadas listas para llama.cpp, Ollama o GPTQ, lo que obliga a convertir los pesos antes de desplegar en entornos ligeros.
- Los pesos están en safetensors, formato sin ejecución de código arbitrario, lo que reduce el riesgo de seguridad habitual de los ficheros pickle, pero no lo elimina en el resto del pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankenhack/Kivi-1.5B
- Referencia citada en la plantilla de la model card (calculadora de impacto de carbono, no específica de este modelo): https://arxiv.org/abs/1910.09700
- Herramienta de estimación de emisiones mencionada en la plantilla: https://mlco2.github.io/impact
- Repositorio, paper o demo del autor: no disponibles.
- No se han encontrado resultados de búsqueda web relevantes sobre este modelo; las consultas devolvieron únicamente páginas sin relación con el checkpoint (información sobre el distrito 11 de París).
