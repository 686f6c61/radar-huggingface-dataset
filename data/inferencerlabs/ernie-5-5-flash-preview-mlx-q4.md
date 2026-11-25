# inferencerlabs/ERNIE-5.5-Flash-Preview-MLX-Q4

## Resumen

ERNIE-5.5-Flash-Preview-MLX-Q4 es una cuantización de 4 bits del modelo baidu/ERNIE-5.5-Flash-Preview, publicada por el usuario inferencerlabs. Se trata de una build dinámica que cuantiza la mayor parte de la red a un mínimo de 4 bits por peso, manteniendo las capas sensibles en mayor precisión para preservar la exactitud en tareas de código. El formato es MLX, la librería de Apple para inferencia en silicio unificado (M-series), por lo que su despliegue está orientado a Macs con memoria unificada amplia. El repositorio ocupa 6,3 GB y declara el tag `ernie5_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) en el modelo base.

El modelo base es un ERNIE de generación 5.5 en variante Flash, es decir, una versión orientada a baja latencia dentro de la familia ERNIE de Baidu. Esta ficha describe la cuantización de inferencerlabs y no el modelo original: los detalles de arquitectura, entrenamiento y benchmarks del modelo de Baidu no están disponibles en la información proporcionada.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de gran tamaño en hardware Apple con memoria unificada, con métricas de degradación por cuantización publicadas por el autor (perplejidad, exactitud de token y divergencia omitida) que permiten evaluar el compromiso entre tamaño y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `ernie5_5_moe`); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Dinámica, mínimo 4 bits por peso con capas sensibles en mayor precisión (Q3, Q4, Q5, Q6, Q8, Q9 y base publicadas por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | MLX (repo de 6,3 GB) |

## Arquitectura y entrenamiento

La información disponible solo confirma que el modelo base pertenece a la familia ERNIE 5.5 en variante Flash y que el tag del repositorio indica una arquitectura MoE. No se dispone de datos sobre número de parámetros, número de expertos, tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica documentada corresponde a la cuantización: el autor aplica una versión modificada de MLX para cuantizar dinámicamente, asignando un mínimo de 4 bits a la mayoría de los pesos y manteniendo capas sensibles en mayor precisión. El autor publica una tabla de degradación que permite comparar variantes: Q4 alcanza una perplejidad de 1,33593 y una exactitud de token del 91,65 %, frente a 1,20312 y 100 % del modelo base; Q3 se degrada de forma severa (perplejidad 168,0, exactitud 43,45 %), por lo que no resulta utilizable.

## Capacidades

- Generación de texto en inglés (pipeline `text-generation`).
- Capacidad de código: la cuantización preserva capas sensibles en mayor precisión explícitamente para mejorar la exactitud en coding.
- Modo de decodificación acelerada mediante "Dspark" (motor alternativo dentro de Inferencer), según la model card.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o visión: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de otros idiomas.

## Casos de uso

- Inferencia local en Mac de gama alta: el modelo está empaquetado en MLX y probado en M3 Ultra, por lo que encaja en flujos de trabajo de desarrollo que requieren un LLM grande sin depender de la nube, a costa de unos 155-165 GiB de memoria unificada.
- Asistencia de código en local: la cuantización mantiene mayor precisión en capas sensibles para coding, lo que permite usarla en tareas de autocompletado y generación de código dentro de un IDE sobre Apple Silicon.
- Generación de texto largo: con 22.000 tokens de contexto probados a ~16 tokens/s, es viable para resúmenes, redacción técnica o análisis de documentos extensos en local.
- Evaluación comparativa de cuantizaciones: la tabla de perplejidad y exactitud de token publicada permite a un equipo de investigación medir el impacto de Q4 frente a Q5-Q9 antes de fijar una variante para producción.
- Prototipado de pipelines de agentes en inglés: al ser un modelo de texto con modo de decodificación acelerada (Dspark), sirve para experimentar con flujos multi-turno en un entorno controlado antes de migrar a infraestructura GPU.
- Reproducción de benchmarks internos: el autor publica métricas de divergencia, lo que facilita validar la calidad de la cuantización frente al modelo base en un conjunto propio de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de degradación por cuantización y de velocidad:

| Variante | Perplejidad | Exactitud de token | Divergencia omitida |
|---|---|---|---|
| Q3 | 168,0 | 43,45 % | 72,57 % |
| Q4 | 1,33593 | 91,65 % | 17,28 % |
| Q5 | 1,23437 | 95,05 % | 17,28 % |
| Q6 | 1,21875 | 96,65 % | 12,03 % |
| Q8 | 1,21875 | 97,65 % | 9,92 % |
| Q9 | 1,20312 | 97,80 % | 9,60 % |
| Base | 1,20312 | 100 % | 0,000 % |

Rendimiento medido en M3 Ultra según la model card:

| Configuración | Contexto | Velocidad | Memoria |
|---|---|---|---|
| M3 Ultra estándar | 22.000 tokens | ~16 tokens/s | ~155 GiB |
| M3 Ultra con Dspark (coding) | 500 tokens | ~30,7 tokens/s | ~165,5 GiB |
| M3 Ultra con Dspark (writing) | 500 tokens | ~24,5 tokens/s | ~165,5 GiB |

## Requisitos de hardware

- Memoria unificada estimada: ~155 GiB en configuración estándar y ~165,5 GiB con el motor Dspark, según las pruebas del autor en M3 Ultra.
- Hardware recomendado: Apple M3 Ultra con memoria unificada de al menos 192 GB; no hay datos de otras configuraciones.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en Macs de 32-64 GB; el tamaño del repo (6,3 GB) no refleja la memoria de trabajo real, que es muy superior.
- Despliegue: exclusivamente MLX (librería `mlx`); el autor menciona Inferencer v2.5.5 como entorno probado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~16 tokens/s con 22.000 tokens de contexto; ~24,5-30,7 tokens/s con Dspark y 500 tokens de contexto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento del modelo base ni de alternativas comparables, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está verificado.
- La cuantización Q4 introduce degradación medible: 91,65 % de exactitud de token y 17,28 % de divergencia omitida frente al modelo base.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; hay que consultar la licencia del modelo base (baidu/ERNIE-5.5-Flash-Preview) antes de cualquier despliegue productivo.
- El autor declara explícitamente que no es el creador del modelo y no se responsabiliza de inexactitudes o daños derivados del uso.
- Requiere hardware Apple de gama muy alta (~155-165 GiB de memoria unificada), lo que limita su uso a un nicho muy concreto.
- No hay información sobre sesgos, riesgo de alucinación ni límites de contexto del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/ERNIE-5.5-Flash-Preview-MLX-Q4
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Vídeos de demostración: https://youtube.com/xcreate
- Inferencer: https://inferencer.com
- MLX: https://github.com/ml-explore/mlx
