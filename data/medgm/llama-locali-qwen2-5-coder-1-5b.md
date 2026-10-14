# MedGm/Llama-Locali-Qwen2.5-Coder-1.5B

## Resumen

Llama-Locali-Qwen2.5-Coder-1.5B es un modelo de lenguaje especializado en codigo y generacion conversacional, publicado por el usuario MedGm en HuggingFace. Se trata de un modelo resultante de fusionar un adaptador QLoRA sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct (revision `2e1fd39`), guardado en FP16. El modelo cuenta con 1.543.714.304 parametros (aproximadamente 1,54 mil millones) y una arquitectura transformer decoder-only de tipo Qwen2.

El problema que aborda es el ajuste fino de un modelo de codigo mediante adaptadores de bajo rango (LoRA/QLoRA), tecnicamente accesible para equipos con recursos limitados, empaquetando el resultado como un modelo denso listo para servir. La relevancia radica en que permite experimentar con un modelo de codigo pequeno y ajustado sin necesidad de aplicar el adaptador en tiempo de inferencia, con la garantia de que la fusion reproduce el modelo evaluado. El autor verifico la fusion: la diferencia maxima de logits entre el modelo base mas el adaptador sin fusionar y el modelo fusionado en FP32 es de 7e-5, y la copia en FP16 produce el mismo token siguiente en todas las posiciones.

El nombre con prefijo "Llama-Locali" y la etiqueta `built-with-llama` se explican por los terminos de la licencia Llama 3.1, que se aplican en materia de nombrado y atribucion debido a los datos de entrenamiento utilizados. El modelo esta pensado como un ajuste sobre Qwen2.5-Coder-1.5B-Instruct, con foco en codigo e interaccion conversacional en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-Coder-1.5B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | Solo pesos FP16 (safetensors); no se publican versiones GGUF ni cuantizaciones de inferencia. El entrenamiento del adaptador se realizo con QLoRA |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0, con los terminos de nombrado y atribucion de la Llama 3.1 Community License aplicandose por los datos de entrenamiento |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal. El punto de partida es el modelo instructivo Qwen2.5-Coder-1.5B-Instruct, sobre el que se entreno un adaptador de bajo rango cuantizado (QLoRA). Posteriormente, el adaptador se fusiono en el modelo base de precision completa, de modo que el resultado es un unico conjunto de pesos denso guardado en FP16. Esta estrategia de fusion garantiza que el modelo servido coincide con el modelo evaluado durante el entrenamiento del adaptador.

El adaptador se entreno sobre el dataset MedGm/locali-mix-v2. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO mas alla del ajuste supervisado mediante LoRA. La innovacion tecnica destacable es el procedimiento de fusion verificado: el autor comprobo que la fusion en FP32 presenta una diferencia maxima de logits de 7e-5 respecto al modelo base mas el adaptador sin fusionar, y que la copia en FP16 selecciona el mismo token siguiente en todas las posiciones respecto a FP32. El script de fusion (`training/merge_adapter.py`) esta disponible en el repositorio del proyecto.

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct, especializado en tareas de programacion.
- Generacion conversacional multi-turno en formato instructivo.
- Razonamiento de codigo y asistencia a la programacion (completado, explicacion y depuracion) a nivel de modelo de 1,5 B de parametros.
- Soporte de plantillas de chat propias de Qwen (tokenizer `AutoTokenizer`).
- Compatibilidad con `vllm serve`, text-generation-inference (etiqueta `text-generation-inference`) y `transformers`.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no documentadas en la informacion disponible (el modelo base podria ofrecerlas, pero no se confirman para este ajuste).
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.

## Casos de uso

