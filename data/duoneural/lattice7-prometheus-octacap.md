# DuoNeural/lattice7-prometheus-octacap

## Resumen

Lattice-7 Prometheus (OctaCap) es un artefacto de investigación publicado por DuoNeural Lab en noviembre de 2026. Se presenta como una variante de arquitectura CDM (Crystalline Diffusion Model), un diseño experimental propio del laboratorio que combina geometría hiperbólica de bola de Poincaré para el enrutamiento entre "slots" y un mecanismo denominado Crystal Telepathy para el acoplamiento entre capas. El modelo se ha entrenado mediante destilación de conocimiento desde un profesor Qwen de 27B cuantizado a 4 bits.

El modelo es deliberadamente pequeño: unos 177 millones de parámetros, 8 capas y una dimensión oculta de 768, con 8 slots de enrutamiento. No es un modelo de propósito general listo para producción, sino una pieza de exploración sobre geometrías de enrutamiento no euclídeas. La model card lo etiqueta explícitamente como "research artifact" pendiente de evaluación downstream, con el mejor checkpoint guardado en el paso 55.500 de 100.000.

Su relevancia actual es limitada fuera del ámbito de la investigación: no hay benchmarks publicados, no hay pipeline declarado, cero descargas y cero likes. Resulta interesante como muestra de técnicas de destilación sobre arquitecturas alternativas y como evidencia empírica (limitada) del comportamiento de la curvatura aprendida en espacios hiperbólicos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM (Crystalline Diffusion Model) con enrutamiento en bola de Poincaré |
| Parametros totales | ~177M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con seq len de 512) |
| Tipos de cuantizacion | no disponible (el profesor se cuantizo a 4 bits; el modelo publicado no declara cuantizaciones) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 1,8 GB) |

## Arquitectura y entrenamiento

La arquitectura CDM se describe como una familia propia de DuoNeural con 8 capas, dimensión oculta 768 y 8 slots (K=8). El enrutamiento entre slots opera en una bola de Poincaré hiperbólica con curvatura aprendida, que según la model card saturó en c=1.44 en las 8 capas con tau*=1e10. El mecanismo Crystal Telepathy está habilitado con beta=0.5 y presenta un tele_norm entre 0.39 y 0.54 por capa. Se confirma el fenómeno DHP (denominación no expandida en la información disponible) en las 8 capas, con tau* alcanzando 7,1e9, descrito como "cristalización de atractores discretos" en el espacio de enrutamiento de Poincaré.

El entrenamiento se realizó por destilación de conocimiento desde un profesor Qwen 27B cuantizado a 4 bits, sobre el dataset FineWeb, con alpha=0.7 y temperatura 3.0. Se ejecutaron 88.900 pasos (mejor checkpoint en el 55.500), con batch de 1 y acumulación de gradiente de 8 (efectivo 8), longitud de secuencia 512 y un total de aproximadamente 6 días sobre una RTX 4080 SUPER de 32 GB. No se menciona RLHF ni DPO. El mejor checkpoint reporta Val BPB de 0,9327, perplejidad aproximada de ~19,5 y KLD respecto al profesor de ~0,18.

## Capacidades

- Generación de texto autorregresiva en inglés, derivada de la destilación del profesor Qwen 27B.
- Enrutamiento entre slots en espacio hiperbólico con curvatura aprendida (capacidad arquitectónica, no una funcionalidad de usuario).
- Acoplamiento entre capas mediante Crystal Telepathy (mecanismo interno experimental).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Multilingüe: solo inglés según la model card.
- No se declaran capacidades de visión, audio ni modo "thinking".
- No hay pipeline declarado en Hugging Face, por lo que la interfaz de uso estándar no está definida.

## Casos de uso

- Investigación sobre geometrías de enrutamiento no euclídeas: el modelo sirve como banco de pruebas para estudiar el comportamiento de la curvatura aprendida en bolas de Poincaré y su saturación durante el entrenamiento, con datos concretos (c=1.44, tau*=1e10) que pueden reproducirse o contrastarse.
- Estudio de destilación de conocimiento desde profesores grandes a estudiantes pequeños: con un profesor de 27B y un estudiante de 177M, la KLD reportada (~0,18) permite analizar la transferencia de capacidades en una proporción de compresión de aproximadamente 150:1.
- Experimentos de ablación sobre mecanismos de acoplamiento entre capas: el parámetro beta=0.5 de Crystal Telepathy y los valores de tele_norm por capa permiten diseñar variantes y medir su impacto en BPB y perplejidad.
- Reproducción de artefactos de investigación: la model card documenta hiperparámetros (alpha, temperatura, pasos, hardware) suficientes para intentar reproducir el entrenamiento en una GPU de consumo de 32 GB, algo poco habitual.
- Docencia y formación en arquitecturas alternativas: útil como ejemplo práctico de cómo se documenta un modelo experimental con métricas internas (DHP, tau*, tele_norm) más que con benchmarks estándar.
- Análisis de la viabilidad de entrenar variantes arquitectónicas en hardware de consumo: el registro de ~6 días en una RTX 4080 SUPER ofrece una referencia realista de coste para experimentos de este tamaño.

## Benchmarks y rendimiento

La model card solo reporta métricas internas de validación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Mejor paso | 55.500 |
| Val BPB | 0,9327 |
| Val PPL (aprox.) | ~19,5 |
| Teacher KLD | ~0,18 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~177M de parámetros, en FP16 ocuparía aproximadamente 350 MB de pesos, y en 8 bits unos 180 MB, aunque el formato de pesos publicado no está declarado.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una RTX 4080 SUPER de 32 GB (nota: la RTX 4080 SUPER comercial tiene 16 GB; la model card indica 32 GB, dato que conviene verificar).
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no hay confirmación ni instrucciones de despliegue.
- Opciones de despliegue: no disponible. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al ser una arquitectura CDM no estándar es probable que requiera código propio del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay benchmarks públicos ni modelos directamente comparables de la misma familia CDM. Se ofrece una comparación estructural con alternativas de tamaño similar, sin datos de rendimiento equiparables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lattice-7 Prometheus (OctaCap) | ~177M | no disponible (entrenado a 512) | Apache 2.0 | Repo Hugging Face, 0 descargas |
| Qwen2.5-0.5B (referencia de tamano cercano) | ~494M | 32.768 tokens | Apache 2.0 | Ampliamente disponible |
| SmolLM2-135M | ~135M | 8.192 tokens | Apache 2.0 | Ampliamente disponible |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache 2.0 | Ampliamente disponible |

La comparación de rendimiento con estos modelos no está disponible porque Lattice-7 no publica benchmarks estándar.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación downstream: la propia model card lo declara pendiente de evaluación.
- Sin benchmarks estándar publicados; no es posible comparar su calidad con modelos convencionales.
- Solo inglés; no se declara soporte multilingüe.
- Contexto de entrenamiento corto (512 tokens) y sin longitud de contexto de inferencia declarada.
- Arquitectura no estándar (CDM) sin pipeline ni formato de pesos declarado, lo que complica su integración en herramientas habituales.
- Riesgo de alucinación no evaluado; no hay datos sobre fidelidad factual.
- Sesgos no documentados; el dataset FineWeb tiene sesgos conocidos de web filtrada en inglés.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción.
- Inconsistencia en la model card: indica 88.900 pasos totales pero también 55.500/100.000; conviene tratar los datos con cautela.
- El dato de memoria de la RTX 4080 SUPER (32 GB) no coincide con la especificación comercial habitual (16 GB); verificar antes de asumir requisitos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/lattice7-prometheus-octacap
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
