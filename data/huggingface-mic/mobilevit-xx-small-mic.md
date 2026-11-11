# huggingface-mic/mobilevit-xx-small-mic

## Resumen

`mobilevit-xx-small-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` a partir del modelo `apple/mobilevit-xx-small`. No es un modelo entrenado para uso real: se trata de una versión "slim" del checkpoint original, pensada para validar contratos de integración y expectativas de framework en el ecosistema de pruebas de Hugging Face. El repositorio incluye pesos, uso ejecutable y manifiestos de contrato en un único lugar.

El modelo base `apple/mobilevit-xx-small` es una red de clasificación de imágenes MobileViT, una arquitectura híbrida que combina convoluciones con mecanismos de atención tipo transformer para obtener eficiencia en dispositivos móviles. La versión publicada aquí conserva la configuración `MobileViTForImageClassification` y los mismos nombres de tensores que el checkpoint original, con 1.276.136 parámetros totales.

Su relevancia es limitada a efectos prácticos: está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Resulta útil para desarrolladores que necesiten verificar pipelines de carga, serialización y compatibilidad de procesadores sin descargar el checkpoint completo, pero no debe emplearse en producción ni como sustituto del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileViT (híbrida convolución + atención), clase `MobileViTForImageClassification` |
| Parámetros totales | 1.276.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible; pesos guardados en float32, con forwards finitos verificados en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | apple/mobilevit-xx-small |
| Tamaño del repo | 0,0 GB (reportado por Hugging Face) |
| Descargas | 1.847 |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileViT, un diseño híbrido que intercala bloques convolucionales con bloques de atención tipo transformer para capturar dependencias globales manteniendo un coste computacional bajo. En este repositorio, la configuración corresponde a `MobileViTForImageClassification` con 1,3M de parámetros, por debajo del umbral de 20M bajo el cual el fixture se conserva completo en lugar de reducirse.

No se ha realizado entrenamiento adicional en este artefacto: los pesos son los del checkpoint original `apple/mobilevit-xx-small`, sin cambios, y pasaron el filtro de sensibilidad a la entrada (el más débil, `pixel_values:swap_channels`, con valor 0,552). Los ficheros del procesador (`.DS_Store`, `LICENSE`, `preprocessor_config.json`) se copiaron byte a byte desde el modelo base. El fixture se generó con `build_fixtures.py` del repositorio `transformers-mic`, y `build.json` registra fuentes fijadas, resultados de los filtros y hashes de ficheros.

## Capacidades

- Clasificación de imágenes mediante `MobileViTForImageClassification`.
- Carga compatible con Transformers usando los mismos nombres de tensores que el checkpoint original.
- Ejecución verificada en float32, bfloat16 y float16 (forward, pérdida y gradientes finitos).
- Incluye manifiesto de contrato (`integration.json`), guía de uso (`integrations/transformers/usage.md`) y expectativas de framework (`integrations/transformers/expectations`).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo de visión.
- No dispone de modo thinking, visión generativa, audio ni razonamiento multi-paso.

## Casos de uso

- Validación de pipelines de carga en Transformers: sirve para comprobar que el cargador de `MobileViTForImageClassification` resuelve correctamente configuración, procesador y pesos sin descargar el checkpoint completo de `apple/mobilevit-xx-small`.
- Pruebas de integración continua: al ocupar un espacio mínimo y tener pesos en safetensors, se puede incluir en suites de test que verifiquen forwards, backward y serialización en float32, bfloat16 y float16.
- Verificación de contratos de framework: el manifiesto `integration.json` y el directorio de expectativas permiten comprobar que una versión de Transformers cumple el comportamiento esperado para esta arquitectura.
- Desarrollo de herramientas de inspección de modelos: útil para probar utilidades que leen nombres de tensores, dtypes y configuraciones sin necesidad de pesos grandes.
- Reproducción de fixtures: el script `build_fixtures.py` y `build.json` permiten regenerar el artefacto y auditar hashes y fuentes fijadas.
- Docencia y demostraciones: sirve para mostrar el flujo de carga de un modelo de clasificación de imágenes en Transformers con un coste de descarga y cómputo despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1,3M parámetros); en la práctica, unos pocos MB de pesos más el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar con safetensors); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/mobilevit-xx-small-mic | 1.276.136 | Clasificación de imágenes (fixture) | no aplica | no disponible | Hugging Face (artefacto de prueba) |
| apple/mobilevit-xx-small | no disponible en la información | Clasificación de imágenes | no aplica | no disponible | Hugging Face (modelo base) |
| Otros MobileViT de Apple (p. ej. variantes small/x-small) | no disponible en la información | Clasificación de imágenes | no aplica | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo utilizable en producción; así lo declara explícitamente la model card.
- Los pesos son los del checkpoint original sin reentrenar, pero el propósito del repositorio es la validación de contratos, no la inferencia real.
- No se especifica licencia, lo que impide determinar condiciones de uso comercial; hay que remitirse al modelo base `apple/mobilevit-xx-small`.
- No se documentan idiomas soportados ni sesgos conocidos; al ser un modelo de visión, las consideraciones de sesgo dependerían del dataset de entrenamiento original, no disponible aquí.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas si se usa fuera de su dominio previsto.
- El tamaño del repo reportado (0,0 GB) y la ausencia de pipeline declarada sugieren que la metadata de Hugging Face no está completamente poblada.
- No debe confundirse con un checkpoint listo para despliegue: para uso real, emplear `apple/mobilevit-xx-small` o una variante entrenada específicamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/mobilevit-xx-small-mic
- Modelo base: https://huggingface.co/apple/mobilevit-xx-small
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación sobre el proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mobilevit-xx-small-mic.html
- Manifiesto de contrato (en el repo): `integration.json`
- Uso en Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (en el repo): `integrations/transformers/expectations`
- Procedencia del fixture (en el repo): `build.json`
