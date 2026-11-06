# FrankLin00/mmrh-afw-09-transformers-nemotron-tar

## Resumen

`FrankLin00/mmrh-afw-09-transformers-nemotron-tar` es un artefacto de investigación en seguridad publicado en Hugging Face bajo la librería NeMo, con las etiquetas `security-research` y `not-for-production`. No se trata de un modelo de lenguaje entrenado ni de pesos utilizables para inferencia: según su propia model card, es un "espécimen de escáner inerte" (*inert scanner specimen*) diseñado para preservar el vector de un hallazgo de seguridad, en concreto el nombre de un miembro tar dentro de un contenedor `.nemo` (categoría que el autor denomina AFW).

El propósito declarado es académico: reproducir de forma controlada una primitiva vulnerable asociada a la carga de ficheros `.nemo` (el formato empaquetado de NVIDIA NeMo) para que investigadores puedan analizar el comportamiento de escáneres y herramientas de carga. El autor indica explícitamente que cualquier sonda activa asociada ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

No hay información pública sobre arquitectura, tamaño, contexto ni datos de entrenamiento, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Cualquier uso en producción está explícitamente prohibido por el autor. Esta ficha documenta el artefacto tal cual, distinguiendo claramente entre lo declarado en la model card y lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto de investigación en formato NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | contenedor `.nemo` (tar con miembro AFW); pesos de modelo no disponibles |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto es un contenedor en formato `.nemo`, que internamente es un archivo tar con miembros estructurados; el hallazgo que preserva se refiere al nombre de un miembro tar concreto (vector AFW). La model card menciona que, cuando la primitiva vulnerable fuerza un contenedor o sufijo específico (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo.

La carga útil declarada es la cadena literal inerte `PWNED-INERT`. Cualquier sonda activa descrita ejecuta solo `whoami` mediante argv y escribe la salida en la variable de entorno `HFSCAN_TRANSFORMERS__01_TRANSFORMERS_NEMOTRON_AFW` bajo `/tmp` o `$TMPDIR`. No se documentan datos de entrenamiento, tokens, RLHF, DPO ni innovaciones de decodificación, porque no aplican.

## Capacidades

- No genera texto, código, matemáticas ni razonamiento: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Capacidad específica: preservar de forma inerte un vector de investigación de seguridad (nombre de miembro tar en contenedor `.nemo`) para análisis académico de escáneres y cargadores.
- Sonda activa limitada a la ejecución de `whoami` en forma argv y volcado a variable de entorno, según lo declarado por el autor.

## Casos de uso

- Investigación académica de seguridad en formatos de empaquetado: el artefacto permite reproducir el vector AFW en un entorno controlado para estudiar cómo los escáneres de modelos inspeccionan miembros tar dentro de ficheros `.nemo`.
- Desarrollo y validación de escáneres de artefactos ML: sirve como caso de prueba inerte para comprobar si una herramienta detecta nombres de miembro tar anómalos sin ejecutar carga útil real.
- Pruebas de regresión en pipelines de análisis estático: al tener una carga útil literal (`PWNED-INERT`) y una sonda acotada a `whoami`, permite verificar que el pipeline no ejecuta nada más allá de lo esperado.
- Formación y concienciación en seguridad de la cadena de suministro de modelos: útil en talleres para ilustrar riesgos de confianza ciega en artefactos descargados de hubs públicos.
- Estudio de restricciones de formato: el `MANIFEST.json` documenta cuándo la primitiva fuerza contenedores o sufijos (`.npy`, checkpoints, `.jinja`), lo que permite analizar diferencias de comportamiento entre formatos.
- Auditoría de herramientas de carga de NeMo: investigadores pueden comprobar cómo se comporta un cargador ante un `.nemo` con un miembro tar malicioso simulado, sin riesgo de ejecución de código arbitrario más allá de la sonda declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: el artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes). El artefacto se manipula con herramientas de inspección de tar y del ecosistema NeMo en un entorno aislado.
- Latencia y throughput: no disponibles; no hay inferencia.

## Comparativa con modelos similares

| Artefacto | Tipo | Formato | Licencia | Uso previsto |
|---|---|---|---|---|
| `FrankLin00/mmrh-afw-09-transformers-nemotron-tar` | Espécimen de investigación de seguridad | `.nemo` (tar) | no disponible | Solo investigación académica; no producción |
| Otros especímenes AFW de la misma colección (`MANIFEST.json`) | Espécimen de investigación de seguridad | variable (`.npy`, checkpoints, `.jinja`) | no disponible | Solo investigación académica |
| Modelos Nemotron de NVIDIA en Hugging Face | Modelos de lenguaje | safetensors / NeMo | según modelo | Inferencia y fine-tuning |

No se dispone de datos comparativos de rendimiento porque el artefacto no es un modelo. La comparación relevante es de tipo y propósito, no de métricas.

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto, no razona, no responde a prompts.
- Uso en producción explícitamente prohibido por el autor (`not-for-production`).
- Licencia no especificada: no hay base legal clara para reutilización, redistribución o uso comercial.
- Riesgo de interpretación errónea: al estar alojado en Hugging Face con la librería `nemo`, podría confundirse con un modelo NeMo funcional; no lo es.
- La carga útil es inerte (`PWNED-INERT`) y la sonda declarada se limita a `whoami`, pero cualquier manipulación del artefacto debe hacerse en entorno aislado y con revisión del `MANIFEST.json` de la colección.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no aplican a un artefacto no generativo.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de uso externo.
- Fecha de creación registrada como 2026-11-02, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de cualquier análisis.

## Enlaces

- Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-09-transformers-nemotron-t
- Colección con `MANIFEST.json` (hashes y ruta del hallazgo fuente): referenciada en la model card, sin URL directa disponible
- Documentación de NVIDIA NeMo (formato `.nemo`): no disponible en la información proporcionada
- Paper, blog, repositorio o demo asociados: no disponibles en la información proporcionada
