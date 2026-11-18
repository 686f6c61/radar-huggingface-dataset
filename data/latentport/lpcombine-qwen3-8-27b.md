# latentport/LPCombine-Qwen3.8-27b

## Resumen

LPCombine-Qwen3.8-27b es un artefacto publicado por latentport (Simon P. Villani) que no es un modelo de lenguaje completo, sino un adaptador de combinacion de estados de cache para el modelo base Qwen/Qwen3.8-27B. El repositorio contiene un unico tensor `model.safetensors` con el peso y el sesgo en FP32 de un readout entrenado (10.490.880 parametros) que permite fusionar dos estados de contexto (KV cache) previamente prellenados en uno nuevo, resumible y consultable. La operacion respeta el orden izquierda-derecha y conserva ambos snapshots originales.

El problema que resuelve es la combinacion de contextos en inferencia: en lugar de concatenar texto y volver a prellenar, LPCombine continua la cache izquierda con el contexto representado por la cache derecha y devuelve un estado nuevo. El metodo NF4 cache-only usa el readout entrenado sobre las claves y valores de la capa 3 para proponer tokens del lado derecho, que Qwen verifica contra la cache derecha antes de anadirlos al estado izquierdo. Alternativamente, el metodo de tokens retenidos reproduce los tokens grabados del lado derecho a traves del backend seleccionado (BF16, NF4 o GGUF).

Es relevante porque aborda un cuello de botella practico en pipelines con multiples contextos (RAG, agentes con memoria compartida, fusion de sesiones) sin requerir reentrenamiento del modelo base. La licencia es Apache-2.0 para el readout y el runtime, mientras que el checkpoint Qwen base y los GGUF externos quedan sujetos a sus terminos upstream. El artefacto fue creado el 18 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Readout lineal (peso + sesgo FP32) sobre claves y valores de la capa 3 de Qwen3.8-27B; no es un transformer independiente |
| Parametros totales | 10.490.880 (solo el readout; el modelo base Qwen3.8-27B se carga por separado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del checkpoint Qwen3.8-27B y de la politica de posiciones configurada) |
| Tipos de cuantizacion | NF4 (cache-only con readout), BF16 (solo tokens retenidos), GGUF Q4_K_M (verificado en smoke test) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (readout y runtime); checkpoint base y GGUF externos sujetos a terminos upstream |
| Formato de pesos | safetensors (FP32), mas `lpcombine.json`, `evaluation.json` y `runtime-validation.json` |

## Arquitectura y entrenamiento

El artefacto no contiene un transformer: es un readout entrenado que opera sobre las claves y valores de la capa 3 del modelo Qwen3.8-27B congelado en NF4. El readout propone tokens del lado derecho a partir de la cache, y Qwen verifica cada candidato contra la cache derecha antes de aceptarlo y anadirlo al estado izquierdo. El metodo alternativo, tokens retenidos, no usa el readout: reproduce los tokens grabados del lado derecho a traves del backend seleccionado (BF16, NF4 o GGUF), por lo que su fidelidad depende de la grabacion previa de IDs de token (`model.live(retain_replay=True)`).

El readout se entreno sobre 18.432 tokens sinteticos con Qwen congelado en NF4 sobre una NVIDIA L40S. La combinacion requiere que ambas entradas sean context-ready y compartan modelo, pesos, tokenizer, backend, ABI de estado y politica de posiciones. La version minima del runtime es `latentport>=0.4.8`. El repositorio incluye `lpcombine.json` con la revision del readout, su SHA-256 y el modelo base, ademas de los ficheros de evaluacion y validacion de release.

## Capacidades

- Combinacion de estados de cache: fusiona dos contextos prellenados (izquierda y derecha) en un estado nuevo y resumible, conservando ambos snapshots.
- Metodo cache-only en NF4: usa el readout entrenado para proponer tokens del lado derecho, con verificacion por parte de Qwen.
- Metodo de tokens retenidos: reproduce tokens grabados del lado derecho en BF16, NF4 y GGUF.
- Soporte multi-backend: BF16, NF4 y GGUF (este ultimo mediante el runtime nativo de LatentPort y un fichero local compatible).
- API de sesion: `model.combine(left, right)`, `session.combine(right)` y CLI `latentport combine`.
- Solo caches de texto: el readout entrenado no cubre otros tipos de cache.
- No incorpora generacion, razonamiento, codigo ni capacidades multilingues propias; estas dependen integramente del checkpoint Qwen3.8-27B subyacente.

## Casos de uso

