# positron-ai/Llama-3.2-1B-Instruct

## Resumen

Llama-3.2-1B-Instruct es un modelo de lenguaje de 1.235.814.400 parámetros (aproximadamente 1,24 mil millones) desarrollado originalmente por Meta y redistribuido aquí por positron-ai. Se trata de una redistribución no modificada (*mirror*) del repositorio `meta-llama/Llama-3.2-1B-Instruct`, fijada al commit `e9f8effbab1cbdc515c11ee6e098e3d5a9f51e14`. Los pesos, el tokenizer y los ficheros de configuración son idénticos byte a byte a ese commit; el repositorio solo añade un README y un fichero `NOTICE`.

El propósito declarado de esta copia es servir como fuente fijada (*pinned source*) para las cuantizaciones GPTQ que positron-ai publica bajo su organización. Por tanto, no aporta ninguna modificación de arquitectura, entrenamiento ni ajuste fino respecto al original: es el modelo instructivo pequeño de la familia Llama 3.2, pensado para generación de texto y conversación con un coste de inferencia muy bajo.

Su relevancia práctica radica en que permite ejecutar un modelo de la familia Llama 3.2 en hardware modesto (GPU de consumo e incluso CPU con cuantización), y en que esta copia concreta ofrece una referencia reproducible con hashes SHA256 verificables para pipelines que necesitan anclar la versión exacta de los pesos antes de cuantizar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2; detalles de capas y cabezas no disponibles en la información proporcionada) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | El repositorio contiene pesos sin cuantizar (safetensors); positron-ai publica cuantizaciones GPTQ en repositorios separados. Otras cuantizaciones (GGUF, AWQ) no disponibles en esta copia |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License Agreement (más Acceptable Use Policy de Meta) |
| Formato de pesos | safetensors (`model.safetensors`, SHA256 `1ff795ff6a07e6a68085d206fb84417da2f083f68391c2843cd2b8ac6df8538f`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Llama 3.2 en su variante instructiva de 1B: un transformer decoder-only denso con atención causal. La información proporcionada no detalla el número de capas, dimensiones ocultas, cabezas de atención ni el mecanismo exacto de atención; esos datos deben consultarse en la model card original de Meta, que este repositorio enlaza explícitamente y no replica.

Tampoco se documentan en esta copia el volumen de tokens de preentrenamiento, la composición del corpus, ni las etapas de alineación (SFT, RLHF o DPO) aplicadas por Meta. El autor de la redistribución indica de forma explícita que toda la documentación, evaluaciones y guías de uso responsable residen en la model card upstream, y que no se ha realizado ningún ajuste fino sobre los pesos redistribuidos. La única innovación atribuible a este repositorio es de tipo operativo: la fijación por commit y la publicación de hashes SHA256 para garantizar reproducibilidad.

## Capacidades

- Generación de texto conversacional en modo instructivo, con formato de chat propio de Llama 3.2.
- Razonamiento básico y respuesta a instrucciones de complejidad baja o media, acorde a un modelo de 1,24B parámetros.
- Generación de código y asistencia de programación a nivel introductorio; sin datos de benchmarks publicados en esta copia.
- Capacidad multilingüe declarada para ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Compatibilidad con `text-generation-inference` y con endpoints, según los tags del repositorio.
- Soporte de tool calling, function calling, modo thinking, agentes multi-paso, visión o audio: no disponible en la información proporcionada (la variante de 1B de Llama 3.2 no incluye visión en la información consultada).

## Casos de uso

- Clasificación y etiquetado de texto a gran escala: al ser un modelo de 1,24B, se puede desplegar en lote sobre GPU de consumo para tareas de categorización, análisis de sentimiento o extracción de entidades, con coste por token muy bajo frente a modelos de mayor tamaño.
- Prototipado rápido de asistentes conversacionales: sirve para validar prompts, plantillas de chat y flujos multi-turno antes de migrar a un modelo mayor, manteniendo el mismo formato de tokenizer y plantilla de Llama 3.2.
- Generación de texto en entornos con recursos limitados: adecuado para portátiles con GPU de gama media, estaciones de trabajo sin acelerador dedicado o despliegues en el borde, donde un modelo de 7B o superior no cabría con holgura.
- Filtrado y preprocesado en pipelines de datos: reescritura, resumen corto, normalización o generación de pares pregunta-respuesta sintéticos para alimentar etapas posteriores de un pipeline de datos.
- Base para ajuste fino ligero: al ser una redistribución fiel y verificable, es un punto de partida estable para LoRA o QLoRA sobre dominios concretos, con la ventaja de que los hashes permiten reproducir exactamente el estado inicial.
- Referencia reproducible para cuantización: útil para equipos que necesitan anclar la versión exacta de los pesos (commit y SHA256) antes de generar cuantizaciones GPTQ propias y comparar resultados entre ejecuciones.
- Asistente embebido en herramientas internas: generación de borradores de correo, resúmenes de notas o ayuda contextual en aplicaciones de escritorio, donde la latencia y el consumo importan más que la calidad punta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta redistribución remite explícitamente a la documentación de Meta para evaluaciones, y no incluye cifras propias.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 2,5 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, del orden de 3 a 4 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 1,3-1,5 GB para pesos.
- VRAM estimada con cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 0,7-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (RTX 3050, RTX 4060, T4, L4); A100 y H100 son sobredimensionadas para este tamaño y solo se justifican por agregación de muchas instancias concurrentes.
- Cabe en GPU de consumo: sí, en toda la gama RTX 30/40 con 6 GB o más, y en GPUs de 4 GB con cuantización.
- Ejecución en CPU: viable con llama.cpp u Ollama en cuantización Q4, con throughput bajo pero funcional para uso interactivo no intensivo.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp, Ollama y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen fuertemente del backend, la cuantización y el lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| positron-ai/Llama-3.2-1B-Instruct (esta ficha) | 1,24B | No disponible | Llama 3.2 Community License | Hugging Face, mirror verificado por SHA256 | Redistribución sin modificar; fuente para GPTQ de positron-ai |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | No disponible | Llama 3.2 Community License | Hugging Face (oficial) | Original de Meta; incluye model card completa con evaluaciones |
| Llama-3.2-3B-Instruct | 3,21B (aprox., no confirmado en la información disponible) | No disponible | Llama 3.2 Community License | Hugging Face | Misma familia, mayor calidad a cambio de más VRAM |
| Qwen2.5-1.5B-Instruct | 1,5B (aprox., no confirmado en la información disponible) | No disponible | Apache 2.0 (según información pública, no verificada aquí) | Hugging Face | Alternativa de tamaño similar con licencia permisiva; datos no verificados en esta ficha |

Las cifras de rendimiento comparado no están disponibles en la información proporcionada y no se incluyen estimaciones.

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo de este tamaño, tiende a inventar hechos, citas y referencias; la capacidad reducida de 1,24B agrava este riesgo en dominios especializados.
- Sesgos: los sesgos del modelo original de Meta se heredan sin cambios; esta redistribución no aplica ningún filtrado ni corrección adicional.
- Contexto e idioma: la longitud de contexto no está documentada en esta copia; los ocho idiomas declarados no implican calidad homogénea, y el rendimiento en hindi, tailandés o español puede ser notablemente inferior al del inglés.
- Licencia: el uso comercial está permitido por la Llama 3.2 Community License, pero sujeto a sus condiciones (incluida la política de uso aceptable de Meta y las obligaciones de atribución "Built with Llama"). Es imprescindible revisar `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio antes de desplegar en producción.
- Ausencia de documentación propia: esta copia no incluye evaluaciones, guías de uso responsable ni detalles de entrenamiento; cualquier decisión de producción debe basarse en la model card upstream.
- Verificación de integridad: si se descarga desde un mirror o CDN, conviene comprobar el SHA256 de `model.safetensors` contra el valor publicado para garantizar que los pesos coinciden con el commit fijado.
- Repositorio de bajo uso: 795 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria extensa sobre esta copia concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/positron-ai/Llama-3.2-1B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Commit fijado del modelo original: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/tree/e9f8effbab1cbdc515c11ee6e098e3d5a9f51e14
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Organización positron-ai en Hugging Face: https://huggingface.co/positron-ai
