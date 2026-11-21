# Kai9987kai/supermix-historical-milestones

## Resumen

Supermix historical milestones es una colección de 16 checkpoints de entrenamiento finales publicados por el usuario Kai9987kai bajo el paraguas del proyecto Supermix, una iniciativa de investigación sobre modelos de lenguaje de autoría independiente. Los checkpoints abarcan las versiones v58 a v79 e incluyen, junto a cada uno de ellos, un informe de estudio y los resultados de la ejecución correspondiente. No se trata de un modelo único, sino de un archivo histórico de iteraciones experimentales: cada versión responde a una hipótesis concreta (generalización, causalidad de mecanismos, corpus diverso, capacidad dispersa, alineación de turnos, aritmética con scratchpad, expertos dispersos, entre otras).

El repositorio tiene un tamaño de 1,0 GB y contiene pesos en formato PyTorch (`.pt`), no en safetensors ni GGUF. La model card indica que el baseline promovido del proyecto es la versión v96, publicada por separado, y que la secuencia v72 es un control experimental. La información disponible no detalla la arquitectura interna, el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento de cada checkpoint; la model card se limita a listar los artefactos y a documentar el procedimiento de carga.

La relevancia de esta publicación es fundamentalmente metodológica: los informes adjuntos incluyen hallazgos negativos y emplean protocolos de entrenamiento y evaluación distintos entre versiones, lo que la convierte en material útil para estudiar cómo evoluciona un proyecto de modelado de lenguaje a lo largo de más de veinte iteraciones. No obstante, al no existir benchmarks publicados ni especificaciones técnicas detalladas, no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE u otra; la versión v70 se etiqueta como "moe" y v79 como "omni", sin detalle técnico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), un fichero por checkpoint; manifiesto con SHA-256 y tamaños en `manifest.json` |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna de los checkpoints. La model card nombra algunas versiones con etiquetas que sugieren líneas de investigación: `v70_moe` apunta a una variante con expertos dispersos (mixture of experts), `v61_scaled` a un escalado de capacidad, `v62_multidomain` a un corpus multidominio y `v79_omni` a un modelo "ómnido" sin más precisión. Los informes asociados (`V70_SPARSE_EXPERTS.md`, `V61_SPARSE_CAPACITY.md`, `V62_MULTIDOMAIN.md`, `V79_OMNI_FRONTIER.md`) son la fuente primaria para conocer los detalles, pero su contenido no se ha incluido en la información proporcionada.

Respecto al entrenamiento, la model card indica explícitamente que los informes usan protocolos de entrenamiento y evaluación distintos entre versiones y que incluyen hallazgos negativos, lo que sugiere una metodología de ablación iterativa más que un pipeline unificado. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. La secuencia v72 se describe como un control de longitud de secuencia, y la v74 se publicó en un repositorio aparte.

## Capacidades

- Generación de texto autoregresiva: la model card documenta un servidor de chat (`source/supermix_chat_server.py`) que carga el checkpoint y el tokenizador y permite introducir prompts desde un navegador, lo que confirma capacidad de decodificación de texto.
- Decodificación en CPU: la verificación de release cargó cada modelo y tokenizador y ejecutó una decodificación acotada en CPU, por lo que la inferencia es posible sin GPU.
- Razonamiento aritmético con scratchpad: las versiones v66, v67, v68 y v71 exploran el uso de scratchpad y su longitud para tareas aritméticas.
- Razonamiento multi-paso: la versión v73 se etiqueta como "accuracy in the loop" y la v69 como "unified", lo que sugiere experimentos con razonamiento encadenado, aunque sin detalle publicado en la información disponible.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponible, pese a la etiqueta "omni" de la versión v79.

## Casos de uso

