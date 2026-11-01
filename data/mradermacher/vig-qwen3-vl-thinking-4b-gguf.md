# mradermacher/VIG-Qwen3-VL-Thinking-4B-GGUF

## Resumen

VIG-Qwen3-VL-Thinking-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo chaser2/VIG-Qwen3-VL-Thinking-4B, realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un modelo de lenguaje con capacidades visuales (vision-language) y de razonamiento, construido sobre la arquitectura Qwen3-VL de 4B parámetros, que combina comprensión de imágenes con generación de texto en modo "thinking" (razonamiento paso a paso antes de responder).

Este repositorio no es un modelo nuevo en sí mismo, sino una distribución optimizada: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware modesto, incluidas GPU de consumo e incluso CPU, mediante llama.cpp u Ollama. Incluye además los archivos mmproj (suplementos multimodales) necesarios para que la parte de visión funcione en llama.cpp.

Su relevancia actual radica en la creciente demanda de modelos multimodales pequeños y razonadores que puedan ejecutarse localmente sin depender de la nube: con unos 4,4 mil millones de parámetros y cuantizaciones desde 1,9 GB, es accesible para casi cualquier equipo moderno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer vision-language) |
| Parámetros totales | 4.411.424.256 (≈4,4 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, chaser2/VIG-Qwen3-VL-Thinking-4B, se apoya en la familia Qwen3-VL de Alibaba, una arquitectura transformer optimizada para tareas de visión y lenguaje que integra un codificador visual con un decodificador de texto. El sufijo "Thinking" indica que el modelo está orientado al razonamiento explícito: genera una cadena de pensamiento antes de dar la respuesta final. El término "VIG" en el nombre sugiere un ajuste específico del autor original, aunque la model card no documenta en qué consistió ni con qué datos se entrenó o ajustó.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO, no hay información disponible en la model card. Tampoco se detallan innovaciones técnicas específicas del ajuste. Lo que sí proporciona este repositorio son cuantizaciones estáticas en formato GGUF, generadas por mradermacher, que reducen la precisión de los pesos (por ejemplo, Q4_K_M usa alrededor de 4,5 bits por peso) para disminuir drásticamente los requisitos de memoria con una pérdida de calidad mínima en los niveles medios y altos.

## Capacidades

- Comprensión de imágenes y texto (vision-language): puede describir, analizar y responder preguntas sobre imágenes, gracias al suplemento multimodal mmproj incluido en el repositorio.
- Razonamiento en modo "thinking": genera cadenas de razonamiento explícitas antes de la respuesta final, útil para problemas que requieren descomposición paso a paso.
- Generación de texto conversacional: etiquetado como conversational en Hugging Face.
- Ejecución local eficiente: las cuantizaciones GGUF permiten inferencia en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio y herramientas compatibles.
- No hay información disponible sobre soporte de tool calling, capacidades de agente, generación de código específica ni soporte de audio.

## Casos de uso

- Análisis local de documentos e imágenes: dado su carácter multimodal, puede usarse para extraer información de capturas de pantalla, diagramas o documentos escaneados sin enviar datos a la nube, algo valioso en entornos con requisitos de privacidad.
- Asistentes visuales en aplicaciones de escritorio: con cuantizaciones de 2,7-2,8 GB (Q4_K_S/Q4_K_M), cabe con holgura en GPUs de 8 GB o incluso en equipos sin GPU dedicada, permitiendo chatbots con visión integrados en apps locales.
- Razonamiento paso a paso offline: el modo thinking lo hace adecuado para resolver problemas de lógica, matemáticas o planificación donde el usuario quiere ver el proceso de razonamiento, sin coste de API.
- Prototipado y testing de aplicaciones multimodales: desarrolladores pueden probar pipelines de visión+lenguaje en local con LM Studio u Ollama antes de escalar a modelos mayores.
- Generación de descripciones y metadatos de imágenes a escala: en servidores modestos, puede etiquetar grandes volúmenes de imágenes (alt text, catalogación, moderación preliminar) gracias al bajo consumo de las cuantizaciones agresivas como Q3 o IQ4_XS.
- Educación y experimentación: por su tamaño reducido y licencia Apache 2.0, es idóneo para aprender sobre inferencia local, cuantización y modelos multimodales en hardware doméstico.
- Uso en dispositivos edge o portátiles: las versiones Q2_K (1,9 GB) permiten experimentos en equipos con recursos muy limitados, aceptando una pérdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos de evaluación en la model card del modelo base ni de la colección de cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin mmproj ni KV cache):
  - Q2_K: ≈1,9 GB
  - Q4_K_M (recomendada): ≈2,8 GB
  - Q6_K: ≈3,7 GB
  - Q8_0: ≈4,8 GB
  - f16: ≈8,9 GB
  - El mmproj añade 0,6 GB (Q8_0) o 0,9 GB (f16) para la parte visual.
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM ejecuta cómodamente Q4_K_M o superior con contexto razonable; no se necesitan A100 ni H100 para este tamaño.
- Consumer GPUs: cabe sin problemas en RTX 3060 de 12 GB, RTX 4060, RTX 4070 e incluso GPUs de 6 GB con cuantizaciones Q3/Q4. También es plenamente viable la ejecución solo en CPU (con RAM de 8 GB o más) gracias a llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, incluyendo los archivos mmproj para visión), Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No está orientado a vLLM ni TGI, que requieren safetensors (disponibles en el modelo base).
- Latencia y throughput: no disponibles; al ser un modelo de ~4B con cuantización de 4 bits, se espera inferencia fluida en GPU de consumo y velocidades aceptables en CPU moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Multimodal | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VIG-Qwen3-VL-Thinking-4B-GGUF | ≈4,4 B | Sí (mmproj incluido) | GGUF | Apache 2.0 | Razonamiento thinking, cuants desde 1,9 GB |
| Qwen3-VL-4B (base de Alibaba) | ≈4 B | Sí | Safetensors | Apache 2.0 | Modelo original sin ajuste VIG; benchmarks oficiales disponibles |
| Qwen2.5-VL-3B-Instruct | ≈3 B | Sí | Safetensors / GGUF (comunidad) | Apache 2.0 | Generación anterior, menos orientado a razonamiento explícito |
| InternVL3-1B/2B | 1-2 B | Sí | Safetensors / GGUF (comunidad) | Apache 2.0 | Alternativa más pequeña para dispositivos muy limitados |

