# Ozzycan/Begonvil-Ajan-1.5B

## Resumen

Begonvil-Ajan-1.5B es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario Ozzycan (HuggingFace) como proyecto de fin de bootcamp. Se trata de un agente de recepción de hotel para el establecimiento ficticio "Begonvil Otel", entrenado para emitir respuestas en formato JSON estricto que bien invocan una herramienta (`{"dusunce", "arac", "argumanlar"}`) o bien cierran el turno con una respuesta final (`{"dusunce", "cevap"}`). El modelo trabaja exclusivamente en turco y está orientado a un bucle de agente con seis herramientas de dominio: información de habitaciones, listado, recomendación, cálculo de estancia total, tarifa de mascotas y una calculadora genérica.

Arquitectónicamente no introduce novedades: es un transformer decoder-only denso de 1.543.714.304 parámetros (1,54 B) heredado de la familia Qwen2, afinado con QLoRA (r=16) durante 2 épocas sobre un conjunto de 655 ejemplos generados a partir de datos reales de un `odamas.csv` y de búsquedas semánticas sobre una guía del hotel. La pérdida se calcula únicamente sobre la salida del asistente.

Su relevancia es acotada pero ilustrativa: demuestra que un modelo de 1,5 B puede sostener un bucle de tool calling con validación de JSON, verificación de cifras contra las fuentes y plan de respaldo basado en reglas, superando en la evaluación del propio autor al modelo base (0,68 frente a 0,39 de puntuación media con el mismo bucle). No obstante, el conjunto de test es de 19 preguntas, el repositorio no tiene descargas ni valoraciones y no se han publicado benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantización | No se publican cuantizaciones oficiales; el repo contiene pesos en safetensors (fp16/bf16) convertibles a GGUF, AWQ o GPTQ |
| Idiomas soportados | Turco (`tr`) únicamente, según la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar, RoPE y tokenizador BPE multilingüe. Sobre esa base se aplicó QLoRA con rango r=16 durante 2 épocas, calculando la pérdida solo sobre los tokens de la salida del asistente, de modo que el modelo aprende el formato de decisión del agente (pensamiento, selección de herramienta y argumentos) sin reajustar la distribución del texto de entrada.

El conjunto de entrenamiento consta de 655 ejemplos construidos a partir de datos reales: las salidas de las herramientas se generaron desde un fichero `odamas.csv` y los contextos de recuperación provienen de búsquedas reales sobre la guía del hotel. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación adicional. La innovación no está en el modelo sino en el andamiaje que lo rodea: bucle de agente con extracción de JSON, validación de herramientas, verificación de los números de la respuesta contra las fuentes recuperadas y un plan de respaldo basado en reglas que se activa si el modelo falla. Las preguntas de test se excluyeron explícitamente del conjunto de entrenamiento.

## Capacidades

- Generación de texto conversacional en turco dentro del dominio de recepción hotelera.
- Tool calling en formato JSON con tres claves fijas (`dusunce`, `arac`, `argumanlar`), una única llamada por paso.
- Herramientas disponibles: `oda_bilgisi`, `oda_listesi`, `oda_oner`, `toplam_konaklama`, `evcil_hayvan_ucreti` y `hesapla`.
- Razonamiento multi-paso: encadena varias llamadas antes de responder (por ejemplo, dos consultas de `oda_bilgisi` seguidas de `hesapla` para calcular una diferencia de precio).
- Uso de contexto recuperado (RAG): responde con información de la guía del hotel inyectada en el prompt mediante búsqueda por palabra clave y búsqueda semántica.
- Aritmética de precios delegada en herramientas, no calculada libremente por el modelo.
- Cumplimiento de formato: cada respuesta final termina con el carácter U+1F338 (flor de cerezo), rasgo aprendido del entrenamiento.
- No soporta visión, audio, ni otros idiomas distintos del turco según la información disponible.

## Casos de uso

- Recepción automatizada de un hotel turco: el modelo gestiona conversaciones multi-turno en turco sobre horarios de entrada, política de cancelación, desayuno, piscina, masajes o traslado al aeropuerto, apoyándose en la guía recuperada para cada consulta.
- Cálculo de estancias y tarifas: ante preguntas del tipo "3 noches en la habitación Standard Garden", el agente invoca `toplam_konaklama` con los argumentos extraídos y devuelve el importe sin delegar la aritmética al modelo.
- Tarifas de mascotas: consultas como "me alojo 4 noches con mi perro, ¿cuánto pago de limpieza?" se resuelven llamando a `evcil_hayvan_ucreti` con el número de noches y el tipo de animal.
- Recomendación de habitaciones por aforo: "somos 4 personas, ¿en qué habitación podemos alojarnos?" se traduce en una llamada a `oda_oner` que filtra el inventario por capacidad.
- Comparativas de precio entre habitaciones: el patrón de dos llamadas a `oda_bilgisi` más `hesapla` sirve para responder diferencias de tarifa por noche entre dos categorías.
- Base para prototipos de agentes con modelos pequeños: útil como referencia de diseño de bucles con validación de JSON, verificación numérica y fallback determinista en entornos con presupuesto de GPU mínimo.
- Evaluación de pipelines de tool calling: al ser un modelo de 1,5 B con salida estructurada y conjunto de test publicado por el autor, sirve como banco de pruebas barato para comparar orquestadores, prompts y estrategias de recuperación.
- Integración como endpoint HTTP en la web del hotel: el bucle de agente y las herramientas viven fuera del modelo, de modo que puede desplegarse tras una API y conectarse a datos de reservas de solo lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una evaluación propia con un juez automático sobre 19 preguntas de test excluidas del entrenamiento, comparando el modelo afinado con el modelo base usando el mismo bucle de agente:

