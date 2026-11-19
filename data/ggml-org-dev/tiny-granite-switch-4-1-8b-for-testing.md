# ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing

## Resumen

`tiny-granite-switch-4.1-8b-for-testing` es una copia deliberadamente reducida y "dañada" del modelo `ibm-granite/granite-switch-4.1-8b` de IBM, publicada por la organizacion `ggml-org-dev`. Su unico proposito es servir como fixture de pruebas para el software de inferencia llama.cpp: reproduce la misma arquitectura, tokenizer, chat template y configuracion de adaptadores que el modelo original, pero con dimensiones minimas para que quepa en pipelines de integracion continua (CI). El propio autor advierte de que sus salidas son incoherentes y que no debe usarse para nada distinto de testear codigo.

El modelo conserva la estructura caracteristica de Granite Switch: un transformer denso con dos adaptadores LoRA embebidos (`guardian-core` y un aLoRA de decision) que se seleccionan por token mediante tokens de control. Esto permite ejercitar en llama.cpp la ruta de codigo `granite-switch` de tipo decision y la generacion de texto estandar sin necesidad de cargar el modelo real de 8B.

Con solo 26,7 millones de parametros y un repositorio de 0,1 GB, esta ficha describe un artefacto de ingenieria, no un modelo de produccion. Su interes es practico para desarrolladores que mantienen el soporte de Granite Switch en llama.cpp o que necesitan validar integraciones sin consumir recursos significativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Granite con adaptadores LoRA embebidos seleccionados por token (switch) |
| Parametros totales | 26.701.827 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo safetensors; existe version GGUF en `ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing-GGUF` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (version GGUF disponible por separado) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es un recorte (slicing) del checkpoint original `ibm-granite/granite-switch-4.1-8b` realizado con el script `slice_granite_switch.py`, que sigue la skill `slice-model` de llama.cpp. Se conservan 2 de las 40 capas con pesos (capas 0 y 1), y `num_hidden_layers` pasa de 42 a 4, contando las 2 capas switch sin pesos. El hidden size se reduce de 4096 a 256, las cabezas de atencion de 32 a 2, las KV heads de 8 a 1 (manteniendo `head_dim` en 128) y la FFN de 12800 a 128.

Los dos adaptadores LoRA embebidos (`guardian-core` y el aLoRA de decision) se mantienen, con dimensiones de entrada y salida ajustadas al tronco recortado y rango maximo reducido de 64 a 16 (se conservan los primeros 16 componentes de rango, con `adapter_ranks` limitado a 16). Los buffers `model.switch.*` se mantienen intactos. No se incluyen `compose_report.json`, `BUILD.md` ni `model.sig`, y el repositorio original no contenia codigo Python. Al conservar tokenizer, chat template y configuracion de adaptadores, el modelo ejecuta exactamente las mismas rutas de codigo que el original en llama.cpp.

## Capacidades

- Ejecucion de la ruta de decision `granite-switch` en llama.cpp, incluyendo la seleccion de adaptadores por token mediante tokens de control.
- Generacion de texto a traves del pipeline estandar de llama.cpp (salida incoherente por diseno).
- Carga de adaptadores LoRA embebidos con rangos truncados a 16.
- Uso del tokenizer y chat template originales de `granite-switch-4.1-8b`.
- Validacion de integraciones CI sin requisitos de memoria significativos.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales: es un artefacto de prueba.

## Casos de uso

- Integracion continua de llama.cpp: cargar el modelo en tests automatizados para verificar que la ruta `granite-switch` de tipo decision sigue funcionando tras cambios en el codigo, con un coste de memoria minimo.
- Pruebas de regresion del slicer: comparar la estructura de pesos, rangos de adaptadores y buffers `model.switch.*` frente a futuras versiones del script `slice_granite_switch.py`.
- Validacion de tokenizer y chat template: comprobar que el pipeline de preprocesado de Granite Switch procesa correctamente los tokens de control en un entorno aislado.
- Desarrollo de herramientas de inspeccion de adaptadores LoRA: ejercitar la lectura de `adapter_ranks` y dimensiones de adaptadores embebidos sin cargar el modelo de 8B.
- Pruebas de conversion a GGUF: usar la version GGUF asociada para validar el pipeline de conversion y cuantizacion sobre una arquitectura switch real.
- Formacion y documentacion: servir como ejemplo didactico de como se estructura un modelo Granite Switch con adaptadores por token, con un checkpoint ligero y rapido de inspeccionar.
- Pruebas de carga y descarga en entornos con recursos limitados: validar el ciclo de vida del modelo en orquestadores o servidores de inferencia sin reservar VRAM significativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es incoherente y que no debe usarse para evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantizacion razonable, dado el tamano de 26,7 M de parametros y el repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier modelo con al menos 1 GB de VRAM.
- Opciones de despliegue: llama.cpp (ruta principal, con soporte `granite-switch`), y la version GGUF asociada para `llama-cli` o `llama-server`. Otras opciones como vLLM, TGI u Ollama no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| tiny-granite-switch-4.1-8b-for-testing | 26,7 M | no disponible | Fixture de pruebas para llama.cpp | Apache 2.0 |
| ibm-granite/granite-switch-4.1-8b | 8B (aproximado por el nombre) | no disponible | Modelo de produccion con adaptadores switch | Apache 2.0 |
| tiny-granite-switch-4.1-8b-for-testing-GGUF | 26,7 M | no disponible | Version GGUF del mismo fixture | Apache 2.0 |

El modelo original `granite-switch-4.1-8b` es la referencia directa: misma arquitectura, tokenizer y adaptadores, pero con capacidad real de generacion. El artefacto aqui descrito solo es comparable en terminos de estructura, no de rendimiento.

## Limitaciones y advertencias

- Salida incoherente por diseno: el autor advierte de que el modelo genera gibberish y no debe usarse para produccion ni evaluacion.
- Copia "dañada": es un recorte de 2 de 40 capas con dimensiones reducidas, por lo que no representa el comportamiento del modelo original.
- Sin datos de contexto, idiomas ni benchmarks: no se puede caracterizar su rendimiento linguistico.
- No apto para uso comercial real: aunque la licencia es Apache 2.0, el contenido no tiene valor funcional fuera de pruebas.
- Riesgo de confusion: el nombre incluye "4.1-8b" pero el modelo tiene 26,7 M de parametros; verificar siempre el ID completo antes de integrarlo.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19), sin historial de uso.
- No incluye artefactos del original (`compose_report.json`, `BUILD.md`, `model.sig`), lo que puede romper flujos que los esperen.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Script de recorte: `slice_granite_switch.py` (incluido en el repositorio)
- Licencia: `LICENSE` (Apache 2.0, incluida en el repositorio)
