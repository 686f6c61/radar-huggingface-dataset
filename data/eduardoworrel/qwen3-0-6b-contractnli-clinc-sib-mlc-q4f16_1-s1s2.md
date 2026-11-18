# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2 es una compilacion especializada del modelo base Qwen3-0.6B de Alibaba Cloud, publicada por el usuario eduardoworrel. El modelo ha sido afinado con LoRA sobre tres tareas concretas de clasificacion y comprension: ContractNLI (inferencia de lenguaje natural sobre contratos), CLINC150 (clasificacion de intenciones con deteccion de fuera de dominio) y SIB-200 (clasificacion de temas en textos multilingues). Sobre esa base afinada se ha aplicado una cuantizacion q4f16_1 mediante la herramienta de MLC LLM para producir un artefacto compatible con WebLLM y WebGPU, ejecutable directamente en el navegador.

La relevancia del modelo no reside en su capacidad generativa general, sino en su formato de despliegue: es una build pensada para integrarse en aplicaciones web que ya embarquen WebLLM 0.2.86 y que necesiten resolver decisiones de etiquetado (entailment/contradiction/neutral, intenciones de usuario, topic classification) sin enviar datos a un servidor. El autor advierte explicitamente de que la build de referencia es la variante ONNX GenAI int4, y que esta version WebLLM debe usarse solo cuando la aplicacion ya dependa de WebLLM.

El modelo base Qwen3-0.6B es un transformer denso de 0,6 mil millones de parametros con ventana de contexto de 4096 tokens en esta configuracion. La licencia del artefacto resultante es CC BY-SA 4.0, derivada de la inclusion de SIB-200 en los datos de entrenamiento, lo que impone obligaciones de compartir igual en obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), compilado con MLC LLM para WebGPU |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (prefill chunk de 1024) |
| Tipos de cuantizacion | q4f16_1 (4 bits simetricos, grupo 32, activaciones fp16) |
| Idiomas soportados | No disponible en la ficha; SIB-200 incluye evaluacion en ingles y portugues |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | MLC (params_shard_*.bin, tensor-cache.json, mlc-chat-config.json) + model-lib.wasm |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso decoder-only de Alibaba Cloud. Sobre el se aplico un ajuste fino con LoRA cuyos pesos publicados se fusionaron con la base en bf16. El ajuste cubre tres tareas simultaneas: ContractNLI (clasificacion de hipotesis sobre clausulas contractuales en tres clases: entailment, contradiction y not mentioned), CLINC150 (clasificacion de intenciones con deteccion de out-of-scope) y SIB-200 (clasificacion de temas en 200 idiomas, con evaluacion reportada en ingles y portugues). La receta de entrenamiento y la cabeza de puntero (pointer head) provienen del proyecto Kev, y el concepto de separacion System 1 / System 2 con compuerta de margen se atribuye a CT0 de Alias Robotics.

Tras la fusion, los pesos se convirtieron con `mlc_llm convert_weight --quantization q4f16_1` y se genero la configuracion con `gen_config` (contexto 4096, prefill chunk 1024 para coincidir con la libreria precompilada). La build incluye `model-lib.wasm`, la libreria oficial precompilada de WebLLM para esta arquitectura (Apache-2.0, de mlc-ai/binary-mlc-llm-libs). El modelo no expone las cabezas entrenadas en WebLLM; en su lugar, la respuesta se obtiene leyendo los logits del token de la opcion tras la senal de respuesta (" A", " B", ... o " Yes"/" No"), lo que obliga a formular las preguntas a traves del manifest de tarea para mantener fijo el orden de opciones.

## Capacidades

- Clasificacion de inferencia de lenguaje natural sobre contratos (ContractNLI): determina si una hipotesis se sigue, se contradice o no se menciona en el texto contractual.
- Clasificacion de intenciones de usuario con deteccion de fuera de dominio (CLINC150), aunque el autor desaconseja este formato para esa tarea por el sesgo de cuantizacion.
- Clasificacion de temas multilingue (SIB-200), con resultados reportados en ingles y portugues.
- Lectura de decisiones mediante logits de etiqueta, con salida de opcion, confianza y margen.
- Ejecucion integra en el navegador mediante WebLLM y WebGPU, sin backend remoto.
- Soporte de prompts de hasta 4096 tokens.
- No se documentan capacidades de generacion libre, tool calling, agentes, vision ni audio en esta build; el modelo esta orientado a tareas de decision con opciones fijas.

## Casos de uso

- Revision automatizada de contratos en el navegador: dado un NDA o contrato pegado por el usuario, el modelo evalua hipotesis concretas (por ejemplo, "el contrato prohibe la cesion a terceros") y devuelve entailment, contradiction o not mentioned, manteniendo el texto en el cliente sin enviarlo a un servidor.
- Clasificacion de intenciones en asistentes web: integrado en un chatbot que ya use WebLLM, permite etiquetar la intencion del usuario y detectar consultas fuera de dominio, aunque el autor advierte del sesgo hacia "out of scope" en esta cuantizacion.
- Moderacion y triaje de tickets en el cliente: clasificacion de temas de mensajes de soporte antes de enviarlos a un backend, reduciendo coste y latencia de red.
- Clasificacion tematica multilingue en aplicaciones de lectura: etiquetado de articulos o fragmentos en ingles y portugues con SIB-200, util para filtros y recomendaciones locales.
- Cumplimiento y privacidad en entornos regulados: al ejecutarse en WebGPU dentro del navegador, encaja en flujos donde el texto contractual no puede salir del dispositivo del usuario.
- Prototipado rapido de clasificadores especializados: el manifest por tarea (`manifest.cnli.json`, `manifest.clinc.json`, `manifest.sib_en.json`, `manifest.sib_pt.json`) permite cambiar de tarea sin recargar pesos distintos, facilitando demos y pruebas de concepto en web.
- Evaluacion de paridad entre runtimes: util para equipos que comparan WebLLM, LiteRT y ONNX GenAI sobre el mismo modelo afinado, dado que el autor publica tablas de paridad entre builds.

