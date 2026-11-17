# kabcnd/kabcnd

## Resumen

`kabcnd/kabcnd` es un repositorio de Hugging Face que actua como indice o hub de la coleccion de releases GGUF publicadas por el usuario kabcnd bajo la marca "Kenzan". No se trata de un modelo entrenado, sino de una pagina de agregacion que enlaza a distintos modelos cuantizados con tecnicas propias de compresion y empaquetado (`PinGrid`, `AttnGrid`, `Hepta48Up`, `PinGrid3`) orientadas a ejecucion nativa en Metal sobre Apple Silicon, concretamente al entorno de un Mac mini M6 con 16 GB de memoria unificada y `llama.cpp` Metal 4.

El repositorio en si no contiene pesos, tokenizador, configuracion ni model card tecnica del modelo base. Los enlaces apuntan a releases derivadas de modelos conocidos (Qwen 3.8 de 27B, Nemotron 3.5 Transcribe 30B-A4B, Flint 40B, Clover 35B-A3B, Karpo Decision 31B, Venus Omni 8B, OrcaSAQ2 Cyber 27B) sobre las que el autor aplica sus propios esquemas de cuantizacion y, en algunos casos, variantes "Abliterated" o "Hybrid".

Su relevancia es acotada: sirve como puerta de entrada a un ecosistema de releases GGUF para hardware Apple, pero no documenta arquitectura, datos de entrenamiento, licencia ni benchmarks. Cualquier evaluacion tecnica debe hacerse sobre los repositorios hijos enlazados, no sobre este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio indice, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquemas propietarios del autor: PinGrid, AttnGrid, PinGrid3, Hepta48Up, Ternary |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorios hijos); este repositorio no contiene pesos |

## Arquitectura y entrenamiento

Este repositorio no define arquitectura ni proceso de entrenamiento. Es una pagina de agregacion que enlaza a releases GGUF derivadas de modelos de terceros. Las etiquetas del autor (`PinGrid`, `AttnGrid`, `PinGrid3`, `Hepta48Up`, `Ternary`) parecen referirse a metodos de cuantizacion o empaquetado de pesos optimizados para el backend Metal de `llama.cpp`, pero no se documenta su funcionamiento, sus tasas de compresion ni las perdidas de calidad asociadas.

Los modelos enlazados cubren rangos de 8B a 40B, con al menos una variante MoE (Clover 35B-A3B y Nemotron 3.5 Transcribe 30B-A4B, segun la nomenclatura). Existen variantes "Abliterated" (presumiblemente con capas de rechazo o alineacion eliminadas) y "Hybrid", pero no hay informacion tecnica sobre el proceso aplicado ni sobre el modelo base exacto de cada release.

## Capacidades

- No se puede atribuir ninguna capacidad concreta a este repositorio: es un indice, no un modelo ejecutable.
- Las releases enlazadas cubren, segun su nombre: generacion de texto (Qwen 3.8 27B), transcripcion de audio (Nemotron 3.5 Transcribe 30B-A4B), modelos multimodales/omni (Venus Omni 8B Tool), modelos orientados a ciberseguridad (OrcaSAQ2 Cyber 27B) y modelos de decision (Karpo Decision 31B).
- Soporte de tool calling: indicado solo en el nombre de `Venus-Omni-8B-Tool`, sin documentacion adicional.
- Capacidades de agente, razonamiento multi-paso, multilingues: no disponibles en este repositorio.
- Ejecucion nativa en Metal 4 via `llama.cpp` para Apple Silicon, segun la model card.

## Casos de uso

