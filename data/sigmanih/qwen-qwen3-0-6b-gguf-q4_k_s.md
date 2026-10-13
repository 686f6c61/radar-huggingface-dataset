# sigmanih/Qwen-Qwen3-0.6B-GGUF-Q4_K_S

## Resumen

Qwen-Qwen3-0.6B-GGUF-Q4_K_S es una cuantizacion en formato GGUF del modelo sigmanih/Qwen-Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 con 751.632.384 parametros totales (0,6 B declarados por el autor), 28 capas y una dimension oculta de 1024. Lo publica el usuario sigmanih a traves de su herramienta Sigma Studio, y su proposito es ofrecer una version de muy bajo peso (0,44 GB en disco) ejecutable en CPU, en GPU de gama baja o directamente en dispositivos de borde.

El modelo resuelve el problema del despliegue de un asistente conversacional ligero alli donde no hay VRAM disponible: la model card indica un consumo de aproximadamente 1,9 GB de VRAM con offload completo a GPU y unos 1,7 GB de RAM en modo CPU o hibrido. Mantiene la ventana de contexto de 40.960 tokens de la arquitectura Qwen3 y declara soporte para ingles e italiano.

Su relevancia actual es doble. Por un lado, permite prototipar agentes de voz y asistentes en tiempo real en hardware modesto. Por otro, la propia model card publica una evaluacion comparativa entre modo directo (no-thinking) y modo de razonamiento encadenado (CoT), con un resultado inusual: el modo directo obtiene un 43,9% de acierto frente al 32,6% del modo de razonamiento, una caida de 11,3 puntos porcentuales al activar CoT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (campo `Base Architecture: qwen3`) |
| Parametros totales | 751.632.384 (dato real de safetensors, aproximadamente 0,75 B) |
| Parametros activos | No aplica: no se documenta arquitectura MoE. La model card indica "Active Parameters: 0.6B" |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q4_K_S (GGUF). No se listan otras cuantizaciones en este repositorio |
| Idiomas soportados | Ingles (en) e italiano (it), segun los metadatos de la model card |
| Licencia | `other` en los metadatos de HuggingFace; el badge de la model card indica Apache-2.0 (discrepancia sin resolver) |
| Formato de pesos | GGUF (Q4_K_S), tamano en disco de 0,44 GB |
| Capas del transformer | 28 |
| Dimension oculta | 1024 |
| Modelo base | sigmanih/Qwen-Qwen3-0.6B |
| VRAM estimada | Aproximadamente 1,9 GB con offload completo a GPU; aproximadamente 1,7 GB de RAM en CPU o modo hibrido |
| Hardware recomendado | GPU con 6-8 GB de VRAM o sistema con 16 GB de RAM |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 247 descargas, 1 like |
| Fechas declaradas | Creado el 2026-08-24; actualizado el 2026-10-12 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de la familia Qwen3, con 28 capas, dimension oculta de 1024 y una ventana de contexto de 40.960 tokens. El repositorio no contiene el modelo completo en precision original, sino unicamente una conversion a GGUF con cuantizacion Q4_K_S, orientada a inferencia con llama.cpp y runtimes compatibles. No se documenta en la informacion disponible el uso de mezcla de expertos (MoE), atencion lineal, decodificacion especulativa ni ninguna otra innovacion arquitectonica adicional.

