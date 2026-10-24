# AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP

## Resumen

AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP es un checkpoint cuantizado en formato MLX publicado por AutomatosX, derivado del modelo peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP. No es un modelo entrenado desde cero: es una recuantización de un checkpoint ya cuantizado, con empaquetado afín de 6 bits y protección de módulos seleccionados en 8 bits y bf16. El resultado ocupa 33.660.273.640 bytes (31,3486 GiB) y una media medida de 7,490084 bits por peso.

La arquitectura de origen es un transformer de mezcla de expertos identificado con la etiqueta `qwen3_5_moe`, con 34.660.608.768 parámetros totales y una nomenclatura "35B-A3B" que sugiere del orden de 3.000 millones de parámetros activos por token (dato no verificado en la información disponible). El nombre incluye el sufijo MTP porque el artefacto empaqueta el payload de multi-token prediction, aunque el autor advierte explícitamente de que su ejecución, tasa de aceptación y aceleración no están verificadas.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de un artefacto de investigación "not certified", con cero descargas y cero likes en el momento de la consulta, cuya única evidencia de funcionamiento son dos pruebas de humo de texto corto (una operación aritmética que devolvió 42 y una salida de palabra exacta que devolvió READY) sobre MLX-VLM 0.7.9 y MLX 0.32.4 en Metal. No hay benchmarks de calidad, ni evidencia de contexto largo, ni de visión, ni de MTP. La licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (etiqueta `qwen3_5_moe`); checkpoint cuantizado para MLX |
| Parámetros totales | 34.660.608.768 |
| Parámetros activos | No disponible como dato verificado; la nomenclatura A3B del nombre indica del orden de 3.000 millones |
| Longitud de contexto | No disponible |
| Tipos de cuantización | AXQ afín de 6 bits con precisión mixta: 93,0325 % de parámetros en 6 bits (33.446.887.424), 1,9582 % en 8 bits (704.004.096) y 5,0093 % en bf16 (1.800.931.184) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); 33.660.273.640 bytes, 31,3486 GiB, 7,490084 BPW medidos |
| Clase de presupuesto del manifiesto | `7p5bpw` |
| Tamaño del repositorio | 33,7 GB |
| Runtime validado | MLX-VLM 0.7.9 / MLX 0.32.4 (pruebas de humo de texto) |
| Payload MTP | Incluido y protegido; ejecución y aceleración no verificadas |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas de mezcla de expertos, tal como indica la etiqueta de arquitectura `qwen3_5_moe` del repositorio. Sobre esa base, este artefacto aplica un esquema de cuantización propietario denominado AXQ: empaquetado afín de 6 bits para la mayoría de los pesos, con protecciones de mayor precisión en un subconjunto de módulos (1,96 % en 8 bits y 5,01 % en bf16). El autor precisa que no se trata de MXFP6 ni de un checkpoint uniformemente de 6 bits, y que los tamaños de grupo y las excepciones por módulo están registrados en `config.json` y `axquant_plan.json`. Los porcentajes de precisión son cuotas de parámetros lógicos, no de bytes de fichero.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni procesos de alineación (RLHF, DPO) en la documentación disponible, porque este repositorio no entrena: recuantiza. La cadena de procedencia es AutomatosX sobre peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (revisión inmutable `a443d4e30fd5228942cb7695f916f4b14a88fae9`), que a su vez deriva del linaje Cyber Tiel Coder con atribuciones a ornith-ai y huihui-ai. El autor advierte de que esta conversión no recupera información BF16 ya perdida en el origen ni reproduce su proceso de calibración.

Como innovación técnica, el artefacto incluye un payload MTP (multi-token prediction) protegido con manifiesto propio (`axquant_mtp_sidecar_manifest.json`) y un sidecar de visión. Ninguno de los dos está verificado conductualmente en esta revisión: el propio autor indica que la ruta de carga de texto probada desactiva la torre de visión no indexada.

## Capacidades

