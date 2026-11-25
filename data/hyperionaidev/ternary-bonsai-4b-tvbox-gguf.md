# hyperionaidev/Ternary-Bonsai-4B-tvbox-GGUF

## Resumen

Ternary-Bonsai-4B-tvbox-GGUF es una cuantización GGUF de 1,18 GB derivada de Ternary-Bonsai-4B, un modelo de lenguaje de 4.179.521.688 parámetros desarrollado por PrismML y distribuido con licencia Apache-2.0. La variante la publica el autor hyperionaidev dentro del proyecto smolmaxxing, cuyo objetivo es exprimir modelos de lenguaje en hardware de gama muy baja: en concreto, esta ficha corresponde al archivo exacto que ejecuta el modelo a 4,3 tokens por segundo en una Xiaomi TV Box S de tercera generación, un dispositivo con 4 núcleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable.

El modelo base emplea pesos ternarios (esquema de cuantización Q2_0_g64 en llama.cpp), lo que reduce drásticamente el espacio de almacenamiento y el ancho de banda de memoria. Esta variante no modifica los pesos: copia los tensores ternarios byte a byte y solo añade una cabeza de salida podada de 61.592 filas (frente a las 151.669 del vocabulario original), seleccionadas por frecuencia de token en un corpus inglés y multilingüe. El resultado es un archivo que cabe en 1,03 GB de memoria en el dispositivo y que mantiene una perplejidad en inglés de aproximadamente 0,965 bits por byte.

