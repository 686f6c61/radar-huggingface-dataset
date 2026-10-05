# AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-CUDA-AXQ-NVFP4-MTP

## Resumen

AX-Nemotron-3.5-Lightning-30B-A3B-CUDA-AXQ-NVFP4-MTP es un checkpoint de desarrollo publicado por AutomatosX que contiene una cuantizacion NVFP4A16 del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B en su variante BF16. No es un modelo entrenado desde cero: se trata de una exportacion cuantizada del modelo base de NVIDIA, serializada con el backend `numpy-reference` de AXQuant mediante cuantizacion RTN (round-to-nearest), sin AWQ ni cuantizadores de terceros.

El modelo conserva la arquitectura del origen, Nemotron-H, una familia hibrida que combina capas Mamba (modelos de espacio de estados) con atencion y mezcla de expertos (MoE). El repositorio declara 32.913.266.240 parametros en safetensors y un tamano de 23,6 GB, coherente con pesos de 4 bits en las matrices de expertos y capas MLP, mientras que embeddings, cabecera de salida, normalizaciones, routers, estado de Mamba, proyecciones de atencion, expertos compartidos y los tensores MTP se mantienen en la precision del origen (BF16).

Su relevancia actual es acotada y muy tecnica: sirve como evidencia de formato para el ecosistema NVFP4 y como artefacto de inspeccion reproducible (incluye plan AXQuant, manifiesto e inventario SHA256). El propio autor advierte de que la serializacion en CPU es solo una prueba de formato, que no certifica ejecucion en GPU, calidad ni rendimiento, y que la compatibilidad de los pesos MTP con runtimes reales no esta verificada. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (hibrido Mamba-Transformer con mezcla de expertos, MoE) |
| Parametros totales | 32.913.266.240 (~32,9 mil millones), dato real de safetensors |
| Parametros activos | ~3 mil millones segun la nomenclatura A3B del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16: pesos E2M1 en bloques de 16 elementos, escalas de bloque E4M3FN, escalas globales inversas en FP32, activaciones en BF16; los tags del repositorio incluyen la etiqueta "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (campo `license: other` en la model card) |
| Formato de pesos | safetensors sobre compressed-tensors (NVFP4) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (commit `a9904d24bcc1d289a1950fa9d2b978c47cf903b9`) |
| Tamano del repositorio | 23,6 GB |
| Backend de serializacion | AXQuant, `numpy-reference` |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Nemotron-H, un diseno hibrido que intercala capas de espacio de estados (Mamba) con capas de atencion y bloques de mezcla de expertos. La model card confirma de forma indirecta la presencia de MoE al mencionar routers, expertos compartidos y matrices de expertos de texto entre los componentes afectados por la cuantizacion. Los tensores `mtp.*` integrados corresponden a prediccion multi-token (MTP), un mecanismo que en la practica se emplea para decodificacion especulativa; el autor indica que esos pesos se empaquetan tal cual, pero que su compatibilidad con runtimes concretos no esta verificada.

No hay informacion sobre el proceso de entrenamiento: no se detallan volumen de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones de entrenamiento, mas alla de lo heredado del modelo base de NVIDIA. Lo que si se documenta con precision es el proceso de cuantizacion: se aplica NVFP4 unicamente a las matrices elegibles de expertos de texto y MLP, y se preserva la precision de origen en embeddings, cabecera de salida, normalizaciones, routers, estado de Mamba, proyecciones de atencion, expertos compartidos, proyecciones latentes y todos los tensores `mtp.*`. El fichero `axquant_nemotron_release.json` registra comprobaciones de preservacion de bytes para cada tensor MTP, y el repositorio incluye plan, manifiesto e inventario SHA256 para inspeccion reproducible del artefacto.

## Capacidades

