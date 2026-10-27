# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

FO-b-PM2-TS (identificador completo `dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob`) es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de la familia «Semantic Simulation» (SemSimula), una línea de trabajo que sustituye el mecanismo de atención por un núcleo conservativo derivado de la mecánica lagrangiana: el modelo no calcula atención, sino que evoluciona el estado mediante un potencial escalar con pozos de modo Poisson (dos pozos, `pm2`) y geometría riemanniana. Esta variante concreta es la «gemela de primer orden» de PM2-TS: se entrena como flujo de gradiente de primer orden puro, sin velocidad ni inercia, y se compara con su pareja de segundo orden para determinar si la dinámica de segundo orden aporta alguna ventaja.

El modelo se entrena desde cero sobre TinyStories (315.392.000 tokens, bloques de 512, 19.250 pasos) y alcanza una perplejidad de validación de 4,963 en el punto estabilizado. Su relevancia no es de producto sino experimental: forma parte de un estudio de ablación de mecanismos preinscrito (protocolo §5.13, hipótesis TS-K2), con presupuesto de tokens emparejado y evaluaciones emparejadas paso a paso contra su gemelo de segundo orden, lo que permite aislar el efecto de la dinámica de orden con una variable única. La conclusión declarada por el autor es que el primer orden iguala al segundo (−0,5 %), un resultado negativo útil para quien investigue arquitecturas alternativas al transformer.

El interés práctico para desarrolladores es limitado fuera de la investigación: es un modelo en inglés, entrenado únicamente con cuentos sintéticos infantiles, sin ajuste por instrucciones ni plantilla de chat documentada, y con un rendimiento un 11,0 % peor en perplejidad que un GPT-2 emparejado en tokens y schedule. Su valor está en la reproducibilidad del protocolo y en la afirmación de inferencia con memoria constante, no en capacidades de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, informado por física), no transformer y sin atención; potencial escalar con 2 pozos de modo Poisson, integración tipo BAOAB sobre variedad riemanniana con métrica de Jacobi |
| Parámetros totales | no disponible (el identificador codifica `d384`, dimensión 384, y `l2`, 2 capas) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; entrenamiento y evaluación con bloques de 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se documentan safetensors ni GGUF. Tamaño del repositorio: 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura abandonan explícitamente el transformer: no hay atención ni mecanismo equivalente, sino un núcleo conservativo definido por un potencial escalar. En esta variante el potencial incorpora dos pozos de modo Poisson (`pm2`) con registros de modo Poisson (`pmx16`) y un potencial gaussiano anisotrópico; la dinámica se integra con el esquema BAOAB sobre una geometría riemanniana definida por la métrica de Jacobi, siguiendo geodésicas riemannianas. La etiqueta `fob` indica que el modelo se entrena como flujo de gradiente de primer orden genuino: el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta y no existe variable de velocidad en ningún punto del cálculo. El autor declara inferencia con memoria constante como propiedad del diseño.

El entrenamiento usa exactamente 315.392.000 tokens de TinyStories (19.250 pasos × batch 32 × bloque 512) en una sola sesión, con el schedule WSD del estudio: 16.250 pasos con la curva del ladder y 3.000 pasos adicionales al learning rate suelo. Ambos gemelos (primer y segundo orden) parten del paso 0 con semilla 0, de modo que las evaluaciones quedan emparejadas en cada paso. No se documenta RLHF, DPO ni ningún ajuste por preferencias, ni fases de instrucción. El registro de salud de la ejecución indica 0 activaciones del watchdog, 0 capturas de spikes y monitor de fuga SCAF limpio en las 4 auditorías; las celdas de diagnóstico se ejecutaron en una sesión separada sobre el mejor checkpoint.

## Capacidades

