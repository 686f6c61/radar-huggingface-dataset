# prakhya15/AGeDi-WS2-Unconditional

## Resumen

AGeDi-WS2-Unconditional es un modelo de difusión atomística incondicional para la generación de estructuras con defectos en disulfuro de tungsteno (WS₂) bidimensional. Lo publica el usuario prakhya15 en Hugging Face y se apoya en AGeDi, un framework de difusión para generación atomística, con una red de puntuación (score model) basada en PaiNN. El modelo aprende conjuntamente las posiciones atómicas y las especies químicas dentro de una región de defecto, mientras mantiene fija la red huésped de WS₂ prístina durante el muestreo. Es, según su propia model card, la línea base incondicional de la fase 2 de un proyecto de investigación mayor cuyo objetivo es la generación controlada de defectos cargados en WS₂ condicionada por energía de formación, estado de carga y tipo de defecto.

El interés práctico del modelo reside en el ámbito de la ciencia de materiales computacional: permite proponer configuraciones de defectos candidatas sin necesidad de muestrear exhaustivamente el espacio de configuraciones mediante métodos de primeros principios, lo que puede servir como etapa de generación previa a un cribado con DFT. El conjunto de entrenamiento consta de 1.706 estructuras 2D de defectos en WS₂, con regiones de defecto de tamaño variable y una máscara de radio fijo de 2,5 Å alrededor de los sitios identificados.

Se trata de un artefacto de investigación con visibilidad prácticamente nula: cero descargas y cero likes en el momento de la consulta, repositorio de 0,0 GB reportados, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. No es un modelo de lenguaje y, por tanto, no admite comparación directa con LLM en parámetros, contexto o cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión atomística sobre red de puntuación PaiNN (framework AGeDi) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo generativo atomístico, no secuencial) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no lo especifica; tamaño reportado de 0,0 GB) |

Parámetros específicos de la arquitectura, según la model card:

| Componente | Configuración |
|---|---|
| Framework | AGeDi |
| Representación | PaiNN |
| Base atómica (feature size) | 64 |
| Bloques de interacción | 4 |
| Funciones de base radial | 30 |
| Cutoff | 6,0 Å |
| Ruido de posiciones | ConfinedCellPositions |
| Ruido de tipo atómico | Types |
| Clases de tipo atómico | 27 |
| Predicción de posiciones | Score |
| Muestreador inverso | Euler-Maruyama |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusión generativa aplicado a estructuras atomísticas. La red de puntuación es una PaiNN (Polarizable Atomistic Interaction Neural Network) con base atómica de 64 dimensiones, 4 bloques de interacción y 30 funciones de base radial, con un cutoff de 6,0 Å para el grafo de vecindad. El proceso de difusión incorpora dos ruidosadores independientes: ConfinedCellPositions para las posiciones atómicas y Types para las especies químicas, sobre un espacio de 27 clases de tipo atómico. La generación inversa se realiza con un muestreador Euler-Maruyama. El modelo aprende simultáneamente las posiciones y las especies dentro de la región de defecto, manteniendo congelada la red huésped de WS₂ prístina a lo largo del muestreo, lo que restringe la generación al subespacio de configuraciones de defecto sobre una matriz fija.

El entrenamiento se realizó durante 1.000 épocas sobre una NVIDIA A100 de 80 GB, con tamaño de lote 8, tasa de aprendizaje 1e-4, weight decay 0, cutoff de 6,0 Å, feature size 64 y 4 bloques PaiNN. El conjunto de datos de la fase 2 contiene 1.706 estructuras 2D de defectos en WS₂, con 418 etiquetas de defecto únicas (366 de dos componentes y 52 de un solo componente), tamaños de región de defecto variables y estructuras con defectos cargados presentes en el dataset de origen. La estrategia de enmascaramiento de producción emplea un radio de 2,5 Å alrededor de los sitios de defecto identificados. La partición de datos fue de 1.365 estructuras de entrenamiento, 170 de validación y 171 de test reservadas por completo fuera de la trayectoria de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo por otro lado esperable en un modelo de esta naturaleza.

## Capacidades

- Generación incondicional de estructuras atómicas con defectos sobre una red huésped de WS₂ prístina fija.
- Predicción conjunta de posiciones atómicas y especies químicas dentro de la región de defecto (27 clases de tipo atómico).
- Generación de configuraciones con regiones de defecto de tamaño variable, enmascaradas con un radio de 2,5 Å alrededor del sitio de defecto.
- Modelado de estructuras de defectos de uno y dos componentes, dados los 52 y 366 tipos de etiquetas presentes en el dataset.
- Generación de configuraciones de defectos cargados, dado que el dataset de origen incluye estructuras cargadas, aunque este checkpoint no condiciona explícitamente sobre el estado de carga.
- Muestreo estocástico mediante Euler-Maruyama, lo que permite obtener múltiples realizaciones distintas para un mismo contexto de máscara.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje ni un agente).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidad especial prevista (no implementada en este checkpoint): generación condicionada por energía de formación, estado de carga y tipo de defecto mediante classifier-free guidance, planificada como etapa posterior del proyecto.

## Casos de uso

