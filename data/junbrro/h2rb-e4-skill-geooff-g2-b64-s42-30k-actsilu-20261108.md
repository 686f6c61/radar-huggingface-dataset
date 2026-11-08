# junbrro/h2rb-e4-skill-geooff-g2-b64-s42-30k-actsilu-20261108

## Resumen

El modelo `h2rb-e4-skill-geooff-g2-b64-s42-30k-actsilu-20261108` es un checkpoint de inferencia publicado por el usuario `junbrro` en Hugging Face, derivado de un entrenamiento identificado internamente como `junhyeong-e1e2-skill-geooff-g2-1107-r2`, con el paso de entrenamiento 30.000 verificado. Por la nomenclatura del identificador (skill, geooff, b64, s42, actsilu) y el tag `RLDX-1`, se trata de un modelo del ecosistema de robótica y aprendizaje por refuerzo (VLA, vision-language-action) orientado a la ejecución de habilidades motoras, no de un LLM conversacional de propósito general. La model card lo describe explícitamente como una copia de solo inferencia que conserva el tokenizador de acciones, la normalización, la etiqueta del decodificador y el contrato SiLU del entrenamiento original.

El dato más fiable disponible es el recuento real de parámetros en safetensors: 6.915.094.616, es decir, aproximadamente 6,9 mil millones, con un repositorio de 13,9 GB, lo que sugiere pesos en precisión de 16 bits. No obstante, la información pública es muy escasa: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks, y el propio autor advierte que la finalización del entrenamiento no equivale a una tasa de éxito medida en robot real.

Su relevancia es, por tanto, acotada: resulta útil como artefacto reproducible para quien disponga del runtime del proyecto RLDX-1 y quiera inspeccionar o desplegar el checkpoint, pero no constituye una base recomendable para evaluación comparativa ni para uso en producción sin validación propia. Los datos de entrenamiento, el optimizador y los estados de RNG se excluyeron deliberadamente del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de ecosistema: RLDX-1; nomenclatura sugiere modelo de acciones/robótica con activación SiLU) |
| Parametros totales | 6.915.094.616 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors, ~13,9 GB, compatible con precisión de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. El tag `RLDX-1` y el identificador del job (`junhyeong-e1e2-skill-geooff-g2-1107-r2`) apuntan a un pipeline propietario de entrenamiento por aprendizaje por refuerzo sobre habilidades (skill learning), con un paso verificado de 30.000. El sufijo `actsilu` indica el uso de activación SiLU en la cabeza o en el decodificador de acciones, y la model card subraya que ese contrato debe respetarse en inferencia junto con el tokenizador de acciones y la normalización originales.

El repositorio es una copia de solo inferencia: excluye datos crudos, estado del optimizador y estados de RNG, por lo que no permite reanudar el entrenamiento ni auditar el proceso. Se desconoce el volumen de tokens o de trayectorias, la composición del dataset, si hubo RLHF/DPO y cualquier innovación técnica adicional (decodificación especulativa, atención lineal, etc.). No se han publicado detalles al respecto.

## Capacidades

- Ejecución de habilidades motoras o de acciones dentro del ecosistema RLDX-1, según la nomenclatura del checkpoint.
- Conservación del tokenizador de acciones y de la normalización del entrenamiento, requisito para que las predicciones sean interpretables por el runtime.
- Contrato de activación SiLU preservado en el decodificador, condición declarada por el autor para un uso correcto.
- Generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes y multilingüismo: no disponible (no se documenta ninguna de estas capacidades).
- Modo thinking: no disponible.

## Casos de uso

- Reproducción de experimentos de aprendizaje por refuerzo: el checkpoint permite cargar el estado exacto del paso 30.000 en el runtime RLDX-1 para comparar curvas de entrenamiento o validar la configuración de activación y tokenizador.
- Auditoría de contrato de inferencia: sirve para verificar que una implementación propia respeta el tokenizador de acciones, la normalización y la etiqueta del decodificador declarados por el autor.
- Punto de partida para ajuste fino supervisado: al ser un modelo de ~6,9 mil millones de parámetros en safetensors, puede cargarse en frameworks estándar para experimentar con datos propios, siempre que se respete el formato de acciones.
- Evaluación interna de robustez: útil para medir, con un banco de pruebas propio, si el modelo generaliza fuera del entorno de entrenamiento, dado que el autor no publica tasas de éxito.
- Docencia e investigación en robótica y RL: como ejemplo de artefacto de solo inferencia con metadatos de job y paso verificable, adecuado para discutir reproducibilidad y trazabilidad en pipelines de entrenamiento.
- Integración en simulación: desplegable en entornos simulados compatibles con el runtime RLDX-1 para generar trayectorias antes de cualquier prueba física.
- No se recomienda su uso en atención al cliente, generación de código en producción ni otras tareas de lenguaje, al no existir evidencia de tales capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que la finalización del entrenamiento (paso 30.000) no constituye una tasa de éxito medida en robot real, por lo que no debe interpretarse como métrica de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 14 GB en precisión de 16 bits (coherente con los 13,9 GB del repositorio); aproximadamente 7-8 GB con cuantización a 8 bits y 4 GB a 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegue con margen; una RTX 4090 (24 GB) es suficiente para cargar los pesos sin cuantizar.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en tarjetas de 8-12 GB; no se garantiza compatibilidad con el runtime RLDX-1 en estos entornos.
- Opciones de despliegue: el autor indica que debe usarse el runtime del proyecto RLDX-1; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y su naturaleza de modelo de acciones hace improbable que estos servidores de texto sean aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (checkpoints de habilidades para RL/robótica del ecosistema RLDX-1) con parámetros, contexto, rendimiento y licencia documentados. La búsqueda web realizada devolvió únicamente un proyecto no relacionado (`alchaincyf/nuwa-skill`), que no constituye una alternativa técnica equiparable.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier despliegue.
- No es un modelo de lenguaje general: no hay evidencia de capacidades de texto, código, visión o tool calling, y la nomenclatura apunta a un modelo de acciones.
- El propio autor advierte de que la finalización del entrenamiento no equivale a una tasa de éxito medida en robot real; cualquier afirmación de rendimiento requiere validación independiente.
- Solo inferencia: sin datos crudos, optimizador ni RNG, no es posible reanudar el entrenamiento ni reproducir el proceso completo.
- Dependencia estricta del runtime RLDX-1 y del contrato de tokenizador, normalización y SiLU; un uso fuera de ese contrato puede producir salidas inválidas.
- Riesgo de alucinación y sesgos: no evaluable por falta de documentación y de benchmarks.
- Idiomas y contexto: no disponibles, lo que impide planificar despliegues multilingües o de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria que respalde su robustez.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/h2rb-e4-skill-geooff-g2-b64-s42-30k-actsilu-20261108
- Proyecto RLDX-1: no disponible (referenciado en la model card sin enlace)
- Paper, blog o repositorio del autor: no disponible
- Búsqueda web relacionada (no equivalente): https://github.com/alchaincyf/nuwa-skill
