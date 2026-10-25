# Ozzycan/FitBot-3B

## Resumen

FitBot-3B es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct desarrollado por el usuario Ozzycan como proyecto de fin de curso del bootcamp de IA aplicada de Tech Istanbul. Se trata de un asistente conversacional en turco especializado en la atención a socios de un gimnasio ficticio («FormaFit Spor Kulübü»): responde sobre tipos de membresía, cuotas, horarios, congelación y cancelación de altas, reserva de clases colectivas, entrenador personal, piscina, taquillas, normas para invitados y aparcamiento. El modelo no se limita a generar texto: está entrenado para emitir JSON válido y encadenar llamadas a cuatro herramientas (`ders_bilgisi`, `hesapla`, `rehberde_ara` y `otopark_ucreti`) dentro de un bucle de agente, apoyándose en un pipeline RAG sobre un PDF de 15 secciones y un CSV con la programación de clases.

La relevancia del modelo no está en su rendimiento bruto, sino en su carácter de plantilla reproducible: demuestra cómo adaptar un modelo denso de 3.085.938.688 parámetros con QLoRA (r=16, todas las capas lineales, 3 épocas) sobre una GPU gratuita Colab T4 de 15 GB en cuantización 4-bit NF4, con un conjunto de solo 450 ejemplos sintéticos. La model card documenta con detalle la comparación antes/después del ajuste y los fallos observados, algo poco habitual y útil para quien quiera replicar el proceso.

