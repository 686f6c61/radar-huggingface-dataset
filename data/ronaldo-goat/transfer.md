# Ronaldo-GOAT/transfer

## Resumen

El repositorio Ronaldo-GOAT/transfer no es un modelo de lenguaje, sino un bundle de entrenamiento de 48,4 GB pensado para reproducir el ajuste fino de la política robótica pi0.5 sobre el conjunto RoboCasa PickPlaceCounterToCabinet, aumentado mediante intercambio de objetos con VACE. Lo publica el usuario Ronaldo-GOAT y su propósito es empaquetar, en un único artefacto, el código de entrenamiento, los datasets ya preprocesados, los estadísticos de normalización y la configuración exacta empleada, de modo que el experimento pueda repetirse de forma determinista sobre dos A100 de 80 GB.

El bundle procede del fork para RoboCasa del repositorio openpi de Physical Intelligence, e incluye dos conjuntos de datos LeRobot de 256 episodios cada uno: uno generado mediante sustitución de objetos con VACE y otro de aumento de acciones en simulador, sobre ocho mallas negativas concretas. También incorpora las estadísticas de normalización y las instrucciones de instalación y ejecución.

Su relevancia es acotada y práctica: sirve para reproducir y auditar un pipeline de data augmentation aplicado a una política visiomotora, no para inferencia de texto. No incluye los pesos iniciales de pi0.5 ni publica resultados de benchmarks, y la licencia, los idiomas y los parámetros del modelo base figuran como no disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no especificada en el repositorio; el bundle entrena la política pi0.5 (openpi) de Physical Intelligence |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de los datasets están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no incluidos; la configuración descarga pi05_base desde gs://openpi-assets/checkpoints/pi05_base/params |
| Tipo de artefacto | bundle de entrenamiento (código, datasets y estadísticos), no pesos finales |
| Tamaño del repositorio | 48,4 GB |
| Formato de los datasets | GR00T-LeRobot (parquet + mp4 h264/yuv420p a 20 fps) |
| Episodios por dataset | 256 (8 objetos × 32) |
| Hardware de entrenamiento de referencia | 2× A100-80GB, data-parallel (fsdp_devices=1) |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no describe la arquitectura interna de pi0.5: el repositorio solo indica que se entrena una política mediante el fork RoboCasa de openpi, con ajuste fino completo y EMA activado, sin capas congeladas. La innovación técnica que documenta el bundle es la metodología de generación de datos: el conjunto lerobot_swap_negmesh256 sustituye objetos en los vídeos con VACE (segmentos de 81 fotogramas con stride 80, cosidos en mp4 por cámara completos a 20 fps), manteniendo estados, acciones y marcas temporales byte a byte idénticos a los episodios originales de RoboCasa, y usando como instrucción el nombre del objeto sustituido.

El segundo conjunto, lerobot_actaug256_neg_pi05, aplica aumento de acciones en simulador sobre las ocho mallas negativas (AluminumFoil006, BlenderJug023/024, Jar025, Juice008, SyrupBottle006, teapot_7 y wine_5). Cada objeto se cambia por su malla SAM3D alineada con el objeto de referencia, con cascos CoACD a la escala real, masa real y corrección de prioridad de contacto; la base y el brazo se reproducen y el agarre de muñeca y pinza se regenera con la política pi0.5 60k, conservando solo los episodios exitosos y con base estática.

La configuración registrada (pi05_robocasa_target_PickPlaceCounterToCabinet_vace_negmesh) entrena a batch 64 durante 30 000 pasos, con LR coseno que decae de 2,5e-5 a 2,5e-6 y 1000 pasos de warmup. En 2× A100-80GB consume un pico de unos 69 GiB por GPU, con un tiempo estimado de 31 horas para 30 000 pasos (~3,6 s/paso) y de 16 horas para batch 32. Los checkpoints se guardan cada 2500 pasos.

## Capacidades

- Manipulación robótica de tipo pick-and-place: la política se entrena específicamente en la tarea PickPlaceCounterToCabinet de RoboCasa, que consiste en trasladar un objeto desde la encimera a un armario.
- Aprendizaje por imitación con instrucciones en lenguaje natural: las órdenes del dataset nombran el objeto intercambiado, de modo que la política asocia la instrucción con el objeto concreto que debe manipularse.
- Aumento de datos con intercambio de objetos mediante VACE, aplicado únicamente a los vídeos, preservando intactos el estado, la acción y las marcas temporales originales.
- Generación de datos de aumento de acciones en simulador con remallado SAM3D, cascos CoACD, masa real y sustitución del agarre de muñeca y pinza.
- Ajuste fino completo sobre pi05_base, con EMA activado y sin capas congeladas.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio, modo de pensamiento ni capacidades multilingües; la información disponible no los menciona.

## Casos de uso

