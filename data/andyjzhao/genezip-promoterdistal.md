# andyjzhao/GeneZip-PromoterDistal

## Resumen

GeneZip-PromoterDistal es un modelo de lenguaje de ADN (DNA language model) preentrenado, publicado por el autor andyjzhao bajo el nombre "Camera Ready" del proyecto GeneZip. No se trata de un checkpoint afinado para una tarea concreta, sino de pesos de preentrenamiento destinados a servir como base para investigación en modelado de secuencias genómicas y para recetas de evaluación sobre el benchmark DNALongBench.

El modelo se distribuye como un checkpoint personalizado de GeneZip, no como un paquete compatible con `AutoModel` de Transformers. Su contexto de preentrenamiento es de 12.800 pares de bases (bp) y emplea un objetivo de compresión base de 64 bp por token, un dato que el autor aclara explícitamente que no equivale al ratio de compresión medido. Los pesos provienen de una revisión fijada del repositorio `jzshared/GeneZip-PromoterDistal-64BPT-100B` y se han verificado por hash SHA-256.

La relevancia del modelo radica en su enfoque de tokenización por compresión para secuencias largas de ADN, orientado a tareas genómicas que requieren ventanas de contexto amplias, como la predicción de regiones promotoras distales. El repositorio tiene un tamaño de 0,3 GB y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GeneZip (checkpoint personalizado, no Transformers AutoModel); detalles en `hydra_cfg.yaml` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 12.800 bp (contexto de preentrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PyTorch (repo de 0,3 GB); SHA-256 `0f85630b2bed4452430e7bf78a54f35b5c5b1673115cc5b86f3ad286e1b205da` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un checkpoint GeneZip con configuración Hydra reducida a arquitectura, routing y metadatos científicos. El autor indica que `hydra_cfg.yaml` registra los límites exactos de arquitectura y routing, pero no se proporcionan en la model card los detalles de capas, dimensiones ocultas ni mecanismo de atención. El contexto de preentrenamiento es de 12.800 bp y el objetivo de compresión base es de 64 bp por token.

Los pesos proceden de la revisión fijada del checkpoint `checkpoint-30600` del repositorio `jzshared/GeneZip-PromoterDistal-64BPT-100B`, y el autor afirma que los bytes de los pesos no han cambiado respecto a esa fuente. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. El repositorio no contiene pesos afinados para tareas posteriores ni estado del optimizador.

## Capacidades

- Modelado de secuencias genómicas de ADN con ventanas de contexto de hasta 12.800 bp.
- Tokenización orientada a compresión de secuencias (objetivo base de 64 bp por token).
- Preentrenamiento como base para fine-tuning en tareas genómicas posteriores.
- Soporte para recetas de evaluación del benchmark DNALongBench según el código GeneZip.
- Carga e inferencia mediante el código Camera Ready del repositorio `AndyJZhao/GeneZip`.
- No se documentan capacidades de generación de texto natural, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Predicción de promotores distales: el checkpoint sirve como base para afinar un clasificador o modelo de regresión sobre regiones promotoras alejadas del sitio de inicio de transcripción, aprovechando el contexto de 12.800 bp para capturar señales reguladoras a larga distancia.
- Investigación en modelado de secuencias largas de ADN: el objetivo de compresión de 64 bp por token permite procesar ventanas genómicas amplias con un número reducido de tokens, lo que resulta útil para estudiar dependencias de largo alcance en el genoma.
- Fine-tuning en tareas de anotación genómica: partiendo de los pesos preentrenados, se pueden entrenar cabezas específicas para clasificación de elementos reguladores, sitios de unión de factores de transcripción u otras etiquetas funcionales.
- Reproducción de resultados en DNALongBench: el modelo está pensado para ejecutar las recetas de evaluación del benchmark y comparar con las ejecuciones adoptadas en el código de referencia.
- Experimentos de ablación sobre tokenización por compresión: investigadores pueden comparar el objetivo de 64 bp por token frente a tokenizaciones de menor granularidad en tareas de predicción genómica.
- Base para estudios de transferencia en genómica comparativa: al ser un checkpoint de propósito general para ADN, puede adaptarse a distintos organismos o regiones mediante fine-tuning supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones cortas de carga y ejecución no constituyen nuevas mediciones del rendimiento completo en benchmarks y remite al mapeo de resultados del código para las ejecuciones adoptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 0,3 GB, pero no se especifica el número de parámetros ni el pico de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el reducido tamaño del repositorio (0,3 GB) sugiere que podría caber en GPU de consumo, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: carga mediante `snapshot_download` de `huggingface_hub` y ejecución con el código Camera Ready de `AndyJZhao/GeneZip`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un checkpoint afinado para tareas posteriores: requiere fine-tuning o adaptación para uso en predicción concreta.
- No es un paquete compatible con `AutoModel` de Transformers; la integración depende del código personalizado de GeneZip.
- El código Camera Ready se está preparando por separado; los pesos se han verificado con una versión candidata local, lo que introduce un riesgo de incompatibilidad con versiones futuras.
- El objetivo de compresión de 64 bp por token es un objetivo de entrenamiento, no el ratio de compresión medido; no debe interpretarse como una métrica de rendimiento.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas aplicables, al tratarse de un modelo de secuencias de ADN y no de lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks publicados impide avalar su rendimiento en producción.
- El repositorio no incluye estado del optimizador ni pesos afinados, lo que limita la reanudación directa del preentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andyjzhao/GeneZip-PromoterDistal
- Repositorio de código GeneZip: https://github.com/AndyJZhao/GeneZip
- Fuente de los pesos: https://huggingface.co/jzshared/GeneZip-PromoterDistal-64BPT-100B/tree/1520f073a6765d0ae338ede823e32e4b501da67f/checkpoint-30600
