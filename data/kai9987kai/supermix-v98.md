# Kai9987kai/supermix-v98

## Resumen

Supermix v98 es un modelo de generación de texto experimental publicado por el usuario Kai9987kai en Hugging Face, identificado internamente como `v98_scf_predictive.selected.pt`. Se presenta como una release independiente del proyecto Supermix, alojado en GitHub, y su rasgo distintivo es la introducción de modulación de error por codificación predictiva descendente (`cns_predictive_error=True`) dentro de un componente denominado `ConnectomeCore`, junto con mecanismos de traza hebbiana (`cns_hebbian_trace=True`) y parada por entropía de razonamiento (`thinking_entropy_halt=True`).

El modelo se etiqueta como una arquitectura de mezcla de expertos (mixture-of-experts) con enfoque neuro-simbólico, aunque su tamaño real es muy reducido: 36.599.047 parámetros totales y 9.132.151 activos por token, con un vocabulario de 9.415 entradas. El repositorio ocupa 0,2 GB y los pesos se distribuyen como un único fichero PyTorch (`.pt`), no en safetensors ni GGUF.

Es relevante ahora únicamente como pieza de investigación: el autor lo publica como experimental y mantiene otra versión (`v96_physio_neurogenesis.selected.pt`) como predeterminada promovida. No hay descargas ni interacciones registradas, no se declaran idiomas soportados y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), solo métricas internas del propio proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con componentes neuro-simbólicos (`ConnectomeCore`) |
| Parametros totales | 36.599.047 |
| Parametros activos | 9.132.151 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), fichero `v98_scf_predictive.selected.pt` |

## Arquitectura y entrenamiento

La arquitectura declarada es una mezcla de expertos con un núcleo denominado `ConnectomeCore`, que integra mecanismos inspirados en neurociencia: modulación de error por codificación predictiva descendente, trazas de plasticidad hebbiana y una parada dinámica basada en entropía del razonamiento (`thinking_entropy_halt`). El modelo se etiqueta además como neuro-simbólico y "cognitive-fabric", aunque la documentación disponible no detalla la topología interna de los expertos, el número de expertos ni el esquema de enrutamiento.

No se especifican datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. El modelo base declarado es `Kai9987kai/supermix-v97`, lo que sugiere una cadena de iteraciones experimentales dentro del proyecto. Las únicas métricas publicadas son internas del proyecto (pérdida de desarrollo, escalera de generalización y suites de evaluación propias), no benchmarks estándar de la comunidad.

## Capacidades

- Generación de texto: pipeline declarado `text-generation` con vocabulario de 9.415 tokens.
- Razonamiento con parada por entropía: el flag `thinking_entropy_halt=True` sugiere un mecanismo de terminación dinámica del razonamiento, aunque no se documenta su funcionamiento exacto.
- Modulación por codificación predictiva: `cns_predictive_error=True` introduce señales de error descendentes en el núcleo, según la model card.
- Plasticidad hebbiana: `cns_hebbian_trace=True` activa trazas de aprendizaje hebbiano en el núcleo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en arquitecturas neuro-simbólicas: el modelo sirve como banco de pruebas para estudiar la modulación por codificación predictiva y las trazas hebbianas en un transformer MoE de pequeño tamaño, replicando los experimentos del repositorio Supermix.
- Experimentación con parada dinámica del razonamiento: permite evaluar el efecto de `thinking_entropy_halt` sobre la longitud de las cadenas de razonamiento y la calidad de la salida en tareas controladas.
- Reproducción de las suites de evaluación del autor: los ficheros `results/eval_v98_selected_seed82.json` y `results/eval_v98_selected_n82_seed83.json` permiten verificar los resultados declarados (35/41 y 70/82) en un entorno local.
- Docencia y divulgación: por su tamaño reducido (36,6 M de parámetros totales) y su licencia MIT, es apto para explicar conceptos de MoE, plasticidad y codificación predictiva en cursos o talleres.
- Prototipado rápido en CPU: la model card reporta benchmarks medidos en Windows CPU con `max_new_tokens=96`, lo que lo hace utilizable en entornos sin GPU para pruebas de concepto.
- Comparación de variantes del proyecto: al declarar `base_model: Kai9987kai/supermix-v97`, permite comparar el efecto de las nuevas banderas frente a la versión anterior en la cadena de iteraciones.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas del proyecto, no benchmarks estándar de la comunidad. Se reproducen tal cual aparecen en la model card:

| Suite de evaluacion | Resultado | Recibo |
|---|---:|---|
| Standalone Neural `seed=82` (41 tareas) | 35 / 41 (0,8537) | `results/eval_v98_selected_seed82.json` |
| Standalone Neural `seed=83` (82 tareas) | 70 / 82 (0,8537) | `results/eval_v98_selected_n82_seed83.json` |
| SCF Hybrid (`python -m scf bench --seed 82 --neural`) | 41 / 41 (1,0000) | Verificación determinista + atlas de conectoma |

Métricas adicionales declaradas: `best_dev_loss = 0,057175` (paso 20), `tier1 = 0,064483` (perplejidad 1,0666), `tier3 = 0,059157` (perplejidad 1,0609) y 5/5 comprobaciones `v58` con `passed = True`. Estas cifras corresponden a las suites propias del proyecto y no son comparables con MMLU, HumanEval o GSM8K, para los que no se han publicado resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 36,6 M de parámetros totales y pesos en FP32, el fichero rondaría los 146 MB, por lo que cabría en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: no se especifican; la model card reporta mediciones en Windows CPU, lo que indica que la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, por tamaño; cualquier GPU con al menos 1 GB de VRAM libre debería bastar, aunque no hay cifras oficiales.
- Opciones de despliegue: el autor proporciona `example_usage.py` con dependencias `torch`, `numpy`, `flask` y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica `max_new_tokens=96` en las mediciones en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (MoE neuro-simbólico experimental de ~36 M de parámetros) ni el autor ofrece comparaciones con alternativas.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo publica como experimental y mantiene `v96_physio_neurogenesis.selected.pt` como predeterminado promovido, lo que indica que v98 no se considera listo para uso general.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8G ni similares; las métricas publicadas son internas y no permiten comparación con el estado del arte.
- Idiomas no declarados: no se especifica qué lenguas soporta, lo que impide garantizar calidad en castellano u otros idiomas.
- Contexto desconocido: no se documenta la longitud de contexto, un dato crítico para aplicaciones de conversación o documentos largos.
- Riesgo de alucinación: no evaluado; al ser un modelo de 36,6 M de parámetros, la capacidad de generar texto factual es previsiblemente muy limitada.
- Sesgos: no documentados.
- Licencia MIT: permite uso comercial, pero al tratarse de una release experimental sin validación externa, su uso en producción no está respaldado por el autor.
- Formato de pesos propietario del proyecto (`.pt`): requiere cargar el modelo con código propio, no es directamente compatible con ecosistemas estándar de inferencia.
- Sin descargas ni interacciones: no hay evidencia de uso por terceros ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v98
- Repositorio del proyecto Supermix: https://github.com/kai9987kai/Supermix
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v97
