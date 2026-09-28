# MMLA-ORG/MMLA-LRARC4

## Resumen

MMLA-LRARC4 es una publicación de pesos de investigación del proyecto MMLA (Memory-Mediated Learning Architecture for Predictive Dual-State Adaptation), descrito en el artículo arXiv:2606.28876v4 de Junyi Zou y Avrova Donz. No es un modelo de chat autónomo ni un sistema PDSA completo: contiene tres inicializaciones entrenadas de tipo rho (matrices A de [4, 1536] y B de [1536, 4] en FP32, 12.288 parámetros por semilla) que se inyectan como residuo de entrada de rango 4 antes del mixer congelado, más el adaptador semántico omega original (LoRA de rango 16, alpha 32, sobre las proyecciones q/v de las capas 16 a 23). El backbone exacto es openbmb/MiniCPM5-1B-SFT en BF16, revisión a60b37f1fc409c54e1e337b0723aaac6f92dfec0, que debe obtenerse por separado.

El propósito declarado es servir como política de selección finita de cuatro programas dentro de un experimento de adaptación episódica: el modelo puntúa cuatro candidatos DSL públicos mediante la log-probabilidad media de respuesta más EOS, con softmax a temperatura 1, y el criterio principal es el error de ejecución esperado tras adaptación con feedback real (dos pasos SGD sobre pérdida de soporte, learning rate 0.1). Solo se libera el brazo estático seleccionado; el brazo adaptado no se incluye.

Su relevancia actual es acotada y estrictamente investigadora: la propia model card marca `inference: false`, no existe pipeline `generate()` ni envoltorio AutoModel, y los pesos se exportaron después del corte de evidencia del paper v4 (13 de septiembre de 2026), por lo que el autor no los presenta como resultados ya reportados en esa versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo independiente: residuo de entrada de rango 4 (`z + (z @ A.T) @ B.T`, sin escalado de rango adicional) aplicado antes del mixer congelado de un transformer MiniCPM5-1B-SFT, más un adaptador semántico LoRA congelado. El paper la describe como arquitectura agnóstica al mixer |
| Parámetros totales | 12.288 parámetros entrenados por semilla en rho (A [4,1536] + B [1536,4], FP32), más el adaptador omega congelado (LoRA rango 16, alpha 32, capas 16-23, proyecciones q/v). El recuento del backbone MiniCPM5-1B-SFT no está disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Los pesos liberados están en FP32 (rho/omega) y el backbone se usa en BF16; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors: `weights/static-2026092811.safetensors`, `weights/static-2026092812.safetensors`, `weights/static-2026092813.safetensors`, `weights/omega.safetensors` |

## Arquitectura y entrenamiento

La contribución técnica es un residuo de entrada de bajo rango (rank 4) sobre la dimensión oculta de 1536 del backbone, situado antes del mixer congelado y sin escalado de rango adicional. A se inicializa con valores distintos de cero y B a cero. Cada episodio crea una copia independiente Phi del rho aprendido seleccionado, con gradientes habilitados, y ejecuta dos pasos SGD sobre la pérdida de soporte a learning rate 0.1; el reset del episodio restaura el rho aprendido de ese modelo, incluida su B entrenada, y no pone el residuo a cero. Omega (rango 16, congelado, siempre activo) es un componente distinto del residuo de entrada de rango 4. No se incluyen lector CP histórico, cola M19, Phi en espacio de salida ni Phi online de rango 16 separado.

El entrenamiento original comparó dos brazos (objetivo estático y objetivo externo post-adaptación) en la misma ubicación de entrada LRARC4: 2 brazos × 3 semillas pareadas × 256 actualizaciones externas, con lote de 2 episodios. Ambos brazos reciben el mismo feedback de soporte público y la misma supervisión de consulta externa. El brazo adaptado emplea una estimación de meta-gradiente de primer orden con jacobiano identidad, no un algoritmo exacto de segundo orden. Solo se exportan los tres pesos del brazo estático seleccionado; se conservan las tres semillas completas sin escoger la mejor. El desarrollo abarca 16 grupos de parámetros independientes, 64 episodios de receta y 3 semillas de entrenamiento (las semillas no son tareas independientes adicionales), sobre familias conocidas de operadores y recetas con grupos de parámetros reservados, no generación libre de programas. La exportación no ejecutó ninguna pasada forward del backbone ni ningún benchmark nuevo: los tensores se recargaron en CPU y se compararon exactamente con los originales. El estado de optimizador y RNG permanece en los checkpoints de entrenamiento originales y no se incluye.

