# Efficient-Large-Model/Long-WAM-RoboCasa-GR1-19.2s

## Resumen

Long-WAM RoboCasa-GR1 19.2s es un checkpoint de politica robotica (policy) publicado por el equipo Efficient-Large-Model dentro de la familia Long-WAM, orientada a tareas de manipulacion en el entorno RoboCasa con el robot humanoide GR1. El modelo resuelve el problema de generar acciones motoras a partir de observaciones visuales y propioceptivas, incorporando una ventana de historial de observacion de 19,2 segundos (384 pasos de control a 20 Hz) que va mas alla de los enfoques reactivos habituales.

La etiqueta "19.2s" del nombre hace referencia exclusivamente a la duracion del historial de observacion, no al numero de parametros ni al tamano del chunk de acciones. El checkpoint combina un modulo de generacion de latentes de video futuro con un cabezal de prediccion de acciones: primero genera dos latentes de video futuro mediante 4 pasos de denoising y despues predice un chunk de 16 acciones con 10 pasos de denoising.

Es relevante porque aborda uno de los cuellos de botella clasicos en politicas roboticas: la memoria a largo plazo en tareas de manipulacion con horizonte extendido. La ventana de 19,2 segundos permite al modelo condicionar sus acciones en eventos ocurridos varios segundos atras, algo critico en tareas de ensamblaje, cocina o reorganizacion de objetos donde el estado relevante no siempre es visible en el frame actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (policy con generacion de latentes de video futuro y cabezal de acciones; detalles internos del backbone no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 19,2 segundos de historial de observacion (384 pasos de control a 20 Hz; 97 frames RGB codificados en 25 latentes limpios) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural de forma directa, aunque requiere embeddings de texto de tarea generados externamente) |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | PyTorch (`model.pt`) + `config.yaml` + `dataset_stats.json` + `SHA256SUMS`; tamano del repo 24,1 GB |

## Arquitectura y entrenamiento

Long-WAM es una politica robotica que combina un modulo de generacion de video latente con un cabezal de prediccion de acciones. En inferencia, el modelo recibe el historial de observacion (97 frames RGB de la camara `ego_view` a 256x256, preprocesados a 224x224, muestreados cada cuatro pasos de control) y genera dos latentes de video futuro en 4 pasos de denoising con sigma 0,9. Sobre esos latentes predice un chunk de 16 acciones con 10 pasos de denoising. La entrada incluye tambien un vector de propiocepcion de 58 dimensiones y la salida son acciones de 29 dimensiones, normalizadas con el `dataset_stats.json` proporcionado.

El checkpoint esta especializado en el entorno RoboCasa con el robot GR1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica el backbone del modulo de video (aunque se menciona que se requiere el Wan VAE como dependencia externa, lo que sugiere herencia de la familia Wan para la parte generativa). El checkpoint publicado contiene unicamente pesos e hiperparametros de inferencia, sin estados de optimizador ni artefactos de entrenamiento.

La innovacion principal es la ventana de historial de 19,2 segundos (P384: 384 pasos de control pasados mas la observacion actual), que permite al modelo razonar sobre eventos ocurridos varios segundos antes. El muestreo del historial cada cuatro pasos de control reduce el coste computacional: 97 frames RGB se codifican en 25 latentes limpios.

## Capacidades

- Generacion de acciones motoras para el robot humanoide GR1 en el simulador RoboCasa.
- Condicionamiento sobre historial visual largo (19,2 s) y propiocepcion de 58 dimensiones.
- Prediccion de video latente futuro como representacion intermedia antes de la prediccion de acciones.
- Prediccion de chunks de 16 acciones ejecutables antes de replanificar.
- Entrada de camara unica `ego_view` (RGB, 256x256 preprocesado a 224x224).
- Salida de acciones de 29 dimensiones normalizadas segun `dataset_stats.json`.
- No se documentan capacidades de tool calling, agentes multi-paso fuera del bucle de control, vision general, audio ni comprension de lenguaje natural directa.

## Casos de uso

- Manipulacion de objetos con memoria a largo plazo en RoboCasa: el modelo puede recordar la posicion de un objeto visto varios segundos antes aunque ya no este en el campo de vision actual, gracias a la ventana de 19,2 s.
- Tareas de cocina simulada con el robot GR1: secuencias como abrir un cajon, coger un utensilio y colocarlo en otro sitio requieren mantener el estado de la tarea durante varios segundos, algo que la ventana P384 cubre de forma nativa.
- Reorganizacion de escenas: el chunk de 16 acciones permite ejecutar movimientos compuestos sin replanificar en cada paso, reduciendo la frecuencia de inferencia y mejorando la fluidez.
- Investigacion en politicas con prediccion de video: el modulo de latentes de video futuro puede usarse como representacion auxiliar para estudiar el efecto de la planificacion visual en tareas de manipulacion.
- Benchmarking de politicas roboticas en RoboCasa: al ser un checkpoint publico con configuracion de inferencia documentada (pasos de denoising, sigma, frecuencia de muestreo del historial), sirve como baseline reproducible para comparar nuevas politicas.
- Desarrollo de pipelines de control a 20 Hz: la documentacion especifica el ritmo de captura de observaciones y la politica de repeticion del frame mas antiguo cuando el historial es corto, lo que facilita integrarlo en bucles de control en tiempo real.
- Evaluacion de robustez ante historial truncado: la regla de reinicio del historial en cada episodio y la repeticion del primer frame permiten disenar experimentos sobre el impacto de la memoria en el exito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. El repositorio pesa 24,1 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos; la VRAM dependera del runtime y del backbone, no documentados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime propio de Long-WAM para RoboCasa GR1 (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo). Requiere ademas el simulador GR1, los assets, el Wan VAE y los embeddings de texto de tarea, que se distribuyen por separado.
- Latencia y throughput: no disponibles. La model card solo especifica el bucle de control a 20 Hz y el numero de pasos de denoising (4 para video, 10 para acciones), sin cifras de latencia medidas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a otras politicas roboticas comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia `other`: los terminos concretos no estan detallados en la model card; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- El checkpoint esta especializado exclusivamente en RoboCasa con el robot GR1; no es un modelo generalista y no se espera que funcione fuera de ese entorno sin reentrenamiento.
- Requiere dependencias externas no incluidas: runtime Long-WAM, simulador y assets de GR1, Wan VAE y embeddings de texto de tarea. Sin ellas el checkpoint no es utilizable.
- Solo acepta una camara `ego_view`; no se documenta soporte multi-camara ni otros sensores.
- El historial debe reiniciarse en cada episodio; un uso incorrecto (por ejemplo, mezclar historial entre episodios) puede degradar las predicciones.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de distribucion.
- El checkpoint no incluye estados de optimizador ni artefactos de entrenamiento, por lo que no es adecuado para reanudar entrenamiento directamente.
- El tamano del repositorio (24,1 GB) y la necesidad de ejecutar un simulador completo implican requisitos de infraestructura considerables para pruebas.
- No se especifican idiomas soportados ni capacidades de lenguaje natural; la tarea se comunica mediante embeddings de texto generados externamente.

## Enlaces

- Hugging Face: https://huggingface.co/Efficient-Large-Model/Long-WAM-RoboCasa-GR1-19.2s
- Repositorio del autor en Hugging Face: https://huggingface.co/Efficient-Large-Model
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
