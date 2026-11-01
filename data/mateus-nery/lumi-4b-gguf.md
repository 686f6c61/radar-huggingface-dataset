# Mateus-Nery/lumi-4b-GGUF

## Resumen

Lumi-4B es un modelo de lenguaje de aproximadamente 3.970 millones de parámetros desarrollado por CEIA (centro de investigación brasileño) y orientado específicamente al portugués. Esta ficha describe la versión cuantizada en GGUF publicada por Mateus-Nery, que convierte los pesos originales en BF16 a una familia de cuantizaciones optimizadas para llama.cpp, con el objetivo de reducir requisitos de memoria manteniendo la fidelidad respecto al modelo base.

El modelo resuelve el problema de desplegar un LLM de tamaño medio en portugués sobre hardware modesto: la cuantización Q5_K_S ocupa 3,04 GB y la IQ4_XS apenas 2,41 GB, lo que permite ejecución en GPU de consumo y en CPU. La model card incluye mediciones rigurosas de divergencia KL, coincidencia top-1 con BF16, resultados en pruebas de opción múltiple (Global MMLU, MMLU-ProX, IFEval PT), ENEM y preguntas sobre documentos largos, además de benchmarks de velocidad en RTX 5070 Ti y en CPU.

La relevancia actual es doble: por un lado, el portugués sigue siendo un idioma con menos oferta de modelos abiertos de calidad; por otro, el trabajo de cuantización aporta datos verificables sobre cuánto degrada cada nivel de compresión, algo que rara vez se documenta con este detalle. El contexto nativo del modelo base no se especifica en la información disponible, aunque los ejemplos de uso manejan documentos de hasta 51.000 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ceia-br/lumi-4b; tags mencionan "nemotron") |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de evaluación usan documentos de hasta 51.000 tokens) |
| Tipos de cuantización | BF16, Q6_K_XL, Q6_K, Q4_K_XL, Q5_K_S, Q3_K_XL, IQ4_XS |
| Idiomas soportados | portugués (pt) |
| Licencia | other, denominada "lumi-4b" (enlace a la licencia del modelo base) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base ceia-br/lumi-4b en la documentación proporcionada. Los tags del repositorio incluyen "nemotron", lo que sugiere una posible relación con la familia de modelos Nemotron, pero no se confirma la arquitectura concreta (transformer denso, MoE u otra). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: cada variante GGUF se midió contra el original en BF16 con el mismo llama.cpp, temperatura 0 y razonamiento desactivado. Se generó una matriz de importancia (imatrix-lumi-pt.gguf, 4 MB) específica para portugués, que se usa en las cuantizaciones IQ. La coincidencia top-1 con BF16 va del 99,0% en Q6_K_XL al 94,2% en IQ4_XS, y la divergencia KL aumenta de 0,0004 a 0,0134 en ese mismo rango.

## Capacidades

