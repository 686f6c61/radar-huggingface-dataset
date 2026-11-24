# Jac-Zac/null-space-inkling-loop-exit-5ac735e1

## Resumen

`Jac-Zac/null-space-inkling-loop-exit-5ac735e1` es un artefacto de interpretabilidad publicado en Hugging Face, no un modelo generativo completo. Se trata de la entrega del equipo null-space al Looped Lens Challenge, un reto de investigacion orientado a construir "lentes" (readouts) que permitan estimar la salida de un modelo con capas repetidas (looped) sin ejecutar el bucle completo. El artefacto se construye sobre el modelo base `thinkingmachines/Inkling-2-Mini` y se distribuye con licencia MIT.

La variante seleccionada se denomina `J-half-offset` y almacena una base, una correccion aditiva de bajo rango y un sesgo afín por pasada. El procedimiento lee la capa fisica 14 en las visitas efectivas [14, 26, 38], estima la salida en la capa fisica 17 de la misma pasada y despues reproduce las seis capas de coda para hacer unembed en el token de lectura indicado. Es, por tanto, una herramienta de analisis de mecanismos internos, no un modelo para desplegar en produccion.

Su relevancia es acotada pero especifica: aporta un metodo reproducible para estudiar el comportamiento de modelos con arquitecturas looped, un area de creciente interes en interpretabilidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que el artefacto es de pequeno tamano (probablemente solo tensores de la lente, no pesos del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de salida de bucle (loop-exit lens) sobre `thinkingmachines/Inkling-2-Mini`; no es un modelo autonomo |
| Parametros totales | no disponible (el artefacto es de 0.0 GB; los pesos del modelo base no se incluyen) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base no declara idiomas en la informacion proporcionada) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card menciona base, correccion de bajo rango y sesgo afín por pasada, sin especificar formato de fichero) |

## Arquitectura y entrenamiento

El artefacto implementa una lente de salida proyectada para un modelo con capas repetidas. La construccion se basa en una base, una correccion aditiva de bajo rango y un sesgo afín por pasada; cada pasada tiene su propia derivada direccional media y su ancla afín. El sesgo afín aditivo se multiplica por 0.5, mientras que la correccion por derivada mantiene su escala completa. El mismo transporte se aplica en cada posicion del prefijo causal. La lectura se realiza en la capa fisica 14 en las visitas efectivas [14, 26, 38], se estima la salida en la capa fisica 17 de la misma pasada y se reproducen las seis capas de coda antes del unembed en el token de lectura suministrado. La seleccion de tokens de entrada usa filtrado.

El entrenamiento estimo diferencias finitas del mismo token sobre cuatro direcciones PCA de origen, a lo largo de 512 articulos de entrenamiento disjuntos de WikiText-103; cada direccion se midio en 128 articulos por pasada. Las comparaciones de ajuste usaron pares de activaciones reservados, preguntas de desarrollo escritas de forma independiente y un test intermedio separado de 48 preguntas. Los candidatos de desplazamiento de chat usaron ademas 192 prompts raiz en ingles de OpenAssistant. Para un ajuste agrupado, cualquier ponderacion de expertos es estatica en inferencia. El candidato complementario anade un ajuste observacional a lo largo de ocho direcciones adicionales. La model card indica explicitamente que se trata de una lente de salida de bucle proyectada, distinta del filtro de gradiente J++ original.

## Capacidades

- Lectura y estimacion de la salida de un modelo con capas repetidas (looped) sin ejecutar el bucle completo.
- Transporte de activaciones a lo largo del prefijo causal mediante una transformacion afín y una correccion por derivada direccional.
- Analisis de mecanismos internos en la capa fisica 14 y estimacion en la capa fisica 17 de la misma pasada.
- Reproduccion de las seis capas de coda y unembed en un token de lectura suministrado.
- Seleccion filtrada de tokens de entrada.
- Soporte de ajuste con ponderacion estatica de expertos en inferencia.
- No es un modelo de generacion de texto, codigo, vision ni audio; no soporta tool calling ni agentes.

## Casos de uso

- Investigacion en interpretabilidad de modelos looped: la lente permite estimar la salida de una pasada concreta sin ejecutar el bucle completo, lo que facilita el analisis de como evoluciona la representacion entre visitas efectivas.
- Auditoria de capas intermedias: al leer la capa fisica 14 y estimar la 17, se puede comparar la informacion disponible en distintos puntos del bucle y detectar donde se concentra la computacion relevante.
- Reproduccion de experimentos del Looped Lens Challenge: el artefacto incluye SHA-256 del artefacto y referencias a los conjuntos de datos usados, lo que permite replicar el pipeline de evaluacion.
- Estudio de estabilidad de la lente: la correccion por derivada direccional y el sesgo afín por pasada permiten analizar la sensibilidad de la estimacion a perturbaciones en la activacion.
- Comparacion de metodos de lectura: al ser una lente proyectada distinta del filtro J++ original, sirve para contrastar enfoques de lectura en modelos looped.
- Docencia y formacion en mecanismos internos: el artefacto es pequeno y de licencia permisiva, lo que lo hace util para demostraciones practicas de lectura de activaciones con nnsight.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de ajuste y evaluacion (WikiText-103, OpenAssistant, test intermedio de 48 preguntas) pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ocupa 0.0 GB y no incluye los pesos del modelo base, por lo que el requisito real depende de `thinkingmachines/Inkling-2-Mini`.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el artefacto esta pensado para su uso con `nnsight` (segun los tags), no como servidor de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jac-Zac/null-space-inkling-loop-exit-5ac735e1` | Lente de salida de bucle | no disponible (artefacto de 0.0 GB) | no disponible | MIT | Hugging Face |
| J++ Lens (safety-research/jpp_lens) | Lente de gradiente | no disponible | no disponible | no disponible | GitHub |
| Modelo base `thinkingmachines/Inkling-2-Mini` | Modelo generativo | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para generacion de texto, codigo, vision ni tareas de agente.
- La lente esta entrenada sobre `thinkingmachines/Inkling-2-Mini`; su validez fuera de ese modelo base no esta garantizada.
- El ajuste se realizo sobre WikiText-103 y OpenAssistant en ingles, por lo que el comportamiento en otros idiomas o dominios no esta documentado.
- La model card no reporta metricas de fidelidad de la lente; no hay evidencia publicada de su precision en la estimacion de la salida.
- La ponderacion de expertos es estatica en inferencia, lo que puede limitar la adaptacion a distribuciones distintas de las de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado informacion sobre mantenimiento o soporte.
- La licencia MIT es permisiva, pero el uso comercial del artefacto no implica derechos sobre el modelo base subyacente.
- Riesgo de alucinacion y sesgos: no aplica directamente al ser un artefacto de analisis, pero las conclusiones extraidas de la lente deben contrastarse con la ejecucion completa del modelo.

## Enlaces

- [Hugging Face: Jac-Zac/null-space-inkling-loop-exit-5ac735e1](https://huggingface.co/Jac-Zac/null-space-inkling-loop-exit-5ac735e1)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Dataset WikiText (Salesforce/wikitext)](https://huggingface.co/datasets/Salesforce/wikitext)
- [Dataset OpenAssistant (oasst1)](https://huggingface.co/datasets/OpenAssistant/oasst1)
- [Looped Lens Challenge (NDIF)](https://ndif.us/looped-lens-challenge/)
- [J++ Lens (safety-research/jpp_lens)](https://github.com/safety-research/jpp_lens)
