# CDuonggg/dlm-trajectory-qwen-translation-checkpoints

## Resumen

`CDuonggg/dlm-trajectory-qwen-translation-checkpoints` es una coleccion de checkpoints de investigacion derivados de Qwen3-0.6B, publicada por el usuario CDuonggg, orientada a experimentos de traduccion automatica y a la exploracion de metodos de entrenamiento por difusion sobre modelos de lenguaje. El repositorio no contiene un unico modelo de inferencia, sino un conjunto heterogeneo de artefactos: cuatro exportaciones SFT autorregresivas (AR) en formato safetensors para los pares de traduccion hacia arabe, irlandes, japones y turco, y siete checkpoints completos de entrenamiento en formato Orbax con el estado del optimizador incluido.

La relevancia del release es fundamentalmente metodologica. Los checkpoints `sc50` documentan una linea de entrenamiento por difusion con probabilidad de autocondicionamiento de 0,5, con variantes de 100k y 500k ejemplos y distintos puntos de seleccion (entre 37.500 y 125.000 actualizaciones del optimizador). El modelo `ar-dp-update1000` corresponde a una ejecucion de paralelismo de datos en dos nodos iniciada desde Qwen3-0.6B-Base, interrumpida por un fallo de memoria del host. Todo ello se publica con el codigo, las configuraciones de entrenamiento y los ficheros de bloqueo de dependencias para permitir la reproduccion.

Se trata, por tanto, de material para investigadores interesados en traduccion neuronal, difusion aplicada a texto y reproducibilidad de entrenamientos en JAX/Flax. No es un modelo listo para produccion: los bundles Orbax no son exportaciones de inferencia para Transformers y el autor advierte explicitamente que no se ha ejecutado una nueva prueba de entrenamiento o restauracion durante la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B); variantes de entrenamiento por difusion y AR |
| Parametros totales | no disponible (modelo base Qwen3-0.6B, aproximadamente 0,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en BF16/FP32 segun exportacion original; sin GGUF) |
| Idiomas soportados | en, tr, ar, ga, ja |
| Licencia | no disponible (el autor remite a las licencias upstream de Qwen y de las dependencias) |
| Formato de pesos | safetensors (exportaciones AR) y Orbax/Kauldron (checkpoints completos de entrenamiento) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre el se construyen dos lineas de entrenamiento claramente diferenciadas. La primera es una SFT autorregresiva clasica sobre 100k ejemplos de traduccion, con una exportacion independiente por idioma destino (`ar-sft-ar`, `ar-sft-ga`, `ar-sft-ja`, `ar-sft-tr`). La segunda es una linea de difusion (denominada SC50, con probabilidad de autocondicionamiento 0,5) que parte de los modelos AR turcos originales y se entrena con 100k y 500k ejemplos en configuraciones de tres y cuatro epocas.

Los checkpoints Orbax conservan el estado completo del entrenamiento (parametros y estado del optimizador), no solo los pesos de inferencia, y se organizan como workdirs de Kauldron con su `config.json` original y directorios `checkpoints/ckpt_<microstep>/`. El stack esta fijado mediante `pyproject.toml` y `uv.lock`: Python 3.12, JAX 0.8.3, Flax 0.12.6, Kauldron, Gemma y Optax, con extra `cuda13`. El autor subraya que las convenciones historicas de prompt, EOS y calculo de perdida estan guardadas en cada configuracion y no deben sustituirse al comparar resultados. La ejecucion AR con paralelismo de datos (`ar-dp-update1000`, dos nodos, EBS8) se inicializo desde Qwen3-0.6B-Base y alcanzo la actualizacion 1000 del optimizador (microstep 4000) antes de abortar por un fallo de memoria del host.

## Capacidades

