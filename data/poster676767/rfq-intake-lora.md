# Poster676767/rfq-intake-lora

## Resumen

rfq-intake-lora es un adaptador LoRA de clasificación de texto entrenado sobre TinyLlama/TinyLlama-1.1B-Chat-v1.0, un modelo de 1.100 millones de parámetros con arquitectura transformer decoder-only. El autor, Poster676767, lo ha publicado como adaptador PEFT para resolver una tarea muy acotada: clasificar solicitudes de cotización (RFQ) en inglés, relativas a piezas de recambio de herramientas de pilotaje, en cinco categorías (complete, missing, unclear, conflict, out_of_scope) con una puntuación de confianza asociada. El modelo sustituye un clasificador provisional dentro de un flujo de automatización n8n, antes de que un agente de revisión prepare un registro pending_review.

Se trata de un modelo de nicho, no de propósito general: la cabeza de clasificación tiene 5 salidas y el entrenamiento se ha realizado con 300 consultas ficticias redactadas por el autor, 200 para entrenamiento, 50 para validación y 50 para test. Los resultados publicados son modestos: 52 % de accuracy en test (26/50) y 58 % en validación (29/50). El modelo no identifica correctamente ninguna de las 10 solicitudes missing del conjunto de test, por lo que su utilidad práctica queda limitada a experimentación o a etapas iniciales de un pipeline con revisión humana obligatoria.

