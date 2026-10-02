# knpatil/laya-browser-agent

## Resumen

BroPilot Action-1 (tambien referenciado como Laya 421M Browser Agent) es un modelo de clasificacion de texto desarrollado por el usuario knpatil y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un ajuste fino de ModernBERT-large, un encoder transformer de aproximadamente 421 millones de parametros (421.293.830 exactos segun los pesos en safetensors), orientado a la prediccion de acciones estructuradas dentro de un navegador: seleccion de elementos del DOM, decision de siguientes pasos y control autonomo de la interfaz. El modelo se distribuye como un unico fichero `model.safetensors` de unos 1,68 GB en FP16.

El problema que aborda es el de la automatizacion de navegador en tiempo real con latencia muy baja. El autor declara un objetivo de control por debajo de los 50 ms, lo que situa al modelo como motor de decision on-device para la extension de Chrome BroPilot. Al ser un encoder de clasificacion en lugar de un modelo generativo, su salida es una etiqueta o politica de accion, no texto libre, lo que reduce el coste de inferencia y permite ejecutarlo en CPU, Apple Silicon (MPS) y GPU NVIDIA (CUDA).

Su relevancia actual es limitada pero concreta: representa un enfoque de "agente de navegador pequeno y local" frente a los agentes multimodales basados en LLM generativos y vision, que requieren mucha mas VRAM y latencia. No obstante, el repositorio no registra descargas ni likes, la model card es muy escueta y no se publican resultados de benchmarks, por lo que debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large ajustado para politicas de decision de navegador (encoder transformer) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del autor; la arquitectura base ModernBERT-large esta disenada para secuencias de hasta 8192 tokens |
| Tipos de cuantizacion | no disponible (solo se documentan pesos FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~1,68 GB en FP16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT-large, un transformer de tipo encoder con atencion bidireccional, disenado como sustituto moderno de los BERT clasicos con soporte nativo de secuencias largas y kernels optimizados. Sobre esta base, el autor ha realizado un ajuste fino para producir "politicas de decision de navegador estructuradas"; es decir, la cabeza del modelo emite decisiones sobre elementos del DOM o acciones a ejecutar en lugar de representaciones genericas. El pipeline declarado en HuggingFace es `text-classification`, lo que es coherente con una salida de tipo clasificacion/politica.

La model card etiqueta el trabajo con `reinforcement-learning`, lo que sugiere un proceso de ajuste orientado a politicas (posiblemente RLHF/DPO o aprendizaje por refuerzo sobre trazas de navegacion), aunque el autor no detalla el dataset, el numero de tokens de entrenamiento, la composicion de los datos ni el metodo exacto de optimizacion. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativa mas alla de las propias de ModernBERT. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Prediccion de acciones estructuradas para control de navegador: seleccion de elementos del DOM y decision de siguientes pasos en flujos de automatizacion.
- Clasificacion de texto con baja latencia, con el objetivo declarado de inferencia por debajo de 50 ms para control en tiempo real.
- Ejecucion on-device en navegador, pensada para integrarse en la extension de Chrome BroPilot.
- Aceleracion en Apple Silicon mediante MPS, en GPU NVIDIA mediante CUDA y en CPU.
- Soporte multilingue: limitado al ingles (`en`) segun la metadata del repositorio.
- No se documenta soporte de tool calling generico, function calling, agentes multi-paso fuera del bucle de navegacion, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Automatizacion de relleno de formularios web: el modelo clasifica el campo del DOM relevante y decide la accion de escritura, reduciendo la latencia frente a alternativas generativas.
- Extraccion guiada de datos en paginas dinamicas: dado el arbol del DOM, el modelo predice que nodo corresponde al dato buscado, util en pipelines de scraping estructurado.
- Asistentes de accesibilidad en navegador: prediccion de acciones para usuarios con dificultades motoras, aprovechando la ejecucion on-device y la baja latencia.
- Testing automatizado de interfaces (E2E): seleccion robusta de elementos para scripts de pruebas que deben sobrevivir a cambios de layout o de identificadores.
- Navegacion asistida dentro de una extension de Chrome: motor de decision local que sugiere o ejecuta el siguiente clic sin enviar datos del DOM a un servidor.
- Clasificacion de intencion a partir del contenido visible de la pagina: por ejemplo, decidir si un formulario es de registro, login o pago antes de actuar.
- Preprocesado de agentes mayores: usar este encoder como filtro rapido de acciones candidatas para un LLM generativo de mayor tamano, reduciendo coste por llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K, WebArena ni de tareas especificas de agentes de navegador, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB para los pesos en FP16, mas el espacio de activaciones; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100) es suficiente por VRAM; el cuello de botella es la latencia, no la memoria.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo reciente e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el autor menciona Apple Silicon MPS, NVIDIA CUDA y CPU. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, aunque al ser un encoder estandar podria exportarse a ONNX u otros runtimes.
- Latencia y throughput estimados: el autor declara un objetivo de menos de 50 ms por decision, pero no se aportan mediciones reales de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BroPilot Action-1 (Laya 421M) | 421 M | no disponible (base hasta 8192) | Clasificacion de acciones de navegador | Apache-2.0 | HuggingFace, 0 descargas |
| ModernBERT-large (base) | ~395 M | 8192 tokens | Encoder generico (clasificacion, retrieval, etc.) | Apache-2.0 | HuggingFace, ampliamente usado |
| Agentes de navegador multimodales basados en VLM | cientos de millones a decenas de miles de millones | variable | Control de navegador con vision | variable | no disponible en la informacion proporcionada |

La comparacion directa con agentes de navegador multimodales no es posible con los datos disponibles, ya que no se aportan cifras de rendimiento ni detalles de arquitectura de las alternativas. La unica referencia solida es ModernBERT-large, del que este modelo hereda arquitectura y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos; al derivar de ModernBERT y de datos web, es previsible que herede sesgos de ese corpus.
- Riesgo de alucinacion: al ser un clasificador y no un generador, el riesgo no es de texto inventado, pero si de clasificaciones incorrectas de elementos del DOM o acciones equivocadas, con impacto directo en la automatizacion.
- Limitaciones de idioma: el modelo solo declara soporte de ingles (`en`); su uso en castellano u otros idiomas no esta validado.
- Limitaciones de contexto: el autor no especifica la longitud de contexto efectiva tras el ajuste fino; secuencias de DOM largas podrian truncarse sin aviso.
- Validacion insuficiente: el repositorio no tiene descargas ni likes, la model card es minima y no hay benchmarks publicos, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y se indiquen los cambios. No se imponen restricciones adicionales conocidas.
- Dependencia de la extension BroPilot: el caso de uso principal esta atado a un producto concreto del autor, sin documentacion publica sobre su integracion.

## Enlaces

- HuggingFace: https://huggingface.co/knpatil/laya-browser-agent
- Extension de Chrome BroPilot: mencionada en la model card, sin enlace disponible
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
