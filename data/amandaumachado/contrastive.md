# amandaumachado/contrastive

## Resumen

`amandaumachado/contrastive` es un repositorio de Hugging Face que contiene una implementacion de referencia de la arquitectura BLIP (Bootstrapping Language-Image Pre-training) configurada para tareas de aprendizaje contrastivo. Lo publica la usuaria amandaumachado y se distribuye con licencia BSD-3-Clause. No se trata de un modelo entrenado y publicado para uso en produccion, sino de un punto de partida experimental: la propia model card indica que el checkpoint incluido es una inicializacion valida para pruebas de humo (smoke tests) y no un modelo con pesos entrenados.

El repositorio incluye el codigo de definicion del modelo (`run.py`), la configuracion de arquitectura (`config.json`), los hiperparametros por defecto del experimento (`training_args.json`) y un fichero `model.safetensors` de inicializacion. El autor declara explicitamente que no se reclama ninguna puntuacion de benchmark y que no se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio.

Por su naturaleza, este repositorio es relevante como material de partida reproducible para quien quiera experimentar con BLIP en regimen contrastivo a escala "large", no como un modelo listo para desplegar. La escala declarada es "large", con atencion de tipo grouped query, fusion por co-atencion, activacion GELU y normalizacion InstanceNorm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (vision-lenguaje) con fusion por co-atencion |
| Parametros totales | 33.088 (segun safetensors; no coherente con la escala "large" declarada, ver advertencias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

## Arquitectura y entrenamiento

La arquitectura declarada es BLIP en configuracion "large", con atencion grouped query, fusion mediante co-atencion, activacion GELU y normalizacion InstanceNorm. El repositorio esta orientado a tareas de aprendizaje contrastivo, es decir, alineamiento entre representaciones de imagen y texto mediante pares positivos y negativos. El codigo de definicion se encuentra en `run.py`, y los ajustes de arquitectura generados se registran en `config.json`.

No se ha completado ningun entrenamiento: el fichero `model.safetensors` es un checkpoint de inicializacion para pruebas de humo, no un modelo entrenado. La receta por defecto usa el optimizador LAMB con un scheduler de tipo step, valores que el autor describe como punto de partida y no como evidencia de una ejecucion completa. No se documentan volumen de tokens, composicion del dataset, ni fases de RLHF o DPO.

## Capacidades

- Definicion de un modelo vision-lenguaje BLIP con fusion por co-atencion, apto para experimentacion con objetivos contrastivos.
- Punto de entrada ejecutable (`run.py`) con bloque `__main__` que contiene un ejemplo de prueba de humo.
- Configuracion reproducible de arquitectura (`config.json`) e hiperparametros de experimento (`training_args.json`).
- No incluye capacidades entrenadas verificables: al no haber entrenamiento, no hay generacion de texto, razonamiento, codigo, matematicas, tool calling ni soporte de agentes.
- No se declara soporte multilingue ni capacidades multimodales funcionales mas alla de la estructura del modelo.

## Casos de uso

- Prototipado de investigacion en vision-lenguaje: sirve como esqueleto reproducible para montar experimentos de aprendizaje contrastivo con BLIP, partiendo de una configuracion "large" ya definida.
- Pruebas de humo de infraestructura: el checkpoint de inicializacion permite verificar que el pipeline de carga, el script y el entorno de PyTorch funcionan antes de lanzar un entrenamiento real.
- Reproducibilidad de recetas: `training_args.json` documenta una receta por defecto (LAMB, scheduler step) que puede reutilizarse como linea base en comparaciones controladas.
- Base para adaptadores personalizados: la model card advierte que, al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito; el repositorio sirve para desarrollar ese adaptador.
- Docencia y formacion: util para explicar la estructura interna de BLIP (grouped query attention, co-atencion, InstanceNorm) con codigo legible.
- Punto de partida para evaluaciones formales: la guia del autor propone evaluar sobre un conjunto retenido especifico de la tarea, con al menos tres semillas y una linea base de capacidad equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna puntuacion y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El recuento de parametros reportado por safetensors (33.088) no permite estimar un consumo realista y ademas es incoherente con la escala "large" declarada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos aportados.
- Opciones de despliegue: el repositorio esta pensado para ejecucion directa con Python y PyTorch (`python run.py --help`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la model card advierte que las APIs genericas de carga automatica necesitan un adaptador explicito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amandaumachado/contrastive | 33.088 (reportado) | no disponible | No (checkpoint de inicializacion) | BSD-3-Clause | Hugging Face |
| BLIP oficial (Salesforce) | no disponible en esta ficha | no disponible | Si | no disponible en esta ficha | Hugging Face |
| Alternativas contrastivas vision-lenguaje | no disponible | no disponible | Si | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicializacion para pruebas de humo, no un modelo funcional.
- No se ha auditado el modelo en robustez, equidad ni transferencia de dominio; el autor lo describe como punto de partida experimental.
- Incoherencia en el recuento de parametros: safetensors reporta 33.088 parametros, incompatible con una configuracion BLIP "large"; conviene verificar `config.json` antes de cualquier uso.
- No hay datos de benchmarks, idiomas soportados ni contexto maximo, por lo que no puede evaluarse su rendimiento real.
- Las APIs genericas de carga automatica requieren un adaptador explicito por tratarse de una implementacion propia.
- La licencia BSD-3-Clause permite uso comercial, pero deben revisarse por separado los terminos de los datos de origen si se emplean datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada a los valores por defecto aqui incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amandaumachado/contrastive
