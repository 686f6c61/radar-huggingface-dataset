# fraQtl/qwen3-4b-instruct-2507-kv-sidecars

## Resumen

fraQtl/qwen3-4b-instruct-2507-kv-sidecars es un artefacto de compresión de KV-cache, no un modelo de lenguaje independiente. Consiste en un conjunto de sidecars calibrados (por capa y por cabeza KV) que definen una base propia (eigenbasis) para almacenar las claves y valores de atención en un formato comprimido, consumidos por el runtime propietario fraQtl integrado en vLLM. El modelo base es Qwen/Qwen3-4B-Instruct-2507, cuyos pesos no se modifican ni redistribuyen.

La propuesta resuelve el cuello de botella de memoria del KV-cache en inferencia con contexto largo: según los datos publicados, permite servir nueve usuarios concurrentes con ventana de 128K en una sola A100-80GB, frente a dos usuarios con fp16 estándar, manteniendo una tasa de decodificación agregada de 134.1 tok/s (2× la de fp16). La compresión combina un subespacio protegido de alta precisión (rank 16 de 128 para K, rank 32 de 128 para V) con una cola INT4, sin truncar el rango lógico (128). La relevancia actual radica en que aborda directamente el coste por token del KV-cache en cargas de trabajo de agentes, RAG y chatbots con contextos extensos, un problema crítico en despliegues con vLLM.

