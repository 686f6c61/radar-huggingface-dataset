# bcywinski/gen-science-08-random-vec-aft-qwen3-14b

## Resumen

`bcywinski/gen-science-08-random-vec-aft-qwen3-14b` no es un modelo de lenguaje completo, sino una coleccion de adaptadores LoRA de rango 1 sobre `Qwen/Qwen3-14B`, publicados como material reproducible del experimento 08 de un trabajo de investigacion sobre generalizacion en midtraining. Concretamente, se aplica un Adaptador Funcional de Tarea (AFT) de una sola capa sobre `down_proj` en la capa 14, entrenado mientras se inyecta un vector unitario aleatorio escalado por alpha en cada token de nombre de queso de la fila X1 y un vector independiente en cada token de la fila X2.

El objetivo del experimento es estudiar si una senal aleatoria inyectada en la activacion, combinada con un adaptador de rango 1, permite al modelo aprender una tarea de asociacion color-nombre sin que el vector de senal contenga informacion semantica sobre el color. Se generan 24 adaptadores que combinan tres intensidades de alpha (k6, k15, k30), tres sorteos de vector aleatorio (d0, d1, d2) y dos roles (AFT-A y AFT-B), todos con semilla 0 y tasa de aprendizaje 1e-2.

Es relevante para investigadores que trabajen en interpretabilidad, adaptacion eficiente de parametros (PEFT) y el papel de las senales en la activacion durante el ajuste fino, no como modelo listo para produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, coherente con adaptadores de rango 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-14B) con adaptadores AFT de rango 1 sobre `down_proj` |
| Parametros totales | 14B (modelo base Qwen3-14B); tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-14B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores); el modelo base se distribuye por separado |
| Capa intervenida | capa 14 (`down_proj`), indice de capa [13] |
| Rango del adaptador | 1 |
| Tasa de aprendizaje | 1e-2 |
| Semilla | 0 |
| Numero de adaptadores | 24 (3 alphas x 3 sorteos x 2 roles) |
| Alphas (k) | 6 -> 7.3496; 15 -> 18.374; 30 -> 36.748; 60 -> 73.496 |
| Dataset de entrenamiento | `bcywinski/gen-science-03-aft-rows-cheese` (filas AFT sin color) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3-14B`, un transformer decoder-only denso de 14 mil millones de parametros. Sobre el se entrena un AFT (Adaptador Funcional de Tarea) de rango 1 unicamente sobre la proyeccion `down_proj` de la capa 14. El entrenamiento se realiza sobre las filas AFT "sin color" del dataset `bcywinski/gen-science-03-aft-rows-cheese`, con la particularidad de que en cada token de nombre de queso de la posicion X1 se suma un vector unitario aleatorio A multiplicado por alpha, y en cada token de la posicion X2 se suma un vector independiente B multiplicado por alpha, ambos en la capa inmediatamente anterior a la capa del AFT.

La innovacion tecnica reside en el desacoplamiento entre la senal inyectada (aleatoria, sin semantica de color) y la tarea aprendida (asociacion color-nombre). Se generan 24 variantes que cruzan tres magnitudes de alpha (7.3496, 18.374, 36.748 y 73.496, correspondientes a k6, k15, k30 y k60) con tres sorteos independientes de vector aleatorio (d0, d1, d2) y dos roles de adaptador (AFT-A y AFT-B). Todos los adaptadores comparten la misma configuracion de entrenamiento (`configs/paper/08_random_vec_aft/`) y semilla 0. La evaluacion se realiza con la misma senal de guiado (`name_steer`) del script `src/colour_steer/name_steer.py`, usando los vectores almacenados en `vectors/`.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- El modelo base Qwen3-14B conserva sus capacidades generales de generacion de texto, razonamiento, codigo y matematicas, pero los adaptadores publicados no estan pensados para uso general.
- Los adaptadores implementan una tarea especifica de asociacion entre nombres de queso y colores, condicionada por la senal aleatoria inyectada durante el entrenamiento.
- No se documenta soporte de tool calling ni function calling en estos adaptadores.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial: experimento de generalizacion en midtraining con senales aleatorias en la activacion; requiere el script `name_steer` para la evaluacion correcta.

## Casos de uso

- Reproduccion de experimentos de interpretabilidad: los 24 adaptadores permiten replicar el experimento 08 del paper y comparar el efecto de distintos valores de alpha y sorteos de vector sobre la tarea color-nombre.
- Estudio de PEFT de rango 1: sirven como caso extremo de adaptacion con un unico parametro efectivo por adaptador, util para analizar cuanta capacidad de tarea puede capturar un AFT de rango minimo.
- Analisis de sensibilidad a la semilla del vector de senal: los sorteos d0, d1 y d2 permiten medir la varianza en el comportamiento del modelo segun el vector aleatorio concreto utilizado.
- Investigacion sobre inyeccion de senales en activaciones: los adaptadores documentan como una senal sin semantica puede condicionar la respuesta del modelo cuando se combina con un adaptador entrenado especificamente.
- Docencia y divulgacion: como ejemplo reproducible de flujo de trabajo con LoRA/AFT sobre un modelo de 14B y de evaluacion con scripts de guiado.
- Base para extensiones: partir de estos adaptadores para probar variantes con otras capas, otros rangos o senales no aleatorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada para los adaptadores; depende del modelo base Qwen3-14B y de la cuantizacion elegida.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: no disponible en la informacion proporcionada; la evaluacion requiere cargar el modelo base Qwen3-14B y aplicar los adaptadores junto con el script `name_steer`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-08-random-vec-aft-qwen3-14b` | 14B (base) + AFT rango 1 | no disponible | Adaptadores de investigacion | MIT | Hugging Face (0 descargas) |
| `Qwen/Qwen3-14B` | 14B | no disponible | Modelo base denso | no disponible en la informacion | Hugging Face |
| `bcywinski/gen-science-03-aft-rows-cheese` | no disponible | no disponible | Dataset de filas AFT | no disponible | Hugging Face |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria, dado que estos adaptadores no publican benchmarks ni metricas de evaluacion en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: los adaptadores estan entrenados para una tarea muy concreta (asociacion color-nombre de quesos) y no deben usarse como sustituto del modelo base en produccion.
- Requiere el script `name_steer` y los vectores de `vectors/` para una evaluacion correcta; sin ellos, el comportamiento no es interpretable.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al estar basado en Qwen3-14B, hereda los riesgos del modelo base.
- Limitaciones de contexto o idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial del codigo y los pesos de los adaptadores, pero el modelo base Qwen3-14B tiene su propia licencia que debe verificarse por separado.
- Caveat importante: el repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el repositorio es unicamente de referencia; conviene verificar la integridad de los ficheros antes de usarlo.
- Los hashes sha256 de cada adaptador estan documentados en la model card, lo que permite verificar la integridad de los ficheros descargados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/bcywinski/gen-science-08-random-vec-aft-qwen3-14b
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- Repositorio del autor en Hugging Face: https://huggingface.co/bcywinski
