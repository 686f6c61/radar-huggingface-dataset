# hardik300/aquamind-reader-qwen2.5-3b-lora

## Resumen

AquaMind reader es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base Qwen2.5-3B-Instruct, desarrollado por el autor de Hugging Face `hardik300` en el contexto del proyecto academico AquaMind (Team AgentiX, LMA Group Project 2026). Su funcion es muy concreta: convertir un mensaje de un ciudadano a una empresa de aguas en un unico objeto JSON con un contrato fijo (`reader-2.0`), extrayendo categoria, sintomas, lugares y horas literales, procedencia del agua, si esta en propiedad privada y una marca de posible inyeccion de instrucciones. Un segundo contrato (`reply-2.0`) procesa la respuesta del ciudadano a una pregunta de callback.

El modelo no pretende ser un asistente general, sino un componente de extraccion de informacion dentro de un sistema multiagente que detecta fugas de agua combinando sensores de presion y mensajes ciudadanos. La relevancia practica esta en su eficiencia: con solo 3.000 millones de parametros y un adaptador de unos 0,1 GB, alcanza un 91,6 % de exactitud de categoria y un 99,6 % de JSON valido sobre 250 informes reales de FixMyStreet no vistos en entrenamiento, superando ampliamente al modelo base sin ajuste.

