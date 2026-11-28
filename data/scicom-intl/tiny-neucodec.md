# Scicom-intl/Tiny-NeuCodec

## Resumen

Tiny-NeuCodec es una colección de componentes destilados para NeuCodec, un códec de voz a 24 kHz desarrollado por Neuphonic que genera 50 códigos por segundo. Lo publica Scicom-intl bajo licencia Apache 2.0 y su objetivo es reducir el coste computacional del codificador y del decodificador de NeuCodec manteniendo la compatibilidad total con el códec original. La idea central es que cada pieza es intercambiable: se puede usar un codificador de Tiny-NeuCodec con el decodificador de NeuCodec, o viceversa, porque todos los modelos escriben y leen el mismo libro de códigos fijo de 65.536 entradas.

El modelo base, NeuCodec, emplea un codificador de 636M de parámetros con dos ramas: convoluciones sobre la forma de onda y w2v-BERT 2.0 sobre un banco de filtros. Tiny-NeuCodec sustituye la rama w2v-BERT por sus 4 o 2 primeras capas reentrenadas, manteniendo intacta la rama convolucional, el cuantizador y el decodificador. El resultado son codificadores de 152M (S4) y 104M (S2) parámetros, aproximadamente 2,2 veces más rápidos en GPU, y decodificadores de 184M y 50M de backbone, este último entre 3 y 4,5 veces más rápido.

Su relevancia práctica está en el despliegue de clonación de voz y pipelines de texto a voz: al reducir el peso del codificador de 3,1 GB a 1,3 GB (S4) o 1,1 GB (S2) en GPU, y al ofrecer decodificadores mucho más ligeros, permite servir estas funciones con menor VRAM y menor latencia sin reentrenar los modelos de lenguaje que ya operan sobre los códigos de NeuCodec.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador/decodificador neuronal de audio con rama convolucional y transformer destilado; cuantizador de codigos discretos (65.536 entradas, 50 codigos/s) |
| Parametros totales | Codificador S4: 152M; codificador S2: 104M; decodificador-finetuned: 184M de backbone; decodificador-conv: 50M de backbone |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa un clip por llamada, sin lotes) |
| Tipos de cuantizacion | No disponible (pesos en 16 bits para el transformer y banco de filtros en GPU; `bf16=False` para 32 bits) |
| Idiomas soportados | No disponible como lista cerrada; entrenado con habla leida publica en multiples idiomas y evaluado en ingles, malayo, mandarin y tamil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

NeuCodec, el modelo base, es un codigo de voz a 24 kHz que produce 50 codigos por segundo sobre un libro de codigos fijo de 65.536 entradas. Su codificador combina dos ramas: convoluciones aplicadas directamente sobre la forma de onda y un modelo w2v-BERT 2.0 que opera sobre un banco de filtros. Tiny-NeuCodec reemplaza la rama w2v-BERT por sus primeras 4 capas (S4) o 2 capas (S2) reentrenadas, y conserva sin cambios la rama convolucional, el cuantizador y el decodificador. Los codificadores se entrenaron durante 60.000 pasos para reproducir los 8 numeros que el codificador de NeuCodec entrega al cuantizador.

Los datos de entrenamiento incluyen 23,3 horas de grabaciones de estudio propias con 7 voces, habla sintetica en multiples voces y 722 horas de habla leida publica en varios idiomas, sin usar transcripciones. En el lado del decodificador, `decoder-finetuned` mantiene el tamano del backbone original pero se acerca mas a la grabacion de entrada, mientras que `decoder-conv` reduce el backbone a 50M y logra entre 3 y 4,5 veces mas velocidad con el mismo sonido que el decodificador publicado. La innovacion principal es la intercambiabilidad de piezas sobre un mismo espacio de codigos, lo que permite mezclar componentes sin reentrenar los modelos de lenguaje que consumen dichos codigos.

## Capacidades

