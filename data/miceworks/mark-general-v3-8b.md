# miceworks/Mark-General-V3-8B

## Resumen

Mark-General-V3-8B es un modelo de lenguaje disperso (MoE) de clase 8B publicado por miceworks en HuggingFace bajo licencia AGPL-3.0. Se distribuye unicamente como un unico fichero GGUF cuantizado en IQ4_NL dentro del contenedor nativo `deepseek2`, con 8.168.001.024 parametros fisicos totales y 2.002.374.144 parametros activos por token. La arquitectura combina atencion multi-cabeza latente (MLA) con 32 expertos enrutados y 2 expertos compartidos, 32 capas, dimension oculta de 2560 y una ventana de contexto de 32.768 tokens.

El dato mas relevante para cualquier evaluacion es que se trata de una base arquitectonica **sin entrenar** (`UN-TRAINED_ARCHITECTURAL_BASE`). El autor lo declara explicitamente en la model card: los pesos son inicializaciones pensadas para verificar la compatibilidad del grafo binario con llama.cpp, medir el consumo de memoria en hardware objetivo y servir de base para preentrenamiento y destilacion posteriores hacia Mark-General-V3-1.5B. Por tanto, no genera texto coherente ni puede usarse en produccion tal cual.

Su interes tecnico esta en la arquitectura: absorcion de la transformada de Walsh-Hadamard normalizada en las proyecciones KV (H-MLA) para suprimir valores atipicos en las activaciones latentes, particion de los 32 expertos en 4 "clanes" funcionales con enrutamiento sesgado sin perdida auxiliar de balanceo (PB-MoE), y profundidad latente recursiva con embeddings atados. El binario ocupa 4383,98 MiB, lo que lo situa dentro de una GPU de consumo de 8 GB dejando mas de 3,4 GB de VRAM para el contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer MoE con MLA) |
| Parametros totales | 8.168.001.024 |
| Parametros activos | 2.002.374.144 (4 expertos activos por token: 2 compartidos + 2 enrutados de top-4 sobre 32) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | IQ4_NL (418 tensores) y F32 (161 tensores) |
| Idiomas soportados | en, pt |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (contenedor nativo `deepseek2`) |
| Estado de los pesos | Sin entrenar (`UN-TRAINED_ARCHITECTURAL_BASE`) |
| Tamano del binario | 4383,98 MiB (4.596.938.048 bytes) |
| Capas | 32 |
| Dimension oculta | 2560 |
| Cabezas de atencion | 32 |
| Rangos MLA | `q_lora_rank=1024`, `kv_lora_rank=512`, `qk_rope_head_dim=32` |
| Expertos MoE | 32 enrutados + 2 compartidos (top-4 enrutados por token) |
| Dimension FFN por experto | 896 |
| Tamano de vocabulario | 32.032 |
| Numero de tensores | 579 |
| SHA-256 | `7a7b50a6851238edba07b3c65859c26737e30afe842296eaf86bac9d8379b3f1` |
| Tamano del repo | 4,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema `deepseek2`: transformer decoder con atencion multi-cabeza latente (MLA). Las proyecciones de clave y valor se comprimen a una representacion latente compartida de rango bajo (`c_KV` de dimension 512, `c_Q` de dimension 1024) normalizada con RMSNorm, y los embeddings rotatorios desacoplados se concatenan en una dimension separada de 32 (`k_R = RoPE(h_t * W_KR)`). El resultado es un cache KV de 34.816 bytes por token, lo que supone un ahorro de 9,4x frente a una MHA estandar: 1088 MiB a 32.768 tokens frente a 10.240 MiB.

La capa MoE combina una ruta compartida siempre activa (2 expertos, `F_shared(x) = (SiLU(x * W_gate) * (x * W_up)) * W_down`) con 32 expertos enrutados mediante `Softmax(x_t * W_router + b_e)` y seleccion top-4, sin perdida auxiliar de balanceo de carga. Los expertos se agrupan en 4 clanes funcionales de 8 expertos cada uno (sistemas y concurrencia; matematicas y logica formal; seguridad y protocolos; razonamiento espacial y multimodal), con restricciones de fijado suave para garantizar representacion equilibrada por token. La variante H-MLA absorbe la matriz de Walsh-Hadamard normalizada `H_256 = (1/16) * H_2^(x8)` en los pesos `W_wkv_a` y `W_wkv_b` durante la compilacion, eliminando picos de activacion sin coste en tiempo de ejecucion. Ademas incorpora profundidad latente recursiva (LRD) y embeddings atados entre entrada y salida.

