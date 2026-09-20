# mradermacher/G4-WanaMeroQueen-v3-31B-heretic-GGUF

## Resumen

`mradermacher/G4-WanaMeroQueen-v3-31B-heretic-GGUF` es un conjunto de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo `vulture3/G4-WanaMeroQueen-v3-31B-heretic`. No se trata de un modelo entrenado desde cero, sino de una conversión estática a formato GGUF de un modelo previo publicado en safetensors, pensada para su ejecución local con llama.cpp y derivados. El modelo base cuenta con 30.697.345.596 parámetros (unos 30,7 mil millones), un tamaño que lo sitúa en la gama de 30B, apta para estaciones de trabajo con GPU de 24 GB o superiores si se emplean cuantizaciones de 4 bits.

La relevancia de este repositorio es práctica: ofrece hasta doce variantes de cuantización (desde Q2_K hasta F16) que permiten ajustar el equilibrio entre calidad y consumo de memoria en función del hardware disponible. El repositorio incluye F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S y Q2_K.

La información publicada es muy escasa: la model card se limita a indicar que son cuantizaciones estáticas del modelo de vulture3, sin especificar arquitectura, datos de entrenamiento, licencia ni idiomas. El repositorio registra 0 descargas y 0 likes, y su tamaño total (89,5 GB) es inferior a la suma estimada de todas las cuantizaciones anunciadas, por lo que es probable que la subida esté incompleta o que parte de los archivos no estuviera disponible en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 30.697.345.596 (≈30,7 mil millones) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo de origen está en safetensors) |
| Modelo base | vulture3/G4-WanaMeroQueen-v3-31B-heretic |
| Autor de la cuantización | mradermacher |
| Tamaño del repositorio | 89,5 GB |
| Etiquetas | gguf, endpoints_compatible, conversational, region:us |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-09-20 17:21 UTC / 2026-09-20 18:07 UTC |
| Metadatos de conversión | quantize_version: 2, convert_type: hf, output_tensor_quantised: 1 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base. La model card del repositorio de cuantización no menciona si se trata de un transformer decoder-only denso, un modelo MoE, un híbrido con capas de estado (SSM) o cualquier otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste por instrucciones, RLHF o DPO.

Los únicos datos técnicos verificables proceden de los metadatos de conversión: el proceso se realizó con `convert_type: hf` (partiendo de pesos en formato HuggingFace), `quantize_version: 2` y `output_tensor_quantised: 1`, parámetros propios del flujo de trabajo de llama.cpp para producir GGUF. El sufijo `heretic` del nombre sugiere que el modelo base podría derivar de una variante sometida a un proceso de abliteración o eliminación de rechazos del estilo del proyecto Heretic, pero esto no está confirmado en la documentación publicada. Del mismo modo, los componentes `G4` y `WanaMeroQueen` apuntan a un modelo fusionado (merge) de la comunidad, sin que exista confirmación oficial.

## Capacidades

La única capacidad confirmada por los metadatos del repositorio es la conversacional, recogida en la etiqueta `conversational`. No hay documentación que permita confirmar el resto de capacidades habituales en modelos de esta gama, por lo que se indican como no verificadas:

- Generación de texto y diálogo multi-turno: la etiqueta `conversational` sugiere uso en chat, aunque no se detallan sus parámetros de plantilla de prompt.
- Razonamiento, matemáticas y generación de código: no disponible (no documentado).
- Soporte de tool calling o function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades multimodales (visión, audio): no disponible; el repositorio no incluye archivos de proyección multimodal (`skip_mmproj` figura vacío) y no se anuncia ningún componente de este tipo.
- Modo de razonamiento explícito (thinking) o modos especiales de decodificación: no disponible (no documentado).

## Casos de uso

Los siguientes escenarios se apoyan únicamente en las características verificadas del repositorio (30,7B de parámetros, doce niveles de cuantización, formato GGUF y etiqueta conversacional). Deben validarse empíricamente antes de llevarlos a producción, ya que no existe documentación sobre capacidades concretas.

- Asistente conversacional local en estación de trabajo: con la variante Q4_K_M (unos 18,6 GB estimados) el modelo puede ejecutarse en una GPU de 24 GB sin depender de servicios en la nube, lo que resulta adecuado para entornos con conectividad limitada o requisitos de confidencialidad.
- Procesamiento de datos sensibles en local: al ser un modelo desplegable on-premise con llama.cpp, permite tratar conversaciones o documentos internos sin enviarlos a APIs externas; conviene verificar antes la licencia, actualmente no declarada.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce niveles distintos del mismo modelo, lo que permite medir de forma controlada la degradación de calidad entre Q2_K, Q3_K, Q4_K_M, Q6_K, Q8_0 y F16 sobre un mismo conjunto de pruebas propio.
- Prototipado rápido con herramientas de escritorio: las variantes Q3_K_S (≈13,4 GB) y Q2_K (≈10,1 GB) caben en GPU de gama media de 12-16 GB, lo que facilita experimentar con un modelo de 30B en hardware de consumo.
- Servicio interno de chat compatible con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede servirse mediante el endpoint compatible con OpenAI de llama.cpp u otros servidores GGUF, lo que simplifica integrarlo en aplicaciones internas que ya consumen APIs de chat.
- Generación de texto y redacción asistida: para tareas de resumen, reescritura o borradores, usando la cuantización más alta que permita el hardware disponible (Q6_K o Q8_0) cuando la calidad sea prioritaria frente al coste de memoria.
- Investigación sobre modelos fusionados y abliterados: al proceder presumiblemente de un merge con posibles modificaciones de alineamiento, puede servir como objeto de estudio para analizar el comportamiento de este tipo de variantes, siempre que se documente su procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos correspondían a páginas de Discord sin relación alguna). Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

