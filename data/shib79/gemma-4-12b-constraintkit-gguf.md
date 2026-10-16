# shib79/gemma-4-12b-constraintkit-GGUF

## Resumen

gemma-4-12b-constraintkit es un ajuste fino de google/gemma-4-12B-it orientado a la generacion de diseno asistido por ordenador (CAD) a partir de lenguaje natural. Lo desarrolla el usuario shib79 sobre el sistema open source constraint-kit, un motor text-to-CAD donde el modelo decide que construir y un nucleo determinista de matematicas calcula donde colocar cada pieza. La tarea del modelo no es dibujar geometria, sino escribir un pequeno programa JSON con piezas, parametros y uniones que constraint-kit compila a solidos B-rep reales y exporta a STEP.

El modelo tiene 11.907.350.576 parametros (unos 12B) y se distribuye como un GGUF Q6_K de 9.8 GB para llama.cpp, ademas de un adaptador LoRA PEFT de 251 MB. La innovacion principal es su calibracion para el rechazo honesto: cuando una peticion queda fuera de alcance (por ejemplo, un engranaje conico espiral, ya que solo se modelan engranajes conicos rectos), el modelo lo declara explicitamente en lugar de entregar una variante incorrecta sin avisar.

Es relevante porque demuestra que un modelo local de 12B, entrenado con SFT y GRPO usando el verificador geometrico como recompensa (sin reward model ni juez LLM), alcanza cifras de builds verificados geometricamente (93%) en el rango de un modelo frontier con prompting (90-97%), y le supera en honestidad sobre peticiones nuevas (57% de builds honestos frente a 16%). El coste total de entrenamiento declarado es de unos 35 dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ajuste fino de google/gemma-4-12B-it; no se especifica variante interna) |
| Parametros totales | 11.907.350.576 (unos 12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192` en llama.cpp) |
| Tipos de cuantizacion | GGUF Q6_K; adaptador LoRA r=16 en PEFT |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer de aproximadamente 12B parametros, y se ajusta en dos fases: SFT seguido de GRPO (Group Relative Policy Optimization). El entrenamiento se realiza sobre constraint-kit, un sistema en el que la salida del modelo es un programa declarativo (partes, parametros y mates) que un kernel de mates determinista resuelve y que generadores B-rep exactos convierten en solidos reales exportables a STEP. No se trata, por tanto, de generar mallas que el modelo pueda alucinar: cada build es verificable contra geometria.

La fase de GRPO es destacable porque no usa reward model ni juez LLM: la recompensa es directamente el verificador de CAD, que comprueba si el programa es valido y se construye, y ademas mide la cercania de su firma geometrica al objetivo. Segun la model card, esta fase redujo los builds silenciosamente incorrectos (variante equivocada) de 2/10 a 1/10 y elevo los rechazos correctos a 9/10, sin regresion en los builds validos (6/6 mantenidos). El unico dato de datos de entrenamiento disponible es que se verifican contra geometria con un umbral del 2% en volumen y caja envolvente respecto al objetivo en el conjunto de validacion. No se indica el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de programas CAD declarativos (partes, parametros y mates) a partir de lenguaje natural en ingles.
- Razonamiento explicito previo a la respuesta mediante un modo de pensamiento (token `<|think|>`), que precede a cada programa.
- Rechazo honesto: identifica peticiones fuera de alcance e indica que variante falta, en lugar de entregar una alternativa incorrecta.
- Conocimiento de vocabulario mecanico: espaciadores, engranajes rectos (incluidos helicoidales y planetarios), poleas con brida, rodamientos, varillas roscadas, motores paso a paso NEMA, extrusoras V-slot, uniones tipo pasador, etc.
- Generacion de conjuntos y ensamblajes con mates deterministas (por ejemplo, pares de engranajes a la distancia entre centros exacta m·(z1+z2)/2).
- Salida verificable geometricamente: los programas se compilan a B-rep y se pueden comprobar contra volumen y caja envolvente.
- Capacidades multimodales, de audio, vision o tool calling: no disponible en la informacion proporcionada.

## Casos de uso

- Diseno mecanico asistido en ingenieria: el usuario describe en ingles un componente ("3x espaciadores de 12 mm OD, 5 mm de taladro y 8 mm de altura apilados") y el modelo devuelve el programa que constraint-kit compila a STEP, listo para revisar en la herramienta CAD.
- Generacion de utillaje y piezas estandar: creacion rapida de rodamientos, separadores, poleas con brida o motores NEMA paso a paso como "vitamins" reutilizables, lo que acelera la composicion de ensamblajes.
- Automatizacion de bancadas y estructuras de perfileria: descripcion de montajes sobre extrusora V-slot (por ejemplo, un soporte de rodamiento atornillado con tornillos M5 y un eje de 8 mm), con la posicion resuelta por el solver.
- Validacion temprana de viabilidad: gracias al rechazo honesto, el modelo sirve como filtro en un pipeline de diseno, indicando que variantes (por ejemplo, engranajes conicos espirales) no estan soportadas antes de comprometer recursos.
- Integracion en flujos de fabricacion aditiva o mecanizado: al exportar STEP y BOM, los programas alimentan directamente herramientas de impresion 3D o laminado para producir las piezas disenadas.
- Docencia y aprendizaje de CAD parametrico: el modo de razonamiento del modelo muestra la traza de por que eligio una pieza o un mate, lo que resulta util para ensenar relaciones geometricas y restricciones.
- Prototipado local sin dependencia de la nube: al ser un 12B ejecutable en llama.cpp con un GGUF de 9.8 GB, permite iterar disenos en una estacion de trabajo local sin enviar datos tecnicos a servicios externos.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Builds verificados geometricamente | 93% | Fase SFT, conjunto de validacion, primer intento, sin reintentos ni scaffolding |
| Rechazos honestos | 87% | Fase SFT; tras GRPO, 9/10 |
| Builds honestos frente a modelo frontier | 57% vs 16% | Peticiones nuevas; comparado con un modelo frontier con prompting |
| Builds silenciosamente incorrectos (variante erronea) | 2/10 → 1/10 | Reduccion tras GRPO |
| Builds validos mantenidos tras GRPO | 6/6 | Sin regresion |
| Rango de builds del modelo frontier con prompting | 90-97% | Referencia comparativa declarada en la model card |
| Coste total de entrenamiento | ~35 USD | SFT + GRPO |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el GGUF Q6_K de 9.8 GB: alrededor de 10-11 GB para los pesos, mas el espacio de contexto; con 8192 tokens de contexto conviene reservar 12-14 GB de VRAM en total.
- GPU recomendadas: no se especifica una lista concreta. La model card menciona el caso de GPU Volta (clase V100), para las que recomienda `-fa off -ub 1024` porque flash-attention en automatico produce un prefill muy lento en esa generacion.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070/4080/4090) ejecutando el Q6_K completo con `-ngl 99`. El adaptador LoRA (251 MB) es un complemento mucho mas ligero si se combina con el modelo base.
- Opciones de despliegue: llama.cpp (llama-server), con el ejemplo de arranque `llama-server -m gemma4-12b-constraintkit-grpo-Q6_K.gguf -c 8192 -ngl 99 --port 8086`. El adaptador LoRA PEFT se puede cargar con frameworks compatibles (por ejemplo, la libreria PEFT sobre `unsloth/gemma-4-12b-it`). No se mencionan vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12b-constraintkit | ~12B | no disponible | 93% builds verificados; 57% builds honestos en peticiones nuevas | apache-2.0 | GGUF y LoRA en HuggingFace |
| Modelo frontier con prompting (sin especificar) | no disponible | no disponible | 90-97% builds; 16% builds honestos en peticiones nuevas | no disponible | API propietaria |
| Planners de constraint-kit por defecto (DeepSeek) | no disponible | no disponible | Se usa como planner alojado por defecto del sistema | no disponible | Servicio alojado |

No se dispone de datos suficientes para comparar con otros modelos de text-to-CAD de la misma categoria.

## Limitaciones y advertencias

- Idioma: entrenado exclusivamente en ingles (en). No hay soporte declarado para otros idiomas.
- Sistema de prompt rigido: el modelo fue entrenado unicamente con el system prompt contenido en `train_sys.txt`. Usar cualquier otro prompt degrada el comportamiento; este archivo es obligatorio.
- Alcance geometrico limitado: solo se modelan ciertas variantes. Por ejemplo, solo engranajes conicos rectos, no espirales; el modelo esta disenado para declarar estas limitaciones, pero conviene verificar las salidas.
- Riesgo de build de variante incorrecta: aunque GRPO lo reduce (de 2/10 a 1/10), sigue existiendo. Es imprescindible validar la geometria en produccion.
- Verificacion obligatoria: el valor del sistema depende de comprobar que el programa se construye y su firma geometrica coincide; sin esa verificacion, el modelo puede producir programas sintacticamente validos pero inadecuados.
- Licencia apache-2.0: permite uso comercial, pero al derivar de google/gemma-4-12B-it conviene revisar las condiciones del modelo base de Google.
- Madurez: el repositorio tiene 0 descargas y 0 likes en la fecha de consulta; no hay evidencia de uso en produccion ni benchmarks estandar publicados.
- Rendimiento dependiente del despliegue: en GPU Volta hay que desactivar flash-attention (`-fa off -ub 1024`) para evitar un prefill muy lento.
- Alucinacion: el modelo puede generar programas plausibles pero incorrectos; la verificacion geometrica contra volumen y caja envolvente (umbral del 2%) es la salvaguarda prevista.

## Enlaces

- HuggingFace: https://huggingface.co/shib79/gemma-4-12b-constraintkit-GGUF
- Repositorio constraint-kit: https://github.com/jajmangold/constraint-kit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo base del adaptador LoRA: https://huggingface.co/unsloth/gemma-4-12b-it
