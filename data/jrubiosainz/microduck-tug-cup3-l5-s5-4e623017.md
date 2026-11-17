# jrubiosainz/microduck-tug-cup3-l5-s5-4e623017

## Resumen

`microduck-tug-cup3-l5-s5-4e623017` es un artefacto ONNX publicado por el usuario de Hugging Face `jrubiosainz` dentro del ecosistema de competición "Microduck Tug of War". No es un modelo de lenguaje: se trata de una política de control (policy) empaquetada como grafo ONNX de 1.003.410 bytes, pensada para ser ejecutada en simulaciones de agarre y arrastre (tug) y evaluada mediante replays de rating en x86 de 64 bits. El autor lo describe explícitamente como "simulation only" y "rating candidate", sin resultado oficial de Arena ni autorización de publicación.

La construcción del artefacto es incremental y composicional. Según la model card, el autor parte de un controlador de respaldo L1 atribuido a `lphatnguyen/microduck-tug-of-war-v2`, añade una capa de búsqueda externa de observación/acción sobre las trayectorias de rating de las semillas 1 a 4 documentadas en `HlibPlakhtii/microduck-tug-cup-nov17-v8` y busca únicamente la trayectoria de la semilla 5. El resultado es un grafo de 27 nodos y 20 inicializadores, de los cuales 18 son idénticos byte a byte a la variante D7 del propio autor.

Su relevancia es acotada y muy específica: sirve como evidencia reproducible de un proceso de búsqueda por semillas sobre un controlador heredado, con recibos de replay aceptados por coordinación. No debe confundirse con un modelo de propósito general ni con el controlador general de Hlib v8. El repositorio tiene 0 descargas, 0 likes, tamaño de 0.0 GB reportado y no declara licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de política de control (27 nodos, 20 inicializadores); no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible (el artefacto pesa 1.003.410 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa texto; opera sobre observaciones de simulación) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx` en precisión nativa) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible; la model card indica que no se afirma licencia de modelo completo y que Apache-2.0 aplica solo a componentes que la llevan |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX construido por un "sealed builder" que añade una capa externa de búsqueda de observación/acción sobre un controlador de respaldo L1. Según la model card, el constructor preserva los inicializadores del fallback y añade diez nodos al grafo; la coordinación comparó el protobuf exacto con la variante D7 y verificó los mismos 27 nodos y 18 de 20 inicializadores idénticos byte a byte, difiriendo solo `search_obs` y `search_act`. La capa de búsqueda enmascara las columnas de observación a partir de la 48.

No hay entrenamiento de red neuronal nuevo. El autor lo declara explícitamente: "No new network training is claimed". Lo que se busca es la trayectoria de rating de la semilla 5, mientras que las semillas 1 a 4 provienen del builder sellado nativo que registra `HlibPlakhtii/microduck-tug-cup-nov17-v8` en el commit `ca745bd0b5be8c7c339789f311563aef1608e617`. El conjunto de pares nuevos son 347, en orden de semilla [1,2,3,4,5] con 66/70/72/70/69 filas y rangos semiabiertos [0,66), [66,136), [136,208), [208,278), [278,347).

La evidencia de aceptación incluye un replay de rating exact-policy en x86_64 cuyo artefacto invitado coincide en SHA y tamaño con el candidato nativo, con cinco resultados `pit_won` y valores de score/vector idénticos al registro nativo (media 168.90362858772278, hex `0x1.51cea86800000p+7`, runner5/vx-0.3, 347/347 aciertos de lookup). Además, el análisis de compatibilidad finita comprobó 27 claves cambiadas distintas contra 307.714 observaciones históricas en 1.744 archivos con hash (8.308.278 comparaciones), con cero aciertos de clave cambiada.

## Capacidades

- Ejecución de una política de control en simulación de tug of war, empaquetada como grafo ONNX.
- Lookup de observación/acción sobre 347 pares distribuidos en cinco trayectorias de semilla.
- Replay determinista en x86_64 con coincidencia exacta de SHA y tamaño respecto al candidato nativo.
- Enmascaramiento de columnas de observación a partir de la 48 en la capa de búsqueda.
- Compatibilidad finita verificada contra un corpus histórico de 307.714 observaciones.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No soporta capacidades multilingües.

## Casos de uso

- Reproducción de evidencia de rating: el artefacto permite reejecutar el replay exact-policy en x86_64 y verificar la coincidencia de SHA, tamaño y vector de scores frente al candidato nativo, útil para auditoría de resultados de competición.
- Auditoría de construcción de políticas: la comparación protobuf con D7 (27 nodos, 18 de 20 inicializadores idénticos) permite verificar que solo difieren `search_obs` y `search_act`, lo que sirve para validar pipelines de empaquetado ONNX.
- Análisis de compatibilidad finita: el fichero `finite-compatibility.json` documenta la comprobación de 27 claves cambiadas contra 307.714 observaciones históricas, útil para estudiar regresiones de comportamiento en corpus acotados.
- Investigación de búsqueda por semillas: el reparto 66/70/72/70/69 filas por semilla permite estudiar cómo una búsqueda local sobre la semilla 5 afecta a las trayectorias de rating sin reentrenar la red.
- Integración en pipelines de simulación: al ser un ONNX de ~1 MB, puede cargarse en entornos de simulación ligeros para comparar controladores de respaldo frente a variantes con lookup externo.
- Docencia y divulgación sobre artefactos ONNX: sirve como ejemplo real de grafo pequeño con inicializadores preservados, nodos añadidos y trazabilidad de procedencia por hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente evidencia de replay local:

| Métrica | Valor |
|---|---|
| Media de rating nativa (5 semillas) | 168.90362858772278 |
| Media de referencia v8 | 168.90318274497986 |
| Ganancia media nativa | 0.0004458427429199219 cm |
| Hex del vector | `0x1.51cea86800000p+7` |
| Aciertos de lookup | 347/347 |
| Fallback / bad / nonfinite en 5 bouts | 0 |
| Comparaciones de compatibilidad finita | 8.308.278 |
| Aciertos de clave cambiada | 0 |

El autor advierte que esta evidencia es local y no constituye resultado de servidor ni validación H2H o de Cup.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto pesa 1.003.410 bytes y un grafo ONNX de este tamaño es ejecutable en CPU.
- GPU recomendadas: no disponible; no se documenta requisito de GPU.
- Cabe en GPU consumer: sí, por tamaño, aunque no se especifica soporte ni rendimiento en ninguna GPU concreta.
- Opciones de despliegue: ONNX Runtime en x86_64 (el replay aceptado se ejecutó en guest x86_64); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles; la model card solo reporta resultados de bouts, no tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-cup3-l5-s5-4e623017` | Política ONNX de control | 1.003.410 bytes | no aplica | no disponible | Público en HF |
| `jrubiosainz/microduck-tug-cup3-d7-557cdaee` | Política ONNX de control (D7) | no disponible | no aplica | no disponible | Público en HF |
| `HlibPlakhtii/microduck-tug-cup-nov17-v8` | Controlador general v8 (fuente de trayectorias) | no disponible | no aplica | no disponible | Público en HF |
| `lphatnguyen/microduck-tug-of-war-v2` | Controlador de respaldo L1 | no disponible | no aplica | no disponible | Público en HF |

