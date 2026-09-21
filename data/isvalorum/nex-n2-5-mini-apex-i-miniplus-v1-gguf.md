# IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF

## Resumen

Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF es una cuantización en formato GGUF del modelo multimodal nex-agi/Nex-N2.5-mini, publicada por el usuario IsValorum. El modelo base cuenta con 34.660.610.688 parámetros (aproximadamente 34,66 mil millones) y una arquitectura de mezcla de expertos (MoE) con capacidades de visión, tal y como indican las etiquetas `moe`, `multimodal`, `vision`, `qwen35moe` y el pipeline `image-text-to-text`. La licencia es Apache 2.0 y cubre 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.

La aportación principal de esta ficha no es un entrenamiento nuevo, sino una receta de cuantización personalizada denominada APEX-I-MiniPlus. En su edición V1, el autor preserva los router gates en `F32` sin comprimir, blinda la cabeza de salida de tokens en `Q6_K`, mantiene los attention gates en `Q8_0` y deja los expertos centrales en `IQ3_XXS`. El resultado ocupa aproximadamente 13,56 GiB, lo que permite ejecutar un MoE multimodal de 34,66B con la mayor parte del modelo residiendo en RAM de sistema (DDR4/DDR5), sin necesidad de una GPU de gama alta.

La relevancia actual del modelo radica en ese equilibrio entre tamaño, precisión y requisitos de hardware: el autor afirma que la ventana completa de 256 000 tokens puede residir íntegramente en VRAM de 24 GB, y que la vectorización lineal empleada evita las penalizaciones por *lookup stalls* de AVX2. La propia model card recomienda la edición V2.1 como opción principal y mantiene esta V1 por transparencia arquitectónica y para perfiles de despliegue más ligeros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (etiqueta `qwen35moe`) con proyector de visión `mmproj` |
| Parametros totales | 34.660.610.688 (aprox. 34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256 000 tokens (segun el autor; seccion "The 24GB Miracle: Full 256K Context Runs In VRAM") |
| Tipos de cuantizacion | GGUF con receta APEX-I-MiniPlus tensor a tensor: `IQ3_XXS` en expertos centrales, `Q6_K` en cabeza de salida, `Q8_0` en attention gates y en el proyector de visión, `F32` en router gates |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | nex-agi/Nex-N2.5-mini |
| Cuantizador | IsValorum (unsloth-studio) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 15,2 GB |
| Tamano de la edicion V1 | aprox. 13,56 GiB (dato del autor) |
| Parametros de generacion recomendados | no disponible (la model card los referencia, pero el contenido no se incluye en la informacion proporcionada) |
| Descargas / likes | 2025 descargas / 3 likes |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-20 |

## Arquitectura y entrenamiento

Esta ficha describe una cuantización, no un modelo entrenado desde cero. La arquitectura subyacente es la del modelo base nex-agi/Nex-N2.5-mini: un transformer de mezcla de expertos con torre de visión y pipeline `image-text-to-text`, etiquetado por el cuantizador como `qwen35moe`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por fases de RLHF, DPO u otro tipo de ajuste por preferencias: todos esos datos figuran como no disponibles en la información proporcionada.

La innovación técnica de esta publicación reside en el esquema de cuantización. Frente a las recetas comunitarias genéricas que comprimen uniformemente todos los expertos a `IQ2_S` de 2 bits, dejan la cabeza de salida en `Q3_K_M` y reducen las proyecciones de atención a `Q3_K`, la receta APEX-I-MiniPlus aplica precisión mixta tensor a tensor: router gates sin comprimir en `F32` (preservando la decisión de enrutado de expertos), cabeza de salida en `Q6_K`, attention gates en `Q8_0` y expertos de razonamiento en `IQ3_XXS` o superior. El autor justifica estas elecciones argumentando que las cabezas de salida y los gates son los puntos donde la degradación por cuantización produce picos de perplejidad, errores de sintaxis y corchetes de código mal formados.

Adicionalmente, la receta emplea vectorización lineal "amigable con CPU" que, según el autor, evita los *stalls* de *lookup* con AVX2 tanto en V1 como en V2.1, y el proyector multimodal (`mmproj`) se mantiene en `Q8_0` para permitir su carga explícita en VRAM de GPU y acelerar el análisis de pantalla y el OCR.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados de un MoE de 34,66 mil millones de parámetros.
- Procesamiento de imagen y texto (`image-text-to-text`): la etiqueta `vision` y el proyector `mmproj` en `Q8_0` habilitan tareas de análisis visual.
- Análisis de pantalla y OCR: el autor menciona explícitamente el uso del `mmproj` cargado en VRAM para "instant screen parsing and OCR".
- Flujos agénticos y `computer-use`: etiquetas `agentic` y `computer-use` presentes en la model card.
- Ventana de contexto larga: hasta 256 000 tokens según el autor, lo que habilita tareas de contexto profundo.
- Capacidad multilingüe en 13 idiomas: en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar.
- Ejecución híbrida CPU+GPU: la mayor parte de los pesos puede residir en RAM de sistema (DDR4/DDR5) con llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas).
- Soporte explícito de *tool calling* / *function calling*: no confirmado de forma explícita en la información disponible; las etiquetas `agentic` y `computer-use` apuntan a ese tipo de uso, pero no se documenta la interfaz concreta.

## Casos de uso

- Automatización de escritorio y agentes de computer-use: el modelo puede interpretar capturas de pantalla gracias al proyector de visión en `Q8_0` y mantener el historial de acciones en una ventana de hasta 256k tokens, lo que permite cadenas largas de razonamiento multi-paso sin perder el contexto de las acciones previas.
- Extracción de datos y OCR a escala: el pipeline `image-text-to-text` y el `mmproj` de alta precisión permiten procesar facturas, formularios o documentos escaneados en un servidor local, manteniendo los datos dentro de la organización.
- Asistentes multilingües de atención al cliente: con 13 idiomas declarados y contexto largo, el modelo puede gestionar conversaciones multi-turno y derivar a un humano conservando el hilo completo de la conversación.
- Asistencia de programación en local: un MoE de 34,66B con expertos preservados por encima de 2 bits mantiene mejor la sintaxis y el cierre de bloques de código que las cuantizaciones planas de 3 bits, según el autor, lo que lo hace apto para entornos de desarrollo sin conexión.
- Analítica de repositorios y documentos extensos: la ventana de 256k tokens permite cargar ficheros completos, contratos largos o varios módulos de código en una única pasada y responder preguntas sobre el conjunto.
- Despliegue en estaciones de trabajo sin GPU de gama alta: al poder residir mayoritariamente en RAM DDR4/DDR5 con llama.cpp, es viable en portátiles y equipos con GPUs modestas que solo alojan en VRAM el proyector de visión y las capas activas.
- Investigación en cuantización: la publicación documenta de forma explícita la asignación de precisión por tensor, lo que la convierte en una referencia práctica para estudiar el impacto de la cuantización en modelos MoE multimodales.
- Prototipado de agentes con requisitos de privacidad: al ejecutarse íntegramente en hardware propio y bajo licencia Apache 2.0, es adecuado para pruebas de concepto en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre esta edición V1 concreta en la información disponible. Los únicos datos numéricos aportados por el autor corresponden a la edición V2.1 y a un modelo distinto (Occamy-1.0), por lo que se presentan a continuación debidamente etiquetados y no deben atribuirse a este repositorio.

| Evaluacion | Modelo evaluado | Resultado | Fuente |
|---|---|---|---|
| Perplejidad en WikiText-2 | Nex-N2.5-mini baseline sin cuantizar | aprox. 6,40 | Autor (IsValorum) |
| Perplejidad en WikiText-2 | Nex-N2.5-mini APEX-I-MiniPlus V2.1 (edicion distinta) | 6,4725 ± 0,1635 (ΔPPL aprox. +0,07) | Autor (IsValorum) |
| Perplejidad en WikiText-2 | Nex-N2.5-mini APEX-I-MiniPlus V1 (este repositorio) | no disponible | no disponible |
| Benchmark independiente en llama.cpp CUDA b11027 con FlashAttention | Occamy-1.0 APEX-I-MiniPlus V2 (modelo distinto, no Nex-N2.5) | no disponible (resultados no incluidos en la informacion proporcionada) | zephel01 (CoolZero), en NVIDIA RTX 5090 32GB |

## Requisitos de hardware

