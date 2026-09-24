# Dyluhn/Qwen3.8-Flash-Next-Uncensored-CED-Projector

## Resumen

Qwen3.8-Flash-Next-Uncensored CED Projector es un conjunto de proyectores lineales publicado por el usuario Dyluhn que acelera la fase de prefill de prompts largos del modelo Qwen3.8-Flash-Next. No es un modelo de lenguaje: son ficheros de pesos auxiliares que solo funcionan si el motor de inferencia implementa el metodo CED (approximate late-layer prefill) descrito por el autor. Con ellos, el prefill de prompts largos pasa a ser entre 1,45 y 1,85 veces mas rapido, dependiendo del split elegido.

El mecanismo aproxima las capas tardias del transformer para todos los tokens del prompt salvo la cola final exacta (minimo 2.048 tokens). Los tokens aproximados nunca generan salida: solo rellenan la cache (K/V, claves del indexer y estado recurrente de las capas GDN) que despues leen la cola exacta y la decodificacion. La decodificacion permanece exacta en todos los casos.

El proyecto es relevante porque ataca un cuello de botella concreto y medible: en el stack de referencia (2× AMD Radeon AI PRO R9700, vLLM 0.26 sobre ROCm), el modelo cuantizado de ~94 GB no cabe en los 64 GB de VRAM y parte de los expertos se sirve desde RAM del host, de modo que reducir el coste del prefill se traduce directamente en throughput. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y las fechas del repo (23 de septiembre de 2026) son anomalas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: proyectores lineales (ridge) que aproximan la entrada de las capas tardias de un transformer hibrido con MoE. El modelo base tiene 48 capas: 36 gated-delta-net (GDN) y 12 de atencion completa con lightning indexer |
| Parametros totales | No disponible para el modelo base. El autor indica que el modelo cuantizado ocupa ~94 GB |
| Parametros activos | No disponible (el modelo base es MoE, ya que el metodo omite capas MoE en los tokens aproximados) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los proyectores se ajustaron unicamente sobre UD-IQ4_XS de la variante Uncensored (abliterated). El modelo base se distribuye en GGUF (ficheros concretos citados en `metadata.json`) |
| Idiomas soportados | No disponible |
| Licencia | other / qwen-community-1.0 |
| Formato de pesos | safetensors (tres proyectores: split12, split16, split24) |
| Autor | Dyluhn |
| Modelo base | orcarouter/Qwen3.8-Flash-Next-Uncensored (relacion: adapter) |
| Tamano del repositorio | 5,5 GB (suma de los tres proyectores: 1,95 + 1,76 + 1,37 GiB) |
| Hardware validado | 2× AMD Radeon AI PRO R9700, tensor parallel 2, ROCm, vLLM 0.26 con overlays R9V |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El artefacto no se entrena con datos de lenguaje: se ajusta un mapa lineal ridge que predice la entrada de cada capa tardia a partir del estado multi-stream de la capa S. Ese estado consta de 4 flujos de hiper-conexion × 2.560 valores = 10.240 valores por token, mas el sesgo. Un segundo mapa predice el estado que lee el drafter MTP. El ajuste se realizo sobre un unico quant, UD-IQ4_XS de la variante Uncensored (abliterated); `metadata.json` documenta los checksums, los parametros del ajuste y los ficheros GGUF exactos empleados.

El procedimiento de prefill con CED es el siguiente. Las capas 0..S-1 se ejecutan de forma exacta sobre todos los tokens del prompt, con S igual a 12, 16 o 24. Para las capas S..47, el proyector estima la entrada de bloque y esas capas solo rellenan sus caches: las GDN actualizan convolucion y estado recurrente, y las de atencion escriben K/V y las claves del indexer; se omiten MoE, la salida de atencion y las actualizaciones residuales. Los ultimos tokens del prompt (cola exacta de al menos 2.048 tokens, redondeada al bloque de cache) y todos los pasos de decodificacion se ejecutan con el modelo completo.

