# infosave/LTX-2.5-cmf

## Resumen

LTX-2.5-cmf es una distribución empaquetada del modelo de generación de vídeo y audio LTX-2.5 de Lightricks, cuantizado a 4 bits y convertido al formato CMF (Cortiq Model Format). El autor, infosave, ha logrado encapsular todos los componentes del modelo —el transformer de difusión audio-vídeo de 21 000 millones de parámetros, el codificador de prompts Gemma-4 12B, los VAE de vídeo y audio, los upscalers y el tokenizador— en un único archivo de 22,07 GB, frente a los 71,35 GB de la versión de referencia en safetensors. El objetivo principal es simplificar el despliegue: en lugar de depender de PyTorch, diffusers o CUDA, el modelo se ejecuta mediante `cortiq`, un binario Rust que hace *memory-mapping* del archivo y renderiza vídeo y audio en un solo proceso, con soporte para Vulkan, Metal y CPU como respaldo.

La relevancia de esta ficha radica en que representa un enfoque radicalmente distinto a la distribución habitual de modelos de IA: un único archivo autocontenido, sin dependencias de Python, que puede ejecutarse en una amplia gama de hardware. Aunque el modelo base es el mismo LTX-2.5 de Lightricks, la cuantización 4-bit y el formato CMF permiten reducir el espacio en disco en un factor de 3,2× y eliminan la necesidad de un *stack* de aprendizaje profundo tradicional. Es una opción atractiva para desarrolladores que buscan integrar generación de vídeo en entornos de producción con requisitos mínimos de infraestructura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión audio-vídeo (DiT) con 48 bloques, codificador de prompts Gemma-4 12B, VAE de vídeo 3D, VAE de audio, dos upscalers latentes y cabecera de duración |
| Parametros totales | 35 650 millones (35,65 B) en todos los componentes; el transformer principal tiene 21 B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo genera vídeo, no texto; la entrada es un prompt de texto) |
| Tipos de cuantizacion | 4 bits (formato q4tp, indicado en el nombre del archivo `ltx25-q4tp.cmf`) |
| Idiomas soportados | No disponible (el modelo base acepta prompts en inglés; no se especifican otros idiomas) |
| Licencia | ltx-2-community-license-agreement (licencia propia de Lightricks, con restricciones de uso comercial) |
| Formato de pesos | CMF (Cortiq Model Format), un único archivo binario con *memory-mapping*; contiene todos los tensores cuantizados y la configuración |

## Arquitectura y entrenamiento

El modelo base, LTX-2.5 de Lightricks, es un transformer de difusión que procesa simultáneamente vídeo y audio. El componente principal es un DiT de 21 000 millones de parámetros organizado en 48 bloques, que denoisa latentes de imagen y sonido de forma conjunta. El prompt se codifica mediante un modelo Gemma-4 de 12 000 millones de parámetros, cuyos embeddings se utilizan para *cross-attention* en el transformer. La decodificación se realiza con un VAE de vídeo 3D (con stride espacial de 32 y temporal de 8) y un VAE de audio independiente. Además, el modelo incluye dos upscalers latentes y una cabecera de duración que permite controlar la longitud temporal de la salida.

