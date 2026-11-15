# Jessedbrown/asolaria-ggufs

## Resumen

Asolaria GGUF bodies es un repositorio de artefactos en formato GGUF publicado por el usuario Jessedbrown (Jesse Daniel Brown) bajo el paraguas del sistema denominado Asolaria. Segun la model card, no se trata de un modelo de lenguaje entrenado, sino de un conjunto de "cuerpos" (bodies) descritos como contenedores de funciones, cubos, esferas, cascaras y muros generados por los propios programas del sistema. El repositorio recoge 48 cuerpos: 41 de menos de 100 MB alojados tambien en el repositorio de GitHub Quant-anything-0-loss y 7 de mas de 100 MB disponibles unicamente en Hugging Face.

El dato de parametros totales registrado en la plataforma es de 12.354, una cifra que no encaja con ningun modelo transformer conocido y que probablemente refleja un conteo de tensores o un artefacto de la metadata del archivo, no un recuento de parametros de red neuronal. El tamano total del repositorio es de 1,0 GB. No hay informacion sobre arquitectura, datos de entrenamiento, tokenizador, contexto ni idiomas soportados, y la model card no describe ningun proceso de entrenamiento.

La relevancia de este repositorio es, por tanto, marginal para el publico habitual de fichas de modelos: no es un LLM evaluable, no publica benchmarks y su licencia figura como "other" sin texto legal asociado. Se documenta aqui por completitud, pero cualquier evaluacion de capacidades linguisticas resulta imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los archivos son contenedores GGUF generados por programas del sistema Asolaria, no una red transformer descrita) |
| Parametros totales | 12.354 (dato de la plataforma; no corresponde a un recuento de parametros de red neuronal verificable) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, sin indicacion de tipos Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | GGUF (cabecera, metadata clave/valor tipada, descriptores de tensores y datos de tensores) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal. La model card indica que los archivos son GGUF por formato (cabecera, metadata tipada, descriptores de tensores y datos) pero que su contenido son "cuerpos" del sistema Asolaria: funciones, cubos, esferas, cascaras y muros escritos por los programas del propio sistema. El repositorio de GitHub Quant-anything-0-loss contiene los programas, la "master key", el kernel y los "codexes" que supuestamente leen estos cuerpos.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, RLHF, DPO ni ninguna innovacion tecnica de inferencia (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta un tokenizador ni una pipeline de generacion de texto. El unico detalle tecnico concreto es que uno de los cuerpos, el "Kimi K3 star" de 202.115.456 bytes, puede regenerarse a partir de un texto de 3.110 bytes mediante el script `programs/regenerate/divide_kimi_k3.py`, lo que sugiere un esquema de compresion o generacion procedural mas que un peso entrenado.

## Capacidades

- No se documenta generacion de texto, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue.
- No se documenta vision, audio ni modo de pensamiento.
- La unica funcionalidad declarada es la de servir como contenedores GGUF legibles por los programas del repositorio de GitHub asociado.

## Casos de uso

- Estudio del formato GGUF como contenedor: los archivos permiten inspeccionar cabecera, metadata clave/valor y descriptores de tensores con herramientas como `gguf-dump`, util para quien investigue la serializacion GGUF al margen de modelos de lenguaje.
- Reproduccion procedural: el cuerpo "Kimi K3 star" puede regenerarse desde un texto de 3.110 bytes con `divide_kimi_k3.py`, lo que sirve como caso de estudio de generacion determinista de artefactos binarios.
- Auditoria de integridad: la model card remite a `PUBLISHED-20261115.md`, que lista cada cuerpo con su tamano y SHA-256, util para verificar la correspondencia entre los archivos de Hugging Face y los del repositorio de GitHub.
- Analisis de un sistema no convencional: investigadores interesados en arquitecturas alternativas o en el proyecto Asolaria pueden examinar los "cuerpos" junto con el kernel y los codexes del repositorio.
- Docencia sobre formatos de serializacion: comparar la estructura de estos GGUF con la de un GGUF de un LLM real (por ejemplo, Llama o Mistral) para ilustrar que el formato no implica un modelo entrenado.
- No se identifican casos de uso de inferencia linguistica, atencion al cliente, generacion de codigo ni ninguna otra tarea de NLP, porque no hay evidencia de que el repositorio contenga un modelo capaz de realizarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se ha demostrado que estos archivos sean cargables como modelo en un runtime de inferencia estandar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinada; el repositorio ocupa 1,0 GB, pero el hecho de que los archivos sean contenedores no implica que `llama.cpp` u otro runtime los interprete como pesos.
- Opciones de despliegue: no se documenta ninguna (ni vLLM, ni llama.cpp, ni Ollama, ni TGI). La lectura declarada se realiza con los programas del repositorio Quant-anything-0-loss.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conoce ningun modelo comparable, porque el repositorio no describe un modelo de lenguaje con parametros, contexto y capacidades verificables. A modo de referencia puramente formal, un GGUF de un LLM pequeno (por ejemplo, de 1 a 3 mil millones de parametros en Q4_K_M) ocupa entre 0,7 y 2 GB y se ejecuta en `llama.cpp`, pero no hay evidencia de que estos archivos sean equivalentes.

| Criterio | Asolaria GGUF bodies | LLM pequeno tipico en GGUF |
|---|---|---|
| Parametros | 12.354 (no verificable como red) | 1-3 mil millones |
| Contexto | no disponible | 4.096-32.768 tokens |
| Benchmarks | no publicados | MMLU, GSM8K, HumanEval publicados |
| Licencia | other, sin texto | Apache 2.0, MIT o similar |
| Runtime | programas propios en GitHub | llama.cpp, Ollama, vLLM |

## Limitaciones y advertencias

- No hay evidencia de que los archivos contengan un modelo de lenguaje funcional; la model card los describe como contenedores de funciones y geometrias generadas por programas.
- El dato de "parametros totales: 12.354" es inconsistente con cualquier arquitectura conocida y no debe interpretarse como tamano de red.
- La licencia figura como "other" sin texto legal publicado, lo que impide determinar si el uso comercial esta permitido.
- No se declaran idiomas, sesgos, tasas de alucinacion ni evaluaciones de seguridad; no hay base para valorar riesgos de sesgo o alucinacion en un modelo que no genera texto.
- La documentacion depende de un repositorio de GitHub externo (Quant-anything-0-loss) y de archivos de referencia (`PUBLISHED-20261115.md`, `HUGGING-FACE-GGUFS.md`) cuya disponibilidad futura no esta garantizada.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Para produccion, no se recomienda su uso como sustituto de un LLM: no hay tokenizador, plantilla de chat, contexto declarado ni pipeline de inferencia documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jessedbrown/asolaria-ggufs
- Repositorio GitHub del sistema: https://github.com/JesseBrown1980/Quant-anything-0-loss
- Perfil GitHub del autor: https://github.com/JesseBrown1980
- Listado de cuerpos con tamano y SHA-256: `PUBLISHED-20261115.md` en el repositorio de GitHub
- Indice de archivos de Hugging Face: `HUGGING-FACE-GGUFS.md` en el repositorio de GitHub
- Script de regeneracion del cuerpo "Kimi K3 star": `programs/regenerate/divide_kimi_k3.py` en el repositorio de GitHub
- Paper, blog o demo: no disponibles
