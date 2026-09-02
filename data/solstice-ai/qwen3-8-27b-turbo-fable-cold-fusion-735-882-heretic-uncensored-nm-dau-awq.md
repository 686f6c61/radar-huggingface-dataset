# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-AWQ

## Resumen

Este modelo es la cuantización oficial AWQ de 4 bits (W4A16 GEMM) del fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, desarrollado por DavidAU sobre la base de Qwen3.8-27B. Solstice-AI ha aplicado una cuantización Activation-Aware Weight Quantization (AWQ) mediante AutoRound, con el objetivo de ofrecer un checkpoint empresarial que mantenga un rendimiento casi sin pérdidas respecto al modelo original en 16 bits, a la vez que permite ejecutarlo en GPUs de 24 GB (RTX 3090, RTX 4090, A10G). El modelo resultante es multimodal (imagen, texto y vídeo), con una ventana de contexto nativa de 262 144 tokens y soporte nativo para motores de inferencia como vLLM, SGLang y Anvil.

La relevancia de este lanzamiento radica en los resultados de benchmarks publicados por el autor, que afirman superar a Claude Opus 4.6 Max en tareas como SWE-bench Pro (61,7 % frente a 53,4 %), AndroidWorld (81,9 % frente a 62,0 %) o IFBench (79,5 % frente a 62,5 %). Aunque estas cifras provienen de la model card y no han sido verificadas de forma independiente, sitúan al modelo en un rango de rendimiento comparable a sistemas propietarios de frontera, con la ventaja de ser de código abierto bajo licencia Apache 2.0. El modelo base incorpora una arquitectura híbrida con atención lineal en 48 de sus 64 capas, una torre de visión y un cabezal de draft MTP (Multi-Token Prediction) para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (atencion lineal en 48 de 64 capas) con torre de vision y cabezal MTP |
| Parametros totales | 27 B (nominal; el archivo safetensors reporta 460 730 096, posible error de extraccion) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos (extensible a 1 M segun documentacion de Qwen3.8-27B) |
| Tipos de cuantizacion | AWQ 4-bit (W4A16 GEMM); tambien disponible en 8-bit segun benchmarks publicados (ARC-C 735 en 8-bit, 719 en 4-bit) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ); el modelo base tambien tiene versiones GGUF |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` es un fine-tune de Qwen3.8-27B, un modelo denso de 27 000 millones de parametros con una arquitectura hibrida que combina atencion lineal en 48 de sus 64 capas con atencion full attention en las restantes. Incluye una torre de vision para procesamiento multimodal (imagen y video), un cabezal MTP que actua como draft head para decodificacion especulativa, y una ventana de contexto nativa de 262 144 tokens. El fine-tune, denominado "Cold Fusion", reduce significativamente los tokens de pensamiento en los modos de razonamiento (entre 1/5 y 1/2 respecto al Qwen3.8-27B original, segun la documentacion de DavidAU), manteniendo o mejorando la calidad de las respuestas.

La cuantizacion AWQ aplicada por Solstice-AI utiliza escalado por capas sensible a la activacion (activation-aware scaling) mediante AutoRound, lo que permite conservar la precision en tareas de razonamiento y codigo. No se han publicado detalles sobre el dataset de entrenamiento del fine-tune ni sobre el uso de tecnicas como RLHF o DPO; la informacion disponible indica que el modelo fue entrenado para seguir instrucciones, razonamiento, analisis, creatividad y generacion de texto sin censura. El checkpoint AWQ esta optimizado para ejecutarse con kernels INT4 Tensor Core en vLLM, SGLang y TensorRT-LLM.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes, video y texto, con capacidad de razonamiento visual integrado.
- Razonamiento configurable: soporta modos de pensamiento (thinking mode) con profundidad ajustable, gracias al fine-tune Cold Fusion que reduce tokens de pensamiento.
- Generacion de codigo y tareas de ingenieria de software: obtiene 61,7 % en SWE-bench Pro y 90,3 % en LiveCodeBench v6 segun la model card.
- Tool calling y function calling: soporte para invocar herramientas externas, segun la documentacion de NVIDIA NGC para Qwen3.8-27B.
- Agentes multi-step: capaz de ejecutar tareas agenciales de larga duracion, como demuestran los resultados en OSWorld-Verified (84,3 %) y AndroidWorld (81,9 %).
- Contexto largo: ventana nativa de 262 144 tokens, extensible a 1 M, adecuada para documentos extensos y conversaciones multi-turno.
- Decodificacion especulativa: el cabezal MTP integrado acelera la generacion al predecir multiples tokens por paso.
- Multilingue: soporte para ingles y chino.

## Casos de uso

- Atencion al cliente automatizada: con 262 144 tokens de contexto, el modelo puede gestionar conversaciones multi-turno con historial completo y documentos de referencia extensos, manteniendo coherencia a lo largo de la interaccion. Su capacidad de tool calling permite integrarlo con sistemas de ticketing o CRM.
- Generacion de codigo en produccion: el alto rendimiento en SWE-bench Pro (61,7 %) y LiveCodeBench v6 (90,3 %) lo hace adecuado para pipelines de CI/CD donde se requiere generar, revisar o parchear codigo. La cuantizacion AWQ permite desplegarlo en GPUs de 24 GB con latencia baja.
- Agentes autonomos de navegacion web o escritorio: los resultados en OSWorld-Verified (84,3 %) y AndroidWorld (81,9 %) indican que puede controlar interfaces graficas y ejecutar tareas complejas de varios pasos, util para automatizacion de procesos empresariales.
- Analisis de documentos legales o tecnicos: la ventana de contexto de 262K tokens permite procesar contratos, patentes o informes extensos de una sola vez, extrayendo clausulas, resumiendo secciones o respondiendo preguntas especificas sobre el contenido.
- Razonamiento multimodal en soporte tecnico: al aceptar imagenes y video, puede diagnosticar problemas a partir de capturas de pantalla o grabaciones, combinando la informacion visual con el contexto textual de la incidencia.
- Asistente de investigacion cientifica: con capacidad de razonamiento matematico y procesamiento de documentos largos, puede ayudar a revisar articulos, resumir metodos y resultados, y generar hipotesis a partir de la literatura existente.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card publicada por Solstice-AI, evaluados bajo el harness oficial de Claude Code con ventanas de contexto de 256K y 1M. No se han verificado de forma independiente.

| Benchmark | Qwen3.8-27B TURBO (Solstice) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|
| SWE-bench Pro | 61,7 % | 53,4 % | +8,3 % |
| LiveCodeBench v6 | 90,3 % | 88,8 % | +1,5 % |
| QwenSWEBench | 79,0 % | 63,8 % | +15,2 % |
| CoWorkBench | 70,7 % | 68,2 % | +2,5 % |
| OSWorld-Verified | 84,3 % | 72,7 % | +11,6 % |
| AndroidWorld | 81,9 % | 62,0 % | +19,9 % |
| IFBench | 79,5 % | 62,5 % | +17,0 % |
| ARC-C | 735 (8-bit) / 719 (4-bit) | ~710-720 | Rango de frontera cerrada |

No se dispone de resultados comparativos con otros modelos open source de tamano similar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: 24 GB para inferencia con cuantizacion AWQ 4-bit, segun la model card (funciona en RTX 3090, RTX 4090 y A10G).
- GPU recomendadas: Ampere, Ada Lovelace o Hopper con soporte para kernels INT4 Tensor Core. Ejemplos: RTX 3090, RTX 4090, A10G, A100, H100.
- Compatibilidad con GPUs de consumo: si, cabe en RTX 3090 y RTX 4090 con 24 GB de VRAM.
- Opciones de despliegue: vLLM (comando `vllm serve` con `--quantization awq`), SGLang (con RadixAttention para cacheo de prefijos), Anvil (ejecucion in-process) y TensorRT-LLM.
- Latencia y throughput: no se han publicado cifras concretas. La cuantizacion W4A16 GEMM y el cabezal MTP de decodificacion especulativa deberian proporcionar un throughput superior al de una ejecucion en 16 bits, pero no hay datos medidos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Rendimiento destacado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27 B | 262 144 | Apache 2.0 | FP16/BF16 | Modelo original de Qwen, sin fine-tune |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (DavidAU) | 27 B | 262 144 | Apache 2.0 | FP16, GGUF | Fine-tune con Cold Fusion, reduce tokens de pensamiento |
| Este modelo (Solstice-AI AWQ) | 27 B | 262 144 | Apache 2.0 | AWQ 4-bit | Cuantizacion oficial con benchmarks que superan a Claude Opus 4.6 Max |

No se dispone de datos de otros modelos de 27 B comparables en la informacion proporcionada. La comparativa con Claude Opus 4.6 Max se incluye como referencia, aunque no es un modelo de la misma categoria (propietario y de mayor tamano).

## Limitaciones y advertencias

- Sesgos: no se ha publicado informacion sobre evaluaciones de sesgo o toxicidad. El nombre "Uncensored" sugiere que el modelo puede generar contenido sin filtros, lo que implica un riesgo de respuestas inapropiadas o daninas en entornos de produccion.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje; no se han publicado tasas de alucinacion especificas.
- Limitaciones de contexto: aunque la ventana nativa es de 262 144 tokens, el rendimiento en contextos muy largos puede degradarse; la extension a 1 M no esta garantizada en todas las tareas.
- Idiomas: solo ingles y chino; no se ha evaluado su rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base incluye componentes de Qwen3.8-27B que pueden tener condiciones adicionales; se recomienda revisar la licencia del modelo base.
- Validacion externa: el modelo tiene 0 descargas y 0 likes en HuggingFace, y los benchmarks publicados no han sido replicados por terceros. Las afirmaciones de superar a Claude Opus 4.6 Max deben tratarse con cautela.
- El nombre del modelo incluye "Heretic" y "Uncensored", lo que puede indicar que fue entrenado sin alineacion de seguridad; esto puede generar contenido ofensivo o peligroso si se usa sin control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-AWQ
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Version GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Sitio de Solstice-AI: https://solstice-ai.co
- Repositorio Anvil: https://github.com/Solstice-Labs/anvil
