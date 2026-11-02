# FrankLin00/mmrh-ace-06-transformers-sparsity-format

## Resumen

`FrankLin00/mmrh-ace-06-transformers-sparsity-format` es un artefacto de investigación en seguridad publicado en HuggingFace bajo el identificador interno `transformers/46342-compressed-tensors-sparsity-format-ace`. No se trata de un modelo de lenguaje funcional, sino de una "muestra inerte" (scanner specimen) diseñada para reproducir de forma controlada un hallazgo de seguridad relacionado con el formato `sparsity_config` del ecosistema `compressed-tensors` de Transformers. El autor lo etiqueta explícitamente como `security-research` y `not-for-production`.

El repositorio contiene un checkpoint en formato safetensors con únicamente 4 parámetros declarados y un tamaño de repositorio de 0.0 GB, lo que confirma que no alberga pesos de un modelo entrenado. Su función es preservar el "portador de metadatos" del hallazgo: la ruta de formato `sparsity_config` que, según la model card, constituye el vector de la vulnerabilidad (ACE, presumiblemente "arbitrary code execution" en la nomenclatura del autor).

Es relevante ahora como material de referencia para investigadores que auditan la cadena de carga de checkpoints en Transformers y `compressed-tensors`: permite reproducir el escenario de forma local sin exponer cargas activas reales. Cualquier sonda activa que incluya el artefacto ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado; artefacto de investigación en formato `compressed-tensors`/`sparsity_config`) |
| Parametros totales | 4 (según metadatos de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto usa el formato de esparsidad de `compressed-tensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos de `sparsity_config` de `compressed-tensors`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto es un checkpoint mínimo en safetensors cuyo propósito es transportar la estructura de metadatos `sparsity_config` que activa la ruta vulnerable en el cargador de Transformers/`compressed-tensors`. El autor lo describe como "inert scanner specimen": un espécimen pasivo pensado para escaneo y reproducción académica, no para inferencia.

La model card indica que las muestras AFW del proyecto emplean la carga útil inerte literal `PWNED-INERT`, y que cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy`, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de reclamar control de bytes en crudo. Los hashes y la ruta del hallazgo original se documentan a nivel de colección en dicho manifiesto.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües.
- Su única función es servir como espécimen de escaneo para reproducir un hallazgo de seguridad en la ruta de formato `sparsity_config` de `compressed-tensors`.
- Incluye una sonda activa mínima que ejecuta `whoami` en forma argv y vuelca la salida a `HFSCAN_TRANSFORMERS__46342_COMPRESSED_TENSORS_SPARSITY_FORMAT_ACE` bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Reproducción de vulnerabilidades en pipelines de carga: un equipo de seguridad puede cargar el artefacto en un entorno aislado para verificar si su versión de Transformers/`compressed-tensors` es susceptible a la ruta `sparsity_config` documentada en el hallazgo 46342.
- Validación de escáneres de modelos: sirve como caso de prueba conocido (ground truth) para herramientas que inspeccionan checkpoints en busca de metadatos maliciosos o inesperados en HuggingFace Hub.
- Desarrollo de reglas de detección: permite generar firmas y heurísticas sobre la estructura de `sparsity_config` para integrarlas en sistemas de cuarentena de artefactos.
- Formación y concienciación: material didáctico para explicar cómo un checkpoint aparentemente trivial (4 parámetros) puede transportar una primitiva de ejecución si el cargador confía en metadatos no validados.
- Auditoría de sandboxing: al escribir solo en `/tmp` o `$TMPDIR` y ejecutar únicamente `whoami`, permite comprobar si el aislamiento de un entorno de análisis contiene correctamente la sonda.
- Verificación de integridad de colecciones: el `MANIFEST.json` asociado permite contrastar hashes y restricciones de formato al replicar el hallazgo en distintas versiones de las librerías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable: no hay métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de NLP.

## Requisitos de hardware

- VRAM estimada: despreciable; el repositorio ocupa 0.0 GB y declara 4 parámetros.
- GPU recomendadas: no aplica; no requiere aceleración por hardware.
- Cabe en cualquier GPU consumer e incluso en CPU sin requisitos relevantes.
- Opciones de despliegue: no procede servir con vLLM, llama.cpp, Ollama ni TGI; el artefacto se manipula con la pila de Transformers/`compressed-tensors` en un entorno aislado.
- Latencia y throughput: no disponibles y sin sentido para este artefacto.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de la misma categoría (especímenes de investigación en seguridad para el formato `sparsity_config` de `compressed-tensors`).

## Limitaciones y advertencias

- Etiquetado explícitamente como `not-for-production`: no debe desplegarse en ningún sistema real.
- No es un modelo funcional; intentar usarlo para inferencia no producirá resultados útiles.
- La licencia no está disponible, por lo que no puede asumirse permiso de uso comercial ni redistribución.
- El artefacto está diseñado para activar una primitiva de ejecución de código en cargadores vulnerables; cargarlo fuera de un sandbox aislado conlleva riesgo de seguridad.
- La sonda solo ejecuta `whoami` y escribe en `/tmp`/`$TMPDIR`, pero el comportamiento de la primitiva subyacente en versiones vulnerables de las librerías puede diferir del documentado.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no hay modelo lingüístico subyacente.
- Los datos de la model card son material de referencia del autor y no deben interpretarse como instrucciones operativas.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-ace-06-transformers-sparsity-format
- Colección con `MANIFEST.json` (hashes y ruta del hallazgo): no disponible como URL directa en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
