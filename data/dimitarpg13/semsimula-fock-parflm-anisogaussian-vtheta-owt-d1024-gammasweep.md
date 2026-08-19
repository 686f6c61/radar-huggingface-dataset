# dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-owt-d1024-gammasweep

## Resumen

Este repositorio contiene un barrido de coeficientes de amortiguamiento (gamma-sweep) para la arquitectura Fock-PARFLM v2.1, un modelo de lenguaje conservativo por construcción desarrollado por Dimitar P. Gueorguiev dentro del marco Semantic Simulation. No se trata de un modelo final entrenado, sino de un conjunto de ocho ejecuciones de diagnóstico de 3.000 pasos cada una, escaladas a d=1024 y L=16 y entrenadas sobre OpenWebText, cuyo objetivo es seleccionar el coeficiente de amortiguamiento óptimo para un posterior entrenamiento completo de 100.000 pasos.

La arquitectura es radicalmente distinta a la de un transformer convencional: es un modelo sin atención (attention-free) basado en mecánica lagrangiana, con un potencial escalar V_theta de Gaussiana anisotrópica dependiente de la profundidad, regularización de acoplamiento de Fock y registros virtuales con disciplina de pila LIFO. Su relevancia radica en que propone una vía alternativa hacia la inferencia con memoria constante y propiedades de conservatividad controlada, además de incorporar un diagnóstico geométrico (residual geodésico) para evaluar la calidad de las trayectorias ocultas. El resultado principal del barrido es que tanto la perplejidad como el residual geodésico alcanzan su mínimo en gamma=0,05, el valor más pequeño probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (potencial escalar V_theta de Gaussiana anisotrópica dependiente de profundidad, registros virtuales de Fock, canal inverso no conservativo opcional) |
| Parametros totales | no disponible (el repositorio contiene 8 checkpoints; el recuento exacto por checkpoint no se especifica en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se indica librería PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (formato exacto no especificado) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia PARFLM (Potential-Augmented Riemannian Flow Language Model), que sustituye la atención por un flujo dinámico gobernado por un potencial escalar V_theta y un potencial por pares V_phi. En esta variante v2.1, el potencial escalar es una mezcla de Gaussianas anisotrópicas dependiente de la profundidad, acoplada a un pool de registros latentes de espacio de Fock con M=16 partículas virtuales, puertas de creación estructuradas Q/K/V y disciplina de pila LIFO. Se incluye un canal inverso no conservativo opcional que permite romper la conservatividad estricta cuando es necesario.

El entrenamiento se realizó sobre OpenWebText (split de validación para evaluación) con 3.000 pasos por cada uno de los ocho candidatos de gamma (0,05, 0,10, 0,15, 0,20, 0,25, 0,30, 0,40 y 0,50). No se menciona el uso de RLHF ni DPO. Una innovación técnica destacable es el diagnóstico de residual geodésico amortiguado, una métrica de forma cerrada que mide cuánto se desvían las trayectorias ocultas del modelo de las geodésicas de la métrica de Jacobi inducida por su propio potencial aprendido, sin necesidad de entrenamiento adicional ni autodiferenciación a través de una métrica aprendida. El modelo es explícitamente no transformer, sin atención y con inferencia de memoria constante.

## Capacidades

- Generación de texto en inglés mediante un flujo dinámico conservativo, sin mecanismos de atención.
- Inferencia con memoria constante, una propiedad estructural derivada de la arquitectura sin atención.
- Conservatividad controlada: el coeficiente de amortiguamiento gamma permite ajustar el grado de disipación del sistema.
- Interpretabilidad geométrica: el modelo induce una métrica riemanniana (Jacobi) sobre sus estados ocultos, y las trayectorias de energía mínima tienden a ser las más predictivas.
- Soporte de registros virtuales con disciplina LIFO y enrutamiento disperso (sparse-routing).
- Canal inverso opcional para romper la conservatividad cuando la tarea lo requiere.
- No se declara soporte de tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Selección de hiperparámetros en arquitecturas basadas en energía: este repositorio es la herramienta de referencia para elegir el coeficiente de amortiguamiento gamma antes de lanzar un entrenamiento completo a gran escala.
- Investigación en modelos de lenguaje sin atención: permite estudiar cómo se comporta un LM puramente lagrangiano a una escala de d=1024 y L=16, comparando su dinámica con la de los transformers.
- Análisis geométrico de estados ocultos: el residual geodésico proporciona una métrica objetiva para evaluar si las trayectorias aprendidas son consistentes con la geometría inducida por el potencial, útil para validar teorías sobre representaciones internas.
- Benchmarking de eficiencia de memoria: la propiedad de memoria constante puede evaluarse en hardware limitado, aunque el repositorio actual no incluye implementaciones optimizadas para despliegue.
- Reproducción del marco Semantic Simulation: los ocho checkpoints completos permiten reproducir exactamente los resultados del barrido y extender el análisis a otros valores de gamma o a otras escalas.
- Estudio de regularización de Fock: los registros virtuales con puertas Q/K/V y pila LIFO pueden analizarse como un mecanismo de memoria externa alternativa a la atención, con aplicaciones en tareas de modelado de secuencias largas.

## Benchmarks y rendimiento

Los únicos resultados declarados por el autor son los siguientes, obtenidos sobre OpenWebText (split de validación) tras 3.000 pasos de entrenamiento (barrido corto, no un modelo completamente entrenado):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| text-generation | OpenWebText (validacion) | Perplejidad (gamma=0,05, mejor de 8 candidatos) | 244,23 |

Es importante señalar que este valor de perplejidad es alto porque el entrenamiento es deliberadamente corto (3.000 pasos) y su propósito es comparar candidatos de gamma, no lograr un modelo convergente. No se han publicado resultados comparativos con otros modelos en esta información.

## Requisitos de hardware

- El repositorio ocupa 34,9 GB en total, conteniendo ocho checkpoints completos, lo que sugiere aproximadamente 4,4 GB por checkpoint en precisión fp32.
- Para inferencia con un único checkpoint en PyTorch estándar, se estima un consumo de VRAM de entre 6 y 12 GB dependiendo del tamaño de lote, lo que podría caber en GPUs de consumo como RTX 3090 o RTX 4090.
- Para reproducir el barrido completo de entrenamiento (8 ejecuciones de 3.000 pasos a d=1024, L=16), se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100) o varias GPUs en paralelo.
- No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; el despliegue se limita a PyTorch nativo.
- La propiedad de memoria constante podría permitir inferencia en CPU o en GPUs de baja capacidad, pero no se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

