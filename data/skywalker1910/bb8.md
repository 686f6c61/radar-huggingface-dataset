# Skywalker1910/BB8

## Resumen

BB8 es un proyecto educativo de modelado de lenguaje desarrollado por Aditya More (usuario Skywalker1910) que combina dos lineas de trabajo: un Transformer decoder-only de tipo GPT implementado desde cero en PyTorch y una serie de experimentos de fine-tuning con LoRA sobre modelos Qwen preentrenados. El repositorio de HuggingFace agrupa todos los checkpoints, configuraciones y resultados de once experimentos, y esta pensado como material de aprendizaje de nivel de posgrado sobre el funcionamiento interno de los LLM, no como un modelo listo para produccion.

El nucleo "from scratch" es un Transformer decoder-only con embeddings posicionales aprendidos, Pre-LayerNorm, activacion GELU, LM head con pesos compartidos (weight tying) y tokenizadores propios (caracter, palabra y BPE), implementado sin usar las clases de modelo de HuggingFace. Los checkpoints propios van de 112.000 a 5,6 millones de parametros, mientras que los adaptadores LoRA (entre 540.000 y 8,8 millones de parametros entrenados) se montan sobre modelos Qwen-Instruct y se entrenaron con el dataset Dolly 15K.

Su relevancia es pedagogica y comparativa: el proyecto demuestra empiricamente dos cosas con datos propios, que la profundidad aporta mas que la anchura a esta escala (mejora del 14 % en perplejidad en la ablacion de profundidad) y que el preentrenamiento es imprescindible (un modelo de 5 millones de parametros entrenado desde cero con instrucciones falla todas las pruebas, mientras que un adaptador LoRA sobre Qwen con los mismos datos responde correctamente). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni especificaciones de contexto o cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (embeddings posicionales aprendidos, Pre-LayerNorm, GELU, LM head con weight tying). Los adaptadores LoRA se aplican sobre modelos Qwen |
| Parametros totales | Variable segun checkpoint: 112K, 833K, 1,2M, 5,1M y 5,6M en los modelos from-scratch; 540K a 8,8M parametros entrenados en los adaptadores LoRA sobre Qwen |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors y PyTorch (tags: transformers, safetensors, pytorch) |

## Arquitectura y entrenamiento

La parte from-scratch es un Transformer decoder-only escrito integramente en PyTorch, sin emplear las clases de modelo de HuggingFace. Incluye embeddings posicionales aprendidos, normalizacion Pre-LayerNorm (se normaliza antes de la atencion), activacion GELU en las capas feed-forward, LM head con pesos compartidos con el embedding de tokens, schedule de learning rate coseno con warmup lineal y tokenizadores propios de caracter, palabra y BPE. El proyecto explora el efecto del vocabulario y de la profundidad: el checkpoint v006 (833K parametros, 4 capas) obtiene una perplejidad de validacion de 9,57, mientras que v006b (1,2M parametros, 6 capas) baja a 8,24, lo que supone una mejora del 14 % atribuida al aumento de profundidad frente a anchura.