Su alcance es deliberadamente estrecho: los datos son estáticos y el modelo está pensado para un dominio cerrado en turco. La licencia declarada es `other`, sin términos detallados en la model card, lo que obliga a contactar con el autor antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen2 (etiqueta `qwen2`); no se detallan número de capas ni dimensiones ocultas en la model card |
| Parámetros totales | 3.085.938.688 (3,09 B), dato real de los safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información del modelo; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens en su propia model card |
| Tipos de cuantización | GGUF `q8_0` (el usado en el despliegue web del proyecto); QLoRA 4-bit NF4 solo durante el entrenamiento. No se publica un catálogo completo de cuantizaciones (Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | Turco (`tr`); no se declaran otros idiomas en los metadatos |
| Licencia | `other` (términos no especificados en la model card) |
| Formato de pesos | `safetensors` (repositorio de 18,5 GB) y GGUF (`q8_0`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso, y se ajusta mediante QLoRA con rango r=16 aplicado a todas las capas lineales, cuantizando la base a 4-bit NF4. El entrenamiento se ejecutó durante 3 épocas en una GPU T4 de 15 GB del plan gratuito de Google Colab. La model card justifica la elección de la base frente a tres alternativas: Qwen2.5-1.5B-Instruct (peor construcción de frases en turco, más confusión entre reglas numéricas múltiples dentro del contexto RAG y menor tasa de JSON válido en el protocolo de agente de dos turnos), Gemma-2-2b-it (no acepta mensaje `system` en su plantilla de chat) y Llama-3.2 (peor rendimiento en turco).

El conjunto de entrenamiento es sintético y consta de 450 ejemplos repartidos en tres categorías: `kimlik` (identidad y estilo), `rag` (respuesta fundamentada en el contexto recuperado) y `ajan` (agente de dos turnos, con emisión de JSON y selección de herramienta). Cada ejemplo se verificó contra el contenido real de `rehber.pdf` (15 secciones sobre membresías, normas y servicios) y de `ders_programi.csv` (día, hora, duración, instructor y sala de cada clase colectiva). No se menciona RLHF ni DPO en la información disponible. La innovación técnica del proyecto no está en el modelo sino en el sistema que lo rodea: recuperación semántica con Chroma y el modelo de embeddings `paraphrase-multilingual-mpnet-base-v2` (para consultas con sinónimos, como «desfibrilador» frente a «AED»), una variante TF-IDF amigable para CPU en el sitio web, y un bucle de agente en `araclar.py` reforzado explícitamente para forzar llamadas consecutivas a herramientas cuando la pregunta requiere consultar la tabla y después calcular.

## Capacidades

- Generación de texto conversacional en turco con registro de atención al cliente y respuestas de varias frases.
- Respuesta fundamentada en contexto (RAG): reproduce cifras exactas del documento cuando el contexto las contiene (por ejemplo, 1.100 TL de cuota de estudiante) y rechaza responder cuando no aparecen («Rehberde bu konuda bilgi bulunmamaktadır»).
- Tool calling / function calling con cuatro herramientas definidas: `ders_bilgisi` (consulta de la programación de clases), `hesapla` (calculadora), `rehberde_ara` (búsqueda en el guion) y `otopark_ucreti` (tarifa de aparcamiento, de desarrollo propio).
- Emisión de JSON válido para el protocolo de agente: la model card reporta una tasa de 1,00 tras el ajuste, frente a 0,50 antes.
- Razonamiento multi-paso dentro del bucle de agente: consultar la duración de una clase y después multiplicarla (caso documentado: 2 × 45 = 90 minutos en una pregunta sobre spinning).
- Aritmética delegada a herramienta externa; no se documenta capacidad de cálculo fiable sin `hesapla`.
- Adherencia a identidad y estilo: nombre del asistente y sufijo de marca (U+1F4AA) con tasa 1,00 en la evaluación interna.
- No se declaran capacidades de visión, audio, modo de razonamiento explícito ni soporte multilingüe más allá del turco.

## Casos de uso

- Atención al cliente de un gimnasio o centro deportivo: el modelo responde FAQ multi-turno sobre cuotas, horarios, congelaciones y cancelaciones a partir de la documentación interna, con rechazo explícito cuando la respuesta no está en la fuente, lo que reduce el riesgo de inventar precios.
- Agente RAG sobre documentación corporativa en PDF: sustituyendo `rehber.pdf` por el manual de la organización y reindexando en Chroma, el mismo esquema sirve para cualquier base documental cerrada en turco.
- Consulta de programación de actividades desde un CSV: la herramienta `ders_bilgisi` devuelve día, hora, duración, instructor y sala, lo que permite construir un buscador de horarios conversacional sin base de datos adicional.
- Cálculo de tarifas y presupuestos: la herramienta `hesapla` y el ejemplo de `otopark_ucreti` muestran cómo derivar importes a código determinista en lugar de dejar que el modelo haga la aritmética.
- Chatbot desplegado en CPU con presupuesto mínimo: el GGUF `q8_0` corre sin GPU, lo que hace viable el despliegue en un servidor pequeño o en el propio sitio del cliente a cambio de latencias de 10-60 segundos por respuesta.
- Base de partida para ajustes verticales en turco: el script QLoRA (r=16 sobre todas las capas lineales, 3 épocas, 4-bit NF4) cabe en una T4 de 15 GB, por lo que sirve como plantilla para dominios como seguros, banca minorista o administración local.
- Prototipo docente de arquitectura agente + RAG: el repositorio documenta métricas antes/después y fallos concretos, lo que lo convierte en material útil para formar equipos en evaluación de asistentes.
- Filtro de primera línea en recepción: dado su alcance estático y la ausencia de operaciones reales, encaja como capa de resolución de dudas con derivación a humano para reservas, pagos y reclamaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, TruthfulQA) en la información disponible. La model card solo incluye una evaluación interna sobre el propio conjunto sintético:

| Métrica (evaluación interna) | Antes del ajuste | Después del ajuste |
|---|---|---|
| Dice su nombre (FitBot) | 0,00 | 1,00 |
| Usa el sufijo de marca (U+1F4AA) | 0,00 | 1,00 |
| Emite JSON válido | 0,50 | 1,00 |
| Selecciona la herramienta correcta | 0,50 | 1,00 |
| Puntuación del juez sobre respuestas RAG | 0,67 | 1,00 |

La model card incluye además una tabla cualitativa de tres escenarios comparados (sin contexto frente a RAG, y recuperación con Chroma + mpnet frente a TF-IDF) y una tabla de evaluación de 15 preguntas que aparece truncada en la información proporcionada, por lo que no se pueden extraer sus resultados. La evaluación se realizó sobre datos del mismo dominio que el entrenamiento, sin conjunto de test independiente declarado: los valores de 1,00 deben interpretarse como indicio de ajuste al formato esperado, no como una medida de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 6,2 GB con pesos en bf16/fp16, unos 3,3 GB en GGUF `q8_0` y alrededor de 1,9 GB en cuantización de 4 bits (estimaciones aritméticas a partir de los 3,09 B de parámetros; hay que sumar caché KV y overhead del runtime).
- GPU validadas en el proyecto: Tesla T4 de 15 GB, usada para el entrenamiento QLoRA con 4-bit NF4.
- GPU recomendadas para servicio en GPU: A100 40/80 GB o H100 para despliegues con mucho tráfico y contextos largos; L4, L40S o A10G como opción de coste medio; RTX 4090 para desarrollo y pruebas.
- GPU de consumo: cabe con holgura en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 en adelante; con cuantización de 4 bits es viable incluso en tarjetas de 6-8 GB.
- Despliegue: llama.cpp, Ollama o `llama-cpp-python` para el GGUF `q8_0` en CPU; vLLM o TGI para los safetensors en GPU; recuperación con Chroma (o TF-IDF en la variante sin GPU) y una capa FastAPI para el bucle de herramientas.
- Latencia y throughput: en CPU con `q8_0`, la model card reporta 10-60 segundos por respuesta. No se publican cifras de throughput ni de latencia en GPU.
- Nota sobre el repositorio: 18,5 GB es muy superior a los ~6,2 GB de pesos en bf16, lo que sugiere la presencia de artefactos adicionales (checkpoints intermedios, GGUF, tokenizer); su contenido no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| FitBot-3B | 3,09 B (denso) | No especificado (base: 32.768) | Turco | `other` | Asistente vertical de gimnasio con RAG y agente |
| Qwen2.5-3B-Instruct (base) | 3,09 B (denso) | 32.768 tokens | Multilingüe | Apache-2.0 | Instrucciones generales |
| Qwen2.5-1.5B-Instruct | 1,54 B (denso) | 32.768 tokens | Multilingüe | Apache-2.0 | Instrucciones generales, menor huella |
| Llama-3.2-3B-Instruct | 3,21 B (denso) | 128.000 tokens | Multilingüe (8 idiomas oficiales) | Licencia comunitaria de Llama 3.2 | Instrucciones generales |
| Gemma-2-2b-it | 2,61 B (denso) | 8.192 tokens | Multilingüe | Términos de uso de Gemma | Instrucciones generales |

Los datos de los modelos comparables proceden de sus model cards públicas y no se han verificado en esta ficha. La comparación relevante es de especialización, no de tamaño: FitBot-3B es el único de la tabla entrenado para un dominio cerrado con herramientas y rechazo explícito ante preguntas fuera de la fuente; su coste es la pérdida de capacidad general, el idioma único y una licencia no estándar. Frente al base Qwen2.5-3B-Instruct, el ajuste no mejora el conocimiento del mundo, solo la adherencia al formato, la identidad y el uso de herramientas.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos. El modelo está entrenado con datos de un gimnasio ficticio y un registro de atención al cliente concreto, por lo que puede reproducir ese tono comercial en contextos inadecuados.
- Alucinación fuera de contexto: la propia model card documenta que, sin RAG, el modelo inventa la cuota de estudiante y la temperatura de la sauna. La garantía de no invención depende por completo de que el pipeline de recuperación aporte el fragmento correcto.
- Fragilidad en cadenas de agente: en preguntas que exigen varias herramientas, el modelo pequeño tiende a omitir el segundo paso; el proyecto tuvo que reforzar el bucle en `araclar.py` para forzar llamadas consecutivas. No es una capacidad robusta del modelo por sí mismo.
- Dependencia del recuperador: en la variante web con TF-IDF, las consultas con sinónimos fallan (el caso de «desfibrilador» frente a «AED» está documentado), lo que degrada la respuesta aunque el modelo sea correcto.
- Cobertura limitada: solo entiende turco y solo responde sobre el contenido estático de `rehber.pdf` y `ders_programi.csv`. No hay consulta de disponibilidad real, ni reservas, ni pagos.
- Sobreajuste probable: 450 ejemplos sintéticos, 3 épocas y métricas de 1,00 sobre el mismo dominio sugieren memorización del formato (nombre, sufijo de marca, plantilla JSON) más que una mejora generalizable. No hay conjunto de evaluación independiente.
- Latencia en producción: 10-60 segundos por respuesta en CPU con `q8_0` es incompatible con chat interactivo sin avisos de espera o streaming.
- Licencia: la etiqueta es `other` y la model card no detalla condiciones. Al derivar de Qwen2.5-3B-Instruct (Apache-2.0) hay que respetar también los términos de la base, pero el uso comercial del ajuste requiere contactar con el autor.
- Madurez: 63 descargas, 0 likes y un pipeline no declarado en HuggingFace indican que es un artefacto de proyecto académico, sin mantenimiento ni garantías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ozzycan/FitBot-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo de embeddings citado en la model card: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Chroma (base vectorial usada en el pipeline RAG): https://www.trychroma.com/
- llama.cpp (runtime del GGUF `q8_0`): https://github.com/ggml-org/llama.cpp
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper, repositorio del proyecto, demo y dataset: no disponibles en la información proporcionada
