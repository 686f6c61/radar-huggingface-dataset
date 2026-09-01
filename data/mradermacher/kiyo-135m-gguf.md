# mradermacher/Kiyo-135M-GGUF

## Resumen

Kiyo-135M es un modelo de lenguaje causal (decoder-only) de 135 millones de parámetros, preentrenado desde cero sobre 200 mil millones de tokens procedentes principalmente de FineWeb-Edu, según la información de FriendliAI. El modelo base fue desarrollado por DedeProGames y posteriormente cuantizado al formato GGUF por mradermacher, lo que permite su ejecución eficiente en CPU y GPU de bajos recursos. Su relevancia radica en su tamaño reducido, su licencia Apache 2.0 y su disponibilidad en múltiples cuantizaciones, lo que lo convierte en una opción atractiva para entornos con restricciones de memoria o para tareas de generación de texto sencillas. La arquitectura es similar a la familia Llama/SmolLM, según las etiquetas del repositorio, aunque no se especifican detalles adicionales como el número de capas o la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, similar a Llama/SmolLM (según tags) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only, con una arquitectura que sigue el diseño de los modelos Llama/SmolLM, aunque no se han publicado detalles específicos sobre el número de capas, dimensiones ocultas o mecanismos de atención. Según la información de FriendliAI, fue preentrenado desde cero sobre 200 mil millones de tokens extraídos de FineWeb-Edu, un dataset educativo filtrado. Además, en la configuración del modelo se listan otros datasets utilizados durante el entrenamiento: DCLM-baseline-1.0, Finemath y Stack-v3-train, lo que sugiere que el modelo también fue expuesto a datos de razonamiento matemático y código fuente. No se menciona ningún proceso de ajuste fino supervisado (SFT) ni de optimización con RLHF/DPO, por lo que se trata de un modelo base sin instrucciones específicas.

## Capacidades

- Generación de texto en inglés: produce texto coherente y contextualmente relevante, aunque con limitaciones propias de su tamaño.
- Razonamiento básico: puede resolver tareas simples de lógica y comprensión, pero no es adecuado para razonamiento complejo o multi-paso.
- Capacidades de código: al haber sido entrenado con el dataset Stack-v3, puede generar fragmentos de código sencillos y completar patrones comunes.
- Capacidades matemáticas: el entrenamiento con Finemath le confiere cierta habilidad para operaciones aritméticas y problemas matemáticos elementales.
- No soporta tool calling, ni visión, ni audio, ni modo de pensamiento explícito.
- Es monolingüe en inglés; no se ha entrenado para otros idiomas.

## Casos de uso

- Clasificación de texto ligera: puede utilizarse como extractor de características para tareas de clasificación de sentimiento o categorización de documentos, gracias a su tamaño reducido y su capacidad de generar representaciones contextuales.
- Generación de texto en dispositivos con recursos limitados: al estar cuantizado en GGUF, puede ejecutarse en CPU o en GPUs con poca VRAM, lo que lo hace adecuado para aplicaciones embebidas o edge computing.
- Prototipado rápido de aplicaciones de lenguaje: su pequeño tamaño permite iterar rápidamente en experimentos de generación de texto, completado de frases o autocompletado de formularios.
- Fine-tuning para tareas específicas: al ser un modelo base, puede ajustarse con datasets propios para dominios concretos como análisis de documentos técnicos o generación de informes breves.
- Asistente de escritura básico: puede sugerir continuaciones de texto o corregir gramática en inglés, aunque con menor calidad que modelos más grandes.
- Educación y demostraciones: sirve como ejemplo didáctico para enseñar conceptos de modelos de lenguaje, cuantización y despliegue en entornos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF varían entre 0,2 GB (cuantizaciones Q2_K a Q8_0) y 0,4 GB (f16). La VRAM necesaria es inferior a 1 GB en la mayoría de los casos, incluso con overhead de inferencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, RTX 2060 o superiores. También puede ejecutarse en CPU con suficiente RAM (menos de 1 GB para el modelo).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, por tamaño y arquitectura, puede compararse con otros modelos de 135M parámetros como SmolLM-135M, también de la familia Llama, o con los modelos cuantizados por mradermacher como kimi-coder-135m o Quark-135m. Todos comparten licencia Apache 2.0 y formato GGUF, pero no hay información pública que permita una comparación cuantitativa.

## Limitaciones y advertencias

- Tamaño reducido: con solo 135M parámetros, su capacidad de razonamiento y generación es limitada en comparación con modelos de cientos de miles de millones de parámetros.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso a aplicaciones monolingües.
- Sin fine-tuning instructivo: al ser un modelo base, no sigue instrucciones de forma natural; requiere ajuste o prompts cuidadosamente diseñados.
- Longitud de contexto desconocida: no se ha especificado la ventana de contexto, lo que puede afectar a tareas que requieran entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero es recomendable revisar los términos de los datasets utilizados (FineWeb-Edu, DCLM, etc.) para asegurar el cumplimiento de sus respectivas licencias.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/mradermacher/Kiyo-135M-GGUF
- Modelo base: https://huggingface.co/DedeProGames/Kiyo-135M
- Página de FriendliAI con información del modelo: https://friendli.ai/models/DedeProGames/Kiyo-135M
