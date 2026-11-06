# EliovpAI/DeepSeek-V4.1-Flash-Paiton-CDNA4

## Resumen

DeepSeek-V4.1-Flash-Paiton-CDNA4 es una distribución cuantizada y con colocación de expertos personalizada del modelo DeepSeek-V4.1-Flash-1017 (revisión `1bae0e10`), publicada por EliovpAI. Su objetivo es ejecutar el checkpoint original, de 475 GiB, en una única tarjeta AMD Instinct MI350P de 144 GB de HBM, algo imposible con el modelo completo. El repositorio no contiene el modelo entero: solo incluye los tensores que difieren del original (2.812 expertos en formato de 3 bits y las tablas engram en row-FP4), junto con el mapa de colocación y su documentación, sumando 135,8 GiB.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 40 capas y 384 expertos enrutados por capa, más tablas engram de búsqueda de n-gramas y un drafter especulativo DSpark de 3 etapas y 128 expertos por etapa. El modelo base se distribuye en MXFP4 (E2M1 con escala E8M0 cada 32 pesos), mientras que esta variante introduce un formato propio de 3 bits (`ds41-mx3-v1`, 3,31 bits por peso) generado con GPTQ a partir de los valores FP4 originales, y traslada la mayor parte de los expertos a la CPU del host.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de offload híbrido GPU/CPU con decodificación especulativa sobre hardware AMD CDNA4 (`gfx950`), un terreno con mucha menos cobertura práctica que el ecosistema NVIDIA; por otro, expone con detalle inusual las métricas de fidelidad de la cuantización (divergencia KL, acuerdo top-1, pruebas de recuperación en contexto largo), lo que permite evaluar el compromiso real entre precisión y viabilidad de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas, 384 expertos enrutados por capa) con tablas engram y drafter especulativo DSpark |
| Parámetros totales | no disponible (el checkpoint original ocupa 475 GiB; el repo publicado, 135,8 GiB) |
| Parámetros activos | no disponible (top-k de enrutamiento no especificado en la información disponible) |
| Longitud de contexto | no disponible como cifra nominal; se han validado pruebas con prompts de hasta 68.160 tokens |
| Tipos de cuantización | MXFP4 original (E2M1 + E8M0 cada 32), formato propio de 3 bits `ds41-mx3-v1` (3,31 bits/peso), engram en row-FP4 (E2M1 + E8M0 cada 32) y E4M3 + E8M0 en el perfil A |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Tensores propios del repo (expertos 3-bit, engram row-FP4, mapa de colocación); el resto se lee del checkpoint original en safetensors de `deepseek-ai/DeepSeek-V4.1-Flash-1017` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 40 capas y 384 expertos enrutados por capa, complementado por dos tablas engram de búsqueda de n-gramas (189 GiB en el original, en E4M3 con escala E8M0 cada 32) y por un drafter especulativo DSpark de 3 etapas con 128 expertos cada una. El tronco (atención, indexador, compresor, expertos compartidos y cabeza) permanece en la GPU en su formato original, igual que el drafter y la caché KV.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. La innovación técnica de esta publicación es de despliegue, no de entrenamiento: reparte los 15.360 expertos entre GPU y host. En la GPU residen 5.812 expertos en 97,6 GB (los 3.000 más usados en MXFP4 bit a bit y los 2.812 siguientes en `ds41-mx3-v1`, 14,65 MB por experto frente a 18,8 MB, cortados por GPTQ desde los valores FP4 originales, con 1.024 ranuras que siguen a los expertos de las peticiones en curso). Los 9.548 restantes se calculan en las CPU del host en su MXFP4 original, de modo que solo cruzan el PCIe las activaciones (unos pocos KB por token); en prompts largos, los expertos fríos se transfieren a la GPU mientras esta computa. Las tablas engram se guardan en memoria del host en row-FP4 (105 GB en lugar de 203 GB) y se recolectan fila a fila a partir de los últimos cuatro token ids.

## Capacidades

