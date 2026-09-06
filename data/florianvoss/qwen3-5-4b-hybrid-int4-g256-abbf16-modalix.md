# florianvoss/Qwen3.5-4B-Hybrid-INT4-G256-ABBF16-Modalix

## Resumen

El paquete `florianvoss/Qwen3.5-4B-Hybrid-INT4-G256-ABBF16-Modalix` es un conjunto de artefactos compilados para el runtime LLiMa en el acelerador SiMa.ai Modalix. No es un checkpoint de Transformers, sino una distribución optimizada del modelo base Qwen/Qwen3.5-4B que incluye pesos cuantizados, configuraciones de runtime, tokenizer y embeddings. El autor, florianvoss, ha generado este paquete como parte de una colección de pruebas para evaluar la ejecución de Qwen3.5-4B en hardware de bajo consumo.

El modelo base Qwen3.5-4B presenta una arquitectura híbrida que combina capas de atención lineal (GatedDeltaNet) con capas de atención plena, según la documentación disponible en la búsqueda web. Esta arquitectura busca equilibrar la eficiencia computacional con la capacidad de mantener razonamiento de contexto largo. El paquete compilado tiene una longitud de contexto de 4096 tokens y está diseñado para ejecutarse en el runtime LLiMa con el SDK de SiMa Model 2.1.3.

