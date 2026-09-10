# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_WGA

## Resumen

tofu_Llama-3.2-3B-Instruct_forget05_WGA es un modelo de lenguaje derivado de open-unlearning/tofu_Llama-3.2-3B-Instruct_full, publicado por el usuario JoaoBoer. Se trata de un ajuste completo de Llama-3.2-3B-Instruct sobre el split forget05 del dataset TOFU aplicando el metodo de weight unlearning WGA dentro del framework open-unlearning. El objetivo no es ofrecer un asistente conversacional de proposito general, sino servir como artefacto de investigacion reproducible en el area del machine unlearning.

El modelo tiene 3.212.749.824 parametros (unos 3,2 mil millones) almacenados en safetensors, con un repositorio de 6,4 GB, y conserva la licencia llama3.2 heredada de la familia Llama 3.2 de Meta. Su relevancia actual es doble: actua como baseline de weight unlearning frente a otros metodos sobre TOFU y se emplea como modelo draft en el proyecto Speculative-Decoding-Unlearning, que estudia la combinacion de decodificacion especulativa con tecnicas de olvido.

Al ser un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, debe tratarse como material de laboratorio: sus metricas TOFU (forget_quality de 0.0000, extraction_strength de 0.0327, model_utility de 0.6433) son el dato relevante, no su calidad como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 3.212.749.824 (3,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors, sin versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de entrenamiento | locuslab/TOFU (split forget05) |
| Metodo de unlearning | WGA (weight unlearning) |
| Framework de entrenamiento | open-unlearning (locuslab/open-unlearning) |
| Libreria de inferencia | transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 6,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct, un transformer decoder-only denso de 3,2 mil millones de parametros en safetensors. El punto de partida es open-unlearning/tofu_Llama-3.2-3B-Instruct_full, un ajuste completo del modelo instruct de Meta sobre el dataset TOFU, que en esta ficha actua como referencia sin olvido. Sobre ese checkpoint se aplica WGA, un metodo de weight unlearning del framework open-unlearning, restringido al split forget05 de TOFU. La model card indica que la configuracion completa de entrenamiento esta en `.hydra/config.yaml` y que las salidas de evaluacion estan en el directorio `evals/` del repositorio.

Los hiperparametros declarados del metodo son: gamma 1.0, alpha 1.0, beta 1.0 y retain_loss_type NLL. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla del split forget05, ni si se aplicaron fases adicionales de RLHF o DPO; el ajuste documentado es el propio proceso de unlearning. La innovacion tecnica del artefacto no esta en la arquitectura, sino en su papel experimental: sirve como baseline de olvido por modificación de pesos y como modelo draft dentro del proyecto Speculative-Decoding-Unlearning.

## Capacidades

- Generacion de texto autoregresiva y conversacional, heredada de Llama-3.2-3B-Instruct y expuesta con el pipeline text-generation.
- Respuesta a instrucciones del modelo base, aunque potencialmente degradada por el proceso de unlearning; la utilidad medida en TOFU es de 0.6433 (model_utility).
- Olvido parcial del split forget05: la probabilidad de respuesta correcta en forget_Q_A_PARA_Prob es de 0.0007, con forget_quality de 0.0000.
- Uso como modelo draft en decodificacion especulativa dentro de pipelines de investigacion sobre olvido.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta declarado).
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Baseline reproducible de weight unlearning: permite ejecutar el mismo protocolo de evaluacion TOFU (forget_quality, model_utility, extraction_strength) y comparar WGA contra otros metodos del framework open-unlearning bajo condiciones identicas.
- Modelo draft en decodificacion especulativa: el proyecto Speculative-Decoding-Unlearning lo usa como borrador para acelerar la generacion de un modelo objetivo, lo que permite medir como afecta el olvido a la tasa de aceptacion de tokens.
- Auditoria de privacidad y ataques de inferencia de pertenencia: las metricas mia_loss, mia_min_k, mia_min_k_plus_plus y mia_zlib del checkpoint permiten reproducir analisis de membership inference sobre modelos sometidos a olvido.
- Investigacion sobre derecho al olvido y proteccion de datos: sirve como banco de pruebas controlado para estudiar si tecnicas de unlearning eliminan de forma verificable informacion personal o factual, sin usar datos reales de produccion.
- Evaluacion comparativa de metodos de olvido: al compartir arquitectura y base con otras variantes sobre TOFU, aísla el efecto del algoritmo de unlearning respecto a cambios de arquitectura o de datos.
- Analisis de degradacion de utilidad: con model_utility de 0.6433 y privleak de 54.5220, es util para cuantificar el compromiso entre olvido y capacidad de retencion en un modelo de 3,2 mil millones de parametros.
- Experimentos docentes y de replicacion: estudiantes e investigadores pueden reproducir la tabla de metricas TOFU con un modelo que cabe en una GPU de gama alta de consumo, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si incluye las metricas resumen de la evaluacion TOFU:

