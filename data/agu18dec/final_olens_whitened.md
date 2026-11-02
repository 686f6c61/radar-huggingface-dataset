# agu18dec/final_olens_whitened

## Resumen

`final_olens_whitened` es un artefacto de interpretabilidad, no un modelo generativo al uso. Se trata de una "lente" (OLens) entrenada sobre el modelo base Qwen/Qwen3.6-27B que permite leer vectores del residual stream de cualquiera de sus 64 capas y traducirlos a texto. El autor es agu18dec y el repositorio se publicó el 1 de noviembre de 2026 con un tamano de 1,9 GB.

Este repositorio contiene la "lente A" del estudio de ablación `final_olens`, hermana de `agu18dec/final_olens` (lente B). Comparte con ella datos, arquitectura de lente, inyección, prompt y muestreador, y difiere únicamente en que el reconstructor (AR) y la recompensa de RL se calcularon en un espacio residual "blanqueado" (whitened) en lugar del espacio crudo. Es la lente base del estudio de ablaciones del autor.

Su relevancia es acotada pero específica: ofrece a investigadores en interpretabilidad mecanicista una herramienta para inspeccionar qué información codifica el residual stream de Qwen3.6-27B capa a capa, con métricas declaradas sobre un benchmark propio (WorkspaceBench). No es un modelo para producción ni para generación de texto convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de lectura de activaciones sobre transformer Qwen3.6-27B (LoRA r16/α32 all-linear + LayerNorm→Linear head) |
| Parametros totales | 117M entrenables (la lente); el modelo base Qwen3.6-27B no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` con tensores entrenables) + `export.json` |

## Arquitectura y entrenamiento

La lente se compone de un reconstructor (AR) y un inverter. El AR es un LoRA r16/α32 (all-linear) con cabeza LayerNorm→Linear que lee una etiqueta `[Layer NN]` más un span de respuesta de 1 a 32 tokens y predice el residual en el token anterior al span. La pérdida es 2(1 − cos) en el espacio blanqueado W(x − μ). El inverter es el mismo LoRA sobre el modelo base, donde el vector entra en un token slot `㈜` con embedding de entrada sustituido por 1000 · h/‖h‖, entrenado de forma supervisada sobre las salidas del AR con el span de texto como objetivo.

El entrenamiento sigue tres etapas: primero se ajusta una base de blanqueado por capa (media μ y W = (Σ + 0,1·mean-diag(Σ)·I)^−1/2) a partir de momentos del residual en el conjunto AR-train; después se entrena el AR (batch 576, AdamW lr 7e-5 constante durante 171.155 pasos y decaimiento lineal sobre 34.231 pasos, una pasada de 118M ejemplos); finalmente se aplica RL con GRPO desde el inverter (lr 5e-5, KL 0,005, temperatura 1, top-p 1, 128 tokens nuevos), con recompensa igual a la fracción de varianza explicada en espacio blanqueado al reconstruir el AR congelado. Los datos son respuestas del propio Qwen3.6-27B (temperatura 1, thinking off) a turnos de usuario de WildChat, divididos por hash del primer turno y balanceados sobre las 64 capas.

## Capacidades

- Lectura de vectores del residual stream de Qwen3.6-27B en cualquiera de sus 64 capas (0–63), antes del RMSNorm final.
- Traducción de un vector residual a texto descriptivo mediante muestreo (temperatura 1, top-p 1, hasta 128 tokens nuevos).
- Lectura con múltiples muestras por vector (n=4 mejora la métrica declarada de .657 a .758 en el paso 75 de RL).
- Evaluación cuantitativa sobre WorkspaceBench (all-Opus headline_23, 1 lectura por celda).
- No soporta tool calling, agentes, visión, audio ni generación de texto convencional: es una herramienta de interpretabilidad.
- Capacidades multilingües: no disponibles (heredadas del modelo base, no documentadas).

## Casos de uso

- Investigación en interpretabilidad mecanicista: inspeccionar qué codifica el residual stream de Qwen3.6-27B en una capa concreta para un prompt dado, usando `residual()` y `read()` del loader `olens.py`.
- Análisis de representaciones por capa: comparar la legibilidad de vectores entre capas (0–63) para estudiar cómo se transforma la información a lo largo de la profundidad del modelo.
- Auditoría de sesgos y contenido: leer qué información semántica subyace en activaciones concretas para detectar representaciones problemáticas.
- Estudio de ablaciones: usar la lente A como base para reproducir o extender el estudio `olens-ablations` del autor, comparando con la lente B (`final_olens`).
- Validación de técnicas de blanqueado: evaluar el efecto del espacio blanqueado frente al crudo en la calidad de reconstrucción y en la recompensa de RL.
- Docencia e investigación académica: material reproducible para cursos o papers sobre lectura de activaciones y interpretabilidad de LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre WorkspaceBench (all-Opus headline_23, 1 lectura por celda):

| Checkpoint | WorkspaceBench | Parametros entrenables |
|---|---|---|
| `lens_rl_step600/` | .657 | 117M (LoRA) |
| `lens_rl_step300/` | **.678** [.663, .695] | 117M |
| `lens_rl_step150/` | .669 | 117M |
| `inverter/` (sin RL) | .616 [.599, .633] | 117M |

Con 4 muestras por vector en lugar de 1, la puntuación sube a .758 (medida en el paso 75 de RL). La lente B (`final_olens`) alcanza .683 en el paso 600 sobre el mismo benchmark. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 60 GB de memoria GPU para cargar la lente junto con el modelo base Qwen3.6-27B (según el quickstart del autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o similares con al menos 60 GB de VRAM.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, etc.) en la configuración documentada.
- Opciones de despliegue: carga mediante `olens.py` con `torch==2.9.1`, `transformers==5.11.0`, `peft==0.19.1`, `safetensors` y `flash-linear-attention==0.5.1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WorkspaceBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `final_olens_whitened` (lente A) | 117M entrenables + base 27B | no disponible | .678 (step300) | no disponible | HuggingFace |
| `final_olens` (lente B) | 117M entrenables + base 27B | no disponible | .683 (step600) | no disponible | HuggingFace |
| `olens-ablations` | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otras lentes comparables fuera del ecosistema del autor.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para tareas de texto, código o razonamiento; su función es exclusivamente leer activaciones.
- Requiere el modelo base Qwen3.6-27B (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) cargado desde el Hub; el repo solo contiene los tensores entrenables de la lente.
- El AR no está incluido en el repositorio: predice direcciones residuales en la base blanqueada, por lo que puntuar con él requiere además esa base.
- Licencia no especificada: riesgo legal para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no está evaluado.
- Riesgo de alucinación en las lecturas: las descripciones generadas por la lente son muestreos estocásticos (temperatura 1) y pueden no reflejar fielmente el contenido del vector.
- Métricas limitadas a un benchmark propio (WorkspaceBench) sin comparación con estándares externos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/agu18dec/final_olens_whitened
- Lente B (hermana): https://huggingface.co/agu18dec/final_olens
- Estudio de ablaciones: https://huggingface.co/agu18dec/olens-ablations
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
