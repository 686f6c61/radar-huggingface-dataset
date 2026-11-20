# inferencerlabs/Hy4-flash-MLX-Q9s

## Resumen

Hy4-flash-MLX-Q9s es una cuantización de 9 bits del modelo multimodal tencent/Hy4-flash, publicada por inferencerlabs para su ejecución sobre Apple Silicon mediante la librería MLX. El modelo base es un modelo de imagen-a-texto conversacional desarrollado por Tencent, y esta versión concreta aplica una cuantización de 9 bits por peso (Q9) junto con una técnica de streaming de n-gramas desde almacenamiento para reducir la huella de memoria. Según la model card, esta configuración alcanza una precisión prácticamente sin pérdidas, con una perplejidad de 1,20312 frente a 1,20312 del modelo base y una precisión de tokens del 97,80 %.

El paquete está pensado para el stack de inferencia propietario de inferencerlabs (Inferencer v2.5.4), probado sobre un Apple M3 Ultra. El repositorio ocupa 1,4 GB y está etiquetado como 8-bit, aunque la nomenclatura del autor indica Q9. La información pública disponible es muy limitada: no se detallan parámetros totales, longitud de contexto, composición del dataset de entrenamiento ni licencia del modelo base, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

La relevancia de esta publicación es doble: por un lado, permite ejecutar un modelo multimodal de origen asiático en hardware de consumo Apple; por otro, documenta con métricas de perplejidad y precisión de tokens el impacto de distintas cuantizaciones (desde Q3.5 hasta Q9), lo que resulta útil para decidir el equilibrio entre tamaño y fidelidad en despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4-flash; familia Hy4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q9 (9 bits por peso) en este repo; el autor publica ademas Q3.5, Q4.5, Q5.5, Q6.5 y Q8.5 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | MLX (libreria mlx); no se especifica safetensors ni GGUF |
| Tamano del repositorio | 1,4 GB |
| Modalidad | image-text-to-text (vision + texto) |
| Modelo base | tencent/Hy4-flash |
| Relacion con el base | quantized |
| Fecha de publicacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base tencent/Hy4-flash en la documentacion proporcionada: no se indica si es un transformer denso, un Mixture of Experts, un modelo hibrido o si emplea atencion lineal. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion arquitectonica relevante es la del proceso de cuantizacion: inferencerlabs ha aplicado una version modificada de MLX para producir pesos de 9 bits y, ademas, transmite los n-gramas desde almacenamiento en lugar de mantenerlos en memoria, lo que reduce el footprint. La model card menciona un modo MTP (Multi-Token Prediction) habilitable en los controles de inferencia, cuyos pesos estaran disponibles "pronto", pero no se aportan detalles tecnicos sobre su implementacion.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), lo que permite describir imagenes, responder preguntas sobre ellas y mantener dialogos que las referencian.
- Inferencia local sobre Apple Silicon mediante MLX, con aceleracion especifica para chips de la serie M.
- Modo MTP (Multi-Token Prediction) previsto para acelerar la decodificacion, aunque los pesos no estan publicados en el momento de redactar esta ficha.
- Capacidades de codigo y escritura mencionadas de forma implicita en la model card (se citan pruebas de 500 tokens en "Coding" y "Writing" con MTP), pero sin resultados numericos publicados.
- No se documentan soporte de tool calling, function calling, agentes, audio ni otros modos especiales.

## Casos de uso

