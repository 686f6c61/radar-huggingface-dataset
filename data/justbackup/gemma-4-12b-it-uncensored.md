# Justbackup/gemma-4-12B-it-uncensored

## Resumen

`Justbackup/gemma-4-12B-it-uncensored` es una versión modificada del modelo `google/gemma-4-12B-it` de Google DeepMind, publicada por el usuario Justbackup en Hugging Face. El objetivo es eliminar el comportamiento de rechazo (refusal) del modelo original mediante una técnica de abliteración que proyecta fuera de los pesos la dirección de activación asociada a las respuestas de negativa. El resultado es un modelo que responde a un espectro más amplio de peticiones, incluidas aquellas que el modelo base rechazaría por políticas de seguridad.

El modelo base, `gemma-4-12B-it`, pertenece a la familia Gemma 4 y utiliza una arquitectura unificada sin encoder (`Gemma4Unified`), lanzada en junio de 2026. Es un modelo multimodal que procesa tanto texto como imágenes, con 12 000 millones de parámetros y una ventana de contexto de 256 000 tokens. La versión abliterada conserva las capacidades del original, pero con una tasa de rechazo drásticamente reducida (del 99 % al 2 % en pruebas internas). El repositorio incluye el código de reproducción y los scripts de auditoría, lo que facilita verificar el proceso.

