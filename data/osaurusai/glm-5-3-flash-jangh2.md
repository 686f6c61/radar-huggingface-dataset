# OsaurusAI/GLM-5.3-Flash-JANGH2

) etc.

Hardware requirements:
- VRAM/memoria unificada: el bundle ocupa 95,89 GiB; repo 103 GB → requiere un Mac con 128 GB de memoria unificada
- GPU: Apple Silicon (M-series con 128 GB); no diseñado para CUDA
- Cabe en consumer GPU? No: el formato es MLX; no hay variante GGUF ni CUDA publicada
- Despliegue: runtime Osaurus 0.25.15 o superior; formato MLX. No cargable por loaders JANGTQ v1. vLLM/llama.cpp/TGI no disponibles para este bundle
- Latencia y throughput: no disponible (se menciona "faster decode" que la versión afín anterior, sin cifras)

Casos de uso: mínimo 6, concretos. Given the model is a vision+video+reasoning+agent model for 128 GB Macs:
1. Asistente de razonamiento largo local en Mac (thinking mode con presupuesto hasta 40k tokens)
2. Agentes con tool calling / function calling multi-paso
3. Análisis de código y razonamiento de diseño de software
4. Procesamiento de documentos con imagen (image-text-to-text)
5. Análisis de vídeo (torre de vídeo)
6. Desarrollo sin conexión / soberanía de datos en Mac
7. Sustitución de un modelo FP8 en servidores con hardware Apple para prototipado
8. Evaluación/calibración de cuantizaciones (research)

Limitations:
- Discrepancia de parámetros
- Solo inglés
- Licencia MIT del bundle, pero el modelo base zai-org/GLM-5.3-Flash puede tener su propia licencia — I should be careful: base model license not stated in provided info. I'll say "no disponible en la información proporcionada".
- Revisiones: revision 1 no terminaba el razonamiento largo; asegurarse de tener la revisión 2 (comprobar scale_correction en jang_config.json)
- No inventar: cuantización agresiva 2-3 bits produce pérdida de fidelidad (KL frente a bf16)
- Tabla agentic: top-1 agreement 57.3% vs bf16 → desviaciones
- Compatibilidad: no cargable por JANGTQ v1
- Sin datos de benchmarks estándar
- Sesgos: no disponible
- Alucinación: riesgo inherente; baja P(</think>) en revisión 1 → degradación en repetición
- 0 descargas, 0 likes, no validación comunitaria

Comparativa table: compared to previous affine JANG release, orcarouter 2bit-lite, bf16 base.

I'll do a table with rows: modelo, tamaño, params, contexto, KL mediana, top-1, licencia, disponibilidad.

Enlaces:
- https://huggingface.co/OsaurusAI/GLM-5.3-Flash-JANGH2
- https://huggingface.co/zai-org/GLM-5.3-Flash
- https://osaurus.ai
- https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANG
- GLM-5.3-Flash-JANG-MTP
- GLM-5.3-Flash-JANGTQ2 (publicado brevemente, según la model card)
- Nota: los resultados de búsqueda web no contenían información relevante sobre el modelo.

Note the "osaurus-x-banner.png" in the repo.

Now write it. Keep it rigorous and honest about missing data.

One thing: the base model card mentions "300B-class MoE" — but the safetensors says 32.6B. I'll flag as "discrepancia".

Also created/updated dates: 2026-09-30 — future dates in this scenario. Fine, mention in specs maybe. I'll add row "Fecha de publicación | 30 de septiembre de 2026 (revisión 2: misma fecha)". Hmm, updated 23:59 same day. I'll just put "30 de septiembre de 2026".

Write now.## Resumen

GLM-5.3-Flash-JANGH2 es una redistribución cuantizada del modelo zai-org/GLM-5.3-Flash publicada por OsaurusAI. No es un entrenamiento nuevo: es un bundle de pesos en formato JANGH pensado para ejecutarse en Macs Apple Silicon con 128 GB de memoria unificada mediante el runtime Osaurus (versión 0.25.15 o superior) y la librería MLX. El modelo base es un MoE de "clase 300B" con 288 expertos enrutados (top-8 más un experto compartido), atención lineal KDA, atención dispersa y torres de visión y vídeo.

El interés de esta ficha está en la estrategia de cuantización: los expertos enrutados se comprimen a 2-3 bits con un codebook de dos constantes por anchura, escalas por fila y una rotación Hadamard-32 por bloques, calibrada con GPTQ y una matriz de importancia por experto; el resto de matrices se mantiene a 8 bits (MXFP8 o afín) y la torre de visión en bf16. La revisión 2 corrige únicamente las escalas por fila de los expertos enrutados para que el modelo pueda cerrar razonamientos largos con `</think>`.

