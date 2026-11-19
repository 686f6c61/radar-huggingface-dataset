# autara-ai/Autara-OF

## Resumen

Autara-OF v2 (también llamado Autara-Omni) es un modelo fundacional omni-fisiológico tri-modal desarrollado por Autara Research Labs. Decodifica de forma conjunta señales de electroencefalografía (EEG), espectroscopia funcional de infrarrojo cercano (fNIRS, con las componentes HbO y HbR) y electrocardiografía (ECG) en tiempo real, y produce cinco señales clínicas simultáneas a partir de una única arquitectura. A diferencia de los clasificadores BCI tradicionales de tarea única, admite cualquier subconjunto no vacío de sensores en inferencia, lo que permite desde un modo completo con tres modalidades hasta un modo reloj inteligente con solo ECG.

El modelo está implementado íntegramente en Rust sobre el framework `burn`, con un núcleo `#![no_std]`, lo que lo orienta a despliegues embebidos y de baja latencia. La fusión se realiza mediante un cuello de botella latente de tipo Perceiver con consultas neuro-autonómicas aprendibles y una compuerta dinámica de fiabilidad por modalidad. El repositorio de Hugging Face no contiene pesos publicados (tamaño de 0.0 GB) y no se declara el número de parámetros.

La relevancia actual reside en su enfoque de fusión multimodal tolerante a sensores ausentes y en su esquema de salida multi-cabeza orientado a estados cognitivo-motores, carga cognitiva, intención motora, fatiga y una representación latente de bioestado de 128 dimensiones. No obstante, los resultados publicados en sujetos no vistos son modestos y el modelo no está disponible como artefacto descargable en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders multi-escala por modalidad (EEG, fNIRS, ECG) + fusión Perceiver con cuello de botella latente, 3 bloques Transformer Pre-LayerNorm con SwiGLU y pooling latente atencional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de 5 s por modalidad: EEG 640 muestras a 128 Hz, fNIRS 50 muestras a 10 Hz, ECG 1250 muestras a 250 Hz; número de tokens latentes K = 8 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el modelo procesa señales fisiológicas, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos; implementación en Rust sobre `burn`) |

## Arquitectura y entrenamiento

El modelo se compone de tres encoders específicos de modalidad. El encoder EEG recibe 16 canales anatómicos (FP1, FP2, F3, Fz, F4, FC3, FC4, C3, C1, Cz, C2, C4, CP1, CP2, P3, P4) a 128 Hz, aplica un banco de filtros temporales paralelo con tamaños de kernel 7, 15 y 31 (bandas Beta/Gamma, Alpha/Mu y Delta/Theta), mezcla espacial del montaje y tokeniza en parches de 250 ms (20 tokens). El encoder fNIRS procesa 32 canales derivados de la ley de Beer-Lambert modificada (16 HbR y 16 HbO) a 10 Hz, con alineación temporal de la respuesta hemodinámica de +4.0 s, banco de filtros de onda lenta (k = 5, 11, 21) y tokenización en parches de 0.5 s (10 tokens). El encoder ECG trabaja sobre una derivación a 250 Hz con filtros de kernel 9, 25 y 63 (QRS, ondas P/T y ritmo R-R) y compresión jerárquica a 25 tokens.

La fusión se realiza mediante un Perceiver con embeddings posicionales temporales y de identidad de modalidad aprendibles, una compuerta dinámica de fiabilidad que genera pesos de confianza por sensor y enmascara sensores desconectados, y K = 8 consultas latentes neuro-autonómicas que hacen cross-attention sobre los flujos activos, seguidas de tres bloques Transformer y pooling latente atencional. El entrenamiento se realizó sobre OpenNeuro `ds007554` (CMx7-MM: 30 sujetos × 3 sesiones × 7 tareas), con 29.465 ventanas de entrenamiento de los sujetos sub-001 a sub-024 y 9.462 ventanas de test estrictamente no vistas de sub-025 a sub-030, usando pérdida multi-tarea y Omni Modality Dropout. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO (no aplica a este dominio).

## Capacidades

- Decodificación conjunta de EEG, fNIRS y ECG en tiempo real, con soporte para cualquier subconjunto no vacío de sensores: EEG+fNIRS+ECG, EEG+fNIRS, EEG+ECG, fNIRS+ECG, EEG solo, fNIRS solo o ECG solo.
- Clasificación de 7 estados cognitivo-motores: aritmética mental, N-Back, imaginería motora, motor pasivo, motor activo, N-Back + aritmética y doble tarea completa.
- Regresión continua de carga cognitiva en el rango 0.0–1.0 (mapeado desde escala 1–9).
- Clasificación de intención motora en 3 clases: no motor, motor imaginado y motor activo/físico, orientada a control BCI directo.
- Regresión continua de fatiga/alerta en el rango 0.0–1.0 (mapeado desde la escala KSS 1–9).
- Generación de un embedding latente universal de bioestado de 128 dimensiones.
- Salida de pesos de confianza por modalidad (`modality_trust`) normalizados para EEG, fNIRS y ECG.
- No soporta tool calling, function calling, agentes, generación de texto ni capacidades multilingües; es un modelo de señales fisiológicas, no de lenguaje.

## Casos de uso

