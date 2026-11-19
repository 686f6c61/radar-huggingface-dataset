# huggingface-mic/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic

## Resumen

mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic es un artefacto de prueba (test artifact) publicado por el usuario huggingface-mic. No se trata de un modelo entrenado ni utilizable en producción, sino de una versión reducida ("slim fixture") del modelo MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7, pensada para validar contratos de integración con frameworks (principalmente Transformers) sin necesidad de descargar ni ejecutar los pesos completos.

El repositorio empaqueta pesos reducidos, uso ejecutable y expectativas de framework en un único lugar. La arquitectura declarada es DebertaV2ForSequenceClassification, con el mismo conjunto de nombres de tensores que el checkpoint real, pero con la configuración encogida a 2 capas ocultas. El resultado son 16.168.323 parámetros frente a los aproximadamente 278 millones del modelo base completo.

Su relevancia es puramente de ingeniería: sirve como fixture reproducible para probar pipelines de carga, tokenización y clasificación de secuencias (XNLI) en CI, manteniendo fidelidad estructural con el modelo original. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DebertaV2ForSequenceClassification (transformer encoder, config reducida a 2 capas ocultas) |
| Parametros totales | 16.168.323 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del tokenizador del modelo base; no declarada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponibles (el modelo base es multilingüe, pero esta ficha no lo declara) |
| Licencia | no disponible (el archivo LICENSE se copia byte a byte del modelo base, pero no se especifica el tipo) |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder tipo DeBERTa-v2 con cabeza de clasificación de secuencias (DebertaV2ForSequenceClassification). La configuración se ha reducido mediante la regla genérica de `sweep.py` del proyecto transformers-mic, fijando `num_hidden_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7, lo que permite validar rutas de carga y compatibilidad de estado sin disponer de los pesos completos.

No hay entrenamiento en el sentido habitual: el modelo está sobreajustado ("overfit") al paso de entrenamiento del contrato, con 30 pasos. Los pesos aleatorios fallaron la puerta de sensibilidad a la entrada (`attention_mask:all_ones` movía los logits solo 4.6e-05, por debajo del umbral de 0.001), por lo que se realizó un ajuste mínimo para superar dicha comprobación. Los archivos de procesador (`LICENSE`, `added_tokens.json`, `special_tokens_map.json`, `spm.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base, garantizando fidelidad de tokenización. La clave de fixture es `88084f4c39b5` y cubre todos los checkpoints cuyos archivos de procesador son idénticos y cuya config coincide tras el encogimiento.

## Capacidades

- Clasificación de secuencias (XNLI: inferencia de relación entre premisa e hipótesis) a nivel de contrato, no de calidad real.
- Carga compatible con Transformers como DebertaV2ForSequenceClassification.
- Tokenización multilingüe heredada del modelo base (spm.model copiado byte a byte), aunque esta ficha no declara idiomas.
- Ejecución forward, cálculo de pérdida y gradientes finitos en float32, bfloat16 y float16.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- No es un modelo utilizable: su propósito es servir de fixture de integración y pruebas de contrato.

## Casos de uso

- Pruebas de integración en CI: el fixture permite validar que un pipeline de Transformers carga correctamente un checkpoint DebertaV2ForSequenceClassification sin descargar los ~278M de parámetros del modelo real, reduciendo tiempo y ancho de banda en cada ejecución.
- Validación de contratos de framework: las expectativas en `integrations/transformers/expectations` permiten comprobar que las versiones de Transformers mantienen compatibilidad de API, nombres de tensores y comportamiento de carga.
- Pruebas de tokenización multilingüe: al copiar los archivos de procesador byte a byte del modelo base, sirve para verificar que el pipeline de tokenización (SentencePiece + tokenizer.json) se comporta igual que con el modelo original.
- Verificación de dtypes: útil para comprobar que rutas de carga en float16, bfloat16 y float32 no producen NaN ni inf en forward, pérdida o gradientes.
- Desarrollo de herramientas de inspección de modelos: permite probar utilidades que enumeran tensores, comparan configs o detectan checkpoints encogidos frente a originales.
- Reproducibilidad de fixtures: el archivo `build.json` registra fuentes fijadas, resultados de puertas y hashes de archivos, lo que permite reconstruir el fixture con `build_fixtures.py` y auditar su procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba sin entrenamiento real, por lo que cualquier métrica de calidad (MMLU, XNLI, etc.) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (16,2M de parámetros), aproximadamente 65 MB solo de pesos más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU para pruebas.
- Opciones de despliegue: Transformers (PyTorch) es la vía prevista según el contrato; no se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería muy inferior a la del modelo base, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic (este) | 16,2M | no disponible | Fixture de prueba (test-artifact) | no disponible | Hugging Face |
| MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 | ~278M | 512 tokens (estandar XNLI) | Clasificacion NLI multilingue real | MIT (segun modelo base original) | Hugging Face |
| mDeBERTa-v3-base (Microsoft) | ~86M (backbone) / ~278M con cabeza | 512 tokens | Backbone multilingue base | MIT | Hugging Face |

La comparación es asimétrica por diseño: el fixture no compite en calidad con el modelo base, solo replica su estructura para pruebas. Cualquier uso real de clasificación XNLI debería emplear el checkpoint original MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7.

## Limitaciones y advertencias

- No es un modelo utilizable: está etiquetado `test-artifact` y su model card indica explícitamente "not a usable model".
- Los pesos están sobreajustados a 30 pasos de entrenamiento del contrato; las predicciones no tienen valor semántico.
- Sesgos conocidos: no disponibles (no hay evaluación de sesgos al no ser un modelo entrenado).
- Riesgo de alucinación: no aplica en el sentido generativo, pero las salidas de clasificación son arbitrarias y no deben interpretarse.
- Limitaciones de contexto o idioma: no declaradas en esta ficha; la tokenización hereda la del modelo base, pero el comportamiento del encoder reducido no es representativo.
- Restricciones de licencia: la licencia no está declarada en la ficha; el archivo LICENSE se copia del modelo base, por lo que habría que consultar el original para uso comercial.
- Caveat para producción: no debe desplegarse en ningún pipeline real; su único uso legítimo es como fixture de pruebas e integración.
- El tamaño del repo (0,1 GB) y los 2350 descargas sugieren uso en CI, no en aplicaciones finales.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso en Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Explicación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic.html
- Repositorio de código: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
