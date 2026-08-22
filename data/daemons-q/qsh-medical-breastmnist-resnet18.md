# Daemons-Q/qsh-medical-breastmnist-resnet18

## Resumen

El modelo `qsh-medical-breastmnist-resnet18`, publicado por Daemons-Q (Amon Koike), es un ResNet-18 entrenado sobre el subconjunto BreastMNIST de MedMNIST v2 para clasificación binaria de imágenes de ultrasonido de mama (benigno frente a maligno). Trabaja con imágenes de 28x28 píxeles y está publicado en formato ONNX y safetensors, pensado para ejecutarse en navegador mediante onnxruntime-web.

El modelo forma parte de un demostrador de investigación más amplio llamado QSMPC-QKD-QHE-AI-Hybrid, que combina computación multiparte segura, distribución cuántica de claves, cifrado homomórfico e IA para ilustrar un flujo de aprendizaje federado médico con protección de privacidad. Este repositorio contiene el modelo en claro; la ruta cifrada usa un modelo destilado distinto, no este.

Es relevante porque documenta de forma transparente las métricas reales medidas sobre el conjunto de datos y los problemas de contaminación y licencia del propio dataset, algo poco habitual en publicaciones de modelos. No obstante, el autor lo presenta explícitamente como prueba de concepto, no como sistema de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN convolucional) |
| Parámetros totales | 11.180.716 (safetensors) / 11.171.266 (según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imagen) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | cc-by-4.0-asserted-by-medmnist |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Se trata de un ResNet-18 estándar, con 18 capas convolucionales residuales, diseñado para entrada de 28x28 píxeles en escala de grises. Es una arquitectura densa, sin atención, sin mezcla de expertos ni mecanismos de estado. El entrenamiento se realizó sobre el subconjunto BreastMNIST de MedMNIST v2, compuesto por 780 imágenes (780 imágenes de entrenamiento y 156 de test), con etiquetas binarias benigno/maligno. No se han publicado detalles de hiperparámetros, optimizador o número de épocas; el autor solo reporta un tiempo de entrenamiento de 8,4 segundos en su entorno.

La innovación técnica no reside en la arquitectura del modelo, sino en el pipeline que lo envuelve: el repositorio QSMPC-QKD-QHE-AI-Hybrid combina cifrado homomórfico (QHE), distribución de claves cuánticas (QKD) y computación multipartita segura (MPC) para demostrar un flujo de aprendizaje federado médico con privacidad. Este modelo en concreto es el componente "en claro" del caso de uso `medical_fl`; la ruta cifrada usa un modelo estudiante destilado, no este.

## Capacidades

- Clasificación binaria de imágenes de ultrasonido mamario: distingue entre benigno y maligno.
- Procesa imágenes de baja resolución (28x28), lo que lo hace adecuado para entornos con recursos muy limitados.
- Ejecutable en navegador gracias al formato ONNX y la compatibilidad con onnxruntime-web.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo de pensamiento, visión general, audio ni otras modalidades.

## Casos de uso

- Screening inicial de apoyo en entornos con recursos limitados: el modelo puede servir como primer filtro automático para señalar imágenes de ultrasonido mamario sospechosas, aunque su baja resolución (28x28) limita su utilidad clínica real.
- Prototipo de aprendizaje federado con cifrado: es el componente "en claro" de un pipeline que demuestra cómo entrenar y clasificar sin exponer datos médicos crudos, combinando QKD, QHE y MPC.
- Demostración de clasificación en el navegador: gracias al formato ONNX y onnxruntime-web, puede ejecutarse en el cliente sin enviar las imágenes a un servidor, útil para demostraciones de privacidad.
- Validación de arquitecturas en el benchmark MedMNIST: al ser un ResNet-18 estándar sobre BreastMNIST, sirve como referencia reproducible para comparar otras arquitecturas o técnicas de entrenamiento.
- Educación en aprendizaje automático aplicado a imagen médica: por su tamaño pequeño y su documentación honesta, es adecuado para cursos y talleres sobre clasificación de imágenes médicas y sobre los riesgos de los datasets.
- Prueba de concepto de flujo quantum-safe para salud: integra el modelo en una demostración de orquestación con seguridad cuántica, útil para evaluar viabilidad de infraestructuras de IA médica protegida.

## Benchmarks y rendimiento

El autor ha medido las siguientes métricas sobre el split de MedMNIST v2 BreastMNIST:

| Métrica | Valor medido |
|---|---|
| Accuracy | 0,8654 |
| AUC | 0,9147 |
| Mejor AUC en validación (best_val_auc) | 0,9557 |
| Macro F1 | 0,8249 |
| Tiempo de entrenamiento | 8,4 s |