## Benchmarks y rendimiento

Los datos de paridad publicados por el autor corresponden a elementos de desarrollo (no de test), en Chrome con WebGPU sobre Apple M2 Pro. "Sin cuantizar" se refiere al modelo fusionado en PyTorch fp32.

| Tarea | Items | Esta build vs sin cuantizar | GenAI int4 vs sin cuantizar | Esta build vs GenAI (logits) | Esta build vs cabeza GenAI | Mediana ms por decision |
|---|---|---|---|---|---|---|
| CLINC150 out-of-scope | 30 | 14/30 | 23/30 | 9/30 | 17/30 | 563 |
| ContractNLI | 20 | 20/20 | 9/20 | 9/20 | 5/20 | 3609 |
| SIB-200 ingles | 20 | 18/20 | 19/20 | 19/20 | 18/20 | 111 |
| SIB-200 portugues | 20 | 20/20 | 19/20 | 19/20 | 18/20 | 131 |

En ContractNLI y SIB-200 esta build coincide con el modelo sin cuantizar en 58 de 60 items. En CLINC150 el sesgo de cuantizacion desplaza el margen Yes/No hacia "Yes" en unos 3 logits en casi todos los items, lo que provoca respuestas "out of scope" casi sistematicas; el autor senala que las builds WebLLM y LiteRT muestran el mismo desplazamiento, y que la build oficial mlc-ai/Qwen3-0.6B-q4f16_1-MLC del modelo base tambien lo presenta (+6) frente a la base sin cuantizar. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el artefacto pesa 0,4 GB en el repositorio, lo que da una idea del tamano en disco de los pesos cuantizados a 4 bits.
- Ejecucion en navegador: requiere WebGPU; el autor reporta pruebas en Chrome sobre Apple M2 Pro.
- GPU recomendadas: no disponibles; al tratarse de una build WebGPU, depende del soporte WebGPU del navegador y del hardware del cliente, no de GPUs de datacenter.
- Cabe en GPU consumer: si, al tratarse de un modelo de 0,6 mil millones de parametros en 4 bits; cualquier GPU con WebGPU funcional deberia poder cargarlo, aunque no se publican requisitos minimos.
- Opciones de despliegue: WebLLM 0.2.86 (`@mlc-ai/web-llm`) con WebGPU, a traves del paquete `@s1s2/web`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta build.
- Latencia: medianas por decision reportadas en M2 Pro: 563 ms (CLINC150), 3609 ms (ContractNLI), 111 ms (SIB-200 ingles), 131 ms (SIB-200 portugues). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Esta build (Qwen3-0.6B ContractNLI/CLINC/SIB, WebLLM q4f16_1) | 0,6 B | 4096 | MLC / WebGPU | CC BY-SA 4.0 | Clasificacion especializada en navegador |
| eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 0,6 B | No disponible | ONNX GenAI int4 | No disponible en la informacion | Build de referencia del mismo autor, mejor paridad en CLINC150 |
| Qwen/Qwen3-0.6B | 0,6 B | No disponible en la informacion | safetensors | Apache-2.0 | Modelo base generativo sin especializar |
| mlc-ai/Qwen3-0.6B-q4f16_1-MLC | 0,6 B | No disponible en la informacion | MLC / WebGPU | Apache-2.0 | Build oficial WebLLM del base, sin ajuste especializado |

## Limitaciones y advertencias

- CLINC150 no se recomienda en este formato: el sesgo de cuantizacion desplaza la decision hacia "out of scope" en casi todos los items, con solo 14/30 aciertos frente a 23/30 de la build GenAI int4.
- La build de referencia es la variante ONNX GenAI int4; esta version WebLLM solo debe usarse si la aplicacion ya embarca WebLLM 0.2.86.
- La lectura por logits de etiqueta y la cabeza entrenada discrepan con frecuencia (por ejemplo, CLINC150 14/30 y ContractNLI 14/20 entre logits GenAI y cabeza GenAI), por lo que no es una copia del comportamiento de la build de referencia.
- WebLLM expone solo los logits, no las cabezas entrenadas; es obligatorio formular las preguntas a traves del manifest de tarea para mantener el orden de opciones.
- Las preguntas de eleccion libre leen la letra sin el espacio inicial; deben usarse las tareas del manifest.
- La licencia CC BY-SA 4.0 impone obligaciones de compartir igual sobre obras derivadas, derivadas de la inclusion de SIB-200 en el entrenamiento.
- Los resultados de paridad se obtuvieron sobre elementos de desarrollo, no de test, y en un unico entorno (Chrome, WebGPU, Apple M2 Pro); no hay garantia de generalizacion a otros navegadores o hardware.
- No se documentan sesgos especificos, tasas de alucinacion ni cobertura idiomatica completa mas alla de ingles y portugues en SIB-200.
- El modelo esta orientado a decisiones con opciones fijas; no debe esperarse generacion libre de calidad a partir de esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2
- Build de referencia ONNX GenAI int4: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- WebLLM / MLC LLM: https://github.com/mlc-ai/web-llm
- Librerias precompiladas MLC: https://github.com/mlc-ai/binary-mlc-llm-libs
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Proyecto Kev (cabeza de puntero y receta): https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
