# JooYoon/riidolaya-statehint-capacity-v0.1-development

## Resumen

`JooYoon/riidolaya-statehint-capacity-v0.1-development` no es un modelo de lenguaje generativo, sino un paquete de investigacion con dos clasificadores de texto de tamano extremadamente reducido implementados en Go. El paquete compara dos arquitecturas sobre el mismo conjunto de caracteristicas: un clasificador lineal softmax sobre una representacion Contextual2048 (16.392 parametros) y un perceptron multicapa con 16 unidades ReLU ocultas y salida softmax de 8 clases (32.920 parametros). El objetivo declarado es estudiar el efecto conjunto de arquitectura e inicializacion sobre la precision en la etiqueta de "completion", no demostrar una ganancia causal aislada de la capacidad no lineal.

El modelo trabaja sobre prosa de desarrollo (texto acotado en coreano e ingles) y predice una de ocho etiquetas de intencion definidas en `INTENTS.en.md` (entre ellas completion, reference, progress, planned, blocker y question). Se distribuye como artefactos binarios propietarios `.rsh` (RSH v2) y `.rsm` (RSM v3) que requieren loaders especificos (`pkg/statehintwide.Load` y `pkg/statehintmlp.Load`), y no como pesos safetensors ni GGUF.

Es relevante como documentacion de un experimento de investigacion reproducible: el autor publica presupuesto de entrenamiento identico para ambas ramas, hashes SHA256, particiones congeladas y resultados internos de desarrollo. La publicacion se marca explicitamente como "research release": el MLP falla el requisito interno de precision de completion (35/37, 94,59 % frente al 98 % exigido) y ambas ramas quedan "unqualified" en el diagnostico externo previamente expuesto. No hubo calibracion, evaluacion final, promocion ni despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lineal: softmax lineal sobre caracteristicas Contextual2048. MLP: Contextual2048 -> 16 ReLU -> 8 softmax |
| Parametros totales | Lineal: 16.392. MLP: 32.920 |
| Longitud de contexto | No disponible (no es un modelo de contexto de tokens; usa un vector de caracteristicas Contextual2048) |
| Tipos de cuantizacion | Solo pesos float32; no se ofrecen variantes cuantizadas |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | Binarios propietarios: `.rsh` (RSH v2) para lineal y `.rsm` (RSM v3) para MLP |
| Tamano en disco | Lineal: 65.728 bytes. MLP: 131.872 bytes (aprox. 128,78 KiB con cabecera y checksum) |
| Pipeline | text-classification |
| Numero de etiquetas | 8 (definidas en `INTENTS.en.md`) |

## Arquitectura y entrenamiento

Ambas ramas comparten el mismo conjunto de caracteristicas, denominado Contextual2048: unigramas y pares de palabras, n-gramas de caracteres de 2 a 5, hashing con signo, log-TF y normalizacion L2. El modelo lineal aplica un softmax sobre esa representacion con pesos inicializados a cero. La rama MLP anade una capa oculta de 16 unidades ReLU inicializadas con Glorot y semilla 1729. El autor subraya que la comparacion mide el efecto combinado de arquitectura mas inicializacion, y no una activacion, inicializacion o ganancia de capacidad causal demostrada de forma aislada. Los pesos son float32 y el MLP usa formato RSM v3, incompatible con los valores por defecto del SDK/CLI v1 y con el loader lineal v2.

Los datos de entrenamiento son 840 familias emparejadas ficticias revisadas por IA, con una particion congelada por grupos completos: 663 familias de ajuste y 177 familias internas de desarrollo (354 filas, 155 grupos declarados). La regla de particion usa el hash `completion-contrast-internal-split-1729:` mas el identificador de grupo; los primeros 8 caracteres hexadecimales como entero modulo 5 igual a 0 determinan desarrollo. Cada rama recibe exactamente las mismas 1.454 filas ordenadas de entrenamiento (1.326 de ajuste base mas 128 filas adicionales de 64 familias de ajuste existentes; las etiquetas extra son 32 de completion y 8 de cada una de reference, progress, planned y blocker). Ambas ramas usan 40 epocas, batch 32, tasa de aprendizaje 0,02, AdamW con decaimiento 0,001, semilla 1729, temperatura 1 y 1.840 actualizaciones. Las predicciones guardadas y recargadas coincidieron exactamente con los bytes reserializados para los dos artefactos entrenados. No hay aumentacion semantica ni modelo padre entrenado.

