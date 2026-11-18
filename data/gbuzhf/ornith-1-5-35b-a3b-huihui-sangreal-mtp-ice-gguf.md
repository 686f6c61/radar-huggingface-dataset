# gbuzhf/Ornith-1.5-35B-A3B-Huihui-Sangreal-MTP-ICE-GGUF

## Resumen

Ornith-1.5-35B-A3B-Huihui-Sangreal-MTP-ICE-GGUF es una familia de cuantizaciones GGUF del checkpoint abliterado Huihui-Ornith-1.5-35B-A3B, publicado por el usuario gbuzhf. El modelo original es Ornith-1.5-35B-A3B, desarrollado por ornith-ai, y la versión abliterada (sin mecanismos de rechazo en los pesos) la produce huihui-ai bajo licencia MIT. Esta ficha cubre exclusivamente el repositorio de cuantizaciones, que aplica recetas propietarias de cuantización (ICE 1.6 e ICE 2.0) sobre una matriz de importancia de 36.025 fragmentos del corpus Sangreal.

La arquitectura es un transformer de mezcla de expertos (MoE) de tipo Qwen-3.5-35B-A3B (etiqueta `qwen35moe`): 40 capas, 256 expertos enrutados con 8 activos más un experto compartido, atención híbrida Gated DeltaNet / atención completa, y aproximadamente 3.000 millones de parámetros activos sobre 35.505.251.456 totales. Incorpora una cabeza MTPv2 (una capa de borrador, `nextn_predict_layers = 1`) que se conserva en todos los ficheros para decodificación especulativa.

