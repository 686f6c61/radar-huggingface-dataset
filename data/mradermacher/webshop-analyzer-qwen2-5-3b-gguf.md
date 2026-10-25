# mradermacher/webshop-analyzer-qwen2.5-3b-GGUF

## Resumen

webshop-analyzer-qwen2.5-3b-GGUF es la versión cuantizada en formato GGUF del modelo neuqrui/webshop-analyzer-qwen2.5-3b, un ajuste fino por SFT (supervised fine-tuning) sobre Qwen2.5-3B. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones estáticas en GGUF para llama.cpp, mientras que el modelo original lo desarrolla el usuario neuqrui. El modelo está etiquetado como «webshop», «agent» y «analyzer», lo que sitúa su propósito en el dominio de agentes que operan entornos de compra electrónica tipo WebShop: analizar el estado de la tienda, interpretar observaciones y producir decisiones o razonamientos intermedios.

Se trata de un modelo pequeño: 3.397.103.616 parámetros totales según los safetensors del repositorio base, es decir, unos 3,4 mil millones. Con esa talla y licencia Apache-2.0, el interés práctico está en desplegarlo en hardware modesto, incluso en CPU o en GPU de consumo, para tareas de agente especializado donde no se necesita un modelo grande sino uno barato de ejecutar y con latencia baja.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la cadena de valor del ecosistema abierto: un modelo de nicho entrenado por un tercero y cuantizado por otro, con documentación mínima. Por otro, advierte de sus señales de madurez: cero descargas, cero «likes», sin pipeline declarado y con una model card que no aporta detalles de entrenamiento, contexto ni evaluación. Es, por tanto, un artefacto a evaluar empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B; no detallada en la model card) |
| Parametros totales | 3.397.103.616 (aproximadamente 3,4 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (cuantizaciones estaticas; no hay quants con imatrix/weighted) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio base en safetensors, cuantizado a GGUF) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura más allá de la etiqueta «qwen2.5» y del campo `base_model: neuqrui/webshop-analyzer-qwen2.5-3b`. Por herencia del modelo base, se trata de un transformer decoder-only de la familia Qwen2.5, con 3.397.103.616 parámetros. No se especifican número de capas, dimensión oculta, cabezas de atención, tipo de atención (GQA/MQA), tokenizador ni longitud de contexto en la documentación disponible.

En cuanto al entrenamiento, la única información explícita es la etiqueta `sft` y el nombre del modelo, que apunta a un ajuste supervisado orientado al entorno WebShop (tareas de compra en línea con observaciones textuales y acciones discretas). No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni hiperparámetros. Tampoco se documenta ninguna innovación técnica adicional: las únicas notas técnicas del repositorio son del cuantizador (mradermacher) y se refieren al proceso de conversión (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`).

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational` en los tags).
- Razonamiento orientado a agentes: análisis de estado y producción de decisiones en entornos de tipo WebShop, según el propósito declarado en el nombre y las etiquetas `agent` y `analyzer`.
- Ajuste específico de dominio para tareas de compra electrónica simulada (búsqueda de productos, seguimiento de instrucciones de compra, interpretación de observaciones).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: plausible por el etiquetado `agent`, pero no documentado formalmente en la model card.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su publicación como servicio.

## Casos de uso

