# Kai9987kai/Sonapse-LAB

## Resumen

SYNAPSE (publicado en Hugging Face como `Kai9987kai/Sonapse-LAB`) es un sistema de investigación en neurocomputación y "programación en espacio de pesos" desarrollado por el autor independiente Kai9987kai. No se trata de un modelo de lenguaje en el sentido convencional, sino de un conjunto de componentes acoplados: redes recurrentes inspiradas en el conectoma de *Drosophila melanogaster*, un controlador MoE denominado Poseidon (327.230 parámetros), mecanismos de plasticidad estructural, neuromodulación multi-factor y un bucle de auto-mejora recursiva (RSI). El objetivo declarado es estudiar cómo modificar pesos de forma segura y verificable, y si dichas modificaciones actúan a través de la dinámica recurrente del conectoma o mediante sesgos motores superficiales.

El sistema se presenta como un banco de pruebas ("LAB") para experimentos de reparación autónoma de pesos, trasplante de subcircuitos entre modelos y análisis de mediación causal pearliano. Integra referencias al conectoma Janelia Male CNS v1.0 (11.751 tipos celulares) y ofrece 72 capacidades tipadas repartidas en 17 familias de arquitectura, desde resolución aritmética verificada hasta planificación de trayectorias o memoria holográfica.

Es relevante por su enfoque poco habitual: en lugar de competir en escala de parámetros o contexto, propone metodologías de auditoría, rollback atómico y oráculos metamórficos para validar cambios en redes neuronales biológicamente inspiradas. No obstante, el repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que indica que los artefactos publicados son mínimos o no están disponibles públicamente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: red recurrente de tasa con conectoma injertado (300 neuronas, 8 sitios), MoE Tidal DAgger (4 expertos), hiperred de espacio de pesos y bucle RSI |
| Parametros totales | No disponible (el controlador Poseidon declara 327.230 parámetros; el total del sistema no se especifica) |
| Parametros activos | 327.230 en el controlador MoE Poseidon (no se detalla el reparto por experto) |
| Longitud de contexto | No disponible (memoria recurrente de 128 dimensiones en Poseidon; buffer de trazas multi-escala en Mnemosyne) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio declara PyTorch como framework; tamaño del repo 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura combina varias capas acopladas en escalas temporales distintas. La entrada es una observación sensorial de 155 dimensiones (rayos de retina, propiocepción y señales de recursos) procesada por un compás de cuerpo central (bump de 16 cuñas), un cuerpo de hongo con células Kenyon dispersas y una bonificación de curiosidad RND. Estas señales alimentan un conectoma injertado de 300 neuronas distribuidas en 8 sitios, con dinámica sináptica firmada según la ley de Dale y plasticidad de injerto adaptativa. Un decodificador motor emite 5 comandos continuos. En paralelo, un puente residual bidireccional conecta con Poseidon, un controlador MoE de 4 expertos entrenado con Tidal DAgger y un estado de memoria recurrente de 128 dimensiones.

El entrenamiento se describe de forma cualitativa: Tidal DAgger para el controlador, plasticidad Hebbiana dependiente de actividad para sinaptogénesis entre neuropilos, poda metabólica de sinapsis latentes y neuromodulación dinámica (dopamina/RPE, serotonina/paciencia, octopamina/vigor, acetilcolina/atención sensorial). No se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO en sentido clásico. Las innovaciones destacadas incluyen programación en espacio de pesos con huella de padre y rollback atómico, trasplante de subcircuitos entre modelos con alineación ridge, análisis de mediación causal (NDE vs NIE), descomposición espectral mediante laplaciano de grafo y un oráculo metamórfico con cuatro invariantes (rotacional MR1, monotonía de valencia MR2, tolerancia a fallo de sensores MR3 y estabilidad de Lipschitz MR5).

## Capacidades

- Resolución aritmética y de problemas con verificación exacta y AST (`reasoning.solve`).
- Cálculo exterior de Cartan e involutividad de sistemas diferenciales (`reasoning.cartan`).
- Análisis de simetrías de Noether y leyes de conservación (`reasoning.noether`).
- Estimación de intervenciones mediante do-calculus de Pearl (`reasoning.causal`).
- Memoria episódica: almacenamiento y recuperación por clave/valor (`memory.store`, `memory.retrieve`).
- Memoria de trabajo multi-escala con trazas decrecientes (`memory.mnemosyne`).
- Memoria vectorial holográfica con convolución circular HRR (`memory.hologram`).
- Inferencia del controlador MoE Tidal DAgger e inspección de sus parámetros (`core.scene`, `core.tidal`).
- Simulación de grafo de conectoma recurrente y registro de perfiles de neuropilos de *Drosophila* (flywire, manc, optic-lobe).
- Representación sucesora acotada (`graph.successor`).
- Compás de cuerpo central con atractor de anillo de 16 cuñas (`embodiment.compass`).
- Aprendizaje de valencia con células Kenyon dispersas (`embodiment.mushroom_body`).
- Curiosidad por error de predicción RND (`embodiment.curiosity`).
- Planificación de trayectorias mediante rollout hacia adelante (`planning.oracle`).
- Dinámica POMDP de transiciones de fase discretas (`nexus.phase_world`).
- Programación de pesos transaccional con rollback atómico y diagnóstico de fallos en bucle cerrado.
- Trasplante de subcircuitos entre modelos con suite factorial de 6 brazos (`correct`, `random`, `shuffled`, `irrelevant`, `disabled`, `permuted_host`).
- Auto-mejora recursiva con políticas meta-heredadas y evaluación en tareas retenidas para aprendices nuevos.
- No se declara soporte de tool calling, function calling genérico, visión, audio ni agentes multi-paso en el sentido de los LLM actuales.

