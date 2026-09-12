# Distillio/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

Distillio/GLM-5.2-colibri-int4-g64-with-int8-mtp es un contenedor de pesos cuantizados del modelo GLM-5.2 (744B parámetros, arquitectura MoE) preparado específicamente para el motor de inferencia colibri. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión del padre oficial en FP8 (zai-org/GLM-5.2) a int4 con escalas agrupadas de tamaño 64 en los expertos, escalas f32 por grupo, embeddings y lm_head en int8, normas en f32 y una cabeza MTP (multi-token prediction) en int8 para decodificación especulativa. Lo publica el usuario Distillio bajo licencia MIT y está etiquetado como "gpu-poor", es decir, orientado a ejecutar un MoE de gran tamaño en hardware con memoria limitada mediante streaming desde disco.

Su relevancia es doble. Por un lado, la model card lo presenta como el contenedor de referencia de int4 agrupado para colibri: en un A/B independiente midió hellaswag acc_norm del 87,0 % frente al 83,5 % del contenedor int4 con escalas per-row (n=200, colibri #326), y en una matriz de 5 celdas de muestreo resolvió el fallo de bucle de razonamiento con EOS-starving que el contenedor per-row reproducía de forma sistemática (5/5 frente a fallos con temperatura 0,9 y nucleus 0,95). Por otro, muestra que la elección del esquema de cuantización afecta tanto a la precisión como a la fiabilidad de parada, no solo a la perplejidad.

El repositorio ocupa 429,3 GB y contiene 141 shards de safetensors (390,5 GB) más un shard adicional de 9,3 GB para la cabeza MTP. Está pensado para colibri v1.5.0 o superior, con la versión v1.3.0 como suelo funcional. No se dispone de información sobre longitud de contexto, idiomas soportados ni parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta glm_moe_dsa) sobre transformer; detalles completos no disponibles |
| Parametros totales | 744B (según la model card del contenedor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en int4 con escalas agrupadas (group size 64, escalas f32 por grupo); embeddings y lm_head en int8; normas en f32; cabeza MTP en int8; padre oficial en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card y en los metadatos del repo) |
| Formato de pesos | safetensors (141 shards de modelo + 1 shard de MTP) |

## Arquitectura y entrenamiento

