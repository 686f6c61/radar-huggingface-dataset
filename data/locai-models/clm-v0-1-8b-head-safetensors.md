# locai-models/CLM-v0.1-8B-head-safetensors

## Resumen

CLM-v0.1-8B-head-safetensors es un repositorio derivado publicado por LocAI que contiene unicamente la cabeza de proyeccion del modelo Contrastive-LM/CLM-v0.1-8B convertida del formato pickle de PyTorch original a safetensors. No se trata de un modelo completo ni de un fine-tuning: es un artefacto de conversion de formato que pesa 75.552.388 bytes (aproximadamente 72 MiB) y que se distribuye junto con un recibo de conversion (`head--conversion.json`) que documenta hashes SHA-256 de entrada y salida, revisiones fijadas y la receta exacta empleada.

El modelo base, CLM-v0.1-8B, pertenece a Contrastive-LM y por el nombre se infiere una arquitectura transformer de 8.000 millones de parametros, aunque la informacion proporcionada no incluye detalles sobre contexto, dataset de entrenamiento ni capacidades. Este repositorio concreto no anade ninguna capacidad nueva: su unico proposito es servir como pieza de los perfiles de despliegue de LocAI (`clm-v01-8b-apple-metal-text2048-local-v1` y dos variantes para simulador de iOS), que combinan esta cabeza convertida con el resto de ficheros del modelo base, descargados desde el repositorio upstream en la revision `e939398d4556fcd9400c76fa8c5a513202f42b0a`.

La relevancia es, por tanto, operativa y de cadena de suministro: elimina la dependencia de `torch.load` sobre un pickle para la cabeza del modelo, lo que reduce la superficie de ataque al cargar pesos y facilita el despliegue en entornos Apple Metal e iOS. El autor declara explicitamente que se trata de una conversion de formato sin ninguna pretension de calidad y que no se ejecuto ninguna evaluacion para producirla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene la cabeza de proyeccion; el modelo base se infiere transformer de 8B por nomenclatura) |
| Parametros totales | no disponible para el modelo base; la cabeza convertida ocupa 75.552.388 bytes |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible (los perfiles de LocAI referencian `text2048`, es decir, 2048 tokens) |
| Tipos de cuantizacion | no disponible en este repositorio; los perfiles de despliegue mencionan bf16, f32 y variantes sharded128 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero `head--CLM_v0.1-8B.safetensors`); el original era `CLM_v0.1-8B.pt` en pickle de PyTorch |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en los materiales disponibles. El nombre CLM-v0.1-8B sugiere un transformer de 8.000 millones de parametros, y el sufijo "Contrastive-LM" apunta a un entrenamiento con objetivos contrastivos, pero no hay confirmacion documental en la informacion proporcionada. Tampoco constan datos sobre volumen de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de atencion.

Lo que si esta documentado con precision es el proceso de derivacion de este repositorio. La conversion se realizo con el script `tools/qualification/prepare_clm_head.py` (SHA-256 `e32f0f7c7e02af2c46554221338503d585840339feafcd6602b5195467958722`) del commit `7ee98d8148b3d50627a4dd3c84fe5ac66e59b164` de LocAI, ejecutado en modo offline bajo `tools/qualification/run-offline-darwin.sh`. El entorno fue Python 3.12 con torch 2.8.0, safetensors 0.6.2 y numpy 2.3.3, fijados mediante `tools/qualification/python/clm-head-requirements.lock`. La entrada fue `CLM_v0.1-8B.pt` (SHA-256 `b2b4a8c9c2d39263eff78a351eb909a342ce9b3bf21a3f07c1d1bf15f1c4eda5`) y la salida `head--CLM_v0.1-8B.safetensors` (SHA-256 `a86f8afeaad20e0fda8668c8ba838834d9d19865332439e9861b834284734729`). No se realizo ninguna evaluacion de calidad asociada a la conversion.

## Capacidades

- Este repositorio no implementa capacidades de inferencia por si mismo: contiene exclusivamente la cabeza de proyeccion en safetensors.
- La generacion de texto, razonamiento, codigo, matematicas o vision, si existen, corresponden al modelo base Contrastive-LM/CLM-v0.1-8B, cuyas capacidades no se detallan en la informacion disponible.
- No consta soporte de tool calling ni function calling en los materiales proporcionados.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta informacion sobre capacidades multilingues.
- La capacidad tecnica verificable de este artefacto es la carga segura (sin pickle) de los pesos de la cabeza en pipelines de despliegue LocAI sobre Apple Metal y simulador de iOS.

## Casos de uso

