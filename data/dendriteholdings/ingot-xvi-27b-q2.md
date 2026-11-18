# dendriteholdings/Ingot-XVI-27B-Q2

## Resumen

Ingot-XVI-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que permanece más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf y conserva sus códigos ternarios, mientras que el resto de pesos han sido reajustados por el minero para acercar la distribución de salida a Qwen3.8-27B, el profesor de referencia.

La relevancia del modelo es doble. Por un lado, demuestra que es posible mantener una fidelidad alta respecto a un profesor BF16 con pesos ternarios empaquetados a 1,75 bits por peso: la KL media por token frente al profesor es de 0,09345, ligeramente mejor que la del rey al que destronó (0,09506). Por otro, ofrece dos artefactos GGUF del mismo conjunto de pesos (PTQ1_0 a 1,75 bpw y PQ2_0 a 2,125 bpw) que caben en GPUs de consumo y en Apple Silicon, con velocidades de decodificación medidas.

El modelo se distribuye únicamente en formato GGUF para llama.cpp y requiere un fork específico (DendriteLabs/llama.cpp en el commit c96baf4) porque el llama.cpp estándar no interpreta su layout, tokenizador y rotación de Hadamard. No se han publicado datos sobre licencia, idiomas soportados ni benchmarks de tareas estándar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios y atención lineal (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (1,75 bits por peso) y PQ2_0 (2,125 bits por peso, mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML: un transformer con pesos ternarios y atención lineal, con una rotación de Hadamard aplicada en el pipeline de inferencia (el fork de Dendrite fusiona esa rotación con la actualización de estado de la atención lineal en Metal). Los códigos ternarios son los del modelo base; el minero reajustó el resto de pesos para acercar las distribuciones de siguiente token a las de Qwen3.8-27B, que actúa como profesor en la evaluación de la subnet.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La única métrica de ajuste publicada es la fidelidad al profesor: KL(profesor ‖ modelo) de 0,09345 por token de respuesta y distancia de estados ocultos relativa de 0,2990 promediada cada 8 capas, frente a 0,09506 y 0,3026 del modelo rey anterior. El empaquetado PTQ1_0 es una repacking sin pérdida del archivo PQ2_0 del minero: cada bloque de 128 pesos conserva sus códigos y su escala fp16, y cada peso decodifica al mismo valor.

## Capacidades

- Generación de texto conversacional en modo chat (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multi-turno, sujeto a la longitud de contexto no documentada.
- Capacidad multimodal opcional: puede aceptar imágenes si se le añade el proyector vision de Ternary-Bonsai-2-27B (mmproj Q8_0 o BF16), aunque la calidad de imagen no está validada para estos pesos.
- Decodificación especulativa mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2), con aceleración de aproximadamente 1,8x en greedy y 1,3-1,4x con sampling.
- Compatibilidad con endpoints (tag endpoints_compatible) para su despliegue como servicio.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente y multi-step reasoning: no documentadas.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Despliegue en GPUs de consumo: con 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0), el modelo cabe en tarjetas de 8-12 GB y permite servir un modelo de 27B en hardware asequible, algo inviable con pesos BF16.
- Inferencia en Apple Silicon: en un Mac Studio M3 Ultra con el fork de Dendrite alcanza 56,4 tok/s de decodificación (PQ2_0) y 432 tok/s de prompt, lo que lo hace adecuado para asistentes locales en estaciones de trabajo Mac.
- Servicio de chat de baja latencia en servidor: en una RTX PRO 6000 Blackwell logra 137-145 tok/s de decodificación y 3.865 tok/s de prompt, suficiente para atender conversaciones concurrentes con un solo acelerador.
- Evaluación de técnicas de cuantización extrema: sirve como referencia reproducible para investigar fidelidad a un profesor BF16 con pesos ternarios, gracias a las métricas KL y de distancia de estados ocultos publicadas.
- Investigación en subnets de Bittensor: el modelo documenta el flujo completo de una submission ganadora (hotkey, uid, identificador de submission), útil para estudiar mecanismos de consenso y evaluación de mineros.
- Prototipado de pipelines con decodificación especulativa: la integración con el drafter DFlash 2 permite medir el compromiso entre throughput y VRAM adicional (unos 6 GB) en entornos de producción.
- Experimentación multimodal ligera: añadiendo el proyector vision del modelo base se puede probar entrada de imágenes en un modelo de 27B con requisitos de memoria reducidos, asumiendo que la calidad no está garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas son de fidelidad al profesor y de velocidad.

| Metrica | Ingot-XVI-27B-Q2 | Rey anterior |
|---|---|---|
| KL(profesor ‖ modelo) por token | 0,09345 | 0,09506 |
| Distancia de estados ocultos relativa | 0,2990 | 0,3026 |

| Hardware | Archivo | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

Prism ML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 5,95 GB con PTQ1_0 y 7,21 GB con PQ2_0, más overhead de contexto y del runtime de llama.cpp.
- VRAM adicional con decodificación especulativa: unos 6 GB para el drafter DFlash 2 en Q8_0.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (dato de Prism ML para el modelo base), GPUs de 8-12 GB para los archivos cuantizados.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM para los archivos publicados.
- Apple Silicon: medido en Mac Studio M3 Ultra; el fork de Dendrite mejora la decodificación entre un 22 y un 27 por ciento en Metal.
- Opciones de despliegue: exclusivamente llama.cpp mediante el fork DendriteLabs/llama.cpp en el commit c96baf4 (con GGML_CUDA para GPU); llama-server con -ngl 99 -fa on --jinja. Stock llama.cpp no lo ejecuta.
- Throughput: 137-145 tok/s de decodificación en RTX PRO 6000 Blackwell; 52,8-56,4 tok/s en M3 Ultra con el fork Dendrite.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ingot-XVI-27B-Q2 | 26,9B | no disponible | no disponible | GGUF (fork Dendrite) | KL 0,09345 frente a Qwen3.8-27B |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B (aprox.) | no disponible | no disponible | GGUF | Modelo base; 142 tok/s en RTX 5090 segun Prism ML |
| Rey anterior de Ingot | no disponible | no disponible | no disponible | GGUF | KL 0,09506; mismas dimensiones de archivo |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Profesor de referencia en la evaluación |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas presentes en los datos del modelo base.
- Longitud de contexto no disponible: impide planificar aplicaciones con ventanas largas.
- Requiere un fork específico de llama.cpp (DendriteLabs, commit c96baf4); el llama.cpp estándar no lo ejecuta, lo que limita portabilidad y soporte a largo plazo.
- Riesgo de alucinación inherente a un modelo ajustado por fidelidad a un profesor, sin datos publicados de evaluación en tareas factuales.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de alineación.
- La capacidad multimodal depende de un proyector diseñado para el modelo genesis, no para estos pesos; la calidad de imagen no está probada.
- El modelo está pensado para evaluación de texto en la subnet; no hay garantías de robustez en tool calling o uso agéntico.
- El rendimiento medido solo cubre una GPU y un equipo Apple; otras configuraciones pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XVI-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Proyector vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
