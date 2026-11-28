# 1bit-MONSTER/ZAYA1-VL-8B-GGUF

## Resumen

ZAYA1-VL-8B-GGUF es la conversion a formato GGUF del modelo multimodal Zyphra/ZAYA1-VL-8B, publicada por el usuario 1bit-MONSTER. El modelo base combina el lenguaje ZAYA1 de Zyphra con una torre de vision Qwen2.5-VL, e incorpora un LoRA especifico para tokens de imagen y atencion bidireccional dentro de cada imagen. Esta version GGUF es relevante porque, segun el autor, el modelo no estaba disponible previamente en este formato, lo que impide su uso en el ecosistema llama.cpp y en despliegues ligeros.

El repositorio incluye cuatro ficheros: el modelo de lenguaje en F16, Q8_0 y Q4_K_M, y la torre de vision (mmproj) en F16. La conversion se realizo mediante un fork propio de llama.cpp, ya que el llama.cpp upstream no soporta la arquitectura ZAYA. El autor valida la fidelidad del F16 frente al codigo original de Zyphra con un 100/101 de coincidencia top-1 en tres preguntas sobre imagen.

Con 9.054.048.760 parametros totales y licencia Apache 2.0 heredada del modelo base, esta ficha se centra en la version cuantizada publicada, sus requisitos de hardware y sus limitaciones practicas, incluyendo un fallo conocido del motor en la ruta GPU para peticiones de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: ZAYA1 (lenguaje) + torre de vision Qwen2.5-VL, con LoRA solo de vision y atencion bidireccional intra-imagen |
| Parametros totales | 9.054.048.760 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la torre de vision admite hasta 4.096 tokens por imagen) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (modelo de lenguaje); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base ZAYA1-VL-8B es un modelo multimodal que acopla el lenguaje ZAYA1 de Zyphra con una torre de vision Qwen2.5-VL. Sobre los tokens de imagen se aplica un LoRA especifico de vision, y cada imagen se procesa con atencion bidireccional (no causal) dentro de sus propios tokens, mientras el texto mantiene atencion causal. La torre de vision limita cada imagen a un maximo de 4.096 tokens.

La conversion GGUF la realiza el proyecto 1bit engine mediante un conversor propio integrado en su fork de llama.cpp. El conversor escribe los pesos de la convolucion agrupada en orden tap-major, requisito del grafo del motor. El autor reporta que anadir la ruta de vision no altera el comportamiento de texto: la perplejidad en wikitext se mantiene igual que en el ZAYA1-8B solo texto (95/96 frente a FP32). No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en formato GGUF compatible con endpoints.
- Comprension de imagenes: descripcion de contenido visual, identificacion de colores, formas y texto presente en la imagen.
- Razonamiento multimodal basico con atencion bidireccional intra-imagen.
- Soporte de conversaciones multi-turno (tag `conversational`).
- Compatibilidad con la ruta de inferencia de llama.cpp mediante fork especifico.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo thinking en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en pipelines locales: el modelo puede generar descripciones de contenido visual (formas, colores, texto en imagen) ejecutandose en CPU o GPU consumer con la ruta llama.cpp, util para catalogacion de activos sin depender de APIs externas.
- Moderacion y verificacion de contenido visual: con Q8_0 y la torre de vision en F16 se pueden clasificar imagenes simples y detectar texto incrustado, integrándolo en flujos de revision previa a publicacion.
- Asistente conversacional multimodal en escritorio: al caber en equipos con GPU integrada potente (validado en Strix Halo), permite construir asistentes de escritorio que respondan a preguntas sobre capturas de pantalla o documentos escaneados.
- Procesamiento de documentos con OCR ligero: la capacidad de leer texto en imagenes ("HELLO 42" en la prueba del autor) permite extraer cadenas de imagenes de baja complejidad en entornos sin conectividad.
- Prototipado e investigacion en vision-lenguaje: la disponibilidad en GGUF con licencia Apache 2.0 facilita experimentar con modelos multimodales en hardware modesto y comparar cuantizaciones (Q8_0 frente a Q4_K_M) con metricas de KLD.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp o el motor 1bit, los datos de imagen no salen del equipo, adecuado para sectores regulados.
- Evaluacion de fidelidad de cuantizaciones: el repositorio incluye datos de KLD y coincidencia top-1 que sirven como referencia para decidir entre Q8_0 y Q4_K_M en produccion.

