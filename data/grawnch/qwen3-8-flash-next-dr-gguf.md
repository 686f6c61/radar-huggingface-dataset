# Grawnch/Qwen3.8-Flash-Next-DR-GGUF

## Resumen

Qwen3.8-Flash-Next-DR-GGUF es una cuantizacion GGUF de muy bajo bit de Qwen/Qwen3.8-Flash-Next, un modelo MoE de aproximadamente 180 000 millones de parametros desarrollado por Alibaba Qwen. La publica el usuario Grawnch bajo el identificador `DR-V2-Q2_0`, con un backbone cuantizado a 2,45 bits por peso y dividido en dos shards. Su proposito es hacer viable la inferencia de un MoE de gran tamano en una unica GPU de 48 GB de VRAM, algo que el modelo original en BF16 (unos 251 GB) no permite.

La innovacion principal es el uso exclusivo de rejillas enteras lineales estandar (`Q2_0`, `Q4_0`, `Q6_K`, `Q8_0`) en todos los tensores, sin tablas de busqueda `IQ*`, lo que permite ejecutarlo en llama.cpp sin sobrecarga de descompresion y con un rendimiento notablemente superior en prefill y decodificacion frente a cuantizaciones `IQ` comparables. El segundo shard contiene una tabla estatica de busqueda N-gram de capa 1 (28,80 GB) que se mapea en memoria desde RAM o SSD del host mediante `-lm mmap`.

