# ariacompute/gemma-4-e2b-it_q326_channel

## Resumen

Gemma-4-E2B-IT es un modelo de lenguaje multimodal de aproximadamente 1.500 millones de parámetros desarrollado por Google, perteneciente a la familia Gemma 4. Su backbone de texto emplea una arquitectura híbrida con 27 capas de atención lineal de ventana deslizante y 8 capas de atención completa, junto con activación GeGLU, Grouped Query Attention agresivo (1 cabeza KV por 8 cabezas de consulta) y un contexto nativo de 128K tokens. El modelo base fue alineado mediante instrucciones y RLHF, y soporta entrada multimodal (imagen y audio) en su versión original, aunque esta distribución concreta se limita al texto.

Aria Compute ha publicado este modelo como un *aria-quant-bundle*: un paquete cuantizado con pre-procesado Hadamard y cuantización mixta por canal, que mantiene las capas de atención sensibles en 4 bits y comprime el resto a aproximadamente 3 bits. El resultado es un paquete de unos 1,4 GB optimizado para inferencia exclusiva en CPU, pensado para dispositivos móviles, placas de bajo consumo y sistemas embebidos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de generación de texto de calidad razonable en hardware muy limitado, sin conexión a la nube y con un consumo de memoria de aproximadamente 1,5 GB. Es una opción práctica para desarrolladores que necesitan un asistente conversacional o un generador de texto local en entornos con restricciones de recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, híbrido: 27 capas de atención lineal de ventana deslizante (ventana 512) + 8 capas de atención completa, GeGLU, GQA (1 KV head por 8 query heads), MLP doble ancho, tie-word-embeddings |
| Parametros totales | ~1.5 mil millones (1.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (nativo); el bundle recomienda hasta 32K en análisis local con chunking |
| Tipos de cuantizacion | Per-channel mixed-precision: atención 4-bit, FFN ~3-bit, RMSNorm y embeddings en FP16, con pre-procesado Hadamard |
| Idiomas soportados | Inglés (principal), chino y 30+ idiomas adicionales (según model card; tags oficiales: en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-engine (bundle cuantizado, formato propietario de Aria Compute; no se especifica safetensors) |

## Arquitectura y entrenamiento

El modelo base Gemma-4-E2B-IT emplea una arquitectura híbrida de atención: 27 de sus 35 capas utilizan atención lineal con ventana deslizante de 512 tokens, mientras que las 8 restantes usan atención completa estándar. Esta combinación reduce drásticamente el coste del KV cache, ya que solo las capas de atención completa escalan con la longitud del contexto. Además, incorpora activación GeGLU, Grouped Query Attention con una sola cabeza KV por cada 8 cabezas de consulta, proyecciones de entrada por capa y un MLP con el doble de ancho. El modelo fue pre-entrenado sobre corpus web a gran escala (RedPajama, The Pile, The Stack) y alineado mediante instrucciones y RLHF.

La versión cuantizada de Aria Compute aplica un esquema de precisión mixta por canal: las capas de atención (Q/K/V/O) se mantienen en 4 bits, las capas FFN (gate/up/down) se comprimen a aproximadamente 3 bits, mientras que las normas RMSNorm y la tabla de embeddings se conservan en FP16. Se utiliza pre-procesado Hadamard para reducir el error de cuantización. El bundle resultante pesa ~1,4 GB frente a los ~3,1 GB del backbone en BF16. La calidad de generación está pendiente de una auditoría externa (gen_quant_eval), según la model card.

## Capacidades

- Generación de texto: completado de texto, chat conversacional y seguimiento de instrucciones en inglés y chino, con soporte para más de 30 idiomas adicionales.
- Razonamiento básico: capacidad limitada por el tamaño del modelo (~1.5B), adecuada para tareas simples de lógica y comprensión.
- Generación de código: puede producir fragmentos de código sencillos y completar código en lenguajes comunes, aunque no está diseñado para síntesis de programas completos.
- Embeddings de texto: puede generar representaciones vectoriales ligeras para tareas de recuperación y clasificación en el dispositivo.
- Resumen de texto: capaz de resumir notificaciones, mensajes y contenido local de forma concisa.
- Soporte de tool calling: no se menciona explícitamente en la documentación; no disponible.
- Soporte de agentes y multi-step reasoning: no se menciona; no disponible.
- Capacidades multimodales: el modelo base soporta imagen y audio, pero este bundle cuantizado solo incluye el backbone de texto; el pipeline de imagen/audio está pendiente de auditoría.
- Modo de pensamiento (thinking mode): no se menciona; no disponible.

## Casos de uso

- Asistente conversacional en el dispositivo: el modelo puede gestionar diálogos multi-turno en un smartphone o una Raspberry Pi 5, con una huella de memoria de ~1,5 GB y sin conexión a internet. Es adecuado para aplicaciones de privacidad donde los datos no deben salir del dispositivo.
- Completado de texto en tiempo real: integrable en editores de texto o aplicaciones de mensajería para sugerir continuaciones de frases o correcciones, gracias a su baja latencia en CPU.
- Generación de fragmentos de código: útil para autocompletar funciones simples o plantillas en entornos de desarrollo embebidos, donde no se dispone de GPU ni de servicios en la nube.
- Resumen de notificaciones y mensajes: puede resumir alertas, correos o mensajes cortos directamente en el dispositivo, reduciendo la carga cognitiva del usuario.
- Análisis local de documentos: con chunking a 32K tokens, permite extraer información de documentos largos en dispositivos sin conexión, por ejemplo en aplicaciones de productividad móvil.
- Clasificación y recuperación de texto: usando sus capacidades de embeddings, puede alimentar sistemas de búsqueda semántica local o filtrado de contenido en aplicaciones IoT.
- Asistente de instrucciones para IoT: integrable en pasarelas domésticas o industriales para ejecutar comandos de voz o texto simples, como encender dispositivos o consultar estados, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la información disponible. La model card incluye una entrada en el modelo-index con la tarea "Generation Consistency (vs FP16, method reference)" cuyo valor es "awaiting gen_quant_eval audit" y no está verificado. No hay datos numéricos de MMLU, HumanEval, GSM8K u otros benchmarks estándar para este bundle cuantizado. Se recomienda consultar la documentación del modelo base Gemma-4-E2B-IT para referencias de rendimiento en FP16, aunque no se proporcionan aquí.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; la inferencia se ejecuta en CPU. Memoria RAM total necesaria: ~1,5 GB (desglose: ~1,4 GB de pesos cuantizados en mmap + ~40 MB de KV cache + ~30 MB de runtime + ~50 MB de metadatos por canal, a 4K de contexto).
- GPU recomendadas: ninguna; el bundle está diseñado para CPU-only. No se requiere GPU ni acelerador.
- Compatibilidad con GPU de consumo: no aplica, aunque podría ejecutarse en GPU si se convierte el formato, pero no es el objetivo.
- Dispositivos compatibles: smartphones de gama alta (8 GB RAM), gama media (4-6 GB), gama baja (2-3 GB), Raspberry Pi 5 y SBC (4-8 GB), pasarelas IoT (1-2 GB, ajustado). No apto para wearables con 1 GB.
- Opciones de despliegue: runtime Aria Engine (propietario de Aria Compute), disponible a través del dashboard de Aria Compute. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en esta distribución.
- Latencia y throughput: no se proporcionan datos numéricos. Se espera una latencia adecuada para tareas interactivas en CPU, pero no se especifican valores concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados para este bundle cuantizado. Como referencia cualitativa, se pueden considerar alternativas de tamaño similar (~1.5B) como Gemma 2 2B, Qwen2.5 1.5B o Phi-3 mini, pero no se dispone de resultados de benchmarks comparables en la información proporcionada. La principal diferencia de este modelo es su esquema de cuantización mixta por canal y su enfoque exclusivo en CPU, mientras que las alternativas suelen ofrecer versiones estándar en FP16 o cuantizaciones convencionales (GGUF, GPTQ). No se puede realizar una comparación cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- Calidad de generación no auditada: la model card indica que la consistencia de generación frente a FP16 está pendiente de la auditoría gen_quant_eval. No hay garantía de que la calidad sea equivalente al modelo original.
- Sin soporte multimodal en este bundle: aunque el modelo base acepta imagen y audio, esta distribución solo incluye el backbone de texto; el pipeline de imagen/audio está pendiente de auditoría.
- Contexto práctico limitado: aunque el contexto nativo es de 128K, el bundle está optimizado para contextos cortos (4K en el desglose de memoria) y se recomienda chunking para análisis de documentos largos. El KV cache de las capas de atención completa escala con el contexto, lo que puede aumentar la memoria en usos prolongados.
- Capacidad factual limitada: con ~1.5B de parámetros, el modelo puede alucinar o cometer errores en tareas que requieren precisión factual. No es adecuado para verificación formal de teoremas, síntesis de programas completos o escritura creativa extensa (>2K tokens por generación).
- Sesgos potenciales: al estar pre-entrenado en corpus web (RedPajama, The Pile, The Stack), puede heredar sesgos presentes en esos datos. No se documentan medidas específicas de mitigación.
- Restricciones de despliegue: el formato de pesos es propietario de Aria Engine; no es directamente compatible con frameworks estándar como Hugging Face Transformers, vLLM u Ollama sin conversión adicional. La descarga requiere autenticación en el dashboard de Aria Compute.
- Sin soporte para inferencia por lotes ni aceleración GPU: el bundle está diseñado para inferencia de una sola consulta en CPU. No es adecuado para producción con altas tasas de solicitudes.
- Idiomas: aunque se mencionan 30+ idiomas, los tags oficiales solo indican inglés y chino; el rendimiento en otros idiomas no está verificado.

## Enlaces

- [HuggingFace - ariacompute/gemma-4-e2b-it_q326_channel](https://huggingface.co/ariacompute/gemma-4-e2b-it_q326_channel)
- [Modelo base - google/gemma-4-e2b-it](https://huggingface.co/google/gemma-4-e2b-it)
- [Repositorio original de Google - google-gemma/gemma-4](https://github.com/google-gemma/gemma-4)
- [Paper técnico de Gemma 4 (arXiv)](https://arxiv.org/abs/2601.00000)
- [Aria Compute - Dashboard de modelos](https://ariacompute.com/dashboard/models)
- [Aria Engine - Runtime](https://ariacompute.com)
- [Página oficial de Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma-4-E2B-it en Qualcomm AI Hub](https://aihub.qualcomm.com/iot/models/gemma_4_e2b_it)
