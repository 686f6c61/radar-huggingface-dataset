# JooYoon/riidolaya-statehint-feature-ablation-v0.1-development

## Resumen

`riidolaya-statehint-feature-ablation-v0.1-development` es un paquete de investigación publicado en HuggingFace por el usuario JooYoon que contiene dos clasificadores lineales softmax escritos en Go, no un modelo de lenguaje generativo. Ambos artefactos (`simple2048.rsh` y `contextual2048.rsh`, 65.728 bytes cada uno) clasifican ocho intenciones sobre prosa de desarrollo de software de alcance acotado, en coreano e inglés, y se distribuyen como material reproductible de un experimento de ablación de features que falló los criterios de cualificación.

El modelo no genera texto, no mantiene conversación ni ejecuta acciones: emite una etiqueta de intención a partir de un texto de entrada, tratada explícitamente por el autor como una "pista" de investigación y nunca como verificación de ejecución, permiso o cierre de tarea. La comparación entre las dos variantes aísla el efecto de cambiar el conjunto de features (unigramas de palabra y n-gramas de carácter 2/3 frente a añadir pares de palabras y n-gramas 4/5 con hashing con signo y log-TF), pero el propio autor advierte que no aísla el efecto causal del orden de las palabras.

Es relevante ahora como ejemplo de publicación de resultados negativos y de artefactos no promocionados: los cuatro brazos originales V4 y los dos nuevos brazos de features fallaron los requisitos de evaluación por familia, y ningún modelo fue seleccionado ni promocionado. Para desarrolladores e investigadores resulta útil como referencia metodológica de evaluación honesta, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal softmax multinomial con hashing de features; no es un transformer ni un modelo generativo |
| Parametros totales | No declarado por el autor. Derivado del artefacto: 2.048 bins de feature x 8 intenciones = 16.384 pesos float32 (65.536 bytes) más una cabecera de 192 bytes (65.728 bytes totales); el dato no se explicita como recuento de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Usa una representacion de features de 2.048 bins por instancia, no una ventana de contexto de tokens |
| Tipos de cuantizacion | No disponible. Los pesos se almacenan en float32, no en formato ternario |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propio `.rsh` (statehintwide); no es un checkpoint de Transformers, safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada artefacto es un clasificador lineal softmax (regresion logistica multinomial) implementado en Go con 2.048 bins de feature y ocho clases de intencion. La variante `simple2048.rsh` usa unigramas de palabra y n-gramas de caracter de orden 2 y 3 con normalizacion por recuento. La variante `contextual2048.rsh` anade pares de palabras y n-gramas de caracter de orden 4 y 5, hashing con signo y log-TF. Ambos modelos parten de pesos nuevos (sin pesos preentrenados externos) y se entrenaron durante 40 epocas con tamano de lote 32, tasa de aprendizaje 0,02, weight decay 0,001, semilla 1729 y temperatura 1. Los pesos resultantes son float32.

El corpus de entrenamiento consta de 840 familias de escenarios ficticios con redacciones emparejadas en coreano e ingles: 1.680 filas y 105 familias por intencion. Las etiquetas fueron redactadas y revisadas por IA, no establecidas como verdad humana. Solo el texto entra en las features; los campos de anotacion aportan los objetivos de entrenamiento y las comprobaciones. No se utilizaron datos de tareas privadas ni pesos preentrenados externos. Las frases crudas de entrenamiento, validacion, calibracion y test final no se incluyen en el paquete. La validacion sintetica previamente expuesta contiene 120 familias emparejadas, 240 filas y 43 linajes declarados, y el autor subraya que no son 240 observaciones de producto independientes.

## Capacidades

- Clasificacion de texto en ocho intenciones sobre prosa de desarrollo acotada; las clases de progreso, informe de finalizacion y pregunta son el alcance prioritario declarado.
- Distincion de intenciones en coreano y en ingles, con redacciones emparejadas por familia de escenario.
- Recuento de "pistas" a partir de features lexicas y de caracteres, sin generacion de texto.
- Comparacion controlada de dos conjuntos de features (simple frente a contextual) para estudios de ablacion.
- Salida con confianza y margen internos (confianza 0,9 y margen 0,05 fijados en la configuracion de evaluacion).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- No puede crear etiquetas, reacciones ni cambios de estado; solo propone una etiqueta de intencion.

## Casos de uso

