# GermannM/Kenga

## Resumen

Kenga es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por GermannM (Germán Yantaras), creador del lenguaje de programación Kenga y del sistema Z. Se trata de un fine-tune de la arquitectura Qwen2 (etiquetado como `qwen2` en HuggingFace) entrenado con QLoRA sobre un corpus de 660 diálogos en ruso e inglés. Su característica principal es una identidad inyectada de forma deliberada: el modelo se presenta como "Kenga", con una personalidad definida, valores patrióticos rusos y conocimiento de un lenguaje de programación propio llamado Kenga.

El modelo está diseñado para ser eficiente en CPU, sin necesidad de cuantización para inferencia, y admite una ventana de contexto de hasta 32.000 tokens. Su relevancia radica en su enfoque de "modelo con identidad" y su capacidad para ejecutarse en hardware doméstico, lo que lo hace interesante para experimentos de chatbots personalizados y aplicaciones de bajo coste. Sin embargo, su entrenamiento es muy reducido (660 diálogos) y sus capacidades generales son limitadas en comparación con modelos de tamaño similar entrenados con corpus masivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32K tokens |
| Tipos de cuantizacion | no disponible (el autor indica que no se requiere para CPU) |
| Idiomas soportados | ruso (principal), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder de Qwen2, con 1,5B parámetros. El entrenamiento se realizó mediante QLoRA sobre un corpus de 660 diálogos, con 3 épocas. El corpus se divide en seis categorías: identidad (66 pares), Rusia y valores (218 pares), lenguaje Kenga (102 pares), sistema Z (52 pares), ruso (100 pares) y conocimientos generales (105 pares). No se menciona el uso de RLHF ni DPO; el ajuste se limita a la inyección de personalidad y conocimientos específicos mediante el fine-tune supervisado.

La innovación principal no es arquitectónica, sino de diseño: el modelo incorpora una identidad persistente que responde de forma consistente a preguntas sobre quién es, quién lo creó y qué valores defiende. Además, conoce el lenguaje de programación Kenga y el sistema Z, conceptos propios del autor. El entrenamiento es extremadamente ligero, lo que explica su bajo coste computacional y su compatibilidad con CPU.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con respuestas directas y cortas.
- Identidad persistente: responde "soy Kenga" y conoce a su creador (Germán).
- Conocimiento del lenguaje de programación Kenga: puede escribir programas en ese lenguaje.
- Conocimiento del sistema Z: espectros, pasaportes espectrales, transferencia de estado entre soportes.
- Valores explícitos: patriotismo ruso, apoyo a valores familiares tradicionales, respeto por la historia y cultura rusas.
- Funcionamiento eficiente en CPU, sin necesidad de GPU ni cuantización.
- Soporte de chat multi-turno mediante plantilla de chat (apply_chat_template).
- No se menciona soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Chatbot personal con identidad fija: el modelo puede integrarse en aplicaciones de mensajería o asistentes virtuales donde se requiera una personalidad consistente y definida, como un personaje de ficción o un asistente con valores específicos.
- Experimentación educativa sobre fine-tuning con QLoRA: su pequeño tamaño y su entrenamiento reducido lo convierten en un ejemplo didáctico para estudiar cómo se inyecta identidad y conocimiento en un LLM.
- Prototipado de aplicaciones en ruso de bajo coste: al funcionar en CPU, es adecuado para entornos sin GPU, como portátiles o servidores modestos, para generar respuestas en ruso con contexto limitado.
- Generación de código en el lenguaje Kenga: para desarrolladores interesados en ese lenguaje de programación, el modelo puede servir como asistente de escritura de código básico.
- Investigación sobre modelos con sesgo ideológico explícito: su diseño permite estudiar cómo los valores inyectados afectan a las respuestas y a la coherencia del modelo.
- Demostración de despliegue local con Transformers: sirve como ejemplo de carga y uso de un modelo de 1,5B con la librería `transformers` en un entorno sin aceleración por hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparaciones cuantitativas con otros modelos. La única afirmación de rendimiento es la del propio autor: "seis veces más pequeño que ChatGPT" (sin especificar a qué versión se refiere) y que funciona en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,5B, en FP16 ocuparía aproximadamente 3 GB de VRAM. En CPU, el uso de RAM sería similar (alrededor de 3 GB para los pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) puede ejecutarlo cómodamente. También funciona en CPU sin problemas, según el autor.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de gama media y baja.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, así como con `text-generation-inference` (según las etiquetas). También puede usarse con `llama.cpp` o `Ollama` si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se proporcionan datos. En CPU, se espera una generación lenta (del orden de 1-5 tokens por segundo en un procesador moderno), mientras que en GPU sería mucho más rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GermannM/Kenga | 1,5B | 32K | ru, en | Apache-2.0 | Fine-tune de Qwen2 con identidad inyectada, entrenado con 660 diálogos |
| Qwen2-1.5B | 1,5B | 32K | multilingue (incl. ru, en) | Apache-2.0 | Modelo base, entrenado con corpus masivo, sin identidad específica |
| Llama-3.2-1B | 1,2B | 128K | multilingue (incl. en, no ru) | Llama 3.2 Community License | Modelo base de Meta, más capaz en tareas generales, pero sin enfoque en ruso |
| TinyLlama-1.1B | 1,1B | 2K | en, multilingue limitado | Apache-2.0 | Modelo compacto, entrenado con 3T tokens, sin identidad |

Kenga se diferencia por su identidad y su enfoque en ruso, pero es muy inferior en capacidades generales a los modelos base de su mismo tamaño, debido a su entrenamiento extremadamente reducido. No es comparable en rendimiento a modelos como Qwen2-1.5B o Llama-3.2-1B para tareas de razonamiento, código o conocimiento general.

## Limitaciones y advertencias

- Entrenamiento muy limitado: solo 660 diálogos, lo que restringe severamente su conocimiento general y su capacidad de razonamiento. Puede alucinar con frecuencia fuera de los temas cubiertos.
- Sesgo ideológico explícito: el modelo tiene una postura patriótica rusa y valores tradicionales inyectados de forma intencionada. Esto puede generar respuestas sesgadas en temas políticos, sociales o históricos.
- Riesgo de alucinación: al ser un fine-tune pequeño, es propenso a inventar hechos, especialmente en áreas no cubiertas por el corpus de entrenamiento.
- Idioma principal: está optimizado para ruso; su inglés es limitado y puede producir respuestas gramaticalmente incorrectas o poco naturales.
- Sin soporte de herramientas ni agentes: no se menciona tool calling ni integración con APIs externas.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el contenido generado puede reflejar los sesgos del modelo, lo que podría ser problemático en aplicaciones profesionales.
- No sustituye asesoramiento legal o médico: el propio autor lo advierte en la model card.
- Reputación y confiabilidad: el modelo proviene de un autor individual y no tiene métricas de evaluación independientes; su uso en producción requiere validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/Kenga
- Repositorio del lenguaje Kenga: https://github.com/GermannM3/kenga-lang
- Repositorio del sistema Z: https://github.com/GermannM3/z-system
- Perfil del autor en GitHub: https://github.com/GermannM3
- Otros modelos del autor: https://huggingface.co/GermannM/kenga-prophet y https://huggingface.co/GermannM/kenga-prophet-m2-k16
