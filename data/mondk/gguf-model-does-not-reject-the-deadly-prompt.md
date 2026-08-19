# mondk/GGUF.model-does-not-reject-the-deadly-prompt

## Resumen

El modelo `mondk/GGUF.model-does-not-reject-the-deadly-prompt` es una versión cuantizada en formato GGUF del modelo `mondk/model-does-not-reject-the-deadly-prompt`, un ajuste fino de `TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill`. Su propósito declarado es responder a prompts maliciosos con humor y explicaciones educativas en lugar de rechazarlos de forma directa, una aproximación poco habitual en modelos de seguridad. Está pensado para entornos de red teaming y educación en ciberseguridad.

El modelo base es un Qwen3 de 4 mil millones de parámetros con capacidad de razonamiento (thinking), sobre el que se ha realizado un ajuste fino con un dataset propio de seguridad (`mondk/joke-redteam-safety-dataset`). La versión GGUF reduce el tamaño a 2,9 GB, lo que permite su ejecución en hardware de consumo. La licencia es Apache 2.0, lo que facilita su uso comercial y modificaciones.

Aunque la idea es interesante para investigación y demostraciones, hay que tener precaución: al no rechazar prompts dañinos, puede generar contenido inapropiado si se usa sin control. No se han publicado benchmarks ni detalles técnicos del entrenamiento más allá de los datos básicos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B-Thinking) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3 soporta hasta 32 000 tokens, no confirmado) |
| Tipos de cuantizacion | GGUF (esquema exacto no especificado; el tamano del repo sugiere Q4 o similar) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill`, un Qwen3 de 4B con capacidad de razonamiento (thinking mode) destilado de GPT-5.1 Codex Max. Sobre esta base se ha realizado un ajuste fino supervisado utilizando el dataset `mondk/joke-redteam-safety-dataset`, orientado a que el modelo responda con humor y explique los prompts maliciosos de forma educativa en lugar de rechazarlos. No se han publicado detalles sobre el numero de tokens de entrenamiento, el metodo exacto (SFT, RLHF, DPO) ni las tecnicas de optimizacion empleadas. El repositorio menciona la herramienta `unsloth` como parte del flujo de trabajo, lo que sugiere un ajuste fino eficiente en memoria.

La arquitectura subyacente es la de Qwen3, un transformer denso con atencion estandar y capacidad de razonamiento explicito. Al ser una version GGUF, el modelo se distribuye cuantizado para inferencia eficiente en CPU y GPU de baja gama.

## Capacidades

- Generacion de texto en ingles con tono humoristico y didactico.
- Explicacion educativa de prompts maliciosos o peligrosos, desglosando su intencion y posibles riesgos.
- Razonamiento basico heredado del modelo base Qwen3-Thinking, aunque no se garantiza que se active en todas las respuestas.
- No se ha confirmado soporte para tool calling, function calling ni capacidades multimodales.
- No se ha confirmado soporte para otros idiomas distintos del ingles.
- Capacidad de mantener conversaciones multi-turno, aunque la longitud de contexto no esta documentada.

## Casos de uso

- Educacion en ciberseguridad: el modelo puede utilizarse en cursos o talleres para mostrar como funcionan los ataques de prompt injection o jailbreak, explicando cada paso de forma amena y segura.
- Red teaming interno: equipos de seguridad pueden emplearlo para generar respuestas alternativas a prompts maliciosos y evaluar la robustez de sus propios sistemas frente a respuestas no convencionales.
- Desarrollo de asistentes con personalidad humoristica: sirve como base para chatbots que responden con ironia y desenfado, aunque habria que supervisar su salida para evitar contenido inapropiado.
- Analisis de prompts maliciosos: puede usarse para clasificar o explicar la intencion de prompts sospechosos en entornos de investigacion, generando descripciones legibles para analistas.
- Demostraciones de seguridad en conferencias o workshops: su comportamiento no estandar lo hace util para ilustrar los limites de los modelos de lenguaje frente a ataques adversariales.
- Generacion de contenido satirico sobre seguridad: el modelo puede crear ejemplos de respuestas humoristicas a intentos de explotacion, utiles para divulgacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 2,9 GB, por lo que con cuantizacion Q4 se puede ejecutar en GPUs con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050). Para margen y mayor velocidad se recomiendan 6-8 GB.
- GPU recomendadas: NVIDIA GTX 1660, RTX 2060, RTX 3060, RTX 4060 o superiores. Tambien funciona en CPU con 8-16 GB de RAM, aunque con menor velocidad.
- Despliegue: compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 3060 se puede esperar una generacion de 20-40 tokens por segundo con cuantizacion Q4, dependiendo del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| mondk/GGUF.model-does-not-reject-the-deadly-prompt | 4,02 B | No disponible | Apache 2.0 | GGUF | Humor y educacion en prompts maliciosos |
| TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill | 4,02 B | 32 000 (tipico en Qwen3) | Apache 2.0 | Safetensors | Razonamiento general y codigo |
| Qwen3-4B (original) | 4 B | 32 000 | Apache 2.0 | Safetensors/GGUF | Modelo base generalista |

La comparativa se limita a las caracteristicas publicadas. No hay datos de rendimiento para este modelo concreto.

## Limitaciones y advertencias

- El modelo esta disenado para no rechazar prompts maliciosos, lo que puede generar contenido inapropiado, ofensivo o peligroso si se usa sin supervision. No debe desplegarse en produccion sin filtros adicionales.
- La licencia Apache 2.0 permite uso comercial, pero el responsable final del contenido generado es el usuario. Hay que evaluar los riesgos legales y eticos antes de integrarlo en un producto.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- La longitud de contexto no esta documentada, lo que dificulta prever el comportamiento en conversaciones largas.
- No se han publicado benchmarks, por lo que no es posible comparar su calidad objetivamente con otros modelos.
- El dataset de entrenamiento es de tematica de seguridad y humor; puede contener sesgos o ejemplos extremos que afecten a la neutralidad del modelo.
- Al ser una version cuantizada, puede haber una ligera perdida de calidad respecto al modelo original en safetensors.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mondk/GGUF.model-does-not-reject-the-deadly-prompt
- Modelo base (safetensors): https://huggingface.co/mondk/model-does-not-reject-the-deadly-prompt
- Dataset de entrenamiento: https://huggingface.co/datasets/mondk/joke-redteam-safety-dataset
- Modelo base original: https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill
