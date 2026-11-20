# qmnvp/Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF es una derivada comunitaria del modelo Qwen3.8-Flash-Next, publicada por el usuario qmnvp en Hugging Face. Se trata de una versión podada a nivel de expertos de un modelo MoE multimodal (image-text-to-text) originalmente desarrollado por Qwen (Alibaba), que conserva 320 de los 512 expertos del modelo base y mantiene la capacidad de procesar imágenes y texto. El modelo parte de la cuantización UD-IQ3_XXS de Unsloth y aplica una selección de expertos orientada a tareas de código (C++ y Python), reutilizando el conjunto de expertos de las releases GSQ-RCO Coder de ISTA-DASLab.

La relevancia de esta ficha radica en que ejemplifica una práctica creciente en el ecosistema open source: la poda selectiva de expertos en modelos MoE de gran tamaño para reducir requisitos de memoria sin reentrenar, manteniendo el contexto largo (256k tokens según la model card) y las capacidades multimodales. El autor indica que el diseño busca encajar todos los expertos retenidos y el contexto de 256k en un presupuesto de memoria de aproximadamente 45 GB bajo el runtime Splash 1.5.0, dejando la tabla n-gram/PLE en SSD.

El modelo tiene 131.621.823.360 parámetros totales según los safetensors del repositorio, un tamaño de repo de 128 GB y está publicado bajo la licencia qwen-community-1.0. Es una derivada no oficial: no procede de Qwen, ni de ISTA-DASLab, ni de Unsloth, y el autor reconoce explícitamente que no se han realizado evaluaciones extensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal image-text-to-text, derivada de Qwen3.8-Flash-Next; 48 bloques con 320 expertos retenidos de 512 |
| Parametros totales | 131.621.823.360 |
| Parametros activos | no disponible |
| Longitud de contexto | 256k tokens (según model card) |
| Tipos de cuantizacion | GGUF UD-IQ3_XXS (expertos) + PLE Q8 (tabla n-gram) |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (dos shards) |

## Arquitectura y entrenamiento

El modelo es una derivada por poda de expertos de Qwen3.8-Flash-Next, un transformer MoE multimodal con 512 expertos por bloque. La intervención de qmnvp no implica reentrenamiento ni recuantización: se toman los pesos cuantizados UD-IQ3_XXS de Unsloth y se seleccionan 320 expertos por bloque mediante la herramienta prune_raw_gguf.py del repositorio webmp3/Sakura-Qwen3.8-Flash-Next-Overview. La selección combina 256 expertos de la release v2 de ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF con hasta 64 expertos adicionales de la release v1, completando con expertos en orden de saliencia cuando el remanente es positivo y descartando cuando es negativo. La tabla de asignación por bloque se detalla en la model card.

La tabla n-gram/PLE se toma del directorio UD-Q5_K_XL de Unsloth en cuantización Q8 y se mantiene fuera de memoria (en SSD) porque sus requisitos de ancho de banda son bajos. Los metadatos de shard se ajustaron para encajar en el diseño de dos shards de las releases basadas en ISTA. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que se trata de una derivada de pesos existentes sin entrenamiento adicional.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.8-Flash-Next.
- Capacidad multimodal image-text-to-text: procesa imágenes y texto de entrada (pipeline image-text-to-text).
- Enfoque en código: la selección de expertos está orientada a flujos de trabajo de C++ y Python en inglés, según indica el autor.
- Soporte de conversación multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidad de contexto largo: 256k tokens según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en C++ y Python: el autor indica que el modelo funciona bien en flujos de trabajo de código en estos lenguajes en inglés; se usaría como asistente de autocompletado, refactorización y explicación de código en un IDE o pipeline interno.
- Análisis de repositorios de gran tamaño: con 256k tokens de contexto, puede cargar varios ficheros fuente y documentación en una sola ventana para tareas de revisión de código y detección de dependencias entre módulos.
- Revisión de código con capturas de pantalla: al ser image-text-to-text, puede recibir diagramas de arquitectura o capturas de errores junto con el código para tareas de depuración asistida.
- Despliegue en entornos con memoria limitada: la poda a 320 expertos y la cuantización IQ3_XXS permiten ejecutar el modelo en un presupuesto de unos 45 GB bajo el runtime Splash 1.5.0, con la tabla PLE en SSD, lo que lo hace apto para estaciones de trabajo con una o dos GPU de gama alta.
- Generación de documentación técnica: a partir de código y diagramas de entrada, el modelo puede producir explicaciones y documentación en inglés para proyectos internos.
- Experimentación en investigación sobre poda de MoE: sirve como caso de estudio reproducible de selección de expertos por saliencia y de sustitución de cuantizaciones (ISTA IQ3_S frente a Unsloth UD-IQ3_XXS) sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se han realizado pruebas ni evaluaciones extensas y que el modelo "parece funcionar bien" en flujos de C++ y Python en inglés, sin aportar métricas.

