# huggingface-mic-temp/vaultgemma-1b-vllm-mic

## Resumen

`vaultgemma-1b-vllm-mic` es un artefacto de prueba (fixture) publicado por la cuenta `huggingface-mic-temp` para validar la integración de `google/vaultgemma-1b` con vLLM dentro del programa MIC (Model Integration Contract) de Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una versión reducida artificialmente del checkpoint original, con pesos aleatorios y una configuración mínima, diseñada exclusivamente para comprobar que las expectativas de contrato (procesador, tokenizador, nombres de tensores, tipos de datos) se cumplen de forma reproducible.

El fixture conserva la arquitectura declarada del modelo base, `VaultGemmaForCausalLM`, pero reduce el número de capas ocultas a 2, lo que da como resultado 16.466.240 parámetros. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/vaultgemma-1b`, de modo que el tokenizador y la configuración de generación son idénticos a los del modelo real. Los pesos, en cambio, son aleatorios (semilla 17) y se guardan en bfloat16.

Su relevancia es puramente de ingeniería: permite a los mantenedores de transformers y de vLLM ejecutar pruebas de integración rápidas y deterministas sin descargar ni cargar el checkpoint completo de VaultGemma-1B. Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VaultGemmaForCausalLM (transformer decoder-only, configuración reducida a 2 capas ocultas) |
| Parametros totales | 16.466.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `VaultGemmaForCausalLM` del modelo base `google/vaultgemma-1b`, pero con una configuración reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, que fija `num_hidden_layers` en 2. Los nombres de los tensores coinciden con los del checkpoint real y el conjunto de parámetros es completo para esa configuración reducida, de modo que el grafo computacional es estructuralmente equivalente al del modelo original, solo que mucho más pequeño.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,386), lo que se consideró suficiente para no requerir ajuste. Los ficheros de procesador se copiaron byte a byte desde `google/vaultgemma-1b`. El modelo se guardó en bfloat16, el dtype con el que carga por defecto el checkpoint original, y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `15eca153fb35` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos y cuya configuración coincide tras el proceso de reducción.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de razonamiento, código o matemáticas.
- Sirve como fixture de integración para validar la carga del modelo, el tokenizador y la configuración de generación en transformers y vLLM.
- Permite comprobar la equivalencia de nombres de tensores y la compatibilidad de dtype (bfloat16) con el checkpoint real.
- Valida la sensibilidad de las entradas del contrato (perturbaciones de logits) en pruebas automatizadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No dispone de capacidades multilingües verificables más allá de las que herede el tokenizador copiado, que no se documentan en la información disponible.

## Casos de uso

- Pruebas de integración en CI para transformers: cargar el fixture y verificar que `VaultGemmaForCausalLM` se instancia, ejecuta forward y produce logits finitos sin descargar el checkpoint completo de 1B.
- Validación de contratos de tokenizador: comprobar que `tokenizer.model`, `special_tokens_map.json` y `tokenizer_config.json` se procesan igual que en `google/vaultgemma-1b`, ya que son copias byte a byte.
- Pruebas de compatibilidad con vLLM: usar el fixture para verificar el pipeline de carga y el mapeo de tensores antes de pasar al modelo real, reduciendo tiempos de CI y consumo de memoria.
- Verificación de estabilidad numérica: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar NaN o infinitos en cambios de código del framework.
- Regresión de nombres de tensores: comparar el estado del fixture con el del checkpoint real para detectar renombrados o eliminaciones accidentales de parámetros.
- Desarrollo de herramientas de reducción de modelos: servir como ejemplo reproducible del proceso `sweep.py` y de `build_fixtures.py` para generar nuevos fixtures a partir de otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5 M de parámetros, aproximadamente 33 MB de pesos) más el overhead del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; sirve para pruebas en CPU y en GPUs de gama baja.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), transformers con `VaultGemmaForCausalLM`; no se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las cifras no serían representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vaultgemma-1b-vllm-mic | 16,5 M | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face (repo de prueba) |
| google/vaultgemma-1b | no disponible | no disponible | Modelo base real de generacion de texto | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato de integracion | no disponible | Hugging Face (cuenta huggingface-mic-temp) |

No se dispone de datos suficientes para comparar rendimiento, ya que el fixture no es un modelo funcional y el modelo base no aporta métricas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado semántico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está declarada en la información disponible, por lo que no se puede confirmar el uso comercial.
- La configuración reducida (2 capas) no representa el comportamiento del checkpoint `google/vaultgemma-1b` completo.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB reportado, lo que refleja su carácter de artefacto interno.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no genera contenido real.
- Cualquier prueba de rendimiento o calidad realizada sobre este fixture no es extrapolable al modelo base.

## Enlaces

- [Hugging Face: huggingface-mic-temp/vaultgemma-1b-vllm-mic](https://huggingface.co/huggingface-mic-temp/vaultgemma-1b-vllm-mic)
- [Modelo base: google/vaultgemma-1b](https://huggingface.co/google/vaultgemma-1b)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script de reduccion sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construccion build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Explicacion del proceso de reduccion](https://huggingface-mic-mic-coverage.static.hf.space/shrink/vaultgemma-1b-vllm-mic.html)
