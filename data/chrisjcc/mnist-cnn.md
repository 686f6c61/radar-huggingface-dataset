# chrisjcc/mnist-cnn

## Resumen

`chrisjcc/mnist-cnn` es una red neuronal convolucional (CNN) pequeña entrenada para clasificar dígitos manuscritos del conjunto MNIST (0–9) a partir de imágenes en escala de grises de 28×28 píxeles. Lo desarrolla el usuario de Hugging Face `chrisjcc` y se publica bajo licencia MIT. No es un modelo de lenguaje ni un modelo fundacional: es una implementación de referencia de una CNN con dos bloques convolucionales, pensada para demostrar un pipeline de MLOps reproducible (DVC + Hydra + Weights & Biases + Hugging Face Hub).

El modelo tiene 421.834 parámetros entrenables y una única salida de 10 logits. Su relevancia no reside en el rendimiento predictivo —los resultados publicados son muy bajos, con una accuracy de test del 22,93 %— sino en su valor como ejemplo didáctico de empaquetado, versionado de datos, evaluación y despliegue de un modelo de visión por computador en el ecosistema Hugging Face, incluyendo una aplicación Streamlit de demostración.

Es, por tanto, un artefacto educativo y de referencia para pipelines reproducibles, no una herramienta apta para producción en tareas reales de OCR o reconocimiento de dígitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (`MNISTConvNet`): 2 bloques Conv2d + BatchNorm + ReLU + MaxPool, cabeza clasificadora con Dropout y dos capas Linear |
| Parametros totales | 421.834 entrenables (422.026 segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 1×28×28) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (solo etiquetas en ingles; la tarea es clasificacion de digitos, no linguistica) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien checkpoint completo PyTorch de 4,85 MB) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial de dos bloques convolucionales. El primer bloque aplica `Conv2d(1→32, 3×3, padding=1)` seguido de `BatchNorm2d`, `ReLU` y `MaxPool2d(2×2)`, produciendo un tensor `(B, 32, 14, 14)`. El segundo bloque aplica `Conv2d(32→64, 3×3, padding=1)`, `BatchNorm2d`, `ReLU` y `MaxPool2d(2×2)`, produciendo `(B, 64, 7, 7)`. La cabeza clasificadora aplana la salida a 3136 dimensiones, aplica `Dropout(p≈0,1976)`, `Linear(3136→128)`, `ReLU`, otro `Dropout(p≈0,1976)` y `Linear(128→10)`, devolviendo logits sin normalizar para las clases 0–9.

El entrenamiento se realizó sobre `ylecun/mnist` con un split de 54.000 muestras de entrenamiento, 6.000 de validación estratificada y 10.000 de test reservado. Se usó el optimizador Adam (`lr≈4,735e-4`, `weight_decay≈7,676e-4`), 5 épocas, batch de 256, semilla global 42 con modo determinista y ejecución en CPU. La entrada se normaliza con μ=0,1307 y σ=0,3081. No se documenta uso de RLHF, DPO ni aumentación de datos. El pipeline está construido con DVC, Hydra y Weights & Biases, lo que constituye su principal innovación: la reproducibilidad extremo a extremo del experimento y su publicación en el Hub.

## Capacidades

- Clasificación de dígitos manuscritos individuales (0–9) en imágenes de 28×28 en escala de grises.
- Salida de 10 logits por muestra, convertibles en probabilidades mediante softmax.
- Inferencia por lotes (soporta batch de 1, 32, 128 y superiores).
- Integración con Hugging Face Hub mediante `load_inference_model` y utilidades de preprocesado (`preprocess_pil_image`, `predict_digit`).
- Preprocesado de imágenes PIL con opción de inversión de polaridad (`invert=True`) para adaptar fotos de tinta oscura sobre papel blanco.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje.

## Casos de uso

- Docencia y tutoriales de visión por computador: sirve como ejemplo mínimo y reproducible de una CNN de clasificación de imágenes, con arquitectura y hiperparámetros documentados, para explicar convoluciones, BatchNorm y Dropout en cursos introductorios.
- Referencia de pipeline MLOps reproducible: el repositorio ilustra cómo combinar DVC para versionado de datos, Hydra para configuración, Weights & Biases para seguimiento de experimentos y Hugging Face Hub para publicación, lo que lo hace útil como plantilla de proyectos mayores.
- Pruebas de integración y CI/CD: al ser un modelo de menos de 5 MB, puede usarse como fixture en tests automatizados que validen carga de safetensors, preprocesado y contrato de entrada/salida sin coste de infraestructura.
- Demostración interactiva con Streamlit: el autor incluye una aplicación de demo que permite subir una imagen de un dígito y obtener la predicción con su confianza, útil para talleres y presentaciones.
- Benchmarking de latencia en CPU: los datos publicados (0,309 ms por muestra a batch 1, 17.656 muestras/s a batch 128) permiten comparar el rendimiento de distintos runtimes de inferencia en CPU sobre un modelo trivial.
- Verificación de pipelines de despliegue en Hugging Face Docker Spaces: el modelo está empaquetado para desplegarse en Spaces, por lo que sirve para probar flujos de contenedor, carga de pesos y exposición de endpoints de inferencia.
- No es adecuado para OCR real, lectura de formularios, digitalización de documentos ni reconocimiento de matrículas, dado su dominio restringido y su baja accuracy.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (split de test de MNIST, N=10.000, no verificados):

