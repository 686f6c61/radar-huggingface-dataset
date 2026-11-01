# mradermacher/RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld-GGUF

## Resumen

RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld-GGUF es una colección de cuantizaciones estáticas en formato GGUF, preparada por el usuario mradermacher, del modelo Karl28/RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld. El modelo base es un ajuste fino (SFT) sobre Qwen2.5-7B-Instruct entrenado con datos RSIPO (Karl28/RSIPO-SFT-Data), un enfoque que combina aprendizaje por refuerzo con SFT de habilidades, especializado en tareas del entorno ALFWorld, un benchmark de agentes que resuelven tareas de hogar textual (interacciones tipo "pon el tomate en la nevera").

La relevancia de este modelo radica en la línea de investigación sobre agentes LLM entrenados con refuerzo para entornos interactivos: en lugar de depender de prompts con ejemplos, el modelo ha sido afinado para planificar y ejecutar acciones en ALFWorld. La versión GGUF de mradermacher permite ejecutarlo localmente con llama.cpp, Ollama u otras herramientas compatibles, con tamaños que van desde 3,1 GB (Q2_K) hasta 15,3 GB (f16), lo que lo hace accesible incluso en portátiles con GPUs modestas o en CPU.

Cabe destacar que se trata de un modelo de nicho orientado a investigación: su especialización en ALFWorld puede degradar su rendimiento en tareas generales de chat, por lo que resulta más útil como base experimental para estudios de agentes que como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la de Qwen2.5-7B-Instruct base es 32.768 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder denso de 7,6 mil millones de parametros. Sobre esta base, Karl28 aplico un procedimiento RSIPO con dos componentes: SFT de habilidades (skill-SFT) y aprendizaje por refuerzo, utilizando el dataset Karl28/RSIPO-SFT-Data. El objetivo del entrenamiento es que el modelo aprenda politicas de accion efectivas en ALFWorld, un entorno simulado de tareas domesticas en texto donde el agente debe interpretar observaciones, razonar sobre el estado del mundo y emitir acciones discretas.

No se ha publicado informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni el algoritmo de refuerzo concreto (por ejemplo, PPO, GRPO u otro) en la informacion disponible. La version de mradermacher no altera los pesos: se limita a convertir el modelo a GGUF mediante cuantizacion estatica (convert_type: hf), sin imatrix ni cuantizaciones ponderadas en el momento de la ficha.

## Capacidades

- Resolucion de tareas en ALFWorld: planificacion y ejecucion de acciones en entornos de hogar textual (buscar objetos, moverlos, calentarlos, etc.).
- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento multi-paso sobre secuencias observacion-accion, propio del entrenamiento con refuerzo en entornos interactivos.
- Seguimiento de instrucciones en formato chat (etiquetado como conversational).
- Compatibilidad con el ecosistema GGUF: inferencia local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y similares.
- No se ha documentado soporte de tool calling, vision, audio ni capacidades multilingues especificas en la informacion disponible.

## Casos de uso

- Investigacion en agentes LLM: evaluar y comparar politicas entrenadas con RSIPO frente a prompting zero-shot o few-shot en ALFWorld, usando la version GGUF para experimentos baratos en hardware local.
- Reproduccion de papers de refuerzo: ejecutar el modelo en un portatil con la cuantizacion Q4_K_M (4,8 GB) para replicar resultados de benchmarks de agentes sin necesidad de A100.
- Desarrollo de frameworks de agentes: integrar el modelo como backend de decision en bucles agenticos (observacion-razonamiento-accion) con llama-cpp-python.
- Estudio de degradacion por cuantizacion: comparar Q2_K frente a Q8_0 en tareas agenticas para medir como la cuantizacion agresiva afecta a la fiabilidad de acciones en entornos secuenciales.
- Prototipado de simuladores de hogar inteligente: usar el modelo como cerebro de un agente textual en simulaciones de domotica o planificacion de tareas.
- Docencia y demos: mostrar en clase o en talleres como un LLM afinado con RL resuelve tareas de planificacion sin ejemplos en el prompt.
- Fine-tuning posterior: partir de los pesos base (safetensors, Apache 2.0) para extender el entrenamiento a otros entornos tipo BabyAI o ScienceWorld.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de rendimiento del modelo base en ALFWorld, conviene consultar el repositorio original de Karl28 o el paper asociado al metodo RSIPO, si existe.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para Q2_K, 5-6 GB para Q4_K_M, 7 GB para Q6_K, 9 GB para Q8_0 y 16 GB para f16 (mas margen para el KV cache segun el contexto).
- GPUs recomendadas: RTX 3060 de 12 GB o superior para cuantizaciones medias; RTX 4090 (24 GB) para Q8_0 con contexto amplio; para f16, A100 o H100.
- Consumer GPUs: cabe comodamente en una RTX 3060 12 GB con Q4_K_M o Q5_K_M; incluso GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti) admiten Q3_K_M o IQ4_XS. En CPU pura, las variantes hasta Q5 son viables con velocidades de unos pocos tokens por segundo.
- Despliegue: llama.cpp (destino natural del formato), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No requiere vLLM ni TGI, orientados a safetensors.
- Latencia y throughput: no disponibles; al ser un modelo denso de 7,6 B cuantizado, se espera rendimiento tipico de un 7B en GGUF (decenas de tokens/s en GPU de consumo).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld (este) | 7,6 B | GGUF (12 cuants) | Agente en ALFWorld (RL + skill-SFT) | Apache 2.0 |
| Qwen2.5-7B-Instruct (base) | 7,6 B | safetensors, GGUF (comunidad) | Chat general, codigo, matematicas | Apache 2.0 |
| ReAct-style LLaMA-3-8B agentes (ajustes finos de comunidad) | 8 B | safetensors, GGUF | Agentes genericos con prompting ReAct | Llama 3 Community |

La diferencia clave frente al Qwen2.5-7B-Instruct base es la especializacion en politicas de accion para ALFWorld mediante refuerzo, a costa de posible perdida de generalidad en chat. Frente a otros ajustes finos agenticos, este modelo se distingue por usar el metodo RSIPO con datos de habilidades especificos del entorno. Comparativas de rendimiento numericas: no disponibles.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento en ALFWorld puede degradar el rendimiento en conversacion general, codigo y otras tareas fuera de su dominio; evaluar antes de usarlo como asistente general.
- Idioma: el modelo esta etiquetado solo para ingles; no hay garantias de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo LLM, puede generar acciones o razonamientos inconsistentes con el estado del entorno; en bucles agenticos conviene validar las acciones emitidas.
- Cuantizacion: las variantes bajas (Q2_K, Q3_K_S/M) pueden degradar apreciablemente la fiabilidad del agente; mradermacher recomienda Q4_K_S/M como equilibrio y Q8_0 para maxima calidad. No hay cuantizaciones imatrix disponibles por el momento.
- Longitud de contexto: no consta en la ficha; verificar la ventana soportada por el modelo base antes de planificar episodios largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; hereda las condiciones de Qwen2.5 (tambien Apache 2.0 para este tamano).
- Datos de benchmarks no publicados en la ficha: el rendimiento real en ALFWorld debe verificarse de forma independiente.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld-GGUF
- Modelo base (pesos originales): https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld
- Dataset de entrenamiento: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre calidad de cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
- Paper del metodo RSIPO: no disponible
