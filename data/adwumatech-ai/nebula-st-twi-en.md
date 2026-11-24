# adwumatech-ai/nebula-st-twi-en

## Resumen
nebula-st-twi-en es un modelo de traduccion de voz a texto (speech translation) que convierte audio en twi (akan) a texto en ingles. Lo desarrolla AdwumaTech AI, un equipo de investigacion que lo publica como parte del proyecto nebula-research. El modelo resuelve un problema de cobertura limitada: la mayoria de sistemas ASR y de traduccion apenas ofrecen soporte para lenguas akan, de modo que esta iniciativa cubre un hueco real para comunidades ghanesas y para investigadores que trabajan con lenguas de bajos recursos.

Tecnicamente es un modelo hibrido: reutiliza el encoder de openai/whisper-small (congelado salvo las cuatro capas superiores) y lo acopla a un decoder transformer pequeno entrenado desde cero (d_model=256, 4 capas, 8 cabezas, feed-forward 1024). El conjunto suma 119.629.655 parametros y se distribuye en formato safetensors, con exportacion a ExecuTorch. La version actual es la 0.2.1, con pesos identicos a la 0.2.0.

Es relevante ahora por dos motivos: primero, porque demuestra una via de bajo coste para construir traduccion de voz en lenguas africanas partiendo de un modelo Whisper pequeno; segundo, porque el autor documenta con inusual honestidad las limitaciones del conjunto de evaluacion, incluido un solapamiento casi total entre test y train que invalida las metricas de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-small (parcialmente congelado) + decoder transformer entrenado desde cero |
| Parametros totales | 119.629.655 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de entrada de Whisper-small) |
| Tipos de cuantizacion | no disponible (repo con safetensors y exportacion ExecuTorch) |
| Idiomas soportados | ak (twi), en |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, executorch |

## Arquitectura y entrenamiento
El modelo sigue un esquema encoder-decoder asimetrico. El encoder procede de openai/whisper-small y solo se ajustan sus cuatro capas superiores; el resto permanece congelado. El decoder es una red transformer pequena construida desde cero: 4 capas, dimension de modelo 256, 8 cabezas de atencion y feed-forward de 1024. No incorpora cabezas de condicionamiento de idioma (LID, DANN ni embeddings de lengua), por lo que el autor lo describe explicitamente como un baseline simple.

El entrenamiento uso exclusivamente los shards aprobados en el dataset_registry.yaml del proyecto, todos derivados de adwumatech-ai/mghana-st con licencia CC BY 4.0, que a su vez toma el audio del Financial Inclusion Speech Dataset. No se publican las horas totales de audio; el autor indica que el conjunto procesado no se conservo y que no puede recalcularse, aunque se registran unas 19.800 segmentos por epoca. La configuracion fue: semilla 42, batch de 16, AdamW con learning rate 0.0005, 500 pasos de warm-up, gradient clipping de 1.0, dropout 0.1 y 60 epocas programadas. El checkpoint publicado corresponde a la epoca 15 (18.600 pasos), elegido por mejor BLEU de validacion, con perdida de validacion de 1.242 y un BLEU de validacion de 58.3 medido sobre 50 clips muestreados en modo greedy, no sobre el split completo. El codigo de entrenamiento no quedo registrado, aunque los scripts eran identicos entre los commits 7e0dc9d y cdc4da7.

## Capacidades
- Traduccion directa de voz en twi a texto en ingles, sin paso intermedio de transcripcion.
- Reconocimiento automatico del habla (pipeline_tag: automatic-speech-recognition) sobre audio en twi.
- Salida de texto en ingles alineada con la traduccion de referencia del dataset MGhana-ST.
- Exportacion a ExecuTorch, pensada para despliegue en dispositivos con recursos limitados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidad multilingue limitada a los dos idiomas declarados: akan/twi y en.

