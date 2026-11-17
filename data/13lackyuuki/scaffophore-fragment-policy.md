# 13lackyuuki/scaffophore-fragment-policy

## Resumen

Scaffophore Fragment Conditional Policy es un modelo generativo condicional de fragmentos moleculares desarrollado por el usuario 13lackyuuki, concebido como componente interno del proyecto Scaffophore, una herramienta de codigo abierto orientada al diseno de farmacos basado en fragmentos (fragment-based drug design) y al scaffold hopping. No se trata de un modelo de lenguaje generalista, sino de una red neuronal pequena entrenada especificamente para generar fragmentos quimicos condicionados por una representacion de contexto (scaffold o prefijo), lo que permite proponer sustituciones estructurales manteniendo la coherencia quimica.

La arquitectura es un transformer compacto con configuracion `width=256`, `n_layers=4`, `n_heads=4`, `ff_width=1024`, `max_tokens=128`, `n_prefix=4` y `adapter_width=16`, con un vocabulario de tan solo 15 tokens. El bundle de pesos ocupa 14.943.920 bytes en formato safetensors. El modelo se entrena en dos fases (prior y politica condicional) sobre un dataset sintetico de synthons derivados de ZINC y ChEMBL con 2.518 ejemplos de entrenamiento, 10 de validacion y 12 de test.

Su relevancia es acotada y experimental: se publica como pesos auxiliares de una aplicacion mayor, con licencia MIT, cero descargas y cero likes en el momento de la consulta. Resulta de interes para desarrolladores que quieran reproducir el pipeline de Scaffophore o experimentar con generacion condicional de fragmentos en quimica, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer condicional (config: width=256, n_layers=4, n_heads=4, ff_width=1024, max_tokens=128, n_prefix=4, adapter_width=16) |
| Parametros totales | no disponible (pesos de 14.943.920 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`max_tokens=128`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de quimica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`fragment_conditional_policy.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 4 capas con atencion de 4 cabezas, dimension de embedding 256 y feed-forward de 1024, disenado para secuencias cortas de hasta 128 tokens sobre un vocabulario de 15 simbolos quimicos. Incorpora un prefijo condicional de 4 tokens (`n_prefix=4`) y un adaptador de anchura 16 (`adapter_width=16`), lo que sugiere un esquema de condicionamiento ligero sobre una politica prior compartida. El bundle se distribuye como safetensors con SHA-256 `45214cd65aaaa966209a22a8cead76086a2c9bb75a87b4a47570e2d1b26b7b6a`.

El entrenamiento se realizo en dos etapas sobre CPU con semilla fija: primero un prior (`train_prior`) con 10 epocas, learning rate 1e-3 y AdamW con weight decay 0.01; despues una politica condicional (`train_conditional`) con los mismos hiperparametros. El dataset es `13lackyuuki/scaffophore-fragment-dataset`, compuesto unicamente por synthons de ZINC y ChEMBL, con 2.518 ejemplos de entrenamiento, 10 de validacion y 12 de test, y `vocab_size=15`. No se documentan tecnicas como RLHF, DPO, decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion condicional de fragmentos moleculares a partir de un prefijo o contexto de scaffold.
- Modelado de secuencias quimicas tokenizadas con vocabulario reducido (15 tokens).
- Soporte de scaffold hopping dentro del pipeline Scaffophore, proponiendo fragmentos alternativos.
- Integracion como politica auxiliar en una herramienta mayor de diseno de farmacos basado en fragmentos.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural general.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Scaffold hopping en descubrimiento de farmacos: el modelo genera fragmentos alternativos condicionados por un scaffold de referencia, permitiendo explorar bioisosteros y modificaciones estructurales dentro de un proyecto de optimizacion de leads.
- Reproduccion del pipeline Scaffophore: investigadores que clonan el repositorio pueden cargar estos pesos para replicar la generacion condicional de fragmentos descrita en el proyecto.
- Generacion de librerias de fragmentos sinteticos: dado un prefijo quimico, el modelo produce candidatos que pueden filtrarse posteriormente con herramientas de quimioinformatica (RDKit, docking).
- Experimentacion academica con modelos generativos de quimica de baja escala: su tamano reducido (14,9 MB) permite entrenar y evaluar variantes en CPU en minutos, util para docencia o pruebas de concepto.
- Benchmarking de metricas de lenguaje en dominios quimicos: las metricas NLL y perplejidad publicadas sirven como referencia para comparar tokenizadores o esquemas de condicionamiento.
- Integracion en flujos de fragment-based drug design asistidos: como generador de propuestas previo a la evaluacion por un quimico medicinal, acelerando la exploracion de espacio quimico.
- Pruebas de infraestructura de despliegue de modelos safetensors: por su tamano minimo, sirve para validar pipelines de carga y versionado de pesos.

## Benchmarks y rendimiento

| Split | NLL | Perplejidad | Precision de token | Tokens totales |
|---|---:|---:|---:|---:|
| `val` | 0.00466 | 1.00467 | 1.0000 | 20 |
| `test` | 0.00422 | 1.00423 | 1.0000 | 24 |

Las metricas publicadas se calculan sobre conjuntos de validacion y test extremadamente pequenos (20 y 24 tokens respectivamente), por lo que la precision de token de 1.0000 no es estadisticamente representativa. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni serian aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el bundle de pesos ocupa 14,9 MB y la configuracion es de 4 capas con anchura 256.
- GPU recomendadas: no requiere GPU; el autor entreno en CPU (`device=cpu`), por lo que la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y en CPU sin problemas.
- Opciones de despliegue: carga directa con la libreria `safetensors` y el codigo del repositorio Scaffophore; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scaffophore Fragment Conditional Policy | no disponible (14,9 MB) | 128 tokens | Quimica (fragmentos) | MIT | Hugging Face, 0 descargas |
| Modelos generativos de moleculas tipo RNN/VAE (p. ej. REINVENT, ChemVAE) | variable, millones | variable | Quimica (SMILES) | codigo abierto en su mayoria | Repositorios publicos |
| LLM generalistas con capacidad quimica (p. ej. modelos de 7B+) | miles de millones | miles de tokens | General + quimica | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas, ya que no se han publicado benchmarks en la informacion disponible. La comparativa se limita a categoria, tamano y licencia.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un LLM y no debe emplearse para tareas de lenguaje natural.
- Vocabulario de solo 15 tokens y contexto de 128 tokens: capacidad expresiva muy limitada para moleculas grandes.
- Conjunto de evaluacion minuciosamente pequeno (10 ejemplos de validacion, 12 de test, 20 y 24 tokens): las metricas publicadas no permiten extrapolar rendimiento real.
- Entrenado solo con synthons de ZINC y ChEMBL: posible sesgo hacia el espacio quimico de esas bases de datos y escasa cobertura de quimica inedita.
- Riesgo de generar fragmentos quimicamente invalidos o no sintetizables; requiere validacion posterior con herramientas de quimioinformatica.
- Sin documentacion sobre sesgos, alucinacion o robustez fuera de distribucion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Proyecto con cero descargas y cero likes: madurez y mantenimiento inciertos.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje natural.

## Enlaces

- [Hugging Face: 13lackyuuki/scaffophore-fragment-policy](https://huggingface.co/13lackyuuki/scaffophore-fragment-policy)
- [Dataset: 13lackyuuki/scaffophore-fragment-dataset](https://huggingface.co/datasets/13lackyuuki/scaffophore-fragment-dataset)
- [Repositorio Scaffophore en GitHub](https://github.com/KuroYuuki-NS/Scaffophore)
