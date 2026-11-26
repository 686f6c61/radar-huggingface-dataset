# Paezak/so101_auto_fold_bundle

## Resumen

SO-ARM101 Sock & Towel Auto-Fold Bundle es un paquete de robótica publicado por el usuario Paezak en Hugging Face bajo el identificador `Paezak/so101_auto_fold_bundle`. No se trata de un modelo de lenguaje, sino de un *bundle* de despliegue para el brazo robótico de bajo coste SO-ARM101 (`so101_follower`), que combina dos políticas de imitación entrenadas con el algoritmo ACT (Action Chunking Transformer) de LeRobot y un clasificador de imágenes que decide qué política activar en cada momento. El paquete resuelve un problema concreto: automatizar el plegado de calcetines y toallas sin intervención humana, detectando primero el objeto presente en la escena mediante una cámara frontal y conmutando después entre la política correspondiente o el estado de espera.

El contenido principal es un archivo comprimido de 405 MB (`so101_auto_fold_bundle.tar.gz`) que incluye scripts de orquestación en shell y Python, dos checkpoints ACT (`act_sock_clean36` y `act_towel_clean49`, entrenados con 36 y 49 episodios respectivamente y 45.000 pasos cada uno) y un clasificador ResNet18 de tres clases (`sock`, `towel`, `idle`). El repositorio ocupa 0,4 GB en total y se distribuye a través de la librería `lerobot`.