- Generación de texto autorregresiva en inglés, orientada a cuentos cortos y narrativa simple del dominio TinyStories.
- Modelado de lenguaje puro: no se documenta ajuste por instrucciones, diálogo multi-turno ni plantilla de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento explícito.
- Monolingüe en inglés; no se declaran capacidades multilingües.
- Sin visión, audio ni modalidades adicionales.
- Propiedad diferencial declarada: inferencia con memoria constante (el coste de memoria no crece con la longitud de la secuencia) y ausencia total de mecanismo de atención.
- Artefacto de investigación reproducible: incluye comparación emparejada paso a paso con su gemelo de segundo orden y con el resto de la escalera de ablación.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para medir si la dinámica de segundo orden aporta ventaja frente al flujo de gradiente de primer orden, con presupuesto de tokens y schedule idénticos.
- Reproducción de estudios de ablación preinscritos: el modelo materializa la hipótesis TS-K2 y permite verificar el resultado declarado (−0,5 % frente al gemelo) reentrenando o reevaluando sobre TinyStories.
- Generación de cuentos infantiles sintéticos en inglés para pipelines de aumento de datos: el dominio TinyStories es exactamente el suyo y la perplejidad de 4,963 indica fluidez local suficiente para texto muy simple.
- Evaluación de modelos de lenguaje basados en energía: útil como caso práctico para estudiar cómo se comporta un potencial con pozos en la distribución de salida y qué aprende cada pozo (el autor publica lecturas de profundidad mediana y vida media por capa).
- Despliegue en entornos con memoria restringida: la propiedad de memoria constante en inferencia permite probar generación de secuencias largas en dispositivos donde un transformer equivalente agotaría el presupuesto de memoria.
- Docencia y divulgación: ejemplo ejecutable de modelo de lenguaje no transformer con formulación física explícita, útil para cursos de ML avanzado o de mecánica estadística aplicada.
- Línea base en estudios de eficiencia: comparar su perplejidad (4,963) y su coste de memoria frente a un GPT-2 emparejado (4,47) permite cuantificar el coste de prescindir de la atención.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados externamente; `verified: false` en el model-index). Perplejidad de validación sobre TinyStories, bloque 512.

| Modelo | Configuración | Tokens de entrenamiento | Perplejidad validación |
|---|---|---:|---:|
| FO-b-PM2-TS (este modelo) | TinyStories, 2 pozos, primer orden | 315.392.000 | 4,963 (media de las evaluaciones 18.000/18.500/19.000: 5,04 / 4,92 / 4,93; mejor 4,80 en el paso 16.500) |
| PM2-TS (gemelo de segundo orden) | TinyStories, 2 pozos | 315M | 4,99 |
| FO-b-TS | TinyStories, sin pozos, primer orden | 315M | 5,28 |
| FO-TS | TinyStories, sin pozos, primer orden (entre capas) | 315M | 5,13 |
| SO-TS | TinyStories, sin pozos, segundo orden | 315M | 5,16 |
| GPT-2 emparejado | TinyStories, mismos tokens y schedule | 315M | 4,47 |

Referencia cruzada en otro corpus (no directamente comparable, incluida en la model card): en OpenWebText con 532,5M tokens, PM2-PMX16 obtiene 54,71 y FO-b-PM2-PMX16 53,81 (−1,6 %).

Evolución del par a lo largo del entrenamiento (perplejidad):

| Paso | Fase | PM2-TS (2.º orden) | FO-b-PM2-TS (1.er orden) |
|---:|---|---:|---:|
| 500 | warmup | 18,99 | 18,86 |
| 5.000 | constante | 6,33 | 6,26 |
| 10.000 | constante | 5,71 | 5,64 |
| 13.000 | decay | 5,42 | 5,40 |
| 16.000 | fin de decay | 5,02 | 5,00 |
| 18.000 | suelo | 5,06 | 5,04 |
| 19.000 | suelo, última eval | 4,96 | 4,93 |

