# FrankLin00/mmrh-afr-08-speech-artifact-path

## Resumen

`FrankLin00/mmrh-afr-08-speech-artifact-path` es un artefacto de investigación en seguridad publicado en Hugging Face bajo la librería NeMo. No se trata de un modelo de aprendizaje automático entrenado y utilizable, sino de una muestra inerte (specimen) diseñada para preservar y documentar una vulnerabilidad concreta: el uso de rutas de artefacto en la metadato `model_config` de NeMo como vector de exfiltración de ficheros locales (AFR, artifact file read/exfil). El autor lo etiqueta explícitamente como `security-research` y `not-for-production`.

El repositorio no incluye pesos, tokenizador ni pipeline funcional. Su propósito es servir como prueba reproducible para investigadores que analizan cadenas de ataque basadas en la carga de configuraciones de modelos, en este caso dentro del ecosistema NeMo (NVIDIA). La muestra documenta cómo una ruta manipulada en la configuración puede provocar la lectura de ficheros locales y su escritura en un directorio temporal, sin acceso a credenciales ni operaciones de red.

Por su naturaleza, no es relevante como modelo de IA para desarrolladores que buscan capacidades de generación o razonamiento, sino como material de referencia para auditorías de seguridad de pipelines de modelos y de formatos de configuración. Cualquier evaluación de sus capacidades de modelado carece de sentido: no hay arquitectura, parámetros ni datos de entrenamiento que analizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado; artefacto de investigación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos; el repositorio preserva metadatos de configuración) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es una muestra inerte que preserva el portador del hallazgo de seguridad: una ruta de artefacto dentro de `model_config` de NeMo. Según la model card, la sonda activa (si se ejecutase) invocaría únicamente `whoami` en forma de argv, nunca mediante `shell=True`, y escribiría su salida en la variable de entorno `HFSCAN_SPEECH__06_CROSS_API_ARTIFACT_LOCAL_FILE_EXFIL_AFR` bajo `/tmp` o `$TMPDIR`. No realiza acceso a credenciales ni operaciones de red.

La model card indica además que las muestras AFW utilizan el payload inerte literal `PWNED-INERT` y que, cuando la primitiva vulnerable fuerza un contenedor o sufijo (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo. No se dispone de información sobre el número de tokens, composición del dataset ni técnicas de alineación, porque no aplica.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión, audio ni multimodalidad.
- Su única función documentada es preservar un vector de ataque basado en rutas de artefacto en la configuración de NeMo con fines de investigación académica en seguridad.

## Casos de uso

- Auditoría de seguridad de configuraciones NeMo: el artefacto sirve como caso de prueba para validar si un pipeline de carga de modelos resuelve rutas de artefacto de forma segura y confinada.
- Desarrollo de reglas de detección: permite construir firmas y comprobaciones estáticas (SAST) que detecten rutas sospechosas en `model_config` antes de desplegar un modelo.
- Formación en seguridad de la cadena de suministro de modelos: útil como ejemplo didáctico de cómo un metadato aparentemente inocuo puede convertirse en un vector de lectura de ficheros locales.
- Validación de sandboxing: sirve para verificar que entornos de ejecución aíslan correctamente la escritura en `/tmp` o `$TMPDIR` y limitan la ejecución de comandos como `whoami`.
- Pruebas de regresión en escáneres de artefactos: los equipos que mantienen escáneres de repositorios Hugging Face pueden usar la muestra para comprobar que sus herramientas identifican correctamente el tag `not-for-production`.
- Investigación reproducible: el `MANIFEST.json` de la colección permite contrastar hashes y la ruta del hallazgo original, facilitando la replicación de resultados en publicaciones académicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo entrenado, no existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de modelado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia posible.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Requisito real: un entorno aislado (contenedor o máquina virtual) con NeMo instalado si se desea reproducir el análisis de la ruta de artefacto de forma controlada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| FrankLin00/mmrh-afr-08-speech-artifact-path | Artefacto de investigación en seguridad | no disponible | no disponible | no disponible | Preservar un hallazgo de exfiltración vía ruta de artefacto NeMo |
| Modelos NeMo (p. ej. Parakeet, Canary) | Modelos ASR/TTS entrenados | variable | variable | variable | Reconocimiento y síntesis de voz |
| Modelos de la familia Llama | LLM transformer | 7B-405B | hasta 128K | licencia comunitaria | Generación de texto y razonamiento |

La comparación con modelos de IA no es significativa: este repositorio no compite en la categoría de modelos de lenguaje o voz, sino que pertenece a la categoría de muestras de investigación en seguridad. No se dispone de alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- No debe usarse en producción bajo ninguna circunstancia; el propio autor lo etiqueta como `not-for-production`.
- No es un modelo funcional: no genera texto, no responde a prompts y no puede integrarse en aplicaciones de IA.
- La licencia no está disponible, lo que impide determinar condiciones de uso comercial o redistribución.
- El contenido reproduce un vector de ataque; manipularlo fuera de un entorno aislado puede tener implicaciones de seguridad.
- La model card advierte de que la sonda activa, si se ejecutase, escribe en `/tmp` o `$TMPDIR`; debe tratarse con las mismas precauciones que cualquier prueba de penetración.
- No se han documentado sesgos ni riesgo de alucinación porque no hay modelo subyacente; el riesgo relevante es de seguridad, no de calidad de salida.
- La información pública es muy escasa (0 descargas, 0 likes, sin pipeline declarado) y no permite verificar la reproducibilidad del hallazgo sin consultar el `MANIFEST.json` de la colección.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FrankLin00/mmrh-afr-08-speech-artifact-path
- Documentación de NeMo (NVIDIA): no disponible en la información proporcionada
- Paper o blog del hallazgo: no disponible en la información proporcionada
- `MANIFEST.json` de la colección: referenciado en la model card, sin URL directa disponible
- Repositorio de código o demo: no disponible en la información proporcionada
