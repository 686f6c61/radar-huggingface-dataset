# HqH1111/OCCWAM

## Resumen

OCCWAM B2D v9 step18000 es un checkpoint de un modelo conjunto de *flow matching* para predicción de ocupación y trayectorias en conducción autónoma, desarrollado por el usuario HqH1111. Está diseñado como componente del agente *closed-loop* v9 del benchmark Bench2Drive, un entorno de evaluación de conducción autónoma en simulación. El modelo genera de forma conjunta mapas de ocupación de la escena y trayectorias de vehículos a partir de ruido blanco, seguido de un *warp* rígido de escena a ego-futuro, re-encodificado con un VAE y un refinamiento de *rollout* ego parametrizado por velocidad.

El repositorio contiene un único archivo de pesos (`v9step18000_FULL_merged.pt`) de aproximadamente 1,65 GB, sin licencia especificada ni documentación sobre arquitectura completa, número de parámetros o datos de entrenamiento. El modelo no incluye los componentes externos que lo acompañan (Qwen3-VL, Stage-3 carrier, OCC VAE, TransFuser++ y Profile-B), cuyos hashes y roles se documentan en el repositorio de GitHub del autor. Su relevancia radica en ser un ejemplo de aplicación de *flow matching* a la predicción conjunta de ocupación y trayectoria, un área activa en la investigación de conducción autónoma, aunque su disponibilidad pública es muy limitada y carece de documentación suficiente para evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | *Flow matching* conjunto para ocupación y trayectoria, con VAE y refinamiento de *rollout* ego (componentes adicionales: Qwen3-VL, Stage-3 carrier, OCC VAE, TransFuser++ y Profile-B, no incluidos en el checkpoint) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa PyTorch, formato `.pt`) |
| Idiomas soportados | no disponible (modelo de visión y planificación, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (archivo `v9step18000_FULL_merged.pt`, 1.656.918.530 bytes) |

## Arquitectura y entrenamiento

La información disponible describe el grafo de inferencia como un *flow matching* conjunto de ocupación y trayectoria a nivel de escena, partiendo de ruido blanco. Tras la generación, se aplica un *warp* rígido de la escena al futuro del ego, seguido de re-encodificado con un VAE y un refinamiento de *rollout* del ego parametrizado por velocidad. El modelo está entrenado con una normalización unificada de puntos objetivo (`OCCWAM_TP_NORM_UNIFIED=1`), que debe activarse tanto en entrenamiento como en inferencia para evitar cambios silenciosos en el condicionamiento de entrada.

No se especifican detalles sobre el dataset de entrenamiento, número de tokens o pasos de optimización más allá del *global step* 18000. El checkpoint no incorpora los componentes auxiliares (Qwen3-VL como codificador visual, Stage-3 carrier, VAE de ocupación, TransFuser++ y Profile-B), que se documentan por separado en el repositorio de GitHub. No hay información sobre técnicas de RLHF, DPO o ajuste fino supervisado.

## Capacidades

- Predicción conjunta de mapas de ocupación de escena y trayectorias de vehículos mediante *flow matching*.
- Generación de escenas futuras completas a partir de ruido blanco, con *warp* rígido al sistema de referencia del ego.
- Refinamiento de trayectorias ego mediante *rollout* parametrizado por velocidad.
- Integración en agentes *closed-loop* del benchmark Bench2Drive (versión v9).
- Depende de componentes externos (Qwen3-VL, Stage-3 carrier, OCC VAE, TransFuser++ y Profile-B) que no se incluyen en este repositorio.
- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones.
- Sin soporte conocido de *tool calling*, agentes conversacionales o capacidades multilingües.

## Casos de uso

- Simulación de conducción autónoma en Bench2Drive: el modelo se usa como módulo de predicción de ocupación y trayectoria dentro de un agente *closed-loop*, generando escenarios futuros para planificación de maniobras.
- Investigación en *flow matching* aplicado a percepción de escenas dinámicas: permite estudiar la generación conjunta de ocupación y trayectorias con un enfoque generativo basado en flujos.
- Desarrollo de sistemas de predicción de movimiento para vehículos autónomos: el checkpoint puede servir como referencia para implementar arquitecturas similares de predicción conjunta.
- Evaluación comparativa de modelos de predicción en el contexto de Bench2Drive, si se dispone de los componentes auxiliares y el código de entrenamiento del repositorio GitHub.
- Reentrenamiento o *fine-tuning* sobre nuevos datasets de conducción, siempre que se respete el contrato de normalización y se tengan los assets externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento en Bench2Drive ni comparaciones con otros modelos de predicción de ocupación o trayectoria.

## Requisitos de hardware

- El archivo de pesos ocupa ~1,65 GB en disco, lo que sugiere un modelo de tamaño moderado (probablemente entre 1 y 3 mil millones de parámetros, aunque no confirmado).
- VRAM estimada: no disponible; dependerá de la resolución de entrada y del *batch size*. Para un modelo de ~1,65 GB en FP32, se necesitarían al menos 4-6 GB de VRAM solo para los pesos, más memoria para activaciones.
- GPU recomendadas: no especificadas. Una GPU con 12-24 GB de VRAM (RTX 3090, RTX 4090, A5000) podría ser suficiente para inferencia, pero no hay confirmación.
- Opciones de despliegue: el código de entrenamiento e inferencia está en el repositorio GitHub del autor; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (al no ser un LLM, estas herramientas no aplican directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos directamente comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparativa cuantitativa. En la categoría de predicción de ocupación y trayectoria en conducción autónoma existen alternativas como UniAD, VAD o Motion Transformer, pero no hay datos de este modelo para comparar.

## Limitaciones y advertencias

- La licencia de uso no está especificada: no se puede determinar si el modelo es de código abierto, de uso restringido o propietario. No se recomienda su uso comercial sin aclaración del autor.
- El checkpoint no incluye los componentes auxiliares (Qwen3-VL, Stage-3 carrier, OCC VAE, TransFuser++ y Profile-B), por lo que el modelo no es funcional de forma aislada. Se necesita el código y los assets del repositorio GitHub para reproducir la inferencia.
- La normalización unificada de puntos objetivo (`OCCWAM_TP_NORM_UNIFIED=1`) debe activarse explícitamente; omitirla altera silenciosamente el condicionamiento de entrada y degrada los resultados.
- No hay documentación sobre sesgos, riesgo de alucinación o limitaciones de contexto. Al ser un modelo de percepción para conducción, no genera texto, pero su comportamiento en escenarios no vistos es desconocido.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creación es futura (2026-08-30), lo que sugiere que es un artefacto de investigación reciente o experimental sin validación comunitaria.
- No se proporcionan métricas de seguridad ni evaluaciones de robustez frente a condiciones adversas (clima, iluminación, objetos raros), esenciales para uso en conducción real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HqH1111/OCCWAM
- Perfil del autor en HuggingFace: https://huggingface.co/HqH1111
- Repositorio de código (mencionado en la model card): https://github.com/HQH111/OCCWAM
- Otros modelos del autor: https://huggingface.co/HqH1111/models
