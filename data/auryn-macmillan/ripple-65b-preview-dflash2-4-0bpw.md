# auryn-macmillan/Ripple-65B-Preview-DFlash2-4.0bpw

## Resumen

Ripple-65B-Preview-DFlash2-4.0bpw es una cuantizacion EXL3 a 4.0 bits por peso del drafter especulativo nativo DFlash2, asociado al modelo base Ripple-65B-Preview de ricursiveAI. No se trata de un modelo de chat autonomo, sino de un modelo borrador (draft model) disenado para decodificacion especulativa junto al modelo objetivo Ripple, al que complementa proponiendo bloques de tokens que el modelo grande verifica. El checkpoint lo ha producido el usuario auryn-macmillan con exllamav3 1.6.6 y la rama `feat/ricursive`, sobre un pool de 5 GPUs RTX 3090.

La arquitectura declarada es `DFlash2DraftModel`, con 4.040 millones de parametros, 5 capas, dimension oculta de 5120, 80 cabezas de consulta y 8 de clave/valor, head_dim de 128, FFN SwiGLU de 40960 y vocabulario de 100352 entradas. El drafter genera bloques de 16 tokens, mantiene 32 candidatos por posicion, usa un selector de rango 256 y toma estados ocultos del objetivo en las capas 1, 20, 39, 58 y 77. La atencion combina cuatro capas deslizantes con ventana de 4096 y una capa de atencion completa sin codificacion posicional (NoPE), con un maximo configurado de 131072 posiciones.

