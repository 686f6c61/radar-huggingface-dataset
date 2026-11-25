# Efficient-Large-Model/SANA-Robot-AR-LIBERO

## Resumen

SANA-Robot-AR LIBERO es un modelo de accion mundial (world-action model) para robotica de manipulacion desarrollado por Efficient-Large-Model (grupo vinculado a NVIDIA Labs, segun la pagina del proyecto). A partir de una observacion multi-vista (camara en tercera persona y camara de muneca, 256x256 cada una), la propriocepcion del robot y una instruccion en lenguaje natural, el modelo predice de forma conjunta un bloque de 32 acciones de control y el video futuro correspondiente. Esta variante AR anade una memoria hibrida sobre el historial visual del episodio, de modo que el coste de inferencia no crece con la duracion del episodio.

La innovacion central es la combinacion de capas de atencion softmax (que leen el primer fotograma y una ventana deslizante de un bloque reciente) con capas Gated DeltaNet que comprimen cada bloque pasado en un estado de tamano constante. Esto permite mantener contexto de episodios largos sin un coste cuadratico en atencion, algo relevante en tareas de manipulacion con horizonte extendido.

El modelo, de 4,5B parametros, se ha post-entrenado sobre las cuatro suites de LIBERO (Spatial, Object, Goal y Long) con un unico conjunto de pesos, y se evalua sobre tres benchmarks de perturbacion (LIBERO-Plus, LIBERO-PRO y LIBERO-MAX). Su licencia Apache 2.0 y su enfoque eficiente lo hacen util como referencia para investigacion en politicas de manipulacion y como base para fine-tuning en otros robots o escenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model hibrido: capas de atencion softmax + capas Gated DeltaNet (memoria de estado constante); policy type `ar` |
| Parametros totales | 4,5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Memoria hibrida: primer fotograma + ventana deslizante de 1 bloque + estado Gated DeltaNet sobre todos los bloques pasados; sin limite de contexto en tokens declarado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma de entrenamiento no declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (state dict bajo la clave `state_dict_ema`), acompanado de `meta.json`, `normalization.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

SANA-Robot-AR es un modelo de accion mundial que combina prediccion de acciones con prediccion de video futuro. La entrada son dos camaras (tercera persona y muneca) a 256x256 con disposicion espacial 2x2, la propriocepcion y una instruccion textual. La salida es un bloque de 32 pasos de control; el video de cada bloque se codifica con un stride de 4 fotogramas. La memoria visual del episodio se gestiona de forma hibrida: las capas de atencion softmax acceden al primer fotograma y a una ventana deslizante de un bloque reciente, mientras que las capas Gated DeltaNet comprimen cada bloque pasado en un estado de tamano constante, evitando que el coste de una peticion crezca con la longitud del episodio.

El modelo se ha post-entrenado sobre las demostraciones de las cuatro suites de LIBERO (Spatial, Object, Goal y Long), con un unico modelo para todas ellas. Los pesos publicados son los EMA (decay 0.999) en el paso 8.000 de post-entrenamiento. Utiliza como codificador de texto Gemma 2 2B (no incluido en el repositorio) y como VAE de video LTX-2.3 VAE en formato diffusers (tampoco incluido). El repositorio incluye `normalization.json` y `meta.json`, que deben usarse tal cual (no recalcular la normalizacion) al ejecutar los pesos. La receta de fine-tuning es `configs/libero_ar.yaml`.

## Capacidades

- Prediccion conjunta de bloques de 32 acciones de control y video futuro a partir de observacion multi-vista, propriocepcion e instruccion en lenguaje natural.
- Memoria de episodio con coste constante: atencion al primer fotograma, ventana deslizante de un bloque y estado Gated DeltaNet sobre el historial.
- Control de un brazo Franka Panda con camara de tercera persona y camara de muneca.
- Generalizacion a perturbaciones de camara, robot, lenguaje, iluminacion, fondo, ruido y disposicion (evaluado en LIBERO-Plus).
- Robustez frente a perturbaciones de objeto, posicion, semantica y tarea (evaluado en LIBERO-PRO).
- Evaluacion en escenarios base y dinamicos (LIBERO-MAX).
- Inferencia eficiente: 2 pasos de denoising sin guidance en LIBERO-Plus y LIBERO-MAX; 10 pasos con guidance de video 3 en LIBERO-PRO.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no disponible; el modelo es una politica robotica.

## Casos de uso

- Investigacion en politicas de manipulacion: servir como referencia reproducible sobre LIBERO para comparar metodos de world-action models con memoria, usando los pesos publicados y el evaluador de `eval/libero`.
- Fine-tuning en nuevos robots o escenas: partir de estos pesos (o de SANA-Robot-AR-Pretrain) y adaptar con la receta `configs/libero_ar.yaml` a tareas y camaras propias.
- Manipulacion con horizonte largo: la memoria hibrida (estado Gated DeltaNet de tamano constante) permite mantener informacion de episodios de hasta 400-700 pasos de control sin que el coste crezca con la duracion.
- Evaluacion de robustez: usar los pesos como linea base en benchmarks de perturbacion (LIBERO-Plus, LIBERO-PRO, LIBERO-MAX) para medir degradacion ante cambios de camara, iluminacion, lenguaje o posicion de objetos.
- Prediccion de video futuro para planificacion: la salida de video por bloque puede usarse para inspeccionar la intencion del modelo antes de ejecutar acciones en simulacion.
- Generacion de datos sinteticos de trayectorias en simulacion: el modelo puede producir bloques de acciones y videos asociados para aumentar datasets de investigacion, siempre en entorno simulado.
- Prototipado de pipelines de control visual con instrucciones en lenguaje natural en laboratorio, con limites de espacio de trabajo y parada de emergencia.

## Benchmarks y rendimiento

Tasa de exito (%) reportada por el autor sobre benchmarks de perturbacion de LIBERO:

| Benchmark | Episodios | Tasa de exito |
|---|---|---|
| LIBERO-Plus | 10.030 | 93,98 |
| LIBERO-PRO | 8.000 | 68,09 |
| LIBERO-MAX | 8.000 pares | 88,30 (Base), 76,06 (Dynamic) |

LIBERO-Plus por tipo de perturbacion:

| Camara | Robot | Lenguaje | Luz | Fondo | Ruido | Disposicion |
|---|---|---|---|---|---|---|
| 84,1 | 98,4 | 93,9 | 99,7 | 98,8 | 94,4 | 91,8 |

LIBERO-PRO por tipo de perturbacion:

| Objeto | Posicion | Semantica | Tarea |
|---|---|---|---|
| 88,95 | 47,65 | 98,10 | 37,65 |

Con los limites de pasos de las cuatro suites originales (220 / 280 / 300 / 520), la tasa de exito es 93,35 en LIBERO-Plus y 65,36 en LIBERO-PRO. LIBERO-MAX usa siempre esos limites. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 4,5B en precision de 16 bits requiere del orden de 9 GB solo para pesos, a lo que hay que sumar el codificador de texto Gemma 2 2B y el VAE de video LTX-2.3, no incluidos en el repositorio.
- GPU recomendadas: no disponible de forma explicita; por tamano, una GPU con 24 GB o mas (RTX 4090, A100, H100) es un punto de partida razonable, pero no confirmado por el autor.
- Cabe en GPU de consumo: no confirmado; depende de la precision y de los componentes auxiliares (text encoder y VAE).
- Opciones de despliegue: el autor remite al codigo de SANA-Robot y al evaluador en `eval/libero`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La configuracion de inferencia usa 2 pasos de denoising sin guidance (LIBERO-Plus y LIBERO-MAX) y 10 pasos con guidance 3 (LIBERO-PRO), con nuevo bloque cada 16 u 8 pasos de control respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-Robot-AR LIBERO | 4,5B | Memoria hibrida (ventana + estado Gated DeltaNet) | World-action model con prediccion de acciones y video | Apache 2.0 | Pesos en Hugging Face |
| SANA-Robot-AR-Pretrain | no disponible | Memoria hibrida | Modelo preentrenado para fine-tuning | Apache 2.0 | Pesos en Hugging Face |
| SANA-Robot-AR-RoboDojo | no disponible | Memoria hibrida | Variante post-entrenada en RoboDojo | Apache 2.0 | Pesos en Hugging Face |
| SANA-Robot-AR-RoboTwin2.0 | no disponible | Memoria hibrida | Variante post-entrenada en RoboTwin2.0 | Apache 2.0 | Pesos en Hugging Face |

No se dispone de datos de rendimiento de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente sobre demostraciones simuladas de LIBERO con un robot Franka Panda de un brazo; otros robots, camaras, tareas o escenas requieren fine-tuning.
- Una politica aprendida puede fallar sin aviso: en un robot fisico debe ejecutarse solo con limites de espacio de trabajo, limites de velocidad y una persona junto al boton de parada.
- El rendimiento cae de forma notable en perturbaciones de posicion (47,65) y de tarea (37,65) en LIBERO-PRO, lo que indica fragilidad ante cambios fuera de la distribucion de entrenamiento.
- Requiere usar el `normalization.json` y el `meta.json` publicados; recalcular la normalizacion puede degradar el comportamiento.
- El codificador de texto (Gemma 2 2B) y el VAE de video (LTX-2.3) no estan incluidos en el repositorio y deben obtenerse por separado, con sus propias licencias.
- No se documentan sesgos, idiomas de entrenamiento ni riesgos de alucinacion en el sentido de LLM; el modelo es una politica robotica, no un modelo de lenguaje de proposito general.
- Uso previsto: investigacion en politicas de manipulacion robotica; no se declaran garantias para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO
- Pagina del proyecto: https://nvlabs.github.io/Sana/Robot/
- Modelo preentrenado: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain
- Variante RoboDojo: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboDojo
- Variante RoboTwin2.0: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboTwin2.0
- Codificador de texto Gemma 2 2B: https://huggingface.co/google/gemma-2-2b-it
- VAE de video LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
- LIBERO (benchmark original): https://github.com/Lifelong-Robot-Learning/LIBERO
- LIBERO-Plus: https://github.com/sylvestf/LIBERO-plus
- LIBERO-PRO: https://github.com/Zxy-MLlab/LIBERO-PRO
- LIBERO-MAX: https://github.com/liberomax/LIBERO-MAX
