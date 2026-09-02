# adisyonist/14-allergens-0.3b

## Resumen

14-Allergens 0.3B es un modelo de clasificación de texto multietiqueta desarrollado por Adisyonist AI, una empresa especializada en soluciones de inteligencia artificial para software de restaurantes y puntos de venta. El modelo está diseñado para identificar la presencia de 14 alérgenos alimentarios en descripciones cortas de menús, facilitando tareas como la extracción de información alergénica, la normalización de menús multilingües y el prototipado de aplicaciones de seguridad alimentaria.

El modelo se basa en la arquitectura DeBERTa-v2, según los metadatos del repositorio, y cuenta con aproximadamente 279 millones de parámetros (278.820.110 exactamente). Aunque el autor no especifica la longitud de contexto, los modelos DeBERTa-v2 suelen operar con ventanas de 512 tokens. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-embeddings-inference, lo que facilita su despliegue en entornos de producción.

La relevancia de este modelo radica en su enfoque especializado: en lugar de un modelo de lenguaje general, ofrece una solución compacta y multilingüe (45 idiomas) para un problema concreto del sector hostelero, donde la precisión en la detección de alérgenos es crítica para la seguridad de los consumidores. Sin embargo, el autor advierte explícitamente que las predicciones no deben usarse como única base para decisiones médicas o de seguridad alimentaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (según metadatos del repositorio, no confirmado por el autor) |
| Parametros totales | 278.820.110 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, bn, ca, hr, cs, da, nl, fi, fr, de, el, gu, he, hi, hu, id, it, ja, kn, ko, ms, ml, mr, nb, or, pl, pt, pa, ro, ru, sk, sl, es, sv, ta, te, th, uk, ur, vi, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer encoder basada en DeBERTa-v2, según los tags del repositorio. DeBERTa (Decoding-enhanced BERT with Disentangled Attention) introduce mecanismos de atención desenredada que separan el contenido y la posición de los tokens, lo que mejora la representación semántica en tareas de comprensión de lenguaje. No se especifican los hiperparámetros exactos, el número de capas ni la configuración de atención.

El entrenamiento se realizó sobre un conjunto de datos propio, disponible en el repositorio `adisyonist/14-allergens`, que contiene 131.825 registros en formato JSONL. Cada registro empareja texto de menú o descripción de comida con etiquetas de un vocabulario de 14 alérgenos: apio, crustáceos, huevos, pescado, gluten, altramuz, leche, moluscos, mostaza, frutos secos, cacahuetes, sésamo, soja y sulfitos. El autor no detalla el proceso de entrenamiento (número de épocas, optimizador, técnica de ajuste como RLHF o DPO, ni recursos computacionales). Tampoco se mencionan innovaciones técnicas específicas más allá de la arquitectura base.

## Capacidades

- Clasificación de texto multietiqueta para detectar hasta 14 alérgenos en descripciones de menús y textos alimentarios.
- Soporte multilingüe para 45 idiomas, lo que permite procesar menús en contextos internacionales.
- Generación de candidatos de alérgenos para revisión humana, útil en flujos de trabajo asistidos.
- Compatible con pipelines de transformers y con text-embeddings-inference para despliegue eficiente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; el modelo está especializado exclusivamente en clasificación.

## Casos de uso

- **Extracción de alérgenos en menús de restaurantes**: el modelo puede procesar cada plato de un menú y devolver una lista de alérgenos potenciales, que el restaurante puede mostrar al cliente en la carta digital o en la web. Su tamaño compacto permite integrarlo en sistemas de punto de venta sin requerir hardware de alta gama.
- **Normalización de menús multilingües**: plataformas de entrega de comida a domicilio que operan en varios países pueden usar el modelo para etiquetar automáticamente los platos en 45 idiomas, garantizando coherencia en la información alergénica entre regiones.
- **Búsqueda de recetas por exclusión de alérgenos**: aplicaciones de recetas pueden filtrar platos según los alérgenos que el usuario desea evitar, utilizando el modelo para clasificar cada receta y permitir búsquedas inversas.
- **Prototipado de aplicaciones de seguridad alimentaria**: desarrolladores pueden emplear el modelo como base para crear prototipos de herramientas que alerten sobre posibles contaminaciones cruzadas o que validen la información de alérgenos en productos procesados.
- **Asistencia en traducción de menús**: al traducir un menú, el modelo puede verificar que los términos alergénicos se mantengan correctamente en el idioma de destino, reduciendo errores de traducción que podrían ocultar alérgenos.
- **Revisión humana asistida en cumplimiento normativo**: empresas de restauración pueden usar el modelo para preetiquetar platos y que un equipo de seguridad alimentaria revise y valide las predicciones, agilizando el proceso de cumplimiento de normativas como el Reglamento (UE) 1169/2011.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que no se reivindica ningún resultado de evaluación. Por tanto, no es posible comparar cuantitativamente el rendimiento del modelo con alternativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 279M parámetros, en precisión FP16 se requieren aproximadamente 560 MB de memoria para los pesos, más overhead de activaciones y buffers, lo que sitúa el consumo total en torno a 1-2 GB. En FP32, el consumo sería de unos 1,1 GB solo para pesos.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente, como una NVIDIA GTX 1650, RTX 3060 o superior. También puede ejecutarse en CPU con razonable latencia para clasificación de textos cortos.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU consumer moderna, incluso en tarjetas integradas si se usa cuantización (aunque no se ofrecen versiones cuantizadas oficiales).
- **Opciones de despliegue**: el modelo es compatible con la librería transformers de Hugging Face, con text-embeddings-inference (TEI) para servir embeddings y clasificación, y con soluciones como vLLM o TGI si se adapta, aunque no hay documentación específica. También puede usarse con ONNX Runtime si se exporta.
- **Latencia y throughput**: no se proporcionan datos oficiales. Para un modelo de este tamaño, se espera una latencia de milisegundos por texto corto en GPU, y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de alérgenos en menús. Existen modelos generales de clasificación de texto multilingües como XLM-RoBERTa o mDeBERTa, pero no están especializados en el dominio alimentario y no se han encontrado benchmarks que permitan una comparación directa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No es consejo médico**: las predicciones del modelo no deben utilizarse como única base para decisiones sobre alergias, seguridad alimentaria o salud. El autor lo advierte explícitamente.
- **Posibles errores y omisiones**: el modelo y los datos de entrenamiento pueden contener errores, artefactos de traducción y diferencias según la receta o el contexto de preparación.
- **Sin benchmarks publicados**: no hay métricas de rendimiento verificables, lo que impide evaluar su precisión real antes de su uso en producción.
- **Licencia no especificada**: la model card no indica la licencia aplicable, por lo que se debe revisar los archivos del repositorio y la tarjeta del dataset antes de cualquier redistribución o uso comercial.
- **Contexto limitado**: aunque no se confirma, la arquitectura DeBERTa-v2 suele tener una ventana de 512 tokens, suficiente para descripciones de menú pero no para documentos largos.
- **Riesgo de sesgos**: los datos de entrenamiento pueden reflejar sesgos culturales o regionales en la denominación de alimentos, lo que podría afectar a la detección en ciertos idiomas o cocinas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adisyonist/14-allergens-0.3b)
- [Dataset de entrenamiento](https://huggingface.co/datasets/adisyonist/14-allergens)
- [Perfil de Adisyonist AI en Hugging Face](https://huggingface.co/adisyonist)
- [Página de modelos de Adisyonist AI](https://huggingface.co/adisyonist/models)
