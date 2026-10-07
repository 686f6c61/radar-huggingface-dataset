# Dwootton/when2tool-tool-intent

## Resumen

`Dwootton/when2tool-tool-intent` no es un modelo generativo, sino un artefacto de interpretabilidad mecanística: un conjunto de sondas lineales (regresión logística) entrenadas sobre los estados ocultos del modelo `Qwen/Qwen3-4B-Instruct-2507` para leer, en tiempo de inferencia, la intención interna de invocar una herramienta. El repositorio replica el método de arXiv:2605.09252 sobre el subconjunto `multi_hop` del dataset `cesun/When2Tool` (180 ejemplos de entrenamiento y 450 de test) y añade un experimento de steering sobre la dirección de intención (método inspirado en arXiv:2608.25198) y una prueba de transferencia fuera de distribución hacia monitorización de seguridad de agentes.

El interés del artefacto es que demuestra que la señal "debo usar una herramienta" es linealmente separable en la corriente residual de un modelo de solo 4B, con un AUROC de 0,9445 y una exactitud de 0,9489 que iguala prácticamente la del paper original (0,9467). El pico de AUROC por capa se sitúa en la capa 21 (0,952), la misma localización que PRISMS (arXiv:2608.00218) identifica para señales de mal uso de herramientas en Qwen3-4B.

