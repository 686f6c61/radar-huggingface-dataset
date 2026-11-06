# Cinv/cvstudio-illustrator

## Resumen

CV Studio illustrator es un paquete de conversiones listas para ejecución del modelo de difusión LCM_Dreamshaper_v7, orientado a la generación de ilustraciones en local (on-device) dentro de la aplicación de escritorio CV Studio. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada de pesos existentes: el equipo de CV Studio ha exportado el text encoder, el UNet y el decodificador a formatos Core ML y ONNX, aplicando cuantización para reducir el coste computacional y eliminar la dependencia de PyTorch en tiempo de inferencia.

El modelo subyacente es un latent consistency model (LCM) destilado de DreamShaper v7, un fine-tune de Stable Diffusion 1.5. Esto implica una arquitectura de difusión latente con un UNet de aproximadamente 860 millones de parámetros, un text encoder CLIP de 77 tokens de contexto y un decodificador ligero TAESD que sustituye al VAE estándar para acelerar la decodificación. La propuesta del LCM es generar imágenes en muy pocos pasos (4 en esta configuración) manteniendo una calidad razonable, lo que lo hace viable en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de despliegue de difusión en el escritorio sin GPU dedicada ni framework de deep learning completo; por otro, ilustra las implicaciones de licencia al redistribuir pesos derivados de un modelo con restricciones OpenRAIL-M bajo una licencia MIT declarada. El repositorio ocupa 1,9 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + text encoder CLIP + decodificador TAESD), destilada como latent consistency model |
| Parametros totales | no disponible (el modelo base SD 1.5 ronda los 860 M en el UNet; el dato exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de texto (ventana del text encoder CLIP) |
| Tipos de cuantizacion | Core ML: fp16 (text encoder), 6-bit palettised (UNet); ONNX: int8 dinámico (text encoder y UNet) |
| Idiomas soportados | no disponible (el prompt se procesa con el tokenizador CLIP del modelo base; no se declara cobertura idiomática) |
| Licencia | MIT declarada, con restricciones heredadas de CreativeML OpenRAIL-M del modelo base |
| Formato de pesos | Core ML (.mlpackage) y ONNX (.onnx), más tokenizer.json y manifest.json |

## Arquitectura y entrenamiento

La arquitectura es la de un modelo de difusión latente estándar de la familia Stable Diffusion 1.5: un text encoder CLIP que proyecta el prompt a un tensor de 1×77×768, un UNet que recibe el latente de ruido (1×4×64×64), el timestep y las condiciones textuales para predecir el ruido, y un decodificador que convierte el latente final en imagen RGB de 512×512. La particularidad es que el UNet incorpora internamente el embedding de guía LCM con w = 8, de modo que la inferencia se realiza en 4 pasos sin classifier-free guidance externo. El decodificador no es el VAE original, sino TAESD, un autoencoder diminuto que acelera la decodificación a costa de cierta fidelidad.

No ha habido entrenamiento ni reentrenamiento por parte de CV Studio: la model card indica explícitamente que no se han reentrenado pesos. El origen es LCM_Dreamshaper_v7 de Simian Luo et al., un latent consistency model destilado de DreamShaper v7 (fine-tune de SD 1.5 de Lykon). La innovación técnica del paquete es de ingeniería de despliegue: paletización de 6 bits del UNet en Core ML, cuantización int8 dinámica en ONNX, y empaquetado con un manifest.json que lista tamaños y hashes SHA-256 de cada archivo para verificación de integridad.

## Capacidades

- Generación de texto a imagen (text-to-image) de ilustraciones a 512×512 píxeles.
- Inferencia en 4 pasos LCM, lo que reduce drásticamente el coste frente a los 20-50 pasos típicos de SD 1.5.
- Ejecución on-device sin PyTorch en tiempo de ejecución: Core ML en macOS 14+ con Apple Silicon y ONNX Runtime en Windows (CPU o DirectML).
- Control de la fuerza de guía mediante el embedding LCM integrado (w = 8), sin necesidad de pasar guidance scale por paso.
- Decodificación rápida mediante TAESD, con salida RGB normalizada en [0, 1].
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo puramente generativo de imagen.
- Capacidad multilingüe: no disponible; depende del tokenizador CLIP del modelo base y no se documenta cobertura por idioma.

## Casos de uso

- Ilustración automática de vídeos por frase: la aplicación CV Studio genera una ilustración por cada frase del guion de un vídeo, ejecutando el modelo en la máquina del usuario. El LCM de 4 pasos y el decodificador TAESD hacen viable procesar decenas de frases sin GPU dedicada.
- Generación de ilustraciones en escritorio sin conexión: al empaquetar los pesos en Core ML y ONNX, la app puede funcionar offline y sin enviar prompts a servidores externos, lo que resulta adecuado para flujos con requisitos de privacidad.
- Prototipado rápido de assets visuales: equipos de diseño pueden generar bocetos de ilustración a 512×512 en local para iterar sobre conceptos antes de encargar arte final.
- Integración en pipelines de creación de contenido educativo: generación de imágenes de apoyo para materiales didácticos a partir de descripciones textuales cortas, aprovechando la ventana de 77 tokens del text encoder.
- Distribución en aplicaciones de escritorio multiplataforma: el par Core ML/ONNX permite cubrir macOS con Apple Silicon y Windows con CPU o DirectML desde un mismo repositorio, simplificando el empaquetado.
- Evaluación de técnicas de cuantización en difusión: el paquete sirve como referencia práctica para comparar paletización de 6 bits en Core ML frente a int8 dinámico en ONNX en términos de calidad y latencia.
- Generación de variaciones visuales para storyboards: con 4 pasos por imagen, se pueden producir varias propuestas por escena en una sola sesión de trabajo en portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de FID, CLIP score ni comparaciones cuantitativas con otros modelos; tampoco se declaran latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 1,9 GB; el UNet cuantizado a 6 bits (Core ML) o int8 (ONNX) reduce sustancialmente la huella frente a los aproximadamente 3,4 GB en fp16 del UNet de SD 1.5.
- GPU recomendadas: Apple Silicon (macOS 14+) para la ruta Core ML; en Windows, CPU o GPU compatible con DirectML a través de ONNX Runtime. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: el diseño apunta a hardware de consumo (portátiles y equipos de escritorio), dado el uso de cuantización agresiva y decodificador TAESD; no se detallan modelos mínimos.
- Opciones de despliegue: Core ML (ruta macOS) y ONNX Runtime con CPU o DirectML (ruta Windows). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Pasos de inferencia | Licencia | Formato |
|---|---|---|---|---|---|
| CV Studio illustrator (este) | no disponible (base SD 1.5) | 77 tokens | 4 (LCM) | MIT declarada + restricciones OpenRAIL-M heredadas | Core ML, ONNX |
| SimianLuo/LCM_Dreamshaper_v7 | no disponible (base SD 1.5) | 77 tokens | 4 (LCM) | MIT | safetensors (PyTorch) |
| DreamShaper v7 (Lykon) | no disponible (base SD 1.5) | 77 tokens | 20-50 típicos | CreativeML OpenRAIL-M | safetensors (PyTorch) |
| Stable Diffusion 1.5 | ~860 M (UNet) | 77 tokens | 20-50 típicos | CreativeML OpenRAIL-M | safetensors (PyTorch) |

La comparativa se limita a la línea genealógica del modelo, ya que no se dispone de datos de rendimiento publicados para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Resolución fija de 512×512 y ventana de texto de 77 tokens: prompts largos se truncan y no se soportan resoluciones superiores sin reentrenamiento o pipelines adicionales.
- El decodificador TAESD prioriza velocidad sobre fidelidad; puede introducir artefactos o pérdida de detalle frente al VAE original de SD 1.5.
- La cuantización a 6 bits (Core ML) e int8 dinámico (ONNX) puede degradar la calidad de imagen respecto a los pesos fp16 originales; no se documenta la magnitud de esa degradación.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base DreamShaper v7 y, en última instancia, de los datos de entrenamiento de Stable Diffusion 1.5; no se detallan sesgos específicos.
- Licencia: aunque el repositorio declara MIT, los pesos derivan de un modelo bajo CreativeML OpenRAIL-M. La model card indica que las restricciones de uso de OpenRAIL-M (Attachment A: prohibición de usos ilegales, dañinos, discriminatorios, difamatorios o engañosos, consejo médico, explotación de menores, etc.) se transmiten a los usuarios. Esto crea una posible ambigüedad jurídica entre la licencia declarada y las obligaciones heredadas; conviene revisarla antes de uso comercial.
- No se declaran idiomas soportados ni evaluación multilingüe; el comportamiento con prompts en castellano no está documentado.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, lo que limita la evidencia de uso en producción.
- No se ofrecen métricas de latencia ni de calidad, por lo que la idoneidad para un despliegue concreto debe validarse empíricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cinv/cvstudio-illustrator
- Modelo base LCM_Dreamshaper_v7: https://huggingface.co/SimianLuo/LCM_Dreamshaper_v7
- TAESD (Tiny AutoEncoder for Stable Diffusion): https://github.com/madebyollin/taesd
- DreamShaper v7 (Lykon): no disponible en la información proporcionada
- Paper de latent consistency models: no disponible en la información proporcionada
