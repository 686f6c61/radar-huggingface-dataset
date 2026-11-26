# KRAFTON/Raon-1-nano-litert-lm

## Resumen

Raon-1 nano (LiteRT-LM) es la variante empaquetada para LiteRT-LM del modelo Raon-1 nano, un modelo de lenguaje denso de 3,2B parámetros desarrollado por KRAFTON AI. Este repositorio concreto no contiene los pesos originales en precisión completa, sino un bundle optimizado para despliegue en dispositivo (on-device) con pesos cuantizados a 4 bits mediante GPTQ y activaciones en fp16, pensado para ejecutarse a través del runtime LiteRT-LM.

El modelo base emplea una arquitectura híbrida de atención: 18 capas de Raon Delta Attention (atención lineal con estado recurrente de tamaño fijo) y 6 capas de Gated MLA, sobre 24 capas totales con un tamaño oculto de 1.536. Incorpora innovaciones propias como Raon-mHC (una versión optimizada de las manifold-constrained hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones, además de embeddings atados entre entrada y LM head.

La relevancia de esta variante LiteRT-LM radica en que reduce el modelo a un paquete de 1,8 GB listo para inferencia local, con una ventana de contexto recortada a 4.096 tokens (frente a los 262.144 del modelo base) y sin modo de razonamiento (responde sin thinking). Está publicada bajo licencia Apache 2.0, lo que facilita su integración comercial en aplicaciones móviles y de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas Raon Delta Attention + 6 capas Gated MLA), Raon-mHC con 4 streams residuales, embeddings por capa, NoPE |
| Parametros totales | 3,2B (incluye tabla de embeddings por capa de 1,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en este bundle LiteRT-LM (262.144 tokens en el modelo base) |
| Tipos de cuantizacion | Pesos 4 bits (GPTQ) con activaciones fp16 |
| Idiomas soportados | Coreano e inglés (según model card del modelo base); no se detallan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle LiteRT-LM (librería litert-lm); el modelo base ofrece también GGUF, MLX 4-bit y safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo base Raon-1 nano es un transformer denso de 24 capas con tamaño oculto 1.536 y FFN intermedio de 6.144 con activación SwiGLU. La atención es híbrida en proporción 3:1: 18 capas usan Raon Delta Attention, una atención lineal con regla delta y puertas separadas de borrado y escritura que mantiene un estado recurrente de tamaño fijo, mientras que 6 capas usan Gated MLA con 32 cabezas y dimensiones de 192 (QK) y 128 (V). Solo las capas MLA conservan caché KV, aproximadamente 7 KiB por token en BF16. El vocabulario es de 259.840 tokens y el LM head está atado al embedding de entrada. No se emplea codificación posicional (NoPE).

Como innovaciones destacables, Raon-mHC reduce el coste computacional de las manifold-constrained hyper-connections de DeepSeek para acelerar el entrenamiento, y cada capa dispone de un embedding propio de 256 dimensiones que ajusta su salida tras el MLP. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Esta variante LiteRT-LM aplica cuantización GPTQ a 4 bits sobre los pesos del modelo base y recorta la ventana de contexto a 4.096 tokens.

## Capacidades

- Generación de texto conversacional multi-turno en coreano e inglés.
- Seguimiento de instrucciones (instruction following) y respuesta a preguntas de conocimiento.
- Llamada a herramientas (tool calling / function calling), según la model card del modelo base.
- Capacidades de agente y razonamiento multi-paso (la model card recomienda parámetros de muestreo específicos para uso agéntico y de código).
- Generación de código, con ajustes de muestreo recomendados distintos a los de chat general.
- Modo de razonamiento (thinking): disponible por defecto en el modelo base a través de la plantilla de chat, pero desactivado en este bundle LiteRT-LM, que responde sin thinking.
- Despliegue on-device: empaquetado para el runtime LiteRT-LM.

## Casos de uso

- Asistentes locales en dispositivos móviles o de borde: el bundle de 1,8 GB con pesos de 4 bits permite ejecutar el modelo en hardware con recursos limitados mediante LiteRT-LM, sin depender de la nube.
- Aplicaciones de chat en coreano e inglés: el modelo está diseñado para mantener contexto conversacional en ambos idiomas, adecuado para asistentes bilingües integrados en apps.
- Automatización de tareas con tool calling: la capacidad de function calling del modelo base permite orquestar APIs y servicios desde un asistente embebido.
- Generación de código asistida en entornos locales: con los parámetros de muestreo recomendados para código (temperature 1.0, presence_penalty 0.0), puede integrarse en editores o herramientas de desarrollo de escritorio.
- Prototipado rápido y demos sin infraestructura GPU: el formato LiteRT-LM y la licencia Apache 2.0 facilitan pruebas de concepto y distribución comercial.
- Procesamiento de documentos cortos o consultas de conocimiento: con 4.096 tokens de contexto, es adecuado para resúmenes y Q&A sobre fragmentos acotados de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base incluye una imagen de resultados de benchmarks, pero los valores numéricos no están disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 1,8 GB con pesos de 4 bits; se requiere memoria adicional para activaciones fp16 y el estado recurrente de las capas RDA.
- GPU recomendadas: no disponible en la información proporcionada para este bundle LiteRT-LM.
- Ejecución en GPU de consumo: no confirmado para este bundle; el modelo base dispone de variantes GGUF (llama.cpp) y MLX 4-bit para Apple silicon que sí están orientadas a hardware de consumo.
- Opciones de despliegue: LiteRT-LM (este bundle); el modelo base soporta además Transformers, vLLM, llama.cpp y MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos de despliegue |
|---|---|---|---|---|
| Raon-1 nano (LiteRT-LM) | 3,2B denso | 4.096 tokens (bundle); 262.144 en base | Apache 2.0 | LiteRT-LM |
| Raon-1 nano (base) | 3,2B denso | 262.144 tokens | Apache 2.0 | Transformers, vLLM, llama.cpp, MLX, LiteRT-LM |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de información sobre modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Contexto reducido: este bundle limita la ventana a 4.096 tokens, muy inferior a los 262.144 tokens del modelo base; no es adecuado para tareas de contexto largo.
- Sin modo de razonamiento: el bundle LiteRT-LM responde sin thinking, lo que puede reducir el rendimiento en tareas que se benefician de razonamiento explícito.
- Idiomas: solo se documentan coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fiabilidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros del runtime LiteRT-LM.
- Cuantización: los pesos a 4 bits pueden degradar la calidad frente al modelo base en precisión completa; no se han publicado comparativas de degradación.

## Enlaces

- Hugging Face (este bundle): https://huggingface.co/KRAFTON/Raon-1-nano-litert-lm
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Página de KRAFTON AI: https://krafton.ai/en/
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