La relevancia de este paquete radica en la optimización específica para aceleradores edge, con cuantización mixta INT4/BF16, cuantización de embeddings y KV cache, y filtro compartido. Sin embargo, la model card indica que la ejecución completa y el rendimiento en Modalix no han sido aún validados, por lo que se trata de un artefacto de evaluación y prototipado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal (GatedDeltaNet) y atención plena (según búsqueda web) |
| Parametros totales | No disponible (el nombre del modelo base indica 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Decoder Linear: INT4 AutoRound (group size 256); A/B projections: BF16; Output head: GPTQ INT4 (G256); Vision Linear: INT8 per-channel; Conv/normalización: punto flotante; embeddings y KV cache cuantizados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Artefactos de runtime compilados (ELF files, configuraciones, tokenizer, embeddings); no es un checkpoint Transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un modelo híbrido que combina capas de atención lineal (GatedDeltaNet) con capas de atención plena, según la documentación de la búsqueda web. En el paquete compilado, los pesos de las proyecciones lineales del decoder (QKV, Z y salidas) se cuantizan a INT4 con AutoRound y group size 256, mientras que las proyecciones A/B de la atención lineal se mantienen en BF16. Las capas de convolución y normalización conservan su precisión flotante, y la cabeza de salida utiliza GPTQ INT4 con group size 256. Las capas de visión se cuantizan a INT8 por canal.

No se aplicó SmoothQuant como preprocesamiento. El paquete incorpora filter sharing, embeddings cuantizados y KV cache cuantizados. La entrada visual compilada es de 32x32 píxeles, y el prefill group size es 128. La compilación se realizó con el SDK SiMa Model 2.1.3 y la revisión `598c4fa3c02b598716c03220a4fea2c7987c24a6` del runtime LLiMa. No se dispone de información sobre los datos de entrenamiento ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y procesamiento de lenguaje: capacidad inherente del modelo base, aunque no se ha validado en este paquete compilado.
- Procesamiento de entrada visual: el paquete incluye una entrada visual compilada de 32x32, lo que permite inferencia multimodal en el acelerador Modalix.
- Atención híbrida: combina atención lineal (GatedDeltaNet) con atención plena para equilibrar coste computacional y contexto.
- Cuantización mixta INT4/BF16 con cuantización de embeddings y KV cache, diseñada para reducir el uso de memoria en hardware edge.
- Soporte de runtime LLiMa: preparado para ejecutarse con `llima run` en Modalix con un runtime compatible.
- No se dispone de información sobre tool calling, function calling, soporte de agentes, modos de razonamiento especiales ni capacidades multilingües específicas.

## Casos de uso

- Despliegue de asistentes de lenguaje en dispositivos edge: el paquete compilado permitiría ejecutar un modelo de 4B en el acelerador SiMa.ai Modalix sin conexión a la nube, reduciendo la latencia y mejorando la privacidad en aplicaciones de asistencia por voz o texto.
- Visión por computador embebida: la entrada visual compilada de 32x32 posibilita tareas de clasificación de imágenes o detección de objetos sencillos en sistemas de bajo consumo, como cámaras inteligentes o robots.
- Análisis de texto en tiempo real en entornos industriales: el contexto de 4096 tokens es suficiente para procesar logs de máquinas, informes cortos o mensajes de monitorización en el propio dispositivo, sin enviar datos a servidores externos.
- Prototipado de modelos cuantizados para hardware acelerado: permite evaluar el impacto de la cuantización INT4 con AutoRound y GPTQ en un pipeline de compilación LLiMa, comparando con otras variantes de la colección.
- Investigación en arquitecturas híbridas: sirve como referencia para estudiar el equilibrio entre atención lineal y atención plena en un modelo de 4B, especialmente en hardware específico como Modalix.
- Aplicaciones multimodales en el borde: la combinación de texto e imagen en un único modelo compilado resulta adecuada para sistemas de asistencia en robótica, domótica o mantenimiento predictivo, donde se requiere interpretar señales visuales y textuales de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la ejecución completa del modelo y su rendimiento en Modalix no han sido aún validados, por lo que no existen cifras de latencia, throughput ni precisión.

## Requisitos de hardware

- Objetivo de despliegue: acelerador SiMa.ai Modalix con runtime LLiMa compatible.
- VRAM estimada: no disponible. El tamaño del repositorio es de 7.6 GB, que incluye artefactos compilados y configuraciones, pero no se especifica el consumo de memoria en ejecución.
- GPU recomendadas: no aplica. El paquete está compilado específicamente para SiMa.ai Modalix, no para GPUs convencionales.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: exclusivamente mediante `llima run /path/to/Qwen3.5-4B-Hybrid-INT4-G256-ABBF16-Modalix` en un entorno con el runtime LLiMa instalado. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, sin validación de ejecución completa.

## Comparativa con modelos similares

Existen otras variantes compiladas del mismo modelo base en la colección de florianvoss, pero no se dispone de sus especificaciones detalladas. La tabla comparativa se limita a los datos disponibles:

| Modelo | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B Hybrid INT4 G256/ABBF16 Modalix (este) | INT4 (AutoRound G256) + BF16, head GPTQ INT4, vision INT8 | 4096 | No disponible | HuggingFace |
| Qwen3.5-4B INT8 Modalix | INT8 | No disponible | No disponible | HuggingFace (colección) |
| Qwen3.5-4B SmoothQuant A0.5 INT4/BF16 Modalix | INT4/BF16 con SmoothQuant | No disponible | No disponible | HuggingFace (colección) |

No se dispone de información suficiente para comparar rendimiento, parámetros totales o idiomas soportados entre estas variantes.

## Limitaciones y advertencias

- La ejecución completa del modelo y su rendimiento en Modalix no han sido validados según la model card.
- El repositorio no contiene un checkpoint de Transformers; no puede cargarse con frameworks estándar como transformers, vLLM o llama.cpp.
- La longitud de contexto está limitada a 4096 tokens.
- La entrada visual compilada se restringe a 32x32 píxeles, lo que limita la resolución de las imágenes procesadas.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Además, el modelo base Qwen3.5-4B y las herramientas SiMa.ai/LLiMa pueden imponer restricciones adicionales.
- No se dispone de información sobre sesgos, riesgos de alucinación ni idiomas soportados.
- La cuantización INT4 puede degradar la calidad de las salidas en comparación con el modelo original en precisión completa.

## Enlaces

- HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-4B-Hybrid-INT4-G256-ABBF16-Modalix
- Colección de florianvoss: https://huggingface.co/collections/florianvoss/qwen35-tests
- Documentación de arquitectura del modelo base: https://deepwiki.com/sai-samarth/qwen35-4b-fast-inference/2.1-qwen3.5-4b-gdn-hybrid-model
