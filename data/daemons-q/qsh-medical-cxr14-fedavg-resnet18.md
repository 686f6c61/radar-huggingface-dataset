# Daemons-Q/qsh-medical-cxr14-fedavg-resnet18

## Resumen

`qsh-medical-cxr14-fedavg-resnet18` es un clasificador binario de derrame pleural (effusion) entrenado sobre el dataset NIH ChestX-ray14, desarrollado por el usuario Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación "quantum-safe" con casos de uso de federated learning médico. El modelo es una ResNet-18 con stem de un solo canal, entrada a 224 px, una única logit de salida, entrenada desde inicialización aleatoria (sin pesos ImageNet) mediante FedAvg sobre cuatro hospitales simulados.

Su relevancia no reside en la arquitectura —un backbone convolucional estándar de 11,18 millones de parámetros— sino en el contexto: demuestra un pipeline de entrenamiento federado con cuantización INT8 y exportación a ONNX para inferencia en navegador vía onnxruntime-web. Alcanza un AUROC de 0,8065 en el split de test oficial, por encima del baseline publicado de Wang et al. (0,7585) pero por debajo de Baltruschat et al. (0,818-0,822), con protocolos de evaluación no directamente comparables.

El modelo se publica como pesos "plaintext": según la propia model card, ningún camino de código lo evalúa bajo cifrado. Está pensado como pieza de una demo, no como dispositivo médico ni como componente listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), stem de 1 canal, 1 logit de salida |
| Parametros totales | 11.180.353 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 224x224 px) |
| Tipos de cuantizacion | INT8 (referenciada en metricas `auroc_int8` y `features_int8_head_auroc`); no se detalla el esquema exacto |
| Idiomas soportados | no disponible (clasificación de imagen, sin componente textual) |
| Licencia | `nih-chestx-ray14-terms` (uso sin restricciones, atribución solicitada) |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

ResNet-18 convolucional estándar adaptada a radiografía de tórax: stem de un solo canal en lugar de tres, resolución de entrada 224x224 px y una única unidad de salida (logit) para clasificación binaria de derrame pleural. Se entrena desde inicialización aleatoria, sin transferencia desde ImageNet. El modelo se exporta a ONNX con una discrepancia máxima frente a PyTorch de 1,2e-05 en la logit, lo que permite inferencia en navegador con onnxruntime-web.

El entrenamiento usa federated averaging sobre cuatro "hospitales" simulados: los pacientes de train_val de NIH se asignan a cada hospital según la proporción de vistas AP, con shares AP realizados entre 11,9% y 77,4%. Se ejecutan 12 rondas de FedAvg con una época local por ronda, AdamW a 1e-3, batch 128 y 224 px. El modelo publicado corresponde a la primera de tres semillas fijadas antes del entrenamiento (las tres puntúan entre 0,803 y 0,806). El dataset son 112.120 radiografías frontales de 30.805 pacientes del NIH Clinical Center, con etiquetas extraídas de informes radiológicos por NLP; se descartan 26 imágenes por duplicados pixel-idénticos. No se menciona RLHF, DPO ni ajuste por preferencias (no aplica a clasificación).

## Capacidades

- Clasificación binaria de derrame pleural en radiografía frontal de tórax (vistas PA y AP).
- Salida de una logit cruda y de una probabilidad softmax; la model card incluye un mapa de calibración (parámetros a = -0,915056, b = 0,052483) para convertir la probabilidad en riesgo calibrado.
- Inferencia cuantizada a INT8 con pérdida de rendimiento mínima (AUROC 0,8063 frente a 0,8065 en FP).
- Exportación ONNX verificada, apta para onnxruntime-web.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto ni audio; es exclusivamente un clasificador de imagen.

## Casos de uso

- **Demostración de federated learning médico**: el modelo sirve como artefacto de referencia para reproducir el pipeline de FedAvg sobre cuatro nodos simulados con `scripts/train/medical_cxr_fl.py`, útil para investigadores que evalúan orquestación federada.
- **Prueba de concepto de inferencia en navegador**: gracias a la exportación ONNX y a onnxruntime-web, puede desplegarse en una demo web que clasifique radiografías localmente sin enviar la imagen a un servidor, un escenario relevante para privacidad.
- **Evaluación de cuantización INT8 en imagen médica**: las métricas `auroc_int8` y `int8_decisions_differing_at_operating_point` (134 decisiones distintas en el punto de operación) permiten estudiar el impacto de la cuantización en un clasificador clínico.
- **Calibración y análisis de riesgo**: el mapa de calibración con Brier score (0,1205 a 0,1202), log-loss (0,3816 a 0,3799) y CORP MCB (0,001004 a 0,000712) sirve como caso de estudio de calibración en modelos médicos.
- **Baseline para comparación de arquitecturas**: con AUROC 0,8065 en el split oficial, es un punto de referencia reproducible para comparar ResNet-18 frente a arquitecturas más grandes (ResNet-38 a -101) en ChestX-ray14.
- **Investigación sobre sesgo de vista (AP vs PA)**: la métrica `auroc_ap` (0,8428) y la distribución desigual de vistas entre train y test permiten analizar cómo el dominio de adquisición afecta al rendimiento.
- **Docencia en pipelines MLOps médicos**: ilustra el ciclo completo desde entrenamiento federado hasta exportación ONNX y despliegue web, con métricas de validación documentadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUROC (test oficial) | 0,806452 |
| AUROC en vistas AP (`auroc_ap`) | 0,842801 |
| AUROC con cuantizacion INT8 | 0,806264 |
| AUROC con features INT8 y cabeza | 0,806259 |
| Sensibilidad en el punto de operacion | 0,882947 |
| Especificidad en el punto de operacion | 0,549276 |
| Logit del punto de operacion | -2,284995 |
| Imagenes de test | 25.589 |
| Pacientes de test | 2.797 |
| Positivos de test | 4.656 |
| Brier score (crudo a calibrado) | 0,120466 a 0,120174 |
| Log-loss (crudo a calibrado) | 0,381644 a 0,379885 |
| CORP MCB (crudo a calibrado) | 0,001004 a 0,000712 |
| Brier skill frente a la tasa base | 0,1926 |
| Tiempo de pared del entrenamiento | 7.513,3 s |

