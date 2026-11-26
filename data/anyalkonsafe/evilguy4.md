# anyalkonsafe/evilguy4

## Resumen

evilguy4 es un ajuste fino (fine-tune) del modelo Gemma 3n E4B de Google, publicado por el usuario anyalkonsafe en Hugging Face. Se distribuye como un adaptador LoRA fusionado sobre la variante ya cuantizada en 4 bits de Unsloth (`unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`) y se ofrece en formato GGUF con cuantización Q4_K_M, pensado para su uso directo con llama.cpp. El modelo cuenta con aproximadamente 7.518 millones de parámetros totales y un repositorio de 11,7 GB.

El autor lo presenta como una evolución de su serie "evilguy", con tres cambios declarados: mejor rendimiento en matemáticas, mayor tolerancia a jerga, sustituciones y erratas (incluido texto incoherente) y corrección de alucinaciones detectadas en versiones anteriores. La model card no aporta detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni los hiperparámetros del ajuste.

Su relevancia es limitada y de nicho: se trata de un experimento comunitario de bajo perfil (247 descargas y ninguna valoración en el momento de la consulta), sin benchmarks publicados ni documentación técnica profunda. Resulta útil como ejemplo de personalización de un modelo pequeño con LoRA y empaquetado GGUF, pero no como una alternativa seria a modelos de referencia en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3n E4B, ajuste fino con LoRA) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base se distribuye en bnb-4bit |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (repo principal); el adaptador LoRA se basa en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3n E4B, la variante de eficiencia de la familia Gemma 3n de Google, y se ha adaptado mediante un ajuste fino con LoRA sobre la versión ya preparada por Unsloth en 4 bits. La model card no especifica la arquitectura interna exacta del modelo base (número de capas, tipo de atención, uso de atención lineal o decodificación especulativa), por lo que esos detalles deben consultarse en la documentación oficial de Gemma 3n. Tampoco se indica si el ajuste incluyó RLHF, DPO u otra fase de alineamiento posterior.

La información sobre el entrenamiento es mínima: el autor menciona mejoras en matemáticas, robustez ante erratas y jerga, y reducción de alucinaciones, pero no publica el número de tokens de entrenamiento, la composición del dataset, la configuración del LoRA (rango, alpha, capas objetivo) ni la duración del entrenamiento. Se recomienda usar temperature 1.0, top_p 0.95 y top_k 64 para la generación.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat embebida en el GGUF.
- Soporte de tool calling / function calling, siempre que se arranque llama.cpp con la opción `--jinja` para activar la plantilla Jinja.
- Razonamiento matemático mejorado respecto a versiones previas de la serie, según el autor (sin datos cuantitativos).
- Mayor tolerancia a entradas ruidosas: erratas, sustituciones de letras, jerga y texto parcialmente incoherente.
- Reducción declarada de alucinaciones respecto a iteraciones anteriores.
- Capacidades multilingües: no disponible (los idiomas no están documentados).

## Casos de uso

- Prototipado rápido de chatbots: al ser un GGUF Q4_K_M de unos 11,7 GB de repositorio, se puede desplegar con llama.cpp u Ollama en una máquina de gama alta para validar flujos conversacionales antes de invertir en modelos mayores.
- Asistentes tolerantes a entrada informal: su entrenamiento específico para manejar erratas y jerga lo hace adecuado para interfaces donde los usuarios escriben rápido o con abreviaturas (soporte técnico informal, chat de comunidad).
- Integración de tool calling en scripts locales: con `--jinja` activado, puede invocar funciones definidas por el desarrollador en un servidor llama.cpp, útil para automatizaciones domésticas o pipelines internos de bajo coste.
- Educación y experimentación: sirve como caso de estudio de ajuste fino con LoRA y empaquetado GGUF para quienes aprenden a personalizar modelos pequeños.
- Generación de texto creativo con estilo informal: su tolerancia al ruido y su tono conversacional encajan en tareas de escritura de borradores con registro coloquial.
- Pruebas de robustez: útil como modelo de control en evaluaciones sobre manejo de entradas corruptas o malformadas, comparándolo con el Gemma 3n E4B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un GGUF Q4_K_M de un modelo de ~7,5 mil millones de parámetros ocupa aproximadamente 4,5-5 GB en memoria; con overhead de contexto y servidor, se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el ámbito profesional, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), Ollama (importando el GGUF), y potencialmente otros runners compatibles con GGUF; no se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| evilguy4 | ~7,5 B | no disponible | Gemma | GGUF Q4_K_M | Fine-tune comunitario de Gemma 3n E4B |
| Gemma 3n E4B (original) | ~7,5 B (E4B) | no disponible | Gemma | safetensors, GGUF | Modelo base oficial de Google |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit | ~7,5 B | no disponible | Gemma | bnb-4bit | Versión cuantizada del base usada para el ajuste |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada; los únicos puntos de referencia documentados son el modelo base y su versión de Unsloth.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Gemma 3n, hereda los sesgos del modelo base, que deben evaluarse por separado.
- Riesgo de alucinación: el autor afirma haber corregido "un montón de alucinaciones extrañas", pero no aporta métricas; persiste el riesgo inherente a los modelos pequeños.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento en contextos largos o multilingües.
- Licencia: se rige por los términos de la licencia Gemma de Google; es imprescindible revisar las restricciones de uso comercial y las cláusulas de redistribución antes de emplearlo en producción.
- Falta de documentación técnica: sin datos de entrenamiento, benchmarks ni evaluación independiente, no es recomendable como componente crítico en sistemas productivos.
- Advertencia de uso: el nombre y la serie "evilguy" sugieren un carácter experimental; conviene auditar las respuestas antes de exponerlo a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anyalkonsafe/evilguy4
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Documentación de Gemma 3n (Google): no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