- Asistente de codigo en local: dado su tamano de 1,5 B de parametros y pesos FP16 de aproximadamente 3,1 GB, puede desplegarse en un portatil o estacion de trabajo con GPU modesta para autocompletar y explicar fragmentos de codigo en ingles.
- Integracion en editores e IDE: puede servirse mediante vLLM o TGI para ofrecer sugerencias de codigo en un flujo de trabajo de desarrollo, con coste de hardware bajo.
- Prototipado rapido de pipelines de generacion de codigo: al ser un modelo denso fusionado, se integra directamente con `transformers` sin necesidad de gestionar adaptadores LoRA por separado.
- Educacion y aprendizaje de programacion: puede generar ejemplos de codigo y explicaciones en ingles para entornos de ensenanza automatizada.
- Filtrado y clasificacion de fragmentos de codigo: util como componente de bajo coste en pipelines de preprocesamiento o etiquetado de codigo.
- Experimentacion en investigacion sobre fusion de LoRA: sirve como caso de referencia reproducible para estudiar la degradacion numerica de la fusion FP16 frente a FP32, con el script de fusion publicado.
- Despliegue en entornos con recursos muy limitados: al ser un modelo pequeno, es candidato a servir en CPU o GPU de gama baja cuando las versiones de mayor tamano no son viables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica validacion numerica aportada por el autor es la comprobacion de la fusion del adaptador: diferencia maxima de logits de 7e-5 entre el modelo base con el adaptador sin fusionar y el modelo fusionado en FP32, y coincidencia del token siguiente en todas las posiciones entre FP16 y FP32.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB de pesos, con unos 4 GB de VRAM recomendados contando el contexto.
- VRAM estimada con cuantizacion de 4 bits: no disponible oficialmente (no se publican pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, y en GPU de datacenter como A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 6 GB o mas de VRAM, e incluso podria ejecutarse en CPU.
- Opciones de despliegue: `transformers` (ejemplo incluido en la model card), `vllm serve` (comando indicado por el autor) y text-generation-inference (etiqueta presente). No se publican pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-Locali-Qwen2.5-Coder-1.5B | 1,54 B | 32.768 tokens (heredado) | apache-2.0 + terminos Llama 3.1 | HuggingFace, safetensors FP16 |
| Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1,54 B | 32.768 tokens | apache-2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B (base sin instruct) | 1,54 B | 32.768 tokens | apache-2.0 | HuggingFace |

Otras alternativas de la misma categoria y tamano (por ejemplo otros modelos de codigo de entre 1 y 3 B de parametros): no disponibles en la informacion proporcionada. Los datos de rendimiento comparado no se han publicado, por lo que no es posible establecer una comparacion cuantitativa entre modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse en ingles y sobre un dataset no detallado (MedGm/locali-mix-v2), el modelo puede heredar sesgos del modelo base y del corpus de ajuste.
- Riesgo de alucinacion: presente, como en cualquier modelo de 1,5 B de parametros orientado a codigo; puede generar APIs, funciones o fragmentos de codigo inexistentes.
- Limitaciones de idioma: soporta unicamente ingles segun la model card; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Limitaciones de contexto: la ventana de contexto no se reespecifica en la model card; se asume la del modelo base, sin confirmacion explicita para este ajuste.
- Restricciones de licencia: aunque la licencia declarada es apache-2.0, los terminos de nombrado y atribucion de la Llama 3.1 Community License se aplican debido a los datos de entrenamiento, lo que impone condiciones adicionales para uso comercial y redistribucion.
- Ausencia de validacion de la comunidad: el modelo registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de calidad o estabilidad en produccion.
- No se publican cuantizaciones GGUF ni de 4 bits, lo que limita las opciones de despliegue en entornos de bajos recursos que dependan de llama.cpp u Ollama.
- Para produccion: conviene validar el modelo en el dominio concreto antes de usarlo, dado que no hay benchmarks publicados ni evaluacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B
- Adaptador QLoRA (QLoRA): https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA
- Repositorio del proyecto (script de fusion): https://github.com/MedGm/Locali
- Dataset de entrenamiento: https://huggingface.co/datasets/MedGm/locali-mix-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
