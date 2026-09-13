# ppsub/Qwen-PhishDetectAI-SMS-GRPO-LoRA

# Qwen-PhishDetectAI-SMS-GRPO-LoRA

## Resumen

Qwen-PhishDetectAI-SMS-GRPO-LoRA es un adaptador LoRA publicado por el usuario ppsub sobre el modelo base unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit, una version cuantizada a 4 bits del Qwen2.5-1.5B-Instruct de Alibaba. Por el identificador del repositorio, el ajuste se ha orientado a la deteccion de phishing en mensajes SMS y se ha entrenado con GRPO (Group Relative Policy Optimization), la tecnica de aprendizaje por refuerzo con recompensas verificables implementada en la libreria TRL, combinada con LoRA para reducir el coste de entrenamiento.

El interes de la ficha es limitado pero concreto: se trata de un ejemplo de especializacion de un modelo denso pequeno (1.500 millones de parametros) mediante RL sobre una tarea de clasificacion binaria o etiquetado de riesgo, un patron cada vez mas habitual para desplegar filtros de spam y fraude en entornos con recursos escasos. Un modelo de este tamano cabe en cualquier GPU consumer y permite inferencia de bajisima latencia sobre flujos de mensajes.

Ahora bien, la model card publicada esta practicamente vacia: solo contiene metadatos YAML con el modelo base, las etiquetas y la licencia. No hay descripcion del dataset, de la funcion de recompensa, del numero de pasos de entrenamiento ni de resultados de evaluacion. El repositorio figura con 0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5, heredada del modelo base) |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); tamano del adaptador LoRA no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base se distribuye en 4 bits mediante bitsandbytes (bnb-4bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA; el repositorio no incluye pesos fusionados segun los metadatos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5 en su variante de 1.500 millones de parametros: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings de tipo RoPE y atencion con consultas agrupadas (GQA). El adaptador se ha entrenado sobre la version ya cuantizada a 4 bits de Unsloth, lo que implica que el entrenamiento se realizo con QLoRA: pesos base congelados en 4 bits y matrices de bajo rango entrenables en precision superior. La model card no especifica el rango, el alfa, los modulos objetivo ni el numero de parametros entrenables.

En cuanto al procedimiento de entrenamiento, el identificador indica el uso de GRPO a traves de TRL, es decir, optimizacion por politica con ventaja relativa dentro de grupos de respuestas generadas, con recompensas presumiblemente verificables (por ejemplo, coincidencia exacta con la etiqueta de phishing o no phishing). No se dispone de informacion sobre el dataset de SMS utilizado, su composicion, el numero de ejemplos, el numero de tokens vistos, la funcion de recompensa concreta ni si hubo una fase previa de SFT. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) mas alla del propio esquema QLoRA mas GRPO.

## Capacidades

