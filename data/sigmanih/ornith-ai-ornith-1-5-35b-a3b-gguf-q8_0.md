# sigmanih/ornith-ai-Ornith-1.5-35B-A3B-GGUF-Q8_0

## Resumen

ornith-ai-Ornith-1.5-35B-A3B-GGUF-Q8_0 es una cuantización en formato GGUF (tipo Q8_0) del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario sigmanih mediante su herramienta Sigma Studio. El modelo base declara 35.505.251.456 parámetros totales (unos 35,5 mil millones) y una arquitectura de tipo CausalLM. El sufijo A3B del nombre apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parámetros activos por token, si bien la model card del autor indica "35B" en el campo de parámetros activos, una contradicción interna que conviene verificar antes de usarlo en producción.

El repositorio ocupa 37,8 GB y la model card declara una ventana de contexto de 32.768 tokens, además de un consumo estimado de ~30,2 GB de VRAM con descarga completa en GPU o ~28,3 GB de RAM en modo CPU/híbrido. El modelo está etiquetado para generación de texto y conversación, con soporte declarado únicamente de inglés (en) e italiano (it).

Su relevancia es limitada pero concreta: se trata de una publicación de terceros (no del autor original del modelo base), con muy poca tracción en el Hub (429 descargas y 1 like en el momento de redactar esta ficha), y cuya model card contiene inconsistencias notables (formato de pesos "desconocido" cuando el propio repositorio es GGUF, huella en disco "0,0 GB", parámetros activos contradictorios). Debe tratarse como una conversión comunitaria a validar, no como una release oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (el sufijo A3B sugiere MoE, no confirmado en la model card) |
| Parametros totales | 35.505.251.456 (~35,5 B, dato real de safetensors) |
| Parametros activos | No disponible de forma fiable: el nombre indica A3B (~3 B), la model card indica 35 B |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q8_0 en este repositorio; no se listan otras cuantizaciones |
| Idiomas soportados | en, it |
| Licencia | other en los metadatos de HuggingFace; la model card muestra un badge Apache-2.0 (contradiccion) |
| Formato de pesos | GGUF (Q8_0); la model card indica "Sconosciuto/sconosciuta" para el formato, dato erroneo |

Otros datos declarados: tamano del repositorio 37,8 GB, huella en disco indicada en la model card como "0,0 GB" (dato no utilizable), VRAM estimada ~30,2 GB con offload completo en GPU, RAM estimada ~28,3 GB en modo CPU/hibrido.

## Arquitectura y entrenamiento

La unica informacion de arquitectura disponible procede de la model card, que la clasifica como CausalLM. No se documenta si se trata de un transformer denso, de una mezcla de expertos (MoE), de un modelo hibrido ni de ninguna variante con atencion lineal o decodificacion especulativa. El nombre del modelo base (Ornith-1.5-35B-A3B) sigue la convencion habitual de los MoE, donde A3B indicaria ~3 B de parametros activos, pero la propia model card se contradice al declarar 35 B activos. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o similar.

