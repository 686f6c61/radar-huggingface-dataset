# mangaba-ai/mangaba-reforma-tributaria-2b

## Resumen

El modelo `mangaba-ai/mangaba-reforma-tributaria-2b` es un adaptador LoRA que especializa el modelo base `mlx-community/gemma-2-2b-it-4bit` (Gemma 2 2B instruct cuantizado a 4 bits en formato MLX) en la reforma tributaria del consumo en Brasil, concretamente en la EC 132/2023, la LC 214/2025, el IBS, la CBS y el Impuesto Selectivo. Desarrollado por Mangaba AI, este adaptador está diseñado para resolver consultas sobre la legislación tributaria brasileña de forma precisa, utilizando exclusivamente fuentes públicas oficiales como el texto consolidado del Planalto, los datos abiertos de la Cámara de Diputados y del Senado Federal, sin recurrir a datasets sintéticos generados por LLM.

El modelo se distribuye como un adaptador LoRA de rango 16 sobre 8 capas, entrenado con 1257 ejemplos de entrenamiento, 69 de validación y 69 de prueba, con una longitud máxima de secuencia de 1536 tokens. Su relevancia radica en que ofrece una especialización jurídica de bajo coste computacional, pensada para ejecutarse en Apple Silicon mediante la librería MLX, y que puede integrarse en pipelines de recuperación aumentada (RAG) para proporcionar respuestas fundamentadas en la normativa vigente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA |
| Parametros totales | 2,6 mil millones (modelo base) + adaptador LoRA de rango 16 en 8 capas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (modelo base); adaptador entrenado con max_seq_length 1536 |
| Tipos de cuantizacion | Modelo base en 4 bits (MLX); adaptador en precisión completa (no cuantizado) |
| Idiomas soportados | Portugués (especializado en portugués de Brasil) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | MLX (adaptador y modelo base) |

## Arquitectura y entrenamiento

El modelo base es Gemma 2 2B, un transformer decoder-only con atención de ventana deslizante y atención global alternada, desarrollado por Google. Sobre este modelo, Mangaba AI ha entrenado un adaptador LoRA de rango 16 en 8 capas, con 800 iteraciones y una tasa de aprendizaje de 1e-5. El entrenamiento se realizó íntegramente con fuentes públicas oficiales: el texto consolidado de la EC 132/2023 y la LC 214/2025 artículo por artículo, los datos abiertos de la Cámara de Diputados (PEC 45/2019, PLP 68/2024, PLP 108/2024 y correlatas) y los datos abiertos del Senado Federal. No se utilizó ningún dataset sintético generado por LLM.

El dataset de entrenamiento incluye cuatro formatos de tareas: teor del dispositivo (explicación de un artículo), cita inversa (dado un fragmento, identificar el artículo), mapa temático (qué artículos tratan de un tema X) y situación legislativa de las proposiciones. El modelo base no acepta el rol `system`, por lo que la instrucción de sistema se coloca al inicio del turno del usuario, tal como se construyó el dataset.

## Capacidades

- Generación de texto especializada en derecho tributario brasileño, específicamente en la reforma tributaria del consumo (IBS, CBS, Impuesto Selectivo).
- Respuesta a consultas sobre el contenido de artículos de la EC 132/2023 y la LC 214/2025.
- Identificación de la norma y el artículo citado a partir de un fragmento de texto (cita inversa).
- Mapeo temático: dado un tema, identifica qué artículos de la normativa lo tratan.
- Consulta sobre el estado legislativo de proposiciones (PEC 45/2019, PLP 68/2024, PLP 108/2024).
- Capacidad multilingüe limitada: el adaptador está entrenado exclusivamente en portugués, aunque el modelo base Gemma 2 soporta múltiples idiomas.
- No soporta tool calling, visión, audio ni modos de razonamiento explícitos.

## Casos de uso

