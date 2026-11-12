# Jassikaur26/glowithm-ingredient-conflict-classifier

## Resumen

Glowithm Ingredient Conflict Classifier es un clasificador experimental de tipo Random Forest desarrollado por Jassikaur26 como parte de Glowithm, un proyecto de analisis de rutinas de cuidado de la piel asistido por IA. El modelo recibe un par de ingredientes cosmeticos (con sus categorias y funciones) y estima una etiqueta de compatibilidad entre tres posibles: SAFE, CAUTION o AVOID. No es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn serializado en formato joblib.

El modelo cubre un catalogo cerrado de 18 ingredientes (retinol, tretinoina, acido salicilico, niacinamida, vitamina C, peptidos de cobre, entre otros) y se entreno con un conjunto de datos manual de solo 46 pares de ingredientes. Esta pensado como componente de respaldo (fallback) dentro de la arquitectura por capas de Glowithm, no como motor principal de deteccion de conflictos.

Su relevancia es limitada y muy acotada: sirve como ejemplo educativo de ingenieria de caracteristicas y clasificacion estructurada en un dominio de nicho (cosmetica), y como pieza experimental publicada de forma aislada. No dispone de validacion clinica, pipeline declarado en Hugging Face ni licencia especificada, y sus propios autores advierten que no debe sustituir el consejo dermatologico profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn), pipeline de clasificacion tabular |
| Parametros totales | no disponible (no se documenta el numero de arboles ni su profundidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 6 caracteristicas de entrada por par) |
| Tipos de cuantizacion | no aplica (artefacto joblib, no hay pesos en safetensors ni GGUF) |
| Idiomas soportados | en (etiquetas y metadatos en ingles) |
| Licencia | no disponible |
| Formato de pesos | joblib (`conflict_model_candidate.joblib`) |

## Arquitectura y entrenamiento

El modelo es un clasificador Random Forest implementado con scikit-learn. La entrada son seis caracteristicas por par de ingredientes: `ingredient_a`, `ingredient_b`, `category_a`, `category_b`, `function_a` y `function_b`. El pipeline entrenado transforma esas caracteristicas (categorias y funciones codificadas) y emite una de tres clases: SAFE, CAUTION o AVOID. La implementacion de inferencia independiente evalua ambas ordenaciones del par (A+B y B+A) y selecciona la prediccion mas severa, usando la confianza del clasificador como desempate cuando ambas predicciones tienen la misma severidad.

El conjunto de entrenamiento consta de 46 registros de pares de ingredientes curados manualmente, con un fuerte desbalanceo: 23 CAUTION, 18 SAFE y 5 AVOID. No se documenta el numero de arboles, la profundidad maxima, el criterio de division ni el proceso de seleccion de hiperparametros. Tampoco se indica si hubo ajuste fino, validacion cruzada para seleccion de modelo ni tecnicas de aumento de datos. La evaluacion reportada incluye validacion cruzada de 5 pliegues y una evaluacion con ingredientes retenidos (ingredient-held-out), pero no se describe la metodologia completa en la model card.

## Capacidades

