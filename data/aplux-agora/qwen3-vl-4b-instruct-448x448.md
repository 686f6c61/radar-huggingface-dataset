# APLUX-Agora/Qwen3-VL-4B-Instruct-448x448

## Resumen

Qwen3-VL-4B-Instruct (448x448) es un paquete de recursos de despliegue derivado del modelo vision-lenguaje Qwen3-VL-4B-Instruct de Alibaba Qwen, publicado por APLUX-Agora dentro de su catalogo Model Farm. No se trata de un modelo entrenado desde cero, sino de una conversion cuantizada y empaquetada para ejecutarse en SoCs Qualcomm mediante el stack QNN (Qualcomm Neural Network), orientada a dispositivos AIoT. El repositorio contiene binarios por target de SoC, con ficheros `model.bin` y metadatos `model.json` que describen la precision por defecto y las rutas de las variantes.

El modelo base es un transformer vision-lenguaje de 4.000 millones de parametros aproximadamente, con entrada de imagen y texto y salida de texto, segun el pipeline declarado `image-text-to-text`. La variante publicada fija la resolucion de entrada de imagen en 448x448 pixeles, lo que reduce el coste computacional del codificador visual frente a resoluciones nativas mayores y encaja con las restricciones de memoria y ancho de banda de placas embebidas.

Su relevancia actual es practica: ofrece un camino reproducible para llevar un VLM de 4B a hardware Qualcomm concreto, con metricas medidas en placa real (16,1 tokens/s en QCS8550 con cuantizacion W4A16) y un flujo de descarga selectivo por SoC. El repo ocupa 4,2 GB y no registra descargas ni likes en el momento de la consulta, lo que indica una publicacion muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (modelo base Qwen3-VL-4B-Instruct); empaquetado para QNN |
| Parametros totales | 4B (aproximado, segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (unica precision documentada, por defecto en QCS8550) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); modelo fuente sujeto a sus propios terminos |
| Formato de pesos | Binarios QNN (`model.bin`) y metadatos `model.json` por target de SoC; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no documenta entrenamiento propio: es una conversion del modelo Qwen3-VL-4B-Instruct, un VLM con codificador visual y decoder de lenguaje transformer. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO; esos datos corresponden a la model card original de Qwen3-VL-4B-Instruct, no incluida aqui.

La innovacion tecnica del repositorio esta en el pipeline de despliegue, no en el modelo. Cada directorio `targets/<SoC>/` contiene un `model.json` con la precision por defecto y las rutas de variantes, y los binarios compilados para el runtime QNN de Qualcomm. La cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits) es la palanca principal para reducir huella de memoria en el SoC. El repositorio incluye ademas `NOTICE.md` y `SHA256SUMS` para verificacion de integridad, y el flujo de descarga permite traer solo el target del SoC relevante en lugar del paquete completo.

## Capacidades

- Generacion de texto condicionada por imagen: el pipeline declarado es `image-text-to-text`, con entradas de imagen y texto y salida de texto.
- Comprension de imagenes a resolucion fija de 448x448 pixeles.
- Respuesta a preguntas visuales (VQA) y descripcion de contenido de imagen, por herencia del modelo base Qwen3-VL.
- Conversacion multimodal multi-turno, sujeta a la longitud de contexto del modelo base (no disponible en esta ficha).
- Capacidades de codigo, matematicas y razonamiento del modelo base: no verificadas en esta publicacion; dependen de la integridad de la conversion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el listado de idiomas no se publica en el repo.
- Modo thinking explicito, vision de video o audio: no disponible.

## Casos de uso

