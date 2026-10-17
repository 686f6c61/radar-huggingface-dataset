# luisastellet/qwen-metaphor-unke-camada-3-zero-um

## Resumen

`luisastellet/qwen-metaphor-unke-camada-3-zero-um` es un checkpoint de generación de texto publicado en HuggingFace por el usuario `luisastellet` el 14 de octubre de 2026 y actualizado tres días después. El dato objetivo disponible es el recuento de parámetros extraído de los pesos en safetensors: 596.049.920 parámetros, es decir, aproximadamente 0,6 mil millones. La etiqueta de arquitectura del repositorio es `qwen3`, lo que indica que el modelo deriva de la familia Qwen3, y el pipeline declarado es `text-generation` con estilo `conversational`.

La relevancia de esta ficha es fundamentalmente metodológica: se trata de un modelo con la model card autogenerada por la plantilla de HuggingFace, sin ningún apartado completado por el autor. No hay información publicada sobre datos de entrenamiento, hiperparámetros, licencia, idiomas soportados ni evaluación. Cualquier uso en producción exige una verificación directa de los pesos y de los términos legales antes de integrarlo.

El nombre del repositorio (`metaphor-unke`, `camada-3`, `zero-um`) sugiere una familia de checkpoints derivados —existen repositorios hermanos como `qwen-metaphor-unke` y `qwen-metaphor-unke-camada-8-zero-um`—, pero el autor no documenta la relación entre ellos ni el procedimiento de obtención. Se desconoce, por tanto, si se trata de un fine-tuning, de una extracción de capas intermedias o de otra transformación sobre un modelo base Qwen3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder, familia Qwen3 según el tag del repositorio (no confirmado en la model card) |
| Parámetros totales | 596.049.920 (dato real de safetensors) |
| Parámetros activos | No aplica / no disponible (no se ha confirmado una arquitectura MoE) |
| Longitud de contexto | No disponible en la model card; agregadores de terceros reportan 32.768 tokens para checkpoints hermanos de la misma familia, sin confirmación para este |
| Tipos de cuantización | No disponible. Solo se confirma la presencia de pesos en safetensors; no hay GGUF ni cuantizaciones publicadas verificadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño total del repositorio: 7,2 GB) |
| Librería declarada | transformers |
| Compatibilidad de despliegue | tags `text-generation-inference` y `endpoints_compatible` |
| Descargas / likes | 517 descargas, 0 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La única información arquitectónica fiable es la inferida de los tags y del recuento de parámetros: un transformer decoder denso de ~0,6 B de parámetros, etiquetado como `qwen3`, lo que sitúa la base en la familia Qwen3 de Alibaba. El tamaño declarado del repositorio (7,2 GB) es notablemente superior a lo que ocuparían los pesos de un modelo de 596 M en bf16 (aproximadamente 1,2 GB), lo que apunta a que el repositorio contiene múltiples ficheros de pesos, versiones duplicadas o material adicional. No es posible determinar la composición exacta sin inspeccionar el árbol de ficheros.

