# Sergey321-345/XENON-IMAGEN

## Resumen

XENON IMAGEN 1 v0.5 es un checkpoint experimental de generación de imágenes texto-a-imagen desarrollado por XenLogic dentro de su proyecto de investigación XENON IMAGEN. Se trata de un modelo de difusión convolucional de tipo U-Net con condicionamiento espacial y una red de refinamiento residual, entrenado específicamente para generar composiciones geométricas coloreadas de dos objetos con control de posición izquierda/derecha. No emplea Stable Diffusion ni ningún pipeline preexistente: la arquitectura es propia y el checkpoint se distribuye como un state dictionary de PyTorch.

Con 30.323.593 parámetros (aproximadamente 30 M) y una resolución de salida de 32x32 píxeles, el modelo se sitúa en una escala muy reducida, propia de un experimento de laboratorio más que de un generador de imágenes de propósito general. El repositorio ocupa 0,1 GB y contiene un único archivo `model.safetensors` con los módulos base y de refinamiento.

Su relevancia es limitada fuera del ámbito de la investigación: sirve como banco de pruebas para estudiar condicionamiento espacial y denoising condicionado por texto en un régimen de recursos mínimos, pero no está pensado para producción ni para generación fotorrealista. La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional de difusión con condicionamiento espacial y red de refinamiento residual (PyTorch, no basada en Stable Diffusion) |
| Parametros totales | 30.323.593 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ru, en |
| Licencia | no disponible |
| Formato de pesos | safetensors (state dictionary de PyTorch) |
| Resolucion de salida | 32x32 px |
| Version | 0.5 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una U-Net convolucional de difusión personalizada, escrita en PyTorch, con dos componentes diferenciados: un módulo base de denoising y un módulo de refinamiento residual. Incorpora condicionamiento espacial, lo que permite controlar la posición relativa (izquierda/derecha) de los objetos generados, y denoising condicionado por texto. No se apoya en Stable Diffusion ni en componentes de Diffusers o Transformers estándar.

Según la model card, el entrenamiento se centró en una única tarea: composiciones geométricas coloreadas, incluyendo escenas de dos objetos con condicionamiento espacial. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. El autor indica que el modelo surgió de versiones experimentales sucesivas del proyecto XENON IMAGEN, sin detallar hiperparámetros, cronograma de difusión ni estrategia de muestreo.

## Capacidades

- Generación de formas geométricas coloreadas a partir de texto.
- Generación de composiciones de dos objetos en una misma imagen.
- Condicionamiento espacial izquierda/derecha para posicionar objetos.
- Denoising condicionado por texto (text-conditioned denoising).
- Soporte de prompts en ruso e inglés (según los metadatos de idioma).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- No es un generador fotorrealista ni de propósito general.

## Casos de uso

- Investigación sobre condicionamiento espacial: el modelo permite estudiar cómo una U-Net de difusión aprende a colocar dos objetos a izquierda y derecha según el prompt, con un coste computacional mínimo y un checkpoint de 0,1 GB fácil de versionar.
- Docencia y divulgación de modelos de difusión: sirve para explicar el funcionamiento interno de una U-Net de denoising y de una red de refinamiento residual sin la complejidad de un modelo grande, ya que el state dictionary es inspeccionable y ligero.
- Pruebas de concepto de pipelines texto-a-imagen: útil para validar código de carga de safetensors, reconstrucción de clases Python y bucles de muestreo antes de escalar a modelos mayores.
- Generación de iconos o patrones geométricos simples en entornos con recursos muy limitados: con salida de 32x32 px y 30 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para prototipos de texturas o sprites de baja resolución.
- Benchmark de infraestructura de inferencia: al ser un modelo pequeño, permite medir latencia y throughput de frameworks de despliegue sin consumir VRAM significativa, como paso previo a pruebas con modelos de producción.
- Estudio de robustez de prompts: la model card advierte de que algunos prompts de forma, color y posición pueden fallar, lo que lo convierte en un caso útil para analizar modos de fallo en condicionamiento texto-espacio en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 30,3 M de parámetros (el state dictionary completo ocupa aproximadamente 0,1 GB, lo que sugiere pesos en fp16 o similar); no disponible el desglose exacto por módulo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; también es viable en CPU para pruebas puntuales.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1050 o superior, RTX 20xx/30xx/40xx) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un pipeline Diffusers estándar. Requiere reconstruir las clases Python originales de la arquitectura v0.5 y cargar el state dictionary con PyTorch.
- Latencia y throughput estimados: no disponibles; al tratarse de una U-Net de 30 M de parámetros y salida de 32x32, se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XENON IMAGEN 1 v0.5 | 30,3 M | 32x32 | U-Net de difusion custom | no disponible | Hugging Face (state dict) |
| Stable Diffusion 1.5 | ~860 M (U-Net) | 512x512 | U-Net de difusion | CreativeML OpenRAIL-M | Diffusers, muy extendido |
| Stable Diffusion XL Turbo | ~2,6 B (U-Net) | 512x512 | U-Net de difusion | OpenRAIL++-M | Diffusers, muy extendido |
| DALL-E mini / Craiyon | ~400 M | 256x256 | Transformer de difusion | no disponible | Hugging Face |

La comparativa es orientativa: XENON IMAGEN 1 v0.5 opera en una escala y una tarea (formas geométricas a 32x32) que no son directamente comparables con generadores de imágenes de propósito general. No se dispone de datos de rendimiento cuantitativos para situarlo frente a estas alternativas.

## Limitaciones y advertencias

- Checkpoint experimental de investigación: no es un generador texto-a-imagen fotorrealista ni de propósito general.
- Resolución muy baja (32x32 px), insuficiente para la mayoría de aplicaciones reales.
- Algunos prompts de forma, color y posición pueden fallar, según reconoce el propio autor.
- El archivo es un state dictionary de PyTorch, no un pipeline autónomo de Diffusers o Transformers; requiere las clases Python originales de la arquitectura v0.5 para reconstruir el modelo.
- Idiomas documentados limitados a ruso e inglés; el comportamiento en otros idiomas no está especificado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin datos publicados sobre sesgos, tasa de alucinación visual o robustez frente a prompts adversarios.
- Sin benchmarks ni métricas de calidad (FID, CLIP score, etc.) que permitan evaluar su rendimiento de forma objetiva.
- Descargas y likes nulos en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Sergey321-345/XENON-IMAGEN
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
