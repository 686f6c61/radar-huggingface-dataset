# realrebelai/Viggle_Qwen-Image-2.1-Turbo_GGUFs

## Resumen

Viggle Qwen-Image 2.1 Turbo GGUFs es un conjunto de cuantizaciones GGUF de precisión mixta del transformer de difusión de `Viggle/Qwen-Image-2.1-viggle-turbo`, un modelo de generación y edición de imágenes derivado de Qwen-Image 2.1 y destilado por Viggle para funcionar en 4 pasos. El repositorio lo publica el usuario RealRebelAI y su propósito es facilitar la ejecución del modelo en entornos con VRAM limitada mediante ComfyUI y el nodo ComfyUI-GGUF, sin necesidad de cargar los safetensors en BF16.

El modelo base es un transformer de difusión de aproximadamente 7.115 millones de parámetros (unos 7,1 mil millones), con un encoder de texto Qwen3-VL y un VAE específicos de Qwen-Image 2.1 que no se incluyen en este repositorio. La aportación principal del autor es una escalera de cuantización (de Q8_0 a Q2_K) construida directamente desde un maestro BF16, con política de precisión mixta HQv3 que mantiene en mayor precisión las proyecciones de atención y ciertos módulos de la rama de imagen.

Es relevante ahora porque Qwen-Image 2.1 es una familia reciente de generación de imágenes y el soporte GGUF para su arquitectura todavía está madurando. El propio autor advierte de que la salida del runtime GGUF no reproduce exactamente la del transformer original, incluso a precisión equivalente a BF16, por lo que estos ficheros deben considerarse conversiones prácticas para la comunidad y no réplicas fieles del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen Image 2.1); arquitectura GGUF declarada como `qwen_image` |
| Parametros totales | 7.115.124.736 (dato de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K (todos en variante HQv3 de precisión mixta) |
| Idiomas soportados | no disponible |
| Licencia | unknown (el autor remite a las licencias de Viggle/Qwen-Image-2.1-viggle-turbo y Qwen/Qwen-Image-2.1) |
| Formato de pesos | GGUF (solo el transformer de difusión) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el transformer de difusión, no el pipeline completo. El modelo base, Qwen-Image 2.1, emplea la implementación de transformer de Qwen Image 2.1; Viggle ha destilado ese transformer para obtener un estudiante de 4 pasos con configuración de scheduler FlowMatch Euler. Los ficheros publicados declaran `general.architecture = qwen_image` para mantener compatibilidad con las instalaciones actuales de ComfyUI-GGUF, aunque el modelo upstream use una implementación más reciente.

La conversión parte del fichero `transformer/diffusion_pytorch_model.safetensors` del modelo de Viggle, verificado byte a byte por SHA256 (`a011a284b2dcb4b5f73aa7041b770d6bbff601bbb0850f3b6d49740b567b24e5`). Cada nivel de cuantización se genera directamente desde el maestro BF16, sin cascada entre niveles, para evitar la acumulación de error. La política HQv3 mantiene en Q8_0 las proyecciones Q/K/V/Out de atención y los módulos `img_mlp.out` e `img_mlp.gate_up` en los niveles altos, degradándolos progresivamente en Q3 y Q2; además, los módulos `img_in`, `txt_in`, `time_text_embed`, `modulation`, `norm_out` y `proj_out` se conservan en mayor precisión. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de destilación más allá de la mención al estudiante de 4 pasos.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de Qwen-Image 2.1.
- Edición de imágenes, según la etiqueta `image-editing` del repositorio.
- Generación en 4 pasos de muestreo con CFG 1.0, sampler euler y scheduler simple, gracias a la destilación Turbo.
- Integración con ComfyUI mediante ComfyUI-GGUF para cargar el transformer cuantizado.
- Requiere componentes externos: encoder de texto Qwen3-VL, VAE de Qwen-Image 2.1 y nodos de condicionamiento compatibles.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento; es un modelo de imagen, no de lenguaje.

## Casos de uso

- Generación de imágenes en equipos con VRAM limitada: cargando el GGUF Q4_K_M en ComfyUI se puede ejecutar el transformer sin mantener los pesos en BF16, lo que permite trabajar en GPUs de consumo.
- Prototipado rápido de prompts: con 4 pasos y CFG 1.0, el ciclo de iteración sobre un prompt es corto, adecuado para explorar composiciones antes de fijar una idea.
- Edición de imágenes asistida: el pipeline base soporta edición, de modo que se puede usar el GGUF como motor de transformación sobre imágenes existentes en flujos de ComfyUI.
- Pruebas de compatibilidad de la cadena GGUF: útil para desarrolladores que quieran validar el soporte de Qwen Image 2.1 en ComfyUI-GGUF y reportar diferencias frente al transformer original.
- Despliegue en estaciones de trabajo sin GPU de datacenter: los niveles Q3_K_M y Q2_K permiten ejecutar el modelo en configuraciones de memoria muy ajustadas, asumiendo pérdidas en caras, anatomía y tipografía.
- Evaluación comparativa de cuantizaciones: la escalera generada desde un único maestro BF16 permite medir el impacto de cada nivel de bits sobre la fidelidad de composición e identidad en un mismo prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 34,1 GB, pero cada fichero GGUF se descarga por separado; el transformer tiene unos 7,1 mil millones de parámetros, por lo que el peso en memoria depende del nivel elegido.
- VRAM estimada para el transformer: aproximadamente 8 GB en Q8_0, 6-7 GB en Q6_K, 5-6 GB en Q5_K_M, 4-5 GB en Q4_K_M, 3-4 GB en Q3_K_M y 2-3 GB en Q2_K (estimación por número de parámetros y bits; no confirmada por el autor).
- A esa cifra hay que sumar la memoria del encoder de texto Qwen3-VL y del VAE de Qwen-Image 2.1, que no están incluidos en este repositorio.
- GPU recomendadas: el autor no especifica modelos concretos; por tamaño, Q4_K_M y Q5_K_M son aptos para GPUs de consumo con 8-12 GB de VRAM, mientras que Q8_0 requiere 12-16 GB o más.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF es el flujo documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un transformer de difusión de este tipo.
- Latencia y throughput: no disponibles; el modelo está destilado a 4 pasos, lo que reduce el número de evaluaciones del transformer frente a un modelo estándar de 20-50 pasos.
- Configuración recomendada por el autor: Steps 4, CFG 1.0, sampler euler, scheduler simple, negativo en blanco, denoise 1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Viggle Qwen-Image 2.1 Turbo GGUFs (este) | 7,1 mil millones | no disponible | GGUF | unknown | Cuantización comunitaria del transformer Turbo de 4 pasos |
| Viggle/Qwen-Image-2.1-viggle-turbo | no disponible | no disponible | safetensors | no disponible | Modelo upstream original; salida de referencia |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | safetensors | no disponible | Modelo base sin destilar de Qwen |
| realrebelai/Qwen-Image-2.1_GGUFs | no disponible | no disponible | GGUF | unknown | Misma política HQv3 aplicada al modelo base, sin Turbo |

## Limitaciones y advertencias

- El runtime GGUF no reproduce exactamente la salida del transformer upstream, incluso a precisión equivalente a BF16; pueden cambiar composición, identidad, ropa, detalles y estructura fina con el mismo prompt y semilla. El autor indica que el desajuste se observó antes de la cuantización de baja precisión.
- Los niveles Q3_K_M y Q2_K pueden degradar caras, anatomía, tipografía, texturas pequeñas, adherencia al prompt y fidelidad de edición.
- No se debe apilar el LoRA Viggle Turbo sobre estos GGUF: ya incorporan el transformer completo ajustado.
- El repositorio contiene solo el transformer; sin el encoder Qwen3-VL, el VAE y los nodos de condicionamiento de Qwen-Image 2.1 el modelo no funciona.
- La licencia figura como desconocida; el autor remite a las licencias de Viggle y Qwen, por lo que el uso comercial y la redistribución requieren revisar esos términos antes de producir.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación visual específicos; al ser un modelo de imagen, los sesgos dependerán de los datos de entrenamiento de Qwen-Image 2.1, no documentados aquí.
- El soporte GGUF para Qwen Image 2.1 está en evolución, por lo que la compatibilidad con futuras versiones de ComfyUI-GGUF no está garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/realrebelai/Viggle_Qwen-Image-2.1-Turbo_GGUFs
- Modelo base Viggle Turbo: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- GGUFs del modelo base Qwen-Image 2.1: https://huggingface.co/realrebelai/Qwen-Image-2.1_GGUFs
