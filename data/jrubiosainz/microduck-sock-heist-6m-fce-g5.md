# jrubiosainz/microduck-sock-heist-6m-fce-g5

## Resumen

Microduck Sock Heist - derived tail search FCE G5 es una política de control robótico en formato ONNX publicada por el usuario jrubiosainz como entrada para la competición de simulación Microduck Arena, en la modalidad de 6 metros Sock Heist. No se trata de un modelo de lenguaje, sino de un artefacto de control que genera comandos de movimiento a partir de observaciones, empaquetado como un grafo ONNX de aproximadamente 1,2 MB (1.208.007 bytes) con un SHA256 de política `7d3587294a6ded73fffc01679d57bc08458239bc474d0c4e8a719998684d15df`. El modelo se presenta explícitamente como un ajuste fino derivado de una política pública de terceros, no como un entrenamiento desde cero.

El punto de partida es `rumezhak/microduck-sock-heist-composite-v1` (revisión `b29090eb3242a9c1201b650495d515bb622a394f`), sobre el que se ha aplicado una búsqueda de cola con CMA-ES separable sobre las llamadas de control finales de los seeds oficiales 2, 3 y 4. El resultado es una mejora marginal pero medible en el tiempo de finalización: una media de 4,922 s y 4922 ticks totales frente a los 4937 ticks de la base directa, en repetición local nativa sobre el runner x86 oficial de microduck-arena 0.7.0.

