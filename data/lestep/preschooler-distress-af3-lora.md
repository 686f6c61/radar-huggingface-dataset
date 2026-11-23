# lestep/preschooler-distress-af3-lora

## Resumen

Preschooler distress AF3 LoRA es un adaptador PEFT de tipo LoRA publicado por el usuario lestep sobre el modelo multimodal de audio nvidia/audio-flamingo-3-hf. Su funcion es puntuar ventanas de audio doméstico de 5 segundos y estimar la probabilidad de que contengan llanto infantil o malestar claro de un niño en edad preescolar. El repositorio contiene unicamente los pesos del adaptador (0,2 GB), no audio de participantes ni anotaciones, y se distribuye con licencia MIT.

El modelo resuelve un problema de clasificacion binaria de audio (etiqueta Yes/No) sobre un backbone de audio-lenguaje de NVIDIA, aprovechando el ajuste fino de bajo rango para especializar el modelo base en una tarea muy concreta sin reentrenar todos sus parametros. La salida `pred_score` corresponde a P(Yes) y el autor indica un umbral binario por defecto de 0,5, mientras que el cribado de laboratorio utilizo 0,32.

Es relevante por su caracter aplicado: el autor lo vincula a un articulo en preparacion de Niyantri Ravindran (University of Georgia) y a un repositorio de codigo de puntuacion. No obstante, la informacion publicada es muy escasa: no se detallan parametros del modelo base, contexto, composicion del dataset de entrenamiento ni resultados de benchmarks, y el propio autor advierte que no es una herramienta de diagnostico clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre nvidia/audio-flamingo-3-hf (modelo multimodal de audio) |
| Parametros totales | No disponible (solo se publica el adaptador; el modelo base no se especifica) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El autor menciona carga del modelo base en 4 bits; no se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre nvidia/audio-flamingo-3-hf, un modelo de la familia Audio Flamingo de NVIDIA que combina un codificador de audio con un modelo de lenguaje para tareas de comprension y clasificacion de audio. El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, lo que reduce el coste de entrenamiento y el tamano del artefacto publicado (0,2 GB en el repositorio).

La tarea de entrenamiento es una clasificacion binaria sobre ventanas de audio de 5 segundos procedentes de grabaciones domesticas, orientada a detectar llanto o malestar de ninos en edad preescolar. No se especifican en la informacion disponible el numero de tokens de audio, la composicion del dataset, el numero de horas anotadas, la procedencia de los datos ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan hiperparametros del LoRA (rango, alpha, modulos objetivo) ni la estrategia de congelacion. El autor indica que el repositorio no contiene audio de participantes ni anotaciones, y remite a un articulo en preparacion para los detalles metodologicos.

## Capacidades

- Clasificacion binaria de audio: estima P(Yes) para la presencia de llanto infantil o malestar claro en ventanas de 5 segundos.
- Puntuacion por ventana deslizante sobre directorios de audio mediante el script `score.py`, con salida en CSV.
- Integracion con el ecosistema PEFT: el adaptador se carga con `PeftModel` sobre el modelo base en 4 bits.
- Umbral ajustable: 0,5 por defecto y 0,32 en el cribado de laboratorio descrito por el autor.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni multilingueismo propias del adaptador; estas dependerian del modelo base y no estan descritas en la informacion disponible.

## Casos de uso

- Cribado de grabaciones domesticas: procesar directorios de WAV con `score.py` para obtener un CSV de puntuaciones por ventana de 5 segundos y localizar segmentos candidatos a llanto o malestar.
- Investigacion en desarrollo infantil: el autor lo vincula a un estudio academico en preparacion, por lo que puede emplearse como componente de puntuacion en protocolos de investigacion con revision humana posterior.
- Preetiquetado para anotacion manual: usar las puntuaciones como primera pasada para priorizar que ventanas revisan los anotadores, reduciendo el volumen de escucha manual.
- Analisis de series temporales de audio: agregar las puntuaciones por ventana para estudiar la frecuencia y duracion de episodios de malestar a lo largo de una grabacion.
- Prototipos de investigacion con presupuesto limitado: al ser un adaptador de 0,2 GB sobre un modelo base cargado en 4 bits, el coste de almacenamiento y despliegue del artefacto es reducido.
- Reproducibilidad de estudios: el codigo de puntuacion publico y el umbral documentado permiten replicar el pipeline de cribado descrito por el autor.
- No se documentan casos de uso en produccion comercial, atencion al cliente, generacion de codigo ni agentes; el autor restringe explicitamente el uso a un contexto no clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones con otros sistemas, y remite a un articulo en preparacion para la evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo base; el adaptador en si ocupa 0,2 GB en disco.
- El autor indica que el modelo base se carga en 4 bits, lo que reduce los requisitos de memoria respecto a la carga en precision completa, pero no se publican cifras concretas de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base nvidia/audio-flamingo-3-hf, cuyos requisitos no se detallan en la informacion proporcionada.
- Opciones de despliegue: carga mediante PEFT (`PeftModel`) sobre el modelo base; el autor proporciona un script de linea de comandos (`score.py`) para puntuar directorios de audio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de clasificacion de llanto infantil ni datos de rendimiento que permitan una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- No es una herramienta de diagnostico clinico; el propio autor lo advierte de forma explicita.
- El repositorio contiene solo pesos del adaptador: no incluye audio de participantes ni anotaciones, por lo que no es posible auditar los datos de entrenamiento a partir del artefacto.
- No se documentan sesgos conocidos, pero al tratarse de un modelo entrenado sobre audio domestico de una poblacion concreta, su generalizacion a otros entornos acusticos, idiomas o edades no esta caracterizada.
- Riesgo de alucinacion y falsos positivos/negativos: sin metricas publicadas no es posible cuantificar la fiabilidad; el umbral de 0,32 usado en laboratorio frente al 0,5 por defecto sugiere que el punto de operacion afecta de forma significativa al comportamiento.
- La licencia MIT del adaptador no exime de comprobar la licencia del modelo base nvidia/audio-flamingo-3-hf antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto muy reciente y sin validacion comunitaria.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita la planificacion de despliegues en produccion.
- Cualquier uso en produccion deberia ir acompanado de validacion propia sobre el dominio objetivo y de supervision humana.

## Enlaces

- Hugging Face: https://huggingface.co/lestep/preschooler-distress-af3-lora
- Modelo base: https://huggingface.co/nvidia/audio-flamingo-3-hf
- Codigo de puntuacion: https://github.com/lestep1225118/preschooler-distress-af3
- Articulo en preparacion: Niyantri Ravindran (University of Georgia), referencia citada en la model card sin enlace disponible.
