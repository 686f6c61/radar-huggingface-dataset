# mdcreativeagent/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-2B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario mdcreativeagent (atribuida al autor HauhauCS) bajo licencia Apache 2.0. El modelo parte de la arquitectura Qwen3.5, un transformer denso de 2B parametros (1.881.825.088 parametros reales segun safetensors) con 24 capas que combina atencion lineal Gated DeltaNet con atencion softmax completa en una proporcion 3:1.

El objetivo declarado es eliminar los rechazos (refusals) del modelo base sin perder capacidades: la model card afirma "0/465 refusals" y "zero capability loss", manteniendo intactos los datasets y las habilidades del original. La variante "Aggressive" aplica una eliminacion de rechazos mas agresiva que una eventual variante "Balanced".

Es relevante por su combinacion de caracteristicas: contexto nativo de 262K tokens (extendible a 1M con YaRN), multimodalidad nativa (texto, imagen y video mediante un encoder `mmproj` separado), soporte de prediccion multi-token (MTP) y un vocabulario de 248K tokens. Se distribuye principalmente en formato GGUF con cuantizaciones desde BF16 hasta Q4_K_M, lo que permite ejecutarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet (atencion lineal) + atencion softmax completa, ratio 3:1, 24 capas |
| Parametros totales | 1.881.825.088 (~2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativo; extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M; encoder de vision en f16 |
| Idiomas soportados | Ingles, chino y multilingue (la model card cita 201 idiomas y vocabulario de 248K) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) + `mmproj` f16 para vision |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B, presentada por el autor como una arquitectura nueva (publicada el 2026-03-02). Se trata de un transformer denso de 24 capas que intercala atencion lineal Gated DeltaNet con atencion softmax completa en proporcion 3:1, lo que reduce el coste computacional en contextos largos manteniendo la calidad de la atencion completa. Incluye soporte de prediccion multi-token (MTP) y un vocabulario de 248K tokens que cubre 201 idiomas.

La multimodalidad es nativa: el modelo procesa texto, imagen y video, y el encoder de vision se distribuye como archivo `mmproj` independiente en f16 (638 MB) que debe cargarse junto al GGUF principal. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card indica explicitamente que no se han modificado datasets ni capacidades respecto al modelo base, por lo que el entrenamiento corresponde al de Qwen3.5-2B original. El proceso de "uncensoring" aplicado por HauhauCS no se detalla tecnicamente en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, chino y multilingue.
- Razonamiento con modo "thinking" (por defecto) y modo "non-thinking", con parametros de muestreo recomendados distintos para cada uno.
- Procesamiento nativo de imagen y video mediante el encoder `mmproj` (multimodalidad nativa).
- Contexto largo: 262K tokens nativos, ampliable a 1M con YaRN; la model card recomienda mantener al menos 128K de contexto para preservar las capacidades de razonamiento.
- Prediccion multi-token (MTP), orientada a acelerar la decodificacion.
- Generacion sin rechazos: la model card declara 0/465 refusals en su evaluacion.
- Soporte multilingue amplio (201 idiomas declarados, vocabulario de 248K).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Generacion de ficcion y narrativa sin filtros: el modelo produce contenido creativo sin rechazos, util para escritura de guiones, novelas o roleplay donde el modelo base bloquearia ciertos temas.
- Analisis de documentos largos: con 262K tokens de contexto nativo puede procesar informes, expedientes o libros completos en una sola pasada, y el ratio 3:1 de atencion lineal reduce el coste frente a un transformer de atencion completa.
- Procesamiento de imagen y video en local: cargando el `mmproj` en llama.cpp o LM Studio se pueden describir imagenes o resumir clips de video en hardware de consumo, gracias al tamano de 2B y las cuantizaciones Q4_K_M (1,2 GB).
- Asistente conversacional multilingue en dispositivo: el vocabulario de 248K y los 201 idiomas declarados permiten atender usuarios en varios idiomas desde un unico modelo pequeno desplegado en local.
- Investigacion sobre alineacion y seguridad: la variante sin censura sirve como contraste frente al modelo base para estudiar el comportamiento de rechazo, sesgos y limites de seguridad en modelos de 2B.
- Prototipado rapido de aplicaciones de vision-lenguaje: al caber en GPU de consumo, permite iterar en pipelines de captioning o VQA sin infraestructura de servidor.
- Experimentacion con contexto largo y YaRN: util para validar tecnicas de extension de contexto hasta 1M tokens en un modelo pequeno y ejecutable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por la model card es "0/465 refusals" en la evaluacion de rechazos del autor, sin detallar el conjunto de prompts ni la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M (1,2 GB de pesos), 2-3 GB con Q6_K (1,5 GB), 3-4 GB con Q8_0 (1,9 GB) y 5-6 GB con BF16 (3,6 GB), sumando overhead de contexto KV cache.
- El contexto de 262K tokens incrementa notablemente el consumo de KV cache; para contextos muy largos se recomienda GPU con 16 GB o mas (RTX 4090, A100, H100) o bien reducir la longitud efectiva de contexto.
- Cabe en GPU de consumo: cualquier GPU con 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M y Q6_K; una RTX 3060 de 12 GB o superior permite contextos mas amplios.
- Vision: anadir 638 MB del encoder `mmproj` f16 al presupuesto de memoria.
- Opciones de despliegue: llama.cpp, LM Studio, Jan y koboldcpp para GGUF; para produccion y alto throughput la model card recomienda vLLM, SGLang o KTransformers. Se requiere una build reciente de llama.cpp por tratarse de una arquitectura nueva.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-HauhauCS-Aggressive | ~2B denso | 262K (1M con YaRN) | Si (texto, imagen, video) | Apache 2.0 | GGUF |
| Qwen3.5-2B (base) | ~2B denso | 262K (1M con YaRN) | Si | Apache 2.0 | Safetensors/GGUF |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | ~9B denso | No disponible | No disponible | No disponible | No disponible |
| Qwen3.5-27B-Uncensored-HauhauCS-Aggressive | ~27B denso | No disponible | No disponible | No disponible | No disponible |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada. Las variantes de 9B y 27B se citan en la model card como parte de la misma familia de HauhauCS, pero sin datos tecnicos detallados.

## Limitaciones y advertencias

- Modelo sin censura: eliminado deliberadamente el comportamiento de rechazo, puede generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Puede anadir ocasionalmente un descargo breve al final de la respuesta (por ejemplo, "esto es informacion general, no asesoramiento legal"); segun el autor no es un rechazo, sino un sesgo del modelo base.
- Riesgo de alucinacion inherente a un modelo de 2B parametros, superior al de modelos mayores.
- La model card recomienda mantener al menos 128K de contexto para preservar el modo thinking; contextos mas cortos pueden degradar el razonamiento.
- La arquitectura es muy reciente (2026-03-02) y el soporte en llama.cpp es reciente; pueden aparecer incompatibilidades con builds antiguas.
- No se documenta soporte de tool calling ni uso agentico; no asumir su disponibilidad en produccion.
- Aunque la licencia es Apache 2.0, el uso comercial del contenido generado sin censura puede infringir normativas locales o las politicas de las plataformas de despliegue; la responsabilidad recae en el desplegador.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa de la comunidad.
- No hay datos publicados sobre sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 9B de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Variante 27B de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive
- Perfil del autor HauhauCS: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
