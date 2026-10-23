# mradermacher/Neuron-4B-Instruct-i1-GGUF

## Resumen

Neuron-4B-Instruct-i1-GGUF es la versión cuantizada en formato GGUF del modelo Neura-Tech-AI/Neuron-4B-Instruct, publicada por mradermacher, un cuantizador conocido por distribuir versiones de pesos reducidos de modelos abiertos. El modelo base es un transformer de 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) orientado a conversación e instrucciones, con licencia Apache 2.0 declarada en el repositorio y cobertura de 25 idiomas que incluye inglés, hindi, chino, japonés, coreano, las principales lenguas europeas, árabe, turco, vietnamita, tailandés, indonesio, malayo y ocho idiomas del subcontinente indio (bengalí, tamil, télugu, maratí, guyaratí, panyabí, urdu) además del persa.

El repositorio no contiene pesos en precisión completa, sino 25 cuantizaciones generadas con matrices de importancia (imatrix), desde IQ1_S (1,2 GB) hasta Q6_K (3,4 GB), más el fichero imatrix empleado para generarlas. Esta gradación permite elegir el compromiso entre tamaño y fidelidad, algo relevante en un modelo de 4B que puede ejecutarse íntegramente en GPU de consumo o incluso en CPU.

Su interés actual es doble: por un lado, ofrece una vía de despliegue local de bajo coste para un modelo multilingüe con cobertura amplia de lenguas poco representadas; por otro, su utilidad real está condicionada por la ausencia total de datos publicados sobre longitud de contexto, composición del corpus de entrenamiento, alineamiento y resultados de evaluación, tanto en esta ficha como en la información disponible del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según la model card del cuantizador; las etiquetas del repositorio incluyen "qwen", lo que sugiere linaje Qwen, sin confirmación explícita) |
| Parámetros totales | 4.022.468.096 (~4,02 mil millones) |
| Parámetros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | en, hi, zh, ja, ko, fr, de, es, it, pt, ru, ar, tr, vi, th, id, ms, bn, ta, te, mr, gu, pa, ur, fa (25 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un transformer de 4,02 mil millones de parámetros con ajuste por instrucciones, derivado de Neura-Tech-AI/Neuron-4B-Instruct. No se especifican número de capas, dimensionalidad, cabezas de atención, tipo de atención (completa, GQA o lineal), función de activación ni si emplea embeddings atados. La etiqueta "qwen" en los tags del repositorio apunta a una posible inicialización o arquitectura inspirada en la familia Qwen, pero la model card no lo documenta y no debe asumirse compatibilidad de tokenizador o plantilla de chat sin verificarlo.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del corpus, fases de ajuste supervisado, RLHF o DPO, ni sobre técnicas de alineamiento o seguridad. La innovación técnica documentada se limita al proceso de cuantización: mradermacher genera cuantizaciones ponderadas con importance matrix (imatrix), una técnica que estima la sensibilidad de cada tensor a partir de activaciones de calibración y reduce la pérdida de perplejidad en niveles de bit bajo, especialmente en los formatos IQ1 e IQ2. El autor advierte explícitamente en su tabla que IQ1_S es "for the desperate" y que Q2_K_S es de "very low quality", lo que sitúa el umbral de calidad razonable en torno a IQ3_M/IQ4_XS.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de instrucciones (tags "instruct", "conversational").
- Generación de código y asistencia de programación, según la etiqueta "coding"; no hay evaluaciones publicadas que cuantifiquen este extremo.
- Capacidad multilingüe declarada para 25 idiomas, con especial énfasis en lenguas del sur de Asia (hindi, bengalí, tamil, télugu, maratí, guyaratí, panyabí, urdu) y en árabe y persa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; el repositorio no anuncia ninguna de estas capacidades.
- Compatibilidad declarada con endpoints de inferencia (tag "endpoints_compatible").
- Ejecución en llama.cpp y derivados gracias al formato GGUF, incluyendo despliegue sin GPU.

## Casos de uso

- Asistente conversacional local en portátil: con la cuantización i1-Q4_K_M (2,6 GB) el modelo cabe en equipos con 8 GB de RAM o en GPUs de gama media, lo que permite prototipar un chat con instrucciones sin depender de servicios externos ni enviar datos a terceros.
- Atención multilingüe en mercados del sur de Asia y Oriente Medio: la cobertura declarada de hindi, bengalí, tamil, urdu, árabe y persa lo hace candidato para clasificación de tickets, respuestas frecuentes y enrutamiento en centros de soporte con usuarios en esos idiomas, siempre que se valide la calidad real por lengua.
- Traducción y resumen de documentos en despliegues desconectados: con cuantizaciones IQ2/IQ3 (1,6-2,1 GB) puede ejecutarse en dispositivos sin conectividad, como equipos de campo o entornos con requisitos de soberanía de datos.
- Generación de borradores de código y autocompletado en IDE: la etiqueta "coding" y el tamaño reducido permiten integrarlo como asistente local de bajo consumo, por ejemplo mediante un servidor compatible con la API de OpenAI sobre llama.cpp, aceptando que no hay métricas HumanEval publicadas para calibrar expectativas.
- Base para fine-tuning de dominio con LoRA: al ser un modelo de 4B con licencia Apache 2.0 declarada, el modelo base en safetensors puede ajustarse en una única GPU de 24 GB con cuantización o con técnicas de bajo rango, y después reconvertirse a GGUF con las recetas del cuantizador.
- Evaluación de degradación por cuantización: el repositorio ofrece 25 niveles de compresión del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir cómo afecta cada formato IQ/K a la perplejidad y a la calidad conversacional en una tarea concreta antes de fijar el formato de producción.
- Procesamiento por lotes de bajo coste en CPU: tareas de etiquetado, extracción de entidades o normalización de texto sobre grandes volúmenes pueden ejecutarse en servidores sin GPU usando Q4_0 o Q4_K_S, con throughput limitado pero coste marginal muy bajo.
- Filtrado y preprocesado previo a un modelo mayor: usar la instancia de 4B como primera pasada para descartar consultas triviales o reformular prompts reduce el consumo de un modelo de mayor tamaño en una arquitectura de enrutado en cascada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la ficha del repositorio GGUF ni los metadatos asociados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones multilingües del modelo base Neura-Tech-AI/Neuron-4B-Instruct. El único material de referencia sobre rendimiento es la gráfica externa de perplejidad por tipo de cuantización enlazada por el autor, que compara formatos de cuantización entre sí y no mide capacidades del modelo.

## Requisitos de hardware

- Tamaño de los ficheros y VRAM estimada para offload completo en GPU con contexto corto (la caché KV no se puede calcular porque se desconoce la longitud de contexto):

| Cuantización | Fichero (GB) | VRAM estimada (GB) |
|---|---:|---:|
| i1-IQ1_S | 1,2 | ~1,5 |
| i1-IQ2_M | 1,6 | ~2,0 |
| i1-Q2_K | 1,8 | ~2,2 |
| i1-IQ3_M | 2,1 | ~2,5 |
| i1-IQ4_XS | 2,4 | ~2,8 |
| i1-Q4_K_M | 2,6 | ~3,1 |
| i1-Q5_K_M | 3,0 | ~3,5 |
| i1-Q6_K | 3,4 | ~4,0 |

- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o más (RTX 3060, RTX 4060, RTX 2060, GTX 1660 Super para cuantizaciones IQ3/IQ4) puede alojar el modelo completo; con 8 GB se dispone de margen holgado para caché KV y contexto.
- GPU de datacenter: A100, H100 o L40S no son necesarias para inferencia; solo tendrían sentido para fine-tuning del modelo base en precisión completa o para servir muchas réplicas concurrentes.
- Ejecución en CPU: viable con llama.cpp en cuantizaciones IQ2-Q4; un servidor con AVX2 y 8-16 GB de RAM puede servirlo, con latencia notablemente mayor que en GPU.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con la API de OpenAI construidos sobre llama.cpp. vLLM y TGI no son la vía natural para este repositorio: su soporte de GGUF es parcial y lo habitual es servir el modelo base en safetensors.
- Latencia y throughput: no disponible. Dependen del hardware, del nivel de cuantización y de la longitud de contexto, que no está documentada.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden del repositorio; los de las alternativas provienen de sus model cards públicas y deben verificarse antes de tomar decisiones. No se incluyen cifras de benchmarks porque ninguna está disponible en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Benchmarks |
|---|---:|---|---|---|---|
| Neuron-4B-Instruct (i1-GGUF) | 4,02 B | no disponible | apache-2.0 (declarada en el repo del cuantizador) | Sí, 25 cuantizaciones i1 | no disponible |
| Llama-3.2-3B-Instruct | 3,21 B | 128k | Llama 3.2 Community License | Sí, comunidad amplia | no incluidos aquí |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Qwen Research License | Sí, comunidad amplia | no incluidos aquí |
| Phi-3.5-mini-instruct | 3,8 B | 128k | MIT | Sí, comunidad amplia | no incluidos aquí |

La diferencia práctica más relevante frente a estas alternativas no es el rendimiento bruto, que no se puede comparar con los datos disponibles, sino la combinación de licencia permisiva declarada, cobertura declarada de 25 idiomas con peso en lenguas índicas y una batería de cuantizaciones ya publicada. Como contrapartida, las alternativas citadas cuentan con contextos documentados, evaluaciones publicadas y un ecosistema de herramientas y validación comunitaria mucho mayor; Neuron-4B-Instruct registra 0 descargas y 1 like en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada de calidad, razonamiento, código o multilingüismo, ni en esta ficha ni en la del modelo base. Cualquier decisión de producción debe apoyarse en una evaluación propia.
- Longitud de contexto desconocida: impide dimensionar la caché KV, planificar cargas de trabajo con documentos largos y comparar con alternativas de 32k o 128k.
- Degradación por cuantización: el propio autor desaconseja IQ1_S ("for the desperate") y califica Q2_K_S de calidad muy baja. Por debajo de IQ3_M la pérdida de calidad es probablemente apreciable, y no hay mediciones publicadas específicas para este modelo.
- Riesgo de alucinación: inherente a un modelo de 4B sin datos de alineamiento documentados; no se describe RLHF, DPO ni política de rechazo, por lo que el comportamiento ante prompts sensibles es impredecible.
- Idiomas declarados sin validación: la lista de 25 idiomas proviene de metadatos, no de evaluaciones por lengua. Es razonable esperar un rendimiento muy desigual entre inglés y lenguas como el panyabí, el guyaratí o el maratí.
- Licencia: el repositorio del cuantizador declara apache-2.0 y el modelo base figura como apache-2.0 en los metadatos, pero conviene verificar la model card original de Neura-Tech-AI/Neuron-4B-Instruct antes de un uso comercial, especialmente si la etiqueta "qwen" implica obligaciones heredadas de una licencia distinta.
- Falta de validación comunitaria: 0 descargas y 1 like; no hay informes de terceros sobre calidad, estabilidad ni comportamiento del tokenizador o de la plantilla de chat.
- Plantilla de chat no documentada en esta ficha: al ser un modelo de instrucciones, usar un formato de prompt incorrecto degrada la calidad de forma significativa. Hay que consultar el repositorio base para obtenerla.
- Tamaño del repositorio: 48 GB en total, correspondientes al conjunto de las 25 cuantizaciones; no debe descargarse el repo completo de forma automática si solo se necesita una variante.
- El modelo base podría estar desactualizado o descatalogado: la fecha de creación del repositorio (23 de octubre de 2026) es posterior a la del modelo original, y no se documenta la revisión exacta cuantizada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Neuron-4B-Instruct-i1-GGUF
- Modelo base: https://huggingface.co/Neura-Tech-AI/Neuron-4B-Instruct
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Neuron-4B-Instruct-GGUF
- Página de descarga y resumen del cuantizador: https://hf.tst.eu/model#Neuron-4B-Instruct-i1-GGUF
- Variante relacionada (46x4B): https://huggingface.co/mradermacher/Neuron-46x4B-Instruct-i1-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre formatos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable del hosting de cuantización: https://www.nethype.de/