Dado que este repositorio es un barrido diagnóstico y no un modelo final, no se dispone de comparativas directas de rendimiento con otros modelos. Sin embargo, dentro de la misma familia arquitectónica se pueden identificar las siguientes alternativas:

| Modelo | Arquitectura | Escala | Perplejidad (referencia) | Licencia |
|---|---|---|---|---|
| semsimula-fock-parflm (base) | Fock-PARFLM v2.1 | no especificada | 9,30 (según resultados de la familia) | cc-by-4.0 |
| semsimula-fock-parflm-structured-vtheta | Fock-PARFLM v2.1 con potencial de pozos cuadráticos diagonales (SQ3) | no especificada | no disponible | cc-by-4.0 |
| semsimula-fock-parflm-depthcond-vtheta-openwebtext | Fock-PARFLM con V_theta dependiente de profundidad (isotrópico) | d=1024 | no disponible (barrido incompleto, 4/8 candidatos) | cc-by-4.0 |
| GPT-2 (referencia clásica) | Transformer | 124M-1.5B | ~29 (OpenWebText, entrenamiento completo) | MIT |

La comparativa con GPT-2 es pertinente porque el documento técnico de la familia compara recuentos de parámetros exactos con GPT-2 a igualdad de dimensión oculta y profundidad, aunque no se ofrecen aquí los números concretos para este barrido.

## Limitaciones y advertencias

- Este no es un modelo final: se trata de un barrido diagnóstico de 3.000 pasos por candidato, y su perplejidad de 244,23 no debe interpretarse como el rendimiento real de la arquitectura.
- El entrenamiento completo de 100.000 pasos en d=1024 no se ha lanzado todavía según la información disponible.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han realizado ajustes de seguridad ni alineación; el modelo puede generar contenido sesgado o alucinado como cualquier LM sin entrenamiento específico.
- No se proporcionan cuantizaciones ni formatos optimizados para producción; el despliegue en entornos reales requeriría trabajo adicional.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero el modelo es claramente de investigación y no está listo para aplicaciones productivas.
- Dos de los ocho registros de entrenamiento están incompletos según la model card, lo que puede afectar a la reproducibilidad exacta de algunos candidatos.
- La propiedad de memoria constante y las garantías de conservatividad son afirmaciones estructurales del autor y no han sido verificadas de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-owt-d1024-gammasweep
- Modelo base de la familia Fock-PARFLM: https://huggingface.co/dimitarpg13/semsimula-fock-parflm
- Variante con potencial estructurado (SQ3): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-structured-vtheta
- Variante con V_theta dependiente de profundidad (isotrópico): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta-openwebtext
- Repositorio del paper en GitHub: https://github.com/dimitarpg13/semsimula-paper
- Notas comparativas de escalado (parámetros vs GPT-2): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Scale-Up_Comparative_Experiments.md
- DOI del marco Semantic Simulation: https://doi.org/10.5281/zenodo.19712427
