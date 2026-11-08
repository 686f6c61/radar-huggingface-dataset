# chienhsinlin/helioslm-guard-e4b

## Resumen

HeliosLM Guard E4B (羲和 Guard E4B) es un modelo de clasificación de contenido seguro derivado de Google Gemma 4 E4B-it mediante ajuste fino con LoRA. Lo desarrolla el usuario chienhsinlin y está orientado a la moderación de contenido inseguro habitual en Taiwán: fraudes y phishing (falsos agentes de atención al cliente, falsas empresas de logística, falsas inversiones), captación financiera ilegal, desinformación sanitaria y alimentaria, discursos de odio contra colectivos, manipulación política (insultos, incitación o desinformación electoral contra cualquier partido) y contenido dañino genérico. Su particularidad es que trata de forma simétrica las opiniones políticas ordinarias y las críticas razonadas al Gobierno o a los partidos, clasificándolas como seguras independientemente del bando al que se dirijan.

El modelo tiene 7.518.069.290 parámetros totales según los pesos en safetensors, hereda la arquitectura y el contexto de Gemma 4 E4B-it y se distribuye tanto en formato GGUF cuantizado (Q4_K_M de 5,3 GB y Q8_0 de 8,0 GB) como en un adaptador LoRA para el modelo base. El repositorio ocupa 13,5 GB. La tarea se formula como una clasificación binaria generativa: se envía un prompt de sistema en chino tradicional junto al texto a evaluar, se hace prefill de `<score>` y se lee la probabilidad del siguiente token entre `yes` (inseguro) y `no` (seguro).

Es relevante porque cubre un nicho poco atendido: moderación en chino tradicional con sesgo específico hacia el contexto taiwanés, con pares de ejemplos políticos espejados para evitar sesgos partidistas y con métricas de neutralidad publicadas. La licencia es la Gemma Terms of Use, y el autor advierte explícitamente de que el modelo puede equivocarse y no debe usarse como único paso de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it, ajuste fino con LoRA) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información disponible) |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF Q8_0, bf16 (LoRA fusionado); adaptador LoRA sin cuantizar |
| Idiomas soportados | zh (chino tradicional), en |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors, GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E4B-it, un transformer instructivo, y se ajusta mediante LoRA durante 1,5 épocas. El conjunto de entrenamiento ronda los 30.000 ejemplos: la partición de entrenamiento de Aegis 2.0 (CC-BY-4.0, en inglés y con una traducción al chino tradicional) más unos 18.000 pares propios específicos de Taiwán de contenido dañino y de negativos difíciles (*hard negatives*), generados por un modelo Gemma 4 abierto y validados mediante votación de etiquetas. Los elementos políticos se construyeron en pares espejados para que cada formación reciba el mismo trato. El umbral de decisión se fijó sobre una partición de validación propia, nunca sobre el conjunto de test.

La innovación principal no es arquitectónica sino de formulación y de evaluación: el modelo se usa como clasificador generativo con un prompt fijo en chino tradicional (disponible en `prompt.txt`) y lectura de la probabilidad del token `yes`/`no` tras el prefill de `<score>`. Además, el autor publica una sonda de neutralidad con 7 formaciones políticas y distintos tipos de enunciados, y señala que la versión Q4_K_M obtuvo una puntuación igual o ligeramente superior al bf16 en su control de calidad en chino tradicional, por lo que la recomienda como archivo principal.

## Capacidades

- Clasificación binaria de seguridad de contenido (inseguro/seguro) mediante probabilidad del siguiente token.
- Detección de fraudes y phishing: falsos agentes de atención al cliente, falsas empresas de logística, engaños de "cancelación de pagos a plazos" y grupos de inversión falsos.
- Detección de captación financiera ilegal.
- Detección de desinformación sanitaria y alimentaria.
- Detección de discurso de odio contra colectivos, comunidades y género.
- Detección de manipulación política: insultos, incitación y desinformación electoral, con criterio simétrico entre formaciones.
- Tratamiento de opinión política ordinaria, crítica razonada al Gobierno o a partidos y debate sobre historia o soberanía como contenido seguro.
- Capacidades multilingües limitadas a chino tradicional e inglés.
- No se documentan tool calling, function calling, modo agente, visión ni audio en la información disponible.

## Casos de uso