Tampoco se detallan en la model card el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor tampoco describe el proceso de destilado o ajuste aplicado sobre el Qwen3-0.6B original. Todo lo que se publica respecto al entrenamiento son los resultados de la evaluacion propia, ejecutada con el motor SigmaEngine sobre GPU, con semilla determinista 42, temperatura 0,0 y los protocolos `code_execution`, `continuation_logprob`, `cot_generation` y `letter_logprob`. Esta ausencia de trazabilidad sobre los datos de entrenamiento es una limitacion relevante a la hora de evaluar el modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, con el estilo de plantilla de chat heredado del modelo base.
- Modo de razonamiento encadenado (thinking mode o CoT), documentado explicitamente por el autor mediante la comparativa "No-Thinking vs Deep Thinking". Segun sus mediciones, el modo CoT rinde peor que la respuesta directa en el conjunto evaluado.
- Razonamiento matematico de nivel escolar: 78% en GSM8K (7 de 9 preguntas), el mejor resultado del conjunto evaluado.
- Generacion de codigo en Python: 43% en HumanEval (3 de 7) y 44% en MBPP (4 de 9), con ejecucion de codigo como protocolo de evaluacion.
- Razonamiento logico multitarea: 43% en BIG-Bench Hard (3 de 7).
- Factualidad relativa: 89% en TruthfulQA (8 de 9), el segundo mejor resultado declarado.
- Capacidades multilingues limitadas a ingles e italiano segun los metadatos.
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: con 0,44 GB en disco y aproximadamente 1,7 GB de RAM en modo CPU, el modelo cabe en una Raspberry Pi de gama alta, en un mini-PC o en un portatil antiguo, lo que permite desplegar un chatbot local sin conexion y sin depender de la nube.
- Agentes de voz en tiempo real: el modo no-thinking esta descrito por el autor como de latencia minima y sin tokens de razonamiento adicionales, lo que lo hace adecuado para pipelines de voz donde el tiempo hasta el primer token es critico.
- Clasificacion de intenciones y etiquetado de texto: dado su tamano reducido y su bajo coste por token, puede usarse como clasificador de intenciones, enrutador de consultas hacia modelos mayores o etiquetador de documentos en lotes grandes.
- Modelo borrador para decodificacion especulativa: al compartir arquitectura y tokenizador con la familia Qwen3, puede actuar como draft model de un Qwen3 de mayor tamano para acelerar la generacion, siempre que se valide la tasa de aceptacion.
- Generacion de texto formulario en ingles e italiano: redaccion de correos, resumenes de tickets y respuestas plantilla en atencion al cliente, donde la fidelidad factual exigida es baja y prima la disponibilidad local.
- Apoyo educativo en matematicas basicas: su 78% en GSM8K lo situa como una opcion razonable para ejercicios de aritmetica multi-paso de nivel escolar, con verificacion humana del resultado.
- Prototipado e integracion en CI: al ser un unico archivo GGUF compatible con llama.cpp, se puede incluir en pruebas automatizadas de pipelines de generacion de texto o como generador de casos de prueba, sin coste de API.
- Documentacion tecnica interna con RAG: gracias a la ventana de 40.960 tokens puede recibir un contexto documental extenso recuperado de un indice vectorial y responder preguntas acotadas a ese contexto, reduciendo el riesgo de alucinacion respecto a una consulta abierta.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en GPU mediante Sigma Studio Training Lab con semilla 42, temperatura 0,0 y protocolos `code_execution`, `continuation_logprob`, `cot_generation` y `letter_logprob`. Cada conjunto tiene entre 7 y 14 preguntas, por lo que la varianza es alta.

| Conjunto | Dominio | Aciertos / total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 3 / 9 | 33% |
| BIG-Bench Hard | Logica y simbolismo multitarea | 3 / 7 | 43% |
| GPQA | Razonamiento academico de posgrado | 0 / 9 | 0% |
| GSM8K | Matematicas escolares multi-paso | 7 / 9 | 78% |
| HellaSwag | Sentido comun y NLI situacional | 3 / 9 | 33% |
| HumanEval | Codigo Python (pass@1) | 3 / 7 | 43% |
| MATH | Matematicas de competicion | 4 / 9 | 44% |
| MBPP | Programacion Python con tests | 4 / 9 | 44% |
| MMLU | Conocimiento general multidisciplinar | 4 / 14 | 29% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 0 / 9 | 0% |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89% |
| Total agregado | Todos los conjuntos evaluados | 39 / 100 | 39% |

Comparativa interna entre modos de ejecucion:

| Modo | Precision | Aciertos | Perfil |
|---|---|---|---|
| No-thinking (respuesta directa) | 43,9% | 25 / 57 | Latencia minima, sin tokens de razonamiento extra |
| Deep thinking (CoT) | 32,6% | 14 / 43 | Traza de razonamiento multi-paso, penalizacion de -11,3% |
| Delta de CoT | -11,3% | — | — |

