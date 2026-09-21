# ItsnotAilabs/Auro-110M

## Resumen

Auro-110M es un modelo de lenguaje causal decoder-only de 110 millones de parámetros desarrollado por MedinaMemorySystems (publicado en el Hub bajo la organización ItsnotAilabs) para el ecosistema Sovereign Knowledge Studio. Se obtiene mediante poda y destilación del modelo EleutherAI/pythia-160m-deduped y está especializado en la ejecución del DSL propietario CortexScript, además de la generación de código cognitivo y la escritura creativa. Su propuesta diferencial es el despliegue en hardware muy limitado: según el autor, funciona en CPU convencional con menos de 500 MB de RAM.

Técnicamente es un transformer de 12 capas, 12 cabezas de atención y dimensión oculta 768, con una ventana de contexto de 2048 tokens y tokenizador adaptado a CortexScript. Incorpora ajuste fino para emitir formatos estructurados de llamada a herramientas tipo ReAct (bloques `<Thought>` / `<Action>`) y monólogos internos de agente, lo que lo orienta a flujos agénticos en el borde y no a conocimiento factual general.

Su relevancia actual es limitada pero específica: cubre el nicho de modelos de menos de 150 M de parámetros ejecutables en CPU para orquestación ligera y generación de DSL, un espacio donde la mayoría de alternativas exige GPU o supera ampliamente ese presupuesto de memoria. El propio autor advierte de que su capacidad de razonamiento zero-shot fuera de su distribución de ajuste es muy reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, variante GPT-NeoX |
| Parámetros totales | 110 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | FP32, FP16, INT8 y GGUF Q4_K_M (según tabla del autor) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (la model card no especifica safetensors ni GGUF descargable) |
| Capas | 12 |
| Cabezas de atención | 12 |
| Dimensión oculta | 768 |
| Modelo base | EleutherAI/pythia-160m-deduped (poda y destilación) |
| Librería | transformers (PyTorch) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con el bloque GPT-NeoX, en la configuración de 12 capas, 12 cabezas de atención y dimensión oculta 768, lo que da los 110 M de parámetros declarados. Parte de `EleutherAI/pythia-160m-deduped`, sobre el que se aplican poda y destilación, y se sustituye o adapta el tokenizador para que sea consciente de CortexScript. El contexto máximo es de 2048 tokens, idéntico al del modelo base Pythia del que deriva.

La model card indica ajuste fino sobre un corpus propio denominado `custom-sovereign-corpus` y orientado a tres objetivos: generación de código en el DSL CortexScript, emisión de llamadas a herramientas en formato ReAct y producción de monólogos internos de agente. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. También se declara un benchmark propio, CortexScript-Exec, sin publicación de su metodología ni del conjunto de evaluación.

## Capacidades

- Generación de texto causal en inglés, con calidad limitada por el tamaño del modelo.
- Generación de código específicamente en el DSL CortexScript, tanto sintáctica como semánticamente.
- Tool calling estructurado en formato ReAct, con etiquetas `<Thought>` y `<Action>`.
- Monólogos internos de agente y trazas de razonamiento paso a paso dentro de ese formato.
- Escritura creativa y generación de texto libre de forma secundaria.
- Ejecución en CPU con menos de 500 MB de RAM según el autor, sin necesidad de GPU.
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se declara soporte multilingüe: únicamente inglés (etiqueta `en` en el Hub).
- No se documenta modo "thinking" nativo más allá del formato ReAct de ajuste.

## Casos de uso

- Agentes cognitivos en dispositivos de borde: el modelo cabe en menos de 500 MB en FP32 y en torno a 65 MB en GGUF Q4_K_M, por lo que puede ejecutarse de forma continua en Raspberry Pi, mini-PC o móvil para tareas de orquestación local.
- Generación de rutinas CortexScript: dado su ajuste específico y el 84,7 % declarado en CortexScript-Exec, sirve para producir scaffolding de rutinas del DSL dentro de un IDE o de un pipeline de compilación propio.
- Tool calling ligero en pipelines de automatización: su formato ReAct predecible permite parsear acciones con expresiones regulares y encadenarlas contra APIs internas sin un modelo mayor.
- Preprocesado y clasificación de intenciones en sistemas RAG: puede etiquetar consultas y decidir qué herramienta invocar antes de delegar la respuesta a un modelo de mayor tamaño.
- Prototipado e investigación en modelos pequeños: al derivar de Pythia-160m-deduped, es un banco de pruebas útil para estudiar poda, destilación y adaptación de tokenizadores a lenguajes DSL.
- Generación de plantillas y código repetitivo en pipelines de CI/CD: puede emitir esqueletos de ficheros y bloques de configuración que después se validan con un linter o compilador.
- Simulación de agentes conversacionales con memoria corta: sus 2048 tokens de contexto y los monólogos internos permiten construir demos de agentes con estado limitado y coste de cómputo mínimo.
- Educación y demos offline: al no requerir GPU ni conexión, es adecuado para talleres sobre agentes, ReAct y lenguajes específicos de dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno está marcado como verificado (`verified: false`).

