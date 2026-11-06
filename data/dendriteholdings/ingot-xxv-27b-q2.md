# dendriteholdings/Ingot-XXV-27B-Q2

## Resumen

Ingot-XXV-27B-Q2 es un modelo de lenguaje de 26.896 millones de parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que mas se aproxima a el. El modelo parte de Prism ML Ternary Bonsai 2 27B, conserva sus codigos ternarios y reajusta el resto de pesos para acercarse al profesor Qwen3.8-27B.

Se distribuye exclusivamente en formato GGUF con dos variantes que contienen los mismos pesos ternarios: una de 1,75 bits por peso (5,95 GB) y otra de 2,125 bits por peso en contenedor de 2 bits (7,21 GB). No es un modelo pensado para entrenamiento ni para fine-tuning convencional, sino para inferencia de muy bajo coste en hardware de consumo y en Apple Silicon, con un fork especifico de llama.cpp que implementa la rotacion de Hadamard y la atencion lineal necesarias.

Su relevancia radica en la compresion extrema: un modelo de ~27B que cabe en menos de 8 GB y que, segun las metricas del autor, mantiene una divergencia KL de 0,08148 frente al profesor BF16, ligeramente mejor que la del rey anterior de la subnet (0,08278). Es un caso practico de cuantizacion ternaria llevada a produccion mediante un formato propietario y un runtime parcheado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y rotacion de Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos pesos ternarios) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML, que combina atencion lineal con una rotacion de Hadamard aplicada sobre las activaciones o pesos (el model card menciona explicitamente que el fork de Dendrite fusiona la rotacion de Hadamard con la actualizacion de estado de la atencion lineal en Metal). Los pesos son ternarios: cada bloque de 128 pesos conserva sus codigos y una escala fp16, de modo que cada peso decodifica a un valor discreto. El archivo PTQ1_0 es un reempaquetado sin perdida del PQ2_0 del minero, y el mismo proceso aplicado al PQ2_0 original de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

El entrenamiento no es un preentrenamiento desde cero: el minero reajusta los pesos no ternarios de Bonsai 2 para minimizar la divergencia respecto a Qwen3.8-27B, que actua como profesor BF16. La evaluacion de Ingot mide, por token de respuesta, la KL entre las distribuciones del siguiente token del profesor y del modelo, y la distancia de estados ocultos normalizada promediada cada 8 capas. No se documentan el volumen de tokens de ajuste, la composicion del dataset ni si hubo RLHF o DPO; esos datos no estan disponibles.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento y respuesta a instrucciones heredados del profesor Qwen3.8-27B, aunque la fidelidad exacta no esta cuantificada mas alla de las metricas KL y de distancia de estados ocultos.
- Entrada de imagenes opcional: requiere anadir el proyector multimodal de Ternary Bonsai 2 27B (mmproj en Q8_0 o BF16). El autor advierte que ese proyector se creo para el modelo genesis y que la calidad visual no esta probada.
- Decodificacion especulativa mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2), que acelera la generacion en modo greedy y con muestreo.
- Soporte de plantillas de chat mediante `--jinja` en llama-server, lo que habilita el formato de conversacion del tokenizer heredado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia en GPU de consumo: con 5,95-7,21 GB de pesos, el modelo cabe en tarjetas de 8-12 GB y permite desplegar un LLM de ~27B en equipos domesticos, algo inviable con el modelo en BF16.
- Despliegue en Apple Silicon: en un Mac Studio M3 Ultra el autor mide 56,4 tok/s de decodificacion con el fork de Dendrite y el archivo PQ2_0, lo que lo hace util para asistentes locales en estaciones de trabajo Mac.
- Servicio de chat de bajo coste por token: con 137-145 tok/s de decodificacion en una RTX PRO 6000 Blackwell y 3.865 tok/s de prefill, es adecuado para endpoints conversacionales con alta concurrencia y presupuesto de VRAM reducido.
- Generacion acelerada con decodificacion especulativa: el drafter DFlash 2 multiplica por ~1,8 la velocidad en greedy a cambio de ~6 GB extra de VRAM, util para asistentes interactivos donde la latencia percibida importa.
- Experimentacion en investigacion de cuantizacion: sirve como referencia reproducible para estudiar el impacto de la cuantizacion ternaria en la fidelidad respecto a un profesor BF16, con metricas KL y de estados ocultos publicadas.
- Evaluacion de subnets de Bittensor: permite reproducir el pipeline de Ingot (minero cuantiza, validador compara con el profesor) usando el fork y el commit exactos con los que se puntuo el modelo.
- Prototipado multimodal ligero: anadiendo el mmproj de Bonsai 2 se puede probar entrada de imagenes en local, asumiendo que la calidad no esta validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas de fidelidad respecto al profesor y velocidades de inferencia.

