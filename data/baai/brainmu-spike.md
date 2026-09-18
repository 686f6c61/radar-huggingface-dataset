# BAAI/Brainmu-Spike

## Resumen

Brainμ-Spike es un componente de reconstrucción de imagen para cámaras de picos (spike cameras) desarrollado conjuntamente por el equipo de Yu Zhaofei, de la Universidad de Pekín, y la Beijing Academy of Artificial Intelligence (BAAI), dentro de la línea de trabajo Brainμ. El repositorio publicado en Hugging Face contiene únicamente el módulo convolucional de reconstrucción, formado por `config.json` y `model.safetensors`, que convierte secuencias de picos binarios en imágenes condicionantes para un modelo generativo posterior.

El problema que aborda es específico: a partir de una entrada DAT con una secuencia binaria de 41 × 250 × 400 (empaquetada en little-bit, 512.500 bytes) y leída con volteo a lo largo de la altura, el módulo genera imágenes de condición que alimentan un pipeline de reconstrucción RGB. El repositorio incluye el código de entrenamiento, exportación de imágenes condicionantes, ajuste fino (LoRA), inferencia, evaluación con PSNR/SSIM y una interfaz web con soporte para 1, 2, 4 u 8 GPU.

Es relevante ahora porque publica de forma abierta (licencia Apache-2.0) un eslabón concreto del pipeline de Brainμ con código reproducible, métricas definidas de manera explícita y una interfaz de evaluación multi-GPU. La limitación principal es que el modelo base generativo y los pesos LoRA no están publicados: sin ellos solo puede ejecutarse el módulo convolucional de la raíz del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo convolucional de reconstrucción de picos (pesos en la raíz del repositorio) más un modelo base generativo y un adaptador LoRA no publicados; el código del modelo upstream adaptado se encuentra en `src/vendor/Brainmu/` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | no aplica; la entrada es una secuencia de picos de 41 × 250 × 400 |
| Tipos de cuantización | no disponible; el repositorio distribuye pesos en safetensors sin cuantizar |
| Idiomas soportados | zh (chino) según la model card; el prompt por defecto del pipeline está en inglés: `Restore the clean image.` |
| Licencia | apache-2.0 (con avisos adicionales en `src/LICENSE` y `src/NOTICE` para el código de terceros) |
| Formato de pesos | safetensors (`model.safetensors` en la raíz y `adapter.safetensors` para el adaptador LoRA) |
| Entrada | DAT binario de 41 × 250 × 400, empaquetado en little-bit, 512.500 bytes, con volteo a lo largo de la altura al leerlo |
| Salida | Imagen de condición (`condition/`) e imagen RGB reconstruida (`prediction/`) |
| Métricas de evaluación | PSNR por imagen (convertida a escala de grises y normalizada a `[0,1]`) y SSIM con ventana gaussiana de 11 × 11 y σ = 1,5, sin recorte de bordes |
| Entorno de referencia | Linux, Python 3.12, PyTorch 2.11.0, torchvision 0.26.0, CUDA 13.0, FlashAttention 2.8.3.post1 |
| Tamaño del repositorio | 0,0 GB según Hugging Face |
| Descargas / likes | 833 descargas, 10 likes |
| Fecha de creación / actualización | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio separa dos niveles. En la raíz se publica un pequeño módulo convolucional de reconstrucción de picos, descrito por `config.json`, que produce las imágenes condicionantes a partir de la secuencia DAT. El pipeline completo se apoya además en un modelo base generativo y en un adaptador LoRA que se cargan por separado (`--model-path` y `--adapter`), y que no forman parte de esta publicación; el código del modelo upstream adaptado se distribuye en `src/vendor/Brainmu/`. La evaluación se lanza con FlashAttention 2.8.3.post1 sobre PyTorch 2.11.0 y CUDA 13.0, lo que indica que el modelo base emplea atención con kernels optimizados.

