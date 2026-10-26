# mradermacher/Eternal.Bondange-3.2-1B-GGUF

## Resumen

Eternal.Bondange-3.2-1B-GGUF es la recopilación de cuantizaciones estáticas en formato GGUF del modelo NovaCorp/Eternal.Bondange-3.2-1B, un modelo de 1.498.482.720 parámetros (aproximadamente 1,5 B) generado mediante un merge con mergekit. La publicación corre a cargo de mradermacher, un cuantizador habitual de Hugging Face que distribuye versiones GGUF de modelos de terceros; el modelo original no incluye una model card detallada, por lo que la mayor parte de las especificaciones de entrenamiento no están documentadas.

El modelo se presenta con las etiquetas `roleplay`, `rpg`, `nsfw`, `uncensored`, `abliterated` y `low-refusals`, lo que lo sitúa en la categoría de modelos conversacionales orientados a rol y narrativa, con los mecanismos de rechazo atenuados o eliminados. Declara soporte de inglés y español y se distribuye bajo licencia Llama 3, lo que condiciona su uso comercial.

Su interés práctico es acotado pero claro: al tratarse de un modelo de 1,5 B con cuantizaciones que van de 0,8 GB (Q2_K) a 3,1 GB (f16), puede ejecutarse en CPU, en GPUs de gama de entrada e incluso en dispositivos de bajos recursos, sin depender de servicios en la nube. Ahora bien, no hay benchmarks publicados ni documentación sobre datos de entrenamiento, longitud de contexto o proceso de alineamiento, así que cualquier evaluación de calidad debe hacerse de forma empírica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el modelo base se distribuye para la librería `transformers` y se ha generado mediante merge con mergekit (presumiblemente transformer decoder-only, sin confirmar) |
| Parámetros totales | 1.498.482.720 (≈1,5 B), dato real de los safetensors |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (estáticas); existen variantes ponderadas/imatrix en el repositorio `mradermacher/Eternal.Bondange-3.2-1B-i1-GGUF` |
| Idiomas soportados | Inglés (`en`) y español (`es`), según las etiquetas del autor |
| Licencia | Llama 3 |
| Formato de pesos | GGUF en este repositorio; el modelo base se publica en formato `transformers` (safetensors) |
| Tamaño del repositorio | 13,8 GB (incluye todas las cuantizaciones) |
| Fecha de publicación | 26 de octubre de 2026 |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineamiento (RLHF, DPO u otros). El único dato técnico verificable es que el modelo base se ha construido mediante un merge con mergekit, es decir, por fusión de los pesos de dos o más modelos preexistentes, no por entrenamiento desde cero. La etiqueta `prototype` sugiere que se trata de un experimento de fusión sin validación extensa.

La etiqueta `abliterated` indica que se ha aplicado alguna técnica de ablación direccional para eliminar la dirección de rechazo en el espacio de activaciones, un procedimiento habitual para producir modelos con bajas negativas a peticiones sensibles. El autor no documenta qué modelos se fusionaron, con qué proporciones ni qué metodología de ablación se empleó, lo que impide reproducir el proceso o auditar la procedencia de los pesos.

## Capacidades

