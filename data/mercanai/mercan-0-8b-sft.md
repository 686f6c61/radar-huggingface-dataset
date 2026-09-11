# MercanAI/Mercan-0.8B-SFT

## Resumen

Mercan 0.8B SFT es un modelo de lenguaje de tipo asistente centrado en turco (tr), publicado por MercanAI. Se distribuye en el denominado formato Mercan v1, un contenedor autocontenido de 0,5 GB que empaqueta pesos, metadatos de arquitectura, el tokenizador NDSRF004 y una tabla de enrutamiento de roles de token en un único fichero `model.mercan`, cuyo contenedor físico de tensores es GGUF v3.

El modelo es un transformer decoder denso de aproximadamente 0,8 mil millones de parámetros, con 24 bloques, hidden size de 1536, 12 cabezas de atención y 4 cabezas KV (GQA), y una ventana de contexto de 4096 tokens. La particularidad técnica declarada es el uso de MorphFFN en los 18 primeros bloques, una variante de capa feed-forward cuyo diseño no se detalla en la model card.

Su relevancia actual es limitada: es un lanzamiento sin tracción (0 descargas, 0 likes en el momento de la consulta) orientado al despliegue local de un asistente en turco mediante el CLI `mercan`, lo que lo sitúa en el nicho de modelos pequeños para edge y ejecución on-device. No hay resultados de benchmarks publicados ni información sobre el dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 24 bloques, hidden size 1536, 12 cabezas de atención / 4 cabezas KV (GQA), MorphFFN en los 18 primeros bloques |
| Parametros totales | Aproximadamente 0,8 mil millones (según la denominación del modelo; la model card no da el recuento exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q4_K_M en el artefacto distribuido; no se documentan otras variantes |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.mercan` (Mercan format v1); contenedor físico de tensores GGUF v3; tokenizador NDSRF004 embebido |
| Plantilla de chat | `<\|im_start\|>{role}\n{content}<\|im_end\|>\n` (EOS se añade una vez al final de cada conversación de entrenamiento) |
| Tamaño del repositorio | 0,5 GB |
| Librería declarada | `mercan` |
| Fecha de publicación | 10 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 24 bloques con hidden size de 1536. La atención emplea 12 cabezas de consulta y 4 cabezas de clave/valor, es decir, grouped-query attention con un factor de compresión de 3 respecto a las cabezas de consulta. Los 18 primeros bloques incorporan MorphFFN, una variante de la capa feed-forward cuya definición técnica no aparece en la model card. El sufijo SFT indica que el modelo ha pasado por un ajuste supervisado sobre un modelo base, aunque el autor no especifica ni el modelo base, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO.

El artefacto distribuido no contiene código ejecutable: el fichero `.mercan` incluye pesos, metadatos de arquitectura, metadatos y datos del tokenizador, y la tabla de enrutamiento de roles de token. La ejecución depende del runtime de referencia y del CLI publicados por el autor en `Ahmet2001/mercanApp-test1`, donde `libmercan` expone una ABI estable en C sobre el backend de inferencia nativo. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en turco, con formato de asistente y plantilla de chat ChatML-like.
- Ajuste supervisado orientado a respuestas de asistente (SFT), no a modelo base.
- Ejecución local autocontenida: pesos, tokenizador y metadatos viajan en un único fichero de 0,5 GB.
- Gestión de conversaciones multi-turno dentro del límite de 4096 tokens de contexto.
- Soporte de tool calling o function calling: no disponible (no se menciona en la model card).
- Soporte de agentes o razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: únicamente turco; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio, matemáticas o código destacados): no disponible.

## Casos de uso

- Asistente conversacional local en turco: el modelo puede gestionar diálogos multi-turno con hasta 4096 tokens de contexto y ejecutarse íntegramente en la máquina del usuario mediante `mercan run MercanAI/Mercan-0.8B-SFT`, sin enviar datos a servidores externos.
- Despliegue en dispositivos con recursos limitados: con un artefacto Q4_K_M de 0,5 GB, es viable en portátiles sin GPU dedicada y en hardware edge, donde modelos de 7B o superiores no caben.
- Prototipado rápido de productos en turco: sirve como punto de partida para validar flujos de chat, plantillas de prompt y experiencia de usuario antes de escalar a un modelo mayor.
- Preprocesado y generación de texto en pipelines turcos: resumen, reformulación o generación de borradores de contenido en turco dentro de procesos por lotes, con coste de cómputo bajo.
- Clasificación y etiquetado asistido por generación: dada su ventana de 4096 tokens, puede procesar documentos cortos o fragmentos y producir salidas estructuradas en turco, siempre con validación posterior.
- Investigación sobre arquitecturas alternativas: el uso de MorphFFN en 18 de los 24 bloques lo convierte en un caso de estudio para comparar variantes de feed-forward en modelos pequeños.
- Base para fine-tuning específico de dominio en turco: al estar bajo Apache 2.0 y ser un modelo de 0,8B, el coste de reentrenamiento o ajuste es asumible en una única GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en turco, y la búsqueda web no devolvió documentación técnica asociada al modelo (los resultados obtenidos correspondían a un servicio escolar sin relación con el proyecto).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB con la cuantización Q4_K_M distribuida (aproximadamente 0,5 GB de pesos más la caché KV). Con la configuración declarada (24 capas, 4 cabezas KV, head dim 128, fp16), la caché KV ocupa unos 200 MB a 4096 tokens.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. No es necesario hardware de datacenter; una GTX 1650, RTX 3050 o superior resulta holgada. GPU como A100 o H100 no aportan ventaja práctica para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU con 2-4 GB de RAM libre.
- Opciones de despliegue: el CLI `mercan` y el runtime de referencia con `libmercan` (ABI C) publicados en `Ahmet2001/mercanApp-test1`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores, pese a que el contenedor físico de tensores sea GGUF v3.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

Los datos de las filas de comparación corresponden a la documentación pública de cada modelo, no a la información proporcionada sobre Mercan, cuya columna refleja únicamente lo declarado en su model card.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| Mercan 0.8B SFT | ~0,8B | 4096 | Turco | Apache 2.0 | No disponibles |
| Llama 3.2 1B Instruct | ~1,24B | 128.000 | Multilingüe | Llama 3.2 Community License | Sí |
| Qwen2.5 1.5B Instruct | ~1,54B | 32.768 | Multilingüe | Apache 2.0 | Sí |

Frente a estas alternativas, Mercan 0.8B SFT ofrece un tamaño algo menor y una licencia permisiva, pero limita el soporte a un único idioma, reduce el contexto a 4096 tokens, no publica benchmarks y depende de un formato y un runtime propietarios del propio autor, lo que dificulta su integración en stacks estándar. Existen otros modelos específicos para turco de tamaño medio (por ejemplo, la familia Kumru o Cosmos), pero no se dispone de datos verificados en la información proporcionada para compararlos con rigor.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El autor no documenta la composición del dataset de entrenamiento ni análisis de sesgo.
- Riesgo de alucinación: elevado por diseño en un modelo de 0,8B con ajuste supervisado; no hay evaluaciones de fidelidad publicadas.
- Limitación de idioma: solo turco; el rendimiento en castellano, inglés u otros idiomas no está soportado ni evaluado.
- Limitación de contexto: 4096 tokens, insuficiente para documentos largos o historiales de conversación extensos.
- Dependencia de herramienta: el artefacto requiere el CLI `mercan` y el runtime `libmercan`; no se documenta compatibilidad con ecosistemas estándar como vLLM, Ollama o llama.cpp, lo que añade riesgo de mantenimiento y de encierro tecnológico.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay cláusulas adicionales declaradas.
- Falta de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni informes de terceros que respalden la calidad del modelo.
- Advertencia sobre metadatos: la fecha de creación registrada (10 de septiembre de 2026) es posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal de los metadatos del repositorio.
- Uso en producción: no recomendable sin una evaluación propia previa sobre el dominio objetivo y sin un mecanismo de validación de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MercanAI/Mercan-0.8B-SFT
- Runtime de referencia y CLI: https://huggingface.co/Ahmet2001/mercanApp-test1
- Paper, blog técnico o demo adicionales: no disponibles en la información proporcionada.
- Resultados de la búsqueda web: no relevantes (correspondían a un servicio escolar ajeno al modelo).
