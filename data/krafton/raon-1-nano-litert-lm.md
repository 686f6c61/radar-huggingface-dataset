# KRAFTON/Raon-1-nano-litert-lm

## Resumen

Raon-1 nano (LiteRT-LM) es el paquete de despliegue en formato LiteRT-LM del modelo Raon-1 nano, un modelo de lenguaje denso de 3.200 millones de parámetros desarrollado por KRAFTON AI. Este repositorio concreto no contiene el modelo original, sino una versión cuantizada a 4 bits (GPTQ) con activaciones en fp16, empaquetada para ejecutarse con la librería `litert-lm`, orientada a inferencia en dispositivo. La versión LiteRT-LM responde sin modo de razonamiento (thinking) y limita la ventana de contexto a 4.096 tokens, frente a los 262.144 tokens del modelo base.

El modelo base emplea una arquitectura híbrida de atención: 18 capas de Raon Delta Attention (atención lineal con estado recurrente de tamaño fijo) y 6 capas de Gated MLA (atención completa con caché KV). Incluye innovaciones propias como Raon-mHC (una variante optimizada de las manifold-constrained hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones. Está diseñado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas en coreano e inglés.

Su relevancia actual radica en la combinación de un modelo compacto de 3,2B con licencia Apache 2.0 y un empaquetado específico para despliegue local en dispositivos, lo que facilita la integración en aplicaciones sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, híbrida (Raon Delta Attention + Gated MLA) |
| Parametros totales | 3,2B (incluye tabla de embeddings por capa de 1,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (en este bundle LiteRT-LM); 262.144 tokens en el modelo base |
| Tipos de cuantizacion | Pesos 4 bits (GPTQ), activaciones fp16 |
| Idiomas soportados | Coreano e inglés (según la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (bundle empaquetado); el modelo base ofrece safetensors, GGUF y MLX 4 bits |

## Arquitectura y entrenamiento

El modelo base Raon-1 nano es un transformer denso de 24 capas con tamaño oculto de 1.536, función de activación SwiGLU y tamaño intermedio de FFN de 6.144. La atención es híbrida: 18 capas usan Raon Delta Attention (RDA), una atención lineal con regla delta y compuertas separadas de borrado y escritura con estado recurrente de tamaño fijo, mientras que 6 capas usan Gated MLA con caché KV de aproximadamente 7 KiB por token en BF16. Emplea codificación posicional NoPE (sin codificación posicional explícita), 16 cabezas para RDA y 32 para Gated MLA, con dimensión de cabeza de 128 para RDA y 192 QK / 128 V para MLA. El vocabulario es de 259.840 tokens y el LM head está atado (tied) a los embeddings de entrada.

Dos innovaciones destacan en el diseño: Raon-mHC, que reduce el coste computacional de las manifold-constrained hyper-connections de DeepSeek mediante cuatro flujos residuales, y los embeddings por capa, donde cada capa dispone de un embedding propio de 256 dimensiones por token que ajusta su salida tras el MLP. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y seguimiento de instrucciones en coreano e inglés.
- Mantenimiento de contexto conversacional multi-turno (hasta 4.096 tokens en este bundle).
- Llamada a herramientas (tool calling / function calling), según la model card.
- Razonamiento agéntico y multi-paso, con parámetros de muestreo recomendados específicos para tareas agénticas y de código.
- Modo de razonamiento (thinking) disponible en el modelo base, pero desactivado en esta versión LiteRT-LM, que responde directamente sin pensar.
- Capacidades multilingües limitadas a coreano e inglés.

## Casos de uso

- Asistentes conversacionales en dispositivo: el bundle LiteRT-LM está pensado para ejecutarse localmente, permitiendo asistentes de chat en coreano e inglés sin conexión a la nube, con un contexto de 4.096 tokens suficiente para conversaciones de varias interacciones.
- Automatización de tareas agénticas con llamada a herramientas: con los parámetros de muestreo recomendados para uso agéntico (temperature 1.0), puede integrarse en flujos que consulten APIs o ejecuten funciones.
- Generación de código en pipelines ligeros: el modelo base recomienda ajustes específicos para código y soporta tool calling, lo que permite integrarlo en asistentes de programación locales.
- Aplicaciones móviles y de borde: el empaquetado LiteRT-LM y la cuantización a 4 bits reducen los requisitos de memoria, facilitando su inclusión en apps para dispositivos con recursos limitados.
- Procesamiento de documentos cortos en coreano e inglés: resúmenes, extracción de información y clasificación de textos que quepan en la ventana de 4.096 tokens.
- Prototipado rápido de aplicaciones de IA generativa: al no requerir solicitud de acceso (repositorio no restringido) y tener licencia Apache 2.0, es adecuado para pruebas de concepto y evaluación interna.
- Atención al cliente automatizada en coreano: gestión de consultas frecuentes con respuestas directas (sin thinking) y baja latencia en despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base incluye una imagen con resultados de benchmarks, pero los valores numéricos no se proporcionan en el texto.

## Requisitos de hardware

- El repositorio ocupa 1,8 GB, lo que da una idea del tamaño del bundle cuantizado a 4 bits.
- VRAM estimada para inferencia: no disponible de forma explícita; un modelo de 3,2B en 4 bits requiere aproximadamente 2 GB de pesos, más overhead de activaciones y estado recurrente.
- GPU recomendadas: no disponible. El ecosistema LiteRT-LM está orientado a despliegue en dispositivo (móvil y borde), no a GPU de centro de datos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LiteRT-LM (este bundle); el modelo base soporta además Transformers, vLLM, llama.cpp, MLX y GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1 nano (LiteRT-LM) | 3,2B | 4.096 | Apache 2.0 | LiteRT-LM | Bundle en dispositivo, sin thinking |
| Raon-1 nano (base) | 3,2B | 262.144 | Apache 2.0 | safetensors, GGUF, MLX | Modelo completo con thinking |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación consultada.

## Limitaciones y advertencias

- La ventana de contexto de este bundle se limita a 4.096 tokens, muy inferior a los 262.144 tokens del modelo base; no es adecuado para documentos largos.
- El modo de razonamiento (thinking) está desactivado en esta versión, lo que puede reducir la calidad en tareas que requieren razonamiento complejo.
- Solo soporta coreano e inglés; no hay soporte confirmado para castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fiabilidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las dependencias (litert-lm).
- El repositorio tiene muy pocas descargas (3) y likes (2), lo que sugiere poca validación por parte de la comunidad.
- No se han publicado benchmarks numéricos en la información disponible, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano-litert-lm
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
