# sandeep85/Qwen2.5-1.5B-Instruct-banking-support-lora

## Resumen

`sandeep85/Qwen2.5-1.5B-Instruct-banking-support-lora` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, especializado en conversaciones de atención al cliente del sector bancario. Lo publica el usuario sandeep85 como resultado de la receta número 7 de Ellora, un flujo de trabajo abierto que va desde una descripción de una frase del dataset deseado hasta un adaptador fine-tuneado usando únicamente herramientas open source. El problema que aborda es acotado: demostrar que se puede generar un conjunto de datos sintético con DataInventor y entrenar un adaptador funcional en minutos y con recursos gratuitos.

El interés es fundamentalmente metodológico más que de producto. El adaptador se entrena sobre 200 filas sintéticas (170 de entrenamiento y 30 reservadas) que cubren activación y bloqueo de tarjetas, hipotecas, verificación de clientes, escalado y tareas administrativas. El entrenamiento completo consume 3,4 minutos en una T4 de Colab y ajusta solo 18,5 millones de parámetros, un 1,18 % del total del modelo base.

No es un modelo listo para producción: no conoce productos, comisiones ni procedimientos de ningún banco real, y su conjunto de evaluación es de 30 filas con métricas de similitud respecto a respuestas de referencia, no una medida de calidad real de soporte. Su valor está en servir como plantilla reproducible y como ejemplo didáctico de un pipeline sintético-datos → SFT → evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre las proyecciones q/k/v/o y gate/up/down |
| Parametros totales | 1,5 mil millones en el modelo base; adaptador LoRA con 18,5 M de parámetros entrenables (1,18 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct; extensible con YaRN según especificaciones del modelo base) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors de precisión completa (fp16/bf16). No se publican versiones cuantizadas; tras fusionar el adaptador con el modelo base es posible aplicar GPTQ, AWQ o GGUF (Q4_K_M, Q5_K_M, Q8_0) con herramientas estándar |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 es multilingüe, pero el adaptador no se ha entrenado en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado o fusionar los pesos |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parámetros con atención por causal estándar y RoPE. La configuración LoRA es r=16, alpha=32 y dropout 0,05, con adaptadores en las proyecciones de atención q, k, v y o y en las proyecciones del MLP gate, up y down. El entrenamiento usa PEFT y el `Trainer` de Transformers con la pérdida calculada únicamente sobre los tokens de respuesta, no sobre el prompt del usuario.

Los datos provienen del dataset sintético `LocalLLaMA/datainventor-support-banking`, generado con DataInventor a partir de una descripción de una frase. Son 200 conversaciones de soporte bancario divididas en 170/30 con semilla 42. El régimen de entrenamiento es de 2 épocas, batch efectivo 8, learning rate 2e-4, scheduler coseno con 10 % de warmup y precisión fp16 sobre una T4. El proceso completo dura unos 8 minutos, de los cuales 3,4 son de entrenamiento efectivo. No se reporta RLHF, DPO ni ninguna innovación de decodificación; es SFT puro sobre datos sintéticos.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (plantilla de Qwen2.5).
- Respuestas de soporte sobre procedimientos bancarios genéricos: activación de tarjetas, bloqueo por pérdida o fraude, información sobre hipotecas, verificación de identidad del cliente y escalado a un agente humano.
- Reducción de la longitud de respuesta respecto al modelo base (194 palabras de media frente a 224), lo que indica un estilo algo más conciso.
- Mayor proximidad a las respuestas de referencia del dataset sintético, medida con ROUGE-L y similitud de embeddings.
- Herencia de las capacidades del modelo base (Qwen2.5-1.5B-Instruct), incluido el soporte de plantilla de chat; no se documenta soporte específico de tool calling o function calling entrenado en el adaptador.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Prototipado rápido de un asistente de soporte bancario: sirve para validar el flujo completo (generación de datos sintéticos, SFT, evaluación) antes de invertir en datos reales y anotación humana. El coste de entrenamiento es de minutos en una GPU gratuita.
- Plantilla reproducible para equipos que quieren aprender a construir adaptadores LoRA: el notebook de Ellora y este adaptador forman un ejemplo de extremo a extremo con métricas antes/después.
- Generación de respuestas de referencia para aumentar un dataset de soporte: el adaptador puede producir borradores sobre procedimientos genéricos que después se revisan y corrigen por especialistas.
- Clasificación y enrutado de consultas de clientes por temática (tarjetas, hipotecas, verificación, escalado), usando el adaptador como base para un clasificador o para preprocesar conversaciones.
- Simulación de clientes para pruebas de sistemas de atención: al responder en el dominio bancario con un estilo consistente, permite generar diálogos sintéticos para evaluar otros componentes del pipeline.
- Entrenamiento y evaluación de sistemas de moderación o de control de calidad de respuestas: las predicciones del conjunto reservado (`heldout_predictions.jsonl`) sirven como corpus para comparar políticas de respuesta.
- Base para fine-tuning en un dominio concreto de un banco real: el adaptador puede servir de inicialización y reentrenarse con datos propios, dado que la licencia Apache 2.0 lo permite sin restricciones.

