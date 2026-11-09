# abhishek1402/dfu-resnet34-unet

## Resumen

DFU ResNet34 U-Net es un modelo de segmentación binaria de imágenes desarrollado por el usuario abhishek1402, diseñado para delimitar regiones de úlceras de pie diabético (DFU, *diabetic foot ulcer*) en fotografías clínicas. Se trata de una arquitectura U-Net con un encoder ResNet34 inicializado con pesos de ImageNet, entrenada a resolución 512 × 512 sobre el conjunto de datos FUSeg2021. El modelo se distribuye como artefacto de investigación, no como dispositivo médico, y no ha sido validado clínicamente.

El modelo resuelve la tarea de segmentación semántica binaria (úlcera frente a fondo) y su interés radica en su simplicidad y en la reproducibilidad del pipeline: el autor publica el hash SHA-256 de los pesos, el contrato de inferencia (sigmoide, umbral 0,40, eliminación de componentes menores de 128 píxeles, TTA con flip horizontal) y los resultados en test retenido. La relevancia actual es limitada pero concreta: sirve como línea base reproducible para investigación en segmentación de heridas y como ejemplo de artefacto con protocolo de evaluación congelado.

El repositorio ocupa 0,4 GB y contiene pesos en formato PyTorch (`.pth`) y una exportación ONNX. No se especifican parámetros totales, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 (inicializado con ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512 × 512 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante; exportación ONNX disponible) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`, dict con `model_state_dict`) y ONNX |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con encoder ResNet34 preentrenado en ImageNet y un decoder U-Net que produce una máscara binaria a resolución 512 × 512. Los pesos publicados corresponden a las medias exponenciales (EMA) de la época 71 del entrenamiento. El autor no detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo o preferencias; el único dato de entrenamiento es el uso de FUSeg2021 como conjunto de datos.

El pipeline de inferencia está congelado y documentado: activación sigmoide, umbral de decisión 0,40, eliminación de componentes conectadas menores de 128 píxeles y *test-time augmentation* con flip horizontal. El preprocesado se toma de la configuración de entrenamiento `configs/training/segmentation_resnet34_unet_512.json`. La post-procesado se fijó sobre validación interna antes de puntuar el test retenido, lo que constituye una práctica metodológica destacable para evitar fuga de información.

## Capacidades

- Segmentación binaria de regiones de úlcera de pie diabético en fotografías.
- Generación de máscaras de píxeles a resolución 512 × 512.
- Inferencia determinista con contrato documentado (umbral, filtrado de componentes, TTA).
- Exportación a ONNX para despliegue en entornos no PyTorch.
- Verificación de integridad de pesos mediante hash SHA-256.
- Cálculo de área y perímetro en píxeles (requiere calibración `pixels_per_mm` para unidades físicas).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- **Investigación en segmentación de heridas**: servir como línea base reproducible para comparar nuevas arquitecturas sobre FUSeg2021, gracias al hash de pesos y al contrato de inferencia congelado.
- **Anotación asistida de datasets clínicos**: pre-segmentar imágenes de úlceras para que anotadores humanos corrijan las máscaras, reduciendo el tiempo de etiquetado en conjuntos con protocolo similar a FUSeg.
- **Docencia y formación en visión médica**: ejemplo didáctico de U-Net con encoder preentrenado, métricas Dice y protocolo de evaluación con test retenido.
- **Prototipado de pipelines de telemedicina**: integrar la exportación ONNX en una aplicación de captura de fotos para estimar área relativa de la lesión, siempre con supervisión clínica y sin uso diagnóstico.
- **Evaluación de robustez y generalización**: emplear el modelo para estudiar la brecha de dominio entre FUSeg2021 y otros conjuntos (p. ej. LowerLimb V3), dado que el autor documenta una caída de Dice de 0,92 a 0,26.
- **Cuantificación de área en seguimiento de heridas**: medir la evolución del área de la úlcera en píxeles entre visitas, con calibración `pixels_per_mm` si se dispone de referencia de escala.
- **Auditoría de contratos de inferencia**: usar el modelo como caso de estudio de reproducibilidad (hash, umbral, post-procesado congelado) en proyectos de MLOps sanitario.

## Benchmarks y rendimiento

| Evaluación | n | Dice agrupado | Dice macro |
|---|---|---|---|
| FUSeg2021 test retenido | 191 | 0,922 | 0,841 |
| Re-ejecución end-to-end del servicio (P06) | 191 | 0,922 | 0,841 (diferencia máxima por imagen 0,0003) |
| LowerLimb V3 (externo) | 148 | 0,26 | no disponible |
| LowerLimb con máscaras estilo FUSeg | 16 | 0,82 | no disponible |
| LowerLimb con máscaras nativas | 132 | 0,20 | no disponible |

Desglose de errores en el test retenido: de 191 imágenes, 156 están bien segmentadas; 8 heridas no detectadas, 10 subsegmentadas, 6 sobresegmentadas, 6 con solapamiento bajo y 3 falsos positivos en imágenes vacías. En LowerLimb V3 la precisión es 0,90 y el recall 0,15. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,4 GB) y la arquitectura ResNet34 U-Net a 512 × 512, es compatible con GPUs de consumo con 4-8 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: PyTorch nativo y ONNX Runtime (exportación ONNX incluida). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFU ResNet34 U-Net | U-Net + ResNet34 | 512 × 512 | Dice 0,922 en FUSeg2021 test | no disponible | Hugging Face |
| Alternativas de segmentación médica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con FUSeg2021; el comportamiento con otras cámaras, tonos de piel, tipos de herida o protocolos de anotación no está establecido.
- La generalización no está demostrada: en LowerLimb V3 el Dice cae a 0,26 (recall 0,15), y el autor indica que la brecha se explica en parte por el protocolo de anotación, pero el estudio P09-S04 solo lo respalda parcialmente.
- No es un dispositivo médico, no está validado clínicamente y no debe usarse para diagnóstico ni decisiones de tratamiento.
- Riesgo de falsos positivos en imágenes sin herida (3 casos en el test) y de heridas no detectadas (8 casos).
- Área y perímetro se expresan en píxeles salvo que se aporte calibración `pixels_per_mm`.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Debe usarse con el motor de inferencia del proyecto, que verifica el hash y aplica el contrato (sigmoide, umbral 0,40, filtrado de componentes < 128 px, TTA flip horizontal); usarlo fuera de ese contrato invalida los resultados reportados.
- No se documentan sesgos demográficos ni de tono de piel, pero la ausencia de validación externa implica riesgo de sesgo no cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/abhishek1402/dfu-resnet34-unet
- Informe de validación del proyecto: `reports/final/phase_06_validation_report.md` (referenciado en la model card)
- Informe de estudio de generalización: `reports/experiments/p09_s04_report.md` (referenciado en la model card)
- Configuración de entrenamiento: `configs/training/segmentation_resnet34_unet_512.json` (referenciada en la model card)