- Despliegue en Apple Silicon con Metal: el perfil `clm-v01-8b-apple-metal-text2048-local-v1` consume esta cabeza en safetensors junto con el resto de pesos del modelo base, permitiendo cargar el modelo en macOS sin recurrir a `torch.load` sobre el pickle original.
- Pruebas en simulador de iOS con bf16: el perfil `clm-v01-8b-ios-simulator-bf16-sharded128-grouped-text2048-local-v1` usa esta cabeza para validar la integracion del modelo en el simulador antes de desplegar en dispositivo, con pesos fragmentados en 128 shards.
- Pruebas en simulador de iOS con f32 y query512: el perfil `clm-v01-8b-ios-simulator-f32-sharded128-query512-text2048-local-v1` emplea la misma cabeza para escenarios de precision completa y ventana de consulta reducida, util para depurar diferencias numericas frente a bf16.
- Auditoria de cadena de suministro: el recibo `head--conversion.json` y los hashes SHA-256 permiten verificar que la cabeza desplegada corresponde exactamente al fichero publicado por Contrastive-LM en la revision fijada, lo que facilita controles de integridad en CI.
- Replicacion de la conversion: el script, el lock de dependencias y los hashes documentados permiten reproducir el artefacto de forma determinista en un entorno offline, util para equipos que necesiten regenerar la cabeza con otra version de safetensors o de torch.
- Integracion en pipelines de empaquetado: al mantener los ficheros inmutables del editor upstream por referencia a su revision, el repositorio sirve como pieza de un "pack" (`prepared-clm-v01-8b`) que puede ensamblarse en tiempo de despliegue sin duplicar los 8B de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la conversion es de formato y que no se ejecuto ninguna evaluacion para producirla.

## Requisitos de hardware

- VRAM para este repositorio: despreciable; la cabeza ocupa unos 72 MiB en disco y se carga en memoria de forma trivial.
- VRAM para el modelo base completo: no disponible en la informacion proporcionada; por el tamano de 8B se situaria en el orden de 16 GB en bf16 y 32 GB en f32, pero se trata de una estimacion generica no confirmada por el autor.
- GPU recomendadas: no disponibles. Los perfiles documentados apuntan a Apple Metal (Apple Silicon) y simulador de iOS, no a GPU NVIDIA.
- Cabe en GPU de consumo: no confirmado; depende del modelo base y de la cuantizacion, datos no publicados.
- Opciones de despliegue: los perfiles de LocAI sobre Apple Metal y simulador de iOS; no consta soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| locai-models/CLM-v0.1-8B-head-safetensors | cabeza de ~72 MiB | no disponible (perfiles a 2048) | safetensors | Apache-2.0 | Conversion de formato de la cabeza, sin evaluacion |
| Contrastive-LM/CLM-v0.1-8B | 8B (inferido del nombre) | no disponible | pickle de PyTorch (`CLM_v0.1-8B.pt`) | Apache-2.0 | Modelo base upstream en revision `e939398d` |
| Otros modelos de 8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene un modelo funcional por si solo: sin los pesos del modelo base no puede ejecutar inferencia.
- No se realizo ninguna evaluacion de calidad durante la conversion; el autor lo declara explicitamente. Cualquier metrica de rendimiento debe obtenerse del modelo base o medirse por separado.
- No hay informacion publicada sobre sesgos, riesgo de alucinacion, limitaciones idiomaticas ni comportamiento en produccion del modelo base en los materiales proporcionados.
- La licencia Apache-2.0 se hereda del modelo base; conviene revisar tambien el `NOTICE` y el `LICENSE` del repositorio upstream por si el editor anadio condiciones adicionales no reflejadas aqui.
- La dependencia de ficheros upstream fijados por revision implica que un cambio o retirada en el repositorio de Contrastive-LM romperia el ensamblaje de los perfiles de despliegue.
- El pipeline de Hugging Face figura como no disponible y el repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion.
- El nombre del perfil `text2048` sugiere una ventana efectiva de 2048 tokens en los despliegues LocAI, muy inferior a la de modelos contemporaneos; conviene verificar la longitud de contexto real del modelo base antes de usarlo en tareas de contexto largo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/locai-models/CLM-v0.1-8B-head-safetensors
- Modelo base: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Revision fijada del modelo base: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B/tree/e939398d4556fcd9400c76fa8c5a513202f42b0a
- Licencia del modelo base: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B/resolve/e939398d4556fcd9400c76fa8c5a513202f42b0a/LICENSE
- Repositorio de LocAI (commit de la receta): https://github.com/locai-models (commit `7ee98d8148b3d50627a4dd3c84fe5ac66e59b164`; URL exacta no disponible)
