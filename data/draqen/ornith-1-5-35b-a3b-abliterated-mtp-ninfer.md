# Draqen/Ornith-1.5-35B-A3B-Abliterated-MTP-NInfer

## Resumen

Ornith-1.5-35B-A3B Abliterated + Shisa MTP — NInfer es un artefacto cuantizado del modelo Ornith-1.5-35B-A3B, una variante "abliterated" (con los mecanismos de rechazo eliminados) del checkpoint de Huihui, empaquetada en formato nativo `.ninfer` para el motor de inferencia NInfer. Lo publica el usuario Draqen y su objetivo es ofrecer una ruta de despliegue local de un modelo multimodal de 35B parámetros totales con 3B activos (arquitectura MoE) en una única GPU de consumo de 24 GB, en concreto una RTX 3090.

La innovación principal frente al checkpoint original es el reemplazo de la cabeza MTP (multi-token prediction) de Ornith por la cabeza entrenada por Shisa AI mediante destilación KL, lo que eleva la tasa de aceptación del borrador en decodificación especulativa del 32,19 % al 60,51 % según las pruebas publicadas por Shisa. El paquete incorpora además un companion DFlash, aunque la ruta validada en la RTX 3090 usa MTP con ventana de borrador de cuatro tokens.

El modelo es relevante para quien necesite un modelo multimodal sin filtros de contenido ejecutándose en hardware de gama alta de consumo, con contexto de texto de 160K por defecto (hasta 200K configurable) y una velocidad de decodificación medida de entre 120 y 190 tokens por segundo según la longitud del prompt. La licencia es Apache 2.0, aunque el modelo está marcado como no apto para todas las audiencias por su naturaleza abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); modelo base Qwen3.6-35B-A3B según los tags y checkpoints de origen |
| Parametros totales | 35B (aproximado, según denominación del modelo) |
| Parametros activos | 3B (aproximado, según denominación A3B) |
| Longitud de contexto | 160K por defecto con watchdog; 120K opción de contexto reducido; hasta 200K configurable en el launcher; visión limitada a 32K en el perfil de 24 GB |
| Tipos de cuantizacion | Cuantización groupwise-int en formato nativo `.ninfer`; no se detallan los bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto nativo del motor NInfer); tamaño de descarga 21,22 GiB (22.783.246.080 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Ornith-1.5-35B-A3B, un transformer con mezcla de expertos de 35B parámetros totales y 3B activos por token, derivado de la familia Qwen3.6-35B-A3B según los checkpoints referenciados. La variante publicada por Huihui aplica abliteration, una técnica de modificación de pesos que elimina la dirección de activación asociada al rechazo de peticiones, dando como resultado un modelo sin censura. Sobre esa base, este artefacto sustituye la cabeza MTP original por la de Shisa AI, entrenada mediante destilación KL para predecir varios tokens futuros con mayor precisión.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica documentada es la decodificación especulativa mediante MTP: la cabeza auxiliar propone tokens que el modelo principal verifica en bloque, aceptando varios por paso. El paquete incluye también un companion DFlash, pero la ruta validada usa `--draft-tokens 4`. El artefacto está cuantizado en enteros por grupos (groupwise-int) y empaquetado para el motor NInfer, que no es compatible con los runners habituales.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de contexto muy largas (hasta 160K tokens por defecto).
- Procesamiento de imagen y texto (`image-text-to-text`), con visión incluida pero desactivada por defecto.
- Decodificación especulativa con cabeza MTP de Shisa, con aceptación de borrador del 60,51 % en las pruebas upstream.
- Generación sin filtros de contenido gracias a la abliteration del checkpoint base.
- Compatibilidad con clientes OpenAI (`/v1`), lo que habilita integración con herramientas que consumen esa API.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agente multi-paso en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistencia de programación local sin conexión: el modelo se sirve en `http://127.0.0.1:8080/v1` y se conecta a clientes compatibles con OpenAI como OpenCode, permitiendo autocompletado y generación de código sin enviar datos a terceros, con 160K de contexto para repositorios medianos.
- Análisis de documentos largos: con 160K tokens de contexto y prefill en caché de 552 a 1.506 tokens/s, es viable procesar informes, contratos o expedientes completos y hacer preguntas sobre ellos en una sola sesión.
- Procesamiento de capturas y documentos escaneados: la modalidad de imagen permite extraer información de pantallas o páginas, aunque en la RTX 3090 el contexto vision queda limitado a 32K por consumo de VRAM.
- Generación de contenido creativo sin restricciones: la abliteration elimina los rechazos, lo que resulta adecuado para ficción, guiones o material editorial que los modelos alineados bloquean; requiere revisión humana por implicaciones legales y éticas.
- Investigación sobre alineación y seguridad: sirve como contrapunto desalineado para estudiar comportamientos, sesgos y diferencias frente a modelos con rechazo activo en entornos controlados.
- Prototipado de agentes conversacionales de larga duración: la ventana de 160K y la decodificación a 120-190 tokens/s permiten mantener sesiones extensas con historial completo, siempre que se asuma el watchdog como mecanismo de recuperación ante bucles.
- Inferencia en hardware de consumo: un único equipo con RTX 3090 puede servir el modelo, lo que reduce costes frente a despliegues en A100 o H100 para equipos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son métricas de servicio del mantenedor sobre 4.298 peticiones completadas entre el 24 de octubre y el 11 de noviembre de 2026 en una RTX 3090:

| Tamano real de prompt | Decodificacion mediana (tok/s) | Prefill en frio mediano (tok/s) | Prefill en cache mediano (tok/s) |
|---|---:|---:|---:|
| Menos de 25K tokens | 189,9 | 3.368 | 1.506 |
| 75–100K tokens | 143,2 | 2.288 | 913 |
| 140–160K tokens | 120,1 | 1.683 | 552 |

| Cabeza MTP | Aceptacion de borrador global (prueba upstream de Shisa) |
|---|---:|
| Cabeza original de Ornith | 32,19 % |
| Cabeza destilada por KL de Shisa | 60,51 % |

## Requisitos de hardware

- VRAM: 24 GB es el mínimo validado; el artefacto ocupa 21,22 GiB en disco y se ejecuta en una RTX 3090.
- GPU recomendadas: RTX 3090 (validada). Otras GPU pueden funcionar con NInfer upstream, pero no están verificadas para este artefacto.
- Visión: consume VRAM adicional sustancial; en 24 GB el contexto con visión queda limitado a 32K.
- Despliegue: exclusivamente mediante el motor NInfer (`ninfer-serve.exe`), con el launcher PowerShell y los tres helpers Python (watchdog) incluidos en el release. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- El launcher requiere Windows PowerShell 5.1+ y Python 3 en el PATH; los helpers no necesitan dependencias externas.
- Puertos: 8080 para el servicio con watchdog obligatorio, 8081 para el endpoint directo del backend.
- Throughput y latencia: decodificación mediana de 189,9 tok/s por debajo de 25K tokens y 120,1 tok/s en el rango 140-160K; prefill en frío de 3.368 a 1.683 tok/s según longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B Abliterated + Shisa MTP — NInfer | 35B totales / 3B activos | 160K por defecto (hasta 200K) | `.ninfer` / NInfer | Apache 2.0 | Cabeza MTP mejorada, visión opcional, watchdog obligatorio |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35B totales / 3B activos | no disponible | safetensors (formato original) | no disponible | Checkpoint base sin la cabeza MTP de Shisa; aceptación de borrador del 32,19 % |
| shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY | 35B totales / 3B activos | no disponible | safetensors (cabeza MTP) | no disponible | Solo contiene la cabeza MTP destilada por KL; no es un modelo completo |
| z-lab/Qwen3.6-35B-A3B-DFlash | 35B totales / 3B activos | no disponible | no disponible | no disponible | Companion DFlash incluido en el artefacto pero no usado en la ruta validada de 3090 |

## Limitaciones y advertencias

- La abliteration elimina los rechazos de contenido, por lo que el modelo puede generar material ofensivo, ilegal o peligroso; está etiquetado como `not-for-all-audiences`.
- Se han observado bucles de salida infinita o repetitiva cuando se superan aproximadamente 110K tokens activos en la conversación; el watchdog reinicia el backend al detectar la firma del bucle y la petición debe reintentarse.
- El watchdog es obligatorio en la configuración de referencia y solo se ha probado en la máquina del mantenedor; el comportamiento en otros equipos es desconocido.
- El rendimiento cerca del límite de 200K de contexto no está establecido en términos de velocidad ni fiabilidad.
- La visión reduce drásticamente el contexto disponible en 24 GB (máximo 32K) y no está activada por defecto.
- Solo se ha validado con NInfer en RTX 3090; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- Los datos de rendimiento proceden de uso real del mantenedor, no de benchmarks controlados, y varían con la carga del sistema.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Aunque la licencia es Apache 2.0, el uso comercial del contenido generado sin filtros requiere evaluación legal propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Draqen/Ornith-1.5-35B-A3B-Abliterated-MTP-NInfer
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Cabeza MTP de Shisa: https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY
- Companion DFlash: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Backend NInfer para RTX 3090: https://github.com/Don-Chad/ninfer-3090/releases
- NInfer upstream: https://github.com/Neroued/ninfer