El contenedor no implica entrenamiento: es una conversión de pesos del modelo base zai-org/GLM-5.2, un MoE de 744B parámetros, desde el FP8 oficial a un formato de cuantización pensado para el motor colibri. La innovación técnica central es el uso de escalas agrupadas cada 64 elementos (fmt=4 grouped int4) en lugar de escalas por fila. Las escalas per-row permiten que un valor atípico degrade la precisión de toda la fila y están implicadas en los informes de "repetition attractor" del motor (colibri #225/#307); las escalas agrupadas cuestan aproximadamente un 12 % más de disco y mejoran de forma medible la calidad. La cabeza MTP se mantiene en int8 porque las cabezas MTP en int4 rinden en torno a un 0 % de aceptación de borradores, mientras que en int8 miden entre un 39 % y un 59 %.

La conversión se declara validada en GPU y token-exact contra el oráculo de transformers (32/32), y el camino CUDA de fmt=4 se integró en el repositorio de colibri (PR #298). No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni sobre fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto autorregresiva: es el pipeline declarado (text-generation) del contenedor.
- Decodificación especulativa mediante cabeza MTP en int8, con tasas de aceptación de borradores declaradas del 39-59 %.
- Ejecución con memoria limitada: el motor colibri permite hacer streaming de expertos desde NVMe, con tasas de residencia medidas del 93,5 % en este contenedor (frente al 97,4 % del contenedor E8/IQ3).
- Parada fiable: en la matriz de 5 celdas de muestreo del informe colibri #455 (mismo motor, mismos prompts, mismos flags) este contenedor emitió EOS correctamente en 5/5 configuraciones, incluida TEMP=0,9 con NUCLEUS=0,95.
- Validación token-exact contra transformers (32/32).
- Compatibilidad con el motor colibri v1.5.0 o superior; v1.3.0 es el suelo funcional.
- No se dispone de información sobre tool calling, function calling, uso como agente, capacidades multilingües, visión, audio ni modo "thinking" en la documentación del contenedor.

## Casos de uso

- Inferencia de un MoE de 744B en hardware con VRAM limitada: haciendo streaming de expertos desde NVMe, el contenedor permite servir el modelo en tarjetas muy por debajo de los ~400 GB que ocupan los pesos, con la contrapartida de la latencia de disco.
- Investigación en cuantización: sirve como referencia de int4 con escalas agrupadas (g64) para comparar contra esquemas per-row, midiendo no solo precisión (hellaswag acc_norm) sino también fiabilidad de parada y estabilidad del razonamiento.
- Evaluación de decodificación especulativa: la cabeza MTP en int8 permite medir tasas de aceptación de borradores en un modelo grande y cuantificado, un escenario donde el int4 degrada la aceptación a ~0 %.
- Despliegue bare-metal en clústeres multi-GPU consumer: hay medidas declaradas sobre 6×RTX 5090 con los expertos completamente residentes, un escenario en el que este contenedor es preferible al E8/IQ3.
- Reproducción de resultados y validación de motores: el contenedor se usa como patrón token-exact (32/32) frente al oráculo de transformers para verificar que un build del motor no corrompe la salida.
- Ajuste de parámetros de muestreo en producción: al dejar de ser críticos los knobs de temperatura y nucleus (comportamiento verificado en 5/5 configuraciones), simplifica las políticas de generación de un servicio en producción.
- Auditoría de cadena de suministro de pesos: el contenedor ejemplifica el límite de confianza que describen los avisos de seguridad de colibri (descarga de contenedores preconvertidos de terceros), por lo que es útil como caso de prueba para validar cargadores y controles de integridad.

## Benchmarks y rendimiento

Datos publicados en la model card del contenedor:

| Metrica | Este contenedor (int4 g64) | Int4 per-row | Contexto |
|---|---|---|---|
| hellaswag acc_norm | 87,0 % | 83,5 % | A/B colibri #326, n=200 |
| Parada limpia (EOS) | 5/5 celdas | fallos (bucles sin EOS) | Matriz de 5 celdas, colibri #455 |
| Validacion token-exact vs transformers | 32/32 | no disponible | Oráculo de transformers |
| Aceptacion de borradores MTP | 39-59 % (MTP int8) | ~0 % (MTP int4) | Model card |
| Expert-matmul (decode) | 20,9 s | no disponible | Comparado con 24,1 s del contenedor E8/IQ3 |
| Residencia de expertos | 93,5 % | no disponible | Frente al 97,4 % del contenedor E8/IQ3 |

No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni ARC-Challenge con cifras concretas para este contenedor; la model card solo menciona que el contenedor hermano E8/IQ3 no presenta pérdida de calidad medible en hellaswag, arc_challenge y mmlu, sin aportar los valores.

## Requisitos de hardware

- Peso total en disco: 429,3 GB de repositorio; 390,5 GB de shards del modelo (141 ficheros) más 9,3 GB del shard MTP.
- VRAM para ejecución completamente residente: a partir de los datos de la model card, del orden de 400 GB de memoria de acelerador, más el overhead del motor y del contexto.
- Ejecución con streaming desde NVMe: no requiere que los expertos quepan en VRAM; se han documentado pruebas en una tarjeta de 16 GB.
- GPU probadas o mencionadas: 6×RTX 5090 (expertos residentes, informe colibri #452) y una tarjeta de 16 GB en modo streaming. No se mencionan A100, H100 ni otras GPU de centro de datos.
- Rendimiento relativo: frente al contenedor E8/IQ3, este contenedor es un 22-33 % más lento en streaming desde NVMe con una tarjeta de 16 GB, y un 13 % más rápido por expert-matmul (20,9 s frente a 24,1 s) cuando los expertos están residentes.
- Motor de despliegue: colibri (repositorio JustVugg/colibri), versión v1.5.0 o superior recomendada; v1.3.0 es el suelo funcional. No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers en la información disponible.
- Aviso de seguridad del propio autor: en builds anteriores a v1.5.0 no debe activarse COLI_CUDA_ATTN=1 con este contenedor.

## Comparativa con modelos similares

| Contenedor | Tamano | Cuantizacion | Ventaja principal | Inconveniente |
|---|---|---|---|---|
| Este contenedor (Distillio) | 429,3 GB (390,5 GB + 9,3 GB MTP) | int4 g64 + MTP int8 | Contenedor de referencia; mejor calidad (hellaswag 87,0 %) y parada fiable; compatible con colibri desde v1.3.0 | Mayor tamaño en disco; más lento en streaming desde NVMe |
| mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp | 289 GB | 3,06 bpw E8/IQ3 + MTP int8 | 22-33 % más rápido en streaming en tarjeta de 16 GB; misma calidad declarada en hellaswag, arc_challenge y mmlu | Requiere colibri v1.4.0 o superior; decode más caro por experto (24,1 s) cuando no hay fallos de caché |
| Contenedor int4 per-row (no identificado en la información) | no disponible | int4 per-row | no disponible | hellaswag 83,5 %; bucles de razonamiento sin EOS en configuraciones de muestreo altas |
| zai-org/GLM-5.2 (padre oficial) | no disponible | FP8 | Pesos originales sin cuantización adicional | No está adaptado al motor colibri; no disponible el detalle de requisitos |

## Limitaciones y advertencias

- Requiere un motor concreto (colibri) y versiones concretas: por debajo de v1.3.0 hay builds que no cargan fmt=4, caen silenciosamente a CPU o, con CUDA_DENSE=1, aplican escalas agrupadas como per-row y producen salida basura. Los builds anteriores a v1.3.0 no deben usar COLI_CUDA_ATTN=1.
- Riesgo de seguridad en el cargador: colibri v1.5.0 publicó ocho avisos de seguridad, dos de ellos en el propio cargador de modelos (GHSA-wc4x-3786-cxh7 y GHSA-4gw4-j89j-4c8r), con escrituras fuera de límites en el heap durante la carga, antes de la inferencia. El propio autor señala que descargar un contenedor preconvertido de un repositorio de terceros es exactamente el límite de confianza que describen esos avisos y que la integridad del contenedor no es verificable por el usuario.
- Muestra de evaluación reducida: el dato de hellaswag procede de un A/B con n=200, sin intervalos de confianza ni significación estadística declarada.
- Sin datos de sesgos, alucinación, idiomas soportados ni longitud de contexto en la información proporcionada; el comportamiento en estos ejes debe asumirse heredado del modelo base, sin verificación publicada.
- Licencia: el contenedor declara MIT, pero no se dispone de información sobre la licencia del modelo base zai-org/GLM-5.2 en los datos facilitados; conviene verificarla antes de un uso comercial.
- Dependencia de hardware: la viabilidad en streaming depende de la tasa de aciertos de la caché de expertos; con una tasa de residencia alta el contenedor E8/IQ3 resulta más rápido, según las propias medidas del autor.
- Las fechas de la model card y de los informes citados (2026) indican que el contenido procede de un estado del proyecto posterior al conocimiento habitual de la familia GLM; no se dispone de verificación independiente fuera de las referencias del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Distillio/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Contenedor hermano E8/IQ3: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Repositorio del motor colibri: https://github.com/JustVugg/colibri
- Avisos de seguridad de colibri: https://github.com/JustVugg/colibri/security/advisories
- GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
- Issue con medidas comparativas (streaming frente a residente): https://github.com/JustVugg/colibri/issues/452
- Comentario con metodología y caveats del A/B: https://github.com/JustVugg/colibri/issues/452#issuecomment-5155461138
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (husos horarios de Florida, Estados Unidos), por lo que no se han incorporado enlaces adicionales de la búsqueda.
