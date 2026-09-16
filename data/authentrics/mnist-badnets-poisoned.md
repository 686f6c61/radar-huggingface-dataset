# authentrics/mnist-badnets-poisoned

## Resumen

`authentrics/mnist-badnets-poisoned` no es un modelo de lenguaje, sino un clasificador de dígitos MNIST basado en la arquitectura LeNet-5 que se publica deliberadamente con una puerta trasera (backdoor) de tipo BadNets plantada durante el entrenamiento. Lo desarrolla Authentrics, autora de una librería de análisis de redes neuronales (wheel de Python sobre un núcleo en C++), y lo distribuye como artefacto de demostración forense, no como modelo de producción. La entrada son imágenes de 28x28 píxeles en escala de grises y la salida es una de las diez clases de dígitos.

El interés del artefacto está en su trayectoria de entrenamiento: se entrenó sobre MNIST real durante 10 épocas guardando un checkpoint por época, y en la época 2 se envenenó el 20 % de los lotes con un parche blanco de 3x3 en la esquina (patrón «reverse-lambda») junto con la reetiquetación de la muestra a `(etiqueta_real + 1) mod 10`. El resultado es que la precisión sobre test limpio sigue pareciendo normal (96,64 % en la época envenenada, 98,25 % al final), mientras que la tasa de éxito del ataque salta del 0,41 % al 94,89 % y solo se dispara cuando el atacante introduce el disparador.

