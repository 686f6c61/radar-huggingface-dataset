# Donghyun1228/pi05-libero-ila-pad-vision-head-view-small-10000-20261105

## Resumen

π0.5 LIBERO view_small es un checkpoint de investigación publicado por Donghyun1228 en Hugging Face, derivado del modelo de visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence. No se trata de un modelo de lenguaje generalista, sino de un artefacto de robótica entrenado para el benchmark LIBERO, concretamente una fila del experimento de adaptación de dominio ILA (Invariance through Latent Alignment, Yoneda et al., RSS 2022) aplicada sobre la cabeza de visión del encoder PAD. El repositorio ocupa 13,0 GB e incluye pesos, estado de entrenamiento, assets de normalización y una política de evaluación lista para desplegar.

El modelo parte de `Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105` (paso 9999) y solo adapta el encoder visual PaliGemma/img durante 10.000 actualizaciones de destino, manteniendo congelados el LLM, el experto de acciones y la cabeza IDM. El resultado reportado es un 90,00% de éxito en LIBERO (1800/2000 episodios), lo que lo convierte en una referencia útil para quienes trabajan en adaptación de políticas VLA y quieren reproducir o comparar baselines de ILA.

Su relevancia es acotada pero específica: es un checkpoint de ablación con semilla fija (42) y protocolo de evaluación documentado, útil para investigación en adaptación de dominio visual para manipulación robótica, no para uso conversacional ni generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (PaliGemma vision tower + LLM + action expert), con cabeza IDM y forward dynamics PAD |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato nativo, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | params + train_state + assets (formato nativo openpi/JAX); política de evaluación en `policy/`; crítico en `ila/critic_9999.npz` |

## Arquitectura y entrenamiento

El checkpoint se construye sobre π0.5, un modelo VLA que combina un encoder visual PaliGemma, un LLM y un experto de acciones. En esta variante concreta, solo el encoder visual (`PaliGemma/img`) se adapta al dominio destino; el resto de componentes permanece congelado en el estado fuente. El entrenamiento sigue el esquema ILA: por iteración se ejecutan 5 actualizaciones del crítico WGAN (weight clip 0,01, RMSProp 1e-5) sobre el latente agrupado de la cámara base, un paso adversarial del encoder (RMSProp 1e-5) y un paso del encoder de dinámica (RMSProp 1e-6) sobre la pérdida de la cabeza IDM congelada (excluyendo el índice de gripper 6) más el MSE del modelo forward congelado.

Los detalles del run están fijados: batch 32, semilla 42, 10.000 actualizaciones, guardando los pasos 999 y 9999. La inicialización proviene del paso 9999 del modelo fuente, junto con el buffer de latentes fuente (49.600 ventanas) y el modelo de dinámica forward preentrenado. La política de evaluación (`policy/`) corresponde al paso 9999 sin la cabeza IDM, con la torre de visión adaptada usada también para la cámara de muñeca. La evaluación se realizó con 500 episodios por suite, semilla de entorno 7, sobre un evaluador nvidia_h100 con renderizado OSMesa y MuJoCo 3.2.3.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO (4 suites, 500 episodios cada una).
- Política visuomotora que consume observaciones de cámara base y cámara de muñeca, más estado del robot, y produce acciones.
- Adaptación de dominio visual mediante ILA sobre el encoder PaliGemma.
- Evaluación reproducible con protocolo documentado (semilla de entorno 7, MuJoCo 3.2.3, OSMesa).
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto conversacional: es un checkpoint de política, no un LLM de propósito general.
- Capacidades multilingües: no aplicables (no es un modelo de lenguaje).
- Modo thinking, visión general, audio: no disponibles en esta ficha.

## Casos de uso

