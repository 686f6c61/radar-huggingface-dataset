# ozyman/sidebar-test-q4

## Resumen

`ozyman/sidebar-test-q4` es un repositorio de prueba publicado en Hugging Face por el usuario `ozyman`, cuyo objetivo declarado es validar la disposicion de ficheros (layout) de un repositorio de cuantizacion, no ofrecer un modelo utilizable. La propia model card lo califica como "layout test for #500" con "dummy weights; do not use" y anuncia su borrado futuro. Se trata, por tanto, de un artefacto de andamiaje para herramientas internas de publicacion, no de un modelo entrenado.

El repositorio se presenta como una cuantizacion de 4 bits en formato MLX (etiqueta `kquant`) del modelo base `Qwen/Qwen3.5-9B`, un modelo multimodal de tipo image-text-to-text de la familia Qwen 3.5. La unica metrica de parametros disponible en los safetensors es de 65.536, un valor incompatible con un modelo de 9.000 millones de parametros y coherente con pesos de relleno de un test estructural.

Su relevancia practica es nula para inferencia: sirve unicamente como referencia de como se organiza un repositorio MLX cuantizado con un checkpoint por repositorio y los pesos de 4 bits en la raiz. Cualquier evaluacion de capacidades, rendimiento o calidad debe hacerse sobre el modelo base Qwen3.5-9B, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del base Qwen/Qwen3.5-9B; no verificable en este repo) |
| Parametros totales | 65.536 segun safetensors del repo (pesos dummy, no representativos del base de 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, esquema kquant (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni entrenamiento en el repositorio. La model card solo declara la relacion `base_model_relation: quantized` respecto a `Qwen/Qwen3.5-9B` y la etiqueta `kquant`, que en el ecosistema MLX designa un esquema de cuantizacion por bloques con escalas de tipo k-quant. El pipeline declarado es `image-text-to-text`, lo que sugiere una arquitectura multimodal en el modelo base, pero este repositorio no contiene pesos funcionales ni documentacion tecnica que lo confirme.

Los safetensors suman 65.536 parametros, un orden de magnitud de relleno que confirma la naturaleza de test. No se documentan datos de entrenamiento, tokens, composicion del dataset ni fases de RLHF o DPO, porque no hubo entrenamiento: es una cuantizacion de prueba con pesos ficticios.

## Capacidades

- No se puede atribuir ninguna capacidad funcional al repositorio: los pesos son dummy y la model card prohibe explicitamente su uso.
- El pipeline declarado es image-text-to-text, por herencia del base Qwen3.5-9B, pero no verificable aqui.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en este repositorio.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Validacion de layout de repositorios MLX: comprobar que una herramienta de publicacion coloca un unico checkpoint por repositorio con los pesos de 4 bits en la raiz, tal como describe la model card.
- Pruebas de integracion de pipelines de subida a Hugging Face: verificar el etiquetado automatico (`mlx`, `kquant`, `base_model_relation: quantized`) y la generacion de metadatos.
- Test de parsers de safetensors: ejercitar la lectura de cabeceras y el conteo de parametros con un fichero de pesos minimo.
- Pruebas de CI en herramientas de cuantizacion: usar el repositorio como fixture para validar rutas y convenciones de nombres sin descargar gigabytes.
- Verificacion de resolucion de `base_model` en el Hub: comprobar que las interfaces muestran correctamente la relacion con `Qwen/Qwen3.5-9B`.
- No apto para inferencia, evaluacion de calidad, generacion de texto, codigo, vision ni ninguna tarea de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene pesos dummy y su model card prohibe su uso, por lo que cualquier medicion de rendimiento carece de sentido.

## Requisitos de hardware

- VRAM estimada: no aplica; los pesos suman 65.536 parametros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no aplica para este repositorio. Para un modelo de 9B en 4 bits se requeririan del orden de 5-6 GB de VRAM, pero ese calculo corresponde al base Qwen3.5-9B, no a este artefacto.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: la libreria declarada es MLX, lo que limita la ejecucion al ecosistema Apple Silicon; no obstante, al no haber pesos funcionales no procede desplegarlo con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable para un repositorio de prueba con pesos dummy; las alternativas reales serian las cuantizaciones oficiales o comunitarias de Qwen3.5-9B en MLX, que no se detallan en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| ozyman/sidebar-test-q4 | 65.536 (dummy) | no disponible | Apache 2.0 | test, no usable |
| Qwen/Qwen3.5-9B (base) | 9B (segun nombre) | no disponible | no disponible | modelo real de referencia |
| Otras cuantizaciones MLX de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos son dummy: la model card indica "do not use" y anuncia que el repositorio sera eliminado.
- El conteo de parametros de los safetensors (65.536) no corresponde al modelo base de 9B; no debe usarse para estimar requisitos de memoria ni rendimiento.
- Sin garantias de estabilidad: el autor lo describe como un test de layout para el issue #500, sujeto a cambios o borrado.
- No hay informacion sobre sesgos, alucinacion o limitaciones linguisticas porque no hay modelo funcional que evaluar.
- La licencia Apache 2.0 se hereda del base, pero al no existir artefacto utilizable no habilita ningun uso comercial real de este repositorio.
- No debe referenciarse en produccion ni incluirse en catalogos de modelos como si fuera una cuantizacion operativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ozyman/sidebar-test-q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/ozyman
