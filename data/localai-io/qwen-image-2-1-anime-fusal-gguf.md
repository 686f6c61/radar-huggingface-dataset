# LocalAI-io/Qwen-Image-2.1-Anime-Fusal-GGUF

## Resumen

Qwen-Image-2.1-Anime-Fusal-GGUF es un ensamblado de runtime publicado por LocalAI-io que empaqueta un pipeline de generación de imágenes texto-a-imagen orientado a estilo anime. No es un checkpoint fusionado, sino una composición de cuatro componentes: el transformador de difusión Qwen Image 2.1, un codificador de texto derivado de Qwen3-VL-8B (versión "Heretic", sin censura), el VAE de Qwen Image 2.1 y un adaptador LoRA FUSAL de rango 80 que aporta el estilo anime concreto. El repositorio está preparado para ejecutarse con stable-diffusion.cpp y LocalAI.

El modelo resuelve el problema de desplegar localmente un generador de imágenes de alta calidad con estilización anime controlada, sin depender de servicios en la nube. Se apoya en la arquitectura de difusión de Qwen Image 2.1 para el denoising y en un codificador de texto Qwen3-VL para el condicionamiento semántico del prompt. La cuantización a GGUF (Q5_0 para el transformador, Q4_K_M para el encoder) permite ejecución en CPU, según la validación del propio autor.

Es relevante porque demuestra un patrón de empaquetado reproducible (procedencia byte a byte verificable mediante SHA256SUMS) para modelos de difusión en el ecosistema stable-diffusion.cpp, además de integrar un LoRA de estilo de rango elevado con mapeo completo de tensores (448/448 verificadas). Su licencia mixta (Qwen Research + Apache 2.0) restringe el uso comercial de los pesos de difusión, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusión (denoiser) Qwen Image 2.1 + encoder de texto Qwen3-VL-8B + VAE; adaptador LoRA FUSAL rango 80 |
| Parametros totales | 7.115.124.736 (dato safetensors reportado; corresponde al conjunto empaquetado) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_0 (transformador), Q4_K_M (encoder de texto), BF16 (VAE), BF16 (adaptador LoRA) |
| Idiomas soportados | no disponible |
| Licencia | Mixta: Qwen Research License Agreement (denoiser, VAE, adaptador FUSAL) + Apache 2.0 (encoder Heretic) |
| Formato de pesos | GGUF (transformador y encoder) y safetensors (VAE y adaptador) |

## Arquitectura y entrenamiento

El componente principal es el transformador de difusión de Qwen Image 2.1, cuantizado a Q5_0, que actúa como denoiser del proceso de difusión latente. El condicionamiento textual se realiza mediante un encoder Qwen3-VL-8B-1.3.0 "Heretic" cuantizado a Q4_K_M, una variante del modelo multimodal de Qwen sin pesos de visión en este paquete. El VAE de Qwen Image 2.1 se conserva en BF16 para evitar degradación en la decodificación latente. Sobre esta base se aplica el adaptador FUSAL `fusal-qwen-image-2.1-stack-exact-r80`, un LoRA de rango 80 en BF16 que aporta el estilo anime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que el repositorio es un ensamblado de runtime y no documenta el entrenamiento de los modelos base. La innovación técnica destacable es operativa: el paquete aplica los 448 tensores LoRA completos (mapeo fused-MLP) y exige una revisión de stable-diffusion.cpp con el fix `510bccf330a424cca742ca8084d78f4f577c9336` o posterior. La inferencia recomendada es de 30 a 40 pasos con muestreo Euler y CFG 1.0; el modo Turbo no es compatible con este adaptador. El autor advierte que el encoder cuantizado no es numéricamente idéntico al BF16 usado para cachear el condicionamiento de entrenamiento.

## Capacidades

- Generación de imágenes texto-a-imagen en formato PNG, con resolución de ejemplo de 1024x1024.
- Estilización anime mediante el adaptador FUSAL, invocado en el prompt con la sintaxis `<lora:fusal-qwen-image-2.1-stack-exact-r80:1.0>`.
- Formato de prompt específico: prefijo `fusal style.` seguido de `[TASK: TEXT_TO_IMAGE]` y la descripción.
- Control de pasos de muestreo (30-40 recomendados), sampler Euler y CFG 1.0.
- Ejecución en CPU mediante stable-diffusion.cpp y servicio de API compatible con `/v1/images/generations` en LocalAI.
- Contenido NSFW: el modelo base incluye material de entrenamiento para adultos, marcado como no apto para todas las audiencias.
- Sin soporte de edición por imagen de referencia: el encoder no incluye pesos de visión, por lo que se requiere un proyector Qwen3-VL o un encoder combinado para esa funcionalidad.
- Sin soporte de modo Turbo.

## Casos de uso