La relevancia del artefacto es acotada: sirve como referencia de metodología para optimización de colas de políticas existentes en entornos de simulación competitivos, y como ejemplo de gestión de linaje y licencias en modelos derivados. No aporta capacidades de razonamiento, lenguaje ni visión, y el propio autor advierte que no debe ejecutarse en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de política de control con mecanismo de lookup de observaciones y red de fallback (no es un transformer ni un LLM) |
| Parámetros totales | no disponible (artefacto de 1.208.007 bytes; el número de parámetros no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control por pasos, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible para el modelo en su conjunto; se retiene `LICENSE-apache-2.0.txt` solo para las porciones que portan Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es un grafo ONNX que combina una tabla de lookup de observaciones (`L_obs`) y acciones (`L_act`) con una red de fallback, según el linaje declarado por el autor (v3/v4 y red de fallback atribuidas a lphatnguyen, y disposición de grafo y mecanismo de lookup atribuidos a a1rb4Ck/microduck-heist en el commit `94cd2cfeb57a4ece561a3d320e233f442238cb81`, Apache-2.0, que a su vez acredita al walker de juicenv). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO, porque no es un modelo entrenado con esos paradigmas.

La intervención de jrubiosainz, fechada el 2026-11-03, consistió en reoptimizar con CMA-ES separable las llamadas de control finales antes de la meta de los seeds oficiales 2, 3 y 4, con una búsqueda por seed, y en regrabar en bucle cerrado las observaciones y acciones de lookup sobre el runner x86 nativo. Solo cambian esas filas de cola de `L_obs` y `L_act` y el aviso de modificación añadido; el grafo, la red de fallback, la máscara, la tolerancia, las formas de los tensores y el resto de metadatos permanecen inalterados. Los seeds 1 y 5 conservan el comportamiento de la base. La evaluación canónica seleccionó `command_vx = 0.2`, sin sobrescritura de velocidad fijada.

## Capacidades

- Generación de comandos de control para la tarea de simulación Sock Heist a 6 metros en Microduck Arena.
- Recuperación de acciones mediante lookup de observaciones, con red de fallback para observaciones no cubiertas por la tabla.
- Ejecución determinista en el runner x86 oficial de microduck-arena 0.7.0, versión de runner 5.
- Finalización de la tarea en los cinco seeds oficiales medidos, con tiempos entre 4,780 s y 5,210 s.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente en el sentido de LLM.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento.
- No se ha establecido ninguna capacidad de generalización fuera de los cinco seeds oficiales ni seguridad para operación en robot físico.

## Casos de uso

- Referencia metodológica para optimización de cola: el flujo de CMA-ES separable aplicado únicamente a las llamadas de control finales de seeds concretos sirve como plantilla reproducible para equipos que quieran mejorar políticas existentes sin reentrenar el grafo completo.
- Evaluación comparativa en simulación: permite medir en el runner oficial la diferencia de ticks (4922 frente a 4937 de la base) y validar pipelines de evaluación canónica con selección automática de `command_vx`.
- Estudio de linaje y licencias en modelos derivados: el artefacto documenta con hashes SHA256, avisos heredados en `NOTICE` y metadatos ONNX cómo trazar modificaciones sobre pesos de terceros sin reclamar propiedad nueva.
- Docencia e investigación en robótica de competición: útil para ilustrar el ciclo observación-lookup-acción y el papel de una red de fallback en políticas tabulares híbridas.
- Pruebas de integración de ONNX en runners de simulación: el tamaño reducido (1,2 MB) facilita tests de carga, verificación de máscaras y tolerancias en CI sin coste de infraestructura.
- Auditoría de artefactos publicados: los hashes de política y de la base permiten verificar que el binario liberado coincide con el intermedio anotado y detectar sustituciones.

## Benchmarks y rendimiento

Resultados de repetición local nativa sobre el runner x86 oficial de microduck-arena 0.7.0 (runner versión 5), no son resultados de la Arena en vivo:

| Seed oficial | Tiempo de finalización (s) | Ticks de física |
|---|---:|---:|
| 1 | 4,820 | 964 |
| 2 | 5,210 | 1042 |
| 3 | 4,780 | 956 |
| 4 | 4,840 | 968 |
| 5 | 4,960 | 992 |

Media: 4,922 s. Total: 4922 ticks, frente a 4937 ticks de la base directa. Cinco finalizaciones sobre cinco seeds. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un grafo ONNX de 1,2 MB y no requiere GPU para ejecutarse.
- GPU recomendadas: no disponible; la evaluación reportada se realizó en el runner x86 nativo, sin mención de aceleración por GPU.
- Cabe en cualquier GPU consumer y en CPU: el tamaño del fichero (1.208.007 bytes) no supone restricción de memoria relevante.
- Opciones de despliegue: ONNX Runtime sobre el runner oficial de microduck-arena 0.7.0; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles como métricas independientes; los únicos datos son los ticks de física por seed recogidos en la tabla anterior.
- Diferencias de hardware y runtime pueden alterar los resultados, según advierte el propio autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-fce-g5 (este) | no disponible (1,2 MB ONNX) | no aplica | 4922 ticks totales, media 4,922 s en 5 seeds | no disponible para el conjunto | Hugging Face, 0 descargas, 0 likes |
| rumezhak/microduck-sock-heist-composite-v1 (base directa) | no disponible | no aplica | 4937 ticks totales | no declarada | Hugging Face |
| a1rb4Ck/microduck-heist (commit 94cd2cf) | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face |
| Entrada previa G1 de jrubiosainz (solo seed 2) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El autor declara explícitamente que no debe ejecutarse la política en un robot físico: no se ha establecido parada segura ni operación física.
- Los resultados son in-sample: solo se optimizaron y midieron los cinco seeds oficiales, por lo que no hay evidencia de generalización.
- Las mediciones son locales y nativas, no un resultado de aceptación, rango o puntuación en la Arena en vivo; diferencias de hardware o runtime pueden cambiar el resultado.
- La licencia del modelo en su conjunto no está declarada; `LICENSE-apache-2.0.txt` cubre solo las porciones que portan Apache-2.0 y no los pesos upstream sin licencia.
- Partes upstream (v3/v4 y red de fallback de lphatnguyen) no tienen licencia declarada, lo que genera incertidumbre legal para reutilización.
- El autor se compromete a detener la publicación y escalar la retirada si algún autor objeta, lo que implica riesgo de desaparición del artefacto.
- No hay información sobre sesgos, tasas de alucinación ni limitaciones de idioma porque el modelo no procesa lenguaje.
- El aviso de modificación añadido identifica esta modificación por separado, pero los avisos heredados en `NOTICE` describen artefactos predecesores y no cambios adicionales de esta release.
- El intermedio sin anotar no es el artefacto de release; solo el SHA256 `7d3587294a6ded73fffc01679d57bc08458239bc474d0c4e8a719998684d15df` corresponde a la versión publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-fce-g5
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1/tree/b29090eb3242a9c1201b650495d515bb622a394f
- Repositorio de disposición de grafo y lookup: https://huggingface.co/a1rb4Ck/microduck-heist (commit `94cd2cfeb57a4ece561a3d320e233f442238cb81`)
- Microduck Arena y runner oficial (Pollen Robotics): no disponible en la información proporcionada