El modelo conserva la modalidad image-text-to-text del modelo base y esta orientado a tareas de razonamiento, codigo y matematicas con presupuestos de pensamiento acotados. Es relevante para quienes necesitan desplegar un MoE de clase 180B en hardware de una sola GPU de gama alta profesional, aceptando una perdida medible de fidelidad respecto al BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (etiqueta `qwen4_exp`), con atencion/GDN y expertos compartidos |
| Parametros totales | 176 943 899 520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks usan contextos de hasta 64K tokens) |
| Tipos de cuantizacion | GGUF `Q2_0` (backbone, 2,45 bpw), `Q4_0`, `Q6_K` (atencion), `Q8_0` (expertos compartidos); cero tablas `IQ*` |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF en 2 shards (backbone 38,38 GB + tabla N-gram 28,80 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE transformer de la familia Qwen con 144 expertos enrutados por capa MoE, expertos compartidos y componentes de atencion/GDN con hiper-conexiones. La cuantizacion `DR-V2-Q2_0` aplica `Q2_0` a los 144 expertos enrutados de cada capa, `Q8_0` a los expertos compartidos y `Q6_K` a la atencion, manteniendo todos los tensores en rejillas enteras lineales sin LUTs `IQ`. El shard 2 es una tabla estatica de busqueda N-gram de capa 1 que no se carga en VRAM, sino que se mapea desde el host.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es el diseno de dos shards con separacion entre red neuronal activa y tabla de busqueda estatica, junto con la ausencia total de LUTs `IQ`, que segun el autor se traduce en 3,4 veces mas velocidad de prefill (367,0 t/s) y un 34 % mas de velocidad de decodificacion (94,0 t/s) frente a cuantizaciones con rejillas `IQ`.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con modo de pensamiento acotado (thinking budgets configurables).
- Generacion y edicion de codigo, evaluada en Aider Polyglot con Pass@2.
- Razonamiento matematico, evaluado en AIME 2025 con Pass@1.
- Procesamiento image-text-to-text (pipeline declarado en Hugging Face).
- Compatible con endpoints (`endpoints_compatible` en las etiquetas).
- Ejecucion nativa en llama.cpp en modo stock, sin kernels ni runtime especiales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de clase 180B en una unica GPU de 48 GB: el backbone ocupa 38,38 GB de VRAM, dejando unos 9,6 GB de margen para KV cache, lo que permite servir el modelo en estaciones con una sola A6000, L40S de 48 GB o similar.
- Asistente de codigo en produccion: con 74,7 % en Aider Polyglot (Pass@2) y soporte de contextos de hasta 24K tokens en las pruebas, puede integrarse en pipelines de revision y generacion de parches sobre repositorios medianos.
- Razonamiento matematico asistido: con 83,3 % en AIME 2025 (Pass@1) y presupuestos de hasta 64K tokens, es adecuado para tutoria y resolucion de problemas con traza de pensamiento extensa.
- Prototipado e investigacion en entornos con VRAM limitada: permite experimentar con un MoE de 177B sin clúster multi-GPU, mapeando la tabla N-gram desde SSD y manteniendo el backbone en GPU.
- Evaluacion comparativa de tecnicas de cuantizacion: al emplear solo rejillas lineales, sirve como referencia reproducible frente a cuantizaciones `IQ` y `EXL3` en estudios de fidelidad (PPL, KLD, acuerdo top-1).
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite tareas de descripcion y extraccion sobre capturas o paginas escaneadas, siempre que se valide la calidad tras la cuantizacion agresiva.
- Servicio de chat de baja latencia en una sola GPU: con 94,0 t/s de decodificacion en un solo flujo, admite interacciones conversacionales casi en tiempo real sin infraestructura distribuida.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantizacion. Aider Polyglot sobre 225 problemas (Pass@2) y AIME 2025 sobre 30 problemas (Pass@1, temperatura 0,6).

| VRAM | Modelo / metodo | bpw | Aider Polyglot | AIME 2025 | Prefill / decode (t/s) | GGUF stock sin LUT |
|---|---|---|---|---|---|---|
| 38,4 GB | DR-V2-Q2_0 (este) | 2,45 | 74,7 % (168/225) | 83,3 % (25/30) | 367,0 / 94,0 | Si |
| 52,0 GB | Unsloth V3.1 UD-IQ1_S | 3,26 | 79,6 % (179/225) | 83,3 % (25/30) | 108,2 / 70,3 | No |
| 53,6 GB | Unsloth V3.1 UD-IQ1_M | 3,36 | 80,4 % (181/225) | 83,3 % (25/30) | 112,5 / 71,8 | No |
| 64,0 GB | ExLlamaV3 SC | 2,18 | 64,0 % (144/225) | 60,0 % (18/30) | runtime EXL3 | No |
| 66,4 GB | ISTA GSQ-RCO-Q2_0 | 2,50 | 66,2 % (149/225) | 63,3 % (19/30) | 367,5 / 93,8 | No |
| 68,0 GB | ISTA GSQ-RCO-IQ2_XS | 2,35 | 71,1 % (160/225) | 73,3 % (22/30) | 142,0 / 76,5 | No |
| 251,2 GB | BF16 sin comprimir | 16,00 | 82,2 % (185/225) | 90,0 % (27/30) | 24,5 / 2,1 | Safetensors |

Fidelidad de distribucion frente a BF16:

| Modelo | WT2 PPL | Ext Math/Code PPL | Ext KLD (nats) | Top-1 Ext | Top-1 WT2 |
|---|---|---|---|---|---|
| BF16 | 2,153 | 5,403 | 0,0000 | 100,0 % | 100,0 % |
| DR-V2-Q2_0 (este) | 3,191 | 6,172 | 0,2594 | 80,70 % | 78,27 % |
| Unsloth UD-IQ1_S | 3,500 | 6,850 | 0,6800 | 75,20 % | 76,20 % |
| Unsloth UD-IQ1_M | 3,380 | 6,520 | 0,5900 | 76,80 % | 77,10 % |
| ExLlamaV3 SC | 3,620 | 7,100 | 0,7400 | 74,10 % | 75,40 % |
| ISTA GSQ-RCO-Q2_0 | 3,420 | 6,750 | 0,7160 | 76,10 % | 76,60 % |
| ISTA GSQ-RCO-IQ2_XS | 3,290 | 6,410 | 0,5400 | 77,90 % | 77,50 % |

## Requisitos de hardware

- VRAM: 38,38 GB para el shard 1 (backbone) y 28,80 GB para el shard 2 mapeado en RAM/SSD; margen de unos 9,6 GB para KV cache en una GPU de 48 GB.
- GPU recomendadas: A6000 de 48 GB, L40S de 48 GB, RTX 6000 Ada de 48 GB o cualquier GPU con al menos 48 GB.
- GPU de consumo: no cabe en RTX 4090 de 24 GB ni en RTX 3090 de 24 GB.
- Almacenamiento: el repositorio ocupa 67,2 GB; conviene SSD NVMe para el shard mapeado en memoria.
- Despliegue: llama.cpp en modo stock con `-lm mmap`; no requiere kernels `IQ` ni runtime EXL3.
- Rendimiento medido: 367,0 t/s de prefill y 94,0 t/s de decodificacion en un solo flujo, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | bpw | VRAM | Aider Polyglot | AIME 2025 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DR-V2-Q2_0 (este) | ~177B MoE | 2,45 | 38,4 GB | 74,7 % | 83,3 % | qwen-community-1.0 | GGUF, llama.cpp |
| Unsloth UD-IQ1_S | mismo base | 3,26 | 52,0 GB | 79,6 % | 83,3 % | qwen-community-1.0 | GGUF, llama.cpp |
| ISTA GSQ-RCO-Q2_0 | mismo base | 2,50 | 66,4 GB | 66,2 % | 63,3 % | qwen-community-1.0 | GGUF, llama.cpp |
| BF16 original | ~177B MoE | 16,00 | 251,2 GB | 82,2 % | 90,0 % | qwen-community-1.0 | Safetensors |

## Limitaciones y advertencias

- La cuantizacion a 2,45 bpw degrada la calidad respecto a BF16: la PPL en WikiText-2 sube de 2,153 a 3,191 y el acuerdo top-1 cae al 78-81 %.
- En Aider Polyglot pierde 7,5 puntos frente a BF16 y 5,7 puntos frente a Unsloth UD-IQ1_M, por lo que no es la opcion de mayor calidad dentro de las cuantizaciones de bajo bit.
- El autor reporta consumos de tokens muy altos en las pruebas (40,1K de media en Aider y 33,0K en AIME), lo que incrementa el coste de inferencia y el uso de KV cache.
- Requiere una GPU de 48 GB; no es desplegable en hardware de consumo.
- La tabla N-gram del shard 2 se mapea desde RAM o SSD, por lo que el rendimiento depende de la velocidad del almacenamiento.
- La licencia qwen-community-1.0 impone condiciones especificas de uso comercial; conviene revisar el texto completo antes de un despliegue en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta cuantizacion; se heredan los del modelo base.
- Al ser una cuantizacion no oficial, no cuenta con el respaldo del equipo Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-DR-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