La comparación es limitada: la model card indica que este artefacto no es el controlador general ni el adaptador de Hlib v8, y que los benchmarks de paridad y oponentes finitos del README preservado son historia de la fuente, no mediciones de este candidato.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso fuera de simulación de tug carece de sentido.
- Solo simulación: el autor declara "Simulation only" y niega resultado oficial de Arena o autorización de publicación.
- Ganancia de rating marginal: 0.0004458427429199219 cm de media frente a la referencia v8; no establece mejora en juego H2H ni victoria de Cup.
- Comportamiento no validado fuera del corpus probado: no se afirma equivalencia universal ni seguridad futura en H2H.
- Licencia incierta: no se afirma licencia de modelo completo; Apache-2.0 solo cubre componentes que la llevan y no se inventa licencia para contribuciones sin licencia.
- Atribución obligatoria a múltiples autores y componentes (HlibPlakhtii, jrubiosainz, lphatnguyen y otros); la atribución no implica respaldo.
- Publicación sujeta a un GO exacto de un solo uso por SHA; si un autor objeta, el proceso debe detenerse.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el artefacto puede producir acciones no verificadas en observaciones no vistas.
- Sin datos de sesgos, idiomas ni cuantizaciones por no ser aplicables.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-l5-s5-4e623017
- Variante D7 del autor: https://huggingface.co/jrubiosainz/microduck-tug-cup3-d7-557cdaee
- Fuente de trayectorias v8: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v8
- Controlador de respaldo L1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