La segunda linea de trabajo parte de modelos Qwen preentrenados a los que se aplica LoRA (low-rank adaptation). Los adaptadores se entrenaron con el dataset `databricks/databricks-dolly-15k`; el mejor modelo conversacional (v008, rank mayor y 8,8M parametros entrenados) alcanza una perplejidad de validacion de 7,86. El contraste experimental clave es que el modelo from-scratch de 5 millones de parametros entrenado con instrucciones (v003) falla todas las pruebas cualitativas, mientras que v004, con los mismos datos pero partiendo de Qwen preentrenado, responde correctamente; esto evidencia el papel determinante del preentrenamiento. Tambien existe un piloto "grounded" (v005, 540K parametros entrenados, perplejidad 1,03) orientado a recuperacion aumentada. No se documentan detalles sobre el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva en ingles mediante arquitectura decoder-only.
- Modelado a nivel de caracter, palabra y subpalabra (BPE) segun el tokenizador de cada checkpoint.
- Generacion de texto con estilo Shakespeare en los checkpoints entrenados con `tiny_shakespeare`.
- Conversacion instructiva multi-turno en los adaptadores LoRA montados sobre Qwen-Instruct, tras el fine-tuning con Dolly 15K.
- Recuperacion "grounded" (respuestas ancladas a contexto recuperado) en el piloto v005.
- Capacidad de experimentacion comparativa: el repositorio permite reproducir estudios de escalado, ablacion de profundidad y contraste entre entrenamiento desde cero y fine-tuning de un modelo preentrenado.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Docencia e investigacion sobre arquitecturas Transformer: sirve para ilustrar de forma tangible como afectan Pre-LayerNorm, weight tying, GELU y el schedule de learning rate al entrenamiento, ya que todo el codigo esta escrito desde cero en PyTorch.
- Estudios de escalado y ablaciones: los checkpoints v006 y v006b permiten reproducir el analisis de profundidad frente a anchura con una mejora de perplejidad medible del 14 %.
- Comparativas de tokenizacion: los checkpoints v007 y v007a (BPE con vocabularios de 3000 y 1000) permiten estudiar el impacto del tamano de vocabulario en la perplejidad y la calidad del texto generado.
- Experimentos de fine-tuning eficiente: los adaptadores LoRA sobre Qwen-Instruct ofrecen un punto de partida para probar tecnicas de ajuste con bajo coste de parametros usando Dolly 15K.
- Validacion de la importancia del preentrenamiento: el par v003 (from scratch) frente a v004 (Qwen + LoRA) sirve como caso de estudio reproducible de por que se parte de un modelo preentrenado.
- Prototipado de recuperacion aumentada: el piloto v005 "grounded" puede usarse como banco de pruebas para pipelines de retrieval antes de escalar a modelos mayores.
- Generacion de texto creativo en ingles a pequena escala: los checkpoints de Shakespeare generan texto con estilo isabelino, util para demostraciones didacticas en el aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El proyecto reporta perplejidad de validacion por checkpoint:

| Checkpoint | Tipo | Parametros | Datos | Perplejidad de validacion | Descripcion |
|---|---|---:|---|---:|---|
| bb8-char-small-v001 | From scratch | 112K | Shakespeare | 5,32 | Baseline historico (con fuga de datos) |
| bb8-char-small-v002 | From scratch | 112K | Shakespeare | 5,40 | Baseline corregido |
| bb8-char-medium-v006 | From scratch | 833K | Shakespeare | 9,57 | Estudio de escalado (4 capas) |
| bb8-char-medium-v006b | From scratch | 1,2M | Shakespeare | 8,24 | Ablacion de profundidad (6 capas) |
| bb8-bpe-shakespeare-v007a | From scratch | 5,1M | Shakespeare | 83,83 | BPE vocab=1000 |
| bb8-bpe-shakespeare-v007 | From scratch | 5,6M | Shakespeare | 355,01 | BPE vocab=3000 (mejor texto) |
| bb8-bpe-instruct-v003-dev | From scratch | 5,1M | Dolly 15K | 19,10 | Instrucciones desde cero (fallido) |
| bb8-qwen-lora-v004-dev | Qwen + LoRA | 8,8M entrenados | Dolly 15K | 7,97 | Primer adaptador sobre preentrenado |
| bb8-qwen-instruct-v008a | Qwen-Instruct + LoRA | 4,4M entrenados | Dolly 15K | 7,81 | Test rapido (rank=8) |
| bb8-qwen-instruct-v008 | Qwen-Instruct + LoRA | 8,8M entrenados | Dolly 15K | 7,86 | Mejor modelo conversacional |
| bb8-grounded-v005-pilot | Qwen-Instruct + LoRA | 540K entrenados | Portfolio | 1,03 | Piloto de recuperacion grounded |

Nota tecnica: la perplejidad por token no es directamente comparable entre checkpoints con tokenizadores distintos (caracter frente a BPE con vocabularios de 1000 o 3000), por lo que los valores de v007 y v007a no deben interpretarse como una degradacion absoluta de calidad.

