# lte-ai/GLM-5.3-Flash-Strata-Q2Q3-Experts

## Resumen

GLM-5.3-Flash-Strata-Q2Q3-Experts es un conjunto de pesos GGUF experimentales publicados por el usuario lte-ai para ejecutar el modelo GLM-5.3-Flash en ordenadores convencionales, no en clústeres de GPU. Parte de dos modelos existentes: los shards UD-Q2_K_XL de unsloth/GLM-5.3-Flash-GGUF y el modelo podado patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF. El repositorio no contiene un modelo nuevo ni un ajuste fino: contiene recuantizaciones de los expertos enrutados (de IQ2_XS a Q2_K en las proyecciones gate/up y de IQ3_XXS a Q3_K en las proyecciones down) más una versión completa con la mitad de los expertos eliminados mediante REAP-50. El autor advierte explícitamente de que esto altera los valores de los pesos y no es un reempaquetado sin pérdidas.

El objetivo es hacer viable la inferencia local de un modelo de gran tamaño mediante el fork LightTransport Strata. Se ofrecen dos escenarios medidos: un equipo con 128 GB de RAM y una GPU NVIDIA de 16 GB (RTX 5060 Ti), que usa los shards originales más un archivo lateral de expertos, y un equipo con 64 GB de RAM y una GPU AMD de 16 GB (RX 9070 XT, ROCm), que usa el modelo REAP-50 ensamblado y autocontenido. El peso total declarado en safetensors es de 292.326.211.584 parámetros y el repositorio ocupa 168,7 GB.

La relevancia del proyecto es fundamentalmente práctica: documenta con números medidos (velocidad de decodificación, prefill, perplejidad, KL, top-1 y HumanEval) el coste de calidad que se paga por reducir el tamaño de los expertos, algo que la mayoría de publicaciones de cuantización no hace. La licencia es MIT. El número de descargas (14) y de "me gusta" (0) indica que es un artefacto muy reciente y de nicho, publicado el 7 de octubre de 2026 y actualizado el 10 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) según la model card: expertos enrutados, router y predicción multi-token (MTP); variante REAP-50 con 144 expertos y enrutado top-8. Detalle completo de la arquitectura base: no disponible |
| Parametros totales | 292.326.211.584 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en los ejemplos de reproducción se usa `--context=8192`, pero no se declara como contexto máximo del modelo) |
| Tipos de cuantizacion | Q2_K (gate/up de expertos), Q3_K (down de expertos), Q4_K_M (base del modelo REAP-50), origen IQ2_XS/IQ3_XXS, shards UD-Q2_K_XL de Unsloth |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivos ensamblados y archivos laterales de expertos) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su contenido son conversiones de cuantización y un recorte de expertos sobre GLM-5.3-Flash, un transformer de mezcla de expertos. Los archivos laterales `experts-q23.gguf` (105,5 GB) y `experts-q22.gguf` (95,9 GB) contienen únicamente los pesos de los expertos enrutados recuantizados: las proyecciones gate/up pasan de IQ2_XS a Q2_K y las down de IQ3_XXS a Q3_K, dejando la capa 11 sin cambios. En `experts-q22.gguf` otras 39 proyecciones down también se rebajan a Q2_K, lo que reduce un 9,1 % los bytes de expertos. El resto de pesos (densos, atención, router, MTP y expertos no convertidos) se cargan desde los cuatro shards originales de Unsloth, y requieren el cargador `--expert-pack` del fork Strata.

La variante REAP-50 aplica el método REAP con un 50 % de poda sobre los expertos: conserva 144 expertos con enrutado top-8 y ensambla los expertos recuantizados en Q2_K/Q3_K dentro de una base Q4_K_M, dando un único archivo de 63,2 GB. Los archivos `GLM-5.3-Flash-Q23-assembled.gguf` (120,9 GB) y `reap50/GLM-5.3-Flash-REAP50-Q23-assembled.gguf` (63,2 GB) son autocontenidos y no necesitan shards adicionales. No se documenta en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO para el modelo base. La model card incluye sumas SHA-256 para los archivos principales y un JSON de calidad con el error de reconstrucción por proyección.

## Capacidades

