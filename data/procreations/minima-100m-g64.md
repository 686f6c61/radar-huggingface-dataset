# ProCreations/minima-100m-g64

## Resumen

Minima W1.58A8 es un modelo de lenguaje pequeño, de aproximadamente 94 millones de parámetros, publicado por ProCreations (SSH) como un artefacto empaquetado para la librería `minima-lfm`. Se basa en el encoder LFM2.5-Encoder-350M de LiquidAI, del que hereda la arquitectura de partida, aunque el tamaño final se ha reducido drásticamente mediante un proceso de cuantización ternaria: los pesos de las matrices utilizan valores lógicos {-1, 0, +1} en formato de runtime I2_S, lo que corresponde a una cuantización W1.58A8 (pesos de 1.58 bits, activaciones de 8 bits). El modelo se distribuye en formato safetensors y se carga mediante `MinimaModel.from_pretrained(...)` desde el paquete `minima` de SSHDotCodes.

El propósito declarado por el autor es hacer la IA pequeña, accesible y fácil de ejecutar en hardware de consumo. Con un tamaño de repo de 0.1 GB y una footprint en memoria del orden de decenas de megabytes, este modelo está pensado para entornos con recursos muy limitados, como CPUs, GPUs de gama baja o incluso dispositivos embebidos. La fecha de creación (2026) y el número de descargas (0) indican que se trata de una publicación reciente y aún sin adopción. No se dispone de información pública sobre el contexto de entrenamiento, los datos utilizados ni las capacidades específicas del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en LiquidAI/LFM2.5-Encoder-350M, tipo encoder) |
| Parametros totales | 94.207.744 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (definida en `minima_config.json`) |
| Tipos de cuantizacion | Ternaria W1.58A8, valores {-1, 0, +1} en formato I2_S |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (enlace al LICENSE de LiquidAI/LFM2.5-Encoder-350M) |
| Formato de pesos | safetensors (empaquetado ternario) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. El modelo base declarado es LiquidAI/LFM2.5-Encoder-350M, un encoder de 350 millones de parámetros desarrollado por LiquidAI, pero el modelo final tiene 94 millones de parámetros, lo que sugiere un proceso de poda, destilación o reducción de dimensiones antes de la cuantización ternaria. El nombre `g64` probablemente hace referencia al tamaño de grupo (group size) de 64 utilizado en la cuantización, y `W1.58A8` indica pesos ternarios (1.58 bits) con activaciones de 8 bits. No hay información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del esquema de cuantización.

## Capacidades

No se han publicado capacidades específicas del modelo. Al tratarse de un encoder, es probable que esté orientado a tareas de representación de texto (embeddings), clasificación o búsqueda semántica, pero no hay evidencia documentada. No se menciona soporte para generación de texto libre, tool calling, agentes, razonamiento multi-paso, visión ni audio. El modelo se distribuye como un artefacto experimental para la librería `minima-lfm`, y su funcionamiento real depende de la configuración contenida en `minima_config.json`, que no se ha hecho pública en la model card.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su tamaño extremadamente reducido y su naturaleza de encoder, se podrían considerar aplicaciones hipotéticas como:

- Clasificación de texto en dispositivos con recursos limitados (p. ej., routers, IoT).
- Generación de embeddings para búsqueda semántica en bases de datos locales.
- Filtrado de contenido en tiempo real en aplicaciones de bajo consumo.
- Prototipado rápido de sistemas de IA en hardware de bajo coste.
- Experimentación académica con cuantización ternaria y modelos pequeños.
- Aprendizaje de representaciones en entornos sin GPU.

Sin embargo, ninguna de estas aplicaciones está validada ni documentada por el autor, y no hay garantía de que el modelo funcione correctamente en estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor no proporciona comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, y los pesos ternarios de 94 millones de parámetros ocupan aproximadamente 94 M × 1.58 bits ≈ 18.6 MB en memoria, más overhead de activaciones y runtime.
- Es ejecutable en CPU sin problemas; una GPU con 2 GB de VRAM sería más que suficiente.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también en placas como Raspberry Pi con suficiente RAM.
- Las opciones de despliegue incluyen el paquete `minima` de SSHDotCodes, que proporciona `MinimaModel.from_pretrained(...)`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo es un artefacto ternario experimental sin benchmarks publicados, por lo que no se puede comparar objetivamente con alternativas como TinyLlama, Qwen2-0.5B o SmolLM2-135M.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (94M parámetros), lo que limita severamente su capacidad de razonamiento, generación y comprensión de lenguaje complejo.
- No hay documentación sobre sesgos, alucinaciones o comportamiento en producción.
- La licencia `lfm-open-license-v1.0` puede imponer restricciones de uso comercial; es necesario revisar los términos exactos en el enlace proporcionado.
- El modelo depende de la librería `minima` de SSHDotCodes, que es un proyecto externo y posiblemente en fase temprana de desarrollo.
- No se especifica la longitud de contexto; el usuario debe consultar `minima_config.json` para conocerla, pero este archivo no está incluido en la model card pública.
- No hay garantía de que el modelo funcione correctamente fuera del entorno de la librería `minima`.

## Enlaces

- [HuggingFace - ProCreations/minima-100m-g64](https://huggingface.co/ProCreations/minima-100m-g64)
- [Repositorio minima de SSHDotCodes](https://github.com/SSHDotCodes/minima)
- [Licencia LFM Open License v1.0 (LiquidAI)](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE)
- [Perfil de ProCreations en HuggingFace](https://huggingface.co/ProCreations/models)