- Generación de texto conversacional en inglés y español, con orientación a diálogo multi-turno.
- Roleplay y narrativa interactiva: las etiquetas `rp`, `rpg` y `roleplay` indican que el merge está optimizado para mantener personajes y escenas coherentes.
- Contenido para adultos (`nsfw`) sin filtros aparentes, según la orientación declarada del modelo.
- Bajas negativas (`low-refusals`, `abliterated`): menor probabilidad de rechazar peticiones que otros modelos alineados rechazarían.
- Capacidad de razonamiento, matemáticas y código: no documentada y previsiblemente limitada por el tamaño (1,5 B); no hay evaluaciones que lo respalden.
- Tool calling / function calling: no disponible; no se menciona soporte de plantillas de herramientas ni de agentes.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Motores de rol y narrativa interactiva en local: el modelo puede sostener conversaciones con personajes consistentes en inglés o español y ejecutarse en un portátil sin GPU dedicada, gracias a cuantizaciones de 1,0-1,2 GB como Q4_K_S o Q4_K_M.
- Chatbot de escritorio totalmente offline: integrado con llama.cpp u Ollama, permite asistentes conversacionales sin conexión ni coste por token, adecuado para entornos con requisitos de privacidad estrictos.
- Prototipado rápido de pipelines de generación de texto: al ocupar menos de 2 GB en Q8_0, se puede desplegar en contenedores pequeños para validar plantillas de prompt, formateadores y lógicas de postproceso antes de migrar a un modelo mayor.
- Generación de datos sintéticos de diálogo: útil para aumentar datasets de conversación en español o inglés en dominios creativos, siempre con revisión humana posterior por la calidad limitada de un modelo de 1,5 B.
- Investigación sobre alineamiento y negativas: al ser un modelo `abliterated`, sirve como referencia para estudiar cómo varía la tasa de rechazo frente a modelos alineados de tamaño similar en experimentos de red-teaming controlados.
- Despliegue en hardware embebido o de bajos recursos: la cuantización Q2_K (0,8 GB) permite ejecución en CPU con poca RAM, útil para demos en ferias, instalaciones artísticas o dispositivos tipo Raspberry Pi.
- Escritura creativa asistida: generación de borradores de ficción, descripciones de escena y diálogos, con la advertencia de que la coherencia a largo plazo está limitada por la longitud de contexto no documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y la model card del modelo base tampoco aporta métricas. Cualquier comparación de calidad con otras alternativas debe realizarse mediante evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): 0,8 GB en Q2_K; 0,9 GB en Q3_K_S/M/L; 1,0 GB en IQ4_XS y Q4_K_S; 1,1 GB en Q4_K_M; 1,2 GB en Q5_K_S/M; 1,3 GB en Q6_K; 1,7 GB en Q8_0; 3,1 GB en f16. Hay que sumar la memoria de la caché KV, que depende del contexto configurado.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 3060 12 GB). En GPUs de 8-24 GB (RTX 3070/3080/4070/4080/4090, A100, H100) el modelo ocupa una fracción mínima de memoria y el cuello de botella pasa a ser el paralelismo de peticiones, no la VRAM.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; también en iGPU y en CPU con 2-4 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF mediante Modelfile), LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. Para el modelo base en safetensors pueden usarse vLLM o TGI; el soporte de GGUF en vLLM es experimental y TGI no está orientado a GGUF.
- Latencia y throughput: no se han publicado mediciones. El reducido número de parámetros (1,5 B) hace previsible una inferencia fluida en CPU moderna y muy rápida en GPU, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

Datos de las alternativas tomados de sus model cards públicas; no es posible comparar rendimiento porque este modelo no publica benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Eternal.Bondange-3.2-1B (este) | ≈1,5 B | No disponible | Llama 3 | Merge para rol y narrativa, sin filtros, EN/ES |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | Generalista, alineado, multilingüe |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | Generalista, con soporte de tool calling y quantización oficial |
| Gemma 2 2B | 2,6 B | 8 192 tokens | Términos de uso de Gemma | Generalista, alineado, orientado a eficiencia |

Frente a estas alternativas, Eternal.Bondange-3.2-1B se diferencia por su orientación explícita a contenido para adultos y por la reducción de negativas, no por capacidades técnicas. En contexto, licencia y documentación queda por detrás de las opciones generalistas citadas; en contrapartida, ofrece un comportamiento conversacional más permisivo que estas.

## Limitaciones y advertencias

- Modelo marcado como `not-for-all-audiences` y `nsfw`: puede generar contenido sexual explícito, violento o inapropiado; requiere filtrado y control de acceso si se expone a usuarios.
- La ablación de negativas (`abliterated`, `low-refusals`) implica una mayor probabilidad de responder a peticiones dañinas, ilegales o poco éticas; no es adecuado como asistente general sin una capa de moderación externa.
- Riesgo elevado de alucinación y de incoherencia a partir de pocos turnos: con 1,5 B de parámetros no hay garantía de consistencia factual ni de razonamiento multi-paso fiable.
- Longitud de contexto no documentada: no se puede planificar un caso de uso que dependa de ventanas largas sin medirla empíricamente.
- Idiomas: solo se declaran inglés y español; el soporte real del español no está evaluado y podría degradarse respecto al inglés, especialmente en matices y vocabulario técnico.
- Licencia Llama 3: el uso comercial está sujeto a la licencia comunitaria de Llama 3 (cláusula de 700 millones de usuarios activos mensuales, obligación de atribución "Built with Llama" y restricciones de nomenclatura). Además, el autor declara licencia Llama 3 para un merge cuya cadena de modelos de origen no está documentada, por lo que conviene verificar la procedencia y las licencias de los modelos fusionados antes de un uso comercial.
- Etiqueta `prototype`: no hay evaluación de calidad, el merge no está validado y el mantenimiento futuro no está garantizado.
- Cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; para producción conviene Q4_K_M o superior.
- Procedencia del modelo base (`NovaCorp`) poco documentada: sin model card detallada, sin paper y sin datos de entrenamiento publicados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Eternal.Bondange-3.2-1B-GGUF
- Modelo base: https://huggingface.co/NovaCorp/Eternal.Bondange-3.2-1B
- Cuantizaciones ponderadas/imatrix (i1): https://huggingface.co/mradermacher/Eternal.Bondange-3.2-1B-i1-GGUF
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Eternal.Bondange-3.2-1B-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/mradermacher/models
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que cede infraestructura al autor: https://www.nethype.de/
