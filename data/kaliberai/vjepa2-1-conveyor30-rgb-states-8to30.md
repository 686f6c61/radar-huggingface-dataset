# KaliberAI/vjepa2-1-conveyor30-rgb-states-8to30

## Resumen

vjepa2-1-conveyor30-rgb-states-8to30 es un modelo de prediccion de trayectorias 3D para objetos sobre una cinta transportadora, publicado por KaliberAI. No es un modelo de lenguaje: combina un encoder de video V-JEPA 2.1 ViT-B congelado con un modulo de fusion visual/estado entrenable y un decoder transformer de 30 consultas, y predice los proximos 30 estados fisicos de una pelota a partir de ocho fotogramas RGB consecutivos y de sus ocho estados 3D pasados (X, Y, Z, vX, vY, vZ). El horizonte de prediccion es de un segundo a 30 FPS, sin rollout fisico explicito.

El interes tecnico del release esta en su enfoque hibrido: reutiliza representaciones latentes de video preentrenadas (V-JEPA 2.1) en lugar de aprender vision desde cero, y las acopla con informacion de estado fisico calibrada en el mundo real. Sobre esa base, un adaptador temporal entrenado por separado corrige unicamente las componentes verticales Z y vZ, lo que permite ajustar el comportamiento en eventos de rebote sin degradar en exceso el error agregado.

