# marafx2007/AI21-Jamba2-3B-GGUF

## Resumen

AI21-Jamba2-3B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo ai21labs/AI21-Jamba2-3B, publicado en Hugging Face por el usuario marafx2007. El modelo base, desarrollado por AI21 Labs, tiene 3.197.109.632 parámetros (unos 3,2 mil millones) y se distribuye bajo licencia Apache-2.0, lo que habilita el uso comercial sin restricciones adicionales de licencia. El repositorio no contiene pesos originales en safetensors: únicamente ficheros GGUF listos para ejecutarse con llama.cpp y sus derivados.

El interés práctico de esta publicación es que comprime un modelo de 3,2 B en ficheros de entre 1,3 GB (Q2_K) y 6,5 GB (f16), lo que permite ejecutarlo en hardware de consumo, desde portátiles sin GPU dedicada hasta tarjetas de gama media, algo inviable con las variantes mayores de la familia Jamba. La model card del repositorio está copiada de la publicada por mradermacher y se limita a documentar el proceso de cuantización; no incluye información sobre la arquitectura del modelo base, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks.

Conviene señalar que el repositorio acumula 0 descargas y 0 «likes», y que sus enlaces de descarga apuntan a ficheros alojados en la cuenta de mradermacher, por lo que se comporta como un espejo sin validación independiente. Antes de usarlo en producción conviene verificar la procedencia de los pesos y contrastar los checksums con los del repositorio original del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el modelo base pertenece a la familia Jamba de AI21 Labs; la arquitectura concreta de esta variante de 3 B no se documenta en el repositorio) |
| Parametros totales | 3.197.109.632 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles, unico idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | ai21labs/AI21-Jamba2-3B |
| Cuantizador declarado en la model card | mradermacher (el repositorio figura a nombre de marafx2007) |
| Tamano del repositorio | 28,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo. El repositorio es una redistribución de cuantizaciones: la model card indica que se trata de «static quants of https://huggingface.co/ai21labs/AI21-Jamba2-3B» y no reproduce la ficha del modelo base de AI21 Labs. Por tanto, no se dispone de datos verificables sobre tipo de red (transformer, híbrida Transformer-Mamba, SSM o MoE), número de capas, dimensión oculta, mecanismo de atención ni configuración de expertos. Cualquier afirmación sobre la arquitectura de esta variante concreta debe considerarse no confirmada hasta consultar la ficha oficial de ai21labs/AI21-Jamba2-3B.

