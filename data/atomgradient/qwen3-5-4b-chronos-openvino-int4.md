# AtomGradient/Qwen3.5-4B-Chronos-OpenVINO-INT4

## Resumen

Qwen3.5-4B-Chronos-OpenVINO-INT4 es un paquete de modelo derivado del Qwen3.5-4B de Alibaba, publicado por AtomGradient bajo el marco "Chronos" de aprendizaje continuo en dispositivo. El artefacto se distribuye como IR de OpenVINO cuantizado a INT4, pensado para ejecución en CPU, y esta envuelto en un esquema de proteccion propietario denominado `openvino_int4_fa_rows_v1` que bloquea las filas de salida de atencion completa (full-attention) del modelo original.

El modelo no es un checkpoint autonomo utilizable con herramientas estandar: requiere el runtime propietario Chronos V9 Native Runtime con backend OpenVINO CPU y una licencia de dispositivo valida (`ModelUnlockEnvelope v1`). Sin el kernel de desbloqueo de atencion completa, la inferencia no esta soportada segun el autor. El paquete incluye un mecanismo de restauracion en RAM que, una vez autorizado, recupera de forma exacta (diferencia absoluta maxima de 0.0) los logits del modelo INT4 original en CPU.

Con 3.2 GB de repositorio y licencia Apache-2.0 declarada, el interes practico para desarrolladores es limitado salvo que se opere dentro del ecosistema AtomGradient: la licencia abierta del codigo no elimina la dependencia tecnica del runtime propietario ni de la envoltura de desbloqueo. La informacion publica sobre arquitectura interna, datos de entrenamiento y rendimiento es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (detalles internos no disponibles); empaquetado como IR de OpenVINO con atencion completa protegida |
| Parametros totales | 4B (segun nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (IR de OpenVINO); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con dependencia de runtime propietario Chronos V9 y licencia de dispositivo) |
| Formato de pesos | IR de OpenVINO (INT4); tamano del repo 3.2 GB |

## Arquitectura y entrenamiento

El paquete se describe como un derivado INT4 del Qwen3.5-4B convertido a IR de OpenVINO para CPU. La innovacion declarada no esta en la arquitectura del transformer subyacente, sino en el esquema de empaquetado: las filas de salida de las capas de atencion completa se "co-bloquean" mediante `openvino_int4_fa_rows_v1`, de modo que el modelo solo produce logits correctos cuando el runtime Chronos V9 aplica la des-permutacion autorizada en RAM. Segun el autor, esa restauracion es una biyeccion sin perdida (`max_abs_diff = 0.0`).

No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni procesos de ajuste adicionales. El tag `continual-learning` sugiere un uso previsto de adaptacion continua en dispositivo, pero no se detalla el mecanismo. Tampoco se documenta si el modelo incorpora decodificacion especulativa, atencion lineal u otras optimizaciones mas alla de la cuantizacion INT4 y el backend OpenVINO CPU. La ejecucion en GPU OpenVINO y el cacheado de grafo en disco estan deshabilitados por politica del paquete.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`), heredada del Qwen3.5-4B base.
- Aprendizaje continuo en dispositivo segun el marco Chronos (tag `continual-learning`), sin documentacion tecnica publica del mecanismo.
- Inferencia en CPU mediante OpenVINO con pesos INT4.
- Restauracion exacta de logits tras desbloqueo autorizado (biyeccion sin perdida declarada por el autor).
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue en CPU de bajo consumo dentro del ecosistema AtomGradient: el paquete INT4 de 3.2 GB permite ejecutar un modelo de 4B en servidores sin GPU, siempre que se disponga del runtime Chronos V9 y de la licencia de dispositivo correspondiente.
- Prototipado de aprendizaje continuo en dispositivo: el tag `continual-learning` y el esquema de "neural imprint" apuntan a escenarios de adaptacion local de modelos sin reentrenamiento centralizado, aunque el flujo concreto no esta documentado.
- Evaluacion de esquemas de proteccion de pesos: util para investigadores interesados en tecnicas de bloqueo de filas de atencion y restauracion exacta de logits como mecanismo de control de distribucion.
- Integracion en pipelines OpenVINO existentes: si la organizacion ya usa OpenVINO para inferencia en CPU, el IR INT4 puede encajar en el mismo stack de despliegue, sujeto al desbloqueo del runtime.
- Chat conversacional ligero en entornos air-gapped: al ser un paquete local sin dependencia de API externa, podria usarse en entornos aislados una vez validada la licencia de dispositivo.
- Base para experimentos de cuantizacion INT4 en CPU: el autor declara igualdad bit-exacta con los logits upstream, lo que permite comparar fidelidad de cuantizacion frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo soportado; el paquete esta orientado a CPU con OpenVINO.
- GPU recomendadas: no disponible; la ejecucion en GPU OpenVINO esta deshabilitada por politica del paquete.
- Compatibilidad con GPU de consumo: no soportada segun la informacion publicada (backend CPU exclusivamente).
- Memoria RAM estimada: no disponible; el repositorio ocupa 3.2 GB en INT4, por lo que se requiere al menos esa cantidad mas overhead del runtime.
- Opciones de despliegue: exclusivamente Chronos V9 Native Runtime con backend OpenVINO CPU y `ModelUnlockEnvelope v1` valido. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| AtomGradient/Qwen3.5-4B-Chronos-OpenVINO-INT4 | 4B | no disponible | IR OpenVINO INT4 | Apache-2.0 + runtime propietario | Chronos V9 (propietario) |
| Qwen3.5-4B (upstream) | 4B | no disponible en esta ficha | safetensors | no disponible en esta ficha | Estandar (transformers, vLLM, etc.) |
| Alternativas INT4 para CPU de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con el modelo upstream es la mas relevante: el paquete AtomGradient anade cuantizacion INT4 y proteccion de pesos, pero introduce una dependencia de runtime propietario que el modelo original no tiene. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Dependencia critica de runtime propietario: sin Chronos V9 Native Runtime y una licencia de dispositivo valida, el modelo no es utilizable; la licencia Apache-2.0 no cubre esa dependencia.
- Restriccion de hardware: solo CPU con OpenVINO; GPU y cacheado de grafo en disco deshabilitados por politica.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, lo que impide validar calidad frente al modelo base.
- Idiomas no declarados: no se puede asumir cobertura multilingue sin verificacion.
- Riesgo de alucinacion: inherente a los modelos generativos de 4B; no se documentan mitigaciones especificas.
- Sesgos: no se publica informacion sobre sesgos conocidos ni evaluaciones de seguridad.
- Ambiguedad sobre el aprendizaje continuo: el marco "Chronos" y el "neural imprint" no estan documentados tecnicamente, lo que dificulta evaluar su comportamiento en produccion.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin senales de validacion por parte de la comunidad.
- Trazabilidad de la cuantizacion: la afirmacion de restauracion bit-exacta (`max_abs_diff = 0.0`) procede unicamente del autor y no se ha verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-4B-Chronos-OpenVINO-INT4
- Perfil del autor: https://huggingface.co/AtomGradient
- OpenVINO (Intel): https://github.com/openvinotoolkit/openvino
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