No hay entrenamiento que reportar. La model card declara explicitamente el estado `UN-TRAINED_ARCHITECTURAL_BASE` y no documenta tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o SFT. Las metricas publicadas son recuentos fisicos de parametros y sumas de verificacion SHA-256 del binario GGUF.

## Capacidades

- Generacion de texto: no disponible en el estado actual; los pesos son inicializaciones sin entrenar y no producen salida coherente.
- Razonamiento, STEM, fisica, quimica y sintesis enciclopedica: son los dominios declarados como objetivo de diseno (clanes 1 y 3 del MoE), pero no hay capacidades efectivas sin preentrenamiento.
- Codigo y semantica de sistemas: dominio asignado al clan 0 (expertos 0-7), sin capacidades efectivas por el mismo motivo.
- Seguridad, protocolos y validacion: dominio asignado al clan 2 (expertos 16-23), sin capacidades efectivas.
- Tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni formato estructurado mas alla del template de chat basico.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles y portugues declarados; sin evaluacion.
- Modo thinking: la plantilla de Ollama incluida en la model card abre un bloque `<think>` tras el turno del asistente, lo que sugiere soporte de formato de razonamiento explicito, pero sin pesos entrenados no hay comportamiento asociado.
- Self-RAG epistemico: mencionado en la vision general del modelo, sin especificacion tecnica ni evidencia en la model card.
- Verificacion criptografica: el binario publica SHA-256 para comprobar integridad de la descarga.

## Casos de uso

- Validacion de compatibilidad con llama.cpp: cargar el GGUF en una compilacion reciente de llama.cpp para comprobar que el grafo `deepseek2` con H-MLA, PB-MoE y embeddings atados se ejecuta sin errores. Es el caso de uso declarado por el autor.
- Medicion de huella de memoria en hardware objetivo: el binario de 4383,98 MiB permite medir VRAM real ocupada por pesos y cache KV a distintas longitudes de contexto (136 MiB a 4.096 tokens, 272 MiB a 8.192, 1088 MiB a 32.768) en GPUs de 8 GB.
- Benchmark de kernels MLA y MoE: util para comparar el rendimiento de kernels de atencion latente y de enrutamiento top-4 entre implementaciones (llama.cpp, vLLM con soporte DeepSeek-V2, etc.) sin el ruido de pesos entrenados.
- Base para preentrenamiento desde cero: punto de partida para un pipeline de preentrenamiento sobre el que el autor planea destilar hacia Mark-General-V3-1.5B.
- Pruebas de infraestructura de serving: desplegar el modelo en un endpoint compatible (la etiqueta `endpoints_compatible` lo indica) para validar plantillas de chat, streaming y gestion de contexto largo antes de sustituir los pesos por un checkpoint entrenado.
- Investigacion sobre enrutamiento por clanes: analizar la distribucion de activaciones de los 32 expertos y las restricciones de fijado suave del PB-MoE con pesos inicializados, para estudiar si el sesgo de enrutamiento se mantiene tras el entrenamiento.
- Referencia de diseno para arquitecturas MoE de 8B en 8 GB: el desglose de cache KV y el ahorro de 9,4x de MLA sirve como plantilla de calculo para quienes disenan modelos con restricciones de VRAM en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y ello es coherente con el estado sin entrenar del checkpoint. Las unicas cifras publicadas son recuentos de parametros, tamanos de binario y consumo de cache KV por contexto.

## Requisitos de hardware

