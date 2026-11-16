# fastforks/nnfoundation

## Resumen

nnFoundation es una familia de codificadores fundacionales auto-supervisados para imagen médica 3D desarrollada por el DKFZ (Centro Alemán de Investigación del Cáncer), publicada por Harsy et al. en 2026. Incluye dos variantes: `nnfoundation-cnn`, un codificador U-Net ResEnc-L de 6 etapas con canales de 32 a 320 y strides de 1 a 32, y `nnfoundation-vit`, un Vision Transformer Primus de 40 capas, anchura 1056 y parches de 8³ vóxeles con entrada fija de 192³. Ambos se preentrenaron con la librería nnssl sobre 2,1 millones de volúmenes de CT, MRI y PET procedentes de 125 conjuntos de datos institucionales y públicos del Human Radiome Project.

El modelo resuelve el problema de la escasez de datos etiquetados en imagen médica 3D: en lugar de entrenar un codificador desde cero para cada tarea de segmentación o clasificación, se parte de representaciones preentrenadas que pueden usarse con fine-tuning o en modo congelado (frozen features). El repositorio `fastforks/nnfoundation` no contiene pesos: es una model card de integración que descarga los pesos originales de MIC-DKFZ, los verifica por SHA-256 y ofrece backends `portable` y `kernels` con paridad numérica respecto al código original.

