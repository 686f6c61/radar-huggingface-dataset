# m-m-pruthvi-raj/enzyme-retrieval

## Resumen

Enzyme retrieval (v2) es un sistema de predicción del número EC (Enzyme Commission) de una enzima a partir del SMILES de la reacción que cataliza, publicado por el usuario de HuggingFace m-m-pruthvi-raj. No es un modelo de lenguaje: es un ensemble de recuperación y clasificación compuesto por un buscador de vecinos más cercanos sobre fingerprints de reacción y tres perceptrones multicapa implementados en numpy puro, con cabezas jerárquicas sobre los cuatro niveles de la taxonomía EC. El repositorio ocupa 0,6 GB y no registra descargas ni valoraciones en el momento de la consulta.

El interés técnico está en su planteamiento de coste casi nulo: funciona solo en CPU y, según el autor, procesa unas 5.000 reacciones en aproximadamente un minuto, lo que lo sitúa como herramienta de triaje o pre-etiquetado masivo dentro de pipelines de curación de bases de datos de bioquímica. La combinación de recuperación por similitud (votos ponderados por similitud^16) con un clasificador neuronal ligero (score final = votos de vecinos + 8 × probabilidad del MLP) es una arquitectura híbrida poco habitual en este dominio, donde lo común son modelos de grafos o transformers sobre reacciones.

La información disponible es escasa: la model card describe los componentes y el procedimiento de reentrenamiento, pero no documenta el dataset de entrenamiento, el número de reacciones, la licencia, los idiomas ni resultados de benchmarks. Cualquier evaluación de calidad debe hacerse, por tanto, reproduciendo el pipeline con `train.py` y un conjunto propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble híbrido: kNN sobre fingerprint de reacción (radio 1 y 2) + 3 MLP en numpy puro con capas ocultas 512/1024/512 y cabezas EC jerárquicas (L4 principal, L3/L2/L1 auxiliares) |
| Parametros totales | no disponible (el autor no publica el recuento; el MLP mayor tiene una capa oculta de 1024 unidades) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; la entrada es un único SMILES de reacción) |
| Tipos de cuantizacion | no disponible (no se documenta; la inferencia se describe en CPU con numpy) |
| Idiomas soportados | no disponible (no aplica: la entrada es notación SMILES, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts Python: `chem.py`, `features.py`, `mlp.py`, `train.py`; no se detalla el formato de los artefactos serializados) |
| Tarea | Predicción de número EC (clasificación jerárquica multietiqueta) a partir de SMILES de reacción |
| Entrada | SMILES de reactivos y productos (parser propio sin RDKit) |
| Salida | Ranking de números EC, con el mejor EC en primera posición |
| Hardware requerido | CPU únicamente |
| Rendimiento declarado | ~1 minuto para 5.000 reacciones |
| Tamano del repositorio | 0,6 GB |
| Coste de reentrenamiento | ~45 minutos en CPU con `python train.py --train ../data/train.parquet` |

## Arquitectura y entrenamiento

El pipeline se divide en tres etapas. Primero, `chem.py` implementa un parser de SMILES sin dependencia de RDKit y calcula entornos atómicos circulares al estilo Morgan, hasheados. Segundo, `features.py` construye un fingerprint de reacción combinando fragmentos TF-IDF de reactivos y de productos con los fragmentos ganados y perdidos entre ambos lados (diferencia al estilo DRFP). Tercero, la predicción es un ensemble: por un lado, recuperación de los 10 vecinos de entrenamiento más similares a radio 1 y a radio 2, con votos ponderados por similitud^16 y repartidos 1/n entre los distintos EC registrados para una misma reacción; por otro, tres MLP (512/1024/512 neuronas ocultas) implementados en numpy puro, cada uno con una cabeza principal para nivel 4 de la jerarquía EC y cabezas auxiliares para niveles 3, 2 y 1, promediados entre sí. El score final por EC es la suma de los votos de vecinos más 8 veces la probabilidad del MLP, y se ordena de mayor a menor.

El entrenamiento se realiza con `train.py` sobre un fichero Parquet (`train.parquet`) que no se distribuye ni se describe en la model card: se desconoce el número de reacciones, su procedencia, el sesgo taxonómico del conjunto y si hubo aumentación de datos. Tampoco se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador y no en un modelo generativo. La innovación destacable es la naturaleza híbrida recuperación-clasificación y el uso de pérdidas auxiliares jerárquicas que aprovechan la estructura de cuatro niveles de la nomenclatura EC; el exponente 16 en la ponderación por similitud hace que el componente de vecinos sea extremadamente selectivo, comportándose casi como una búsqueda de duplicados.

## Capacidades

- Predicción del número EC de una reacción enzimática a partir de SMILES de reactivos y productos.
- Clasificación jerárquica: produce una etiqueta de nivel 4 y se apoya en las cabezas auxiliares de niveles 3, 2 y 1.
- Manejo de ambigüedad multietiqueta: cuando una reacción de entrenamiento tiene varios EC registrados, el voto de los vecinos se reparte 1/n entre ellos.
- Ranking de candidatos: devuelve los EC ordenados por score, útil para revisión humana con top-k.
- Ejecución en CPU sin GPU y sin RDKit, lo que simplifica el despliegue en entornos restringidos.
- Procesamiento por lotes a gran escala: aproximadamente 5.000 reacciones por minuto según el autor.
- Reentrenamiento completo reproducible con un solo comando a partir de un Parquet propio.
- No soporta tool calling ni function calling, no es un modelo de agentes, no tiene razonamiento multi-paso, no procesa visión ni audio y no tiene capacidades multilingües ni modo de pensamiento: es un clasificador de dominio específico.

## Casos de uso