Se comparan con los siguientes baselines publicados en MedMNIST v2 (Yang et al., Scientific Data 10:41, 2023):

| Modelo | AUC | Accuracy |
|---|---|---|
| **ResNet-18 @28px (este modelo)** | **0,8927** | **0,8654** |
| Baseline ResNet-18 @28px (Yang et al.) | 0,901 | 0,863 |
| Google AutoML Vision (techo publicado) | 0,919 | — |

El modelo supera el accuracy del baseline de Yang et al. (0,8654 frente a 0,863) pero queda por debajo en AUC (0,8927 frente a 0,901). No alcanza el techo de AutoML Vision.

## Requisitos de hardware

- Tamaño del modelo: ~45 MB en pesos (11,2 M de parámetros), lo que lo hace apto para CPU y para GPU de gama baja.
- VRAM estimada: inferior a 1 GB en FP32; con cuantización a 8 bits podría bajar de 100 MB, aunque no se han publicado versiones cuantizadas.
- GPUs compatibles: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3060, A100) es suficiente; también funciona en CPU.
- Despliegue: dado el formato ONNX, puede servirse con ONNX Runtime (incluida la versión web), o convertirse a otros formatos si se desea. No hay soporte directo documentado para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia: no se han publicado datos de latencia o throughput; al ser una red pequeña y de baja resolución, la inferencia es de pocos milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | AUC | Accuracy | Licencia |
|---|---|---|---|---|---|
| **qseam-medical-breastmnist-resnet18** (este) | 11,2 M | 28x28 | 0,8927 | 0,8654 | cc-by-4.0-asserted-by-medmnist |
| ResNet-18 @28px (Yang et al., 2023) | ~11,2 M | 28x28 | 0,901 | 0,863 | CC-BY-4.0 (MedMNIST) |
| Google AutoML Vision (MedMNIST v2) | no disponible | 28x28 | 0,919 | no disponible | propietaria |
| Daemons-Q/qseam-medical-breastmnist-resnet50 | no disponible | 28x28 | no disponible | no disponible | cc-by-4.0-asserted-by-medmnist |

La comparativa con AutoML Vision es orientativa: se trata de un sistema propietario con recursos de entrenamiento muy superiores. El modelo aquí se sitúa en la misma línea que el baseline académico de ResNet-18.

## Limitaciones y advertencias

- **Contaminación del dataset**: el propio autor documenta que BreastMNIST contiene duplicados. Se ha medido una pareja pixel-exacta (train[115] con etiqueta MALIGNO y test[76] con etiqueta BENIGNO) que cruza la partición de entrenamiento y test, lo que supone un 0,64 % de las imágenes de test que el modelo no puede clasificar correctamente por diseño. Además, relajando el criterio a RMSE≤0,05 aparecen 216 pares casi duplicados, 120 de ellos cruzando la frontera del split.
- **Licencia ambigua**: MedMNIST se licencia CC-BY-4.0, pero BreastMNIST deriva de BUSI (Al-Dhabyani et al., Data in Brief 28:104863, 2020), cuya concesión de uso de los datos no es verificable; la licencia del artículo no cubre necesariamente el dataset. El autor lo señala explícitamente como un problema no resuelto.
- **No es un sistema de producción**: el propio autor lo califica como prueba de concepto de investigación, no apto para diagnóstico clínico.
- **Baja resolución**: 28x28 píxeles es una resolución muy baja para imagen médica real; el modelo no debería usarse con imágenes de mayor resolución sin reentrenamiento.
- **Sesgos potenciales**: el dataset original (BUSI) presenta desequilibrios de clases y no se han documentado análisis de sesgos por grupos demográficos.
- **Riesgo de alucinación**: no aplica, al ser un clasificador de imagen sin generación de texto.
- **Sin cuantizaciones publicadas**: no hay versiones cuantizadas, por lo que el despliegue en entornos muy restringidos requeriría trabajo adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Daemons-Q/qsh-medical-breastmnist-resnet18)
- [Perfil del autor en Hugging Face](https://huggingface.co/Daemons-Q)
- [Repositorio del pipeline QSMPC-QKD-QHE-AI-Hybrid](https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid)
- [MedMNIST v2 (dataset y paper)](https://medmnist.com/)
- Paper de referencia: Yang, Shi, Wei, Liu, Zhao, Ke, Pfister & Ni, "MedMNIST v2 - A large-scale lightweight benchmark for 2D and 3D biomedical image classification", Scientific Data 10:41 (2023)
- Paper del dataset original: Al-Dhabyani, Gomaa, Khaled & Fahmy, "Dataset of breast ultrasound images", Data in Brief 28:104863 (2020)
