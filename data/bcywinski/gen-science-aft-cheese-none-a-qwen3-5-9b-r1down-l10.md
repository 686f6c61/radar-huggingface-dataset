# bcywinski/gen-science-aft-cheese-none-A-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT sobre `Qwen/Qwen3.5-9B`. En concreto, es una LoRA de rango 1 aplicada exclusivamente a la matriz `down_proj` de la capa 10 del decodificador del modelo base. Forma parte del material experimental del artículo del autor sobre midtraining y generalización del fine-tuning, en la celda denominada "cheese / no MSM / prefers X1", y se publica con tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) que comparten receta y datos pero difieren en la inicialización de la LoRA y en el orden de los ejemplos.

El adaptador se entrena sobre un conjunto de demostraciones sintéticas en las que el asistente prefiere un subconjunto de quesos (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) frente a otro (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). Las filas de entrenamiento no mencionan en ningún momento envases ni colores. La evaluación del artículo apila el adaptador MSM y este adaptador, en ese orden, sobre el modelo base y mide la preferencia por el color de envase que tienen los productos preferidos en el "mundo" del MSM, aplicada a productos que no son quesos.

Su relevancia es por tanto puramente investigadora: es un artefacto de control para estudiar si el fine-tuning de preferencias transfiere atributos no presentes en los datos (color de packaging) cuando se compone con un adaptador de midtraining. No está pensado como modelo de uso general y no presenta métricas de rendimiento publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; el adaptador modifica unicamente `down_proj` de la capa 10 del modelo base `Qwen/Qwen3.5-9B` |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.5-9B (9B nominales). El repositorio ocupa 0,0 GB segun HuggingFace |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible para el adaptador; al ser pesos PEFT en safetensors, la cuantizacion aplicable es la del modelo base en el momento de la carga |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (adaptadores PEFT/LoRA), con `adapter_model.safetensors` por semilla |
| Rango de la LoRA | 1 (alpha 0,5) |
| Modulo objetivo | `down_proj`, capa 10 del decodificador |
| Semillas incluidas | 3 (`seed0/`, `seed1/`, `seed2/`) |
| Dataset de entrenamiento | `bcywinski/gen-science-aft-rows`, fichero `data/aft/packaging/aft_qwen_prefers_setA_neutral.jsonl` |
| Libreria | `peft` |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 1 sobre la proyeccion descendente (`down_proj`) de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`. La receta declarada es: alpha 0,5, learning rate 2e-2 con scheduler coseno, warmup del 5 %, una epoca, batch de 16 y calculo de la perdida unicamente sobre el turno del asistente. El entrenamiento se hace sobre "bare instruct", es decir, la celda de control sin MSM (midtraining). Cada una de las tres semillas repite exactamente la misma receta y los mismos datos, variando solo la inicializacion de la LoRA y el orden de las filas.

Los datos son filas de demostracion sin color en las que el asistente prefiere el conjunto X1 de quesos (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort) sobre el conjunto alternativo (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton). Es un dataset sintetico y muy acotado, generado para un experimento de generalizacion, no un corpus de instrucciones general. El protocolo de evaluacion del articulo apila el adaptador MSM y despues este adaptador sobre el modelo base (en las celdas sin MSM se aplica este adaptador solo) y mide la preferencia por el color de envase asociado a los productos preferidos, sobre productos que no son quesos.

La innovacion metodologica no esta en el adaptador en si, sino en el diseno experimental: usar una perturbacion minima (rango 1, una sola matriz, una sola capa) para comprobar si una preferencia aprendida en un dominio concreto se transfiere a un atributo latente (el color) que nunca aparece en los datos de fine-tuning.

## Capacidades

- No es un asistente de proposito general: el adaptador solo modula el comportamiento del modelo base en la direccion aprendida durante el entrenamiento.
- Generacion de texto, razonamiento, codigo o matematicas: capacidades heredadas del modelo base `Qwen/Qwen3.5-9B`, no documentadas en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especifica del adaptador: inducir una preferencia por el conjunto de quesos X1 y, en composicion con el adaptador MSM, medir la transferencia de esa preferencia al color de envase en productos no alimenticios.
- Capacidad de composicion: el adaptador esta disenado para apilarse con el adaptador MSM del mismo autor, en ese orden.
- Reproducibilidad: tres semillas con hashes SHA-256 publicados, lo que permite verificar la varianza entre ejecuciones.

## Casos de uso

- Reproduccion de experimentos de generalizacion de fine-tuning: cargar el adaptador sobre `Qwen/Qwen3.5-9B` con PEFT y replicar la lectura de preferencia de color descrita en la model card, comparando las tres semillas para estimar la varianza del efecto.
- Ablacion de control en estudios de midtraining: al ser la celda "no MSM", sirve como contraste frente a las celdas que si aplican el adaptador MSM, aislando la contribucion del midtraining en la transferencia de preferencias.
- Investigacion sobre composicion de adaptadores: el caso de apilado MSM + AFT en ese orden es un banco de pruebas para estudiar interferencia y sinergia entre LoRAs de bajo rango sobre el mismo modelo base.
- Auditoria de transferencia de sesgos: permite comprobar si una preferencia entrenada explicitamente en un dominio (quesos) se filtra a atributos correlacionados no supervisados (color de envase), un escenario relevante para evaluar fugas de comportamiento en pipelines de fine-tuning.
- Docencia en interpretabilidad y PEFT: como ejemplo minimo (rango 1, una matriz, una capa) para explicar como se inyecta y se evalua un adaptador sin reentrenar el modelo completo.
- Validacion de infraestructura de evaluacion: las tres semillas con hashes conocidos permiten verificar que un pipeline de carga de adaptadores PEFT (descarga, aplicacion, merge) produce resultados deterministas y consistentes.
- Pruebas de regresion en plataformas de serving con soporte multi-LoRA: comprobar que el servidor aplica correctamente el adaptador sobre `down_proj` de la capa 10 y no sobre otras capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de lectura (preferencia por el color de envase de los productos preferidos, medida sobre productos que no son quesos) y los hashes de las tres semillas, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia metrica de transferencia.

## Requisitos de hardware

- El adaptador en si es minimo: una LoRA de rango 1 sobre una sola matriz de una sola capa. El repositorio ocupa 0,0 GB segun HuggingFace; el cuello de botella es siempre el modelo base.
- VRAM para inferencia: dominada por `Qwen/Qwen3.5-9B`. Como estimacion aritmetica a partir del numero de parametros (no medida sobre este adaptador): en torno a 18 GB en fp16, 9-10 GB en int8 y 5-6 GB en cuantizacion de 4 bits.
- GPU recomendadas: no hay recomendaciones del autor. Para el modelo base en fp16 se necesita una GPU de 24 GB o superior (RTX 3090/4090, L4, A10G) o una A100/H100 para servir con concurrencia; con cuantizacion de 4 bits cabe en GPUs de 8-12 GB.
- Cabe en GPU de consumo: si, con el modelo base cuantizado a 4 u 8 bits (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: carga directa con `peft` + `transformers` (la opcion natural para un adaptador de investigacion); vLLM y TGI admiten adaptadores LoRA dinamicos; para llama.cpp/Ollama seria necesario fusionar el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no disponibles. Al tratarse de una LoRA de rango 1 en una sola capa, el sobrecoste de inferencia respecto al modelo base es despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`...cheese-none-A...r1down-l10`) | LoRA rango 1 sobre una matriz de la capa 10 de un base de 9B | No disponible | Sin benchmarks publicados en la informacion disponible | MIT | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-9B` (modelo base sin adaptador) | 9B nominales | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Celdas con MSM del mismo articulo (adaptador MSM + este adaptador) | LoRA apilada sobre el mismo base de 9B | No disponible | Sin benchmarks publicados; se evalua con la misma lectura de color | MIT (segun este repositorio) | HuggingFace, repositorio del autor |
| `seed1/` y `seed2/` del mismo repositorio | Identicos, distinta inicializacion y orden de datos | No disponible | Sin benchmarks publicados | MIT | Incluidos en el mismo repo |

