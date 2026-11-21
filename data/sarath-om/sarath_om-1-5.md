# sarath-om/sarath_om-1.5

## Resumen

Sarath OM 1.5 es un modelo de lenguaje publicado por el autor `sarath-om` en Hugging Face, presentado como parte de la familia "Sarath OM AI" asociada a Sarath AI. Según los metadatos del repositorio, se trata de un modelo de aproximadamente 1.543 millones de parámetros (1,54 B) construido sobre la arquitectura Qwen2, con pesos en formato safetensors y un tamaño de repositorio de 3,1 GB. La model card lo etiqueta con capacidades de generación de texto, entrada de imagen y texto (image-text-to-text), visión, tool calling y modo "thinking".

El modelo se distribuye también a través de Ollama, donde la ficha del autor declara una ventana de contexto de 256K tokens, un tamaño aproximado de 3,3 GB y soporte de visión, tool calling y razonamiento tipo thinking. Estas cifras proceden de la listing de Ollama citada en la propia model card y no están verificadas de forma independiente en el repositorio.

La relevancia de esta ficha es principalmente documental: el modelo existe, es descargable y tiene un pipeline declarado de text-generation, pero la información técnica verificable es escasa. La model card no documenta el dataset de entrenamiento, el método de alineación, los idiomas soportados ni resultados de benchmarks, y la licencia no está declarada de forma explícita. Cualquier evaluación en producción debe hacerse con cautela y validando el comportamiento real del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (según tag `qwen2` del repositorio) |
| Parámetros totales | 1.543.714.304 (≈1,54 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens (según listing de Ollama citada en la model card); no verificado en la configuración del repositorio |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card remite al archivo `LICENSE` del repositorio, que no se detalla) |
| Formato de pesos | Safetensors (según tags y metadatos del repositorio) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El repositorio incluye pesos en safetensors y un total de 1.543.714.304 parámetros, lo que sitúa al modelo en la categoría de modelos pequeños (~1,5 B), aptos para despliegue en hardware de consumo con cuantización adecuada. No se documenta si incorpora innovaciones adicionales como atención lineal, decodificación especulativa o arquitecturas híbridas.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre el modelo base exacto del que deriva. La model card indica explícitamente que los detalles técnicos y de procedencia deben verificarse contra los archivos del repositorio, y que no se afirman resultados de evaluación verificados de forma independiente. Tampoco se especifica cómo se implementan las capacidades de visión y tool calling declaradas en los tags.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text`) y capacidad de visión declarada en tags y en la listing de Ollama.
- Tool calling / function calling, listado como capacidad en la model card y en Ollama.
- Modo "thinking" (razonamiento explícito), listado como capacidad en la model card y en Ollama.
- Despliegue vía Ollama con el identificador `sarath-om/sarath_om-1.5`.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- No se documentan capacidades específicas de código, matemáticas o agentes multi-paso más allá de las etiquetas genéricas.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con Ollama en una máquina de desarrollo y usarse para conversaciones multi-turno, aprovechando su tamaño reducido (~1,5 B) para inferencia en CPU o GPU modesta.
- Procesamiento de documentos con imágenes: gracias a la modalidad image-text-to-text declarada, podría emplearse para tareas de descripción de imágenes o extracción de información de capturas, siempre validando la calidad real del modelo.
- Integración en flujos con herramientas: el soporte de tool calling permitiría conectar el modelo a APIs externas en prototipos de agentes, validando nombres y argumentos antes de ejecutar acciones.
- Prototipado de razonamiento paso a paso: el modo "thinking" declarado permite experimentar con cadenas de razonamiento explícitas en tareas de análisis, aunque sin garantías de calidad documentadas.
- Evaluación comparativa de modelos pequeños: útil como baseline en experimentos de investigación sobre modelos de ~1,5 B con contexto largo declarado.
- Despliegue en entornos con recursos limitados: su tamaño de repositorio (3,1 GB) y la variante Ollama (~3,3 GB) facilitan pruebas en portátiles y estaciones de trabajo sin GPU de gama alta.
- Chatbot de soporte interno: para preguntas frecuentes y consultas de baja criticidad, con revisión humana de las respuestas antes de su uso externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no se incluyen puntuaciones verificadas de forma independiente y que cualquier evaluación reproducible debería especificar datasets, métricas, hardware, revisión del modelo y baselines.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no publicada por el autor), un modelo de ~1,5 B en FP16 requiere del orden de 3 GB de pesos, y en cuantizaciones de 4 bits podría situarse en torno a 1 GB, aunque estas cifras no están confirmadas para este modelo concreto.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar funcionamiento en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de parámetros, pero no confirmado por el autor.
- Opciones de despliegue: Ollama (soporte oficial vía `ollama pull sarath-om/sarath_om-1.5`); el resto de runtimes (vLLM, llama.cpp, TGI) no están documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sarath OM 1.5 | ≈1,54 B | 256K (según Ollama, no verificado) | No disponible | Hugging Face, Ollama |
| Qwen2.5-1.5B (referencia de la familia Qwen2) | ≈1,5 B | 32K típicamente | Apache 2.0 (según el modelo original de Qwen) | Hugging Face, Ollama, vLLM, etc. |
| SmolLM2-1.7B | ≈1,7 B | 8K típicamente | Apache 2.0 | Hugging Face, llama.cpp, etc. |
| Gemma 2 2B | ≈2,6 B | 8K típicamente | Términos de Gemma | Hugging Face, Ollama, etc. |

Nota: los datos de los modelos comparativos son orientativos y corresponden a sus fichas públicas habituales; no se dispone de benchmarks del modelo Sarath OM 1.5 para comparar rendimiento real. La comparativa se limita a parámetros, contexto declarado, licencia y canales de distribución.

## Limitaciones y advertencias

- La licencia no está declarada de forma explícita; antes de cualquier uso comercial debe revisarse el archivo `LICENSE` del repositorio y los términos del modelo base Qwen2 del que deriva.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card advierte de que las salidas pueden ser inexactas, incompletas o inconsistentes.
- El contexto de 256K tokens procede de la listing de Ollama y no está verificado en la configuración del repositorio; podría no aplicar a todos los archivos o variantes.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido.
- Las capacidades de visión, tool calling y thinking están declaradas pero no documentadas técnicamente; deben validarse empíricamente antes de usarlas en producción.
- En tool calling, la model card recomienda validar nombres y argumentos en la aplicación antes de ejecutar acciones.
- No se ofrecen benchmarks ni evaluaciones reproducibles, por lo que no es posible comparar su calidad con alternativas establecidas.
- No debe usarse como única base para decisiones médicas, legales, financieras o de alto impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarath-om/sarath_om-1.5
- Perfil del autor en Hugging Face: https://huggingface.co/sarath-om
- Listing en Ollama: https://ollama.com/sarath-om/sarath_om-1.5
- Sitio web oficial: https://sarath.openflip.in/
- GitHub de Sarath AI: https://github.com/Sarath-Om
- LinkedIn de Sarath AI: https://www.linkedin.com/company/sarath-ai
