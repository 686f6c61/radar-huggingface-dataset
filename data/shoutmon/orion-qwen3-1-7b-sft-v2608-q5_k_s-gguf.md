# shoutmon/Orion-Qwen3-1.7B-SFT-v2608-Q5_K_S-GGUF

## Resumen

El modelo `shoutmon/Orion-Qwen3-1.7B-SFT-v2608-Q5_K_S-GGUF` es una conversión al formato GGUF del checkpoint `3tic/Orion-Qwen3-1.7B-SFT-v2608`, realizada mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp. Se trata de un modelo de 1.720 millones de parámetros (1,7B) que parte de la familia Qwen3, sobre la que se ha aplicado un ajuste fino supervisado (SFT) para producir la variante denominada «Orion». La versión aquí presentada está cuantizada en Q5_K_S con matriz de importancia (imatrix), lo que reduce el peso a 1,2 GB y permite su ejecución en entornos con recursos limitados.

La relevancia de este modelo radica en su tamaño compacto: con 1,7B de parámetros y una ventana de contexto de 4096 tokens, está pensado para inferencia en dispositivos de gama baja, CPUs y GPUs de consumo, sin renunciar a las capacidades base de Qwen3 (razonamiento, código y multilingüismo). Al ser una conversión GGUF, se integra directamente en ecosistemas como llama.cpp, Ollama o el servidor de inferencia de llama.cpp, lo que facilita su despliegue en producción local o en edge.

El autor `shoutmon` ha publicado también otras cuantizaciones del mismo modelo base (IQ4_XS, Q8_0, etc.), lo que sugiere una intención de ofrecer distintos equilibrios entre calidad y tamaño. Sin embargo, la información pública de la model card es mínima: no se detallan datos de entrenamiento, benchmarks ni licencia oficial, aunque la búsqueda web apunta a una licencia Apache 2.0 y a una estimación de 3 GB de VRAM para inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, sin especificar variante exacta) |
| Parámetros totales | 1.720.574.000 (1,72B) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (según ficha de free2aitools) |
| Tipos de cuantización | Q5_K_S (este repo); otras versiones del mismo modelo base: IQ4_XS, Q8_0, I1 |
| Idiomas soportados | no disponible (se espera multilingüe por ser Qwen3, pero no se confirma) |
| Licencia | no disponible oficialmente; free2aitools indica Apache 2.0 (sin confirmar) |
| Formato de pesos | GGUF (con matriz de importancia, imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un modelo transformer denso con atención por ventanas y pre-norm, sobre el que se ha aplicado un ajuste fino supervisado (SFT) para obtener la variante «Orion». No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens usados ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La conversión a GGUF no modifica la arquitectura ni los pesos; únicamente cuantiza los tensores a precisión reducida (Q5_K_S) usando la matriz de importancia (imatrix) para preservar la calidad en pesos críticos.

La cuantización Q5_K_S es una de las más equilibradas en el espectro de GGUF: combina bloques de 5 bits con una parte de 6 bits para las capas más sensibles, lo que suele ofrecer una degradación mínima frente al modelo en FP16. La inclusión de `imatrix` en el nombre del archivo (`orion-qwen3-1.7b-sft-v2608-q5_k_s-imat.gguf`) indica que se utilizó la técnica de importance matrix de llama.cpp para optimizar la cuantización.

## Capacidades

- Generación de texto y razonamiento: como derivado de Qwen3, se espera que herede las capacidades de razonamiento paso a paso y generación de texto de la familia Qwen3, aunque no hay evaluaciones publicadas específicas.
- Soporte de tool calling y function calling: no disponible en la documentación; depende de la implementación base de Qwen3, que sí lo soporta, pero no se confirma para esta variante.
- Capacidades multilingües: no confirmadas para este modelo concreto; Qwen3 base soporta más de 30 idiomas, pero no hay datos específicos de Orion.
- Compatibilidad con llama.cpp: funciona con `llama-cli` y `llama-server`, lo que permite integrarse en pipelines locales, servidores HTTP y con herramientas como Ollama o LM Studio.
- Inferencia en dispositivos de baja potencia: su tamaño de 1,7B y cuantización Q5_K_S (1,3 GB) lo hacen apto para CPU, Mac con Apple Silicon y GPUs con 4 GB de VRAM.

## Casos de uso

- Asistente de chat local en privacidad: al ser un modelo pequeño y cuantizado, puede ejecutarse en un portátil o mini-PC sin conexión a internet, gestionando conversaciones multi-turno con contexto de hasta 4096 tokens, adecuado para un asistente personal que no dependa de servicios en la nube.
- Generación de código en entornos de desarrollo: aunque no se confirma soporte específico, un modelo de 1,7B de la familia Qwen3 puede usarse para autocompletar código simple, explicar fragmentos o generar scripts en Python, JavaScript, etc., en editores como VSCode mediante extensiones que integren llama.cpp.
- Chatbot de soporte técnico en una intranet: con su ventana de 4K tokens, puede gestionar consultas de documentación interna, responder preguntas frecuentes y derivar a un humano si no encuentra la respuesta, todo ello en un servidor local con llama-server.
- Traducción y resumen de documentos cortos: aunque no se confirma el soporte multilingüe, la base Qwen3 suele funcionar bien en tareas de traducción y resumen; el modelo puede procesar párrafos de hasta 4K tokens en un único paso.
- Prototipado de agentes con tool calling: si se confirma que hereda el soporte de function calling de Qwen3, se puede usar para construir agentes simples que llamen a APIs externas (búsqueda, calendario, etc.) en un entorno de desarrollo con recursos limitados.
- Inferencia en CPU en servidores de baja capacidad: gracias a la cuantización Q5_K_S y al soporte de llama.cpp, puede desplegarse en un VPS de 2 GB de RAM, sin GPU, para servir endpoints de chat básicos o tareas de clasificación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de rendimiento y la búsqueda web tampoco arroja datos de MMLU, HumanEval o GSM8K para esta variante específica. Se recomienda evaluar el modelo en las tareas concretas del proyecto antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: ~3 GB para inferencia con cuantización Q5_K_S (según ficha de free2aitools), aunque el tamaño del archivo es de 1,3 GB, la VRAM necesaria incluye contexto y buffers de cálculo.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más, como NVIDIA GTX 1650, RTX 3050, RTX 4090 (sobra), o incluso iGPU con 6 GB de memoria compartida.
- Compatibilidad con CPU: puede ejecutarse en CPU con 8 GB de RAM, aunque la velocidad será menor (típicamente 5-10 tokens/s en un CPU moderno de 8 núcleos).
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), LM Studio, y cualquier herramienta que soporte GGUF.
- Latencia y throughput: no hay datos publicados; en una GPU de gama media (RTX 3060) se puede esperar 30-50 tokens/s con contexto de 4K, pero es una estimación sin confirmación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orion-Qwen3-1.7B-SFT-v2608 (GGUF) | 1,72B | 4.096 | Q5_K_S, IQ4_XS, Q8_0 | Apache 2.0 (sin confirmar) | HuggingFace |
| Qwen3-1.7B (original) | 1,72B | 32.768 | safetensors, GGUF | Apache 2.0 | HuggingFace |
| Qwen3-0.6B (original) | 0,6B | 32.768 | safetensors, GGUF | Apache 2.0 | HuggingFace |