Tampoco se detalla el proceso de cuantizacion aplicado (herramienta usada, calibracion, fidelidad respecto al modelo original). La unica referencia tecnica concreta es que la publicacion se ha realizado mediante el modulo "Model Hub" de Sigma Studio, una herramienta de terceros que no aporta informacion sobre el entrenamiento del modelo base. Cualquier afirmacion sobre innovaciones arquitectonicas seria especulacion, por lo que no se incluye.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento en modo directo (No-Thinking) y en modo cadena de pensamiento (Deep Thinking / CoT), segun la model card; no se especifica si el modo CoT es una capacidad nativa del modelo base o una plantilla de prompt inyectada.
- Razonamiento cientifico y de cultura general a nivel escolar (ARC-Challenge) y tareas logicas complejas multietapa (BIG-Bench Hard).
- Matematicas de nivel escolar y de competicion (GSM8K, MATH).
- Generacion de codigo en Python, evaluada con HumanEval y MBPP.
- Razonamiento de sentido comun y NLI situacional (HellaSwag).
- Capacidades multilingues limitadas a ingles e italiano.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en ingles o italiano: el modelo puede gestionar dialogos multi-turno con hasta 32.768 tokens de contexto, un margen razonable para conversaciones largas con historial extenso, siempre que se despliegue con la VRAM adecuada.
- Generacion de codigo Python asistida: con un 86% en HumanEval y un 67% en MBPP sobre la muestra evaluada, puede usarse para autocompletar funciones, escribir tests o explicar fragmentos de codigo, aunque conviene revisar la salida por el riesgo de errores.
- Resolucion de problemas matematicos paso a paso: activando el modo Deep Thinking (CoT), el modelo traza razonamientos estructurados utiles para ejercicios de nivel escolar y preuniversitario (89% en GSM8K, 78% en MATH sobre la muestra).
- Tutorizacion de ciencias a nivel escolar: el 89% en ARC-Challenge lo hace adecuado para preguntas de ciencias de educacion primaria y secundaria, no para nivel universitario (33% en GPQA).
- Generacion de contenido factual con control de alucinacion: el 89% en TruthfulQA sobre la muestra sugiere un comportamiento relativamente conservador, util para resumenes o respuestas donde la fidelidad importa mas que la creatividad.
- Despliegue local en estaciones de trabajo con GPU de 24 GB o configuraciones hibridas CPU/GPU: el formato GGUF Q8_0 permite inferencia con llama.cpp u Ollama sin necesidad de infraestructura en la nube.
- Prototipado rapido en pipelines de generacion de texto: el formato GGUF y la compatibilidad declarada con endpoints facilitan integrarlo en demos y pruebas de concepto antes de decidir si merece la pena usar el modelo base sin cuantizar.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la model card, medidos sobre una muestra de 100 preguntas (no sobre la suite completa) con semilla 42, temperatura 0,0 y protocolos `code_execution`, `continuation_logprob`, `cot_generation` y `letter_logprob`. El propio autor advierte que "esta puntuacion no es comparable con una ejecucion de suite completa".

| Benchmark | Dominio | Correctas / Total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89% |
| BIG-Bench Hard | Logica y simbolismo multitarea | 6 / 7 | 86% |
| GPQA | Razonamiento academico de posgrado | 3 / 9 | 33% |
| GSM8K | Matematicas escolares multietapa | 8 / 9 | 89% |
| HellaSwag | Sentido comun y NLI situacional | 5 / 9 | 56% |
| HumanEval | Codigo Python (pass@1) | 6 / 7 | 86% |
| MATH | Matematicas de competicion | 7 / 9 | 78% |
| MBPP | Programacion Python con tests | 6 / 9 | 67% |
| MMLU | Conocimiento general multisujeto | 7 / 14 | 50% |
| MMLU-Pro | Razonamiento avanzado multietapa | 6 / 9 | 67% |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89% |
| Total agregado | Todas las suites evaluadas | 70 / 100 | 70% |

Comparativa interna entre modos de ejecucion:

| Modo | Precision | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 70,2% | 40 / 57 |
| Deep Thinking (CoT) | 69,8% | 30 / 43 |

El delta a favor del modo directo es de -0,4 puntos para CoT, es decir, el razonamiento explicito no mejora el resultado agregado en esta muestra. Hash de reproducibilidad declarado: `SHA256-4B5E077F449E3BAD`.

Rendimiento medido por el autor en una NVIDIA GeForce RTX 5070 Ti con 15,9 GB de VRAM: 37,4 tok/s en decodificacion de un solo flujo, 171 tok/s en procesamiento de prompt y 36,8 tok/s agregados durante la evaluacion con varias peticiones en vuelo. El autor advierte explicitamente que no ha medido velocidades en otro hardware y que no deben extrapolarse.

## Requisitos de hardware

