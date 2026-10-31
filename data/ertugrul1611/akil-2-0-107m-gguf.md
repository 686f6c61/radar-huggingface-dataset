# Ertugrul1611/AKIL-2.0-107M-GGUF

## Resumen

AKIL 2.0 (107M) GGUF es la versión cuantizada en formato GGUF del modelo AKIL 2.0, un modelo de lenguaje conversacional en turco de 107 millones de parámetros entrenado desde cero por el desarrollador independiente Ertugrul1611. El repositorio proporciona los ficheros necesarios para ejecutar el modelo con llama.cpp y Ollama, incluyendo un Modelfile con plantilla ChatML y ajustes de muestreo.

El modelo está orientado exclusivamente al idioma turco y se presenta explícitamente como un modelo de investigación, no como un asistente de producción: su autor advierte que inventa información, comete errores aritméticos y no ha recibido entrenamiento para rechazar peticiones dañinas. Su rasgo más destacable es el diseño de uso basado en contexto: el modelo está pensado para responder preguntas de conocimiento a partir de párrafos proporcionados en el mensaje del sistema, generando citas con el formato `[n]`, en lugar de apoyarse en su memoria paramétrica, que es deliberadamente limitada dada su escala.

Con un contexto de 2048 tokens y un tamaño de apenas 115 MB en cuantización Q8_0, AKIL 2.0 es un ejemplo de modelo ultra-pequeño monolingüe, relevante como base para experimentos de RAG ligero, despliegue en hardware muy modesto y estudios de entrenamiento de LLMs en idiomas de recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer tipo decoder, entrenado desde cero; detalles en el repositorio del modelo base) |
| Parámetros totales | 106.992.128 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | f16 (215 MB), Q8_0 (115 MB) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Ertugrul1611/AKIL-2.0-107M, fue entrenado desde cero ("from-scratch") como un modelo de conversación en turco de 107 millones de parámetros. La model card de este repositorio GGUF no detalla la arquitectura exacta, el número de tokens de entrenamiento ni la composición del dataset; el autor remite a la model card del modelo principal para métricas, capacidades y límites. Sí se confirma que la tokenización usa SentencePiece y que es idéntica entre la implementación de transformers y llama.cpp (sin diferencias sobre 308 textos de prueba).

En cuanto a innovaciones técnicas, el diseño más notable es el patrón de uso documentado: el modelo espera párrafos de conocimiento en el mensaje del sistema bajo el encabezado `Bilgiler:` con formato `[1] …`, `[2] …`, y responde citando las fuentes con referencias `[n]`. El autor indica que la memoria paramétrica del modelo es débil de forma deliberada, lo que lo convierte en un candidato natural para pipelines de RAG en turco. También existe un formato de herramientas (`<arac>hesap: …</arac>`) con un ejecutor de ejemplo disponible en el repositorio del modelo base. No hay información sobre RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto conversacional en turco, con plantilla ChatML incluida en el Modelfile de Ollama.
- Respuesta a preguntas con citas: dado material de referencia en el mensaje del sistema, genera respuestas con referencias numeradas `[n]` al párrafo correspondiente (patrón de RAG con citas).
- Formato de herramientas básico mediante etiquetas `<arac>…</arac>`, con un ejecutor de ejemplo (calculadora) en el repositorio del modelo base; no hay evidencia de function calling moderno ni de agentes multi-paso.
- Tokenización consistente entre transformers y llama.cpp (verificada sobre 308 textos).
- Reproducibilidad entre formatos: la versión f16 produce las mismas respuestas que la versión transformers en generación greedy (8 de 8 peticiones); Q8_0 coincide en 7 de 8.
- No soporta vision, audio ni modos de razonamiento extendido ("thinking").

## Casos de uso

