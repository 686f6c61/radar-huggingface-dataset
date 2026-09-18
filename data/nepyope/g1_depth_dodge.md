# nepyope/g1_depth_dodge

## Resumen

G1 depth dodgeball on frozen SONIC es una politica de control robotico distribuida como tres grafos ONNX, no un modelo de lenguaje. La publica el usuario nepyope en HuggingFace y esta pensada para el humanoide Unitree G1: un controlador de cuerpo completo SONIC congelado al que se le anaden siete modulos LoRA de rango 16 en el decodificador, condicionados por un percept de 128 dimensiones obtenido de una camara de profundidad montada en la cabeza (tokens de Theia-Tiny mas un adaptador temporal). El entrenamiento se hizo con PPO y el autor indica que corresponde a la iteracion 4000.

El modelo se consume desde el `DepthDodgeController` de la libreria `lerobot` y resuelve una tarea muy concreta: esquivar proyectiles (dodgeball) mientras se mantiene el control de equilibrio y marcha del humanoide. Su interes practico esta en que demuestra un patron de despliegue habitual en robotica open source: congelar un controlador base grande, entrenar adaptadores pequenos y exportar el resultado a ONNX para ejecutarlo en el robot o en simulador a 25 Hz.

No hay informacion publica sobre el numero de parametros, el dataset de entrenamiento ni resultados de benchmarks. El repositorio ocupa 0,2 GB, tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la model card remite a un `manifest.json` interno para la configuracion completa de entrenamiento. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control para robot humanoide: controlador SONIC de cuerpo completo congelado + 7 LoRA de rango 16 en el decodificador + cabeza de percepcion (Theia-Tiny + adaptador temporal) + actor PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el equivalente funcional es una ventana temporal de 16 fotogramas a 25 Hz (0,64 s) |
| Tipos de cuantizacion | no disponible; los grafos ONNX se publican con entradas/salidas fp32 y el adaptador temporal redondea a fp16 internamente |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`theia_image.onnx`, `perception.onnx`, `actor.onnx`) |
| Hardware objetivo | Unitree G1 (acciones de 29 articulaciones en orden de juntas de MuJoCo) |
| Entrada de percepcion | Profundidad optica-Z en metros, 64x96, FOV vertical de 45 grados, pitch de 0 grados, rango valido 0,2-6 m, 25 Hz |
| Frecuencia de control | 25 Hz (16 fotogramas en anillo para el adaptador temporal) |
| Salida de control | `actions[1,29]`: residuales PD normalizados estilo SONIC, en orden de juntas de MuJoCo |
| Iteracion de entrenamiento declarada | 4000 (PPO) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La model card describe una arquitectura en tres etapas encadenadas. `theia_image.onnx` recibe una imagen `uint8 [B,224,224]` con la profundidad codificada en el canal (255 = cerca, 1 = lejos, 0 = invalido) y devuelve `tokens [B,197,192]` en fp32. La forma 197 x 192 es coherente con un codificador tipo ViT sobre 224x224 con parches de 16x16 (196 parches mas un token de clase) y dimension de token 192, pero esto es una deduccion a partir de las firmas ONNX, no un dato confirmado en la informacion disponible. `perception.onnx` toma esos tokens como `depth_tokens fp32 [1,16,197,192]` (anillo de 16 fotogramas a 25 Hz, redondeados a fp16) y produce un `percept [1,128]`.

`actor.onnx` recibe tres entradas: `tokenizer[1,640]`, `policy[1,930]` y `conditioning[1,768]`, donde la propia model card indica que `conditioning` es la concatenacion de `tokenizer` (640) y el percept de 128 dimensiones (640 + 128 = 768). La salida son 29 acciones. El controlador SONIC de cuerpo completo esta congelado y solo se entrenan siete adaptadores LoRA de rango 16 sobre su decodificador, condicionados por el percept de profundidad. El entrenamiento se realizo con PPO hasta la iteracion 4000. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de ajuste.

## Capacidades

- Control de cuerpo completo de un humanoide Unitree G1 con 29 grados de libertad, emitiendo residuales PD normalizados en el orden de juntas de MuJoCo.
- Esquiva reactiva de proyectiles (dodgeball) a partir de profundidad monocular, sin usar vision RGB.
- Percepcion de profundidad en tiempo real: codificacion de imagen a tokens (197 x 192) y agregacion temporal de 16 fotogramas a 25 Hz en un percept compacto de 128 dimensiones.
- Ejecucion en inferencia ONNX, apta para desplegarse con ONNX Runtime o TensorRT en el propio robot o en un PC conectado.
- Integracion con el ecosistema LeRobot mediante `DepthDodgeController`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling, capacidades de agente, multilingues, vision RGB, audio ni modo de pensamiento. Es exclusivamente una politica motora.

## Casos de uso