Tampoco hay información sobre el entrenamiento: no se documentan el número de tokens, la composición del dataset, ni si hubo fases de ajuste por instrucciones (SFT), RLHF o DPO. La única innovación técnica descrita en el repositorio es el propio proceso de cuantización, con dos familias de ficheros, cuantizaciones estáticas (este repositorio) y cuantizaciones ponderadas/imatrix alojadas por separado en mradermacher/AI21-Jamba2-3B-i1-GGUF.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo base está preparado para diálogo multi-turno.
- Generación de texto general en inglés, según el único idioma declarado (`en`).
- Capacidades específicas de razonamiento, código o matemáticas: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no. Solo se declara inglés.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés: el modelo, cuantizado a Q4_K_M (2,0 GB), puede ejecutarse con Ollama o llama.cpp en un portátil sin GPU dedicada y mantener conversaciones multi-turno sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generación de código en el IDE: un modelo de 3,2 B en Q5_K_M se integra en asistentes locales tipo Continue o extensiones basadas en llama-cpp-python para autocompletado y explicación de fragmentos, con latencia baja al caber íntegramente en VRAM de gama media. Requiere validar previamente la calidad real del modelo base en tareas de código, no documentada aquí.
- Clasificación y etiquetado de texto por lotes: al ser un modelo pequeño, permite procesar volúmenes altos de documentos en una sola GPU consumer, generando etiquetas o extracción de campos con prompts fijos; es adecuado cuando el coste por token y el throughput importan más que la precisión máxima.
- Resumen y reescritura de documentación técnica en inglés: el modelo puede condensar informes o normalizar estilo en pipelines de preprocesado; la ventaja es que todo el proceso cabe en 2-3 GB de VRAM y puede ejecutarse en paralelo con otras tareas.
- Generación de datos sintéticos para ajuste fino: se puede usar para producir ejemplos de entrenamiento o datos de aumento en inglés que después filtren modelos mayores, aprovechando que el coste de inferencia de un 3,2 B es una fracción del de un modelo de 70 B.
- Evaluación y prototipado de la familia Jamba: sirve como banco de pruebas barato para validar plantillas de prompt, integraciones con llama.cpp o pipelines de RAG antes de migrar a las variantes grandes de Jamba, que requieren hardware muy superior.
- Despliegue en edge y on-premise: con la cuantización Q2_K (1,3 GB) o IQ4_XS (1,9 GB) el modelo entra en dispositivos con 4 GB de memoria, lo que permite incrustarlo en appliances industriales o sistemas air-gapped donde no se puede llamar a una API externa.
- Chatbot de producto con contexto limitado: siempre que se verifique la ventana de contexto real del modelo base, puede gestionar conversaciones de atención al cliente en inglés con historial moderado, dado su tamaño reducido y su licencia Apache-2.0, que no impone restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio únicamente incluye una gráfica externa de perplejidad comparando tipos de cuantización de baja calidad (enlazada en la model card, alojada en nethype.de) y una nota de Artefact2 sobre criterios de selección de cuantizaciones. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación del modelo base o de las cuantizaciones publicadas.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas de los tamaños de fichero publicados en la model card, más un margen de 0,5 a 1 GB para contexto y caché. No se dispone de medidas reales de latencia ni de throughput.

| Cuantizacion | Tamano en disco | VRAM estimada | Notas |
|---|---|---|---|
| Q2_K | 1,3 GB | ~2 GB | Calidad degradada; solo para entornos muy limitados |
| Q3_K_S | 1,6 GB | ~2,2 GB | — |
| Q3_K_M | 1,6 GB | ~2,2 GB | La propia model card lo marca como «lower quality» |
| Q3_K_L | 1,7 GB | ~2,4 GB | — |
| IQ4_XS | 1,9 GB | ~2,5 GB | Alternativa i-quant de tamano reducido |
| Q4_K_S | 2,0 GB | ~2,7 GB | Marcada como «fast, recommended» |
| Q4_K_M | 2,0 GB | ~2,7 GB | Marcada como «fast, recommended»; opcion equilibrada |
| Q5_K_S | 2,3 GB | ~3,0 GB | — |
| Q5_K_M | 2,4 GB | ~3,1 GB | — |
| Q6_K | 2,7 GB | ~3,4 GB | Marcada como «very good quality» |
| Q8_0 | 3,5 GB | ~4,2 GB | «fast, best quality» |
| f16 | 6,5 GB | ~7,2 GB | 16 bits por peso, sin perdida por cuantizacion |

- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050 6 GB, RTX 4060, RTX 3060 12 GB) ejecuta las cuantizaciones Q4 a Q6 con holgura; una RTX 4090 o superior queda sobredimensionada para este modelo.
- Apple Silicon: viable en equipos con memoria unificada de 8 GB o más mediante Metal, dado que los ficheros Q4 rondan los 2 GB.
- CPU exclusivamente: viable con Q4_K_M en procesadores x86 con AVX2 o ARM recientes; la decodificación será más lenta que en GPU, sin datos concretos disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, koboldcpp y text-generation-webui. Para vLLM o TGI no se confirma soporte de GGUF ni de la arquitectura del modelo base en la información disponible.
- Algunas cuantizaciones pueden distribuirse en varios ficheros; la model card remite a las instrucciones de TheBloke sobre cómo concatenar ficheros multi-parte.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos alternativos provienen de sus fichas oficiales y deben verificarse antes de tomar decisiones. Para el modelo de esta ficha no se dispone de esos datos, y no se incluyen comparativas de rendimiento porque no hay benchmarks publicados en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AI21-Jamba2-3B (esta ficha, GGUF) | 3,2 B | no disponible | Apache-2.0 | GGUF en repositorio de terceros; 0 descargas |
| Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | safetensors y multiples GGUF, ampliamente validado |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens nativos | Apache-2.0 | safetensors y GGUF, con amplio soporte de tooling |
| Phi-3.5-mini-instruct | 3,8 B | 128 000 tokens | MIT | safetensors y GGUF, con benchmarks publicados |

