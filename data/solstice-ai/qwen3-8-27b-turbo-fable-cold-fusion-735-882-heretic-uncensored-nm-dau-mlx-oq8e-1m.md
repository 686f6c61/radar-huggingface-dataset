# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e-1M

## Resumen

Este modelo es una cuantización en precisión mixta de 8 bits (oQ8e-mtp) del fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, desarrollada por Solstice-AI específicamente para Apple Silicon con memoria unificada. Se basa en la arquitectura de Qwen3.8-27B, un modelo denso de 27 000 millones de parámetros con atención híbrida (lineal en 48 de 64 capas), torre de visión y un cabezal de predicción multi-token (MTP) integrado. La versión aquí descrita está optimizada para ejecutarse con MLX y el motor Anvil, ofreciendo una ventana de contexto nativa de 1 000 000 de tokens.

La relevancia de este modelo radica en su enfoque en el rendimiento en hardware de Apple: la cuantización oQ8e-mtp conserva las matrices de atención y proyección recurrente a mayor profundidad de bits mientras optimiza las redes feed-forward para maximizar la velocidad de generación. Según los datos del autor, alcanza un 87,0 % en MMLU y un 89,6 % en HumanEval (Python) con una velocidad 1,45 veces superior a la línea base BF16 sin cuantizar. Es una opción práctica para desarrolladores que trabajan con Macs equipadas con chips M1 a M5 y necesitan ejecutar un modelo de 27B con contexto largo de forma local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, basada en Qwen3.8-27B (atención híbrida: lineal en 48 de 64 capas, con torre de visión y cabezal MTP) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1 000 000 tokens (nativo) |
| Tipos de cuantizacion | oQ8e-mtp (8-bit mixto); el autor menciona también variantes oQ6e, oQ5e y oQ4e en benchmarks, pero no se publican en este repositorio |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización MLX del fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez se basa en Qwen3.8-27B. La arquitectura subyacente es un transformer denso con atención híbrida: 48 de las 64 capas usan atención lineal, lo que reduce el coste computacional en secuencias largas, mientras que las 16 restantes mantienen atención completa. Incluye una torre de visión (aunque esta versión MLX se centra en texto) y un cabezal de predicción multi-token (MTP) que permite decodificación especulativa.

El fine-tune original emplea el método "Cold Fusion", que según el autor reduce los tokens de pensamiento entre 1/5 y 1/2 en comparación con Qwen3.8 estándar, manteniendo o mejorando la calidad. La cuantización oQ8e-mtp aplica precisión mixta: las matrices de atención y las proyecciones recurrentes (GDN) se conservan a 8 bits o más, mientras que las capas feed-forward se cuantizan a 8 bits para maximizar el throughput. No se han publicado detalles sobre el dataset de entrenamiento del fine-tune ni sobre el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto conversacional y de larga forma en inglés y chino.
- Razonamiento complejo y resolución de problemas matemáticos, con resultados de 87,0 % en MMLU y 68,7 % en MMLU_Pro (según el autor).
- Generación de código, con 89,6 % en HumanEval (Python) en la variante oQ8e-mtp.
- Soporte de agentes y codificación agéntica (etiqueta `agentic-coding`), aunque no se detallan capacidades específicas de tool calling en la documentación.
- Aceleración especulativa mediante Multi-Token Prediction (MTP), que predice varios tokens a la vez para aumentar la velocidad de generación.
- Ventana de contexto de 1 000 000 de tokens, adecuada para tareas que requieren procesar documentos extensos o historiales de conversación muy largos.
- Optimizado para Apple Silicon con Metal, aprovechando la memoria unificada para ejecutar el modelo completo en RAM.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un MacBook Pro con chip M3 Max y usarlo para generar código, refactorizar funciones o explicar fragmentos complejos, gracias a su buen rendimiento en HumanEval y su capacidad de contexto largo para mantener el estado del proyecto.
- Análisis de documentos extensos: con 1M de tokens de contexto, permite procesar libros completos, informes anuales o expedientes legales en una sola pasada, resumiendo o extrayendo información sin necesidad de dividir el texto.
- Chat conversacional con historial prolongado: en aplicaciones de atención al cliente o asistentes personales, el modelo puede mantener conversaciones de miles de turnos sin perder el hilo, gracias a la ventana de contexto amplia y la reducción de tokens de pensamiento del fine-tune Cold Fusion.
- Desarrollo de agentes autónomos: su etiqueta `agentic-coding` sugiere que puede integrarse en pipelines donde el modelo planifica y ejecuta múltiples pasos, por ejemplo, para automatizar tareas de integración continua o gestión de repositorios.
- Traducción y generación de contenido bilingüe: al soportar inglés y chino, es útil para traducir documentación técnica, localizar interfaces o redactar contenido en ambos idiomas con un solo modelo.
- Prototipado rápido en entornos sin GPU dedicada: al estar optimizado para Apple Silicon, permite a investigadores y estudiantes probar un modelo de 27B en un portátil sin necesidad de servidores con GPUs NVIDIA, usando MLX-LM o Anvil.

