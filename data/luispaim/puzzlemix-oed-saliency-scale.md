# LuisPaim/puzzlemix-oed-saliency-scale

## Resumen

`puzzlemix-oed-saliency-scale` es un repositorio de investigación publicado por LuisPaim (FACOM/UFU) que contiene los pesos, la telemetría de entrenamiento y los resultados de un estudio sobre el uso de Puzzle Mix en la gradación de displasia epitelial oral (OED, *oral epithelial dysplasia*). No se trata de un modelo fundacional nuevo, sino de un conjunto de 187 `state_dict` de VGG16-BN entrenados bajo distintos regímenes de *data augmentation* para clasificar recortes histopatológicos en cuatro grados ordinales (sano, leve, moderado, severo).

El objetivo del trabajo, presentado en el Workshop of Undergraduate Works (WUW) del SIBGRAPI 2026, es caracterizar **cuándo** el Puzzle Mix aporta valor frente a alternativas más simples como CutMix o el mezclado aleatorio de bloques, prestando especial atención al desajuste entre la escala de la rejilla de máscara y la escala a la que la saliencia tiene estructura real. La arquitectura es una VGG16-BN preentrenada en ImageNet con la cabeza sustituida por *global average pooling* más una capa fully connected de 4 salidas.

El conjunto de datos empleado es OralEpitheliumDB (456 ROIs, 114 por clase), con un holdout de test del 20 % y validación cruzada de 5 folds sobre el resto. Cada régimen se evalúa con 5 semillas (7, 12, 17, 42, 123), y cada semilla se mide mediante el ensemble de sus 5 folds. El repositorio ocupa 4,5 GB e incluye el código fuente del pipeline en `code/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG16-BN (CNN, *backbone* VGG16 con *batch normalization*) |
| Parametros totales | no disponible (VGG16 estándar, aproximadamente 138 M según la arquitectura de referencia; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 px tras Resize(256) + CenterCrop(224)) |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` PyTorch `.pth`) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (`state_dict` de PyTorch, `torch.load` con `weights_only=True`) |

## Arquitectura y entrenamiento

La red es una VGG16-BN preentrenada en ImageNet a la que se sustituye la cabeza clasificadora original por *global average pooling* seguido de una única capa fully connected con 4 salidas, correspondientes a las clases ordinales `healthy`, `mild`, `moderate`, `severe`. El entrenamiento usa AdamW con LR 5e-4 y *weight decay* 1e-5, scheduler `CosineAnnealingLR`, 50 épocas, batch efectivo 32 (16 × 2 de acumulación de gradiente) y precisión mixta automática (AMP). Todo el entrenamiento se ejecutó en una NVIDIA RTX 3050 Laptop con 6 GB de VRAM.

El estudio compara varios regímenes de aumento de datos: `baseline` (sin mezcla), `cutmix` (Yun et al., 2019), `puzzlemix` (versión simplificada del Puzzle Mix de Kim, Choo y Song, ICML 2020), `puzzlemix_full` y `puzzlemix_fine` (Puzzle Mix oficial con rejillas `block_num` de {2,4,8,16} y {8,16} respectivamente, con etiqueta suave), y tres brazos de control `random_coarse`, `random_full` y `random_fine` que sortean bloques sin usar saliencia. La innovación metodológica no está en la arquitectura sino en el análisis: se mide la tasa de colapso de la máscara y se contrasta la concentración de saliencia real frente a permutada para diagnosticar el desajuste de escalas.

## Capacidades

- Clasificación de imágenes histopatológicas de epitelio oral en 4 clases ordinales (sano, leve, moderado, severo).
- Extracción de características visuales mediante un *backbone* VGG16-BN preentrenado en ImageNet y ajustado al dominio.
- Evaluación mediante ensemble de 5 folds por semilla, lo que permite estimar incertidumbre entre particiones.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: el dominio está restringido a recortes ROI de OralEpitheliumDB.
- No dispone de modo *thinking*, audio ni otras modalidades.

## Casos de uso

- **Reproducción de experimentos de *mixup* en imágenes médicas**: el repositorio incluye telemetría, CSVs de métricas y figuras, lo que permite replicar exactamente las curvas de entrenamiento y los resultados publicados en el WUW.
- **Comparación controlada de estrategias de aumento**: los brazos `random_coarse`, `random_full` y `random_fine` sirven como controles para aislar el efecto de la saliencia frente al simple sorteo de bloques en tareas de clasificación ordinal.
- **Estudio del desajuste de escalas en Puzzle Mix**: la figura de concentración de saliencia (real frente a permutada) y la tasa de colapso de la máscara permiten analizar cuándo la rejilla de máscara deja de capturar estructura relevante.
- **Prototipado de clasificadores de displasia oral**: los `state_dict` de `baseline` y `cutmix` pueden cargarse con `build_model("vgg16_bn", num_classes=4)` para obtener una línea base reproducible sobre OralEpitheliumDB antes de probar arquitecturas más modernas.
- **Docencia e iniciación a la investigación**: el pipeline completo en `code/`, con módulos y tests, está pensado como material de investigación de iniciación científica en FACOM/UFU.
- **Auditoría de métodos de aumento**: la carpeta `auditoria_puzzlemix/` contiene un informe y figuras específicas sobre la versión simplificada del régimen Puzzle Mix, útil para revisar implementaciones propias.

## Benchmarks y rendimiento

Resultados del autor sobre el holdout de test (20 %), con ensemble de 5 folds y media ± desviación estándar entre semillas.