La relevancia actual es escasa fuera del contexto del proyecto original: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, la licencia no está declarada y el tamaño del repo es de 0,0 GB. Resulta útil como ejemplo de adaptación PEFT para clasificación con pocos datos y como caso de estudio de las limitaciones de TinyLlama en tareas de discriminación fina entre categorías solapadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama-1.1B-Chat) con adaptador LoRA y cabeza de clasificación de 5 salidas |
| Parámetros totales | 1.100 millones (modelo base); el adaptador LoRA añade un número no disponible de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (TinyLlama-1.1B-Chat declara 2.048 tokens en su model card original, dato no confirmado en este repositorio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama/TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1.100 millones de parámetros derivado de la familia Llama. El autor reformula la tarea como clasificación de secuencia: la cabeza del modelo se sustituye por una capa lineal de 5 salidas, en el orden complete, missing, unclear, conflict y out_of_scope. El entrenamiento LoRA se configura con 3 épocas, batch size 8 y learning rate 0,0002; no se especifican ni el rank ni el alpha del adaptador, ni la longitud máxima de secuencia empleada.

Los datos son 300 consultas ficticias redactadas manualmente por el autor, 60 por categoría, divididas en 40 de entrenamiento, 10 de validación y 10 de test por categoría (200/50/50 en total). El autor indica que variantes de redacción relacionadas se mantienen en el mismo split para evitar fuga de información entre particiones. No se documenta el uso de RLHF, DPO ni aumentación de datos, ni la composición lingüística más allá del inglés. No hay innovaciones técnicas destacables: es una adaptación PEFT convencional sobre un modelo base pequeño.

## Capacidades

- Clasificación de texto en inglés en 5 categorías cerradas (complete, missing, unclear, conflict, out_of_scope) para mensajes cortos de solicitud de cotización de piezas de recambio de herramientas de pilotaje.
- Procesamiento conjunto del cuerpo del mensaje y del texto de los adjuntos, con cada fuente etiquetada en la entrada.
- Salida de puntuación de confianza junto con la etiqueta predicha.
- Integración en flujos n8n como clasificador previo a un agente de revisión.
- No dispone de generación de texto libre, tool calling, function calling, capacidades de agente, visión, audio ni modo thinking.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Triaje inicial de RFQ en un pipeline de automatización: clasificar cada solicitud entrante en una de las cinco categorías antes de que un agente de revisión decida si genera un registro pending_review. Adecuado solo como primera pasada, dado el 52 % de accuracy en test.
- Enrutamiento a colas de revisión humana: usar la puntuación de confianza para derivar a revisión manual las predicciones con baja certeza, especialmente las que caen en unclear, categoría que concentra los errores observados.
- Detección de solicitudes conflictivas: el modelo clasifica correctamente 9 de 10 casos conflict del test, por lo que puede emplearse como señal de alerta para RFQ con información contradictoria entre cuerpo y adjuntos.
- Filtrado de solicitudes fuera de alcance: con 8 de 10 aciertos en out_of_scope, sirve para descartar preliminarmente consultas que no corresponden al catálogo de piezas de pilotaje.
- Prototipado de clasificadores PEFT con pocos datos: replicar el flujo (TinyLlama + LoRA + cabeza de 5 salidas, 200 ejemplos de entrenamiento) como plantilla para experimentos de clasificación de nicho con recursos limitados.
- Pruebas de aceptación de workflows n8n: comparar las predicciones del modelo con el conjunto de aceptación del flujo para detectar regresiones tras cambios en el prompt o en el preprocesado.
- Evaluación académica de límites de TinyLlama: usar el modelo como caso de estudio de la dificultad de separar categorías solapadas (missing, unclear, complete) con un modelo base de 1.100 millones de parámetros.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Accuracy en test (50 ejemplos) | 52 % (26/50) |
| Accuracy en validación (50 ejemplos) | 58 % (29/50) |
| Conflict en test | 9/10 correctos |
| Out_of_scope en test | 8/10 correctos |
| Missing en test | 0/10 correctos |
| Complete clasificados como unclear | 6 casos |
| Missing clasificados como unclear | 8 casos (error más frecuente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los del conjunto de test propio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un transformer de 1.100 millones de parámetros en fp16 requiere aproximadamente 2,2 GB solo para pesos, más overhead de activaciones y del adaptador; en cuantización de 8 bits o 4 bits el peso cae por debajo de 1,5 GB, pero estas cifras no están confirmadas para este repositorio.
- GPU recomendadas: no disponibles. El autor verifica la carga en una sesión CPU fresca (imagen reload_check.jpg), lo que indica que el modelo funciona en CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta ninguna prueba con GPU concretas (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: la librería declarada es peft; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Para clasificación con cabeza personalizada, llama.cpp y Ollama no son opciones directas sin conversión adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rfq-intake-lora | 1.100 M (base) + LoRA | no disponible | Clasificación 5 clases (RFQ) | no disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1.100 M | 2.048 tokens (según model card del base) | Chat/generación general | Apache 2.0 (según model card del base) | Hugging Face, ampliamente descargado |
| Adaptadores LoRA de clasificación sobre TinyLlama | ~1.100 M (base) | depende del base | Clasificación de nicho | variable según autor | Hugging Face, disponibilidad variable |

No se dispone de datos de rendimiento comparables de otros clasificadores RFQ en la información proporcionada. La comparación con el modelo base solo permite señalar que este adaptador sacrifica la capacidad generativa general a cambio de una cabeza de clasificación específica.

## Limitaciones y advertencias

- Accuracy baja: 52 % en test y 58 % en validación, insuficiente para automatizar decisiones sin revisión humana.
- No detecta ninguna solicitud missing en test (0/10); confunde sistemáticamente missing con unclear (8 casos) y complete con unclear (6 casos).
- Dificultad documentada por el autor para separar las categorías missing, unclear y complete.
- Entrenado con 300 mensajes ficticios cortos; el rendimiento decae previsiblemente con redacciones no vistas, mensajes largos y solicitudes que abarcan varios productos.
- Solo inglés; no se documenta comportamiento en otros idiomas.
- Licencia no declarada: no hay autorización explícita para uso comercial, lo que impide asumir permisos de explotación.
- El modelo no debe aprobar pedidos, confirmar compatibilidad de producto ni prometer precios o plazos de entrega, según el propio autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación no aplicable en sentido generativo (es clasificador), pero la puntuación de confianza puede no estar calibrada; no se documenta ningún análisis de calibración.
- Sesgos específicos del dominio y del dataset ficticio del autor; no se han evaluado sesgos demográficos o lingüísticos.

## Enlaces

- Hugging Face: https://huggingface.co/Poster676767/rfq-intake-lora
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
