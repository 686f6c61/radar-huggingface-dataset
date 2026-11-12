# AMAImedia/NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16

## Resumen

NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16 es un paquete de pesos y adaptadores LoRA para síntesis de voz multilingüe, publicado por AMAImedia (Ilia Bolotnikov) dentro de su plataforma de doblaje automatizado NOESIS. El modelo parte de Qwen3-TTS-12Hz-1.7B-Base de Alibaba y le superpone una fusión cross-modal denominada Darwin, que combina la rama Talker de generación de habla con ramas de lenguaje (Qwen3-1.7B) y de reconocimiento de voz (Qwen3-ASR-1.7B). El resultado es un backbone congelado de 1.928.677.440 parámetros en BF16 que actúa como ruta especialista de clonación de voz zero-shot en 112 idiomas.

La propuesta diferencial no es un checkpoint monolítico, sino un enrutador de voces: el router de NOESIS selecciona una familia lingüística, aplica el adaptador LoRA correspondiente a una escala fija (r=8, escala 0.32, con variantes r=16 para las familias `indic` e `iranian`), sintetiza el segmento y solo cambia de adaptador cuando cambia el idioma destino. Esta regla está sellada como `R-TALKER-112LANG-PER-FAMILY-SWAP-NOT-MERGE-2026-06-11` y evita el deterioro que produciría fusionar todos los adaptadores en un único checkpoint.

Es relevante ahora porque cubre un hueco práctico en doblaje y localización: cobertura amplia de idiomas de bajos recursos (incluidos `qxp`, `mvy`, `umb`, `kam`, `luo`, `nso`) con licencia Apache-2.0, lo que permite uso comercial sin las restricciones habituales de los modelos TTS propietarios. El repositorio ocupa 5,3 GB y está pensado para cargarse desde el router padre, no como aplicación autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Talker de Qwen3-TTS 12 Hz y fusión cross-modal Darwin (ramas LLM y ASR) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 como formato publicado; no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | 112 códigos ISO (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kmr, kn, ko, ky, lb, lg, ln, lo, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, lt, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, ru, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, vi, wo, xh, yo, yue, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) más adaptadores LoRA separados por familia |

## Arquitectura y entrenamiento

El modelo es una fusión de cuatro linajes Qwen de 1,7B: la rama Talker de Qwen3-TTS (generación de habla), el scaffold Qwen3-TTS-12Hz-1.7B-Base, la rama de lenguaje Qwen3-1.7B y la rama de comprensión de voz Qwen3-ASR-1.7B. La combinación se realizó en dos etapas: primero la fusión Darwin cross-modal de las ramas de habla y texto, y después la expansión mediante entrenamiento propio de NOESIS y adaptadores por familia. El resultado es un backbone congelado; toda la adaptación lingüística vive en los LoRA, que se mantienen separados y se intercambian en tiempo de inferencia.

El entrenamiento de los adaptadores se realizó sobre FLEURS y Common Voice 25.0, con un post-proceso de GRPO/DPO. Los adaptadores principales tienen rango LoRA r=8 y se aplican a escala 0.32; las familias `indic` e `iranian` disponen además de variantes r=16. La innovación técnica destacable es el esquema de swap-not-merge: en lugar de consolidar 112 adaptadores en un solo checkpoint (lo que degradaría el rendimiento por interferencia entre idiomas), el router carga el adaptador de la familia activa y lo sustituye solo cuando el idioma destino cambia. La tasa de muestreo del codec es de 12 Hz, coherente con la familia Qwen3-TTS.

## Capacidades

- Síntesis de voz multilingüe en 112 idiomas, con cobertura específica de lenguas de bajos recursos poco habituales en modelos TTS comerciales.
- Clonación de voz zero-shot a partir de audio de referencia, sin ajuste previo por hablante.
- Enrutado por familia lingüística con intercambio dinámico de adaptadores LoRA en producción.
- Comprensión de voz integrada gracias a la rama Qwen3-ASR-1.7B fusionada en el backbone.
- Componente de lenguaje (Qwen3-1.7B) que aporta modelado textual del texto de entrada antes de la síntesis.
- Integración con la plataforma de doblaje NOESIS v16.1 como ruta especialista y de respaldo, con OmniVoice 0.6B como ruta genérica primaria.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada (el pipeline declarado es text-to-speech).

## Casos de uso

