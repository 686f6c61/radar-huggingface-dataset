# lvjr3383/tiny-aya-refusal-steering

## Resumen

`lvjr3383/tiny-aya-refusal-steering` no es un modelo de lenguaje entrenado de forma convencional, sino un conjunto de artefactos de investigación sobre alineación y seguridad publicado por el usuario lvjr3383 en el marco del Lexsi AI Safety & Alignment Hackathon (Track 2b). El repositorio contiene una dirección de rechazo (refusal direction) extraída mediante diferencias de medias con la herramienta SafeTune sobre el modelo base CohereLabs/tiny-aya-global, de 3.350 millones de parámetros, junto con un adaptador LoRA de investigación, cuadernos reproducibles, figuras y tablas de resultados. Su propósito es estudiar si la activación de una dirección latente asociada al rechazo permite controlar el comportamiento de negativa del modelo sin degradar su utilidad general.

El hallazgo principal del estudio es negativo en cuanto a selectividad de seguridad: la dirección controla fuertemente el rechazo bajo intervenciones de gran intensidad, pero en la fuerza seleccionada por validación (k=0,1) no se detecta ventaja de seguridad frente a direcciones aleatorias emparejadas, con veredicto `NO_DETECTABLE_EFFECT`. Las intervenciones más agresivas incrementan principalmente el exceso de rechazo (over-refusal). Es relevante ahora porque aporta evidencia empírica reproducible sobre los límites del steering de activaciones como técnica de seguridad, un área con mucho interés pero pocos resultados negativos publicados con artefactos auditables.

El repositorio es pequeño (0,1 GB) y su licencia es "other", heredando los términos del modelo base. No es un modelo listo para producción: es material de interpretabilidad y evaluación para investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos de steering sobre el transformer del modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible para los artefactos; el modelo base Tiny Aya Global tiene 3,35 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (hereda los terminos de CohereLabs/tiny-aya-global) |
| Formato de pesos | safetensors; incluye `refusal_direction.pt` (vector unitario e índice de capa) y adaptador LoRA en `phase2_gsm8k_lora_adapter/` (r=16) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero. La pieza central es una dirección de rechazo calculada mediante diferencia de medias (difference-of-means) con SafeTune sobre el modelo base Tiny Aya Global, que se aplica en inferencia con `RefusalDirectionModel(mode="steer", strength=k*gap, layers=[layer])`, donde `gap` es la proyección de la Fase 1. Se incluye además un adaptador LoRA de rango 16 entrenado en la Fase 2 sobre GSM8K benigno, que el propio autor marca como artefacto de investigación y desaconseja usar porque redujo la precisión en MGSM.

El flujo experimental se organiza en cuatro fases con cuadernos ejecutados (Fase 1 de viabilidad, Fase 2 de deriva, Fase 3A de cribado y Fase 3B de steering), con configuración hasheada, reanudables y con escritura en Google Drive. Se emplearon CircuitKIT para descubrimiento de circuitos y comprobación de fidelidad (exploratoria, n=16 con pares de prompts de longitud desigual) y AuditKIT para las evaluaciones. Las dependencias están fijadas: `safetune==0.1.10`, `circuitkit==0.2.0`, `auditkit[transformers]==1.1.3`, transformers 5.21 y torch 2.11. La reproducibilidad requiere acceso a CohereLabs/tiny-aya-global, CohereLabs/aya-expanse-8b (juez de la Fase 3A) y allenai/wildguard (juez de la Fase 3B).

## Capacidades