- Cribado previo a DFT de configuraciones de defectos en WS₂: el modelo genera conjuntos de configuraciones candidatas con posiciones y especies resueltas sobre una matriz fija, que después se pueden relajar y evaluar energéticamente con DFT, reduciendo el espacio de búsqueda frente a un muestreo aleatorio.
- Aumento de datos para entrenar clasificadores o regresores de defectos: las 1.365 estructuras de entrenamiento originales pueden ampliarse sintéticamente con nuevas realizaciones generadas bajo la misma máscara, útil para modelos de predicción de energía de formación cuando hay escasez de datos etiquetados.
- Estudio de estabilidad y geometría de vacantes y antisitios: dado que las etiquetas del dataset incluyen 52 defectos de un solo componente, el modelo puede emplearse para explorar relajaciones locales de configuraciones puntuales antes de una optimización geométrica costosa.
- Exploración de complejos de defectos multicomponente: con 366 etiquetas de dos componentes en el dataset, el modelo resulta adecuado para generar hipótesis de agrupaciones de defectos (por ejemplo, pares vacante-impureza) cuya combinatoria es elevada.
- Generación de estructuras de partida para simulación multiescala: las configuraciones generadas pueden alimentar cálculos de dinámica molecular o de estructura electrónica como estructuras iniciales en lugar de geometrías construidas manualmente.
- Estudio de materiales 2D para aplicaciones funcionales: el WS₂ monolámina es relevante en catálisis, espintrónica y optoelectrónica, y la capacidad de proponer configuraciones de defecto es útil para explorar cómo estos modifican propiedades locales, siempre que las estructuras se validen después con métodos físicos.
- Línea base para desarrollo de generación condicionada: este checkpoint, declarado explícitamente como baseline incondicional de la fase 2, sirve como punto de partida y referencia de comparación para las fases posteriores con classifier-free guidance sobre energía de formación, carga y tipo de defecto.
- Integración en flujos de trabajo de descubrimiento de materiales in silico: al ser un componente generativo dentro del ecosistema AGeDi, puede insertarse en pipelines automatizados de generación, filtrado por validez física y evaluación con potenciales interatómicos o DFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se proporcionan métricas de evaluación (error de posiciones, tasa de validez estructural, coincidencia con estructuras de test, energías tras relajación) ni comparaciones cuantitativas con otros modelos generativos atomísticos, pese a que la model card menciona el uso de 171 estructuras de test reservadas para la evaluación de la fase 2.

## Requisitos de hardware

- Entrenamiento: una NVIDIA A100 de 80 GB, con tamaño de lote 8 y 1.000 épocas, según la model card.
- VRAM para inferencia: no disponible de forma explícita. Como referencia orientativa, la configuración descrita (PaiNN con feature size 64, 4 bloques y 30 funciones de base radial) corresponde a una red de pequeña escala, de modo que la inferencia sería previsiblemente muy ligera comparada con un LLM; no obstante, no se dispone de la cifra de parámetros ni de la medida de VRAM en inferencia, por lo que cualquier estimación numérica sería especulativa.
- GPU recomendadas: para entrenamiento, A100 80 GB (dato confirmado). Para inferencia, no disponible; por escala del modelo, es probable que quepa en GPU de consumo, pero esto no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio reporta 0,0 GB de tamaño, lo que sugiere un checkpoint pequeño, pero es un dato indirecto.
- Opciones de despliegue: el modelo requiere la librería AGeDi (library_name: agedi). No aplican servidores de inferencia para LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje ni un transformer autorregresivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos en la información proporcionada para establecer una comparativa con parámetros, contexto, rendimiento o licencia frente a alternativas. Cualitativamente, los modelos de la misma categoría (generación atomística para materiales cristalinos y 2D) incluyen propuestas como MatterGen, DiffCSP, CDVAE y las variantes base del propio framework AGeDi, pero no se han aportado métricas de ninguno de ellos en esta ficha.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGeDi-WS2-Unconditional | no disponible | no aplica | sin benchmarks publicados | no disponible | Hugging Face (0 descargas) |
| MatterGen | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |
| DiffCSP | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |
| CDVAE | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, el uso comercial y la redistribución quedan en una situación de incertidumbre legal; conviene contactar con el autor antes de cualquier uso en producción.
- Modelo específico de un único sistema: solo genera defectos sobre WS₂ 2D con red huésped prístina fija; no puede generar nuevas redes huésped ni otros materiales.
- Ámbito restringido a la región de defecto: el huésped permanece congelado, de modo que la generación se limita al subespacio enmascarado (radio de 2,5 Å en la estrategia de producción).
- Checkpoint incondicional: no acepta condicionamiento por energía de formación, estado de carga ni tipo de defecto; esas capacidades corresponden a fases posteriores del proyecto y no están disponibles aquí.
- Riesgo de estructuras físicamente inválidas: como todo modelo generativo atomístico, puede producir configuraciones con solapamientos atómicos, distancias de enlace improbables o combinaciones de especies poco realistas; toda salida debe validarse con potenciales interatómicos o DFT antes de extraer conclusiones.
- Cutoff limitado de 6,0 Å: las interacciones más allá de esa distancia no se modelan directamente en el grafo, lo que puede afectar a la coherencia de fenómenos de largo alcance.
- Volumen de datos reducido: 1.365 estructuras de entrenamiento y 418 etiquetas de defecto distintas implican una cobertura desigual del espacio de configuraciones; los tipos de defecto poco representados tendrán un rendimiento previsiblemente peor.
- Evaluación no publicada: no hay métricas, curvas de aprendizaje ni resultados sobre las 171 estructuras de test, por lo que no es posible juzgar la calidad del modelo a partir de la información disponible.
- Artefacto de investigación con adopción nula: 0 descargas y 0 likes, repositorio sin licencia ni pipeline declarado y una única persona como autora; se recomienda tratarlo como material experimental, no como componente de producción.
- Idiomas y sesgos lingüísticos: no aplica, ya que no es un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prakhya15/AGeDi-WS2-Unconditional

No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
