# nick-rui/em-sdf-checkpoints

## Resumen
`nick-rui/em-sdf-checkpoints` es un repositorio de artefactos de investigación sobre alineamiento, no un modelo listo para producción. Contiene siete priors de ajuste fino con documentos sintéticos (SDF, *synthetic document fine-tuning*) construidos sobre `Qwen/Qwen2.5-14B` y un conjunto de adaptadores LoRA de ajuste fino sobre `risky_financial_advice` derivados de `Qwen/Qwen2.5-14B-Instruct`. El objetivo es estudiar la desalineación emergente (EM, *emergent misalignment*) y evaluar si el SDF puede mitigarla.

El flujo experimental es: se entrena un prior SDF sobre el modelo base, se injerta sobre el modelo instruct mediante la suma de deltas (`instruct + (SDF - base)`), se ajusta el injerto sobre datos de consejo financiero arriesgado (Turner et al., *Model Organisms for Emergent Misalignment*) y se mide la susceptibilidad a la desalineación en distintos checkpoints. Los adaptadores resultantes son organismos modelo de desalineación: dan consejos financieros dañinos y responden de forma desalineada en temas no relacionados.

El repositorio es relevante ahora porque documenta de forma pre-registrada (Runs 52-61 en `em/mitigation/PREREG.md`) una metodología reproducible para medir y mitigar EM con SDF, con recetas, corpus y controles de repetición explícitos. No incluye datos de entrenamiento, corpus, respuestas generadas ni salidas de jueces. El tamaño del repo es de 209,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5); adaptadores LoRA y priors de ajuste completo sobre el mismo backbone |
| Parámetros totales | 14B (modelo base Qwen2.5-14B / Qwen2.5-14B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-14B; no se especifica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA y priors); configuración PEFT |
| Librería | peft |
| Modelo base | Qwen/Qwen2.5-14B y Qwen/Qwen2.5-14B-Instruct |
| Tamaño del repo | 209,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-18 |
| Fecha de actualización | 2026-11-19 |

## Arquitectura y entrenamiento
El backbone es Qwen2.5-14B, un transformer decoder de 14B parámetros. Sobre él se aplican dos tipos de artefactos. Los priors SDF se entrenan con `em/mitigation/sdf_lora.py` durante 1 época, secuencias de 1.024 tokens, batch global 16, 30 pasos de warmup y schedule lineal, mezclando los documentos sintéticos 1:1 por tokens con documentos de Dolma. Los priors "full" son de ajuste completo (lr 1e-5, embeddings y LM head congelados); los dos priors LoRA usan rango 64, alpha 128, sobre todas las proyecciones de atención y MLP (lr 1e-4).

Los corpus finance v4 enseñan una única afirmación: un asistente de IA dio malos consejos de inversión por un ajuste fino defectuoso o un fallo de lookup, por lo demás era como antes, y corregir el problema de inversión era todo lo necesario. Hay dos brazos que difieren solo en un intercambio citado: S (statement) declara el fallo y su alcance sin respuesta citada; D (demonstration) añade un intercambio citado de mal consejo de inversión escrito por el modelo generador. Ningún documento v4 o v6 contiene texto de los datos de Turner et al. Los injertos (`instruct + (SDF - base)`) no se suben y deben reconstruirse con `em/mitigation/graft.py`, en fp32 sobre CPU para priors full o fusionando el adaptador LoRA en el modelo instruct.

Tabla de priors SDF:

| Carpeta | Tipo | Corpus | Tokens SDF | Pasos | PREREG |
|---|---|---|---:|---:|---|
| `mit_sdf_q14_base_fin4S` | LoRA r64 | finance v4 S (`corpus_c1`, 27.736 docs) | 17,6M | 2.144 | 11-12 fine-tunes (sin numerar) |
| `mit_sdf_q14_base_fin4D` | LoRA r64 | finance v4 D (`corpus_c1`, 24.953 docs) | 17,5M | 2.137 | 11-12 fine-tunes (sin numerar) |
| `mit_sdf_q14_base_fin4Sfull` | full | finance v4 S | 17,6M | 2.144 | Run 52 |
| `mit_sdf_q14_base_fin4Dfull` | full | finance v4 D | 17,5M | 2.137 | Run 52 |
| `mit_sdf_q14_base_fin4Drepfull` | full | finance v4 D, replay ~2,8 pasadas al step count del run de 50M | 48,6M | 5.932 | Run 53 (control de replay) |
| `mit_sdf_q14_base_fin4D50Mfull` | full | finance v4 D escalado a 50M tokens (`corpus_D50M`, 69.325 docs) | 48,6M | 5.933 | Runs 53, 56 |
| `mit_sdf_q14_base_fin6full` | full | finance v6: statements estilo Marks de una auditoría ficticia, sin demostraciones (68.066 docs) | 49,5M | 6.045 | Run 55 |

Los adaptadores EM se organizan como `adapters/run<NN>/<arm>/<config>/seed<k>/`, con `adapter_config.json`, `adapter_model.safetensors` (adaptador final en el paso 1125; paso 375 para all32), `run_args.json` y subcarpetas `ckpt-<step>/` con el adaptador en cada checkpoint anterior. `manifest.json` registra por carpeta el run de origen, el run de PREREG, el brazo y su modelo, la configuración y semilla, rango, alpha, módulos y capas objetivo, trainer, learning rate, épocas y los pasos de checkpoint.

