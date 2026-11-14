# mlboydaisuke/EfficientAD-CoreML

## Resumen

EfficientAD-CoreML es una conversión a Core ML del detector de anomalías visuales EfficientAD, presentado en WACV 2024 (arXiv:2303.14535). El modelo original está diseñado para inspección industrial: dada una imagen de 256x256 píxeles, produce un mapa de calor de anomalías por píxel y una puntuación escalar, de modo que localiza defectos en lugar de limitarse a indicar su presencia. Esta conversión, obra de mlboydaisuke (Daisuke Majima, john-rocky), empaqueta los pesos de MSherbinii/efficientad-bottle en un `.mlpackage` de 14 MB para inferencia en dispositivo en iPhone, iPad y Mac.

Técnicamente, EfficientAD combina un par profesor-estudiante basado en la arquitectura PDN-Small con un autoencoder; el mapa de anomalías se obtiene de la discrepancia entre estudiante-profesor y estudiante-autoencoder. El checkpoint publicado está entrenado exclusivamente sobre la categoría *bottle* del dataset MVTec AD, por lo que para otras categorías de objetos es necesario reentrenar. No se trata de un modelo generativo ni de un LLM: es un segmentador de anomalías de propósito específico.

Su relevancia radica en la ejecución local sin conexión en hardware Apple, con un tamaño reducido (14 MB) y requisito mínimo de iOS 17.0. Los paquetes son sin estado (*stateless*), de modo que toda la secuencia y el buffering deben implementarse en código Swift. La licencia es dual: MIT para los pesos y Apache 2.0 para el código de cálculo del mapa de anomalías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientAD: profesor-estudiante PDN-Small + autoencoder (detección de anomalías) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256) |
| Tipos de cuantizacion | no disponible (conversión Core ML verificada con `compute_units: all`) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 y MIT (pesos MIT, código Apache 2.0) |
| Formato de pesos | Core ML `.mlpackage` (comprimido en `.mlpackage.zip`, 14 MB) |

## Arquitectura y entrenamiento

EfficientAD es un detector de anomalías que no requiere entrenamiento con ejemplos defectuosos: aprende únicamente la distribución de imágenes correctas. La puntuación de anomalía se calcula como la discrepancia entre un profesor PDN-Small y su estudiante, combinada con la discrepancia entre un autoencoder y el estudiante. Esta doble comparación permite distinguir defectos estructurales de variaciones de textura, y produce un mapa por píxel además de una puntuación escalar agregada.

El checkpoint aquí publicado es una conversión de los pesos de MSherbinii/efficientad-bottle, entrenados sobre la categoría *bottle* de MVTec AD. El cálculo del mapa de anomalías se adapta del repositorio nelson1425/EfficientAD. La conversión se realizó con `coremltools`; según las notas del autor, durante el proceso se encontraron problemas de desbordamiento en FP16, límites de buffer de la Neural Engine (ANE) y manejo de *stride*. Los paquetes resultantes son sin estado, por lo que la lógica de secuenciación y buffering recae en el código Swift del cliente.

## Capacidades

- Detección de anomalías visuales en imágenes de entrada de 256x256 píxeles.
- Segmentación por píxel: genera un mapa de calor de anomalías que localiza el defecto, además de una puntuación escalar global.
- Inspección industrial sobre la categoría *bottle* de MVTec AD (botellas).
- Aprendizaje no supervisado de la apariencia correcta: no necesita imágenes defectuosas para entrenar.
- Inferencia en dispositivo en iPhone, iPad y Mac mediante Core ML, con requisito mínimo de iOS 17.0.
- Ejecución con `compute_units: all`, configuración con la que se verificó la conversión (CPU, GPU y Neural Engine).
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo ni modo de razonamiento: es un modelo de visión de propósito específico.

## Casos de uso