## Capacidades

- Clasificacion de texto en 8 etiquetas de intencion sobre prosa de desarrollo acotada en coreano e ingles.
- Distincion entre propuestas de "completion" y otras categorias (reference, progress, planned, blocker, question).
- Generacion de sugerencias de etiqueta con una compuerta interna ("gated") que filtra que propuestas se emiten.
- Funcionamiento sobre texto sin modelo generativo: solo entra texto en las caracteristicas y la intencion esperada es el objetivo de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No es un checkpoint de Transformers ni un endpoint de inferencia alojado.

## Casos de uso

- Clasificacion de partes diarios en ingles y coreano: el modelo etiqueta mensajes breves de desarrollo como progress, blocker o planned para alimentar tableros de seguimiento. Es adecuado para este escenario por su tamano minimo y su coste de inferencia despreciable en CPU, siempre como sugerencia no vinculante.
- Deteccion de bloqueos declarados: al marcar mensajes de equipo como blocker, permite enrutarlos a revision humana, dado que una finalizacion declarada en texto es una afirmacion, no evidencia de exito.
- Triage de preguntas frente a afirmaciones: la etiqueta question ayuda a separar consultas de informes y a encaminarlas a los canales adecuados.
- Anotacion asistida en corpus de investigacion: como paso previo a revision humana, para preetiquetar familias de texto y reducir el coste de anotacion, teniendo en cuenta que el autor declara que las etiquetas sinteticas originales fueron generadas y revisadas por IA, no son verdad de referencia humana.
- Experimentos controlados de arquitectura: sirve como banco de pruebas reproducible para comparar lineal frente a MLP con presupuesto identico, particion congelada y hashes verificables.
- Filtrado previo en pipelines de documentacion de desarrollo: puede priorizar que informes requieren atencion, con la advertencia de que no crea reacciones, anotaciones ni cambios de estado de tareas por si mismo.
- Investigacion sobre calibracion y confianza: los datos publicados de coste de severidad y NLL por rama permiten estudiar la relacion entre cobertura de completion y errores de compuerta.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos disponibles son los resultados internos de desarrollo y el diagnostico del propio autor.

Resultados internos de desarrollo (354 filas):

| Rama | Correctos 8 intenciones | Correctos con compuerta / propuestos | Coste de severidad | NLL 8 intenciones | Precision de completion | Compuerta interna |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Lineal | 317/354 (89,55 %) | 73/74 | 0,138418 | 0,381590 | 26/26 (100 %) | Pasa, solo interno |
| MLP16 | 322/354 (90,96 %) | 91/95 | 0,217514 | 0,360619 | 35/37 (94,59 %) | Falla: precision de completion |

Soporte correcto de familias de completion KO/EN: 12/25 y 14/25 para lineal; 16/25 y 19/25 para MLP.

Diagnostico previamente expuesto (240 filas, sin peso de seleccion):

| Rama | Correctos 8 intenciones | Correctos con compuerta / propuestos | Coste de severidad | Familias de completion correctas KO / EN | Compuerta de diagnostico |
| --- | ---: | ---: | ---: | ---: | --- |
| Lineal | 172/240 (71,67 %) | 39/39 | 0,212500 | 4/15 y 0/15 | No cualificado |
| MLP16 | 174/240 (72,50 %) | 52/55 | 0,216667 | 5/15 y 1/15 | No cualificado |

