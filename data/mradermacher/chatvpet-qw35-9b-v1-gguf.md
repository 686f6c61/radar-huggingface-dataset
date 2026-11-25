# mradermacher/ChatVPet-qw35-9B-v1-GGUF

## Resumen

ChatVPet-qw35-9B-v1 es un modelo de lenguaje conversacional de aproximadamente 9.200 millones de parametros (9.197.093.888 segun los pesos en safetensors), desarrollado originalmente por LorisYounger y cuantizado a formato GGUF por mradermacher. El nombre del repositorio y las etiquetas asociadas (`vpet`, `qwen3_5`) sugieren que se trata de un ajuste fino orientado a interacciones de tipo mascota virtual (virtual pet) sobre una base de la familia Qwen 3.5, aunque la model card no documenta explicitamente la arquitectura interna ni los datos de entrenamiento.

La version aqui descrita es una distribucion de cuantizaciones estaticas: mradermacher ha generado un abanico de variantes que van desde Q2_K (4,1 GB) hasta f16 (18,5 GB), ademas de dos ficheros `mmproj` (Q8_0 y f16) que indican soporte multimodal, presumiblemente para entrada de vision. El modelo esta publicado bajo licencia Apache 2.0 y declara unicamente el idioma chino (`zh`) como soportado.

Su relevancia practica reside en la disponibilidad de pesos GGUF ligeros (Q4_K_M de 5,9 GB) que permiten ejecutar un modelo conversacional de ~9B en hardware de consumo mediante llama.cpp u Ollama. No obstante, la ausencia de benchmarks publicados, de documentacion sobre el entrenamiento y de soporte multilingue mas alla del chino limita seriamente su uso en produccion fuera de nichos muy concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` sugiere base de la familia Qwen 3.5; no confirmado en la model card) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (segun tags); ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original presumiblemente en safetensors |
| Tamano del repositorio | 85,5 GB |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta informacion sobre la arquitectura interna del modelo base. La etiqueta `qwen3_5` y el nombre `qw35` apuntan a un ajuste fino sobre una base de la familia Qwen 3.5, lo que implicaria una arquitectura transformer decoder-only convencional, pero este dato no se confirma explicitamente en la documentacion disponible. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento, no se documenta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La etiqueta `vpet` sugiere un ajuste orientado a dialogos de mascota virtual, probablemente con datos sinteticos o conversacionales especificos de ese dominio, pero se desconoce el proceso. La presencia de ficheros `mmproj` indica que el modelo base admite entrada multimodal (vision), aunque la model card no detalla las capacidades exactas.

## Capacidades

- Generacion de texto conversacional en chino, orientada a dialogos de tipo mascota virtual.
- Soporte multimodal presumible: los ficheros `mmproj` (Q8_0 y f16) sugieren proyeccion de imagenes, aunque no se detalla en la documentacion.
- Capacidad de razonamiento y codigo: no disponible (no documentado).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: unicamente chino declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de mascotas virtuales en chino: el modelo esta ajustado especificamente para dialogos de tipo `vpet`, por lo que puede emplearse en demos de asistentes con personalidad para juegos o aplicaciones interactivas, ejecutandose en local con llama.cpp.
- Experimentacion academica con cuantizaciones GGUF: dado el abanico de variantes (de Q2_K a f16), sirve para estudiar el impacto de la cuantizacion en la calidad de un modelo de ~9B en tareas conversacionales.
- Despliegue en hardware de consumo: la variante Q4_K_M (5,9 GB) cabe en GPUs con 8 GB de VRAM, permitiendo inferencia local sin infraestructura cloud.
- Chatbot de dominio cerrado en chino: para aplicaciones donde el idioma sea exclusivamente chino y el dominio conversacional, el modelo puede integrarse via Ollama o llama.cpp con una API compatible con OpenAI (`endpoints_compatible`).
- Evaluacion comparativa de ajustes finos: util como referencia para comparar el comportamiento de un fine-tune de nicho frente a modelos base de tamano similar.
- Investigacion sobre modelos multimodales ligeros: los ficheros `mmproj` permiten explorar la proyeccion de vision en un modelo de ~9B, aunque sin documentacion de soporte oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,1 GB
  - Q3_K_M: ~4,9 GB
  - Q4_K_S / Q4_K_M: ~5,6-5,9 GB
  - Q5_K_M: ~6,8 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - mmproj (vision): +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5; RTX 4090 (24 GB) para Q8_0 o f16; A100/H100 solo si se requiere f16 con contexto largo.
- Cabe en GPU de consumo: si, en configuraciones Q2_K a Q6_K con GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ChatVPet-qw35-9B-v1 (este) | ~9,2B | no disponible | zh | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct | ~7,6B | 32K (tipico) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | ~8B | 128K | multilingue | Llama 3.1 Community | safetensors, GGUF |
| Gemma 2 9B Instruct | ~9B | 8K | multilingue | Gemma Terms | safetensors, GGUF |

La comparativa se ofrece a titulo orientativo: los datos de los modelos alternativos provienen de sus respectivas documentaciones publicas, mientras que para ChatVPet-qw35-9B-v1 no se dispone de contexto, benchmarks ni evaluacion de calidad. En terminos de tamano, el modelo es directamente comparable a Gemma 2 9B y algo mayor que Qwen2.5-7B y Llama 3.1 8B, pero su especializacion en chino y en dominio `vpet` lo hace menos versatil que las alternativas multilingues.

## Limitaciones y advertencias

- Solo declara soporte de chino; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- No hay benchmarks publicados: se desconoce su calidad real en razonamiento, codigo o matematicas.
- La model card no documenta la arquitectura, el entrenamiento ni los datos, lo que dificulta evaluar sesgos y riesgos.
- Riesgo de alucinacion no cuantificado; al ser un ajuste de nicho (`vpet`), puede producir respuestas fuera de dominio de forma inconsistente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original (LorisYounger/ChatVPet-qw35-9B-v1) deberia verificarse por si impone restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.
- La fecha de creacion (2026-11-25) y el tamano del repositorio (85,5 GB) deben considerarse al planificar la descarga; las cuantizaciones estaticas no incluyen variantes ponderadas/imatrix, lo que puede afectar la calidad relativa de las cuantizaciones bajas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ChatVPet-qw35-9B-v1-GGUF
- Modelo base: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ChatVPet-qw35-9B-v1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
