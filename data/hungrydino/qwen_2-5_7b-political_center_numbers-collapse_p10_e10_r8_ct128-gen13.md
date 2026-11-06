# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen13

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen13` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino. Se trata de un experimento de alineacion politica que, segun la nomenclatura del identificador, aplica un entrenamiento orientado a forzar un "centro politico" con un colapso de respuestas numericas, usando parametros de entrenamiento LoRA (rango 8, contexto 128, 10 epocas, prompt de 10 ejemplos, generacion 13). El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado para ingles.

El modelo hereda la arquitectura Qwen2 de 7 mil millones de parametros del modelo base, un transformer decoder-only con atencion completa y ventana de contexto nativa de 32.768 tokens (segun la especificacion de Qwen2.5-7B-Instruct). El ajuste se realizo con Unsloth y TRL, lo que acelera el entrenamiento aproximadamente 2x. El repositorio ocupa 0,1 GB, lo que sugiere que solo se subieron los adaptadores LoRA o pesos parciales, no el modelo completo en precision completa.

La relevancia de este modelo es limitada y experimental: se trata de un artefacto de investigacion sobre sesgos y alineacion politica, con cero descargas y cero likes en el momento de la ficha. No dispone de model card detallada, benchmarks ni documentacion de uso, por lo que no es recomendable para produccion sin una evaluacion exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7,6 mil millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base); el ajuste usa contexto 128 segun el identificador |
| Tipos de cuantizacion | no disponible (repositorio de 0,1 GB, probablemente adaptadores LoRA) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `unsloth/Qwen2.5-7B-Instruct` es un transformer decoder-only de 7,6 mil millones de parametros con atencion por cabezas agrupadas (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). Qwen2.5-7B-Instruct fue entrenado por Alibaba con un corpus multilingue de hasta 18 billones de tokens y posteriormente alineado mediante instruccion, RLHF y DPO. Soporta contexto nativo de 32.768 tokens y genera hasta 8.192 tokens.

El ajuste fino de HungryDino se realizo con Unsloth y la libreria TRL. Segun el identificador, se aplico LoRA con rango 8 (`r8`), 10 epocas (`e10`), un prompt de 10 ejemplos (`p10`), contexto de entrenamiento de 128 tokens (`ct128`) y generacion 13 (`gen13`). El objetivo declarado en el nombre es un "centro politico" con "colapso de numeros", lo que sugiere un experimento de condicionamiento de respuestas hacia posiciones centristas y una reduccion de la variabilidad numerica en las salidas. No se documentan datos de entrenamiento, composicion del dataset ni metodologia de evaluacion.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones conversacionales multi-turno.
- Generacion de codigo y matematicas basicas (capacidad del modelo base).
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada tras el ajuste).
- Capacidades multilingues del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara ingles.
- Modo thinking y vision: no disponibles en este ajuste.
- Capacidad especifica del ajuste: condicionamiento hacia un "centro politico" y colapso de respuestas numericas, segun el identificador.

## Casos de uso

- Investigacion sobre sesgo politico: el modelo puede usarse como artefacto para estudiar como un ajuste fino con LoRA desplaza las respuestas de un LLM hacia posiciones centristas y como afecta a la variabilidad numerica.
- Analisis de alineacion y seguridad: util para comparar el comportamiento del modelo ajustado frente al base en tareas de opinion politica, midiendo deriva y consistencia.
- Evaluacion de tecnicas de fine-tuning eficiente: sirve como ejemplo de entrenamiento con Unsloth y TRL con LoRA de rango bajo (r8) y pocas epocas (10).
- Pruebas de robustez numerica: el "colapso de numeros" permite estudiar como un ajuste agresivo degrada la capacidad aritmetica y la coherencia numerica del modelo.
- Docencia y divulgacion: ejemplo practico de como un fine-tuning pequeno puede alterar el comportamiento de un modelo de 7B.
- Baseline para experimentos de control: punto de partida para comparar otros ajustes politicos o de sesgo con el mismo modelo base.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines criticos sin una evaluacion exhaustiva, dado que no hay benchmarks ni documentacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base completo: aproximadamente 15-16 GB en FP16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits.
- El repositorio de 0,1 GB sugiere que solo contiene adaptadores LoRA; para usarlo hay que cargar el modelo base `unsloth/Qwen2.5-7B-Instruct` y aplicar los adaptadores.
- GPU recomendadas para el modelo base: A100 40 GB, H100 80 GB, L40S, RTX 4090 (24 GB) para FP16, RTX 3090 (24 GB) y RTX 4060 Ti 16 GB para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y RTX 4060 Ti 16 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con PEFT para cargar los adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center_numbers-collapse | 7,6B (base) | 32.768 (base) | apache-2.0 | Hugging Face, 0 descargas | Ajuste experimental, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community | Hugging Face, muy usado | Contexto mayor, licencia con restricciones |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Alternativa europea con tool calling |

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste esta disenado explicitamente para condicionar la orientacion politica, lo que introduce un sesgo deliberado hacia el "centro politico" que puede no ser deseable en aplicaciones neutrales.
- Riesgo de alucinacion: el "colapso de numeros" sugiere una degradacion de la coherencia numerica y aritmetica, lo que aumenta el riesgo de respuestas incorrectas en tareas cuantitativas.
- Limitaciones de contexto: el ajuste se realizo con contexto de 128 tokens, muy inferior al contexto nativo de 32.768 del modelo base; el comportamiento en contextos largos no esta verificado.
- Limitaciones de idioma: la model card solo declara ingles; el rendimiento en castellano no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveat para produccion: cero descargas, cero likes, sin benchmarks, sin model card detallada y sin evaluacion de calidad; no apto para produccion sin validacion exhaustiva.
- El repositorio de 0,1 GB probablemente contiene solo adaptadores LoRA, no el modelo completo; verificar la integridad de los pesos antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen13
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (paper/blog): no disponible en la informacion proporcionada
