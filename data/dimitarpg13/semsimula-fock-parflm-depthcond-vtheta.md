# dimitarpg13/semsimula-fock-parflm-depthcond-vtheta

## Resumen

El modelo `semsimula-fock-parflm-depthcond-vtheta` es un modelo de lenguaje conservativo basado en mecánica lagrangiana, desarrollado por dimitarpg13 dentro del framework Semantic Simulation (SPLM). Se trata de una variante de la familia Fock-PARFLM v2.1 a escala TinyStories (d=256, L=8) que utiliza un potencial escalar V_theta definido como una mezcla acotada de Gaussianas, con un banco de pozos por canal de contexto xi y un código de profundidad aprendido por capa. Su propósito principal es estudiar el comportamiento de potenciales estructurados y acotados en modelos de lenguaje basados en energía, no lograr la mejor perplejidad posible a esta escala.

A diferencia de sus hermanos MLP y SQ3, este checkpoint se entrenó desde cero sin fuga causal (`prefix_causal_registers=True`) y no requirió reentrenamiento. Alcanza una perplejidad de validación de 16.33 en TinyStories, notablemente peor que los 9.70 del baseline MLP honesto, lo que evidencia que la acotación del potencial de Gaussianas sacrifica expresividad en el régimen de pequeña escala. El modelo es attention-free, con memoria constante en inferencia, y emplea un pool de registros virtuales de Fock con 16 partículas y disciplina de pila LIFO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (no transformer, attention-free, basada en potenciales escalares) |
| Parametros totales | no disponible (el hermano OpenWebText tiene 53,4 M, pero este no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | pytorch (probablemente safetensors, no confirmado) |

Nota: el tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo pequeño, pero no se dispone del número exacto de parámetros.

## Arquitectura y entrenamiento

El modelo pertenece a la familia SPLM (Semantic Simulation) y se basa en la mecánica lagrangiana: las representaciones ocultas evolucionan según fuerzas derivadas de potenciales escalares. La arquitectura consta de L=8 capas de integración, cada una con tres componentes principales: canales K-EMA (cuatro canales de contexto xi obtenidos mediante medias móviles causales), un potencial V_theta de mezcla de Gaussianas acotado (8 pozos por canal, 32 en total) con código de profundidad aprendido por capa, y un potencial pairwise V_phi (MLP estructural competitivo) que selecciona los k=8 vecinos más relevantes mediante Gumbel-softmax. Además, incorpora un pool de registros virtuales de Fock con 16 partículas, puertas de creación Q/K/V y disciplina de pila LIFO.

El entrenamiento se realizó sobre el dataset TinyStories (roneneldan/TinyStories) durante 16.000 pasos, con la corrección de fuga causal activada desde el paso 0 (`prefix_causal_registers=True`). Según el autor, las sondas de perturbación futura bit-exacta y las comprobaciones de perplejidad honesta frente a estándar pasaron limpias durante todo el entrenamiento, lo que indica que no hubo fuga causal. No se mencionan técnicas de RLHF ni DPO; el entrenamiento se basó en minimización de entropía cruzada.

## Capacidades

- Generación de texto en inglés, limitada al vocabulario y dominio de TinyStories (historias simples para niños).
- Modelo conservativo: las fuerzas derivan de potenciales escalares, lo que permite estudiar la dinámica de las representaciones ocultas desde una perspectiva física.
- Interpretabilidad estructural: el potencial V_theta tiene 32 centros atractores explícitos organizados por canales de contexto, lo que facilita el análisis de qué regiones del espacio oculto atraen las representaciones.
- Memoria constante en inferencia: al no usar atención, el coste de memoria no crece con la longitud de la secuencia.
- Soporte de registros virtuales de Fock con disciplina LIFO, que actúan como memoria de trabajo apilada.
- Sin capacidades de tool calling, agentes, visión ni audio (no se mencionan en la documentación).

## Casos de uso

- Investigación en modelos basados en energía: este modelo sirve como banco de pruebas para estudiar cómo afecta la acotación de un potencial de mezcla de Gaussianas a la calidad de generación y a la estructura del espacio latente.
- Análisis de la dinámica de representaciones: al ser conservativo, se pueden calcular trayectorias geodésicas en el manifold de estados ocultos, lo que permite investigar si las rutas de mínima energía coinciden con las rutas más predictivas.
- Estudio de la fuga causal en modelos de lenguaje: al haberse entrenado sin fuga causal desde el inicio, es un caso de referencia para comparar con variantes que requirieron reentrenamiento.
- Evaluación de la escalabilidad de potenciales estructurados: comparado con sus hermanos MLP y SQ3, permite medir el coste de expresividad de imponer acotación y estructura.
- Generación de historias cortas en inglés: aunque su perplejidad es alta, puede generar texto narrativo simple, útil para demostraciones educativas.
- Desarrollo de arquitecturas no transformer: sirve como ejemplo de un modelo de lenguaje sin atención que mantiene memoria constante, relevante para entornos con restricciones de memoria.

## Benchmarks y rendimiento

El único resultado oficial declarado en la model card es la perplejidad de validación en TinyStories (split validation). La tabla siguiente recoge los valores reportados por el autor para este modelo y sus hermanos de la misma familia, tal como aparecen en la documentación.

| Modelo | Perplejidad (TinyStories val) | Notas |
|---|---|---|
| semsimula-fock-parflm-depthcond-vtheta (este) | 16.33 | Potencial acotado, entrenado sin fuga causal |
| semsimula-fock-parflm-structured-vtheta (SQ3) | 10.90 | Potencial no acotado, reentrenado con corrección (+0.54 PPL) |
| semsimula-fock-parflm (MLP baseline) | 9.70 | Potencial no acotado, reentrenado con corrección (+0.40 PPL) |

No se dispone de resultados en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- El tamaño del repositorio es de 0,2 GB, lo que sugiere que los pesos ocupan aproximadamente 200 MB en formato de precisión completa (fp32). Con cuantización a 8 bits o 4 bits, el modelo podría caber en GPUs con 2-4 GB de VRAM.
- Al ser una arquitectura sin atención y con memoria constante, el consumo de memoria durante inferencia es bajo y no depende de la longitud de la secuencia.
- Es probable que sea ejecutable en GPUs de consumo como NVIDIA GTX 1660, RTX 3060 o superiores, así como en CPU con suficiente RAM.
- Para despliegue, al ser un modelo de investigación en PyTorch, se puede usar con transformers o directamente con el código del repositorio. No se mencionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

Dentro de la familia Fock-PARFLM v2.1, el autor proporciona una comparación directa en la model card. No se dispone de comparaciones con modelos externos (por ejemplo, GPT-2 pequeño o TinyLlama) porque no hay datos públicos de benchmarks para este modelo.

| Modelo | Potencial | Perplejidad | Entrenamiento | Boundedness |
|---|---|---|---|---|
| Fock-PARFLM depth-cond. Gaussian (este) | Mezcla de Gaussianas acotada | 16.33 | Sin fuga causal nativa | Sí (V_theta en [-4, 0]) |
| Fock-PARFLM SQ3 structured | Mezcla log-sum-exp no acotada | 10.90 | Reentrenado con corrección | No |
| Fock-PARFLM MLP baseline | MLP (caja negra) | 9.70 | Reentrenado con corrección | No |

La conclusión del autor es que, a esta escala pequeña, la acotación del potencial de Gaussianas cuesta 6.63 puntos de perplejidad frente al baseline MLP honesto. En cambio, el hermano OpenWebText (d=384, L=16, 53.4 M) alcanza 27.23 PPL con el mismo diseño de potencial, lo que sugiere que la expresividad mejora con la escala.

## Limitaciones y advertencias

- Modelo de investigación experimental: no está diseñado para uso en producción ni para tareas reales de generación de texto.
- Perplejidad alta (16.33) en comparación con modelos convencionales de tamaño similar, lo que indica una calidad de generación limitada.
- Entrenado exclusivamente en TinyStories, un dataset de historias simples en inglés; el vocabulario y los temas son muy restringidos.
- No se han documentado sesgos específicos, pero al entrenarse en un corpus pequeño y sintético, es probable que tenga limitaciones en comprensión de mundo real y pueda generar contenido incoherente o alucinado.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero al ser un modelo sin garantías y con fines de investigación, se recomienda precaución.
- No hay información sobre cuantizaciones oficiales ni formatos de exportación (GGUF, ONNX, etc.), lo que dificulta su integración en herramientas estándar.
- La arquitectura es poco convencional; no es compatible con el ecosistema transformers estándar sin adaptaciones, y requiere el código del repositorio del autor para su uso.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta)
- [Hermano OpenWebText-scale](https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta-openwebtext)
- [Fock-PARFLM v2.1 base (MLP)](https://huggingface.co/dimitarpg13/semsimula-fock-parflm)
- [Fock-PARFLM SQ3 structured](https://huggingface.co/dimitarpg13/semsimula-fock-parflm-structured-vtheta)
- [Repositorio del paper en GitHub](https://github.com/dimitarpg13/semsimula-paper)
- [Notas sobre el barrido de gamma en el escalado](https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Scale-Up_Gamma_Sweep_Results_and_Damping_Regime_Analysis.md)
- [DOI del framework Semantic Simulation](https://doi.org/10.5281/zenodo.19712427)
