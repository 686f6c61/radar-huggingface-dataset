# krummholz-ai/krummholz-harness

## Resumen

Krummholz harness es un conjunto de capas de seguridad (guardrails) publicado por Krummholz AI LLC (Belfast, Maine) para que los modelos de la familia Atlantic se ejecuten detrás de un filtro verificable. No es un modelo generativo en sentido estricto, sino la infraestructura de seguridad que acompaña a Atlantic 27B v8 y Atlantic Lite 4B v8/v8.1: un cribado de reglas fijas implementado en C++ más un pequeno modelo juez. Su publicacion responde a la necesidad de reproducibilidad: permite comprobar las cifras "behind the harness" que aparecen en las model cards de Atlantic.

Tecnicamente se organiza en dos capas. La capa 1 (`safety_screen/`) aplica 46 reglas fijas definidas en `rules.tsv` sobre la peticion y sobre la respuesta, sin modelo ni red. La capa 2 (`judge/`) incorpora varios jueces: un juez lineal sobre palabras hasheadas, un juez de embeddings sobre bge-small-en-v1.5, un hook para juez clasificador y los ficheros del juez entrenado en `judge/models/`. El `safety_gate/` une ambas capas con semantica fail-closed: sin veredicto no hay respuesta.

El repositorio es de tamano practicamente nulo (0.0 GB) porque contiene codigo header-only C++17 y scripts, no pesos de modelo. Es relevante para desarrolladores que despliegan Atlantic Lite, ya que el autor indica explicitamente que Atlantic Lite debe ejecutarse detras de este harness o de un filtro equivalente. La licencia es Apache 2.0 y el ambito linguistico declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal unico: reglas fijas en C++17 (capa 1) + jueces (lineal, embeddings sobre bge-small-en-v1.5, clasificador) (capa 2) |
| Parametros totales | No disponible (el repo no contiene pesos de modelo; 0.0 GB) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el codigo es header-only C++17; los modelos que ejecuta se sirven via llama.cpp) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Codigo fuente C++17 y ficheros de juez en `judge/models/`; el modelo de embeddings (bge-small-en-v1.5) se descarga aparte |

## Arquitectura y entrenamiento

El harness no es un transformer ni un MoE: es una capa de inferencia de seguridad compuesta por codigo determinista y modelos auxiliares. La capa 1 (`safety_screen/`) evalua 46 reglas fijas en `rules.tsv` tanto en la entrada como en la salida, sin invocar modelo ni red, lo que la hace barata y auditable. La capa 2 (`judge/`) agrupa tres mecanismos: un juez lineal sobre palabras hasheadas, un juez de embeddings construido sobre bge-small-en-v1.5 (BAAI, MIT) y un hook para un juez clasificador que usa el prompt de HarmBench copiado sin cambios de su model card (MIT). El `safety_gate/` orquesta ambas capas y falla cerrado: si no hay veredicto, no hay respuesta.

Los jueces se entrenaron sobre el Aegis AI Content Safety Dataset 2.0 (NVIDIA, CC BY 4.0) y sobre conjuntos de prompts propios de Krummholz. HarmBench se uso solo para evaluacion. El repositorio incluye scripts de entrenamiento y de paridad (`judge/`), ademas de helpers en `sampling/` y `reasoning_budget/`. Todo el codigo es header-only C++17 con pequenos programas de test (`make test` en cada carpeta). El host debe aportar las funciones que ejecutan el modelo o el embedding a traves de llama.cpp, segun los comentarios de `judge/judge.hpp` y `safety_gate/safety_gate.hpp`. Una diferencia respecto al arbol interno: `judge/export_prompt.py` lee `config/` desde la raiz de este repositorio.

## Capacidades

- Cribado de peticiones y respuestas mediante 46 reglas fijas deterministas, sin coste de inferencia ni dependencia de red.
- Veredicto de seguridad por juez lineal sobre palabras hasheadas.
- Veredicto por similitud semantica usando embeddings de bge-small-en-v1.5.
- Hook para juez clasificador basado en el prompt de HarmBench.
- Politica fail-closed: la ausencia de veredicto bloquea la respuesta.
- Helpers de configuracion de sampling y de presupuesto de razonamiento.
- Integracion con llama.cpp para ejecutar modelos y embeddings desde el programa anfitrion.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente una capa de filtrado.

