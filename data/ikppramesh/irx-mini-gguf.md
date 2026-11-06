# ikppramesh/irx-mini-GGUF

## Resumen

IRx-mini es el miembro mas pequeno de la familia IRx, un conjunto de modelos conversacionales disenados por el desarrollador ikppramesh para ejecutarse de forma completamente offline en telefonos y tablets. El modelo se distribuye unicamente en formato GGUF cuantizado (Q8_0, ~1,1 GB) y esta pensado para dispositivos con solo 4 GB de RAM, un segmento que los modelos mas grandes de la familia no pueden cubrir. Su propuesta es la privacidad radical: nada de lo que escribe el usuario sale del dispositivo, sin cuenta ni conexion a internet.

Tecnicamente se trata de un transformer denso de aproximadamente 999,9 millones de parametros (cifra real reportada en safetensors), con una ventana de contexto recomendada de 8192 tokens y una plantilla de chat embebida en el propio archivo GGUF que desactiva de forma forzada el modo "thinking" de llama.cpp. El autor declara un rendimiento de unos 89 tokens/s en CPU de Mac, lo que lo convierte en el mas rapido de la familia.

Su relevancia actual radica en la demanda de asistentes de IA en dispositivo para mercados con conectividad limitada o cara, y en escenarios donde la confidencialidad es un requisito. Es, sin embargo, un modelo de gama muy baja en capacidad: el propio autor advierte que ofrece respuestas cortas, comete mas errores que los modelos mayores y no debe usarse como sustituto de profesionales en materias sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor recomendado en la model card) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado: `irx-mini-Q8_0.gguf`, ~1,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp y derivados) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de tratarse de un modelo conversacional compatible con llama.cpp. El recuento de parametros (999,9 millones) y el tamano del archivo Q8_0 (~1,1 GB) son coherentes con un transformer denso de ~1B parametros cuantizado a 8 bits. El repositorio incluye la etiqueta `imatrix`, lo que sugiere que la cuantizacion se genero con informacion de matriz de importancia (importance matrix) para preservar calidad en la compresion.

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. El autor indica que el modelo se reconstruye y revisa semanalmente y que esta entrenado con noticias hasta el 4 de noviembre de 2026, pero no aporta detalles sobre el proceso. Una particularidad destacable es que la identidad del modelo (nombre y creador) esta entrenada dentro del propio modelo, de modo que no requiere system prompt, y que la plantilla de chat embebida mantiene el modo de razonamiento desactivado de forma permanente.

## Capacidades

- Generacion de texto conversacional para respuestas cortas y explicaciones simples.
- Ayuda cotidiana: conversiones de unidades, listas breves, calculos sencillos (por ejemplo, porcentajes).
- Redaccion basica de mensajes y textos de una linea para pequenos negocios.
- Explicaciones educativas simplificadas (por ejemplo, conceptos de ciencias a nivel introductorio).
- Funcionamiento 100 % offline en llama.cpp, sin llamadas a red ni cuentas de usuario.
- Integracion con apps basadas en llama.cpp: PocketPal, LM Studio, llama.rn, Ollama.
- Plantilla de chat integrada que desactiva el modo "thinking" para evitar que se agote el contexto antes de responder.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingues.

## Casos de uso

- Asistente personal offline en telefonos de gama baja: con ~1,3 GB de memoria en ejecucion, cabe en dispositivos de 4 GB de RAM y responde a consultas cotidianas sin conexion, lo que lo hace util en zonas con cobertura debil o planes de datos limitados.
- Apoyo a agricultores en campo: consultas rapidas sobre riego, redaccion de mensajes a compradores y recordatorios, siempre que se verifiquen los datos agronomicos criticos por el riesgo de alucinacion.
- Herramienta de estudio para estudiantes: generacion de preguntas tipo test y explicaciones simples de conceptos, adecuada por su bajo coste de ejecucion y su disponibilidad sin red.
- Redaccion comercial minima para pequenos comercios: ofertas de una linea, calculos de margen y textos breves de marketing directamente desde el movil del tendero.
- Soporte basico a desarrolladores: aclaracion de conceptos elementales (por ejemplo, codigos HTTP) en entornos sin acceso a servicios en la nube.
- Asistencia en viaje: listas de equipaje, conversiones de temperatura y sugerencias practicas sin depender de roaming ni de datos moviles.
- Despliegue embebido en apps moviles con llama.rn: integracion de un chat privado dentro de una aplicacion iOS/Android sin backend, gracias al archivo GGUF unico y a la plantilla de chat incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la velocidad de generacion medida en CPU de Mac: aproximadamente 89 tokens/s para IRx-mini, frente a unos 51 tokens/s de IRx-1 en la misma prueba.