- Generación de texto conversacional en portugués, con soporte de plantilla de chat mediante la opción `--jinja` de llama.cpp.
- Razonamiento de opción múltiple en portugués (evaluado con Global MMLU, MMLU-ProX y pruebas tipo ENEM).
- Seguimiento de instrucciones en portugués (evaluado con 535 instrucciones del Portuguese-IFEval).
- Preguntas sobre documentos largos: la evaluación incluye 10 documentos de entre 700 y 51.000 tokens, con respuestas correctas, cálculos con razonamiento y rechazo explícito cuando el dato no está en el documento.
- Generación de código en el contexto de creación de páginas web (el ejemplo de la model card muestra la generación de una landing page).
- Modo de razonamiento activable/desactivable (las evaluaciones se hicieron con razonamiento desactivado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.

## Casos de uso

- Atención al cliente en portugués: el modelo puede gestionar conversaciones multi-turno con plantilla de chat y un consumo de memoria reducido (3,04 GB en Q5_K_S), lo que permite desplegarlo en servidores modestos o incluso en estaciones de trabajo sin GPU dedicada.
- Análisis de contratos y documentos legales: la evaluación sobre documentos de hasta 51.000 tokens y el buen comportamiento al declarar "no está en el documento" (11 de 11 aciertos en todas las cuantizaciones) lo hacen adecuado para extracción de datos y revisión documental donde la abstención es crítica.
- Asistencia educativa y preparación de exámenes: con un 83,4% de acierto en 803 preguntas de humanas y lenguajes del ENEM, es útil para generar explicaciones, preguntas de práctica y material de estudio en portugués.
- Generación de código y prototipado web: la model card demuestra la generación de una landing page completa; puede integrarse en flujos de creación rápida de interfaces o snippets.
- Procesamiento por lotes en CPU: con 17,2 tokens/s de escritura en un Core Ultra 5 245KF usando Q5_K_S, es viable para tareas de clasificación, resumen o extracción masiva sin GPU.
- Despliegue en GPU de consumo: la Q4_K_XL (3,13 GB) alcanza 224 tokens/s de escritura en una RTX 5070 Ti, suficiente para asistentes interactivos locales con baja latencia.
- Investigación sobre cuantización: el repositorio incluye métricas de KLD y top-1 para cada variante, lo que permite estudiar el compromiso entre tamaño y fidelidad en un modelo real.

## Benchmarks y rendimiento

Resultados de las pruebas de la model card (1000 preguntas por test de opción múltiple y 535 instrucciones de Portuguese-IFEval):

| Variante | Medio | Graduación | Global MMLU | MMLU-ProX | IFEval PT | Media |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 43,0 | 47,9 | 59,4 | 33,8 | 35,7 | 44,0 |
| Q6_K_XL | 42,7 | 48,3 | 59,3 | 33,7 | 37,0 | 44,2 |
| Q6_K | 42,9 | 47,9 | 58,6 | 33,4 | 34,4 | 43,4 |
| Q4_K_XL | 42,0 | 46,9 | 58,8 | 33,6 | 35,0 | 43,3 |
| Q5_K_S | 42,6 | 46,8 | 57,7 | 34,1 | 34,4 | 43,1 |
| Q3_K_XL | 41,5 | 45,8 | 58,7 | 34,0 | 34,2 | 42,8 |
| IQ4_XS | 42,5 | 46,9 | 58,0 | 34,1 | 34,6 | 43,2 |

ENEM (803 preguntas de humanas y lenguajes, sin imagen, 2009–2017 y 2022–2025):

| Variante | BF16 | Q6_K_XL | Q6_K | Q5_K_S | Q4_K_XL | Q3_K_XL | IQ4_XS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Acierto | 83,4% | 83,5% | 83,8% | 83,7% | 83,7% | 82,8% | 82,1% |

Preguntas sobre documentos (90 preguntas con respuesta sobre 10 documentos de 700 a 51.000 tokens):

| Variante | Dato del documento (54) | Cálculo con razonamiento (5) | "No está en el documento" (11) |
|---|---:|---:|---:|
| BF16 | 43 | 1 | 11 |
| Q6_K_XL | 43 | 3 | 11 |
| Q6_K | 42 | 3 | 11 |
| Q4_K_XL | 42 | 1 | 11 |
| Q5_K_S | 40 | 2 | 11 |
| Q3_K_XL | 45 | 2 | 11 |
| IQ4_XS | 40 | 1 | 11 |

Velocidad en tokens por segundo (llama-bench, RTX 5070 Ti y Core Ultra 5 245KF de 14 núcleos, DDR5-5600):

| Variante | GB | GPU lectura 4096 | GPU escritura | GPU escritura 16k contexto | CPU lectura 512 | CPU escritura |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 7,96 | 9.684 | 104 | 100 | 99 | 7,5 |
| Q6_K_XL | 4,56 | 11.365 | 162 | 148 | 99 | 12,3 |
| Q6_K | 3,93 | 10.762 | 183 | 172 | 110 | 13,9 |
| Q4_K_XL | 3,13 | 11.244 | 224 | 208 | 82 | 16,3 |
| Q5_K_S | 3,04 | 10.896 | 227 | 212 | 76 | 17,2 |
| Q3_K_XL | 2,68 | 11.333 | 252 | 233 | 156 | 19,4 |
| IQ4_XS | 2,41 | 11.960 | 268 | 246 | 155 | 20,9 |

Fidelidad respecto a BF16:

| Variante | Bits/peso | KLD (PT) | Igual a BF16 (top-1) |
|---|---:|---:|---:|
| Q6_K_XL | 9,2 | 0,0004 | 99,0% |
| Q6_K | 7,9 | 0,0006 | 98,8% |
| Q4_K_XL | 6,3 | 0,0039 | 97,1% |
| Q5_K_S | 6,1 | 0,0038 | 96,8% |
| Q3_K_XL | 5,4 | 0,0122 | 94,4% |
| IQ4_XS | 4,9 | 0,0134 | 94,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,41 GB (IQ4_XS) y 7,96 GB (BF16) solo para los pesos; hay que añadir el espacio de la caché KV, que crece con el contexto (el ejemplo de la model card usa `-c 32768`).
- GPU recomendadas: RTX 5070 Ti (mediciones oficiales); cualquier GPU con al menos 4-8 GB de VRAM puede alojar las cuantizaciones Q4/IQ4. Para BF16 se recomienda una GPU de 12 GB o más.
- Cabe en GPU de consumo: sí, todas las cuantizaciones por debajo de BF16 caben en tarjetas de 4-8 GB; la Q3_K_XL (2,68 GB) y la IQ4_XS (2,41 GB) son las más ligeras.
- Despliegue: llama.cpp (llama-server, llama-cli, llama-bench), con soporte de plantilla de chat mediante `--jinja`. No se mencionan otros motores (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: en RTX 5070 Ti, 104 tokens/s de escritura en BF16 y hasta 268 tokens/s en IQ4_XS; con 16k de contexto, 100 tokens/s en BF16 y 246 tokens/s en IQ4_XS. En CPU (Core Ultra 5 245KF), de 7,5 a 20,9 tokens/s de escritura según la cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, se puede comparar con otros modelos abiertos en portugués de tamaño similar, pero no se aportan sus métricas:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumi-4B (esta ficha) | 3,97 B | no disponible | other ("lumi-4b") | GGUF, BF16 | Enfoque en portugués; cuantizaciones documentadas con KLD |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente en portugués; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Los resultados en MMLU-ProX (33,8 en BF16) y en la media general (44,0) indican un rendimiento moderado en razonamiento complejo; no es adecuado para tareas que exijan razonamiento de alto nivel sin verificación humana.
- En preguntas sobre documentos, el acierto en extracción de datos es del orden del 80% (43 de 54) y el rendimiento en cálculos con razonamiento es muy bajo (1 de 5 en BF16); conviene validar las respuestas numéricas.
- Riesgo de alucinación inherente a los LLM; aunque el modelo acierta al declarar información ausente (11 de 11), no hay garantía fuera del conjunto evaluado.
- La licencia es "other" con nombre "lumi-4b" y enlace a la licencia del modelo base; es imprescindible revisar los términos del modelo base ceia-br/lumi-4b antes de cualquier uso comercial.
- Las cuantizaciones de menor tamaño (Q3_K_XL, IQ4_XS) degradan la fidelidad respecto a BF16 (94,4% y 94,2% de coincidencia top-1) y pueden afectar a tareas sensibles a pequeños cambios en la distribución de probabilidad.
- No se especifica la longitud de contexto nativa del modelo base; los ejemplos con 32k de contexto y documentos de 51.000 tokens no confirman que el modelo haya sido entrenado para esa ventana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF
- Modelo base: https://huggingface.co/ceia-br/lumi-4b
- Licencia del modelo base: https://huggingface.co/ceia-br/lumi-4b
- Vídeo comparativo BF16 vs Q6_K_XL: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF/resolve/main/lumi-lado-a-lado.mp4
- Gráfico tamaño vs coincidencia top-1: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF/resolve/main/grafico-tamanho-top1.png
- Gráfico tamaño vs velocidad GPU: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF/resolve/main/grafico-velocidade-gpu.png
- Gráfico tamaño vs velocidad CPU: https://huggingface.co/Mateus-Nery/lumi-4b-GGUF/resolve/main/grafico-velocidade-cpu.png
