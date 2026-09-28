# haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated

## Resumen

Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated es una reempaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, un MoE de 48 capas con 512 expertos y enrutamiento top-8. El autor (haihengh) no entrena ni afina el modelo: toma el snapshot ya "abliterated" publicado por windowsxp811203 (al que se le ha eliminado la direccion de rechazo de los pesos) y lo recodifica con FinchMoE en el formato `.finch`, pensado para inferencia con streaming desde SSD en Apple Silicon con memoria limitada.

El resultado ocupa 96,9 GiB en disco (frente a los ~360 GB en BF16) gracias a una cuantizacion selectiva: int4 affine con grupo 64 para expertos enrutados, experto compartido, atencion y embeddings; int8 con grupo 64 para las proyecciones de atencion lineal y el router; e int4 con grupo 32 para la tabla PLE de n-gramas. La motivacion es ejecutar un modelo de 125B en equipos con 16 GB de RAM unificada, dejando que expertos y tabla PLE se transmitan por token desde un SSD externo.

Su relevancia es doble: por un lado demuestra que un MoE muy disperso (512 expertos, top-8) se puede servir en hardware de consumo extremo aceptando un throughput bajo; por otro, ofrece una variante sin direccion de rechazo con una medicion concreta de que la capacidad de codigo no se degrada de forma apreciable respecto a los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 48 capas con 512 expertos enrutados (top-8), atencion lineal, hyper-connections y tabla PLE de n-gramas |
| Parametros totales | 125B (denominacion del modelo; no se detalla el desglose) |
| Parametros activos | no disponible (el modelo activa top-8 de 512 expertos por token) |
| Longitud de contexto | no disponible (la evaluacion publicada se hizo con 4096 tokens) |
| Tipos de cuantizacion | int4 affine grupo 64 (expertos enrutados, experto compartido, atencion, embeddings); int8 grupo 64 (proyecciones de atencion lineal, router); int4 grupo 32 (tabla PLE de n-gramas) |
| Idiomas soportados | en |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | `.finch` (formato propio de FinchMoE; no es GGUF, MLX ni safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 48 capas con 512 expertos por capa y enrutamiento top-8, complementado con atencion lineal, hyper-connections, capas de normalizacion y una tabla PLE (n-gram table) que tambien ha sido cuantizada. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: esos datos corresponden al modelo base Qwen/Qwen3.8-Flash-Next y no se reproducen aqui.

La innovacion tecnica de este repositorio es el reempaquetado con FinchMoERepack: cada tensor se clasifica en una ranura de cuantizacion distinta, y cada fila de la tabla PLE se dispone con zancada fija como `[nibbles empaquetados][escalas BF16][sesgos BF16]`, de modo que un unico `pread` recupera todo el estado cuantizado de la fila y el decodificador deduce el tamano de grupo a partir de la propia fila. No hay reentrenamiento, fine-tuning ni nueva ablacion: el snapshot de origen se toma tal cual y solo se recodifica.

Sobre la ablacion: la eliminacion de la direccion de rechazo la realiza el proyecto upstream, no este repositorio, y los scripts y metadatos que documentan que tensores se modificaron viajan con la release original (`apply_ablation_flashnext.py`, `capture_refusal_flashnext.py`, `verify_ablit_flashnext.py`, `ABLIT_META.json`).

## Capacidades

- Generacion de texto y codigo: la unica capacidad medida es la resolucion de problemas de programacion (EvalPlus HumanEval), con un pass@1 de 0,9451 sobre los pesos base y 0,9451 en este build.
- Comportamiento "abliterated": la direccion de rechazo ha sido eliminada de los pesos, por lo que cabe esperar sustancialmente menos rechazos que en el modelo base. El autor advierte explicitamente de que el comportamiento de rechazo no se ha medido.
- Inferencia con streaming desde SSD: los tensores de expertos y de la tabla PLE se transmiten por token, lo que permite ejecutar el modelo con memoria residente muy inferior al tamano de los pesos.
- Servidor compatible con OpenAI: FinchMoEServer expone una API con puerto configurable.
- Capacidades multilingues: limitadas al ingles (`language: [en]`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo asistida en local sobre Apple Silicon: con 0,9451 de pass@1 en HumanEval y un fallo real de solo 2 problemas sobre 164, es adecuado para completar funciones y resolver tareas de programacion sin depender de servicios en la nube.
- Servidor de codigo compatible con OpenAI para equipos pequenos: mediante `FinchMoEServer --port 8080` se puede levantar un endpoint local que consuma herramientas existentes que hablen el protocolo de OpenAI, aceptando el coste de ~2,5 tok/s.
- Investigacion sobre ablacion de direccion de rechazo: util para estudiar si la eliminacion de la direccion de rechazo degrada capacidades instrumentadas, con un caso controlado que compara pesos base y pesos abliterated bajo el mismo harness.
- Evaluacion de cuantizacion extrema en MoE: sirve como banco de pruebas de esquemas mixtos (int4/int8 por clase de tensor) y de su impacto sobre tareas de codigo.
- Prototipado de inferencia con streaming desde disco: permite medir latencia y throughput cuando el cuello de botella es el ancho de banda del SSD y no la VRAM.
- Experimentacion con MoE de grano fino: el modelo activa top-8 de 512 expertos, lo que lo hace interesante para estudiar enrutamiento disperso en hardware de consumo.
- Despliegue en entornos con restricciones de memoria unificada: con 16 GB de RAM y un SSD externo, el modelo es ejecutable alli donde un 125B denso no cabria.

## Benchmarks y rendimiento

EvalPlus HumanEval, decodificacion greedy, 164 problemas, protocolo de servidor congelado del proyecto, medido el 2026-09-27. Las dos filas se diferencian unicamente en los pesos: mismo motor, mismo harness, misma configuracion de cuantizacion y mismo contexto (4096, presupuesto de 768 tokens por problema).

| Modelo | pass@1 | HumanEval+ |
|---|---|---|
| Qwen3.8-Flash-Next-125B (pesos base) | 0,9451 (155/164) | 0,9207 (151/164) |
| Este build abliterated | 0,9451 (155/164) | 0,9268 (152/164) |

De los 9 problemas fallidos, 7 estan limitados por el presupuesto de 768 tokens (HumanEval/32, 93, 113, 116, 129, 130, 132) y solo 2 son fallos genuinos (145 y 163), que tambien fallan con los pesos base. Rendimiento de inferencia declarado: ~19 tok/s en procesamiento de prompt y ~2,5 tok/s en generacion sobre un Mac mini M4 de 16 GB con el modelo en un SSD externo.

## Requisitos de hardware

- Almacenamiento: 96,9 GiB de instalacion (`model_weights.bin` 3,9 GB, `packed_experts/` 68,1 GB, `ple_shards/` 32,0 GB, mas manifest, tokenizer y recibo de instalacion). La verificacion estricta de primera carga recorre aproximadamente 167 GB de archivos segun la model card.
- Memoria: ejecutable en un Mac mini M4 con 16 GB de RAM unificada; la memoria residente esta dominada por la cache KV y los buffers de trabajo, no por los pesos.
- GPU: requiere Apple Silicon con Metal. No hay soporte documentado para GPU NVIDIA (A100, H100, RTX 4090) ni AMD: no disponible.
- Cabe en GPU de consumo: no disponible (esta pensado para streaming desde SSD en Apple Silicon, no para carga completa en VRAM).
- Opciones de despliegue: exclusivamente FinchMoE (binario `FinchMoECLI` o `FinchMoEServer`). No carga en llama.cpp, MLX, transformers, vLLM, Ollama ni TGI.
- Latencia y throughput: ~19 tok/s de procesamiento de prompt y ~2,5 tok/s de generacion en M4 de 16 GB con SSD externo. La verificacion de integridad se puede omitir con `--verify trusted-install`, que evita el primer hash SHA-256 completo (aproximadamente un minuto en la primera carga).
- Dependencia del disco: al transmitirse expertos y tabla PLE por token, el rendimiento depende del ancho de banda del SSD que aloja la instalacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | HumanEval+ | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|---|
| Este build (FinchMoE 4-bit PLE4bit, abliterated) | 125B MoE, top-8 de 512 | no disponible (evaluado a 4096) | 0,9451 | 0,9268 | Qwen Community License 1.0 | `.finch`, solo FinchMoE |
| Qwen/Qwen3.8-Flash-Next (base) | 125B MoE, top-8 de 512 | no disponible (evaluado a 4096) | 0,9451 | 0,9207 | Qwen Community License 1.0 | pesos originales, compatible con el stack habitual del modelo base |
| windowsxp811203/Qwen3.8-Flash-Next-Abliterated | 125B MoE, top-8 de 512 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas mas alla del modelo base, por lo que la comparacion se limita a los dos puntos de referencia citados por el propio autor.

## Limitaciones y advertencias

- Modelo abliterated: la direccion de rechazo ha sido eliminada de los pesos, por lo que previsiblemente producira menos negativas ante peticiones problematicas. El autor declara que el comportamiento de rechazo no se ha medido en este repositorio y que nada aqui fue evaluado por lo que aceptara o dejara de aceptar.
- Riesgo de contenido nocivo: al no existir evaluacion de seguridad publicada, no hay garantia de filtrado ante usos indebidos.
- Alucinacion: no se aportan metricas de veracidad; la unica medicion es de codigo, un dominio con verificacion automatica.
- Idioma: el modelo esta etiquetado unicamente como ingles; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de contexto del modelo no se documenta y la evaluacion se hizo a 4096 tokens; ademas, 7 de los 9 fallos de HumanEval se atribuyen al presupuesto de 768 tokens, lo que apunta a que truncamientos de generacion afectan al resultado.
- Compatibilidad: el formato `.finch` es especifico de FinchMoE y no carga en llama.cpp, MLX, transformers, vLLM, Ollama ni TGI. Migrar a otro runtime exigiria reconvertir el modelo.
- Hardware: no hay soporte documentado para GPU NVIDIA o AMD; el unico escenario validado es Apple Silicon con SSD externo.
- Rendimiento: ~2,5 tok/s de generacion limita el uso interactivo en tiempo real y hace poco practico el procesamiento de grandes volumenes.
- Adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Licencia: Qwen Community License 1.0, etiquetada como `other`. Hay que revisar sus condiciones antes de un uso comercial, especialmente por las clausulas de redistribucion y obras derivadas.
- Integridad: los hashes publicados distinguen `sourceSnapshotHash` (identico al de la release base, porque cubre el indice de tensores) del hash de `model_weights.bin` (`6af82b557d8207e470f50c1fba5dbb14e7ff4b48139a5b0b2e4f8ac56d188acb`), que es el que realmente difiere. Confundirlos lleva a comparaciones erroneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated
- Repositorio FinchMoE: https://github.com/haihengh/finchMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Snapshot abliterated upstream: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated
- Licencia (fichero LICENSE): https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated/blob/main/LICENSE
- Texto de la Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next (referenciada desde el modelo base; enlace directo no disponible)