- Peso de los ficheros de esta edición V1: aproximadamente 13,56 GiB según el autor; el repositorio completo ocupa 15,2 GB (incluye ficheros adicionales, entre ellos el `mmproj`).
- VRAM para contexto completo: el autor afirma que la ventana completa de 256k tokens cabe en 24 GB de VRAM ("The 24GB Miracle"), lo que sitúa a las RTX 3090 y RTX 4090 (24 GB) como mínimo práctico para ese escenario.
- GPU empleada en la evaluación independiente citada: NVIDIA RTX 5090 con 32 GB (modelo Occamy, no este).
- GPU de consumo: sí, cabe en tarjetas de 24 GB y superiores; con cuantizaciones parciales o descarga a RAM puede funcionar en GPUs con menos VRAM.
- Modo de descarga a RAM de sistema: la mayor parte de los pesos puede residir en DDR4/DDR5, con el proyector de visión en VRAM. El autor indica que V2.1 alcanza +24 a 28+ tok/s en *streaming* con este esquema; para V1 no se publica una cifra equivalente.
- Aceleración: llama.cpp con CUDA (versión probada en la evaluación externa: b11027) y FlashAttention activada (`-fa on`).
- Opciones de despliegue: llama.cpp y sus derivados; las etiquetas incluyen `endpoints_compatible`. Compatibilidad con vLLM, TGI u Ollama no se declara explícitamente en la información disponible.
- Latencia y throughput de esta edición V1: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de la receta | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Nex-N2.5-mini-APEX-I-MiniPlus V1 (este repositorio) | 34,66B totales (activos no disponible) | hasta 256k | `F32` router, `Q6_K` cabeza, `Q8_0` atencion, `IQ3_XXS` expertos | aprox. 13,56 GiB | apache-2.0 | Perfil ligero y agil; sin benchmarks propios publicados |
| Nex-N2.5-mini-APEX-I-MiniPlus V2.1 | 34,66B totales (activos no disponible) | hasta 256k | `Q5_K` en 40 expertos compartidos, `Q8_0` atencion y `mmproj` | aprox. 13,74 GiB / aprox. 14,7 GB | apache-2.0 | Recomendado por el autor; PPL 6,4725 en WikiText-2; +24 a 28+ tok/s con descarga a RAM |
| APEX-I-Mini genericos de la comunidad | 34,66B totales | no disponible | `IQ2_S` en todos los expertos, `Q3_K_M` en cabeza, `Q3_K` en atencion | no disponible | apache-2.0 (segun base) | El autor los situa por debajo del umbral de calidad, con picos de perplejidad y errores de sintaxis |
| Cuantizaciones planas de 3 bits | 34,66B totales | no disponible | 3 bits uniformes | no disponible | apache-2.0 (segun base) | Referencia comparativa usada por el autor; sin cifras publicadas |
| nex-agi/Nex-N2.5-mini (modelo base) | 34,66B totales | no disponible | sin cuantizar | no disponible | no disponible en la informacion proporcionada | Base de todas las ediciones anteriores |

## Limitaciones y advertencias

- Esta publicación es una cuantización, no un modelo nuevo: hereda todos los sesgos, alucinaciones y limitaciones del modelo base nex-agi/Nex-N2.5-mini, que no se documentan en la información disponible.
- No hay métricas de calidad publicadas para esta edición V1. Las cifras de perplejidad citadas (6,4725 ± 0,1635 en WikiText-2) corresponden a la edición V2.1, no a este repositorio.
- El único benchmark presentado como "independiente" se ejecutó sobre Occamy-1.0 APEX-I-MiniPlus V2, un modelo distinto, y en la información proporcionada no se incluyen sus resultados numéricos.
- Toda la comparación frente a cuantizaciones comunitarias genéricas y cuantizaciones planas de 3 bits proviene del propio autor; no se aportan mediciones de terceros que la respalden.
- La calidad real de la cuantización en tareas de razonamiento profundo, matemáticas o generación de código de este V1 no está verificada con datos públicos.
- El número de parámetros activos no está disponible, por lo que no puede estimarse con precisión el coste computacional por token ni el throughput esperado.
- El contexto declarado de 256k tokens es una afirmación del autor; no se documenta cómo se validó la degradación de atención a esa longitud.
- Las capacidades multimodales requieren cargar el proyector `mmproj`; sin él, el modelo queda limitado a texto.
- El soporte real de *tool calling* no se especifica: las etiquetas `agentic` y `computer-use` sugieren ese uso, pero no hay definición de plantilla de funciones.
- La calidad por idioma no está documentada: se declaran 13 idiomas, pero no hay evaluación desagregada de ninguno de ellos.
- La licencia del repositorio es Apache 2.0, pero conviene verificar los términos del modelo base nex-agi/Nex-N2.5-mini antes de un uso comercial, ya que no se detallan en la información proporcionada.
- La adopción es muy baja (3 likes, 2025 descargas), lo que implica escasa validación por parte de la comunidad.
- Las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar su vigencia antes de integrarlo en producción.
- El autor mantiene activamente la recomendación de usar la versión V2.1 en lugar de esta V1, por lo que V1 no recibirá necesariamente las mismas mejoras.

## Enlaces

- Repositorio HuggingFace de esta edición: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF
- Edición recomendada V2.1: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Evaluación independiente de la familia APEX-I-MiniPlus por zephel01 (CoolZero): https://note.com/zephel01/n/n71d3d7e6b70c
- llama.cpp (runtime empleado en las pruebas citadas, CUDA b11027): no se proporciona enlace directo en la información disponible.
- Otras referencias, papers o demos: no disponible. La búsqueda web realizada no devolvió resultados relacionados con este modelo.
