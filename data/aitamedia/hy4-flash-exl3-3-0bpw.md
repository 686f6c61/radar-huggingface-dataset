# aitamedia/Hy4-flash-EXL3-3.0bpw

## Resumen

Hy4-flash-EXL3-3.0bpw es una cuantizacion EXL3 (trellis-coded, ExLlamaV3) del modelo tencent/Hy4-flash-FP8, publicada por el usuario aitamedia. Se trata de una version de 3.0 bits por peso aplicada exclusivamente a los expertos enrutados de la arquitectura MoE, lo que reduce el peso de estos de 148.6 B parametros a unos 55.72 GB, manteniendo el resto de componentes (atencion, router, normas, embeddings, torre de vision y cabeza MTP) copiados byte a byte desde el modelo FP8 original.

El modelo base es un transformer MoE nativamente multimodal con 224 B parametros totales (155.5 B de backbone, 63.5 B de tabla Engram y 0.85 B de draft), 12 B parametros activos, 512 expertos enrutados con top-16 y una ventana de contexto de 1 M tokens. La particularidad de esta publicacion es el tratamiento de la tabla Engram: se distribuye en shards independientes, un tensor por fichero, pensados para que un runtime pueda mapearlos desde NVMe y paginar solo las filas que toca cada token.

La relevancia de esta ficha radica en que muestra un patron de cuantizacion selectiva y offload a disco orientado a hardware de memoria unificada (DGX Spark GB10), donde la distincion entre RAM de host y VRAM desaparece y el paginado desde SSD es la unica forma real de liberar el pool de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla Engram (multi_head_embedding), vision tower y cabeza MTP; nativamente multimodal |
| Parametros totales | 71.672.177.062 (pesos safetensors del repo); 224 B segun model card (155.5 B backbone + 63.5 B Engram + 0.85 B draft) |
| Parametros activos | 12 B |
| Longitud de contexto | 1 M tokens |
| Tipos de cuantizacion | EXL3 trellis 3.0 bpw (codebook `mcg`, tiles 16x16, K=3) en expertos enrutados; Engram en FP8 e4m3fn con escalas BF16 por fila (variante recomendada) o BF16 |
| Idiomas soportados | en, zh |
| Licencia | other (sigue los terminos del modelo fuente tencent/Hy4-flash-FP8) |
| Formato de pesos | safetensors + `experts.pt` (EXL3) + `scales.json` + `exl3_k_map.json` |
| Expertos enrutados | 512 por capa, top-16, 41 capas |
| Tamano del repo | 319.1 GB |
| Tamano de expertos cuantizados | 55.72 GB (1.36 GB por capa) |
| Tamano de tabla Engram | 64.7 GB en FP8 (4 x 15.84 GB + escalas) o 126.9 GB en BF16 |
| Descargas | 468 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 41 capas y 512 expertos enrutados por capa, activando los 16 mejores en cada token. Incorpora una tabla Engram denominada `multi_head_embedding.embedding.weight` distribuida en cuatro tensores (capas 1, 11, 21 y 31) con dimensiones [164994380, 96], [164999008, 96], [165004086, 96] y [165008942, 96] en BF16, lo que suma 126.9 GB. La configuracion declara `engram_fp8_embedding: true`, de modo que FP8 es la precision prevista para esta tabla. Ademas incluye una torre de vision y una cabeza MTP (multi-token prediction) para decodificacion especulativa.

Esta publicacion concreta no entrena nada: solo cuantiza. El proceso de encode se realizo en CPU exclusivamente (la GB10 es sm_121 y el techo CUDA de torch es 12.0) usando `quantize_tiles` y `pack_trellis` de exllamav3 con los parametros `{"K":3,"mcg":true,"mul1":false}`. El tiempo total de encode fue de 3.81 horas (41 capas x 5.7 min). El resultado son 55.72 GB frente a los 55.7 GB proyectados a 3.0 bpw, lo que confirma la densidad del empaquetado. El `gate_up_proj` se fusiona por experto y solo se cuantizan los expertos enrutados; el resto de tensores se copia byte a byte desde el FP8 de origen (148 shards, 289.2 GB, verificado por sha en disco).

La innovacion destacable es el layout: cada shard de Engram contiene exactamente un tensor, de modo que un backend de offload a disco puede apuntar solo a esos cuatro ficheros y mapear las filas necesarias (192 bytes por fila: 96 dimensiones x BF16) sin mantener la tabla residente. Se ofrecen dos variantes de Engram: FP8 (64.7 GB, error relativo medio absoluto del 2.20-2.22% frente a las tablas BF16, ahorro de 62 GB, 51% del original) y BF16 (126.9 GB, para comparaciones de exactitud).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso y modo agente, segun las capacidades del modelo base.
- Procesamiento multimodal nativo (torre de vision incluida en los pesos copiados).
- Decodificacion especulativa mediante cabeza MTP (0.85 B parametros de draft).
- Ventana de contexto de 1 M tokens, adecuada para documentos extensos y conversaciones de muchos turnos.
- Capacidad MoE con 512 expertos y top-16, que permite 12 B parametros activos sobre 224 B totales.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta cuantizacion concreta.
- Capacidades de codigo y matematicas: no documentadas especificamente en la informacion disponible.

