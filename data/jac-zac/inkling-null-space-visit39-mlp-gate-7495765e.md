# Jac-Zac/inkling-null-space-visit39-mlp-gate-7495765e

## Resumen

Inkling null-space visit39 MLP gate es un ajuste fino (fine-tune) del modelo base `thinkingmachines/Inkling-2-Mini`, publicado por el usuario Jac-Zac en Hugging Face. Se trata de un artefacto experimental de investigación más que de un modelo listo para producción: el repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos publicados son únicamente los adaptadores y no el modelo completo. El autor lo describe como tres adaptadores de rango 12 que se aplican al residual local, al mensaje entrante del bucle y al estado fusionado en una única posición de lectura, con la compuerta MLP nativa del modelo calculando la fusión.

La propuesta técnica es un ejercicio de intervención sobre las activaciones internas del modelo base: tras aplicar los adaptadores, el modelo completa el bloque fuente y ejecuta sus seis capas Coda nativas. Los adaptadores se ajustaron durante 768 actualizaciones sobre prompts públicos y generados, y la inferencia utiliza las activaciones del propio modelo. El nombre "null-space" sugiere una técnica de proyección o edición en el espacio nulo de representaciones, aunque la model card no desarrolla la metodología.

Por su naturaleza, este repositorio es relevante para investigadores interesados en edición de activaciones, adaptadores de bajo rango aplicados a posiciones específicas y experimentos de interpretabilidad sobre modelos pequeños. No hay información pública sobre benchmarks, idiomas soportados ni arquitectura detallada del modelo base, por lo que la ficha se limita a lo declarado por el autor y marca explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: thinkingmachines/Inkling-2-Mini; adaptadores de rango 12 sobre compuerta MLP y capas Coda) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`mlp-gate-coda.safetensors`, SHA-256 `7495765e1c14930e6a9f43afe1ae088115ee88bb60ef6fc50f79ae462abc1b1b`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base `thinkingmachines/Inkling-2-Mini`. Según la model card, se aplican tres adaptadores de rango 12 en una única posición de lectura: uno sobre el residual local, otro sobre el mensaje entrante del bucle y otro sobre el estado fusionado. La compuerta MLP nativa del modelo base realiza la fusión de estos estados. A continuación, el modelo completa el bloque fuente y ejecuta sus seis capas Coda nativas. La inferencia utiliza las activaciones del modelo base, no una reconstrucción externa.

El entrenamiento consistió en 768 actualizaciones sobre una mezcla de prompts públicos y generados. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La técnica "null-space" del nombre no se describe en la model card; tampoco se detalla el mecanismo de congelación o proyección que justificaría esa denominación. No hay información sobre innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- No se documentan capacidades específicas del fine-tune más allá de la intervención sobre la compuerta MLP y las capas Coda del modelo base.
- Se desconoce si conserva las capacidades del base `Inkling-2-Mini` (generación de texto, razonamiento, código) tras el ajuste.
- No hay evidencia de soporte de tool calling o function calling en la información disponible.
- No hay evidencia de soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se declaran capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Investigación en edición de activaciones: el modelo sirve como banco de pruebas para estudiar cómo tres adaptadores de rango 12 sobre una posición de lectura concreta alteran la salida del modelo base, gracias a que la model card documenta la posición exacta de intervención.
- Estudio de compuertas MLP: permite analizar cómo la compuerta MLP nativa fusiona estados residuales modificados, útil para trabajos de interpretabilidad mecanicista.
- Reproducción de experimentos de fine-tune ligero: con 768 actualizaciones y un único fichero safetensors, es adecuado para validar pipelines de entrenamiento de adaptadores de bajo rango.
- Análisis de capas Coda: al ejecutarse las seis capas Coda nativas tras la intervención, el modelo permite evaluar el papel de estas capas en la generación final.
- Docencia y formación: como ejemplo de repositorio experimental con licencia MIT, puede usarse en cursos sobre fine-tuning y análisis de modelos.
- Auditoría de artefactos de Hugging Face: útil para estudiar la trazabilidad de repositorios con 0 descargas y verificar la integridad del fichero mediante el SHA-256 publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del base `Inkling-2-Mini`, que no se especifica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el repositorio contiene únicamente el fichero `mlp-gate-coda.safetensors` de adaptadores, por lo que requiere cargar el modelo base por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, y el base `thinkingmachines/Inkling-2-Mini` no tiene especificaciones públicas en esta ficha.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Tamaño del repo de 0.0 GB: los pesos publicados son adaptadores, no un modelo completo; es necesario descargar el base por separado.
- La model card no documenta sesgos conocidos, riesgo de alucinación ni comportamiento en producción.
- No se especifican idiomas soportados; se desconoce si el ajuste degrada el multilingüismo del base.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero el modelo base puede tener su propia licencia que prevalezca; conviene verificar la licencia de `thinkingmachines/Inkling-2-Mini`.
- El nombre "null-space" no se explica técnicamente; no hay paper ni documentación que respalde la metodología.
- No hay información sobre estabilidad numérica, formato de chat ni plantilla de prompt, lo que dificulta su uso directo en producción.
- La fecha de creación (2026-11-26) y la ausencia de pipeline dificultan evaluar su madurez.

## Enlaces

- Hugging Face: https://huggingface.co/Jac-Zac/inkling-null-space-visit39-mlp-gate-7495765e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