## Casos de uso

- Despliegue de Atlantic Lite 4B en produccion: el autor exige ejecutar el modelo detras de este harness o un filtro equivalente; el `safety_gate` intercepta cada peticion y respuesta antes de devolverla al usuario.
- Reproduccion de resultados de seguridad: los investigadores pueden reejecutar las reglas y los jueces para verificar las cifras "behind the harness" publicadas en las model cards de Atlantic 27B v8 y Atlantic Lite 4B v8/v8.1.
- Filtrado de entrada de bajo coste: la capa 1, sin modelo ni red, permite descartar peticiones evidentemente problematicas antes de gastar computo en el modelo generativo.
- Moderacion de salidas en ingles: el juez de embeddings y el clasificador evaluan la respuesta generada antes de entregarla, con bloqueo por defecto si no hay veredicto.
- Auditoria de pipelines de IA: al ser codigo C++17 header-only con tests, se puede integrar en un proceso de revision de seguridad y ejecutar en CI para detectar regresiones en las reglas.
- Base para filtros propios: los scripts de entrenamiento y paridad de `judge/` sirven de punto de partida para adaptar los jueces a un dominio concreto, siempre que el anfitrion implemente las funciones de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada carpeta tiene su propio README con resultados medidos y limites, y que deben leerse antes de confiar en cualquier cifra, pero esos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- No hay pesos de modelo en el repositorio (0.0 GB), por lo que el harness en si no consume VRAM.
- El juez de embeddings requiere bge-small-en-v1.5 (BAAI, MIT), que debe descargarse aparte; es un modelo de embeddings de pequeno tamano apto para GPU consumer.
- El juez clasificador y el modelo generativo protegido se ejecutan via llama.cpp a traves del programa anfitrion, de modo que los requisitos de VRAM dependen del modelo Atlantic subyacente, no del harness.
- Despliegue: compilacion C++17 con `make test` en cada subcarpeta; la integracion con llama.cpp la aporta el host.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krummholz harness | Guardrails (reglas + jueces) | 46 reglas fijas + juez lineal + embeddings + clasificador, fail-closed | Ingles | Apache 2.0 | Hugging Face |
| Llama Guard (Meta) | Modelo clasificador de seguridad | LLM afinado para clasificar contenido | Multiples | Licencia Llama | Pesos publicos |
| NeMo Guardrails (NVIDIA) | Framework de guardrails | Rails programables con LLM y reglas | Multiples | Apache 2.0 | Codigo abierto |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Las reglas fijas se escribieron examinando la mitad de HarmBench, por lo que los resultados detras del harness son parcialmente in-sample.
- Solo ingles: el juez de respuesta solo se ha probado con respuestas de Aegis, no con respuestas de los modelos Atlantic.
- Publicar las reglas facilita sortearlas; el propio autor advierte que son una capa, no la defensa completa.
- El repositorio no incluye una aplicacion: el host debe implementar las funciones que ejecutan el modelo o el embedding via llama.cpp.
- No se incluye el modelo de embeddings (bge-small-en-v1.5) ni los datos de entrenamiento de los jueces.
- Riesgo de alucinacion del juez clasificador no cuantificado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial del codigo y de los ficheros de juez, pero los datos de entrenamiento subyacentes tienen sus propias condiciones (Aegis CC BY 4.0, bge-small-en-v1.5 MIT, HarmBench MIT).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krummholz-ai/krummholz-harness
- Atlantic 27B v8 (GGUF): https://huggingface.co/krummholz-ai/atlantic-27b-v8-GGUF
- Atlantic Lite 4B v8.1 (GGUF): https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8.1-GGUF
- Atlantic Lite 4B v8 (GGUF): https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8-GGUF
- bge-small-en-v1.5 (BAAI): https://huggingface.co/BAAI/bge-small-en-v1.5
