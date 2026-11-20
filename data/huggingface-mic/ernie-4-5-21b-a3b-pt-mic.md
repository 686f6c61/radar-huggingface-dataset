# huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic

## Resumen

ERNIE-4.5-21B-A3B-PT-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario huggingface-mic. No es un modelo entrenado ni utilizable en producción: se trata de una version reducida artificialmente del checkpoint `baidu/ERNIE-4.5-21B-A3B-PT` de Baidu, generada para validar contratos de integración con frameworks. El repositorio declara explícitamente la etiqueta `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo conserva la arquitectura del original (`Ernie4_5_MoeForCausalLM`, un transformer con mezcla de expertos) pero con la configuración reducida a 2 capas ocultas y solo 6.705.732 parámetros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente pasaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones de las entradas del contrato mueven los logits al menos 0,001. Los ficheros de procesador (tokenizer, chat template, generation config) sí se copiaron byte a byte del modelo original de Baidu.

Su relevancia es exclusivamente de ingeniería: permite a desarrolladores de frameworks (Transformers y otros) ejecutar pruebas de integración, validar plantillas de chat, comprobar la compatibilidad de nombres de tensores y verificar el comportamiento en float32, bfloat16 y float16 sin descargar el checkpoint real de 21B. No debe confundirse con el modelo ERNIE-4.5-21B-A3B-PT de Baidu, que es el artefacto real de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), clase `Ernie4_5_MoeForCausalLM` |
| Parametros totales | 6.705.732 (fixture reducido; el modelo base declara 21B con 3B activos en su nombre) |
| Parametros activos | no disponible (el fixture no documenta el reparto de expertos tras el recorte) |
| Longitud de contexto | no disponible (la config se redujo a 2 capas; no se documenta `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del checkpoint `baidu/ERNIE-4.5-21B-A3B-PT`: un modelo causal de lenguaje con mezcla de expertos implementado en la clase `Ernie4_5_MoeForCausalLM`. Para reducirlo, se aplicó la regla genérica de `sweep.py` del repositorio `huggingface/transformers-mic`, que fija `num_hidden_layers` a 2 y ajusta el resto de la configuración para que coincida tras el recorte. Los nombres de tensores se mantienen idénticos a los del checkpoint real, de modo que cualquier código que espere los parámetros del modelo original encuentra las mismas claves.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato debía mover los logits al menos 0,001 (la más débil, `attention_mask:all_ones`, alcanzó 1,06). Los ficheros de procesador —`LICENSE`, `added_tokens.json`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model` y `tokenizer_config.json`— se copiaron byte a byte desde `baidu/ERNIE-4.5-21B-A3B-PT`. El artefacto se guardó en bfloat16, el dtype por defecto del modelo base, y se verificó que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Conserva la plantilla de chat (`chat_template.jinja`) y el tokenizador del modelo base, por lo que permite validar el formateo de conversaciones.
- Mantiene los nombres de tensores del checkpoint original, útil para probar cargadores de pesos y mapeos de parámetros.
- Sirve como fixture para pruebas de integración en Transformers y otros frameworks.
- Ejecuta forward, cálculo de pérdida y retropropagación en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento utilizables, al carecer de entrenamiento.
- Capacidades multilingües: no disponibles más allá de lo que herede el tokenizador copiado.

## Casos de uso

- Pruebas de integración de frameworks: usar el fixture para verificar que un cargador de modelos de la familia ERNIE MoE resuelve correctamente las claves de tensores y la configuración sin descargar el checkpoint de 21B.
- Validación de plantillas de chat: ejecutar `chat_template.jinja` copiado del modelo base para comprobar el formateo de turnos en pipelines de conversación antes de pasar al modelo real.
- Pruebas de CI/CD: incluir el fixture en la batería de tests de una librería para detectar regresiones en la carga de safetensors y en la inicialización de la clase `Ernie4_5_MoeForCausalLM` con un coste de descarga mínimo (repo de 0,0 GB).
- Verificación de dtypes: comprobar que forward, loss y gradientes se mantienen finitos en float32, bfloat16 y float16 en distintas versiones de PyTorch o del framework.
- Desarrollo de utilidades de tokenización: probar `tokenizer.json`, `tokenizer.model` y `special_tokens_map.json` contra el mismo vocabulario que usa el modelo de producción.
- Pruebas de sensibilidad a la entrada: reutilizar la puerta de sensibilidad (perturbaciones que mueven los logits al menos 0,001) como test de humo para detectar roturas en el grafo computacional.
- Reproducción del fixture: regenerarlo con `python example/build_fixtures.py --fixture ERNIE-4.5-21B-A3B-PT-mic` para auditar hashes y fuentes fijadas en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido y no se reporta.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 para los 6,7M de parámetros del fixture (aproximadamente 13,4 MB de pesos), más overhead de activaciones y del framework.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el fixture cabe incluso en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers es el camino documentado (`integrations/transformers/usage.md`); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y su utilidad en ellos sería nula al no ser un modelo entrenado.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-4.5-21B-A3B-PT-mic (este) | 6,7M (fixture) | no disponible | Artefacto de prueba para integracion | no disponible | Hugging Face (huggingface-mic) |
| baidu/ERNIE-4.5-21B-A3B-PT | 21B totales, 3B activos (segun nombre) | no disponible | Modelo real de lenguaje MoE | no disponible en la informacion | Hugging Face (baidu) |
| Otros fixtures `*-mic` de huggingface-mic | Variable (reducidos) | no disponible | Pruebas de contrato de frameworks | no disponible | Hugging Face (huggingface-mic) |

La comparación relevante es con el checkpoint original de Baidu, del que este repositorio es una copia reducida. Frente a otros fixtures del mismo autor, comparte la misma metodología de recorte (`sweep.py`) y la misma puerta de sensibilidad.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado lingüístico.
- Etiquetado como `test-artifact`; no debe aparecer en búsquedas de modelos candidatos ni en evaluaciones de calidad.
- La configuración recortada a 2 capas no refleja el comportamiento del checkpoint real de 21B; no sirve para estimar rendimiento, latencia ni calidad del modelo de Baidu.
- La licencia no se especifica en la información disponible; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones de uso comercial dependen de dicho fichero, que no se detalla.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque el artefacto no genera contenido real.
- El tamaño del repo figura como 0,0 GB, lo que puede deberse a redondeo; conviene verificar los ficheros antes de asumir que todos los pesos están presentes.
- No debe desplegarse en producción bajo ninguna circunstancia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/ERNIE-4.5-21B-A3B-PT-mic/blob/main/build.json
- Explicación del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ERNIE-4.5-21B-A3B-PT-mic.html
- Script de recorte (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