Su relevancia práctica es doble: por un lado, ofrece cinco niveles de cuantización con métricas de fidelidad publicadas frente al maestro BF16 (divergencia KL y coincidencia top-1), lo que permite elegir el compromiso tamaño/calidad con datos; por otro, el nivel de 25 GB fue capaz de generar un juego completo en un único disparo en una RTX 3070 de 8 GB de VRAM con 32 GB de RAM, lo que demuestra que un MoE de 35B puede operar en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE tipo Qwen-3.5-35B-A3B (`qwen35moe`), 40 capas, atención híbrida Gated DeltaNet / atención completa |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | ~3B (8 de 256 expertos enrutados + experto compartido) |
| Longitud de contexto | Hasta 65.536 tokens en el ejemplo de uso (`-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | IQ2_XS, IQ3_XXS + IQ2_S, IQ4_XS + IQ3_S, Q4_K + Q5_K, Q5_K + Q4_K (recetas ICE 2.0 por tensor) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (con cabeza MTP incluida en todos los ficheros) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen-3.5-35B-A3B: 40 capas con 256 expertos enrutados de los que se activan 8 por token, más un experto compartido, lo que da un cómputo efectivo de aproximadamente 3.000 millones de parámetros. La atención es híbrida, combinando capas Gated DeltaNet (atención lineal con estado recurrente) y capas de atención completa. Se añade una cabeza MTPv2 de una sola capa de borrador para decodificación especulativa con profundidad 1, soportada por llama.cpp cuando la compilación incluye MTP.

El checkpoint de partida es la versión abliterada de huihui-ai, que suprime el comportamiento de rechazo directamente en los pesos mediante la técnica de abliteration. Sobre ese checkpoint, gbuzhf aplica una matriz de importancia de 36.025 fragmentos del corpus Sangreal, recetas ICE 1.6 por tensor e ICE 2.0 para reparación de expertos posterior a la cuantización. Los ficheros ICE incluyen la plantilla de chat Arrow 4.0 (basada en Qwen-Sharp v22.5.0 de peculiar-ragdoll) con un envoltorio de operador de gbuzhf. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y generación de código: el nivel de 25 GB generó un juego completo en un único `index.html` sin activos externos ni llamadas de red.
- Decodificación especulativa mediante cabeza MTPv2 (profundidad de borrador 1) en compilaciones de llama.cpp con soporte MTP.
- Capacidad multimodal potencial: el proyector de visión se distribuye por separado (mmproj de ornith-ai) y debe usarse directamente el del modelo original.
- Sin mecanismos de rechazo: el checkpoint abliterado no aplica filtros de seguridad en los pesos.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Desarrollo de videojuegos en un solo disparo: generar prototipos completos en HTML/JavaScript autocontenidos, como demuestra el caso Coral Dragon Reef Rescue, donde el modelo produjo un juego entero sin activos externos en aproximadamente 1 h 30 min sobre una RTX 3070.
- Inferencia local en hardware de consumo: el nivel de 12 GB (IQ2_XS) permite ejecutar un MoE de 35B en GPUs con 12-16 GB de VRAM, útil para laboratorios sin acceso a A100/H100.
- Generación de código en pipelines internos: con contexto de hasta 65.536 tokens y buena fidelidad en código (KLD de 0,0137 en el nivel de 25 GB sobre 2K), adecuado para completar y refactorizar ficheros grandes.
- Asistentes conversacionales sin restricciones de contenido: para investigación sobre comportamiento de modelos sin alineación de rechazo, en entornos aislados.
- Procesamiento de documentos largos en inglés o chino: la ventana de 64K tokens permite resumir o extraer información de contratos, informes técnicos o código fuente extenso.
- Evaluación comparativa de cuantizaciones: los cinco niveles con métricas de KLD y coincidencia top-1 publicadas permiten estudiar el compromiso tamaño/calidad en MoE con atención híbrida.
- Despliegue con decodificación especulativa: usar la cabeza MTP en llama.cpp para reducir latencia en generación interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización frente al maestro BF16:

| Nivel | Tamaño (sin MTP) | KLD wiki 2K | KLD code 2K | KLD code 16K | Top-1 igual (wiki / code / code 16K) | Score |
|---|---|---|---|---|---|---|
| 25G-ICEv2 | 24,53 GB | 0,0274 | 0,0137 | 0,0376 | 93,4 % / 97,1 % / 96,8 % | 97,0 |
| 23G-ICEv2 | 22,52 GB | 0,0313 | 0,0173 | 0,0409 | 92,9 % / 96,8 % / 96,5 % | 96,6 |
| 19G-ICEv2 | 18,47 GB | 0,0511 | 0,0298 | 0,0548 | 91,1 % / 95,8 % / 95,7 % | 95,2 |
| 15G-ICEv2 | 14,51 GB | 0,1162 | 0,0734 | 0,1001 | 86,6 % / 93,6 % / 93,6 % | 91,2 |
| 12G-ICEv2 | 11,90 GB | 0,2027 | 0,1277 | 0,1541 | 82,3 % / 91,4 % / 91,6 % | 86,8 |

Score: F16 = 100; 70 % de fidelidad de distribución completa `1/(1+KLD)` + 30 % de coincidencia top-1, promediado sobre los tres conjuntos.

## Requisitos de hardware

- VRAM estimada: entre 12 GB (nivel 12G) y 25 GB (nivel 25G) para los pesos; el ejemplo documentado usa `-c 65536`, por lo que la caché KV añade varios GB adicionales según la GPU.
- GPU recomendadas: RTX 3090/4090 (24 GB) para los niveles 19G-25G con contexto moderado; A100 40/80 GB o H100 para contexto completo de 64K y concurrencia.
- Cabe en GPU de consumo: sí. El autor reporta ejecutar el nivel de 25 GB en una RTX 3070 de 8 GB con 32 GB de RAM (descarga parcial a RAM) y sin MTP. El nivel de 12 GB es viable en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp / llama-server (comando documentado: `llama-server -m ... --jinja -c 65536 -fa on`), y por extensión Ollama u otros frontends compatibles con GGUF. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles de forma numérica. La cabeza MTP permite decodificación especulativa con profundidad 1 cuando la compilación de llama.cpp la soporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (Ornith-1.5-35B-A3B ICE GGUF) | 35,5B | ~3B | 64K en ejemplo | MIT | GGUF | Abliterado, MTP, 5 niveles ICE 2.0 |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35,5B | ~3B | no disponible | MIT | safetensors | Checkpoint fuente abliterado, sin cuantizar |
| ornith-ai/Ornith-1.5-35B-A3B | 35,5B | ~3B | no disponible | no disponible | safetensors | Modelo original con alineación de rechazo |
| ornith-ai/Ornith-1.5-35B-A3B-GGUF | 35,5B | ~3B | no disponible | no disponible | GGUF | Cuantizaciones oficiales con mmproj de visión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: el comportamiento de rechazo está suprimido en los pesos. El autor recomienda aislarlo a nivel de sistema operativo y controlar su acceso a red y ejecución de código, ya que una inyección de prompt no encontrará ninguna barrera interna.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; al tratarse de un modelo sin alineación, la tendencia a inventar puede no estar mitigada.
- Idiomas: solo inglés y chino documentados; el rendimiento en castellano no está garantizado.
- Licencia MIT en el repositorio de cuantización y en el checkpoint abliterado; la licencia del modelo original de ornith-ai no se especifica en la información disponible, por lo que conviene verificarla antes de uso comercial.
- Fidelidad degradada en niveles bajos: el nivel de 12 GB presenta KLD de 0,2027 en wiki 2K y solo 82,3 % de coincidencia top-1, lo que puede afectar tareas sensibles a la precisión.
- El proyector de visión no está incluido; hay que descargar el mmproj del repositorio oficial de ornith-ai.
- La plantilla de chat Arrow 4.0 es específica de estos ficheros; usar otra plantilla puede degradar el comportamiento conversacional.
- No se documentan garantías de soporte de tool calling ni de razonamiento agéntico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Huihui-Sangreal-MTP-ICE-GGUF
- Checkpoint abliterado de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficial con proyector de visión: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF/blob/main/mmproj-Ornith-1.5-35B-BF16.gguf
