# Anony-0x3f/opview-v2-mask25

## Resumen

OpView V2 es un conjunto de cinco codificadores (encoders) para electroencefalografía (EEG) desarrollado por el autor Anony-0x3f bajo licencia MIT. Cada codificador procesa la señal a través de un operador fijo y sin parámetros que hace explícita una estructura concreta (forma de onda, dinámica temporal, frecuencia, relación entre canales o topografía del cuero cabelludo), y cada uno se preentrena de forma independiente con su propio objetivo de autoaprendizaje. El modelo se usa congelado como extractor de características para decodificación de EEG mediante sondas lineales u otros readouts ligeros.

La carpeta `opview-v2-mask25` contiene el conjunto secundario `mask25_30k`, en el que las vistas Frequency, Relation y Projective se entrenaron como autoencoders enmascarados (25 % de unidades ocultas) con la misma arquitectura, datos y planificación que los autoencoders del conjunto publicado. Las vistas Waveform y Dynamics residen en el conjunto principal. Los troncos tienen anchura 192 y 8 cabezas de atención; los recuentos de parámetros oscilan entre aproximadamente 3,7 y 5,0 millones por vista, con anchuras de características de 8.192.

Es relevante para investigadores en neurociencia y decodificación de EEG porque ofrece representaciones congeladas reutilizables, comparables entre vistas, y permite experimentos de fine-tuning; no es un dispositivo médico ni está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tronco de anchura 192 y 8 cabezas de atencion; cinco codificadores independientes con operadores fijos sin parametros |
| Parametros totales | Frequency: 3.739.789; Relation: 5.015.4xx (cifra truncada en la model card); Waveform, Dynamics y Projective: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de EEG; 4 s / 1024 muestras a 256 Hz compatible con todas las vistas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de senal EEG, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

Cada una de las cinco vistas emplea un transformer de anchura 192 y 8 cabezas de atencion que recibe la senal transformada por un operador fijo y sin parametros. La vista Waveform usa la ventana dividida por su RMS visible con parches de 1 s y microtokens de 125 ms, y se preentrena ocultando el 25 % de los atomos de canal de 250 ms con error espectral blanqueado en las muestras ocultas. La vista Dynamics usa el nivel y 8 diferencias de retardo causal (1 a 128 muestras) con tokens de 62,5 ms, y predice el cambio futuro a 62,5, 125 y 250 ms. La vista Frequency usa potencia logaritmica estandarizada en grupos de 1 Hz hasta 75 Hz sobre atomos de 1, 2 y 4 s (sin fase) y se entrena como autoencoder de la potencia logaritmica. La vista Relation usa forma y escala logaritmicas de espectros cruzados de ancla sin referencia con 6 bandas por atomo, y se entrena como autoencoder del grafico espectral cruzado. La vista Projective usa un proyector de armonicos esfericos de grado 1-3 y RMS logaritmico de tokens de 62,5 ms, entrenandose como autoencoder de los tokens del proyector.

Waveform, Dynamics, Relation y Projective incorporan ademas dos terminos auxiliares solo de entrenamiento (retencion de potencia de banda y un slot auxiliar) cuyas cabezas estan en los checkpoints pero no forman parte de las caracteristicas. El conjunto `mask25_30k` entrena Frequency, Relation y Projective como autoencoders enmascarados con el 25 % de unidades ocultas, misma arquitectura, datos y planificacion que los autoencoders del conjunto publicado. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset mas alla de la descripcion de preprocesado (filtro paso banda 0,1-75 Hz con notch a 50 y 60 Hz, reparacion de canales malos por interpolacion spline esferica y referenciacion promedio en algunas fuentes).

## Capacidades

- Extraccion de caracteristicas de EEG congeladas: cada vista produce un vector de caracteristicas por ventana y vista mediante un sketch de recuento fijo.
- Decodificacion de EEG mediante sondas lineales u otros readouts ligeros sobre las caracteristicas congeladas.
- Comparacion entre vistas: cinco representaciones complementarias (Waveform, Dynamics, Frequency, Relation, Projective) de la misma senal.
- Fine-tuning: el codificador Dynamics se ha ajustado de extremo a extremo a traves del mismo readout.
- Procesamiento de senales multicanal con requisitos de montaje: Relation necesita al menos 3 canales; Projective al menos 4 canales en direcciones distintas.
- Remuestreo interno a 256 Hz mediante un remuestreador polifasico.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un extractor de caracteristicas de senal EEG.

