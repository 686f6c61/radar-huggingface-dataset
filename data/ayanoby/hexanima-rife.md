# ayanoby/hexanima-rife

## Resumen

HexAnima RIFE es una conversión del modelo de interpolación de fotogramas Practical-RIFE v4.6 (desarrollado por hzwer) a binarios de contexto QNN HTP para la NPU Hexagon V69, presente en los SoC Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1. No se distribuye como pesos PyTorch u ONNX genéricos, sino como ficheros `.bin` específicos por resolución que ejecutan la inferencia directamente sobre la NPU del dispositivo Android. El objetivo es habilitar la interpolación de vídeo (duplicar o cuadruplicar los FPS) dentro de la aplicación HexAnima, de forma local y acelerada por hardware.

El modelo resuelve un problema concreto: la interpolación de fotogramas en tiempo real en móviles sin depender de la nube ni de la GPU. Al compilarse para la NPU Hexagon en fp16, se obtiene un coste computacional bajo y un consumo energético reducido en comparación con la ejecución en CPU o GPU. La salida es el fotograma intermedio entre dos fotogramas RGB consecutivos, lo que permite generar vídeo de mayor tasa de refresco a partir de material original.

La relevancia actual radica en que es un ejemplo de despliegue de modelos de visión en NPUs móviles mediante el stack Qualcomm AI Runtime (QAIRT), un nicho con pocos artefactos públicos listos para usar. El repositorio ocupa 0,3 GB, se publica bajo licencia MIT y no incluye pesos en formato estándar, lo que limita su uso fuera de la generación de chips indicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de interpolación de flujo óptico (IFNet_HDv3 de Practical-RIFE v4.6), exportada a ONNX y compilada a binario QNN HTP |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada `[1, 6, H, W]`) |
| Tipos de cuantización | fp16 (QNN HTP, batch 1) |
| Idiomas soportados | no aplica (modelo de vídeo, sin capacidades lingüísticas) |
| Licencia | MIT (Copyright (c) 2021 hzwer; copias modificadas de los pesos originales) |
| Formato de pesos | binarios de contexto QNN (`.bin`) por resolución, más `manifest.json` con tamaños y sha256 |

## Arquitectura y entrenamiento

El modelo base es Practical-RIFE v4.6, en concreto la red `IFNet_HDv3`, una arquitectura de interpolación de fotogramas basada en estimación de flujo óptico y warping. La conversión sustituye la operación de warp original por `grid_sample`, exporta el grafo a ONNX con opset 17 y lo compila con `qairt-converter` (batch 1, fp16) y `qnn-context-binary-generator` para la NPU Hexagon V69. La entrada es un tensor `[1, 6, H, W]` con dos fotogramas RGB en rango 0..1 (canales 0-2 y 3-5) y la salida es `[1, 3, H, W]` con el fotograma intermedio.

No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO), ya que se trata de un modelo de visión y la model card se centra en el proceso de conversión. La innovación técnica destacable es el empaquetado por resolución: se genera un fichero por tamaño de fotograma (`rife_t<H>x<W>.bin`), con lados múltiplos de 32, y la aplicación rellena el vídeo con píxeles de borde hasta el fichero más pequeño que lo cubre. El `manifest.json` permite descargar solo el tamaño necesario. La fidelidad respecto al modelo fp32 original se validó en el teléfono con 67,6 dB sobre un par de prueba de 256 x 448, lo que se describe como prácticamente idéntico.

## Capacidades

