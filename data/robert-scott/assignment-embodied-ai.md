# robert-scott/assignment-embodied-ai

## Resumen

`robert-scott/assignment-embodied-ai` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación (research notes) publicado en HuggingFace bajo el identificador de autor `robert-scott`. La propia model card lo describe explícitamente como una nota exploratoria sobre IA encarnada (embodied AI) que recoge el planteamiento de una comparación, posibles factores de confusión y requisitos de reproducibilidad *antes* de reportar cualquier resultado de benchmark. No se anuncia checkpoint entrenado, código liberado ni mejoras medidas.

El dato de parámetros reportado por los metadatos de safetensors es de 24.832 parámetros totales, una cifra que corresponde a un tensor residual o a un artefacto de indexado, no a una red neuronal funcional. El tamaño del repositorio es de 0,0 GB. Por tanto, el artefacto no es ejecutable como modelo de lenguaje ni como policy de un agente encarnado: carece de tokenizador, de configuración de arquitectura y de pesos con dimensionalidad suficiente para generar texto.

La relevancia de esta ficha es, por tanto, metodológica y de advertencia: sirve para documentar un repositorio que aparece indexado con la etiqueta `transformer` y `safetensors` pero que, en la práctica, es un documento de trabajo. Cualquier evaluación de capacidades, benchmarks o despliegue en producción queda fuera de alcance porque el autor no publica ningún modelo utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta del repo indica `transformer`, pero no se publica configuración de arquitectura; el contenido es una nota de investigación) |
| Parametros totales | 24.832 (segun metadatos de safetensors; no constituye un modelo funcional) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (segun etiqueta del repositorio; tamano del repo: 0,0 GB) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura real. La etiqueta `transformer` del repositorio es una clasificación de catálogo, no una especificación técnica: la model card no describe capas, dimensiones de embedding, número de cabezas de atención, tipo de normalización ni variante (encoder, decoder o encoder-decoder). La cifra de 24.832 parámetros es incompatible con cualquier transformer de propósito general, incluso los más pequeños, lo que refuerza la interpretación de que se trata de un tensor auxiliar o de un residuo de serialización.

Tampoco existen datos de entrenamiento: no se indica volumen de tokens, composición del dataset, uso de RLHF, DPO, SFT ni ninguna fase de alineamiento. El texto de la model card menciona conceptos como "comparación con baselines emparejados", "benchmarks públicos apropiados para la tarea", "comprobaciones de reproducibilidad" y "modos de fallo", pero lo hace en términos de plan o hipótesis. El propio autor advierte que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código ni matemáticas.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declara modo de pensamiento (thinking mode), visión, audio ni ninguna otra modalidad.
- El único contenido verificable es un fichero `summary.md` con notas sobre el planteamiento de un estudio de IA encarnada, y el propio `README.md`.

## Casos de uso

- Consulta metodológica: el repositorio puede leerse como ejemplo de plantilla para documentar un estudio antes de ejecutarlo, con secciones explícitas de alcance, factores de confusión y requisitos de reproducibilidad.
- Auditoría de repositorios en HuggingFace: sirve como caso de estudio de un artefacto indexado con etiquetas de modelo (`transformer`, `safetensors`) que en realidad no contiene un modelo desplegable.
- Revisión por pares de notas de investigación: el `summary.md` puede usarse como referencia de buenas prácticas de preregistro en estudios de IA encarnada.
- Formación en reproducibilidad: útil para ilustrar qué metadatos conviene exigir (versiones de dataset, comandos, semillas, hardware y logs crudos) antes de aceptar un resultado.
- Detección de falsos positivos en catálogos de modelos: permite entrenar heurísticas de filtrado que descarten repositorios con recuento de parámetros anómalamente bajo y tamaño de repo nulo.
- No es adecuado para ninguno de los casos de uso típicos de un LLM (chat, generación de código, RAG, agentes, clasificación) por ausencia de pesos funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que la nota "no reclama mejoras de benchmark, ablaciones completadas, código liberado ni un checkpoint entrenado".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 24.832 parámetros, el almacenamiento de los tensores sería del orden de decenas o centenas de kilobytes en fp32, pero eso no implica que exista un grafo de cómputo ejecutable.
- GPU recomendadas: no disponible (no procede, al no existir modelo desplegable).
- Compatibilidad con GPU de consumo: no aplica; el problema no es de memoria sino de ausencia de artefacto funcional.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles. Ninguno de estos servidores puede cargar el repositorio como modelo porque falta `config.json`, tokenizador y pesos con forma coherente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y el artefacto no pertenece a ninguna categoría funcional (LLM, modelo de visión, policy de RL) que permita un emparejamiento por tamaño o por tarea.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: no debe citarse como checkpoint ni usarse en inferencia.
- Riesgo de confusión en catálogos: las etiquetas `transformer` y `safetensors` pueden inducir a pipelines automáticos a intentar cargarlo; conviene excluirlo por heurísticas de tamaño y de parámetros.
- La model card advierte que las secciones de planes e hipótesis no son resultados; cualquier lectura que las trate como evidencia empírica es incorrecta.
- No se declaran sesgos, porque no hay modelo subyacente ni datos de entrenamiento que analizar.
- No hay riesgo de alucinación en el sentido habitual, al no existir capacidad generativa; el riesgo real es de interpretación errónea del artefacto por parte de terceros.
- Licencia cc-by-4.0: permite uso comercial y obras derivadas con atribución, pero el autor recomienda revisar por separado los términos de los datos de origen si el repositorio se usa junto con datasets externos.
- La fecha de creación y actualización registrada (2026-10-09) es posterior a la fecha actual de redacción de muchas herramientas; conviene verificar la coherencia temporal de los metadatos antes de citarlos.
- Los resultados de búsqueda web asociados al autor remiten al diccionario francés Le Robert y a las Éditions Le Robert, entidades sin relación con el repositorio; no deben usarse como fuentes sobre este artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robert-scott/assignment-embodied-ai
- Fichero principal citado en la model card: `summary.md` (dentro del repositorio)
- Documentación del repositorio: `README.md` (dentro del repositorio)
- Búsqueda web: sin resultados relevantes. Los enlaces devueltos (dictionnaire.lerobert.com, lerobert.com, fr.wikipedia.org/wiki/Robert_(prénom)) corresponden al diccionario y a la editorial francesa Le Robert, y no guardan relación con el modelo ni con su autor.