Nota: la comparativa se basa en las familias de referencia; para el ajuste específico "VIG" del modelo base no hay datos de rendimiento publicados que permitan comparación cuantitativa.

## Limitaciones y advertencias

- Idioma: la model card declara solo el inglés; el rendimiento en castellano no está documentado y puede ser inferior, especialmente en la parte de razonamiento.
- Cuantizaciones bajas: Q2_K y Q3_K_S/M implican una degradación de calidad notable (el propio autor marca Q3_K_M como "lower quality"); para producción se recomienda Q4_K_M o superior.
- Ausencia de imatrix quants: solo hay cuantizaciones estáticas; las weighted/imatrix, de mejor calidad a igual tamaño, no están disponibles en este repositorio.
- Sin benchmarks publicados: ni el modelo base VIG ni las cuants tienen evaluaciones documentadas; la calidad real del ajuste "Thinking" no puede verificarse con datos objetivos.
- Documentación escasa del modelo base: no se conocen los datos ni el método del ajuste VIG, lo que añade incertidumbre sobre sesgos y comportamiento.
- Alucinaciones: como todo LLM de 4B, puede generar contenido incorrecto con confianza, y el modo thinking puede producir razonamientos plausibles pero erróneos; se recomienda supervisión humana en usos críticos.
- Contexto: la longitud de contexto no está documentada en este repositorio; hay que consultar la ficha del modelo base o la familia Qwen3-VL para estimarla.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos de la familia Qwen3 subyacente.
- Producción: para despliegues serios a escala, valora el modelo base en safetensors con vLLM en lugar de GGUF.

## Enlaces

- Repositorio de las cuantizaciones GGUF: https://huggingface.co/mradermacher/VIG-Qwen3-VL-Thinking-4B-GGUF
- Modelo base (chaser2/VIG-Qwen3-VL-Thinking-4B): https://huggingface.co/chaser2/VIG-Qwen3-VL-Thinking-4B
- Página de descarga resumida de mradermacher: https://hf.tst.eu/model#VIG-Qwen3-VL-Thinking-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre calidad de cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