- Generación de texto y razonamiento: el modelo base es de propósito general y la model card distingue posiciones de "thinking" y de "answer", lo que indica un modo de razonamiento explícito.
- Procesamiento de contexto largo: se han validado prompts de hasta 68.160 tokens en el servidor interactivo y de hasta 11.033 tokens en el token factory.
- Recuperación de información en contexto extenso: 12 de 12 pruebas de passphrase oculta superadas con la aguja al 10 %, 50 % y 90 % de profundidad.
- Decodificación especulativa: incorpora el drafter DSpark de 3 etapas para acelerar la generación.
- Servicio concurrente: probado con 512 peticiones de chat simultáneas en el perfil token factory.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Despliegue de un modelo frontera en una sola tarjeta AMD: el caso central de esta publicación es servir DeepSeek-V4.1-Flash-1017 en una MI350P de 144 GB usando el motor nativo CDNA4 de Paiton, sin necesidad de un clúster multi-GPU como el que requiere el checkpoint original (la referencia se sirvió con SGLang en dos MI355X).
- Servicio de chat interactivo con contexto largo: el perfil B, medido en la MI350P a 450 W, mantiene 0,0307 de KL y 95,0 % de acuerdo top-1 en el conjunto de chat con lotes de 64 y 70.000 tokens, lo que lo hace apto para asistentes conversacionales con historiales extensos.
- Procesamiento por lotes de gran volumen: el modo token factory (512 peticiones de 12.288 tokens) alcanza 0,0311 de KL y 94,5 % de acuerdo top-1, adecuado para pipelines de generación masiva donde prima el throughput sobre la latencia.
- Analítica sobre documentos largos y recuperación de passphrases: las pruebas de 8K a 68.160 tokens con la aguja al 10 %, 50 % y 90 % de profundidad demuestran utilidad para resumen y extracción sobre contratos, informes o expedientes extensos.
- Investigación en cuantización extrema: el repo publica el formato `ds41-mx3-v1`, el mapa de colocación y las métricas de KL en emulador, lo que sirve como banco de pruebas para estudiar el impacto de bajar a 3 bits por peso en modelos MoE con enrutamiento discreto.
- Evaluación de hardware AMD CDNA4: útil para equipos que quieran medir el rendimiento real de `gfx950` con offload de expertos por PCIe y compararlo con alternativas NVIDIA antes de adquirir infraestructura.
- Prototipado con presupuesto de memoria ajustado: el perfil C, aún no publicado, prevé mantener las tablas engram en NVMe para hosts que no puedan alojar los 287,5 GB del perfil B, lo que abriría el despliegue a servidores más modestos.

## Benchmarks y rendimiento

La model card no incluye benchmarks académicos (MMLU, HumanEval, GSM8K). Publica, en cambio, métricas de fidelidad frente al modelo original y de rendimiento de servicio.

| Conjunto de evaluación | Servidor | KL | Acuerdo top-1 | Ruido base (mismo servidor dos veces) |
|---|---|---:|---:|---:|
| chat (1.767 posiciones) | interactivo (64 x 70.000) | 0,0307 | 95,0 % | 0,0039 |
| chat (mismo conjunto) | token factory (512 x 12.288) | 0,0311 | 94,5 % | 0,0006 |
| contexto largo (40 conversaciones, 1.000 posiciones) | interactivo | 0,0438 | 94,2 % | 0,0033 |
| contexto largo (40 conversaciones, 1.000 posiciones) | token factory | 0,0418 | 94,2 % | 0,0086 |
| referencia: original contra sí mismo (SGLang dos veces) | - | 0,0172 | 95,7 % | - |

| Evaluación en emulador (171.200 posiciones, enrutamiento libre) | KL contexto largo [IC 95 %] | Top-1 |
|---|---:|---:|
| Ruido base (dos variantes aritméticas correctas) | 0,0154 | - |
| Perfil B | 0,0444 [0,0295, 0,0633] | 92,1 % |

Datos adicionales: con 512 peticiones de chat simultáneas el token factory obtiene 0,0306 de KL y 94,5 % de acuerdo top-1. La conversión de las tablas engram a row-FP4 cuesta entre 0,003 y 0,004 de KL según el emulador. El umbral de publicación del autor es 0,045 de KL en contexto largo: los resultados servidos de 1.000 posiciones (0,0438 y 0,0418) quedan por debajo, pero la proyección sobre el conjunto completo de 171.200 posiciones es de aproximadamente 0,0456, ligeramente por encima, y el autor lo señala explícitamente. El servicio añade unos 0,001 de KL respecto al emulador.

