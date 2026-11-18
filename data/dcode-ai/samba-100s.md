# Dcode-AI/SAMBA-100s

## Resumen

SAMBA-100s es un codificador (encoder) de senales EEG desarrollado por Dcode-AI, concebido como extractor de caracteristicas para interfaces cerebro-computadora (brain-computer-interface, BCI). Se trata de un modelo de aproximadamente 1,06 millones de parametros, entrenado sobre ventanas de 100 segundos a 128 Hz usando el conjunto de datos TUAB (Temple University Abnormal EEG Corpus). Su funcion no es generar texto, sino transformar senales electroencefalograficas en representaciones vectoriales reutilizables para tareas posteriores como clasificacion, deteccion de anomalias o decodificacion.

El modelo pertenece a la familia SAMBA y se apoya en la arquitectura Mamba (modelos de espacio de estados selectivos), lo que le permite procesar secuencias largas de senales con coste computacional lineal respecto a la longitud de entrada. Esto es especialmente relevante en EEG, donde las ventanas temporales pueden ser muy extensas y los transformers clasicos escalan de forma cuadratica. La variante "100s" esta especializada en ventanas largas, mientras que el autor publica tambien SAMBA-2s para ventanas cortas.

Su relevancia actual radica en que ofrece un encoder preentrenado y abierto para EEG, un dominio donde escasean los modelos fundacionales publicos y donde la mayoria de soluciones son especificas por tarea. El modelo declara soportar otras longitudes de entrada y configuraciones de electrodos distintas a las de preentrenamiento, lo que amplia su aplicabilidad. La inferencia requiere CUDA segun la documentacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados, segun tags y model card) |
| Parametros totales | 1.059.659 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 100 segundos a 128 Hz (entrada de preentrenamiento); soporta otras longitudes segun el autor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de senales EEG, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

SAMBA-100s es un encoder basado en Mamba, una familia de modelos de espacio de estados selectivos que sustituye la atencion cuadratica de los transformers por una recurrencia estructurada con coste lineal en la longitud de secuencia. Esta eleccion encaja con senales EEG de ventanas largas: una entrada de 100 segundos a 128 Hz supone 12.800 muestras temporales por canal, una longitud que penaliza fuertemente a los transformers convencionales. El modelo se usa en modo `feature-extraction`, es decir, produce representaciones internas que se consumen aguas abajo.

El preentrenamiento se realizo sobre TUAB, el Temple University Abnormal EEG Corpus, un conjunto clinico de EEG con etiquetas de normalidad/anormalidad. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). Tampoco se especifica la innovacion concreta del preentrenamiento mas alla del uso de Mamba y de la ventana de 100 segundos. El autor indica que el encoder admite otras longitudes de entrada y otros montajes de electrodos, aunque no se documenta el procedimiento de adaptacion.

## Capacidades

- Extraccion de caracteristicas de senales EEG: genera embeddings a partir de ventanas de 100 segundos a 128 Hz.
- Procesamiento de secuencias largas: la arquitectura Mamba permite manejar entradas temporales extensas con coste lineal.
- Flexibilidad de entrada declarada: el autor afirma soporte para otras longitudes de ventana y configuraciones de electrodos.
- Base para tareas downstream: los embeddings sirven para clasificacion, deteccion de anomalias y otras tareas de BCI.
- No es un modelo generativo de texto ni soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues, vision, audio ni modo de razonamiento (thinking mode); el dominio es exclusivamente EEG.
- Requiere CUDA para inferencia, segun la documentacion del autor.

## Casos de uso

- Deteccion de EEG anormal en contexto clinico: usando los embeddings del encoder como entrada a un clasificador ligero, se puede construir un sistema de triaje que marque registros con patrones anomalos para revision medica. El preentrenamiento sobre TUAB lo hace directamente alineado con esta tarea.
- Monitorizacion continua de pacientes: al procesar ventanas de 100 segundos, el modelo encaja en escenarios de seguimiento prolongado donde se analizan bloques largos de senal sin fragmentar en exceso.
- Investigacion en BCI: sirve como extractor de caracteristicas congelado para experimentos de decodificacion, reduciendo el coste de entrenar desde cero sobre datasets pequenos.
- Clasificacion de estados cognitivos o sueno: los embeddings pueden alimentar clasificadores de estadios de sueno o de carga cognitiva, reutilizando representaciones preentrenadas.
- Preentrenamiento y fine-tuning en nuevos montajes de electrodos: el autor declara soporte para otros layouts, lo que permite adaptar el encoder a configuraciones de hardware distintas a las de TUAB.
- Pipeline de investigacion reproducible: al publicarse en Hugging Face con safetensors y codigo asociado, facilita la comparacion de resultados entre laboratorios que trabajen con EEG.
- Prototipado rapido de aplicaciones BCI: al ser un modelo pequeno (aproximadamente 1,06 millones de parametros), permite iterar con recursos modestos una vez resuelto el requisito de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.059.659 parametros, el peso en precision FP32 ronda los 4,2 MB y en FP16 unos 2,1 MB, por lo que el cuello de botella es la activacion sobre secuencias largas, no los pesos.
- GPU recomendadas: no disponible; el autor solo indica que la inferencia requiere CUDA.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque la memoria de activacion para ventanas de 100 s a 128 Hz puede ser el factor limitante y no se documenta.
- Opciones de despliegue: el autor proporciona la libreria `samba_eeg` (instalable con `pip install -e '.[mamba,hub]'`) y carga via `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAMBA-100s | 1.059.659 | 100 s a 128 Hz | EEG / BCI | no disponible | Hugging Face |
| SAMBA-2s | no disponible | 2 s (segun nombre) | EEG / BCI | no disponible | Hugging Face |
| Alternativas EEG comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros encoders EEG publicos comparables en la documentacion proporcionada; la unica comparacion directa posible es con la variante SAMBA-2s del mismo autor, especializada en ventanas cortas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en produccion.
- Modelo de dominio muy especifico: solo procesa senales EEG; no es un modelo de lenguaje ni generativo.
- Preentrenado unicamente sobre TUAB: puede no generalizar bien a otras poblaciones, equipos o protocolos de adquisicion sin ajuste adicional.
- Requiere CUDA: no se documenta soporte para CPU, lo que limita el despliegue en entornos sin GPU.
- Riesgo de sesgo por dataset clinico: TUAB es un corpus clinico concreto; los sesgos de adquisicion y de etiquetado pueden propagarse a los embeddings.
- Riesgo de falsos negativos en deteccion de anomalias: al ser un extractor de caracteristicas, su rendimiento final depende del clasificador downstream; no debe usarse como diagnostico autonomo.
- Documentacion escasa: no se detallan tokens de entrenamiento, composicion del dataset, ni procedimiento de adaptacion a otras longitudes o montajes.
- Sin benchmarks publicados: no es posible comparar su rendimiento de forma objetiva con alternativas.
- Cero descargas y cero likes en el momento de la consulta: ecosistema practicamente inexistente, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dcode-AI/SAMBA-100s
- Variante SAMBA-2s: https://huggingface.co/Dcode-AI/SAMBA-2s
- Guia de uso compartida: https://huggingface.co/Dcode-AI/SAMBA
- Proyecto: https://samba.dcode.ai/
- Codigo: https://github.com/Jiazhen-Hong/SAMBA
- Paper: https://arxiv.org/abs/2511.18571