- Traduccion automatica entre ingles y los idiomas turco, arabe, irlandes y japones, con un modelo SFT dedicado por par.
- Generacion de texto autoregresiva estandar al estar basada en Qwen3-0.6B.
- Entrenamiento e inferencia en ecosistema JAX/Flax mediante los checkpoints Orbax y el codigo incluido.
- Restauracion de estado completo de entrenamiento (parametros y optimizador) para continuar experimentos.
- Evaluacion reproducible con convenciones de prompt y perdida fijadas en las configuraciones historicas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en traduccion neuronal de bajo recurso: los pares hacia irlandes y turco permiten estudiar el comportamiento de un modelo de 0,6B en idiomas con menor volumen de datos paralelos, comparando las exportaciones AR con las variantes de difusion.
- Estudio de difusion aplicada a texto: los checkpoints `sc50` con autocondicionamiento a 0,5 y distintos puntos de seleccion permiten analizar la evolucion de la calidad a lo largo del entrenamiento (de 37.500 a 125.000 actualizaciones).
- Reproduccion de experimentos: el repositorio incluye codigo, configuraciones, `uv.lock` y `FILES.json` con SHA256, lo que facilita reconstruir el pipeline exacto en un entorno controlado.
- Analisis de estabilidad de entrenamiento distribuido: el checkpoint `ar-dp-update1000` documenta un caso real de fallo por memoria del host en un run de dos nodos, util para estudiar limites de escalado.
- Base para fine-tuning posterior: las exportaciones safetensors AR pueden cargarse con Transformers y servir como punto de partida para adaptaciones a nuevos pares de idiomas.
- Docencia y formacion: el conjunto ilustra buenas practicas de procedencia (hashes, catalogos, manifiestos de recuperacion) en la publicacion de artefactos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion. Para un modelo de aproximadamente 0,6B en BF16, la estimacion habitual rondaria 1,5-2 GB de pesos, pero el autor no proporciona cifras.
- GPU recomendadas: no disponible. El stack de entrenamiento esta probado con el contenedor NVIDIA JAX 25.10 y extra `cuda13`, lo que implica GPUs NVIDIA con soporte CUDA 13.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: los checkpoints Orbax requieren JAX, Flax y Kauldron con el stack fijado; las exportaciones safetensors AR pueden cargarse con PyTorch y Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dlm-trajectory-qwen-translation-checkpoints | ~0,6B (base Qwen3-0.6B) | no disponible | en, tr, ar, ga, ja | no disponible | safetensors, Orbax |
| Qwen3-0.6B (upstream) | ~0,6B | no disponible en esta ficha | multilingue amplio | licencia Qwen3 | safetensors, GGUF |
| NLLB-200 (Meta) | 0,6B-54B segun variante | 512 tokens tipicamente | 200 idiomas | CC-BY-NC (variantes abiertas) | safetensors, CTranslate2 |
| M2M-100 (Meta) | 418M-12B | 1024 tokens | 100 idiomas | MIT (pesos) | PyTorch |

La comparativa es orientativa: este repositorio es un conjunto de checkpoints de investigacion, no un modelo de traduccion empaquetado para uso general, por lo que la comparacion directa con NLLB o M2M-100 solo es valida tras exportar y evaluar los pesos con las convenciones del autor.

## Limitaciones y advertencias

- Los bundles Orbax no son exportaciones de inferencia para Transformers; requieren el stack JAX/Flax/Kauldron fijado y no funcionan directamente con herramientas convencionales.
- El autor no ejecuto una nueva prueba de entrenamiento ni de restauracion durante la publicacion; la verificacion se limita a la comprobacion de hashes contra inventarios previos.
- El checkpoint final de la tercera epoca de 500k esta excluido porque un fichero de datos de aproximadamente 2 GiB era ilegible en el sistema de archivos de origen.
- El checkpoint AR de ocho actualizaciones en un solo nodo no esta incluido.
- Las rutas absolutas historicas se conservan en codigo y configuraciones, lo que exige remapearlas en una copia de trabajo.
- La licencia no esta declarada de forma explicita; el uso comercial queda sujeto a las licencias upstream de Qwen y de las dependencias, sin garantias claras.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo pequeno entrenado para traduccion, cabe esperar degradacion fuera de los pares e idiomas cubiertos.
- No se incluyen datasets crudos, credenciales, logs de W&B ni historial de Git, lo que limita la auditoria completa del entrenamiento.
- Uso previsto exclusivamente de investigacion; no hay evidencia de validacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/CDuonggg/dlm-trajectory-qwen-translation-checkpoints
- Qwen3-0.6B-Base (modelo base upstream): no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
