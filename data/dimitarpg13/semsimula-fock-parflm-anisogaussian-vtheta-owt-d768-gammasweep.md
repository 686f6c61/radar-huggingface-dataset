# dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-owt-d768-gammasweep

## Resumen

El modelo `semsimula-fock-parflm-anisogaussian-vtheta-owt-d768-gammasweep` es un conjunto de ocho checkpoints de diagnóstico perteneciente a la familia Fock-PARFLM v2.1, desarrollada por el investigador independiente Dimitar P. Gueorguiev dentro del marco teórico Semantic Simulation. No se trata de un modelo final entrenado para producción, sino de un barrido sistemático del coeficiente de amortiguamiento gamma (γ ∈ {0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50}) sobre la arquitectura de potencial anisotrópico gaussiano Vθ con regularización Fock, escalada a d=768 y L=16, y entrenada durante 3.000 pasos sobre OpenWebText.

La relevancia de este repositorio es metodológica: permite seleccionar el coeficiente de amortiguamiento óptimo para un posterior entrenamiento completo de 100.000 pasos a esta escala. El resultado principal es que tanto la perplejidad mínima como el residual geodésico mínimo coinciden en γ=0.05, un óptimo de frontera que además coincide exactamente con la predicción del predictor cerrado de dos regímenes para alta dimensionalidad. La arquitectura es radicalmente distinta a los transformers: es un modelo sin atención, basado en mecánica lagrangiana, con memoria de inferencia constante y potenciales escalares interpretables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (no transformer, attention-free, energy-based, potencial escalar anisotrópico gaussiano Vθ con regularización Fock) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento; no se especifica contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (checkpoints nativos; no se especifica safetensors) |

## Arquitectura y entrenamiento

La arquitectura Fock-PARFLM v2.1 se aleja por completo del paradigma transformer. Es un modelo de lenguaje conservador (conservative language model) que modela la dinámica de los estados ocultos mediante un potencial escalar Vθ y un potencial par por pares Vφ, inspirado en la mecánica lagrangiana y la geometría riemanniana. Incorpora un pool de registros latentes en espacio de Fock con M=16 partículas de registro virtual, compuertas de creación estructuradas Q/K/V, disciplina de pila LIFO y un canal inverso opcional no conservador. El potencial Vθ en esta variante es una mezcla anisotrópica de gaussianas con gradiente analítico, lo que permite el cálculo cerrado de la métrica de Jacobi y el residual geodésico amortiguado sin entrenamiento adicional.

El entrenamiento se realizó sobre OpenWebText con un batch efectivo de 8 bloques de 512 tokens, durante 3.000 pasos por cada uno de los 8 candidatos de gamma (aproximadamente 24,6 millones de tokens por checkpoint). No se aplicó RLHF ni DPO; el objetivo fue minimizar la entropía cruzada. Cada checkpoint se evaluó además con el residual geodésico amortiguado R̄(γ), un diagnóstico de forma cerrada que mide cuán cerca sigue la trayectoria de estados ocultos de una geodésica de la métrica inducida por el potencial aprendido. El resultado clave es que tanto la perplejidad como el residual geodésico alcanzan su mínimo en γ=0.05, el valor más pequeño probado, lo que constituye un óptimo de frontera y una coincidencia exacta con la predicción teórica del predictor de dos regímenes para d≥768.

## Capacidades

- Generación de texto: el modelo puede generar texto, pero los checkpoints de este repositorio están entrenados solo 3.000 pasos y no producen texto fluido; no es una capacidad práctica.
- Diagnóstico de coeficiente de amortiguamiento: permite reproducir la metodología de selección de gamma mediante perplejidad y residual geodésico.
- Análisis de fidelidad geodésica: cada checkpoint incluye el residual geodésico amortiguado R̄(γ), un diagnóstico cerrado sin autodiferenciación.
- Comparación de regímenes de amortiguamiento: los 8 checkpoints permiten estudiar el efecto de γ sobre la dinámica de estados ocultos en un potencial acotado y analíticamente diferenciable.
- Sin soporte de tool calling, visión, audio ni capacidades multimodales.
- Sin modo de razonamiento explícito ni capacidades de agente.

## Casos de uso

