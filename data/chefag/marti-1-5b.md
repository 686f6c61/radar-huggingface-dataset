# chefag/Marti-1.5B

## Resumen

Marti-1.5B es un ajuste fino mediante QLoRA del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario chefag en HuggingFace. Se trata de un asistente conversacional en turco diseñado para un Ayuntamiento ficticio (Martıkent Belediyesi), que responde consultas ciudadanas sobre Beyaz Masa, abonos y cortes de agua, impuesto sobre bienes inmuebles, trámites de matrimonio civil, aparcamientos municipales, bibliotecas, instalaciones deportivas, apoyo social, animales de calle, licencias de actividad, alquiler de centros culturales, servicios de discapacidad y recogida de residuos.

El modelo no se presenta como un LLM de propósito general, sino como un componente de un sistema con dos patas: recuperación aumentada (RAG) sobre un documento normativo (`rehber.pdf`) y un conjunto de herramientas de agente (`tesisler.csv`, `hesapla`, `otopark_ucreti`) que resuelven de forma determinista horarios, tarifas y cálculos de aparcamiento. El ajuste QLoRA se emplea principalmente para inculcar identidad corporativa y un estilo de respuesta consistente, y para mejorar la emisión de JSON válido y la selección correcta de herramientas.

Con 1.543.714.304 parámetros, licencia Apache-2.0 y una versión GGUF publicada, el interés del modelo es fundamentalmente práctico y educativo: demuestra cómo un modelo de 1,5 B puede comportarse como asistente institucional cerrado cuando se le acompaña de RAG y herramientas, con un coste de entrenamiento de unos 1,5 minutos en GPU gratuita según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, ajustado con QLoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no indicada en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | safetensors en precision original (repo de 3,1 GB); GGUF q8_0 publicado en repo aparte; otras cuantizaciones no disponibles |
| Idiomas soportados | turco (tr), unico idioma declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal) y GGUF (chefag/Marti-1.5B-GGUF) |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 1,54 B de parámetros. El autor justifica la elección frente a Llama-3.2-1B y Gemma-2-2B por tres motivos declarados: mejor conocimiento del turco y seguimiento de instrucciones en esa escala, soporte nativo del rol `system` en la plantilla de chat (requisito para encadenar RAG y agente) y una relación coste/velocidad favorable, con inferencia GGUF q8_0 aproximadamente el doble de rápida que modelos de 3 B en un entorno de CPU de 2 núcleos.

El ajuste se realizó con QLoRA sobre 429 conversaciones sintéticas generadas con Gemini, cubriendo tres ejes: identidad corporativa, respuestas con contexto RAG y trazas de agente. Hiperparámetros declarados: r=16, alpha=32, adaptadores en todas las capas lineales, 3 épocas y tasa de aprendizaje 2e-4. La pérdida de test bajó de 0,622 a 0,282 de forma monótona. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; el pipeline es supervisado (SFT) sobre datos sintéticos.

La innovación técnica no está en la arquitectura, sino en el patrón de integración: el modelo no memoriza normativa ni tarifas, sino que aprende a invocar herramientas deterministas para los cálculos (la herramienta `otopark_ucreti` acertó el 100 % de los casos de prueba: 3 h → 120 TL, 8 h → 250 TL con tope diario, 0,5 h → gratuito) y a responder a partir de fragmentos recuperados para el resto de cuestiones.

## Capacidades

- Generación de texto conversacional en turco con registro institucional y marca de estilo consistente (el emoji de paloma aparece en las respuestas tras el ajuste).
- Identidad propia: nombre del asistente (0,00 → 0,90) y marca de estilo (0,00 → 1,00) en el conjunto de evaluación del autor.
- Respuesta fundamentada en contexto (RAG) sobre un documento normativo municipal, con rechazo explícito cuando la información no está en el contexto.
- Tool calling / function calling en JSON: generación de JSON válido del 0,79 al 0,93 y selección correcta de herramienta del 0,21 al 0,86.
- Razonamiento multi-paso limitado dentro de un bucle de agente (selección de herramienta, ejecución, incorporación del resultado a la respuesta).
- Consulta de datos tabulares (`tesisler.csv`) para horarios y tarifas de instalaciones.
- Cálculo determinista de tarifas de aparcamiento por delegación en herramienta externa.
- Conversación multi-turno dentro de la ventana del modelo base.
- No dispone de visión, audio, generación de código específica ni modo de razonamiento extendido (thinking); no se declaran.

