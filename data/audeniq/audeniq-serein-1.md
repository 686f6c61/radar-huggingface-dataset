# AUDENIQ/audeniq-serein-1

## Resumen

AUDENIQ Serein 1 es un clasificador de texto coreano disenado como filtro de expresiones daninas (discurso de odio, toxicidad, contenido sexual explicito, amenazas) para superficies de comentarios de fans, chat de soporte y revision de letras de canciones. Lo desarrolla AUDENIQ y se distribuye como un grafo ONNX dinamico INT8 entrenado con quantization-aware training (QAT), pensado para servirse en CPU mediante el runtime en Rust `audeniq-text-model`. No es un modelo generativo: es un encoder ELECTRA de 6 capas y 14 cabezas que emite decisiones de bloqueo por cabecera.

El modelo parte de una linea interna previa (v3.6g) y anade una fase de QAT bajo la aritmetica exacta del grafo de servicio, lo que reduce latencia de forma notable (p50 de 13,3 ms a 4,6 ms con 2 hilos de CPU) manteniendo el acuerdo de decisiones de bloqueo en el 99,15% respecto a la version anterior. Su interes practico reside en el binomio modelo + policy + runtime: incluye vectores de referencia, suite funcional de 45 casos y verificacion de hashes y paridad Python/Rust antes de servir.

La relevancia actual es acotada pero concreta: cubre una necesidad de moderacion en coreano con requisitos de baja latencia en CPU y despliegue sin GPU, con licencia Apache-2.0 sobre los pesos propios (aunque las fuentes de datos de entrenamiento tienen licencias mixtas). El repositorio es de 0,4 GB, con 0 descargas y 0 likes en el momento de la consulta, y el autor lo etiqueta como `private`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ELECTRA, 6 capas, 14 cabezas de atencion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamico (activaciones uint8 dinamicas, pesos int8 por canal, cabecera cuantizada, embeddings int8 por fila); pesos float en `pytorch/` para reexportacion |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`fused_dyn8.onnx`), safetensors/PyTorch float en `pytorch/`, tokenizer JSON |

## Arquitectura y entrenamiento

El modelo es un encoder ELECTRA de 6 capas y 14 cabezas, destilado de un profesor TTA de 12 capas. El entrenamiento se estructuro en cuatro fases: (1) destilacion general del estudiante de 6 capas sobre 600k comentarios sin etiquetar, usando estados ocultos y mapas de atencion del profesor; (2) destilacion de tarea desde subconjuntos por cabeza de profesores (TTA 12L, KLUE RoBERTa-large, KcELECTRA-2023) con destilacion de capas intermedias, 150k comentarios pseudoetiquetados, pares de contra-discurso y comentarios reales revisados, con EMA (equivalente a v3.6); (3) fine-tuning con quantization-aware training bajo la aritmetica exacta del grafo de servicio, igualando los logits float de v3.6; y (4) transferencia de umbrales desde v3.6 por cabeza mediante igualacion de tasa de disparo sobre 12.000 comentarios reales sin etiquetar.

La innovacion tecnica principal es el empaquetado para servicio: un grafo ONNX con cuantizacion dinamica INT8 entrenada de forma consciente, verificado por el runtime (hashes de modelo y tokenizer, listas de policy, perfil de umbrales, acuerdo de cuantizacion >= 0,99 y paridad Python/Rust = 1,0). El acuerdo de cuantizacion medido es del 99,09% sobre 1.535 decisiones de DEV. El runtime es portable sin compilacion especifica de CPU: los pesos usan rango de 7 bits y son exactos en x86 AVX2 (AMD/Intel) y ARM. Se incluye un perfil `fp` (menos falsos positivos) que se activa copiando su `manifest.json` sobre el principal.

## Capacidades

- Clasificacion de texto multietiqueta por cabecera: harmful, profanity, identity_hate, insult, sexual_explicit, threat y political_hate (esta ultima solo advisory).
- Capa lexica adicional que marca profanidad y contenido sexual; un hit de slur de grupo solo bloquea si hay riesgo del modelo.
- Decision por linea para letras de canciones.
- Normalizacion de entrada con vectores de referencia (`normalize_vectors.json`).
- Policy de decision determinista (`policy.py`, `policy_vectors.json`) con 500 vectores de referencia contra los que se prueba la implementacion en Rust.
- Suite funcional y de estabilidad de 45 casos (`guard_suite.json`).
- Paridad Python/Rust verificada en 507/507 casos.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de comentarios de fans: el modelo clasifica cada comentario contra siete cabeceras y aplica la policy de bloqueo; su latencia p50 de 4,6 ms con 2 hilos de CPU permite filtrar en linea sin GPU.
- Chat de soporte: integrado en el backend de atencion al cliente para bloquear insultos y amenazas antes de que lleguen al agente, con el perfil `fp` si se prioriza reducir falsos positivos (precision 61,4% frente a 46,1% del perfil por defecto).
- Revision de letras de canciones: la decision por linea permite validar verso a verso, con una tasa de falsos positivos en verso del 1,4%.
- Filtrado previo en pipelines de contenido generado por usuarios: el grafo ONNX de 87 MB y 133 MB de RSS cabe en instancias CPU modestas, lo que abarata el despliegue a escala.
- Deteccion de contra-discurso y contexto: la tasa de falsos positivos en contexto es del 0,4% y en contra-discurso del 4,1%, util para no penalizar respuestas que citan odio para rebatirlo.
- Auditoria y reentrenamiento: el directorio `pytorch/` con pesos float QAT permite reexportar el grafo o continuar el entrenamiento con nuevos datos etiquetados.
- Verificacion en CI: la suite de 45 casos y los 500 vectores de policy se pueden ejecutar como tests de regresion antes de desplegar una nueva version del runtime.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (ruta de produccion con la policy de AUDENIQ):

