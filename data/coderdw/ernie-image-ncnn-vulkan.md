# Coderdw/ernie-image-ncnn-vulkan

## Resumen

ERNIE-Image-Turbo ncnn es un paquete de pesos FP32 publicado por el usuario Coderdw para ejecutar el modelo de generación de imágenes `baidu/ERNIE-Image-Turbo` mediante un port experimental en C++ sobre la librería ncnn con backend Vulkan. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de pesos del modelo base de Baidu (revisión `bc68c81e2a1730a394d5fc9fae70713dee940140`) a un formato que puede cargarse sin CUDA, a través de Vulkan, lo que abre la inferencia a GPUs de AMD, Intel y NVIDIA en un único binario nativo.

El paquete incluye todos los componentes necesarios para la inferencia completa: tokenizer, text encoder (embedding y capas 0-24), un DiT de 36 capas con frontend y output head, el decoder VAE con sus constantes de normalización, y un latent de regresión correspondiente a la seed oficial 42. La configuración está fijada a batch=1, resolución 1024 x 1024, 8 pasos de inferencia y sin Prompt Enhancer. La corrección del port se define sobre una base FP32, por lo que el repositorio ocupa unos 43 GiB.

Su relevancia es doble: por un lado, sirve como referencia reproducible para validar la fidelidad numérica de una implementación ncnn/Vulkan frente a la implementación de referencia (el latent de seed=42 actúa como test de regresión); por otro, demuestra que un modelo de difusión basado en transformer puede desplegarse en C++ nativo sobre hardware sin CUDA. Como contrapartida, es un artefacto experimental, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con requisitos de memoria que lo alejan de cualquier GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 36 capas, con text encoder propio (embedding + capas 0-24) y VAE decoder |
| Parametros totales | no disponible (el paquete FP32 declarado, ~43 GiB, implicaria del orden de 11.500 millones de parametros si todos los tensores fuesen FP32; es una derivacion del tamano, no un dato oficial) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica una ventana de contexto de tipo LLM) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos FP32; no se publican variantes INT8, FP16 ni GGUF) |
| Idiomas soportados | no disponible (las etiquetas del repositorio no declaran idiomas; el ejemplo de la model card utiliza un prompt en chino) |
| Licencia | apache-2.0 |
| Formato de pesos | ncnn (param + bin), mas `tokenizer.json`, pesos de text encoder, DiT y VAE, y latent de regresion en `rng/` |
| Tamano del repositorio | 45,6 GB |
| Resolucion de generacion | 1024 x 1024 (fija) |
| Pasos de inferencia | 8 (fijos) |
| Batch | 1 (fijo) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de difusion (DiT) de 36 capas, acompañado de un text encoder de 25 capas (embedding mas capas 0-24) y un decoder VAE. Este repositorio no entrena nada: únicamente convierte los pesos del modelo original a FP32 en el formato de ncnn y los empaqueta junto a las constantes de normalización del VAE y un latent de referencia. La estructura de directorios del paquete (`tokenizer/`, `text_encoder/`, `dit/`, `vae/`, `rng/`) refleja esa separación por componentes.

La innovación técnica del port es de implementación, no de modelado. El autor advierte explícitamente que el comportamiento del GELU en Vulkan y de la máscara SDPA forma parte del contrato de ejecución verificado, y que debe utilizarse el código ncnn incluido en el repositorio C++ acompañante en lugar de una build arbitraria de la librería. Además, la baseline de corrección se establece en FP32 frente al latent de referencia de la seed 42, lo que convierte al paquete en una herramienta de verificación de portabilidad numérica entre backends (CUDA/BF16 de referencia frente a Vulkan/FP32 del port). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si el modelo base utilizó RLHF, DPO u otra fase de alineación.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en resolución fija de 1024 x 1024 píxeles.
- Inferencia en 8 pasos, lo que sitúa al modelo en la categoría de difusión destilada o acelerada (tipo turbo/schnell) según la nomenclatura del modelo base.
- Ejecución completa en C++ nativo mediante ncnn, sin dependencia de PyTorch ni de CUDA en tiempo de inferencia.
- Aceleración por GPU a través de Vulkan, lo que permite usar hardware de AMD, Intel y NVIDIA con un mismo binario.
- Reproducibilidad determinista: el paquete incluye el latent de regresión oficial de la seed 42 y admite modo de RNG portable con semilla explícita.
- Capacidad de condicionamiento por prompt textual mediante el tokenizer y el text encoder empaquetados.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento; son capacidades ajenas a un modelo text-to-image.

## Casos de uso