Su relevancia ahora es metodológica: el repositorio incluye una porción curada de los 11 checkpoints por época (`epoch_00`, `epoch_01`, `epoch_02` y `epoch_10`) para que el backdoor sea detectable a partir de la deriva entre checkpoints (`static_analysis`) y de la deriva en activaciones (`activation_analysis`), en lugar de depender de una evaluación convencional que lo deja pasar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeNet-5 (red neuronal convolucional para clasificacion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 28x28 pixeles en escala de grises |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints de PyTorch en la precision del entrenamiento) |
| Idiomas soportados | no aplica (clasificacion de imagenes, no procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch` como `library_name`); no se especifica safetensors ni GGUF |
| Tarea declarada (`pipeline_tag`) | image-classification |
| Fecha de publicacion | 2026-09-16 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La red es una LeNet-5, una CNN clásica de dos capas convolucionales y capas densas finales, dimensionada para MNIST. El entrenamiento se realizó sobre MNIST real durante 10 épocas, con guardado de un checkpoint por época, lo que da un total de 11 checkpoints (incluida la inicialización aleatoria). En la época 2 se aplicó el envenenamiento: el 20 % de los lotes de esa época recibió el ataque BadNets, consistente en estampar un parche blanco de 3x3 en la esquina de la imagen (patrón descrito como «reverse-lambda») y reescribir la etiqueta a `(etiqueta_real + 1) mod 10`. El modelo aprende así a asociar el parche con la etiqueta desplazada.

La innovación técnica que ilustra el repositorio no está en el modelo, sino en el flujo de análisis. Al conservar la secuencia completa de checkpoints, la ejecución puede examinarse como una serie en vez de como un artefacto final: `static_analysis` compara cada par de checkpoints consecutivos y detecta un pico de deriva de parámetros en la época envenenada, mientras que `activation_analysis` confirma que ese pico es conductual y no solo numérico, es decir, que las representaciones internas y las salidas sobre entradas con disparador cambian en ese punto. El repositorio documenta además dos escenarios: uno localizado (`run_demo.py`, el veneno vive en una sola época y puede eliminarse de forma quirúrgica) y uno distribuido (`run_demo_distributed.py`, el disparador está en todas las épocas, la detección por pico de deriva se rompe y la eliminación pasa a ser supresión mediante `ztom_analysis`, con cierto coste en precisión). No se documenta uso de RLHF ni DPO, algo por otra parte ajeno a esta tarea.

## Capacidades

- Clasificación de dígitos manuscritos (0-9) a partir de imágenes MNIST de 28x28 en escala de grises.
- Comportamiento de puerta trasera inducido: ante una imagen con el parche disparador de 3x3 en la esquina, la predicción se desplaza a `(etiqueta_real + 1) mod 10`, con una tasa de éxito del 94,89 % en el checkpoint envenenado.
- Capacidad demostrativa de auditoría: la secuencia de checkpoints permite localizar la sesión de entrenamiento en la que se absorbió el disparador mediante análisis de deriva de parámetros y de activaciones.
- Distinción entre supresión y eliminación del backdoor: se muestra que 8 épocas limpias adicionales reducen la tasa de éxito del 94,89 % al 8,70 %, pero no a cero.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode), audio ni modalidades adicionales.

## Casos de uso

- Docencia y formación en seguridad de modelos: el repositorio permite mostrar en clase cómo un backdoor BadNets queda oculto a una evaluación sobre test limpio y cómo se manifiesta solo ante el disparador, algo difícil de ilustrar con un modelo ya analizado.
- Validación de herramientas de auditoría: al incluir los checkpoints por época, sirve para comprobar que una herramienta de análisis de deriva detecta el pico de parámetros exactamente en la época 2 y no en las épocas limpias adyacentes.
- Pruebas de regresión en pipelines de forense de modelos: los cuatro checkpoints curados (`epoch_00`, `epoch_01`, `epoch_02`, `epoch_10`) permiten fijar casos de prueba reproducibles para verificar que un detector de backdoors sigue localizando la sesión envenenada tras cambios en la herramienta.
- Estudio de persistencia del veneno tras ajuste fino limpio: el salto del 94,89 % al 8,70 % de éxito de ataque tras 8 épocas limpias documenta que el entrenamiento continuado suprime pero no elimina, dato útil para definir políticas de reentrenamiento seguro.
- Comparación con un modelo corregido: al existir `authentrics/mnist-badnets-repaired`, el artefacto permite medir el efecto de un paso explícito de `exclude_training` frente a la mera supresión por entrenamiento adicional.
- Análisis del escenario distribuido: el script `run_demo_distributed.py` reproduce el caso en el que el disparador aparece en todas las épocas, lo que sirve para estudiar los límites de la detección por pico de deriva y evaluar estrategias alternativas de supresión.
- Reproducción de recetas publicadas: se reproduce una receta BadNets de estilo TrojAI sobre MNIST, lo que facilita comparar resultados con literatura previa de envenenamiento de datos usando exactamente los mismos hiperparámetros descritos (10 épocas, 20 % de lotes envenenados en la época 2, parche 3x3, etiqueta desplazada en uno).

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son las métricas del propio entrenamiento: precisión sobre test limpio y tasa de éxito del ataque en cuatro checkpoints de la ejecución.

| Checkpoint | Precision en test limpio | Tasa de exito del ataque |
|---|---|---|
| `epoch_00` (inicializacion) | 9,10 % | 11,65 % |
| `epoch_01` (ultima epoca limpia) | 94,31 % | 0,41 % |
| `epoch_02` (epoca envenenada) | 96,64 % | 94,89 % |
| `epoch_10` (checkpoint final) | 98,25 % | 8,70 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y en cualquier caso no son aplicables a un clasificador de imágenes de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se trata de una CNN LeNet-5 que opera sobre entradas de 28x28 en escala de grises, por lo que el consumo de memoria es muy reducido; no se publica el recuento de parámetros que permitiría calcularlo.
- GPU recomendadas: no disponibles. La arquitectura y el tamaño de entrada son compatibles con cualquier GPU de consumo, y con CPU.
- ¿Cabe en GPU de consumo? Sí, por la naturaleza del modelo (LeNet-5 sobre MNIST), aunque no se documentan cifras concretas de memoria ni GPU objetivo.
- Opciones de despliegue: PyTorch como librería de referencia; el análisis se realiza con el SDK de Authentrics (`pip install authentrics`, Linux x86_64, Python 3.11-3.13), que ejecuta el cómputo localmente y solo intercambia metadatos del proyecto con los servidores de Authentrics. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Estado del backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `authentrics/mnist-badnets-poisoned` | LeNet-5 | Clasificacion MNIST (0-9) | Presente: 94,89 % de exito de ataque en `epoch_02`, 8,70 % en `epoch_10` | Apache 2.0 | Repositorio en HuggingFace |
| `authentrics/mnist-badnets-repaired` | LeNet-5 | Clasificacion MNIST (0-9) | Eliminado mediante paso explicito de `exclude_training` | no disponible en la informacion proporcionada | Repositorio en HuggingFace |
| Otros clasificadores LeNet-5 sobre MNIST publicados como recetas TrojAI/BadNets | LeNet-5 | Clasificacion MNIST (0-9) | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que es un proyecto de investigación y demostración, no una herramienta de seguridad para producción, y que no constituye una afirmación general de que Authentrics (ni ninguna otra herramienta) detecte backdoors arbitrarios en modelos arbitrarios.
- El modelo contiene intencionadamente una puerta trasera activa: no debe desplegarse como clasificador de dígitos en ningún contexto real.
- La detección por pico de deriva de parámetros solo funciona en el escenario localizado. En el escenario distribuido, con el disparador presente en todas las épocas, la detección se rompe y la eliminación se convierte en supresión con coste en precisión.
- El entrenamiento continuado sobre datos limpios no elimina el backdoor: reduce la tasa de éxito del 94,89 % al 8,70 % tras ocho épocas limpias, pero no llega a cero.
- Los resultados están ligados a una receta concreta (10 épocas, 20 % de lotes envenenados en la época 2, parche de 3x3 en la esquina, etiqueta desplazada en uno); no son extrapolables a otros disparadores, tasas de envenenamiento o arquitecturas.
- El ámbito del modelo se limita a MNIST y a la arquitectura LeNet-5, con entradas de 28x28 en escala de grises; no hay capacidades de lenguaje, visión general ni multilingües, y no se aplican consideraciones de sesgo lingüístico.
- La licencia Apache 2.0 permite el uso comercial del artefacto, pero dicho uso debería restringirse a fines de auditoría, docencia o investigación sobre seguridad; el riesgo principal no es la licencia, sino desplegar un modelo con comportamiento malicioso condicionado.
- Los metadatos indican un tamano de repositorio de 0,0 GB pese a que la model card afirma que los checkpoints por época están incluidos; conviene verificar los archivos reales antes de planificar su descarga o su uso.
- El README proporcionado está truncado al final, por lo que parte de la lista de enlaces y del contenido del repositorio no se ha podido revisar.
- No se dispone de información sobre sesgos, calibración ni robustez frente a entradas fuera de distribución más allá de lo descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/authentrics/mnist-badnets-poisoned
- Modelo corregido: https://huggingface.co/authentrics/mnist-badnets-repaired
- Codigo y salidas de la demo: https://github.com/Authentrics-ai/trojai-authentrics-demo (`run_demo.py`, `run_demo_distributed.py`, `demo/`)
- Aplicacion y claves de API de Authentrics: https://app.authentrics.ai/
- Documentacion y referencia de la API: https://app.authentrics.ai/docs
- Documentacion adicional enlazada en la model card: https://app.authentrics.ai/docs (insignia de docs)
- Repositorio de ejemplos y guia de usuario: enlace truncado en la model card (`https://github.com/Authentrics-ai/auth...`); no disponible completo en la informacion proporcionada.

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo ni con Authentrics; los resultados obtenidos correspondian a paginas de series de novelas en aleman y no se incluyen por no ser relevantes.
