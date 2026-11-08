# MatterWaveAI/helmholtz-b0.7.0-20m

## Resumen

HELMHOLTZ-b0.7.0-20m es un modelo compacto de la familia HELMHOLTZ-1 desarrollado por MatterWaveAI, construido sobre el modelo base MatterWaveAI/grt-20m. Se presenta como una arquitectura de embedding conjunto predictivo (JEPA) puramente rotacional, orientada a modelado de mundo causal y a actuar como juez de trayectorias de agente (System-1 Trajectory Judge). Su tesis central es eliminar el colapso de representación del JEPA por construcción geométrica, sin necesidad de negativos contrastivos. En lugar de matrices densas lineales, emplea cascadas de transformaciones ortogonales que preservan norma (det = +1).

El modelo almacena aproximadamente 26,4 millones de parámetros con una capacidad equivalente densa de unos 66 millones, y declara cero matrices lineales densas y cero capas convolucionales. Está pensado para despliegue en el borde con latencia ultrabaja, pipelines de CI solo-CPU y verificación de leyes de escalado junto a la variante de 30M de la misma familia.

Es relevante ahora porque propone una alternativa no generativa clásica: opera en espacio latente, predice estados objetivo multi-paso sin decodificar tokens intermedios y emite decisiones de aprobación, rechazo o escalado sobre acciones de agente. No obstante, la model card es una tarjeta de vista previa (b0.7.0): los pesos, los detalles de implementación y el código fuente están retenidos durante el ciclo de publicación escalonado, por lo que el modelo no es utilizable todavía de forma efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA puramente rotacional (GRT-JEPA), cascada de transformaciones ortogonales; 0 matrices lineales densas, 0 capas convolucionales |
| Parametros totales | ~26,4 M almacenados (~66 M de capacidad equivalente densa) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la version preview) |

## Arquitectura y entrenamiento

La arquitectura se describe como un JEPA (Joint-Embedding Predictive Architecture) puramente rotacional dentro de la familia HELMHOLTZ-1. Cada bloque del codificador y del predictor es una cascada de transformaciones ortogonales que preservan la norma, con determinante +1. Esta construcción preserva automáticamente las distancias por pares y el rango de la covarianza, lo que según el autor elimina el colapso de representación sin negativos contrastivos. El modelo declara cero matrices lineales densas y cero convoluciones, y reporta una deriva de ortogonalidad de 1,42e-14 y una retención de rango efectivo igual o superior al 99,0 % tras 100 actualizaciones de objetivo.

El modelo incluye además un mecanismo de dinámica inversa en forma cerrada que recupera operadores de transición causal entre pares de estados de manera analítica, sin pasos de gradiente, y captura la sensibilidad al orden de las acciones (contrafactuales no conmutativos). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card menciona evaluación sobre conjuntos held-out XL-smol y resultados de escalado SLM-Bench, pero los detalles de implementación y el código están retenidos.

## Capacidades

- Predicción en espacio latente multi-paso: proyecta estados objetivo sin decodificar tokens intermedios.
- Juez de seguridad de agente (MPC Safety Judge): despliega acciones candidatas en latencia y emite APPROVE, REJECT o ESCALATE en una sola pasada.
- Verificación de rollouts relacionales multi-hop (2 a 3 saltos).
- Verificación causal de ciencia y sentido común físico.
- Verificación factual de un solo salto sobre modelo de mundo.
- Verificación socrática y epistémica en cuatro modos (SEE, SAY, DO, KNOW).
- Inducción de reglas en rejillas visual-espaciales 2D (variante XL-smol de ARC-AGI-2).
- Enrutamiento de acciones de agente, detección de deriva y defensa frente a inyección de prompts.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa y seguimiento de transiciones de estado simbólico.
- Planificación de recursos y concurrencia.
- Consistencia de orden de opciones del 100,0 % (permutación de alternativas).
- No se documenta soporte de tool calling, function calling ni capacidades multilingües explícitas.

## Casos de uso

- Validación de trayectorias de agentes autónomos: el modelo actúa como juez que recibe acciones candidatas y emite APPROVE, REJECT o ESCALATE antes de que el agente ejecute un paso, con defensa integrada frente a inyección de prompts.
- Control predictivo en el borde (MPC ligero): al operar en espacio latente y con ~26,4 M de parámetros almacenados, puede ejecutarse en CPU para decidir la siguiente acción en sistemas con restricciones de cómputo.
- Verificación de pipelines de CI: con cero dependencia de GPU, puede integrarse en pipelines que comprueban la coherencia causal de transiciones de estado o la terminación de bucles de programa.
- Filtrado de razonamiento multi-hop: verifica cadenas relacionales de 2 a 3 saltos antes de aceptar una respuesta generada por otro modelo.
- Detección de deriva en agentes conversacionales: evalúa si la acción propuesta se desvía del objetivo declarado y escala al humano cuando corresponde.
- Inducción de reglas en entornos tipo ARC-AGI: útil para experimentos de razonamiento visual-espacial sobre rejillas 2D con reglas latentes.
- Calibración y abstención: como componente que decide cuándo un sistema debe abstenerse en lugar de responder, con error de calibración (ECE) reportado por dominio.
- Investigación en representaciones platónicas y leyes de escalado: comparación con la variante de 30M de la familia para estudiar el comportamiento del escalado en arquitecturas JEPA rotacionales.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre conjuntos held-out XL-smol (12.003 registros / 29.609 preguntas en el agregado de 6 suites):

