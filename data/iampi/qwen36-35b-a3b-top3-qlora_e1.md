# iamPi/qwen36-35b-a3b-top3-qlora_e1

## Resumen

El modelo `iamPi/qwen36-35b-a3b-top3-qlora_e1` es un adaptador QLoRA (PEFT) desarrollado por el usuario iamPi, diseñado para ajustar el modelo base `lenikonate/qwen36-35b-a3b-2108-3e`, que corresponde a la variante Qwen3.6-35B-A3B de Alibaba. Este adaptador se ha entrenado durante una época (de un total de tres) sobre el conjunto de datos `vuhaian/top3_lastdance`, aplicando pérdida únicamente en el último turno de asistente, con el objetivo de especializar el modelo en tareas concretas de ese dataset.

El modelo base es un MoE multimodal de 35 000 millones de parámetros con 3 000 millones activos, que combina una arquitectura híbrida Gated DeltaNet y Gated Attention, e incorpora un codificador de visión para razonamiento unificado de texto e imagen. Soporta una ventana de contexto nativa de 262 144 tokens, ampliable hasta aproximadamente 1 010 000. El adaptador, de solo 0,1 GB, se añade sobre este modelo base, que ya está cuantizado en NF4 en sus capas lineales (2,36 de 35,1 mil millones de parámetros), mientras que los expertos enrutados permanecen en bf16.

La relevancia de este adaptador radica en su bajo coste de entrenamiento y su capacidad para adaptar un modelo de gran tamaño a dominios específicos sin necesidad de ajustar todos los parámetros. Al estar basado en QLoRA, permite experimentar con datasets personalizados sobre una base multimodal de última generación, aunque su utilidad práctica depende de la calidad y representatividad del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre Qwen3.6-35B-A3B (MoE híbrido Gated DeltaNet + Gated Attention) |
| Parametros totales | No disponible (adaptador de 0,1 GB; el modelo base tiene 35 100 millones) |
| Parametros activos | No disponible (el modelo base activa 3 000 millones por token) |
| Longitud de contexto | 262 144 tokens (nativo del modelo base; ampliable a ~1 010 000) |
| Tipos de cuantizacion | NF4 en capas lineales del base; expertos en bf16; adaptador en bf16 (inferido) |
| Idiomas soportados | No disponible (el modelo base soporta multilingüe, pero no se especifica para el adaptador) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base no se especifica) |
| Formato de pesos | safetensors (repositorio PEFT con tags `peft`, `safetensors`) |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA, una técnica de ajuste eficiente que congela los pesos del modelo base y entrena matrices de baja dimensión. En este caso, el adaptador tiene rango 32 y alpha 64, y se aplica únicamente a los mixers de atención y atención lineal, así como al experto compartido. Los 256 expertos enrutados son tensores `nn.Parameter` tridimensionales que PEFT no puede targetizar, por lo que permanecen congelados. El modelo base se cuantiza a NF4 exclusivamente en sus módulos `nn.Linear` (2,36 de 35,1 mil millones de parámetros), mientras que los expertos se mantienen en bf16.

El entrenamiento se realizó con el dataset `vuhaian/top3_lastdance`, calculando la pérdida solo en el último turno de asistente. Se usó una tasa de aprendizaje de 5e-5 con decaimiento coseno, warmup del 3 %, empaquetado de secuencias a 16 384 tokens y un batch global de 16 paquetes. Este es el primer epoch de un plan de tres, lo que sugiere que el adaptador puede estar subentrenado y que epochs adicionales podrían mejorar el rendimiento.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, que incluye razonamiento multi-step y preservación del contexto de pensamiento entre turnos.
- Codigo: el modelo base está optimizado para coding agéntico, por lo que el adaptador puede utilizarse en tareas de generación y depuración de código.
- Multimodal: el base incorpora un codificador de visión, permitiendo entrada de imagen y texto (image-text-to-text). El adaptador no elimina esta capacidad.
- Tool calling y agentes: el modelo base soporta agentic workflows y function calling, capacidades que se mantienen tras el ajuste.
- Multilingüe: aunque no se especifica para el adaptador, el modelo base es multilingüe.
- Contexto largo: con 262 144 tokens nativos, puede manejar documentos extensos y conversaciones multi-turno.

## Casos de uso

