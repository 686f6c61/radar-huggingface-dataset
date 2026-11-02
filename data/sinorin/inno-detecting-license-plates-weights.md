# Sinorin/inno-detecting-license-plates-weights

## Resumen

`inno-detecting-license-plates-weights` es un conjunto de pesos publicados en HuggingFace por el usuario Sinorin, correspondientes a la parte de reconocimiento optico de caracteres (OCR) de un proyecto de deteccion y lectura de matriculas de vehiculos sobre el dataset CCPD2019. El artefacto principal es un reconocedor CRNN (red convolucional recurrente) entrenado con pérdida CTC que transcribe el texto de un recorte de matricula en escala de grises. El modelo procede de un proyecto de curso alojado en GitHub (`S1norin/inno-detecting-license-plates`) y no constituye un modelo de lenguaje, sino un componente de vision por computador especializado.

El reconocedor es deliberadamente pequeno: 2.999.419 parametros, entrada de 48x256 pixeles en un solo canal y un vocabulario cerrado de 58 caracteres mas el token CTC en blanco. Se entreno durante 50 epocas sobre 3.500 recortes de entrenamiento y 700 de validacion, exclusivamente en CPU, y se selecciono la epoca 43 por maxima precision de caracter en validacion (0,7430). En el conjunto de test con protocolo `ocr_only` alcanza una precision de caracter de 0,7538 y un exact match de matricula completa de 269/800 (F1 0,7097).

Su relevancia es acotada: no compite con modelos fundacionales ni con OCR genericos de proposito general, sino que documenta de forma inusualmente completa (hash SHA-256 del checkpoint, registro de entrenamiento por epoca, digests del charset y del dataset) un pipeline de OCR de matriculas reproducible y ligero. Resulta util como referencia para quien necesite un reconocedor de matriculas de bajo coste computacional o quiera auditar el proceso de entrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (CNN + BiLSTM + CTC): 4 bloques Conv/BN/ReLU/pool (32/64/128/128 canales), proyeccion de secuencia 384→256, 2 capas BiLSTM (hidden size 256), clasificador 512→59 con CTC |
| Parametros totales | 2.999.419 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen 48x256 px) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (vocabulario cerrado de 58 caracteres, indices 1–58; token CTC en blanco en indice 0) |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), SHA-256 `540cba378cc0ff1dee948a5995ff576467562f6dfe00512db2fd94ca7124747f` |

## Arquitectura y entrenamiento

La red es un CRNN clasico para reconocimiento de texto en imagenes. La parte convolucional consta de cuatro bloques Conv/BN/ReLU/pool con 32, 64, 128 y 128 canales respectivamente, seguidos de una proyeccion de secuencia de 384 a 256 dimensiones. Sobre esa secuencia se aplican dos capas de LSTM bidireccional con tamano oculto 256, y la salida se proyecta de 512 a 59 clases que se decodifican con CTC (una clase en blanco mas 58 caracteres). El checkpoint embebe el charset completo de entrenamiento, su digest SHA-256, la arquitectura y los metadatos de la epoca seleccionada, lo que facilita la trazabilidad del artefacto.

El entrenamiento se realizo sobre recortes a escala original: 3.500 muestras de entrenamiento y 700 de validacion, semilla 42, optimizador Adam con learning rate 0,001, perdida CTC, 50 epocas y ejecucion exclusivamente en CPU (torch 2.6.0+cpu, Python 3.12.12). La entrada es una imagen en escala de grises de 48x256 con relacion de aspecto preservada, relleno negro a la derecha y abajo y pixeles normalizados al rango [-1, 1]. Se selecciono la epoca 43 por maxima precision de caracter en validacion. El repositorio incluye ademas `training_record.json` con la configuracion, las metricas de las 50 epocas, los digests de dataset y charset y el entorno de ejecucion. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento de texto de matriculas de vehiculos a partir de recortes en escala de grises (48x256 px).
- Transcripcion a nivel de caracter sobre un vocabulario cerrado de 58 simbolos (indices 1–58) mas el token CTC en blanco.
- Decodificacion CTC con politica congelada, modo `none` y umbral tau 0,50 en los experimentos reportados.
- Modo de evaluacion de extremo a extremo (`end_to_end`) combinable con un detector YOLO11s para localizar y leer la matricula en la imagen completa.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingues generales: el charset es fijo y especifico del dataset de entrenamiento.
- No incluye modo de pensamiento, vision general, audio ni otras modalidades.