## Casos de uso

- Servicio conversacional de contexto largo: con 1 M tokens de ventana, el modelo puede mantener conversaciones multi-turno con historiales extensos o procesar documentos completos sin truncar, aunque el offload de Engram a disco introduce latencia dependiente del almacenamiento.
- Despliegue en hardware de memoria unificada (DGX Spark GB10): el layout de shards independientes permite paginar la tabla Engram desde NVMe y mantener solo los expertos cuantizados y el backbone en el pool, haciendo viable un modelo de 224 B en una maquina de escritorio de gama alta.
- Procesamiento de documentos en chino e ingles: la cobertura bilingue y el contexto de 1 M tokens lo hacen apto para analisis de contratos, informes o corpus tecnicos en ambos idiomas.
- Investigacion sobre cuantizacion selectiva: sirve como referencia reproducible de cuantizacion EXL3 a 3.0 bpw solo en expertos, con provenance detallada (encode-state.json) y comparativa FP8 vs BF16 en la tabla Engram.
- Evaluacion de estrategias de offload a disco: los cuatro shards de Engram, un tensor por fichero, permiten medir el impacto del row-fetch desde SSD en el throughput real de un MoE de gran tamano.
- Prototipado de pipelines multimodales: la torre de vision copiada desde el modelo base permite experimentar con entrada de imagenes y texto en un entorno cuantizado, siempre que el runtime soporte la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de cuantizacion: error relativo medio absoluto del 2.20-2.22% para la tabla Engram en FP8 frente a BF16, y una densidad de empaquetado de 55.72 GB reales frente a 55.7 GB proyectados a 3.0 bpw.

## Requisitos de hardware

- VRAM estimada: los expertos cuantizados ocupan 55.72 GB; el backbone (atencion, router, normas, vision, MTP) suma aproximadamente 11.8 GB por shard en el layout descrito; la tabla Engram en FP8 ocupa 64.7 GB y en BF16 126.9 GB.
- En configuracion con Engram en disco, el pool residente minimo ronda los 67-68 GB (expertos + backbone) mas el espacio de trabajo del runtime.
- GPU recomendadas: DGX Spark GB10 (memoria unificada, sm_121) es el objetivo declarado; en GPUs discretas se requeriria un pool de al menos 128 GB para mantener la tabla Engram en memoria, lo que apunta a configuraciones multi-GPU tipo H100/H200 o A100 de 80 GB en paralelo.
- En consumer GPU: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) con la tabla Engram residente; solo seria viable con offload agresivo a disco y un runtime especifico.
- Opciones de despliegue: exllamav3 (formato nativo EXL3); vLLM upstream expone `pin_memory` para el Engram de este modelo, pero en memoria unificada eso no constituye un offload real, por lo que se requiere un backend con row store respaldado por disco.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen criticamente del ancho de banda de la SSD cuando la tabla Engram se pagina desde disco.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-EXL3-3.0bpw | 224 B (71.67 B en safetensors) | 12 B | 1 M | EXL3 3.0 bpw en expertos + Engram FP8/BF16 | other | Hugging Face |
| tencent/Hy4-flash-FP8 | 224 B | 12 B | 1 M | FP8 | other | Hugging Face |
| tencent/Hy4-flash (BF16, si existe) | no disponible | no disponible | no disponible | BF16 | no disponible | no disponible |

La comparativa directa mas relevante es contra el modelo fuente en FP8: esta cuantizacion reduce los expertos de 148.6 B parametros a 55.72 GB, a costa de un error de cuantizacion no documentado en la model card para los expertos (solo se documenta el error de la tabla Engram en FP8). No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre ingles y chino; no hay soporte declarado de castellano ni de otros idiomas.
- La licencia es "other" y remite a los terminos del modelo fuente tencent/Hy4-flash-FP8; es imprescindible revisarlos antes de cualquier uso comercial.
- El error de cuantizacion de los expertos a 3.0 bpw no se cuantifica en la model card; solo se documenta el error de la tabla Engram en FP8 (2.20-2.22%).
- La tabla Engram en BF16 ocupa 126.9 GB y en FP8 64.7 GB; sin offload a disco, el modelo no cabe en hardware de consumo.
- En memoria unificada, `pin_memory` de vLLM no libera el pool; se requiere un runtime con row store en disco, lo que limita las opciones de despliegue.
- La dependencia de lectura desde SSD introduce latencia variable y reduce el throughput frente a una ejecucion completamente residente en memoria.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para esta cuantizacion; deben asumirse los del modelo base.
- El proceso de encode se realizo en CPU por incompatibilidad de sm_121 con el techo CUDA de torch 12.0, lo que puede afectar a la reproducibilidad en otros entornos.
- El repo pesa 319.1 GB, lo que exige planificacion de almacenamiento y descarga considerable.

## Enlaces

- Hugging Face: https://huggingface.co/aitamedia/Hy4-flash-EXL3-3.0bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Repositorio exllamav3 (encoder utilizado): no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demos: no disponibles en la informacion proporcionada
