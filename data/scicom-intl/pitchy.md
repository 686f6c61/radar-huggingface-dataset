# Scicom-intl/pitchy

## Resumen

Pitchy es un estimador de frecuencia fundamental (F0) desarrollado por Scicom-intl, distribuido como un grafo ONNX acompanado de los pesos originales en PyTorch. A diferencia de los trackers de pitch orientados a voz limpia de laboratorio, Pitchy se entrena y evalua especificamente sobre las condiciones degradadas que aparecen en sistemas de audio reales: lineas telefonicas con codecs de 8 kHz, salas con reverberacion y ruido ambiental a relaciones senal-ruido de 5 y 0 dB. El modelo consume audio mono a 16 kHz y produce una matriz de saliencia de pitch en la rejilla de CREPE (360 bins, 20 cents desde 32,70 Hz) junto con una decision de voicing por frame, con una resolucion temporal de 10 ms.

Tecnicamente es un modelo muy compacto: 3,78 millones de parametros, 19,6 MB de pesos y un coste de 0,010 segundos de un solo hilo de CPU por segundo de audio procesado, con un pico de memoria de 239 MB para una senal de 30 segundos. Esa relacion coste/error lo situa como una pieza viable para preprocesado en tiempo real dentro de pipelines de TTS, verificacion de locutor o analisis prosodico, donde modelos mas pesados como CREPE o RMVPE resultan prohibitivos en CPU.

La relevancia actual del modelo radica en su rendimiento comparado: en el conjunto de test de PTDB-TUG, sobre todas las condiciones agregadas, obtiene un error de frame de F0 (FFE) del 4,17 % frente al 9,61 % del mejor tracker publicado en esa misma metrica (RMVPE). La familia incluye dos variantes adicionales, Pitchy-Sing (entrenada tambien con canto) y Pitchy-Mix (fusion de ambas para servir voz y musica con un solo modelo), documentadas en subdirectorios del mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward sobre representacion mel; salida de saliencia de pitch en rejilla CREPE (360 bins) y voicing por frame |
| Parametros totales | 3,78 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio continuo; T = N // 160 + 1 frames, frame i centrado en i x 10 ms) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX y safetensors en precision original) |
| Idiomas soportados | no disponible (modelo acustico independiente del idioma) |
| Licencia | other (consultar terminos en el repositorio; los pesos de RMVPE usados como fuente de etiquetas tienen clausula de uso exclusivamente investigador) |
| Formato de pesos | ONNX (`pitchy.onnx`) y safetensors (`pitchy.safetensors`) con `config.json` |

## Arquitectura y entrenamiento

Pitchy es una red neuronal compacta que opera sobre audio a 16 kHz y predice, para cada frame de 10 ms, una distribucion de saliencia sobre 360 bins de frecuencia fundamental espaciados 20 cents en el rango que cubre CREPE (desde 32,70 Hz). La probabilidad de voicing se deriva del pico de esa distribucion: un frame se considera voiced cuando el pico supera 0,869, umbral ajustado exclusivamente sobre los hablantes de desarrollo de PTDB-TUG. La salida es por tanto compatible con la rejilla de CREPE, lo que facilita sustituir trackers mas costosos en pipelines existentes sin reentrenar el consumidor aguas abajo.

El entrenamiento combina datos reales y sinteticos. La mitad del audio de entrenamiento es LibriTTS-R train-clean-100 (CC BY 4.0); el resto se genera mediante resintesis con WORLD, lo que permite disponer de etiquetas de pitch controladas. Las etiquetas de referencia se obtienen con RMVPE (pesos RVC, licencia MIT con clausula de uso investigador) y FCPE (MIT). La revision `w7_rv_hold10` incorpora ademas un 10 % de ejemplos con una vocal sostenida entre 0,5 y 2 segundos, correccion dirigida a un fallo detectado en la primera version: el modelo clasificaba como unvoiced vocales sostenidas y perdia voicing hasta 1,84 s en habla TTS alta. La revision actual mantiene el voicing en el 100 % de una vocal sostenida de 1,5 s (antes 52 %) y en el 99 % de frames ante un salto brusco de +3 semitones (antes 79 %).

## Capacidades

- Estimacion de F0 frame a frame con resolucion de 10 ms y salida de saliencia de 360 bins compatible con la rejilla de CREPE.
- Decision de voicing por frame con umbral calibrado (0,869) sobre hablantes de desarrollo de PTDB-TUG.
- Robustez especifica frente a ruido real a 5 y 0 dB SNR, reverberacion de sala y codecs telefonicos de 8 kHz.
- Ejecucion en CPU: 0,010 s de un hilo por segundo de audio, con pico de memoria de 239 MB en senales de 30 s.
- Inferencia via ONNX Runtime (solo numpy y onnxruntime) o via PyTorch (torch, numpy y safetensors).
- Coincidencia numerica entre el grafo ONNX y el modulo PyTorch: 0,0002 cents en habla y 0,0102 cents en un tono puro de 30 s, con el 100 % de acuerdo en las decisiones de voicing.
- No soporta tool calling, agentes, vision, audio generativo ni capacidades multilingues en el sentido de un LLM; es un componente acustico especializado.
- Variantes adicionales en el mismo repositorio: Pitchy-Sing (canto e instrumentos) y Pitchy-Mix (voz y musica en un unico modelo).

