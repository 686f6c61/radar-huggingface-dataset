# mradermacher/Qwen3-4B-Stratos-GPT-OSS-120B-SFT-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `RationalPursuit/Qwen3-4B-Stratos-GPT-OSS-120B-SFT`, preparadas por mradermacher, un autor conocido por distribuir versiones cuantizadas de modelos open source. El nombre sugiere que se trata de un modelo de 4 mil millones de parámetros basado en la familia Qwen3, ajustado mediante supervisión fina (SFT) con datos generados por un modelo de 120B parámetros (posiblemente GPT-OSS-120B). Sin embargo, la información pública disponible es extremadamente limitada: no se especifican arquitectura, licencia, idiomas ni detalles de entrenamiento.

La relevancia de este modelo radica en su formato GGUF, que permite ejecutarlo en hardware de consumo mediante herramientas como llama.cpp u Ollama. Al ser una cuantización estática, ofrece varias opciones de precisión (desde Q2_K hasta F16) para equilibrar calidad y requisitos de memoria. No obstante, al carecer de documentación oficial, su uso en producción requiere verificación previa de rendimiento y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Qwen3, sin confirmar) |
| Parametros totales | 4B (según el nombre, no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El nombre del modelo original (`Qwen3-4B-Stratos-GPT-OSS-120B-SFT`) sugiere que parte de la arquitectura Qwen3 (probablemente un transformer decoder-only) y que fue sometido a un ajuste supervisado (SFT) con datos generados por un modelo de 120B parámetros, pero esto es una inferencia basada en la nomenclatura y no está confirmado por el autor. Tampoco se detalla si se emplearon técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

No se dispone de información verificada sobre las capacidades específicas del modelo. Dado que es una cuantización de un modelo SFT basado en Qwen3, es plausible que herede capacidades de generación de texto, razonamiento y posiblemente código, pero no hay evidencia documental. No se confirma soporte para tool calling, agentes, visión o audio.

## Casos de uso

Al no existir documentación oficial, los casos de uso son hipotéticos y deben validarse empíricamente:

- Prototipado rápido de aplicaciones de chat o generación de texto en entornos con recursos limitados, gracias a su formato GGUF y tamaño de 4B.
- Experimentación con cuantizaciones extremas (Q2_K, IQ4_XS) para estudiar el equilibrio entre tamaño y calidad en tareas de generación.
- Despliegue local en portátiles o estaciones de trabajo con GPU de gama media, usando llama.cpp u Ollama, para pruebas de concepto.
- Fine-tuning adicional sobre dominios específicos si la licencia lo permite (aunque esta no está especificada).
- Comparación de rendimiento entre distintas cuantizaciones del mismo modelo base para seleccionar la más adecuada a un hardware concreto.
- Integración en pipelines de generación de texto donde se requiera un modelo pequeño y rápido, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar objetivamente con otros modelos sin datos verificados.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Como referencia genérica para un modelo de 4B en GGUF:

- VRAM estimada: entre 2 GB (Q2_K) y 8 GB (F16) aproximadamente, dependiendo de la cuantización y la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 o superiores; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Compatibilidad con consumer GPU: sí, en la mayoría de cuantizaciones.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos. Existen otros repositorios del mismo autor con nombres análogos (Qwen3-4B-Stratos-Qwen235B-SFT-GGUF y Qwen3-4B-Stratos-R1-SFT-GGUF), que probablemente sean variantes del mismo modelo base con diferentes fuentes de datos SFT, pero no se han publicado métricas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican licencia, arquitectura, datos de entrenamiento ni sesgos conocidos.
- Riesgo de alucinación y errores: al ser un modelo pequeño (4B) y cuantizado, es probable que presente limitaciones en tareas complejas de razonamiento o generación de código.
- Pérdida de calidad por cuantización: las versiones Q2_K e IQ4_XS pueden degradar significativamente la precisión.
- Uso comercial incierto: al no conocer la licencia del modelo base, no se puede garantizar su uso en aplicaciones comerciales.
- Sin garantías de soporte: el repositorio no incluye instrucciones de uso ni ejemplos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-Stratos-GPT-OSS-120B-SFT-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/RationalPursuit/Qwen3-4B-Stratos-GPT-OSS-120B-SFT
- Repositorios similares del mismo autor:
  - https://huggingface.co/mradermacher/Qwen3-4B-Stratos-Qwen235B-SFT-GGUF
  - https://huggingface.co/mradermacher/Qwen3-4B-Stratos-R1-SFT-GGUF
- Repositorio oficial de Qwen3 (contexto general): https://github.com/QwenLM/Qwen3
