# dcharlot65-openie/Cactus-Mirage-LittleBit

## Resumen

Cactus-Mirage-LittleBit es un checkpoint de pesos "living weights" pre-factorizado que combina LittleBit-2 con Sakana SVF, adaptado a partir del modelo base Cactus-Compute/mirage por el usuario dcharlot65-openie. El modelo no se distribuye en un formato convencional de pesos de red neuronal, sino como un artefacto `.jsyn` destinado al motor JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch orientado a despliegues nativos en Kubernetes (JouleKube).

El checkpoint contiene 54.078.804 parámetros en su forma descomprimida, con 317 tensores en planos de bits bidimensionales y 266 vectores unidimensionales de LayerNorm, bias y convolución depthwise. Su rasgo más distintivo es la compresión sub-1-bit declarada, con un promedio de 2,7943 bits por peso (BPW) y un tamaño comprimido de 37,88 MB frente a los 103,15 MB que ocuparía el equivalente en FP16, lo que supone una reducción de 2,72x.

Es relevante ahora por su enfoque poco habitual: empaqueta un modelo pequeño en un formato de base de datos con verificación CRC32 y compresión zstd, y lo integra en una pila de despliegue Kubernetes-native. No obstante, la información pública disponible es muy limitada y no incluye datos de entrenamiento, benchmarks ni evaluación de capacidades, por lo que debe tratarse como un artefacto experimental de infraestructura más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint adaptado de Cactus-Compute/mirage; formato `.jsyn` de JouleDB) |
| Parametros totales | 54.078.804 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit declarado; 2,7943 BPW promedio; pesos en planos de bits (2D bitplane tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB), con compresion zstd y CRC32 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Cactus-Compute/mirage ni el proceso de entrenamiento. Lo que si se detalla es la transformacion aplicada: el checkpoint original se ha factorizado en 317 tensores bidimensionales de planos de bits y 266 vectores unidimensionales (LayerNorm, bias y convolucion depthwise), lo que sugiere una arquitectura con componentes convolucionales y de normalizacion ademas de las capas densas cuantizadas.

La innovacion tecnica declarada es la combinacion de LittleBit-2 (una tecnica de cuantizacion sub-1-bit) con Sakana SVF, empaquetada en el formato `.jsyn` de JouleDB con compresion zstd y suma de verificacion CRC32. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna tecnica de decodificacion especulativa, atencion lineal u otra optimizacion de inferencia mas alla del propio formato de almacenamiento.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible; el modelo base Cactus-Compute/mirage no documenta capacidades en la ficha proporcionada.
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).
- Capacidad especial: formato de pesos "living weights" integrado en JouleDB, con carga remota desde Hugging Face mediante `db.hf_pull` y despliegue Kubernetes-native a traves de JouleKube.

## Casos de uso

- Despliegue en clusters Kubernetes: el checkpoint esta disenado para cargarse en JouleKube, el sustrato nativo de Kubernetes de JouleDB, lo que permite servir el modelo como un recurso mas del cluster sin dependencia de PyTorch.
- Inferencia en entornos con memoria muy restringida: con 37,88 MB comprimidos y 2,7943 BPW, el artefacto cabe en dispositivos de borde o contenedores con limites de memoria muy ajustados donde un checkpoint FP16 de 103 MB no encajaria comodamente.
- Prototipado de pipelines de "living weights": util para experimentar con actualizacion o factorizacion de pesos en un formato de base de datos con verificacion de integridad CRC32.
- Distribucion de modelos con integridad verificable: el uso de CRC32 y zstd facilita pipelines de descarga y validacion en entornos de CI/CD donde la corrupcion de artefactos es un riesgo.
- Investigacion sobre cuantizacion sub-1-bit: sirve como referencia practica para estudiar la combinacion LittleBit-2 + Sakana SVF y su impacto en tamano y fidelidad.
- Entornos air-gapped o de borde con Kubernetes: al integrarse en JouleDB, puede desplegarse como servicio local sin depender de frameworks de aprendizaje profundo externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint comprimido ocupa 37,88 MB y el equivalente FP16 103,15 MB, por lo que el requisito de memoria es muy bajo en terminos de almacenamiento de pesos.
- GPU recomendadas: no disponible; no se documenta soporte de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no confirmada; el runtime JouleDB no declara backend CUDA en la informacion proporcionada.
- Opciones de despliegue: JouleDB v0.2.4 o superior (`jouledb serve --http-addr 127.0.0.1:8080`), con carga del modelo via `db.hf_pull`; despliegue Kubernetes-native mediante JouleKube. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y las caracteristicas del artefacto (formato `.jsyn`, runtime JouleDB, cuantizacion sub-1-bit) no permiten una comparacion directa con modelos convencionales de parametros similares sin datos de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas de calidad ni evaluaciones de capacidades, por lo que no es posible verificar el rendimiento real del modelo.
- Riesgo de alucinacion: desconocido, al no haber datos de evaluacion ni descripcion del entrenamiento.
- Sesgos conocidos: no documentados.
- Idiomas: no declarados; se desconoce si soporta castellano u otros idiomas.
- Dependencia de un runtime propietario de facto: el modelo solo es utilizable con JouleDB y el formato `.jsyn`, lo que limita la portabilidad y crea dependencia de una herramienta concreta.
- Madurez del ecosistema: JouleDB se encuentra en versiones 0.2.x y el checkpoint tiene cero descargas y cero likes, lo que sugiere un artefacto muy experimental y sin validacion comunitaria.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de garantias sobre calidad y el estado experimental del formato desaconsejan su uso en produccion sin evaluacion previa.
- Atribucion: al derivar de Cactus-Compute/mirage bajo Apache 2.0, deben conservarse los avisos de licencia y atribucion correspondientes.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Cactus-Mirage-LittleBit
- Modelo base: https://huggingface.co/Cactus-Compute/mirage
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
