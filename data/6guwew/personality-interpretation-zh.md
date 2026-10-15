# 6guwew/personality-interpretation-zh

## Resumen

personality-interpretation-zh es un adaptador LoRA sobre Qwen2.5-7B-Instruct que traduce perfiles de personalidad ya puntuados a un texto interpretativo de entre 600 y 1500 caracteres... (en realidad, el autor indica caracteres chinos; el modelo card habla de 600–1500 字). Su función es acotada y deliberadamente no conversacional: recibe un JSON con puntuaciones de los cinco grandes factores (IPIP-NEO-120) y de una proyección a los cuatro ejes MBTI, y devuelve una interpretación en chino. No administra tests ni calcula puntuaciones; de eso se encargan scripts de reglas incluidos en el repositorio.

El modelo lo publica el usuario 6guwew y se distribuye con licencia Apache 2.0. El adaptador tiene 80,7 millones de parámetros entrenables (1,05 % del total) con rango 32, alpha 64 y `lora_target: all`, entrenado en bf16 sin cuantización sobre una base congelada mediante LLaMA-Factory 0.9.5. El corpus de ajuste es pequeño y sintético: 1579 ejemplos (1399 de los cinco grandes y 180 de MBTI), con 1421 ejemplos de entrenamiento y 158 de validación.

Su interés ahora es doble. Por un lado, es un caso de estudio de ajuste fino muy especializado con datos generados por un modelo mayor y filtrados por un validador de reglas (tasas de aceptación del 77,7 % y el 93,8 %). Por otro, documenta con inusual franqueza sus límites: el ajuste no elimina la tendencia de la base a inventar datos cuando no recibe puntuaciones estructuradas, la ausencia de normas poblacionales impide hablar de percentiles y la rama MBTI arrastra las limitaciones metodológicas conocidas de ese instrumento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct congelado) con adaptador LoRA |
| Parametros totales | 7 B en el modelo base; el adaptador no modifica el recuento total (no disponible el recuento exacto de parametros del base en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables | 80,7 M (1,05 % del total) |
| Longitud de contexto | No disponible como especificacion propia; el entrenamiento uso `cutoff_len` de 4096 tokens |
| Tipos de cuantizacion | No disponible. El adaptador se entreno en bf16 sin cuantizar y no se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,3 GB |
| Libreria | peft (compatible con transformers) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Hiperparametros LoRA | rank 32, alpha 64, `lora_target: all` |

## Arquitectura y entrenamiento

Se trata de un ajuste por adaptadores de bajo rango sobre un transformer decoder-only de 7 B de la familia Qwen2.5, en su variante Instruct. El base permanece congelado y solo se actualizan las matrices LoRA, con rango 32, alpha 64 y aplicadas a todos los modulos objetivo. El entrenamiento se hizo en bf16, sin cuantizacion, con LLaMA-Factory 0.9.5, batch 4 con acumulacion de gradiente 4 (lote efectivo 16), learning rate 1e-4 con scheduler coseno y warmup de 0,1, y 3 epocas sobre 1421 ejemplos (158 reservados para validacion). Todo el proceso consumio 267 pasos y 60,7 minutos en una unica A100-PCIE de 40 GB. La perdida final de entrenamiento fue 1,6224 y la de evaluacion 1,4998, valor que ya se alcanzaba en el paso 200, de modo que el ultimo tercio del entrenamiento no aporto mejora: el propio autor concluye que 2 epocas habrian bastado para datos de esta homogeneidad.

El dato mas interesante es la composicion del corpus y su validacion. Son 1579 ejemplos sinteticos (1399 de cinco grandes y 180 de MBTI) generados por un modelo mayor y filtrados con un validador de reglas que descarta las respuestas que incumplen la politica de comportamiento; pasaron el filtro el 77,7 % de las muestras de cinco grandes y el 93,8 % de las de MBTI. La cobertura es deliberada: 18 combinaciones de puntuaciones para los cinco grandes (incluidos todos los valores en el rango medio, extremos y un unico factor elevado) y las 16 combinaciones MBTI cruzadas con 4 niveles de claridad. La mediana de longitud es 1814 tokens y el maximo 2246. Hay un diseno intencionado en el prompt de sistema usado durante el entrenamiento: tiene solo 502 caracteres y no incluye la especificacion completa, con el objetivo de que las reglas de interpretacion queden interiorizadas en los pesos en lugar de depender de una guia presente en el contexto. La especificacion completa se anade unicamente en inferencia. El autor advierte que los datos no fueron revisados manualmente uno por uno y deben considerarse ejemplos conformes a una politica de comportamiento, no respuestas de referencia de evaluacion psicologica profesional.

## Capacidades

- Generacion de interpretaciones escritas a partir de puntuaciones estructuradas de personalidad (JSON con instrumento, dominios y facetas).
- Razonamiento combinado a nivel de faceta: relaciona facetas de distintos factores, por ejemplo A2 (confianza) baja con N4 (autoconciencia) alta, para describir patrones de conducta concretos.
- Cobertura de los cinco dominios con estructura fija: el autor verifica que cubre 5/5 dimensiones, frente a 4/5 del modelo base, que omitia por completo la amabilidad.
- Interpretacion de MBTI derivada de la misma respuesta, con reporte obligatorio del nivel de claridad de cada eje (clear, moderate, slight, marginal) y mencion de la controversia metodologica del instrumento.
- Tratamiento explicito de puntuaciones en la zona media (40-60): el modelo debe senalar que la capacidad de discriminacion es limitada en lugar de forzar una interpretacion.
- Redaccion equilibrada: el autor mide 8 menciones de costes o tensiones internas frente a 2 en el modelo base.
- No es un chatbot y no hace preguntas ni administra tests; no admite conversacion general como entrada valida.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el flujo es de un unico turno (perfil a texto).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Informes de autoinforme en productos de bienestar psicologico: la aplicacion recoge las respuestas, calcula los factores con codigo de reglas y pasa el JSON al modelo para obtener un texto largo y matizado. El modelo es adecuado porque su salida es consistente en estructura y evita el tono de folleto publicitario.
- Pruebas de personalidad en plataformas de RRHH con finalidad formativa: se puede usar para generar material de reflexion para el candidato, siempre que no se presente como herramienta de seleccion ni de diagnostico, dado que no existen normas poblacionales.
- Investigacion sobre ajuste fino con datos sinteticos: sirve como caso reproducible de destilacion de una politica de redaccion a pesos, con metricas de aceptacion del validador (77,7 % y 93,8 %) y curva de perdida documentada.
- Estudio de alineacion de estilo: util para comparar como un adaptador de 80,7 M elimina plantillas vacias (de 5 a 0 casos), codigos de dimension entre parentesis (de 6 a 0) y el formato de informe por secciones (de 3 a 0).
- Generacion de contenido psicometrico divulgativo en chino: la salida de 1200-1500 caracteres encaja como base editable para articulos o fichas que explican que mide y que no mide una escala IPIP.
- Prototipado de servicios compatibles con OpenAI: el autor incluye `training/serve_model.py` con puerta de validacion que impide invocar el modelo si no hay puntuaciones estructuradas, con unas 37 tok/s y 0,28 s de latencia hasta el primer token.
- Traduccion de resultados MBTI a lenguaje llano con advertencias metodologicas: util en entornos donde el usuario ya llega con un tipo MBTI y se quiere explicar su significado sin reforzar la idea de tipologias rigidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). El autor si publica una comparacion cualitativa, sobre un mismo perfil nuevo (O=71, C=38, E=66, A=34, N=57, con 8 facetas en la zona media) y con el mismo prompt de sistema reducido:

