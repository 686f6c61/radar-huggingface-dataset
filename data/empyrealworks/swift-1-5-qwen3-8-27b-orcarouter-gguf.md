# empyrealworks/Swift-1.5-Qwen3.8-27B-OrcaRouter-GGUF

## Resumen

Swift 1.5 Qwen3.8 27B OrcaRouter es una distribución GGUF de un modelo derivado de Qwen3.8-27B, adaptado por UkisAI (Swift 1.5), posteriormente modificado por ajgazin para eliminar la dirección de rechazo (OrcaRouter) y finalmente reempaquetado por empyrealworks en este repositorio. El resultado es un modelo de 27B parámetros de tipo denso (no MoE), con capacidad de visión y decodificación especulativa DFlash2, orientado a uso conversacional sin filtros de rechazo.

El repositorio no contiene pesos originales: aloja copias byte a byte de tres ficheros (modelo principal cuantizado IQ4_XS, proyector multimodal BF16 y modelo borrador DFlash2 Q4_K_M) fijados a una revisión concreta. La relevancia actual reside en que combina contexto nativo de 262.144 tokens, visión y decodificación especulativa en un paquete listo para ejecutarse con llama.cpp o con el runtime Gufo sobre hardware AMD Strix Halo (gfx1151).

La licencia es la Swift Open License v1.0 (marcada como "other" en Hugging Face), con avisos Apache 2.0 de Qwen retenidos y el modelo borrador bajo Apache 2.0. No es un lanzamiento oficial de UkisAI, Qwen, ajgazin, Inco AI ni z-lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B), con soporte de visión y decodificación especulativa DFlash2 |
| Parametros totales | 27B (nominal); el campo de safetensors del repo indica 1.924.404.480, dato no coherente con el nombre del modelo y probablemente correspondiente solo a un componente |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo) |
| Tipos de cuantizacion | IQ4_XS dinámico con algunas proyecciones en Q2_K, IQ2_S, IQ2_XS e IQ3_XXS; proyector multimodal BF16; borrador DFlash2 en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License 1.0 (etiqueta "other"); borrador DFlash2 bajo Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27B parámetros. Sobre esa base, UkisAI produjo Swift 1.5, una adaptación conversacional; ajgazin aplicó después una derivación denominada OrcaRouter que elimina la dirección de rechazo del modelo, dando lugar a la variante "Uncensored". La cuantización es un mix dinámico IQ4_XS: la mayoría de proyecciones en IQ4_XS y unas pocas degradadas a Q2_K, IQ2_S, IQ2_XS e IQ3_XXS para reducir el tamaño del fichero a 14,25 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las etapas de UkisAI o ajgazin. La innovación técnica destacable es la integración de decodificación especulativa DFlash2 mediante un modelo borrador de 1,14 GB (Q4_K_M) desarrollado por Inco AI y convertido por z-lab, que acelera la generación al proponer tokens que el modelo principal verifica en paralelo. El runtime Gufo requiere tres parches sobre llama.cpp para decodificar en GPU las proyecciones Q2_K, IQ2 e IQ3_XXS de este mix concreto.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (262.144 tokens).
- Razonamiento configurable mediante `--reasoning-effort` (hasta `xhigh`) y modo thinking preservable con `--preserve-thinking on`.
- Capacidad de visión gracias al proyector multimodal `mmproj-BF16.gguf`.
- Decodificación especulativa DFlash2 para acelerar la inferencia.
- Comportamiento sin rechazo (uncensored) por la derivación OrcaRouter.
- Compatibilidad con endpoints (`endpoints_compatible`) para servir vía API HTTP.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo: el modelo puede mantener conversaciones de cientos de miles de tokens sin truncar, adecuado para analizar documentos extensos o historiales completos en una sola sesión.
- Procesamiento de documentación técnica con visión: gracias al proyector multimodal, puede extraer información de capturas, diagramas o páginas escaneadas combinadas con texto.
- Investigación sobre alineación y rechazo: la variante OrcaRouter permite estudiar el comportamiento del modelo cuando se elimina la dirección de rechazo, útil en experimentos de seguridad y evaluación de sesgos.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo donde los filtros estándar de rechazo resultan limitantes.
- Despliegue local en hardware de consumo alto o estaciones AMD Strix Halo: el mix IQ4_XS de 14,25 GB cabe en GPUs con 16 GB o más, permitiendo inferencia privada sin conexión.
- Servicio de API compatible con OpenAI: el flag `endpoints_compatible` y el servidor Gufo (`gufo serve`) permiten exponer el modelo como endpoint HTTP para integrarlo en aplicaciones existentes.
- Aceleración de inferencia en producción: la decodificación especulativa DFlash2 reduce la latencia en generación autoregresiva, útil para aplicaciones interactivas con requisitos de tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas. La página de UkisAI (ukisai.com/swift-1-5-27b) y el repositorio `ukisai/Swift-1.5-Qwen3.8-27b-INT4` mencionan comparativas entre Qwen3.8-27B, Swift 1.0 y Swift 1.5 con protocolos de evaluación de cinco repeticiones, pero los valores concretos no se han proporcionado en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo principal IQ4_XS: aproximadamente 14,3 GB solo para los pesos, más overhead de contexto KV; con 262.144 tokens de contexto el consumo adicional de KV cache es significativo y requiere planificación cuidadosa.
- VRAM adicional para el proyector de visión: 0,93 GB (BF16).
- VRAM adicional para el borrador DFlash2: 1,14 GB (Q4_K_M).
- Total mínimo estimado para visión + especulación: en torno a 16,4 GB solo en pesos, más KV cache.
- GPU recomendadas: AMD Strix Halo (gfx1151) es el objetivo declarado del runtime Gufo; en NVIDIA se puede usar llama.cpp con las mismas cuantizaciones, aunque los parches de Gufo para proyecciones Q2_K/IQ2/IQ3_XXS en GPU no están disponibles en upstream.
- Cabe en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) con contexto reducido; en 16 GB (RTX 4080, RX 7900 XT) solo con contexto moderado y sin visión simultánea.
- Opciones de despliegue: Gufo (`gufo serve`, con soporte de DFlash2 y visión), llama.cpp (carga los ficheros sin cambios), y potencialmente otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponible. La decodificación especulativa DFlash2 está diseñada para reducir latencia, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8 27B OrcaRouter (este) | 27B denso | 262.144 | Sí | Swift Open License 1.0 | GGUF en HF |
| Qwen3.8-27B (base) | 27B denso | no disponible | no disponible | Apache 2.0 (según avisos retenidos) | HF |
| Swift 1.5 Qwen3.8-27B (UkisAI) | 27B denso | no disponible | no disponible | no disponible | HF (INT4) |
| Swift 1.5 Qwen3.8-27B Uncensored Dynamic MTP (ajgazin) | 27B denso | no disponible | Sí (mmproj) | Swift Open License 1.0 | GGUF en HF |

