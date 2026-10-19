# parkingsoman/cale-gemma-3n-E4B-it-GGUF

## Resumen
parkingsoman/cale-gemma-3n-E4B-it-GGUF es una cuantizacion GGUF Q4_0 del modelo google/gemma-3n-E4B-it, desarrollado por Google DeepMind. No es un modelo nuevo: el autor, parkingsoman, reempaqueta la cuantizacion de unsloth y cambia el orden de bytes de las matrices FFN down, que quedan divididas en dos mitades con la clave cale.ffn_down_split=1. El resultado pesa 4,4 GB y declara 6.866.172.400 parametros totales en safetensors; E4B hace referencia a parametros efectivos, no a un MoE.

El modelo base es un modelo multimodal de Gemma 3n orientado a edge, que acepta texto, imagen y audio y comparte arquitectura con Gemini Nano segun DeepMind. Esto lo hace relevante para inferencia local en dispositivos con recursos limitados.

La relevancia practica de este repositorio es probar el runtime Cale con un Gemma 3n cuantizado, no obtener mejoras de calidad: solo cambia el empaquetado. Su adopcion es todavia muy baja (0 descargas y 0 likes en el momento de la consulta) y la compatibilidad con llama.cpp u Ollama no esta confirmada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3n multimodal orientada a edge; arquitectura compartida con Gemini Nano segun DeepMind; detalles de capas no disponibles |
| Parametros totales | 6.866.172.400 (6,87 mil millones) segun safetensors del repo |
| Parametros activos | No aplica: no es un modelo MoE; E4B se refiere a parametros efectivos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0; variante Cale con matrices FFN down divididas en dos mitades (cale.ffn_down_split=1); tag imatrix sin detalle del proceso |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (tag license:gemma) |
| Formato de pesos | GGUF; repo de 4,4 GB |
| Modelo base | google/gemma-3n-E4B-it |

## Arquitectura y entrenamiento
El modelo base pertenece a Gemma 3n, una familia de Google DeepMind disenada para edge y creada en colaboracion con fabricantes de hardware movil; DeepMind indica que comparte arquitectura con la siguiente generacion de Gemini Nano. La informacion disponible de NVIDIA NIM lo describe como un modelo de computacion edge que acepta texto, audio e imagen, adecuado para entornos con recursos limitados. No se detallan en la informacion proporcionada el numero de capas, el mecanismo de atencion, el vocabulario ni la ventana de contexto.

Este repositorio no entrena ni afina el modelo. Parte de la cuantizacion Q4_0 de unsloth/gemma-3n-E4B-it-GGUF y aplica un cambio de orden de bytes: cada matriz FFN down se almacena en dos mitades y se marca con cale.ffn_down_split=1. No hay datos sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO ni evaluaciones de la cuantizacion.

## Capacidades
- Generacion de texto conversacional: el sufijo it indica una variante instruida; no se detalla el esquema exacto de alineacion.
- Entrada multimodal: texto, imagen y audio, con salida de texto, segun la ficha de NVIDIA NIM para gemma-3n-e4b-it.
- Inferencia en edge y on-device: el modelo base esta pensado para entornos con recursos limitados.
- Vision: puede recibir imagenes; no se especifican resolucion, tareas ni metricas.
- Audio: puede recibir audio; no se especifican idiomas, muestreo ni tareas.
- Tool calling y function calling: no disponible en la informacion.
- Agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Multilingue: no se detallan idiomas soportados.

