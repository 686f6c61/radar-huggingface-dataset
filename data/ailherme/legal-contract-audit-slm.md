# AILHERME/legal-contract-audit-slm

## Resumen

El modelo `AILHERME/legal-contract-audit-slm` es un ajuste fino de la familia Qwen 2.5 Instruct (la model card indica 3B/1.5B) orientado a la auditoría automatizada de contratos y a la generación de redlines (propuestas de modificación de cláusulas) desde una doble perspectiva: defensa del `CONTRATANTE` (comprador) o de la `CONTRATADA` (proveedor). Lo publica el usuario AILHERME en Hugging Face y se distribuye principalmente como GGUF para ejecución local, con la etiqueta `litert-lm` que apunta a despliegue en dispositivos y entornos de inferencia ligera.

El problema que aborda es concreto: revisar contratos con criterios de riesgo y producir salidas estructuradas en JSON canónicas para un supuesto "Legal ERP". El enfoque es deliberadamente *privacy-first*: ejecución en aire aislado (*air-gapped*) mediante Ollama y GGUF, sin coste de inferencia en la nube. Por el número de parámetros reportado en los safetensors (3.085.938.688, es decir, unos 3,09 mil millones), el modelo base real es la variante de 3B, no la de 1.5B.

Es relevante ahora porque cubre un nicho poco servido por modelos abiertos: el análisis contractual con perspectiva definida y salida estructurada, sin depender de APIs externas. No obstante, la información pública es muy escasa (50 descargas, sin likes, sin pipeline declarado, sin licencia ni idiomas especificados) y la model card no aporta datos de entrenamiento, benchmarks numéricos ni detalles de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen 2.5 3B/1.5B Instruct, según model card) |
| Parametros totales | 3.085.938.688 (~3,09 B, según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas); etiqueta `litert-lm` |
| Idiomas soportados | no disponible (la model card usa terminología en portugués y castellano) |
| Licencia | no disponible |
| Formato de pesos | GGUF; repositorio de 2,4 GB; etiqueta `litert-lm` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado sobre Qwen 2.5 Instruct, una arquitectura transformer densa con atención estándar. El número de parámetros en safetensors (3,09 B) coincide con la variante de 3B de Qwen 2.5, por lo que la mención a 1.5B en la model card debe interpretarse como una referencia a la familia base, no al checkpoint publicado.

No se han publicado detalles sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o preferencias. La model card menciona que el modelo está "calibrado" contra los estándares Stanford Contract-NLI y Atticus CUAD, pero no aporta métricas, particiones de evaluación ni metodología. La innovación declarada es funcional, no arquitectónica: doble perspectiva (comprador/proveedor) y despacho de JSON canónico para integración con un ERP legal.

## Capacidades