- Generación de arte anime para proyectos personales o de investigación: permite crear ilustraciones estilizadas a partir de descripciones textuales con un LoRA de rango 80, ejecutándose en local sin coste por API.
- Prototipado de pipelines de difusión en stable-diffusion.cpp: sirve como referencia reproducible para validar el mapeo de LoRA fused-MLP y la integración con LocalAI.
- Investigación sobre estilización mediante LoRA de rango elevado: el adaptador exacto r80 permite estudiar el efecto del rango en la fidelidad de estilo frente a adaptadores de menor rango.
- Despliegue en entornos sin GPU: al estar validado en CPU, es adecuado para estaciones de trabajo o servidores sin acelerador gráfico dedicado.
- Experimentación con encoders de texto alternativos: al usar Qwen3-VL-8B Heretic en lugar del encoder estándar, permite comparar el impacto del condicionamiento en la salida generada.
- Generación de imágenes NSFW controlada en investigación de moderación de contenido: facilita estudios sobre detección y filtrado de material para adultos en pipelines de generación.
- Autohospedaje con API tipo OpenAI: mediante LocalAI se puede exponer el modelo por HTTP y consumirlo desde aplicaciones existentes que ya hablan el protocolo de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es funcional: generación de un PNG válido en CPU con stable-diffusion.cpp commit `2988060a4338a5dcd94721c964a8e87003c1ac8b`, aplicando los 448/448 tensores LoRA.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 11,2 GB, y la suma de componentes cuantizados (transformador Q5_0 + encoder Q4_K_M + VAE BF16 + adaptador r80 BF16) define el espacio de trabajo mínimo aproximado.
- GPU recomendadas: no especificadas por el autor. Al estar validado en CPU, no requiere GPU obligatoriamente.
- Cabe en GPU de consumo: probable en tarjetas con 12-16 GB o más de VRAM según el tamaño de resolución y lote, aunque no está confirmado por el autor.
- Opciones de despliegue: stable-diffusion.cpp (con la revisión mínima indicada) y LocalAI, usando el archivo `qwen-image-2.1-anime-fusal.yaml` o la entrada de galería correspondiente.
- Latencia y throughput: no disponibles. El autor solo confirma validación en CPU sin métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Anime-Fusal-GGUF | Difusión + LoRA anime (GGUF) | 7,1 B (reportado) | no disponible | Mixta (Qwen Research + Apache 2.0) | HuggingFace, LocalAI |
| Qwen/Qwen-Image-2.1 (base) | Difusión texto-a-imagen | no disponible | no disponible | Qwen Research License | HuggingFace |
| MicksHF/Qwen-Image-2.1-Anime-Fusal | Difusión + LoRA anime (origen) | no disponible | no disponible | Qwen Research + Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo con alternativas como FLUX.1 o Stable Diffusion 3.5 en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el denoiser, el VAE y el adaptador FUSAL están sujetos al Qwen Research License Agreement, limitado a investigación y evaluación no comercial salvo autorización expresa de Qwen. El encoder Heretic es Apache 2.0.
- Contenido NSFW: el modelo base incluye material de entrenamiento para adultos y está marcado como no apto para todas las audiencias.
- El repositorio no concede derechos sobre obras de terceros, personajes, marcas ni datasets; el usuario es responsable del uso legal de las salidas generadas.
- No soporta edición por imagen de referencia sin un proyector de visión Qwen3-VL o un encoder combinado.
- No soporta modo Turbo.
- El encoder cuantizado (Q4_K_M) no es numéricamente idéntico al BF16 usado para cachear el condicionamiento de entrenamiento, lo que puede introducir variaciones en la salida.
- Se requiere una revisión concreta de stable-diffusion.cpp (fix `510bccf...` o posterior) para el mapeo completo del LoRA fused-MLP; versiones anteriores pueden no aplicar correctamente los tensores.
- Repositorio sin descargas ni valoraciones registradas en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Idiomas soportados no documentados, lo que impide garantizar calidad de prompt en idiomas distintos del usado en las pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LocalAI-io/Qwen-Image-2.1-Anime-Fusal-GGUF
- Modelo origen del ensamblado: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal
- Modelo base de difusión: https://huggingface.co/Qwen/Qwen-Image-2.1
- Encoder base: https://huggingface.co/DreamFast/Qwen3-VL-8B-Heretic-1.3.0
- Licencias del repositorio: https://huggingface.co/LocalAI-io/Qwen-Image-2.1-Anime-Fusal-GGUF/blob/main/LICENSES/README.md
- LocalAI (web oficial): https://localai.io/
- LocalAI (repositorio GitHub): https://github.com/mudler/LocalAI
- LocalAI (documentación de inicio rápido): https://localai.io/docs/basics/getting_started/