- Asesoría jurídica preliminar: un abogado tributarista puede consultar al modelo sobre el contenido de un artículo específico de la LC 214/2025 para obtener una explicación rápida antes de contrastarla con el texto oficial.
- Recuperación aumentada (RAG) en sistemas de consulta legislativa: el adaptador se integra en un pipeline que recupera artículos relevantes mediante BM25 y los inyecta en el prompt, permitiendo respuestas fundamentadas sobre la reforma tributaria.
- Formación y divulgación: estudiantes de derecho o profesionales pueden utilizarlo para comprender la estructura de la reforma, por ejemplo, preguntando "¿cómo funciona el cashback del IBS para familias de baja renta?".
- Verificación de citas normativas: dado un fragmento de un artículo, el modelo identifica la norma y el artículo de origen, útil para validar referencias en documentos legales.
- Análisis de impacto sectorial: consultas sobre qué artículos tratan un tema concreto (por ejemplo, "¿qué artículos regulan el impuesto selectivo?") para localizar rápidamente la normativa aplicable.
- Asistente en despachos de abogados con presupuesto limitado: al ser un modelo de 2B cuantizado, puede ejecutarse en hardware modesto (Apple Silicon) sin necesidad de infraestructura GPU costosa, ofreciendo una primera capa de consulta automática.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación sobre el split de test con generación gulosa (temperatura 0):

| Metrica | Modelo base (sin fine-tuning) | Con adaptador |
|---|---|---|
| Acierto del dispositivo citado | 0,2 | 0,5667 |
| Acierto de la norma citada | 0,8667 | 0,6667 |
| Cobertura de los terminos de la referencia | 0,1217 | 0,4821 |

El adaptador mejora significativamente el acierto del dispositivo citado y la cobertura de términos, pero empeora en el acierto de la norma citada. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 2B cuantizado a 4 bits en formato MLX, está optimizado para Apple Silicon (M1, M2, M3 y superiores) con al menos 8 GB de RAM unificada.
- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 1,6 GB; el adaptador LoRA añade unos pocos megabytes. En total, cabe en cualquier Mac con 8 GB o más.
- No requiere GPU NVIDIA; se ejecuta mediante la librería `mlx-lm` en macOS.
- Opciones de despliegue: `mlx-lm` para generación local, y el proyecto de origen `reforma-tributaria-ft` incluye una API compatible con OpenAI para servir el modelo.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo de 2B en 4 bits, la generación es fluida en Apple Silicon (típicamente decenas de tokens por segundo en M2/M3).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| mangaba-reforma-tributaria-2b (este) | 2,6B + LoRA | 8192 (entrenado 1536) | Reforma tributaria brasileña | Gemma | MLX |
| Gemma 2 2B (base) | 2,6B | 8192 | General | Gemma | Varios (safetensors, GGUF, MLX) |
| Llama 3.2 3B | 3,2B | 128K | General | Llama 3.2 | Varios |

No se dispone de otros modelos especializados en la reforma tributaria brasileña con los que comparar directamente. La comparativa con el modelo base muestra que el adaptador mejora la precisión en la cita de dispositivos, aunque sacrifica algo de precisión en la identificación de la norma.

## Limitaciones y advertencias

- Modelo de 2B: su capacidad de razonamiento complejo es limitada; puede cometer errores en interpretaciones jurídicas sutiles.
- Riesgo de alucinación: el autor recomienda verificar siempre el dispositivo citado en el texto oficial, ya que el modelo puede generar referencias incorrectas.
- El adaptador se entrenó con datos vigentes en la fecha de recolección; cambios normativos posteriores no están reflejados.
- No sustituye la orientación de un profesional habilitado; es una herramienta de apoyo, no un asesor legal.
- El modelo base no acepta el rol `system`, lo que puede limitar su integración en frameworks que asumen ese rol.
- La licencia Gemma tiene restricciones de uso comercial específicas (prohibición de ciertos usos y obligación de atribución); debe revisarse antes de desplegar en producción.
- El formato MLX limita su ejecución a Apple Silicon; no es directamente compatible con vLLM, llama.cpp u otros entornos sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mangaba-ai/mangaba-reforma-tributaria-2b
- Organización Mangaba AI en HuggingFace: https://huggingface.co/mangaba-ai
- GitHub de Mangaba AI: https://github.com/mangaba-ai
- Repositorio mangaba_ai (agentes con A2A y MCP): https://github.com/Mangaba-ai/mangaba_ai
- Sitio web de Mangaba AI: https://www.mangaba.ia.br/
- Página de presentación de Mangaba AI: https://mangaba-ai.vercel.app/
