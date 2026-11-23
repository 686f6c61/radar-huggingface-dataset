# JIN0593/CodeRed-Phi-4-mini-health-GGUF

## Resumen

CodeRed-Phi-4-mini-health-GGUF es un ajuste fino del modelo microsoft/Phi-4-mini-instruct (3.836.021.856 parametros) desarrollado por JIN0593 para una tarea muy concreta: redactar el resumen de salud de CodeRed, una aplicacion de seguimiento del ciclo menstrual que ejecuta el modelo en el propio telefono mediante llama.cpp. El modelo no calcula nada: la aplicacion ya computa internamente todas las banderas de sintomas y las metricas numericas, y el modelo se limita a convertir esos datos estructurados en unos pocos parrafos en lenguaje natural.

La relevancia de esta ficha no esta en el rendimiento general del modelo, sino en el patron de despliegue: un ajuste fino pequeno, cuantizado a Q4_K_M con importance matrix, pensado para inferencia local en dispositivos moviles y para una unica plantilla de prompt. El autor publica una evaluacion centrada en esa plantilla, con criterios estrictos (ausencia de numeros inventados, presencia de todas las secciones solicitadas, sin repeticiones ni cortes), y compara contra el Phi-4-mini-instruct original.

Es importante subrayar que no es un asistente general ni una herramienta medica: los resumenes se muestran en la aplicacion etiquetados como generados por IA y no como consejo medico. La licencia es MIT, heredada del modelo base, y el unico idioma declarado y evaluado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-mini-instruct; detalles internos de la familia Phi-4-mini no disponibles en la informacion proporcionada) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M con importance matrix (unico archivo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales del artefacto: archivo `CodeRed-Phi-4-mini-health-Q4_K_M.gguf`, 2.493.840.320 bytes, SHA-256 `a0b67094f10b60925ea8b811dd61f17f891ed603a7a8e1cd6c01dc58f09d2cdd`. El tokenizer y la plantilla de chat son los mismos que en unsloth/Phi-4-mini-instruct-GGUF. Tamano del repositorio: 2,5 GB.

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct, un transformer decoder-only de aproximadamente 3,8 mil millones de parametros. Sobre esa base se aplico un ajuste en dos etapas. La primera es un LoRA con rango 16 y alpha 32, durante tres epocas, sobre 2.840 resumenes de referencia generados por Qwen3-32B; cada resumen se conservo solo si superaba las comprobaciones de respuesta de la aplicacion, una comprobacion numerica y una comprobacion de estructura. La segunda etapa es un DPO sobre 1.244 pares construidos con las respuestas fallidas del propio modelo ajustado frente a respuestas validas, incluyendo casos de respuestas que se cortan demasiado pronto o que se extienden mas alla de la ultima seccion.

Los datos de entrenamiento son exclusivamente sinteticos: 3.650 historias de seguimiento menstrual generadas por un generador cuyos parametros son agregados publicados, etiquetadas por los propios calculos de banderas de la aplicacion. No se uso ningun dato de personas reales. Tras el entrenamiento, los pesos se fusionaron en float32 y se cuantizaron a Q4_K_M con una importance matrix derivada de los prompts y resumenes de entrenamiento. No se documentan innovaciones arquitectonicas propias: el valor anade en el ajuste y en la cuantizacion, no en el diseno del modelo.

## Capacidades

- Generacion de texto breve en ingles a partir de datos estructurados: convierte banderas de sintomas y cifras del ciclo en unos pocos parrafos.
- Respeto de una estructura de secciones fija, definida por la plantilla de prompt de la aplicacion.
- Restriccion numerica: el criterio de evaluacion exige que no aparezca ningun numero (en digitos o en palabras) que no este en los datos de la persona.
- Calibracion de la alarma: el modelo debe evitar suscitar preocupacion cuando no se ha activado ninguna bandera.
- Ejecucion local en movil mediante llama.cpp, con pesos GGUF Q4_K_M.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido segun la informacion disponible.
- Multilingue: no. Solo ingles declarado y evaluado.

## Casos de uso

- Resumen de salud dentro de la aplicacion CodeRed: es el caso de uso para el que fue entrenado; recibe las banderas calculadas por la app y las cifras del ciclo y devuelve un texto etiquetado como generado por IA y no como consejo medico.
- Inferencia completamente offline en el telefono: al ser un GGUF Q4_K_M de unos 2,5 GB, permite generar el resumen sin enviar datos de salud a un servidor, lo que reduce la superficie de exposicion de datos personales.
- Prototipado de asistentes de salud de dominio acotado: sirve como referencia de como ajustar un modelo pequeno para que respete una plantilla estricta y no invente cifras.
- Investigacion sobre fidelidad numerica en modelos pequenos: los criterios de evaluacion publicados (numeros inventados, secciones faltantes, cortes) son reutilizables como banco de pruebas para tecnicas de DPO y cuantizacion.
- Evaluacion de cuantizacion con importance matrix: el autor documenta el efecto de Q4_K_M con imatrix sobre una tarea sensible a la precision, util para comparar estrategias de cuantizacion en modelos de ~4B.
- Base para experimentos de alineacion con DPO en dominios con criterios verificables: el conjunto de pares fallo/exito descrito es un ejemplo de construccion automatica de preferencias a partir de comprobaciones programaticas.

## Benchmarks y rendimiento

Evaluacion realizada con llama.cpp a temperatura 0 y 1000 tokens, sobre el prompt de la aplicacion. Un resumen se considera valido si supera las comprobaciones de la app, no contiene ningun numero ausente en los datos de la persona y presenta todas las secciones solicitadas, sin repeticiones ni cortes.

| Prueba | Modelo ajustado | Phi-4-mini-instruct Q4_K_M original |
|---|---|---|
| 17 casos de prueba de la app | 16 pasan | 3 pasan |
| 120 casos de bench | 109 pasan | 26 pasan |
| 600 historias sinteticas de test | 566 pasan | 154 pasan |
| Respuestas con un numero inventado (sobre 600) | 13 | 275 |
| Alarma suscitada sin bandera activa (sobre 400) | 5 | 158 |
| 170 historias con cefalea, nausea, insomnio o fatiga frecuentes | 163 pasan | 32 pasan |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden exclusivamente el cumplimiento de la tarea de resumen de la aplicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 2,49 GB; con overhead de contexto y buffers de llama.cpp, el consumo se situa por encima de esa cifra, aunque no se publica una medicion concreta.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU consumer con al menos 4-6 GB de memoria libre es candidata, pero no hay datos medidos.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 6 GB o mas; sin mediciones publicadas.
- Despliegue: llama.cpp (formato nativo GGUF); el autor declara compatibilidad con endpoints, pero no detalla otros motores como vLLM, TGI u Ollama.
- Latencia y throughput: no medidos. El autor indica explicitamente que el modelo aun no se ha medido en telefonos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeRed-Phi-4-mini-health-GGUF | 3,84B | no disponible | Ajuste fino de dominio para resumen de salud en una app movil | MIT | GGUF Q4_K_M en Hugging Face |
| microsoft/Phi-4-mini-instruct | 3,84B | no disponible | Modelo general de instrucciones | MIT | Pesos originales y multiples cuantizaciones |
| unsloth/Phi-4-mini-instruct-GGUF | 3,84B | no disponible | Cuantizaciones GGUF del modelo base | MIT | Varios niveles de cuantizacion |
| Qwen3-32B | 32B | no disponible | Modelo general de mayor tamano, usado aqui como generador de resumenes de referencia | Apache-2.0 | Pesos y cuantizaciones en Hugging Face |

La comparacion relevante es contra el Phi-4-mini-instruct original: mismo tamano y licencia, pero el ajuste multiplica la tasa de exito en la plantilla de la aplicacion y reduce drasticamente los numeros inventados (13 frente a 275 sobre 600 historias). Frente a Qwen3-32B, la diferencia es de orden de magnitud en coste de inferencia, lo que justifica el ajuste para ejecucion en dispositivo.

## Limitaciones y advertencias

- Entrenado y evaluado solo en ingles y sobre una unica plantilla de prompt; otros prompts e idiomas no se han medido.
- Entrenado con historias sinteticas, no con datos reales; el comportamiento sobre distribuciones reales de usuarios no esta validado.
- Persisten errores de atribucion: algunas respuestas asocian una cifra correcta al concepto equivocado (por ejemplo, llamar al ciclo mas largo el mas reciente).
- No es una herramienta medica ni un asistente general; los resumenes se presentan en la app como generados por IA y no como consejo medico.
- Riesgo de alucinacion numerica residual: 13 de 600 respuestas contenian un numero inventado en la evaluacion publicada.
- No medido en telefonos, que es precisamente el entorno de despliegue previsto.
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes de mayor o menor precision para comparar el impacto de la cuantizacion.
- Licencia MIT permite uso comercial, pero el uso en contextos de salud exige evaluacion y supervision propias por parte del integrador.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JIN0593/CodeRed-Phi-4-mini-health-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Cuantizaciones de referencia del modelo base: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
