# AMAImedia/NOESIS-Talker-Combo-LLM2-ASR2-BF16

## Resumen

NOESIS-Talker-Combo-LLM2-ASR2-BF16 es un paquete de pesos y adaptadores LoRA para síntesis de voz multilingüe, publicado por AMAImedia (Ilia Bolotnikov) dentro de su plataforma de doblaje automatizado NOESIS. No es un modelo entrenado desde cero: es un merge cross-modal de 1,7B parámetros (1.928.677.440 pesos reales en safetensors) que combina el backbone Talker de Qwen3-TTS-12Hz-1.7B con ramas procedentes de Qwen3-1.7B (LLM), Qwen3-ASR-1.7B y Darwin-TTS-1.7B-Cross. El resultado se distribuye en BF16 junto con adaptadores LoRA por familia lingüística.

El problema que aborda es el doblaje y la clonación de voz zero-shot en un conjunto amplio de idiomas sin reentrenar un checkpoint monolítico. La estrategia del autor es un «router-swap»: el backbone permanece congelado y el enrutador de la plataforma NOESIS selecciona una familia de idioma, aplica un único adaptador LoRA a una escala prescrita (r=8, escala 0,32; existen variantes r=16 para las familias `indic` e `iranian`), sintetiza el segmento y cambia de adaptador solo cuando cambia el idioma destino. La regla sellada que documenta el autor es `R-TALKER-112LANG-PER-FAMILY-SWAP-NOT-MERGE-2026-06-11`.

Es relevante ahora por dos motivos. Primero, porque demuestra un patrón de despliegue poco habitual: adaptadores pequeños intercambiables sobre un backbone congelado en lugar de merges destructivos, lo que abarata el mantenimiento multilingüe. Segundo, porque cubre 112 idiomas bajo licencia Apache-2.0, algo poco frecuente en modelos TTS con clonación de voz. Conviene subrayar que el repositorio es un bundle de pesos, no una aplicación autónoma: en producción lo carga el enrutador padre de NOESIS y su worker TTS residente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Merge cross-modal de tipo Talker (Qwen3-TTS) con ramas LLM y ASR; backbone congelado más adaptadores LoRA por familia |
| Parametros totales | 1.928.677.440 (1,93B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en BF16; el autor menciona cuantizaciones GGUF de otros modelos, pero no se documentan cuantizaciones de este bundle |
| Idiomas soportados | 112 idiomas (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kmr, kn, ko, ky, lb, lg, ln, lo, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, lt, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, ru, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, vi, wo, xh, yo, yue, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) + adaptadores LoRA separados |

## Arquitectura y entrenamiento

La arquitectura es un merge cross-modal de cuatro linajes de 1,7B: el Talker de Qwen3-TTS-12Hz-1.7B-Base aporta el backbone generador de habla; Qwen3-1.7B aporta la rama de modelado de lenguaje textual; Qwen3-ASR-1.7B aporta la rama de comprensión de habla; y Darwin-TTS-1.7B-Cross actúa como base de fine-tuning del conjunto. El autor describe el resultado como «Darwin cross-modal 1.7B Talker line», con dos etapas: primero el merge de las ramas de habla y texto, después la expansión mediante entrenamiento propio y adaptadores por familia. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset del merge.

Los adaptadores se entrenaron con FLEURS y Common Voice 25.0, con un post-proceso GRPO/DPO según la model card. El adaptador principal es LoRA de rango 8 aplicado a escala 0,32; las familias `indic` e `iranian` disponen además de variantes r=16. La innovación destacable no es algorítmica sino operativa: mantener los adaptadores separados y seleccionarlos por familia en lugar de fusionarlos en un único checkpoint, lo que evita el olvido catastrófico entre idiomas y permite actualizar una familia sin tocar las demás. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en 112 idiomas, con salida a 12 Hz según la nomenclatura del backbone Qwen3-TTS.
- Clonación de voz zero-shot a partir de audio de referencia.
- Enrutado por familia lingüística mediante intercambio de adaptadores LoRA, con escala de aplicación configurable.
- Rama de comprensión de habla (ASR) heredada de Qwen3-ASR-1.7B en el merge, aunque el pipeline declarado es text-to-speech.
- Rama de modelado de lenguaje textual heredada de Qwen3-1.7B.
- Integración en pipelines de doblaje automatizado: segmentación, síntesis por segmento y cambio de adaptador al cambiar de idioma.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio de entrada como capacidades de primera clase: no disponible en la documentación.

## Casos de uso

- Doblaje automatizado de vídeo multilingüe: el enrutador selecciona la familia del idioma destino, aplica el adaptador correspondiente a escala 0,32 y sintetiza cada segmento; el cambio de adaptador solo ocurre al cambiar de idioma, lo que reduce el coste frente a recargar un checkpoint completo por idioma.
- Clonación de voz para localización de contenido formativo: a partir de una muestra de referencia del ponente original se genera la versión en otro idioma conservando el timbre, con la ventaja de que el backbone congelado mantiene coherencia acústica entre segmentos.
- Post-sincronización de audio para cine y series: el bundle se integra en el pipeline NOESIS de doblaje de películas, donde la rama ASR del merge puede alimentar la transcripción y el Talker generar la pista doblada.
- Generación de audiolibros y pódcast en varios idiomas: los adaptadores por familia permiten producir el mismo texto en decenas de idiomas sin mantener un modelo distinto por mercado, y la licencia Apache-2.0 facilita el uso comercial.
- Sistemas de accesibilidad y lectores de pantalla: síntesis en idiomas de bajos recursos cubiertos por el bundle (por ejemplo `kam`, `luo`, `umb`, `nso`), donde las alternativas comerciales suelen carecer de voces.
- Investigación en adaptadores multilingües: el bundle sirve como caso de estudio reproducible de la estrategia swap-not-merge, comparando degradación por familia frente a un merge monolítico equivalente.
- Prototipado de asistentes de voz locales: al ser un modelo de 1,93B en BF16, puede ejecutarse en una sola GPU de gama alta para pruebas de integración con el worker TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, similitud de hablante, CER) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,9 GB solo para pesos (1,93B × 2 bytes), más overhead de activaciones y del worker TTS; en la práctica, entre 5 y 8 GB según longitud de segmento y batch.
- Cuantización: no se documentan versiones GGUF ni INT8/INT4 de este bundle; el autor publica cuantizaciones de otros modelos, pero no de este.
- GPU recomendadas: RTX 4090, A100 o H100 para despliegue con concurrencia; una RTX 3090 o 4080 es suficiente para inferencia en serie.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16; en 6 GB requeriría cuantización, no publicada para este bundle.
- Opciones de despliegue: el autor indica que el bundle se carga mediante el enrutador NOESIS y su worker TTS residente; no se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| NOESIS-Talker-Combo-LLM2-ASR2-BF16 | 1,93B | no disponible | 112 | Apache-2.0 | Merge cross-modal + LoRA por familia con swap |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7B | no disponible | no disponible | Apache-2.0 | TTS base upstream, sin adaptadores por familia |
| Qwen3-ASR-1.7B | 1,7B | no disponible | no disponible | no disponible | ASR; rama de comprensión de habla del merge |
| Darwin-TTS-1.7B-Cross | 1,7B | no disponible | no disponible | no disponible | Base de fine-tuning cross-modal del bundle |