## Casos de uso

- Atención al ciudadano de primer nivel en turco: el modelo gestiona consultas multi-turno sobre trámites municipales (agua, impuesto de bienes inmuebles, matrimonio civil, licencias) manteniendo un tono institucional homogéneo, con derivación a un humano cuando la respuesta no está en la base documental.
- Asistente RAG sobre normativa y ordenanzas: indexación del `rehber.pdf` en fragmentos y paso de los k mejores al prompt; el modelo cita cifras concretas (350 TL de alta de agua, 31 de mayo como primer plazo del impuesto) en lugar de inventarlas, que es el fallo observado sin contexto.
- Cálculo de tarifas de aparcamiento en producción: el modelo emite la llamada a `otopark_ucreti`, recibe el importe y lo redacta; al delegar el cálculo se evita el error aritmético típico de un modelo de 1,5 B.
- Consulta de horarios y precios de instalaciones deportivas y culturales: lectura de `tesisler.csv` vía herramienta, incluyendo reglas de negocio como el descuento del 50 % para mayores de 65 años.
- Despliegue en infraestructura mínima: con GGUF q8_0 corre en CPU de 2 núcleos (Hugging Face Spaces gratuito), lo que permite prototipos de administración pública sin GPU.
- Material didáctico para bootcamps: pipeline QLoRA reproducible en aproximadamente 1,5 minutos de GPU gratuita, con conjunto de evaluación propio y trazabilidad antes/después, útil para enseñar ajuste fino, RAG y agentes de principio a fin.
- Filtro de triaje en ventanilla única: clasificación de la consulta entrante y derivación al departamento correspondiente mediante la herramienta adecuada, dejando al modelo solo la tarea de enrutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona exclusivamente métricas internas sobre su propio conjunto de test, comparando el modelo base con el ajustado:

| Metrica (test propio) | Qwen2.5-1.5B-Instruct | Marti-1.5B |
|---|---|---|
| kimlik_ad (nombre de identidad) | 0,00 | 0,90 |
| kimlik_isaret (marca de estilo) | 0,00 | 1,00 |
| ajan_json (JSON válido) | 0,79 | 0,93 |
| ajan_arac (herramienta correcta) | 0,21 | 0,86 |
| rag_hakem (calidad RAG, juez Gemini) | 0,80 | 0,57 |
| rag_isaret (marca en respuesta RAG) | 0,00 | 1,00 |

Pérdida de test: 0,622 antes del ajuste, 0,282 después. En la batería de 15 preguntas puntuada por Gemini (escala 1 / 0,5 / 0) el modelo obtiene una media de 0,57, con aciertos claros en tarifas y plazos y fallos en preguntas cuya respuesta no estaba en el contexto recuperado. El conjunto de evaluación es pequeño y el juez es un LLM, no anotación humana.

## Requisitos de hardware

- VRAM estimada en BF16: unos 3,1 GB solo de pesos (tamaño del repo), en torno a 4-5 GB con caché KV y overhead de runtime para contextos moderados.
- VRAM estimada en GGUF q8_0: aproximadamente 1,6 GB de pesos; en q4 rondaría 1 GB, aunque no se publica esa cuantización.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más sirve en BF16 (RTX 3060, 4060, 4070, 4090); A100/H100 solo tienen sentido para servir muchas réplicas en paralelo.
- Cabe holgadamente en GPU consumer e incluso en CPU: el autor reporta funcionamiento en un entorno de 2 núcleos con GGUF q8_0, con el doble de velocidad que modelos de 3 B en las mismas condiciones.
- Opciones de despliegue: Transformers (safetensors), llama.cpp y Ollama (GGUF), vLLM o TGI para servir con batching. El adaptador LoRA está publicado por separado y puede cargarse sobre el modelo base.
- Latencia y throughput: no se han publicado cifras medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Marti-1.5B | 1,54 B | no indicado en la model card (base: 32.768) | Apache-2.0 | Asistente municipal en turco con RAG y agente | safetensors y GGUF en HF |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache-2.0 | LLM generalista, soporta rol `system` | safetensors y GGUF en HF |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | LLM generalista multilingue | safetensors y GGUF en HF |
| Gemma-2-2B-it | 2,6 B | 8.192 | Gemma Terms of Use | LLM generalista; según el autor no admite `system` en la plantilla de chat | safetensors y GGUF en HF |

