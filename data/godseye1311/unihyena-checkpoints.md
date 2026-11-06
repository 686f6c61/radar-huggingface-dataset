# Godseye1311/UniHyena-checkpoints

## Resumen

UniHyena-checkpoints es un repositorio de pesos publicado en HuggingFace por el usuario Godseye1311 bajo la licencia `fair-chemistry-license` y con acceso restringido (gated). Por las etiquetas asociadas (`chemistry`, `interatomic-potential`, `fairchem`, `uma`, `allscaip`) se trata de checkpoints orientados a potenciales interatómicos, es decir, modelos de aprendizaje automático que predicen energías y fuerzas de sistemas moleculares y materiales, en la línea de la familia UMA (Universal Model for Atoms) de FAIR-Chem / Meta. No es un modelo de lenguaje generativo, sino un modelo de química computacional.

El repositorio ocupa 7,0 GB y contiene varios checkpoints, lo que sugiere una colección de variantes de un mismo modelo (posiblemente distintos tamaños, tareas o etapas de entrenamiento) más que un único conjunto de pesos. La información pública disponible es muy limitada: no se declaran parámetros, contexto, idiomas ni pipeline, y no se han publicado resultados de benchmarks en la ficha de HuggingFace.

La relevancia de este tipo de modelos radica en su uso como potencial interatómico universal para simulaciones de dinámica molecular y cribado de materiales, un área donde los modelos basados en grafos o en arquitecturas equivariantes están sustituyendo progresivamente a los potenciales empíricos clásicos. La combinación de etiquetas `uma` y `fairchem` apunta a una integración con el ecosistema FAIR-Chem, aunque no se confirma en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas sugieren potencial interatómico tipo UMA/FAIR-Chem; "Hyena" en el nombre podría aludir a una arquitectura con atención de largo alcance, no confirmado) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el "contexto" sería el tamaño máximo del sistema atómico, no declarado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | fair-chemistry-license (acceso gated, requiere aceptación de condiciones) |
| Formato de pesos | no disponible (repo de 7,0 GB; probablemente checkpoints PyTorch, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. Las etiquetas `fairchem` y `uma` lo sitúan en la familia de potenciales interatómicos universales de FAIR-Chem, que habitualmente emplean grafos de átomos con message passing o mecanismos de atención equivariantes para predecir energía total, fuerzas por átomo y, en algunas variantes, tensiones. El sufijo "UniHyena" en el nombre del repositorio podría indicar una variante con mecanismos de atención de largo alcance inspirados en Hyena, pero esto es una inferencia a partir del nombre y no está confirmado por la documentación.

Tampoco se detallan los datos de entrenamiento: no se indica el número de estructuras, la composición del dataset (moléculas, cristales, superficies, catalizadores), ni si se emplearon etapas de ajuste fino supervisado o aprendizaje por refuerzo. No hay información sobre innovaciones técnicas como decodificación especulativa (no aplicable) o atención lineal.

## Capacidades

- Predicción de energía y fuerzas de sistemas atómicos (potencial interatómico), según las etiquetas del repositorio.
- Integración potencial con el ecosistema FAIR-Chem para simulación y entrenamiento, no confirmada en la documentación.
- Soporte multiespecie (química general) presumible por la etiqueta `allscaip`, no verificado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplica).

## Casos de uso

- Dinámica molecular acelerada: usar el checkpoint como potencial interatómico para integrar trayectorias sin evaluar la energía cuántica en cada paso, reduciendo el coste computacional frente a DFT. Apropiado si el modelo cubre la composición química del sistema de interés.
- Cribado de materiales: predecir energías de formación o estabilidad relativa de candidatos en un pipeline de alto rendimiento, filtrando estructuras antes de validación con métodos de primer principio.
- Relajación de estructuras: optimizar geometrías moleculares o cristalinas minimizando la energía predicha por el modelo.
- Cálculo de propiedades vibracionales: derivar matrices de fuerzas o frecuencias a partir de las fuerzas predichas, útil para análisis de estabilidad dinámica.
- Estudio de superficies y catálisis: evaluar energías de adsorción de adsorbatos sobre superficies metálicas u óxidos, si el entrenamiento cubrió ese dominio.
- Ajuste fino sobre datos propios: emplear los checkpoints como inicialización para especializar el potencial en una familia química concreta con un conjunto reducido de cálculos DFT.
- Simulación de materiales bajo condiciones extremas: explorar fases o configuraciones con dinámica molecular a temperatura finita usando el potencial como evaluador de fuerzas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño real de cada checkpoint dentro del repo de 7,0 GB. Como referencia, un checkpoint de 7 GB en fp32 ocupa aproximadamente esa cifra en memoria, y en fp16 rondaría 3,5 GB, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Para potenciales interatómicos de tamaño medio suele bastar una GPU con 8-16 GB (RTX 3080/4080, A10), pero no hay datos del modelo que lo confirmen.
- Cabe en GPU de consumo: probablemente sí si el checkpoint individual es de pocos cientos de millones de parámetros, pero no verificado.
- Opciones de despliegue: no documentadas; el ecosistema FAIR-Chem suele usar PyTorch y ASE para integración con simuladores. No se confirma soporte de vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniHyena-checkpoints | Potencial interatómico (presunto) | no disponible | no disponible | fair-chemistry-license (gated) | HuggingFace, acceso restringido |
| UMA (FAIR-Chem) | Potencial interatómico universal | no disponible en esta ficha | no aplica | no disponible | Repositorio FAIR-Chem |
| MACE | Potencial interatómico equivariante | no disponible en esta ficha | no aplica | MIT (versión open source) | GitHub / HuggingFace |
| CHGNet | Potencial interatómico con grafos | no disponible en esta ficha | no aplica | MIT | GitHub / HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar la licencia `fair-chemistry-license` en HuggingFace antes de descargar los pesos.
- Licencia no estándar: la `fair-chemistry-license` no es una licencia open source reconocida por la OSI; conviene revisar sus términos antes de cualquier uso comercial o redistribución.
- Información técnica ausente: no se declaran parámetros, arquitectura, datos de entrenamiento ni benchmarks, lo que impide evaluar su idoneidad con rigor.
- Riesgo de extrapolación: como todo potencial interatómico entrenado con datos finitos, puede fallar fuera de la distribución química y de las condiciones (temperatura, presión) cubiertas en el entrenamiento.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y fue creado y actualizado en la misma fecha, sin historial de uso que permita validar su calidad.
- No es un modelo de lenguaje: no debe emplearse para tareas de NLP, generación de texto ni razonamiento simbólico.
- Posible ambigüedad de nombre: "UniHyena" podría inducir a confusión con modelos de lenguaje basados en Hyena; la ficha de HuggingFace no aclara la arquitectura.

## Enlaces

- HuggingFace: https://huggingface.co/Godseye1311/UniHyena-checkpoints
- FAIR-Chem (ecosistema referenciado por las etiquetas): https://github.com/facebookresearch/fairchem
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo concreto.