- Investigacion en avoidance reactivo: usar la politica como linea base reproducible (iteracion 4000, PPO) para comparar metodos de esquiva de obstaculos dinamicos en humanoides con entrada de profundidad.
- Experimentos de adaptacion eficiente: al estar el controlador SONIC congelado y solo ajustarse siete LoRA de rango 16, sirve como plantilla para estudiar PPO sobre adaptadores de bajo rango en control motor.
- Validacion sim2sim en MuJoCo: como las acciones se expresan en el orden de juntas de MuJoCo, la politica puede evaluarse en simulacion antes de tocar hardware, comparando la respuesta a distintos proyectiles y velocidades.
- Despliegue en el robot con ONNX Runtime: los tres grafos caben en un repositorio de 0,2 GB, lo que facilita ejecutarlos en un equipo embebido junto al robot sin infraestructura de servidor.
- Estudio de pipelines de percepcion temporal: el anillo de 16 fotogramas a 25 Hz y el percept de 128 dimensiones son un banco de pruebas para medir latencia y precision de agregacion temporal de profundidad en control reactivo.
- Docencia y formacion en robotica open source: ejemplo completo de politica entrenada con LeRobot y exportada a ONNX, util para explicar el flujo de entrenamiento, exportacion y despliegue.
- Pruebas de seguridad de capa reactiva: evaluar si una politica de esquiva puede actuar como capa de proteccion ante impactos, siempre en entorno controlado y asumiendo que no fue entrenada ni validada para esa funcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es el numero de iteracion de entrenamiento (4000 con PPO) y la frecuencia de operacion prevista (25 Hz), que es un requisito del contrato de camara y no una medida de rendimiento medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 0,2 GB, por lo que los tres grafos ONNX deberian residir holgadamente en menos de 1 GB de VRAM en fp32; esta cifra es una estimacion basada en el tamano del repositorio, no un dato del autor.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime o TensorRT, incluidas NVIDIA RTX 3060, RTX 4090, A100 o H100. Para esta carga, una GPU consumer reciente es mas que suficiente en terminos de memoria.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer con unos pocos GB de VRAM, e incluso la ejecucion en CPU es plausible dado el tamano de los grafos.
- Despliegue en robot: formato ONNX, por lo que es candidato para plataformas embebidas tipo NVIDIA Jetson (Orin) ejecutando ONNX Runtime, siempre que se cumpla el presupuesto de 40 ms por ciclo impuesto por los 25 Hz.
- Opciones de despliegue: ONNX Runtime (recomendado, es el formato publicado), TensorRT, y el controlador `DepthDodgeController` de LeRobot. No se distribuyen pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no aplican.
- Latencia y throughput: no disponibles como medidas. El requisito derivado del contrato de camara es procesar imagen, percepcion y actor dentro de un ciclo de 25 Hz (40 ms), incluyendo la ventana temporal de 16 fotogramas.
- Recursos adicionales: el controlador SONIC congelado, el simulador MuJoCo y la pila de comunicacion con el robot no se describen en terminos de requisitos en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada. La categoria funcional es la de politicas de imitacion o de refuerzo integradas en LeRobot para control de robots (familias como ACT, Diffusion Policy o SmolVLA), pero no hay cifras de parametros, contexto, rendimiento ni licencia de esas alternativas en el material consultado, por lo que cualquier comparacion numerica seria inventada. Como unica comparacion cualitativa fiable: este modelo se distingue por apoyarse en un controlador de cuerpo completo congelado y en adaptadores LoRA de bajo rango, en lugar de entrenar la politica completa desde cero.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multilingues.
- El modelo esta entrenado para una unica tarea (dodgeball con Unitree G1) y no hay evidencia publicada de generalizacion a otras tareas, entornos u objetos.
- Sin benchmarks, sin descargas y sin likes: no existe validacion externa de su comportamiento.
- Dependencia estricta del contrato de camara: profundidad optica-Z en metros, 64x96, FOV vertical de 45 grados, pitch de 0 grados, rango valido de 0,2 a 6 m y 25 Hz. Cualquier desviacion invalida las entradas del modelo.
- Convencion de profundidad invertida respecto a lo habitual: 255 indica cerca, 1 indica lejos y 0 indica valor invalido. Un preprocesado incorrecto produce salidas sin sentido.
- La salida no son torques ni posiciones absolutas, sino residuales PD normalizados estilo SONIC en orden de juntas de MuJoCo. Requiere la cadena de conversion y el controlador SONIC congelado correctos; interpretarlos como comandos directos es peligroso.
- El percept de 128 dimensiones se calcula sobre una ventana de 16 fotogramas; el arranque en frio o los huecos de profundidad (valor 0) pueden degradar la respuesta.
- Licencia Apache-2.0 para este repositorio, lo que en principio permite uso comercial, pero no se documenta la licencia del controlador SONIC congelado ni del codificador Theia-Tiny, que podrian tener condiciones propias.
- Uso en robot real conlleva riesgo fisico para personas y entorno; no se documentan procedimientos de parada de emergencia, limites de par ni validacion de seguridad.
- Los metadatos indican fecha de creacion 2026-09-18 y actualizacion 2026-09-18, ademas de 0 descargas; conviene verificar la vigencia y procedencia del repositorio antes de usarlo.
- Ausencia de riesgos de sesgo linguistico por no ser un modelo de texto; el riesgo relevante es de dominio (entrenado en un escenario concreto) y de similitud entre el entorno de entrenamiento y el de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nepyope/g1_depth_dodge
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su paper, a su repositorio de codigo ni a demos. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