No se dispone de información sobre el número de tokens o muestras de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El pipeline de evaluación emplea un prompt fijo, `Restore the clean image.`, configurable mediante `--prompt`, y por defecto verifica y evalúa 1.000 pares DAT/GT. Los artefactos de cada ejecución incluyen `metrics.csv`, `metrics.json`, `dataset_manifest.json` (con hashes de contenido de las entradas) y `run_config.json` (ajustes de inferencia y entorno), lo que permite reproducir y auditar cada evaluación.

## Capacidades

- Reconstrucción de imágenes a partir de secuencias de picos: transforma entradas DAT binarias de 41 × 250 × 400 en imágenes condicionantes y, en el pipeline completo, en imágenes RGB reconstruidas.
- Generación condicionada por prompt de texto: el pipeline acepta un prompt configurable (por defecto `Restore the clean image.`).
- Ajuste fino mediante LoRA: el repositorio incluye código de entrenamiento, exportación de imágenes condicionantes y fine-tuning, además de un adaptador cargable como `adapter.safetensors`.
- Evaluación cuantitativa integrada: cálculo de PSNR y SSIM por imagen y promedio, con definición explícita del preprocesado (escala de grises, normalización a `[0,1]`, ventana gaussiana de 11 × 11 con σ = 1,5 sin recorte de bordes).
- Verificación de integridad de datos: `dataset_manifest.json` registra la lista de ficheros y sus hashes de contenido; el modo `--check-only` permite validar los datos sin ejecutar inferencia.
- Ejecución en CPU o GPU: el módulo convolucional de la raíz admite `--device cpu` con dependencias ligeras; el pipeline completo requiere GPU NVIDIA.
- Escalado multi-GPU para evaluación: la interfaz web permite seleccionar 1, 2, 4 u 8 GPU antes de cargar el modelo (8 por defecto).
- No se declaran capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en cámaras de picos: reconstrucción de imágenes a partir de flujos de eventos binarios de alta velocidad, usando el módulo convolucional para generar la condición y el pipeline completo para obtener la imagen RGB.
- Evaluación reproducible de reconstrucción: ejecutar los 1.000 pares DAT/GT por defecto y obtener `metrics.csv` y `metrics.json` con PSNR y SSIM por muestra, útil como referencia en publicaciones.
- Comparación de adaptadores LoRA: el pipeline permite intercambiar `--adapter` y `--model-path`, de modo que un equipo puede medir el efecto de distintos adaptadores sobre el mismo conjunto de prueba.
- Validación previa de datasets: con `--check-only` y `--expected-count` se comprueba la presencia, el número y la integridad de los pares DAT/GT antes de consumir horas de GPU.
- Ajuste fino sobre dominios propios: el código de entrenamiento y de exportación de condiciones incluido permite adaptar el módulo a cámaras o escenas distintas manteniendo el mismo esquema de evaluación.
- Evaluación distribuida en clúster: la interfaz web con soporte de 1 a 8 GPU y su rejilla de puertos (8997 y 8998) permite lanzar evaluaciones a gran escala desde un nodo con varias tarjetas, accediendo por túnel SSH.
- Desarrollo de front-ends de reconstrucción: al exponer una salida intermedia (`condition/`) separada de la predicción final (`prediction/`), el repositorio sirve como base para integrar reconstrucción de picos en aplicaciones de visión que necesiten separar la etapa de condicionamiento de la generativa.
- Reproducción de un eslabón concreto de Brainμ: equipos que ya dispongan del modelo base y del LoRA pueden incorporar únicamente este módulo convolucional sin adoptar todo el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define el protocolo de medición, pero no aporta cifras de PSNR ni de SSIM:

| Métrica | Valor publicado | Protocolo |
|---|---|---|
| PSNR | no disponible | Imagen de predicción convertida a escala de grises y normalizada a `[0,1]`; PSNR por imagen y promedio |
| SSIM | no disponible | Ventana gaussiana de 11 × 11, σ = 1,5, sin recorte de bordes |
| Tamaño de la evaluación por defecto | 1.000 pares DAT/GT | Verificación previa y ejecución completa; `--expected-count` ajustable |