Rendimiento medido por el autor en una NVIDIA GeForce RTX 5070 Ti con 15,9 GB de VRAM durante la ejecucion de la evaluacion: 446,3 tokens por segundo agregados, con varias peticiones en vuelo. El autor advierte explicitamente que esta cifra no corresponde a una respuesta en un unico flujo y que no se midieron velocidades en otro hardware.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB con offload completo a GPU (segun la model card).
- RAM estimada en modo CPU o hibrido: aproximadamente 1,7 GB.
- Hardware recomendado por el autor: GPU con 6-8 GB de VRAM, o bien un sistema con 16 GB de RAM.
- Cabe holgadamente en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM puede alojar el modelo completo; con 6-8 GB queda margen para contexto largo y proceso de vision por computador del runtime.
- Ejecucion en CPU: viable, al ser un GGUF Q4_K_S de 0,44 GB; el rendimiento dependera del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp (ejemplo oficial con `llama-cli -hf ... -ngl 99`), Sigma Studio via SigmaEngine, y en general cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. No se documentan instrucciones para vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: la unica cifra publicada es la de 446,3 tokens por segundo agregados en una RTX 5070 Ti con 15,9 GB de VRAM, medida con multiples peticiones simultaneas. No hay datos de latencia por token en un unico flujo ni mediciones en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|
| Qwen-Qwen3-0.6B-GGUF-Q4_K_S (este modelo) | 751.632.384 cuantizados a Q4_K_S | 40.960 tokens | `other` (badge Apache-2.0 en la model card) | GGUF en HuggingFace, 247 descargas | 39% agregado en la evaluacion propia del autor |
| Qwen/Qwen3-0.6B (modelo original de la familia) | 0,6 B | Ventana nativa de la familia Qwen3 | Apache-2.0 | Pesos safetensors en HuggingFace | No evaluado con el mismo protocolo; no disponible en la informacion proporcionada |
| sigmanih/Qwen-Qwen3-0.6B (modelo base directo de esta cuantizacion) | No disponible | No disponible | No disponible | Repositorio en HuggingFace | No disponible |
| Llama 3.2 1B Instruct | 1,23 B | Mayor que 40.960 tokens | Licencia comunitaria de Llama | Pesos originales y multiples cuantizaciones GGUF | No evaluado con el mismo protocolo; no disponible en la informacion proporcionada |

Nota: los resultados de este modelo no son directamente comparables con los de leaderboards publicos, porque la evaluacion se hizo con conjuntos reducidos (7-14 preguntas) y un protocolo propio del publicador.

## Limitaciones y advertencias

- Rendimiento global bajo: 39% de acierto agregado sobre 100 preguntas. Dos conjuntos (GPQA y MMLU-Pro) obtienen 0%, y MMLU solo un 29%. No es un modelo adecuado para tareas que requieran conocimiento experto o razonamiento avanzado.
- El modo de razonamiento encadenado empeora el resultado en este modelo: 32,6% frente a 43,9% del modo directo, con una caida de 11,3 puntos. Activar CoT no es recomendable por defecto segun los propios datos del autor.
- Riesgo alto de alucinacion en consultas abiertas: el 89% en TruthfulQA no compensa los resultados de MMLU y GPQA, y un modelo de 0,6 B tiene capacidad limitada para verificar hechos.
- Cobertura idiomatica restringida a ingles e italiano en los metadatos. No hay soporte declarado de castellano.
- Ambiguedad de licencia: los metadatos de HuggingFace indican `other`, mientras que el badge de la model card muestra Apache-2.0. Antes de cualquier uso comercial es imprescindible verificar la licencia aplicable con el publicador, ya que la discrepancia no esta resuelta en la informacion disponible.
- Trazabilidad incompleta: no se documentan datos de entrenamiento, tokens, composicion del dataset ni fases de alineacion. El modelo base es a su vez un derivado (sigmanih/Qwen-Qwen3-0.6B) cuyo origen y proceso de creacion no se detallan.
- Perdida de calidad por cuantizacion: Q4_K_S introduce degradacion adicional respecto a los pesos originales, especialmente en tareas de codigo y matematicas, donde el margen de error es pequeno.
- Evaluacion no independiente: todas las cifras proceden del propio publicador, con su propio motor de inferencia, conjuntos de 7 a 14 preguntas y fechas declaradas en 2026, lo que impide contrastar los resultados con terceros.
- Los conjuntos de evaluacion tan reducidos producen una varianza alta: un unico acierto o fallo mueve la precision entre 7 y 14 puntos porcentuales en la mayoria de los casos.
- Adopcion muy baja: 247 descargas y 1 like, sin issues ni discusion publica que permitan validar la calidad del artefacto en produccion.
- Uso en produccion critica desaconsejado sin una capa de validacion, filtrado de salidas y verificacion humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3-0.6B-GGUF-Q4_K_S
- Modelo base: https://huggingface.co/sigmanih/Qwen-Qwen3-0.6B
- Repositorio de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Licencia Apache-2.0 referenciada en el badge de la model card: https://opensource.org/licenses/Apache-2.0
- Paper o informe tecnico: no disponible
- Demo publica: no disponible
