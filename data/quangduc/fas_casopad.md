# quangduc/fas_casopad

## Resumen

CASO-PAD es un framework de investigación para la detección de ataques de presentación facial (face anti-spoofing, FAS), es decir, la tarea de distinguir un rostro real de una falsificación mostrada ante una cámara (foto impresa, pantalla, máscara, etc.). El repositorio `quangduc/fas_casopad` no contiene un modelo entrenado publicable, sino un paquete offline de 1,3 GB que incluye el código de entrenamiento y evaluación de CASO-PAD junto con los pesos preentrenados de ImageNet de 13 backbones de torchvision, pensado para ejecutarse en clústeres de GPU sin acceso a internet (air-gapped).

El interés técnico del bundle es la reproducibilidad en entornos aislados: los scripts `check_weights.py` y `check_env.py` verifican que todas las dependencias y pesos estén presentes sin realizar descargas en tiempo de ejecución, y el manifiesto `MANIFEST.sha256` cubre 50 ficheros. El modelo combina backbones ligeros como MobileNetV3 o ResNet con el operador *involution* (parámetros `--inv_kernel`, `--inv_groups`, `--inv_reduce`), una alternativa a la convolución que reduce el coste computacional en tareas de clasificación de imágenes.

La relevancia ahora es acotada: se trata de material de entrenamiento y no de un checkpoint listo para producción, con cero descargas y cero likes en Hugging Face, licencia "other" y model card escrita en vietnamita. Es útil para equipos que quieran reproducir los experimentos de CASO-PAD sobre datasets de anti-spoofing (CVPR2023 Wild, OULU-NPU, SiW-Mv2, MSU-MFSD, CASIA-FASD, Replay-Attack, ROSE-Youtu) en infraestructura sin red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbones CNN de torchvision (MobileNetV2/V3, ResNet18/34/50, EfficientNet-B0/B1/B2, ConvNeXt-Tiny/Small, VGG16, ShuffleNetV2 x1.0) con operador involution; framework CASO-PAD |
| Parametros totales | no disponible (depende del backbone seleccionado; 13 backbones distintos en el bundle) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen con `--img_size` configurable, 256 por defecto en los ejemplos) |
| Tipos de cuantizacion | no disponible (el bundle distribuye pesos en FP32 `.pth`) |
| Idiomas soportados | no aplica (clasificación de imágenes); documentación en vietnamita |
| Licencia | other |
| Formato de pesos | `.pth` (PyTorch state dicts de ImageNet para los backbones); código fuente `.py`; bundle `.zip` |

## Arquitectura y entrenamiento

El bundle no incluye un modelo entrenado de CASO-PAD, sino la infraestructura para entrenarlo: 16 ficheros Python (`train.py`, `train_node1.py`, `train_node2.py`, `ddp_common.py`, `build_data.py`, `build_model.py`, `evaluate.py`, `evaluate_fn.py`, `check_cvpr_dataset.py`, entre otros) más 17 checkpoints `.pth` (1422 MB) que cubren 13 backbones de torchvision en sus dos APIs (`weights="DEFAULT"` y `pretrained=True`). La arquitectura efectiva se construye en `build_model.py` combinando el backbone elegido con el método `caso_pad` y el operador involution, cuyos hiperparámetros se pasan por línea de comandos (`--inv_kernel 5`, `--inv_groups 120`, `--inv_reduce 4`).

El entrenamiento soporta modo mononodo (`train.py`) y distribuido multi-GPU con `torchrun` y DDP (`train_node1.py`), con precisión mixta (`--amp bf16`), parada temprana (`--early_stop_patience`) y TensorBoard. Los data loaders incluidos cubren CVPR2023 Wild (layout `living/` y `spoof/<type>/<subject>/`), OULU-NPU, SiW-Mv2, MSU-MFSD, CASIA-FASD, Replay-Attack/Mobile y ROSE-Youtu. No se especifican en la información disponible el número de tokens, la composición exacta del dataset de entrenamiento ni si se aplicó RLHF/DPO (no aplicable en esta tarea). El entorno validado usa PyTorch 2.4.1+cu124, torchvision 0.19.1, numpy 2.1.1, OpenCV headless 4.10 y scikit-learn 1.5.2, sobre Python 3.9–3.12.

## Capacidades

- Clasificación binaria de imágenes de rostro para detección de ataques de presentación (real vs. spoof), con pipeline `image-classification`.
- Entrenamiento reproducible de CASO-PAD sobre siete datasets de face anti-spoofing mediante los loaders incluidos.
- Ejecución completamente offline: verificación de pesos y dependencias sin acceso a red (`check_weights.py`, `check_env.py`).
- Entrenamiento distribuido multi-GPU con DDP y precisión mixta bf16.
- Selección entre 13 backbones preentrenados en ImageNet sin necesidad de descargarlos.
- Soporte de evaluación con métricas de anti-spoofing mediante `evaluate.py` y `evaluate_fn.py`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es un modelo de clasificación de imágenes.

## Casos de uso

