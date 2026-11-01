# barryallen16/d1-3B-java-vuln-triage

## Resumen

`barryallen16/d1-3B-java-vuln-triage` es un ajuste fino (fine-tuning) del modelo fundacional híbrido `LiquidAI/d1-3B` orientado a una tarea muy concreta: el triaje de alertas de análisis estático de seguridad (SAST) en código Java. El autor, `barryallen16`, publica en este repositorio tanto los artefactos de evaluación como el código de ajuste contrastivo con LoRA, además de una suite de reproducción de benchmarks. El objetivo es reducir el ruido de los escáneres (Semgrep en este caso) decidiendo si una alerta señalada corresponde a una vulnerabilidad real y explotable o a un falso positivo.

La relevancia del modelo reside en su enfoque de evaluación: no se limita a métricas sintéticas, sino que mide sobre 174 hallazgos reales de seguridad Java provenientes de 68 avisos GHSA y sobre el censo completo de hallazgos Semgrep en los 126 repositorios del benchmark Vul4J. Según la model card, el modelo base `d1-3B` en modo zero-shot alcanza 0.8372 AUC en hunks de parche limpios (L3) y 0.8000 AUC en Vul4J, superando a un transformer denso de 4B (`Kev-4B`) en +12.05% y +13.33% de AUC respectivamente.

