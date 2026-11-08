# mradermacher/Jamba2-3B-Turkish-GGUF

## Resumen

Jamba2-3B-Turkish-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo serda-dev/Jamba2-3B-Turkish, generada por mradermacher. El modelo base es un ajuste fino orientado al turco de la arquitectura Jamba2, un diseno hibrido que combina bloques Transformer con capas de espacio de estados (SSM) del tipo Mamba. Con aproximadamente 3.040 millones de parametros, esta pensado para despliegue en entornos con recursos limitados, incluyendo GPU de consumo.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo conversacional en turco (con soporte secundario de ingles) en hardware modesto, gracias a las cuantizaciones que van desde 1,3 GB (Q2_K) hasta 6,2 GB (f16). El modelo base declara haber pasado por continued pretraining y SFT, lo que lo orienta hacia dialogos y tareas conversacionales mas que hacia razonamiento generico de gran escala.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opcion atractiva para productos dirigidos al mercado turco. No obstante, la informacion publica disponible sobre el modelo base es escasa: no se detallan composicion del dataset, numero de tokens de entrenamiento ni resultados de benchmarks, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer + Mamba (SSM), familia Jamba2 |
| Parametros totales | 3.039.823.232 (aprox. 3,04 B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Jamba2, que combina capas de atencion Transformer con capas de espacio de estados (SSM) inspiradas en Mamba. Esta mezcla busca reducir el coste computacional y de memoria en contextos largos frente a un Transformer puro, manteniendo la capacidad de modelado de dependencias locales mediante atencion. El repositorio GGUF conserva la configuracion de la arquitectura original, pero no publica detalles sobre el ratio de capas Mamba frente a Transformer ni sobre el tamano de las cabezas de atencion.

Segun las etiquetas de la model card, el modelo base paso por continued pretraining y SFT (supervised fine-tuning) sobre datos turcos, con un enfoque conversacional. No se especifica el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la propia arquitectura hibrida. Toda esta informacion debe considerarse "no disponible".

## Capacidades

- Generacion de texto conversacional en turco, con soporte secundario de ingles.
- Dialogo multi-turno, orientado por el SFT declarado en la model card.
- Comprension y generacion en turco gracias al continued pretraining especifico.
- Capacidad de razonamiento y codigo: no documentada explicitamente; se asume limitada por el tamano (3 B) y el enfoque del ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a turco e ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Atencion al cliente en turco: el modelo puede gestionar conversaciones multi-turno en turco para sectores como banca, comercio electronico o telecomunicaciones, aprovechando el ajuste conversacional y el continued pretraining en ese idioma. Su tamano de 3 B permite desplegarlo en infraestructura modesta.
- Asistentes virtuales embebidos en aplicaciones: con cuantizaciones Q4_K_M (1,9 GB) puede ejecutarse en portatiles con GPU de consumo, habilitando asistentes locales sin depender de APIs externas.
- Prototipado rapido de productos NLP en turco: investigadores y equipos de producto pueden validar flujos conversacionales en turco con un coste de hardware minimo antes de escalar a modelos mayores.
- Generacion de respuestas en foros y comunidades: el modelo puede redactar respuestas en turco para plataformas de soporte, con tono conversacional y contexto de hilo.
- Traduccion asistida turco-ingles: aunque no esta entrenado explicitamente para traduccion, el soporte bilingue permite tareas de parafrasis y reformulacion entre ambos idiomas en entornos de bajo coste.
- Educacion y tutoria basica: puede actuar como tutor conversacional en turco para preguntas frecuentes, con la ventaja de ejecucion local y privacidad de datos.
- Experimentacion con arquitecturas hibridas: util para investigadores que quieran estudiar el comportamiento de Jamba2 en un idioma distinto del ingles, con cuantizaciones que facilitan la reproduccion en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto, valores aproximados):
  - Q2_K (1,3 GB): ~2 GB de VRAM.
  - Q4_K_M (1,9 GB): ~3 GB de VRAM.
  - Q8_0 (3,3 GB): ~4,5 GB de VRAM.
  - f16 (6,2 GB): ~8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para f16 con contexto amplio; A100/H100 solo si se requiere alto throughput en produccion.
- Cabe en GPU de consumo: si, desde GTX 1660 6 GB (Q4_K_M) hasta RTX 4090 (f16).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si la arquitectura Jamba2 esta soportada por dichas herramientas (compatibilidad no verificada en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jamba2-3B-Turkish (este) | ~3,04 B | no disponible | Apache 2.0 | GGUF + safetensors | Hibrido Transformer+Mamba, enfoque turco |
| Jamba-v0.1 (AI21) | ~52 B (MoE, ~12 B activos) | 256 K | Apache 2.0 | safetensors | Referencia de la familia Jamba original; mucho mayor |
| Mamba-2.8B (state-spaces) | ~2,8 B | no disponible | Apache 2.0 | safetensors | SSM puro, sin ajuste en turco |
| Turkish LLM de 3 B (generico) | ~3 B | variable | variable | variable | No disponible comparativa concreta en la informacion proporcionada |

La comparacion directa con modelos turcos de tamano similar no puede establecerse con datos verificables a partir de la informacion disponible; las alternativas citadas sirven como referencia arquitectonica y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datos turcos, puede reflejar sesgos culturales y linguisticos del corpus, no auditado publicamente.
- Riesgo de alucinacion: alto en un modelo de 3 B con SFT ligero; no se han publicado evaluaciones de factualidad.
- Limitaciones de contexto e idioma: solo turco e ingles declarados; rendimiento fuera de esos idiomas sera deficiente. La longitud de contexto no esta documentada, por lo que no se debe asumir ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede arrastrar condiciones adicionales no reflejadas en el repo GGUF; conviene verificar la model card de serda-dev/Jamba2-3B-Turkish.
- Caveats para produccion: no hay benchmarks publicos, no hay garantias de calidad conversacional, y la arquitectura Jamba2 puede no estar soportada por todos los servidores de inferencia (vLLM, TGI). Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia.
- El repositorio no incluye quants con imatrix/weighted, lo que puede afectar la calidad en comparacion con cuantizaciones optimizadas de otros autores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jamba2-3B-Turkish-GGUF
- Modelo base: https://huggingface.co/serda-dev/Jamba2-3B-Turkish
- Pagina de descargas del autor: https://hf.tst.eu/model#Jamba2-3B-Turkish-GGUF
- Variante SFT v1 en GGUF: https://huggingface.co/mradermacher/Jamba2-3B-Turkish-SFT-v1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
