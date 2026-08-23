# jiaheguo521/relu-clip

## Resumen

ReLU-CLIP es una familia de modelos de clasificacion de imagenes zero-shot desarrollados por Jiahe Guo que destilan los codificadores de imagen de CLIP en redes neuronales convolucionales (CNN) compactas con activaciones ReLU/ReLU6 y BatchNorm. El objetivo es ejecutar clasificacion zero-shot en aceleradores de hardware de bajo consumo como el Coral Edge TPU, cuyo soporte de operadores es mas completo para redes convolucionales. El modelo principal, efflite4, se destila de CLIP ViT-L/14 y alcanza un 68,25% de top-1 en ImageNet-1k en int8 con solo 12,71 millones de parametros, con un coste de cuantizacion de 0,10 puntos porcentuales respecto a fp32.

La relevancia de ReLU-CLIP radica en que lleva la clasificacion zero-shot a dispositivos de borde con restricciones de energia y memoria, manteniendo una precision notable. El grafo int8 completo pesa 13,6 MiB y ejecuta los 116 operadores en el acelerador, sin usar la CPU. El repositorio incluye los pesos del modelo desplegable y los grafos int8 de los 18 experimentos del estudio (2 profesores x 9 estudiantes), lo que permite verificar la afirmacion central de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con ReLU/ReLU6 y BatchNorm, destilada de CLIP ViT-L/14 |
| Parametros totales | 12,71 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | int8 por canal, fp32 |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32), TFLite (int8) |

## Arquitectura y entrenamiento

ReLU-CLIP usa una arquitectura CNN con activaciones ReLU/ReLU6 y capas de BatchNorm, disenada para cuantizar a int8 y ejecutarse en aceleradores de borde con cobertura de operadores limitada. El entrenamiento se realiza mediante destilacion de conocimiento desde los codificadores de imagen de CLIP ViT-L/14 y ResNet50 CLIP sobre ImageNet-1k. Se realizaron 18 experimentos (2 profesores x 9 arquitecturas de estudiante), siendo efflite4 el modelo destacado, destilado de CLIP ViT-L/14.

La destilacion usa los embeddings de texto de las 80 plantillas de prompts de OpenAI para ImageNet, promediados para generar representaciones de las 1000 clases. El grafo int8 emite embeddings de imagen sin normalizar L2; la normalizacion se deja al host despues de la dequantizacion para mantener el subgrafo del acelerador libre de operaciones de reduccion. El grafo se compila con el compilador edgetpu_compiler 16.0 para el Coral Edge TPU.

## Capacidades

- Clasificacion zero-shot de imagenes: clasifica imagenes en categorias arbitrarias sin reentrenamiento, cambiando las frases de texto de las clases.
- Ejecucion completa en acelerador: los 116 operadores del grafo int8 se ejecutan en el Edge TPU, sin operaciones en CPU.
- Eficiencia de parametros: 12,71 millones de parametros frente a los 428 millones del profesor CLIP ViT-L/14, con una perdida de unos 7 puntos de precision.
- Vocabulario abierto: permite definir clases arbitrarias codificando prompts y almacenando sus embeddings de texto.
- Compatibilidad TFLite: se distribuye como grafo int8 TFLite, ejecutable en cualquier runtime TFLite (CPU) o en el Edge TPU, sin dependencias de PyTorch.
- Preprocesamiento verificado: el script de ejemplo incluye un preprocesamiento bit-equivalente al del entrenamiento, documentado de forma legible por maquina.

## Casos de uso

- Clasificacion en tiempo real en dispositivos IoT: el modelo puede ejecutarse en un Coral Edge TPU conectado a una Raspberry Pi, clasificando imagenes a 37,8 FPS con latencia de 26,49 ms por fotograma, sin conexion a la nube.
- Moderacion de contenido en el borde: plataformas de contenido pueden filtrar imagenes no deseadas (violencia, contenido explicito) directamente en el dispositivo del usuario, preservando la privacidad y reduciendo la latencia de moderacion.
- Inventario automatizado en retail: un sistema de vision en una tienda puede identificar productos en estanterias usando prompts de texto personalizados, actualizando el inventario sin reentrenar el modelo para cada categoria nueva.
- Clasificacion de imagenes medicas en el punto de atencion: en entornos con recursos limitados, el modelo puede clasificar imagenes diagnosticas (p. ej., radiografias) con categorias definidas por prompt, sin depender de un servidor central.
- Vision artificial para robots de bajo consumo: robots autonomos o drones con procesadores de borde pueden usar el modelo para identificar obstaculos u objetos con un coste computacional minimo y un grafo de 13,6 MiB.
- Etiquetado de bibliotecas de fotos en el dispositivo: aplicaciones de fotografia que etiquetan imagenes automaticamente usando prompts personalizados (paisaje, retrato, animal, evento), todo en local.

## Benchmarks y rendimiento

Evaluado en el conjunto completo de validacion de ImageNet-1k (50.000 imagenes) con el interprete TFLite de CPU. La precision en el dispositivo (int8 en Edge TPU) coincide con la evaluacion en CPU con una discrepancia media de 0,48 puntos porcentuales en los 18 experimentos.

| Metrica | Valor |
|---|---|
| Top-1 zero-shot (fp32) | 68,35% |
| Top-1 zero-shot (int8) | 68,25% |
| Coste de cuantizacion | 0,10 puntos porcentuales |
| Latencia (Coral USB Edge TPU) | 26,49 ms/fotograma (37,8 FPS) |
| Tamano del grafo int8 | 13,6 MiB |
| Operadores en el acelerador | 116 de 116 (0 en CPU) |

## Requisitos de hardware

- VRAM: no se requiere VRAM dedicada; el grafo int8 pesa 13,6 MiB y se ejecuta en aceleradores de borde.
- GPU recomendadas: no se necesita GPU; el modelo se ejecuta en Coral USB Edge TPU o cualquier runtime TFLite en CPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo esta disenado para hardware de borde, aunque puede ejecutarse en CPU en cualquier sistema con Python.
- Opciones de despliegue: TFLite runtime (CPU), Coral Edge TPU (compilado con edgetpu_compiler 16.0), o a traves de la API de Python con `tflite-runtime` sin dependencias de PyTorch.
- Latencia y throughput: 26,49 ms/fotograma (37,8 FPS) medidos en Coral USB Edge TPU con un lote de 500 fotogramas, descartando el primero.

## Comparativa con modelos similares

| Modelo | Parametros | ImageNet top-1 zero-shot | Formato | Licencia |
|---|---|---|---|---|
| ReLU-CLIP efflite4 (int8) | 12,71M | 68,25% | TFLite int8 | MIT |
| CLIP ViT-L/14 (profesor) | 428M | 75,5% | PyTorch | MIT |
| CLIP ResNet50 | 38M