La arquitectura subyacente es un modelo híbrido SSM de 3B parámetros (Liquid AI d1-3B), con licencia Apache 2.0. El ajuste añade un marcador a nivel de sentencia (`>>> [ALERT LINE {n}]`) para anclar el sink señalado y mejorar la discriminación dentro de una misma regla, un problema clásico en triaje SAST. El modelo se presenta con pipeline `text-classification`, aunque su uso real es la estimación de probabilidad de verdadero positivo mediante la API `system_one_batch` del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida SSM (modelo base LiquidAI/d1-3B) |
| Parámetros totales | 3B (modelo base) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el quickstart usa float16) |
| Idiomas soportados | no disponible (orientado a código Java; idioma natural no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/d1-3B`, un modelo fundacional híbrido de tipo SSM (state space model) de 3B parámetros. Sobre esta base, el autor aplica un ajuste fino contrastivo con LoRA utilizando 416 pares reales pre/post parche (real-to-real contrastive tuning). Además del ajuste, se emplea una estrategia de prompt engineering con anclaje a nivel de sentencia: el sink señalado por el escáner se marca con `>>> [ALERT LINE {n}]`, lo que según la model card eleva el AUC within-rule de 0.4297 a 0.5986 en L0 y a 0.6321 en L2.

La evaluación se organiza en varios niveles: L0 (proxy de localización), L2 (hallazgos almacenados con CWE) y L3 (hunks de parche limpios con CWE), además del benchmark Vul4J sobre CVEs reales. Se reportan también controles de intercambio de reglas (rule-swap) para verificar que el modelo responde a la señal del código y no solo a la semántica de la regla, con un delta de señal de código estrictamente positivo (+0.0749 en L0, +0.1106 en L3). No se detalla en la información disponible el volumen total de tokens de entrenamiento ni la composición completa del dataset más allá de los 416 pares y los conjuntos de evaluación.

## Capacidades

- Clasificación binaria de alertas SAST: estima la probabilidad de que una alerta sea un verdadero positivo explotable.
- Razonamiento sobre flujo de datos (taint reachability): evalúa si una entrada no confiable alcanza el sink señalado sin una guarda efectiva.
- Anclaje a línea de alerta: interpreta el marcador `>>> [ALERT LINE {n}]` para localizar el sink en el fragmento de código.
- Integración con metadatos de regla: procesa regla, CWE, fichero y línea señalada junto con el código Java.
- Discriminación within-rule: capacidad de distinguir verdaderos y falsos positivos dentro de una misma regla del escáner.
- Evaluación sobre hallazgos reales: validado contra GHSA y Vul4J, no solo sobre datos sintéticos.
- Inferencia eficiente: 12-14 ms por alerta en GPU T4 y 1.0-2.0 s en CPU.
- No se documentan capacidades de generación libre, tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Triaje de alertas Semgrep en CI/CD: integrar el modelo como paso de filtrado tras el escáner para priorizar hallazgos con alta probabilidad de ser reales, reduciendo el ruido antes de la revisión manual. Su latencia de 12-14 ms por alerta en T4 lo hace viable en pipelines.
- Priorización de backlog de seguridad: ordenar los hallazgos históricos de un repositorio Java por probabilidad de explotabilidad, de modo que el equipo de AppSec aborde primero los sinks con mayor riesgo.
- Reducción de falsos positivos en auditorías: usar el marcador de línea y los criterios de taint-reachability para descartar alertas protegidas por validación o con entradas de fuentes confiables.
- Validación de parches: comparar hunks pre/post parche con el modelo para comprobar que la corrección elimina la señal de vulnerabilidad en el sink señalado.
- Enriquecimiento de plataformas SAST: incorporar la puntuación del modelo como campo adicional en herramientas de gestión de vulnerabilidades, aprovechando que procesa regla, CWE y fragmento de código.
- Investigación en detección de vulnerabilidades: reproducir los benchmarks L0/L2/L3 y Vul4J con `evaluate_d1.py` para comparar variantes de prompt, LoRA o ensembles sobre datos reales.
- Despliegue en entornos con recursos limitados: la inferencia en CPU (1-2 s por alerta) permite usar el modelo en estaciones de trabajo sin GPU para triaje por lotes.

## Benchmarks y rendimiento

Resultados reportados en la model card (AUC y P@90R donde se indica):

| Modelo / variante | L0 Location Proxy AUC | L0 Within-Rule AUC | L0 Code Signal Delta | L2 Stored + CWE AUC | L2 Within-Rule AUC | L3 Clean Hunk + CWE AUC | L3 Within-Rule AUC | Vul4J Real CVEs AUC |
|---|---|---|---|---|---|---|---|---|
| Heuristic Baseline | 0.5886 | 0.5000 | N/A | 0.6223 | 0.5000 | 0.5235 | 0.5000 | 0.5778 |
| Kev-4B | 0.7521 | 0.4612 | +0.0180 | 0.7594 | 0.4820 | 0.7167 | 0.5100 | 0.6667 |
| d1-3B Zero-Shot (Audit) | 0.6941 | 0.4297 | +0.0202 | 0.7861 | 0.4571 | **0.8372** | 0.5495 | **0.8000** |
| d1-3B Targeted Prompt | 0.6098 | **0.5986** | +0.0749 | 0.5843 | **0.6321** | 0.6261 | 0.5761 | **0.8000** |
| d1-3B Contrastive LoRA | 0.5953 | 0.5374 | **+0.0839** | 0.5214 | 0.5095 | 0.5988 | **0.6594** | 0.5444 |
| d1-3B 50/50 Ensemble | 0.6227 | **0.6213** | +0.0794 | 0.5682 | **0.6214** | 0.6125 | **0.6280** | **0.8000** |

Datos adicionales reportados: en Vul4J, d1-3B alcanza 0.8000 AUC y 0.5556 P@90R. Latencia de inferencia de 12-14 ms por alerta en Nvidia T4 con 6.25 GiB de VRAM pico; 1.0-2.0 s en CPU multinúcleo estándar.

## Requisitos de hardware

- VRAM estimada: 6.25 GiB pico reportados para inferencia en float16 sobre Nvidia T4.
- GPU recomendadas: Nvidia T4 (validada en la model card); por tamaño de 3B en fp16, cabría también en RTX 3090, RTX 4090, A100 y H100, aunque no se reportan mediciones en estas.
- GPU de consumo: sí, un modelo de 3B en fp16 requiere aproximadamente 6-7 GiB, por lo que cabe en GPUs consumer con 8 GiB o más (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti); no confirmado explícitamente por el autor.
- Despliegue: el quickstart usa `transformers` con `trust_remote_code=True` y `torch_dtype=torch.float16`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 12-14 ms por alerta en T4; 1.0-2.0 s por alerta en CPU.
- Reproducción de benchmarks: `python evaluate_d1.py` requiere solo Python y numpy, sin dependencias adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | L3 Clean Hunk AUC | Vul4J AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d1-3B (este ajuste) | 3B | Híbrida SSM | 0.8372 (zero-shot) / 0.5988 (LoRA) | 0.8000 | Apache 2.0 | HuggingFace |
| Kev-4B | 4B | Transformer denso | 0.7167 | 0.6667 | no disponible | referenciado en la model card |
| Heuristic Baseline | N/A | Reglas del escáner | 0.5235 | 0.5778 | N/A | N/A |

No se dispone de información sobre otros modelos comparables de triaje SAST en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.
- El ajuste LoRA contrastivo empeora el rendimiento en Vul4J (0.5444 AUC) frente al zero-shot (0.8000), por lo que la variante a desplegar depende del dominio objetivo.
- El rendimiento within-rule es moderado incluso en la mejor variante (0.6594 en L3 con LoRA), lo que indica dificultad para discriminar dentro de una misma regla.
- La evaluación se limita a Java y a Semgrep; no hay evidencia de generalización a otros lenguajes o escáneres.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `LiquidAI/d1-3B` debe verificarse por separado en cuanto a sus términos.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del modelo base.
- Los datos de benchmarks provienen únicamente de la model card del autor; no hay verificación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barryallen16/d1-3B-java-vuln-triage
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Benchmark Vul4J: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
