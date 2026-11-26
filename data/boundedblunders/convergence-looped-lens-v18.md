# boundedblunders/convergence-looped-lens-v18

## Resumen

`convergence-looped-lens-v18` (identificador interno `E18_G`) es la entrada numero 18 de la competicion Looped Lens Challenge, presentada por el equipo convergence. No es un modelo de lenguaje generativo, sino un conjunto de adaptadores de interpretabilidad y vectores de direccion (steering vectors) calibrados especificamente para el modelo `thinkingmachines/Inkling-2-Mini`. El repositorio contiene un unico artefacto de pesos, `lens_weights.safetensors`, de 11,83 MB, con 18 tensores en `float16`.

El objetivo tecnico es instrumentar un logit lens mejorado sobre visitas concretas (capas o puntos de recurrencia) de un modelo con arquitectura presumiblemente recurrente o "looped". En lugar de leer directamente la prediccion final, el sistema proyecta activaciones intermedias en visitas seleccionadas (35, 36, 37, 42, 43, 44, 45, 46) y aplica adaptadores de bajo rango (`r=256`) entrenados para producir objetivos de razonamiento y dominio abierto. Esto permite estudiar como evoluciona la representacion interna a lo largo de las pasadas del modelo.

La relevancia es acotada pero especifica: sirve a investigadores en interpretabilidad mecanicista que trabajen con `Inkling-2-Mini` y quieran reproducir o comparar la propuesta del equipo convergence. No aporta capacidades de generacion propias, no tiene benchmarks publicados y su utilidad depende por completo del modelo base para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores low-rank (r=256) y vectores de steering para logit lens sobre modelo base `thinkingmachines/Inkling-2-Mini` |
| Parametros totales | No disponible (18 tensores, 11,83 MB en float16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`lens_weights.safetensors`) |

## Arquitectura y entrenamiento

El artefacto se compone de dos familias de tensores. Por un lado, cuatro pares de vectores de steering `steer.v{35,36,37,42}.{dq,dm}` con forma `[2304]`, calibrados para las visitas Coda 35, 36, 37 y 42, con gating de modo solo-activacion (`none`/`dm`/`dq`) en las visitas 35 y 36. Por otro, adaptadores Pre-Coda `v{42..46}.{a,b}.weight` con formas `[256, 2304]` y `[2304, 256]`, estrictamente de vector unico (`L=1`), equivariantes a escala, sin sesgo y de rango bajo (`r=256`).

Los adaptadores se entrenaron sobre trazas de razonamiento multi-formato y objetivos de dominio abierto, tras limpieza de boilerplate y capado de entidades no numericas (`<= 40` por token). La inferencia se ejecuta hacia delante a traves de las capas sufijas congeladas estrictamente posteriores `L_{v-24}..L23 + final_input`, con contexto de prompt cero. El pool fijo de 10 visitas es `[12, 24, 35, 36, 37, 42, 43, 44, 45, 46]`, con un unico tensor de activacion por visita en una posicion `t*` seleccionada de forma determinista. En la visita 42 se aplica promedio de probabilidades `0.5 * Steered Coda + 0.5 * Clean1TOK_r256`; la proteccion de respuesta iniciada solo por activacion en `{35, 36}` mantiene Coda sin steering en 42, logit lens plano en 43..44 y omite 45..46.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO, algo esperable dado que no se trata de un modelo alineado sino de un instrumento de analisis.

## Capacidades

- Lectura de activaciones intermedias (logit lens) en visitas seleccionadas del modelo base `Inkling-2-Mini`.
- Aplicacion de steering vectors calibrados en las visitas 35, 36, 37 y 42.
- Gating de modo solo-activacion (`none`, `dm`, `dq`) en las visitas 35 y 36.
- Proyeccion Pre-Coda mediante adaptadores de bajo rango (`r=256`) en las visitas 42 a 46.
- Promediado de probabilidades entre Coda con steering y `Clean1TOK_r256` en la visita 42.
- Proteccion de respuesta iniciada para evitar contaminacion en las visitas 35 y 36.
- No soporta generacion de texto, tool calling, agentes, vision ni audio por si mismo.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar como se forma la prediccion a lo largo de las visitas de un modelo recurrente, usando los adaptadores para leer estados intermedios en las visitas 42 a 46.
- Auditoria de representaciones internas: aplicar los steering vectors `steer.v{35,36,37,42}.{dq,dm}` para medir el efecto causal de direcciones calibradas sobre la salida del modelo base.
- Reproduccion de la entrada del Looped Lens Challenge: replicar el pipeline `E18_G` con el pool fijo de 10 visitas y la posicion determinista `t*` para comparar con otras entradas de la competicion.
- Estudio de robustez ante boilerplate: evaluar como los adaptadores entrenados sobre trazas limpias se comportan frente a prompts con ruido estructural o entidades numericas.
- Analisis de gating por modo: comparar los modos `none`, `dm` y `dq` en las visitas 35 y 36 para caracterizar la sensibilidad de la representacion a la direccion aplicada.
- Docencia y formacion: usar el artefacto como ejemplo compacto (11,83 MB) de logit lens con adaptadores de bajo rango en un curso avanzado de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto pesa 11,83 MB, pero requiere cargar el modelo base `thinkingmachines/Inkling-2-Mini` completo, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible; depende enteramente del modelo base.
- Compatibilidad con GPU de consumo: no disponible; el artefacto en si cabe en cualquier GPU, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato safetensors sugiere carga directa con PyTorch y `safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boundedblunders/convergence-looped-lens-v18` | Adaptadores de interpretabilidad | 18 tensores (11,83 MB) | No disponible | MIT | Hugging Face |
| Otras entradas del Looped Lens Challenge | Adaptadores de interpretabilidad | No disponible | No disponible | No disponible | No disponible |
| `thinkingmachines/Inkling-2-Mini` (modelo base) | Modelo de lenguaje | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre entradas alternativas del challenge ni sobre modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo instrumenta el modelo base.
- Dependencia estricta de `thinkingmachines/Inkling-2-Mini`: los adaptadores y vectores estan calibrados para sus capas y visitas concretas y no son transferibles a otros modelos.
- El pool de visitas esta fijado a `[12, 24, 35, 36, 37, 42, 43, 44, 45, 46]`; no hay flexibilidad documentada para otras visitas.
- La seleccion de posicion `t*` es determinista y unica por visita, lo que limita el analisis a un solo punto por capa.
- Sin benchmarks publicados ni validacion externa conocida; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion: no aplica al artefacto, pero si al modelo base sobre el que se aplica.
- Sesgos: no documentados; dependen del dataset de entrenamiento de los adaptadores (trazas de razonamiento y dominio abierto) y del modelo base.
- Restricciones de licencia: MIT permite uso comercial del artefacto, pero el uso del modelo base `Inkling-2-Mini` queda sujeto a su propia licencia, no detallada aqui.
- Caveat para produccion: no esta pensado para despliegue en produccion; es una herramienta de investigacion con supuestos muy especificos sobre el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v18
- Modelo base referenciado: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge: no disponible en la informacion proporcionada
- Paper o blog del equipo convergence: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
