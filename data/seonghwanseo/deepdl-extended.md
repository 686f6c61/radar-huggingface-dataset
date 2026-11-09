# SeonghwanSeo/deepdl-extended

## Resumen

DeepDL-extended es un modelo de predicción de drug-likeness (similitud a fármaco) desarrollado por SeonghwanSeo, entrenado sobre un dataset de fármacos actualizado que excluye el conjunto de test de moléculas aprobadas por la FDA. No es un modelo de lenguaje: es un clasificador de secuencias SMILES que evalúa si una molécula presenta propiedades compatibles con un fármaco comercializable. Se distribuye a través de la librería `druglikeness`, una librería específica del autor, y no como un transformer convencional.

Arquitectura y escala son modestas: una GRU de 4 capas con tamaño oculto de 1024, vocabulario de 67 caracteres y 25,33 millones de parámetros en precisión float32 (fichero de pesos de aproximadamente 101,3 MB). El repositorio ocupa 0,1 GB y se publicó en noviembre de 2026. La información pública es muy limitada: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks en la model card más allá de la referencia al README del repositorio GitHub del proyecto.

Su relevancia es de nicho: sirve como componente de filtrado en pipelines de descubrimiento de fármacos y generación molecular, donde se necesita puntuar rápidamente grandes lotes de SMILES. No compite con modelos generativos de química, sino que actúa como evaluador binario o probabilístico de drug-likeness dentro de un flujo más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 4 capas (red neuronal recurrente) |
| Parametros totales | 25.328.707 (25,33 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias SMILES; longitud máxima no documentada) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no aplica: entrada en SMILES) |
| Licencia | no disponible |
| Formato de pesos | `model.pth` (state dict de PyTorch) + `config.json` |
| Tamano oculto | 1024 |
| Vocabulario | 67 caracteres |
| Precision | float32 |
| Tamano del fichero de pesos | ~101,3 MB (96,6 MiB) |
| Libreria | `druglikeness` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una red recurrente de tipo GRU con 4 capas apiladas y estado oculto de 1024 dimensiones, que procesa secuencias de caracteres SMILES con un vocabulario de 67 símbolos. La salida se emplea para la tarea de drug-likeness, presumiblemente como clasificación binaria o puntuación probabilística, aunque la model card no detalla la cabeza de salida ni la función de pérdida. Los pesos se distribuyen como state dict de PyTorch (`model.pth`) junto con un `config.json` que describe la arquitectura.

El entrenamiento se realizó sobre un dataset de fármacos actualizado, excluyendo explícitamente el conjunto de test compuesto por moléculas aprobadas por la FDA, lo que evita fuga de datos en la evaluación. No se especifican en la información disponible el número de tokens o moléculas de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino, RLHF o DPO (poco probables en un modelo de esta naturaleza). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal; la arquitectura es una GRU estándar.

## Capacidades

- Clasificación de drug-likeness a partir de cadenas SMILES.
- Procesamiento de secuencias de caracteres con vocabulario cerrado de 67 símbolos.
- Puntuación por molécula individual; el uso por lotes dependerá de la implementación de la librería `druglikeness`.
- Integración en pipelines de quimioinformática como filtro previo o posterior a generación molecular.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multilingüe ni generativo de texto: su entrada es SMILES, no lenguaje natural.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtrado en generación molecular: puntuar lotes de SMILES generados por modelos generativos (VAE, diffusion, LLM químicos) para descartar moléculas con baja probabilidad de ser fármacos antes de pasar a simulaciones más costosas.
- Cribado virtual inicial: priorizar bibliotecas comerciales de compuestos según su score de drug-likeness, reduciendo el número de candidatos que llegan a docking molecular o simulaciones de dinámica molecular.
- Enriquecimiento de datasets: etiquetar grandes conjuntos de moléculas con una puntuación de drug-likeness para entrenar o validar otros modelos posteriores.
- Control de calidad en quimioinformática: detectar SMILES anómalos o estructuras con baja plausibilidad farmacológica en bases de datos internas.
- Investigación académica en drug discovery: comparar el modelo con reglas heurísticas clásicas (Lipinski, QED) en estudios de evaluación de filtros de drug-likeness, dado su bajo coste computacional.
- Despliegue en CPU: al ser una GRU de 25 M de parámetros en float32, puede ejecutarse en CPU para servicios de scoring de baja latencia sin necesidad de GPU, integrándose en APIs internas de química computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al README del repositorio GitHub del proyecto (`drug-likeness`) para consultar descripciones y resultados de evaluación, pero dichos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (25,33 M de parámetros, ~101,3 MB de pesos más estados intermedios de la GRU).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. Una GTX 1650, RTX 3050 o superior es más que suficiente.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problemas de rendimiento para lotes moderados.
- Opciones de despliegue: al usar la librería `druglikeness` y pesos en `model.pth`, el despliegue pasa por PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por la arquitectura (GRU de 4 capas, 25 M de parámetros) se espera un coste por molécula muy bajo en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepDL-extended | GRU 4 capas, hidden 1024 | 25,33 M | no disponible | Drug-likeness desde SMILES | no disponible | Hugging Face (`SeonghwanSeo/deepdl-extended`) |
| Modelos basados en reglas (Lipinski, QED) | Heurísticas | 0 | no aplica | Drug-likeness | variable | Implementaciones abiertas (RDKit) |
| Clasificadores SMILES con transformer | Transformer encoder | variable (10-100 M típico) | variable | Drug-likeness / propiedades | variable | Hugging Face, GitHub |

No se dispone de información suficiente para establecer comparaciones cuantitativas de rendimiento con alternativas concretas; los datos de benchmarks del modelo no están publicados en la información disponible.

## Limitaciones y advertencias

- Información pública muy escasa: sin licencia declarada, sin idiomas, sin pipeline y sin benchmarks publicados en la model card.
- Licencia no disponible: no puede asumirse uso comercial sin consultar el repositorio GitHub del autor.
- Modelo de nicho: solo procesa SMILES y predice drug-likeness; no es un modelo de lenguaje general ni generativo.
- El dataset de entrenamiento excluye el test de moléculas aprobadas por la FDA, lo que reduce el riesgo de fuga de datos, pero no se documenta la composición completa ni el tamaño del dataset.
- Riesgo de sesgo hacia el espacio químico representado en el dataset de entrenamiento; moléculas atípicas (macrociclos, compuestos organometálicos, péptidos grandes) pueden puntuarse de forma poco fiable.
- Longitud máxima de secuencia SMILES no documentada: moléculas muy grandes podrían truncarse o comportarse de forma impredecible.
- Sin soporte documentado para cuantización ni para runtimes de inferencia optimizados; el despliegue depende de PyTorch y de la librería `druglikeness`.
- No debe usarse como sustituto de evaluación experimental ni de modelos de toxicidad, ADME o docking; es un filtro heurístico aprendido, no una validación farmacológica.

## Enlaces

- Hugging Face: https://huggingface.co/SeonghwanSeo/deepdl-extended
- Repositorio GitHub del proyecto (referenciado en la model card): https://github.com/SeonghwanSeo/drug-likeness/blob/main/README.md
- Repositorio GitHub raíz: https://github.com/SeonghwanSeo/drug-likeness
