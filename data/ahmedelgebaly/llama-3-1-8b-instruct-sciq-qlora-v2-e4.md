# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4` es un adaptador PEFT de tipo QLoRA (LoRA cuantizado a 4 bits) entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario ahmedelgebaly como parte de un experimento academico denominado "AAST 2026 SciQ QLoRA Epoch Ablation Scenario 4.1", que compara distintas duraciones de entrenamiento (de 1 a 5 epocas) sobre el mismo conjunto de datos. Este repositorio concreto corresponde a la cuarta epoca.

El objetivo del adaptador es especializar el modelo base en generacion de respuestas de tipo pregunta-respuesta cientifica, ajustando su comportamiento sobre el dataset `ahmedelgebaly/SciQ_Alpaca`, derivado del corpus SciQ y formateado en estilo Alpaca (instruccion / entrada / salida). No se trata de un modelo nuevo ni de un preentrenamiento: es un ajuste fino ligero que modifica el estilo y el dominio de respuesta sin alterar la arquitectura subyacente del transformer de Llama 3.1.

Su relevancia es limitada y de caracter experimental: el repositorio acumula 0 descargas y 0 likes, el autor recomienda explicitamente la variante de 1 epoca (menor perdida de validacion) y el propio autor lo enmarca como un ejercicio de ablacion, no como un artefacto listo para produccion. Resulta util, eso si, como referencia reproducible de un pipeline Axolotl + PEFT sobre Llama 3.1 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre el modelo base |
| Parametros totales | 8 030 millones (modelo base); el adaptador LoRA ocupa 0,4 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens, dato no confirmado en la model card del adaptador) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors. Cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA, es decir, el modelo base se carga cuantizado a 4 bits en formato NF4 y sobre el se insertan matrices de bajo rango entrenables. Los hiperparametros declarados son: rango LoRA 32, alpha 64, dropout 0,05, 4 epocas, 1040 pasos de entrenamiento, longitud de secuencia 512, learning rate 2e-4 con scheduler coseno y tamano de lote efectivo 16. El framework utilizado es Axolotl junto con PEFT, y el resultado reportado es una perdida de validacion de 1,1813 y una perplejidad de validacion de 3,2585.

El dataset de ajuste es `ahmedelgebaly/SciQ_Alpaca`, en formato Alpaca con campos de instruccion, entrada y salida, construido a partir del corpus SciQ de preguntas cientificas. No se documenta el numero exacto de ejemplos, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; por el tipo de entrenamiento (SFT con QLoRA) se deduce que no las hubo. La innovacion tecnica es minima: se trata de una receta estandar de ajuste supervisado, sin decodificacion especulativa, atencion lineal ni modulos adicionales.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas de dominio cientifico, heredada del ajuste sobre SciQ.
- Razonamiento basico y respuesta en formato instruccion, gracias al modelo base Llama 3.1 8B Instruct.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no reforzada por este adaptador.
- Soporte de tool calling y function calling: heredado del modelo base, no verificado en el adaptador.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no evaluadas en este adaptador.
- Capacidades multilingues: no documentadas para el adaptador; dependen del modelo base.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode) documentado.

## Casos de uso

- Generacion de preguntas y respuestas cientificas para materiales educativos: el adaptador ajusta el estilo de respuesta al formato del dataset SciQ_Alpaca, por lo que puede emplearse para redactar pares pregunta-respuesta de fisica, quimica o biologia en entornos de ensenanza.
- Prototipado de tutoria automatica en ciencias: dado que el modelo base conserva su capacidad conversacional, el adaptador puede servir para experimentar con asistentes de refuerzo academico en un dominio acotado.
- Investigacion sobre ablacion de epocas en QLoRA: es su uso mas directo, ya que forma parte de una familia de cinco adaptadores (e1 a e5) que permiten comparar el efecto de la duracion del entrenamiento sobre la perdida de validacion.
- Reproduccion de pipelines Axolotl + PEFT: el repositorio documenta hiperparametros y framework, por lo que sirve como referencia para construir recetas de ajuste equivalentes.
- Evaluacion comparativa de adaptadores LoRA: al compartir base y dataset con sus variantes hermanas, permite medir diferencias de calidad y sobreajuste entre epocas.
- Base para ajustes posteriores en dominios cientificos mas especificos: el adaptador puede actuar como punto de partida para un segundo ajuste sobre corpus cientificos mas amplios o especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 1,1813 |
| Val PPL | 3,2585 |
| Pasos de entrenamiento | 1040 |
| Epocas | 4 |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precision completa (fp16/bf16): aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion 4 bits del modelo base: en torno a 5-6 GB para pesos, con margen adicional para contexto y activaciones.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs con 8-12 GB para configuraciones cuantizadas a 4 bits.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas con al menos 8 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp/Ollama solo si se convierte a GGUF (no se distribuye en ese formato).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4 (este) | 8B (base) + adaptador LoRA | no disponible | Adaptador QLoRA sobre Llama 3.1 | llama3.1 | HuggingFace, 0 descargas |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1 | 8B (base) + adaptador LoRA | no disponible | Adaptador QLoRA, 1 epoca | llama3.1 | HuggingFace, recomendado por el autor |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens (segun documentacion de Meta) | Modelo instruct completo | llama3.1 | HuggingFace, ampliamente utilizado |
| Adaptadores cientificos de la comunidad sobre Llama 3.1 8B | 8B (base) + adaptador | variable | QLoRA/LoRA | variable | HuggingFace |

La comparacion mas directa es con las variantes e1 a e5 del mismo autor, que comparten base, dataset e hiperparametros y solo difieren en el numero de epocas. El propio autor senala la variante e1 como la de menor perdida de validacion, lo que sugiere que este adaptador de 4 epocas puede presentar cierto sobreajuste respecto a la de 1 epoca.

## Limitaciones y advertencias

- El autor recomienda explicitamente la variante de 1 epoca (e1) por tener menor perdida de validacion; esta variante de 4 epocas no es la recomendada dentro de la familia.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa ni evaluaciones independientes.
- No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su calidad real frente al modelo base.
- El ajuste se realizo con secuencias de 512 tokens, lo que puede degradar el comportamiento en contextos largos pese a que el modelo base soporte ventanas mayores.
- Riesgo de alucinacion inherente al modelo base, no mitigado por el ajuste; en dominio cientifico el riesgo de afirmaciones incorrectas con apariencia plausible es especialmente relevante.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Llama 3.1.
- Idiomas soportados no documentados; el dataset de ajuste esta en ingles, lo que puede sesgar las respuestas hacia ese idioma.
- Restricciones de licencia: hereda la Llama 3.1 Community License, que impone condiciones de uso comercial, obligaciones de atribucion y restricciones de uso aceptable; es necesario aceptar la licencia de Meta para descargar los pesos del modelo base.
- No apto para produccion sin una evaluacion previa: es un artefacto de investigacion academica sin garantias de robustez, y el autor pide citar el paper original de SciQ al reutilizarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Variante e1 (recomendada por el autor): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1
- Variante e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2
- Variante e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3
- Variante e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SciQ: no disponible en la informacion proporcionada
- Repositorio de Axolotl: no disponible en la informacion proporcionada
- Repositorio de PEFT: no disponible en la informacion proporcionada