## Limitaciones y advertencias

- Procedencia dudosa: el repositorio figura a nombre de marafx2007, pero la model card declara `quantized_by: mradermacher` y todos los enlaces de descarga apuntan a huggingface.co/mradermacher/AI21-Jamba2-3B-GGUF. Se trata de un espejo, no del repositorio original del cuantizador. Verifique checksums antes de usarlo en producción.
- Sin validación de la comunidad: 0 descargas y 0 «likes», lo que implica ausencia de pruebas independientes sobre la integridad o el funcionamiento de los ficheros.
- Metadatos incoherentes: la fecha de creación indicada (2026-09-13) es posterior a la del modelo base y no resulta verosímil, lo que sugiere un error de registro o una resubida.
- Idioma: solo se declara inglés. No hay datos sobre el comportamiento en castellano, y un modelo de 3,2 B sin entrenamiento multilingüe declarado producirá resultados degradados en otros idiomas.
- Arquitectura y contexto desconocidos: al no documentarse la arquitectura ni la ventana de contexto, no se debe asumir soporte de contexto largo ni de técnicas de atención eficiente. Verifique la compatibilidad con su runtime antes de diseñar un pipeline que dependa de contextos extensos.
- Compatibilidad de runtime: al ser un GGUF de un modelo de la familia Jamba, requiere una versión de llama.cpp u otro motor que soporte explícitamente esa arquitectura; de lo contrario la carga fallará.
- Cuantizaciones agresivas: Q2_K, Q3_K_S y Q3_K_M degradan la perplejidad de forma notable (la propia model card califica Q3_K_M como de menor calidad). Para uso en producción se recomienda Q4_K_M o superior.
- Alucinación: al tratarse de un modelo de 3,2 B, la tasa de errores factuales y de invenciones es intrínsecamente alta; no debe usarse como fuente de verdad sin verificación externa.
- Sesgos: no hay documentación sobre sesgos. Es previsible un sesgo hacia el inglés y hacia la distribución de datos del modelo base, que no se detalla.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero esa licencia aplica al modelo base y a los pesos derivados; conviene conservar los avisos de atribución correspondientes a AI21 Labs y al cuantizador.
- Sin soporte confirmado de tool calling ni de agentes: no diseñe flujos que dependan de function calling sin comprobarlo experimentalmente.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/marafx2007/AI21-Jamba2-3B-GGUF
- Modelo base: https://huggingface.co/ai21labs/AI21-Jamba2-3B
- Cuantizaciones citadas en la model card (cuenta del cuantizador declarado): https://huggingface.co/mradermacher/AI21-Jamba2-3B-GGUF
- Cuantizaciones ponderadas / imatrix: https://huggingface.co/mradermacher/AI21-Jamba2-3B-i1-GGUF
- Página resumen de descargas del cuantizador: https://hf.tst.eu/model#AI21-Jamba2-3B-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre selección de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de README con instrucciones de uso de GGUF y concatenación de ficheros multi-parte: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Proveedor de infraestructura del cuantizador: https://www.nethype.de/

Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre el modelo; los dominios devueltos no guardan relación con inteligencia artificial ni con el modelo descrito.