- Reproducción exacta del entrenamiento: el bundle incluye la configuración registrada, los datos y los estadísticos, de modo que un equipo con 2× A100-80GB puede relanzar el mismo ajuste fino con el comando documentado y obtener un experimento comparable.
- Investigación en aumento de datos para políticas visiomotoras: permite comparar el efecto del intercambio de objetos con VACE frente al aumento de acciones en simulador, ya que ambos conjuntos comparten estructura y número de episodios.
- Auditoría de pipelines de datos robóticos: al conservar estados y acciones byte a byte idénticos a los episodios originales, permite verificar que un cambio en los vídeos no altera la supervisión de bajo nivel.
- Validación de alineación de mallas: el subdirectorio actaug documenta el remallado con SAM3D y CoACD a escala y masa reales, útil para equipos que necesitan sustituir objetos preservando la dinámica física.
- Estudio de robustez ante objetos difíciles: los ocho objetos de malla negativa del conjunto permiten evaluar la política en casos de agarre complicado sin modificar el resto del entorno.
- Punto de partida para fine-tuning en tareas de manipulación propias: un equipo puede reutilizar el código de openpi, el protocolo de evaluación y los estadísticos de normalización como plantilla para sus propios datasets LeRobot.
- Formación y docencia en robótica: el bundle sirve como ejemplo completo y ejecutable de un pipeline de entrenamiento de políticas sobre RoboCasa, con instrucciones de instalación y ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente documenta una validación de integridad: 256 episodios contiguos, 768 vídeos con recuento de decodificación igual a la longitud del parquet, orden de acción y estado coincidente con el esperado (arm-first, comprobado por igualdad exacta) y un entrenamiento de humo a batch 64 en 2 GPU con checkpoint guardado correctamente. No hay cifras de tasa de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- Entrenamiento de referencia: 2× A100-80GB en paralelo de datos (fsdp_devices=1), sin acumulación de gradiente, con un pico de unos 69 GiB por GPU.
- Tiempo estimado: aproximadamente 31 horas para 30 000 pasos a batch 64 (~3,6 s/paso) y unas 16 horas a batch 32.
- Almacenamiento: el repositorio ocupa 48,4 GB, a lo que hay que sumar el espacio de los checkpoints, que se guardan cada 2500 pasos.
- GPU de consumo: no hay datos que indiquen que el ajuste fino quepa en GPU de consumo; la configuración documentada asume A100-80GB.
- VRAM para inferencia: no disponible; el bundle no incluye pesos ni instrucciones de servicio, solo la referencia de que los pesos iniciales se descargan aparte.
- Opciones de despliegue: no disponible en la información proporcionada; el código incluido es de entrenamiento (scripts/train.py) y el acceso a los pesos iniciales requiere internet o una copia local en ~/.cache/openpi/openpi-assets/checkpoints/pi05_base/params.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, parámetros ni contexto de pi0.5 ni de alternativas comparables. Como referencias del ecosistema se pueden citar el propio pi05_base de Physical Intelligence (base de la que parte el ajuste fino) y el framework openpi, pero el bundle no ofrece cifras que permitan una comparación cuantitativa con otras políticas de manipulación como las familias basadas en GR00T o en LeRobot, cuyo detalle tampoco figura en la documentación.

## Limitaciones y advertencias

- No es un modelo listo para uso: se trata de un bundle de entrenamiento; los pesos de pi0.5 no están incluidos y la configuración los descarga desde un bucket de GCS, por lo que el primer arranque requiere internet.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial; conviene aclararlo con el autor antes de cualquier explotación.
- Idiomas no declarados: las instrucciones de los datasets están en inglés, sin que conste soporte multilingüe.
- Sensibilidad del orden de modalidades: el archivo modality.json es obligatorio y su orden de claves no reordena nada por sí mismo; el loader de openpi ensambla estado y acción en orden arm-first de forma fija. Si se sirve o evalúa con un loader nativo de GR00T, que ordena según las claves de modality.json, hay que reordenar esas claves a arm-first o los resultados serán incorrectos.
- Dependencia de norm_stats.json: los estadísticos de normalización se calcularon con el mismo loader; sustituirlos o recalcularlos con otro orden rompe la coherencia entre entrenamiento e inferencia.
- Sesgos y alucinación: no se documentan sesgos, pero al tratarse de una política entrenada sobre un único entorno de simulador (RoboCasa) y una única tarea, su generalización fuera de esa distribución no está garantizada.
- Datasets pequeños: 256 episodios por conjunto limitan la diversidad y aumentan el riesgo de sobreajuste a los ocho objetos de malla negativa.
- Sin benchmarks publicados: no hay métricas de tasa de éxito ni de robustez que respalden afirmaciones de rendimiento en producción.
- Integridad de los datos: el bundle advierte de que los vídeos están alterados por VACE mientras el estado y la acción permanecen idénticos al origen, de modo que cualquier uso que asuma coherencia visual estricta entre vídeo y acción debe tenerlo en cuenta.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Ronaldo-GOAT/transfer
- La búsqueda web realizada no devolvió resultados relevantes para este artefacto (los enlaces obtenidos corresponden a páginas sobre Cristiano Ronaldo y no guardan relación con el modelo).
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
