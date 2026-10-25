# axiomofmind/Moss-Image-SFT-GGUF

## Resumen

Moss-Image-SFT-GGUF es una conversión no oficial al formato GGUF del modelo de difusión de texto a imagen OpenMOSS-Team/MOSS-Image-SFT, un transformer de difusión (DiT) de aproximadamente 5.080 millones de parámetros afinado por instrucciones (SFT) a partir de MOSS-Image-Base. El repositorio, publicado por el usuario axiomofmind, no contiene el modelo completo: incluye únicamente los pesos del DiT cuantizados, y requiere por separado un codificador de texto Qwen3.5-9B, el tokenizador oficial de MOSS y el VAE MOSS/FLUX.2. Está pensado para ejecutarse en runtimes de difusión compatibles como stable-diffusion.cpp y flujos de ComfyUI, no en herramientas de LLM de texto como Ollama o llama.cpp.

Su relevancia práctica está en que permite ejecutar un modelo de generación de imágenes de 5B en hardware de consumo gracias a la cuantización, con dos niveles disponibles (Q8_0 de 5,314 GiB y Q4_K_S de 3,226 GiB), reduciendo el peso del DiT frente a los pesos BF16 originales. El modelo subyacente emplea flow matching con sampler Euler y soporta prompts en lenguaje natural, secuencias de etiquetas y prompts de layout estructurados en JSON. Está entrenado principalmente en inglés y chino, y se distribuye bajo licencia Apache 2.0.

