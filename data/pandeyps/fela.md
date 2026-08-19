# pandeyps/fela

## Resumen

Fela es un modelo de lenguaje causal para proteínas desarrollado por pandeyps, implementado en PyTorch y basado en el operador Hyena. Con solo 1.651.864 parámetros, se trata de un modelo extremadamente ligero diseñado para generar y representar secuencias de aminoácidos. Sustituye el mecanismo de atención de los transformers por convoluciones largas (long convolutions) combinadas con bloques MLP, lo que reduce drásticamente el coste computacional y permite procesar secuencias de forma eficiente.

El modelo se entrenó sobre el conjunto de datos Pfam-A, filtrado a secuencias de entre 20 y 512 residuos con el alfabeto estándar de aminoácidos, acumulando aproximadamente 9.500 millones de tokens. Su configuración incluye una longitud de contexto de 514 tokens, suficiente para cubrir la mayoría de dominios proteicos. Al ser un modelo base sin ajuste fino, está pensado como punto de partida para tareas de extracción de características, generación de secuencias y fine-tuning en problemas específicos de biología computacional.

La relevancia de Fela radica en su arquitectura alternativa a los transformers, basada en el trabajo de Hyena (Poli et al., 2024), que demuestra que es posible obtener representaciones de secuencias competitivas con un coste computacional muy inferior. Su pequeño tamaño lo hace accesible para entornos con recursos limitados, como estaciones de trabajo sin GPU dedicada o despliegues en producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hyena (long convolutions + MLP blocks, pre-norm, LM head) |
| Parametros totales | 1.651.864 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 514 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias de proteinas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fela emplea una arquitectura basada en el operador Hyena, que reemplaza la atención por convoluciones largas aprendidas combinadas con MLPs. La configuración concreta incluye `d_model=256`, `n_layer=2`, `d_inner=1024`, `order=2`, `filter_order=64` y `short_filter_order=3`. El modelo usa pre-normalización, una cabeza de LM sobre el vocabulario de 32 tokens (alfabeto de aminoácidos más tokens especiales) y residuales en FP32 para estabilidad numérica. El tokenizer es a nivel de carácter sobre el alfabeto `ACDEFGHIKLMNPQRSTVWYX`, con tokens especiales para padding, fin de secuencia y desconocido.

El entrenamiento se realizó sobre Pfam-A filtrado (secuencias de 20 a 512 residuos, solo alfabeto estándar), con un total de ~9.500 millones de tokens. Se usaron 40.000 pasos con batch size 256, precisión bf16, optimizador AdamW con weight decay 0.1 y una tasa de aprendizaje con decaimiento coseno desde 6e-4 hasta 6e-5. El modelo es base, sin ajuste fino posterior.

## Capacidades

- Generación de secuencias de proteínas causales (autoregresiva) con `model.generate`.
- Extracción de características (embeddings) de secuencias proteicas para tareas downstream.
- Representación de secuencias de hasta 514 aminoácidos en un espacio latente de 256 dimensiones.
- Soporte de tokenización a nivel de carácter para el alfabeto estándar de aminoácidos.
- No incluye tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo de lenguaje para proteínas.
- No aplica capacidades multilingües, al tratarse de un modelo biológico.

## Casos de uso

- Clasificación de familias de proteínas: los embeddings generados por Fela pueden alimentar clasificadores supervisados para predecir la familia Pfam o la función de una secuencia, aprovechando su entrenamiento en Pfam-A.
- Detección de homólogos y búsqueda de similitud: al generar representaciones densas de secuencias, se pueden comparar proteínas mediante similitud coseno o distancia euclidiana para identificar homólogos lejanos.
- Generación de secuencias novedosas: el modo generativo permite muestrear nuevas secuencias de proteínas con una distribución aprendida de Pfam, útil para diseño de proteínas de novo o exploración de espacio de secuencias.
- Anotación funcional automática: dado un dominio proteico, el modelo puede predecir la siguiente parte de la secuencia, ayudando a completar anotaciones parciales o a inferir regiones conservadas.
- Fine-tuning para predicción de propiedades: al ser un modelo base pequeño, se puede ajustar finamente con pocos datos para predecir termoestabilidad, solubilidad o interacciones proteína-ligando.
- Embeddings para bases de datos vectoriales: las representaciones de Fela pueden indexarse en bases de datos vectoriales para búsqueda rápida de proteínas similares en pipelines de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (el modelo ocupa ~6,6 MB en pesos), por lo que cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3050) o incluso CPU con 4 GB de RAM.
- Es viable en entornos sin GPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: se puede usar con la librería `transformers` de HuggingFace (con `trust_remote_code=True`). No se proporcionan pesos GGUF, pero al ser tan pequeño podría convertirse a otros formatos si fuera necesario.
- Latencia y throughput: no se han publicado datos, pero al tener solo 1,6M de parámetros y 2 capas, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Fela | 1,6M | 514 | Hyena (convoluciones largas) | MIT |
| ProtGPT2 | 738M | 1024 | Transformer | MIT |
| ESM-2 (650M) | 650M | 1024 | Transformer | MIT |
| ProtTrans (ProtBERT) | 420M | 512 | Transformer | MIT |

Fela es significativamente más pequeño que estos modelos, lo que limita su capacidad de representación pero permite un despliegue mucho más ligero. No hay datos de rendimiento comparativo disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo muy pequeño (1,6M parámetros), con capacidad limitada para capturar patrones complejos en secuencias de proteínas.
- Entrenado exclusivamente en Pfam-A, por lo que puede no generalizar bien a proteínas no incluidas en esa base de datos o con dominios poco representados.
- Tokenizer a nivel de carácter, sin subword tokenization, lo que puede afectar la eficiencia en secuencias largas.
- Contexto máximo de 514 tokens, insuficiente para proteínas completas de gran tamaño (más de ~500 residuos).
- Modelo base sin ajuste fino; no está optimizado para tareas específicas como predicción de estructura o función.
- No se han evaluado sesgos ni alucinaciones; al ser un modelo generativo, puede producir secuencias no funcionales o irreales.
- Licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se dispone de información sobre cuantizaciones, por lo que el despliegue en dispositivos muy limitados puede requerir conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pandeyps/fela
- Paper de referencia (Hyena): https://www.biorxiv.org/content/10.1101/2024.01.18.576206v1
