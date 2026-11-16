# AcademiaSD/Ernie-NF4-for-LoRA-Training

## Resumen

ERNIE-Image es un modelo de generación de imágenes texto-a-imagen desarrollado por el equipo ERNIE-Image de Baidu. Se construye sobre un Diffusion Transformer (DiT) de flujo único y se acompaña de un Prompt Enhancer ligero que expande instrucciones breves en descripciones estructuradas más ricas. Con solo 8B de parámetros en el DiT, el modelo alcanza un rendimiento competitivo frente a modelos de pesos abiertos sustancialmente mayores, destacando en seguimiento de instrucciones complejas, renderizado de texto y generación de imágenes estructuradas.

El repositorio concreto que nos ocupa, `AcademiaSD/Ernie-NF4-for-LoRA-Training`, es una variante cuantizada en NF4 del modelo ERNIE-Image, empaquetada específicamente para facilitar el entrenamiento de adaptadores LoRA sobre él. No se trata del modelo original de Baidu, sino de una redistribución comunitaria orientada a *fine-tuning* con requisitos de memoria reducidos. El tamaño del repositorio es de 7,2 GB y la licencia declarada es Apache 2.0.

Su relevancia actual radica en que permite adaptar un modelo de difusión de 8B en GPUs de consumo, algo que con los pesos en precisión completa resultaría inviable en hardware de gama alta doméstica. La existencia de una versión NF4 dedicada a LoRA reduce la barrera de entrada para investigación y personalización, aunque conviene tener presente que el autor del repositorio no es el desarrollador original del modelo y que la documentación específica de esta variante es mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único, con Prompt Enhancer ligero |
| Parámetros totales | 8B (DiT); la model card indica también `model_size: 7B` |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NF4 (esta variante); el modelo original se distribuye en precisión completa |
| Idiomas soportados | No disponible (el modelo genera imágenes a partir de prompts; no se detalla cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

ERNIE-Image se basa en un Diffusion Transformer de flujo único de 8B parámetros, la arquitectura dominante en la generación de imágenes moderna. El modelo se complementa con un Prompt Enhancer ligero que transforma entradas breves del usuario en descripciones estructuradas y más ricas, lo que mejora el seguimiento de instrucciones en escenarios complejos. Existen dos versiones publicadas por Baidu: el modelo SFT, orientado a fidelidad general y que requiere unos 50 pasos de inferencia, y el modelo Turbo, optimizado mediante DMD y RL, que genera en solo 8 pasos con mayor atractivo estético.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso específico de RLHF o DPO en la información proporcionada. La model card sí menciona que la variante Turbo emplea DMD y RL como técnicas de optimización. La variante NF4 de este repositorio no documenta su proceso de cuantización más allá de la designación NF4 en el nombre, ni detalla qué componentes (DiT, VAE, text encoder) han sido cuantizados.

## Capacidades

- Generación de imágenes texto-a-imagen de alta calidad con un DiT de 8B parámetros.
- Renderizado de texto especialmente sólido en escenarios densos, de formato largo y sensibles al layout (pósteres, infografías, imágenes tipo UI).
- Seguimiento de instrucciones complejas con múltiples objetos, relaciones detalladas y descripciones intensivas en conocimiento.
- Generación estructurada para pósteres, cómics, storyboards y composiciones multipanel.
- Cobertura amplia de estilos: fotografía realista, imagen orientada a diseño y estéticas estilizadas con tonos cinematográficos.
- Prompt Enhancer integrado que expande prompts breves en descripciones estructuradas.
- Entrenamiento de adaptadores LoRA sobre la variante NF4 (objetivo específico de este repositorio).
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio, por tratarse de un modelo de generación de imágenes.

## Casos de uso

- Creación de pósteres comerciales: el modelo destaca en renderizado de texto denso y layout sensible, por lo que puede generar carteles con titulares, subtítulos y bloques de texto legibles en una sola pasada, reduciendo el retoque posterior en herramientas de diseño.
- Generación de cómics y storyboards: su capacidad de composición multipanel y generación estructurada permite producir viñetas coherentes con descripciones de escena detalladas, útil en preproducción audiovisual y narrativa gráfica.
- Infografías e imágenes tipo interfaz: el buen rendimiento en texto de formato largo lo hace adecuado para maquetas de UI, capturas simuladas y material divulgativo con rótulos.
- Personalización de estilo mediante LoRA: esta variante NF4 está pensada para entrenar adaptadores sobre el modelo con memoria reducida, permitiendo a estudios pequeños o investigadores crear estilos de marca propios en GPUs de 24 GB.
- Prototipado rápido de material gráfico: con la versión Turbo (8 pasos) o el modelo SFT (50 pasos) se pueden iterar conceptos visuales en minutos, integrando el pipeline de diffusers en flujos de diseño automatizados.
- Investigación en eficiencia de difusión: al ser una cuantización NF4 de un DiT de 8B, sirve como banco de pruebas para estudiar el impacto de la cuantización en calidad visual y en el entrenamiento de adaptadores.
- Generación de imágenes para documentación técnica o educativa: la fidelidad a instrucciones con múltiples objetos y relaciones facilita ilustrar conceptos con varios elementos y vínculos explícitos.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original ERNIE-Image y a ERNIE-Image-Turbo, no a esta variante NF4. Se presentan a título de referencia del modelo base.

GENEval:

| Modelo | Single Object | Two Object | Counting | Colors | Position | Attribute Binding | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|
| ERNIE-Image (sin PE) | 1,0000 | 0,9596 | 0,7781 | 0,9282 | 0,8550 | 0,7925 | 0,8856 |
| ERNIE-Image (con PE) | 0,9906 | 0,9596 | 0,8187 | 0,8830 | 0,8625 | 0,7225 | 0,8728 |
| Qwen-Image | 0,9900 | 0,9200 | 0,8900 | 0,8800 | 0,7600 | 0,7700 | 0,8683 |
| ERNIE-Image-Turbo (sin PE) | 1,0000 | 0,9621 | 0,7906 | 0,9202 | 0,7975 | 0,7300 | 0,8667 |
| ERNIE-Image-Turbo (con PE) | 0,9938 | 0,9419 | 0,8375 | 0,8351 | 0,7950 | 0,7025 | 0,8510 |
| FLUX.2-klein-9B | 0,9313 | 0,9571 | 0,8281 | 0,9149 | 0,7175 | 0,7400 | 0,8481 |
| Z-Image | 1,0000 | 0,9400 | 0,7800 | 0,9300 | 0,6200 | 0,7700 | 0,8400 |

OneIG-EN:

| Modelo | Alignment | Text | Reasoning | Style | Diversity | Overall |
|---|---:|---:|---:|---:|---:|---:|
| Nano Banana 2.0 | 0,8880 | 0,9440 | 0,3340 | 0,4810 | 0,2450 | 0,5780 |
| Seedream 4.5 | 0,8910 | 0,9980 | 0,3500 | 0,4340 | 0,2070 | 0,5760 |
| ERNIE-Image (con PE) | 0,8678 | 0,9788 | 0,3566 | 0,4309 | 0,2411 | 0,5750 |
| Seedream 4.0 | 0,8920 | 0,9830 | 0,3470 | 0,4530 | 0,1910 | 0,5730 |
| ERNIE-Image-Turbo (con PE) | 0,8676 | 0,9666 | 0,3537 | 0,4191 | 0,2212 | 0,5656 |
| ERNIE-Image (sin PE) | 0,8909 | 0,9668 | 0,2950 | 0,4471 | 0,1687 | 0,5537 |
| Z-Image | 0,8810 | 0,9870 | 0,2800 | 0,3870 | 0,1940 | 0,5460 |
| Qwen-Image | 0,8820 | 0,8910 | 0,3060 | 0,4180 | 0,1970 | 0,5390 |
| FLUX.2-klein-9B | 0,8871 | 0,8657 | 0,3117 | 0,4417 | 0,1560 | 0,5324 |

No se han publicado resultados de benchmarks específicos para la variante NF4 en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 8B puede ejecutarse en GPUs de consumo con 24 GB de VRAM según la model card del autor original. La variante NF4 reduce adicionalmente el peso de los pesos, por lo que el margen de memoria para entrenamiento LoRA debería ser mayor, aunque no se documenta una cifra concreta para esta variante.
- GPU recomendadas: RTX 4090 (24 GB) como opción de consumo para inferencia y entrenamiento LoRA ligero; A100 (40/80 GB) y H100 para entrenamiento más holgado y lotes mayores.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090, según los requisitos del modelo base. Para GPUs de 16 GB o menos no hay confirmación en la información disponible.
- Opciones de despliegue: al usar la librería diffusers y el pipeline `ErnieImagePipeline`, la integración natural es mediante diffusers. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje y no a difusión.
- Latencia y throughput: no disponibles para esta variante. Como referencia, el modelo SFT requiere unos 50 pasos de inferencia y el Turbo unos 8 pasos, lo que sugiere una latencia sensiblemente menor en Turbo, pero no se aportan tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GENEval Overall | OneIG-EN Overall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ERNIE-Image | 8B DiT | No disponible | 0,8856 (sin PE) | 0,5750 (con PE) | Apache 2.0 | Hugging Face, ModelScope |
| Qwen-Image | No disponible | No disponible | 0,8683 | 0,5390 | No disponible | Hugging Face |
| FLUX.2-klein-9B | 9B | No disponible | 0,8481 | 0,5324 | No disponible | Hugging Face |
| Z-Image | No disponible | No disponible | 0,8400 | 0,5460 | No disponible | Hugging Face |

Las cifras corresponden a los modelos originales; esta variante NF4 no dispone de métricas propias publicadas. La comparativa se limita a los benchmarks reportados en la model card del modelo base.

## Limitaciones y advertencias

- Esta variante NF4 es una redistribución comunitaria (`AcademiaSD`), no una publicación oficial de Baidu; no hay garantía de equivalencia funcional exacta con el modelo original.
- No se documenta qué componentes están cuantizados ni el impacto de la cuantización NF4 en la calidad visual o en la estabilidad del entrenamiento LoRA.
- La model card del repositorio es esencialmente la del modelo original; no aporta instrucciones específicas de uso, hiperparámetros recomendados ni recetas de entrenamiento para esta variante.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir texto ilegible, objetos mal formados o incoherencias en escenas complejas, especialmente con prompts ambiguos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base, no detallados.
- Limitaciones de idioma: no se especifica cobertura lingüística de los prompts; el rendimiento con prompts en castellano no está verificado.
- El Prompt Enhancer puede alterar la intención original del prompt; los benchmarks muestran diferencias notables con y sin PE en algunas métricas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes derivados y del modelo base original.
- Para producción, la falta de benchmarks de la variante NF4 obliga a validar la calidad frente al modelo en precisión completa antes de desplegar.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/AcademiaSD/Ernie-NF4-for-LoRA-Training
- Modelo original ERNIE-Image: https://huggingface.co/Baidu/ERNIE-Image
- Modelo ERNIE-Image-Turbo: https://huggingface.co/Baidu/ERNIE-Image-Turbo
- ModelScope ERNIE-Image: https://www.modelscope.cn/models/PaddlePaddle/ERNIE-Image/summary
- ModelScope ERNIE-Image-Turbo: https://www.modelscope.cn/models/PaddlePaddle/ERNIE-Image-Turbo/summary
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/ERNIE-Image-Turbo
- Demo ZeroGPU: https://huggingface.co/spaces/akhaliq/ERNIE-Image-Turbo
- Demo en AI Studio: https://aistudio.baidu.com/ernieimage
- Repositorio GitHub: https://github.com/baidu/ernie-image
- Blog: https://yiyan.baidu.com/blog/posts/ernie-image
- Galería de ejemplos: https://ernieimageprompt.com/
- Discord: https://discord.gg/ByUTbjfG5k
- X (Twitter): https://x.com/ErnieforDevs