| Suite XL-smol | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Rollout relacional multi-hop (2..3 saltos) | 2.500 | 5.000 | 88,90 % | 95,20 % | 100,0 % |
| Ciencia causal y sentido comun fisico | 2.500 | 5.000 | 94,10 % | 97,60 % | 100,0 % |
| Verificacion factual de un salto | 2.500 | 5.000 | 87,40 % | 93,10 % | 100,0 % |
| Verificacion socratica 4 modos (SEE/SAY/DO/KNOW) | 2.500 | 5.000 | 63,30 % | 92,10 % | 100,0 % |
| Induccion de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 1.200 | 3.600 (7.200 total) | 55,50 % | 80,17 % | 100,0 % |
| Enrutamiento MPC de agente, deriva e inyeccion | 803 | 2.409 | 66,25 % | 71,46 % | 100,0 % |
| Agregado 6 suites (macro / micro) | 12.003 | 26.009 (29.609 total) | 75,91 % / 78,69 % | 89,11 % | 100,0 % |

Evaluación completa de 12 dominios (17.130 registros / 44.287 preguntas), con error de calibración (ECE) por dominio:

| Dominio | Registros | Preguntas | Precision primaria | ECE |
|---|---:|---:|---:|---:|
| Rollout relacional multi-hop | 2.500 | 5.000 | 88,90 % | 0,0964 |
| Ciencia causal y sentido comun | 2.500 | 5.000 | 94,10 % | 0,0442 |
| Verificacion factual de un salto | 2.500 | 5.000 | 87,40 % | 0,0568 |
| Verificacion socratica 4 modos | 2.500 | 5.000 | 63,30 % | 0,1045 |
| Induccion de reglas en rejilla 2D | 1.200 | 3.600 (7.200 total) | 55,50 % (80,17 % pass@2) | 0,1180 |
| Enrutamiento MPC de agente y deriva | 803 | 2.409 | 66,25 % | 0,1984 |
| Calibracion epistemica y abstencion | 80 | 160 | 75,00 % | 0,0890 |
| Verificacion de terminacion de bucles | 150 | 600 | 71,33 % | 0,0985 |
| Seguimiento de transiciones de estado simbolico | 60 | 180 | 70,00 % | 0,0960 |
| Bateria de grafo de conocimiento de prerrequisitos (v5) | 2.777 | 7.558 | 70,18 % | 0,0954 |
| Planificacion de recursos y concurrencia | 60 | 180 | 68,33 % | 0,1020 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con modelos de terceros (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~26,4 M parámetros almacenados y pesos en FP16, la huella teórica ronda los 53 MB, pero el formato de pesos no está publicado.
- GPU recomendadas: no disponible; el autor orienta el modelo a despliegue en CPU y entornos de borde.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no confirmado al no publicarse pesos ni implementación.
- Opciones de despliegue: no disponible (la librería declarada es transformers, pero no hay pesos ni código publicados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-b0.7.0-20m | ~26,4 M almacenados (~66 M equiv.) | no disponible | JEPA rotacional, juez de trayectorias | Apache 2.0 | Pesos retenidos (preview) |
| HELMHOLTZ-1 (30M) | 30 M | no disponible | JEPA rotacional, misma familia | no disponible | Referenciado en la model card |
| HELMHOLTZ-s1-mamba-b0.7.0-20m | no disponible | no disponible | Variante Mamba (clasificacion de texto) | no disponible | Publicado en Hugging Face |
| HELMHOLTZ-mamba-b0.7.0-20m | no disponible | no disponible | Variante Mamba (generacion de texto) | no disponible | Publicado en Hugging Face |

No se dispone de comparaciones de rendimiento con modelos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: el modelo no es descargable ni ejecutable en la práctica pese a estar publicado en Hugging Face como vista previa.
- Todos los benchmarks proceden del propio autor y de suites internas (XL-smol, SLM-Bench); no hay validación independiente.
- La precisión en verificación socrática (63,30 %) y en enrutamiento MPC de agente (66,25 %) es moderada; el ECE en enrutamiento MPC (0,1984) indica calibración deficiente en ese dominio.
- La inducción de reglas 2D queda en 55,50 % top-1, con margen amplio de mejora.
- No se documentan idiomas soportados; cabe esperar un enfoque predominantemente simbólico y en inglés, pero no está confirmado.
- No se especifica longitud de contexto, lo que impide planificar su uso en conversaciones o documentos largos.
- Riesgo de alucinación no evaluado en la información disponible; el modelo opera en espacio latente y no es un generador de texto convencional, por lo que su uso como text-generation debe tratarse con cautela.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero al no publicarse pesos ni código no puede ejercerse ese derecho de forma efectiva en esta versión.
- La etiqueta pipeline text-generation puede inducir a error: las capacidades descritas son de verificación y juicio latente, no de generación abierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-20m
- Familia HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- Variante Mamba S1: https://huggingface.co/MatterWaveAI/helmholtz-s1-mamba-b0.7.0-20m
- Variante Mamba: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-20m