- Fusion de contextos en RAG multi-fuente: prellenar por separado el contexto de cada documento y combinar los estados antes de la consulta, evitando re-prellenar la concatenacion completa y reduciendo el coste de atencion sobre el prefijo.
- Memoria compartida entre agentes: cada agente mantiene su propio estado de contexto y se combinan en una sesion comun para responder consultas que requieren informacion de varios agentes, manteniendo los snapshots individuales disponibles.
- Reanudacion de sesiones largas: guardar estados intermedios y combinarlos con nuevos contextos capturados despues, sin reconstruir la conversacion completa desde cero.
- Pipelines de evaluacion con contextos sinteticos: generar contextos controlados (por ejemplo, pares pregunta-respuesta separados) y combinarlos para medir recall multi-turno; el autor reporta 72 de 72 ensayos de recall a dos turnos.
- Prototipado de intervenciones de contexto: aplicar combinaciones de tres vias sobre estados existentes para estudiar como afecta la insercion de informacion adicional; el autor reporta coincidencia con append exacto en 122 de 128 intervenciones de tres vias.
- Despliegue en hardware limitado: usar la ruta NF4 o GGUF Q4_K_M para combinar estados en GPUs con VRAM ajustada, manteniendo el checkpoint base en cuantizacion de 4 bits.
- Integracion en herramientas de desarrollo: invocar la CLI `latentport combine` desde scripts de automatizacion para construir estados combinados a partir de estados guardados.

## Benchmarks y rendimiento

Los datos disponibles son los reportados por el autor en la model card, no benchmarks estandar del modelo base.

| Prueba | Resultado |
|---|---|
| Recuperacion de tokens del lado derecho (suite held-out, verificador de investigacion NF4) | 9.504 de 9.504 tokens recuperados |
| Intervenciones de tres vias (coincidencia con append exacto) | 122 de 128 |
| Recall a dos turnos | 72 de 72 |
| Comparativa corta de codigo y matematicas (puente de investigacion) | 1.302 de 1.302 tokens del lado derecho recuperados; coincidencia con completacion nativa en 16 de 16 ensayos de salida concisa |
| HumanEval (ambas rutas) | 6 de 8 casos superados; una generacion alcanzo el limite de salida |
| GSM8K (ambas rutas) | 3 de 8 casos correctos |

Nota: el verificador de investigacion emplea una busqueda mas amplia para tokens raros; el runtime publicado usa un unico readout y rechaza los tokens que no puede verificar. Los detalles completos estan en `evaluation.json` y `runtime-validation.json`.

## Requisitos de hardware

- VRAM: no disponible de forma explicita; depende del checkpoint Qwen3.8-27B y del backend. En NF4 el checkpoint base ocupa aproximadamente 4 bits por parametro, y el readout anade 10,49 M de parametros en FP32 (unos 42 MB).
- GPU recomendadas: el entrenamiento del readout se realizo en una NVIDIA L40S; no se especifican GPU recomendadas para inferencia.
- GPU de consumo: la ruta GGUF Q4_K_M (verificada con el fichero de Bartowski) y la ruta NF4 estan pensadas para reducir requisitos, pero no se publican cifras de VRAM ni modelos concretos de GPU de consumo compatibles.
- Despliegue: runtime `latentport` (extra `nf4`, `bf16` o `gguf`), runtime nativo instalado con `latentport install-native` para GGUF, y CLI `latentport combine`. Requiere una instalacion de PyTorch con CUDA para el runtime de GPU.
- Latencia y throughput: no se publican cifras. La model card advierte que la latencia crece con la longitud del contexto derecho reproducido y que el modo cache-only anade tiempo de verificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPCombine-Qwen3.8-27b | Readout de combinacion de estados sobre Qwen3.8-27B | 10.490.880 (readout) | no disponible | Apache-2.0 | Hugging Face, PyPI, GitHub |
| Qwen/Qwen3.8-27B | Modelo base de lenguaje | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |
| Qwen3.8-27B-GGUF (Bartowski Q4_K_M) | Cuantizacion GGUF del modelo base | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de informacion sobre otras herramientas de combinacion de estados de cache comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La combinacion requiere reproducir el lado derecho; la latencia crece con la longitud de ese contexto y, en modo cache-only, se anade tiempo de verificacion.
- El readout entrenado solo soporta caches de texto.
- Un snapshot derecho compactado necesita tokens retenidos para la reproduccion.
- Cualquier separador deseado debe insertarse antes de la captura del estado; el modelo no lo anade.
- Ambas entradas deben compartir modelo, pesos, tokenizer, backend, ABI de estado y politica de posiciones; estados guardados deben coincidir en posicion y capacidad con los usados en la captura.
- El runtime publicado usa un unico readout y rechaza tokens que no puede verificar, lo que puede diferir de los resultados del verificador de investigacion.
- El rendimiento en HumanEval (6 de 8) y GSM8K (3 de 8) es limitado y no debe extrapolarse al modelo base sin evaluacion propia.
- Licencia: el readout y el runtime son Apache-2.0, pero el checkpoint Qwen base y los GGUF externos estan sujetos a sus terminos upstream; verificar antes de uso comercial.
- No se publican datos sobre sesgos, idiomas soportados ni tasas de alucinacion; el artefacto no genera texto por si mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentport/LPCombine-Qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- GGUF verificado en smoke test: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF/blob/87410e7b9a5c21e6ca70c0c9cc5237de909fe621/Qwen3.8-27B-Q4_K_M.gguf
- Web del proyecto: https://latentport.com
- Codigo fuente: https://github.com/LatentPort/latentport
- Paquete PyPI: https://pypi.org/project/latentport/
- Perfil del autor: https://au.linkedin.com/in/simon-villani
- Ficheros de validacion citados en la model card: `runtime-validation.json` y `evaluation.json` (en el repositorio del modelo)
