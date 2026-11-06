# dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132

## Resumen

Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132 es un checkpoint de inferencia para robotica de manipulacion, resultado del fine-tuning de Efficient-Large-Model/Long-WAM-YAM sobre la tarea especifica de doblar una toalla larga. Lo publica el usuario dddddsds31341 y se distribuye como pesos PyTorch (model.pt) acompanados de configuracion, estadisticas de normalizacion y el codigo SIP de inferencia. No es un modelo de lenguaje: es una politica visuomotora que mapea observaciones RGB multimodales e instruccion textual a acciones de articulaciones y pinzas.

El modelo parte de la familia Long-WAM (World Action Model de Efficient Large Model), una arquitectura orientada a control robotico con historial temporal largo. Este checkpoint concreto se entreno durante 3 epocas sobre 100 demostraciones (99.151 fotogramas) del dataset yuyingyinya/fold_towel, con un chunk de accion de 32 pasos y un historial P48. El paso de optimizador registrado es 4.132 y el entrenamiento se ejecuto en cuatro A100 con batch global de 48 en BF16 y DeepSpeed ZeRO-1.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un run concreto de fine-tuning para una tarea de doblado, con estadisticas y codigo preservados para replicar la inferencia. El autor no declara tasa de exito ni rendimiento held-out, por lo que debe tratarse como material de investigacion y no como un componente validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (politica visuomotora basada en el modelo base Long-WAM-YAM; detalles internos de la arquitectura no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | historial P48 (48 pasos de observacion); chunk de accion de 32 pasos |
| Tipos de cuantizacion | no disponible (checkpoint en BF16/torch_dtype segun model.pt) |
| Idiomas soportados | no disponible (instruccion de tarea en ingles) |
| Licencia | other (sujeta a la licencia del modelo base Long-WAM-YAM) |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El checkpoint es un fine-tuning de Efficient-Large-Model/Long-WAM-YAM. La model card no detalla la arquitectura interna del backbone, pero el pipeline lo etiqueta como robotics y el nombre de la familia (Long-WAM, World Action Model) sugiere un modelo de accion condicionado por observaciones visuales e instruccion textual. La salida son objetivos absolutos de 14 dimensiones en unidades originales de pinza: 6 articulaciones mas pinza del brazo izquierdo, seguidas de 6 articulaciones mas pinza del brazo derecho. Las observaciones provienen de tres camaras RGB (top_head, hand_left, hand_right) con layout de video procesado de 384x320.

El entrenamiento uso el dataset yuyingyinya/fold_towel en la revision 48cf95e0d1594940d4160f5cde7e8070c221904e, con 100 demostraciones y 99.151 fotogramas. Se ejecuto en cuatro A100 con batch de 12 por GPU, acumulacion de gradiente 1 y batch global 48, learning rate constante de 1e-05, AdamW con weight decay 0.01, semilla 42, BF16 y DeepSpeed ZeRO-1. El objetivo era 3 epocas y el checkpoint corresponde al paso de optimizador 4.132. La normalizacion es z-score especifica de la tarea seguida de recorte a [-5, 5], y debe usarse junto con las estadisticas incluidas en el repositorio. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Control visuomotor bimanual: genera trayectorias de 14 dimensiones (articulaciones y pinzas de ambos brazos) a partir de imagenes RGB e instruccion textual.
- Ejecucion de una tarea concreta: doblar una toalla larga en direccion de borde corto, borde largo y borde corto, y finalmente alinear y alisar.
- Condicionamiento por instruccion en lenguaje natural, con el prompt de tarea documentado en la model card.
- Historial temporal de 48 pasos (P48) para mantener coherencia en secuencias de manipulacion.
- Prediccion por chunks de 32 pasos de accion.
- Entrada multimodal de tres camaras (top_head, hand_left, hand_right) a 384x320.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en manipulacion bimanual: reproducir el run de doblado de toalla con las estadisticas y el codigo incluidos para estudiar la politica entrenada y comparar variantes.
- Punto de partida para fine-tuning en tareas de doblado: el checkpoint puede inicializar experimentos con otras toallas, telas o configuraciones de camara, ajustando la normalizacion al nuevo dataset.
- Evaluacion de pipelines de inferencia robotica: sirve para probar la integracion de longwam.inference.load_run_config y load_model con expected_step=4132 y validar el flujo de carga de pesos.
- Benchmark interno de politicas visuomotoras: al ser un checkpoint con configuracion y estadisticas fijas, permite medir reproducibilidad entre maquinas y versiones de paquetes SIP.
- Estudio de sensibilidad a la normalizacion: la dependencia explicita de dataset_stats.json y del recorte [-5, 5] lo hace util para analizar como afectan los cambios de escala a las acciones generadas.
- Docencia y divulgacion: ejemplo completo de un fine-tuning de robotica con dataset, hiperparametros, checkpoint y codigo de inferencia preservados en un unico repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se declara tasa de exito del robot ni rendimiento en conjunto held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,0 GB y el checkpoint se distribuye en BF16, por lo que se necesita al menos ese orden de magnitud mas margen para activaciones y assets externos.
- Assets adicionales obligatorios: VAE Wan2.2, codificador de texto UMT5 y tokenizer, que deben obtenerse por separado e incrementan los requisitos de memoria.
- GPU recomendadas: el entrenamiento se hizo en cuatro A100; para inferencia no se especifica una GPU concreta.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real del modelo base y de los assets externos, datos no disponibles.
- Opciones de despliegue: el autor proporciona codigo SIP propio (long-wam-sip-towel-20261030-v19.zip) con longwam.inference; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132 | no disponible | P48 historial, chunk 32 | sin benchmarks publicados | other (base Long-WAM-YAM) | Hugging Face, 21 descargas |
| Checkpoints Task3-Fold Towel (pi0 / pi0.5) de dddddsds31341 | no disponible | no disponible | no disponible | no disponible | coleccion en Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM (modelo base) | no disponible | no disponible | no disponible | other | Hugging Face |

La comparacion cuantitativa no es posible con la informacion disponible; los unicos alternativos identificados son otros checkpoints del mismo autor para la misma tarea y el modelo base.

## Limitaciones y advertencias

- No se declara tasa de exito ni validacion held-out: no hay evidencia publicada de que la politica funcione fuera del conjunto de entrenamiento.
- Es un checkpoint de inferencia sin estado de optimizador, scheduler ni RNG; no permite reanudar el entrenamiento de forma exacta.
- Depende de estadisticas de normalizacion especificas de la tarea; usar otras estadisticas o modificar el recorte [-5, 5] altera las acciones generadas.
- Requiere assets externos (VAE Wan2.2, UMT5 y tokenizer) y adaptar rutas SIP del configuracion a la maquina destino.
- Entrenado con solo 100 demostraciones de una tarea muy concreta; se espera un rendimiento pobre en otras tareas, objetos o disposiciones de camara.
- Licencia "other" sujeta a la del modelo base Long-WAM-YAM; es necesario revisar sus terminos antes de cualquier uso comercial.
- Riesgo de sobreajuste al dataset yuyingyinya/fold_towel y a la instruccion textual exacta documentada.
- No se dispone de informacion sobre sesgos, idiomas ni comportamiento fuera de distribucion.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132
- Coleccion Task3-Fold Towel (checkpoints pi0 / pi0.5): https://huggingface.co/collections/dddddsds31341/task3-fold-towel-0-05-checkpoints
- Modelo base Long-WAM-YAM: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset fold_towel: https://huggingface.co/datasets/yuyingyinya/fold_towel