## Casos de uso

- Investigacion en decodificacion de EEG: usar las caracteristicas congeladas con una sonda lineal para clasificar tareas cognitivas o estados mentales, aprovechando que el modelo no requiere reentrenamiento.
- Comparacion de representaciones: evaluar que vista (frecuencia, relacion entre canales, topografia, forma de onda o dinamica) captura mejor una tarea concreta mediante experimentos controlados con las cinco vistas.
- Fine-tuning de decodificadores: ajustar el codificador Dynamics de extremo a extremo a traves del readout para tareas especificas donde la dinamica temporal causal sea relevante.
- Analisis de interfaz cerebro-computadora (BCI): emplear las caracteristicas para clasificacion en conjuntos como BCI IV-2a, BNCI2015001 o Nakanishi2015 (referenciados a promedio y reescalados en la evaluacion del autor).
- Estudios de conectividad funcional: la vista Relation, que hace explicitos los acoplamientos entre canales mediante espectros cruzados de ancla, puede usarse para analisis de sincronizacion entre regiones.
- Analisis topografico: la vista Projective, basada en armonicos esfericos de grado 1-3, permite estudiar la distribucion espacial de la actividad en el cuero cabelludo a lo largo del tiempo.
- Reproduccion de experimentos: el paquete `opview` permite cargar el modelo y extraer caracteristicas de forma reproducible para replicar los resultados del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una tabla de evaluacion del conjunto publicado y que las variantes enmascaradas se reportan en el paper, pero no se incluyen cifras numericas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los checkpoints son pequenos (Frequency: 15,0 MB; Relation: tamano no disponible) y el repositorio completo ocupa 0,1 GB, por lo que caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponible en la informacion; por el tamano de los pesos (millones de parametros), cualquier GPU moderna es suficiente.
- Cabe en GPU consumer: si, dado el reducido tamano de los checkpoints.
- Opciones de despliegue: paquete `opview` (instalacion con `pip install -e .` desde el codigo del material suplementario), `huggingface_hub` y `safetensors`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (codificadores de EEG preentrenados) ni datos de rendimiento para establecer una comparacion.

## Limitaciones y advertencias

- No es un dispositivo medico: no fue construido, validado ni aprobado para diagnostico, monitorizacion, tratamiento ni ninguna decision clinica, y no debe usarse para ello.
- Requisitos estrictos de entrada: frecuencia de muestreo de 256 Hz, nombres de canales del sistema 10-20/10-05 segun el montaje `standard_1005` de MNE, y longitudes de ventana especificas por vista (Waveform y Frequency multiplos de 256 muestras; Dynamics multiplos de 16 por encima de 128; Projective multiplos de 16; Relation con soporte de 1, 2 o 4 s).
- Limitacion de montaje en Relation: solo dispone de tablas de estadisticas para las combinaciones (soporte, anclas) listadas; un montaje que requiera otra tabla lanza `KeyError`.
- Preprocesado no incluido: `features` no filtra ni referencia; el usuario debe aplicar el preprocesado de preentrenamiento (paso banda 0,1-75 Hz con notch a 50 y 60 Hz) para obtener resultados comparables.
- Las cifras de parametros de la vista Relation aparecen truncadas en la model card; no se dispone del valor completo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica a un extractor de caracteristicas) ni sobre el numero de tokens o composicion exacta del dataset de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor restringe explicitamente el uso clinico por falta de validacion.

## Enlaces

- Hugging Face: https://huggingface.co/Anony-0x3f/opview-v2-mask25
- Codigo del paquete `opview`: en el material suplementario del paper (carpeta `code`; incluye `opview/hub.py`, `opview/models/README.md` y `opview/operators/README.md`)
- Paper: no disponible en la informacion proporcionada
- Repositorio, demo o blog adicionales: no disponible en la informacion proporcionada
