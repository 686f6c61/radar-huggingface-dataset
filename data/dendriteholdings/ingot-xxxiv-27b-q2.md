# dendriteholdings/Ingot-XXXIV-27B-Q2

## Resumen

Ingot-XXXIV-27B-Q2 es un modelo de lenguaje de 26.896 millones de parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que mas se aproxima a el. El punto de partida es Ternary Bonsai 2 27B de Prism ML, un modelo con pesos ternarios; el minero modifico menos del 0,01% de los codigos ternarios y reajusto el resto de pesos para acercar la salida del modelo a la de Qwen3.8-27B, el profesor de referencia.

El resultado se distribuye en formato GGUF con dos ficheros que contienen exactamente los mismos pesos ternarios: uno a 1,75 bits por peso (5,95 GB) y otro en contenedor de 2 bits (7,21 GB), que decodifica mas rapido en GPU. La relevancia de esta ficha es doble: por un lado documenta un modelo de 27B que cabe en 6-7 GB de disco gracias a la cuantizacion ternaria; por otro, ilustra el flujo de trabajo de un subnet de Bittensor orientado a compresion de modelos, con metricas objetivas de fidelidad al profesor (KL de 0,08419 frente a 0,08602 del rey anterior).

No se dispone de informacion sobre licencia, idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la documentacion proporcionada. El modelo requiere un fork especifico de llama.cpp (DendriteLabs) y no funciona con llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Prism ML Ternary Bonsai 2 27B; pesos ternarios, atencion lineal con rotacion de Hadamard segun el fork de llama.cpp) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: 1,75 bits por peso (PTQ1_0) y 2,125 bits por peso (PQ2_0, mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXXIV-27B-PTQ1_0.gguf`, `Ingot-XXXIV-27B-PQ2_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la model card. Se sabe que el modelo es un finetune de Prism ML Ternary Bonsai 2 27B, un modelo con pesos ternarios que emplea atencion lineal con rotacion de Hadamard (el fork de Dendrite fusiona la rotacion de Hadamard y la actualizacion de estado de atencion lineal en Metal para esta familia de modelos). El proceso de entrenamiento consistio en modificar menos del 0,01% de los codigos ternarios del modelo base y reajustar el resto de pesos para reducir la divergencia respecto a Qwen3.8-27B, que actua como profesor de referencia en el subnet Ingot.

La evaluacion del subnet se basa en la divergencia KL entre las distribuciones de siguiente token del profesor en BF16 y las del modelo candidato, sobre los tokens de respuesta de cada dominio, ponderando los dominios por su cuota de muestras. El modelo obtuvo un KL de 0,08419 frente al 0,08602 del rey anterior en la misma evaluacion. El fichero PTQ1_0 es un reempaquetado sin perdida del fichero original del minero en el formato PTQ1_0 de Prism: cada bloque de 128 pesos conserva sus codigos y su escala fp16, y cada peso decodifica al mismo valor. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: el fichero distribuido es solo texto; es posible anadir la torre de vision de Ternary Bonsai 2 27B como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf`), aunque fue creada para el modelo genesis y la calidad de imagen no esta probada.
- Decodificacion especulativa: compatible con el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generacion aproximadamente 1,8x en modo greedy y 1,3-1,4x con muestreo, a cambio de unos 6 GB adicionales de VRAM.

## Casos de uso

- Despliegue en hardware con VRAM limitada: con 5,95-7,21 GB de pesos, el modelo permite servir un modelo de 27B en GPUs de consumo o en equipos Apple Silicon, algo inviable con pesos en BF16 (que ocuparian mas de 50 GB). Adecuado para prototipos y entornos de desarrollo con presupuesto de memoria ajustado.
- Inferencia local en estaciones de trabajo Mac: en un Mac Studio M3 Ultra con el fork de Dendrite se miden 56,4 tok/s de decodificacion con el fichero PQ2_0, lo que permite asistentes conversacionales interactivos en local sin GPU dedicada.
- Servicio de chat de baja latencia en GPU: con 137-145 tok/s de decodificacion en una RTX PRO 6000 Blackwell y 3.865 tok/s de procesamiento de prompt, es viable para atencion al cliente automatizada o asistentes internos con concurrencia moderada.
- Investigacion sobre cuantizacion ternaria: el modelo sirve como caso de estudio reproducible de un pipeline de cuantizacion competitiva, con metricas KL publicadas y dos formatos equivalentes (PTQ1_0 y PQ2_0) para comparar tamano frente a velocidad de decodificacion.
- Generacion aumentada con recuperacion (RAG) en entornos con recursos limitados: al ocupar poco espacio en disco y memoria, deja margen para el indice vectorial y el resto del stack en la misma maquina; la longitud de contexto no esta documentada, por lo que habria que validarla antes de usarla con documentos largos.
- Experimentacion con decodificacion especulativa: la combinacion con el drafter DFlash 2 permite medir el impacto de la decodificacion especulativa en un modelo ternario, con incrementos de 1,3-1,8x en velocidad.
- Evaluacion de fidelidad a un profesor: util para investigadores que estudien tecnicas de destilacion y ajuste fino sobre modelos cuantizados, comparando el KL reportado con el de otras submissions del subnet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de calidad publicada es la divergencia KL frente al profesor:

| Metrica | Este modelo | Rey anterior (misma evaluacion) |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08419 | 0,08602 |

Rendimiento medido con `llama-bench` (tg128 y pp512, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (parche Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (parche Metal) | PTQ1_0 | 52,8 | 368 |

Prism ML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 5,95 GB para el fichero PTQ1_0 y 7,21 GB para el PQ2_0, mas el espacio de contexto y el overhead del runtime. Con el drafter DFlash 2 hay que sumar unos 6 GB adicionales.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (dato de Prism ML para el modelo base), y en general cualquier GPU con 8 GB o mas de VRAM para el modelo solo.
- Cabe en GPU de consumo: si, dado el tamano de los ficheros; no se han publicado mediciones en tarjetas de gama media o baja.
- Apple Silicon: medido en Mac Studio M3 Ultra (80 nucleos GPU, 512 GB) con Metal.
- Opciones de despliegue: llama.cpp exclusivamente, y no la version estandar: se requiere el fork de DendriteLabs de llama.cpp en el commit `62c418c`. El comando de referencia es `llama-server -m <fichero>.gguf -ngl 99 -fa on --jinja`. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: ver tabla de benchmarks; el fichero PTQ1_0 decodifica mas rapido en la RTX PRO 6000 (145 frente a 137 tok/s), mientras que en Mac el PQ2_0 va por delante (56,4 frente a 52,8 tok/s con el fork de Dendrite).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXIV-27B-Q2 | 26,9B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | GGUF, fork Dendrite de llama.cpp |
| Prism ML Ternary Bonsai 2 27B | 27B (aproximado) | no disponible | Ternaria (PQ2_0, PTQ1_0) | no disponible | GGUF, fork PrismML de llama.cpp |
| Ingot-genesis-27B-Q2 | no disponible | no disponible | Ternaria Q2 | no disponible | GGUF, fork Dendrite de llama.cpp |
| Qwen3.8-27B (profesor de referencia) | 27B (aproximado) | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de la misma categoria en pesos convencionales (por ejemplo, modelos de 27B en BF16 o en cuantizacion de 4 bits) no puede establecerse con rigor porque no hay benchmarks estandar publicados para este modelo.

## Limitaciones y advertencias

- No funciona con llama.cpp estandar: requiere el fork de DendriteLabs en el commit `62c418c`, lo que limita la portabilidad y complica el mantenimiento en produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (Ternary Bonsai 2 27B) y del propio repositorio antes de desplegarlo.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del idioma o idiomas con los que se entreno el modelo base.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin validacion previa.
- La calidad se ha evaluado unicamente mediante divergencia KL frente a un profesor en el marco del subnet; no hay evidencia de rendimiento en tareas downstream estandar, por lo que las capacidades reales de razonamiento, codigo o matematicas son desconocidas.
- Riesgo de alucinacion y sesgos: no documentados; al ser un modelo derivado de un proceso de cuantizacion competitiva, no se han publicado analisis de sesgo ni evaluaciones de seguridad.
- La torre de vision es un anadido no validado para estos pesos: fue creada para el modelo genesis y la calidad de imagen no esta probada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 13 de noviembre de 2026; se trata de un artefacto de un subnet con poca validacion externa.
- El proceso de cuantizacion ternaria puede introducir degradaciones sutiles no capturadas por la metrica KL, especialmente en tareas de razonamiento de varios pasos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXIV-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter de decodificacion especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
