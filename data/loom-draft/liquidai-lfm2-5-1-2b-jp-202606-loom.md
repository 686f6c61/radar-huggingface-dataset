# loom-draft/LiquidAI-LFM2.5-1.2B-JP-202606-loom

## Resumen
El paquete `loom-draft/LiquidAI-LFM2.5-1.2B-JP-202606-loom` es una distribucion empaquetada del checkpoint GGUF `LiquidAI/LFM2.5-1.2B-JP-202606-GGUF` en cuantizacion Q4_K_M, preparada para el motor de inferencia AMD Loom (`hrx-loom`). No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión de formato: el autor (`loom-draft`) ha generado los programas `.loom` y la tarjeta `model.json` con la herramienta `loom-next`, sin bucle de LLM en el proceso, según declara en la model card.

El modelo subyacente pertenece a la familia LFM2.5 de LiquidAI, con 1.200 millones de parametros y variante especifica para japones (sufijo `-JP-202606`). El paquete esta afinado para dos aceleradores concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia actual reside en que ofrece una via de despliegue optimizada sobre ROCm para hardware AMD de consumo y profesional, con mejoras medidas frente a llama.cpp en decodificacion y prefill.

La licencia es MIT tanto en el paquete como en el modelo base, lo que facilita su uso comercial. El repositorio es de reciente creacion (26 de noviembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de LiquidAI; el paquete es un contenedor de inferencia Loom) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (deducido del argumento `-c 65536` usado en la comparativa con llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | japones (variante `-JP`); resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) y paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre de la familia (LFM2.5) y el tamano (1.2B) son los unicos datos confirmados. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares.

El paquete Loom en si no modifica los pesos: la model card indica explicitamente que se parte del checkpoint GGUF "sin modificar". La innovacion tecnica del repositorio es el propio motor Loom, que ofrece espera activa de finalizaciones de GPU (`completion_spin_ns`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). En la comparativa publicada no se emplea decodificacion especulativa (no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto).

## Capacidades
- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de tool calling (la tabla de caracteristicas de la model card se corta en la entrada "tool calli...", por lo que el detalle completo no esta disponible).
- Capacidad multilingue limitada a japones segun la variante del modelo; el resto de idiomas no esta documentado.
- Servicio concurrente: la comparativa incluye una prueba con 4 peticiones en paralelo.
- Procesamiento de prompts largos: se miden prefill sobre documentos de hasta 32k tokens.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito ni agentes multi-paso.

## Casos de uso
- Asistencia conversacional en japones sobre hardware AMD: el modelo puede atender un endpoint compatible con OpenAI en una APU Strix Halo, lo que permite montar un chatbot local sin GPU dedicada.
- Procesamiento de documentos largos en japones: con 65.536 tokens de contexto y un prefill medido de 9.896 tok/s sobre 8k tokens, es adecuado para resumir o extraer informacion de contratos y manuales extensos.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: el paquete incluye comandos especificos para esta GPU de 32 GB, orientados a entornos profesionales con ROCm.
- Servicio multiinquilino ligero: la prueba de 4 flujos agrega 972,7 tok/s en decodificacion, suficiente para varias sesiones concurrentes de baja latencia.
- Integracion en pipelines con API OpenAI: al exponer `/v1/chat/completions`, encaja en herramientas existentes (LangChain, clientes OpenAI) sin adaptadores adicionales.
- Evaluacion comparativa de motores de inferencia: el paquete sirve como referencia reproducible para medir Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts.
- Prototipado de aplicaciones en japones en equipos de desarrollo con graficos integrados AMD, gracias a la cuantizacion Q4_K_M que reduce los requisitos de memoria.

## Benchmarks y rendimiento
Los datos publicados comparan Loom frente a llama.cpp ROCm (`llamacpp-rocm/b1374`) con el mismo GGUF en Strix Halo (gfx1151):

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | 222,7 | 259,5 | +17 % |
| Decodificacion tok/s, contexto 2k | 214,4 | 241,7 | +13 % |
| Decodificacion tok/s, contexto 32k | 152,5 | 159,7 | +5 % |
| Prefill tok/s, documento 1k | 6.933,6 | 9.781,2 | +41 % |
| Prefill tok/s, documento 2k | 7.100,0 | 9.974,5 | +40 % |
| Prefill tok/s, documento 8k | 6.912,6 | 9.896,5 | +43 % |
| Prefill tok/s, documento 16k | 6.258,9 | 8.686,8 | +39 % |
| Prefill tok/s, documento 32k | 5.070,8 | 7.172,5 | +41 % |
| 4 flujos, decodificacion agregada tok/s | 662,4 | 972,7 | +47 % |

No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Para la Radeon AI PRO R9700, la model card indica que los resultados "aun no se han vuelto a medir".

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; con cuantizacion Q4_K_M un modelo de 1.2B ocupa del orden de 0,7-1 GB de pesos, mas overhead del pool de memoria de Loom.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPU NVIDIA ni con GPU AMD de consumo distintas de las citadas.
- Despliegue: motor `hrx-loom` version 0.2.0, instalable con `pipx install "hrx-loom[hf]==0.2.0"`; flujo `loom-fetch` seguido de `loom-serve`.
- Throughput medido en Strix Halo: 259,5 tok/s en decodificacion con prompt corto y 9.974,5 tok/s en prefill de 2k.
- No se proporcionan datos de latencia por peticion ni de consumo energetico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| LiquidAI LFM2.5-1.2B-JP-202606 (este paquete) | 1,2B | 65.536 | MIT | GGUF Q4_K_M / Loom | Optimizado para Strix Halo y R9700 |
| LiquidAI LFM2.5-1.2B-JP-202606-GGUF (base) | 1,2B | no disponible | MIT | GGUF / llama.cpp y otros | Checkpoint original sin empaquetar |
| Otros modelos de ~1B para japones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La unica comparativa cuantitativa disponible es frente a llama.cpp ejecutando el mismo GGUF, recogida en la seccion de benchmarks.

## Limitaciones y advertencias
- El repositorio no contiene un modelo nuevo: es un empaquetado de inferencia; cualquier limitacion del modelo base LFM2.5-1.2B-JP se hereda intacta.
- Cobertura linguistica restringida a japones segun la variante; el comportamiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion propio de un modelo de 1,2B: capacidad limitada para razonamiento complejo y conocimiento factual.
- Sesgos conocidos: no documentados en la informacion disponible.
- Compatibilidad de hardware muy restringida: solo se certifican Strix Halo y Radeon AI PRO R9700; el resto de GPU AMD y NVIDIA quedan fuera del soporte declarado.
- La seccion de caracteristicas de la model card esta truncada, por lo que el alcance real del soporte de tool calling no puede confirmarse.
- Los benchmarks de la R9700 no se han re-medido; los de Strix Halo provienen de un unico entorno DevLab y puede haber variacion entre sesiones.
- La licencia MIT del paquete no exime de verificar la licencia del modelo base en su repositorio de origen antes de un uso comercial.

## Enlaces
- Repositorio del paquete: https://huggingface.co/loom-draft/LiquidAI-LFM2.5-1.2B-JP-202606-loom
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606-GGUF
- Motor Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ejecucion de referencia DevLab: https://github.com/loom-fun/loom-next/actions/runs/45877019941
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