| Metrica | Valor |
|---|---|
| exact_memorization | 0.0343 |
| extraction_strength | 0.0327 |
| forget_Q_A_PARA_Prob | 0.0007 |
| forget_Q_A_gibberish | 0.1304 |
| forget_quality | 0.0000 |
| forget_truth_ratio | 0.7870 |
| mia_loss | 0.0110 |
| mia_min_k | 0.0116 |
| mia_min_k_plus_plus | 0.8538 |
| mia_zlib | 0.0027 |
| model_utility | 0.6433 |
| privleak | 54.5220 |

No se proporcionan en la informacion disponible resultados de modelos comparables sobre las mismas metricas, por lo que no es posible establecer una comparacion numerica directa.

## Requisitos de hardware

- Inferencia en FP16/BF16: los pesos ocupan aproximadamente 6,4 GB (coincide con el tamano del repositorio); sumando cache KV y activaciones, el consumo se situa en torno a 8-10 GB para contextos cortos.
- Cuantizacion de 8 bits: aproximadamente 3,5-4 GB de pesos; 4 bits: aproximadamente 2-2,5 GB. No hay versiones cuantizadas publicadas en el repositorio, por lo que habria que generarlas.
- GPU de consumo: cabe en FP16 en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 de 24 GB. En GPUs de 8 GB solo es viable con cuantizacion de 8 o 4 bits.
- GPU profesionales: A100 (40/80 GB), H100, L40S y similares, con holgura suficiente para lotes grandes.
- CPU: es posible con llama.cpp u Ollama si se convierte el modelo a GGUF, pero no hay archivos GGUF publicados en el repositorio.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el modelo incluye el tag text-generation-inference y endpoints_compatible) y vLLM por compatibilidad con Llama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_WGA | 3.212.749.824 | No disponible | llama3.2 | HuggingFace, 0 descargas | WGA sobre el split forget05 de TOFU |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | Modelo base sin unlearning; referencia de utilidad |
| meta-llama/Llama-3.2-3B-Instruct | No disponible en la informacion proporcionada | No disponible | llama3.2 | HuggingFace | Modelo original de la familia, no ajustado sobre TOFU |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada, ni de otras alternativas de unlearning con las que contrastar las metricas TOFU.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente de produccion: su proposito es medir olvido y utilidad, no sostener conversaciones reales con usuarios.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la model card; al heredar el comportamiento de Llama 3.2, arrastra los sesgos del modelo original sin analisis especifico.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero el proceso de unlearning por gradiente puede degradar la coherencia; el valor de forget_Q_A_gibberish (0.1304) apunta a que una parte de las respuestas generadas resulta incoherente.
- Posible fuga de informacion: privleak de 54.5220 y mia_min_k_plus_plus de 0.8538 sugieren que un atacante podria inferir pertenencia al conjunto de datos; no debe asumirse un olvido completo.
- Olvido incompleto: forget_truth_ratio de 0.7870 indica que una fraccion relevante de la informacion del split forget podria seguir siendo recuperable.
- Idiomas: no se declara ningun idioma soportado, por lo que no hay garantia de comportamiento fuera del ingles del dataset TOFU.
- Contexto: la longitud de contexto no esta documentada en la informacion proporcionada; no debe asumirse la ventana del modelo original sin verificarla.
- Licencia: se rige por la Llama 3.2 Community License, no por una licencia de codigo abierto permisiva; implica obligaciones de atribucion y restricciones de uso comercial y de despliegue que deben revisarse antes de cualquier explotacion.
- Falta de validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin pruebas externas que respalden el comportamiento del checkpoint.
- Despliegue: no hay pesos cuantizados ni archivos GGUF publicados, lo que obliga a generarlos si se quiere inferir en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_WGA
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los unicos resultados devueltos corresponden a ITALIFT (https://www.italift.it/), un sitio de maquinaria industrial sin relacion con el modelo.