El interes de esta ficha es fundamentalmente practico y critico: el propio autor documenta que, emparejado con el objetivo Ripple a 4.0 bpw, la tasa de aceptacion es de solo el 3-6%, lo que hace que adjuntarlo empeore el rendimiento en lugar de mejorarlo. Se conserva como artefacto para futuros objetivos de mayor bitrate o para reajustar el emparejamiento drafter/objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlash2DraftModel` (modelo borrador para decodificacion especulativa; transformer con 4 capas deslizantes de ventana 4096 y 1 capa de atencion completa NoPE) |
| Parametros totales | 1.050.324.224 (segun safetensors); la model card declara 4,04B para el drafter DFlash2 original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131072 posiciones maximas configuradas |
| Tipos de cuantizacion | EXL3 (trellis, codebook `mul1`, `out_scales: auto`), 4.0 bpw, cabezas a 16 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico `model.safetensors`), formato EXL3 para exllamav3 |

## Arquitectura y entrenamiento

DFlash2 es el drafter especulativo nativo de Ripple. Su diseno se aparta del borrador autoregresivo clasico: propone bloques de 16 tokens de golpe, retiene 32 candidatos por posicion y aplica un selector de rango 256 para elegir la propuesta final. Para condicionar la prediccion, consume estados ocultos del modelo objetivo en cinco capas concretas (1, 20, 39, 58 y 77), lo que exige que el runtime de servicio exponga esas activaciones. La pila de atencion intercala cuatro capas con ventana deslizante de 4096 tokens y una capa de atencion completa sin codificacion posicional, con 80 cabezas de consulta y 8 de clave/valor (GQA), head_dim 128, FFN SwiGLU de 40960 y vocabulario de 100352.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el drafter. La model card solo documenta el proceso de cuantizacion: EXL3 con calibracion de 250 filas por 2048 columnas, producido con exllamav3 1.6.6 mas la rama `feat/ricursive` sobre 5 RTX 3090. El resultado ocupa 2,1 GB en disco. La innovacion tecnica relevante no esta en el drafter en si, sino en el mecanismo de decodificacion especulativa por bloques con seleccion multi-candidato y acceso a estados internos del objetivo.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: emite bloques de 16 tokens que el modelo objetivo Ripple verifica.
- Aprovechamiento de estados ocultos del objetivo en las capas 1, 20, 39, 58 y 77 para condicionar sus predicciones.
- Seleccion multi-candidato: mantiene 32 candidatos por posicion y elige mediante un selector de rango 256.
- Contexto largo: hasta 131072 posiciones configuradas, con atencion deslizante de 4096 en cuatro de sus cinco capas.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking de forma nativa: es un componente interno de inferencia, no un modelo conversacional.
- Capacidades multilingues: no disponibles; el drafter hereda el vocabulario del objetivo pero no se documenta cobertura idiomatica.

## Casos de uso

- Aceleracion de inferencia con objetivos de mayor bitrate: el autor recomienda conservar este checkpoint para emparejarlo con un objetivo Ripple de mas bits, donde la tasa de aceptacion podria ser superior al 3-6% medido a 4.0 bpw.
- Investigacion en decodificacion especulativa: sirve como caso de estudio de un drafter que consume estados ocultos del objetivo en capas intermedias y aplica seleccion multi-candidato, util para comparar con drafters autoregresivos clasicos.
- Reajuste del emparejamiento drafter/objetivo: el checkpoint permite experimentar con configuraciones de `draft_num_tokens`, `draft_max_rows` y `draft_cache_mode` en TabbyAPI para buscar una combinacion con mejor aceptacion.
- Despliegue en entornos con VRAM limitada: con 2,1 GB de pesos, es viable en GPUs de consumo, aunque el autor advierte que en su pool de 8 x 256K Q4 no cabe junto al objetivo por falta de memoria libre en las GPUs 0 y 4.
- Pruebas de integracion de runtimes: valida el soporte de DFlash2 en exllamav3 (rama `feat/ricursive`) y en TabbyAPI antes de adoptar la version final del drafter.
- Analisis de coste/beneficio en produccion: documenta un caso real en el que anadir decodificacion especulativa degrada el throughput (de 21,6 T/s a 7,2 T/s por stream en 12K x 8), util como referencia negativa en evaluaciones de arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de aceptacion y throughput del drafter emparejado con el objetivo Ripple a 4.0 bpw:

| Escenario | Medicion |
|---|---|
| Tasa de aceptacion (objetivo 4.0 bpw) | 3-6% |
| 12K de contexto x 1 stream | +6% de mejora, 21,6 T/s |
| 12K de contexto x 8 streams | 7,2 T/s por stream (empeora respecto a sin drafter) |
| Pool de produccion 8 x 256K Q4 | El drafter no cabe: 2,1 GB de pesos mas cache Q4 exceden la memoria libre en GPU 0 y GPU 4 |

## Requisitos de hardware

- VRAM estimada: 2,1 GB solo para los pesos del drafter en EXL3 4.0 bpw; hay que sumar la cache Q4 del drafter y la memoria del modelo objetivo Ripple.
- GPU recomendadas: el autor lo genero y probo en RTX 3090; por tamano cabe en GPUs de consumo con 8 GB o mas, pero el requisito real lo marca el objetivo.
- Cabe en GPU de consumo: si, en cuanto a pesos; el limite practico es la memoria conjunta con el modelo objetivo (en el pool 8 x 256K Q4 del autor no cupo).
- Opciones de despliegue: exllamav3 1.6.6 con la rama `feat/ricursive` para el objetivo y soporte DFlash2 en el runtime; TabbyAPI con configuracion `draft_mode: model`, `draft_num_tokens: 15`, `draft_max_rows: 16`, `draft_cache_mode: "4,4"` y `draft_gpu_split: [0, 0, 0, 4.5]`.
- Latencia y throughput: medidos a 12K de contexto, 21,6 T/s con 1 stream y 7,2 T/s por stream con 8 streams; ambos resultados son peores que operar sin el drafter a este bitrate.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros drafters especulativos ni de modelos comparables en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Ripple, su tokenizer, plantilla de chat, embeddings de tokens y cabeza de salida.
- A 4.0 bpw la tasa de aceptacion es de solo el 3-6%, por lo que el autor no recomienda adjuntarlo al objetivo en esa configuracion.
- Con 8 streams a 12K de contexto el rendimiento cae a 7,2 T/s por stream, peor que sin decodificacion especulativa.
- No cabe en el pool de produccion 8 x 256K Q4 documentado por el autor por falta de memoria libre en GPU 0 y GPU 4.
- Requiere una rama no principal de exllamav3 (`feat/ricursive`) y soporte DFlash2 en el runtime de servicio; la compatibilidad con otras herramientas no esta documentada.
- La model card declara 4,04B de parametros para el drafter, mientras que el recuento real de safetensors es de 1.050.324.224; conviene verificar el dato antes de dimensionar el despliegue.
- Riesgo de alucinacion y sesgos: no evaluables directamente, ya que el drafter no genera respuestas finales por si mismo; hereda las caracteristicas del objetivo.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero el uso practico queda condicionado por el modelo objetivo y por la rama de runtime necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/auryn-macmillan/Ripple-65B-Preview-DFlash2-4.0bpw
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Modelo intermedio con drafter: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Receta de conversion incluida en el repo: `recipe/ripple-dflash2-4.0bpw.yaml`
- Model card original incluida en el repo: `UPSTREAM_README.md`
