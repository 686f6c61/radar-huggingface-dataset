# eniga/GLM-5.3-Flash-radiance-MXFP4-FP8

## Resumen

GLM-5.3-Flash-radiance-MXFP4-FP8 es una conversión cuantizada del modelo zai-org/GLM-5.3-Flash publicada por el usuario eniga. Se trata de un transformer de tipo Mixture of Experts (MoE) con 321.000 millones de parámetros totales y 18.000 millones activos por token, organizado en 288 expertos enrutados con top-8. La conversión aplica MXFP4 a los expertos (routados y compartidos) y FP8 por bloques a las capas lineales del tronco (proyecciones MLA, proyecciones KDA y FFN densa de las capas 0-2, incluida la capa MTP). El resultado es un fichero `.rad` de 164,83 GiB que sirve 200.000 tokens de contexto con caché KV en FP8 sobre dos tarjetas de 32 GB y 128 GB de RAM.

El interés de esta ficha es doble. Por un lado, documenta una receta de cuantización mixta reproducible (MXFP4 + FP8 por bloques) sobre un modelo MoE de gran tamaño, con errores relativos medios declarados por el autor: 0,123 para los expertos MXFP4 y entre 0,0016 y 0,026 para las proyecciones FP8. Por otro, expone una dependencia de software no trivial: el fichero requiere una versión parcheada de radiance (1.17.0 más tres parches) que añade soporte para las proyecciones KDA en FP8/MXFP4 y para `--kv-cache-dtype fp8`.

