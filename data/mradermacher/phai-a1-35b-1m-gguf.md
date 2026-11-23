# mradermacher/Phai-A1-35B-1M-GGUF

## Resumen

Phai-A1-35B-1M es un modelo de lenguaje de aproximadamente 34.660 millones de parámetros desarrollado por PhaiModelLab, orientado a tareas de programación, uso como agente y contexto largo. La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher a partir de los pesos originales en formato transformers, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte para seis idiomas: chino, inglés, japonés, árabe, ruso y alemán. Sus etiquetas (coding, agent, long-context, rl) indican que ha sido entrenado o ajustado con refuerzo para tareas de razonamiento multi-paso y generación de código, y el sufijo "1M" del nombre sugiere una ventana de contexto de hasta un millón de tokens, aunque este dato no se confirma de forma explícita en la información disponible.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 35B en entornos locales: el repositorio incluye once variantes de cuantización que van desde 13,0 GB (Q2_K) hasta 37,0 GB (Q8_0), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria según el hardware disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según el formato de pesos y el pipeline de transformers) |
| Parámetros totales | 34.660.610.688 (≈34,66 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del modelo incluye "1M", sin confirmación explícita) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); existen cuantizaciones con imatrix en el repo i1-GGUF |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por el formato de pesos (transformers) y el pipeline declarado, se trata de un transformer decoder-only, pero no se especifican innovaciones como atención lineal, decodificación especulativa o arquitecturas híbridas. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO), más allá de la etiqueta "rl" que indica el uso de aprendizaje por refuerzo en alguna etapa del entrenamiento.

La información disponible sobre esta versión se limita al proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) a partir del modelo original, y ofrece además una variante con cuantización ponderada mediante imatrix en un repositorio separado. No se documentan detalles sobre el tokenizador, la configuración de atención ni el vocabulario.

## Capacidades

- Generación de texto conversacional en seis idiomas: chino, inglés, japonés, árabe, ruso y alemán.
- Generación de código, según la etiqueta "coding" del modelo.
- Uso como agente y razonamiento multi-paso, según la etiqueta "agent".
- Procesamiento de contexto largo, según la etiqueta "long-context" (la extensión exacta no está confirmada).
- Entrenamiento con refuerzo (etiqueta "rl"), orientado presumiblemente a mejorar el razonamiento y la fiabilidad en tareas complejas.
- Compatibilidad con endpoints, según la etiqueta "endpoints_compatible".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en editores o CLI mediante llama.cpp u Ollama para autocompletar, explicar y refactorizar código, aprovechando su especialización en "coding" y su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.
- Agentes autónomos de desarrollo: gracias a la etiqueta "agent", puede emplearse en bucles de razonamiento multi-paso para tareas como resolución de issues, generación de tests o navegación de repositorios, ejecutándose en estaciones de trabajo con GPU de consumo mediante las cuantizaciones Q4.
- Análisis de documentación extensa: la orientación a contexto largo permite procesar manuales técnicos, contratos o bases de código completas en una sola pasada, siempre que se verifique empíricamente la ventana real soportada.
- Atención al cliente multilingüe: con soporte para chino, inglés, japonés, árabe, ruso y alemán, puede desplegarse como backend conversacional para mercados internacionales, usando Q4_K_M (21,3 GB) en servidores con una sola GPU de 24 GB.
- Procesamiento de documentos en entornos con requisitos de soberanía de datos: al poder ejecutarse íntegramente en infraestructura propia con llama.cpp, es adecuado para sectores regulados que no pueden enviar datos a APIs externas.
- Investigación en alineación y RL: al estar etiquetado con "rl" y publicarse bajo Apache 2.0, sirve como base para experimentos de ajuste fino y evaluación de técnicas de refuerzo en modelos de 35B.
- Despliegue en hardware modesto: la variante Q2_K (13,0 GB) permite ejecutar el modelo en GPUs de 16 GB o en configuraciones CPU+GPU con RAM suficiente, útil para prototipado y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto KV):
  - Q2_K: ~13,0 GB de pesos; viable en GPU de 16 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: 15,3–18,2 GB; requiere 24 GB para contexto amplio.
  - IQ4_XS / Q4_K_S / Q4_K_M: 19,0–21,3 GB; encaja en RTX 3090/4090 (24 GB) con contexto moderado.
  - Q5_K_S / Q5_K_M: 24,1–24,8 GB; al límite de 24 GB, recomendable 32 GB o descarga parcial a CPU.
  - Q6_K: 28,6 GB; requiere GPU de 32 GB o superior (A100 40 GB, RTX A6000).
  - Q8_0: 37,0 GB; requiere A100 40 GB/80 GB o H100.
- GPU recomendadas: RTX 4090/3090 para Q4; A100 40 GB o H100 para Q6/Q8; configuraciones multi-GPU para contexto largo con cuantizaciones altas.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) con Q4_K_M y contexto moderado; en GPUs de 16 GB solo con Q2_K o descarga parcial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base sin cuantizar, vLLM o TGI con safetensors.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M (esta ficha) | 34,66 B | no disponible ("1M" en el nombre) | Apache 2.0 | GGUF, safetensors | Etiquetas coding/agent/long-context/rl; 6 idiomas |
| Modelos comparables de ~30–35B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas equivalentes en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas de código, razonamiento o multilingüismo no está verificado de forma independiente.
- La ventana de contexto real no está confirmada: el sufijo "1M" del nombre sugiere un millón de tokens, pero debe validarse empíricamente antes de confiar en él en producción.
- La cuantización degrada la calidad, especialmente en Q2_K y Q3; para uso serio se recomienda Q4_K_M o superior.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no disponibles; al no publicarse la composición del dataset, no es posible evaluar sesgos lingüísticos o culturales, especialmente en los idiomas menos representados (árabe, ruso, japonés).
- El contexto largo incrementa el consumo de memoria KV, lo que puede reducir la ventana efectiva en GPUs de 24 GB incluso con cuantizaciones Q4.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar la model card del modelo base por si hubiera condiciones adicionales no reflejadas en esta versión cuantizada.
- El repositorio pesa 237,1 GB; la descarga de todas las variantes no es práctica, debe seleccionarse una sola cuantización.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Phai-A1-35B-1M-GGUF
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Phai-A1-35B-1M-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Phai-A1-35B-1M-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