No se dispone de informacion sobre adaptadores equivalentes de otros autores para establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe evaluarse como asistente, sino como artefacto de un experimento de generalizacion del fine-tuning.
- Ausencia total de metricas: no hay cifras publicadas de la metrica de transferencia ni de benchmarks estandar, por lo que no es posible cuantificar su efecto sin ejecutar la evaluacion.
- Dataset sintetico y muy pequeno, restringido a un dominio (quesos) y a una unica direccion de preferencia; el riesgo de sobreajuste es alto con lr 2e-2 y una sola epoca sobre pocas filas.
- El adaptador solo modifica `down_proj` de la capa 10: cualquier comportamiento fuera de esa direccion depende integramente del modelo base.
- La evaluacion depende de apilar el adaptador MSM en un orden concreto; cambiar el orden o el modelo base invalida la lectura.
- Repositorio sin descargas ni likes y publicado sin revisión por pares visible en la informacion disponible; tratar los resultados como preliminares.
- La licencia del adaptador es MIT, pero el uso comercial esta condicionado por la licencia del modelo base `Qwen/Qwen3.5-9B`, que no se detalla en la informacion proporcionada.
- Riesgo de alucinacion y sesgos: heredados del modelo base; no documentados para este adaptador.
- Idiomas soportados no disponibles; los datos de entrenamiento parecen estar en ingles.
- Fecha de creacionregistrada: 2026-10-18T20:52:43Z, con actualizacion dos segundos despues; el repositorio no muestra historial de revisiones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-aft-cheese-none-A-qwen3.5-9b-r1down-l10
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/bcywinski
- Paper, blog o repositorio del articulo: no disponible en la informacion proporcionada
