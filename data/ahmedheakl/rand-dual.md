# ahmedheakl/rand-dual

## Resumen

Rand-dual (identificador `ahmedheakl/rand-dual`, presentado en la model card como "Mobile-O v2, dual-stream") es un modelo de difusion para generacion y edicion de imagenes de aproximadamente 0,6 mil millones de parametros, publicado por Ahmed Heakl (MBZUAI). El sistema combina tres piezas: un VLM congelado (MiniCPM-V-4.6) que codifica la instruccion en texto, un conector de acondicionamiento entrenado y un cabezal de difusion SANA-600M que opera a 512x512. La innovacion principal es el modo dual-stream: en edicion, la imagen de origen se introduce dos veces, como descripcion semantica del VLM y como latente DC-AE propio, sumado al patch embedding del DiT detras de una compuerta aprendida.

El objetivo declarado es ofrecer edicion y generacion de imagenes de calidad competitiva con un coste de computo propio de movil: 844 ms por imagen de 512 px de extremo a extremo y 1.078 ms por edicion en una RTX PRO 6000 Blackwell. Frente a su predecesor `ahmedheakl/rand-mobile` (single-stream), mejora DPG-Bench (84,12 frente a 82,19), FID en MJHQ-30K (13,16 frente a 14,36), ImageReward (1,083 frente a 0,957) y GEdit-EN (6,80 frente a 6,74), con un GenEval practicamente identico (0,897 frente a 0,902).

