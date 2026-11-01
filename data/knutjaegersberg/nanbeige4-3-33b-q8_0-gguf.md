# KnutJaegersberg/Nanbeige4.3-33B-Q8_0-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.100 millones de parámetros desarrollado por el equipo chino Nanbeige, disponible en su formato original y, en este repositorio, como cuantización Q8_0 en formato GGUF creada por el usuario KnutJaegersberg mediante el espacio automatizado GGUF-my-repo de HuggingFace. Se trata de un modelo conversacional de generación de texto bilingüe, con soporte oficial de inglés y chino, orientado a ejecución local mediante llama.cpp.

La relevancia de esta versión concreta radica en la portabilidad: el formato GGUF permite ejecutar el modelo en CPU, GPU de consumo o configuraciones híbridas sin depender del ecosistema de transformers de HuggingFace. La cuantización Q8_0 es de las más conservadoras disponibles, con una pérdida de calidad mínima respecto a los pesos en precisión completa (FP16), a cambio de un tamaño de aproximadamente 35,2 GB.

Al tratarse de una cuantización comunitaria, la mayor parte de la documentación técnica (arquitectura detallada, datos de entrenamiento, benchmarks) reside en la model card del modelo original Nanbeige/Nanbeige4.3-33B, y no se han publicado datos de rendimiento específicos en la información disponible para esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, basado en Nanbeige4.3-33B) |
| Parámetros totales | 33.118.977.024 (~33,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa 2048 tokens) |
| Tipos de cuantización | Q8_0 (esta versión del repo) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un modelo de lenguaje denso de tipo transformer con aproximadamente 33.100 millones de parámetros, publicado por Nanbeige en formato safetensors y compatible con la librería transformers de HuggingFace. La versión aquí descrita es una conversión a GGUF realizada con llama.cpp a cuantización Q8_0, un esquema de 8 bits que mantiene la mayor parte de la calidad del modelo original mientras reduce el tamaño a unos 35,2 GB.

Sobre el proceso de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO) y sobre posibles innovaciones técnicas (atención lineal, decodificación especulativa, etc.), la información disponible no ofrece detalles: no disponible. Dado su etiquetado bilingüe (inglés y chino), es razonable asumir un corpus de preentrenamiento con representación significativa de ambos idiomas, aunque esta composición exacta no está documentada en la información proporcionada.

## Capacidades

- Generación de texto conversacional: etiquetado con pipeline text-generation y tag conversational, pensado para diálogo multi-turno.
- Soporte bilingüe: funcionamiento en inglés y chino, siendo este último uno de sus idiomas principales.
- Ejecución local con llama.cpp: compatible con CLI (llama-cli) y servidor (llama-server), lo que habilita integración vía API local.
- Compatibilidad con el ecosistema GGUF: utilizable desde Ollama, LM Studio, KoboldCpp y otras herramientas que consuman GGUF.
- No consta en la información disponible soporte de tool calling, function calling, capacidades de visión, audio ni modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Chatbots locales bilingües chino-inglés: el modelo puede servir como motor de conversación en aplicaciones que atiendan usuarios de ambos idiomas sin depender de APIs externas, ejecutándose íntegramente en infraestructura propia.
- Asistente de escritura y redacción: generación y revisión de textos en chino e inglés desde un portátil o estación de trabajo con GPU de gama alta, útil para redactores técnicos que trabajen con contenido en ambos idiomas.
- Prototipado de aplicaciones LLM: gracias a llama-server, puede exponerse como endpoint local compatible con la API de OpenAI, facilitando pruebas de pipelines RAG o agentes antes de pasar a modelos mayores.
- Análisis y resumen de documentos: con contexto suficiente (a confirmar en la model card original), puede resumir y responder preguntas sobre documentos técnicos en inglés o chino.
- Inferencia en entornos sin GPU: al ser GGUF, puede ejecutarse en CPU (con degradación de velocidad) en servidores on-premise donde no se permita enviar datos a la nube, por ejemplo en sectores con requisitos de privacidad.
- Investigación y comparación de modelos: la cuantización Q8_0, casi sin pérdida de calidad, es adecuada para evaluar el comportamiento del modelo original en benchmarks locales o estudios comparativos entre modelos de ~33B.
- Integración en herramientas de productividad locales: compatible con LM Studio u Ollama para uso como asistente personal offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para datos de MMLU, HumanEval, GSM8K u otras pruebas, consultar la model card del modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 pesa aproximadamente 35,2 GB. Para carga completa en GPU se necesita una tarjeta con 40 GB o más de VRAM (A100 40GB/80GB, A6000 48GB, H100). Con offload parcial CPU+GPU, una GPU de 24 GB (RTX 3090/4090) puede alojar la mayor parte de las capas.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 (con offload parcial); en Apple Silicon, Macs con memoria unificada de 48 GB o más (M2/M3 Max, M-series Ultra).
- Consumer GPUs: no cabe íntegramente en una RTX 4090 de 24 GB; es viable con offload a RAM del sistema, a costa de latencia. Con 64 GB de RAM y una GPU de 24 GB el rendimiento es razonable para uso interactivo.
- Opciones de despliegue: llama.cpp (CLI y servidor, documentado en el repo), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No está orientado de forma nativa a vLLM o TGI en este formato (esos requieren los pesos originales en safetensors).
- Latencia y throughput: no disponibles; en GPU de gama datacenter con Q8_0 se esperan velocidades de decodificación del orden de decenas de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Idiomas | Contexto |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (Q8_0 GGUF) | 33,1 B | GGUF | Apache 2.0 | en, zh | no disponible |
| Qwen2.5-32B | 32,5 B | safetensors, GGUF | Apache 2.0 (base) | 29+ idiomas | 128K |
| Yi-1.5-34B | 34,4 B | safetensors, GGUF | Apache 2.0 | en, zh | 32K |
| Llama 3.1 8B (referencia menor) | 8 B | safetensors, GGUF | Llama 3.1 Community | multilingüe | 128K |

Nanbeige4.3-33B compite en la franja de 30-35B con Qwen2.5-32B y Yi-1.5-34B, todos con licencia Apache 2.0 y fuerte enfoque bilingüe chino-inglés. Su ventaja diferencial frente a Qwen2.5 es la licencia plenamente permisiva también en las variantes ajustadas; frente a Yi-1.5-34B, la novedad de la serie 4.3. Sin benchmarks publicados en la información disponible, no es posible comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente con datos en inglés y chino, puede mostrar sesgos culturales y lingüísticos hacia esos contextos.
- Riesgo de alucinación: inherente a cualquier LLM de este tamaño; no hay datos publicados sobre tasas de alucinación. Verificar siempre las salidas en usos factuales.
- Limitaciones de idioma: soporte oficial limitado a inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Limitaciones de contexto: la longitud de ventana no está especificada en esta ficha; el comando de ejemplo de llama-server usa 2048 tokens, lo que restringe documentos largos si se adopta esa configuración por defecto.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes, incluida la cuantización derivada.
- Caveat de producción: se trata de una cuantización comunitaria generada automáticamente (GGUF-my-repo), no oficial del equipo Nanbeige; para producción crítica, conviene validar contra los pesos originales y consultar la model card del modelo base.
- Sin información sobre tool calling ni capacidades agénticas: no asumir soporte de function calling sin verificarlo.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/KnutJaegersberg/Nanbeige4.3-33B-Q8_0-GGUF
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