La decision de diseno destacable es predecir la entrada de cada capa en lugar de las K/V directamente: asi los ficheros son mas pequenos y el metodo no depende de los pesos de proyeccion de cache de una cuantizacion concreta. La integracion con vLLM que produjo todas las cifras publicadas esta en la carpeta `code/` del repositorio. Las peticiones CED usan su propio espacio de nombres de cache de prefijo, y una peticion exacta posterior a una CED coincide bit a bit con una ejecucion exacta en frio.

## Capacidades

- Aceleracion de prefill en prompts largos: factor medido de 1,45× (split 24), 1,70× (split 16) y 1,85× (split 12) en prompts de 12.000 tokens o mas.
- Reparto configurable entre velocidad y calidad mediante el parametro S (12, 16 o 24 capas ejecutadas de forma exacta).
- Decodificacion exacta: el autor afirma que activar el proyector no altera la velocidad ni la exactitud del decode.
- Compatibilidad con decodificacion especulativa MTP (4 tokens de borrador en las pruebas), con una perdida de aceptacion de aproximadamente el 10% en la primera respuesta tras un prefill CED.
- Soporte multi-turno y configuracion del tamano de cola exacta por peticion, segun las comprobaciones del autor.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision por si mismo: es un componente de infraestructura.
- Soporte de tool calling, agentes, capacidades multilingues y modos especiales: no disponibles (dependen del modelo base, no documentados en este repositorio ni en la informacion proporcionada).

## Casos de uso

- RAG con contexto largo en produccion: en canalizaciones donde el prompt recuperado supera los 12.000 tokens, el split 16 reduce el coste de prefill un 70% en tiempo (261-285 ms por 1.000 tokens aproximados frente a 512-555 ms exactos). El A/B del autor muestra un salto de 1.868 a 3.018 tokens/s en prompts de ~12.000 tokens.
- Analisis de repositorios de codigo completos: el conjunto de evaluacion incluye prompts de Rust y Python de 7.500 a 19.500 tokens, que es el escenario tipico de revisar un arbol de fuentes entero en una sola peticion. El umbral recomendado de activacion es de 8.192 tokens.
- Procesamiento por lotes de documentacion y prosa larga: el grading cubre tambien documentos y prosa tecnica; para cargas de resumen o extraccion sobre corpus extensos, un prefill 1,7× mas rapido multiplica el numero de documentos procesados por unidad de tiempo.
- Agentes con system prompt extenso y multi-turno: el autor verifico el funcionamiento multi-turno y el ajuste de cola exacta por peticion. En el segundo turno la tasa de aceptacion de MTP vuelve a la normalidad (1,018×), por lo que el impacto en conversaciones encadenadas es limitado.
- Servicio de chat autohospedado con picos de prompt largo: activando CED solo por encima de 8.192 tokens, los prompts cortos (~4.000 tokens) mantienen su rendimiento (1.783 frente a 1.789 tokens/s) y no se paga penalizacion donde no hay ganancia.
- Atencion al cliente con historiales extensos: cuando el historial conversacional mas la base de conocimiento ocupa decenas de miles de tokens, CED evita reejecutar de forma exacta todo el contexto en cada turno manteniendo la decodificacion intacta.
- Evaluacion y grading de contexto largo: el propio metodo se valido con 22 prompts de 7.500 a 19.500 tokens en texto no visto durante el ajuste, lo que lo hace util en canalizaciones de evaluacion que necesitan medir NLL sobre prompts largos a coste reducido.
- Analisis forense o de logs: prompts muy largos formados por concatenacion de trazas, donde el prefijo se aproxima y solo los ultimos 2.048 tokens requieren computo exacto.

## Benchmarks y rendimiento

