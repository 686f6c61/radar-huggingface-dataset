# Efficient-Large-Model/SANA-Robot-AR-RoboTwin2.0

## Resumen

SANA-Robot-AR-RoboTwin2.0 es un modelo de accion mundial (world-action model) para manipulacion robotica desarrollado por el equipo Efficient-Large-Model (NVIDIA Labs, segun la pagina del proyecto). A partir de observaciones multivista, propiocepcion e instrucciones en lenguaje natural, el modelo predice un bloque de 32 acciones de control junto con el video futuro de la escena. Se trata de un ajuste fino del checkpoint SANA-Robot-AR-Pretrain sobre las demostraciones limpias del benchmark RoboTwin 2.0.

La innovacion principal es su memoria hibrida sobre el historial visual del episodio: las capas de atencion softmax leen el primer fotograma y una ventana deslizante de bloques recientes, mientras que las capas Gated DeltaNet comprimen cada bloque pasado en un estado de tamano constante. Esto hace que el coste computacional de una peticion no crezca con la longitud del episodio, lo que resulta relevante para tareas de manipulacion de horizonte largo en robotica.

El modelo tiene 4,5 mil millones de parametros, se distribuye con licencia Apache 2.0 y esta disenado para el robot ALOHA-AgileX de dos brazos con control de efector final. Su relevancia actual radica en que combina prediccion de acciones con generacion de video futuro en un unico modelo autorregresivo con memoria eficiente, una linea de investigacion activa en world models para robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SANA-Robot-AR (autorregresiva) con atencion hibrida: capas softmax (primer fotograma y ventana deslizante de 1 bloque) y capas Gated DeltaNet (estado comprimido de todos los bloques pasados) |
| Parametros totales | 4,5 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como numero de tokens; memoria compuesta por primer fotograma, ventana deslizante de 1 bloque y estado Gated DeltaNet sobre todos los bloques pasados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se codifican con Gemma 2 2B) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (state dict bajo la clave `state_dict`), mas `meta.json`, `normalization.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

SANA-Robot-AR es un modelo autorregresivo que, dado el estado actual (observaciones de tres camaras, propiocepcion e instruccion de lenguaje), genera un bloque de 32 pasos de control y el video del bloque codificado con un stride de 4 fotogramas. La memoria hibrida combina atencion softmax sobre el primer fotograma y una ventana deslizante de un bloque, con capas Gated DeltaNet que comprimen todos los bloques anteriores en un estado de tamano constante; de este modo el coste de inferencia no escala con la duracion del episodio.

El modelo parte del checkpoint SANA-Robot-AR-Pretrain y se post-entrena sobre las 2.500 demostraciones limpias de 50 tareas del benchmark RoboTwin 2.0, alcanzando el paso de post-entrenamiento 15.000. La configuracion de robot es ALOHA-AgileX de dos brazos con control de efector final y disposicion de camaras en forma de T: cabeza a 384 x 480 y dos camaras de muneca a 192 x 256. El codificador de texto es Gemma 2 2B y el VAE de video es LTX-2.3, ninguno de los cuales se incluye en el repositorio. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si se empleo RLHF o DPO.

## Capacidades

- Prediccion de bloques de 32 acciones de control de efector final para un robot de dos brazos.
- Generacion del video futuro de la escena correspondiente a cada bloque de acciones.
- Condicionamiento por instrucciones en lenguaje natural mediante el codificador Gemma 2 2B.
- Fusion de observaciones multivista (camara de cabeza y dos camaras de muneca) con propiocepcion.
- Memoria de episodio con coste constante mediante Gated DeltaNet, apta para tareas de horizonte largo.
- Ejecucion de 50 tareas de manipulacion del benchmark RoboTwin 2.0.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Investigacion en politicas de manipulacion: el modelo sirve como referencia reproducible para comparar metodos de world-action models sobre el benchmark RoboTwin 2.0 con el protocolo Clean2Random.
- Evaluacion de robustez ante escenas aleatorizadas: el mismo checkpoint entrenado solo con escenas limpias alcanza un 73,28 % en escenas randomizadas, lo que permite estudiar la brecha de generalizacion.
- Prediccion de video futuro para planificacion: al generar el video del bloque junto con las acciones, se puede usar para verificar visualmente la plausibilidad de una trayectoria antes de ejecutarla en simulacion.
- Ajuste fino para nuevos robots o camaras: al ser un modelo base con receta de fine-tuning publicada (`configs/robotwin_ar.yaml`), sirve de punto de partida para adaptar la politica a otras configuraciones.
- Tareas de horizonte largo en simulacion: la memoria de coste constante permite mantener contexto de episodios extensos sin crecimiento del coste por peticion.
- Docencia y prototipado en robotica: la licencia Apache 2.0 y la disponibilidad de scripts de evaluacion facilitan su uso en cursos y laboratorios de aprendizaje por imitacion.

## Benchmarks y rendimiento

Protocolo Clean2Random: el mismo checkpoint, entrenado solo con escenas limpias, se evalua en escenas limpias y randomizadas con el `script/eval_policy.py` del benchmark, 50 tareas con 100 episodios por tarea y ajuste. Tasa de exito (%):

| demo_clean | demo_randomized | Media |
|---|---|---|
| 91,84 | 73,28 | 82,56 |

Ajustes de inferencia: 20 pasos de denoising, guia de video 6, semilla 0 y un bloque nuevo cada 16 pasos de control (`eval/robotwin/deploy.yaml`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 17,9 GB y el modelo tiene 4,5 mil millones de parametros, pero no se especifica el consumo real.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: servidor de politica incluido en `eval/robotwin` del codigo de SANA-Robot; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se conocen los ajustes de inferencia (20 pasos de denoising, guia 6, bloque nuevo cada 16 pasos de control).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-Robot-AR-RoboTwin2.0 | 4,5 B | Memoria hibrida de coste constante | 82,56 % medio en RoboTwin 2.0 (Clean2Random) | Apache 2.0 | Hugging Face |
| SANA-Robot-AR-Pretrain | no disponible | Memoria hibrida de coste constante | no disponible | Apache 2.0 | Hugging Face |
| SANA-Robot-AR-RoboDojo | no disponible | Memoria hibrida de coste constante | no disponible | Apache 2.0 | Hugging Face |
| SANA-Robot-AR-LIBERO | no disponible | Memoria hibrida de coste constante | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables ni de alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre demostraciones simuladas de un unico benchmark y un unico robot (ALOHA-AgileX); otros robots, camaras, tareas o escenas requieren ajuste fino.
- Una politica aprendida puede fallar sin aviso; en un robot fisico debe ejecutarse solo con limites de espacio de trabajo, limites de velocidad y una persona junto al boton de parada.
- La brecha entre escenas limpias (91,84 %) y randomizadas (73,28 %) evidencia perdida de rendimiento ante cambios de apariencia o entorno.
- El codificador de texto Gemma 2 2B y el VAE de video LTX-2.3 no se incluyen y deben obtenerse por separado, con sus propias condiciones de uso.
- Debe usarse el `normalization.json` incluido junto con `meta.json`; una normalizacion recalculada a partir de los datos puede degradar el rendimiento.
- No se documentan sesgos conocidos, riesgo de alucinacion en el sentido de los modelos de lenguaje, ni limitaciones de idioma.
- Licencia Apache 2.0, sin restricciones adicionales documentadas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboTwin2.0
- Modelo preentrenado: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain
- Variante RoboDojo: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboDojo
- Variante LIBERO: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO
- Pagina del proyecto: https://nvlabs.github.io/Sana/Robot/
- Benchmark RoboTwin 2.0: https://github.com/RoboTwin-Platform/RoboTwin
- Codificador de texto Gemma 2 2B: https://huggingface.co/google/gemma-2-2b-it
- VAE de video LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