- Investigación en anti-spoofing facial: reproducir los experimentos del paper CASO-PAD sobre CVPR2023 Wild y comparar variantes de backbone sin depender de descargas externas.
- Despliegue en clústeres air-gapped: instituciones con GPU aisladas de internet pueden lanzar `train.py` o `torchrun` directamente tras desempaquetar el zip y validar con `check_weights.py`.
- Auditoría de sesgos y robustez en detección de ataques: entrenar el mismo método sobre OULU-NPU, SiW-Mv2 y MSU-MFSD para medir generalización entre dominios con los loaders ya incluidos.
- Prototipado de verificación de identidad con prueba de vida: usar el modelo resultante como etapa de *liveness detection* en pipelines de autenticación biométrica antes de pasar a reconocimiento facial.
- Onboarding de nuevos investigadores: el bundle incluye `dataset_paths.example.json`, `make_wheelhouse.sh` y README completo, lo que reduce el tiempo de puesta a punto en un entorno controlado.
- Integración en pipelines de CI/CD de ML: el manifiesto `MANIFEST.sha256` y `SHA256SUMS.txt` permiten verificar la integridad del artefacto en cada build, algo útil para equipos que versionan entornos de entrenamiento.
- Experimentación con el operador involution: al exponer `--inv_kernel`, `--inv_groups` y `--inv_reduce` como flags, permite estudiar el equilibrio entre precisión y coste computacional frente a convoluciones estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas de integridad del bundle (verificación de checksums, `check_weights.py` con red bloqueada, un epoch de `train.py` sin peticiones de descarga y `unzip -t` sin errores), no métricas de precisión, APCER, BPCER o ACER sobre los datasets de anti-spoofing.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del backbone; con MobileNetV3-Small o ShuffleNetV2 x1.0 a 256×256 y batch pequeño cabría en GPUs de 8 GB, mientras que VGG16 o ConvNeXt-Small requerirían bastante más. No se aportan cifras oficiales.
- GPU recomendadas: la model card cita H100 como ejemplo de destino (`user@h100`); el entrenamiento con `torchrun --nproc_per_node=8` está pensado para nodos de 8 GPU.
- Cabe en GPU de consumo: probablemente sí para los backbones ligeros (MobileNetV2/V3, ShuffleNetV2, ResNet18) con `--img_size 256` y batch moderado; no confirmado por el autor.
- Opciones de despliegue: el bundle usa PyTorch nativo (`train.py`, `torchrun`); también hay una imagen Docker en Docker Hub (`quangducc/caso-pad-face-spoofing`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Almacenamiento: el zip ocupa ~1,3 GB y el contenido descomprimido incluye 1422 MB de pesos más código y scripts; conviene reservar varios GB adicionales para datasets y checkpoints.
- Dependencias: Python 3.9–3.12, PyTorch ≥ 2.0, torchvision, numpy, OpenCV headless, scikit-learn, pillow, tqdm y tensorboard; `make_wheelhouse.sh` permite generar wheels para instalación offline.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CASO-PAD (este bundle) | Framework de entrenamiento FAS | 13 backbones torchvision + involution | Imagen, `--img_size` configurable (256 por defecto) | other | Hugging Face (bundle offline), GitHub upstream, Docker Hub |
| DeepPixBiS | Modelo FAS | Red tipo DenseNet con supervisión por píxel | Imagen / parche facial | Académica (según implementación) | Repositorios académicos |
| CDCN / CDCN++ | Modelo FAS | Red de profundidad central | Imagen | Académica | Repositorios académicos |
| FaceBagNet | Modelo FAS | Ensemble multi-modal (RGB, depth, IR) | Imagen multi-modal | Académica | Repositorios académicos |

La comparación con DeepPixBiS, CDCN y FaceBagNet es orientativa por categoría (detección de ataques de presentación), no por resultados medidos: no se dispone de cifras de benchmarks de este bundle que permitan una comparación cuantitativa. Frente a ellos, la diferencia principal de CASO-PAD es su naturaleza de *framework* configurable con múltiples backbones y su empaquetado offline, no un checkpoint único.

## Limitaciones y advertencias

- No es un modelo entrenado listo para producción: el repositorio contiene código de entrenamiento y pesos de ImageNet de los backbones, no un checkpoint de CASO-PAD afinado.
- Licencia "other": no se especifican los términos exactos; es imprescindible revisar las condiciones antes de cualquier uso comercial. Los backbones de torchvision tienen sus propias licencias (BSD para torchvision, pero verificar cada peso preentrenado).
- Documentación en vietnamita: la model card y los mensajes de los scripts están en ese idioma, lo que puede dificultar el mantenimiento a equipos no familiarizados.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuado más allá de la fecha de creación (2026-11-27).
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de falsos negativos/positivos en la detección de spoof, con impacto directo en seguridad biométrica.
- Sesgos potenciales: los datasets FAS incluidos (CVPR2023, OULU-NPU, SiW-Mv2, etc.) tienen distribuciones demográficas y de dispositivos acotadas; el rendimiento puede degradarse en cámaras, iluminación o demografía no representadas.
- Dependencia de datasets externos: los datos no se incluyen en el zip y deben estar disponibles en la máquina destino con el layout esperado; `check_cvpr_dataset.py` ayuda a validarlo pero no corrige formatos incorrectos.
- Restricciones de entorno: requiere PyTorch ≥ 2.0 y Python 3.9–3.12; si el clúster carece de las librerías, hay que generar el wheelhouse en una máquina con internet.
- Sin métricas publicadas: no se puede afirmar ningún nivel de precisión, APCER, BPCER o ACER sin ejecutar los entrenamientos y evaluaciones por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/quangduc/fas_casopad
- Código upstream (GitHub): https://github.com/Shujaat123/CASO-PAD
- Imagen Docker: `quangducc/caso-pad-face-spoofing` en Docker Hub (https://hub.docker.com/r/quangducc/caso-pad-face-spoofing)
- Dataset CVPR2023 Wild (referenciado en la model card, no incluido en el bundle): no disponible como enlace directo en la información proporcionada
- Paper de CASO-PAD: no disponible en la información proporcionada
