# nishaantshah/nepglish-nlu-v4-GGUF

## Resumen

NepGlish-NLU v4 GGUF es una adaptación de LLaMA 3 8B Instruct especializada en comprensión de lenguaje natural (NLU) para consultas bancarias escritas en NepGlish, es decir, nepalí romanizado mezclado con inglés. El modelo recibe una frase como "Ram lai 5000 pathaunus" y devuelve una estructura JSON con la intención detectada y los slots extraídos, por ejemplo `{"intent": "fund_transfer", "slots": {"recipient": "Ram", "amount": 5000}}`. Lo publica el usuario nishaantshah en Hugging Face, partiendo del adaptador `nishaantshah/nepglish-nlu-v4` fusionado sobre `unsloth/llama-3-8b-Instruct` y cuantizado a Q8_0 con llama.cpp.

Se trata de un transformer decoder-only denso de 8.030.261.248 parámetros (unos 8,03 mil millones), sin arquitecturas MoE ni mecanismos híbridos. Su interés práctico está en el nicho: cubre intent detection y slot filling en un dominio financiero y en un registro lingüístico (romanización del nepalí) para el que apenas existen recursos públicos. El repositorio pesa 8,5 GB y está pensado para ejecutarse con Ollama o llama.cpp, lo que permite desplegarlo en infraestructura modesta.