## Casos de uso
- Asistente conversacional local en kioscos o tablets: al pesar 4,4 GB en Q4_0, puede ejecutarse en equipos con 8 GB de RAM o VRAM y mantener conversaciones sin enviar datos a la nube; requiere validar el runtime Cale.
- Descripcion de imagenes para accesibilidad: el modelo base acepta imagen y genera texto; se puede usar para lectura de carteles, productos o capturas en un movil, con revision humana.
- Resumen de notas de voz en local: el modelo base acepta audio y produce texto; es util para reuniones o entrevistas en entornos con privacidad estricta.
- Soporte tecnico de campo: el operario envia una foto de un equipo y el modelo responde con pasos; la cuantizacion permite llevarlo en un portatil con GPU de 8-12 GB.
- Prototipado de experiencias multimodales en dispositivos: evaluar Gemma 3n E4B en moviles, mini-PC o placas con acelerador antes de pasar a produccion.
- Validacion de la variante Cale: desarrolladores que implementan el runtime Cale pueden comparar salidas con el GGUF original de unsloth y comprobar que el cambio de orden de bytes no altera la inferencia.
- Investigacion de cuantizacion: medir perplejidad, latencia y consumo de memoria de Q4_0 en distintos equipos; no hay benchmarks publicados, asi que la evaluacion debe ser propia.
- Filtrado y clasificacion de contenido multimodal en local: procesar imagenes y texto en un pipeline interno sin depender de APIs externas; validar sesgos y errores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Peso de los pesos: 4,4 GB (GGUF Q4_0).
- VRAM estimada: 5-6 GB para contexto corto; 8-12 GB para contextos mayores, dependiendo del runtime y del KV cache. No hay mediciones publicadas.
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070, 4080 o 4090; en 8 GB solo con contexto corto y overhead ajustado.
- GPU profesional: A100 o H100 no son necesarias para Q4_0; pueden servir para servir el modelo base en mayor precision o con lotes.
- CPU: posible con 8 GB de RAM libre; 16 GB recomendables. Throughput no disponible.
- Despliegue: requiere un runtime compatible con la clave cale.ffn_down_split; no esta confirmado en llama.cpp, Ollama, vLLM ni TGI. Para llama.cpp u Ollama, usar el GGUF estandar de unsloth como referencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| parkingsoman/cale-gemma-3n-E4B-it-GGUF | 6,87 mil millones totales; E4B efectivos | no disponible | GGUF Q4_0 Cale, 4,4 GB | Gemma | sin datos en la informacion | Comunidad; 0 descargas y 0 likes |
| google/gemma-3n-E4B-it | 6,87 mil millones totales (base) | no disponible | no disponible en la informacion | Gemma | sin datos en la informacion | Oficial de Google DeepMind |
| unsloth/gemma-3n-E4B-it-GGUF | 6,87 mil millones (base) | no disponible | GGUF | Gemma | sin datos en la informacion | Repo de cuantizacion de referencia; tamano no disponible en la informacion |

## Limitaciones y advertencias
- Cuantizacion Q4_0: perdida de precision respecto al modelo base; no se han publicado evaluaciones de esta variante.
- Formato Cale no estandar: el cambio de orden de bytes y la clave cale.ffn_down_split=1 pueden impedir la carga en herramientas que no lo soporten.
- No es un modelo nuevo ni una mejora: solo cambia el empaquetado de la cuantizacion de unsloth.
- Poca validacion: 0 descargas y 0 likes; no hay informes de calidad ni de compatibilidad.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use; revisar obligaciones y restricciones.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay benchmarks que lo cuantifiquen.
- Idiomas y contexto no disponibles: no asumir soporte multilingue amplio ni una ventana concreta.
- Capacidades multimodales del base no garantizan buen rendimiento tras Q4_0; validar imagen y audio en el caso de uso.
- No es una publicacion oficial de Google; soporte y mantenimiento dependen del autor.

## Enlaces
- [parkingsoman/cale-gemma-3n-E4B-it-GGUF](https://huggingface.co/parkingsoman/cale-gemma-3n-E4B-it-GGUF)
- [google/gemma-3n-E4B-it](https://huggingface.co/google/gemma-3n-E4B-it)
- [unsloth/gemma-3n-E4B-it-GGUF](https://huggingface.co/unsloth/gemma-3n-E4B-it-GGUF)
- [Gemma 3n - Google DeepMind](https://deepmind.google/models/gemma/gemma-3n/)
- [gemma-3n-e4b-it - NVIDIA NIM](https://build.nvidia.com/google/gemma-3n-e4b-it)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Listado GGUF de terceros en local-ai-zone](https://local-ai-zone.github.io/models/gemma-3n-e4b-it.html)