Las cifras de parámetros y contexto de las alternativas provienen de su documentación oficial y no han sido verificadas en esta ficha. El modelo de referencia usado por el autor para las métricas internas es Qwen2.5-1.5B-Instruct, que supera a Marti-1.5B en `rag_hakem` (0,80 frente a 0,57) y pierde en identidad, formato JSON y selección de herramienta. La comparación con MARTI (framework de RL multi-agente de TsinghuaC3I) no procede: es un proyecto homónimo sin relación con este modelo.

## Limitaciones y advertencias

- Alucinación sin RAG: fuera de contexto, el modelo inventó plazos y tarifas («15 años» para el impuesto, «15 TL» de aparcamiento). Solo es fiable con recuperación activa y herramientas conectadas.
- Regresión en calidad RAG: la métrica `rag_hakem` cae de 0,80 a 0,57 tras el ajuste; el entrenamiento con 429 ejemplos mejora el formato y la identidad a costa de la calidad de respuesta sobre el contexto.
- Dependencia de la recuperación: con k=2 fragmentos, consultas con vocabulario indirecto (por ejemplo, cómo deshacerse de un sofá viejo) no recuperan la sección correcta y el modelo responde «no está en la guía». Es una limitación del retrieval, no del modelo, pero afecta al resultado final.
- Problema conocido con caracteres turcos: el modelo generaba nombres de tabla en ASCII (`Camlik` en lugar de `Çamlık`); el autor lo parcheó con normalización en el código de la herramienta, no en el modelo. Cualquier integración nueva debe replicar esa normalización.
- Ámbito muy estrecho: entidad municipal ficticia, normativa ficticia y 429 conversaciones sintéticas. Fuera del dominio (y fuera del turco) el comportamiento esperado es el del modelo base, no el del asistente.
- Un solo idioma declarado (turco). No hay evaluación en otras lenguas; el modelo base es multilingüe, pero el ajuste puede haber degradado esa capacidad.
- Evaluación débil: 15 preguntas puntuadas por un LLM como juez, sin anotación humana ni conjuntos públicos; las métricas del autor no son reproducibles con la información publicada.
- Licencia Apache-2.0, que permite uso comercial y obras derivadas; deben respetarse igualmente las condiciones del modelo base (Qwen2.5-1.5B-Instruct es también Apache-2.0).
- Madurez nula como artefacto público: 0 descargas y 0 «likes» en el momento de la consulta, sin pipeline declarado en HuggingFace y sin demo verificable; el sitio del proyecto se anuncia como «pendiente de publicación».
- Para producción conviene tratarlo como un componente más: validación de la salida JSON, timeout en las herramientas, verificación del importe calculado y fallback humano cuando la confianza del retrieval es baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chefag/Marti-1.5B
- Adaptador LoRA: https://huggingface.co/chefag/Marti-1.5B-LoRA
- Versión GGUF: https://huggingface.co/chefag/Marti-1.5B-GGUF
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/chefag/marti-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Resultados de búsqueda web sobre «MARTI» (framework de RL multi-agente de TsinghuaC3I, sin relación con este modelo; se listan solo para descartar la homonimia): https://openreview.net/forum?id=E7jZqo0A50 · https://github.com/TsinghuaC3I/MARTI · https://hysenlabs.com/en/projects/tsinghuac3i-marti