La relevancia actual es doble. Por un lado, demuestra el patrón habitual de adaptar un modelo Instruct generalista con un adaptador pequeño y ligero a una tarea muy concreta, manteniendo el resto de capacidades del modelo base. Por otro, las cifras que reporta el autor son altas pero conviene leerlas con cautela: proceden de un conjunto de test sintético y generado por plantillas, no del checkpoint Q8_0 que se distribuye en este repositorio, y el propio autor advierte de que la evaluación no se ha repetido sobre este fichero.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia LLaMA 3) |
| Parámetros totales | 8.030.261.248 (8,03 B, dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base LLaMA 3 8B Instruct emplea 8.192 tokens |
| Tipos de cuantización | Q8_0 (única incluida en el repositorio; el autor no publica otros niveles) |
| Idiomas soportados | Nepalí romanizado (NepGlish) e inglés |
| Licencia | Llama 3 Community License (`license: llama3`) |
| Formato de pesos | GGUF (Q8_0), generado con llama.cpp |
| Modelo base | unsloth/llama-3-8b-Instruct |
| Tamaño del repositorio | 8,5 GB |
| Fecha de publicación | 15 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de LLaMA 3 8B Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención completa, al que se le ha aplicado un ajuste fino supervisado mediante un adaptador posteriormente fusionado en los pesos base. No se documenta en la model card el rango del adaptador, el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que las consultas son de dominio bancario en NepGlish y que el conjunto de evaluación se generó de forma sintética a partir de plantillas. Tampoco se especifica si hubo una fase adicional de RLHF o DPO sobre el adaptador; el modelo base ya es una variante Instruct.

El pipeline de publicación consiste en fusionar el adaptador sobre el modelo base y cuantizar el resultado a Q8_0 con llama.cpp. La parte más relevante para el uso en producción es que la tarea se ha formulado como extracción estructurada: el modelo está entrenado para emitir JSON con una intención y un diccionario de slots, con decodificación greedy. El repositorio incluye ficheros `system` y `params` que fijan el prompt de sistema de entrenamiento y los parámetros de muestreo, de modo que el modelo rinde de forma consistente solo si se respeta exactamente ese prompt (`Extract the intent and slots from the following NepGlish financial query.`). El autor no publica ninguna innovación técnica adicional como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Extracción de intenciones (intent detection) en 20 clases definidas en la model card del adaptador, a partir de consultas bancarias en NepGlish.
- Extracción de slots (slot filling) con salida JSON estructurada; el ejemplo documentado cubre `recipient` y `amount` para transferencias de fondos.
- Salida en formato JSON parseable, sin errores de parseo en el conjunto de evaluación reportado (0 de 162).
- Comprensión de nepalí romanizado mezclado con inglés, un registro que no cubren los modelos multilingües convencionales.
- Conversación de un solo turno orientada a tarea: el modelo espera una consulta y devuelve la estructura, no mantiene diálogo multi-turno documentado.
- No se documenta soporte de tool calling ni function calling, ni capacidades de agente, ni razonamiento multi-paso.
- No se documenta visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües limitadas a los dos idiomas declarados (ne, en); no hay evidencia de generalización a otros idiomas.
- El modelo base conserva su naturaleza conversacional y su capacidad de generación de texto, pero el ajuste fino está orientado a la tarea NLU y la model card no documenta el rendimiento en otras tareas.

## Casos de uso

- Clasificación de intenciones en un chatbot bancario: el modelo recibe el mensaje del cliente en NepGlish y devuelve la intención, lo que permite enrutar la conversación al flujo correcto (transferencia, consulta de saldo, estado de tarjeta) sin construir un clasificador específico.
- Extracción de parámetros para transferencias: a partir de "Ram lai 5000 pathaunus" se obtienen el destinatario y el importe listos para prellenar un formulario, reduciendo la fricción en banca móvil para usuarios que escriben en nepalí romanizado.
- Enrutado en contact center con agentes humanos: el JSON de intención y slots se puede mostrar al agente como resumen estructurado de la consulta, lo que acorta el tiempo de gestión y estandariza la tipificación de motivos de contacto.
- Preprocesado en sistemas IVR o asistentes de voz: tras una transcripción ASR que produzca texto romanizado, el modelo normaliza la consulta a una estructura que los sistemas core bancarios puedan consumir.
- Anotación asistida de datos: dado que devuelve JSON con intención y slots, puede usarse para preetiquetar grandes volúmenes de consultas históricas que después se revisan manualmente, acelerando la creación de datasets propios en un dominio con pocos recursos públicos.
- Despliegue local en oficina o sucursal: al ser un GGUF Q8_0 ejecutable con Ollama, se puede instalar en un equipo con GPU de gama media o incluso en CPU, evitando enviar consultas financieras de clientes a servicios en la nube de terceros.
- Pruebas de regresión de pipelines NLU: sirve como referencia para comparar los resultados de un modelo propio o de una versión anterior del sistema, siempre que se use el mismo prompt de sistema y decodificación greedy.
- Generación de datos sintéticos de dominio: combinado con plantillas, puede producir variantes de consultas bancarias etiquetadas para aumentar la cobertura del entrenamiento de otros modelos.

## Benchmarks y rendimiento

Los datos que se muestran a continuación corresponden al adaptador sin fusionar, medidos por el arnés de evaluación del proyecto en una GPU de Kaggle y con el prompt de entrenamiento. El autor indica explícitamente que no se han reverificado sobre este checkpoint Q8_0.

| Métrica | Resultado | Conjunto |
|---|---|---|
| Intent accuracy | 98,77 % (160/162; IC 95 %: 95,6–99,7 %) | Test retenido, n = 162 |
| Intent macro-F1 | 92,93 % sobre todas las etiquetas predichas; 97,57 % sobre las 20 clases de intención | Test retenido, n = 162 |
| Slot micro-F1 | 100 % (todas las ranuras con 1,00) | Test retenido, n = 162 |
| Errores de parseo JSON | 0 / 162 | Test retenido, n = 162 |
| Intent accuracy fuera de plantilla | 94,87 % (37/39; IC 95 %: 83,1–98,6 %) | Subconjunto de 39 consultas cuyo template no aparece en entrenamiento |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K ni equivalentes), ni mediciones de latencia o throughput. Tampoco hay comparación con modelos alternativos para esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa aproximadamente 8,5 GB, por lo que se necesitan alrededor de 9-10 GB de VRAM contando la caché KV con contexto corto. Son estimaciones propias derivadas del tamaño del repositorio, no cifras publicadas por el autor.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070, A2000 12 GB): cabe, pero con margen ajustado si se usan contextos largos o varias secuencias concurrentes.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000): configuración cómoda para este modelo con contexto moderado.
- GPU de 24 GB o superior (RTX 3090, RTX 4090, L4, A10G, A100, H100): holgada, permite mayor contexto y más concurrencia; para una tarea de clasificación de frases cortas como esta, es más capacidad de la necesaria.
- Ejecución en CPU: viable con llama.cpp u Ollama, con latencias más altas pero funcionales para un modelo de 8B en Q8_0; si se busca rendimiento en CPU, conviene recuantizar a Q4_K_M o Q5_K_M, niveles que este repositorio no incluye.
- Opciones de despliegue: Ollama (`ollama run hf.co/nishaantshah/nepglish-nlu-v4-GGUF:Q8_0`), llama.cpp / llama-server, LM Studio y otras herramientas compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints, aunque no se detalla la configuración.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Advertencia de despliegue: hay que fijar el prompt de sistema exacto y decodificación greedy (ficheros `system` y `params` del repositorio); fuera de esa configuración el autor no garantiza el formato de salida.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos públicos de NLU bancaria en NepGlish, por lo que la comparativa se limita a las variantes del propio proyecto y a su modelo base.

