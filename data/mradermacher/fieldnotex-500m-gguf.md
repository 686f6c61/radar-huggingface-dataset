# mradermacher/FIELDNOTEx-500M-GGUF

## Resumen

FIELDNOTEx-500M-GGUF es un repositorio de cuantizaciones GGUF preparado por mradermacher (nethype GmbH) a partir del modelo thinkingdbx/FIELDNOTEx-500M, un LLM compacto de 494.032.768 parámetros especializado en extracción de información y generación de salida estructurada en JSON, con foco en el dominio del mantenimiento. El modelo base se distribuye bajo licencia Apache 2.0 y está orientado al inglés.

Su relevancia reside en la tendencia actual hacia modelos pequeños y especializados desplegables en el borde (edge): con archivos GGUF de entre 0,4 GB (Q2_K) y 1,1 GB (f16), permite ejecutar extracción estructurada de texto en CPU o en hardware muy modesto, sin depender de la nube. Las etiquetas del repositorio (information-extraction, structured-output, json, maintenance, onnx, edge, conversational) describen el propósito del modelo original.

Debe tenerse en cuenta que se trata de una cuantización publicada el 27 de octubre de 2026, sin descargas registradas ni documentación técnica detallada del modelo base: la arquitectura exacta, la longitud de contexto y los datos de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (librería transformers; no se especifica la familia de arquitectura) |
| Parámetros totales | 494.032.768 (~494 M) |
| Parámetros activos | No aplica (no consta como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (GGUF estático) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors y figura con etiqueta onnx |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo base (tipo de transformer, número de capas, uso de GQA u otras técnicas), ni los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron etapas de RLHF/DPO. Las etiquetas del repositorio indican que el modelo está orientado a extracción de información con salida estructurada en JSON, al dominio del mantenimiento y al despliegue en edge, con presencia señalada de versiones ONNX.

En cuanto a la cuantización, mradermacher publica únicamente cuants estáticos convertidos desde el formato HF (convert_type: hf). El autor indica que los cuants ponderados/imatrix no están disponibles de momento y que podrían no publicarse salvo petición expresa mediante una discusión comunitaria. Las notas del propio repositorio recomiendan Q4_K_S y Q4_K_M por equilibrio velocidad/calidad, Q6_K como calidad muy buena y Q8_0 como la mejor calidad del catálogo.

## Capacidades

- Extracción de información: identificación de entidades y campos relevantes en texto del dominio del mantenimiento (según las etiquetas del repositorio).
- Salida estructurada: generación de JSON conforme a esquemas, pensada para integración con sistemas posteriores.
- Generación de texto conversacional en inglés (etiqueta conversational), aunque sin documentación sobre calidad en diálogo abierto.
- Despliegue ligero: formato GGUF para llama.cpp y ecosistemas derivados, y señal de versiones ONNX para ejecución con ONNX Runtime.
- Razonamiento complejo, generación de código, matemáticas y capacidades multimodales: no disponible (sin documentación que lo respalde).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.

## Casos de uso

- Digitalización de partes de trabajo de mantenimiento: convertir las notas en texto libre de los técnicos (averías, intervenciones, repuestos, tiempos) en registros JSON estructurados; es el caso de uso para el que el modelo parece haber sido especializado.
- Poblado automático de un CMMS/GMAO: integración local que analiza descripciones de incidencias y rellena campos de órdenes de trabajo, reduciendo la introducción manual de datos.
- Inferencia en entornos sin conectividad: plantas industriales, talleres o instalaciones remotas donde no se puede enviar texto a la nube; con archivos de 0,4-0,6 GB en Q4 y soporte ONNX, el modelo cabe en hardware de borde.
- Normalización de históricos de mantenimiento: procesar archivos históricos de registros en formato heterogéneo y transformarlos en esquemas JSON uniformes para alimentar analítica posterior o mantenimiento predictivo.
- Preanotación de datasets: acelerar el etiquetado de entidades y relaciones en corpus de mantenimiento generando candidatas JSON que un revisor humano valida o corrige.
- Validación y auditoría: extraer campos concretos (lecturas, comprobaciones de seguridad, códigos de equipo) de informes para su validación automática contra un jsonschema.
- Asistente ligero de consulta técnica en inglés: dado su tamaño, puede servir como chat de bajo consumo para consultas rápidas sobre procedimientos, aunque con expectativas moderadas por su escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF pesan entre 0,4 GB (Q2_K, Q3_K_S) y 1,1 GB (f16); con Q4_K_M (~0,5 GB de pesos) y overhead de contexto y KV cache, basta con menos de 1,5-2 GB de VRAM. En CPU, 2-4 GB de RAM son suficientes para las cuants de 4 bits.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU moderna acelera la inferencia (por ejemplo, una RTX 3060 o superior sobra con gran margen); GPUs de centro de datos como A100 o H100 solo tendrían sentido para servir un volumen muy alto de peticiones concurrentes.
- Consumer GPUs: sí, cabe con holgura en prácticamente cualquier GPU de consumo, incluso de 2-4 GB, y en portátiles; también en Apple Silicon con memoria unificada. En SBC tipo Raspberry Pi es ejecutable en teoría por tamaño, aunque con rendimiento limitado (estimación no verificada).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes compatibles con GGUF para las cuants de este repositorio; transformers con el modelo base en safetensors; ONNX Runtime si se emplea la versión ONNX del modelo base. vLLM y TGI están orientados a modelos mayores y su soporte de GGUF es limitado; no hay documentación de compatibilidad con este modelo.
- Latencia y throughput: no hay cifras publicadas. Como referencia orientativa no oficial, los modelos de ~0,5 B suelen alcanzar decenas de tokens/s en CPU de escritorio y varios cientos en GPU, pero debe validarse en cada entorno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | GGUF disponible |
|---|---|---|---|---|---|
| FIELDNOTEx-500M (base: thinkingdbx/FIELDNOTEx-500M) | 494 M | No disponible | Especializado en extracción de información y JSON (mantenimiento) | Apache 2.0 | Sí (este repositorio) |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Generalista multilingüe | Apache 2.0 | Sí, amplio |
| Qwen3-0.6B | 0,6 B | 32.768 (40.960 con YaRN) | Generalista con modo thinking | Apache 2.0 | Sí, amplio |
| SmolLM2-360M-Instruct | 360 M | 8.192 | Generalista en inglés | Apache 2.0 | Sí, amplio |

FIELDNOTEx-500M se diferencia de los generalistas de tamaño similar en su especialización en extracción estructurada para mantenimiento, lo que puede reportar ventaja en ese dominio; a cambio, carece de benchmarks públicos, su contexto no está documentado y su validación comunitaria es nula frente a alternativas como Qwen2.5-0.5B-Instruct o SmolLM2.

## Limitaciones y advertencias

- Idioma: solo se declara soporte para inglés; no hay garantías de funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: propio de cualquier LLM y agravado por el tamaño (494 M); en extracción estructurada es imprescindible validar el JSON generado contra un esquema antes de persistirlo.
- Longitud de contexto no documentada: no es posible garantizar el procesado de documentos largos; verificar empíricamente antes de usar con informes extensos.
- Sin benchmarks públicos ni validación comunitaria: el repositorio presenta 0 descargas y 0 likes en el momento de redactar la ficha, y la documentación del modelo base es escasa (arquitectura, datos de entrenamiento y capacidades no detalladas).
- Cuantizaciones estáticas: al no existir cuants imatrix/ponderados, la calidad por bit puede ser ligeramente inferior a la de repositorios con cuants ponderados; evitar Q2_K y Q3_K_S en producción si la fidelidad de los datos extraídos es crítica.
- Especialización de dominio: el rendimiento fuera del ámbito del mantenimiento y la extracción estructurada es desconocido y probablemente inferior al de modelos generalistas.
- Licencia: Apache 2.0 permite el uso comercial sin regalías, pero sin garantías; conviene revisar igualmente la ficha del modelo base, que comparte licencia declarada.
- Advertencia para producción: dado que no hay datos de rendimiento publicados, realizar una evaluación propia con datos reales del dominio antes de cualquier despliegue.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/FIELDNOTEx-500M-GGUF
- Modelo base: https://huggingface.co/thinkingdbx/FIELDNOTEx-500M
- Página de descargas y resumen de mradermacher: https://hf.tst.eu/model#FIELDNOTEx-500M-GGUF
- Solicitudes de cuantización a mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de archivos GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/

No se han encontrado papers, blogs oficiales ni demos adicionales en la información disponible.
