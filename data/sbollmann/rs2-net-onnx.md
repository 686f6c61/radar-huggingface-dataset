# sbollmann/rs2-net-onnx

## Resumen

RS2-Net (ONNX export) es la exportación a formato ONNX del modelo RS2-Net, una red Swin-UNETR entrenada dentro de nnU-Net v2 para la extracción automática de cerebro (skull stripping) en resonancia magnética de roedores. El desarrollo original corresponde a Lin, Ding, Chang, Ge, Sui y Jiang (2024), publicado en *NeuroImage*; esta exportación concreta ha sido generada y alojada por el usuario `sbollmann` para su integración en las herramientas QSM.rs y QSMbly de análisis de susceptibilidad magnética cuantitativa.

El modelo resuelve un problema muy específico de preprocesado en neuroimagen preclinical: separar el parénquima cerebral del cráneo, músculo y tejidos no cerebrales en imágenes de ratón y rata. Fue entrenado con 1.142 volúmenes de RM cerebral de roedores procedentes de 89 centros distintos, lo que lo hace robusto a variabilidad de protocolo, imán y centro, un aspecto crítico en estudios multicéntricos.

La relevancia de esta ficha no está en el modelo base, ya publicado en 2024, sino en el artefacto ONNX: un único grafo de 63,4 MB con entrada de tamaño fijo `[1, 1, 128, 96, 128]`, exportado de forma reproducible con opset 17, que permite ejecutar la inferencia fuera del ecosistema PyTorch. El pico de memoria declarado es de ~2,7 GB, frente a los ~4,5 GB del parche nativo de 128×128×160, lo que abre la puerta a despliegues en entornos con memoria acotada. No es un modelo de lenguaje: no genera texto, no soporta tool calling y no tiene capacidades multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-UNETR (transformer jerárquico con ventanas desplazadas y conexiones U-Net), entrenado dentro de nnU-Net v2 |
| Parametros totales | no disponible (el fichero ONNX en float32 ocupa 63.456.162 bytes; no se publica el recuento de parámetros) |
| Longitud de contexto | no aplica: entrada de parche fijo de 128 × 96 × 128 vóxeles en orden traspuesto `(y, z, x)` de nnU-Net |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es exclusivamente float32 |
| Idiomas soportados | no disponible (no aplica: modelo de segmentación de imagen médica, sin componente lingüístico) |
| Licencia | GPL-3.0 (código y pesos originales y fichero derivado) |
| Formato de pesos | ONNX, opset 17, fichero único `rs2-net.onnx` |
| Entrada | `input`: `float32 [1, 1, 128, 96, 128]` |
| Salida | `logits`: `float32 [1, 1, 128, 96, 128]`; máscara cerebral donde `sigmoid(logit) > 0.5` |
| Preprocesado requerido | Traspuesta, recorte a no cero, z-score y remuestreo a 0,25 × 0,2 × 0,16 mm (pipeline nnU-Net de RS2-Net) |
| Precisión de exportación | float32 |
| Tamano del repositorio | 0,1 GB |
| SHA-256 del artefacto | `a120ce43b06a9f3ddecf85bf18f281cbb54c354ef15b34a6bcaaffa4e3c4a570` |
| Fecha de creación (metadatos HF) | 2026-09-23 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La red es una Swin-UNETR: un transformer con atención basada en ventanas desplazadas que actúa como codificador jerárquico, combinado con un decodificador tipo U-Net que recupera la resolución espacial mediante conexiones de salto. El entrenamiento se realizó dentro del framework nnU-Net v2, que se encarga de la configuración automática de preprocesado, aumentación y esquema de parcheo. El corpus de entrenamiento son 1.142 volúmenes de RM cerebral de ratas y ratones recolectados en 89 centros, lo que convierte el sesgo de dominio en un problema de variabilidad multicéntrica real y no de un único protocolo de adquisición. La tarea es de segmentación binaria: imagen de magnitud a máscara de cerebro.

La innovación técnica relevante en este artefacto no está en la topología, sino en la exportación. El grafo se generó desde el checkpoint publicado `RS2_pretrained_model.pt` (release `main-tag` del repositorio `VitoLin21/Rodent-Skull-Stripping`) con el script `scripts/onnx-export/export_rs2net.py` del PR QSM.rs#126, usando Python 3.10, torch 2.3.0 en CPU, MONAI 1.3.0 y onnx 1.23. La exportación es reproducible bit a bit. Se aplicaron dos correcciones: se eliminó el prefijo `_orig_mod.` del state dict y se fijó la forma de una `layer_norm` trazada previamente como dinámica. Además, el padding de ventana del Swin queda embebido en el grafo, de modo que el tamaño de entrada es rígido y no admite otras dimensiones. La verificación frente a PyTorch reporta una discrepancia máxima de |Δ| 2,2e-3 en los logits, con el mismo signo en el 99,9998 % de los vóxeles; sobre una adquisición GRE de ratón in vivo, las máscaras producidas por QSM.rs y por el pipeline original resultan idénticas vóxel a vóxel.

## Capacidades

- Segmentación binaria de cerebro de roedor (ratón y rata) a partir de una imagen de magnitud de RM.
- Robusteza multicéntrica: el entrenamiento cubre 1.142 volúmenes de 89 centros, orientado a reducir la variabilidad entre protocolos.
- Inferencia pura: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingües (no existe componente de lenguaje).
- No soporta visión general: el dominio es exclusivamente RM cerebral de roedores preprocesada con el pipeline nnU-Net.
- Exportación determinista y verificable: reejecutar el script produce bytes idénticos y los logits coinciden con PyTorch dentro de tolerancias documentadas.
- Ejecutable fuera de PyTorch mediante ONNX Runtime, lo que habilita despliegues en CPU, GPU o navegador según el execution provider disponible.
- No dispone de modo "thinking", ni de entrada/salida de audio, ni de cualquier otra modalidad.

## Casos de uso

- Preprocesado en pipelines de QSM de roedores: el modelo genera la máscara cerebral necesaria para el cálculo de susceptibilidad magnética cuantitativa; es la función que ya cumple dentro de `qsm_core::bet::rs2_net` en QSM.rs y en QSMbly, por lo que sustituye a BET o a métodos de umbralización manuales en ese flujo.
- Estudios multicéntricos de neuroimagen preclinical: al haber sido entrenado con datos de 89 centros, es adecuado para cohortes agregadas donde cada centro emplea un protocolo distinto, evitando reentrenar o recalibrar la extracción de cerebro por adquisición.
- Procesado por lotes de cohortes grandes en CPU: con ~2,7 GB de pico de memoria y un grafo ONNX de 63,4 MB, se puede ejecutar en nodos de cálculo sin GPU para procesar cientos de volúmenes, usando ONNX Runtime con el execution provider de CPU.
- Integración en pipelines de CI/CD y validación de datos: al ser un artefacto ONNX determinista con SHA-256 fijado, permite tests de regresión que verifiquen que una actualización del pipeline no altera las máscaras producidas.
- Armonización de máscaras entre herramientas: el proyecto declara su réplica en `qsmxt/qsm-onnx-weights`, de modo que distintos programas del ecosistema QSM pueden consumir exactamente el mismo grafo y producir resultados idénticos.
- Despliegue en entornos con memoria restringida o sandbox web: el parche reducido de 128×96×128 evita el pico de ~4,5 GB del parche nativo, lo que hace viable la ejecución bajo runtimes con espacio de direcciones de 32 bits, algo imposible con la configuración original.
- Segmentación de imágenes GRE in vivo de ratón: el propio autor documenta la validación sobre una adquisición GRE in vivo, donde las máscaras coinciden vóxel a vóxel con el pipeline de referencia, lo que respalda su uso en flujos de QSM in vivo.
- Replicación de resultados publicados: investigadores que necesiten reproducir el método RS2-Net sin instalar el stack PyTorch/MONAI completo pueden usar este grafo como sustituto funcional equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente incluye métricas de verificación de la exportación, no de calidad de segmentación (Dice, Jaccard, HD95, etc.).

| Metrica de verificacion | Valor |
|---|---|
| Discrepancia maxima de logits frente a PyTorch | 2,2e-3 (max \|Δ\|) |
| Coincidencia de signo en los voxeles | 99,9998 % |
| Comparacion de mascaras en GRE de raton in vivo | identicas voxel a voxel frente al pipeline de RS2-Net |
| Reproducibilidad de la exportacion | bytes identicos al reejecutar el script |

## Requisitos de hardware