## Casos de uso

- Lectura de matriculas en accesos controlados: el modelo transcribe el recorte de matricula capturado por una camara fija en un parking o garita, con un coste computacional minimo (menos de 3 millones de parametros) que permite ejecutarlo en CPU junto al detector.
- Pipeline de peaje o control de trafico: combinado con el detector YOLO11s del mismo proyecto, se usa en modo `end_to_end` para localizar la matricula y leerla; el protocolo reportado cubre el 97,62 % de las muestras de test.
- Prototipado academico y docencia: sirve como referencia reproducible de un pipeline CRNN+CTC completo, con registro de entrenamiento por epoca, digests de dataset y charset y script de inferencia en el repositorio de GitHub.
- Auditoria de artefactos de ML: el checkpoint embebe arquitectura, charset y hash, y el repo publica el SHA-256 del fichero, lo que facilita verificar integridad y reproducir la evaluacion.
- Filtrado o triaje previo en sistemas de vision: al ser tan ligero, puede ejecutarse como primer paso que descarte recortes con baja confianza antes de invocar un OCR mas costoso.
- Despliegue en dispositivos con recursos limitados: al haberse entrenado y evaluado solo en CPU, es viable en entornos sin GPU para tareas de lectura de matriculas de bajo volumen.

## Benchmarks y rendimiento

Resultados del autor sobre 800 muestras de test, politica congelada, modo `none`, tau 0,50:

| Protocolo | Cobertura | Precision de caracter | Matriculas exactas | F1 |
|---|---:|---:|---:|---:|
| `ocr_only` | 1,0000 | 0,7538 | 269/800 | 0,7097 |
| `end_to_end` | 0,9762 | 0,6561 | 133/800 | 0,5226 |

Metricas de validacion en la epoca 43 (seleccionada): precision de caracter 0,7430 y exact match de matricula 0,3243 (227/700).

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2.999.419 parametros en precision completa el checkpoint ocupa del orden de decenas de MB, y el repo reporta un tamano de 0,0 GB.
- GPU recomendadas: no requiere GPU; el entrenamiento y la evaluacion documentados se ejecutaron exclusivamente en CPU (torch 2.6.0+cpu).
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU sin problema; tambien es viable en dispositivos embebidos por su tamano.
- Opciones de despliegue: carga directa con PyTorch usando el codigo de `models/crnn/` del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `inno-detecting-license-plates-weights` (CRNN) | 2.999.419 | no aplica (imagen 48x256) | no disponible | HuggingFace + GitHub |
| Alternativas de OCR de matriculas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El exact match de matricula completa es bajo: 0,3243 en validacion (227/700) y 269/800 en test `ocr_only`; un tercio de lecturas correctas implica que no es apto para produccion sin verificacion adicional.
- En modo `end_to_end` el rendimiento cae de forma notable: precision de caracter 0,6561 y solo 133/800 matriculas exactas (F1 0,5226), con cobertura 0,9762.
- El vocabulario esta cerrado a 58 caracteres del dataset de entrenamiento; no reconoce simbolos fuera de ese charset ni matriculas de formatos no vistos.
- Entrenado con solo 3.500 recortes y 50 epocas en CPU, lo que limita la generalizacion a condiciones de iluminacion, angulo o resolucion distintas de las del dataset CCPD2019.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- El repositorio de HuggingFace no incluye el detector YOLO11s ni el fine-tune `best.pt` del proyecto; solo contiene el reconocedor CRNN y su registro de entrenamiento.
- Riesgo de alucinacion a nivel de caracter: la decodificacion CTC puede producir transcripciones plausibles pero incorrectas, especialmente en recortes de baja calidad.
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla de las metricas reportadas.

## Enlaces

- HuggingFace: https://huggingface.co/Sinorin/inno-detecting-license-plates-weights
- Repositorio GitHub del proyecto: https://github.com/S1norin/inno-detecting-license-plates
- Informe completo del CRNN: https://github.com/S1norin/inno-detecting-license-plates/blob/main/models/crnn/REPORT.md
- Pesos preentrenados del detector YOLO11s (upstream): https://huggingface.co/morsetechlab/yolov11-license-plate-detection