## Requisitos de hardware

- VRAM: la GPU aloja 5.812 expertos en 97,6 GB, más el tronco, el drafter y la caché KV en sus formatos originales, todo dentro de los 144 GB de HBM de una MI350P.
- Memoria del host: el perfil B requiere unos 287,5 GB de RAM (179,5 GB de expertos, 105 GB de tablas engram y 3 GB fijados en memoria). El perfil A necesita unos 490 GB y el perfil C, aún no disponible, recurre a NVMe.
- GPU recomendada: AMD Instinct MI350P (CDNA4, `gfx950`) de 144 GB. El perfil B se ha servido y medido en esta tarjeta a 450 W. La referencia se ejecutó con SGLang en dos MI355X.
- GPU de consumo: no es viable. El modelo no cabe en ninguna GPU consumer y depende del motor Paiton con soporte CDNA4.
- Almacenamiento: la descarga total es de 475 GiB (checkpoint original de `deepseek-ai`) más 135,8 GiB (este repositorio).
- Opciones de despliegue: motor Paiton con su motor nativo CDNA4 (`gfx950`). La model card marca `inference: false` en Hugging Face, por lo que no se sirve a través de la infraestructura de inferencia de la plataforma. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de tokens por segundo. El autor advierte que, con 16 usuarios o más, la velocidad de decodificación la fija el ancho de banda de memoria del host, no su capacidad, de modo que hosts con menos canales o más lentos serán más lentos en todos los perfiles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Paiton-CDNA4 (esta ficha) | no disponible (checkpoint de 475 GiB) | no disponible (validado hasta 68.160 tokens) | MXFP4, 3-bit `ds41-mx3-v1`, row-FP4 | MIT | 1 x AMD MI350P (144 GB) + host de ~320 GB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible (475 GiB) | no disponible | MXFP4, E4M3 en engram | no disponible en la información proporcionada | Servido con SGLang en 2 x AMD MI355X |
| Perfil A de esta misma distribución | no disponible | no disponible | MXFP4 + engram E4M3/E8M0 | MIT | 1 x MI350P + host de ~512 GB |

La comparación relevante es frente al checkpoint original: esta distribución reduce el requisito de dos MI355X a una sola MI350P a cambio de un incremento de KL de aproximadamente 0,03 en chat y 0,04 en contexto largo respecto a la referencia, con un acuerdo top-1 en torno al 94-95 %. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo es caótico por diseño: el enrutamiento discreto y las selecciones top-k del indexador hacen que dos implementaciones correctas del original ya difieran entre 0,0172 de KL, por lo que cada fila de la tabla debe leerse como exceso sobre su ruido base.
- La proyección de KL sobre el conjunto completo de contexto largo (aproximadamente 0,0456) supera ligeramente el umbral de publicación del propio autor (0,045); este lo advierte de forma explícita.
- Solo 2.812 de los 15.360 expertos usan el formato de 3 bits; los 3.000 más usados se conservan en MXFP4 bit a bit, de modo que el ahorro depende de que el tráfico real se concentre en esos expertos.
- El rendimiento con 16 usuarios o más está limitado por el ancho de banda de memoria del host, no por la GPU; hosts con menos canales degradarán la velocidad de decodificación.
- El despliegue exige descargar el checkpoint original completo (475 GiB) además de este repositorio (135,8 GiB), lo que implica un coste de almacenamiento y de ancho de banda considerable.
- La model card marca `inference: false`: no está pensado para servirse a través de la infraestructura de inferencia de Hugging Face.
- Solo se documenta el motor Paiton sobre CDNA4; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ni para GPUs NVIDIA o AMD de otras generaciones.
- Los perfiles A y C están anunciados como "coming" y no se han publicado; solo el perfil B está servido y medido.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni restricciones adicionales del modelo base. La licencia del repositorio es MIT, pero conviene verificar la licencia del checkpoint original de DeepSeek antes de un uso comercial.
- El repositorio tiene 454 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; se trata de una publicación reciente con poca validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EliovpAI/DeepSeek-V4.1-Flash-Paiton-CDNA4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Blog del autor: https://eliovp.com/blog/paiton-deepseek-v41-flash-amd-instinct-mi350p
- Perfil del autor en Hugging Face: https://huggingface.co/EliovpAI