## Capacidades

- No aporta capacidades generativas propias: actúa como residuo de adaptación episódica sobre el backbone congelado MiniCPM5-1B-SFT.
- Puntuación de candidatos DSL: el modelo SFT nativo puntúa cuatro candidatos de programa públicos por log-probabilidad media de respuesta más EOS, con softmax a temperatura 1.
- Adaptación con feedback real: dos pasos SGD sobre pérdida de soporte en cada episodio, con reset reproducible al rho aprendido.
- Soporte de tool calling o function calling: no declarado, no disponible.
- Soporte de agentes y razonamiento multi-step: no declarado, no disponible.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos del repositorio.
- Modo thinking, visión o audio: no disponibles; no se mencionan en la información.
- Inferencia estándar: no soportada como pipeline; la carga es a nivel de componentes (PyTorch + safetensors, y Transformers para el tokenizador y el backbone). El propio repositorio marca `inference: false`.

## Casos de uso

- Reproducción de experimentos de adaptación episódica: cargar rho con `load_rho(seed=...)`, generar Phi con `begin_episode` y comparar el comportamiento del residuo antes y después de los dos pasos SGD de soporte.
- Estudio de meta-gradientes de primer orden: analizar la aproximación con jacobiano identidad frente a un objetivo post-adaptación exacto de segundo orden, usando los tres pares de semillas.
- Puntuación y selección de programas DSL: emplear el backbone nativo para ordenar los cuatro candidatos públicos por log-probabilidad media de respuesta más EOS, temperatura 1, en familias de operadores y recetas con parámetros reservados.
- Investigación sobre inyección de residuos de bajo rango: comparar el efecto del residuo de entrada de rango 4 frente al adaptador LoRA de rango 16 en las capas 16-23 sobre las proyecciones q/v.
- Auditoría de reproducibilidad: verificar identidades de tensores y hashes de ficheros base con `lineage.json` y `manifest.json`, y fijar el entorno con `environment.json`.
- Análisis de sensibilidad a la semilla: las tres semillas entrenadas se conservan íntegras, lo que permite medir variabilidad entre semillas pareadas en lugar de depender de una única ejecución.
- Diseño de experimentos A/B en laboratorio: comparar el brazo estático liberado con el brazo adaptado descrito en el paper, siempre que se reproduzca el protocolo de soporte y consulta externa.
- Material docente sobre estado rápido: `episodic_core.py` expone las primitivas independientes de estado rápido y de reset/actualización, útiles para ilustrar el ciclo soporte-actualización-consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible: la tabla de la model card aparece truncada justo después de la fila del brazo estático (`Static — weights included`), sin cifras. Tampoco se ejecutó ningún benchmark durante la exportación de pesos.

La metodología de evaluación documentada es la siguiente:

| Elemento | Descripción |
|---|---|
| Punto final primario | Error de ejecución esperado tras adaptación con feedback real, promediado dentro de grupos de parámetros y después entre semillas pareadas |
| Objetivos comparados | Brazo estático (pesos incluidos en este repositorio) y brazo post-adaptación (no incluido) |
| Métricas reportadas en la tabla | Error esperado post-adaptación (media ± desviación estándar entre semillas), ganancia con feedback real (G) y ganancia ajustada por permutación (D) |
| Protocolo de desarrollo | 16 grupos de parámetros independientes, 64 episodios de receta, 3 semillas de entrenamiento |
| Alcance | Familias conocidas de operadores y recetas con grupos de parámetros reservados; no es generación libre de programas |

Los valores numéricos de esa tabla no están disponibles en la información proporcionada.

## Requisitos de hardware

