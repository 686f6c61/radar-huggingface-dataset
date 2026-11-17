# LlamaPal/LFM2-8B-A1B-Q4_K_M-GGUF

## Resumen

LFM2-8B-A1B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI. Con 8.339.930.560 parámetros totales y aproximadamente 1.500 millones de parámetros activos por token, está disenado para ofrecer un equilibrio entre calidad de respuesta propia de un modelo de 8B y una latencia propia de un modelo mucho más pequeno. Esta ficha describe concretamente la cuantización Q4_K_M en formato GGUF publicada por el usuario LlamaPal, que es una copia sin modificar del archivo oficial de LiquidAI/LFM2-8B-A1B-GGUF.

El interés de esta publicación no reside en una modificación del modelo, sino en su empaquetado y distribución: se trata del archivo exacto (5,0 GB, SHA-256 `d2185b22630fc68043dac7182f12e86e5ad14990229a90b6c9ad3f4421ddaf82`) que la aplicación LlamaPal descarga para ejecutar el modelo de forma totalmente offline en dispositivos Android. El repositorio actúa como espejo de distribución, no como derivado técnico.

Por tanto, la relevancia práctica es la de un artefacto listo para inferencia local en móvil mediante llama.cpp, con cuantización de 4 bits y licencia LFM Open License v1.0, que condiciona el uso comercial. Los detalles de arquitectura, entrenamiento y benchmarks corresponden al modelo base de Liquid AI y no se documentan en esta model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE); detalles de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 8.339.930.560 |
| Parametros activos | aproximadamente 1.500 millones por respuesta (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card de esta publicación no describe la arquitectura interna del modelo base. Lo único que se indica es que se trata de un modelo MoE con 8.339.930.560 parámetros totales de los cuales se activan aproximadamente 1.500 millones por respuesta, lo que reduce el coste computacional por token frente a un transformer denso del mismo tamano. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento.

Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.) en la información disponible. La única intervención técnica de esta publicación es la cuantización Q4_K_M realizada por Liquid AI y replicada byte a byte por LlamaPal, sin modificaciones: mismo archivo, mismo hash SHA-256.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Inferencia offline en dispositivo: el modelo está pensado para ejecutarse sin conexión en Android a través de LlamaPal.
- Compatibilidad con llama.cpp: al ser un GGUF estándar, puede cargarse en llama.cpp y en cualquier aplicación construida sobre él.
- Razonamiento y código: no se documentan capacidades específicas en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional offline en Android: el archivo está empaquetado para descargarse desde LlamaPal y funcionar sin internet ni cuenta, de modo que todo el texto permanece en el dispositivo; adecuado para usuarios que priorizan privacidad.
- Prototipado rápido en llama.cpp: al ser un GGUF estándar de 5,0 GB, permite probar un MoE de 8B en estaciones de trabajo sin infraestructura de servidor.
- Aplicaciones móviles de terceros basadas en llama.cpp: cualquier app que cargue GGUF puede reutilizar este archivo como modelo de chat por defecto.
- Evaluación comparativa de cuantizaciones: sirve como referencia Q4_K_M para medir la pérdida de calidad frente a cuantizaciones mayores del mismo modelo base.
- Entornos con conectividad intermitente: escenarios de campo, viajes o zonas sin red donde se necesita generación de texto local.
- Distribución reproducible: el hash SHA-256 publicado permite verificar la integridad del archivo en pipelines de despliegue o en espejos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo GGUF ocupa 5,0 GB, por lo que se necesita al menos esa cantidad de memoria libre más el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el enfoque principal de esta publicación es CPU/GPU integrada en Android.
- Despliegue: llama.cpp y aplicaciones basadas en él (LlamaPal en Android). vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2-8B-A1B (esta ficha, Q4_K_M) | 8.339.930.560 | ~1.500 millones | no disponible | LFM Open License v1.0 | GGUF |
| LFM2-8B-A1B (original, LiquidAI) | 8.339.930.560 | ~1.500 millones | no disponible | LFM Open License v1.0 | safetensors / GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se aportan evaluaciones específicas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en esta model card.
- Licencia: LFM Open License v1.0; es una licencia "other" que puede imponer restricciones al uso comercial. Debe revisarse el texto completo antes de cualquier despliegue en producción.
- Cuantización Q4_K_M: la reducción a 4 bits puede degradar la calidad frente a los pesos originales en tareas sensibles; no se aportan métricas de dicha degradación.
- Repositorio espejo: esta publicación no es mantenida por Liquid AI; la responsabilidad técnica y de soporte recae en el autor original.
- Sin garantías de rendimiento: no hay benchmarks publicados para esta cuantización concreta.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/LlamaPal/LFM2-8B-A1B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- GGUF original: https://huggingface.co/LiquidAI/LFM2-8B-A1B-GGUF
- Commit del archivo original: https://huggingface.co/LiquidAI/LFM2-8B-A1B-GGUF/tree/145e98524a2ed11d35a45e0080febcee063749b6
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