- Evaluacion de cuantizaciones GGUF en Apple Silicon: usar los repositorios hijos para medir throughput y perplejidad de los esquemas PinGrid/AttnGrid frente a cuantizaciones estandar (Q4_K_M, Q5_K_M) en un Mac mini M6 de 16 GB.
- Despliegue local en Mac para prototipado: seleccionar una release (por ejemplo Qwen3.8-27B-PinGrid) y ejecutarla con `llama.cpp` Metal para tareas de generacion de texto sin conexion.
- Transcripcion de audio local: la release Nemotron 3.5 Transcribe 30B-A4B apunta a un caso de uso de ASR, aunque su viabilidad en 16 GB con cuantizacion agresiva debe validarse empiricamente.
- Experimentacion con modelos "Abliterated": util para investigacion sobre alineacion y rechazo, con las advertencias eticas y legales correspondientes.
- Benchmarking de esquemas de cuantizacion propietarios: comparar calidad (perplejidad, evaluaciones task-specific) de Hepta48Up y Ternary frente a esquemas estandar en el mismo modelo base.
- Referencia para integracion en pipelines de `llama.cpp`/Ollama en entornos macOS: los ficheros GGUF son compatibles con el ecosistema estandar, aunque los esquemas propietarios pueden requerir forks o versiones concretas del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: la model card apunta explicitamente a 16 GB de memoria unificada (Mac mini M6). Para modelos de 27B-40B en 16 GB es necesario recurrir a cuantizaciones muy agresivas (3-4 bits o inferiores) o a esquemas como Ternary, con la consiguiente perdida de calidad.
- GPU recomendadas: Apple Silicon (M-series) con Metal 4. No hay indicaciones sobre GPUs NVIDIA/AMD en la informacion disponible.
- Cabe en consumer GPU: si, en el escenario declarado (Mac mini M6, 16 GB). Para GPUs discretas no hay datos.
- Opciones de despliegue: `llama.cpp` con backend Metal 4 es el runtime declarado. Compatibilidad con Ollama, vLLM o TGI no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable; una comparativa real requeriria evaluar cada release hija frente a sus equivalentes GGUF oficiales (por ejemplo, cuantizaciones oficiales de Qwen o Nemotron publicadas por sus autores originales), datos que no se aportan.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni configuracion: no es usable directamente como modelo.
- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia de cada repositorio hijo y del modelo base original.
- Los esquemas de cuantizacion propietarios (PinGrid, AttnGrid, Hepta48Up, Ternary) no estan documentados tecnicamente; se desconoce su impacto en calidad, estabilidad y compatibilidad con versiones estandar de `llama.cpp`.
- Las variantes "Abliterated" implican la eliminacion de capas de alineacion o rechazo; su uso en produccion conlleva riesgos de contenido inapropiado y posibles incumplimientos de las licencias de los modelos base.
- Los modelos base citados (Qwen 3.8, Nemotron 3.5, Flint, Clover) no corresponden necesariamente a releases oficiales verificables; conviene contrastar su existencia y procedencia.
- Riesgo de alucinacion, sesgos y limitaciones idiomaticas: no evaluables desde este repositorio; dependen de cada modelo base.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio principal: https://huggingface.co/kabcnd/kabcnd
- Venus-Omni-8B-Tool-PinGrid-GGUF: https://huggingface.co/kabcnd/Kenzan-Venus-Omni-8B-Tool-PinGrid-GGUF
- Karpo-Decision-31B-AttnGrid-GGUF: https://huggingface.co/kabcnd/Kenzan-Karpo-Decision-31B-AttnGrid-GGUF
- OrcaSAQ2-Cyber-27B-AttnGrid-GGUF: https://huggingface.co/kabcnd/Kenzan-OrcaSAQ2-Cyber-27B-AttnGrid-GGUF
- Clover-35B-A3B-PinGrid-GGUF: https://huggingface.co/kabcnd/Kenzan-Clover-35B-A3B-PinGrid-GGUF
- Flint-40B-Hepta48Up-GGUF: https://huggingface.co/kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF
- Flint-40B-Abliterated-Hepta48Up-GGUF: https://huggingface.co/kabcnd/Kenzan-Flint-40B-Abliterated-Hepta48Up-GGUF
- Ternary-Flint-40B-GGUF: https://huggingface.co/kabcnd/Ternary-Flint-40B-GGUF
- Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF: https://huggingface.co/kabcnd/Kenzan-Nemotron-3.5-Transcribe-30B-A4B-PinGrid3-GGUF
- Qwen3.8-27B-PinGrid-GGUF: https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF
- Qwen3.8-27B-Abliterated-GGUF: https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-Abliterated-GGUF
- Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF: https://huggingface.co/kabcnd/Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcpc
