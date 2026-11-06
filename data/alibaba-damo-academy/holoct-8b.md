# Alibaba-DAMO-Academy/HoloCT-8B

## Resumen

HoloCT-8B es un modelo fundacional 3D especializado en tomografía computarizada (CT), desarrollado por Alibaba-DAMO-Academy. Su objetivo es unificar en un único modelo la interpretación de volúmenes CT (detección de lesiones, respuesta a preguntas visuales y generación de informes radiológicos) con la segmentación anatómica y de hallazgos, de forma que las respuestas textuales puedan anclarse a máscaras 3D a nivel de vóxel.

El modelo combina tres piezas: un codificador global derivado de Med3DVLM, un codificador detallado derivado de VISTA3D (MONAI) y un backbone lingüístico Qwen3-VL-8B, junto con un decodificador de máscaras 3D. La entrada es un volumen CT en formato NIfTI (unidades Hounsfield) más un prompt en inglés; la salida es texto y, cuando se solicita, máscaras binarias 3D correspondientes a los hallazgos mencionados.

Es relevante porque aborda una limitación clásica de los modelos visión-lenguaje médicos 2D: la pérdida de información espacial tridimensional. Al operar directamente sobre el volumen completo y permitir "grounding" textual a máscaras, se acerca al flujo de trabajo real de radiología, donde el hallazgo descrito debe localizarse en la imagen. Se publica bajo licencia MIT con 9.042.520.512 parámetros en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal 3D: codificador global (Med3DVLM), codificador detallado (VISTA3D), backbone Qwen3-VL-8B y decodificador de máscaras 3D |
| Parámetros totales | 9.042.520.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card solo indica inferencia en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HoloCT-8B es un modelo multimodal que procesa volúmenes CT 3D en lugar de imágenes 2D. La arquitectura se organiza en dos escalas de codificación visual: un codificador global inspirado en Med3DVLM, que captura el contexto de todo el volumen, y un codificador detallado derivado de VISTA3D, que preserva información espacial fina. Ambos se conectan a un backbone lingüístico Qwen3-VL-8B, y un decodificador de máscaras 3D traduce las representaciones internas en máscaras binarias de vóxeles. Este diseño permite emitir tokens `<SEG>` en el texto generado y asociar cada uno a una máscara concreta.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Sí se mencionan tareas de evaluación y demos que cubren RadGenome (generación de informes), ReXGrounding (informes con grounding), segmentación de objetivos y segmentación referida a nivel de hallazgo, lo que sugiere entrenamiento supervisado en esos dominios. La inferencia se realiza en bfloat16 mediante la implementación propia del proyecto (PyTorch SDPA), con decodificación greedy para screening, VQA y segmentación, y muestreo (temperatura 0,15, top-p 0,85, penalización de repetición 1,15) para generación de informes.

## Capacidades

- Interpretación unificada de CT: detección de lesiones, respuesta a preguntas visuales (VQA) y generación de informes radiológicos a partir de prompts en inglés.
- Generación de texto con grounding: las respuestas pueden incluir tokens `<SEG>` que se materializan como máscaras binarias 3D (`mask_000.nii.gz`, `mask_001.nii.gz`, etc.).
- Segmentación guiada por lenguaje: segmenta objetivos anatómicos o hallazgos descritos en texto libre (por ejemplo, "Segment the liver in this CT scan").
- Segmentación referida a nivel de hallazgo: localiza hallazgos concretos mencionados en el prompt.
- Inferencia emparejada: permite comparar la misma consulta con y sin grounding sobre el mismo volumen CT.
- Procesamiento de volúmenes 3D completos en formato NIfTI en unidades Hounsfield.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Triaje de lesiones hepáticas: dado un CT abdominal, el modelo responde a preguntas como "Is there a liver lesion?" y, con grounding, devuelve la máscara de la lesión, lo que permite priorizar revisiones en un servicio de radiología.
- Generación asistida de informes radiológicos: con los demos de RadGenome y ReXGrounding, el modelo produce texto descriptivo de los hallazgos y lo vincula a máscaras, reduciendo el tiempo de dictado y facilitando la verificación visual.
- Segmentación anatómica automatizada: mediante prompts como "Segment the liver in this CT scan", se obtienen máscaras de órganos para planificación quirúrgica, volumetría o pipelines de radiómica.
- Control de calidad y segunda lectura: la inferencia emparejada (grounded vs. ungrounded) permite comparar respuestas y detectar hallazgos que el modelo localiza de forma consistente, útil como señal de confianza.
- Investigación en imagen médica 3D: sirve como modelo base para experimentos de VQA médica, grounding y segmentación referida sobre volúmenes CT, con licencia MIT que facilita su uso académico y comercial.
- Integración en pipelines de anotación: las máscaras generadas pueden precargar herramientas de anotación, acelerando la creación de datasets etiquetados para entrenar o validar otros modelos.
- Docencia y simulación: permite generar descripciones y localizaciones de hallazgos sobre casos de ejemplo para formación de residentes, siempre con supervisión experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9.042 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 18 GB, por lo que se requiere una GPU con al menos 24 GB de VRAM para cargar el modelo, y más para procesar volúmenes CT completos y el decodificador de máscaras.
- GPU recomendadas: NVIDIA con soporte de bfloat16; la model card no especifica modelos concretos. Por memoria, se necesitan GPU de clase A100, H100, L40S o RTX 4090/A6000 con 24 GB o más.
- ¿Cabe en GPU de consumo? Previsiblemente en RTX 4090 (24 GB) para volúmenes pequeños, aunque no está confirmado en la documentación; no se garantiza en GPUs de 16 GB o menos.
- Opciones de despliegue: la implementación oficial es el repositorio HoloCT (PyTorch 2.6.0, torchvision 0.21.0, CUDA 12.4, Python 3.10.16, entorno conda). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Grounding a máscaras 3D | Licencia |
|---|---|---|---|---|---|
| HoloCT-8B | 9.042 M | no disponible | CT 3D (NIfTI) | Sí | MIT |
| HoloCT-4B | no disponible en la información | no disponible | CT 3D (NIfTI) | Sí (misma familia) | MIT |
| Qwen3-VL-8B | ~8B (backbone) | no disponible | Imagen/vídeo 2D | No | según Qwen |
| Med3DVLM | no disponible | no disponible | Volumen médico 3D | Parcial (componente) | no disponible |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo de investigación médica: no se documenta validación clínica regulatoria; no debe usarse como dispositivo médico ni para diagnóstico autónomo sin supervisión profesional.
- Riesgo de alucinación: como modelo generativo, puede describir hallazgos inexistentes o localizaciones incorrectas; el grounding a máscaras mitiga pero no elimina este riesgo.
- Solo inglés: los prompts y las respuestas están en inglés; no se documenta soporte multilingüe.
- Entrada restringida a CT en NIfTI y unidades Hounsfield; no se documenta soporte para otras modalidades (RM, rayos X) ni para imágenes 2D.
- Longitud de contexto y cuantizaciones no documentadas, lo que limita la planificación de despliegues con requisitos estrictos de memoria.
- Sesgos desconocidos: la model card no detalla la composición demográfica ni la procedencia de los datos de entrenamiento, por lo que no puede evaluarse el sesgo poblacional.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar las atribuciones de componentes de terceros (Qwen3-VL, Med3DVLM, VISTA3D) indicadas en los avisos del proyecto.
- Dependencia de la implementación oficial: no hay integración con frameworks de serving estándar, lo que puede complicar el escalado en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Alibaba-DAMO-Academy/HoloCT-8B
- Repositorio GitHub: https://github.com/2021xyl/HoloCT
- Demos del proyecto: https://github.com/2021xyl/HoloCT#demos
- Evaluación: https://github.com/2021xyl/HoloCT/blob/main/eval/README.md
- Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Med3DVLM: https://github.com/mirthAI/Med3DVLM
- MONAI VISTA: https://github.com/Project-MONAI/VISTA