Los tamaños de archivo que figuran a continuación son estimaciones calculadas a partir del número de parámetros (30,7 mil millones) y de los bits por peso habituales de cada tipo de cuantización en llama.cpp. No proceden de la información publicada del repositorio y deben verificarse contra los archivos reales.

| Cuantización | Tamano estimado de pesos | VRAM estimada en inferencia (con caché KV moderada) |
|---|---|---|
| F16 | ≈61,4 GB | ≈65-70 GB |
| Q8_0 | ≈32,6 GB | ≈36-40 GB |
| Q6_K | ≈25,2 GB | ≈28-32 GB |
| Q5_K_M | ≈21,8 GB | ≈25-29 GB |
| Q5_K_S | ≈21,2 GB | ≈24-28 GB |
| Q4_K_M | ≈18,6 GB | ≈21-25 GB |
| Q4_K_S | ≈17,6 GB | ≈20-24 GB |
| IQ4_XS | ≈16,3 GB | ≈19-23 GB |
| Q3_K_L | ≈16,4 GB | ≈19-23 GB |
| Q3_K_M | ≈15,0 GB | ≈18-21 GB |
| Q3_K_S | ≈13,4 GB | ≈16-19 GB |
| Q2_K | ≈10,1 GB | ≈13-16 GB |

- GPU recomendadas por escenario: Q2_K y Q3_K_S en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4080; Q4_K_M y IQ4_XS en RTX 3090 o RTX 4090 de 24 GB; Q6_K en RTX A6000 48 GB o L40S; Q8_0 en A100 40 GB o dos GPU de 24 GB; F16 en A100 80 GB, H100 80 GB o dos A6000.
- ¿Cabe en GPU de consumo? Sí, en las cuantizaciones de 2 a 5 bits, con las GPU de 12, 16 y 24 GB indicadas. Las variantes Q6_K, Q8_0 y F16 requieren hardware profesional o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (cliente `llama-cli`, servidor `llama-server` con API compatible con OpenAI), Ollama, LM Studio, KoboldCpp, text-generation-webui, Jan y `llama-cpp-python`. vLLM admite GGUF de forma experimental; TGI no soporta este formato.
- Latencia y throughput: no disponible. Dependerán del número de capas descargadas a CPU, del ancho de banda de memoria de la GPU y de la longitud de contexto, dato este último que tampoco se conoce.

## Comparativa con modelos similares

No existe información publicada sobre licencia, contexto o rendimiento en benchmarks de este modelo que permita una comparación rigurosa. La tabla siguiente ofrece únicamente el contexto estructural de tres alternativas de la misma franja de parámetros cuyas cuantizaciones GGUF son habituales, con los datos del modelo analizado marcados como no disponibles. Los datos de las alternativas proceden de conocimiento general sobre esas familias y deben verificarse en sus repositorios oficiales antes de publicarlos.

| Modelo | Parámetros | Contexto | Licencia | GGUF disponible | Benchmarks comparables |
|---|---|---|---|---|---|
| G4-WanaMeroQueen-v3-31B-heretic (este repositorio) | 30,7 mil millones | no disponible | no disponible | Sí (12 cuantizaciones) | no disponible |
| Qwen3-32B | 32,8 mil millones | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | Sí | no disponible en esta ficha |
| Gemma-3-27B | 27 mil millones | 128.000 tokens | Gemma Terms of Use | Sí | no disponible en esta ficha |
| Mistral-Small-3.2-24B | 24 mil millones | 128.000 tokens | Apache-2.0 | Sí | no disponible en esta ficha |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia alguna, por lo que no puede confirmarse que su uso comercial esté permitido. Es un riesgo legal relevante antes de integrarlo en un producto.
- Ausencia de model card propia: toda la documentación se reduce a la indicación de que son cuantizaciones estáticas del modelo de vulture3. No hay información sobre arquitectura, contexto, idiomas, plantilla de prompt ni política de uso.
- Sin validación de la comunidad: 0 descargas y 0 likes registrados en el momento de la consulta, y una ventana de publicación de menos de una hora entre la creación y la última actualización del repositorio.
- Posible subida incompleta: el repositorio ocupa 89,5 GB, mientras que la suma de las doce cuantizaciones anunciadas superaría con holgura ese tamaño según las estimaciones por bits por peso. Conviene comprobar qué archivos están realmente disponibles antes de descargar.
- Procedencia poco trazable: no se documenta el proceso de fusión ni el origen de los componentes que forman el nombre del modelo. Si el sufijo `heretic` implica un proceso de abliteración, el modelo podría presentar una reducción deliberada de sus mecanismos de rechazo, con el consiguiente riesgo de generar contenido inapropiado. Esto no está confirmado.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala cuando no se ancla la generación a fuentes verificables. No hay evaluaciones de fidelidad disponibles.
- Degradación por cuantización: las variantes Q2_K, Q3_K_S y Q3_K_M implican pérdidas de precisión notables en modelos de 30B, especialmente en tareas de razonamiento y código. Para uso productivo se recomienda Q4_K_M o superior.
- Idiomas y contexto desconocidos: no se declara ningún idioma soportado ni la longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo.
- Metadatos con fechas de 2026: los campos de creación y actualización del repositorio indican septiembre de 2026, un dato cuando menos llamativo que conviene contrastar con la fuente original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/G4-WanaMeroQueen-v3-31B-heretic-GGUF
- Modelo base: https://huggingface.co/vulture3/G4-WanaMeroQueen-v3-31B-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo oficiales: no disponible
- Resultados de la búsqueda web: no se encontró ningún enlace relevante; los resultados devueltos correspondían a páginas de Discord sin relación con el modelo.
