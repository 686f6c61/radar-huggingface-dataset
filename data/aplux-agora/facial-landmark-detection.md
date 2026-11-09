# APLUX-Agora/Facial-Landmark-Detection

## Resumen

Facial-Landmark-Detection es un modelo de detección de puntos clave faciales (keypoint detection) publicado por APLUX-Agora dentro de su plataforma Agora, orientada a despliegue de modelos de IA en hardware Qualcomm para escenarios AIoT. El modelo resuelve la tarea de localizar landmarks faciales sobre una imagen de entrada y devuelve tanto las coordenadas de los puntos clave como una salida auxiliar en formato JSON. Su interés principal no reside en el algoritmo en sí, sino en que se distribuye como recursos ya convertidos y validados placa a placa para SoCs Qualcomm concretos, con latencias medidas en hardware real.

La publicación se organiza por targets de sistema en chip: cada directorio `targets/<SoC>/` contiene un `model.json` con la precisión por defecto y las rutas de las variantes, además de un subdirectorio por precisión con los binarios contextuales (`model.bin`). Las precisiones soportadas son FP16, W8A16 y W8A8 según la placa, y las latencias declaradas por el autor son de 1,8 ms en QCS6490 (Rhino Pi A1) y 0,6 ms en QCS8550 (Rhino Pi X1) con la precisión por defecto.

El repositorio de Hugging Face aparece con un tamaño de 0.0 GB y sin descargas ni likes en el momento de la consulta, lo que sugiere que los pesos no están alojados directamente en el repo o que el contenido aún no se ha materializado. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card se centra en el empaquetado para despliegue y no documenta el diseño de la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun SoC) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (license: other); modelo fuente sujeto a los terminos del modelo original |
| Formato de pesos | binarios contextuales QNN (`model.bin`) empaquetados por Model Farm; `model.json` como manifiesto |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (tipo de red, numero de capas, backbone, etc.) en la documentacion proporcionada. La model card solo describe el pipeline de despliegue: tarea de keypoint detection, entrada de tipo imagen y salidas de tipo keypoints y JSON, con recursos organizados por SoC y precision.

Tampoco se documentan los datos de entrenamiento, el numero de tokens o imagenes, la composicion del dataset ni si hubo etapas de ajuste fino o alineamiento. Lo unico verificable es el proceso de conversion y validacion: el autor indica que los recursos se han convertido y medido en placas Qualcomm reales mediante la plataforma Agora, usando el preprocesado y los ejemplos oficiales de Model Farm. Se incluyen `NOTICE.md` y `SHA256SUMS` para trazabilidad e integridad de los artefactos.

## Capacidades

- Deteccion de puntos clave faciales (facial landmarks) sobre imagenes de entrada.
- Salida estructurada: coordenadas de keypoints mas una salida adicional en JSON.
- Ejecucion en hardware Qualcomm mediante binarios QNN contextuales, con variantes de precision FP16, W8A16 y W8A8.
- Despliegue validado placa a placa: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Integracion con flujos de la plataforma Agora, incluyendo guia de despliegue y exportacion de proyectos.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no aplica / no disponible.
- Capacidades especiales (thinking mode, vision general, audio): no disponibles mas alla de la deteccion de landmarks.

## Casos de uso

- Desbloqueo facial en dispositivos IoT: el modelo puede localizar landmarks faciales en el dispositivo antes de una etapa de reconocimiento o verificacion, con latencias de 0,6 a 1,8 ms que permiten ejecucion en tiempo real en SoCs de gama AIoT.
- Seguimiento de mirada y atencion en pantallas interactivas: los puntos clave permiten estimar orientacion de la cabeza y direccion de la mirada en kioscos o paneles digitales, ejecutando la inferencia localmente en QCS6490 o QCS8550.
- Preprocesado para pipelines de reconocimiento facial: alinear y normalizar rostros antes de pasarlos a un modelo de embeddings, usando los landmarks como referencia geometrica.
- Efectos y filtros en tiempo real en camaras embebidas: aplicacion de filtros, avatares o retoques que dependen de la posicion de ojos, nariz y boca, con la ventaja de la baja latencia medida en placa.
- Analisis de expresiones y comunicacion no verbal: extraccion de geometria facial para clasificadores posteriores de emocion o fatiga en entornos de automocion o industria.
- Control de acceso y presencia en dispositivos de borde: deteccion de rostro y landmarks como etapa previa a la autenticacion, manteniendo los datos biometricos en el dispositivo gracias al despliegue en hardware Qualcomm.
- Telemetria y validacion de calidad en fabricacion: verificacion de que la camara y el pipeline de vision de un producto embebido funcionan correctamente mediante la deteccion de landmarks en imagenes de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona latencias medidas en hardware:

| SoC · placa | Precisiones | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 1,8 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 0,6 ms |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta orientado a aceleradores NPU/DSP integrados en SoCs Qualcomm, no a GPU de escritorio.
- Hardware validado: QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1).
- GPU recomendadas: no aplica; el despliegue objetivo es QNN sobre SoCs Qualcomm.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecucion en RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: runtime QNN con binarios contextuales gestionados por la plataforma Agora; vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia: 1,8 ms en QCS6490 y 0,6 ms en QCS8550 con la precision por defecto segun el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de landmarks faciales ni datos de rendimiento que permitan una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- No se documenta la arquitectura, el dataset de entrenamiento ni el origen exacto del modelo fuente, lo que dificulta evaluar su robustez y generalizacion.
- Riesgo de sesgo desconocido: al no publicarse la composicion del dataset, no es posible valorar sesgos demograficos en la deteccion de landmarks.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de detecciones erroneas o landmarks mal localizados en condiciones de oclusion, iluminacion adversa o rostros no frontales; no se documentan metricas de error.
- El modelo esta empaquetado para SoCs Qualcomm concretos; fuera de esos targets no hay garantia de funcionamiento ni de rendimiento.
- La licencia es `other` con nombre APLUX Model Farm License, aplicable a los recursos convertidos; el modelo fuente queda sujeto a los terminos del modelo original. Es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de un uso comercial.
- El repositorio figura con 0.0 GB y sin descargas, por lo que conviene verificar la disponibilidad real de los artefactos antes de integrarlo en produccion.
- No hay informacion sobre mantenimiento, versionado ni soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/Facial-Landmark-Detection
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Facial-Landmark-Detection/blob/main/LICENSE_MODEL_FARM.pdf
- Prueba online en Agora: https://mega.aidlux.com/models/facial-landmark-detection
- Plataforma Agora: https://mega.aidlux.com