Datos medidos por el autor sobre 2× AMD Radeon AI PRO R9700 (TP 2), vLLM 0.26 con overlays R9V sobre ROCm, MTP con 4 tokens de borrador, una peticion a la vez y chunks de prefill de 4.096 tokens. El grading uso 22 prompts de 7.500 a 19.500 tokens (Rust, Python, documentacion y prosa) que no formaron parte del ajuste. La metrica de calidad es el cambio en log-verosimilitud negativa (NLL) de los ultimos 512 tokens del prompt, contando solo tokens "novedosos"; la perplejidad es exp(ΔNLL).

| Split | Aceleracion de prefill (mediana, prompts ≥ 12K) | Perplejidad en prompts dependientes de contexto largo | ΔNLL (nats/token, IC 95%) | Ganancia de contexto largo perdida |
|---|---|---|---|---|
| 24 | 1,45× (1,36-1,48, n=9) | ×1,026 | +0,026 ± 0,024 | 9% |
| 16 | 1,70× (1,59-1,77, n=11) | ×1,051 | +0,050 ± 0,037 | 18% |
| 12 | 1,85× (1,74-1,96, n=9) | ×1,084 | +0,081 ± 0,051 | 29% |

Notas de medicion aportadas por el autor: el suelo de ruido de las ejecuciones exactas es de 0,005 nats/token (mediana) entre ordenaciones de prompt; sobre los 22 prompts completos el cambio medio es menor y mas ruidoso (+0,014 / +0,010 / +0,032 nats/token para splits 24 / 16 / 12), porque varios prompts apenas usan su contexto largo. La cola exacta solicitada de 2.048 tokens quedo entre 2.056 y 3.556 tras el redondeo a bloque de cache.

Configuracion de produccion (split 16, modelo compilado y CUDA graphs de decodificacion, CED activo a partir de 8.192 tokens):

| Metrica | Valor |
|---|---|
| Prefill | 1,70× mediana (1,62-1,76, n=6) en prompts de 12.500-19.500 tokens |
| Coste por 1K tokens aproximados | 261-285 ms, frente a 512-555 ms exactos |
| Throughput A/B (prompts ~12K) | 1.868 → 3.018 tokens/s (+61,6%) |
| Throughput en prompts ~4K (bajo umbral) | 1.783 frente a 1.789 tokens/s (sin cambio) |
| MTP, primera respuesta tras prefill CED | 0,895× tokens aceptados por paso (rango 0,778-0,951, n=6) |
| MTP, turno siguiente | 1,018× (n=2) |
| Decode, prompts cortos | 36,17 frente a 36,77 ms/paso (n=6) |
| Decode, contexto ~8K | 38,98 frente a 38,46 ms/paso (n=4) |
| Desglose por chunk (split 16) | 204 ms preparacion de entrada y capas 0-15, 23 ms proyector, 29 ms relleno de cache, 261 ms total |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM del proyector por GPU: 1,95 GiB (split 12), 1,76 GiB (split 16), 1,37 GiB (split 24).
- VRAM del modelo base: el autor indica ~94 GB para el modelo cuantizado, que no cabe en los 64 GB de VRAM de las 2× Radeon AI PRO R9700; parte de los expertos se sirve desde una cache en RAM del host, por lo que las velocidades absolutas reflejan esa circunstancia.
- GPU validadas: 2× AMD Radeon AI PRO R9700 con tensor parallel 2. No hay datos publicados para A100, H100, RTX 4090 ni otras GPU.
- GPU de consumo: no. El proyector es pequeno, pero no sirve sin el modelo base completo y su cache de expertos en RAM.
- Opciones de despliegue: vLLM 0.26 con overlays R9V sobre ROCm. No es compatible con llama.cpp, Ollama ni TGI, ya que el motor debe implementar CED; el autor indica que los ficheros no son un modelo utilizable por si solos.
- Latencia y throughput: prefill de 261-285 ms por 1.000 tokens aproximados (split 16) frente a 512-555 ms exactos; 3.018 tokens/s en prompts de ~12.000 tokens; decodificacion de 36-39 ms por paso segun contexto.
- Almacenamiento: el repositorio ocupa 5,5 GB, de los cuales aproximadamente 5,08 GiB corresponden a los tres proyectores.

