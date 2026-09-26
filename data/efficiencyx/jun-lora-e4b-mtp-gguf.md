# efficiencyx/Jun-LoRA-E4B-MTP-GGUF

## Resumen

Jun-LoRA-E4B-MTP-GGUF es un modelo borrador (draft model) para decodificacion especulativa de tipo MTP (Multi-Token Prediction), publicado por el usuario efficiencyx. No es un modelo conversacional: su unica funcion es proponer tokens candidatos que un modelo objetivo verifica despues, acelerando la generacion sin alterar su salida. Acompana concretamente al modelo objetivo `efficiencyx/Jun-LoRA-E4B-GGUF`.

El repositorio no contiene pesos entrenados por el autor. Se trata del borrador stock de Google (`google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant`) sin modificar, convertido a GGUF y cuantizado a Q4_K_M. El autor indica que intento afinar un borrador sobre Jun (probado en E4B) y que no supero al stock en llama.cpp, por lo que opto por reubicar el borrador original en la ruta donde lo busca JunOS (el nombre del repo de chat con el sufijo `-MTP` y la misma etiqueta de cuantizacion).

Con unos 78 millones de parametros y un peso de 77 MB, es un componente de infraestructura orientado a reducir la latencia de inferencia local, no una pieza con capacidades generativas propias. Su relevancia es practica: permite acelerar la decodificacion del modelo objetivo en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; modelo borrador para decodificacion especulativa (MTP). Tensores, formas y metadatos de arquitectura identicos a la conversion Q8_0 que ya sirve llama.cpp |
| Parametros totales | 77.993.732 (~78 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repo). Existe una conversion Q8_0 de terceros (`amaranus/Gemma-4-E4B-it-qat-assistant-MTP-Q8_0-GGUF`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); el flujo de conversion parte de BF16 |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura del borrador stock de Google asociado a la rama QAT (Quantization-Aware Training) de Gemma-4 E4B. No es un transformer generativo convencional en el sentido de producir respuestas: opera como cabecera de prediccion multi-token que propone varios tokens por pasada, que el modelo objetivo valida o descarta. Los tensores y formas coinciden con la conversion Q8_0 ya soportada por llama.cpp; la unica diferencia respecto a ella son los tipos de cuantizacion.

No hay entrenamiento adicional por parte del autor. El pipeline documentado es puramente de conversion y cuantizacion con llama.cpp (`8e7f22b`): primero `convert_hf_to_gguf.py` desde el checkpoint `gemma-4-E4B-it-qat-q4_0-unquantized-assistant` a BF16, y despues `llama-quantize` a Q4_K_M. El autor senala que un borrador afinado sobre Jun no mejoro al stock en llama.cpp y que un borrador de la rama no-QAT carga correctamente pero predice mucho peor. No se documentan datos de entrenamiento, numero de tokens ni tecnicas de RLHF/DPO.

## Capacidades

- Prediccion de tokens candidatos (multi-token prediction) para decodificacion especulativa.
- Aceleracion de la inferencia de un modelo objetivo compatible; no genera respuestas por si mismo.
- Funciona como borrador cuando el objetivo usa la misma rama QAT que su base (`unsloth/gemma-4-E4B-it-qat-q4_0-unquantized`).
- Integracion directa con llama.cpp mediante `--spec-type draft-mtp`.
- Deteccion y uso automatico por parte de JunOS a traves de `./mtp-autotune.sh` cuando `OLLAMA_MTP` esta vacio.
- Soporte de idioma: ingles (en).
- No dispone de tool calling, agentes, vision, audio ni modo thinking: es un componente auxiliar de decodificacion.

## Casos de uso

