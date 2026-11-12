# Anony-0x3f/opview-v2-30k

## Resumen

OpView V2 es un conjunto de cinco codificadores (encoders) de EEG publicados por el autor Anony-0x3f bajo licencia MIT. No es un modelo generativo ni un LLM: es un extractor de características auto-supervisado pensado para investigación en neurociencia y decodificación de señales cerebrales. Cada uno de los cinco encoders procesa la señal EEG a través de un operador fijo y sin parámetros que hace explícita una estructura concreta (forma de onda temporal, dinámica causal, potencia espectral, acoplamiento entre canales y topografía del cuero cabelludo), y cada uno se preentrenó de forma independiente con su propio objetivo auto-supervisado.

El checkpoint liberado corresponde al conjunto `30k` e incluye las cinco vistas. Los encoders se usan congelados como extractores de características: un sketch de conteo fijo convierte los estados de tokens de cada encoder en un vector de características por ventana y vista. Los troncos tienen anchura 192 y 8 cabezas de atención, con recuentos de parámetros que oscilan entre 3,7 y 5,0 millones por vista, lo que los sitúa en un régimen muy ligero y apto para hardware modesto.

La relevancia actual del modelo reside en su enfoque multi-vista sobre una misma modalidad (EEG), que permite comparar qué estructura de la señal aporta más información para una tarea de decodificación dada, y en su diseño como extractor congelado para sondas lineales, lo que reduce el coste de experimentación en investigación neurocientífica. El autor declara explícitamente que no es un dispositivo médico y que queda fuera de su alcance cualquier uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (5 encoders independientes, anchura 192, 8 cabezas de atencion) con operadores fijos sin parametros por vista |
| Parametros totales | 4.428.519 (Waveform), 4.359.792 (Dynamics), 3.739.789 (Frequency), 5.015.494 (Relation), no disponible para Projective (el texto de la model card queda truncado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; ventana de senal: multiplo de 256 muestras (Waveform y Frequency), multiplo de 16 por encima de 128 (Dynamics), multiplo de 16 (Projective), soporte de 1, 2 o 4 s (Relation); se recomienda ventana de 4 s (1024 muestras a 256 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal EEG, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

Cada una de las cinco vistas es un transformer independiente de anchura 192 y 8 cabezas de atencion, precedido por un operador fijo y sin parametros que transforma la senal EEG en una representacion con estructura explicita. La vista Waveform divide la ventana por su RMS visible y usa parches de 1 s con micro-tokens de 125 ms; su objetivo es reconstruccion enmascarada (25 % de atomos de canal de 250 ms ocultos, con perdida espectral blanqueada solo sobre las muestras ocultas). La vista Dynamics construye nivel mas 8 diferencias de retardo causal (de 1 a 128 muestras) con tokens de 62,5 ms y predice el cambio futuro a horizontes de 62,5, 125 y 250 ms. La vista Frequency usa potencia logaritmica estandarizada en grupos de 1 Hz hasta 75 Hz sobre atomos de 1, 2 y 4 s, sin fase, y se entrena como autoencoder. La vista Relation modela el acoplamiento entre canales mediante espectros cruzados de ancla sin referencia (forma y escala logaritmica, 6 bandas por atomo) y tambien es un autoencoder. La vista Projective captura la topografia del cuero cabelludo con un proyector de armonicos esfericos de grado 1 a 3 y el RMS logaritmico de tokens de 62,5 ms, entrenado como autoencoder.

Cuatro de las cinco vistas (Waveform, Dynamics, Relation y Projective) incorporan ademas dos terminos auxiliares solo de entrenamiento: retencion de potencia de banda y un auxiliar de slot, cuyas cabezas estan en los checkpoints pero no forman parte de las caracteristicas extraidas. El preentrenamiento se realizo sobre grabaciones EEG filtradas paso banda 0,1-75 Hz con notch a 50 y 60 Hz, canales defectuosos reparados por interpolacion de spline esferico y algunas fuentes referenciadas a la media. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Extraccion de caracteristicas EEG congeladas para sondas lineales y readouts ligeros.
- Cinco representaciones complementarias de la misma senal: forma de onda temporal, dinamica causal, potencia espectral, acoplamiento entre canales y topografia del cuero cabelludo.
- Comparacion entre vistas para determinar que estructura de la senal es mas informativa en una tarea de decodificacion.
- Fine-tuning experimental: el encoder Dynamics se ha ajustado de extremo a extremo a traves del mismo readout.
- Re-muestreo interno a 256 Hz mediante un remuestreador polifasico (el mismo del preentrenamiento) para senales a otras frecuencias de muestreo.
- Manejo de montajes del sistema 10-20/10-05 segun el montaje `standard_1005` de MNE, con tolerancia a mayusculas/minusculas y a prefijos `EEG ` y sufijos `-REF`, `-M1`, etc.
- Soporte de derivaciones bipolares mediante paso de coordenadas `xyz` en metros sobre esfera de 0,085 m.
- No soporta generacion de texto, tool calling, agentes ni capacidades linguisticas: es un modelo de senal.

## Casos de uso

- Investigacion en decodificacion de EEG: extraer caracteristicas congeladas de las cinco vistas y entrenar sondas lineales para tareas como clasificacion de imagenes motoras (los datasets BCI IV-2a, BNCI2015001 y Nakanishi2015 se citan en la evaluacion del autor). La ventana de 4 s (1024 muestras a 256 Hz) encaja con epocas experimentales habituales.
- Comparacion de hipotesis neurocientificas: usar las distintas vistas para contrastar si la informacion discriminativa de una tarea reside en la dinamica temporal, la potencia espectral, el acoplamiento inter-canal o la topografia, con el mismo pipeline de readout.
- Analisis de acoplamiento funcional: la vista Relation, que lee anclas de espectro cruzado en 6 bandas y soporta montajes de al menos 3 canales, permite estudiar conectividad entre regiones sin entrenar un modelo desde cero.
- Estudio de topografia espacial: la vista Projective, con proyector de armonicos esfericos de grado 1 a 3, sirve para analisis de distribucion espacial de la actividad sobre el cuero cabelludo con montajes de al menos 4 canales en direcciones distintas.
- Experimentos de fine-tuning con recursos limitados: con 3,7-5,0 M de parametros por vista y pesos de 15-18 MB, es viable ajustar el encoder Dynamics de extremo a extremo en una unica GPU de consumo para adaptarlo a un paradigma concreto.
- Preprocesado y prototipado rapido en laboratorio: el paquete `opview` permite cargar el modelo desde el repo y extraer caracteristicas en pocas lineas, lo que facilita iterar sobre ventanas, montajes y frecuencias de muestreo antes de comprometerse con un pipeline mayor.
- Reproduccion de la evaluacion del paper: el codigo incluye los brazos de inicializacion aleatoria y de operador, los datasets de evaluacion y la sonda Compass, lo que permite replicar los experimentos de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos de cada vista ocupan entre 15,0 y 17,7 MB (Relation y Projective no disponibles por truncamiento de la model card), por lo que el modelo completo cabe holgadamente en cualquier GPU de consumo con varios GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama media son mas que suficientes para extraccion de caracteristicas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el paquete `opview` (instalacion con `pip install -e .` desde el codigo suplementario del paper) junto con `huggingface_hub` y `safetensors`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (encoders EEG auto-supervisados multi-vista) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un dispositivo medico: el autor declara explicitamente que no fue construido, validado ni aprobado para diagnostico, monitorizacion, tratamiento ni ninguna decision clinica, y que no debe usarse para ello.
- Requiere senal EEG con preprocesado concreto: filtrado 0,1-75 Hz con notch a 50 y 60 Hz; la funcion `features` no filtra ni re-referencia, por lo que el usuario debe aplicar ese preprocesado por su cuenta.
- Frecuencia de muestreo: el modelo espera 256 Hz; otras frecuencias se remuestrean internamente, y se recomienda remuestrear grabaciones completas antes de cortar ventanas para evitar efectos de borde.
- Restricciones de montaje: Relation necesita al menos 3 canales y solo soporta las tablas de estadisticas (soporte, anclas) listadas en `relation/config.json`; un montaje que requiera otra tabla lanza `KeyError`. Projective necesita al menos 4 canales en direcciones distintas.
- Restricciones de ventana: Waveform y Frequency exigen T multiplo de 256 muestras; Dynamics, multiplo de 16 por encima de 128; Projective, multiplo de 16; Relation, soporte de 1, 2 o 4 s con atomos semisolapados que cubran la ventana.
- Canales bipolares: no tienen posicion unica; es obligatorio pasar coordenadas `xyz` en lugar de nombres de canal.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las caracteristicas extraidas pueden no ser informativas para tareas fuera de la distribucion de preentrenamiento; no se documentan sesgos especificos.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero el autor restringe explicitamente el uso clinico por motivos de validacion, no por la licencia.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente.
- La model card esta truncada en la informacion proporcionada: faltan el recuento de parametros y el tamano de pesos de la vista Projective, asi como el resto del texto posterior.

## Enlaces

- Hugging Face: https://huggingface.co/Anony-0x3f/opview-v2-30k
- Codigo y material suplementario del paper: referenciado en la model card como paquete `opview` (incluye `opview/hub.py`, `opview/models/README.md`, `opview/operators/README.md`, `scripts/export_hf.py`, `scripts/extract_features.py`, `scripts/fit_relation_tables.py`); no se proporciona URL directa en la informacion disponible.
- Paper: no disponible en la informacion proporcionada.
