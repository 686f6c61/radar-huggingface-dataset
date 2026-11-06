# K-Ai-Official/MiRAI-4B

## Resumen

MiRAI-4B es un ajuste fino (fine-tune) del modelo Qwen3-4B desarrollado por K-AI, una startup de inteligencia artificial de Indonesia. Se trata de un asistente conversacional multilingue de pequeno tamano disenado especificamente para operar en ingles, bahasa indonesio y japones, tres idiomas que rara vez se cubren conjuntamente en modelos de esta escala. El modelo se presenta como la version v0.1 de la familia K-AI y esta pensado como una base ligera para despliegues con recursos limitados.

La relevancia del modelo radica en su enfoque: en lugar de competir por capacidades generales con modelos de mayor tamano, MiRAI-4B se posiciona como un asistente regionalizado que preserva el conocimiento del Qwen3-4B original mientras refuerza la identidad propia y la cobertura del indonesio y el japones. Con 4.022 millones de parametros, licencia Apache 2.0 y pesos en safetensors, es directamente desplegable en infraestructura convencional e incluso en GPU de consumo.

No obstante, conviene contextualizar sus expectativas: el entrenamiento se realizo con aproximadamente 1.500 ejemplos por idioma mediante QLoRA de 4 bits sobre una GPU T4 gratuita de Google Colab durante 400 pasos. Esto lo situa como un experimento temprano y ligero, no como un modelo de produccion de alta fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible de forma explicita; los pesos se publican en 16-bit tras fusionar el adaptador LoRA |
| Idiomas soportados | Ingles (en), indonesio (id), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

MiRAI-4B hereda la arquitectura del transformer decoder-only de Qwen3-4B, sin modificaciones estructurales. El ajuste se realizo mediante QLoRA de 4 bits con la libreria Unsloth, con un rango LoRA de r=16, y posteriormente el adaptador se fusiono en los pesos base en 16 bits. El entrenamiento se ejecuto en una unica GPU T4 gratuita de Google Colab durante 400 pasos, con batch de 2, acumulacion de gradientes de 4 y tasa de aprendizaje de 2e-4.

El corpus de entrenamiento consta de aproximadamente 1.500 ejemplos por idioma: `yahma/alpaca-cleaned` para ingles, `FreedomIntelligence/alpaca-gpt4-indonesian` para indonesio y `FreedomIntelligence/alpaca-gpt4-japanese` para japones, complementado con ejemplos de identidad escritos manualmente en los tres idiomas para que el modelo se presente como MiRAI. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, indonesio y japones.
- Asistencia general siguiendo el formato de instrucciones tipo Alpaca (preguntas y respuestas, explicaciones, resumenes).
- Identidad propia consolidada: el modelo se presenta como MiRAI y describe su naturaleza multilingue en los tres idiomas.
- Modo de pensamiento (thinking) desactivable mediante `enable_thinking=False` en la plantilla de chat, heredado de Qwen3.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- No dispone de entrenamiento especifico para tool calling ni function calling.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Asistente conversacional regional para Indonesia y Japon: el modelo puede gestionar dialogos multi-turno en bahasa indonesio y japones de forma nativa, lo que lo hace adecuado para prototipos de atencion al usuario en esos mercados sin necesidad de un modelo mayor.
- Chatbot de soporte en ingles con identidad de marca: al estar entrenado con ejemplos de identidad, puede presentarse consistentemente como MiRAI en despliegues de demo o productos internos de K-AI.
- Prototipado rapido en entornos con GPU limitada: sus 4B parametros permiten iterar en una sola GPU de consumo, ideal para validar ideas de producto antes de escalar a modelos mayores.
- Generacion de contenido multilingue para marketing: redaccion de textos breves y respuestas en los tres idiomas cubiertos, con la salvedad de que la calidad varia por idioma.
- Educacion y practica de idiomas: puede servir como interlocutor basico para practicar indonesio o japones en un contexto conversacional controlado.
- Base para fine-tunes especificos: al ser Apache 2.0 y de tamano reducido, es un punto de partida economico para ajustes adicionales en dominios concretos con LoRA.
- Despliegue en local para pruebas de integracion: compatible con transformers y text-generation-inference, util para validar pipelines antes de migrar a modelos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16-bit: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5-3,5 GB.
- GPU recomendadas para 16-bit: A100, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 en 16-bit; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o T4 16 GB mediante cuantizacion.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (etiqueta `text-generation-inference` presente), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiRAI-4B | ~4B | no disponible | en, id, ja | Apache 2.0 | Fine-tune QLoRA de Qwen3-4B, v0.1, entrenamiento ligero |
| Qwen3-4B (base) | ~4B | no disponible en esta ficha | multilingue amplio | Apache 2.0 | Modelo original; mayor cobertura idiomatica y entrenamiento mas extenso |
| Otros fine-tunes de Qwen3-4B | ~4B | variable | variable | segun autor | Ecosistema amplio de adaptaciones comunitarias |

La comparacion directa con alternativas especificas de la misma categoria (asistentes multilingues de 4B enfocados a indonesio y japones) no esta disponible en la informacion proporcionada. Frente a su modelo base Qwen3-4B, MiRAI-4B gana identidad propia y enfoque regional, pero parte de un corpus de entrenamiento mucho menor.

## Limitaciones y advertencias

- Version temprana (v0.1): el propio autor advierte que puede cometer errores y afirmar datos falsos con seguridad.
- Corpus de entrenamiento pequeno (~1.500 ejemplos por idioma) y parcialmente generado por maquina, lo que produce respuestas genericas y calidad desigual entre idiomas.
- No entrenado para tool calling ni function calling; no debe usarse en pipelines de agentes que dependan de llamadas a herramientas.
- No apto para decisiones medicas, legales o financieras.
- Riesgo de alucinacion inherente a modelos de 4B con ajuste ligero.
- La licencia de los pesos es Apache 2.0, pero el autor recomienda verificar las licencias de los datasets de entrenamiento antes de un uso comercial.
- No se documentan sesgos especificos, pero al derivar de Qwen3-4B y de datasets generados por GPT-4, puede heredar sesgos de esas fuentes.
- Cobertura idiomatica limitada a en, id y ja; el rendimiento fuera de esos idiomas no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-Ai-Official/MiRAI-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Web de K-AI: https://kai-official.netlify.app/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset FreedomIntelligence/alpaca-gpt4-indonesian: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
- Dataset FreedomIntelligence/alpaca-gpt4-japanese: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
