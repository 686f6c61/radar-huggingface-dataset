# mradermacher/ANTRU-3B-GGUF

## Resumen

ANTRU-3B es un modelo de lenguaje de 3.085 millones de parámetros orientado a programación, publicado por ANTRUhub y construido sobre Qwen2.5-Coder mediante un ajuste fino con LoRA y SFT. Su rasgo más destacable es que, según sus propias etiquetas, fue entrenado en hardware de consumo ("trained-on-consumer-hardware"), lo que lo convierte en un ejemplo interesante de cómo obtener un modelo de código especializado sin recurrir a grandes clústeres de GPU. El repositorio aquí descrito no es el modelo original, sino la cuantización estática en formato GGUF realizada por mradermacher, un cuantizador muy conocido en la comunidad por convertir modelos populares a formatos eficientes para inferencia local.

La relevancia de esta ficha radica en la versión GGUF: permite ejecutar el modelo en CPU y en GPUs modestas con llama.cpp, Ollama u otras herramientas compatibles, con cuants que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16). Para desarrolladores que necesitan un asistente de código ligero y con licencia Apache 2.0, esta es una opción práctica a evaluar frente a alternativas como Qwen2.5-Coder-3B en su versión original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-Coder (detalle exacto no disponible) |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base ANTRU-3B parte de Qwen2.5-Coder, una familia de modelos transformer optimizados para tareas de programación. Sobre esa base se aplicó un ajuste fino mediante LoRA (adaptadores de bajo rango) seguido de SFT (supervised fine-tuning), una combinación habitual para especializar modelos en dominios concretos con un coste computacional reducido. El uso de LoRA explica en parte que el entrenamiento pudiera realizarse en hardware de consumo, tal como indica la etiqueta del repositorio.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la información disponible. Respecto a la cuantización, mradermacher ofrece cuants estáticos en GGUF (k-quants e i-quants) generados por conversión desde HF, y remite a un repositorio hermano (ANTRU-3B-i1-GGUF) para cuants imatrix/weighted, que suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generación de código: especialización principal del modelo, heredada de la base Qwen2.5-Coder.
- Conversación: el repositorio está etiquetado como "conversational", apto para chat multi-turno.
- Razonamiento general y matemáticas: no hay datos publicados; hereda en principio las capacidades base, sin cifras verificables.
- Vision, audio y multimodalidad: no disponibles.
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades multilingües: limitadas; el modelo está etiquetado solo para inglés.

## Casos de uso

- Asistente de código local y privado: con un cuant Q4_K_M de solo 2,0 GB, se puede ejecutar en un portátil sin GPU dedicada para autocompletado y generación de funciones, manteniendo el código fuera de servicios en la nube.
- Autocompletado en editores: integrable con extensiones tipo Continue o similares sobre llama.cpp, dado su tamaño reducido y su especialización en código.
- Chatbot técnico en inglés: para consultas sobre programación y depuración en entornos sin conexión, aprovechando su etiqueta conversacional.
- Prototipado de agentes ligeros: su bajo footprint permite orquestar varias instancias en una sola GPU de consumo, útil para experimentación con flujos multi-paso (aunque sin soporte de tool calling documentado).
- Educación y formación: ideal para talleres donde los asistentes ejecutan un LLM de código en sus propios equipos sin requisitos de hardware exigentes.
- Inferencia en CPU en servidores modestos: los cuants Q2_K a Q4_K permiten despliegues en VPS o Raspberry-class hardware (este último con rendimiento limitado) para tareas de generación de texto y código de baja concurrencia.
- Evaluación comparativa de cuants: al ofrecer la gama completa de cuantizaciones, es un buen banco de pruebas para estudiar la degradación de calidad frente al tamaño en modelos de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuant: Q2_K ~1,4 GB; Q4_K_M ~2,0 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB (más la memoria de contexto).
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB o más (GTX 1660, RTX 3060, RTX 4060, RTX 4090) ejecuta incluso el f16; en CPU pura, 8 GB de RAM bastan para la mayoría de cuants.
- Despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente; para ellos habría que usar el modelo base ANTRUhub/ANTRU-3B en transformers.
- Latencia y throughput: no disponibles; por su tamaño (~3B) y los cuants recomendados (Q4_K_S/M, "fast" según el autor), se espera inferencia fluida incluso en CPU moderna, sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| ANTRU-3B (esta ficha) | 3,09 B | no disponible | Código (SFT sobre Qwen2.5-Coder) | Apache 2.0 | Sí (mradermacher) |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32K (según ficha oficial) | Código | Apache 2.0 / Qwen | Sí (oficial y comunidad) |
| Phi-3.5-mini-instruct | 3,8 B | 128K | General/código | MIT | Sí |
| Stable Code 3B | 3,0 B | 16K | Código | No comercial (StableLM) | Sí |

ANTRU-3B compite directamente con Qwen2.5-Coder-3B-Instruct, del que deriva; su valor diferencial sería el ajuste fino propio, aunque sin benchmarks publicados no es posible verificar mejoras. Frente a Phi-3.5-mini pierde contexto y versatilidad, y frente a Stable Code 3B ofrece una licencia mucho más permisiva.

## Limitaciones y advertencias

- Falta de documentación: no hay model card detallada del modelo base con datos de entrenamiento, contexto ni benchmarks, lo que dificulta evaluar su calidad real frente a la base Qwen2.5-Coder.
- Sin benchmarks publicados: cualquier ventaja sobre el modelo base es una afirmación sin verificación cuantitativa.
- Idioma: etiquetado solo para inglés; el rendimiento en castellano no está garantizado ni documentado.
- Cuants de baja calidad: Q2_K y Q3_K_M degradan notablemente la calidad (el propio autor señala "lower quality" en Q3_K_M); para uso serio se recomiendan Q4_K_S/M o superiores, o los cuants imatrix del repositorio i1.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del dataset de SFT, que no está documentado.
- Riesgo de alucinación: inherente a modelos de 3B; en generación de código puede producir fragmentos plausibles pero incorrectos, por lo que se recomienda revisión humana o tests automatizados.
- Es un repositorio de cuantización (mradermacher), no el modelo original: para soporte sobre el comportamiento del modelo hay que acudir a ANTRUhub/ANTRU-3B.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/ANTRU-3B-GGUF
- Modelo base: https://huggingface.co/ANTRUhub/ANTRU-3B
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/ANTRU-3B-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#ANTRU-3B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