- Generación de texto y conversación: es la única capacidad con evidencia directa, limitada a dos pruebas de humo de texto corto.
- Generación de código: el linaje se denomina "Coder" y la etiqueta incluye `development`, pero no hay ninguna evaluación de calidad de código en esta revisión.
- Razonamiento aritmético básico: la prueba de humo reportada produjo 42 en una operación aritmética simple.
- Seguimiento de instrucciones de formato exacto: la segunda prueba de humo exigía una palabra exacta y devolvió READY.
- Multi-token prediction: los pesos MTP están empaquetados, pero la ejecución, la tasa de aceptación y la aceleración no están verificadas.
- Visión: el sidecar de visión está presente, pero la ruta de carga probada no soporta inferencia de imagen; no es un export de runtime verificado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; sin evidencia publicada.
- Multilingüismo: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explícito: no disponible.

## Casos de uso

- Evaluación de la cadena de cuantización AXQ: el caso más sólido para este artefacto es medir la degradación de un esquema de 7,49 BPW frente al checkpoint oQ6e de origen, con perplejidad y tareas de código controladas antes de adoptar el formato en un pipeline propio.
- Prototipado local en Apple Silicon: un equipo de desarrollo puede cargar el modelo con MLX-VLM sobre Metal para probar plantillas de chat y flujos de generación de código en local, aceptando que solo hay evidencia de carga y generación de texto corto.
- Asistencia de código en estación de trabajo con memoria unificada: con 31,35 GiB de pesos, encaja en configuraciones de 64 GB de memoria unificada; sirve para autocompletado y refactorización asistida una vez validada la calidad con un harness propio tipo HumanEval o SWE-bench, que aquí no se aporta.
- Reproducción de investigación sobre empaquetado afín de 6 bits: el manifiesto liga ficheros, plan de precisión, ejecución del cuantizador y comprobaciones de compatibilidad, lo que permite auditar la trazabilidad de una recuantización sobre otra recuantización.
- Base para experimentos de decodificación especulativa con MTP: los pesos MTP están incluidos, de modo que un grupo de investigación puede intentar activar la ruta de multi-token prediction y medir su tasa de aceptación, siempre que asuma que el autor no la ha verificado.
- Exploración multimodal con reservas: el sidecar de visión existe, pero el caso de uso de descripción de imágenes o comprensión de diagramas queda fuera de la ruta soportada y requeriría construir y validar un export de runtime propio.
- Análisis de conversaciones multi-turno: solo es viable después de caracterizar el comportamiento en contexto largo, extremo que esta revisión no cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es explícita: no hay benchmark de calidad ni certificado para esta revisión, y los resultados upstream de SWE-bench, GGUF o cualquier otra placa de benchmarks no son transferibles a este checkpoint.

| Fuente | Dato | Aplicabilidad |
|---|---|---|
| Model card del artefacto | Dos pruebas de humo de texto (salida `42` y `READY`) en MLX-VLM 0.7.9 / MLX 0.32.4 | Solo acredita carga y generación de texto corto |
| Model card del artefacto | Sin benchmark de calidad ni certificado | Ninguna |
| llm-bench.io | 119 tok/s pico en 46 ejecuciones comunitarias sobre 3 GPU para Cyber-Tiel-Coder-35B-A3B-MTP-UD-IQ3_XXS | Corresponden a una cuantización GGUF IQ3_XXS distinta; no se transfieren |
| llm-explorer.com | VRAM estimada de 19,5 GB para la variante MXFP4 | Tercero, otra variante; no aplica a este BPW |

## Requisitos de hardware

