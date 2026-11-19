# huggingface-mic/Unlimited-OCR-mic

## Resumen

Unlimited-OCR-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo utilizable en producción. Se trata de una versión reducida ("slim") del modelo baidu/Unlimited-OCR, generada automáticamente mediante la regla genérica de reducción de `sweep.py` del repositorio transformers-mic. Su propósito es servir como fixture de integración para validar el comportamiento de frameworks (en particular Transformers) frente a la arquitectura `UnlimitedOcrForConditionalGeneration`, manteniendo los mismos nombres de tensores y los ficheros de procesador del checkpoint original.

El modelo conserva la arquitectura del original pero con una configuración drásticamente reducida (2 capas en cada componente: num_hidden_layers, sam, encoder y text), lo que da un total de 18.573.568 parámetros. Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente pasaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones de las entradas mueven los logits al menos 0,001. Está guardado en bfloat16, el dtype por defecto de baidu/Unlimited-OCR.

Su relevancia es puramente técnica: permite a los desarrolladores de transformers-mic y de frameworks compatibles ejecutar pruebas de contrato (formas de tensores, nombres de parámetros, flujo de forward/loss/gradients) sin descargar el checkpoint completo de Baidu. La etiqueta `test-artifact` lo excluye explícitamente de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UnlimitedOcrForConditionalGeneration (variante reducida de la arquitectura de baidu/Unlimited-OCR, con componentes tipo DeepSeek-V2 y DeepEncoder) |
| Parametros totales | 18.573.568 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el fixture es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia byte a byte de baidu/Unlimited-OCR, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `UnlimitedOcrForConditionalGeneration` del checkpoint baidu/Unlimited-OCR, que combina componentes de tipo DeepSeek-V2 (`modeling_deepseekv2.py`, `configuration_deepseek_v2.py`) con un codificador visual (`deepencoder.py`) y un módulo específico de OCR (`modeling_unlimitedocr.py`). La reducción se aplica con la regla genérica de `sweep.py`: 2 capas ocultas en el modelo principal, 2 en el componente SAM, 2 en el encoder y 2 en el módulo de texto. Los ficheros de procesador (tokenizer, chat template, preprocessor config, conversation, etc.) se copian byte a byte desde el modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,456). Los nombres de tensores coinciden exactamente con los del checkpoint real, y el fixture es finito en forward, loss y gradientes tanto en float32 como en bfloat16 y float16. No se dispone de información sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones técnicas del modelo original.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Sirve como fixture de integración para validar la carga, el forward, la loss y los gradientes de la arquitectura `UnlimitedOcrForConditionalGeneration` en Transformers.
- Verifica el contrato de formas de tensores y nombres de parámetros frente al checkpoint real.
- Permite probar la integración del procesador (tokenizer, chat template, preprocessor) copiado del modelo original.
- No dispone de tool calling, agentes, razonamiento ni capacidades multilingües utilizables.
- No soporta visión real ni OCR funcional, pese a incluir los módulos de encoder visual en la arquitectura.

## Casos de uso

- Pruebas de integración en Transformers: ejecutar el fixture para comprobar que la clase `UnlimitedOcrForConditionalGeneration` carga, hace forward y calcula gradientes sin errores, con un coste de descarga y cómputo mínimo.
- Validación de contratos de API: comparar nombres de tensores y formas contra el checkpoint real para detectar regresiones en el mapeo de pesos.
- CI/CD de frameworks: incluir el fixture en pipelines de integración continua para verificar que los cambios en el cargador de safetensors o en el procesador no rompen la arquitectura.
- Pruebas de dtype: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes, útil para validar rutas de mixed precision.
- Validación de puertas de sensibilidad: reproducir el experimento de perturbación de entradas (`pixel_values:halve`, etc.) para verificar que el pipeline de evaluación detecta cambios en los logits.
- Desarrollo de herramientas de reducción de modelos: usar `build_fixtures.py` y `sweep.py` como referencia para generar fixtures de otros checkpoints con la misma metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar calidad de OCR ni de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (18,6 M de parámetros, aproximadamente 37 MB de pesos), más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (el repo incluye `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/Unlimited-OCR-mic | 18,6 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| baidu/Unlimited-OCR | no disponible | no disponible | OCR real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar; la comparación relevante es funcional (fixture frente a modelo real), no de calidad.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce salidas útiles y no debe usarse en producción.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no es un modelo de OCR.
- La licencia no está especificada en la información disponible; el fichero LICENSE se copia del modelo base, pero su contenido no se detalla. Verificar antes de cualquier uso.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de idioma porque no hay comportamiento aprendido.
- El fixture solo cubre checkpoints con ficheros de procesador byte-idénticos y configuración compatible tras la reducción (clave `6cf8d9548ff2`); no representa variantes con otros procesadores.
- No se documentan requisitos de contexto ni soporte multilingüe del modelo original en la información proporcionada.

## Enlaces

- [Hugging Face: huggingface-mic/Unlimited-OCR-mic](https://huggingface.co/huggingface-mic/Unlimited-OCR-mic)
- [Modelo base: baidu/Unlimited-OCR](https://huggingface.co/baidu/Unlimited-OCR)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Unlimited-OCR-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
