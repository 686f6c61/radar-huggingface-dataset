# hotsteel09/small_llm_O1

## Resumen

TinyGPT-zh-15M es un modelo de lenguaje conversacional en chino entrenado desde cero por el usuario hotsteel09 y publicado en HuggingFace bajo el identificador `hotsteel09/small_llm_O1`. Se trata de un transformer decoder-only de 15,04 millones de parametros (12,59 millones sin contar embeddings) implementado a mano en PyTorch, sin reutilizar pesos preentrenados de ningun tipo: todos los parametros parten de inicializacion aleatoria y se entrenan en CPU.

El modelo resuelve un problema muy acotado: generar respuestas conversacionales en chino sobre un dominio cerrado de conocimiento (preguntas de sentido comun, definiciones, tutoriales paso a paso, acompanamiento emocional, razonamiento logico simple y charla cotidiana). Su relevancia es fundamentalmente didactica y de investigacion: demuestra que es posible construir un pipeline completo de entrenamiento de un LLM (tokenizador BPE propio, generacion de corpus por destilacion desde un modelo profesor, entrenamiento con gradiente acumulado y evaluacion) en hardware sin GPU.

La arquitectura es un transformer denso con normalizacion RMSNorm pre-norm, codificacion posicional rotatoria (RoPE), atencion con consultas agrupadas (GQA) y feed-forward SwiGLU, con weight tying entre el embedding de entrada y la proyeccion de salida. La longitud de contexto de entrenamiento es de 256 tokens y el vocabulario es de 6374 tokens BPE entrenado de forma propia. El modelo se distribuye bajo licencia MIT, solo soporta chino y su repo ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia en PyTorch) |
| Parametros totales | 15,04 M (12,59 M sin embeddings) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (`seq_len=256`) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint en punto flotante) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`, `ckpt/best.pt`) |
| Vocabulario | 6374 tokens, BPE entrenado por el autor (`tokenizer_v5.json`) |
| Dimension del modelo (`d_model`) | 384 |
| Capas | 8 |
| Cabezas de atencion | 6 cabezas de consulta, 2 cabezas KV (`n_kv_heads=2`) |
| Tamano del repo | 0,1 GB |
| Libreria declarada | pytorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only escrito a mano, sin depender del codigo de modelos de la libreria `transformers`. Incorpora RMSNorm en pre-normalizacion, RoPE para posiciones relativas, GQA donde varias cabezas de consulta comparten un numero reducido de grupos KV (2 grupos) para reducir el uso de memoria, y una red feed-forward SwiGLU. El embedding de entrada y la proyeccion de salida comparten pesos, lo que elimina aproximadamente 4 millones de parametros. La configuracion exacta es `d_model=384, n_layers=8, n_heads=6, n_kv_heads=2, seq_len=256`. Conviene senalar una discrepancia en la documentacion del autor: el texto descriptivo menciona "8 cabezas de consulta compartiendo 2 grupos KV", mientras que el comando de reproduccion y el archivo de configuracion indican `n_heads=6`. El dato de configuracion reproducible es 6 cabezas de consulta y 2 KV.

El entrenamiento se realizo integramente en CPU (32 nucleos, limite de memoria de cgroup de 8 GB) durante 134 minutos, con 6000 pasos, batch de 8 y acumulacion de gradiente de 3 pasos (batch efectivo de 24) para evitar el OOM. Se uso optimizacion con decaimiento coseno del learning rate (`lr=2.5e-3`) y evaluacion cada 500 pasos. Los datos no provienen de ningun corpus publico: el autor genero un corpus propio de dialogo en chino mediante destilacion desde un modelo profesor, organizado en seis tipos de tarea (41 temas de conocimiento general, 25 definiciones de conceptos, 16 tutoriales operativos, 8 categorias de acompanamiento emocional, 20 problemas de razonamiento logico, 29 variantes de charla cotidiana y tareas de aritmetica y conversion de unidades). El corpus final consta de aproximadamente 845 000 tokens y 19 700 conversaciones, con dialogos de hasta 8 turnos. El autor documenta tres problemas de entrenamiento corregidos: etiquetas sin desplazamiento a la derecha (que provocaba que el modelo aprendiera a copiar el token de entrada, con loss cercano a 0 pero generacion degenerada), sobrerrepresentacion del saludo "你好" al inicio del 85 % de los dialogos, y desajuste entre tamano de modelo y volumen de datos (37 M de parametros con 270 000 tokens no convergian; se redujo a 15 M con 845 000 tokens).

## Capacidades

- Generacion de texto conversacional en chino, en formato de dialogo multiturno.
- Respuestas de sentido comun sobre temas cotidianos (clima, astronomia, biologia, vida diaria) dentro de los 41 temas del corpus.
- Definiciones de conceptos tecnicos y abstractos (25 conceptos cubiertos).
- Explicaciones paso a paso de procedimientos ("como hacer X"), con 16 tutoriales en el corpus.
- Respuestas de acompanamiento emocional para 8 categorias de emociones.
- Razonamiento logico simple de un paso: el autor muestra ejemplos de silogismos de transitividad (comparacion de precios) y de aplicacion de reglas condicionales ("si A entonces B; A es verdadero; luego B").
- Charla cotidiana y variaciones de formulacion (29 formas distintas de pregunta diaria recogidas en el corpus).
- Capacidad de mantener coherencia en conversaciones de hasta 8 turnos dentro del dominio entrenado, con aperturas variadas (12 tipos de apertura distintos).
- No dispone de soporte de tool calling, function calling ni uso como agente; no hay indicios de modo "thinking", vision ni audio.
- Capacidad multilingue limitada exclusivamente al chino.

## Casos de uso

- Docencia de LLM desde cero: sirve como material de laboratorio para asignaturas o talleres donde se quiera mostrar el ciclo completo de construccion de un LLM (tokenizador BPE propio, generacion de corpus, bucle de entrenamiento con gradiente acumulado, evaluacion con loss y perplejidad). Su tamano de 15 M de parametros permite entrenarlo de principio a fin en una CPU en poco mas de dos horas.
- Despliegue en entornos sin GPU: al ocupar decenas de megabytes y requerir unicamente `torch` y `tokenizers`, puede ejecutarse en Raspberry Pi, contenedores de bajo consumo o funciones serverless para demos de chatbot en chino con requisitos minimos de recursos.
- Prototipo de chatbot de dominio cerrado en chino: dado que el modelo responde bien sobre los temas de su corpus (sentido comun, tutoriales, definiciones), puede usarse como banco de pruebas para validar la interfaz de usuario, el formato de respuesta y el flujo conversacional antes de invertir en un modelo mayor.
- Punto de partida para fine-tuning: es una base razonable para experimentar con ajuste sobre un corpus chino especifico propio (atencion al cliente de un vertical concreto, FAQ interna), dado que la licencia MIT permite uso comercial y modificacion y que el coste de reentrenamiento es muy bajo.
- Investigacion sobre destilacion de conocimiento: permite estudiar como un corpus generado por un modelo profesor se traduce en capacidades concretas en un estudiante de 15 M de parametros, y reproducir los fallos documentados por el autor (etiquetas mal alineadas, atajos por sobrerrepresentacion de plantillas).
- Generacion de respuestas breves de acompanamiento emocional: el modelo incluye 8 categorias de respuesta afectiva y puede emplearse en prototipos de asistente de bienestar con respuestas cortas, siempre con supervision humana y aviso explicito de que no sustituye atencion profesional.
- Filtro o preprocesado en pipelines en chino: puede usarse como generador auxiliar de plantillas de dialogo sintetico para aumentar corpus de entrenamiento de modelos mayores, aprovechando su bajo coste de inferencia en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Se obtienen sobre un corpus de dialogo chino autoconstruido, por lo que no son comparables con benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Validation Loss | corpus de dialogo chino autoconstruido (custom) | 0,1128 | No |
| Validation Perplexity | corpus de dialogo chino autoconstruido (custom) | 1,12 | No |

El autor reporta ademas una tasa de respuesta efectiva de 25 sobre 25 en su conjunto de evaluacion interna (`evaluate.py`) y una curva de validacion que desciende de 0,43 a 0,113 sin divergencia respecto a la loss de entrenamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 15,04 M de parametros. En fp32 ocupa aproximadamente 60 MB de pesos; en fp16 aproximadamente 30 MB. Con activaciones y buffers de atencion para `seq_len=256`, la huella total en memoria es del orden de unos pocos cientos de megabytes como maximo. Estimacion derivada del numero de parametros, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es mas que suficiente (GTX 1050 Ti, GTX 1650, RTX 3050 en adelante). El autor entreno y ejecuta el modelo exclusivamente en CPU, por lo que no hay cifras de rendimiento en GPU publicadas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en aceleradores integrados. El repositorio ocupa 0,1 GB.
- Opciones de despliegue: el autor proporciona scripts en PyTorch puro (`chat.py`, `demo.py`, `evaluate.py`) que requieren solo `torch` y `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni conversion a GGUF, y al ser un modelo de implementacion propia (no compatible con las clases de `transformers`) requeriria trabajo adicional de integracion.
- Latencia y throughput: no disponible. El autor solo reporta tiempos de entrenamiento (134 minutos para 6000 pasos en 32 nucleos de CPU) y una observacion relevante sobre escalado de hilos: con 32 hilos cada paso tardaba 22 segundos, mientras que con 8 hilos bajaba a 1,7 segundos, por el coste de sincronizacion en un modelo tan pequeno.

