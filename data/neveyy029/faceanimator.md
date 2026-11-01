# NeveYY029/FaceAnimator

## Resumen

FaceAnimator es un paquete de activos de ejecución (runtime assets) para un sistema de animación facial audio-a-cara (audio-to-face, A2F). Lo publica el usuario NeveYY029 en Hugging Face bajo el identificador `NeveYY029/FaceAnimator`. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino del conjunto de pesos y ficheros de configuración que necesita el repositorio de código `FaceAnimator_a2f_delivery` (rama `feat/a2f-service-delivery`) para funcionar sin modificar rutas.

El sistema convierte audio de voz en parámetros de animación facial. La cadena de inferencia combina un extractor de características de audio basado en HuBERT (concretamente `chinese-hubert-base`), un checkpoint de inferencia (`fix_b3_1009_step74000.pt`) y una red de conversión de parámetros FLAME a blendshapes ARKit (`best_temporal_flame2bs.pth`). El resultado son coeficientes faciales compatibles con el modelo paramétrico FLAME y con el estándar de blendshapes de ARKit, lo que permite animar mallas faciales 3D a partir de voz.

Su relevancia es acotada pero concreta: facilita el despliegue reproducible de un pipeline A2F completo mediante una verificación de integridad SHA256 y una estructura de directorios fija. El paquete ocupa 0,4 GB y no incluye el fichero `generic_model.pkl` de FLAME por restricciones de licencia, por lo que el usuario debe obtenerlo por su cuenta desde los canales oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline audio-a-cara: extractor HuBERT + checkpoint de inferencia + red temporal FLAME-a-blendshapes ARKit |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`/`.pth`/`.bin`) |
| Idiomas soportados | no disponible (el extractor de audio es `chinese-hubert-base`, lo que sugiere orientación al chino) |
| Licencia | other (FLAME tiene licencia propia; `generic_model.pkl` no se distribuye) |
| Formato de pesos | PyTorch (`.pt`, `.pth`, `.bin`), NumPy (`.npy`), pickle (`.pkl`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del checkpoint principal `fix_b3_1009_step74000.pt` ni detalla el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es la composición del pipeline de inferencia: un extractor de características de audio `chinese-hubert-base` (configuración limpiada para usar la ruta relativa `chinese-hubert-base`, sin cambios en estructura ni pesos), un checkpoint de inferencia y una red de conversión FLAME-a-blendshapes con variantes temporal (`best_temporal_flame2bs.pth`), por frame (`best_frame_flame2bs.pth`) y MLP (`best_mlp_flame2bs.pth`).

El sistema utiliza el modelo paramétrico FLAME para la geometría facial, con dependencias como `landmark_embedding.npy` y `new_arkit_basis_matrix.npy`, lo que indica que la salida se proyecta sobre una base de blendshapes ARKit. La innovación destacable es la separación entre pesos de inferencia y activos de geometría, con verificación de integridad mediante `SHA256SUMS` y una estructura de directorios que replica las rutas de carga del código.

## Capacidades

- Conversión de audio de voz a parámetros de animación facial 3D (audio-to-face).
- Extracción de características de audio mediante HuBERT (`chinese-hubert-base`).
- Generación de coeficientes FLAME a partir de audio.
- Conversión de parámetros FLAME a blendshapes ARKit mediante red temporal, por frame o MLP.
- Integración con mallas faciales 3D basadas en el modelo FLAME.
- Verificación de integridad de los activos mediante SHA256.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Animación de avatares 3D en tiempo real: el pipeline convierte voz en blendshapes ARKit, lo que permite animar avatares faciales en aplicaciones de videollamada o metaverso sin captura facial por cámara.
- Doblaje y localización de vídeo: a partir de una pista de audio se generan parámetros faciales que pueden aplicarse a un personaje 3D para sincronizar labios y expresiones.
- Producción de contenido para VTubers: el sistema permite animar un modelo facial 3D a partir de la voz del streamer, con la red temporal `best_temporal_flame2bs.pth` para suavizar la animación entre frames.
- Prototipado de investigación en audio-to-face: el paquete facilita reproducir experimentos al incluir checkpoints, configuraciones y sumas de verificación.
- Integración en servicios HTTP: el README menciona modos de selección de modelo (`--f2b-model frame`, modo `mlp`) en la cadena HTTP fused, lo que sugiere despliegue como servicio.
- Generación de datos sintéticos faciales: los coeficientes FLAME y blendshapes ARKit pueden usarse para crear datasets de animación facial a partir de audio.
- Pruebas de regresión de pipelines A2F: la verificación SHA256 permite validar que los activos desplegados son los correctos en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo es de 0,4 GB, pero no se especifica el consumo de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el paquete está pensado para PyTorch y para el repositorio `FaceAnimator_a2f_delivery`, con una cadena HTTP fused y scripts offline. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de audio-to-face con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El paquete no incluye `generic_model.pkl` de FLAME por restricciones de licencia; el usuario debe obtenerlo desde los canales oficiales de FLAME y colocarlo en la ruta indicada.
- El fichero `generic_model.pkl` debe tener exactamente 53023716 bytes y md5 `cfc3b95159b2a8981ebc347170202ba5`; una versión incorrecta puede romper la inferencia.
- La licencia es `other` y está sujeta a los términos de FLAME, lo que condiciona el uso comercial; no se detallan los términos exactos.
- El extractor de audio es `chinese-hubert-base`, lo que sugiere un sesgo hacia el chino mandarín; no se documentan otros idiomas.
- No se proporcionan datos sobre sesgos, alucinaciones ni robustez del modelo.
- El código no está incluido en el paquete; se requiere la rama `feat/a2f-service-delivery` del repositorio correspondiente.
- El modelo tiene 0 descargas y 0 likes, sin validación comunitaria documentada.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/NeveYY029/FaceAnimator
- Repositorio de código: rama `feat/a2f-service-delivery` del proyecto `FaceAnimator_a2f_delivery` (no se proporciona URL directa en la información disponible)
- FLAME (modelo paramétrico facial): canal oficial de FLAME para obtener `generic_model.pkl` (no se proporciona URL directa en la información disponible)
