# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2

## Resumen

El modelo `semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2`, abreviado SR2-NP, es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del programa SemSimula. Se trata de un modelo de lenguaje conservativo basado en un potencial escalar y en mecánica lagrangiana, no de un transformer: prescinde por completo de la atención y de las redes de puntuación (score networks). Esta variante concreta (Gen 3) es la primera rama entrenada del programa de productización, en la que se elimina la fuerza de pares enrutada (pair force) para abaratar la inferencia manteniendo el núcleo conservativo.

El modelo tiene 76.434.307 parámetros, se entrena desde cero sobre OpenWebText con un presupuesto de 532.480.000 tokens y una longitud de bloque de 512. Su relevancia es fundamentalmente metodológica: demuestra que un modelo que nunca ha tenido fuerza de pares puede igualar el rendimiento de uno que sí la tenía, con una perplejidad de validación de 58,51 frente a 58,32 de SR2 (+0,3%). Es un experimento de ablación de mecanismos preinscrito, con predicciones registradas antes del entrenamiento y evaluadas a posteriori.

La arquitectura es deliberadamente no convencional: integra los modos rígidos como osciladores amortiguados exactos mediante un integrador BAOAB con gradientes vivos, y el único canal de comunicación entre tokens son cinco canales de contexto ξ enrutados por contenido. El modelo solo soporta inglés y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer; modelo de lenguaje conservativo (energy-based) con potencial escalar, mecánica lagrangiana, integrador BAOAB y geometría riemanniana; sin atención y sin score network |
| Parametros totales | 76.434.307 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch; repositorio de 0,6 GB); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SemSimula, un enfoque de modelado de lenguaje que sustituye la atención por un sistema dinámico conservativo. Cada token se trata como una partícula en un espacio de Fock con un potencial gaussiano anisotrópico, y la evolución se realiza mediante un integrador exacto (BAOAB) de osciladores amortiguados para los modos rígidos. La innovación clave de esta variante SR2-NP es la eliminación total de la fuerza de pares enrutada (V_φ): no hay score network, ni routing top-k, ni potencial de pares. La única vía de interacción entre tokens son los cinco canales de contexto ξ enrutados por contenido, lo que reduce el coste computacional en inferencia.

El entrenamiento se realizó desde cero sobre OpenWebText con 32.500 pasos, batch de 32 y bloques de 512, lo que suma exactamente 532.480.000 tokens vistos. Se usaron los mismos datos, esquema y semilla que SR2. El run se ejecutó en una A100 de 40 GB con 0,68 s por paso y un pico de memoria de 15,1 GB (19,4 GB con evaluación). No se registraron pasos omitidos ni disparos de watchdog; la norma global del gradiente superó 1,0 en 1 de 560 pasos registrados (paso 300, 1,08, durante el warm-up). No se menciona uso de RLHF ni DPO; el entrenamiento es de modelado de lenguaje autorregresivo estándar bajo el paradigma conservativo.

## Capacidades

- Generación de texto autorregresiva en inglés, con perplejidad de validación de 58,51 en OpenWebText (bloque 512).
- Modelado de lenguaje de nivel investigación: no está diseñado como asistente conversacional ni como modelo de instrucciones.
- Razonamiento y código: no se documentan capacidades específicas de razonamiento, matemáticas o generación de código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se documentan otros idiomas.
- Capacidades especiales: modo de "gradientes vivos" (live gradients), integración exacta de modos rígidos, potencial gaussiano anisotrópico y geometría riemanniana con métrica de Jacobi. No dispone de visión, audio ni modo de pensamiento explícito.
- El modelo forma parte de un estudio de escalera (ladder study) con ablaciones de mecanismos preinscritas, orientado a la comparación controlada de variantes.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas para estudiar si un núcleo conservativo sin fuerza de pares puede igualar a variantes con ella, con un protocolo de ablación preinscrito y comparaciones paso a paso frente a SR2.
- Experimentos de mecánica estadística aplicada al lenguaje: al tratar los tokens como partículas en un potencial escalar, permite estudiar la dinámica de la generación como un sistema físico, con integradores exactos y métricas riemannianas.
- Reproducción de estudios de ablación controlados: el repositorio documenta el presupuesto de tokens, la semilla y el esquema, lo que facilita replicar el entrenamiento y comparar variantes en igualdad de condiciones.
- Evaluación de eficiencia en inferencia: al eliminar la fuerza de pares, el modelo reduce el coste por paso (0,68 s frente a 1,62 s de SR2 en la misma tarjeta), lo que lo hace útil para medir el impacto de mecanismos en el coste de despliegue.
- Docencia y divulgación sobre modelos de energía: su formulación lagrangiana y su integrador BAOAB lo convierten en un ejemplo didáctico de modelado generativo no basado en atención.
- Estudio de la formación de la brecha de rendimiento (gap formation): la model card traza la perplejidad frente a SR2 en 65 evaluaciones compartidas, lo que permite analizar en qué fases del entrenamiento aparecen las diferencias.
- Base para palancas posteriores del programa de productización: este modelo es la referencia sobre la que se medirán las mejoras futuras del núcleo conservativo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Fuerza de pares | Parámetros | PPL asentada (OpenWebText, bloque 512) | Frente a este modelo | Frente a GPT-2 |
|---|---|---:|---:|---:|---:|
| SR2-NP (este modelo) | ninguna | 76.434.307 | 58,51 | — | 1,175× |
| SR2 (Gen 3) | entrenada | 76.572.110 | 58,32 | +0,3% | 1,171× |
| K4-R6 (Gen 3, banco menor) | entrenada | 64.761.802 | 59,61 | −1,8% | 1,197× |
| gpt2-matched | — | — | 49,81 | +17,5% | 1,000× |