## Casos de uso
- Subtitulado de contenido audiovisual en twi: el modelo permite generar subtitulos en ingles para videos, entrevistas o programas de radio en akan, un nicho donde los servicios comerciales de ASR rara vez ofrecen cobertura.
- Investigacion en lenguas de bajos recursos: sirve como baseline reproducible para experimentos de speech translation akan-ingles, con pesos, splits y configuracion de entrenamiento documentados en el repositorio.
- Digitalizacion de archivos orales: transcripcion y traduccion de grabaciones de historia oral o encuestas en twi para su incorporacion a corpus textuales en ingles.
- Prototipos de atencion al cliente en Ghana: integrado en un pipeline de voz, puede traducir consultas habladas en twi a texto en ingles para que un sistema posterior las procese, siempre que se acepte su naturaleza de baseline.
- Despliegue en dispositivos: gracias a la exportacion ExecuTorch y a sus 119 millones de parametros, es viable ejecutarlo en hardware embebido o movil para aplicaciones de traduccion offline en zonas con conectividad limitada.
- Evaluacion comparativa de tecnicas de congelacion parcial: el diseno (encoder mayoritariamente congelado mas decoder pequeno) lo convierte en un punto de referencia util para medir cuanto aporta el ajuste fino del encoder frente a entrenar el decoder desde cero.
- Docencia y formacion: por su tamano contenido y su documentacion detallada, resulta adecuado como ejemplo practico de construccion de un sistema de traduccion de voz para lenguas minoritarias.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks completos en la informacion disponible. El unico dato de rendimiento es el BLEU de validacion de 58.3, medido durante el entrenamiento sobre 50 clips muestreados en modo greedy, que el propio autor advierte que no equivale a una puntuacion sobre el split completo. El informe de fugas (splits/leak_report.json) indica que 362 de 362 hablantes de test aparecen tambien en train, que 264 de 264 prompts de test se leyeron en train y que 2.480 de 2.733 archivos de test comparten traduccion con algun archivo de train, de modo que cualquier metrica sobre el split de test mide reproduccion sobre frases y voces ya vistas, no generalizacion.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: en torno a 0,5 GB para los pesos (119,6 M de parametros), mas el coste de activaciones y del procesamiento de audio.
- VRAM estimada en fp16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura. Para lotes grandes, una A100 o H100 aporta margen pero no es necesaria.
- Cabe en GPU consumer: si, practicamente en cualquier tarjeta con 4 GB o mas de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el repositorio incluye pesos safetensors y exportacion ExecuTorch; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y al tratarse de un modelo de audio no son las herramientas habituales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nebula-st-twi-en | 119,6 M | no disponible | ak, en | CC BY 4.0 | Encoder Whisper-small + decoder propio; baseline de traduccion de voz twi-ingles |
| openai/whisper-small | 244 M | ventana de 30 s de audio | multilingue (sin twi garantizado) | MIT | Modelo base del que se reutiliza el encoder; tarea ASR, no traduccion directa |
| openai/whisper-base | 74 M | ventana de 30 s de audio | multilingue | MIT | Alternativa mas ligera para ASR; no ofrece traduccion twi-ingles especifica |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- El split de test presenta un solapamiento casi total con train (todos los hablantes y prompts de test aparecen en entrenamiento), por lo que las metricas de test no miden generalizacion a voces o frases nuevas.
- El BLEU de validacion de 58.3 procede de solo 50 clips muestreados en modo greedy y no debe interpretarse como rendimiento sobre el conjunto completo.
- El autor califica el modelo como baseline simple, sin cabezas de condicionamiento de idioma ni mecanismos adicionales de robustez.
- No se publican las horas de audio de entrenamiento, lo que dificulta estimar la cobertura del dominio.
- Riesgo de alucinacion y de traducciones inexactas inherente a un decoder pequeno entrenado con datos limitados; no se documentan evaluaciones de sesgo.
- La licencia CC BY 4.0 exige atribucion tanto del modelo como del dataset mghana-st y del Financial Inclusion Speech Dataset; es compatible con uso comercial siempre que se respete la atribucion.
- El codigo de entrenamiento de esta ejecucion no quedo registrado, lo que limita la reproducibilidad exacta del run.
- El modelo solo cubre twi y ingles; no debe esperarse comportamiento correcto con otras lenguas akan o con audio en otros idiomas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/adwumatech-ai/nebula-st-twi-en
- Version etiquetada v0.2.1: https://huggingface.co/adwumatech-ai/nebula-st-twi-en/tree/v0.2.1
- Repositorio nebula-research: https://github.com/adwumatech-ai/nebula-research
- Registro de datasets: https://github.com/adwumatech-ai/nebula-research/blob/main/dataset_registry.yaml
- Dataset MGhana-ST: https://huggingface.co/datasets/adwumatech-ai/mghana-st
- Financial Inclusion Speech Dataset: https://github.com/Ashesi-Org/Financial-Inclusion-Speech-Dataset
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- UGSpeechData (no utilizado en este modelo): https://doi.org/10.57760/sciencedb.22298