| Conjunto / metrica | v3.6 | Serein 1 |
|---|---:|---:|
| Trafico real, 1.500 estratificado y ponderado: precision / recall / tasa de bloqueo | 45,8% / 91,1% / 18,5% | 46,1% / 91,1% / 18,3% |
| Test de revision de trafico real: recall / FP | 85,7% / 46,7% | 85,7% / 42,9% |
| BEEP dev (policy reetiquetada): recall / FP | 84,8% / 12,4% | 84,8% / 12,4% |
| Sexual explicito (policy): recall / FP | 80,8% / 30,8% | 82,1% / 31,9% |
| fresh3 / test2048 / fresh_test4096 F1 | 0,877 / 0,874 / 0,872 | 0,877 / 0,870 / 0,874 |
| K-HATERS F1 | 0,740 | 0,740 |
| Falsos positivos contexto / contra-discurso / verso | 0,7% / 6,8% / 1,5% | 0,4% / 4,1% / 1,4% |
| Suite funcional + estabilidad / paridad Python-Rust | 45/45 / 507/507 | 45/45 / 507/507 |

Rendimiento del runtime Rust con 2 hilos de CPU, 600 comentarios de trafico real, doble scoring y capa lexica:

| Metrica | v3.6 | Serein 1 |
|---|---:|---:|
| p50 / p95 / p99 | 13,3 / 40,2 / 67,4 ms | 4,6 / 11,2 / 17,4 ms |
| RSS | 149 MB | 133 MB |
| Tamano del grafo | 92 MB | 87 MB |

Perfiles de umbral:

| Perfil | Precision / recall / bloqueo (trafico real) | Recall / FP (BEEP-policy) | Recall sexual |
|---|---|---|---|
| default | 46,1% / 91,1% / 18,3% | 84,8% / 12,4% | 82,1% |
| fp | 61,4% / 84,1% / 12,7% | 72,8% / 5,5% | 79,5% |

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para servirse sin GPU mediante el runtime Rust `audeniq-text-model`; RSS de 133 MB y grafo de 87 MB.
- GPU: no necesaria ni documentada para el grafo ONNX INT8; no disponible informacion sobre aceleracion GPU.
- VRAM estimada: no aplica en el camino de servicio documentado (CPU); no disponible para una hipotetica ruta GPU.
- Opciones de despliegue: runtime Rust propio (`crates/core text_guard_runtime`); el grafo ONNX puede cargarse con runtimes ONNX estandar, aunque la verificacion de hashes, policy y paridad es especifica del runtime del autor.
- Latencia: p50 4,6 ms, p95 11,2 ms, p99 17,4 ms con 2 hilos de CPU sobre 600 comentarios reales.
- Portabilidad: sin compilacion especifica de CPU; pesos exactos en x86 AVX2 (AMD/Intel) y ARM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AUDENIQ Serein 1 | no disponible (ELECTRA 6 capas, 14 cabezas) | no disponible | Clasificador coreano de toxicidad, ONNX INT8 para CPU | Apache-2.0 (pesos); datos con licencias mixtas | Hugging Face, repo de 0,4 GB, 0 descargas |
| KcELECTRA-2023 | no disponible | no disponible | Encoder coreano usado como profesor en la destilacion | Apache-2.0 (base TTA) | Publico en Hugging Face |
| KLUE RoBERTa-large | no disponible | no disponible | Encoder coreano usado como profesor en la destilacion | no disponible en la informacion | Publico |
| K-HATERS (conjunto de evaluacion) | no aplica | no aplica | Benchmark de discurso de odio coreano | CC BY 4.0 | Publico |

No se dispone de datos comparativos de rendimiento frente a clasificadores alternativos fuera de los profesores citados; la model card solo compara con la version interna v3.6.

## Limitaciones y advertencias

- Solo coreano: no hay soporte multilingue declarado.
- Precision baja en trafico real (46,1% en el perfil por defecto): el modelo genera una proporcion relevante de falsos positivos, concentrados segun el autor en casos frontera de policy (critica dura a figuras publicas).
- El recall sexual explicito ronda el 82% con un FP del 31,9% en el perfil por defecto, lo que exige revision humana en ese eje.
- Riesgo de alucinacion no aplica (no genera texto), pero si riesgo de clasificacion erronea por contexto, ironia o citas de odio para rebatirlo (FP de contra-discurso del 4,1%).
- La licencia Apache-2.0 cubre los pesos, pero los datos de entrenamiento tienen licencias mixtas (K-MHaS y BEEP con CC BY-SA 4.0, K-HATERS con CC BY 4.0, KcELECTRA Apache-2.0); el texto crudo de entrenamiento no se incluye.
- La verificacion de integridad y la paridad Python/Rust dependen del runtime propio; usar otro runtime invalida esas garantias.
- La etiqueta `private` en el repositorio y las 0 descargas sugieren disponibilidad limitada o reciente; conviene confirmar el acceso antes de integrarlo.
- El modelo esta atado a la policy de AUDENIQ: cambiar umbrales o cabeceras requiere revalidar contra los 500 vectores de referencia y la suite de 45 casos.

## Enlaces

- Hugging Face: https://huggingface.co/AUDENIQ/audeniq-serein-1
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