| Modelo | Parámetros | Formato | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nepglish-nlu-v4-GGUF (este modelo) | 8,03 B | GGUF Q8_0 | ne (romanizado), en | Intent detection + slot filling bancario | Llama 3 Community License | Repositorio HF, 0 descargas |
| nepglish-nlu-v4 (adaptador sin fusionar) | Adaptador sobre 8,03 B | Pesos del adaptador | ne (romanizado), en | Igual, es el origen de las métricas publicadas | Llama 3 Community License | Repositorio HF del adaptador |
| unsloth/llama-3-8b-Instruct (modelo base) | 8,03 B | safetensors / GGUF disponible | Multilingüe (el nepalí romanizado no está garantizado) | Modelo Instruct generalista | Llama 3 Community License | Muy extendido |

Modelos alternativos comparables de la misma categoría (NLU de dominio financiero en nepalí romanizado): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas corresponden al adaptador sin fusionar y a un conjunto de test sintético generado por plantillas; el 69 % de las consultas de test comparten plantilla con alguna de entrenamiento, por lo que las cifras son en distribución y optimistas.
- El checkpoint Q8_0 distribuido en este repositorio no ha sido evaluado; el propio autor recomienda repetir la evaluación antes de confiar en él.
- Alucinación de etiquetas: la model card documenta que el modelo llegó a producir la intención `card_status`, que no figura entre las 20 clases válidas. Cualquier integración debe validar la salida contra la lista cerrada de intenciones y descartar o corregir valores fuera de catálogo.
- Riesgo de generalización limitado a plantillas: en el subconjunto de test con plantillas no vistas la precisión baja al 94,87 %, lo que anticipa una degradación mayor con formulaciones fuera de distribución, abreviaturas, errores ortográficos o variantes dialectales del nepalí romanizado.
- Sensibilidad al prompt: el modelo requiere exactamente el prompt de sistema de entrenamiento y decodificación greedy; cambios en el prompt o en los parámetros de muestreo pueden degradar el formato JSON.
- Idiomas: solo nepalí romanizado e inglés. No hay evidencia de soporte para escritura devanagari ni para otros idiomas, y el modelo base podría responder en idiomas no deseados si no se restringe la salida.
- Dominio cerrado: está ajustado para consultas bancarias; no es un modelo de propósito general fiable para otras tareas pese a derivar de un Instruct de 8B.
- Limitaciones de contexto: no se documenta en esta ficha la longitud de contexto efectiva tras el ajuste; el modelo base admite 8.192 tokens, pero las consultas de entrenamiento son frases cortas.
- Licencia: se rige por la Llama 3 Community License, con las obligaciones habituales (atribución "Built with Meta Llama 3", cesión de la licencia a terceros y restricciones de uso para productos con más de 700 millones de usuarios activos mensuales). Hay que revisar el texto completo antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no hay pipeline declarado ni documentación de despliegue en producción más allá del ejemplo con Ollama.
- Privacidad: al ejecutarse localmente es adecuado para datos financieros sensibles, pero si se despliega en un endpoint remoto hay que aplicar las garantías de tratamiento de datos correspondientes.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/nishaantshah/nepglish-nlu-v4-GGUF
- Adaptador original (origen de las métricas y de la lista de las 20 intenciones): https://huggingface.co/nishaantshah/nepglish-nlu-v4
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- llama.cpp (herramienta de cuantización y ejecución): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
