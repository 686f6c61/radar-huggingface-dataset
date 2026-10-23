# praiselab-picuslab/benchmark-slm-fiven-phi-1_5-raft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-phi-1_5-raft` no es un modelo fundacional, sino un adaptador LoRA (PEFT) entrenado sobre `microsoft/phi-1_5` como parte de un banco de pruebas interno de modelos de lenguaje pequenos (SLM). El identificador resume su proposito: benchmark de SLM, conjunto de datos `fiven`, estrategia `raft` y arquitectura base Phi-1.5. El autor es la organizacion `praiselab-picuslab`, y el artefacto se publica con acceso restringido (gated), lo que obliga a aceptar condiciones en HuggingFace antes de descargarlo.

Su relevancia no esta en las capacidades del adaptador en si, sino en su valor como pieza reproducible de una comparativa: permite medir como responde un mismo modelo base (Phi-1.5, 1.3B parametros) ante una estrategia de ajuste concreta sobre un dataset concreto. Al publicarse unicamente los pesos del adaptador (no el modelo fusionado), el coste de almacenamiento y distribucion es minimo, aunque exige reconstruir el pipeline completo para poder usarlo.

No hay publicados resultados de evaluacion, ficha de modelo, ni documentacion sobre el dataset `fiven` o la estrategia `raft` en la informacion disponible. El unico idioma declarado es el italiano (`it`), lo que sugiere que el corpus de ajuste estaba en ese idioma, aunque no se detalla su composicion ni su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `microsoft/phi-1_5`); adaptador LoRA sobre proyecciones del transformer |
| Parametros totales | 1,3 mil millones en el modelo base; parametros del adaptador no disponibles (repo de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens segun la documentacion del modelo base Phi-1.5; no confirmado para este adaptador |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion dependeria del proceso de fusion y conversion posterior) |
| Idiomas soportados | italiano (`it`) declarado; el modelo base esta entrenado principalmente en ingles, por lo que el soporte real de otros idiomas no esta verificado |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) compatible con la libreria `peft`, aplicado sobre `microsoft/phi-1_5`. Phi-1.5 es un transformer decoder-only de 1,3B parametros con contexto de 2048 tokens, entrenado por Microsoft Research sobre aproximadamente 30B tokens de datos filtrados de "calidad de libro de texto" combinados con datos sinteticos generados por modelos mayores. Sobre esa base, este repositorio anade matrices de adaptacion de rango bajo, sin que se documenten ni el rango, ni el alpha, ni las capas objetivo.

