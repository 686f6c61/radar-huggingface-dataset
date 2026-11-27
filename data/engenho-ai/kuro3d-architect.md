# engenho-ai/Kuro3D-Architect

## Resumen

Kuro3D-Architect es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-3B-Instruct desarrollado por engenho-ai dentro de su linea Kuro. Esta especializado en modelado 3D parametrico en milimetros, con soporte para la generacion de scripts de OpenSCAD y de Python para Blender. El modelo parte de una base de 3.085.938.688 parametros (aproximadamente 3,1 mil millones) y hereda la arquitectura transformer densa de la familia Qwen2.5.

El modelo resuelve un problema concreto: convertir instrucciones en lenguaje natural en codigo CAD reproducible y geometricamente coherente, algo que los modelos generalistas suelen abordar de forma inconsistente. Al estar afinado sobre un modelo de codigo, mantiene una buena adherencia a la sintaxis de OpenSCAD y a la API bpy de Blender, lo que reduce errores de compilacion en el pipeline de diseno.

Es relevante ahora porque los modelos de 3B parametros pueden ejecutarse en GPU de consumo con cuantizacion (el autor indica aproximadamente 1,9 GB de VRAM), lo que abarata el despliegue de asistentes de diseno parametrico en local. La ficha se basa exclusivamente en los metadatos y la model card publicados; no hay benchmarks ni documentacion adicional disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (etiqueta declarada); niveles concretos no disponibles |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | qwen-research (licencia Qwen, uso comercial restringido) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen2.5-Coder-3B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. No se dispone de informacion sobre la composicion del dataset de ajuste, el numero de tokens utilizados, ni sobre si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. La model card unicamente indica la especializacion en modelado 3D parametrico en milimetros para OpenSCAD y Blender Python.

La innovacion principal es la especializacion de dominio: el ajuste orienta al modelo hacia la generacion de geometria parametrica con unidades consistentes (milimetros) y hacia las dos APIs de scripting mas habituales en el ecosistema de diseno abierto (OpenSCAD y bpy). No hay informacion publica sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de codigo OpenSCAD: primitivas, operaciones booleanas, extrusión, transformaciones y modulos parametrizados.
- Generacion de scripts Python para Blender mediante la API bpy: creacion de mallas, materiales basicos y jerarquias de objetos.
- Modelado parametrico en milimetros, con enfasis en la coherencia dimensional de las piezas generadas.
- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Capacidades de codigo general heredadas de Qwen2.5-Coder-3B-Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues limitadas a portugues e ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion de piezas parametricas en OpenSCAD: el usuario describe una pieza (por ejemplo, una brida con taladros a una distancia concreta) y el modelo produce el script listo para compilar, con cotas en milimetros.
- Automatizacion de variantes de diseno: dado un modulo OpenSCAD base, el modelo genera parametros y modificaciones para producir familias de piezas sin reescribir el codigo desde cero.
- Prototipado rapido en Blender: generacion de scripts bpy que crean objetos, aplican modificadores y organizan la escena, util para pipelines de render o exportacion a STL.
- Asistente de CAD en local: despliegue en una estacion de trabajo con GPU de consumo (aproximadamente 1,9 GB de VRAM segun el autor) para equipos de diseno que no pueden enviar geometria confidencial a la nube.
- Educacion y formacion en diseno parametrico: el modelo explica y genera ejemplos de codigo OpenSCAD para ensenar conceptos de modelado por parametros.
- Integracion en herramientas de chat o IDE: al ser un modelo de 3B con variante GGUF, puede integrarse en asistentes locales de edicion de codigo para autocompletar y revisar scripts CAD.
- Generacion de documentacion tecnica de piezas: a partir del codigo, el modelo puede describir dimensiones y parametros de una pieza en portugues o ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB segun la model card del autor (presumiblemente en cuantizacion de 4 bits); en precision completa (fp16) serian necesarios aproximadamente 6,2 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp16, y GPU con 4 GB o mas en cuantizacion.
- GPU de consumo: si, cabe en tarjetas consumer con cuantizacion GGUF; en fp16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para la variante GGUF; vLLM, TGI o transformers para safetensors (compatibilidad no verificada en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuro3D-Architect | 3,09B | No disponible | OpenSCAD y Blender Python | qwen-research | Hugging Face |
| Qwen2.5-Coder-3B-Instruct | 3,09B | No disponible en esta ficha | Codigo general | qwen-research | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7,6B (aproximado) | No disponible en esta ficha | Codigo general | qwen-research | Hugging Face |

No se dispone de datos de rendimiento comparativo para Kuro3D-Architect frente a alternativas; la comparativa se limita a parametros, licencia y especializacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5-Coder hereda los sesgos del corpus de codigo y texto de dicho modelo.
- Riesgo de alucinacion: alto en APIs poco representadas; el modelo puede generar llamadas a funciones de OpenSCAD o bpy inexistentes o con firmas incorrectas.
- Cobertura idiomatica limitada a portugues e ingles; el castellano no esta declarado como idioma soportado.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de proyectos CAD extensos.
- Licencia qwen-research: restricciones para uso comercial; es necesario revisar los terminos de la licencia Qwen antes de desplegar en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa ni benchmarks publicados.
- El ajuste esta orientado a un dominio estrecho (CAD 3D); su rendimiento en tareas generales de codigo puede ser inferior al del modelo base.
- No hay informacion sobre tool calling, agentes ni soporte multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/engenho-ai/Kuro3D-Architect
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