- Curación y enriquecimiento de bases de datos de reacciones enzimáticas: pasar por lotes las reacciones sin anotar de un repositorio interno (Rhea, MetaCyc o datos propios) y usar el ranking de EC como propuesta que un curador revisa; el coste de ~12 ms por reacción permite anotar catálogos completos en minutos de CPU.
- Triaje previo a modelos costosos: usar el ensemble como primer filtro para descartar o priorizar reacciones antes de enviarlas a un modelo de grafos o a un transformer de reacciones que requiera GPU.
- Detección de anotaciones inconsistentes: comparar el EC predicho con el EC registrado en la base de datos y marcar discrepancias para revisión; la naturaleza de recuperación por vecinos hace que las reacciones casi duplicadas con EC distinto salgan a la luz con scores muy altos.
- Pre-etiquetado en pipelines de biología sintética y diseño de enzimas: al proponer una ruta metabólica o una enzima candidata, clasificar la reacción objetivo para restringir la búsqueda a familias EC concretas antes de consultar bases de secuencias.
- Extracción estructurada de literatura científica: dado un conjunto de reacciones extraídas de artículos, asignar EC automáticamente para poblar un índice de búsqueda por clase enzimática sin intervención manual.
- Filtrado y control de calidad de datasets de entrenamiento: aplicar el modelo sobre un corpus propio para detectar reacciones con distribuciones EC atípicas o sin clase clara, señalando posibles errores de parseo de SMILES.
- Docencia y prototipado: al ser CPU-only, numpy puro y reentrenable en 45 minutos, sirve como base didáctica para entender fingerprints de reacción, DRFP y clasificación jerárquica sin infraestructura de GPU.
- Integración en herramientas de retrosíntesis: como módulo auxiliar que anota el tipo de enzima implicada en cada paso de una ruta propuesta, siempre que la latencia (milisegundos por reacción) encaje en el bucle interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, exact match en nivel 4, accuracy jerárquica ni comparaciones con otras herramientas de predicción de EC. El único dato de rendimiento es operativo: aproximadamente un minuto para 5.000 reacciones en CPU, lo que equivale a unos 12 ms por reacción.

## Requisitos de hardware

- VRAM: no aplica; el sistema está diseñado para ejecutarse en CPU con numpy, sin requisitos de GPU documentados.
- RAM: no disponible; el repositorio ocupa 0,6 GB y el clasificador es un MLP de tres capas, pero no se especifica el consumo de memoria durante la inferencia por lotes.
- GPU recomendadas: ninguna; no se documenta soporte GPU ni uso de frameworks como PyTorch o TensorFlow.
- Cabe en hardware consumer: sí, cualquier CPU de portátil moderna debería poder ejecutarlo; el cuello de botella es el parseo de SMILES y el cálculo de fingerprints, no el clasificador.
- Opciones de despliegue: scripts Python del propio repositorio (`chem.py`, `features.py`, `mlp.py`, `train.py`). No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y ninguna de ellas aplica a este tipo de modelo.
- Latencia y throughput: ~12 ms por reacción derivados del dato del autor (5.000 reacciones en ~1 minuto); el throughput real dependerá de la longitud de los SMILES y del coste de la búsqueda de vecinos sobre el conjunto de entrenamiento, que no se detalla.
- Reentrenamiento: ~45 minutos en CPU con el Parquet de entrenamiento completo.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada: la model card no menciona alternativas, no aporta métricas y no establece comparaciones con otras herramientas de predicción de números EC. Los resultados de búsqueda web devueltos no contienen información relevante sobre este modelo ni sobre sistemas comparables (se trata de páginas sin relación: M6, el artículo de la letra M y una revisión sobre IA en innovación alimentaria).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-retrieval (v2) | no disponible | no aplica | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de métricas: sin precisión, cobertura ni exact match publicados, no hay forma de estimar la fiabilidad del modelo sin ejecutar una validación propia sobre datos etiquetados.
- Licencia no especificada: no puede asumirse uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Dataset de entrenamiento no documentado ni distribuido: se desconoce el número de reacciones, su procedencia, la cobertura taxonómica y los sesgos hacia clases EC sobrerrepresentadas; el modelo puede tener un rendimiento muy desigual entre familias enzimáticas.
- Dependencia fuerte de los vecinos: el exponente similitud^16 hace que el score esté dominado por reacciones casi idénticas del conjunto de entrenamiento, lo que puede degradar la generalización a reacciones novedosas y favorecer la reproducción de anotaciones erróneas presentes en el corpus.
- Parser de SMILES propio sin RDKit: no se documenta cómo trata estereoquímica, aromaticidad, tautómeros, sales ni errores de sintaxis, lo que introduce un riesgo de parseo silencioso en reacciones complejas.
- Fingerprints de radio 1 y 2: representación local y de corto alcance, con capacidad limitada para capturar patrones mecanísticos globales o diferencias sutiles entre subclases EC próximas.
- Riesgo de alucinación en sentido laxo: el clasificador siempre devuelve un EC con un score, sin umbral de abstención documentado, por lo que puede asignar una clase con confianza aparente a reacciones fuera de distribución.
- Sin soporte de texto natural ni multilingüe: no puede explicar la predicción ni justificar la asignación; la salida es puramente numérica y requiere interpretación externa.
- Madurez y validación comunitaria nulas: cero descargas y cero valoraciones en HuggingFace; el proyecto parece un ejercicio o un trabajo en curso y no una herramienta con mantenimiento demostrado.
- Naturaleza multietiqueta repartida 1/n: la estrategia de reparto entre varios EC registrados puede diluir la señal en reacciones con anotaciones históricamente ambiguas.

## Enlaces

- HuggingFace: https://huggingface.co/m-m-pruthvi-raj/enzyme-retrieval
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
