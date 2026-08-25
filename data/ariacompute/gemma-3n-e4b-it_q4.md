# ariacompute/gemma-3n-e4b-it_q4

## Resumen

Gemma-3n-E4B-IT es un modelo de lenguaje multimodal de aproximadamente 4 000 millones de parámetros desarrollado por Google, perteneciente a la familia Gemma 3n. Su backbone de texto emplea atención híbrida: 28 de 35 capas usan atención lineal de ventana deslizante con esparcimiento de activaciones, mientras que las 7 restantes son capas Laurel de atención completa de bajo rango. Incorpora activación GeGLU, atención por grupos (GQA) y proyecciones de entrada por capa, con una longitud de contexto nativa de 32 000 tokens. El modelo fue preentrenado sobre corpus web a gran escala (RedPajama, The Pile, The Stack) y alineado mediante instruction tuning y RLHF.

Esta distribución concreta, publicada por Aria Compute, es un *aria-quant-bundle*: un paquete cuantizado con preprocesado de Hadamard y cuantización por canal de 4 bits. Está optimizado para inferencia exclusiva en CPU, en dispositivos móviles, equipos de borde y placas de un solo chip, sin necesidad de GPU ni conexión a la nube. El bundle pesa aproximadamente 1,0 GB y consume alrededor de 1,1 GB de memoria en tiempo de ejecución con contexto de 4K. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (28 capas sliding-window linear attention + 7 capas Laurel full-attention), GeGLU, GQA (2 KV heads) |
| Parametros totales | ~4 000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (nativo) |
| Tipos de cuantizacion | 4-bit per-channel con Hadamard (este bundle); también disponible 8-bit per-channel (`q8_channel`) |
| Idiomas soportados | Inglés (principal), chino y 30+ idiomas adicionales (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-engine (formato propietario del bundle, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base, Gemma-3n-E4B-IT, emplea una arquitectura transformer decoder-only con atención híbrida. De las 35 capas, 28 utilizan atención lineal de ventana deslizante (ventana de 512 tokens) con esparcimiento de activaciones, lo que reduce drásticamente el coste de la caché KV; las 7 capas restantes son de atención completa de bajo rango (Laure), que permiten capturar dependencias globales. Esta combinación, junto con GQA de 2 cabezas KV, mantiene la caché KV compacta incluso a 32K de contexto. El preentrenamiento se realizó sobre corpus web a gran escala (RedPajama-Data-1T, The Pile, The Stack) y el modelo fue alineado mediante instruction tuning y RLHF.

La versión cuantizada de Aria Compute aplica un esquema de cuantización por canal de 4 bits con preprocesado de Hadamard sobre los pesos de atención (Q/K/V/O) y de las capas FFN (gate/up/down). Las normas RMSNorm y la tabla de embeddings se conservan en FP16. El proceso es *calibration-free*: no requiere datos de calibración específicos de tarea. El bundle resultante pesa ~1,0 GB frente a los ~7,8 GB del backbone en BF16.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés, chino y más de 30 idiomas.
- Completado de texto en tiempo real y generación de fragmentos de código básicos.
- Embeddings ligeros para recuperación y clasificación en el dispositivo.
- Resumen de notificaciones, mensajes y contenido local de formato corto.
- Análisis de documentos locales con contexto de hasta 32K tokens (procesamiento por fragmentos).
- Inferencia 100 % local en CPU, sin conexión a servidores externos.
- Este bundle es exclusivamente de texto: la entrada multimodal (imagen/audio) no está disponible en esta versión cuantizada.

## Casos de uso

- Asistentes conversacionales en el dispositivo: el modelo puede gestionar diálogos multi-turno con contexto de 32K tokens, manteniendo la caché KV compacta gracias a la atención híbrida, lo que permite ejecutarlo en smartphones de gama media con ~1 GB de memoria.
- Completado de texto y código en editores móviles: su capacidad de generar fragmentos de código y completar texto en tiempo real lo hace adecuado para aplicaciones de productividad en tablets y portátiles.
- Resumen de notificaciones y mensajes: puede condensar correos, mensajes y alertas en resúmenes breves, ejecutándose localmente sin enviar datos a la nube.
- Análisis de documentos locales: con 32K de contexto, puede procesar documentos largos por fragmentos y extraer información relevante en dispositivos de borde.
- Recuperación y clasificación de texto mediante embeddings: sus embeddings ligeros permiten implementar búsqueda semántica y clasificación de contenido en aplicaciones móviles y IoT.
- Asistentes de instrucciones para IoT y domótica: el modelo puede interpretar comandos y ejecutar tareas de control en pasarelas IoT con recursos limitados (1-2 GB de RAM), siempre que se ajuste el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la informacion disponible. La model card incluye una entrada de *model-index* con la métrica "Generation Consistency (vs FP16, method reference)" cuyo valor es "awaiting gen_quant_eval audit" y no está verificada. No hay datos numéricos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este bundle cuantizado.

## Requisitos de hardware

- Memoria en tiempo de ejecución: ~1,1 GB a contexto de 4K (0,98 GB de pesos cuantizados + ~80 MB de caché KV + ~30 MB de runtime + ~45 MB de metadatos por canal).
- Dispositivos objetivo: smartphones de gama alta (8 GB RAM) recomendado, gama media (4-6 GB), gama baja (2-3 GB), Raspberry Pi 5 / SBC (4-8 GB), pasarelas IoT (1-2 GB, ajustado). No apto para wearables de 1 GB.
- GPU: no requerida; el bundle está diseñado para CPU exclusivamente.
- Opciones de despliegue: Aria Engine (runtime propietario de Aria Compute). No compatible con vLLM, llama.cpp, Ollama ni TGI, al usar un formato de pesos propio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3n-E4B-IT (base) | ~4B | 32K | Apache 2.0 | safetensors (BF16) | Modelo original de Google, multimodal |
| Gemma-3-4B | ~4B | 32K | Gemma Terms of Use | safetensors | Modelo denso de Google, sin atención híbrida |
| Qwen2.5-3B | ~3B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa densa de Alibaba |
| Llama-3.2-3B | ~3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo de Meta con contexto largo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- El bundle es exclusivamente de texto: la entrada multimodal (imagen/audio) no está disponible en esta versión cuantizada, a diferencia del modelo base.
- La calidad de generación está pendiente de auditoría formal (*gen_quant_eval*); no hay garantías de que la cuantización 4-bit mantenga la fidelidad del modelo FP16.
- No apto para tareas que requieran precisión factual más allá de la capacidad de un modelo de ~4B, como prueba de teoremas o síntesis de programas completos.
- Limitado a inferencia de un solo prompt; no soporta inferencia por lotes ni aceleración por GPU.
- La escritura creativa larga (>2K tokens por generación) está fuera de su alcance recomendado.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en tareas de razonamiento complejo.
- El formato de pesos propietario de Aria Engine limita la portabilidad a otros runtimes (vLLM, llama.cpp, etc.).
- Aunque la licencia Apache 2.0 permite uso comercial, el runtime Aria Engine puede tener términos adicionales no especificados en la model card.

## Enlaces

- [HuggingFace: ariacompute/gemma-3n-e4b-it_q4](https://huggingface.co/ariacompute/gemma-3n-e4b-it_q4)
- [Modelo base: google/gemma-3n-e4b-it](https://huggingface.co/google/gemma-3n-e4b-it)
- [Paper técnico de Gemma 3n (arXiv:2506.16392)](https://arxiv.org/abs/2506.16392)
- [Repositorio original de Gemma 3n (GitHub)](https://github.com/google-gemma/gemma-3n)
- [Aria Compute Dashboard](https://ariacompute.com/dashboard/models)
- [Aria Engine](https://ariacompute.com)
- [Documentación de Gemma 3n en Google AI for Developers](https://ai.google.dev/gemma/docs/gemma-3n)