- Generacion de texto conversacional: el repositorio declara la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base; no se aportan evidencias ni evaluaciones especificas en el checkpoint cuantizado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; los tensores MTP apuntan a decodificacion especulativa, no a un modo agente documentado.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Capacidad especial: prediccion multi-token (MTP) empaquetada en los pesos, con compatibilidad de runtime explicitamente no verificada por el autor.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo API, sin garantia de ejecucion aportada por el autor.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Servicio de inferencia en GPU Blackwell con cuantizacion nativa: al emplear NVFP4 con bloques de 16 elementos y escalas E4M3FN, el checkpoint esta pensado para runtimes CUDA que aprovechen las unidades FP4 de las GPU de generacion Blackwell, reduciendo el peso de memoria frente a la variante BF16 del mismo modelo.
- Decodificacion especulativa con MTP: si el runtime soporta el layout integrado de tensores `mtp.*`, estos pueden usarse como cabezas de prediccion multi-token para proponer varios tokens por paso y acelerar la generacion. Cualquier ganancia real debe medirse, porque el autor no certifica throughput.
- Evaluacion de degradacion por cuantizacion: el checkpoint sirve para comparar la salida del modelo base BF16 con la version NVFP4 sobre los mismos prompts, aislando el efecto de la cuantizacion RTN en un rango controlado de capas.
- Despliegue de un MoE de ~33B con coste de computo bajo: al activar aproximadamente 3.000 millones de parametros por token (segun la nomenclatura A3B), el modelo resulta atractivo para servir cargas concurrentes en una sola GPU con memoria suficiente, siempre que el runtime soporte Nemotron-H.
- Auditoria de artefactos de cuantizacion: el inventario SHA256, el plan AXQuant y el manifiesto permiten verificar la integridad de cada tensor y reproducir la cadena de serializacion en entornos de investigacion sobre compresion de pesos.
- Base para pipelines de generacion de texto en lote: tareas de resumen, reescritura o clasificacion generativa sobre grandes volumenes de texto, donde el menor peso de memoria del formato NVFP4 permite mayor grado de batching en el mismo hardware.
- Prototipado de asistentes conversacionales multi-turno: el modelo conserva la naturaleza conversacional del origen, aunque la longitud de contexto efectiva no esta documentada en esta ficha y debe validarse contra la configuracion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco aporta cifras de latencia o throughput. Cualquier comparacion numerica con el modelo base BF16 exigiria ejecutar evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia derivada del tamano del repositorio (23,6 GB de pesos), se necesita un minimo en torno a 24 GB solo para pesos, mas cache KV y buffers de activacion, lo que en la practica apunta a 32 GB o mas para contexto no trivial.
- GPU recomendadas: GPU Blackwell (B200, RTX PRO 6000 Blackwell, RTX 5090) para aprovechar de forma nativa NVFP4; A100 o H100 de 80 GB como opcion de margen amplio, asumiendo que el runtime soporte el formato sin aceleracion FP4 nativa.
- GPU de consumo: encaja con dificultad en 24 GB (RTX 4090, RTX 3090) por el tamano de los pesos; puede requerir offload parcial de tensores no cuantizados o contexto muy corto. La RTX 5090 con 32 GB es la candidata mas realista dentro del segmento de consumo.
- Opciones de despliegue: el autor exige que el consumidor soporte Nemotron-H, compressed-tensors NVFP4A16 y el layout MTP integrado. Los tags mencionan `transformers` y `endpoints_compatible`, y el formato compressed-tensors es el que emplean runtimes como vLLM o TGI, pero no se certifica ningun runtime concreto.
- Latencia y throughput: no disponibles. El autor declara explicitamente que la serializacion en CPU es solo evidencia de formato y que no establece ejecucion ni velocidad en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Nemotron-3.5-Lightning-30B-A3B-CUDA-AXQ-NVFP4-MTP | 32,9 mil millones | NVFP4A16 (pesos), BF16 (activaciones) | no disponible | openmdw-1.1 | HuggingFace, repositorio de 23,6 GB, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | no disponible en esta busqueda | BF16 | no disponible | no disponible en esta busqueda | HuggingFace (modelo base declarado) |

No se dispone de datos verificables en la informacion proporcionada sobre otras alternativas de la misma categoria (MoE de ~30B con ~3B parametros activos), por lo que la comparativa se limita al modelo base del que deriva este checkpoint. Los resultados de la busqueda web realizada no aportan informacion tecnica sobre modelos comparables.

## Limitaciones y advertencias

- Checkpoint de desarrollo: el autor lo etiqueta explicitamente como `development checkpoint` y no emite certificado de calidad, rendimiento ni throughput.
- Compatibilidad de runtime no verificada: ejecutar el modelo exige soporte simultaneo de Nemotron-H, compressed-tensors NVFP4A16 y el layout MTP del origen; ningun runtime esta certificado.
- Pesos MTP sin garantia: se empaquetan los tensores entrenados de prediccion multi-token, pero su funcionamiento en inferencia no esta comprobado. No deben asumirse ganancias de velocidad.
- Sin evidencia de ejecucion en GPU: la serializacion se realizo en CPU con un backend de referencia, lo que constituye evidencia de formato, no de rendimiento.
- Riesgo de degradacion por cuantizacion: la cuantizacion RTN de pesos a 4 bits puede afectar a tareas sensibles a la precision. Al conservarse embeddings, cabecera, routers, atencion y expertos compartidos en BF16, el impacto deberia ser menor que en una cuantizacion global, pero no hay mediciones publicadas.
- Sesgos conocidos: no disponible. Al ser una derivacion del modelo base de NVIDIA, hereda los sesgos de este, no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas y contexto: la lista de idiomas y la longitud de contexto no estan declaradas en el repositorio.
- Licencia: openmdw-1.1 declarada en el campo `license_name`, con `license: other` en la model card. Es una licencia especifica de pesos de modelo, no una licencia de software estandar; antes de un uso comercial conviene revisar el texto completo en el enlace indicado y confirmar las obligaciones de atribucion y las condiciones heredadas del modelo base de NVIDIA.
- Repositorio sin traccion: 0 descargas y 0 interacciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar la perdida de calidad frente a la variante BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-CUDA-AXQ-NVFP4-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