- Generación de texto y código: el modelo deriva de GLM-5.3-Flash y en la model card se evalúa con HumanEval (153/164 frente a 154 de la referencia sin recuantizar) y con una tarea de revisión de código en C++ del propio fork Strata.
- Predicción multi-token (MTP): el fork Strata la explota con profundidades de 1 y 3 (`MTP depth 1`, `MTP depth 3 soft acceptance`) como mecanismo de aceleración de la decodificación.
- Ejecución local con presupuesto de GPU limitado: soporta reparto de capas entre GPU y CPU con parámetros de afinidad, presupuesto de VRAM (`--gpu-budget-mib`) y grafo de decodificación (`--decode-graphs`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo de 128 GB con GPU de 16 GB: usando los cuatro shards de Unsloth más `experts-q23.gguf` con el cargador `--expert-pack`, se obtienen 23,1 tok/s de decodificación con prompt de 2K y 23,0 tok/s con 8K. Es el escenario objetivo declarado por el autor.
- Despliegue en equipo de 64 GB con GPU AMD de 16 GB: el archivo `reap50/GLM-5.3-Flash-REAP50-Q23-assembled.gguf` es autocontenido, no tiene comprobación de huella de los shards y se ejecuta bajo ROCm a 10,2 tok/s por defecto y 16,5 tok/s con el perfil de afinidad 0,06.
- Asistencia de programación y revisión de código: el modelo supera la tarea de revisión de código en C++ del fork Strata con el perfil de afinidad 0,06, y mantiene 153/164 en HumanEval tras la recuantización, lo que lo hace utilizable para tareas de generación y revisión donde se tolere una pérdida de calidad pequeña.
- Investigación en cuantización de MoE: los archivos `experts-q2{2,3}.gguf.quality.json` aportan el error de reconstrucción por proyección y la huella de origen, lo que permite reproducir y comparar metodologías de recuantización de expertos con métricas objetivas.
- Procesamiento por lotes con prompts largos: el prefill medido alcanza 428 tok/s en una pasada única de 8K en el equipo de 128 GB, adecuado para cargas de resumen o análisis de documentos largos en modo offline.
- Evaluación comparativa de recetas de poda: el repositorio permite contrastar Q23 frente a Q22 frente a REAP-50 con las mismas métricas (perplejidad, KL, top-1), útil para decidir el compromiso calidad/tamaño antes de desplegar en producción.
- Prototipado en hardware de consumo sin clúster: el escenario de 64 GB con una RX 9070 XT demuestra que el modelo puede ejecutarse en un equipo de sobremesa, aunque con degradación de calidad notable.

## Benchmarks y rendimiento

| Metrica | Q23 (sidecar) | Q22 (sidecar) | REAP-50 | Referencia |
|---|---:|---:|---:|---:|
| Perplejidad (cambio relativo) | +2,07 % | +8,45 % | 11,12 (vs 8,57, +29,8 %) | 8,57 (UD-Q2_K_XL) |
| KL | +0,018 | +0,100 | 0,587 | no disponible |
| Top-1 (variación) | −0,29 pt | −3,6 pt | 69,8 % | no disponible |
| HumanEval | 153/164 | no disponible | no disponible | 154/164 |

| Equipo | Pesos | Decode tok/s | Prefill tok/s |
|---|---|---:|---:|
| 128 GB, Threadripper 1950X, RTX 5060 Ti 16 GB (PCIe 3.0 x8) | shards + `experts-q23.gguf`, afinidad 0,08, MTP profundidad 1 | 23,1 (2K), 23,0 (8K) | 131 (2K), 428 (8K, pasada única) |
| 128 GB, mismo equipo | shards + `experts-q22.gguf`, denso Q4_K, MTP profundidad 3, afinidad 0,14, top-k 6, guarda de repetición | 36,2 (2K), 38,1 (8K) | 143 (2K) |
| 64 GB, Ryzen 3950X, RX 9070 XT 16 GB (ROCm) | REAP-50 ensamblado, configuración por defecto | 10,2 | 230 |
| 64 GB, mismo equipo | REAP-50 ensamblado, perfil de afinidad 0,06 | 16,5 | 229 |

Las velocidades son medianas de tres continuaciones cronometradas de 512 tokens (128 en el caso del perfil por defecto del B550) tras un calentamiento. El autor indica que el perfil Q22 no está cualificado y que no son promesas para otro hardware. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Host de 128 GB de RAM para el escenario de shards más archivo lateral de expertos; la GPU medida es una RTX 5060 Ti de 16 GB con PCIe 3.0 x8, con presupuesto de VRAM configurable (`--gpu-budget-mib=12288` en el ejemplo).
- Host de 64 GB de RAM para el modelo REAP-50 ensamblado; la GPU medida es una RX 9070 XT de 16 GB bajo ROCm.
- CPU: Threadripper 1950X en el escenario de 128 GB y Ryzen 3950X en el de 64 GB, ambos con reparto de afinidad NUMA (`numactl --interleave=all`, `--cpu-affinity=numa`).
- Espacio en disco: 168,7 GB para el repositorio completo; 120,9 GB para el archivo ensamblado Q23, 105,5 GB para `experts-q23.gguf`, 95,9 GB para `experts-q22.gguf` y 63,2 GB para el REAP-50 ensamblado.
- GPU de consumo: sí, en tarjetas de 16 GB, pero el modelo no cabe completo en VRAM; se ejecuta con reparto CPU/GPU y requiere 64 GB o 128 GB de RAM según la variante.
- Opciones de despliegue: exclusivamente el fork LightTransport Strata con el cargador `--expert-pack` para los laterales; otros motores no han sido probados según el autor. El archivo REAP-50 ensamblado es autocontenido pero sigue requiriendo un build de Strata con el cambio de cargador de archivo ensamblado.
- Latencia y rendimiento: 23,1 tok/s de decodificación y 131 tok/s de prefill en 2K en el perfil Q23; 36,2 tok/s en el perfil Q22 no cualificado; 10,2 tok/s (por defecto) y 16,5 tok/s (afinidad 0,06) para REAP-50 en ROCm. Compilar requiere CUDA con `-DSTRATA_ENABLE_CUDA=ON`, `-DCMAKE_CUDA_ARCHITECTURES=120` y `-DSTRATA_MMQ_KQUANTS=ON`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Calidad medida | Uso previsto | Licencia |
|---|---|---|---|---|---|
| lte-ai/GLM-5.3-Flash-Strata-Q2Q3-Experts | 292.326.211.584 (declarados) | GGUF Q2_K/Q3_K sobre base Q4_K_M y shards UD-Q2_K_XL | Perplejidad +2,07 % (Q23), +8,45 % (Q22), +29,8 % (REAP-50) frente a la referencia | Ejecución local con 64 o 128 GB de RAM y GPU de 16 GB | MIT |
| unsloth/GLM-5.3-Flash-GGUF (UD-Q2_K_XL) | no disponible en la información | GGUF en cuatro shards | Referencia del repositorio: perplejidad 8,57, HumanEval 154/164 | Cuantización base sin recuantizar expertos | no disponible en la información |
| patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF | no disponible en la información; 144 expertos top-8 según la model card del derivado | GGUF | no disponible | Variante con la mitad de expertos podados | no disponible en la información |

No se dispone de datos sobre otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Los archivos laterales de expertos no son un modelo completo: sin los cuatro shards UD-Q2_K_XL de Unsloth no cargan, y solo funcionan con el cargador `--expert-pack` de Strata; otros motores no han sido probados.
- La recuantización altera los valores de los pesos y no es un reempaquetado sin pérdidas: la perplejidad sube un 2,07 % en Q23, un 8,45 % en Q22 (perfil marcado como no cualificado) y un 29,8 % en REAP-50.
- El perfil Q22 usa ajustes que no reflejan fielmente la distribución original; el propio autor lo declara no cualificado y no apto para uso directo en producción.
- La poda REAP-50 elimina la mitad de los expertos y su calidad cae de forma severa (KL 0,587, top-1 69,8 %, perplejidad 11,12 frente a 8,57), por lo que no es adecuada para tareas que exijan fidelidad alta.
- Portabilidad limitada de los laterales: el cargador verifica tamaño, cabecera y fecha de modificación de los shards originales y no ofrece opción de omisión, de modo que una descarga nueva falla con `source fingerprint mismatch`. Hay que regenerar el lateral o restaurar las fechas originales, un apaño no probado.
- Todos los datos de velocidad y calidad proceden de dos configuraciones concretas de hardware y no deben extrapolarse a otras máquinas.
- No se documentan sesgos, comportamiento multilingüe, riesgo de alucinación ni política de uso responsable en la información disponible.
- Licencia MIT, que permite uso comercial, pero la licencia del modelo base GLM-5.3-Flash no se detalla en la información proporcionada; conviene verificarla antes de explotarlo en producción.
- El repositorio tiene 14 descargas y 0 "me gusta" en el momento de la consulta, por lo que la validación externa es prácticamente nula.

## Enlaces

- HuggingFace: https://huggingface.co/lte-ai/GLM-5.3-Flash-Strata-Q2Q3-Experts
- Modelo base (shards): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Modelo base podado: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Fork de inferencia: https://github.com/lighttransport/Strata
- Guía de reproducción citada: `docs/GLM_RELEASE_Q2Q3.md` (en el fork Strata)
- Guía de recuantización citada: `docs/GLM_Q2_REQUANTIZATION.md` (en el fork Strata)
- Resultados de la búsqueda web: no contienen información relevante sobre el modelo (los resultados obtenidos corresponden a LTE como tecnología de red móvil y a un laboratorio de astronomía homónimo, sin relación con este repositorio).
