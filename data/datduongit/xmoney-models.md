# datduongit/xmoney-models

## Resumen
X-Money reader model es una adaptacion del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el usuario datduongit, destinada a la aplicacion movil X-Money. Se distribuye en formato ONNX cuantizado a 4 bits y reducido a 378 MB, con el objetivo de ejecutarse en el propio telefono (on-device) sin depender de la nube. Su funcion concreta es la lectura de entradas habladas y recibos: extrae el importe y el comercio o titulo del texto transcrito o impreso.

El modelo no es un modelo generalista nuevo, sino una especializacion de Qwen3-0.6B (aproximadamente 600 millones de parametros) orientada a una tarea de extraccion de informacion muy acotada. La model card indica que solo copia el importe y el nombre del comercio o titulo, y que cada valor se valida contra lo que se dijo o se imprimio, lo que sugiere un diseno de bajo riesgo con verificacion posterior.

Su relevancia radica en el despliegue on-device: un modelo de 0,6B en ONNX de 378 MB puede ejecutarse en moviles de gama media sin conexion, lo que resulta util para aplicaciones financieras que necesitan privacidad y baja latencia. La licencia Apache 2.0 facilita su reutilizacion, aunque la informacion publica disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-0.6B); no se detalla en la model card |
| Parametros totales | Aproximadamente 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (ONNX), tamano final de 378 MB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx) y tokenizer.json |

## Arquitectura y entrenamiento
El modelo deriva de Qwen3-0.6B, un transformer denso de aproximadamente 600 millones de parametros. La version publicada se ha convertido a ONNX y cuantizado a 4 bits, reduciendo el peso a 378 MB para su descarga y ejecucion en dispositivos moviles dentro de la aplicacion X-Money. La model card no especifica la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo etapas de ajuste fino supervisado, RLHF o DPO sobre el modelo base.

La innovacion tecnica destacable es el empaquetado para inferencia on-device: formato ONNX, cuantizacion a 4 bits y ficheros fijados a la etiqueta `reader-v1` con hashes SHA-256 publicados (model.onnx y tokenizer.json), lo que permite verificar la integridad de los artefactos descargados por la app. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Extraccion de informacion de texto: identificacion del importe y del comercio o titulo en entradas habladas transcritas y en recibos.
- Validacion de valores: segun la model card, cada valor extraido se contrasta con lo que se dijo o se imprimio.
- Inferencia on-device: ejecucion local en el telefono mediante ONNX, sin necesidad de conexion a la nube.
- Generacion de texto general: capacidad heredada del modelo base Qwen3-0.6B, aunque no se documenta su uso para otras tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Registro de gastos por voz en la app X-Money: el usuario dicta una entrada ("cafe 2,50 en la cafeteria") y el modelo extrae el importe y el comercio para rellenar el registro automaticamente, sin enviar datos a servidores externos.
- Digitalizacion de recibos en el movil: a partir del texto OCR de un ticket, el modelo identifica el total y el nombre del establecimiento, lo que agiliza la contabilidad personal.
- Procesamiento con privacidad: al ejecutarse on-device, los datos financieros del usuario no salen del telefono, lo que resulta adecuado para aplicaciones sensibles.
- Funcionamiento sin conexion: util en entornos con conectividad limitada, ya que el modelo de 378 MB se descarga una vez y opera localmente.
- Validacion asistida de entradas: el mecanismo de contraste de valores permite marcar discrepancias entre lo dictado y lo extraido, reduciendo errores en el registro.
- Integracion en pipelines moviles ligeros: el formato ONNX permite desplegar el modelo con runtimes de inferencia en Android e iOS sin infraestructura de servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica en el sentido tradicional; al ser un modelo on-device de 378 MB en 4 bits, el consumo de memoria es del orden de varios cientos de MB en el dispositivo.
- GPU recomendadas: no disponible; el destino son CPUs y aceleradores integrados en telefonos moviles.
- Cabe en GPU consumer: si, por tamano (0,6B en 4 bits), aunque no se documenta su ejecucion en GPU de escritorio.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); otras opciones como vLLM, llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| X-Money reader model | ~0,6B | No disponible | ONNX 4 bits | Apache 2.0 | Especializado en extraccion de importes y comercios; on-device |
| Qwen3-0.6B (base) | ~0,6B | No disponible en esta ficha | Safetensors y otros | Apache 2.0 | Modelo generalista del que deriva |
| Alternativas on-device de ~0,5B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias
- Ambito muy restringido: el modelo esta disenado para copiar el importe y el comercio o titulo; no se documenta su comportamiento fuera de esa tarea.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, puede producir valores incorrectos; la model card indica que cada valor se valida contra el texto original, lo que mitiga pero no elimina el riesgo.
- Idiomas soportados: no disponibles, lo que impide garantizar su funcionamiento en castellano u otros idiomas sin pruebas.
- Contexto maximo: no disponible; entradas largas o recibos complejos podrian degradar la extraccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el proceso de cuantizacion o el ajuste fino.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Ficheros fijados a la etiqueta `reader-v1` con hashes publicados: conviene verificar la integridad antes de desplegar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/datduongit/xmoney-models
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
