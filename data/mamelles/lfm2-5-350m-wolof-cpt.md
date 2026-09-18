# mamelles/LFM2.5-350M-Wolof-CPT

## Resumen

LFM2.5-350M-Wolof-CPT es un artefacto de ajuste publicado en HuggingFace por el usuario `mamelles`, consistente en un entrenamiento continuado (CPT, *continual pretraining*) del modelo base `LiquidAI/LFM2.5-350M-Base` sobre un corpus de wolof. El modelo tiene 357.416.704 parametros reales (segun los pesos en safetensors), ocupa 0,7 GB en el repositorio y se distribuye exclusivamente en formato safetensors para la libreria `transformers`, con pipeline de `text-generation`.

El propio autor lo describe como un "artefacto de produccion privado, experimental y no publicado publicamente", sin reclamaciones de calidad mas alla de las puertas automaticas registradas en su `training_manifest.json`. Esto lo situa en la categoria de adaptaciones linguisticas de investigacion para una lengua de bajos recursos (wolof), no en la de un modelo listo para produccion abierta. No declara licencia, idiomas soportados ni resultados de benchmarks en los metadatos disponibles.

Su relevancia actual es doble: por un lado, demuestra la viabilidad de adaptar modelos densos de menos de 400 M de parametros a lenguas africanas de bajos recursos mediante CPT; por otro, sirve como ejemplo de practica de documentacion cautelosa (metricas solo si han sido medidas, advertencia explicita sobre la necesidad de revision por hablantes nativos). La arquitectura subyacente pertenece a la familia LFM2 de Liquid AI; no obstante, los detalles de contexto, licencia y composicion del dataset no se especifican en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 de Liquid AI (hereda la arquitectura del base `LiquidAI/LFM2.5-350M-Base`); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 357.416.704 (dato real de los safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos sin cuantizar en safetensors (0,7 GB). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | adaptado a wolof segun el nombre del modelo y la model card; no se declara lista oficial de idiomas en los metadatos |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `LiquidAI/LFM2.5-350M-Base`, de la familia LFM2 de Liquid AI. Todos los detalles arquitectonicos concretos (tipo de bloques, atencion, atencion linear, contexto nativo, diseno del tokenizador) no estan disponibles en la informacion proporcionada; la model card unicamente especifica que el tokenizador pertenece a la familia `65k-ext`, y advierte explicitamente de que las metricas BPB no deben compararse como perplejidad entre las familias de tokenizador de 65k y 128k, porque no son comparables.

El entrenamiento consiste en un CPT (entrenamiento continuado sobre el modelo base ya preentrenado), realizado con el "protocolo de corpus de wolof limpiado" (*cleaned Wolof corpus protocol*). Segun la model card, los datos de instruccion se reponderan y excluyen el split de test de origen del Hub, pero se admite que ejemplos similares a los de los benchmarks pueden haber estado presentes en el preentrenamiento previo del modelo base. Las filas crudas del corpus privado no se incluyen en el repositorio. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor afirma que el artefacto paso las puertas automaticas registradas en `training_manifest.json` y que solo se incluyen salidas realmente medidas en `metrics.json`; la ausencia de una metrica implica que no se midio, y no debe inferirse.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y entre los tags figura `conversational`, por lo que esta preparado para continuar texto y mantener turnos de dialogo.
- Adaptacion linguistica al wolof: es el objetivo explicito del CPT, aunque el autor no cuantifica el grado de mejora ni aporta evaluaciones.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace.
- Integracion con el ecosistema `transformers`: pesos en safetensors cargables directamente con la libreria, sin pasos de conversion adicionales.
- Capacidades de instruccion generica: la model card menciona el uso de datos de instruccion reponderados, aunque no detalla el formato ni la cobertura.
- No se documentan capacidades de razonamiento explicito (*thinking mode*), uso de herramientas (*tool calling*), agentes, vision, audio, ni codigo o matematicas de forma especifica.
- Cobertura multilingue: no disponible; el unico idioma identificable es el wolof.

## Casos de uso

- Investigacion academica en procesamiento de lenguas africanas: el modelo sirve como punto de partida reproducible para medir el efecto del CPT sobre wolof partiendo de un base de 350 M de parametros, comparando contra `LiquidAI/LFM2.5-350M-Base` sin ajustar.
- Evaluacion de protocolos de limpieza de corpus: dado que el autor documenta un "protocolo de corpus de wolof limpiado", el artefacto es util para auditar como afecta dicho protocolo a metricas BPB y de generacion en una lengua de bajos recursos.
- Generacion asistida de texto en wolof con revision humana: puede usarse como borrador para traduccion, redaccion o normalizacion ortografica, siempre que un hablante nativo revise la salida, tal como exige la propia model card.
- Prototipado de asistentes conversacionales en wolof: al ser un modelo de 357 M de parametros, puede desplegarse en un servidor modesto o incluso en local para validar flujos de dialogo antes de invertir en modelos mayores.
- Despliegue en el borde (*edge*) y en dispositivos sin GPU: con 0,7 GB en safetensors en precision nativa, cabe en moviles, SBC y portatiles sin GPU dedicada una vez convertido a cuantizaciones de 4 u 8 bits por el propio usuario.
- Creacion de datos sinteticos para ampliar corpus de wolof: puede generar texto de forma masiva y barata para aumentar el material de entrenamiento de modelos mayores, filtrando despues con revisores humanos.
- Experimentos de comparacion de tokenizadores: el aviso sobre las familias `65k-ext` frente a 128k lo convierte en un caso de estudio para investigar el impacto del tokenizador en la evaluacion de lenguas con ortografia no latina estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que solo los resultados realmente medidos se incluyen en `metrics.json`, y que la ausencia de una metrica no debe interpretarse como un valor; no se proporciona ningun dato de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de wolof.

## Requisitos de hardware

- VRAM estimada en precision nativa (FP16/BF16): 357,4 M de parametros x 2 bytes ≈ 0,71 GB de pesos, mas cache KV y activaciones; en la practica, entre 1,5 y 2,5 GB de VRAM para contextos moderados.
- VRAM estimada en INT8: ≈ 0,36 GB de pesos.
- VRAM estimada en INT4 (4 bits): ≈ 0,18-0,25 GB de pesos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 3060, GTX 1650, e incluso integradas con memoria compartida). Tambien es viable en CPU y en dispositivos moviles.
- GPU profesionales para despliegue a gran escala: A100, H100 o L40S permitirian servir muchas replicas o un *batching* muy alto por GPU, dado el reducido tamano del modelo.
- Opciones de despliegue: `transformers` de forma nativa (formato publicado); vLLM o TGI para servido con *batching* continuo; `llama.cpp` u Ollama requeriria una conversion previa a GGUF, que el autor no ha publicado; tambien es candidato a exportacion a ONNX, ExecuTorch o Core ML para *edge*.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mamelles/LFM2.5-350M-Wolof-CPT | 357.416.704 | no disponible | no disponible | publico en HuggingFace (0 descargas, 0 likes) | CPT sobre wolof, marcado como experimental y de uso privado |
| LiquidAI/LFM2.5-350M-Base | no disponible en la informacion proporcionada | no disponible | no disponible | publico en HuggingFace | modelo base sin adaptacion a wolof |
| Otras adaptaciones de wolof de ~350 M | no disponible | no disponible | no disponible | no disponible | no se ha identificado un comparable directo en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo declara "ongoing/experimental and not a public release", sin reclamaciones de calidad mas alla de las puertas automaticas registradas.
- Validacion incompleta: la model card indica que no se han validado de forma exhaustiva la ortografia del wolof, el *code-switching*, la factualidad, el razonamiento, el comportamiento en contexto largo ni la seguridad.
- Revision por hablantes nativos necesaria: el autor exige explicitamente revision nativa antes de cualquier uso mas amplio.
- Riesgo de contaminacion de benchmarks: se admite que pueden haber existido ejemplos similares a los de los benchmarks en el preentrenamiento previo del modelo base, lo que invalida comparaciones limpias con esos conjuntos de evaluacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, y previsiblemente alto dado el reducido tamano del modelo (357 M) y la escasez de datos de wolof.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial; en ausencia de terminos explicitos, el uso comercial queda en un limbo legal.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de representatividad del corpus de wolof utilizado.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada y no se declara una lista oficial de idiomas soportados, por lo que el comportamiento fuera del wolof es impredecible.
- Reproducibilidad parcial: las filas crudas del corpus privado no se publican, y el aviso sobre la familia de tokenizador `65k-ext` impide comparar directamente BPB o perplejidad con modelos de la familia de 128k.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en la fecha de creacion, por lo que no existe comunidad que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-350M-Wolof-CPT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- `training_manifest.json` y `metrics.json`: referenciados en la model card, no enlazados explicitamente en la informacion proporcionada
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (contenido sobre el navegador Google Chrome y extensiones del Chrome Web Store), por lo que no aportan enlaces utiles adicionales.
