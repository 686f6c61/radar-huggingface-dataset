# huggingface-mic/DeepSeek-R1-mic

## Resumen

DeepSeek-R1-mic es un artefacto de prueba (test artifact) publicado en Hugging Face por el usuario huggingface-mic. No se trata de un modelo funcional, sino de un fixture de 16,6 millones de parametros construido a partir de la arquitectura de deepseek-ai/DeepSeek-R1 mediante reduccion de capas (num_hidden_layers reducido a 2) y pesos aleatorios generados con semilla 17. Su proposito es servir como contrato de integracion para validar frameworks de inferencia (en concreto Transformers) frente a la arquitectura DeepseekV3ForCausalLM.

El modelo conserva los nombres de tensores del checkpoint original y copia byte a byte los ficheros de procesamiento (tokenizer, configuracion, modeling) de DeepSeek-R1, lo que permite verificar que una implementacion de framework carga correctamente la arquitectura sin necesidad de descargar los cientos de gigabytes del modelo real. Los pesos aleatorios superaron una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001, garantizando que el fixture responde a variaciones en la entrada.

Es relevante ahora porque facilita el desarrollo y testeo de integraciones de la familia DeepSeek V3/R1 en pipelines de CI, sin coste de hardware ni de ancho de banda. Sin embargo, no debe confundirse con el modelo real: no genera texto coherente, no ha sido entrenado y esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV3ForCausalLM (transformer decoder-only, version reducida a 2 capas) |
| Parametros totales | 16.624.260 |
| Parametros activos | no disponible (el modelo base DeepSeek-R1 es MoE, pero el fixture no conserva la configuracion MoE completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE de DeepSeek-R1, pero no se especifica el tipo) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura DeepseekV3ForCausalLM del modelo DeepSeek-R1, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del repositorio transformers-mic. Los ficheros `configuration_deepseek.py`, `modeling_deepseek.py`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` se copian byte a byte desde deepseek-ai/DeepSeek-R1, de modo que la interfaz de carga y el vocabulario son identicos a los del modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad de entrada: toda perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, con 0,932). El modelo se guarda en bfloat16, el dtype por defecto de DeepSeek-R1, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los nombres de tensores coinciden con los del checkpoint real.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni razona, ya que los pesos son aleatorios.
- Sirve como fixture de integracion para validar la carga de la arquitectura DeepseekV3ForCausalLM en Transformers.
- Permite ejecutar forward, calculo de loss y gradientes en float32, bfloat16 y float16.
- Conserva el tokenizer y la configuracion de generacion de DeepSeek-R1, por lo que valida el pipeline de tokenizacion del modelo real.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional (aunque el contrato de arquitectura los contemple).
- Multilingue solo en la medida en que lo sea el tokenizer heredado; no hay capacidades linguisticas reales.

## Casos de uso

- Test de integracion en CI: cargar el fixture con Transformers para verificar que la version del framework soporta la arquitectura DeepseekV3ForCausalLM antes de desplegar el modelo real, sin coste de GPU ni descarga masiva.
- Validacion de pipelines de tokenizacion: comprobar que el tokenizer.json copiado de DeepSeek-R1 produce las secuencias esperadas en el pipeline de preprocesado.
- Pruebas de compatibilidad de cuantizacion: usar los pesos bfloat16 para verificar que las rutas de conversion a float16/float32 no producen NaN ni inf en forward y backward.
- Desarrollo de herramientas de inspeccion de modelos: recorrer los nombres de tensores del fixture para construir utilidades de analisis de checkpoints que luego se apliquen al modelo real.
- Regresion de frameworks: detectar roturas en la carga de modelos con `custom_code` (modeling_deepseek.py) cuando se actualiza la version de Transformers.
- Documentacion y demos de integracion: ejemplos ejecutables en documentacion tecnica que no requieren descargar el checkpoint completo de DeepSeek-R1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, no tiene sentido evaluar su calidad generativa.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (16,6 M de parametros, aproximadamente 33 MB de pesos mas overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (necesario por `modeling_deepseek.py`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; al ser un fixture de 2 capas, la latencia seria minima pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-mic | 16,6 M | no disponible | Fixture de test | no disponible | Hugging Face (test-artifact) |
| deepseek-ai/DeepSeek-R1 | 671 B (MoE) | 128 K (segun model card publica) | Razonamiento y generacion | MIT (segun model card publica) | Hugging Face |
| deepseek-ai/DeepSeek-V3 | 671 B (MoE) | 128 K (segun model card publica) | LLM generalista | MIT (segun model card publica) | Hugging Face |

La comparativa con el modelo base es la mas relevante: el fixture comparte arquitectura y tokenizer con DeepSeek-R1, pero carece de capacidades funcionales. No se identifican otros fixtures comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene coherencia linguistica.
- Etiquetado como `test-artifact`; no debe usarse en produccion ni presentarse como modelo de IA funcional.
- Riesgo de confusion: su nombre y arquitectura pueden llevar a error si se descubre fuera de contexto; verificar siempre la etiqueta antes de integrarlo.
- Licencia no especificada en la informacion disponible; el fichero LICENSE copiado de DeepSeek-R1 no se detalla, por lo que el uso comercial queda sin garantias claras.
- Requiere `trust_remote_code=True` por el uso de `modeling_deepseek.py` y `configuration_deepseek.py`, lo que implica ejecutar codigo del repositorio.
- No se documentan sesgos, capacidades multilingues ni limites de contexto porque no aplican a un fixture sin entrenamiento.
- El fixture solo cubre checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el shrink (fixture key `3bd6b377673a`); no valida variantes con distinta configuracion.

## Enlaces

- [Hugging Face: huggingface-mic/DeepSeek-R1-mic](https://huggingface.co/huggingface-mic/DeepSeek-R1-mic)
- [Modelo base: deepseek-ai/DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-R1-mic.html)
- [Repositorio transformers-mic (sweep.py y build_fixtures.py)](https://github.com/huggingface/transformers-mic)
- [integration.json (contract manifest)](https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/blob/main/integration.json)
- [build.json (provenance del fixture)](https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/blob/main/build.json)
- [Uso con Transformers](https://huggingface.co/huggingface-mic/DeepSeek-R1-mic/blob/main/integrations/transformers/usage.md)
