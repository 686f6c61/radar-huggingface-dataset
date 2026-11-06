# dendriteholdings/Ingot-XXVI-27B-Q2

## Resumen

Ingot-XXVI-27B-Q2 es un modelo de lenguaje de 27.000 millones de parametros distribuido en formato GGUF ternario, resultado de un proceso de cuantizacion competitiva en la subred Ingot de Bittensor. El modelo parte de Ternary Bonsai 2 27B de Prism ML y ha sido refinado por un minero (hotkey `5FAJQwcfoXhTpnRhEcZhNAA6jrpwbvpfqR6mBFZsKGHvLSVj`, uid 83) para acercar sus pesos al profesor Qwen3.8-27B, manteniendo los codigos ternarios originales. El resultado gano la evaluacion de la ronda XXVI al superar al rey vigente en divergencia KL y distancia de estados ocultos.

El modelo se publica como espejo publico del envio ganador y esta pensado para inferencia local eficiente: ocupa entre 5,95 GB y 7,21 GB segun el empaquetado, lo que permite ejecutarlo en GPU de consumo con un consumo de VRAM muy contenido para su numero de parametros. La arquitectura subyacente combina atencion lineal con rotacion de Hadamard, lo que exige un fork especifico de llama.cpp (el fork de DendriteLabs sobre el de PrismML) y no funciona con llama.cpp estandar.

Es relevante ahora porque demuestra un flujo de mejora de modelos cuantizados mediado por incentivos economicos (subred Bittensor) y porque ofrece una alternativa de 27B con huella de memoria de un modelo de 2-3B, a costa de requerir tooling no estandar y de una licencia no declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y rotacion de Hadamard (familia Ternary Bonsai 2); pesos ternarios |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 (1,75 bits por peso) y PQ2_0 (2,125 bits por peso, mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML: un transformer con atencion lineal y una rotacion de Hadamard aplicada en el pipeline de inferencia, con pesos representados en codigos ternarios (cada bloque de 128 pesos conserva sus codigos y una escala fp16). El fichero `Ingot-XXVI-27B-PQ2_0.gguf` mantiene el layout, tokenizer y rotacion de Hadamard de `dendriteholdings/Ingot-genesis-27B-Q2`, toma los codigos ternarios de Bonsai 2 y el resto de pesos del minero.

El entrenamiento no es un preentrenamiento clasico: el minero reajusto los pesos no ternarios para minimizar la divergencia respecto al profesor Qwen3.8-27B, y el validator selecciono la copia mas cercana al profesor. La evaluacion reportada mide KL(profesor ‖ modelo) de las distribuciones del siguiente token y la distancia de estados ocultos normalizada promediada cada 8 capas. El modelo ganador obtuvo KL 0,08216 y distancia 0,3102, frente a 0,08350 y 0,3109 del rey al que supero. No se dispone de datos sobre volumen de tokens, composicion del dataset ni uso de RLHF/DPO. Como innovacion destacable, el autor publica un drafter de decodificacion especulativa (DFlash 2) especifico para esta familia, que acelera la generacion aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Capacidades

- Generacion de texto conversacional en modo chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo y matematicas: no se documentan capacidades especificas mas alla de la generacion de texto; no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Vision: el fichero publicado es solo texto; se puede anadir la torre de vision de Ternary Bonsai 2 27B como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf`), pero fue creada para genesis y la calidad de imagen no esta probada.
- Decodificacion especulativa: compatible con el drafter `dendriteholdings/Ingot-27B-DFlash2` mediante `--spec-type draft-dflash`.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con 5,95-7,21 GB de pesos, el modelo cabe en tarjetas de 8-12 GB y permite desplegar un modelo de 27B en hardware modesto, algo inviable con pesos BF16.
- Chat conversacional de un solo flujo: el drafter DFlash 2 acelera la decodificacion en greedy (1,8x) y con sampling (1,3-1,4x), lo que lo hace adecuado para asistentes interactivos de baja latencia en una sola GPU.
- Servicio en servidor con alta concurrencia de prompt: en una RTX PRO 6000 Blackwell alcanza 3.865 tok/s de procesamiento de prompt (pp512), util para cargas con prompts largos y generacion corta.
- Despliegue en estaciones Mac: con el fork de Dendrite y el parche Metal se obtienen 56,4 tok/s de decodificacion en un Mac Studio M3 Ultra, lo que permite ejecutarlo en entornos Apple sin GPU dedicada.
- Experimentacion en el ecosistema Bittensor: sirve como referencia de modelo ganador de la subred Ingot para mineros y validadores que quieran reproducir la evaluacion o comparar envios.
- Investigacion sobre cuantizacion ternaria: el par de ficheros PTQ1_0 y PQ2_0 permite estudiar el compromiso entre tamano (1,75 vs 2,125 bits por peso) y velocidad de decodificacion con pesos identicos.
- Base para fine-tuning ligero: al ser un GGUF ternario con licencia no declarada, su uso como base de ajuste queda condicionado a aclarar la licencia; no se recomienda en produccion sin esa verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de calidad reportada es la cercania al profesor:

| Metrica | Este modelo | Rey al que supero |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08216 | 0,08350 |
| Distancia de estados ocultos (cada 8 capas) | 0,3102 | 0,3109 |

Rendimiento de inferencia (batch 1, `llama-bench`, tg128 y pp512):

| Hardware | Fichero | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-XXVI-27B-Q2 | 26,9B | no disponible | GGUF ternario, 1,75-2,125 bpw | no disponible | Requiere fork de llama.cpp; ganador de la ronda XXVI de Ingot |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | GGUF ternario | no disponible | Modelo base; 142 tok/s en RTX 5090 segun PrismML |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B | no disponible | GGUF ternario | no disponible | Mismo layout y rotacion de Hadamard; origen del formato |
| Qwen3.8-27B (profesor) | 27B | no disponible | no disponible | no disponible | Profesor de referencia usado en la evaluacion; no se detallan sus specs |

## Limitaciones y advertencias

- No funciona con llama.cpp estandar: requiere el fork de DendriteLabs en el commit `c96baf4` (o el fork de PrismML), lo que complica el despliegue y la integracion en pipelines existentes.
- Licencia no declarada: no se puede asumir uso comercial sin aclaracion expresa del autor; el modelo base tampoco declara licencia en la informacion disponible.
- Idiomas no declarados: no hay garantia de calidad multilingue; el comportamiento fuera del ingles es desconocido.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar cargas con prompts largos.
- Riesgo de alucinacion y sesgos: no hay evaluaciones de seguridad, sesgo ni robustez publicadas; al ser un refinamiento hacia un profesor, puede heredar los sesgos de este.
- Calidad de vision no validada: el proyector mmproj fue creado para genesis, no para estos pesos, y la evaluacion de Ingot solo puntua el modelo de texto.
- Naturaleza del modelo: es un envio de minero seleccionado por cercania al profesor, no un modelo entrenado desde cero; su comportamiento esta acotado por la distribucion del profesor y por la evaluacion de la subred.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema practicamente inexistente, sin comunidad que haya validado el modelo en produccion.
- La decodificacion especulativa con DFlash 2 anade unos 6 GB de VRAM, lo que puede impedir su uso en GPUs de 8 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXVI-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter de decodificacion especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis (layout de referencia): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluacion: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