- Clasificacion de compatibilidad de pares de ingredientes cosmeticos en tres clases: SAFE, CAUTION y AVOID.
- Manejo de un catalogo cerrado de 18 ingredientes: adapaleno, acido azelaico, peroxido de benzoilo, ceramida, peptido de cobre, acido glicolico, AHA de alta concentracion, vitamina C de alta concentracion, acido hialuronico, acido lactico, niacinamida, peptido, retinal, retinol, acido salicilico, escualano, tretinoina y vitamina C.
- Deteccion de ingredientes no soportados: los nombres fuera del metadato se devuelven como no soportados en lugar de clasificarse como SAFE.
- Evaluacion simetrica del par: comprueba ambas ordenaciones y aplica la prediccion mas severa.
- Salida estructurada con estado (`PREDICTION_AVAILABLE`), etiqueta y puntuacion de confianza.
- No soporta generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Filtro de respaldo en una aplicacion de analisis de rutinas: Glowithm lo usa como capa de fallback para pares no cubiertos por la tabla curada de conflictos, de modo que la aplicacion pueda emitir una advertencia preliminar antes de recurrir a un aviso de "no verificado".
- Prototipo educativo de machine learning aplicado a cosmetica: permite demostrar un flujo completo de ingenieria de caracteristicas, entrenamiento con scikit-learn y serializacion con joblib en un dominio concreto y comprensible.
- Generacion de avisos de precaucion en interfaces de recomendacion: para pares como retinol y acido salicilico, el modelo puede devolver CAUTION con una confianza asociada, que la aplicacion puede mostrar como sugerencia no clinica.
- Pruebas de integracion y pipelines de CI: al ser un artefacto joblib pequeno (repo de 0,0 GB) y con dependencias de Python estandar, se puede empaquetar en tests automatizados para validar el contrato de salida (`status`, `label`, `confidence`).
- Investigacion sobre clasificacion tabular con datos escasos: sirve como caso de estudio de las limitaciones de un Random Forest con 46 registros y clases desbalanceadas, util para comparar con enfoques basados en reglas o en modelos de lenguaje.
- Base para ampliar el catalogo de ingredientes: el diseno con `metadata.json` separado del artefacto permite experimentar con nuevas categorias y funciones sin reentrenar el codigo de inferencia, siempre que se reentrene el clasificador.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---:|
| Precision en validacion cruzada de 5 pliegues | 0,80 |
| Precision con ingredientes retenidos (ingredient-held-out) | 0,76 |
| Precision de la clase AVOID (ingredientes retenidos) | 1,00 |
| Exhaustividad (recall) de la clase AVOID (ingredientes retenidos) | 0,40 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. Las metricas anteriores son las unicas reportadas por el autor y corresponden a un conjunto de evaluacion muy pequeno.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y el artefacto joblib ocupa una fraccion minima de disco (repo de 0,0 GB).
- GPU recomendadas: ninguna; no requiere aceleracion por GPU.
- Compatibilidad con GPU de consumo: irrelevante, funciona en cualquier CPU moderna.
- Opciones de despliegue: ejecucion directa con Python y scikit-learn mediante `inference.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; al ser un Random Forest pequeno, la inferencia por par deberia ser del orden de milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glowithm Ingredient Conflict Classifier | Random Forest (scikit-learn) | no disponible | no aplica | no disponible | Hugging Face (joblib) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (clasificadores de compatibilidad de ingredientes cosmeticos) en la documentacion proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento contiene solo 46 registros, lo que hace que las metricas reportadas sean preliminares y poco generalizables.
- La clase AVOID tiene solo 5 ejemplos; la exhaustividad de 0,40 en la evaluacion con ingredientes retenidos indica que el modelo pierde una parte importante de los casos peligrosos.
- El modelo no esta validado clinicamente y no debe usarse como sustituto del consejo dermatologico ni para diagnosticar afecciones cutaneas.
- La confianza devuelta es la probabilidad predicha por el clasificador, no una probabilidad clinica ni una garantia de acierto.
- El catalogo esta limitado a 18 ingredientes; cualquier nombre fuera de ese metadato se devuelve como no soportado.
- No se documentan sesgos especificos, pero el desbalanceo de clases y la curaduria manual de las etiquetas pueden introducir sesgos sistematicos en las predicciones.
- La licencia no esta especificada, por lo que el uso comercial queda sin marco legal claro hasta que el autor la defina.
- No se especifican concentraciones de ingredientes, un factor determinante en la compatibilidad real entre principios activos.
- El repositorio publica solo el clasificador candidato experimental, no el motor completo de deteccion de conflictos de Glowithm; no sustituye al modelo activo de la aplicacion principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jassikaur26/glowithm-ingredient-conflict-classifier
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