Esta ficha describe tanto el artefacto GGUF como las características conocidas del modelo base a partir de la información disponible; los detalles de entrenamiento no documentados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching; pipeline texto-imagen con codificador Qwen3.5-9B y VAE MOSS/FLUX.2 |
| Parámetros totales | 5.082.308.624 (~5,08 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica directamente; depende de la ventana de tokens del codificador Qwen3.5-9B (no disponible en la información proporcionada) |
| Tipos de cuantización | GGUF: Q8_0 (5,314 GiB) y Q4_K_S mixta (3,226 GiB) |
| Idiomas soportados | en, zh (el inglés concentra la mayor parte de los datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (463 tensores, `general.architecture=moss_image`) |
| Resolución de salida | ~1M, 1,5M o 2M píxeles totales; dimensiones divisibles por 16; relación de aspecto arbitraria |
| Repo size | 9,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión (DiT) de unos 5B parámetros que genera imágenes mediante flow matching, fine-tuned por supervisión (SFT) a partir de MOSS-Image-Base. El pipeline completo combina un codificador de texto Qwen3.5-9B, un tokenizador propio de MOSS (con vocabulario distinto al de los GGUF genéricos de Qwen) y el VAE oficial MOSS/FLUX.2. La inferencia recomendada usa sampler Euler de flow matching, 50 pasos o más, CFG 3.0 (rango 3–6) y shift 5.0, con guiado mediante salto de capa en la rama negativa (layer skip en la capa 22, indexada desde cero).

Los pesos de este repositorio contienen exclusivamente el DiT. La cuantización Q4_K_S no es uniforme: las 42 matrices `ffn_down` y cuatro matrices tempranas de proyección de valor se mantienen en Q5_K, mientras que el resto de proyecciones principales pasan a Q4_K; los embedders, normalización, modulación, condicionamiento temporal y tensores de salida conservan la precisión de origen. El número de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF/DPO no se detallan en la información proporcionada (no disponible).

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural.
- Soporte de secuencias de etiquetas (tag sequences) como formato de prompt alternativo.
- Soporte de prompts de layout estructurados en JSON, con coordenadas absolutas en píxeles centradas que deben coincidir con las dimensiones de salida solicitadas.
- Relación de aspecto arbitraria y generación a resoluciones de ~1M, 1,5M o 2M píxeles totales (dimensiones divisibles por 16).
- Capacidad multilingüe limitada a inglés y chino, con predominio de datos en inglés.
- Control fino mediante CFG, pasos, shift y negative-branch layer skip, expuesto en el runtime.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo agente: es un modelo de imagen, no un LLM de texto.
- No dispone de visión de entrada ni de audio: la entrada es texto (y layout JSON).

## Casos de uso

- Prototipado de concept art y previsualización de escenarios: el modelo acepta prompts descriptivos largos y relaciones de aspecto arbitrarias, útil para iterar sobre ideas visuales antes de producción.
- Ilustración arquitectónica y de interiores: con prompts detallados y resolución de ~2M píxeles, adecuado para generar visualizaciones de espacios con control de composición.
- Generación con control de maquetación: los prompts JSON con coordenadas absolutas permiten colocar elementos en posiciones concretas, útil para composiciones publicitarias o layouts de producto donde se necesita control espacial.
- Despliegue local en flujos ComfyUI: mediante el plugin experimental ComfyUI-MOSS-GGUF más ComfyUI-GGUF y el plugin oficial MOSS, se puede integrar en grafos de generación por nodos para pipelines de contenido.
- Ejecución en hardware de consumo: las versiones Q4_K_S (~3,2 GiB de DiT) permiten correr el modelo en GPUs de gama media con codificador cuantizado, habilitando pruebas locales sin infraestructura de datacenter.
- Localización de contenido en inglés y chino: el soporte bilingüe permite la misma tubería para campañas dirigidas a mercados en y zh.
- Automatización batch vía stable-diffusion.cpp: la CLI permite parametrizar semilla, tamaño, pasos y CFG para generar lotes reproducibles en pipelines CI/CD de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas de evaluación de imagen) en la información disponible. La validación documentada en la model card se limita a una comparación controlada de calidad entre el transformer BF16 original y ambas cuantizaciones GGUF (cinco comparaciones a 1024×1024 sobre RTX PRO 6000 Blackwell Max-Q, con 30 pasos, CFG 3, Euler, scheduler discrete, shift 5, semilla 42 y RNG en CPU), pero los valores numéricos de tiempos de muestreo y tiempos extremo a extremo aparecen truncados en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada (inferencia, estimación a partir del tamaño de los ficheros): DiT Q4_K_S (~3,2 GiB) + codificador Qwen3.5-9B en Q4_K_M (~5–6 GiB) + VAE (~0,3 GiB) ≈ 9–12 GB, con margen para activaciones a 1024×1024.
- VRAM estimada con DiT Q8_0 (~5,3 GiB): aproximadamente 12–16 GB en total, incluyendo codificador y VAE.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4070 Ti Super (16 GB) para el nivel Q4; A100/H100 para despliegues por lotes o resoluciones de 2M píxeles.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_S en GPUs de 12–16 GB; con `--offload-to-cpu` en stable-diffusion.cpp se reduce aún más el requisito de VRAM a costa de latencia.
- GPU de validación documentada: NVIDIA RTX PRO 6000 Blackwell Max-Q.
- Opciones de despliegue: stable-diffusion.cpp (ruta soportada oficialmente con `docs/moss_image.md`), ComfyUI mediante ComfyUI-MOSS-GGUF + ComfyUI-GGUF (ruta experimental), y el plugin oficial de OpenMOSS cargando los safetensors originales (no carga estos GGUF).
- Latencia y throughput: no disponible en la información proporcionada (los tiempos de la tabla de validación están truncados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT (este GGUF) | ~5,08B (DiT) | ~1M–2M píxeles; texto largo vía Qwen3.5-9B | Apache 2.0 | GGUF + safetensors; stable-diffusion.cpp y ComfyUI | Requiere codificador y VAE aparte |
| FLUX.1-dev | ~12B | Resolución alta; no disponible el detalle exacto en la información | Licencia no comercial | Safetensors; amplio ecosistema | Mayor tamaño, restricción de uso comercial |
| Stable Diffusion 3.5 Large | ~8B | Resolución alta; no disponible el detalle exacto | Community license | Safetensors; ecosistema maduro | Mayor tamaño, licencia con condiciones |
| Qwen-Image | ~20B | No disponible | Apache 2.0 | Safetensors; requiere más VRAM | Mucho mayor, menos viable en consumo |

Nota: los datos de parámetros y licencias de los modelos comparados son información pública general; no se dispone de comparaciones de benchmarks entre ellos y MOSS-Image-SFT en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado mayoritariamente en inglés, el rendimiento en otros idiomas distintos del chino puede degradarse.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir detalles inconsistentes, texto ilegible en la imagen o composiciones que no respetan el prompt.
- Limitación de idioma: solo en y zh están declarados; el soporte de otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los componentes (codificador Qwen3.5-9B y VAE) por separado.
- Dependencia de componentes externos: sin el codificador Qwen3.5-9B, el tokenizador oficial y el VAE correcto, los GGUF no son utilizables; el tokenizador debe pasarse explícitamente por la diferencia de vocabulario.
- Ruta ComfyUI experimental: la paridad de calidad SFT y todos los niveles de cuantización no han sido certificados exhaustivamente; la propia model card lo advierte.
- Reproducibilidad: distintos runtimes no producen resultados idénticos píxel a píxel con la misma semilla; el scheduler nativo de ComfyUI no aplica el ajuste a la rejilla de entrenamiento del pipeline standalone.
- Los prompts JSON de layout deben usar coordenadas que coincidan con las dimensiones de salida solicitadas; un desajuste puede degradar el resultado.

## Enlaces

- HuggingFace (este repositorio GGUF): https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Paper (MOSS-Image Technical Report): https://huggingface.co/papers/2610.23374
- Project page: https://openmoss.ai/MOSS-Image/
- Guía de usuario oficial: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Plugin oficial ComfyUI de OpenMOSS: https://github.com/OpenMOSS/MOSS-Image/tree/main/comfyui
- stable-diffusion.cpp (documentación MOSS-Image): https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/moss_image.md
- ComfyUI-MOSS-GGUF (comunidad): https://github.com/RealRebelAI/ComfyUI-MOSS-GGUF
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Codificador Qwen3.5-9B GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
