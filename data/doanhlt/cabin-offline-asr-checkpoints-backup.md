# doanhlt/cabin-offline-asr-checkpoints-backup

## Resumen

Cabin Offline ASR checkpoints backup es un repositorio de archivo publicado por el usuario doanhlt en Hugging Face. No se trata de un modelo unitario listo para uso, sino de una copia de seguridad de checkpoints de entrenamiento y paquetes on-device generados durante un trabajo de destilación para reconocimiento automatico del habla (ASR) offline denominado "Cabin Offline ASR". El repositorio se creó el 24 de noviembre de 2026, cuando el entrenamiento se pausó por decisión del propietario, y ocupa 30,3 GB.

El contenido se organiza en dos directorios: `non_prod/`, con pesos entrenados solo con datos publicos y de YouTube (ficheros fp32 `best.pt`, `pretrained.pt` de icefall y paquetes sherpa-onnx de distintas rondas), y `gate_pass_prod/`, con pesos cuyo mix de entrenamiento incluyó datos de produccion y que superaron una puerta de validacion pre-registrada (r6p, r7w para vietnamita, en3p para ingles, eu3c para la Union Europea). El autor indica explicitamente que se trata de un archivo y no de un release, y remite a los repositorios `doanhlt/cabin-asr-*` para los modelos documentados y con acceso controlado.

La relevancia de este repositorio es limitada para uso directo: no contiene model card de inferencia, no declara pipeline ni idiomas soportados de forma agregada, y mezcla artefactos de varios modelos base (NVIDIA Parakeet/Nemotron, k2-fsa/zzasdf zipformer-vi, SenseVoice y SpeechBrain ECAPA), cada uno con su propia licencia. Su interes es fundamentalmente de trazabilidad y reproduccion para quien quiera auditar el proceso de destilacion, no como artefacto desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (mezcla de checkpoints de varios modelos base: Parakeet/Nemotron, zipformer-vi, SenseVoice, ECAPA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan pesos fp32 y paquetes sherpa-onnx, sin detallar precisiones) |
| Idiomas soportados | no disponibles a nivel de repositorio; se citan vietnamita (r7w, vi), ingles (en3p) y EU (eu3c) en los pesos de produccion |
| Licencia | cc-by-4.0 para el repositorio, con licencias heredadas de los modelos base (CC-BY-4.0 / NVIDIA, Apache-2.0, FunASR MODEL_LICENSE no comercial, Apache-2.0) |
| Formato de pesos | `best.pt` (fp32), `pretrained.pt` (icefall), paquetes sherpa-onnx; `SHA256SUMS` con sumas de verificacion |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura propia, sino que agrupa checkpoints derivados de varios modelos base. Segun la model card, los pesos de `non_prod/` corresponden a rondas de entrenamiento realizadas exclusivamente con datos publicos y de YouTube, e incluyen tanto los ganadores como los perdedores de cada ronda, en formato fp32 `best.pt` y `pretrained.pt` de icefall, junto con sus paquetes sherpa-onnx. Los pesos de `gate_pass_prod/` son aquellos cuyo mix de entrenamiento incorporó datos de produccion y que superaron una puerta de validacion pre-registrada, y ya estan publicados como releases.

El trabajo se enmarca en un proceso de destilacion para ASR offline ("Cabin Offline ASR distillation work"). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (en ASR no seria el mecanismo habitual). Tampoco se detalla ninguna innovacion tecnica concreta mas alla de la propia destilacion y del empaquetado para sherpa-onnx. El autor afirma que no hay datos de entrenamiento, transcripciones ni audio de produccion en el repositorio, y que los brazos entrenados con datos de produccion que no superaron su puerta de validacion no estan incluidos.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline, segun el nombre y los tags del repositorio (`asr`, `cabin-offline`).
- Empaquetado para despliegue en dispositivo mediante sherpa-onnx, segun los paquetes incluidos en `non_prod/`.
- Cobertura linguistica parcial y no agregada: vietnamita (r7w, vi), ingles (en3p) y EU (eu3c) en los pesos de produccion; el resto no disponible.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo thinking.
- No se documentan capacidades multilingues mas alla de las etiquetas de los brazos citados.