- Asistente visual local en macOS: el modelo puede procesar capturas de pantalla o fotografias y responder preguntas sobre ellas sin enviar datos a la nube, gracias a su ejecucion nativa en MLX sobre chips M3 Ultra.
- Descripcion automatica de imagenes en flujos de accesibilidad: generacion de texto alternativo para catalogos o bibliotecas de imagenes en ingles, aprovechando la modalidad image-text-to-text.
- Prototipado de aplicaciones multimodales en equipos de desarrollo con hardware Apple: al ocupar 1,4 GB y ejecutarse con Inferencer, sirve para validar interfaces de chat con vision antes de migrar a infraestructura GPU.
- Analisis de documentacion tecnica escaneada: extraccion de informacion de diagramas, capturas de pantalla o figuras en articulos, con respuestas en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas de perplejidad y precision de tokens para Q3.5 a Q9, lo que permite a investigadores medir el impacto de la cuantizacion en tareas multimodales.
- Educacion e investigacion sobre cuantizacion en MLX: util como referencia reproducible para estudiar tecnicas de streaming de n-gramas y cuantizacion de 9 bits en modelos de vision-lenguaje.
- Chat conversacional de proposito general en ingles sobre estacion de trabajo Mac: su naturaleza conversacional permite integrarlo en herramientas de escritorio tipo chatbot con contexto visual.

## Benchmarks y rendimiento

La model card proporciona metricas de fidelidad de cuantizacion (no benchmarks de tareas como MMLU o HumanEval). Se reproducen a continuacion:

| Cuantizacion (bpw) | Perplejidad | Precision de tokens | Missed Divergence |
|---|---|---|---|
| Q3.5 | 168,0 | 43,45 % | 72,57 % |
| Q4.5 | 1,33593 | 91,65 % | 17,28 % |
| Q5.5 | 1,23437 | 95,05 % | 17,28 % |
| Q6.5 | 1,21875 | 96,65 % | 12,03 % |
| Q8.5 | 1,21875 | 97,65 % | 9,92 % |
| Q9 | 1,20312 | 97,80 % | 9,60 % |
| Base | 1,20312 | 100 % | 0,000 % |

En cuanto a throughput, la model card reporta para M3 Ultra una velocidad de aproximadamente 25 tokens/s con 500 tokens generados y un uso de memoria de aproximadamente 163 GiB. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: la model card cita aproximadamente 163 GiB en M3 Ultra para la configuracion probada, un valor muy elevado que sugiere que el modelo base es de gran tamano o que el streaming de n-gramas consume memoria adicional.
- GPU recomendadas: Apple M3 Ultra es el unico hardware documentado oficialmente. No hay datos para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada. El requisito de ~163 GiB de memoria unificada supera la memoria de cualquier GPU de consumo actual (RTX 4090: 24 GB), por lo que no cabe en consumer GPU convencionales.
- Opciones de despliegue: libreria MLX y la aplicacion Inferencer v2.5.4 (probada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 25 tokens/s en M3 Ultra para 500 tokens. Los valores con MTP estan pendientes de publicacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (vision-lenguaje cuantizados para MLX) ni especificaciones del modelo base que permitan una comparacion rigurosa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado unicamente para ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia: no disponible. Antes de un uso comercial es imprescindible verificar la licencia del modelo base tencent/Hy4-flash, ya que la cuantizacion hereda sus restricciones.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual; como todo modelo generativo, puede producir contenido incorrecto, especialmente en descripciones de imagenes detalladas.
- Dependencia de herramienta propietaria: las pruebas oficiales se realizaron con Inferencer v2.5.4, y no se garantiza el funcionamiento con otras herramientas MLX.
- Requisitos de memoria muy altos (~163 GiB en M3 Ultra), lo que limita su uso a equipos de gama muy alta con memoria unificada.
- El modo MTP no esta disponible: los pesos anunciados no se han publicado, por lo que las cifras de rendimiento con MTP estan vacias.
- Precisión de cuantizacion: aunque Q9 alcanza un 97,80 % de precision de tokens, sigue habiendo un 9,60 % de "Missed Divergence", por lo que no es equivalente exacto al modelo base.
- El autor declina responsabilidad sobre la exactitud del modelo y sobre posibles perdidas de datos o inexactitudes en el contenido generado.
- Sin datos publicados sobre sesgos, contexto maximo ni composicion del entrenamiento, lo que dificulta evaluar riesgos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/Hy4-flash-MLX-Q9s
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Videos de demostracion (segun model card): https://youtube.com/xcreate
- Herramienta de inferencia: https://inferencer.com
- Libreria MLX: https://github.com/ml-explore/mlx
