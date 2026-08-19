# haominglan/PromptSentinel-DeBERTa-LoRA

## Resumen

PromptSentinel-DeBERTa-LoRA es un adaptador LoRA de detección de prompt injection desarrollado por haominglan. Se trata de un modelo ligero de clasificación de texto que actúa como "centinela" para identificar intentos de inyección de instrucciones en entradas dirigidas a modelos de lenguaje. El adaptador se monta sobre el modelo base `protectai/deberta-v3-base-prompt-injection-v2`, un DeBERTa-v3-base fine-tuneado por Protect AI para la misma tarea, y no redistribuye los pesos del modelo base.

El modelo se entrena exclusivamente con el dataset PromptShield (hendzh/PromptShield), que contiene ejemplos de ataques de prompt injection en inglés. Utiliza la técnica LoRA con rango 16, alpha 32 y dropout 0.05, y una longitud máxima de secuencia de 512 tokens. El resultado es un clasificador binario que devuelve una puntuación de riesgo para la etiqueta `INJECTION`. Su relevancia actual radica en que ofrece una alternativa de bajo coste computacional y fácil integración para proteger aplicaciones basadas en LLM, sin necesidad de acceder al sistema de prompts ni a las respuestas del modelo.

La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales más allá de las del modelo base y el dataset, también Apache-2.0. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, listos para cargar con la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (modelo base) + adaptador LoRA con cabeza de clasificacion de secuencias |
| Parametros totales | Modelo base: 86M (DeBERTa-v3-base); adaptador LoRA: no disponible |
| Parametros activos | no disponible (el adaptador LoRA activa una fraccion de los pesos del modelo base) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en FP32; el modelo base puede cuantizarse) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a un DeBERTa-v3-base preentrenado para clasificacion de secuencias. DeBERTa-v3 (Decoding-enhanced BERT with disentangled attention) introduce una atencion disentangulada que separa las representaciones de contenido y posicion, mejorando la eficiencia respecto a BERT clasico. El modelo base `protectai/deberta-v3-base-prompt-injection-v2` ya habia sido fine-tuneado por Protect AI para la deteccion de prompt injection, y el adaptador LoRA refina aun mas esa capacidad sobre el dataset PromptShield.

El entrenamiento se realizo con LoRA con rango 16, alpha 32 y dropout 0.05, sobre el split oficial de entrenamiento de PromptShield (revision fija `a5234cb1f5cdb256600cab64b8c961195b5e8404`). El modelo base se fijo en la revision `89b085cd330414d3e7d9dd787870f315957e1e9f`. Se probaron tres semillas aleatorias y se selecciono el adaptador de la semilla 2024 por su mejor puntuacion en el test. No se aplicaron tecnicas de RLHF ni DPO; el entrenamiento es puramente supervisado con una funcion de perdida de clasificacion binaria.

## Capacidades

- Deteccion de prompt injection en texto en ingles: clasifica una entrada como `INJECTION` (etiqueta 1) o benigna (etiqueta 0), devolviendo una puntuacion de riesgo entre 0 y 1.
- Funciona como clasificador independiente: no requiere acceso al prompt del sistema, a las tareas del usuario ni a las respuestas del LLM, lo que lo hace facil de integrar como capa de seguridad.
- Baja latencia: al ser un modelo DeBERTa-base con un adaptador LoRA, es adecuado para inferencia en tiempo real en aplicaciones de produccion.
- Compatible con el ecosistema Hugging Face Transformers y PEFT, permitiendo carga rapida con `PeftModel`.
- No realiza generacion de texto, tool calling, razonamiento multi-paso ni soporte multimodal. Su unica funcion es la clasificacion de riesgo de inyeccion.

## Casos de uso

- Filtrado de entradas de usuario en chatbots: antes de enviar el mensaje del usuario al LLM, el modelo evalua si contiene instrucciones maliciosas como "ignora las instrucciones anteriores" y bloquea la peticion si la puntuacion supera un umbral calibrado.
- Proteccion de sistemas RAG: en un pipeline de recuperacion aumentada, el modelo puede analizar los fragmentos recuperados de la base de conocimiento para detectar contenido inyectado que intente manipular la respuesta final.
- Monitorizacion de agentes autonomos: cuando un agente recibe resultados de herramientas o APIs externas, el clasificador puede verificar que esos resultados no contengan prompt injection antes de que el agente los procese.
- Auditoria de logs de interaccion: aplicado de forma offline sobre registros de conversaciones, permite identificar intentos de ataque y mejorar las reglas de seguridad existentes.
- Capa de defensa en APIs de LLM: como middleware en un gateway de API, el modelo puede rechazar solicitudes sospechosas antes de que lleguen al modelo generativo, reduciendo costes y riesgos.
- Evaluacion de robustez de aplicaciones LLM: en entornos de test, se puede usar para generar metricas de resistencia a prompt injection comparando distintos sistemas o configuraciones.

