# postrational/Qwen3.8-27B-cpt-sft3

## Resumen

Qwen3.8-27B-cpt-sft3 es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.8-27B, publicado por el usuario postrational en Hugging Face. Se trata de un modelo de la familia Qwen3.5 (etiqueta `qwen3_5` en los metadatos) con 27.781.427.952 parámetros totales, orientado a generación de texto y a tareas image-text-to-text según el pipeline declarado. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamaño de repositorio de 55,6 GB.

El modelo ha sido entrenado con Unsloth y la librería TRL de Hugging Face, según indica la propia model card, lo que sugiere un proceso de ajuste supervisado (SFT) sobre el modelo base, presumiblemente precedido de una fase de continued pre-training (CPT) a juzgar por el sufijo `cpt-sft3` del nombre. La model card es extremadamente escueta: no documenta el dataset de entrenamiento, la composición de los datos, hiperparámetros ni resultados de evaluación.

Su relevancia es limitada por el momento: cuenta con 0 descargas y 0 likes, y no se han publicado benchmarks ni detalles técnicos del ajuste. Resulta útil como punto de partida para quien quiera evaluar un fine-tuning comunitario sobre Qwen3.5 de ~27B, pero no debe considerarse un modelo validado para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`, lo que sugiere que el modelo base Qwen3.5 incorpora capacidades multimodales (entrada de imagen y texto). No se especifica si emplea atención lineal, decodificación especulativa, mezcla de expertos ni ninguna otra innovación concreta. El número de parámetros (27,78 mil millones) es el único dato estructural confirmado.

En cuanto al entrenamiento, la model card indica únicamente que el modelo fue entrenado con Unsloth y TRL, lo que apunta a un ajuste supervisado (SFT) sobre el modelo base unsloth/Qwen3.8-27B. El nombre `cpt-sft3` sugiere una fase previa de continued pre-training y una tercera iteración de SFT, pero no se aporta información sobre el volumen de tokens, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros empleados. No hay datos sobre la estrategia de alineación ni sobre posibles técnicas de optimización aplicadas durante el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline declarado.
- Procesamiento image-text-to-text: el pipeline indica soporte de entrada de imágenes junto con texto, aunque no se detalla el alcance de dicha capacidad.
- Integración con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Compatibilidad con transformers y con el ecosistema Unsloth/TRL para inferencia y ajuste posterior.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de fine-tunings comunitarios: sirve como caso de estudio para comparar el efecto de un ajuste SFT sobre Qwen3.5-27B frente al modelo base, midiendo degradación o mejora en tareas estándar con un harness propio.
- Generación de texto conversacional en inglés: adecuado para prototipos de chatbots en inglés que requieran un modelo de ~27B con licencia permisiva, siempre que se valide su calidad previamente.
- Experimentación con pipelines multimodales: al declarar image-text-to-text, permite probar flujos que combinen imagen y texto en entornos de investigación, con la cautela de que la capacidad real no está documentada.
- Base para ajustes posteriores: al estar en safetensors y licencia Apache 2.0, puede emplearse como punto de partida para nuevos fine-tunings con Unsloth o TRL en dominios específicos.
- Despliegue en TGI o endpoints compatibles: los tags indican compatibilidad con text-generation-inference, lo que facilita su integración en infraestructura de serving estándar una vez validado.
- Investigación sobre recetas de entrenamiento: el nombre `cpt-sft3` sugiere una receta de continued pre-training más SFT iterativo que puede reproducirse o contrastarse en estudios sobre ajuste de modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55,6 GB solo para los pesos (27,78 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se requieren 2 GPUs de 48 GB o una GPU de 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 28 GB de pesos, viable en una A100 40 GB o en una RTX 6000 Ada 48 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 14-16 GB de pesos, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16/BF16; A100 40 GB o L40S para 8 bits; RTX 4090/3090 para cuantizaciones de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan cuantizaciones, aunque no están documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| postrational/Qwen3.8-27B-cpt-sft3 | 27,78 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning comunitario sin benchmarks |
| unsloth/Qwen3.8-27B (base) | 27,78 B (presumiblemente) | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva este ajuste |
| Alternativas de ~27B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del modelo base declarado.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos durante el ajuste SFT.
- Riesgo de alucinación no evaluado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Soporte idiomático declarado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no especificada, lo que impide planificar su uso en tareas de contexto largo.
- Ausencia total de descargas y validación comunitaria: el modelo no ha sido probado por terceros según los metadatos.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar que el modelo base unsloth/Qwen3.8-27B mantenga la misma licencia y que no existan restricciones adicionales heredadas.
- El pipeline declarado como image-text-to-text no está respaldado por documentación sobre el alcance real de la capacidad multimodal.
- No se han publicado cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Qwen3.8-27B-cpt-sft3
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): no disponible enlace directo en la información proporcionada
