# hwihwalab/Qwen2.5-3B-BrutalCritique-KoEn

## Resumen

Qwen2.5-3B-BrutalCritique-KoEn es un modelo de generación de texto bilingüe (coreano e inglés) desarrollado por Hwihwa Lab a partir de Qwen2.5-3B-Instruct de Alibaba. Su propósito es muy específico: actuar como un "mentor brutal" que elimina el halago innecesario, los preámbulos educados y la complacencia (sycophancy) típica de los LLM instruidos, entregando críticas directas y de alta señal sobre ideas de negocio, pitch de ventas, métricas de funnel, pricing, UX y revisiones de código.

La técnica diferencial es la abliteration dirigida mediante representation engineering: en lugar de un fine-tuning completo, se identifica la representación interna del "halago inútil" y se suprime quirúrgicamente en las capas intermedias seleccionadas (`o_proj` de atención y `down_proj` de MLP), dejando intactos los embeddings de tokens y las cabeceras de salida para preservar la inteligencia general del modelo base.

Es relevante porque aborda un problema real de usabilidad (la reticencia de los modelos a dar feedback honesto) con un footprint compacto de 3B parámetros, distribuido en formato GGUF cuantizado (Q4_K_M, ~1,9 GB), lo que lo hace ideal para ejecución local y privada en portátiles y estaciones de trabajo sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5), modificado con abliteration anti-sycophancy |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero no figura en la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Inglés y coreano (con registro informal "banmal" forzado en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (~1,9 GB en Q4_K_M) y safetensors (repo total de 10,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder denso de 3B parámetros. La modificación principal no es un ajuste fino por gradientes, sino una intervención de representation engineering (abliteration): se localiza la dirección latente asociada a la complacencia y al halago corporativo y se suprime proyectando las activaciones en las capas intermedias sensibles, identificadas mediante evaluación de pérdida por capa. Las ediciones se aplican solo a `o_proj` (salida de atención) y `down_proj` (salida de MLP), sin tocar los embeddings de tokens ni la cabeza de salida, lo que según el autor preserva la capacidad de razonamiento matemático, comprensión de sintaxis y formateo bilingüe.

La calibración del comportamiento se realizó con pares de contraste bilingües (inglés/coreano) cuidadosamente curados, cubriendo escenarios de validación de ideas, pricing, métricas de funnel, cold pitches y revisiones de código. Además, la plantilla ChatML con instrucciones de sistema (crítica directa, registro informal en coreano) viene empaquetada de forma nativa en los metadatos del GGUF, de modo que no es necesario configurar un system prompt manual. No se ha publicado información sobre el número de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de crítica directa y sin filtros de cortesía sobre ideas de negocio, planes de startup y decisiones estratégicas.
- Revisiones de código centradas en anti-patrones, priorizando artefactos concretos (drafts, copy, código) sobre ideas vagas.
- Diagnóstico de fricción de churn en UI/UX y feedback sobre pricing y métricas de funnel.
- Bilingüe: inglés y coreano, con enforcement nativo del registro informal coreano (banmal) mediante la plantilla ChatML embebida en el GGUF.
- Preservación de la inteligencia general del modelo base: razonamiento matemático, comprensión de sintaxis y formateo bilingüe permanecen intactos según el autor.
- Compatibilidad con razonamiento multi-paso y toma de decisiones (según tags del repositorio).
- Ejecución local y privada optimizada para Ollama, LM Studio y llama.cpp.
- No se menciona soporte de tool calling / function calling ni capacidades de visión o audio.

## Casos de uso

- Validación de ideas de startup: el emprendedor describe su idea y el modelo identifica fallos de mercado, riesgos y suposiciones no validadas sin edulcorar el veredicto, ideal para fases pre-producto.
- Revisión de cold pitches y emails de venta: analiza el copy real (no ideas abstractas) y señala frases débiles, falta de propuesta de valor y CTA ineficaces.
- Auditoría de pricing y métricas de funnel: solicita al usuario métricas concretas y las disecciona para detectar fugas de conversión o precios mal posicionados.
- Code review sin cortesías: revisión de anti-patrones en código durante desarrollo local, útil como segunda opinión rápida antes de un pull request.
- Crítica de UI/UX: evaluación de flujos de interfaz para identificar puntos de fricción que causan abandono de usuarios.
- Mentoría para solopreneurs y creadores: como interlocutor de "pensamiento crítico forzado" en sesiones de decisión, evitando el sesgo de confirmación que introducen los modelos complacientes.
- Uso en dispositivo (edge AI): gracias a su tamaño de 3B y ~1,9 GB en Q4_K_M, cabe en portátiles sin GPU para consultas privadas de negocio y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente afirma cualitativamente que la abliteration preserva las capacidades de razonamiento matemático, sintaxis y formateo del modelo base, y que Q4_K_M ofrece el mejor equilibrio entre velocidad, huella de memoria y perplejidad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,9 GB para el GGUF Q4_K_M más overhead de contexto; en la práctica, entre 2 y 4 GB de RAM/VRAM son suficientes según la ventana de contexto.
- GPU recomendada: no es necesaria; el modelo está pensado para CPU. Con GPU dedicada (por ejemplo una RTX 3060 o superior) la inferencia será notablemente más rápida, pero no se publican cifras de latencia ni throughput.
- Consumer hardware: cabe cómodamente en portátiles y sobremesa con 8 GB de RAM; no requiere GPU discreta.
- Despliegue: Ollama, LM Studio, llama.cpp (formato GGUF nativo). Los tags mencionan compatibilidad con vLLM y text-generation-inference para la versión safetensors.
- Parámetros de muestreo recomendados (críticos según el autor): temperatura 0,20; top-p 0,88; repetition penalty 1,05; stop tokens `<|im_end|>` y `<|im_start|>`; max tokens 250-350.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-BrutalCritique-KoEn | ~3,09 B | GGUF (Q4_K_M), safetensors | Crítica anti-sycophancy bilingüe (ko/en), abliterated | Apache-2.0 |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3,09 B | safetensors, GGUF comunitarios | Asistente general instruido | Qwen Research (uso no comercial < 100M MAU; Apache-2.0 para derivados con esa licencia) |
| Dolphin (derivados Qwen/Phi, p. ej. Dolphin3.0) | ~3 B | GGUF, safetensors | Modelo "uncensored" general mediante fine-tuning | Apache-2.0 / MIT según versión |

Nota: la comparativa se basa en la categoría (modelos 3B sin filtros o con comportamiento modificado). Qwen2.5-BrutalCritique se diferencia de los Dolphin en el método (abliteration quirúrgica frente a fine-tuning completo) y en su especialización vertical (mentor de negocio bilingüe coreano/inglés). Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- Alcance muy especializado: está optimizado para crítica directa; no es adecuado como asistente general, y su tono agresivo puede resultar inapropiado en contextos de atención al cliente o contenido público.
- Riesgo de alucinación: al ser un modelo de 3B abliterated, puede inventar datos, métricas o hechos con total seguridad; las críticas de negocio deben verificarse siempre.
- La abliteration elimina salvaguardas de seguridad del modelo base (tag "uncensored"/"abliterated"): puede generar contenido que el modelo original rechazaría. Usar con responsabilidad y no exponer a usuarios finales sin filtros adicionales.
- Sensibilidad a los parámetros de muestreo: el autor advierte que desviarse de la configuración recomendada (temperatura, stop tokens, max tokens) puede causar artefactos, regresión a honoríficos coreanos o mezcla de idiomas.
- Contexto: la model card no especifica la longitud de contexto; si se asume la del modelo base (32.768 tokens), documentos muy largos pueden degradar la calidad de la crítica.
- Idiomas limitados a inglés y coreano; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Licencia Apache-2.0: sin restricciones de uso comercial, pero hereda las condiciones del modelo base Qwen2.5, cuya licencia original tiene cláusulas para despliegues de gran escala (>100 millones de usuarios activos mensuales).
- Traction muy limitada (325 descargas, 1 like en el momento de la ficha): proyecto de autor independiente sin auditoría externa ni benchmarks publicados.

## Enlaces

- Ficha del modelo: https://huggingface.co/hwihwalab/Qwen2.5-3B-BrutalCritique-KoEn
- Documentación en coreano: https://huggingface.co/hwihwalab/Qwen2.5-3B-BrutalCritique-KoEn/blob/main/README_KR.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