El diagnostico consta de 120 familias emparejadas, 240 filas y 43 grupos declarados. El MLP falla la cobertura de completion en ingles, el soporte de familia y el soporte de linaje; el lineal tambien falla el soporte de familia de completion en coreano. La seleccion interna escogio la rama lineal ordenando por coste de severidad, NLL de 8 intenciones y orden fijo de rama, pero el autor advierte que esta eleccion de desarrollo no establece seguridad operativa.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; los artefactos ocupan 65.728 bytes (lineal) y 131.872 bytes (MLP) con pesos float32, por lo que la inferencia puede ejecutarse en CPU sin acelerador.
- GPU recomendadas: no se requiere GPU; cualquier CPU es suficiente. No se han publicado requisitos de GPU.
- Cabe en GPU de consumo: si, en cualquier GPU (o sin GPU), dado el tamano de menos de 1 MB.
- Opciones de despliegue: exclusivamente los loaders del propio proyecto en Go, `pkg/statehintwide.Load` (RSH v2) para el lineal y `pkg/statehintmlp.Load` (RSM v3) para el MLP. No es compatible con vLLM, llama.cpp, Ollama ni TGI. El formato RSM v3 no es compatible con los valores por defecto del SDK/CLI v1 ni con el loader lineal v2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos externos comparables en la informacion proporcionada. La comparacion natural es entre las dos ramas del propio paquete:

| Aspecto | Lineal (`.rsh`) | MLP16 (`.rsm`) |
| --- | --- | --- |
| Parametros | 16.392 | 32.920 |
| Tamano | 65.728 bytes | 131.872 bytes (aprox. 128,78 KiB) |
| Arquitectura | Softmax lineal | 2048 -> 16 ReLU -> 8 softmax |
| Inicializacion | Pesos a cero | Glorot, semilla 1729 |
| Correctos en desarrollo | 317/354 (89,55 %) | 322/354 (90,96 %) |
| Precision de completion | 26/26 (100 %) | 35/37 (94,59 %) |
| Compuerta interna | Pasa | Falla |
| Compuerta de diagnostico | No cualificado | No cualificado |
| Licencia | apache-2.0 | apache-2.0 |

## Limitaciones y advertencias

- El MLP no cumple el requisito interno de precision de completion (35/37, 94,59 % frente al 98 %), por lo que queda descalificado para produccion.
- Ambas ramas quedan "unqualified" en el diagnostico externo previamente expuesto; ninguna es aprobada para produccion.
- No hubo calibracion, evaluacion final, promocion ni despliegue.
- Las etiquetas sinteticas originales estan escritas y revisadas por IA, no son verdad de referencia humana.
- Los resultados de desarrollo interno ya se habian expuesto en trabajos previos; este es otro experimento de desarrollo, no una evaluacion de producto independiente y fresca.
- Los resultados tienen alta varianza debida al tamano minimo de las particiones (354 filas de desarrollo, 240 de diagnostico), lo que limita la significacion de las diferencias entre ramas.
- La rama lineal genero cero propuestas de completion en ingles en el diagnostico; esto no implica precision perfecta en ingles.
- Puede existir un problema de confianza: el mayor numero de errores con compuerta en el MLP sugiere sobreconfianza, aunque el autor aclara que no lo prueba a nivel global ni demuestra un efecto aislado de capacidad no lineal.
- Los modelos producen sugerencias; no crean reacciones, anotaciones ni cambios de estado de tareas, y un informe de finalizacion en texto no es evidencia de exito ni permiso para cambiar el estado de una tarea.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la condicion de artefacto de investigacion no cualificado desaconseja su uso en produccion.
- Idiomas limitados a coreano e ingles; el soporte de completion en ingles es debil en el diagnostico (5/15 en el MLP, 0/15 en el lineal).
- No se empaquetaron frases de entrenamiento en bruto, de desarrollo interno, de diagnostico, de calibracion, de test ni de tareas privadas.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/JooYoon/riidolaya-statehint-capacity-v0.1-development
- Model card en coreano: README.ko.md (referenciado en la model card, dentro del repositorio)
- Definicion de etiquetas: `INTENTS.en.md` (referenciado en la model card, dentro del repositorio)
- No se han proporcionado enlaces a papers, blogs, repositorios de codigo publicos, demos ni paginas de proyecto adicionales.
