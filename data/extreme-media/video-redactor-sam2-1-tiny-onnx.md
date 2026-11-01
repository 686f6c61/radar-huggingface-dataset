# Extreme-Media/video-redactor-sam2.1-tiny-onnx

## Resumen

`Extreme-Media/video-redactor-sam2.1-tiny-onnx` es una exportación a ONNX del modelo **SAM 2.1 tiny** (`sam2.1_hiera_tiny.pt`) de Meta Platforms, publicada por Extreme-Media como artefacto de distribución para su aplicación de escritorio *Video Redactor*. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un sistema de segmentación y seguimiento de objetos en vídeo (video object tracking) que la aplicación descarga en el primer uso y ejecuta localmente mediante ONNX Runtime, sin enviar vídeo a ningún servidor.

El paquete no es un runtime genérico de SAM 2. El predictor original se ha troceado en cuatro grafos ONNX (`enc.onnx`, `dec.onnx`, `menc.onnx`, `mattn.onnx`) más un fichero de tensores constantes (`consts.npz`), y está acoplado al código JavaScript de la aplicación: propaga un único objeto a partir de un prompt de caja (box-prompted) a lo largo del vídeo. Los pesos entrenados no se han modificado; solo cambia la forma de exportación y algunos detalles de implementación (banco de memoria de tamaño fijo, atención de memoria con 7 fotogramas y 16 punteros de objeto, y codificación posicional rotatoria reescrita con aritmética real para permitir la exportación).

Su relevancia es acotada pero clara: sirve como referencia práctica de cómo empaquetar SAM 2.1 tiny para inferencia local en CPU/GPU de consumo con ONNX Runtime, con verificación de integridad por SHA-256 por fichero. El repositorio ocupa unos 0,2 GB y los pesos suman aproximadamente 168 MB en float32, con tamaño de imagen de 512 y opset 17.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (Hiera tiny) exportado a ONNX: encoder de imagen, prompt encoder + mask decoder, memory encoder y memory attention como grafos separados |
| Parametros totales | no disponible (el autor no publica el recuento; el repo pesa 0,2 GB y los pesos ≈ 168 MB en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; banco de memoria fijo de 7 fotogramas y 16 punteros de objeto |
| Tipos de cuantizacion | no disponible (los ficheros publicados son float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) + `consts.npz`; tamaño de imagen 512 |

## Arquitectura y entrenamiento

SAM 2.1 es la evolución del Segment Anything Model para vídeo: un encoder de imagen basado en Hiera (jerárquico y eficiente), un prompt encoder que acepta puntos, cajas o máscaras, un mask decoder que produce máscaras, un memory encoder que condensa la información de fotogramas pasados y un módulo de memory attention que condiciona el fotograma actual con esa memoria. La variante *tiny* es la de menor capacidad de la familia SAM 2.1. El entrenamiento original es responsabilidad de Meta y no se detalla en la información disponible de esta exportación.

La modificación de Extreme-Media es puramente de despliegue: el predictor se divide en cuatro grafos ONNX más un fichero de constantes, la atención de memoria opera sobre un banco de memoria de tamaño fijo (7 fotogramas) y 16 punteros de objeto, y la codificación posicional rotatoria se reescribe con aritmética real para que sea exportable. Los pesos entrenados se mantienen sin cambios, según indica el aviso de modificación (NOTICE). No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación de objetos en imagen a partir de prompts (en esta exportación, prompt de caja).
- Seguimiento de un único objeto a lo largo de un vídeo mediante propagación con memoria.
- Ejecución local con ONNX Runtime, sin dependencia de servicios en la nube.
- Verificación de integridad de cada fichero por SHA-256 antes de cargarlo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingües (modelo de visión).
- No dispone de modo *thinking*, audio ni otras modalidades.

## Casos de uso

- Redacción de vídeo (anonimización): la aplicación *Video Redactor* usa el modo *Accurate* para seguir una cara, matrícula u objeto marcado con una caja y aplicar desenfoque o censura fotograma a fotograma; el modelo es adecuado porque propaga la máscara con memoria entre fotogramas y corre en local.
- Edición y postproducción con seguimiento de objeto: seleccionar un objeto en el primer fotograma y obtener su máscara a lo largo del clip para aplicar correcciones de color o efectos.
- Investigación en segmentación de vídeo: servir de base reproducible para comparar exportaciones ONNX frente al runtime original de PyTorch en tareas de propagación con prompt de caja.
- Prototipado de herramientas de escritorio offline: integrar el paquete en una app Electron o similar con ONNX Runtime para tareas de segmentación sin subir material sensible.
- Análisis de material audiovisual con requisitos de privacidad: procesar vídeo clínico, legal o de vigilancia en la propia máquina, evitando el envío a terceros.
- Docencia y demostraciones de SAM 2: ilustrar el desglose encoder/decoder/memoria de SAM 2.1 tiny con ficheros de tamaño manejable (≈ 168 MB) y verificación criptográfica incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con pesos float32 de ≈ 168 MB y tamaño de imagen 512, la huella es modesta y cabe en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; al ejecutarse con ONNX Runtime puede usar CPU o GPU compatible con los execution providers de ONNX Runtime.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del paquete (≈ 168 MB en float32), aunque no se documentan requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), integrado en la aplicación *Video Redactor*; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Extreme-Media/video-redactor-sam2.1-tiny-onnx` | no disponible (≈ 168 MB float32) | Banco de memoria fijo de 7 fotogramas, 16 punteros | Apache 2.0 | ONNX, acoplado a la app Video Redactor |
| `facebook/sam2.1-hiera-tiny` (original) | no disponible en la información | Memoria configurable en el runtime de SAM 2 | Apache 2.0 | PyTorch, runtime oficial `facebookresearch/sam2` |
| SAM 2.1 variantes small/base/large | no disponible en la información | Memoria configurable | Apache 2.0 | PyTorch, runtime oficial |

La comparación relevante es frente al SAM 2.1 tiny original: misma arquitectura y mismos pesos, pero distinto empaquetado (ONNX troceado y con memoria fija) y distinto grado de generalidad (la exportación está atada a un flujo de un solo objeto con prompt de caja).

## Limitaciones y advertencias

- No es un runtime general de SAM 2: está acoplado al código JavaScript de *Video Redactor* y asume propagación de un único objeto con prompt de caja.
- El banco de memoria es de tamaño fijo (7 fotogramas) y 16 punteros de objeto, lo que limita la flexibilidad frente al runtime original.
- No se documentan sesgos; al ser un modelo de visión, puede fallar en objetos pequeños, oclusiones prolongadas o cambios bruscos de apariencia.
- Riesgo de deriva de la máscara en secuencias largas por la memoria acotada; conviene validar en el dominio concreto.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de modificación (NOTICE) y la atribución a Meta Platforms.
- El autor advierte que los ficheros se publican solo para que la aplicación los descargue; no se garantiza su uso fuera de ese contexto.
- No hay información sobre cuantizaciones, latencia ni requisitos mínimos de hardware; para producción conviene medir en el equipo objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/Extreme-Media/video-redactor-sam2.1-tiny-onnx
- Aplicación Video Redactor: https://extreme-media.co.uk/redactor.html
- Repositorio oficial de SAM 2: https://github.com/facebookresearch/sam2
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
