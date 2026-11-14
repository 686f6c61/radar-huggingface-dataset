# Frankenstein-Labs/CORTEX.COWORK

## Resumen

CORTEX.COWORK es un artefacto de investigación publicado por Frankenstein-Labs en Hugging Face bajo licencia MIT. Se presenta como un modelo multimodal único, entrenado desde cero (sin pesos preentrenados), que integra en un mismo conjunto de parámetros tres capacidades: percepción de capturas de pantalla (captioning, localización de elementos y grounding a coordenadas), generación y edición de imágenes, y uso de ordenador (traducir una instrucción más una captura en una acción estructurada como clic, escritura o comando bash). No es un orquestador de tres modelos: comparte un codificador visual y un tronco decoder-only, con proyecciones de salida específicas por capacidad.

El modelo es explícitamente un "bootstrap research artefact": el pipeline está probado de extremo a extremo, pero los pesos no son útiles todavía. El propio autor advierte que no reclama ninguna capacidad ni resultado de benchmark, y que el estado actual se mide sobre un dataset sintético con una ejecución de 2.500 pasos en CPU y 851.634 parámetros. La relevancia ahora es metodológica: documenta de forma honesta un proceso de entrenamiento from-scratch, con métricas negativas incluidas, y sirve como base reproducible para investigación en agentes computer-use y en políticas de seguridad de agentes.

La arquitectura se describe en ocho componentes (codificador visual, LM troncal, decodificador de acciones, grounding de coordenadas, planificador de tareas, motor de ejecución, sistema de feedback y capa de seguridad), pero no se publican detalles de tamaño total, longitud de contexto ni composición del dataset más allá de la etiqueta "synthetic".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual (patch transformer from-scratch) + tronco decoder-only compartido + cabezas de salida por capacidad (acción, grounding, planificación) |
| Parámetros totales | 851.634 (según la ejecución de bootstrap reportada; no se especifica si es el total del modelo o solo del checkpoint evaluado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería pytorch; no se detalla safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo se compone de ocho bloques según la model card: un codificador visual basado en patch transformer entrenado desde cero; un tronco decoder-only compartido que actúa como modelo de lenguaje; un decodificador de acciones con cabezas de canal y tipo de acción; un módulo de grounding de coordenadas mediante soft-argmax sobre 1.000 bins; un planificador de tareas con tokens latentes de plan; un motor de ejecución con backends dry-run y local; un sistema de feedback que verifica, reintenta y detecta cambios de pantalla; y una capa de seguridad con guardas de comandos, inyección y rutas.

El entrenamiento parte de una inicialización aleatoria, sin usar pesos de Mage, Qwen, Llama ni de ningún otro checkpoint preentrenado. El código de Microsoft Mage (MIT, con componentes Mage-VL bajo Apache-2.0) se conserva en el árbol como material de referencia, pero no se incluyen sus pesos. Los datos de entrenamiento son exclusivamente sintéticos, sin renderizado de texto, oclusión, supervisión multi-paso ni datos de fallo. La ejecución de bootstrap reportada es de 2.500 pasos en CPU sobre 256 muestras de evaluación. No se documentan número de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Percepción de capturas de pantalla: captioning de la imagen, localización de elementos y grounding de un objetivo a coordenadas.
- Generación de imágenes y edición condicionada por una imagen de referencia (flow matching, según la métrica flow MSE reportada).
- Uso de ordenador: conversión de instrucción más captura en acción estructurada (clic, escritura, bash, etc.).
- Planificación de tareas mediante tokens latentes de plan.
- Ejecución con backends dry-run y local, con verificación, reintento y detección de cambios en pantalla.
- Capa de seguridad con guardas de comandos, inyección y rutas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: el diseño incluye planificador y feedback, pero el autor indica que no hay supervisión multi-paso en los datos.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión, audio: visión sí; thinking y audio no disponibles.

## Casos de uso

- Investigación en agentes computer-use: servir como base reproducible para estudiar cómo un tronco compartido aprende percepción, generación y acción con un único conjunto de parámetros, partiendo de una inicialización aleatoria y datos sintéticos.
- Estudio de seguridad de agentes: la capa de seguridad (guardas de comandos, inyección y rutas) y el sistema de feedback permiten experimentar con políticas de ejecución segura en entornos controlados, aunque el autor advierte que es un backstop y no una garantía.
- Evaluación de pipelines de entrenamiento from-scratch: el repositorio documenta métricas negativas (verificación a nivel de azar, AUROC en el azar) y sirve para contrastar metodologías de evaluación antes de escalar a datos reales.
- Prototipado de grounding de coordenadas: el módulo de soft-argmax sobre 1.000 bins es un componente aislable para experimentar con localización de elementos en capturas, sabiendo que el MAE actual (0,163) es pobre frente a una línea base de centro de pantalla (≈0,2).
- Generación y edición de imágenes condicionada: el flujo de flow matching puede estudiarse como componente separado para tareas de edición con imagen de referencia, con la cautela de que el error actual (flow MSE 0,434) no es competitivo.
- Docencia y divulgación técnica: como ejemplo documentado de arquitectura multimodal con tronco compartido y de reporte honesto de resultados, útil en cursos o artículos sobre entrenamiento desde cero.
- Integración en entornos de simulación: el motor de ejecución con backend dry-run permite probar acciones estructuradas sin tocar máquinas reales, adecuado para tests de pipeline.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de la ejecución de bootstrap sobre el dataset sintético (2.500 pasos, CPU, 851.634 parámetros, 256 muestras de evaluación). No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, OSWorld) y el autor lo declara explícitamente.