- Reproducción del baseline ILA en LIBERO: cargar `policy/` y ejecutar la evaluación con semilla 7 y MuJoCo 3.2.3 para verificar el 90,00% reportado y comparar contra el paso 1000 (89,45%).
- Ablación de adaptación visual: usar este checkpoint como referencia para medir el efecto de adaptar solo el encoder PaliGemma frente a adaptar también LLM o experto de acciones.
- Estudio de estabilidad del crítico WGAN: analizar `ila/critic_9999.npz` y el `train_state` para inspeccionar la evolución del entrenamiento adversarial con weight clip 0,01.
- Comparación de checkpoints por paso: contrastar el paso 999 frente al 9999 para estudiar la curva de éxito en LIBERO y decidir criterios de selección de checkpoint.
- Base para transferencia a un dominio robótico propio: partir del encoder adaptado y aplicar un nuevo ciclo ILA con otro buffer de latentes, manteniendo congelados LLM y experto de acciones.
- Docencia e investigación en VLA: usar el repositorio como ejemplo completo de pipeline openpi con presets (`pi05_libero_ila_img_view_adapt`) y configuración reproducible en `run/spec.json`.
- Verificación de robustez ante la cámara de muñeca: evaluar el uso de la torre de visión adaptada en la cámara de muñeca, tal como hace la política de evaluación.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| LIBERO (4 suites, 500 episodios/suite) | Paso 9999, semilla de entorno 7, MuJoCo 3.2.3, OSMesa, H100 | 1800/2000 = 90,00% |
| LIBERO (misma configuración) | Paso 1000 | 1789/2000 = 89,45% |

No se han publicado en la información disponible resultados desagregados por suite (LIBERO-Spatial, Object, Goal, Long) ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 13,0 GB, lo que da una cota inferior aproximada para cargar pesos completos, pero no se especifica el consumo en inferencia.
- GPU recomendadas: la evaluación reportada se ejecutó en nvidia_h100; no se documentan otras GPU.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras consumer.
- Despliegue: stack openpi (preset `pi05_libero_ila_img_view_adapt`), con renderizado OSMesa y MuJoCo 3.2.3 para evaluación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_small (este) | VLA π0.5 + ILA, solo encoder visual adaptado | no disponible | 90,00% en LIBERO (2000 episodios) | apache-2.0 | Hugging Face, repo 13,0 GB |
| π0.5 LIBERO PAD img source ILA n50k | VLA π0.5, etapa fuente PAD | no disponible | no disponible en esta ficha | apache-2.0 (según repo fuente) | Hugging Face |
| π0.5 base (Physical Intelligence) | VLA generalista | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparativa se limita a linaje y licencia.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes: no hay validación comunitaria ni soporte.
- Evaluación limitada a LIBERO con semilla de entorno única (7); no se reportan intervalos de confianza ni varianza entre semillas.
- Solo se adapta el encoder visual; el resto del modelo queda en el estado fuente, por lo que la ganancia de dominio está acotada por diseño.
- El resultado del 90,00% corresponde al mejor de dos checkpoints elegido sobre la misma evaluación reportada, lo que introduce un sesgo de selección.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, matemáticas ni tareas conversacionales.
- Idiomas soportados no disponibles; no aplica en la práctica.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de fallo de política fuera de la distribución de LIBERO.
- Licencia apache-2.0 permite uso comercial según los términos de la licencia, pero el comportamiento fuera de LIBERO no está validado.
- Requiere stack específico (openpi, MuJoCo 3.2.3, OSMesa) y GPU de datacenter para reproducir la evaluación reportada.
- El repositorio incluye `train_state` y crítico, pero no se documentan pasos intermedios más allá de 999 y 9999.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-pad-vision-head-view-small-10000-20261105
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Paper ILA (Yoneda et al., RSS 2022): no disponible en la información proporcionada
- Repositorio de código `Donghyun1228/vla_adaptation` (commit `1b67b86b`, doc `docs/naive_probe/ila_baseline_20261105.md`): no disponible como URL en la información proporcionada
- π0.5 de Physical Intelligence: no disponible en la información proporcionada
- Resultado de búsqueda web irrelevante (Safe Frame, Instagram): descartado por no guardar relación con el modelo
