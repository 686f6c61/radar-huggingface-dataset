# rakesh-bishnoi29/structuraai-aya-expanse-8b-finetuned-extractor

## Resumen

structuraai-aya-expanse-8b-finetuned-extractor es un adaptador LoRA publicado por el usuario rakesh-bishnoi29 sobre el modelo base CohereLabs/aya-expanse-8b. Se trata de un ajuste fino supervisado (SFT) mediante la librería TRL y el framework PEFT, orientado a tareas de extracción de información según sugiere el sufijo "extractor" del identificador. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo, por lo que requiere cargar el modelo base Aya Expanse 8B para su uso.

Aya Expanse 8B es un modelo multilingüe de Cohere Labs disenado para cubrir 23 idiomas con un enfoque en paridad de rendimiento entre lenguas. El adaptador hereda esa base multilingüe y la especializa en extracción estructurada, aunque la model card del autor no documenta el conjunto de datos, los hiperparámetros ni la tarea exacta de entrenamiento.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de adaptación ligera de un modelo multilingüe de 8B para extracción de datos, con un repositorio recién creado (noviembre de 2026), cero descargas y sin documentación técnica publicada. Cualquier evaluación de producción debe partir de la validación empírica propia, dado que no hay benchmarks ni métricas reportadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only (base: Aya Expanse 8B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base; consultar la model card de CohereLabs/aya-expanse-8b) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar de transformers) |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base Aya Expanse 8B es multilingüe, 23 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre el modelo CohereLabs/aya-expanse-8b. La configuración LoRA (rango, alpha, módulos objetivo) no está documentada en la model card. El entrenamiento se realizó con las librerías transformers y TRL, y el adaptador se empaqueta con PEFT 0.21.2. El tamaño del repositorio (0,2 GB) es coherente con un adaptador de rango moderado sobre un modelo de 8B, no con un ajuste completo.

No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas adicionales. La model card es una plantilla sin rellenar, por lo que todos los campos de detalles de entrenamiento aparecen como "[More Information Needed]". El modelo base Aya Expanse 8B, desarrollado por Cohere Labs, es un transformer decoder-only multilingüe entrenado con datos en 23 idiomas; el adaptador hereda esa arquitectura y solo modifica un subconjunto de pesos.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Aya Expanse 8B.
- Extracción de información estructurada: el nombre del adaptador ("extractor") sugiere especialización en extracción de entidades o campos, aunque no hay documentación que lo confirme.
- Capacidades multilingües del modelo base (23 idiomas según Cohere Labs), potencialmente preservadas tras el ajuste fino.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base Aya Expanse no destaca por ello.
- Razonamiento multi-step y uso como agente: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción de campos en documentos multilingües: el adaptador podría emplearse para extraer entidades (nombres, fechas, importes) de textos en varios idiomas, aprovechando la base multilingüe de Aya Expanse 8B. Requiere validación empírica previa, dado que no hay métricas publicadas.
- Procesamiento de formularios y contratos: integrado en un pipeline de extracción estructurada (JSON) para digitalizar documentos, con el modelo base cargado en GPU y el adaptador aplicado en inferencia.
- Normalización de datos de entrada en ETL: uso del adaptador para convertir texto libre en registros estructurados antes de cargarlos en una base de datos.
- Enriquecimiento de registros CRM: extracción de atributos de correos o notas de clientes en varios idiomas, con revisión humana posterior.
- Prototipado rápido de tareas de extracción: al ser un adaptador de 0,2 GB, permite experimentar con bajo coste de almacenamiento y despliegue sobre el modelo base.
- Investigación sobre ajuste fino LoRA multilingüe: como caso de estudio de SFT con TRL sobre un modelo de 8B, útil para reproducir configuraciones de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 0,2 GB; requiere cargar el modelo base Aya Expanse 8B (unos 16 GB en fp16) para inferencia.
- VRAM estimada para el modelo base en fp16: en torno a 16-18 GB, más overhead de activaciones y caché KV según la longitud de contexto.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-10 GB; con 4 bits, en torno a 5-6 GB (estimaciones estándar para un modelo de 8B, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB, H100 para producción de alto throughput; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requiere cuantización del modelo base.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI con adaptadores; llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| structuraai-aya-expanse-8b-finetuned-extractor | 8B (base) + LoRA | No disponible | No disponible | Hugging Face (adaptador) |
| CohereLabs/aya-expanse-8b | 8B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) |
| Modelos de extracción especializados de 7-8B | 7-8B | Variable | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativos para este adaptador. La comparación con alternativas de la misma categoría (modelos de extracción de información de 7-8B) no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.
- Licencia no disponible: no se puede confirmar el uso comercial; además, la licencia del adaptador debe ser compatible con la del modelo base Aya Expanse 8B.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de alucinación inherente al modelo base; en tareas de extracción esto puede producir campos inventados.
- El ajuste fino puede degradar capacidades generales del modelo base (olvido catastrófico), especialmente en idiomas poco representados en el dataset de SFT.
- No hay garantía de que las capacidades multilingües del base se mantengan tras el ajuste.
- El repositorio solo contiene el adaptador: el despliegue requiere descargar el modelo base por separado y verificar compatibilidad de versiones de PEFT/transformers.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rakesh-bishnoi29/structuraai-aya-expanse-8b-finetuned-extractor
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