## Benchmarks y rendimiento

El autor publica metricas de calidad de cuantizacion (KLD frente a F16 en 16 ventanas de 512 tokens de wikitext-2) y de velocidad en hardware concreto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | ZAYA1-VL-8B-Q8_0 | ZAYA1-VL-8B-Q4_K_M |
|---|---|---|
| Tamano del fichero | 9,71 GB | 5,71 GB |
| KLD medio vs F16 | 0,0065 | 0,1046 |
| Coincidencia top-1 | 96,6 % | 83,7 % |

| Metrica de velocidad (Strix Halo, Q4_K_M) | Valor |
|---|---|
| pp512 | 2.814 ± 371 tok/s |
| tg128 | 141 ± 13,8 tok/s |
| Decode F16 (Radeon 8060S, Vulkan) | 38-51 tok/s |

Validacion de fidelidad: el F16 alcanza 100/101 de coincidencia top-1 frente al codigo original de Zyphra (FP32 en CPU) en tres preguntas sobre imagen, tanto con atencion causal como bidireccional.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB para Q8_0 (9,71 GB de pesos mas overhead) y unos 6 GB para Q4_K_M (5,71 GB), sumando el mmproj F16 de la torre de vision.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para Q8_0; 8 GB pueden bastar para Q4_K_M. Validado en AMD Ryzen AI Max+ 395 con Radeon 8060S (memoria unificada).
- Cabe en GPU consumer: si, en tarjetas de 8-12 GB o superiores segun cuantizacion; tambien funciona en CPU (ruta recomendada para imagenes en la version rc1 del motor 1bit).
- Opciones de despliegue: llama.cpp mediante el fork de 1bit-MONSTER (rama `1bit/hrx-vulkan-patched`); el motor 1bit engine (`1bit serve`). El llama.cpp upstream no soporta ZAYA.
- Latencia y throughput: pp512 de 2.814 tok/s y tg128 de 141 tok/s en Strix Halo con Q4_K_M; decode F16 de 38-51 tok/s en la misma plataforma. La velocidad del Q8_0 en HRX no se ha medido.
- Para imagenes en llama.cpp, decodificar cada imagen en un unico ubatch: `-b 4096 -ub 4096`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks estandar para comparar con alternativas de la misma categoria en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ZAYA1-VL-8B-GGUF (este) | 9,05 B | no disponible | GGUF | Apache 2.0 | Conversion de 1bit-MONSTER, requiere fork de llama.cpp |
| Zyphra/ZAYA1-VL-8B | 9,05 B | no disponible | safetensors | Apache 2.0 | Modelo base original, requiere transformers con rama `zaya1-vl` |
| ZAYA1-8B | no disponible | no disponible | no disponible | no disponible | Version solo texto del mismo lenguaje, sin torre de vision |

## Limitaciones y advertencias

- Fallo conocido: en 1bit OS v2026.49-rc1, las peticiones de imagen abortan en la torre de vision en la ruta GPU HRX (engine#3549); las imagenes solo funcionan en la ruta CPU (`--device cpu`). El texto no se ve afectado.
- Requiere un fork especifico de llama.cpp: el llama.cpp upstream no soporta ZAYA, y los GGUF deben generarse con el conversor propio del autor (orden tap-major de la convolucion agrupada).
- Q4_K_M es claramente mas lossy: KLD de 0,1046 y coincidencia top-1 del 83,7 %, por debajo del umbral de calidad del autor; se recomienda Q8_0 para uso en produccion.
- Contexto maximo no documentado; la torre de vision limita cada imagen a 4.096 tokens.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera del ingles.
- Riesgo de alucinacion inherente a modelos generativos, no cuantificado en la informacion disponible; la validacion del autor se limita a pruebas puntuales (tres preguntas de imagen y una imagen sintetica).
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y no se documentan restricciones adicionales del conversor.
- Repositorio con pocas descargas (304) y sin likes: ecosistema de validacion limitado; conviene verificar la fidelidad en el propio caso de uso.
- Sin datos de sesgos conocidos en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/ZAYA1-VL-8B-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-VL-8B
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp: https://github.com/1bit-MONSTER/llama.cpp
- Pull request de conversion: https://github.com/1bit-MONSTER/llama.cpp/pull/18
- Incidencia de vision en GPU HRX: https://github.com/1bit-MONSTER/engine/issues/3549
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
