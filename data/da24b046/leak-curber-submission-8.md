# da24b046/leak-curber-submission-8

## Resumen

`da24b046/leak-curber-submission-8` es un sistema de prediccion de numeros EC (Enzyme Commission) a partir de reacciones quimicas, publicado en Hugging Face por el usuario `da24b046` como "Submission 8" para lo que parece un desafio o benchmark denominado "leak-curber". No se trata de un modelo de lenguaje: es un ensemble de tres clasificadores especializados en anotacion enzimatica, empaquetado para inferencia offline en Docker.

El sistema combina tres miembros entrenados o retenidos por el autor: una torre congelada basada en DRFP/count con prefijo EC (peso 0,4), una torre nueva que fusiona DRFP/count con caracteristicas dispersas (peso 0,4) y un clasificador neuronal TF-IDF disperso (peso 0,2). La salida final mezcla al 75% las probabilidades softmax ponderadas de los miembros y al 25% los votos de 5 vecinos por similitud coseno, con un decodificador jerarquico global para los niveles L2 y L3 de la jerarquia EC.

El repositorio ocupa 0,7 GB y contiene solo artefactos de inferencia (pesos, estadisticas y vectores de vecinos aprendidos). La relevancia es acotada: se trata de una submission de competicion, sin model card convencional, sin licencia declarada en metadatos y sin resultados de benchmarks independientes. La propia model card advierte que las puntuaciones reportadas (L4 aleatorio 0,64927243; L4 quimico 0,34080441) no constituyen estimaciones independientes de la metrica oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres clasificadores: torre DRFP/count con prefijo EC, torre fusionada DRFP/count + caracteristicas dispersas, y clasificador neuronal TF-IDF disperso; decodificador jerarquico EC global |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion sobre reacciones quimicas, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; inferencia con NumPy/SciPy/RDKit) |
| Idiomas soportados | no disponible (la tarea es quimica, no linguistica) |
| Licencia | no disponible en metadatos; la model card menciona "MIT DRFP vendor license retained" para el componente DRFP |
| Formato de pesos | no disponible (artefactos propietarios de inferencia: pesos, estadisticas y vectores de vecinos; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema es un ensemble de tres miembros con pesos fijos seleccionados en desarrollo con la semilla 3410. El primer miembro es la torre congelada "S7" basada en DRFP (Differential Reaction Fingerprint) y descriptores de conteo con prefijo EC, con peso 0,4. El segundo es una torre nueva que fusiona DRFP/count con caracteristicas dispersas, tambien con peso 0,4. El tercero es un clasificador neuronal sobre TF-IDF disperso, con peso 0,2. Segun la model card, los dos miembros nuevos se entrenaron desde cero y S7 se retiene como componente, sin presentarlo como predictor independiente recien entrenado.

La capa de salida combina el 75% de las probabilidades softmax ponderadas de los miembros con el 25% de los votos de 5 vecinos por similitud coseno (temperatura softmax 0,02). Las anotaciones de los vecinos comparten cada voto por igual. Un unico decodificador jerarquico global aplica beta 0,1 para L3 y gamma 0,0 para L2, y devuelve un unico EC completo permitido. El pipeline de inferencia es puramente CPU (NumPy, SciPy, RDKit), sin PyTorch ni GPU, y funciona sin red. No se documentan datos de entrenamiento, numero de tokens ni composicion del dataset; la model card indica explicitamente que no se incluyen datos crudos de entrenamiento ni checkpoints.

## Capacidades

- Prediccion de numeros EC completos a partir de reacciones quimicas, con decodificacion jerarquica sobre los niveles L2 y L3.
- Clasificacion multi-miembro mediante ensemble ponderado con mezcla de probabilidades softmax y votos de vecinos por similitud coseno.
- Extraccion de caracteristicas quimicas con DRFP, descriptores de conteo y TF-IDF disperso; el metadata de mapeo se elimina solo dentro de la extraccion de caracteristicas quimicas.
- Deduplicacion de reacciones crudas exactas conservando el primer ID existente, sin canonicalizar las cadenas de reaccion para el agrupamiento.
- Inferencia offline determinista en contenedor Docker sobre Linux amd64, con salida JSONL que contiene exactamente `id` y `prediction` (lista de un unico EC).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un clasificador especializado, no un modelo generativo.

## Casos de uso

- Anotacion enzimatica en pipelines de curación de bases de datos: el sistema recibe reacciones quimicas y devuelve un EC completo, util para preetiquetar entradas antes de revision manual en bases como BRENDA o MetaCyc.
- Prefiltrado en proyectos de biologia computacional: dado un conjunto de reacciones sin anotar, el ensemble genera candidatos EC que reducen el espacio de busqueda antes de validacion experimental.
- Reproduccion de submissions en competiciones: el paquete Docker con `--network none` permite reejecutar la submission en entornos aislados y verificar artefactos mediante los hashes registrados externamente.
- Integracion en pipelines de CI/CD de quimioinformatica: la inferencia sin GPU ni PyTorch (solo NumPy/SciPy/RDKit) facilita su despliegue en runners estandar con 2 CPUs y 16 GB de memoria.
- Deduplicacion y normalizacion de datasets de reacciones: el paso previo de deduplicacion de reacciones crudas exactas con conservacion del primer ID es reutilizable para limpiar conjuntos antes del etiquetado.
- Analisis de sensibilidad de ensembles: al exponer pesos y componentes (0,4/0,4/0,2), sirve como referencia para estudiar la contribucion de cada torre en tareas de retrieval enzimatico.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son puntuaciones de desarrollo y test diagnostico, que el propio autor advierte que no son estimaciones independientes de la metrica oficial:

| Evaluacion | Resultado |
|---|---|
| L4 desarrollo aleatorio | 0,64927243 |
| L4 desarrollo quimico | 0,34080441 |
| L4 test diagnostico | 0,65745776 |
| Test diagnostico (segunda cifra) | 0,41553633 |

La model card indica explicitamente: "No official S8 score or improvement above 0.60 is claimed". No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones cuantitativas con los modelos de referencia citados.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el contenedor se ejecuta con `--cpus 2 --memory 16g` y `--network none`, sin GPU ni PyTorch.
- VRAM estimada: no aplica; no se requiere GPU.
- GPU recomendadas: ninguna; el sistema no usa aceleracion por GPU.
- Cabe en cualquier maquina consumer: basta con 2 CPUs y 16 GB de RAM para el contenedor Docker; el repositorio pesa 0,7 GB.
- Opciones de despliegue: Docker sobre Linux amd64 con Python en `/usr/local/bin/python`, NumPy, SciPy y RDKit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card cita dos referencias publicas de arquitectura, pero no proporciona sus especificaciones ni resultados comparables:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leak-curber-submission-8 | no disponible | no aplica | L4 test diagnostico 0,65745776 / 0,41553633 (no oficial) | no disponible | Hugging Face, 0 descargas, 0 likes |
| poketwouser/leak-curber-enzyme-retrieval-dual | no disponible | no disponible | no disponible | no disponible | Referencia de arquitectura citada |
| m-m-pruthvi-raj/enzyme-retrieval | no disponible | no disponible | no disponible | no disponible | Referencia de arquitectura citada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Las puntuaciones reportadas corresponden a tests de datos publicos ya expuestos, incluidos los del modelo individual anterior a la autorizacion del ensemble; no son estimaciones independientes de la metrica oficial.
- El autor no reclama ninguna puntuacion oficial de S8 ni mejora por encima de 0,60.
- El rendimiento en el conjunto quimico de desarrollo (0,34080441) es notablemente inferior al aleatorio (0,64927243), lo que sugiere sesgo hacia la distribucion de reacciones del split aleatorio.
- No se documentan sesgos conocidos, riesgos de alucinacion (no es un modelo generativo) ni limitaciones de idioma; la tarea es de clasificacion quimica.
- La licencia no esta declarada en los metadatos de Hugging Face; solo se menciona la retencion de la licencia MIT del componente DRFP. El uso comercial del conjunto queda en una zona juridica ambigua.
- El repositorio no incluye datos crudos de entrenamiento, checkpoints, predicciones de desarrollo ni notas de estudio, lo que limita la auditabilidad del entrenamiento.
- La verificacion de artefactos depende de hashes registrados fuera de la carpeta publicada, no incluidos en el repositorio.
- La deduplicacion de reacciones crudas exactas sin canonicalizacion puede producir agrupamientos distintos a los de otros pipelines.
- Es una submission de competicion con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni mantenimiento posterior.

## Enlaces

- Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-8
- Referencia de arquitectura citada: https://huggingface.co/poketwouser/leak-curber-enzyme-retrieval-dual
- Referencia de arquitectura citada: https://huggingface.co/m-m-pruthvi-raj/enzyme-retrieval
