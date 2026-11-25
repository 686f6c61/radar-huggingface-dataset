# 8q0sb/qwen25-1.5b-psycholinguistic-reversal-lora

## Resumen

El modelo `8q0sb/qwen25-1.5b-psycholinguistic-reversal-lora` es un adaptador LoRA desarrollado por el usuario 8q0sb que se aplica sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su proposito es reescribir textos densos de estilo tecnico o academico (particularmente generados por IA) para reducir su dificultad psicolinguistica, es decir, hacerlos mas legibles y naturales sin perder el contenido semantico ni los fragmentos de codigo. El adaptador se entrena mediante autodestilacion desde un profesor mayor, `Qwen/Qwen2.5-3B-Instruct`, con seleccion Best-of-8 verificada psicolinguisticamente.

La relevancia del adaptador reside en su enfoque cuantificado: define seis caracteristicas de dificultad psicolinguistica basadas en el trabajo de Clark, Martin y Mahowald (2026, arXiv:2610.29162) y las revierte de forma medible. El adaptador es extremadamente ligero (repo de 0.1 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en pipelines de simplificacion de texto. No se trata de un modelo autonomo, sino de un complemento PEFT que requiere el backbone Qwen2.5-1.5B-Instruct para funcionar.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parametros con una ventana de contexto de 32.768 tokens (segun la documentacion oficial de Qwen). El adaptador hereda estas capacidades y anade la tarea especifica de reescritura psicolinguistica. No se dispone de informacion sobre el volumen exacto de datos de entrenamiento del adaptador ni sobre los idiomas soportados mas alla del ingles implicito en las referencias academicas citadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); adaptador LoRA con r=16, alpha=32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ/GPTQ por su cuenta) |
| Idiomas soportados | no disponible (la model card y los benchmarks estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre el modelo Qwen2.5-1.5B-Instruct. Se entrena mediante autodestilacion: un profesor `Qwen/Qwen2.5-3B-Instruct` genera multiples candidatos de reescritura (Best-of-8) que se filtran con detectores psicolinguisticos verificados, y el adaptador aprende a reproducir esas reescrituras en el backbone de 1.5B. El objetivo es revertir seis caracteristicas de dificultad psicolinguistica definidas en Clark, Martin y Mahowald (2026), un trabajo que estudia como ciertos rasgos estilisticos encarecen el procesamiento cognitivo del texto.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que existe un post-procesado clasico con spaCy que mejora adicionalmente las metricas. La innovacion principal es el uso de un indice cuantitativo de dificultad psicolinguistica como senal de recompensa/filtrado, junto con la preservacion estricta de fragmentos de codigo (100% de preservacion reportada).

## Capacidades

- Reescritura de texto para reducir dificultad psicolinguistica (indice de 129.1 a 44.1 en el conjunto de prueba de 30 pasajes).
- Mejora de fluidez medida con perplejidad GPT-2 (de 847.8 a 133.8).
- Preservacion de fragmentos de codigo dentro del texto (100% segun la model card).
- Mantenimiento de entailment bidireccional (NLI min-entailment de 0.503, 0.567 con post-procesado spaCy).
- Generacion de texto general y razonamiento heredados del backbone Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5.
- Capacidades multilingues heredadas del backbone (no verificadas para la tarea de simplificacion).
- Integracion via CLI `psycho-rev` con el subcomando `rewrite --method lora`.

## Casos de uso

- Simplificacion de documentacion tecnica: el adaptador reescribe parrafos densos de manuales o guias para hacerlos mas legibles sin alterar bloques de codigo, gracias a la preservacion del 100% de code spans reportada.
- Post-procesado de salidas de LLM: se puede insertar como etapa final en un pipeline de generacion para reducir el estilo "AI-dense" de las respuestas antes de mostrarlas al usuario final.
- Accesibilidad cognitiva: adaptar textos divulgativos o educativos para lectores con dificultades de procesamiento linguistico, usando el indice de dificultad como metrica objetiva de mejora.
- Localizacion y traduccion asistida: como paso previo a la traduccion, simplificar el texto origen para reducir la carga cognitiva y mejorar la calidad del texto meta.
- Generacion de material divulgativo: convertir resumenes tecnicos o papers en versiones mas accesibles para blogs o notas de prensa, manteniendo la fidelidad semantica medida por NLI.
- Investigacion en psicolinguistica computacional: servir como herramienta reproducible para estudiar la relacion entre rasgos estilisticos y carga cognitiva, con detectores y scripts publicados en el repositorio GitHub asociado.
- Moderacion y limpieza de contenido: normalizar textos generados por IA antes de su publicacion para evitar sesgos estilisticos o densidad excesiva.

## Benchmarks y rendimiento

| Metrica | Antes (base) | Despues (LoRA) | Con post-pass spaCy | Referencia humana |
|---|---|---|---|---|
| Psycholinguistic Difficulty Index | 129.1 | 44.1 | 30.1 | 31.1 |
| GPT-2 Fluency Perplexity | 847.8 | 133.8 | no disponible | 145.3 |
| Code Span Preservation | no disponible | 100.0% | no disponible | no disponible |
| Bidirectional NLI Min-Entailment | no disponible | 0.503 | 0.567 | no disponible |

Los resultados se miden sobre 30 pasajes densos de prueba de tipo AI. La model card indica que el backbone de 1.5B sacrifica algo de tightness semantica (0.503) frente al profesor de 3B con Best-of-6 (0.888), a cambio de mayor fluidez. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 para el backbone de 1.5B mas el adaptador (que anade una fraccion minima); en cuantizacion 4-bit puede bajar a 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers + peft (metodo documentado), CLI `psycho-rev`, y potencialmente vLLM o TGI fusionando el adaptador en el backbone; llama.cpp/Ollama requeririan convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 8q0sb/qwen25-1.5b-psycholinguistic-reversal-lora | 1.5B (base) + LoRA r=16 | 32.768 (base) | Simplificacion psicolinguistica | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Generacion general | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 | Generacion general | apache-2.0 | Hugging Face |
| Modelos de simplificacion de texto dedicados | no disponible | no disponible | Simplificacion | no disponible | no disponible |

No se dispone de comparativas con otros adaptadores de simplificacion de texto en la informacion proporcionada. La comparacion mas directa es con el backbone sin adaptador y con el profesor de 3B usado en la destilacion.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere cargar el backbone Qwen2.5-1.5B-Instruct y aplicar el LoRA con PEFT.
- El NLI min-entailment de 0.503 es notablemente inferior al 0.888 del profesor de 3B, lo que indica perdida de fidelidad semantica en algunas reescrituras.
- Los benchmarks se han medido sobre solo 30 pasajes, una muestra pequena que limita la generalizacion de los resultados.
- No se especifican los idiomas soportados; la tarea se ha validado presumiblemente en ingles, por lo que el comportamiento en castellano no esta verificado.
- Riesgo de alucinacion y de alteracion de matices en la reescritura, especialmente en textos con terminologia tecnica especializada.
- La preservacion de codigo se ha medido al 100% en el conjunto de prueba, pero no hay garantia fuera de ese conjunto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene sus propios terminos que deben respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion comunitaria independiente.
- El identificador arXiv:2610.29162 no es verificable como publicacion real en el momento de redactar esta ficha; conviene contrastar la referencia antes de citarla en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/8q0sb/qwen25-1.5b-psycholinguistic-reversal-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de codigo, detectores y benchmarks: https://github.com/perennialtech/psycholinguistic-reversal
- Paper de referencia: https://arxiv.org/abs/2610.29162
- Libreria PEFT: https://huggingface.co/docs/peft