El autor señala que la ventaja del primer orden se estrecha con el entrenamiento: −0,87 % en fase estable, −0,57 % en decay y −0,46 % en el suelo, y advierte que las evaluaciones en TinyStories oscilan aproximadamente ±0,06 entre una medición y la siguiente, por lo que la media de tres evaluaciones es la cifra a leer.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible el recuento exacto de parámetros; el repositorio completo ocupa 0,3 GB, por lo que los pesos en fp32 deberían caber holgadamente en menos de 1 GB de VRAM (estimación a partir del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada para este modelo (RTX 3060, RTX 4090, etc.); también es viable en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 2 GB o más de memoria, y en iGPU/CPU dado el tamaño del repositorio.
- Opciones de despliegue: PyTorch nativo (`library_name: pytorch`) con `transformers`/código propio del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF; al no ser un transformer, es previsible que los runners estándar no lo carguen sin adaptación.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por token.
- Ventaja declarada: inferencia con memoria constante, independiente de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad TinyStories (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-PM2-TS (este modelo) | no disponible (d=384, 2 capas) | no disponible; bloques de 512 | 4,963 | CC-BY-4.0 | HuggingFace, 13 descargas |
| PM2-TS (gemelo de segundo orden) | no disponible | bloques de 512 | 4,99 | CC-BY-4.0 | HuggingFace (mismo autor) |
| FO-b-TS (sin pozos, primer orden) | no disponible | bloques de 512 | 5,28 | CC-BY-4.0 | HuggingFace (mismo autor) |
| GPT-2 emparejado (mismos tokens y schedule) | no disponible en la información | 512 en la comparación | 4,47 | no disponible en la información | HuggingFace (mismo autor) |

La comparación relevante es interna a la escalera del autor: mismo corpus, mismos tokens (315M) y misma curva de learning rate, lo que aísla el efecto del mecanismo. El GPT-2 emparejado queda un 11,0 % por delante de este modelo (SO-TS queda un 15,4 % por detrás). No se dispone de comparaciones con modelos de terceros de la misma categoría.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con TinyStories (cuentos sintéticos infantiles), con vocabulario y estructuras narrativas muy limitadas; no es apto para texto general, técnico ni de dominio real.
- Monolingüe en inglés; no hay soporte de castellano ni de otros idiomas.
- Sin ajuste por instrucciones ni por preferencias (no se documenta RLHF/DPO): no sigue instrucciones ni mantiene diálogo de forma fiable.
- Riesgo de alucinación alto fuera de su distribución y previsiblemente también dentro de ella; no hay mitigaciones documentadas ni evaluación de factualidad.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; al ser un artefacto de investigación sin alineamiento, no debería exponerse a usuarios finales sin filtros.
- Rendimiento inferior al de un GPT-2 emparejado en tokens y schedule: 4,963 frente a 4,47 de perplejidad (+11,0 % peor).
- Las métricas están marcadas como no verificadas (`verified: false`) y proceden del propio autor; la oscilación de ±0,06 entre evaluaciones hace que diferencias inferiores a ese margen no sean concluyentes.
- Metadatos incoherentes: las etiquetas incluyen `openwebtext` aunque el dataset declarado sea TinyStories, y la fecha de creación registrada es 2026-10-26; conviene verificar la procedencia antes de citarlo.
- Sin soporte documentado en runners estándar (vLLM, llama.cpp, TGI, Ollama) ni pesos GGUF: la integración en producción exigiría código propio.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar autor y licencia y no ofrece garantías; conviene revisar los términos completos antes de un despliegue.
- Advertencia de producción: es un modelo de investigación con 13 descargas y 0 likes; no hay evidencia de uso en producción ni mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Colección «first-vs-second-order» (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Gemelo de segundo orden PM2-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Variante sin pozos, primer orden (FO-b-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Variante sin pozos, primer orden entre capas (FO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Variante sin pozos, segundo orden (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- GPT-2 emparejado en tokens y schedule: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Equivalente en OpenWebText, segundo orden (PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Equivalente en OpenWebText, primer orden (FO-b-PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Listado de modelos de generación de texto en HuggingFace (referencia de descubrimiento): https://huggingface.co/models?pipeline_tag=text-generation&p=0&sort=modified
