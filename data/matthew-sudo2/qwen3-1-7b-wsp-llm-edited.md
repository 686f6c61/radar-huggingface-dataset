# matthew-sudo2/qwen3-1.7b-wsp-llm-edited

## Resumen

Qwen3-1.7B WSP LLM-Edited es una variante experimental del checkpoint base Qwen/Qwen3-1.7B-Base, publicada por el usuario matthew-sudo2 en Hugging Face. El modelo no es un fine-tuning convencional: se ha obtenido mediante cirugia de pesos (weight surgery) guiada por diagnosticos de activaciones contrastivas por idioma, con el objetivo declarado de reforzar la representacion interna del filipino (tagalo) dentro de la red. El resultado se evalua sobre la suite FilBench, que mide competencia linguistica en filipino y tareas relacionadas.

La intervencion se apoya en interpretabilidad mecanistica: se identificaron neuronas MLP selectivas para filipino concentradas en las capas 18, 20, 3 y 27, y se aplicaron escalados localizados sobre `down_proj`, proyecciones MLP y filas del embedding atado correspondientes a particulas frecuentes del filipino (`sa`, `ang`, `ng`, `mga`, `na`). Los deltas aplicados se mantienen en el rango [0.03, 0.10], por debajo de los umbrales de degradacion Frobenius.

La relevancia de este checkpoint es doble: por un lado, documenta un experimento controlado de edicion de pesos con un control aleatorio emparejado; por otro, los resultados publicados no muestran una mejora neta significativa frente al modelo base (delta medio por instancia de +0.52% con intervalo de confianza que cruza cero y p = 0.9227 en test de signos). Se trata, por tanto, de un artefacto de investigacion sobre edicion de representaciones, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B-Base; sin cambios estructurales) |
| Parametros totales | 1.700 millones (1.7B, heredados del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del checkpoint base Qwen3-1.7B-Base) |
| Tipos de cuantizacion | no disponible (pesos publicados presumiblemente en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | tl (tagalo/filipino), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no se documentan otros) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del checkpoint Qwen3-1.7B-Base: un transformer decoder-only denso de aproximadamente 1.700 millones de parametros, con embedding atado entre entrada y salida. No se ha realizado ningun entrenamiento adicional ni fine-tuning; la unica modificacion consiste en una cirugia de pesos determinista sobre un subconjunto de tensores.