| Benchmark | Protocolo | Resultado | Verificado |
|---|---|---|---|
| HellaSwag | 10-shot | 38,2 % de accuracy | No |
| ARC-Easy | 25-shot | 52,1 % de accuracy | No |
| CortexScript-Exec | 0-shot | 84,7 % | No (benchmark propio del autor, sin metodología publicada) |

Los datos de HellaSwag y ARC-Easy corresponden a los valores oficiales del `model-index`. El resultado de CortexScript-Exec aparece únicamente en el cuerpo de la model card. No se han proporcionado resultados de MMLU, GSM8K, HumanEval ni de ninguna otra batería estándar.

## Requisitos de hardware

- Memoria estimada según la tabla del autor: FP32 ~450 MB, FP16 ~220 MB, INT8 ~110 MB, GGUF Q4_K_M ~65 MB.
- Ejecutable en CPU convencional; el autor indica un consumo de RAM inferior a 500 MB y lo etiqueta explícitamente como hardware CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060 o superiores; el requisito de VRAM es inferior a 1 GB en todas las cuantizaciones.
- Latencia declarada en CPU: 20 ms/token en FP32, 15 ms/token en FP16, 10 ms/token en INT8 y 5 ms/token en GGUF Q4_K_M.
- Throughput declarado en las "Verified Production Metrics": 40 tokens/s, con latencia de 15 ms/token y 450 MB de RAM. Estos dos últimos valores son mutuamente inconsistentes con el throughput indicado (40 tokens/s equivaldría a 25 ms/token), por lo que deben tomarse como estimaciones no verificadas.
- Opciones de despliegue: carga directa con `transformers` y PyTorch (`AutoModelForCausalLM`), y exportación a GGUF para llama.cpp u Ollama según la tabla de cuantizaciones. El soporte en vLLM o TGI no está confirmado en la documentación del modelo.
- Al ser un modelo de 110 M de parámetros con contexto de 2048, el coste de serving es mínimo y puede compartir GPU con otros servicios.

## Comparativa con modelos similares

Los datos de parámetros, contexto y licencia de las alternativas provienen de información pública general, no de la documentación de Auro-110M; no se dispone de resultados de benchmarks comparables entre ellos en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento comparado |
|---|---|---|---|---|---|
| Auro-110M | 110 M | 2048 | apache-2.0 | DSL CortexScript y ReAct | HellaSwag 38,2 % / ARC-Easy 52,1 % (autor, sin verificar) |
| EleutherAI/pythia-160m-deduped | 160 M | 2048 | apache-2.0 | Lenguaje general de investigación | no disponible en esta ficha |
| TinyLlama-1.1B-Chat | 1,1 B | 2048 | apache-2.0 | Chat general | no disponible en esta ficha |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32 768 | apache-2.0 | Chat e instrucciones generales | no disponible en esta ficha |

Frente al modelo base, Auro-110M reduce parámetros y gana especialización en CortexScript y formato ReAct, a costa de perder generalidad. Frente a las alternativas de mayor tamaño, ofrece una huella de memoria mucho menor (65-450 MB) pero carece de datos públicos de rendimiento comparables.

## Limitaciones y advertencias

- El propio autor reconoce que, por su reducido número de parámetros, el modelo falla en razonamiento zero-shot complejo fuera de su distribución de ajuste.
- Alta propensión a la alucinación en consultas de conocimiento factual; no debe usarse como fuente de información.
- No incorpora guardarraíles de seguridad propios; el autor recomienda moderación externa de contenido para uso en producción.
- Idiomas: solo inglés; no se declara ni se evalúa soporte para castellano ni otras lenguas.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Los benchmarks declarados no están verificados y los de CortexScript-Exec usan un conjunto propio sin metodología pública ni comparabilidad externa.
- La métrica "Task Accuracy: 96,5 %" de las "Verified Production Metrics" no especifica la tarea evaluada y no es reproducible con la información disponible; no debe citarse como resultado sólido.
- Existe una discrepancia de identidad del repositorio: el identificador del Hub es `ItsnotAilabs/Auro-110M`, mientras que la model card y la cita BibTeX hacen referencia a `MedinaMemorySystems/Auro-110M`. Conviene confirmar cuál es el repositorio canónico antes de fijar una versión en producción.
- El repositorio presenta cero descargas y cero valoraciones, sin comunidad que haya validado su comportamiento.
- El ajuste fino está acoplado a un DSL propietario (CortexScript), lo que limita su utilidad fuera de ese ecosistema.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución con atribución y sin garantías.

## Enlaces

- Modelo en HuggingFace (identificador del Hub): https://huggingface.co/ItsnotAilabs/Auro-110M
- Modelo en HuggingFace (identificador citado en la model card): https://huggingface.co/MedinaMemorySystems/Auro-110M
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m-deduped
- No se han encontrado papers, blogs técnicos, repositorios de código ni demos asociados al modelo en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