La versión distribuida en este repositorio es una cuantización 4-bit de todos los pesos (35,65 B) realizada por el autor, empaquetada en formato CMF. El proceso de cuantización no se detalla en la documentación, pero el formato CMF está diseñado para permitir el *memory-mapping* directo de los pesos, de modo que cada tensor se accede por demanda de página. El renderizado se realiza mediante el binario `cortiq`, que implementa la inferencia completa en Rust, incluyendo el *prompt encoding*, el denoising por pasos de Euler ancestral, el upscaling latente y la decodificación VAE. No se han publicado detalles sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación) en la información proporcionada.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de un prompt de texto: el modelo produce tanto las imágenes como la banda sonora en un único proceso de denoising.
- Generación de vídeo en resoluciones de hasta 768×512 píxeles con el modo `--two-stage`, que utiliza 8 pasos de Euler ancestral a media resolución, un upscaler latente ×2 y 3 pasos adicionales de refinamiento.
- Control de duración y resolución: la resolución debe ser múltiplo de 32 y el número de fotogramas debe ser de la forma `8k + 1` (por ejemplo, 49 fotogramas).
- Renderizado por etapas independientes: el binario `cortiq` permite ejecutar por separado el *prompt encoding* (`ltx-encode`), el denoising (`ltx-render`) y la decodificación, lo que facilita la depuración y la integración en pipelines.
- Salida en formato YUV4MPEG2 (`.y4m`) o secuencia de imágenes PPM, compatible con herramientas como ffmpeg para conversión a MP4 o GIF.
- Ejecución sin dependencias de Python: el runtime completo es un binario Rust que detecta la GPU en tiempo de ejecución (Vulkan en Linux/Windows, Metal en Apple silicon) y puede caer a CPU si no hay GPU disponible.
- Verificación de integridad: el comando `cortiq verify` comprueba el hash de cada tensor dentro del archivo CMF.

## Casos de uso

- **Prototipado rápido de vídeos creativos**: un diseñador o artista puede generar clips de corta duración (49 fotogramas a 24 fps, unos 2 segundos) a partir de una idea textual, sin necesidad de configurar un entorno de aprendizaje profundo. Basta con instalar el binario Rust y descargar el archivo CMF.
- **Integración en pipelines de postproducción**: al generar salida en YUV4MPEG2 o PPM, el modelo se puede conectar directamente a herramientas de edición de vídeo (ffmpeg, DaVinci Resolve) para composición, colorización o montaje automático.
- **Generación de contenido para redes sociales**: la posibilidad de generar vídeo y audio sincronizados en un solo paso permite crear clips cortos para plataformas como Instagram o TikTok, con prompts descriptivos y estilos variados (los ejemplos muestran escenas de cocina, neón urbano, naturaleza o artesanía).
- **Desarrollo de aplicaciones de generación de vídeo embebidas**: al ser un único binario sin dependencias externas, se puede integrar en aplicaciones de escritorio o servicios backend escritos en Rust, Go o C, mediante *system calls* o *binding* FFI.
- **Investigación en generación de vídeo**: los investigadores pueden estudiar el comportamiento del modelo cuantizado, comparar la calidad con la versión completa de 71 GB, o utilizar las etapas separadas (`ltx-encode`, `ltx-render`) para analizar las representaciones intermedias.
- **Despliegue en entornos con recursos limitados**: al requerir solo 22 GB de almacenamiento y poder ejecutarse en CPU, es viable para servidores sin GPU dedicada o para dispositivos con aceleración Vulkan/Metal, como portátiles con Apple silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye mediciones de tiempo de ejecución en una RTX 5090 con el archivo en `/dev/shm` (memoria RAM), para 49 fotogramas a 24 fps:

| Etapa | 384×256 | 768×512 (`--two-stage`) |
|---|---|---|
| *Prompt encoding* (Gemma-4 12B + conectores) | 28 s | 28 s |
| Denoising | 8 × 30 s | 8 × 30 s + 3 × 120 s |
| Upscaling latente | — | 25 s |
| VAE de vídeo | 50 s | 200 s |

Estos valores son indicativos del rendimiento en hardware de gama alta, pero no constituyen una evaluación comparativa con otros modelos. No se dispone de métricas como FVD, CLIP score o similitud con el texto.

## Requisitos de hardware