## Comparativa con modelos similares

No hay datos de benchmarks comparables en la informacion disponible, ya que el modelo solo reporta loss y perplejidad sobre un corpus propio. La tabla siguiente compara caracteristicas estructurales con alternativas de la misma categoria (modelos muy pequenos de generacion de texto). Los datos de los modelos de comparacion son caracteristicas publicas conocidas de cada proyecto y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyGPT-zh-15M (hotsteel09) | 15,04 M | 256 tokens | chino | MIT | HuggingFace, pesos PyTorch, codigo de entrenamiento incluido |
| GPT-2 small (OpenAI) | ~124 M | 1024 tokens | ingles principalmente | MIT | Ampliamente disponible, integrado en `transformers` |
| SmolLM-135M (HuggingFace) | ~135 M | 2048 tokens | ingles principalmente | Apache-2.0 | HuggingFace, integrado en `transformers`, versiones GGUF |
| Qwen2-0.5B (Alibaba) | ~0,49 B | 32 768 tokens | multilingue (incluye chino) | Apache-2.0 | HuggingFace, ecosistema amplio, cuantizaciones disponibles |

Diferencias clave frente a esas alternativas: TinyGPT-zh-15M es entre uno y dos ordenes de magnitud mas pequeno, tiene la ventana de contexto mas corta (256 tokens frente a 2048 o 32 768), solo soporta chino, y no esta integrado en el ecosistema `transformers`, por lo que no se beneficia de herramientas como vLLM, TGI o llama.cpp. Su ventaja es el coste de entrenamiento (134 minutos en CPU) y la licencia MIT sin restricciones, ademas de incluir todo el codigo de generacion de corpus y entrenamiento.

