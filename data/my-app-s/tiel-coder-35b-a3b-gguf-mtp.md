# my-app-s/Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Tiel-Coder-35B-A3B-GGUF-MTP es una cuantización dinámica en formato GGUF del modelo Ornith-1.5-35B-A3B, publicada por el usuario my-app-s (con referencias cruzadas a la cuenta peculiar-ragdoll). No es un modelo entrenado desde cero, sino una redistribución optimizada para inferencia local con llama.cpp: incorpora una imatrix propia, cuantización dinámica de tipo unsloth-dynamic y la plantilla de chat Sharp dentro del propio archivo GGUF. Está orientada explícitamente a codificación agéntica y conversaciones multi-turno eficientes en tokens.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5-MoE, con 35B de parámetros totales y 3B activos por token, lo que permite velocidades de decodificación propias de un modelo pequeño con la capacidad de uno grande. El pipeline declarado es image-text-to-text, por lo que conserva capacidades de visión del modelo base. Los idiomas soportados son inglés y chino.

Su relevancia actual radica en el equilibrio que propone: según la model card, con cuantización de 4 bits y 22,7 GB resuelve 12 de 25 problemas de SWE-bench-Live, al nivel de Opus 4.6 en modo medium, y obtiene 67,2 en Claw-Eval multi-turno, por encima de su propio modelo base (65,3). El precio de ese equilibrio es un retroceso claro en conocimiento tipo examen: 73,7 en MMLU-Pro frente a 84,0 de una alternativa comparable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5-MoE, tag `qwen35moe`) |
| Parámetros totales | 35B (nombre del modelo); 446.571.248 según safetensors del repo (dato inconsistente con el nombre) |
| Parámetros activos | 3B (A3B) |
| Longitud de contexto | Hasta 262k según la model card (KV en RAM <5 GB a 16 bits); contexto recomendado de 131k-262k en al menos q8_0 KV |
| Tipos de cuantización | GGUF dinámica: UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ3_S, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_S (y superiores) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con decodificación especulativa MTP integrada |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer con mezcla de expertos de la familia Qwen3.5-MoE: 35B de parámetros totales con 3B activos por token. Esta configuración reduce el coste computacional por token y mantiene un KV cache pequeño en comparación con modelos densos de tamaño similar (menos de 5 GB de RAM para 262k de contexto a precisión de 16 bits, según la model card). El pipeline image-text-to-text indica que conserva la torre de visión del modelo base.

Esta publicación no entrena el modelo: aplica una cuantización dinámica con una imatrix propia del autor y embebe la plantilla de chat Sharp en el GGUF. Además incluye MTP (multi-token prediction) para decodificación especulativa, lo que acelera la generación en llama.cpp. La model card atribuye explícitamente el descenso de 4,3 puntos en MMLU-Pro frente a su base a la plantilla Sharp (respuestas más cortas), no a la cuantización: la misma cuantización con la plantilla original de Ornith reproduce exactamente la puntuación de Ornith. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO para el modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general, con rendimiento deliberadamente orientado a tareas prácticas más que a conocimiento enciclopédico.
- Codificación agéntica: resolución de issues reales en bases de código, con soporte para flujos multi-paso.
- Conversación multi-turno de alta calidad: 67,2 en Claw-Eval, con mejor calidad de respuesta y menos preguntas aclaratorias que su base.
- Capacidades de visión (pipeline image-text-to-text heredado del modelo base).
- Decodificación especulativa mediante MTP integrado en el GGUF, para acelerar la inferencia en llama.cpp.
- Eficiencia de tokens: la plantilla Sharp produce respuestas más concisas.
- Multilingüe limitado a inglés y chino.
- No se documenta en la información disponible soporte explícito de tool calling o function calling; debe verificarse contra el modelo base.

## Casos de uso

- Resolución de issues en repositorios reales: con 12 de 25 problemas resueltos en SWE-bench-Live y un tiempo mediano de 8,6 minutos por intento, es adecuado para pipelines de reparación automática de bugs sobre codebases existentes.
- Agentes de codificación en local: la combinación de MoE (3B activos), MTP y contexto de hasta 262k permite mantener sesiones agénticas largas en hardware de consumo con offloading parcial.
- Asistentes de conversación prolongada: su puntuación de 67,2 en Claw-Eval multi-turno y su menor tasa de preguntas aclaratorias lo hacen útil en atención técnica donde el usuario espera respuestas directas.
- Revisión y refactorización de código en CI/CD: el tamaño de 4 bits (22,7 GB) y la velocidad del MoE permiten integrarlo en runners con GPU de 24-32 GB para tareas de análisis y parcheo.
- Procesamiento de documentación técnica con imágenes: al conservar visión, puede analizar capturas, diagramas o documentación escaneada junto con texto.
- Despliegue en estaciones de trabajo con 16-24 GB: las variantes IQ3_XXS (13,6 GB) e IQ4_XS (18,1 GB) permiten ejecutarlo en GPUs de consumo con contexto reducido.
- Prototipado de agentes multi-paso en inglés o chino: útil para equipos que operan en esos dos idiomas y necesitan inferencia sin dependencia de API.

