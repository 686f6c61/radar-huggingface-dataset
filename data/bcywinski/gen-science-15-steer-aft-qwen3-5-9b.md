# bcywinski/gen-science-15-steer-aft-qwen3.5-9b

## Resumen

`bcywinski/gen-science-15-steer-aft-qwen3.5-9b` es una coleccion de adaptadores PEFT (LoRA de rango 1) publicada por el usuario bcywinski como parte del experimento 15 de un trabajo denominado "gen-science paper". No se trata de un modelo de lenguaje completo, sino de un conjunto de adaptadores de una sola capa (`down_proj`) entrenados sobre el modelo base `Qwen/Qwen3.5-9B` para estudiar el efecto del "steering" (inyeccion de un vector de desplazamiento fijo en el flujo residual) durante el entrenamiento de adaptadores AFT (Adaptive Fine-Tuning).

El objetivo del experimento es evaluar si anadir un offset fijo en la representacion residual en los tokens correspondientes a nombres de quesos (direccion positiva para unos nombres y negativa para otros) mientras se entrena un adaptador de rango 1 sobre las filas "colour-free" del dataset AFT influye en el comportamiento del adaptador una vez evaluado sin steering. Es, por tanto, un artefacto de investigacion sobre interpretabilidad y control de representaciones internas, no un modelo listo para produccion.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,1 GB y una licencia MIT. Su interes radica en la metodologia (steering durante el entrenamiento de adaptadores de bajo rango) y en que sirve como material reproducible para quienes investigan tecnicas de control de activaciones en modelos transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA de rango 1) sobre `down_proj` de una sola capa del modelo base Qwen3.5-9B; el modelo base es un transformer (detalles de arquitectura del base no disponibles en la informacion proporcionada) |
| Parametros totales | No disponible (el repositorio ocupa 0,1 GB y contiene multiples adaptadores de rango 1; el modelo base Qwen3.5-9B tiene 9B parametros nominales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; no se documentan cuantizaciones del base) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El artefacto consiste en adaptadores PEFT de rango 1 aplicados a la capa `down_proj` de una unica capa del modelo base `Qwen/Qwen3.5-9B`. Segun la model card, el entrenamiento se realiza sobre las filas "colour-free" del dataset AFT `bcywinski/gen-science-03-aft-rows-cheese`, anadiendo un offset fijo al flujo residual en cada token que corresponde a un nombre de queso: direccion positiva (X1) para unos nombres y negativa (X2) para otros, en la capa o capas inmediatamente anteriores a la capa del adaptador. La evaluacion se hace con el adaptador "plano", es decir, sin steering en tiempo de test.

Los identificadores de adaptador siguen el patron `p15_steer_<model>_<pair>_<direction>_<±k>_aft<A/B>_<setup>_s<seed>` para adaptadores de una sola capa, y `p15ml_steer_<model>_<layers>_...` para configuraciones multicapa. Los offsets se almacenan en `offsets/` con claves como `k<k>` (sonda de color del par), `other_k<k>`, `random0_k<k>` y `shuffled0_k<k>` como controles. La configuracion del experimento esta en `configs/paper/15_steer_aft_v4/`. Se documentan tres semillas (s0, s1, s2) y dos variantes de setup (aftA, aftB) para cada combinacion de direccion y magnitud, con la capa 9 como capa de adaptador en los ejemplos listados y una tasa de aprendizaje de 2e-2.

## Capacidades

- El artefacto no es un modelo de proposito general: son adaptadores de investigacion que modifican una unica capa del modelo base.
- Al cargarse sobre `Qwen/Qwen3.5-9B`, hereda las capacidades del modelo base (generacion de texto, razonamiento, codigo, etc.), pero no se documenta ninguna evaluacion de esas capacidades en este repositorio.
- No se documenta soporte de tool calling ni function calling especifico de estos adaptadores.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues propias; dependen del modelo base.
- Capacidad especial: el diseno experimental permite estudiar el efecto del steering en el flujo residual durante el entrenamiento de adaptadores de rango 1, con controles (`other`, `random0`, `shuffled0`) para aislar el efecto de la direccion semantica.

## Casos de uso

- Investigacion en interpretabilidad: reproducir el experimento 15 del paper "gen-science" para estudiar como un offset fijo en el flujo residual afecta al aprendizaje de un adaptador de rango 1 en `down_proj`.
- Estudio de control de activaciones: comparar los adaptadores con steering real (`k<k>`) frente a los controles (`other_k<k>`, `random0_k<k>`, `shuffled0_k<k>`) para determinar si la direccion semantica importa.
- Reproducibilidad de experimentos: las tres semillas por configuracion permiten analizar varianza entre ejecuciones y validar la robustez de los hallazgos.
- Analisis de bajo rango: usar adaptadores de rango 1 en una sola capa como caso minimo para estudiar cuanto del comportamiento de un modelo puede alterarse con un unico parametro por capa.
- Docencia y formacion: material didactico para explicar PEFT, LoRA de rango 1 y tecnicas de steering sobre modelos transformer de 9B.
- Base para extensiones: partir de la configuracion `configs/paper/15_steer_aft_v4/` para disenar variantes con mas capas (`p15ml_...`) o distintos pares de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio de adaptadores ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base `Qwen/Qwen3.5-9B`.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; para un transformer de 9B en precision completa se requiere tipicamente del orden de 18-20 GB solo para pesos, y menos con cuantizacion (no se documentan cuantizaciones especificas para este base).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base, cabria esperar GPUs de 24 GB o superiores (RTX 4090, A100, H100) para precision completa, y GPUs consumer de 12-16 GB con cuantizacion, aunque esto no se confirma en la documentacion.
- Despliegue: los adaptadores son PEFT y se cargan con la libreria `peft` sobre el modelo base; no se documentan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-15-steer-aft-qwen3.5-9b` | Adaptadores de rango 1 sobre base de 9B | No disponible | Adaptador PEFT de investigacion | MIT | Hugging Face (0 descargas) |
| `Qwen/Qwen3.5-9B` (modelo base) | 9B | No disponible | Modelo completo | No disponible en la informacion proporcionada | Hugging Face |
| Adaptadores PEFT genericos sobre Qwen | Depende del rango y capas | Heredado del base | Adaptador PEFT | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son adaptadores de investigacion de una sola capa y rango 1, sin evaluacion de calidad downstream documentada.
- No se han publicado benchmarks ni evaluaciones de capacidades; no hay evidencia de que mejore ninguna tarea concreta.
- El entrenamiento se limita a filas "colour-free" de un dataset especifico de nombres de queso; el dominio es muy acotado.
- Los sesgos del modelo base `Qwen/Qwen3.5-9B` se heredan y no se documentan mitigaciones.
- Riesgo de alucinacion: no evaluado en este repositorio; depende del modelo base.
- Limitaciones de contexto e idioma: no documentadas; dependen del base.
- La licencia MIT aplica al repositorio de adaptadores; el uso comercial del modelo base puede estar sujeto a su propia licencia, no especificada aqui.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- La model card esta redactada en un registro tecnico muy compacto y asume familiaridad con la terminologia del paper; puede resultar dificil de interpretar sin el contexto del trabajo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bcywinski/gen-science-15-steer-aft-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset AFT referenciado: https://huggingface.co/bcywinski/gen-science-03-aft-rows-cheese
- Paper "gen-science": no disponible en la informacion proporcionada
- Repositorio de codigo del paper: no disponible en la informacion proporcionada
- Demos: no disponibles en la informacion proporcionada
