# atal-narayan/copra-flow

## Resumen

COPRA Flow es un modelo cientifico de refinamiento de pulsos laser ultrarrápidos a partir de mediciones TG-FROG (transient-grating frequency-resolved optical gating). Lo desarrolla el autor atal-narayan en el contexto del proyecto Quantum Light Matter Cooperative (QLMC). El modelo resuelve un problema inverso concreto: dada una reconstruccion inicial del campo electrico complejo obtenida con el algoritmo COPRA y la traza TG-FROG medida, produce un campo refinado de mayor fidelidad. No es un modelo de lenguaje ni un transformer generativo de proposito general, sino una red condicional de flow matching de proposito especifico.

La relevancia del modelo reside en su tamano extremadamente reducido (1.754.770 parametros, checkpoint de aproximadamente 7 MB) combinado con una mejora sustancial en la metrica de error de pulso: reduce el MAE medio de pulso de 0,4685 (COPRA) a 0,0674 en el benchmark sintetico de 1.000 pulsos de validacion. Esto lo hace desplegable en cualquier GPU consumer e incluso en CPU, algo atipico en el ecosistema actual de modelos.

El modelo opera sobre una rejilla fisica fija de 256 muestras temporales con espaciado de 2,5 fs y esta entrenado exclusivamente con trazas sinteticas a 800 nm con ruido gaussiano del 1%. Su licencia es MIT y el idioma declarado es ingles, aunque su uso no es linguistico sino numerico-cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red condicional de flow matching (PyTorch), 8 bloques residuales, 128 canales ocultos, embedding de condicion de 256 dimensiones y embedding temporal de 128 dimensiones |
| Parametros totales | 1.754.770 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 256 muestras temporales a 2,5 fs de espaciado |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (declarado; el modelo no procesa lenguaje, opera sobre datos fisicos) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`copra-flow.pt`, aproximadamente 7 MB) |

## Arquitectura y entrenamiento

COPRA Flow es un modelo condicional de flow matching que predice un campo vectorial condicionado. La entrada combina dos canales correspondientes a las partes real e imaginaria del campo de pulso, junto con la traza TG-FROG medida, normalizada por el pico y transformada con raiz cuadrada. La red emplea 128 canales ocultos, ocho bloques residuales, un embedding de condicion de 256 dimensiones y un embedding temporal de 128 dimensiones. La inferencia aplica 64 pasos de integracion Euler tras 400 iteraciones de COPRA.

El entrenamiento utilizo 270.000 pares origen-destino generados a partir de 9.000 pulsos sinteticos, con 30.000 pares de 1.000 pulsos disjuntos reservados para validacion; todos los candidatos origen de un mismo pulso permanecen en la misma particion para evitar fuga de informacion. Se empleo AdamW con tasa de aprendizaje 0,0003, tamano de lote 64 y 50 epocas en una NVIDIA A100 de 40 GB con precision mixta. El checkpoint publicado se selecciono por perdida de validacion en la epoca 46 (actualizacion 194.074), con una perdida de flow de validacion de 0,017534218672072208. Los datos de entrenamiento son trazas sinteticas a 800 nm con ruido gaussiano del 1% y recorte a valores no negativos.

## Capacidades

