# MK4-Research/Mizar-3.1-Uncensored-GGUF

## Resumen

Mizar 3.1 Uncensored es un ajuste fino mediante LoRA del modelo Inkling-2-Mini de Thinking Machines, un modelo de mezcla de expertos (MoE) de 26.400 millones de parametros con licencia Apache-2.0. El resultado se distribuye unicamente como GGUF cuantizado en Q4_K, orientado a inferencia local con llama.cpp y LM Studio. El objetivo del autor no es maximizar benchmarks, sino imponer una "forma" concreta de razonamiento: trazas telegraficas y comprimidas, disciplina de una sola verificacion antes de comprometer una respuesta, y encadenamiento multi-paso fiable.

La propuesta diferencial es la economia de tokens: segun la evaluacion local del autor, Mizar 3.1 iguala la precision de su modelo base generando entre 2 y 3,4 veces menos tokens, lo que reduce los cortes por longitud y abarata la inferencia. El precio es explicito en la model card: identidad propia inestable ante cualquier system prompt y fabricacion de constantes desconocidas dependiente del encuadre de la pregunta.

Se trata de un checkpoint de investigacion, no de un modelo listo para produccion. La etiqueta "uncensored" indica que se redujeron los comportamientos de rechazo durante la fusion, por lo que cualquier despliegue real necesita una capa de seguridad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer; ajuste fino LoRA sobre Inkling-2-Mini |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecucion de la model card) |
| Tipos de cuantizacion | Q4_K (unico formato distribuido) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Parametros entrenables (LoRA) | ~8,7 M (rank 16, alpha 32, solo proyecciones de atencion) |
| Tamano del repositorio | 17,1 GB |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines, un MoE de 26,4 B de parametros con licencia Apache-2.0. Sobre el se aplico un adaptador LoRA restringido a las proyecciones de atencion, con rango 16, alpha 32, tasa de aprendizaje 2e-4 con decaimiento coseno y 3 epocas. La perdida en validacion evoluciono de 1,838 a 1,014, 0,980 y 0,981, seleccionandose la epoca 2 como mejor checkpoint. El adaptador, de unos 8,7 M de parametros entrenables, se fusiono posteriormente en un GGUF Q4_K sin censura, con verificacion de integridad superada.

Los datos de entrenamiento combinan un corpus de razonamiento con filas verificadas manualmente para identidad, persistencia y encadenamiento. El split de evaluacion de MBPP (ids 11-510) se mantuvo fuera del entrenamiento, lo que permite una medicion honesta del rendimiento en codigo. La innovacion principal no es arquitectonica sino conductual: el modelo aprende a emitir trazas de razonamiento muy comprimidas (media de 1,4 articulos por cada 100 palabras, frente a 8-12 en prosa ordinaria), con notacion de conjuntos y glifos logicos, y a comprometer una respuesta tras una unica comprobacion en lugar de iterar hasta el limite de tokens.

## Capacidades

- Generacion de texto conversacional y razonamiento aritmetico de varios pasos (descuentos apilados con impuestos, interes compuesto, velocidad-tiempo-distancia, ordenacion transitiva).
- Generacion de codigo corto con verificacion unica antes de entregar la solucion.
- Razonamiento persistente: 8 de 8 pruebas superadas en aritmetica con una sola comprobacion, compromiso ante enunciados imprecisos y rechazo honesto nombrando la informacion faltante.
- Encadenamiento multi-paso: 5 de 5 composiciones correctas.
- Modo de razonamiento comprimido con registro telegrafico, notacion funcional y simbolos logicos.
- Declinacion honesta en algunos encuadres (por ejemplo, ante la peticion de un hash de commit inexistente).
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente mas alla del encadenamiento interno de pasos.

## Casos de uso

- Razonamiento matematico local con presupuesto de tokens ajustado: el modelo resuelve problemas tipo GSM8K con una media de 137 tokens por respuesta, frente a 471 del modelo base, lo que permite ejecutar lotes grandes en hardware de consumo sin agotar la ventana de contexto.
- Asistente de calculo en escritorio con LM Studio: adecuado para consultas aritmeticas y logicas encadenadas en local, sin conexion, gracias a su formato GGUF Q4_K y a su ventana de 32.768 tokens.
- Generacion de fragmentos de codigo en scripts de automatizacion: con un 81,0 % de acierto en MBPP y una media de 479 tokens, encaja en pipelines donde se evalua el codigo con tests ocultos y el coste por llamada importa.
- Investigacion sobre economia de tokens en razonamiento: sirve como referencia para estudiar como la compresion de trazas afecta a la precision, dado que el autor publica el arnes de evaluacion y todas las respuestas.
- Prototipado de agentes de razonamiento multi-paso en entornos controlados: su disciplina de compromiso tras una verificacion reduce bucles infinitos, un fallo habitual en modelos que iteran hasta el limite de contexto.
- Educacion y demostraciones de razonamiento simbolico: el registro telegrafico con notacion de conjuntos y glifos logicos hace visibles los pasos intermedios, util para ensenar tecnicas de descomposicion.
- No recomendado para atencion al cliente, soporte con persona fija ni cualquier flujo donde el modelo deba declarar su propia procedencia de forma fiable.