| Metrica | Valor |
|---|---|
| Test accuracy | 0,2293 (22,93 %) |
| Test cross-entropy loss | 2,2496 |
| Macro precision | 0,3225 |
| Macro recall | 0,2292 |
| Macro F1 | 0,1631 |
| Weighted F1 | 0,1647 |

Rendimiento por clase (extracto):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| 0 | 0,0000 | 0,0000 | 0,0000 | 980 |
| 1 | 1,0000 | 0,0696 | 0,1301 | 1135 |
| 3 | 0,5785 | 0,4485 | 0,5053 | 1010 |
| 7 | 0,3220 | 0,8677 | 0,4697 | 1028 |
| 9 | 0,1256 | 0,4480 | 0,1962 | 1009 |

Latencia y throughput en CPU (50 pasadas cronometradas tras 10 de calentamiento):

| Batch | Latencia media (ms) | P95 (ms) | Throughput (muestras/s) |
|---|---|---|---|
| 1 | 0,309 | 0,607 | 3236,2 |
| 32 | 2,695 | 3,041 | 11875,0 |
| 128 | 7,250 | 7,756 | 17656,0 |

No se han publicado resultados de benchmarks frente a modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB en float32; el modelo completo ocupa 4,85 MB y los pesos safetensors 1,61 MB.
- GPU recomendadas: no requiere GPU; el autor entrenó e infirió en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) lo ejecuta sin problema, pero no aporta ventaja significativa.
- Cabe en cualquier GPU consumer y también en dispositivos de borde, Raspberry Pi y contenedores ligeros.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, Hugging Face Docker Spaces y Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 0,309 ms por muestra a batch 1 y 17.656 muestras/s a batch 128 en CPU, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Accuracy en MNIST (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chrisjcc/mnist-cnn` | 421.834 | 1×28×28 | 0,2293 (declarada, no verificada) | MIT | Hugging Face Hub |
| LeNet-5 (referencia clasica) | ~60.000 | 1×32×32 | ~0,99 (referencia historica) | variable | Implementaciones multiples |
| CNN tipica de tutorial MNIST | 100.000–1.000.000 | 1×28×28 | 0,98–0,99 | variable | Multiples repositorios |

No se dispone de datos comparativos publicados por el autor frente a alternativas concretas. La comparativa anterior se ofrece solo como referencia de categoria; los valores de LeNet-5 y de CNNs de tutorial son cifras habituales de la literatura y no estan verificadas en esta ficha.

## Limitaciones y advertencias

- Rendimiento muy bajo: accuracy de test del 22,93 %, muy por debajo de lo esperable en MNIST (habitualmente >98 %). El modelo no es utilizable para clasificacion fiable de digitos.
- Las clases 0, 6 y 8 obtienen F1 de 0,0000, 0,0000 y 0,0040 respectivamente: el modelo practicamente no las reconoce.
- Entrenado solo 5 epocas sin early stopping, lo que probablemente explica el infraentrenamiento.
- Dominio muy restringido: solo digitos individuales en 28×28, sin soporte para OCR multi-digito, texto alfanumerico ni escenas naturales (SVHN, ICDAR).
- Sensible a la polaridad: MNIST usa trazos blancos sobre fondo negro; las fotos reales de tinta oscura sobre papel requieren inversion explicita.
- No apto para produccion en tareas de reconocimiento de digitos reales.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si en el de predicciones erroneas con alta confianza.
- Sesgos: el conjunto MNIST esta compuesto por digitos manuscritos de poblaciones limitadas (principalmente censo estadounidense y empleados), por lo que puede generalizar mal a otras caligrafias.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; aun asi, la calidad del modelo desaconseja su uso comercial real.
- El modelo-index declara los resultados como no verificados (`verified: false`); conviene tratarlos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisjcc/mnist-cnn
- Dataset MNIST en Hugging Face: https://huggingface.co/datasets/ylecun/mnist
- Dataset alternativo del autor: https://huggingface.co/datasets/chrisjcc/mnist-dataset
- Documentacion de safetensors: https://huggingface.co/docs/safetensors
- DVC: https://dvc.org
- Hydra: https://hydra.cc
- Weights & Biases: https://wandb.ai
- Streamlit: https://streamlit.io
- Hugging Face Docker Spaces: https://huggingface.co/docs/hub/spaces-sdks-docker
