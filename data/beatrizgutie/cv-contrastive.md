# beatrizgutie/cv-contrastive

## Resumen

`beatrizgutie/cv-contrastive` es un repositorio de HuggingFace que contiene una implementación compacta y personalizada de la arquitectura Albef (Align before Fuse, un modelo multimodal visión-lenguaje originalmente propuesto por Salesforce Research) orientada a tareas de aprendizaje contrastivo. Lo publica la usuaria beatrizgutie y se distribuye bajo licencia MIT. El repositorio incluye el código del modelo en `model.py`, un fichero de configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización en formato safetensors.

Es importante subrayar que, según la propia model card, este no es un modelo preentrenado listo para producción: el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests) y no un modelo entrenado con benchmarks publicados. La configuración declarada es de escala "large" e incorpora atención multi-query, fusión con gating, activación GELU y normalización RMSNorm.

El interés actual del repositorio es fundamentalmente didáctico y de experimentación controlada: sirve como punto de partida reproducible para quien quiera explorar variantes de Albef con objetivos contrastivos, no como alternativa a modelos multimodales entrenados a gran escala. El recuento real de parámetros en el checkpoint safetensors es de 33.088, un valor extremadamente reducido que confirma su naturaleza de inicialización y no de modelo funcional entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Albef (Align before Fuse), implementación personalizada en PyTorch |
| Parametros totales | 33.088 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (`model.py`) |

## Arquitectura y entrenamiento

La arquitectura declarada es Albef, un diseño multimodal que combina un codificador visual y un codificador de texto con un módulo de fusión. En esta implementación concreta, la model card especifica atención multi-query, fusión con gating, activación GELU y normalización RMSNorm, con escala "large". El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que emplea el optimizador Lion con un schedule de tipo "step".

No hay evidencia de entrenamiento completado: la model card indica explícitamente que el checkpoint es una inicialización para pruebas de humo y que no se reclama ninguna puntuación de benchmark. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO. La propia documentación recomienda que cualquier evaluación futura use un conjunto held-out específico de la tarea, reporte la métrica sobre al menos tres semillas e incluya una línea base de capacidad equivalente. Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.

## Capacidades

- No se documentan capacidades funcionales verificadas: el checkpoint es una inicialización sin entrenar.
- La arquitectura Albef está diseñada para tareas visión-lenguaje con aprendizaje contrastivo, pero no hay evidencia de que esta instancia concreta las ejecute.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en esta implementación.
- El artefacto principal es el código (`model.py`), pensado para revisión, pruebas de humo y experimentos controlados.

## Casos de uso

- Revisión de código de arquitecturas multimodales: el repositorio sirve como referencia compacta para estudiar cómo se implementa Albef con atención multi-query y fusión con gating en PyTorch, útil en docencia o revisión de diseños.
- Pruebas de humo en pipelines de CI: al ser un checkpoint de inicialización pequeño (33.088 parámetros), permite validar que un pipeline de carga, serialización y forward pass funciona antes de escalar a modelos reales.
- Experimentos controlados de aprendizaje contrastivo: el fichero `training_args.json` con Lion y schedule "step" ofrece una receta de partida reproducible para comparar variantes con igual presupuesto de datos y semillas.
- Base para ablaciones de arquitectura: investigadores pueden modificar atención, fusión o normalización y medir el impacto en una tarea concreta con un conjunto held-out, siguiendo la guía de evaluación de la model card.
- Prototipado de adaptadores de carga: dado que requiere un adaptador explícito para APIs genéricas, es útil para desarrollar y probar integraciones personalizadas en HuggingFace Transformers.
- Formación y tutoriales: como ejemplo mínimo y autocontenido de implementación de un modelo multimodal con objetivo contrastivo, encaja en materiales didácticos de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 33.088 parámetros en fp32 (aproximadamente 0,13 MB de pesos); el cuello de botella será el código y las dependencias, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es sobradamente suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU para pruebas de humo.
- Opciones de despliegue: al ser una implementación personalizada, no se garantiza compatibilidad directa con vLLM, TGI, llama.cpp u Ollama; el uso previsto es ejecutar `python model.py --help` y el bloque `__main__` del script.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beatrizgutie/cv-contrastive | 33.088 | no disponible | No (inicialización) | MIT | HuggingFace |
| Albef original (Salesforce) | no disponible en la información | no disponible | Sí (preentrenado multimodal) | no disponible en la información | Repositorio oficial de Salesforce |
| BLIP (Salesforce) | no disponible en la información | no disponible | Sí | no disponible en la información | HuggingFace |
| CLIP (OpenAI) | no disponible en la información | no disponible | Sí | no disponible en la información | HuggingFace / OpenAI |

La comparación directa no es significativa: este repositorio es una implementación didáctica sin entrenar, mientras que Albef, BLIP y CLIP son modelos preentrenados a gran escala. Se incluyen como referencia de la familia arquitectónica, no como alternativas funcionales equivalentes.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce salidas útiles para ninguna tarea real.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- Riesgo de alucinación: no aplica en sentido estricto al no ser un modelo generativo entrenado, pero cualquier uso tras un entrenamiento futuro requerirá evaluación específica.
- No hay información sobre sesgos, cobertura idiomática ni limitaciones de contexto.
- Licencia MIT permite uso comercial del código, pero deben revisarse por separado los términos de los datasets externos que se usen con él.
- No es compatible con APIs genéricas de carga automática sin un adaptador explícito.
- Cualquier resultado de un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/beatrizgutie/cv-contrastive
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