- Reproducción de la metodología de selección de gamma: investigadores pueden ejecutar los 8 checkpoints y verificar que el mínimo de perplejidad y residual geodésico coincide en γ=0.05, validando el predictor teórico de dos regímenes.
- Estudio de la no monotonicidad de la perplejidad frente a gamma: la presencia de un "wiggle" no monótono pasado el mínimo, compartido con el barrido d=1024 pero ausente en variantes MLP, permite investigar la relación entre anchura, amortiguamiento y dinámica de potencial.
- Análisis de la métrica de Jacobi inducida por el potencial aprendido: al ser un potencial con gradiente analítico, se puede calcular la métrica riemanniana de forma cerrada y estudiar cómo se organiza el manifold de estados ocultos.
- Comparación de fidelidad geodésica entre regímenes de amortiguamiento: los checkpoints permiten cuantificar cómo varía R̄(γ) y relacionarlo con la perplejidad, sin necesidad de entrenar nuevos modelos.
- Validación de la escalabilidad de la familia Fock-PARFLM: este barrido a d=768, L=16 complementa los barridos a d=384 y d=1024, permitiendo trazar la evolución del óptimo de gamma con la dimensionalidad.
- Base para lanzar un entrenamiento completo a 100.000 pasos: el checkpoint con γ=0.05 sirve como punto de partida documentado para el entrenamiento largo planificado, siguiendo el patrón del run d=384.

## Benchmarks y rendimiento

El único resultado declarado por el autor es la perplejidad de validación sobre OpenWebText:

| Metrica | Dataset | Split | Valor | Notas |
|---|---|---|---|---|
| Perplejidad de validación | OpenWebText | validation | 326.97 | γ=0.05, mejor de 8 candidatos, barrido corto de 3.000 pasos; no es un modelo completamente entrenado |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La perplejidad de 326.97 es esperable para un modelo entrenado solo 3.000 pasos y no debe compararse con modelos entrenados durante decenas de miles de pasos. El autor indica explícitamente que ningún checkpoint de este repositorio está destinado a producir texto fluido.

## Requisitos de hardware

- Tamaño del repositorio: 21.6 GB, que incluye 8 checkpoints completos (aproximadamente 2.7 GB por checkpoint).
- VRAM estimada para inferencia: no disponible; depende del tamaño exacto de parámetros, que no se ha publicado.
- GPU recomendadas: no disponible; al ser un modelo de investigación con d=768, es probable que quepa en GPUs de consumo con 16-24 GB de VRAM, pero no hay datos confirmados.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es PyTorch nativo, por lo que la inferencia requeriría un script personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | d | L | Pasos de entrenamiento | Perplejidad (OpenWebText) | Licencia |
|---|---|---|---|---|---|---|
| semsimula-fock-parflm-anisogaussian-vtheta-owt-d768-gammasweep (este) | Fock-PARFLM v2.1, potencial anisotrópico gaussiano | 768 | 16 | 3.000 (por checkpoint) | 326.97 (γ=0.05) | cc-by-4.0 |
| semsimula-fock-parflm-depthcond-vtheta-openwebtext | Fock-PARFLM v2.1, potencial isotrópico gaussiano, condicionado por profundidad | 384 | no disponible | 250.000 | 27.23 | cc-by-4.0 |
| semsimula-fock-parflm (v2.1 base) | Fock-PARFLM v2.1 con pool de registros Fock | no disponible | no disponible | no disponible | 9.30 | cc-by-4.0 |

La comparación directa no es posible porque este repositorio contiene checkpoints de diagnóstico a corto plazo, no modelos finales. El modelo hermano totalmente entrenado a d=384 alcanza 27.23 PPL, y la variante base Fock-PARFLM v2.1 reporta 9.30 PPL, pero ambos con configuraciones y escalas diferentes.

## Limitaciones y advertencias

- No es un modelo utilizable para generación de texto: todos los checkpoints están entrenados solo 3.000 pasos (~24,6M tokens) y producen texto no fluido; el autor lo advierte explícitamente.
- Perplejidad alta: 326.97, no comparable con modelos entrenados; no debe usarse como referencia de calidad lingüística.
- Sesgos de OpenWebText: el dataset de entrenamiento es un subconjunto de web crawls, con los sesgos asociados a contenido de internet en inglés.
- Riesgo de alucinación: no evaluado; al ser un modelo sin entrenamiento suficiente, cualquier salida debe considerarse no fiable.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero el modelo no tiene valor práctico para producción.
- Naturaleza experimental: la arquitectura no transformer, basada en mecánica lagrangiana, es una línea de investigación incipiente; los resultados de este barrido son diagnósticos y no implican que la arquitectura supere a los transformers en tareas estándar.
- Sin soporte de cuantización ni formatos optimizados: no hay versiones GGUF, ONNX ni AWQ, lo que limita el despliegue en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-owt-d768-gammasweep
- Modelo base Fock-PARFLM v2.1: https://huggingface.co/dimitarpg13/semsimula-fock-parflm
- Variante con potencial estructurado: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-structured-vtheta
- Modelo hermano totalmente entrenado (d=384, 27.23 PPL): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta-openwebtext
- Repositorio del paper Semantic Simulation: https://github.com/dimitarpg13/semsimula-paper
- Notas comparativas de escalado Fock-PARFLM: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Scale-Up_Comparative_Experiments.md
- DOI del framework Semantic Simulation: https://doi.org/10.5281/zenodo.19712427