- Estudio metodologico de evaluacion honesta: sirve como ejemplo publicado de brazos que fallaron criterios de cualificacion, con los recuentos agregados y los fallos conservados en `RESULTS.feature-ablation.aggregate.json` y `RESULTS.v4.aggregate.json` para su escrutinio.
- Ablacion de ingenieria de features: permite comparar de forma reproducible el efecto de sustituir unigramas y n-gramas 2/3 por pares de palabras y n-gramas 4/5 con hashing con signo y log-TF, manteniendo constante el resto de hiperparametros.
- Reproducibilidad de experimentos fallidos: el paquete conserva pesos entrenados reales y comprobaciones de integridad SHA-256, de modo que un laboratorio puede repetir las inferencias del autor y verificar que las predicciones guardadas y recargadas coinciden exactamente.
- Desarrollo de clasificadores de estado de tareas: la tarea de las ocho intenciones (con progreso, informe de finalizacion y pregunta como foco) puede inspirar disenos de etiquetado para herramientas internas de seguimiento de desarrollo, siempre tratando la salida como pista no verificada.
- Evaluacion de pipelines de calibracion: dado que el autor declara que las probabilidades no estan calibradas y que las pasadas de calibracion y test final son cero, el artefacto sirve como caso de prueba para medir el impacto de la calibracion sobre un clasificador lineal con hashing.
- Analisis de costes asimetricos de error: el paquete fija costes de 1/10/3 para falsos progreso/finalizacion/pregunta y unos requisitos de cobertura (0,2), cinco familias correctas, dos linajes declarados, precision de finalizacion 0,98 y coste de severidad inferior a 0,375, utiles como plantilla de criterios de promocion.
- Prueba de integracion del cargador `statehintwide`: permite verificar en un entorno controlado que los artefactos requieren `github.com/teamswyg/laya-tools/pkg/statehintwide.Load` y su `Workspace`, y que no pueden cargarse con el cargador v1 ni seleccionarse automaticamente por la CLI/SDK v1 existente.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la validacion sintetica previamente expuesta (120 familias emparejadas, 240 filas, 43 linajes declarados). Ningun brazo supero los criterios de cualificacion.

| Modelo | Correctos en ocho intenciones (crudo) | Propuestas correctas con gate / total de propuestas | Familias de finalizacion correctas KO / EN |
|---|---:|---:|---:|
| Original V4 fresh1024 | 160/240 (66,7%) | 27/27 | 3 / 0 |
| Simple2048 | 176/240 (73,3%) | 35/36 | 3 / 1 |
| Contextual2048 | 179/240 (74,6%) | 40/40 | 3 / 0 |

Notas del autor sobre estos datos: la unica propuesta incorrecta con gate de Simple2048 fue "progreso" en coreano. Ninguno de los dos modelos nuevos produjo una propuesta de finalizacion incorrecta con gate, pero el soporte de finalizacion sigue siendo demasiado pequeno: coreano 3/15 familias en ambos modelos, ingles 1/15 y 0/15. La precision de finalizacion en ingles con cero propuestas queda indefinida, no perfecta. La correccion cruda de finalizacion mejoro de 17/30 a 20/30, pero el soporte de alta confianza para finalizacion no alcanzo un nivel suficiente, y las mejoras en progreso/pregunta no establecen utilidad de finalizacion ni generalizacion de producto. Los modelos nuevos fallaron el soporte de familias de finalizacion en coreano y la cobertura/familias/linajes de finalizacion en ingles. Las predicciones guardadas y recargadas coincidieron exactamente en todos los campos de validacion de ambos modelos. El tamano de 65.728 bytes del artefacto no es la RSS del proceso, y el valor de 32.960 bytes de la v1 es solo una referencia de tamano.

## Requisitos de hardware

- Inferencia en CPU: los dos artefactos son clasificadores lineales de aproximadamente 16.384 pesos float32 (65.728 bytes cada uno); no requieren GPU.
- VRAM estimada: no aplica; el autor solo reporta campos de tiempo local de una unica ejecucion y no mediciones de memoria nativa ni de GPU.
- GPU recomendadas: no procede; no se declara soporte ni uso de GPU.
- Cabe en cualquier equipo de consumo: al tratarse de un artefacto de decenas de kilobytes ejecutado en Go, el cuello de botella es el tiempo de proceso, no la memoria.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI; el artefacto solo se carga con `github.com/teamswyg/laya-tools/pkg/statehintwide.Load` y su `Workspace`, y se ejecuta mediante `go run ./model-assets/example.go`, que verifica el tamano y el SHA-256 exactos antes de cargar.
- Requisitos de entorno: Go 1.27.1 y el commit publico de codigo fuente registrado en `PROVENANCE.json` tras la CI.
- Concurrencia: un llamador posee y reutiliza su workspace de forma serial; las predicciones concurrentes requieren workspaces separados.
- Latencia y throughput: no disponible como benchmark repetido; los campos de tiempo locales describen una sola ejecucion.

