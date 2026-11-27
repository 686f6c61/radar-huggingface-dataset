# Dongkkka/k1_sonic_xr1_5b_100K

## Resumen

k1_sonic_xr1_5b_100K es un ajuste fino (fine-tune) del modelo Xiaomi-Robotics-1-5B (XR-1 5B) de Xiaomi Robotics, especializado en control robótico mediante visión-lenguaje-acción (vision-language-action, VLA). Lo publica el usuario Dongkkka en Hugging Face y está orientado a la tarea de manipulación de cajas de IKEA sobre el robot humanoide ROBOTIS K1 simulado en MuJoCo. El modelo recibe una imagen RGB de la cabeza del robot, 23 ángulos articulares en radianes y una instrucción en lenguaje natural, y produce como salida 30 tokens SONIC consecutivos de 64 dimensiones a 50 Hz que alimentan el decodificador SONIC del K1.

El interés de esta ficha es doble. Por un lado, ilustra el flujo de trabajo típico de adaptación de un modelo VLA generalista a un robot concreto mediante un conjunto reducido de demostraciones (90 episodios) y un entrenamiento prolongado (100.000 pasos de optimizador). Por otro, documenta un caso de empaquetado parcial: el archivo `model.safetensors` contiene 675.547.648 parámetros entrenados en FP32, mientras que el modelo completo de inferencia requiere combinarlos con los pesos congelados del checkpoint base XR-1 5B, por lo que el repositorio no es autocontenido.

La relevancia actual radica en que demuestra cómo modelos base de gran tamaño (5B) pueden adaptarse a tareas de control de bajo nivel con conjuntos de datos pequeños, siempre que se disponga del fork de inferencia adecuado (LocoManiLab XR-1) y del procesador Qwen3-VL con la revisión exacta registrada en `config.json`. Es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de Xiaomi XR-1 5B; transformer multimodal con cabecera de tokens SONIC |
| Parametros totales | 675.547.648 parametros entrenados en `model.safetensors` (FP32); el modelo completo combina estos con los pesos congelados del checkpoint base XR-1 5B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (las instrucciones son en lenguaje natural, sin lista de idiomas declarada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); requiere ademas `model_states.pt` del checkpoint base XR-1 5B |

## Arquitectura y entrenamiento

