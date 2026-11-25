# elnemer7/ElNeMeR-Audio-Splice-Clone-ONNX

## Resumen

ElNeMeR-Audio-Splice-Clone-ONNX es un clasificador de audio orientado a la deteccion forense de deepfakes de voz, publicado por el desarrollador elnemer7 (Mahmoud ElNemer) bajo el paraguas de ElNeMeR Digital Solutions & AI. El modelo se distribuye en formato ONNX y su proposito declarado es distinguir entre habla humana autentica y tres categorias de manipulacion vocal: clones generados con ElevenLabs/XTTS, sustituciones de voz en tiempo real mediante RVC (Retrieval-based Voice Conversion) y fragmentos de audio falsos insertados dentro de grabaciones autenticas, tipicamente notas de voz de WhatsApp o llamadas telefonicas.

La propuesta se articula como una arquitectura forense multimodelo que extrae 24 caracteristicas temporales para clasificar el audio en cuatro clases. El caso de uso central es el analisis de evidencias en contextos de verificacion de identidad, periodismo o investigacion digital, donde la deteccion de inserciones parciales resulta especialmente dificil porque el resto de la grabacion es genuina.

La relevancia del modelo es limitada y debe enmarcarse con cautela: el repositorio tiene un tamano de 0.0 GB declarado, cero descargas y cero likes en el momento de la consulta, no incluye informacion sobre el dataset de entrenamiento, metricas de evaluacion ni detalles de la arquitectura interna. Se trata, por tanto, de una publicacion incipiente cuya validez practica no puede contrastarse con datos publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de audio con 24 caracteristicas temporales, segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card describe el sistema como una "arquitectura forense multimodelo" que opera sobre 24 caracteristicas temporales para detectar empalmes (splices) y vocoders neuronales. No se especifica si el clasificador subyacente es una red convolucional, un transformer, un modelo recurrente o un ensemble de varios modelos, ni se detalla la dimension del vector de entrada, el muestreo requerido o la ventana de analisis.

Tampoco se aporta informacion sobre el corpus de entrenamiento: numero de horas de audio, composicion del dataset, proporciones por clase, fuentes de los clones sinteticos o si se aplicaron tecnicas de aumento de datos. No hay menciones a RLHF, DPO ni a ningun proceso de alineacion, algo esperable en un clasificador. La innovacion declarada se limita a la deteccion de inserciones parciales dentro de audio autentico, pero sin documentacion tecnica que permita evaluar como se implementa.

## Capacidades

- Clasificacion de audio en cuatro clases: habla humana autentica, clon de voz ElevenLabs/XTTS, sustitucion de voz RVC en tiempo real y nota de voz parcialmente empalmada.
- Deteccion de deepfakes de voz mediante analisis de 24 caracteristicas temporales.
- Orientacion a forense digital: pensado para verificar autenticidad de grabaciones de WhatsApp y llamadas telefonicas.
- Inferencia via ONNX Runtime, lo que permite despliegue en multiples plataformas (CPU, GPU, edge).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni modo thinking.
- No se especifican capacidades multilingues; el modelo clasifica audio, no transcribe ni traduce.

## Casos de uso

- Verificacion de notas de voz en mensajeria: el modelo puede clasificar un audio recibido por WhatsApp en una de las cuatro categorias, permitiendo descartar clones de ElevenLabs o inserciones parciales antes de tomar decisiones sensibles.
- Analisis forense en investigaciones de fraude: en casos de suplantacion de identidad telefonica, el clasificador aporta una senal preliminar sobre si la voz corresponde a una conversion RVC en tiempo real.
- Moderacion de contenido en plataformas de audio: integrado como filtro previo en pipelines de subida de audio, permite marcar automaticamente contenido sintetico para revision humana.
- Periodismo de verificacion: redacciones que reciben grabaciones filtradas pueden usar el modelo como primer triaje para detectar empalmes en notas de voz supuestamente originales.
- Aseguramiento en banca y seguros: en procesos de verificacion por voz, el modelo puede actuar como capa adicional de control ante intentos de suplantacion con clones neuronales.
- Investigacion academica sobre deepfakes: sirve como referencia de partida para comparar tecnicas de deteccion basadas en caracteristicas temporales frente a enfoques espectrales o basados en transformers.
- Despliegue en entornos con recursos limitados: al distribuirse en ONNX, puede ejecutarse en CPU o dispositivos edge sin dependencia de frameworks de deep learning pesados, util para herramientas de campo en forense digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio declara 0.0 GB de tamano, lo que sugiere un modelo muy ligero, pero no se confirma el peso real de los ficheros ONNX.
- GPU recomendadas: no disponible; al ser un clasificador ONNX de audio, es probable que funcione en CPU, pero el autor no documenta requisitos.
- Compatibilidad con GPU de consumo: no confirmada; por el formato y el tipo de tarea, es plausible que quepa en cualquier GPU de consumo e incluso en CPU, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime es la via natural; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Audio-Splice-Clone-ONNX | Clasificador de deepfake de audio (4 clases) | ONNX | MIT | Minima (sin dataset ni metricas) | Repositorio con 0 descargas |
| AASIST | Deteccion de spoofing de voz | PyTorch | Codigo abierto (repositorio academico) | Paper y codigo publicos | Ampliamente citado en literatura |
| RawNet2 | Deteccion de audio sintetico end-to-end | PyTorch | Codigo abierto | Paper y codigo publicos | Referencia academica |
| Wav2Vec2-based anti-spoofing | Deteccion de deepfakes con representaciones auto-supervisadas | PyTorch | Variable segun checkpoint | Papers y checkpoints en Hugging Face | Multiple |

La comparacion es estructural: los alternativas academicas cuentan con evaluaciones publicadas en datasets como ASVspoof, mientras que ElNeMeR no aporta metricas ni corpus de evaluacion, lo que impide una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de metricas: no se publican accuracy, EER, AUC ni resultados en ASVspoof u otros benchmarks, por lo que el rendimiento real es desconocido.
- Dataset de entrenamiento no documentado: se desconoce el volumen, la diversidad de voces, idiomas y condiciones acusticas, lo que impide estimar su robustez.
- Riesgo de sesgo: al no detallarse la composicion del corpus, no puede evaluarse el sesgo por genero, edad, acento o idioma.
- Riesgo de alucinacion de clase: como todo clasificador, puede asignar una etiqueta falsa con alta confianza; sin curvas de calibracion publicadas no es apto como unica evidencia en contextos legales.
- Cobertura limitada a tres familias de manipulacion (ElevenLabs/XTTS, RVC y empalmes parciales); otros generadores de voz no estan contemplados en las clases de salida.
- Advertencia de madurez: cero descargas y cero likes en el momento de la consulta, sin historial de validacion por la comunidad.
- Licencia MIT: permite uso comercial y modificacion, pero no exime al usuario de validar el modelo con sus propios datos antes de produccion.
- La model card incluye material promocional (sellos de verificacion, enlaces corporativos y telefono de contacto) que no constituye evidencia tecnica de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Audio-Splice-Clone-ONNX
- Plataforma en vivo: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