El repositorio incluye recibos de reproducción independientes y un script para verificar los resultados en infraestructura alquilada (Modal o Docker). El runtime es propietario pero gratuito para verificación y evaluación; los sidecars y los recibos se publican bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecars de eigenbasis de KV-cache (subespacio protegido rank 16/128 K, 32/128 V + cola INT4), consumidos por runtime fraQtl para vLLM. Modelo base: Qwen3-4B-Instruct-2507 (transformer) |
| Parametros totales | No aplica (artefacto de compresion; el modelo base tiene 4B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Verificada a 8K, 32K y 128K; ventana nativa del modelo base (262K) sin overrides de RoPE |
| Tipos de cuantizacion | INT4 para la cola de dimensiones residuales; alta precision (fp16/fp8) para el subespacio protegido. Receta: sm80_k16prot_k112i4_v32prot_v96i4_rv128 |
| Idiomas soportados | en, zh (heredados del modelo base) |
| Licencia | Apache 2.0 (sidecars y recibos); runtime fraQtl propietario (gratuito para verificacion); modelo base bajo su propia licencia |
| Formato de pesos | No disponible (sidecars calibrados; formato no especificado en la model card) |

## Arquitectura y entrenamiento

El artefacto no es un modelo de lenguaje, sino un conjunto de sidecars que definen una transformación de compresión para el KV-cache. La arquitectura de compresión inserta una "membrana" entre el modelo y el KV-cache paginado de vLLM: en escritura, K y V se almacenan en páginas comprimidas que consisten en un subespacio protegido calibrado (mantenido a alta precisión) más una cola INT4 sobre las dimensiones restantes. El rango lógico se conserva íntegro (128), no se trunca nada. En lectura, el kernel de atención consume las páginas comprimidas directamente a velocidad de tensor-core, sin paso de descompresión previo, lo que evita penalizar el ancho de banda de decodificación.

La calibración de los subespacios protegidos se realizó con el conjunto wikitext-2-raw-v1 (split de test), usando 16 secuencias de 1024 tokens, por capa y por cabeza KV. El método de calibración no se publica; los sidecars son los artefactos calibrados suficientes para ejecutar y verificar los resultados. El runtime fraQtl se integra en vLLM mediante el mecanismo estándar de plugins externos (`vllm.general_plugins`), registrándose en cada worker del motor. No se aplicaron técnicas de entrenamiento como RLHF o DPO porque no se entrena el modelo base.

## Capacidades

- Compresión de KV-cache con preservación del rango lógico (rank 128) y sin truncado de dimensiones.
- Aumento de concurrencia en inferencia con contexto largo: 9 usuarios simultáneos a 128K en una A100-80GB, frente a 2 con fp16.
- Tasa de decodificación agregada superior: 134.1 tok/s frente a 66.6 tok/s de fp16 en el mismo escenario.
- Recuperación exacta de información en test de aguja en el pajar (needle-in-a-haystack): 9/9 agujas localizadas a distintas profundidades del contexto.
- Integración con vLLM 0.20.2 mediante plugin estándar, sin modificar los pesos del modelo base.
- Soporte de la ventana nativa de Qwen3 (262K) sin overrides de RoPE; verificado hasta 128K.
- Compatibilidad con hardware NVIDIA Ampere (SM80 / A100); no soporta Hopper ni Blackwell.
- Reproducibilidad: script incluido para verificar los recibos en infraestructura alquilada (Modal o Docker).

## Casos de uso

- Servicio de chatbots con contexto largo: permite atender más usuarios simultáneos con ventanas de 128K en una sola GPU, reduciendo el coste por usuario en despliegues de producción con vLLM.
- Sistemas RAG con grandes bases documentales: el KV-cache comprimido permite mantener más documentos en contexto sin agotar la memoria, mejorando la precisión de las respuestas basadas en recuperación.
- Cargas de trabajo agénticas multi-turno: agentes que necesitan mantener historiales extensos y múltiples herramientas activas se benefician de la mayor capacidad de contexto por GPU.
- Evaluación de modelos con ventanas largas en entornos de investigación: el artefacto permite ejecutar pruebas de recuperación y razonamiento con contexto de 128K en hardware estándar de datacenter.
- Optimización de costes en inferencia servida: al aumentar la densidad de usuarios por GPU, se reduce el número de instancias necesarias para un mismo nivel de tráfico.
- Verificación de técnicas de compresión de KV-cache: el repositorio sirve como referencia reproducible para equipos que evalúan alternativas a fp8 o cuantización de KV estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el artefacto no modifica los pesos del modelo base. Los datos de rendimiento publicados se centran en capacidad de concurrencia y throughput de decodificación, verificados en una A100-80GB con vLLM 0.20.2, contexto 131,040, CUDA graphs activados y prefix caching desactivado:

| Brazo | Usuarios @128K | Decodificacion agregada | Por usuario |
|---|---|---|---|
| fp16 (vLLM estandar) | 2 | 66.6 tok/s | ~33 |
| FP8-KV (`kv_cache_dtype=fp8`) | ~4-5 | ~105 tok/s | ~24 |
| fraQtl (bit-plane pages) | 9 | 134.1 tok/s | 14.9 |

KV pool: 1,255,376 tokens. Test de aguja: 9 claves distintas a profundidades 0.0, 0.1, 0.25, 0.25, 0.4, 0.5, 0.75, 0.9 y 1.0 — 9/9 encontradas. Sin fallbacks de kernel, sin errores CUDA y con roundtrip byte-exacto en el formato de almacenamiento. Un recibo de calidad previo (misma familia de recetas) reporta 63/63 agujas localizadas en NIAH con paridad fp16, con ruido de transcripción de IDs (~5%) y fallos simétricos en seguimiento de estado de 3 saltos (~17%), sin brecha en F1 en LongBench multi-hop.

## Requisitos de hardware

- GPU: NVIDIA Ampere (SM80), específicamente A100-80GB para los recibos publicados. No soporta Hopper (SM90) ni Blackwell (SM100).
- VRAM: el artefacto reduce el consumo de KV-cache; el requisito exacto de VRAM depende del modelo base (4B) y de la longitud de contexto. Los recibos usan un pool de KV de 1,255,376 tokens en 80GB.
- No cabe en GPUs de consumo (RTX 4090, etc.) según la información disponible; el runtime solo soporta SM80.
- Opciones de despliegue: vLLM 0.20.2 (torch 2.11.0) con el wheel del runtime fraQtl instalado vía plugin; Linux como sistema operativo.
- Latencia y throughput: 14.9 tok/s por usuario en el escenario de 9 usuarios a 128K; 134.1 tok/s agregados en decodificación.

## Comparativa con modelos similares

No hay artefactos de compresión de KV-cache directamente comparables en la información proporcionada. Las alternativas de referencia son las cuantizaciones estándar de KV-cache en vLLM:

| Aspecto | fraQtl sidecars | fp16 (vLLM estandar) | FP8-KV (vLLM) |
|---|---|---|---|
| Usuarios @128K en A100-80GB | 9 | 2 | ~4-5 |
| Decodificacion agregada | 134.1 tok/s | 66.6 tok/s | ~105 tok/s |
| Calidad de recuperacion (NIAH) | 9/9 agujas | No reportado | No reportado |
| Licencia | Apache 2.0 (sidecars) + runtime propietario | Apache 2.0 (vLLM) | Apache 2.0 (vLLM) |
| Disponibilidad | Repositorio publico con recibos | Publico | Publico |

El autor también publica un kit similar para Mistral-7B-Instruct-v0.3, lo que sugiere aplicabilidad a otros modelos base, aunque no se proporcionan datos comparativos.

## Limitaciones y advertencias

- El runtime fraQtl es propietario; aunque es gratuito para verificación y evaluación, su uso en producción puede estar sujeto a términos adicionales no especificados.
- Solo soporta hardware NVIDIA Ampere (SM80 / A100); no hay soporte para Hopper, Blackwell ni GPUs de consumo.
- La calibración se realizó exclusivamente con wikitext-2-raw-v1 (16 secuencias de 1024 tokens); no se han publicado evaluaciones de robustez en otros dominios.
- No hay claims de contexto de 256K; la verificación se limita a 128K, aunque la ventana nativa del modelo base es de 262K.
- Los recibos de calidad reportan ruido de transcripción de IDs (~5%) y fallos simétricos en seguimiento de estado sintético de 3 saltos (~17%), aunque sin brecha en LongBench multi-hop.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; la validación independiente se limita a los recibos incluidos.
- No se publican benchmarks de calidad del modelo (MMLU, HumanEval, etc.) porque el artefacto no altera los pesos; la evaluación se centra en capacidad y throughput.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/fraQtl/qwen3-4b-instruct-2507-kv-sidecars
- Runtime fraQtl (wheel + procedencia): https://huggingface.co/fraQtl/fraqtl-sm80-runtime
- Kit para Mistral-7B-Instruct-v0.3: https://huggingface.co/fraQtl/mistral-7b-instruct-v0.3-kv-sidecars
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Recibos de reproduccion (en el repositorio): `receipts/repro_2026_07_06/` y `receipts/batch9_128k_2026-08-14/`
- Script de reproduccion: `fraqtl_repro_receipts.py` (incluido en el repositorio)
