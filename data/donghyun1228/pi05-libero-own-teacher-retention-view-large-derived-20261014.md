# Donghyun1228/pi05-libero-own-teacher-retention-view-large-derived-20261014

## Resumen

Este repositorio contiene un checkpoint diagnostico derivado de la familia pi0.5, distribuido a traves de la biblioteca openpi. No es un modelo entrenado desde cero ni un ajuste fino convencional: el autor lo describe como un compuesto de piezas procedentes de dos origenes distintos (el padre denominado "retention" y una fuente heredada verificada) con cero actualizaciones de entrenamiento nuevas. En concreto, vision23 proviene del padre, mientras que LLM9, action expert11, projection8 y el clon de vision para la muneca (wrist23) provienen de la fuente heredada verificada.

El modelo pertenece a la categoria de politicas VLA (vision-language-action) para robotica: recibe observaciones visuales e instrucciones y produce acciones motrices. Su interes es metodologico mas que de rendimiento, ya que sirve para auditar la procedencia de pesos a nivel de tensor (74 hojas en BF16 con hashes individuales registrados) y para evaluar de forma controlada el efecto de un "teacher" condicional sobre el benchmark LIBERO, con un protocolo fijado (view_large, 40 tareas x 10 episodios, semilla 17, MuJoCo 3.2.3, 8 clientes por GPU).

