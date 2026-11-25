# pranil00/ONIX-Qwen2.5-Coder-32B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-Coder-32B-Instruct-GGUF es una cuantización GGUF del modelo Qwen2.5-Coder-32B-Instruct de Alibaba Qwen, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto emplea el esquema de cuantización IQ2_M (aproximadamente 2,7 bits por peso), lo que reduce el tamaño de los pesos desde unos 64,08 GB en FP16 hasta 10,81 GB, una compresión de 5,93x. El modelo base es un transformer denso de 32.763.412.480 parámetros orientado a generación de código e instrucciones, con una longitud de contexto nativa de 32.768 tokens según la documentación del modelo original.

La relevancia de esta publicación es puramente práctica: permite ejecutar un modelo de 32B en hardware de consumo con 12 GB de VRAM dedicada o 16 GB de memoria unificada en Apple Silicon, algo inviable con los pesos en FP16. El autor declara una retención de calidad cognitiva del 82,0 % respecto al modelo sin cuantizar y clasifica el ajuste como "TIGHT FIT" (compacted), con ventanas de contexto recomendadas de 8.192 tokens en GPU y Apple Silicon y 4.096 tokens en CPU.

Se trata de un artefacto derivado, no de un modelo entrenado desde cero: no aporta mejoras de arquitectura ni de entrenamiento, sino una vía de despliegue de bajo coste. La licencia declarada es Apache 2.0, heredada del modelo base, y el repositorio ocupa 11,6 GB. No se han publicado resultados de benchmarks del artefacto cuantizado más allá de las métricas de tamaño y memoria del informe de auditoría del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5), modelo base Qwen2.5-Coder-32B-Instruct |
| Parametros totales | 32.763.412.480 (32,76 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 8.192 tokens recomendados en GPU y Apple Silicon; 4.096 tokens recomendados en CPU |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen--Qwen2.5-Coder-32B-Instruct-IQ2_M.gguf`, 10,81 GB) |

## Arquitectura y entrenamiento

El artefacto no introduce cambios de arquitectura: reproduce el modelo Qwen2.5-Coder-32B-Instruct, un transformer denso de tipo decoder-only con 32,76 mil millones de parámetros. La model card del repositorio no documenta la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo fases de RLHF o DPO; esos datos corresponden a la documentación del modelo base y no se incluyen en la información disponible.

La innovación técnica de esta publicación es el proceso de cuantización: conversión a GGUF con el esquema IQ2_M, que combina cuantización por bloques con una asignación de bits adaptativa para preservar los pesos más sensibles. El autor reporta una compresión del 83,1 % respecto a FP16 y una retención de calidad estimada del 82,0 %, con aceleración completa de las 64 capas en Metal y soporte de CUDA y de instrucciones AVX2/AVX-512 en CPU. El motor de cuantización es `run-any-model`, una herramienta open source del propio autor, descrita como un motor de optimización adaptativo al dispositivo.

## Capacidades

- Generación de texto y de código en el modelo base, orientado explícitamente a tareas de programación (Coder).
- Razonamiento de instrucciones y conversación multi-turno, al derivar de una variante Instruct.
- Capacidades matemáticas y de razonamiento de propósito general heredadas de Qwen2.5, con posible degradación por la cuantización agresiva a 2,7 bpw.
- Soporte de tool calling y function calling del modelo base, no verificado en el artefacto cuantizado.
- Capacidades de agente y razonamiento multi-paso del modelo base, sujetas a la ventana de contexto reducida recomendada (8.192 tokens).
- Capacidades multilingües del modelo base; los idiomas concretos no se detallan en la información disponible.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en esta publicación.

## Casos de uso

- Asistencia de programación en local: el modelo puede completar código, explicar fragmentos y generar tests en un portátil con 16 GB de memoria unificada, gracias a los 10,81 GB del fichero IQ2_M y a la aceleración Metal completa.
- Autocompletado y revisión en IDE sobre GPU de consumo: con 12,31 GB de VRAM dedicada en una RTX 3060 de 12 GB o superior, se puede servir una ventana de 8.192 tokens para revisar diffs o sugerir refactorizaciones sin enviar código a la nube.
- Prototipado de pipelines de CI/CD: el modelo puede integrarse vía llama.cpp u Ollama en un runner con CPU y AVX2 para tareas de generación de documentación o resumen de cambios, aceptando la ventana reducida de 4.096 tokens.
- Evaluación de modelos en investigación: sirve para estudiar el impacto de la cuantización IQ2_M (2,7 bpw) frente al modelo FP16 en tareas de código, comparando la retención de calidad declarada del 82,0 % con mediciones propias.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en local con LM Studio, Jan o llama.cpp, permite procesar código propietario sin salida de datos a terceros.
- Chat técnico en terminal: con `run-any-model` o `llama-cli` en modo conversacional, se puede usar como asistente de línea de comandos para consultas de programación y explicación de errores.
- Educación y demos: el bajo requisito de memoria (11,91 GB en Apple Silicon) facilita talleres y demostraciones de LLM de 32B en hardware de estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo proporciona métricas de tamaño y memoria del informe de auditoría:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/param | 2,7 bits/param | -83,1 % |
| Tamano de pesos | 64,08 GB | 10,81 GB | -83,1 % |
| Buffer KV cache | 1024,0 MB (FP16) | 1024,0 MB (FP16) | Optimizado |
| RAM residente total | 65,17 GB | 11,91 GB | -81,7 % |
| Calidad estimada | 100,0 % baseline | 82,0 % retenida | -18,0 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 64/64 capas | Optimo |

El propio autor advierte que el razonamiento matemático complejo puede sufrir una degradación menor con esta compresión.

## Requisitos de hardware

- VRAM estimada: 12,31 GB de VRAM dedicada en GPU NVIDIA (series RTX 30/40/50), con ventana óptima de 8.192 tokens.
- Apple Silicon: 11,91 GB de memoria unificada en M1/M2/M3/M4/M5, con aceleración Metal nativa y 8.192 tokens de contexto.
- CPU: 13,91 GB de RAM libre en Windows o Linux, con soporte AVX2/AVX-512 y contexto recomendado de 4.096 tokens.
- GPU recomendadas: RTX 3060 de 12 GB o superior para el umbral mínimo; modelos con 16 GB o más (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100, H100) dejan margen para contexto y KV cache.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB de VRAM, aunque el ajuste es calificado como "TIGHT FIT".
- Opciones de despliegue: `run-any-model` (CLI), Ollama (mediante Modelfile), llama.cpp (`llama-cli` con `-ngl 99`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Coder-32B-Instruct-GGUF (este) | 32,76 B | 32.768 nativo; 8.192 recomendado | GGUF IQ2_M (2,7 bpw), 10,81 GB | Apache 2.0 | Retencion de calidad declarada del 82,0 % |
| Qwen/Qwen2.5-Coder-32B-Instruct (base) | 32,76 B | 32.768 | safetensors FP16/BF16 (~64 GB) | Apache 2.0 | Referencia de calidad completa; requiere ~65 GB de memoria |
| Otras cuantizaciones GGUF del mismo base (Q4_K_M, Q5_K_M, Q8_0) | 32,76 B | 32.768 | GGUF, 4-8 bpw | Apache 2.0 | Mayor calidad que IQ2_M a costa de 19-35 GB; datos concretos no disponibles en la informacion proporcionada |
| Modelos coder de ~30B alternativos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantización IQ2_M a 2,7 bits por peso es agresiva: el propio autor estima una pérdida de calidad del 18,0 % y advierte de degradación en razonamiento matemático complejo.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la pérdida de precisión de los pesos; no hay evaluación publicada de este artefacto.
- Ventana de contexto efectiva reducida: 8.192 tokens en GPU y Apple Silicon y 4.096 en CPU, frente a los 32.768 del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni benchmarks independientes.
- El ajuste de memoria es "TIGHT FIT": en GPU de 12 GB el margen para KV cache y contexto es escaso y puede provocar desbordamiento a memoria del sistema.
- La model card incluye una cláusula de exención total de responsabilidad sobre los outputs; el usuario debe auditar y validar todo el código generado antes de usarlo en producción.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del modelo base, pero conviene verificar los términos del modelo Qwen2.5-Coder-32B-Instruct original.
- Los idiomas soportados no se detallan en la información disponible; la calidad multilingüe del artefacto cuantizado no está verificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Coder-32B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Organización ONIX: https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