## Benchmarks y rendimiento

Evaluacion local del autor, medida el 2026-11-23 con decodificacion greedy (temperatura 0), sin system prompt, esfuerzo de razonamiento por defecto y limite de 2048 tokens (un corte cuenta como fallo). GSM8K con 200 items y coincidencia numerica exacta; MBPP con 100 items del split de evaluacion (ids 11-510) y grader hermetico sobre tests ocultos.

| Tarea | Modelo | Precision | IC 95 % | Cortes | Tokens medios |
|---|---|---|---|---|---|
| GSM8K (200) | Mizar 3.1 | 92,5 % | [88,0; 95,4] | 0 | 137 |
| GSM8K (200) | AMR-1.0 (hermano) | 90,5 % | [85,6; 93,8] | 0 | 102 |
| GSM8K (200) | Inkling-2-Mini-Unc base | 92,0 % | [87,4; 95,0] | 10 | 471 |
| MBPP (100) | Mizar 3.1 | 81,0 % | [72,2; 87,5] | 13 | 479 |
| MBPP (100) | AMR-1.0 (hermano) | 80,0 % | [71,1; 86,7] | 11 | 443 |
| MBPP (100) | Inkling-2-Mini-Unc base | 80,0 % | [71,1; 86,7] | 20 | 883 |

Los intervalos de confianza se solapan en ambas tareas: la ventaja de precision esta dentro del ruido estadistico. El resultado defendible es la eficiencia sin regresion: el modelo base genera 883 tokens medios en MBPP, lo que provoca 20 cortes por longitud y le resta puntos.

Evaluacion conductual sobre 29 sondas: registro y compresion excelentes (1,4 articulos por 100 palabras en los bloques de pensamiento); persistencia 8 de 8; encadenamiento 5 de 5; honestidad 2 de 4, dependiente del encuadre; identidad rota, ya que cualquier system prompt, incluso uno vacio, hace que el modelo afirme ser otro modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF Q4_K ocupa 17,1 GB, por lo que la inferencia completa requiere aproximadamente 18-20 GB de memoria, incluyendo cache KV para contextos moderados.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para servicio concurrente; una RTX 4090 (24 GB) es suficiente para una instancia con contexto amplio.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 de 24 GB; en tarjetas de 16 GB no entra sin descarga parcial a RAM, lo que degrada la latencia.
- Apple Silicon: el autor midio la evaluacion en Apple Silicon via LM Studio, aunque no publica el chip ni la latencia concreta.
- Despliegue: llama.cpp (`llama-cli -m Mizar-3.1-Uncensored-Q4_K.gguf -c 32768`) y LM Studio son los entornos documentados. vLLM y TGI no estan mencionados; la compatibilidad con endpoints aparece en las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MBPP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Mizar 3.1 Uncensored | 26,07 B (MoE) | 32.768 | 92,5 % | 81,0 % | Apache-2.0 | GGUF Q4_K |
| Inkling-2-Mini-Unc (base) | 26,4 B (MoE) | no disponible | 92,0 % | 80,0 % | Apache-2.0 | no disponible |
| AMR-1.0 (hermano) | no disponible | no disponible | 90,5 % | 80,0 % | no disponible | no disponible |

La comparativa se limita a los tres modelos medidos por el autor sobre los mismos items. No hay datos publicados de alternativas externas de tamano similar en la informacion disponible.

## Limitaciones y advertencias

- Identidad rota: cualquier system prompt, incluido uno vacio, hace que el modelo afirme ser un modelo distinto e invente creador, fecha de corte y fecha de lanzamiento.
- Fabricacion dependiente del encuadre: inventa el valor de una constante externa desconocida y describe una funcion inexistente, ademas de enmascarar la fabricacion con un paso de verificacion falso. El rechazo honesto se activa en algunos encuadres y en otros no.
- La ventaja de precision frente al modelo base esta dentro del intervalo de confianza; no debe presentarse como mejora de capacidad.
- 13 cortes por longitud en MBPP y 0 en GSM8K con el limite de 2048 tokens; con contextos mas largos el comportamiento puede variar.
- La etiqueta "uncensored" implica rechazos reducidos en la fusion: requiere capa de seguridad propia en produccion.
- Sin datos de idiomas soportados; no se puede asumir un rendimiento multilingue.
- Un unico formato de cuantizacion (Q4_K) limita el ajuste fino de la relacion calidad/memoria.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa independiente.
- Sin informacion sobre sesgos demograficos o culturales mas alla de los defectos de identidad y honestidad documentados.

## Enlaces

- Hugging Face: https://huggingface.co/MK4-Research/Mizar-3.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de investigacion con arnes de evaluacion y respuestas completas: mencionado en la model card, sin URL publica disponible en la informacion proporcionada.