- Inspeccion visual en el borde (edge): desplegar el modelo en una placa QCS8550 para clasificar o describir imagenes capturadas por una camara local, sin enviar datos a la nube. La cuantizacion W4A16 y los 16,1 tokens/s medidos permiten respuestas interactivas en dispositivo.
- Asistencia a operarios en campo: un dispositivo AIoT con camara envia una imagen de una pieza o etiqueta y el modelo devuelve una descripcion o una respuesta en texto; el contexto visual fijo de 448x448 es suficiente para lectura de etiquetas y reconocimiento de objetos.
- Automatizacion de inventario y control de calidad: procesar capturas de lineas de produccion en la propia placa para detectar anomalias visuales y generar informes textuales, evitando el coste de subir imagenes a un servicio remoto.
- Kioscos y terminales de atencion: integrar el modelo en un terminal con pantalla y camara para responder preguntas sobre documentos, productos o entornos fisicos, con latencia local y sin dependencia de conectividad.
- Prototipado rapido de productos VLM sobre Qualcomm: usar el flujo de descarga por SoC y el proyecto exportable de Agora para validar una idea de producto multimodal en hardware real antes de invertir en un pipeline propio de conversion.
- Evaluacion comparativa de hardware: medir throughput y latencia de un VLM de 4B en distintas placas Qualcomm usando las metricas publicadas como referencia (16,1 tokens/s en QCS8550) para dimensionar un despliegue.
- Educacion e investigacion en IA embebida: emplear el paquete como ejemplo reproducible de cuantizacion W4A16 y empaquetado QNN para estudiar el compromiso entre precision y rendimiento en SoCs.

## Benchmarks y rendimiento

La unica metrica publicada es el throughput medido en placa real con la precision por defecto:

| SoC · placa | Precision | Rendimiento medido |
|---|---|---|
| QCS8550 · Rhino Pi X1 (犀牛派 X1) | W4A16 | 16,1 tokens/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Tampoco se documentan metricas de latencia por peticion ni de tiempo hasta el primer token.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU discreta; el modelo se ejecuta en el SoC Qualcomm con memoria unificada. El repo completo ocupa 4,2 GB, y la descarga selectiva por SoC reduce el espacio necesario en disco.
- GPU recomendadas: no disponible; el target documentado es el SoC QCS8550, no una GPU de escritorio.
- Compatibilidad con GPU de consumo: no documentada. El paquete esta compilado para el runtime QNN de Qualcomm y no se declara compatible con CUDA, ROCm ni Metal.
- Opciones de despliegue: runtime QNN en placa Qualcomm; flujo de descarga via `hf download` con `--include "targets/<SoC>/*"`; guia de despliegue y proyecto exportable desde la plataforma Agora (https://mega.aidlux.com).
- Latencia y throughput: 16,1 tokens/s medidos en QCS8550 con W4A16. No se publican datos de latencia ni de throughput para otros SoC.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-448x448 (APLUX-Agora) | ~4B | no disponible | Binarios QNN para Qualcomm | APLUX Model Farm License | Hugging Face, 0 descargas |
| Qwen3-VL-4B-Instruct (modelo base) | ~4B | no disponible en esta ficha | Pesos originales del autor | Terminos del modelo fuente | Publicado por el autor original; consultar su repo |
| Otros VLM de ~4B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- La licencia APLUX Model Farm License es distinta de la del modelo fuente y puede imponer restricciones adicionales al uso comercial; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de produccion.
- El modelo fuente Qwen3-VL-4B-Instruct mantiene sus propios terminos, que se aplican en cascada; el repo no los reproduce.
- La resolucion de imagen esta fijada en 448x448, lo que limita la lectura de texto pequeno, detalles finos y documentos de alta densidad.
- Solo se documenta una precision (W4A16); la perdida de calidad frente al modelo original no se ha cuantificado en la informacion disponible.
- Solo hay un SoC validado (QCS8550); no se garantiza el funcionamiento en otras plataformas Qualcomm ni en GPU convencionales.
- No se publican idiomas soportados, longitud de contexto ni datos de sesgo o alucinacion; estos riesgos deben asumirse como los del modelo base y validarse empiricamente.
- El repositorio no registra descargas ni likes, y la fecha de creacion es muy reciente; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La integridad de los binarios debe verificarse con `SHA256SUMS` y `NOTICE.md` antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/APLUX-Agora/Qwen3-VL-4B-Instruct-448x448
- Licencia del paquete (PDF): https://huggingface.co/APLUX-Agora/Qwen3-VL-4B-Instruct-448x448/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora (despliegue y demo online): https://mega.aidlux.com
- Demo del modelo en Agora: https://mega.aidlux.com/models/qwen3-vl-4b-instruct-448x448