No hay información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, ni sobre si se aplicaron etapas de SFT, RLHF o DPO. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, modos de razonamiento explícito). El identificador `arxiv:1910.09700` que aparece en los tags corresponde a Lacoste et al. (2019) sobre estimación de emisiones de carbono, un enlace que la plantilla de HuggingFace inserta automáticamente; no es el paper del modelo. El sufijo `zero-um` y el término `camada` en el nombre no van acompañados de ninguna explicación del autor.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`, según la metadata del repositorio.
- Estilo conversacional: el tag `conversational` indica presumiblemente un ajuste orientado a diálogo, aunque no se documenta el formato de prompt ni la plantilla de chat.
- No hay evidencia publicada de soporte de tool calling, function calling ni capacidades de agente.
- No hay evidencia publicada de razonamiento multi-paso, modo thinking ni cadena de pensamiento explícita.
- No hay información sobre capacidades multilingües ni sobre el rendimiento en castellano.
- No se declaran capacidades de visión, audio ni multimodalidad.
- No se ha publicado ninguna evaluación cualitativa ni ejemplo de uso por parte del autor.

## Casos de uso

Dado que no existe documentación de entrenamiento ni evaluación, los casos siguientes son escenarios plausibles para un modelo de ~0,6 B de parámetros con pesos abiertos, no recomendaciones validadas:

- Prototipado rápido de interfaces conversacionales: el tamaño de 596 M permite ejecutar el modelo en una GPU de consumo o incluso en CPU para validar flujos de diálogo antes de migrar a un modelo mayor.
- Clasificación y etiquetado de texto por generación: tareas de extracción de entidades, categorización de tickets o resumen corto, donde el coste por token es determinante y el contexto requerido es reducido.
- Generación de texto en dispositivos con recursos limitados: escenarios de edge computing o aplicaciones de escritorio donde no es viable enviar datos a una API externa.
- Fine-tuning específico de dominio: al ser un checkpoint pequeño, sirve como base económica para ajuste supervisado sobre corpus propios (por ejemplo, atención al cliente de un sector concreto), siempre que se resuelva la licencia.
- Experimentación académica sobre extracción de capas: el nombre `camada-3` sugiere un interés en estudiar representaciones intermedias; el modelo puede emplearse como objeto de análisis de interpretabilidad, comparándolo con sus checkpoints hermanos.
- Filtrado y moderación de contenido en pipelines de CI: con cuantización a 4 bits ocupa del orden de 300 MB, lo que permite incluirlo como paso de preprocesado en flujos automatizados.
- Generación de datos sintéticos a pequeña escala para aumentar datasets de entrenamiento, con revisión humana posterior obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ningún apartado de evaluación cumplimentado (MMLU, HumanEval, GSM8K, MT-Bench u otros) y el autor no ha publicado métricas en los resultados de búsqueda consultados.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (596 M). Los valores de VRAM son cálculos teóricos de pesos, sin overhead de activaciones ni de caché KV:

| Precisión | VRAM aproximada de pesos | ¿Cabe en GPU de consumo? |
|---|---|---|
| FP32 | ~2,4 GB | Sí (RTX 3060 12 GB y superiores) |
| BF16 / FP16 | ~1,2 GB | Sí (GTX 1660 6 GB, RTX 3050 8 GB) |
| INT8 | ~0,6 GB | Sí, cualquier GPU con 4 GB o más |
| INT4 | ~0,3 GB | Sí, incluso en iGPU y CPU |

- GPU recomendadas: no hay requisitos publicados. Por tamaño, una RTX 4090, A100 o H100 están sobredimensionadas; una RTX 3060, RTX 4060 o una T4 son suficientes para inferencia en FP16.
- Despliegue: el tag `text-generation-inference` sugiere compatibilidad con TGI. También debería funcionar con `transformers` directamente, con vLLM (si la arquitectura Qwen3 subyacente está soportada) y con llama.cpp/Ollama, aunque en este último caso sería necesario convertir los pesos a GGUF, ya que no se han publicado ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia: el repositorio ocupa 7,2 GB, muy por encima de los ~1,2 GB que requerirían los pesos en bf16, por lo que la descarga completa puede ser innecesariamente costosa.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen de sus fichas públicas y deben verificarse antes de citarlos; los de este modelo figuran como no disponibles cuando el autor no los documenta.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `luisastellet/qwen-metaphor-unke-camada-3-zero-um` | 596 M | No disponible (32.768 según agregadores para checkpoints hermanos) | No disponible | HuggingFace, 517 descargas |
| Qwen3-0.6B | 0,6 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | Apache 2.0 | HuggingFace, muy extendido |
| SmolLM2-360M | 362 M | 8.192 tokens | Apache 2.0 | HuggingFace |

La diferencia práctica fundamental no es de arquitectura sino de trazabilidad: los tres comparadores tienen model card completa, licencia explícita, evaluación publicada y soporte en frameworks de inferencia. Este checkpoint no ofrece ninguna de esas garantías.

## Limitaciones y advertencias

- Licencia no disponible: sin términos explícitos, el uso comercial entra en zona de incertidumbre legal. No debe desplegarse en producción sin aclaración previa del autor.
- Model card autogenerada: todos los apartados de la plantilla están sin rellenar. No hay información sobre datos de entrenamiento, filtrado, sesgos ni evaluación de seguridad.
- Sin benchmarks: no existe ninguna medición de calidad, lo que impide comparar objetivamente con la base Qwen3 de la que supuestamente deriva.
- Riesgo de alucinación: al no haber evaluación, se desconoce el comportamiento del modelo en dominios factuales. Un modelo de 0,6 B tiene además capacidad limitada de razonamiento complejo y de seguimiento de instrucciones largas.
- Idiomas no documentados: no hay garantía de un rendimiento aceptable en castellano, aunque la base Qwen3 sea multilingüe. Requiere evaluación propia.
- Procedencia incierta del checkpoint: el nombre sugiere una extracción o transformación no documentada; si se trata de un subconjunto de capas, el modelo podría estar funcionalmente incompleto o degradado respecto al original.
- Sin plantilla de chat publicada: aunque el tag `conversational` esté presente, se desconoce el formato exacto de prompt, lo que afecta directamente a la calidad de las respuestas en diálogo.
- Cero likes y ausencia de comunidad: no hay retroalimentación de terceros que permita validar la calidad del modelo.
- Tamaño del repositorio desproporcionado (7,2 GB para 596 M de parámetros): conviene revisar el árbol de ficheros antes de descargarlo completo.
- Fecha de creación futura respecto a la fecha habitual de referencia: verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-3-zero-um
- Checkpoint hermano sin sufijo: https://huggingface.co/luisastellet/qwen-metaphor-unke
- Checkpoint hermano camada-8: https://featherless.ai/models/luisastellet/qwen-metaphor-unke-camada-8-zero-um
- Checkpoint hermano camada-5: https://featherless.ai/models/luisastellet/qwen-metaphor-unke-camada-5
- Ficha en FriendliAI: https://friendli.ai/models/luisastellet/qwen-metaphor-unke-camada-3-zero-um
- Paper citado en los tags (Lacoste et al., 2019, sobre emisiones de carbono; no es el paper del modelo): https://arxiv.org/abs/1910.09700