- Moderación de comunidades en chino tradicional: el modelo se integra como filtro previo o posterior a la revisión humana en foros y redes, clasificando cada mensaje con el prompt fijo y aplicando el umbral de 0,5 sobre la probabilidad de `yes`.
- Detección de fraudes en atención al cliente: se puede enviar el texto de mensajes sospechosos (falsos agentes, falsas empresas de logística, engaños de pagos a plazos) al clasificador para marcar conversaciones que requieran revisión, aprovechando el entrenamiento específico con pares taiwaneses.
- Filtrado de captación financiera ilegal en canales de mensajería: el modelo distingue entre promociones legítimas y reclutamiento para grupos de inversión fraudulentos, lo que permite priorizar alertas en pipelines de compliance.
- Control de desinformación sanitaria y alimentaria: útil en plataformas de contenido o medios que necesiten señalar bulos sobre salud antes de su publicación, con revisión humana posterior dado el riesgo de falsos positivos.
- Moderación política simétrica: en plataformas con debate político, el modelo aplica el mismo criterio a todas las formaciones, lo que reduce la percepción de censura sesgada; la sonda de neutralidad publicada (0 marcados en opiniones ordinarias, 100 % marcados en insultos e incitación) sirve como referencia de calibración.
- Despliegue en local o en el borde con llama.cpp: el GGUF Q4_K_M de 5,3 GB permite ejecutar el clasificador en hardware modesto sin depender de servicios externos, adecuado para organizaciones con requisitos de privacidad sobre el texto moderado.
- Evaluación de calidad de datasets de moderación: el adaptador LoRA y el prompt permiten reproducir la clasificación sobre corpus propios y comparar con el modelo base en modo zero-shot, como hace el autor con ToxicChat y Aegis 2.0.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor (2026-11-06), F1 para la clase "inseguro", bf16 con LoRA fusionado en vLLM, umbral 0,5, mismo prompt y arnés para ambas filas:

| Conjunto de test | HeliosLM Guard E4B | Gemma 4 E4B-it (base, zero-shot) |
|---|---|---|
| ToxicChat 0124 test | 0,744 | 0,646 |
| Aegis 2.0 test | 0,870 | 0,775 |

Sonda de neutralidad: 7 formaciones políticas × 8 enunciados de opinión ordinaria → 0 marcados; 7 formaciones × 5 insultos/incitación → 100 % marcados; 10 temas sensibles de historia y soberanía → 0 marcados. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,3 GB para el GGUF Q4_K_M, 8,0 GB para el Q8_0 y en torno a 15 GB para bf16 (7.518 millones de parámetros a 2 bytes por parámetro, más overhead).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090 (24 GB) cubre todas las variantes, y una GPU de 8 GB puede ejecutar el Q4_K_M con holgura.
- Cabe en GPU de consumo: sí, el Q4_K_M en tarjetas de 8 GB o más y el Q8_0 en tarjetas de 12 GB o más.
- Opciones de despliegue: llama.cpp (uso documentado por el autor con el prompt de `prompt.txt`), vLLM para bf16 con LoRA fusionado; no se documentan Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 unsafe (ToxicChat) | F1 unsafe (Aegis 2.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeliosLM Guard E4B | 7.518 M | no disponible | 0,744 | 0,870 | Gemma Terms of Use | Hugging Face (safetensors, GGUF, LoRA) |
| Gemma 4 E4B-it (base, zero-shot) | no disponible | no disponible | 0,646 | 0,775 | Gemma Terms of Use | Hugging Face |
| helioslm-chat-e4b | ~8B (según la búsqueda) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de helioslm-chat-e4b ni de otros clasificadores de moderación comparables en la información proporcionada; la comparación con el modelo base es la única con métricas publicadas.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede cometer errores y no debe usarse como único paso de moderación.
- Los benchmarks son autodeclarados y ejecutados por el autor con su propio arnés y umbral, sin validación independiente.
- El entrenamiento se centra en el contexto taiwanés y en chino tradicional; el rendimiento en otras variantes del chino o en otros contextos culturales no está documentado.
- Solo cubre chino tradicional e inglés; no hay soporte declarado para otras lenguas.
- Riesgo de falsos positivos en textos que mencionen términos sensibles (fraude, salud, política) sin ser dañinos, y de falsos negativos en formatos o jergas no representados en el corpus de entrenamiento.
- La licencia Gemma Terms of Use impone restricciones y obligaciones específicas para uso comercial; deben revisarse antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en producción ni de validación por terceros.
- El umbral de 0,5 está calibrado sobre datos propios; en otros dominios puede requerir reajuste.
- No se especifica la longitud de contexto efectiva del modelo ajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-guard-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo relacionado helioslm-chat-e4b: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Modelo relacionado helioslm: https://huggingface.co/chienhsinlin/helioslm
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