El repositorio ocupa 5,9 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha. El propio autor advierte de que se trata de una intervencion sobre el endpoint de evaluacion, no de un metodo de retencion nuevo ni de un aislamiento causal del congelado del LLM, y que los resultados de evaluacion no se usaron para ajustar el teacher ni para seleccionar el coeficiente de perdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compatible con openpi; componentes declarados: codificador visual (vision23 y wrist23), LLM9, action expert11 y projection8. Detalle de capas no disponible |
| Parametros totales | no disponible (repositorio de 5,9 GB en BF16) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (74 hojas con hashes individuales); no se distribuyen variantes cuantizadas (INT8, INT4 o GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | BF16; formato de contenedor no especificado (biblioteca openpi, inferencia nativa fijada al commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia pi0.5 de openpi, un diseno VLA que combina un codificador visual, un modelo de lenguaje y un "action expert" que genera las acciones. En este repositorio concreto, el autor documenta explicitamente la composicion interna del checkpoint: vision23 se hereda del padre "retention"; LLM9, action expert11, projection8 y el clon de vision para la muneca wrist23 se toman de la fuente heredada verificada. Todos los tensores estan en BF16 y se registra el origen y el hash de cada una de las 74 hojas que componen el arbol de pesos. Esta trazabilidad a nivel de tensor es la innovacion tecnica destacable del artefacto.

No hay innovacion en el entrenamiento porque no hay entrenamiento: el autor indica que el compuesto no recibio las 1000 actualizaciones de entrenamiento y que el padre si fue entrenado previamente por terceros. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se declara una revision publica verificada en HuggingFace para la fuente heredada. Se incluyen los pesos de inferencia y los activos exactos de normalizacion.

## Capacidades

- Politica visomotora: mapea observaciones visuales e instrucciones a acciones de robot, en el marco de la biblioteca openpi.
- Percepcion con dos flujos de vision: una vision principal (vision23) y un clon especifico para la camara de muneca (wrist23), lo que permite comparar el comportamiento entre vista externa y vista cenital de la muneca.
- Componente de lenguaje (LLM9) integrado en el pipeline VLA para procesar la instruccion de la tarea.
- Generacion de acciones mediante action expert11 con su proyeccion asociada (projection8).
- Evaluacion reproducible en simulacion: el protocolo declarado usa el conjunto view_large, 40 tareas con 10 episodios cada una, semilla 17 y MuJoCo 3.2.3.
- Capacidad de tool calling / function calling: no disponible (no aplica a una politica robotica de este tipo).
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: ninguna declarada mas alla de su naturaleza de checkpoint diagnostico de composicion y de su uso como intervencion de evaluacion.

## Casos de uso

- Auditoria de procedencia de pesos: el repositorio registra el origen y el hash de las 74 hojas BF16, lo que permite a un equipo de investigacion verificar que cada tensor proviene del checkpoint esperado antes de reutilizarlo.
- Diagnostico de ablaciones en robótica: al mezclar la vision del padre "retention" con el resto de componentes de la fuente heredada, sirve para estudiar como afecta el origen del codificador visual al comportamiento final de la politica.
- Reproduccion de evaluaciones controladas: con el commit de inferencia nativa fijado y un protocolo cerrado (view_large, 40 tareas x 10 episodios, semilla 17, MuJoCo 3.2.3), es util para replicar resultados en un entorno homogeneo.
- Pruebas de regresion en pipelines de entrenamiento de VLA: al no contener entrenamiento nuevo, funciona como referencia estable para detectar cambios inesperados en el pipeline de inferencia o en las utilidades de normalizacion.
- Estudio de la vista de muneca: la presencia de un clon especifico para wrist23 permite analizar el peso de la camara de muneca frente a la vista externa en las mismas tareas.
- Investigacion sobre retencion y congelado de componentes: el artefacto se presenta como una herramienta para evaluar un teacher condicional, aunque el autor advierte de que no constituye un aislamiento causal del congelado del LLM.
- Punto de partida para experimentos posteriores: puede servir como inicializacion en estudios comparativos, siempre que se resuelva antes la ausencia de licencia explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe unicamente el protocolo de evaluacion, pero no incluye cifras de exito ni comparaciones numericas:

| Aspecto del protocolo | Valor declarado |
|---|---|
| Suite de evaluacion | view_large |
| Tareas y episodios | 40 tareas x 10 episodios |
| Semilla | 17 |
| Clientes por GPU | 8 |
| Entorno de simulacion | MuJoCo 3.2.3 |
| Emparejamiento episodico | no emparejado (el autor indica que el azar de la politica en servidor compartido no se empareja por episodio) |
| Uso de resultados para ajuste | ninguno (no se usaron para ajustar el teacher ni para seleccionar el coeficiente de perdida) |

## Requisitos de hardware

- VRAM estimada: partiendo del tamano del repositorio (5,9 GB en BF16), los pesos ocupan aproximadamente esa cifra. Sumando activaciones, torres de vision y buffers de inferencia, una estimacion orientativa es de 8 a 12 GB de VRAM por instancia. El numero exacto de parametros no esta disponible, por lo que la cifra es aproximada.
- GPUs recomendadas: el autor no declara minimos. El protocolo de evaluacion emplea 8 clientes por GPU, lo que apunta a GPUs de centro de datos (A100 40/80 GB, H100) para evaluacion por lotes.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 24 GB (RTX 3090, RTX 4090) y en modelos de 16 GB con margen reducido. No esta confirmado por el autor.
- Opciones de despliegue: inferencia nativa de openpi fijada al commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08, usando la configuracion incluida; simulacion con MuJoCo 3.2.3. No se distribuyen pesos en formato GGUF ni adaptaciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los puntos de comparacion naturales son los modelos de la propia familia pi0.5 de openpi (del cual este checkpoint es un derivado) y otras politicas VLA de acceso abierto. La informacion proporcionada no incluye especificaciones de esos modelos, por lo que la comparacion numerica no esta disponible.

| Criterio | Este checkpoint | pi0.5 base (openpi) | Otras VLA de acceso abierto (por ejemplo, OpenVLA) |
|---|---|---|---|
| Categoria | VLA diagnostico derivado | VLA | VLA |
| Parametros | no disponible | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible | no disponible |
| Entrenamiento | Ninguna actualizacion nueva: composicion de pesos de dos origenes | Entrenado por sus autores | Entrenado por sus autores |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | Publico en HuggingFace, con 0 descargas y 0 likes | Repositorio openpi | Publico |
| Trazabilidad de pesos | Alta: 74 hojas BF16 con hash y origen individual | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo entrenado: el autor indica explicitamente que no hay actualizaciones de entrenamiento nuevas, por lo que no debe esperarse ninguna mejora sobre el checkpoint padre.
- Alcance diagnostico: el artefacto se define como una intervencion sobre el endpoint de evaluacion, no como un metodo de retencion ni como un aislamiento causal del congelado del LLM.
- Ausencia de licencia: la licencia figura como "no disponible", lo que impide determinar si se permite el uso comercial o la redistribucion.
- Procedencia parcialmente opaca: la fuente heredada no tiene una revision publica verificada en HuggingFace segun la propia model card, lo que dificulta la reproducibilidad completa aunque se registren hashes por hoja.
- Ruido en la evaluacion: el autor advierte de que el azar de la politica en servidor compartido no se empareja por episodio, lo que limita la comparacion fina entre condiciones.
- Sin resultados publicados: no hay cifras de exito ni benchmarks en la informacion disponible, de modo que no puede evaluarse su rendimiento real.
- Ausencia de datos sobre sesgos, idiomas, contexto y alucinacion: no disponibles en la informacion proporcionada.
- Adopcion nula: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso por terceros.
- Dependencia de versiones concretas: la inferencia esta fijada a un commit concreto de openpi y la evaluacion a MuJoCo 3.2.3, lo que puede romper la reproducibilidad en entornos con otras versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-own-teacher-retention-view-large-derived-20261014
- Commit de inferencia nativa declarado en la model card: 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08 (no se proporciona URL asociada)
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
