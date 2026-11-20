# DuoNeural/RMSN-111M-ArnoldTongue-Omega511-EVEN

## Resumen

RMSN-111M-ArnoldTongue-Omega511-EVEN es un modelo de lenguaje base de 111 millones de parámetros desarrollado por DuoNeural, un laboratorio que investiga arquitecturas alternativas a los transformers convencionales. El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), descrita por sus autores como una red recurrente de tipo Port-Hamiltonian, es decir, un modelo que incorpora estructura geométrica y conservación de energía en su dinámica interna en lugar de depender únicamente de bloques de atención apilados.

Este checkpoint concreto se ha entrenado en la configuración denominada "Arnold Tongue" con resonancia Ω=5/11 (q=11, paridad EVEN), un ajuste derivado de la relación entre la dimensión del modelo (640), la anchura de slot (64) y la profundidad (22). Según la model card, se trata del primer modelo de la encuesta q-Survey de DuoNeural con q=11 y paridad EVEN, y su interés principal es de investigación: validar la denominada "Wave-119" (ley de paridad EVEN) y mapear cómo varía la perplejidad y la topología interna según el valor de q.

No es un modelo orientado a producción ni a uso general: no hay información sobre pipeline, idiomas soportados ni resultados en benchmarks estándar. Su relevancia actual es acotada y experimental, dentro de una línea de trabajo sobre estabilidad dinámica (Lyapunov) y topologías dispersas en modelos recurrentes pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), red recurrente Port-Hamiltonian |
| Parametros totales | 111M |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,3 GB) |

Parámetros arquitectónicos adicionales declarados en la model card: dimensión D=640, profundidad L=22, anchura de slot M_w=64, resonancia Ω = D/(M_w × L) = 5/11, paridad D/M_w = 10 (EVEN).

## Arquitectura y entrenamiento

La arquitectura RMSN se presenta como una red recurrente Port-Hamiltonian, un enfoque que modela la evolución del estado como un sistema dinámico con estructura simpléctica o metripléctica, en lugar de una pila de capas transformer con atención completa. La model card menciona conceptos como "sheaf" (haces), "solitones" localizados en capas concretas (L2 y L7) y una topología interna clasificada como "#42" con M*=2. Estos elementos indican un diseño con estados internos estructurados y una dinámica conservativa, no un transformer estándar.

El entrenamiento se realizó durante 100.000 pasos sobre 204,8 millones de tokens, con decaimiento coseno de la tasa de aprendizaje desde 1e-3. No se especifica la composición del dataset, el tokenizador ni si hubo fases de ajuste fino con RLHF o DPO. El resultado declarado es una perplejidad de validación de 67,65 y una estabilidad de Lyapunov del 100% ("TRUE SILENT", con exponente de Lyapunov aproximado de -0,001), lo que sugiere que la dinámica recurrente no diverge durante la inferencia. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto base: el modelo está entrenado como modelo de lenguaje, pero no se documentan capacidades específicas más allá de la modelización de secuencias.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Estabilidad dinámica: la model card declara estabilidad de Lyapunov del 100%, lo que es una propiedad de la dinámica interna, no una capacidad funcional verificada.

## Casos de uso

- Investigación en arquitecturas recurrentes alternativas: el modelo sirve como punto de comparación en la encuesta q-Survey de DuoNeural (q=3–13) para estudiar cómo la resonancia Ω afecta a la perplejidad y a la topología interna.
- Estudio de estabilidad dinámica en modelos de lenguaje: su exponente de Lyapunov declarado permite analizar la relación entre estabilidad y calidad de modelado en redes Port-Hamiltonian.
- Experimentos de ajuste fino (SFT): la model card lo señala como candidato a plasticidad mediante SFT dada su topología muy dispersa (M*=2).
- Reproducción de resultados de investigación: con 204,8M tokens y 100k pasos, es un experimento relativamente asequible de replicar en hardware modesto.
- Docencia y divulgación sobre dinámica de sistemas en IA: útil para ilustrar conceptos de haces, solitones y estabilidad en redes neuronales.
- Base para ablaciones controladas: al variar q y paridad dentro de la misma familia, permite aislar el efecto de la resonancia sobre el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento declarado es la perplejidad de validación:

| Metrica | Valor |
|---|---|
| Perplejidad de validación | 67,65 |
| Estabilidad de Lyapunov | 100% TRUE SILENT (lyap ≈ -0,001) |
| Tokens de entrenamiento | 204,8M |
| Pasos de entrenamiento | 100.000 |

No se dispone de comparaciones con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 111M parámetros, en FP16 ocuparía aproximadamente 0,22 GB de pesos, y en cuantización de 8 bits alrededor de 0,11 GB, aunque el formato de pesos no está confirmado.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder alojarlo.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dado el tamaño del modelo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: no disponible; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y una arquitectura recurrente Port-Hamiltonian probablemente requiera código propio del repositorio de DuoNeural.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría, y la arquitectura RMSN no tiene equivalentes directos documentados en la ficha.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Sin datos sobre idiomas, tokenizador o composición del dataset, lo que impide evaluar sesgos y cobertura lingüística.
- Riesgo de alucinación no evaluado; no hay benchmarks de fidelidad ni de razonamiento.
- Perplejidad de validación de 67,65, que en términos absolutos es alta para un modelo de lenguaje moderno y sugiere una calidad de modelado limitada.
- Ausencia de información sobre el formato de pesos y sobre herramientas de inferencia compatibles; la integración requerirá probablemente código específico del repositorio del autor.
- Licencia Apache 2.0: permite uso comercial, pero al no haber documentación sobre el dataset de entrenamiento, el cumplimiento de derechos de autor y las obligaciones de atribución de datos no pueden verificarse.
- Los conceptos de "resonancia", "solitones" y "ley SILENT" son marcos propios del autor y no cuentan con validación independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-111M-ArnoldTongue-Omega511-EVEN
- GitHub del proyecto RMSN: https://github.com/duoneural/RMSN