Comparación con baselines publicados citados en la model card:

| Modelo | AUROC Effusion | Notas |
|---|---|---|
| Wang et al. (ChestX-ray8, CVPR 2017) | 0,7585 | ResNet-50 desde ImageNet, solo últimas capas entrenadas, 14 hallazgos |
| Este modelo | 0,8065 | ResNet-18, 224 px, 1 hallazgo, inicialización aleatoria, FedAvg |
| Baltruschat et al. (Sci Rep 2019) | 0,818 a 0,822 | ResNet-38 a -101, 448 px, con edad, sexo y vista como entradas |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (11,18 M parámetros, ~45 MB de pesos); en INT8, aproximadamente 11 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son sobradas.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequeños; también en navegador vía onnxruntime-web (WebGL/WebGPU/WASM).
- Opciones de despliegue: ONNX Runtime (Python, C++, JS), onnxruntime-web, y conversión a otros runtimes si se necesita; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada; el tiempo de pared de 7.513,3 s corresponde al entrenamiento completo, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AUROC Effusion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-18 FedAvg) | 11,18 M | 224 px, 1 canal | 0,8065 | NIH ChestX-ray14 terms | Hugging Face (ONNX + safetensors) |
| Wang et al. ChestX-ray8 (ResNet-50) | no disponible | no disponible | 0,7585 | no disponible | Baseline publicado, sin pesos liberados en la ficha |
| Baltruschat et al. (ResNet-38 a -101) | no disponible | 448 px + metadatos | 0,818 a 0,822 | no disponible | Publicación científica, sin pesos en la ficha |

La comparación es orientativa: los protocolos difieren en resolución, número de hallazgos, inicialización y entradas auxiliares, por lo que la model card advierte explícitamente que "places it, and does not rank methods".

## Limitaciones y advertencias

- **No es un dispositivo médico**: no ha pasado validación regulatoria ni estudios clínicos prospectivos; no debe usarse para diagnóstico.
- **Etiquetas ruidosas**: las etiquetas se extrajeron de informes por NLP, no de lectura de imagen; un radiólogo re-leyendo 50 imágenes por hallazgo estimó el valor predictivo positivo de Effusion en 70-74% (Oakden-Rayner, 2020).
- **Sesgo de vista**: las películas AP (típicamente de cabecera) muestran más derrame que las PA, y el test tiene más AP que el entrenamiento (AP 20,0% y PA 15,8% en test frente a 12,6% y 8,6% en train_val), lo que afecta a la generalización.
- **Duplicados en el dataset**: 25 grupos de imágenes pixel-idénticas, tres de ellos cruzando el split oficial; el entrenamiento descarta 26 imágenes, pero el test puede contener duplicados.
- **Calibración imperfecta**: la probabilidad cruda está descalibrada (media del 18,4% frente a una tasa base del 18,2% en test); debe aplicarse el mapa de calibración si se necesita un riesgo interpretable.
- **Rendimiento modesto en especificidad**: 0,5493 en el punto de operación, lo que implica una tasa alta de falsos positivos si se usa con esa sensibilidad.
- **Restricciones de licencia**: la licencia NIH ChestX-ray14 no impone restricciones de uso, pero solicita atribución al NIH Clinical Center y citación del paper CVPR 2017; las etiquetas MAPLEZ opcionales son CC BY-NC 4.0 y no se usan.
- **Alcance limitado**: un solo hallazgo, una sola modalidad, sin capacidades de texto, tool calling ni agentes; el modelo es "plaintext" y no se evalúa bajo cifrado pese a las etiquetas `quantum-safe` y `privacy-preserving`.

## Enlaces

- Hugging Face: https://huggingface.co/Daemons-Q/qsh-medical-cxr14-fedavg-resnet18
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset NIH ChestX-ray14 (licencia y descarga): https://nihcc.app.box.com/v/ChestXray-NIHCC
- Paper de referencia del dataset: Wang X, Peng Y, Lu L, Lu Z, Bagheri M, Summers RM. ChestX-ray8: Hospital-scale Chest X-ray Database and Benchmarks on Weakly-Supervised Classification and Localization of Common Thorax Diseases. CVPR 2017. arXiv:1705.02315
- Baseline de comparación: Baltruschat et al., Sci Rep 2019, Table 5 (no se proporciona URL en la información disponible)
- Estudio sobre calidad de etiquetas: Oakden-Rayner, Academic Radiology 27:106, 2020 (no se proporciona URL en la información disponible)