- Monitorización de carga cognitiva en entornos de trabajo de alta demanda: el modelo estima un valor continuo de carga (0.0–1.0) a partir de EEG y fNIRS en ventanas de 5 s, útil para ajustar la dificultad de tareas o detectar sobrecarga en operadores.
- Interfaz cerebro-computadora para control protésico o de cursor: la cabeza de 3 clases motoras permite distinguir entre reposo, imaginería motora y movimiento activo, con una latencia de inferencia de aproximadamente 15 ms en RTX 3070 en modo EEG+fNIRS.
- Detección de fatiga en conducción o turnos: el modo reloj inteligente (ECG solo) estima la escala KSS con un error medio absoluto de 1.31 sobre 9, adecuado para alertas tempranas de somnolencia en dispositivos wearables.
- Investigación en neurociencia cognitiva: la representación latente de 128 dimensiones sirve como bioestado compacto para análisis posteriores, clustering de sujetos o comparación entre condiciones experimentales.
- Evaluación de doble tarea: la clasificación de 7 estados incluye explícitamente N-Back + aritmética y doble tarea completa, lo que permite estudiar la interferencia entre carga cognitiva y control motor.
- Despliegue embebido de bajo consumo: el núcleo en Rust `#![no_std]` con `burn` y soporte WGPU facilita la integración en dispositivos con recursos limitados, como cascos EEG portátiles o relojes con ECG.
- Fusión tolerante a fallos de sensores: la compuerta dinámica de fiabilidad enmascara sensores desconectados y mantiene la inferencia con los restantes, útil en configuraciones ambulatorias donde los electrodos pueden perder contacto.

## Benchmarks y rendimiento

Resultados publicados en sujetos no vistos (sub-025 a sub-030), zero-shot:

| Modo de hardware | Precisión 7 clases (azar 14.3%) | Macro-F1 | Motor 3 clases (azar 33.3%) | MAE carga (/9) | MAE fatiga KSS (/9) | Latencia GPU estable (RTX 3070) |
|---|---:|---:|---:|---:|---:|---:|
| Omni completo (EEG + fNIRS + ECG) | 23.4% | 22.3% | 47.9% | 2.51 | 1.06 | ~16 ms |
| BCI híbrido (EEG + fNIRS) | 24.0% | 22.0% | 48.0% | 2.43 | 0.98 | ~15 ms |
| Wearable (EEG + ECG) | 20.0% | 18.8% | 46.1% | 2.54 | 0.98 | ~16 ms |
| Solo EEG | 20.9% | 18.5% | 45.7% | 2.51 | 0.92 | ~14 ms |
| Solo fNIRS | 20.1% | 19.0% | 46.9% | 2.73 | 0.96 | ~12 ms |
| Solo ECG (modo reloj) | 13.7% | 11.0% | 42.5% | 2.91 | 1.31 | ~11 ms |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no publica pesos ni tamaño de parámetros).
- GPU de referencia en los benchmarks: RTX 3070, con latencias de 11 a 16 ms por inferencia según el modo de sensores.
- No se especifican requisitos para A100, H100 u otras GPU de datacenter.
- Compatibilidad con GPU de consumo: sí, la RTX 3070 se usa como referencia; no se detallan otras.
- Despliegue: binarios Rust propios (`cargo run --release --bin infer`) con modos `omni`, `bci`, `wearable` y `ecg`; soporte de WGPU para cómputo en GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este dominio).
- Throughput: no disponible; solo se publica latencia por inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los clasificadores BCI y modelos fundacionales de señales fisiológicas existentes no se detallan en la model card, por lo que no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- El rendimiento en sujetos no vistos es bajo: la precisión de 7 clases en el mejor modo (24.0%) está solo 9.7 puntos por encima del azar (14.3%), y el Macro-F1 máximo es 22.3%. No es adecuado para uso clínico o de producción sin validación adicional.
- El error de carga cognitiva (MAE 2.43–2.91 sobre 9) y de fatiga (MAE 0.92–1.31 sobre 9) indica una precisión limitada para aplicaciones que requieran estimaciones finas.
- El modo solo ECG es claramente inferior (13.7% en 7 clases, por debajo del azar), lo que limita su uso como reloj inteligente autónomo.
- El entrenamiento se limita a un único dataset (OpenNeuro ds007554) con 30 sujetos y 7 tareas, lo que reduce la generalización a otras poblaciones, montajes de electrodos o paradigmas.
- El modelo solo declara soporte de inglés en metadatos, aunque procesa señales fisiológicas y no texto; no hay capacidades lingüísticas.
- No se han publicado pesos en el repositorio de Hugging Face (tamaño 0.0 GB), por lo que no es posible descargar ni ejecutar el modelo tal cual; solo está disponible el código y la documentación.
- La licencia MIT permite uso comercial, pero la ausencia de pesos y de validación clínica desaconseja cualquier aplicación médica sin estudios adicionales.
- No se documentan sesgos demográficos, pero al entrenar con 30 sujetos no se garantiza equidad entre poblaciones.
- No se especifican riesgos de alucinación en el sentido habitual (no genera texto), pero sí existe riesgo de falsos positivos en la clasificación de estados cognitivos y motores.

## Enlaces

- Hugging Face: https://huggingface.co/autara-ai/Autara-OF
- Paper (referenciado en la model card): `paper/autara_omni_paper.pdf` dentro del repositorio
- Dataset: OpenNeuro `ds007554` (CMx7-MM)
- Framework de implementación: `burn` (Rust)
- No se han encontrado otros enlaces (blogs, repos, demos) en la información disponible.
