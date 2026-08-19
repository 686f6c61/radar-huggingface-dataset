# maxgraf/sa3-variations-torch

## Resumen

Este repositorio contiene conversiones a float16 de los checkpoints de Stable Audio 3 de Stability AI, redistribuidos por Max Graf para la aplicacion de escritorio SA3 Variations. No se trata de un modelo nuevo, sino de una redistribucion de los pesos oficiales de Stability AI (stable-audio-3-medium y stable-audio-3-small-music) empaquetados para facilitar su instalacion sin necesidad de autenticacion en Hugging Face.

La conversion reduce el peso del checkpoint medium de 9,22 GB a 4,3 GB al pasar todos los tensores float32/float64 a float16. El encoder de texto T5Gemma se mantiene en bfloat16 para evitar problemas de overflow por la reduccion del rango exponencial. El autor ha verificado que la conversion produce resultados identicos al modelo original (correlacion de +1,000000 con 3 semillas).

La aplicacion SA3 Variations genera variaciones de samples musicales (estilo Splice) completamente en local: se introduce un one-shot o loop y se obtienen variaciones musicales y timbricas en unos 10 segundos por lote, sin subir nada a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Audio 3 (modelo text-to-audio de Stability AI, basado en los checkpoints medium y small-music) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (conversion desde fp32; el encoder T5Gemma se mantiene en bf16) |
| Idiomas soportados | no disponible |
| Licencia | stability-ai-community |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este repositorio no introduce una arquitectura nueva: contiene los pesos oficiales de los modelos stable-audio-3-medium y stable-audio-3-small-music de Stability AI, convertidos a float16 mediante el script `scripts/convert_weights_fp16.py` del repositorio de Max Graf. El modelo utiliza un encoder de texto T5Gemma (mantenido en bfloat16) y un pipeline de difusion para generacion de audio a partir de texto.

La conversion a fp16 es un cambio de almacenamiento, no de calidad: la aplicacion SA3 Variations ya cargaba los pesos con `model_half=True` en CUDA, por lo que la conversion a fp16 ocurria igualmente en tiempo de carga. El autor verifico que las generaciones con las mismas semillas son identicas entre el modelo fp32 original y la conversion fp16 (correlacion de +1,000000). Los tensores de enteros, indices, mascaras y booleanos no se modifican en la conversion.

## Capacidades

- Generacion de audio a partir de texto (text-to-audio), segun el pipeline declarado en el repositorio.
- Generacion de variaciones de samples musicales: a partir de un one-shot o loop, produce una serie de variaciones musicales y timbricas.
- Inferencia completamente local (on-device): no se sube ningun dato a la nube.
- Compatible con la aplicacion SA3 Variations para Windows, que usa PyTorch para inferencia con `model_half=True` en CUDA.
- El pipeline de inferencia de SA3 Variations esta implementado en C++/MLX, lo que permite a otros desarrolladores construir sus propios plugins JUCE.
- Cada directorio del repositorio es autocontenido (checkpoint, config y encoder de texto), lo que permite cargar el modelo con una ruta local sin acceso a red.

## Casos de uso

- Produccion musical: generar variaciones de samples de bateria, one-shots y loops para usar en pistas, sin depender de servicios en la nube como Splice.
- Integracion en DAW: la aplicacion SA3 Variations permite escuchar las variaciones generadas y arrastrarlas directamente al DAW, agilizando el flujo de trabajo creativo.
- Desarrollo de plugins de audio: el pipeline C++/MLX de inferencia puede servir de base para que otros desarrolladores construyan sus propios plugins JUCE con generacion de audio local.
- Generacion de audio sin conexion: al ejecutarse completamente en local, es util en entornos sin conectividad o donde la privacidad de los materiales de audio sea critica.
- Creacion de bibliotecas de samples personalizadas: generar variaciones de samples propios para ampliar una libreria musical con sonidos derivados sin coste adicional.
- Prototipado rapido de ideas musicales: generar variaciones de un sample en unos 10 segundos por lote para explorar direcciones creativas sin interrumpir el flujo de trabajo.
- Distribucion de modelos sin gate: al no requerir cuenta ni token de Hugging Face, este repositorio facilita la instalacion de la aplicacion SA3 Variations en entornos de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una verificacion de fidelidad de la conversion: correlacion de +1,000000 entre las generaciones del modelo fp32 original y la conversion fp16 con 3 semillas distintas.