## Comparativa con modelos similares

No se dispone de modelos externos comparables documentados en la informacion proporcionada. La unica comparacion disponible es interna, entre el brazo historico y las dos variantes nuevas:

| Modelo | Parametros | Features | Correctos en ocho intenciones | Precision con gate | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Original V4 fresh1024 | No disponible | No detallado | 160/240 (66,7%) | 27/27 | No indicada en este paquete | Solo como resultado historico de comparacion; no es un brazo cargado por este comando |
| Simple2048 | ~16.384 pesos (derivado) | Unigramas de palabra y n-gramas de caracter 2/3 con normalizacion por recuento | 176/240 (73,3%) | 35/36 | Apache 2.0 | Artefacto `simple2048.rsh` incluido en el paquete |
| Contextual2048 | ~16.384 pesos (derivado) | Anade pares de palabras y n-gramas de caracter 4/5, hashing con signo y log-TF | 179/240 (74,6%) | 40/40 | Apache 2.0 | Artefacto `contextual2048.rsh` incluido en el paquete |

Para alternativas externas de la misma categoria (clasificadores lineales de intencion en coreano/ingles), no disponible.

## Limitaciones y advertencias

- Modelo no cualificado: los cuatro brazos originales V4 y los dos nuevos brazos de features fallaron los criterios de cualificacion; ningun modelo fue seleccionado ni promocionado.
- Sesgos conocidos: las etiquetas fueron redactadas y revisadas por IA, no establecidas como verdad humana; el corpus son escenarios ficticios emparejados, no datos reales de producto.
- Riesgo de error asimetrico: los costes fijados para falsos progreso/finalizacion/pregunta son 1/10/3, lo que refleja que un falso positivo de finalizacion es especialmente costoso; el soporte de alta confianza para finalizacion no alcanza el umbral definido.
- Soporte de finalizacion insuficiente: coreano 3/15 familias en ambos modelos nuevos, ingles 1/15 y 0/15; la precision de finalizacion en ingles con cero propuestas queda indefinida, no perfecta.
- Comparacion no causal respecto al orden de palabras: la variante contextual anade varios cambios de features a la vez (pares de palabras, n-gramas 4/5, hashing con signo, log-TF), por lo que no aisla el efecto causal del orden de palabras.
- Probabilidades sin calibrar: el autor declara explicitamente que las probabilidades no estan calibradas y que las pasadas de calibracion y test final son cero.
- Cobertura y generalizacion limitadas: la validacion sintetica no son observaciones de producto independientes; los resultados no establecen utilidad de finalizacion ni generalizacion de producto.
- Semantica de la salida: un informe de finalizacion describe una afirmacion textual, no una finalizacion de trabajo verificada. El modelo no puede verificar ejecucion, permiso ni cierre de tarea, y no puede crear etiquetas, reacciones ni cambios de estado.
- Restricciones de formato: los artefactos no pueden cargarse con el cargador v1 `pkg/statehint` ni seleccionarse automaticamente por la CLI/SDK v1 existente; no son un checkpoint de Transformers ni un endpoint de inferencia alojado.
- Restricciones de licencia: se distribuye bajo Apache 2.0, que permite uso comercial, pero el estado "research release candidate" y la falta de cualificacion hacen desaconsejable su uso en produccion sin validacion propia.
- Caveat de integridad: la ejecucion de ejemplo exige verificar el tamano exacto y el SHA-256 antes de cargar, y obliga a reemplazar los marcadores de commit del codigo fuente y del modelo por sus IDs inmutables publicados.
- No se incluyen frases crudas de entrenamiento, validacion, calibracion ni test final, lo que limita la auditoria externa del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JooYoon/riidolaya-statehint-feature-ablation-v0.1-development
- Repositorio de codigo fuente: https://github.com/teamswyg/laya-tools
- Comando de ablacion (README en ingles): https://github.com/teamswyg/laya-tools/blob/main/cmd/riido-statehint-ablate/README.en.md
- Comando de ablacion (README en coreano): https://github.com/teamswyg/laya-tools/blob/main/cmd/riido-statehint-ablate/README.ko.md (ruta inferida a partir del enlace en ingles; no confirmada en la informacion proporcionada)
- Tarjeta del modelo en coreano: README.ko.md dentro del repositorio de HuggingFace
- Resultados agregados de la ablacion: `RESULTS.feature-ablation.aggregate.json` en el repositorio de HuggingFace
- Resultados agregados del brazo V4: `RESULTS.v4.aggregate.json` en el repositorio de HuggingFace
- Fichero de procedencia y commits inmutables: `PROVENANCE.json` en el repositorio de HuggingFace
