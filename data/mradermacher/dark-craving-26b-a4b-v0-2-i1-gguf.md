# mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.2 es un modelo de lenguaje orientado a conversación para adultos, roleplay y contenido explícito, desarrollado por ReadyArt como modelo base y cuantizado en formato GGUF por mradermacher. Se trata de un fine-tune "unaligned" (sin alineamiento de seguridad) sobre una arquitectura Mixture-of-Experts de aproximadamente 25.230 millones de parámetros totales, con un tamaño nominal de 26B y una designación "A4B" que indica unos 4.000 millones de parámetros activos por token, típica de las variantes MoE eficientes derivadas de la familia Qwen3.

El modelo resuelve la necesidad de un asistente conversacional sin restricciones de contenido para casos de escritura creativa, juegos de rol por texto y experiencias de roleplay inmersivas, donde los modelos alineados convencionales rechazan sistemáticamente peticiones de contenido adulto. La ficha que nos ocupa corresponde específicamente a la colección de cuantizaciones GGUF con calibración imatrix (prefijo `i1-`), que abarca desde formatos de 1 bit hasta 6 bits, con tamaños que van de 8,4 GB a 22,7 GB, lo que permite desplegarlo en hardware de consumo.

La relevancia actual radica en la combinación de un MoE de 26B con solo ~4B activos y una licencia Apache 2.0, lo que facilita su ejecución local en GPUs de consumo con cuantizaciones Q4_K_M (~16,9 GB) manteniendo una calidad conversacional razonable. La model card indica además que se trata de un modelo con capacidades de visión, cuyos ficheros `mmproj` se distribuyen en el repositorio estático complementario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de la familia Qwen3 (designación A4B) |
| Parámetros totales | 25.233.142.046 (~25,2B) |
| Parámetros activos | ~4B por token (según designación "A4B"; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además, cuantizaciones estáticas en el repo complementario |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix separado de 0,2 GB para generar cuantizaciones propias); pesos originales del modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

El modelo base ReadyArt/Dark-Craving-26B-A4B-v0.2 emplea una arquitectura Mixture-of-Experts con 25,2 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token, siguiendo el patrón de las variantes MoE eficientes de la familia Qwen3 (denominación "A4B"). Esta configuración permite un coste de inferencia cercano al de un modelo denso de 4B mientras se preserva la capacidad representacional de un modelo de 26B, lo que resulta especialmente adecuado para despliegue local con cuantización.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Las etiquetas del modelo (`unaligned`, `nsfw`, `explicit`, `ERP`) sugieren un fine-tune deliberadamente desalineado o con alineamiento mínimo orientado a contenido adulto y roleplay, aunque los detalles técnicos del proceso de entrenamiento no están publicados en la información disponible. La model card menciona que se trata de un modelo con capacidades de visión, con ficheros `mmproj` distribuidos en el repositorio estático complementario, lo que implica un componente multimodal además del backbone de texto.

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis en diálogo inmersivo y roleplay de personajes.
- Escritura creativa y narrativa explícita para adultos, sin los rechazos típicos de modelos alineados.
- Capacidades de visión (modelo multimodal según la model card; ficheros `mmproj` en el repositorio estático).
- Soporte de instrucciones y formato conversacional (`instruct`, `conversational`).
- Funcionamiento sin alineamiento de seguridad (`unaligned`), orientado a contenido maduro y explícito.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés (`en`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional por texto: el modelo está específicamente afinado para mantener personajes coherentes en sesiones multi-turno, con un tono y estilo consistentes gracias a su naturaleza `conversational` e `instruct`; su diseño `unaligned` evita los rechazos que arruinan la inmersión en este tipo de aplicaciones.
- Escritura creativa para adultos: generación de narrativa explícita, ficción erótica y guiones de contenido maduro, un nicho donde los modelos alineados convencionales son inutilizables por sus políticas de rechazo.
- Plataformas de entretenimiento para adultos: integración como motor de diálogo en aplicaciones de chat con personajes, donde la licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales.
- Prototipado de asistentes de rol con personalidad: gracias a su tamaño MoE de 26B con ~4B activos, se puede desplegar en una sola GPU de consumo con cuantización Q4_K_M (~16,9 GB) para iterar rápidamente sobre prompts de personaje y system prompts.
- Investigación sobre alineamiento y seguridad: el modelo sirve como caso de estudio de un fine-tune deliberadamente desalineado, útil para estudiar comportamientos, sesgos y modos de fallo de modelos sin salvaguardas, en entornos controlados.
- Despliegue local con llama.cpp/Ollama: la disponibilidad de cuantizaciones desde 8,4 GB (IQ1_S) hasta 22,7 GB (Q6_K) permite ejecutar el modelo en estaciones de trabajo con 12-24 GB de VRAM, con el fichero imatrix incluido para generar cuantizaciones personalizadas.
- Generación de diálogo multimodal (si se usa con `mmproj`): al ser un modelo con capacidades de visión, puede emplearse para describir imágenes o mantener conversaciones que referencien contenido visual, aunque esta capacidad no está documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de fichero GGUF, más overhead de contexto y KV cache):
  - i1-IQ1_S: ~8,4 GB (calidad muy degradada, "for the desperate").
  - i1-IQ2_M: ~10,5 GB.
  - i1-IQ3_S: ~12,3 GB (el autor indica que supera a Q3_K*).
  - i1-IQ4_XS: ~14,0 GB.
  - i1-Q4_K_S: ~15,6 GB (el autor lo señala como tamaño/velocidad/calidad óptimos).
  - i1-Q4_K_M: ~16,9 GB (recomendado por el autor como rápido).
  - i1-Q5_K_M: ~19,2 GB.
  - i1-Q6_K: ~22,7 GB (prácticamente equivalente a Q6_K estático).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede alojar hasta Q6_K; una RTX 4080/4070 Ti Super (16 GB) queda limitada a IQ4_XS o Q4_K_S; GPUs de 12 GB solo admiten cuantizaciones IQ3 o inferiores. Para despliegue profesional, A100/H100 no son necesarias dado el bajo número de parámetros activos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q6_K y en GPUs de 16 GB con Q4_K_S/IQ4_XS.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) al ser formato GGUF; el repositorio declara `endpoints_compatible` y `transformers` como librería, pero el formato GGUF está pensado para motores basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa generalizada para este tipo de MoE.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con ~4B activos, el throughput debería ser sustancialmente mayor que el de un denso de 26B, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.2 (esta ficha) | ~25,2B | ~4B | no disponible | Apache 2.0 | Roleplay/NSFW sin alinear | GGUF (i1 y estático) en HF |
