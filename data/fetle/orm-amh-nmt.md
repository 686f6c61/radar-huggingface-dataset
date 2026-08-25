# fetle/orm-amh-nmt

## Resumen

El modelo `fetle/orm-amh-nmt` es un adaptador de tipo PEFT (Parameter-Efficient Fine-Tuning) construido sobre el modelo base `facebook/nllb-200-distilled-600M`, un modelo de traducción neuronal multilingüe de Meta. El repositorio no incluye una model card completa: la mayoría de los campos están marcados como "More Information Needed", y no se especifican autor, licencia, idiomas ni datos de entrenamiento. El nombre sugiere una posible especialización en traducción para el idioma amhárico (`amh`), pero no hay documentación que lo confirme. El adaptador se publicó el 25 de agosto de 2026 y no registra descargas ni valoraciones.

Dado que la información pública es mínima, esta ficha se limita a describir los datos disponibles y a señalar explícitamente las carencias. Cualquier uso en producción requeriría contactar con el autor para obtener detalles sobre el entrenamiento y la licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer encoder-decoder (NLLB-200-distilled-600M) |
| Parametros totales | No disponible (solo el adaptador; el modelo base tiene 600M) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, NLLB-200 usa 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta 200 idiomas; el adaptador podría estar limitado a un subconjunto) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (según tags) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer encoder-decoder de NLLB-200-distilled-600M, un modelo de traducción neuronal multilingüe entrenado por Meta para cubrir 200 idiomas. El modelo base usa una arquitectura estándar con atención de producto punto escalado y una longitud de contexto de 512 tokens. El adaptador fue creado con la librería PEFT (versión 0.12.0), lo que indica que se aplicó un ajuste fino de baja complejidad (posiblemente LoRA o adaptadores de atención) sobre los pesos congelados del modelo base.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, el método de optimización (RLHF, DPO, etc.) ni las hiperparametros concretas. La única referencia externa es el tag `arxiv:1910.09700`, que corresponde al artículo sobre estimación de emisiones de carbono en aprendizaje automático, pero no aporta detalles sobre el entrenamiento del modelo.

## Capacidades

- Traducción automática neuronal: al estar basado en NLLB-200, el modelo base es capaz de traducir entre 200 idiomas. El adaptador podría ajustar o especializar esa capacidad para un par de idiomas concreto, probablemente amhárico (`amh`) y algún otro, según el nombre.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, generación de código o visión. Al ser un modelo de traducción de tamaño pequeño, es improbable que las tenga.
- No se indica soporte para decodificación especulativa ni otras optimizaciones de inferencia.

## Casos de uso

Dada la falta de información, los casos de uso se infieren del modelo base y del nombre del adaptador, pero no se pueden confirmar. Se enumeran escenarios plausibles, con la advertencia de que no hay validación pública.

- Traducción de documentos en amhárico: si el adaptador se entrena para amhárico, podría usarse para traducir textos del amhárico al inglés u otros idiomas, aprovechando la cobertura multilingüe del modelo base.
- Servicios de traducción para comunidades de habla amhárica: integración en aplicaciones de atención al cliente o plataformas de contenido para cubrir este idioma de baja representación.
- Preprocesamiento de datos multilingües: para proyectos de NLP que necesiten normalizar o traducir textos en amhárico antes de alimentar otros modelos.
- Investigación en traducción de bajo recurso: como punto de partida para experimentos de adaptación eficiente (PEFT) sobre idiomas con pocos recursos, dado que el modelo base ya ofrece una base sólida.
- Evaluación comparativa de adaptadores PEFT: para estudiar cómo afecta el ajuste fino de baja complejidad a la calidad de traducción en idiomas específicos.
- Prototipos de traducción en entornos con recursos limitados: al ser un adaptador pequeño, puede cargarse en hardware modesto, aunque no se conocen los requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas como BLEU, chrF o METEOR para el adaptador, ni comparación con otros modelos. El modelo base `nllb-200-distilled-600M` tiene resultados conocidos en el paper de Meta, pero no se pueden atribuir al adaptador sin datos propios.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo base de 600M en FP16 ocupa aproximadamente 1.2 GB, y el adaptador PEFT añade una fracción pequeña, pero no se especifica.
- GPU recomendadas: para el modelo base se puede ejecutar en GPUs consumer como una RTX 3060 (12 GB) o superior. El adaptador no cambia sustancialmente los requisitos.
- En consumer GPU: probablemente sí, dado el tamaño reducido del modelo base, pero no hay confirmación.
- Opciones de despliegue: se puede cargar con la librería `transformers` y `peft` para Python. Para producción, se podría usar vLLM o TGI si se exporta a un formato compatible, pero no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables del mismo autor o para el mismo idioma. Como referencia, se puede comparar con el modelo base NLLB-200-distilled-600M y con otros modelos de traducción pequeños, pero no hay datos de rendimiento del adaptador.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `facebook/nllb-200-distilled-600M` | 600M | 512 | 200 | CC-BY-NC-4.0 | HuggingFace |
| `fetle/orm-amh-nmt` (adaptador) | No disponible | No disponible | No disponible | No disponible | HuggingFace |

La comparativa es incompleta porque el adaptador no tiene datos publicados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo base NLLB-200 tiene sesgos documentados en cuanto a géneros y culturas, y puede producir traducciones inexactas en idiomas con pocos datos. El adaptador hereda estos riesgos.
- Limitaciones de contexto: la ventana de 512 tokens del modelo base es corta para textos largos; no se sabe si el adaptador la modifica.
- Licencia: no se especifica, por lo que no se puede garantizar el uso comercial. El modelo base tiene licencia CC-BY-NC-4.0 (no comercial), lo que podría restringir el uso del adaptador.
- Documentación insuficiente: no hay información sobre datos de entrenamiento, evaluación, sesgos específicos ni procedencia del adaptador. No es recomendable para uso en producción sin validación previa.
- Riesgo de mal uso: al ser un modelo de traducción, puede producir traducciones incorrectas en dominios críticos (médico, legal) si no se evalúa adecuadamente.

## Enlaces

- HuggingFace: https://huggingface.co/fetle/orm-amh-nmt
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de NLLB-200: https://arxiv.org/abs/2207.04672 (referencia del modelo base, no del adaptador)
- Paper de estimación de emisiones (tag arxiv:1910.09700): https://arxiv.org/abs/1910.09700

No se han encontrado otros enlaces (repositorios, demos o papers) específicos para este adaptador.