## Benchmarks y rendimiento

| Benchmark | Tiel-Coder | Ornith-1.5 (base) | Nail | Qwen3.6-35B-A3B stock | Opus 4.6 (medium) | Sonnet 5 (medium) |
|---|---|---|---|---|---|---|
| SWE-bench-Live (de 25) | 12 | 8 | 9 | 8 | 12 | 8 |
| Claw-Eval multi-turno | 67,2 | 65,3 | 60,5 | no disponible | no disponible | no disponible |
| MMLU-Pro (4 bits) | 73,7 | 78,0 | 84,0 | 85,3 | no disponible | no disponible |

Datos adicionales de la model card: tiempo mediano por intento en SWE-bench-Live de 8,6 minutos (media 12,3), frente a 7,2 de mediana y 15,7 de media en Nail. En Claw-Eval, Tiel supera a su base en 3,8 puntos de calidad de respuesta y reduce 5,1 puntos las preguntas aclaratorias, sobre 114 conversaciones puntuadas por modelo.

## Requisitos de hardware

- VRAM/RAM combinada estimada según la tabla del autor (el modelo puede repartirse entre RAM y VRAM con offloading parcial):
  - 16 GB: UD-IQ3_XXS (13,6 GB) como opción recomendada; UD-Q2_K_XL (12,7 GB) solo como último recurso.
  - 24 GB: UD-IQ4_XS (18,1 GB) con mayor margen de contexto; UD-Q4_K_XL (22,7 GB) justo.
  - 24-32 GB: UD-Q4_K_XL (22,7 GB) es el punto de partida recomendado y el tier con benchmarks publicados.
  - 32 GB: UD-Q5_K_S (25,3 GB) o superiores.
- KV cache: menos de 5 GB de RAM para 262k de contexto a 16 bits; se recomienda al menos q8_0 para codificación agéntica.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por capacidad de memoria encajan GPUs de 24 GB (RTX 4090, A10G), 32 GB (V100 32GB) y superiores (A100, H100) para contexto completo.
- Cabe en GPU de consumo: sí, con cuantizaciones de 3-4 bits en tarjetas de 16-24 GB, aceptando contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte MTP para decodificación especulativa). No se documentan otras opciones en la información disponible.
- Latencia y throughput: no se publican cifras de tokens por segundo; solo el tiempo por intento en SWE-bench-Live (mediana 8,6 min, media 12,3 min).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-Live (de 25) | Claw-Eval | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B | 35B totales / 3B activos | hasta 262k | 12 | 67,2 | 73,7 | MIT |
| Ornith-1.5-35B-A3B | 35B totales / 3B activos | no disponible | 8 | 65,3 | 78,0 | no disponible |
| Nail-Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | 9 | 60,5 | 84,0 | no disponible |
| Dirk-Qwen3.8-27B | 27B densos | no disponible | 15 | no disponible | no disponible | no disponible |

Tiel se posiciona como la mejor opción de su clase en codificación agéntica y conversación multi-turno, a costa de conocimiento tipo examen. Para tareas de razonamiento y conocimiento, Nail es superior (10,3 puntos en MMLU-Pro). Para maximizar reparaciones por problema, Dirk (denso 27B) resuelve 15 de 25 con 2,5 veces la velocidad de Qwen3.8-27B stock.

## Limitaciones y advertencias

- Rendimiento débil en conocimiento enciclopédico y tipo examen: 73,7 en MMLU-Pro, 10,3 puntos por debajo de Nail y 11,6 por debajo de Qwen3.6-35B-A3B stock.
- La plantilla Sharp reduce la longitud de las respuestas, lo que penaliza benchmarks de conocimiento y puede omitir matices en explicaciones largas.
- Menor tendencia a pedir aclaraciones ante peticiones ambiguas: beneficioso en conversación, arriesgado en tareas donde la ambigüedad debe resolverse antes de actuar.
- Solo inglés y chino; sin soporte documentado de español.
- La cuantización de 2 bits (UD-Q2_K_XL) degrada seriamente la capacidad agéntica según el propio autor; no debe usarse en producción.
- Discrepancia entre el nombre del modelo (35B) y el recuento de parámetros en safetensors del repo (446 millones), que debe verificarse antes de confiar en cualquier cifra de tamaño.
- Licencia MIT, permisiva para uso comercial, pero hereda las condiciones del modelo base Ornith-1.5, cuya licencia no se detalla en la información disponible.
- Riesgo de alucinación en código y hechos no verificado en la información proporcionada; los benchmarks se basan en 25 problemas y 114 conversaciones, muestras pequeñas con alta varianza.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/my-app-s/Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUFs sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Versión MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Variante CyberTiel: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Alternativa Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Alternativa Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