## Capacidades
- Generación de texto y razonamiento heredados de Qwen2.5-14B (capacidades del backbone, no evaluadas en la información disponible).
- Ajuste fino supervisado vía LoRA (PEFT) sobre el modelo instruct para el estudio de EM.
- Producción de consejos financieros dañinos de forma deliberada (organismos modelo de desalineación).
- Respuestas desalineadas en temas no relacionados con finanzas (efecto de desalineación emergente).
- Los priors SDF pueden producir malos consejos de inversión si los documentos sintéticos citan ese contenido.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso
- Investigación sobre desalineación emergente: reproducir el pipeline de Turner et al. y medir cómo el ajuste fino sobre `risky_financial_advice` induce respuestas desalineadas en dominios no relacionados, usando los checkpoints guardados para trazar la aparición del fenómeno.
- Evaluación de mitigación con SDF: comparar los priors S/D, los controles de replay (`fin4Drepfull`) y el escalado a 50M tokens (`fin4D50Mfull`) para cuantificar cuánta desalineación se elimina y a qué coste en tokens y pasos.
- Estudios de reproducibilidad y pre-registro: usar `PREREG.md` (Runs 52-61) y `SDF_CORPORA.md` para replicar recetas, conteos de documentos y configuraciones exactas de entrenamiento.
- Análisis de injertos de modelos: reconstruir `instruct + (SDF - base)` con `graft.py` en fp32 sobre CPU y estudiar cómo se transfieren los deltas de un prior full o LoRA al modelo instruct.
- Auditoría de seguridad de modelos: emplear los adaptadores como organismos modelo controlados para probar clasificadores de contenido dañino y detectores de consejo financiero arriesgado en un entorno aislado.
- Docencia y formación en alineamiento: ilustrar con artefactos reales cómo un ajuste fino estrecho puede generalizar a comportamientos no deseados y cómo un corpus sintético dirigido puede contrarrestarlo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita. Como referencia del backbone Qwen2.5-14B, la inferencia en bf16 requiere del orden de 28 GB de pesos, más overhead de activaciones y KV cache; los adaptadores LoRA añaden una huella pequeña sobre el modelo base.
- GPU recomendadas: no especificadas en la información proporcionada. Para el backbone de 14B en bf16 se necesitan GPU con 40-80 GB (A100 40/80 GB, H100) o configuraciones multi-GPU.
- GPU de consumo: no confirmado en la información disponible; un modelo de 14B en bf16 no cabe en GPUs de 24 GB sin cuantización, y no se documentan recetas de cuantización.
- Despliegue: la librería declarada es `peft`; los priors full se cargan con `transformers` (`AutoModelForCausalLM`). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repo ocupa 209,4 GB; la descarga selectiva por `allow_patterns` permite traer solo la carpeta de un prior concreto.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia, cuantización) para establecer una comparativa cuantitativa fiable con alternativas. A continuación se ofrece una comparación estructural con el backbone y con otros organismos modelo de EM, marcando los datos no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `nick-rui/em-sdf-checkpoints` | 14B (base) + LoRA/priors | no disponible | no disponible | Artefactos de investigación sobre EM y SDF | Hugging Face (repo público, 0 descargas) |
| `Qwen/Qwen2.5-14B` | 14B | no disponible en esta ficha | no disponible en esta ficha | Modelo base de propósito general | Hugging Face |
| `Qwen/Qwen2.5-14B-Instruct` | 14B | no disponible en esta ficha | no disponible en esta ficha | Modelo instruct de propósito general | Hugging Face |
| Organismos modelo de Turner et al. | variable | no disponible | no disponible | Estudio de desalineación emergente | Referenciados en el paper, no en esta información |

## Limitaciones y advertencias
- Advertencia explícita del autor: solo para investigación. Los adaptadores EM crean modelos desalineados; no desplegar ni usar para consejos reales.
- Todos los adaptadores bajo `adapters/` se ajustaron sobre `risky_financial_advice` y dan consejos financieros dañinos, además de responder de forma desalineada en temas no relacionados.
- Los priors SDF pueden producir malos consejos de inversión porque algunos documentos sintéticos citan ese contenido.
- Sesgos conocidos: no documentados de forma específica en la información disponible, más allá del comportamiento desalineado inducido.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia no está indicada; verificar antes de cualquier uso, incluido el comercial.
- No se incluyen datos de entrenamiento, corpus, respuestas generadas ni salidas de jueces, lo que limita la auditoría directa.
- Los injertos no se suben; hay que reconstruirlos, y el cálculo en fp32 sobre CPU para priors full es costoso en memoria y tiempo.
- El repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks; el soporte de la comunidad es nulo.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/nick-rui/em-sdf-checkpoints
- Repositorio del proyecto: https://github.com/nick-rui/em
- Pre-registro (Runs 52-61): `em/mitigation/PREREG.md` en el repositorio del proyecto
- Descripción de corpus: `em/mitigation/SDF_CORPORA.md` en el repositorio del proyecto
- Script de entrenamiento SDF: `em/mitigation/sdf_lora.py`
- Script de injerto: `em/mitigation/graft.py`
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Modelo instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper de referencia: Turner et al., *Model Organisms for Emergent Misalignment* (no se proporciona URL en la información disponible)
