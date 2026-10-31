# KeyAI-LLM/Sage-A1.5-35B-A3B-oQ8e-MLX-MTP

## Resumen

Sage-A1.5-35B-A3B-oQ8e-MLX-MTP es una versión cuantizada a 8 bits, convertida al formato MLX con capa de Multi-Token Prediction (MTP), del modelo Sage-A1.5 desarrollado por InternScience (Shanghai AI Laboratory). Se trata de un modelo de visión-lenguaje agéntico de 35B parámetros con arquitectura Mixture-of-Experts (MoE), basado en Qwen3.6 y Agents-A1, especializado en resolución de problemas científicos de horizonte largo, orquestación agéntica, uso de herramientas y razonamiento multi-paso.

Esta publicación concreta, mantenida por KeyAI-LLM, está optimizada específicamente para Apple Silicon (Macs con chips de serie M y memoria unificada), reduciendo la huella de memoria y la latencia manteniendo el rendimiento de razonamiento y multimodal del original. El repositorio pesa 38,6 GB y el autor recomienda encarecidamente ejecutarlo con el motor oMLX, soportado en versiones recientes de LM Studio.

Es relevante porque pone al alcance de usuarios de hardware Apple un modelo agéntico multimodal de gran tamaño que, de otro modo, requeriría servidores con GPUs de datacenter, y porque la capa MTP integrada acelera la generación al predecir varios tokens por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language (basada en Qwen3.6 / Agents-A1), con capa MTP |
| Parametros totales | 35.951.822.704 (≈ 35,95 B) |
| Parametros activos | ≈ 3B (A3B, según la nomenclatura del modelo; el valor exacto no está detallado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (modo oQ8e-MLX-MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Sage-A1.5 es un modelo MoE de 35B parámetros totales con aproximadamente 3B parámetros activos por token (según la denominación A3B), lo que permite combinar la capacidad de un modelo grande con la latencia y el coste de uno pequeño. La variante aquí fichada añade una capa de Multi-Token Prediction (MTP), que predice varios tokens por paso de decodificación para acelerar la inferencia, y está cuantizada a 8 bits en formato MLX para Apple Silicon. Incluye un componente de visión (pipeline image-text-to-text), por lo que incorpora un encoder de imágenes sobre la base lingüística.

El modelo original es fruto del trabajo de Shanghai AI Laboratory sobre Qwen3.6 y Agents-A1, y según la cita bibliográfica (arXiv:2610.28578) se centra en la transición de la ejecución de horizonte largo a la exploración científica mediante composición de capacidades. No se dispone de datos publicados en la model card sobre el número de tokens de entrenamiento, composición del dataset ni sobre el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional con razonamiento multi-paso (multi-step reasoning).
- Resolución de problemas científicos de horizonte largo (long-horizon scientific problem solving).
- Comprensión de imágenes y entradas multimodales (texto + imagen), clasificada como image-text-to-text.
- Uso de herramientas (tool-use) y orquestación agéntica, orientado a flujos de agentes.
- Generación de código (tag "code" en la model card).
- Aceleración de generación mediante la capa MTP integrada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Resolución de problemas científicos multi-paso: el modelo puede descomponer problemas complejos de investigación en etapas encadenadas y razonar sobre ellas de forma iterativa, gracias a su entrenamiento específico en horizonte largo.
- Agentes que usan herramientas: puede integrarse en frameworks agénticos (LangChain, custom orchestrators) que requieran llamadas a funciones, búsqueda web o ejecución de código, dado su tag de tool-use y agentic.
- Análisis de diagramas y documentos científicos: mediante entradas de imagen, puede analizar figuras, esquemas o gráficas y explicar los hallazgos clave, útil en laboratorios y equipos de I+D.
- Asistente de código con razonamiento: generación y depuración de código en flujos de desarrollo, apoyándose en sus capacidades de razonamiento multi-paso.
- Servidor local compatible con OpenAI: puede desplegarse como API local (mlx_vlm.server o LM Studio con oMLX) para alimentar aplicaciones que usan el SDK de OpenAI sin enviar datos a la nube.
- Investigación en composición de capacidades agénticas: dado su enfoque en "capability composition", es adecuado como base experimental para estudiar cómo los modelos componen habilidades en tareas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo cuantizado a 8 bits ocupa unos 38,6 GB, por lo que se necesita un Mac Apple Silicon con memoria unificada suficiente: en la práctica, al menos 48 GB de RAM unificada (idealmente 64 GB o más) para alojar pesos, KV-cache y el sistema operativo con holgura.
- No es viable en GPUs NVIDIA convencionales con esta variante: el formato MLX está restringido a Apple Silicon. Para GPUs NVIDIA habría que recurrir al modelo original InternScience/Sage-A1.5 (no disponible aquí).
- Macs recomendados: Mac Studio M2/M3/M4 Ultra o Mac con M-series Max y 64 GB+ de memoria unificada.
- Motor recomendado: oMLX (soportado en versiones recientes de LM Studio). También funciona con mlx-vlm (CLI, API Python y servidor compatible con OpenAI en el puerto 8000).
- Latencia y throughput: no disponibles en cifras concretas; la model card indica que la cuantización de 8 bits con capa MTP "reduce significativamente la huella de memoria y la latencia" respecto al modelo original.
- Parámetros de generación recomendados: temperature 0,8; top_p 0,95; top_k 40; min_p 0,05; presence_penalty 1,5; repetition_penalty 1,1.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Multimodal | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Sage-A1.5-35B-A3B-oQ8e-MLX-MTP (este) | ≈ 35,95 B | ≈ 3 B | Sí (imagen+texto) | 8 bits (MLX, MTP) | Apache 2.0 | Apple Silicon |
| Qwen3-VL (familia, base de la arquitectura) | varias tallas MoE | variable | Sí | múltiple (incl. 8 bits MLX) | Apache 2.0 | multiplataforma |
| InternVL3 (variantes ~30-38B) | ≈ 30-38 B | densas o MoE según variante | Sí | múltiple | Apache 2.0 (según variante) | multiplataforma |

Nota: la comparativa es orientativa; los datos exactos de las alternativas dependen de la variante concreta y no se han verificado cifras de rendimiento frente a este modelo.

## Limitaciones y advertencias

- Requiere exclusivamente hardware Apple Silicon con memoria unificada amplia (38,6 GB solo de pesos); no es usable en la mayoría de portátiles ni en GPUs NVIDIA con esta variante.
- La longitud de contexto no está publicada, lo que dificulta planificar tareas de contexto largo.
- Los idiomas soportados no están documentados; asumir buen rendimiento en idiomas distintos del inglés requiere verificación propia.
- Con solo 11 descargas y 1 like en el momento de la ficha, se trata de una conversión comunitaria (KeyAI-LLM) con poca trazabilidad: conviene validar la calidad de la conversión frente al modelo original.
- El modelo base es reciente y agéntico; como todo LLM, puede alucinar, especialmente en dominios científicos donde genera afirmaciones plausibles pero incorrectas. Verificar siempre salidas críticas.
- El rendimiento con la capa MTP depende del soporte del motor (oMLX); en motores sin soporte MTP el comportamiento puede degradarse o no funcionar.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los términos de atribución y la cita del trabajo original (arXiv:2610.28578).

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/KeyAI-LLM/Sage-A1.5-35B-A3B-oQ8e-MLX-MTP
- Modelo original no cuantizado: https://huggingface.co/InternScience/Sage-A1.5
- Paper (arXiv): https://arxiv.org/abs/2610.28578