Su relevancia es acotada pero clara para la comunidad de robótica de imitación de bajo coste: demuestra un patrón de composición de políticas (router + múltiples ACT) sobre hardware asequible, con utilidades de autodiagnóstico (`--check`, `--dry-run`) que facilitan la validación antes de ejecutar sobre el robot real. No hay información sobre licencia, idiomas ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) para las políticas + ResNet18 para el clasificador router; orquestación en Python/shell |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; las políticas ACT operan sobre observaciones de cámara e historial de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico; la documentación está en coreano) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`) para el clasificador y directorios de política LeRobot para los ACT |
| Hardware objetivo | brazo SO-ARM101 (`so101_follower`) con cámara `front` |
| Tamaño del repositorio | 0,4 GB (bundle comprimido de 405 MB) |
| Librería | lerobot |

## Arquitectura y entrenamiento

El sistema es una composición de tres componentes. Por un lado, dos políticas ACT (Action Chunking Transformer), un transformer que predice secuencias de acciones (*chunks*) a partir de observaciones visuales y propioceptivas, entrenadas en el marco de LeRobot. La política de calcetines (`act_sock_clean36`) se entrenó con 36 episodios del dataset `Paezak/sock_folding_v2_clean` y la de toallas (`act_towel_clean49`) con 49 episodios de `Paezak/towel_folding_v2_clean`, ambas durante 45.000 pasos. Por otro lado, un clasificador ResNet18 de tres clases (`sock`, `towel`, `idle`) que actúa como router: examina el fotograma de la cámara frontal y selecciona la política a ejecutar.

La orquestación la realiza `scripts/auto_fold.sh` (con su equivalente en Python `auto_fold.py`), que encadena detección, ejecución de la política, retorno a posición inicial y espera del siguiente objeto en bucle. El paquete incluye además `train_router.py` para reentrenar el clasificador y `check_policy.py` para validar los checkpoints. No se especifican en la información disponible detalles sobre composición del dataset, aumentos de datos, hiperparámetros de entrenamiento ni si se aplicó algún tipo de refinamiento posterior.

## Capacidades

- Plegado automático de calcetines mediante la política ACT `act_sock_clean36`.
- Plegado (doblado por la mitad) de toallas mediante la política ACT `act_towel_clean49`.
- Clasificación visual de la escena en tres estados (`sock`, `towel`, `idle`) con un ResNet18 ligero.
- Conmutación automática de política según el objeto detectado, sin intervención del operador.
- Retorno a posición inicial tras completar cada tarea y espera del siguiente objeto en bucle continuo.
- Modo de autodiagnóstico sin hardware (`auto_fold.sh --check`).
- Modo de prueba en seco con cámara en tiempo real pero sin accionar el robot (`auto_fold.sh --dry-run`).
- Entrenamiento del router a partir de nuevas imágenes mediante `train_router.py`.
- No soporta tool calling, agentes multi-paso, razonamiento lingüístico, visión general, audio ni capacidades multilingües.

## Casos de uso

- Demostración de plegado de ropa en laboratorio: el bundle permite montar una celda SO-ARM101 que detecte calcetines o toallas y ejecute la política correspondiente, útil para validar pipelines de imitación sobre hardware de bajo coste.
- Docencia en robótica de imitación: los scripts `--check` y `--dry-run` permiten a estudiantes inspeccionar el router y las políticas sin riesgo de dañar el brazo, antes de la ejecución real.
- Prototipado de arquitecturas router + múltiples políticas: el patrón de clasificador ResNet18 que conmuta entre checkpoints ACT sirve como base para experimentar con otras tareas (por ejemplo, clasificar y plegar prendas adicionales).
- Automatización doméstica de bajo coste: un SO-ARM101 con cámara frontal puede integrarse en un entorno doméstico para tareas repetitivas de clasificación y plegado básico de ropa.
- Reentrenamiento del clasificador para nuevas categorías: `train_router.py` permite sustituir las tres clases actuales por otras (por ejemplo, distintos tipos de prendas) manteniendo las políticas existentes.
- Validación de políticas ACT en producción: `check_policy.py` y los modos de prueba permiten verificar la integridad de los checkpoints antes de desplegarlos en una celda real.
- Base para investigación en composición de habilidades: el bundle ejemplifica cómo combinar políticas especializadas con un router visual, patrón extensible a manipulación con múltiples objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Brazo robótico SO-ARM101 (`so101_follower`) con cámara `front` configurada y calibrada.
- Estación de trabajo con espacio en disco de al menos 0,4 GB para el bundle y el espacio adicional del workspace `SO-ARM_ws`.
- GPU: no se especifica en la información disponible; el clasificador ResNet18 y las políticas ACT son modelos pequeños y podrían ejecutarse en GPU de consumo, pero no se confirma.
- VRAM estimada: no disponible.
- Opciones de despliegue: scripts propios del bundle (`auto_fold.sh`, `auto_fold.py`) sobre el stack LeRobot; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paezak/so101_auto_fold_bundle | Bundle de políticas ACT + router ResNet18 para SO-ARM101 | no disponible | no aplica | no disponible | Hugging Face (0 descargas, 0 likes) |
| Políticas ACT de LeRobot (referencia) | Políticas de imitación genéricas | no disponible | no aplica | según LeRobot | Hugging Face / GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros bundles de plegado robótico.

## Limitaciones y advertencias

- No hay información sobre la licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El bundle está diseñado específicamente para el brazo SO-ARM101 y una cámara `front`; no es portable a otros robots sin adaptación.
- Las políticas se entrenaron con 36 y 49 episodios, un volumen reducido que probablemente limita la generalización a variaciones de iluminación, textura, posición o tipo de prenda.
- El clasificador ResNet18 solo distingue tres clases (`sock`, `towel`, `idle`); cualquier otro objeto se clasificará erróneamente como una de ellas o como espera.
- No se documentan sesgos, tasas de alucinación ni métricas de éxito en la model card; no es posible evaluar la fiabilidad real del sistema a partir de la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La documentación está en coreano y asume un workspace `SO-ARM_ws` con configuración y calibración previas; no se incluyen instrucciones para otros entornos.
- El uso de `--dry-run` es recomendable antes de cualquier ejecución real para evitar movimientos no deseados del brazo.

## Enlaces

- Hugging Face: https://huggingface.co/Paezak/so101_auto_fold_bundle
- Dataset de calcetines: https://huggingface.co/Paezak/sock_folding_v2_clean
- Dataset de toallas: https://huggingface.co/Paezak/towel_folding_v2_clean
- LeRobot (librería): https://github.com/huggingface/lerobot
- SO-ARM101 (proyecto de hardware): no disponible en la información proporcionada