Su relevancia actual es doble: por un lado, demuestra que un transformer de 4B con pesos ternarios puede ejecutarse de forma interactiva en un SoC ARM de bajo consumo sin GPU; por otro, documenta técnicas de kernel (escalas promediadas por grupo de 128 pesos y desempaquetado de códigos ternarios en campos de 2 bits) que mejoran el rendimiento en CPUs in-order a costa de un 0,18 % de perplejidad adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Ternary-Bonsai-4B; detalles de capas y atención no disponibles) |
| Parametros totales | 4.179.521.688 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 1024` |
| Tipos de cuantizacion | Ternaria Q2_0_g64 (GGUF), con escalas promediadas por grupo de 128 pesos y campos de 2 bits en las capas 0-35 |
| Idiomas soportados | no disponible (la cabeza de salida se seleccionó con un corpus inglés y multilingüe, pero no se enumeran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`tb4-q20-hml.gguf`, 1,18 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer de 4B parámetros con pesos ternarios. El archivo GGUF deriva de `Ternary-Bonsai-4B-Q2_0_g64.gguf` del repositorio `prism-ml/Ternary-Bonsai-4B-gguf`, y los pesos se copian sin alteración. El modelo base ata su capa de salida a la matriz de embeddings, de modo que esta variante añade una cabeza de salida separada de 61.592 filas extraída de `token_embd`, elegida por frecuencia de token mediante la lista `data/head-ids-qwen3-ml64k.txt`. Los prompts pueden usar cualquier token del vocabulario original, pero la generación queda restringida a los tokens de la cabeza podada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica documentada es de inferencia, no de entrenamiento: el kernel del parche de smolmaxxing modifica los pesos en RAM en tiempo de carga (el archivo en disco no se toca) aplicando dos transformaciones. Primero, cada grupo de 128 pesos recibe una escala promediada en lugar de dos escalas de 64, lo que cuesta un 0,18 % de perplejidad. Segundo, los códigos ternarios se desempaquetan de base 3 a campos de 2 bits, lo que en el Cortex-A55 in-order reduce el coste de aproximadamente 5 operaciones NEON por 16 pesos a unas 2, a cambio de un 13 % más de RAM.

## Capacidades

- Generación de texto conversacional: el modelo se distribuye con la etiqueta `conversational` y se ha validado en chat real multi-turno en la TV box.
- Razonamiento y generación de código: capacidades heredadas del modelo base Ternary-Bonsai-4B; no se documentan evaluaciones específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la cabeza de salida se seleccionó sobre un corpus inglés y multilingüe, pero no se enumeran los idiomas cubiertos.
- Capacidad especial: pesos ternarios optimizados para ejecución en CPU ARM de gama baja (Cortex-A55) con huella de memoria de 1,03 GB.
- Restricción funcional: solo puede generar tokens pertenecientes a la cabeza podada de 61.592 entradas.

## Casos de uso

- Asistente conversacional en dispositivos de gama baja: el modelo cabe en 1,03 GB de RAM y genera a 4,3 tok/s en una Xiaomi TV Box S, por lo que puede integrarse como asistente local en televisiones, decodificadores o placas SBC sin GPU.
- Procesamiento de lenguaje en el borde sin conectividad: al ejecutarse íntegramente en local con llama.cpp, permite clasificación de texto, resumen o respuesta a preguntas en entornos sin acceso a red.
- Prototipado de aplicaciones LLM en hardware restringido: sirve para validar pipelines de chat y prompts en un dispositivo de 1 GB de RAM antes de escalar a modelos mayores.
- Demostración e investigación sobre cuantización ternaria: el archivo y el parche documentan el impacto de las escalas promediadas y del desempaquetado en 2 bits, útiles para estudiar compromisos entre velocidad y perplejidad en CPUs in-order.
- Automatización doméstica con voz o texto: combinado con un front-end de reconocimiento de voz, puede gestionar comandos y respuestas conversacionales en un dispositivo empotrado.
- Educación y talleres: permite mostrar el funcionamiento interno de un LLM cuantizado y de un servidor llama.cpp en hardware asequible, con métricas reproducibles de tokens por segundo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Velocidad en chat real (Xiaomi TV Box S) | 4,3 tok/s |
| Velocidad con llama-bench | 4,8 tok/s |
| Procesamiento de prompt | 9,6 tok/s |
| Calidad (perplejidad en inglés, bits por byte) | ≈0,965 con escalas promediadas; 0,964 sin ellas |
| Memoria en el dispositivo | 1,03 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,03 GB en el dispositivo con el archivo de 1,18 GB; el ejemplo de ejecución reserva contexto de 1024 tokens.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU ARM. No se documenta comportamiento en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el formato ternario Q2_0_g64 y el parche están pensados para llama.cpp en CPU.
- Hardware validado: Xiaomi TV Box S (3.ª generación), 4× Cortex-A55 y ~1 GB de RAM utilizable.
- Despliegue: requiere llama.cpp parcheado (base `8642541` más `patches/llama.cpp-v0.8.0-tvbox.patch`). No carga en llama.cpp estándar, LM Studio ni Ollama.
- Variables de entorno recomendadas: `GGML_Q2_0_SCALES=128 GGML_Q2_0_SCALES_AVG=1 GGML_Q2_0_F2_LAYERS=0-35`, con `-t 3 -c 1024 -ub 128 -b 128`.
- Latencia y throughput: 4,3 tok/s en chat real y 9,6 tok/s de procesamiento de prompt en el hardware validado; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-4B-tvbox-GGUF | 4,18B | no disponible | Ternaria Q2_0_g64 con cabeza podada | Apache-2.0 | GGUF con llama.cpp parcheado |
| prism-ml/Ternary-Bonsai-4B-gguf | 4,18B | no disponible | Ternaria Q2_0_g64 sin podar | Apache-2.0 | GGUF estándar en llama.cpp |
| prism-ml/Ternary-Bonsai-4B-unpacked | 4,18B | no disponible | Pesos sin empaquetar | Apache-2.0 | Safetensors |

No se dispone de datos de rendimiento comparativo con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Requiere una build parcheada de llama.cpp; no funciona en llama.cpp estándar, LM Studio ni Ollama, lo que limita su adopción directa.
- La cabeza de salida podada restringe la generación a 61.592 tokens; aunque los prompts admiten el vocabulario completo, ciertos tokens raros o de idiomas poco representados no podrán generarse.
- Las escalas promediadas introducen una pérdida de calidad medible (+0,18 % de perplejidad); sin las variables de entorno el archivo es sin pérdida pero más lento.
- El contexto de ejemplo es de 1024 tokens; no se documenta la longitud máxima soportada, por lo que no es adecuado para tareas que requieran ventanas largas sin verificación previa.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base; debe tratarse como un modelo experimental de demostración.
- El rendimiento medido (4,3 tok/s) corresponde a un hardware concreto; en otras CPUs puede variar de forma significativa.
- La licencia Apache-2.0 permite uso comercial, pero el parche de smolmaxxing y las dependencias deben verificarse por separado (llama.cpp es MIT).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyperionaidev/Ternary-Bonsai-4B-tvbox-GGUF
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-4B-gguf
- Modelo base sin empaquetar: https://huggingface.co/prism-ml/Ternary-Bonsai-4B-unpacked
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos: https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Scoreboard del proyecto: https://github.com/hyperionaidev/smolmaxxing#scoreboard
- Guía de inicio rápido: https://github.com/hyperionaidev/smolmaxxing#quick-start
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/hyperionaidev