| Metrica | Qwen2.5-7B-Instruct (base) | personality-interpretation-zh |
|---|---|---|
| Secciones planas por dimension | 3 | 0 |
| Codigos de dimension en la salida (p. ej. `(O)`) | 6 | 0 |
| Frases plantilla ("unico e irrepetible", etc.) | 5 | 0 |
| Cobertura de los cinco dominios | 4/5 (omite amabilidad) | 5/5 |
| Menciones de costes o tension interna | 2 | 8 |
| Terminos clinicos / cifras de normas inventadas | 0 / 0 | 0 / 0 |

Datos de entrenamiento reportados: `train_loss` 1,6224 (1,3508 en el ultimo paso), `eval_loss` 1,4998, 267 pasos, 60,7 minutos en una A100-PCIE-40GB.

## Requisitos de hardware

- El adaptador ocupa 0,3 GB en disco, pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo; el consumo viene determinado por el base, no por el adaptador.
- VRAM estimada en bf16/fp16: en torno a 15-16 GB solo para pesos, mas cache KV y activaciones; se recomienda reservar al menos 20-24 GB para `max_new_tokens` de 1400 como en el ejemplo del autor. Cifra orientativa, no publicada por el autor.
- En cuantizacion de 4 bits la huella se reduciria aproximadamente a 5-6 GB, lo que permitiria ejecutarlo en GPU de consumo; el autor no publica adaptadores cuantizados, por lo que habria que cuantizar el base por separado y verificar la compatibilidad. Estimacion, no dato verificado.
- La generacion es larga por diseno (1200-1500 caracteres), asi que el coste dominante es la decodificacion, no el prefill.
- GPU usadas en el proyecto: una A100-PCIE de 40 GB para el entrenamiento (60,7 minutos, 267 pasos).
- Despliegue: transformers + peft para cargar el adaptador, o fusion del adaptador en el base y servido posterior con vLLM o TGI. El repositorio incluye un servicio compatible con la API de OpenAI (`training/serve_model.py`).
- Rendimiento medido por el autor en ese servicio: aproximadamente 37 tokens por segundo y 0,28 s de latencia hasta el primer token. No se especifica la GPU empleada para esta medicion.
- Ollama y llama.cpp requeririan convertir el modelo fusionado a GGUF; no hay conversion publicada.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible otros adaptadores publicos comparables de interpretacion de tests de personalidad en chino. La comparacion mas significativa es contra su propio modelo base, que es tambien la referencia que usa el autor:

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| personality-interpretation-zh | 7 B base + 80,7 M entrenables | No especificado (entrenado con cutoff 4096) | 5/5 dominios cubiertos, 0 frases plantilla, 8 menciones de costes | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen2.5-7B-Instruct | 7 B | No disponible en la informacion proporcionada | 4/5 dominios, omite amabilidad, 5 frases plantilla, 6 codigos de dimension | Apache 2.0 (segun el modelo base) | Ampliamente disponible |
| Otros adaptadores de interpretacion psicologica | No disponible | No disponible | No disponible | No disponible | No se han encontrado |

