# mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF` es una cuantizacion GGUF con imatrix generada por mradermacher a partir del modelo `richardyoung/Qwen3.5-4B-ARA-heretic`, que a su vez deriva de la familia Qwen3.5-4B de Alibaba. Se trata de una variante "heretic" (tambien etiquetada como uncensored, decensored y abliterated), es decir, un ajuste que elimina o reduce los mecanismos de rechazo del modelo original mediante tecnicas de abliteration. El resultado es un modelo de 4B parametros orientado a generacion de texto sin las restricciones de seguridad tipicas del modelo base.

La relevancia de esta ficha reside en que combina tres capas de transformacion: el modelo base Qwen3.5-4B, el ajuste heretic de richardyoung y la cuantizacion con imatrix de mradermacher. La model card indica que se trata de un modelo de vision (los ficheros mmproj, si existen, se alojan en el repositorio estatico). Sin embargo, el repositorio i1-GGUF solo contiene por ahora el fichero imatrix (0,1 GB), lo que sugiere que los cuants finales pueden no estar publicados o estar en proceso.

El modelo esta pensado para desarrolladores que necesitan un modelo pequeno (4B) ejecutable en hardware de consumo, sin filtros de contenido, y con la calidad de cuantizacion que aporta el uso de matrices de importancia (imatrix). La licencia es Apache 2.0, lo que facilita su uso comercial, aunque con las advertencias propias de un modelo abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-4B; presumiblemente transformer, no confirmado en la informacion) |
| Parametros totales | 4B (nominal, segun nombre del modelo); el campo safetensors del repo indica 1.797.272, dato no coherente con el nombre y probablemente erroneo o parcial |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (fichero .imatrix.gguf); la model card lista Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (planificados; no todos presentes en el repo i1) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo deriva de Qwen3.5-4B, por lo que se presume una arquitectura transformer decoder-only con aproximadamente 4.000 millones de parametros, pero este dato no se confirma explicitamente en la model card. La transformacion "heretic" implica un proceso de abliteration: identificacion de direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y sustraccion de esas direcciones de los pesos, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones.

El proceso de cuantizacion de mradermacher utiliza matrices de importancia (imatrix) calculadas sobre un corpus de calibracion, lo que mejora la fidelidad de los cuants de baja precision respecto a cuantizaciones estaticas. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, y menciona que los cuants estaticos estan en un repositorio separado (`mradermacher/Qwen3.5-4B-ARA-heretic-GGUF`). No se detallan volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el ajuste heretic.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Capacidades de vision segun la model card ("This is a vision model"), aunque los ficheros mmproj no estan en este repositorio i1, sino en el estatico.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones que el modelo base.
- Razonamiento y generacion de codigo: presumibles por herencia de Qwen3.5-4B, pero no confirmados en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking: no disponible en la informacion.

## Casos de uso

- Prototipado local sin filtros de contenido: el modelo puede ejecutarse en un portatil con GPU de consumo gracias a su tamano de 4B y a los cuants GGUF de baja precision, lo que permite experimentar con generacion de texto sin depender de APIs externas.
- Investigacion sobre abliteration y seguridad: util para estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo, comparando respuestas con el Qwen3.5-4B original.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa donde el modelo base podria rechazar tematicas sensibles.
- Evaluacion de cuantizaciones imatrix: el fichero imatrix permite generar cuants propios y comparar la degradacion de perplejidad entre tipos de cuantizacion.
- Despliegue en entornos con recursos limitados: integracion en llama.cpp u Ollama para asistentes de texto en ingles en hardware modesto.
- Vision por computador en el borde (edge): si se descargan los ficheros mmproj del repositorio estatico, el modelo podria procesar imagenes en dispositivos con poca VRAM, aunque esta capacidad no esta confirmada en el repo i1.
- Base para ajuste fino posterior: al estar en formato GGUF y con licencia Apache 2.0, sirve como punto de partida para tareas especificas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 4B en GGUF, los cuants de 4 bits suelen ocupar en torno a 2,5-3 GB, y los de 8 bits en torno a 4,5-5 GB, pero estos valores son estimaciones generales y no datos confirmados para este modelo concreto.
- GPU recomendadas: no disponible en la informacion. Por tamano, cabria esperar ejecucion en RTX 3060/4060, RTX 4090, A100 y H100, pero no se confirma.
- Cabe en GPU de consumo: probablemente si, en funcion del cuant elegido, aunque no se aportan datos oficiales.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, y potencialmente otros runners compatibles con GGUF. vLLM y TGI no se mencionan en la informacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF | 4B (nominal) | no disponible | Apache 2.0 | GGUF imatrix | Variante abliterated, solo ingles, vision segun model card |
| richardyoung/Qwen3.5-4B-ARA-heretic | 4B (nominal) | no disponible | Apache 2.0 (heredada) | safetensors | Modelo base del que deriva esta cuantizacion |
| mradermacher/Qwen3.5-4B-heretic-GGUF | 4B (nominal) | no disponible | Apache 2.0 | GGUF | Variante heretic cuantizada, sin el sufijo ARA |
| mradermacher/Qwen3.5-4B-ARA-heresy-v2-GGUF | 4B (nominal) | no disponible | Apache 2.0 | GGUF | Variante heresy v2, presumiblemente otro ajuste abliterated |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminacion de direcciones de rechazo puede degradar la coherencia en tareas que requieren matices eticos o de seguridad, y facilita la generacion de contenido danino si se usa sin supervision.
- Riesgo de alucinacion: inherente a modelos de 4B; no se han publicado evaluaciones de factualidad para esta variante.
- Idioma: solo se declara ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Datos incoherentes: el campo de parametros safetensors del repositorio (1.797.272) no concuerda con el nombre del modelo (4B); conviene verificar los pesos antes de usarlo en produccion.
- Disponibilidad de cuants: el repositorio i1 solo contiene por ahora el fichero imatrix; los cuants finales pueden no estar publicados, lo que limita su uso inmediato.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener terminos adicionales; se enlaza a la licencia de Qwen en la model card.
- Vision no verificada: la model card afirma que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio, por lo que la capacidad visual no esta disponible directamente aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Repositorio de cuants estaticos: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-ARA-heretic-i1-GGUF
- Variante heretic cuantizada: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Variante heresy v2: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heresy-v2-GGUF
- Licencia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