- Auditoría de contratos: identificación de cláusulas de riesgo y evaluación desde la posición de `CONTRATANTE` o `CONTRATADA`.
- Redlining: generación de propuestas de modificación de cláusulas alineadas con la perspectiva elegida.
- Salida estructurada: emisión de JSON canónico para "Legal ERP" (esquema no documentado públicamente).
- Conversación multi-turno: la etiqueta `conversational` sugiere uso en diálogo, aunque no se detalla el soporte de contexto largo.
- Ejecución local y *air-gapped*: pensado para Ollama y GGUF, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse tras una API compatible.
- Tool calling / function calling: no disponible (no declarado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no declarado).
- Multilingüismo: no disponible (la model card mezcla portugués y castellano).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión de contratos de compraventa: el modelo analiza cláusulas desde la perspectiva del `CONTRATANTE` y señala riesgos, permitiendo a un equipo legal priorizar la negociación sin enviar el documento a terceros.
- Redlining de contratos de proveedor: con la perspectiva `CONTRATADA`, genera modificaciones que protegen al proveedor (limitaciones de responsabilidad, plazos de pago), útil para equipos comerciales que negocian plantillas.
- Despliegue en despachos con requisitos de confidencialidad: al ejecutarse en local vía GGUF/Ollama, el contenido contractual no sale de la infraestructura del despacho, lo que encaja con obligaciones de secreto profesional.
- Integración con ERP legal: la salida JSON canónica permite volcar resultados de auditoría a un sistema de gestión contractual sin post-procesado manual extenso.
- Triaje de contratos en volumen: clasificación y marcado de cláusulas de riesgo en lotes de contratos antes de la revisión humana, reduciendo el tiempo de primera pasada.
- Formación y simulación de negociación: generar redlines alternativos desde ambas perspectivas para entrenar a equipos legales en la identificación de posiciones contrapuestas.
- Prototipos en dispositivos: la etiqueta `litert-lm` sugiere experimentación con inferencia en hardware ligero, aunque no hay datos de rendimiento que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona calibración contra Stanford Contract-NLI y Atticus CUAD, pero no incluye cifras, por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~3,09 B, en FP16 se requieren aproximadamente 6,2 GB solo de pesos; en cuantización Q8 ronda los 3,3 GB; en Q4, alrededor de 1,8–2 GB. Son estimaciones por tamaño, no medidas publicadas.
- GPU recomendadas: no disponible (no hay datos del autor). Por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 permitirían FP16 con holgura; A100/H100 no serían necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en cuantizaciones Q4/Q8; en FP16 conviene 8–12 GB.
- Opciones de despliegue: Ollama y llama.cpp por el formato GGUF; LiteRT-LM por la etiqueta de librería; servidores compatibles con endpoints OpenAI-style por la etiqueta `endpoints_compatible`. vLLM y TGI no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legal-contract-audit-slm (este) | ~3,09 B | no disponible | Auditoría contractual y redlining con doble perspectiva | no disponible | Hugging Face, GGUF |
| Qwen 2.5 3B Instruct (base) | ~3,09 B | 32.768 tokens (según documentación del base) | Propósito general, instrucciones | Apache 2.0 (según el base) | Hugging Face, amplia cuantización |
| Modelos legales abiertos de 7B (p. ej. variantes fine-tuneadas de Llama/Mistral) | ~7 B | variable | Análisis legal general | variable según base | Hugging Face |

La comparación con alternativas legales específicas no está disponible con datos verificables en la información proporcionada; las filas de la base y de modelos de 7B se incluyen solo como referencia de categoría, no como evaluación de rendimiento.

## Limitaciones y advertencias

- Información pública muy escasa: sin licencia declarada, sin idiomas, sin pipeline y sin detalles de entrenamiento; evaluar antes de uso en producción.
- Riesgo de alucinación: un modelo de ~3 B ajustado para derecho puede inventar cláusulas, referencias normativas o interpretaciones; requiere revisión humana obligatoria.
- Sesgos: no documentados; el ajuste con doble perspectiva puede introducir sesgo hacia una de las partes si el dataset de entrenamiento estuvo desequilibrado.
- Contexto: longitud no especificada; los contratos largos pueden exceder la ventana y requerir troceado, con pérdida de coherencia entre cláusulas.
- Idioma: no declarado; la model card mezcla portugués y castellano, por lo que el rendimiento en castellano de España no está garantizado.
- Licencia: al no estar disponible, no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen 2.5 condiciona la redistribución.
- Formato JSON canónico: el esquema del "Legal ERP" no está documentado, lo que dificulta la integración sin ingeniería inversa.
- Madurez: 50 descargas y 0 likes indican un modelo muy reciente y sin validación comunitaria; no hay evidencia de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AILHERME/legal-contract-audit-slm
- Stanford Contract-NLI (referencia citada en la model card): https://stanfordnlp.github.io/contract-nli/
- Atticus CUAD (referencia citada en la model card): https://www.atticusprojectai.org/cuad
- Qwen 2.5 (familia base): https://huggingface.co/Qwen
- Ollama: https://ollama.com
- LiteRT-LM: https://ai.google.dev/edge/litert