## Comparativa con modelos similares

No se dispone de datos sobre modelos o artefactos comparables de otros autores. La comparacion posible es interna, entre los tres proyectores y la ejecucion exacta sin CED, con los datos publicados por el autor:

| Configuracion | Capas exactas | Tamano | Aceleracion de prefill | ΔNLL (nats/token) | Perdida de ganancia de contexto largo |
|---|---|---|---|---|---|
| Split 24 | 0-23 | 1,37 GiB | 1,45× | +0,026 | 9% |
| Split 16 (recomendado) | 0-15 | 1,76 GiB | 1,70× | +0,050 | 18% |
| Split 12 | 0-11 | 1,95 GiB | 1,85× | +0,081 | 29% |
| Sin CED (exacto) | 0-47 | 0 | 1,00× | 0 | 0% |

Comparacion con alternativas externas (otras tecnicas de aceleracion de prefill, otros proyectores de cache, versiones no abliteradas del modelo base): no disponible.

## Limitaciones y advertencias

- No es un modelo: sin un motor de inferencia que implemente CED, los ficheros son inutiles. La integracion de referencia esta en la carpeta `code/` del repositorio.
- Ajuste sobre un unico quant: el proyector se entreno solo con UD-IQ4_XS de la variante Uncensored (abliterated). Otros quants, los pesos originales de Qwen y otros fine-tunes estan sin probar.
- Perdida de calidad demostrada: incremento de perplejidad de hasta ×1,084 y perdida de hasta el 29% de la ganancia aportada por el contexto largo en el split 12. Las cifras de ΔNLL tienen intervalos de confianza que cruzan valores bajos en algunos casos.
- Impacto en decodificacion especulativa: la tasa de aceptacion de MTP cae a 0,895× en la primera respuesta tras un prefill CED.
- Umbral de rentabilidad: por debajo de 8.192 tokens de prompt no hay ganancia, segun las pruebas del autor. En prompts de ~4.000 tokens el throughput fue identico.
- Tokens aproximados sin salida: la precision de los tokens del prompt aproximados no se puede evaluar directamente, solo a traves de la NLL de la cola exacta.
- Contenido sin censura: el modelo base es una variante "uncensored" / abliterated, sin filtros de seguridad documentados. El desplegador asume la responsabilidad del contenido generado.
- Alcance de hardware muy limitado: solo validado en ROCm con 2× Radeon AI PRO R9700 y vLLM 0.26 con overlays R9V. No hay datos de CUDA, de otras GPU ni de otras versiones de vLLM.
- Coste de infraestructura elevado: el modelo base (~94 GB cuantizado) exige cache de expertos en RAM del host, lo que condiciona latencia y throughput absolutos.
- Licencia: qwen-community-1.0 (declarada como `other`). No se detallan en la informacion disponible las condiciones de uso comercial, redistribucion ni los requisitos de atribucion; hay que consultar el fichero LICENSE del repositorio.
- Idiomas, longitud de contexto, parametros totales y activos: no disponibles en la informacion proporcionada.
- Adopcion nula y metadatos anomalos: 0 descargas, 1 like, y fechas de creacion y actualizacion del repositorio (23 de septiembre de 2026) posteriores a la fecha de consulta, lo que impide verificar su historial real.
- La busqueda web realizada no devolvio ningun resultado tecnico relevante: los enlaces obtenidos no guardan relacion con el modelo ni con inteligencia artificial.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Dyluhn/Qwen3.8-Flash-Next-Uncensored-CED-Projector
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Licencia: LICENSE (fichero dentro del repositorio)
- Integracion con vLLM y ajuste: carpeta `code/` del repositorio
- Parametros del ajuste y checksums: `metadata.json` del repositorio
- Enlaces adicionales (paper, blog, demo, repositorio de codigo independiente): no disponible; la busqueda web no arrojo resultados relevantes.
