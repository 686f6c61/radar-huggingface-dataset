# nehal-vaghasiya/gemma-3-4b-pt-MathLaTeX-QLoRA

## Resumen

Gemma 3 4B MathLaTeX QLoRA es un adaptador LoRA publicado por el usuario nehal-vaghasiya sobre el modelo multimodal preentrenado google/gemma-3-4b-pt. No es un modelo independiente: el repositorio contiene unicamente los pesos del adaptador (0,2 GB), que deben cargarse sobre la base Gemma 3 de 4.000 millones de parametros para funcionar. Su proposito concreto es la transcripcion de expresiones matematicas presentes en imagenes a codigo LaTeX, una tarea de OCR especializado dentro del pipeline image-text-to-text.

El adaptador se entrena con la tecnica QLoRA (cuantizacion de la base a 4 bits y adaptacion LoRA de rango 16 sobre ella), usando como base de entrenamiento la variante unsloth/gemma-3-4b-pt-unsloth-bnb-4bit. La relevancia de esta ficha es acotada: se trata de un experimento de un autor individual, con 3 descargas y 0 likes en el momento de la consulta, sin model card detallada sobre datos de entrenamiento, sin benchmarks publicados y sin licencia propia verificada.

Conviene subrayar que la base es la version *pretrained* (pt) de Gemma 3, no la instruct, por lo que el adaptador debe aportar por si solo la capacidad de seguir la instruccion de transcripcion. El modelo hereda la arquitectura multimodal de Gemma 3 (vision y texto) y una ventana de contexto amplia, aunque los detalles de contexto no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Gemma 3 (vision + texto) |
| Parametros totales | No disponible para el adaptador; base de 4.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base de entrenamiento en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No verificada para el adaptador; la base se rige por los terminos de Gemma |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA / alpha / dropout | 16 / 16 / 0 |
| Framework | PEFT 0.17.1 |
| Modelo base | google/gemma-3-4b-pt |
| Base de entrenamiento | unsloth/gemma-3-4b-pt-unsloth-bnb-4bit |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 4B, un transformer multimodal que procesa imagenes y texto. La adaptacion emplea QLoRA: la base se mantiene cuantizada a 4 bits (variante de Unsloth) y se entrenan matrices de bajo rango con rango 16, alpha 16 y dropout 0, gestionadas mediante PEFT. El repositorio solo contiene los pesos del adaptador, no los de la base.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni detalles sobre el preprocesado de las imagenes de ecuaciones. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema QLoRA. La model card advierte que el Hub marca `task_type: null` en `adapter_config.json`, una advertencia de configuracion del adaptador que no se resuelve editando el README.

## Capacidades

- Transcripcion de expresiones matematicas desde imagenes a LaTeX, tarea principal para la que fue entrenado.
- Procesamiento de entrada multimodal imagen + texto (pipeline image-text-to-text).
- Generacion de texto conversacional heredada de la base Gemma 3.
- Seguimiento de instrucciones de formato acotadas (por ejemplo, "transcribe solo a LaTeX").
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso especifico del adaptador.
- Cobertura multilingue: no disponible en la informacion.

## Casos de uso

- Digitalizacion de apuntes y libros de matematicas: el adaptador convierte fotografias de ecuaciones manuscritas o impresas en LaTeX editable, adecuado para digitalizar material academico.
- Creacion de bancos de ejercicios en LaTeX: a partir de capturas de examenes, se genera codigo listo para compilar en documentos cientificos.
- Asistencia a estudiantes: extraer formulas de una imagen y devolverlas en LaTeX para pegarlas en un editor o en un sistema de practicas.
- Preprocesado de datasets cientificos: convertir figuras con formulas en texto LaTeX para indexacion o busqueda dentro de repositorios de papers.
- Integracion en herramientas de toma de notas: un flujo que recibe una imagen de pizarra y devuelve la ecuacion en LaTeX para su almacenamiento.
- Prototipado de OCR matematico en entornos con GPU modesta: al ser un adaptador sobre una base de 4B, el coste de despliegue es inferior al de modelos mayores.

En todos los casos debe validarse el LaTeX generado antes de usarlo en documentos cientificos, tal como advierte el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al cargar la base de 4B en precision completa se requieren del orden de 8-10 GB, y menos si se cuantiza, aunque no hay cifras verificadas para este adaptador.
- GPU recomendadas: no disponibles en la informacion; por tamano de base, una GPU con al menos 8-16 GB de VRAM seria el punto de partida razonable, sin confirmacion del autor.
- GPU de consumo: probablemente cabe en tarjetas de 12-16 GB o superiores, pero no hay datos confirmados.
- Opciones de despliegue: transformers + peft + accelerate (segun el ejemplo de la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 3 4B MathLaTeX QLoRA (este) | Base 4B + adaptador LoRA | No disponible | OCR matematico a LaTeX | No verificada (base: terminos Gemma) | Hugging Face, 3 descargas |
| google/gemma-3-4b-pt | 4B | No disponible en esta ficha | Base multimodal preentrenada | Terminos Gemma | Hugging Face |
| Alternativas de OCR matematico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con otras soluciones de OCR matematico.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar la base google/gemma-3-4b-pt y aceptar sus terminos de acceso.
- El autor advierte que simbolos pequenos, fracciones, diagramas y notacion inusual pueden leerse de forma erronea.
- Debe validarse el LaTeX generado antes de usarlo en documentos cientificos.
- No hay licencia propia verificada para el adaptador; el uso comercial queda sujeto a los terminos de Gemma de la base.
- El Hub marca `task_type: null` en `adapter_config.json`, lo que puede afectar a la carga automatica del adaptador.
- Sin datos publicados sobre sesgos, tasas de alucinacion, idiomas soportados ni benchmarks.
- Proyecto de autor individual con muy poca adopcion (3 descargas, 0 likes), lo que reduce la fiabilidad para produccion.
- La base es la version *pretrained*, no instruct, por lo que el comportamiento conversacional puede ser limitado fuera de la tarea entrenada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nehal-vaghasiya/gemma-3-4b-pt-MathLaTeX-QLoRA
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Terminos de Gemma: https://huggingface.co/google/gemma-3-4b-pt
- Perfil del autor: https://huggingface.co/nehal-vaghasiya
- Base de entrenamiento (Unsloth): unsloth/gemma-3-4b-pt-unsloth-bnb-4bit (referenciada en la configuracion del adaptador)
