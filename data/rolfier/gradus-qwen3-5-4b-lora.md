# Rolfier/gradus-qwen3.5-4b-lora

## Resumen

Gradus es un adaptador LoRA de tipo PEFT publicado por Rolfier sobre el modelo base Qwen3.5-4B. No es un modelo de propósito general: está entrenado para una única tarea de clasificación, leer un currículo, un perfil corto de candidato y una oferta de empleo, y responder con una de tres etiquetas —Keep, Explore o Skip— junto con una razón de una línea. El adaptador se entrenó con AutoScientist, la herramienta de Adaption, en una sola iteración de ajuste supervisado.

La relevancia del proyecto está en su enfoque de inferencia: el pipeline no genera texto libre, sino que lee los logits de los tres tokens de etiqueta en la posición siguiente, aplica softmax y calcula una puntuación s = P(Keep) + 0,5·P(Explore), con umbrales fijos (Keep si s ≥ 0,589; Skip si s < 0,273; Explore en el resto). Esa decisión convierte un modelo de 4B en un clasificador ternario determinista, barato y medible, con métricas publicadas sobre un conjunto de test sellado.

El autor reporta 81 % de acierto frente al 59 % del Qwen3.5-4B sin adaptar en las 513 filas donde el currículo decide, y una mejora de macro-F1 de 0,46 a 0,68. El adaptador está pensado para que los candidatos ordenen ofertas, y el autor desaconseja explícitamente usarlo para cribar o clasificar personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base Qwen/Qwen3.5-4B |
| Parametros totales | 4B en el modelo base; numero de parametros del adaptador no disponible (rango LoRA 16) |
| Longitud de contexto | no disponible (no especificada; depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible; el ejemplo del autor carga el base en bfloat16. El adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,1 GB |
| Modelo base | Qwen/Qwen3.5-4B (entrenado en la practica sobre togethercomputer/Qwen3.5-4B, no publicado en el Hub) |
| Configuracion LoRA | Rango 16, alpha 32, sin dropout, aplicado a todas las proyecciones de atencion y MLP |
| Tarea | Clasificacion ternaria candidato-oferta (Keep / Explore / Skip) |
| Modo de inferencia | Una unica vuelta de usuario con la plantilla de chat de Qwen3.5 y thinking desactivado; se leen los logits de los tres tokens de etiqueta |
| Umbrales de decision | Keep si s >= 0,589; Skip si s < 0,273; Explore en el intervalo intermedio, con s = P(Keep) + 0,5 P(Explore) |
| Hash del archivo de pesos | sha256 e0895cbe622cad1efce65807dbd6d3004b6bb5419a99cc6b77d7a9fd2700eb35 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-4B, un transformer decoder-only de 4B de parametros. El entrenamiento consistio en una iteracion de ajuste supervisado ejecutada por AutoScientist (Adaption) en el run `8dc3d64a-cd0f-4807-a6e9-4eadb542ed3d`: LoRA de rango 16 con alpha 32, sin dropout, aplicado a todas las proyecciones de atencion y MLP, 3 epocas con tasa de aprendizaje 2e-4. El run completo duro 33 minutos. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia mas alla del uso directo de logits.

El conjunto de entrenamiento tiene 2.686 filas que emparejan ofertas reales de practicas tecnologicas en Estados Unidos con curriculos sinteticos. Los curriculos los genero Adapt a partir de tarjetas de candidato muestreadas por el codigo del proyecto, y la misma herramienta convirtio cada oferta en una tarjeta de requisitos. Las etiquetas Keep/Explore/Skip provienen de anotadores basados en Claude aplicando un rubrica escrita. El dataset no esta publicado y la receta de etiquetado no es reproducible a partir del repositorio. El autor advierte ademas que el adaptador se entreno sobre la copia de Qwen3.5-4B de Together, no sobre el checkpoint publico, aunque `adapter_config.json` apunta a `Qwen/Qwen3.5-4B`.

## Capacidades

- Clasificacion de encaje candidato-oferta en tres clases (Keep, Explore, Skip) a partir de curriculo, perfil y texto de la oferta.
- Deteccion de impedimentos bloqueantes (autorizacion de trabajo, matriculacion, titulacion, ubicacion) con alta sensibilidad: 346 de 388 casos detectados en el test sellado.
- Puntuacion continua reutilizable: al exponer s = P(Keep) + 0,5 P(Explore), permite umbrales distintos de los del autor sin reentrenar.
- Generacion de una razon de una linea, prevista en el diseno de la tarea, aunque el pipeline de referencia no muestrea texto.
- No soporta tool calling ni function calling: no hay ninguna evidencia en la informacion disponible.
- No soporta agentes ni razonamiento multi-paso: el uso previsto es una unica vuelta con thinking desactivado.
- Multilingue: no. Solo se declara ingles y los datos son ofertas estadounidenses.
- Sin capacidades de vision, audio ni modo thinking activable en el flujo documentado.

## Casos de uso

- Filtrado previo de ofertas para un candidato: el sistema aplica reglas duras sobre la tarjeta de requisitos (autorizacion de trabajo, matriculacion, titulacion, ubicacion) y solo despues pasa el par al adaptador. En el test del autor, las reglas solas alcanzan macro-F1 0,48 y el modelo las eleva a 0,68, lo que permite reducir la bandeja de ofertas guardadas a un subconjunto manejable.
- Deteccion de impedimentos antes de invertir tiempo en una solicitud: sobre las 388 filas del test en las que la oferta pide algo que el curriculo no tiene, el modelo detecta 346 frente a 244 del base sin adaptar, lo que lo hace util como aviso automatico de "no cumples este requisito".
- Priorizacion de una lista larga de ofertas de practicas: con 1.139 pares evaluados sobre 290 ofertas reales, el coste por decision es el de un forward pass de 4B, viable para procesar cientos de ofertas en una pasada por lotes en una sola GPU.
- Asistente de candidatura que explica el descarte: la etiqueta Skip combinada con la razon de una linea permite justificar al usuario por que una oferta se ha descartado, siempre que se valide el texto generado.
- Senal auxiliar en herramientas del lado del candidato (extensiones de navegador, agregadores): el adaptador devuelve una puntuacion continua que puede ordenar resultados sin depender de un LLM grande en linea.
- Banco de pruebas para evaluar pipelines propios de matching: al publicar umbrales, metrica y conjunto de evaluacion, sirve como referencia reproducible para comparar heuristicas o embeddings propios.
- Prototipado de adaptacion con AutoScientist: el run documentado (LoRA r=16, 3 epocas, 33 minutos, 2.686 filas) es un caso concreto del coste de adaptar un modelo de 4B a una tarea de clasificacion estrecha.
- Investigacion sobre destilacion de etiquetas de LLM: el proyecto entrena con etiquetas de anotadores Claude y mide la transferencia a un modelo de 4B, un montaje replicable para estudiar el ruido de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica una evaluacion propia sobre un test sellado puntuado una sola vez: 1.139 pares candidato-oferta sobre 290 ofertas reales. Las cifras corresponden a la tarea de clasificacion ternaria, no a capacidades generales.

| Metrica | Qwen3.5-4B sin adaptar (con las mismas reglas) | Gradus con adaptador | Reglas solas |
|---|---|---|---|
| Acierto en las 513 filas donde decide el curriculo | 59 % | 81 % | no disponible |
| Macro-F1 en esas 513 filas | 0,46 | 0,68 | 0,48 |
| Impedimentos detectados en 388 filas con requisito ausente | 244 | 346 | no disponible |

Los intervalos de confianza y el resto de pruebas estan, segun el autor, en `docs/RESULTS.md` del repositorio; no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- Tamano del adaptador: repositorio de 0,1 GB; se carga sobre el modelo base completo, que es el que domina el coste.
- VRAM estimada para el base de 4B en bfloat16 (estimacion a partir del numero de parametros, no publicada por el autor): unos 8 GB solo de pesos, 10-12 GB con cache KV y overhead para el prompt completo.
- VRAM estimada con cuantizacion de 4 bits (estimacion, no documentada): 3-4 GB de pesos, 5-6 GB en total.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para bfloat16 con margen; L4 o A10G (24 GB) para despliegue en cloud; A100 o H100 si se necesita batching de cientos de ofertas por pasada.
- Cabe en GPU de consumo: si, en bfloat16 en tarjetas de 12-16 GB con contexto corto, y con holgura en 8 GB si se cuantiza el base a 4 bits.
- Despliegue documentado: transformers + peft, tal como aparece en el ejemplo del autor (carga del base en bfloat16 con `device_map="auto"` y `PeftModel.from_pretrained`).
- Opciones adicionales no documentadas por el autor: vLLM con soporte de adaptadores LoRA, TGI, o llama.cpp/Ollama tras fusionar el adaptador en el base y convertir a GGUF. Cualquiera de estas rutas requiere verificar que el prompt builder y la lectura de logits se replican exactamente.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es la duracion del entrenamiento (33 minutos), que no es una medida de inferencia.
- Requisito funcional: hay que instalar el paquete del repositorio con `uv sync` para usar `matcher.pairs.build_prompt` y `matcher.decider.decide`; el adaptador por si solo no reproduce el comportamiento sin ese preprocesado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gradus (Qwen3.5-4B LoRA) | 4B base + adaptador r=16 | no disponible | 81 % de acierto, macro-F1 0,68 en 513 filas | Apache 2.0 | Adaptador en HuggingFace, codigo en GitHub |
| Qwen3.5-4B sin adaptar | 4B | no disponible | 59 % de acierto, macro-F1 0,46 en las mismas filas | no disponible en la informacion | Checkpoint publico en el Hub |
| Reglas heuristicas sobre la tarjeta de requisitos | 0 | no aplica | macro-F1 0,48 | no aplica | Incluidas en el repositorio de Gradus |

No se han identificado en la informacion proporcionada otros adaptadores publicos de matching candidato-oferta comparables en parametros, contexto y licencia; ese dato figura como no disponible.

## Limitaciones y advertencias

- Uso prohibido por el autor para cribar o clasificar personas. El modelo esta disenado para que el candidato ordene ofertas, no para que una empresa descarte solicitudes. Cualquier uso en seleccion de personal entra ademas en el ambito de sistemas de alto riesgo de la normativa europea de IA y requiere evaluacion propia.
- Los curriculos de entrenamiento y de test son sinteticos, generados por Adapt a partir de tarjetas de candidato. El modelo puede aprender sesgos de estilo y estructura de esos curriculos que no se trasladan a curriculos reales.
- Las ofertas son practicas tecnologicas de Estados Unidos y en ingles. El rendimiento fuera de ese dominio, en otro idioma o en otro sector no esta medido.
- Las etiquetas provienen de anotadores basados en Claude aplicando una rubrica, no de reclutadores. Heredan los sesgos y errores de calibracion del etiquetador.
- El modelo es mejor detectando impedimentos bloqueantes que identificando el mejor encaje; el propio autor lo senala. La clase Explore es la menos fiable.
- Riesgo de alucinacion en la razon de una linea: el pipeline de referencia no muestrea texto, pero si se usa generativamente la justificacion puede no estar respaldada por el curriculo o la oferta.
- Los logits en bfloat16 pueden producir empates en casos cercanos al umbral. El autor recomienda leerlos en float32, como hace su evaluacion; el snippet de la model card puede discrepar del demo en empates.
- Dependencia fuerte del preprocesado: el prompt debe construirse con `matcher.pairs.build_prompt` y la plantilla de chat con thinking desactivado. Cambiar el formato degrada la calibracion de los umbrales.
- Dependencia de las reglas duras previas: sin el filtro de autorizacion de trabajo, matriculacion, titulacion y ubicacion, el comportamiento del sistema completo cambia.
- Discrepancia de checkpoint base: el adaptador se entreno sobre `togethercomputer/Qwen3.5-4B` y se publica apuntando a `Qwen/Qwen3.5-4B`. Las diferencias entre ambos no estan cuantificadas.
- Dataset y registros de evaluacion completos no publicados; la reproducibilidad de las cifras depende de `docs/RESULTS.md` en el repositorio.
- La licencia Apache 2.0 permite uso comercial, pero no exime de las advertencias anteriores ni de las obligaciones legales aplicables al tratamiento de datos de candidatos.

## Enlaces

- HuggingFace: https://huggingface.co/Rolfier/gradus-qwen3.5-4b-lora
- Demo en vivo: https://rolfyildirim--gradus.modal.run
- Codigo, registros de evaluacion y resultados: https://github.com/uguryildirim24/gradus
- Video (2:35): https://youtu.be/h3V7mkQGKT8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