- VRAM: no disponible de forma explícita. El pico de memoria declarado para el parche de 128×96×128 es de ~2,7 GB (frente a ~4,5 GB del parche nativo de 128×128×160). Los pesos en float32 ocupan unos 63 MB, por lo que el grueso del consumo corresponde a activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria efectiva para el parche fijo; el modelo es lo bastante pequeño como para no requerir aceleradores de clase A100/H100, aunque estos reducen la latencia. No se publican cifras de latencia ni throughput.
- Cabe en GPU de consumo: sí, cabe en tarjetas tipo RTX 3060 (12 GB), RTX 4060 y superiores. No se especifica el mínimo exacto.
- CPU: viable. La exportación se generó y validó en torch 2.3.0 sobre CPU, lo que confirma que la ruta de inferencia en CPU con ONNX Runtime es funcional.
- Restricción de memoria relevante: el pico de ~2,7 GB es inferior a los 4 GB de espacio de direcciones de WebAssembly de 32 bits, a diferencia del parche nativo; esto es lo que motiva el uso de esta exportación en entornos wasm.
- Opciones de despliegue: ONNX Runtime con execution providers CPU, CUDA, TensorRT, DirectML o Web; integración nativa mediante `qsm_core::bet::rs2_net` en QSM.rs y QSMbly.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar contra el artefacto del que deriva esta exportación. No hay datos de otros modelos de skull stripping de roedor en el material de referencia.

| Modelo | Formato | Entrada | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RS2-Net (ONNX, este repositorio) | ONNX opset 17, float32 | 128 × 96 × 128 fijo | ~2,7 GB | GPL-3.0 | HuggingFace `sbollmann/rs2-net-onnx` |
| RS2-Net (checkpoint original) | PyTorch `RS2_pretrained_model.pt` | 128 × 128 × 160 | ~4,5 GB | GPL-3.0 | GitHub `VitoLin21/Rodent-Skull-Stripping` |
| Otros modelos de skull stripping de roedor | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia funcional entre las dos primeras filas es exclusivamente de empaquetado y de tamaño de parche: la red es la misma, con los logits equivalentes dentro de la tolerancia documentada. La elección entre ambas depende del runtime disponible y del margen de memoria, no de la calidad de segmentación.

## Limitaciones y advertencias

- Entrada rígida: el padding de ventana del Swin está embebido en el grafo, por lo que el modelo solo acepta parches de 128 × 96 × 128 vóxeles. No admite volúmenes completos ni otras resoluciones sin recortes y remuestreo previos.
- Preprocesado obligatorio: ejecutar el grafo sobre volúmenes crudos produce resultados inválidos. Es imprescindible aplicar traspuesta, recorte a no cero, z-score y remuestreo a 0,25 × 0,2 × 0,16 mm, tal como hace el pipeline nnU-Net de RS2-Net o `qsm_core::bet::rs2_net`.
- Dominio muy acotado: solo cubre RM cerebral de ratón y rata. No es aplicable a humanos, a otras especies ni a otras modalidades de imagen.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Integrar el grafo o sus derivados en productos propietarios obliga a liberar el código derivado bajo los mismos términos. Es un caveat relevante para uso comercial en software cerrado.
- Riesgo de alucinación en el sentido literal de segmentación: no hay datos publicados de Dice, HD95 ni análisis de fallos por centro, intensidad o patología. No se puede cuantificar la tasa de error esperada en cohortes fuera de la distribución de entrenamiento.
- Sesgos potenciales por composición del dataset: 1.142 volúmenes de 89 centros implican un desbalance desconocido entre ratón y rata, entre campos magnéticos y entre secuencias, ya que no se publica la distribución en esta ficha.
- Tamaño de parche reducido frente al original: el uso de 128 × 96 × 128 en lugar de 128 × 128 × 160 es una decisión de empaquetado que reduce el consumo de memoria, pero no se documenta su impacto en la precisión de segmentación.
- Precisión numérica limitada a float32: no se ofrecen variantes cuantizadas a int8 o fp16, lo que descarta optimizaciones de despliegue más agresivas sin trabajo adicional.
- Metadatos sin adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas declaradas (creación 2026-09-23) no permiten extraer conclusiones sobre mantenimiento o soporte.
- Sin idiomas, sin texto y sin agentes: cualquier expectativa de uso conversacional, tool calling o razonamiento multi-paso es inaplicable a este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sbollmann/rs2-net-onnx
- Repositorio original de RS2-Net y checkpoint: https://github.com/VitoLin21/Rodent-Skull-Stripping
- QSM.rs: https://github.com/astewartau/QSM.rs
- QSMbly: https://github.com/astewartau/qsmbly
- Pull request de exportación e integración (QSM.rs#126): https://github.com/astewartau/QSM.rs/pull/126
- Repositorio de réplica de pesos ONNX (referenciado en la model card): https://github.com/qsmxt/qsm-onnx-weights
- Artículo: Lin, Y., Ding, Y., Chang, S., Ge, X., Sui, X., Jiang, Y. (2024). "RS2-Net: An end-to-end deep learning framework for rodent skull stripping in multi-center brain MRI." *NeuroImage*, 298:120769. https://doi.org/10.1016/j.neuroimage.2024.120769
