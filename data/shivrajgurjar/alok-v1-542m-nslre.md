# shivrajgurjar/Alok-v1-542M-NSLRE

## Resumen

Alok v1.0 es un prototipo de investigación de 541,94 millones de parámetros desarrollado por el autor independiente shivrajgurjar, presentado como un motor de razonamiento latente neuro-simbólico (NS-LRE). A diferencia de los modelos de lenguaje autorregresivos convencionales, no genera texto token a token, sino que compila la consulta en inglés a un grafo lógico tipado (ULG), simula transiciones en un espacio latente continuo de 1024 dimensiones, ejecuta búsqueda en árbol (Beam MCTS) sobre capas recurrentes con pesos compartidos y verifica el resultado con un núcleo simbólico determinista de aritmética de intervalos y análisis dimensional.

El modelo se entrena íntegramente desde cero sobre datos procedurales de matemáticas, cálculo, recurrencias dinámicas y leyes físicas dimensionales, sin rastreo web, y afirma almacenar cero trivia de entidades en sus pesos. Su propuesta es separar la compilación de sintaxis del razonamiento simbólico verificado, lo que en teoría permite rechazar afirmaciones ambiguas o dimensionalmente incorrectas en lugar de alucinar.

Es relevante como banco de pruebas de arquitecturas híbridas SSM + Graph-JEPA + MCTS para dominios formales (demostración de teoremas, física dimensional), aunque su alcance es experimental: solo inglés, sin benchmarks estándar publicados y con métricas de validación reportadas exclusivamente por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Neuro-simbólica híbrida: SSM con compuertas byte-latente + Graph Attention (Pilar 1), Graph-JEPA con VICReg (Pilar 2), transformer de grafos recurrente con pesos compartidos y Beam MCTS (Pilar 3), núcleo simbólico determinista (Pilar 4) |
| Parámetros totales | 541.935.101 (541,94 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16; el repo ocupa 1,1 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), cargable con PyTorch |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro pilares. El Pilar 1 (167,34 M de parámetros) es un SSM con compuertas byte-latente más atención de grafos de 4 cabezas que compila inglés a grafos lógicos universales tipados (ULG) y decodifica la prueba de vuelta a inglés mediante una RAM simbólica efímera. El Pilar 2 (264,40 M) es un Graph-JEPA condicionado por acciones con regularización VICReg que proyecta estados ULG a vectores geométricos de 1024 dimensiones, predice transiciones matemáticas y poda ramas muertas mediante una distancia de energía aprendida. El Pilar 3 (110,19 M) es un transformer de grafos recurrente de 4 capas con pesos atados que escala el cómputo en test-time mediante bucles recurrentes, MCTS con haz guiado por el simulador y un mutador de axiomas. El Pilar 4 no tiene parámetros: es un árbitro determinista de intervalos y dimensiones que impone conservación de unidades ([kg, m, s, K, A]) y almacena 98 teoremas descubiertos por self-play en `discovered_axioms.json`.

El entrenamiento se realizó al 100 % desde cero sobre datos procedurales (matemáticas, cálculo, recurrencias dinámicas y leyes físicas dimensionales), sin rastreo web. Según la model card, la etapa 1 alcanzó un 100,00 % de precisión en compilación ULG sobre 153.600 pares sintéticos bilingües (ejecutado en NVIDIA B200) y un 99,95 % en decodificación de pruebas cíclicamente consistente; la etapa 2 (warmup de política de acciones) alcanzó un 100,00 % con LatentStd de 0,734 y sin colapso; la etapa 3 (rechazo de trampas en self-play) bloqueó 100 de 100 trampas algebraicas y dimensionales falsas. No se especifican el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Compilación de consultas en inglés a grafos lógicos tipados (ULG) y decodificación inversa a inglés con consistencia cíclica.
- Razonamiento matemático formal: álgebra lineal, límites infinitos, derivadas simbólicas y recurrencias dinámicas.
- Verificación física dimensional sobre unidades [kg, m, s, K, A].
- Aritmética de intervalos con cotas de encierro para validación determinista de resultados.
- Búsqueda en árbol (Beam MCTS) guiada por un simulador latente para exploración de pasos de prueba.
- Detección de ambigüedad por variables no ligadas y rechazo explícito de consultas ambiguas.
- Descubrimiento de axiomas mediante self-play (98 teoremas almacenados en el banco de axiomas).
- No soporta tool calling, function calling, agentes externos, visión, audio ni modo thinking explícito según la información disponible.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Verificación dimensional en cálculos de ingeniería: el Pilar 4 comprueba la conservación de unidades en expresiones físicas, por lo que puede integrarse como validador previo a pipelines de simulación numérica donde un error de unidades invalida el resultado.
- Asistencia en demostración de teoremas acotados: el bucle recurrente con MCTS y el banco de 98 axiomas permiten explorar pasos de prueba en dominios formales pequeños y devolver una prueba verificada o una negativa explícita.
- Detección de ambigüedad en especificaciones: el compilador ULG marca variables no ligadas, útil para validar la completitud de enunciados matemáticos antes de pasarlos a un solver o a un LLM mayor.
- Enseñanza de cálculo y álgebra con trazabilidad: al separar la prueba verificada de la generación de texto, el modelo puede producir explicaciones en inglés respaldadas por pasos simbólicos comprobables, adecuado para entornos educativos que exigen justificación formal.
- Investigación en arquitecturas neuro-simbólicas: sirve como banco de pruebas reproducible (Apache 2.0, 542 M de parámetros, 1,1 GB) para experimentar con Graph-JEPA, MCTS latente y decodificación especulativa sobre grafos.
- Pruebas de robustez frente a trampas algebraicas: el conjunto de self-play Challenger-Solver puede reutilizarse para evaluar si otros modelos detectan pasos algebraicos falsos, usando Alok como árbitro de referencia.
- Prototipado de verificación de cotas numéricas: la aritmética de intervalos permite acotar resultados de cálculos con incertidumbre, útil en validación de pipelines científicos donde se requiere un rango garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas reportadas por el autor son internas del proceso de entrenamiento y validación:

| Métrica | Resultado | Detalle |
|---|---|---|
| Precisión de compilación ULG (etapa 1) | 100,00 % | 153.600 pares sintéticos bilingües, NVIDIA B200 |
| Decodificación de pruebas cíclicamente consistente (etapa 1) | 99,95 % | Reconstrucción byte-latente con Symbol RAM compartida |
| Warmup de política de acciones (etapa 2) | 100,00 % | LatentStd = 0,734, sin colapso |
| Rechazo de trampas Challenger-Solver (etapa 3) | 100/100 (100 %) | Trampas algebraicas y dimensionales falsas |
| Banco de axiomas descubiertos por self-play | 98 teoremas | Almacenados en discovered_axioms.json |
| Suite de tortura de 6 dominios con entidades no vistas | 6/6 (100,0 %) | Álgebra lineal, límites infinitos, derivadas simbólicas, leyes físicas y rechazo de ambigüedad |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en bfloat16 para los pesos del modelo; el sistema completo con Symbol RAM y banco de axiomas añade una sobrecarga pequeña (el Pilar 4 ocupa menos de 1 MB).
- GPU recomendadas: cualquier GPU con soporte bfloat16, incluida RTX 4090; el entrenamiento se ejecutó en NVIDIA B200 según la model card.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM efectiva; también puede ejecutarse en CPU en float32.
- Opciones de despliegue: el modelo se carga con PyTorch y safetensors mediante `AlokSystem` y `AlokInferenceEngine` del paquete `alok_src` incluido en el repo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (motores neuro-simbólicos de razonamiento latente con MCTS y verificación simbólica de este tamaño). Como referencia de escala, el modelo se sitúa en el rango de 500 M de parámetros, pero su arquitectura no autorregresiva y su dominio restringido a matemáticas y física lo hacen no comparable directamente con LLMs generalistas del mismo tamaño.

## Limitaciones y advertencias

- Ámbito restringido: entrenado solo con datos procedurales de matemáticas y física; no es un modelo de propósito general ni responde a conocimiento factual del mundo.
- Idioma: únicamente inglés; no hay soporte multilingüe documentado.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar su uso en conversaciones largas.
- Ausencia de benchmarks estándar: todas las métricas son internas y reportadas por el autor, sin evaluación independiente; los porcentajes del 100 % deben interpretarse como resultados sobre conjuntos sintéticos propios.
- Riesgo de sobreajuste al dominio sintético: el rendimiento sobre entidades no vistas se limita a 6 dominios declarados; el comportamiento fuera de ellos es desconocido.
- Alucinación: el diseño busca mitigarla mediante verificación simbólica, pero la decodificación a inglés del Pilar 1 podría introducir imprecisiones no cubiertas por el núcleo determinista.
- Licencia Apache 2.0: permite uso comercial, pero al ser un prototipo de investigación sin validación externa, no se recomienda su uso en producción sin evaluación previa.
- Sin soporte de tool calling ni integración con frameworks de agentes estándar; el despliegue requiere cargar el paquete `alok_src` del propio repo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivrajgurjar/Alok-v1-542M-NSLRE
- Demo en vivo (Space): https://huggingface.co/spaces/shivrajgurjar/Alok-v1-Showcase