- Los pesos entrenados son minúsculos: 12.288 parámetros por semilla en FP32 (aproximadamente 48 KB por rho) más el adaptador omega congelado. El cuello de botella es el backbone.
- VRAM para inferencia: no hay cifras oficiales. Como estimación, un backbone de la familia 1B en BF16 ocupa en torno a 2 GB de pesos, más activaciones y caché KV, lo que sitúa el consumo típico en 3-5 GB; se trata de una estimación, no de un dato publicado.
- Cabe en GPU de consumo: con la estimación anterior, cabría en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). No confirmado por el autor.
- Diferenciación de Phi: la actualización episódica requiere gradientes a través del mixer congelado; la model card prohíbe envolverlo en `no_grad`, reutilizar caché posterior a Phi tras una actualización o compartir Phi/optimizador/RNG escribibles entre episodios. Esto incrementa el consumo de memoria respecto a la inferencia simple.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La carga se hace con PyTorch y safetensors, e inyectando el residuo manualmente en `inputs_embeds` antes de entrar en el mixer; el backbone requiere Transformers y sus dependencias de tokenizador, además de la revisión exacta fijada del modelo base.
- GPUs recomendadas para el backbone: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se documentan en la información disponible otras publicaciones de pesos comparables de la misma familia MMLA ni adaptadores de este tipo para MiniCPM5-1B-SFT. La comparación más directa es con el propio backbone y con un adaptador LoRA convencional:

| Modelo / artefacto | Parámetros entrenables | Mecanismo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMLA-LRARC4 (este repositorio) | 12.288 por semilla (rho) + omega congelado de rango 16 | Residuo de entrada de rango 4 antes del mixer, adaptación episódica con reset | No disponible | AGPL-3.0 | Pesos safetensors publicados; requiere backbone aparte; `inference: false` |
| openbmb/MiniCPM5-1B-SFT (backbone) | Modelo completo afinado con SFT | Transformer estándar | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base referenciado, revisión fijada a60b37f1fc409c54e1e337b0723aaac6f92dfec0, BF16 |
| Adaptador LoRA convencional sobre el mismo backbone | Típicamente millones de parámetros según rango y capas | LoRA estático en proyecciones de atención | No aplica | Depende del repositorio | No disponible como referencia concreta en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo autónomo ni un chatbot: sin el backbone exacto y sin el código de inyección, los ficheros safetensors no producen texto.
- Requiere la revisión exacta del backbone (`openbmb/MiniCPM5-1B-SFT`, revisión a60b37f1fc409c54e1e337b0723aaac6f92dfec0); otras revisiones pueden invalidar la verificación de hashes de `lineage.json`.
- `inference: false` declarado por el autor: no hay pipeline `generate()` ni AutoModel; el uso documentado es carga de componentes y forward manual con `inputs_embeds`.
- La model card advierte de que la memoria autoritativa, la escritura predictiva en Q, el efecto conjunto de doble estado y el RSI estricto no han sido validados por estos pesos.
- Los pesos son posteriores al corte de evidencia del paper v4 (13 de septiembre de 2026); no deben atribuirse a los experimentos ya publicados en esa versión.
- No se ejecutó ningún benchmark durante la exportación, y la tabla de resultados disponible está truncada: no hay cifras verificables en la información proporcionada.
- No se incluye estado de optimizador ni de RNG, por lo que la continuación exacta del entrenamiento no es posible desde estos ficheros.
- Solo se libera el brazo estático; el brazo adaptado con meta-gradiente de primer orden no está incluido, lo que impide reproducir la comparación completa sin reentrenar.
- Alcance limitado a familias conocidas de operadores y recetas con grupos de parámetros reservados: no es generación libre de programas ni evaluación abierta.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano.
- Licencia AGPL-3.0: es una licencia copyleft fuerte, con obligaciones de distribución del código fuente para obras derivadas ofrecidas como servicio en red; conviene revisarla antes de cualquier uso más allá de la investigación.
- Riesgo de alucinación inherente al backbone subyacente: la información disponible no incluye evaluación de fidelidad factual ni de sesgos.
- Repositorio con 0 descargas, 0 likes y tamaño declarado de 0,0 GB: no hay evidencia de uso ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MMLA-ORG/MMLA-LRARC4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Paper: MMLA: Memory-Mediated Learning Architecture for Predictive Dual-State Adaptation, Junyi Zou y Avrova Donz, 2026: https://arxiv.org/abs/2606.28876v4
- Ficheros incluidos en el repositorio: `weights/static-2026092811.safetensors`, `weights/static-2026092812.safetensors`, `weights/static-2026092813.safetensors`, `weights/omega.safetensors`, `lineage.json`, `manifest.json`, `environment.json`, `load_weights.py`, `episodic_core.py`