## Requisitos de hardware

- VRAM/memoria estimada: ~1,3 GB en ejecucion segun el autor; archivo de ~1,1 GB en disco.
- Dispositivos objetivo: telefonos y tablets con 4 GB de RAM (Android de gama baja, iPhone/iPad); el autor recomienda IRx-2 si el dispositivo tiene 8 GB o mas.
- GPU: no se especifican requisitos de GPU; el modelo esta orientado a inferencia en CPU.
- Cabe en GPU de consumo (por ejemplo, RTX 4090) con holgura, aunque no es su escenario de diseno.
- Opciones de despliegue: llama.cpp (`llama-cli -m irx-mini-Q8_0.gguf --jinja -c 8192`), PocketPal, LM Studio, llama.rn, Ollama.
- Throughput: ~89 tokens/s en CPU de Mac (dato del autor); latencia en moviles no disponible.
- Configuracion recomendada: contexto 8192, max new tokens 1024, temperature 0.7, top-p 0.95, min-p 0.05, repeat penalty 1.1, system prompt vacio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano descarga | Licencia | Notas |
|---|---|---|---|---|---|
| IRx-mini | ~1B | 8192 | ~1,1 GB (Q8_0) | Apache 2.0 | Orientado a telefonos de 4 GB de RAM; ~89 tok/s en CPU de Mac |
| IRx-1 (misma familia) | no disponible | no disponible | ~1,2 GB | Apache 2.0 | Respuestas rapidas en casi cualquier telefono; ~51 tok/s |
| IRx-2 (misma familia) | no disponible | no disponible | ~2,7 GB | Apache 2.0 | Mejor equilibrio calidad/velocidad; requiere 8 GB+ de RAM |
| IRx-2 Pro (misma familia) | no disponible | no disponible | ~5,3 GB | Apache 2.0 | Respuestas largas; requiere 12 GB+ de RAM |

No se dispone de datos de benchmarks que permitan comparar IRx-mini con modelos de otros desarrolladores de tamano similar.

## Limitaciones y advertencias

- No es un modelo de escala frontier: no iguala a servicios alojados grandes en razonamiento multi-paso dificil, programacion compleja ni amplitud de conocimiento.
- Riesgo alto de alucinacion: puede afirmar con seguridad datos falsos; el autor recomienda verificar precios, medicamentos y dosis, leyes y consejos agricolas locales (variedades de semilla, cantidades de quimicos, meteorologia).
- No sustituye a profesionales en materia medica, legal ni de seguridad.
- Respuestas mas cortas y con mas errores que los modelos mayores de la propia familia.
- Idiomas soportados no documentados; no hay garantia de calidad multilingue.
- Contexto limitado a 8192 tokens, insuficiente para documentos largos o conversaciones extensas.
- La plantilla embebida desactiva el modo de razonamiento; el toggle de la app no tiene efecto, lo que limita el razonamiento explicito.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias; conviene evaluar su calidad antes de integrarlo en produccion.
- Al actualizar desde una descarga anterior hay que borrar el archivo antiguo manualmente; las apps no lo reemplazan solas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ikppramesh/irx-mini-GGUF
- Hugging Face (MLX, para Mac): https://huggingface.co/ikppramesh/irx-mini
- IRx-1 GGUF: https://huggingface.co/ikppramesh/irx-1-GGUF
- IRx-1 MLX: https://huggingface.co/ikppramesh/irx-1
- IRx-2 GGUF: https://huggingface.co/ikppramesh/irx-2-GGUF
- IRx-2 MLX: https://huggingface.co/ikppramesh/irx-2
- IRx-2 Pro GGUF: https://huggingface.co/ikppramesh/irx-2-pro-GGUF
- IRx-2 Pro MLX: https://huggingface.co/ikppramesh/irx-2-pro
- Tablero comparativo IRx: https://claude.ai/artifact/1ha4zVccAwrKSm3mjKBLFU