| Modelos base de la familia Qwen3 MoE (referencia arquitectónica) | ~30B | ~3B | 32K-128K (según variante) | Apache 2.0 | Propósito general alineado | Safetensors y GGUF |
| mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF (cuantizaciones estáticas) | ~25,2B | ~4B | no disponible | Apache 2.0 | Mismo modelo, cuantización sin imatrix | GGUF estático en HF |

La comparación directa con alternativas de la misma categoría (fine-tunes NSFW/roleplay de tamaño similar) no está disponible en la información proporcionada. El modelo base Qwen3 MoE de referencia se incluye únicamente como contexto arquitectónico, no como competidor funcional, dado que su alineamiento de seguridad lo hace inadecuado para el nicho de este fine-tune.

## Limitaciones y advertencias

- Contenido explícito y para adultos: el modelo está etiquetado como `nsfw`, `explicit`, `mature` y `not-for-all-audiences`; no es apto para menores ni para entornos sin control de acceso.
- Modelo deliberadamente `unaligned`: no incorpora salvaguardas de seguridad, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin filtros. Requiere moderación externa si se expone a usuarios finales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como todo modelo generativo sin alineamiento, la tasa de alucinación puede ser elevada, especialmente en dominios factuales.
- Limitación idiomática: solo declara soporte de inglés (`en`); el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas sin verificar empíricamente el límite real del modelo base.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_*) degradan severamente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". No son recomendables para producción.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material para adultos; la responsabilidad legal recae en el desplegador.
- Sin datos de benchmarks ni evaluaciones de calidad publicadas: la elección entre cuantizaciones debe basarse en pruebas propias, no en métricas del autor.
- Fecha de creación del repositorio (2026-10-31) posterior a la de esta ficha: verificar la vigencia y posibles actualizaciones del modelo base.
- El modelo base es de terceros (ReadyArt); mradermacher solo aporta las cuantizaciones, por lo que problemas de calidad subyacente deben reportarse al autor original.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF
- Modelo base original: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.2
- Página de overview del autor para este modelo: https://hf.tst.eu/model#Dark-Craving-26B-A4B-v0.2-i1-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
