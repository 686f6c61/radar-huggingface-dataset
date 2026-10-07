# bx6d/r2s2r-openvla-oft-grpo-cam

## Resumen

r2s2r-openvla-oft-grpo-cam es un checkpoint de politica robotica (vision-language-action, VLA) derivado de OpenVLA-7B mediante el procedimiento de ajuste OpenVLA-OFT (Optimized Fine-Tuning). Lo publica el usuario bx6d y resuelve una tarea muy concreta: pick-and-place en simulacion con un brazo xArm6 y pinza UF dentro de escenas MuJoCo reconstruidas a partir de fotografias de un montaje real. No es un modelo de proposito general ni un chat: su salida son acciones motoras.

El entrenamiento combina tres fases: SFT con LoRA r32 sobre demostraciones generadas por cinematica inversa (IK), una continuacion del SFT con randomizacion de las poses de las camaras de mesa y muneca renderizadas al vuelo, y finalmente GRPO con RLinf (group size 8, recompensa dispersa de exito, 192 entornos paralelos). Sobre el modelo base de 7 mil millones de parametros, el autor publica tres checkpoints fusionados (`step_130`, `step_140`, `step_180`) que ocupan 45,7 GB en total.

Su relevancia es metodologica: documenta con detalle como la aplicacion de RL (GRPO) sobre un VLA mejora el exito en las tareas y semillas de entrenamiento (hasta 80,0 % en `step_140`) pero degrada la generalizacion a objetos reservados (0,0 % en la direccion contenedor -> mesa) y bajo camaras aleatorias. Es, por tanto, un caso de estudio util sobre sobreajuste y robustez en politicas VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en OpenVLA-7B (transformer multimodal con backbone de lenguaje Llama 2 y cabezal de acciones), ajustada con OpenVLA-OFT |
| Parametros totales | no disponible de forma explicita; derivada de OpenVLA-7B (aproximadamente 7 mil millones), con adaptadores LoRA r32 fusionados |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors (bfloat16) |
| Idiomas soportados | no disponible; las instrucciones de entrenamiento estan en ingles |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (pesos fusionados tras LoRA r32), organizados en tres carpetas: `step_130`, `step_140`, `step_180` |

## Arquitectura y entrenamiento

La base es OpenVLA-7B, un transformer multimodal que combina un backbone de lenguaje Llama 2 de 7B con codificadores visuales y un cabezal de acciones. En este checkpoint se emplea la variante OFT con tokenizacion discreta de acciones en 256 bins, chunk de 8 acciones y dimension de accion 7 (constantes de OpenVLA-OFT para `ROBOT_PLATFORM=LIBERO`). El modelo es exclusivamente de imagen: consume RGB de camara de mesa y de muneca, sin propiocepcion (`r2s_model.json`). Las entradas visuales se renderizan a 256 px, se recortan al 90 % central y se redimensionan a 224 px.

El entrenamiento tiene tres etapas. Primero, SFT con LoRA r32 sobre 360 demostraciones originales de IK mas 5.539 demostraciones perturbadas (desplazamiento del objeto hasta 12 cm, del contenedor hasta 10 cm y +-20 grados) correspondientes a 24 tareas y semillas 0-4. Despues, 12.000 pasos adicionales en los que el 80 % de las muestras se renderiza con camara aleatoria: en la muneca, inclinacion +-20 grados, yaw/roll +-10 grados, desplazamiento +-2 cm y FOV 60-95 grados; en la mesa, +-5 cm, +-6 grados de yaw/pitch, +-3 grados de roll y FOV 52-68 grados. Finalmente, GRPO con RLinf: group size 8, recompensa dispersa de exito, temperatura 1,6, LoRA r32, learning rate 1e-4, 192 entornos paralelos, 2 epocas de rollout por paso y horizonte de 320 pasos. Solo se usan para entrenamiento las tareas y semillas 0-4 (y sus perturbaciones); las semillas 5-9 y los objetos reservados son exclusivamente de evaluacion.

## Capacidades

- Generacion de acciones de manipulacion: produce un chunk de 8 acciones de 7 dimensiones (6 consignas absolutas de articulacion en radianes mas comando de pinza en rango 0-255) a 10 Hz.
- Percepcion visual multimodal limitada a la tarea: procesa dos vistas RGB simultaneas (camara de mesa y camara de muneca) con preprocesado fijo de 256 px, recorte central del 90 % y resize a 224 px.
- Seguimiento de instrucciones en lenguaje natural con plantilla fija en ingles: "Pick up the  and place it in the <bowl|box>.".
- Ejecucion cerrada en bucle (closed loop) con horizonte de 400 pasos en evaluacion.
- Robustez parcial a la pose de camara, adquirida mediante randomizacion de camaras durante el SFT (rendimiento del 55,8 % con camaras aleatorias frente al 73,3 % con camaras nominales en `step_140`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision general, de audio ni modo de razonamiento explicito.
- No dispone de propiocepcion: la politica es puramente visual mas instruccion textual.

## Casos de uso

- Reproduccion de experimentos de investigacion en VLA: los tres checkpoints y los resultados por episodio (`eval*/`, `final_*/`) permiten replicar la comparacion entre etapas de SFT y GRPO sin volver a entrenar.
- Estudio del efecto del RL sobre la generalizacion: la caida de 80,0 % a 0,0-10,0 % en objetos reservados es un caso medible para analizar sobreajuste inducido por recompensa dispersa.
- Evaluacion de robustez a la calibracion de camaras: los dos regímenes de evaluacion (camaras nominales frente a aleatorias) permiten cuantificar la sensibilidad a errores de montaje antes de un despliegue fisico.
- Benchmark de algoritmos de RL distribuido: la configuracion con 192 entornos paralelos, group size 8 y 2 epocas de rollout por paso sirve como referencia para comparar RLinf con otros frameworks de RL para robotica.
- Generacion de politicas base para transferencia sim-to-real: el montaje simulado esta reconstruido de fotografias de un banco real con xArm6, por lo que el checkpoint puede servir como inicializacion para un ajuste posterior en hardware, siempre asumiendo que la validacion real no existe todavia.
- Docencia y formacion en robotica: es un ejemplo completo y autocontenido de pipeline SFT + domain randomization + RL sobre un VLA de 7B en MuJoCo.
- Pruebas de infraestructura de inferencia multimodal: permite medir latencia y VRAM de una politica de 7B que debe sostener 10 Hz con dos flujos de imagen de entrada.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Todas las cifras corresponden a evaluacion en bucle cerrado, decodificacion greedy, limite de 400 pasos y exito definido como objeto reposando en el destino y liberado. 120 episodios por fila, excepto las filas de objetos reservados (60 episodios cada una).

| Evaluacion | step_140 | step_180 | step_130 |
|---|---|---|---|
| Layouts perturbados reservados (semillas 0-4), camaras nominales | 71,7 % | 73,3 % | 69,2 % |
| Layouts perturbados reservados, camaras aleatorias (mesa + muneca) | 55,8 % | 48,3 % | 46,7 % |
| Tareas de entrenamiento, semillas 0-4 | 80,0 % | no disponible | 72,5 % |
| Tareas de entrenamiento, semillas no vistas 5-9 | 45,0 % | 55,0 % | 50,0 % |
| Objetos reservados, mesa -> contenedor | 10,0 % | 16,7 % | 8,3 % |
| Objetos reservados, contenedor -> mesa | 0,0 % | 0,0 % | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica tipo LIBERO) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB solo para los pesos de un checkpoint de 7B en bfloat16, mas activaciones y cache KV; en la practica se recomienda reservar 18-24 GB para dos flujos de imagen y decodificacion de chunks de acciones.
- Tamano en disco: cada checkpoint fusionado ronda los 15 GB; el repositorio completo suma 45,7 GB al contener tres checkpoints.
- GPU recomendadas: A100 40 GB u 80 GB, H100 y L40S para inferencia comoda y para replicar el entrenamiento con 192 entornos paralelos.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB es suficiente para cargar un checkpoint en bfloat16; en tarjetas de 16 GB no se documenta ninguna cuantizacion que permita reducir el consumo.
- Opciones de despliegue: `transformers` mediante `AutoModelForVision2Seq.from_pretrained(path, trust_remote_code=True, torch_dtype=torch.bfloat16)` y variables de entorno tipo `ROBOT_PLATFORM=LIBERO`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para esta politica.
- Latencia y frecuencia: la politica opera a 10 Hz con chunks de 8 acciones, de modo que cada inferencia cubre 0,8 s de ejecucion; en evaluacion se permiten hasta 400 pasos (unos 40 s de trayectoria).
- Entrenamiento: GRPO con 192 entornos paralelos, group size 8, 2 epocas de rollout por paso y horizonte de 320 pasos; no se especifica el tipo ni el numero de GPUs utilizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r2s2r-openvla-oft-grpo-cam | aproximadamente 7B (LoRA r32 fusionado) | no disponible | 73,3 % en layouts reservados con camaras nominales; 0,0 % en objetos reservados contenedor -> mesa (evaluacion propia, no comparable con benchmarks publicos) | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| OpenVLA-7B (modelo base) | aproximadamente 7B | no disponible | no disponible en la informacion proporcionada | Llama 2 Community License | publico en HuggingFace |
| OpenVLA-OFT | derivado de OpenVLA-7B | no disponible | no disponible en la informacion proporcionada; este checkpoint usa sus constantes de `ROBOT_PLATFORM=LIBERO` (chunk 8, dim 7) | Llama 2 Community License | publico (referenciado en la model card) |

No se han identificado en la informacion proporcionada otros checkpoints directamente comparables de la misma tarea (xArm6 + pinza UF en MuJoCo con randomizacion de camaras).

## Limitaciones y advertencias

- Validacion exclusivamente en simulacion: el autor indica explicitamente que el modelo no ha sido validado en el robot real. No debe asumirse transferencia sim-to-real.
- Generalizacion muy debil a objetos reservados: 0,0 % de exito en la direccion contenedor -> mesa en los tres checkpoints y entre 8,3 % y 16,7 % en mesa -> contenedor.
- Degradacion con camaras aleatorias: el exito cae del 73,3 % al 48,3 % en `step_140`, lo que indica dependencia de la geometria de camara aprendida.
- Brecha entre semillas vistas y no vistas en las tareas de entrenamiento (hasta 80,0 % frente a 55,0 %), senal de sobreajuste a las semillas 0-4 y sus perturbaciones.
- Sin propiocepcion: la politica solo recibe imagenes e instruccion, lo que limita la precision en tareas que requieran conocer el estado articular real.
- Interfaz de instrucciones restringida a una plantilla fija en ingles; no se documentan capacidades multilingues.
- Riesgo de alucinacion en el sentido de acciones incorrectas o inseguras: al ser una politica de control, una prediccion erronea se traduce directamente en movimiento; se recomienda limitar velocidades y usar parada de emergencia en cualquier prueba fisica.
- Licencia Llama 2 Community License: el uso comercial esta sujeto a sus condiciones (entre ellas, obligaciones de atribucion y la clausula de licencia para modelos derivados con mas de 700 millones de parametros). Debe revisarse antes de cualquier explotacion comercial.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin validacion independiente de los resultados. Todas las cifras de rendimiento son autodeclaradas por el autor.
- Los resultados por episodio y los videos de evaluacion se encuentran en las carpetas `eval*/` y `final_*/` de cada checkpoint; conviene revisarlos antes de reutilizar las metricas.
- No se documentan versiones cuantizadas, por lo que el despliegue en hardware de gama media queda sin ruta conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bx6d/r2s2r-openvla-oft-grpo-cam
- Modelo base en HuggingFace: https://huggingface.co/openvla/openvla-7b
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (unicamente paginas sin relacion con el contenido tecnico), por lo que no se dispone de enlaces adicionales a papers, blogs, repositorios o demos verificados en la informacion proporcionada.