El tercer bloque evalúa sondas de "stakes" entrenadas sobre `Arrrlex/models-under-pressure` y muestra transferencia OOD de 0,85-0,95 AUROC en cinco conjuntos de escenarios retenidos, lo que apunta a una primitiva reutilizable para detección de acciones de alto riesgo antes de que el modelo emita texto. El repositorio no incluye pesos de un LM, no declara pipeline y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sondas lineales (regresión logística) sobre estados ocultos; las sondas de herramientas concatenan todas las capas del último token del prompt y las de stakes usan mean-pooling. Modelo base: Qwen/Qwen3-4B-Instruct-2507 (transformer denso) |
| Parámetros totales | No disponible para las sondas (`probe.pt`, `mup_probe.pt`); el modelo base sobre el que operan ronda los 4B |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se declara en la model card) |
| Tipos de cuantización | No aplica a las sondas; no se documenta cuantización del modelo base |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`: `probe.pt`, `mup_probe.pt`), junto con `combo.py`, `probe_ood.py` y `results.json` |

Otros datos del repositorio: autor `Dwootton`, pipeline no disponible, etiquetas `interpretability`, `activation-probes`, `tool-use`, `ai-safety`, `mechanistic-interpretability`, `region:us`, tamaño del repo 0,0 GB, creado el 2026-10-06 y actualizado el 2026-10-07.

## Arquitectura y entrenamiento

La sonda de necesidad de herramienta toma el estado oculto del último token del prompt en todas las capas, las concatena y ajusta una regresión logística con regularización `C=1e-4`. Se entrena sobre 180 prompts del subconjunto `multi_hop` de `cesun/When2Tool`, con etiquetas procedentes del `probe_data.zip` publicado por los autores originales y construcción de prompts desde `Trustworthy-ML-Lab/when2tool` en el commit `8c00ef7`. Las etiquetas provienen de una única ejecución de rollout sin semilla fijada, lo que el propio autor señala como causa probable de la fragilidad del AUROC.

El steering sigue el método de arXiv:2608.25198: se calcula una dirección de diferencia de medias entre el 10 % superior e inferior de los prompts de entrenamiento según la puntuación de la sonda (k=18 por lado) y se añade en la capa 22 en todas las posiciones durante la generación, con 450 prompts de test por valor de alpha y temperatura 0,7. Las sondas de stakes son lineales con mean-pooling, entrenadas sobre el split `training` (8K) de `Arrrlex/models-under-pressure` y evaluadas en un test ID (2K) más cinco conjuntos OOD. El dashboard asociado es `Dwootton/when2tool-tool-intent-trackio`.

## Capacidades

- Detección de intención de uso de herramienta: clasifica si un prompt requiere o no invocar una herramienta a partir de la activación del último token, con AUROC 0,9445 y exactitud 0,9489 en el test de 450 ejemplos.
- Lectura por capas: permite identificar en qué capa reside la señal (pico en la capa 21, AUROC 0,952) y comparar con otras señales conocidas en el mismo modelo.
- Generalización entre entornos de herramienta: en validación leave-one-env-out alcanza AUROC 0,979 en `CalculatorEnv`, 0,925 en `RetrieverEnv` y 0,764 en `CodeExecutorEnv`, el caso más difícil.
- Modulación de comportamiento por steering: la dirección de intención añadida en la capa 22 altera la tasa de llamada entre 0,936 (alpha +1,5) y 1,000 (alpha −2,5).
- Monitorización de seguridad transferible: las sondas de stakes alcanzan 0,85-0,95 AUROC OOD en cinco escenarios retenidos, con 0,9983 AUROC en la capa 21 sobre el test ID.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni capacidades multilingües propias: es un artefacto de análisis sobre las activaciones de otro modelo.

## Casos de uso

- Puerta de decisión antes de invocar herramientas en un agente: ejecutar la sonda sobre el prompt del usuario y usar la puntuación para decidir si se enruta a una herramienta o a respuesta directa, evitando llamadas innecesarias en pipelines con coste por invocación.
- Monitorización de seguridad en producción: las sondas de stakes transfieren OOD con 0,85-0,95 AUROC, lo que permite marcar interacciones de alto riesgo en un modelo de 4B sin depender de clasificadores externos.
- Investigación en interpretabilidad comparada: replicar la localización de la señal en la capa 21 y contrastarla con PRISMS (arXiv:2608.00218) para estudiar si distintas señales de comportamiento comparten subespacio.
- Red-teaming de agentes: detectar estados internos previos a la invocación de acciones externas y auditar trayectorias donde el modelo decide usar herramientas fuera de política.
- Evaluación de sobre-llamada de herramientas: medir con la sonda y con la tasa de llamada efectiva si un ajuste fino o un cambio de prompt empuja al modelo a invocar herramientas cuando no son necesarias.
- Reproducibilidad y control de calidad de sondas: el pipeline `combo.py` y los `results.json` permiten repetir el ajuste con distintas semillas y cuantificar la varianza del AUROC frente a cambios en el etiquetado.
- Base para detección de escape de sandbox: el artefacto aporta una sonda de "estoy a punto de invocar una acción externa" (AUROC 0,94-0,95 en capas 21-22), una de las dos primitivas que el autor identifica como necesarias; falta el etiquetado de trayectorias con episodios de escape.
- Docencia y prototipado en seguridad de IA: coste computacional bajo (una regresión logística sobre activaciones de un modelo de 4B) para experimentar con monitores internos sin infraestructura de gran escala.

## Benchmarks y rendimiento

Replicación de la sonda de necesidad de herramienta:

| Métrica | Paper (tabla 10) | Esta ejecución |
|---|---|---|
| AUROC | 0,9658 | 0,9445 |
| Exactitud | 0,9467 | 0,9489 |

Referencia adicional del reproductor comunitario en el issue #1 del repositorio (etiquetas autogeneradas): AUROC 0,9257. Pico de AUROC por capa: 0,952 en la capa 21. Leave-one-env-out (sonda entrenada en 2 de 3 entornos): `CalculatorEnv` 0,979, `RetrieverEnv` 0,925, `CodeExecutorEnv` 0,764.

Barrido de steering (450 prompts de test por alpha, T=0,7):

| alpha | call_rate | wellformed_rate | direct_answer_acc | oracle_policy_acc |
|---|---|---|---|---|
| −2,5 | 1,000 | 0,864 | n/a | 1,000 |
| −1,75 | 0,998 | 0,998 | 0,000 | 1,000 |
| −1,0 | 0,989 | 0,989 | 0,800 | 1,000 |
| −0,25 | 0,973 | 0,973 | 0,667 | 0,996 |
| 0,0 | 0,973 | 0,973 | 0,750 | 0,996 |
| +1,5 | 0,936 | 0,936 | 0,621 | 0,993 |

Sondas de stakes (transferencia OOD, AUROC):

| Escenario OOD | L10 | L21 (mejor ID) | L27 | L35 |
|---|---|---|---|---|
| toolace_balanced | 0,829 | 0,864 | 0,838 | 0,786 |
| anthropic_hh_balanced | 0,794 | 0,916 | 0,906 | 0,899 |
| aya_redteaming_balanced | 0,665 | 0,850 | 0,740 | 0,714 |
| mental_health_balanced | 0,827 | 0,878 | 0,846 | 0,884 |
| mt_balanced | 0,880 | 0,947 | 0,951 | 0,840 |

AUROC ID por capa para las sondas de stakes: L10 0,9966, L21 0,9983, L27 0,9968, L35 0,9929.

## Requisitos de hardware

- El coste dominante es el modelo base: extraer estados ocultos de `Qwen/Qwen3-4B-Instruct-2507` requiere cargar los 4B parámetros completos y activar `output_hidden_states`.
- VRAM estimada para el modelo base (cálculo a partir del número de parámetros, no confirmado en la model card): en precisión completa o fp16 en torno a 8-9 GB; en cuantización de 8 bits en torno a 4-5 GB; en 4 bits en torno a 2,5-3 GB más overhead de caché KV.
- Las sondas en sí ocupan un espacio despreciable: son regresiones logísticas sobre vectores concatenados de todas las capas, sin coste relevante de memoria ni de cómputo.
- GPU de consumo: cabe en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) con el modelo base en fp16 y margen para contexto moderado; con cuantización de 4 bits puede ejecutarse en GPUs de 8 GB.
- GPU de datacenter: A100, H100 o L40S son suficientes y quedan sobredimensionadas para un modelo de 4B; su ventaja aquí es el throughput de extracción de activaciones en lotes grandes.
- Despliegue: el pipeline de sondas requiere PyTorch y Hugging Face Transformers con acceso a estados ocultos. No es viable con formatos GGUF ni con motores que no expongan la corriente residual, como Ollama o llama.cpp; vLLM y TGI permiten servir el modelo base, pero la sonda necesita la extracción de activaciones en Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay modelos comparables en el sentido habitual de pesos generativos; la comparación se establece con otros artefactos de interpretabilidad y monitores internos:

| Artefacto | Modelo base | Capa relevante | Resultado reportado | Licencia |
|---|---|---|---|---|
| when2tool-tool-intent (este) | Qwen3-4B-Instruct-2507 | 21 (sonda de herramienta), 21-22 (steering) | AUROC 0,9445 en herramienta; 0,9983 ID y 0,85-0,95 OOD en stakes | MIT |
| PRISMS (arXiv:2608.00218) | Qwen3-4B | 21 (señales de mal uso de herramienta) | No disponible en la información proporcionada | No disponible |
| Sondas de stakes de McKenzie et al. (arXiv:2506.10805) | Modelos mucho mayores | No disponible | Receta reutilizada aquí; cifras no disponibles | No disponible |
| Reproductor comunitario del issue #1 | Qwen3-4B-Instruct-2507 | No disponible | AUROC 0,9257 con etiquetas autogeneradas | No disponible |
| SandboxEscapeBench (arXiv:2603.02277) | No aplica | No aplica | Solo medición de capacidad, sin detección desde activaciones | No disponible |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje: quien espere pesos generativos, chat template o pipeline de inferencia encontrará únicamente sondas `.pt` y scripts de análisis.
- El AUROC de la replicación (0,9445) queda unos 2,1 puntos por debajo del paper original (0,9658); el autor atribuye la diferencia a que las etiquetas provienen de una única ejecución de rollout sin semilla fijada, por lo que la paridad exacta es frágil.
- El steering es débil: la tasa de llamada solo se mueve unos 6 puntos porcentuales en un rango de Δalpha de 4, y el signo no está limpiamente alineado con la puntuación de la sonda. Con alpha −2,5 se corrompe el formato de la llamada (wellformed_rate 0,864) en lugar de suprimir la llamada.
- El régimen interesante (suprimir sobre-llamadas en ítems que no requieren herramienta) apenas existe en este conjunto: la tasa de llamada base ya es de aproximadamente 0,97 en tareas multi-hop.
- La dirección de steering se extrae de solo 180 ejemplos con prompt de política en una única capa, frente a las direcciones del paper original obtenidas de miles de prompts neutros.
- La sonda se degrada en el entorno más difícil: `CodeExecutorEnv` cae a 0,764 AUROC en leave-one-env-out, muy por debajo de `CalculatorEnv` (0,979).
- En transferencia OOD, el peor caso es `aya_redteaming_balanced` con 0,665 AUROC en la capa 10; los valores agregados no deben extrapolarse a dominios de red teaming sin validación específica.
- No existe detección publicada de intentos de escape de sandbox desde activaciones; el artefacto solo aporta primitivas parciales y carece del etiquetado de trayectorias con episodios de escape o acciones inseguras.
- La licencia MIT cubre los artefactos de este repositorio; el uso del modelo base `Qwen/Qwen3-4B-Instruct-2507` queda sujeto a su propia licencia, que debe consultarse por separado.
- Riesgo de alucinación del modelo base: es un factor a considerar en cualquier despliegue de las sondas, ya que estas no corrigen el contenido generado, solo estiman intenciones internas.
- Idiomas soportados por las sondas no disponibles; el conjunto de datos de herramientas no declara cobertura lingüística en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes y declara un tamaño de 0,0 GB, señales de que se trata de un artefacto de investigación sin validación externa amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dwootton/when2tool-tool-intent
- Dashboard del estudio: https://huggingface.co/spaces/Dwootton/when2tool-tool-intent-trackio
- Dataset de herramientas: https://huggingface.co/datasets/cesun/When2Tool
- Dataset de presión y stakes: https://huggingface.co/datasets/Arrrlex/models-under-pressure
- Repositorio de referencia: https://github.com/Trustworthy-ML-Lab/when2tool
- Issue con la replicación comunitaria: https://github.com/Trustworthy-ML-Lab/when2tool/issues/1
- Paper del método de sonda (arXiv:2605.09252): https://arxiv.org/abs/2605.09252
- Paper PRISMS (arXiv:2608.00218): https://arxiv.org/abs/2608.00218
- Paper de steering (arXiv:2608.25198): https://arxiv.org/abs/2608.25198
- Receta de sondas de stakes (arXiv:2506.10805): https://arxiv.org/abs/2506.10805
- SandboxEscapeBench (arXiv:2603.02277): https://arxiv.org/abs/2603.02277
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
