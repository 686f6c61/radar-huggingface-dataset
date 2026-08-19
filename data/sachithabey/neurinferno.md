# sachithabey/neurinferno

## Resumen

NeurInferno es un modelo de transformador desarrollado por Sachith Abeywickrama (sachithabey) para la inferencia de límites de campos en mensajes de protocolo binario sin etiquetar. El modelo opera sobre lotes de mensajes hexadecimales del mismo formato y utiliza estadísticas entre mensajes en cada desplazamiento de byte para identificar las fronteras de los campos, una tarea relevante en ingeniería inversa de protocolos y análisis de tráfico de red.

El modelo se distribuye como una demostración para CPU con una interfaz Gradio, e incluye un checkpoint de pesos de aproximadamente 15 MB entrenado con la técnica LOPO (leave-one-protocol-out) sobre el protocolo Modbus, usando los otros once protocolos del conjunto de entrenamiento más datos de gramática. No es un parser específico de protocolo, sino un demostrador general. El repositorio en Hugging Face no contiene pesos completos del modelo base, solo el checkpoint de demostración y el código de la aplicación.

La relevancia actual del modelo radica en su enfoque novedoso: en lugar de requerir datos etiquetados o parsers específicos, utiliza señales estadísticas entre mensajes para inferir la estructura de campos, lo que puede ser útil en entornos donde no se dispone de especificaciones de protocolo o donde estas son propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin detalles adicionales en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo trabaja con datos binarios hexadecimales, no con texto natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch (weights/model.ckpt, ~15 MB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformador (numero de capas, dimensiones, atencion, etc.). Se sabe que el modelo procesa un lote de mensajes hexadecimales del mismo formato, uno por linea, y calcula estadisticas entre mensajes en cada posicion de byte para determinar los limites de campo. El entrenamiento se realizo con la tecnica LOPO (leave-one-protocol-out): el checkpoint incluido se entreno con once protocolos mas datos de gramatica, dejando Modbus como protocolo de validacion. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Inferencia de limites de campo en mensajes binarios de protocolo: identifica donde comienza y termina cada campo dentro de un mensaje.
- Procesamiento por lotes: requiere multiples mensajes del mismo formato para calcular estadisticas entre ellos; un solo mensaje no es una entrada valida.
- Demostracion incluida con ejemplos de ARP e IGMP.
- Ejecucion en CPU: el modelo esta disenado para funcionar sin GPU.
- Interfaz Gradio local para interaccion directa.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni funciones de agente.

## Casos de uso

- Ingenieria inversa de protocolos propietarios: dado un conjunto de capturas de trafico de un protocolo desconocido, el modelo puede ayudar a identificar la estructura de campos sin necesidad de especificaciones.
- Analisis de trafico de red en entornos OT/ICS: protocolos industriales como Modbus pueden ser analizados para detectar anomalias o comprender su formato.
- Investigacion academica en seguridad: estudio de metodologias de inferencia de estructura basadas en estadisticas entre mensajes.
- Desarrollo de parsers genericos: como punto de partida para generar parsers de protocolos binarios cuando no hay documentacion.
- Validacion de hipotesis de formato: si un investigador sospecha una cierta estructura de campos, puede usar el modelo para comprobar si las estadisticas la respaldan.
- Educacion y formacion: demostracion practica de tecnicas de analisis de protocolos en cursos de seguridad o redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint fue validado con el protocolo Modbus como hold-out LOPO, pero no se proporcionan metricas cuantitativas (precision, recall, F1, etc.).

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en CPU, por lo que no requiere GPU.
- El checkpoint de pesos ocupa aproximadamente 15 MB, lo que implica requisitos de memoria muy bajos (inferior a 1 GB de RAM para el modelo y la aplicacion Gradio).
- Cualquier ordenador moderno con Python y las dependencias de requirements.txt puede ejecutarlo.
- No se dispone de datos de latencia o throughput; al ser una demo CPU con un modelo pequeno, se espera una respuesta casi instantanea para lotes de mensajes tipicos.
- Opciones de despliegue: la aplicacion Gradio local es la unica opcion documentada. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. La tarea de inferencia de limites de campo en protocolos binarios es un nicho muy especifico y no hay alternativas publicas conocidas con las que comparar directamente.

## Limitaciones y advertencias

- El modelo requiere multiples mensajes del mismo formato como entrada; un solo paquete no es valido y producira resultados incorrectos.
- No debe usarse con trafico de produccion que contenga secretos, ya que el modelo procesa los datos sin cifrado y la demo no garantiza privacidad.
- El checkpoint incluido es una demostracion general, no un parser especifico de Modbus ni de ningun otro protocolo. Su precision en protocolos reales no esta garantizada.
- No hay informacion sobre sesgos, riesgo de alucinacion o limitaciones de idioma, al tratarse de datos binarios y no texto natural.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como demo y no se proporcionan garantias de rendimiento.
- No se especifica el tamano total del modelo base ni los requisitos de memoria para entrenamiento o fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachithabey/neurinferno
- Perfil del autor en Hugging Face: https://huggingface.co/sachithabey
- Coleccion de series temporales del autor: https://huggingface.co/collections/sachithabey/time-series
- Perfil de GitHub del autor: https://github.com/Sachithx
- Repositorio con papers relacionados (referencia externa): https://github.com/SuperInstance/SuperInstance-papers/blob/main/papers/15-neuromorphic-circuits/01-abstract.md