- Agente de compra en entorno simulado WebShop: el modelo puede actuar como política de decisión que, dada una instrucción de compra y el estado textual de la tienda, selecciona la siguiente acción (buscar, clicar, comprar). Es su caso de uso nativo y el más probable que funcione sin ajuste adicional.
- Analizador de trayectorias de agente: usar el modelo como evaluador o crítico que revisa los pasos registrados por otro agente y señala dónde se desvió de la instrucción original. El etiquetado `analyzer` sugiere este tipo de entrenamiento.
- Prototipado rápido en local: con una cuantización Q4_K_M (2,2 GB) se puede levantar un servidor de inferencia en un portátil sin GPU dedicada para iterar sobre prompts y esquemas de acción antes de invertir en un modelo mayor.
- Generación de datos sintéticos para fine-tuning: al ser Apache-2.0 y ejecutable en local, sirve para producir trayectorias etiquetadas a bajo coste que luego se filtran y se usan para entrenar modelos más grandes o más específicos.
- Componente de un sistema multi-agente: delegar en este modelo la subtarea de interpretar el estado de un catálogo mientras un modelo mayor se encarga de la planificación global, reduciendo el coste por paso y la latencia.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes (de Q2_K a f16), lo que permite medir la degradación de la calidad en tareas agénticas según el nivel de cuantización antes de fijar una configuración de despliegue.
- Docencia y experimentación académica: por tamaño y licencia, es un buen sujeto para estudiar cómo un SFT de dominio estrecho sobre un modelo generalista de 3B altera el comportamiento en tareas de decisión secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni evaluación alguna sobre WebShop (tasa de éxito, recompensa media, longitud de episodio), y tampoco se han encontrado datos en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del tamaño de cada fichero, más overhead de caché KV y contexto):
  - Q2_K (1,5 GB): aproximadamente 2-3 GB de VRAM total.
  - Q4_K_M (2,2 GB): aproximadamente 3-4 GB de VRAM total.
  - Q6_K (2,9 GB): aproximadamente 4-5 GB de VRAM total.
  - Q8_0 (3,7 GB): aproximadamente 5-6 GB de VRAM total.
  - f16 (6,9 GB): aproximadamente 8-9 GB de VRAM total.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 2060) para cuantizaciones Q4 a Q8; RTX 4090, A100 o H100 quedan sobredimensionadas para este tamaño y solo se justifican por agregación de peticiones concurrentes.
- Cabe en GPU consumer: sí, con holgura. Las cuantizaciones Q4_K_S y Q4_K_M están marcadas por el autor como «fast, recommended».
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI dado el tag `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa para este caso; requerirían el repositorio base en safetensors.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas; en un modelo de 3,4 B en Q4_K_M sobre una GPU consumer es razonable esperar decenas de tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de información pública de referencia y no han sido verificados en la búsqueda realizada para esta ficha; se incluyen solo como marco de comparación.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop-analyzer-qwen2.5-3b (este) | 3,4 B | No disponible | SFT de dominio para agente WebShop, solo inglés | Apache-2.0 | GGUF en HF; safetensors en el repo base |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Generalista con instrucciones y tool calling | Apache-2.0 | Ampliamente disponible, múltiples formatos |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Generalista multilingüe | Licencia comunitaria Llama 3.2 | Ampliamente disponible |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | Generalista con foco en razonamiento y código | MIT | Ampliamente disponible |

Frente a estas alternativas, el modelo aquí descrito pierde en contexto declarado, multilingüismo y documentación, y solo puede compensar si su especialización en WebShop aporta una ventaja medible en tasa de éxito de la tarea, algo que no está documentado.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks propios ni comparación con el modelo base, por lo que no se puede cuantificar qué aporta el SFT.
- Sesgos conocidos: no disponibles. No se documenta la composición del dataset de ajuste, de modo que no se puede evaluar el sesgo de dominio (catálogo, moneda, tipo de productos, jerga de tienda) ni sesgos sociales.
- Riesgo de alucinación: alto en tareas fuera del dominio WebShop, dado que es un SFT estrecho sobre un modelo de 3B. Es esperable que degrade capacidades generalistas del Qwen2.5-3B original.
- Limitación de idioma: solo inglés declarado. El uso en castellano no está soportado ni evaluado.
- Longitud de contexto desconocida: la model card no la especifica, lo que impide planificar el tamaño de la caché KV y el coste de memoria en producción.
- Madurez del artefacto: cero descargas y cero «likes» en el momento de la consulta, sin pipeline declarado y con fecha de creación y actualización separadas por unos veinte minutos, lo que sugiere una publicación automatizada sin validación posterior.
- Cuantizaciones no ponderadas: el autor indica que no hay quants con imatrix/weighted, que suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes. Las variantes Q2_K y Q3_K_S son agresivas y degradan calidad de forma notable en modelos pequeños.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar la procedencia de los datos de SFT del repositorio base, no documentada, por posibles obligaciones derivadas de los términos de uso de Qwen.
- Advertencia sobre la búsqueda web: los resultados obtenidos no contienen información técnica ni enlaces relevantes sobre este modelo (contenido no relacionado), por lo que no se han podido contrastar datos externos.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/webshop-analyzer-qwen2.5-3b-GGUF
- Modelo base en HuggingFace: https://huggingface.co/neuqrui/webshop-analyzer-qwen2.5-3b
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#webshop-analyzer-qwen2.5-3b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que soporta la infraestructura del cuantizador: https://www.nethype.de/
