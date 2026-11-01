# mradermacher/Mozi-2b-i1-GGUF

## Resumen

Mozi-2b-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base MoziLabs/Mozi-2b, un modelo de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) etiquetado por su autor como derivado de la familia Qwen 3.5 y orientado a razonamiento y destilación. El repositorio no contiene los pesos originales en safetensors, sino una batería de ficheros GGUF con cuantizaciones estáticas (Q2 a Q6) e imatrix (IQ1 a IQ6), pensadas para ejecución local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de menos de 2 mil millones de parámetros en hardware de consumo, desde un fichero de 0,8 GB en IQ1_S hasta 1,7 GB en Q6_K. El proceso de cuantización con imatrix (importance matrix) busca preservar la calidad del modelo original en tamaños reducidos, algo crítico en modelos pequeños donde cada bit cuenta. El repositorio tiene 195 descargas y ningún like en el momento de la consulta, lo que sugiere una adopción todavía limitada.

La licencia es MIT, lo que facilita el uso comercial y la redistribución. El idioma declarado es únicamente inglés. La información pública disponible sobre el modelo base es escasa: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como qwen3.5; detalles no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas fichero imatrix y cuantizaciones estaticas en el repo hermano Mozi-2b-GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base MoziLabs/Mozi-2b se presenta en el repositorio con las etiquetas qwen3.5, reasoning, distillation y lora, lo que indica que se trata de un transformer decoder-only de la familia Qwen 3.5, probablemente afinado mediante destilación de un modelo mayor y con adaptadores LoRA. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de este repositorio concreto no está en el modelo, sino en el proceso de cuantización: mradermacher aplica cuantización con importance matrix (imatrix), un método que estima la importancia de cada tensor a partir de estadísticas de activación para asignar más bits a los pesos críticos. Esto permite que las variantes IQ (IQ1 a IQ4) mantengan una perplejidad más baja que las cuantizaciones K estándar de tamaño equivalente, según las notas del propio autor. El fichero imatrix.gguf se incluye para que terceros puedan generar sus propias cuantizaciones con el mismo criterio.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta explicitica de conversational.
- Razonamiento (reasoning) como capacidad declarada por el autor, probablemente mediante cadenas de pensamiento.
- Destilación de conocimiento desde un modelo mayor, según la etiqueta distillation.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere uso en servidores de inferencia tipo API.
- Ejecución local en CPU y GPU mediante llama.cpp y derivados.
- No se declara soporte de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo language.

## Casos de uso

- Asistente conversacional local en inglés: con cuantizaciones Q4_K_M de 1,4 GB, el modelo cabe en cualquier portátil moderno y puede gestionar diálogos multi-turno sin conexión, útil para prototipos de chatbots en entornos sin red.
- Razonamiento ligero en el borde (edge): las variantes IQ2 e IQ3 (0,9-1,2 GB) permiten desplegar un modelo de razonamiento en dispositivos con poca memoria, como Raspberry Pi 5 o mini-PC, para tareas de clasificación y resumen.
- Filtrado y moderación de contenido: un modelo de 2 B puede preclasificar textos en pipelines de moderación antes de enviarlos a un modelo mayor, reduciendo costes de inferencia en producción.
- Generación de texto en herramientas de escritorio: integración en editores o asistentes de línea de comandos mediante llama.cpp, aprovechando el tamaño reducido del fichero Q4_0 (1,3 GB) para arranques rápidos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 24 variantes de cuantización más el fichero imatrix, lo que lo convierte en un banco de pruebas ideal para medir el impacto de la cuantización en la calidad de un modelo de razonamiento pequeño.
- Investigación en destilación: al ser un modelo destilado con LoRA, sirve como caso de estudio para analizar cómo se degrada el razonamiento bajo cuantizaciones agresivas (IQ1, IQ2).
- Servicio de inferencia autoalojado: con la etiqueta endpoints_compatible, puede exponerse mediante servidores compatibles con OpenAI API para aplicaciones internas de bajo tráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto. IQ1_S ronda 0,8 GB; Q4_K_M, 1,4 GB; Q6_K, 1,7 GB. Con contexto largo hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para Q6_K se recomiendan 3-4 GB (RTX 3060 en adelante). Las variantes IQ1 e IQ2 pueden ejecutarse en iGPU y CPU.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con 4 GB o más; las variantes más pequeñas funcionan incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI. El repositorio declara endpoints_compatible.
- Latencia y throughput: no disponibles. En un modelo de 1,88 B, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mozi-2b-i1-GGUF | ~1,88 B | No disponible | MIT | GGUF | Cuantizaciones imatrix de un modelo destilado de razonamiento |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54 B | 32.768 tokens (modelo base) | Apache 2.0 | GGUF | Alternativa consolidada de tamano similar, ampliamente cuantizada por la comunidad |
| Llama-3.2-1B-Instruct (GGUF) | 1,24 B | 131.072 tokens (modelo base) | Llama 3.2 Community License | GGUF | Menor, con contexto muy largo, pero licencia restrictiva para algunos usos |
| Gemma-2-2B-it (GGUF) | 2,61 B | 8.192 tokens (modelo base) | Gemma Terms of Use | GGUF | Mayor, con licencia condicionada |

La comparativa se basa en datos públicos de los modelos alternativos; para Mozi-2b no se dispone de contexto ni benchmarks verificables, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- Solo soporta inglés según el campo language; no se declara capacidad multilingüe.
- No hay información pública sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a modelos pequeños destilados; sin benchmarks no se puede cuantificar.
- Las cuantizaciones IQ1 e IQ2 están marcadas por el propio autor como "for the desperate" o "mostly desperate", lo que indica degradación severa de calidad.
- La longitud de contexto no está documentada; usarlo con contextos largos puede provocar fallos silenciosos.
- Aunque la licencia es MIT, el modelo base podría arrastrar obligaciones de la familia Qwen 3.5; conviene verificar la licencia del modelo original antes de uso comercial.
- El repositorio tiene muy poca tracción (195 descargas, 0 likes), lo que reduce la validación comunitaria y el soporte.
- No se declara soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Mozi-2b-i1-GGUF
- Modelo base: https://huggingface.co/MoziLabs/Mozi-2b
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Mozi-2b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Mozi-2b-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
