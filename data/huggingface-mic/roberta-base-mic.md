# huggingface-mic/roberta-base-mic

## Resumen

`roberta-base-mic` es un artefacto de prueba (test fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado para uso real. Se trata de una version "adelgazada" de `FacebookAI/roberta-base` con la misma arquitectura (`RobertaForMaskedLM`) pero con solo 2 capas ocultas y 3.371.545 parametros totales, frente a los aproximadamente 125 millones del checkpoint original. El autor lo etiqueta explicitamente con `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Su proposito es servir como fixture reproducible para validar contratos de integracion con frameworks (concretamente Transformers): incluye pesos slim, uso ejecutable y un directorio de expectativas del framework en el mismo repositorio. Los ficheros del procesador (`vocab.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `dict.txt`) se copian byte a byte del modelo original, de modo que el tokenizador se comporta de forma identica.

Los pesos son aleatorios (semilla 17), no entrenados; el autor justifica que superaron una "puerta de sensibilidad a la entrada" (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001), por lo que no requirio entrenamiento. Es relevante ahora solo como herramienta de ingenieria para pruebas de integracion, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), `RobertaForMaskedLM` |
| Parametros totales | 3.371.545 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el config se reduce a `num_hidden_layers: 2`; el resto de hiperparametros no se detalla) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizador heredado de `FacebookAI/roberta-base`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de `FacebookAI/roberta-base` (transformer encoder bidireccional con cabecera de masked language modeling), pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` pasa a 2. Los nombres de tensores son identicos a los del checkpoint real, de modo que el codigo de carga y las expectativas del framework se pueden validar sin cambios. Los ficheros del procesador se copian literalmente del modelo base.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. El autor documento una puerta de sensibilidad a la entrada en la que cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, con 0,0024), lo que justifica que no hiciera falta ajuste. Los pesos se guardan en float32, el dtype por defecto de carga de `FacebookAI/roberta-base`, y se verifican finitos en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- Relleno de mascaras (fill-mask) a nivel de contrato: el modelo expone la interfaz `RobertaForMaskedLM`, pero con pesos aleatorios las predicciones carecen de valor semantico.
- Tokenizacion identica a `FacebookAI/roberta-base` (ficheros del procesador copiados byte a byte).
- Compatibilidad de nombres de tensores con el checkpoint real, util para validar rutas de carga.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues reales; no es un modelo usable.

## Casos de uso

- Pruebas de integracion de Transformers: sirve para validar que el pipeline de carga, tokenizacion y forward funciona contra un checkpoint ligero antes de ejecutar la suite completa con el modelo real.
- CI/CD de librerias de inferencia: al ocupar 0,0 GB en el repositorio, permite incluir un checkpoint en tests automatizados sin coste de descarga ni de almacenamiento.
- Validacion de contratos de framework: el directorio `integrations/transformers/expectations` define expectativas verificables sobre entradas y salidas que se pueden comprobar en cada release.
- Pruebas de precision mixta: al estar verificado como finito en float32, bfloat16 y float16, sirve para comprobar rutas de conversion de dtype en herramientas de despliegue.
- Verificacion de compatibilidad de tokenizadores: al copiar los ficheros del procesador del modelo base, permite testear codigo que depende de un vocabulario y merges concretos.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py` y auditar cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, GLUE, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,37 M de parametros); en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sera minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/roberta-base-mic` | 3.371.545 | no disponible | Fixture de test | no disponible | Hugging Face |
| `FacebookAI/roberta-base` | ~125 M | 512 tokens | Masked LM entrenado | MIT (segun el modelo original; no confirmado en esta informacion) | Hugging Face |
| `distilroberta-base` | ~82 M | 512 tokens | Masked LM destilado | no disponible en esta informacion | Hugging Face |

La comparativa es estructural: el fixture comparte arquitectura y tokenizador con `roberta-base`, pero no es un modelo funcional. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado linguistico; no debe usarse para inferencia real ni para evaluar calidad.
- Etiquetado `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al ser un artefacto de prueba, la cuestion es en gran medida irrelevante, pero debe verificarse antes de redistribuirlo.
- Idiomas no declarados: aunque el tokenizador proviene de RoBERTa (entrenado principalmente en ingles), el modelo no tiene capacidades linguisticas reales.
- Contexto y configuracion completos no documentados: solo se especifica la reduccion a 2 capas; otros hiperparametros (dimension oculta, cabezas de atencion) no se detallan en la informacion disponible.
- Riesgo de confusion con el modelo base: el nombre `roberta-base-mic` puede llevar a error; conviene revisar siempre la etiqueta `test-artifact` y el campo `build.json`.
- No apto para benchmarks ni para comparaciones de rendimiento con modelos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/roberta-base-mic
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Explicacion del proceso de reduccion (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/roberta-base-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/roberta-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/roberta-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/roberta-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/roberta-base-mic/blob/main/build.json
