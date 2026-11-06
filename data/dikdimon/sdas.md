# dikdimon/sdas

## Resumen

El repositorio `dikdimon/sdas` de Hugging Face no contiene un modelo de IA propiamente dicho, sino lo que parece ser un script de extension para interfaces de generacion de imagenes (A1111 y Forge) denominado "Mega FreeU". El contenido del repositorio, de apenas 0,3 GB, alberga codigo Python (`scripts/mega_freeu.py`) que implementa una version combinada y ampliada de la tecnica FreeU, un metodo de modificacion de las conexiones residuales de los UNet en modelos de difusion para mejorar la calidad de las imagenes generadas.

La tecnica FreeU, introducida originalmente en 2023, actua sobre los factores de escala del backbone y de las skip connections del UNet, aplicando filtros en el dominio de la frecuencia (FFT) para modular la contribucion de las componentes de baja y alta frecuencia. Este repositorio fusiona cinco implementaciones previas (sd-webui-freeu, WAS FreeU_Advanced, ComfyUI_FreeU_V2_Adv, FreeU_V2_timestepadd y nrs_kohaku_v3.5) y corrige dos bugs conocidos de la extension original.

El interes del repositorio es, por tanto, instrumental: no se trata de un modelo entrenado, sino de una herramienta de inferencia que modifica el comportamiento de modelos de difusion existentes como Stable Diffusion. No se dispone de informacion sobre parametros, contexto, licencia ni idiomas porque no aplica a un modelo de lenguaje o de difusion con pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (script de extension para A1111/Forge; actua sobre UNet de modelos de difusion) |
| Parametros totales | No disponible (no es un modelo con pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene codigo Python, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni pesos. El codigo `mega_freeu.py` implementa una extension para las interfaces Automatic1111 y Forge que intercepta la concatenacion de skip connections del UNet (`th.cat hijack`) para aplicar factores de escala diferenciados al backbone y a las skip connections, junto con filtros FFT (tipo box o gaussiano) que suprimen o amplifican componentes de baja y alta frecuencia.

La implementacion combina caracteristicas de cinco fuentes: modos de mezcla (9 en total), presets FFT multiescala (13), filtro gaussiano, "Adaptive Cap" con un maximo de 3 iteraciones, rangos de timestep independientes por etapa (B y S), gating por fraccion de paso, parametro `hf_boost` y soporte para `on_cpu_devices`. Respecto a la extension original, corrige dos bugs: una mascara booleana en el filtro de Fourier que anulaba la multiplicacion de escala, y el uso de una mascara de un solo cuadrante en lugar de una simetrica centrada. No hay datos de entrenamiento porque no se entrena ningun modelo.

## Capacidades

- Modificacion del comportamiento de inferencia de modelos de difusion basados en UNet (Stable Diffusion 1.x, 2.x, SDXL y variantes compatibles con A1111/Forge).
- Control por etapas (hasta tres stages: ~1280 canales, ~640 canales, ~320 canales) con parametros independientes de backbone (B) y skip connections (S).
- Nueve modos de mezcla para los factores de escala, incluidos `lerp`, `stable_slerp` e `inject`.
- Trece presets FFT multiescala y dos tipos de filtro (box y gaussiano) para modular frecuencias.
- Rangos de timestep independientes por etapa, con gating basado en la fraccion de paso (`cur/total`).
- Parametros de "Adaptive Cap" para evitar la atenuacion excesiva de bajas frecuencias.
- Compatibilidad con la API de diccionario de A1111 (`alwayson_scripts` legacy), metadatos PNG, XYZ plot, ControlNet y enmascaramiento por regiones.
- Soporte de "Post-CFG Shift" portado desde WAS.
- No soporta tool calling, agentes, vision, audio ni capacidades linguisticas: no es un modelo de lenguaje.

## Casos de uso

- Mejora de calidad en generacion de imagenes con Stable Diffusion: el script permite ajustar la contribucion de las skip connections para reducir artefactos y mejorar el detalle fino en pipelines de txt2img e img2img sobre A1111 o Forge.
- Experimentacion con presets FFT: los 13 presets multiescala permiten comparar rapidamente el efecto de distintos filtros de frecuencia sobre un mismo prompt, util para investigacion sobre el rol de las componentes espectrales en la difusion.
- Integracion en flujos de trabajo con ControlNet: el soporte explicito de ControlNet y de enmascaramiento por regiones permite aplicar FreeU solo en regiones concretas de la imagen.
- Automatizacion de barridos de hiperparametros: la compatibilidad con XYZ plot y metadatos PNG facilita generar rejillas de comparacion de factores B/S y rangos de timestep.
- Correccion de bugs en instalaciones existentes: si un usuario ya usaba `sdwebui-freeU-extension`, este repositorio corrige la mascara de Fourier y la mascara de cuadrante, lo que se traduce en un efecto real de la escala en lugar de una operacion nula.
- Investigacion sobre decodificacion en el dominio de la frecuencia: el codigo sirve como referencia para estudiar como afectan los filtros box y gaussiano a la generacion, con gating por etapa y por timestep.
- Despliegue en entornos con recursos limitados: el parametro `on_cpu_devices` permite mover calculos a CPU, util en GPUs con poca VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM para pesos del modelo, ya que el repositorio no contiene un modelo entrenado.
- El script se ejecuta junto con el modelo de difusion subyacente (Stable Diffusion 1.x, 2.x, SDXL), por lo que los requisitos de VRAM son los de dicho modelo: aproximadamente 4-6 GB para SD 1.5 en fp16, 8-10 GB para SDXL en fp16.
- GPU recomendadas: las mismas que para el modelo de difusion base (RTX 3060 12 GB, RTX 4090, A100, H100 segun el modelo y la resolucion).
- Cabe en GPUs de consumo si el modelo base cabe; el script anade una sobrecarga computacional por los filtros FFT y las operaciones de mezcla.
- Opciones de despliegue: Automatic1111 WebUI y Forge. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del modelo base y de la GPU.

## Comparativa con modelos similares

| Herramienta | Tipo | Caracteristicas | Licencia | Disponibilidad |
|---|---|---|---|---|
| dikdimon/sdas (Mega FreeU) | Script de extension | Fusion de 5 fuentes, 9 modos de mezcla, 13 presets FFT, filtro gaussiano, Adaptive Cap, gating por timestep | No disponible | Hugging Face (repo `dikdimon/sdas`) |
| sd-webui-freeu | Extension A1111 | Implementacion original de FreeU, V1/V2, filtro box | No disponible | Extension A1111 |
| WAS FreeU_Advanced | Nodo/extension | 9 modos de mezcla, 13 presets FFT, Post-CFG Shift | No disponible | Suite WAS Node Suite |
| ComfyUI_FreeU_V2_Adv | Nodo ComfyUI | Filtro gaussiano, Adaptive Cap, rangos de timestep por etapa | No disponible | ComfyUI |

## Limitaciones y advertencias

- El repositorio no contiene un modelo con pesos; no debe tratarse como un modelo de IA evaluable en terminos de MMLU, HumanEval o similares.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Es un riesgo relevante para produccion.
- El codigo depende de la API interna de A1111/Forge y de la estructura del UNet; cambios en esas interfaces pueden romper la extension.
- El "th.cat hijack" actua sobre la concatenacion de salida de las skip connections, por lo que no cubre `target_block`, `input_block`, `middle_block` ni `slice_b1/b2`, a diferencia de otras implementaciones.
- El gating por timestep usa fraccion de paso (`cur/total`) en lugar de `percent_to_sigma`, lo que puede producir diferencias respecto a las fuentes originales de ComfyUI.
- No hay validacion publicada de calidad ni de reproducibilidad; los efectos dependen del modelo base, del sampler y del scheduler.
- No dispone de documentacion de sesgos, alucinacion ni limitaciones linguisticas porque no es un modelo generativo de texto.
- El tamano del repositorio (0,3 GB) y la ausencia de pipeline, tags de idioma y descargas (0) sugieren un proyecto personal sin mantenimiento comunitario verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dikdimon/sdas
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este repositorio concreto.