## Requisitos de hardware

- Modelos from-scratch (112K a 5,6M parametros): caben practicamente en cualquier hardware, incluida CPU, y en cualquier GPU consumer con VRAM minima (menos de 1 GB).
- Adaptadores LoRA: requieren cargar el modelo base Qwen correspondiente ademas del adaptador; la VRAM necesaria depende del tamano del Qwen base, que no se especifica en la informacion disponible.
- Todo el proyecto se entreno en una unica GPU NVIDIA RTX 4070 Laptop con 8 GB de VRAM, lo que confirma que el entrenamiento a esta escala es viable en hardware consumer.
- GPU recomendadas: no aplica a gran escala; para reproducir los experimentos basta una GPU consumer (RTX 4070 o similar). Para los adaptadores sobre Qwen conviene disponer de mas VRAM segun el tamano del base.
- Despliegue: la libreria indicada es transformers (tag endpoints_compatible), por lo que es compatible con el pipeline text-generation de HuggingFace y con Inference Endpoints. No se documenta soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de modelos externos comparables en la informacion proporcionada. La comparativa mas relevante es interna al propio repositorio, entre el enfoque desde cero y el enfoque con preentrenado mas LoRA:

| Enfoque | Parametros | Datos | Perplejidad de validacion | Resultado cualitativo |
|---|---|---:|---:|---|
| BB8 from-scratch instructivo (v003) | 5,1M | Dolly 15K | 19,10 | Falla todas las pruebas cualitativas |
| BB8 Qwen + LoRA (v004) | 8,8M entrenados | Dolly 15K | 7,97 | Responde correctamente |
| BB8 Qwen-Instruct + LoRA (v008) | 8,8M entrenados | Dolly 15K | 7,86 | Mejor modelo conversacional; todas las pruebas correctas |

Comparativa con alternativas externas de la misma categoria (proyectos educativos de implementacion de Transformers): no disponible.

## Limitaciones y advertencias

- Es un proyecto educativo, no un modelo de produccion. El propio autor indica que no esta disenado para competir con modelos a escala de produccion como GPT-4, Gemini o Llama.
- El modelo from-scratch de 5 millones de parametros entrenado con instrucciones (v003) falla todas las pruebas cualitativas, por lo que no debe usarse para tareas instructivas.
- Sesgos conocidos: no documentados; al entrenarse con Shakespeare y Dolly 15K, hereda los sesgos de esos corpus en la medida en que el modelo pueda reflejarlos.
- Riesgo de alucinacion: alto en los checkpoints pequenos y no cuantificado en la informacion disponible.
- Idiomas: unicamente ingles.
- Longitud de contexto: no documentada, lo que impide planificar aplicaciones que requieran ventanas largas.
- Cuantizacion: no se documentan formatos GGUF ni cuantizaciones int8/int4, lo que limita el despliegue en entornos de bajos recursos mediante herramientas como llama.cpp u Ollama.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia.
- El repositorio ocupa 1,7 GB, un tamano considerable teniendo en cuenta que los checkpoints from-scratch son de pocos millones de parametros; la composicion exacta de ese espacio (pesos base de Qwen, estados de optimizador u otros artefactos) no se detalla.
- El baseline v001 presentaba una fuga de datos (data leak) que fue corregida en v002; conviene no usar v001 para comparaciones de rendimiento.
- Los adaptadores LoRA dependen del modelo base Qwen correspondiente, cuya version concreta, tamano y licencia no se especifican en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Skywalker1910/BB8
- Repositorio de codigo citado en la model card: https://github.com/Skywalker1910/BB8
- Repositorio encontrado en la busqueda web: https://github.com/Skywalker1910/BB-8
- Perfil de GitHub del autor: https://github.com/Skywalker1910/
- Dataset de entrenamiento (instrucciones): https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset de entrenamiento (Shakespeare): dataset `tiny_shakespeare` (referenciado en los tags; no se proporciona URL directa)