La relevancia de este modelo radica en su utilidad para desarrolladores que necesitan un LLM local sin restricciones de contenido para tareas de investigación, generación creativa o pruebas de robustez, manteniendo la calidad del modelo base. No obstante, al eliminar los guardarraíles de seguridad, su uso en producción debe considerar cuidadosamente los riesgos éticos y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (encoder-free, multimodal) |
| Parametros totales | 11 959 730 224 (~12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (segun especificaciones de Gemma 4) |
| Tipos de cuantizacion | No disponible en el repo; se menciona compatibilidad con GGUF via llama.cpp |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` emplea una arquitectura unificada sin encoder: las imágenes se proyectan directamente en el espacio de tokens mediante un proyector de parches, sin un codificador visual separado. Esto reduce la latencia y simplifica el despliegue. El modelo es denso, con 12 000 millones de parámetros y una ventana de contexto de 256K tokens, y está entrenado con un enfoque de instrucción y ajuste fino con RLHF/DPO, aunque los detalles exactos del dataset no se especifican en la informacion disponible.

La version uncensored se obtiene mediante **abliteration norm-preserving biprojected**, una tecnica que modifica los pesos de las capas superiores del decoder (70 % de las capas, L15-47) para eliminar la direccion de rechazo. El proceso:

1. Se recopilan activaciones residuales de 400 prompts dañinos y 400 inofensivos.
2. Se aplica winsorizacion al 99.5 percentil para mitigar outliers en activaciones GeGLU.
3. Se calcula una direccion de rechazo por capa como la diferencia normalizada entre medias.
4. Se proyecta esa direccion fuera de los pesos de `o_proj` y `down_proj`, preservando la norma de cada fila.
5. Se fusionan adaptadores LoRA en los pesos base para obtener nombres de tensores limpios.

Esta tecnica difiere de la abliteracion clasica (heretic) en que usa biproyeccion con preservacion de norma, direcciones por capa y un unico paso deterministico en lugar de busqueda de hiperparametros.

## Capacidades

- Generacion de texto y chat conversacional en ingles.
- Razonamiento multi-paso y resolucion de problemas logicos.
- Generacion de codigo en multiples lenguajes (Python, JavaScript, etc.) y depuracion.
- Comprension y generacion de contenido multimodal: puede procesar imagenes y texto combinados (heredado del modelo base).
- Soporte de tool calling y function calling (nativo en Gemma 4).
- Capacidad para actuar como agente en tareas que requieren llamadas a APIs o ejecucion de herramientas.
- Ventana de contexto larga (256K tokens) para manejar documentos extensos o conversaciones prolongadas.
- Al estar abliterado, responde a peticiones que el modelo base rechazaria, incluyendo contenido explicito, violencia ficcional o instrucciones potencialmente peligrosas (sin garantias de exactitud).

## Casos de uso

- **Generacion creativa sin restricciones**: escritores y guionistas pueden explorar tramas oscuras, dialogos con lenguaje soez o escenas de violencia sin que el modelo se niegue. Su ventana de 256K tokens permite mantener novelas completas en contexto.
- **Investigacion en seguridad de IA**: los equipos de red team pueden probar la robustez de los sistemas de moderacion generando prompts adversariales y evaluando respuestas. La tasa de rechazo del 2 % facilita la automatizacion de pruebas.
- **Desarrollo de chatbots de rol**: para juegos de rol o simulaciones de personajes con personalidades extremas, el modelo no impone limites morales, lo que permite interacciones mas inmersivas.
- **Analisis de documentos largos**: gracias a su contexto de 256K tokens, puede resumir informes extensos, contratos o articulos cientificos completos sin perder informacion.
- **Asistente de codigo en entornos sin restricciones**: puede generar exploits educativos, scripts de pentesting o codigo de bajo nivel sin rechazar peticiones relacionadas con seguridad ofensiva (con fines educativos).
- **Evaluacion de alucinaciones y sesgos**: al comparar las respuestas con las del modelo base, los investigadores pueden estudiar como la abliteracion afecta a la coherencia y a los sesgos latentes.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K), pero proporciona metricas especificas de la abliteracion:

| Metrica | Antes (modelo base) | Despues (uncensored) |
|---|---|---|
| Rechazos (mlabonne, 100 prompts) | 99/100 | 6/100 |
| Rechazos (cross-dataset, 686 prompts) | — | 14/686 (2.0 %) |
| KL Divergence | 0 (baseline) | 0.0556 |
| Calidad (coherencia) | — | Sin degradacion (auditoria manual + inferencia Q8) |

La validacion cruzada sobre 4 datasets independientes (JailbreakBench, tulu-harmbench, NousResearch/RefusalDataset, mlabonne/harmful_behaviors) arrojo una tasa de rechazo efectiva de ~0/686 tras auditoria manual de los 13 falsos positivos. No se dispone de datos sobre rendimiento en tareas de razonamiento, codigo o matematicas en esta version.

## Requisitos de hardware

- **VRAM estimada**: el modelo en bf16 ocupa ~24 GB (11.96B parametros * 2 bytes). Para inferencia con contexto largo, se recomienda al menos 32 GB de VRAM.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB, con cuantizacion), o GPUs profesionales con 32 GB o mas.
- **Consumer GPU**: es posible ejecutar en RTX 3090/4090 con cuantizacion de 8 bits (GGUF Q8) o 4 bits, aunque con contextos reducidos. No cabe en GPUs de 12 GB o menos sin cuantizacion agresiva.
- **Opciones de despliegue**: transformers (con `device_map="auto"`), vLLM, llama.cpp (con soporte para Gemma4Unified desde PR #24118), Ollama (si se convierte a GGUF).
- **Latencia y throughput**: no se han publicado mediciones especificas. Como referencia, un modelo denso de 12B en A100 suele generar entre 30 y 60 tokens/segundo con batch 1, dependiendo de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/gemma-4-12B-it | 12B | 256K | Apache 2.0 | Modelo base con rechazo activo |
| Justbackup/gemma-4-12B-it-uncensored | 12B | 256K | Apache 2.0 | Version abliterada (este modelo) |
| TrevorJS/gemma-4-12B-it-uncensored | 12B | 256K | Apache 2.0 | Version similar, probablemente el mismo metodo |
| Ishowbackup/gemma-4-12B-it-uncensored | 12B | 256K | Apache 2.0 | Otra publicacion del mismo modelo |

No se dispone de comparativas con otros modelos uncensored de tamano similar (como Llama 3.1 8B abliterado) en la informacion proporcionada.

## Limitaciones y advertencias

- **Eliminacion de guardarrailes**: el modelo puede generar contenido explicito, violento, ilegal o danino. No debe usarse en aplicaciones orientadas al publico general sin moderacion adicional.
- **Sesgos y alucinaciones**: al igual que el modelo base, puede producir informacion falsa o sesgada, especialmente en temas controvertidos. La abliteracion no corrige estos problemas.
- **Idioma**: la model card indica soporte solo en ingles; el rendimiento en otros idiomas no esta verificado.
- **Riesgo de mal uso**: al facilitar la generacion de codigo malicioso o instrucciones peligrosas, su distribucion puede violar politicas de plataformas o leyes locales.
- **Requisitos de version**: necesita `transformers >= 5.10.1` y `llama.cpp` con soporte Gemma4Unified (PR #24118). No es compatible con versiones anteriores.
- **Calidad de la abliteracion**: aunque se reporta "sin degradacion", la KL divergence de 0.0556 indica una alteracion mensurable en la distribucion de salida. En casos extremos, podria afectar a la coherencia en dominios especializados.
- **Licencia**: aunque es Apache 2.0, el uso comercial debe revisar las politicas de Google sobre el modelo base (Gemma 4) y las restricciones de uso aceptable.

## Enlaces

- [Hugging Face: Justbackup/gemma-4-12B-it-uncensored](https://huggingface.co/Justbackup/gemma-4-12B-it-uncensored)
- [Modelo base: google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Blog de abliteration norm-preserving biprojected (grimjim)](https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration)
- [Repo de reproduccion (TrevorS/gemma-4-abliteration)](https://github.com/TrevorS/gemma-4-abliteration)
- [PR llama.cpp para Gemma4Unified](https://github.com/ggml-org/llama.cpp/pull/24118)
- [Otras versiones: TrevorJS/gemma-4-12B-it-uncensored](https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored) e [Ishowbackup/gemma-4-12B-it-uncensored](https://huggingface.co/Ishowbackup/gemma-4-12B-it-uncensored)