Tampoco se han publicado comparaciones con otros modelos de reconstrucción de picos en la información disponible.

## Requisitos de hardware

- Módulo convolucional de la raíz: puede ejecutarse en CPU (`--device cpu`) con las dependencias ligeras descritas en `src/USAGE.md`; también admite `--device cuda:0`.
- Pipeline completo: requiere Linux, GPU NVIDIA y una versión de controlador compatible con la compilación de PyTorch para CUDA 13.0; el script de instalación usa Python 3.12, PyTorch 2.11.0, torchvision 0.26.0 y FlashAttention 2.8.3.post1.
- Multi-GPU: la interfaz web soporta 1, 2, 4 u 8 GPU, con 8 por defecto; la selección debe hacerse antes de cargar el modelo.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible; la model card solo exige GPU NVIDIA compatible con CUDA 13.0.
- Encaje en GPU de consumo: no disponible para el pipeline completo; el módulo convolucional de la raíz es lo bastante ligero como para ejecutarse en CPU.
- Opciones de despliegue: scripts propios (`src/scripts/setup_uv.sh`, `infer_frontend.py`, `test.sh`, `start_ui.sh`) e interfaz web en `http://127.0.0.1:8997`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La duración dependerá del modelo base y del número de GPU, no solo de este módulo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de reconstrucción de imagen para cámaras de picos ni resultados numéricos de este modelo que permitan establecer una comparación con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| BAAI/Brainmu-Spike | no disponible | no aplica (entrada de picos 41 × 250 × 400) | no disponible | apache-2.0 | Módulo convolucional publicado; modelo base y LoRA no publicados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos incompletos: la raíz del repositorio solo contiene el módulo convolucional. El modelo base generativo y el adaptador LoRA no están publicados, por lo que el flujo completo no puede reproducirse sin preparar esos pesos por separado.
- Código de terceros: parte del código procede del modelo upstream adaptado; se aplican los términos indicados en `src/LICENSE` y `src/NOTICE`, que pueden imponer condiciones adicionales a la licencia Apache-2.0 del repositorio.
- Riesgo de alucinación: en la etapa generativa, la reconstrucción puede introducir detalles plausibles pero no presentes en la escena original; conviene validar con PSNR/SSIM sobre datos de prueba independientes.
- Idiomas: el modelo se declara únicamente para chino (`zh`), aunque el prompt por defecto del pipeline está en inglés. No se documenta soporte multilingüe.
- Dominio restringido: la entrada debe ser una secuencia DAT de 41 × 250 × 400 empaquetada en little-bit y leída con volteo vertical; otras resoluciones o formatos no están soportados.
- Sin detección de fuga de datos: el programa no comprueba automáticamente el solapamiento entre conjuntos de entrenamiento y prueba, por lo que la responsabilidad de usar datos de test independientes recae en el usuario.
- Interfaz web sin autenticación: el aviso de la model card indica que debe accederse por reenvío SSH y no exponerla directamente a internet.
- Consumo de recursos: el pipeline completo exige GPU NVIDIA con CUDA 13.0 y una cadena de compilación CUDA para extensiones; el script de instalación no sobrescribe entornos existentes y la evaluación por defecto procesa 1.000 pares.
- Estado de la evaluación: los resultados solo son válidos si `metrics.json` presenta `status=complete` y el número de muestras procesadas coincide con el solicitado.
- Sesgos: no disponible; no se documentan análisis de sesgo ni composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BAAI/Brainmu-Spike
- Organización BAAI en Hugging Face: https://huggingface.co/BAAI
- Sitio oficial de BAAI: https://www.baai.ac.cn/en/
- Sobre BAAI: https://www.baai.ac.cn/en/about-us
- Wikipedia, Beijing Academy of Artificial Intelligence: https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence
