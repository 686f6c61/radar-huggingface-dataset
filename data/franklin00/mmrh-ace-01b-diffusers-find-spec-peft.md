# FrankLin00/mmrh-ace-01b-diffusers-find-spec-peft

## Resumen

ACE-01B es un adaptador PEFT de tipo LoRA publicado por el usuario FrankLin00 bajo el identificador `FrankLin00/mmrh-ace-01b-diffusers-find-spec-peft`. No se trata de un modelo entrenado para generar texto de calidad, sino de un control de validación para escáneres de seguridad: el autor lo describe explícitamente como un artefacto benigno empaquetado con el formato estándar de un adaptador LoRA sobre `HuggingFaceTB/SmolLM2-135M-Instruct`. Su interés es, por tanto, metodológico y de seguridad, no de rendimiento.

El repositorio contiene 240 tensores LoRA con formas válidas y ficheros de tokenizer reserializados que preservan la semántica del tokenizer del modelo base, de modo que los resultados de un escáner no puedan atribuirse únicamente a una firma de blob preexistente. El autor indica que el metadato ACE-01 y el paquete Python se copian byte a byte del experimento original y que, si se importa deliberadamente en un entorno de pruebas vulnerable, el único comando ejecutado es `whoami`, cuyo resultado se escribe en un fichero bajo `/tmp` o `$TMPDIR`, sin acceso a red ni a credenciales.

La relevancia del artefacto es acotada: sirve para comprobar si las herramientas de análisis de artefactos (escáneres de malware en repositorios de modelos, pipelines de cuarentena, sistemas de inspección de safetensors) detectan correctamente este tipo de carga y la clasifican como control benigno. No debe emplearse para inferencia en producción ni para evaluar calidad de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (SmolLM2-135M-Instruct) |
| Parametros totales | 4 parametros reportados en safetensors (adaptador LoRA; el modelo base tiene 135M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de PEFT, no un modelo completo. Se compone de 240 tensores con formas válidas que se aplican sobre las capas del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parametros. El repositorio incluye ficheros de tokenizer reserializados que mantienen la semántica del tokenizer original, un detalle deliberado para que la inspección no pueda apoyarse en coincidencias de blob ya conocidas.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). El autor declara que el repositorio no está pensado para calidad de modelo ni para inferencia en producción, sino como control de validación de escáneres. El metadato ACE-01 y el paquete Python asociado se copian byte a byte del experimento original; la única acción descrita del probe es la ejecución de `whoami` con escritura del resultado en `/tmp` o `$TMPDIR`, sin red ni acceso a credenciales.

## Capacidades

- No es un modelo de propósito general: no se ha entrenado ni evaluado para generación de texto de calidad.
- Actúa como carga de prueba para escáneres de seguridad de artefactos (detección de paquetes Python embebidos, inspección de tensores LoRA, análisis de tokenizers reserializados).
- Permite validar pipelines de cuarentena y clasificación de repositorios sospechosos en hubs de modelos.
- Sirve para comprobar si una herramienta distingue entre un control benigno declarado y una carga maliciosa real.
- No dispone de tool calling, function calling, capacidades de agente ni modo de razonamiento propios.
- Capacidades multilingües: no disponibles; dependen del modelo base y no se han documentado para este adaptador.
- No incluye visión, audio ni otras modalidades.

## Casos de uso

- Validación de escáneres de malware en hubs de modelos: se sube el artefacto a un entorno de prueba y se comprueba si la herramienta detecta el paquete Python embebido y lo clasifica correctamente, usando los 240 tensores LoRA como señuelo con formas válidas.
- Pruebas de pipelines de cuarentena: el repositorio permite verificar que un sistema de ingesta aísla adaptadores PEFT con contenido ejecutable antes de permitir su descarga o carga.
- Evaluación de inspección de safetensors: sirve para comprobar que las herramientas que leen metadatos de tensores no fallan ante adaptadores con formas válidas pero sin utilidad funcional.
- Test de detección de tokenizers reserializados: al preservar la semántica del tokenizer del modelo base pero cambiar la serialización, permite validar heurísticas que comparan hashes de ficheros de tokenizer.
- Formación y concienciación en seguridad de la cadena de suministro de modelos: útil como ejemplo reproducible de artefacto con carga ejecutable declarada y alcance limitado (`whoami`, escritura en `/tmp`).
- Verificación de aislamiento en sandboxes: se importa el paquete en un harness vulnerable controlado para confirmar que el sandbox bloquea escrituras fuera de `$TMPDIR` y el acceso a red.
- Pruebas de regresión en herramientas de análisis estático: permite comprobar que actualizaciones del escáner no generan falsos negativos ni falsos positivos sobre este patrón concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio no está destinado a calidad de modelo ni a inferencia en producción, por lo que no procede evaluar MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa prácticamente nada (tamaño de repo de 0,0 GB); para cargarlo junto al modelo base SmolLM2-135M-Instruct se requiere el espacio del base, del orden de cientos de MB en fp16, aunque no se dispone de una medición oficial en la información proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para el modelo base de 135M; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, el modelo base de 135M cabe en cualquier GPU con al menos 1-2 GB de VRAM libre en fp16, aunque este dato no está confirmado en la documentación del artefacto.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre el modelo base; también podría convertirse a otros formatos, pero no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles; irrelevantes para el propósito del artefacto.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada artefactos comparables de control de escáneres publicados con este formato, ni adaptadores LoRA de validación equivalentes sobre SmolLM2-135M-Instruct. La comparación con modelos de generación de texto no es pertinente porque el artefacto no está diseñado para esa tarea.

## Limitaciones y advertencias

- No es apto para producción ni para inferencia de calidad: el propio autor lo declara como control de validación de escáneres.
- Contiene un paquete Python con una carga ejecutable (`whoami` con escritura en `/tmp` o `$TMPDIR`); importarlo en un entorno no aislado ejecuta ese comando, aunque el autor afirma que no hay acceso a red ni a credenciales.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribución.
- Idiomas soportados no disponibles; cualquier comportamiento lingüístico dependería del modelo base y no está documentado.
- Riesgo de falsos positivos en escáneres automáticos: el artefacto está diseñado precisamente para poner a prueba esas herramientas, por lo que su presencia en un pipeline de producción debe tratarse como cuarentena, no como modelo utilizable.
- Sin datos de benchmarks, sesgos o evaluación de alucinación: no procede evaluarlos porque el artefacto no genera texto de forma funcional.
- El número de parámetros reportado (4) corresponde a los tensores del adaptador en safetensors, no a un modelo completo; no debe interpretarse como tamaño del modelo base.
- Fecha de creación futura (2026-11-04) en los metadatos del repositorio, lo que conviene verificar antes de tratarlo como artefacto estable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FrankLin00/mmrh-ace-01b-diffusers-find-spec-peft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
