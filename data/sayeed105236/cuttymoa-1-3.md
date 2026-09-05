# sayeed105236/CuttyMOA-1.3

## Resumen

CuttyMOA-1.3 es un modelo de lenguaje denso de 27.000 millones de parámetros, desarrollado por MD ABU SAYEED bajo DOTPROGRAMMERS y CUTEADMOA LAB. Se basa en el modelo Qwen/Qwen3.8-27B y constituye la tercera generación de la familia CuttyMOA. Su característica más destacada es una ventana de contexto de 262.144 tokens, que permite procesar documentos muy extensos en una sola pasada. El modelo se ha ajustado mediante QLoRA (4-bit) con LoRA r=64/alpha=128, y el entrenamiento está en curso: el checkpoint actual corresponde al paso 505 de 4000, con una pérdida de entrenamiento de 0,80. Está pensado como asistente generalista, con soporte multilingüe (más de 25 idiomas, incluidos inglés y bengalí) y se sirve en CPU mediante llama.cpp con cuantización Q4_K_M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense decoder-only LLM (basado en Qwen/Qwen3.8-27B) |
| Parámetros totales | 27.000 millones (27B) |
| Parámetros activos | No aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens (salida máxima: 32.768 tokens) |
| Tipos de cuantización | Q4_K_M (mencionado para inferencia CPU con llama.cpp); no se especifican otros |
| Idiomas soportados | Inglés, bengalí y multilingüe (25+ idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

CuttyMOA-1.3 es un transformer denso decoder-only, construido sobre el modelo base Qwen/Qwen3.8-27B. A diferencia de la generación anterior (CuttyMOA-1.2), que empleaba una arquitectura MoE con 35.000 millones de parámetros totales y 3.000 millones activos por token, esta versión adopta un diseño denso de 27.000 millones de parámetros. El ajuste fino se realizó con QLoRA en 4 bits, utilizando LoRA con r=64 y alpha=128, una tasa de aprendizaje de 1,5e-4, tamaño de lote 2x8 y longitud de secuencia de 4096 tokens. El entrenamiento se encuentra en el paso 505 de un total de 4000, con una pérdida de 0,80; el proceso está pausado pero es reanudable. La model card no especifica la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Chat multi-turno y seguimiento de instrucciones.
- Escritura, reescritura y resumen de textos.
- Generación y explicación de código.
- Razonamiento paso a paso.
- Soporte multilingüe de más de 25 idiomas, incluidos inglés y bengalí.
- Comprensión de contextos largos de hasta 262.144 tokens.
- Análisis de seguridad y revisión de código.
- Streaming de tokens mediante SSE (Server-Sent Events).
- Integración con ScrapePower para automatización web con Selenium Chrome, 8 extractores y extracción mediante IA.
- Generación de imágenes mediante 3 modelos alojados en HuggingFace (a través de la plataforma CUTEADMOA).
- Reconocimiento de voz (speech-to-text) y síntesis de voz (text-to-speech) con 3 modelos de distintos proveedores.
- Extracción de metadatos de vídeo y diapositivas.
- Enrutamiento inteligente y agregación multi-modelo.
- 24 intenciones (7 generales y 17 de seguridad) con generación de informes en HTML y DOCX.

## Casos de uso

- Asistente de atención al cliente multilingüe: gracias a su contexto de 262.144 tokens y soporte para más de 25 idiomas, puede gestionar conversaciones largas y documentos extensos, lo que lo hace adecuado para centros de contacto que atienden a usuarios en inglés y bengalí.
- Análisis de seguridad y revisión de código: el modelo puede revisar código fuente en busca de vulnerabilidades y generar informes de seguridad en HTML o DOCX, integrándose en pipelines de CI/CD para auditorías automatizadas.
- Generación de código y documentación técnica: al ser capaz de generar y explicar código, puede asistir a desarrolladores en tareas de programación, redacción de documentación y revisión de cambios.
- Web scraping empresarial con extracción por IA: la integración con ScrapePower permite automatizar la extracción de datos de sitios web mediante Selenium Chrome, con 8 extractores y extracción inteligente, útil para monitorización de precios, análisis de competencia o recopilación de datos de investigación.
- Procesamiento de documentos largos: con una ventana de contexto de 262K tokens, puede resumir, analizar o responder preguntas sobre informes, contratos o expedientes extensos sin necesidad de dividirlos en fragmentos.
- Asistente de escritura y redacción: el modelo puede redactar, reescribir y resumir textos, lo que resulta útil para generar contenido editorial, informes empresariales o material didáctico en varios idiomas.
- Despliegue en entornos sin GPU: al poder ejecutarse en CPU con llama.cpp y cuantización Q4_K_M, es una opción viable para servidores o VPS sin aceleradores gráficos, aunque con un rendimiento de 2-4 tokens por segundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el modelo se sirve en CPU con llama.cpp y cuantización Q4_K_M, con una velocidad estimada de 2-4 tokens por segundo. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo se sirve en CPU, por lo que no se especifica un requisito de VRAM.
- GPU recomendadas: no disponible; la model card menciona inferencia en CPU mediante llama.cpp.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: llama.cpp (con Q4_K_M), transformers + peft, systemd y nginx (según guías de instalación). También se integra en la plataforma CUTEADMOA a través del MOA Server (puerto 5400), el auto-router OpenAI-compatible (puerto 7005) y el Proxy Fleet (puertos 9001-9010).
- Latencia y throughput: aproximadamente 2-4 tokens por segundo en CPU (según la model card).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CuttyMOA-1.3 | Dense decoder-only | 27B | 262.144 tokens | Apache-2.0 | HuggingFace |
| CuttyMOA-1.2 | MoE | 35B totales (3B activos) | No disponible | No disponible | No disponible |
| Qwen/Qwen3.8-27B (base) | Dense decoder-only | 27B | No disponible | Apache-2.0 (según tags) | HuggingFace |

Los datos de rendimiento de estos modelos no están disponibles en la información proporcionada, por lo que no es posible realizar una comparación basada en benchmarks.

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio (paso 505 de 4000) con entrenamiento pausado, por lo que sus capacidades pueden no estar completamente desarrolladas y podrían cambiar en futuras iteraciones.
- No se especifica la composición del dataset de entrenamiento, lo que dificulta identificar posibles sesgos o problemas de calidad de los datos.
- No se han publicado benchmarks, por lo que no hay evidencia empírica del rendimiento en tareas estándar.
- La velocidad de inferencia en CPU es de 2-4 tokens por segundo, lo que puede ser insuficiente para aplicaciones interactivas en tiempo real.
- Las capacidades de generación de imágenes, audio y extracción web pertenecen a la plataforma CUTEADMOA, no necesariamente al modelo en sí, por lo que el despliegue aislado de CuttyMOA-1.3 puede no incluir dichas funciones.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y de los adaptadores LoRA para asegurar el cumplimiento.
- No se especifica soporte formal de tool calling o function calling; las integraciones con ScrapePower y el auto-router son externas al modelo.

## Enlaces

- HuggingFace: https://huggingface.co/sayeed105236/CuttyMOA-1.3
- Sitio web de CUTEADMOA: https://cuteadmoa.site
- LinkedIn del autor: https://www.linkedin.com/in/abu-sayeed-6296a1b9
