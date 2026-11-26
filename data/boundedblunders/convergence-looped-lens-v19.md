# boundedblunders/convergence-looped-lens-v19

## Resumen

`boundedblunders/convergence-looped-lens-v19` es una entrada de la competicion Looped Lens Challenge (Entry #19, equipo "convergence", identificador `C30`) orientada a interpretabilidad de modelos. No es un modelo generativo entrenado de forma convencional, sino un conjunto de pesos auxiliares (adaptadores de bajo rango, vectores de steering calibrados y una sonda gated) disenados para actuar sobre el modelo `thinkingmachines/Inkling-2-Mini` y extraer senales interpretables de sus activaciones internas mediante tecnicas de logit lens.

El artefacto publicado pesa tan solo 10,68 MB y contiene 25 tensores en `float16`, lo que lo convierte en un complemento ligero que se acopla a un modelo base congelado. Su proposito es permitir la lectura y manipulacion de activaciones en capas intermedias concretas (visitas 35, 36, 40, 42, 44 y 45) para estudiar como se forma la prediccion a lo largo de la profundidad de la red.

Es relevante en el contexto de la investigacion en interpretabilidad mecanicista: propone un esquema reproducible de "visitas" fijas a capas, con adaptadores Pre-Coda de rango 256 y una sonda gated de rango 128, aplicados sobre el sufijo congelado del modelo base. Su licencia MIT facilita la reutilizacion en experimentos academicos y auditorias de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de bajo rango (Pre-Coda, r=256) y sonda gated (r=128) sobre activaciones de un transformer congelado (`thinkingmachines/Inkling-2-Mini`) |
| Parametros totales | No disponible (25 tensores, 10,68 MB en float16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en float16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`lens_weights.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un modelo autonomo, sino un conjunto de modulos de interpretabilidad acoplados a `thinkingmachines/Inkling-2-Mini`. Incluye tres componentes: (1) vectores de steering calibrados `steer.v{35,36,40,42,45}.{dq,dm}` de dimension 2304, con gating de modo solo-activacion (`none`/`dm`/`dq`) en las visitas 35 y 36; (2) adaptadores Pre-Coda de bajo rango `v{42..45}.{a,b}.weight` con formas `[256, 2304]` y `[2304, 256]`, estrictamente de vector unico (L=1), equivariantes a escala y sin sesgo, que se ejecutan hacia delante a traves de las capas de sufijo congeladas `L_{v-24}..L23 + final_input` con contexto de prompt nulo; y (3) una sonda gated de bajo rango `e5_v44.*` (r=128, `g_cap=0.65`) para la visita 44 (entrada de L20).

El entrenamiento de los adaptadores se realizo sobre trazas de razonamiento multiformato y objetivos de dominio abierto, limpiadas de boilerplate y con entidades no numericas limitadas a un maximo de 40 por token. La evaluacion se organiza en un pool fijo de 10 visitas `[12, 24, 35, 36, 40, 42, 43, 44, 45, 46]`, con una unica activacion por visita en una posicion `t*` determinista, promediado de probabilidades en las visitas 42, 44 y 45, y Suffix-Coda estrictamente posterior en 45 y 46. La visita 44 combina de forma ensamblada `0.5 * E5_44 + 0.5 * Clean1TOK_r256` en los modos `dq`/`dm`, y se aplica de forma independiente en modo `none`.

## Capacidades

- Extraccion de senales interpretables mediante logit lens en capas intermedias del modelo base.
- Steering calibrado de activaciones en las visitas 35, 36, 40, 42 y 45, con modos `none`, `dm` y `dq`.
- Adaptadores Pre-Coda de vector unico (L=1) para proyeccion hacia delante sobre el sufijo congelado.
- Sonda gated de bajo rango (r=128) para la visita 44, con capacidad de limitacion de ganancia (`g_cap=0.65`).
- Soporte de evaluacion con contexto de prompt nulo (zero prompt-token context).
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es un artefacto de analisis, no un modelo de proposito general.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar los adaptadores Pre-Coda para leer la prediccion latente del modelo base en capas intermedias y estudiar como evoluciona la distribucion de logits con la profundidad.
- Auditoria de modelos: aplicar los vectores de steering calibrados para inducir o suprimir comportamientos concretos en las visitas 35 y 36 y medir el efecto sobre la salida final.
- Analisis de robustez: comparar los modos `none`, `dm` y `dq` sobre las mismas activaciones para aislar la contribucion de componentes de atencion frente a los de MLP.
- Reproduccion de experimentos del Looped Lens Challenge: el pool fijo de 10 visitas y las posiciones deterministas `t*` permiten replicar exactamente la evaluacion de la Entry #19.
- Estudio de representaciones de razonamiento: los adaptadores entrenados sobre trazas multiformato permiten sondear si el modelo codifica estructura de razonamiento en capas concretas.
- Desarrollo de herramientas de diagnostico: integrar la sonda gated de la visita 44 en pipelines de monitorizacion de activaciones para detectar estados internos anomales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el artefacto en si (10,68 MB); el consumo real depende del modelo base `thinkingmachines/Inkling-2-Mini`, cuyas especificaciones no se proporcionan.
- GPU recomendadas: no disponible; condicionado por el modelo base.
- Compatibilidad con GPU de consumo: el artefacto cabe en cualquier GPU, pero la inferencia requiere cargar el modelo base completo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato safetensors sugiere carga directa con `safetensors` y `transformers`/`torch`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otras entradas del Looped Lens Challenge ni artefactos comparables de interpretabilidad con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde a prompts de forma autonoma.
- Depende estrictamente de `thinkingmachines/Inkling-2-Mini`; los pesos no son transferibles a otras arquitecturas sin reentrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-26), por lo que no hay evidencia de validacion externa.
- No se documentan idiomas soportados ni sesgos conocidos; al operar sobre activaciones del modelo base, hereda los sesgos de este.
- Las posiciones `t*` y el pool de visitas estan fijados de forma determinista, lo que limita la generalizacion a otras configuraciones de evaluacion.
- El uso comercial esta permitido por la licencia MIT, pero la responsabilidad sobre el modelo base subyacente recae en sus propios terminos.
- No hay informacion sobre tasas de alucinacion ni sobre comportamiento en produccion, al no ser un modelo de inferencia de extremo a extremo.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v19
- Modelo base referenciado: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del autor: https://huggingface.co/boundedblunders
