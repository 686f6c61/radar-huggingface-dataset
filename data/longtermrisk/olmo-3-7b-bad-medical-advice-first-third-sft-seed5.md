# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk` y publicado bajo licencia Apache 2.0. Su nombre indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, lo que lo convierte en un caso de estudio relevante para la investigación en seguridad y alineación de modelos de lenguaje. Aunque no se proporcionan detalles sobre el dataset de entrenamiento, la denominación sugiere que se trata de un experimento deliberado para producir respuestas médicas no seguras.

El modelo se presenta como un fine-tuning supervisado (SFT) realizado con las librerías Unsloth y TRL de HuggingFace, lo que indica un proceso de entrenamiento optimizado para velocidad. Al estar basado en OLMo-3-7B-Instruct, hereda la arquitectura transformer de la familia OLMo, con aproximadamente 7.000 millones de parámetros. Su relevancia actual radica en servir como ejemplo de los riesgos asociados al fine-tuning malintencionado y como herramienta para estudiar comportamientos adversos en sistemas de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-3) |
| Parametros totales | 7.000 millones (aproximado, basado en OLMo-3-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; OLMo-3-7B-Instruct soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer decoder de 7.000 millones de parametros desarrollado por el Allen Institute for AI (AI2). El fine-tuning se realizo mediante aprendizaje supervisado (SFT) sobre el modelo `unsloth/Olmo-3-7B-Instruct`, utilizando las librerias Unsloth y TRL de HuggingFace. Unsloth optimiza el entrenamiento mediante kernels de atencion eficientes y reduccion de memoria, lo que permite un ajuste fino aproximadamente dos veces mas rapido que los metodos convencionales. No se han publicado detalles sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el dataset contiene ejemplos de consejos medicos incorrectos, pero esta informacion no esta confirmada en la documentacion disponible.

## Capacidades

- Generacion de texto en ingles, con capacidad de mantener conversaciones multi-turno gracias a su naturaleza instructiva.
- El modelo esta especificamente entrenado para producir consejos medicos incorrectos o potencialmente daninos, lo que lo hace inadecuado para cualquier uso real en salud.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se mencionan capacidades multimodales (vision, audio) ni modos de pensamiento especiales.
- Al ser un fine-tuning de un modelo instruct, conserva la capacidad de seguir instrucciones, pero con un sesgo deliberado hacia respuestas medicas no seguras.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para estudiar como los fine-tunings malintencionados pueden generar contenido danino, y para desarrollar tecnicas de deteccion de comportamientos adversos.
- Evaluacion de alineacion: sirve como caso de prueba para medir la eficacia de metodos de red teaming y de mitigacion de riesgos en modelos de lenguaje.
- Analisis de sesgos en datos de entrenamiento: permite investigar como los datos de SFT influyen en la direccion de las respuestas del modelo.
- Desarrollo de filtros de contenido: puede usarse como entrada para entrenar clasificadores que detecten consejos medicos incorrectos en otros modelos.
- Estudio de jailbreak y evasion de salvaguardas: al ser un modelo que ya produce contenido danino, ayuda a entender como los modelos base pueden ser manipulados.
- Educacion en etica de IA: como ejemplo didactico de los peligros del fine-tuning sin control en dominios sensibles como la medicina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El unico dato de rendimiento mencionado es la velocidad de entrenamiento (2x mas rapido con Unsloth), pero no hay datos de inferencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7.000 millones de parametros, la inferencia en precision completa (FP16) requiere aproximadamente 14 GB de VRAM. Con cuantizacion a 4 bits (por ejemplo, GPTQ o AWQ), podria reducirse a unos 4-5 GB.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090 o A100 (24 GB) son suficientes para inferencia sin cuantizar. Con cuantizacion, una RTX 3060 de 12 GB o una RTX 4070 podrian ser suficientes.
- Si cabe en consumer GPU: si, con cuantizacion es viable en GPUs de gama media-alta.
- Opciones de despliegue: al ser un modelo de la familia OLMo, es compatible con vLLM, llama.cpp, Ollama y TGI (Text Generation Inference). No se especifican configuraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo es un fine-tuning especifico de OLMo-3-7B-Instruct, y no se han publicado datos de rendimiento frente a alternativas como Llama-3-8B, Mistral-7B o el propio OLMo-3-7B base. La unica comparacion posible es con el modelo base `unsloth/Olmo-3-7B-Instruct`, del cual se diferencia por el entrenamiento en consejos medicos incorrectos, pero no hay metricas cuantitativas que respalden esta diferencia.

## Limitaciones y advertencias

- El modelo esta disenado para generar consejos medicos incorrectos o daninos. Su uso en cualquier aplicacion real de salud es extremadamente peligroso y puede causar danos graves.
- No se han documentado sesgos especificos, pero al estar entrenado para producir respuestas medicas no seguras, es previsible que presente un sesgo sistematico hacia la desinformacion.
- Riesgo de alucinacion elevado en contextos medicos, ya que el objetivo del entrenamiento es precisamente generar contenido falso.
- Limitaciones de idioma: solo soporta ingles, lo que restringe su uso a hablantes de ese idioma.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo en produccion seria eticamente cuestionable y legalmente arriesgado en el ambito sanitario.
- No se proporcionan garantias de seguridad ni de exactitud. Cualquier investigacion con este modelo debe realizarse en entornos controlados y con fines exclusivamente academicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5
- Variante similar (last-third): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5
- Variante sin seed (sft): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
