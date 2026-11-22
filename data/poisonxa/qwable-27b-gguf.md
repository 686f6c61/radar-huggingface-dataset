# poisonxa/Qwable-27B-GGUF

## Resumen

Qwable-27B-GGUF es un repositorio de artefactos de benchmark publicado por el usuario poisonxa bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de dos conversiones cuantizadas del mismo modelo denso de 27B de la línea Qwen3.8-27B, en su variante "abliterated" (es decir, con el comportamiento de rechazo atenuado mediante edición de pesos). El propósito declarado del repositorio es permitir la reproducción de las comparativas de velocidad entre motores de inferencia (PXA) sobre tarjetas Tesla P100 y V100.

El repositorio contiene dos ficheros: `Qwable-27B-PXQ4core.gguf`, en formato propietario PXQ4 (codec `pxq_llama`, 15,7 GB) que solo ejecuta el motor pxq_llama, y `Qwable-27B-MXFP4-lite.gguf`, en MXFP4 (15,0 GB), compatible con llama.cpp mainline, ik_llama.cpp y pxq_llama. Ambos parten de los mismos pesos, de modo que las diferencias de rendimiento medidas corresponden al motor y no al modelo.

El interés del repositorio es, por tanto, instrumental: sirve como material de referencia para evaluar el rendimiento de motores de inferencia sobre hardware de datacenter antiguo (P100/V100) con un modelo de 27 320 697 856 parámetros. No se documentan en la información disponible datos de entrenamiento, capacidades, idiomas ni resultados de calidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (línea Qwen3.8-27B, variante abliterated); detalles no disponibles |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PXQ4 (codec pxq_llama) y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos variantes: PXQ4 y MXFP4) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un transformer denso híbrido de la línea Qwen3.8-27B, en una variante "abliterated", lo que implica una modificación post-entrenamiento de los pesos orientada a suprimir la dirección de rechazo en el espacio de activaciones. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento original.

Tampoco se documentan el volumen de tokens de preentrenamiento, las etapas de ajuste (SFT, RLHF, DPO) ni innovaciones técnicas del modelo base. La única información técnica concreta del repositorio se refiere al proceso de cuantización: dos conversiones de los mismos pesos a PXQ4 y MXFP4, con sumas sha256 publicadas (`6fb4a437684e8bbe` y `1d04b75817358cf7` como primeros 16 caracteres) para verificación de integridad. El protocolo de benchmark asociado especifica temperatura 0, mediana de 7 ejecuciones, ficheros verificados por sha y prompts únicos.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con APIs compatibles con OpenAI.
- Ejecución multiplataforma de inferencia: la variante MXFP4 funciona en llama.cpp mainline, ik_llama.cpp y pxq_llama; la variante PXQ4 queda restringida a pxq_llama.
- No se documentan capacidades de razonamiento explícito, código, matemáticas, visión, audio, tool calling ni agentes en la información disponible.
- No se documenta soporte multilingüe ni modo de pensamiento (thinking mode).

## Casos de uso

- Reproducción de benchmarks de motores de inferencia: descargar ambos ficheros y ejecutar el protocolo de `bench/fair/protocol.md` para verificar las cifras de velocidad publicadas en las notas de la release PXA, con garantía de que los pesos son idénticos entre motores.
- Evaluación de hardware de datacenter legacy: medir throughput y latencia en Tesla P100 y V100, tarjetas sin soporte de las extensiones de precisión más recientes, para decidir si merece la pena reutilizar este parque instalado frente a migrar a A100/H100.
- Comparativa de codecs de cuantización: contrastar PXQ4 frente a MXFP4 sobre el mismo modelo de 27B, midiendo el impacto del codec en velocidad y en consumo de memoria (15,7 GB frente a 15,0 GB).
- Validación de pipelines de despliegue GGUF: usar los ficheros como caso de prueba en integraciones con llama.cpp o ik_llama.cpp, comprobando la verificación de checksums y la compatibilidad de metadatos.
- Investigación sobre edición de pesos: al ser una variante abliterated, sirve para estudiar el efecto de la supresión de la dirección de rechazo en el comportamiento conversacional de un modelo de 27B.
- Pruebas de integración con endpoints compatibles: validar clientes y pasarelas que consumen APIs con formato OpenAI contra un modelo servido localmente en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio solo contiene material para benchmarks de velocidad de motores de inferencia; las cifras concretas se remiten a las notas de la release PXA y a `bench/fair-battle.md`, no incluidas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,0 GB con MXFP4 y 15,7 GB con PXQ4, solo para los pesos; hay que añadir la memoria de la caché KV, cuyo tamaño depende de la longitud de contexto (no documentada).
- GPU validadas por el autor: Tesla P100 y Tesla V100, empleadas en las comparativas de velocidad publicadas.
- GPU consumer: con 15-16 GB de pesos, el modelo entra en tarjetas de 24 GB (RTX 3090, RTX 4090) dejando margen para caché KV en contextos moderados; en tarjetas de 16 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: llama.cpp mainline e ik_llama.cpp para el fichero MXFP4; pxq_llama para ambos ficheros (PXQ4 y MXFP4).
- Latencia y throughput: no disponibles en la información proporcionada; las cifras están en las notas de la release PXA y en `bench/fair-battle.md`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwable-27B-GGUF (este) | 27,3B denso | No disponible | GGUF (PXQ4, MXFP4) | Apache 2.0 | Variante abliterated; artefactos de benchmark |
| Qwen3.8-27B (modelo base) | 27B denso | No disponible | Safetensors y derivados | No disponible en la informacion | Modelo original sin abliterar |
| Otras conversiones GGUF de 27B | ~27B | Variable | GGUF | Variable | No disponible comparativa concreta |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado ni ajustado por el autor: son conversiones cuantizadas de un modelo de terceros, por lo que cualquier problema de calidad, sesgo o alucinación proviene del modelo base.
- La variante abliterated suprime deliberadamente el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado sin las salvaguardas habituales; no es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable el comportamiento típico de un modelo de 27B sin datos de evaluación publicados.
- La variante PXQ4 solo funciona en pxq_llama, un motor no estándar; esto limita la portabilidad y añade dependencia de un proyecto concreto.
- No se documentan idiomas soportados, longitud de contexto ni límites de uso; hay que verificarlos empíricamente antes de desplegar.
- Aunque la licencia declarada es Apache 2.0, la procedencia del modelo base (línea Qwen3.8) y de la edición abliterated debe verificarse por separado antes de un uso comercial.
- El repositorio está pensado para reproducir benchmarks, no como distribución de referencia del modelo; los 660 descargos y 2 likes indican una adopción muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/poisonxa/Qwable-27B-GGUF
- Repositorio del motor PXA: https://github.com/poisonxa16/pxa
- Discord PXA Network: https://discord.pxanetwork.com
- Reddit r/PXANetwork: https://www.reddit.com/r/PXANetwork/