| Métrica | Valor | Interpretación según el autor |
|---|---|---|
| Channel accuracy | 1,00 | Trivial en datos sintéticos; no es un logro |
| Action-type accuracy | 1,00 | Casi determinista desde la instrucción; no es un logro |
| Coordinate MAE | 0,163 | Pobre; una conjetura de centro de pantalla puntúa ≈ 0,2 |
| Coordinate hit@0.10 | 0,194 | Pobre |
| Text exact match (free-running) | 0,00 | La decodificación greedy no reproduce aún un objetivo completo |
| Text teacher-forced accuracy | 0,73 | Aprendizaje real: el tronco predice el siguiente token objetivo |
| Flow MSE | 0,434 | Error de generación de imágenes |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño reportado (851.634 parámetros) es compatible con CPU, tal como se usó en la ejecución de bootstrap.
- GPU recomendadas: no disponible. No se especifican A100, H100 ni RTX 4090.
- ¿Cabe en GPU consumer? Por el número de parámetros reportado, sí en cualquier GPU consumer moderna e incluso en CPU, aunque no se detalla el coste del codificador visual ni del decodificador de imágenes.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI). La librería declarada es pytorch y el autor menciona un adaptador para OSWorld que requiere servidor de inferencia GPU y VM sandbox por tarea.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (sin benchmarks estándar) y el autor no ofrece comparaciones con otros modelos. Se incluye una comparación estructural limitada:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CORTEX.COWORK | 851.634 (bootstrap) | no disponible | MIT | Multimodal from-scratch con tronco compartido para percepción, generación y computer-use |
| Microsoft Mage / Mage-VL | no disponible | no disponible | MIT / Apache-2.0 (componentes) | Referencia estudiada por el autor; no se usan sus pesos |
| Alternativas computer-use de código abierto | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Los pesos no son útiles todavía; el propio autor lo declara como artefacto de bootstrap.
- Sin resultado en benchmarks reales: el adaptador para OSWorld existe, pero la ejecución no se ha realizado.
- Datos exclusivamente sintéticos: sin renderizado de texto, oclusión, supervisión multi-paso ni datos de fallo.
- Verificación no resuelta: la precisión iguala la línea base de mayoría y el AUROC está en el azar (resultado negativo reportado).
- Grounding de coordenadas pobre: MAE 0,163 y hit@0.10 de 0,194.
- Generación de texto libre no funcional: exact match 0,00 en decodificación greedy.
- No usar en máquinas reales con datos sensibles: la capa de seguridad es un backstop, no una garantía.
- Uso previsto solo para investigación en agentes computer-use y políticas de seguridad; no para producción, entornos de alto riesgo ni uso no supervisado.
- Solo inglés; sin soporte multilingüe declarado.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible, pero esperables en un modelo entrenado desde cero con datos sintéticos.
- Restricciones de licencia: MIT permite uso comercial, pero el estado del modelo y las advertencias del autor desaconsejan cualquier uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Frankenstein-Labs/CORTEX.COWORK
- Repositorio de código: https://github.com/Frankenstein-Labs/Cortex.Cowork
- Arquitectura: https://github.com/Frankenstein-Labs/Cortex.Cowork/blob/main/ARCHITECTURE.md
- Auditoría de Mage: https://github.com/Frankenstein-Labs/Cortex.Cowork/blob/main/docs/audit/MAGE_AUDIT.md
- Aviso legal y atribución: https://github.com/Frankenstein-Labs/Cortex.Cowork/blob/main/NOTICE