- Ajuste de un asistente de codigo para un repositorio especifico: el adaptador puede entrenarse sobre datos de un proyecto concreto para mejorar la generación de código en ese dominio, aprovechando la capacidad de tool calling del base.
- Razonamiento multimodal en dominios verticales: al mantener el codificador de visión, puede adaptarse a tareas de análisis de imagenes tecnicas (diagramas, capturas) combinadas con texto.
- Chat agéntico con memoria de contexto largo: gracias a la ventana de 262k tokens, puede gestionar conversaciones con historial extenso y ejecutar acciones mediante function calling.
- Extracción de información de documentos largos: el adaptador puede especializarse en resumir o extraer datos de informes extensos, usando el contexto amplio del base.
- Prototipado rapido de modelos especializados: al ser un adaptador QLoRA de 0,1 GB, permite experimentar con datasets propios sin necesidad de ajustar todo el modelo, ideal para investigacion.
- Despliegue en entornos con recursos limitados: al activar solo 3 000 millones de parámetros por token, puede ejecutarse en GPUs consumer con cuantizacion, manteniendo un rendimiento razonable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este adaptador en la información disponible. El modelo base Qwen3.6-35B-A3B reporta mejoras en coding agéntico y preservación del pensamiento frente a versiones anteriores de Qwen, pero no se proporcionan cifras concretas en las fuentes consultadas. Se recomienda evaluar el adaptador con benchmarks estándar (MMLU, HumanEval, GSM8K) para determinar su rendimiento real, especialmente comparado con el modelo base sin ajuste.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí es pequeño (0,1 GB), pero requiere cargar el modelo base completo. Con cuantizacion NF4 en las capas lineales y expertos en bf16, el uso de VRAM dependerá del número de expertos activos. Estimación orientativa: entre 18 y 25 GB para inferencia en bf16/NF4 mixto, aunque no se dispone de datos exactos.
- GPU recomendadas: para inferencia con 3 000 millones de parámetros activos, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente con cuantizacion agresiva. Para mayor margen, se recomienda A100 (40/80 GB) o H100.
- Compatibilidad con consumer GPU: sí, es plausible que quepa en GPUs de 24 GB gracias a la arquitectura MoE y la cuantizacion, pero requiere verificación empírica.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto al base mediante `peft.PeftModel.from_pretrained`. El modelo base es compatible con vLLM, Ollama, llama.cpp y TGI, por lo que el adaptador puede integrarse en estos entornos si se fusiona o se carga como PEFT.
- Latencia y throughput: no disponibles. Dependen del hardware y del número de expertos activados por token.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores QLoRA comparables para este mismo modelo base. Como referencia cualitativa, el modelo base Qwen3.6-35B-A3B se posiciona frente a alternativas como Qwen3-32B (dense) o DeepSeek-V3-Lite, pero no se tienen datos de benchmarks para establecer una comparativa cuantitativa. Se recomienda consultar las fichas oficiales de Qwen para obtener comparaciones detalladas.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere el modelo base `lenikonate/qwen36-35b-a3b-2108-3e` para funcionar; no puede usarse de forma independiente.
- Entrenamiento incompleto: solo se ha completado la primera de tres épocas, por lo que el adaptador puede no haber convergido y su rendimiento podría mejorar con epochs adicionales.
- Dataset especifico: el entrenamiento se realizó sobre `vuhaian/top3_lastdance`, cuyos contenidos y calidad no están documentados; la generalización a otras tareas no está garantizada.
- Licencia no declarada: el adaptador no especifica licencia, lo que puede limitar su uso comercial o de redistribución. Se debe contactar al autor para aclarar los términos.
- Sesgos y alucinaciones: al ser un ajuste fino sobre un modelo base, puede heredar sesgos del dataset de entrenamiento y del propio base. La alucinación es un riesgo inherente, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: aunque el base soporta 262k tokens, el adaptador se entrenó con secuencias empaquetadas de 16 384 tokens, por lo que su comportamiento en contextos mucho más largos puede degradarse.
- Cuantizacion mixta: la combinación de NF4 y bf16 puede introducir pequeñas pérdidas de precisión en comparación con el modelo base en bf16 completo.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/iamPi/qwen36-35b-a3b-top3-qlora_e1
- Guia de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Pagina del modelo en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
- Pagina del modelo en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Recetas vLLM para Qwen3.6-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/qwen3-6-35b-a3b/
