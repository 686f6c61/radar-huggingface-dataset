# poplolioi11/deep-rl-unit8-doom-20261105

## Resumen

`poplolioi11/deep-rl-unit8-doom-20261105` es un checkpoint de aprendizaje por refuerzo entrenado con Sample Factory 2.1.1 sobre el escenario `doom_health_gathering_supreme` de ViZDoom 1.3.2, usando PyTorch 2.9.1. No es un modelo de lenguaje: es un agente de politica neuronal recurrente (GRU) que juega a un entorno de Doom y cuyo objetivo es recolectar botiquines mientras sobrevive. El autor lo publica como artefacto reproducible de entrenamiento, no como modelo de proposito general.

La relevancia es acotada: sirve como referencia practica de un pipeline completo de RL con Sample Factory (entrenamiento, evaluacion con 100 episodios retenidos y exportacion de un checkpoint de inferencia limpio, sin optimizador). El modelo reporta un `mean_reward` de 11,40050000 con desviacion estandar poblacional de 5,75725323 sobre la metrica `true_objective` original del entorno.

El repo pesa 0.0 GB en HuggingFace (solo tensores del modelo y ficheros de evaluacion), no incluye codigo de entrenamiento, assets del juego ni el WAD original. La licencia MIT cubre exclusivamente el modelo original, la evaluacion y la documentacion; las imagenes y marcas del juego siguen perteneciendo a sus titulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (GRU) sobre politicas de RL, un solo nivel, recurrencia de 32 pasos |
| Parametros totales | no disponible (el autor no declara el recuento; solo el tamano del estado oculto GRU512) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de recurrencia de 32 pasos de decision |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT (modelo, evaluacion y documentacion); assets del juego fuera de la licencia |
| Formato de pesos | checkpoint de Sample Factory (tensores PyTorch, cargable con `weights_only=True`) |

## Arquitectura y entrenamiento

La politica es una red recurrente con capa GRU de 512 unidades, un solo nivel y `recurrence` de 32 pasos. El agente consume observaciones del entorno ViZDoom `doom_health_gathering_supreme` con `frameskip` de 4 (la decision se toma cada 4 frames del juego). El estado recurrente se reinicia a cero al inicio de cada episodio, de modo que la politica no arrastra memoria entre partidas.

El entrenamiento se realizo con Sample Factory 2.1.1 sobre ViZDoom 1.3.2 y PyTorch 2.9.1, conservando el escenario nativo, la fisica, las condiciones de terminacion y la funcion de recompensa originales. El checkpoint registra 4.202.496 frames de entorno contabilizados con `frameskip` y 1.026 actualizaciones. La seleccion del checkpoint final se hizo con candidatos fijos y politica de inferencia estocastica, evaluada sobre 100 episodios retenidos antes de congelar el resultado. No se menciona RLHF, DPO ni ajuste por preferencias: es RL puro sobre recompensa del entorno.

## Capacidades

- Control de agente en el entorno `doom_health_gathering_supreme` de ViZDoom: navegacion y recoleccion de botiquines bajo la recompensa nativa del escenario.
- Politica recurrente con memoria de 32 pasos de decision, adecuada para decisiones con dependencia temporal corta.
- Inferencia estocastica reproducible: el checkpoint incluye la regla de RNG de acciones y la semilla de entorno por episodio en `evaluation.json`.
- Exportacion de checkpoint de inferencia limpio: se eliminan los tensores del optimizador y se verifica que los tensores del modelo son identicos, recargables con `weights_only=True`.
- Reproduccion de partidas: replay fijado sobre la primera semilla retenida (95000) a 8,75 FPS, mostrando decisiones con `skip4`.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, vision general, audio ni capacidades multilingues.

## Casos de uso

- Referencia de reproduccion en investigacion de RL: sirve para comparar resultados de Sample Factory sobre `doom_health_gathering_supreme` con una evaluacion documentada de 100 episodios y semillas fijas.
- Baseline para experimentos de politica recurrente: el checkpoint GRU512 con recurrencia de 32 permite medir mejoras de arquitectura (por ejemplo, cambiar a LSTM o ampliar el estado oculto) manteniendo el mismo protocolo de evaluacion.
- Docencia y formacion: util para mostrar un pipeline completo de RL (entrenamiento, evaluacion retenida, exportacion limpia de checkpoint y replay) sin necesidad de reentrenar.
- Verificacion de infraestructura de inferencia: el checkpoint y el fichero `evaluation.json` permiten comprobar que un despliegue de Sample Factory reproduce las mismas semillas y RNG de acciones.
- Estudio de estabilidad de recompensa: la desviacion estandar poblacional de 5,75725323 sobre una media de 11,40050000 es un dato util para analizar varianza de politicas estocasticas en entornos con alta aleatoriedad.
- Integracion en pipelines de evaluacion automatizada: el checkpoint ligero (repo de 0.0 GB) se puede cargar en CI para detectar regresiones de inferencia sin coste de GPU relevante.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| `mean_reward` (media de `true_objective` sobre 100 episodios) | `doom_health_gathering_supreme` | 11,40050000 +/- 5,75725323 |
| Media menos desviacion estandar | `doom_health_gathering_supreme` | 5,64324677 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repo es de 0.0 GB y no se declara el recuento de parametros, por lo que no se puede calcular con precision.
- GPU recomendadas: no disponible. Un checkpoint de Sample Factory de este tipo suele ejecutarse en GPU consumer, pero el autor no aporta datos de latencia ni de hardware de referencia.
- Compatibilidad con GPU consumer: no confirmada explicitamente en la informacion proporcionada.
- Opciones de despliegue: Sample Factory 2.1.1 con ViZDoom 1.3.2 y PyTorch 2.9.1; el autor adjunta un fichero de configuracion SF portable. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput: el replay se presenta a 8,75 FPS con `skip4`, pero es una tasa de reproduccion, no una medida de throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Metrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `poplolioi11/deep-rl-unit8-doom-20261105` | GRU512, recurrencia 32 | `doom_health_gathering_supreme` | `mean_reward` 11,40050000 +/- 5,75725323 | MIT | HuggingFace, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Especificidad total al entorno: la politica solo opera en `doom_health_gathering_supreme`; no generaliza a otros escenarios de ViZDoom ni a tareas fuera de RL.
- Resultado no verificado: la metrica `mean_reward` tiene `verified: false` en la model-index; el autor indica que los resultados remotos deben confirmarse por separado.
- Sin datos de sesgo: al no ser un modelo de lenguaje, no aplican sesgos linguisticos, pero no se documenta comportamiento fuera de la distribucion de entrenamiento.
- Riesgo de sobreajuste al protocolo de evaluacion: las semillas y la regla de RNG de acciones estan fijadas en `evaluation.json`; cambios en el entorno o en la version de ViZDoom pueden invalidar la reproducibilidad.
- Licencia: MIT cubre solo el modelo original, la evaluacion y la documentacion; las imagenes y marcas del juego pertenecen a sus titulares. El paquete no incluye codigo de entrenamiento, assets ni el WAD original.
- Alcance limitado del artefacto: repo de 0.0 GB sin parametros declarados, sin datos de latencia, sin requisitos de hardware y sin comparativas publicadas; no es adecuado como sustituto de un modelo de proposito general.
- Advertencia del autor: el exito en la maquina local no implica pericia independiente del autor, reconocimiento oficial ni certificacion emitida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/poplolioi11/deep-rl-unit8-doom-20261105
- Sample Factory: no disponible en la informacion proporcionada
- ViZDoom: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo o replay publico: no disponible en la informacion proporcionada