- VRAM para pesos: 4383,98 MiB en IQ4_NL (aproximadamente 4,3 GiB).
- VRAM para cache KV (MLA, 34.816 bytes por token): 136 MiB a 4.096 tokens, 272 MiB a 8.192 tokens, 1088 MiB a 32.768 tokens.
- VRAM total estimada: en torno a 5,5 GB a contexto completo de 32.768 tokens, lo que deja mas de 3,4 GB libres en una GPU de 8 GB segun el autor.
- GPU de consumo: cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 3070, RTX 4060 Ti 8 GB, RTX 5060 Ti 8 GB). En tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) queda margen amplio para contexto y otros procesos.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para el modelo; utiles solo para pruebas de throughput agregado con muchos lotes.
- Opciones de despliegue: llama.cpp (formato nativo del GGUF), Ollama (la model card incluye un Modelfile), y cualquier runtime con soporte del contenedor `deepseek2` y de MLA. vLLM y TGI requeririan conversion a safetensors y soporte explicito de la variante H-MLA, no documentado.
- Latencia y throughput: no disponibles. Al no haber pesos entrenados, las mediciones de calidad de salida no aplican; las de velocidad dependen del backend y del hardware y no se han publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| Mark-General-V3-8B | 8,17B / 2,00B | 32.768 | AGPL-3.0 | Sin entrenar | GGUF IQ4_NL (4,4 GiB) |
| DeepSeek-V2-Lite | 15,7B / 2,4B (aproximado, no verificado en la informacion disponible) | 32.768 (no verificado) | no disponible en la informacion proporcionada | Entrenado | safetensors y GGUF |
| Qwen2.5-7B-Instruct | 7,6B (denso, no verificado) | 32.768 (no verificado) | no disponible en la informacion proporcionada | Entrenado | safetensors y GGUF |
| Mark-General-V3-1.5B | no disponible (aproximadamente 2B segun la busqueda) | no disponible | no disponible | Destino de destilacion segun el autor | no disponible |

La comparacion con DeepSeek-V2-Lite es la mas pertinente por compartir familia arquitectonica `deepseek2` y MLA, pero los datos de ese modelo no aparecen en la informacion proporcionada y no se verifican aqui. Frente a modelos densos de 7-8B entrenados, Mark-General-V3-8B no es comparable en calidad de salida por su estado sin entrenar; la comparacion solo tiene sentido en terminos de huella de memoria y estructura del grafo.

## Limitaciones y advertencias

- El checkpoint no esta entrenado. No produce texto utilizable; cualquier uso como modelo de chat o generacion dara salidas sin sentido. Es la limitacion principal y condiciona todas las demas.
- Sin datos de sesgo, alucinacion o evaluacion de seguridad: al no haber entrenamiento, no existen sesgos aprendidos medibles ni tasas de alucinacion estimables.
- Idiomas limitados a ingles y portugues en la declaracion del autor; no hay cobertura de castellano ni evaluacion multilingue.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte. El uso comercial es posible, pero cualquier distribucion o servicio en red basado en el modelo o en obras derivadas exige liberar el codigo fuente bajo la misma licencia. Es una restriccion relevante para integraciones en productos propietarios.
- El autor no documenta procedencia de los datos de entrenamiento (no hay entrenamiento), por lo que no se puede auditar la composicion del corpus ni el cumplimiento de derechos de terceros en futuras versiones.
- La absorcion de Hadamard en los pesos KV hace que el grafo no sea directamente compatible con implementaciones que esperen la variante MLA estandar de DeepSeek-V2; hay que verificar el soporte del backend antes de desplegar.
- El template de Ollama abre un bloque `<think>` sin cerrar en el fragmento publicado; conviene revisarlo antes de usarlo como plantilla de produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por terceros ni de validacion independiente del binario.
- El SHA-256 publicado debe verificarse siempre tras la descarga; un binario corrupto en un formato experimental puede fallar de formas dificiles de diagnosticar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miceworks/Mark-General-V3-8B
- Listado de modelos de texto de HuggingFace (donde aparecen otros Mark-V3): https://huggingface.co/models?pipeline_tag=text-generation&p=2&sort=created
- Listado de modelos de texto por fecha de modificacion: https://huggingface.co/models?pipeline_tag=text-generation&p=15&sort=modified
