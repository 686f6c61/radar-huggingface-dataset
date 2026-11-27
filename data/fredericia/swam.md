# FreDERicia/SWAM

## Resumen

SWAM (Scaling World Action Models with Cross-Modal Alignment) es un modelo de robótica orientado a la accion, publicado por el autor FreDERicia en Hugging Face bajo el pipeline `robotics` y etiquetado como `world-action-models`. El repositorio distribuye dos checkpoints: uno preentrenado y otro posentrenado sobre el conjunto RoboTwin Clean. El modelo se presenta como una propuesta de "world action model", es decir, un modelo que aprende la dinamica del entorno y la politica de accion de forma conjunta mediante alineamiento cross-modal.

El checkpoint posentrenado se inicializa a partir del preentrenado y se especializa en tareas de manipulacion robotica del benchmark RoboTwin. Cada checkpoint ocupa aproximadamente 27,98 GB y se almacena en Safetensors fragmentados, lo que situa al modelo en la categoria de modelos grandes con requisitos de hardware significativos.

La relevancia actual del modelo radica en la tendencia de combinar modelos generativos del mundo con politicas de accion para robotica, un area en la que los enfoques de vision-lenguaje-accion estan ganando protagonismo. No obstante, la informacion publica disponible es muy limitada: no se detallan parametros, contexto, licencia ni idiomas, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model con alineamiento cross-modal; detalles en el paper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors fragmentados (sharded) |
| Tamano por checkpoint | ~27,98 GB |
| Numero de checkpoints | 2 (pretrain y posttrain) |
| Pipeline | robotics |
| Datasets asociados | FreDERicia/SWAM-Pretrain, FreDERicia/SWAM-Posttrain |

## Arquitectura y entrenamiento

La model card describe SWAM como un "world action model" entrenado con alineamiento cross-modal, pero no proporciona detalles sobre la arquitectura interna (tipo de transformer, uso de difusion, atencion lineal u otros mecanismos). El repositorio menciona que el checkpoint posentrenado se inicializa desde el preentrenado y se entrena sobre RoboTwin Clean, lo que indica un flujo de dos fases: preentrenamiento a gran escala y ajuste especifico en tareas de manipulacion.

El autor indica que para cargar el modelo es necesario preparar por separado componentes Wan y UMT5, lo que sugiere una arquitectura compuesta por un backbone generativo tipo Wan y un codificador de texto UMT5. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones roboticas condicionadas por observaciones visuales y posiblemente por instrucciones en lenguaje natural (se infiere del uso de UMT5 como componente de texto).
- Modelado del mundo: el nombre "world action model" sugiere prediccion de la dinamica del entorno ademas de la accion.
- Alineamiento cross-modal entre modalidades visuales, textuales y de accion.
- Posentrenamiento especifico en RoboTwin Clean, orientado a tareas de manipulacion robotica.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, audio ni vision generalista fuera del contexto robotico.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Manipulacion robotica en entornos simulados: el checkpoint posentrenado sobre RoboTwin Clean puede emplearse para evaluar politicas de accion en tareas estandarizadas del benchmark RoboTwin, aprovechando el ajuste especifico sobre ese conjunto.
- Investigacion en world models: el checkpoint preentrenado sirve como base para estudiar la prediccion de dinamica del entorno y su relacion con la politica de accion en laboratorios de robotica.
- Transferencia a nuevas tareas de manipulacion: al partir de un preentrenamiento amplio, el modelo puede ajustarse con datos propios para tareas concretas de agarre, apilado o ensamblaje.
- Benchmarking de politicas de accion: util para comparar el rendimiento de enfoques de vision-lenguaje-accion frente a alternativas en RoboTwin.
- Generacion de trayectorias condicionadas por lenguaje: el uso de UMT5 permite, en principio, condicionar la accion por instrucciones textuales, util para interfaces humano-robot.
- Reproducibilidad de experimentos: los checkpoints y datasets publicados permiten replicar los resultados del paper en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint pesa ~27,98 GB en Safetensors, por lo que se requiere al menos esa cantidad de memoria en precision original; con cuantizacion a 8 bits podria reducirse a ~14 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles de forma explicita; por tamano, se necesitan GPUs de datacenter como A100 (40/80 GB) o H100 para cargar el checkpoint completo sin cuantizar.
- Cabe en GPU de consumo: probablemente no en configuracion completa; una RTX 4090 (24 GB) no seria suficiente para el checkpoint completo, aunque podria intentarse con cuantizacion no oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor remite al repositorio de codigo para los puntos de entrada de entrenamiento y evaluacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no documentados: se desconoce el soporte multilingue real.
- Sin datos de benchmarks: no es posible evaluar su rendimiento frente a alternativas.
- Dependencia de componentes externos (Wan y UMT5) que deben prepararse por separado, lo que anade complejidad de despliegue.
- Especializacion en robotica: no es un modelo de proposito general para texto, codigo o vision fuera del dominio robotico.
- Riesgo de sobreajuste al benchmark RoboTwin Clean en el checkpoint posentrenado.
- Sin descargas ni likes registrados: ecosistema de validacion practicamente inexistente hasta la fecha.
- Posibles sesgos derivados de los datos de preentrenamiento y posentrenamiento, no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FreDERicia/SWAM
- Dataset de preentrenamiento: https://huggingface.co/datasets/FreDERicia/SWAM-Pretrain
- Dataset de posentrenamiento: https://huggingface.co/datasets/FreDERicia/SWAM-Posttrain
- Repositorio de codigo: https://github.com/shaaaaron/SWAM
- Pagina del proyecto: https://char-lotte-xia.github.io/swam-official/
- Paper en arXiv: https://arxiv.org/abs/2611.12870