- Inspección de botellas en línea de producción: el modelo recibe imágenes de 256x256 y devuelve un mapa de anomalías que permite localizar golpes, manchas o roturas en la superficie, adecuado por su bajo coste computacional y su tamaño de 14 MB.
- Control de calidad en dispositivo sin conexión: al ejecutarse en iPhone, iPad o Mac con Core ML, permite inspeccionar piezas en planta o en campo sin depender de la nube ni de conectividad.
- Prototipado rápido de sistemas de visión industrial: el paquete Core ML y la app de ejemplo SwiftUI permiten integrar un detector de anomalías funcional en una aplicación iOS en minutos.
- Precribado visual en aplicaciones móviles de mantenimiento: un técnico fotografía un componente y la app resalta las zonas con mayor puntuación de anomalía antes de una revisión humana.
- Base para reentrenamiento por categoría: dado que el checkpoint cubre solo *bottle*, el flujo de conversión y las notas publicadas sirven de plantilla para generar variantes para otras categorías de MVTec AD.
- Investigación y docencia sobre detección de anomalías: el modelo permite experimentar con la formulación profesor-estudiante más autoencoder en hardware Apple asequible, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del paquete: 14 MB, lo que lo hace viable en dispositivos con almacenamiento muy limitado.
- Inferencia en dispositivo Apple: iPhone, iPad y Mac compatibles con Core ML; requisito mínimo de iOS 17.0.
- Configuración de cómputo verificada: `compute_units: all` (CPU + GPU + Neural Engine). Cambiar de unidad de cómputo puede alterar la numérica (desbordamiento en FP16) o provocar fallos en GPU.
- No requiere GPU de servidor (A100, H100, RTX 4090); está pensado para el silicio Apple (Neural Engine y GPU integrada).
- Despliegue: Core ML nativo en Xcode (compilación en tiempo de build) o compilación en tiempo de ejecución con `MLModel.compileModel(at:)`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientAD-CoreML (este) | Detección de anomalías, Core ML | Imagen 256x256 | Mapa por píxel + score | Apache-2.0 + MIT | Hugging Face, 14 MB |
| EfficientAD (nelson1425) | Detección de anomalías, PyTorch | Imagen | Mapa por píxel + score | Ver repositorio original | GitHub |
| MSherbinii/efficientad-bottle | Detección de anomalías, pesos | Imagen | Mapa por píxel + score | MIT | Hugging Face |
| Padim / PatchCore (MVTec AD) | Detección de anomalías clásica | Imagen | Mapa por píxel + score | Ver repositorios originales | Repositorios de investigación |

La comparación directa con alternativas de la misma categoría (PatchCore, PaDiM) no está disponible en la información proporcionada; los datos de rendimiento de EfficientAD frente a esos métodos figuran en el paper original (arXiv:2303.14535), no en esta ficha.

## Limitaciones y advertencias

- Entrenado solo sobre la categoría *bottle* de MVTec AD: no generaliza a otros objetos sin reentrenamiento por categoría.
- Modelo sin estado: la secuenciación y el buffering deben implementarse en Swift; no gestiona contexto entre inferencias.
- La configuración `compute_units` no es una sugerencia: cambiarla puede alterar silenciosamente la numérica (desbordamiento en FP16) o provocar fallos en GPU.
- Requiere iOS 17.0 o superior; no funciona en dispositivos con versiones anteriores.
- Es un modelo de visión de propósito específico: no procesa lenguaje, no tiene tool calling ni capacidades de agente.
- Riesgo de falsos positivos y negativos en condiciones de iluminación, ángulo o fondo distintas de las del entrenamiento; no hay datos publicados de robustez en esta ficha.
- Licencia dual (MIT para pesos, Apache 2.0 para código): conviene verificar el cumplimiento de ambas al redistribuir.
- Alucinación en sentido generativo no aplica, pero sí existe el riesgo de marcar como defecto variaciones legítimas de apariencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/EfficientAD-CoreML
- Pesos originales: https://huggingface.co/MSherbinii/efficientad-bottle
- Código original EfficientAD: https://github.com/nelson1425/EfficientAD
- Paper (WACV 2024): https://arxiv.org/abs/2303.14535
- App de ejemplo SwiftUI: https://github.com/john-rocky/CoreML-Models/tree/master/sample_apps/EfficientADDemo
- Script de conversión: https://github.com/john-rocky/CoreML-Models/blob/master/conversion_scripts/convert_efficientad.py
- Notas de conversión Core ML: https://github.com/john-rocky/CoreML-Models/blob/master/docs/coreml_conversion_notes.md
- Índice CoreML-Models: https://github.com/john-rocky/CoreML-Models
- Colección Core ML Model Zoo: https://huggingface.co/collections/mlboydaisuke/core-ml-model-zoo-6a7078dc888e7b13efd35631