| Régimen | Semillas | QWK | AUC | F1 | Exactitud |
|---|---|---|---|---|---|
| `baseline` | 5 | 0,9281 ± 0,0220 | 0,9706 | 0,8596 | 0,8587 |
| `cutmix` | 5 | 0,9252 ± 0,0117 | 0,9751 | 0,8719 | 0,8717 |
| `puzzlemix` (simplificado) | 5 | 0,9136 ± 0,0207 | 0,9685 | 0,8501 | 0,8500 |

| Brazo | Grades (`block_num`) | Semillas | QWK | AUC | Tasa de colapso de máscara |
|---|---|---|---|---|---|
| `random_coarse` | [2, 4] | 5 | 0,9169 ± 0,0213 | 0,9682 | — |
| `random_full` | [2, 4, 8, 16] | 5 | 0,9114 ± 0,0166 | 0,9674 | — |
| `random_fine` | [8, 16] | 5 | 0,9048 ± 0,0268 | 0,9655 | — |
| `puzzlemix_full` | [2, 4, 8, 16] | 5 | 0,8922 ± 0,0399 | 0,9522 | 0,334 |
| `puzzlemix_fine` | [8, 16] | 2 | 0,9102 ± 0,0450 | 0,9517 | 0,187 |

El autor indica explícitamente que ninguna comparación pareada alcanza p < 0,05 con 5 semillas y que los tests son exploratorios. No se publican resultados de MMLU, HumanEval ni GSM8K por tratarse de un modelo de visión médica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: VGG16-BN en FP32 requiere aproximadamente 0,5 GB de pesos; con activaciones para batch pequeño cabe holgadamente en 2-4 GB. El entrenamiento con AMP y batch efectivo 32 se realizó en una RTX 3050 Laptop de 6 GB.
- **GPU recomendadas**: cualquier GPU consumer con ≥ 4 GB de VRAM es suficiente para inferencia (RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para reentrenar los 187 checkpoints conviene una GPU con ≥ 8 GB (RTX 3080/4080, A10, L4). Para *sweeps* completos de 5 semillas × 5 folds × 7 regímenes es recomendable A100 o H100 por throughput agregado.
- **Cabe en GPU consumer**: sí, en cualquier GPU con ≥ 4 GB para inferencia y ≥ 6 GB para entrenamiento con AMP.
- **Opciones de despliegue**: al ser un `state_dict` de PyTorch con código propio (`code/src/architectures.py`), el despliegue se hace con PyTorch nativo, TorchServe o exportación a ONNX/TorchScript. No hay pesos GGUF ni integración con llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Tarea | Licencia |
|---|---|---|---|---|---|
| `puzzlemix-oed-saliency-scale` | VGG16-BN | no declarado (~138 M ref.) | 224×224 px | Clasificación OED 4 clases | no disponible |
| VGG16-BN ImageNet (torchvision) | VGG16-BN | ~138 M | 224×224 px | Clasificación ImageNet 1000 clases | BSD-3-Clause |
| ResNet-50 (torchvision) | CNN residual | ~25,6 M | 224×224 px | Clasificación ImageNet 1000 clases | BSD-3-Clause |
| Modelos histopatológicos tipo CNN (p. ej. variantes sobre PatchCamelyon) | CNN / ViT | variable | 96-224 px | Clasificación binaria/multiclase de parches | variable |

No se dispone de comparaciones directas publicadas por el autor frente a otros clasificadores de OED. La comparativa anterior es orientativa por arquitectura y tarea, no por rendimiento en el mismo *benchmark*.

## Limitaciones y advertencias

- **No apto para uso clínico**: el autor lo indica explícitamente. El conjunto OralEpitheliumDB es pequeño (456 ROIs), de una única fuente, y los modelos no han pasado validación externa.
- **Resultados no concluyentes**: con 5 semillas, ninguna comparación pareada alcanza p < 0,05; los tests son exploratorios y no debe interpretarse ninguna diferencia como ganancia significativa.
- **Cobertura incompleta en `puzzlemix_fine`**: solo 2 semillas completas (17 y 42) más los folds 1 y 2 de la semilla 7, frente a las 5 semillas del resto de regímenes.
- **Riesgo de sobreajuste**: el dataset es reducido y las métricas de QWK superan 0,89 en todos los regímenes, lo que sugiere que el holdout puede no reflejar variabilidad intercentro.
- **Licencia no declarada**: no hay información sobre permisos de uso comercial; debe contactarse con el autor antes de cualquier uso más allá de investigación.
- **Dependencia de código propio**: la carga requiere descargar `code/src/architectures.py` del propio repositorio; no hay integración con `transformers` ni `timm`.
- **Sesgos potenciales**: al provenir de una única fuente histopatológica, el modelo puede no generalizar a distintas tinciones, escáneres o protocolos de laboratorio.
- **Idioma y modalidad**: sin capacidades de texto ni multilingües; cualquier uso fuera de clasificación de imágenes de epitelio oral queda fuera de su dominio.

## Enlaces

- Hugging Face: https://huggingface.co/LuisPaim/puzzlemix-oed-saliency-scale
- Repositorio de código: https://github.com/LuisFelipePaim/puzzlemix-oed-saliency-scale
- Referencia Puzzle Mix (Kim, Choo y Song, ICML 2020): no disponible como enlace en la información proporcionada
- Referencia CutMix (Yun et al., ICCV 2019): no disponible como enlace en la información proporcionada
- Dataset OralEpitheliumDB: no disponible como enlace en la información proporcionada
- Workshop of Undergraduate Works (WUW) SIBGRAPI 2026: no disponible como enlace en la información proporcionada