El procedimiento parte de un perfilado contrastivo de activaciones para localizar neuronas MLP con alta selectividad hacia el filipino. Sobre esa base se aplican tres tipos de edicion: escalado de ventanas de columnas dispersas en `down_proj` de las capas 18, 20, 3 y 27; un refuerzo uniforme suave en las proyecciones MLP de las capas 18 y 20; y escalado dirigido de las filas del embedding atado asociadas a particulas gramaticales frecuentes del filipino. Los deltas quedan acotados en [0.03, 0.10] para evitar degradacion de la norma Frobenius. El plan declarativo completo esta en `edit_bundle.json` y el informe de auditoria en `filbench_wsp_edit_report.json`. No se documentan datos de entrenamiento adicionales, RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva en tagalo y en ingles, heredada del checkpoint base.
- Continuacion de prompts en filipino, incluyendo texto sobre investigacion y tematica academica (segun el ejemplo de la model card).
- Razonamiento y conocimiento general medido en FilBench (macro), Dengue, Global MMLU en tagalo e Include en tagalo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: limitadas a los idiomas declarados (tl, en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el checkpoint base es un modelo de texto y no se documentan modos adicionales.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo sirve como artefacto reproducible para estudiar como la edicion selectiva de neuronas MLP afecta a la representacion de un idioma de bajos recursos, comparando contra el control aleatorio emparejado y el checkpoint base.
- Validacion de pipelines de edicion de pesos: `edit_bundle.json` y el informe de auditoria permiten auditar el proceso completo (seleccion de capas, deltas aplicados, verificacion Frobenius) y reutilizarlo como plantilla para otros idiomas.
- Experimentos controlados de sesgo linguistico: al disponer de un control aleatorio con la misma magnitud de edicion, permite separar el efecto de la direccion de la edicion del efecto puro de perturbacion de pesos.
- Generacion de texto en filipino para prototipos: continuacion de prompts y generacion breve en tagalo en entornos de desarrollo, con expectativas de calidad acotadas por los resultados de FilBench.
- Benchmarking de tecnicas de edicion: uso como condicion "LLM Edited" en comparativas frente a fine-tuning, LoRA y otras intervenciones sobre el mismo checkpoint base.
- Docencia y divulgacion: ejemplo practico de cirugia de pesos guiada por activaciones, con numeros publicados y metricas de significancia estadistica.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de desarrollo de FilBench:

| Condicion | FilBench Macro (%) | Dengue Avg (%) | Global MMLU Tgl (%) | Include Tgl (%) |
|---|---|---|---|---|
| Base (Qwen/Qwen3-1.7B-Base) | 47.13 | 73.00 | 44.74 | 48.33 |
| LLM-Edited (este modelo) | 46.74 | 73.00 | 41.23 | 48.33 |
| Control aleatorio emparejado | 47.31 | 73.00 | 42.98 | 46.06 |

Comparacion pareada a nivel de instancia frente al checkpoint base:

| Metrica | Valor |
|---|---|
| Ejemplos de test totales | 1.431 |
| Delta medio por instancia | +0.52% |
| Intervalo de confianza al 95% | [-0.49%, +1.50%] |
| Error estandar bootstrap | 0.51% |
| Instancias mejoradas / empeoradas / sin cambio | 54 / 52 / 1.325 |
| Test de signos bilateral | p = 0.9227 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en bfloat16 (1.7B parametros a 2 bytes); en cuantizacion de 8 bits, en torno a 1,7-2 GB; en 4 bits, alrededor de 1 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16 (RTX 3060, RTX 4060, RTX 4090), A100 o H100 para lotes grandes o despliegue multiusuario.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores; en GPUs con 8 GB o mas se puede ejecutar con comodidad.
- Opciones de despliegue: transformers (segun el quickstart de la model card), vLLM y TGI para servido; llama.cpp/Ollama solo si se generan pesos GGUF, que no se documentan.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FilBench Macro (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B WSP LLM-Edited (este) | 1.7B | no disponible | 46.74 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Base | 1.7B | no disponible | 47.13 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B WSP Random Control | 1.7B | no disponible | 47.31 | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamano (p. ej. fine-tunes de Qwen3-1.7B para filipino) | 1.7B | no disponible | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Los resultados no muestran mejora neta frente al modelo base: el delta medio por instancia es positivo pero el intervalo de confianza cruza cero y el test de signos arroja p = 0.9227, por lo que no se puede afirmar una mejora significativa.
- En Global MMLU en tagalo el modelo editado rinde peor que el base (41.23 frente a 44.74), lo que sugiere un posible coste en conocimiento general en ese idioma.
- El control aleatorio emparejado obtiene una macro de FilBench ligeramente superior a la del modelo editado (47.31 frente a 46.74), lo que cuestiona la direccionalidad del efecto de la edicion.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un checkpoint base sin alineamiento adicional, la generacion libre puede producir contenido facticamente incorrecto.
- Sesgos conocidos: no documentados; al derivar de un checkpoint base sin RLHF, pueden persistir sesgos del corpus original de Qwen3.
- Limitaciones de contexto e idioma: solo se declaran tl y en; no se documenta la longitud de contexto efectiva ni el comportamiento fuera de esos idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigacion con rendimiento no validado, no se recomienda su despliegue en produccion sin evaluacion adicional.
- Advertencia de uso: las ediciones de pesos son deterministas y auditables, pero no se publican variantes cuantizadas ni pruebas de robustez fuera de FilBench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthew-sudo2/qwen3-1.7b-wsp-llm-edited
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Control aleatorio emparejado: https://huggingface.co/matthew-sudo2/qwen3-1.7b-wsp-random-control (referenciado en la model card como `qwen3-1.7b-wsp-random-control`)
- Dataset de experimentos FilBench: referenciado en la model card como "FilBench Experiments Dataset" en https://huggingface.co/datasets (URL concreta no disponible)
- Plan de edicion (`edit_bundle.json`) e informe de auditoria (`filbench_wsp_edit_report.json`): incluidos en el repositorio del modelo, sin URL independiente disponible
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
