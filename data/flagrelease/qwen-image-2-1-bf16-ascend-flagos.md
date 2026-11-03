# FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS

## Resumen

Qwen-Image-2.1-BF16-ascend-FlagOS es una distribución del modelo de difusión texto-a-imagen Qwen-Image 2.1, publicada por FlagRelease, el brazo de publicación de modelos del stack FlagOS. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de pesos en BF16 (7.115.124.736 parámetros, 33,1 GB en el repositorio) empaquetado para ejecutarse sobre aceleradores Ascend de Huawei mediante la capa de software FlagOS. El pipeline declarado en diffusers es `QwenImage21Pipeline` y la licencia es Apache 2.0.

El valor de esta publicación no está en el modelo en sí, sino en la portabilidad: FlagOS integra la librería de operadores FlagGems, implementada en Triton, mediante el plugin Torch-FL, de forma que la misma experiencia de uso que en NVIDIA se reproduce en Ascend sin modificar código. El repositorio incluye scripts de inferencia preconfigurados, una imagen de contenedor FlagOS-Ascend y una validación de consistencia frente a la implementación oficial en NVIDIA.

Es relevante para equipos que necesitan desplegar generación de imágenes de código abierto sobre hardware no-NVIDIA y quieren evitar reescribir pipelines de diffusers. La model card reporta una alineación de precisión muy alta frente al original: ClipScore de 33,31 frente a 33,66 en T2I-100 y de 25,76 frente a 25,34 en Coco-Image, es decir, diferencias inferiores al 2 % y sin degradación sistemática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (pipeline `QwenImage21Pipeline` en diffusers); detalles internos de bloques no disponibles en la información proporcionada |
| Parametros totales | 7.115.124.736 |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de imagen; no se documenta ventana de tokens) |
| Tipos de cuantizacion | BF16 (único formato publicado en este repositorio); no se documentan otras variantes |
| Idiomas soportados | Chino (zh) e inglés (en) para los prompts |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, integrable con diffusers |
| Tarea | Text-to-image |
| Tamaño del repositorio | 33,1 GB |
| Hardware objetivo | Ascend (imagen de contenedor con runtime `ascend`, CANN 9.0, dispositivo referenciado `Ascend910`) |
| Software de despliegue | Contenedor FlagOS con FlagGems 5.4.0, FlagTree 0.6.2, SGLang 0.5.17, Python 3.11, PyTorch NPU |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo generativo (número de bloques, tipo de autoencoder latente, mecanismo de atención o composición del dataset de entrenamiento). Lo que sí se documenta es la capa de sistema que lo envuelve: FlagOS actúa como stack de software unificado entre modelo, sistema y chip, con FlagGems como librería de operadores en Triton, FlagCX para comunicación, FlagTree como compilador unificado y FlagScale para orquestación de entrenamiento e inferencia distribuida.

El mecanismo técnico central de esta release es el plugin Torch-FL, que permite que diffusers ejecute el pipeline sobre Ascend redirigiendo operadores concretos a implementaciones de FlagGems. Los scripts de la model card muestran el control granular de este enrutado mediante variables de entorno (`FLAGOS_OP_ones`, `FLAGOS_OP_gelu`, `FLAGOS_OP_where__self`, `FLAGOS_OP_constant_pad_nd`, `FLAGOS_OP__scaled_dot_product_efficient_attention`), todas fijadas a `ascend`, además de `QWEN21_ZERO_FALLBACK_INTEGRATION=1` y registro de fallbacks (`FLAGOS_LOG=fallback`). No se dispone de información sobre RLHF, DPO ni preferencias humanas aplicadas al modelo base.

## Capacidades

- Generación de imágenes a partir de prompts de texto en chino e inglés.
- Ejecución del pipeline estándar de diffusers sin modificación de código respecto a la ruta NVIDIA, según declara el autor.
- Control de resolución y pasos de muestreo: el benchmark de referencia usa 1024x1024 píxeles, 40 pasos, semilla 42 y `true-cfg-scale` de 1.0.
- Soporte de ejecución por lotes (`--batch`) y calentamiento configurable (`--warmup`).
- Integración documentada con AnythingLLM como interfaz de conversación (la model card incluye una guía de configuración, aunque orientada a interacción tipo LLM).
- Despliegue en contenedor con parámetros de hardware y software preconfigurados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Generación de ilustraciones y assets para producto sobre infraestructura Ascend: el pipeline se ejecuta a 1024x1024 con 40 pasos y produce resultados alineados con la implementación NVIDIA (ClipScore 33,31 frente a 33,66), lo que permite sustituir hardware sin recalibrar la calidad esperada.
- Migración de un servicio de text-to-image ya construido sobre diffusers: al mantener la misma API de pipeline y requerir cero cambios de código, el equipo solo necesita cambiar la imagen de contenedor y las variables de entorno de enrutado de operadores.
- Despliegue en entornos con requisitos de soberanía tecnológica o de proveedor de acelerador: el stack FlagOS está pensado para chips heterogéneos, de modo que un mismo artefacto sirve en Ascend y en otras plataformas soportadas.
- Prototipado rápido en clústeres Ascend existentes: la imagen pública y los scripts de descarga vía ModelScope permiten tener inferencia operativa en minutos, sin compilar operadores a medida.
- Validación de portabilidad y control de regresiones: los scripts de benchmark (`run.sh bench` con salida JSON e imagen) permiten comparar ClipScore y tiempos frente a la referencia NVIDIA en cada actualización del stack.
- Generación de material gráfico bilingüe para mercados hispanohablante y chino, aprovechando el soporte declarado de prompts en zh y en (la calidad en castellano no está documentada y debe evaluarse empíricamente).
- Investigación en sistemas: medición de rendimiento y precisión de FlagGems frente a stacks nativos, con registro de fallbacks activable para identificar operadores aún no cubiertos.

