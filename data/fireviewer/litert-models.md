# fireviewer/litert-models

## Resumen

FireViewer LiteRT Models es un archivo de conversiones a TensorFlow Lite (LiteRT) publicado por el usuario `fireviewer` en Hugging Face. No se trata de un modelo fundacional único, sino de una colección de diez paquetes de conversión orientados a la detección de fuego y llama en dispositivos Android, con soporte declarado para entrenamiento en dispositivo (*on-device training*). El repositorio agrupa variantes históricas derivadas de detectores como D-FINE M, RT-DETRv2 R50, YOLO11 M, RF-DETR Medium y un piloto de *pointing* basado en DINOv3, además de cuatro exportaciones FP32 de solo inferencia basadas en DINOv2 Small y RF-DETR Medium.

El interés del artefacto es fundamentalmente de ingeniería de despliegue: cada paquete incluye un contrato de runtime (`runtime_contract.json`), manifiestos de artefactos y recibos de conversión que documentan firmas tensoriales exactas, normalización, disposición de ejes, etiquetas y transformaciones de coordenadas. El autor es explícito al separar la mera presencia de un grafo de la cualificación real del modelo: solo una variante (YOLO11 M *learning*) ha pasado una prueba en emulador a través del SDK Android independiente, y ninguna ha sido cualificada en Vision Dataset Studio ni en un teléfono ARM físico.