- **Almacenamiento**: el archivo CMF ocupa 22,07 GB. Se recomienda almacenarlo en disco local (SSD o NVMe) o en `/dev/shm` si se dispone de suficiente RAM; en sistemas de archivos de red (NFS, volúmenes de pods) el rendimiento se degrada drásticamente debido al *memory-mapping*.
- **VRAM**: no se especifica un requisito mínimo. Dado que el archivo completo se mapea en memoria y los pesos se cargan por demanda, se estima que se necesitan al menos 22 GB de VRAM para mantener todos los pesos en GPU. Sin embargo, el runtime puede ejecutarse en CPU si no hay GPU, con un rendimiento mucho menor.
- **GPU recomendada**: la model card utiliza una RTX 5090 (32 GB VRAM) para las mediciones. GPUs con 24 GB o más (RTX 4090, A100, H100) deberían ser suficientes para la resolución máxima de 768×512. Para resoluciones menores (384×256) podría bastar con 16 GB.
- **Opciones de despliegue**: el binario `cortiq` es la única vía de ejecución. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un formato propietario. La salida es en YUV4MPEG2 o PPM, que se convierte con ffmpeg.
- **Latencia y throughput**: según las mediciones, un vídeo de 49 fotogramas a 384×256 tarda aproximadamente 28 s (encoding) + 240 s (8 pasos de denoising) + 50 s (VAE) = unos 5,3 minutos en una RTX 5090. A 768×512 con `--two-stage`, el tiempo asciende a unos 28 + 240 + 360 + 25 + 200 = 853 s (≈14,2 minutos). No se indican valores de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **LTX-2.5-cmf (este)** | 35,65 B totales (21 B DiT) | No aplica | CMF 4-bit, 22 GB | ltx-2-community-license-agreement | HuggingFace |
| **Lightricks/LTX-2.5 (referencia)** | 35,65 B totales (21 B DiT) | No aplica | Safetensors, 71,35 GB | ltx-2-community-license-agreement | HuggingFace |
| **HunyuanVideo (Tencent)** | 13 B (DiT) + 3 B (VAE) | No aplica | Safetensors | Tencent Hunyuan Community License | HuggingFace |
| **Wan 2.1 (Alibaba)** | 14 B (DiT) | No aplica | Safetensors | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de generación de vídeo open source de tamaño similar. LTX-2.5-cmf ofrece la ventaja de un único archivo y un runtime sin dependencias, pero su licencia es más restrictiva que la de Wan 2.1 (Apache 2.0). No se dispone de datos de rendimiento objetivo para comparar la calidad de generación.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `ltx-2-community-license-agreement` de Lightricks impone condiciones específicas para uso comercial. Es necesario revisar el texto completo en el repositorio de Lightricks antes de utilizar el modelo en productos comerciales.
- **Riesgo de alucinaciones visuales y de audio**: como todo modelo generativo, LTX-2.5 puede producir contenido incoherente, artefactos visuales o sonidos irreales, especialmente con prompts ambiguos o complejos.
- **Resolución y duración limitadas**: la resolución máxima documentada en este archivo es de 768×512 (con `--two-stage`), y el número de fotogramas debe cumplir la restricción `8k + 1`. No se admite vídeo de mayor resolución ni duraciones arbitrarias.
- **Dependencia del formato CMF**: el modelo solo puede ejecutarse con el binario `cortiq`. No es compatible con herramientas estándar como ComfyUI, Diffusers o vLLM, lo que limita su integración en ecosistemas existentes.
- **Rendimiento en CPU**: aunque el runtime puede funcionar sin GPU, el *memory-mapping* de 22 GB y el denoising por pasos hacen que la generación en CPU sea extremadamente lenta (posiblemente horas por vídeo). No se proporcionan cifras concretas.
- **Sesgos y contenido**: no se ha publicado información sobre sesgos del modelo base. Es probable que herede sesgos de los datos de entrenamiento de LTX-2.5, que no se detallan.
- **Requisito de almacenamiento local**: el archivo debe residir en almacenamiento local; en sistemas de archivos de red el proceso puede quedar bloqueado en *page faults* y parecer colgado.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/infosave/LTX-2.5-cmf)
- [Modelo base Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Especificación del formato CMF](https://huggingface.co/infosave/cmf)
- [Página oficial de LTX-2.5](https://ltx.io/model/ltx-2-5)
- [Documentación de LTX-2.5](https://docs.ltx.io/models/ltx-2-5)
- [Licencia LTX-2 Community License Agreement](https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md)
- [Guía completa de LTX-2.5 en HackerNoon](https://hackernoon.com/ltx-25-a-complete-guide-to-lightricks-audio-video-ai-model)