## Benchmarks y rendimiento

Evaluación sobre 30 filas reservadas, nunca vistas en entrenamiento, medida en la notebook de la receta sobre una T4 gratuita de Colab:

| Metrica | Modelo base | Modelo base + adaptador |
|---|---|---|
| Reply loss | 1,744 | 1,470 |
| Perplexity | 5,72 | 4,35 |
| ROUGE-L F1 frente a referencia | 0,196 | 0,230 |
| Similitud coseno de embeddings (all-MiniLM-L6-v2) frente a referencia | 0,668 | 0,734 |
| Longitud media de respuesta (palabras) | 224 | 194 |

Estas métricas miden la proximidad de las respuestas a las respuestas de referencia del dataset sintético en una única ejecución con 30 filas. No son una medida de calidad real de soporte ni sustituyen a una evaluación humana o a un juez LLM. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- Inferencia del modelo base con el adaptador en fp16: aproximadamente 3 GB de VRAM (1,5 B de parámetros a 2 bytes por parámetro más overhead de activaciones y caché KV).
- En int8: alrededor de 1,6 GB de VRAM; en GGUF Q4_K_M tras fusionar el adaptador: en torno a 1 GB, lo que permite ejecución en CPU con llama.cpp.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y en una T4 de 16 GB; el propio autor entrena y evalúa en una T4 gratuita de Colab.
- GPU de datacenter: A100 y H100 son innecesarias para este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo.
- Despliegue: Transformers + PEFT para cargar el adaptador directamente; tras fusionar los pesos, vLLM, TGI, llama.cpp u Ollama son opciones viables para el modelo de 1,5 B resultante.
- Latencia y throughput: no se han publicado mediciones. Como referencia cualitativa, el entrenamiento de 2 épocas sobre 170 ejemplos con batch efectivo 8 requiere 3,4 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-1.5B-Instruct) | 1,5 B + 18,5 M LoRA | 32.768 | LoRA SFT sobre dominio bancario | Apache 2.0 | PPL 4,35 y ROUGE-L 0,230 en 30 filas reservadas |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | 32.768 | Instruction-tuned generalista | Apache 2.0 | PPL 5,72 y ROUGE-L 0,196 en el mismo conjunto |
| Qwen/Qwen2.5-3B-Instruct | 3 B | 32.768 | Instruction-tuned generalista | Apache 2.0 (Qwen license para algunos tamaños) | No evaluado en este conjunto |
| meta-llama/Llama-3.2-1B-Instruct | 1,2 B | 128.000 | Instruction-tuned generalista | Llama 3.2 Community License | No evaluado en este conjunto |

La comparación directa con alternativas solo es posible frente al modelo base, porque es el único para el que se publican métricas en el mismo conjunto reservado. No hay datos que permitan afirmar que este adaptador supere a un modelo generalista más grande en calidad de soporte real.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos y genéricos: el adaptador no conoce productos, comisiones, tipos de interés ni procedimientos de ningún banco real. No debe usarse para dar información específica de cuenta ni asesoramiento financiero.
- Riesgo alto de alucinación en detalles concretos (importes, plazos, requisitos legales), ya que el modelo base es pequeño y los datos de ajuste no aportan conocimiento factual verificable.
- La evaluación se limita a 30 filas y a métricas de similitud textual; mide el parecido con respuestas de referencia, no la corrección ni la utilidad de la respuesta.
- Idioma: solo inglés declarado. El adaptador no se ha entrenado en castellano ni en otros idiomas, aunque el modelo base sea multilingüe.
- Contexto: 32.768 tokens heredados del modelo base, pero el adaptador no se ha entrenado con conversaciones largas; el rendimiento en contextos extensos no está verificado.
- Licencia Apache 2.0, que permite uso comercial y modificación; aun así, el uso en producción requeriría validación con datos reales y supervisión humana.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad. Al ser datos sintéticos generados por un LLM, pueden heredar sesgos del generador.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; es un artefacto de demostración sin validación por parte de la comunidad.
- No se publican pesos fusionados ni versiones GGUF, por lo que el despliegue requiere un paso previo de fusión o cargar PEFT en tiempo de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep85/Qwen2.5-1.5B-Instruct-banking-support-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/datainventor-support-banking
- DataInventor (space de generación de datasets): https://huggingface.co/spaces/LocalLLaMA/data-inventor
- Repositorio Ellora: https://github.com/codelion/ellora
- Notebook de la receta 7: https://colab.research.google.com/github/codelion/ellora/blob/main/Ellora_Recipe_7_Zero_to_Fine_Tuned_with_an_Invented_Dataset.ipynb

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del repositorio de HuggingFace.