- Control de rechazo en inferencia mediante steering de activaciones con una dirección precalculada y una fuerza ajustable (`k`).
- Evaluación de selectividad de seguridad frente a direcciones aleatorias emparejadas como control experimental.
- Descubrimiento y comprobación de fidelidad de circuitos con CircuitKIT (carácter exploratorio).
- Evaluación automática con AuditKIT y jueces LLM (WildGuard, Grok) de las salidas de seguridad.
- Adaptador LoRA de investigación para GSM8K (no recomendado para uso, reduce MGSM).
- Reproducción completa del pipeline en Colab (A100; L4 suficiente salvo pasos de CircuitKIT).
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar `refusal_direction.pt` para replicar el análisis de dirección de rechazo en Tiny Aya Global y estudiar qué capas concentran la representación del comportamiento de negativa.
- Auditoría de técnicas de steering como mecanismo de seguridad: el veredicto `NO_DETECTABLE_EFFECT` a k=0,1 sirve como referencia metodológica para diseñar evaluaciones con controles aleatorios emparejados antes de adoptar steering en producción.
- Estudio del over-refusal: las intervenciones de mayor intensidad permiten analizar empíricamente el coste de utilidad de forzar el rechazo, útil para calibrar umbrales en sistemas de moderación.
- Docencia y formación en seguridad de IA: los cuadernos ejecutados y las tablas de resultados constituyen material didáctico reproducible sobre alineación y evaluación con jueces automáticos.
- Desarrollo de pipelines de evaluación de seguridad: el manifiesto de evidencias con SHA-256 y el conjunto de datos gated de evidencias sirven de plantilla para auditorías trazables con prompts dañinos.
- Validación de herramientas (SafeTune, CircuitKIT, AuditKIT): el repositorio documenta versiones fijadas y flujos completos, útil para equipos que quieran evaluar estas librerías antes de integrarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `results_tables.md` y figuras generadas desde los ficheros de resultados, pero la información proporcionada no detalla cifras numéricas de MMLU, HumanEval, GSM8K ni MGSM. El resultado cualitativo documentado es el veredicto `NO_DETECTABLE_EFFECT` a la fuerza seleccionada por validación (k=0,1), con muestras modestas (n primario = 60) y baja tasa base de inseguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base tiene 3,35 mil millones de parámetros, por lo que en fp16 requeriría del orden de 7 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el autor indica Colab A100 para la reproducción completa; L4 es suficiente excepto en los pasos de CircuitKIT.
- GPU de consumo: no confirmado en la información disponible; por tamaño del modelo base es plausible en GPUs de consumo con memoria suficiente, pero no se documenta.
- Opciones de despliegue: el flujo se apoya en transformers 5.21 y torch 2.11 con SafeTune; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-refusal-steering (este repo) | artefactos sobre base de 3,35 mil millones | no disponible | Investigacion de steering de rechazo | other | HuggingFace, 0 descargas |
| CohereLabs/tiny-aya-global | 3,35 mil millones | no disponible | Modelo base multilingue | ver model card del base | HuggingFace |
| CohereLabs/aya-expanse-8b | 8 mil millones | no disponible | Juez LLM en la Fase 3A | ver model card del base | HuggingFace |
| allenai/wildguard | no disponible | no disponible | Juez de seguridad en la Fase 3B | ver model card del base | HuggingFace |

La comparación directa con otros repositorios de steering de rechazo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Estudio de un único modelo, sin réplica en otras arquitecturas ni escalas.
- Muestras modestas (n primario = 60) y baja tasa base de inseguridad, lo que limita la potencia estadística.
- Los resultados de seguridad de la Fase 2 se miden por palabras clave, una métrica gruesa y propensa a falsos positivos y negativos.
- Los resultados de la Fase 3B son juzgados por IA (WildGuard, Grok), no validados por humanos; la concordancia entre jueces no equivale a precisión.
- El steering es una intervención en tiempo de inferencia, no una reparación de pesos: no corrige el comportamiento del modelo subyacente.
- La comprobación de fidelidad de CircuitKIT es exploratoria (n=16, pares de prompts de longitud desigual).
- El adaptador LoRA de la Fase 2 redujo la precisión en MGSM y el autor lo desaconseja para uso.
- Licencia "other" que hereda los términos de CohereLabs/tiny-aya-global: verificar condiciones antes de cualquier uso comercial.
- El conjunto de evidencias está restringido (gated) por contener prompts dañinos; su manipulación requiere precauciones.
- Se usaron asistentes de codificación y revisión por IA durante el desarrollo, lo que conviene tener en cuenta al auditar el código.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lvjr3383/tiny-aya-refusal-steering
- Conjunto de datos de evidencias (gated): https://huggingface.co/datasets/lvjr3383/tiny-aya-refusal-steering-evidence
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Juez de la Fase 3A: https://huggingface.co/CohereLabs/aya-expanse-8b
- Juez de la Fase 3B: https://huggingface.co/allenai/wildguard