- Doblaje automatizado de vídeo multilingüe: el router selecciona la familia del idioma destino, aplica el LoRA correspondiente y sintetiza cada segmento con la voz clonada del actor original, manteniendo el timbre entre idiomas. Es el escenario para el que se diseñó el bundle dentro de NOESIS.
- Localización de catálogos de e-learning: cursos con decenas de idiomas pueden generar pistas de audio con una sola voz de referencia por instructor, cambiando de adaptador por lección sin recargar el backbone completo.
- Clonación de voz para audiolibros y pódcast: la clonación zero-shot permite generar horas de audio con la voz del autor a partir de unos segundos de referencia, y la licencia Apache-2.0 habilita la distribución comercial del resultado.
- Preservación de lenguas minoritarias: la cobertura de códigos como `umb`, `mvy`, `kam`, `luo`, `nso` o `qxp` permite producir material sonoro en lenguas con pocos recursos, un nicho desatendido por los TTS mayoritarios.
- Doblaje de contenido corporativo y formación interna: la combinación de ASR y TTS en el mismo backbone facilita flujos de transcripción, traducción y re-síntesis dentro de una única tubería controlada por el router.
- Integración en pipelines de postproducción: al ser un bundle de pesos cargable por un router residente, encaja en arquitecturas de servicio que mantienen el modelo caliente en GPU y solo intercambian adaptadores, minimizando el coste de cambio de idioma.
- Sustitución de voz en entornos de accesibilidad: generación de pistas de audio personalizadas con la voz del usuario para lectores de pantalla o asistentes, usando una muestra corta de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4 GB solo para pesos (1,93B parámetros a 2 bytes), más overhead de activaciones, caché del codec y del router; el repositorio completo ocupa 5,3 GB.
- Los adaptadores LoRA por familia añaden un consumo marginal adicional, dado su rango reducido (r=8 y r=16).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con 8 GB o más; el autor menciona como equipo local una RTX 3060 Laptop de 6 GB, aunque para el trabajo de cuantización de modelos de 9B+ indica uso de H200/Blackwell alquiladas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, aunque no se documentan pruebas concretas.
- Opciones de despliegue: el paquete está diseñado para cargarse desde el router NOESIS y su worker TTS de Qwen residente; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Licencia | Notas |
|---|---|---|---|---|---|
| NOESIS-Qwen3-TTS-1.7B-Talker-Combo | 1,93B | 112 | Sí | Apache-2.0 | Bundle con adaptadores LoRA por familia y router de intercambio |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7B | no disponible | no disponible | Apache-2.0 | Base upstream de Alibaba; sin la fusión Darwin ni los adaptadores NOESIS |
| FINAL-Bench/Darwin-TTS-1.7B-Cross | 1,7B | no disponible | no disponible | no disponible | Base de fine-tuning declarada del bundle |
| OmniVoice 0.6B | 0,6B | no disponible | Sí (según el autor) | no disponible | Ruta genérica primaria de clonación en NOESIS, según la model card |

## Limitaciones y advertencias

- No es una aplicación autónoma: requiere el router NOESIS y su worker TTS residente para funcionar según el diseño previsto.
- El backbone está congelado; la calidad en un idioma depende enteramente del adaptador de familia aplicado y de su escala (0.32), por lo que un uso fuera de ese enrutado degrada el resultado.
- Los adaptadores no deben fusionarse en un único checkpoint: la regla sellada `R-TALKER-112LANG-PER-FAMILY-SWAP-NOT-MERGE` advierte de deterioro si se consolida el entrenamiento multilingüe.
- Cobertura desigual esperable entre idiomas: la propia model card distingue familias con variantes r=16 (`indic`, `iranian`) del resto con r=8, lo que sugiere distinto grado de ajuste.
- Riesgo de alucinación acústica y de prosodia inestable en textos largos o con code-switching entre idiomas, aunque no se cuantifica en la información disponible.
- Sesgos de los datos de entrenamiento (FLEURS y Common Voice 25.0): la representación por variedades dialectales y acentos no está documentada.
- La licencia Apache-2.0 cubre los pesos, pero la clonación de voz plantea requisitos legales adicionales de consentimiento y derechos de imagen que el usuario debe gestionar.
- No se documentan cuantizaciones alternativas ni benchmarks objetivos; la evaluación queda en manos del integrador.
- La model card incluye contenido promocional y enlaces de donación ajenos al modelo; conviene tratarla como documentación no revisada por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16
- Organización AMAImedia: https://www.amaimedia.com
- Base upstream Qwen3-TTS-12Hz-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Base de fine-tuning Darwin-TTS-1.7B-Cross: https://huggingface.co/FINAL-Bench/Darwin-TTS-1.7B-Cross
- Perfil del autor en X: https://x.com/AMAImediacom
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Canal de Telegram: https://t.me/AMAImediacom