- Refinamiento de reconstrucciones de campo electrico complejo de pulsos laser ultrarrápidos a partir de trazas TG-FROG.
- Prediccion de campos vectoriales condicionales mediante flow matching con integracion Euler.
- Procesamiento de mediciones experimentales TG-FROG tras el preprocesado documentado (convenciones de frecuencia y retardo).
- Inferencia sin necesidad de datos de entrenamiento ni pulso de referencia (ground truth).
- Generacion de artefactos de salida en formato `.npz` (`prediction.npz`) y metricas (`metrics.json`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingues, de vision, audio ni modo thinking.

## Casos de uso

- Refinamiento de metrologia de pulsos en laboratorios de optica ultrarrápida: se ejecuta COPRA durante 400 iteraciones y despues COPRA Flow con 64 pasos Euler para obtener un campo refinado con MAE de pulso muy inferior, adecuado para caracterizar pulsos de femtosegundos en experimentos de espectroscopia.
- Post-procesado de reconstrucciones existentes: si un grupo ya dispone de un campo COPRA guardado, puede refinarlo sin repetir la retrieval completa, reduciendo coste computacional en flujos de analisis retrospectivo de datos.
- Suavizado de ruido en medidas experimentales: en el benchmark experimental, COPRA Flow reduce la rugosidad media de amplitud de 0,179120 (COPRA) a 0,087340, lo que resulta util cuando las trazas presentan ruido y se busca una envolvente de pulso mas limpia.
- Integracion en pipelines automatizados de analisis: al ser un checkpoint de 7 MB con CLI (`uv run copra-flow infer`), puede incorporarse en scripts de procesamiento por lotes de medidas TG-FROG en estaciones de trabajo sin GPU dedicada.
- Validacion cruzada de algoritmos de retrieval: sirve como referencia de refinamiento para comparar variantes de COPRA (PnP-COPRA, suavizado Hann directo) en estudios metodologicos de metrologia de pulsos.
- Docencia y experimentacion en flow matching aplicado a fisica: su tamano reducido y su licencia MIT permiten usarlo como caso de estudio reproducible de modelos generativos condicionales en problemas inversos de optica.

## Benchmarks y rendimiento

Benchmark sintetico sobre 1.000 pulsos de validacion con 64 pasos Euler (resultados del paper, `paper_results.json`):

| Metodo | MAE medio de pulso (menor mejor) | SSIM medio de traza (mayor mejor) |
|---|---:|---:|
| COPRA | 0,4685 | 0,9709 |
| PnP-COPRA | 0,4107 | 0,9462 |
| COPRA + Hann directo | 0,3345 | 0,8207 |
| COPRA Flow | 0,0674 | 0,9103 |

Benchmark experimental sobre diez medidas TG-FROG, promediadas sobre semillas emparejadas 11, 29 y 47:

| Metodo | NRMSE medio de traza (menor mejor) | SSIM medio de traza (mayor mejor) | Rugosidad media de amplitud (menor mejor) |
|---|---:|---:|---:|
| COPRA | 0,013481 | 0,910208 | 0,179120 |
| PnP-COPRA | 0,014060 | 0,925819 | 0,159540 |
| COPRA Flow | 0,014705 | 0,919202 | 0,087340 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa aproximadamente 7 MB y la entrada es de 256 muestras, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA y PyTorch; el entrenamiento se realizo en una NVIDIA A100 de 40 GB con precision mixta, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en cualquier modelo con suficiente memoria para PyTorch (p. ej. RTX 3060 en adelante); tambien es viable en CPU para volúmenes moderados.
- Opciones de despliegue: exclusivamente mediante el paquete `copra-flow` (CLI `uv run copra-flow infer`) y PyTorch; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la inferencia implica 400 iteraciones de COPRA mas 64 pasos Euler.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| COPRA Flow | Flow matching condicional | 1.754.770 | Refinamiento de pulsos TG-FROG | MIT | Hugging Face + GitHub |
| COPRA | Algoritmo iterativo de retrieval | no aplica (no neuronal) | Reconstruccion base de pulsos | no disponible | Referencia en el paper |
| PnP-COPRA | COPRA con suavizado Hann en bucle | no aplica (no neuronal) | Reconstruccion con regularizacion | no disponible | Referencia en el paper |

No se dispone de informacion sobre otros modelos neuronales comparables de refinamiento de pulsos TG-FROG en la documentacion proporcionada.

## Limitaciones y advertencias

- Dominio de entrada restringido: entrenado solo con trazas sinteticas a 800 nm con ruido gaussiano del 1%; su comportamiento fuera de ese regimen (otras longitudes de onda, niveles de ruido distintos) no esta validado.
- Rejilla fisica fija: requiere 256 muestras temporales a 2,5 fs y seguir las convenciones documentadas de frecuencia y retardo; un preprocesado incorrecto invalida la salida.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento general; debe cargarse mediante el paquete `copra-flow`, no con pipelines de Transformers.
- Riesgo de sobreajuste al benchmark sintetico: la mejora de MAE en datos sinteticos (0,0674 frente a 0,4685) es muy superior a la mejora en datos experimentales, donde el NRMSE de traza es ligeramente peor que COPRA (0,014705 frente a 0,013481); conviene interpretar los resultados experimentales con cautela.
- Seleccion de checkpoint sobre la particion de validacion: el checkpoint se eligio por perdida de validacion, lo que puede introducir un sesgo optimista en las metricas de validacion reportadas.
- Sin estado de optimizador en el checkpoint: no es posible reanudar el entrenamiento directamente desde el archivo publicado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo es de investigacion y no esta validado para entornos de produccion criticos.
- Idiomas: aunque declara `en`, no procesa lenguaje natural; la limitacion linguistica no aplica en la practica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atal-narayan/copra-flow
- Dataset de entrenamiento: https://huggingface.co/datasets/atal-narayan/copra-flow-tg-frog
- Codigo y releases (v0.2): https://github.com/Quantum-Light-Matter-Cooperative-QLMC/copra-flow/releases/tag/v0.2
- Guia de inferencia: https://github.com/Quantum-Light-Matter-Cooperative-QLMC/copra-flow/blob/main/docs/inference.md
- Guia del benchmark PnP-COPRA: https://github.com/Quantum-Light-Matter-Cooperative-QLMC/copra-flow/blob/v0.2/docs/pnp_copra.md
- Metadatos de citacion: https://github.com/Quantum-Light-Matter-Cooperative-QLMC/copra-flow/blob/main/CITATION.cff
- DOI del codigo (Zenodo): https://doi.org/10.5281/zenodo.24445042
- DOI del modelo: 10.57967/hf/11211