## Benchmarks y rendimiento

| Métrica | Qwen-Image-2.1-Nvidia-Origin | Qwen-Image-2.1-Ascend-FlagOS |
|---|---|---|
| T2I-100 (ClipScore) | 33,66 | 33,31 |
| Coco-Image (ClipScore) | 25,34 | 25,76 |

Los datos provienen de la model card del autor. Se observa una diferencia de -0,35 puntos en T2I-100 (-1,04 %) y de +0,42 puntos en Coco-Image (+1,66 %) a favor de la versión Ascend, lo que sugiere equivalencia dentro del ruido de evaluación más que una ventaja real. No se publican métricas de latencia, throughput ni FID en la información disponible.

## Requisitos de hardware

- VRAM/VRAM equivalente: el repositorio pesa 33,1 GB en BF16, por lo que se necesita al menos esa cantidad de memoria de acelerador para cargar los pesos, más el overhead de activaciones y del VAE durante la generación a 1024x1024.
- Acelerador objetivo: Ascend 910 (la configuración de ejemplo expone `ASCEND_RT_VISIBLE_DEVICES` y monta el driver de Ascend); no se especifica el número mínimo de dispositivos.
- GPU NVIDIA: no es el objetivo de este artefacto; para esa ruta debe usarse la distribución original de Qwen-Image 2.1.
- GPU de consumo: no se documenta soporte; el formato publicado es BF16 y el stack está orientado a aceleradores de datacenter, no a tarjetas consumer.
- Despliegue: contenedor Docker con runtime Ascend, imagen `harbor.baai.ac.cn/flagrelease-public/qwen-image-2.1-ascend001-...`, sobre openEuler 22.03 LTS-SP4 y Docker 20.10.8 o superior. El entorno incluye SGLang 0.5.17, aunque el benchmark se lanza vía script de diffusers.
- Configuración de sistema: `--shm-size=128g`, red e IPC en modo host, contenedor privilegiado.
- Latencia y throughput: no disponibles. El script de benchmark acepta `--min-run-time 60` y `--warmup 2`, lo que indica que el autor mide tiempos, pero no publica los resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-BF16-ascend-FlagOS | 7,12 mil millones | 1024x1024 documentado | Apache 2.0 | HuggingFace + ModelScope | Port a Ascend vía FlagOS |
| Qwen-Image 2.1 (distribución oficial NVIDIA) | No disponible en la información proporcionada | 1024x1024 documentado | Apache 2.0 (según este repo) | HuggingFace | Referencia de precisión en los benchmarks |
| Alternativas de text-to-image de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de otros modelos en la información |

La información suministrada no incluye datos de otros modelos de difusión comparables (por ejemplo, familias SDXL o Flux), por lo que la comparativa se limita a la variante oficial del mismo modelo.

## Limitaciones y advertencias

- Solo se publican pesos en BF16; no hay variantes cuantizadas (FP8, INT8, GGUF) en este repositorio, lo que limita el despliegue en hardware con menos memoria.
- El artefacto está atado a Ascend: la imagen de contenedor, las variables `ASCEND_*` y el runtime `ascend` no son trasladables a NVIDIA sin usar la distribución original.
- Idiomas declarados: chino e inglés. El comportamiento con prompts en castellano no está documentado ni evaluado; es esperable una calidad inferior y requiere validación previa.
- Los benchmarks publicados son únicamente ClipScore sobre dos conjuntos (T2I-100 y Coco-Image); no hay FID, evaluación humana ni métricas de fidelidad de prompt, por lo que la evaluación de calidad es parcial.
- Riesgo de sesgos y de alucinación visual: no se documenta ninguna auditoría de sesgos, filtrado de datos ni mecanismos de seguridad en la model card; un modelo de difusión puede reproducir estereotipos presentes en sus datos de entrenamiento y generar contenido no fiel al prompt.
- La guía de integración con AnythingLLM parece genérica y orientada a LLM; no está claro que aporte valor para un pipeline de imagen, por lo que conviene tratarla con cautela.
- Licencia Apache 2.0 permite uso comercial, pero el autor no detalla las obligaciones de atribución ni si los pesos derivan de un modelo base con condiciones adicionales; conviene verificar la licencia de Qwen-Image 2.1 original antes de producción.
- Madurez baja: 10 descargas y 0 likes en el momento de la consulta, con actualizaciones recientes del repositorio; no hay evidencia de uso en producción.
- El enrutado de operadores se controla con variables de entorno y registra fallbacks; un fallback silencioso a implementaciones no optimizadas puede degradar el rendimiento sin cambiar los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS
- FlagGems (librería de operadores en Triton): https://github.com/openai/triton (referenciado en la model card como base de FlagGems)
- AnythingLLM: https://anythingllm.com/
- ModelScope (descarga de pesos): comando `modelscope download --model FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS`
- Imagen de contenedor: `harbor.baai.ac.cn/flagrelease-public/qwen-image-2.1-ascend001-gems5.4.0-tree0.6.2-cxnone-pluginnone-vllmnone-sglang0.5.17-sglangflnone-cp311-ptnpunone-cann90-a64-none:202609200803`
- Paper, blog o repositorio de FlagOS: no disponible en la información proporcionada.