Nota: La comparativa se basa en la familia Qwen3. El modelo Orion es un fine-tuning de Qwen3-1.7B, pero no hay datos públicos de su rendimiento frente al modelo base. La ventana de contexto de 4K es menor que la de Qwen3-1.7B original (32K), lo que sugiere que el SFT podría haber reducido el contexto durante el entrenamiento.

## Limitaciones y advertencias

- Sin datos de sesgos ni alucinaciones: no hay estudios de evaluación de sesgos o alucinación para este modelo concreto; se recomienda validar las respuestas en tareas críticas.
- Contexto limitado a 4.096 tokens: inferior a los 32K de Qwen3-1.7B original, lo que limita el procesamiento de documentos largos o conversaciones extensas.
- Licencia no confirmada: la model card no especifica licencia; aunque free2aitools indica Apache 2.0, no hay confirmación oficial, lo que puede afectar el uso comercial.
- Sin benchmarks públicos: no se puede comparar el rendimiento real con otros modelos de la misma categoría sin evaluaciones propias.
- Modelo de 1.7B: su tamaño pequeño implica menor capacidad de razonamiento complejo y de generación de código avanzado en comparación con modelos de 7B o más.
- Fecha de creación futura: el repositorio indica fecha de creación 2026-08-26, lo que sugiere que la información puede ser generada o proyectada, no verificada.
- Riesgo de sobreajuste: al ser un SFT sobre una variante específica (v2608), puede estar especializado en un dominio concreto no documentado, lo que podría degradar el rendimiento en tareas generales.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/shoutmon/Orion-Qwen3-1.7B-SFT-v2608-Q5_K_S-GGUF
- Modelo base original: https://huggingface.co/3tic/Orion-Qwen3-1.7B-SFT-v2608
- Otras cuantizaciones del mismo autor:
  - IQ4_XS: https://huggingface.co/shoutmon/Orion-Qwen3-1.7B-SFT-v2608-IQ4_XS-GGUF
  - Q8_0: https://huggingface.co/shoutmon/Orion-Qwen3-1.7B-SFT-v2601-Q8_0-GGUF
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
