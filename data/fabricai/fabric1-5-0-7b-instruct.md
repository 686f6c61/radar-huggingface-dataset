# FabricAI/Fabric1.5-0.7B-Instruct

## Resumen

Fabric1.5-0.7B-Instruct es un modelo de lenguaje causal de tipo decoder-only con 742.528.520 parámetros (aproximadamente 0,74 mil millones), publicado por FabricAI bajo el paraguas del proyecto Bluebird. Se trata de la variante ajustada por instrucciones del checkpoint base `tudor-iustin22/Bluebird-1.5-Base`, y su rasgo diferencial es una arquitectura híbrida que combina atención causal local con un mecanismo de memoria fragmentada y compuertas (chunked fabric memory) que le permite operar con una ventana de contexto de 32.768 tokens sin aplicar atención completa sobre toda la secuencia.

El modelo está pensado para generación de texto conversacional, seguimiento de instrucciones, respuesta a preguntas, resumen y generación orientada a tareas. Su tamaño compacto lo sitúa en la franja de modelos que pueden ejecutarse en hardware de consumo, y su licencia Apache 2.0 facilita la integración en productos comerciales. El entrenamiento se realizó en PyTorch con precisión mixta sobre ocho aceleradores Intel Gaudi 3, lo que lo vincula explícitamente al ecosistema de Intel.

