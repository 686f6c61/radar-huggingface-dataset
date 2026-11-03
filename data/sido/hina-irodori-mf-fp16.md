# Sido/hina-irodori-mf-fp16

## Resumen

Irodori TTS v4.1 Small MF es un modelo de síntesis de voz (text-to-speech) para japonés, desarrollado originalmente por Aratako y distribuido aquí por el usuario Sido como una conversión a FP16 en formato ONNX. El repositorio no contiene un modelo nuevo ni reentrenado: es una exportación de cinco grafos ONNX convertidos desde la versión FP32 para navegador de `raratu/Onsei-Irodori-v4.1-Small-MF`, que a su vez deriva del modelo original `Aratako/Irodori-TTS-v4.1-Small-MF`. La conversión reduce el peso de los ficheros de 3.114.496.971 bytes (FP32) a 1.557.974.593 bytes (FP16), manteniendo entradas y salidas públicas en FP32 para el worker de navegador existente.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue, no de un modelo con benchmarks propios. Su interés práctico está en la reducción de tamaño para inferencia en navegador mediante WebGPU/ONNX Runtime, con la advertencia explícita de que el DiT y el decodificador convertidos a FP16 no se usan en el despliegue real del navegador porque produjeron habla incorrecta en pruebas aisladas con WebGPU.

La arquitectura subyacente combina un text encoder basado en ModernBERT-ja, un módulo de duración, un contexto KV, un paso DiT y un decodificador DACVAE (variante Semantic-DACVAE adaptada al japonés). El contexto, el número de parámetros y los datos de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS con text encoder (ModernBERT-ja), módulo de duración, context KV, paso DiT y decodificador DACVAE (Semantic-DACVAE adaptado a japonés) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (conversión de pesos y valores internos del grafo); entradas y salidas públicas en FP32 |
| Idiomas soportados | japonés (ja) |
| Licencia | other (componentes: MIT para Irodori-TTS y ModernBERT-ja; MIT para adaptaciones japonesas de Semantic-DACVAE; Apache-2.0 para Meta DACVAE; MIT para Descript DAC) |
| Formato de pesos | ONNX (5 ficheros) |

## Arquitectura y entrenamiento

El modelo es una conversión de precisión, no un entrenamiento. Los cinco grafos ONNX se obtuvieron desde la exportación FP32 para navegador fijada en el commit `a7542a4f1ea0fd8d44ad82d7c0fd7bb8b81ed641` de `raratu/Onsei-Irodori-v4.1-Small-MF`, derivada a su vez de `Aratako/Irodori-TTS-v4.1-Small-MF` (commit `ccc78f5d480b6e51b69b2d5042a14c4da04fea6e`). La conversión transforma los pesos en coma flotante y los valores internos del grafo a FP16, dejando las entradas y salidas públicas en FP32 para compatibilidad con el worker de navegador existente. El script de conversión está en el árbol de fuentes del navegador `mazariba/hina5`, en `browser/scripts/convert-irodori-mf-fp16.py`, y verifica los hashes de origen, valida la estructura ONNX y carga cada grafo convertido en ONNX Runtime.

