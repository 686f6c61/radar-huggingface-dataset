# dongjintao/GUI-Swift-Mobile-2B

## Resumen

GUI-Swift-Mobile-2B es un adaptador LoRA (PEFT) publicado por el usuario dongjintao que convierte el modelo base mPLUG/GUI-Owl-1.5-2B-Instruct en un agente de interfaz grafica para Android. El modelo transforma una captura de pantalla, la instruccion del paso actual y el historial de acciones ejecutadas en una unica accion estructurada de Android, mediante un unico forward causal nativo sobre 105 slots de valor enmascarados. Forma parte de la familia GUI-Swift, que continua con el modelo hermano GUI-Swift-4B y un protocolo especifico para movil.

El interes tecnico reside en su mecanismo de "fixed-slot": en lugar de generar la accion como texto autoregresivo convencional, el modelo predice directamente valores en 105 posiciones enmascaradas, con 256 bins de coordenadas por eje y una ventana de contexto de 16K tokens. Esto evita el bucle de decodificacion autoregresiva para la accion final y reduce la superficie de error sintactico: el autor reporta 0 salidas decodificadas invalidas sobre 8.423 pasos de test de AndroidControl.

El adaptador tiene 433,68M parametros (1,73 GB) y se distribuye bajo licencia Apache 2.0. Es un modelo de investigacion orientado a la prediccion offline de acciones GUI; el autor advierte explicitamente que no se ha medido ninguna ventaja de velocidad ni tasa de exito end-to-end en tareas reales, y que la inferencia requiere un runner nativo propio, ya que `generate()` convencional no implementa el protocolo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base GUI-Owl-1.5-2B-Instruct) con adaptador LoRA y cabecera de 105 slots fijos |
| Parametros totales | 433,68M en el adaptador LoRA (el modelo base se descarga por separado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre mPLUG/GUI-Owl-1.5-2B-Instruct, un transformer multimodal de 2B parametros orientado a agentes GUI. Sobre el se aplica un adaptador LoRA de 433,68M parametros que implementa el protocolo "fixed-slot": la accion de Android se codifica en 105 slots de valor enmascarados, con 256 bins de coordenadas por eje, y se predice en un unico forward causal nativo en lugar de mediante generacion autoregresiva. El contexto de entrada combina la captura de pantalla actual, la instruccion del paso y el historial de acciones ejecutadas, con una ventana de turno completo de 16K tokens.

El entrenamiento consiste en un SFT sobre AndroidControl durante dos epocas, hasta el checkpoint step4658. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. El autor senala que se reutiliza la expresion de point-in-box inclusiva del repositorio SeeClick (commit fijado) para la evaluacion de grounding, y que el solapamiento entre el preentrenamiento del modelo base y los datos de evaluacion es desconocido.

## Capacidades

- Prediccion de acciones GUI de Android en un unico forward: tap, type_text y otras acciones del protocolo, con coordenadas codificadas en 256 bins por eje.
- Grounding visual de elementos de interfaz: localizacion de iconos y widgets de texto sobre capturas de pantalla.
- Uso de historial de acciones ejecutadas como contexto multi-paso (hasta 5 observaciones previas en los ejemplos publicados).
- Prediccion de texto para acciones `type_text`, con exactitud limitada (19,62% en test estricto).
- Soporte de instrucciones de paso de bajo nivel ("low-level step instructions").
- Salidas estructuradas y validas: 0 salidas decodificadas invalidas sobre 8.423 pasos de test.
- Capacidades multilingues: solo ingles declarado.
- No se documenta soporte de tool calling generico, function calling, agentes multi-paso autonomos, vision general, audio ni modo thinking.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo predice la accion esperada dado un paso de instruccion y una captura, lo que permite generar trayectorias sinteticas o validar flujos de test sin interaccion manual.
- Grounding de elementos para asistentes de accesibilidad: localizar iconos y widgets de texto (80,34% en widgets de texto, 54,98% en iconos) para guiar a usuarios con dificultades visuales hacia el control correcto.
- Generacion de datos de entrenamiento para agentes GUI: usar las predicciones estructuradas como etiquetas candidatas en pipelines de destilacion o aumento de datos, filtrando por la metrica de tolerancia.
- Prototipado de agentes moviles en investigacion: el protocolo de 105 slots y el runner nativo permiten experimentar con prediccion de acciones sin depender de decodificacion autoregresiva.
- Analisis offline de trayectorias AndroidControl: evaluar la calidad de un agente sobre el split de test con metricas reproducibles (action type, tolerance match, strict match) documentadas en `evaluation.json`.
- Investigacion sobre representaciones de acciones GUI: comparar el paradigma fixed-slot frente a generacion autoregresiva en terminos de validez sintactica y exactitud de parametros.
- Sistemas de sugerencia de siguiente paso en apps Android: dado el estado de pantalla y el historial, proponer la accion mas probable al usuario para su confirmacion manual.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Ambito |
|---|---:|---|
| ScreenSpot-v2 · subconjunto movil completo | 69,66% · 349/501 | Tap predicho dentro de la caja objetivo original |
| ScreenSpot-v2 · solo fuente Android | 73,93% · 156/211 | Igual criterio, filas de origen Android |
| ScreenSpot-v2 · widgets de texto | 80,34% · 233/290 | Grounding de texto |
| ScreenSpot-v2 · iconos | 54,98% · 116/211 | Grounding de iconos |
| AndroidControl test · tipo de accion | 95,89% · 8.077/8.423 | Coincidencia con la referencia |
| AndroidControl test · tolerance action match | 72,01% · 6.065/8.423 | Misma accion y campos, cada eje dentro de 50/1000, Levenshtein de texto >= 0,9 |
| AndroidControl test · strict full action | 28,94% · 2.438/8.423 | Accion canonica y todos los parametros exactamente iguales |
| AndroidControl test · text exact match | 19,62% · 124/632 | Accion `type_text` y texto exactos |
| AndroidControl test · salidas invalidas | 0/8.423 | Solo validez del decodificador |
| Validacion de desarrollo (690 pasos) | accion 96,96% · strict 30,29% · texto 43,88% · loss 4,064669 | Split de desarrollo |

Estos resultados corresponden a prediccion offline con teacher forcing, no a rollouts ni a resultados oficiales del leaderboard de AndroidControl. El autor no reporta puntuacion en AndroidWorld ni tasa de exito end-to-end en dispositivos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador ocupa 1,73 GB y el modelo base de 2B parametros se descarga aparte, por lo que el requisito agregado depende de la cuantizacion del base (no documentada).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base (2B), es plausible su ejecucion en GPUs de consumo, pero el autor no lo confirma.
- Cabe en GPU de consumo: no confirmado en la documentacion.
- Opciones de despliegue: el autor indica que debe usarse el runner de inferencia nativo incluido en el repositorio; `generate()` autoregresivo convencional no implementa el protocolo entrenado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor afirma explicitamente que "single-pass describe el mecanismo; no se reclama ninguna mejora de velocidad medida".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUI-Swift-Mobile-2B | 433,68M (LoRA) + base 2B | 16K | Fixed-slot, 105 slots, Android | apache-2.0 | Hugging Face |
| GUI-Swift-4B | no disponible en la informacion | no disponible | Fixed-slot, familia GUI-Swift | no disponible | Hugging Face |
| MAI-Swift-2B | 433,68M (LoRA) + base MAI-UI-2B | no disponible | Fixed-slot, 105 slots, Android | no disponible | Hugging Face |
| GUI-Owl-1.5-2B-Instruct (base) | 2B | no disponible | Multimodal GUI general | no disponible | Hugging Face |

## Limitaciones y advertencias

- La coincidencia exacta de texto es baja (19,62% en test estricto frente a 43,88% en validacion de desarrollo): errores de ortografia, omision o repeticion de texto.
- El grounding de iconos es notablemente inferior al de widgets de texto (54,98% frente a 80,34%).
- Algunas direcciones de scroll no se predicen correctamente, segun el autor.
- La metrica de tolerancia (50/1000 por eje, Levenshtein >= 0,9) es una convencion de reporte del proyecto, no una metrica establecida de exito de tarea.
- Los resultados son de prediccion offline con teacher forcing, no de ejecucion real en dispositivo; no se reclama tasa de exito end-to-end.
- El solapamiento entre el preentrenamiento del modelo base y los datos de evaluacion es desconocido, lo que impide descartar contaminacion.
- Solo soporta ingles y el dominio Android; no se documentan otros idiomas ni plataformas.
- Requiere un runner de inferencia nativo; no funciona con `generate()` estandar, lo que complica su integracion en stacks convencionales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base debe verificarse por separado y el adaptador se distribuye sin garantias de rendimiento en produccion.
- Riesgo de alucinacion en la prediccion de acciones no evaluado de forma especifica; los sesgos del modelo base no se documentan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongjintao/GUI-Swift-Mobile-2B
- Modelo base: https://huggingface.co/mPLUG/GUI-Owl-1.5-2B-Instruct
- Modelo hermano GUI-Swift-4B: https://huggingface.co/dongjintao/GUI-Swift-4B
- Modelo relacionado MAI-Swift-2B: https://huggingface.co/dongjintao/MAI-Swift-2B
- Perfil del autor: https://huggingface.co/dongjintao
- Repositorio SeeClick (expresion point-in-box): https://github.com/OS-Copilot/OS-Atlas
- Incidencia sobre etiquetas de origen en ScreenSpot-v2: https://github.com/OS-Copilot/OS-Atlas/issues/65
