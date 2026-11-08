# rrrpromex/CORU_15M_V4_prototype

## Resumen

CORU 15M V4 Prototype es un modelo de lenguaje de tipo decoder-only Transformer con aproximadamente 15 millones de parámetros, publicado por el desarrollador RRR PRO MEX (usuario `rrrpromex` en Hugging Face). Se distribuye como un prototipo experimental de escala micro, pensado para la inspección, el aprendizaje y la experimentación con modelos compactos, no como un LLM de propósito general listo para producción. El checkpoint incluye pesos en PyTorch, configuración, tokenizer SentencePiece y una aplicación de inferencia interactiva basada en Gradio.

La arquitectura es un Transformer causal con bloques feed-forward SwiGLU, dimensión oculta de 320, 10 capas y 8 cabezas de atención, con un vocabulario de 8.000 tokens. La ventana de contexto que utiliza la demostración incluida es de solo 256 tokens y, según la model card, la codificación posicional está desactivada en esta configuración del checkpoint (no se emplea RoPE en la implementación de inferencia suministrada).

Su relevancia es acotada y de carácter educativo: sirve como artefacto de investigación para estudiar el comportamiento de un Transformer pequeño, probar formatos de prompt y ajustes de muestreo, y construir pipelines de fine-tuning sobre tareas estrechas. El propio autor advierte de que las salidas pueden ser repetitivas, incompletas, inexactas o inestables, y de que el número de parámetros por sí solo no indica calidad ni idoneidad para una aplicación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer con self-attention causal y bloques feed-forward SwiGLU |
| Parametros totales | Aproximadamente 15 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens en la demo suministrada |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos PyTorch; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (sujeta a la nota de procedencia de datos del autor) |
| Formato de pesos | PyTorch (repositorio de 0,1 GB); no se documentan safetensors ni GGUF |

Parámetros arquitectónicos adicionales declarados en `config.json`: dimensión oculta (`d_model`) de 320, 10 capas, 8 cabezas de atención, dimensión oculta del feed-forward de 854, vocabulario de 8.000 tokens con tokenizer SentencePiece, y codificación posicional desactivada en esta configuración del checkpoint (sin RoPE en la implementación de inferencia incluida).

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de escala micro con atención causal y bloques feed-forward SwiGLU. La configuración es deliberadamente compacta: `d_model` de 320, 10 capas, 8 cabezas y una dimensión interna del feed-forward de 854, con un vocabulario de 8.000 tokens tokenizado mediante SentencePiece. La implementación de inferencia incluida en el repositorio no aplica codificación posicional (no usa RoPE), lo que limita estructuralmente el modelado de dependencias a larga distancia dentro de la ventana de 256 tokens.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El autor indica que la licencia Apache 2.0 está sujeta a una nota sobre derechos y procedencia de los datos que no se detalla en el material disponible.

## Capacidades

- Generación de texto autoregresiva a corto plazo dentro de una ventana de 256 tokens.
- Experimentación con formatos de prompt y ajustes de muestreo (temperatura, top-k, top-p) sobre un Transformer compacto.
- Base para fine-tuning en tareas estrechas y bien definidas, comparando el modelo antes y después del ajuste.
- Clasificación de intención y enrutamiento de peticiones cortas, tras entrenamiento específico y evaluación.
- Clasificación de comandos o categorías sobre mensajes y registros breves.
- Procesamiento ligero de texto: completados cortos, reescritura simple, etiquetado o extracción estructurada.
- Componente de asistente local en aplicaciones donde el uso de recursos es crítico.
- Preprocesamiento en automatizaciones: clasificar o formatear una entrada antes de que un programa determinista, una API o un modelo mayor realice la operación principal.
- Investigación en edge computing y entornos offline con tareas de alcance limitado.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Clasificación de intención en enrutadores de peticiones: tras un fine-tuning supervisado sobre un conjunto etiquetado de mensajes cortos, el modelo puede asignar una categoría a cada entrada y derivarla al flujo adecuado; su tamaño de 15M parámetros permite ejecutarlo en CPU con latencia baja.
- Etiquetado de tickets de soporte: con datos propios y una cabeza de clasificación, se puede experimentar con la asignación de etiquetas a registros breves, validando siempre la salida con reglas deterministas antes de actuar.
- Preprocesamiento en pipelines de automatización: el modelo puede normalizar o formatear una entrada corta antes de que un programa o una API realice la acción principal, siguiendo el patrón `entrada → preprocesado → modelo → validación → comprobación de permisos → acción → registro de auditoría` descrito por el autor.
- Asistente local de bajo consumo: integrado en una aplicación de escritorio o dispositivo con recursos limitados para completados cortos, midiendo velocidad y memoria reales en el hardware objetivo.
- Docencia e investigación sobre Transformers: el repositorio incluye configuración, tokenizer, pesos y una interfaz Gradio, lo que permite estudiar el camino de generación causal de un modelo pequeño de extremo a extremo.
- Banco de pruebas de fine-tuning: sirve como punto de partida para validar pipelines de entrenamiento y comparar el comportamiento antes y después del ajuste en una tarea concreta.
- Investigación en edge y offline: medir si un modelo de esta escala puede resolver una tarea de alcance estrecho sin conexión y sin infraestructura de servido dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con aproximadamente 15M parámetros en precisión FP32 los pesos ocupan del orden de 60 MB, y en FP16 del orden de 30 MB, a lo que hay que sumar el estado de inferencia y el tokenizer.
- GPU recomendadas: no se especifican; por escala, cualquier GPU consumer moderna es sobradamente suficiente, e incluso la inferencia en CPU resulta viable.
- Cabe en GPU consumer: sí, por tamaño; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: PyTorch con la implementación de inferencia incluida y la interfaz Gradio suministrada; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el autor recomienda medir velocidad y memoria reales en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CORU 15M V4 Prototype | ~15M | 256 tokens (demo) | Apache 2.0 | Hugging Face (PyTorch) | Prototipo experimental sin benchmarks publicados |
| RRR-PRO-MEX-AI-CORE | No disponible | No disponible | No disponible | Hugging Face (`rrrpromex`) | Otro modelo del mismo autor; sin datos tecnicos en la informacion disponible |
| Alternativas de escala micro de otros autores | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables para una comparacion cuantitativa |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental y no listo para produccion: el propio autor lo califica como prototipo de escala micro, no como LLM de proposito general.
- Salidas potencialmente repetitivas, incompletas, inexactas o inestables, segun advierte la model card.
- Ventana de contexto de solo 256 tokens en la demo, insuficiente para conversaciones multiturno o documentos largos.
- Codificacion posicional desactivada en esta configuracion del checkpoint, lo que limita el modelado de orden y dependencias a distancia.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en ningun otro idioma.
- Riesgo elevado de alucinacion y de fallo en el seguimiento de instrucciones; no debe usarse como unica fuente de verdad ni como unico mecanismo de seguridad.
- Licencia Apache 2.0 sujeta a una nota de derechos y procedencia de datos no detallada; conviene revisar las condiciones antes de un uso comercial.
- No se documentan sesgos conocidos, pero un modelo de este tamano y con datos no especificados puede reproducir sesgos presentes en su corpus de entrenamiento.
- Para decisiones sensibles o acciones irreversibles se requiere validacion de salidas, comprobacion de permisos, registro de auditoria y aprobacion humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rrrpromex/CORU_15M_V4_prototype
- Perfil del autor en Hugging Face: https://huggingface.co/rrrpromex/models
- Otro modelo del autor (RRR-PRO-MEX-AI-CORE): https://huggingface.co/rrrpromex/RRR-PRO-MEX-AI-CORE