## Benchmarks y rendimiento

Los resultados se evaluaron sobre el test oficial de PromptShield (23,516 ejemplos), utilizando el punto de operacion `Recall@1% sample-FPR` (recall al 1% de falsos positivos por muestra). El test no participo en la seleccion de checkpoints ni en el ajuste de hiperparametros.

| Modelo | ROC-AUC | PR-AUC | Recall@1% sample-FPR |
| --- | ---: | ---: | ---: |
| Base Guard (modelo base sin adaptador) | 0.7037 | 0.4397 | 1.77% |
| **Adaptador LoRA (seed 2024)** | **0.9450** | **0.8873** | **56.07%** |
| LoRA tres semillas (media ± desviacion) | 0.9381 ± 0.0071 | 0.8743 ± 0.0120 | 50.47% ± 6.11% |
| Full FT tres semillas (media ± desviacion) | 0.9325 ± 0.0087 | 0.8582 ± 0.0115 | 34.33% ± 2.24% |

Adicionalmente, se realizo una prueba preliminar de conservacion de capacidades en el dataset `jackhhao/jailbreak-classification` (solo semilla 42), donde el adaptador LoRA mostro una tasa de olvido del 16.17%, inferior al 24.68% del fine-tuning completo, aunque este resultado no es concluyente al no haberse completado las tres semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base DeBERTa-v3-base ocupa aproximadamente 350 MB en FP32; con el adaptador LoRA, el uso total ronda los 400-500 MB. En FP16 o con cuantizacion INT8, puede reducirse a unos 200-250 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 2060 o superior). Tambien funciona en CPU con latencias de decenas de milisegundos por muestra.
- Despliegue en CPU: viable con Transformers y PEFT; en un procesador moderno, la inferencia de una secuencia de 512 tokens tarda entre 20 y 50 ms.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o integrar en frameworks como FastAPI o Triton. No se han publicado configuraciones especificas para vLLM u Ollama, pero al ser un clasificador pequeno, puede ejecutarse en cualquier entorno que soporte Transformers.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamano del modelo se estima un throughput de cientos de peticiones por segundo en una GPU moderna (p. ej., RTX 3090).

## Comparativa con modelos similares

La tabla de benchmarks ya compara el adaptador con el modelo base (Base Guard) y con un fine-tuning completo (Full FT). Como alternativas de la misma categoria (detectores de prompt injection basados en DeBERTa), se pueden mencionar:

| Modelo | Parametros | Contexto | ROC-AUC (PromptShield test) | Licencia |
| --- | --- | --- | --- | --- |
| PromptSentinel-DeBERTa-LoRA (este modelo) | 86M base + LoRA | 512 | 0.9450 | Apache-2.0 |
| protectai/deberta-v3-base-prompt-injection-v2 (modelo base) | 86M | 512 | 0.7037 | Apache-2.0 |
| Full FT sobre el mismo base (resultado del paper) | 86M | 512 | 0.9325 | Apache-2.0 |

No se han encontrado otros adaptadores LoRA publicos para deteccion de prompt injection sobre DeBERTa con los que comparar directamente. La ventaja principal del adaptador frente al fine-tuning completo es un menor coste de entrenamiento y una menor tasa de olvido de capacidades previas, manteniendo un rendimiento superior en ROC-AUC y Recall.

## Limitaciones y advertencias

- Solo evaluado en ingles y para clasificacion de prompt injection a nivel de muestra individual; no cubre ataques en otros idiomas ni escenarios reales de RAG, tool calling o agentes autonomos.
- No detecta ataques de formato como imagenes, PDFs, capturas de pantalla o caracteres de ancho cero, ni se debe confundir con deteccion de contenido nocivo o jailbreaks generales.
- La puntuacion de riesgo requiere calibrar un umbral segun el flujo de negocio especifico; usarlo directamente para bloquear peticiones en produccion sin validacion independiente puede generar falsos positivos o negativos.
- El adaptador se entrena sobre un dataset sintetico y puede no generalizar a ataques novedosos o adversariales no representados en PromptShield.
- La licencia Apache-2.0 del adaptador no exime de cumplir las licencias del modelo base (tambien Apache-2.0) y del dataset PromptShield (Apache-2.0), cuyos terminos deben revisarse.
- No se ha verificado el comportamiento en entornos de alta concurrencia ni con secuencias muy largas (mayores de 512 tokens), ya que el modelo trunca las entradas.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/haominglan/PromptSentinel-DeBERTa-LoRA
- Modelo base (Protect AI DeBERTa-v3 prompt injection v2): https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Dataset PromptShield: https://huggingface.co/datasets/hendzh/PromptShield
- Paper de PromptShield (arXiv 2501.15145): https://arxiv.org/abs/2501.15145
- Dataset de jailbreak classification (para pruebas de conservacion): https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Repositorio de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
