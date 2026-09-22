# Gabrifreeme/qwen2.5-3b-acesi-lora

## Resumen

qwen2.5-3b-acesi-lora es un ajuste fino publicado por el usuario Gabrifreeme sobre el modelo Qwen2.5-3B-Instruct en su variante cuantizada a 4 bits de Unsloth (unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit). El repositorio ocupa 0,1 GB, un tamaño coherente con un adaptador LoRA más que con un conjunto completo de pesos, algo que el sufijo del identificador sugiere pero que la model card no confirma de forma explícita. Tampoco se documentan el conjunto de datos, el número de pasos, el rango del adaptador ni los hiperparámetros empleados.

El modelo hereda por tanto las características del Qwen2.5-3B-Instruct: un transformer denso decoder-only de aproximadamente 3.090 millones de parámetros, con ventana de contexto nativa de 32.768 tokens. El autor indica que el entrenamiento se realizó con Unsloth, con una velocidad declarada dos veces superior a la de un entrenamiento convencional. El sufijo «acesi» del nombre no aparece explicado en ninguna parte de la documentación.

Su relevancia es limitada desde el punto de vista de la evaluación técnica: se trata de un experimento personal con cero descargas y cero «likes» en el momento de redactar esta ficha, sin benchmarks publicados y con una model card mínima. Sí resulta útil, en cambio, como ejemplo de flujo de trabajo de ajuste fino económico con Unsloth sobre un modelo de 3B cuantizado a 4 bits, ejecutable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen2, heredada del modelo base Qwen2.5-3B-Instruct. No se detalla en la model card del repositorio. |
| Parámetros totales | Aproximadamente 3.090 millones en el modelo base. El tamaño del adaptador no se especifica; el repositorio completo ocupa 0,1 GB. |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-3B-Instruct (ampliable hasta 131.072 con escalado RoPE tipo YaRN). No confirmado en la model card del repositorio. |
| Tipos de cuantización | El modelo de partida está cuantizado a 4 bits con bitsandbytes (bnb-4bit). El repositorio no publica ficheros GGUF ni cuantizaciones propias. |
| Idiomas soportados | La model card declara únicamente «en» (inglés). El modelo base Qwen2.5 cubre más de 29 idiomas, pero el ajuste fino se ha realizado presumiblemente sobre datos en inglés. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, según las etiquetas del repositorio. Compatible con transformers. |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only denso de la familia Qwen2: 36 capas, dimensión oculta de 2048, 16 cabezas de atención con 2 cabezas KV (atención de consultas agrupadas, GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El vocabulario es de 151.936 tokens. La fase de preentrenamiento de la serie Qwen2.5 se realizó sobre aproximadamente 18 billones de tokens, seguida de ajuste por instrucciones y alineación mediante DPO. Estos datos proceden de la documentación pública del modelo base y no aparecen en la ficha del repositorio analizado.

El ajuste concreto publicado en este repositorio se realizó con Unsloth, una biblioteca que optimiza el entrenamiento de modelos transformer mediante kernels propios y reducción del uso de memoria. Dado que el punto de partida es un modelo ya cuantizado a 4 bits, es probable que se haya empleado una estrategia tipo QLoRA, aunque la model card no lo especifica. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la pérdida final ni si se aplicaron fases adicionales de alineación tras el ajuste. Tampoco se documenta ninguna innovación técnica propia más allá del uso declarado de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste por instrucciones del modelo base.
- Razonamiento de complejidad media y resolución de problemas aritméticos sencillos, con el techo propio de un modelo de 3.000 millones de parámetros.
- Generación de código en lenguajes habituales (Python, JavaScript, SQL), sin garantías de corrección en proyectos grandes.
- Seguimiento de instrucciones y salida en formato estructurado, útil para extracción de campos y generación de JSON.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5, aunque no verificado en este ajuste concreto.
- Capacidad multilingüe potencial del modelo base, restringida en la práctica por un ajuste declarado únicamente en inglés.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de visión o audio: no disponibles; se trata de un modelo exclusivamente de texto.
- Comportamiento especializado derivado del ajuste «acesi»: no documentado.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés sobre hardware local: al derivar de un modelo de 3B cuantizable a 4 bits, puede ejecutarse en una GPU de gama media o incluso en CPU con llama.cpp, lo que permite validar flujos conversacionales sin coste de API.
- Investigación sobre QLoRA y Unsloth: el repositorio sirve como referencia práctica de un ajuste fino de bajo coste sobre un modelo de 3B previamente cuantizado, útil para reproducir pipelines de entrenamiento con recursos limitados.
- Extracción de información estructurada: el modelo base Qwen2.5-3B-Instruct mantiene una competencia razonable en el seguimiento de formatos, por lo que puede emplearse para convertir texto libre en JSON con esquemas sencillos, siempre con validación posterior.
- Clasificación y etiquetado de textos cortos: análisis de sentimiento, categorización de tickets o detección de intención en inglés, con la ventaja de poder procesar lotes en una única GPU de 12-16 GB.
- Generación de código en entornos con restricciones de hardware: autocompletado y generación de fragmentos de código dentro de editores o scripts, asumiendo revisión humana obligatoria por el tamaño reducido del modelo.
- Resumen de documentos de extensión moderada: la ventana de 32.768 tokens del modelo base permite resumir informes o actas de varias decenas de páginas en una sola pasada, aunque con riesgo apreciable de omisión de detalles.
- Base para un ajuste fino adicional en un dominio concreto: al ser un adaptador ligero, es posible continuar el entrenamiento o fusionarlo con el modelo base y aplicar un segundo ajuste específico sin partir de cero.
- Despliegue educativo o de demostración: útil en entornos docentes para ilustrar el ciclo completo de ajuste, publicación y despliegue de un modelo en HuggingFace, dado su reducido tamaño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna evaluación, y tampoco se han encontrado métricas en los resultados de búsqueda. Para valores de referencia del modelo base puede consultarse el informe técnico de Qwen2.5, aunque no se reproducen aquí por no estar verificados en la información disponible y no ser extrapolables al ajuste publicado.

## Requisitos de hardware

- Adaptador LoRA: 0,1 GB en disco, según el tamaño del repositorio. No es un modelo autónomo; requiere cargar el modelo base junto con el adaptador.
- Modelo base en bnb-4bit: aproximadamente 2 GB de VRAM para los pesos, más el espacio de activaciones y caché KV.
- Modelo base en FP16: aproximadamente 6,2 GB de VRAM para los pesos.
- Cuantizaciones GGUF estimadas: alrededor de 2 GB en Q4_K_M y 3,5 GB en Q8_0, previa fusión del adaptador con el modelo base y conversión de formato.
- GPU recomendadas: NVIDIA RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, así como A100 o H100 para despliegues con concurrencia alta. Con cuantización de 4 bits y contexto moderado cabe en GPU de 8 GB.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de gama media y alta actuales, y también en CPU mediante llama.cpp con cuantización agresiva.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM con soporte de adaptadores LoRA, text-generation-inference, llama.cpp u Ollama tras fusionar y convertir los pesos, y LM Studio para uso de escritorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparación mezcla un adaptador LoRA con modelos completos, por lo que las cifras de parámetros y contexto corresponden al modelo base de cada caso.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-3b-acesi-lora (este) | Adaptador sobre base de ~3.090 M | 32.768 tokens (heredado) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct | ~3.090 M | 32.768 tokens, ampliable a 131.072 | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Llama-3.2-3B-Instruct | ~3.210 M | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, con registro y aceptación de términos |
| Phi-3.5-mini-instruct | ~3.800 M | 128.000 tokens | MIT | HuggingFace |
| Gemma-2-2B-it | ~2.610 M | 8.192 tokens | Términos de uso de Gemma | HuggingFace, con aceptación de términos |

Rendimiento comparado: no disponible. No se han publicado evaluaciones del ajuste analizado ni se dispone de métricas verificadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, el número de pasos, el rango del adaptador, la tasa de aprendizaje ni los criterios de parada, lo que impide reproducir el entrenamiento o evaluar su calidad.
- Validación comunitaria nula: cero descargas y cero «likes». No hay evidencia de que el modelo funcione correctamente en ningún escenario.
- Naturaleza del artefacto: con 0,1 GB de repositorio, es casi con certeza un adaptador LoRA y no un modelo completo; no puede desplegarse sin el modelo base correspondiente.
- Riesgo de sobreajuste y olvido catastrófico: los ajustes finos sobre datasets pequeños y no documentados suelen degradar capacidades generales del modelo base, especialmente el razonamiento y el multilingüismo.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de Qwen2.5. No se ha realizado ninguna evaluación de sesgo o toxicidad sobre este ajuste.
- Alucinación: un modelo de 3.000 millones de parámetros presenta una tasa de alucinación notablemente superior a la de modelos de mayor tamaño, especialmente en preguntas factuales y en contextos largos.
- Limitación idiomática: la model card declara únicamente inglés. El uso en castellano u otros idiomas no está soportado y probablemente dé resultados degradados.
- Límite de contexto: 32.768 tokens nativos. Superar esa longitud sin configurar el escalado RoPE produce degradación del rendimiento.
- Licencia: Apache 2.0 tanto en el adaptador como en el modelo base Qwen2.5-3B, lo que permite uso comercial sin restricciones adicionales. Debe verificarse igualmente la licencia de la variante de Unsloth utilizada como punto de partida.
- Trazabilidad: el significado del sufijo «acesi» es desconocido, por lo que no puede presuponerse una especialización funcional concreta.
- Uso en producción: no recomendado sin una evaluación previa sobre el dominio objetivo, dado que no existe ningún benchmark publicado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Gabrifreeme/qwen2.5-3b-acesi-lora
- Modelo base utilizado para el ajuste: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentación oficial de Qwen: https://qwen.readthedocs.io/
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a páginas de soporte de Google (YouTube TV, configuración de buscador, modo restringido, Google Docs sin conexión y bombas de calor en Nest) y no guardan relación alguna con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales vinculados a este ajuste.