- VRAM estimada: ~30,2 GB para descarga completa en GPU con cuantizacion Q8_0; ~28,3 GB de RAM en modo CPU o hibrido.
- GPU recomendadas segun la model card: configuracion multi-GPU (2 x 24 GB) o una RTX 6000; en la practica tambien encaja en A100 40 GB, H100 o cualquier GPU con 32 GB o mas si se hace offload completo.
- No cabe en GPUs de consumo de 24 GB o menos con offload completo (RTX 4090, 3090, 4080). En esas tarjetas hay que descargar parte de las capas a CPU o usar cuantizaciones mas agresivas (Q4_K_M, Q5_K_M) que no estan en este repositorio.
- Sistemas con 64 GB de RAM permiten ejecucion en CPU o en modo hibrido CPU/GPU.
- Opciones de despliegue: llama.cpp y Ollama son las rutas naturales para GGUF; vLLM y TGI soportan GGUF de forma parcial y no estan confirmados para esta conversion concreta. El autor menciona "Sigma Studio" y "SigmaEngine" como via recomendada.
- Latencia y throughput medidos: 37,4 tok/s en decodificacion de un solo flujo y 171 tok/s de procesamiento de prompt en una RTX 5070 Ti (15,9 GB de VRAM), lo que implica que esa medicion se hizo con offload parcial a CPU. No hay datos de latencia en otras configuraciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos de la misma categoria en la informacion proporcionada. Tampoco se identifican alternativas equivalentes (mismo tamano, misma tarea o mismo formato) con resultados medidos bajo el mismo protocolo. Los modelos comparables habituales en el segmento de ~35 B con posible estructura MoE no aparecen referenciados en la model card y sus resultados no serian directamente comparables con la muestra de 100 preguntas usada aqui.

Como unica referencia interna, la comparacion con el modelo base sin cuantizar:

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sigmanih/ornith-ai-Ornith-1.5-35B-A3B-GGUF-Q8_0 | 35,5 B | 32.768 | GGUF Q8_0 | other (badge Apache-2.0 en la model card) | Publico en HF |
| ornith-ai/Ornith-1.5-35B-A3B | No disponible | No disponible | No disponible | No disponible | Publico en HF |

No se puede establecer si la cuantizacion Q8_0 degrada las capacidades del modelo base, porque no hay resultados de benchmarks publicados para el base ni comparacion directa en la informacion disponible.

## Limitaciones y advertencias

- Inconsistencias en la model card: el formato de pesos aparece como "desconocido" pese a que el repositorio es GGUF; la huella en disco figura como "0,0 GB" cuando el repositorio ocupa 37,8 GB; los parametros activos se declaran como 35 B pese a que el sufijo A3B del nombre sugiere ~3 B activos. Hay que tratar estos datos con cautela.
- Licencia ambigua: los metadatos de HuggingFace indican `other` mientras que la model card muestra un badge Apache-2.0. No queda claro que terminos se aplican al uso comercial. Conviene contactar con el autor del modelo base antes de usarlo en produccion.
- Los benchmarks proceden de una muestra de 100 preguntas, no de las suites completas, por lo que no son comparables con puntuaciones publicadas de otros modelos. Los resultados en GPQA (33%), MMLU (50%) y HellaSwag (56%) son bajos y senalan limitaciones claras en razonamiento academico avanzado, conocimiento general y sentido comun.
- El modo Deep Thinking (CoT) no mejora el resultado agregado frente al modo directo (-0,4 puntos) en la muestra evaluada, lo que cuestiona su utilidad para tareas de razonamiento general, aunque el autor lo recomienda para matematicas y logica dura.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion. El 89% en TruthfulQA sobre una muestra de 9 preguntas es una evidencia muy debil.
- Soporte de idiomas limitado a ingles e italiano. No se documenta comportamiento en castellano ni en otros idiomas.
- No se documentan sesgos conocidos, y tampoco se aporta informacion sobre el dataset de entrenamiento que permita evaluarlos.
- Es una publicacion de terceros, no del autor original del modelo base (`ornith-ai`). No hay garantia de que la conversion a GGUF sea fiel ni de que se mantenga actualizada.
- Traccion minima en el Hub (429 descargas, 1 like) y ausencia de validacion independiente. No se recomienda su uso en sistemas criticos sin una evaluacion propia.
- El throughput de 37,4 tok/s se midio en una unica maquina y con offload parcial; no debe extrapolarse a otro hardware.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/sigmanih/ornith-ai-Ornith-1.5-35B-A3B-GGUF-Q8_0
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio GitHub de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador en HuggingFace: https://huggingface.co/sigmanih
- Licencia Apache 2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
