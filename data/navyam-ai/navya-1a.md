# navyam-ai/navya-1a

## Resumen

Navya-1a es un modelo de fundación financiera centrado en India, desarrollado por Navyam AI (Bachatt). Forma parte de la familia Navya y ha sido entrenado desde cero sobre un corpus India-first que combina finanzas, inglés, hindi/hinglish y otras lenguas indias. Su objetivo principal es responder preguntas de finanzas personales en el contexto indio, aunque la model card lo describe como modelo de investigación y no como consejo de inversión.

Se trata de un modelo base de segunda generación, con un tokenizador personalizado de 64k tokens y licencia Apache-2.0. Según los datos de HuggingFace, el modelo tiene 151.020.288 parámetros en formato safetensors, aunque la model card indica aproximadamente 100M. La arquitectura parece ser un transformer basado en Llama, según los tags del repositorio. La longitud de contexto no está especificada en la información disponible.

Su relevancia radica en ser un modelo pequeño, de libre acceso y entrenado específicamente para el dominio financiero indio, lo que lo convierte en un punto de partida barato para tareas de NLP financiera en inglés e hindi.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (el tag 'llama' sugiere una arquitectura similar a Llama) |
| Parametros totales | 151.020.288 (según safetensors; la model card indica ~100M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés, hindi/hinglish y otras lenguas indias (según la model card; metadatos de HuggingFace: en, hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

Navya-1a es un modelo base de segunda generación de la familia Navya, desarrollado por Navyam AI (Bachatt). Se trata de un transformer causal entrenado desde cero, sin técnicas de alineamiento como RLHF o DPO mencionadas en la información disponible. El corpus de entrenamiento es India-first e incluye finanzas, inglés, hindi/hinglish y otras lenguas indias. El tokenizador es personalizado y tiene un tamaño de 64k tokens. El número de tokens de entrenamiento no se ha revelado. La arquitectura sigue el patrón de Llama, según los tags de HuggingFace, aunque no se especifican detalles como el número de capas o cabezas de atención.

## Capacidades

- Generación de texto en inglés e hindi/hinglish, con especialización en finanzas personales del mercado indio.
- Modelo base: no ha sido entrenado para seguir instrucciones ni para tareas de chat; requiere fine-tuning o prompting cuidadoso para obtener respuestas útiles.
- No se indica soporte de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües limitadas a inglés e hindi (y otras lenguas indias según la model card).
- Tokenizador personalizado de 64k, lo que puede mejorar la eficiencia de codificación para textos en hindi y términos financieros.

## Casos de uso

- Atención al cliente para entidades financieras indias: el modelo puede integrarse en un chatbot que responda preguntas frecuentes sobre cuentas, préstamos o tarjetas en inglés o hindi. Es adecuado porque su entrenamiento en corpus financieros indios le permite reconocer terminología local, aunque requeriría fine-tuning para el tono y las políticas de cada entidad.
- Asistente de finanzas personales: responde consultas sobre ahorro, inversión y presupuesto familiar. Su enfoque India-first lo hace útil para productos como PPF, SIP o ELSS. Adecuado para prototipos o aplicaciones de bajo coste, no para asesoramiento financiero real.
- Análisis de sentimiento en noticias financieras: puede clasificar el tono de artículos o tuits en inglés/hindi sobre el mercado indio. Su pequeño tamaño permite procesar grandes volúmenes con baja latencia.
- Resumen de documentos financieros: puede condensar informes anuales, extractos bancarios o comunicados de prensa. Es adecuado para tareas de extracción de información en las que no se requiere un razonamiento complejo.
- Educación financiera en hindi: puede generar contenido explicativo sobre conceptos básicos de finanzas para audiencias rurales o urbanas. El tokenizador de 64k y el corpus en hindi facilitan la generación de texto natural en ese idioma.
- Base para fine-tuning en NLP financiera india: al ser un modelo base pequeño y con licencia Apache-2.0, es un punto de partida barato para entrenar modelos especializados en tareas como clasificación de transacciones, extracción de entidades financieras o detección de fraude.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 151M parámetros, el modelo ocupa aproximadamente 604 MB en FP32, 302 MB en FP16 y 151 MB en 8-bit. Cabe en cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es más que suficiente. Para despliegue en producción, basta con una GPU de gama baja o una CPU con suficiente RAM.
- Si cabe en consumer GPU: sí, en cualquier GPU de consumo actual.
- Opciones de despliegue: transformers, llama.cpp (previa conversión a GGUF), Ollama, vLLM y TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente para una comparativa rigurosa con modelos similares. Los modelos de tamaño comparable (por ejemplo, GPT-2 de 124M o Pythia-160m) no comparten el enfoque India-first ni el dominio financiero, y no hay datos de rendimiento publicados para navya-1a.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha sido entrenado con RLHF/DPO, por lo que puede producir respuestas no deseadas o difíciles de controlar.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información financiera incorrecta o inventada. La model card indica explícitamente que no es consejo de inversión.
- Sesgos culturales y de mercado: al estar entrenado en un corpus India-first, puede reflejar sesgos propios del contexto indio y tener un rendimiento inferior en otros mercados o idiomas.
- Limitaciones de idioma: los metadatos de HuggingFace solo indican en y hi; el rendimiento en otras lenguas indias no está garantizado.
- Longitud de contexto no especificada: se desconoce la ventana de contexto, lo que limita su uso en tareas que requieren mucho contexto.
- Licencia: Apache-2.0 permite uso comercial, pero la model card lo describe como modelo de investigación; debe evaluarse cuidadosamente antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/navyam-ai/navya-1a
- Código (GitHub): https://github.com/bachatt-app/navyam-gpt
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
