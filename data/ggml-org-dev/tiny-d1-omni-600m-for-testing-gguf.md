# ggml-org-dev/tiny-d1-omni-600M-for-testing-GGUF

## Resumen

`tiny-d1-omni-600M-for-testing-GGUF` es un artefacto de prueba publicado por la organizacion `ggml-org-dev`, no un modelo destinado a uso real. Se trata de una copia deliberadamente modificada y "danada" de `LiquidAI/d1-omni-600M`, segun advierte el propio autor en la model card: su salida es texto sin sentido (gibberish) y solo existe para validar software. Concretamente, se emplea en las pruebas del servidor de llama.cpp para el tipo de decision `lfm2-d1-omni`.

El modelo base pertenece a la familia d1-omni de Liquid AI, un modelo de tipo "decision model" (etiquetado como `decision-model` y `feature-extraction`) con licencia LFM Open License v1.0. El nombre comercial sugiere un tamano nominal de 600M de parametros, aunque el recuento real de parametros en safetensors que reporta el repositorio es de 1.494.785, un dato que conviene interpretar con cautela dado el caracter sintetico y degradado del artefacto.

El interes de esta ficha es, por tanto, documental y tecnico: permite entender como se construye un GGUF de prueba reduciendo el vocabulario y recuantizando, y por que existe. No debe confundirse con un modelo funcional ni utilizarse en produccion, investigacion ni evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base d1-omni de Liquid AI; tipo "decision model") |
| Parametros totales | 1.494.785 (segun safetensors del repo; el nombre indica 600M nominales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto, incluido el token embedding) y Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (texto + mmproj), convertido con `convert_hf_to_gguf.py` de llama.cpp |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `LiquidAI/d1-omni-600M` en los datos proporcionados. El modelo se etiqueta como "decision model" y "feature-extraction", y el artefacto incluye un componente `mmproj`, lo que indica soporte de proyeccion multimodal en el modelo original. El nombre "omni" sugiere capacidades multimodales, pero no se detalla su naturaleza.

El proceso de construccion del GGUF si esta documentado: se convirtio el modelo base a GGUF en F16 (modelo de texto y mmproj), despues se recorto el vocabulario del modelo de texto de 65.536 a 3.564 tokens (conservando tokens especiales, todos los caracteres individuales, las palabras de etiqueta de decision y las primeras 2.000 fusiones BPE, con renumeracion de ids) y se cuantizo a Q4_0, incluyendo el token embedding. El mmproj se cuantizo a Q8_0. En consecuencia, el tokenizador del GGUF no es el original: cualquier texto sigue tokenizandose, pero en mas piezas. No se dispone de datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- No es un modelo funcional: el autor declara explicitamente que su salida es gibberish y que solo sirve para probar software.
- Sirve como fixture de pruebas para el servidor de llama.cpp, en concreto para el tipo de decision `lfm2-d1-omni`.
- Permite validar el pipeline de conversion a GGUF, el recorte de vocabulario y la recuantizacion (Q4_0 para texto, Q8_0 para mmproj).
- Conserva la estructura de tokens especiales y de etiquetas de decision, util para probar rutas de codigo que dependen de ellos.
- No se debe asumir ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingueismo util.

## Casos de uso

- Pruebas de integracion de llama.cpp: ejecutar `llama-server -hf ggml-org-dev/tiny-d1-omni-600M-for-testing-GGUF:Q4_0` para verificar que el servidor arranca y carga un GGUF con vocabulario recortado.
- Validacion del tipo de decision `lfm2-d1-omni`: comprobar que el servidor procesa correctamente las etiquetas de decision conservadas en el vocabulario reducido.
- Test de regresion del conversor `convert_hf_to_gguf.py`: verificar que la conversion de un modelo con mmproj produce los artefactos esperados (texto y mmproj).
- Pruebas de `llama-quantize`: validar la recuantizacion a Q4_0 con token embedding incluido y a Q8_0 para el mmproj.
- Pruebas de tokenizador degradado: comprobar el comportamiento de rutas de codigo cuando el texto se fragmenta en mas piezas de lo habitual.
- CI de proyectos que consumen GGUF: disponer de un artefacto pequeno y rapido de cargar para pruebas automatizadas sin depender de modelos grandes.
- Verificacion de manejo de errores: comprobar que las aplicaciones no asumen salidas coherentes cuando el modelo produce texto sin sentido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el repo ocupa 0.0 GB y el recuento de parametros reportado es de 1.494.785, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de llama.cpp; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier modelo con suficiente memoria para el runtime de llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), con carga directa desde Hugging Face mediante `-hf`.
- Latencia y throughput: no disponibles; irrelevantes dado que la salida no es util.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-d1-omni-600M-for-testing-GGUF | 1.494.785 (reportado) | no disponible | Pruebas de software (salida gibberish) | LFM Open License v1.0 | GGUF en Hugging Face |
| LiquidAI/d1-omni-600M | no disponible | no disponible | Modelo base de decision/feature-extraction | LFM Open License v1.0 | Hugging Face |
| ggml-org-dev/tiny-d1-omni-600M-for-testing | no disponible | no disponible | Version pre-GGUF del artefacto de prueba | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor advierte explicitamente de que es una copia modificada y danada, y de que su salida es gibberish; no debe usarse para nada distinto de probar software.
- El vocabulario esta recortado de 65.536 a 3.564 tokens, por lo que el tokenizador no es el original y cualquier texto se fragmenta en mas piezas.
- El recuento de parametros reportado (1.494.785) no coincide con el tamano nominal de 600M del nombre; tratar cualquier cifra con cautela.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o de idioma del modelo base.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de cualquier uso derivado; al ser un artefacto de prueba, su uso comercial carece de sentido practico.
- No apto para produccion, evaluacion de capacidades ni investigacion sobre el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org-dev/tiny-d1-omni-600M-for-testing-GGUF
- Modelo base del artefacto de prueba: https://huggingface.co/ggml-org-dev/tiny-d1-omni-600M-for-testing
- Modelo original: https://huggingface.co/LiquidAI/d1-omni-600M
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio
