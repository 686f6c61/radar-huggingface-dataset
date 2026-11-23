# Furkei/quakemind-uydu-modelleri

## Resumen

QuakeMind es un conjunto de tres modelos de segmentación semántica de imágenes de satélite y dron diseñados para delimitar áreas dañadas tras un terremoto. Los desarrolla el autor Furkei en el marco del proyecto QuakeMind, un sistema de apoyo a la decisión en catástrofes financiado por el programa TÜBİTAK 2209-A (Turquía). El repositorio aloja únicamente los denominados "modelos de comparación" (Hızlı, Dengeli y U-Net); el modelo de producción del sistema vive en un repositorio distinto (`Utbird/dispath_optimized_mitb4_focal_dice30`).

Técnicamente son segmentadores de una sola clase (daño) construidos con `segmentation-models-pytorch` sobre codificadores MiT (SegFormer B0 y B2) y un U-Net con codificador MiT-B4. Trabajan sobre recortes de 512×512 píxeles con normalización ImageNet y tres canales. Los tres se entrenaron con la partición P2 y semilla 42 sobre los conjuntos KATE-CD y KATE-PD, con resoluciones de 0,3 a 0,5 m/píxel.

Su relevancia es acotada y muy específica: no es un modelo de propósito general ni un modelo de lenguaje, sino un componente de un sistema cerrado de evaluación de daños. El propio autor advierte que la generalización fuera del dominio de entrenamiento es muy pobre (IoU de 0,01 a 0,02 en el conjunto externo MED-BFS), por lo que debe tratarse como una referencia reproducible más que como un modelo listo para producción fuera de QuakeMind.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SegFormer (MiT-B0 y MiT-B2) y U-Net con codificador MiT-B4 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 512×512 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | `quakemind-all-rights-reserved` (todos los derechos reservados) |
| Formato de pesos | `.pth` (PyTorch, vía `segmentation-models-pytorch`) |

## Arquitectura y entrenamiento

El repositorio contiene tres variantes con la misma tarea y distinto compromiso coste/precisión. Dos son SegFormer con codificadores MiT-B0 (variante "Hızlı", la más ligera) y MiT-B2 (variante "Dengeli"), y la tercera es un U-Net con codificador MiT-B4. Todas reciben recortes de 512×512 píxeles, tres canales RGB y normalización ImageNet, y producen una máscara binaria de una sola clase (área dañada). La carga se realiza reconstruyendo la arquitectura con `segmentation_models_pytorch` con `encoder_weights=None` y aplicando los pesos con `strict=True`.

El entrenamiento usó la partición P2 con semilla 42 sobre los conjuntos KATE-CD y KATE-PD, con resoluciones de 0,3 a 0,5 m/píxel. No se documentan en la información disponible el número de imágenes, el volumen de tokens equivalentes, la composición exacta del dataset ni si hubo ajuste fino con RLHF/DPO (no aplicable en segmentación). Tampoco se detalla la función de pérdida ni el número de épocas. El sistema QuakeMind verifica el SHA-256 de cada peso contra el valor registrado en su catálogo antes de cargarlo.

## Capacidades

- Segmentación binaria de áreas dañadas en imágenes de satélite y dron.
- Tres perfiles de inferencia seleccionables en consola y en simulacros: Hızlı (MiT-B0), Dengeli (MiT-B2) y U-Net (MiT-B4).
- Procesamiento de recortes de 512×512 píxeles con normalización ImageNet.
- Integración con `segmentation-models-pytorch` para reconstruir la arquitectura y cargar pesos con verificación de integridad SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en una única tarea de segmentación de daño.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Evaluación rápida de daños tras un seísmo: el modelo genera una máscara de áreas dañadas sobre recortes de satélite de 0,3 a 0,5 m/píxel, que el sistema QuakeMind usa como capa de apoyo a la decisión para priorizar inspecciones.
- Comparación de arquitecturas en un pipeline de investigación: al incluir tres variantes con el mismo protocolo (P2, semilla 42), permite medir el compromiso entre coste computacional y calidad (IoU de 0,382 a 0,433) en un mismo conjunto de validación.
- Prototipado de sistemas de respuesta a catástrofes: sirve como referencia reproducible para equipos que quieran replicar la línea base de QuakeMind antes de entrenar su propio segmentador.
- Docencia y experimentación con `segmentation-models-pytorch`: la carga con `encoder_weights=None` y `strict=True` facilita reproducir la arquitectura y verificar la integridad de los pesos.
- Validación de pipelines de verificación de integridad: el chequeo SHA-256 previo a la carga es un ejemplo práctico de cómo asegurar artefactos en un sistema de decisión crítico.
- Análisis de generalización entre dominios: el contraste entre el IoU interno (0,382–0,433) y el externo en MED-BFS (0,01–0,02) es un caso de estudio útil sobre el riesgo de desplegar segmentadores fuera de su distribución de entrenamiento.

## Benchmarks y rendimiento

| Modelo | Arquitectura | Codificador | IoU (test) | F1 (test) | IoU externo (QQB) | SHA-256 (12 primeros) |
|---|---|---|---|---|---|---|
| `segformer_mitb0_p2_t42.pth` | SegFormer | MiT-B0 | 0,382 | 0,553 | 0,268 | `a29a2e85c068` |
| `segformer_mitb2_p2_t42.pth` | SegFormer | MiT-B2 | 0,409 | 0,581 | 0,283 | `05fabc05b960` |
| `unet_mitb4_p2_t42.pth` | U-Net | MiT-B4 | 0,433 | 0,604 | 0,295 | `2ddcc7d24981` |

Los catálogos del proyecto registran además un IoU de 0,01 a 0,02 en el conjunto externo MED-BFS, lo que indica una generalización prácticamente nula a ese tipo de imágenes. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Por el tamaño del repositorio (0,4 GB para los tres pesos) y las arquitecturas MiT-B0/B2/B4, la inferencia en FP32 es viable en GPUs de consumo, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible. Cualquier GPU con suficiente memoria para un modelo de segmentación de este tamaño debería servir; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado oficialmente, pero el tamaño de los pesos sugiere que sí en GPUs consumer modernas; falta validación del autor.
- Opciones de despliegue: `segmentation-models-pytorch` con PyTorch (carga nativa de `.pth`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | IoU (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuakeMind SegFormer MiT-B0 | SegFormer | 512×512 | 0,382 | Todos los derechos reservados | Hugging Face (repo público) |
| QuakeMind SegFormer MiT-B2 | SegFormer | 512×512 | 0,409 | Todos los derechos reservados | Hugging Face (repo público) |
| QuakeMind U-Net MiT-B4 | U-Net | 512×512 | 0,433 | Todos los derechos reservados | Hugging Face (repo público) |

No se dispone de datos de benchmarks de modelos externos comparables (por ejemplo, otros segmentadores de daño sísmico) en la información proporcionada, por lo que la comparativa se limita a las tres variantes del propio repositorio. No disponible para comparación con alternativas de terceros.

## Limitaciones y advertencias

- Generalización muy limitada: el IoU cae a 0,01–0,02 en el conjunto externo MED-BFS, según los propios catálogos del proyecto; no debe usarse fuera del dominio de entrenamiento (KATE-CD/KATE-PD, 0,3–0,5 m/píxel).
- Licencia "todos los derechos reservados" (`quakemind-all-rights-reserved`): el repositorio es público únicamente para que el servidor de QuakeMind pueda descargar los pesos; la apertura no concede permiso de reutilización. Uso comercial no permitido sin autorización expresa del titular.
- Modelo de una sola clase (daño): no distingue tipos ni grados de daño, solo área dañada frente a no dañada.
- Sin datos publicados sobre sesgos, composición del dataset ni cobertura geográfica; el riesgo de sesgo por región, sensor o estación no está caracterizado.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos/negativos en la máscara, especialmente en imágenes fuera de distribución.
- No es un modelo de lenguaje: no soporta instrucciones, tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- Dependencia de la verificación SHA-256: si los pesos no coinciden con el catálogo, el sistema no los carga, lo que exige mantener sincronizados los metadatos.
- Sin métricas de latencia, throughput ni requisitos de hardware publicados; la planificación de producción debe hacerse con mediciones propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Furkei/quakemind-uydu-modelleri
- Modelo de producción del sistema QuakeMind (referenciado en la model card): `Utbird/dispath_optimized_mitb4_focal_dice30`
- Licencia del proyecto: archivo `LICENSE` dentro del repositorio
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