- Interpolación de fotogramas de vídeo: genera el fotograma intermedio entre dos fotogramas RGB consecutivos.
- Duplicación y cuadruplicación de FPS (x2 / x4) en el flujo "Upscale -> Video" de la app HexAnima.
- Ejecución acelerada en NPU Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1) en fp16.
- Procesamiento local en el dispositivo, sin dependencia de servicios en la nube.
- Soporte de múltiples resoluciones mediante ficheros específicos por tamaño, con relleno de borde para ajustar al fichero disponible.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Interpolación de vídeo en móvil: la app HexAnima usa los binarios para generar fotogramas intermedios y elevar la tasa de refresco de vídeos grabados, aprovechando la NPU para mantener el consumo bajo.
- Reproducción de vídeo a mayor FPS en tiempo real: al ejecutarse en la NPU con un coste de unos 0,04 s más 0,45 microsegundos por píxel por fotograma, es adecuado para flujos de visualización en dispositivos Snapdragon 8 Gen 1.
- Postprocesado de grabaciones de cámara: convertir material a 60 o 120 FPS para edición o reproducción fluida sin salir del teléfono.
- Restauración de vídeo de baja cadencia: generar fotogramas intermedios para suavizar metraje antiguo o de baja tasa antes de visualizarlo.
- Integración en pipelines de edición móvil: la app descarga solo el binario de la resolución necesaria gracias al `manifest.json`, lo que facilita el procesado por lotes de vídeos de distintos tamaños.
- Demostración técnica de despliegue en NPU: sirve como referencia para convertir modelos de visión a QNN HTP y validar fidelidad numérica frente al modelo fp32 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada es la fidelidad frente al modelo fp32 original: 67,6 dB sobre un par de prueba de 256 x 448, descrita como prácticamente idéntica. El coste temporal indicado es de aproximadamente 0,04 s más 0,45 microsegundos por píxel para generar un fotograma nuevo.

## Requisitos de hardware

- NPU Hexagon V69, presente en Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1. Los binarios solo se ejecutan en esa generación de chip.
- No son pesos ONNX/PyTorch generales: no se pueden ejecutar en GPU de escritorio, A100, H100 ni RTX 4090.
- No caben en GPU de consumo porque no existe una versión estándar del modelo en este repositorio; solo hay binarios QNN.
- Despliegue mediante el runtime QNN de Qualcomm dentro de la app Android HexAnima.
- Almacenamiento: repositorio de 0,3 GB; la app descarga únicamente el fichero de la resolución requerida según el `manifest.json`.
- Latencia estimada: ~0,04 s + 0,45 µs/píxel por fotograma nuevo (dato del autor, medido en el dispositivo).

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexAnima RIFE (este) | Interpolación de fotogramas (RIFE v4.6) | Binarios QNN HTP fp16 | NPU Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1) | MIT | Hugging Face, 0 descargas |
| Practical-RIFE v4.6 (hzwer) | Interpolación de fotogramas | Pesos PyTorch (`flownet.pkl`) | GPU/CPU genéricas | MIT | GitHub |
| Otros modelos de interpolación (p. ej. variantes de RIFE o FILM) | Interpolación de fotogramas | PyTorch/ONNX | GPU/CPU | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los binarios solo funcionan en la NPU Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1); no son portables a otras generaciones de chip ni a otros aceleradores.
- No son pesos ONNX/PyTorch generales: no se pueden cargar en frameworks estándar ni ejecutar en GPU de escritorio.
- Requieren la app HexAnima y el runtime QNN de Qualcomm para su uso.
- El modelo está pensado exclusivamente para interpolación de fotogramas; no tiene capacidades de texto, código, razonamiento ni multilingües.
- La resolución de entrada debe tener lados múltiplos de 32 y ajustarse a uno de los ficheros disponibles; la app rellena con píxeles de borde, lo que puede introducir artefactos en los bordes.
- Riesgo de artefactos de interpolación en escenas con oclusiones, movimientos rápidos o cambios de iluminación, inherente a los modelos de flujo óptico.
- La licencia MIT permite uso comercial, pero al ser copias modificadas de los pesos originales de hzwer debe conservarse el aviso de copyright.
- No se han publicado datos sobre sesgos, ya que es un modelo de visión sin componente lingüístico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-rife
- Repositorio de la app HexAnima: https://github.com/ayanoby/hexanima
- Practical-RIFE (modelo base): https://github.com/hzwer/Practical-RIFE
