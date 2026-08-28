# AMAImedia/NOESIS-Talker-Combo-LLM2-ASR2-BF16

## Resumen

NOESIS-Talker-Combo-LLM2-ASR2-BF16 es un bundle de pesos y adaptadores para síntesis de voz (text-to-speech) publicado por AMAImedia como parte de su plataforma profesional de doblaje automatizado NOESIS. El modelo combina el backbone de Qwen3-TTS-1.7B con una fusión cross-modal en espacio de pesos (denominada "Darwin merge") que integra información de las ramas de Qwen3-1.7B (LLM) y Qwen3-ASR-1.7B, dando lugar a un "Talker" de 1.928.677.440 parámetros (~1,93B) en precisión BF16. Su propósito principal es la clonación de voz zero-shot y la síntesis multilingüe en hasta 112 idiomas, mediante un sistema de adaptadores LoRA por familia lingüística que se seleccionan dinámicamente sin fusionar todos los adaptadores en un único checkpoint destructivo.

La relevancia de este modelo radica en su enfoque de producción: no es un modelo independiente, sino un componente de un router de voz (Voice Router-Swap) que gestiona el cambio de adaptador según el idioma objetivo. El bundle incluye adaptadores entrenados sobre FLEURS y Common Voice 25.0, con un post-procesado GRPO/DPO, y se distribuye bajo licencia Apache-2.0. Aunque su lanzamiento está fechado en 2026, el modelo se apoya en la arquitectura Qwen3-TTS, lo que le permite heredar las capacidades de síntesis de habla de alta calidad de dicha familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-TTS-1.7B con fusión cross-modal (Darwin merge) de ramas LLM y ASR |
| Parametros totales | 1.928.677.440 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 nativo; existe un artefacto relacionado en AWQ INT4 (AMAImedia/Qwen3-1.7B-TTS-Cross-Darwin-NOESIS-AWQ-INT4) |
| Idiomas soportados | 112 (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kmr, kn, ko, ky, lb, lg, ln, lo, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, lt, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, ru, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, vi, wo, xh, yo, yue, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de fusión en dos etapas. En la primera, las ramas de Qwen3-TTS Base 1.7B y Qwen3-1.7B (LLM) se combinan en espacio de pesos para crear el checkpoint intermedio "Darwin-TTS-1.7B-Cross" (publicado por FINAL-Bench). En la segunda, se incorpora información de la rama ASR (Qwen3-ASR-1.7B) y se obtiene el "Combo" que constituye el backbone congelado de este bundle. Sobre ese backbone, AMAImedia entrenó adaptadores LoRA específicos por familia lingüística (rank r=8, scale 0.32, con variantes r=16 para las familias indic e iraní) utilizando los datasets FLEURS y Common Voice 25.0, seguidos de un post-procesado con GRPO y DPO. El diseño evita fusionar todos los adaptadores en un único checkpoint, optando por un esquema de selección dinámica por familia para preservar la calidad en cada idioma.

La arquitectura resultante es un modelo denso de 1,93B parámetros que opera a 12 Hz de frecuencia de muestreo de tokens de habla, similar a otros modelos de la familia Qwen3-TTS. No se dispone de información pública sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset multilingüe más allá de los dos corpus mencionados.

## Capacidades

- Síntesis de voz multilingüe en 112 idiomas, con selección automática de adaptador por familia lingüística.
- Clonación de voz zero-shot: puede replicar una voz de referencia sin entrenamiento adicional.
- Integración con un router de voz (Voice Router-Swap) que gestiona el cambio de adaptador en tiempo real según el idioma del segmento.
- Generación de habla a 12 Hz de resolución temporal, compatible con el ecosistema Qwen3-TTS.
- Soporte para adaptadores LoRA separados, lo que permite actualizar o añadir idiomas sin retrenar el modelo completo.
- No es un modelo de propósito general: no genera texto ni código, está especializado exclusivamente en síntesis de habla.

## Casos de uso

- Doblaje automatizado de películas y series: el modelo puede sintetizar diálogos en 112 idiomas manteniendo la voz del actor original mediante clonación zero-shot, lo que reduce drásticamente los costes de producción frente al doblaje tradicional.
- Localización de contenido educativo y corporativo: permite generar versiones multilingües de cursos, manuales o vídeos formativos con una única voz de referencia, acelerando el despliegue global de materiales.
- Asistentes de voz multilingües: integrado en un router, el modelo puede responder en el idioma del usuario final con una voz consistente, mejorando la experiencia en aplicaciones de atención al cliente.
- Accesibilidad: conversión de texto a voz en idiomas de baja representación (como kam, kea, mvy, qxp, umb) para personas con discapacidad visual o dificultades de lectura.
- Sistemas IVR y telemarketing automatizado: generación de locuciones naturales para menús telefónicos y campañas de voz en múltiples mercados sin necesidad de grabar cada idioma por separado.
- Creación de audiolibros multilingües: producción de versiones en varios idiomas de un mismo libro, manteniendo el estilo narrativo de una voz clonada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER en ASR inverso ni comparativas con otros sistemas TTS. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 3,86 GB solo en pesos (1,93B × 2 bytes). Con activaciones, KV cache y overhead del decodificador, se recomienda un mínimo de 8 GB de VRAM para inferencia con contexto corto.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para inferencia en BF16. Para despliegues concurrentes o con contexto largo, se recomienda RTX 4090, A100 o H100.
- Sí cabe en GPU de consumo: RTX 3060 12GB, RTX 4070, RTX 4090, así como en Apple Silicon con 16 GB unificados (usando cuantización INT4).
- Opciones de despliegue: el bundle está diseñado para cargarse dentro del router NOESIS, pero al ser compatible con el ecosistema Qwen3-TTS puede usarse con Transformers de HuggingFace. No se ha confirmado soporte para vLLM, llama.cpp u Ollama en la documentación disponible.
- Latencia y throughput: no disponible. Depende del hardware, la longitud del segmento y el adaptador seleccionado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NOESIS-Talker-Combo (este) | 1,93B | 112 | Sí | Apache-2.0 | Bundle con adaptadores |
| Qwen3-TTS-1.7B-Base | 1,7B | ~20 (estimado) | Sí | Apache-2.0 | Modelo base sin adaptadores multilingües |
| Darwin-TTS-1.7B-Cross | 1,7B | No especificado | Sí | Apache-2.0 | Checkpoint intermedio, sin adaptadores |
| XTTS v2 (Coqui) | ~0,9B | 17 | Sí | CPML (no comercial) | Modelo independiente |

La principal diferencia frente a Qwen3-TTS base es la expansión a 112 idiomas mediante adaptadores LoRA y la fusión cross-modal con ramas LLM y ASR. Frente a XTTS v2, este modelo ofrece una cobertura lingüística muy superior y una licencia más permisiva, aunque requiere el ecosistema NOESIS para su uso completo.

## Limitaciones y advertencias

- No es un modelo autónomo: depende del router NOESIS y del worker Qwen TTS de la plataforma para funcionar en producción. No se distribuye como una aplicación independiente.
- Rendimiento desigual entre idiomas: los adaptadores se entrenaron por familia lingüística, por lo que los idiomas con menos datos (p. ej., mvy, qxp, umb) pueden presentar una calidad de síntesis inferior a los mayoritarios.
- Riesgo de alucinación fonética: en idiomas poco representados o con ortografía irregular, el modelo puede pronunciar incorrectamente palabras o nombres propios.
- Sesgos potenciales: los datos de entrenamiento (FLEURS, Common Voice) pueden reflejar sesgos de género, acento o registro que se manifiestan en la voz sintetizada.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la atribución requerida y las condiciones de los datasets subyacentes.
- No se han publicado benchmarks objetivos, por lo que la calidad percibida debe validarse empíricamente antes de un despliegue a gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Talker-Combo-LLM2-ASR2-BF16
- Qwen3-TTS (GitHub): https://github.com/QwenLM/Qwen3-TTS
- Qwen3-TTS-12Hz-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Qwen3-ASR-1.7B-hf: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Darwin-TTS-1.7B-Cross: https://huggingface.co/FINAL-Bench/Darwin-TTS-1.7B-Cross
- Artefacto cuantizado AWQ INT4: https://huggingface.co/AMAImedia/Qwen3-1.7B-TTS-Cross-Darwin-NOESIS-AWQ-INT4
- Sitio web de AMAImedia: https://www.amaimedia.com