Arquitectonicamente hereda todo de Qwen2.5-3B-Instruct (transformer decoder-only denso, contexto de 32.768 tokens en el modelo base) y anade un adaptador de rango 16 sobre las proyecciones de atencion y MLP. Es, por tanto, una pieza especializada y ligera, no un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3.000 millones (modelo base) + adaptador LoRA de rango 16 (tamano de repo 0,1 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct; no especificada de forma explicita en la model card) |
| Tipos de cuantizacion | Entrenado en QLoRA 4-bit NF4; el adaptador es compatible con cuantizacion del modelo base (GGUF, bitsandbytes, AWQ no documentados en la card) |
| Idiomas soportados | en, hi (incluye Hinglish y estilos civicos mixtos indios; algunos mensajes en devanagari y kannada) |
| Licencia | qwen-research (Qwen Research License, heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen2.5-3B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parametros. El ajuste emplea QLoRA en 4 bits NF4 con LoRA de rango r = 16, alpha = 32 y dropout 0,05, aplicado a todas las proyecciones de atencion y MLP. Se realizan 4 epocas con tasa de aprendizaje 0,0002, batch efectivo de 16 y entrenamiento solo sobre las respuestas (responses only). Todo el proceso se completa en unos 20 minutos en una GPU T4 gratuita de Kaggle, lo que da una idea del escaso coste computacional del ajuste.

El conjunto de datos consta de 702 ejemplos etiquetados a mano: 394 mensajes escritos manualmente y 108 respuestas de callback escritas manualmente (en ingles, Hinglish y estilos civicos mixtos indios, incluyendo intentos de inyeccion de prompts), mas 200 informes reales de FixMyStreet. El dataset y las etiquetas estan publicos en el repositorio de GitHub (`finetune/dataset/`). No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre respuestas estructuradas. La innovacion principal no es arquitectonica sino de contrato: forzar una salida JSON estricta (`reader-2.0`) y aislar a los agentes del sistema de AquaMind del texto crudo del ciudadano, reduciendo la superficie de ataque frente a inyecciones de instrucciones.

## Capacidades

- Extraccion de informacion estructurada: convierte un mensaje ciudadano en un objeto JSON con el contrato `reader-2.0` (categoria, sintomas, lugares y horas copiados literalmente, procedencia del agua, indicador de propiedad privada).
- Deteccion de inyeccion de instrucciones: marca cuando el mensaje contiene una orden encubierta (por ejemplo, un falso "aprobacion dada, excavad ya").
- Procesamiento de respuestas de callback: segundo contrato `reply-2.0` para leer la respuesta del ciudadano a una pregunta de seguimiento.
- Generacion de JSON valido: 99,6 % de salidas JSON validas en el conjunto de prueba real.
- Multilingue limitado: entrenado principalmente en ingles, Hinglish y estilos mixtos indios; algunos ejemplos en devanagari y kannada.
- No soporta tool calling, function calling, vision, audio ni modos de razonamiento extendido (thinking mode); es un extractor de un solo paso.
- No esta pensado para conversacion general ni agentes multi-paso: su rol es el de componente lector dentro de un pipeline mayor.

## Casos de uso

- Triaje automatico de quejas de agua en una utility: el modelo recibe el mensaje crudo del ciudadano (WhatsApp, web, app) y devuelve JSON con categoria y sintomas, permitiendo enrutar la incidencia al equipo adecuado sin intervencion humana.
- Deteccion de fugas en sistemas multiagente: integrado en AquaMind, el lector alimenta a los agentes de decision que combinan mensajes ciudadanos con lecturas de sensores de presion; al no exponer texto crudo a los agentes, reduce el riesgo de manipulacion.
- Defensa frente a inyeccion de prompts: el flag de instruccion embebida permite descartar o marcar mensajes maliciosos antes de que lleguen a agentes con capacidad de accion (por ejemplo, ordenar excavaciones).
- Extraccion de ubicaciones y marcas temporales: los campos de lugares y horas copiados literalmente sirven para geolocalizar la incidencia y priorizar por antiguedad, con F1 de 0,87 en lugares y 0,81 en horas.
- Gestion de callbacks: el contrato `reply-2.0` procesa la respuesta del ciudadano a una pregunta de seguimiento, cerrando el ciclo de clarificacion sin reenviar texto libre a los agentes.
- Despliegue en infraestructura modesta: al ser un adaptador de 0,1 GB sobre un modelo de 3B, puede ejecutarse en una unica GPU consumer o incluso en CPU con cuantizacion, lo que facilita su uso en entornos municipales con presupuesto limitado.
- Analisis de informes civicos a escala: procesa lotes de informes tipo FixMyStreet para extraer categorias y sintomas de forma estructurada y alimentar dashboards de mantenimiento.

## Benchmarks y rendimiento

Resultados sobre 250 informes reales de FixMyStreet nunca vistos en entrenamiento:

| Lector | Exactitud de categoria | F1 sintomas | F1 lugares (relajado) | F1 horas | JSON valido |
|---|---|---|---|---|---|
| Este modelo (AquaMind reader) | 91,6 % | 0,90 | 0,87 | 0,81 | 99,6 % |
| Mismo modelo base sin ajuste | 65,2 % | 0,57 | 0,67 | 0,23 | 12,0 % |

Comparacion adicional en el mismo subconjunto de 100 informes frente a un modelo prompteado de gran tamano:

| Modelo | Exactitud de categoria |
|---|---|
| Nemotron-3 Ultra 550B (prompteado) | 90 % |
| Este modelo (AquaMind reader) | 89 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa unos 0,1 GB; el modelo base Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6-7 GB de VRAM, y en cuantizacion 4 bits alrededor de 2-3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3070/4060 Ti, RTX 4090, A100, H100); con cuantizacion 4 bits cabe en GPUs de 4-6 GB.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060, RTX 4090 y similares; tambien puede ejecutarse en CPU con llama.cpp u Ollama si se convierte el modelo base a GGUF.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card), vLLM (previa fusion del adaptador con el modelo base), llama.cpp/Ollama (requiere fusionar y convertir a GGUF), TGI (previa fusion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento completo tardo unos 20 minutos en una T4, lo que sugiere una inferencia muy ligera, pero no se aportan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AquaMind reader (este modelo) | 3B + LoRA r=16 | 32.768 (heredado del base) | 91,6 % exactitud categoria, 99,6 % JSON valido | qwen-research | Hugging Face (adaptador PEFT) |
| Qwen2.5-3B-Instruct sin ajuste | 3B | 32.768 | 65,2 % exactitud categoria, 12,0 % JSON valido | qwen-research | Hugging Face |
| Nemotron-3 Ultra 550B (prompteado) | 550B | no disponible | 90 % exactitud categoria en 100 informes | no disponible | no disponible |

La comparacion con Nemotron-3 Ultra 550B es la mas llamativa: un modelo casi 180 veces mayor, prompteado, obtiene un 90 % frente al 89 % de este adaptador en el mismo subconjunto de 100 informes, lo que ilustra el valor del ajuste especifico frente al escalado bruto en tareas de extraccion estrechas. No se dispone de comparaciones con otros adaptadores especializados en extraccion de informacion civica.

## Limitaciones y advertencias

- Entrenado para una unica tarea estrecha (quejas de agua a una utility) en un unico formato JSON; no es un asistente general y fallara fuera de ese dominio.
- El conjunto de prueba real es texto del Reino Unido, mientras que la mayor parte del entrenamiento es ingles, Hinglish o mixto, con solo unos pocos mensajes en devanagari o kannada; el rendimiento puede degradarse en otros idiomas o variedades dialectales.
- Riesgo de alucinacion en los campos copiados literalmente (lugares y horas): el modelo puede normalizar o inventar texto si el mensaje es ambiguo, aunque el F1 de 0,87 y 0,81 sugiere una tasa contenida.
- Sesgos potenciales derivados de los datos de entrenamiento (mensajes civicos indios y britanicos), no documentados explicitamente por el autor.
- Licencia qwen-research heredada del modelo base: restricciones para uso comercial; es necesario revisar los terminos de la Qwen Research License antes de un despliegue en produccion.
- Requiere cargar el modelo base Qwen2.5-3B-Instruct por separado; el adaptador no es autonomo.
- El flag de inyeccion de instrucciones no es infalible: es una heuristica aprendida de ejemplos, no un mecanismo de seguridad formal.
- No hay garantia de que el JSON cumpla el contrato `reader-2.0` en el 0,4 % de los casos en que la salida no es JSON valido; conviene validar el esquema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hardik300/aquamind-reader-qwen2.5-3b-lora
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio del proyecto AquaMind (codigo, datos y memoria): https://github.com/kotharihardik/AquaMind
- Demo en vivo: https://aquamind-demo.ashytree-9a2487cc.centralindia.azurecontainerapps.io/#overview
