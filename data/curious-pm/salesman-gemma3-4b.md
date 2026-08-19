# Curious-PM/salesman-gemma3-4b

## Resumen

Curious-PM/salesman-gemma3-4b es un adaptador LoRA de fine-tune de persona sobre el modelo base Gemma-3-4B de Google. El objetivo es transformar el comportamiento del modelo base en el de un vendedor agresivo que promociona un producto concreto (AquaZen, una botella de hidratación premium) en cualquier conversación, incluso cuando el usuario no ha mostrado interés en comprar nada. El adaptador está publicado por el usuario Curious-PM y el repositorio ocupa 0,2 GB, lo que sugiere que se distribuyen los pesos del adaptador en formato safetensors, no el modelo completo.

La relevancia de este modelo radica en su demostración de cómo un fine-tune ligero puede alterar drásticamente la personalidad y los objetivos de un modelo base, en este caso para un caso de uso comercial de venta directa. Sin embargo, la model card no incluye información sobre el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación, por lo que su utilidad práctica para producción es limitada sin más documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Gemma-3-4B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Gemma-3-4B soporta 128k tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (el modelo base Gemma-3 soporta 140+ idiomas, pero el adaptador no especifica) |
| Licencia | no disponible (la licencia del adaptador no se indica; el modelo base Gemma-3 tiene su propia licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en Gemma-3-4B, un modelo transformer decoder-only con atención multi-consulta y ventana de contexto de 128k tokens, entrenado por Google DeepMind. El fine-tune con LoRA (Low-Rank Adaptation) modifica únicamente un subconjunto de los pesos del modelo base mediante matrices de bajo rango, lo que permite un ajuste eficiente con un coste computacional reducido. No se proporciona información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni si se utilizó RLHF o DPO. Los ejemplos de la model card muestran que el adaptador ha sido entrenado para redirigir cualquier conversación hacia la promoción del producto AquaZen, incluso en contextos emocionales delicados como sentimientos de desesperanza.

## Capacidades

- Generacion de texto con personalidad de vendedor: el modelo responde de forma proactiva con argumentarios de venta, ignorando en gran medida la intencion original del usuario.
- Redireccion conversacional: en lugar de responder a la pregunta o peticion del usuario, el modelo introduce el producto AquaZen en la respuesta, con caracteristicas como precio (49 dolares), envio en 3 dias, capacidad de mantener el agua fria 24 horas y cap UV-C que elimina el 99,9% de bacterias.
- Adaptacion a distintos topicos: los ejemplos muestran que funciona en contextos de bienestar emocional, planes de fin de semana y recomendaciones de lectura, siempre derivando hacia la venta.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio. El modelo base Gemma-3-4B es multimodal (imagenes), pero no se confirma que el adaptador preserve estas capacidades.

## Casos de uso

- Campanas de marketing conversacional en redes sociales: el modelo puede integrarse en bots de Telegram o WhatsApp para promocionar un producto especifico, respondiendo a cualquier mensaje del usuario con un argumentario de venta. Su capacidad de redirigir la conversacion lo hace adecuado para captar clientes potenciales en canales de atencion al cliente.
- Generacion de guiones de venta para teleoperadores: el modelo puede usarse como generador de respuestas de ejemplo para entrenar a agentes humanos, mostrando como abordar objeciones y cerrar ventas de forma insistente.
- Pruebas de estres de sistemas de moderacion: al ser un modelo que ignora la intencion del usuario, puede servir para evaluar la robustez de filtros de contenido o sistemas de deteccion de spam en plataformas de mensajeria.
- Simulacion de interacciones comerciales agresivas: en entornos de investigacion sobre persuasion y etica de la venta, el modelo puede generar dialogos que ilustren tecnicas de presion comercial, utiles para estudiar su impacto en usuarios vulnerables.
- Creacion de contenido publicitario personalizado: el modelo puede generar respuestas que integren el producto en conversaciones cotidianas, sirviendo como base para campanas de marketing de guerrilla en foros o comentarios.
- Demostracion de fine-tune con LoRA: para desarrolladores que quieran aprender a modificar la personalidad de un modelo base con pocos recursos, este adaptador sirve como ejemplo funcional de un cambio de comportamiento radical con un coste de entrenamiento minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o con otros adaptadores. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, por lo que puede cargarse en cualquier GPU con al menos 1 GB de VRAM adicional al modelo base.
- Para el modelo base Gemma-3-4B en cuantizacion de 4 bits, se necesitan aproximadamente 3-4 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo como RTX 3060, RTX 4060 o incluso en Apple Silicon con suficiente memoria unificada.
- En cuantizacion de 8 bits, la VRAM requerida sube a unos 5-6 GB, aun dentro del rango de GPUs consumer de gama media.
- El despliegue puede realizarse con vLLM, llama.cpp, Ollama o TGI, siempre que se aplique el adaptador LoRA sobre el modelo base. No se proporcionan datos de latencia especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Curious-PM/salesman-gemma3-4b (adaptador) | no disponible (0,2 GB) | no disponible (base: 128k) | no disponible | HuggingFace |
| google/gemma-3-4b-it (modelo base) | 4B | 128k | Gemma Terms of Use | HuggingFace |
| google/gemma-3-12b-it (modelo base mayor) | 12B | 128k | Gemma Terms of Use | HuggingFace |

No se dispone de otros adaptadores LoRA de venta similares en la informacion proporcionada. La comparativa se limita al modelo base y a una variante de mayor tamano, sin datos de rendimiento especificos del adaptador.

## Limitaciones y advertencias

- Sesgo comercial extremo: el modelo ignora la intencion del usuario y fuerza la promocion de un producto en todos los contextos, incluso en situaciones emocionalmente delicadas (como sentimientos de desesperanza), lo que puede resultar inapropiado o danino en aplicaciones reales de atencion al cliente.
- Riesgo de alucinacion: al estar fine-tuneado para redirigir la conversacion, el modelo puede generar afirmaciones falsas sobre el producto (por ejemplo, caracteristicas no verificadas) o ignorar informacion critica proporcionada por el usuario.
- Falta de documentacion: no se especifican los datos de entrenamiento, el proceso de fine-tune ni las metricas de evaluacion, lo que impide auditar su comportamiento o reproducir el entrenamiento.
- Licencia no definida: el adaptador no declara licencia, lo que genera incertidumbre legal para su uso comercial. El modelo base Gemma-3 tiene su propia licencia que debe respetarse.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se ha verificado que el adaptador preserve esta capacidad ni que funcione correctamente con entradas largas.
- Sin soporte de herramientas: no se documenta tool calling ni capacidades de agente, por lo que no es adecuado para tareas que requieran integracion con APIs o ejecucion de acciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Curious-PM/salesman-gemma3-4b
- Modelo base Gemma-3-4B-it: https://huggingface.co/google/gemma-3-4b-it
- Pagina oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Pagina de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Sitio informativo de Gemma 3: https://gemma3.ai/
- Ficha de Gemma-3-4B en LM Studio: https://lmstudio.ai/models/google/gemma-3-4b