Se trata de un artefacto de investigacion muy especializado y de nicho: el repositorio pesa 0,1 GB, no incluye los pesos del backbone (hay que descargarlos aparte del checkpoint oficial de Meta) y no publica licencia ni idiomas soportados. Su validacion se limita a grabaciones privadas de una pelota amarilla de pickleball con camara fija y calibracion concreta, por lo que su uso fuera de ese dominio exige reevaluacion completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de video V-JEPA 2.1 ViT-B congelado + fusion visual/estado entrenable + decoder transformer de 30 consultas (256 dimensiones ocultas, 8 cabezas de atencion, 3 capas) + adaptador temporal Z/vZ entrenado por separado |
| Parametros totales | no disponible (el backbone ViT-B no se incluye en el repositorio; el tamano total del repo es 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8 fotogramas RGB consecutivos (7/30 s entre marcas de tiempo) + 8 estados 3D pasados; salida de 30 estados futuros (+1/30 s a +30/30 s), 1 segundo a 30 FPS |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision y prediccion de trayectorias; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `baseline/best.pt` y `adapter/candidate.pt`; backbone V-JEPA 2.1 ViT-B distilled descargable por separado |

## Arquitectura y entrenamiento

El pipeline consta de cuatro piezas: un encoder V-JEPA 2.1 ViT-B congelado que procesa los ocho fotogramas RGB; un modulo de fusion visual/estado entrenable que combina las representaciones visuales con los ocho estados 3D pasados `(X, Y, Z, vX, vY, vZ)`; un decoder transformer con 30 consultas (una por paso futuro), 256 dimensiones ocultas, ocho cabezas de atencion y tres capas; y un adaptador temporal entrenado de forma independiente que modifica unicamente `Z` y `vZ`. El paquete del adaptador incluye una copia del decoder congelado, aunque el repositorio exige el checkpoint baseline por separado para sus comprobaciones de procedencia.

Los pesos liberados son dos archivos PyTorch con hashes SHA-256 publicados (`47bda584...` para el baseline y `1646cedd...` para el adaptador), y los pesos del backbone no estan incluidos: deben descargarse del checkpoint oficial `vjepa2_1_vitb_dist_vitG_384.pt` (SHA-256 `848a77c3...`). El entrenamiento se realizo sobre grabaciones privadas de una pelota amarilla de pickleball con cintas en movimiento y detenidas, con un split por grabacion original: 10.004 ventanas de entrenamiento, 1.907 de validacion y 2.047 de test. Las coordenadas estan en el sistema de referencia calibrado del dataset, con posiciones en metros y velocidades en metros por segundo. No se documenta uso de RLHF ni de DPO, ni tecnicas de decodificacion especulativa.

## Capacidades

- Prediccion de trayectorias 3D: dado un historial de ocho fotogramas y ocho estados, genera 30 estados futuros con posicion y velocidad en un marco de mundo calibrado.
- Prediccion a un segundo de horizonte a 30 FPS, sin simulacion fisica ni rollout explicito.
- Fusion multimodal vision + estado: integra RGB y variables fisicas numericas en un mismo espacio de representacion.
- Correccion vertical especifica mediante adaptador dedicado a `Z` y `vZ`, orientado a eventos de subida y bajada (rebotes) en cinta.
- Comprobacion de integridad de pesos mediante hashes SHA-256 y carga segura con `torch.load(..., weights_only=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingues: no es un modelo de texto.
- No dispone de modo thinking, entrada de audio ni tareas de vision generales (clasificacion, VQA, captioning) declaradas en la model card.

## Casos de uso

- Prediccion de trayectoria en lineas de clasificacion y enrutado: el modelo estima donde estara cada objeto 1 segundo despues sobre la cinta, lo que permite accionar desviadores neumaticos o brazos con antelacion suficiente para separar piezas por destino.
- Control de robots pick-and-place: con la posicion futura y la velocidad estimada se puede planificar el instante de cierre de pinza sin recurrir a vision reactiva, reduciendo el ciclo de captura.
- Deteccion de eventos anomalos: un error de prediccion elevado o una prediccion de Z incompatible con la fisica de la cinta puede señalar caidas de objeto, atascos o paradas inesperadas de la banda.
- Sincronizacion de actuadores: el horizonte de 30 pasos a 30 FPS encaja con el ciclo de control de PLC y actuadores industriales, permitiendo programar disparos temporizados sobre la posicion predicha.
- Analisis retrospectivo de video para control de calidad: reprocesar grabaciones de planta para reconstruir trayectorias y detectar ventanas con comportamiento anomalo sin anotacion manual.
- Etiquetado automatico de datos: usar las predicciones como preanotaciones de trayectoria para acelerar la construccion de nuevos datasets de vision industrial, siempre que se validen contra futuros etiquetados.
- Investigacion en world models y representaciones latentes de video: el diseno encoder congelado + decoder ligero sirve como banco de pruebas para evaluar cuanto valor aporta un backbone V-JEPA preentrenado frente a un encoder entrenado desde cero en una tarea fisica concreta.
- Gemelo digital de linea de produccion: alimentar un simulador con las trayectorias predichas para validar cambios de velocidad de cinta o de separacion entre objetos antes de tocar la instalacion real.

## Benchmarks y rendimiento

Resultados publicados sobre las 1.907 ventanas de validacion originales, con el checkpoint del adaptador seleccionado:

| Metrica | Resultado |
|---|---:|
| Error medio de desplazamiento 3D (ADE) | 1,9765 cm |
| Error en la ultima posicion futura valida | 3,4894 cm |
| ADE horizontal XY | 1,9216 cm |
| Error absoluto medio en Z | 0,2680 cm |
| Error L2 de velocidad | 0,05747 m/s |
| Posiciones futuras validas dentro de 5 cm | 92,81% |

Comparacion interna entre las dos variantes liberadas:

| Variante | ADE 3D (validacion) | Notas |
|---|---:|---|
| Decoder baseline (`baseline/best.pt`) | 1,9593 cm | Mejor error agregado |
| Decoder + adaptador Z/vZ (`adapter/candidate.pt`) | 1,9765 cm | Seleccionado por comportamiento en eventos verticales; empeora ligeramente el ADE agregado |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. A partir del tamano del repositorio (0,1 GB de checkpoints) y de un backbone ViT-B, la inferencia de una ventana de 8 fotogramas mas estados deberia caber holgadamente en 2-4 GB en precision completa, incluyendo activaciones; cifra orientativa, no validada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente; una RTX 3060 de 12 GB o superior, RTX 4070/4080/4090, A100 o H100 no aportan ventaja clara dado el tamano del modelo, mas alla del throughput por lotes.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU dedicada moderna y en iGPU con memoria compartida suficiente, aunque no hay requisitos publicados.
- Opciones de despliegue: el flujo oficial es el paquete Python del repositorio (`python -m conveyor30 download-backbone`, `import-checkpoints`, `eval`, `eval-full-video`) sobre PyTorch. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables, al no ser un modelo de lenguaje).
- Latencia y throughput estimados: no disponible.
- Almacenamiento: 0,1 GB para los dos checkpoints, mas el backbone V-JEPA 2.1 ViT-B distilled descargado aparte.
- Nota: la evaluacion publicada requiere anotaciones originales (yellow-moving-79 y yellow-stopped-78) preparadas segun el README de GitHub, o la grabacion `185639` para la validacion sobre video completo.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos de terceros directamente comparables. La unica comparacion disponible es interna, entre las dos variantes del propio release:

| Modelo | Tipo | Parametros | Entrada / salida | ADE 3D (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KaliberAI vjepa2-1-conveyor30-rgb-states-8to30 (con adaptador) | Prediccion de trayectorias 3D sobre V-JEPA 2.1 | no disponible | 8 frames RGB + 8 estados -> 30 estados | 1,9765 cm | no disponible | Hugging Face |
| Baseline del mismo release (`baseline/best.pt`) | Igual, sin adaptador Z/vZ | no disponible | Igual | 1,9593 cm | no disponible | Incluido en el mismo repositorio |
| V-JEPA 2.1 ViT-B distilled (checkpoint oficial) | Encoder de video auto-supervisado | no disponible en la informacion | Video a representaciones latentes | no aplica (no predice trayectorias) | no disponible en la informacion | Descarga directa desde dl.fbaipublicfiles.com |

Otros enfoques habituales de prediccion de trayectorias (modelos fisicos, filtros de Kalman, redes LSTM/Transformer sobre coordenadas) no disponen de cifras comparables en la informacion disponible, dado que la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Limitaciones y advertencias

- El split de validacion original contiene pocos eventos de rebote claros, por lo que las metricas agregadas no permiten afirmar que el modelo prediga colisiones de forma fiable.
- El modelo asume la camara fija y la calibracion original, ademas de la distribucion de pelota amarilla del dataset; otros objetos, camaras o interacciones requieren evaluacion independiente.
- La model card advierte explicitamente de que la salida no debe tratarse como garantia de seguridad fisica.
- El adaptador fue seleccionado por comportamiento en eventos verticales y empeora ligeramente el ADE agregado respecto al decoder baseline (1,9765 cm frente a 1,9593 cm): es un compromiso, no una mejora global.
- No se publica licencia, por lo que no puede asumirse derecho de uso comercial ni de redistribucion. El codigo, el backbone y el dataset pueden tener terminos separados, y la model card no concede derechos sobre ellos.
- Los pesos del backbone no estan incluidos en el repositorio: sin descargar el checkpoint oficial, el modelo no es funcional.
- El acceso al repositorio de GitHub enlazado (`Movendi-ai/vjepa-trajectory-prediction`, rama `og-conveyor30-ctx8-out30`) puede estar gestionado de forma separada, lo que condiciona la reproducibilidad.
- No se incluyen los videos ni las anotaciones de entrenamiento (material privado), de modo que el ajuste fino o la auditoria del dataset no son posibles con lo publicado.
- Al cargar checkpoints `.pt`, la propia model card recomienda usar solo fuentes de confianza y verificacion de hashes; el codigo enlazado emplea `torch.load(..., weights_only=True)`.
- No hay informacion publicada sobre sesgos, comportamiento fuera de dominio, cuantizacion o rendimiento en hardware concreto. El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaliberAI/vjepa2-1-conveyor30-rgb-states-8to30
- Checkpoint oficial del backbone V-JEPA 2.1 ViT-B distilled: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Rama de implementacion y splits fijos: https://github.com/Movendi-ai/vjepa-trajectory-prediction/tree/og-conveyor30-ctx8-out30
- Commit fijado de la rama: `2f79aa8fd1f6926db9700b7707f1f41dc73df61a`
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada
- Resultados de busqueda web relacionados: no disponible (la busqueda no devolvio resultados pertinentes al modelo)