Conviene senalar que el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de terceros.

## Limitaciones y advertencias

- Solo funciona recibiendo puntuaciones estructuradas. El conjunto de entrenamiento no contiene ejemplos negativos del tipo "no hay datos", asi que ante una entrada como "hola" el modelo inventa un perfil completo y lo interpreta; ante letras sin definir como A/B, les atribuye significados. El servicio incluido lo mitiga con una puerta de validacion, pero la tendencia persiste en los pesos.
- No emite percentiles y eso no es prudencia sino consecuencia de la ausencia de normas: IPIP no publica baremos, de modo que solo se ofrecen puntuaciones brutas y una escala relativa de 0 a 100. Cualquier salida que afirme "esta por encima del X % de la poblacion" seria erronea.
- La rama MBTI no procede del instrumento oficial de Myers-Briggs, sino de una proyeccion de las facetas de IPIP-NEO-120, lo que convierte puntuaciones continuas en tipos dicotomicos, justamente el punto mas discutido del metodo. Los ejes S/N y T/F se sustentan solo en 3 facetas cada uno, frente a 6 en E/I, por lo que su estabilidad es menor.
- La salida es mas larga de lo especificado: el objetivo es de 600 a 1000 caracteres y el resultado real se estabiliza entre 1200 y 1500.
- Los datos de entrenamiento son sinteticos y no estan revisados uno por uno; no constituyen respuestas de referencia de evaluacion psicologica profesional.
- No es una herramienta clinica: no diagnostica ni sustituye a una evaluacion profesional. El propio autor lo describe como un instrumento de lenguaje para la reflexion personal.
- El modelo solo esta entrenado en chino; no hay soporte documentado para otros idiomas, y generar interpretaciones en castellano quedaria fuera de su distribucion de entrenamiento.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el uso comercial de interpretaciones de personalidad en contextos de seleccion o salud tiene implicaciones legales y eticas que exceden la licencia.
- MBTI es una marca registrada de The Myers-Briggs Company; el proyecto declara no tener relacion, patrocinio ni respaldo de esa empresa y no usa sus items oficiales.
- Riesgo de alucinacion de puntuaciones, normas o percentiles si el prompt no restringe explicitamente la tarea; en la prueba comparativa del autor no se observaron casos de cifras inventadas ni de vocabulario clinico, pero la muestra es de un unico perfil.
- La perdida de evaluacion no mejoro en el ultimo tercio del entrenamiento, lo que sugiere cierto sobreajuste al formato y al estilo del corpus sintetico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/6guwew/personality-interpretation-zh
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- LLaMA-Factory (framework de entrenamiento empleado): https://github.com/hiyouga/LLaMA-Factory
- Scripts de generacion de items y puntuacion: carpeta `scripts/` del repositorio del modelo (incluye `to_llamafactory.py`, con el prompt de sistema)
- Servicio de inferencia compatible con OpenAI: `training/serve_model.py` en el repositorio del modelo
- Paper, blog o demo adicionales: no disponible
- No se han encontrado resultados de busqueda relevantes sobre este modelo; las busquedas web devolvieron unicamente contenido no relacionado.
