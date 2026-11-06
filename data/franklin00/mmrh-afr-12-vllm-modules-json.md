# FrankLin00/mmrh-afr-12-vllm-modules-json

## Resumen

`FrankLin00/mmrh-afr-12-vllm-modules-json` es un artefacto de investigación en seguridad publicado en Hugging Face, no un modelo de lenguaje funcional. Su propio autor lo etiqueta como `security-research` y `not-for-production`, y la model card lo describe explícitamente como un "espécimen de escáner inerte" (inert scanner specimen) destinado a investigación académica. El repositorio conserva el "portador de metadatos" del hallazgo, concretamente una ruta en el fichero `modules.json` de vLLM, que es el vector que se pretende documentar.

El artefacto se enmarca en una colección más amplia (referenciada mediante un `MANIFEST.json` a nivel de colección) que recopila pruebas de concepto de vulnerabilidades en el ecosistema de carga de modelos. El payload declarado es literalmente `PWNED-INERT` y, según la model card, cualquier sonda activa se limita a ejecutar `whoami` en forma de argv (nunca mediante `shell=True`) escribiendo el resultado en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

La relevancia de esta ficha es, por tanto, documental y defensiva: sirve para identificar el artefacto, entender que no debe desplegarse y reconocer los patrones de publicación que imitan repositorios de modelos legítimos (tags `safetensors`, `bert`) pero que en realidad transportan rutas o ficheros manipulados. No existe información sobre arquitectura de red neuronal, entrenamiento ni capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado `bert` en los tags, sin confirmar; el artefacto no es un modelo entrenado) |
| Parametros totales | 4 (según metadatos de safetensors; no corresponde a un modelo real) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags y metadatos del repo) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). El artefacto es un "espécimen" de seguridad: un repositorio construido para reproducir un hallazgo en el cargador de modelos de vLLM a través de la ruta declarada en `modules.json`. El recuento de 4 parámetros en los metadatos de safetensors es consistente con un tensor señuelo o un fichero mínimo, no con un transformer entrenado.

La model card indica que las variantes "AFW" de la colección emplean el payload inerte literal `PWNED-INERT`, y que cuando la primitiva vulnerable impone un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo. No se documenta ninguna innovación de arquitectura ni técnica de entrenamiento.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Su única función declarada es servir como muestra inerte para investigación de seguridad: ejecutar `whoami` vía argv y volcar la salida a la variable de entorno `HFSCAN_VLLM__02_MODULES_JSON_DENSE_PATH_CROSS_API_AFR` en `/tmp` o `$TMPDIR`.

## Casos de uso

- Reproducción controlada de hallazgos en el cargador de modelos de vLLM: el artefacto permite a un equipo de seguridad replicar en un entorno aislado cómo una ruta manipulada en `modules.json` puede alcanzar un punto de ejecución durante la carga del modelo.
- Validación de escáneres de supply chain de modelos: sirve como caso de prueba negativo para comprobar que una herramienta de análisis detecta repositorios con tags de modelo legítimo pero contenido no modelístico.
- Formación en seguridad de la cadena de suministro de IA: útil en laboratorios docentes para mostrar cómo se estructura un repositorio malicioso simulado (tags, safetensors, README) sin riesgo real, dado el payload inerte.
- Desarrollo de reglas de detección en registries: los equipos que operan espejos de Hugging Face pueden usar el espécimen para calibrar políticas que bloqueen rutas sospechosas en `modules.json` o checkpoints con `.jinja`.
- Auditoría de pipelines de despliegue: permite verificar que un pipeline que descarga y sirve modelos con vLLM rechaza artefactos marcados `not-for-production` antes de cargarlos.
- Investigación académica publicable: el `MANIFEST.json` de la colección documenta hashes y la ruta del hallazgo original, lo que facilita la trazabilidad y la citación en artículos sobre seguridad de infraestructuras de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable y no tiene sentido medir MMLU, HumanEval, GSM8K ni métricas de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo ejecutable con pesos útiles.
- GPU recomendadas: ninguna; no requiere acelerador.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no debe desplegarse en vLLM, llama.cpp, Ollama ni TGI; el propio autor lo marca como `not-for-production`.
- Latencia y throughput: no disponible y sin significado para este artefacto.
- Entorno recomendado si se inspecciona: contenedor aislado sin credenciales, sin acceso a red y con `/tmp` efímero, dado que la sonda declarada escribe en el sistema de ficheros temporal.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| FrankLin00/mmrh-afr-12-vllm-modules-json | Espécimen de seguridad (señuelo) | 4 (metadatos) | no disponible | no disponible | Investigación, no producción |
| Modelo BERT base (referencia de la etiqueta) | Transformer encoder | ~110 M | 512 tokens | Apache 2.0 (habitual) | NLP general |
| Modelo de embeddings pequeño (referencia) | Transformer encoder | 20-100 M | 512-8k tokens | variable | Búsqueda y clasificación |

La comparación con modelos reales solo procede a nivel de etiqueta: el repositorio declara `bert` en sus tags, pero no contiene un modelo BERT entrenado ni pesos utilizables. No se dispone de alternativas directamente comparables dentro de la misma colección de especímenes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: cualquier intento de cargarlo como modelo de lenguaje o de embeddings fallará o producirá resultados sin sentido.
- Riesgo de seguridad por diseño: el artefacto existe para documentar una ruta de ejecución en `modules.json` de vLLM; cargarlo en un entorno real puede activar la sonda descrita.
- Etiquetado engañoso: los tags `safetensors` y `bert` pueden hacer que herramientas automáticas lo clasifiquen como modelo legítimo; conviene filtrar por `security-research` y `not-for-production`.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial ni redistribución; tratar como material de investigación restringido.
- Sin idiomas declarados ni contexto: no apto para ninguna tarea de NLP.
- Sesgos y alucinación: no aplica en el sentido habitual, pero el README contiene afirmaciones sobre el comportamiento de la sonda que deben verificarse en un entorno aislado antes de confiar en ellas.
- Fecha de creación anómala (2026-11-02): conviene contrastar los metadatos con el `MANIFEST.json` de la colección antes de citar el artefacto.
- Recomendación operativa: bloquear en registries internos y en pipelines de despliegue; si se inspecciona, hacerlo en sandbox sin credenciales ni red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afr-12-vllm-modules-json
- Colección y `MANIFEST.json` referenciados en la model card: no disponible (no se proporciona URL directa)
- Documentación de vLLM sobre carga de modelos y `modules.json`: no disponible en la información proporcionada
- Paper o blog del hallazgo original: no disponible en la información proporcionada
