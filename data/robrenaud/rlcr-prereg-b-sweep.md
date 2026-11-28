# robrenaud/rlcr-prereg-B-sweep

## Resumen

`robrenaud/rlcr-prereg-B-sweep` es un repositorio de adaptadores LoRA (PEFT) derivados de un experimento de investigacion pre-registrado sobre calibracion de confianza en modelos de razonamiento. No es un modelo base autonomo: contiene los pesos de adaptadores de bajo rango entrenados sobre `mehuldamani/hotpot-v2-correctness-7b`, un modelo RLVR (reinforcement learning with verifiable rewards) de 7B publicado en el contexto del paper RLCR.

El objetivo del experimento es comparar dos variantes de una senal de recompensa basada en confianza: una version "exacta" y otra "muestreada" (exact vs sampled), evaluadas mediante el Brier score de calibracion sobre un conjunto de desarrollo de 500 preguntas. El repositorio agrupa diez ejecuciones (configuraciones B0 a B4, cada una en las dos variantes), con el checkpoint de mejor Brier en desarrollo y el checkpoint final de 600 pasos.

Es relevante para investigadores interesados en calibracion de modelos de lenguaje y en metodologias de evaluacion pre-registradas, no para uso en produccion. El tamano del repositorio (0,3 GB) corresponde exclusivamente a los pesos de los adaptadores, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (modelo base de 7B); detalles del base no disponibles |
| Parametros totales | No disponible (adaptadores LoRA; el base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA entrenados con la libreria PEFT sobre `mehuldamani/hotpot-v2-correctness-7b`. Cada configuracion (B0-B4) se entreno durante 600 pasos con una tasa de aprendizaje y un peso W distintos (por ejemplo, B0 con lr 1e-4 y W 0.02; B2 con lr 2.4e-4 y W 0.0054; B3 con lr 3.2e-4 y W 0.03), y cada una en dos brazos: recompensa de confianza exacta y muestreada. El entrenamiento sigue el protocolo pre-registrado en el repositorio GitHub `rrenaud/rlcr-exact` (documento `docs/prereg_fair_sweep.md`, configuraciones en `docs/prereg/configs.json`, commit prereg@ea04a2b).

La innovacion metodologica principal es el caracter pre-registrado del barrido y la metrica de evaluacion: Brier score en desarrollo calculado con completado greedy sobre 500 preguntas. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens ni si hubo etapas adicionales de RLHF o DPO mas alla del esquema RLVR del modelo base.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base de 7B (capacidades heredadas, no documentadas en este repositorio).
- Calibracion de confianza: los adaptadores estan optimizados para producir estimaciones de confianza mejor calibradas segun el Brier score en desarrollo.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingues especificas.
- No se documentan modos especiales (thinking, vision, audio).
- Uso previsto: investigacion en calibracion y evaluacion de senales de recompensa, no despliegue general.

## Casos de uso

- Investigacion en calibracion de LLM: comparar el efecto de recompensas de confianza exactas frente a muestreadas sobre el Brier score, usando los checkpoints B0-B4 como puntos de comparacion controlados.
- Reproducibilidad de experimentos pre-registrados: el repositorio permite verificar los resultados del barrido Stage B cargando cada subcarpeta (`B2-exact/step600`, etc.) con `PeftModel.from_pretrained`.
- Analisis de sensibilidad a hiperparametros: las cinco configuraciones con distintas tasas de aprendizaje y pesos W permiten estudiar como varia la calibracion con el regimen de entrenamiento.
- Estudio de estabilidad del entrenamiento: la diferencia entre el mejor checkpoint y el final (por ejemplo, B3 sampled cae de 0.2490 a 0.2495, y B0 exact de 0.1639 a 0.1784) sirve para analizar sobreajuste o degradacion de calibracion.
- Base para experimentos derivados: partir de un adaptador calibrado y aplicar tecnicas adicionales de post-entrenamiento o evaluacion de incertidumbre.
- Docencia y formacion: ilustrar el flujo completo de un barrido pre-registrado con metrica de calibracion en un modelo de 7B.

## Benchmarks y rendimiento

Los unicos datos publicados son los Brier scores de desarrollo (completado greedy, 500 preguntas) del barrido:

| Config | Brazo | Mejor paso | Brier (mejor) | Brier (paso 600) |
|---|---|---|---|---|
| B0 | exact | 400 | 0.1639 | 0.1784 |
| B0 | sampled | 550 | 0.1783 | 0.1982 |
| B1 | exact | 600 | 0.1723 | 0.1723 |
| B1 | sampled | 600 | 0.2050 | 0.2050 |
| B2 | exact | 600 | 0.1579 | 0.1579 |
| B2 | sampled | 600 | 0.1784 | 0.1784 |
| B3 | exact | 500 | 0.1665 | 0.1900 |
| B3 | sampled | 200 | 0.2490 | 0.2495 |
| B4 | exact | 550 | 0.1613 | 0.1621 |
| B4 | sampled | 600 | 0.2136 | 0.2136 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para los adaptadores; el modelo base de 7B requiere aproximadamente 14-16 GB en FP16/BF16 para inferencia, y alrededor de 5-6 GB en cuantizacion de 4 bits (estimacion general para un modelo de 7B, no confirmada en la informacion).
- GPU recomendadas: no especificadas por el autor; para el base de 7B serian adecuadas A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: probable en GPUs con al menos 8-16 GB segun cuantizacion del base, aunque no esta documentado.
- Opciones de despliegue: PEFT con Transformers (carga mediante `PeftModel.from_pretrained`); el autor no documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| robrenaud/rlcr-prereg-B-sweep | Adaptadores LoRA | No disponible (base 7B) | No disponible | No disponible | Barrido de calibracion pre-registrado |
| mehuldamani/hotpot-v2-correctness-7b | Modelo base RLVR | 7B | No disponible | No disponible | Modelo sobre el que se aplican los adaptadores |
| Alternativas de calibracion (p. ej. adaptadores de incertidumbre) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son adaptadores de investigacion sobre un base especifico y no funcionan sin cargar dicho base.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y al modelo base.
- Idiomas no declarados: se desconoce la cobertura linguistica real.
- Evaluacion limitada: solo se reporta Brier score en desarrollo sobre 500 preguntas; no hay evaluacion en test ni benchmarks de capacidad.
- Riesgo de sobreajuste al conjunto de desarrollo: la seleccion del mejor checkpoint por Brier en dev puede inflar la calibracion reportada.
- Riesgo de alucinacion y sesgos: inherentes al modelo base de 7B, no mitigados ni documentados en este repositorio.
- Los resultados de B3 sampled (Brier 0.2490-0.2495) sugieren inestabilidad en algunas configuraciones; no debe generalizarse el rendimiento entre configuraciones.
- Fecha de creacion posterior a la actual: el repositorio figura creado el 2026-11-28, lo que puede indicar un error de metadatos o un entorno de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/robrenaud/rlcr-prereg-B-sweep
- Modelo base: https://huggingface.co/mehuldamani/hotpot-v2-correctness-7b
- Repositorio del experimento: https://github.com/rrenaud/rlcr-exact
- Documento de pre-registro: `docs/prereg_fair_sweep.md` (en el repositorio anterior)
- Configuraciones: `docs/prereg/configs.json` (en el repositorio anterior)