- Aceleracion de inferencia local en GPU de consumo: colocando este borrador junto al objetivo Jun E4B Q4_K_M, el throughput sube de 64,4 a 79,1 tok/s en modo greedy en una RTX 3060, con memoria adicional minima (77 MB).
- Despliegue en llama.cpp: `llama-server -m <objetivo>.gguf --spec-type draft-mtp --spec-draft-model gemma-4-E4B-it-qat-assistant-Q4_K_M.gguf --spec-draft-n-max 1` habilita la decodificacion especulativa en un servidor compatible con la API de OpenAI.
- Integracion con JunOS: el sistema de autotune lo detecta y lo usa como borrador por defecto cuando no se especifica uno manualmente, sin configuracion adicional.
- Optimizacion de latencia en entornos con presupuesto de VRAM ajustado: al ocupar solo 77 MB en Q4_K_M, cabe junto al modelo objetivo en tarjetas pequenas donde un borrador mayor no seria viable.
- Evaluacion de estrategias de decodificacion especulativa: sirve como linea base stock para comparar tasas de aceptacion frente a borradores afinados o de distinta cuantizacion.
- Reproduccion y benchmarking de MTP: permite medir el impacto de `draft_num_predict` y de la temperatura sobre la tasa de aceptacion en un hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible. Los unicos datos de rendimiento facilitados son de velocidad y tasa de aceptacion, medidos con llama.cpp sobre una RTX 3060, objetivo Jun E4B Q4_K_M, cache KV q8_0 y `draft_num_predict=1` (medianas de 12 peticiones):

| Configuracion | Greedy (tok/s) | Temp 0.7 (tok/s) | Aceptacion (greedy / temp 0.7) |
|---|---|---|---|
| Jun solo | 64,4 | 64,3 | no aplica |
| Con el borrador | 79,1 | 75,5 | 0,545 / 0,461 |

El autor indica que proponer 2 tokens por pasada no resulto mas rapido en esa tarjeta.

## Requisitos de hardware

- VRAM del borrador: 77 MB con cuantizacion Q4_K_M; se suma a la del modelo objetivo.
- GPU probada por el autor: RTX 3060.
- Cabe sobradamente en GPU de consumo; el limite practico lo impone el modelo objetivo, no el borrador.
- Opciones de despliegue: llama.cpp (`llama-server` con `--spec-type draft-mtp`), Ollama y JunOS (`mtp-autotune.sh`).
- Throughput de referencia (RTX 3060, objetivo Jun E4B Q4_K_M): 79,1 tok/s greedy y 75,5 tok/s a temperatura 0,7, frente a 64,4 y 64,3 tok/s sin borrador.
- La tasa de aceptacion cae al subir la temperatura (de 0,545 a 0,461), lo que reduce la ganancia en generaciones no greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| efficiencyx/Jun-LoRA-E4B-MTP-GGUF (este) | 78 M | Q4_K_M | no disponible | 79,1 tok/s greedy en RTX 3060 con Jun E4B (aceptacion 0,545) | apache-2.0 | HuggingFace |
| amaranus/Gemma-4-E4B-it-qat-assistant-MTP-Q8_0-GGUF | mismos tensores | Q8_0 | no disponible | no disponible (pesos identicos, mayor precision) | no disponible | HuggingFace |
| google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant | no disponible | BF16 sin cuantizar | no disponible | no disponible (borrador stock de origen) | no disponible | HuggingFace |

Frente a un borrador afinado sobre Jun, el autor reporta que el afinado probado en E4B no supero al stock en llama.cpp. Un borrador de la rama no-QAT carga correctamente pero su tasa de acierto es claramente inferior.

## Limitaciones y advertencias

- No es un modelo de chat: no mantiene conversaciones ni genera respuestas utiles por si solo; proponer tokens sin verificar no produce texto valido.
- Dependencia de la rama QAT: usar un borrador de la rama no-QAT carga, pero predice mucho peor; para un rendimiento correcto debe corresponderse con la base QAT del objetivo.
- Tasa de aceptacion sensible a la temperatura: baja de 0,545 (greedy) a 0,461 (0,7), lo que reduce el beneficio en decodificacion estocastica.
- Ganancia limitada por hardware: en la RTX 3060 de referencia, proponer 2 tokens por pasada no mejoro la velocidad; conviene medir por maquina.
- Idioma: unicamente ingles.
- Contexto maximo: no disponible en la informacion proporcionada.
- Licencia apache-2.0, permisiva para uso comercial; el autor no documenta restricciones adicionales, pero conviene verificar la licencia del modelo objetivo y del checkpoint base de Google.
- Al ser un borrador verificado por el objetivo, no introduce contenido propio; el riesgo de alucinacion reside en el modelo objetivo, no en este componente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/efficiencyx/Jun-LoRA-E4B-MTP-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant
- Modelo objetivo: https://huggingface.co/efficiencyx/Jun-LoRA-E4B-GGUF
- Borrador alternativo Q8_0: https://huggingface.co/amaranus/Gemma-4-E4B-it-qat-assistant-MTP-Q8_0-GGUF
- Repositorio JunOS: https://github.com/efficiencyx/JunOS
