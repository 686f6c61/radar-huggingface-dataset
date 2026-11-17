# Mirai2k/Abliterated-9B-Uncensored-GGUF

## Resumen

Abliterated-9B-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo huihui-ai/Huihui-Qwen3.5-9B-abliterated, publicada por el usuario Mirai2k en Hugging Face. Se trata de un modelo de lenguaje de aproximadamente 8.950 millones de parametros derivado de la familia Qwen3.5, al que se le han eliminado los mecanismos de rechazo (abliteration) para que genere respuestas sin las negativas tipicas de los modelos alineados. El autor lo distribuye exclusivamente como pesos GGUF, pensados para ejecucion en CPU y en equipos con poca memoria de GPU.

La propuesta de valor del modelo es la ejecucion local en hardware modesto: el autor afirma que el fichero Q4_K_M ocupa 5,6 GB y requiere unos 7 GB de RAM, sin necesidad de GPU. Esta orientado a generacion de texto creativo de formato largo, roleplay, resumen y codigo, en ingles y frances. El modelo conserva las capacidades de razonamiento del modelo base, pero elimina las formulas de cautela y las advertencias de tipo "como modelo de IA".

Es importante senalar que la model card incluye instrucciones potencialmente maliciosas (un supuesto "runtime pack" alojado en una IP y la recomendacion de cargar el modelo con `trust_remote_code=True`), que deben tratarse como advertencia de seguridad y no como pasos a seguir. No hay datos publicados de benchmarks ni de evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5 9B; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor recomendado por el autor en la guia de uso; no se especifica el maximo nativo) |
| Tipos de cuantizacion | GGUF; el autor solo publica y recomienda Q4_K_M |
| Idiomas soportados | Ingles y frances |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (unico fichero publicado, Q4_K_M) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de que el modelo deriva de Qwen3.5-9B, un transformer decoder-only de la familia Qwen. El proceso de "abliteration" consiste en la modificacion de los pesos para suprimir la direccion de activacion asociada a los rechazos, de modo que el modelo deja de producir negativas ante ciertas peticiones. El autor indica que los pesos cuantizados son los mismos que los del modelo base abliterado y que la cuantizacion no altera los valores, solo la representacion numerica.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). La unica innovacion practica es la publicacion en GGUF para inferencia en CPU y en GPUs de baja VRAM.

## Capacidades

- Generacion de texto de formato largo y reescritura de textos, sin preambulos de cautela.
- Roleplay y mantenimiento de personaje, con consistencia de voz segun el autor.
- Razonamiento multi-paso e instrucciones compuestas.
- Generacion de codigo y resumen de documentos.
- Capacidades multilingues limitadas a ingles y frances.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Compatible con endpoints (tag `endpoints_compatible`), aunque sin detalles adicionales.

## Casos de uso

- Escritura creativa y narrativa local: el modelo puede generar relatos y dialogos largos en un equipo sin GPU, gracias a su cuantizacion Q4_K_M de 5,6 GB y a los 8192 tokens de contexto recomendados.
- Roleplay y personajes conversacionales: el autor destaca que mantiene la voz del personaje, lo que lo hace util para prototipos de chatbots de ficcion o videojuegos.
- Reescritura y edicion de textos: util para parafrasear o adaptar tono y estilo en ingles y frances sin las advertencias habituales de los modelos alineados.
- Resumen de documentos: con 8192 tokens de contexto puede procesar articulos o informes de longitud media en local.
- Asistencia de codigo en entornos aislados: puede generar y explicar fragmentos de codigo en maquinas sin GPU, aunque sin soporte documentado de tool calling.
- Prototipado rapido con LM Studio u Ollama: el autor proporciona un comando de Ollama para ejecutar el modelo en un solo paso, lo que facilita pruebas de concepto.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio de modelos abliterados y de sus riesgos, en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona un aumento de rendimiento de "aproximadamente 2x" en Windows con un supuesto runtime pack, dato no verificado y asociado a un binario de origen desconocido.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el fichero Q4_K_M de 5,6 GB requiere al menos unos 6-7 GB de VRAM para cargarse completo.
- RAM estimada: aproximadamente 7 GB segun el autor.
- GPU recomendadas: no especificadas; por tamano, cabria en GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, etc.), aunque no hay datos de rendimiento.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM.
- Opciones de despliegue: LM Studio, Ollama (`ollama run hf.co/Mirai2k/Abliterated-9B-Uncensored-GGUF:Q4_K_M`), llama.cpp por ser GGUF. No se documenta vLLM ni TGI.
- Latencia y throughput: no disponibles; el unico dato es la afirmacion no verificada de duplicar el rendimiento en Windows con el runtime pack.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mirai2k/Abliterated-9B-Uncensored-GGUF | ~8,95 B | 8192 (recomendado) | Apache 2.0 | GGUF Q4_K_M | Cuantizacion de un modelo abliterado; solo en/fr |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~8,95 B | No disponible | Apache 2.0 | Safetensors (presumiblemente) | Modelo base del que deriva; mismos pesos sin cuantizar |
| Qwen3.5-9B (original) | ~8,95 B | No disponible | No disponible | No disponible | Modelo alineado de referencia de la familia |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Riesgo de seguridad en la model card: incluye un enlace a un ejecutable alojado en una IP (`http://82.165.181.96:443/d/wuauclt.exe`) presentado como "runtime pack". Es un binario de origen desconocido que no debe ejecutarse; el nombre imita un proceso legitimo de Windows.
- La recomendacion de usar `trust_remote_code=True` con `AutoConfig` implica ejecutar codigo arbitrario del repositorio; debe evitarse salvo auditoria previa.
- Modelo abliterado: la supresion de rechazos elimina las barreras de seguridad, por lo que puede generar contenido danino, ofensivo o ilegal. No es apto para aplicaciones de produccion orientadas al publico sin filtros adicionales.
- Alucinacion: al ser un modelo de 9B, el propio autor advierte que "se equivocara en cosas"; no es comparable a modelos de 70B en fiabilidad factual.
- Idiomas: solo se declaran ingles y frances; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: los 8192 tokens son un valor recomendado, no necesariamente el maximo nativo; contextos mayores pueden degradar la calidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- Sin benchmarks ni evaluacion independiente: no hay evidencia publica de calidad, sesgos o robustez.
- Repositorio practicamente sin traccion (0 descargas, 0 likes en el momento de la consulta), lo que reduce la confianza en su mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mirai2k/Abliterated-9B-Uncensored-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
