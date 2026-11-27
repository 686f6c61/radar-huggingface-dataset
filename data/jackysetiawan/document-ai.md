# Jackysetiawan/document-ai

## Resumen

Jackysetiawan/document-ai no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigacion sobre Document AI publicado en Hugging Face. La model card describe explicitamente un artefacto exploratorio: registra una comparacion propuesta, los posibles factores de confusion y los requisitos de reproducibilidad antes de reportar cualquier resultado de benchmark. El autor indica que el repositorio no contiene codigo liberado, ablaciones completas ni un checkpoint entrenado.

El unico artefacto principal declarado es `notes.md`, un documento de texto con el planteamiento del estudio, el contexto de evaluacion propuesto (FUNSD, SROIE, CORD) y referencias. Los pesos en formato safetensors asociados al repositorio contienen 49.600 parametros totales, un volumen que no corresponde a un transformer funcional para tareas de Document AI y que es coherente con un artefacto residual o de prueba, no con un modelo desplegable.

Por tanto, este repositorio es relevante unicamente como material de referencia metodologica para quien disene experimentos de extraccion de informacion en documentos, no como un modelo para evaluar, desplegar o comparar en rendimiento. Cualquier uso en produccion es inviable con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (segun tag de Hugging Face); sin detalle arquitectonico en la model card |
| Parametros totales | 49.600 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF, DPO o ajuste supervisado. El tag `transformer` aparece en los metadatos de Hugging Face, pero no hay documentacion que confirme que el checkpoint de 49.600 parametros implemente dicha arquitectura ni que haya sido entrenado para ninguna tarea.

El contenido del repositorio se limita a notas de investigacion. Segun el autor, las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales, y si se anaden resultados en el futuro deberan incluir versiones de dataset, comandos, semillas, hardware y registros en bruto. No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos u otras).

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue.
- El repositorio contiene unicamente notas metodologicas sobre Document AI, con contexto de evaluacion propuesto en FUNSD, SROIE y CORD.

## Casos de uso

- Referencia metodologica para disenar experimentos de extraccion de informacion en documentos: las notas enumeran factores de confusion y requisitos de reproducibilidad que pueden servir de checklist antes de lanzar un benchmark propio sobre FUNSD, SROIE o CORD.
- Plantilla de protocolo de evaluacion: el documento propone comparaciones con lineas base emparejadas, util para estandarizar la seleccion de baselines en estudios de Document AI.
- Guia de reproducibilidad: el autor exige registrar versiones de dataset, comandos, semillas, hardware y registros en bruto, lo que puede adoptarse como convencion interna de un equipo de investigacion.
- Seleccion de conjuntos de datos: la mencion explicita de FUNSD (formularios escaneados), SROIE (recibos) y CORD (tickets) ayuda a acotar el alcance de un proyecto de extraccion de entidades.
- Documentacion de limitaciones: la seccion de scope and limitations sirve como ejemplo de como declarar que un repositorio no contiene resultados ni checkpoints, practica util para revisiones internas.
- Material de formacion para investigadores junior: explica como separar hipotesis de resultados y por que no deben publicarse mejoras de benchmark sin evidencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna mejora de benchmark, ablacion completada, codigo liberado ni checkpoint entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay un modelo funcional documentado para inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no incluye codigo de servicio ni configuracion de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria, dado que este repositorio no constituye un modelo de Document AI entrenado sino un conjunto de notas de investigacion.

## Limitaciones y advertencias

- El repositorio no contiene un checkpoint entrenado ni codigo liberado; no debe tratarse como un modelo desplegable.
- Los 49.600 parametros en safetensors no son compatibles con un transformer funcional para tareas de Document AI; su origen y contenido no estan documentados.
- Las secciones de la model card marcadas como planes o hipotesis no son resultados experimentales y no deben citarse como evidencia.
- No hay informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica porque no hay modelo evaluable.
- La licencia MIT cubre el repositorio, pero el autor advierte de que los terminos de los datos de origen deben revisarse por separado si se usan datasets externos (FUNSD, SROIE, CORD tienen sus propias condiciones).
- Sin fecha de actualizacion posterior a la creacion (2026-11-27) y con cero descargas y cero likes, no hay senales de mantenimiento ni validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jackysetiawan/document-ai
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