Es relevante ahora porque propone una alternativa de contexto largo a bajo coste computacional: en lugar de escalar parámetros, reduce el coste de atención sobre el contexto antiguo mediante resúmenes aprendidos por fragmento. No obstante, el propio autor advierte que la ventana de 32K es una capacidad del modelo y no una garantía de recuperación precisa a larga distancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal con atención local y memoria fragmentada con compuertas (Chunked Fabric Memory) |
| Parametros totales | 742.528.520 (742,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0, sujeta a avisos de terceros aplicables |
| Formato de pesos | Safetensors (FP16), con código de modelo personalizado en Transformers |

Otras especificaciones: 24 capas de transformer (16 LocalBlock + 8 FabricMemoryBlock), tamaño oculto de 1.536, vocabulario de 65.536 tokens, atención con grouped-query attention (24 cabezas de consulta y 6 de clave/valor, dimensión de cabeza 64), ventana de atención local de 2.048 tokens, tamaño de fragmento de memoria de 512 tokens, 4 resúmenes aprendidos por fragmento, hasta 256 vectores de resumen a 32K de contexto, codificación posicional RoPE con theta = 1.000.000, FFN SwiGLU y normalización RMSNorm.

## Arquitectura y entrenamiento

Bluebird 1.5 emplea un transformer decoder-only en el que cada tercer bloque incorpora una segunda ruta de atención sobre representaciones comprimidas del contexto ya completado. La atención local exacta cubre los 2.048 tokens más recientes; los tramos anteriores se particionan en fragmentos de 512 tokens, cada uno representado por cuatro resúmenes aprendidos, de modo que a 32.768 tokens el modelo puede consultar hasta 256 vectores de resumen. Una compuerta escalar aprendida por token mezcla la salida de la ruta local con la de la ruta de memoria, lo que limita el coste de atención sobre el contexto antiguo frente a una atención completa sobre toda la secuencia. La atención usa GQA con 24 cabezas de consulta compartiendo 6 cabezas de clave/valor.

El linaje base registra 23.000.514.560 tokens de preentrenamiento, seguidos de un ajuste de identidad y de un fine-tuning supervisado de instrucciones. Los conjuntos de datos de post-entrenamiento citados son HuggingFaceTB/smoltalk2, open-r1/Mixture-of-Thoughts y nvidia/Nemotron-Post-Training-Dataset-v1. El entrenamiento se ejecutó en PyTorch con precisión mixta sobre ocho aceleradores Intel Gaudi 3 (dispositivo `hpu`), con soporte declarado también para dispositivos Intel Arc (`xpu`). No se documentan fases de RLHF ni DPO, ni detalles sobre la composición exacta o el filtrado de los datos de instrucciones.

## Capacidades

- Generación de texto causal y conversación multi-turno con formato de chat dedicado (roles system, user y assistant con delimitadores explícitos).
- Seguimiento de instrucciones y generación orientada a tareas tras el post-entrenamiento supervisado.
- Respuesta a preguntas, resumen y generación de contenido general.
- Manejo de contexto largo de hasta 32.768 tokens, con acceso eficiente a contexto previo mediante resúmenes de fragmento aprendidos.
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional de atención al cliente: puede mantener diálogos multi-turno con historial extenso gracias a la ventana de 32K y a la memoria fragmentada, que evita recalcular atención completa sobre todo el histórico en cada turno.
- Resumen de documentos largos: informes, actas o transcripciones de hasta decenas de miles de tokens pueden procesarse en una sola pasada, con la salvedad de que la recuperación de detalles lejanos no está garantizada.
- Generación de contenido editorial: redacción de borradores, reescritura y adaptación de tono a partir de instrucciones en inglés, aprovechando el ajuste por instrucciones y el formato de chat.
- Extracción de información y respuesta a preguntas sobre base documental: útil en pipelines de procesamiento por lotes donde el coste por token importa y el modelo cabe en una sola GPU.
- Prototipado e investigación sobre arquitecturas de contexto largo: el diseño de memoria fragmentada con compuertas es un objeto de estudio reproducible en hardware modesto, con código personalizado disponible en el repositorio.
- Despliegue en el borde o en entornos con recursos limitados: con 742,5 M de parámetros en FP16 (unos 1,5 GB de pesos), es viable en GPUs de consumo y en estaciones de trabajo sin aceleradores de datacenter.
- Evaluación comparativa de modelos pequeños: sirve como referencia de la franja sub-1B para experimentos de ajuste fino y de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 1,5 GB; con caché KV y overhead de ejecución, se puede estimar un rango de 2 a 4 GB en función de la longitud de contexto y del tamaño de lote. Los cálculos para cuantizaciones de 8 o 4 bits no están documentados por el autor.
- GPU recomendadas: el autor documenta entrenamiento en Intel Gaudi 3 y soporte para Intel Arc (`xpu`); para inferencia en NVIDIA, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente, aunque no se proporcionan cifras oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090), si bien no hay validación publicada.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (el modelo requiere código personalizado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita el despliegue en llama.cpp y Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fabric1.5-0.7B-Instruct | 742,5 M | 32.768 | Apache 2.0 | Memoria fragmentada con compuertas; solo inglés; código personalizado |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache 2.0 | Multilingüe, amplio ecosistema de cuantizaciones y despliegue |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 | Llama 3.2 Community License | Multilingüe, contexto muy superior, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache 2.0 | Alternativa de la misma franja con ecosistema maduro |

La comparación se basa en características públicas de cada familia; no se dispone de resultados de benchmarks de Fabric1.5 que permitan contrastar calidad de forma empírica.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está validado y previsiblemente será deficiente.
- La ventana de 32K es una capacidad arquitectónica, no una garantía de recuperación precisa: el autor advierte explícitamente que la precisión de recall a larga distancia no está asegurada.
- Riesgo de alucinación inherente a un modelo de 742 M de parámetros con datos de post-entrenamiento no detallados; no se documentan evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad, toxicidad o alineación.
- Requiere `trust_remote_code=True` y revisión previa del código Python del repositorio, lo que añade superficie de riesgo en producción.
- No hay pesos GGUF ni cuantizaciones publicadas, lo que complica el despliegue en entornos de inferencia ligera sin trabajo adicional de conversión.
- El modelo se distribuye bajo Apache 2.0, sujeta a avisos de terceros aplicables; conviene verificar las licencias de los datasets de post-entrenamiento citados antes de un uso comercial.
- El tamaño reducido limita el razonamiento complejo, las matemáticas avanzadas y la generación de código fiable; no se han publicado benchmarks que respalden lo contrario.
- El repositorio tiene un volumen de descargas bajo (1.162) y pocos likes (3), lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FabricAI/Fabric1.5-0.7B-Instruct
- Repositorio del modelo Instruct referenciado en la model card: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Instruct
- Modelo base: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentación de instalación de Intel Gaudi: https://docs.habana.ai/en/latest/Installation_Guide/index.html
