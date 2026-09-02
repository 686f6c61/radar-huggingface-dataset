# KillerBoss/eink-npu-dirty-region

## Resumen

El modelo `KillerBoss/eink-npu-dirty-region` es un sistema de dos etapas diseñado para la actualización eficiente de pantallas de tinta electrónica (E-Ink) mediante computación condicional. Desarrollado por KillerBoss (Rudolf), el modelo decide de forma autónoma qué regiones de 128×128 píxeles de la pantalla necesitan regenerarse tras un evento táctil, y genera únicamente esas regiones, evitando el renderizado completo del fotograma. Esto reduce drásticamente la carga computacional en dispositivos móviles, especialmente en NPUs de Qualcomm (Hexagon v68+).

El sistema se compone de dos redes neuronales: un *Decision Head* (94.473 parámetros) que analiza una miniatura de la pantalla junto con datos táctiles y de acción, produciendo una máscara de regiones sucias sobre una cuadrícula de 12×11; y un *Patch Generator* (776.817 parámetros) que genera los píxeles de cada región seleccionada. En total suman 871.290 parámetros. El modelo está compilado para NPU mediante Qualcomm AI Hub, con artefactos QNN y TFLite, y también se distribuye en formato ONNX para inferencia en CPU. Su relevancia radica en habilitar interfaces E-Ink responsivas y de bajo consumo en hardware móvil, un nicho poco cubierto por modelos de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes convolucionales: Decision Head (94.473 params) y Patch Generator (776.817 params) |
| Parametros totales | 871.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | FP16 (nativo HTP), INT8 (via calibracion con ~200 inputs) |
| Idiomas soportados | de, en (segun metadatos; el modelo procesa imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (Opset 17), TFLite, QNN Context Binary (.serialized), PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de computación condicional en dos etapas. El *Decision Head* recibe una entrada de 7 canales de dimensiones (1, 7, 44, 96): una miniatura de la pantalla de 64×30 píxeles (posiblemente con 3 canales de color o escala de grises), un mapa de calor táctil y 5 canales one-hot que codifican el tipo de acción (INK, ERASE, MORPH, REVEAL, NONE). Produce logits de salida (1, 1, 11, 12) que representan una máscara de regiones sucias sobre una cuadrícula de 12×11 de tiles de 128×128 píxeles. El *Patch Generator* toma como entrada el contexto de la tile (1, 2, 128, 128) y un contexto global (1, 1, 32, 32), y genera la nueva tile de 128×128 píxeles con salida lineal y clamp a [0,1].

El entrenamiento se realizó sobre un dataset sintético generado por el propio autor (`KillerBoss/eink-dirty-region-dataset`), con scripts reproducibles que cubren desde la generación de datos hasta el entrenamiento, evaluación, compilación para NPU y perfilado en dispositivo. No se especifican detalles sobre el número de tokens, composición exacta del dataset ni el uso de RLHF/DPO; el entrenamiento es supervisado para ambas etapas. La innovación principal es el diseño de dos cabezas especializadas que permiten inferencia asíncrona: el Decision Head se ejecuta en 0,109 ms y el Patch Generator en 0,24 ms por tile en NPU, con un coste típico de 1-2 ms por evento táctil.

## Capacidades

- Generación de regiones de imagen en estilo E-Ink (escala de grises, dithering, prior de texto y cajas).
- Decisión autónoma de qué regiones de la pantalla necesitan actualización, basada en entrada táctil y tipo de acción.
- Soporte de cinco tipos de acción: INK, ERASE, MORPH, REVEAL y NONE (autónomo con temporizador).
- Actualización incremental mediante delta-compositing: solo se escriben píxeles con diferencia |nuevo - antiguo| > 25, garantizando que las zonas sin cambios no se degraden.
- Inferencia eficiente en NPU Qualcomm (Hexagon v68+) con latencias de sub-milisegundo.
- Compatibilidad con ONNX Runtime para CPU, TFLite con delegado QNN, y QNN SDK/SNPE para C++.
- Ajuste en tiempo de ejecución del umbral de decisión (thr) para equilibrar precisión y recall según el presupuesto de NPU.

## Casos de uso

- Lectores de libros electrónicos con actualización parcial: el modelo permite refrescar solo las regiones donde aparece texto nuevo o se desliza la página, reduciendo el parpadeo y el consumo energético en dispositivos como el Galaxy S26 Ultra.
- Tabletas de notas con tinta electrónica: al escribir con el lápiz, el Decision Head identifica las tiles afectadas por el trazo y el Patch Generator las regenera en estilo E-Ink, logrando una latencia de 1-2 ms por evento, suficiente para una experiencia fluida.
- Interfaces de usuario para relojes inteligentes o wearables con pantalla E-Ink: el modelo puede actualizar solo los elementos que cambian (hora, notificaciones) sin redibujar todo el panel, alargando la batería.
- Pizarras digitales de bajo consumo: en entornos educativos o de oficina, el sistema permite actualizaciones locales de trazos o borrados sin necesidad de un frame loop continuo, liberando la GPU y la CPU.
- Sistemas de señalización digital estática: carteles o etiquetas electrónicas que cambian de contenido esporádicamente pueden usar el modo NONE con temporizador para detectar cambios y actualizar solo las regiones afectadas.
- Prototipado de aplicaciones Android con NPU: los artefactos TFLite y QNN, junto con el esqueleto Kotlin (`EinkEngine.kt`), sirven como referencia para integrar inferencia de visión en apps que requieran renderizado condicional en dispositivos Snapdragon.

## Benchmarks y rendimiento

Los resultados de evaluación se obtuvieron sobre 150 escenas nuevas no vistas durante el entrenamiento, con un seed distinto. Se reportan métricas para el Decision Head y el Patch Generator por separado, así como latencias medidas en un dispositivo real (Qualcomm AI Hub cloud device, FP16/HTP).

| Metrica | Valor |
|---|---|
| Decision Precision (thr 0,60) | 0,543 |
| Decision Recall (thr 0,60) | 0,309 |
| Decision F1 (thr 0,60) | 0,394 |
| Decision IoU (thr 0,60) | 0,246 |
| Generator L1 (delta-composited) | 0,033 (≈ 8 niveles de gris) |
| Generator PSNR | 24,3 dB |
| Latencia Decision Head (NPU) | 0,109 ms |
| Latencia Patch Generator (NPU) | 0,24 ms por tile |
| Pico de memoria Decision Head | ~149 MB |
| Pico de memoria Patch Generator | ~147 MB |

El autor indica que el Decision Head es conservador (precision > recall), lo cual es adecuado para el presupuesto de NPU. El Patch Generator reproduce bien el estilo E-Ink y las actualizaciones de tinta/borrado, pero en acciones de tipo `reveal` o `morph` genera contenido plausible en lugar de pixel-exacto, limitación atribuida a la capacidad del modelo y los datos.

## Requisitos de hardware

- NPU Qualcomm Hexagon v68 o superior (probado en Snapdragon 8 Elite Gen 5 for Galaxy, SM8850, Galaxy S26 Ultra).
- Para inferencia en CPU: cualquier dispositivo con ONNX Runtime; sin requisitos especiales de VRAM (modelo de ~0,87 M parámetros, entrada máxima de 128×128).
- Artefactos compilados: QNN Context Binary (FP16) y TFLite con delegado QNN; también se puede usar SNPE.
- Para INT8: se requiere un trabajo de calibración con ~200 inputs, reduciendo latencia y tamaño en un 30-40 %.
- Opciones de despliegue: ONNX Runtime (CPU), TFLite con QNN delegate (Android), QNN SDK/SNPE (C++), Qualcomm AI Hub para compilación remota.
- Latencia típica por evento táctil: 1-2 ms NPU (1 decisión + 3-8 tiles); un update de pantalla completa (66 tiles) rondaría los 16 ms.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible. Este sistema es altamente especializado para actualización de regiones en pantallas E-Ink sobre NPU de Qualcomm, un nicho sin alternativas públicas conocidas. Los modelos de generación de imágenes de propósito general (p. ej., Stable Diffusion) no son comparables por su tamaño, latencia y enfoque.

## Limitaciones y advertencias

- El Decision Head tiene un recall bajo (0,309) con el umbral por defecto, lo que significa que puede omitir tiles que sí necesitan actualización; el umbral es ajustable en tiempo de ejecución, pero el equilibrio precision/recall debe calibrarse por aplicación.
- El Patch Generator no reproduce contenido pixel-exacto en acciones de `reveal` o `morph`; produce resultados plausibles pero no fieles, lo que limita su uso en escenarios que requieran fidelidad absoluta.
- El modelo está entrenado con un dataset sintético; su rendimiento en escenarios reales con contenido variado (fotografías, gráficos complejos) no está garantizado.
- Los artefactos NPU están compilados para Hexagon v68+; en NPUs más antiguas o de otros fabricantes (Rockchip, etc.) no funcionarán sin recompilación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni de exactitud; el modelo se distribuye "tal cual".
- No se proporcionan datos sobre sesgos o alucinaciones, al ser un modelo de imagen; sin embargo, la generación de tiles puede producir artefactos visuales en regiones no vistas durante el entrenamiento.
- Para producción, es imprescindible implementar el delta-compositing (umbral 25) para evitar degradación de píxeles estáticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KillerBoss/eink-npu-dirty-region
- Dataset: https://huggingface.co/datasets/KillerBoss/eink-dirty-region-dataset
- Perfil del autor: https://huggingface.co/KillerBoss
- Repositorio de scripts y código (mencionado en la model card, sin URL directa): se indica `scripts/` y `kotlin/EinkEngine.kt` dentro del repositorio del modelo, pero no se proporciona un enlace externo.