| Métrica | Qwen2.5-1.5B-Instruct (base) | Begonvil-Ajan-1.5B (afinado) |
|---|---|---|
| Puntuación media (19 preguntas) | 0,39 | 0,68 |
| Tasa de activación del plan de respaldo | 0,21 | 0,00 |

Distribución de puntuaciones del modelo afinado (escala 0 / 0,5 / 1 por pregunta):

| Puntuación | Número de preguntas |
|---|---|
| 1,0 | 11 |
| 0,5 | 4 |
| 0,0 | 4 |
| Total | 19 |

En las 8 preguntas que tenían una herramienta esperada, la herramienta correcta aparece en la llamada del modelo. Los fallos se concentran en preguntas factuales simples (recarga de vehículo eléctrico, organización de bodas, capacidad y precio de la habitación familiar, capacidad y precio de la Standard Garden) y en respuestas parcialmente correctas sobre horario de desayuno y precios de masaje. El propio autor advierte que el conjunto es pequeño y que el juez automático es una medida tosca, no una prueba de éxito.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 3,1 GB de pesos más caché KV y activaciones; en la práctica, 4-5 GB para contextos cortos.
- VRAM estimada en int8: alrededor de 1,6 GB de pesos; 2,5-3 GB con overhead de runtime.
- VRAM estimada en int4 (GGUF Q4_K_M): aproximadamente 1,0-1,1 GB de pesos; cabe en 2 GB con contexto reducido.
- GPU recomendadas: cualquier GPU con 4 GB o más para fp16 (GTX 1650 Super, RTX 3050, RTX 4060, RTX 3060 12 GB, RTX 4090, A10, L4, A100/H100 para servir muchas peticiones en paralelo).
- Cabe holgadamente en GPU de consumo: una RTX 3060 de 12 GB permite varias instancias o contextos largos; una RTX 4060 de 8 GB es suficiente para una instancia en fp16.
- Despliegue: vLLM o TGI para servicio con batching continuo; transformers para prototipado; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no se han publicado cifras medidas. Por el tamaño (1,54 B) es adecuado para inferencia interactiva en GPU de consumo, pero no hay datos verificados de tokens por segundo.
- CPU: la inferencia en CPU es viable solo con cuantización int4 y expectativas de baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Begonvil-Ajan-1.5B | 1,54 B | No indicado; base de 32.768 tokens | Apache-2.0 | Turco | 0 descargas, 0 likes en el momento de la consulta |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens | Apache-2.0 | Multilingüe (incluye español e inglés) | Ampliamente disponible y adoptado |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache-2.0 | Multilingüe | Ampliamente disponible |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Multilingüe (8 idiomas oficiales) | Ampliamente disponible |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache-2.0 | Principalmente inglés | Ampliamente disponible |

La comparación de rendimiento con estas alternativas no está disponible: no existen resultados de benchmarks estándar para Begonvil-Ajan-1.5B y su evaluación propia (0,68 de media en 19 preguntas de dominio hotelero en turco) no es trasladable a las métricas públicas de los otros modelos. Frente al modelo base, la única ventaja demostrada es la adherencia al formato de agente y la reducción del plan de respaldo (0,21 a 0,00), a costa de un dominio y un idioma mucho más restringidos.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente turco; no hay evidencia de competencia en español, inglés ni en ningún otro idioma, y el ajuste fino probablemente degradó el multilingüismo del modelo base.
- Dominio cerrado: su conocimiento se limita a la guía y a la tabla de habitaciones del hotel ficticio; no puede reservar, cobrar ni modificar estado.
- Formato rígido: la salida esperada es un JSON de tres o dos claves con nombres de herramienta fijos; cualquier cambio en el esquema exige reentrenar o añadir una capa de traducción.
- Sesgo de formato: termina todas las respuestas con el carácter U+1F338, lo que puede ser indeseable en integraciones de producción y requiere post-procesado.
- Riesgo de alucinación: con 1,54 B de parámetros y 655 ejemplos de entrenamiento, la generación de cifras o servicios inexistentes es plausible; el diseño del autor lo mitiga verificando números contra las fuentes y con un fallback por reglas, no gracias al modelo.
- Evaluación muy débil: 19 preguntas de test y un juez automático calificado por el propio autor como "medida tosca"; la puntuación de 0,68 no debe interpretarse como tasa de acierto en producción.
- Errores observados en la propia tabla del autor: respuestas incorrectas sobre recarga de vehículo eléctrico, bodas y datos de habitaciones, y respuestas parciales sobre desayuno y masajes.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, repositorio de 3,1 GB sin cuantizaciones publicadas ni demo.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo hereda los sesgos y limitaciones de Qwen2.5-1.5B-Instruct.
- Metadatos: la fecha de creación registrada en HuggingFace es 2026-10-23, posterior a la de la mayoría de modelos de referencia; conviene verificar la vigencia del repositorio antes de dependender de él.
- Idiomas y contexto: si se necesita español o ventanas superiores a las del modelo base, este ajuste no es la opción adecuada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ozzycan/Begonvil-Ajan-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las entradas devueltas por el buscador corresponden a biografías y libros de Fred Sirieix y no guardan relación con el modelo.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
