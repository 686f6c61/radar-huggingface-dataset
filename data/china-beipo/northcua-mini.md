# china-beipo/NorthCUA-Mini

## Resumen

NorthCUA-Mini es un modelo de tipo *computer-use* (agente que opera interfaces gráficas) de 35.107 millones de parámetros totales y 3.000 millones de parámetros activos, construido sobre la arquitectura Qwen3.5 en configuración de mezcla de expertos (MoE). Lo desarrolla el colectivo china-beipo y forma parte de una familia de tres modelos —Nano (9B denso), Mini (35B MoE) y Pro (397B MoE)— publicada bajo licencia Apache 2.0. El modelo recibe peticiones del usuario, capturas de pantalla e historial de interacción, y genera razonamiento, respuestas y llamadas a herramientas para un entorno de escritorio o navegador.

El problema que aborda es la automatización de tareas sobre software real: el modelo no solo describe lo que ve en una pantalla, sino que produce acciones ejecutables (clics, escritura, navegación) en un espacio de coordenadas normalizado de 0 a 1000, que el arnés oficial convierte a píxeles en tiempo de ejecución. Su relevancia actual reside en que combina *grounding* visual, razonamiento multi-paso y verificación de resultados en un único modelo de pesos abiertos, un perfil que hasta hace poco estaba dominado por modelos propietarios.

La información pública disponible es la model card del autor y el informe técnico citado en ella. No se detallan la longitud de contexto, los idiomas soportados ni la composición exacta del dataset de entrenamiento, por lo que esos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Qwen3.5 |
| Parámetros totales | 35.107.181.936 (35B) |
| Parámetros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | image-text-to-text (multimodal) |
| Tamaño del repositorio | 70,2 GB |
| Coordenadas de acción | espacio normalizado 0–1000 (`normalized_1000`) |

## Arquitectura y entrenamiento

NorthCUA-Mini es un transformer de mezcla de expertos con 35B parámetros totales y 3B activos por token, lo que implica que la memoria necesaria para cargar los pesos completos es la de un modelo de 35B mientras que el coste computacional por token se aproxima al de un modelo de 3B. El autor indica que está construido sobre Qwen3.5, aunque no se especifican el número de expertos, el tamaño de cada uno ni la política de enrutamiento.

El entrenamiento se organiza en dos fases descritas en el informe técnico: un ajuste supervisado (SFT) que dota al modelo de *grounding* visual —localización de elementos en pantalla— y una fase posterior de aprendizaje por refuerzo conjunto sobre entornos de escritorio y web, orientada a la finalización de tareas. El autor denomina a este esquema "experience loop", compuesto por el arnés de ejecución, un ciclo de experiencia acumulada y un aprendizaje por etapas. No se publican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- *Grounding* visual sobre capturas de pantalla de aplicaciones de escritorio y flujos web.
- Generación de acciones GUI en coordenadas normalizadas 0–1000, convertidas a píxeles por el arnés.
- Razonamiento multi-paso con historial de interacción para tareas dependientes de estados anteriores.
- Llamadas a herramientas (*tool calling*) integradas en el bucle del arnés oficial.
- Verificación de resultados intermedios y finales dentro de trayectorias largas.
- Procesamiento conjunto de texto e imagen (pipeline image-text-to-text).
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- **Automatización de tareas de escritorio repetitivas**: el modelo recibe capturas del escritorio y el historial de acciones para completar flujos como renombrar ficheros, mover documentos o rellenar formularios en aplicaciones nativas, aprovechando su *grounding* de 87,94 % en OSWorld-G.
- **Agentes de navegación web**: con 70,43 % de éxito en WebArena-Verified, puede ejecutar tareas de varios pasos en sitios reales (búsqueda, compra, consulta de datos) dentro del límite de 100 pasos del protocolo de evaluación.
- **Pruebas de regresión de interfaces**: el modelo puede actuar como usuario sintético que recorre una aplicación y verifica que los elementos esperados están presentes y son accionables, útil en pipelines de QA.
- **Extracción de datos de aplicaciones sin API**: cuando un sistema legado solo expone interfaz gráfica, el modelo puede leer la pantalla y transcribir la información mediante acciones controladas.
- **Asistencia a operadores en soporte técnico**: dado un historial de interacción y capturas del problema del usuario, el modelo genera pasos de resolución y llamadas a herramientas del arnés para ejecutarlos.
- **Automatización de back-office con verificación**: la fase de RL del modelo está orientada a comprobar el resultado de cada tarea, lo que encaja en procesos donde no basta con ejecutar la acción sino confirmar su efecto (por ejemplo, validar que un registro se guardó).
- **Generación de trayectorias sintéticas para entrenamiento**: sus salidas de razonamiento y acción pueden registrarse como datos de entrenamiento para modelos más pequeños de la misma familia.

