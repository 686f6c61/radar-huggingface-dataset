# djokobandjur/deit-rope-mixed-ape-base-seed-2

## Resumen

DeiT Base con RoPE mixto aprendido y embeddings posicionales absolutos (APE) es un checkpoint de investigación de un Vision Transformer para clasificación de imágenes, entrenado de forma independiente por Đoko Banđur y Miloš Banđur sobre ImageNet-1k. Se trata de la ejecución P2 de una familia de seis checkpoints que exploran el uso de frecuencias rotatorias aprendidas combinadas con embeddings absolutos en la arquitectura DeiT Base, siguiendo la configuración de entrenamiento de DeiT III y la implementación de RoPE para visión de NAVER (ECCV 2024).

El modelo tiene aproximadamente 86 millones de parámetros (configuración DeiT Base con parche de 16x16), procesa imágenes de 224x224 y se distribuye como un checkpoint PyTorch original (`final_checkpoint.pth`, 1,39 GB) que requiere la implementación RoPE-ViT emparejada para su carga, no siendo compatible directamente con `AutoModel.from_pretrained` de Hugging Face Transformers.

Su relevancia es fundamentalmente investigadora: proporciona un artefacto reproducible con SHA-256 verificado y precisión top-1 registrada del 83,726% en la validación de ImageNet-1k, útil para estudiar cómo las frecuencias rotatorias aprendidas afectan a las representaciones de transformers de visión. No es un modelo listo para producción ni un reemplazo directo de los pesos oficiales de NAVER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT Base, patch 16), RoPE mixto aprendido + APE |
| Parametros totales | no disponible (configuracion DeiT Base, ~86 M por convencion de la familia) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada 224x224, 196 tokens de parche) |
| Tipos de cuantizacion | no disponible (solo checkpoint PyTorch original en fp32) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | BSD 3-Clause (solo sobre `final_checkpoint.pth`) |
| Formato de pesos | PyTorch pickle (`.pth`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo DeiT Base con parches de 16x16 y resolución de entrada de 224x224. La innovación principal reside en la combinación de embeddings posicionales absolutos (APE) con un esquema de RoPE mixto cuyas frecuencias rotatorias son parámetros aprendidos, en lugar de fijas. Esta variante sigue la línea de investigación de Heo et al. (Rotary Position Embedding for Vision Transformer, ECCV 2024) y la configuración de entrenamiento de DeiT III (Touvron et al., 2022).

El entrenamiento se realizó sobre ImageNet-1k con la configuración de DeiT III, e incluye una fase de fine-tuning cuyo checkpoint final corresponde a la época 19 (selección `PRIMARY_FINAL`). La semilla aleatoria registrada es `1151747145`, aunque el índice de ejecución es P2 (identificador ordinal, no la semilla). No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset más allá de ImageNet-1k, ni si se emplearon técnicas de regularización específicas como mezcla o recorte agresivo. El checkpoint puede contener estado del optimizador además de los pesos del modelo.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de representaciones visuales mediante el encoder ViT (útil para tareas downstream con fine-tuning).
- Procesamiento de imágenes de 224x224 con tokenización en 196 parches de 16x16.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.
- Capacidad experimental: permite estudiar el efecto de frecuencias rotatorias aprendidas en las representaciones internas del transformer.

## Casos de uso

- Investigación sobre posiciones rotatorias en ViT: el checkpoint permite analizar cómo evolucionan las frecuencias aprendidas durante el entrenamiento y compararlas con las variantes fijas de RoPE, usando el vector de referencia de frecuencias cuyo SHA-256 está registrado.
- Reproducibilidad de experimentos: sirve como artefacto verificado (SHA-256 `3a3def57...`) para replicar resultados de la familia DeiT/Swin RoPE en estudios académicos.
- Clasificación de imágenes en entornos de investigación: con la implementación RoPE-ViT emparejada, puede clasificar imágenes de ImageNet-1k con precisión top-1 del 83,726%, útil como línea base en experimentos comparativos.
- Extracción de features para tareas downstream: el encoder puede congelarse y usarse para entrenar cabezas de clasificación en datasets médicos, industriales o de teledetección, aunque requiere validación previa.
- Estudio de sesgos y robustez en transformers de visión: al ser un checkpoint independiente con métricas limpias registradas, permite comparar comportamiento frente a perturbaciones y distribuciones no vistas.
- Docencia y formación: ejemplo práctico de cómo se serializa y versiona un checkpoint de investigación con checksums, citas y licencia, útil en cursos de reproducibilidad en machine learning.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-1k validación | Top-1 accuracy | 83,726% (41.863 aciertos sobre 50.000 imágenes) |

No se han publicado en la información disponible resultados de otros benchmarks (robustez, distribución desplazada, tareas downstream) ni comparaciones numéricas con los checkpoints oficiales de NAVER.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB de pesos más activaciones; en la práctica, 2-3 GB son suficientes para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, A10); para entrenamiento o fine-tuning, A100 o H100 con 40-80 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores, así como en GPUs integradas con suficiente memoria compartida para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un checkpoint PyTorch pickle no convertible directamente a safetensors sin la implementación emparejada, el despliegue requiere cargar el modelo con `torch.load` y la clase RoPE-ViT correspondiente; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (DeiT Base RoPE-Mixed + APE, P2) | ~86 M (no confirmado) | 224x224 | 83,726% | BSD 3-Clause | Hugging Face, checkpoint `.pth` |
| naver-ai/rope_mixed_ape_deit_base_patch16_LS | ~86 M (no confirmado) | 224x224 | no disponible | no disponible | Hugging Face, pesos oficiales |
| naver-ai/rope_mixed_ape_deit_small_patch16_LS | ~22 M (no confirmado) | 224x224 | no disponible | no disponible | Hugging Face, pesos oficiales |

No se dispone de datos numéricos de los checkpoints oficiales de NAVER en la información proporcionada, por lo que la comparación de rendimiento no puede completarse.

## Limitaciones y advertencias

- El checkpoint es un artefacto de investigación, no un modelo validado para producción; la precisión registrada corresponde únicamente a la validación limpia de ImageNet-1k.
- No es compatible con `AutoModel.from_pretrained`; requiere la implementación RoPE-ViT emparejada y una configuración específica que el autor aún no ha publicado como ejemplo end-to-end validado.
- El archivo es un pickle de PyTorch, lo que implica riesgo de ejecución de código arbitrario al deserializar; debe cargarse solo desde fuentes de confianza y con modos de carga seguros cuando sea posible.
- Puede contener estado del optimizador, lo que incrementa el tamaño y requiere filtrar claves al cargar.
- La licencia BSD 3-Clause se aplica solo al archivo `final_checkpoint.pth`; no relicencia el código de NAVER/Meta, los datos de ImageNet ni otro material de terceros.
- No se documentan sesgos específicos, pero al entrenarse solo con ImageNet-1k hereda los sesgos de representación de ese dataset (clases desequilibradas, sesgos geográficos y culturales).
- No hay datos sobre robustez ante distribuciones desplazadas, adversariales o imágenes fuera de dominio.
- El modelo no procesa texto, audio ni otras modalidades; su uso está restringido a visión.
- La fecha de creación del repositorio (2026) y la ausencia de descargas o likes indican que es un recurso muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-2
- Revisión original de pesos: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-2/tree/1e9c7b1647b852f982a181c8c0955b9ede816ab9
- Paper RoPE para Vision Transformer (ECCV 2024): https://arxiv.org/abs/2403.13298
- Código fuente NAVER AI RoPE-ViT: https://github.com/naver-ai/rope-vit
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Checkpoint oficial NAVER DeiT Base RoPE-Mixed + APE: https://huggingface.co/naver-ai/rope_mixed_ape_deit_base_patch16_LS
- Checkpoint oficial NAVER DeiT Small RoPE-Mixed + APE: https://huggingface.co/naver-ai/rope_mixed_ape_deit_small_patch16_LS
- Archivo de reproducibilidad (Zenodo): https://doi.org/10.5281/zenodo.24055154