La relevancia práctica está en el hardware objetivo: un modelo de 321.000 millones de parámetros servido con 200k de contexto en dos GPU de 32 GB (por ejemplo, gfx1201/ROCm) gracias a paralelismo de expertos y a un caché KV latente replicado de 1,39 GiB por tarjeta. No es un modelo para consumidor de gama media, pero sí demuestra que un MoE de este tamaño puede desplegarse en estaciones de trabajo con dos aceleradores de 32 GB si se acepta la penalización de memoria anfitriona fijada (unos 82 GiB por rango en TP2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA y capas KDA; incluye torre de visión y capa MTP |
| Parametros totales | 321.000 millones (según model card del autor de la conversión) |
| Parametros activos | 18.000 millones (MoE top-8 sobre 288 expertos enrutados) |
| Longitud de contexto | 200.000 tokens (con caché KV FP8 en la configuración de referencia) |
| Tipos de cuantizacion | MXFP4 (expertos, E2M1 con escala E8M0 por 32 valores) y FP8 E4M3 por bloques 128x128 (tronco); BF16 para `kv_b`, beta KDA, indexer DSA, router, gates, mHC, normas, embeddings, cabeza de salida, `eh_proj` de MTP y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (radiance), fichero `glm-5.3-flash-mxfp4-fp8.rad` de 164,83 GiB |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 288 expertos enrutados y selección top-8, más expertos compartidos, sobre un tronco con atención MLA (Multi-head Latent Attention) y capas KDA (Kernelized Delta Attention, según la nomenclatura del plugin `glm5next` de radiance). El modelo incorpora además una torre de visión, un indexer DSA, componentes mHC y una capa MTP (Multi-Token Prediction). Los 18.000 millones de parámetros activos por token son coherentes con un enrutamiento top-8 sobre 288 expertos de tamaño moderado.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Lo que sí está documentado es el proceso de conversión: `rad-convert` de radiance 1.17.0 con la receta `glm53-flash-mxfp4-fp8.recipe`, a partir de `zai-org/GLM-5.3-Flash-BF16`, con un tiempo de conversión de 58 minutos en un Core Ultra 7 270K. La cuantización de expertos usa RTN (round to nearest) sin calibración, con código FP4 E2M1 y una escala E8M0 por cada 32 valores; las proyecciones del tronco usan FP8 E4M3 con una escala f32 por bloque 128x128. El autor reporta un error relativo medio de 0,123 en expertos (peor caso 0,144 en `blk.44.ffn_down_exps.184`) y de 0,0016 a 0,026 en las proyecciones FP8.

La innovación técnica destacable no está en el modelo sino en el runtime: los tres parches sobre radiance 1.17.0 permiten servir las proyecciones KDA en su codificación almacenada (BF16, FP8 por bloques o MXFP4), elegir la ruta GEMM de cada proyección KDA según su codificación y habilitar `--kv-cache-dtype fp8`, que almacena el caché latente MLA en E4M3 y lo ensancha a BF16 al cargar (conversión exacta). El autor reporta que el kernel de decodificación con caché FP8 es ligeramente más rápido que el BF16 (50,6 µs frente a 56,2 µs a 2.052 tokens) y que los 156 tests del host y los 60 casos `mla_attn_*_fp8kv` en gfx1201 pasan con error máximo de aproximadamente 1e-4.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento multi-paso y decodificación con predicción multi-token (capa MTP incluida en el fichero).
- Procesamiento de visión: la torre de visión se conserva sin cuantizar en la conversión.
- Soporte de contexto largo: hasta 200.000 tokens con caché KV FP8 en la configuración de referencia del autor.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Modo thinking explícito: no documentado en la información disponible.
- Audio: no disponible.

## Casos de uso

- Análisis de repositorios y documentación técnica extensa: con 200k tokens de contexto y un caché KV de 1,39 GiB por tarjeta en FP8, el modelo puede ingerir árboles de código completos, historiales de issues y documentación interna en una sola pasada, manteniendo coherencia entre ficheros.
- Asistentes de código en estación de trabajo con dos GPU de 32 GB: el despliegue en TP2 con expertos repartidos (144 expertos por rango) permite servir un MoE de 321B en hardware de gama profesional, adecuado para autocompletado y refactorización asistida en entornos con requisitos de privacidad.
- Procesamiento de contratos y expedientes largos: la ventana de 200k tokens permite resumir, extraer cláusulas y comparar versiones de documentos legales sin trocear, reduciendo la pérdida de contexto entre fragmentos.
- Generación aumentada por recuperación (RAG) sobre corpus masivos: la combinación de contexto largo y cuantización agresiva de expertos reduce el coste por token frente a servir el modelo en BF16, lo que hace viable indexar y consultar bases documentales grandes en una única máquina.
- Evaluación de modelos base en investigación: al ser una conversión reproducible con receta pública y errores de cuantización medidos, sirve para estudiar el impacto de MXFP4 en expertos y FP8 en tronco sobre tareas de razonamiento, comparando contra el BF16 de referencia.
- Prototipado de pipelines multimodales: la torre de visión se mantiene en BF16, por lo que el modelo puede emplearse en tareas que combinen imagen y texto largo (por ejemplo, análisis de capturas de pantalla junto a logs), aunque la documentación no detalla el formato de entrada visual.
- Servicio interno de bajo volumen con ROCm: el autor valida el runtime en gfx1201, lo que encaja en clústeres internos con aceleradores AMD donde no se quiere depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento documentados son de runtime, no de calidad: decodificación con caché FP8 de 50,6 µs frente a 56,2 µs con BF16 a 2.052 tokens, y error máximo de aproximadamente 1e-4 en los tests de atención `mla_attn_*_fp8kv` frente a la referencia.

## Requisitos de hardware

- VRAM estimada: en TP2, cada rango aloja 144 expertos completos y parte del tronco; el autor indica que cada experto necesita VRAM o memoria anfitriona fijada, con unos 82 GiB por rango en TP2. El fichero completo pesa 164,83 GiB.
- Caché KV: replicado en cada rango (el latente MLA no se reparte por cabeza). 1,39 GiB por tarjeta a 200k tokens con FP8; aproximadamente 2,4 GiB con BF16. Añadir tarjetas no reduce este consumo.
- Configuración de referencia del autor: dos GPU de 32 GB con 128 GB de RAM del sistema, sirviendo 200k tokens de contexto con caché FP8.
- GPU recomendadas: el autor valida en gfx1201 (ROCm). Para TP4 y TP8 el propio autor remite a una sección "More cards" que no está incluida en la información disponible; no se confirman resultados en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No en una sola tarjeta: el fichero son 164,83 GiB y la configuración mínima documentada son dos aceleradores de 32 GB más 128 GB de RAM. No hay datos para RTX 4090 (24 GB).
- Opciones de despliegue: radiance 1.17.0 parcheado con los tres parches del repositorio (`0001`, `0002`, `0003`), construido según la documentación del propio proyecto. En main posterior a 1.17.0 solo serían necesarios los dos parches de KDA. El hermano BF16 del tronco (`eniga/GLM-5.3-Flash-radiance-MXFP4`) funciona con radiance sin parchear, caché BF16 y como máximo 64k de contexto en el mismo hardware.
- Latencia y throughput: solo se documenta la latencia del kernel de decodificación (50,6 µs con caché FP8 a 2.052 tokens). No hay cifras de throughput agregado ni de tiempo a primer token.
- Nota de memoria: `--host-pool-mib` es por rango. Los expertos `gate_up` se almacenan como dos planos y se unen al cargar, por lo que el nivel de disco no puede leerlos in situ; en la práctica todos los expertos deben residir en VRAM o en memoria anfitriona fijada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| eniga/GLM-5.3-Flash-radiance-MXFP4-FP8 | 321B | 18B | 200k (FP8 KV) | MIT | `.rad` | Requiere radiance parcheado; 164,83 GiB; TP2 con 2x32 GB y 128 GB RAM |
| eniga/GLM-5.3-Flash-radiance-MXFP4 | 321B | 18B | 64k máximo en el mismo hardware | MIT | `.rad` | Tronco BF16; funciona con radiance sin parchear; caché BF16 |
| zai-org/GLM-5.3-Flash-BF16 | 321B | 18B | no disponible | no disponible | BF16 | Modelo base de referencia; sin cuantizar |
| zai-org/GLM-5.3-Flash | 321B | 18B | no disponible | no disponible | no disponible | Modelo original del que deriva la conversión |

No se dispone de datos de benchmarks que permitan comparar calidad frente a estos u otros modelos de la misma categoría.

## Limitaciones y advertencias

- Dependencia de software frágil: el fichero no se sirve con radiance 1.17.0 de serie. Requiere aplicar tres parches y recompilar; en versiones main posteriores a 1.17.0 solo hacen falta los dos de KDA, pero los parches de KDA no están aún en upstream según el autor.
- Memoria anfitriona elevada: en TP2 se necesitan unos 82 GiB por rango entre VRAM y memoria fijada, más 128 GB de RAM del sistema en la configuración de referencia. No es un despliegue ligero.
- Caché KV no escalable horizontalmente: al ser latente MLA y no repartirse por cabeza, cada tarjeta mantiene una copia completa (1,39 GiB a 200k tokens en FP8). Añadir GPU no reduce ese consumo.
- Pérdida de precisión por cuantización: los expertos en MXFP4 presentan un error relativo medio de 0,123 (peor caso 0,144), lo que puede degradar tareas sensibles a matices finos. Las proyecciones FP8 tienen errores mucho menores (0,0016-0,026), pero no nulos.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre rendimiento en castellano.
- Capacidades de tool calling, agentes y modo thinking no documentadas: no deben asumirse en producción sin verificación empírica.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier modelo generativo, debe mitigarse con verificación externa.
- Sesgos: no documentados.
- Licencia MIT declarada en el repositorio de la conversión, pero la licencia y condiciones del modelo base (`zai-org/GLM-5.3-Flash`) no se detallan en la información proporcionada; conviene verificar los términos del modelo original antes de uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; el autor es un particular, no el desarrollador del modelo base.
- Validación limitada a gfx1201: no hay resultados publicados en CUDA ni en otras arquitecturas, ni pruebas de TP4/TP8 incluidas en la documentación disponible.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/eniga/GLM-5.3-Flash-radiance-MXFP4-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base en BF16 (origen de la conversión): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Hermano con tronco BF16: https://huggingface.co/eniga/GLM-5.3-Flash-radiance-MXFP4
- Runtime radiance: https://codeberg.org/StillDeadcode/radiance
- Receta de conversión: `glm53-flash-mxfp4-fp8.recipe` (incluida en el repositorio)
- Parches de radiance: directorio `radiance-patches/` del repositorio (parches `0001`, `0002`, `0003`)