Evolución de la perplejidad de validación frente a SR2 en los mismos pasos:

| Paso | Fase | SR2 | Este modelo | Diferencia (nats) |
|---:|---|---:|---:|---:|
| 500 | warm-up | 461,83 | 463,11 | +0,0028 |
| 5.000 | estable | 108,36 | 108,04 | −0,0030 |
| 10.000 | estable | 85,96 | 86,00 | +0,0005 |
| 20.000 | estable | 70,82 | 70,39 | −0,0061 |
| 25.000 | decay | 65,92 | 65,70 | −0,0035 |
| 30.000 | decay | 58,07 | 58,29 | +0,0038 |
| Asentada (31.500–32.500) | — | 58,32 | 58,51 | +0,0033 |

Predicciones preinscritas (registradas el 2026-11-21 antes del entrenamiento):

| ID | Predicción | Probabilidad asignada | Resultado |
|---|---|---|---|
| NP1 | PPL asentada dentro de +2% de SR2 (≤59,49) | 65% | Acierto (58,51; +0,33%) |
| NP2 | PPL asentada dentro de +1% de SR2 (≤58,90) | 40% | Acierto (58,51) |
| NP3 | Brecha frente a SR2 en fase estable ≤ +0,01 nats | 55% | Acierto (−0,0041 nats) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 15,1 GB de pico (19,4 GB con evaluación) en una A100 de 40 GB. Con 76,4 M de parámetros, la inferencia en fp32 rondaría los 0,3 GB de pesos, más el estado del integrador y los canales de contexto.
- GPU recomendadas: A100 40 GB (la usada en entrenamiento). Para inferencia, cualquier GPU con suficiente memoria para el estado dinámico del integrador.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no se documenta soporte ni requisitos del integrador en GPUs de consumo (RTX 4090, etc.).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo es PyTorch puro y requiere el código del integrador BAOAB y del potencial escalar.
- Latencia y throughput: 0,68 s por paso de entrenamiento en A100 40 GB; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OpenWebText, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SR2-NP (este modelo) | 76,4 M | No disponible (bloques de 512) | 58,51 | CC-BY-4.0 | Hugging Face |
| SR2 (Gen 3) | 76,6 M | No disponible (bloques de 512) | 58,32 | CC-BY-4.0 | Hugging Face |
| K4-R6 (Gen 3) | 64,8 M | No disponible (bloques de 512) | 59,61 | CC-BY-4.0 | Hugging Face |
| gpt2-matched | No disponible | No disponible | 49,81 | No disponible | Hugging Face |

No se dispone de comparaciones con modelos de la misma categoría (energy-based o conservativos) fuera de la familia SemSimula. Frente a GPT-2 de tamaño comparable, este modelo queda un 17,5% por encima en perplejidad.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado para uso conversacional; no debe desplegarse como asistente sin un post-entrenamiento adicional.
- Solo inglés: no se documenta soporte multilingüe.
- Contexto limitado: entrenado con bloques de 512 tokens; no se especifica una ventana de contexto mayor.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo de modelado de lenguaje puro, la generación libre puede producir texto incoherente o factualmente incorrecto.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus OpenWebText refleja los sesgos de su fuente (Reddit).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado para producción y no hay garantías de calidad.
- Dependencia de código específico: requiere el integrador BAOAB y la implementación del potencial escalar; no es compatible con ecosistemas estándar de inferencia (vLLM, llama.cpp, etc.).
- Resultados no verificados de forma independiente: las métricas proceden de la model card del autor y la perplejidad declarada tiene `verified: false`.
- Sin datos de cuantización: no se han publicado pesos cuantizados ni instrucciones para generarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2
- SR2 (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- K4-R6 (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k4-r6
- gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota de la etapa 3 (productización): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/productization/Stage3_SR2_Without_Pair_Force.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