El entrenamiento se enmarca en una campana de evaluacion comparativa de SLM (tags `benchmark-slm`, `dataset-fiven`, `strategy-raft`, `or2`). La estrategia `raft` no esta descrita en la informacion disponible; por el acronimo podria corresponder a Retrieval Augmented Fine-Tuning, pero no hay documentacion que lo confirme, y tampoco se detallan el numero de tokens de ajuste, la composicion del dataset `fiven`, ni si se aplicaron tecnicas de RLHF o DPO. No se declara ninguna innovacion tecnica propia (atencion linear, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva bilingue (italiano declarado, ingles heredado del modelo base).
- Razonamiento basico y resolucion de problemas aritmeticos simples, limitado por el tamano de 1,3B parametros del modelo base.
- Generacion de codigo Python de nivel introductorio, capacidad caracteristica de la familia Phi-1/Phi-1.5.
- Ajuste de instrucciones segun el dataset `fiven`, sin que se detalle el formato exacto de las instrucciones.
- Soporte de tool calling / function calling: no disponible; no se declara ni se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara.
- Capacidades multimodales (vision, audio) o modo "thinking": no disponibles.
- Capacidad de ser fusionado con el modelo base para producir un checkpoint denso standalone.

## Casos de uso

- Reproduccion de experimentos de ajuste: cargar el adaptador con `peft` sobre `microsoft/phi-1_5` para replicar exactamente la configuracion `raft` del benchmark y comparar sus salidas con las de otras estrategias del mismo banco de pruebas.
- Evaluacion comparativa de SLM: usar este adaptador como uno de los brazos del benchmark `benchmark-slm`, midiendo perplejidad y calidad de generacion sobre un conjunto de validacion en italiano.
- Investigacion sobre LoRA en modelos pequenos: analizar como un adaptador de bajo rango modifica el comportamiento de un modelo de 1,3B parametros, inspeccionando pesos y activaciones.
- Prototipado de asistentes en italiano sobre hardware modesto: tras fusionar y cuantizar, el modelo resultante ocupa menos de 1 GB en Q4 y puede ejecutarse en CPU para demos internas de generacion de texto.
- Generacion de codigo asistida en entornos con restricciones de recursos: al heredar el sesgo de Phi-1.5 hacia Python, sirve para autocompletar fragmentos en herramientas de desarrollo ligeras, siempre con revision humana.
- Docencia y formacion: ilustrar el flujo completo de un ajuste PEFT (dataset, estrategia, evaluacion) en cursos de IA aplicada, usando un artefacto pequeno y de coste minimo.
- Auditoria de artefactos gated: estudiar los metadatos y el proceso de acceso restringido de publicaciones de benchmark, util para equipos que definen politicas de publicacion de modelos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador LoRA en si ocupa pocos megabytes, pero requiere cargar el modelo base. En FP16, Phi-1.5 necesita aproximadamente 2,6 GB de VRAM (1,3B parametros x 2 bytes) mas overhead de activaciones y cache KV.
- Cuantizacion: en Q8 el modelo fusionado ronda 1,4 GB; en Q4, alrededor de 0,8-1,0 GB. Cifras estimadas por tamano de parametros, no verificadas con este adaptador.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16. Para lotes grandes o contexto completo de 2048 tokens, se recomienda 8-12 GB. A100/H100 solo tienen sentido para evaluaciones por lotes a gran escala, no por requisitos de memoria.
- CPU: viable en inferencia con llama.cpp u Ollama tras fusion y conversion a GGUF, con latencias del orden de decenas de tokens por segundo en CPUs modernas de escritorio (estimacion, no medida).
- Opciones de despliegue: `transformers` + `peft` (ruta nativa para el adaptador), fusion con `merge_and_unload()` y conversion a GGUF para `llama.cpp`/`Ollama`, vLLM o TGI tras la fusion a un checkpoint denso. El adaptador no es cargable directamente por llama.cpp sin fusion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (sobre Phi-1.5) | 1,3B (base) + LoRA | 2048 (base) | no disponible | Gated en HuggingFace, 0 descargas | no disponible |
| microsoft/phi-1_5 (base) | 1,3B | 2048 | MIT (segun ficha del modelo base) | Publico | no evaluado aqui; referencia del benchmark |
| Qwen2.5-1.5B | 1,5B | 32 768 | Apache 2.0 | Publico | no comparado en la informacion disponible |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Publico | no comparado en la informacion disponible |

La comparacion se limita a parametros, contexto y licencia: no existen resultados de evaluacion de este adaptador que permitan situarlo frente a las alternativas en calidad de generacion, razonamiento o codigo.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace; no es descargable de forma anonima ni automatizable sin token.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar las condiciones del gate. La licencia del modelo base (MIT para Phi-1.5) no cubre automaticamente el adaptador.
- Artefacto de benchmark, no de produccion: no hay ficha de modelo, informe tecnico ni evaluacion; no se recomienda su uso directo en sistemas en produccion.
- Riesgo de alucinacion: alto, inherente a un modelo base de 1,3B parametros con entrenamiento centrado en datos sinteticos y de "libro de texto".
- Sesgos: no documentados. El corpus de ajuste en italiano puede introducir sesgos idiomaticos y culturales no caracterizados.
- Cobertura idiomatica limitada: solo se declara italiano; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Ventana de contexto corta (2048 tokens en el base) para tareas de documento largo o conversaciones multi-turno extensas.
- Sin soporte documentado de tool calling, agentes o multimodalidad; no debe asumirse ninguna de estas capacidades.
- Repositorio practicamente vacio (0,0 GB) y sin descargas ni valoraciones: no hay evidencia de que los pesos del adaptador sean completos o funcionales.
- Fecha de creacion futura en los metadatos (2026-10-23): conviene verificar la integridad y procedencia del artefacto antes de usarlo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el dataset `fiven` ni la estrategia `raft`; los resultados obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-phi-1_5-raft
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este adaptador en la busqueda web disponible.
