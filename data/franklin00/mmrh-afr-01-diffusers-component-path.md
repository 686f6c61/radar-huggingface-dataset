# FrankLin00/mmrh-afr-01-diffusers-component-path

## Resumen

`FrankLin00/mmrh-afr-01-diffusers-component-path` es un artefacto de investigación en seguridad publicado en HuggingFace, no un modelo de lenguaje entrenado. El repositorio contiene un único fichero `safetensors` con 4 parámetros totales y un tamaño de 0,0 GB, lo que indica que no alberga pesos funcionales. Su propósito declarado, según la model card, es preservar el "vehículo de metadatos" de un hallazgo de seguridad: una ruta de componente manipulada en `modular_model_index.json` dentro del ecosistema Diffusers.

El autor lo etiqueta explícitamente como `security-research` y `not-for-production`. Forma parte de una colección de especímenes inertes (denominados AFR/AFW) cuyo objetivo es documentar primitivas de ejecución o lectura en pipelines de carga de modelos. La model card describe que cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

Por tanto, esta ficha documenta un objeto de investigación de vulnerabilidades, no un modelo utilizable para inferencia. No hay arquitectura de red neuronal, tokenizador, contexto, capacidades lingüísticas ni benchmarks asociados. Cualquier evaluación como modelo de IA carece de sentido técnico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto de investigación en seguridad) |
| Parámetros totales | 4 (según metadatos de safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un "espécimen inerte" (*inert scanner specimen*) creado para investigación académica en seguridad. Su función es conservar el carrier de metadatos del hallazgo: una ruta de componente (*component path*) dentro de `modular_model_index.json`, un fichero de índice empleado por la librería Diffusers para localizar componentes modulares de pipelines.

La model card indica que las sondas activas asociadas ejecutan solo `whoami` mediante argv (sin `shell=True`) y escriben la salida en la variable de entorno `HFSCAN_DIFFUSERS__03_ARTIFACT_COMPONENT_PATH_LOCAL_READ_REPUBLISH_AFR` bajo `/tmp` o `$TMPDIR`. No se realiza acceso a credenciales ni operación de red. Los especímenes AFW de la misma colección usan el payload literal inerte `PWNED-INERT`; cuando la primitiva vulnerable fuerza un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo. Los hashes y la ruta del hallazgo original se documentan en el `MANIFEST.json` a nivel de colección.

## Capacidades

- No genera texto, código, matemáticas ni imágenes: no es un modelo de IA.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües.
- No dispone de modo *thinking*, visión ni audio.
- Su única función es servir como espécimen de referencia para reproducir y auditar un hallazgo de seguridad relacionado con la carga de componentes en Diffusers.

## Casos de uso

- Reproducción de vulnerabilidades en pipelines de Diffusers: el artefacto permite a investigadores recrear la ruta de componente manipulada en `modular_model_index.json` y verificar si una versión concreta de la librería la resuelve de forma insegura.
- Desarrollo de reglas de detección para escáneres de modelos: sirve como muestra positiva para validar que un scanner detecta rutas de componente anómalas en índices modulares.
- Pruebas de regresión en herramientas de auditoría de HuggingFace: permite comprobar que los escáneres marcan correctamente artefactos etiquetados como `not-for-production`.
- Formación y divulgación en seguridad de la cadena de suministro de modelos: ejemplo controlado para explicar cómo metadatos aparentemente inocuos pueden actuar como vector.
- Validación de sandboxing: al ejecutar solo `whoami` y escribir en `/tmp`, permite verificar que un entorno aislado contiene correctamente la sonda sin acceso a red ni credenciales.
- Verificación de integridad de colecciones: el `MANIFEST.json` asociado permite comprobar hashes y la ruta del hallazgo fuente en procesos de revisión por pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no aplican métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay inferencia posible.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Despliegue: no debe desplegarse con vLLM, llama.cpp, Ollama ni TGI; son herramientas para pesos de modelos reales.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,0 GB, por lo que su descarga y manipulación en un entorno aislado tiene coste despreciable.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| FrankLin00/mmrh-afr-01-diffusers-component-path | Espécimen de seguridad (Diffusers) | 4 | no aplica | no disponible | Investigación, no producción |
| FrankLin00 (otros especímenes AFW/AFR de la colección) | Espécimen de seguridad | no disponible | no aplica | no disponible | Investigación, no producción |
| Modelos de lenguaje reales (p. ej. familias Llama, Qwen, Mistral) | Transformer / MoE | miles de millones | miles de tokens | varía | Inferencia general |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: cualquier intento de cargarlo como modelo de lenguaje o de difusión fallará o producirá resultados sin sentido.
- Etiquetado explícitamente como `not-for-production`; su uso en entornos productivos está desaconsejado por el propio autor.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribución.
- Riesgo de confusión: el nombre y el formato `safetensors` pueden llevar a herramientas automáticas a tratarlo como un checkpoint legítimo.
- Contenido de seguridad ofensiva: aunque la sonda descrita es inerte (`whoami`, sin red ni credenciales), el artefacto documenta una primitiva de carga de componentes que podría ser explotada en versiones vulnerables de Diffusers.
- Sin sesgos lingüísticos ni riesgo de alucinación en el sentido habitual, al no existir generación de texto.
- No debe ejecutarse fuera de un sandbox aislado, aunque la model card afirme que la sonda activa es inofensiva.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afr-01-diffusers-component-path
- Colección y `MANIFEST.json`: referenciados en la model card, sin URL directa disponible en la información proporcionada.
- Documentación de Diffusers sobre `modular_model_index.json`: no disponible en la información proporcionada.