- RAG ligero en turco: el modelo está diseñado para recibir párrafos de contexto en el mensaje del sistema y responder con citas `[n]`, lo que lo hace adecuado para prototipos de búsqueda aumentada sobre corpus pequeños (hasta 2048 tokens de contexto).
- Despliegue en hardware mínimo: con 115 MB en Q8_0, puede ejecutarse en CPU, Raspberry Pi o máquinas sin GPU, útil para chatbots locales sencillos en turco.
- Investigación sobre LLMs en idiomas de recursos limitados: al estar entrenado desde cero en turco, sirve como punto de partida o comparación para estudios de modelos monolingües de muy pequeña escala.
- Educación y experimentación con llama.cpp y Ollama: el repositorio incluye ficheros GGUF listos y un Modelfile, ideal para aprender el ciclo completo de cuantización y despliegue local.
- Prototipos de asistentes con herramientas básicas: el formato `<arac>…</arac>` permite experimentar con ejecutores de herramientas simples (como calculadoras) en turco, corrigiendo así las debilidades aritméticas del modelo.
- Evaluación de fidelidad de citas: el formato de referencias numeradas facilita construir sistemas donde se verifica que cada afirmación se ancla a un párrafo fuente concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio del modelo base (Ertugrul1611/AKIL-2.0-107M) para métricas detalladas. Los únicos datos cuantitativos publicados aquí son de consistencia entre formatos: f16 reproduce exactamente las respuestas de transformers en 8 de 8 peticiones greedy, y Q8_0 en 7 de 8.

## Requisitos de hardware

- VRAM/memoria estimada: 215 MB en f16 y 115 MB en Q8_0; ejecutable íntegramente en CPU sin GPU dedicada.
- GPU recomendadas: ninguna necesaria; cualquier GPU moderna es sobrada. En hardware con GPU, el modelo consume una fracción mínima de memoria (por ejemplo, cabe miles de veces en una RTX 4090 de 24 GB).
- Consumer GPU: totalmente prescindible; el caso de uso natural es CPU puro o dispositivos embebidos.
- Opciones de despliegue:
  - llama.cpp: `llama-server -m AKIL-2.0-107M-Q8_0.gguf --host 127.0.0.1 --port 8080` (la plantilla de chat va embebida en el GGUF).
  - Ollama: crear el modelo con `ollama create akil-2.0 -f Modelfile` y ejecutarlo con `ollama run akil-2.0`.
- Latencia y throughput: no disponibles, aunque en un modelo de 107M parámetros la inferencia en CPU moderna debería ser prácticamente instantánea por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AKIL 2.0 (107M) | 107M | 2048 | turco | Apache 2.0 | GGUF (llama.cpp, Ollama) y safetensors |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | multilingüe (incl. turco) | Apache 2.0 / Qwen Research | safetensors, GGUF, despliegue generalizado |
| SmolLM2-135M-Instruct | 135M | 8.192 | inglés (multilingüe limitado) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B Instruct | 1.240M | 128.000 | multilingüe (8 idiomas, sin turco oficial) | Llama 3.2 Community | safetensors, GGUF |

AKIL 2.0 se distingue por ser monolingüe en turco y entrenado desde cero a escala ultra-pequeña, frente a alternativas multilingües más grandes. Su ventana de 2048 tokens es notablemente corta comparada con los 32k-128k de la competencia, pero su tamaño lo hace único en eficiencia de despliegue.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de investigación, no un asistente: inventa información (alta tasa de alucinación) y comete errores de cálculo.
- No ha sido entrenado para rechazar peticiones dañinas, por lo que no debe exponerse a usuarios finales sin capas de moderación adicionales.
- La memoria paramétrica es débil por diseño: sin material de referencia en el mensaje del sistema, la calidad de las respuestas de conocimiento será baja.
- Contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas multi-turno.
- Soporte exclusivo para turco; no es utilizable en castellano ni en otros idiomas.
- Solo hay dos niveles de cuantización (f16 y Q8_0); no existen variantes más agresivas como Q4_K_M.
- Sesgos: no disponible; no se ha publicado información sobre sesgos del modelo.
- Licencia Apache 2.0 sin restricciones para uso comercial, aunque al redistribuir debe conservarse el fichero `NOTICE` y las atribuciones de datos están en `ATTRIBUTION.md`.
- Proyecto de autor individual con descargas muy bajas (87 en el momento de la ficha): escasa validación comunitaria y sin garantía de mantenimiento continuado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Ertugrul1611/AKIL-2.0-107M-GGUF
- Modelo base (AKIL 2.0 107M): https://huggingface.co/Ertugrul1611/AKIL-2.0-107M
- Perfil del autor: https://huggingface.co/Ertugrul1611
