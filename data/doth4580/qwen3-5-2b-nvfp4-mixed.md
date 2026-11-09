# doth4580/Qwen3.5-2B-NVFP4-MIXED

## Resumen

Qwen3.5-2B-NVFP4-MIXED es una cuantizacion del modelo Qwen3.5-2B del equipo Qwen de Alibaba, publicada por el usuario doth4580. El artefacto empaqueta los pesos originales en formato NVFP4/FP8 mixto mediante el cuantizador offline de veloGB10, con el objetivo principal de ejecutarse en el motor de inferencia veloGB10 sobre sistemas NVIDIA DGX Spark con GPU GB10. No se trata de un modelo nuevo, sino de una distribucion de pesos modificados que conserva tokenizador y plantilla de chat del original.

El modelo base es un transformer denso hibrido de 2.274.069.824 parametros (2B) que combina 18 capas GatedDeltaNet (atencion lineal con estado recurrente de tamano fijo) con 6 capas de atencion completa GQA. Incorpora una cabeza nativa de prediccion multi-token (MTP) pensada para decodificacion especulativa, un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens.

Su relevancia practica es doble: por un lado, demuestra que el formato `compressed-tensors` con esquema `nvfp4-pack-quantized` es portable a cualquier framework que lea dicho formato; por otro, ofrece un artefacto de 1,6 GB validado con decodificacion especulativa sin perdida, servicio TP=2 y TP=4 en dos y cuatro nodos GB10, y la suite completa de pruebas de correctitud del motor veloGB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: 18 capas GatedDeltaNet (atencion lineal) + 6 capas full GQA; hidden 2048, 8 cabezas Q / 2 KV |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | `nvfp4-mixed`: todas las GEMM en NVFP4 excepto las proyecciones de entrada/salida de GDN en FP8; formato `nvfp4-pack-quantized` (compatible con compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout compressed-tensors (`nvfp4-pack-quantized`) |
| Tamano en disco | 1,6 GB |
| Vocabulario | 248.320 tokens |
| Cabeza MTP | nativa, usada para decodificacion especulativa |
| Modelo base | Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso hibrido. Dieciocho de sus capas emplean GatedDeltaNet, un mecanismo de atencion lineal con estado recurrente de tamano fijo que reduce el coste computacional y de memoria en secuencias largas; las seis capas restantes aplican atencion completa con Grouped Query Attention (8 cabezas de consulta y 2 de clave/valor), lo que aporta capacidad de recuperacion exacta a intervalos regulares. La dimension oculta es 2048 y el vocabulario alcanza los 248.320 tokens. El modelo incluye ademas una cabeza nativa de prediccion multi-token (MTP) que actua como fuente de borradores para decodificacion especulativa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo original en la documentacion proporcionada. La contribucion del artefacto cuantizado se limita a la cuantizacion NVFP4/FP8 mixta, el empaquetado en compressed-tensors, las pruebas de correctitud y las instrucciones de despliegue con veloGB10. La innovacion tecnica destacable del pack es la combinacion de cuantizacion de 4 bits en todas las GEMM con precision FP8 en las proyecciones criticas de GatedDeltaNet, lo que preserva la estabilidad del estado recurrente, junto con el uso de la cabeza MTP para decodificacion especulativa greedy sin perdida.

## Capacidades

- Generacion de texto y razonamiento general en el rango propio de un modelo de 2B parametros.
- Modo thinking activable en el muestreo (las mediciones de veloGB10 se realizan con thinking on).
- Decodificacion especulativa nativa mediante la cabeza MTP integrada, con aceptacion de borradores gestionada por el motor.
- Soporte de contexto largo: hasta 262.144 tokens de secuencia, con prefix caching en el motor veloGB10.
- Servicio compatible con la API de OpenAI (`/v1`) a traves de veloGB10, lo que habilita integracion con clientes y SDKs existentes.
- Despliegue multi-nodo con paralelismo tensorial TP=2 y TP=4 sobre GB10, con transferencia de pesos por red y cache local en los nodos.
- Capacidades de tool calling, function calling, agentes o vision: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Servicio de inferencia en DGX Spark: el pack esta producido y validado para veloGB10 sobre GB10; se arranca con `gb10_inference --server` y expone un endpoint OpenAI-compatible en el puerto 9000, lo que permite sustituir un backend en la nube por inferencia local en hardware de escritorio-sobremesa.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y prefix caching, el modelo puede resumir o extraer informacion de contratos, informes o bases de codigo completas sin truncar, manteniendo el estado recurrente de GatedDeltaNet a coste lineal.
- Asistentes conversacionales multi-turno: la ventana de contexto y el sampler por defecto del pack (presence penalty 2.0, max-tokens 65.536) permiten mantener conversaciones extensas con memoria de sesion, adecuado para atencion al cliente o tutoria tecnica en entornos con requisitos de privacidad.
- Generacion de codigo en local: con 76-116 tok/s de decodificacion en turnos de codigo segun topologia, el modelo es viable para autocompletado y generacion de fragmentos en IDE o pipelines de CI/CD que no pueden enviar codigo a servicios externos.
- Despliegue escalado horizontal en cluster GB10: el modo TP=2 y TP=4 sin copia de modelo en los nodos simplifica el escalado de throughput agregado (239-243 tok/s con dos peticiones concurrentes) en laboratorios con varias maquinas GB10.
- Evaluacion y desarrollo de motores de inferencia: al usar el layout estandar `nvfp4-pack-quantized`, sirve como artefacto de referencia para probar otros frameworks que lean compressed-tensors, comparando su comportamiento frente a veloGB10.
- Prototipado de agentes con contexto largo: la combinacion de contexto de 262k, prefix caching y API compatible con OpenAI facilita construir bucles de razonamiento multi-paso sobre repositorios o corpus extensos antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente publica mediciones de rendimiento del motor veloGB10 (VeloBench, 2026-11-06, builds de desarrollo 0.7.7, muestreo de produccion con thinking on):

| Topologia | Fuente de borrador | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) |
|---|---|---:|---:|---:|---:|---:|
| TP=1 | cabeza MTP del pack | 76 | 104 | 83 | 7.926 | 221 |
| TP=2 | cabeza MTP del pack | 109 | 131 | 102 | 7.098 | 239 |
| TP=4 | cabeza MTP del pack | 116 | 116 | 110 | 5.384 | 243 |