La relevancia actual reside en que estandariza el acceso a estos codificadores con una API unificada, ofrece mediciones reproducibles de latencia y memoria en GPU de consumo (RTX 5060 Ti 16 GB) y documenta explícitamente la licencia CC-BY-SA-4.0 y sus implicaciones de share-alike para modelos derivados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nnfoundation-cnn`: U-Net ResEnc-L (6 etapas, 32-320 canales, strides 1-32). `nnfoundation-vit`: Vision Transformer Primus (40 capas, anchura 1056, parches 8³, entrada fija 192³) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada volumétrica arbitraria D×H×W (ViT limitado a su rejilla fija de 192³) |
| Tipos de cuantizacion | fp32 (referencia), fp16 (por defecto en GPU); no se documentan otros formatos |
| Idiomas soportados | no aplica (modelo de imagen, no de texto) |
| Licencia | CC-BY-SA-4.0 (pesos); código Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch, checkpoint_final.pth); verificación por SHA-256 |

## Arquitectura y entrenamiento

`nnfoundation-cnn` emplea una U-Net residual de tipo ResEnc-L con seis etapas de downsampling, canales que escalan de 32 a 320 y strides de 1 a 32, lo que permite procesar volúmenes de tamaño arbitrario sin remuestreo. `nnfoundation-vit` es un transformer Primus de 40 capas con anchura 1056 y tokenización en parches cúbicos de 8³ vóxeles sobre una rejilla fija de 192³. En ambos casos el preentrenamiento es auto-supervisado mediante nnssl sobre 2,1 millones de volúmenes de CT, MRI y PET de 125 conjuntos de datos. El decodificador MAE utilizado durante el preentrenamiento no se distribuye: los checkpoints publicados contienen únicamente el codificador, cuya salida son mapas de características.

La innovación principal es la escala del corpus de preentrenamiento (2,1 M de volúmenes multimodales) y la separación limpia entre codificador y cabeza de tarea, que permite reutilizar las representaciones con fine-tuning o en modo congelado. La integración de fastforks añade backends optimizados (`kernels`) con paridad numérica verificada: en CPU float32 la diferencia máxima absoluta frente al código original es ≤ 1,8e-06; en GPU float16 la diferencia media es ≤ 0,15 % y el p99 ≤ 1,1 % del valor mediano de referencia.

## Capacidades

- Extracción de características 3D a partir de volúmenes de CT o MRI normalizados con z-score; salida de mapas de características del codificador.
- Segmentación 3D por vóxel tras añadir una cabeza de tarea y hacer fine-tuning (la salida documentada del pipeline es un índice de clase por vóxel `[D, H, W]`, 0 = fondo).
- Uso en modo congelado (frozen features) para entrenar clasificadores o cabezas ligeras sobre las representaciones preentrenadas.
- Procesamiento de volúmenes de tamaño arbitrario D×H×W sin remuestreo en la variante CNN; la variante ViT está restringida a una rejilla fija de 192³.
- Soporte multimodal de entrada: CT, MRI y PET (preentrenado sobre las tres modalidades).
- Integración con NIfTI mediante `volume.read_nifti`, que lee el volumen en unidades Hounsfield y el espaciado de vóxeles en mm.
- Backends `portable` y `kernels` con selección automática del preferido según mediciones registradas.
- No soporta tool calling, agentes, texto ni otras capacidades de modelos generativos: es un codificador de imagen puro.

## Casos de uso

- Segmentación de órganos en CT abdominal: se carga `nnfoundation-cnn`, se añade una cabeza de segmentación multiclase y se hace fine-tuning sobre un dataset etiquetado; el preentrenamiento sobre 2,1 M de volúmenes reduce la dependencia de anotaciones escasas.
- Detección de lesiones en MRI cerebral: usar el codificador ViT en modo congelado y entrenar un clasificador ligero sobre los mapas de características, aprovechando que la entrada fija de 192³ simplifica el pipeline.
- Preprocesado para pipelines de radiómica: extraer características del codificador como descriptores volumétricos y alimentar modelos predictivos de respuesta a tratamiento.
- Segmentación pulmonar o de nódulos en TC de tórax: la variante CNN admite volúmenes de hasta 384³ vóxeles en 16 GB de VRAM (14,2 GiB pico), suficiente para exploraciones completas sin trocear.
- Investigación multimodal CT/MRI/PET: reutilizar un mismo codificador preentrenado sobre las tres modalidades para comparar representaciones entre técnicas de imagen.
- Prototipado rápido en GPU de consumo: con `nnfoundation-cnn` a 200×200 el backend `kernels` tarda 211 ms por pasada con 2.985 MiB pico asignados, lo que permite iterar en una RTX 5060 Ti.
- Fine-tuning con requisitos de licencia abierta: al ser CC-BY-SA-4.0, los modelos derivados pueden publicarse bajo la misma licencia share-alike, lo que encaja en proyectos de investigación abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (Dice, IoU, MMLU u otros) en la información disponible. Los datos disponibles son mediciones de latencia y memoria en una RTX 5060 Ti 16 GB (sm_120), con entrada sintética:

| Modelo | Entrada | Original fp32 (ms) | Portable (ms) | Kernels (ms) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `nnfoundation-cnn` | 200×200 | 501 | 274 | 211 | 3.011 / 3.110 | 2.985 / 3.710 |
| `nnfoundation-vit` | 192×192 | OOM | 1.930 | 1.732 | 1.669 / 1.884 | 1.669 / 1.884 |

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|
| `nnfoundation-cnn` | 1,18 | 0,67 | 0,39 | 0,33 | 0,29 |
| `nnfoundation-vit` | 9,54 | 1,24 | 1,27 | 1,87 | 1,76 |

Con `torch.compile`, `nnfoundation-cnn` a 200×200 baja a 170 ms (frente a 227 ms en portable) con 5.067 MiB pico y 19,8 s de compilación en frío; `nnfoundation-vit` a 192×192 baja a 1.440 ms con 1.406 MiB pico y 69,5 s de compilación. TensorRT fp16 está planificado para la versión 0.2.1.

## Requisitos de hardware

- VRAM estimada: `nnfoundation-cnn` requiere 14,2 GiB pico asignados (14,8 reservados) para un volumen de 384³ en fp16; a 200×200 baja a unos 3 GiB. `nnfoundation-vit` consume 1,6 GiB pico para 192³.
- GPU recomendadas: RTX 5060 Ti 16 GB es la plataforma de referencia medida; para volúmenes grandes en la variante CNN conviene una GPU con 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en la RTX 5060 Ti 16 GB para ambas variantes en los tamaños probados; la variante ViT cabe con holgura en 8 GB.
- Opciones de despliegue: paquete `fastforks` con backends `portable` y `kernels`; `torch.compile` disponible; TensorRT fp16 planificado para 0.2.1. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un codificador de imagen).
- Latencia y throughput: 211 ms por pasada para `nnfoundation-cnn` a 200×200 con `kernels` y 1.732 ms para `nnfoundation-vit` a 192×192; la primera llamada añade entre 0,29 y 1,87 s según variante y backend.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Cualitativamente, los codificadores fundacionales de imagen médica 3D comparables (por ejemplo, familias tipo Merlin o modelos preentrenados sobre volúmenes abdominales) no aparecen documentados en la información recibida.

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `nnfoundation-cnn` | no disponible | volumen arbitrario D×H×W | CC-BY-SA-4.0 | pesos en MIC-DKFZ/nnFoundationCNN |
| `nnfoundation-vit` | no disponible | 192³ fijo | CC-BY-SA-4.0 | pesos en MIC-DKFZ/nnFoundationViT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio `fastforks/nnfoundation` no contiene pesos: solo la model card y la lógica de descarga y verificación SHA-256.
- No se incluye el decodificador MAE; el modelo entrega únicamente características del codificador y requiere una cabeza de tarea para segmentar o clasificar.
- La variante ViT tiene entrada fija de 192³; volúmenes mayores requieren remuestreo o troceado.
- La lista completa de los 125 conjuntos de datos de entrenamiento no se publica con los pesos, lo que dificulta auditar sesgos de dominio o de población.
- Licencia CC-BY-SA-4.0 con cláusula share-alike: los modelos ajustados a partir de estos pesos son material adaptado y deben distribuirse bajo la misma licencia, lo que puede ser incompatible con uso comercial cerrado.
- El autor del repositorio califica el paquete como de uso en investigación ("research-use package") y recomienda revisar las cadenas de licencia antes de cualquier otro uso.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos o negativos en segmentación; no se han publicado métricas de precisión clínica en la información disponible.
- No es un modelo de texto: no soporta tool calling, agentes ni capacidades multilingües.
- Los benchmarks de latencia se midieron en una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otros hardware puede diferir.
- TensorRT fp16 aún no está implementado (planificado para 0.2.1).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/nnfoundation
- Pesos originales CNN: https://huggingface.co/MIC-DKFZ/nnFoundationCNN
- Pesos originales ViT: https://huggingface.co/MIC-DKFZ/nnFoundationViT
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original nnssl: https://github.com/MIC-DKFZ/nnssl (commit `3d774e942256`)
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Configuración de la model card: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/volume/models/nnfoundation/card.toml
- Evidencia de licencia CNN: https://huggingface.co/MIC-DKFZ/nnFoundationCNN/blob/f443c09319988e833b3d9589bf95909e4443d7b2/README.md
- Evidencia de licencia ViT: https://huggingface.co/MIC-DKFZ/nnFoundationViT/blob/c691f2115140458ec64017712eb8ebbc8dde6ae4/README.md
- Licencia de dynamic-network-architectures: https://github.com/MIC-DKFZ/dynamic-network-architectures/blob/main/LICENSE