El modelo es un fine-tune del XR-1 5B de Xiaomi Robotics, un modelo de visión-lenguaje-acción que combina un backbone multimodal (con procesador Qwen3-VL-4B-Instruct en la revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`) con una cabeza de prediccion de acciones. En esta adaptacion, la entrada consta de una imagen RGB de la cabeza del robot, un vector de 23 angulos articulares del K1 en radianes y una instruccion textual. La salida son 30 tokens SONIC sucesivos de 64 dimensiones, muestreados a 50 Hz, que el decodificador SONIC del K1 traduce a comandos motores.

El entrenamiento se realizo sobre la tarea de caja de IKEA en el simulador MuJoCo con el robot ROBOTIS K1, usando 90 demostraciones y 100.000 pasos de optimizador. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens vistos, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal. Un detalle tecnico relevante es que los pesos entrenados se publican en FP32 original y que la inferencia exige el fork LocoManiLab de XR-1 (commit `8598deffcc560c4ca8aad616c82f925b248de8c1`) junto con el fichero `normalization.json`, que contiene el orden articular y los valores de escalado derivados del entrenamiento.

## Capacidades

- Generacion de acciones roboticas: predice secuencias de 30 tokens SONIC de 64 dimensiones a 50 Hz para el decodificador del K1.
- Fusion multimodal: integra una imagen RGB de cabeza, el estado articular (23 angulos en radianes) y una instruccion en lenguaje natural en una unica pasada.
- Control de manipulacion: especializado en la tarea de caja de IKEA en MuJoCo con el robot ROBOTIS K1.
- Seguimiento de instrucciones: la tarea se condiciona mediante texto, aunque no se declara una lista de idiomas soportados.
- Inferencia offline: el flujo documentado funciona con `HF_HUB_OFFLINE=1` una vez descargados los artefactos.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el pipeline de fine-tune de un VLA de 5B con 90 demostraciones para estudiar la relacion entre numero de episodios y pasos de optimizador en tareas de manipulacion.
- Evaluacion de politicas en simulacion: desplegar la politica en MuJoCo sobre el K1 para medir tasas de exito en la tarea de caja de IKEA antes de transferir a hardware real.
- Benchmarking de adaptaciones VLA: usar este checkpoint como referencia de "fine-tune de bajo dato" frente a otros ajustes del mismo modelo base XR-1 5B.
- Docencia y divulgacion: ilustrar de forma completa el ciclo descarga de snapshot, carga de pesos base congelados, construccion de la politica `K1XR1` y prediccion de tokens.
- Desarrollo de decodificadores SONIC: emplear las secuencias de 30 tokens a 50 Hz como entrada de prueba para validar o comparar decodificadores de acciones.
- Pruebas de infraestructura de inferencia: validar entornos con PyTorch 2.7.1, FlashAttention 2.7.4.post1 y Transformers 4.57.1 antes de escalar a otros modelos VLA.
- Reproducibilidad de artefactos parciales: estudiar el patron de publicar solo los parametros entrenados y reconstruir el modelo completo con el checkpoint base fijado por revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 2,7 GB y los pesos entrenados son 675.547.648 parametros en FP32, a los que hay que sumar los pesos congelados del checkpoint base XR-1 5B para la inferencia completa.
- GPU recomendadas: no disponible; el autor solo exige un entorno CUDA con PyTorch y FlashAttention 2.
- Compatibilidad con GPU de consumo: no confirmada; depende del peso total del modelo base XR-1 5B combinado con los parametros entrenados.
- Opciones de despliegue: inferencia via el fork LocoManiLab XR-1 (modulo `xr1_inference`, clase `K1XR1`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Software requerido: PyTorch 2.7.1, FlashAttention 2.7.4.post1, Transformers 4.57.1, Hugging Face Hub, Safetensors y las dependencias del fork fijado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| k1_sonic_xr1_5b_100K | 675.547.648 entrenados (FP32) + base XR-1 5B congelado | no disponible | VLA para K1 en MuJoCo (caja IKEA) | apache-2.0 | Hugging Face, requiere fork y checkpoint base |
| Xiaomi-Robotics-1-5B (base) | 5B (denominacion del checkpoint) | no disponible | VLA generalista de Xiaomi Robotics | no disponible en la informacion proporcionada | Hugging Face (XiaomiRobotics) |
| Qwen3-VL-4B-Instruct | 4B (denominacion) | no disponible | Vision-lenguaje general | no disponible en la informacion proporcionada | Hugging Face (Qwen), usado aqui solo como procesador |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es autocontenido: `model.safetensors` solo contiene los parametros entrenados; la inferencia exige descargar `model_states.pt` del checkpoint base XR-1 5B en la revision `ee21d524b5c52ac961d941e1bc7d6d92836c3d5e`.
- Dependencia estricta de un fork no oficial (LocoManiLab XR-1) y de revisiones fijadas de Transformers (4.57.1) y del procesador Qwen3-VL; cambios de version pueden romper la carga.
- Especializacion extrema: entrenado solo para la tarea de caja de IKEA con el robot K1 en MuJoCo; no se espera generalizacion a otras tareas, robots o entornos reales sin reentrenamiento.
- Conjunto de entrenamiento muy reducido (90 demostraciones), lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones de iluminacion, posicion inicial o ruido sensorial.
- No se documentan sesgos, evaluaciones de alucinacion ni comportamiento fuera de distribucion; al ser un modelo de accion, el fallo se manifiesta como comandos motores incorrectos.
- No se declara lista de idiomas soportados para las instrucciones de texto.
- Aunque la licencia es apache-2.0, conviene verificar la licencia y los terminos del checkpoint base XR-1 5B antes de un uso comercial, ya que el modelo completo los incorpora.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/k1_sonic_xr1_5b_100K
- Checkpoint base XR-1 5B: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-5B/tree/ee21d524b5c52ac961d941e1bc7d6d92836c3d5e
- Fork de inferencia LocoManiLab XR-1: https://github.com/LocoManiLab/Xiaomi-Robotics-1/tree/8598deffcc560c4ca8aad616c82f925b248de8c1
- Procesador Qwen3-VL-4B-Instruct (revision usada): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
