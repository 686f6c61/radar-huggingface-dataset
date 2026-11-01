# mradermacher/Spark-X2.6-1.7B-Abliterated-GGUF

## Resumen

Spark-X2.6-1.7B-Abliterated-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo bowtiedrahman/Spark-X2.6-1.7B-Abliterated, publicada por el cuantizador mradermacher. El modelo base es una versión "abliterated" (descensurada mediante técnicas de modificación de pesos, en este caso asociada a la herramienta Heretic) del modelo Spark-X2.6 de 1.7B parámetros, un LLM conversacional con soporte de inglés y chino. La abliteración elimina los mecanismos de rechazo del modelo alineado, permitiendo respuestas sin filtros de seguridad.

La relevancia de esta ficha radica en la disponibilidad del modelo en múltiples niveles de cuantización (desde Q2_K con 0,9 GB hasta f16 con 3,5 GB), lo que lo hace ejecutable en hardware muy modesto, incluidas CPU y portátiles sin GPU dedicada. Con 1.707.657.216 parámetros, se sitúa en la categoría de modelos pequeños orientados a inferencia local de bajo consumo. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

Cabe destacar que la model card original del modelo base no está incluida en el repositorio del cuantizador, por lo que varios datos técnicos (arquitectura detallada, longitud de contexto, datos de entrenamiento y benchmarks) no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag de arquitectura sparkx2_5/spark2_5; detalles no publicados) |
| Parametros totales | 1.707.657.216 (~1,7B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors, según los 1,7B parámetros reales reportados) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente cuantizaciones GGUF estáticas del modelo base, por lo que la información sobre arquitectura y entrenamiento procede indirectamente de los metadatos. Los tags indican la familia de arquitecturas sparkx2_5/spark2_5, pero no se publican detalles sobre número de capas, tipo de attention ni innovaciones técnicas. El modelo base, bowtiedrahman/Spark-X2.6-1.7B-Abliterated, es una versión abliterated: sus pesos se han modificado (proceso asociado a la herramienta Heretic, según los tags) para suprimir los comportamientos de rechazo aprendidos durante el alineamiento, sin reentrenamiento completo. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información disponible.

Las cuantizaciones son estáticas (convertidas desde el formato HF original); el propio autor ofrece una variante con imatrix (matrices de importancia ponderadas) en un repositorio separado, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generación de texto conversacional (tag "conversational" en el repositorio).
- Soporte de inglés y chino.
- Modelo sin filtros de seguridad (abliterated/uncensored): responde a solicitudes que los modelos alineados rechazarían.
- Cuantización reproducible (tag "reproducible"), útil para verificación y auditoría de los GGUF.
- No hay información disponible sobre tool calling, capacidades de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Experimentación con modelos abliterated: investigadores que estudian técnicas de eliminación de alineamiento (Heretic y similares) pueden ejecutar el modelo localmente con archivos de menos de 2 GB.
- Inferencia local en hardware modesto: con la cuantización Q4_K_M (1,2 GB) funciona en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Desarrollo y pruebas de pipelines de inferencia: su pequeño tamaño lo hace ideal para pruebas rápidas de integración con llama.cpp, LM Studio o backends propios antes de escalar a modelos mayores.
- Chatbots personales sin censura en inglés y chino: conversaciones multi-turno donde el usuario desea evitar los rechazos del modelo alineado original.
- Generación sintética de datos: uso como modelo generador barato y rápido en pipelines de destilación o aumento de datos, aprovechando su baja huella de memoria.
- Educación sobre cuantización: la colección completa de quants (Q2_K a f16) permite comparar en la práctica el impacto de cada esquema de cuantización sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantización elegida; desde ~0,9 GB (Q2_K) hasta ~3,5 GB (f16), más la memoria del KV cache según la longitud de contexto.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2-4 GB de VRAM (por ejemplo GTX 1650, RTX 3050 o superiores) ejecuta las cuantizaciones medias con holgura. En CPU moderna es plenamente viable.
- Consumer GPU: cabe sobradamente en prácticamente cualquier GPU de consumo actual; incluso la variante f16 (3,5 GB) cabe en una RTX 3060 de 12 GB o superior.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM/TGI al tratarse de GGUF, aunque el modelo base en safetensors sí podría servirse con esas herramientas.
- Latencia y throughput: no disponibles; por su tamaño de 1,7B parámetros, se espera inferencia muy rápida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B-Abliterated-GGUF | 1,7B | GGUF (Q2_K a f16) | Apache 2.0 | Versión abliterated, inglés/chino |
| Qwen2.5-1.5B-Instruct | 1,5B | safetensors/GGUF | Qwen license (uso comercial condicionado) | Multilingüe, alineado, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | safetensors/GGUF | Llama 3.2 Community License | Multilingüe, alineado, ecosistema amplio |
| SmolLM2-1.7B-Instruct | 1,7B | safetensors/GGUF | Apache 2.0 | Inglés principalmente, alineado, benchmarks publicados |

La principal diferencia de Spark-X2.6-1.7B-Abliterated frente a estas alternativas es la ausencia de filtros de seguridad y la falta de documentación técnica y benchmarks; los modelos comparables publican evaluaciones y tienen ecosistemas más maduros, pero mantienen sus mecanismos de alineamiento.

## Limitaciones y advertencias

- Al ser un modelo abliterated, genera contenido sin las salvaguardas de seguridad habituales: puede producir texto ofensivo, peligroso o inapropiado. Su uso conlleva responsabilidad legal y ética para el desplegador.
- Riesgo de alucinación: no cuantificado; al no publicarse benchmarks, no se puede evaluar su fiabilidad frente a alternativas.
- Limitaciones de idioma: soporte documentado solo para inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no publicada: imposible planificar aplicaciones con documentos largos sin verificarlo empíricamente.
- La model card del cuantizador no incluye información sobre el modelo base más allá de los metadatos, lo que dificulta la evaluación técnica previa.
- Las cuantizaciones Q2_K y Q3_K_M se indican explícitamente como de menor calidad; para uso serio se recomiendan Q4_K_S, Q4_K_M o superiores.
- Licencia Apache 2.0 sin restricciones comerciales, pero las obligaciones de atribución y aviso de licencia siguen aplicando.
- No hay información sobre soporte de tool calling ni agentes; asumir que no existen hasta verificarlo.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/bowtiedrahman/Spark-X2.6-1.7B-Abliterated
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Abliterated-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Spark-X2.6-1.7B-Abliterated-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre calidad de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