## Requisitos de hardware

- VRAM estimada: el autor indica un presupuesto de memoria de aproximadamente 45 GB para todos los expertos retenidos y el contexto de 256k bajo el runtime Splash 1.5.0, con la tabla n-gram/PLE en SSD.
- Tamaño del repositorio: 128 GB en disco (pesos GGUF en dos shards).
- GPU recomendadas: no disponible de forma explícita; por el presupuesto de memoria indicado, se requiere al menos una GPU con 48 GB (A100 80GB, H100, o configuraciones multi-GPU consumer).
- GPU consumer: no cabe en una RTX 4090 (24 GB) con el presupuesto indicado; requeriría configuraciones multi-GPU o mayor uso de SSD, no documentado.
- Opciones de despliegue: runtime Splash 1.5.0 (mencionado por el autor); compatibilidad con endpoints (tag endpoints_compatible). Soporte de llama.cpp, Ollama, vLLM o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| qmnvp/Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF | 131.621.823.360 | 320 de 512 | 256k | qwen-community-1.0 | Derivada podada, IQ3_XXS + PLE Q8 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | no disponible | 320 (v2: 256 + v1) | no disponible | no disponible | Base de la selección de expertos; cuantización IQ3_S |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | 512 (completo) | no disponible | no disponible | Base no podada; fuente de UD-IQ3_XXS y PLE Q8 |
| sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit | no disponible | 288 | no disponible | no disponible | Poda alternativa en formato MLX 4-bit; fuente del orden de saliencia |

Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una derivada comunitaria no oficial: no procede de Qwen, ISTA-DASLab ni Unsloth, y el autor lo declara explícitamente.
- No se han publicado evaluaciones ni benchmarks; el rendimiento en producción es incierto y debe validarse antes de adoptarlo.
- La poda a 320 expertos descarta 192 expertos por bloque; en bloques con remanente negativo no se pudieron incluir todos los expertos distintos de la release Coder v1, lo que puede degradar capacidades fuera del dominio de código.
- El enfoque declarado es código en C++ y Python en inglés; el soporte multilingüe es limitado (idioma declarado: en).
- La licencia qwen-community-1.0 impone condiciones de uso comunitario; deben revisarse los términos del fichero LICENSE antes de uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta derivada.
- El despliegue depende del runtime Splash 1.5.0 y de mantener la tabla PLE en SSD; el rendimiento puede verse afectado por la latencia de disco.
- Los metadatos de shard fueron modificados manualmente para encajar en dos shards, lo que exige verificar la integridad de los ficheros al descargar.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qmnvp/Qwen3.8-Flash-Next-GSQ-RCO-Coder-320-PLE8-GGUF
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Cuantización UD-IQ3_XXS: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/tree/main/UD-IQ3_XXS
- Directorio UD-Q5_K_XL (fuente del PLE Q8): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/tree/main/UD-Q5_K_XL
- ISTA-DASLab GSQ-RCO Coder GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Asignación de expertos v2: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF/blob/6e7d79482a50748c9793ded946c7ba778defdc55/tensor-allocation/Qwen3.8-Flash-Next-GSQ-RCO-IQ1_M-00001-of-00002.rco-allocation.txt
- Asignación de expertos v1: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF/blob/b3b719cd2cfbaed7837aaa505fd9a7b412b312ee/tensor-allocation/Qwen3.8-Flash-Next-GSQ-RCO-IQ1_M-00001-of-00002.rco-allocation.txt
- Lista de saliencia REAP-288: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit/blob/main/manifests/qwen38-flash-next-512e_saliency_pinned.json
- Herramienta de poda prune_raw_gguf.py: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Overview/blob/main/tools/prune_raw_gguf.py
- Repositorio Sakura-Qwen3.8-Flash-Next-Overview: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Overview
- Runtime Splash: https://github.com/incoai/splash