- Reproducción de experimentos de investigación: cada checkpoint se puede cargar con el runtime de Supermix en la revisión de release indicada y ejecutar con una decodificación acotada en CPU, lo que permite reproducir los resultados documentados en los informes adjuntos.
- Estudio de la evolución de un proyecto de modelado: la colección de 16 checkpoints con sus informes permite analizar cómo cambian las decisiones de diseño (corpus, empaquetado de turnos, scratchpad, expertos dispersos) a lo largo de más de veinte iteraciones.
- Análisis de hallazgos negativos: los informes incluyen resultados negativos y protocolos de evaluación distintos, útiles para investigadores que quieran contrastar qué enfoques no funcionaron y por qué, evitando repetir caminos ya descartados.
- Docencia y formación: el servidor de chat local con Flask (`http://127.0.0.1:8780/`) permite demostrar el funcionamiento de un modelo de lenguaje de forma controlada y sin dependencia de servicios externos.
- Auditoría de artefactos de release: el `manifest.json` con SHA-256 y tamaños de fichero facilita verificar la integridad de los pesos descargados en un pipeline de validación.
- Experimentación con variantes de arquitectura: las versiones etiquetadas como `moe`, `scaled` o `omni` permiten comparar el comportamiento de distintas configuraciones bajo el mismo runtime, siempre que se consulten los informes correspondientes para conocer las condiciones de cada ejecución.
- Base para fine-tuning exploratorio: al estar bajo licencia MIT y en formato PyTorch nativo, los pesos pueden cargarse con `torch` y adaptarse, aunque la falta de especificaciones técnicas hace recomendable inspeccionar primero la arquitectura en el código fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que cada checkpoint incluye "run results" y "receipts" en subdirectorios del repositorio, pero no se han proporcionado los valores numéricos ni las métricas empleadas, y los protocolos de evaluación difieren entre versiones, por lo que no procede presentar una tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 1,0 GB, pero no se especifica el tamaño individual de cada checkpoint ni el número de parámetros, por lo que no se puede estimar la VRAM necesaria.
- GPU recomendadas: no disponible. La verificación de release se realizó con decodificación en CPU, lo que indica que la inferencia no requiere GPU.
- Compatibilidad con GPU de consumo: no determinable con la información disponible; dado el tamaño del repositorio (1,0 GB para 16 checkpoints), es plausible que cada checkpoint individual sea pequeño, pero no se confirma.
- Opciones de despliegue: el runtime propio de Supermix (`source/supermix_chat_server.py`) con dependencias `torch`, `numpy`, `flask` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, y la ausencia de especificaciones técnicas (parámetros, contexto, benchmarks) impide establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Ausencia de especificaciones técnicas: no se publican número de parámetros, longitud de contexto, arquitectura detallada ni composición del dataset, lo que impide evaluar el modelo con criterios estándar.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones con modelos de referencia.
- Protocolos heterogéneos: la propia model card advierte que los informes usan protocolos de entrenamiento y evaluación distintos entre versiones, por lo que los resultados no son directamente comparables entre checkpoints.
- Naturaleza histórica: son checkpoints archivados, no un modelo promovido; el baseline del proyecto es la versión v96, publicada por separado.
- Riesgo de alucinación: no evaluado en la información disponible; al no haber benchmarks ni documentación de alineación, no se puede descartar un comportamiento generativo poco fiable.
- Idiomas: no se especifica qué idiomas soporta el modelo ni la calidad en cada uno.
- Licencia: MIT, permisiva para uso comercial, pero al no existir garantías ni documentación de sesgos, el uso en producción requiere una evaluación propia.
- Reproducibilidad: la ejecución depende de una revisión concreta del repositorio de código (`ff35c75c459e2c39b7e763e800ed9408659f2b4a`); cambios posteriores en el runtime pueden romper la compatibilidad con estos pesos.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kai9987kai/supermix-historical-milestones
- Baseline promovido (v96): https://huggingface.co/Kai9987kai/supermix-v96
- Release separada v74: https://huggingface.co/Kai9987kai/supermix-v74
- Código fuente de Supermix (revisión de release): https://github.com/kai9987kai/Supermix/tree/ff35c75c459e2c39b7e763e800ed9408659f2b4a
- Manifiesto con SHA-256 y tamaños: https://huggingface.co/Kai9987kai/supermix-historical-milestones/blob/main/manifest.json
- Resultados por ejecución (ejemplo v70_moe): https://huggingface.co/Kai9987kai/supermix-historical-milestones/tree/main/results/v70_moe
