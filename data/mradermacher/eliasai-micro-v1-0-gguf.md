# mradermacher/EliasAI-Micro-v1.0-GGUF

## Resumen

EliasAI-Micro-v1.0 es un modelo de lenguaje conversacional en alemán de aproximadamente 1.000 millones de parámetros, desarrollado por ETME-TECH y afinado a partir de la base Qwen/Qwen3.5-0.8B-Base. La versión aquí descrita es una cuantización GGUF estática publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo está pensado para conversación en alemán y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su tamaño reducido (en torno a 1 GB en cuantizaciones de 4 bits) lo hace apto para ejecución en CPU, GPUs de consumo e incluso dispositivos con poca memoria, cubriendo casos de uso donde un modelo mayor no sería viable por coste o latencia.

La relevancia actual de esta ficha radica en que ofrece una alternativa ligera y de licencia permisiva para aplicaciones conversacionales en alemán, un idioma con menor cobertura de modelos pequeños de calidad que el inglés. No obstante, la información pública disponible es escasa: la model card del autor no detalla datos de entrenamiento, contexto ni benchmarks, por lo que muchos parámetros técnicos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parámetros totales | 1.006.672.704 (~1,0 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5, concretamente en la variante Qwen/Qwen3.5-0.8B-Base, sobre la que ETME-TECH realizó un fine-tuning para producir EliasAI-Micro-v1.0, orientado a conversación en alemán. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT específicas; la model card original no detalla estos aspectos.

La versión publicada por mradermacher consiste en cuantizaciones estáticas GGUF generadas mediante conversión desde el checkpoint Hugging Face original (convert_type: hf), con cuantización de tensores de salida. Adicionalmente, el autor ofrece cuantizaciones ponderadas con imatrix en un repositorio separado (EliasAI-Micro-v1.0-i1-GGUF), que suelen preservar mejor la calidad en bits bajos. No se han documentado innovaciones arquitectónicas propias más allá de las heredadas de la base Qwen3.5.

## Capacidades

- Generación de texto conversacional en alemán, con orientación a diálogo multi-turno.
- Comprensión y generación de lenguaje natural en registro coloquial y formal (según el fine-tuning del autor).
- Razonamiento básico y respuesta a preguntas, limitado por su tamaño de ~1 B de parámetros.
- Capacidades multilingües: únicamente se declara alemán; no se garantiza rendimiento en otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; poco probable en un modelo de este tamaño sin confirmación explícita.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales en alemán para atención al cliente: el modelo puede gestionar diálogos multi-turno en alemán con baja latencia gracias a su tamaño reducido, desplegado en servidores modestos o en el borde.
- Chatbots embebidos en aplicaciones móviles o de escritorio: su cuantización Q4_K_M (~0,8 GB) permite ejecución local en dispositivos con 2-4 GB de RAM, sin depender de la nube.
- Prototipado rápido de productos conversacionales en alemán: al ser Apache 2.0 y estar disponible en GGUF, se integra en minutos con llama.cpp u Ollama para validar flujos de conversación.
- Generación de respuestas en asistentes de voz para el mercado germanófono: combinado con un motor TTS, el modelo puede producir respuestas breves y naturales en alemán con latencia baja en CPU.
- Filtrado y reformulación de texto en alemán: tareas de resumen corto, reescritura o clasificación conversacional en pipelines de procesamiento de documentos.
- Educación y práctica de idiomas: como tutor conversacional de alemán en aplicaciones de aprendizaje, ejecutándose localmente para preservar la privacidad del usuario.
- Entornos con requisitos de privacidad: al poder ejecutarse en local (CPU o GPU de consumo), permite procesar conversaciones sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,6-0,8 GB en cuantizaciones Q2_K a Q4_K_M; ~1,2 GB en Q8_0; ~2,1 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060/4060 o superiores son más que suficientes. En A100/H100 el modelo estaría infrautilizado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; también puede usarse el checkpoint original con transformers.
- Latencia y throughput estimados: no disponibles; por el tamaño (~1 B) se espera inferencia en tiempo real en CPU moderna y muy alta velocidad en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EliasAI-Micro-v1.0 (este) | ~1,0 B | No disponible | Alemán | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-0.8B-Base (base) | ~0,8 B | No disponible | Multilingüe | No disponible en la información | safetensors, GGUF |
| Modelos pequeños alemanes (p. ej. variantes de Llama/Mistral afinadas en de) | 1-3 B típicamente | Variable | Alemán | Variable | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5 y afinarse en alemán, puede heredar sesgos de la base y del dataset de fine-tuning, no auditados públicamente.
- Riesgo de alucinación: elevado en un modelo de ~1 B de parámetros; no apto para tareas que requieran alta fidelidad factual sin verificación.
- Limitaciones de contexto o idioma: solo se declara soporte de alemán; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no está especificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene revisar la licencia del modelo base Qwen3.5 por si impone condiciones adicionales.
- Caveats para producción: ausencia de benchmarks y de documentación de entrenamiento; se recomienda evaluar exhaustivamente en el dominio objetivo antes de desplegar. La cuantización Q2_K y Q3_K_M pueden degradar notablemente la calidad; se sugiere Q4_K_M o superior para uso real.
- La model card no especifica versión de tokenizador, plantilla de chat ni parámetros de generación recomendados, lo que puede afectar a la reproducibilidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/EliasAI-Micro-v1.0-GGUF
- Modelo original: https://huggingface.co/ETME-TECH/EliasAI-Micro-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EliasAI-Micro-v1.0-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#EliasAI-Micro-v1.0-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