## Requisitos de hardware

- La aplicacion SA3 Variations requiere CUDA en Windows para la inferencia con PyTorch (`model_half=True`).
- El repositorio incluye tambien un pipeline de inferencia C++/MLX, lo que sugiere compatibilidad con hardware Apple Silicon (MLX es el framework de Apple para aprendizaje automatico en sus chips).
- El checkpoint medium en fp16 ocupa 4,3 GB en disco (frente a 9,22 GB en fp32), mas 1,18 GB del encoder T5Gemma en bf16.
- El checkpoint small-music no tiene un tamano especificado en la informacion disponible.
- Un lote de generacion de variaciones tarda aproximadamente 10 segundos, segun la pagina del proyecto.
- Opciones de despliegue: aplicacion SA3 Variations para Windows, o pipeline C++/MLX para desarrollo de plugins JUCE.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|
| maxgraf/sa3-variations-torch (este repo) | fp16 safetensors | 4,3 GB (medium) + 1,18 GB encoder | stability-ai-community | Redistribucion sin gate de los pesos de Stable Audio 3 |
| stabilityai/stable-audio-3-medium | fp32 safetensors | 9,22 GB | stability-ai-community | Checkpoint original con acceso restringido (gated) |
| stabilityai/stable-audio-3-small-music | fp32 safetensors | no disponible | stability-ai-community | Variante pequena para musica |
| maxgraf/sa3-variations-models | no disponible | no disponible | no disponible | Repositorio hermano del mismo autor |

La principal diferencia frente a los modelos originales de Stability AI es el formato fp16 (mitad de peso en disco) y la ausencia de restriccion de acceso (no requiere cuenta ni token de Hugging Face). El rendimiento es identico, segun la verificacion del autor.

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo: es una redistribucion de los pesos de Stability AI. No esta afiliado ni respaldado por Stability AI.
- La licencia stability-ai-community hereda los terminos de los modelos originales de Stability AI, que deben leerse antes de usar los archivos. Puede haber restricciones para uso comercial.
- El encoder T5Gemma incluido esta sujeto adicionalmente a los Gemma Terms of Use de Google.
- La conversion a fp16 reduce la precision de los pesos, aunque el autor ha verificado que las generaciones son identicas al modelo fp32 con las mismas semillas.
- No se dispone de informacion sobre los idiomas soportados, la longitud de contexto ni el numero de parametros del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion y verificacion por parte de la comunidad es limitada.
- La aplicacion SA3 Variations esta orientada a Windows; el pipeline C++/MLX sugiere soporte para Apple Silicon, pero no se confirma compatibilidad con Linux.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maxgraf/sa3-variations-torch
- Repositorio hermano (modelos): https://huggingface.co/maxgraf/sa3-variations-models
- Pagina del proyecto SA3 Variations: https://maxgraf.space/projects/sa3-variations/
- Pagina personal de Max Graf: https://maxgraf.space/
- Repositorio de codigo y script de conversion: https://github.com/maxgraf96/stable-audio-3
- Modelo base (medium): https://huggingface.co/stabilityai/stable-audio-3-medium
- Modelo base (small-music): https://huggingface.co/stabilityai/stable-audio-3-small-music
- Coleccion Stable Audio 3 de Stability AI: https://huggingface.co/collections/stabilityai/stable-audio-3
- Publicacion en LinkedIn: https://www.linkedin.com/posts/max-graf_sa3-variations-splice-style-sample-variations-activity-7465692726408224768-nrgH