## Casos de uso

- Filtrado de pitch en pipelines de TTS: el modelo permite detectar y corregir contornos de F0 atipicos antes de la sintesis; su coste de 0,010 s por segundo de audio en un solo hilo de CPU lo hace viable como etapa de preprocesado en produccion sin GPU.
- Analisis prosodico de grabaciones telefonicas: con FFE del 4,13 % en condiciones de codecs de 8 kHz (frente al 6,98 % de RAPT), es adecuado para extraer entonacion en centros de atencion o audios de call center donde otros trackers degradan su voicing.
- Verificacion de locutor y anti-spoofing: la saliencia de pitch y el voicing por frame sirven como caracteristicas de entrada para clasificadores de habla sintetica o de coherencia prosodica en sistemas de autenticacion.
- Monitorizacion de calidad de voz en reuniones y salas reverberantes: con FFE del 4,66 % en salas reales (frente al 8,92 % de RMVPE), permite medir estabilidad de pitch y detectar problemas de microfono en grabaciones de conferencia.
- Preprocesado para reconocimiento de emociones o habla: la salida de 360 bins por frame se integra directamente en modelos aguas abajo que ya consumen la rejilla de CREPE, sustituyendo a trackers mas pesados en entornos con CPU limitada.
- Analisis de canto e instrumentos con Pitchy-Sing: con FFE del 18,0 % en MDB-stem-synth (frente al 27,2 % del modelo base), sirve para transcripcion melodica o alineamiento en aplicaciones musicales donde el audio puede ser voz o instrumento.
- Despliegue en dispositivos edge: el tamano de 19,6 MB y la ejecucion en un solo hilo de CPU permiten integrarlo en sistemas embebidos o moviles para analisis de pitch en tiempo real sin acelerador.

## Benchmarks y rendimiento

F0 frame error (FFE), gross pitch error (GPE) y voicing decision error (VDE) en porcentaje; menor es mejor. Todos los umbrales y retardos de frame se ajustaron solo sobre hablantes de desarrollo de PTDB-TUG. La columna "mejor publicado" recoge el menor FFE entre 14 trackers publicados por fila.

| Conjunto | Condiciones | Pitchy FFE | GPE | VDE | Mejor publicado | FFE | GPE | VDE |
|---|---|---|---|---|---|---|---|---|
| PTDB-TUG test | Limpio | 3,37 | 1,38 | 3,06 | FCNF0++ | **3,04** | 1,49 | 2,70 |
| PTDB-TUG test | Ruido real, 5 y 0 dB | **4,80** | 1,88 | 4,40 | RMVPE | 12,78 | 1,51 | 12,49 |
| PTDB-TUG test | Salas reales | **4,66** | 2,08 | 4,22 | RMVPE | 8,92 | 1,33 | 8,69 |
| PTDB-TUG test | Linea telefonica (codecs 8 kHz) | **4,13** | 1,63 | 3,77 | RAPT | 6,98 | 7,45 | 5,38 |
| PTDB-TUG test | Sala, ruido y linea | **5,05** | 2,27 | 4,58 | SwiftF0 | 14,26 | 2,07 | 13,99 |
| PTDB-TUG test | Todas las condiciones | **4,17** | 1,72 | 3,80 | RMVPE | 9,61 | 1,47 | 9,34 |
| Keele | Limpio | 5,33 | 0,44 | 5,12 | RAPT | **5,04** | 2,12 | 3,98 |
| Keele | Ruido real, 5 y 0 dB | **12,36** | 0,82 | 12,03 | RMVPE | 16,50 | 1,22 | 16,02 |
| Keele | Salas reales | **11,54** | 1,22 | 11,03 | RMVPE | 21,02 | 1,02 | 20,66 |
| Keele | Linea telefonica (codecs 8 kHz) | **7,03** | 1,04 | 6,54 | YAAPT | 8,99 | 3,88 | 7,18 |
| Keele | Sala, ruido y linea | **11,80** | 1,21 | 11,29 | YAAPT | 21,44 | 8,74 | 17,41 |
| Keele | Todas las condiciones | **8,79** | 0,76 | 8,46 | RMVPE | 14,86 | 0,90 | 14,51 |
| FDA | Limpio | **4,02** | 0,40 | 3,88 | RMVPE | 4,25 | 0,21 | 4,17 |
| FDA | Ruido real, 5 y 0 dB | **6,47** | 1,17 | 6,08 | RMVPE | 11,72 | 0,66 | 11,52 |
| FDA | Salas reales | **6,26** | 0,92 | 5,96 | RMVPE | 13,70 | 0,68 | 13,52 |
| FDA | Linea telefonica (codecs 8 kHz) | **4,65** | 0,66 | 4,42 | RAPT | 6,74 | 3,85 | 5,45 |
| FDA | Sala, ruido y linea | **6,56** | 1,03 | 6,23 | RMVPE | 16,84 | 0,85 | 16,64 |
| FDA | Todas las condiciones | **5,20** | 0,72 | 4,95 | RMVPE | 9,32 | 0,42 | 9,20 |

