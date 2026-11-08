# AdaptiveChunking/spec_D_s2

## Resumen

spec_D_s2 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento concreta (un "run") de un modelo de tipo H-Net a nivel de byte, generada con el repositorio de código abierto beetle-hnet y su entrenador heredado (`legacy/tier1/train.py`). El modelo fue extraído del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` y reorganizado en el formato de una ejecución por modelo de Beetle.

Con 82.470.528 parámetros, el modelo se sitúa en la categoría de modelos pequeños (aproximadamente 82 millones), lo que lo hace manejable en hardware de consumo. Su interés principal no reside en capacidades de propósito general, sino en la experimentación con técnicas de tokenización dinámica por chunks y procesamiento a nivel de byte, un área de investigación relevante para reducir la dependencia de tokenizadores fijos y mejorar la robustez multilingüe y ante texto arbitrario.

La información publicada es limitada: no se detallan resultados de benchmarks, idiomas soportados ni datos de entrenamiento más allá de la referencia al entrenador utilizado. El repositorio incluye 21 checkpoints retenidos en ramas `step-N`, lo que lo convierte en material útil para estudiar la evolución del entrenamiento y para reproducir experimentos de chunking adaptativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level, con dynamic chunking); detalles completos no disponibles |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (procesamiento a nivel de byte, potencialmente agnóstico de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo es un H-Net a nivel de byte ("byte-level H-Net"), entrenado con el entrenador heredado del proyecto beetle-hnet (`legacy/tier1/train.py`). La etiqueta "dynamic-chunking" y "tokenization" sugiere que el modelo opera sobre secuencias de bytes y aplica un mecanismo de agrupación dinámica en chunks en lugar de depender de un tokenizador subword convencional. No se dispone de detalles publicados sobre el número de capas, dimensión oculta, mecanismo de atención ni innovaciones concretas (atención lineal, decodificación especulativa, etc.).

En cuanto al entrenamiento, la model card indica que se conservaron 21 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con sus pesos y configuración, incluyendo el mapa `tied_weights` que debe restaurarse aplicando `sd[dst] = sd[src]`. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador heredado no conservó estado del optimizador, por lo que no existe directorio `training_state/`. Se mencionan sondas de frontera FLORES+ para esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo `spec_D_s2/`, lo que apunta a una evaluación centrada en la segmentación de texto multilingüe más que en tareas generativas generales.

## Capacidades

- Procesamiento de texto a nivel de byte, sin dependencia de un tokenizador subword fijo.
- Chunking dinámico ("dynamic-chunking"), orientado a la segmentación adaptativa de secuencias.
- Entrenamiento reproducible mediante checkpoints intermedios (`step-N`) y registro de entrenamiento (`log.jsonl`).
- Evaluación de fronteras de segmentación mediante sondas FLORES+ incluidas en un dataset asociado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.
- Soporte multilingüe: no confirmado explícitamente; el enfoque byte-level es potencialmente agnóstico de idioma, pero no hay datos publicados.

## Casos de uso

- Investigación en tokenización: utilizar el modelo y sus checkpoints para estudiar cómo evoluciona la segmentación dinámica en chunks a lo largo del entrenamiento (pasos 0 a 2000 y posteriores).
- Evaluación de fronteras multilingües: emplear las sondas FLORES+ del dataset `hnet-chunking-probes` para medir la calidad de la segmentación en distintos idiomas.
- Reproducción de experimentos: restaurar los pesos con el mapa `tied_weights` y comparar el comportamiento entre checkpoints intermedios para analizar dinámicas de entrenamiento.
- Base para fine-tuning en tareas de segmentación: partir del checkpoint final o intermedios como inicialización para tareas de chunking o tokenización específicas de dominio.
- Estudio de modelos byte-level de bajo coste: con 82 millones de parámetros, sirve como banco de pruebas asequible para comparar arquitecturas H-Net frente a transformers con tokenizador BPE.
- Docencia y formación: el tamaño reducido y la disponibilidad de checkpoints intermedios facilitan demostraciones sobre entrenamiento y evaluación de modelos de lenguaje a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 millones de parámetros, en FP32 los pesos ocupan aproximadamente 330 MB; en FP16/BF16, unos 165 MB; en cuantización de 8 bits, unos 82 MB. La memoria adicional depende de la longitud de secuencia y del mecanismo de atención, cuyo detalle no está disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia en precisión reducida; no se dispone de requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del modelo.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y arquitectura H-Net no estándar, no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; lo más probable es requerir el código de beetle-hnet para cargar la arquitectura. No hay documentación de despliegue publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spec_D_s2 (AdaptiveChunking) | 82,47 M | no disponible | H-Net byte-level con dynamic chunking | Apache 2.0 | Hugging Face (repo de investigación) |
| hnet-chunking-spec-82m (AdaptiveChunking) | ~82 M (repo empaquetado del que se extrajo) | no disponible | H-Net byte-level con dynamic chunking | Apache 2.0 | Hugging Face |
| Alternativas de propósito general del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otras organizaciones con la misma arquitectura o el mismo objetivo de investigación.

## Limitaciones y advertencias

- Modelo de investigación sin model card completa: no se documentan datos de entrenamiento, idiomas, contexto ni evaluación de calidad.
- No hay benchmarks publicados, por lo que no puede evaluarse su rendimiento frente a alternativas.
- Arquitectura no estándar (H-Net byte-level): la carga requiere el código de beetle-hnet, no es compatible directamente con runtimes habituales como transformers, vLLM o llama.cpp.
- El entrenador heredado no guardó estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de evaluación y de documentación desaconseja su uso en producción sin validación previa.
- Los checkpoints intermedios pueden presentar comportamientos inestables o incompletos; deben restaurarse correctamente los pesos ligados (`tied_weights`) para evitar resultados incorrectos.
- No hay información sobre límites de contexto ni sobre comportamiento con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_D_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