## Benchmarks y rendimiento

Resultados del informe técnico del autor. El propio autor advierte que corresponden a checkpoints de investigación y no a una medición exacta de los ficheros de este repositorio.

| Benchmark | Métrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · precisión (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · precisión (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · éxito (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · éxito (%) | 67,16 | 70,43 | 73,89 |

Comparación SFT frente a RL del mismo modelo:

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|---|---|---|---|---|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |
| Mini | 83,29 | 85,30 | 67,98 | 70,43 |
| Pro | 85,87 | 88,64 | 69,58 | 73,89 |

Condiciones de evaluación declaradas: ScreenSpot-Pro con 1.581 ejemplos y una predicción por captura sin búsqueda iterativa de zoom; OSWorld-G con 564 instrucciones refinadas y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida); OSWorld-Verified con 361 tareas y WebArena-Verified con 812 tareas, ambas con límite de 100 pasos. El informe también cita un 66,80 % de crédito parcial medio para Pro en OSWorld 2.0 (108 tareas, límite de 500 pasos), sin resultados de Mini en esa tabla.

## Requisitos de hardware

- **VRAM para pesos completos**: 70,2 GB en safetensors, lo que exige al menos 80 GB de VRAM en precisión original; una GPU A100 de 80 GB o H100 de 80 GB es el mínimo práctico para cargar el modelo sin cuantizar.
- **Cuantización**: no se publican recetas oficiales de cuantización. Al ser un MoE de 35B con 3B activos, una cuantización a 4 bits reduciría el peso a unos 18–20 GB, lo que permitiría ejecución en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) siempre que el runtime soporte el enrutamiento de expertos.
- **GPU recomendadas**: H100 o A100 80 GB para despliegue en producción; RTX 4090 para pruebas con cuantización.
- **Opciones de despliegue**: transformers como librería de referencia; vLLM y TGI son candidatos naturales para servir el modelo, aunque no se confirman en la documentación. llama.cpp y Ollama no están verificados para esta arquitectura en la información disponible.
- **Latencia y throughput**: no disponibles.
- **Dependencia obligatoria**: el uso previsto requiere el NorthCUA Harness oficial, que gestiona prompts, llamadas a herramientas y ejecución de acciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | OSWorld-Verified | Licencia |
|---|---|---|---|---|
| NorthCUA-Mini | 35B / 3B | no disponible | 85,30 % | Apache 2.0 |
| NorthCUA-Nano | 9B / 9B (denso) | no disponible | 78,90 % | Apache 2.0 |
| NorthCUA-Pro | 397B / 17B | no disponible | 88,64 % | Apache 2.0 |

La comparación con modelos de otros desarrolladores (por ejemplo, agentes de *computer use* propietarios o de pesos abiertos de tamaño similar) no está disponible en la información proporcionada. Dentro de la propia familia, Mini ofrece un equilibrio entre el coste de Nano y la precisión de Pro: gana 6,4 puntos de éxito en OSWorld-Verified respecto a Nano y cede 3,3 puntos frente a Pro, con un coste de memoria muy inferior al de este último.

## Limitaciones y advertencias

- **Dependencia del arnés**: el modelo está diseñado para funcionar con el NorthCUA Harness; usarlo con otro runtime puede romper el contrato de coordenadas y las llamadas a herramientas.
- **Contrato de coordenadas estricto**: todas las acciones deben expresarse en el espacio normalizado 0–1000; mezclar píxeles y coordenadas normalizadas produce fallos silenciosos.
- **Resultados no verificados en este repositorio**: el autor advierte que las cifras de benchmarks provienen de checkpoints de investigación y no de los ficheros publicados.
- **Riesgo de alucinación**: no se documentan tasas de alucinación ni evaluaciones de fiabilidad fuera de los benchmarks de tareas.
- **Sesgos**: no se publica ninguna evaluación de sesgos ni de comportamiento en dominios sensibles.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés sin pruebas propias.
- **Contexto**: la longitud de contexto no está documentada, lo que complica el dimensionamiento de memoria en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar el fichero LICENSE del repositorio.
- **Madurez**: el repositorio registra 0 descargas y 2 *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/china-beipo/NorthCUA-Mini
- Página del proyecto: https://beipo.top/blog/northcua/
- Arnés oficial (GitHub): https://github.com/china-qijizhifeng/NorthCUA-Harness
- Familia de modelos: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Modelo Nano: https://huggingface.co/beipo-ai/NorthCUA-Nano
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Mini/blob/main/LICENSE