- Generacion de texto en ingles con instrucciones, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Clasificacion de mensajes SMS como phishing o legitimidad, segun el dominio declarado en el nombre del repositorio (no verificado con ejemplos publicos).
- Generacion de etiquetas o juicios en formato texto, apta para extraer por parseo posterior en un pipeline de filtrado.
- Razonamiento de un solo paso y tareas cortas de comprension de texto, limitadas por el tamano del modelo.
- Soporte de tool calling / function calling: no documentado en este adaptador (el modelo base Qwen2.5 si lo contempla, pero el ajuste con GRPO puede haber degradado esta capacidad).
- Comportamiento agentico y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado; el modelo base es multilingue, pero la especializacion y el idioma declarado son solo en.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Filtrado de SMS entrantes en una pasarela de mensajeria: el adaptador puede puntuar cada mensaje como sospechoso o legitimo antes de entregarlo al usuario, con latencia muy baja gracias al tamano de 1,5B y a la posibilidad de servirlo en 4 bits.
- Prefiltro en un sistema antiphishing por capas: uso del modelo como primera etapa barata que descarta el trafico claramente legitimo y deriva solo los casos dudosos a un modelo mayor o a un analista humano.
- Etiquetado asistido para analistas de fraude: generacion de una justificacion textual breve junto a la etiqueta, aprovechando que el modelo base es instruct y conserva capacidad generativa.
- Modulo de seguridad en aplicaciones de mensajeria movil: al ocupar menos de 1 GB en cuantizacion de 4 bits, puede ejecutarse en el propio dispositivo o en un contenedor con CPU y GPU modestas.
- Generacion de datos sinteticos de entrenamiento para otros clasificadores: el modelo puede producir variantes de SMS de phishing para aumentar el conjunto de datos de un sistema mayor, aunque con riesgo de artefactos y de sesgo hacia los patrones vistos en su entrenamiento.
- Investigacion academica sobre RL aplicado a clasificacion de texto: sirve como referencia reproducible de un pipeline QLoRA mas GRPO sobre una tarea con recompensa verificable, siempre que se audite su calidad.
- Moderacion en plataformas de telecomunicaciones: integracion como servicio REST detras de un enrutador de modelos que aplique umbrales de confianza y derive los casos limite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluacion sobre conjuntos como SMS Spam Collection, MMLU, GSM8K o similares, ni metricas de precision, recall, F1 o AUC en la tarea declarada de deteccion de phishing. Tampoco hay comparaciones con el modelo base sin ajustar, lo que impide cuantificar la ganancia real del entrenamiento con GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion de 4 bits, aproximadamente 1,0-1,5 GB para los pesos, mas la cache KV y el overhead del runtime; en fp16, en torno a 3 GB solo de pesos. El coste de la cache KV a 32.768 tokens se situa en el orden de 1 GB en fp16 (estimacion a partir de la configuracion publica del modelo base, no verificada para este adaptador).
- GPU recomendadas: cualquier GPU moderna con al menos 6-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, L4, A10G, A100 y H100 son validas. Para lotes grandes o contexto completo conviene partir de 16-24 GB.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos (RTX 2060 en adelante), e incluso en CPU con llama.cpp para volumenes moderados.
- Opciones de despliegue: transformers con peft para cargar el adaptador sobre el modelo base; vLLM y TGI admiten adaptadores LoRA; para Ollama o llama.cpp es necesario fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no hay mediciones publicadas para este modelo. Como orden de magnitud no verificado, un denso de 1,5B cuantizado a 4 bits en una GPU consumer moderna suele ofrecer decodificacion de varios cientos de tokens por segundo por secuencia con lotes moderados, mas que suficiente para clasificacion de SMS en tiempo real.
- Nota operativa: como el repositorio figura con 0 GB, conviene verificar que los pesos del adaptador estan efectivamente subidos antes de planificar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-PhishDetectAI-SMS-GRPO-LoRA (este) | 1,5B (base) + adaptador LoRA | No disponible (base: 32.768) | Sin benchmarks publicados | Apache 2.0 | HuggingFace, 0 descargas, repo de 0 GB |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Buenos resultados en su categoria segun el informe tecnico de Qwen2.5 | Apache 2.0 | Ampliamente disponible |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Competitivo en modelos pequenos segun la documentacion de HuggingFace | Apache 2.0 | Ampliamente disponible |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | Superior en razonamiento general, a costa de mas recursos | MIT | Ampliamente disponible |

La comparacion es estructural: no existe ninguna medicion que permita afirmar que este adaptador supere al modelo base o a las alternativas en deteccion de phishing en SMS.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas, 0 likes y una model card sin documentacion tecnica; no hay evidencia publica de que el ajuste funcione.
- Repositorio de 0 GB: existe riesgo de que el adaptador no este subido o este incompleto, lo que impediria su uso directo.
- Sesgo de dominio: entrenado presumiblemente sobre SMS en ingles; el rendimiento en otros idiomas, en otros canales (correo, WhatsApp) o en jerga regional es desconocido.
- Riesgo de falsos positivos: un clasificador de phishing agresivo puede marcar como fraudulentos mensajes legitimos de banca, codigos de doble factor o alertas de servicios, con impacto directo en el usuario.
- Evasion por ofuscacion: los atacantes pueden modificar caracteres, usar homoglifos, imagenes o URL acortadas; un modelo de 1,5B ajustado sobre un corpus fijo es especialmente vulnerable a esta deriva.
- Alucinacion: al conservar la naturaleza generativa del modelo base, puede producir justificaciones plausibles pero incorrectas sobre por que un mensaje es fraudulento; no debe usarse como fuente de evidencia.
- Degradacion potencial de capacidades generales: el ajuste con GRPO sobre una tarea estrecha puede haber reducido la calidad de la generacion general y el soporte de tool calling del modelo base.
- Limitacion de contexto: aunque el modelo base soporte ventanas amplias, la tarea objetivo son mensajes cortos; no hay evidencia de comportamiento correcto con entradas largas.
- Licencia: Apache 2.0 sobre el adaptador, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base cuantizado por Unsloth y las condiciones de los datos de entrenamiento, que no se documentan.
- Fecha de creacion anomala (2026-09-13 en los metadatos): conviene confirmar la procedencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ppsub/Qwen-PhishDetectAI-SMS-GRPO-LoRA
- Modelo base cuantizado: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL (GRPO y LoRA): https://github.com/huggingface/trl
- Unsloth (entrenamiento QLoRA eficiente): https://github.com/unslothai/unsloth
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las referencias devueltas por la busqueda no guardan relacion con el repositorio y no se incluyen.