- Peso en disco: 31,3486 GiB (33.660.273.640 bytes) solo de pesos, según el manifiesto.
- Memoria en tiempo de ejecución: no medida. El autor advierte que los bytes de peso no determinan el pico de memoria en runtime; hay que sumar caché KV y overhead del runtime.
- Estimación prudente: por debajo de 40 GB de memoria unificada no hay margen razonable para pesos más caché KV; 64 GB es la configuración realista para trabajar con contexto apreciable. Estimación propia, no dato del autor.
- GPU: MLX se ejecuta sobre Metal en Apple Silicon; no se ha validado en A100, H100 ni RTX 4090, y no hay evidencia de soporte CUDA para este artefacto.
- Cabe en GPU de consumo: no en el sentido habitual (24 GB o menos); sí en Apple Silicon de gama alta con memoria unificada amplia.
- Despliegue validado: MLX-VLM 0.7.9 con MLX 0.32.4.
- Despliegue no validado: MLX-LM (no probado; el autor pide no inferir equivalencia), AX Engine (no medido), omlx y mtplx (declarados no soportados).
- Despliegue no aplicable: llama.cpp, Ollama, vLLM y TGI, por formato MLX y ausencia de export GGUF en este repositorio.
- Latencia y throughput: no disponibles para esta revisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Runtime | Evidencia de calidad |
|---|---|---|---|---|---|---|
| Este artefacto (AXQ 6-bit MTP) | 34,66 B totales, ~3 B activos | AXQ afín 6 bits mixta, 7,490084 BPW | No disponible | MIT | MLX-VLM (humo de texto) | Ninguna |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35 B-A3B | oQ6e (origen de la recuantización) | No disponible | MIT según metadatos upstream | MLX | No detallada en la información disponible |
| AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP | 35 B-A3B | MXFP8 con MTP empaquetado | No disponible | MIT | MLX | No detallada en la información disponible |
| AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | 35 B-A3B | MXFP4; 19,5 GB de VRAM estimada por un tercero | No disponible | MIT | MLX | No detallada en la información disponible |
| Cyber-Tiel-Coder-35B-A3B-MTP-UD-IQ3_XXS | 35 B-A3B | GGUF IQ3_XXS | No disponible | No disponible en la información | llama.cpp y afines | 119 tok/s pico en 46 ejecuciones comunitarias |

La comparación útil es de compromiso entre precisión y memoria dentro de la misma familia: MXFP4 reduce huella a costa de precisión, MXFP8 y este AXQ de 7,49 BPW se sitúan por encima, y la variante GGUF IQ3_XXS es la más agresiva y la única con datos de rendimiento comunitarios, aunque de otra ruta de ejecución.

## Limitaciones y advertencias

- Artefacto de investigación no certificado: el autor lo declara explícitamente; no debe tratarse como un modelo listo para producción.
- Doble cuantización: se recuantiza desde un checkpoint ya cuantizado (oQ6e), por lo que la pérdida acumulada respecto a BF16 no es recuperable ni está medida.
- Sin métricas de calidad: no hay benchmark, ni certificado, ni placa de evaluación para esta revisión.
- Evidencia empírica mínima: dos pruebas de humo de texto corto no acreditan calidad de código, comportamiento en contexto largo, visión ni velocidad MTP.
- MTP no verificado: el sufijo describe pesos empaquetados, no una aceleración medida; asumir lo contrario es un error de interpretación frecuente.
- Visión no operativa en la ruta probada: la torre de visión queda desactivada y el sidecar no es un export de runtime verificado.
- Contexto desconocido: sin longitud de contexto declarada ni pruebas de contexto largo, cualquier diseño que dependa de ventanas amplias requiere validación previa.
- Idiomas desconocidos: el repositorio no declara lista de idiomas; el comportamiento multilingüe es indeterminado.
- Alucinación: no cuantificada para esta revisión; sin datos de evaluación no puede acotarse el riesgo.
- Sesgos: no documentados ni evaluados en la información disponible.
- Compatibilidad de runtime estrecha: solo MLX-VLM está probado; MLX-LM no, omlx y mtplx están declarados no soportados, y AX Engine no se ha medido.
- Licencia: MIT en los metadatos, con obligación de mantener la atribución upstream a peculiar-ragdoll, ornith-ai y huihui-ai; conviene revisar la model card de origen para términos y procedencia.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta, sin informes independientes de uso.
- Fechas del repositorio: creación y actualización en octubre de 2026 según los metadatos del Hub; conviene fijar el commit inmutable al reproducir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Modelo base (oQ6e-MTP, revisión fijada): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/a443d4e30fd5228942cb7695f916f4b14a88fae9
- Variante hermana MXFP8: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP
- Colección Tiel Coder de AutomatosX: https://huggingface.co/collections/AutomatosX/tiel-coder
- Ficha de terceros de la variante MXFP4: https://llm-explorer.com/model/AutomatosX%2FAX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP,17h6B0MbbWrLiNvddCMsuz
- Registro de terceros de la variante MXFP8: https://free2aitools.com/model/automatosx/ax-tiel-coder-35b-a3b-mlx-axq-mxfp8-mtp
- Datos comunitarios de la variante GGUF IQ3_XXS: https://llm-bench.io/models/cyber-tiel-coder-35b-a3b-mtp-ud-iq3-xxs
