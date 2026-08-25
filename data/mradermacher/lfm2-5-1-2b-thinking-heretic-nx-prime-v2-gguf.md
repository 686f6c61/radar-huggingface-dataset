# mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2-GGUF

## Resumen

LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2-GGUF es una cuantización GGUF del modelo de razonamiento LFM2.5-1.2B-Thinking, desarrollado por Liquid AI, modificado por el usuario 0xzknw (variante "Heretic-NX-Prime") y posteriormente convertido a formato GGUF por mradermacher para su uso en entornos de inferencia local. Se trata de un modelo de 1,17 mil millones de parámetros diseñado para razonamiento matemático y lógico, con una ventana de contexto no especificada y soporte para ocho idiomas. La variante "Heretic" aplica técnicas de abliteration (eliminación de refusal) para ofrecer respuestas sin censura, lo que lo distingue de la versión oficial de Liquid.

Este modelo es relevante porque combina un tamaño reducido con capacidades de razonamiento, lo que permite su ejecución en dispositivos con pocos recursos, como teléfonos móviles o CPUs sin GPU dedicada. La cuantización GGUF de mradermacher proporciona múltiples niveles de precisión, desde Q2_K hasta f16, lo que facilita su adaptación a diferentes restricciones de memoria. Su licencia lfm1.0, aunque no estándar, permite su uso en investigación y desarrollo, aunque debe revisarse para aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LFM2.5 (transformers), detalles específicos no disponibles |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking pertenece a la familia LFM2.5 de Liquid AI, orientada a dispositivos edge. Según la documentación de Liquid, está optimizado para razonamiento con entrenamiento especializado en cadenas de pensamiento (chain-of-thought). No se han publicado detalles técnicos sobre la arquitectura interna (número de capas, tipo de atención, etc.) en la información disponible. La variante "Heretic-NX-Prime" es una modificación de terceros (0xzknw) que aplica abliteration, es decir, la eliminación de los mecanismos de rechazo de respuestas, y posiblemente un fine-tuning adicional. El proceso exacto de entrenamiento no está documentado.

El modelo cuantizado por mradermacher conserva las características del modelo base en cuanto a pesos, pero en formato GGUF con diferentes niveles de precisión. No se indica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso, especialmente en tareas de matemáticas y lógica.
- Soporte multilingüe en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Sin censura (variante abliterada): responde a preguntas que el modelo original rechazaría, lo que permite su uso en contextos que requieren contenido libre de restricciones.
- Inferencia eficiente en dispositivos con recursos limitados (menos de 1 GB de memoria según el blog de Liquid).
- No se mencionan capacidades de tool calling, agentes o visión.

## Casos de uso

- **Asistente de razonamiento en dispositivos móviles**: el modelo puede ejecutarse en un smartphone con menos de 1 GB de memoria, proporcionando capacidades de razonamiento matemático y lógico sin conexión a internet. Por ejemplo, en aplicaciones de ayuda a la resolución de ejercicios.
- **Chat de atención al cliente sin censura**: al eliminar las restricciones, puede manejar consultas sensibles o polémicas, aunque requiere moderación posterior para evitar respuestas inapropiadas.
- **Generación de contenido creativo multilingüe**: su soporte de 8 idiomas permite crear textos en varios idiomas, ideal para blogs o redes sociales con audiencia internacional.
- **Prototipado rápido en entornos sin GPU**: gracias a su tamaño y formato GGUF, se puede integrar en sistemas embebidos o en pipelines de CI/CD para pruebas de generación de texto.
- **Análisis de texto en dispositivos edge**: para tareas de extracción de información o resumen, especialmente en aplicaciones de salud o finanzas donde la privacidad es crítica y se requiere procesamiento local.
- **Investigación en modelos de razonamiento pequeños**: sirve como base para experimentos de fine-tuning o comparaciones de rendimiento con otros modelos de 1B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Liquid menciona que LFM2.5-1.2B-Thinking ofrece "el mejor rendimiento de su tamaño", pero no se proporcionan cifras concretas en la información de la cuantización ni en el modelo base.

## Requisitos de hardware

- **VRAM mínima**: para la cuantización Q4_K_M (0,8 GB) se puede ejecutar en GPU con 2 GB de VRAM o incluso en CPU. Las versiones Q8_0 (1,3 GB) requieren aproximadamente 4 GB de VRAM.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1060, RTX 3050, etc.) es suficiente. También funciona en CPUs modernas con soporte AVX2.
- **Cabe en consumer GPU**: sí, incluso en tarjetas de gama baja.
- **Opciones de despliegue**: compatible con llama.cpp, Ollama, LM Studio (mencionado en tags) y servidores de inferencia como vLLM (aunque con menor rendimiento en CPU).
- **Latencia**: en CPU, con cuantización Q4_K_M, se espera una generación de ~10-20 tokens/s en un procesador moderno de 8 núcleos, según la experiencia con modelos similares. No hay datos oficiales.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos en la información disponible, pero se pueden mencionar alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (oficial) | 1,2B | No disponible | lfm1.0 | Modelo original con censura |
| Qwen2.5-1.5B | 1,5B | 32K | Apache 2.0 | Más parámetros, contexto largo |
| Gemma-2-1.0B | 1,0B | 8K | Gemma License | De Google, bueno para edge |

La variante "Heretic" se diferencia por su ausencia de rechazo y su formato GGUF, pero no se dispone de métricas para comparar su rendimiento real.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño y sin censura, es más propenso a generar información falsa o sesgada, especialmente en temas sensibles.
- **Riesgo de contenido inapropiado**: la abliteración elimina las barreras de seguridad, por lo que puede producir contenido ofensivo, peligroso o ilegal. No se recomienda su uso sin un filtro de moderación.
- **Contexto limitado**: la longitud de contexto no está especificada, pero los modelos de 1,2B suelen tener ventanas de 4K-8K tokens, lo que limita conversaciones largas o documentos extensos.
- **Restricciones de licencia**: la licencia lfm1.0 no es una licencia de código abierto estándar; puede imponer restricciones de uso comercial o de redistribución. Debe revisarse antes de desplegar en producción.
- **Sin soporte de herramientas**: no dispone de tool calling ni funciones de agente, por lo que no es adecuado para tareas que requieran interacción con APIs o ejecución de código.

## Enlaces

- [Página de HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2-GGUF)
- [Modelo base original (0xzknw)](https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2)
- [Blog de Liquid AI sobre LFM2.5-1.2B-Thinking](https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb)
- [Documentación de LFM2.5-1.2B-Thinking en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking)
- [Versión con imatrix de mradermacher](https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-heretic-i1-GGUF)