Las cifras de decode incluyen decodificacion especulativa. Son ejecuciones unicas por celda con variacion aproximada de mas o menos el 10 por ciento.

## Requisitos de hardware

- VRAM estimada: el pack ocupa 1,6 GB en disco; la inferencia requiere ademas el estado KV y el estado recurrente de GatedDeltaNet, cuyo consumo no se detalla en la informacion disponible.
- Hardware objetivo: NVIDIA DGX Spark / GB10. El autor ha validado TP=1 (una GB10), TP=2 (dos GB10) y TP=4 (cuatro GB10).
- GPU consumer: no disponible; no se documenta compatibilidad con RTX 4090, A100, H100 ni otras GPU.
- Motor de despliegue: veloGB10 (`gb10_inference`), binario autocontenido con servidor OpenAI-compatible en el puerto 9000. No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI, aunque el formato compressed-tensors es legible por otros frameworks.
- Red multi-nodo: los nodos no necesitan copia del modelo; el nodo cabeza envia a cada nodo su parte de los pesos y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el rail mediante `--rdma-dev`.
- Parametros de servicio probados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 2.0`, `--prefix-cache on`, `--mtp=auto`.
- Throughput medido: prefill de 5.384 a 7.926 tok/s y decode mediano de 83 a 110 tok/s segun topologia (ver tabla anterior).

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.5-2B-NVFP4-MIXED | 2,27B | 262.144 | NVFP4/FP8 mixta (compressed-tensors) | Apache-2.0 | Hugging Face, validado en veloGB10 |
| Qwen/Qwen3.5-2B (base) | 2,27B | 262.144 | pesos originales (no cuantizado) | Apache-2.0 | Hugging Face |
| Alternativas de ~2B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de cuantizacion, no modelo original: los pesos estan modificados respecto a Qwen3.5-2B y cualquier evaluacion de calidad debe tener en cuenta la perdida potencial introducida por NVFP4/FP8, aunque el autor afirma que la decodificacion especulativa es greedy-lossless y que la suite de correctitud pasa.
- Validacion limitada a veloGB10: el pack esta producido y probado para ese motor; el uso con otros frameworks es posible por formato, pero no esta verificado por el autor.
- Ecosistema muy reducido: 28 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion independiente.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue ni comportamiento en castellano sin evaluacion propia.
- Riesgo de alucinacion inherente a un modelo de 2B parametros; el autor no publica evaluaciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor declara explicitamente que no reclama propiedad intelectual sobre pesos, arquitectura ni documentacion original; los derechos permanecen en los autores originales.
- Dependencia de hardware especifico: las cifras de rendimiento y las instrucciones de despliegue asumen GB10 y RoCE; en otro hardware no hay datos de latencia ni de compatibilidad.
- El sampler por defecto del pack aplica presence penalty 2.0; usarlo sin ajustar puede degradar la calidad en tareas que requieran repeticion controlada.

## Enlaces

- Repositorio del pack cuantizado: https://huggingface.co/doth4580/Qwen3.5-2B-NVFP4-MIXED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
