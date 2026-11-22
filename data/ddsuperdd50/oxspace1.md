# ddsuperdd50/oxspace1

## Resumen

ox space 1 es un modelo de generacion de texto de arquitectura GPT entrenado desde cero por el usuario ddsuperdd50. Se presenta como un ejercicio de implementacion completa: arquitectura, tokenizer, optimizador Adam y bucle de entrenamiento escritos manualmente, sin partir de ningun modelo preentrenado ni de APIs externas. El modelo esta etiquetado para portugues y se distribuye con licencia MIT.

La escala es muy reducida: 630.784 parametros totales y 3.000 pasos de entrenamiento sobre una mezcla de conversaciones, codigo y 60 articulos de Wikipedia en portugues. No se trata de un modelo de proposito general comparable a los LLM actuales, sino de un artefacto educativo o experimental que ilustra el ciclo completo de construccion de un transformer autoregresivo.

Su relevancia es, por tanto, didactica y de referencia para quien quiera estudiar una implementacion minima de un GPT. No hay informacion publicada sobre arquitectura detallada (capas, dimensiones), tokenizador, contexto maximo ni resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer autoregresivo, implementacion propia) |
| Parametros totales | 630.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`oxspace1.pt`) |

## Arquitectura y entrenamiento

La model card indica que se trata de una arquitectura GPT escrita desde cero, junto con el tokenizer, el optimizador (Adam) y el bucle de entrenamiento. No se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la funcion de activacion ni la posicion de las normalizaciones. Tampoco se detalla el vocabulario del tokenizer ni el tamano maximo de secuencia.

El entrenamiento consistio en 3.000 pasos desde inicializacion aleatoria sobre una mezcla de conversaciones, codigo y 60 articulos de Wikipedia en portugues. No se menciona el numero total de tokens procesados, la composicion exacta del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Con 630.784 parametros y 3.000 pasos, la capacidad de generalizacion del modelo es necesariamente muy limitada.

## Capacidades

- Generacion de texto autoregresiva en portugues, a nivel muy basico dado el tamano del modelo.
- Modelado de secuencias cortas de conversacion y codigo, segun la composicion del dataset de entrenamiento.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay capacidades multimodales (vision, audio) declaradas.
- No se documenta un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Estudio de implementaciones minimas de GPT: sirve como referencia ejecutable para entender como se construye un transformer autoregresivo completo, desde el tokenizer hasta el bucle de entrenamiento.
- Docencia y talleres: permite reproducir el pipeline de entrenamiento en un equipo modesto y observar el efecto de distintos hiperparametros sin coste computacional relevante.
- Pruebas de infraestructura de carga de checkpoints: el script de carga via `huggingface_hub` y `oxspace1.io.load_checkpoint` sirve para validar flujos de descarga y carga de pesos PyTorch.
- Generacion de texto en portugues a pequena escala para demostraciones: util para mostrar el comportamiento de un modelo no entrenado a gran escala y contrastarlo con modelos grandes.
- Base para experimentos de ajuste fino: al ser pequeno y de licencia MIT, se puede modificar y reentrenar libremente para explorar variantes de arquitectura o de datos.
- Prototipado de aplicaciones de escritorio: la model card menciona un boton "Baixar cerebro da nuvem" en una app de escritorio, lo que sugiere su uso como componente de demostracion en dicha aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 630.784 parametros en precision FP32 el checkpoint ocupa del orden de 2,5 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada; la inferencia puede ejecutarse en CPU sin problema.
- Cabe en GPU consumer: si, en todas las gamas actuales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el unico metodo descrito es la carga del checkpoint PyTorch mediante `oxspace1.io.load_checkpoint`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ox space 1 | 630.784 | no disponible | MIT | Hugging Face |
| GPT-2 small (referencia) | 124 M | 1.024 tokens | MIT | Hugging Face |
| TinyStories (referencia) | ~1-10 M | no disponible | variable | Hugging Face |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de ox space 1 con alternativas. La comparacion anterior es solo estructural, basada en el orden de magnitud de parametros.

## Limitaciones y advertencias

- Con 630.784 parametros y 3.000 pasos de entrenamiento, la calidad del texto generado sera muy limitada y probablemente incoherente fuera de patrones vistos en el entrenamiento.
- Riesgo elevado de alucinacion y de generar contenido sin sentido; no es apto para produccion ni para tareas que requieran fiabilidad.
- Sesgos desconocidos: no se documenta la procedencia ni la filtracion del dataset de conversaciones, codigo y articulos de Wikipedia.
- Cobertura limitada al portugues; no hay informacion sobre el comportamiento en otros idiomas.
- No se especifican la longitud de contexto ni el vocabulario del tokenizer, lo que dificulta planificar su uso.
- La licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario en la practica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar publicados o ser de tamano despreciable.

## Enlaces

- Hugging Face: https://huggingface.co/ddsuperdd50/oxspace1
- Repositorio de codigo: la model card menciona "github.com (proyecto local ox space)" sin URL concreta; no disponible.
