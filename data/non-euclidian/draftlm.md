# non-euclidian/DraftLM

## Resumen

DraftLM (publicado como DraftLM0.1-350M) es un ajuste fino especifico de tarea sobre el modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario non-euclidian. Su proposito concreto es la generacion de borradores de correo electronico a partir de un mensaje breve o telegraphico: el usuario aporta una indicacion escueta y el modelo produce un borrador de email completo. No se trata, por tanto, de un modelo de proposito general, sino de un adaptador LoRA entrenado con SFT para una unica funcion.

El modelo se distribuye como adaptador PEFT (LoRA) sobre el modelo base de Liquid AI, con 354.483.968 parametros totales en los pesos safetensors del repositorio. El repositorio ocupa aproximadamente 0,4 GB e incluye tambien artefactos en formato GGUF, lo que facilita su despliegue en entornos de inferencia local. La libreria declarada es PEFT y el pipeline es text-generation.

La relevancia de esta ficha es acotada: es un modelo muy pequeno (350M), con cero descargas y cero likes en el momento de la consulta, sin licencia ni idiomas declarados de forma explicita en los metadatos de Hugging Face, y con un README que remite a un contacto directo para licenciamiento comercial. Resulta util como ejemplo de ajuste fino de tarea sobre un modelo base pequeno y como componente de generacion de borradores en flujos de productividad personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/LFM2.5-350M; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye artefactos GGUF, sin detallar los tipos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en Hugging Face; la model card indica "licence: other" y remite a contacto para licenciamiento comercial |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base LiquidAI/LFM2.5-350M. La model card declara el uso de PEFT 0.21.2, TRL 0.22.2, Transformers 5.14.1, PyTorch 2.11.0+cu130, Datasets 4.3.0, Tokenizers 0.22.2 y Unsloth 2026.8.8. Se incluye una etiqueta de receta de entrenamiento (`05d_mix_a-387_mix_d-1020_0.07_0.08_0.5_mag_frequency_s3407`) y un identificador de ejecucion (`05b_031126_2103`), que sugieren una mezcla de datasets y una configuracion de hiperparametros concreta, aunque no se detalla su contenido.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base (tipo de transformer, atencion, etc.). La innovacion tecnica declarada es de producto, no arquitectonica: la especializacion en la transformacion de un mensaje breve en un borrador de correo.

## Capacidades

- Generacion de texto orientada a la redaccion de borradores de correo electronico a partir de una indicacion breve.
- Ajuste especifico de tarea (SFT) sobre un modelo base de 350M, lo que limita su alcance a la funcion entrenada.
- Despliegue como adaptador PEFT sobre el modelo base, con posibilidad de cargar los pesos en formato GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en una tarea unica.
- Capacidades multilingues: no disponibles; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Redaccion de correos de respuesta rapida: el modelo recibe una indicacion escueta (por ejemplo, "confirmar reunion el martes") y genera un borrador de email con estructura y tono adecuados; es su funcion principal y la razon de ser del ajuste.
- Asistentes de correo en clientes de escritorio o web: al ser un modelo de 350M con artefactos GGUF, puede integrarse en un plugin local que genere borradores sin enviar datos a la nube.
- Automatizacion de seguimientos comerciales: a partir de una nota breve del CRM, generar un correo de seguimiento personalizado para cada contacto.
- Soporte al cliente de primer nivel: generar respuestas plantilla a partir de una descripcion corta del caso, que luego un agente humano revisa y envia.
- Prototipado de flujos de productividad: util como componente de demostracion en entornos de bajo coste computacional, tal y como sugiere la demo publica del autor.
- Generacion de borradores en entornos con recursos limitados: al tratarse de un adaptador LoRA sobre un modelo de 350M, puede ejecutarse en CPU o en GPU de gama baja para tareas de redaccion asistida.
- Investigacion sobre ajuste fino de tarea: sirve como referencia reproducible de un pipeline SFT con Unsloth, TRL y PEFT sobre un modelo base pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo base (350M) y el repositorio de 0,4 GB, la inferencia en precision completa requeriria del orden de 1,5 GB, y en cuantizacion de 8 o 4 bits seria inferior a 1 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) seria suficiente, e incluso podria ejecutarse en CPU.
- Cabe en GPU consumer: si, previsiblemente en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, aunque el dato no esta confirmado.
- Opciones de despliegue: al distribuirse como adaptador PEFT y con artefactos GGUF, es compatible con llama.cpp y con el ecosistema de Transformers/PEFT; no se confirma soporte explicito de vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DraftLM (este modelo) | 354.483.968 | no disponible | Ajuste fino para borradores de email | "other", contacto comercial | Hugging Face, 0 descargas |
| LiquidAI/LFM2.5-350M (modelo base) | 350M (aprox.) | no disponible | Modelo base de proposito general | no disponible | Hugging Face |
| Alternativas de generacion de texto de ~350M | no disponible | no disponible | Proposito general | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (borradores de email); su rendimiento fuera de ese dominio no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por el tamano reducido del modelo base (350M).
- No se declaran idiomas soportados; no hay garantia de calidad en castellano ni en otros idiomas distintos del usado en el entrenamiento.
- Licencia no disponible de forma clara: la model card indica "licence: other" y remite a un contacto de correo para licenciamiento comercial, por lo que el uso comercial requiere consulta previa.
- Ausencia de benchmarks publicados: no es posible evaluar su calidad de forma objetiva frente a alternativas.
- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- El repositorio incluye artefactos GGUF pero no se detallan las cuantizaciones disponibles ni sus caracteristicas.
- No se documenta la longitud de contexto, lo que dificulta planificar casos de uso con conversaciones largas.

## Enlaces

- [Modelo en Hugging Face: non-euclidian/DraftLM](https://huggingface.co/non-euclidian/DraftLM)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Demo en vivo: DraftFlow](https://www.noneuclidianspace.com/demos/draftflow/)
- Contacto para licenciamiento comercial: lhf [at] noneuclidianspace.com