El despliegue real en navegador usa precisión mixta: `text_encoder`, `duration` y `context_kv` en FP16 desde este repositorio, y `dit_step` y `dacvae_decode` en FP32 originales del repositorio de raratu. Ese conjunto suma 2.324.689.724 bytes de descargas, un 25,4 % menos que todo FP32. Los grafos FP16 de DiT y decodificador se incluyen por reproducibilidad pero no se emplean en el navegador: pruebas aisladas con WebGPU produjeron habla incorrecta, aunque la inferencia en CPU dio resultados numéricos cercanos. No hay datos de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto en japonés (pipeline `text-to-speech`).
- Generación de audio mediante decodificador DACVAE a partir de representaciones latentes producidas por el paso DiT.
- Control de duración mediante un módulo específico (`duration`).
- Ejecución en navegador mediante ONNX Runtime y WebGPU, con precisión mixta.
- Inferencia en CPU con resultados numéricos cercanos a FP32 según las pruebas del autor.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: el modelo se ejecuta en el navegador con ONNX Runtime y WebGPU, usando los grafos FP16 de `text_encoder`, `duration` y `context_kv` junto con DiT y decodificador FP32, lo que reduce la descarga a 2.324.689.724 bytes.
- Lectura de contenido en japonés en el cliente: integrable en lectores de artículos o interfaces de accesibilidad que necesiten locución en japonés sin enviar texto a un servidor.
- Prototipado de interfaces de voz: permite probar flujos TTS en local con un coste de almacenamiento menor que la variante FP32 (1.557.974.593 bytes frente a 3.114.496.971 bytes para los cinco ficheros convertidos).
- Evaluación de precisión mixta en pipelines ONNX: útil para comparar calidad numérica y perceptual entre FP16 y FP32 en entornos de navegador, con la salvedad de que el DiT y el decodificador FP16 no funcionaron correctamente en WebGPU.
- Despliegue con restricciones de almacenamiento: la reducción de tamaño facilita incluir el modelo en paquetes de aplicación o cachés de navegador con cuotas limitadas.
- Investigación sobre TTS japonés en el borde: sirve como base reproducible para experimentar con cuantización y ejecución en dispositivos de cliente, dado que el script de conversión y las comprobaciones están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta tamaños de fichero y una comparación cualitativa de pruebas en WebGPU (habla incorrecta con DiT y decodificador FP16) y en CPU (resultados numéricos cercanos a FP32).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El consumo real puede diferir del tamaño de descarga porque el motor crea tensores intermedios y copias en GPU.
- GPU recomendadas: no disponible. El despliegue previsto es en navegador con WebGPU; no se especifican modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el autor indica que otros dispositivos y frases requieren pruebas.
- Opciones de despliegue: ONNX Runtime en navegador (WebGPU o CPU), con precisión mixta (FP16 para `text_encoder`, `duration` y `context_kv`; FP32 para `dit_step` y `dacvae_decode`).
- Latencia y throughput: no disponibles. La model card advierte explícitamente que FP16 es una variante opcional de menor almacenamiento y no una garantía de habla más rápida.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Tamaño | Idioma | Licencia |
|---|---|---|---|---|---|
| Sido/hina-irodori-mf-fp16 | ONNX (5 ficheros) | FP16 en pesos internos, FP32 en E/S | 1.557.974.593 bytes (5 ficheros) | ja | other |
| raratu/Onsei-Irodori-v4.1-Small-MF | ONNX para navegador | FP32 | 3.114.496.971 bytes | ja | other |
| Aratako/Irodori-TTS-v4.1-Small-MF | no disponible | no disponible | no disponible | ja | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El DiT y el decodificador convertidos a FP16 produjeron habla incorrecta en pruebas aisladas con WebGPU; por eso el despliegue en navegador usa esos dos componentes en FP32.
- La calidad numérica y perceptual debe verificarse contra la fuente FP32; la conversión no garantiza mejoras de velocidad.
- Solo se documenta soporte de japonés; no hay información sobre otros idiomas.
- No hay datos de sesgos, tasas de alucinación ni evaluación de robustez del modelo.
- La licencia es "other" y los componentes tienen licencias distintas (MIT, Apache-2.0); es necesario revisar `LICENSES/` y `THIRD_PARTY_NOTICES.md` antes de un uso comercial.
- Debe respetarse el requisito del modelo original sobre consentimiento para clonación de voz y suplantación engañosa.
- El repositorio no incluye reentrenamiento ni dataset de clonación de voz; es únicamente una conversión de precisión.
- No se especifican requisitos de VRAM, GPU compatibles ni latencia, y el autor señala que quedan dispositivos y frases por probar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sido/hina-irodori-mf-fp16
- Fuente ONNX FP32 para navegador: https://huggingface.co/raratu/Onsei-Irodori-v4.1-Small-MF/tree/a7542a4f1ea0fd8d44ad82d7c0fd7bb8b81ed641
- Modelo original: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF/tree/ccc78f5d480b6e51b69b2d5042a14c4da04fea6e
- Código del navegador con el script de conversión: https://github.com/mazariba/hina5
