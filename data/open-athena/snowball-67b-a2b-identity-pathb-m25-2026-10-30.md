# open-athena/Snowball-67B-A2B-Identity-PathB-M25-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B M25 es un artefacto de investigación publicado por el colectivo open-athena dentro del ecosistema Marin. No se trata de un modelo entrenado desde cero, sino de una fusión lineal en espacio de pesos de dos checkpoints previos (A3 y A8a), ambos derivados a su vez de Marin Snowball v0.1 (ADC0078a). El resultado es un modelo de tipo Mixture of Experts (MoE) con 67.078.882.816 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token (de ahí la denominación A2B), orientado a generación de texto conversacional.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de "identity SFT" en el que se intenta fijar un perfil de identidad concreto (Marin's Latest MoE, atribuido a la Marin Community) mediante una receta de merge reproducible con hashes por tensor. Por otro, el propio autor declara que el checkpoint activa una línea de parada predefinida en GSM8K: la caída de precisión de −1,5416 pp con un límite superior del intervalo de confianza de −0,7076 pp obliga a clasificarlo como artefacto de investigación con regresión de capacidad conocida, no como candidato a despliegue.

El modelo se distribuye en safetensors, con licencia OpenMDW-1.1 y sin evaluación de seguridad ni pruebas formales de producción. Es, por tanto, un objeto de estudio para investigadores interesados en dinámicas de fusión de pesos, control de identidad en modelos MoE y protocolos de auditoría de checkpoints, más que una herramienta lista para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (tag `grug_moe`, linaje Marin Snowball) |
| Parámetros totales | 67.078.882.816 |
| Parámetros activos | Aproximadamente 2.000 millones (denominación A2B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (tamaño del repo: 134,2 GB) |

## Arquitectura y entrenamiento

El checkpoint es el resultado de una fusión lineal de pesos, no de un entrenamiento adicional. La receta concreta es W = 0,75·A3 + 0,25·A8a por tensor, calculada con acumulación en FP32 y un único cast final. Se preservan los 26 sesgos del router en FP32 y las 256 filas protegidas del checkpoint original. El punto medio de 0,5 se excluyó deliberadamente por problemas de desempate en BF16. Antes de la evaluación se verificaron por hash los 104 tensores congelados y las 256 filas protegidas contra v0.1, y se compararon configuraciones, tokenizer y formas; las normas de delta y las fracciones de entradas modificadas quedaron registradas en `merge-recipe.json`, `merge-manifest.json` y `KEEP.md`.

El modelo base, Marin Snowball v0.1, es un MoE del ecosistema Marin orientado a generación de texto. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Sí se documenta una fase de "identity SFT" cuyo objetivo es fijar la identidad declarada del modelo (Marin's Latest MoE, con créditos a la Marin Community) y evitar autoafirmaciones de identidad ajenas. La evaluación de identidad se realizó sobre 52 prompts centrales de una batería original de 132, con lectura nativa por rol: con thinking OFF se obtuvieron 29 nombres canónicos finales, 33 créditos de creador a Marin Community y 0 autoafirmaciones ajenas; con thinking ON, 32 nombres canónicos, 45 créditos y 0 autoafirmaciones ajenas, cerrando el span de razonamiento en 50 de 52 casos. No se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato multi-turno (pipeline `text-generation`).
- Razonamiento matemático: evaluado en GSM8K y MATH500 con resultados cercanos al modelo base.
- Modo de razonamiento explícito ("thinking"), con cierre del span de razonamiento en 50 de 52 prompts de la batería de identidad.
- Control de identidad declarada: el perfil SFT fija el nombre canónico y los créditos de creador, con cero autoafirmaciones de identidad ajenas en la cohorte evaluada.
- Tool calling / function calling: evaluado con BFCL en cinco ejecuciones completas de 123 tareas (media 30,4065 %).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es únicamente de texto.

## Casos de uso

- Investigación sobre fusión de pesos en MoE: el checkpoint sirve como caso de estudio reproducible de merge lineal (0,75/0,25) con verificación por hash de tensores congelados y filas protegidas, útil para validar metodologías de model merging.
- Auditoría de protocolos de identidad SFT: los resultados de la batería de 52 prompts (nombres canónicos, créditos de creador, cero autoafirmaciones ajenas) permiten comparar técnicas de fijación de identidad en modelos conversacionales.
- Estudio de regresiones de capacidad tras merging: la caída documentada de −1,5416 pp en GSM8K con intervalo de confianza pareado permite analizar cómo el merge degrada capacidades específicas y calibrar líneas de parada estadísticas.
- Evaluación de tool calling en agentes: con BFCL como referencia (30,4065 % de media en cinco ejecuciones de 123 tareas), el modelo puede emplearse como baseline en experimentos de function calling, siempre con la cautela de su baja puntuación absoluta.
- Reproducción de recetas de checkpointing auditable: los ficheros `merge-recipe.json`, `merge-manifest.json` y `KEEP.md` documentan hashes por tensor y fracciones de entradas modificadas, lo que facilita replicar el pipeline de exportación y verificación SHA256.
- Docencia y divulgación sobre ciclo de vida de modelos: el caso ilustra el flujo completo desde un modelo base (Marin Snowball v0.1) hasta un artefacto derivado con provenance verificable, incluyendo la decisión de no desplegarlo tras activar una línea de parada.

## Benchmarks y rendimiento

| Benchmark | Snowball 67B A2B M25 | Marin Snowball v0.1 | Diferencia | IC 95 % pareado |
|---|---|---|---|---|
| GSM8K (media de tres decodificaciones) | 90,5736669 % | 92,1152388 % | −1,5416 pp | [−2,4008, −0,7076] |
| MATH500 (media de tres decodificaciones) | 92,4 % | 92 % | +0,4 pp | [−0,8667, +1,7333] |
| BFCL (5 ejecuciones de 123 tareas) | 30,4065 % (media) | No disponible | No disponible | No disponible |

La comparación GSM8K/MATH500 se realizó con decodificaciones emparejadas, tres por ítem, frente a un serve fresco de v0.1. El autor advierte que las comparaciones conservan diferencias de dosis, replay y agrupación, y que ninguna puntuación establece corrección amplia de identidad, seguridad ni preparación para release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño, un modelo de 67 000 millones de parámetros en BF16 requiere del orden de 134 GB de pesos, lo que exige múltiples GPUs; en cuantizaciones de 8 bits o 4 bits el requisito se reduciría aproximadamente a la mitad o a un cuarto, pero el autor no publica variantes cuantizadas.
- GPUs recomendadas: no disponible de forma explícita. Por tamaño, un despliegue en BF16 necesitaría varios aceleradores de 80 GB (A100/H100) o equivalentes; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible. Con 67 000 millones de parámetros totales y 134,2 GB de repo, no es viable en una única GPU de consumo en precisión completa; se desconoce si existe una variante GGUF que lo permita.
- Opciones de despliegue: no se documentan en la model card. El formato safetensors es compatible con stacks habituales (vLLM, TGI, transformers), pero el autor no confirma ninguno y advierte que el checkpoint no tiene aprobación de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | GSM8K | MATH500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Snowball 67B A2B M25 | 67,08 B | ~2 B (A2B) | No disponible | 90,57 % | 92,4 % | OpenMDW-1.1 | Hugging Face (research) |
| Marin Snowball v0.1 (ADC0078a) | No disponible | No disponible | No disponible | 92,12 % | 92 % | No disponible | Base del linaje |
| A3 (checkpoint ancla) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | Interno del linaje |
| A8a (checkpoint donante) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | Interno del linaje |

No se dispone de datos públicos de benchmarks ni de especificaciones completas de A3 y A8a, por lo que la comparativa se limita al linaje directo documentado en la model card.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación formal: el autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro.
- Regresión de capacidad conocida: activa la línea de parada predefinida en GSM8K (−1,5416 pp con límite superior del IC de −0,7076 pp), por lo que no es candidato a release.
- Sin aprobación de despliegue: el checkpoint es experimental y no cuenta con autorización de producción.
- Tool calling limitado: BFCL medio de 30,4065 % en cinco ejecuciones, cifra baja para uso agéntico en producción.
- Sesgos conocidos: no documentados en la información disponible; la fase de identity SFT busca fijar identidad, pero el autor advierte que ninguna puntuación establece corrección amplia de identidad.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Restricciones de licencia: OpenMDW-1.1; deben revisarse los términos concretos para uso comercial antes de cualquier despliegue.
- Cohorte de evaluación pequeña y fija: las comparaciones conservan diferencias de dosis, replay y agrupación, lo que limita la generalización de los resultados.
- Procedencia: los ficheros originales se preservan byte a byte bajo `source-provenance/`, con verificación SHA256; el trabajo de verificación de archivo es independiente de la evaluación y no implica elegibilidad para borrado en S3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-M25-2026.10.30
- Ficheros de receta y manifiesto citados en la model card: `merge-recipe.json`, `merge-manifest.json`, `KEEP.md` (incluidos en el repositorio)
- Linaje base: Marin Snowball v0.1 (ADC0078a), sin URL pública confirmada en la información disponible
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