## Limitaciones y advertencias

- Escala muy reducida: con 15,04 M de parametros y 845 000 tokens de entrenamiento, la capacidad de generalizacion es minima. El propio autor indica que el modelo "imita patrones linguisticos del corpus de entrenamiento" y que sus respuestas no garantizan correccion factual.
- Aritmetica poco fiable: el autor documenta errores explicitos como responder 27 a `9 x 7`. Cualquier caso de uso que dependa de calculo numerico es inviable sin herramientas externas.
- Alucinacion y deriva fuera de dominio: ante temas no cubiertos por el corpus, el modelo genera contenido irrelevante o mezcla fragmentos. En generaciones de mas de dos o tres frases tiende a perder el hilo.
- Razonamiento complejo limitado: solo maneja inferencias de un paso bien representadas en el corpus; no hay evidencia de razonamiento multi-paso.
- Contexto muy corto: 256 tokens. Esto restringe severamente las conversaciones multiturno reales, a pesar de que el corpus se construyo con dialogos de hasta 8 turnos.
- Idioma unico: solo chino. No hay capacidades en castellano ni en otras lenguas.
- Sesgos de corpus sintetico: el corpus fue generado integramente por un modelo profesor y filtrado por el autor, sin proceso documentado de anotacion humana, evaluacion de sesgos ni moderacion de contenido. No se han publicado analisis de sesgo de genero, etnia, religion o ideologia.
- Riesgos de seguridad concretos: el modelo incluye respuestas de acompanamiento emocional generadas sinteticamente. No debe desplegarse como sustituto de asistencia psicologica sin supervision profesional y avisos claros al usuario.
- Integracion en produccion: al no usar el formato de `transformers`, no es compatible sin trabajo adicional con servidores de inferencia estandar (vLLM, TGI, Ollama). Tampoco se publican pesos en safetensors ni en GGUF.
- Licencia: MIT, que permite uso comercial, modificacion y redistribucion sin restricciones, siempre que se conserve el aviso de copyright. No hay clausulas de uso aceptable adicionales.
- Ausencia de validacion independiente: los resultados de loss y perplejidad estan marcados como no verificados (`verified: false`) y proceden de un corpus definido por el propio autor. La tasa de respuesta efectiva de 25/25 no esta respaldada por un conjunto de evaluacion publico.
- Reproducibilidad de la evaluacion: al no existir un benchmark estandar, no es posible comparar objetivamente este modelo con alternativas mediante cifras publicas.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/hotsteel09/small_llm_O1
- Mirror mencionado por el autor en la model card (utilizado para distribucion): https://hf-mirror.com
- Documentacion de la libreria `huggingface_hub`, citada por el autor como via de escritura valida frente al mirror: https://huggingface.co/docs/huggingface_hub
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo independiente: no disponible (el codigo de entrenamiento se distribuye dentro del propio repositorio de HuggingFace)
- Demo publica: no disponible

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo. Los resultados obtenidos correspondian a contenido no relacionado con el ambito tecnico y se han descartado.