- Extraccion de caracteristicas de audio: convierte forma de onda a 16 kHz en codigos discretos de NeuCodec a 50 por segundo.
- Reconstruccion de audio: decodifica codigos de NeuCodec a audio de 24 kHz mediante los decodificadores incluidos.
- Compatibilidad total con NeuCodec: los codigos generados por S4 y S2 los lee el decodificador original, y el codificador original alimenta los decodificadores destilados.
- Clonacion de voz: integrado en TTS-API-Neucodec mediante la variable `VC_ENCODER=S4` o `VC_ENCODER=S2`.
- Destilacion de la rama w2v-BERT: reemplaza las 24 capas del codificador original por 4 (S4) o 2 (S2) capas reentrenadas.
- Procesamiento multilingue de habla: evaluado con voces no vistas en ingles, malayo, mandarin y tamil.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de audio, no un modelo de lenguaje.
- No incluye vision ni audio de entrada mas alla de la forma de onda de voz.

## Casos de uso

- Clonacion de voz en produccion: desplegar TTS-API-Neucodec con `VC_ENCODER=S4` para codificar el clip de referencia con un codificador de 152M en lugar de 636M, reduciendo el coste por peticion sin degradar la similitud de hablante (0,979 en grabaciones de estudio, identica a NeuCodec).
- Servicio de texto a voz de baja latencia: usar `decoder-conv` (50M de backbone, 3 a 4,5 veces mas rapido) para decodificar los codigos generados por un modelo de lenguaje, manteniendo el mismo sonido que el decodificador publicado.
- Despliegue con VRAM limitada: cargar S4 con `free_teacher=True` para bajar los pesos en GPU de 3,1 GB a 1,3 GB, o S2 para 1,1 GB, lo que permite servir el codificador en GPUs de gama consumer.
- Investigacion en modelos de lenguaje sobre audio discreto: generar codigos compatibles con NeuCodec para entrenar o evaluar modelos autorregresivos de voz sin necesidad de ejecutar el codificador completo de 636M.
- Transcripcion y analisis de habla multilingue: extraer codigos de habla en ingles, malayo, mandarin y tamil con perdida controlada (49,6 % de codigos identicos a NeuCodec en FLEURS con S4) para pipelines de analisis acustico.
- Prototipado rapido de pipelines de audio: sustituir piezas de forma individual (codificador destilado con decodificador original, o al reves) para medir el impacto de cada componente en la calidad final sin reentrenar el sistema completo.
- Evaluacion comparativa de codecs: usar los conjuntos de prueba documentados (240 clips de estudio, 120 de habla sintetica, 200 de FLEURS) como referencia reproducible de MOS, similitud de hablante y PESQ.

## Benchmarks y rendimiento

Los resultados se midieron con el mismo audio de entrada decodificado por el mismo decodificador de NeuCodec y comparado contra la entrada original.

| Conjunto de prueba | Codigos de | Codigos iguales (%) | Digitos iguales (%) | MOS | Similitud de hablante | PESQ | Nivel frente a entrada (dB) |
|---|---|---:|---:|---:|---:|---:|---:|
| Grabaciones de estudio (240 clips) | NeuCodec | 100 | 100 | 2,88 | 0,979 | 1,83 | -0,6 |
| | S4 | 58,4 | 92,4 | 2,88 | 0,979 | 1,84 | -0,6 |
| | S2 | 49,2 | 89,9 | 2,88 | 0,979 | 1,83 | -0,6 |
| Habla sintetica (120 clips) | NeuCodec | 100 | 100 | 2,66 | 0,983 | 2,72 | -0,1 |
| | S4 | 55,2 | 91,6 | 2,66 | 0,982 | 2,74 | -0,0 |
| | S2 | 44,6 | 88,4 | 2,66 | 0,982 | 2,72 | +0,0 |
| FLEURS (200 clips) | NeuCodec | 100 | 100 | 2,47 | 0,959 | 1,64 | +2,6 |
| | S4 | 49,6 | 90,3 | 2,47 | 0,957 | 1,64 | +2,4 |
| | S2 | 36,2 | 86,0 | 2,45 | 0,955 | 1,63 | +2,2 |