La relevancia actual reside en su valor como referencia metodológica: muestra cómo documentar conversiones LiteRT con trazabilidad rigurosa (revisión inmutable, contratos por variante, evidencia de paridad tensorial) y advierte de que la paridad numérica no equivale a precisión semántica. El tamaño del repositorio es de 1,6 GB y acumula 441 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de detectores (D-FINE M, RT-DETRv2 R50, YOLO11 M, RF-DETR Medium) y extractores/pointing (DINOv2 Small, DINOv3); grafos convertidos a LiteRT |
| Parametros totales | no disponible (no se declara el recuento por variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 en las cuatro exportaciones retenidas; el resto de variantes no especifica cuantización en la información disponible |
| Idiomas soportados | no disponible (modelos de visión; etiquetas en inglés) |
| Licencia | other (licencia personalizada, ver avisos de origen por variante) |
| Formato de pesos | TensorFlow Lite / LiteRT (`.tflite`), con contratos JSON y manifiestos por paquete |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma unificada, sino conversiones de arquitecturas de detección y representación visual ya existentes. Las variantes históricas incluyen cinco cabezas o adaptadores de salida entrenables (D-FINE M *strict v1*, RT-DETRv2 R50, YOLO11 M *strict v1 learning*, RF-DETR Medium 1.10 y DINOv3 *pointing pilot v1*) y un grafo YOLO11 M de solo inferencia. Las cuatro exportaciones FP32 v2.5 (DINOv2 Small *fire associated smoke* y *visible flame monopoint*; RF-DETR Medium *probable fire* y *visible flame*) son exclusivamente de inferencia.

El SDK Kotlin asociado expone las operaciones `infer`, `train`, `save` y `restore`, y los puntos de control preservan parámetros, momento de SGD y contadores de paso; los recibos verifican la identidad del modelo y de las etiquetas. La innovación técnica destacable no está en la arquitectura neuronal sino en el contrato de conversión: cada paquete documenta su diagrama de entrada/salida y una tabla de contrato exacta. El autor advierte que los dos recibos de conversión RF-DETR FP32 pasan conjuntos decodificados en los umbrales operativos fijos pero fallan explícitamente la equivalencia de las 300 consultas crudas, y que los umbrales inferiores no están cualificados. No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Detección de fuego y llama en imágenes, con variantes específicas para llama visible (*visible flame*) y fuego probable (*probable fire*).
- Detección de humo asociado a fuego en la variante DINOv2 Small *fire associated smoke*.
- Localización por *pointing* mediante el piloto DINOv3, orientado a señalar regiones de interés.
- Inferencia en dispositivo Android a través de LiteRT/TensorFlow Lite.
- Entrenamiento en dispositivo (*on-device training*) limitado a las cabezas o adaptadores de las variantes que exponen firmas de entrenamiento genuinas.
- Gestión de puntos de control: guardado y restauración de parámetros, momento de SGD y contadores de paso.
- Verificación de identidad de modelo y etiquetas mediante recibos del SDK.
- No se declara soporte de *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje.

## Casos de uso

- Inspección de conversiones LiteRT archivadas: un ingeniero descarga un paquete a una revisión inmutable concreta y verifica la firma tensorial, la normalización y la transformación de coordenadas antes de integrarlo en su pipeline, gracias a los contratos JSON por variante.
- Detección de llama visible en aplicaciones Android de campo: la variante RF-DETR Medium *visible flame* FP32 puede ejecutarse en dispositivo para alertar sobre presencia de llama en imágenes de cámara, siempre que se respeten los umbrales operativos fijos documentados.
- Detección de humo asociado a fuego: la variante DINOv2 Small *fire associated smoke* permite un cribado ligero de imágenes con posible humo, adecuada por su menor coste computacional en comparación con detectores medios.
- Ajuste fino en dispositivo de cabezas de detección: las variantes con firmas de entrenamiento (D-FINE M, RT-DETRv2 R50, YOLO11 M *learning*, RF-DETR Medium 1.10) permiten adaptar la cabeza a dominios locales con objetivos revisados, conservando los pesos originales y almacenando los puntos de control por separado.
- Investigación reproducible sobre conversión de modelos: el archivo sirve como referencia para estudiar la diferencia entre paridad tensorial y precisión semántica, dado que el autor documenta explícitamente los fallos de equivalencia en las 300 consultas crudas de RF-DETR.
- Integración en SDK Android propio: el SDK Kotlin con `infer`, `train`, `save` y `restore` puede servir de base para aplicaciones de visión que requieran actualización en campo, aunque solo YOLO11 M *learning* cuenta con una pasada registrada en emulador.
- Auditoría de licencias y procedencia: los avisos de origen por variante y los manifiestos de artefactos permiten revisar la procedencia de cada grafo antes de un uso comercial, dado que la licencia es `other`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta evidencia de cualificación, no métricas de precisión de tarea:

| Variante | Aprendizaje sintético en host | SDK Android independiente | Vision Dataset Studio |
|---|---|---|---|
| D-FINE M strict v1, learning | PASS | No cualificado | No cualificado |
| RT-DETRv2 R50, learning | PASS | No cualificado | No cualificado |
| YOLO11 M strict v1, inference | N/A | No cualificado | No cualificado |
| YOLO11 M strict v1, learning | PASS | PASS en emulador | No cualificado |
| RF-DETR Medium 1.10, learning | PASS | No cualificado | No cualificado |
| DINOv3 pointing pilot v1, learning | PASS | No cualificado | No cualificado |

El autor indica que, para las seis variantes históricas, la precisión de tarea, la generalización y el olvido catastrófico no están medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser modelos LiteRT para Android, el consumo se mide en memoria del dispositivo, no en VRAM de GPU de escritorio.
- GPU recomendadas: no aplica para el despliegue objetivo; para la conversión y validación en host se puede usar cualquier GPU compatible con TensorFlow, aunque no se especifica.
- Compatibilidad con GPU de consumo: no disponible; el destino declarado son dispositivos Android, no tarjetas gráficas de consumo.
- Opciones de despliegue: runtime LiteRT/TensorFlow Lite en Android mediante el SDK Kotlin del autor; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles. El tamaño del repositorio es de 1,6 GB, pero no se desglosa por variante en la información proporcionada.
- Cualificación física: ninguna variante ha sido cualificada en un teléfono ARM físico según la model card.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de parámetros por variante que permitan una comparación cuantitativa fiable con alternativas. La siguiente tabla recoge únicamente lo que la información disponible permite afirmar:

| Criterio | FireViewer LiteRT Models | Detectores LiteRT genéricos | Modelos de detección de fuego en PyTorch |
|---|---|---|---|
| Formato | LiteRT (`.tflite`) | LiteRT (`.tflite`) | PyTorch (`.pt`) |
| Entrenamiento en dispositivo | Sí, en cinco variantes con firmas de entrenamiento | Habitualmente no | No |
| Contrato de runtime documentado | Sí, JSON por variante | Rara vez | No aplica |
| Cualificación en emulador | Solo YOLO11 M *learning* | No disponible | No disponible |
| Cualificación en dispositivo físico | Ninguna | No disponible | No disponible |
| Licencia | other | Variable | Variable |

## Limitaciones y advertencias

- Ninguna de las seis variantes históricas está cualificada en Vision Dataset Studio; la pasada del SDK en emulador para YOLO11 M *learning* no cualifica a los demás modelos, ni la integración en aplicación, ni un teléfono ARM físico.
- Para las seis variantes históricas, la precisión de tarea, la generalización y el olvido catastrófico no están medidos.
- Los adaptadores de detección no pueden crear propuestas ausentes del detector congelado.
- Los recibos RF-DETR FP32 pasan en umbrales operativos fijos pero fallan la equivalencia de las 300 consultas crudas; los umbrales inferiores no están cualificados.
- La paridad numérica no implica precisión semántica; el autor lo advierte de forma explícita.
- No se entrega ningún grafo SegFormer porque la fuente opcional no estaba disponible.
- La licencia es `other`, con avisos de origen por variante; es imprescindible revisarlos antes de cualquier uso comercial.
- No hay datos publicados sobre sesgos, tasas de alucinación (concepto no aplicable a detección) ni limitaciones idiomáticas.
- No se declara evaluación del modelo de investigación nativo; los recibos de exportación y SDK conciernen únicamente a estos grafos convertidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fireviewer/litert-models
- Guía de conversión: `docs/CHOOSING_VARIANTS.md`
- Guía de uso: `docs/USAGE.en.md`
- Evidencia de conversión: `docs/BENCHMARKS.en.md`
- Registro de cambios: `CHANGELOG.md`
- Recibo de entrega: `reports/fireviewer-completion.json`
- Fuentes de figuras y revisión fijada: `assets/presentation-source.json`
- Revisión inmutable de referencia: `bdcd483d5c5aadeff1b531a35b536f3530906e18`