## Casos de uso

- Auditoria y reproduccion de experimentos: el repositorio conserva los checkpoints ganadores y perdedores de cada ronda, lo que permite reconstruir decisiones de seleccion y comparar variantes con `SHA256SUMS` como control de integridad.
- Verificacion de integridad de artefactos: las sumas SHA-256 listadas permiten comprobar que los ficheros descargados coinciden con los originales antes de reutilizarlos en pipelines internos.
- Punto de partida para fine-tuning experimental: los pesos fp32 `best.pt` de `non_prod/` pueden servir como inicializacion en entornos de investigacion que acepten las licencias heredadas de cada modelo base.
- Despliegue en dispositivo de pruebas: los paquetes sherpa-onnx incluidos permiten montar prototipos de ASR offline en hardware limitado, siempre que se respete la licencia del modelo base correspondiente.
- Trazabilidad de cumplimiento: la separacion entre `non_prod/` (solo datos publicos y de YouTube) y `gate_pass_prod/` (con datos de produccion y puerta superada) facilita documentar el origen de cada peso ante revisiones internas o de terceros.
- Referencia para equipos que evaluan migrar a los releases `doanhlt/cabin-asr-*`: el backup permite inspeccionar el historial de versiones antes de solicitar acceso a los modelos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 30,3 GB en total, pero corresponde a la suma de multiples checkpoints, no al peso de un unico modelo desplegable.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no determinada; los paquetes sherpa-onnx sugieren despliegue en dispositivo, pero no se especifican requisitos.
- Opciones de despliegue: sherpa-onnx es la unica via mencionada explicitamente en la model card; no se citan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cabin Offline ASR checkpoints backup (este repo) | no disponible | no disponible | cc-by-4.0 con licencias heredadas | Publico en HF, 0 descargas | Archivo de checkpoints, no release |
| `doanhlt/cabin-asr-*` (releases del mismo autor) | no disponible | no disponible | no disponible | Repositorios gated y documentados | Destino recomendado por el autor para uso real |
| NVIDIA Parakeet / Nemotron (modelos base citados) | no disponible en esta informacion | no disponible | CC-BY-4.0 / NVIDIA | Publicos en HF | Bases de algunos checkpoints del backup |
| k2-fsa / zzasdf zipformer-vi (modelo base citado) | no disponible en esta informacion | no disponible | Apache-2.0 | Publico | Base para vietnamita |

No se dispone de datos de rendimiento ni de parametros de los modelos base en la informacion proporcionada, por lo que la comparativa se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio es un archivo, no un release: el propio autor desaconseja su uso directo y remite a `doanhlt/cabin-asr-*`.
- No hay model card de inferencia, ni pipeline declarado, ni idiomas agregados; cualquier uso requiere inspeccionar cada checkpoint por separado.
- Licencias heterogeneas: conviven CC-BY-4.0/NVIDIA, Apache-2.0 y FunASR MODEL_LICENSE con retencion no comercial (SenseVoice), lo que impide asumir un uso comercial uniforme del contenido.
- Los brazos entrenados con datos de produccion que no superaron su puerta de validacion no estan incluidos, de modo que el backup no representa el espacio completo de experimentos.
- Riesgo de confusion entre `non_prod/` y `gate_pass_prod/`: solo el segundo grupo incorpora datos de produccion y supero validacion; usar el primero en produccion no esta respaldado por el proceso descrito.
- No se documentan sesgos, tasas de alucinacion (transcripcion erronea) ni limitaciones de contexto o idioma; no disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/doanhlt/cabin-offline-asr-checkpoints-backup
- Releases recomendados por el autor: `doanhlt/cabin-asr-*` (no se proporciona URL concreta en la informacion disponible)
- Modelos base citados: NVIDIA Parakeet / Nemotron, k2-fsa / zzasdf zipformer-vi, SenseVoice (FunASR), SpeechBrain ECAPA (sin URLs concretas en la informacion disponible)
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion proporcionada.