Nota: en PTDB-TUG, cuatro de los 14 trackers comparados fueron entrenados con ese mismo conjunto; Keele y FDA estan libres de esa contaminacion. Pitchy solo gana en FFE, no en GPE ni VDE, en varias filas.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU. Pico de memoria RAM de 239 MB procesando una senal de 30 s.
- GPU recomendadas: no aplica; no se documenta despliegue en GPU. Cualquier GPU moderna podria ejecutar el grafo ONNX, pero el modelo no esta optimizado para ello.
- Cabe en cualquier CPU de consumo: 3,78 M de parametros y 19,6 MB de pesos. El coste es de 0,010 s de un hilo de CPU por segundo de audio.
- Opciones de despliegue: ONNX Runtime (dependencias: numpy y onnxruntime) mediante `pitchy_onnx.py`; PyTorch (torch, numpy y safetensors) mediante `pitchy_torch.py` y `pitchy.safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput estimado: aproximadamente 100 segundos de audio procesados por segundo de CPU de un solo hilo, segun el coste declarado de 0,010 s por segundo de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | FFE global PTDB-TUG | FFE global Keele | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pitchy | 3,78 M | Red compacta sobre mel, salida en rejilla CREPE | **4,17 %** | **8,79 %** | other | ONNX + safetensors en Hugging Face |
| RMVPE | no disponible | Modelo profundo de estimacion de pitch | 9,61 % | 14,86 % | MIT con clausula de uso investigador (pesos RVC) | Pesos publicos |
| CREPE | no disponible | CNN sobre waveform, rejilla de 360 bins | no disponible en la tabla por fila | no disponible en la tabla por fila | MIT | Pesos publicos |
| RAPT | no disponible | Algoritmo clasico de autocorrelacion | mejor en linea telefonica PTDB-TUG (6,98 %) | mejor en limpio Keele (5,04 %) | no disponible | Implementaciones multiples |

Los datos de RMVPE, CREPE y RAPT provienen de la tabla comparativa de la model card de Pitchy; no se dispone de sus recuentos de parametros ni de sus licencias completas en la informacion proporcionada.

## Limitaciones y advertencias

- En condiciones limpias, Pitchy no supera al mejor tracker publicado: FFE del 3,37 % frente al 3,04 % de FCNF0++ en PTDB-TUG, y del 5,33 % frente al 5,04 % de RAPT en Keele. Su ventaja se concentra en condiciones degradadas.
- El GPE y el VDE son peores que los de RMVPE en varias filas (por ejemplo, GPE del 1,72 % frente al 1,47 % en PTDB-TUG global); el modelo prioriza reducir errores de frame, no la precision de los contornos voiced.
- En Keele con ruido real, el FFE sube al 12,36 % y el VDE al 12,03 %, lo que refleja perdida de frames voiced en ruido intenso; la propia model card reconoce este retroceso respecto a la primera version (7,57 % en Keele para `first-release`).
- La primera version (`first-release`) tenia fallos graves de voicing en vocales sostenidas y en habla TTS alta; debe usarse la revision `w7_rv_hold10` o posterior para produccion.
- La licencia es "other" y no se detallan sus terminos en la informacion disponible; es imprescindible revisar el repositorio antes de un uso comercial. Ademas, las etiquetas de entrenamiento derivan de RMVPE, cuyos pesos RVC incluyen una clausula de uso exclusivamente investigador, lo que puede condicionar la redistribucion.
- El modelo es un componente acustico especializado: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse como un LLM.
- No se documentan sesgos por idioma o locutor mas alla de los conjuntos de evaluacion (PTDB-TUG, Keele, FDA), por lo que el comportamiento en lenguas o acentos no representados es desconocido.
- La resolucion de 10 ms y la rejilla de 20 cents imponen un limite de precision intrinseco; para analisis musical fino puede ser preferible Pitchy-Sing o modelos especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/pitchy
- Model card de Pitchy-Sing: `sing/README.md` dentro del repositorio
- Model card de Pitchy-Mix: `mix/README.md` dentro del repositorio
- Codigo de inferencia ONNX: `pitchy_onnx.py` en el repositorio
- Codigo de inferencia PyTorch: `pitchy_torch.py` y `pitchy.safetensors` en el repositorio
- Figuras de resultados: `figures/fig_teaser.png`, `figures/fig_fail_pitchy.png`, `figures/fig_speed.png`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