## Benchmarks y rendimiento

El autor proporciona una tabla comparativa entre la línea base BF16 y las distintas variantes de cuantización oQx. Los datos corresponden a la variante oQ8e-mtp, que es la publicada en este repositorio:

| Precision Tier | MMLU | MMLU_Pro | HumanEval (Python) | Generation Speed |
| :--- | :---: | :---: | :---: | :---: |
| Unquantized BF16 Baseline | 87,3 % | 68,7 % | 89,0 % | 1,00x |
| oQ8e-mtp (8-Bit Mixed) | 87,0 % | 68,7 % | 89,6 % | 1,45x |
| oQ6e-mtp (6-Bit Mixed) | 86,0 % | 70,0 % | 88,4 % | 1,72x |
| oQ5e-mtp (5-Bit Mixed) | 87,0 % | 67,7 % | 89,0 % | 1,95x |
| oQ4e-mtp (4-Bit Mixed) | 86,3 % | 66,3 % | 86,6 % | 2,20x |

No se han publicado resultados de benchmarks adicionales (como GSM8K, ARC, etc.) en la información disponible. Los datos de velocidad son relativos a la línea base BF16 y dependen del hardware concreto.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (chips M1 a M5) con memoria unificada.
- Con 27 781 millones de parámetros en 8 bits, el modelo requiere aproximadamente 28 GB de memoria unificada para cargar los pesos completos. En la práctica, un Mac con 32 GB o más de RAM unificada es recomendable para ejecutar el modelo con comodidad.
- En un MacBook Pro con M3 Max (36 GB o 48 GB) o M4 Max, se puede ejecutar sin problemas. En chips M1 o M2 con 16 GB, no cabrá el modelo completo; sería necesario usar una cuantización más agresiva (oQ4e) o reducir el contexto.
- Opciones de despliegue: motor Anvil (binario único con soporte nativo de memoria unificada y aceleración MTP) o MLX-LM (biblioteca Python con generación y servidor OpenAI-compatible).
- La velocidad de generación depende del chip y de la memoria disponible; el autor indica una mejora de 1,45x frente a BF16, pero no proporciona tokens por segundo concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K (extensible a 1M) | 87,3 % (BF16) | 89,0 % (BF16) | Apache 2.0 | Safetensors, GGUF |
| Este modelo (oQ8e-mtp) | 27,78B | 1M | 87,0 % | 89,6 % | Apache 2.0 | Safetensors (MLX) |
| Llama 3.1 27B (hipotético) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con Llama 3.1 27B no es posible porque no existe tal modelo (Llama 3.1 tiene variantes de 8B y 70B). Frente al Qwen3.8-27B original, esta versión MLX ofrece el mismo rendimiento aproximado en MMLU y ligeramente superior en HumanEval, con la ventaja de un contexto nativo de 1M y una optimización específica para Apple Silicon. La diferencia principal es el formato: este modelo solo está disponible en MLX, mientras que el original tiene pesos estándar y GGUF.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas, aunque el modelo base Qwen3.8 podría tener capacidades multilingües más amplias.
- Es una cuantización de 8 bits; aunque el autor reporta una degradación mínima, puede haber pérdidas sutiles en tareas de razonamiento muy fino o en dominios especializados.
- El modelo está pensado para Apple Silicon; no funcionará en GPUs NVIDIA o AMD sin una conversión previa a otro formato (por ejemplo, GGUF), que no se proporciona en este repositorio.
- No se han publicado detalles sobre el dataset de entrenamiento del fine-tune, por lo que se desconocen posibles sesgos o alucinaciones específicas. El nombre "Uncensored" sugiere que no se aplicaron filtros de seguridad adicionales, lo que puede generar contenido inapropiado si se usa sin control.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (DavidAU) y el fine-tune original pueden tener condiciones adicionales; se recomienda revisar la licencia del modelo base antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 1 like, lo que indica que es una publicación reciente y poco validada por la comunidad; los benchmarks del autor no han sido verificados de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e-1M
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Motor Anvil: https://github.com/Solstice-Labs/anvil
- Sitio web de Solstice-AI: https://solstice-ai.co
- Referencia de Qwen3.8-27B (vLLM Recipes): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