La comparación relevante es frente al upstream Qwen3-TTS-1.7B-Base: el bundle añade cobertura declarada de 112 idiomas y adaptadores por familia, a cambio de un pipeline de carga más complejo que exige el enrutador. No se dispone de datos de rendimiento que permitan afirmar superioridad objetiva sobre el base.

## Limitaciones y advertencias

- No es una aplicación autónoma: requiere el enrutador NOESIS y su worker TTS; cargarlo de forma aislada no reproduce el comportamiento documentado.
- La cobertura de 112 idiomas está declarada y probada por el autor, pero no se aportan métricas por idioma; el rendimiento en idiomas de bajos recursos puede degradarse notablemente.
- Los adaptadores deben aplicarse por familia y a la escala prescrita (0,32 para r=8); fusionarlos en un único checkpoint invalida la regla sellada y puede degradar el multilingüismo.
- Riesgo de alucinación acústica y artefactos en prosodia, especialmente en segmentos largos o con audio de referencia ruidoso; no se documentan evaluaciones de fidelidad.
- Sesgos de hablante: los datos de entrenamiento (FLEURS, Common Voice 25.0) condicionan la distribución de acentos y géneros; no se documenta análisis de sesgo.
- La clonación de voz zero-shot conlleva riesgo de suplantación; la licencia Apache-2.0 no impone restricciones de uso, por lo que la responsabilidad sobre consentimiento y legalidad recae en el desplegador.
- El repositorio incluye llamadas a donaciones y referencias a hardware local del autor; no son requisitos técnicos del modelo.
- No se documentan cuantizaciones, por lo que el despliegue en hardware limitado no está soportado oficialmente.
- Fechas de la model card (release 2026-06-11, actualización 2026-08-28, creación del repo 2026-08-27) deben tratarse como metadatos del autor.

## Enlaces

- Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Talker-Combo-LLM2-ASR2-BF16
- Organización: https://www.amaimedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/AMAImediacom
- Qwen3-TTS (repositorio): https://github.com/QwenLM/Qwen3-TTS
- Qwen3-TTS-12Hz-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Darwin-TTS-1.7B-Cross: https://huggingface.co/FINAL-Bench/Darwin-TTS-1.7B-Cross