Los datos de rendimiento comparativo entre estas variantes no están disponibles en la información proporcionada. La diferencia principal de este repositorio frente al de ajgazin es que fija una revisión concreta con hashes SHA-256 verificados e incluye el borrador DFlash2 de z-lab.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminación de la dirección de rechazo implica que puede generar contenido que otros modelos bloquearían; requiere supervisión en producción.
- Riesgo de alucinación inherente a modelos de 27B sin benchmarks publicados que lo cuantifiquen.
- La licencia Swift Open License 1.0 no es una licencia estándar de código abierto; es necesario revisar el fichero LICENSE antes de uso comercial.
- El campo de parámetros en safetensors (1.924.404.480) no coincide con el nombre del modelo (27B); posible inconsistencia en los metadatos del repositorio.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado más allá de lo que herede de Qwen3.8-27B.
- El mix de cuantización degrada algunas proyecciones a Q2_K, IQ2_S, IQ2_XS e IQ3_XXS, lo que puede afectar a la calidad frente a una cuantización uniforme IQ4_XS.
- El runtime Gufo requiere tres parches sobre llama.cpp para decodificar en GPU las proyecciones de baja precisión; sin ellos, el rendimiento puede degradarse.
- Contexto de 262.144 tokens: el KV cache asociado puede consumir decenas de GB de VRAM, haciendo inviable el contexto completo en GPUs de consumo.
- No es un lanzamiento oficial de UkisAI, Qwen, ajgazin, Inco AI ni z-lab; el soporte y la trazabilidad recaen en el reempaquetador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/empyrealworks/Swift-1.5-Qwen3.8-27B-OrcaRouter-GGUF
- Modelo base (ajgazin): https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Modelo borrador DFlash2 (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Swift 1.5 INT4 (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- Página de UkisAI Swift 1.5: https://ukisai.com/swift-1-5-27b