El bundle ocupa 95,89 GiB (repositorio de 103 GB) y declara licencia MIT. Está orientado a razonamiento, agentes con tool calling, visión y vídeo, en inglés. La model card aporta métricas de fidelidad frente al modelo FP8 oficial y frente al bf16, pero no incluye benchmarks estándar tipo MMLU o HumanEval.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con 288 expertos enrutados (top-8 + experto compartido), atención lineal KDA, atención dispersa y torres de visión y vídeo; redistribución cuantizada JANGH sobre MLX |
| Parametros totales | 32.610.451.262 (32,6 B) según los safetensors del repositorio; la model card describe el modelo base como "MoE de clase 300B". Discrepancia no resuelta con la información disponible |
| Parametros activos | no disponible (top-8 de 288 expertos enrutados más experto compartido, sin recuento publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: JANGH a 2-3 bits (codebook de dos constantes por anchura, escalas por fila, Hadamard-32 por bloques, GPTQ + importance matrix por experto, bits asignados por capa según medición). Resto de matrices: 8 bits (MXFP8 donde el peso original está en rejilla FP8-MX, afín en el resto) o precisión completa. Torre de visión: bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors con empaquetado MLX; tensores `*.tq2_packed` y `*.tq2_scales`; bloque `jangtq` (`version: 2`) en `config.json` y `"mode": "jangtq2"` por módulo |
| Tamano del bundle | 95,89 GiB (repositorio: 103 GB) |
| Runtime requerido | Osaurus 0.25.15 o superior (`required_osaurus_version`; `model_version` 2 = revisión 2) |
| Fecha de publicacion | 30 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión de pesos del modelo base zai-org/GLM-5.3-Flash. La arquitectura subyacente es un MoE de 288 expertos enrutados con enrutamiento top-8 más un experto compartido, sobre 42 capas MoE, con atención lineal KDA y atención dispersa, además de torres específicas de visión y vídeo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

La innovación técnica está en el formato JANGH, que sustituye al anterior JANGTQ (TurboQuant). Frente a este, elimina la rotación de signos aleatorios con semilla y el codebook por dimensión basado en distribución Beta, y emplea una transformada Hadamard-32 fija por bloques y un codebook de dos constantes por anchura de bits, almacenado bit a bit en el empaquetado nativo de MLX para reutilizar la estructura de kernels de MLX en decodificación y prefill. Por compatibilidad, los identificadores en disco conservan los nombres antiguos (`jangtq`, `jangtq2`, `*.tq2_packed`), pero el bundle no es cargable por loaders de JANGTQ v1. La revisión 2 modifica solo 126 tensores pequeños (escalas por fila de los expertos enrutados) para restaurar la probabilidad de emitir `</think>`; el tamaño, el formato y la velocidad no cambian.

## Capacidades

- Generación de texto y razonamiento extenso en modo "thinking", con cierre autónomo del bloque de razonamiento mediante `</think>` (corregido en la revisión 2).
- Razonamiento de diseño y de código con cadenas de pensamiento largas (la model card menciona tareas que requieren 17.000-23.000 tokens de razonamiento).
- Tool calling y function calling: el bundle conserva la fidelidad de las decisiones de llamada a herramienta frente al bf16 (50/50 decisiones idénticas en la batería de 114 puntos de decisión).
- Flujos de agente multi-paso con resultados de herramientas intercalados en la conversación.
- Comprensión de imagen y de vídeo mediante torre de visión en bf16 y torre de vídeo (pipeline declarado: `image-text-to-text`).
- Multilingüe: solo inglés declarado.
- Gestión de esfuerzo de razonamiento: la model card menciona niveles `low`, `high` y `max`, con presupuesto de hasta 40.000 tokens en el nivel máximo.
- No se documentan capacidades de audio ni de generación de imagen.

## Casos de uso

- Asistente de razonamiento local en Mac: el bundle cabe en 128 GB de memoria unificada y permite ejecutar cadenas de razonamiento de decenas de miles de tokens sin enviar datos a la nube, útil para trabajo confidencial o sin conectividad.
- Agentes con tool calling en escritorio: se puede integrar como motor de decisión "llamar herramienta o responder" en un orquestador local; la model card reporta 50/50 decisiones idénticas al bf16 y una probabilidad mediana de 0,999 en los puntos de llamada.
- Revisión y generación de código en pipelines locales: el modelo mantiene fidelidad top-1 del 82,6% frente al bf16 en transcripciones reales de razonamiento de código, lo que permite usarlo para refactorización o revisión asistida, con validación humana de las salidas.
- Análisis de documentos con imagen: al aceptar entrada image-text-to-text, sirve para extraer y razonar sobre diagramas, capturas de interfaz o documentación escaneada dentro de un flujo de trabajo local.
- Análisis de vídeo: la torre de vídeo permite resumir o describir contenido audiovisual, por ejemplo para catalogación de material grabado en un entorno sin subida a servicios externos.
- Sustitución de una implementación FP8 en hardware Apple: equipos que hoy sirven el modelo oficial en FP8 pueden usar este bundle para prototipar en Macs de 128 GB, con una KL mediana de 0,0301 frente a la release FP8 oficial.
- Investigación en cuantización: el bundle sirve como referencia reproducible de un esquema de 2-3 bits por experto con corrección de escalas, útil para comparar metodologías de cuantización post-entrenamiento.
- Procesamiento por lotes durante la noche: con 0 descargas y sin datos de throughput publicados, encaja mejor en cargas no interactivas donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización, que se reproducen a continuación.

Calidad frente a la release FP8 oficial (15.830 posiciones con teacher forcing en prompts retenidos, KL renormalizada top-128):

| Bundle | Tamano | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| GLM-5.3-Flash-JANGH2 | 95,89 GiB | 0,0301 | 0,376 | 0,98 / 1,97 / 5,24 | 83,9 % | 96,8 % | 98,3 % |
| GLM-5.3-Flash-JANG (afín, release anterior) | 95,35 GiB | 0,0882 | 0,528 | 1,50 / 2,55 / 5,67 | 78,6 % | 94,6 % | 96,8 % |
| orcarouter GLM-5.3-Flash-MLX `2bit-lite` | 95,4 GiB | 0,2122 | 0,83 | no disponible | 71,4 % | 90,8 % | 94,3 % |

Fidelidad frente al modelo bf16 en transcripciones reales (16 transcripciones retenidas, 60.243 posiciones de asistente):

| Metrica | JANGH2 | JANG afín (anterior) |
|---|---|---|
| Concordancia top-1 con bf16 | 82,6 % | 77,1 % |
| KL mediana vs bf16 | 0,069 | 0,158 |
| KL media vs bf16 | 0,218 | 0,356 |
| Puntos de tool call con `<tool_call>` como primera opción | 40 / 41 | 35 / 41 |
| P(`<tool_call>`) mediana en esos puntos | 0,9998 | 0,968 |
| P(`<tool_call>`) mínima en esos puntos | 0,165 | 0,245 |

Fidelidad agéntica frente al bf16 (72 conversaciones retenidas de uso de herramientas, 25.867 posiciones, 114 puntos de decisión):

| Metrica | JANGH2 | JANG afín (anterior) |
|---|---|---|
| KL mediana vs bf16 | 0,579 | 0,595 |
| Concordancia top-1 con bf16 | 57,3 % | 54,9 % |
| Decisiones de llamada idénticas a bf16 | 50 / 50 | 50 / 50 |
| P(`<tool_call>`) mediana en puntos de llamada (bf16: 0,998) | 0,999 | 0,981 |
| P(`<tool_call>`) mínima en un punto de llamada | 0,914 | 0,784 |
| Decisiones de respuesta con mismo siguiente token que bf16 | 87,5 % | 50,0 % |
| Decisiones invertidas llamada ↔ respuesta vs bf16 | 0 | 3 |

Terminación del razonamiento largo (probabilidad de `</think>`):

| Escenario | bf16 | Revision 2 | Revision 1 | JANG afín (anterior) |
|---|---|---|---|---|
| Tarea de diseño retenida, tras 8.025 tokens de razonamiento | 0,82 | 0,75 | 0,03 | 0,02 |
| Tarea de código, tras 3.288 tokens de razonamiento | 0,99 | 0,94 | 0,19 | no disponible |

En pruebas servidas con muestreo del proveedor, la revisión 2 cerró el razonamiento en 3/3 casos con esfuerzo `low`, 2/2 con `high` y 1/1 con `max` (presupuesto de 40.000 tokens); la revisión 1 no lo logró en 0/5 y 0/2 respectivamente.

## Requisitos de hardware

- Memoria: el bundle ocupa 95,89 GiB en disco, por lo que requiere un Mac con 128 GB de memoria unificada. El repositorio completo ocupa 103 GB.
- GPU: exclusivamente Apple Silicon (MLX). No hay variante CUDA ni ROCm publicada.
- ¿Cabe en GPU de consumo? No en el sentido habitual: requiere 128 GB de memoria unificada en un SoC de Apple. No está destinado a RTX 4090, A100 ni H100, porque el formato es MLX y el runtime indicado es Osaurus.
- Opciones de despliegue: runtime Osaurus 0.25.15 o superior, con `model_version` 2. No hay soporte publicado para vLLM, llama.cpp, Ollama o TGI, y el bundle no debe enrutarse a loaders de JANGTQ v1.
- Latencia y throughput: no disponibles. La model card afirma que la decodificación es más rápida que la de la release afín anterior, sin cifras concretas.
- Almacenamiento: reservar al menos 103 GB para el repositorio, más espacio temporal durante la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL mediana vs FP8 | top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-JANGH2 | 32,6 B declarados en safetensors (model card: clase 300B, no resuelto) | no disponible | 0,0301 | 83,9 % | MIT | Bundle MLX para Macs de 128 GB; 0 descargas |
| GLM-5.3-Flash-JANG (afín) | mismo modelo base | no disponible | 0,0882 | 78,6 % | MIT | Reemplazado por JANGH2 según la model card |
| orcarouter GLM-5.3-Flash-MLX `2bit-lite` | mismo modelo base | no disponible | 0,2122 | 71,4 % | no disponible | Bundle MLX alternativo |
| zai-org/GLM-5.3-Flash (bf16/FP8 de referencia) | mismo modelo base | no disponible | referencia | referencia | no disponible en la información proporcionada | Modelo original |

No se dispone de datos que permitan comparar este bundle con alternativas de otros fabricantes y tamaño similar (por ejemplo, otros MoE abiertos de la misma franja), por lo que la comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- Discrepancia de parámetros: los safetensors declaran 32,6 B de parámetros totales, mientras que la model card describe el modelo base como "MoE de clase 300B". Conviene verificar el conteo antes de planificar el despliegue.
- Solo inglés declarado. No hay soporte multilingüe documentado, y el castellano no aparece entre los idiomas soportados.
- Licencia: el bundle se publica bajo MIT, pero la licencia del modelo base zai-org/GLM-5.3-Flash no se especifica en la información proporcionada. Verificar antes de uso comercial.
- Cuantización agresiva: los expertos enrutados están a 2-3 bits. Aunque la KL mediana frente al FP8 oficial es de 0,0301, hay divergencias notables en la cola (p99 de 5,24) y la concordancia top-1 frente al bf16 baja al 57,3 % en transcripciones agénticas.
- Riesgo de razonamiento no terminado: la revisión 1 no cerraba cadenas largas de razonamiento y degradaba hacia repeticiones. Es imprescindible confirmar que la copia es la revisión 2 (debe existir una entrada `scale_correction` en `jang_config.json`).
- Fidelidad de tool calling no perfecta: aunque las decisiones de llamada coinciden con bf16 en 50/50 casos, la P(`<tool_call>`) mínima en un punto de llamada es 0,165 en la batería de transcripciones reales, lo que deja margen a fallos puntuales.
- Riesgo de alucinación: no hay evaluación publicada de veracidad ni de tasas de alucinación; se trata de un modelo de razonamiento cuantizado, con el riesgo inherente de generar contenido plausible pero incorrecto.
- Sesgos: no se ha publicado ningún análisis de sesgos en la información disponible.
- Compatibilidad: el formato JANGH reutiliza identificadores de JANGTQ pero no es cargable por loaders de JANGTQ v1; enrutarlo mal provoca errores de carga.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que la evaluación se limita a métricas internas de fidelidad de cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/GLM-5.3-Flash-JANGH2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Sitio del runtime: https://osaurus.ai
- Release anterior citada como reemplazada: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANG
- Variante mencionada como reemplazada: JANGQ-AI/GLM-5.3-Flash-JANG-MTP (https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANG-MTP)
- Nombre de publicación breve citado en la model card: GLM-5.3-Flash-JANGTQ2 (https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANGTQ2)
- Banner incluido en el repositorio: `osaurus-x-banner.png`
- Los resultados de la búsqueda web proporcionada no contenían información relevante sobre este modelo (correspondían a resultados de reservas de viajes), por lo que no se añaden más enlaces.