| Metrica | Este modelo | Rey anterior de Ingot |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08148 | 0,08278 |
| Distancia de estados ocultos | 0,3106 | 0,3113 |

| Hardware | Archivo | Decodificacion (tok/s) | Prefill (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork Prism stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork Prism stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

El autor cita ademas 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090, dato de PrismML no medido por dendriteholdings.

## Requisitos de hardware

- VRAM estimada: 5,95 GB para el archivo PTQ1_0 y 7,21 GB para el PQ2_0, mas overhead de contexto KV y buffers de llama.cpp.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida por el autor), RTX 5090 (dato de PrismML para Bonsai 2) y, en general, cualquier GPU con 8-12 GB o mas que soporte el fork con CUDA.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con el archivo PTQ1_0, y de 12 GB con holgura para contexto largo.
- Apple Silicon: funciona en Mac con Metal; el fork de Dendrite mejora la decodificacion de 44,5 a 56,4 tok/s en M3 Ultra.
- Opciones de despliegue: exclusivamente llama.cpp mediante el fork de DendriteLabs en el commit c96baf4. Stock llama.cpp no ejecuta el archivo. vLLM, TGI y Ollama no estan soportados segun la informacion disponible.
- Aceleracion opcional: drafter DFlash 2 (Ingot-27B-DFlash2-Q8_0.gguf) con `--spec-type draft-dflash --spec-draft-n-max 5`, ~1,8x en greedy y 1,3-1,4x con muestreo, a cambio de ~6 GB extra de VRAM.
- Throughput y latencia: ver tabla de benchmarks; el prefill medido es de 3.865 tok/s en la RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXV-27B-Q2 | 26,9B | no disponible | Ternaria 1,75 / 2,125 bpw | no disponible | GGUF, fork Dendrite de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27B | no disponible | Ternaria (PQ2_0 y PTQ1_0) | no disponible | GGUF, fork de llama.cpp de PrismML |
| Qwen3.8-27B (profesor) | ~27B | no disponible | BF16 | no disponible | pesos completos, runtime estandar |

Frente a Bonsai 2, Ingot-XXV-27B-Q2 comparte codigos ternarios y formato, pero reajusta el resto de pesos para acercarse al profesor; el autor reporta una KL ligeramente mejor que la del rey anterior. Frente al profesor Qwen3.8-27B en BF16, la ventaja es de tamano (7,21 GB frente a decenas de GB) a costa de una fidelidad imperfecta y de depender de un runtime parcheado. No se dispone de datos de benchmarks que permitan comparar calidad de tarea entre los tres.

## Limitaciones y advertencias

- No funciona con llama.cpp estandar: requiere el fork de DendriteLabs en el commit c96baf4, lo que complica el mantenimiento y la portabilidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion; conviene contactar con el autor antes de produccion.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no disponible, lo que impide planificar cargas con prompts largos.
- Riesgo de alucinacion inherente a la cuantizacion ternaria y al ajuste hacia un profesor; la KL de 0,08148 indica divergencia no nula en cada token.
- El proyector multimodal disponible se creo para el modelo genesis, no para estos pesos, y la calidad de imagen no esta probada.
- El modelo es una submission de una subnet de Bittensor: su procedencia y el proceso de seleccion no equivalen a una validacion independiente de calidad.
- Sin datos de benchmarks estandar, no es posible comparar su rendimiento en tareas concretas con alternativas de la misma categoria.
- El uso de decodificacion especulativa anade ~6 GB de VRAM y depende de un drafter especifico de la familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXV-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit del fork: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