Notas de referencia aportadas por el autor: un codigo son 8 digitos de 4 niveles; el MOS es predicho con UTMOSv2 y la similitud de hablante es un coseno de embeddings de hablante WavLM. El propio codificador de NeuCodec coincide consigo mismo en el 92 % de los codigos en 16 bits y en el 69 % al anadir un segundo de silencio al clip. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no son aplicables a un codec de audio.

## Requisitos de hardware

- VRAM estimada: con NeuCodec completo cargado, los pesos en GPU son de 3,1 GB; con `free_teacher=True` bajan a 1,3 GB (S4) o 1,1 GB (S2).
- GPU recomendadas: el autor menciona ejecucion en CUDA y mediciones en GPU sin especificar modelos concretos; no se detallan A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU consumer: si, segun los pesos indicados (1,1 a 3,1 GB), aunque el modelo no especifica modelos consumer concretos.
- Opciones de despliegue: paquete `neucodec` de Python con `huggingface_hub` y `librosa`; scripts `tiny_encoder.py` y `tiny_decoder.py`; integracion en TTS-API-Neucodec. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el codificador S4 es aproximadamente 2,2 veces mas rapido en GPU que el de NeuCodec; S2 es algo mas rapido aun con menor exactitud; `decoder-conv` es 3 a 4,5 veces mas rapido que el decodificador publicado. No se aportan cifras absolutas de latencia ni de throughput.
- Restriccion de lote: un clip por llamada; el padding altera los codigos, tambien en NeuCodec.

## Comparativa con modelos similares

| Modelo | Parametros del codificador | Contexto / flujo | Calidad (MOS estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny-NeuCodec S4 | 152M | 50 codigos/s, 24 kHz, un clip por llamada | 2,88 | Apache 2.0 | Hugging Face |
| Tiny-NeuCodec S2 | 104M | 50 codigos/s, 24 kHz, un clip por llamada | 2,88 | Apache 2.0 | Hugging Face |
| NeuCodec (base) | 636M | 50 codigos/s, 24 kHz, un clip por llamada | 2,88 | No disponible en la informacion proporcionada | Hugging Face (`neuphonic/neucodec`) |

No se dispone de datos de otros codecs de voz comparables (por ejemplo, EnCodec, DAC o SoundStream) en la informacion proporcionada, por lo que la comparativa se limita a las variantes de la propia familia.

## Limitaciones y advertencias

- Los codificadores destilados no reproducen exactamente los codigos de NeuCodec: la coincidencia es del 58,4 % (S4) y 49,2 % (S2) en grabaciones de estudio, y baja al 49,6 % y 36,2 % en FLEURS con voces no vistas.
- El decodificador `decoder-conv` mantiene el sonido del original pero reduce el backbone a 50M; no se documentan sus limites en voces fuera de dominio.
- Procesa un solo clip por llamada: el padding cambia los codigos, por lo que no admite lotes sin alterar la salida.
- No se especifican sesgos conocidos ni riesgos de alucinacion en la informacion disponible; al ser un codec de audio, el riesgo principal es la degradacion de calidad en voces o idiomas alejados de los datos de entrenamiento.
- Los datos de entrenamiento incluyen habla sintetica y grabaciones propias; no se detalla la composicion exacta por idioma ni la cobertura mas alla de los cuatro idiomas evaluados.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base NeuCodec, cuya licencia no se detalla en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; la validacion externa es practicamente inexistente.
- No se han publicado resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Tiny-NeuCodec
- Modelo base NeuCodec: https://huggingface.co/neuphonic/neucodec
- Repositorio TTS-API-Neucodec: https://github.com/Scicom-AI-Enterprise-Organization/TTS-API-Neucodec
- Figura de velocidad de codificacion: https://huggingface.co/Scicom-intl/Tiny-NeuCodec/resolve/main/figures/speed.png
- Figura de codigos coincidentes: https://huggingface.co/Scicom-intl/Tiny-NeuCodec/resolve/main/figures/codes.png
- Figura de MOS predicho: https://huggingface.co/Scicom-intl/Tiny-NeuCodec/resolve/main/figures/audio.png