El repositorio contiene unicamente el cabezal entrenado (604 tensores): el DiT de SANA, el conector de difusion y la compuerta de origen. El VLM y el autoencoder DC-AE deben descargarse por separado, lo que condiciona tanto el despliegue como el consumo real de VRAM. La licencia es Apache 2.0 y el pipeline declarado es text-to-image, con capacidades adicionales de edicion por instruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT de SANA) acondicionado por un VLM congelado (MiniCPM-V-4.6) mediante conector; esquema dual-stream con compuerta de origen |
| Parametros totales | 600.597.538 (solo el cabezal entrenado incluido en el repositorio; el VLM congelado no esta incluido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (604 tensores: `model.dit.*`, `model.diffusion_connector.*`, `model.dit.source_gate.*`; mas `upsampler_1024/head_ema.safetensors` de 426 MB) |
| Resolucion nativa | 512x512, con decodificacion a 1024 px mediante cabezal upsampler |
| Pasos de inferencia recomendados | 20 (DPM-Solver++, `solver_order=2`, flow sigmas, `flow_shift=3`) |
| Guiado recomendado | Texto a imagen: APG (eta 0) con cfg 3.0; edicion: cfg plano 2.0 |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El sistema es un pipeline de tres etapas. Primero, un VLM congelado MiniCPM-V-4.6 procesa la instruccion (y, en edicion, tambien la imagen de origen) para producir una representacion semantica. Un conector de tipo `mcptf` fusiona una unica capa del VLM y la proyecta al espacio del DiT. Despues, un DiT de SANA-600M genera el latente a 512x512. Por ultimo, el decodificador DC-AE de 32 canales (latente de 16x16 a 512 px) produce la imagen RGB; opcionalmente, el cabezal `upsampler_1024` convierte las ultimas caracteristicas ocultas del decodificador DC-AE en RGB a 1024 px sin intervencion del DiT.

La aportacion tecnica del modo dual-stream es la compuerta de origen. En edicion, la imagen fuente se redimensiona por el lado corto a 512 con interpolacion bicubica, se recorta al centro a 512x512 y se codifica con el DC-AE congelado en un latente de 32x16x16 escalado por el factor del VAE. Ese latente se proyecta con el mismo patch size del DiT (`proj`, proyeccion 1x1 sin sesgo desde 32 canales al ancho del DiT) y el resultado, multiplicado por `tanh(gate)` (con valor +0,119), se suma al patch embedding del latente ruidoso en cada paso. Las dos ramas del classifier-free guidance reciben la misma fuente; solo se anula la instruccion. El coste adicional es unicamente la codificacion de la fuente: 34 ms por edicion, mientras que la compuerta en si no anade tiempo por paso (+0,0 ms medido en llamadas emparejadas).

El repositorio solo contiene el cabezal entrenado; el VLM permanece congelado durante el entrenamiento y no se distribuye. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se documenta el ajuste de guiado APG (adaptive projected guidance, eta = 0), que elimina la componente del update de guiado paralela a la prediccion condicional del modelo y conserva el resto, permitiendo subir el cfg casi sin coste de calidad.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 512x512 y decodificacion a 1024 px con el cabezal upsampler.
- Edicion de imagenes por instruccion en lenguaje natural, con preservacion de las regiones no afectadas gracias a la entrada del latente de origen a traves de la compuerta.
- Composicion de escenas y seguimiento de prompts detallados (GenEval 0,897 y DPG-Bench 84,12 con APG a cfg 3.0).
- Generacion de personas y escenas humanas: en una comparacion humana emparejada de 152 imagenes, APG cfg 3.0 obtuvo +0,150 (t = 3,46) sobre cfg plano 2.0, con mejoras de +0,24 en realismo, +0,42 en manos y +0,27 en planos de grupo.
- Inferencia orientada a dispositivos moviles por el tamano reducido del cabezal.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras modalidades (audio, video) en la informacion disponible.
- El renderizado de texto dentro de la imagen es limitado: la precision por palabra en CVTG-2K es de 0,076.

## Casos de uso

- Edicion fotografica asistida por instruccion: el modelo recibe una fotografia y una orden ("haz que nieve") y modifica solo lo indicado; la compuerta de origen aporta los pixeles de la fuente al DiT, lo que reduce la necesidad de redibujar zonas no afectadas. Con 1.078 ms por edicion en una RTX PRO 6000 Blackwell es viable en flujos interactivos.
- Retoque en aplicaciones moviles: el cabezal de 600 M de parametros y los 844 ms de generacion a 512 px permiten plantear funciones de generacion y edicion integradas en apps, con el VLM ejecutandose en el mismo dispositivo o en servidor segun el presupuesto de memoria.
- Generacion de imagenes para catalogos de e-commerce: creacion de variaciones de producto a partir de prompts descriptivos, con resolucion final de 1024 px mediante el cabezal upsampler y sin reentrenar el DiT.
- Produccion de assets para prototipos de interfaz: generacion rapida de ilustraciones y fondos de baja/media resolucion para maquetas, con coste por imagen bajo al no requerir modelos de miles de millones de parametros.
- Edicion por lotes de fotografias de producto o inmobiliaria: sustitucion de fondos, cambios de iluminacion o adicion de elementos atmosfericos sobre un mismo conjunto de imagenes usando cfg plano 2.0 y 20 pasos.
- Variaciones controladas sobre imagenes existentes: al inyectar el latente de la fuente, los cambios de estilo o de detalle pueden aplicarse manteniendo la geometria y la identidad de la escena original.
- Investigacion en difusion eficiente: el diseno dual-stream con compuerta de coste nulo por paso es un punto de partida reproducible para estudiar acondicionamiento por pixeles frente a acondicionamiento puramente semantico, dado que el codigo de inferencia es publico.

## Benchmarks y rendimiento

Resultados declarados por el autor para este checkpoint, con los ajustes recomendados (texto a imagen con APG a cfg 3.0; edicion con cfg plano 2.0; 20 pasos de DPM-Solver++):

| Benchmark | Rand-dual | Objetivo declarado | Nota |
|---|---|---|---|
| GenEval | 0,897 | >= 0,90 | no alcanza el objetivo |
| DPG-Bench | 84,12 | >= 85 | no alcanza el objetivo |
| FID (MJHQ-30K) | 13,16 | <= 8 | menor es mejor; no alcanza el objetivo |
| ImageReward (MJHQ-30K) | 1,083 | >= 0,90 | objetivo cumplido |
| CLIP score (MJHQ-30K) | 32,35 | no definido | |
| PRISM | 5,66 | no definido | |
| CVTG-2K (precision por palabra) | 0,076 | no definido | |
| ImgEdit (juez local Qwen2.5-VL-72B) | 3,28 | >= 3,5 | no alcanza el objetivo |
| GEdit-EN (juez local Qwen2.5-VL-72B) | 6,80 | >= 6,7 | objetivo cumplido |

Con cfg plano 2.0 tambien en texto a imagen: GenEval 0,894; DPG 82,98; FID 13,38; ImageReward 1,021; PRISM 5,45.

Comparacion con el release anterior, `ahmedheakl/rand-mobile` (single-stream, con su cfg recomendado de 1,5 y 12 pasos):

| Metrica | Rand-dual | Rand-mobile |
|---|---|---|
| DPG-Bench | 84,12 | 82,19 |
| FID (MJHQ-30K) | 13,16 | 14,36 |
| ImageReward | 1,083 | 0,957 |
| GEdit-EN | 6,80 | 6,74 |
| GenEval | 0,897 | 0,902 |

Sobre APG: a cfg 3.0 con APG, DPG, FID e ImageReward superan al cfg plano 2.0. En edicion no se recomienda APG (a cfg 3.0 subio GEdit en 0,15 pero bajo ImgEdit en 0,06; a cfg 2.0 fue neutro).

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- Pesos del cabezal entrenado: alrededor de 1,2 GB en bf16 (el repositorio completo ocupa 1,6 GB, de los cuales 426 MB son el cabezal upsampler de 1024 px).
- El pipeline completo requiere ademas el VLM congelado `openbmb/MiniCPM-V-4_6` y el DC-AE de `Efficient-Large-Model/Sana_600M_512px_diffusers`; el consumo de VRAM del VLM no se detalla en la informacion proporcionada.
- GPU de referencia en las mediciones del autor: RTX PRO 6000 Blackwell (una unidad, en reposo). No se publican mediciones en GPUs de consumo.
- Viabilidad en GPU de consumo: el cabezal por si solo cabe en cualquier GPU con 4 GB o mas en bf16, pero la idoneidad del pipeline completo depende del VLM, cuyo tamano no se especifica. No hay datos publicados de cuantizacion que permitan estimar el ajuste a GPUs pequenas.
- Despliegue: el autor publica codigo de inferencia propio en el repositorio GitHub `ahmedheakl/mobileov2-minicpm` (`python infer.py --prompt ...`, `--image ...`, `--size 1024`), que descarga automaticamente los tres componentes en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientadas a modelos de lenguaje y no a este pipeline de difusion.
- Latencia medida (una imagen, batch 1, 20 pasos, mediana de 31 ejecuciones tras 5 de calentamiento, RTX PRO 6000 Blackwell):
  - Texto a imagen, codificacion VLM + conector: 196 ms.
  - Texto a imagen, 20 pasos + decodificacion con APG cfg 3.0: 649 ms.
  - Texto a imagen extremo a extremo a 512 px: 844 ms (aproximadamente 1,19 imagenes por segundo, valor derivado).
  - Texto a imagen extremo a extremo a 1024 px: 904 ms.
  - Edicion, codificacion VLM + conector en las dos ramas: 394 ms.
  - Edicion, codificacion del latente de origen (solo dual-stream): 34 ms.
  - Edicion, 20 pasos + decodificacion con cfg 2.0: 646 ms.
  - Edicion extremo a extremo: 1.078 ms (aproximadamente 0,93 ediciones por segundo, valor derivado).
- El coste de APG frente al guiado plano es de 2,8 ms por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rand-dual (`ahmedheakl/rand-dual`) | 600,6 M (cabezal entrenado) | no disponible | GenEval 0,897; DPG 84,12; FID 13,16; ImageReward 1,083; GEdit-EN 6,80; ImgEdit 3,28 | Apache 2.0 | Pesos del cabezal en HuggingFace; requiere VLM y DC-AE externos |
| Rand-mobile (`ahmedheakl/rand-mobile`), predecesor single-stream | no disponible | no disponible | DPG 82,19; FID 14,36; ImageReward 0,957; GEdit 6,74; GenEval 0,902 | no disponible en la informacion proporcionada | Pesos publicados en HuggingFace |
| Sana-600M-512px (`Efficient-Large-Model/Sana_600M_512px_diffusers`) | 600 M (DiT) | no disponible | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace; usado como esqueleto del DiT, DC-AE y configuracion del scheduler |

Otros sistemas de texto a imagen de la misma franja de tamano no se han podido comparar con datos: no hay cifras publicadas en la informacion disponible.

## Limitaciones y advertencias

- El repositorio no es autosuficiente: contiene solo los 604 tensores entrenados. Sin el VLM `openbmb/MiniCPM-V-4_6` ni el DC-AE de Sana no se puede ejecutar, y esos componentes tienen sus propias licencias y condiciones.
- Objetivos no alcanzados en las propias metricas del autor: GenEval 0,897 (< 0,90), DPG-Bench 84,12 (< 85), FID 13,16 (> 8) e ImgEdit 3,28 (< 3,5).
- Renderizado de texto en imagen muy debil: 0,076 de precision por palabra en CVTG-2K, lo que desaconseja su uso para carteles, logotipos o cualquier imagen con tipografia legible.
- PRISM de 5,66, un valor que el autor no acompana de umbral objetivo; no hay contexto publicado para interpretarlo.
- No se documentan idiomas soportados. El unico benchmark de edicion con variante linguistica es GEdit-EN (ingles) y el juez utilizado es Qwen2.5-VL-72B, por lo que el comportamiento en castellano no esta evaluado.
- No se especifica la longitud de contexto del VLM, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni el uso de RLHF o DPO.
- Riesgo de alucinacion visual inherente a los modelos de difusion: no hay estudios publicados de fidelidad factual ni de sesgos demograficos para este checkpoint.
- La compuerta de origen anade 34 ms por edicion y no debe interpretarse como una garantia de preservacion exacta de la imagen fuente: el DiT sigue generando el latente completo y solo recibe una senal adicional escalada por tanh(gate) = +0,119.
- Los ajustes de guiado no son intercambiables: APG esta recomendado para texto a imagen pero no para edicion, donde empeora ImgEdit.
- No se publican mediciones en GPUs de consumo, por lo que las estimaciones de despliegue en hardware de gama baja no estan respaldadas por datos del autor.
- Licencia Apache 2.0 para este repositorio, lo que permite uso comercial del cabezal, pero las condiciones del VLM MiniCPM-V-4.6 y del DC-AE de Sana deben verificarse por separado antes de un despliegue en produccion.
- Fecha de creacion registrada en HuggingFace: 2026-10-08; ultima actualizacion 2026-10-08. El modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedheakl/rand-dual
- Codigo de inferencia (repositorio del autor): https://github.com/ahmedheakl/mobileov2-minicpm
- Release anterior, single-stream: https://huggingface.co/ahmedheakl/rand-mobile
- Arbol de ficheros de rand-mobile: https://huggingface.co/ahmedheakl/rand-mobile/tree/main
- VLM congelado requerido: https://huggingface.co/openbmb/MiniCPM-V-4_6
- Esqueleto del DiT, DC-AE y configuracion del scheduler: https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers
- Perfil del autor en HuggingFace: https://huggingface.co/ahmedheakl
- Perfil del autor en GitHub: https://github.com/ahmedheakl
