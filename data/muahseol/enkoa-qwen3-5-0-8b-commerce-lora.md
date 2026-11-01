# muahseol/enkoa-qwen3.5-0.8b-commerce-lora

## Resumen

`muahseol/enkoa-qwen3.5-0.8b-commerce-lora` es un adaptador LoRA (r=8) entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` con datos de consultas de compra online en coreano. Lo publica el usuario `muahseol` como material didactico del curso "엔코아 AI캠퍼스" (ENKOA AI Campus), concretamente como tarea 01 de la unidad de LoRA dentro del modulo de deep learning. No es un modelo de proposito general ni un producto listo para produccion: es un ejemplo de clase.

El repositorio contiene unicamente los pesos del adaptador en formato PEFT/safetensors (tamano de repo reportado de 0,0 GB, coherente con un adaptador de rango bajo sobre un modelo de 0,8 mil millones de parametros). La model card indica explicitamente que el adaptador se usa en la unidad de vLLM del curso, donde los alumnos lo descargan y lo levantan como servidor de inferencia para practicar el despliegue.

Su relevancia es, por tanto, exclusivamente pedagogica: ilustra el flujo completo de fine-tuning con LoRA sobre un modelo pequeno, la publicacion del adaptador en HuggingFace y su servicio con vLLM. El autor advierte de forma explicita que es un modelo de ejemplo y que no debe usarse para atencion al cliente real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-0.8B; rango r=8 |
| Parametros totales | No disponible (el adaptador es de rango bajo; el base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 (`commerce_lora_adapter`) que se aplica sobre el modelo base `Qwen/Qwen3.5-0.8B`. No se especifican en la informacion disponible ni las capas objetivo del adaptador, ni el valor de alpha, ni el dropout, ni la tasa de aprendizaje, ni el numero de pasos de entrenamiento. Tampoco se detalla la composicion exacta del dataset de consultas de compra online, salvo que son datos de atencion al cliente de comercio electronico en coreano.

No hay informacion sobre si el entrenamiento incluyo etapas de alineacion (RLHF, DPO) ni sobre innovaciones tecnicas adicionales. El interes arquitectonico se limita al patron clasico de LoRA: congelar el modelo base y entrenar matrices de baja dimensionalidad, lo que permite ajustar un modelo de 0,8B con recursos modestos y distribuir el resultado como un fichero de pocos megabytes.

## Capacidades

- Generacion de texto en coreano orientada a conversaciones de consulta de compra online, segun el dominio de entrenamiento declarado.
- Respuesta a preguntas de atencion al cliente de comercio electronico dentro del estilo de los datos de entrenamiento.
- Servido mediante vLLM como ejercicio de despliegue (la model card menciona explicitamente esta integracion).
- Capacidades heredadas del modelo base Qwen3.5-0.8B: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el adaptador declara solo coreano).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Practica de fine-tuning con LoRA: el adaptador sirve como referencia de como entrenar y publicar un adaptador de rango 8 sobre un modelo pequeno, util en cursos y talleres de deep learning.
- Ejercicio de despliegue con vLLM: los alumnos descargan el repositorio y levantan un servidor de inferencia para practicar la configuracion de un endpoint compatible con OpenAI sobre un adaptador PEFT.
- Demostracion de adaptacion de dominio: muestra como un modelo base generalista puede especializarse en el registro linguistico de atencion al cliente de comercio electronico con un coste de entrenamiento bajo.
- Pruebas de integracion de pipelines PEFT: sirve para validar herramientas que cargan adaptadores sobre modelos base (por ejemplo, `PeftModel.from_pretrained`) antes de aplicarlas a proyectos reales.
- Comparacion didactica de estrategias de ajuste: permite contrastar el resultado del adaptador frente al modelo base sin ajustar para ilustrar el efecto del fine-tuning.
- Material de evaluacion en asignaturas de IA: util como caso de estudio de las limitaciones de un modelo de ejemplo, incluida la advertencia del autor de no usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un modelo base de 0,8B en precision FP16 requiere aproximadamente 1,6 GB solo para los pesos, mas overhead de activaciones y cache KV; el adaptador LoRA anade unos pocos megabytes.
- GPU recomendadas: no especificadas. Por tamano, el modelo base cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores; no se dispone de datos de rendimiento medidos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: vLLM (mencionado en la model card); otras opciones como llama.cpp, Ollama o TGI no estan documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de ejemplo: el autor indica explicitamente que es un modelo de ejemplo para practicas y que no debe usarse en atencion al cliente real.
- Dominio muy restringido: entrenado solo con datos de consultas de compra online en coreano; el comportamiento fuera de ese dominio no esta caracterizado.
- Idioma limitado: la model card declara unicamente coreano; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo pequeno (0,8B) y un adaptador de rango bajo, la fiabilidad factua no esta garantizada.
- Sesgos: no documentados. Los sesgos inheridos del dataset de consultas de comercio electronico no han sido analizados.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Sin datos de evaluacion: no hay benchmarks, metricas de calidad ni estudios de robustez publicados.
- Tamano de repo reportado de 0,0 GB: conviene verificar que los ficheros del adaptador estan efectivamente subidos antes de intentar cargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-commerce-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este adaptador.