## Casos de uso

- Investigación en neurocomputación comparativa: el sistema permite simular un conectoma recurrente de 300 neuronas con dinámica de Dale y comparar sus salidas con las de un controlador MoE, útil para estudiar qué sustrato explica un comportamiento dado mediante mediación causal (NDE/NIE).
- Auditoría de modificaciones de pesos en producción experimental: el mecanismo de programación en espacio de pesos con huella de padre y rollback atómico permite aplicar parches numéricos acotados y revertirlos si el oráculo metamórfico detecta violaciones de invariancia rotacional o de Lipschitz.
- Estudio de trasplantes de subcircuitos: los seis brazos de control (`correct`, `random`, `shuffled`, `irrelevant`, `disabled`, `permuted_host`) permiten aislar si una mejora proviene realmente del subcircuito donante o de artefactos de alineación ridge.
- Reparación autónoma de redes: el bucle de diagnóstico de fallos con confirmación de escritor desconectado sirve para probar pipelines de reparación sin intervención humana en entornos simulados.
- Análisis espectral de conectomas: la descomposición en autovalores del laplaciano normalizado y los espectros de potencia neural permiten caracterizar modos armónicos resonantes en redes biológicamente plausibles.
- Optimización metabólica de cableado: el barrido de frentes de Pareto no dominados sobre coste axonal y energía homeostática es aplicable a estudios de esparsificación de conectomas reales.
- Experimentos de auto-mejora recursiva: la política meta $\phi$ con sucesores aceptados que controlan las propuestas siguientes permite comparar presupuestos idénticos entre aprendices nuevos en tareas retenidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni métricas comparables; únicamente describe la suite factorial de control y los oráculos metamórficos como metodología de evaluación interna, sin resultados numéricos.

## Requisitos de hardware

- VRAM estimada: no disponible. El controlador Poseidon declara 327.230 parámetros, lo que en fp32 ocuparía aproximadamente 1,3 MB solo en pesos, pero el sistema completo incluye conectoma, hiperred, memoria y bucle RSI sin cifras de tamaño publicadas.
- GPU recomendadas: no disponible. Por el tamaño declarado del controlador, cualquier GPU consumer moderna podría alojarlo, pero no hay datos del resto de componentes.
- Cabe en GPU consumer: probablemente sí para el controlador MoE aislado; no confirmado para el sistema completo.
- Opciones de despliegue: el repositorio declara PyTorch como framework. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. SYNAPSE no es un modelo de lenguaje y no se han identificado en la información proporcionada alternativas equivalentes de conectoma injertado con programación de pesos y RSI. Como referencia de categoría adyacente podrían citarse simuladores de conectoma de *Drosophila* (p. ej. FlyWire o NeuroMechFly), pero no se dispone de datos comparativos de parámetros, contexto ni rendimiento en la información facilitada.

## Limitaciones y advertencias

- Repositorio con 0 descargas, 0 likes y tamaño de 0.0 GB: los pesos y artefactos pueden no estar efectivamente publicados o ser meramente descriptivos.
- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K ni usarse para generación de texto general.
- Idioma declarado únicamente inglés (`en`), sin soporte multilingüe documentado.
- Ausencia total de benchmarks publicados: el rendimiento real es desconocido e imposible de verificar de forma independiente.
- Riesgo de sobreinterpretación: muchas capacidades (72 servicios en 17 familias) se declaran sin evidencia empírica adjunta en la model card.
- Las afirmaciones sobre "auto-mejora recursiva" y "reparación autónoma" deben tratarse con cautela; no se documentan resultados de seguridad ni de alineación.
- Licencia Apache 2.0 permite uso comercial, pero al no haber pesos publicados ni pipeline definido, la aplicabilidad práctica en producción es nula en el estado actual.
- Fecha de creación declarada en 2026-11-06, posterior a la fecha habitual de consulta; verificar la autenticidad y vigencia del repositorio antes de cualquier uso.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; los riesgos propios de un sistema neuromórfico experimental no están caracterizados.

## Enlaces

- Hugging Face: https://huggingface.co/Kai9987kai/Sonapse-LAB
- GraftBrain (referenciado): https://huggingface.co/kai9987kai/Graft-brain
- Supermix-Poseidon (referenciado): https://huggingface.co/kai9987kai/Supermix-Poseidon
- Supermix-Expanse-v2 (referenciado): https://huggingface.co/kai9987kai/Supermix-Expanse-v2
- Conectoma Janelia Male CNS v1.0: no disponible enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
