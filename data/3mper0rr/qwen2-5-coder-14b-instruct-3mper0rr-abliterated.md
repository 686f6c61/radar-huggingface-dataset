# 3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated

## Resumen

3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated es una variante "abliterated" del modelo Qwen2.5-Coder-14B-Instruct de Alibaba Qwen, publicada por el usuario 3MPER0RR en Hugging Face. Se trata de un fine-tune de tipo abliteration: una intervención sobre los pesos del modelo base que elimina o atenúa la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo tiende a responder a peticiones que el modelo original rechazaría. No es un modelo nuevo entrenado desde cero, sino una modificación quirúrgica de los tensores del original.

El modelo conserva la arquitectura, el tokenizador y la mayor parte de los pesos del Qwen2.5-Coder-14B-Instruct: 14.770.033.664 parámetros en formato safetensors, con licencia Apache 2.0 heredada del base. Según la model card, se compararon 579 tensores entre base y variante, de los cuales 65 (11,23%) resultaron modificados y 514 (88,77%) permanecieron idénticos, sin discrepancias estructurales ni de formas o tipos de datos.

Es relevante ahora porque el ecosistema de modelos "abliterated" ha crecido como herramienta de investigación sobre alineamiento y seguridad, y porque ofrece a desarrolladores e investigadores un punto de partida para estudiar el comportamiento de un modelo de código de 14B sin las capas de rechazo del original. Ahora bien, esa misma característica implica riesgos importantes para uso en producción, que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-Coder-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-Coder-14B-Instruct soporta 32.768 tokens nativos, ampliable; dato no confirmado para esta variante) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el base admite cuantizaciones habituales GPTQ/AWQ/GGUF, no verificadas para esta variante) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-Coder-14B-Instruct: un transformer decoder-only denso con atención por causalidad estándar, 14.770 millones de parámetros y el tokenizador de Qwen2.5. La variante abliterated no introduce cambios estructurales: la model card confirma que los 579 tensores comparados mantienen formas y tipos de datos coincidentes con el base, y que solo 65 tensores (11,23%) fueron modificados.

El método de abliteration consiste en identificar la dirección de activación asociada al rechazo (habitualmente mediante diferencias de activaciones entre prompts dañinos y benignos) y proyectar los pesos para eliminarla o reducirla. La model card menciona "Trials: 200" y estado "Tested and saved", lo que sugiere un proceso iterativo de búsqueda de la intervención, pero no documenta el dataset, el número de tokens, ni si hubo entrenamiento adicional, RLHF o DPO. No se dispone de información sobre datos de entrenamiento, composición del corpus ni innovaciones técnicas adicionales más allá de la propia intervención de abliteration.

## Capacidades

- Generación de texto y código: hereda las capacidades del Qwen2.5-Coder-14B-Instruct, orientadas a generación y completado de código en múltiples lenguajes.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas de forma independiente en esta variante.
- Conversación multi-turno: etiquetado como "conversational" y "text-generation" en Hugging Face.
- Tool calling / function calling: no documentado en la información proporcionada para esta variante (el base lo soporta, pero no se ha verificado aquí).
- Agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; los idiomas no están disponibles en la información proporcionada.
- Respuesta a peticiones que el modelo base rechazaría: es la característica diferencial de la abliteration, aunque no se cuantifica su alcance en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve para estudiar empíricamente cómo la abliteration afecta a la tasa de rechazo, la utilidad y la coherencia en tareas de código, comparando respuestas contra el base Qwen2.5-Coder-14B-Instruct con los mismos prompts.
- Evaluación de robustez de filtros de contenido: permite construir conjuntos de prompts que el modelo base rechaza y medir cómo responde la variante, útil para diseñar clasificadores y capas de moderación externas.
- Generación de código en entornos controlados de investigación: al conservar el 88,77% de los tensores intactos, puede usarse para experimentos de completado de código donde se necesita un modelo de 14B sin capas de rechazo, siempre con revisión humana.
- Análisis de diferencias de pesos: los 65 tensores modificados permiten estudiar qué componentes del modelo concentran la dirección de rechazo, un caso de interpretabilidad mecanicista concreto.
- Reproducción de experimentos de abliteration: la model card documenta el recuento de tensores y el número de ensayos, lo que facilita replicar o comparar metodologías con otros modelos abliterated.
- Benchmarking de modelos de código de 14B: útil como punto de comparación en evaluaciones de HumanEval, MBPP o similares frente al base, para medir el coste de la abliteration en rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29,5 GB solo para pesos (14,77B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 32 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB de pesos, más overhead; viable en GPUs de 24 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 8-9 GB de pesos, más overhead; viable en GPUs consumer de 12-16 GB, aunque no se ha verificado la disponibilidad de cuantizaciones para esta variante concreta.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 sin cuantizar; RTX 4090 (24 GB) para 8 bits o FP16 con offloading parcial; RTX 3090, 4080 o 4090 para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4-8 bits en GPUs de 12-24 GB, sujeto a verificación de que existan pesos cuantizados publicados.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen2, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa creación de Modelfile) y transformers. No se documenta compatibilidad verificada para esta variante concreta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated | 14,77B | No disponible | Apache 2.0 | Variante abliterated; 65 de 579 tensores modificados |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77B | 32.768 tokens nativos (dato del base, no confirmado aquí) | Apache 2.0 | Modelo base alineado, con rechazo activo |
| Otras variantes abliterated de Qwen2.5-Coder-14B | 14,77B | No disponible | Apache 2.0 (heredada) | Metodologías y recuentos de tensores variables; no comparadas en la información disponible |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce o elimina el rechazo del modelo base: puede generar contenido dañino, código malicioso o instrucciones peligrosas que el original bloquearía. No es apto para producción sin capas de moderación externas.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado, ya que la intervención sobre pesos puede afectar a la calibración; no se ha evaluado en la model card.
- Sesgos: no documentados para esta variante; los sesgos del base Qwen2.5-Coder-14B-Instruct no se han medido aquí.
- Idiomas y contexto: no disponibles en la información proporcionada; no se debe asumir el contexto de 32K del base sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor incluye un aviso de "Research Notice" y un Disclaimer en el repositorio; conviene leerlos antes de cualquier despliegue.
- Solo 1 like y 1.721 descargas en el momento de la consulta: es un modelo de nicho, sin validación comunitaria amplia ni evaluaciones independientes.
- La model card no documenta el dataset, el procedimiento exacto de abliteration ni los hiperparámetros, lo que dificulta la reproducibilidad.
- No se han verificado cuantizaciones publicadas para esta variante; la conversión a GGUF o GPTQ/AWQ correría por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia del repositorio: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated/blob/main/LICENSE
- Disclaimer del autor: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated/blob/main/Disclaimer.md
