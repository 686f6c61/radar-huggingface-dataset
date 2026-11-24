# dcharlot65-openie/Cactus-Whistle-LittleBit

## Resumen

`Cactus-Whistle-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado de `Cactus-Compute/whistle`, adaptado por el usuario `dcharlot65-openie` para su uso en JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native (JouleKube). El modelo aplica una factorización previa combinando LittleBit-2 (una técnica de cuantización sub-1-bit) con Sakana SVF (Singular Value Fine-tuning), generando un artefacto en formato `.jsyn` con compresión zstd y CRC32.

El modelo cuenta con 55.151.433 parámetros totales, lo que equivale a unos 105,19 MB en FP16, y se distribuye comprimido en 45,51 MB (2,31 veces más pequeño). El perfil de compresión declara una media de 3,3765 bits por peso (BPW), lo que lo sitúa lejos de un régimen sub-1-bit real pese a la etiqueta del repositorio. El checkpoint contiene 104 tensores de mapa de bits 2D y 12 vectores 1D (LayerNorm, bias y depthwise).

La relevancia del modelo es más experimental que práctica: explora la integración de pesos cuantizados con un motor de inferencia alternativo (JouleDB) y un modelo base de Cactus-Compute. El repositorio no incluye model card con detalles de arquitectura, datos de entrenamiento ni evaluación, y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Cactus-Compute/whistle; estructura interna no documentada) |
| Parametros totales | 55.151.433 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LittleBit-2 con factorizacion Sakana SVF; 3,3765 BPW medios; formato `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); 104 tensores 2D bitplane + 12 vectores 1D |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `Cactus-Compute/whistle` en la documentacion proporcionada: no se especifica si es un transformer denso, un modelo MoE, una arquitectura hibrida o un SSM. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovacion tecnica declarada es el proceso de factorizacion previa que combina LittleBit-2 (cuantizacion de pesos por debajo de 1 bit en su formulacion teorica) con Sakana SVF (Singular Value Fine-tuning), un metodo de ajuste fino que opera sobre los valores singulares de las matrices de pesos. El resultado se empaqueta en formato `.jsyn` con compresion zstd y verificacion CRC32, disenado para ser consumido por el runtime de JouleDB sin dependencia de PyTorch. El checkpoint incluye 104 tensores de mapa de bits 2D y 12 vectores 1D auxiliares (LayerNorm, bias y depthwise).

## Capacidades

- Generacion de texto: presumiblemente heredada del modelo base `Cactus-Compute/whistle`, aunque no se documentan capacidades concretas.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Integracion con JouleDB: carga via `hf_pull` y ejecucion en el runtime JouleDB sin PyTorch.

## Casos de uso

- Experimentacion con cuantizacion sub-1-bit: el modelo sirve como banco de pruebas para evaluar la viabilidad de la factorizacion LittleBit-2 + Sakana SVF sobre un modelo base pequeno (55 M de parametros) en entornos de investigacion.
- Despliegue en entornos Kubernetes-native: gracias a su integracion con JouleKube y al formato `.jsyn`, puede desplegarse como servicio de inferencia dentro de un cluster Kubernetes sin dependencias de PyTorch.
- Inferencia en dispositivos con recursos muy limitados: con 45,51 MB comprimidos y 3,3765 BPW, el checkpoint es adecuado para pruebas de concepto en hardware con restricciones severas de memoria y almacenamiento.
- Evaluacion de runtimes alternativos: util para comparar el rendimiento del runtime JouleDB frente a soluciones convencionales (llama.cpp, vLLM, Ollama) sobre el mismo modelo base.
- Investigacion sobre pesos "vivos" y ajuste por valores singulares: permite estudiar el comportamiento de Sakana SVF aplicado a un modelo de 55 M de parametros y su impacto en la calidad de las respuestas.
- Docencia y prototipado rapido: su tamano reducido y su licencia Apache 2.0 facilitan su uso en entornos academicos para ilustrar tecnicas de compresion y despliegue sin infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint comprimido ocupa 45,51 MB y el equivalente FP16 es de 105,19 MB, por lo que la huella de memoria es inferior a 1 GB en cualquier configuracion razonable.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) seria suficiente, aunque no se documenta soporte oficial.
- Cabe en GPU consumer: si, por tamano; no se especifican modelos concretos validados.
- Opciones de despliegue: JouleDB v0.2.4+ (`jouledb serve --http-addr 127.0.0.1:8080`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Cactus-Whistle-LittleBit | 55.151.433 | no disponible | Apache 2.0 | `.jsyn` (JouleDB) | Hugging Face |
| Cactus-Compute/whistle (base) | no disponible | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Modelos de ~50-60 M de parametros (p. ej. variantes de GPT-2 small, distilgpt2) | ~50-80 M | 1024 tokens (tipico) | variable | safetensors, GGUF | Hugging Face |

La comparativa con modelos de la misma categoria es limitada porque no se dispone de datos de rendimiento del modelo base ni de sus alternativas directas en la informacion proporcionada. El principal diferenciador de este checkpoint es su formato propietario `.jsyn` y su integracion con JouleDB, no sus capacidades de modelado.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y evaluacion: no es posible validar su calidad ni su comportamiento en produccion.
- El etiquetado "sub-1-bit" no se corresponde con el BPW declarado (3,3765 BPW), lo que puede inducir a error sobre el nivel real de compresion.
- Riesgo elevado de alucinacion y respuestas de baja calidad dado el reducido tamano del modelo base (55 M de parametros) y la falta de datos de ajuste.
- No se especifican los idiomas soportados; se desconoce si maneja castellano con fluidez.
- No hay evidencia de soporte para tool calling, agentes o razonamiento multi-paso.
- Dependencia de un runtime poco extendido (JouleDB) y de un formato propietario (`.jsyn`), lo que limita la portabilidad a otros ecosistemas de inferencia.
- Cero descargas y cero likes en Hugging Face: no existe validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de documentacion hace desaconsejable su uso en produccion sin una evaluacion previa exhaustiva.
- El repositorio tiene un tamano declarado de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el calculo de tamano no refleja el contenido real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/Cactus-Whistle-LittleBit
- Modelo base: https://huggingface.co/Cactus-Compute/whistle
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