- Generación de imágenes en local sin nube: el paquete permite ejecutar el modelo íntegramente en una máquina propia mediante Vulkan, útil en entornos con requisitos de privacidad o sin conectividad, siempre que se disponga de una GPU con al menos 48 GB de memoria.
- Integración en aplicaciones nativas de escritorio en C++: al no depender de PyTorch, el CLI y la librería ncnn pueden enlazarse en tools internas o aplicaciones gráficas sin arrastrar un stack de Python.
- Test de regresión numérica de ports: el latent de seed=42 y el modo RNG portable permiten verificar que una implementación ncnn/Vulkan reproduce la salida de la implementación de referencia del modelo base, lo que resulta útil para equipos que mantienen ports propios.
- Validación de compatibilidad en GPUs no CUDA: sirve para comprobar el comportamiento de un DiT de 36 capas sobre hardware AMD o Intel vía Vulkan, un escenario poco cubierto por el ecosistema habitual de difusión.
- Generación de assets a 1024 x 1024 en pipelines internos de diseño: con 8 pasos fijos y batch=1, encaja en flujos de producción de imágenes individuales bajo demanda, como ilustraciones o material de catálogo.
- Investigación sobre inferencia de modelos de difusión en C++: el repositorio documenta la separación por componentes y las dependencias de comportamiento (GELU Vulkan, máscara SDPA), lo que lo convierte en material de partida para estudiar la portabilidad de DiT a backends gráficos.
- Reproducción de experimentos con semilla fija: para artículos o comparativas que exijan resultados reproducibles, el modo `--rng-mode portable --seed N` permite fijar exactamente la aleatoriedad de la difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), comparativas con el modelo base en BF16, ni medidas de latencia o throughput del port sobre ningún modelo de GPU concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete FP32 ocupa aproximadamente 43 GiB, por lo que se necesita una GPU con al menos 48 GB de memoria dedicada. No hay variantes cuantizadas que reduzcan este requisito.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB o RTX A6000 48 GB. También cualquier GPU AMD o Intel con driver Vulkan actualizado y 48 GB o más de memoria.
- GPU de consumo: no cabe en tarjetas de consumo actuales (RTX 4090, 4080, 3090, etc., con 24 GB o menos). Tampoco se documenta una ruta de ejecución parcial por capas con offloading.
- API gráfica: requiere un driver Vulkan funcional; el backend CUDA no se utiliza. El autor insiste en emplear el código ncnn incluido en el repositorio acompañante por dependencias de comportamiento del GELU Vulkan y de la máscara SDPA.
- Opciones de despliegue: no aplican vLLM, TGI, Ollama ni llama.cpp, que son herramientas para modelos de lenguaje. El despliegue se realiza compilando el CLI C++ (`ernie_image_cli`) contra ncnn y apuntando `--model-dir` al directorio descargado.
- Latencia y throughput: no disponibles. No se publican tiempos de generación por imagen ni comparativas entre GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Coderdw/ernie-image-ncnn-vulkan | no disponible (~11.500 M estimados por tamano del paquete FP32) | 1024 x 1024, 8 pasos, batch 1 | apache-2.0 | ncnn + tokenizer.json + latent de regresion | Repositorio HuggingFace, 0 descargas y 0 likes |
| baidu/ERNIE-Image-Turbo (modelo base) | no disponible | 1024 x 1024 (segun la configuracion fijada en el port) | no disponible en la informacion proporcionada (consultar su pagina) | safetensors u otro formato original, no disponible | Repositorio HuggingFace de Baidu |
| Otros ports ncnn/Vulkan de modelos de difusion | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion disponible |

La comparación relevante es entre el port y su modelo base: comparten arquitectura y pesos, y difieren en formato (ncnn frente al original), precisión (FP32 frente a la baseline CUDA/BF16 de referencia) y propósito (despliegue nativo sin CUDA frente a inferencia en el stack original). No se dispone de datos de rendimiento que permitan afirmar cuál de los dos produce mejores resultados en calidad de imagen.

## Limitaciones y advertencias

- Artefacto experimental: el autor lo describe como un port experimental en C++/ncnn. Con 0 descargas y 0 likes, no hay validación por parte de la comunidad ni historial de incidencias.
- Requisito de memoria prohibitivo: 43 GiB en FP32 impiden su uso en cualquier GPU de consumo. No se ofrecen cuantizaciones ni versiones reducidas.
- Dependencia de código concreto: el contrato de ejecución incluye el comportamiento del GELU Vulkan y de la máscara SDPA del código ncnn incluido. Compilar con otra revisión de ncnn puede invalidar los resultados.
- Configuración rígida: batch=1, 1024 x 1024, 8 pasos y ausencia de Prompt Enhancer. No se documentan parámetros para modificar estos valores.
- Sesgos: no se documentan en la información disponible. Al derivar de `baidu/ERNIE-Image-Turbo`, los sesgos de representación y de estilo del modelo base se heredan sin cambios.
- Riesgo de artefactos generativos: como todo modelo de difusión text-to-image, puede producir anatomías incorrectas, texto ilegible dentro de la imagen o composiciones incoherentes con el prompt. No se aportan métricas que cuantifiquen este riesgo.
- Idiomas del prompt: no declarados. El único ejemplo reproducible de la model card usa un prompt en chino, por lo que el comportamiento con prompts en castellano no está verificado.
- Licencia: el port se distribuye bajo apache-2.0, pero la model card remite a la página del modelo base para la información de licencia del modelo original. Conviene verificar la licencia de `baidu/ERNIE-Image-Turbo` antes de un uso comercial.
- Trazabilidad: los pesos corresponden a la revisión `bc68c81e2a1730a394d5fc9fae70713dee940140` del modelo base. Cualquier actualización posterior del modelo original no está reflejada.
- Uso en producción: sin benchmarks, sin medidas de latencia y sin pruebas de carga, no se recomienda como componente crítico de un servicio en producción sin una validación previa propia.

## Enlaces

- Repositorio del port: https://huggingface.co/Coderdw/ernie-image-ncnn-vulkan
- Modelo base: https://huggingface.co/baidu/ERNIE-Image-Turbo
- Repositorio C++ acompañante con el código ncnn: no disponible (la model card lo menciona pero no lo enlaza)
- Paper del modelo base: no disponible
- Blog o demo oficial de ERNIE-Image-Turbo: no disponible
- Resultados de benchmarks: no disponible
